import https from 'https';
import { verifyToken } from './admin-auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const token = (req.headers || {})['x-admin-token'];
  if (!verifyToken(token)) {
    res.status(401).json({ ok: false, error: 'Unauthorized — hanya admin yang bisa kirim WA' });
    return;
  }

  let body = '';
  await new Promise(resolve => { req.on('data', c => body += c); req.on('end', resolve); });

  try {
    const { to, message } = JSON.parse(body);

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

    res.status(200).json({ ok: true, result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
