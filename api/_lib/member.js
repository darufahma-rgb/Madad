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

export const requireAccess = async (rawCode) => {
  const code = normalizeCode(rawCode);
  if (!code) return { ok: false, status: 401, reason: 'Kode member wajib diisi' };
  if (!(await isActiveMember(code))) return { ok: false, status: 401, reason: 'Kode member tidak aktif' };
  if (!(await hasAiAccess(code))) return { ok: false, status: 403, reason: 'no_access' };
  return { ok: true, code };
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
