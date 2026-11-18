/* Token AI — satu saldo per akun untuk SEMUA fitur AI.
   - Tiap pemanggilan AI memotong token sesuai biaya aslinya (OpenRouter melaporkan biaya per panggilan, lihat ai-cost.js).
     1 token = $0,0001, jadi token yang terpakai habis nilainya persis sebesar biaya AI-nya — tidak bisa tekor.
   - Token didapat dari membeli paket token (Rp100rb / Rp199rb; yang membedakan hanya jumlah tokennya) dan tidak hangus.
     Tidak ada lagi masa 30/60 hari, kuota harian/bulanan, atau jatah talkhis: selama token masih ada, semua fitur terbuka.
   - Paket token sekaligus membuka Library selamanya. Paket Library saja tetap dijual (tanpa token).
   - Pembelian sebelum model ini berlaku (Paket Imtihan, AI 30 hari, tambahan talkhis) dikonversi jadi token, sekali, otomatis.
   - Coba gratis: tiap akun mendapat token gratis sekali (grants.free) saat pertama membuka AI Partner. Jumlah pemberian
     per hari dibatasi (limits.freeDaily) supaya tidak bisa dikuras dengan banyak akun Google. Kalau batas hari itu penuh,
     akun memakai jatah cicip lama dan mendapat tokennya di hari berikutnya.
   Angka bisa diubah admin lewat setting `aiTokens` (JSON). Tabel & fungsi: migrations/ai_tokens.sql.
   Selama migrasi itu belum dijalankan (setting aiTokensStart belum ada), sistem langganan & kuota lama tetap berlaku. */
import { sbConfig, sbHeaders, consumeQuota } from './member.js';
import { readSettings } from './settings.js';
import { CLASS_TRIAL_PRODUCT } from './events.js';

export const TOKEN_USD = 0.0001;

export const DEFAULT_TOKENS = {
  usdRate: 16500, // kurs untuk hitungan untung di admin
  // Paket token. Pembeli yang belum punya Library otomatis mendapat Library selamanya.
  packs: [
    { id: 't100', price: 100000, tokens: 35000 },
    { id: 't199', price: 199000, tokens: 75000 },
  ],
  // imtihan: Paket Imtihan (plan 'imtihan' — harga kupon/mitra/kekeluargaan/rombongan tetap berlaku) = Library + token ini.
  // free: token gratis sekali per akun untuk mencoba AI Partner.
  grants: { imtihan: 75000, free: 1500 },
  // freeDaily: paling banyak sekian akun per hari yang mendapat token gratis (seluruh Talqeeh).
  limits: { freeDaily: 30 },
  // Konversi pembelian lama yang masa AI-nya masih berjalan saat model token mulai berlaku.
  convert: { imtihan: 75000, monthly: 35000, talkhis_1: 12000, talkhis_3: 30000 },
};

/* Perkiraan token per pemakaian, untuk ditampilkan ke pengguna (potongan sebenarnya mengikuti biaya asli tiap panggilan).
   Sumber: biaya terukur di kode (Live Caption $0,0064/menit, tutor ±$0,01, i'rab ±$0,02, talkhis ±$1–2,7 per muqarrar). */
// Token gratis (1.500) kira-kira cukup untuk 1 ringkasan + kuis dan beberapa pesan tutor.
export const TOKEN_GUIDE = { chat: 100, analyze: 200, generate: 600, ocr: 60, livePerMinute: 70, transcribePerMinute: 40, talkhis: 15000, ilmi: 3000 };

const blank = (v) => v == null || v === '';
const int = (v, min, max) => { if (blank(v)) return null; const n = Number(v); return Number.isInteger(n) && n >= min && n <= max ? n : null; };

// Setting tersimpan berupa JSON; bagian yang kosong/tidak valid memakai bawaan. Tidak pernah melempar error.
export const parseTokenConfig = (raw) => {
  let o = {};
  try { o = typeof raw === 'string' ? JSON.parse(raw || '{}') : (raw || {}); } catch {}
  const d = DEFAULT_TOKENS;
  const pick = (group) => Object.fromEntries(Object.keys(d[group]).map(k => [k, int(o?.[group]?.[k], 0, 10000000) ?? d[group][k]]));
  const packs = (Array.isArray(o?.packs) ? o.packs : []).map(p => {
    const tokens = int(p?.tokens, 1, 10000000), price = int(p?.price, 5000, 5000000);
    const id = String(p?.id || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
    return tokens && price && id ? { id, price, tokens } : null;
  }).filter(Boolean).slice(0, 4);
  return { usdRate: int(o?.usdRate, 1000, 100000) ?? d.usdRate, packs: packs.length ? packs : d.packs, grants: pick('grants'), limits: pick('limits'), convert: pick('convert') };
};

// Token untuk satu pemanggilan AI. Biaya tak diketahui (respons terputus) → taksiran dari jumlah token model, harga Sonnet.
export const tokensFor = (costUsd, estimate = null) => {
  let cost = Number(costUsd);
  if (!Number.isFinite(cost) || cost < 0) {
    cost = ((Number(estimate?.tokensIn) || 0) * 3 + (Number(estimate?.tokensOut) || 0) * 15) / 1e6;
  }
  return Math.max(1, Math.ceil(cost / TOKEN_USD));
};

/* Hitungan untung per penjualan (panel admin & tes): biaya AI dihitung seolah SEMUA token terpakai — kasus terburuk. */
export const tokenValueIdr = (tokens, cfg = DEFAULT_TOKENS) => Math.round(tokens * TOKEN_USD * cfg.usdRate);
export const saleMargin = ({ price, tokens, fee = 0 }, cfg = DEFAULT_TOKENS) => {
  const aiCost = tokenValueIdr(tokens, cfg);
  const profit = price - fee - aiCost;
  return { aiCost, profit, percent: price > 0 ? Math.round((profit / price) * 100) : 0, safe: profit > 0 };
};

/* ── Setting ── */

let cache = { at: 0, cfg: null, start: null };
const CACHE_MS = 60 * 1000;
const load = async () => {
  if (cache.cfg && Date.now() - cache.at < CACHE_MS) return cache;
  let s = {};
  try { s = await readSettings(['aiTokens', 'aiTokensStart']); } catch {}
  const t = Date.parse(s.aiTokensStart || '');
  cache = { at: Date.now(), cfg: parseTokenConfig(s.aiTokens), start: Number.isFinite(t) ? t : null };
  return cache;
};
export const getTokenConfig = async () => (await load()).cfg;
// Model token berlaku sejak migrasi dijalankan. null = belum → langganan & kuota lama.
export const tokensStart = async () => (await load()).start;
export const tokensOn = async () => (await tokensStart()) != null;
export const clearTokenCache = () => { cache = { at: 0, cfg: null, start: null }; };

/* ── Saldo ── */

const rpc = async (name, body) => {
  const { url, key } = sbConfig();
  const r = await fetch(`${url}/rest/v1/rpc/${name}`, { method: 'POST', headers: sbHeaders(key), body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`${name} ${r.status}: ${(await r.text().catch(() => '')).slice(0, 160)}`);
  const row = (await r.json())?.[0];
  return row ? { balance: Number(row.balance) || 0, granted: Number(row.granted) || 0 } : { balance: 0, granted: 0, missing: true };
};

// { balance, granted }; null kalau tidak bisa dibaca.
export const tokenState = async (code) => {
  try { return await rpc('charge_ai_tokens', { p_code: code, p_amount: 0, p_reason: 'read' }); }
  catch (err) { console.warn('[tokens] baca saldo gagal:', err.message); return null; }
};

// Potong token setelah AI selesai. Tidak pernah melempar error (pencatatan tidak boleh menggagalkan jawaban AI).
export const chargeTokens = async (code, amount, reason) => {
  try { return await rpc('charge_ai_tokens', { p_code: code, p_amount: amount, p_reason: reason }); }
  catch (err) { console.warn('[tokens] potong gagal:', err.message); return null; }
};

// Idempoten per (akun, ref). Mengembalikan { balance, granted }, atau null kalau gagal.
export const grantTokens = async (code, amount, reason, ref = null) => {
  try { return await rpc('grant_ai_tokens', { p_code: code, p_amount: amount, p_reason: reason, p_ref: ref }); }
  catch (err) { console.warn('[tokens] tambah gagal:', err.message); return null; }
};

/* ── Token dari pembelian ──
   Dihitung dari tagihan lunas, kode rombongan, dan langganan lama milik akun, lalu dicatat dengan ref unik — aman
   dipanggil berulang (webhook, cek status, saat saldo dibaca) dan memperbaiki diri kalau satu pemanggilan gagal. */
const LOOKBACK_DAYS = 130;
const DAY = 86400000;
const LEGACY_PLANS = { imtihan: 'imtihan', rombongan: 'imtihan', group: 'imtihan', library_ai: 'monthly', ai: 'monthly', talkhis_1: 'talkhis_1', talkhis_3: 'talkhis_3' };

/* Murni (dites). rows: [{ ref, plan, paidAt, tokens }]; have: Set ref yang sudah tercatat.
   subActive: akun masih punya langganan AI lama yang berjalan (syarat konversi pembelian lama). */
export const grantsDue = (rows, { start, subActive = false, have = new Set(), cfg = DEFAULT_TOKENS }) => {
  const due = [];
  let legacySeen = false;
  for (const row of rows) {
    const paid = Date.parse(row.paidAt || '');
    if (!Number.isFinite(paid)) continue;
    const legacy = paid < start;
    if (legacy && row.plan !== 'token') legacySeen = true;
    if (have.has(row.ref)) continue;
    if (row.plan === 'token') { if (row.tokens > 0) due.push({ ref: row.ref, amount: row.tokens, reason: 'buy' }); continue; }
    const kind = LEGACY_PLANS[row.plan];
    if (!kind) continue;
    if (legacy) {
      if (subActive && cfg.convert[kind] > 0) due.push({ ref: row.ref, amount: cfg.convert[kind], reason: 'convert' });
    } else if (kind === 'imtihan') {
      if (cfg.grants.imtihan > 0) due.push({ ref: row.ref, amount: cfg.grants.imtihan, reason: 'buy' });
    } else if (cfg.convert[kind] > 0) {
      // Paket lama yang tagihannya baru lunas setelah model token berlaku: tetap dihargai setara.
      due.push({ ref: row.ref, amount: cfg.convert[kind], reason: 'convert' });
    }
  }
  // Akses AI lama tanpa tagihan (diberi admin / Membership lama): satu kali, setara paket kecil.
  if (subActive && !legacySeen && !have.has('legacy:sub') && cfg.convert.monthly > 0) {
    due.push({ ref: 'legacy:sub', amount: cfg.convert.monthly, reason: 'convert' });
  }
  return due;
};

const ensured = new Map(); // code → waktu terakhir diperiksa (per instance)
const ENSURE_GAP_MS = 10 * 60 * 1000;

// Token gratis sekali per akun. Murni (dites): perlu diberi kalau belum pernah dan jumlahnya di setting lebih dari 0.
export const freeGrantDue = (have, cfg = DEFAULT_TOKENS) => !have.has('free:welcome') && cfg.grants.free > 0 && cfg.limits.freeDaily > 0;

/* welcome: true → sekalian beri token gratis (dipanggil saat pengguna membuka AI Partner, bukan di setiap halaman, supaya
   jatah pemberian harian tidak habis untuk akun yang tidak memakai AI). Mengembalikan true kalau token gratis baru diberikan. */
export const ensureGrants = async (code, { force = false, welcome = false } = {}) => {
  const start = await tokensStart();
  if (start == null || !code) return false;
  if (!force && !welcome && Date.now() - (ensured.get(code) || 0) < ENSURE_GAP_MS) return false;
  try {
    const { url, key } = sbConfig();
    const h = { headers: sbHeaders(key) };
    const since = new Date(Date.now() - LOOKBACK_DAYS * DAY).toISOString();
    const c = encodeURIComponent(code);
    const arr = (r) => (r.ok ? r.json() : []);
    const [checkouts, groups, ledger, subs] = await Promise.all([
      fetch(`${url}/rest/v1/payment_checkouts?member_code=eq.${c}&status=eq.paid&plan=in.(imtihan,rombongan,library_ai,ai,talkhis_1,talkhis_3,token)&paid_at=gte.${since}&select=id,plan,paid_at,tokens`, h).then(arr),
      fetch(`${url}/rest/v1/group_codes?redeemed_by=eq.${c}&redeemed_at=gte.${since}&select=code,redeemed_at`, h).then(arr).catch(() => []),
      fetch(`${url}/rest/v1/ai_token_ledger?member_code=eq.${c}&ref=not.is.null&select=ref&limit=500`, h).then(r => (r.ok ? r.json() : null)),
      // Langganan AI lama yang masih berjalan dan sudah ada sebelum model token (trial kelas tidak dikonversi).
      fetch(`${url}/rest/v1/ai_subscriptions?member_code=eq.${c}&status=eq.active&or=(expires_at.is.null,expires_at.gt.${new Date().toISOString()})&select=product_id,updated_at`, h).then(arr).catch(() => []),
    ]);
    if (!ledger) return false; // buku catatan tidak terbaca → jangan memberi apa pun
    const subActive = (Array.isArray(subs) ? subs : []).some(s => s.product_id !== CLASS_TRIAL_PRODUCT && !(Date.parse(s.updated_at || '') >= start));
    const rows = [
      ...(Array.isArray(checkouts) ? checkouts : []).map(x => ({ ref: `checkout:${x.id}`, plan: x.plan, paidAt: x.paid_at, tokens: Number(x.tokens) || 0 })),
      ...(Array.isArray(groups) ? groups : []).map(g => ({ ref: `group:${g.code}`, plan: 'group', paidAt: g.redeemed_at, tokens: 0 })),
    ];
    const have = new Set(ledger.map(r => r.ref));
    const due = grantsDue(rows, { start, subActive, have, cfg: await getTokenConfig() });
    for (const g of due) await grantTokens(code, g.amount, g.reason, g.ref);
    ensured.set(code, Date.now());
    const cfg = await getTokenConfig();
    if (welcome && freeGrantDue(have, cfg) && (await consumeQuota('TOKEN-FREE', 'free_grant', cfg.limits.freeDaily))) {
      const st = await grantTokens(code, cfg.grants.free, 'free', 'free:welcome');
      return !!st && !st.missing;
    }
    return false;
  } catch (err) {
    console.warn('[tokens] ensureGrants gagal:', err.message);
    return false;
  }
};
