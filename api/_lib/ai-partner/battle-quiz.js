/* Soal & intisari Arena Imtihan untuk muqarrar yang diunggah sendiri (halaman /battle).
   Dulu soalnya dibuat di browser dari kalimat pertama tiap paragraf — sering mengambil sampul, muqaddimah, atau
   daftar isi, dan pertanyaannya tidak seperti soal ujian. Sekarang AI membaca cuplikan merata dari seluruh materi
   lalu menyusun intisari bahasan dan soal pilihan ganda bergaya imtihan Al-Azhar.

   Akses: member paket Library ke atas. Kuota harian sendiri ("battle_quiz"): satu kali per muqarrar yang diunggah. */
import { callAIJson } from '../ai.js';
import { resolveModels } from '../models.js';
import { consumeQuota } from '../member.js';
import { spreadSample } from './chunks.js';
import { shuffleQuizOptions } from './sanitize.js';

const DAILY_LIMIT = { pro: 10, trial: 3 };
const SAMPLE_CHARS = 24000;
const MAX_INPUT = 200000;

const SYSTEM = `Kamu penguji (mushahhih) ujian Universitas Al-Azhar yang menyusun latihan imtihan dari muqarrar mahasiswa Indonesia.
Kamu menerima cuplikan merata dari satu muqarrar (bisa berisi sisa sampul, muqaddimah, daftar isi, nomor halaman, atau teks OCR yang kurang rapi).

Langkah:
1. Kenali maddah dan bab-bab inti muqarrar. ABAIKAN sampul, identitas penulis/kampus, muqaddimah umum, daftar isi, ucapan terima kasih, dan nomor halaman.
2. Tulis intisari pembahasan: poin-poin inti yang benar-benar diajarkan (ta'rif, pembagian/taqsimat, syarat & rukun, hukum dan dalilnya, khilaf & tarjih, contoh/tathbiq, kaidah).
3. Susun soal yang biasa keluar di imtihan Al-Azhar untuk bab-bab itu: ta'rif istilah, menyebut aqsam/syarat, membedakan dua istilah (al-farq), menentukan hukum/kaidah pada contoh, siapa yang berpendapat apa dan alasannya, tathbiq kaidah pada contoh baru, dan (untuk nahwu/sharf/balaghah) menentukan i'rab atau jenis uslub pada contoh.

Aturan soal (format seperti lembar soal imtihan Al-Azhar di bank soal):
- Soal ditulis dalam bahasa Arab fushah ala lembar ujian (mis. «ما تعريفُ الفاعلِ اصطلاحًا؟»، «بِمَ يُعرَبُ ما تحته خطٌّ في قوله...؟»، «ما الفرقُ بين...؟»), kalimat pendek dan jelas, harakat pada istilah kunci, contoh, ayat, dan kata yang rawan salah baca. "questionTranslation" = terjemah Indonesia yang natural (bukan kata per kata).
- Tiap pilihan berupa objek {"ar":"...","id":"..."}: "ar" bahasa Arab singkat (maks 120 karakter), "id" artinya dalam bahasa Indonesia singkat TANPA tanda kurung.
- Setiap soal HARUS bisa dijawab dari isi materi; jangan menanyakan hal di luar materi atau info sampul/halaman.
- Jangan membuat soal "apa poin utama paragraf ini" atau menyalin kalimat materi mentah-mentah sebagai soal.
- 4 pilihan, satu benar. Pengecoh harus masuk akal dan diambil dari konsep lain di materi yang sama (bukan pilihan generik yang bisa dipakai di soal mana pun). Hindari "semua benar"/"semua salah".
- "explanation" dan "hint" dalam bahasa Indonesia (istilah Arab boleh huruf Arab).
- "level" 1–4: 1 = ta'rif & istilah dasar, 2 = pembagian/syarat/kaidah, 3 = analisis, perbandingan, khilaf, 4 = tathbiq/soal tersulit ala ujian akhir. Sebar merata.
- "explanation": kenapa jawaban itu benar menurut materi (maks 400 karakter). "hint": petunjuk tanpa membocorkan jawaban (maks 160 karakter).
- "examTip": jawaban versi lembar ujian tahriri dalam bahasa Arab fushah yang mudah dihafal (1–2 kalimat, maks 220 karakter); "examTipTranslation": terjemah Indonesianya.

Balas HANYA JSON valid:
{"maddah":"...","summary":[{"heading":"...","arabic":"...","body":"..."}],
 "terms":[{"term":"...","def":"..."}],
 "flashcards":[{"q":"...","a":"..."}],
 "quiz":[{"level":1,"question":"(Arab)","questionTranslation":"...","options":[{"ar":"...","id":"..."},{"ar":"...","id":"..."},{"ar":"...","id":"..."},{"ar":"...","id":"..."}],"answer":0,"explanation":"...","hint":"...","examTip":"(Arab)","examTipTranslation":"..."}]}
Jumlah: summary 5–6 poin (body maks 450 karakter, arabic boleh kosong), terms 6–8, flashcards 6–8, quiz 12–14.`;

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/* Pilihan {ar, id} → "عربي (arti)": game menampilkan bagian dalam kurung terakhir sebagai label "arti" kecil
   (parseOptionTranslation di battle-page.jsx), jadi kurung di dalam arti dibuang supaya tidak terpotong. */
const optionText = (o) => {
  if (typeof o === 'string') return str(o, 300);
  const ar = str(o?.ar, 200);
  const id = str(o?.id, 160).replace(/[()]/g, '').replace(/\s+/g, ' ').trim();
  if (!ar) return id;
  return id ? `${ar} (${id})` : ar;
};

const clean = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const summary = (Array.isArray(raw.summary) ? raw.summary : [])
    .map(s => ({ heading: str(s?.heading, 120), arabic: str(s?.arabic, 300), body: str(s?.body, 600) }))
    .filter(s => s.heading && s.body).slice(0, 8);
  const terms = (Array.isArray(raw.terms) ? raw.terms : [])
    .map(t => ({ term: str(t?.term, 80), def: str(t?.def, 260) }))
    .filter(t => t.term && t.def).slice(0, 10);
  const flashcards = (Array.isArray(raw.flashcards) ? raw.flashcards : [])
    .map(f => ({ q: str(f?.q, 300), a: str(f?.a, 500) }))
    .filter(f => f.q && f.a).slice(0, 10);
  const quiz = (Array.isArray(raw.quiz) ? raw.quiz : [])
    .map(q => ({ ...q, options: Array.isArray(q?.options) ? q.options.map(optionText) : [] }))
    .filter(q => str(q?.question, 10) && q.options.length === 4 && q.options.every(Boolean)
      && new Set(q.options).size === 4 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3)
    .map(q => ({
      level: Math.min(4, Math.max(1, Math.round(Number(q.level)) || 2)),
      question: str(q.question, 700),
      questionTranslation: str(q.questionTranslation, 700),
      options: q.options,
      answer: q.answer,
      explanation: str(q.explanation, 600),
      hint: str(q.hint, 220),
      examTip: str(q.examTip, 300),
      examTipTranslation: str(q.examTipTranslation, 400),
    }))
    .slice(0, 16);
  if (quiz.length < 6) return null;
  return { maddah: str(raw.maddah, 120), summary, terms, flashcards, quiz: shuffleQuizOptions(quiz) };
};

export async function handleBattleQuiz(ctx, body, res, { upgradeRequired }) {
  if (ctx.memberTier === 'free') {
    return upgradeRequired(res, 'battle_quiz', 'Soal AI dari muqarrar sendiri khusus member paket Library ke atas.');
  }
  const text = str(body?.text, MAX_INPUT);
  if (text.length < 300) return res.status(400).json({ ok: false, error: 'Materi terlalu sedikit untuk dibuatkan soal.' });

  const limit = DAILY_LIMIT[ctx.tier] ?? DAILY_LIMIT.trial;
  if (!(await consumeQuota(ctx.code, 'battle_quiz', limit))) {
    return res.status(429).json({ ok: false, error: 'quota', message: `Jatah ${limit} muqarrar per hari untuk soal AI sudah terpakai. Coba lagi besok.` });
  }

  const title = str(body?.title, 160);
  const model = (await resolveModels()).study;
  const data = clean(await callAIJson({
    system: SYSTEM,
    messages: [{ role: 'user', content: `${title ? `Judul file: ${title}\n\n` : ''}MATERI (cuplikan merata; bagian yang dilewati ditandai […]):\n${spreadSample(text, SAMPLE_CHARS, 4000)}` }],
    maxTokens: 9000,
    temperature: 0.4,
    model,
  }));
  if (!data) throw new Error('AI gagal menyusun soal dari materi ini');
  return res.status(200).json({ ok: true, data, model });
}
