import https from 'https';
import { verifyToken } from './admin-auth.js';

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const token = (req.headers || {})['x-admin-token'];
  if (!verifyToken(token)) {
    res.status(401).json({ ok: false, error: 'Unauthorized — login ulang ke admin panel' });
    return;
  }

  let body = '';
  await new Promise(resolve => { req.on('data', c => body += c); req.on('end', resolve); });

  const supabaseUrl = process.env.SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !serviceKey) {
    res.status(500).json({ ok: false, error: 'Supabase belum dikonfigurasi' });
    return;
  }

  try {
    const { action, code, row } = JSON.parse(body || '{}');
    let result;

    if (action === 'list') {
      result = await sbRequest(supabaseUrl, serviceKey, 'GET', 'members?order=created_at.desc', null);
    } else if (action === 'add') {
      result = await sbRequest(supabaseUrl, serviceKey, 'POST', 'members', row);
    } else if (action === 'update') {
      result = await sbRequest(supabaseUrl, serviceKey, 'PATCH', `members?code=eq.${encodeURIComponent(code)}`, row);
    } else if (action === 'delete') {
      result = await sbRequest(supabaseUrl, serviceKey, 'DELETE', `members?code=eq.${encodeURIComponent(code)}`, null);
    } else if (action === 'aggregate-profiles') {
      result = await sbRequest(supabaseUrl, serviceKey, 'GET', 'user_profiles?select=member_code,profile', null);
    } else if (action === 'aggregate-activity') {
      result = await sbRequest(supabaseUrl, serviceKey, 'GET', 'user_maddah_activity?select=*', null);
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
}
