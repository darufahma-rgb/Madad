// Kuota per periode 30 hari langganan AI Partner (lihat quotaPeriod di api/ai-partner.js), diatur admin
// dari Settings tanpa redeploy.
// Tujuannya menahan biaya pemakai paling berat supaya tetap sebanding dengan harga langganan.
import { readSettings } from '../settings.js';

export const QUOTA_KINDS = ['prompt', 'chat', 'generate', 'create', 'analyze', 'grade', 'ocr', 'transcribe', 'live', 'talkhis'];

// Bawaan kalau admin belum mengatur. transcribe & live dalam menit, lainnya jumlah pemakaian.
export const DEFAULT_MONTHLY_LIMITS = {
  prompt: 150, chat: 150, generate: 40, create: 15, analyze: 150, grade: 60, ocr: 60, transcribe: 300,
  /* Live Caption: 5 jam kuliah per periode, juga untuk pemegang Paket Imtihan (lihat monthlyLimitFor di
     api/ai-partner.js). Mode Cepat ±$0,0064/menit → ±$1,9 (±Rp33rb) bila habis; mode Akurat dihitung 4× menit. */
  live: 300,
  talkhis: 6, // muqarrar yang di-talkhis per periode (pemegang Paket Imtihan: tanpa batas bulanan)
};
const MAX_LIMIT = 5000;

// Nilai tersimpan berupa JSON {"prompt":150,…}; jenis yang kosong/tidak valid memakai bawaan. 0 = fitur ditutup.
export const parseMonthlyLimits = (raw) => {
  let obj = {};
  try { obj = typeof raw === 'string' ? JSON.parse(raw || '{}') : (raw || {}); } catch {}
  return Object.fromEntries(QUOTA_KINDS.map(k => {
    const n = Number(obj?.[k]);
    return [k, Number.isInteger(n) && n >= 0 && n <= MAX_LIMIT ? n : DEFAULT_MONTHLY_LIMITS[k]];
  }));
};

let cache = { at: 0, value: null };
const CACHE_MS = 60 * 1000;

export const getMonthlyLimits = async () => {
  if (cache.value && Date.now() - cache.at < CACHE_MS) return cache.value;
  let raw = null;
  try { raw = (await readSettings(['aiMonthlyLimits'])).aiMonthlyLimits; } catch {}
  cache = { at: Date.now(), value: parseMonthlyLimits(raw) };
  return cache.value;
};

/* ── Limit khusus per email (diatur admin) ──
   Disimpan sebagai JSON [{ email, daily: { talkhis: 5, … }, noMonthly: true }]. daily menggantikan batas harian
   bawaan untuk jenis yang diisi; noMonthly = kuota bulanan tidak berlaku untuk email itu. */
export const DAILY_KINDS = ['prompt', 'chat', 'generate', 'create', 'analyze', 'grade', 'ocr', 'transcribe', 'live', 'talkhis'];
const MAX_DAILY = 1000;
export const normEmail = (e) => String(e || '').trim().toLowerCase();

export const parseQuotaOverrides = (raw) => {
  let list = [];
  try { list = typeof raw === 'string' ? JSON.parse(raw || '[]') : (raw || []); } catch {}
  return (Array.isArray(list) ? list : []).map(o => {
    const email = normEmail(o?.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
    const daily = {};
    for (const k of DAILY_KINDS) {
      const n = Number(o?.daily?.[k]);
      if (o?.daily?.[k] !== '' && o?.daily?.[k] != null && Number.isInteger(n) && n >= 0 && n <= MAX_DAILY) daily[k] = n;
    }
    return { email, daily, noMonthly: !!o?.noMonthly };
  }).filter(Boolean).slice(0, 50);
};

let overrideCache = { at: 0, value: null };
export const getQuotaOverride = async (emails) => {
  if (!overrideCache.value || Date.now() - overrideCache.at > CACHE_MS) {
    let raw = null;
    try { raw = (await readSettings(['aiQuotaOverrides'])).aiQuotaOverrides; } catch {}
    overrideCache = { at: Date.now(), value: parseQuotaOverrides(raw) };
  }
  const mine = new Set((emails || []).map(normEmail).filter(Boolean));
  return overrideCache.value.find(o => mine.has(o.email)) || null;
};

// Untuk pesan "kuota habis" setelah getMonthlyLimits() dipanggil di permintaan yang sama.
export const cachedMonthlyLimits = () => cache.value || DEFAULT_MONTHLY_LIMITS;

/* ── Batas harian Live Caption (menit), diatur admin lewat setting aiLiveDailyLimit ──
   Batas harian fitur lain tetap di kode (LIMITS di api/ai-partner.js); Live Caption bisa diatur karena lama kuliah
   per hari berbeda-beda. Kosong/tidak valid → bawaan. 0 = Live Caption ditutup. */
export const DEFAULT_LIVE_DAILY = 120; // 2 jam kuliah
export const MAX_LIVE_DAILY = 1440;
export const parseLiveDaily = (raw) => {
  const n = Number(raw);
  return raw !== '' && raw != null && Number.isInteger(n) && n >= 0 && n <= MAX_LIVE_DAILY ? n : DEFAULT_LIVE_DAILY;
};
let liveDailyCache = { at: 0, value: null };
export const getLiveDailyLimit = async () => {
  if (liveDailyCache.value != null && Date.now() - liveDailyCache.at < CACHE_MS) return liveDailyCache.value;
  let raw = null;
  try { raw = (await readSettings(['aiLiveDailyLimit'])).aiLiveDailyLimit; } catch {}
  liveDailyCache = { at: Date.now(), value: parseLiveDaily(raw) };
  return liveDailyCache.value;
};
export const cachedLiveDailyLimit = () => liveDailyCache.value ?? DEFAULT_LIVE_DAILY;
