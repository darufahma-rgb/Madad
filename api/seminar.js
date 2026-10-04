import crypto from 'crypto';
import { verifyToken as verifyAdminToken } from './admin-auth.js';
import { sbConfig, sbHeaders, getAuthUser, resolveMember, consumeQuota } from './_lib/member.js';
import { newActivationPin, normalizePin } from './_lib/pin.js';

/* Akses materi seminar.
   Publik (POST, JSON {action}):
     verify  {pin}  → tukar PIN dengan token akses (30 hari, atau sampai kedaluwarsa PIN)
     content        → isi materi; syarat: token PIN (header x-seminar-token) ATAU member berbayar yang login
   Admin (header x-admin-token): admin-list, admin-create, admin-create-bulk, admin-regenerate, admin-revoke, admin-delete
   Satu file untuk semuanya karena paket Vercel Hobby dibatasi 12 fungsi. */

const SLUG = 'seminar-ai';
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const BULK_MAX = 300;

const secret = () => {
  const s = (process.env.SEMINAR_SECRET || process.env.ADMIN_PIN || '').trim();
  if (!s) throw new Error('SEMINAR_SECRET atau ADMIN_PIN belum diset di server.');
  return s;
};
// Kunci terpisah dari token admin: token seminar TIDAK boleh lolos sebagai token admin (dan sebaliknya).
const tokenKey = () => crypto.createHmac('sha256', secret()).update('seminar-token-v1').digest();
const pinKey = () => crypto.createHmac('sha256', secret()).update('seminar-pin-v1').digest();

export const hashPin = (pin) => crypto.createHmac('sha256', pinKey()).update(pin).digest('hex');

export const signSeminarToken = (payload) => {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', tokenKey()).update(data).digest('base64url');
  return `${data}.${sig}`;
};
export const readSeminarToken = (token) => {
  if (typeof token !== 'string') return null;
  const [data, sig] = token.split('.');
  if (!data || !sig) return null;
  const expected = crypto.createHmac('sha256', tokenKey()).update(data).digest('base64url');
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(data, 'base64url').toString());
    return p && p.k === 'smn' && typeof p.exp === 'number' && Date.now() < p.exp ? p : null;
  } catch { return null; }
};

const readBody = (req) => new Promise((resolve) => {
  if (req.body && typeof req.body === 'object') return resolve(req.body);
  let d = '';
  req.on('data', c => d += c);
  req.on('end', () => { try { resolve(JSON.parse(d || '{}')); } catch { resolve({}); } });
});

const send = (res, status, obj) => { res.status(status).json(obj); };

const sb = async (method, path, body, prefer) => {
  const { url, key } = sbConfig();
  const r = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: sbHeaders(key, prefer ? { Prefer: prefer } : {}),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let data = null;
  try { data = await r.json(); } catch {}
  return { ok: r.ok, status: r.status, data };
};

// Akses valid = belum dicabut dan belum kedaluwarsa.
const accessState = (row) => {
  if (!row) return 'missing';
  if (row.revoked_at) return 'revoked';
  if (row.expires_at && new Date(row.expires_at) < new Date()) return 'expired';
  return 'active';
};

const getAccessById = async (id) => {
  if (!/^[0-9a-f-]{36}$/i.test(id || '')) return null;
  const r = await sb('GET', `seminar_access?id=eq.${id}&select=id,label,expires_at,revoked_at&limit=1`);
  return r.ok && Array.isArray(r.data) ? r.data[0] || null : null;
};

const clientIp = (req) => String(req.headers['x-real-ip'] || (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown').slice(0, 60);

/* ---------- publik ---------- */

async function actionVerify(req, res, body) {
  const ip = clientIp(req);
  // Batas tahan-restart di database: cegah tebak-PIN (per IP dan total per hari).
  if (!(await consumeQuota(`SEMINAR-IP-${ip}`, 'seminar_pin', 15)) || !(await consumeQuota('SEMINAR-ALL', 'seminar_pin', 400))) {
    return send(res, 429, { ok: false, error: 'rate_limited' });
  }
  const pin = normalizePin(body.pin);
  if (!pin) return send(res, 200, { ok: false, error: 'invalid' });
  const r = await sb('GET', `seminar_access?pin_hash=eq.${hashPin(pin)}&select=id,label,expires_at,revoked_at,uses&limit=1`);
  if (!r.ok) return send(res, 503, { ok: false, error: 'unavailable' });
  const row = Array.isArray(r.data) ? r.data[0] : null;
  const st = accessState(row);
  if (st === 'missing') return send(res, 200, { ok: false, error: 'invalid' });
  if (st !== 'active') return send(res, 200, { ok: false, error: st });
  const exp = Math.min(Date.now() + TOKEN_TTL_MS, row.expires_at ? new Date(row.expires_at).getTime() : Infinity);
  const token = signSeminarToken({ k: 'smn', aid: row.id, exp });
  // pencatatan pemakaian tidak boleh menggagalkan login
  sb('PATCH', `seminar_access?id=eq.${row.id}`, { last_used_at: new Date().toISOString(), uses: (row.uses || 0) + 1 }).catch(() => {});
  return send(res, 200, { ok: true, token, label: row.label, expiresAt: new Date(exp).toISOString() });
}

async function resolveAccess(req) {
  // 1) token PIN
  const tok = readSeminarToken(req.headers['x-seminar-token']);
  if (tok) {
    const row = await getAccessById(tok.aid);
    if (accessState(row) === 'active') return { via: 'pin', label: row.label };
  }
  // 2) member berbayar yang login
  const user = await getAuthUser(req);
  if (user) {
    const m = await resolveMember(user);
    const live = m && m.status === 'active' && m.tier === 'library' && (!m.expires_at || new Date(m.expires_at) > new Date());
    if (live) return { via: 'member', label: m.name || user.name || user.email };
  }
  return null;
}

async function actionContent(req, res) {
  const access = await resolveAccess(req);
  if (!access) return send(res, 403, { ok: false, error: 'forbidden' });
  const r = await sb('GET', `seminar_content?slug=eq.${SLUG}&select=content,updated_at&limit=1`);
  if (!r.ok) return send(res, 503, { ok: false, error: 'unavailable' });
  const row = Array.isArray(r.data) ? r.data[0] : null;
  if (!row) return send(res, 404, { ok: false, error: 'not_installed' });
  res.setHeader('Cache-Control', 'private, no-store');
  return send(res, 200, { ok: true, via: access.via, label: access.label, content: row.content });
}

/* ---------- admin ---------- */

const listFields = 'id,label,email,note,expires_at,revoked_at,last_used_at,uses,created_at';

const uniquePin = async () => {
  for (let i = 0; i < 6; i++) {
    const pin = newActivationPin();
    const dup = await sb('GET', `seminar_access?pin_hash=eq.${hashPin(pin)}&select=id&limit=1`);
    if (dup.ok && Array.isArray(dup.data) && dup.data.length === 0) return pin;
  }
  throw new Error('Gagal membuat PIN unik');
};

const cleanLabel = (v) => String(v || '').trim().slice(0, 120);
const cleanEmail = (v) => { const e = String(v || '').trim().toLowerCase().slice(0, 160); return e && /^\S+@\S+\.\S+$/.test(e) ? e : null; };
const expiryFrom = (days) => { const d = Number(days); return Number.isFinite(d) && d > 0 && d <= 3650 ? new Date(Date.now() + d * 86400000).toISOString() : null; };

async function createOne({ label, email, note, days }) {
  const pin = await uniquePin();
  const r = await sb('POST', 'seminar_access', {
    label: cleanLabel(label), email: cleanEmail(email), note: String(note || '').trim().slice(0, 300) || null,
    pin_hash: hashPin(pin), expires_at: expiryFrom(days),
  }, 'return=representation');
  if (!r.ok || !Array.isArray(r.data) || !r.data[0]) throw new Error('Gagal menyimpan akses');
  return { id: r.data[0].id, label: r.data[0].label, pin };
}

async function actionAdmin(action, body, res) {
  if (action === 'admin-list') {
    const r = await sb('GET', `seminar_access?select=${listFields}&order=created_at.desc&limit=2000`);
    if (!r.ok) return send(res, 500, { ok: false, error: 'Gagal memuat daftar (sudah menjalankan migrations/seminar_access.sql?)' });
    const cnt = await sb('GET', `seminar_content?slug=eq.${SLUG}&select=updated_at&limit=1`);
    return send(res, 200, { ok: true, data: { rows: r.data, contentInstalled: !!(cnt.ok && cnt.data && cnt.data[0]), contentUpdatedAt: cnt.data?.[0]?.updated_at || null } });
  }
  if (action === 'admin-create') {
    if (!cleanLabel(body.label)) return send(res, 400, { ok: false, error: 'Nama wajib diisi' });
    return send(res, 200, { ok: true, data: await createOne(body) });
  }
  if (action === 'admin-create-bulk') {
    const entries = Array.isArray(body.entries) ? body.entries.slice(0, BULK_MAX) : [];
    const valid = entries.filter(e => cleanLabel(e && e.label));
    if (!valid.length) return send(res, 400, { ok: false, error: 'Tidak ada nama yang valid' });
    const out = [];
    for (const e of valid) out.push(await createOne({ ...e, days: body.days }));
    return send(res, 200, { ok: true, data: out });
  }
  if (action === 'admin-regenerate') {
    const pin = await uniquePin();
    const r = await sb('PATCH', `seminar_access?id=eq.${encodeURIComponent(body.id || '')}`, { pin_hash: hashPin(pin), revoked_at: null }, 'return=representation');
    if (!r.ok || !r.data || !r.data[0]) return send(res, 404, { ok: false, error: 'Akses tidak ditemukan' });
    return send(res, 200, { ok: true, data: { id: r.data[0].id, label: r.data[0].label, pin } });
  }
  if (action === 'admin-revoke') {
    const r = await sb('PATCH', `seminar_access?id=eq.${encodeURIComponent(body.id || '')}`, { revoked_at: body.revoke === false ? null : new Date().toISOString() }, 'return=representation');
    if (!r.ok || !r.data || !r.data[0]) return send(res, 404, { ok: false, error: 'Akses tidak ditemukan' });
    return send(res, 200, { ok: true, data: { id: r.data[0].id } });
  }
  if (action === 'admin-delete') {
    const r = await sb('DELETE', `seminar_access?id=eq.${encodeURIComponent(body.id || '')}`, null, 'return=representation');
    if (!r.ok) return send(res, 500, { ok: false, error: 'Gagal menghapus' });
    return send(res, 200, { ok: true, data: { deleted: Array.isArray(r.data) ? r.data.length : 0 } });
  }
  return send(res, 400, { ok: false, error: 'Aksi tidak dikenal' });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'Method not allowed' });
  try {
    const body = await readBody(req);
    const action = String(body.action || '');
    if (action.startsWith('admin-')) {
      if (!verifyAdminToken(req.headers['x-admin-token'])) return send(res, 401, { ok: false, error: 'Sesi admin tidak valid' });
      return await actionAdmin(action, body, res);
    }
    if (action === 'verify') return await actionVerify(req, res, body);
    if (action === 'content') return await actionContent(req, res);
    return send(res, 400, { ok: false, error: 'Aksi tidak dikenal' });
  } catch (err) {
    console.error('seminar api error:', err && err.message);
    return send(res, 500, { ok: false, error: 'server_error' });
  }
}
