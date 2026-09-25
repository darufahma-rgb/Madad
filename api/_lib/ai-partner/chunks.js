// Materi panjang: dipecah per paragraf supaya tiap permintaan AI tetap muat dalam batas waktu & konteks.

const HARAKAT = /[ً-ٰٟـۖ-ۭ]/g;

export const normalizeText = (s) => (s || '')
  .replace(HARAKAT, '')
  .replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
  .toLowerCase()
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim();

// Pecah di batas paragraf (lalu baris, lalu paksa) supaya tiap potongan ≤ maxChars.
export const splitChunks = (text, maxChars) => {
  const paragraphs = (text || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const pieces = [];
  for (const p of paragraphs) {
    if (p.length <= maxChars) { pieces.push(p); continue; }
    let buf = '';
    for (const line of p.split('\n')) {
      if (line.length > maxChars) {
        if (buf) { pieces.push(buf); buf = ''; }
        for (let i = 0; i < line.length; i += maxChars) pieces.push(line.slice(i, i + maxChars));
      } else if ((buf + '\n' + line).length > maxChars) { pieces.push(buf); buf = line; }
      else buf = buf ? `${buf}\n${line}` : line;
    }
    if (buf) pieces.push(buf);
  }
  const chunks = [];
  let cur = '';
  for (const p of pieces) {
    if (cur && cur.length + p.length + 2 > maxChars) { chunks.push(cur); cur = p; }
    else cur = cur ? `${cur}\n\n${p}` : p;
  }
  if (cur) chunks.push(cur);
  return chunks;
};

// Contoh merata dari awal sampai akhir materi (untuk kuis, flashcard, mufradat, peta konsep, soal tahriri).
export const spreadSample = (text, limit, segment = 6000) => {
  if (!text || text.length <= limit) return text;
  const segs = splitChunks(text, segment);
  const count = Math.max(1, Math.floor(limit / segment));
  if (segs.length <= count) return segs.join('\n\n');
  const picked = [];
  for (let i = 0; i < count; i++) picked.push(Math.round((i * (segs.length - 1)) / (count - 1 || 1)));
  return [...new Set(picked)].map(i => segs[i]).join('\n\n[…]\n\n');
};

// Potongan materi yang paling relevan dengan pertanyaan (skor kata yang sama, diboboti kelangkaan kata).
const EXCERPT_SEGMENT = 3500;

// Skor relevansi tiap potongan ±3.500 karakter terhadap pertanyaan.
export const scoreSegments = (text, query, segment = EXCERPT_SEGMENT) => {
  const segs = splitChunks(text, segment);
  const segWords = segs.map(s => new Set(normalizeText(s).split(' ').filter(w => w.length >= 3)));
  const df = new Map();
  segWords.forEach(ws => ws.forEach(w => df.set(w, (df.get(w) || 0) + 1)));
  const queryWords = [...new Set(normalizeText(query).split(' ').filter(w => w.length >= 3))];
  const scores = segWords.map(ws =>
    queryWords.reduce((sum, w) => sum + (ws.has(w) ? Math.log(1 + segs.length / (df.get(w) || 1)) : 0), 0));
  return { segs, scores };
};

// Indeks potongan terpilih (potongan pertama = judul/pengantar selalu ikut), atau null kalau tidak ada yang cocok.
export const pickSegments = (segs, scores, limit) => {
  const chosen = new Set([0]);
  let used = segs[0].length;
  const order = scores.map((score, i) => ({ i, score })).sort((a, b) => b.score - a.score);
  for (const { i, score } of order) {
    if (score <= 0 || chosen.has(i)) continue;
    if (used + segs[i].length > limit) continue;
    chosen.add(i);
    used += segs[i].length;
  }
  return chosen.size > 1 ? [...chosen].sort((a, b) => a - b) : null;
};

export const joinSegments = (segs, indices) => indices.filter(i => segs[i] != null).map(i => segs[i]).join('\n\n[…]\n\n');

export const relevantExcerpt = (text, query, limit, segment = EXCERPT_SEGMENT) => {
  if (!text || text.length <= limit) return text;
  const { segs, scores } = scoreSegments(text, query, segment);
  const picked = pickSegments(segs, scores, limit);
  // Tidak ada kata yang cocok sama sekali → contoh merata supaya tutor tetap melihat gambaran utuh.
  return picked ? joinSegments(segs, picked) : spreadSample(text, limit);
};

/* Potongan untuk tutor yang "lengket" dalam satu sesi: potongan sebelumnya dipakai lagi selama masih memuat
   bagian yang paling relevan dengan pertanyaan baru (atau pertanyaannya tidak menyebut kata materi, mis.
   "jelaskan lagi"). System prompt jadi identik, sehingga cache prompt Anthropic terpakai dan pesan lanjutan
   jauh lebih murah. prev = { segs: [indeks] | 'spread', len } yang disimpan di pesan tutor sebelumnya. */
export const stickyExcerpt = (text, query, limit, prev) => {
  const { segs, scores } = scoreSegments(text, query);
  const prevUsable = prev && prev.len === text.length && (prev.segs === 'spread' || (Array.isArray(prev.segs) && prev.segs.length));
  const top = scores.map((score, i) => ({ i, score })).filter(x => x.i !== 0 && x.score > 0)
    .sort((a, b) => b.score - a.score).slice(0, 3).map(x => x.i);
  if (prevUsable) {
    const covered = top.length === 0 || (Array.isArray(prev.segs) && top.every(i => prev.segs.includes(i)));
    if (covered) {
      return prev.segs === 'spread'
        ? { excerpt: spreadSample(text, limit), ctx: prev, reused: true }
        : { excerpt: joinSegments(segs, prev.segs), ctx: prev, reused: true };
    }
  }
  const picked = pickSegments(segs, scores, limit);
  return picked
    ? { excerpt: joinSegments(segs, picked), ctx: { segs: picked, len: text.length }, reused: false }
    : { excerpt: spreadSample(text, limit), ctx: { segs: 'spread', len: text.length }, reused: false };
};
