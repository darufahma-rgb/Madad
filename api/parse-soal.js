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
              text: `Kamu adalah mesin transkripsi teks Arab yang sangat presisi.

TUGAS UTAMA: Salin PERSIS semua teks yang tercetak di foto ini — karakter demi karakter, tanpa mengubah apapun.

ATURAN WAJIB — TIDAK BOLEH DILANGGAR:
1. DILARANG menambah harakat yang tidak ada di foto
2. DILARANG menghapus harakat yang ada di foto
3. DILARANG mengubah ejaan — walau terlihat salah ketik
4. DILARANG menambah/menghapus huruf
5. DILARANG mengubah urutan kata atau kalimat
6. DILARANG memperbaiki grammar Arab
7. DILARANG menambahkan tanda baca yang tidak ada
8. DILARANG menggabungkan atau memisahkan kata yang berbeda dari aslinya

FORMAT OUTPUT:
Untuk setiap soal/pertanyaan yang ditemukan, gunakan format PERSIS ini:

[SOAL_ARAB]
(teks soal Arab persis seperti di foto — tidak boleh diubah sedikitpun)
[ARTI]
(terjemahan natural ke bahasa Indonesia — HANYA bagian ini boleh kamu tulis sendiri)

CONTOH yang BENAR:
Jika di foto tertulis: "١. عرف النحو لغةً" (tanpa harakat di "عرف")
Maka output HARUS: "١. عرف النحو لغةً" (bukan "١. عَرِّفِ النَّحْوَ لُغَةً")

CONTOH yang SALAH:
❌ Menambah harakat: "عَرِّفِ" padahal di foto "عرف"
❌ Mengubah kata: "اشرح" padahal di foto "بيّن"
❌ Menambah nomor soal yang tidak ada
❌ Menggabungkan 2 soal menjadi 1

KONDISI KHUSUS:
- Jika ada bagian yang benar-benar tidak terbaca: tulis [...] di posisi itu
- Jika foto sepenuhnya tidak terbaca: tulis hanya "FOTO_TIDAK_TERBACA"
- Jika bukan soal ujian berbahasa Arab: tulis hanya "BUKAN_SOAL_AZHAR"
- Header/footer (nama kampus, nama matakuliah, tanggal, nama dosen): BOLEH diabaikan
- Instruksi ujian ("أجب عن الأسئلة التالية" dll): WAJIB disertakan persis

Mulai transkripsi sekarang — salin apa yang kamu lihat, bukan apa yang menurutmu seharusnya tertulis:`
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
