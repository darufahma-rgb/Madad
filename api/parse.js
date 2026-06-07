export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const action = req.query?.action;

  if (action === 'soal')      return handleParseSoal(req, res);
  if (action === 'talkhisan') return handleParseTalkhisan(req, res);

  return res.status(400).json({ ok: false, error: 'Action tidak valid' });
}

/* ── PARSE SOAL (OCR foto ujian) ── */
async function handleParseSoal(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { soal_id, foto_url } = req.body;
  if (!soal_id || !foto_url) return res.status(400).json({ ok: false, error: 'soal_id dan foto_url wajib diisi' });

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const supabaseUrl   = process.env.SUPABASE_URL;
  const serviceKey    = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!openrouterKey) return res.status(500).json({ ok: false, error: 'OPENROUTER_API_KEY belum diset' });

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
        model: 'anthropic/claude-3-haiku',
        max_tokens: 3000,
        temperature: 0,
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
            {
              type: 'text',
              text: `Kamu adalah mesin transkripsi soal ujian Al-Azhar yang sangat presisi.

LANGKAH 1 — IDENTIFIKASI BAGIAN SOAL
Kertas ujian Al-Azhar biasanya punya struktur:
[HEADER] → [INSTRUKSI UMUM] → [SOAL-SOAL] → [FOOTER]

Kamu HANYA perlu bagian SOAL-SOAL saja.

ABAIKAN TOTAL (jangan transkripsi):
- Baris "بسم الله الرحمن الرحيم"
- Nama universitas, fakultas, jurusan, shu'bah
- Nama matakuliah/المادة
- Tahun akademik/العام الدراسي (tapi CATAT untuk [TAHUN_AKADEMIK])
- Waktu ujian/الزمن
- Nama dosen/الأستاذ
- Stempel, tanda tangan, kop surat
- Instruksi teknis: "أجب عن كل الأسئلة", "الزمن ساعتان", "ممنوع الغش"
- Bobot nilai: "[٢٠ درجة]", "(١٠ نقاط)", "درجات"
- Footer: "انتهت الأسئلة", "مع تمنياتنا بالتوفيق"
- Nama mahasiswa, nomor kursi

TRANSKRIPSI HANYA:
Pertanyaan/soal yang dimulai dengan:
- Nomor: ١- atau ١. atau (١) atau السؤال الأول
- Kata kerja perintah: اشرح / عرّف / بيّن / اذكر / قارن / وضّح / حدّد / استدل / تكلم / اكتب / ما هو / ما هي / كيف

LANGKAH 2 — FORMAT OUTPUT

Pertama tulis tahun:
[TAHUN_AKADEMIK]
2024/2025

Kemudian untuk SETIAP soal, tulis PERSIS format ini (satu soal = satu blok):

[SOAL_ARAB]
١. اشرح مفهوم الإجماع وبيّن حجيته عند الأصوليين.
[ARTI]
1. Jelaskan konsep ijma' dan sebutkan kehujjahannya menurut para ahli ushul fiqh.

[SOAL_ARAB]
٢. عرّف القياس لغةً واصطلاحاً، وما هي أركانه؟
[ARTI]
2. Definisikan qiyas secara bahasa dan istilah, dan apa saja rukun-rukunnya?

ATURAN TRANSKRIPSI:
- Salin teks Arab PERSIS seperti di foto — jangan ubah harakat, ejaan, atau kata
- Satu [SOAL_ARAB] = satu nomor soal (jangan gabungkan dua soal)
- Kalau satu soal punya sub-pertanyaan (أ، ب، ج) — tetap satu blok [SOAL_ARAB]
- Bagian tidak terbaca: tulis [...]
- Jika tidak ada soal yang bisa dibaca: "FOTO_TIDAK_TERBACA"

MULAI SEKARANG — langsung dengan [TAHUN_AKADEMIK], tanpa komentar apapun:`
            }
          ]
        }]
      })
    });

    const aiData = await aiRes.json();
    const hasil  = aiData.choices?.[0]?.message?.content || '';
    if (!hasil) throw new Error('AI tidak mengembalikan hasil');

    // Ekstrak tahun
    let tahunDariSoal = null;
    const tahunMatch  = hasil.match(/\[TAHUN_AKADEMIK\]\s*\n([^\n]+)/);
    if (tahunMatch) {
      const raw = tahunMatch[1].trim();
      if (raw !== 'TIDAK_TERTERA') tahunDariSoal = raw;
    }

    const teksBersih = hasil.replace(/\[TAHUN_AKADEMIK\]\s*\n[^\n]+\n?/, '').trim();

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
        ...(tahunDariSoal ? { notes: `Tahun di kertas soal: ${tahunDariSoal}` } : {})
      })
    });

    return res.status(200).json({ ok: true, teks: teksBersih, tahun_dari_soal: tahunDariSoal });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

/* ── PARSE TALKHISAN (PDF/Foto) ── */
async function handleParseTalkhisan(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { foto_base64, mime_type, pdf_pages } = req.body;
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
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-haiku',
          max_tokens: 3000,
          temperature: 0,
          messages: [{
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:${mime_type};base64,${foto_base64}` } },
              { type: 'text', text: `Kamu adalah asisten akademik Al-Azhar yang ahli bahasa Arab.\n\nEkstrak semua teks Arab dari foto talkhisan ini secara lengkap dan akurat.\n- Tulis teks Arab persis seperti yang tertulis, termasuk harakat jika ada\n- Susun per poin/bab sesuai struktur di foto\n- Bagian tidak terbaca: tandai dengan [...]\n- Jangan tambahkan terjemahan\n- Jika tidak terbaca: "FOTO_TIDAK_TERBACA"\n\nEkstrak sekarang:` }
            ]
          }]
        })
      });
      const data = await aiRes.json();
      return res.status(200).json({ ok: true, teks: data.choices?.[0]?.message?.content || '' });
    }

    if (pdf_pages && Array.isArray(pdf_pages) && pdf_pages.length > 0) {
      const BATCH_SIZE = 3;
      const batches = [];
      for (let i = 0; i < pdf_pages.length; i += BATCH_SIZE) {
        batches.push(pdf_pages.slice(i, i + BATCH_SIZE));
      }

      const results = [];
      for (let bIdx = 0; bIdx < batches.length; bIdx++) {
        const batch     = batches[bIdx];
        const batchText = batch.map((t, i) => `=== HALAMAN ${bIdx * BATCH_SIZE + i + 1} ===\n${t}`).join('\n\n');

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
              content: `Rapikan teks Arab dari ${batch.length} halaman talkhisan ini. Pertahankan SEMUA teks Arab persis, hapus header/footer tidak relevan, gabungkan baris terpotong.\n\n${batchText}`
            }]
          })
        });

        const data  = await aiRes.json();
        const hasil = data.choices?.[0]?.message?.content || '';
        if (hasil && hasil !== '[HALAMAN KOSONG]') results.push(hasil);

        if (bIdx < batches.length - 1) await new Promise(r => setTimeout(r, 500));
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
