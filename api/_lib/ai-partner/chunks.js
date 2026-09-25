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
export const relevantExcerpt = (text, query, limit, segment = 3500) => {
  if (!text || text.length <= limit) return text;
  const segs = splitChunks(text, segment);
  const segWords = segs.map(s => new Set(normalizeText(s).split(' ').filter(w => w.length >= 3)));
  const df = new Map();
  segWords.forEach(ws => ws.forEach(w => df.set(w, (df.get(w) || 0) + 1)));
  const queryWords = [...new Set(normalizeText(query).split(' ').filter(w => w.length >= 3))];
  const scores = segWords.map((ws, i) => ({
    i,
    score: queryWords.reduce((sum, w) => sum + (ws.has(w) ? Math.log(1 + segs.length / (df.get(w) || 1)) : 0), 0),
  }));
  // Potongan pertama (judul/pengantar) selalu ikut sebagai konteks.
  const chosen = new Set([0]);
  let used = segs[0].length;
  for (const { i, score } of scores.sort((a, b) => b.score - a.score)) {
    if (score <= 0 || chosen.has(i)) continue;
    if (used + segs[i].length > limit) continue;
    chosen.add(i);
    used += segs[i].length;
  }
  // Tidak ada kata yang cocok sama sekali → contoh merata supaya tutor tetap melihat gambaran utuh.
  if (chosen.size === 1) return spreadSample(text, limit);
  return [...chosen].sort((a, b) => a - b).map(i => segs[i]).join('\n\n[…]\n\n');
};
