import { verifyToken } from './admin-auth.js';
import { callAIJson, friendlyAiError } from './_lib/ai.js';
import { resolveModels } from './_lib/models.js';

/* ── Draf jawaban AI (diperiksa asatidz sebelum tampil) ──
   Draf disimpan di kolom *_draft yang tidak terbaca publik (migrations/bank_soal_answer_drafts.sql).
   Dibuat per blok [SOAL_ARAB] supaya tiap panggilan selesai jauh di bawah batas 60 detik Vercel. */
const soalBlocks = (text) => {
  const t = String(text || '');
  if (!t.includes('[SOAL_ARAB]')) return t.trim() ? [{ arab: t.trim(), arti: '' }] : [];
  return t.split('[SOAL_ARAB]').slice(1).filter(b => b.trim()).map(b => {
    const [arab, arti] = b.split('[ARTI]');
    return { arab: (arab || '').replace(/\n-{3,}\s*$/, '').trim(), arti: (arti || '').replace(/\n-{3,}\s*$/, '').trim() };
  });
};

const DRAFT_SYSTEM = `Kamu membantu asatidz Talqeeh menyiapkan DRAF jawaban ujian tahriri Universitas Al-Azhar. Draf ini akan diperiksa dan diedit asatidz sebelum ditampilkan ke mahasiswa.

Tulis dua bagian:
1. "jawaban": jawaban dalam BAHASA ARAB fushah sesuai manhaj Al-Azhar — mulai dengan ta'rif bila relevan, lalu inti jawaban, dalil/syahid, dan tafshil seperlunya. Panjang sebanding bobot soal; maksimal ±350 kata.
   - Soal pilihan ganda / benar-salah / isian dengan banyak nomor: jawab per nomor, satu baris per nomor (mis. "١. صح" atau "٢٦. (أ) مرادف"), tanpa uraian panjang.
2. "penjelasan": penjelasan dalam BAHASA INDONESIA untuk mahasiswa Indonesia — inti jawaban 2–3 kalimat, istilah kunci, dan hal yang biasanya dituntut dosen. Maksimal ±200 kata.

Aturan akurasi (WAJIB):
- Kutip ayat hanya bila yakin 100% teks & letaknya; kalau tidak, tulis "كما ورد في القرآن الكريم" tanpa menyebut ayat.
- Kutip hadits hanya bila yakin 100% matan & perawinya; kalau tidak, tulis "كما ثبت في السنة النبوية".
- Jangan mengarang nama ulama, kitab, halaman, atau angka.
- Bagian yang kamu tidak yakin: tandai persis dengan [PERLU DIVERIFIKASI: alasan singkat].
- Soal yang teksnya terpotong/tidak lengkap: jawab bagian yang terbaca dan tandai [PERLU DIVERIFIKASI: soal terpotong].

Format: teks polos tanpa markdown (tanpa **, #, tabel). Pisahkan paragraf dengan baris baru.
Balas HANYA JSON valid: {"jawaban": "...", "penjelasan": "..."}`;

const needsVerify = (arr) => (arr || []).some(t => /\[PERLU DIVERIFIKASI/i.test(String(t || '')));
const cleanList = (v, n) => (Array.isArray(v) ? v : []).slice(0, n).map(x => (typeof x === 'string' ? x.slice(0, 12000) : ''));

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') return res.status(405).end();

  const token = (req.headers || {})['x-admin-token'];
  if (!verifyToken(token)) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  let rawBody = '';
  await new Promise(resolve => { req.on('data', c => rawBody += c); req.on('end', resolve); });

  let body;
  try { body = JSON.parse(rawBody || '{}'); }
  catch { return res.status(400).json({ ok: false, error: 'Invalid JSON' }); }

  const { action, status_filter } = body;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ ok: false, error: 'Server config error' });
  }

  const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };

  if (action === 'list') {
    const filter = status_filter && status_filter !== 'all'
      ? `&status=eq.${encodeURIComponent(status_filter)}`
      : '';
    const r = await fetch(
      `${supabaseUrl}/rest/v1/bank_soal?select=*&order=created_at.desc${filter}`,
      { headers }
    );
    const data = await r.json();
    return res.status(200).json({ ok: true, data: Array.isArray(data) ? data : [] });
  }

  if (action === 'stats') {
    const [pending, approved, rejected] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/bank_soal?status=eq.pending&select=id`, { headers }).then(r => r.json()),
      fetch(`${supabaseUrl}/rest/v1/bank_soal?status=eq.approved&select=id`, { headers }).then(r => r.json()),
      fetch(`${supabaseUrl}/rest/v1/bank_soal?status=eq.rejected&select=id`, { headers }).then(r => r.json()),
    ]);
    return res.status(200).json({
      ok: true,
      stats: {
        pending:  Array.isArray(pending)  ? pending.length  : 0,
        approved: Array.isArray(approved) ? approved.length : 0,
        rejected: Array.isArray(rejected) ? rejected.length : 0,
      }
    });
  }

  /* Ekspor soal pending untuk direview di luar aplikasi (mis. oleh Claude). Sengaja TANPA data pengirim
     (nama, WA, info) — reviewer hanya butuh isi soal & fotonya. Foto diberi link sementara 24 jam.
     Ikut disertakan indeks soal approved (tanpa teks) untuk mendeteksi kiriman dobel. */
  if (action === 'review-export') {
    // select=* supaya tidak gagal kalau ada kolom opsional yang belum dibuat; data pengirim dibuang di bawah.
    const [pendingRes, approvedRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/bank_soal?status=eq.pending&select=*&order=created_at.asc&limit=300`, { headers, signal: AbortSignal.timeout(15000) }),
      fetch(`${supabaseUrl}/rest/v1/bank_soal?status=eq.approved&select=id,fakultas,maddah_id,maddah_nama,tingkat,tahun,fashl&limit=2000`, { headers, signal: AbortSignal.timeout(15000) }),
    ]).catch(() => [null, null]);
    const pending = pendingRes ? await pendingRes.json().catch(() => null) : null;
    const approved = approvedRes ? await approvedRes.json().catch(() => null) : null;
    if (!Array.isArray(pending)) return res.status(500).json({ ok: false, error: 'Gagal membaca soal pending dari database' });

    // Semua link foto dibuat dalam SATU permintaan ke Storage (bukan satu per soal).
    const photoPath = (s) => (s.foto_url && !s.foto_deleted ? String(s.foto_url).split('/soal-foto/')[1] || null : null);
    const paths = [...new Set(pending.map(photoPath).filter(Boolean))];
    const signed = {};
    if (paths.length) {
      const r = await fetch(`${supabaseUrl}/storage/v1/object/sign/soal-foto`, {
        method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresIn: 86400, paths }), signal: AbortSignal.timeout(20000),
      }).catch(() => null);
      const list = r && r.ok ? await r.json().catch(() => null) : null;
      for (const x of Array.isArray(list) ? list : []) {
        if (x?.path && x.signedURL) signed[x.path] = `${supabaseUrl}/storage/v1${x.signedURL}`;
      }
    }
    const items = pending.map((s) => ({
      id: s.id, created_at: s.created_at, fakultas: s.fakultas, maddah_id: s.maddah_id, maddah_nama: s.maddah_nama,
      tingkat: s.tingkat ?? null, tahun: s.tahun, fashl: s.fashl, soal: s.soal || '', arti_soal: s.arti_soal || '',
      foto: signed[photoPath(s)] || null,
    }));
    return res.status(200).json({
      ok: true,
      data: {
        format: 'talqeeh-bank-soal-review/v1',
        exported_at: new Date().toISOString(),
        note: 'Tanpa data pengirim. Link foto berlaku 24 jam. Keputusan dikembalikan sebagai {"decisions":[{"id","action":"approve|reject|fix|skip","reason","fix":{...}}]}.',
        pending: items,
        approved_index: Array.isArray(approved) ? approved : [],
      },
    });
  }

  // Kolom draf belum ada di database → pesan yang jelas, bukan error mentah.
  const missingDraftColumns = (txt) => /draft|reviewed_/.test(txt) && /column|schema cache|PGRST204|42703/.test(txt);
  const getSoal = async (id) => {
    const r = await fetch(`${supabaseUrl}/rest/v1/bank_soal?id=eq.${encodeURIComponent(id)}&select=*&limit=1`, { headers });
    const rows = await r.json();
    return Array.isArray(rows) ? rows[0] : null;
  };
  const patchSoal = async (id, patch) => {
    const r = await fetch(`${supabaseUrl}/rest/v1/bank_soal?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH', headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify(patch),
    });
    if (r.ok) return null;
    const txt = await r.text();
    return missingDraftColumns(txt)
      ? 'Kolom draf belum ada — jalankan migrations/bank_soal_answer_drafts.sql di Supabase SQL Editor.'
      : `Gagal menyimpan (${r.status}).`;
  };

  if (action === 'update-info') {
    const { soal_id } = body;
    const soal = soal_id && await getSoal(soal_id);
    if (!soal) return res.status(404).json({ ok: false, error: 'Soal tidak ditemukan' });
    const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
    const patch = {};
    const maddahId = str(body.maddah_id, 120), maddahNama = str(body.maddah_nama, 200);
    if (maddahId) {
      if (!/^[a-z0-9-]+$/.test(maddahId) || !maddahNama) return res.status(400).json({ ok: false, error: 'Maddah tidak valid' });
      patch.maddah_id = maddahId; patch.maddah_nama = maddahNama;
    }
    const fakultas = str(body.fakultas, 60);
    if (fakultas) {
      if (!/^[a-z0-9-]+$/.test(fakultas)) return res.status(400).json({ ok: false, error: 'Fakultas tidak valid' });
      patch.fakultas = fakultas;
    }
    const tingkat = str(String(body.tingkat ?? ''), 2);
    if (tingkat) {
      if (!/^[1-5]$/.test(tingkat)) return res.status(400).json({ ok: false, error: 'Tingkat harus 1–5' });
      patch.tingkat = tingkat;
    }
    const tahun = str(body.tahun, 9);
    if (tahun) {
      if (!/^\d{4}\/\d{4}$/.test(tahun)) return res.status(400).json({ ok: false, error: 'Format tahun: 2025/2026' });
      patch.tahun = tahun;
    }
    if (body.fashl) {
      if (!['awwal', 'tsani'].includes(body.fashl)) return res.status(400).json({ ok: false, error: 'Fashl tidak valid' });
      patch.fashl = body.fashl;
    }
    if (typeof body.soal === 'string') {
      const t = body.soal.trim();
      if (!t || t.length > 40000) return res.status(400).json({ ok: false, error: 'Teks soal kosong atau terlalu panjang' });
      patch.soal = t;
    }
    if (!Object.keys(patch).length) return res.status(400).json({ ok: false, error: 'Tidak ada perubahan' });
    const err = await patchSoal(soal_id, patch);
    if (err) return res.status(500).json({ ok: false, error: err });
    return res.status(200).json({ ok: true, soal: { ...soal, ...patch } });
  }

  if (action === 'draft-generate') {
    const { soal_id, index } = body;
    const soal = soal_id && await getSoal(soal_id);
    if (!soal) return res.status(404).json({ ok: false, error: 'Soal tidak ditemukan' });
    if (soal.status !== 'approved') return res.status(400).json({ ok: false, error: 'Draf hanya untuk soal yang sudah di-approve.' });
    const blocks = soalBlocks(soal.soal);
    const i = Number(index);
    if (!Number.isInteger(i) || i < 0 || i >= blocks.length) return res.status(400).json({ ok: false, error: 'Nomor blok tidak valid' });
    const b = blocks[i];
    const ctx = `Maddah: ${soal.maddah_nama || '-'} · Fakultas: ${soal.fakultas || '-'} · Tingkat: ${soal.tingkat || '-'} · ${soal.tahun || '-'} ${soal.fashl === 'awwal' ? 'Fashl Awwal' : 'Fashl Tsani'}`;
    const model = (await resolveModels()).grade;
    let out;
    try {
      out = await callAIJson({
        system: DRAFT_SYSTEM,
        messages: [{ role: 'user', content: `${ctx}\nBlok soal ${i + 1} dari ${blocks.length}.\n\nSOAL (Arab):\n${b.arab}\n\n${b.arti ? `TERJEMAH:\n${b.arti}\n` : ''}` }],
        maxTokens: 2200, temperature: 0.2, model,
      });
    } catch (err) {
      return res.status(502).json({ ok: false, error: friendlyAiError(err) });
    }
    const jawaban = typeof out?.jawaban === 'string' ? out.jawaban.trim() : '';
    const penjelasan = typeof out?.penjelasan === 'string' ? out.penjelasan.trim() : '';
    if (!jawaban) return res.status(502).json({ ok: false, error: 'AI tidak mengembalikan jawaban. Coba lagi.' });
    const jd = Array.from({ length: blocks.length }, (_, k) => (Array.isArray(soal.jawaban_draft) ? soal.jawaban_draft[k] : '') || '');
    const pd = Array.from({ length: blocks.length }, (_, k) => (Array.isArray(soal.penjelasan_draft) ? soal.penjelasan_draft[k] : '') || '');
    jd[i] = jawaban; pd[i] = penjelasan;
    const err = await patchSoal(soal_id, { jawaban_draft: jd, penjelasan_draft: pd, draft_status: 'draft', draft_model: model, draft_at: new Date().toISOString() });
    if (err) return res.status(500).json({ ok: false, error: err });
    return res.status(200).json({ ok: true, index: i, total: blocks.length, jawaban, penjelasan, model });
  }

  if (action === 'draft-save') {
    const { soal_id } = body;
    const soal = soal_id && await getSoal(soal_id);
    if (!soal) return res.status(404).json({ ok: false, error: 'Soal tidak ditemukan' });
    const n = soalBlocks(soal.soal).length;
    const err = await patchSoal(soal_id, {
      jawaban_draft: cleanList(body.jawaban, n), penjelasan_draft: cleanList(body.penjelasan, n),
      draft_status: soal.draft_status === 'published' ? 'published' : 'draft',
    });
    if (err) return res.status(500).json({ ok: false, error: err });
    return res.status(200).json({ ok: true });
  }

  if (action === 'draft-publish') {
    const { soal_id } = body;
    const reviewer = typeof body.reviewer === 'string' ? body.reviewer.trim().slice(0, 120) : '';
    if (!reviewer) return res.status(400).json({ ok: false, error: 'Isi nama pemeriksa dulu.' });
    const soal = soal_id && await getSoal(soal_id);
    if (!soal) return res.status(404).json({ ok: false, error: 'Soal tidak ditemukan' });
    const n = soalBlocks(soal.soal).length;
    const jawaban = cleanList(body.jawaban, n);
    const penjelasan = cleanList(body.penjelasan, n);
    if (!jawaban.some(t => t.trim())) return res.status(400).json({ ok: false, error: 'Belum ada jawaban untuk dipublikasikan.' });
    // Server ikut menjaga: jangan tampilkan jawaban yang masih ditandai belum diverifikasi.
    if (needsVerify(jawaban) || needsVerify(penjelasan)) {
      return res.status(400).json({ ok: false, error: 'Masih ada tanda [PERLU DIVERIFIKASI]. Periksa & hapus tandanya dulu.' });
    }
    const now = new Date().toISOString();
    const err = await patchSoal(soal_id, {
      jawaban, penjelasan, jawaban_draft: jawaban, penjelasan_draft: penjelasan,
      draft_status: 'published', reviewed_by: reviewer, reviewed_at: now,
    });
    if (err) return res.status(500).json({ ok: false, error: err });
    return res.status(200).json({ ok: true });
  }

  if (action === 'draft-unpublish') {
    const { soal_id } = body;
    if (!soal_id) return res.status(400).json({ ok: false, error: 'soal_id wajib' });
    const err = await patchSoal(soal_id, { jawaban: null, penjelasan: null, draft_status: 'draft' });
    if (err) return res.status(500).json({ ok: false, error: err });
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ ok: false, error: 'Action tidak valid.' });
}
