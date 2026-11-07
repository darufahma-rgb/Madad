import test from 'node:test';
import assert from 'node:assert/strict';
import { isHighStakesFiqh } from '../api/_lib/ai-partner/prompts.js';

test('pertanyaan hukum nyata tetap dianggap berisiko tinggi', () => {
  for (const q of [
    'Bagaimana pembagian warisan untuk 2 anak perempuan?',
    'Suami saya menalak lewat chat, sah?',
    'Berapa nisab zakat emas?',
    'Masa iddah wanita hamil berapa lama?',
    'Bolehkah rujuk setelah talak dua?',
    'Mahar nikahnya berupa hafalan, sah?',
    'zakatnya dibayar kapan',
    'Hukum nikah tanpa wali',
    'ما حكم الطلاق في الغضب؟',
  ]) assert.equal(isHighStakesFiqh(q), true, q);
});

test('kata biasa yang mirip istilah fikih tidak ikut terjaring', () => {
  for (const q of [
    'RUJUKAN LITERATUR: sebutkan sumbernya dalam Bahasa Arab',
    'Jelaskan isytighal, tanazu\', dan na\'ib al-fa\'il dengan rujukan kitab',
    'Latih maharah kalam dan maharah istima\'',
    'Merujuk pada Alfiyah Ibnu Malik',
    'Aku mudah cemas menjelang imtihan',
  ]) assert.equal(isHighStakesFiqh(q), false, q);
});

test('prompt Nahwu lengkap dari Prompt Talqeeh bukan pertanyaan berisiko tinggi', () => {
  const prompt = `Aku thalib Tingkat I di Fakultas Ushuluddin Al-Azhar. Belajar Nahwu.
Jelaskan tiga bab yang sering bikin thalib bingung, satu per satu: الِاشْتِغَال, التَّنَازُع, نَائِبُ الْفَاعِل.
STANDAR AL-AZHAR: fiqh madzhab empat, jangan memberi fatwa.
📋 FORMAT JAWABAN YANG DIINGINKAN:
3. RUJUKAN LITERATUR: Bila menjelaskan kaidah atau pendapat ulama, sebutkan sumbernya (misal: قال ابن مالك في الألفية).`;
  assert.equal(isHighStakesFiqh(prompt), false);
});
