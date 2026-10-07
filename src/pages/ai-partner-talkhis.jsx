import React, { useState, useEffect, useRef, useMemo } from 'react';
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

const talkhisHtml = (md, sourceNorm) => {
  const lines = String(md || '').replace(/\r/g, '').split('\n');
  let html = '', list = null, sub = null, nass = [];
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
    const head = line.match(/^#{1,6}\s+(.*)$/);
    if (head) { closeList(); html += `<h4 class="tk-h4">${inline(head[1])}</h4>`; continue; }
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
const pages = (x) => Math.max(1, Math.round((x.end - x.start) / CHARS_PER_PAGE));
const arNum = (n) => Number(n).toLocaleString('ar-EG');

// Kelompokkan judul berurutan per bab (bab yang sama tapi tidak bersebelahan tetap dipisah supaya urutan terjaga).
const groupByBab = (topics) => topics.reduce((acc, x, i) => {
  const last = acc[acc.length - 1];
  if (last && last.bab === (x.bab || '')) last.items.push({ x, i });
  else acc.push({ bab: x.bab || '', items: [{ x, i }] });
  return acc;
}, []);

/* ── Unduh PDF: jendela cetak bergaya talkhisan (A4, Naskh, nash dalam kotak) ── */
const PRINT_CSS = `
@page { size: A4; margin: 16mm 15mm 18mm; }
* { box-sizing: border-box; }
body { margin: 0; font-family: "Noto Naskh Arabic", "Amiri", serif; direction: rtl; color: #111; font-size: 15px; line-height: 1.95; }
.cover { text-align: center; padding-top: 32vh; page-break-after: always; }
.cover h1 { font-size: 34px; margin: 0 0 8px; }
.cover .sub { font-size: 20px; color: #444; }
.cover .brand { margin-top: 40px; font-family: system-ui, sans-serif; direction: ltr; font-size: 11px; color: #888; }
.toc { page-break-after: always; }
.toc h2, .bab { text-align: center; font-size: 22px; margin: 6px 0 14px; }
.toc ol { margin: 0; padding-inline-start: 22px; list-style: arabic-indic; }
.toc .tb { font-weight: 700; margin-top: 10px; }
.bab { margin-top: 18px; }
.topic { margin: 0 0 14px; }
.topic h3 { font-size: 18px; margin: 14px 0 6px; padding-bottom: 3px; border-bottom: 1.5px solid #c9a86a; }
.tk-h4 { font-size: 15.5px; margin: 10px 0 4px; text-decoration: underline; text-underline-offset: 5px; }
.tk-nass { border: 1px solid #b33; color: #a11; padding: 6px 12px; margin: 6px 0 8px; font-size: 16px; break-inside: avoid; }
.tk-nass-warn { border-style: dashed; }
.tk-nl-warn { text-decoration: underline dashed #c90; text-underline-offset: 6px; }
.tk-warn-note { display: none; }
.tk-list { margin: 2px 0 6px; padding-inline-start: 20px; }
.tk-list > li { margin: 3px 0; }
ol.tk-list, ol.tk-sub { list-style: arabic-indic; }
.tk-sub { margin: 2px 0 4px; padding-inline-start: 22px; }
.tk-list b { text-decoration: underline; text-underline-offset: 4px; }
.tk-gh { color: #c22; }
.tk-cont { margin-inline-start: 4px; }
p { margin: 4px 0; }
.foot { margin-top: 24px; text-align: center; font-family: system-ui, sans-serif; direction: ltr; font-size: 10px; color: #999; }
`;

const printTalkhis = (set, t) => {
  const topics = t.topics.filter(x => !x.skip && x.text);
  if (!topics.length) return false;
  const w = window.open('', '_blank');
  if (!w) return null;
  const groups = groupByBab(topics);
  const src = set.content || '';
  const body = groups.map(g => `${g.bab ? `<h2 class="bab">﴿ ${esc(g.bab)} ﴾</h2>` : ''}${g.items.map(({ x }) =>
    `<section class="topic"><h3>${esc(x.title)}</h3>${talkhisHtml(x.text, norm(src.slice(x.start, x.end)))}</section>`).join('')}`).join('');
  let n = 0;
  const toc = groups.map(g => `${g.bab ? `<div class="tb">${esc(g.bab)}</div>` : ''}<ol start="${n + 1}">${g.items.map(({ x }) => { n++; return `<li>${esc(x.title)}</li>`; }).join('')}</ol>`).join('');
  w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تلخيص — ${esc(set.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap" rel="stylesheet">
<style>${PRINT_CSS}</style></head><body>
<div class="cover"><h1>تَلْخِيصُ</h1><div class="sub">${esc(set.title)}</div><div class="brand">Dibuat dengan Talqeeh AI Partner · talqeeh.vercel.app — cocokkan dengan muqarrar sebelum dihafal</div></div>
<div class="toc"><h2>فِهْرِسُ الْمَبَاحِثِ</h2>${toc}</div>
${body}
<div class="foot">Talqeeh — talkhis dari muqarrarmu sendiri</div>
<script>(document.fonts ? document.fonts.ready : Promise.resolve()).then(function(){ setTimeout(function(){ window.print(); }, 300); });</script>
</body></html>`);
  w.document.close();
  return true;
};

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

const TopicRow = ({ x, i, open, onToggle, live, busy, running, canWrite, sourceNorm, onWrite, onCheck, onEdit }) => {
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
          {!live && x.text && writesLeft <= 0 && stateOf(x) === 'incomplete' && (
            <p className="text-[11px] text-ink-soft mt-2">Jatah tulis judul ini sudah habis. Poin yang kurang di atas bisa kamu tambahkan sendiri saat menyalin.</p>
          )}
        </div>
      )}
    </div>
  );
};

const TalkhisTab = ({ set, setSet, access }) => {
  const toast = useToast();
  const t = set.talkhis && Array.isArray(set.talkhis.topics) ? set.talkhis : null;
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
  const canUse = access.tier === 'pro' || access.isTrialSet;

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
    return true;
  };

  /* Tulis (atau lengkapi) satu judul, lanjutkan otomatis bila terpotong, lalu cek kelengkapannya. */
  const write = async (x, mode) => {
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

  const download = () => {
    const r = printTalkhis(set, t);
    if (r === false) toast.push('Belum ada judul yang ditulis.');
    if (r === null) toast.push('Jendela unduhan diblokir browser. Izinkan pop-up untuk Talqeeh lalu coba lagi.');
  };

  if (!canUse) return <UpgradeCard message="Talkhis otomatis khusus pelanggan AI Partner. Muqarrarmu dipetakan per mabhats, ditalkhis dalam bahasa Arab, lalu dicek kelengkapannya satu per satu."/>;

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
          <button disabled={!written.length || running} onClick={download} className="btn btn-ghost text-xs px-4 py-2.5 disabled:opacity-40">
            <Icon name="download" className="w-3.5 h-3.5"/> Unduh PDF
          </button>
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
            {g.bab && <div dir="rtl" className="arabic text-center text-gold-300 text-lg mb-2">﴿ {g.bab} ﴾</div>}
            <div className="space-y-2">
              {g.items.map(({ x, i }) => (
                <TopicRow key={x.id} x={x} i={i} open={openId === x.id} onToggle={() => setOpenId(id => (id === x.id ? null : x.id))}
                  live={live && live.id === x.id ? live.text : null} busy={!!busy} running={running}
                  canWrite={!isTrial || x.writes > 0 || trialLeft > 0} sourceNorm={srcNorms[x.id]}
                  onWrite={write} onCheck={check} onEdit={edit}/>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-ink-soft mt-5 leading-relaxed">
        Talkhis ditulis AI dari teks muqarrarmu dan dicek otomatis, tapi tetap cocokkan dengan muqarrar dan catatan duktur sebelum dihafal.
        Nash bergaris putus-putus artinya tidak ditemukan persis di muqarrar.
      </p>
    </div>
  );
};

Object.assign(window, { TalkhisTab });
