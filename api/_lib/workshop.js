/* Pendaftaran workshop "Menuju Imtihan: Belajar Efektif dengan AI" (halaman /event).
   - Pendaftar wajib login Google, jadi setiap pendaftar punya akun Talqeeh (akun gratis dibuat otomatis).
   - Bayar Rupiah lewat Mayar dan lunas otomatis. Bayar Pound Mesir dicatat menunggu, lalu ditandai lunas oleh admin.
   - Tiket workshop TIDAK mengaktifkan Library atau AI Partner: tabelnya terpisah dari payment_checkouts.
   - Kuota: kursi dipegang pendaftar lunas, dan pendaftar belum bayar selama HOLD_MS. Kalau penuh, pendaftaran ditutup.
   Tabel: migrations/event_registrations.sql. Selama tabel belum ada, semua fungsi mengembalikan "belum siap". */
import { sbConfig, sbHeaders } from './member.js';
import { mayarRequest, isPaidRequest, mayarConfigured, MayarError } from './payments.js';

export const WORKSHOP = {
  slug: 'menuju-imtihan',
  name: 'Menuju Imtihan: Belajar Efektif dengan AI',
  quota: 50,
  price: { IDR: 120000, EGP: 360 },
  // Pendaftaran ditutup saat acara mulai: Senin 7 Desember 2026, 14.00 waktu Kairo (UTC+2).
  closesAt: '2026-12-07T12:00:00Z',
};

const HOLD_MS = 24 * 3600 * 1000;         // lama kursi dipegang pendaftar yang belum bayar
const LINK_TTL_MS = 24 * 3600 * 1000;     // masa berlaku tautan bayar Mayar
const STATUS_CHECK_GAP_MS = 8000;
const FIELDS = 'id,event_slug,auth_user_id,member_code,email,name,whatsapp,currency,amount,status,mayar_id,link,link_at,checked_at,held_at,paid_at,paid_via,note,created_at';
const PAY_TITLE = 'Talqeeh Workshop Menuju Imtihan';

const sb = () => {
  const { url, key } = sbConfig();
  return { url, h: (extra) => sbHeaders(key, extra) };
};

// null = tabel belum ada / server belum siap; array = hasil.
async function select(query) {
  const { url, h } = sb();
  if (!url) return null;
  const r = await fetch(`${url}/rest/v1/event_registrations?${query}`, { headers: h() }).catch(() => null);
  if (!r || !r.ok) return null;
  return r.json().catch(() => null);
}

async function patch(id, body, extraFilter = '') {
  const { url, h } = sb();
  const r = await fetch(`${url}/rest/v1/event_registrations?id=eq.${encodeURIComponent(id)}${extraFilter}&select=${FIELDS}`, {
    method: 'PATCH', headers: h({ Prefer: 'return=representation' }), body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`event_registrations patch ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

const holding = (row, now = Date.now()) =>
  row.status === 'paid' || (row.status === 'pending' && now - Date.parse(row.held_at || row.created_at) < HOLD_MS);

// Kursi terpakai sekarang (tidak menghitung baris exceptId). null = tabel belum siap.
async function seatsTaken(exceptId = null) {
  const rows = await select(`event_slug=eq.${WORKSHOP.slug}&status=in.(pending,paid)&select=id,status,held_at,created_at&limit=1000`);
  if (!rows) return null;
  return rows.filter(r => r.id !== exceptId && holding(r)).length;
}

export const workshopClosed = (now = Date.now()) => now >= Date.parse(WORKSHOP.closesAt);

const publicRow = (row) => row && ({
  id: row.id, status: row.status, currency: row.currency, amount: row.amount, name: row.name, whatsapp: row.whatsapp,
  link: row.status === 'pending' && row.currency === 'IDR' && row.link && Date.now() - Date.parse(row.link_at || row.created_at) < LINK_TTL_MS ? row.link : null,
  seatHeld: holding(row), paidAt: row.paid_at || null,
});

export async function getMyRegistration(authUserId) {
  const rows = await select(`event_slug=eq.${WORKSHOP.slug}&auth_user_id=eq.${encodeURIComponent(authUserId)}&select=${FIELDS}&limit=1`);
  return rows ? rows[0] || null : null;
}

// Info publik untuk halaman event: dibuka atau tidak, dan sisa kursi.
export async function workshopInfo() {
  const taken = await seatsTaken();
  if (taken == null) return { ready: false };
  const left = Math.max(0, WORKSHOP.quota - taken);
  return { ready: true, closed: workshopClosed(), full: left === 0, left, quota: WORKSHOP.quota, mayar: mayarConfigured() };
}

const cleanName = (v) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, 80);
const cleanWa = (v) => String(v || '').replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '').slice(0, 18);

async function createPaymentLink(row, appOrigin) {
  const request = {
    name: PAY_TITLE,
    amount: row.amount,
    email: row.email,
    description: `${WORKSHOP.name} untuk ${row.email}`,
    expiredAt: new Date(Date.now() + LINK_TTL_MS).toISOString(),
    extraData: { workshopId: row.id, event: WORKSHOP.slug },
  };
  const redirectUrl = appOrigin ? `${appOrigin}/event?reg=${row.id}` : null;
  let data;
  try {
    data = await mayarRequest('/payments/create', { method: 'POST', body: redirectUrl ? { ...request, redirectUrl } : request });
  } catch (err) {
    if (!(redirectUrl && err instanceof MayarError && err.status === 400)) throw err;
    data = await mayarRequest('/payments/create', { method: 'POST', body: request });
  }
  if (!data?.id || !data?.link) throw new Error('Mayar tidak mengembalikan link pembayaran');
  const [saved] = await patch(row.id, { mayar_id: data.id, link: data.link, link_at: new Date().toISOString() });
  return saved;
}

/* Daftar atau perbarui pendaftaran. Kembalian { ok, status, registration }.
   status: registered | paid | invalid | closed | full | not_ready | payment_unavailable */
export async function registerWorkshop({ user, member, name, whatsapp, currency, appOrigin }) {
  const cur = currency === 'EGP' ? 'EGP' : currency === 'IDR' ? 'IDR' : null;
  const nm = cleanName(name), wa = cleanWa(whatsapp);
  if (!cur || nm.length < 3 || wa.replace(/\D/g, '').length < 8) return { ok: false, status: 'invalid' };

  let row = await getMyRegistration(user.id);
  if (row === null && (await seatsTaken()) == null) return { ok: false, status: 'not_ready' };
  if (row?.status === 'paid') return { ok: true, status: 'paid', registration: publicRow(row) };
  if (workshopClosed()) return { ok: false, status: 'closed' };

  // Kursi: pendaftar baru, atau pendaftar lama yang pegangannya sudah lewat, harus masih kebagian.
  if (!row || !holding(row)) {
    const taken = await seatsTaken(row?.id || null);
    if (taken == null) return { ok: false, status: 'not_ready' };
    if (taken >= WORKSHOP.quota) return { ok: false, status: 'full' };
  }

  const fields = { name: nm, whatsapp: wa, currency: cur, amount: WORKSHOP.price[cur], member_code: member?.code || row?.member_code || null };
  if (row) {
    const reset = row.currency !== cur || row.status === 'cancelled' || !holding(row);
    [row] = await patch(row.id, {
      ...fields, status: 'pending',
      ...(reset ? { held_at: new Date().toISOString(), mayar_id: null, link: null, link_at: null } : {}),
    });
  } else {
    const { url, h } = sb();
    const r = await fetch(`${url}/rest/v1/event_registrations?select=${FIELDS}`, {
      method: 'POST', headers: h({ Prefer: 'return=representation' }),
      body: JSON.stringify({ event_slug: WORKSHOP.slug, auth_user_id: user.id, email: user.email, ...fields }),
    });
    if (r.status === 409) row = await getMyRegistration(user.id);       // permintaan paralel dari akun yang sama
    else if (!r.ok) throw new Error(`event_registrations insert ${r.status}: ${(await r.text()).slice(0, 200)}`);
    else row = (await r.json())[0];
    if (!row) return { ok: false, status: 'not_ready' };
  }

  if (cur === 'IDR') {
    const fresh = row.link && Date.now() - Date.parse(row.link_at || row.created_at) < LINK_TTL_MS;
    if (!fresh) {
      if (!mayarConfigured()) return { ok: true, status: 'payment_unavailable', registration: publicRow(row) };
      row = await createPaymentLink(row, appOrigin);
    }
  }
  return { ok: true, status: 'registered', registration: publicRow(row) };
}

async function markPaid(row, via) {
  const claimed = await patch(row.id, { status: 'paid', paid_at: new Date().toISOString(), paid_via: via }, '&status=eq.pending');
  return claimed[0] || null;
}

// Dipanggil halaman event saat peserta kembali dari Mayar: tanya Mayar apakah sudah dibayar.
export async function refreshRegistration(row) {
  if (!row || row.status !== 'pending' || row.currency !== 'IDR' || !row.mayar_id) return row;
  if (row.checked_at && Date.now() - Date.parse(row.checked_at) < STATUS_CHECK_GAP_MS) return row;
  await patch(row.id, { checked_at: new Date().toISOString() });
  const data = await mayarRequest(`/payments/${encodeURIComponent(row.mayar_id)}`);
  if (!isPaidRequest(data)) return row;
  return (await markPaid(row, 'status_check')) || { ...row, status: 'paid' };
}

export const publicRegistration = publicRow;

/* Webhook Mayar: cocokkan payment.received dengan pendaftaran workshop. Kembalian null kalau bukan pembayaran
   workshop (atau tabel belum ada), supaya alur pembayaran lain tidak terganggu. */
const ID_PATTERN = /^[A-Za-z0-9_-]{6,80}$/;
export async function matchWorkshopWebhook(data) {
  const ids = [...new Set([
    data.productId, data.paymentLinkId, data.paymentRequestId, data.paymentLinkTransactionId,
    data.transactionId, data.id, data.extraData?.workshopId,
  ].filter(v => typeof v === 'string' && ID_PATTERN.test(v)))];
  if (!ids.length) return null;
  const list = ids.map(v => `"${v}"`).join(',');
  const uuids = ids.filter(v => /^[0-9a-f-]{36}$/i.test(v)).map(v => `"${v}"`).join(',');
  const filter = [`mayar_id.in.(${list})`, uuids && `id.in.(${uuids})`].filter(Boolean).join(',');
  const rows = await select(`event_slug=eq.${WORKSHOP.slug}&or=(${filter})&select=${FIELDS}&limit=1`);
  const row = rows && rows[0];
  if (!row || row.currency !== 'IDR') return null;
  if (Number.isFinite(data.amount) && data.amount < row.amount) return { handledAs: 'workshop_amount_mismatch', memberCode: row.member_code };
  if (row.status === 'pending') await markPaid(row, 'webhook');
  return { handledAs: 'workshop', memberCode: row.member_code };
}

/* ── Admin ── */

export async function listRegistrations() {
  const rows = await select(`event_slug=eq.${WORKSHOP.slug}&select=${FIELDS}&order=created_at.asc&limit=1000`);
  if (!rows) return { ready: false, rows: [], summary: null };
  const paid = rows.filter(r => r.status === 'paid');
  return {
    ready: true,
    rows: rows.map(r => ({ ...r, seat_held: holding(r) })),
    summary: {
      quota: WORKSHOP.quota,
      paid: paid.length,
      holding: rows.filter(r => r.status === 'pending' && holding(r)).length,
      pending: rows.filter(r => r.status === 'pending').length,
      cancelled: rows.filter(r => r.status === 'cancelled').length,
      idr: paid.filter(r => r.currency === 'IDR').reduce((a, r) => a + r.amount, 0),
      egp: paid.filter(r => r.currency === 'EGP').reduce((a, r) => a + r.amount, 0),
    },
  };
}

// Admin menandai lunas (mis. pembayaran Pound Mesir), mengembalikan ke menunggu, atau membatalkan.
export async function setRegistrationStatus(id, status, note) {
  if (!/^[0-9a-f-]{36}$/i.test(String(id || '')) || !['paid', 'pending', 'cancelled'].includes(status)) return { ok: false, error: 'Permintaan tidak valid' };
  const rows = await select(`id=eq.${id}&event_slug=eq.${WORKSHOP.slug}&select=${FIELDS}&limit=1`);
  if (!rows) return { ok: false, error: 'Tabel pendaftaran belum ada. Jalankan migrations/event_registrations.sql.' };
  const row = rows[0];
  if (!row) return { ok: false, error: 'Pendaftar tidak ditemukan' };
  if (status === 'paid' && row.status !== 'paid') {
    const taken = await seatsTaken(row.id);
    if (taken != null && taken >= WORKSHOP.quota) return { ok: false, error: `Kuota ${WORKSHOP.quota} kursi sudah penuh.` };
  }
  const now = new Date().toISOString();
  const body = status === 'paid'
    ? { status, paid_at: row.paid_at || now, paid_via: row.paid_via || 'admin' }
    : status === 'pending' ? { status, paid_at: null, paid_via: null, held_at: now }
      : { status, paid_at: null, paid_via: null };
  const [saved] = await patch(row.id, { ...body, ...(typeof note === 'string' ? { note: note.trim().slice(0, 200) } : {}) });
  return { ok: true, row: { ...saved, seat_held: holding(saved) } };
}
