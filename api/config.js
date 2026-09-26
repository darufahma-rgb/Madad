import { readSettings, PUBLIC_SETTING_KEYS } from './_lib/settings.js';
import { mayarConfigured, parseAiPrice } from './_lib/payments.js';
import { sbConfig, sbHeaders } from './_lib/member.js';

// Jumlah pengguna untuk bukti sosial di landing ("150+ Masisir sudah pakai Talqeeh").
// Dihitung dari member aktif (gratis + berbayar), dibulatkan ke BAWAH supaya klaimnya selalu benar,
// dan disembunyikan kalau masih sedikit atau gagal dihitung. Disimpan 30 menit per instance.
const USER_COUNT_MIN = 50;
const USER_COUNT_TTL = 30 * 60 * 1000;
let userCountCache = { at: 0, value: null };

export const roundDownUsers = (n) => {
  if (!Number.isFinite(n) || n < USER_COUNT_MIN) return null;
  return n < 1000 ? Math.floor(n / 10) * 10 : Math.floor(n / 100) * 100;
};

const countActiveMembers = async () => {
  const { url, key } = sbConfig();
  const r = await fetch(`${url}/rest/v1/members?status=eq.active&select=code`, {
    method: 'HEAD',
    headers: sbHeaders(key, { Prefer: 'count=exact', Range: '0-0' }),
    signal: AbortSignal.timeout(1500),
  });
  if (!r.ok) throw new Error(`count ${r.status}`);
  return Number((r.headers.get('content-range') || '').split('/')[1]);
};

const userCount = async () => {
  if (Date.now() - userCountCache.at < USER_COUNT_TTL) return userCountCache.value;
  try {
    userCountCache = { at: Date.now(), value: roundDownUsers(await countActiveMembers()) };
  } catch (err) {
    console.warn('[config] user count unavailable:', err.message);
    userCountCache = { at: Date.now() - USER_COUNT_TTL + 60 * 1000, value: userCountCache.value }; // coba lagi 1 menit lagi
  }
  return userCountCache.value;
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const [loaded, users] = await Promise.all([
    readSettings(PUBLIC_SETTING_KEYS).catch(err => { console.warn('[config] settings unavailable:', err.message); return {}; }),
    userCount(),
  ]);
  let settings = loaded || {};

  // Harga yang ditampilkan = harga yang ditagih server (lihat api/_lib/payments.js).
  const aiPrice = parseAiPrice(settings.aiPriceMonthly);
  settings = {
    whatsapp: settings.whatsapp || '',
    aiPriceMonthly: aiPrice,
    aiPriceLabel: aiPrice ? `Rp ${aiPrice.toLocaleString('id-ID')}` : '',
    payOnline: mayarConfigured(),
    userCount: users, // null = sembunyikan
  };

  res.status(200).json({
    supabaseUrl:     process.env.SUPABASE_URL      || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    settings,
  });
}
