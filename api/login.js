const loginAttempts = new Map();

const checkRateLimit = (ip) => {
  const now      = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 10;

  const attempts = loginAttempts.get(ip) || [];
  const recent   = attempts.filter(t => now - t < windowMs);

  if (recent.length >= maxAttempts) return false;

  recent.push(now);
  loginAttempts.set(ip, recent);
  return true;
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

  const clientIP =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    'unknown';

  if (clientIP !== 'unknown' && !checkRateLimit(clientIP)) {
    console.warn(`[login] Rate limited: ${clientIP}`);
    res.status(200).json({ ok: false, status: 'not_found' });
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

  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'Code required' });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL          || '';
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !serviceKey) {
    res.status(500).json({ error: 'Server tidak terkonfigurasi' });
    return;
  }

  try {
    if (clientIP !== 'unknown') {
      const blRes = await fetch(
        `${supabaseUrl}/rest/v1/submission_blacklist?type=eq.ip&value=eq.${encodeURIComponent(clientIP)}&select=id`,
        { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
      );
      const bl = await blRes.json();
      if (Array.isArray(bl) && bl.length > 0) {
        console.warn(`[login] Blacklisted IP: ${clientIP}`);
        res.status(200).json({ ok: false, status: 'not_found' });
        return;
      }
    }

    const memberRes = await fetch(
      `${supabaseUrl}/rest/v1/members?code=eq.${encodeURIComponent(code.trim().toUpperCase())}&select=*&limit=1`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Accept: 'application/json' } }
    );
    const members = await memberRes.json();

    if (!Array.isArray(members) || members.length === 0) {
      res.status(200).json({ ok: false, status: 'not_found' });
      return;
    }

    const m = members[0];

    if (m.status !== 'active') {
      res.status(200).json({ ok: false, status: m.status });
      return;
    }

    loginAttempts.delete(clientIP);

    const deviceLabel = (() => {
      const ua = req.headers['user-agent'] || '';
      if (/iPhone|iPad/i.test(ua))  return 'iOS';
      if (/Android/i.test(ua))      return 'Android';
      if (/Mac/i.test(ua))          return 'Mac';
      if (/Windows/i.test(ua))      return 'Windows';
      if (/Linux/i.test(ua))        return 'Linux';
      return 'Browser';
    })();

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
    ).catch(e => console.warn('[login] last_login update failed:', e.message));

    res.status(200).json({
      ok: true,
      member: {
        code:      m.code,
        name:      m.name,
        status:    m.status,
        expiresAt: m.expires_at,
        duration:  m.duration,
        device:    deviceLabel,
        deviceId:  m.device_id,
        lastLogin: m.last_login,
        notes:     m.notes || '',
      }
    });

  } catch (err) {
    console.error('[login] error:', err.message);
    res.status(200).json({ ok: false, status: 'not_found' });
  }
}
