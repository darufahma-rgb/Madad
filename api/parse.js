const parseBody = (req) => new Promise((resolve) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try { resolve(JSON.parse(body || '{}')); }
    catch { resolve({}); }
  });
});

export default async function handler(req, res) {
  const { action } = req.query;
  if (action === 'soal')      return handleParseSoal(req, res);
  if (action === 'talkhisan') return handleParseTalkhisan(req, res);
  return res.status(400).json({ ok: false, error: 'Action tidak valid' });
}

/* ── PARSE SOAL ── */
async function handleParseSoal(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { soal_id, foto_url } = await parseBody(req);
  if (!soal_id || !foto_url) return res.status(400).json({ ok: false });

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const supabaseUrl   = process.env.SUPABASE_URL;
  const serviceKey    = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
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
    const fotoRes   = await fetch(accessUrl);
    if (!fotoRes.ok) throw new Error('Gagal mengambil foto');

    const buffer   = await fotoRes.arrayBuffer();
    const base64   = Buffer.from(buffer).toString('base64');
    const mimeType = fotoRes.headers.get('content-type') || 'image/jpeg';

    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://talqeeh.vercel.app',
        'X-Title': 'Talqeeh Bank Soal',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-haiku',
        max_tokens: 4000,
        temperature: 0,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64}` }
            },
            {
              type: 'text',
              text: `Baca foto kertas soal ujian ini dengan teliti.

Tugas: Ekstrak soal-soal ujian yang ada di foto ini.

Langkah 1 - Cari tahun akademik di kertas (biasanya di header atas).

Langkah 2 - Temukan semua soal ujian. Soal biasanya ditandai dengan:
- السؤال الأول / الثاني / الثالث / الرابع
- Nomor: ١. ٢. ٣. atau 1. 2. 3.
- Kata perintah: اشرح، عرّف، بيّن، اذكر، قارن، وضّح، ما هو، ما هي

Langkah 3 - Tulis output dengan format ini persis:

[TAHUN_AKADEMIK]
2025/2026

[SOAL_ARAB]
(salin teks soal Arab persis seperti tertulis di foto)
[ARTI]
(terjemahkan soal ke bahasa Indonesia)

[SOAL_ARAB]
(soal berikutnya)
[ARTI]
(terjemahannya)

Catatan penting:
- Salin teks Arab PERSIS seperti di foto, jangan ubah apapun
- Satu nomor soal = satu blok [SOAL_ARAB], termasuk sub-pertanyaan (أ ب ج)
- Jika bagian tidak terbaca dengan jelas: tulis [...]
- Jika foto tidak mengandung soal ujian: tulis FOTO_TIDAK_TERBACA`
            }
          ]
        }]
      })
    });

    const aiData = await aiRes.json();

    if (aiData.error) throw new Error(aiData.error.message || 'OpenRouter error');

    const hasil = aiData.choices?.[0]?.message?.content || '';
    if (!hasil) throw new Error('AI tidak mengembalikan hasil');

    let tahunDariSoal = null;
    const tahunMatch  = hasil.match(/\[TAHUN_AKADEMIK\]\s*\n([^\n\[]+)/);
    if (tahunMatch) {
      const raw = tahunMatch[1].trim();
      if (raw && raw !== 'TIDAK_TERTERA') tahunDariSoal = raw;
    }

    const teksBersih = hasil
      .replace(/\[TAHUN_AKADEMIK\][^\[]*/, '')
      .trim();

    await fetch(`${supabaseUrl}/rest/v1/bank_soal?id=eq.${soal_id}`, {
      method: 'PATCH',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        soal: teksBersih,
        ai_parsed: true,
        ...(tahunDariSoal ? { notes: `Tahun di kertas: ${tahunDariSoal}` } : {})
      })
    });

    return res.status(200).json({
      ok: true,
      teks: teksBersih,
      tahun_dari_soal: tahunDariSoal,
    });

  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

/* ── PARSE TALKHISAN ── */
async function handleParseTalkhisan(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { foto_base64, mime_type, pdf_pages } = await parseBody(req);
  const openrouterKey = process.env.OPENROUTER_API_KEY;

  if (!openrouterKey) return res.status(500).json({ ok: false, error: 'OpenRouter key tidak tersedia' });

  try {
    if (foto_base64) {
      const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openrouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://talqeeh.vercel.app',
          'X-Title': 'Talqeeh Talkhisan',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-haiku',
          max_tokens: 3000,
          temperature: 0,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:${mime_type};base64,${foto_base64}` }
              },
              {
                type: 'text',
                text: `Baca foto talkhisan (ringkasan materi ujian) ini dan ekstrak semua teks Arabnya.
- Salin teks Arab persis seperti tertulis, termasuk harakat jika ada
- Susun per poin sesuai struktur di foto
- Bagian tidak terbaca: tulis [...]
- Jika tidak ada teks Arab: tulis FOTO_TIDAK_TERBACA`
              }
            ]
          }]
        })
      });
      const data = await aiRes.json();
      if (data.error) throw new Error(data.error.message || 'OpenRouter error');
      const hasil = data.choices?.[0]?.message?.content || '';
      return res.status(200).json({ ok: true, teks: hasil });
    }

    if (pdf_pages && Array.isArray(pdf_pages) && pdf_pages.length > 0) {
      const BATCH_SIZE = 3;
      const results = [];

      for (let i = 0; i < pdf_pages.length; i += BATCH_SIZE) {
        const batch     = pdf_pages.slice(i, i + BATCH_SIZE);
        const batchText = batch.map((t, j) => `=== HALAMAN ${i + j + 1} ===\n${t}`).join('\n\n');

        const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openrouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://talqeeh.vercel.app',
          },
          body: JSON.stringify({
            model: 'anthropic/claude-3-haiku',
            max_tokens: 2000,
            temperature: 0,
            messages: [{
              role: 'user',
              content: `Rapikan teks Arab dari halaman talkhisan berikut. Pertahankan SEMUA teks Arab persis seperti aslinya. Hapus header/footer yang tidak relevan.\n\n${batchText}`
            }]
          })
        });

        const data  = await aiRes.json();
        const hasil = data.choices?.[0]?.message?.content || '';
        if (hasil && hasil.trim() !== '[HALAMAN KOSONG]') results.push(hasil);

        if (i + BATCH_SIZE < pdf_pages.length) {
          await new Promise(r => setTimeout(r, 500));
        }
      }

      const finalTeks = results.join('\n\n');
      if (!finalTeks.trim()) {
        return res.status(200).json({ ok: false, error: 'PDF tidak mengandung teks Arab. Coba upload sebagai foto.' });
      }
      return res.status(200).json({ ok: true, teks: finalTeks });
    }

    return res.status(400).json({ ok: false, error: 'Tidak ada input yang valid' });

  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
