import crypto from 'crypto';

const TOKEN_TTL = 8 * 60 * 60 * 1000;

const getSecret = () => process.env.ADMIN_PIN || 'fallback-secret';

// ── Rate limiter sederhana (in-memory) ──
// Max 5 percobaan per IP per 15 menit
const RATE_LIMIT_MAX      = 5;
const RATE_LIMIT_WINDOW   = 15 * 60 * 1000;
const _attempts = {};

const checkRateLimit = (ip) => {
  const now = Date.now();
  if (!_attempts[ip]) _attempts[ip] = [];
  // Buang percobaan yang sudah lewat window
  _attempts[ip] = _attempts[ip].filter(t => now - t < RATE_LIMIT_WINDOW);
  if (_attempts[ip].length >= RATE_LIMIT_MAX) return false;
  _attempts[ip].push(now);
  return true;
};

// Bersihkan entri lama setiap 30 menit supaya memory tidak membengkak
setInterval(() => {
  const now = Date.now();
  Object.keys(_attempts).forEach(ip => {
    _attempts[ip] = (_attempts[ip] || []).filter(t => now - t < RATE_LIMIT_WINDOW);
    if (_attempts[ip].length === 0) delete _attempts[ip];
  });
}, 30 * 60 * 1000);

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
    // Rate limiting — max 5 percobaan per IP per 15 menit
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      res.status(429).json({ ok: false, error: 'Terlalu banyak percobaan. Coba lagi 15 menit lagi.' });
      return;
    }

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
