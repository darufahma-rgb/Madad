export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  let body = '';
  await new Promise(resolve => { req.on('data', c => body += c); req.on('end', resolve); });
  const { foto_url } = JSON.parse(body || '{}');

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
      return res.status(200).json({ ok: true, signedUrl: `${supabaseUrl}/storage/v1${data.signedURL}` });
    }
    throw new Error('Gagal buat signed URL');
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
