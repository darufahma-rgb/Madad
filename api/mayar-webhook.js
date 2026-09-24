import crypto from 'crypto';
import { readSettings } from './_lib/settings.js';

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
// (bentuk pasti belum terverifikasi dari payload asli — cek kolom raw di payment_events kalau meleset)
const customFieldValue = (customField, matchLabel) => {
  if (!Array.isArray(customField)) return null;
  const entry = customField.find(f => matchLabel((f?.dataLabel || f?.label || '').toLowerCase()));
  const value = entry?.dataValue ?? entry?.value ?? null;
  return typeof value === 'string' && value.trim() ? value.trim() : null;
};

const extractMemberCode = (data) =>
  customFieldValue(data.custom_field, l => l.includes('kode member') || l.includes('member code'))?.toUpperCase() || null;

const extractEmail = (data) =>
  (customFieldValue(data.custom_field, l => l.includes('email')) || data.customerEmail || '').trim().toLowerCase() || null;

// Sama dengan generateCode di src/auth.jsx (tanpa huruf/angka yang mirip: I, O, 0, 1).
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const codeSegment = (n) => Array.from(crypto.randomBytes(n), b => CODE_CHARS[b % CODE_CHARS.length]).join('');
const newMemberCode = () => `MSR-${codeSegment(4)}-${codeSegment(4)}`;

const LIFETIME_EXPIRY = '2099-12-31';

const AI_STATUS_BY_EVENT = {
  'membership.newMemberRegistered':        'active',
  'membership.changeTierMemberRegistered': 'active',
  'membership.memberExpired':              'expired',
  'membership.memberUnsubscribed':         'unsubscribed',
};

const makeSb = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Accept: 'application/json' };
  return { url, headers };
};

// Paket Library lunas → member aktif selamanya untuk email pembeli (dibuat kalau belum ada).
async function activateLibraryMember(sb, data) {
  const email = extractEmail(data);
  if (!email) return null;

  const existing = await fetch(
    `${sb.url}/rest/v1/members?email=eq.${encodeURIComponent(email)}&select=code,status&limit=1`,
    { headers: sb.headers }
  ).then(r => r.json()).catch(() => []);

  if (Array.isArray(existing) && existing[0]) {
    const { code, status } = existing[0];
    if (status !== 'active') {
      await fetch(`${sb.url}/rest/v1/members?code=eq.${encodeURIComponent(code)}`, {
        method: 'PATCH',
        headers: { ...sb.headers, Prefer: 'return=minimal' },
        body: JSON.stringify({ status: 'active', expires_at: LIFETIME_EXPIRY }),
      });
    }
    return code;
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = newMemberCode();
    const r = await fetch(`${sb.url}/rest/v1/members`, {
      method: 'POST',
      headers: { ...sb.headers, Prefer: 'return=minimal' },
      body: JSON.stringify({
        code,
        name:       (data.customerName || email.split('@')[0]).slice(0, 120),
        whatsapp:   data.customerMobile || '',
        duration:   36500,
        status:     'active',
        expires_at: LIFETIME_EXPIRY,
        email,
        notes:      `Mayar ${data.id || ''}`.trim(),
      }),
    });
    if (r.ok) return code;
    if (r.status !== 409) throw new Error(`Gagal membuat member (${r.status}): ${await r.text()}`);
  }
  throw new Error('Gagal membuat kode member unik');
}

// Event langganan AI Partner → status di ai_subscriptions.
async function applyAiSubscription(sb, event, data, body) {
  let memberCode = extractMemberCode(data);
  if (!memberCode) {
    const email = extractEmail(data);
    if (email) {
      const byEmail = await fetch(
        `${sb.url}/rest/v1/members?email=eq.${encodeURIComponent(email)}&select=code&limit=1`,
        { headers: sb.headers }
      ).then(r => r.json()).catch(() => []);
      memberCode = Array.isArray(byEmail) && byEmail[0] ? byEmail[0].code : null;
    }
  }
  if (!memberCode) return null;

  const productId = data.productId || null;
  const eventAt   = data.updatedAt || data.createdAt || new Date().toISOString();

  // Webhook yang dikirim ulang tidak boleh menimpa status yang lebih baru.
  const existing = await fetch(
    `${sb.url}/rest/v1/ai_subscriptions?member_code=eq.${encodeURIComponent(memberCode)}&product_id=eq.${encodeURIComponent(productId || '')}&select=last_event_at`,
    { headers: sb.headers }
  ).then(r => r.json()).catch(() => []);
  const existingAt = Array.isArray(existing) && existing[0]?.last_event_at;
  if (existingAt && new Date(existingAt) > new Date(eventAt)) return memberCode;

  await fetch(`${sb.url}/rest/v1/ai_subscriptions?on_conflict=member_code,product_id`, {
    method: 'POST',
    headers: { ...sb.headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      member_code:   memberCode,
      product_id:    productId,
      status:        AI_STATUS_BY_EVENT[event],
      mayar_email:   data.customerEmail || null,
      mayar_mobile:  data.customerMobile || null,
      last_event:    event,
      last_event_at: eventAt,
      raw_payload:   body,
      updated_at:    new Date().toISOString(),
    }),
  });
  return memberCode;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'Method not allowed' }); return; }

  if (!verifyWebhookToken(req)) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return;
  }

  const body = await parseBody(req);
  if (!body) { res.status(200).json({ ok: true, ignored: 'invalid_json' }); return; }

  const sb = makeSb();
  if (!sb) { res.status(500).json({ ok: false, error: 'Server tidak terkonfigurasi' }); return; }

  const event = body.event || body?.data?.event || null;
  const data  = body.data || {};
  const eventKey = `${event || 'unknown'}:${data.id || crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex').slice(0, 32)}`;

  try {
    // Catat dulu. Kalau event_key sudah ada, ini kiriman ulang → jangan proses dua kali.
    const logRes = await fetch(`${sb.url}/rest/v1/payment_events?on_conflict=event_key`, {
      method: 'POST',
      headers: { ...sb.headers, Prefer: 'resolution=ignore-duplicates,return=representation' },
      body: JSON.stringify({
        event_key:      eventKey,
        event,
        product_id:     data.productId || null,
        product_name:   data.productName || null,
        customer_email: extractEmail(data),
        customer_name:  data.customerName || null,
        amount:         Number.isFinite(data.amount) ? data.amount : null,
        raw:            body,
      }),
    });
    const logged = logRes.ok ? await logRes.json().catch(() => null) : null;
    if (!logRes.ok) console.warn('[mayar-webhook] payment_events log failed:', logRes.status);
    if (Array.isArray(logged) && logged.length === 0) {
      res.status(200).json({ ok: true, ignored: 'duplicate' });
      return;
    }

    let handledAs = 'ignored';
    let memberCode = null;

    if (event === 'payment.received' && data.status !== false) {
      const { mayarLibraryProductId } = await readSettings(['mayarLibraryProductId']);
      if (mayarLibraryProductId && data.productId === mayarLibraryProductId.trim()) {
        memberCode = await activateLibraryMember(sb, data);
        handledAs = memberCode ? 'library' : 'library_no_email';
      }
    } else if (AI_STATUS_BY_EVENT[event]) {
      memberCode = await applyAiSubscription(sb, event, data, body);
      handledAs = memberCode ? 'ai' : 'ai_no_member';
    }

    const logId = Array.isArray(logged) && logged[0]?.id;
    if (logId) {
      await fetch(`${sb.url}/rest/v1/payment_events?id=eq.${logId}`, {
        method: 'PATCH',
        headers: { ...sb.headers, Prefer: 'return=minimal' },
        body: JSON.stringify({ handled_as: handledAs, member_code: memberCode }),
      });
    }

    res.status(200).json({ ok: true, handled_as: handledAs });
  } catch (err) {
    console.error('[mayar-webhook] error:', err.message);
    res.status(200).json({ ok: true, error: 'internal_error_logged' });
  }
}
