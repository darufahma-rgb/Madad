import test from 'node:test';
import assert from 'node:assert/strict';
import { imtihanDaysFor, IMTIHAN_AI_DAYS, IMTIHAN_LEGACY_DAYS, IMTIHAN_SHORTENED_AT, claimClassTrial } from '../api/_lib/payments.js';
import { offerPriceFor, WELCOME_OFFER } from '../api/_lib/offer.js';
import { validatePartnerLinks, classTrialOpen, getOpenPartnerLink, getLivePartnerLink, CLASS_TRIAL_PRODUCT, CLASS_TRIAL_HOURS } from '../api/_lib/events.js';

const link = { slug: 'kelas-kmm', name: 'Kekeluargaan Uji', price: 123000, kasPercent: 10, startsAt: '2026-12-01T10:00:00Z', endsAt: '2026-12-04T10:00:00Z' };

test('Paket Imtihan baru 60 hari, tagihan dan kode rombongan lama tetap 120 hari', () => {
  assert.equal(IMTIHAN_AI_DAYS, 60);
  assert.equal(imtihanDaysFor(IMTIHAN_SHORTENED_AT), 60);
  assert.equal(imtihanDaysFor('2026-12-01T00:00:00Z'), 60);
  assert.equal(imtihanDaysFor('2026-11-04T23:59:59Z'), IMTIHAN_LEGACY_DAYS);
  assert.equal(imtihanDaysFor(null), 60);
});

test('penawaran akun Rp 149.000, hitung mundur yang sudah berjalan tetap harga lama', () => {
  assert.equal(WELCOME_OFFER.price, 149000);
  assert.equal(offerPriceFor(WELCOME_OFFER.priceChangedAt), 149000);
  assert.equal(offerPriceFor('2026-11-04T10:00:00Z'), 139000);
});

test('tautan kerja sama yang benar lolos dan dirapikan', () => {
  const { value, error } = validatePartnerLinks([{ ...link, slug: 'Kelas-KMM', price: '123000', kasPercent: '10' }]);
  assert.equal(error, undefined);
  assert.equal(value[0].slug, 'kelas-kmm');
  assert.equal(value[0].price, 123000);
  assert.equal(value[0].kasPercent, 10);
  assert.deepEqual(validatePartnerLinks([]).value, []);
  assert.deepEqual(validatePartnerLinks(null).value, []);
});

test('trial kelas hanya terbuka di sekitar jam kelas, dan bisa dimatikan', () => {
  const at = Date.parse('2026-12-01T12:00:00Z');
  const open = { classStartsAt: '2026-12-01T12:00:00Z', trialMax: 50 };
  assert.equal(classTrialOpen(open, at - 31 * 60000), false);
  assert.equal(classTrialOpen(open, at - 30 * 60000), true);
  assert.equal(classTrialOpen(open, at + 2 * 3600e3), true);
  assert.equal(classTrialOpen(open, at + 2 * 3600e3 + 1), false);
  assert.equal(classTrialOpen({ trialMax: 50 }, at), false);
  assert.equal(classTrialOpen({ ...open, trialMax: 0 }, at), false);
  const { value } = validatePartnerLinks([{ ...link, classStartsAt: '2026-12-01T12:00:00Z', trialMax: '' }]);
  assert.equal(value[0].trialMax, 50);
  assert.equal(validatePartnerLinks([link]).value[0].classStartsAt, undefined);
  assert.ok(validatePartnerLinks([{ ...link, classStartsAt: 'bukan-tanggal' }]).error);
});

test('klaim trial kelas: sekali per akun, patuh kuota, masa aktif 4 jam', async t => {
  process.env.SUPABASE_URL = 'https://db.invalid';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only';
  const kelas = { slug: 'kelas-uji', trialMax: 2 };
  const member = { code: 'MSR-AAAA-BBBB', email: 'a@b.c' };
  const respond = (claimed, inserted) => t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    if (init.method === 'POST') { written.push(JSON.parse(init.body)); return new Response(JSON.stringify(inserted), { status: 201 }); }
    return new Response(JSON.stringify(claimed));
  });
  let written = [];

  let m = respond([{ member_code: member.code }], []);
  assert.deepEqual(await claimClassTrial(member, kelas), { ok: false, status: 'trial_used' });
  m.mock.restore();
  m = respond([{ member_code: 'X' }, { member_code: 'Y' }], []);
  assert.deepEqual(await claimClassTrial(member, kelas), { ok: false, status: 'trial_full' });
  assert.equal(written.length, 0);
  m.mock.restore();
  m = respond([], []);
  assert.deepEqual(await claimClassTrial(member, kelas), { ok: false, status: 'trial_used' });
  m.mock.restore();
  written = [];
  m = respond([], [{ member_code: member.code }]);
  const before = Date.now();
  const r = await claimClassTrial(member, kelas);
  assert.equal(r.ok, true);
  assert.equal(written[0].product_id, CLASS_TRIAL_PRODUCT);
  assert.equal(written[0].last_event, 'kelas.trial:kelas-uji');
  const hours = (Date.parse(r.expiresAt) - before) / 3600e3;
  assert.ok(Math.abs(hours - CLASS_TRIAL_HOURS) < 0.01);
  m.mock.restore();
});

test('tautan bisa dipakai mendaftar sebelum harga dibuka, harga khusus hanya di rentang waktunya', async t => {
  process.env.SUPABASE_URL = 'https://db.invalid';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only';
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify([{ key: 'partnerLinks', value: JSON.stringify([link]) }])));
  const before = Date.parse('2026-11-20T10:00:00Z'), during = Date.parse('2026-12-02T10:00:00Z'), after = Date.parse('2026-12-05T10:00:00Z');
  assert.equal((await getOpenPartnerLink('kelas-kmm', before)).slug, 'kelas-kmm');
  assert.equal(await getLivePartnerLink('kelas-kmm', before), null);
  assert.equal((await getLivePartnerLink('KELAS-KMM', during)).price, 123000);
  assert.equal(await getOpenPartnerLink('kelas-kmm', after), null);
  assert.equal(await getOpenPartnerLink('tidak-ada', during), null);
  assert.equal(await getOpenPartnerLink('', during), null);
});

test('tautan kerja sama yang salah ditolak', () => {
  const bad = [
    { ...link, slug: 'a' },
    { ...link, slug: 'kode salah' },
    { ...link, name: 'x' },
    { ...link, price: 60000 },
    { ...link, price: 199000 },
    { ...link, kasPercent: 80 },
    { ...link, startsAt: '' },
    { ...link, endsAt: '2026-11-30T10:00:00Z' },
  ];
  for (const item of bad) assert.ok(validatePartnerLinks([item]).error, JSON.stringify(item));
  assert.match(validatePartnerLinks([link, link]).error, /dua kali/);
});
