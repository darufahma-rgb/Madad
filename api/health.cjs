const ALLOWED_ORIGINS = [
  'https://talqeeh.vercel.app',
  'https://talqeeh.com',
  process.env.ALLOWED_ORIGIN || '',
].filter(Boolean);

module.exports = (req, res) => {
  const origin = req.headers.origin || '';
  const allowOrigin = ALLOWED_ORIGINS.some(a => origin.startsWith(a)) ? origin : (ALLOWED_ORIGINS[0] || '*');
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.status(200).json({
    status:    'ok',
    supabase:  !!process.env.SUPABASE_URL,
    fonnte:    !!process.env.FONNTE_TOKEN,
    timestamp: new Date().toISOString(),
  });
};
