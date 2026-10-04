// Email ke member lewat Resend (Admin → Email). Env: RESEND_API_KEY, EMAIL_FROM ("Talqeeh <info@domainmu>"),
// opsional EMAIL_REPLY_TO dan SITE_URL. Lihat migrations/email_broadcast.sql.
import crypto from 'crypto';
import { sbConfig, sbHeaders } from './member.js';

const SITE_URL = () => (process.env.SITE_URL || 'https://talqeeh.vercel.app').replace(/\/+$/, '');
const BATCH_SIZE = 50;          // penerima per klik "kirim" (satu panggilan batch Resend, maks 100)
const MAX_RECIPIENTS = 5000;
const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

export const AUDIENCES = {
  all:        'Semua member',
  free:       'Akun gratis',
  library:    'Pelanggan Library',
  ai:         'Pelanggan AI Partner aktif',
  trial_ai:   'Pernah coba AI, belum berlangganan AI',
};

export const emailConfigured = () => !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

/* ── Link berhenti berlangganan ──
   Token = HMAC email, jadi link tidak bisa dipakai untuk mencabut email orang lain. */
const unsubSecret = () => process.env.EMAIL_SECRET || process.env.ADMIN_PIN || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const unsubToken = (email) =>
  crypto.createHmac('sha256', `talqeeh-unsub:${unsubSecret()}`).update(String(email).toLowerCase()).digest('base64url').slice(0, 24);
export const verifyUnsubToken = (email, token) => {
  const a = Buffer.from(unsubToken(email));
  const b = Buffer.from(String(token || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
export const unsubUrl = (email) => `${SITE_URL()}/api/login?action=unsubscribe&e=${encodeURIComponent(email)}&t=${unsubToken(email)}`;

/* ── Supabase ── */
const sb = async (method, path, body, prefer) => {
  const { url, key } = sbConfig();
  const r = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: sbHeaders(key, prefer ? { Prefer: prefer } : {}),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const text = await r.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch {}
  return { ok: r.ok, status: r.status, data };
};
const fetchAll = async (path) => {
  const rows = [];
  for (let offset = 0; offset < 20000; offset += 1000) {
    const r = await sb('GET', `${path}${path.includes('?') ? '&' : '?'}limit=1000&offset=${offset}`);
    if (!r.ok) return null;
    rows.push(...r.data);
    if (r.data.length < 1000) break;
  }
  return rows;
};

export const addOptout = async (email) =>
  (await sb('POST', 'email_optouts?on_conflict=email', { email: String(email).toLowerCase() }, 'resolution=ignore-duplicates,return=minimal')).ok;

/* ── Penerima ── */
const fetchMembersForEmail = async () => {
  for (const f of ['code,name,email,status,tier,ai_trial_set_id', 'code,name,email,status,tier', 'code,name,email,status']) {
    const rows = await fetchAll(`members?select=${f}&email=not.is.null`);
    if (rows) return rows;
  }
  return [];
};

export const buildAudience = async (audience) => {
  if (!AUDIENCES[audience]) return { error: 'Penerima tidak valid' };
  const [members, subs, optouts] = await Promise.all([
    fetchMembersForEmail(),
    fetchAll(`ai_subscriptions?select=member_code,expires_at&status=eq.active`),
    fetchAll('email_optouts?select=email'),
  ]);
  if (optouts === null) return { error: 'Tabel email belum ada. Jalankan migrations/email_broadcast.sql di Supabase.' };
  const now = Date.now();
  const aiActive = new Set((subs || []).filter(s => !s.expires_at || Date.parse(s.expires_at) > now).map(s => s.member_code));
  const out = new Set(optouts.map(o => String(o.email).toLowerCase()));
  const pick = {
    all: () => true,
    free: (m) => m.tier === 'free' && !aiActive.has(m.code),
    library: (m) => (m.tier || 'library') === 'library',
    ai: (m) => aiActive.has(m.code),
    trial_ai: (m) => !!m.ai_trial_set_id && !aiActive.has(m.code),
  }[audience];
  const seen = new Set();
  const list = [];
  let optedOut = 0;
  for (const m of members) {
    const email = String(m.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email) || m.status !== 'active' || !pick(m) || seen.has(email)) continue;
    seen.add(email);
    if (out.has(email)) { optedOut++; continue; }
    list.push({ email, name: (m.name || '').trim().slice(0, 80), member_code: m.code });
  }
  return { list: list.slice(0, MAX_RECIPIENTS), optedOut, capped: list.length > MAX_RECIPIENTS };
};

/* ── Isi email ── */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const firstName = (name) => (String(name || '').trim().split(/\s+/)[0] || 'teman').slice(0, 40);
const fill = (text, name) => String(text).replace(/\{nama\}/gi, firstName(name));
const safeUrl = (u) => (/^https:\/\/[^\s"<>]+$/i.test(String(u || '').trim()) ? String(u).trim() : '');

export const renderEmail = ({ subject, body, cta_label, cta_url }, { email, name }) => {
  const paras = fill(body, name).split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const cta = safeUrl(cta_url) && String(cta_label || '').trim() ? { label: String(cta_label).trim().slice(0, 60), url: safeUrl(cta_url) } : null;
  const unsub = unsubUrl(email);
  const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(fill(subject, name))}</title></head>
<body style="margin:0;padding:0;background:#f4f1ea;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2420">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;border:1px solid #e6dfd0">
<tr><td style="padding:22px 28px 6px;font-size:18px;font-weight:700;color:#0f5132">Talqeeh</td></tr>
<tr><td style="padding:6px 28px 4px;font-size:15px;line-height:1.65">
${paras.map(p => `<p style="margin:0 0 14px">${esc(p).replace(/\n/g, '<br>')}</p>`).join('\n')}
</td></tr>
${cta ? `<tr><td style="padding:4px 28px 22px"><a href="${esc(cta.url)}" style="display:inline-block;background:#0f5132;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:10px">${esc(cta.label)}</a></td></tr>` : ''}
<tr><td style="padding:14px 28px 22px;border-top:1px solid #eee7d8;font-size:12px;line-height:1.6;color:#6b6f68">
Kamu menerima email ini karena terdaftar di Talqeeh. <a href="${esc(unsub)}" style="color:#6b6f68">Berhenti menerima email</a>.
</td></tr></table></td></tr></table></body></html>`;
  const text = [...paras, ...(cta ? [`${cta.label}: ${cta.url}`] : []), '', `Berhenti menerima email: ${unsub}`].join('\n\n');
  return { subject: fill(subject, name).slice(0, 200), html, text, unsub };
};

const toMessage = (campaign, r) => {
  const m = renderEmail(campaign, r);
  return {
    from: process.env.EMAIL_FROM,
    to: [r.email],
    subject: m.subject,
    html: m.html,
    text: m.text,
    ...(process.env.EMAIL_REPLY_TO ? { reply_to: process.env.EMAIL_REPLY_TO } : {}),
    headers: { 'List-Unsubscribe': `<${m.unsub}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  };
};

// Kirim satu batch ke Resend. Kembalian: { ok, ids } atau { ok:false, quota, error }.
const resendBatch = async (messages) => {
  const r = await fetch('https://api.resend.com/emails/batch', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(messages),
  });
  let j = null;
  try { j = await r.json(); } catch {}
  if (!r.ok) {
    const msg = String(j?.message || j?.error || `Resend error (${r.status})`).slice(0, 240);
    return { ok: false, quota: r.status === 429 || /quota|limit/i.test(msg), error: msg };
  }
  return { ok: true, ids: (j?.data || []).map(x => x?.id || null) };
};

/* ── Aksi admin ── */
const validCampaign = (c) => {
  const subject = String(c?.subject || '').trim();
  const body = String(c?.body || '').trim();
  if (subject.length < 3 || subject.length > 150) return { error: 'Subjek 3–150 karakter' };
  if (body.length < 10 || body.length > 8000) return { error: 'Isi email 10–8.000 karakter' };
  const cta_url = String(c?.cta_url || '').trim();
  if (cta_url && !safeUrl(cta_url)) return { error: 'Link tombol harus diawali https://' };
  return { subject, body, cta_label: String(c?.cta_label || '').trim().slice(0, 60) || null, cta_url: cta_url || null };
};

export async function handleEmailAdmin(action, p) {
  if (action === 'email-status') {
    return { ok: true, data: { configured: emailConfigured(), from: process.env.EMAIL_FROM || null, audiences: AUDIENCES } };
  }
  if (action === 'email-audience') {
    const a = await buildAudience(p.audience);
    if (a.error) return { ok: false, error: a.error };
    return { ok: true, data: { count: a.list.length, optedOut: a.optedOut, capped: a.capped, sample: a.list.slice(0, 5).map(r => r.email) } };
  }
  if (action === 'email-campaigns') {
    const camps = await sb('GET', 'email_campaigns?select=id,subject,audience,total,created_at&order=created_at.desc&limit=20');
    if (!camps.ok) return { ok: false, error: 'Tabel email belum ada. Jalankan migrations/email_broadcast.sql di Supabase.' };
    const ids = camps.data.map(c => c.id);
    const counts = {};
    if (ids.length) {
      const rows = await fetchAll(`email_sends?select=campaign_id,status&campaign_id=in.(${ids.join(',')})`);
      for (const r of rows || []) (counts[r.campaign_id] ||= { sent: 0, pending: 0, failed: 0, skipped: 0 })[r.status]++;
    }
    return { ok: true, data: camps.data.map(c => ({ ...c, counts: counts[c.id] || { sent: 0, pending: 0, failed: 0, skipped: 0 } })) };
  }

  if (!emailConfigured()) return { ok: false, error: 'Email belum disiapkan: isi RESEND_API_KEY dan EMAIL_FROM di Vercel, lalu deploy ulang.' };

  if (action === 'email-test') {
    const c = validCampaign(p);
    if (c.error) return { ok: false, error: c.error };
    const to = String(p.to || '').trim().toLowerCase();
    if (!EMAIL_RE.test(to)) return { ok: false, error: 'Alamat email tes tidak valid' };
    const msg = toMessage(c, { email: to, name: p.name || '' });
    msg.subject = `[TES] ${msg.subject}`;
    const r = await resendBatch([msg]);
    return r.ok ? { ok: true, data: { sent: 1 } } : { ok: false, error: r.error };
  }

  if (action === 'email-create') {
    const c = validCampaign(p);
    if (c.error) return { ok: false, error: c.error };
    const a = await buildAudience(p.audience);
    if (a.error) return { ok: false, error: a.error };
    if (!a.list.length) return { ok: false, error: 'Tidak ada penerima untuk pilihan ini' };
    const camp = await sb('POST', 'email_campaigns', { ...c, audience: p.audience, total: a.list.length }, 'return=representation');
    if (!camp.ok || !camp.data?.[0]) return { ok: false, error: 'Gagal membuat kampanye. Sudahkah migrations/email_broadcast.sql dijalankan?' };
    const id = camp.data[0].id;
    for (let i = 0; i < a.list.length; i += 1000) {
      const rows = a.list.slice(i, i + 1000).map(r => ({ campaign_id: id, ...r }));
      const ins = await sb('POST', 'email_sends?on_conflict=campaign_id,email', rows, 'resolution=ignore-duplicates,return=minimal');
      if (!ins.ok) return { ok: false, error: 'Gagal menyimpan daftar penerima' };
    }
    return { ok: true, data: { id, total: a.list.length } };
  }

  if (action === 'email-send-batch') {
    const id = String(p.id || '');
    if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, error: 'Kampanye tidak valid' };
    const camp = await sb('GET', `email_campaigns?id=eq.${id}&select=id,subject,body,cta_label,cta_url&limit=1`);
    const campaign = camp.data?.[0];
    if (!campaign) return { ok: false, error: 'Kampanye tidak ditemukan' };
    const pending = await sb('GET', `email_sends?campaign_id=eq.${id}&status=eq.pending&select=id,email,name&order=id.asc&limit=${BATCH_SIZE}`);
    if (!pending.ok) return { ok: false, error: 'Gagal membaca penerima' };
    const batch = pending.data || [];
    if (!batch.length) return { ok: true, data: { sent: 0, failed: 0, remaining: 0, done: true } };
    // Cek ulang daftar berhenti berlangganan (bisa bertambah sejak kampanye dibuat).
    const outs = await sb('GET', `email_optouts?select=email&email=in.(${batch.map(r => `"${r.email.replace(/"/g, '')}"`).join(',')})`);
    const optedOut = new Set((outs.data || []).map(o => o.email));
    const skip = batch.filter(r => optedOut.has(r.email));
    const send = batch.filter(r => !optedOut.has(r.email));
    if (skip.length) await sb('PATCH', `email_sends?id=in.(${skip.map(r => r.id).join(',')})`, { status: 'skipped' }, 'return=minimal');
    let sent = 0, failed = 0;
    if (send.length) {
      const r = await resendBatch(send.map(x => toMessage(campaign, x)));
      if (!r.ok) {
        // Kuota/ batas Resend: biarkan tetap pending supaya bisa dilanjutkan nanti.
        if (r.quota) return { ok: true, data: { sent: 0, failed: 0, stopped: 'quota', message: r.error } };
        await sb('PATCH', `email_sends?id=in.(${send.map(x => x.id).join(',')})`, { status: 'failed', error: r.error }, 'return=minimal');
        failed = send.length;
      } else {
        const now = new Date().toISOString();
        await Promise.all(send.map((x, i) => sb('PATCH', `email_sends?id=eq.${x.id}`, { status: 'sent', sent_at: now, provider_id: r.ids[i] || null }, 'return=minimal')));
        sent = send.length;
      }
    }
    const left = await sb('GET', `email_sends?campaign_id=eq.${id}&status=eq.pending&select=id&limit=1`);
    return { ok: true, data: { sent, failed, skipped: skip.length, done: !(left.data || []).length } };
  }

  return { ok: false, error: `Action tidak dikenal: ${action}` };
}
