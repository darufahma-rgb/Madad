import { verifyToken } from './admin-auth.js';
import { sbConfig, sbHeaders, normalizeCode, requireAccess, consumeQuota, isActiveMember } from './_lib/member.js';
import { callAI, callAIJson } from './_lib/ai.js';

const LIMITS = { create: 5, ocr: 5, generate: 15, chat: 30 };
const MAX_CONTENT     = 40000;
const MIN_CONTENT     = 50;
const CHAT_CONTEXT    = 25000;
const CHAT_HISTORY    = 10;
const CHAT_MAX_STORED = 40;
const SOURCE_TYPES    = ['pdf', 'foto', 'teks'];

const BASE_PERSONA =
  'Kamu adalah asisten belajar Talqeeh untuk mahasiswa Indonesia di Universitas Al-Azhar Kairo (Masisir). ' +
  'Gunakan Bahasa Indonesia akademik; istilah teknis tetap dalam bahasa Arab lengkap dengan harakat.';

const PROMPTS = {
  summary: `${BASE_PERSONA}
Rangkum materi kuliah (muqarrar) yang diberikan. Gunakan HANYA isi materi, jangan menambah informasi dari luar.

Format markdown:
## Poin Inti
- 5–10 poin terpenting
## Ta'rif Istilah
- **istilah Arab berharakat** — definisi singkat
## Dalil
Ayat/hadits/qaul yang disebut di materi (teks Arab + terjemah). Lewati bagian ini jika materi tidak memuat dalil.
## Sering Keluar di Imtihan
- 3–5 poin yang paling mungkin ditanyakan, berdasar penekanan di materi`,

  flashcards: `${BASE_PERSONA}
Buat 10–20 flashcard hafalan dari materi. q = pertanyaan singkat atau istilah (boleh bahasa Arab berharakat), a = jawaban ringkas (maks 3 kalimat).
Gunakan HANYA isi materi. Balas HANYA JSON array: [{"q":"...","a":"..."}]`,

  quiz: `${BASE_PERSONA}
Buat 10 soal pilihan ganda gaya imtihan Al-Azhar untuk menguji pemahaman materi. Tiap soal punya 4 pilihan, tepat satu benar, dan pembahasan singkat yang merujuk ke materi. Variasikan posisi jawaban benar.
Gunakan HANYA isi materi. Balas HANYA JSON array: [{"question":"...","options":["...","...","...","..."],"answer":0,"explanation":"..."}] — answer adalah index 0-3.`,
};

const OCR_PROMPT = `Baca foto materi kuliah ini dan ekstrak seluruh teksnya.
- Salin teks Arab persis seperti tertulis, termasuk harakat jika ada
- Salin teks Indonesia/Latin apa adanya
- Pertahankan struktur (judul, poin, nomor) sesuai foto
- Bagian tidak terbaca: tulis [...]
- Jika foto tidak memuat teks: tulis FOTO_TIDAK_TERBACA`;

const tutorSystem = (title, content) => `Kamu adalah Tutor Talqeeh, partner belajar mahasiswa Indonesia di Universitas Al-Azhar Kairo.
Jawab pertanyaan berdasarkan MATERI di bawah. Jika jawabannya tidak ada di materi, katakan dulu "Ini tidak dibahas di materimu", lalu jelaskan secara umum dengan hati-hati dan sarankan merujuk kitab atau dosen.
Bahasa Indonesia yang santai tapi akademik; istilah Arab berharakat; ringkas (maks ~250 kata) kecuali diminta detail. Untuk masalah khilafiyah, sebutkan perbedaan madzhab bila materi menyebutnya; jangan memberi fatwa.

MATERI (judul: ${title}):
<<<
${content.slice(0, CHAT_CONTEXT)}
>>>`;

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

const quotaExceeded = (res, kind) =>
  res.status(429).json({ ok: false, error: 'quota', message: `Batas harian (${LIMITS[kind]}x) untuk fitur ini tercapai. Coba lagi besok.` });

const isStr = (v) => typeof v === 'string' && v.trim().length > 0;

/* ── Member actions ── */

async function handleOcr(code, body, res) {
  const { foto_base64, mime_type } = body;
  if (!isStr(foto_base64) || !isStr(mime_type) || !mime_type.startsWith('image/')) {
    return res.status(400).json({ ok: false, error: 'Foto tidak valid' });
  }
  if (foto_base64.length > 3_500_000) return res.status(400).json({ ok: false, error: 'Foto terlalu besar' });
  if (!(await consumeQuota(code, 'ocr', LIMITS.ocr))) return quotaExceeded(res, 'ocr');

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

async function handleCreate(code, body, res) {
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  if (content.length < MIN_CONTENT) {
    return res.status(400).json({ ok: false, error: `Materi terlalu pendek (min ${MIN_CONTENT} karakter)` });
  }
  if (!(await consumeQuota(code, 'create', LIMITS.create))) return quotaExceeded(res, 'create');

  const { url, key } = sbConfig();
  const r = await fetch(`${url}/rest/v1/study_sets`, {
    method: 'POST',
    headers: sbHeaders(key, { Prefer: 'return=representation' }),
    body: JSON.stringify({
      member_code: code,
      title:       (isStr(body.title) ? body.title.trim() : 'Materi tanpa judul').slice(0, 120),
      maddah_id:   isStr(body.maddah_id) ? body.maddah_id.slice(0, 80) : null,
      source_type: SOURCE_TYPES.includes(body.source_type) ? body.source_type : 'teks',
      content:     content.slice(0, MAX_CONTENT),
    }),
  });
  const rows = await r.json();
  if (!r.ok || !rows?.[0]?.id) throw new Error('Gagal menyimpan materi');
  return res.status(200).json({ ok: true, id: rows[0].id, truncated: content.length > MAX_CONTENT });
}

async function handleList(code, res) {
  const { url, key } = sbConfig();
  const r = await fetch(
    `${url}/rest/v1/study_sets?member_code=eq.${encodeURIComponent(code)}&select=id,title,maddah_id,source_type,quiz_best_score,created_at,updated_at&order=created_at.desc&limit=100`,
    { headers: sbHeaders(key) }
  );
  const rows = await r.json();
  return res.status(200).json({ ok: true, data: Array.isArray(rows) ? rows : [] });
}

async function handleGet(code, body, res) {
  const set = await getOwnedSet(code, body.set_id);
  if (!set) return res.status(404).json({ ok: false, error: 'Materi tidak ditemukan' });
  return res.status(200).json({ ok: true, data: set });
}

async function handleDelete(code, body, res) {
  if (!isStr(body.set_id)) return res.status(400).json({ ok: false, error: 'set_id wajib' });
  const { url, key } = sbConfig();
  await fetch(
    `${url}/rest/v1/study_sets?id=eq.${encodeURIComponent(body.set_id)}&member_code=eq.${encodeURIComponent(code)}`,
    { method: 'DELETE', headers: sbHeaders(key) }
  );
  return res.status(200).json({ ok: true });
}

const cleanFlashcards = (raw) =>
  (Array.isArray(raw) ? raw : [])
    .filter(c => isStr(c?.q) && isStr(c?.a))
    .slice(0, 30)
    .map(c => ({ q: c.q.trim(), a: c.a.trim(), box: 1, due: null }));

const cleanQuiz = (raw) =>
  (Array.isArray(raw) ? raw : [])
    .filter(q =>
      isStr(q?.question) &&
      Array.isArray(q.options) && q.options.length === 4 && q.options.every(isStr) &&
      Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3
    )
    .slice(0, 15)
    .map(q => ({
      question:    q.question.trim(),
      options:     q.options.map(o => o.trim()),
      answer:      q.answer,
      explanation: isStr(q.explanation) ? q.explanation.trim() : '',
    }));

async function handleGenerate(code, body, res) {
  const kind = body.kind;
  if (!PROMPTS[kind]) return res.status(400).json({ ok: false, error: 'Jenis tidak valid' });
  const set = await getOwnedSet(code, body.set_id, 'id,title,content');
  if (!set) return res.status(404).json({ ok: false, error: 'Materi tidak ditemukan' });
  if (!(await consumeQuota(code, 'generate', LIMITS.generate))) return quotaExceeded(res, 'generate');

  const messages = [{ role: 'user', content: `Judul materi: ${set.title}\n\nMATERI:\n${set.content}` }];

  if (kind === 'summary') {
    const summary = await callAI({ system: PROMPTS.summary, messages, maxTokens: 3000 });
    await updateSet(code, set.id, { summary });
    return res.status(200).json({ ok: true, data: summary });
  }

  const raw = await callAIJson({ system: PROMPTS[kind], messages, maxTokens: 4000 });
  const data = kind === 'flashcards' ? cleanFlashcards(raw) : cleanQuiz(raw);
  if (data.length === 0) throw new Error('AI gagal membuat hasil yang valid');

  await updateSet(code, set.id, kind === 'flashcards'
    ? { flashcards: data }
    : { quiz: data, quiz_best_score: null });
  return res.status(200).json({ ok: true, data });
}

async function handleSaveProgress(code, body, res) {
  const set = await getOwnedSet(code, body.set_id, 'id,flashcards,quiz,quiz_best_score');
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

  if (Object.keys(patch).length) await updateSet(code, set.id, patch);
  return res.status(200).json({ ok: true });
}

async function handleChat(code, body, res) {
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message || message.length > 2000) return res.status(400).json({ ok: false, error: 'Pesan kosong atau terlalu panjang' });
  const set = await getOwnedSet(code, body.set_id, 'id,title,content,chat');
  if (!set) return res.status(404).json({ ok: false, error: 'Materi tidak ditemukan' });
  if (!(await consumeQuota(code, 'chat', LIMITS.chat))) return quotaExceeded(res, 'chat');

  const history = (Array.isArray(set.chat) ? set.chat : []).slice(-CHAT_HISTORY);
  const reply = await callAI({
    system: tutorSystem(set.title, set.content),
    messages: [...history.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: message }],
    maxTokens: 1500,
  });

  const now = new Date().toISOString();
  const chat = [
    ...(Array.isArray(set.chat) ? set.chat : []),
    { role: 'user', content: message, at: now },
    { role: 'assistant', content: reply, at: now },
  ].slice(-CHAT_MAX_STORED);
  await updateSet(code, set.id, { chat });
  return res.status(200).json({ ok: true, reply });
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');
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
      const access = await requireAccess(body.member_code);
      return res.status(200).json({ ok: true, active: access.ok });
    }

    const access = await requireAccess(body.member_code);
    if (!access.ok) return res.status(access.status).json({ ok: false, error: access.reason });
    const code = access.code;

    switch (action) {
      case 'ocr':           return await handleOcr(code, body, res);
      case 'create':        return await handleCreate(code, body, res);
      case 'list':          return await handleList(code, res);
      case 'get':           return await handleGet(code, body, res);
      case 'delete':        return await handleDelete(code, body, res);
      case 'generate':      return await handleGenerate(code, body, res);
      case 'save-progress': return await handleSaveProgress(code, body, res);
      case 'chat':          return await handleChat(code, body, res);
      default:              return res.status(400).json({ ok: false, error: 'Action tidak valid' });
    }
  } catch (err) {
    console.error(`[ai-partner:${action}]`, err.message);
    return res.status(500).json({ ok: false, error: 'Terjadi kesalahan. Coba lagi sebentar.' });
  }
}
