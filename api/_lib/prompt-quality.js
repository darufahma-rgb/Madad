// Mutu prompt library (Fase 3): masukan pengguna per prompt dan tinjauan asatidz per maddah.
// Tabel: migrations/prompt_quality.sql. Hanya server (service role) yang membaca/menulis.
import { sbConfig, sbHeaders } from './member.js';

const SOURCES = ['kuliah', 'mahad'];
const KINDS = ['pahami', 'hafal', 'latihan', 'ujian', 'talaqqi', 'eksplorasi', 'tabs'];
export const PROMPT_FEEDBACK_REASONS = ['tidak_sesuai_maddah', 'tidak_sesuai_ujian', 'jawaban_ai_salah', 'bingung_isian', 'terlalu_panjang', 'lainnya'];
const REVIEW_STATUSES = ['disetujui', 'perlu_revisi'];
const MIGRATION_HINT = 'Tabel mutu prompt belum ada — jalankan migrations/prompt_quality.sql di Supabase SQL Editor.';

const str = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const slug = (v) => str(v, 80).replace(/[^\w-]/g, '');

const db = async (path, opts = {}) => {
  const { url, key } = sbConfig();
  const r = await fetch(`${url}/rest/v1/${path}`, { ...opts, headers: sbHeaders(key, opts.prefer ? { Prefer: opts.prefer } : {}) });
  const text = await r.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { ok: r.ok, status: r.status, data };
};

// Batas sederhana per member supaya tombol tidak dipakai untuk membanjiri tabel.
const attempts = new Map();
const rateOk = (code) => {
  const now = Date.now();
  const recent = (attempts.get(code) || []).filter(t => now - t < 15 * 60 * 1000);
  if (recent.length >= 60) return false;
  recent.push(now);
  attempts.set(code, recent);
  return true;
};

export const cleanPromptFeedback = (body) => {
  const source = SOURCES.includes(body?.source) ? body.source : null;
  const kind = KINDS.includes(body?.kind) ? body.kind : null;
  const maddah = slug(body?.maddah_id);
  const title = str(body?.title, 160);
  const rating = Number(body?.rating);
  if (!source || !kind || !maddah || !title || ![1, -1].includes(rating)) return null;
  return {
    source, maddah_id: maddah, prompt_kind: kind, prompt_title: title, rating,
    reason: rating < 0 && PROMPT_FEEDBACK_REASONS.includes(body.reason) ? body.reason : null,
    note: rating < 0 ? str(body.note, 500) || null : null,
  };
};

// Member (termasuk akun gratis) menilai prompt yang baru dipakai.
export async function handlePromptFeedback(code, body, res) {
  const row = cleanPromptFeedback(body);
  if (!row) return res.status(400).json({ ok: false, error: 'Masukan tidak valid' });
  if (!rateOk(code)) return res.status(429).json({ ok: false, error: 'Terlalu banyak masukan. Coba lagi nanti.' });
  const r = await db('prompt_feedback?on_conflict=member_code,source,maddah_id,prompt_kind,prompt_title', {
    method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal',
    body: JSON.stringify({ ...row, member_code: code, updated_at: new Date().toISOString() }),
  });
  if (!r.ok) {
    console.warn('[prompt-feedback]', r.status, JSON.stringify(r.data).slice(0, 200));
    return res.status(503).json({ ok: false, error: 'Masukan belum bisa disimpan. Coba lagi nanti.' });
  }
  return res.status(200).json({ ok: true });
}

// Ringkasan masukan per prompt: jumlah 👍/👎, alasan terbanyak, dan catatan terbaru.
export const summarizeFeedback = (rows) => {
  const map = new Map();
  for (const r of rows) {
    const k = `${r.source}|${r.maddah_id}|${r.prompt_kind}|${r.prompt_title}`;
    if (!map.has(k)) map.set(k, { source: r.source, maddah_id: r.maddah_id, kind: r.prompt_kind, title: r.prompt_title, up: 0, down: 0, reasons: {}, notes: [], last: r.updated_at });
    const s = map.get(k);
    if (r.rating > 0) s.up++; else s.down++;
    if (r.reason) s.reasons[r.reason] = (s.reasons[r.reason] || 0) + 1;
    if (r.note && s.notes.length < 5) s.notes.push(r.note);
    if (r.updated_at > s.last) s.last = r.updated_at;
  }
  // Paling bermasalah di atas: banyak 👎, lalu rasio 👎.
  return [...map.values()].sort((a, b) => b.down - a.down || (b.down / (b.up + b.down)) - (a.down / (a.up + a.down)));
};

export async function handlePromptQualityAdmin(action, body, res) {
  if (action === 'admin-prompt-feedback') {
    const days = Math.min(365, Math.max(1, parseInt(body.days, 10) || 90));
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const r = await db(`prompt_feedback?select=source,maddah_id,prompt_kind,prompt_title,rating,reason,note,updated_at&updated_at=gte.${since}&order=updated_at.desc&limit=5000`);
    if (!r.ok) return res.status(200).json({ ok: false, missing: true, error: MIGRATION_HINT });
    return res.status(200).json({ ok: true, days, total: r.data.length, data: summarizeFeedback(r.data) });
  }

  if (action === 'admin-prompt-reviews') {
    const r = await db('prompt_reviews?select=*&order=created_at.desc&limit=1000');
    if (!r.ok) return res.status(200).json({ ok: false, missing: true, error: MIGRATION_HINT });
    return res.status(200).json({ ok: true, data: r.data });
  }

  if (action === 'admin-prompt-review-save') {
    const row = {
      source: SOURCES.includes(body.source) ? body.source : null,
      maddah_id: slug(body.maddah_id),
      fakultas: str(body.fakultas, 60) || null,
      reviewer: str(body.reviewer, 120),
      status: REVIEW_STATUSES.includes(body.status) ? body.status : null,
      notes: str(body.notes, 2000) || null,
      prompt_count: Number.isFinite(Number(body.prompt_count)) ? Math.round(Number(body.prompt_count)) : null,
      rubric_score: Number.isFinite(Number(body.rubric_score)) ? Math.max(0, Math.min(100, Math.round(Number(body.rubric_score)))) : null,
    };
    if (!row.source || !row.maddah_id || !row.status) return res.status(400).json({ ok: false, error: 'Data tinjauan tidak lengkap' });
    if (!row.reviewer) return res.status(400).json({ ok: false, error: 'Isi nama peninjau' });
    if (row.status === 'perlu_revisi' && !row.notes) return res.status(400).json({ ok: false, error: 'Tulis catatan apa yang perlu direvisi' });
    const r = await db('prompt_reviews', { method: 'POST', prefer: 'return=representation', body: JSON.stringify(row) });
    if (!r.ok) return res.status(200).json({ ok: false, missing: true, error: MIGRATION_HINT });
    return res.status(200).json({ ok: true, data: r.data?.[0] || null });
  }

  return null;
}
