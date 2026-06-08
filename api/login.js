const sbRequest = (supabaseUrl, serviceKey, method, path) => {
  const url = new URL(`${supabaseUrl}/rest/v1/${path}`);
  return fetch(url.toString(), {
    method,
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  }).then(r => r.json());
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let rawBody = '';
  await new Promise(resolve => { req.on('data', c => rawBody += c); req.on('end', resolve); });

  let code;
  try {
    ({ code } = JSON.parse(rawBody || '{}'));
  } catch {
    res.status(400).json({ error: 'Invalid JSON' });
    return;
  }

  if (!code) {
    res.status(400).json({ error: 'Code required' });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL || '';
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !serviceKey) {
    res.status(500).json({ error: 'Server tidak terkonfigurasi' });
    return;
  }

  try {
    const data = await sbRequest(
      supabaseUrl,
      serviceKey,
      'GET',
      `members?code=eq.${encodeURIComponent(code.trim().toUpperCase())}&limit=1`
    );

    if (!Array.isArray(data) || data.length === 0) {
      res.status(404).json({ ok: false, status: 'not_found' });
      return;
    }

    const m = data[0];

    // ── Update last_login di Supabase ──
    const deviceLabel = req.headers['user-agent']
      ? (() => {
          const ua = req.headers['user-agent'];
          if (/iPhone|iPad/i.test(ua))  return 'iOS';
          if (/Android/i.test(ua))      return 'Android';
          if (/Mac/i.test(ua))          return 'Mac';
          if (/Windows/i.test(ua))      return 'Windows';
          if (/Linux/i.test(ua))        return 'Linux';
          return 'Unknown';
        })()
      : 'Unknown';

    fetch(
      `${supabaseUrl}/rest/v1/members?code=eq.${encodeURIComponent(m.code)}`,
      {
        method: 'PATCH',
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          last_login: new Date().toISOString(),
          device: deviceLabel,
        })
      }
    ).catch(err => console.warn('[login] Failed to update last_login:', err.message));

    res.status(200).json({
      ok: true,
      member: {
        code:      m.code,
        name:      m.name,
        status:    m.status,
        expiresAt: m.expires_at,
        duration:  m.duration,
        device:    m.device,
        deviceId:  m.device_id,
        lastLogin: m.last_login,
        notes:     m.notes || '',
      }
    });
  } catch (err) {
    console.error('[login] Supabase error:', err.message);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
}
