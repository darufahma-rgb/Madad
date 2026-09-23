import { readSettings, PUBLIC_SETTING_KEYS } from './_lib/settings.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let settings = {};
  try { settings = await readSettings(PUBLIC_SETTING_KEYS); }
  catch (err) { console.warn('[config] settings unavailable:', err.message); }

  res.status(200).json({
    supabaseUrl:     process.env.SUPABASE_URL      || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    settings,
  });
}
