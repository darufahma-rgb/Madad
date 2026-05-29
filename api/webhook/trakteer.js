const crypto = require('crypto');
const https  = require('https');

const SUPABASE_URL         = process.env.SUPABASE_URL         || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const FONNTE_TOKEN         = process.env.FONNTE_TOKEN         || '';
const TRAKTEER_SECRET      = process.env.TRAKTEER_SECRET      || '';
const ADMIN_WA             = process.env.ADMIN_WA             || '';
const EXPECTED_AMOUNT      = 49000;

/* ── Helpers ── */
const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const rand = n => Array.from({length: n}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `MSR-${rand(4)}-${rand(4)}`;
};

const getExpiry = (days = 30) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const verifySignature = (payload, sig) => {
  if (!TRAKTEER_SECRET) return true;
  const expected = crypto.createHmac('sha256', TRAKTEER_SECRET).update(payload).digest('hex');
  return expected === sig;
};

const httpPost = (url, headers, body) => new Promise((resolve, reject) => {
  const u = new URL(url);
  const data = typeof body === 'string' ? body : JSON.stringify(body);
  const req = https.request({
    hostname: u.hostname,
    path: u.pathname + u.search,
    method: 'POST',
    headers: { ...headers, 'Content-Length': Buffer.byteLength(data) },
  }, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
      catch { resolve({ status: res.statusCode, data: d }); }
    });
  });
  req.on('error', reject);
  req.write(data);
  req.end();
});

const supabaseInsert = (table, body) => httpPost(
  `${SUPABASE_URL}/rest/v1/${table}`,
  {
    'Content-Type':  'application/json',
    'apikey':        SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Prefer':        'return=representation',
  },
  body
);

const sendWA = async (to, msg) => {
  if (!FONNTE_TOKEN) { console.log('[WA] Token tidak ada, skip'); return; }
  let num = to.replace(/[^0-9]/g, '');
  if (num.startsWith('0')) num = '62' + num.slice(1);
  if (!num.startsWith('62')) num = '62' + num;
  return httpPost(
    'https://api.fonnte.com/send',
    {
      'Authorization': FONNTE_TOKEN,
      'Content-Type':  'application/x-www-form-urlencoded',
    },
    `target=${num}&message=${encodeURIComponent(msg)}&countryCode=62`
  );
};

const memberMsg = (name, code) =>
`Assalamu'alaikum ${name.split(' ')[0]} 🌙

Alhamdulillah, pembayaran Talqeeh diterima!

Kode akses member-mu:

*${code}*

Cara masuk:
1. Buka website Talqeeh
2. Klik "Login Member"
3. Masukkan kode di atas

Kode ini khusus untukmu — jangan dishare ya.

Setelah masuk, isi profil singkat (fakultas, tingkat, gaya belajar) supaya semua prompt disesuaikan untukmu.

Semoga bermanfaat! Bismillah 📚
— Talqeeh`;

/* ── Main Handler ── */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  // Baca body
  const rawBody = await new Promise(resolve => {
    let d = '';
    req.on('data', c => d += c);
    req.on('end', () => resolve(d));
  });

  try {
    // 1. Verifikasi signature Trakteer
    const sig = req.headers['x-trakteer-signature'] || '';
    if (!verifySignature(rawBody, sig)) {
      console.warn('[Webhook] Signature invalid');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data = JSON.parse(rawBody);
    console.log('[Webhook] Data masuk:', JSON.stringify(data));

    // 2. Parse data dari Trakteer
    const trakteerId = data.id || data.transaction_id || String(Date.now());
    const buyerName  = data.supporter_name || data.name || 'Member';
    const amount     = parseInt(data.amount || data.total || 0);

    // Ambil nomor WA dari form_data (field yang dibuat di setup produk Trakteer)
    let buyerWa = '';
    if (data.form_data && typeof data.form_data === 'object') {
      const waKey = Object.keys(data.form_data).find(k =>
        k.toLowerCase().includes('whatsapp') ||
        k.toLowerCase().includes('wa') ||
        k.toLowerCase().includes('nomor') ||
        k.toLowerCase().includes('phone')
      );
      if (waKey) buyerWa = data.form_data[waKey];
    }

    // 3. Validasi nominal
    if (amount < EXPECTED_AMOUNT) {
      console.warn(`[Webhook] Nominal tidak sesuai: ${amount}`);
      if (ADMIN_WA) {
        await sendWA(ADMIN_WA,
          `[Talqeeh] ⚠️ Pembayaran nominal tidak sesuai\nNama: ${buyerName}\nNominal: Rp ${amount.toLocaleString('id-ID')}\nPerlu cek manual.`
        );
      }
      res.status(200).json({ ok: false, reason: 'amount_mismatch' });
      return;
    }

    // 4. Generate kode member unik
    const code = generateCode();

    // 5. Simpan member baru ke Supabase
    const memberRes = await supabaseInsert('members', {
      code,
      name:           buyerName,
      whatsapp:       buyerWa,
      duration:       30,
      status:         'active',
      expires_at:     getExpiry(30),
      payment_source: 'trakteer',
      payment_id:     trakteerId,
    });
    console.log('[Supabase] Member saved, status:', memberRes.status);

    // 6. Log ke tabel pending_payments
    await supabaseInsert('pending_payments', {
      trakteer_id: trakteerId,
      buyer_name:  buyerName,
      buyer_wa:    buyerWa,
      amount,
      status:      'processed',
      member_code: code,
    }).catch(e => console.warn('[Supabase] Payment log gagal:', e.message));

    // 7. Kirim kode ke user via WA
    if (buyerWa) {
      await sendWA(buyerWa, memberMsg(buyerName, code));
      console.log(`[WA] Kode ${code} dikirim ke ${buyerWa}`);
    } else {
      console.warn('[WA] Nomor WA tidak ditemukan — kode tidak dikirim ke user');
    }

    // 8. Notifikasi ke admin
    if (ADMIN_WA) {
      await sendWA(ADMIN_WA,
        `[Talqeeh] ✅ Member baru!\nNama: ${buyerName}\nWA: ${buyerWa || 'tidak ada'}\nKode: ${code}\nStatus: Sudah dikirim otomatis`
      );
    }

    res.status(200).json({ ok: true, code });

  } catch (err) {
    console.error('[Webhook] Error:', err.message);
    // Return 200 supaya Trakteer tidak retry terus
    res.status(200).json({ ok: false, error: err.message });
  }
};
