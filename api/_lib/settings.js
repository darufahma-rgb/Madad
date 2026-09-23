// Pengaturan yang boleh disimpan admin di tabel app_settings.
export const ADMIN_SETTING_KEYS = ['platformName', 'tagline', 'whatsapp', 'lynkUrl', 'mayarUrl', 'aiPriceLabel'];

// Subset yang dikirim ke semua pengunjung lewat /api/config.
export const PUBLIC_SETTING_KEYS = ['whatsapp', 'lynkUrl', 'mayarUrl', 'aiPriceLabel'];

export const readSettings = async (keys) => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return {};
  const r = await fetch(
    `${url}/rest/v1/app_settings?select=key,value&key=in.(${keys.join(',')})`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  );
  if (!r.ok) return {};
  const rows = await r.json();
  return Object.fromEntries((Array.isArray(rows) ? rows : []).map(row => [row.key, row.value]));
};
