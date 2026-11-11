// Talkhis bertingkat: kapan lengkapi memakai model kuat (api/_lib/ai-partner/talkhis.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { needsStrongComplete, ESCALATE_SCORE, STRONG_PER_SET, MAX_WRITES } from '../api/_lib/ai-partner/talkhis.js';
import { TALKHIS_ADDONS, isTalkhisAddon, addonCredits, checkoutBlockReason, CHECKOUT_PLANS } from '../api/_lib/payments.js';

test('tambahan talkhis: harga tetap, jatah dihitung dari tagihan lunas', () => {
  assert.deepEqual(TALKHIS_ADDONS.talkhis_1, { credits: 1, price: 39000 });
  assert.deepEqual(TALKHIS_ADDONS.talkhis_3, { credits: 3, price: 99000 });
  assert.ok(CHECKOUT_PLANS.includes('talkhis_1') && CHECKOUT_PLANS.includes('talkhis_3'));
  assert.ok(isTalkhisAddon('talkhis_3') && !isTalkhisAddon('imtihan') && !isTalkhisAddon('toString'));
  assert.equal(addonCredits([{ plan: 'talkhis_1' }, { plan: 'talkhis_3' }, { plan: 'imtihan' }]), 4);
  assert.equal(addonCredits(null), 0);
  // Member Library berbayar tetap boleh membeli tambahan (syarat Paket Imtihan dicek di api/login.js).
  assert.equal(checkoutBlockReason('talkhis_1', { status: 'active', tier: 'library' }), null);
});

const weak = { completes: 1, coverage: { score: ESCALATE_SCORE - 1, missing: ['x'], wrong: [] } };

test('lengkapi pertama selalu model hemat', () => {
  assert.equal(needsStrongComplete({ ...weak, completes: 0 }), false);
  assert.equal(needsStrongComplete({ ...weak, completes: undefined }), false);
});

test('setelah lengkapi hemat: model kuat hanya kalau masih lemah atau ada poin salah', () => {
  assert.equal(needsStrongComplete(weak), true);
  assert.equal(needsStrongComplete({ completes: 1, coverage: { score: 88, missing: ['kecil'], wrong: [] } }), false);
  assert.equal(needsStrongComplete({ completes: 1, coverage: { score: 95, missing: [], wrong: ['klaim salah'] } }), true);
  assert.equal(needsStrongComplete({ completes: 1, coverage: null }), false);
});

test('model kuat dibatasi per muqarrar, dan satu judul paling banyak 3 kali tulis', () => {
  assert.equal(needsStrongComplete(weak, STRONG_PER_SET - 1), true);
  assert.equal(needsStrongComplete(weak, STRONG_PER_SET), false);
  assert.equal(MAX_WRITES, 3);
});
