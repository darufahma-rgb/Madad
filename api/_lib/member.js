import crypto from 'crypto';

export const sbConfig = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase belum dikonfigurasi');
  return { url, key };
};

export const sbHeaders = (key, extra = {}) => ({
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
  ...extra,
});

export const normalizeCode = (code) =>
  typeof code === 'string' ? code.trim().toUpperCase() : '';

const BASE_MEMBER_FIELDS = 'code,name,email,status,expires_at,auth_user_id';
const MEMBER_FIELDS = `${BASE_MEMBER_FIELDS},tier`;

// Kode member internal: tanpa huruf/angka yang mirip (I, O, 0, 1). Sama dengan generateCode di src/auth.jsx.
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const codeSegment = (n) => Array.from(crypto.randomBytes(n), b => CODE_CHARS[b % CODE_CHARS.length]).join('');
export const newMemberCode = () => `MSR-${codeSegment(4)}-${codeSegment(4)}`;

// Kolom `tier` baru ada setelah migrasi free_tier.sql. Sebelum itu, ulangi tanpa kolom itu dan
// anggap semua member 'library' — supaya login tidak rusak kalau migrasi terlambat dijalankan.
const fetchMembers = async (query, init) => {
  const { url, key } = sbConfig();
  const run = (fields) => fetch(`${url}/rest/v1/members?${query}&select=${fields}`, init(key));
  let r = await run(MEMBER_FIELDS);
  if (r.status === 400) r = await run(BASE_MEMBER_FIELDS);
  const rows = await r.json();
  return (Array.isArray(rows) ? rows : []).map(m => ({ ...m, tier: m.tier || 'library' }));
};

// Verifies the Supabase access token sent as "Authorization: Bearer <token>".
export const getAuthUser = async (req) => {
  const header = (req.headers || {}).authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const { url, key } = sbConfig();
  const r = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: key, Authorization: `Bearer ${match[1]}` },
  });
  if (!r.ok) return null;
  const u = await r.json();
  if (!u?.id) return null;
  return {
    id:    u.id,
    email: (u.email || '').toLowerCase(),
    name:  u.user_metadata?.full_name || u.user_metadata?.name || '',
  };
};

// Member linked to this Google account; links a member pre-registered by email on first login.
export const resolveMember = async (user) => {
  if (!user) return null;

  const byId = await fetchMembers(`auth_user_id=eq.${encodeURIComponent(user.id)}&limit=1`, key => ({ headers: sbHeaders(key) }));
  if (byId[0]) return byId[0];

  if (!user.email) return null;
  const linked = await fetchMembers(
    `email=eq.${encodeURIComponent(user.email)}&auth_user_id=is.null`,
    key => ({
      method: 'PATCH',
      headers: sbHeaders(key, { Prefer: 'return=representation' }),
      body: JSON.stringify({ auth_user_id: user.id }),
    })
  );
  return linked[0] || null;
};

export const isActiveMember = async (code) => {
  const { url, key } = sbConfig();
  const r = await fetch(
    `${url}/rest/v1/members?code=eq.${encodeURIComponent(code)}&status=eq.active&select=code&limit=1`,
    { headers: sbHeaders(key) }
  );
  const rows = await r.json();
  return Array.isArray(rows) && rows.length > 0;
};

export const hasAiAccess = async (code) => {
  const { url, key } = sbConfig();
  const r = await fetch(
    `${url}/rest/v1/ai_subscriptions?member_code=eq.${encodeURIComponent(code)}&status=eq.active&select=id&limit=1`,
    { headers: sbHeaders(key) }
  );
  const rows = await r.json();
  return Array.isArray(rows) && rows.length > 0;
};

export const requireMember = async (req) => {
  const user = await getAuthUser(req);
  if (!user) return { ok: false, status: 401, reason: 'Silakan login dulu' };
  const member = await resolveMember(user);
  if (!member || member.status !== 'active') return { ok: false, status: 403, reason: 'not_member' };
  return { ok: true, code: member.code, member, user };
};

// AI Partner: pelanggan = 'pro'; member Library tanpa langganan = 'trial' (jatah coba gratis).
export const requireAiTier = async (req) => {
  const result = await requireMember(req);
  if (!result.ok) return result;
  const pro = await hasAiAccess(result.code);
  return { ...result, tier: pro ? 'pro' : 'trial' };
};

// Fails closed: any error means the request is denied.
export const consumeQuota = async (code, kind, limit) => {
  try {
    const { url, key } = sbConfig();
    const r = await fetch(`${url}/rest/v1/rpc/consume_ai_quota`, {
      method: 'POST',
      headers: sbHeaders(key),
      body: JSON.stringify({ p_code: code, p_kind: kind, p_limit: limit }),
    });
    if (!r.ok) return false;
    return (await r.json()) === true;
  } catch {
    return false;
  }
};
