// Golden set & evaluasi AI Partner.
// Soal uji (golden items) diperiksa asatidz; evaluasi menjalankan tugas yang SAMA dengan fitur di aplikasi
// (prompt produksi), lalu memberi skor 0–100:
//   - harakat & i'rab & penilaian tahriri → dihitung pasti oleh kode (per huruf / kata kunci / rentang nilai)
//   - ringkasan & tanya tutor → dinilai "AI penguji" terhadap poin kunci + cek kutipan terhadap materi
import { sbConfig, sbHeaders } from '../member.js';
import { callAI, callAIJson } from '../ai.js';
import { resolveModels, isValidModelId } from '../models.js';
import { summaryPrompt, tutorSystem, IRAB_PROMPT, TASYKIL_PROMPT, GRADE_PROMPT, gradeUserPrompt } from './prompts.js';
import { cleanIrab, cleanGrade } from './sanitize.js';
import { normalizeText } from './chunks.js';

export const EVAL_TASKS = ['summary', 'qa', 'irab', 'tasykil', 'grade'];
// Model produksi yang dipakai tiap tugas (sama dengan fitur di aplikasi).
const TASK_MODEL = { summary: 'default', qa: 'chat', irab: 'arabic', tasykil: 'arabic', grade: 'grade' };
const JUDGED = ['summary', 'qa'];

const str = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const strList = (v, n, max) => (Array.isArray(v) ? v.map(x => str(x, n)).filter(Boolean).slice(0, max) : []);

/* ── Validasi soal uji ── */
export const cleanGoldenItem = (raw) => {
  if (!raw || typeof raw !== 'object' || !EVAL_TASKS.includes(raw.task)) return { error: 'Jenis tugas tidak valid' };
  const title = str(raw.title, 160);
  if (!title) return { error: 'Judul wajib diisi' };
  const inp = raw.input || {};
  const exp = raw.expected || {};
  let input, expected;
  if (raw.task === 'summary' || raw.task === 'qa') {
    input = { materi: str(inp.materi, 30000) };
    if (input.materi.length < 50) return { error: 'Materi minimal 50 karakter' };
    if (raw.task === 'qa') { input.pertanyaan = str(inp.pertanyaan, 1000); if (!input.pertanyaan) return { error: 'Pertanyaan wajib diisi' }; }
    expected = { poin: strList(exp.poin, 500, 20) };
    if (expected.poin.length < 1) return { error: 'Isi minimal 1 poin kunci' };
  } else if (raw.task === 'irab') {
    input = { teks: str(inp.teks, 400) };
    if (!input.teks) return { error: 'Teks Arab wajib diisi' };
    const kata = (Array.isArray(exp.kata) ? exp.kata : [])
      .map(k => ({ kata: str(k?.kata, 60), kunci: strList(k?.kunci, 80, 6) }))
      .filter(k => k.kata && k.kunci.length).slice(0, 20);
    if (!kata.length) return { error: 'Isi minimal 1 kata beserta kunci i\'rab-nya' };
    expected = { kata };
  } else if (raw.task === 'tasykil') {
    input = { teks: str(inp.teks, 1500) };
    expected = { teks: str(exp.teks, 3000) };
    if (!input.teks || !expected.teks) return { error: 'Teks gundul dan teks berharakat wajib diisi' };
  } else {
    input = { soal: str(inp.soal, 500), soal_id: str(inp.soal_id, 500), poin: strList(inp.poin, 300, 10), jawaban_model: str(inp.jawaban_model, 3000), jawaban: str(inp.jawaban, 4000) };
    if (!input.soal || !input.jawaban || !input.poin.length) return { error: 'Soal, poin kunci, dan jawaban mahasiswa wajib diisi' };
    const min = Number(exp.min), max = Number(exp.max);
    if (!Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max > 10 || min > max) return { error: 'Rentang nilai harus 0–10 (min ≤ max)' };
    expected = { min, max };
  }
  return {
    item: {
      task: raw.task, title, maddah: str(raw.maddah, 80) || null, input, expected,
      status: ['draft', 'verified', 'archived'].includes(raw.status) ? raw.status : 'draft',
      reviewer: str(raw.reviewer, 120) || null, notes: str(raw.notes, 1000) || null,
    },
  };
};

/* ── Penilai pasti ── */

// Harakat: bandingkan tanda baca per huruf pada huruf yang memang diberi harakat di kunci.
const MARKS = /[ً-ْ]/;
const LETTER = /[ء-يٱ]/;
const lettersOf = (text) => {
  const out = [];
  for (const raw of (text || '').normalize('NFC')) {
    // Alif kecil gaya mushaf (لِلّٰهِ) dihitung sama dengan fathah.
    const ch = raw === 'ٰ' ? 'َ' : raw;
    if (MARKS.test(ch)) { if (out.length) out[out.length - 1].marks += ch; }
    else if (LETTER.test(ch)) out.push({ base: ch === 'ٱ' ? 'ا' : ch, marks: '' });
  }
  return out.map(l => ({ ...l, marks: [...new Set(l.marks)].sort().join('') }));
};
// Samakan urutan huruf dasar (LCS) kalau model sempat mengubah/menambah huruf.
const alignLetters = (a, b) => {
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) {
    dp[i][j] = a[i].base === b[j].base ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  }
  const pairs = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i].base === b[j].base) { pairs.push([i, j]); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return pairs;
};

export const scoreTasykil = (expectedText, outputText) => {
  const exp = lettersOf(expectedText);
  const got = lettersOf(outputText);
  const map = new Map(alignLetters(exp, got).map(([a, b]) => [a, b]));
  const judged = exp.map((l, i) => ({ l, i })).filter(({ l }) => l.marks);
  const mistakes = [];
  let right = 0;
  for (const { l, i } of judged) {
    const g = map.has(i) ? got[map.get(i)] : null;
    if (g && g.marks === l.marks) right++;
    else if (mistakes.length < 25) mistakes.push({ huruf: l.base, kunci: l.marks, ai: g ? g.marks : '(hilang)', posisi: i });
  }
  const baseSame = exp.map(l => l.base).join('') === got.map(l => l.base).join('');
  return {
    score: judged.length ? Math.round((right / judged.length) * 100) : 0,
    detail: { huruf_dinilai: judged.length, benar: right, salah: mistakes, huruf_berubah: !baseSame },
  };
};

// I'rab: kata kunci (mis. "مبتدأ", "مرفوع") harus muncul pada analisis kata yang bersangkutan.
export const scoreIrab = (expectedKata, output) => {
  const entries = (output?.irab || []).map(w => ({ kata: normalizeText(w.kata), text: normalizeText(`${w.irab} ${w.penjelasan || ''}`) }));
  const everything = normalizeText(JSON.stringify(output || {}));
  let earned = 0, total = 0;
  const words = expectedKata.map(k => {
    const kata = normalizeText(k.kata);
    const entry = entries.find(e => e.kata === kata) || entries.find(e => e.kata.includes(kata) || kata.includes(e.kata));
    const found = [], missing = [];
    for (const key of k.kunci) {
      total++;
      const nk = normalizeText(key);
      if (entry && entry.text.includes(nk)) { earned += 1; found.push(key); }
      else if (!entry && everything.includes(nk)) { earned += 0.5; found.push(`${key} (tidak di kata yang tepat)`); }
      else missing.push(key);
    }
    return { kata: k.kata, ditemukan: !!entry, found, missing };
  });
  return { score: total ? Math.round((earned / total) * 100) : 0, detail: { kata: words } };
};

// Penilaian tahriri: nilai AI harus berada di rentang yang ditetapkan asatidz.
export const scoreGrade = (min, max, skor) => {
  const s = Number(skor);
  if (!Number.isFinite(s)) return { score: 0, detail: { skor_ai: null, rentang: [min, max] } };
  const off = s < min ? min - s : s > max ? s - max : 0;
  return { score: Math.max(0, Math.round(100 - off * 25)), detail: { skor_ai: s, rentang: [min, max], selisih: off } };
};

// Kutipan "> " di jawaban AI dicocokkan dengan materi (potongan 3 kata, harakat diabaikan).
export const checkQuotes = (output, materi) => {
  const grams = (t) => { const w = normalizeText(t).split(' ').filter(Boolean); const g = []; for (let i = 0; i + 2 < w.length; i++) g.push(w.slice(i, i + 3).join(' ')); return g; };
  const source = new Set(grams(materi));
  const quotes = (output || '').split('\n').filter(l => /^\s*>/.test(l)).map(l => l.replace(/^\s*>\s?/, '').trim()).filter(q => normalizeText(q).split(' ').length >= 4);
  let ok = 0; const miss = [];
  for (const q of quotes) {
    const g = grams(q);
    const hit = g.length ? g.filter(x => source.has(x)).length / g.length : 0;
    if (hit >= 0.8) ok++; else miss.push(q.slice(0, 160));
  }
  return { total: quotes.length, ok, miss };
};

const JUDGE_PROMPT = `Kamu penguji kualitas AI Partner Talqeeh (asisten belajar mahasiswa Al-Azhar).
Tugasmu menilai JAWABAN AI terhadap POIN KUNCI yang ditetapkan asatidz, dengan MATERI sebagai satu-satunya sumber kebenaran.
- Untuk tiap poin kunci: "ada": true jika poin itu tercakup dengan BENAR di jawaban AI (boleh beda kata/bahasa, harus sama maknanya).
- "kesalahan": daftar pernyataan di jawaban AI yang SALAH menurut materi, atau mengarang hal yang tidak ada di materi seolah-olah ada di materi. Jangan hitung penjelasan umum yang benar dan tidak diklaim dari materi.
- Nilai dengan ketat dan adil. Jangan menilai gaya bahasa.
Balas HANYA JSON: {"poin":[{"ada":true,"catatan":"singkat"}],"kesalahan":["..."],"catatan":"satu kalimat kesimpulan"}`;

export const judgeAnswer = async ({ item, output, model }) => {
  const poin = item.expected.poin || [];
  const q = item.task === 'qa' ? `\n\nPERTANYAAN MAHASISWA:\n${item.input.pertanyaan}` : '\n\n(Tugas: meringkas materi)';
  const verdict = await callAIJson({
    system: JUDGE_PROMPT, model, maxTokens: 1500, temperature: 0,
    messages: [{ role: 'user', content: `MATERI:\n<<<\n${item.input.materi}\n>>>${q}\n\nPOIN KUNCI (${poin.length}):\n${poin.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\nJAWABAN AI:\n<<<\n${output}\n>>>` }],
  });
  const marks = Array.isArray(verdict?.poin) ? verdict.poin : [];
  const covered = poin.map((p, i) => ({ poin: p, ada: marks[i]?.ada === true, catatan: str(marks[i]?.catatan, 300) }));
  const errors = strList(verdict?.kesalahan, 400, 10);
  const quotes = checkQuotes(output, item.input.materi);
  const coverage = poin.length ? covered.filter(c => c.ada).length / poin.length : 0;
  const penalty = Math.min(errors.length, 4) * 15 + Math.min(quotes.miss.length, 3) * 10;
  return {
    score: Math.max(0, Math.round(coverage * 100 - penalty)),
    detail: { poin: covered, kesalahan: errors, kutipan: quotes, catatan: str(verdict?.catatan, 400), cakupan: Math.round(coverage * 100) },
  };
};

/* ── Menjalankan tugas persis seperti fitur aplikasi ── */
export const runTask = async (item, model) => {
  const t = item.task;
  if (t === 'summary') {
    const text = await callAI({ system: summaryPrompt('id'), model, maxTokens: 3000, messages: [{ role: 'user', content: `Judul materi: ${item.title}\n\nMATERI:\n${item.input.materi}` }] });
    return { output: text, judged: true };
  }
  if (t === 'qa') {
    const text = await callAI({ system: tutorSystem(item.title, item.input.materi), model, maxTokens: 1500, messages: [{ role: 'user', content: item.input.pertanyaan }] });
    return { output: text, judged: true };
  }
  if (t === 'irab') {
    const out = cleanIrab(await callAIJson({ system: IRAB_PROMPT, model, maxTokens: 3000, temperature: 0.1, messages: [{ role: 'user', content: item.input.teks }] }));
    return { output: JSON.stringify(out || {}), ...scoreIrab(item.expected.kata, out) };
  }
  if (t === 'tasykil') {
    const text = (await callAI({ system: TASYKIL_PROMPT, model, maxTokens: 3000, temperature: 0, messages: [{ role: 'user', content: item.input.teks }] })).trim();
    return { output: text, ...scoreTasykil(item.expected.teks, text) };
  }
  const essay = { soal_ar: item.input.soal, soal_id: item.input.soal_id, poin: item.input.poin, jawaban_model: item.input.jawaban_model };
  const g = cleanGrade(await callAIJson({ system: GRADE_PROMPT, model, maxTokens: 2000, temperature: 0.2, messages: [{ role: 'user', content: gradeUserPrompt(essay, item.input.jawaban) }] }));
  return { output: JSON.stringify(g || {}), ...scoreGrade(item.expected.min, item.expected.max, g?.skor) };
};

/* ── Contoh awal (DRAFT) — wajib diperiksa asatidz sebelum ditandai "verified" ── */
const ABI_SYUJA_MIYAH = 'كتاب الطهارة. المياه التي يجوز التطهير بها سبع مياه: ماء السماء، وماء البحر، وماء النهر، وماء البئر، وماء العين، وماء الثلج، وماء البرد. ثم المياه على أربعة أقسام: طاهر مطهر غير مكروه وهو الماء المطلق، وطاهر مطهر مكروه وهو الماء المشمس، وطاهر غير مطهر وهو الماء المستعمل والمتغير بما خالطه من الطاهرات، وماء نجس وهو الذي حلت فيه نجاسة وهو دون القلتين أو كان قلتين فتغير. والقلتان خمسمائة رطل بغدادي تقريبا في الأصح.';
const THAHARAH_ESSAY = {
  soal: 'عَرِّفِ الطَّهَارَةَ لُغَةً وَاصْطِلَاحًا',
  soal_id: 'Definisikan thaharah secara bahasa dan istilah',
  poin: ['Lughatan: النَّظَافَةُ (kebersihan)', 'Istilahan: رَفْعُ الْحَدَثِ أَوْ إِزَالَةُ النَّجَسِ (mengangkat hadats atau menghilangkan najis)'],
  jawaban_model: 'الطهارة لغة: النظافة. واصطلاحا: رفع الحدث أو إزالة النجس أو ما في معناهما وعلى صورتهما.',
};
const SEED_NOTE = 'Contoh awal dari Talqeeh — periksa kunci jawabannya dulu, baru tandai "verified".';
export const STARTER_ITEMS = [
  { task: 'tasykil', title: 'Harakat — Al-Fatihah ayat 2', maddah: 'tafsir', input: { teks: 'الحمد لله رب العالمين' }, expected: { teks: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' } },
  { task: 'tasykil', title: 'Harakat — ta\'rif kalam (Al-Ajurrumiyyah)', maddah: 'nahwu', input: { teks: 'الكلام هو اللفظ المركب المفيد بالوضع' }, expected: { teks: 'الْكَلَامُ هُوَ اللَّفْظُ الْمُرَكَّبُ الْمُفِيدُ بِالْوَضْعِ' } },
  { task: 'tasykil', title: 'Harakat — hadits niat', maddah: 'hadits', input: { teks: 'إنما الأعمال بالنيات وإنما لكل امرئ ما نوى' }, expected: { teks: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى' } },
  { task: 'tasykil', title: 'Harakat — perintah shalat & zakat', maddah: 'tafsir', input: { teks: 'أقيموا الصلاة وآتوا الزكاة' }, expected: { teks: 'أَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ' } },
  { task: 'irab', title: 'I\'rab — جاء زيد', maddah: 'nahwu', input: { teks: 'جاء زيد' }, expected: { kata: [{ kata: 'جاء', kunci: ['فعل ماض'] }, { kata: 'زيد', kunci: ['فاعل', 'مرفوع'] }] } },
  { task: 'irab', title: 'I\'rab — الحمد لله', maddah: 'nahwu', input: { teks: 'الحمد لله' }, expected: { kata: [{ kata: 'الحمد', kunci: ['مبتدأ', 'مرفوع'] }, { kata: 'لله', kunci: ['خبر'] }] } },
  { task: 'irab', title: 'I\'rab — إن الله غفور رحيم', maddah: 'nahwu', input: { teks: 'إن الله غفور رحيم' }, expected: { kata: [{ kata: 'إن', kunci: ['توكيد', 'نصب'] }, { kata: 'الله', kunci: ['اسم إن', 'منصوب'] }, { kata: 'غفور', kunci: ['خبر إن', 'مرفوع'] }, { kata: 'رحيم', kunci: ['مرفوع'] }] } },
  { task: 'irab', title: 'I\'rab — كان الجو صحوا', maddah: 'nahwu', input: { teks: 'كان الجو صحوا' }, expected: { kata: [{ kata: 'كان', kunci: ['ناقص'] }, { kata: 'الجو', kunci: ['اسم كان', 'مرفوع'] }, { kata: 'صحوا', kunci: ['خبر كان', 'منصوب'] }] } },
  { task: 'summary', title: 'Ringkasan — pembagian air (Matan Abi Syuja\')', maddah: 'fiqh', input: { materi: ABI_SYUJA_MIYAH }, expected: { poin: [
    'Ada tujuh macam air yang boleh dipakai bersuci: air hujan, laut, sungai, sumur, mata air, salju, dan embun beku (barad)',
    'Air terbagi menjadi empat bagian',
    'Suci-menyucikan dan tidak makruh = air mutlak',
    'Suci-menyucikan tetapi makruh = air musyammas',
    'Suci tetapi tidak menyucikan = air musta\'mal dan air yang berubah karena bercampur benda suci',
    'Air najis = kurang dari dua qullah yang terkena najis, atau dua qullah yang berubah karena najis',
    'Dua qullah kira-kira 500 rithl Baghdadi menurut pendapat yang paling sahih',
  ] } },
  { task: 'qa', title: 'Tutor — hukum air musyammas', maddah: 'fiqh', input: { materi: ABI_SYUJA_MIYAH, pertanyaan: 'Apa hukum bersuci dengan air musyammas?' }, expected: { poin: ['Air musyammas suci dan menyucikan (sah untuk bersuci)', 'Tetapi hukum memakainya makruh'] } },
  { task: 'qa', title: 'Tutor — kapan air dua qullah najis', maddah: 'fiqh', input: { materi: ABI_SYUJA_MIYAH, pertanyaan: 'Kapan air yang banyaknya dua qullah menjadi najis?' }, expected: { poin: ['Jika air itu berubah (sifatnya) karena najis yang masuk ke dalamnya'] } },
  { task: 'qa', title: 'Tutor (jebakan) — dua qullah dalam liter', maddah: 'fiqh', input: { materi: ABI_SYUJA_MIYAH, pertanyaan: 'Berapa liter ukuran dua qullah?' }, expected: { poin: ['Menyatakan bahwa ukuran dalam liter tidak disebutkan di materi', 'Menyebutkan yang ada di materi: dua qullah sekitar 500 rithl Baghdadi'] } },
  { task: 'grade', title: 'Tahriri — jawaban lengkap (harus 8–10)', maddah: 'fiqh', input: { ...THAHARAH_ESSAY, jawaban: 'الطهارة في اللغة النظافة والخلوص من الأدناس، وفي الاصطلاح رفع الحدث أو إزالة النجس أو ما في معناهما وعلى صورتهما.' }, expected: { min: 8, max: 10 } },
  { task: 'grade', title: 'Tahriri — hanya ta\'rif lughah (harus 3–6)', maddah: 'fiqh', input: { ...THAHARAH_ESSAY, jawaban: 'الطهارة لغة هي النظافة.' }, expected: { min: 3, max: 6 } },
  { task: 'grade', title: 'Tahriri — jawaban keliru (harus 0–2)', maddah: 'fiqh', input: { ...THAHARAH_ESSAY, jawaban: 'الطهارة هي الصلاة في المسجد مع الجماعة.' }, expected: { min: 0, max: 2 } },
].map(i => ({ ...i, status: 'draft', notes: SEED_NOTE }));

/* ── Aksi admin (dipanggil dari api/ai-partner.js setelah token admin diperiksa) ── */
const db = async (path, opts = {}) => {
  const { url, key } = sbConfig();
  const r = await fetch(`${url}/rest/v1/${path}`, { ...opts, headers: sbHeaders(key, opts.prefer ? { Prefer: opts.prefer } : {}) });
  const text = await r.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { ok: r.ok, status: r.status, data };
};
const MIGRATION_HINT = 'Tabel evaluasi belum ada — jalankan migrations/ai_eval.sql di Supabase SQL Editor.';
const isUuid = (v) => typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v);

export async function handleEvalAdmin(action, body, res) {
  if (action === 'admin-golden-list') {
    const r = await db('ai_golden_items?select=*&order=created_at.asc');
    if (!r.ok) return res.status(200).json({ ok: false, missing: true, error: MIGRATION_HINT });
    return res.status(200).json({ ok: true, data: r.data });
  }

  if (action === 'admin-golden-save') {
    const { item, error } = cleanGoldenItem(body.item);
    if (error) return res.status(400).json({ ok: false, error });
    const now = new Date().toISOString();
    const r = isUuid(body.item?.id)
      ? await db(`ai_golden_items?id=eq.${body.item.id}`, { method: 'PATCH', prefer: 'return=representation', body: JSON.stringify({ ...item, updated_at: now }) })
      : await db('ai_golden_items', { method: 'POST', prefer: 'return=representation', body: JSON.stringify(item) });
    if (!r.ok) return res.status(500).json({ ok: false, error: 'Gagal menyimpan soal uji' });
    return res.status(200).json({ ok: true, data: Array.isArray(r.data) ? r.data[0] : r.data });
  }

  if (action === 'admin-golden-delete') {
    if (!isUuid(body.id)) return res.status(400).json({ ok: false, error: 'id tidak valid' });
    await db(`ai_golden_items?id=eq.${body.id}`, { method: 'DELETE' });
    return res.status(200).json({ ok: true });
  }

  if (action === 'admin-golden-seed') {
    const existing = await db('ai_golden_items?select=title');
    if (!existing.ok) return res.status(200).json({ ok: false, missing: true, error: MIGRATION_HINT });
    const have = new Set((existing.data || []).map(r => r.title));
    const fresh = STARTER_ITEMS.filter(i => !have.has(i.title));
    if (fresh.length) {
      const r = await db('ai_golden_items', { method: 'POST', prefer: 'return=minimal', body: JSON.stringify(fresh) });
      if (!r.ok) return res.status(500).json({ ok: false, error: 'Gagal menambah contoh awal' });
    }
    return res.status(200).json({ ok: true, added: fresh.length });
  }

  if (action === 'admin-eval-start') {
    const override = isValidModelId(body.model) ? body.model.trim() : null;
    const models = await resolveModels();
    const judge = isValidModelId(body.judge_model) ? body.judge_model.trim() : models.default;
    const statuses = body.include_drafts ? 'verified,draft' : 'verified';
    const tasks = Array.isArray(body.tasks) ? body.tasks.filter(t => EVAL_TASKS.includes(t)) : EVAL_TASKS;
    const items = await db(`ai_golden_items?select=id,task,title&status=in.(${statuses})&task=in.(${(tasks.length ? tasks : EVAL_TASKS).join(',')})&order=created_at.asc`);
    if (!items.ok) return res.status(200).json({ ok: false, missing: true, error: MIGRATION_HINT });
    if (!items.data.length) return res.status(400).json({ ok: false, error: body.include_drafts ? 'Belum ada soal uji.' : 'Belum ada soal uji berstatus verified — centang "ikutkan draft" atau verifikasi soal dulu.' });
    const modelsUsed = Object.fromEntries(EVAL_TASKS.map(t => [t, override || models[TASK_MODEL[t]]]));
    const run = await db('ai_eval_runs', {
      method: 'POST', prefer: 'return=representation',
      body: JSON.stringify({ label: str(body.label, 120) || null, model: override, judge_model: judge, include_drafts: !!body.include_drafts, item_count: items.data.length, models_used: modelsUsed }),
    });
    if (!run.ok) return res.status(500).json({ ok: false, error: 'Gagal membuat sesi evaluasi' });
    return res.status(200).json({ ok: true, run: run.data[0], items: items.data });
  }

  if (action === 'admin-eval-item' || action === 'admin-eval-judge') {
    if (!isUuid(body.run_id) || !isUuid(body.item_id)) return res.status(400).json({ ok: false, error: 'id tidak valid' });
    const [run, item] = await Promise.all([
      db(`ai_eval_runs?id=eq.${body.run_id}&select=*`),
      db(`ai_golden_items?id=eq.${body.item_id}&select=*`),
    ]);
    const r0 = run.data?.[0], it = item.data?.[0];
    if (!r0 || !it) return res.status(404).json({ ok: false, error: 'Sesi atau soal tidak ditemukan' });
    const model = r0.models_used?.[it.task] || (await resolveModels())[TASK_MODEL[it.task]];

    if (action === 'admin-eval-item') {
      const started = Date.now();
      let row;
      try {
        const out = await runTask(it, model);
        row = { run_id: r0.id, item_id: it.id, task: it.task, model, output: out.output.slice(0, 20000), score: out.judged ? null : out.score, detail: out.detail || null, ms: Date.now() - started, error: null };
      } catch (err) {
        row = { run_id: r0.id, item_id: it.id, task: it.task, model, output: null, score: 0, detail: null, ms: Date.now() - started, error: String(err.message).slice(0, 300) };
      }
      await db('ai_eval_results?on_conflict=run_id,item_id', { method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal', body: JSON.stringify(row) });
      return res.status(200).json({ ok: true, result: { ...row, needs_judge: JUDGED.includes(it.task) && !row.error } });
    }

    const existing = await db(`ai_eval_results?run_id=eq.${r0.id}&item_id=eq.${it.id}&select=*`);
    const result = existing.data?.[0];
    if (!result?.output) return res.status(400).json({ ok: false, error: 'Belum ada jawaban AI untuk dinilai' });
    let patch;
    try {
      const j = await judgeAnswer({ item: it, output: result.output, model: r0.judge_model });
      patch = { score: j.score, detail: j.detail };
    } catch (err) {
      patch = { score: 0, error: `Penguji gagal: ${String(err.message).slice(0, 200)}` };
    }
    await db(`ai_eval_results?run_id=eq.${r0.id}&item_id=eq.${it.id}`, { method: 'PATCH', prefer: 'return=minimal', body: JSON.stringify(patch) });
    return res.status(200).json({ ok: true, result: { ...result, ...patch } });
  }

  if (action === 'admin-eval-finish') {
    if (!isUuid(body.run_id)) return res.status(400).json({ ok: false, error: 'id tidak valid' });
    const results = await db(`ai_eval_results?run_id=eq.${body.run_id}&select=task,score`);
    const scored = (results.data || []).filter(r => r.score != null);
    const byTask = {};
    for (const r of scored) (byTask[r.task] ||= []).push(Number(r.score));
    const scores = Object.fromEntries(Object.entries(byTask).map(([t, xs]) => [t, Math.round(xs.reduce((a, b) => a + b, 0) / xs.length)]));
    const vals = Object.values(scores);
    const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
    await db(`ai_eval_runs?id=eq.${body.run_id}`, { method: 'PATCH', prefer: 'return=minimal', body: JSON.stringify({ status: 'done', scores, avg_score: avg, finished_at: new Date().toISOString() }) });
    return res.status(200).json({ ok: true, scores, avg_score: avg });
  }

  if (action === 'admin-eval-runs') {
    const r = await db('ai_eval_runs?select=*&order=created_at.desc&limit=20');
    if (!r.ok) return res.status(200).json({ ok: false, missing: true, error: MIGRATION_HINT });
    return res.status(200).json({ ok: true, data: r.data });
  }

  if (action === 'admin-eval-run') {
    if (!isUuid(body.run_id)) return res.status(400).json({ ok: false, error: 'id tidak valid' });
    const [run, results] = await Promise.all([
      db(`ai_eval_runs?id=eq.${body.run_id}&select=*`),
      db(`ai_eval_results?run_id=eq.${body.run_id}&select=*&order=created_at.asc`),
    ]);
    const ids = [...new Set((results.data || []).map(r => r.item_id))];
    const items = ids.length ? await db(`ai_golden_items?id=in.(${ids.join(',')})&select=id,title,task,expected,input,status`) : { data: [] };
    return res.status(200).json({ ok: true, run: run.data?.[0] || null, results: results.data || [], items: items.data || [] });
  }

  return null; // bukan aksi evaluasi
}
