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
  liveHear:   'aiModelLiveHear',   // Live Caption tahap dengar — model audio, utamakan cepat & akurat
  liveHearAccurate: 'aiModelLiveHearAccurate', // Live Caption mode "Akurat" (kelas ramai) — model audio terkuat
  liveTranslate: 'aiModelLiveTranslate', // Live Caption tahap terjemah — teks saja, utamakan cepat & pintar
  liveTranslateAccurate: 'aiModelLiveTranslateAccurate', // terjemah mode "Akurat" — utamakan teliti
  liveTalkhis: 'aiModelLiveTalkhis',     // talkhisan kuliah dari transkrip Live Caption
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
  /* Live Caption, dari benchmark audio kuliah Arab (10 potongan fushah/'ammiyah + derau, Okt 2026):
     dengar — Gemini 3.1 Flash-Lite: salah dengar 0,9%, median 1,4 dtk, aman di derau (2.5 Flash: 1,4% / 2,9 dtk;
     Gemini 4 Argon 0,5% tapi 3,8 dtk; Gemini 3 Flash Preview mengarang ucapan dari derau).
     terjemah — Gemini 3.1 Flash-Lite: biaya per menit kuliah ±$0,0064 (dengar + terjemah) vs ±$0,016 dengan 3.7 Flash,
     mutu hampir sama (nama salah dengar 24/26 vs 25/26; kelas bising 33/37 vs 35/37). Diganti demi harga paket;
     mode "Akurat" tetap memakai 3.7 Flash (liveTranslateAccurate) untuk hasil terbaik.
     talkhisan kuliah — Gemini 3.7 Flash: sekali per kuliah, rapi & setia isi (2.5 Flash bisa berputar-putar). */
  liveHear:      'google/gemini-3.1-flash-lite',
  liveTranslate: 'google/gemini-3.1-flash-lite',
  liveTranslateAccurate: 'google/gemini-3.7-flash',
  liveTalkhis:   'google/gemini-3.7-flash',
  /* Mode "Akurat" untuk kelas ramai — di audio bergema + derau (SNR 8 dB): Gemini 4 Argon salah dengar 7,2% & semua
     13 nama kitab/ulama benar (Flash-Lite 15,2%, 11/13); hasil akhir setelah terjemah 37/37 vs 35/37. ±3,9 dtk. */
  liveHearAccurate: 'google/gemini-4-argon',
};

/* Jatah token berpikir untuk tugas yang inputnya pendek tapi menuntut ketelitian nahwu-sharaf. Sonnet 5 bawaannya
   berpikir singkat (±1.000 token); jatah ini menambah ruang mengecek 'amil dan kedudukan tiap kata dengan biaya
   kecil (±$0,01–0,02 per klik), tapi tetap terukur supaya selesai sebelum batas 60 detik. */
export const TASK_THINKING = { arabic: 1536, grade: 2048 };

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
    liveHear: pick('liveHear') || TASK_DEFAULTS.liveHear,
    liveHearAccurate: pick('liveHearAccurate') || TASK_DEFAULTS.liveHearAccurate,
    liveTranslate: pick('liveTranslate') || TASK_DEFAULTS.liveTranslate,
    liveTranslateAccurate: pick('liveTranslateAccurate') || TASK_DEFAULTS.liveTranslateAccurate,
    liveTalkhis: pick('liveTalkhis') || TASK_DEFAULTS.liveTalkhis,
  };
  cache = { at: Date.now(), value };
  return value;
};

export const clearModelCache = () => { cache = { at: 0, value: null }; };
