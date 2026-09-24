import crypto from 'crypto';
import { verifyToken } from './admin-auth.js';
import { sbConfig, sbHeaders, normalizeCode, requireAiTier, consumeQuota, isActiveMember } from './_lib/member.js';
import { callAI, callAIJson, transcribeModel } from './_lib/ai.js';
import {
  PROMPTS, SUMMARY_LANGS, summaryPrompt, GRADE_PROMPT, IRAB_PROMPT, TASYKIL_PROMPT,
  OCR_PROMPT, TRANSCRIBE_PROMPT, tutorSystem, syafawiSystem,
} from './_lib/ai-partner/prompts.js';
import {
  isStr, cleanFlashcards, cleanQuiz, cleanGlossary, cleanMindmap, cleanEssays,
  cleanGrade, cleanIrab, cleanProgressPatch,
} from './_lib/ai-partner/sanitize.js';

// Kuota harian pelanggan. Pengguna coba gratis dibatasi per materi (lihat TRIAL_*), bukan per hari.
const LIMITS = { create: 10, ocr: 20, transcribe: 60, generate: 25, analyze: 30, grade: 20, chat: 40 };
const TRIAL_OCR_LIMIT  = 3;
const TRIAL_KINDS      = ['summary', 'flashcards', 'quiz', 'glossary'];
const PRO_ONLY_ACTIONS = ['transcribe', 'analyze', 'grade', 'chat'];

const MAX_CONTENT     = 60000;
const MIN_CONTENT     = 50;
const CHAT_CONTEXT    = 30000;
const CHAT_HISTORY    = 12;
const CHAT_MAX_STORED = 60;
const MAX_ANALYSES    = 40;
const MAX_ATTEMPTS    = 30;
const MAX_CARDS       = 80;
const MAX_AUDIO_B64   = 2_800_000; // ±60 detik WAV 16kHz mono
const SOURCE_TYPES = ['pdf', 'foto', 'teks', 'docx', 'pptx', 'xlsx', 'txt', 'audio', 'video', 'campuran'];
const GENERATE_KINDS = ['summary', 'flashcards', 'quiz', 'glossary', 'mindmap', 'essays'];

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

const quotaExceeded = (res, kind) =>
  res.status(429).json({ ok: false, error: 'quota', message: `Batas harian (${LIMITS[kind]}x) untuk fitur ini tercapai. Coba lagi besok.` });

const upgradeRequired = (res, feature, message) =>
  res.status(403).json({
    ok: false, error: 'upgrade', feature,
    message: message || 'Fitur ini khusus pelanggan AI Partner. Berlangganan untuk membuka semua fitur.',
  });

const materialMessage = (set) => [{ role: 'user', content: `Judul materi: ${set.title}\n\nMATERI:\n${set.content}` }];

const mergeProgress = (set, patch) => ({ ...(set.progress && typeof set.progress === 'object' ? set.progress : {}), ...patch });

/* ── Member actions ── */

async function handleOcr(ctx, body, res) {
  const { foto_base64, mime_type } = body;
  if (!isStr(foto_base64) || !isStr(mime_type) || !mime_type.startsWith('image/')) {
    return res.status(400).json({ ok: false, error: 'Foto tidak valid' });
  }
  if (foto_base64.length > 3_500_000) return res.status(400).json({ ok: false, error: 'Foto terlalu besar' });
  const limit = ctx.tier === 'pro' ? LIMITS.ocr : TRIAL_OCR_LIMIT;
  if (!(await consumeQuota(ctx.code, 'ocr', limit))) {
    return ctx.tier === 'pro'
      ? quotaExceeded(res, 'ocr')
      : upgradeRequired(res, 'ocr', `Coba gratis bisa membaca ${TRIAL_OCR_LIMIT} foto per hari. Berlangganan untuk membaca lebih banyak.`);
  }

  const teks = await callAI({
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
  if (!(await consumeQuota(ctx.code, 'transcribe', LIMITS.transcribe))) {
    return res.status(429).json({ ok: false, error: 'quota', message: `Batas transkripsi harian (${LIMITS.transcribe} menit) tercapai. Coba lagi besok.` });
  }

  const text = await callAI({
    model: transcribeModel(),
    maxTokens: 2500,
    temperature: 0,
    messages: [{
      role: 'user',
      content: [
        { type: 'input_audio', input_audio: { data: audio, format: 'wav' } },
        { type: 'text', text: TRANSCRIBE_PROMPT },
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

  const id = crypto.randomUUID();
  if (ctx.tier === 'trial') {
    if (['audio', 'video'].includes(sourceType)) return upgradeRequired(res, 'audio');
    if (!(await claimTrial(ctx.code, id))) {
      return upgradeRequired(res, 'trial_used', 'Jatah coba gratis (1 materi) sudah terpakai. Berlangganan AI Partner untuk menambah materi baru.');
    }
  } else if (!(await consumeQuota(ctx.code, 'create', LIMITS.create))) {
    return quotaExceeded(res, 'create');
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
      content:     content.slice(0, MAX_CONTENT),
    }),
  });
  if (!r.ok) {
    if (ctx.tier === 'trial') await releaseTrial(ctx.code, id);
    throw new Error(`Gagal menyimpan materi (${r.status})`);
  }
  return res.status(200).json({ ok: true, id, truncated: content.length > MAX_CONTENT });
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
  await fetch(
    `${url}/rest/v1/study_sets?id=eq.${encodeURIComponent(body.set_id)}&member_code=eq.${encodeURIComponent(ctx.code)}`,
    { method: 'DELETE', headers: sbHeaders(key) }
  );
  return res.status(200).json({ ok: true });
}

const GENERATE_FIELD = {
  summary: 'summary', flashcards: 'flashcards', quiz: 'quiz',
  glossary: 'glossary', mindmap: 'mindmap', essays: 'essays',
};

async function handleGenerate(ctx, body, res) {
  const kind = body.kind;
  if (!GENERATE_KINDS.includes(kind)) return res.status(400).json({ ok: false, error: 'Jenis tidak valid' });
  const field = GENERATE_FIELD[kind];
  const set = await getOwnedSet(ctx.code, body.set_id, `id,title,content,progress,${field}`);
  if (!set) return res.status(404).json({ ok: false, error: 'Materi tidak ditemukan' });

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
  } else if (!(await consumeQuota(ctx.code, 'generate', LIMITS.generate))) {
    return quotaExceeded(res, 'generate');
  }

  const messages = materialMessage(set);
  const progress = mergeProgress(set, { [kind]: true });

  if (kind === 'summary') {
    const lang = SUMMARY_LANGS.includes(body.lang) ? body.lang : 'id';
    const summary = await callAI({ system: summaryPrompt(lang), messages, maxTokens: 3000 });
    await updateSet(ctx.code, set.id, { summary, summary_lang: lang, progress });
    return res.status(200).json({ ok: true, data: summary, lang });
  }

  if (kind === 'mindmap') {
    const data = cleanMindmap(await callAIJson({ system: PROMPTS.mindmap, messages, maxTokens: 3000 }));
    if (!data) throw new Error('AI gagal membuat peta konsep yang valid');
    await updateSet(ctx.code, set.id, { mindmap: data, progress });
    return res.status(200).json({ ok: true, data });
  }

  const clean = { flashcards: cleanFlashcards, quiz: cleanQuiz, glossary: cleanGlossary, essays: cleanEssays }[kind];
  let data = clean(await callAIJson({ system: PROMPTS[kind], messages, maxTokens: 4000 }));
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
  return res.status(200).json({ ok: true, data });
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
  if (cached) return res.status(200).json({ ok: true, data: cached.output, cached: true });

  if (!(await consumeQuota(ctx.code, 'analyze', LIMITS.analyze))) return quotaExceeded(res, 'analyze');

  let output;
  if (mode === 'irab') {
    output = cleanIrab(await callAIJson({ system: IRAB_PROMPT, messages: [{ role: 'user', content: text }], maxTokens: 3000, temperature: 0.1 }));
    if (!output) throw new Error('AI gagal menganalisis teks');
  } else {
    output = (await callAI({ system: TASYKIL_PROMPT, messages: [{ role: 'user', content: text }], maxTokens: 6000, temperature: 0 })).trim();
  }

  const next = [...analyses, { mode, input: text, output, at: new Date().toISOString() }].slice(-MAX_ANALYSES);
  await updateSet(ctx.code, set.id, { analyses: next });
  return res.status(200).json({ ok: true, data: output });
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
  if (!(await consumeQuota(ctx.code, 'grade', LIMITS.grade))) return quotaExceeded(res, 'grade');

  const prompt = `SOAL: ${essay.soal_ar}\n(${essay.soal_id})\n\nPOIN KUNCI:\n${essay.poin.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\nJAWABAN MODEL:\n${essay.jawaban_model}\n\nJAWABAN MAHASISWA:\n<<<\n${answer}\n>>>`;
  const result = cleanGrade(await callAIJson({ system: GRADE_PROMPT, messages: [{ role: 'user', content: prompt }], maxTokens: 2000, temperature: 0.2 }));
  if (!result) throw new Error('AI gagal menilai jawaban');

  const attempt = { index, answer, ...result, at: new Date().toISOString() };
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
  if (!(await consumeQuota(ctx.code, 'chat', LIMITS.chat))) return quotaExceeded(res, 'chat');

  const all = Array.isArray(set.chat) ? set.chat : [];
  // Riwayat per mode supaya simulasi syafawi tidak tercampur tanya-jawab biasa.
  const history = all.filter(m => (m.mode || 'tutor') === mode).slice(-CHAT_HISTORY);
  const material = set.content.slice(0, CHAT_CONTEXT);
  const reply = await callAI({
    system: mode === 'syafawi' ? syafawiSystem(set.title, material) : tutorSystem(set.title, material),
    messages: [...history.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: message }],
    maxTokens: 1500,
  });

  const now = new Date().toISOString();
  const chat = [
    ...all,
    { role: 'user', content: message, at: now, mode },
    { role: 'assistant', content: reply, at: now, mode },
  ].slice(-CHAT_MAX_STORED);
  await updateSet(ctx.code, set.id, { chat });
  return res.status(200).json({ ok: true, reply });
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
    const r = await fetch(
      `${url}/rest/v1/ai_subscriptions?select=id,member_code,product_id,status,mayar_email,mayar_mobile,last_event,last_event_at,updated_at&order=updated_at.desc&limit=500`,
      { headers: sbHeaders(key) }
    );
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
      if (access.tier === 'pro') return res.status(200).json({ ok: true, active: true, tier: 'pro' });
      const trial = await getTrialSetId(access.code);
      return res.status(200).json({
        ok: true, active: false, tier: 'trial',
        trial: { available: trial.available, used: !!trial.setId, set_id: trial.setId },
      });
    }

    const access = await requireAiTier(req);
    if (!access.ok) return res.status(access.status).json({ ok: false, error: access.reason });
    const ctx = { code: access.code, tier: access.tier };

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
      default:              return res.status(400).json({ ok: false, error: 'Action tidak valid' });
    }
  } catch (err) {
    console.error(`[ai-partner:${action}]`, err.message);
    return res.status(500).json({ ok: false, error: 'Terjadi kesalahan. Coba lagi sebentar.' });
  }
}
