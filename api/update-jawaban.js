export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') return res.status(405).end();

  let rawBody = '';
  await new Promise(resolve => { req.on('data', c => rawBody += c); req.on('end', resolve); });

  let body;
  try { body = JSON.parse(rawBody || '{}'); }
  catch { return res.status(400).json({ ok: false, error: 'Invalid JSON' }); }

  const { soal_id, jawaban_array } = body;

  if (!soal_id || !Array.isArray(jawaban_array)) {
    return res.status(400).json({ ok: false, error: 'Data tidak valid' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ ok: false, error: 'Server tidak terkonfigurasi' });
  }

  try {
    const arti_soal   = jawaban_array.map(s => s.arti       || '');
    const jawaban     = jawaban_array.map(s => s.jawaban    || '');
    const penjelasan  = jawaban_array.map(s => s.penjelasan || '');

    const updateRes = await fetch(
      `${supabaseUrl}/rest/v1/bank_soal?id=eq.${soal_id}`,
      {
        method: 'PATCH',
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ arti_soal, jawaban, penjelasan }),
      }
    );

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      throw new Error('Gagal update: ' + errText);
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
