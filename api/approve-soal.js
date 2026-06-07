import { verifyToken } from './admin-auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') return res.status(405).end();

  const token = (req.headers || {})['x-admin-token'];
  if (!verifyToken(token)) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  let rawBody = '';
  await new Promise(resolve => { req.on('data', c => rawBody += c); req.on('end', resolve); });

  let body;
  try { body = JSON.parse(rawBody || '{}'); }
  catch { return res.status(400).json({ ok: false, error: 'Invalid JSON' }); }

  const { soal_id, action, reject_reason, reward_type, soal_teks, arti_soal, jawaban, penjelasan } = body;
  if (!soal_id || !action) return res.status(400).json({ ok: false, error: 'soal_id dan action wajib diisi' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const fonnteToken = process.env.FONNTE_TOKEN;

  // Ambil data soal
  const soalRes = await fetch(
    `${supabaseUrl}/rest/v1/bank_soal?id=eq.${soal_id}&select=*`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
  );
  const soalArr = await soalRes.json();
  const soal = soalArr[0];
  if (!soal) return res.status(404).json({ ok: false, error: 'Soal tidak ditemukan' });

  const sendWA = async (target, message) => {
    if (!fonnteToken || !target) return;
    let num = target.replace(/[^0-9]/g, '');
    if (num.startsWith('0')) num = '62' + num.slice(1);
    if (!num.startsWith('62')) num = '62' + num;
    try {
      await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          Authorization: fonnteToken,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `target=${num}&message=${encodeURIComponent(message)}&countryCode=62`
      });
    } catch (e) {
      console.error('[sendWA] Error:', e.message);
    }
  };

  const sbPatch = async (id, data) => {
    await fetch(`${supabaseUrl}/rest/v1/bank_soal?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  };

  if (action === 'approve') {
    await sbPatch(soal_id, {
      status: 'approved',
      soal: soal_teks || soal.soal,
      arti_soal: arti_soal || null,
      jawaban: jawaban || null,
      penjelasan: penjelasan || null,
      reward_type: reward_type || null,
      approved_at: new Date().toISOString()
    });

    // Hapus foto dari storage setelah approve
    if (soal.foto_url && !soal.foto_deleted) {
      const filePath = soal.foto_url.split('/soal-foto/')[1];
      if (filePath) {
        await fetch(`${supabaseUrl}/storage/v1/object/soal-foto/${filePath}`, {
          method: 'DELETE',
          headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
        });
        await sbPatch(soal_id, { foto_deleted: true });
      }
    }

    // Kirim WA reward
    if (reward_type && soal.submitter_wa) {
      const pesan = {
        lifetime: `Assalamualaikum ${soal.submitter_name}! 🎉\n\nSoal ujian yang kamu submit untuk maddah *${soal.maddah_nama}* sudah diverifikasi dan diterima.\n\nSebagai reward, kamu mendapatkan *akses Talqeeh lifetime GRATIS!* 🎓\n\nKode aksesmu akan segera dikirim. Barakallahu fiik! 🙏`,
        diskon:   `Assalamualaikum ${soal.submitter_name}! 🎉\n\nSoal ujian untuk maddah *${soal.maddah_nama}* sudah diterima.\n\nKamu mendapatkan *diskon spesial* untuk bergabung sebagai member Talqeeh. Info lebih lanjut segera dikirim! 🙏`,
        poin:     `Assalamualaikum ${soal.submitter_name}! 🎉\n\nSoal ujian untuk maddah *${soal.maddah_nama}* sudah diterima.\n\n*Poin kamu sudah ditambahkan!* Kumpulkan poin untuk ditukar merchandise Talqeeh. Terima kasih atas kontribusinya! 🙏`,
      }[reward_type] || `Assalamualaikum ${soal.submitter_name}! Soal kamu untuk maddah *${soal.maddah_nama}* sudah diterima. Terima kasih! 🙏`;

      await sendWA(soal.submitter_wa, pesan);
      await sbPatch(soal_id, { reward_sent: true });
    }

    return res.status(200).json({ ok: true, action: 'approved' });

  } else if (action === 'reject') {
    await sbPatch(soal_id, {
      status: 'rejected',
      reject_reason: reject_reason || 'Tidak memenuhi standar'
    });

    if (soal.submitter_wa) {
      await sendWA(
        soal.submitter_wa,
        `Assalamualaikum ${soal.submitter_name},\n\nMohon maaf, soal yang kamu submit untuk maddah *${soal.maddah_nama}* belum bisa diterima.\n\nAlasan: ${reject_reason || 'Tidak memenuhi standar kualitas'}\n\nSilakan coba submit ulang dengan foto yang lebih jelas. Terima kasih! 🙏`
      );
    }

    return res.status(200).json({ ok: true, action: 'rejected' });
  }

  return res.status(400).json({ ok: false, error: 'Action tidak valid. Gunakan approve atau reject.' });
}
