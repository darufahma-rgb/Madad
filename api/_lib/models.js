// Model AI per tugas, diatur admin dari Settings (app_settings) tanpa redeploy.
// Kosong/tidak valid → bawaan tugas itu (TASK_DEFAULTS), atau model utama (env AI_PARTNER_MODEL / default di ai.js).
import { readSettings } from './settings.js';
import { transcribeModel } from './ai.js';

export const MODEL_SETTING_KEYS = {
  default:    'aiModelDefault',    // ringkasan, peta konsep, soal tahriri, Tanya AI (lewat chat) — juga cadangan tugas lain
  study:      'aiModelStudy',      // flashcard, kuis, mufradat — tugas terstruktur, cocok untuk model hemat
  vision:     'aiModelVision',     // baca foto: OCR materi, foto talkhisan & soal — harus model yang menerima gambar
  arabic:     'aiModelArabic',     // terjemah & i'rab, harakat
  grade:      'aiModelGrade',      // penilaian jawaban tahriri
  chat:       'aiModelChat',       // tutor & simulasi syafawi
  prompt:     'aiModelPrompt',     // Tanya AI (tanpa materi) — butuh pengetahuan luas, jadi bawaannya model utama
  transcribe: 'aiModelTranscribe', // transkrip rekaman — harus model yang menerima input audio
};

// Format ID OpenRouter: "vendor/nama-model" (boleh titik, titik dua untuk varian seperti ":free").
export const isValidModelId = (s) =>
  typeof s === 'string' && s.length <= 100 && /^[a-z0-9][\w.-]*\/[\w.:-]+$/i.test(s.trim());

// Bawaan hemat untuk tugas yang tidak butuh model terkuat — menjaga biaya per pelanggan di bawah harga langganan.
/* Pembagian model per tugas (bawaan bila setelan di Admin kosong), dari harga OpenRouter & log pemakaian:
   teks Arab ±1 token per karakter, jadi tugas yang membaca materi panjang (±57rb token) memakai Gemini 2.5
   Flash ($0.30/$2.50 per 1 juta token — ±8× lebih murah dari Sonnet 5). Claude Sonnet 5 hanya untuk tugas
   yang inputnya pendek tapi menuntut ketelitian nahwu-sharaf (i'rab, harakat, penilaian tahriri) — nilai
   jual Talqeeh. Percakapan (tutor & Tanya AI) memakai Haiku 4.5: patuh format & murah, tutor kena cache. */
export const TASK_DEFAULTS = {
  default: 'google/gemini-2.5-flash',     // ringkasan, peta konsep, soal tahriri — membaca materi penuh
  study:   'google/gemini-2.5-flash',     // flashcard/kuis/mufradat — JSON terstruktur dari materi
  vision:  'google/gemini-2.5-flash',     // baca foto: kuat untuk teks Arab
  chat:    'anthropic/claude-haiku-4.5',  // tutor & syafawi: bersandar pada materi, cache prompt kena
  prompt:  'anthropic/claude-haiku-4.5',  // Tanya AI: paling sering dipakai, input pendek
  arabic:  'anthropic/claude-sonnet-5',   // terjemah & i'rab, harakat: ketelitian tertinggi
  grade:   'anthropic/claude-sonnet-5',   // menilai jawaban tahriri & mengoreksi bahasa Arab
};

let cache = { at: 0, value: null };
const CACHE_MS = 60 * 1000;

export const resolveModels = async () => {
  if (cache.value && Date.now() - cache.at < CACHE_MS) return cache.value;
  let saved = {};
  try { saved = await readSettings(Object.values(MODEL_SETTING_KEYS)); } catch {}
  const pick = (task) => {
    const v = saved[MODEL_SETTING_KEYS[task]];
    return isValidModelId(v) ? v.trim() : null;
  };
  // Env AI_PARTNER_MODEL (kalau diisi di Vercel) menggantikan bawaan "model utama".
  const base = pick('default') || process.env.AI_PARTNER_MODEL || TASK_DEFAULTS.default;
  const value = {
    default: base,
    arabic: pick('arabic') || TASK_DEFAULTS.arabic, grade: pick('grade') || TASK_DEFAULTS.grade,
    chat: pick('chat') || TASK_DEFAULTS.chat, prompt: pick('prompt') || TASK_DEFAULTS.prompt,
    study: pick('study') || TASK_DEFAULTS.study, vision: pick('vision') || TASK_DEFAULTS.vision,
    // Transkrip tidak ikut model utama: model teks biasa tidak bisa mendengar audio.
    transcribe: pick('transcribe') || transcribeModel(),
  };
  cache = { at: Date.now(), value };
  return value;
};

export const clearModelCache = () => { cache = { at: 0, value: null }; };
