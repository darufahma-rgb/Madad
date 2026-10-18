// Pembayaran lewat Mayar Headless API V2 — tagihan dibuat per pembeli, tanpa produk di dashboard Mayar.
// Alur: createCheckout → pembeli bayar di link Mayar → webhook payment.received (atau cek status dari
// halaman Gabung) → fulfillCheckout mengaktifkan Library dan/atau menambah 30 hari AI Partner.
import crypto from 'crypto';
import { sbConfig, sbHeaders, newMemberCode } from './member.js';
import { readSettings } from './settings.js';
import { getLiveEvents } from './events.js';

// Samakan dengan LIBRARY_PRICE di src/layout.jsx.
export const LIBRARY_PRICE_IDR = 63000;
export const AI_PERIOD_DAYS = 30;
export const AI_PRODUCT_ID = 'talqeeh-ai-30hari';
export const CHECKOUT_PLANS = ['library', 'library_ai', 'ai', 'imtihan', 'rombongan'];
// Paket Imtihan: Library selamanya + AI Partner 1 termin (120 hari) dengan satu harga hemat.
// Samakan dengan IMTIHAN_PRICE_IDR di src/layout.jsx.
export const IMTIHAN_PRICE_IDR = 199000;
export const IMTIHAN_AI_DAYS = 120;
/* Event promo Paket Imtihan & Paket Rombongan diatur di Admin → Settings (api/_lib/events.js). Di luar event,
   harga normal berlaku otomatis. */
export const imtihanPrice = async (now = Date.now()) => (await getLiveEvents(now)).imtihan?.price || IMTIHAN_PRICE_IDR;

const LIFETIME_EXPIRY = '2099-12-31';
const CHECKOUT_TTL_MS = 24 * 3600 * 1000;
const REUSE_WINDOW_MS = 20 * 3600 * 1000;   // tagihan yang masih pending dipakai ulang, tidak dibuat baru
const STATUS_CHECK_GAP_MS = 8000;           // cek status ke Mayar paling cepat tiap 8 detik per tagihan
const AI_PRICE_MIN = 5000;
const AI_PRICE_MAX = 2000000;

const PLAN_TITLES = {
  library:    'Talqeeh Library',
  library_ai: `Talqeeh Library + AI Partner ${AI_PERIOD_DAYS} hari`,
  ai:         `Talqeeh AI Partner ${AI_PERIOD_DAYS} hari`,
  imtihan:    `Talqeeh Paket Imtihan (Library + AI Partner ${IMTIHAN_AI_DAYS} hari)`,
};
const rombonganTitle = (seats) => `Talqeeh Paket Rombongan ${seats} orang (Paket Imtihan)`;
const planTitle = (plan, seats) => (plan === 'rombongan' ? rombonganTitle(seats) : PLAN_TITLES[plan]);

/* ── Mayar API ── */

export const mayarConfigured = () => !!(process.env.MAYAR_API_KEY || '').trim();

const mayarBase = () => (/^(1|true|yes)$/i.test(process.env.MAYAR_SANDBOX || '')
  ? 'https://api.mayar.io/hl/v2'
  : 'https://api.mayar.id/hl/v2');

export class MayarError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

// Body `statusCode` yang menentukan hasil, walau status HTTP-nya berbeda (docs Mayar V2).
async function mayarRequest(path, { method = 'GET', body } = {}) {
  const key = (process.env.MAYAR_API_KEY || '').trim();
  if (!key) throw new MayarError('MAYAR_API_KEY belum diisi', 0);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const r = await fetch(`${mayarBase()}${path}`, {
      method,
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const json = await r.json().catch(() => null);
    const status = Number(json?.statusCode) || r.status;
    if (!r.ok || status >= 400) {
      const msg = json?.messages || json?.message || `HTTP ${r.status}`;
      throw new MayarError(`Mayar ${path}: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`.slice(0, 300), status);
    }
    return json?.data ?? null;
  } finally {
    clearTimeout(timer);
  }
}

// Nilai status "lunas" belum terdokumentasi lengkap; contoh docs hanya "unpaid". Terima beberapa ejaan umum.
const PAID_WORDS = new Set(['paid', 'success', 'succeeded', 'settled', 'settlement', 'completed']);
const isPaidWord = (v) => v === true || PAID_WORDS.has(String(v || '').toLowerCase());
export const isPaidRequest = (d) =>
  !!d && (isPaidWord(d.status) || (Array.isArray(d.transactions) && d.transactions.some(t => isPaidWord(t?.status))));

/* ── Harga ── */

export const parseAiPrice = (v) => {
  const n = parseInt(String(v ?? '').replace(/\D/g, ''), 10);
  return Number.isFinite(n) && n >= AI_PRICE_MIN && n <= AI_PRICE_MAX ? n : null;
};

export async function getPrices() {
  const { aiPriceMonthly } = await readSettings(['aiPriceMonthly']);
  return { library: LIBRARY_PRICE_IDR, ai: parseAiPrice(aiPriceMonthly) };
}

// imtihanAmount: harga khusus Paket Imtihan (penawaran 48 jam, api/_lib/offer.js); dipakai hanya kalau lebih murah.
// rombongan: { seats, price } dari event Paket Rombongan yang sedang berlangsung.
const splitAmount = async (plan, prices, imtihanAmount, rombongan) => {
  if (plan === 'rombongan') return { library_amount: prices.library * rombongan.seats, ai_amount: rombongan.price - prices.library * rombongan.seats };
  if (plan === 'imtihan') return { library_amount: prices.library, ai_amount: Math.min(await imtihanPrice(), imtihanAmount || Infinity) - prices.library };
  return {
    library_amount: plan === 'ai' ? 0 : prices.library,
    ai_amount: plan === 'library' ? 0 : prices.ai,
  };
};

// Ukuran rombongan yang dipilih pembeli, hanya selama event Paket Rombongan berlangsung.
export async function rombonganSize(seats) {
  const ev = (await getLiveEvents()).rombongan;
  return ev ? ev.sizes.find(s => s.seats === Number(seats)) || null : null;
}

/* ── Supabase ── */

const sb = () => {
  const { url, key } = sbConfig();
  return { url, h: (extra) => sbHeaders(key, extra) };
};

const CHECKOUT_FIELDS = 'id,mayar_id,transaction_id,link,plan,amount,email,name,auth_user_id,member_code,status,checked_at,created_at';

async function selectCheckouts(query) {
  const { url, h } = sb();
  const r = await fetch(`${url}/rest/v1/payment_checkouts?${query}&select=${CHECKOUT_FIELDS}`, { headers: h() });
  if (!r.ok) throw new Error(`payment_checkouts ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

async function patchCheckout(id, patch, extraFilter = '') {
  const { url, h } = sb();
  const r = await fetch(`${url}/rest/v1/payment_checkouts?id=eq.${encodeURIComponent(id)}${extraFilter}&select=${CHECKOUT_FIELDS}`, {
    method: 'PATCH',
    headers: h({ Prefer: 'return=representation' }),
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error(`payment_checkouts ${r.status}`);
  return r.json();
}

export async function getOwnedCheckout(id, authUserId) {
  if (!/^[0-9a-f-]{36}$/i.test(id || '')) return null;
  const rows = await selectCheckouts(`id=eq.${id}&auth_user_id=eq.${encodeURIComponent(authUserId)}&limit=1`);
  return rows[0] || null;
}

/* ── Buat tagihan ── */

// Member yang sudah Library tidak boleh beli Library lagi; AI saja hanya untuk member Library.
// Member bertipe 'trial' (akses sementara dari admin) belum membeli apa pun → boleh membeli seperti akun gratis.
export function checkoutBlockReason(plan, member) {
  // Rombongan: pembeli yang sudah Library tetap boleh (bagiannya menambah 120 hari AI Partner).
  if (plan === 'rombongan') return null;
  const paidLibrary = member && member.status === 'active' && member.tier !== 'free' && member.member_type !== 'trial';
  if (plan === 'ai') return paidLibrary ? null : 'needs_library';
  return paidLibrary ? 'already_library' : null;
}

export async function createCheckout({ user, member, plan, appOrigin, imtihanAmount, seats }) {
  const prices = await getPrices();
  // Paket Imtihan & Rombongan berharga tetap, jadi tidak bergantung pada harga AI bulanan di Settings.
  if (!['library', 'imtihan', 'rombongan'].includes(plan) && !prices.ai) return { ok: false, status: 'ai_price_unset' };
  const rombongan = plan === 'rombongan' ? await rombonganSize(seats) : null;
  if (plan === 'rombongan' && !rombongan) return { ok: false, status: 'rombongan_closed' };
  const parts = await splitAmount(plan, prices, imtihanAmount, rombongan);
  const amount = parts.library_amount + parts.ai_amount;

  // Pembeli yang menekan "Bayar" berkali-kali dapat link yang sama.
  const since = new Date(Date.now() - REUSE_WINDOW_MS).toISOString();
  const pending = await selectCheckouts(
    `auth_user_id=eq.${encodeURIComponent(user.id)}&plan=eq.${plan}&amount=eq.${amount}&status=eq.pending&created_at=gte.${since}&order=created_at.desc&limit=1`
  );
  if (pending[0]?.link) return { ok: true, checkout: pending[0], reused: true };

  const { url, h } = sb();
  const name = (member?.name || user.name || user.email.split('@')[0]).slice(0, 120);
  const created = await fetch(`${url}/rest/v1/payment_checkouts?select=${CHECKOUT_FIELDS}`, {
    method: 'POST',
    headers: h({ Prefer: 'return=representation' }),
    body: JSON.stringify({
      plan, amount, ...parts, ...(rombongan ? { seats: rombongan.seats } : {}),
      email: user.email, name, auth_user_id: user.id, member_code: member?.code || null,
    }),
  });
  if (!created.ok) throw new Error(`payment_checkouts insert ${created.status}: ${(await created.text()).slice(0, 200)}`);
  const row = (await created.json())[0];

  const title = planTitle(plan, rombongan?.seats);
  const request = {
    name: title,
    amount,
    email: user.email,
    description: `${title} untuk ${user.email}`,
    expiredAt: new Date(Date.now() + CHECKOUT_TTL_MS).toISOString(),
    extraData: { checkoutId: row.id, plan },
  };
  const redirectUrl = appOrigin ? `${appOrigin}/?checkout=${row.id}` : null;

  let data;
  try {
    data = await mayarRequest('/payments/create', { method: 'POST', body: redirectUrl ? { ...request, redirectUrl } : request });
  } catch (err) {
    // Docs: redirectUrl bisa ditolak kalau tidak didukung — coba sekali lagi tanpanya.
    if (!(redirectUrl && err instanceof MayarError && err.status === 400)) throw err;
    data = await mayarRequest('/payments/create', { method: 'POST', body: request });
  }
  if (!data?.id || !data?.link) throw new Error('Mayar tidak mengembalikan link pembayaran');

  const [saved] = await patchCheckout(row.id, { mayar_id: data.id, transaction_id: data.transactionId || null, link: data.link });
  return { ok: true, checkout: saved };
}

/* ── Aktivasi ── */

async function findMember({ authUserId, email }) {
  const { url, h } = sb();
  const lookup = async (filter) => {
    for (const fields of ['code,status,tier,email,member_type', 'code,status,tier,email', 'code,status,email']) {
      const r = await fetch(`${url}/rest/v1/members?${filter}&select=${fields}&limit=1`, { headers: h() });
      if (r.status === 400) continue; // kolom tier belum ada (migrasi free_tier belum dijalankan)
      const rows = await r.json();
      return Array.isArray(rows) ? rows[0] || null : null;
    }
    return null;
  };
  if (authUserId) {
    const byId = await lookup(`auth_user_id=eq.${encodeURIComponent(authUserId)}`);
    if (byId) return byId;
  }
  return email ? lookup(`email=eq.${encodeURIComponent(email)}`) : null;
}

// Library selamanya untuk pembeli: akun gratis/nonaktif dinaikkan, atau dibuat baru kalau belum ada.
export async function activateLibrary({ authUserId, email, name, mobile, note }) {
  const { url, h } = sb();
  const existing = await findMember({ authUserId, email });
  if (existing) {
    const isFree = existing.tier === 'free';
    const isTrial = existing.member_type === 'trial';
    if (existing.status !== 'active' || isFree || isTrial) {
      const r = await fetch(`${url}/rest/v1/members?code=eq.${encodeURIComponent(existing.code)}`, {
        method: 'PATCH',
        headers: h({ Prefer: 'return=minimal' }),
        body: JSON.stringify({
          status: 'active', expires_at: LIFETIME_EXPIRY,
          ...(isFree ? { tier: 'library', notes: `Upgrade dari akun gratis · ${note}`.slice(0, 300) } : {}),
          // Trial yang membayar menjadi member berbayar biasa: akses selamanya, jatah trial tidak berlaku lagi.
          ...(isTrial ? { tier: 'library', member_type: 'berbayar', notes: `Upgrade dari trial · ${note}`.slice(0, 300) } : {}),
        }),
      });
      if (!r.ok) throw new Error(`Gagal mengaktifkan member (${r.status})`);
    }
    return existing.code;
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = newMemberCode();
    const r = await fetch(`${url}/rest/v1/members`, {
      method: 'POST',
      headers: h({ Prefer: 'return=minimal' }),
      body: JSON.stringify({
        code,
        name:       (name || email.split('@')[0]).slice(0, 120),
        whatsapp:   mobile || '',
        duration:   36500,
        status:     'active',
        expires_at: LIFETIME_EXPIRY,
        email,
        ...(authUserId ? { auth_user_id: authUserId } : {}),
        notes:      note.slice(0, 300),
      }),
    });
    if (r.ok) return code;
    if (r.status !== 409) throw new Error(`Gagal membuat member (${r.status}): ${(await r.text()).slice(0, 200)}`);
    // 409 bisa berarti email/akun sudah dibuat permintaan paralel.
    const raced = await findMember({ authUserId, email });
    if (raced) return raced.code;
  }
  throw new Error('Gagal membuat kode member unik');
}

// +30 hari AI Partner, dihitung dari tanggal habis kalau masih aktif (perpanjangan tidak hangus).
export async function extendAi(memberCode, { email, event = 'checkout.paid', days = AI_PERIOD_DAYS } = {}) {
  const { url, h } = sb();
  const rows = await fetch(
    `${url}/rest/v1/ai_subscriptions?member_code=eq.${encodeURIComponent(memberCode)}&product_id=eq.${AI_PRODUCT_ID}&select=status,expires_at`,
    { headers: h() }
  ).then(r => (r.ok ? r.json() : [])).catch(() => []);
  const current = Array.isArray(rows) ? rows[0] : null;
  const currentEnd = current?.status === 'active' && current.expires_at ? Date.parse(current.expires_at) : 0;
  const start = Math.max(Date.now(), currentEnd || 0);
  const expiresAt = new Date(start + days * 86400000).toISOString();
  const now = new Date().toISOString();

  const r = await fetch(`${url}/rest/v1/ai_subscriptions?on_conflict=member_code,product_id`, {
    method: 'POST',
    headers: h({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
    body: JSON.stringify({
      member_code: memberCode, product_id: AI_PRODUCT_ID, status: 'active', expires_at: expiresAt,
      mayar_email: email || null, last_event: event, last_event_at: now, updated_at: now,
    }),
  });
  if (!r.ok) throw new Error(`Gagal menambah masa AI Partner (${r.status}): ${(await r.text()).slice(0, 200)}`);
  return expiresAt;
}

// Idempoten: tagihan diklaim pending → paid dulu, jadi webhook + cek status bersamaan tidak memproses dua kali.
// Kalau aktivasi gagal, klaim dikembalikan ke pending supaya bisa dicoba lagi.
export async function fulfillCheckout(checkout, { via, mobile } = {}) {
  const claimed = await patchCheckout(checkout.id, { status: 'paid', paid_at: new Date().toISOString(), paid_via: via || null }, '&status=eq.pending');
  if (!claimed[0]) return { ok: true, already: true };

  try {
    const note = `Mayar API · ${checkout.mayar_id || checkout.id}`;
    let code = checkout.member_code;
    if (checkout.plan !== 'ai') {
      code = await activateLibrary({ authUserId: checkout.auth_user_id, email: checkout.email, name: checkout.name, mobile, note });
    }
    if (!code) {
      const m = await findMember({ authUserId: checkout.auth_user_id, email: checkout.email });
      code = m?.code || null;
    }
    if (!code) throw new Error('Member pembeli tidak ditemukan');
    let aiExpiresAt = null;
    if (checkout.plan !== 'library') {
      const longPlan = checkout.plan === 'imtihan' || checkout.plan === 'rombongan';
      aiExpiresAt = await extendAi(code, { email: checkout.email, days: longPlan ? IMTIHAN_AI_DAYS : AI_PERIOD_DAYS });
    }
    if (checkout.plan === 'rombongan') await createGroupCodes(checkout);
    await patchCheckout(checkout.id, { member_code: code });
    return { ok: true, memberCode: code, aiExpiresAt };
  } catch (err) {
    await patchCheckout(checkout.id, { status: 'pending', paid_at: null, paid_via: null }).catch(() => {});
    throw err;
  }
}

// Dipanggil halaman Gabung saat menunggu: tanya Mayar apakah tagihan sudah dibayar.
export async function refreshCheckout(checkout) {
  if (checkout.status !== 'pending' || !checkout.mayar_id) return checkout.status;
  if (Date.parse(checkout.created_at) < Date.now() - CHECKOUT_TTL_MS - 3600000) {
    await patchCheckout(checkout.id, { status: 'expired' }, '&status=eq.pending').catch(() => {});
    return 'expired';
  }
  if (checkout.checked_at && Date.now() - Date.parse(checkout.checked_at) < STATUS_CHECK_GAP_MS) return 'pending';
  await patchCheckout(checkout.id, { checked_at: new Date().toISOString() });
  const data = await mayarRequest(`/payments/${encodeURIComponent(checkout.mayar_id)}`);
  if (!isPaidRequest(data)) return 'pending';
  await fulfillCheckout(checkout, { via: 'status_check' });
  return 'paid';
}

/* ── Webhook ── */

const ID_PATTERN = /^[A-Za-z0-9_-]{6,80}$/;

// Cocokkan event payment.received dengan tagihan. Bentuk payload untuk payment request belum
// terdokumentasi, jadi coba semua kandidat id; kalau tidak ada yang cocok, pakai email pembeli
// + nama tagihan, lalu pastikan ke API Mayar bahwa tagihan itu memang sudah lunas.
export async function matchWebhookCheckout(data) {
  const ids = [...new Set([
    data.productId, data.paymentLinkId, data.paymentRequestId, data.paymentLinkTransactionId,
    data.transactionId, data.id, data.extraData?.checkoutId,
  ].filter(v => typeof v === 'string' && ID_PATTERN.test(v)))];

  if (ids.length) {
    const list = ids.map(v => `"${v}"`).join(',');
    const uuidIds = ids.filter(v => /^[0-9a-f-]{36}$/i.test(v)).map(v => `"${v}"`).join(',');
    const filter = [`mayar_id.in.(${list})`, `transaction_id.in.(${list})`, uuidIds && `id.in.(${uuidIds})`].filter(Boolean).join(',');
    const rows = await selectCheckouts(`or=(${filter})&limit=1`);
    if (rows[0]) return { checkout: rows[0], verified: false };
  }

  const email = (data.customerEmail || '').trim().toLowerCase();
  const product = (data.productName || '').trim();
  const titled = Object.values(PLAN_TITLES).includes(product) || /^Talqeeh Paket Rombongan \d+ orang/.test(product);
  if (!email || !titled) return null;
  const since = new Date(Date.now() - 2 * CHECKOUT_TTL_MS).toISOString();
  const rows = await selectCheckouts(`email=eq.${encodeURIComponent(email)}&status=eq.pending&created_at=gte.${since}&order=created_at.desc&limit=5`);
  for (const row of rows) {
    if (!row.mayar_id) continue;
    const detail = await mayarRequest(`/payments/${encodeURIComponent(row.mayar_id)}`).catch(() => null);
    if (isPaidRequest(detail)) return { checkout: row, verified: true };
  }
  return null;
}

/* ── Paket Rombongan: kode untuk teman ──
   Pembeli memakai kursi pertama (langsung aktif). Kursi lain menjadi kode yang dibagikan pembeli; teman yang login
   Google lalu menukar kode mendapat Paket Imtihan (Library selamanya + AI Partner 120 hari). Satu akun satu kode. */
const GROUP_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const groupSegment = (n) => Array.from(crypto.randomBytes(n), b => GROUP_CODE_CHARS[b % GROUP_CODE_CHARS.length]).join('');
export const normalizeGroupCode = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^RMB/, '');
const formatGroupCode = (raw) => `RMB-${raw.slice(0, 4)}-${raw.slice(4, 8)}`;

async function checkoutSeats(checkoutId) {
  const { url, h } = sb();
  const r = await fetch(`${url}/rest/v1/payment_checkouts?id=eq.${encodeURIComponent(checkoutId)}&select=seats&limit=1`, { headers: h() });
  if (!r.ok) throw new Error(`payment_checkouts seats ${r.status} — jalankan migrations/paket_rombongan.sql`);
  return Number((await r.json())?.[0]?.seats) || 0;
}

// Idempoten: kursi yang sudah punya kode tidak dibuat ulang.
async function createGroupCodes(checkout) {
  const seats = await checkoutSeats(checkout.id);
  if (seats < 2) throw new Error('Jumlah kursi rombongan tidak ditemukan');
  const { url, h } = sb();
  const existing = await fetch(`${url}/rest/v1/group_codes?checkout_id=eq.${checkout.id}&select=seat_no`, { headers: h() })
    .then(r => (r.ok ? r.json() : Promise.reject(new Error(`group_codes ${r.status}`))));
  const have = new Set((existing || []).map(r => r.seat_no));
  const rows = [];
  for (let seat = 2; seat <= seats; seat++) {
    if (!have.has(seat)) rows.push({ code: formatGroupCode(groupSegment(8)), checkout_id: checkout.id, seat_no: seat, buyer_email: checkout.email });
  }
  if (!rows.length) return;
  const r = await fetch(`${url}/rest/v1/group_codes`, { method: 'POST', headers: h({ Prefer: 'return=minimal' }), body: JSON.stringify(rows) });
  if (!r.ok) throw new Error(`Gagal membuat kode rombongan (${r.status}): ${(await r.text()).slice(0, 200)}`);
}

// Kode rombongan milik pembeli (semua tagihan rombongan yang sudah lunas).
export async function listGroupCodes(authUserId) {
  const { url, h } = sb();
  const checkouts = await selectCheckouts(`auth_user_id=eq.${encodeURIComponent(authUserId)}&plan=eq.rombongan&status=eq.paid&order=created_at.desc&limit=20`);
  if (!checkouts.length) return [];
  const ids = checkouts.map(c => c.id).join(',');
  const r = await fetch(`${url}/rest/v1/group_codes?checkout_id=in.(${ids})&select=code,checkout_id,seat_no,redeemed_email,redeemed_at&order=seat_no.asc`, { headers: h() });
  if (!r.ok) return [];
  const mask = (e) => (e ? e.replace(/^(.{2}).*(@.*)$/, '$1•••$2') : null);
  return (await r.json()).map(c => ({ code: c.code, seat: c.seat_no, checkoutId: c.checkout_id, redeemedBy: mask(c.redeemed_email), redeemedAt: c.redeemed_at }));
}

/* Tukar kode: klaim atomik (redeemed_at masih kosong), lalu aktifkan Library + 120 hari AI Partner.
   Kalau aktivasi gagal, klaim dilepas supaya kode bisa dipakai lagi. */
export async function redeemGroupCode({ user, code }) {
  const raw = normalizeGroupCode(code);
  if (raw.length !== 8) return { ok: false, status: 'invalid_code' };
  const email = String(user.email || '').trim().toLowerCase();
  const { url, h } = sb();
  const found = await fetch(`${url}/rest/v1/group_codes?code=eq.${formatGroupCode(raw)}&select=code,buyer_email,redeemed_at&limit=1`, { headers: h() })
    .then(r => (r.ok ? r.json() : []));
  const row = found?.[0];
  if (!row) return { ok: false, status: 'invalid_code' };
  if (row.redeemed_at) return { ok: false, status: 'code_used' };
  if (row.buyer_email?.toLowerCase() === email) return { ok: false, status: 'own_code' };
  const already = await fetch(`${url}/rest/v1/group_codes?redeemed_email=eq.${encodeURIComponent(email)}&select=code&limit=1`, { headers: h() })
    .then(r => (r.ok ? r.json() : []));
  if (already?.length) return { ok: false, status: 'already_redeemed' };

  const claim = await fetch(`${url}/rest/v1/group_codes?code=eq.${row.code}&redeemed_at=is.null`, {
    method: 'PATCH',
    headers: h({ Prefer: 'return=representation' }),
    body: JSON.stringify({ redeemed_at: new Date().toISOString(), redeemed_email: email }),
  });
  const claimed = claim.ok ? await claim.json() : [];
  if (!claimed.length) return { ok: false, status: claim.status === 409 ? 'already_redeemed' : 'code_used' };
  try {
    const memberCode = await activateLibrary({ authUserId: user.id, email, name: user.name, note: `Paket Rombongan · ${row.code}` });
    const aiExpiresAt = await extendAi(memberCode, { email, event: 'group.redeem', days: IMTIHAN_AI_DAYS });
    await fetch(`${url}/rest/v1/group_codes?code=eq.${row.code}`, { method: 'PATCH', headers: h({ Prefer: 'return=minimal' }), body: JSON.stringify({ redeemed_by: memberCode }) });
    return { ok: true, memberCode, aiExpiresAt };
  } catch (err) {
    await fetch(`${url}/rest/v1/group_codes?code=eq.${row.code}`, {
      method: 'PATCH', headers: h({ Prefer: 'return=minimal' }), body: JSON.stringify({ redeemed_at: null, redeemed_email: null }),
    }).catch(() => {});
    throw err;
  }
}
