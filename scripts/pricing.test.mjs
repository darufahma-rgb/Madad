import test from 'node:test';
import assert from 'node:assert/strict';
import { imtihanDaysFor, IMTIHAN_AI_DAYS, IMTIHAN_LEGACY_DAYS, IMTIHAN_SHORTENED_AT } from '../api/_lib/payments.js';
import { offerPriceFor, WELCOME_OFFER } from '../api/_lib/offer.js';
import { validatePartnerLinks } from '../api/_lib/events.js';

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
