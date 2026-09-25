// Model AI per tugas, diatur admin dari Settings (app_settings) tanpa redeploy.
// Kosong/tidak valid → bawaan tugas itu (TASK_DEFAULTS), atau model utama (env AI_PARTNER_MODEL / default di ai.js).
import { readSettings } from './settings.js';
import { activeModel, transcribeModel } from './ai.js';

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
export const TASK_DEFAULTS = {
  study:  'anthropic/claude-haiku-4.5',  // flashcard/kuis/mufradat: JSON terstruktur dari materi
  vision: 'google/gemini-2.5-flash',     // baca foto: kuat untuk teks Arab, ±10× lebih murah dari Sonnet
  chat:   'anthropic/claude-haiku-4.5',  // tutor & syafawi: jawabannya bersandar pada materi yang diunggah
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
  const base = pick('default') || activeModel();
  const value = {
    default: base, arabic: pick('arabic') || base, grade: pick('grade') || base,
    chat: pick('chat') || TASK_DEFAULTS.chat, prompt: pick('prompt') || base,
    study: pick('study') || TASK_DEFAULTS.study, vision: pick('vision') || TASK_DEFAULTS.vision,
    // Transkrip tidak ikut model utama: model teks biasa tidak bisa mendengar audio.
    transcribe: pick('transcribe') || transcribeModel(),
  };
  cache = { at: Date.now(), value };
  return value;
};

export const clearModelCache = () => { cache = { at: 0, value: null }; };
