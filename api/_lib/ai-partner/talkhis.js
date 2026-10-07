/* Talkhis otomatis: muqarrar → peta mabahits → talkhis Arab per judul → cek kelengkapan → lengkapi.

   Alur (tiap langkah = satu request < 60 detik, diminta berurutan oleh browser):
   1. map    — materi dibaca per bagian (Gemini). AI menyebut tiap judul beserta kalimat pembukanya (anchor);
               server mencari anchor itu di teks asli, jadi tiap judul punya potongan sumber yang pasti
               (dari anchor-nya sampai anchor judul berikutnya). Seluruh teks muqarrar terbagi habis ke judul.
   2. edit   — pengguna merapikan daftar: ganti judul, gabung ke judul sebelumnya, lewati.
   3. write  — talkhis Arab satu judul (Sonnet), HANYA dari potongan sumbernya. Terpotong batas waktu →
               disimpan sebagian, browser meminta lanjutan (mode continue, tidak dihitung sebagai tulis baru).
   4. check  — AI pemeriksa (Gemini) membandingkan talkhis dengan sumbernya: skor cakupan, poin yang terlewat,
               dan klaim yang tidak didukung sumber.
   5. write mode complete — menulis ulang talkhis dengan menambahkan poin yang terlewat & membetulkan yang salah.

   Biaya dijaga dengan: 1 kuota "talkhis" per muqarrar (saat pemetaan mulai), jumlah judul maksimal, dan batas
   tulis/cek per judul. Data disimpan di kolom study_sets.talkhis (jsonb). */
import crypto from 'crypto';
import { splitChunks } from './chunks.js';

export const TALKHIS_MAP_CHUNK = 30000;    // karakter per langkah pemetaan
export const TALKHIS_MAX_TOPICS = 40;
const TOPIC_MIN_CHARS = 500;               // judul yang lebih pendek digabung ke judul sebelumnya
const TOPIC_MAX_CHARS = 14000;             // ±7 halaman; lebih panjang → dipecah (١)، (٢) supaya talkhisnya muat
const WRITE_TOKENS = 4000;
const WRITE_TIME_MS = 52000;
export const MAX_WRITES = 2;               // tulis + 1× lengkapi/tulis ulang per judul
export const MAX_CHECKS = 3;
const MAX_CONTINUES = 3;
export const TRIAL_TOPICS = 2;             // akun coba gratis: 2 judul pertama yang ditulis

/* ── Pencarian anchor di teks asli (tanpa harakat, huruf alif/ya/ta marbuthah disamakan) ── */
const HARAKAT = /[ً-ٰٟـۖ-ۭ]/;
const foldChar = (c) => ({ 'إ': 'ا', 'أ': 'ا', 'آ': 'ا', 'ٱ': 'ا', 'ى': 'ي', 'ة': 'ه', 'ؤ': 'و', 'ئ': 'ي' }[c] || c.toLowerCase());

// Teks yang dinormalkan + posisi asli tiap karakternya.
const buildIndex = (text) => {
  let norm = '';
  const pos = [];
  let space = true;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (HARAKAT.test(c)) continue;
    if (/[\p{L}\p{N}]/u.test(c)) { norm += foldChar(c); pos.push(i); space = false; }
    else if (!space) { norm += ' '; pos.push(i); space = true; }
  }
  return { norm, pos };
};
const normalize = (s) => buildIndex(String(s || '')).norm.trim();

// Posisi anchor di teks asli, mencari mulai dari `from`. null kalau tidak ketemu.
const locate = (index, anchor, from) => {
  const words = normalize(anchor).split(' ').filter(Boolean);
  if (words.length < 2) return null;
  const startNorm = index.pos.findIndex(p => p >= from);
  if (startNorm < 0) return null;
  // Coba anchor penuh, lalu dipendekkan (AI kadang menambah/mengubah kata di ujung).
  for (const n of [words.length, 8, 6, 4].filter((n, i, a) => n <= words.length && a.indexOf(n) === i)) {
    if (n < 3 && words.length >= 3) continue;
    const needle = words.slice(0, n).join(' ');
    const at = index.norm.indexOf(needle, startNorm);
    if (at >= 0) return index.pos[at];
  }
  return null;
};

// Mundur ke awal baris supaya potongan tidak mulai di tengah kalimat; baris pendek tepat di atasnya
// (biasanya baris judul, mis. "باب ..." di atas kalimat pembuka) ikut masuk ke judul ini.
const lineStart = (text, at) => {
  const nl = at > 0 ? text.lastIndexOf('\n', at - 1) : -1;
  let start = nl >= 0 ? (at - nl < 200 ? nl + 1 : at) : (at < 200 ? 0 : at);
  if (start > 0 && start === nl + 1) {
    const prevNl = text.lastIndexOf('\n', start - 2);
    const prev = text.slice(prevNl + 1, start - 1).trim();
    if (prev && prev.length <= 60 && !/[.:،؛]$/.test(prev)) start = prevNl + 1;
  }
  return start;
};

const clip = (s, n) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, n);
const newId = () => crypto.randomBytes(5).toString('hex');

/* ── Prompt ── */

export const mapPrompt = (step, total, prevBab, prevTitle) => `Kamu menyusun فهرس المباحث (daftar pembahasan) dari muqarrar kuliah Al-Azhar untuk dibuatkan talkhis.
Yang dikirim adalah BAGIAN ${step} DARI ${total} dari muqarrar.${prevTitle ? `
Bagian sebelumnya berakhir di tengah pembahasan «${prevTitle}»${prevBab ? ` (dalam «${prevBab}»)` : ''}. Jangan ulangi judul itu; mulai dari judul BARU pertama di bagian ini.` : ''}

Tugas: sebut setiap mabhats (pembahasan) di bagian ini SESUAI URUTAN, dari awal sampai akhir, tanpa ada yang terlewat.
- "bab": nama كتاب/باب/فصل induknya dalam bahasa Arab (sama persis untuk judul-judul di bawah induk yang sama). Kosongkan kalau tidak ada.
- "title": judul mabhats dalam bahasa Arab, ringkas (2–8 kata), memakai istilah muqarrar. Kalau muqarrar punya judul sendiri, pakai judul itu.
- "anchor": 6–12 kata PERTAMA dari mabhats itu, disalin PERSIS dari teks (huruf yang sama, boleh tanpa harakat). Biasanya baris judulnya atau kalimat pertamanya. Ini dipakai untuk menemukan posisinya, jadi jangan diparafrase.
Ukuran mabhats: satu pokok bahasan yang utuh, kira-kira 1–6 halaman. Jangan memecah tiap paragraf jadi judul; jangan pula menggabung beberapa bab jadi satu judul.
Pengantar, daftar isi, dan muqaddimah umum boleh dijadikan satu judul "مقدمة" kalau ada isinya; lewati halaman sampul/daftar isi yang tanpa isi ilmu.
Balas HANYA JSON: {"items":[{"bab":"...","title":"...","anchor":"..."}]}`;

const WRITE_RULES = `Kamu penulis talkhis (تلخيص) muqarrar Al-Azhar untuk mahasiswa yang menghafal menjelang imtihan tahriri. Tulis SELURUHNYA dalam bahasa Arab fushah.

Prinsip:
- LENGKAP: setiap ta'rif, pembagian, syarat, rukun, hukum, masalah ijma' dan khilaf, pendapat beserta pemiliknya, dalil, angka/ukuran, pengecualian, dan faidah yang ada di sumber HARUS masuk. Yang diringkas adalah redaksinya, bukan isinya.
- SETIA SUMBER: gunakan HANYA isi sumber yang diberikan. Jangan menambah pendapat, dalil, nama ulama, atau hukum dari luar. Kalau sumber tidak menyebut yang rajih, jangan mengarang tarjih.
- PADAT: kalimat pendek, buang pengulangan dan uraian panjang; kira-kira 25–40% panjang sumber.
- Harakat lengkap pada nash (ayat, hadits, matan, ta'rif istilahi) dan pada istilah kunci.

Format (markdown, ikuti persis karena Talqeeh menampilkannya dengan gaya talkhisan):
- Jangan menulis ulang judul mabhats (sudah ditampilkan). Pakai sub-judul "#### " hanya untuk bagian yang memang ada di sumber, urut sesuai sumber, misalnya: #### النَّصّ ، #### غَرِيبُ الْأَلْفَاظِ ، #### التَّعْرِيفُ ، #### الْأَقْسَامُ ، #### الْمَسَائِلُ ، #### الْفَوَائِدُ.
- Nash yang dikutip (ayat, hadits, matan, ta'rif yang disebut kitab) ditulis di baris sendiri diawali "> " dan disalin kata per kata dari sumber.
- Setiap poin satu baris diawali "- ". Label poin ditebalkan lalu titik dua: "- **تَعْرِيفُ الزَّكَاةِ لُغَةً:** النَّمَاءُ وَالتَّطْهِيرُ."
- Kata gharib/mufradat: "- (اللَّفْظُ): مَعْنَاهُ." — lafaznya di dalam kurung di awal poin.
- Ijma': "- **أَجْمَعُوا عَلَى** ...".
- Khilaf: "- **اخْتَلَفُوا فِي ...:**" lalu pendapat-pendapatnya bernomor dengan indentasi 2 spasi:
  "  1. الْحَنَفِيَّةُ: ... ، وَدَلِيلُهُمْ: ..."
  "  2. الْجُمْهُورُ: ... ، وَدَلِيلُهُمْ: ..."
  lalu "  - **الرَّاجِحُ:** ... لِأَنَّ ..." bila sumber menyebutnya.
- Pembagian/syarat/rukun: poin berlabel lalu butir bernomor berindentasi 2 spasi.
- Gunakan "←" untuk sebab-akibat atau konsekuensi hukum.
- Tanpa tabel, tanpa pembuka atau penutup basa-basi, tanpa bahasa Indonesia.
- Terakhir, tambahkan "#### مَا يُتَوَقَّعُ فِي الِامْتِحَانِ" berisi 2–4 poin: bentuk soal yang paling mungkin dari mabhats ini (عَرِّفْ، اذْكُرْ، بَيِّنْ، قَارِنْ، مَا الدَّلِيلُ...) beserta poin jawaban yang wajib ditulis — diambil dari isi sumber.`;

export const writePrompt = () => WRITE_RULES;

const sourceMessage = (set, topic, src) =>
  `المقرر: ${set.title}\n${topic.bab ? `الباب: ${topic.bab}\n` : ''}المبحث: ${topic.title}\n\nنص المصدر (لخِّص هذا فقط):\n${src}`;

export const CHECK_PROMPT = `Kamu pemeriksa talkhis muqarrar Al-Azhar. Bandingkan TALKHIS dengan SUMBER-nya.
Periksa dua hal:
1. Poin ilmu di SUMBER yang tidak ada di TALKHIS: ta'rif, pembagian, syarat/rukun, hukum, masalah ijma'/khilaf, pendapat & pemiliknya, dalil, angka/ukuran, pengecualian. Abaikan contoh tambahan, pengulangan, dan gaya bahasa.
2. Isi TALKHIS yang tidak didukung SUMBER atau bertentangan dengannya (pendapat salah pemilik, angka salah, dalil yang tidak ada di sumber, tarjih karangan sendiri).
"score": 0–100 = seberapa lengkap TALKHIS mencakup poin penting SUMBER (100 = tidak ada yang terlewat).
"missing" dan "wrong": masing-masing maksimal 8 butir, tiap butir satu kalimat Arab singkat yang menyebut poinnya dengan jelas (supaya bisa dilengkapi). Kosongkan kalau tidak ada.
Balas HANYA JSON: {"score":0,"missing":["..."],"wrong":["..."]}`;

const completeAsk = (cov) => `هذا تلخيصك السابق لهذا المبحث. راجعه على نص المصدر وأعد كتابته كاملًا بالتنسيق نفسه:
- احتفظ بكل ما هو صحيح.${cov?.missing?.length ? `
- أضف هذه النقاط الناقصة في مواضعها المناسبة:
${cov.missing.map(m => `  • ${m}`).join('\n')}` : ''}${cov?.wrong?.length ? `
- صحِّح هذه الأخطاء وفق المصدر أو احذفها:
${cov.wrong.map(m => `  • ${m}`).join('\n')}` : ''}
- لا تضف شيئًا من خارج المصدر.
اكتب التلخيص الكامل المعدَّل فقط.`;

const CONTINUE_ASK = 'تَوَقَّفَ تلخيصك قبل أن يكتمل. أكمِل مباشرةً من بعد السطر الأخير بالتنسيق نفسه، دون تكرار ما كُتب. إن كان التلخيص قد اكتمل فاكتب فقط: [تم]';

/* ── Data ── */

export const cleanTalkhis = (t) => (t && typeof t === 'object' && Array.isArray(t.topics) ? t : null);

// Bentuk yang dikirim ke browser: tanpa catatan pemetaan mentah.
export const publicTalkhis = (t) => {
  if (!t) return null;
  const { raw, ...rest } = t;
  return rest;
};

// Ubah hasil pemetaan semua bagian menjadi daftar judul dengan batas sumber yang pasti.
export const buildTopics = (content, raw) => {
  const index = buildIndex(content);
  const found = [];
  let from = 0;
  for (const part of raw) {
    const items = Array.isArray(part.items) ? part.items : [];
    items.forEach((it, k) => {
      const title = clip(it.title, 80);
      if (!title) return;
      let at = locate(index, it.anchor, from);
      // Anchor tidak ketemu: perkirakan dari urutannya di dalam bagian itu.
      if (at == null) at = Math.max(from, Math.round(part.start + ((k + 0.5) / Math.max(1, items.length)) * (part.end - part.start)));
      at = Math.max(from, lineStart(content, at));
      found.push({ bab: clip(it.bab, 80), title, start: at });
      from = at + 1;
    });
  }
  if (!found.length) found.push({ bab: '', title: 'المادة كاملة', start: 0 });
  found[0].start = 0;
  // Batas: dari awal judul sampai awal judul berikutnya.
  let topics = found.map((t, i) => ({ ...t, end: i + 1 < found.length ? found[i + 1].start : content.length }))
    .filter(t => t.end > t.start);
  // Judul berurutan yang sama → satu.
  topics = topics.reduce((acc, t) => {
    const prev = acc[acc.length - 1];
    if (prev && normalize(prev.title) === normalize(t.title)) { prev.end = t.end; return acc; }
    acc.push(t); return acc;
  }, []);
  // Terlalu pendek → gabung ke sebelumnya (atau ke berikutnya untuk yang pertama).
  for (let i = 0; i < topics.length && topics.length > 1;) {
    if (topics[i].end - topics[i].start >= TOPIC_MIN_CHARS) { i++; continue; }
    if (i > 0) { topics[i - 1].end = topics[i].end; topics.splice(i, 1); }
    else { topics[1].start = topics[0].start; topics.splice(0, 1); }
  }
  // Terlalu panjang → pecah di batas paragraf.
  const split = [];
  for (const t of topics) {
    const len = t.end - t.start;
    if (len <= TOPIC_MAX_CHARS) { split.push(t); continue; }
    const pieces = splitChunks(content.slice(t.start, t.end), Math.ceil(len / Math.ceil(len / TOPIC_MAX_CHARS)) + 500);
    let cursor = t.start;
    pieces.forEach((p, k) => {
      const head = p.slice(0, 40);
      const at = k === 0 ? t.start : Math.max(cursor, content.indexOf(head, cursor));
      split.push({ ...t, title: `${t.title} (${(k + 1).toLocaleString('ar-EG')})`, start: at < 0 ? cursor : at, end: t.end });
      cursor = (at < 0 ? cursor : at) + 1;
    });
  }
  for (let i = 0; i < split.length - 1; i++) split[i].end = split[i + 1].start;
  // Terlalu banyak judul → gabungkan pasangan bersebelahan (dalam bab yang sama) yang paling pendek.
  while (split.length > TALKHIS_MAX_TOPICS) {
    let best = -1, size = Infinity;
    for (let i = 1; i < split.length; i++) {
      const s = (split[i].end - split[i - 1].start) + (split[i].bab === split[i - 1].bab ? 0 : 1e9);
      if (s < size) { size = s; best = i; }
    }
    split[best - 1].end = split[best].end;
    split[best - 1].title = `${split[best - 1].title} — ${split[best].title}`.slice(0, 120);
    split.splice(best, 1);
  }
  return split.map(t => ({
    id: newId(), bab: t.bab, title: t.title, start: t.start, end: t.end,
    status: 'empty', text: '', writes: 0, checks: 0, continues: 0, partial: false, coverage: null, model: null, skip: false,
  }));
};

export const topicSource = (content, topic) => content.slice(topic.start, topic.end).trim();

/* ── Handler ── */

/* deps: fungsi dari api/ai-partner.js (supaya kuota, tier, dan penyimpanan memakai aturan yang sama). */
export async function handleTalkhis(ctx, body, res, deps) {
  const { getOwnedSet, saveTalkhis, takeQuota, quotaExceeded, upgradeRequired, getTrialSetId, trialGateOpen, trialGateClosed,
    consumeQuota, resolveModels, requestAI, callAIJson, runAI, sendResult } = deps;
  const op = String(body.op || '');
  const set = await getOwnedSet(ctx.code, body.set_id, 'id,title,content,talkhis');
  if (!set) {
    // Kolom talkhis belum ada (migrasi belum dijalankan) membuat query di atas gagal; bedakan dari materi yang memang tidak ada.
    if (await getOwnedSet(ctx.code, body.set_id, 'id')) {
      return res.status(503).json({ ok: false, error: 'Fitur talkhis belum aktif di server (migrasi database belum dijalankan).' });
    }
    return res.status(404).json({ ok: false, error: 'Materi tidak ditemukan' });
  }
  let t = cleanTalkhis(set.talkhis);
  const trial = ctx.tier !== 'pro';
  if (trial) {
    const tr = await getTrialSetId(ctx.code);
    if (tr.setId !== set.id) return upgradeRequired(res, 'trial_set', 'Coba gratis hanya berlaku untuk materi pertamamu. Berlangganan untuk membuat talkhis di materi ini.');
  }
  const done = (data = {}) => res.status(200).json({ ok: true, talkhis: publicTalkhis(t), ...data });
  const topicOf = () => t?.topics.find(x => x.id === body.topic_id);

  /* Pemetaan: satu bagian per request. Kuota diambil di langkah pertama. */
  if (op === 'map') {
    const chunks = splitChunks(set.content, TALKHIS_MAP_CHUNK);
    if (!t) {
      if (trial) {
        if (!(await trialGateOpen())) return trialGateClosed(res);
      } else {
        const over = await takeQuota(ctx, 'talkhis');
        if (over) return quotaExceeded(res, 'talkhis', over, ctx);
      }
      t = { v: 1, stage: 'map', map_step: 0, map_steps: chunks.length, raw: [], topics: [], created_at: new Date().toISOString() };
    }
    if (t.stage !== 'map') return done();
    // Posisi tiap bagian di teks asli (untuk perkiraan bila anchor tidak ketemu).
    let cursor = 0;
    const spans = chunks.map(c => {
      const head = c.slice(0, 60);
      const at = Math.max(cursor, set.content.indexOf(head, cursor));
      cursor = at + c.length;
      return { start: at, end: Math.min(set.content.length, at + c.length) };
    });
    const step = t.map_step;
    const last = t.raw[t.raw.length - 1]?.items?.slice(-1)[0];
    const models = await resolveModels();
    const out = await callAIJson({
      system: mapPrompt(step + 1, chunks.length, last?.bab, last?.title),
      messages: [{ role: 'user', content: `${set.title}\n\nالجزء ${step + 1}:\n${chunks[step]}` }],
      maxTokens: 3000, model: models.default, temperature: 0,
    });
    const items = (Array.isArray(out?.items) ? out.items : []).slice(0, 60)
      .map(it => ({ bab: clip(it?.bab, 80), title: clip(it?.title, 80), anchor: clip(it?.anchor, 160) }))
      .filter(it => it.title);
    t.raw.push({ ...spans[step], items });
    t.map_step = step + 1;
    if (t.map_step >= chunks.length) {
      t.topics = buildTopics(set.content, t.raw);
      t.raw = [];
      t.stage = 'outline';
    }
    await saveTalkhis(ctx.code, set.id, t);
    return done();
  }

  if (!t || t.stage === 'map') return res.status(400).json({ ok: false, error: 'Petakan mabahits dulu.' });

  /* Merapikan daftar judul (tanpa AI). */
  if (op === 'edit') {
    const i = t.topics.findIndex(x => x.id === body.topic_id);
    if (i < 0) return res.status(404).json({ ok: false, error: 'Judul tidak ditemukan' });
    const topic = t.topics[i];
    if (body.edit === 'rename') {
      const title = clip(body.title, 120);
      if (!title) return res.status(400).json({ ok: false, error: 'Judul kosong' });
      topic.title = title;
    } else if (body.edit === 'skip') {
      topic.skip = !topic.skip;
    } else if (body.edit === 'merge-prev') {
      if (i === 0) return res.status(400).json({ ok: false, error: 'Judul pertama tidak bisa digabung ke atas' });
      const prev = t.topics[i - 1];
      if (topic.end - prev.start > TOPIC_MAX_CHARS * 1.6) return res.status(400).json({ ok: false, error: 'Gabungannya terlalu panjang untuk satu talkhis.' });
      // Talkhis yang sudah ada tidak berlaku lagi karena sumbernya berubah; jatah tulis tetap terhitung.
      prev.end = topic.end;
      prev.status = 'empty'; prev.text = ''; prev.coverage = null; prev.partial = false; prev.continues = 0;
      prev.writes = Math.max(prev.writes, topic.writes);
      prev.checks = Math.max(prev.checks, topic.checks);
      t.topics.splice(i, 1);
    } else return res.status(400).json({ ok: false, error: 'Perubahan tidak dikenal' });
    await saveTalkhis(ctx.code, set.id, t);
    return done();
  }

  // Petakan ulang dari awal (pelanggan saja; pemetaan berikutnya memakai kuota baru).
  if (op === 'reset') {
    if (trial) return upgradeRequired(res, 'talkhis_reset', 'Coba gratis hanya bisa memetakan sekali. Berlangganan untuk memetakan ulang.');
    await saveTalkhis(ctx.code, set.id, null);
    t = null;
    return done();
  }

  const topic = topicOf();
  if (!topic) return res.status(404).json({ ok: false, error: 'Judul tidak ditemukan' });
  const src = topicSource(set.content, topic);
  const models = await resolveModels();

  /* Menulis: baru, melengkapi (pakai hasil cek), atau melanjutkan yang terpotong. */
  if (op === 'write') {
    const mode = ['new', 'complete', 'continue'].includes(body.mode) ? body.mode : 'new';
    if (mode === 'continue') {
      if (!topic.partial || !topic.text) return res.status(400).json({ ok: false, error: 'Talkhis ini sudah lengkap.' });
      if (topic.continues >= MAX_CONTINUES) return res.status(400).json({ ok: false, error: 'Talkhis ini terlalu panjang untuk dilanjutkan lagi.' });
    } else {
      if (topic.writes >= MAX_WRITES) {
        return res.status(429).json({ ok: false, error: `Judul ini sudah ditulis ${MAX_WRITES}x. Talkhis yang ada tetap bisa dicek dan diunduh.` });
      }
      if (mode === 'complete' && (!topic.text || !topic.coverage)) return res.status(400).json({ ok: false, error: 'Cek kelengkapannya dulu.' });
      if (trial) {
        const written = t.topics.filter(x => x.writes > 0).length;
        if (topic.writes === 0 && written >= TRIAL_TOPICS) {
          return upgradeRequired(res, 'talkhis_trial', `Coba gratis bisa membuat talkhis ${TRIAL_TOPICS} judul. Berlangganan AI Partner untuk men-talkhis seluruh muqarrar.`);
        }
        if (!(await trialGateOpen())) return trialGateClosed(res);
        if (!(await consumeQuota(ctx.code, 'talkhis_trial', 6))) {
          return upgradeRequired(res, 'talkhis_trial', 'Jatah coba talkhis gratis sudah terpakai. Berlangganan AI Partner untuk melanjutkan.');
        }
      } else if (!(await consumeQuota(ctx.code, 'talkhis_write', 120))) {
        return res.status(429).json({ ok: false, error: 'Batas wajar talkhis hari ini tercapai. Lanjutkan besok, ya.' });
      }
    }
    const base = [{ role: 'user', content: sourceMessage(set, topic, src) }];
    const messages = mode === 'new' ? base
      : mode === 'complete' ? [...base, { role: 'assistant', content: topic.text }, { role: 'user', content: completeAsk(topic.coverage) }]
      : [...base, { role: 'assistant', content: topic.text }, { role: 'user', content: CONTINUE_ASK }];
    const { out, stream, failed } = await runAI(body, res, {
      system: WRITE_RULES, messages, maxTokens: WRITE_TOKENS, model: models.arabic, timeLimitMs: WRITE_TIME_MS,
    });
    if (failed) return;
    let text;
    if (mode === 'continue') {
      const finished = /^\s*\[تم\]\s*$/.test(out.text);
      const more = out.text.replace(/\[تم\]\s*$/, '').trim();
      text = finished || !more ? topic.text : `${topic.text.trimEnd()}\n${more}`;
      topic.continues += 1;
      topic.partial = !finished && !!out.truncated && topic.continues < MAX_CONTINUES;
    } else {
      text = out.text.trim();
      topic.writes += 1;
      topic.continues = 0;
      topic.partial = !!out.truncated;
      topic.coverage = null;
    }
    // Baris terakhir yang terpotong dibuang supaya lanjutan mulai dari baris utuh.
    if (topic.partial) { const cut = text.lastIndexOf('\n'); if (cut > text.length * 0.5) text = text.slice(0, cut).trimEnd(); }
    topic.text = text.slice(0, 40000);
    topic.status = 'done';
    topic.model = out.model;
    await saveTalkhis(ctx.code, set.id, t);
    return sendResult(res, stream, { talkhis: publicTalkhis(t), topic_id: topic.id });
  }

  /* Cek kelengkapan terhadap sumber. */
  if (op === 'check') {
    if (!topic.text) return res.status(400).json({ ok: false, error: 'Tulis talkhisnya dulu.' });
    if (topic.checks >= MAX_CHECKS) return res.status(429).json({ ok: false, error: 'Judul ini sudah dicek berkali-kali. Tulis ulang dulu kalau mau dicek lagi.' });
    if (trial && !(await trialGateOpen())) return trialGateClosed(res);
    const r = await callAIJson({
      system: CHECK_PROMPT,
      messages: [{ role: 'user', content: `SUMBER:\n${src}\n\n=====\nTALKHIS:\n${topic.text}` }],
      maxTokens: 1500, model: models.default, temperature: 0, thinking: 1024,
    });
    const list = (v) => (Array.isArray(v) ? v : []).map(s => clip(s, 220)).filter(Boolean).slice(0, 8);
    const score = Math.max(0, Math.min(100, Math.round(Number(r?.score) || 0)));
    topic.coverage = { score, missing: list(r?.missing), wrong: list(r?.wrong), at: new Date().toISOString() };
    topic.checks += 1;
    await saveTalkhis(ctx.code, set.id, t);
    return done({ topic_id: topic.id });
  }

  return res.status(400).json({ ok: false, error: 'Perintah talkhis tidak dikenal' });
}

// Status kelengkapan satu judul (dipakai juga di browser dengan aturan yang sama).
export const topicState = (x) => {
  if (x.skip) return 'skip';
  if (!x.text) return 'empty';
  if (x.partial) return 'partial';
  if (!x.coverage) return 'unchecked';
  return x.coverage.score >= 90 && !x.coverage.missing.length && !x.coverage.wrong.length ? 'complete' : 'incomplete';
};
