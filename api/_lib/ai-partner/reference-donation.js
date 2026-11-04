import { LIBRARY_OWNER, referenceDb } from './reference-library.js';

// Sumbangan kitab dari pengguna ke Pustaka Rujukan. Penyumbang hanya bisa menyentuh dokumen dan sumbangannya sendiri;
// isi dokumen baru terlihat admin setelah pemiliknya setuju, dan baru terlihat pengguna lain setelah admin mengaktifkannya.

export const CONSENT_VERSION = 'sumbang-kitab-1';
export const MAX_PENDING_PER_MEMBER = 5;
const SOURCE_KINDS = new Set(['kitab', 'muqarrar']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const enc = encodeURIComponent;
const clip = (s, n) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const missingTable = (err) => err.status === 404 || /PGRST205|PGRST202|does not exist|Could not find/i.test(err.detail || '');
const TAKEN = 'Kitab ini sudah ada di Pustaka Talqeeh atau sedang diperiksa. Terima kasih sudah mau berbagi.';

export function donationBlock(doc) {
  if (doc.status === 'partial') return 'Sebagian halaman gagal dianalisis. Selesaikan dulu sebelum menyumbangkan.';
  if (doc.status !== 'done') return 'Tunggu analisisnya selesai dulu sebelum menyumbangkan.';
  if (['unread', 'garbled'].some(k => Number(doc.page_stats?.[k]) > 0)) return 'Masih ada halaman yang belum terbaca, jadi belum bisa disumbangkan.';
  return null;
}

const ownDoc = async (db, code, id) => {
  if (!UUID_RE.test(String(id || ''))) return null;
  const rows = await db(`ilmi_documents?id=eq.${enc(id)}&member_code=eq.${enc(code)}&select=id,title,file_hash,status,page_stats,edition&limit=1`);
  return rows?.[0] || null;
};

// File yang sama sudah di pustaka, atau sedang/sudah diterima dari penyumbang lain.
const isTaken = async (db, code, hash) => {
  const [library, active] = await Promise.all([
    db(`ilmi_documents?member_code=eq.${LIBRARY_OWNER}&file_hash=eq.${hash}&select=id&limit=1`),
    db(`reference_submissions?file_hash=eq.${hash}&status=in.(pending,approved)&member_code=neq.${enc(code)}&select=id&limit=1`),
  ]);
  return !!(library?.length || active?.length);
};

/* ── Penyumbang ── */
export async function handleReferenceDonation(ctx, body, res, deps) {
  const db = referenceDb(deps);
  const op = String(body.op || '');
  try {
    const doc = await ownDoc(db, ctx.code, body.document_id);
    if (!doc) return res.status(404).json({ ok: false, error: 'Dokumen tidak ditemukan' });
    const mine = await db(`reference_submissions?member_code=eq.${enc(ctx.code)}&file_hash=eq.${doc.file_hash}&select=id,status,review_note,created_at,reviewed_at&order=created_at.desc&limit=1`);
    const current = mine?.[0] || null;

    if (op === 'status') {
      return res.status(200).json({ ok: true, available: true, submission: current,
        taken: !current && await isTaken(db, ctx.code, doc.file_hash), blocked: donationBlock(doc), consent_version: CONSENT_VERSION });
    }
    if (op === 'withdraw') {
      if (current?.status !== 'pending') return res.status(409).json({ ok: false, error: 'Sumbangan ini sudah tidak bisa dibatalkan dari sini.' });
      await db(`reference_submissions?id=eq.${enc(current.id)}&member_code=eq.${enc(ctx.code)}&status=eq.pending`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
      return res.status(200).json({ ok: true });
    }
    if (op !== 'submit') return res.status(400).json({ ok: false, error: 'Perintah tidak dikenal' });

    if (body.consent !== CONSENT_VERSION) return res.status(400).json({ ok: false, error: 'Centang persetujuannya dulu.' });
    if (!SOURCE_KINDS.has(body.source_kind)) return res.status(400).json({ ok: false, error: 'Pilih jenis dokumennya: kitab atau muqarrar.' });
    const blocked = donationBlock(doc);
    if (blocked) return res.status(400).json({ ok: false, error: blocked });
    if (current?.status === 'rejected') return res.status(409).json({ ok: false, error: 'Dokumen ini sudah pernah diperiksa dan belum bisa diterima.' });
    if (current || await isTaken(db, ctx.code, doc.file_hash)) return res.status(409).json({ ok: false, error: TAKEN });
    const pending = await db(`reference_submissions?member_code=eq.${enc(ctx.code)}&status=eq.pending&select=id&limit=${MAX_PENDING_PER_MEMBER}`);
    if ((pending || []).length >= MAX_PENDING_PER_MEMBER) return res.status(429).json({ ok: false, error: `Kamu sudah punya ${MAX_PENDING_PER_MEMBER} sumbangan yang sedang diperiksa. Tunggu hasilnya dulu ya.` });

    try {
      const rows = await db('reference_submissions', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({
        document_id: doc.id, member_code: ctx.code, file_hash: doc.file_hash, title: clip(doc.edition?.title || doc.title, 200),
        source_kind: body.source_kind, consent_version: CONSENT_VERSION,
      }) });
      const r = rows?.[0];
      return res.status(200).json({ ok: true, submission: r ? { id: r.id, status: r.status, review_note: r.review_note, created_at: r.created_at, reviewed_at: r.reviewed_at } : null });
    } catch (err) {
      if (err.status === 409) return res.status(409).json({ ok: false, error: TAKEN });
      throw err;
    }
  } catch (err) {
    if (missingTable(err)) {
      if (op === 'status') return res.status(200).json({ ok: true, available: false });
      return res.status(503).json({ ok: false, error: 'Sumbangan kitab belum aktif.' });
    }
    throw err;
  }
}

/* ── Admin ── */
const APPROVE_ERRORS = {
  not_pending: [409, 'Sumbangan ini sudah diperiksa atau dibatalkan.'],
  source_missing: [409, 'Penyumbang sudah menghapus dokumennya.'],
  not_ready: [400, 'Dokumen penyumbang belum selesai dianalisis atau masih ada halaman yang belum terbaca.'],
  duplicate: [409, 'File yang sama sudah ada di pustaka. Tolak saja sumbangan ini.'],
};
const sameTitle = (s) => clip(s, 200).toLowerCase().replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');

export async function manageSubmissions(body, res, deps) {
  const db = referenceDb(deps);
  const op = String(body.op || '');
  try {
    if (op === 'list') {
      const rows = await db('reference_submissions?status=eq.pending&document_id=not.is.null&select=id,document_id,title,source_kind,created_at&order=created_at.asc&limit=100');
      if (!rows?.length) return res.status(200).json({ ok: true, available: true, submissions: [] });
      const [docs, library] = await Promise.all([
        db(`ilmi_documents?id=in.(${rows.map(r => r.document_id).join(',')})&select=id,num_pages,pdf_kind,page_stats,status,edition,stats`),
        db(`ilmi_documents?member_code=eq.${LIBRARY_OWNER}&select=title,edition&limit=1000`),
      ]);
      const docById = new Map((docs || []).map(d => [d.id, d]));
      const titles = new Set((library || []).flatMap(b => [b.title, b.edition?.title]).filter(Boolean).map(sameTitle));
      return res.status(200).json({ ok: true, available: true, submissions: rows.map(r => {
        const d = docById.get(r.document_id) || {};
        const { note, ...edition } = d.edition || {}; // catatan bisa memuat data pribadi dan tidak ikut disalin
        return { ...r, num_pages: d.num_pages, pdf_kind: d.pdf_kind, page_stats: d.page_stats, doc_status: d.status, edition, stats: d.stats,
          similar_title: titles.has(sameTitle(r.title)) };
      }) });
    }
    if (!UUID_RE.test(String(body.id || ''))) return res.status(400).json({ ok: false, error: 'Sumbangan tidak valid.' });

    if (op === 'page') {
      // Hanya selama masih diperiksa: setelah itu dokumen penyumbang kembali sepenuhnya privat.
      const found = await db(`reference_submissions?id=eq.${enc(body.id)}&status=eq.pending&select=document_id&limit=1`);
      const documentId = found?.[0]?.document_id;
      if (!documentId) return res.status(404).json({ ok: false, error: 'Sumbangan tidak ditemukan.' });
      const n = Number(body.page);
      if (!Number.isInteger(n) || n < 1) return res.status(400).json({ ok: false, error: 'Nomor halaman tidak valid.' });
      const pages = await db(`ilmi_pages?document_id=eq.${enc(documentId)}&page_no=eq.${n}&select=page_no,text,status&limit=1`);
      return res.status(200).json({ ok: true, page: pages?.[0] || { page_no: n, text: '', status: 'unread' } });
    }
    if (op === 'approve') {
      // Kitab besar bisa berisi ratusan halaman; penyalinan satu transaksi butuh waktu lebih lama dari batas biasa.
      const out = await db('rpc/approve_reference_submission', { method: 'POST', timeoutMs: 45000, body: JSON.stringify({ p_id: body.id }) });
      if (out?.status === 'ok') return res.status(200).json({ ok: true, document_id: out.document_id });
      const [code, error] = APPROVE_ERRORS[out?.status] || [500, 'Sumbangan gagal diterima.'];
      return res.status(code).json({ ok: false, error });
    }
    if (op === 'reject') {
      const note = clip(body.note, 300);
      if (note.length < 5) return res.status(400).json({ ok: false, error: 'Tulis alasannya. Penyumbang akan membacanya.' });
      const rows = await db(`reference_submissions?id=eq.${enc(body.id)}&status=eq.pending`, { method: 'PATCH', headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ status: 'rejected', review_note: note, reviewed_at: new Date().toISOString() }) });
      if (!rows?.length) return res.status(409).json({ ok: false, error: APPROVE_ERRORS.not_pending[1] });
      return res.status(200).json({ ok: true });
    }
    return res.status(400).json({ ok: false, error: 'Perintah tidak dikenal.' });
  } catch (err) {
    if (missingTable(err)) {
      if (op === 'list') return res.status(200).json({ ok: true, available: false, submissions: [] });
      return res.status(503).json({ ok: false, error: 'Jalankan migrations/reference_submissions.sql dulu.' });
    }
    throw err;
  }
}
