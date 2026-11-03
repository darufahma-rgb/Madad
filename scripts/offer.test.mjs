import test from 'node:test';
import assert from 'node:assert/strict';
import { offerEndsAt, WELCOME_OFFER } from '../api/_lib/offer.js';

const hoursOf = (iso) => (offerEndsAt(iso) - Date.parse(iso)) / 3600e3;

test('penawaran baru 24 jam', () => {
  assert.equal(hoursOf(WELCOME_OFFER.shortenedAt), 24);
  assert.equal(hoursOf('2026-12-01T10:00:00Z'), 24);
});

test('hitung mundur yang sudah berjalan sebelum perubahan tetap 48 jam', () => {
  assert.equal(hoursOf('2026-11-03T23:59:59Z'), 48);
  assert.equal(hoursOf('2026-10-20T08:00:00Z'), 48);
});
