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
      fakultas, maddah_id, maddah_nama, tingkat,
      tahun, fashl, foto_url, submitted_by,
      submitter_name, submitter_wa, submitter_info,
      status: 'pending'
    })
  });

  const data = await insertRes.json();
  return res.status(200).json({ ok: true, id: data[0]?.id });
}

/* ── APPROVE / REJECT SOAL ── */
async function handleApprove(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const fonnteKey   = process.env.FONNTE_API_KEY;

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
    const clientIP =
      (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
      req.headers['x-real-ip'] || 'unknown';

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

    const contentType = req.headers['content-type'] || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      return res.status(400).json({ ok: false, error: 'Hanya file gambar yang diizinkan.' });
    }

    if (buffer.length < 1024) {
      return res.status(400).json({ ok: false, error: 'File tidak valid.' });
    }

    const ext = contentType.includes('png') ? 'png' :
                contentType.includes('webp') ? 'webp' : 'jpg';
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
