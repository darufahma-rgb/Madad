import React, { useState, useRef, useMemo } from 'react';
/* Talqeeh — AI Partner: wizard tambah materi (pilih file → diproses → cek & simpan) */

// Batas panjang materi: pelanggan ±100 halaman, coba gratis lebih pendek (sama dengan server).
const MAX_CONTENT_PRO = 200000;
const MAX_CONTENT_TRIAL = 60000;
const DIALECT_KEY = 'talqeeh_transcribe_dialect';
const DIALECTS = [
  { id: 'campur', label: "Campur fushah & 'ammiyah" },
  { id: 'fusha', label: 'Fushah' },
  { id: 'ammiyah', label: "'Ammiyah Mesir" },
  { id: 'indonesia', label: 'Bahasa Indonesia' },
];
const readDialect = () => { try { return DIALECTS.some(d => d.id === localStorage.getItem(DIALECT_KEY)) ? localStorage.getItem(DIALECT_KEY) : 'campur'; } catch { return 'campur'; } };
const PRO_ONLY_KINDS = ['audio', 'video'];
const FORMAT_CHIPS = [
  { kinds: ['pdf'],           label: 'PDF (termasuk scan)' },
  { kinds: ['docx'],          label: 'Word' },
  { kinds: ['pptx'],          label: 'PowerPoint' },
  { kinds: ['xlsx'],          label: 'Excel' },
  { kinds: ['txt'],           label: 'TXT' },
  { kinds: ['foto'],          label: 'Foto halaman' },
  { kinds: ['audio'],         label: 'Rekaman audio' },
  { kinds: ['video'],         label: 'Video' },
];

// [3,4,5,9] → "3–5, 9"
const pageRanges = (nums) => {
  const out = [];
  [...nums].sort((a, b) => a - b).forEach(n => {
    const last = out[out.length - 1];
    if (last && n === last[1] + 1) last[1] = n; else out.push([n, n]);
  });
  return out.map(([a, b]) => (a === b ? `${a}` : `${a}–${b}`)).join(', ');
};

const FileRow = ({ item, onContinue, busy }) => {
  const icon = { waiting: 'timer', working: 'refresh', done: 'check', partial: 'alert', error: 'alert', skipped: 'x' }[item.status];
  const color = { waiting: 'text-ink-soft', working: 'text-emerald-300 animate-spin', done: 'text-emerald-300', partial: 'text-amber-300', error: 'text-rose-400', skipped: 'text-ink-soft' }[item.status];
  const pending = item.pending;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/6 last:border-0">
      <Icon name={icon} className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`}/>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-ink truncate">{item.file.name}</div>
        <div className={`text-xs ${item.status === 'error' ? 'text-rose-400' : 'text-ink-soft'}`}>
          {window.FILE_KINDS?.[item.kind]?.label || 'File'} · {item.note}
        </div>
        {item.status === 'partial' && pending && (
          <div className="mt-2 rounded-lg border border-amber-500/25 bg-amber-500/8 px-3 py-2 text-xs text-amber-200">
            <div>Halaman {pageRanges(pending.pages)} belum terbaca — {pending.reason}. Halaman yang sudah terbaca tetap dipakai.</div>
            {onContinue && (
              <button onClick={onContinue} disabled={busy}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-amber-400/40 px-2.5 py-1 text-amber-100 hover:bg-amber-500/15 disabled:opacity-50">
                <Icon name="refresh" className="w-3.5 h-3.5"/> Lanjutkan baca {pending.pages.length} halaman
              </button>
            )}
          </div>
        )}
        {item.status === 'working' && item.progress != null && (
          <div className="h-1 rounded-full bg-white/8 mt-2 overflow-hidden">
            <div className="h-full bg-emerald-400 transition-all" style={{ width: `${Math.round(item.progress * 100)}%` }}/>
          </div>
        )}
      </div>
    </div>
  );
};

const CreateWizard = ({ tier, onCancel }) => {
  const toast = useToast();
  const { profile } = useAuth();
  const [step, setStep]       = useState('pick'); // pick → process → review
  const [items, setItems]     = useState([]);
  const [content, setContent] = useState('');
  const [title, setTitle]     = useState('');
  const [maddahId, setMaddahId] = useState('');
  const [error, setError]     = useState('');
  const [upgradeMsg, setUpgradeMsg] = useState('');
  const [saving, setSaving]   = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [sourceKinds, setSourceKinds] = useState([]);
  const cancelRef = useRef(false);
  const fileRef = useRef(null);
  const isTrial = tier !== 'pro';
  const MAX_CONTENT = isTrial ? MAX_CONTENT_TRIAL : MAX_CONTENT_PRO;
  const [dialect, setDialect] = useState(readDialect);
  const chooseDialect = (d) => { setDialect(d); try { localStorage.setItem(DIALECT_KEY, d); } catch {} };

  const maddahOptions = useMemo(() => {
    if (!profile) return [];
    try {
      if (window.isMahadLevel?.(profile.level)) return window.getMahadMaddahByJenjang?.(profile.level) || [];
      return window.getMaddahsForProfile?.(profile) || [];
    } catch { return []; }
  }, [profile]);

  const patchItem = (i, patch) => setItems(list => list.map((it, j) => j === i ? { ...it, ...patch } : it));

  const ocrImage = async (file) => {
    const compressed = await window.compressImage(file);
    const base64 = await window.fileToBase64(compressed);
    return aiCall('ocr', { foto_base64: base64, mime_type: compressed.type || 'image/jpeg' });
  };

  /* Baca halaman PDF hasil scan satu per satu, sebanyak sisa jatah baca saja.
     Kalau jatah habis atau satu halaman gagal, halaman yang sudah terbaca tetap dipakai dan sisanya dicatat
     sebagai "belum terbaca" (bisa dilanjutkan) — bukan membuang semuanya. */
  const ocrPdfPages = async (i, pdf, pageNums) => {
    const maxScan = isTrial ? 3 : 20;
    const quota = await aiCall('ocr-quota', {});
    const remaining = quota?.ok && Number.isFinite(quota.remaining) ? quota.remaining : Infinity;
    const cap = Math.min(maxScan, remaining);
    const todo = pageNums.slice(0, cap);
    let pending = pageNums.slice(cap);
    let reason = '';
    let upgrade = false;
    if (pending.length) {
      if (remaining < Math.min(maxScan, pageNums.length)) {
        reason = isTrial ? 'jatah baca halaman scan coba gratis hari ini habis'
          : quota.scope === 'monthly' ? 'jatah baca halaman scan di periode langgananmu habis'
          : 'jatah baca halaman scan hari ini habis, lanjutkan besok';
        upgrade = isTrial;
      } else {
        reason = `sekali baca maksimal ${maxScan} halaman scan${isTrial ? ' saat coba gratis' : ''}`;
      }
    }
    const texts = {};
    const truncated = [];
    for (let k = 0; k < todo.length; k++) {
      if (cancelRef.current) { pending = [...todo.slice(k), ...pending]; reason = 'dihentikan'; break; }
      const n = todo[k];
      patchItem(i, { note: `AI membaca halaman ${n} (${k + 1} dari ${todo.length})…`, progress: k / todo.length });
      const img = await window.renderPdfPage(pdf, n);
      const d = await ocrImage(img);
      if (!d.ok) {
        pending = [...todo.slice(k), ...pending];
        reason = String(d.error || 'gagal membaca halaman').replace(/\.$/, '');
        upgrade = upgrade || !!d.upgrade;
        break;
      }
      texts[n] = d.teks;
      if (d.truncated) truncated.push(n);
    }
    return { texts, pending, reason, upgrade, truncated };
  };

  // Lanjutkan halaman PDF yang belum terbaca; hasilnya ditambahkan ke materi dengan penanda halaman.
  const continueFile = async (i) => {
    const item = items[i];
    if (!item?.pending) return;
    cancelRef.current = false;
    patchItem(i, { status: 'working', note: 'Melanjutkan…', progress: null });
    const r = await ocrPdfPages(i, item.pending.pdf, item.pending.pages);
    const read = Object.keys(r.texts).map(Number).sort((a, b) => a - b);
    if (read.length) {
      const added = `— ${item.file.name} (hal. ${pageRanges(read)}) —\n` + read.map(n => r.texts[n]).join('\n\n');
      setContent(prev => (prev ? `${prev}\n\n${added}` : added));
    }
    if (r.upgrade) setUpgradeMsg(r.reason);
    // Keterangan dihitung dari catatan awal file supaya tidak menumpuk tiap kali dilanjutkan.
    const baseNote = item.baseNote || item.note;
    const added = (item.addedPages || 0) + read.length;
    const truncated = [...(item.truncatedPages || []), ...r.truncated];
    const extra = [];
    if (added) extra.push(`+${added} halaman dilanjutkan`);
    if (truncated.length) extra.push(`hal. ${pageRanges(truncated)} mungkin terpotong`);
    patchItem(i, {
      status: r.pending.length ? 'partial' : 'done', progress: null,
      baseNote, addedPages: added, truncatedPages: truncated,
      note: [baseNote, ...extra].join(' · '),
      pending: r.pending.length ? { pdf: item.pending.pdf, pages: r.pending, reason: r.reason } : null,
    });
  };

  // Mengembalikan teks (atau { text, notes, pending } untuk PDF), atau melempar error dengan .upgrade bila butuh langganan.
  const processFile = async (item, i) => {
    const fail = (msg, upgrade) => { const e = new Error(msg); e.upgrade = upgrade; throw e; };
    const { file, kind } = item;

    if (kind === 'pdf') {
      if (file.size > 30 * 1024 * 1024) fail('PDF terlalu besar (maks 30MB).');
      patchItem(i, { note: 'Membaca teks PDF…' });
      const { pdf, numPages, pages } = await window.readPdfPages(file, 120);
      if (!pages) fail(`PDF punya ${numPages} halaman — maksimal 120.`);
      const texts = {};
      pages.forEach(p => { if (p.status === 'ok' || p.status === 'fixed') texts[p.n] = p.text; });
      const fixedCount = pages.filter(p => p.status === 'fixed').length;
      // Halaman tanpa teks (hasil scan) atau teks Arab yang rusak dibaca AI — juga di PDF campuran.
      const needOcr = pages.filter(p => p.status === 'empty' || p.status === 'garbled').map(p => p.n);
      const r = needOcr.length ? await ocrPdfPages(i, pdf, needOcr) : { texts: {}, pending: [], truncated: [] };
      Object.assign(texts, r.texts);
      const text = Object.keys(texts).map(Number).sort((a, b) => a - b).map(n => texts[n]).join('\n\n');
      if (!text.trim() && r.pending.length) fail(r.reason.charAt(0).toUpperCase() + r.reason.slice(1) + '.', r.upgrade);
      const notes = [];
      if (fixedCount) notes.push(`teks Arab ${fixedCount} halaman dirapikan`);
      if (Object.keys(r.texts).length) notes.push(`${Object.keys(r.texts).length} halaman scan dibaca AI`);
      if (r.truncated.length) notes.push(`hal. ${pageRanges(r.truncated)} mungkin terpotong — cek di langkah berikutnya`);
      if (r.upgrade) setUpgradeMsg(r.reason);
      return { text, notes, pending: r.pending.length ? { pdf, pages: r.pending, reason: r.reason } : null };
    }

    if (kind === 'docx') { patchItem(i, { note: 'Membaca dokumen Word…' }); return window.extractDocx(file); }
    if (kind === 'pptx') { patchItem(i, { note: 'Membaca slide…' }); return window.extractPptx(file); }
    if (kind === 'xlsx') { patchItem(i, { note: 'Membaca tabel…' }); return window.extractXlsx(file); }
    if (kind === 'txt')  { return file.text(); }

    if (kind === 'foto') {
      if (file.size > 15 * 1024 * 1024) fail('Foto terlalu besar (maks 15MB).');
      patchItem(i, { note: 'AI membaca foto…' });
      const d = await ocrImage(file);
      if (!d.ok) fail(d.error || 'Gagal membaca foto', d.upgrade);
      return d.teks;
    }

    if (kind === 'audio' || kind === 'video') {
      if (isTrial) fail('Transkrip audio & video khusus pelanggan AI Partner.', true);
      const limitMB = kind === 'video' ? 200 : 100;
      if (file.size > limitMB * 1024 * 1024) fail(`File terlalu besar (maks ${limitMB}MB). Potong atau kompres dulu.`);
      patchItem(i, { note: 'Menyiapkan audio…' });
      const media = await window.prepareMediaChunks(file);
      const parts = [];
      for (let c = 0; c < media.count; c++) {
        if (cancelRef.current) fail('Dibatalkan');
        patchItem(i, { note: `Mentranskrip menit ${c + 1} dari ${media.count}…`, progress: c / media.count });
        const chunk = await media.getChunk(c);
        if (chunk.silent) continue;
        // Ujung potongan sebelumnya + judul membantu AI menyambung kalimat & mengenali istilah.
        const d = await aiCall('transcribe', {
          audio_base64: chunk.base64, dialect,
          title: title || file.name.replace(/\.[^.]+$/, ''),
          prev_tail: parts.length ? parts[parts.length - 1].slice(-300) : '',
        });
        if (!d.ok) fail(d.error || 'Gagal mentranskrip', d.upgrade);
        if (d.teks) parts.push(d.teks);
      }
      if (!parts.length) fail('Tidak ada ucapan yang terdengar di rekaman ini.');
      return parts.join('\n');
    }
    fail('Jenis file tidak didukung.');
  };

  const startProcessing = async (files) => {
    setError('');
    setUpgradeMsg('');
    const list = files.map(file => {
      const { kind, error: err } = window.detectFileKind(file);
      if (!kind) return { file, kind: null, status: 'skipped', note: err };
      if (isTrial && PRO_ONLY_KINDS.includes(kind)) return { file, kind, status: 'skipped', note: 'Khusus pelanggan AI Partner' };
      return { file, kind, status: 'waiting', note: 'Menunggu' };
    });
    setItems(list);
    setStep('process');
    cancelRef.current = false;

    const results = [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].status === 'skipped') continue;
      if (cancelRef.current) break;
      patchItem(i, { status: 'working', note: 'Memproses…', progress: null });
      try {
        const out = await processFile(list[i], i);
        const res = typeof out === 'string' || !out ? { text: out || '' } : out;
        const text = (res.text || '').trim();
        if (!text) throw new Error('Tidak ada teks yang bisa dibaca dari file ini.');
        results.push({ name: list[i].file.name, kind: list[i].kind, text });
        const note = [`${text.length.toLocaleString('id-ID')} karakter`, ...(res.notes || [])].join(' · ');
        patchItem(i, { status: res.pending ? 'partial' : 'done', note, progress: null, pending: res.pending || null });
      } catch (err) {
        patchItem(i, { status: 'error', note: err.message, progress: null });
        if (err.upgrade) setUpgradeMsg(err.message);
      }
    }

    if (results.length === 0) return;
    const combined = results.length === 1
      ? results[0].text
      : results.map(r => `— ${r.name} —\n${r.text}`).join('\n\n');
    setContent(prev => prev ? `${prev}\n\n${combined}` : combined);
    if (!title) setTitle(results[0].name.replace(/\.[^.]+$/, '').slice(0, 120));
    setSourceKinds(prev => [...new Set([...prev, ...results.map(r => r.kind)])]);
  };

  const sourceType = sourceKinds.length === 0 ? 'teks' : sourceKinds.length === 1 ? sourceKinds[0] : 'campuran';
  const processing = items.some(it => it.status === 'working' || it.status === 'waiting');
  const doneCount = items.filter(it => it.status === 'done' || it.status === 'partial').length;

  const handleFiles = (fileList) => {
    const files = [...(fileList || [])];
    if (files.length) startProcessing(files);
  };

  const handleSave = async () => {
    if (content.trim().length < 50) { setError('Materi terlalu pendek (minimal 50 karakter).'); return; }
    setSaving(true);
    setError('');
    const data = await aiCall('create', { title, maddah_id: maddahId || null, source_type: sourceType, content });
    setSaving(false);
    if (!data.ok) {
      if (data.upgrade) setUpgradeMsg(data.error);
      else setError(data.error || 'Gagal menyimpan');
      return;
    }
    if (data.truncated) toast.push(`Materi dipotong ke ${(data.limit || MAX_CONTENT).toLocaleString('id-ID')} karakter pertama.`);
    navigate(`/ai-partner/${data.id}`);
  };

  const Header = ({ n, label }) => (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        {['pick', 'process', 'review'].map((s, i) => (
          <span key={s} className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center ${i + 1 <= n ? 'bg-emerald-500 text-black' : 'bg-white/8 text-ink-soft'}`}>{i + 1}</span>
        ))}
        <h2 className="font-display text-lg md:text-xl font-semibold text-ink ml-1">{label}</h2>
      </div>
      <button onClick={() => { cancelRef.current = true; onCancel(); }} className="w-9 h-9 rounded-lg text-ink-muted hover:text-ink hover:bg-white/5 flex items-center justify-center">
        <Icon name="x" className="w-5 h-5"/>
      </button>
    </div>
  );

  if (upgradeMsg && step !== 'review' && !processing && doneCount === 0) {
    return (
      <div className="mb-8">
        <UpgradeCard title="Butuh langganan AI Partner" message={upgradeMsg}/>
        <div className="text-center mt-3">
          <button onClick={() => { setUpgradeMsg(''); setStep('pick'); setItems([]); }} className="text-xs text-ink-muted hover:text-ink underline">Kembali</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-glass-strong p-5 md:p-7 mb-8">
      {step === 'pick' && (
        <>
          <Header n={1} label="Tambah materi"/>
          <input ref={fileRef} type="file" multiple className="hidden" accept={window.ACCEPTED_FILE_TYPES}
            onChange={e => { const f = e.target.files; handleFiles(f); e.target.value = ''; }}/>
          <button
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            className={`w-full rounded-2xl border-2 border-dashed px-6 py-10 md:py-14 text-center transition ${dragOver ? 'border-emerald-400 bg-emerald-500/8' : 'border-white/15 hover:border-emerald-500/40 hover:bg-white/3'}`}>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-emerald-500/12 border border-emerald-500/25">
              <Icon name="upload" className="w-6 h-6 text-emerald-300"/>
            </div>
            <div className="font-display text-lg text-ink font-semibold mb-1">Taruh file di sini, atau ketuk untuk memilih</div>
            <div className="text-sm text-ink-muted">Bisa beberapa file sekaligus — misalnya semua foto diktat satu bab.</div>
          </button>
          <div className="flex flex-wrap gap-1.5 justify-center mt-4">
            {FORMAT_CHIPS.map(c => {
              const locked = isTrial && c.kinds.some(k => PRO_ONLY_KINDS.includes(k));
              return <Pill key={c.label} tone={locked ? 'gold' : 'default'}>{locked && <Icon name="crown" className="w-3 h-3"/>}{c.label}</Pill>;
            })}
          </div>
          <div className="text-center mt-5">
            <button onClick={() => setStep('review')} className="text-sm text-emerald-300 hover:text-emerald-200 underline underline-offset-2">
              Atau tempel teks langsung
            </button>
          </div>
          {!isTrial && (
            <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
              <span className="text-xs text-ink-muted">Bahasa rekaman kuliah:</span>
              {DIALECTS.map(d => (
                <button key={d.id} onClick={() => chooseDialect(d.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition ${dialect === d.id ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200' : 'border-white/10 text-ink-muted hover:text-ink'}`}>
                  {d.label}
                </button>
              ))}
            </div>
          )}
          <p className="text-[11px] text-ink-soft text-center mt-4 leading-relaxed">
            Dokumen dibaca di perangkatmu; foto & rekaman dikirim ke AI untuk dibaca. File aslinya tidak disimpan.
            {!isTrial && ` Rekaman maks ${window.MAX_MEDIA_MINUTES || 30} menit per file.`}
          </p>
        </>
      )}

      {step === 'process' && (
        <>
          <Header n={2} label={processing ? 'Membaca materi…' : 'Selesai dibaca'}/>
          <div className="rounded-xl bg-white/3 border border-white/8 px-4 mb-5">
            {items.map((it, i) => <FileRow key={i} item={it} busy={processing} onContinue={it.pending ? () => continueFile(i) : null}/>)}
          </div>
          {upgradeMsg && <div className="mb-4"><UpgradeCard compact title="Sebagian file butuh langganan" message={upgradeMsg}/></div>}
          <div className="flex justify-end gap-2 flex-wrap">
            {processing ? (
              <button onClick={() => { cancelRef.current = true; }} className="btn btn-ghost text-sm px-4 py-2">Hentikan</button>
            ) : (
              <>
                <button onClick={() => setStep('pick')} className="btn btn-ghost text-sm px-4 py-2">Tambah file lain</button>
                <button onClick={() => setStep('review')} disabled={!content.trim()} className="btn btn-primary text-sm px-5 py-2">
                  Lanjut cek hasil <Icon name="arrowRight" className="w-4 h-4"/>
                </button>
              </>
            )}
          </div>
        </>
      )}

      {step === 'review' && (
        <>
          <Header n={3} label="Cek & simpan"/>
          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Judul materi (misal: Bab Thaharah)"
              className={aiInputClass} maxLength={120}/>
            <select value={maddahId} onChange={e => setMaddahId(e.target.value)} className={aiInputClass}>
              <option value="">Maddah (opsional)</option>
              {maddahOptions.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={12}
            placeholder="Tempel isi materi, diktat, atau talkhisan di sini…"
            className={`${aiInputClass} leading-relaxed`} dir="auto"
            style={{ fontFamily: 'inherit', fontSize: 15 }}/>
          <div className="flex items-center justify-between gap-3 mt-1 flex-wrap">
            <div className={`text-[11px] ${content.length > MAX_CONTENT ? 'text-amber-400' : 'text-ink-soft'}`}>
              {content.length.toLocaleString('id-ID')} / {MAX_CONTENT.toLocaleString('id-ID')} karakter
              {content.length > MAX_CONTENT && ' — kelebihannya akan dipotong'}
            </div>
            <div className="text-[11px] text-ink-soft">Rapikan dulu bagian yang salah baca supaya hasil AI lebih akurat.</div>
          </div>
          {isTrial && (
            <div className="mt-4 text-xs text-gold-300 bg-gold-500/8 border border-gold-500/20 rounded-xl px-4 py-3">
              Ini jatah coba gratismu: 1 materi. Pastikan isinya sudah benar sebelum disimpan.
            </div>
          )}
          {error && <div className="text-sm text-rose-400 mt-3">{error}</div>}
          {upgradeMsg && <div className="mt-4"><UpgradeCard compact title="Jatah coba gratis habis" message={upgradeMsg}/></div>}
          <div className="flex justify-between gap-2 mt-5 flex-wrap">
            <button onClick={() => setStep('pick')} className="btn btn-ghost text-sm px-4 py-2">
              <Icon name="upload" className="w-4 h-4"/> Tambah dari file
            </button>
            <button onClick={handleSave} disabled={saving || !content.trim()} className="btn btn-primary text-sm px-6 py-2.5">
              {saving ? 'Menyimpan…' : 'Simpan & mulai belajar'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

window.CreateWizard = CreateWizard;
