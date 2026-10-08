// Email ke member lewat Resend (Admin → Email). Env: RESEND_API_KEY, EMAIL_FROM ("Talqeeh <info@domainmu>"),
// opsional EMAIL_REPLY_TO dan SITE_URL. Lihat migrations/email_broadcast.sql.
import crypto from 'crypto';
import { sbConfig, sbHeaders } from './member.js';

const SITE_URL = () => (process.env.SITE_URL || 'https://talqeeh.id').replace(/\/+$/, '');
const BATCH_SIZE = 50;          // penerima per klik "kirim" (satu panggilan batch Resend, maks 100)
const MAX_RECIPIENTS = 5000;
const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

export const AUDIENCES = {
  no_ai:      'Belum berlangganan AI (gratis + Library tanpa AI)',
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

// optional: daftar berhenti berlangganan boleh belum ada (ekspor CSV untuk dikirim sendiri tidak butuh tabel email).
export const buildAudience = async (audience, { optoutsOptional = false } = {}) => {
  if (!AUDIENCES[audience]) return { error: 'Penerima tidak valid' };
  const [members, subs, optouts] = await Promise.all([
    fetchMembersForEmail(),
    fetchAll(`ai_subscriptions?select=member_code,expires_at&status=eq.active`),
    fetchAll('email_optouts?select=email'),
  ]);
  if (optouts === null && !optoutsOptional) return { error: 'Tabel email belum ada. Jalankan migrations/email_broadcast.sql di Supabase.' };
  const now = Date.now();
  const aiActive = new Set((subs || []).filter(s => !s.expires_at || Date.parse(s.expires_at) > now).map(s => s.member_code));
  const out = new Set((optouts || []).map(o => String(o.email).toLowerCase()));
  const pick = {
    no_ai: (m) => !aiActive.has(m.code),
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
    list.push({ email, name: (m.name || '').trim().slice(0, 80), member_code: m.code, tier: m.tier || 'library', tried_ai: !!m.ai_trial_set_id });
  }
  return { list: list.slice(0, MAX_RECIPIENTS), optedOut, capped: list.length > MAX_RECIPIENTS };
};

/* ── Isi email ── */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const firstName = (name) => (String(name || '').trim().split(/\s+/)[0] || 'teman').slice(0, 40);
const fill = (text, name) => String(text).replace(/\{nama\}/gi, firstName(name));
// Format ala WhatsApp di isi email: *tebal*, _miring_, ~coret~ / ~~coret~~, dan link https yang bisa diklik.
const LINK_RE = /https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"]/g;
const inlineHtml = (s) => esc(s)
  .replace(LINK_RE, u => `<a href="${u}" style="color:#0f5132;font-weight:600">${u}</a>`)
  .replace(/(^|[\s(>])\*(?=\S)([^*\n]*?\S)\*(?=$|[\s.,!?:;)<])/gm, '$1<b>$2</b>')
  .replace(/(^|[\s(>])~~?(?=\S)([^~\n]*?\S)~~?(?=$|[\s.,!?:;)<])/gm, '$1<s style="color:#8a8f88">$2</s>')
  .replace(/(^|[\s(>])_(?=\S)([^_\n]*?\S)_(?=$|[\s.,!?:;)<])/gm, '$1<i>$2</i>');
// Tata letak isi email per baris: "## judul", "- daftar" (juga • dan ✅), "> kotak sorotan", dan "[[tombol]]" untuk posisi tombol.
const LIST_LINE = /^\s*(?:[-•✅]|\d+[.)])\s+/;
const lineKind = (l) => /^\s*\[\[tombol\]\]\s*$/i.test(l) ? 'cta' : /^\s*#{1,3}\s+/.test(l) ? 'h' : /^\s*>/.test(l) ? 'quote' : LIST_LINE.test(l) ? 'list' : 'text';
const ctaButton = (cta) => `<a href="${esc(cta.url)}" style="display:inline-block;background:#0f5132;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 24px;border-radius:10px">${esc(cta.label)}</a>`;
const blockHtml = (para, cta) => {
  const groups = [];
  for (const l of para.split('\n')) {
    const k = lineKind(l);
    const last = groups[groups.length - 1];
    if (last && last.k === k && k !== 'h' && k !== 'cta') last.lines.push(l); else groups.push({ k, lines: [l] });
  }
  return groups.map(({ k, lines }) => {
    if (k === 'cta') return cta ? `<div style="margin:24px 0 26px;text-align:center">${ctaButton(cta)}</div>` : '';
    if (k === 'h') return `<h2 style="margin:30px 0 12px;font-size:18px;line-height:1.4;color:#0f5132">${inlineHtml(lines[0].replace(/^\s*#{1,3}\s+/, ''))}</h2>`;
    if (k === 'quote') return `<div style="margin:4px 0 18px;padding:16px 18px;background:#eef6f0;border-left:4px solid #0f5132;border-radius:10px;font-size:15px;line-height:1.75">${lines.map(l => inlineHtml(l.replace(/^\s*>\s?/, ''))).join('<br>')}</div>`;
    if (k === 'list') return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:10px 0 18px">${lines.map(l =>
      `<tr><td valign="top" style="padding:0 10px 10px 0;color:#0f5132;font-weight:700;font-size:15px;line-height:1.65">✓</td><td style="padding:0 0 10px;font-size:15px;line-height:1.65">${inlineHtml(l.replace(LIST_LINE, ''))}</td></tr>`).join('')}</table>`;
    return `<p style="margin:0 0 18px">${lines.map(inlineHtml).join('<br>')}</p>`;
  }).join('\n');
};
const plainText = (s) => String(s)
  .replace(/^\s*#{1,3}\s+/gm, '').replace(/^\s*>\s?/gm, '').replace(LIST_LINE, '• ')
  .replace(/(^|[\s(])\*(?=\S)([^*\n]*?\S)\*/gm, '$1$2')
  .replace(/(^|[\s(])~~?(?=\S)([^~\n]*?\S)~~?/gm, '$1$2')
  .replace(/(^|[\s(])_(?=\S)([^_\n]*?\S)_/gm, '$1$2');
const safeUrl = (u) => (/^https:\/\/[^\s"<>]+$/i.test(String(u || '').trim()) ? String(u).trim() : '');

export const renderEmail = ({ subject, body, cta_label, cta_url, image_url }, { email, name }) => {
  const paras = fill(body, name).split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const cta = safeUrl(cta_url) && String(cta_label || '').trim() ? { label: String(cta_label).trim().slice(0, 60), url: safeUrl(cta_url) } : null;
  const hasCtaSlot = paras.some(p => p.split('\n').some(l => lineKind(l) === 'cta'));
  const img = safeUrl(image_url);
  const imgTag = img ? `<img src="${esc(img)}" alt="${esc(fill(subject, name))}" width="504" style="display:block;width:100%;max-width:504px;height:auto;border:0;border-radius:10px">` : '';
  const imgLink = img && safeUrl(cta_url) ? `<a href="${esc(safeUrl(cta_url))}">${imgTag}</a>` : imgTag;
  const unsub = unsubUrl(email);
  const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(fill(subject, name))}</title></head>
<body style="margin:0;padding:0;background:#f4f1ea;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2420">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;border:1px solid #e6dfd0">
<tr><td style="padding:24px 28px 14px;font-size:18px;font-weight:700;color:#0f5132">Talqeeh</td></tr>
${img ? `<tr><td style="padding:4px 28px 18px">${imgLink}</td></tr>` : ''}
<tr><td style="padding:8px 28px 8px;font-size:15px;line-height:1.75">
${paras.map(p => blockHtml(p, cta)).join('\n')}
</td></tr>
${cta && !hasCtaSlot ? `<tr><td style="padding:4px 28px 22px">${ctaButton(cta)}</td></tr>` : ''}
<tr><td style="padding:14px 28px 22px;border-top:1px solid #eee7d8;font-size:12px;line-height:1.6;color:#6b6f68">
Kamu menerima email ini karena terdaftar di Talqeeh. <a href="${esc(unsub)}" style="color:#6b6f68">Berhenti menerima email</a>.
</td></tr></table></td></tr></table></body></html>`;
  const ctaText = cta ? `${cta.label}: ${cta.url}` : '';
  const text = [...paras.map(p => p.split('\n').map(l => lineKind(l) === 'cta' ? ctaText : plainText(l)).join('\n')).filter(Boolean), ...(cta && !hasCtaSlot ? [ctaText] : []), '', `Berhenti menerima email: ${unsub}`].join('\n\n');
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
  const image_url = String(c?.image_url || '').trim();
  if (image_url && !safeUrl(image_url)) return { error: 'Link gambar harus diawali https://' };
  // image_url hanya ikut disimpan kalau ada, supaya kampanye tanpa gambar tetap jalan sebelum kolomnya dibuat.
  return { subject, body, cta_label: String(c?.cta_label || '').trim().slice(0, 60) || null, cta_url: cta_url || null, ...(image_url ? { image_url } : {}) };
};

/* Gambar email (poster) disimpan di bucket publik Supabase Storage, karena email butuh link gambar yang bisa dibuka siapa saja. */
const IMAGE_BUCKET = 'email-assets';
const IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
const uploadEmailImage = async (p) => {
  const ext = IMAGE_TYPES[p.type];
  if (!ext) return { ok: false, error: 'Format gambar harus JPG, PNG, WebP, atau GIF' };
  const buf = Buffer.from(String(p.data || ''), 'base64');
  if (buf.length < 100) return { ok: false, error: 'Gambar kosong' };
  if (buf.length > 3 * 1024 * 1024) return { ok: false, error: 'Gambar maksimal 3 MB' };
  const { url, key } = sbConfig();
  const auth = { Authorization: `Bearer ${key}`, apikey: key };
  // Buat bucket sekali (kalau sudah ada, Supabase membalas error "already exists" dan kita abaikan).
  await fetch(`${url}/storage/v1/bucket`, {
    method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: IMAGE_BUCKET, name: IMAGE_BUCKET, public: true, file_size_limit: 3 * 1024 * 1024 }),
  }).catch(() => {});
  const path = `poster-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  const r = await fetch(`${url}/storage/v1/object/${IMAGE_BUCKET}/${path}`, {
    method: 'POST', headers: { ...auth, 'Content-Type': p.type, 'Cache-Control': 'public, max-age=31536000' }, body: buf,
  });
  if (!r.ok) return { ok: false, error: `Gagal mengunggah gambar (${r.status})` };
  return { ok: true, data: { url: `${url}/storage/v1/object/public/${IMAGE_BUCKET}/${path}` } };
};

export async function handleEmailAdmin(action, p) {
  if (action === 'email-status') {
    return { ok: true, data: { configured: emailConfigured(), from: process.env.EMAIL_FROM || null, audiences: AUDIENCES } };
  }
  // Daftar email untuk dikirim sendiri (Gmail/WhatsApp), tanpa Resend. Yang sudah berhenti berlangganan tidak ikut.
  if (action === 'email-export') {
    const a = await buildAudience(p.audience, { optoutsOptional: true });
    if (a.error) return { ok: false, error: a.error };
    return { ok: true, data: { rows: a.list.map(r => ({ name: r.name, email: r.email, tier: r.tier, tried_ai: r.tried_ai })), optedOut: a.optedOut, capped: a.capped } };
  }
  if (action === 'email-audience') {
    const a = await buildAudience(p.audience);
    if (a.error) return { ok: false, error: a.error };
    return { ok: true, data: { count: a.list.length, optedOut: a.optedOut, capped: a.capped, sample: a.list.slice(0, 5).map(r => r.email) } };
  }
  if (action === 'email-upload-image') return uploadEmailImage(p);
  // Pratinjau di admin: HTML yang sama persis dengan yang dikirim, dengan contoh nama penerima.
  if (action === 'email-preview') {
    const c = validCampaign(p);
    if (c.error) return { ok: false, error: c.error };
    return { ok: true, data: { html: renderEmail(c, { email: 'contoh@talqeeh.id', name: 'Ahmad' }).html } };
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
    if (!camp.ok || !camp.data?.[0]) return { ok: false, error: c.image_url && /image_url/.test(JSON.stringify(camp.data || '')) ? 'Kolom gambar belum ada. Jalankan: alter table email_campaigns add column if not exists image_url text;' : 'Gagal membuat kampanye. Sudahkah migrations/email_broadcast.sql dijalankan?' };
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
    const camp = await sb('GET', `email_campaigns?id=eq.${id}&select=*&limit=1`);
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
