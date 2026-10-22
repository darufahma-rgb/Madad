import React, { useState, useEffect, useMemo, useRef, useContext, createContext } from 'react';
import ReferenceShelf, { REFERENCE_SUBJECTS } from '../components/ReferenceShelf.jsx';
/* Talqeeh Ilmi Index — الفهرس العلمي الذكي.
   Unggah/pilih PDF muqarrar → teks per halaman (pdf.js; halaman scan dibaca OCR AI Partner) → diunggah ke server →
   dianalisis per beberapa halaman (server: api/_lib/ai-partner/ilmi-index.js) → daftar pembahasan, kutipan, dan sumber
   dengan nomor halaman PDF yang sudah dicek ke teks aslinya. Hasil tersimpan per sidik jari file; PDF yang sama tidak
   dianalisis ulang.
   Tiga jenis halaman dibedakan tegas di semua tampilan: halaman PDF (urutan fisik file, 1 = sampul), halaman cetak
   muqarrar (hanya bila nomornya terbaca andal), dan halaman kitab sumber (hanya bila tertulis, selalu "belum diverifikasi"). */

const ilmi = (op, payload = {}) => aiCall('ilmi', { op, ...payload });
const ilmiView = (op, payload = {}) => aiCall('ilmi-view', { op, ...payload });
const IlmiApi = createContext({ ilmi, ilmiView, aiCall });
const adminLibraryCall = async (action, payload = {}) => {
  try {
    const r = await fetch(`/api/ai-partner?action=${action}`, { method: 'POST', headers: {
      'Content-Type': 'application/json', 'x-admin-token': sessionStorage.getItem('talqee_admin_token') || '',
    }, body: JSON.stringify(payload) });
    return await r.json();
  } catch { return { ok: false, error: 'Tidak bisa terhubung ke pustaka rujukan.' }; }
};
const adminLibraryApi = {
  ilmi: (op, payload = {}) => adminLibraryCall('admin-reference-ilmi', { op, ...payload }),
  ilmiView: (op, payload = {}) => adminLibraryCall('admin-reference-view', { op, ...payload }),
  aiCall: (action, payload) => adminLibraryCall(`admin-reference-${action}`, payload),
};

const MAX_PAGES = 400;
const MAX_MB = 150;
const UPLOAD_PAGES = 20;
const UPLOAD_CHARS = 1_500_000;
const CHUNK_WORKERS = 3;

const LEVEL_LABEL = {
  kitab: { ar: 'كتاب', id: 'Kitab' }, muqaddimah: { ar: 'مقدمة', id: 'Muqaddimah' }, bab: { ar: 'باب', id: 'Bab' },
  fasl: { ar: 'فصل', id: 'Fasal' }, mabhath: { ar: 'مبحث', id: 'Mabhats' }, matlab: { ar: 'مطلب', id: 'Mathlab' },
  masalah: { ar: 'مسألة', id: 'Masalah' }, subtopic: { ar: 'موضوع', id: 'Subtopik' },
};
const KIND_LABEL = {
  scholar_quote: 'Perkataan ulama', madhhab_opinion: 'Pendapat mazhab', ayah: 'Ayat', hadith: 'Hadis',
  book_ref: 'Rujukan kitab', ijma: "Ijma'", qiyas: 'Qiyas',
};
const ATTRIBUTION_LABEL = { explicit: 'Atribusi eksplisit', inferred: 'Atribusi inferensi', unknown: 'Atribusi belum diketahui' };

/* ── Normalisasi Arab untuk pencarian (sama dengan server: harakat dibuang, bentuk huruf disamakan) ── */
const MARKS_RE = /[ؐ-ًؚ-ٰٟـۖ-ۭ]/g;
const FOLD = { 'إ': 'ا', 'أ': 'ا', 'آ': 'ا', 'ٱ': 'ا', 'ى': 'ي', 'ی': 'ي', 'ئ': 'ي', 'ة': 'ه', 'ؤ': 'و', 'ک': 'ك' };
const norm = (s) => String(s || '').normalize('NFKC').replace(MARKS_RE, '').replace(/[إأآٱىیئةؤک]/g, c => FOLD[c])
  .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x660)).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

/* ── PDF tersimpan di perangkat (IndexedDB), supaya hasil yang dibuka lagi tetap bisa menampilkan halaman aslinya.
   Gagal menyimpan (mode privat, kuota penuh) tidak apa-apa: penampil memakai teks halaman yang tersimpan di server. */
const idb = () => new Promise((resolve, reject) => {
  const r = indexedDB.open('talqeeh-ilmi', 1);
  r.onupgradeneeded = () => r.result.createObjectStore('pdf');
  r.onsuccess = () => resolve(r.result);
  r.onerror = () => reject(r.error);
});
const savePdfLocal = async (hash, file) => {
  try {
    const db = await idb();
    await new Promise((res, rej) => { const tx = db.transaction('pdf', 'readwrite'); tx.objectStore('pdf').put(file, hash); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
  } catch {}
};
const loadPdfLocal = async (hash) => {
  try {
    const db = await idb();
    return await new Promise((res) => { const q = db.transaction('pdf').objectStore('pdf').get(hash); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null); });
  } catch { return null; }
};
const deletePdfLocal = async (hash) => {
  try { const db = await idb(); db.transaction('pdf', 'readwrite').objectStore('pdf').delete(hash); } catch {}
};

/* Teks Arab yang teracak walau pdf.js menandainya "ok/fixed" (mis. ligatur font Traditional Arabic yang salah urut:
   "ا ببالمياه"، "ءلمستعمل"، atau satu halaman terbalik "ةساجنلا"). Evidence tidak mungkin cocok dengan teks seperti
   ini, jadi halamannya dibaca ulang lewat OCR dari gambarnya. Penanda: kata yang mustahil dalam ejaan Arab (satu huruf
   selain و/ب, diawali ء/ة/ى) dan sedikitnya kata berawalan "ال". Diukur pada muqarrar uji: halaman baik ≤ 0,04,
   halaman teracak 0,10–0,25. */
const looksScrambledArabic = (text) => {
  const words = String(text || '').replace(/[ً-ْٰـ]/g, '').match(/[ء-ي]+/g) || [];
  if (words.length < 20) return false;
  const bad = words.filter(w => (w.length === 1 && w !== 'و' && w !== 'ب') || /^[ءةى]/.test(w)).length;
  const al = words.filter(w => /^(?:وال|فال|بال|كال|لل|ال)/.test(w)).length;
  return bad / words.length >= 0.07 || (words.length >= 30 && al / words.length < 0.1);
};

/* ── Membuka PDF dengan pesan yang jelas untuk PDF terenkripsi / rusak / kosong ── */
const openPdfChecked = async (file) => {
  const name = String(file?.name || '');
  if (!file || (!/\.pdf$/i.test(name) && file.type !== 'application/pdf')) throw new Error('Pilih file PDF (.pdf).');
  if (file.size === 0) throw new Error('File PDF ini kosong (0 byte).');
  if (file.size > MAX_MB * 1024 * 1024) throw new Error(`PDF ini ${Math.round(file.size / 1048576)}MB, maksimal ${MAX_MB}MB. Kompres dulu (iLovePDF/Smallpdf → "Compress PDF") atau pisahkan per bab.`);
  if (typeof window.openPdf !== 'function') throw new Error('Pembaca PDF belum siap. Muat ulang halaman lalu coba lagi.');
  let pdf;
  try {
    pdf = await window.openPdf(file);
  } catch (err) {
    if (err?.name === 'PasswordException') throw new Error('PDF ini terkunci password (terenkripsi). Buka kuncinya dulu (mis. "Print → Save as PDF" setelah dibuka dengan password), lalu unggah lagi.');
    if (err?.name === 'InvalidPDFException' || err?.name === 'FormatError') throw new Error('File ini rusak atau bukan PDF yang valid. Coba unduh/ekspor ulang PDF-nya.');
    throw new Error('PDF tidak bisa dibuka: ' + (err?.message || 'kesalahan tidak dikenal'));
  }
  if (!pdf.numPages) throw new Error('PDF ini tidak punya halaman.');
  if (pdf.numPages > MAX_PAGES) throw new Error(`PDF ini ${pdf.numPages} halaman; Ilmi Index maksimal ${MAX_PAGES} halaman. Pisahkan per bab lalu unggah lagi.`);
  return pdf;
};

/* ── Badge ── */
const Badge = ({ tone = 'default', children, title }) => {
  const cls = {
    default: 'bg-white/[0.05] text-ink-muted border-white/10',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    gold: 'bg-gold-500/10 text-gold-200 border-gold-500/25',
    warn: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
    sky: 'bg-sky-500/10 text-sky-300 border-sky-500/25',
  }[tone];
  return <span title={title} className={`inline-flex items-center gap-1 h-6 px-2 rounded-md border text-[11px] whitespace-nowrap ${cls}`}>{children}</span>;
};

const printedLabel = (map, n) => {
  const p = map?.[n];
  if (!p) return null;
  return `${p.p}${p.s === 'inferred' ? '*' : ''}`;
};
// "PDF 12–15 · cetak 10–13" — halaman cetak hanya bila dikenali.
const PageBadges = ({ from, to, printedMap }) => {
  const a = printedLabel(printedMap, from);
  const b = to && to !== from ? printedLabel(printedMap, to) : null;
  return (
    <>
      <Badge tone="emerald" title="Halaman PDF = urutan halaman di file (1 = sampul)">PDF {from}{to && to !== from ? `–${to}` : ''}</Badge>
      {a && <Badge tone="gold" title="Halaman cetak muqarrar (nomor yang tercetak di halaman). * = diperkirakan dari halaman sekitarnya">cetak {a}{b ? `–${b}` : ''}</Badge>}
    </>
  );
};
const VerifyBadge = ({ v }) => v === 'verified'
  ? <Badge tone="emerald" title="Evidence ditemukan di teks asli halaman ini"><Icon name="check" className="w-3 h-3"/> Terverifikasi</Badge>
  : <Badge tone="warn" title="Evidence dari AI tidak cocok persis dengan teks halaman. Periksa sendiri di PDF."><Icon name="alert" className="w-3 h-3"/> Perlu diperiksa</Badge>;

/* ── Penampil PDF (Page Locator) ──
   Halaman PDF dirender pdf.js; teks evidence ditandai bila posisinya bisa ditemukan di lapisan teks PDF. Kalau tidak
   (halaman scan, urutan teks khusus) atau PDF-nya tidak ada di perangkat ini, ditampilkan teks halaman yang tersimpan
   dengan potongan evidence disorot. */
const findItemRects = (items, snippet) => {
  const want = norm(snippet).replace(/ /g, '');
  if (want.length < 6) return null;
  for (const reverse of [false, true]) {
    let hay = '';
    const owner = [];
    items.forEach((it, i) => {
      if (typeof it.str !== 'string') return;
      const s = norm(reverse ? [...it.str].reverse().join('') : it.str).replace(/ /g, '');
      for (const ch of s) { hay += ch; owner.push(i); }
    });
    // Cocokkan potongan awal yang cukup panjang (evidence panjang bisa terpotong baris).
    for (const len of [want.length, Math.min(want.length, 40), Math.min(want.length, 20)]) {
      const at = hay.indexOf(want.slice(0, len));
      if (at >= 0) {
        const used = new Set(owner.slice(at, at + Math.min(want.length, hay.length - at)));
        return [...used].map(i => items[i]);
      }
    }
  }
  return null;
};

const PdfLocator = ({ doc, target, pdf, onPickFile, onClose }) => {
  const { ilmiView } = useContext(IlmiApi);
  const [page, setPage] = useState(target.page);
  const [mode, setMode] = useState(pdf ? 'pdf' : 'text');
  const [rects, setRects] = useState(null);
  const [found, setFound] = useState(null);
  const [text, setText] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const canvasRef = useRef(null);
  const boxRef = useRef(null);
  const onTarget = page === target.page;

  useEffect(() => { setPage(target.page); }, [target]);
  useEffect(() => { if (pdf) setMode('pdf'); }, [pdf]);

  // Render halaman PDF + tanda evidence.
  useEffect(() => {
    if (mode !== 'pdf' || !pdf) return;
    let alive = true;
    (async () => {
      setBusy(true); setErr(''); setRects(null); setFound(null);
      try {
        const p = await pdf.getPage(page);
        // Lebar area dikurangi padding & scrollbar supaya halaman tidak memicu gulir ke samping.
        const width = Math.max(240, Math.min(900, (boxRef.current?.clientWidth || 600) - 40));
        const base = p.getViewport({ scale: 1 });
        const viewport = p.getViewport({ scale: width / base.width });
        const canvas = canvasRef.current;
        if (!canvas || !alive) return;
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = viewport.width * dpr; canvas.height = viewport.height * dpr;
        canvas.style.width = `${viewport.width}px`; canvas.style.height = `${viewport.height}px`;
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        await p.render({ canvasContext: ctx, viewport }).promise;
        if (!alive) return;
        if (onTarget && target.snippet) {
          const tc = await p.getTextContent();
          const hits = findItemRects(tc.items, target.snippet);
          if (hits?.length) {
            setRects(hits.map(it => {
              const h = Math.hypot(it.transform[2], it.transform[3]) || it.height || 10;
              const [x1, y1, x2, y2] = viewport.convertToViewportRectangle([it.transform[4], it.transform[5] - h * 0.25, it.transform[4] + (it.width || 0), it.transform[5] + h * 0.95]);
              return { left: Math.min(x1, x2), top: Math.min(y1, y2), width: Math.abs(x2 - x1), height: Math.abs(y2 - y1) };
            }));
            setFound(true);
          } else setFound(false);
        }
      } catch (e) {
        if (alive) setErr('Halaman PDF gagal ditampilkan: ' + (e?.message || ''));
      } finally {
        if (alive) setBusy(false);
      }
    })();
    return () => { alive = false; };
  }, [mode, pdf, page, target]);

  // Teks halaman yang tersimpan di server.
  useEffect(() => {
    if (mode !== 'text') return;
    let alive = true;
    setBusy(true); setErr(''); setText(null);
    ilmiView('page', { document_id: doc.id, page }).then(d => {
      if (!alive) return;
      setBusy(false);
      if (!d.ok) { setErr(d.error || 'Teks halaman gagal dimuat.'); return; }
      setText(d.page);
    });
    return () => { alive = false; };
  }, [mode, page, doc.id]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const printed = doc.printed_map?.[page];
  const highlighted = useMemo(() => {
    if (!text?.text) return null;
    const t = text.text;
    const s = onTarget ? target.charStart : null, e = onTarget ? target.charEnd : null;
    if (Number.isInteger(s) && Number.isInteger(e) && s >= 0 && e <= t.length && e > s) {
      return <>{t.slice(0, s)}<mark className="rounded px-0.5" style={{ background: 'rgba(201,168,106,0.35)', color: 'inherit' }} id="ilmi-mark">{t.slice(s, e)}</mark>{t.slice(e)}</>;
    }
    return t;
  }, [text, target, onTarget]);
  useEffect(() => { if (highlighted) setTimeout(() => document.getElementById('ilmi-mark')?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 50); }, [highlighted]);

  return (
    <div className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-sm flex items-stretch md:items-center justify-center md:p-6" onClick={onClose}>
      <div className="w-full md:max-w-4xl bg-[#111] md:rounded-2xl border border-white/10 flex flex-col max-h-full md:max-h-[92vh]" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Penampil PDF">
        <div className="flex items-center gap-2 px-3 md:px-4 py-3 border-b border-white/10 flex-wrap">
          <div className="flex items-center gap-1">
            <button className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center disabled:opacity-30" disabled={page <= 1} onClick={() => setPage(p => p - 1)} aria-label="Halaman sebelumnya"><Icon name="chevronLeft" className="w-4 h-4"/></button>
            <div className="text-sm text-ink tabular-nums">Halaman PDF <b>{page}</b> <span className="text-ink-soft">/ {doc.num_pages}</span></div>
            <button className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center disabled:opacity-30" disabled={page >= doc.num_pages} onClick={() => setPage(p => p + 1)} aria-label="Halaman berikutnya"><Icon name="chevronRight" className="w-4 h-4"/></button>
          </div>
          {printed
            ? <Badge tone="gold" title={printed.s === 'inferred' ? 'Diperkirakan dari nomor halaman di sekitarnya' : 'Nomor tercetak di halaman ini'}>hlm. cetak {printed.p}{printed.s === 'inferred' ? ' (perkiraan)' : ''}</Badge>
            : <Badge title="Nomor halaman cetak tidak terbaca dengan andal di halaman ini">hlm. cetak: tidak dikenali</Badge>}
          <div className="ml-auto flex items-center gap-1">
            {pdf && <button className={`h-8 px-2.5 rounded-lg text-xs ${mode === 'pdf' ? 'bg-emerald-500/15 text-emerald-200' : 'text-ink-muted hover:bg-white/5'}`} onClick={() => setMode('pdf')}>PDF</button>}
            <button className={`h-8 px-2.5 rounded-lg text-xs ${mode === 'text' ? 'bg-emerald-500/15 text-emerald-200' : 'text-ink-muted hover:bg-white/5'}`} onClick={() => setMode('text')}>Teks</button>
            <button className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center" onClick={onClose} aria-label="Tutup"><Icon name="x" className="w-4 h-4"/></button>
          </div>
        </div>

        {onTarget && target.snippet && (
          <div className="px-3 md:px-4 py-2.5 border-b border-white/10 bg-gold-500/[0.05]">
            <div className="text-[11px] text-gold-200 mb-1">
              {target.label || 'Evidence'}{mode === 'pdf' && found === false ? ' — posisi persisnya tidak bisa ditandai di PDF ini (halaman scan atau urutan teks khusus); cocokkan dengan teks berikut:' : ''}
            </div>
            <div className="arabic text-[15px] text-ink" dir="rtl">{target.snippet}</div>
          </div>
        )}

        <div ref={boxRef} className="flex-1 overflow-auto p-2 md:p-4">
          {err && <div className="text-sm text-red-300 p-3">{err}</div>}
          {mode === 'pdf' && pdf && (
            <div className="relative mx-auto" style={{ width: 'fit-content' }}>
              <canvas ref={canvasRef} className="block rounded bg-white"/>
              {rects?.map((r, i) => (
                <div key={i} className="absolute pointer-events-none rounded-sm" style={{ ...r, background: 'rgba(201,168,106,0.38)', outline: '1px solid rgba(201,168,106,0.8)' }}/>
              ))}
              {busy && <div className="absolute inset-0 flex items-center justify-center text-sm text-ink-soft bg-black/30">Memuat halaman…</div>}
            </div>
          )}
          {mode === 'text' && (
            <div className="max-w-3xl mx-auto">
              {!pdf && (
                <div className="text-xs text-ink-soft mb-3 flex flex-wrap items-center gap-2">
                  File PDF-nya tidak ada di perangkat ini, jadi yang tampil adalah teks halaman yang tersimpan.
                  <button className="btn-subtle text-xs" onClick={onPickFile}><Icon name="upload" className="w-3.5 h-3.5"/> Buka file PDF-nya</button>
                </div>
              )}
              {busy && <Skeleton lines={8}/>}
              {text && (text.text
                ? <div className="arabic text-[17px] text-ink whitespace-pre-wrap leading-[2.1]" dir="rtl">{highlighted}</div>
                : <div className="text-sm text-ink-soft">Halaman ini tidak punya teks yang terbaca ({text.status === 'unread' ? 'halaman scan yang belum dibaca' : 'kosong'}).</div>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Daftar Pembahasan (pohon) ── */
const EntryNode = ({ node, childrenOf, depth, open, toggle, visible, citeCountOf, printedMap, onLocate, evidenceOf }) => {
  const kids = (childrenOf.get(node.id) || []).filter(k => !visible || visible.has(k.id));
  const citeCount = citeCountOf(node.id);
  const isOpen = open.has(node.id) || (visible && kids.length > 0);
  const lvl = LEVEL_LABEL[node.level] || LEVEL_LABEL.subtopic;
  const ev = evidenceOf(node.id)[0];
  return (
    <li>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] px-3 py-2.5 mb-1.5" style={{ marginInlineStart: Math.min(depth, 5) * 14 }}>
        <div className="flex items-start gap-2">
          <button onClick={() => kids.length && toggle(node.id)} aria-label={isOpen ? 'Tutup' : 'Buka'} className={`mt-1 w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${kids.length ? 'hover:bg-white/10 text-ink-muted' : 'opacity-0 pointer-events-none'}`}>
            <Icon name={isOpen ? 'chevronDown' : 'chevronRight'} className="w-3.5 h-3.5"/>
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 justify-between flex-wrap">
              <div className="arabic text-[17px] text-ink font-semibold leading-relaxed min-w-0" dir="rtl" style={{ flex: '1 1 220px' }}>
                <span className="text-gold-300 font-normal">{lvl.ar}: </span>{node.title_ar}
              </div>
            </div>
            {node.summary_id && <p className="text-[13px] text-ink-muted leading-relaxed mt-1">{node.summary_id}</p>}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <Badge>{lvl.id}</Badge>
              <Badge tone={node.title_source === 'original' ? 'sky' : 'default'} title={node.title_source === 'original' ? 'Judul ini tertulis di muqarrar' : 'Judul dirumuskan AI (tidak tertulis persis di muqarrar)'}>
                {node.title_source === 'original' ? 'Judul asli' : 'Judul buatan AI'}
              </Badge>
              <PageBadges from={node.page_start} to={node.page_end} printedMap={printedMap}/>
              <VerifyBadge v={node.verification}/>
              <Badge title="Keyakinan AI setelah dicek ke teks">{Math.round(node.confidence * 100)}%</Badge>
              {citeCount > 0 && <Badge tone="gold">{citeCount} kutipan</Badge>}
              <button onClick={() => onLocate({ page: ev?.page_no || node.page_start, snippet: ev?.snippet || node.title_ar, charStart: ev?.char_start, charEnd: ev?.char_end, label: `Awal pembahasan · ${lvl.id}` })}
                className="ml-auto h-7 px-2.5 rounded-lg text-xs text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 inline-flex items-center gap-1">
                <Icon name="bookOpen" className="w-3.5 h-3.5"/> Lihat di PDF
              </button>
            </div>
          </div>
        </div>
      </div>
      {isOpen && kids.length > 0 && (
        <ul>{kids.map(k => <EntryNode key={k.id} node={k} childrenOf={childrenOf} depth={depth + 1} open={open} toggle={toggle} visible={visible} citeCountOf={citeCountOf} printedMap={printedMap} onLocate={onLocate} evidenceOf={evidenceOf}/>)}</ul>
      )}
    </li>
  );
};

/* ── Kartu kutipan ── */
const CitationCard = ({ c, entryTitle, source, printedMap, evidenceOf, onLocate }) => {
  const occ = evidenceOf(c.id);
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <Badge tone="gold">{KIND_LABEL[c.kind] || c.kind}</Badge>
        <Badge tone={c.attribution === 'explicit' ? 'emerald' : c.attribution === 'inferred' ? 'sky' : 'default'}>{ATTRIBUTION_LABEL[c.attribution]}</Badge>
        <VerifyBadge v={c.verification}/>
        {c.occurrences > 1 && <Badge title="Kutipan yang sama muncul di beberapa tempat">muncul {c.occurrences}×</Badge>}
      </div>
      <div className="arabic text-[17px] text-ink leading-[2]" dir="rtl">{c.quote_ar}</div>
      <dl className="mt-2 grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 text-[12.5px]">
        {c.scholar && <><dt className="text-ink-soft">Ulama</dt><dd className="arabic text-ink text-[14px]" dir="rtl" style={{ textAlign: 'start' }}>{c.scholar}</dd></>}
        {c.madhhab && <><dt className="text-ink-soft">Mazhab</dt><dd className="arabic text-ink text-[14px]" dir="rtl" style={{ textAlign: 'start' }}>{c.madhhab}</dd></>}
        {c.book && <><dt className="text-ink-soft">Kitab</dt><dd className="text-ink"><span className="arabic text-[14px]" dir="rtl">{c.book}</span>{source?.author && <span className="text-ink-muted"> · <span className="arabic" dir="rtl">{source.author}</span></span>}</dd></>}
        {c.book && (
          <>
            <dt className="text-ink-soft">Hal. kitab sumber</dt>
            <dd className="text-ink-muted">
              {c.source_volume || c.source_page
                ? <>{c.source_volume ? `jilid ${c.source_volume}` : ''}{c.source_volume && c.source_page ? ', ' : ''}{c.source_page ? `hal. ${c.source_page}` : ''} <span className="text-ink-soft">(sebagaimana tertulis di muqarrar)</span></>
                : 'tidak disebut di muqarrar'}
              {' · '}<span className="text-amber-300">Belum diverifikasi ke kitab aslinya</span>
            </dd>
          </>
        )}
        {!c.scholar && !c.book && !c.madhhab && <><dt className="text-ink-soft">Sumber</dt><dd className="text-ink-muted">Tidak disebut di dokumen — tidak ditebak.</dd></>}
        {entryTitle && <><dt className="text-ink-soft">Pembahasan</dt><dd className="arabic text-ink-muted text-[14px]" dir="rtl" style={{ textAlign: 'start' }}>{entryTitle}</dd></>}
      </dl>
      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
        {occ.slice(0, 6).map((o, i) => (
          <button key={i} onClick={() => onLocate({ page: o.page_no, snippet: o.snippet, charStart: o.char_start, charEnd: o.char_end, label: KIND_LABEL[c.kind] })}
            className="h-7 px-2.5 rounded-lg text-xs text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 inline-flex items-center gap-1">
            <Icon name="bookOpen" className="w-3.5 h-3.5"/> PDF {o.page_no}{printedLabel(printedMap, o.page_no) ? ` · cetak ${printedLabel(printedMap, o.page_no)}` : ''}
          </button>
        ))}
        {!occ.length && <PageBadges from={c.page_no} printedMap={printedMap}/>}
      </div>
    </div>
  );
};

/* ── Tanya Muqarrar ── */
const AnswerText = ({ text, onPage }) => {
  const parts = String(text || '').split(/(\[hal\. \d+\])/g);
  return (
    <div className="text-sm text-ink leading-relaxed whitespace-pre-wrap" dir="auto">
      {parts.map((p, i) => {
        const m = p.match(/^\[hal\. (\d+)\]$/);
        return m
          ? <button key={i} onClick={() => onPage(Number(m[1]))} className="mx-0.5 px-1.5 rounded bg-emerald-500/15 text-emerald-200 text-xs align-middle hover:bg-emerald-500/25">hal. PDF {m[1]}</button>
          : <span key={i}>{p}</span>;
      })}
    </div>
  );
};

const AskPanel = ({ doc, onLocate, readOnly }) => {
  const { ilmi } = useContext(IlmiApi);
  const adminLibrary = useContext(IlmiApi) === adminLibraryApi;
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const ask = async () => {
    const question = q.trim();
    if (question.length < 3 || busy) return;
    setBusy(true);
    const d = await ilmi('ask', { document_id: doc.id, question });
    setBusy(false);
    if (!d.ok) { setItems(x => [...x, { question, error: d.error || 'Gagal menjawab.', upgrade: d.upgrade }]); return; }
    setQ('');
    setItems(x => [...x, { question, ...d }]);
  };
  return (
    <div className="space-y-4">
      <div className="card-glass p-4">
        <p className="text-xs text-ink-soft mb-3 leading-relaxed">
          Jawaban HANYA dari teks halaman muqarrar ini yang tersimpan, dengan rujukan halaman PDF yang bisa diklik. Kalau tidak ada di muqarrar,
          jawabannya "tidak ditemukan" — AI tidak menjawab dari hafalannya. Memakai jatah pesan tutor.
        </p>
        {adminLibrary ? <p className="text-sm text-emerald-200">Setelah kitab diaktifkan, uji pertanyaannya melalui Tanya AI atau Tutor untuk memeriksa jawaban dari pustaka bersama.</p> : readOnly ? <UpgradeCard compact title="Tanya Muqarrar khusus pelanggan" message="Berlangganan AI Partner untuk bertanya langsung ke isi muqarrarmu."/> : (
          <div className="flex gap-2">
            <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) ask(); }} dir="auto" maxLength={600}
              placeholder="Mis. Apa pendapat Hanafiyah tentang air musta'mal? / ما حكم الماء المستعمل؟"
              className="flex-1 min-w-0 bg-white/[0.04] border border-white/10 rounded-xl px-3 h-11 text-ink placeholder-ink-soft outline-none focus:border-emerald-500/40" style={{ fontSize: 16 }}/>
            <button onClick={ask} disabled={busy || q.trim().length < 3} className="btn btn-primary h-11 px-4 disabled:opacity-50">{busy ? 'Mencari…' : 'Tanya'}</button>
          </div>
        )}
      </div>
      {items.slice().reverse().map((it, i) => (
        <div key={items.length - i} className="card-glass p-4">
          <div className="text-xs text-ink-soft mb-2" dir="auto">Pertanyaan: <span className="text-ink-muted">{it.question}</span></div>
          {it.error ? <div className="text-sm text-red-300">{it.error}</div> : (
            <>
              {it.not_found && <Badge tone="warn"><Icon name="alert" className="w-3 h-3"/> Tidak ditemukan di muqarrar</Badge>}
              <div className="mt-2"><AnswerText text={it.answer} onPage={(p) => { const r = it.refs.find(x => x.page === p); onLocate({ page: p, snippet: r?.excerpt, label: 'Rujukan jawaban' }); }}/></div>
              {it.refs?.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-[11px] text-ink-soft">{it.not_found ? 'Halaman yang sudah dicek:' : 'Bukti yang dipakai (teks asli muqarrar, status: terverifikasi ada di halaman ini):'}</div>
                  {it.refs.map(r => (
                    <button key={r.page} onClick={() => onLocate({ page: r.page, snippet: r.excerpt, label: 'Rujukan jawaban' })} className="w-full text-start rounded-lg border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] p-2.5">
                      <div className="flex gap-1.5 mb-1"><Badge tone="emerald">PDF {r.page}</Badge>{r.printed && <Badge tone="gold">cetak {r.printed.p}{r.printed.s === 'inferred' ? '*' : ''}</Badge>}</div>
                      <div className="arabic text-[14px] text-ink-muted line-clamp-2" dir="rtl">{r.excerpt}</div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

/* ── Metadata edisi (Source Tracker) ── */
const EditionForm = ({ doc, onSaved, readOnly }) => {
  const { ilmi } = useContext(IlmiApi);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(doc.edition || {});
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const fields = [['title', 'Judul kitab/muqarrar'], ['author', 'Penulis/duktur'], ['subject', 'Bidang ilmu'], ['madhhab', 'Mazhab (jika dinyatakan kitab)'], ['volume', 'Jilid'], ['edition', 'Cetakan/edisi'], ['year', 'Tahun'], ['publisher', 'Penerbit'], ['faculty', 'Fakultas/tingkat'], ['note', 'Catatan']];
  const save = async () => {
    setBusy(true);
    const d = await ilmi('edition', { document_id: doc.id, edition: form });
    setBusy(false);
    if (!d.ok) { toast.push(d.error || 'Gagal menyimpan.'); return; }
    onSaved(d.edition); setOpen(false); toast.push('Metadata edisi tersimpan.');
  };
  const filled = Object.entries(doc.edition || {}).filter(([, v]) => v);
  return (
    <div className="card-glass p-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-gold-400">Metadata edisi muqarrar</div>
        <span className="text-[11px] text-ink-soft">diisi pengguna — dipakai membedakan halaman cetak antar-edisi</span>
        {!readOnly && <button className="ml-auto btn-subtle text-xs" onClick={() => setOpen(!open)}>{open ? 'Tutup' : filled.length ? 'Ubah' : 'Isi'}</button>}
      </div>
      {!open && (filled.length
        ? <div className="mt-2 flex flex-wrap gap-1.5">{filled.map(([k, v]) => <Badge key={k}>{fields.find(f => f[0] === k)?.[1]}: <span dir="auto">{v}</span></Badge>)}</div>
        : <div className="mt-2 text-xs text-ink-soft">Belum diisi.</div>)}
      {open && (
        <div className="mt-3 grid sm:grid-cols-2 gap-2">
          {fields.map(([k, label]) => (
            <label key={k} className={k === 'note' ? 'sm:col-span-2' : ''}>
              <span className="text-[11px] text-ink-muted">{label}</span>
              {k === 'subject' ? <select aria-label={label} value={form[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })} className="w-full bg-[#131a17] border border-white/10 rounded-lg px-3 h-10 text-ink" style={{ fontSize: 16 }}><option value="">Pilih bidang ilmu</option>{Object.entries(REFERENCE_SUBJECTS).map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select> : <input aria-label={label} value={form[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })} dir="auto" maxLength={k === 'note' ? 400 : 160}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 h-10 text-ink outline-none focus:border-emerald-500/40" style={{ fontSize: 16 }}/>}
            </label>
          ))}
          <div className="sm:col-span-2"><button className="btn btn-primary text-sm" disabled={busy} onClick={save}>{busy ? 'Menyimpan…' : 'Simpan'}</button></div>
        </div>
      )}
    </div>
  );
};

/* ── Hasil analisis ── */
const IlmiResult = ({ data, pdf, onPickFile, onReanalyze, readOnly, onEdition }) => {
  const { document: doc, entries, citations, sources, evidence } = data;
  const [tab, setTab] = useState('fihris');
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('');
  const [verify, setVerify] = useState('');
  const [pageFrom, setPageFrom] = useState('');
  const [pageTo, setPageTo] = useState('');
  const [open, setOpen] = useState(() => new Set(entries.filter(e => !e.parent_id).map(e => e.id)));
  const [locate, setLocate] = useState(null);

  const evMap = useMemo(() => {
    const m = new Map();
    for (const e of evidence) { if (!m.has(e.owner_id)) m.set(e.owner_id, []); m.get(e.owner_id).push(e); }
    return m;
  }, [evidence]);
  const evidenceOf = (id) => evMap.get(id) || [];
  const byId = useMemo(() => new Map(entries.map(e => [e.id, e])), [entries]);
  const childrenOf = useMemo(() => {
    const m = new Map();
    for (const e of entries) { const k = e.parent_id || 'root'; if (!m.has(k)) m.set(k, []); m.get(k).push(e); }
    return m;
  }, [entries]);
  const sourceById = useMemo(() => new Map(sources.map(s => [s.id, s])), [sources]);
  const citeCount = useMemo(() => citations.reduce((m, c) => (c.entry_id ? m.set(c.entry_id, (m.get(c.entry_id) || 0) + 1) : m), new Map()), [citations]);

  const pf = Number(pageFrom) || 0, pt = Number(pageTo) || 0;
  const pageOk = (a, b = a) => (!pf || b >= pf) && (!pt || a <= pt);
  const q = norm(query);
  const textHit = (...vals) => !q || vals.some(v => norm(v).includes(q));
  const filtering = !!(q || verify || pf || pt);

  // Pembahasan yang cocok + semua induknya (supaya tetap tampil sebagai pohon).
  const visible = useMemo(() => {
    if (!filtering) return null;
    const set = new Set();
    for (const e of entries) {
      if (!pageOk(e.page_start, e.page_end) || (verify && e.verification !== verify)) continue;
      const cites = citations.filter(c => c.entry_id === e.id);
      if (!textHit(e.title_ar, e.summary_id, ...cites.flatMap(c => [c.scholar, c.book, c.madhhab]))) continue;
      for (let x = e; x; x = x.parent_id ? byId.get(x.parent_id) : null) set.add(x.id);
    }
    return set;
  }, [entries, citations, q, verify, pf, pt]);

  const shownCitations = citations.filter(c =>
    (!kind || c.kind === kind) && (!verify || c.verification === verify) && pageOk(c.page_no)
    && textHit(c.quote_ar, c.scholar, c.book, c.madhhab, byId.get(c.entry_id)?.title_ar));
  const roots = (childrenOf.get('root') || []).filter(e => !visible || visible.has(e.id));
  const toggle = (id) => setOpen(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const st = doc.stats || {};
  const segs = doc.printed_segments || [];

  return (
    <div className="space-y-4">
      <div className="card-glass p-4 md:p-5">
        <div className="flex items-start gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="font-display text-lg md:text-xl font-semibold text-ink break-words" dir="auto">{doc.title}</div>
            <div className="text-xs text-ink-soft mt-0.5">{doc.file_name} · {doc.num_pages} halaman PDF · {doc.pdf_kind === 'scan' ? 'PDF scan (dibaca OCR)' : doc.pdf_kind === 'mixed' ? 'PDF campuran teks & scan' : 'PDF berteks'}</div>
          </div>
          {doc.status === 'partial' && <Badge tone="warn" title={`Halaman yang gagal dianalisis: ${(st.failed_pages || []).map(([a, b]) => a === b ? a : `${a}–${b}`).join(', ')}`}><Icon name="alert" className="w-3 h-3"/> Sebagian halaman gagal dianalisis</Badge>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          {[['Pembahasan', st.entries ?? entries.length], ['Kutipan', st.citations ?? citations.length], ['Kitab disebut', st.sources ?? sources.length], ['Perlu diperiksa', (st.entries_review || 0) + (st.citations_review || 0)]].map(([l, v]) => (
            <div key={l} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-2.5"><div className="text-lg font-semibold text-ink tabular-nums">{v}</div><div className="text-[11px] text-ink-soft">{l}</div></div>
          ))}
        </div>
        <div className="text-[11px] text-ink-soft mt-3 leading-relaxed space-y-1">
          <div>
            <b className="text-ink-muted">Halaman cetak:</b>{' '}
            {segs.length
              ? segs.map((s, i) => <span key={i}>{i ? '; ' : ''}PDF {s.from}–{s.to} = cetak {s.printed_from}–{s.printed_to} (selisih {s.offset})</span>)
              : 'nomor halaman cetak tidak terbaca dengan andal, jadi hanya halaman PDF yang ditampilkan.'}
            {' '}* = diperkirakan dari halaman di sekitarnya.
          </div>
          <div>
            <b className="text-ink-muted">Pemeriksaan:</b> {st.citations_dropped || 0} kutipan dari AI dibuang karena tidak ada di teks, {st.attributions_removed || 0} nama ulama/kitab/halaman sumber dibuang karena tidak tertulis, {st.relocated || 0} nomor halaman dibetulkan ke tempat evidence-nya.
            {Number.isFinite(st.cost_usd) && st.cost_usd > 0 ? ` Biaya AI ±$${st.cost_usd.toFixed(3)} (${((st.tokens_in || 0) + (st.tokens_out || 0)).toLocaleString('id-ID')} token).` : ''}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {!pdf && <button className="btn-subtle text-xs" onClick={onPickFile}><Icon name="upload" className="w-3.5 h-3.5"/> Buka file PDF-nya untuk melihat halaman asli</button>}
          {!readOnly && onReanalyze && <button className="btn-ghost btn text-xs h-8 px-3" onClick={onReanalyze}><Icon name="refresh" className="w-3.5 h-3.5"/> Analisis ulang</button>}
        </div>
      </div>

      <EditionForm doc={doc} onSaved={onEdition} readOnly={readOnly}/>

      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-x-auto">
        {[['fihris', 'Daftar Pembahasan', 'list'], ['sumber', 'Sumber Ilmu', 'quote'], ['tanya', 'Tanya Muqarrar', 'messageSquare']].map(([k, l, ic]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex-1 min-w-[120px] h-10 rounded-lg text-sm inline-flex items-center justify-center gap-1.5 ${tab === k ? 'bg-emerald-500/15 text-emerald-100 font-medium' : 'text-ink-muted hover:text-ink'}`}>
            <Icon name={ic} className="w-4 h-4"/> {l}
          </button>
        ))}
      </div>

      {tab !== 'tanya' && (
        <div className="card-glass p-3 flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Icon name="search" className="w-4 h-4 absolute top-1/2 -translate-y-1/2 text-ink-soft" style={{ insetInlineStart: 10 }}/>
            <input value={query} onChange={e => setQuery(e.target.value)} dir="auto" placeholder="Cari topik, ulama, atau kitab (Arab/Indonesia)"
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg h-10 text-ink outline-none focus:border-emerald-500/40" style={{ fontSize: 16, paddingInlineStart: 32, paddingInlineEnd: 10 }}/>
          </div>
          <div className="flex items-center gap-1 text-xs text-ink-soft">
            hal. PDF
            <input value={pageFrom} onChange={e => setPageFrom(e.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="dari" className="w-14 bg-white/[0.04] border border-white/10 rounded-lg h-10 px-2 text-ink" style={{ fontSize: 16 }}/>
            –
            <input value={pageTo} onChange={e => setPageTo(e.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="s.d." className="w-14 bg-white/[0.04] border border-white/10 rounded-lg h-10 px-2 text-ink" style={{ fontSize: 16 }}/>
          </div>
          {tab === 'sumber' && (
            <select value={kind} onChange={e => setKind(e.target.value)} className="bg-white/[0.04] border border-white/10 rounded-lg h-10 px-2 text-sm text-ink">
              <option value="">Semua jenis</option>
              {Object.entries(KIND_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          )}
          <select value={verify} onChange={e => setVerify(e.target.value)} className="bg-white/[0.04] border border-white/10 rounded-lg h-10 px-2 text-sm text-ink">
            <option value="">Semua status</option>
            <option value="verified">Terverifikasi</option>
            <option value="needs_review">Perlu diperiksa</option>
          </select>
        </div>
      )}

      {tab === 'fihris' && (
        entries.length === 0
          ? <div className="card-glass p-6 text-sm text-ink-muted">Tidak ada pembahasan yang bisa dibuktikan dari teks dokumen ini.</div>
          : roots.length === 0
            ? <div className="card-glass p-6 text-sm text-ink-muted">Tidak ada pembahasan yang cocok dengan pencarian/filter.</div>
            : <ul>{roots.map(e => <EntryNode key={e.id} node={e} childrenOf={childrenOf} depth={0} open={open} toggle={toggle} visible={visible}
                citeCountOf={(id) => citeCount.get(id) || 0} printedMap={doc.printed_map} onLocate={setLocate} evidenceOf={evidenceOf}/>)}</ul>
      )}

      {tab === 'sumber' && (
        <div className="space-y-4">
          <div className="card-glass p-4">
            <div className="text-xs uppercase tracking-wider text-gold-400 mb-2">Kitab yang disebut muqarrar (Source Tracker)</div>
            <p className="text-[11px] text-ink-soft mb-3 leading-relaxed">
              Tiga halaman yang berbeda: <Badge tone="emerald">PDF n</Badge> urutan di file, <Badge tone="gold">cetak n</Badge> nomor tercetak di muqarrar,
              dan halaman kitab sumber (hanya bila ditulis muqarrar). Judul, pengarang, jilid, dan halaman sumber hanya diambil dari yang tertulis di muqarrar — semuanya
              <span className="text-amber-300"> belum diverifikasi</span> ke kitab aslinya.
            </p>
            {sources.length === 0 ? <div className="text-sm text-ink-muted">Muqarrar ini tidak menyebut judul kitab secara tertulis.</div> : (
              <div className="flex flex-wrap gap-2">
                {sources.filter(s => textHit(s.book_title, s.author)).map(s => (
                  <div key={s.id} className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2">
                    <div className="arabic text-[15px] text-ink" dir="rtl">{s.book_title}{s.author ? <span className="text-ink-muted"> — {s.author}</span> : null}</div>
                    <div className="text-[11px] text-ink-soft mt-0.5">disebut {s.mention_count}× · PDF {s.pages.slice(0, 8).join(', ')}{s.pages.length > 8 ? '…' : ''} · <span className="text-amber-300">belum diverifikasi</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {shownCitations.length === 0
            ? <div className="card-glass p-6 text-sm text-ink-muted">{citations.length ? 'Tidak ada kutipan yang cocok dengan pencarian/filter.' : 'Tidak ada kutipan yang bisa dibuktikan dari teks dokumen ini.'}</div>
            : <div className="grid gap-3">{shownCitations.slice(0, 300).map(c => (
                <CitationCard key={c.id} c={c} entryTitle={byId.get(c.entry_id)?.title_ar} source={sourceById.get(c.source_ref_id)} printedMap={doc.printed_map} evidenceOf={evidenceOf} onLocate={setLocate}/>
              ))}{shownCitations.length > 300 && <div className="text-xs text-ink-soft">Menampilkan 300 dari {shownCitations.length} kutipan — persempit dengan pencarian/filter.</div>}</div>}
        </div>
      )}

      {tab === 'tanya' && <AskPanel doc={doc} onLocate={setLocate} readOnly={readOnly}/>}

      {locate && <PdfLocator doc={doc} target={locate} pdf={pdf} onPickFile={onPickFile} onClose={() => setLocate(null)}/>}
    </div>
  );
};

/* ── Progres analisis ── */
const STEPS = [['read', 'Membaca teks per halaman'], ['ocr', 'Membaca halaman scan (OCR)'], ['upload', 'Mengunggah teks halaman'], ['analyze', 'Menganalisis pembahasan & kutipan'], ['finalize', 'Menyusun indeks & mengecek evidence']];
const ProgressCard = ({ prog, onCancel }) => (
  <div className="card-glass p-5">
    <div className="font-medium text-ink mb-1" dir="auto">{prog.title}</div>
    <div className="text-xs text-ink-soft mb-4">Jangan tutup halaman ini. Bagian yang sudah selesai tersimpan — kalau terputus, buka lagi dari daftar "Muqarrar tersimpan" lalu lanjutkan.</div>
    <ol className="space-y-3">
      {STEPS.map(([k, label]) => {
        const s = prog.steps[k] || {};
        const state = s.done ? 'done' : prog.step === k ? 'active' : s.skipped ? 'skipped' : 'pending';
        return (
          <li key={k} className={state === 'pending' || state === 'skipped' ? 'opacity-50' : ''}>
            <div className="flex items-center gap-2 text-sm">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${state === 'done' ? 'bg-emerald-500/20 text-emerald-300' : state === 'active' ? 'bg-gold-500/20 text-gold-200' : 'bg-white/5 text-ink-soft'}`}>
                {state === 'done' ? <Icon name="check" className="w-3 h-3"/> : <span className="w-1.5 h-1.5 rounded-full bg-current"/>}
              </span>
              <span className="text-ink">{label}</span>
              {s.total ? <span className="ml-auto text-xs text-ink-soft tabular-nums">{s.n || 0}/{s.total}</span> : null}
              {state === 'skipped' && <span className="ml-auto text-xs text-ink-soft">tidak perlu</span>}
            </div>
            {state === 'active' && s.total > 0 && (
              <div className="h-1.5 rounded-full bg-white/[0.06] mt-2 ml-7 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.round(((s.n || 0) / s.total) * 100)}%`, background: 'linear-gradient(90deg,#3ecf8e,#c9a86a)' }}/>
              </div>
            )}
            {s.note && <div className="text-[11px] text-ink-soft ml-7 mt-1">{s.note}</div>}
          </li>
        );
      })}
    </ol>
    {onCancel && <button className="btn btn-ghost text-xs mt-4" onClick={onCancel}>Hentikan</button>}
  </div>
);

/* ── Halaman ── */
const IlmiIndexPage = ({ libraryMode = false }) => {
  const { ilmi, ilmiView, aiCall } = useContext(IlmiApi);
  const status = useAiStatus();
  const path = useRoute();
  const [libraryDoc, setLibraryDoc] = useState(null);
  const docId = libraryMode ? libraryDoc : new URLSearchParams(path.split('?')[1] || '').get('doc');
  const navigate = libraryMode ? (url) => setLibraryDoc(new URLSearchParams(url.split('?')[1] || '').get('doc')) : window.navigate;
  const toast = useToast();
  const [docs, setDocs] = useState(null);
  const [publications, setPublications] = useState(null);
  const [publicationError, setPublicationError] = useState('');
  const [data, setData] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [prog, setProg] = useState(null);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(null);
  const fileRef = useRef(null);
  const pickModeRef = useRef('analyze');
  const cancelRef = useRef(false);
  const pro = libraryMode || status.tier === 'pro';

  const loadDocs = async () => {
    const d = await ilmiView('list');
    if (!d.ok) setError(d.error || 'Koleksi belum bisa dimuat.');
    setDocs(d.ok ? d.documents : []);
    if (libraryMode) {
      const p = await adminLibraryCall('admin-reference', { op: 'list' });
      setPublications(p.ok ? p.books : null);
      setPublicationError(p.ok ? '' : p.error || 'Status pustaka belum tersedia.');
    }
  };
  useEffect(() => { if (!status.loading) loadDocs(); }, [status.loading]);
  useEffect(() => { window.logFunnel?.('view_ilmi_index'); }, []);

  // Buka hasil tersimpan dari URL (?doc=…), tanpa analisis ulang.
  useEffect(() => {
    if (!docId) { setData(null); setPdf(null); return; }
    if (data?.document?.id === docId) return;
    let alive = true;
    setPdf(null); setData(null);
    setError('');
    ilmiView('get', { document_id: docId }).then(async d => {
      if (!alive) return;
      if (!d.ok) { setError(d.error || 'Dokumen gagal dibuka.'); return; }
      if (d.document.status === 'done' || d.document.status === 'partial') {
        setData(d);
        {
          const blob = await loadPdfLocal(d.document.file_hash);
          if (blob && alive) { try { setPdf(await window.openPdf(new File([blob], d.document.file_name || 'muqarrar.pdf', { type: 'application/pdf' }))); } catch {} }
        }
      } else setData({ document: d.document, progress: d.progress, pendingOnly: true });
    });
    return () => { alive = false; };
  }, [docId]);

  const setStep = (step, patch = {}) => setProg(p => ({ ...p, step, steps: { ...p.steps, [step]: { ...(p.steps[step] || {}), ...patch } } }));
  const doneStep = (step, patch = {}) => setProg(p => ({ ...p, steps: { ...p.steps, [step]: { ...(p.steps[step] || {}), ...patch, done: true } } }));

  /* Analisis di server: start (atau lanjutkan job) → chunk paralel → finalize. */
  const runAnalysis = async (doc) => {
    setStep('analyze', { n: 0, total: 0 });
    let r = await ilmi('start', { document_id: doc.id });
    if (!r.ok) { if (r.upgrade) openAiUpgrade('default'); throw new Error(r.error || 'Analisis gagal dimulai.'); }
    let progress = r.progress;
    const total = progress.total;
    let finished = progress.done + progress.failed;
    setStep('analyze', { n: finished, total, note: total ? `${total} bagian (±3–8 halaman per bagian), dibaca ${CHUNK_WORKERS} sekaligus.` : '' });
    const queue = progress.chunks.filter(c => c.status === 'pending').map(c => c.index);
    let stop = null;
    const worker = async () => {
      while (queue.length && !stop && !cancelRef.current) {
        const index = queue.shift();
        for (let tries = 0; tries < 4; tries++) {
          const c = await ilmi('chunk', { document_id: doc.id, index });
          if (c.ok || c.retry === false) break;          // selesai, atau server menandai bagian ini gagal
          if (c.retry) continue;                         // AI gagal; server membatasi percobaan
          stop = c.error || 'Analisis terhenti.'; break;  // kuota/koneksi: berhenti, bisa dilanjutkan nanti
        }
        finished++;
        setStep('analyze', { n: Math.min(finished, total), total });
      }
    };
    await Promise.all(Array.from({ length: CHUNK_WORKERS }, worker));
    if (cancelRef.current) throw new Error('Analisis dihentikan. Bagian yang selesai tersimpan; lanjutkan dari daftar "Muqarrar tersimpan".');
    if (stop) throw new Error(stop);
    doneStep('analyze');
    setStep('finalize');
    r = await ilmi('finalize', { document_id: doc.id });
    if (!r.ok && r.pending?.length) {
      // Bagian yang tadi terputus di tengah: ulangi sekali lagi lalu finalize.
      for (const index of r.pending) await ilmi('chunk', { document_id: doc.id, index });
      r = await ilmi('finalize', { document_id: doc.id });
    }
    if (!r.ok) throw new Error(r.error || 'Gagal menyusun indeks.');
    doneStep('finalize');
  };

  /* PDF baru: validasi → sidik jari → (hasil lama? buka) → baca teks + OCR → unggah → analisis. */
  const analyzeFile = async (file) => {
    cancelRef.current = false;
    setError('');
    setProg({ title: file.name, step: 'read', steps: {} });
    try {
      const pdfDoc = await openPdfChecked(file);
      const hash = await window.pdfFileHash(pdfDoc);
      if (!hash) throw new Error('Sidik jari PDF gagal dihitung di browser ini. Coba browser lain (Chrome/Edge terbaru).');
      setPdf(pdfDoc);
      savePdfLocal(hash, file);
      const title = file.name.replace(/\.pdf$/i, '');
      const created = await ilmi('create', { file_hash: hash, num_pages: pdfDoc.numPages, title, file_name: file.name, file_size: file.size });
      if (!created.ok) { if (created.upgrade) openAiUpgrade('default'); throw new Error(created.error || 'Dokumen gagal didaftarkan.'); }
      const doc = created.document;
      // Sudah pernah dianalisis → langsung buka hasil tersimpan.
      if (doc.status === 'done' || doc.status === 'partial') {
        setProg(null); toast.push('PDF ini sudah pernah dianalisis — membuka hasil tersimpan.');
        navigate(`/ilmi-index?doc=${doc.id}`); return;
      }
      if (doc.status === 'analyzing' || doc.status === 'finalizing') {
        ['read', 'ocr', 'upload'].forEach(s => doneStep(s, { skipped: true }));
        await runAnalysis(doc);
        setProg(null); loadDocs(); navigate(`/ilmi-index?doc=${doc.id}`); return;
      }

      // 1. Teks per halaman.
      setStep('read', { n: 0, total: pdfDoc.numPages });
      const pages = (await window.readPdfRange(pdfDoc, 1, pdfDoc.numPages, (n, total) => setStep('read', { n, total })))
        .map(p => ((p.status === 'ok' || p.status === 'fixed') && looksScrambledArabic(p.text) ? { ...p, status: 'garbled' } : p));
      if (cancelRef.current) throw new Error('Dibatalkan.');
      const textPages = pages.filter(p => (p.status === 'ok' || p.status === 'fixed') && p.text?.trim()).length;
      const garbled = pages.filter(p => p.status === 'garbled').length;
      doneStep('read', { note: `${textPages} dari ${pages.length} halaman punya lapisan teks yang terbaca${garbled ? `; ${garbled} halaman teksnya teracak, jadi dibaca ulang lewat OCR` : ''}.` });

      // 2. Halaman scan / rusak → OCR (cache bersama dulu, lalu jatah baca).
      const scan = pages.filter(p => !(p.status === 'ok' || p.status === 'fixed') || !p.text?.trim()).map(p => p.n);
      const out = new Map(pages.map(p => [p.n, (p.status === 'ok' || p.status === 'fixed') && p.text?.trim() ? { n: p.n, text: p.text, status: p.status } : { n: p.n, text: '', status: 'unread' }]));
      if (scan.length) {
        setStep('ocr', { n: 0, total: scan.length, note: 'Mengecek halaman yang sudah pernah dibaca…' });
        const cached = await aiCall('ocr-cache', { file_hash: hash, pages: scan.slice(0, 400) });
        const texts = cached?.ok && cached.texts ? cached.texts : {};
        let n = 0;
        for (const p of scan) if (String(texts[p] || '').trim()) { out.set(p, { n: p, text: String(texts[p]), status: 'ocr' }); n++; }
        const rest = scan.filter(p => out.get(p).status !== 'ocr');
        const quota = rest.length ? await aiCall('ocr-quota', {}) : null;
        const allowed = quota?.ok && Number.isFinite(quota.remaining) ? quota.remaining : rest.length;
        let reason = '';
        for (const p of rest.slice(0, allowed)) {
          if (cancelRef.current) throw new Error('Dibatalkan.');
          setStep('ocr', { n, total: scan.length, note: `AI membaca halaman scan ${p}…` });
          const img = await window.renderPdfPage(pdfDoc, p);
          const small = await window.compressImage(img);
          const d = await aiCall('ocr', { foto_base64: await window.fileToBase64(small), mime_type: small.type || 'image/jpeg', file_hash: hash, page: p });
          if (!d.ok) { reason = d.error || 'AI gagal membaca halaman scan.'; if (d.upgrade || /jatah|batas|kuota/i.test(reason)) break; continue; }
          if (libraryMode && d.truncated) { reason = `Hasil OCR halaman ${p} terpotong. Pisahkan PDF atau perbaiki lapisan teksnya sebelum dijadikan rujukan.`; break; }
          if (d.teks?.trim()) out.set(p, { n: p, text: d.teks, status: 'ocr' });
          else out.set(p, { n: p, text: '', status: 'empty' });
          n++;
        }
        const unread = scan.filter(p => out.get(p).status === 'unread');
        doneStep('ocr', { n: scan.length - unread.length, total: scan.length, note: unread.length ? `${unread.length} halaman scan belum terbaca${reason ? ` (${reason})` : ' (jatah baca habis)'}.` : '' });
        const readable = [...out.values()].filter(p => p.text.trim()).length;
        if (!readable) throw new Error(reason || 'Tidak ada teks yang bisa dibaca di PDF ini (kosong, atau halaman scan yang belum bisa dibaca). Tidak ada kuota analisis yang terpakai.');
        if (unread.length) {
          const go = await new Promise(resolve => setConfirm({ unread: unread.length, total: pages.length, resolve }));
          setConfirm(null);
          if (!go) throw new Error('Dibatalkan. Coba lagi setelah jatah baca halaman scan bertambah — halaman yang sudah terbaca tersimpan di cache.');
        }
      } else doneStep('ocr', { skipped: true });

      // 3. Unggah teks per halaman (bertahap; aman diulang).
      const all = [...out.values()];
      setStep('upload', { n: 0, total: all.length });
      for (let i = 0; i < all.length;) {
        const batch = [];
        let chars = 0;
        while (i < all.length && batch.length < UPLOAD_PAGES && (chars + all[i].text.length <= UPLOAD_CHARS || !batch.length)) { batch.push(all[i]); chars += all[i].text.length; i++; }
        const r = await ilmi('pages', { document_id: doc.id, pages: batch });
        if (!r.ok) throw new Error(r.error || 'Teks halaman gagal diunggah.');
        setStep('upload', { n: i, total: all.length });
      }
      doneStep('upload');

      // 4–5. Analisis & finalisasi.
      await runAnalysis(doc);
      setProg(null);
      loadDocs();
      navigate(`/ilmi-index?doc=${doc.id}`);
    } catch (e) {
      setProg(null);
      setError(e.message || String(e));
      loadDocs();
    }
  };

  // Lanjutkan analisis yang terputus (teks halaman sudah ada di server, PDF tidak diperlukan).
  const resume = async (doc) => {
    cancelRef.current = false;
    setError('');
    setProg({ title: doc.title, step: 'analyze', steps: { read: { done: true, skipped: true }, ocr: { done: true, skipped: true }, upload: { done: true, skipped: true } } });
    try {
      await runAnalysis(doc);
      setProg(null); loadDocs(); setData(null);
      const d = await ilmiView('get', { document_id: doc.id });
      if (d.ok) setData(d);
    } catch (e) { setProg(null); setError(e.message || String(e)); }
  };

  // Pilih file: untuk dianalisis, atau untuk menampilkan halaman PDF dari hasil tersimpan (sidik jari harus sama).
  const pick = (mode) => { pickModeRef.current = mode; fileRef.current?.click(); };
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (pickModeRef.current === 'view' && data?.document) {
      try {
        const p = await openPdfChecked(file);
        const hash = await window.pdfFileHash(p);
        if (hash !== data.document.file_hash) { toast.push('File ini berbeda dari PDF yang dianalisis (sidik jarinya tidak sama).'); return; }
        setPdf(p); savePdfLocal(hash, file); toast.push('PDF dibuka.');
      } catch (err) { toast.push(err.message); }
      return;
    }
    if (!pro) { openAiUpgrade('default'); return; }
    analyzeFile(file);
  };

  const remove = async (d) => {
    if (!window.confirm(`Hapus hasil Ilmi Index "${d.title}"? Analisis ulang nanti memakai kuota baru.`)) return;
    const r = await ilmiView('delete', { document_id: d.id });
    if (!r.ok) { toast.push(r.error || 'Gagal menghapus.'); return; }
    if (d.file_hash) deletePdfLocal(d.file_hash);
    if (docId === d.id) navigate('/ilmi-index');
    loadDocs();
  };

  const reanalyze = async () => {
    const doc = data.document;
    if (!window.confirm('Analisis ulang dari awal? Hasil sekarang dihapus dan analisis baru memakai 1 kuota Ilmi Index.')) return;
    const r = await ilmi('reset', { document_id: doc.id });
    if (!r.ok) { toast.push(r.error || 'Gagal.'); return; }
    setData(null);
    resume({ ...doc, status: 'ready' });
  };

  const header = (
    <div className="mb-5 md:mb-7">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-gold-400 mb-2"><Icon name="list" className="w-3.5 h-3.5"/> AI Partner</div>
      <h1 className="font-display text-[24px] md:text-[34px] font-semibold text-ink leading-tight tracking-tight">
        Talqeeh Ilmi Index <span className="text-ink-soft font-normal">—</span> <span className="arabic-display text-gold-200 whitespace-nowrap" dir="rtl">الفهرس العلمي الذكي</span>
      </h1>
      <p className="text-sm text-ink-muted mt-2 max-w-2xl leading-relaxed">
        Peta pembahasan muqarrar per halaman (باب، فصل، مبحث، مطلب، مسألة) dan penelusur kutipan: pendapat ulama, mazhab, ayat, hadis, rujukan kitab, ijma', dan qiyas.
        Setiap judul dan kutipan dicek ke teks asli PDF, dan yang tidak terbukti tidak disimpan.
      </p>
    </div>
  );

  const backLink = (
    <button onClick={() => navigate(docId ? '/ilmi-index' : '/ai-partner')} className={`text-sm text-ink-soft hover:text-ink inline-flex items-center gap-1.5 mb-3 ${libraryMode && !docId ? 'hidden' : ''}`} style={{ minHeight: 40 }}>
      <Icon name="chevronLeft" className="w-4 h-4"/> {libraryMode ? 'Pustaka rujukan' : docId ? 'Muqarrar tersimpan' : 'AI Partner'}
    </button>
  );

  let body;
  if (status.loading) body = <div className="card-glass p-6"><Skeleton lines={4}/></div>;
  else if (prog) body = <ProgressCard prog={prog} onCancel={() => { cancelRef.current = true; }}/>;
  else if (docId) {
    body = error ? <div className="card-glass p-5 text-sm text-red-300">{error}</div>
      : !data ? <div className="card-glass p-6"><Skeleton lines={6}/></div>
      : data.pendingOnly ? (
        <div className="card-glass p-5 space-y-3">
          <div className="text-ink font-medium" dir="auto">{data.document.title}</div>
          <div className="text-sm text-ink-muted">
            {data.document.status === 'uploading' || data.document.status === 'ready'
              ? 'Teks dokumen ini belum selesai diunggah. Pilih file PDF-nya lagi untuk melanjutkan (tidak memakai kuota baru bila sudah pernah dimulai).'
              : `Analisis belum selesai${data.progress ? ` (${data.progress.done}/${data.progress.total} bagian)` : ''}. Lanjutkan tanpa kuota baru.`}
          </div>
          {pro && (data.document.status === 'analyzing' || data.document.status === 'finalizing')
            ? <button className="btn btn-primary text-sm" onClick={() => resume(data.document)}><Icon name="play" className="w-4 h-4"/> Lanjutkan analisis</button>
            : pro ? <button className="btn btn-primary text-sm" onClick={() => pick('analyze')}><Icon name="upload" className="w-4 h-4"/> Pilih file PDF</button>
            : <UpgradeCard compact title="Melanjutkan analisis khusus pelanggan" message="Berlangganan AI Partner untuk menyelesaikan analisis muqarrar ini."/>}
        </div>
      ) : (
        <IlmiResult data={data} pdf={pdf} readOnly={!pro} onPickFile={() => pick('view')} onReanalyze={libraryMode ? undefined : reanalyze}
          onEdition={(edition) => setData(d => ({ ...d, document: { ...d.document, edition } }))}/>
      );
  } else {
    body = (
      <div className="space-y-5">
        {error && <div className="card-glass p-4 text-sm text-red-300 border border-red-500/20">{error}</div>}
        {pro ? (
          <button onClick={() => pick('analyze')} className="w-full card-glass p-6 md:p-8 text-center border-2 border-dashed border-emerald-500/25 hover:border-emerald-500/50 hover:bg-emerald-500/[0.03] transition-colors rounded-2xl">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-emerald-500/12 border border-emerald-500/25"><Icon name="upload" className="w-6 h-6 text-emerald-300"/></div>
            <div className="font-display text-lg font-semibold text-ink">Pilih PDF muqarrar</div>
            <div className="text-xs text-ink-soft mt-1.5 leading-relaxed max-w-md mx-auto">
              PDF berteks atau hasil scan, maksimal {MAX_PAGES} halaman dan {MAX_MB}MB. Halaman scan dibaca memakai jatah baca foto.
              {libraryMode ? 'Analisis admin dibatasi pemanggilan harian untuk menjaga biaya. PDF yang sama tidak dianalisis ulang.' : 'Satu analisis memakai 1 kuota Ilmi Index; PDF yang sama dibuka lagi tanpa kuota.'}
            </div>
          </button>
        ) : (
          <UpgradeCard title="Ilmi Index khusus pelanggan AI Partner"
            message="Petakan pembahasan muqarrarmu per halaman PDF dan telusuri kutipan ulama, ayat, hadis, serta kitab rujukannya — lengkap dengan bukti teks aslinya."/>
        )}
        {libraryMode ? <ReferenceShelf docs={docs} publications={publications} publicationError={publicationError} onOpen={d => navigate(`/ilmi-index?doc=${d.id}`)} onRemove={remove}/> : <div>
          <div className="text-xs uppercase tracking-wider text-ink-soft mb-2">Muqarrar tersimpan</div>
          {docs === null ? <div className="card-glass p-5"><Skeleton lines={3}/></div>
            : docs.length === 0 ? <div className="text-sm text-ink-soft">Belum ada. Hasil analisis tersimpan otomatis di sini.</div>
            : (
              <div className="grid gap-2">
                {docs.map(d => (
                  <div key={d.id} className="card-glass p-3.5 flex items-center gap-3">
                    <button className="flex-1 min-w-0 text-start" onClick={() => navigate(`/ilmi-index?doc=${d.id}`)}>
                      <div className="text-sm text-ink font-medium truncate" dir="auto">{d.title}</div>
                      <div className="text-[11px] text-ink-soft mt-0.5 flex flex-wrap gap-x-2">
                        <span>{d.num_pages} hal.</span>
                        {d.status === 'done' || d.status === 'partial'
                          ? <span>{d.stats?.entries ?? 0} pembahasan · {d.stats?.citations ?? 0} kutipan{d.status === 'partial' ? ' · sebagian gagal' : ''}</span>
                          : <span className="text-amber-300">{d.status === 'analyzing' || d.status === 'finalizing' ? 'analisis belum selesai' : 'unggahan belum selesai'}</span>}
                        <span>{new Date(d.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </button>
                    <button className="w-9 h-9 rounded-lg hover:bg-white/5 text-ink-soft hover:text-red-300 flex items-center justify-center" onClick={() => remove(d)} aria-label="Hapus"><Icon name="trash" className="w-4 h-4"/></button>
                  </div>
                ))}
              </div>
            )}
        </div>}
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="container-x max-w-4xl pt-4 md:pt-8 pb-24">
        {backLink}
        {libraryMode ? <div className="mb-6 rounded-3xl border border-emerald-300/15 p-5 sm:p-8 relative overflow-hidden" style={{ background: 'radial-gradient(ellipse at 100% 0%,rgba(62,207,142,.12),transparent 70%),#111a15' }}><p className="text-[10px] tracking-[.25em] uppercase text-gold-300 mb-3">Talqeeh · Pustaka ilmiah</p><h1 className="text-2xl sm:text-3xl text-ink font-display font-semibold">Pustaka Rujukan Talqeeh</h1><p className="arabic text-xl sm:text-2xl text-gold-200/80 mt-2" dir="rtl">من الكتاب إلى الفهم</p><p className="mt-4 text-sm leading-relaxed max-w-2xl text-ink-muted">Kitab yang tertata. Pemahaman yang punya dasar. Kelola koleksi, periksa hasil pembacaan, lalu pilih rujukan untuk jawaban Tanya AI dan Tutor.</p><div className="flex flex-wrap gap-2 mt-5">{['Unggah kitab','Periksa teks & edisi','Aktifkan rujukan'].map((s,i) => <span key={s} className="text-[11px] text-ink-muted rounded-full border border-white/10 px-3 py-1.5"><span className="text-emerald-300 mr-2">0{i+1}</span>{s}</span>)}</div></div> : header}
        {libraryMode && data?.document && <ReferencePublishPanel key={data.document.id} doc={data.document}/>}
        {body}
        <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={onFile}/>
      </div>
      {confirm && (
        <div className="fixed inset-0 z-[90] bg-black/70 flex items-center justify-center p-4">
          <div className="card-glass-strong max-w-md w-full p-5 rounded-2xl">
            <div className="font-medium text-ink mb-2">{confirm.unread} dari {confirm.total} halaman belum terbaca</div>
            <p className="text-sm text-ink-muted leading-relaxed mb-4">
              Halaman scan itu belum bisa dibaca (jatah baca habis atau gagal). Kalau dilanjutkan, halaman tersebut tidak ikut dianalisis
              dan ditandai "tidak terbaca". Atau batalkan dan coba lagi nanti — halaman yang sudah terbaca tersimpan.
            </p>
            <div className="flex gap-2 justify-end">
              <button className="btn btn-ghost text-sm" onClick={() => confirm.resolve(false)}>Batal</button>
              <button className="btn btn-primary text-sm" onClick={() => confirm.resolve(true)}>Lanjutkan analisis</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { IlmiIndexPage, IlmiResult, IlmiProgressCard: ProgressCard, openPdfChecked, looksScrambledArabic });

const ReferencePublishPanel = ({ doc }) => {
  const [active, setActive] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const checks = [
    ['Pembacaan & indeks selesai', doc.status === 'done'],
    ['Judul & penulis terisi', !!(doc.edition?.title && doc.edition?.author)],
    ['Bidang ilmu dipilih', !!REFERENCE_SUBJECTS[doc.edition?.subject]],
    ['Tidak ada halaman gagal dibaca', !['unread','garbled'].some(k => Number(doc.page_stats?.[k]) > 0)],
  ];
  const eligible = checks.every(([,ok]) => ok);
  useEffect(() => { adminLibraryCall('admin-reference', { op: 'list' }).then(d => {
    if (!d.ok) { setError(d.error || 'Status pustaka gagal dibaca. Jalankan migrasi reference_library.sql.'); return; }
    setActive(d.books.some(b => b.document_id === doc.id && b.active)); setLoaded(true);
  }); }, [doc.id]);
  const toggle = async () => {
    setBusy(true); setError('');
    const d = await adminLibraryCall('admin-reference', { op: active ? 'unpublish' : 'publish', document_id: doc.id });
    if (d.ok) setActive(!active); else setError(d.error || 'Gagal mengubah status.');
    setBusy(false);
  };
  return <div className="rounded-2xl bg-emerald-400/[0.04] p-5 mb-5 space-y-4 border border-emerald-500/20">
    <div className="flex flex-wrap justify-between gap-3 items-start"><div><p className="text-[10px] text-gold-300 uppercase tracking-[.18em] mb-2">Tinjauan rujukan</p><div className="text-base text-emerald-200">{!loaded ? error ? 'Status aktivasi belum tersedia' : 'Memeriksa status pustaka…' : active ? 'Aktif sebagai dasar jawaban' : eligible ? 'Siap untuk tinjauan akhir' : 'Lengkapi sebelum diaktifkan'}</div></div><span className="text-xs text-ink-soft rounded-full bg-white/5 px-3 py-1.5">{checks.filter(([,ok]) => ok).length} / {checks.length} syarat terpenuhi</span></div>
    <div className="grid sm:grid-cols-2 gap-2">{checks.map(([label,ok]) => <div key={label} className="rounded-xl border border-white/[0.06] bg-black/10 p-3 text-xs text-ink-muted"><span className={`mr-2 ${ok ? 'text-emerald-300' : 'text-gold-300'}`} aria-hidden>{ok ? '✓' : '○'}</span>{label}</div>)}</div>
    <p className="text-xs leading-relaxed text-ink-soft">Periksa teks Arab, terutama hasil OCR, serta kesesuaian edisi. Aktivasi membagikan teks sebagai bukti kepada pengguna. Syarat teknis ini tidak menggantikan pemeriksaan ilmiah.</p>
    {error && <p className="text-sm text-red-300">{error}</p>}
    <button disabled={!loaded || busy || (!active && !eligible)} onClick={toggle} className="btn btn-primary text-sm disabled:opacity-50">{busy ? 'Menyimpan…' : active ? 'Nonaktifkan rujukan' : 'Aktifkan sebagai rujukan'}</button>
  </div>;
};
window.AdminReferenceLibrary = () => <IlmiApi.Provider value={adminLibraryApi}><IlmiIndexPage libraryMode/></IlmiApi.Provider>;
