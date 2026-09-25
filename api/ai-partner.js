import crypto from 'crypto';
import { verifyToken } from './admin-auth.js';
import { sbConfig, sbHeaders, normalizeCode, requireAiTier, consumeQuota, isActiveMember } from './_lib/member.js';
import { callAI, callAIJson, requestAI, streamAI, friendlyAiError, aiErrorDetail } from './_lib/ai.js';
import { resolveModels, isValidModelId, clearModelCache } from './_lib/models.js';
import {
  PROMPTS, SUMMARY_LANGS, summaryPrompt, GRADE_PROMPT, IRAB_PROMPT, TASYKIL_PROMPT,
  OCR_PROMPT, transcribePrompt, TRANSCRIBE_DIALECTS, tutorSystem, syafawiSystem, learnerContext,
  SUMMARY_MAP_NOTE, SUMMARY_REDUCE_NOTE, gradeUserPrompt, promptChatSystem,
} from './_lib/ai-partner/prompts.js';
import { handleEvalAdmin } from './_lib/ai-partner/eval.js';
import { getMonthlyLimits, cachedMonthlyLimits } from './_lib/ai-partner/limits.js';
import { splitChunks, spreadSample, stickyExcerpt } from './_lib/ai-partner/chunks.js';
import {
  isStr, cleanFlashcards, cleanQuiz, cleanGlossary, cleanMindmap, cleanEssays,
  cleanGrade, cleanIrab, cleanProgressPatch,
} from './_lib/ai-partner/sanitize.js';

// Kuota harian pelanggan. Pengguna coba gratis dibatasi per materi (lihat TRIAL_*), bukan per hari.
const LIMITS = { create: 10, ocr: 20, transcribe: 60, generate: 25, analyze: 30, grade: 20, chat: 40, prompt: 40 };
const TRIAL_OCR_LIMIT  = 3;
const TRIAL_KINDS      = ['summary', 'flashcards', 'quiz', 'glossary'];
const PRO_ONLY_ACTIONS = ['transcribe', 'analyze', 'grade', 'chat'];
// Tanya AI untuk pengguna coba gratis: satu percakapan, maksimal sekian pesan seumur akun.
const TRIAL_PROMPT_MESSAGES = 5;

// Materi panjang (±100 halaman) disimpan utuh; tiap permintaan AI hanya menerima potongan yang muat.
const MAX_CONTENT       = 200000;
const TRIAL_MAX_CONTENT = 60000;   // coba gratis tetap dibatasi supaya biaya terkendali
const SINGLE_PASS_CHARS = 60000;   // muat dalam satu permintaan
const STUDY_SAMPLE_CHARS = 30000;  // flashcard/kuis/mufradat: contoh materi secukupnya
const MAP_CHUNK_CHARS   = 40000;   // ringkasan materi panjang: dibaca per bagian sebesar ini
const MAP_PART_TOKENS   = 1800;
const MIN_CONTENT     = 50;
const CHAT_HISTORY    = 12;
// Ringkasan dibuat bertahap supaya tiap request selesai di bawah batas 60 detik Vercel.
const SUMMARY_PART_TOKENS = 3000;
const MAX_SUMMARY_PARTS   = 4;
const CHAT_MAX_STORED = 60;
const MAX_ANALYSES    = 40;
const MAX_ATTEMPTS    = 30;
const MAX_CARDS       = 80;
const MAX_AUDIO_B64   = 2_800_000; // ±60 detik WAV 16kHz mono
const SOURCE_TYPES = ['pdf', 'foto', 'teks', 'docx', 'pptx', 'xlsx', 'txt', 'audio', 'video', 'campuran'];
const GENERATE_KINDS = ['summary', 'flashcards', 'quiz', 'glossary', 'mindmap', 'essays'];
// Memakai setelan "model belajar" (aiModelStudy); jenis lain memakai model utama.
const STUDY_KINDS = ['flashcards', 'quiz', 'glossary'];

const statusAttempts = new Map();
const checkStatusRateLimit = (ip) => {
  const now = Date.now();
  const recent = (statusAttempts.get(ip) || []).filter(t => now - t < 15 * 60 * 1000);
  if (recent.length >= 60) return false;
  recent.push(now);
  statusAttempts.set(ip, recent);
  return true;
};

const parseBody = (req) => new Promise((resolve) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try { resolve(JSON.parse(body || '{}')); }
    catch { resolve(null); }
  });
});

/* ── Supabase helpers ── */

const getOwnedSet = async (code, setId, select = '*') => {
  if (!setId || typeof setId !== 'string') return null;
  const { url, key } = sbConfig();
  const r = await fetch(
    `${url}/rest/v1/study_sets?id=eq.${encodeURIComponent(setId)}&member_code=eq.${encodeURIComponent(code)}&select=${select}&limit=1`,
    { headers: sbHeaders(key) }
  );
  const rows = await r.json();
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
};

const updateSet = async (code, setId, patch) => {
  const { url, key } = sbConfig();
  const r = await fetch(
    `${url}/rest/v1/study_sets?id=eq.${encodeURIComponent(setId)}&member_code=eq.${encodeURIComponent(code)}`,
    {
      method: 'PATCH',
      headers: sbHeaders(key, { Prefer: 'return=minimal' }),
      body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
    }
  );
  if (!r.ok) throw new Error(`Gagal menyimpan (${r.status})`);
};

// null = kolom belum ada (migrasi v2 belum dijalankan) atau jatah belum dipakai.
const getTrialSetId = async (code) => {
  const { url, key } = sbConfig();
  const r = await fetch(
    `${url}/rest/v1/members?code=eq.${encodeURIComponent(code)}&select=ai_trial_set_id&limit=1`,
    { headers: sbHeaders(key) }
  );
  if (!r.ok) return { available: false, setId: null };
  const rows = await r.json();
  return { available: true, setId: Array.isArray(rows) && rows[0] ? rows[0].ai_trial_set_id : null };
};

// Total pemakaian sepanjang masa untuk satu jenis kuota (ai_usage menyimpan per hari).
const lifetimeUsage = async (code, kind) => {
  const { url, key } = sbConfig();
  const r = await fetch(
    `${url}/rest/v1/ai_usage?member_code=eq.${encodeURIComponent(code)}&kind=eq.${encodeURIComponent(kind)}&select=count`,
    { headers: sbHeaders(key) }
  );
  if (!r.ok) return Infinity; // gagal membaca → anggap habis (fail closed)
  const rows = await r.json();
  return (Array.isArray(rows) ? rows : []).reduce((n, row) => n + (Number(row.count) || 0), 0);
};

// Klaim jatah coba gratis secara atomik; false kalau sudah terpakai.
const claimTrial = async (code, setId) => {
  const { url, key } = sbConfig();
  const r = await fetch(
    `${url}/rest/v1/members?code=eq.${encodeURIComponent(code)}&ai_trial_set_id=is.null&select=code`,
    {
      method: 'PATCH',
      headers: sbHeaders(key, { Prefer: 'return=representation' }),
      body: JSON.stringify({ ai_trial_set_id: setId }),
    }
  );
  if (!r.ok) return false;
  const rows = await r.json();
  return Array.isArray(rows) && rows.length > 0;
};

const releaseTrial = async (code, setId) => {
  const { url, key } = sbConfig();
  await fetch(
    `${url}/rest/v1/members?code=eq.${encodeURIComponent(code)}&ai_trial_set_id=eq.${encodeURIComponent(setId)}`,
    { method: 'PATCH', headers: sbHeaders(key, { Prefer: 'return=minimal' }), body: JSON.stringify({ ai_trial_set_id: null }) }
  ).catch(() => {});
};

/* ── Respon umum ── */

/* Kuota "bulanan" berlaku per periode 30 hari langganan, dihitung mundur dari tanggal habis — jadi tiap
   pembeli dapat jatah yang sama berapa pun tanggal belinya, dan perpanjangan lebih awal tidak menggandakan
   jatah periode yang sedang berjalan. Akses tanpa tanggal habis (manual admin / Membership lama) memakai
   bulan kalender. */
const QUOTA_CYCLE_MS = 30 * 86400000;
const quotaPeriod = (expiresAt) => {
  const end = expiresAt ? Date.parse(expiresAt) : NaN;
  const now = Date.now();
  if (!Number.isFinite(end) || end <= now) {
    const d = new Date();
    return {
      start: `${d.toISOString().slice(0, 7)}-01`,
      resetAt: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)).toISOString(),
    };
  }
  const startMs = end - Math.ceil((end - now) / QUOTA_CYCLE_MS) * QUOTA_CYCLE_MS;
  return { start: new Date(startMs).toISOString().slice(0, 10), resetAt: new Date(startMs + QUOTA_CYCLE_MS).toISOString() };
};
const formatQuotaDate = (iso) => new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', timeZone: 'Asia/Jakarta' });

const quotaExceeded = (res, kind, scope = 'daily', ctx = null) => scope === 'unavailable'
  ? res.status(503).json({ ok: false, error: 'Tidak bisa memeriksa kuota sekarang. Coba lagi sebentar.' })
  : res.status(429).json({
    ok: false, error: 'quota', scope,
    message: scope === 'monthly'
      ? `Jatah ${cachedMonthlyLimits()[kind]}x untuk fitur ini di periode langgananmu sudah habis. Jatah baru mulai ${formatQuotaDate(ctx?.quotaResetAt || quotaPeriod(null).resetAt)}.`
      : `Batas harian (${LIMITS[kind]}x) untuk fitur ini tercapai. Coba lagi besok.`,
  });

// Pemakaian sejak tanggal `since` per jenis: { chat: 12, … }. Gagal membaca → null (pemanggil memutuskan).
const monthlyUsage = async (code, since) => {
  const { url, key } = sbConfig();
  const r = await fetch(
    `${url}/rest/v1/ai_usage?member_code=eq.${encodeURIComponent(code)}&day=gte.${since}&select=kind,count`,
    { headers: sbHeaders(key) }
  );
  if (!r.ok) return null;
  const rows = await r.json();
  return (Array.isArray(rows) ? rows : []).reduce((m, row) => ({ ...m, [row.kind]: (m[row.kind] || 0) + (Number(row.count) || 0) }), {});
};

// Pakai satu jatah pelanggan: cek kuota bulanan dulu, lalu catat di kuota harian (atomik).
// Mengembalikan null kalau boleh, 'monthly' / 'daily' kalau habis, atau 'unavailable' kalau pemakaian
// tidak bisa dibaca (ditolak sementara — fail closed, tanpa mengaku kuota habis).
const takeQuota = async (ctx, kind) => {
  const monthly = (await getMonthlyLimits())[kind];
  if (monthly != null) {
    const period = quotaPeriod(ctx.aiExpiresAt);
    ctx.quotaResetAt = period.resetAt;
    const used = await monthlyUsage(ctx.code, period.start);
    if (!used) return 'unavailable';
    if ((used[kind] || 0) >= monthly) return 'monthly';
  }
  return (await consumeQuota(ctx.code, kind, LIMITS[kind])) ? null : 'daily';
};

const upgradeRequired = (res, feature, message) =>
  res.status(403).json({
    ok: false, error: 'upgrade', feature,
    message: message || 'Fitur ini khusus pelanggan AI Partner. Berlangganan untuk membuka semua fitur.',
  });

// Materi yang lebih panjang dari satu permintaan diwakili contoh merata dari seluruh bab.
const materialMessage = (set, limit = SINGLE_PASS_CHARS) => {
  const long = set.content.length > limit;
  const body = long ? spreadSample(set.content, limit) : set.content;
  const note = long ? '\n(Materi panjang: berikut contoh merata dari seluruh materi; bagian yang dilewati ditandai […]. Sebarkan hasilmu ke semua bagian.)' : '';
  return [{ role: 'user', content: `Judul materi: ${set.title}${note}\n\nMATERI:\n${body}` }];
};

/* ── Balasan bertahap (streaming) ──
   Browser yang mengirim `stream: true` menerima NDJSON: {"t":"delta","d":"…"} per potongan teks, lalu
   {"t":"done",…hasil} atau {"t":"error","error":…}. Kalau platform menahan stream, browser tetap menerima
   semuanya di akhir — hasilnya sama, hanya tidak bertahap. */
const openStream = (res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();
  const send = (obj) => res.write(JSON.stringify(obj) + '\n');
  return {
    delta: (d) => send({ t: 'delta', d }),
    done: (data) => { send({ t: 'done', ...data }); res.end(); },
    fail: (error, detail) => { send({ t: 'error', ok: false, error, ...(detail ? { detail } : {}) }); res.end(); },
  };
};

// Panggil AI biasa, atau bertahap kalau diminta. Kegagalan di tengah stream dilaporkan lewat stream itu sendiri.
const runAI = async (body, res, opts) => {
  if (body.stream !== true) return { out: await requestAI(opts), stream: null };
  const stream = openStream(res);
  try {
    return { out: await streamAI(opts, stream.delta), stream };
  } catch (err) {
    console.error('[ai-partner:stream]', err.message);
    stream.fail(friendlyAiError(err), aiErrorDetail(err));
    return { failed: true };
  }
};

const sendResult = (res, stream, data) => (stream ? stream.done({ ok: true, ...data }) : res.status(200).json({ ok: true, ...data }));

// Catat model yang membuat tiap hasil (untuk membandingkan kualitas antar model).
const withModel = (set, kind, model) => ({ ...(set.progress?.models && typeof set.progress.models === 'object' ? set.progress.models : {}), [kind]: model });

const mergeProgress = (set, patch) => ({ ...(set.progress && typeof set.progress === 'object' ? set.progress : {}), ...patch });

/* ── Member actions ── */

async function handleOcr(ctx, body, res) {
  const { foto_base64, mime_type } = body;
  if (!isStr(foto_base64) || !isStr(mime_type) || !mime_type.startsWith('image/')) {
    return res.status(400).json({ ok: false, error: 'Foto tidak valid' });
  }
  if (foto_base64.length > 3_500_000) return res.status(400).json({ ok: false, error: 'Foto terlalu besar' });
  if (ctx.tier === 'pro') {
    const over = await takeQuota(ctx, 'ocr');
    if (over) return quotaExceeded(res, 'ocr', over, ctx);
  } else if (!(await consumeQuota(ctx.code, 'ocr', TRIAL_OCR_LIMIT))) {
    return upgradeRequired(res, 'ocr', `Coba gratis bisa membaca ${TRIAL_OCR_LIMIT} foto per hari. Berlangganan untuk membaca lebih banyak.`);
  }

  const teks = await callAI({
    model: (await resolveModels()).vision,
    maxTokens: 3000,
    temperature: 0,
    messages: [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: `data:${mime_type};base64,${foto_base64}` } },
        { type: 'text', text: OCR_PROMPT },
      ],
    }],
  });
  if (teks.includes('FOTO_TIDAK_TERBACA')) {
    return res.status(200).json({ ok: false, error: 'Foto tidak memuat teks yang terbaca. Coba foto lebih jelas.' });
  }
  return res.status(200).json({ ok: true, teks });
}

async function handleTranscribe(ctx, body, res) {
  const audio = body.audio_base64;
  // WAV selalu diawali "RIFF" → base64 "UklGR".
  if (!isStr(audio) || !audio.startsWith('UklGR')) return res.status(400).json({ ok: false, error: 'Potongan audio tidak valid' });
  if (audio.length > MAX_AUDIO_B64) return res.status(400).json({ ok: false, error: 'Potongan audio terlalu besar' });
  const overAudio = await takeQuota(ctx, 'transcribe');
  if (overAudio === 'daily') {
    return res.status(429).json({ ok: false, error: 'quota', message: `Batas transkripsi harian (${LIMITS.transcribe} menit) tercapai. Coba lagi besok.` });
  }
  if (overAudio === 'unavailable') return quotaExceeded(res, 'transcribe', overAudio, ctx);
  if (overAudio) {
    return res.status(429).json({ ok: false, error: 'quota', message: `Jatah transkripsi ${cachedMonthlyLimits().transcribe} menit di periode langgananmu sudah habis. Jatah baru mulai ${formatQuotaDate(ctx.quotaResetAt || quotaPeriod(null).resetAt)}.` });
  }

  const dialect = TRANSCRIBE_DIALECTS.includes(body.dialect) ? body.dialect : 'campur';
  const text = await callAI({
    model: (await resolveModels()).transcribe,
    maxTokens: 2500,
    temperature: 0,
    messages: [{
      role: 'user',
      content: [
        { type: 'input_audio', input_audio: { data: audio, format: 'wav' } },
        { type: 'text', text: transcribePrompt({ dialect, title: body.title, prevTail: body.prev_tail }) },
      ],
    }],
  });
  const teks = text.trim() === '[HENING]' ? '' : text.trim();
  return res.status(200).json({ ok: true, teks });
}

async function handleCreate(ctx, body, res) {
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  if (content.length < MIN_CONTENT) {
    return res.status(400).json({ ok: false, error: `Materi terlalu pendek (min ${MIN_CONTENT} karakter)` });
  }
  const sourceType = SOURCE_TYPES.includes(body.source_type) ? body.source_type : 'teks';
  const limit = ctx.tier === 'trial' ? TRIAL_MAX_CONTENT : MAX_CONTENT;

  const id = crypto.randomUUID();
  if (ctx.tier === 'trial') {
    if (['audio', 'video'].includes(sourceType)) return upgradeRequired(res, 'audio');
    if (!(await claimTrial(ctx.code, id))) {
      return upgradeRequired(res, 'trial_used', 'Jatah coba gratis (1 materi) sudah terpakai. Berlangganan AI Partner untuk menambah materi baru.');
    }
  } else {
    const over = await takeQuota(ctx, 'create');
    if (over) return quotaExceeded(res, 'create', over, ctx);
  }

  const { url, key } = sbConfig();
  const r = await fetch(`${url}/rest/v1/study_sets`, {
    method: 'POST',
    headers: sbHeaders(key, { Prefer: 'return=minimal' }),
    body: JSON.stringify({
      id,
      member_code: ctx.code,
      title:       (isStr(body.title) ? body.title.trim() : 'Materi tanpa judul').slice(0, 120),
      maddah_id:   isStr(body.maddah_id) ? body.maddah_id.slice(0, 80) : null,
      source_type: sourceType,
      content:     content.slice(0, limit),
    }),
  });
  if (!r.ok) {
    if (ctx.tier === 'trial') await releaseTrial(ctx.code, id);
    throw new Error(`Gagal menyimpan materi (${r.status})`);
  }
  return res.status(200).json({ ok: true, id, truncated: content.length > limit, limit });
}

async function handleList(ctx, res) {
  const { url, key } = sbConfig();
  const r = await fetch(
    `${url}/rest/v1/study_sets?member_code=eq.${encodeURIComponent(ctx.code)}&select=id,title,maddah_id,source_type,quiz_best_score,flashcards,progress,created_at,updated_at&order=created_at.desc&limit=100`,
    { headers: sbHeaders(key) }
  );
  const rows = await r.json();
  // Hanya ringkasan kartu yang dikirim (jumlah & yang jatuh tempo), bukan isinya.
  const now = Date.now();
  const data = (Array.isArray(rows) ? rows : []).map(({ flashcards, ...s }) => {
    const cards = Array.isArray(flashcards) ? flashcards : [];
    return {
      ...s,
      card_count: cards.length,
      cards_due:  cards.filter(c => !c.due || Date.parse(c.due) <= now).length,
    };
  });
  return res.status(200).json({ ok: true, data });
}

async function handleGet(ctx, body, res) {
  const set = await getOwnedSet(ctx.code, body.set_id);
  if (!set) return res.status(404).json({ ok: false, error: 'Materi tidak ditemukan' });
  return res.status(200).json({ ok: true, data: set });
}

async function handleDelete(ctx, body, res) {
  if (!isStr(body.set_id)) return res.status(400).json({ ok: false, error: 'set_id wajib' });
  const { url, key } = sbConfig();
  // Jatah coba gratis tidak dikembalikan: ai_trial_set_id tetap menunjuk materi yang dihapus.
  const r = await fetch(
    `${url}/rest/v1/study_sets?id=eq.${encodeURIComponent(body.set_id)}&member_code=eq.${encodeURIComponent(ctx.code)}&select=id`,
    { method: 'DELETE', headers: sbHeaders(key, { Prefer: 'return=representation' }) }
  );
  if (!r.ok) return res.status(500).json({ ok: false, error: 'Gagal menghapus materi. Coba lagi sebentar.' });
  const rows = await r.json().catch(() => []);
  if (!Array.isArray(rows) || rows.length === 0) return res.status(404).json({ ok: false, error: 'Materi tidak ditemukan atau sudah dihapus.' });
  return res.status(200).json({ ok: true });
}

const GENERATE_FIELD = {
  summary: 'summary', flashcards: 'flashcards', quiz: 'quiz',
  glossary: 'glossary', mindmap: 'mindmap', essays: 'essays',
};

/* ── Ringkasan bertahap ──
   Satu request dibatasi SUMMARY_PART_TOKENS supaya selesai < 60 detik. Kalau AI terpotong, bagian yang sudah
   lengkap disimpan (progress.summary_partial) dan browser otomatis meminta lanjutan (generate + continue).
   Materi panjang (> SINGLE_PASS_CHARS): tiap bagian dicatat dulu (tahap "map"), lalu semua catatan digabung
   jadi satu ringkasan utuh. Tiap langkah = satu request, diminta otomatis oleh browser; kuota terpakai sekali. */
const SUMMARY_CONTINUE_ASK =
  'Ringkasanmu di atas terpotong. Lanjutkan tepat setelah baris terakhir: jangan ulangi judul atau poin yang sudah ditulis, ' +
  'langsung tulis baris berikutnya dengan format yang sama. Kalau semua bagian sudah lengkap, balas hanya: [SELESAI]';

// Buang baris terakhir yang terpotong di tengah supaya lanjutan mulai dari baris utuh.
const keepCompleteLines = (text) => {
  const t = text.trimEnd();
  const cut = t.lastIndexOf('\n');
  return cut > t.length * 0.5 ? t.slice(0, cut).trimEnd() : t;
};

// Sambungan: baris lanjutan tabel/daftar/kutipan harus menempel, sisanya dipisah paragraf.
const joinSummary = (done, next) => {
  const cont = next.replace(/^\s*\n/, '');
  return done + (/^\s*(\||[-*] |\d+\. |↳|>)/.test(cont) ? '\n' : '\n\n') + cont.trimStart();
};

// Tampilan sementara saat materi panjang masih dibaca: catatan tiap bagian di bawah judul "Bagian k dari n".
const demoteHeadings = (md) => md.replace(/^(#{2,5})\s/gm, (m, h) => `${h}# `);
const interimSummary = (notes, total) =>
  notes.map((t, i) => `## 📄 Bagian ${i + 1} dari ${total}\n${demoteHeadings(t)}`).join('\n\n');

// Sumber untuk menulis/melanjutkan ringkasan akhir: materinya sendiri, atau catatan per bagian kalau materinya panjang.
const summaryBaseMessages = (set) => {
  const notes = set.progress?.summary_notes;
  if (set.content.length > SINGLE_PASS_CHARS && Array.isArray(notes) && notes.length) {
    const joined = notes.map((t, i) => `=== Bagian ${i + 1} ===\n${t}`).join('\n\n');
    return [{ role: 'user', content: `Judul materi: ${set.title}\n\nCATATAN PER BAGIAN (dari materi yang panjang):\n\n${joined}` }];
  }
  return materialMessage(set);
};

const saveSummaryPart = async (ctx, set, lang, text, truncated, parts, model) => {
  const partial = truncated && parts < MAX_SUMMARY_PARTS;
  const summary = partial ? keepCompleteLines(text) : text.trimEnd();
  const progress = mergeProgress(set, {
    summary: true, summary_partial: partial, summary_parts: parts, summary_stage: partial ? 'final' : null,
    models: withModel(set, 'summary', model),
    // Catatan per bagian hanya dibutuhkan sampai ringkasan akhir selesai.
    ...(partial ? {} : { summary_notes: null, summary_step: null, summary_steps: null }),
  });
  await updateSet(ctx.code, set.id, { summary, summary_lang: lang, progress });
  return { summary, partial };
};

async function summaryMapStep(ctx, set, body, res, lang, step, model) {
  const chunks = splitChunks(set.content, MAP_CHUNK_CHARS);
  const total = chunks.length;
  const prev = Array.isArray(set.progress?.summary_notes) ? set.progress.summary_notes : [];
  const notes = step === 1 ? [] : prev.slice(0, step - 1);
  const { out, stream, failed } = await runAI(body, res, {
    system: summaryPrompt(lang) + learnerContext(body.learner) + SUMMARY_MAP_NOTE(step, total),
    messages: [{ role: 'user', content: `Judul materi: ${set.title}\n\nBAGIAN ${step} DARI ${total}:\n${chunks[step - 1]}` }],
    maxTokens: MAP_PART_TOKENS,
    model,
  });
  if (failed) return;
  notes.push(out.truncated ? keepCompleteLines(out.text) : out.text.trim());
  const summary = interimSummary(notes, total);
  const progress = mergeProgress(set, {
    summary: true, summary_partial: true, summary_stage: 'map', summary_step: step, summary_steps: total,
    summary_notes: notes, summary_parts: 0, models: withModel(set, 'summary', out.model),
  });
  await updateSet(ctx.code, set.id, { summary, summary_lang: lang, progress });
  return sendResult(res, stream, { data: summary, lang, partial: true, stage: 'map', step, steps: total, model: out.model });
}

async function summaryReduceStep(ctx, set, body, res, lang, model) {
  const { out, stream, failed } = await runAI(body, res, {
    system: summaryPrompt(lang) + learnerContext(body.learner) + SUMMARY_REDUCE_NOTE,
    messages: summaryBaseMessages(set),
    maxTokens: SUMMARY_PART_TOKENS,
    model,
  });
  if (failed) return;
  const saved = await saveSummaryPart(ctx, set, lang, out.text, out.truncated, 1, out.model);
  return sendResult(res, stream, { data: saved.summary, lang, partial: saved.partial, stage: saved.partial ? 'final' : null, model: out.model });
}

async function continueSummary(ctx, set, body, res) {
  const progress = set.progress || {};
  if (!progress.summary_partial || !set.summary) return res.status(400).json({ ok: false, error: 'Ringkasan ini sudah lengkap.' });
  if (ctx.tier === 'trial') {
    const trial = await getTrialSetId(ctx.code);
    if (trial.setId !== set.id) return upgradeRequired(res, 'trial_set');
  }
  // Lanjutan bagian dari satu kali "Buat ringkasan": tidak memotong kuota lagi, jumlah langkahnya dibatasi.
  const lang = SUMMARY_LANGS.includes(set.summary_lang) ? set.summary_lang : 'id';
  const model = (await resolveModels()).default;

  if (progress.summary_stage === 'map') {
    const step = Number(progress.summary_step) || 0;
    const total = Number(progress.summary_steps) || 0;
    if (step < total) return summaryMapStep(ctx, set, body, res, lang, step + 1, model);
    return summaryReduceStep(ctx, set, body, res, lang, model);
  }

  const parts = (Number(progress.summary_parts) || 1) + 1;
  const done = set.summary.trimEnd();
  const { out, stream, failed } = await runAI(body, res, {
    system: summaryPrompt(lang) + learnerContext(body.learner) + (set.content.length > SINGLE_PASS_CHARS ? SUMMARY_REDUCE_NOTE : ''),
    messages: [...summaryBaseMessages(set), { role: 'assistant', content: done }, { role: 'user', content: SUMMARY_CONTINUE_ASK }],
    maxTokens: SUMMARY_PART_TOKENS,
    model,
  });
  if (failed) return;
  const finished = /^\s*\[SELESAI\]\s*$/.test(out.text);
  const text = finished ? done : joinSummary(done, out.text.replace(/\[SELESAI\]\s*$/, ''));
  const saved = await saveSummaryPart(ctx, set, lang, text, !finished && out.truncated, parts, out.model);
  return sendResult(res, stream, { data: saved.summary, lang, partial: saved.partial, stage: saved.partial ? 'final' : null, model: out.model });
}

async function handleGenerate(ctx, body, res) {
  const kind = body.kind;
  if (!GENERATE_KINDS.includes(kind)) return res.status(400).json({ ok: false, error: 'Jenis tidak valid' });
  const field = GENERATE_FIELD[kind];
  const set = await getOwnedSet(ctx.code, body.set_id, `id,title,content,progress,${field}${kind === 'summary' ? ',summary_lang' : ''}`);
  if (!set) return res.status(404).json({ ok: false, error: 'Materi tidak ditemukan' });
  if (kind === 'summary' && body.continue === true) return continueSummary(ctx, set, body, res);

  if (ctx.tier === 'trial') {
    if (!TRIAL_KINDS.includes(kind)) return upgradeRequired(res, kind);
    const trial = await getTrialSetId(ctx.code);
    if (trial.setId !== set.id) {
      return upgradeRequired(res, 'trial_set', 'Coba gratis hanya berlaku untuk materi pertamamu. Berlangganan untuk memakai AI di materi ini.');
    }
    // Flashcard bisa berisi kartu tambahan manual (mufradat/i'rab), jadi pakai penanda progres.
    const existing = set[field];
    const alreadyMade = set.progress?.[kind] ||
      (kind !== 'flashcards' && existing && (!Array.isArray(existing) || existing.length > 0));
    if (alreadyMade) {
      return upgradeRequired(res, 'regenerate', 'Coba gratis hanya bisa membuat tiap fitur sekali. Berlangganan untuk membuat ulang.');
    }
  } else {
    const over = await takeQuota(ctx, 'generate');
    if (over) return quotaExceeded(res, 'generate', over, ctx);
  }

  // Flashcard, kuis, mufradat cukup membaca contoh merata ±30rb karakter — teks Arab ±1 token per karakter,
  // jadi ini memangkas biaya input kira-kira setengahnya. Ringkasan, peta konsep, dan soal tahriri membaca penuh.
  const messages = materialMessage(set, STUDY_KINDS.includes(kind) ? STUDY_SAMPLE_CHARS : SINGLE_PASS_CHARS);
  const learner = learnerContext(body.learner);
  const models = await resolveModels();
  const model = STUDY_KINDS.includes(kind) ? models.study : models.default;
  const progress = mergeProgress(set, { [kind]: true, models: withModel(set, kind, model) });

  if (kind === 'summary') {
    const lang = SUMMARY_LANGS.includes(body.lang) ? body.lang : 'id';
    if (set.content.length > SINGLE_PASS_CHARS) return summaryMapStep(ctx, set, body, res, lang, 1, model);
    const { out, stream, failed } = await runAI(body, res, { system: summaryPrompt(lang) + learner, messages, maxTokens: SUMMARY_PART_TOKENS, model });
    if (failed) return;
    const saved = await saveSummaryPart(ctx, set, lang, out.text, out.truncated, 1, out.model);
    return sendResult(res, stream, { data: saved.summary, lang, partial: saved.partial, model: out.model });
  }

  if (kind === 'mindmap') {
    const data = cleanMindmap(await callAIJson({ system: PROMPTS.mindmap + learner, messages, maxTokens: 3500, model }));
    if (!data) throw new Error('AI gagal membuat peta konsep yang valid');
    await updateSet(ctx.code, set.id, { mindmap: data, progress });
    return res.status(200).json({ ok: true, data, model });
  }

  const clean = { flashcards: cleanFlashcards, quiz: cleanQuiz, glossary: cleanGlossary, essays: cleanEssays }[kind];
  let data = clean(await callAIJson({ system: PROMPTS[kind] + learner, messages, maxTokens: 4000, model }));
  if (data.length === 0) throw new Error('AI gagal membuat hasil yang valid');
  if (kind === 'flashcards') {
    // Kartu lama (termasuk progres hafalannya) dipertahankan; kartu AI yang sama tidak diduplikasi.
    const old = Array.isArray(set.flashcards) ? set.flashcards : [];
    const known = new Set(old.map(c => c.q));
    data = [...old, ...data.filter(c => !known.has(c.q))].slice(0, MAX_CARDS);
  }

  const patch = { [field]: data, progress };
  if (kind === 'quiz') patch.quiz_best_score = null;
  if (kind === 'essays') patch.essay_attempts = [];
  await updateSet(ctx.code, set.id, patch);
  return res.status(200).json({ ok: true, data, model });
}

async function handleSaveProgress(ctx, body, res) {
  const set = await getOwnedSet(ctx.code, body.set_id, 'id,flashcards,quiz,quiz_best_score,progress');
  if (!set) return res.status(404).json({ ok: false, error: 'Materi tidak ditemukan' });
  const patch = {};

  if (Array.isArray(body.card_states) && Array.isArray(set.flashcards)) {
    patch.flashcards = set.flashcards.map((card, i) => {
      const s = body.card_states[i];
      if (!s) return card;
      const box = Math.min(5, Math.max(1, parseInt(s.box, 10) || 1));
      const due = typeof s.due === 'string' && !isNaN(Date.parse(s.due)) ? s.due : null;
      return { ...card, box, due };
    });
  }

  if (Number.isInteger(body.quiz_best_score) && Array.isArray(set.quiz)) {
    const score = Math.min(set.quiz.length, Math.max(0, body.quiz_best_score));
    patch.quiz_best_score = Math.max(set.quiz_best_score ?? 0, score);
  }

  const progressPatch = cleanProgressPatch(body.progress);
  if (Object.keys(progressPatch).length) patch.progress = mergeProgress(set, progressPatch);

  if (Object.keys(patch).length) await updateSet(ctx.code, set.id, patch);
  return res.status(200).json({ ok: true });
}

// Tambah kartu buatan sendiri (misal dari Mufradat). Tanpa AI, jadi boleh untuk semua tier.
async function handleAddCards(ctx, body, res) {
  const set = await getOwnedSet(ctx.code, body.set_id, 'id,flashcards');
  if (!set) return res.status(404).json({ ok: false, error: 'Materi tidak ditemukan' });
  const existing = Array.isArray(set.flashcards) ? set.flashcards : [];
  const known = new Set(existing.map(c => c.q));
  const incoming = cleanFlashcards(body.cards).filter(c => !known.has(c.q));
  if (incoming.length === 0) return res.status(200).json({ ok: true, data: existing, added: 0 });
  const flashcards = [...existing, ...incoming].slice(0, MAX_CARDS);
  await updateSet(ctx.code, set.id, { flashcards });
  return res.status(200).json({ ok: true, data: flashcards, added: flashcards.length - existing.length });
}

async function handleAnalyze(ctx, body, res) {
  const mode = body.mode;
  if (!['irab', 'tasykil'].includes(mode)) return res.status(400).json({ ok: false, error: 'Mode tidak valid' });
  const text = typeof body.text === 'string' ? body.text.trim() : '';
  const maxLen = mode === 'irab' ? 400 : 6000;
  if (!text) return res.status(400).json({ ok: false, error: 'Pilih teks Arab dulu' });
  if (text.length > maxLen) return res.status(400).json({ ok: false, error: `Teks terlalu panjang (maks ${maxLen} karakter)` });
  if (!/[؀-ۿ]/.test(text)) return res.status(400).json({ ok: false, error: 'Teks yang dipilih bukan bahasa Arab' });

  const set = await getOwnedSet(ctx.code, body.set_id, 'id,analyses');
  if (!set) return res.status(404).json({ ok: false, error: 'Materi tidak ditemukan' });
  const analyses = Array.isArray(set.analyses) ? set.analyses : [];
  const cached = analyses.find(a => a.mode === mode && a.input === text);
  if (cached) return res.status(200).json({ ok: true, data: cached.output, cached: true, model: cached.model || null });

  const over = await takeQuota(ctx, 'analyze');
  if (over) return quotaExceeded(res, 'analyze', over, ctx);

  const model = (await resolveModels()).arabic;
  let output;
  if (mode === 'irab') {
    output = cleanIrab(await callAIJson({ system: IRAB_PROMPT, messages: [{ role: 'user', content: text }], maxTokens: 3000, temperature: 0.1, model }));
    if (!output) throw new Error('AI gagal menganalisis teks');
  } else {
    output = (await callAI({ system: TASYKIL_PROMPT, messages: [{ role: 'user', content: text }], maxTokens: 6000, temperature: 0, model })).trim();
  }

  const next = [...analyses, { mode, input: text, output, model, at: new Date().toISOString() }].slice(-MAX_ANALYSES);
  await updateSet(ctx.code, set.id, { analyses: next });
  return res.status(200).json({ ok: true, data: output, model });
}

async function handleGrade(ctx, body, res) {
  const answer = typeof body.answer === 'string' ? body.answer.trim() : '';
  if (answer.length < 10) return res.status(400).json({ ok: false, error: 'Jawaban terlalu pendek' });
  if (answer.length > 4000) return res.status(400).json({ ok: false, error: 'Jawaban terlalu panjang (maks 4000 karakter)' });
  const set = await getOwnedSet(ctx.code, body.set_id, 'id,essays,essay_attempts,progress');
  if (!set) return res.status(404).json({ ok: false, error: 'Materi tidak ditemukan' });
  const index = Number(body.index);
  const essay = Array.isArray(set.essays) ? set.essays[index] : null;
  if (!essay) return res.status(400).json({ ok: false, error: 'Soal tidak ditemukan' });
  const over = await takeQuota(ctx, 'grade');
  if (over) return quotaExceeded(res, 'grade', over, ctx);

  const prompt = gradeUserPrompt(essay, answer);
  const model = (await resolveModels()).grade;
  const result = cleanGrade(await callAIJson({ system: GRADE_PROMPT + learnerContext(body.learner), messages: [{ role: 'user', content: prompt }], maxTokens: 2000, temperature: 0.2, model }));
  if (!result) throw new Error('AI gagal menilai jawaban');

  const attempt = { index, answer, ...result, model, at: new Date().toISOString() };
  const attempts = [...(Array.isArray(set.essay_attempts) ? set.essay_attempts : []), attempt].slice(-MAX_ATTEMPTS);
  await updateSet(ctx.code, set.id, { essay_attempts: attempts, progress: mergeProgress(set, { essays_done: true }) });
  return res.status(200).json({ ok: true, data: attempt });
}

async function handleChat(ctx, body, res) {
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message || message.length > 2000) return res.status(400).json({ ok: false, error: 'Pesan kosong atau terlalu panjang' });
  const mode = body.mode === 'syafawi' ? 'syafawi' : 'tutor';
  const set = await getOwnedSet(ctx.code, body.set_id, 'id,title,content,chat');
  if (!set) return res.status(404).json({ ok: false, error: 'Materi tidak ditemukan' });
  const over = await takeQuota(ctx, 'chat');
  if (over) return quotaExceeded(res, 'chat', over, ctx);

  const all = Array.isArray(set.chat) ? set.chat : [];
  // Riwayat per mode supaya simulasi syafawi tidak tercampur tanya-jawab biasa.
  const history = all.filter(m => (m.mode || 'tutor') === mode).slice(-CHAT_HISTORY);
  // Materi yang muat dikirim utuh (system prompt di-cache supaya pesan berikutnya murah). Materi panjang:
  // tutor menerima potongan yang relevan — dipakai ulang selama masih cocok supaya cache tetap kena —
  // syafawi menerima contoh merata dari semua bab (selalu sama, jadi cache juga kena).
  const long = set.content.length > SINGLE_PASS_CHARS;
  let tutorCtx = null;
  let excerpt = set.content;
  if (long && mode === 'syafawi') excerpt = spreadSample(set.content, SINGLE_PASS_CHARS);
  else if (long) {
    const prevCtx = [...history].reverse().find(m => m.role === 'assistant' && m.ctx)?.ctx || null;
    const sticky = stickyExcerpt(set.content, message, SINGLE_PASS_CHARS, prevCtx);
    excerpt = sticky.excerpt;
    tutorCtx = sticky.ctx;
  }
  const material = long
    ? `(Materi panjang — yang ditampilkan hanya potongan ${mode === 'syafawi' ? 'dari seluruh bab' : 'yang paling berkaitan dengan pertanyaan'}; bagian yang dilewati ditandai […]. Jika jawabannya tidak ada di potongan ini, katakan mungkin dibahas di bagian lain materi.)\n\n${excerpt}`
    : excerpt;
  const { out, stream, failed } = await runAI(body, res, {
    system: (mode === 'syafawi' ? syafawiSystem(set.title, material) : tutorSystem(set.title, material)) + learnerContext(body.learner),
    messages: [...history.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: message }],
    maxTokens: 1500,
    timeLimitMs: 48000,
    cacheSystem: true,
    model: (await resolveModels()).chat,
  });
  if (failed) return;
  const note = '\n\n_(Jawaban terpotong karena terlalu panjang — ketik **lanjutkan** untuk meneruskan.)_';
  if (out.truncated && stream) stream.delta(note);
  const reply = out.truncated ? `${out.text.trimEnd()}${note}` : out.text;

  const now = new Date().toISOString();
  const chat = [
    ...all,
    { role: 'user', content: message, at: now, mode },
    { role: 'assistant', content: reply, at: now, mode, model: out.model, ...(tutorCtx ? { ctx: tutorCtx } : {}) },
  ].slice(-CHAT_MAX_STORED);
  await updateSet(ctx.code, set.id, { chat });
  return sendResult(res, stream, { reply, model: out.model });
}

/* ── Jalankan prompt Talqeeh langsung (tanpa materi) ──
   Percakapan disimpan di perangkat pengguna; server hanya menerima riwayat terakhir dan tidak menyimpannya. */
const PROMPT_MAX_TURNS   = 16;
const PROMPT_MAX_MESSAGE = 12000;
const PROMPT_MAX_TOTAL   = 40000;

async function handlePromptChat(ctx, body, res) {
  const raw = Array.isArray(body.messages) ? body.messages.slice(-PROMPT_MAX_TURNS) : [];
  const messages = raw
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && isStr(m.content) && m.content.trim())
    .map(m => ({ role: m.role, content: m.content.trim().slice(0, PROMPT_MAX_MESSAGE) }));
  const last = raw[raw.length - 1];
  if (!messages.length || messages[messages.length - 1].role !== 'user' || !isStr(last?.content)) {
    return res.status(400).json({ ok: false, error: 'Pesan kosong' });
  }
  if (last.content.trim().length > PROMPT_MAX_MESSAGE) return res.status(400).json({ ok: false, error: 'Pesan terlalu panjang' });
  // Buang giliran terlama sampai total muat; pesan pertama harus dari pengguna.
  while (messages.length > 1 && messages.reduce((n, m) => n + m.content.length, 0) > PROMPT_MAX_TOTAL) messages.shift();
  while (messages.length > 1 && messages[0].role !== 'user') messages.shift();
  let trialLeft = null;
  if (ctx.tier === 'trial') {
    const used = await lifetimeUsage(ctx.code, 'prompt_trial');
    const outOfTrial = () => upgradeRequired(res, 'prompt_trial_used',
      `Percakapan gratismu (${TRIAL_PROMPT_MESSAGES} pesan) sudah terpakai. Berlangganan AI Partner untuk bertanya tanpa batas.`);
    if (used >= TRIAL_PROMPT_MESSAGES) return outOfTrial();
    if (!(await consumeQuota(ctx.code, 'prompt_trial', TRIAL_PROMPT_MESSAGES))) return outOfTrial();
    trialLeft = TRIAL_PROMPT_MESSAGES - used - 1;
  } else {
    const over = await takeQuota(ctx, 'prompt');
    if (over) return quotaExceeded(res, 'prompt', over, ctx);
  }

  const { out, stream, failed } = await runAI(body, res, {
    system: promptChatSystem() + learnerContext(body.learner, { material: false }),
    messages,
    // Jawaban dijaga ringkas (±600 kata) supaya selesai jauh sebelum batas waktu.
    maxTokens: 1800,
    // Sisakan waktu untuk menutup stream sebelum batas 60 detik Vercel.
    timeLimitMs: 48000,
    cacheSystem: true,
    model: (await resolveModels()).prompt,
  });
  if (failed) return;
  const note = '\n\n_(Jawaban terpotong karena terlalu panjang — ketik **lanjutkan** untuk meneruskan.)_';
  if (out.truncated && stream) stream.delta(note);
  const reply = out.truncated ? `${out.text.trimEnd()}${note}` : out.text;
  return sendResult(res, stream, { reply, model: out.model, ...(trialLeft != null ? { trial_left: trialLeft } : {}) });
}

/* ── Masukan kualitas (👍/👎 + laporan kesalahan) ── */
const FEEDBACK_KINDS = ['summary', 'mindmap', 'flashcards', 'quiz', 'glossary', 'essays', 'grade', 'irab', 'tasykil', 'tutor', 'syafawi'];
const FEEDBACK_TASK = {
  summary: 'default', mindmap: 'default', flashcards: 'study', quiz: 'study', glossary: 'study', essays: 'default',
  irab: 'arabic', tasykil: 'arabic', grade: 'grade', tutor: 'chat', syafawi: 'chat',
};
const FEEDBACK_CATEGORIES = ['salah_fakta', 'salah_arab', 'salah_harakat', 'tidak_sesuai_materi', 'kurang_jelas', 'terpotong', 'lainnya'];
const feedbackAttempts = new Map();
const checkFeedbackRate = (code) => {
  const now = Date.now();
  const recent = (feedbackAttempts.get(code) || []).filter(t => now - t < 15 * 60 * 1000);
  if (recent.length >= 120) return false;
  recent.push(now);
  feedbackAttempts.set(code, recent);
  return true;
};
const clipText = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

async function handleFeedback(ctx, body, res) {
  const kind = body.kind;
  const rating = Number(body.rating);
  if (!FEEDBACK_KINDS.includes(kind) || ![1, -1].includes(rating)) return res.status(400).json({ ok: false, error: 'Masukan tidak valid' });
  if (!checkFeedbackRate(ctx.code)) return res.status(429).json({ ok: false, error: 'Terlalu banyak masukan. Coba lagi nanti.' });
  const set = await getOwnedSet(ctx.code, body.set_id, 'id');
  if (!set) return res.status(404).json({ ok: false, error: 'Materi tidak ditemukan' });

  const row = {
    member_code: ctx.code,
    set_id: set.id,
    kind,
    ref: clipText(body.ref, 40).replace(/[^\w:.-]/g, ''),
    rating,
    category: rating < 0 && FEEDBACK_CATEGORIES.includes(body.category) ? body.category : null,
    note: rating < 0 ? clipText(body.note, 1000) || null : null,
    snippet: clipText(body.snippet, 1500) || null,
    // Browser mengirim model yang membuat hasil itu (tersimpan bersama hasilnya); cadangannya model tugas saat ini.
    model: isValidModelId(body.model) ? body.model.trim() : (await resolveModels())[FEEDBACK_TASK[kind]],
    updated_at: new Date().toISOString(),
  };
  const { url, key } = sbConfig();
  const r = await fetch(`${url}/rest/v1/ai_feedback?on_conflict=member_code,set_id,kind,ref`, {
    method: 'POST',
    headers: sbHeaders(key, { Prefer: 'resolution=merge-duplicates,return=minimal' }),
    body: JSON.stringify(row),
  });
  if (!r.ok) {
    // Tabel belum dibuat (migrasi ai_feedback.sql) → jangan ganggu pengguna, cukup catat.
    console.warn('[ai-partner:feedback]', r.status, (await r.text().catch(() => '')).slice(0, 200));
    return res.status(503).json({ ok: false, error: 'Masukan belum bisa disimpan. Coba lagi nanti.' });
  }
  return res.status(200).json({ ok: true });
}

// Statistik belajar AI Partner milik member sendiri (halaman "Statistik Belajarku").
async function handleStats(ctx, res) {
  const { url, key } = sbConfig();
  const today = new Date().toISOString().slice(0, 10);
  // Ambil 30 hari terakhir, atau sejak awal periode kuota kalau lebih awal.
  const last30 = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
  const period = quotaPeriod(ctx.aiExpiresAt);
  const month = period.start;
  const since = month < last30 ? month : last30;
  const [setsRes, usageRes] = await Promise.all([
    fetch(`${url}/rest/v1/study_sets?member_code=eq.${encodeURIComponent(ctx.code)}&select=id,title,source_type,flashcards,quiz,quiz_best_score,essay_attempts,created_at&order=created_at.desc&limit=200`, { headers: sbHeaders(key) }),
    fetch(`${url}/rest/v1/ai_usage?member_code=eq.${encodeURIComponent(ctx.code)}&day=gte.${since}&select=day,kind,count`, { headers: sbHeaders(key) }),
  ]);
  const sets = setsRes.ok ? await setsRes.json() : [];
  const usage = usageRes.ok ? await usageRes.json() : [];
  const now = Date.now();

  let cards = 0, mastered = 0, due = 0;
  const quizzes = [];
  const essays = [];
  for (const s of sets) {
    for (const c of Array.isArray(s.flashcards) ? s.flashcards : []) {
      cards++;
      if ((c.box || 1) >= 4) mastered++;
      if (!c.due || Date.parse(c.due) <= now) due++;
    }
    const qLen = Array.isArray(s.quiz) ? s.quiz.length : 0;
    if (qLen && s.quiz_best_score != null) quizzes.push({ title: s.title, pct: Math.round((s.quiz_best_score / qLen) * 100) });
    for (const a of Array.isArray(s.essay_attempts) ? s.essay_attempts : []) essays.push({ title: s.title, skor: a.skor, at: a.at });
  }
  essays.sort((a, b) => (a.at || '').localeCompare(b.at || ''));

  const usageToday = {};
  const usage30 = {};
  const usageMonth = {};
  for (const u of usage) {
    if (u.day >= last30) usage30[u.kind] = (usage30[u.kind] || 0) + u.count;
    if (u.day >= month) usageMonth[u.kind] = (usageMonth[u.kind] || 0) + u.count;
    if (u.day === today) usageToday[u.kind] = u.count;
  }

  return res.status(200).json({
    ok: true,
    data: {
      tier: ctx.tier,
      sets: sets.length,
      bySource: sets.reduce((m, s) => ({ ...m, [s.source_type]: (m[s.source_type] || 0) + 1 }), {}),
      cards, mastered, due,
      quizzes: quizzes.slice(0, 20),
      quizAvg: quizzes.length ? Math.round(quizzes.reduce((a, q) => a + q.pct, 0) / quizzes.length) : null,
      essays: essays.slice(-30),
      essayAvg: essays.length ? Math.round((essays.reduce((a, e) => a + e.skor, 0) / essays.length) * 10) / 10 : null,
      usage30,
      usageToday,
      usageMonth,
      limits: ctx.tier === 'pro' ? LIMITS : null,
      monthlyLimits: ctx.tier === 'pro' ? await getMonthlyLimits() : null,
      quotaPeriodStart: ctx.tier === 'pro' ? period.start : null,
      quotaResetAt: ctx.tier === 'pro' ? period.resetAt : null,
      quotaPerSubscription: !!ctx.aiExpiresAt,
    },
  });
}

async function handleClearChat(ctx, body, res) {
  const mode = body.mode === 'syafawi' ? 'syafawi' : 'tutor';
  const set = await getOwnedSet(ctx.code, body.set_id, 'id,chat');
  if (!set) return res.status(404).json({ ok: false, error: 'Materi tidak ditemukan' });
  const chat = (Array.isArray(set.chat) ? set.chat : []).filter(m => (m.mode || 'tutor') !== mode);
  await updateSet(ctx.code, set.id, { chat });
  return res.status(200).json({ ok: true });
}

/* ── Admin actions ── */

async function handleAdmin(action, req, res, body) {
  if (!verifyToken((req.headers || {})['x-admin-token'])) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  const { url, key } = sbConfig();

  if (action === 'admin-list') {
    const list = (extra) => fetch(
      `${url}/rest/v1/ai_subscriptions?select=id,member_code,product_id,status,mayar_email,mayar_mobile,last_event,last_event_at,updated_at${extra}&order=updated_at.desc&limit=500`,
      { headers: sbHeaders(key) }
    );
    let r = await list(',expires_at');
    if (r.status === 400) r = await list(''); // migrasi mayar_api.sql belum dijalankan
    const data = await r.json();
    return res.status(200).json({ ok: true, data: Array.isArray(data) ? data : [] });
  }

  if (action === 'admin-payments') {
    const r = await fetch(
      `${url}/rest/v1/payment_events?select=created_at,event,product_id,product_name,customer_email,customer_name,amount,handled_as,member_code&order=created_at.desc&limit=100`,
      { headers: sbHeaders(key) }
    );
    const data = await r.json();
    return res.status(200).json({ ok: true, data: Array.isArray(data) ? data : [] });
  }

  if (action === 'admin-checkouts') {
    const r = await fetch(
      `${url}/rest/v1/payment_checkouts?select=id,created_at,plan,amount,email,name,member_code,status,paid_via,paid_at,link&order=created_at.desc&limit=100`,
      { headers: sbHeaders(key) }
    );
    const data = r.ok ? await r.json() : [];
    return res.status(200).json({ ok: true, data: Array.isArray(data) ? data : [], missing: !r.ok });
  }

  if (action === 'admin-grant') {
    const code = normalizeCode(body.member_code);
    if (!code || !(await isActiveMember(code))) {
      return res.status(400).json({ ok: false, error: 'Kode member tidak ditemukan atau tidak aktif' });
    }
    const now = new Date().toISOString();
    const r = await fetch(`${url}/rest/v1/ai_subscriptions?on_conflict=member_code,product_id`, {
      method: 'POST',
      headers: sbHeaders(key, { Prefer: 'resolution=merge-duplicates,return=minimal' }),
      body: JSON.stringify({
        member_code: code, product_id: 'manual', status: 'active',
        last_event: 'admin.grant', last_event_at: now, updated_at: now,
      }),
    });
    if (!r.ok) throw new Error('Gagal memberi akses');
    return res.status(200).json({ ok: true });
  }

  if (action === 'admin-revoke') {
    if (!isStr(body.id)) return res.status(400).json({ ok: false, error: 'id wajib' });
    const now = new Date().toISOString();
    await fetch(`${url}/rest/v1/ai_subscriptions?id=eq.${encodeURIComponent(body.id)}`, {
      method: 'PATCH',
      headers: sbHeaders(key, { Prefer: 'return=minimal' }),
      body: JSON.stringify({ status: 'unsubscribed', last_event: 'admin.revoke', last_event_at: now, updated_at: now }),
    });
    return res.status(200).json({ ok: true });
  }

  // Uji apakah ID model OpenRouter valid & menjawab, sebelum dipakai di Settings.
  if (action === 'admin-test-model') {
    const model = typeof body.model === 'string' ? body.model.trim() : '';
    if (!isValidModelId(model)) return res.status(400).json({ ok: false, error: 'Format ID model tidak valid (contoh: anthropic/claude-sonnet-4-6)' });
    const started = Date.now();
    try {
      const reply = await callAI({
        model, maxTokens: 300, temperature: 0,
        messages: [{ role: 'user', content: 'Terjemahkan ke bahasa Indonesia dalam 1-3 kata saja: الطَّهَارَةُ' }],
      });
      clearModelCache();
      return res.status(200).json({ ok: true, reply: reply.trim().slice(0, 80), ms: Date.now() - started });
    } catch (err) {
      return res.status(200).json({ ok: false, error: `Model tidak bisa dipakai: ${err.message}`.slice(0, 200) });
    }
  }

  if (action === 'admin-models') {
    return res.status(200).json({ ok: true, data: await resolveModels() });
  }

  // Golden set & evaluasi AI (lihat api/_lib/ai-partner/eval.js).
  if (action.startsWith('admin-golden-') || action.startsWith('admin-eval-')) {
    const handled = await handleEvalAdmin(action, body, res);
    if (handled !== null) return handled;
  }

  return res.status(400).json({ ok: false, error: 'Action tidak valid' });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-token');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'Method not allowed' }); return; }

  const action = req.query?.action || '';
  const body = await parseBody(req);
  if (!body) { res.status(400).json({ ok: false, error: 'Invalid JSON' }); return; }

  try {
    if (action.startsWith('admin-')) return await handleAdmin(action, req, res, body);

    if (action === 'status') {
      const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.headers['x-real-ip'] || 'unknown';
      if (ip !== 'unknown' && !checkStatusRateLimit(ip)) {
        return res.status(429).json({ ok: false, error: 'Terlalu banyak percobaan.' });
      }
      const access = await requireAiTier(req);
      if (!access.ok) return res.status(200).json({ ok: true, active: false, tier: 'none' });
      if (access.tier === 'pro') return res.status(200).json({ ok: true, active: true, tier: 'pro', expires_at: access.aiExpiresAt || null });
      const [trial, promptUsed] = await Promise.all([getTrialSetId(access.code), lifetimeUsage(access.code, 'prompt_trial')]);
      return res.status(200).json({
        ok: true, active: false, tier: 'trial',
        trial: {
          available: trial.available, used: !!trial.setId, set_id: trial.setId,
          prompt_left: Math.max(0, TRIAL_PROMPT_MESSAGES - (Number.isFinite(promptUsed) ? promptUsed : TRIAL_PROMPT_MESSAGES)),
          prompt_limit: TRIAL_PROMPT_MESSAGES,
        },
      });
    }

    const access = await requireAiTier(req);
    if (!access.ok) return res.status(access.status).json({ ok: false, error: access.reason });
    const ctx = { code: access.code, tier: access.tier, aiExpiresAt: access.aiExpiresAt || null };

    if (ctx.tier === 'trial' && PRO_ONLY_ACTIONS.includes(action)) {
      return upgradeRequired(res, action);
    }

    switch (action) {
      case 'ocr':           return await handleOcr(ctx, body, res);
      case 'transcribe':    return await handleTranscribe(ctx, body, res);
      case 'create':        return await handleCreate(ctx, body, res);
      case 'list':          return await handleList(ctx, res);
      case 'get':           return await handleGet(ctx, body, res);
      case 'delete':        return await handleDelete(ctx, body, res);
      case 'generate':      return await handleGenerate(ctx, body, res);
      case 'save-progress': return await handleSaveProgress(ctx, body, res);
      case 'add-cards':     return await handleAddCards(ctx, body, res);
      case 'analyze':       return await handleAnalyze(ctx, body, res);
      case 'grade':         return await handleGrade(ctx, body, res);
      case 'chat':          return await handleChat(ctx, body, res);
      case 'clear-chat':    return await handleClearChat(ctx, body, res);
      case 'prompt-chat':   return await handlePromptChat(ctx, body, res);
      case 'stats':         return await handleStats(ctx, res);
      case 'feedback':      return await handleFeedback(ctx, body, res);
      default:              return res.status(400).json({ ok: false, error: 'Action tidak valid' });
    }
  } catch (err) {
    console.error(`[ai-partner:${action}]`, err.message);
    const message = /openrouter|credit|limit|auth|AI /i.test(err.message) ? friendlyAiError(err) : 'Terjadi kesalahan. Coba lagi sebentar.';
    // Kalau balasan bertahap sudah dimulai, header tidak bisa diganti — laporkan lewat stream.
    if (res.headersSent) {
      try { res.write(JSON.stringify({ t: 'error', ok: false, error: message, detail: aiErrorDetail(err) }) + '\n'); res.end(); } catch {}
      return;
    }
    return res.status(500).json({ ok: false, error: message, detail: aiErrorDetail(err) });
  }
}
