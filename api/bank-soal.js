import { verifyToken } from './admin-auth.js';
import { consumeQuota } from './_lib/member.js';

/* ── Anti-spam kiriman publik ──
   Batas per IP & total per hari disimpan di database (ai_usage lewat consume_ai_quota), jadi tidak hilang saat
   server berganti instance dan tidak bisa diakali dengan mengganti nomor WA. Fail closed: kalau penghitung tidak
   bisa dibaca, kiriman ditolak. */
const SUBMIT_PER_IP_DAY = 15;
const SUBMIT_ALL_DAY    = 150;
const UPLOAD_PER_IP_DAY = 20;
const UPLOAD_ALL_DAY    = 300;

const clientIpOf = (req) =>
  ((req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.headers['x-real-ip'] || 'unknown').slice(0, 60);

const isBlacklistedIp = async (supabaseUrl, serviceKey, ip) => {
  if (ip === 'unknown') return false;
  const r = await fetch(
    `${supabaseUrl}/rest/v1/submission_blacklist?type=eq.ip&value=eq.${encodeURIComponent(ip)}&select=id`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
  );
  const rows = await r.json().catch(() => []);
  return Array.isArray(rows) && rows.length > 0;
};

// Kuota harian per IP lalu total; false = ditolak.
const takeDailySlot = async (prefix, kind, ip, perIp, total) =>
  (await consumeQuota(`${prefix}-IP-${ip}`, kind, perIp)) && (await consumeQuota(`${prefix}-ALL`, kind, total));

// Cek isi file benar-benar gambar (tanda tangan byte), bukan hanya Content-Type yang bisa dipalsukan.
const imageKind = (buf) => {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.length >= 8 && buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.length >= 12 && buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP') return 'webp';
  return null;
};

const clip = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

// Rate limit upload foto — in-memory per instance
const uploadAttempts = new Map();

const checkUploadRateLimit = (ip) => {
  const now        = Date.now();
  const windowMs   = 60 * 60 * 1000; // 1 jam
  const maxUploads = 10;              // maks 10 upload per jam per IP

  const attempts = uploadAttempts.get(ip) || [];
  const recent   = attempts.filter(t => now - t < windowMs);

  if (recent.length >= maxUploads) return false; // BLOCKED

  recent.push(now);
  uploadAttempts.set(ip, recent);
  return true; // ALLOWED
};

const parseBody = (req) => new Promise((resolve) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try { resolve(JSON.parse(body || '{}')); }
    catch { resolve({}); }
  });
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const action = req.query?.action;

  if (action === 'submit')          return handleSubmit(req, res);
  if (action === 'approve')         return handleApprove(req, res);
  if (action === 'foto')            return handleFoto(req, res);
  if (action === 'delete')          return handleDelete(req, res);
  if (action === 'upload-foto')     return handleUploadFoto(req, res);

  return res.status(400).json({ ok: false, error: 'Action tidak valid' });
}

/* ── SUBMIT SOAL ── */
async function handleSubmit(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const {
    _checkOnly, fakultas, maddah_id, maddah_nama, tingkat,
    tahun, fashl, submitted_by, submitter_name,
    submitter_wa, submitter_info, foto_url
  } = await parseBody(req);

  if (_checkOnly) {
    if (!maddah_id || !tahun || !fashl) {
      return res.status(400).json({ ok: false, error: 'Field tidak lengkap' });
    }
    const checkRes = await fetch(
      `${supabaseUrl}/rest/v1/bank_soal?maddah_id=eq.${maddah_id}&tahun=eq.${encodeURIComponent(tahun)}&fashl=eq.${fashl}&status=eq.approved&select=id`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    );
    const existing = await checkRes.json();
    if (existing.length > 0) {
      return res.status(409).json({ ok: false, error: 'duplicate', message: 'Soal untuk maddah, tahun, dan fashl ini sudah tersedia. Terima kasih!' });
    }
    return res.status(200).json({ ok: true });
  }

  if (!fakultas || !maddah_id || !tahun || !fashl || !submitter_name || !submitter_wa || !foto_url) {
    return res.status(400).json({ ok: false, error: 'Field tidak lengkap' });
  }
  // Foto harus hasil upload-foto Talqeeh sendiri (bukan tautan bebas), nomor WA wajar, isian tidak kepanjangan.
  const fotoPrefix = `${supabaseUrl}/storage/v1/object/soal-foto/`;
  const waDigits = String(submitter_wa).replace(/\D/g, '');
  if (typeof foto_url !== 'string' || !foto_url.startsWith(fotoPrefix) || /[^\w./-]/.test(foto_url.slice(fotoPrefix.length))) {
    return res.status(400).json({ ok: false, error: 'Foto tidak valid. Unggah ulang fotonya.' });
  }
  if (waDigits.length < 8 || waDigits.length > 15) {
    return res.status(400).json({ ok: false, error: 'Nomor WhatsApp tidak valid' });
  }
  if ([fakultas, maddah_id, tahun, fashl].some(v => typeof v !== 'string' || v.length > 80) || String(submitter_name).length > 100) {
    return res.status(400).json({ ok: false, error: 'Isian tidak valid' });
  }
  const ip = clientIpOf(req);
  if (await isBlacklistedIp(supabaseUrl, serviceKey, ip)) {
    return res.status(403).json({ ok: false, error: 'Kiriman tidak diizinkan.' });
  }
  if (!(await takeDailySlot('SUBMIT', 'soal_submit', ip, SUBMIT_PER_IP_DAY, SUBMIT_ALL_DAY))) {
    return res.status(429).json({ ok: false, error: 'Batas kiriman soal hari ini tercapai. Coba lagi besok.' });
  }

  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const rateRes = await fetch(
    `${supabaseUrl}/rest/v1/bank_soal?submitter_wa=eq.${encodeURIComponent(submitter_wa)}&created_at=gte.${oneHourAgo}&select=id`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
  );
  const recent = await rateRes.json();
  if (recent.length >= 10) {
    return res.status(429).json({ ok: false, error: 'Terlalu banyak submission dalam 1 jam.' });
  }

  const insertRes = await fetch(`${supabaseUrl}/rest/v1/bank_soal`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify({
      fakultas, maddah_id, maddah_nama: clip(maddah_nama, 160), tingkat: clip(tingkat, 40),
      tahun, fashl, foto_url, submitted_by: clip(submitted_by, 100),
      submitter_name: clip(submitter_name, 100), submitter_wa: waDigits, submitter_info: clip(submitter_info, 300),
      status: 'pending'
    })
  });

  const data = await insertRes.json();
  return res.status(200).json({ ok: true, id: data[0]?.id });
}

/* ── APPROVE / REJECT SOAL ── */
async function handleApprove(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!verifyToken((req.headers || {})['x-admin-token'])) {
    return res.status(401).json({ ok: false, error: 'Unauthorized — login ulang ke admin panel' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const fonnteKey   = process.env.FONNTE_TOKEN;

  const { soal_id, action, reject_reason, reward_type, soal_teks } = await parseBody(req);
  if (!soal_id || !action) return res.status(400).json({ ok: false });

  const soalRes = await fetch(
    `${supabaseUrl}/rest/v1/bank_soal?id=eq.${soal_id}&select=*`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
  );
  const [soal] = await soalRes.json();
  if (!soal) return res.status(404).json({ ok: false, error: 'Soal tidak ditemukan' });

  const sendWA = async (target, message) => {
    await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { Authorization: fonnteKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, message, countryCode: '62' })
    });
  };

  const patch = async (body) => {
    await fetch(`${supabaseUrl}/rest/v1/bank_soal?id=eq.${soal_id}`, {
      method: 'PATCH',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
  };

  if (action === 'approve') {
    await patch({
      status: 'approved',
      soal: soal_teks || soal.soal,
      reward_type: reward_type || null,
      approved_at: new Date().toISOString()
    });

    if (soal.foto_url && !soal.foto_deleted) {
      const filePath = soal.foto_url.split('/soal-foto/')[1];
      if (filePath) {
        await fetch(`${supabaseUrl}/storage/v1/object/soal-foto/${filePath}`, {
          method: 'DELETE',
          headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
        });
        await patch({ foto_deleted: true });
      }
    }

    if (reward_type && soal.submitter_wa) {
      const pesan = {
        lifetime: `Assalamualaikum ${soal.submitter_name}! 🎉\n\nSoal ujian untuk maddah *${soal.maddah_nama}* sudah diverifikasi dan diterima. Jazakallahu khair atas kontribusinya!\n\n🎓 Kamu mendapatkan *akses Talqeeh lifetime GRATIS!*\n\nKode aksesmu akan segera dikirim. Barakallahu fiik! 🙏`,

        diskon: `Assalamualaikum ${soal.submitter_name}! 🎉\n\nSoal ujian untuk maddah *${soal.maddah_nama}* sudah diverifikasi dan diterima. Jazakallahu khair!\n\n🏷️ Kamu mendapatkan *diskon spesial* untuk bergabung sebagai member Talqeeh.\n\nInfo lebih lanjut segera dikirim. Barakallahu fiik! 🙏`,

        voucher: `Assalamualaikum ${soal.submitter_name}! 🎉\n\nMasya Allah — kamu sudah submit *2 termin penuh* ke Bank Soal Talqeeh!\n\n🍽️ Kamu mendapatkan *voucher makan siang Rp 50.000* sebagai apresiasi atas kontribusimu.\n\nCara klaim: balas pesan ini atau japri admin untuk proses voucher. Barakallahu fiik! 🙏`,

        poin: `Assalamualaikum ${soal.submitter_name}! 🎉\n\nSoal ujian untuk maddah *${soal.maddah_nama}* sudah diterima.\n\n🏅 Kamu mendapatkan *Badge Kontributor Talqeeh* dan namamu akan tercantum di Hall of Fame!\n\nTerima kasih atas kontribusinya untuk sesama Masisir. Barakallahu fiik! 🙏`,
      }[reward_type] || `Assalamualaikum ${soal.submitter_name}! Soal kamu untuk maddah *${soal.maddah_nama}* sudah diterima. Jazakallahu khair! 🙏`;

      await sendWA(soal.submitter_wa, pesan);
      await patch({ reward_sent: true });
    }

    return res.status(200).json({ ok: true, action: 'approved' });

  } else if (action === 'reject') {
    await patch({
      status: 'rejected',
      reject_reason: reject_reason || 'Tidak memenuhi standar'
    });

    if (soal.foto_url && !soal.foto_deleted) {
      const filePath = soal.foto_url.split('/soal-foto/')[1];
      if (filePath) {
        await fetch(`${supabaseUrl}/storage/v1/object/soal-foto/${filePath}`, {
          method: 'DELETE',
          headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
        });
        await patch({ foto_deleted: true });
      }
    }

    if (soal.submitter_wa) {
      await sendWA(
        soal.submitter_wa,
        `Assalamualaikum ${soal.submitter_name},\n\nMohon maaf, soal untuk maddah *${soal.maddah_nama}* belum bisa diterima.\n\nAlasan: ${reject_reason || 'Tidak memenuhi standar kualitas'}\n\nSilakan coba submit ulang dengan foto yang lebih jelas. Terima kasih! 🙏`
      );
    }

    return res.status(200).json({ ok: true, action: 'rejected' });
  }

  return res.status(400).json({ ok: false, error: 'Action tidak valid' });
}

/* ── HAPUS PERMANENT ── */
async function handleDelete(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!verifyToken((req.headers || {})['x-admin-token'])) {
    return res.status(401).json({ ok: false, error: 'Unauthorized — login ulang ke admin panel' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const { soal_id } = req.body;

  if (!soal_id) return res.status(400).json({ ok: false, error: 'soal_id required' });

  try {
    const soalRes = await fetch(
      `${supabaseUrl}/rest/v1/bank_soal?id=eq.${soal_id}&select=foto_url,foto_deleted`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    );
    const [soal] = await soalRes.json();

    if (soal?.foto_url && !soal?.foto_deleted) {
      const filePath = soal.foto_url.split('/storage/v1/object/soal-foto/')[1];
      if (filePath) {
        await fetch(`${supabaseUrl}/storage/v1/object/soal-foto/${filePath}`, {
          method: 'DELETE',
          headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
        });
      }
    }

    await fetch(`${supabaseUrl}/rest/v1/bank_soal?id=eq.${soal_id}`, {
      method: 'DELETE',
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

/* ── UPLOAD FOTO SERVER-SIDE (tutup celah storage exploit) ── */
async function handleUploadFoto(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ ok: false, error: 'Server tidak terkonfigurasi' });
  }

  try {
    const clientIP = clientIpOf(req);

    // Cek rate limit
    if (clientIP !== 'unknown' && !checkUploadRateLimit(clientIP)) {
      console.warn(`[upload-foto] Rate limited: ${clientIP}`);
      return res.status(429).json({
        ok: false,
        error: 'Terlalu banyak upload. Coba lagi dalam 1 jam.'
      });
    }

    // Cek blacklist IP
    if (await isBlacklistedIp(supabaseUrl, serviceKey, clientIP)) {
      console.warn(`[upload-foto] Blacklisted IP: ${clientIP}`);
      return res.status(403).json({ ok: false, error: 'Upload tidak diizinkan.' });
    }
    if (!(await takeDailySlot('UPLOAD', 'soal_upload', clientIP, UPLOAD_PER_IP_DAY, UPLOAD_ALL_DAY))) {
      return res.status(429).json({ ok: false, error: 'Batas upload foto hari ini tercapai. Coba lagi besok.' });
    }

    const chunks = [];
    await new Promise((resolve, reject) => {
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', resolve);
      req.on('error', reject);
    });
    const buffer = Buffer.concat(chunks);

    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ ok: false, error: 'Foto terlalu besar. Maksimal 5MB.' });
    }

    if (buffer.length < 1024) {
      return res.status(400).json({ ok: false, error: 'File tidak valid.' });
    }

    // Jenis file ditentukan dari isinya, bukan dari header yang bisa dipalsukan.
    const ext = imageKind(buffer);
    if (!ext) {
      return res.status(400).json({ ok: false, error: 'Hanya file gambar (JPG, PNG, WebP) yang diizinkan.' });
    }
    const contentType = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[ext];
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const uploadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/soal-foto/${filename}`,
      {
        method: 'POST',
        headers: {
          'apikey':        serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type':  contentType,
          'Cache-Control': '3600',
        },
        body: buffer,
      }
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      console.error('[upload-foto] Supabase error:', err);
      return res.status(500).json({ ok: false, error: 'Upload gagal.' });
    }

    const fotoUrl = `${supabaseUrl}/storage/v1/object/soal-foto/${filename}`;
    console.log(`[upload-foto] OK: ${filename} | ${buffer.length} bytes | IP: ${clientIP}`);
    return res.status(200).json({ ok: true, foto_url: fotoUrl, filename });

  } catch (err) {
    console.error('[upload-foto] error:', err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

/* ── SIGNED URL FOTO ── */
async function handleFoto(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!verifyToken((req.headers || {})['x-admin-token'])) {
    return res.status(401).json({ ok: false, error: 'Unauthorized — login ulang ke admin panel' });
  }

  const { foto_url } = await parseBody(req);
  if (!foto_url) return res.status(400).json({ ok: false });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const filePath = foto_url.split('/storage/v1/object/soal-foto/')[1];
    if (!filePath) return res.status(400).json({ ok: false, error: 'Path tidak valid' });

    const signedRes = await fetch(
      `${supabaseUrl}/storage/v1/object/sign/soal-foto/${filePath}`,
      {
        method: 'POST',
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expiresIn: 3600 })
      }
    );

    const data = await signedRes.json();
    if (data.signedURL) {
      return res.status(200).json({
        ok: true,
        signedUrl: `${supabaseUrl}/storage/v1${data.signedURL}`
      });
    }
    throw new Error('Gagal buat signed URL');
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
