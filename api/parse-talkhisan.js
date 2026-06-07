export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') return res.status(405).end();

  let rawBody = '';
  await new Promise(resolve => { req.on('data', c => rawBody += c); req.on('end', resolve); });

  let body;
  try { body = JSON.parse(rawBody || '{}'); }
  catch { return res.status(400).json({ ok: false, error: 'Invalid JSON' }); }

  const { foto_base64, mime_type, pdf_text } = body;
  const openrouterKey = process.env.OPENROUTER_API_KEY;

  if (!openrouterKey) {
    return res.status(500).json({ ok: false, error: 'OpenRouter key tidak tersedia' });
  }

  try {
    let messages;

    if (pdf_text) {
      messages = [{
        role: 'user',
        content: `Kamu adalah asisten akademik Al-Azhar yang ahli bahasa Arab.

Ini adalah teks dari talkhisan (ringkasan ujian) mahasiswa Al-Azhar:

${pdf_text}

TUGAS:
Ekstrak dan susun ulang isi talkhisan ini menjadi teks Arab yang bersih dan terstruktur.
- Pertahankan semua teks Arab persis seperti aslinya
- Susun per poin/bab jika ada struktur yang jelas
- Hapus header/footer yang tidak relevan (nama, tanggal, nomor halaman)
- Jangan tambahkan, kurangi, atau terjemahkan — hanya susun ulang
- Output: teks Arab bersih siap dipakai sebagai input prompt belajar

Teks talkhisan yang sudah dirapikan:`
      }];
    } else if (foto_base64) {
      messages = [{
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mime_type};base64,${foto_base64}` }
          },
          {
            type: 'text',
            text: `Kamu adalah asisten akademik Al-Azhar yang ahli bahasa Arab.

Ini adalah foto talkhisan (ringkasan ujian) mahasiswa Al-Azhar — ditulis tangan atau diketik.

TUGAS:
Ekstrak semua teks Arab dari foto ini secara lengkap dan akurat.
- Tulis teks Arab persis seperti yang tertulis, termasuk harakat jika ada
- Susun per poin/bab sesuai struktur di foto
- Jika ada bagian yang tidak terbaca dengan jelas, tandai dengan [...]
- Jangan tambahkan terjemahan atau penjelasan
- Jika foto tidak terbaca sama sekali: tulis hanya "FOTO_TIDAK_TERBACA"

Ekstrak sekarang:`
          }
        ]
      }];
    } else {
      return res.status(400).json({ ok: false, error: 'Tidak ada input' });
    }

    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://talqeeh.com',
        'X-Title': 'Talqeeh Bedah Talkhisan',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        max_tokens: 3000,
        messages,
      })
    });

    const data = await aiRes.json();
    const hasil = data.choices?.[0]?.message?.content || '';

    if (!hasil) throw new Error('AI tidak menghasilkan output');

    return res.status(200).json({ ok: true, teks: hasil });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
