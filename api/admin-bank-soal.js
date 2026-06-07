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

  const { action, status_filter } = body;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ ok: false, error: 'Server config error' });
  }

  const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };

  if (action === 'list') {
    const filter = status_filter && status_filter !== 'all'
      ? `&status=eq.${encodeURIComponent(status_filter)}`
      : '';
    const r = await fetch(
      `${supabaseUrl}/rest/v1/bank_soal?select=*&order=created_at.desc${filter}`,
      { headers }
    );
    const data = await r.json();
    return res.status(200).json({ ok: true, data: Array.isArray(data) ? data : [] });
  }

  if (action === 'stats') {
    const [pending, approved, rejected] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/bank_soal?status=eq.pending&select=id`, { headers }).then(r => r.json()),
      fetch(`${supabaseUrl}/rest/v1/bank_soal?status=eq.approved&select=id`, { headers }).then(r => r.json()),
      fetch(`${supabaseUrl}/rest/v1/bank_soal?status=eq.rejected&select=id`, { headers }).then(r => r.json()),
    ]);
    return res.status(200).json({
      ok: true,
      stats: {
        pending:  Array.isArray(pending)  ? pending.length  : 0,
        approved: Array.isArray(approved) ? approved.length : 0,
        rejected: Array.isArray(rejected) ? rejected.length : 0,
      }
    });
  }

  return res.status(400).json({ ok: false, error: 'Action tidak valid. Gunakan list atau stats.' });
}
