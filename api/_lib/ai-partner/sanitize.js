// Validasi hasil JSON dari AI sebelum disimpan: buang entri cacat, batasi jumlah & panjang.

export const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const str = (v, max = 2000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const strList = (v, maxItems, maxLen = 500) =>
  (Array.isArray(v) ? v : []).filter(isStr).slice(0, maxItems).map(s => s.trim().slice(0, maxLen));

export const cleanFlashcards = (raw) =>
  (Array.isArray(raw) ? raw : [])
    .filter(c => isStr(c?.q) && isStr(c?.a))
    .slice(0, 30)
    .map(c => ({ q: str(c.q, 500), a: str(c.a, 1000), box: 1, due: null }));

export const cleanQuiz = (raw) =>
  (Array.isArray(raw) ? raw : [])
    .filter(q =>
      isStr(q?.question) &&
      Array.isArray(q.options) && q.options.length === 4 && q.options.every(isStr) &&
      Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3
    )
    .slice(0, 15)
    .map(q => ({
      question:    str(q.question, 1000),
      options:     q.options.map(o => str(o, 400)),
      answer:      q.answer,
      explanation: str(q.explanation, 1500),
    }));

export const cleanGlossary = (raw) =>
  (Array.isArray(raw) ? raw : [])
    .filter(g => isStr(g?.ar) && isStr(g?.makna))
    .slice(0, 50)
    .map(g => ({
      ar:     str(g.ar, 120),
      jenis:  str(g.jenis, 40),
      wazan:  str(g.wazan, 40),
      akar:   str(g.akar, 40),
      makna:  str(g.makna, 400),
      contoh: str(g.contoh, 400),
    }));

const MINDMAP_MAX_NODES = 80;
export const cleanMindmap = (raw) => {
  let count = 0;
  const walk = (node, depth) => {
    if (!node || !isStr(node.label) || count >= MINDMAP_MAX_NODES) return null;
    count++;
    const out = { label: str(node.label, 140) };
    if (isStr(node.ar)) out.ar = str(node.ar, 140);
    if (isStr(node.note)) out.note = str(node.note, 300);
    if (depth < 4 && Array.isArray(node.children)) {
      const kids = node.children.slice(0, 8).map(c => walk(c, depth + 1)).filter(Boolean);
      if (kids.length) out.children = kids;
    }
    return out;
  };
  const root = walk(Array.isArray(raw) ? { label: 'Materi', children: raw } : raw, 1);
  return root && root.children?.length ? root : null;
};

export const cleanEssays = (raw) =>
  (Array.isArray(raw) ? raw : [])
    .filter(e => isStr(e?.soal_ar) && Array.isArray(e.poin) && e.poin.some(isStr))
    .slice(0, 8)
    .map(e => ({
      soal_ar:       str(e.soal_ar, 600),
      soal_id:       str(e.soal_id, 600),
      jenis:         str(e.jenis, 40),
      poin:          strList(e.poin, 8),
      jawaban_model: str(e.jawaban_model, 3000),
    }));

export const cleanGrade = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const skor = Number(raw.skor);
  if (!Number.isFinite(skor)) return null;
  return {
    skor:        Math.round(Math.min(10, Math.max(0, skor)) * 2) / 2,
    sudah_benar: strList(raw.sudah_benar, 8),
    kurang:      strList(raw.kurang, 8),
    koreksi_bahasa: (Array.isArray(raw.koreksi_bahasa) ? raw.koreksi_bahasa : [])
      .filter(k => isStr(k?.salah) && isStr(k?.benar))
      .slice(0, 5)
      .map(k => ({ salah: str(k.salah, 200), benar: str(k.benar, 200), alasan: str(k.alasan, 300) })),
    tips: str(raw.tips, 600),
  };
};

export const cleanIrab = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const irab = (Array.isArray(raw.irab) ? raw.irab : [])
    .filter(w => isStr(w?.kata) && isStr(w?.irab))
    .slice(0, 60)
    .map(w => ({ kata: str(w.kata, 80), irab: str(w.irab, 300), penjelasan: str(w.penjelasan, 400) }));
  if (!isStr(raw.teks) || irab.length === 0) return null;
  return {
    teks:              str(raw.teks, 1200),
    terjemah_harfiyah: str(raw.terjemah_harfiyah, 1500),
    terjemah_bebas:    str(raw.terjemah_bebas, 1500),
    irab,
    mufradat: (Array.isArray(raw.mufradat) ? raw.mufradat : [])
      .filter(m => isStr(m?.ar) && isStr(m?.makna))
      .slice(0, 15)
      .map(m => ({ ar: str(m.ar, 80), makna: str(m.makna, 200) })),
    catatan: str(raw.catatan, 800),
  };
};

// Progress yang boleh diset dari browser (penanda alur belajar).
const PROGRESS_KEYS = ['summary_read', 'mindmap_viewed', 'glossary_viewed', 'material_viewed', 'syafawi_done'];
export const cleanProgressPatch = (raw) => {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const k of PROGRESS_KEYS) if (raw[k] === true) out[k] = true;
  return out;
};
