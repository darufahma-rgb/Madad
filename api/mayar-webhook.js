import crypto from 'crypto';
import { readSettings } from './_lib/settings.js';
import { activateLibrary, matchWebhookCheckout, fulfillCheckout } from './_lib/payments.js';

const readRawBody = (req) => new Promise((resolve) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => resolve(body));
});

const parseJson = (raw) => {
  try { return JSON.parse(raw || '{}'); }
  catch { return null; }
};

// Satu akun Mayar cuma punya satu URL webhook. Akun ini juga dipakai website lain (Nemsyi),
// jadi setiap event yang lolos cek token diteruskan apa adanya ke MAYAR_FORWARD_URL.
const FORWARD_TIMEOUT_MS = 10000;
const SKIP_FORWARD_HEADERS = new Set(['host', 'connection', 'content-length', 'transfer-encoding', 'accept-encoding', 'x-real-ip']);

async function forwardWebhook(req, raw) {
  const target = (process.env.MAYAR_FORWARD_URL || '').trim();
  if (!target) return { ok: true, skipped: true };

  const headers = {};
  for (const [name, value] of Object.entries(req.headers || {})) {
    const lower = name.toLowerCase();
    if (SKIP_FORWARD_HEADERS.has(lower) || lower.startsWith('x-vercel') || lower.startsWith('x-forwarded')) continue;
    headers[lower] = Array.isArray(value) ? value.join(', ') : value;
  }
  if (!headers['content-type']) headers['content-type'] = 'application/json';
  headers['x-talqeeh-forwarded'] = '1';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FORWARD_TIMEOUT_MS);
  try {
    const r = await fetch(target, { method: 'POST', headers, body: raw, signal: controller.signal });
    if (!r.ok) console.warn('[mayar-webhook] forward failed:', r.status);
    return { ok: r.ok, status: r.status };
  } catch (err) {
    console.warn('[mayar-webhook] forward error:', err.message);
    return { ok: false, status: 0 };
  } finally {
    clearTimeout(timer);
  }
}

const tokenMatches = (given, expected) => {
  const a = Buffer.from(String(given || '').trim());
  const b = Buffer.from(expected);
  return a.length > 0 && a.length === b.length && crypto.timingSafeEqual(a, b);
};

// MAYAR_WEBHOOK_TOKEN = "Webhook Token" dari dashboard Mayar (Integrasi → API Keys). Diterima lewat
// header x-callback-token (cara Mayar mengirim token; belum ada di docs resmi) atau ?token= di URL webhook.
const verifyWebhookToken = (req) => {
  const expected = (process.env.MAYAR_WEBHOOK_TOKEN || '').trim();
  if (!expected) return false;
  return tokenMatches((req.headers || {})['x-callback-token'], expected) || tokenMatches(req.query?.token, expected);
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

// Produk Library lama di dashboard Mayar (sebelum pakai API) → member aktif selamanya untuk email pembeli.
async function activateLibraryMember(data) {
  const email = extractEmail(data);
  if (!email) return null;
  return activateLibrary({ email, name: data.customerName, mobile: data.customerMobile, note: `Mayar ${data.id || ''}`.trim() });
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

  const raw = await readRawBody(req);
  const [result, forward] = await Promise.all([processEvent(parseJson(raw)), forwardWebhook(req, raw)]);

  // Kalau penerusan gagal, minta Mayar mengirim ulang (seperti dulu saat Mayar langsung ke Nemsyi).
  // Kiriman ulang aman untuk Talqeeh karena event yang sama tidak diproses dua kali.
  if (!forward.ok) {
    res.status(502).json({ ...result.body, forward: 'failed', forward_status: forward.status });
    return;
  }
  res.status(result.status).json(result.body);
}

async function processEvent(body) {
  if (!body) return { status: 200, body: { ok: true, ignored: 'invalid_json' } };

  const sb = makeSb();
  if (!sb) return { status: 500, body: { ok: false, error: 'Server tidak terkonfigurasi' } };

  const event = body.event || body?.data?.event || null;
  const data  = body.data || {};
  const eventKey = `${event || 'unknown'}:${data.id || crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex').slice(0, 32)}`;

  let logId = null;
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
    let logged = logRes.ok ? await logRes.json().catch(() => null) : null;
    if (!logRes.ok) console.warn('[mayar-webhook] payment_events log failed:', logRes.status);
    if (Array.isArray(logged) && logged.length === 0) {
      // Kiriman ulang: diproses lagi hanya kalau percobaan sebelumnya gagal.
      const prev = await fetch(`${sb.url}/rest/v1/payment_events?event_key=eq.${encodeURIComponent(eventKey)}&select=id,handled_as`, { headers: sb.headers })
        .then(r => (r.ok ? r.json() : [])).catch(() => []);
      if (prev[0]?.handled_as !== 'error') return { status: 200, body: { ok: true, ignored: 'duplicate' } };
      logged = prev;
    }
    logId = Array.isArray(logged) && logged[0]?.id;

    let handledAs = 'ignored';
    let memberCode = null;

    if (event === 'payment.received' && data.status !== false) {
      // Tagihan dari Mayar API (halaman Gabung / AI Partner).
      const match = await matchWebhookCheckout(data);
      if (match) {
        const { checkout } = match;
        if (Number.isFinite(data.amount) && data.amount < checkout.amount) {
          handledAs = 'checkout_amount_mismatch';
        } else {
          const done = await fulfillCheckout(checkout, { via: 'webhook', mobile: data.customerMobile });
          memberCode = done.memberCode || checkout.member_code || null;
          handledAs = 'checkout';
        }
      } else {
        const { mayarLibraryProductId } = await readSettings(['mayarLibraryProductId']);
        if (mayarLibraryProductId && data.productId === mayarLibraryProductId.trim()) {
          memberCode = await activateLibraryMember(data);
          handledAs = memberCode ? 'library' : 'library_no_email';
        }
      }
    } else if (AI_STATUS_BY_EVENT[event]) {
      memberCode = await applyAiSubscription(sb, event, data, body);
      handledAs = memberCode ? 'ai' : 'ai_no_member';
    }

    if (logId) {
      await fetch(`${sb.url}/rest/v1/payment_events?id=eq.${logId}`, {
        method: 'PATCH',
        headers: { ...sb.headers, Prefer: 'return=minimal' },
        body: JSON.stringify({ handled_as: handledAs, member_code: memberCode }),
      });
    }

    return { status: 200, body: { ok: true, handled_as: handledAs } };
  } catch (err) {
    console.error('[mayar-webhook] error:', err.message);
    // Tandai gagal lalu minta Mayar mengirim ulang; kiriman ulang akan diproses lagi (lihat di atas).
    if (logId) {
      await fetch(`${sb.url}/rest/v1/payment_events?id=eq.${logId}`, {
        method: 'PATCH',
        headers: { ...sb.headers, Prefer: 'return=minimal' },
        body: JSON.stringify({ handled_as: 'error' }),
      }).catch(() => {});
      return { status: 500, body: { ok: false, error: 'internal_error_logged' } };
    }
    return { status: 200, body: { ok: true, error: 'internal_error_logged' } };
  }
}
