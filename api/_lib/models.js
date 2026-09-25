// Model AI per tugas, diatur admin dari Settings (app_settings) tanpa redeploy.
// Kosong/tidak valid → pakai model utama (env AI_PARTNER_MODEL atau default di ai.js).
import { readSettings } from './settings.js';
import { activeModel, transcribeModel } from './ai.js';

export const MODEL_SETTING_KEYS = {
  default:    'aiModelDefault',    // ringkasan, flashcard, kuis, mufradat, peta konsep, soal tahriri
  arabic:     'aiModelArabic',     // terjemah & i'rab, harakat
  grade:      'aiModelGrade',      // penilaian jawaban tahriri
  chat:       'aiModelChat',       // tutor & simulasi syafawi
  transcribe: 'aiModelTranscribe', // transkrip rekaman — harus model yang menerima input audio
};

// Format ID OpenRouter: "vendor/nama-model" (boleh titik, titik dua untuk varian seperti ":free").
export const isValidModelId = (s) =>
  typeof s === 'string' && s.length <= 100 && /^[a-z0-9][\w.-]*\/[\w.:-]+$/i.test(s.trim());

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
    default: base, arabic: pick('arabic') || base, grade: pick('grade') || base, chat: pick('chat') || base,
    // Transkrip tidak ikut model utama: model teks biasa tidak bisa mendengar audio.
    transcribe: pick('transcribe') || transcribeModel(),
  };
  cache = { at: Date.now(), value };
  return value;
};

export const clearModelCache = () => { cache = { at: 0, value: null }; };
