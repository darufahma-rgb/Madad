import crypto from 'crypto';

const TOKEN_TTL = 8 * 60 * 60 * 1000;

const getSecret = () => process.env.ADMIN_PIN || 'fallback-secret';

export const signToken = (payload) => {
  const secret = getSecret();
  const data = JSON.stringify(payload);
  const sig = crypto.createHmac('sha256', secret).update(data).digest('hex');
  return Buffer.from(data).toString('base64') + '.' + sig;
};

export const verifyToken = (token) => {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  try {
    const secret = getSecret();
    const data = Buffer.from(parts[0], 'base64').toString();
    const sig = crypto.createHmac('sha256', secret).update(data).digest('hex');
    if (sig !== parts[1]) return false;
    const payload = JSON.parse(data);
    return Date.now() < payload.exp;
  } catch { return false; }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'Method not allowed' }); return; }

  let body = '';
  await new Promise(resolve => { req.on('data', c => body += c); req.on('end', resolve); });

  try {
    const { pin } = JSON.parse(body || '{}');
    const adminPin = (process.env.ADMIN_PIN || '').trim();

    if (!adminPin) {
      res.status(500).json({ ok: false, error: 'ADMIN_PIN belum diset di server.' });
      return;
    }
    if (!pin || pin.trim() !== adminPin) {
      res.status(401).json({ ok: false, error: 'PIN salah' });
      return;
    }

    const exp = Date.now() + TOKEN_TTL;
    const token = signToken({ role: 'admin', exp });
    res.status(200).json({ ok: true, token, expiresAt: new Date(exp).toISOString() });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
}
