// Kuota bulanan pelanggan AI Partner (direset tiap tanggal 1, UTC), diatur admin dari Settings tanpa redeploy.
// Tujuannya menahan biaya pemakai paling berat supaya tetap sebanding dengan harga langganan.
import { readSettings } from '../settings.js';

export const QUOTA_KINDS = ['prompt', 'chat', 'generate', 'create', 'analyze', 'grade', 'ocr', 'transcribe'];

// Bawaan kalau admin belum mengatur. transcribe dalam menit, lainnya jumlah pemakaian.
export const DEFAULT_MONTHLY_LIMITS = {
  prompt: 150, chat: 150, generate: 40, create: 15, analyze: 150, grade: 60, ocr: 60, transcribe: 300,
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

// Untuk pesan "kuota habis" setelah getMonthlyLimits() dipanggil di permintaan yang sama.
export const cachedMonthlyLimits = () => cache.value || DEFAULT_MONTHLY_LIMITS;
