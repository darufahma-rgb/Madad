import test, { mock } from 'node:test';
import assert from 'node:assert/strict';

process.env.SUPABASE_URL = 'http://sb.test';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'k';
process.env.MAYAR_API_KEY = 'm';

/* Tiruan Supabase (tabel event_registrations) dan Mayar di memori. */
let rows = [], paidAtMayar = new Set(), mayarSeq = 0, tableReady = true, uid = 0;
const uuid = () => `00000000-0000-4000-8000-${String(++uid).padStart(12, '0')}`;
const json = (status, body) => ({ ok: status < 400, status, json: async () => body, text: async () => JSON.stringify(body) });
const inList = (v) => v.replace(/^in\.\(|\)$/g, '').split(',').map(x => x.replace(/"/g, ''));
const matches = (row, q) => {
  for (const [k, v] of q) {
    if (['select', 'limit', 'order'].includes(k)) continue;
    if (k === 'or') {
      const parts = v.slice(1, -1).split(/,(?=[a-z_]+\.in\.)/);
      if (!parts.some(p => { const [col, ...rest] = p.split('.'); return inList(rest.join('.')).includes(String(row[col])); })) return false;
    } else if (v.startsWith('eq.')) { if (String(row[k]) !== v.slice(3)) return false; }
    else if (v.startsWith('in.')) { if (!inList(v).includes(String(row[k]))) return false; }
  }
  return true;
};
globalThis.fetch = async (url, opts = {}) => {
  const u = new URL(url), method = opts.method || 'GET', body = opts.body ? JSON.parse(opts.body) : null;
  if (u.host === 'sb.test') {
    if (!tableReady) return json(404, { message: 'relation does not exist' });
    const q = [...u.searchParams];
    if (method === 'GET') return json(200, rows.filter(r => matches(r, q)).map(r => ({ ...r })));
    if (method === 'POST') {
      if (rows.some(r => r.event_slug === body.event_slug && r.auth_user_id === body.auth_user_id)) return json(409, {});
      const now = new Date().toISOString();
      const row = { id: uuid(), status: 'pending', mayar_id: null, link: null, link_at: null, checked_at: null, held_at: now, paid_at: null, paid_via: null, note: null, created_at: now, member_code: null, ...body };
      rows.push(row);
      return json(201, [{ ...row }]);
    }
    if (method === 'PATCH') {
      const hit = rows.filter(r => matches(r, q));
      hit.forEach(r => Object.assign(r, body));
      return json(200, hit.map(r => ({ ...r })));
    }
  }
  if (u.host === 'api.mayar.id') {
    if (method === 'POST') { const id = `mayar-pay-${++mayarSeq}`; return json(200, { statusCode: 200, data: { id, link: `https://pay.test/${id}` } }); }
    const id = u.pathname.split('/').pop();
    return json(200, { statusCode: 200, data: { id, status: paidAtMayar.has(id) ? 'paid' : 'unpaid' } });
  }
  throw new Error(`fetch tak dikenal: ${url}`);
};

const W = await import('../api/_lib/workshop.js');
const user = (n) => ({ id: `11111111-1111-4111-8111-${String(n).padStart(12, '0')}`, email: `u${n}@test.id`, name: `User ${n}` });
const reg = (n, extra = {}) => W.registerWorkshop({ user: user(n), member: { code: `MSR-${n}` }, name: `Peserta ${n}`, whatsapp: '+20 100 000 0000', currency: 'IDR', appOrigin: 'https://talqeeh.id', ...extra });
const reset = () => { rows = []; paidAtMayar = new Set(); tableReady = true; };
// Jam palsu untuk Date.now() dan new Date() sekaligus.
const at = (iso) => { mock.timers.reset(); mock.timers.enable({ apis: ['Date'], now: Date.parse(iso) }); };
test.afterEach(() => { mock.timers.reset(); });

test('harga tetap dan kuota sesuai brief', () => {
  assert.equal(W.WORKSHOP.quota, 50);
  assert.deepEqual(W.WORKSHOP.price, { IDR: 120000, EGP: 360 });
  assert.equal(W.workshopClosed(Date.parse('2026-12-07T11:59:00Z')), false);
  assert.equal(W.workshopClosed(Date.parse('2026-12-07T12:00:00Z')), true);
});

test('daftar Rupiah membuat tautan Mayar; menekan lagi memakai tautan yang sama', async () => {
  reset(); at('2026-11-30T10:00:00Z');
  const a = await reg(1);
  assert.equal(a.status, 'registered');
  assert.equal(a.registration.amount, 120000);
  assert.match(a.registration.link, /^https:\/\/pay\.test\//);
  const b = await reg(1);
  assert.equal(b.registration.link, a.registration.link);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].member_code, 'MSR-1');
});

test('daftar Pound Mesir tanpa tautan Mayar, menunggu konfirmasi admin', async () => {
  reset(); at('2026-11-30T10:00:00Z');
  const a = await reg(2, { currency: 'EGP' });
  assert.equal(a.status, 'registered');
  assert.equal(a.registration.amount, 360);
  assert.equal(a.registration.link, null);
  assert.equal(rows[0].mayar_id, null);
});

test('isian tidak lengkap ditolak', async () => {
  reset(); at('2026-11-30T10:00:00Z');
  assert.equal((await reg(3, { name: 'A' })).status, 'invalid');
  assert.equal((await reg(3, { whatsapp: '123' })).status, 'invalid');
  assert.equal((await reg(3, { currency: 'USD' })).status, 'invalid');
  assert.equal(rows.length, 0);
});

test('kuota penuh menutup pendaftaran; kursi yang tidak dibayar 24 jam dilepas', async () => {
  reset(); at('2026-11-30T10:00:00Z');
  for (let i = 1; i <= 50; i++) assert.equal((await reg(i, { currency: 'EGP' })).status, 'registered');
  assert.equal((await W.workshopInfo()).full, true);
  assert.equal((await reg(51)).status, 'full');
  // Pendaftar lama yang masih memegang kursi tetap bisa membuka lagi pendaftarannya.
  assert.equal((await reg(7, { currency: 'EGP' })).status, 'registered');
  at('2026-12-01T10:00:01Z');
  const info = await W.workshopInfo();
  assert.equal(info.left, 50);
  assert.equal((await reg(51)).status, 'registered');
});

test('yang sudah lunas tetap memegang kursi walau lewat 24 jam', async () => {
  reset(); at('2026-11-30T10:00:00Z');
  await reg(1, { currency: 'EGP' });
  const out = await W.setRegistrationStatus(rows[0].id, 'paid');
  assert.equal(out.ok, true);
  assert.equal(out.row.paid_via, 'admin');
  at('2026-12-03T10:00:00Z');
  assert.equal((await W.workshopInfo()).left, 49);
  assert.equal((await reg(1)).status, 'paid');
});

test('cek status ke Mayar menandai lunas', async () => {
  reset(); at('2026-11-30T10:00:00Z');
  await reg(1);
  let row = await W.refreshRegistration(await W.getMyRegistration(user(1).id));
  assert.equal(row.status, 'pending');
  paidAtMayar.add(rows[0].mayar_id);
  at('2026-11-30T10:00:20Z');
  row = await W.refreshRegistration(await W.getMyRegistration(user(1).id));
  assert.equal(row.status, 'paid');
  assert.equal(rows[0].paid_via, 'status_check');
});

test('webhook Mayar menandai lunas, dan mengabaikan pembayaran lain', async () => {
  reset(); at('2026-11-30T10:00:00Z');
  await reg(1);
  assert.equal(await W.matchWorkshopWebhook({ id: 'bukan-punya-workshop', amount: 199000 }), null);
  const low = await W.matchWorkshopWebhook({ id: rows[0].mayar_id, amount: 1000 });
  assert.equal(low.handledAs, 'workshop_amount_mismatch');
  assert.equal(rows[0].status, 'pending');
  const ok = await W.matchWorkshopWebhook({ paymentLinkId: rows[0].mayar_id, amount: 120000 });
  assert.equal(ok.handledAs, 'workshop');
  assert.equal(ok.memberCode, 'MSR-1');
  assert.equal(rows[0].status, 'paid');
  assert.equal(rows[0].paid_via, 'webhook');
});

test('tautan grup WhatsApp hanya untuk yang sudah lunas', async () => {
  reset(); at('2026-11-30T10:00:00Z');
  const a = await reg(1);
  assert.equal(a.registration.groupUrl, null);
  const e = await reg(2, { currency: 'EGP' });
  assert.equal(e.registration.groupUrl, null);
  assert.equal(JSON.stringify(await W.workshopInfo()).includes('chat.whatsapp.com'), false);
  await W.matchWorkshopWebhook({ paymentLinkId: rows[0].mayar_id, amount: 120000 });
  const paid = W.publicRegistration(await W.getMyRegistration(user(1).id));
  assert.match(paid.groupUrl, /^https:\/\/chat\.whatsapp\.com\//);
  await W.setRegistrationStatus(rows[1].id, 'paid');
  assert.match(W.publicRegistration(await W.getMyRegistration(user(2).id)).groupUrl, /^https:\/\/chat\.whatsapp\.com\//);
  await W.setRegistrationStatus(rows[1].id, 'cancelled');
  assert.equal(W.publicRegistration(await W.getMyRegistration(user(2).id)).groupUrl, null);
});

test('pendaftaran ditutup saat acara mulai', async () => {
  reset(); at('2026-12-07T12:00:01Z');
  assert.equal((await reg(1)).status, 'closed');
  assert.equal((await W.workshopInfo()).closed, true);
});

test('admin: ringkasan, tandai lunas, batalkan, dan tidak melebihi kuota', async () => {
  reset(); at('2026-11-30T10:00:00Z');
  for (let i = 1; i <= 50; i++) await reg(i, { currency: i % 2 ? 'IDR' : 'EGP' });
  for (const r of rows.slice(0, 50)) await W.setRegistrationStatus(r.id, 'paid');
  let list = await W.listRegistrations();
  assert.equal(list.summary.paid, 50);
  assert.equal(list.summary.idr, 25 * 120000);
  assert.equal(list.summary.egp, 25 * 360);
  // Pendaftar ke-51 sempat masuk lewat celah (mis. dua orang menekan bersamaan): admin tidak bisa melunaskannya.
  rows.push({ ...rows[0], id: uuid(), auth_user_id: user(99).id, status: 'pending', paid_at: null, paid_via: null });
  const extra = rows[rows.length - 1];
  assert.equal((await W.setRegistrationStatus(extra.id, 'paid')).ok, false);
  assert.equal((await W.setRegistrationStatus(rows[0].id, 'cancelled')).ok, true);
  assert.equal((await W.setRegistrationStatus(extra.id, 'paid')).ok, true);
  assert.equal((await W.setRegistrationStatus('bukan-uuid', 'paid')).ok, false);
});

test('tabel belum ada: tidak melempar galat dan webhook tidak terganggu', async () => {
  reset(); tableReady = false; at('2026-11-30T10:00:00Z');
  assert.deepEqual(await W.workshopInfo(), { ready: false });
  assert.equal((await reg(1)).status, 'not_ready');
  assert.equal(await W.matchWorkshopWebhook({ id: 'apa-saja-123', amount: 120000 }), null);
  assert.equal((await W.listRegistrations()).ready, false);
});
