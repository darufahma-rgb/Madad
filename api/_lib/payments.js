// Pembayaran lewat Mayar Headless API V2 — tagihan dibuat per pembeli, tanpa produk di dashboard Mayar.
// Alur: createCheckout → pembeli bayar di link Mayar → webhook payment.received (atau cek status dari
// halaman Gabung) → fulfillCheckout mengaktifkan Library dan/atau menambah 30 hari AI Partner.
import { sbConfig, sbHeaders, newMemberCode } from './member.js';
import { readSettings } from './settings.js';

// Samakan dengan LIBRARY_PRICE di src/layout.jsx.
export const LIBRARY_PRICE_IDR = 63000;
export const AI_PERIOD_DAYS = 30;
export const AI_PRODUCT_ID = 'talqeeh-ai-30hari';
export const CHECKOUT_PLANS = ['library', 'library_ai', 'ai'];

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
};

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

const splitAmount = (plan, prices) => ({
  library_amount: plan === 'ai' ? 0 : prices.library,
  ai_amount: plan === 'library' ? 0 : prices.ai,
});

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
export function checkoutBlockReason(plan, member) {
  const paidLibrary = member && member.status === 'active' && member.tier !== 'free';
  if (plan === 'ai') return paidLibrary ? null : 'needs_library';
  return paidLibrary ? 'already_library' : null;
}

export async function createCheckout({ user, member, plan, appOrigin }) {
  const prices = await getPrices();
  if (plan !== 'library' && !prices.ai) return { ok: false, status: 'ai_price_unset' };
  const parts = splitAmount(plan, prices);
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
      plan, amount, ...parts,
      email: user.email, name, auth_user_id: user.id, member_code: member?.code || null,
    }),
  });
  if (!created.ok) throw new Error(`payment_checkouts insert ${created.status}: ${(await created.text()).slice(0, 200)}`);
  const row = (await created.json())[0];

  const request = {
    name: PLAN_TITLES[plan],
    amount,
    email: user.email,
    description: `${PLAN_TITLES[plan]} untuk ${user.email}`,
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
    for (const fields of ['code,status,tier,email', 'code,status,email']) {
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
    if (existing.status !== 'active' || isFree) {
      const r = await fetch(`${url}/rest/v1/members?code=eq.${encodeURIComponent(existing.code)}`, {
        method: 'PATCH',
        headers: h({ Prefer: 'return=minimal' }),
        body: JSON.stringify({
          status: 'active', expires_at: LIFETIME_EXPIRY,
          ...(isFree ? { tier: 'library', notes: `Upgrade dari akun gratis · ${note}`.slice(0, 300) } : {}),
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
    if (checkout.plan !== 'library') aiExpiresAt = await extendAi(code, { email: checkout.email });
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
  const titled = Object.values(PLAN_TITLES).includes((data.productName || '').trim());
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
