import https from 'https';
import { verifyToken } from './admin-auth.js';
import { ADMIN_SETTING_KEYS, readSettings } from './_lib/settings.js';
import { MODEL_SETTING_KEYS, isValidModelId } from './_lib/models.js';
import { newActivationPin, PIN_TTL_DAYS } from './_lib/pin.js';
import { buildAdminAnalytics } from './_lib/analytics.js';
import { parseAiPrice } from './_lib/payments.js';
import { QUOTA_KINDS } from './_lib/ai-partner/limits.js';

const sbRequest = (supabaseUrl, serviceKey, method, path, body, prefer = 'return=representation') => {
  const url = new URL(`${supabaseUrl}/rest/v1/${path}`);
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const hreq = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Prefer: prefer,
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d || 'null') }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    hreq.on('error', reject);
    if (data) hreq.write(data);
    hreq.end();
  });
};

// Data belajar milik member (kolom member_code). Kalau database menolak menghapus member karena masih
// dirujuk salah satu tabel ini (foreign key), barisnya dihapus dulu. Data pembayaran & bank soal tidak
// pernah ikut dihapus — kalau itu yang merujuk, penghapusan dibatalkan dengan pesan yang jelas.
const MEMBER_DATA_TABLES = new Set([
  'user_notes', 'user_progress', 'user_intentions', 'user_presence', 'user_muqaranah', 'user_profiles',
  'user_maddah_activity', 'user_soal_progress', 'study_sets', 'ai_usage', 'ai_feedback', 'ai_subscriptions', 'parse_usage',
]);

const pgErrorText = (data) => (data && typeof data === 'object'
  ? [data.message, data.details, data.hint].filter(Boolean).join(' — ')
  : String(data || 'Gagal'));

async function deleteMembers(url, key, codes) {
  const inList = `(${codes.map(c => `"${c}"`).join(',')})`;
  const cleaned = [];
  for (let attempt = 0; attempt < MEMBER_DATA_TABLES.size + 1; attempt++) {
    const r = await sbRequest(url, key, 'DELETE', `members?code=in.${inList}&select=code`, null);
    if (r.status < 400) return { status: 200, data: Array.isArray(r.data) ? r.data : [], cleaned };
    const table = r.data?.code === '23503' ? (pgErrorText(r.data).match(/(?:from|on) table "([a-z_]+)"/g) || [])
      .map(m => m.match(/"([a-z_]+)"/)[1]).find(t => t !== 'members') : null;
    if (!table) return { status: r.status, error: pgErrorText(r.data) };
    if (!MEMBER_DATA_TABLES.has(table) || cleaned.includes(table)) {
      return { status: 409, error: `Member tidak bisa dihapus karena masih tercatat di tabel "${table}" (mis. riwayat pembayaran). Nonaktifkan saja (Disable).` };
    }
    const d = await sbRequest(url, key, 'DELETE', `${table}?member_code=in.${inList}`, null, 'return=minimal');
    if (d.status >= 400) return { status: d.status, error: `Gagal membersihkan data di "${table}": ${pgErrorText(d.data)}` };
    cleaned.push(table);
  }
  return { status: 500, error: 'Gagal menghapus member' };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIBRARY_EXPIRY = '2099-12-31';

// Admin memasukkan email Google member lama → member itu jadi Library selamanya dan langsung
// terhubung saat login Google (tanpa PIN). AI Partner tidak ikut: tetap dibayar terpisah.
// Kalau email itu sudah dipakai akun gratis (member lama sempat login lalu dibuatkan akun gratis),
// akun gratis dilepas dan akun Google-nya dipindah ke member lama — seperti tukar PIN.
async function linkLegacyEmail(url, key, rawCode, rawEmail) {
  const code = String(rawCode || '').trim().toUpperCase();
  const email = String(rawEmail || '').trim().toLowerCase();
  const out = { code, email };
  if (!code) return { ...out, ok: false, error: 'Kode kosong' };
  if (!EMAIL_RE.test(email)) return { ...out, ok: false, error: 'Format email tidak valid' };

  const fields = 'code,name,email,status,tier,auth_user_id';
  const get = (query) => sbRequest(url, key, 'GET', `members?${query}&select=${fields}`, null)
    .then(r => (Array.isArray(r.data) ? r.data : []));
  const [target] = await get(`code=eq.${encodeURIComponent(code)}&limit=1`);
  if (!target) return { ...out, ok: false, error: 'Kode member tidak ditemukan' };
  if (target.tier === 'free') return { ...out, ok: false, error: 'Ini akun gratis, bukan member lama' };

  const others = (await get(`email=eq.${encodeURIComponent(email)}`)).filter(m => m.code !== code);
  const other = others[0];
  if (other && other.tier !== 'free') return { ...out, ok: false, error: `Email sudah dipakai member ${other.code}` };
  const carryAuth = other?.auth_user_id || null;
  if (carryAuth && target.auth_user_id && target.auth_user_id !== carryAuth) {
    return { ...out, ok: false, error: 'Member ini sudah terhubung ke akun Google lain' };
  }

  if (other) {
    const detached = await sbRequest(url, key, 'PATCH', `members?code=eq.${encodeURIComponent(other.code)}`,
      { email: null, auth_user_id: null, status: 'disabled', notes: `Digabung ke member lama ${code}` }, 'return=minimal');
    if (detached.status >= 400) return { ...out, ok: false, error: 'Gagal melepas akun gratis' };
  }

  const patch = {
    email, status: 'active', tier: 'library', expires_at: LIBRARY_EXPIRY,
    ...(carryAuth && !target.auth_user_id ? { auth_user_id: carryAuth } : {}),
  };
  const r = await sbRequest(url, key, 'PATCH', `members?code=eq.${encodeURIComponent(code)}`, patch, 'return=minimal');
  if (r.status >= 400) {
    if (other) {
      await sbRequest(url, key, 'PATCH', `members?code=eq.${encodeURIComponent(other.code)}`,
        { email: other.email, auth_user_id: other.auth_user_id, status: other.status, notes: 'Akun gratis' }, 'return=minimal');
    }
    return { ...out, ok: false, error: `Gagal menyimpan (${r.status})` };
  }
  return { ...out, ok: true, name: target.name, mergedFree: other?.code || null, linkedNow: !!(carryAuth || target.auth_user_id) };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const token = (req.headers || {})['x-admin-token'];
  if (!verifyToken(token)) {
    res.status(401).json({ ok: false, error: 'Unauthorized — login ulang ke admin panel' });
    return;
  }

  let body = '';
  await new Promise(resolve => { req.on('data', c => body += c); req.on('end', resolve); });

  const supabaseUrl = process.env.SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !serviceKey) {
    res.status(500).json({ ok: false, error: 'Supabase belum dikonfigurasi' });
    return;
  }

  try {
    const { action, code, row, days, links, codes } = JSON.parse(body || '{}');
    let result;

    if (action === 'list') {
      result = await sbRequest(supabaseUrl, serviceKey, 'GET', 'members?order=created_at.desc&limit=1000', null);
    } else if (action === 'add') {
      result = await sbRequest(supabaseUrl, serviceKey, 'POST', 'members', row);
    } else if (action === 'update') {
      result = await sbRequest(supabaseUrl, serviceKey, 'PATCH', `members?code=eq.${encodeURIComponent(code)}`, row);
    } else if (action === 'bulk-delete') {
      const list = [...new Set((Array.isArray(codes) ? codes : []).map(c => String(c || '').trim().toUpperCase()))]
        .filter(c => /^[A-Z0-9-]{3,40}$/.test(c)).slice(0, 500);
      if (!list.length) { res.status(400).json({ ok: false, error: 'Tidak ada kode member yang dipilih' }); return; }
      const del = await deleteMembers(supabaseUrl, serviceKey, list);
      if (del.error) { res.status(del.status).json({ ok: false, error: del.error }); return; }
      result = { status: 200, data: del.data };
    } else if (action === 'delete') {
      const one = String(code || '').trim().toUpperCase();
      if (!/^[A-Z0-9-]{3,40}$/.test(one)) { res.status(400).json({ ok: false, error: 'Kode member tidak valid' }); return; }
      const del = await deleteMembers(supabaseUrl, serviceKey, [one]);
      if (del.error) { res.status(del.status).json({ ok: false, error: del.error }); return; }
      result = { status: 200, data: del.data };
    } else if (action === 'aggregate-profiles') {
      result = await sbRequest(supabaseUrl, serviceKey, 'GET', 'user_profiles?select=member_code,profile&limit=1000', null);
    } else if (action === 'aggregate-activity') {
      result = await sbRequest(supabaseUrl, serviceKey, 'GET', 'user_maddah_activity?select=*&limit=1000', null);
    } else if (action === 'generate-pin') {
      if (!code) { res.status(400).json({ ok: false, error: 'Kode member wajib' }); return; }
      const expiresAt = new Date(Date.now() + PIN_TTL_DAYS * 86400000).toISOString();
      result = { status: 409 };
      for (let attempt = 0; attempt < 5 && result.status === 409; attempt++) {
        const pin = newActivationPin();
        result = await sbRequest(supabaseUrl, serviceKey, 'PATCH', `members?code=eq.${encodeURIComponent(code)}`,
          { activation_pin: pin, activation_pin_expires_at: expiresAt });
        if (result.status < 400) {
          if (!Array.isArray(result.data) || !result.data[0]) { res.status(404).json({ ok: false, error: 'Member tidak ditemukan' }); return; }
          result = { status: 200, data: { pin, expiresAt } };
        }
      }
    } else if (action === 'link-emails') {
      const list = Array.isArray(links) ? links.slice(0, 200) : [];
      const results = [];
      for (const l of list) results.push(await linkLegacyEmail(supabaseUrl, serviceKey, l?.code, l?.email));
      result = { status: 200, data: results };
    } else if (action === 'analytics') {
      result = { status: 200, data: await buildAdminAnalytics(Number(days)) };
    } else if (action === 'get-settings') {
      result = { status: 200, data: await readSettings(ADMIN_SETTING_KEYS) };
    } else if (action === 'save-settings') {
      const badModel = Object.values(MODEL_SETTING_KEYS)
        .find(k => typeof row?.[k] === 'string' && row[k].trim() && !isValidModelId(row[k]));
      if (badModel) { res.status(400).json({ ok: false, error: `ID model tidak valid: "${row[badModel].trim().slice(0, 60)}" (contoh: anthropic/claude-sonnet-4-6)` }); return; }
      if (typeof row?.aiPriceMonthly === 'string' && row.aiPriceMonthly.trim() && !parseAiPrice(row.aiPriceMonthly)) {
        res.status(400).json({ ok: false, error: 'Harga AI Partner harus angka rupiah antara 5.000 dan 2.000.000 (contoh: 49000)' });
        return;
      }
      if (typeof row?.aiPriceMonthly === 'string' && row.aiPriceMonthly.trim()) row.aiPriceMonthly = String(parseAiPrice(row.aiPriceMonthly));
      // Kuota bulanan AI: disimpan sebagai JSON angka bulat 0–5000 per jenis (0 = fitur ditutup).
      if (row && row.aiMonthlyLimits != null && typeof row.aiMonthlyLimits !== 'string') {
        const src = row.aiMonthlyLimits || {};
        const bad = QUOTA_KINDS.find(k => src[k] !== '' && src[k] != null && !(Number.isInteger(Number(src[k])) && Number(src[k]) >= 0 && Number(src[k]) <= 5000));
        if (bad) { res.status(400).json({ ok: false, error: `Kuota bulanan "${bad}" harus angka 0–5000` }); return; }
        row.aiMonthlyLimits = JSON.stringify(Object.fromEntries(QUOTA_KINDS.filter(k => src[k] !== '' && src[k] != null).map(k => [k, Number(src[k])])));
      }
      const now = new Date().toISOString();
      const rows = ADMIN_SETTING_KEYS
        .filter(k => typeof row?.[k] === 'string')
        .map(k => ({ key: k, value: row[k].trim().slice(0, 500), updated_at: now }));
      result = rows.length
        ? await sbRequest(supabaseUrl, serviceKey, 'POST', 'app_settings?on_conflict=key', rows, 'resolution=merge-duplicates,return=minimal')
        : { status: 200, data: null };
    } else {
      res.status(400).json({ ok: false, error: `Action tidak dikenal: ${action}` });
      return;
    }

    if (result.status >= 400) {
      res.status(result.status).json({ ok: false, error: pgErrorText(result.data) });
    } else {
      res.status(200).json({ ok: true, data: result.data });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
