const crypto = require('crypto');

const validTokens = new Map();
const TOKEN_TTL = 8 * 60 * 60 * 1000;

const handler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'Method not allowed' }); return; }

  const rawBody = await new Promise(resolve => {
    if (req._rawBody !== undefined) { resolve(req._rawBody); return; }
    let d = ''; req.on('data', c => d += c); req.on('end', () => resolve(d));
  });

  try {
    const { pin } = JSON.parse(rawBody || '{}');
    const adminPin = (process.env.ADMIN_PIN || '').trim();

    if (!adminPin) {
      res.status(500).json({ ok: false, error: 'ADMIN_PIN belum diset di server. Hubungi developer.' });
      return;
    }
    if (!pin || pin.trim() !== adminPin) {
      res.status(401).json({ ok: false, error: 'PIN salah' });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + TOKEN_TTL;
    validTokens.set(token, expiry);

    for (const [t, exp] of validTokens) {
      if (Date.now() > exp) validTokens.delete(t);
    }

    res.status(200).json({ ok: true, token, expiresAt: new Date(expiry).toISOString() });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
};

handler.validTokens = validTokens;
module.exports = handler;
