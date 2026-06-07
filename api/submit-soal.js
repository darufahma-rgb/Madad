export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') return res.status(405).end();

  let rawBody = '';
  await new Promise(resolve => { req.on('data', c => rawBody += c); req.on('end', resolve); });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ ok: false, error: 'Server config error' });
  }

  let body;
  try { body = JSON.parse(rawBody || '{}'); }
  catch { return res.status(400).json({ ok: false, error: 'Invalid JSON' }); }

  const {
    _checkOnly,
    fakultas, maddah_id, maddah_nama, tingkat,
    tahun, fashl, submitted_by, submitter_name,
    submitter_wa, submitter_info, foto_url
  } = body;

  // Cek duplikat (juga dipanggil saat _checkOnly dari form)
  if (maddah_id && tahun && fashl) {
    const checkRes = await fetch(
      `${supabaseUrl}/rest/v1/bank_soal?maddah_id=eq.${encodeURIComponent(maddah_id)}&tahun=eq.${encodeURIComponent(tahun)}&fashl=eq.${encodeURIComponent(fashl)}&status=eq.approved&select=id`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    );
    const existing = await checkRes.json();
    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(409).json({
        ok: false, error: 'duplicate',
        message: 'Soal untuk maddah, tahun, dan fashl ini sudah tersedia. Terima kasih!'
      });
    }
  }

  if (_checkOnly) return res.status(200).json({ ok: true });

  // Validasi field wajib
  if (!fakultas || !maddah_id || !tahun || !fashl || !submitter_name || !submitter_wa || !foto_url) {
    return res.status(400).json({ ok: false, error: 'Field tidak lengkap' });
  }

  // Rate limit: maks 10 submission per WA per jam
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const rateRes = await fetch(
    `${supabaseUrl}/rest/v1/bank_soal?submitter_wa=eq.${encodeURIComponent(submitter_wa)}&created_at=gte.${oneHourAgo}&select=id`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
  );
  const recent = await rateRes.json();
  if (Array.isArray(recent) && recent.length >= 10) {
    return res.status(429).json({ ok: false, error: 'Terlalu banyak submission dalam 1 jam. Coba lagi nanti.' });
  }

  // Insert
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
  if (!insertRes.ok) return res.status(500).json({ ok: false, error: data.message || 'Insert gagal' });
  return res.status(200).json({ ok: true, id: data[0]?.id });
}
