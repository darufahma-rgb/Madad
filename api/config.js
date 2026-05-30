module.exports = (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const origin = req.headers.origin || '';
  const allowed = [
    'https://talqeeh.vercel.app',
    'https://talqeeh.com',
    'http://localhost:3000',
    process.env.ALLOWED_ORIGIN || '',
  ].filter(Boolean);

  if (allowed.some(a => origin.startsWith(a)) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.status(200).json({
    supabaseUrl:     process.env.SUPABASE_URL      || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  });
};
