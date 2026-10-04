/* Talqeeh — pencatat corong konversi (lihat migrations/funnel_events.sql & analitik admin).
   ID pengunjung acak disimpan di browser (bukan data pribadi). Tiap event dikirim paling banyak sekali per hari
   per pengunjung, dan kegagalan apa pun diabaikan: pencatatan tidak boleh mengganggu pengguna. */

const VISITOR_KEY = 'talqeeh_vid';
const SENT_KEY = 'talqeeh_funnel_sent';

const visitorId = () => {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id || !/^[a-z0-9]{12,40}$/.test(id)) {
      id = Array.from(crypto.getRandomValues(new Uint8Array(12)), b => (b % 36).toString(36)).join('') + Date.now().toString(36);
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch { return null; }
};

// event: visit | view_gabung | view_join | view_ai_partner | paywall | click_pay. detail: huruf kecil & garis bawah.
const logFunnel = (event, detail = '') => {
  try {
    const vid = visitorId();
    if (!vid) return;
    const d = String(detail || '').toLowerCase().replace(/[^a-z_]/g, '').slice(0, 30);
    const today = new Date().toISOString().slice(0, 10);
    let sent = {};
    try { sent = JSON.parse(localStorage.getItem(SENT_KEY) || '{}'); } catch {}
    if (sent.day !== today) sent = { day: today, keys: [] };
    const k = `${event}:${d}`;
    if (sent.keys.includes(k)) return;
    sent.keys.push(k);
    localStorage.setItem(SENT_KEY, JSON.stringify(sent));
    const send = window.authFetch || ((url, opts) => fetch(url, { ...opts, headers: { 'Content-Type': 'application/json' } }));
    Promise.resolve(send('/api/login?action=track', { method: 'POST', keepalive: true, body: JSON.stringify({ event, detail: d, visitor: vid }) }))
      .catch(() => {});
  } catch {}
};

Object.assign(window, { logFunnel });
