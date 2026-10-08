import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
/* Talqeeh — AI Partner: Talkhis otomatis.
   Muqarrar dipetakan jadi daftar mabahits, tiap judul ditalkhis dalam bahasa Arab dari potongan sumbernya sendiri,
   lalu dicek kelengkapannya terhadap sumber itu. Logika & batasnya ada di api/_lib/ai-partner/talkhis.js. */

const MAX_WRITES = 2;     // sama dengan server
const TRIAL_TOPICS = 2;
const CHARS_PER_PAGE = 1800;

/* ── Normalisasi teks Arab untuk mencocokkan kutipan dengan sumber ── */
const HARAKAT_RE = /[ً-ٰٟـۖ-ۭ]/g;
const FOLD = { 'إ': 'ا', 'أ': 'ا', 'آ': 'ا', 'ٱ': 'ا', 'ى': 'ي', 'ة': 'ه', 'ؤ': 'و', 'ئ': 'ي' };
const norm = (s) => String(s || '').replace(/ﷺ|صلى الله عليه وسلم|صلى الله عليه وآله وسلم/g, ' صلى الله عليه وسلم ')
  .replace(/ﷻ/g, ' جل جلاله ').replace(HARAKAT_RE, '').replace(/[إأآٱىةؤئ]/g, c => FOLD[c]).toLowerCase()
  .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

/* ── Markdown talkhis → HTML (semua teks di-escape dulu; hanya pola talkhis yang dikenali) ── */
const esc = (s) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const inline = (s) => esc(s)
  .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
  .replace(/^\(([^()]{1,80})\)/, '<span class="tk-gh">($1)</span>');

// Jenis bagian dari judul "#### " (dicocokkan tanpa harakat) → warna sendiri di PDF berwarna & di layar.
const SEC_KINDS = [
  ['ex', /تدريب|تمارين|اسيله/], ['exam', /يتوقع|امتحان/], ['def', /تعريف/], ['nass', /^النص|نص الحديث|الايه/],
  ['gharib', /غريب|مفردات|الفاظ/], ['masail', /مسايل|خلاف|احكام|اقسام|شروط|اركان|حكم/], ['fawaid', /فوايد|يستفاد/],
];
const secKind = (title) => { const n = norm(title); return (SEC_KINDS.find(([, re]) => re.test(n)) || ['other'])[0]; };

const talkhisHtml = (md, sourceNorm) => {
  const lines = String(md || '').replace(/\r/g, '').split('\n');
  let html = '', list = null, sub = null, nass = [], sec = false;
  const closeSec = () => { if (sec) { html += '</div>'; sec = false; } };
  const closeSub = () => { if (sub) { html += `</${sub}>`; sub = null; } };
  const closeList = () => { closeSub(); if (list) { html += `</li></${list}>`; list = null; } };
  // Tiap baris nash dicocokkan dengan teks muqarrar; baris yang tidak ditemukan ditandai.
  const foundInSource = (line) => {
    if (!sourceNorm) return true;
    const probe = norm(line.replace(/\*\*/g, '')).slice(0, 70).trim();
    return probe.length < 12 || sourceNorm.includes(probe);
  };
  const flushNass = () => {
    if (!nass.length) return;
    const rows = nass.map(l => ({ l, ok: foundInSource(l) }));
    const bad = rows.some(r => !r.ok);
    html += `<div class="tk-nass${bad ? ' tk-nass-warn' : ''}">${rows.map(r => `<div${r.ok ? '' : ' class="tk-nl-warn"'}>${inline(r.l)}</div>`).join('')}`
      + (bad ? '<div class="tk-warn-note">Baris bergaris putus-putus tidak ditemukan persis di muqarrar. Cocokkan dulu sebelum dihafal.</div>' : '') + '</div>';
    nass = [];
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) continue;
    const quote = line.match(/^\s*>\s?(.*)$/);
    if (quote) { closeSub(); if (quote[1].trim()) nass.push(quote[1].trim()); continue; }
    flushNass();
    // "## " = bab (﴿ … ﴾), "### " = judul mabhats, "#### " = sub-bagian (hasil AI hanya memakai "#### ").
    const head = line.match(/^(#{1,6})\s+(.*)$/);
    if (head) {
      closeList();
      closeSec();
      const level = head[1].length;
      if (level <= 2) {
        const name = head[2].replace(/^﴿\s*|\s*﴾$/g, '');
        html += `<h2 class="tk-bab${norm(name).includes('مفتاح') ? ' tk-key' : ''}">﴿ ${inline(name)} ﴾</h2>`;
      } else if (level === 3) html += `<h3 class="tk-title">${inline(head[2])}</h3>`;
      else { html += `<div class="tk-sec tk-sec-${secKind(head[2])}"><h4 class="tk-h4">${inline(head[2])}</h4>`; sec = true; }
      continue;
    }
    const indented = /^\s{2,}/.test(line);
    const item = line.match(/^\s*(?:([-*•])|(\d+|[٠-٩]+)[.)\-])\s+(.*)$/);
    if (item) {
      const type = item[1] ? 'ul' : 'ol';
      if (indented && list) {
        if (sub !== type) { closeSub(); html += `<${type} class="tk-sub">`; sub = type; }
        html += `<li>${inline(item[3])}</li>`;
      } else {
        closeSub();
        if (list === type) html += '</li>';
        else { closeList(); html += `<${type} class="tk-list">`; list = type; }
        html += `<li>${inline(item[3])}`;
      }
      continue;
    }
    if (indented && list) { closeSub(); html += `<div class="tk-cont">${inline(line.trim())}</div>`; continue; }
    closeList();
    html += `<p>${inline(line.trim())}</p>`;
  }
  flushNass();
  closeList();
  closeSec();
  return html;
};

/* ── Status judul (cermin topicState di server) ── */
const stateOf = (x) => {
  if (x.skip) return 'skip';
  if (!x.text) return 'empty';
  if (x.partial) return 'partial';
  if (!x.coverage) return 'unchecked';
  return x.coverage.score >= 90 && !x.coverage.missing.length && !x.coverage.wrong.length ? 'complete' : 'incomplete';
};
const STATE_META = {
  complete:   { label: 'Lengkap',        dot: 'bg-emerald-400', text: 'text-emerald-300' },
  incomplete: { label: 'Kurang',         dot: 'bg-amber-400',   text: 'text-amber-300' },
  unchecked:  { label: 'Belum dicek',    dot: 'bg-sky-400',     text: 'text-sky-300' },
  partial:    { label: 'Belum selesai',  dot: 'bg-sky-400',     text: 'text-sky-300' },
  empty:      { label: 'Belum ditulis',  dot: 'bg-white/20',    text: 'text-ink-soft' },
  skip:       { label: 'Dilewati',       dot: 'bg-white/10',    text: 'text-ink-soft' },
};
// Nama bab & judul yang tersimpan dari pemetaan lama (sebelum perbaikan PDF) dibetulkan saat ditampilkan:
// "ال" + lam-alif terbalik → األعراف, اإلمام, اآلن, االستدالل (lihat fixReversedLamAlef di server).
const fixLamAlef = (s) => String(s || '').replace(/ا([أإآ])([\u064B-\u0652]*)ل/g, 'ال$1$2').replace(/اال/g, 'الا');

const pages = (x) => Math.max(1, Math.round((x.end - x.start) / CHARS_PER_PAGE));
const arNum = (n) => Number(n).toLocaleString('ar-EG');

// Kelompokkan judul berurutan per bab (bab yang sama tapi tidak bersebelahan tetap dipisah supaya urutan terjaga).
const groupByBab = (topics) => topics.reduce((acc, x, i) => {
  const last = acc[acc.length - 1];
  if (last && last.bab === (x.bab || '')) last.items.push({ x, i });
  else acc.push({ bab: x.bab || '', items: [{ x, i }] });
  return acc;
}, []);

/* ── Unduh PDF ──
   Pilihan sebelum unduh: berwarna / hitam-putih, ukuran huruf, kertas A4 / A5, dan latihan. Tiap bagian "#### "
   sudah dibungkus menurut jenisnya (talkhisHtml), jadi warnanya diatur di sini. */
const PDF_FONT = { normal: 15, large: 18, xlarge: 21 };
const PDF_PREF_KEY = 'talqeeh_talkhis_pdf';
const PDF_DEFAULTS = { color: true, size: 'large', paper: 'A4', exercises: true };
const loadPdfPrefs = () => { try { return { ...PDF_DEFAULTS, ...JSON.parse(localStorage.getItem(PDF_PREF_KEY) || '{}') }; } catch { return { ...PDF_DEFAULTS }; } };
const savePdfPrefs = (p) => { try { localStorage.setItem(PDF_PREF_KEY, JSON.stringify(p)); } catch {} };

// Warna per jenis bagian: [latar, garis, judul]. Hitam-putih memakai garis abu-abu tanpa latar.
const SEC_COLORS = {
  def: ['#eef8f2', '#2e9e6b', '#1f7a52'], masail: ['#eef4fb', '#3b74c4', '#2a5ea8'], gharib: ['#fdf1f1', '#c94545', '#b03030'],
  fawaid: ['#f5f0fb', '#7a4cc2', '#62399f'], exam: ['#fdf6e7', '#c9962b', '#9a6d12'], ex: ['#f3f3fa', '#6b6bb3', '#4b4b99'],
  nass: ['transparent', 'transparent', '#a11'], other: ['transparent', 'transparent', '#222'],
};

const printCss = ({ color = true, size = 'large', paper = 'A4' } = {}) => {
  const fs = PDF_FONT[size] || 15;
  const a5 = paper === 'A5';
  const secs = Object.entries(SEC_COLORS).map(([k, [bg, line, head]]) => color
    ? `.tk-sec-${k} { background: ${bg}; border-right: 4px solid ${line}; } .tk-sec-${k} > .tk-h4 { color: ${head}; }`
    : `.tk-sec-${k} { border-right: ${k === 'nass' || k === 'other' ? '0' : '2px solid #999'}; }`).join('\n');
  return `
@page { size: ${a5 ? 'A5' : 'A4'}; margin: ${a5 ? '11mm 10mm 13mm' : '16mm 15mm 18mm'}; }
* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; font-family: "Noto Naskh Arabic", "Amiri", serif; direction: rtl; color: #111; font-size: ${fs}px; line-height: 1.95; }
.cover { text-align: center; padding-top: 30vh; page-break-after: always; }
.cover h1 { font-size: ${fs + 22}px; margin: 0 0 8px; color: ${color ? '#0f5f46' : '#111'}; }
.cover .sub { font-size: ${fs + 6}px; color: #444; }
.cover .orn { width: 120px; height: 3px; margin: 14px auto; background: ${color ? 'linear-gradient(90deg,#c9a86a,#0f5f46,#c9a86a)' : '#999'}; border-radius: 2px; }
.cover .brand { margin-top: 36px; font-family: system-ui, sans-serif; direction: ltr; font-size: 11px; color: #888; }
.toc { page-break-after: always; }
.toc h2 { text-align: center; font-size: ${fs + 7}px; margin: 6px 0 14px; color: ${color ? '#0f5f46' : '#111'}; }
.toc ol { margin: 0; padding-inline-start: 22px; list-style: arabic-indic; }
.toc .tb { font-weight: 700; margin-top: 10px; color: ${color ? '#0f5f46' : '#111'}; }
.tk-bab { text-align: center; font-size: ${fs + 7}px; margin: 20px 0 12px; padding: 6px 10px; border-radius: 8px; break-after: avoid;
  ${color ? 'background: #0f5f46; color: #fff;' : 'border-top: 2px solid #111; border-bottom: 2px solid #111;'} }
.tk-bab.tk-key { page-break-before: always; }
.tk-title { font-size: ${fs + 3}px; margin: 16px 0 6px; padding-bottom: 3px; border-bottom: 2px solid ${color ? '#c9a86a' : '#555'}; color: ${color ? '#0f5f46' : '#111'}; break-after: avoid; }
.tk-sec { padding: 4px 12px 6px; margin: 8px 0; border-radius: 6px; }
.tk-h4 { font-size: ${fs + 0.5}px; margin: 4px 0 4px; text-decoration: underline; text-underline-offset: 5px; break-after: avoid; }
${secs}
.tk-nass { border: 1px solid ${color ? '#c94545' : '#555'}; ${color ? 'background: #fff6f5; color: #a11;' : 'color: #000;'} padding: 6px 12px; margin: 6px 0 8px; font-size: ${fs + 1}px; border-radius: 4px; break-inside: avoid; }
.tk-nass-warn { border-style: dashed; }
.tk-nl-warn { text-decoration: underline dashed #c90; text-underline-offset: 6px; }
.tk-warn-note { display: none; }
.tk-list { margin: 2px 0 6px; padding-inline-start: 20px; }
.tk-list > li { margin: 3px 0; }
${color ? '.tk-list > li::marker { color: #c9a86a; } .tk-sub > li::marker { color: #3b74c4; font-weight: 700; }' : ''}
ol.tk-list, ol.tk-sub { list-style: arabic-indic; }
.tk-sub { margin: 2px 0 4px; padding-inline-start: 22px; }
.tk-list b { text-decoration: underline; text-underline-offset: 4px; }
.tk-gh { color: ${color ? '#c22' : '#000'}; ${color ? '' : 'font-weight: 700;'} }
.tk-cont { margin-inline-start: 4px; }
p { margin: 4px 0; }
.foot { margin-top: 24px; text-align: center; font-family: system-ui, sans-serif; direction: ltr; font-size: 10px; color: #999; }
`;
};

/* PDF dari markdown talkhisan (tab Talkhis & Kurasah). فهرس dari "## " (bab) dan "### " (judul); bab kunci jawaban
   hanya disebut namanya. w = jendela yang sudah dibuka (supaya tidak diblokir browser saat ada proses async dulu). */
const printTalkhisDoc = (title, md, opts = {}, w = null) => {
  if (!String(md || '').trim()) { w?.close(); return false; }
  w = w || window.open('', '_blank');
  if (!w) return null;
  const groups = [];
  for (const line of String(md).replace(/\r/g, '').split('\n')) {
    const h = line.match(/^(#{2,3})\s+(.*)$/);
    if (!h) continue;
    if (h[1] === '##') groups.push({ bab: h[2].replace(/^﴿\s*|\s*﴾$/g, ''), items: [] });
    else {
      if (!groups.length) groups.push({ bab: '', items: [] });
      const g = groups[groups.length - 1];
      if (!norm(g.bab).includes('مفتاح')) g.items.push(h[2]);
    }
  }
  let n = 0;
  const hasToc = groups.some(g => g.items.length);
  const toc = groups.map(g => `${g.bab ? `<div class="tb">${esc(g.bab)}</div>` : ''}${g.items.length ? `<ol start="${n + 1}">${g.items.map(x => { n++; return `<li>${esc(x)}</li>`; }).join('')}</ol>` : ''}`).join('');
  w.document.open();
  w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تلخيص — ${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap" rel="stylesheet">
<style>${printCss(opts)}</style></head><body>
<div class="cover"><h1>تَلْخِيصُ</h1><div class="orn"></div><div class="sub">${esc(title)}</div><div class="brand">Disusun dengan Talqeeh · talqeeh.id — cocokkan dengan muqarrar sebelum dihafal</div></div>
${hasToc ? `<div class="toc"><h2>فِهْرِسُ الْمَبَاحِثِ</h2>${toc}</div>` : ''}
${talkhisHtml(md)}
<div class="foot">Talqeeh — talkhis dari muqarrarmu sendiri</div>
<script>(document.fonts ? document.fonts.ready : Promise.resolve()).then(function(){ setTimeout(function(){ window.print(); }, 300); });</script>
</body></html>`);
  w.document.close();
  return true;
};

/* ── Latihan per judul → markdown ──
   Soal ditaruh di akhir tiap judul ("#### تَدْرِيبَاتٌ"); kunci jawabannya dikumpulkan di bab terakhir. */
const exerciseMd = (x) => {
  const e = x.exercises;
  if (!e || (!e.tahriri?.length && !e.tf?.length)) return '';
  const out = ['#### تَدْرِيبَاتٌ'];
  if (e.tahriri?.length) { out.push('- **أَجِبْ عَمَّا يَأْتِي:**'); e.tahriri.forEach((q, i) => out.push(`  ${i + 1}. ${q.q}`)); }
  if (e.tf?.length) { out.push('- **ضَعْ عَلَامَةَ (✓) أَوْ (✗):**'); e.tf.forEach((s, i) => out.push(`  ${i + 1}. [      ] ${s.s}`)); }
  return out.join('\n');
};
const answerMd = (x) => {
  const e = x.exercises;
  if (!e) return '';
  const out = [];
  if (e.tahriri?.length) { out.push('- **أَجِبْ عَمَّا يَأْتِي:**'); e.tahriri.forEach((q, i) => out.push(`  ${i + 1}. ${q.a.join('، ')}`)); }
  if (e.tf?.length) { out.push('- **ضَعْ عَلَامَةَ (✓) أَوْ (✗):**'); e.tf.forEach((s, i) => out.push(`  ${i + 1}. ${s.ok ? '✓' : `✗ ← ${s.fix || ''}`}`)); }
  return out.join('\n');
};

const printTalkhis = (set, t, opts = {}, w = null) => {
  if (!t.topics.some(x => !x.skip && x.text)) { w?.close(); return false; }
  return printTalkhisDoc(set.title, allMarkdown(t, { exercises: !!opts.exercises }), opts, w);
};

/* Kotak pilihan sebelum unduh PDF (tab Talkhis & Kurasah). exercises: null = tanpa pilihan latihan. */
const TalkhisPdfDialog = ({ onClose, onDownload, exercises = null, busy = '' }) => {
  const [p, setP] = useState(loadPdfPrefs);
  const opt = (key, val, label) => (
    <button type="button" onClick={() => setP(x => ({ ...x, [key]: val }))}
      className={`text-xs px-3 py-2 rounded-lg border transition ${p[key] === val ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200' : 'border-white/10 text-ink-muted hover:text-ink'}`}>{label}</button>
  );
  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center md:px-4">
      <div className="absolute inset-0 bg-black/70" onClick={busy ? undefined : onClose}/>
      <div className="relative w-full md:max-w-md rounded-t-2xl md:rounded-2xl border border-white/10 p-5" style={{ background: '#141414' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-ink">Unduh PDF talkhisan</h3>
          {!busy && <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/6 flex items-center justify-center text-ink-muted"><Icon name="x" className="w-4 h-4"/></button>}
        </div>
        <div className="space-y-4">
          <div><div className="text-[11px] text-ink-soft mb-1.5">Warna</div><div className="flex gap-2 flex-wrap">{opt('color', true, 'Berwarna')}{opt('color', false, 'Hitam-putih (fotokopi)')}</div></div>
          <div><div className="text-[11px] text-ink-soft mb-1.5">Ukuran huruf</div><div className="flex gap-2 flex-wrap">{opt('size', 'normal', 'Normal')}{opt('size', 'large', 'Besar')}{opt('size', 'xlarge', 'Sangat besar')}</div></div>
          <div><div className="text-[11px] text-ink-soft mb-1.5">Kertas</div><div className="flex gap-2 flex-wrap">{opt('paper', 'A4', 'A4')}{opt('paper', 'A5', 'A5 (buku saku)')}</div></div>
          {exercises && (
            <label className="flex items-start gap-2.5 text-sm text-ink cursor-pointer">
              <input type="checkbox" checked={!!p.exercises} onChange={e => setP(x => ({ ...x, exercises: e.target.checked }))} className="accent-emerald-500 mt-1"/>
              <span>Sertakan latihan di akhir tiap judul
                <span className="block text-[11px] text-ink-soft">Soal tahriri + benar/salah, kunci jawaban di halaman belakang.{exercises.missing > 0 ? ` ${exercises.missing} judul belum punya latihan — dibuat otomatis dulu.` : ''}</span>
              </span>
            </label>
          )}
        </div>
        <button disabled={!!busy} onClick={() => { savePdfPrefs(p); onDownload(p); }} className="btn btn-primary w-full mt-5 py-3 text-sm disabled:opacity-60">
          {busy ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/> {busy}</> : <><Icon name="download" className="w-4 h-4"/> Unduh PDF</>}
        </button>
        <p className="text-[11px] text-ink-soft mt-2 text-center">Di jendela cetak, pilih "Simpan sebagai PDF". Aktifkan "Grafis latar" supaya warnanya ikut.</p>
      </div>
    </div>,
    document.body
  );
};

/* Latihan satu judul di tab Talkhis (kunci jawaban disembunyikan dulu). */
const ExercisesBox = ({ x }) => {
  const [showKey, setShowKey] = useState(false);
  const qs = useMemo(() => talkhisHtml(exerciseMd(x)), [x.exercises]);
  const keys = useMemo(() => talkhisHtml(answerMd(x)), [x.exercises]);
  if (!x.exercises) return null;
  return (
    <div className="mt-4">
      <div dir="rtl" lang="ar" className="tk-body" dangerouslySetInnerHTML={{ __html: qs }}/>
      <button onClick={() => setShowKey(v => !v)} className="text-xs text-emerald-300 hover:text-emerald-200 underline underline-offset-2 mt-1">
        {showKey ? 'Sembunyikan kunci jawaban' : 'Lihat kunci jawaban'}
      </button>
      {showKey && <div dir="rtl" lang="ar" className="tk-body mt-2 opacity-90" dangerouslySetInnerHTML={{ __html: keys }}/>}
    </div>
  );
};

/* ── Salin & simpan ──
   Clipboard diisi dua versi: HTML bergaya inline (ditempel ke Word/Google Docs tetap kanan-ke-kiri, nash berkotak,
   label tebal) dan teks biasa yang rapi (WhatsApp, Notes). Kurasah menyimpan markdown aslinya. */
const INLINE = {
  'tk-h4': 'font-weight:bold;text-decoration:underline;margin:10px 0 4px;font-size:15pt',
  'tk-bab': 'text-align:center;font-size:16pt;margin:14px 0 6px',
  'tk-title': 'font-size:15pt;margin:12px 0 4px;border-bottom:1px solid #c9a86a',
  'tk-nass': 'border:1px solid #b33;color:#a11;padding:4px 10px;margin:6px 0;font-size:15pt',
  'tk-nass tk-nass-warn': 'border:1px dashed #b33;color:#a11;padding:4px 10px;margin:6px 0;font-size:15pt',
  'tk-nl-warn': '',
  'tk-warn-note': 'display:none',
  'tk-list': 'margin:2px 0 6px;padding-right:22px',
  'tk-sub': 'margin:2px 0 4px;padding-right:24px',
  'tk-gh': 'color:#c22',
  'tk-cont': '',
};
const withInlineStyles = (html) => html
  .replace(/ class="([^"]+)"/g, (m, c) => (INLINE[c] != null ? (INLINE[c] ? ` style="${INLINE[c]}"` : '') : ''))
  .replace(/<b>/g, '<b style="text-decoration:underline">');
const htmlDoc = (inner) => `<div dir="rtl" lang="ar" style="direction:rtl;text-align:right;font-family:'Traditional Arabic','Noto Naskh Arabic',serif;font-size:14pt;line-height:1.8">${inner}</div>`;

// Markdown talkhis → teks biasa yang enak dibaca (tanpa tanda markdown).
const plainText = (md) => String(md || '').replace(/\r/g, '').split('\n').map(l => l
  .replace(/^#{1,6}\s+(.*)$/, '【$1】')
  .replace(/^\s*>\s?/, '    ')
  .replace(/^(\s*)[-*•]\s+/, (m, sp) => `${sp}• `)
  .replace(/\*\*(.+?)\*\*/g, '$1')).join('\n').replace(/\n{3,}/g, '\n\n').trim();

const copyRich = async (html, plain) => {
  try {
    if (window.ClipboardItem && navigator.clipboard?.write) {
      await navigator.clipboard.write([new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plain], { type: 'text/plain' }),
      })]);
      return true;
    }
    await navigator.clipboard.writeText(plain);
    return true;
  } catch {
    try { await navigator.clipboard.writeText(plain); return true; } catch { return false; }
  }
};

const topicHtml = (x) => withInlineStyles(talkhisHtml(x.text));
const copyTopic = (x) => copyRich(
  htmlDoc(`<h3 style="font-size:16pt;margin:0 0 6px">${esc(x.title)}</h3>${topicHtml(x)}`),
  `${x.title}\n\n${plainText(x.text)}`,
);

// Semua judul yang sudah ditulis (tanpa yang dilewati), berurutan per bab.
const writtenGroups = (t) => groupByBab(t.topics.filter(x => !x.skip && x.text));
const copyAll = (set, t) => {
  const groups = writtenGroups(t);
  const html = htmlDoc(`<h2 style="text-align:center;font-size:18pt">تلخيص ${esc(set.title)}</h2>` + groups.map(g =>
    (g.bab ? `<h2 style="text-align:center;font-size:16pt;margin:14px 0 6px">﴿ ${esc(g.bab)} ﴾</h2>` : '') +
    g.items.map(({ x }) => `<h3 style="font-size:15pt;margin:12px 0 4px;border-bottom:1px solid #c9a86a">${esc(x.title)}</h3>${topicHtml(x)}`).join('')).join(''));
  const plain = `تلخيص ${set.title}\n\n` + groups.map(g =>
    (g.bab ? `﴿ ${g.bab} ﴾\n\n` : '') + g.items.map(({ x }) => `${x.title}\n${'─'.repeat(12)}\n${plainText(x.text)}`).join('\n\n')).join('\n\n');
  return copyRich(html, plain);
};
// Satu dokumen markdown utuh (Kurasah) → clipboard berformat & teks biasa.
const copyTalkhisDoc = (title, md) => copyRich(
  htmlDoc(`<h2 style="text-align:center;font-size:18pt">${esc(title)}</h2>${withInlineStyles(talkhisHtml(md))}`),
  `${title}\n\n${plainText(String(md).replace(/^##\s+(.*)$/gm, (m, b) => `﴿ ${b.replace(/^﴿\s*|\s*﴾$/g, '')} ﴾`).replace(/^###\s+(.*)$/gm, '$1\n' + '─'.repeat(12)))}`,
);

/* ── Satu catatan Kurasah per materi ──
   Semua judul dari satu muqarrar masuk ke SATU catatan "Talkhis — [materi]" (dikenali dari source.id = id materi),
   tersusun seperti فهرس: "## ﴿ bab ﴾" lalu "### judul". Judul baru disisipkan di posisinya menurut urutan فهرس. */
const findTalkhisNote = (setId) => (window.loadNotes?.() || [])
  .find(n => n.source?.type === 'ai-partner' && n.source?.kind === 'talkhis' && n.source?.id === setId) || null;
const babName = (line) => line.replace(/^##\s+/, '').replace(/^﴿\s*|\s*﴾$/g, '').trim();

// Sisipkan (atau perbarui bila replace) satu judul di body catatan. ordered = judul urut فهرس (tanpa yang dilewati).
const mergeTopic = (body, x, ordered, replace) => {
  const lines = String(body || '').replace(/\r/g, '').split('\n');
  const headAt = (title) => lines.findIndex(l => /^###\s/.test(l) && l.replace(/^###\s+/, '').trim() === title.trim());
  const block = [`### ${x.title}`, '', x.text.trim(), ''];
  const at = headAt(x.title);
  if (at >= 0) {
    if (!replace) return { body, status: 'kept' };
    let end = at + 1;
    while (end < lines.length && !/^#{2,3}\s/.test(lines[end])) end++;
    lines.splice(at, end - at, ...block);
    return { body: lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n', status: 'updated' };
  }
  // Posisi: sebelum judul berikutnya (urut فهرس) yang sudah ada di catatan; kalau judul itu diawali bab lain, sebelum bab-nya.
  const idx = ordered.findIndex(y => y.id === x.id);
  let ins = lines.length;
  for (const y of ordered.slice(idx + 1)) {
    const h = headAt(y.title);
    if (h < 0) continue;
    ins = h;
    let k = h - 1;
    while (k >= 0 && !lines[k].trim()) k--;
    if (k >= 0 && /^##\s/.test(lines[k]) && babName(lines[k]) !== (x.bab || '').trim()) ins = k;
    break;
  }
  let prevBab = null;
  for (let k = ins - 1; k >= 0; k--) if (/^##\s/.test(lines[k])) { prevBab = babName(lines[k]); break; }
  const needBab = x.bab && prevBab !== x.bab.trim();
  lines.splice(ins, 0, ...(needBab ? [`## ﴿ ${x.bab} ﴾`, ''] : []), ...block);
  return { body: lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n', status: 'added' };
};

// Simpan beberapa judul ke catatan talkhis materi ini (dibuat bila belum ada). Mengembalikan ringkasan + id catatan.
const upsertTalkhisNote = (set, t, list, replace) => {
  const notes = window.loadNotes?.() || [];
  const now = new Date().toISOString();
  const existing = findTalkhisNote(set.id);
  const note = existing || {
    id: 'note_' + Date.now(), title: `Talkhis — ${set.title}`, body: '', tags: ['ai-partner', 'talkhis'],
    source: { type: 'ai-partner', kind: 'talkhis', id: set.id, label: 'AI Partner' }, createdAt: now, updatedAt: now,
  };
  const ordered = t.topics.filter(x => !x.skip);
  const count = { added: 0, updated: 0, kept: 0 };
  let body = note.body || '';
  for (const x of list) {
    const r = mergeTopic(body, x, ordered, replace);
    body = r.body;
    count[r.status]++;
  }
  const next = { ...note, body, updatedAt: now };
  window.saveNotes(existing ? notes.map(n => (n.id === note.id ? next : n)) : [next, ...notes], note.id);
  return { id: note.id, ...count };
};

const allMarkdown = (t, opts = {}) => {
  const body = allMarkdownBase(t, opts);
  if (!opts.exercises) return body;
  const keys = t.topics.filter(x => !x.skip && x.text && x.exercises).map(x => `### ${x.title}\n\n${answerMd(x)}`);
  return keys.length ? `${body}\n\n## ﴿ مِفْتَاحُ الْإِجَابَاتِ ﴾\n\n${keys.join('\n\n')}` : body;
};
const allMarkdownBase = (t, opts = {}) => writtenGroups(t).map(g =>
  (g.bab ? `## ﴿ ${g.bab} ﴾\n\n` : '') + g.items.map(({ x }) => {
    const ex = opts.exercises ? exerciseMd(x) : '';
    return `### ${x.title}\n\n${x.text}${ex ? `\n\n${ex}` : ''}`;
  }).join('\n\n')).join('\n\n');

/* ── Teks AI bertahap (diperbarui maks ±20x/detik) ── */
const useLive = () => {
  const [live, setLive] = useState(null);   // { id, text }
  const pending = useRef(null);
  const timer = useRef(null);
  const push = (id, text) => {
    pending.current = { id, text };
    if (!timer.current) timer.current = setTimeout(() => { timer.current = null; setLive(pending.current); }, 50);
  };
  const reset = () => { clearTimeout(timer.current); timer.current = null; pending.current = null; setLive(null); };
  useEffect(() => () => clearTimeout(timer.current), []);
  return [live, push, reset];
};

/* ── Isi satu judul ── */
const TalkhisBody = ({ md, sourceNorm }) => {
  const html = useMemo(() => talkhisHtml(md, sourceNorm), [md, sourceNorm]);
  return <div dir="rtl" lang="ar" className="tk-body" dangerouslySetInnerHTML={{ __html: html }}/>;
};

const CoverageBox = ({ cov }) => {
  if (!cov) return null;
  const ok = cov.score >= 90 && !cov.missing.length && !cov.wrong.length;
  return (
    <div className={`mt-4 rounded-xl border px-4 py-3 ${ok ? 'border-emerald-500/25 bg-emerald-500/[0.06]' : 'border-amber-500/25 bg-amber-500/[0.06]'}`}>
      <div className="flex items-center gap-2 text-sm">
        <Icon name={ok ? 'check' : 'alert'} className={`w-4 h-4 ${ok ? 'text-emerald-300' : 'text-amber-300'}`}/>
        <span className="text-ink font-medium">Cakupan {cov.score}%</span>
        <span className="text-ink-soft text-xs">{ok ? 'semua poin di muqarrar sudah masuk' : 'dibandingkan dengan teks muqarrar bagian ini'}</span>
      </div>
      {cov.missing.length > 0 && (
        <div className="mt-2">
          <div className="text-[11px] text-amber-200/80 mb-1">Poin yang belum masuk:</div>
          <ul dir="rtl" className="tk-mini">{cov.missing.map((m, k) => <li key={k}>{m}</li>)}</ul>
        </div>
      )}
      {cov.wrong.length > 0 && (
        <div className="mt-2">
          <div className="text-[11px] text-rose-300/90 mb-1">Perlu dicek, tidak sesuai muqarrar:</div>
          <ul dir="rtl" className="tk-mini">{cov.wrong.map((m, k) => <li key={k}>{m}</li>)}</ul>
        </div>
      )}
    </div>
  );
};

// Judul bab ﴿ … ﴾ dengan tombol ganti nama (berlaku untuk semua judul di bab itu).
const BabHeader = ({ bab, disabled, onRename }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(bab);
  useEffect(() => { if (!editing) setVal(bab); }, [bab, editing]);
  if (editing) {
    return (
      <form className="flex gap-2 mb-2 max-w-lg mx-auto" onSubmit={(e) => { e.preventDefault(); if (val.trim()) onRename(val.trim()); setEditing(false); }}>
        <input dir="rtl" autoFocus value={val} onChange={e => setVal(e.target.value)} maxLength={80} placeholder="اسم الباب"
          className="flex-1 min-w-0 arabic text-base px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-ink focus:outline-none focus:border-emerald-500/50"/>
        <button className="btn btn-primary text-xs px-4">Simpan</button>
        <button type="button" onClick={() => setEditing(false)} className="btn btn-ghost text-xs px-3">Batal</button>
      </form>
    );
  }
  return (
    <div className="flex items-center justify-center gap-2 mb-2">
      {bab
        ? <div dir="rtl" className="arabic text-center text-gold-300 text-lg">﴿ {bab} ﴾</div>
        : <div className="text-xs text-ink-soft">Tanpa bab</div>}
      <button type="button" disabled={disabled} onClick={() => setEditing(true)} title={bab ? 'Ganti nama bab' : 'Beri nama bab'}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-soft hover:text-ink hover:bg-white/6 disabled:opacity-40">
        <Icon name="pen" className="w-3.5 h-3.5"/>
      </button>
    </div>
  );
};

const TopicRow = ({ x, i, open, onToggle, live, busy, running, canWrite, sourceNorm, onWrite, onCheck, onEdit, onCopy, onKurasah, onExercise }) => {
  const st = live ? 'writing' : stateOf(x);
  const meta = STATE_META[st] || { label: 'Sedang ditulis…', dot: 'bg-emerald-400 animate-pulse', text: 'text-emerald-300' };
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(x.title);
  const writesLeft = MAX_WRITES - (x.writes || 0);
  const shown = live ? (x.partial && x.text ? `${x.text}\n${live}` : live) : x.text;
  const disabled = busy || running;
  const btn = 'inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-white/10 bg-white/4 text-ink-muted hover:text-ink hover:border-white/20 disabled:opacity-40';

  return (
    <div className={`rounded-xl border ${open ? 'border-white/15 bg-white/[0.03]' : 'border-white/[0.07]'} ${x.skip ? 'opacity-55' : ''}`}>
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-3.5 py-3 text-left">
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${meta.dot}`}/>
        <span className="flex-1 min-w-0">
          <span dir="rtl" className={`block text-right arabic text-[17px] leading-snug text-ink ${x.skip ? 'line-through' : ''}`}>{x.title}</span>
          <span className="flex items-center gap-2 text-[11px] mt-0.5">
            <span className={meta.text}>{meta.label}{st === 'incomplete' || st === 'complete' ? ` · ${x.coverage.score}%` : ''}</span>
            <span className="text-ink-soft">± {pages(x)} hlm</span>
          </span>
        </span>
        <Icon name={open ? 'chevronUp' : 'chevronDown'} className="w-4 h-4 text-ink-soft flex-shrink-0"/>
      </button>

      {open && (
        <div className="px-3.5 pb-4">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {!x.skip && !x.text && <button disabled={disabled || !canWrite} onClick={() => onWrite(x, 'new')} className="btn btn-primary text-xs px-3.5 py-2"><Icon name="sparkles" className="w-3.5 h-3.5"/> Tulis talkhis</button>}
            {!x.skip && x.text && st === 'incomplete' && writesLeft > 0 && (
              <button disabled={disabled} onClick={() => onWrite(x, 'complete')} className="btn btn-primary text-xs px-3.5 py-2"><Icon name="sparkles" className="w-3.5 h-3.5"/> Lengkapi</button>
            )}
            {!x.skip && x.text && st === 'partial' && <button disabled={disabled} onClick={() => onWrite(x, 'continue')} className={btn}><Icon name="arrowRight" className="w-3.5 h-3.5"/> Lanjutkan</button>}
            {!x.skip && x.text && (st === 'unchecked' || st === 'incomplete' || st === 'complete') && (x.checks || 0) < 3 && (
              <button disabled={disabled} onClick={() => onCheck(x)} className={btn}><Icon name="search" className="w-3.5 h-3.5"/> {x.coverage ? 'Cek ulang' : 'Cek kelengkapan'}</button>
            )}
            {!x.skip && x.text && st === 'complete' && writesLeft > 0 && <button disabled={disabled} onClick={() => onWrite(x, 'new')} className={btn}><Icon name="refresh" className="w-3.5 h-3.5"/> Tulis ulang</button>}
            {x.text && !live && <button onClick={() => onCopy(x)} className={btn}><Icon name="copy" className="w-3.5 h-3.5"/> Salin</button>}
            {x.text && !live && <button onClick={() => onKurasah(x)} className={btn}><Icon name="bookmark" className="w-3.5 h-3.5"/> Ke Kurasah</button>}
            {x.text && !live && !x.partial && !x.exercises && <button disabled={disabled} onClick={() => onExercise(x)} className={btn}><Icon name="target" className="w-3.5 h-3.5"/> Buat latihan</button>}
            <button disabled={disabled} onClick={() => setRenaming(r => !r)} className={btn}><Icon name="pen" className="w-3.5 h-3.5"/> Ganti judul</button>
            {i > 0 && <button disabled={disabled} onClick={() => onEdit(x, 'merge-prev')} className={btn} title="Gabungkan judul ini ke judul di atasnya"><Icon name="chevronUp" className="w-3.5 h-3.5"/> Gabung ke atas</button>}
            <button disabled={disabled} onClick={() => onEdit(x, 'skip')} className={btn}>{x.skip ? 'Pakai lagi' : 'Lewati'}</button>
          </div>
          {renaming && (
            <form className="flex gap-2 mb-3" onSubmit={(e) => { e.preventDefault(); onEdit(x, 'rename', title); setRenaming(false); }}>
              <input dir="rtl" value={title} onChange={e => setTitle(e.target.value)} maxLength={120}
                className="flex-1 min-w-0 arabic text-base px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-ink focus:outline-none focus:border-emerald-500/50"/>
              <button className="btn btn-primary text-xs px-4">Simpan</button>
            </form>
          )}
          {shown
            ? <TalkhisBody md={shown} sourceNorm={live ? null : sourceNorm}/>
            : !x.skip && <p className="text-xs text-ink-soft">Belum ditulis. AI hanya memakai teks muqarrar bagian ini (± {pages(x)} halaman).</p>}
          {!live && <CoverageBox cov={x.coverage}/>}
          {!live && <ExercisesBox x={x}/>}
          {!live && x.text && writesLeft <= 0 && stateOf(x) === 'incomplete' && (
            <p className="text-[11px] text-ink-soft mt-2">Jatah tulis judul ini sudah habis. Poin yang kurang di atas bisa kamu tambahkan sendiri saat menyalin.</p>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Bukan pelanggan: contoh hasil + ajakan berlangganan ──
   Talkhis khusus pelanggan AI Partner (biaya AI-nya besar). Yang belum berlangganan melihat contoh talkhis
   sungguhan supaya tahu hasilnya, lalu diarahkan ke langganan. */
const SAMPLE_TALKHIS = `## ﴿ كتاب الزكاة ﴾
### تعريف الزكاة وحكمها
#### التَّعْرِيفُ
- **تَعْرِيفُ الزَّكَاةِ لُغَةً:** النَّمَاءُ وَالتَّطْهِيرُ.
- **وَاصْطِلَاحًا:**
> اسْمٌ لِمَا يُخْرَجُ عَنْ مَالٍ أَوْ بَدَنٍ عَلَى وَجْهٍ مَخْصُوصٍ
#### الْمَسَائِلُ
- **أَجْمَعُوا عَلَى** وُجُوبِ الزَّكَاةِ فِي الْعَيْنِ وَالزَّرْعِ وَالْمَاشِيَةِ.
- **اخْتَلَفُوا فِي زَكَاةِ الْعُرُوضِ:**
  1. الْجُمْهُورُ: وَاجِبَةٌ.
  2. دَاوُدُ: غَيْرُ وَاجِبَةٍ ← وَدَلِيلُهُ:
> لَيْسَ عَلَى الْمُسْلِمِ فِي عَبْدِهِ وَلَا فَرَسِهِ صَدَقَةٌ
- (الْأَوَاقُ): جَمْعُ أُوقِيَّةٍ، وَهِيَ أَرْبَعُونَ دِرْهَمًا.
#### مَا يُتَوَقَّعُ فِي الِامْتِحَانِ
- **عَرِّفِ الزَّكَاةَ لُغَةً وَاصْطِلَاحًا** ← اذْكُرِ الْمَعْنَيَيْنِ.
- **اذْكُرِ الْخِلَافَ فِي زَكَاةِ الْعُرُوضِ مَعَ الدَّلِيلِ.**`;

const TalkhisLocked = () => {
  useEffect(() => { window.logFunnel?.('paywall', 'talkhis'); }, []);
  const subscribe = () => { window.logFunnel?.('click_pay', 'talkhis'); openAiUpgrade(); };
  const html = useMemo(() => talkhisHtml(SAMPLE_TALKHIS), []);
  return (
    <div className="card-glass p-5 md:p-8" style={{ border: '1px solid rgba(201,168,106,0.28)' }}>
      <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border border-gold-500/25 bg-gold-500/10 text-gold-300 mb-3">
            <Icon name="crown" className="w-3 h-3"/> Khusus pelanggan AI Partner
          </div>
          <h3 className="font-display text-xl md:text-2xl font-semibold text-ink mb-1">Talkhis otomatis seluruh muqarrar</h3>
          <div dir="rtl" className="arabic text-gold-300/80 text-lg mb-3 text-left md:text-left">تَلْخِيصُ الْمُقَرَّرِ</div>
          <p className="text-sm text-ink-muted leading-relaxed mb-4">
            Upload muqarrarmu, Talqeeh memetakan semua mabahits-nya lalu menulis talkhis berbahasa Arab gaya talkhisan Masisir.
            Tiap judul dicek ke teks muqarrar: yang kurang langsung dilengkapi.
          </p>
          <ul className="text-[13px] text-ink-muted space-y-2 mb-5">
            {[
              'فهرس المباحث otomatis dari seluruh muqarrar',
              'Ta\'rif, nash, khilaf + dalil, dan perkiraan soal imtihan per judul',
              'Indikator lengkap/kurang, dicek ke teks muqarrar',
              'Satu catatan rapi di Kurasah + PDF siap cetak',
            ].map(s => (
              <li key={s} className="flex gap-2"><Icon name="check" className="w-4 h-4 text-emerald-300 flex-shrink-0 mt-0.5"/><span>{s}</span></li>
            ))}
          </ul>
          <button onClick={subscribe} className="btn btn-gold text-sm px-6 py-3 w-full md:w-auto">
            Berlangganan AI Partner <Icon name="arrowRight" className="w-4 h-4"/>
          </button>
          <p className="text-[11px] text-ink-soft mt-2">Sekalian buka i'rab, tutor, latihan tahriri, dan semua fitur AI Partner.</p>
        </div>
        <div className="relative rounded-xl border border-white/10 bg-black/20 p-4 max-h-[420px] overflow-hidden">
          <div className="text-[10px] uppercase tracking-wider text-ink-soft mb-2">Contoh hasil</div>
          <div dir="rtl" lang="ar" className="tk-body" style={{ fontSize: 16 }} dangerouslySetInnerHTML={{ __html: html }}/>
          <div className="absolute inset-x-0 bottom-0 h-28 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(12,12,12,0), #0c0c0c)' }}/>
        </div>
      </div>
    </div>
  );
};

// Data talkhis untuk ditampilkan: nama bab & judul lama dibetulkan (lam-alif terbalik).
const viewTalkhis = (raw) => (raw && Array.isArray(raw.topics)
  ? { ...raw, topics: raw.topics.map(x => ({ ...x, bab: fixLamAlef(x.bab), title: fixLamAlef(x.title) })) }
  : null);

const TalkhisTab = ({ set, setSet, access }) => {
  const toast = useToast();
  const t = viewTalkhis(set.talkhis);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfBusy, setPdfBusy] = useState('');
  const tRef = useRef(t);
  tRef.current = t;
  const [busy, setBusy] = useState('');          // 'map' | 'write' | 'check' | 'edit' | 'reset'
  const [running, setRunning] = useState(false); // "Tulis semua" sedang berjalan
  const stopRef = useRef(false);
  const [openId, setOpenId] = useState(null);
  const [upgrade, setUpgrade] = useState('');
  const [mapErr, setMapErr] = useState('');
  const [live, pushLive, resetLive] = useLive();
  const isTrial = access.tier !== 'pro';
  const canUse = access.tier === 'pro';

  const apply = (d) => setSet(s => ({ ...s, talkhis: d.talkhis }));
  const fail = (d) => { if (d.upgrade) setUpgrade(d.error); else toast.push(d.error || 'Gagal'); return false; };

  const srcNorms = useMemo(() => {
    const m = {};
    (t?.topics || []).forEach(x => { m[x.id] = norm((set.content || '').slice(x.start, x.end)); });
    return m;
  }, [t?.topics?.map(x => `${x.id}:${x.start}:${x.end}`).join('|'), set.content]);

  /* Pemetaan: satu bagian per request sampai selesai. */
  const runMap = async () => {
    setBusy('map'); setMapErr(''); setUpgrade('');
    for (let guard = 0; guard < 20; guard++) {
      const d = await aiCall('talkhis', { op: 'map', set_id: set.id });
      if (!d.ok) { setBusy(''); if (d.upgrade) setUpgrade(d.error); else setMapErr(d.error || 'Gagal memetakan'); return; }
      apply(d);
      if (d.talkhis?.stage !== 'map') break;
    }
    setBusy('');
  };

  const check = async (x) => {
    setBusy('check');
    const d = await aiCall('talkhis', { op: 'check', set_id: set.id, topic_id: x.id });
    setBusy('');
    if (!d.ok) return fail(d);
    apply(d);
    return d.talkhis; // hasil terbaru (dipakai write untuk memutuskan perlu dilengkapi atau tidak)
  };

  /* Tulis (atau lengkapi) satu judul, lanjutkan otomatis bila terpotong, lalu cek kelengkapannya. Draf ditulis model
     hemat; kalau hasil ceknya masih kurang, langsung dilengkapi Sonnet (sekali, sesuai jatah tulis per judul). */
  const write = async (x, mode) => {
    const latest = await writeOnce(x, mode);
    if (!latest) return false;
    const now = latest.topics?.find(y => y.id === x.id);
    if (mode === 'new' && now && stateOf(now) === 'incomplete' && (now.writes || 0) < MAX_WRITES && !isTrial) {
      return writeOnce(x, 'complete');
    }
    return true;
  };
  const writeOnce = async (x, mode) => {
    setOpenId(x.id);
    setBusy('write');
    let m = mode;
    for (let k = 0; k < 4; k++) {
      resetLive();
      const d = await aiStream('talkhis', { op: 'write', mode: m, set_id: set.id, topic_id: x.id }, (_, full) => pushLive(x.id, full));
      resetLive();
      if (!d.ok) { setBusy(''); return fail(d); }
      apply(d);
      const now = d.talkhis.topics.find(y => y.id === x.id);
      if (!now?.partial) break;
      m = 'continue';
    }
    setBusy('');
    return check(x);
  };

  const writeAll = async () => {
    stopRef.current = false;
    setRunning(true);
    const todo = (tRef.current?.topics || []).filter(x => !x.skip && !x.text);
    for (const x of todo) {
      if (stopRef.current) break;
      if (!(await write(x, 'new'))) break;
    }
    setRunning(false);
  };

  const edit = async (x, kind, title) => {
    setBusy('edit');
    const d = await aiCall('talkhis', { op: 'edit', edit: kind, set_id: set.id, topic_id: x.id, title });
    setBusy('');
    if (!d.ok) return fail(d);
    apply(d);
  };

  const reset = async () => {
    if (!window.confirm('Petakan ulang dari awal? Semua talkhis di materi ini dihapus dan pemetaan baru memakai 1 kuota talkhis.')) return;
    setBusy('reset');
    const d = await aiCall('talkhis', { op: 'reset', set_id: set.id });
    setBusy('');
    if (!d.ok) return fail(d);
    apply(d);
  };

  // Catatan Kurasah materi ini (satu catatan untuk semua judul).
  const [noteId, setNoteId] = useState(() => findTalkhisNote(set.id)?.id || null);
  const toKurasah = (list, replace) => {
    try {
      const r = upsertTalkhisNote(set, t, list, replace);
      setNoteId(r.id);
      return r;
    } catch { toast.push('Gagal menyimpan ke Kurasah'); return null; }
  };
  const copied = (ok) => toast.push(ok ? 'Tersalin. Tempel di Word/Docs untuk format lengkap.' : 'Gagal menyalin. Coba lagi.');
  const onCopy = async (x) => copied(await copyTopic(x));
  const onKurasah = (x) => {
    const r = toKurasah([x], true);
    if (r) toast.push(r.updated ? 'Diperbarui di catatan talkhis Kurasah.' : 'Masuk ke catatan talkhis Kurasah.');
  };
  const onCopyAll = async () => copied(await copyAll(set, t));
  // Judul yang sudah ada di catatan (mungkin sudah diedit) tidak ditimpa.
  const onKurasahAll = () => {
    const r = toKurasah(t.topics.filter(x => !x.skip && x.text), false);
    if (r) toast.push(r.added ? `${r.added} judul masuk ke catatan Kurasah${r.kept ? ` (${r.kept} sudah ada, tidak ditimpa)` : ''}.` : 'Semua judul sudah ada di catatan Kurasah.');
  };

  /* Latihan dibuat per judul secara berurutan; mengembalikan data talkhis terbaru (atau null bila gagal di tengah). */
  const makeExercises = async (list, onStep) => {
    let latest = null;
    setBusy('exercise');
    for (let k = 0; k < list.length; k++) {
      onStep?.(k, list.length);
      const d = await aiCall('talkhis', { op: 'exercise', set_id: set.id, topic_id: list[k].id });
      if (!d.ok) { setBusy(''); fail(d); return latest; }
      apply(d);
      latest = d.talkhis;
    }
    setBusy('');
    if (list.length === 1 && latest) setOpenId(list[0].id);
    return latest;
  };

  const missingExercises = (tt) => (tt?.topics || []).filter(x => !x.skip && x.text && !x.partial && !x.exercises);
  const download = async (prefs) => {
    // Jendela dibuka langsung saat diklik (kalau menunggu proses dulu, browser memblokirnya sebagai pop-up).
    const w = window.open('', '_blank');
    if (!w) { toast.push('Jendela unduhan diblokir browser. Izinkan pop-up untuk Talqeeh lalu coba lagi.'); return; }
    w.document.write('<p style="font-family:system-ui;padding:24px;color:#555">Menyiapkan PDF talkhisan…</p>');
    let cur = t;
    const missing = prefs.exercises ? missingExercises(t) : [];
    if (missing.length) {
      const latest = await makeExercises(missing, (k, n) => setPdfBusy(`Membuat latihan ${k + 1}/${n}…`));
      if (latest) cur = viewTalkhis(latest);
      setPdfBusy('');
    }
    const r = printTalkhis(set, cur, prefs, w);
    if (r === false) toast.push('Belum ada judul yang ditulis.');
    setPdfOpen(false);
  };

  if (!canUse) return <TalkhisLocked/>;

  /* Belum ada talkhis / pemetaan terputus */
  if (!t || t.stage === 'map') {
    const mapping = busy === 'map' || (t && t.stage === 'map');
    const step = t?.map_step || 0, steps = t?.map_steps || 0;
    return (
      <div>
        {upgrade && <div className="mb-4"><UpgradeCard compact message={upgrade}/></div>}
        <div className="card-glass p-6 md:p-10">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-emerald-500/12 border border-emerald-500/25">
              <Icon name="list" className="w-6 h-6 text-emerald-300"/>
            </div>
            <h3 className="font-display text-xl font-semibold text-ink mb-1">Talkhis otomatis</h3>
            <div dir="rtl" className="arabic text-gold-300/80 text-lg mb-3">تَلْخِيصُ الْمُقَرَّرِ</div>
            <p className="text-sm text-ink-muted leading-relaxed mb-5">
              Seluruh muqarrarmu dipetakan jadi daftar mabahits. Tiap judul ditalkhis dalam bahasa Arab gaya talkhisan Masisir,
              hanya dari teks muqarrarnya sendiri, lalu dicek: ada poin yang terlewat atau tidak. Yang kurang bisa langsung dilengkapi.
            </p>
            <ol className="text-left text-[13px] text-ink-muted space-y-1.5 max-w-sm mx-auto mb-6">
              <li><b className="text-ink">1.</b> AI membaca muqarrar dan menyusun <span dir="rtl" className="arabic text-gold-300/90">فهرس المباحث</span></li>
              <li><b className="text-ink">2.</b> Kamu cek daftarnya: ganti judul, gabung, atau lewati</li>
              <li><b className="text-ink">3.</b> Tiap judul ditalkhis lalu dicek kelengkapannya</li>
              <li><b className="text-ink">4.</b> Unduh PDF siap cetak</li>
            </ol>
            {mapping && busy === 'map' ? (
              <div className="max-w-sm mx-auto">
                <div className="flex items-center justify-center gap-2 text-sm text-ink-muted mb-3">
                  <span className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin"/>
                  {steps ? `Membaca bagian ${Math.min(step + 1, steps)} dari ${steps}…` : 'Mulai membaca muqarrar…'}
                </div>
                {steps > 0 && (
                  <div className="flex gap-1 justify-center">
                    {Array.from({ length: steps }, (_, k) => <span key={k} className={`h-1.5 flex-1 max-w-[40px] rounded-full ${k < step ? 'bg-emerald-400' : k === step ? 'bg-emerald-400/50 animate-pulse' : 'bg-white/10'}`}/>)}
                  </div>
                )}
                <p className="text-[11px] text-ink-soft mt-3">Jangan tutup halaman ini.</p>
              </div>
            ) : (
              <>
                {mapErr && <p className="text-xs text-rose-300 mb-3">{mapErr}</p>}
                <button onClick={runMap} className="btn btn-primary text-sm px-6 py-3">
                  <Icon name="sparkles" className="w-4 h-4"/> {t ? 'Lanjutkan pemetaan' : 'Petakan mabahits'}
                </button>
                <p className="text-[11px] text-ink-soft mt-3">
                  {isTrial ? `Coba gratis: pemetaan + talkhis ${TRIAL_TOPICS} judul.` : 'Memakai 1 kuota talkhis untuk seluruh muqarrar ini.'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* Daftar judul + talkhis */
  const active = t.topics.filter(x => !x.skip);
  const weight = (arr) => arr.reduce((n, x) => n + (x.end - x.start), 0);
  const total = Math.max(1, weight(active));
  const written = active.filter(x => x.text);
  const complete = active.filter(x => stateOf(x) === 'complete');
  const pctWritten = Math.round((weight(written) / total) * 100);
  const pctComplete = Math.round((weight(complete) / total) * 100);
  const todo = active.filter(x => !x.text);
  const trialLeft = isTrial ? Math.max(0, TRIAL_TOPICS - t.topics.filter(x => x.writes > 0).length) : Infinity;
  const groups = groupByBab(t.topics);

  return (
    <div>
      {upgrade && <div className="mb-4"><UpgradeCard compact message={upgrade}/></div>}

      {/* Ringkasan kelengkapan */}
      <div className="card-glass p-4 md:p-5 mb-4">
        <div className="flex items-baseline justify-between gap-3 mb-2 flex-wrap">
          <div className="text-sm text-ink font-medium">
            {complete.length} dari {active.length} judul lengkap
            <span className="text-ink-soft font-normal"> · {pctWritten}% muqarrar sudah ditalkhis</span>
          </div>
          <div className="text-[11px] text-ink-soft">{t.topics.length - active.length > 0 ? `${t.topics.length - active.length} judul dilewati` : ''}</div>
        </div>
        <div className="h-2 rounded-full bg-white/8 overflow-hidden flex">
          <div className="h-full bg-emerald-400" style={{ width: `${pctComplete}%` }}/>
          <div className="h-full bg-amber-400/70" style={{ width: `${Math.max(0, pctWritten - pctComplete)}%` }}/>
        </div>
        <div className="flex items-center gap-3 mt-2 text-[11px] text-ink-soft flex-wrap">
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"/>lengkap (sudah dicek)</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400/70"/>sudah ditulis, ada yang kurang/belum dicek</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {running ? (
            <button onClick={() => { stopRef.current = true; }} className="btn btn-ghost text-xs px-4 py-2.5">Berhenti setelah judul ini</button>
          ) : todo.length > 0 && trialLeft > 0 && (
            <button disabled={!!busy} onClick={writeAll} className="btn btn-primary text-xs px-4 py-2.5">
              <Icon name="sparkles" className="w-3.5 h-3.5"/> Tulis semua yang belum ({isTrial ? Math.min(todo.length, trialLeft) : todo.length})
            </button>
          )}
          <button disabled={!written.length || running || !!busy} onClick={() => setPdfOpen(true)} className="btn btn-ghost text-xs px-4 py-2.5 disabled:opacity-40">
            <Icon name="download" className="w-3.5 h-3.5"/> Unduh PDF
          </button>
          <button disabled={!written.length || running} onClick={onCopyAll} className="btn btn-ghost text-xs px-4 py-2.5 disabled:opacity-40">
            <Icon name="copy" className="w-3.5 h-3.5"/> Salin semua
          </button>
          <button disabled={!written.length || running} onClick={onKurasahAll} className="btn btn-ghost text-xs px-4 py-2.5 disabled:opacity-40">
            <Icon name="bookmark" className="w-3.5 h-3.5"/> Simpan semua ke Kurasah
          </button>
          {noteId && (
            <button onClick={() => navigate('/kurasah?id=' + noteId)} className="btn btn-ghost text-xs px-4 py-2.5 border-emerald-600/35 text-emerald-200">
              <Icon name="bookOpen" className="w-3.5 h-3.5"/> Buka di Kurasah
            </button>
          )}
          {!isTrial && <button disabled={!!busy || running} onClick={reset} className="text-xs text-ink-soft hover:text-ink px-2 py-2.5 disabled:opacity-40">Petakan ulang</button>}
        </div>
        {written.length === 0 && (
          <p className="text-[12px] text-ink-muted mt-3 leading-relaxed">
            Cek daftar judul di bawah dulu. Kalau ada yang tidak diujikan, pilih <b>Lewati</b>. Judul yang terlalu kecil bisa di-<b>Gabung ke atas</b>.
          </p>
        )}
        {isTrial && trialLeft === 0 && todo.length > 0 && (
          <p className="text-[12px] text-gold-300/90 mt-3">Jatah coba gratis ({TRIAL_TOPICS} judul) sudah dipakai. <button onClick={openAiUpgrade} className="underline">Berlangganan</button> untuk men-talkhis seluruh muqarrar.</p>
        )}
      </div>

      {/* فهرس المباحث */}
      <div className="space-y-5">
        {groups.map((g, gi) => (
          <div key={gi}>
            {(g.bab || groups.length > 1) && <BabHeader bab={g.bab} disabled={!!busy || running} onRename={(name) => edit(g.items[0].x, 'rename-bab', name)}/>}
            <div className="space-y-2">
              {g.items.map(({ x, i }) => (
                <TopicRow key={x.id} x={x} i={i} open={openId === x.id} onToggle={() => setOpenId(id => (id === x.id ? null : x.id))}
                  live={live && live.id === x.id ? live.text : null} busy={!!busy} running={running}
                  canWrite={!isTrial || x.writes > 0 || trialLeft > 0} sourceNorm={srcNorms[x.id]}
                  onWrite={write} onCheck={check} onEdit={edit} onCopy={onCopy} onKurasah={onKurasah} onExercise={(x) => makeExercises([x])}/>
              ))}
            </div>
          </div>
        ))}
      </div>
      {pdfOpen && (
        <TalkhisPdfDialog busy={pdfBusy} onClose={() => setPdfOpen(false)} onDownload={download}
          exercises={{ missing: missingExercises(t).length }}/>
      )}
      <p className="text-[11px] text-ink-soft mt-5 leading-relaxed">
        Talkhis ditulis AI dari teks muqarrarmu dan dicek otomatis, tapi tetap cocokkan dengan muqarrar dan catatan duktur sebelum dihafal.
        Nash bergaris putus-putus artinya tidak ditemukan persis di muqarrar.
      </p>
    </div>
  );
};

Object.assign(window, { TalkhisTab, talkhisHtml, printTalkhisDoc, copyTalkhisDoc, TalkhisPdfDialog });
