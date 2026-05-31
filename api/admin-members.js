const https = require('https');

const verifyToken = (headers) => {
  const token = (headers || {})['x-admin-token'];
  if (!token) return false;
  try {
    const authHandler = require('./admin-auth.js');
    const expiry = authHandler.validTokens.get(token);
    return !!(expiry && Date.now() < expiry);
  } catch { return false; }
};

const sbRequest = (supabaseUrl, serviceKey, method, path, body) => {
  const url = new URL(`${supabaseUrl}/rest/v1/${path}`);
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const hreq = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d || 'null') }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    hreq.on('error', reject);
    if (data) hreq.write(data);
    hreq.end();
  });
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  if (!verifyToken(req.headers)) {
    res.status(401).json({ ok: false, error: 'Unauthorized — login ulang ke admin panel' });
    return;
  }

  const rawBody = await new Promise(resolve => {
    if (req._rawBody !== undefined) { resolve(req._rawBody); return; }
    let d = ''; req.on('data', c => d += c); req.on('end', () => resolve(d));
  });

  const supabaseUrl = process.env.SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !serviceKey) {
    res.status(500).json({ ok: false, error: 'Supabase belum dikonfigurasi' });
    return;
  }

  try {
    const { action, code, row } = JSON.parse(rawBody || '{}');
    let result;

    if (action === 'list') {
      result = await sbRequest(supabaseUrl, serviceKey, 'GET', 'members?order=created_at.desc', null);
    } else if (action === 'add') {
      result = await sbRequest(supabaseUrl, serviceKey, 'POST', 'members', row);
    } else if (action === 'update') {
      result = await sbRequest(supabaseUrl, serviceKey, 'PATCH', `members?code=eq.${encodeURIComponent(code)}`, row);
    } else if (action === 'delete') {
      result = await sbRequest(supabaseUrl, serviceKey, 'DELETE', `members?code=eq.${encodeURIComponent(code)}`, null);
    } else {
      res.status(400).json({ ok: false, error: `Action tidak dikenal: ${action}` });
      return;
    }

    if (result.status >= 400) {
      res.status(result.status).json({ ok: false, error: result.data });
    } else {
      res.status(200).json({ ok: true, data: result.data });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
