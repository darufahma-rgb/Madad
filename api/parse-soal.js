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
        max_tokens: 3000,
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
              text: `Kamu adalah mesin transkripsi teks soal ujian yang sangat presisi.

KONTEKS: Ini adalah foto kertas soal ujian tahriri dari Universitas Al-Azhar Kairo. Kertas ini HANYA berisi soal-soal ujian dalam bahasa Arab. Mungkin ada nama mahasiswa, nama dosen, tanggal, stempel, atau elemen lain di kertas — ABAIKAN semua itu.

FOKUS UTAMA: Ekstrak HANYA teks soal-soal ujiannya saja.

YANG HARUS DIABAIKAN (jangan transkripsi):
- Nama mahasiswa, nama dosen, nama matakuliah
- Tanggal ujian, tahun akademik, nomor soal di header
- Kop surat, stempel, tanda tangan
- Instruksi teknis ujian ("waktu 2 jam", "dilarang membuka catatan", dll)
- Nilai/bobot soal ("درجات ٢٠", "[٢٠ درجة]", dll)
- Nama universitas, fakultas, jurusan
- Apapun yang bukan pertanyaan/soal ujian

YANG HARUS DITRANSKRIP (soal ujian):
- Semua pertanyaan yang dimulai dengan nomor (١، ٢، ٣ atau 1. 2. 3.)
- Pertanyaan yang dimulai dengan kata kerja perintah Arab: اشرح، عرّف، بيّن، اذكر، قارن، وضّح، حدّد، استدل، dll
- Instruksi soal yang relevan seperti "أجب عن الأسئلة التالية" — WAJIB disertakan

ATURAN TRANSKRIPSI — TIDAK BOLEH DILANGGAR:
1. Salin teks soal PERSIS karakter demi karakter — tidak boleh diubah sedikitpun
2. DILARANG menambah/menghapus/mengubah harakat
3. DILARANG memperbaiki ejaan atau grammar
4. DILARANG menambah kata yang tidak ada di foto
5. Jika ada bagian tidak terbaca: tulis [...] di posisi itu

FORMAT OUTPUT — gunakan PERSIS format ini untuk setiap soal:

[SOAL_ARAB]
(teks soal Arab persis seperti di foto)
[ARTI]
(terjemahan natural ke bahasa Indonesia)

PENTING: Jangan tambahkan kalimat pembuka, penutup, atau komentar apapun.
Langsung mulai dengan [SOAL_ARAB] untuk soal pertama.

Jika tidak ada soal yang bisa dibaca: tulis hanya "FOTO_TIDAK_TERBACA"
Jika foto jelas tapi bukan soal ujian Al-Azhar: tulis hanya "BUKAN_SOAL_AZHAR"`
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
