/* Soal & intisari Arena Imtihan untuk muqarrar yang diunggah sendiri (halaman /battle).
   Dulu soalnya dibuat di browser dari kalimat pertama tiap paragraf — sering mengambil sampul, muqaddimah, atau
   daftar isi, dan pertanyaannya tidak seperti soal ujian. Sekarang AI membaca cuplikan merata dari seluruh materi
   lalu menyusun intisari bahasan dan soal pilihan ganda bergaya imtihan Al-Azhar.

   Akses: member paket Library ke atas. Kuota harian sendiri ("battle_quiz"): satu kali per muqarrar yang diunggah. */
import { callAIJson } from '../ai.js';
import { resolveModels } from '../models.js';
import { consumeQuota, sbConfig, sbHeaders } from '../member.js';
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
- Panjang dan tingkat rincian keempat pilihan (juga terjemahnya) harus setara — jangan membuat jawaban benar paling panjang atau paling lengkap.
- 4 pilihan, satu benar. Pengecoh harus masuk akal dan diambil dari konsep lain di materi yang sama (bukan pilihan generik yang bisa dipakai di soal mana pun). Hindari "semua benar"/"semua salah".
- "explanation" dan "hint" dalam bahasa Indonesia (istilah Arab boleh huruf Arab).
- Tingkat kesulitan HARUS terasa naik ("level" 1–4), seperti tangga persiapan imtihan:
  1 (Mubtadi'): ta'rif lughatan/ishthilahan, istilah kunci, hukum asal. Pengecoh: istilah lain dari bab yang sama.
  2 (Mutawassith): pembagian (aqsam), syarat & rukun, kaidah pokok, contoh standar dari materi. Pengecoh: anggota pembagian yang bersebelahan.
  3 (Mutaqaddim): al-farq bayna dua istilah, khilaf ulama beserta ta'lil/dalilnya, mengenali kaidah pada contoh. Pengecoh SANGAT mirip — beda satu syarat atau satu qayd.
  4 (Ujian akhir): tathbiq kaidah pada contoh BARU yang tidak ada di materi, gabungan dua kaidah, soal «mana yang TIDAK…», atau i'rab/hukum lengkap beserta alasannya — persis tipe soal utama di kurrasah imtihan. Semua pengecoh harus masuk akal bagi mahasiswa yang belajar setengah-setengah.
- Pilih soal yang benar-benar membantu lulus imtihan: bab dan kaidah yang paling sering keluar, bukan detail remeh.
- Jika diberikan CONTOH LEMBAR SOAL IMTIHAN ASLI dari bank soal: tiru gaya kalimat perintahnya (عرِّف، اذكر، بيِّن، علِّل، وضِّح مع التمثيل، أعرب، ما الفرق بين، ما حكم … مع الدليل) dan prioritaskan bab/poin yang pernah keluar di sana selama poin itu ada di MATERI. Soal esai diubah menjadi pilihan ganda yang menguji poin yang sama. Jangan menyalin soal yang tidak bisa dijawab dari materi.
- "explanation": kenapa jawaban itu benar menurut materi (maks 400 karakter). "hint": petunjuk tanpa membocorkan jawaban (maks 160 karakter).
- "examTip": jawaban versi lembar ujian tahriri dalam bahasa Arab fushah yang mudah dihafal (1–2 kalimat, maks 220 karakter); "examTipTranslation": terjemah Indonesianya.

Balas HANYA JSON valid:
{"maddah":"...","summary":[{"heading":"...","arabic":"...","body":"..."}],
 "terms":[{"term":"...","def":"..."}],
 "flashcards":[{"q":"...","a":"..."}],
 "quiz":[{"level":1,"question":"(Arab)","questionTranslation":"...","options":[{"ar":"...","id":"..."},{"ar":"...","id":"..."},{"ar":"...","id":"..."},{"ar":"...","id":"..."}],"answer":0,"explanation":"...","hint":"...","examTip":"(Arab)","examTipTranslation":"..."}]}
Jumlah: summary 5–6 poin (body maks 450 karakter, arabic boleh kosong), terms 6–8, flashcards 6–8, quiz 20–24 dengan 5–6 soal untuk SETIAP level 1, 2, 3, dan 4.`;

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/* ── Referensi dari bank soal ──
   Lembar soal imtihan asli (tabel bank_soal, status approved) dengan nama maddah paling cocok dengan judul/isi
   materi dikirim ke AI sebagai contoh gaya & bab yang sering keluar. Daftar disimpan 10 menit per instance. */
const BANK_TTL_MS = 10 * 60 * 1000;
let bankCache = { at: 0, rows: [] };
const words = (t) => new Set(String(t || '').toLowerCase().normalize('NFKD').replace(/[ً-ْ]/g, '')
  .replace(/[^a-zء-ي0-9]+/g, ' ').split(' ').filter(w => w.length >= 3 && !['dan', 'fiqh', 'the', 'kitab', 'untuk'].includes(w)));

async function bankRows() {
  if (Date.now() - bankCache.at < BANK_TTL_MS) return bankCache.rows;
  try {
    const { url, key } = sbConfig();
    const r = await fetch(`${url}/rest/v1/bank_soal?status=eq.approved&select=maddah_nama,tahun,soal&order=approved_at.desc&limit=300`, { headers: sbHeaders(key) });
    const rows = r.ok ? (await r.json()).filter(x => str(x?.soal, 40).length >= 40) : [];
    // Hasil kosong tidak disimpan, supaya soal yang baru disetujui langsung terpakai.
    bankCache = { at: rows.length ? Date.now() : 0, rows };
  } catch {
    bankCache = { at: Date.now() - BANK_TTL_MS + 60000, rows: bankCache.rows };
  }
  return bankCache.rows;
}

// Dua lembar soal paling cocok (nama maddah vs judul + awal materi); kosong kalau tidak ada yang mirip.
export async function pickBankReferences(title, text, limit = 2) {
  const rows = await bankRows();
  if (!rows.length) return [];
  const target = words(`${title} ${String(text).slice(0, 3000)}`);
  const scored = rows.map(row => {
    const name = [...words(row.maddah_nama)];
    const hit = name.filter(w => target.has(w)).length;
    return { row, score: name.length ? hit / name.length : 0 };
  }).filter(x => x.score >= 0.5).sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(({ row }) => ({ maddah: str(row.maddah_nama, 120), tahun: str(row.tahun, 20), soal: str(row.soal, 1500) }));
}

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
    .slice(0, 26);
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
  const refs = await pickBankReferences(title, text).catch(() => []);
  const refBlock = refs.length
    ? `CONTOH LEMBAR SOAL IMTIHAN ASLI (bank soal Talqeeh) — untuk gaya soal & bab yang sering keluar:\n${refs.map((r, i) => `[${i + 1}] ${r.maddah}${r.tahun ? ` (${r.tahun})` : ''}:\n${r.soal}`).join('\n\n')}\n\n`
    : '';
  const model = (await resolveModels()).study;
  const data = clean(await callAIJson({
    system: SYSTEM,
    messages: [{ role: 'user', content: `${title ? `Judul file: ${title}\n\n` : ''}${refBlock}MATERI (cuplikan merata; bagian yang dilewati ditandai […]):\n${spreadSample(text, SAMPLE_CHARS, 4000)}` }],
    maxTokens: 16000,
    temperature: 0.4,
    model,
  }));
  if (!data) throw new Error('AI gagal menyusun soal dari materi ini');
  return res.status(200).json({ ok: true, data: { ...data, bankRefs: refs.length }, model });
}
