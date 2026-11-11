import crypto from 'crypto';
import { referenceDb } from './reference-library.js';

// Sumbangan materi AI Partner (study_sets) dari pengguna, meniru sumbangan kitab Ilmi Index (reference-donation.js).
// Penyumbang hanya menyentuh materi dan sumbangannya sendiri; admin baru bisa membaca teksnya setelah pemiliknya setuju,
// dan hanya selama sumbangan itu menunggu. Diterima = teks + talkhis disalin ke material_submissions.

export const MATERIAL_CONSENT_VERSION = 'sumbang-materi-1';
export const MAX_PENDING_MATERIALS = 5;
export const MIN_MATERIAL_CHARS = 1500;
const DONATABLE_SOURCES = new Set(['pdf', 'foto']);
const SOURCE_KINDS = new Set(['kitab', 'muqarrar']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const READ_CHUNK = 6000;
const enc = encodeURIComponent;
const clip = (s, n) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const missingTable = (err) => err.status === 404 || /PGRST205|PGRST202|does not exist|Could not find/i.test(err.detail || '');
const TAKEN = 'Materi yang sama sudah disumbangkan atau sedang diperiksa. Terima kasih sudah mau berbagi.';

// Teks yang sama dari OCR/PDF berbeda tetap sering beda harakat dan spasi: sidik jari memakai teks yang dinormalisasi.
export const materialHash = (content) => crypto.createHash('sha256').update(
  String(content || '').replace(/[ً-ْٰـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/\s+/g, ' ').trim().toLowerCase()
).digest('hex');

export function materialDonationBlock(set) {
  if (!DONATABLE_SOURCES.has(set.source_type)) return 'Hanya materi dari PDF atau foto kitab/muqarrar yang bisa disumbangkan.';
  if (String(set.content || '').trim().length < MIN_MATERIAL_CHARS) return 'Materinya terlalu pendek untuk disumbangkan.';
  return null;
}

const ownSet = async (db, code, id) => {
  if (!UUID_RE.test(String(id || ''))) return null;
  const rows = await db(`study_sets?id=eq.${enc(id)}&member_code=eq.${enc(code)}&select=id,title,maddah_id,source_type,content&limit=1`);
  return rows?.[0] || null;
};
const publicSub = (r) => (r ? { id: r.id, status: r.status, review_note: r.review_note, created_at: r.created_at, reviewed_at: r.reviewed_at } : null);

/* ── Penyumbang ── */
export async function handleMaterialDonation(ctx, body, res, deps) {
  const db = referenceDb(deps);
  const op = String(body.op || '');
  try {
    const set = await ownSet(db, ctx.code, body.set_id);
    if (!set) return res.status(404).json({ ok: false, error: 'Materi tidak ditemukan' });
    const hash = materialHash(set.content);
    const mine = await db(`material_submissions?member_code=eq.${enc(ctx.code)}&content_hash=eq.${hash}&select=id,status,review_note,created_at,reviewed_at&order=created_at.desc&limit=1`);
    const current = mine?.[0] || null;
    const taken = async () => !!(await db(`material_submissions?content_hash=eq.${hash}&status=in.(pending,approved)&member_code=neq.${enc(ctx.code)}&select=id&limit=1`))?.length;

    if (op === 'status') {
      return res.status(200).json({ ok: true, available: true, submission: publicSub(current),
        taken: !current && await taken(), blocked: materialDonationBlock(set), consent_version: MATERIAL_CONSENT_VERSION });
    }
    if (op === 'withdraw') {
      if (current?.status !== 'pending') return res.status(409).json({ ok: false, error: 'Sumbangan ini sudah tidak bisa dibatalkan dari sini.' });
      await db(`material_submissions?id=eq.${enc(current.id)}&member_code=eq.${enc(ctx.code)}&status=eq.pending`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
      return res.status(200).json({ ok: true });
    }
    if (op !== 'submit') return res.status(400).json({ ok: false, error: 'Perintah tidak dikenal' });

    if (body.consent !== MATERIAL_CONSENT_VERSION) return res.status(400).json({ ok: false, error: 'Centang persetujuannya dulu.' });
    if (!SOURCE_KINDS.has(body.source_kind)) return res.status(400).json({ ok: false, error: 'Pilih jenis materinya: kitab atau muqarrar.' });
    const blocked = materialDonationBlock(set);
    if (blocked) return res.status(400).json({ ok: false, error: blocked });
    if (current?.status === 'rejected') return res.status(409).json({ ok: false, error: 'Materi ini sudah pernah diperiksa dan belum bisa diterima.' });
    if (current || await taken()) return res.status(409).json({ ok: false, error: TAKEN });
    const pending = await db(`material_submissions?member_code=eq.${enc(ctx.code)}&status=eq.pending&select=id&limit=${MAX_PENDING_MATERIALS}`);
    if ((pending || []).length >= MAX_PENDING_MATERIALS) return res.status(429).json({ ok: false, error: `Kamu sudah punya ${MAX_PENDING_MATERIALS} sumbangan yang sedang diperiksa. Tunggu hasilnya dulu ya.` });

    try {
      const rows = await db('material_submissions', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({
        study_set_id: set.id, member_code: ctx.code, content_hash: hash, title: clip(set.title, 200) || 'Tanpa judul',
        maddah_id: set.maddah_id || null, source_type: set.source_type, source_kind: body.source_kind, consent_version: MATERIAL_CONSENT_VERSION,
      }) });
      return res.status(200).json({ ok: true, submission: publicSub(rows?.[0]) });
    } catch (err) {
      if (err.status === 409) return res.status(409).json({ ok: false, error: TAKEN });
      throw err;
    }
  } catch (err) {
    if (missingTable(err)) {
      if (op === 'status') return res.status(200).json({ ok: true, available: false });
      return res.status(503).json({ ok: false, error: 'Sumbangan materi belum aktif.' });
    }
    throw err;
  }
}

/* ── Admin ── */
export async function manageMaterialSubmissions(body, res, deps) {
  const db = referenceDb(deps);
  const op = String(body.op || '');
  try {
    if (op === 'list') {
      const rows = await db('material_submissions?status=eq.pending&study_set_id=not.is.null&select=id,study_set_id,title,maddah_id,source_type,source_kind,created_at&order=created_at.asc&limit=100');
      if (!rows?.length) return res.status(200).json({ ok: true, available: true, submissions: [] });
      const sets = await db(`study_sets?id=in.(${rows.map(r => r.study_set_id).join(',')})&select=id,content,talkhis->topics`);
      const byId = new Map((sets || []).map(s => [s.id, s]));
      return res.status(200).json({ ok: true, available: true, submissions: rows.map(({ study_set_id, ...r }) => {
        const s = byId.get(study_set_id) || {};
        const topics = Array.isArray(s.topics) ? s.topics : [];
        return { ...r, chars: String(s.content || '').length, talkhis_topics: topics.length, talkhis_written: topics.filter(t => t?.writes > 0).length };
      }) });
    }
    if (!UUID_RE.test(String(body.id || ''))) return res.status(400).json({ ok: false, error: 'Sumbangan tidak valid.' });
    const pendingRow = async (fields) => (await db(`material_submissions?id=eq.${enc(body.id)}&status=eq.pending&select=${fields}&limit=1`))?.[0] || null;

    if (op === 'read') {
      // Hanya selama masih diperiksa: setelah itu materi penyumbang kembali sepenuhnya privat.
      const sub = await pendingRow('study_set_id');
      if (!sub?.study_set_id) return res.status(404).json({ ok: false, error: 'Sumbangan tidak ditemukan.' });
      const set = (await db(`study_sets?id=eq.${enc(sub.study_set_id)}&select=content&limit=1`))?.[0];
      const content = String(set?.content || '');
      const offset = Math.max(0, Math.floor(Number(body.offset) || 0));
      return res.status(200).json({ ok: true, text: content.slice(offset, offset + READ_CHUNK), offset, total: content.length });
    }
    if (op === 'approve') {
      const sub = await pendingRow('study_set_id,member_code');
      if (!sub) return res.status(409).json({ ok: false, error: 'Sumbangan ini sudah diperiksa atau dibatalkan.' });
      const set = sub.study_set_id
        ? (await db(`study_sets?id=eq.${enc(sub.study_set_id)}&member_code=eq.${enc(sub.member_code)}&select=content,talkhis&limit=1`))?.[0]
        : null;
      if (!set) return res.status(409).json({ ok: false, error: 'Penyumbang sudah menghapus materinya.' });
      const rows = await db(`material_submissions?id=eq.${enc(body.id)}&status=eq.pending`, { method: 'PATCH', headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ status: 'approved', content: set.content, talkhis: set.talkhis || null, study_set_id: null, reviewed_at: new Date().toISOString() }) });
      if (!rows?.length) return res.status(409).json({ ok: false, error: 'Sumbangan ini sudah diperiksa atau dibatalkan.' });
      return res.status(200).json({ ok: true });
    }
    if (op === 'reject') {
      const note = clip(body.note, 300);
      if (note.length < 5) return res.status(400).json({ ok: false, error: 'Tulis alasannya. Penyumbang akan membacanya.' });
      const rows = await db(`material_submissions?id=eq.${enc(body.id)}&status=eq.pending`, { method: 'PATCH', headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ status: 'rejected', review_note: note, reviewed_at: new Date().toISOString() }) });
      if (!rows?.length) return res.status(409).json({ ok: false, error: 'Sumbangan ini sudah diperiksa atau dibatalkan.' });
      return res.status(200).json({ ok: true });
    }
    return res.status(400).json({ ok: false, error: 'Perintah tidak dikenal.' });
  } catch (err) {
    if (missingTable(err)) {
      if (op === 'list') return res.status(200).json({ ok: true, available: false, submissions: [] });
      return res.status(503).json({ ok: false, error: 'Jalankan migrations/material_submissions.sql dulu.' });
    }
    throw err;
  }
}
