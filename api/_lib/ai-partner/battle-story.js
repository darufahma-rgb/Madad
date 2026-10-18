/* Cerita Arena Imtihan (halaman /battle) yang ditulis AI sesuai maddah yang sedang dipelajari:
   prolog 4–6 dialog + nama, lokasi, dan lore 4 level penjaga. Mekanik (HP, soal, rank) tetap dari klien;
   AI hanya mengisi narasi, jadi balasannya kecil dan murah (model "study", ±1–2 rb token keluar).

   Akses: member aktif yang bukan akun gratis (paket Library ke atas). Kuota harian terpisah ("battle_story")
   supaya tidak memakan jatah fitur belajar. */
import { callAI, callAIJson } from '../ai.js';
import { resolveModels } from '../models.js';
import { consumeQuota } from '../member.js';

const DAILY_LIMIT = { pro: 15, trial: 6 };
const MAX_MATERIAL = 5000;
const STAGE_COUNT = 4;

const SYSTEM = `Kamu penulis cerita game edukasi "Arena Imtihan" di Talqeeh, aplikasi belajar mahasiswa Indonesia di Al-Azhar Kairo.
Pemain adalah "Thalib Azhar" yang menempuh 4 level imtihan; tiap level dijaga seorang penguji (guardian), level 4 adalah final boss (seorang 'allamah).
Tulis cerita yang SESUAI ISI MATERI yang diberikan: istilah, kaidah, dan masalah di dialog harus diambil dari materi itu, bukan dari bab lain.

Aturan:
- Bahasa Indonesia santai-hangat ala Masisir, boleh menyelipkan istilah Arab (ditulis latin) yang ada di materi.
- Jangan mengutip ayat Al-Qur'an, hadits, atau perkataan ulama tertentu. Jangan mengarang nama ulama nyata. Guardian adalah tokoh fiksi.
- "epigraph": satu kalimat hikmah berbahasa Arab berharakat buatanmu sendiri tentang semangat menuntut ilmu/materi ini (bukan kutipan), plus terjemahannya.
- Dialog 4–6 baris; speakerType hanya "narrator", "thalib", atau "syaikh". Tiap baris maksimal 280 karakter.
- Level naik bertahap dari dasar ke paling sulit sesuai urutan bahasan materi. Lore tiap level maksimal 220 karakter dan menyebut topik yang diuji.
- Lokasi berupa tempat di sekitar Al-Azhar/Kairo (ruwaq, shahn, maktabah, dsb).

Balas HANYA JSON valid dengan bentuk:
{"chapter":"HIKAYAT ...","title":"...","titleArabic":"...","location":"...","epigraph":"«...»","epigraphMeaning":"...",
 "dialogues":[{"speakerType":"narrator|thalib|syaikh","speaker":"...","role":"...","text":"..."}],
 "stages":[{"title":"Level 1: ...","titleArabic":"...","location":"...","guardianName":"...","lore":"..."}, ... 4 item]}`;

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

const buildMaterial = (body) => {
  const parts = [];
  const title = str(body.title, 160);
  const maddah = str(body.maddah, 120);
  if (title) parts.push(`Judul: ${title}`);
  if (maddah) parts.push(`Maddah: ${maddah}`);
  const summary = Array.isArray(body.summary) ? body.summary.slice(0, 8) : [];
  for (const s of summary) {
    const heading = str(s?.heading, 120);
    const text = str(s?.body, 900);
    if (heading || text) parts.push(`- ${heading}${heading && text ? ': ' : ''}${text}`);
  }
  const terms = Array.isArray(body.terms) ? body.terms.slice(0, 10) : [];
  if (terms.length) parts.push('Istilah: ' + terms.map(t => `${str(t?.term, 60)} = ${str(t?.def, 120)}`).join('; '));
  const text = str(body.text, MAX_MATERIAL);
  if (text) parts.push(`Cuplikan materi:\n${text}`);
  return parts.join('\n').slice(0, MAX_MATERIAL + 2000);
};

const cleanStory = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const dialogues = (Array.isArray(raw.dialogues) ? raw.dialogues : [])
    .map(d => ({
      // Tipe di luar daftar: tebak dari nama pembicara (selain narator/thalib berarti penguji).
      speakerType: ['narrator', 'thalib', 'syaikh'].includes(d?.speakerType) ? d.speakerType
        : /narat|narrator/i.test(d?.speaker || '') ? 'narrator' : /thalib/i.test(d?.speaker || '') ? 'thalib' : 'syaikh',
      speaker: str(d?.speaker, 60) || 'Narator',
      role: str(d?.role, 60),
      text: str(d?.text, 320),
    }))
    .filter(d => d.text)
    .slice(0, 6);
  const stages = (Array.isArray(raw.stages) ? raw.stages : [])
    .slice(0, STAGE_COUNT)
    .map(s => ({
      title: str(s?.title, 90),
      titleArabic: str(s?.titleArabic, 90),
      location: str(s?.location, 90),
      guardianName: str(s?.guardianName, 70),
      lore: str(s?.lore, 260),
    }));
  if (dialogues.length < 2) return null;
  return {
    chapter: str(raw.chapter, 50) || 'HIKAYAT',
    title: str(raw.title, 120),
    titleArabic: str(raw.titleArabic, 120),
    location: str(raw.location, 100),
    epigraph: str(raw.epigraph, 200),
    epigraphMeaning: str(raw.epigraphMeaning, 240),
    dialogues,
    stages: stages.length === STAGE_COUNT ? stages : [],
  };
};

export async function handleBattleStory(ctx, body, res, { upgradeRequired }) {
  if (ctx.memberTier === 'free') {
    return upgradeRequired(res, 'battle_story', 'Cerita AI di game Battle khusus member paket Library ke atas.');
  }
  const material = buildMaterial(body);
  if (material.length < 60) return res.status(400).json({ ok: false, error: 'Materi terlalu sedikit untuk dibuatkan cerita.' });

  const limit = DAILY_LIMIT[ctx.tier] ?? DAILY_LIMIT.trial;
  if (!(await consumeQuota(ctx.code, 'battle_story', limit))) {
    return res.status(429).json({ ok: false, error: 'quota', message: `Jatah ${limit} cerita AI per hari sudah terpakai. Coba lagi besok — cerita bawaan tetap bisa dimainkan.` });
  }

  const model = (await resolveModels()).study;
  const story = cleanStory(await callAIJson({
    system: SYSTEM,
    messages: [{ role: 'user', content: material }],
    maxTokens: 2500,
    temperature: 0.8,
    model,
  }));
  if (!story) throw new Error('AI gagal menulis cerita');
  return res.status(200).json({ ok: true, data: story, model });
}

/* ── AI Halaqah: tanya Syaikh di tengah duel ──
   Jawaban singkat (model "chat", ±Haiku) seputar soal yang sedang dikerjakan. Sebelum pemain menjawab, AI tidak
   diberi kunci jawaban sama sekali — jadi tidak mungkin membocorkannya; setelah menjawab (kartu muzakarah), kunci &
   pembahasan ikut dikirim supaya AI bisa menjelaskan. Kuota harian sendiri ("battle_halaqah"). */
const HALAQAH_LIMIT = { pro: 40, trial: 15 };
const HALAQAH_MODES = {
  hint: 'Beri isyarah/petunjuk arah berpikir untuk soal ini tanpa menyebut opsi mana yang benar.',
  explanation: "Terangkan ta'rif dan kaidah pokok yang menjadi poros soal ini.",
  exam: 'Tunjukkan cara menuliskan jawaban soal semacam ini di lembar ujian Al-Azhar (kurrasah ijabah), ringkas dan berurutan.',
  diff: 'Jelaskan perbedaan esensial antar opsi yang tampak mirip, tanpa menyebut mana yang benar bila pemain belum menjawab.',
};

const halaqahSystem = (answered) => `Kamu "Syaikh AI Talqeeh", penguji ramah di game edukasi Arena Imtihan untuk mahasiswa Indonesia di Al-Azhar.
Jawab dalam bahasa Indonesia santai-sopan, maksimal ±120 kata, boleh menyelipkan istilah/teks Arab berharakat bila perlu.
Fokus pada soal yang diberikan dan materi maddahnya; jika pertanyaan di luar topik, arahkan kembali ke soal dengan singkat.
${answered
  ? 'Pemain SUDAH menjawab soal ini; kamu boleh menyebut kunci jawaban dan menjelaskan mengapa benar/salah.'
  : 'Pemain BELUM menjawab. JANGAN sebut, isyaratkan, atau tebak opsi mana yang benar (huruf, isi, maupun urutan). Bimbing cara berpikirnya saja.'}
Jangan mengarang kutipan ayat, hadits, atau perkataan ulama tertentu.`;

export async function handleBattleHalaqah(ctx, body, res, { upgradeRequired }) {
  if (ctx.memberTier === 'free') {
    return upgradeRequired(res, 'battle_halaqah', 'Syaikh AI di game Arena Imtihan khusus member paket Library ke atas.');
  }
  const question = str(body.question, 600);
  const options = (Array.isArray(body.options) ? body.options : []).slice(0, 6).map(o => str(o, 200)).filter(Boolean);
  const mode = HALAQAH_MODES[body.mode] ? body.mode : 'custom';
  const message = mode === 'custom' ? str(body.message, 500) : HALAQAH_MODES[mode];
  if (!question || !message) return res.status(400).json({ ok: false, error: 'Soal atau pertanyaan kosong.' });
  const answered = body.answered === true;

  const limit = HALAQAH_LIMIT[ctx.tier] ?? HALAQAH_LIMIT.trial;
  if (!(await consumeQuota(ctx.code, 'battle_halaqah', limit))) {
    return res.status(429).json({ ok: false, error: 'quota', message: `Jatah ${limit} pertanyaan ke Syaikh AI hari ini sudah terpakai. Coba lagi besok.` });
  }

  const context = [
    `Maddah: ${str(body.maddah, 120) || '-'} — ${str(body.title, 160) || '-'}`,
    `Soal: ${question}`,
    options.length ? 'Opsi:\n' + options.map((o, i) => `${'ABCDEF'[i]}. ${o}`).join('\n') : '',
    answered && str(body.correct, 200) ? `Kunci jawaban: ${str(body.correct, 200)}` : '',
    answered && str(body.chosen, 200) ? `Jawaban pemain: ${str(body.chosen, 200)}` : '',
    answered && str(body.explanation, 800) ? `Pembahasan: ${str(body.explanation, 800)}` : '',
  ].filter(Boolean).join('\n');

  // Riwayat singkat percakapan halaqah (maks 6 giliran terakhir) supaya pertanyaan lanjutan nyambung.
  const history = (Array.isArray(body.history) ? body.history : [])
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-6)
    .map(m => ({ role: m.role, content: m.content.trim().slice(0, 700) }));
  while (history.length && history[0].role !== 'user') history.shift();

  const model = (await resolveModels()).chat;
  const reply = (await callAI({
    system: `${halaqahSystem(answered)}\n\nKonteks soal:\n${context}`,
    messages: [...history, { role: 'user', content: message }],
    maxTokens: 700,
    temperature: 0.4,
    model,
  })).trim();
  if (!reply) throw new Error('AI tidak memberi jawaban');
  return res.status(200).json({ ok: true, data: { reply }, model });
}
