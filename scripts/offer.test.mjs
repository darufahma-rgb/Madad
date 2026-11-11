import test from 'node:test';
import assert from 'node:assert/strict';
import { offerEndsAt, offerFromRow, couponVerdict, claimInstagramCoupon, getWelcomeOffer, newCouponCode, couponMatches, WELCOME_OFFER } from '../api/_lib/offer.js';

const hoursOf = (iso) => (offerEndsAt(iso) - Date.parse(iso)) / 3600e3;
const NOW = Date.parse('2026-11-12T10:00:00Z');

test('kupon berlaku 24 jam', () => {
  assert.equal(hoursOf('2026-12-01T10:00:00Z'), 24);
});

test('akun baru tidak otomatis dapat harga khusus, harus klaim kupon dulu', () => {
  assert.deepEqual(offerFromRow({ offer_started_at: null, offer_coupon_at: null }, NOW), { offer: null, couponEligible: true });
});

test('penawaran otomatis lama yang masih berjalan dihormati, yang sudah habis boleh klaim kupon', () => {
  const live = offerFromRow({ offer_started_at: '2026-11-12T01:00:00Z' }, NOW);
  assert.equal(live.offer.price, 149000);
  assert.equal(live.couponEligible, false);
  assert.deepEqual(offerFromRow({ offer_started_at: '2026-11-01T01:00:00Z' }, NOW), { offer: null, couponEligible: true });
});

test('kupon hanya sekali per akun', () => {
  const live = offerFromRow({ offer_coupon_at: '2026-11-12T08:00:00Z' }, NOW);
  assert.equal(live.offer.endsAt, '2026-11-13T08:00:00.000Z');
  assert.deepEqual(offerFromRow({ offer_coupon_at: '2026-11-10T08:00:00Z' }, NOW), { offer: null, couponEligible: false });
});

test('kode kupon acak per klaim, mudah diketik, cocok tanpa peduli huruf besar/tanda hubung', () => {
  const codes = new Set(Array.from({ length: 200 }, newCouponCode));
  assert.ok(codes.size > 195);
  for (const c of codes) assert.match(c, /^TQ-[2-9A-HJKMNP-Z]{6}$/);
  assert.equal(couponMatches('tq 7k3m9p', 'TQ-7K3M9P'), true);
  assert.equal(couponMatches('TQ-7K3M9Q', 'TQ-7K3M9P'), false);
  assert.equal(couponMatches('', 'TQ-7K3M9P'), false);
  assert.equal(couponMatches('TQ-7K3M9P', null), false);
});

test('harga kupon hanya berlaku saat bayar kalau kode akun ini dimasukkan', async t => {
  process.env.SUPABASE_URL = 'https://db.invalid';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only';
  const at = new Date(Date.now() - 3600e3).toISOString();
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify([{ offer_coupon_at: at, offer_coupon_code: 'TQ-7K3M9P' }])));
  assert.equal(await getWelcomeOffer(free), null);
  assert.equal(await getWelcomeOffer(free, { coupon: 'TQ-AAAAAA' }), null);
  assert.equal((await getWelcomeOffer(free, { coupon: 'tq-7k3m9p' })).price, 149000);
  assert.equal((await getWelcomeOffer(free, { coupon: 'TQ-7K3M9P' })).code, undefined);
});

test('penawaran otomatis lama (tanpa kode) tetap berlaku tanpa kupon', async t => {
  process.env.SUPABASE_URL = 'https://db.invalid';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only';
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify([{ offer_started_at: new Date(Date.now() - 3600e3).toISOString() }])));
  assert.equal((await getWelcomeOffer(free)).price, 149000);
});

test('putusan screenshot: harus profil @talqeeh dan tombolnya sudah mengikuti', () => {
  assert.equal(couponVerdict({ instagram_profile: true, username: '@Talqeeh', following: true }), 'ok');
  assert.equal(couponVerdict({ instagram_profile: true, username: 'talqeeh', following: false }), 'not_following');
  assert.equal(couponVerdict({ instagram_profile: true, username: 'talqeeh.id', following: true }), 'wrong_account');
  assert.equal(couponVerdict({ instagram_profile: false, username: 'talqeeh', following: true }), 'not_profile');
  assert.equal(couponVerdict(null), 'not_profile');
});

const free = { code: 'MSR-AAAA-BBBB', status: 'active', tier: 'free' };
const img = { image: 'aGVsbG8=', mime: 'image/png' };
const ok = { verify: async () => ({ instagram_profile: true, username: 'talqeeh', following: true }) };

const mockDb = (t, { row = { offer_started_at: null, offer_coupon_at: null }, hashTaken = false, quota = true, patch } = {}) => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    calls.push({ url: String(url), init });
    if (String(url).includes('rpc/consume_ai_quota')) return new Response(JSON.stringify(quota));
    if (init.method === 'PATCH') return patch ? patch(init) : new Response(JSON.stringify([{ offer_coupon_at: '2026-11-12T10:00:00.000Z', offer_coupon_code: JSON.parse(init.body).offer_coupon_code }]));
    if (String(url).includes('offer_coupon_hash=eq.')) return new Response(JSON.stringify(hashTaken ? [{ code: 'X' }] : []));
    return new Response(JSON.stringify([row]));
  });
  return calls;
};

test('klaim kupon: screenshot valid → harga 149rb 24 jam', async t => {
  process.env.SUPABASE_URL = 'https://db.invalid';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only';
  const calls = mockDb(t);
  const r = await claimInstagramCoupon(free, img, ok);
  const patch = calls.find(c => c.init.method === 'PATCH');
  const sent = JSON.parse(patch.init.body);
  assert.deepEqual(r, { ok: true, offer: { price: WELCOME_OFFER.price, endsAt: '2026-11-13T10:00:00.000Z', code: sent.offer_coupon_code } });
  assert.match(sent.offer_coupon_code, /^TQ-/);
  assert.match(patch.url, /offer_coupon_at=is\.null/);
  assert.ok(sent.offer_coupon_hash);
});

test('klaim kupon ditolak: belum follow, screenshot sudah dipakai, akun bukan gratis, terlalu sering', async t => {
  process.env.SUPABASE_URL = 'https://db.invalid';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only';
  let m = mockDb(t);
  assert.equal((await claimInstagramCoupon(free, img, { verify: async () => ({ instagram_profile: true, username: 'talqeeh', following: false }) })).status, 'not_following');
  t.mock.restoreAll();
  mockDb(t, { hashTaken: true });
  assert.equal((await claimInstagramCoupon(free, img, ok)).status, 'screenshot_used');
  t.mock.restoreAll();
  mockDb(t, { quota: false });
  assert.equal((await claimInstagramCoupon(free, img, ok)).status, 'rate_limited');
  t.mock.restoreAll();
  mockDb(t, { row: { offer_coupon_at: '2026-11-01T00:00:00Z' } });
  assert.equal((await claimInstagramCoupon(free, img, ok)).status, 'coupon_used');
  assert.equal((await claimInstagramCoupon({ ...free, tier: 'library' }, img, ok)).status, 'not_eligible');
  assert.equal((await claimInstagramCoupon(free, { image: 'x', mime: 'application/pdf' }, ok)).status, 'bad_image');
});
