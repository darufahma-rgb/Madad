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
  /* Paket token. Pembeli yang belum punya Library otomatis mendapat Library selamanya.
     tokens = token bulan pertama (langsung ditambahkan ke saldo). months > 1 = tiap 30 hari berikutnya saldo diisi ulang
     sampai `refill` (tidak menumpuk; token yang dibeli sendiri tidak terhapus), sampai bulan ke-`months`.
     months 1 = sekali, tanpa isi ulang. */
  packs: [
    { id: 't100', name: "Paket Muraja'ah", price: 100000, tokens: 35000, months: 1, refill: 0 },
    { id: 't199', name: 'Paket Imtihan', price: 199000, tokens: 75000, months: 2, refill: 35000 },
  ],
  // Tambahan token (add-on): paket kecil untuk member yang SUDAH punya Library, tanpa Library di dalamnya.
  // Per token sengaja sedikit lebih mahal daripada paket besar supaya paket besar tetap paling hemat.
  addons: [
    { id: 'a25', name: 'Tambahan Kecil', price: 25000, tokens: 7500 },
    { id: 'a50', name: 'Tambahan Besar', price: 50000, tokens: 16000 },
  ],
  // Nama penawaran "gratis" di halaman Paket.
  freeName: 'Coba Gratis',
  /* imtihan/imtihanMonths/imtihanRefill: Paket Imtihan lewat plan 'imtihan' (harga kupon/mitra/kekeluargaan/rombongan
     tetap berlaku) = Library + token bulan pertama, lalu isi ulang bulanan, sama dengan paket t199.
     free: token gratis sekali per akun. */
  grants: { imtihan: 75000, imtihanMonths: 2, imtihanRefill: 35000, free: 1000, gift: 5000 },
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
// Token gratis (1.000) kira-kira cukup untuk 1 ringkasan dan beberapa pesan tutor.
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
  const name = (v, fallback) => String(v ?? '').replace(/[<>]/g, '').trim().slice(0, 40) || fallback;
  const list = (raw, max, withMonths) => (Array.isArray(raw) ? raw : []).map((p, i) => {
    const label = withMonths ? 'Paket' : 'Tambahan';
    const tokens = int(p?.tokens, 1, 10000000), price = int(p?.price, 5000, 5000000);
    const id = String(p?.id || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
    if (!(tokens && price && id)) return null;
    const known = [...d.packs, ...d.addons].find(x => x.id === id);
    const item = { id, name: name(p?.name, known?.name || `${label} ${i + 1}`), price, tokens };
    if (!withMonths) return item;
    const months = int(p?.months, 1, 12) ?? known?.months ?? 1;
    return { ...item, months, refill: months > 1 ? (int(p?.refill, 0, 10000000) ?? known?.refill ?? tokens) : 0 };
  }).filter(Boolean).slice(0, max);
  const packs = list(o?.packs, 4, true);
  // addons: [] di setting = add-on dimatikan; tidak ada di setting = bawaan. Id tidak boleh sama dengan paket utama.
  const addons = Array.isArray(o?.addons) ? list(o.addons, 4, false) : d.addons;
  const packIds = new Set((packs.length ? packs : d.packs).map(p => p.id));
  return { usdRate: int(o?.usdRate, 1000, 100000) ?? d.usdRate, packs: packs.length ? packs : d.packs,
    addons: addons.filter(a => !packIds.has(a.id)),
    freeName: name(o?.freeName, d.freeName),
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

// Token paling banyak dari sebuah paket: bulan pertama + isi ulang di bulan-bulan berikutnya.
export const packTotal = (p) => (Number(p?.tokens) || 0) + Math.max(0, (Number(p?.months) || 1) - 1) * (Number(p?.refill) || 0);

/* Jatah bulanan sebuah tagihan, atau null kalau tagihan itu bukan paket bulanan:
   { first, refill, months, paid, legacy } — legacy = dibayar sebelum model token (semua bulan diisi ulang sampai
   `refill`); selain itu paket bulanan baru (bulan pertama `first` ditambahkan, bulan berikutnya diisi ulang). */
const monthlyPlanOf = (row, { start, cfg, have = new Set() }) => {
  const paid = Date.parse(row.paidAt || '');
  if (!Number.isFinite(paid)) return null;
  const kind = PLAN_KIND[row.plan];
  if (paid < start) {
    if (kind !== 'imtihan' && kind !== 'monthly') return null;
    const days = kind === 'imtihan' ? legacyImtihanDays(row.createdAt) : CYCLE_DAYS;
    if (paid + days * DAY <= start) return null; // sudah habis sebelum model token berlaku
    return { first: cfg.legacy[kind], refill: cfg.legacy[kind], months: Math.ceil(days / CYCLE_DAYS), paid, legacy: true };
  }
  if (row.plan === 'token') {
    const months = Math.max(1, Number(row.months) || 1);
    return months > 1 ? { first: Number(row.tokens) || 0, refill: Number(row.refill) || 0, months, paid, legacy: false } : null;
  }
  if (kind === 'imtihan') {
    const months = Math.max(1, Number(row.months) || Number(cfg.grants.imtihanMonths) || 1);
    const first = Number(row.tokens) || cfg.grants.imtihan;
    const refill = row.refill != null ? Number(row.refill) || 0 : cfg.grants.imtihanRefill;
    return months > 1 ? { first, refill, months, paid, legacy: false } : null;
  }
  return null;
};

/* Murni (dites). rows: [{ ref, plan, paidAt, createdAt, tokens, months }]; have: Set ref yang sudah tercatat.
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
    const kind = PLAN_KIND[row.plan];
    const m = monthlyPlanOf(row, { start, cfg, have });
    if (m) {
      if (m.legacy) legacySeen = true;
      const cycle = Math.floor((now - m.paid) / (CYCLE_DAYS * DAY));
      if (cycle < 0 || cycle >= m.months) continue;
      if (m.legacy) {
        // Member lama: tiap bulan saldo dinaikkan sampai jatah bulanan (mis. Paket Imtihan lama 4 bulan → 4×).
        const days = kind === 'imtihan' ? legacyImtihanDays(row.createdAt) : CYCLE_DAYS;
        if (now >= m.paid + days * DAY) continue;
        add({ ref: `reset:${row.ref}:${cycle + 1}`, amount: m.refill, reason: `reset:${cycle + 1}/${m.months}`, topup: true });
      } else if (cycle === 0) {
        // Paket bulanan baru, bulan pertama: token ditambahkan ke saldo. Pembeli Paket Imtihan yang sudah menerima
        // tokennya sekaligus (ref tagihan, sebelum ada isi ulang bulanan) tidak diberi lagi.
        if (!have.has(row.ref)) add({ ref: `month:${row.ref}:1`, amount: m.first, reason: `buy`, });
      } else {
        // Bulan berikutnya: saldo dinaikkan sampai jatah isi ulang (tidak menumpuk).
        add({ ref: `month:${row.ref}:${cycle + 1}`, amount: m.refill, reason: `month:${cycle + 1}/${m.months}`, topup: true });
      }
      continue;
    }
    if (row.plan === 'token') { add({ ref: row.ref, amount: row.tokens, reason: 'buy' }); continue; }
    if (!kind) continue;
    if (paid >= start) {
      // Dibayar setelah model token berlaku: Paket Imtihan sekaligus (kalau diatur 1 bulan); paket lama yang telat lunas dikonversi.
      if (kind === 'imtihan') { if (!have.has(row.ref)) add({ ref: row.ref, amount: Number(row.tokens) || cfg.grants.imtihan, reason: 'buy' }); }
      else add({ ref: row.ref, amount: cfg.convert[kind], reason: 'convert' });
      continue;
    }
    if (kind === 'talkhis_1' || kind === 'talkhis_3') add({ ref: row.ref, amount: cfg.convert[kind], reason: 'convert' });
  }
  // Akses AI lama tanpa tagihan (diberi admin / Membership lama): satu kali isi ulang, setara satu bulan.
  if (subActive && !legacySeen) add({ ref: 'legacy:sub', amount: cfg.legacy.monthly, reason: 'reset:1/1', topup: true });
  // Hadiah untuk member Library yang sudah pernah membayar.
  if (paidLibrary && !boughtNew) add({ ref: 'gift:library', amount: cfg.grants.gift, reason: 'gift' });
  return due;
};

/* Jadwal isi ulang bulanan (member lama dan paket bulanan baru), untuk ditampilkan (panel admin). Murni (dites).
   Mengembalikan paket bulanan yang masih berjalan dan paling lama berakhir:
   { target, cycle, cycles, cycleStart, nextResetAt (null = bulan terakhir), endsAt, legacy }, atau null. */
export const legacySchedule = (rows, { start, now = Date.now(), cfg = DEFAULT_TOKENS, have = new Set() }) => {
  let best = null;
  for (const row of rows) {
    const m = monthlyPlanOf(row, { start, cfg, have });
    if (!m) continue;
    const days = m.legacy && PLAN_KIND[row.plan] === 'imtihan' ? legacyImtihanDays(row.createdAt) : m.months * CYCLE_DAYS;
    const end = m.paid + days * DAY;
    if (end <= now) continue;
    const cycle = Math.floor((now - m.paid) / (CYCLE_DAYS * DAY));
    const next = m.paid + (cycle + 1) * CYCLE_DAYS * DAY;
    const item = {
      target: m.refill, first: m.first, cycle: cycle + 1, cycles: m.months, legacy: m.legacy,
      cycleStart: new Date(m.paid + cycle * CYCLE_DAYS * DAY).toISOString(),
      nextResetAt: cycle + 1 < m.months && next < end ? new Date(next).toISOString() : null,
      endsAt: new Date(end).toISOString(),
    };
    if (!best || Date.parse(item.endsAt) > Date.parse(best.endsAt)) best = item;
  }
  return best;
};

/* Jadwal isi ulang semua member sekaligus (panel admin): { [member_code]: legacySchedule }. */
export const legacySchedules = async () => {
  const start = await tokensStart();
  if (start == null) return {};
  const { url, key } = sbConfig();
  const h = { headers: sbHeaders(key) };
  const from = new Date(Date.now() - LOOKBACK_DAYS * DAY).toISOString();
  const page = async (q) => {
    const out = [];
    for (let offset = 0; offset < 20000; offset += 1000) {
      const r = await fetch(`${url}/rest/v1/${q}&limit=1000&offset=${offset}`, h);
      if (r.status === 400 && offset === 0) return null; // kolom belum ada
      const rows = r.ok ? await r.json() : [];
      if (!Array.isArray(rows) || !rows.length) break;
      out.push(...rows);
      if (rows.length < 1000) break;
    }
    return out;
  };
  const q = (fields) => `payment_checkouts?status=eq.paid&plan=in.(imtihan,rombongan,library_ai,ai,token)&paid_at=gte.${from}&select=${fields}`;
  const [checkouts, groups, cfg] = await Promise.all([
    page(q('id,member_code,plan,paid_at,created_at,tokens,token_months,token_refill')).then(r => r ?? page(q('id,member_code,plan,paid_at,created_at,tokens'))),
    page(`group_codes?redeemed_by=not.is.null&redeemed_at=gte.${from}&select=code,redeemed_by,redeemed_at,created_at`).catch(() => []),
    getTokenConfig(),
  ]);
  const byCode = {};
  for (const x of checkouts || []) if (x.member_code) (byCode[x.member_code] ||= []).push({ ref: `checkout:${x.id}`, plan: x.plan, paidAt: x.paid_at, createdAt: x.created_at, tokens: Number(x.tokens) || 0, months: x.token_months, refill: x.token_refill });
  for (const g of groups || []) (byCode[g.redeemed_by] ||= []).push({ ref: `group:${g.code}`, plan: 'group', paidAt: g.redeemed_at, createdAt: g.created_at, tokens: 0 });
  const out = {};
  for (const [code, rows] of Object.entries(byCode)) {
    const s = legacySchedule(rows, { start, cfg });
    if (s) out[code] = s;
  }
  return out;
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
      (async () => {
        const q = (f) => fetch(`${url}/rest/v1/payment_checkouts?member_code=eq.${c}&status=eq.paid&plan=in.(imtihan,rombongan,library_ai,ai,talkhis_1,talkhis_3,token)&paid_at=gte.${since}&select=${f}`, h);
        let r = await q('id,plan,paid_at,created_at,tokens,token_months,token_refill');
        if (r.status === 400) r = await q('id,plan,paid_at,created_at,tokens'); // kolom token_months belum ada
        return r.ok ? r.json() : [];
      })(),
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
      ...(Array.isArray(checkouts) ? checkouts : []).map(x => ({ ref: `checkout:${x.id}`, plan: x.plan, paidAt: x.paid_at, createdAt: x.created_at, tokens: Number(x.tokens) || 0, months: x.token_months, refill: x.token_refill })),
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
      .filter(x => NEWS_REASONS.includes(x.reason) || String(x.reason).startsWith('reset:') || String(x.reason).startsWith('month:'))
      .map(x => ({ id: x.ref || `ledger:${x.id}`, reason: x.reason, amount: x.delta, at: x.created_at }));
  } catch { return []; }
};
