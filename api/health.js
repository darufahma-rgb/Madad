export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status:    'ok',
    supabase:  !!process.env.SUPABASE_URL,
    fonnte:    !!process.env.FONNTE_TOKEN,
    timestamp: new Date().toISOString(),
  });
}
