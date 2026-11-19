/* Token AI — satu saldo per akun untuk SEMUA fitur AI.
   - Tiap pemanggilan AI memotong token sesuai biaya aslinya (OpenRouter melaporkan biaya per panggilan, lihat ai-cost.js).
     1 token = $0,0001, jadi token yang terpakai habis nilainya persis sebesar biaya AI-nya — tidak bisa tekor.
   - Token didapat dari membeli paket token (Rp100rb / Rp199rb; yang membedakan hanya jumlah tokennya) dan tidak hangus.
     Tidak ada lagi masa 30/60 hari, kuota harian/bulanan, atau jatah talkhis: selama token masih ada, semua fitur terbuka.
   - Paket token sekaligus membuka Library selamanya. Paket Library saja tetap dijual (tanpa token).
   - Member lama (membayar sebelum model token berlaku, masa AI-nya masih berjalan) mendapat jatah token bulanan yang diisi
     ulang tiap 30 hari selama masa paketnya: Paket Imtihan lama 4 bulan → 4× isi ulang, 2 bulan → 2×, AI 30 hari → 1×.
     "Isi ulang" = saldo dinaikkan sampai jatah bulanan (token yang dibeli sendiri tidak terhapus). Tambahan talkhis lama
     dikonversi sekali.
   - Member Library (sudah pernah membayar) mendapat hadiah token sekali, dengan pemberitahuan di akunnya. Library mereka
     dibuka selamanya (migrations/ai_tokens.sql).
   - Tarif per fitur (rates) bisa diatur admin: 1 = sesuai biaya asli; di bawah 1 = fitur itu lebih hemat token (Talqeeh ikut
     menanggung sebagian biayanya); di atas 1 = lebih boros.
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
  grants: { imtihan: 75000, free: 1500, gift: 5000 },
  // gift: hadiah token sekali untuk member Library yang sudah pernah membayar.
  // freeDaily: paling banyak sekian akun per hari yang mendapat token gratis (seluruh Talqeeh).
  limits: { freeDaily: 30 },
  // Jatah bulanan member lama (diisi ulang tiap 30 hari selama masa paket lamanya masih berjalan).
  legacy: { imtihan: 30000, monthly: 30000 },
  // Konversi sekali: tambahan talkhis lama; monthly = paket AI 30 hari yang baru lunas setelah model token berlaku.
  convert: { monthly: 35000, talkhis_1: 12000, talkhis_3: 30000 },
  // Tarif per fitur dalam persen biaya asli (100 = sesuai biaya asli). Kunci = jenis biaya di ai-cost.js.
  rates: { chat: 100, prompt: 100, analyze: 100, generate: 100, grade: 100, ocr: 100, live: 100, transcribe: 100, talkhis: 100, ilmi: 100, game: 100 },
};
// Jenis biaya yang dihitung sebagai "game" (Arena Imtihan).
const GAME_KINDS = ['battle_story', 'battle_quiz', 'battle_halaqah'];
export const rateFor = (kind, cfg = DEFAULT_TOKENS) => {
  const k = GAME_KINDS.includes(kind) ? 'game' : kind;
  const pct = cfg.rates?.[k];
  return (Number.isFinite(pct) && pct > 0 ? pct : 100) / 100;
};
// Tarif paling rendah = kasus terburuk untuk hitungan untung (semua token habis di fitur termurah).
export const minRate = (cfg = DEFAULT_TOKENS) => Math.min(...Object.values(cfg.rates).map(v => (v > 0 ? v : 100))) / 100;

/* Perkiraan token per pemakaian, untuk ditampilkan ke pengguna (potongan sebenarnya mengikuti biaya asli tiap panggilan).
   Sumber: biaya terukur di kode (Live Caption $0,0064/menit, tutor ±$0,01, i'rab ±$0,02, talkhis ±$1–2,7 per muqarrar). */
// Token gratis (1.500) kira-kira cukup untuk 1 ringkasan + kuis dan beberapa pesan tutor.
export const TOKEN_GUIDE = { chat: 100, analyze: 200, generate: 600, ocr: 60, livePerMinute: 70, transcribePerMinute: 40, talkhis: 15000, ilmi: 3000 };
// Perkiraan setelah tarif per fitur (rates) diterapkan — angka inilah yang ditampilkan ke pengguna.
const GUIDE_KIND = { chat: 'chat', analyze: 'analyze', generate: 'generate', ocr: 'ocr', livePerMinute: 'live', transcribePerMinute: 'transcribe', talkhis: 'talkhis', ilmi: 'ilmi' };
export const tokenGuide = (cfg = DEFAULT_TOKENS) => Object.fromEntries(Object.entries(TOKEN_GUIDE)
  .map(([k, v]) => [k, Math.max(1, Math.round((v * rateFor(GUIDE_KIND[k], cfg)) / (v >= 1000 ? 100 : 10)) * (v >= 1000 ? 100 : 10))]));

const blank = (v) => v == null || v === '';
const int = (v, min, max) => { if (blank(v)) return null; const n = Number(v); return Number.isInteger(n) && n >= min && n <= max ? n : null; };

// Setting tersimpan berupa JSON; bagian yang kosong/tidak valid memakai bawaan. Tidak pernah melempar error.
export const parseTokenConfig = (raw) => {
  let o = {};
  try { o = typeof raw === 'string' ? JSON.parse(raw || '{}') : (raw || {}); } catch {}
  const d = DEFAULT_TOKENS;
  const pick = (group, min = 0, max = 10000000) => Object.fromEntries(Object.keys(d[group]).map(k => [k, int(o?.[group]?.[k], min, max) ?? d[group][k]]));
  const packs = (Array.isArray(o?.packs) ? o.packs : []).map(p => {
    const tokens = int(p?.tokens, 1, 10000000), price = int(p?.price, 5000, 5000000);
    const id = String(p?.id || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
    return tokens && price && id ? { id, price, tokens } : null;
  }).filter(Boolean).slice(0, 4);
  return { usdRate: int(o?.usdRate, 1000, 100000) ?? d.usdRate, packs: packs.length ? packs : d.packs,
    grants: pick('grants'), limits: pick('limits'), legacy: pick('legacy'), convert: pick('convert'), rates: pick('rates', 10, 500) };
};

// Token untuk satu pemanggilan AI. Biaya tak diketahui (respons terputus) → taksiran dari jumlah token model, harga Sonnet.
// rate: tarif fitur (1 = biaya asli).
export const tokensFor = (costUsd, estimate = null, rate = 1) => {
  let cost = Number(costUsd);
  if (!Number.isFinite(cost) || cost < 0) {
    cost = ((Number(estimate?.tokensIn) || 0) * 3 + (Number(estimate?.tokensOut) || 0) * 15) / 1e6;
  }
  return Math.max(1, Math.ceil((cost * (rate > 0 ? rate : 1)) / TOKEN_USD));
};

/* Hitungan untung per penjualan (panel admin & tes): biaya AI dihitung seolah SEMUA token terpakai — kasus terburuk. */
// Biaya AI paling besar untuk sejumlah token: semua dipakai di fitur dengan tarif terendah.
export const tokenValueIdr = (tokens, cfg = DEFAULT_TOKENS) => Math.round((tokens * TOKEN_USD * cfg.usdRate) / minRate(cfg));
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

// Isi ulang sampai `target` (jatah bulanan member lama). Idempoten per (akun, ref).
export const topupTokens = async (code, target, reason, ref) => {
  try { return await rpc('topup_ai_tokens', { p_code: code, p_target: target, p_reason: reason, p_ref: ref }); }
  catch (err) { console.warn('[tokens] isi ulang gagal:', err.message); return null; }
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
   Dihitung dari tagihan lunas, kode rombongan, langganan lama, dan status member, lalu dicatat dengan ref unik — aman
   dipanggil berulang (webhook, cek status, saat saldo dibaca) dan memperbaiki diri kalau satu pemanggilan gagal. */
const LOOKBACK_DAYS = 130;
const DAY = 86400000;
const CYCLE_DAYS = 30;
// Masa Paket Imtihan lama: dibuat sebelum 5 Nov 2026 = 120 hari, sesudahnya 60 hari (samakan dengan imtihanDaysFor di payments.js).
const IMTIHAN_SHORTENED_AT = Date.parse('2026-11-05T00:00:00Z');
export const legacyImtihanDays = (createdAt) => (Date.parse(createdAt || '') < IMTIHAN_SHORTENED_AT ? 120 : 60);
const PLAN_KIND = { imtihan: 'imtihan', rombongan: 'imtihan', group: 'imtihan', library_ai: 'monthly', ai: 'monthly', talkhis_1: 'talkhis_1', talkhis_3: 'talkhis_3' };

/* Murni (dites). rows: [{ ref, plan, paidAt, createdAt, tokens }]; have: Set ref yang sudah tercatat.
   Hasil: [{ ref, amount, reason, topup? }] — topup: true = isi ulang sampai `amount`, bukan menambah.
   subActive: masih punya langganan AI lama yang berjalan (akses dari admin tanpa tagihan → satu kali isi ulang).
   paidLibrary: member Library berbayar (bukan akun gratis/trial) yang sudah ada sebelum model token → hadiah token sekali.
   Akun yang membeli paket setelah model token berlaku tidak mendapat hadiah (tokennya sudah dari paket). */
export const grantsDue = (rows, { start, now = Date.now(), subActive = false, paidLibrary = false, have = new Set(), cfg = DEFAULT_TOKENS }) => {
  const due = [];
  const add = (g) => { if (!have.has(g.ref) && g.amount > 0) due.push(g); };
  let legacySeen = false, boughtNew = false;
  for (const row of rows) {
    const paid = Date.parse(row.paidAt || '');
    if (!Number.isFinite(paid)) continue;
    if (paid >= start) boughtNew = true;
    if (row.plan === 'token') { add({ ref: row.ref, amount: row.tokens, reason: 'buy' }); continue; }
    const kind = PLAN_KIND[row.plan];
    if (!kind) continue;
    if (paid >= start) {
      // Dibayar setelah model token berlaku: Paket Imtihan = paket token besar; paket lama yang telat lunas dikonversi sekali.
      add(kind === 'imtihan' ? { ref: row.ref, amount: cfg.grants.imtihan, reason: 'buy' } : { ref: row.ref, amount: cfg.convert[kind], reason: 'convert' });
      continue;
    }
    if (kind === 'talkhis_1' || kind === 'talkhis_3') { add({ ref: row.ref, amount: cfg.convert[kind], reason: 'convert' }); continue; }
    // Member lama: jatah bulanan, diisi ulang di awal tiap siklus 30 hari selama masa paketnya.
    const days = kind === 'imtihan' ? legacyImtihanDays(row.createdAt) : CYCLE_DAYS;
    const end = paid + days * DAY;
    if (end <= start) continue; // sudah habis sebelum model token berlaku
    legacySeen = true;
    if (now >= end) continue;
    const cycle = Math.floor((now - paid) / (CYCLE_DAYS * DAY));
    const cycles = Math.ceil(days / CYCLE_DAYS);
    if (cycle >= 0 && cycle < cycles) {
      add({ ref: `reset:${row.ref}:${cycle + 1}`, amount: cfg.legacy[kind], reason: `reset:${cycle + 1}/${cycles}`, topup: true });
    }
  }
  // Akses AI lama tanpa tagihan (diberi admin / Membership lama): satu kali isi ulang, setara satu bulan.
  if (subActive && !legacySeen) add({ ref: 'legacy:sub', amount: cfg.legacy.monthly, reason: 'reset:1/1', topup: true });
  // Hadiah untuk member Library yang sudah pernah membayar.
  if (paidLibrary && !boughtNew) add({ ref: 'gift:library', amount: cfg.grants.gift, reason: 'gift' });
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
    const [checkouts, groups, ledger, subs, members] = await Promise.all([
      fetch(`${url}/rest/v1/payment_checkouts?member_code=eq.${c}&status=eq.paid&plan=in.(imtihan,rombongan,library_ai,ai,talkhis_1,talkhis_3,token)&paid_at=gte.${since}&select=id,plan,paid_at,created_at,tokens`, h).then(arr),
      fetch(`${url}/rest/v1/group_codes?redeemed_by=eq.${c}&redeemed_at=gte.${since}&select=code,redeemed_at,created_at`, h).then(arr).catch(() => []),
      fetch(`${url}/rest/v1/ai_token_ledger?member_code=eq.${c}&ref=not.is.null&select=ref&limit=1000`, h).then(r => (r.ok ? r.json() : null)),
      // Langganan AI lama yang masih berjalan dan sudah ada sebelum model token (trial kelas tidak dihitung).
      fetch(`${url}/rest/v1/ai_subscriptions?member_code=eq.${c}&status=eq.active&or=(expires_at.is.null,expires_at.gt.${new Date().toISOString()})&select=product_id,updated_at`, h).then(arr).catch(() => []),
      fetch(`${url}/rest/v1/members?code=eq.${c}&select=status,tier,member_type,created_at&limit=1`, h).then(arr).catch(() => []),
    ]);
    if (!ledger) return false; // buku catatan tidak terbaca → jangan memberi apa pun
    const subActive = (Array.isArray(subs) ? subs : []).some(s => s.product_id !== CLASS_TRIAL_PRODUCT && !(Date.parse(s.updated_at || '') >= start));
    const m = Array.isArray(members) ? members[0] : null;
    const paidLibrary = !!m && m.status === 'active' && (m.tier || 'library') !== 'free' && m.member_type !== 'trial'
      && !(Date.parse(m.created_at || '') >= start);
    const rows = [
      ...(Array.isArray(checkouts) ? checkouts : []).map(x => ({ ref: `checkout:${x.id}`, plan: x.plan, paidAt: x.paid_at, createdAt: x.created_at, tokens: Number(x.tokens) || 0 })),
      ...(Array.isArray(groups) ? groups : []).map(g => ({ ref: `group:${g.code}`, plan: 'group', paidAt: g.redeemed_at, createdAt: g.created_at, tokens: 0 })),
    ];
    const have = new Set(ledger.map(r => r.ref));
    const cfg = await getTokenConfig();
    const due = grantsDue(rows, { start, subActive, paidLibrary, have, cfg });
    for (const g of due) {
      if (g.topup) await topupTokens(code, g.amount, g.reason, g.ref);
      else await grantTokens(code, g.amount, g.reason, g.ref);
    }
    ensured.set(code, Date.now());
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

/* Pemberitahuan token untuk akun (hadiah, jatah bulanan, konversi, token gratis, tambahan dari admin), 60 hari terakhir.
   Ditampilkan sekali per ref di browser (lihat TokenNews di ai-partner-shared.jsx). */
const NEWS_REASONS = ['gift', 'free', 'convert', 'admin'];
export const tokenNews = async (code) => {
  try {
    const { url, key } = sbConfig();
    const since = new Date(Date.now() - 60 * DAY).toISOString();
    const r = await fetch(`${url}/rest/v1/ai_token_ledger?member_code=eq.${encodeURIComponent(code)}&delta=gt.0&created_at=gte.${since}&select=id,ref,reason,delta,created_at&order=created_at.desc&limit=10`, { headers: sbHeaders(key) });
    const rows = r.ok ? await r.json() : [];
    return (Array.isArray(rows) ? rows : [])
      .filter(x => NEWS_REASONS.includes(x.reason) || String(x.reason).startsWith('reset:'))
      .map(x => ({ id: x.ref || `ledger:${x.id}`, reason: x.reason, amount: x.delta, at: x.created_at }));
  } catch { return []; }
};
