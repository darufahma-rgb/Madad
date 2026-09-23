import crypto from 'crypto';

const parseBody = (req) => new Promise((resolve) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try { resolve(JSON.parse(body || '{}')); }
    catch { resolve(null); }
  });
});

const verifyWebhookToken = (req) => {
  const expected = (process.env.MAYAR_WEBHOOK_TOKEN || '').trim();
  const given = (req.query?.token || '').trim();
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

// custom_field dari Mayar berbentuk array [{ dataLabel/label, dataValue/value }, ...]
// (bentuk pasti belum terverifikasi dari payload asli — lihat raw_payload di DB kalau ini meleset)
const extractMemberCode = (customField) => {
  if (!Array.isArray(customField)) return null;
  const entry = customField.find(f => {
    const label = (f?.dataLabel || f?.label || '').toLowerCase();
    return label.includes('kode member') || label.includes('member code');
  });
  const value = entry?.dataValue ?? entry?.value ?? null;
  return typeof value === 'string' && value.trim() ? value.trim().toUpperCase() : null;
};

const STATUS_BY_EVENT = {
  'membership.newMemberRegistered':        'active',
  'membership.changeTierMemberRegistered': 'active',
  'membership.memberExpired':              'expired',
  'membership.memberUnsubscribed':         'unsubscribed',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'Method not allowed' }); return; }

  if (!verifyWebhookToken(req)) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return;
  }

  const body = await parseBody(req);
  if (!body) { res.status(200).json({ ok: true, ignored: 'invalid_json' }); return; }

  try {
    const event = body.event || body?.data?.event || null;
    const status = STATUS_BY_EVENT[event];
    const data = body.data || {};

    if (!status) {
      res.status(200).json({ ok: true, ignored: 'unhandled_event', event });
      return;
    }

    const memberCode = extractMemberCode(data.custom_field);
    if (!memberCode) {
      console.warn('[mayar-webhook] no member code in custom_field, event:', event);
      res.status(200).json({ ok: true, ignored: 'no_member_code' });
      return;
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      res.status(500).json({ ok: false, error: 'Server tidak terkonfigurasi' });
      return;
    }

    const productId  = data.productId || null;
    const eventAt    = data.updatedAt || data.createdAt || new Date().toISOString();
    const headers = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    // Guard against out-of-order webhook retries overwriting a newer state
    const existingRes = await fetch(
      `${supabaseUrl}/rest/v1/ai_subscriptions?member_code=eq.${encodeURIComponent(memberCode)}&product_id=eq.${encodeURIComponent(productId || '')}&select=last_event_at`,
      { headers }
    );
    const existing = await existingRes.json().catch(() => []);
    const existingAt = Array.isArray(existing) && existing[0]?.last_event_at;
    if (existingAt && new Date(existingAt) > new Date(eventAt)) {
      res.status(200).json({ ok: true, ignored: 'stale_event' });
      return;
    }

    await fetch(`${supabaseUrl}/rest/v1/ai_subscriptions?on_conflict=member_code,product_id`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({
        member_code:   memberCode,
        product_id:    productId,
        status,
        mayar_email:   data.customerEmail || null,
        mayar_mobile:  data.customerMobile || null,
        last_event:    event,
        last_event_at: eventAt,
        raw_payload:   body,
        updated_at:    new Date().toISOString(),
      }),
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[mayar-webhook] error:', err.message);
    res.status(200).json({ ok: true, error: 'internal_error_logged' });
  }
}
