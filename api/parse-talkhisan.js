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

  const { foto_base64, mime_type, pdf_pages } = body;
  const openrouterKey = process.env.OPENROUTER_API_KEY;

  if (!openrouterKey) {
    return res.status(500).json({ ok: false, error: 'OpenRouter key tidak tersedia' });
  }

  try {
    // ── MODE FOTO ─────────────────────────────────────────────
    if (foto_base64) {
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
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:${mime_type};base64,${foto_base64}` }
              },
              {
                type: 'text',
                text: `Kamu adalah asisten akademik Al-Azhar yang ahli bahasa Arab.

Ini adalah foto talkhisan (ringkasan ujian) mahasiswa Al-Azhar.

TUGAS:
Ekstrak semua teks Arab dari foto ini secara lengkap dan akurat.
- Tulis teks Arab persis seperti yang tertulis, termasuk harakat jika ada
- Susun per poin/bab sesuai struktur di foto
- Jika ada bagian tidak terbaca: tandai dengan [...]
- Jangan tambahkan terjemahan atau penjelasan
- Jika foto tidak terbaca sama sekali: tulis hanya "FOTO_TIDAK_TERBACA"

Ekstrak sekarang:`
              }
            ]
          }]
        })
      });

      const data = await aiRes.json();
      const hasil = data.choices?.[0]?.message?.content || '';
      return res.status(200).json({ ok: true, teks: hasil });
    }

    // ── MODE PDF (batch per halaman) ──────────────────────────
    if (pdf_pages && Array.isArray(pdf_pages) && pdf_pages.length > 0) {
      const BATCH_SIZE = 3;
      const batches = [];

      for (let i = 0; i < pdf_pages.length; i += BATCH_SIZE) {
        batches.push(pdf_pages.slice(i, i + BATCH_SIZE));
      }

      const batchResults = [];

      for (let bIdx = 0; bIdx < batches.length; bIdx++) {
        const batch = batches[bIdx];
        const batchText = batch
          .map((teks, i) => `=== HALAMAN ${bIdx * BATCH_SIZE + i + 1} ===\n${teks}`)
          .join('\n\n');

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
            max_tokens: 2000,
            messages: [{
              role: 'user',
              content: `Kamu adalah asisten akademik Al-Azhar yang ahli bahasa Arab.

Ini adalah teks dari ${batch.length} halaman talkhisan (ringkasan ujian) mahasiswa Al-Azhar:

${batchText}

TUGAS:
Rapikan teks Arab dari halaman-halaman ini menjadi teks yang bersih dan terstruktur.
- Pertahankan SEMUA teks Arab persis seperti aslinya — jangan ada yang terlewat
- Susun per poin/bab jika ada struktur yang jelas
- Hapus header/footer tidak relevan (nama mahasiswa, tanggal, nomor halaman, watermark)
- Gabungkan baris yang terpotong menjadi kalimat utuh
- Jangan terjemahkan, jangan tambah, jangan kurangi konten
- Jika halaman kosong atau tidak ada teks Arab: tulis [HALAMAN KOSONG]

Output: teks Arab bersih dari ${batch.length} halaman ini:`
            }]
          })
        });

        const data = await aiRes.json();
        const hasil = data.choices?.[0]?.message?.content || '';

        if (hasil && hasil !== '[HALAMAN KOSONG]') {
          batchResults.push(hasil);
        }

        if (bIdx < batches.length - 1) {
          await new Promise(r => setTimeout(r, 500));
        }
      }

      const finalTeks = batchResults.join('\n\n');

      if (!finalTeks.trim()) {
        return res.status(200).json({
          ok: false,
          error: 'PDF tidak mengandung teks Arab yang bisa dibaca. Coba upload sebagai foto.'
        });
      }

      return res.status(200).json({ ok: true, teks: finalTeks });
    }

    return res.status(400).json({ ok: false, error: 'Tidak ada input yang valid' });

  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
