const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const rawBody = await new Promise(resolve => {
    let d = '';
    req.on('data', c => d += c);
    req.on('end', () => resolve(d));
  });

  try {
    const { to, message } = JSON.parse(rawBody);

    if (!to || !message) {
      res.status(400).json({ ok: false, error: 'to dan message wajib diisi' });
      return;
    }

    const FONNTE_TOKEN = process.env.FONNTE_TOKEN || '';
    if (!FONNTE_TOKEN) {
      res.status(500).json({ ok: false, error: 'FONNTE_TOKEN belum diset' });
      return;
    }

    let num = to.replace(/[^0-9]/g, '');
    if (num.startsWith('0')) num = '62' + num.slice(1);
    if (!num.startsWith('62')) num = '62' + num;

    const data = `target=${num}&message=${encodeURIComponent(message)}&countryCode=62`;

    const result = await new Promise((resolve, reject) => {
      const u = new URL('https://api.fonnte.com/send');
      const reqFonnte = https.request({
        hostname: u.hostname,
        path: u.pathname,
        method: 'POST',
        headers: {
          'Authorization': FONNTE_TOKEN,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(data),
        },
      }, resFonnte => {
        let d = '';
        resFonnte.on('data', c => d += c);
        resFonnte.on('end', () => {
          try { resolve({ status: resFonnte.statusCode, data: JSON.parse(d) }); }
          catch { resolve({ status: resFonnte.statusCode, data: d }); }
        });
      });
      reqFonnte.on('error', reject);
      reqFonnte.write(data);
      reqFonnte.end();
    });

    console.log('[send-wa] Kirim ke', num, '→', result.status);
    res.status(200).json({ ok: true, result });

  } catch (err) {
    console.error('[send-wa] Error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
};
