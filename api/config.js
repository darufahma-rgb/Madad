import { readSettings, PUBLIC_SETTING_KEYS } from './_lib/settings.js';
import { mayarConfigured, parseAiPrice } from './_lib/payments.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let settings = {};
  try { settings = await readSettings(PUBLIC_SETTING_KEYS); }
  catch (err) { console.warn('[config] settings unavailable:', err.message); }

  // Harga yang ditampilkan = harga yang ditagih server (lihat api/_lib/payments.js).
  const aiPrice = parseAiPrice(settings.aiPriceMonthly);
  settings = {
    whatsapp: settings.whatsapp || '',
    aiPriceMonthly: aiPrice,
    aiPriceLabel: aiPrice ? `Rp ${aiPrice.toLocaleString('id-ID')}` : '',
    payOnline: mayarConfigured(),
  };

  res.status(200).json({
    supabaseUrl:     process.env.SUPABASE_URL      || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    settings,
  });
}
