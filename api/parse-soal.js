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

  const { soal_id, foto_url } = body;
  if (!soal_id || !foto_url) return res.status(400).json({ ok: false, error: 'soal_id dan foto_url wajib diisi' });

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const supabaseUrl   = process.env.SUPABASE_URL;
  const serviceKey    = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!openrouterKey) {
    return res.status(500).json({ ok: false, error: 'OPENROUTER_API_KEY belum diset di server' });
  }

  try {
    // Ekstrak path file dan buat signed URL dulu
    const filePath = foto_url.split('/storage/v1/object/soal-foto/')[1];
    if (!filePath) throw new Error('Path foto tidak valid');

    const signRes = await fetch(
      `${supabaseUrl}/storage/v1/object/sign/soal-foto/${filePath}`,
      {
        method: 'POST',
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expiresIn: 60 })
      }
    );
    const signData = await signRes.json();
    if (!signData.signedURL) throw new Error('Gagal buat signed URL');
    const accessUrl = `${supabaseUrl}/storage/v1${signData.signedURL}`;

    // Fetch foto via signed URL
    const fotoRes = await fetch(accessUrl);
    if (!fotoRes.ok) throw new Error('Gagal mengambil foto');
    const buffer  = await fotoRes.arrayBuffer();
    const base64  = Buffer.from(buffer).toString('base64');
    const mimeType = fotoRes.headers.get('content-type') || 'image/jpeg';

    // Kirim ke OpenRouter
    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://talqeeh.com',
        'X-Title': 'Talqeeh Bank Soal',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64}` }
            },
            {
              type: 'text',
              text: `Kamu adalah asisten akademik Al-Azhar yang ahli bahasa Arab dan bahasa Indonesia.

Ini adalah foto kertas soal ujian tahriri dari Universitas Al-Azhar Kairo.

TUGAS KAMU:
1. Ekstrak semua soal dari foto
2. Untuk setiap soal, berikan format PERSIS seperti ini:

[SOAL_ARAB]
(teks soal dalam bahasa Arab persis seperti di kertas)
[ARTI]
(terjemahan soal ke bahasa Indonesia yang natural, pertahankan istilah teknis dalam bahasa Arab)

Contoh format output yang benar:
[SOAL_ARAB]
١. عرّف النحو لغةً واصطلاحاً مع بيان موضوعه وفائدته.
[ARTI]
1. Definisikan Nahwu secara bahasa dan istilah, beserta penjelasan objek kajian dan manfaatnya.

[SOAL_ARAB]
٢. ما هي أقسام الكلام عند النحويين؟ مع التمثيل لكل قسم.
[ARTI]
2. Apa saja pembagian kalam menurut para ahli nahwu? Beserta contoh untuk setiap pembagian.

ATURAN KETAT:
- Tulis teks Arab PERSIS seperti di foto — jangan ubah harakat atau kata apapun
- Terjemahan harus natural dalam bahasa Indonesia — bukan terjemahan kaku kata per kata
- Pertahankan istilah teknis (nahwu, fiqh, ushul, dll) dalam bahasa Arab di terjemahan
- Nomor soal ikuti yang ada di foto
- Kalau foto blur atau tidak terbaca: tulis hanya "FOTO_TIDAK_TERBACA"
- Kalau bukan soal ujian Al-Azhar berbahasa Arab: tulis hanya "BUKAN_SOAL_AZHAR"
- Jangan tambahkan komentar, penjelasan, atau apapun di luar format di atas

Ekstrak sekarang:`
            }
          ]
        }]
      })
    });

    const aiData = await aiRes.json();
    const hasil  = aiData.choices?.[0]?.message?.content || '';

    if (!hasil) throw new Error('AI tidak mengembalikan hasil');

    // Update kolom soal di database
    await fetch(`${supabaseUrl}/rest/v1/bank_soal?id=eq.${soal_id}`, {
      method: 'PATCH',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ soal: hasil, ai_parsed: true })
    });

    return res.status(200).json({ ok: true, teks: hasil });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
