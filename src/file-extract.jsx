/* Talqeeh — ekstraksi teks PDF & kompres foto (dipakai Siap Imtihan & AI Partner) */

const PDFJS_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174';
let pdfJsPromise = null;

const loadPdfJs = () => {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (!pdfJsPromise) {
    pdfJsPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${PDFJS_BASE}/pdf.min.js`;
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}/pdf.worker.min.js`;
        resolve(window.pdfjsLib);
      };
      script.onerror = () => {
        pdfJsPromise = null;
        reject(new Error('Gagal memuat pembaca PDF'));
      };
      document.head.appendChild(script);
    });
  }
  return pdfJsPromise;
};

/* ── Teks Arab dari lapisan teks PDF ──
   Sebagian PDF Arab menyimpan huruf dalam "presentation forms" (bentuk awal/tengah/akhir, mis. ﺍﻟﺤﻤﺪ) atau dalam
   urutan visual (terbalik), dan ada yang font-nya tanpa peta Unicode sehingga keluar karakter acak. Bentuk huruf
   dikembalikan ke huruf biasa, baris terbalik dibalik lagi, dan halaman yang tetap rusak ditandai supaya dibaca AI. */
const AR_MARKS = 'ؐ-ًؚ-ٰٟۖ-ۭ';
const AR_CLUSTER = new RegExp(`[^${AR_MARKS}][${AR_MARKS}]*`, 'gsu');
// Angka (Latin & Arab) dan teks Latin tersimpan kiri-ke-kanan walau barisnya dalam urutan visual.
const LTR_RUN = /[0-9٠-٩A-Za-z][0-9٠-٩A-Za-z.,:/%\-]*/g;

const fixPresentationForms = (t) => t.replace(/﻿/g, '').replace(/[ﭐ-﷿ﹰ-ﻼ]/g, c => c.normalize('NFKC'));

// Skor urutan: kata Arab biasa sering diawali "ال"; di teks terbalik muncul sebagai akhiran "لا".
const arabicOrderScore = (t) => {
  const words = (t.replace(new RegExp(`[${AR_MARKS}ـ]`, 'g'), '').match(/[ء-ي]{3,}/g)) || [];
  return { words: words.length, al: words.filter(w => w.startsWith('ال')).length, la: words.filter(w => w.endsWith('لا')).length };
};
const looksReversed = (sc) => sc.words >= 12 && sc.la >= 4 && sc.la > sc.al * 2;

// Balik satu baris; angka & teks Latin dikembalikan ke arah semula. PDF menyimpan harakat bisa sebelum atau sesudah
// hurufnya, jadi dicoba dua cara (per karakter / per huruf+harakat) dan dipilih yang harakatnya tidak "menggantung".
const fixLtr = (t) => t.replace(LTR_RUN, run => [...run].reverse().join(''));
const strayMarks = (t) => (t.match(new RegExp(`(^|[\\s.,،؛:()])[${AR_MARKS}]`, 'gmu')) || []).length;
const reverseLine = (line) => {
  const byChar = fixLtr([...line].reverse().join(''));
  const byCluster = fixLtr((line.match(AR_CLUSTER) || []).reverse().join(''));
  return strayMarks(byCluster) < strayMarks(byChar) ? byCluster : byChar;
};

// Hasil: { text, status } — status 'ok' | 'fixed' (dirapikan) | 'empty' (hasil scan) | 'garbled' (tidak bisa dipakai).
const cleanPdfText = (raw) => {
  let text = String(raw || '').trim();
  if (text.replace(/\s/g, '').length < 20) return { text: '', status: 'empty' };
  let fixed = false;
  if (/[ﭐ-﷿ﹰ-﻿]/.test(text)) { text = fixPresentationForms(text); fixed = true; }
  const letters = (text.match(/\p{L}/gu) || []).length || 1;
  const junk = (text.match(/[-�]/g) || []).length;
  const arabic = (text.match(/[؀-ۿ]/g) || []).length;
  const latin1 = (text.match(/[À-ÿ]/g) || []).length;
  // Font tanpa peta Unicode: huruf Arab keluar sebagai karakter privat/acak atau huruf Latin beraksen (mis. "ÇáÍãÏ").
  if (junk / letters > 0.05 || (arabic / letters < 0.1 && latin1 / letters > 0.3)) return { text, status: 'garbled' };
  const score = arabicOrderScore(text);
  if (looksReversed(score)) {
    const flipped = text.split('\n').map(l => (/[؀-ۿ]/.test(l) ? reverseLine(l) : l)).join('\n');
    const after = arabicOrderScore(flipped);
    if (after.al > after.la * 2) return { text: flipped, status: 'fixed' };
    return { text, status: 'garbled' };
  }
  return { text, status: fixed ? 'fixed' : 'ok' };
};

const openPdf = async (file) => {
  const pdfjs = await loadPdfJs();
  return pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
};

const pdfPageText = async (pdf, n) => {
  const page = await pdf.getPage(n);
  const textContent = await page.getTextContent();
  let pageText = '';
  let lastY = null;
  for (const item of textContent.items) {
    if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) pageText += '\n';
    pageText += item.str;
    lastY = item.transform[5];
  }
  return cleanPdfText(pageText);
};

// Semua halaman beserta statusnya; pages === null berarti PDF melebihi maxPages dan tidak diekstrak.
const readPdfPages = async (file, maxPages = 120) => {
  const pdf = await openPdf(file);
  if (pdf.numPages > maxPages) return { pdf, numPages: pdf.numPages, pages: null };
  const pages = [];
  for (let n = 1; n <= pdf.numPages; n++) pages.push({ n, ...(await pdfPageText(pdf, n)) });
  return { pdf, numPages: pdf.numPages, pages };
};

// Satu halaman → JPEG untuk dibaca OCR.
const renderPdfPage = async (pdf, n) => {
  const page = await pdf.getPage(n);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: Math.min(2, 1600 / base.width) });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  return new Promise(r => canvas.toBlob(b => r(new File([b], `hal-${n}.jpg`, { type: 'image/jpeg' })), 'image/jpeg', 0.85));
};

// Versi lama (Siap Imtihan): hanya halaman berteks, sudah dirapikan.
const extractPdfPages = async (file, maxPages = 30) => {
  const { numPages, pages } = await readPdfPages(file, maxPages);
  if (!pages) return { numPages, pages: null };
  return { numPages, pages: pages.filter(p => p.status === 'ok' || p.status === 'fixed').map(p => p.text) };
};

// PDF hasil scan (tanpa lapisan teks): render tiap halaman jadi JPEG untuk dibaca OCR.
const renderPdfPagesAsImages = async (file, maxPages = 20) => {
  const pdf = await openPdf(file);
  if (pdf.numPages > maxPages) return { numPages: pdf.numPages, images: null };
  const images = [];
  for (let i = 1; i <= pdf.numPages; i++) images.push(await renderPdfPage(pdf, i));
  return { numPages: pdf.numPages, images };
};

const compressImage = (file, maxSizeMB = 1.5) => new Promise((resolve) => {
  if (file.size <= maxSizeMB * 1024 * 1024) { resolve(file); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.sqrt((maxSizeMB * 1024 * 1024) / file.size);
      canvas.width  = Math.floor(img.width  * ratio);
      canvas.height = Math.floor(img.height * ratio);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        blob => resolve(new File([blob], file.name, { type: 'image/jpeg' })),
        'image/jpeg', 0.85
      );
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (e) => resolve(e.target.result.split(',')[1]);
  reader.onerror = () => reject(new Error('Gagal membaca file'));
  reader.readAsDataURL(file);
});

/* ── Dokumen Office & TXT (dibaca di browser, tidak diunggah) ── */

const scriptPromises = {};
const loadScript = (src, globalName) => {
  if (window[globalName]) return Promise.resolve(window[globalName]);
  if (!scriptPromises[src]) {
    scriptPromises[src] = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => window[globalName] ? resolve(window[globalName]) : reject(new Error('Library gagal dimuat'));
      script.onerror = () => { delete scriptPromises[src]; reject(new Error('Gagal memuat pembaca file')); };
      document.head.appendChild(script);
    });
  }
  return scriptPromises[src];
};
const loadJsZip   = () => loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js', 'JSZip');
const loadMammoth = () => loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js', 'mammoth');

const parseXml = (xml) => new DOMParser().parseFromString(xml, 'application/xml');
const numberInName = (name) => parseInt((name.match(/(\d+)\.xml$/) || [])[1] || '0', 10);

const extractDocx = async (file) => {
  const mammoth = await loadMammoth();
  const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return value.replace(/\n{3,}/g, '\n\n').trim();
};

const extractPptx = async (file) => {
  const JSZip = await loadJsZip();
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const slides = Object.keys(zip.files)
    .filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => numberInName(a) - numberInName(b));
  const out = [];
  for (const [i, name] of slides.entries()) {
    const doc = parseXml(await zip.file(name).async('string'));
    const paras = [...doc.getElementsByTagName('a:p')]
      .map(p => [...p.getElementsByTagName('a:t')].map(t => t.textContent).join(''))
      .filter(t => t.trim());
    if (paras.length) out.push(`— Slide ${i + 1} —\n${paras.join('\n')}`);
  }
  return out.join('\n\n');
};

const extractXlsx = async (file) => {
  const JSZip = await loadJsZip();
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const shared = zip.file('xl/sharedStrings.xml')
    ? [...parseXml(await zip.file('xl/sharedStrings.xml').async('string')).getElementsByTagName('si')].map(si => si.textContent)
    : [];
  const sheetNames = zip.file('xl/workbook.xml')
    ? [...parseXml(await zip.file('xl/workbook.xml').async('string')).getElementsByTagName('sheet')].map(s => s.getAttribute('name'))
    : [];
  const sheets = Object.keys(zip.files)
    .filter(n => /^xl\/worksheets\/sheet\d+\.xml$/.test(n))
    .sort((a, b) => numberInName(a) - numberInName(b));
  const out = [];
  for (const [i, name] of sheets.entries()) {
    const doc = parseXml(await zip.file(name).async('string'));
    const rows = [...doc.getElementsByTagName('row')].map(row =>
      [...row.getElementsByTagName('c')].map(c => {
        const type = c.getAttribute('t');
        if (type === 'inlineStr') return c.textContent;
        const v = c.getElementsByTagName('v')[0]?.textContent ?? '';
        return type === 's' ? (shared[parseInt(v, 10)] ?? '') : v;
      }).filter(v => String(v).trim()).join(' | ')
    ).filter(Boolean);
    if (rows.length) out.push(`— ${sheetNames[i] || `Sheet ${i + 1}`} —\n${rows.join('\n')}`);
  }
  return out.join('\n\n');
};

/* ── Audio & video → potongan WAV 16kHz mono 60 detik untuk ditranskrip ── */

const AUDIO_RATE    = 16000;
const CHUNK_SECONDS = 60;
const MAX_MEDIA_MINUTES = 30;

// Durasi dibaca dari metadata dulu supaya file terlalu panjang ditolak sebelum di-decode (hemat memori HP).
const getMediaDuration = (file) => new Promise((resolve) => {
  const el = document.createElement(file.type.startsWith('video/') ? 'video' : 'audio');
  const url = URL.createObjectURL(file);
  const done = (d) => { URL.revokeObjectURL(url); resolve(d); };
  el.preload = 'metadata';
  el.onloadedmetadata = () => done(Number.isFinite(el.duration) ? el.duration : null);
  el.onerror = () => done(null);
  el.src = url;
});

const encodeWav = (samples) => {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
  writeStr(0, 'RIFF'); view.setUint32(4, 36 + samples.length * 2, true); writeStr(8, 'WAVE');
  writeStr(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, AUDIO_RATE, true); view.setUint32(28, AUDIO_RATE * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  writeStr(36, 'data'); view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new File([buffer], 'chunk.wav', { type: 'audio/wav' });
};

// Mengembalikan { duration, count, getChunk(i) → { base64, silent } }.
const prepareMediaChunks = async (file) => {
  const duration = await getMediaDuration(file);
  if (duration && duration > MAX_MEDIA_MINUTES * 60) {
    throw new Error(`Rekaman ${Math.round(duration / 60)} menit — maksimal ${MAX_MEDIA_MINUTES} menit per file. Potong rekamannya dulu, lalu tambahkan per bagian.`);
  }
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) throw new Error('Browser ini tidak bisa memproses audio. Coba pakai Chrome terbaru.');
  const ctx = new Ctx({ sampleRate: AUDIO_RATE });
  let decoded;
  try {
    decoded = await ctx.decodeAudioData(await file.arrayBuffer());
  } catch {
    throw new Error('Audio di file ini tidak bisa dibaca. Coba format MP3, M4A, WAV, atau MP4.');
  } finally {
    ctx.close?.();
  }
  if (decoded.duration > MAX_MEDIA_MINUTES * 60 + 5) {
    throw new Error(`Rekaman lebih dari ${MAX_MEDIA_MINUTES} menit. Potong rekamannya dulu.`);
  }

  // Gabung semua channel jadi mono.
  const mono = new Float32Array(decoded.length);
  for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
    const data = decoded.getChannelData(ch);
    for (let i = 0; i < data.length; i++) mono[i] += data[i] / decoded.numberOfChannels;
  }
  const rate = decoded.sampleRate;
  const perChunk = rate * CHUNK_SECONDS;
  const count = Math.max(1, Math.ceil(mono.length / perChunk));

  const getChunk = async (i) => {
    let slice = mono.subarray(i * perChunk, Math.min(mono.length, (i + 1) * perChunk));
    let peak = 0;
    for (let j = 0; j < slice.length; j += 16) peak = Math.max(peak, Math.abs(slice[j]));
    if (peak < 0.01) return { base64: null, silent: true };
    if (rate !== AUDIO_RATE) {
      // Browser yang mengabaikan sampleRate: resample linear ke 16kHz.
      const ratio = rate / AUDIO_RATE;
      const out = new Float32Array(Math.floor(slice.length / ratio));
      for (let j = 0; j < out.length; j++) out[j] = slice[Math.floor(j * ratio)];
      slice = out;
    }
    return { base64: await fileToBase64(encodeWav(slice)), silent: false };
  };

  return { duration: decoded.duration, count, getChunk };
};

// Rekaman mikrofon (webm/mp4 dari MediaRecorder) → WAV 16kHz mono base64, siap untuk action "transcribe".
const recordingToWavBase64 = async (blob) => {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) throw new Error('Browser ini tidak bisa memproses audio. Coba pakai Chrome terbaru.');
  const ctx = new Ctx({ sampleRate: AUDIO_RATE });
  let decoded;
  try {
    decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
  } catch {
    throw new Error('Rekaman tidak bisa dibaca. Coba rekam ulang.');
  } finally {
    ctx.close?.();
  }
  const mono = new Float32Array(decoded.length);
  for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
    const data = decoded.getChannelData(ch);
    for (let i = 0; i < data.length; i++) mono[i] += data[i] / decoded.numberOfChannels;
  }
  let samples = mono.subarray(0, Math.min(mono.length, decoded.sampleRate * CHUNK_SECONDS));
  let peak = 0;
  for (let j = 0; j < samples.length; j += 16) peak = Math.max(peak, Math.abs(samples[j]));
  if (peak < 0.01) return { base64: null, silent: true, duration: decoded.duration };
  if (decoded.sampleRate !== AUDIO_RATE) {
    const ratio = decoded.sampleRate / AUDIO_RATE;
    const out = new Float32Array(Math.floor(samples.length / ratio));
    for (let j = 0; j < out.length; j++) out[j] = samples[Math.floor(j * ratio)];
    samples = out;
  }
  return { base64: await fileToBase64(encodeWav(samples)), silent: false, duration: decoded.duration };
};

/* ── Deteksi jenis file ── */

const FILE_KINDS = {
  pdf:   { label: 'PDF',        exts: ['pdf'] },
  docx:  { label: 'Word',       exts: ['docx'] },
  pptx:  { label: 'PowerPoint', exts: ['pptx'] },
  xlsx:  { label: 'Excel',      exts: ['xlsx'] },
  txt:   { label: 'Teks',       exts: ['txt', 'md'] },
  foto:  { label: 'Foto',       exts: ['jpg', 'jpeg', 'png', 'webp', 'heic'] },
  audio: { label: 'Audio',      exts: ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'opus', 'flac'] },
  video: { label: 'Video',      exts: ['mp4', 'mov', 'webm', 'm4v', 'mkv'] },
};
const LEGACY_OFFICE = { doc: 'docx', ppt: 'pptx', xls: 'xlsx' };

const detectFileKind = (file) => {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (LEGACY_OFFICE[ext]) return { kind: null, error: `Format .${ext} lama belum didukung. Buka filenya lalu "Save As" .${LEGACY_OFFICE[ext]}.` };
  const byExt = Object.entries(FILE_KINDS).find(([, v]) => v.exts.includes(ext));
  if (byExt) return { kind: byExt[0] };
  if (file.type.startsWith('image/')) return { kind: 'foto' };
  if (file.type.startsWith('audio/')) return { kind: 'audio' };
  if (file.type.startsWith('video/')) return { kind: 'video' };
  if (file.type === 'text/plain') return { kind: 'txt' };
  return { kind: null, error: `File "${file.name}" belum didukung.` };
};

const ACCEPTED_FILE_TYPES = Object.values(FILE_KINDS).flatMap(v => v.exts.map(e => '.' + e)).join(',') + ',image/*,audio/*,video/*';

Object.assign(window, {
  extractPdfPages, renderPdfPagesAsImages, readPdfPages, renderPdfPage, cleanPdfText, compressImage, fileToBase64,
  extractDocx, extractPptx, extractXlsx, prepareMediaChunks, recordingToWavBase64,
  detectFileKind, FILE_KINDS, ACCEPTED_FILE_TYPES, MAX_MEDIA_MINUTES,
});
