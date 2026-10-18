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

Aturan soal:
- Setiap soal HARUS bisa dijawab dari isi materi; jangan menanyakan hal di luar materi atau info sampul/halaman.
- Jangan membuat soal "apa poin utama paragraf ini" atau menyalin kalimat materi mentah-mentah sebagai soal.
- 4 pilihan, satu benar. Pengecoh harus masuk akal dan diambil dari konsep lain di materi yang sama (bukan pilihan generik yang bisa dipakai di soal mana pun). Hindari "semua benar"/"semua salah".
- Teks Arab (istilah, contoh, kaidah) tulis dalam huruf Arab, berharakat bila memungkinkan. Bahasa pengantar: Indonesia.
- "level" 1–4: 1 = ta'rif & istilah dasar, 2 = pembagian/syarat/kaidah, 3 = analisis, perbandingan, khilaf, 4 = tathbiq/soal tersulit ala ujian akhir. Sebar merata.
- "explanation": kenapa jawaban itu benar menurut materi (maks 400 karakter). "hint": petunjuk tanpa membocorkan jawaban (maks 160 karakter). "examTip": cara menuliskan jawaban ini di lembar ujian tahriri (maks 220 karakter).

Balas HANYA JSON valid:
{"maddah":"...","summary":[{"heading":"...","arabic":"...","body":"..."}],
 "terms":[{"term":"...","def":"..."}],
 "flashcards":[{"q":"...","a":"..."}],
 "quiz":[{"level":1,"question":"...","options":["...","...","...","..."],"answer":0,"explanation":"...","hint":"...","examTip":"..."}]}
Jumlah: summary 5–6 poin (body maks 450 karakter, arabic boleh kosong), terms 6–8, flashcards 6–8, quiz 12–14.`;

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

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
    .filter(q => str(q?.question, 10) && Array.isArray(q.options) && q.options.length === 4
      && q.options.every(o => str(o, 1)) && new Set(q.options.map(o => str(o, 400))).size === 4
      && Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3)
    .map(q => ({
      level: Math.min(4, Math.max(1, Math.round(Number(q.level)) || 2)),
      question: str(q.question, 700),
      options: q.options.map(o => str(o, 300)),
      answer: q.answer,
      explanation: str(q.explanation, 600),
      hint: str(q.hint, 220),
      examTip: str(q.examTip, 300),
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
