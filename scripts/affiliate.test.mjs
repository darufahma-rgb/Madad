// Program Mitra: aturan murni di api/_lib/affiliates.js (tanpa Supabase).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAffiliateProgram, AFFILIATE_DEFAULTS, slugFromName, slugAllowed, commissionFor, affiliatePrice,
  canBeReferred, validateApplication, summarizeSales, commissionPercent,
} from '../api/_lib/affiliates.js';

test('pengaturan program: kosong → bawaan, angka di luar batas ditolak', () => {
  assert.deepEqual(validateAffiliateProgram('').value, AFFILIATE_DEFAULTS);
  assert.deepEqual(validateAffiliateProgram({ open: false, percent: '20', discount: '15400' }).value, { open: false, percent: 20, discount: 15000 });
  assert.ok(validateAffiliateProgram({ percent: 0 }).error);
  assert.ok(validateAffiliateProgram({ percent: 41 }).error);
  assert.ok(validateAffiliateProgram({ percent: 10, discount: 60000 }).error);
  assert.ok(validateAffiliateProgram('{rusak').error);
});

test('kode tautan dari nama, kode cadangan & bentuk aneh ditolak', () => {
  assert.equal(slugFromName('Ahmad Fauzi'), 'ahmad-fauzi');
  assert.equal(slugFromName('  Zahrā  Al-Mișrī '), 'zahra-al-misri');
  assert.equal(slugFromName('محمد'), '');
  assert.ok(slugAllowed('ahmad-kmm'));
  assert.ok(!slugAllowed('ab'));
  assert.ok(!slugAllowed('talqeeh'));
  assert.ok(!slugAllowed('ahmad--kmm'));
  assert.ok(!slugAllowed('Ahmad'));
});

test('harga & komisi', () => {
  assert.equal(affiliatePrice(199000, 10000), 189000);
  assert.equal(commissionFor(189000, 15), 28350);
  assert.equal(commissionPercent({ commission_percent: null }, { percent: 15 }), 15);
  assert.equal(commissionPercent({ commission_percent: 25 }, { percent: 15 }), 25);
});

test('hanya akun yang belum membeli yang bisa diajak', () => {
  assert.ok(canBeReferred({ status: 'active', tier: 'free' }));
  assert.ok(canBeReferred({ status: 'active', tier: 'library', member_type: 'trial' }));
  assert.ok(!canBeReferred({ status: 'active', tier: 'library' }));
  assert.ok(!canBeReferred({ status: 'disabled', tier: 'free' }));
  assert.ok(!canBeReferred(null));
});

test('formulir pendaftaran mitra', () => {
  const ok = validateApplication({ name: 'Ahmad Fauzi', whatsapp: '0812-3456-7890', payout: 'DANA 081234567890 a.n. Ahmad', channel: 'Grup angkatan & story IG' });
  assert.deepEqual(ok.value, { name: 'Ahmad Fauzi', whatsapp: '6281234567890', payout: 'DANA 081234567890 a.n. Ahmad', channel: 'Grup angkatan & story IG', slug: 'ahmad-fauzi' });
  assert.equal(validateApplication({ ...ok.value, slug: 'Ahmad-KMM' }).value.slug, 'ahmad-kmm');
  assert.ok(validateApplication({ ...ok.value, whatsapp: '123' }).error);
  assert.ok(validateApplication({ ...ok.value, payout: 'dana' }).error);
  assert.ok(validateApplication({ ...ok.value, channel: 'grup' }).error);
  assert.ok(validateApplication({ ...ok.value, slug: 'admin' }).error);
  assert.ok(validateApplication({ name: 'محمد', whatsapp: '6281234567890', payout: 'DANA 0812345678', channel: 'grup angkatan kami' }).error);
});

test('ringkasan penjualan mitra', () => {
  const s = summarizeSales(7, [
    { amount: 189000, affiliate_commission: 28350, affiliate_paid_at: '2026-11-01T00:00:00Z', paid_at: '2026-10-30T00:00:00Z' },
    { amount: 189000, affiliate_commission: 28350, affiliate_paid_at: null, paid_at: '2026-11-05T00:00:00Z' },
  ]);
  assert.equal(s.signups, 7);
  assert.equal(s.sold, 2);
  assert.equal(s.earned, 56700);
  assert.equal(s.paid, 28350);
  assert.equal(s.unpaid, 28350);
  assert.equal(s.sales[1].paidOut, false);
});
