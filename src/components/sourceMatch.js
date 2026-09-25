/* Talqeeh — mencocokkan kutipan AI dengan materi member.
   Teks dinormalkan (harakat & tatweel dibuang, variasi alif/ya/ta marbuthah disamakan, huruf kecil),
   lalu dibandingkan per potongan 3 kata. Harakat yang ditambahkan AI tidak membuat kutipan dianggap berbeda. */

const HARAKAT = /[ً-ٰٟـۖ-ۭ]/g;

export const normalizeText = (s) => (s || '')
  .replace(HARAKAT, '')
  .replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
  .toLowerCase()
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim();

const words = (s) => normalizeText(s).split(' ').filter(Boolean);
const trigrams = (ws) => {
  const out = [];
  for (let i = 0; i + 2 < ws.length; i++) out.push(`${ws[i]} ${ws[i + 1]} ${ws[i + 2]}`);
  return out;
};

// Indeks materi disimpan per teks materi (maks beberapa materi terakhir) supaya tidak dihitung ulang tiap render.
const cache = new Map();
export const sourceIndex = (material) => {
  if (!material) return null;
  if (cache.has(material)) return cache.get(material);
  const paragraphs = material.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const index = {
    all: new Set(trigrams(words(material))),
    paragraphs: paragraphs.map(text => ({ text, grams: new Set(trigrams(words(text))) })),
  };
  cache.set(material, index);
  if (cache.size > 4) cache.delete(cache.keys().next().value);
  return index;
};

export const MIN_QUOTE_WORDS = 4;

// Skor 0–1: porsi potongan 3 kata dari kutipan yang ada di materi. null = kutipan terlalu pendek untuk dinilai.
export const quoteScore = (quote, index) => {
  if (!index) return null;
  const ws = words(quote);
  if (ws.length < MIN_QUOTE_WORDS) return null;
  const grams = trigrams(ws);
  if (!grams.length) return null;
  return grams.filter(g => index.all.has(g)).length / grams.length;
};

export const verdictOf = (score) => (score == null ? null : score >= 0.8 ? 'ok' : score >= 0.45 ? 'near' : 'miss');

// Paragraf materi yang paling cocok (untuk menampilkan konteks kutipan).
export const bestPassage = (quote, index) => {
  if (!index) return null;
  const grams = trigrams(words(quote));
  if (!grams.length) return null;
  let best = null;
  index.paragraphs.forEach((p, i) => {
    const hit = grams.filter(g => p.grams.has(g)).length;
    if (hit && (!best || hit > best.hit)) best = { hit, i, text: p.text };
  });
  if (!best) return null;
  return { text: best.text, index: best.i, score: best.hit / grams.length, total: index.paragraphs.length };
};
