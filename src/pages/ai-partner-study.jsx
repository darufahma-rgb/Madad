import React, { useState, useEffect, useRef, useMemo } from 'react';
import MarkdownArab from '../components/MarkdownArab.jsx';
/* Talqeeh — AI Partner: tab-tab belajar di halaman materi */

const BOX_INTERVAL_DAYS = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 14 };
const TRIAL_KINDS = ['summary', 'flashcards', 'quiz', 'glossary'];

const hasValue = (v) => Array.isArray(v) ? v.length > 0 : !!v;

// Boleh memanggil AI untuk jenis ini? (server tetap memeriksa ulang)
const canGenerate = (access, kind, set) => {
  if (access.tier === 'pro') return true;
  // Flashcard bisa berisi kartu manual, jadi "sudah dibuat" dilihat dari penanda progres.
  const made = set.progress?.[kind] || (kind !== 'flashcards' && hasValue(set[kind]));
  return access.isTrialSet && TRIAL_KINDS.includes(kind) && !made;
};

const markProgress = (set, setSet, key) => {
  if (set.progress?.[key]) return;
  setSet(s => ({ ...s, progress: { ...(s.progress || {}), [key]: true } }));
  aiCall('save-progress', { set_id: set.id, progress: { [key]: true } });
};

const useGenerate = (set, setSet, kind, field) => {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [upgrade, setUpgrade] = useState('');
  const generate = async (extra = {}) => {
    setBusy(true);
    const data = await aiCall('generate', { set_id: set.id, kind, ...extra });
    setBusy(false);
    if (!data.ok) {
      if (data.upgrade) setUpgrade(data.error);
      else toast.push(data.error || 'Gagal membuat');
      return;
    }
    setSet(s => ({
      ...s,
      [field]: data.data,
      progress: { ...(s.progress || {}), [kind]: true },
      ...(kind === 'quiz' ? { quiz_best_score: null } : {}),
      ...(kind === 'essays' ? { essay_attempts: [] } : {}),
      ...(kind === 'summary' ? { summary_lang: data.lang } : {}),
    }));
  };
  return { busy, generate, upgrade };
};

const ToolbarButton = ({ icon, children, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}
    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/4 text-ink-muted hover:text-ink hover:border-emerald-500/30 disabled:opacity-50">
    <Icon name={icon} className="w-3.5 h-3.5"/>{children}
  </button>
);

const useKurasahSave = () => {
  const toast = useToast();
  return (title, body, tags) => {
    try {
      saveToKurasah(title, body, tags);
      toast.push('Tersimpan di Kurasah');
    } catch {
      toast.push('Gagal menyimpan ke Kurasah');
    }
  };
};

/* ── 1a. Ringkasan ── */

const SUMMARY_LANG_OPTIONS = [
  { id: 'id',    label: 'Indonesia' },
  { id: 'ar',    label: 'العربية' },
  { id: 'id+ar', label: 'Dwibahasa' },
];

const LangPicker = ({ value, onChange, disabled }) => (
  <div className="inline-flex rounded-xl border border-white/10 bg-white/4 p-1 gap-1">
    {SUMMARY_LANG_OPTIONS.map(o => (
      <button key={o.id} onClick={() => onChange(o.id)} disabled={disabled}
        className={`text-xs px-3 py-1.5 rounded-lg transition ${value === o.id ? 'bg-emerald-500/20 text-emerald-200' : 'text-ink-muted hover:text-ink'}`}>
        {o.label}
      </button>
    ))}
  </div>
);

const SummaryTab = ({ set, setSet, access }) => {
  const { busy, generate, upgrade } = useGenerate(set, setSet, 'summary', 'summary');
  const [lang, setLang] = useState(set.summary_lang || 'id');
  const saveKurasah = useKurasahSave();

  useEffect(() => { if (set.summary) markProgress(set, setSet, 'summary_read'); }, [!!set.summary]);

  if (upgrade) return <UpgradeCard message={upgrade}/>;
  if (!set.summary || busy) {
    if (!busy && !canGenerate(access, 'summary', set)) return <UpgradeCard/>;
    return (
      <GeneratePanel icon="bookOpen" title="Ringkasan gaya kitab"
        desc="Poin inti, ta'rif lughatan & istilahan, taqsim, syarat & rukun, khilaf & tarjih, dalil, dan perkiraan soal imtihan — dari materimu sendiri."
        cta="Buat ringkasan" busy={busy} onGenerate={() => generate({ lang })}>
        <div className="mb-5"><LangPicker value={lang} onChange={setLang}/></div>
      </GeneratePanel>
    );
  }

  const isArabic = set.summary_lang === 'ar';
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        {access.tier === 'pro'
          ? <LangPicker value={set.summary_lang || 'id'} onChange={(l) => { setLang(l); generate({ lang: l }); }}/>
          : <Pill>{SUMMARY_LANG_OPTIONS.find(o => o.id === (set.summary_lang || 'id'))?.label}</Pill>}
        <div className="flex gap-2">
          <ToolbarButton icon="copy" onClick={() => navigator.clipboard?.writeText(set.summary)}>Salin</ToolbarButton>
          <ToolbarButton icon="bookmark" onClick={() => saveKurasah(`Ringkasan — ${set.title}`, set.summary, ['ringkasan'])}>Simpan ke Kurasah</ToolbarButton>
        </div>
      </div>
      <div className="card-glass p-5 md:p-8">
        <MarkdownArab content={set.summary} ltr={!isArabic}
          style={{ color: 'inherit', fontSize: isArabic ? 19 : 15, lineHeight: isArabic ? 2.1 : 1.85, fontFamily: isArabic ? '"Noto Naskh Arabic", serif' : 'inherit' }}/>
      </div>
    </div>
  );
};

/* ── 1b. Peta konsep ── */

// bulk = { open: true | false | null, n } — n berubah tiap tombol "Buka/Tutup semua" ditekan.
const MindNode = ({ node, depth, bulk }) => {
  const [open, setOpen] = useState(depth < 2);
  useEffect(() => { if (bulk.open !== null) setOpen(bulk.open); }, [bulk.n]);
  const kids = node.children || [];
  const tone = ['border-emerald-500/50 bg-emerald-500/12', 'border-gold-500/40 bg-gold-500/8', 'border-white/15 bg-white/5', 'border-white/10 bg-white/3'][Math.min(depth, 3)];
  return (
    <div className={depth > 0 ? 'relative pl-5 md:pl-7' : ''}>
      {depth > 0 && <span className="absolute left-0 top-0 bottom-0 w-px bg-white/10"/>}
      {depth > 0 && <span className="absolute left-0 top-6 w-4 md:w-6 h-px bg-white/15"/>}
      <button onClick={() => kids.length && setOpen(o => !o)}
        className={`text-left rounded-xl border px-4 py-2.5 my-1.5 inline-flex items-start gap-2 max-w-full ${tone} ${kids.length ? 'cursor-pointer' : 'cursor-default'}`}>
        {kids.length > 0 && <Icon name={open ? 'chevronDown' : 'chevronRight'} className="w-4 h-4 mt-0.5 text-ink-soft flex-shrink-0"/>}
        <span className="min-w-0">
          <span className={`block text-ink ${depth === 0 ? 'font-display text-lg font-semibold' : 'text-sm font-medium'}`}>{node.label}</span>
          {node.ar && <span dir="rtl" className="block text-gold-300" style={{ fontFamily: '"Noto Naskh Arabic", serif', fontSize: depth === 0 ? 20 : 16, lineHeight: 1.8 }}>{node.ar}</span>}
          {node.note && <span className="block text-xs text-ink-muted mt-0.5">{node.note}</span>}
        </span>
      </button>
      {open && kids.length > 0 && (
        <div>{kids.map((k, i) => <MindNode key={i} node={k} depth={depth + 1} bulk={bulk}/>)}</div>
      )}
    </div>
  );
};

const mindmapToMarkdown = (node, depth = 0) =>
  `${'  '.repeat(depth)}- **${node.label}**${node.ar ? ` — ${node.ar}` : ''}${node.note ? `: ${node.note}` : ''}\n` +
  (node.children || []).map(c => mindmapToMarkdown(c, depth + 1)).join('');

const MindmapTab = ({ set, setSet, access }) => {
  const { busy, generate, upgrade } = useGenerate(set, setSet, 'mindmap', 'mindmap');
  const [bulk, setBulk] = useState({ open: null, n: 0 });
  const saveKurasah = useKurasahSave();
  useEffect(() => { if (set.mindmap) markProgress(set, setSet, 'mindmap_viewed'); }, [!!set.mindmap]);

  if (upgrade) return <UpgradeCard message={upgrade}/>;
  if (!set.mindmap || busy) {
    if (!busy && !canGenerate(access, 'mindmap', set)) {
      return <UpgradeCard title="Peta konsep khusus pelanggan" message="Lihat seluruh materi sebagai pohon taqsimat: ta'rif, pembagian, syarat, rukun, khilaf, dan dalil — bisa dibuka-tutup per cabang."/>;
    }
    return (
      <GeneratePanel icon="network" title="Peta konsep (taqsimat)" eta="20–40 detik"
        desc="Seluruh materi sebagai pohon bercabang: ta'rif, pembagian, syarat, rukun, khilaf, dan dalil. Cocok untuk muraja'ah cepat sebelum imtihan."
        cta="Buat peta konsep" busy={busy} onGenerate={() => generate()}/>
    );
  }

  return (
    <div>
      <div className="flex gap-2 mb-3 flex-wrap justify-end">
        <ToolbarButton icon="chevronDown" onClick={() => setBulk(b => ({ open: true, n: b.n + 1 }))}>Buka semua</ToolbarButton>
        <ToolbarButton icon="chevronUp" onClick={() => setBulk(b => ({ open: false, n: b.n + 1 }))}>Tutup semua</ToolbarButton>
        <ToolbarButton icon="bookmark" onClick={() => saveKurasah(`Peta konsep — ${set.title}`, mindmapToMarkdown(set.mindmap), ['peta-konsep'])}>Simpan ke Kurasah</ToolbarButton>
        <ToolbarButton icon="refresh" onClick={() => generate()} disabled={busy}>Buat ulang</ToolbarButton>
      </div>
      <div className="card-glass p-4 md:p-6 overflow-x-auto">
        <MindNode node={set.mindmap} depth={0} bulk={bulk}/>
      </div>
    </div>
  );
};

/* ── 1c. Materi asli + terjemah, i'rab, harakat ── */

const IrabResult = ({ result, onSaveKurasah, onAddCard }) => (
  <div className="space-y-5">
    <div className="flex items-start gap-2">
      <ArabicText size={26} className="flex-1">{result.teks}</ArabicText>
      <SpeakButton text={result.teks}/>
    </div>
    <div className="grid md:grid-cols-2 gap-3">
      <div className="rounded-xl bg-white/4 border border-white/8 p-4">
        <div className="text-[11px] uppercase tracking-wider text-gold-400 mb-1">Terjemah harfiyah</div>
        <div className="text-sm text-ink leading-relaxed">{result.terjemah_harfiyah}</div>
      </div>
      <div className="rounded-xl bg-white/4 border border-white/8 p-4">
        <div className="text-[11px] uppercase tracking-wider text-emerald-300 mb-1">Terjemah bebas</div>
        <div className="text-sm text-ink leading-relaxed">{result.terjemah_bebas}</div>
      </div>
    </div>
    <div>
      <div className="text-[11px] uppercase tracking-wider text-gold-400 mb-2">I'rab</div>
      <div className="rounded-xl border border-white/8 overflow-hidden">
        {result.irab.map((w, i) => (
          <div key={i} className="grid grid-cols-[minmax(70px,auto)_1fr] gap-3 px-4 py-3 border-b border-white/6 last:border-0 odd:bg-white/2">
            <div dir="rtl" className="text-gold-300 text-right" style={{ fontFamily: '"Noto Naskh Arabic", serif', fontSize: 20 }}>{w.kata}</div>
            <div className="min-w-0">
              <div dir="rtl" className="text-ink text-right" style={{ fontFamily: '"Noto Naskh Arabic", serif', fontSize: 16, lineHeight: 1.8 }}>{w.irab}</div>
              {w.penjelasan && <div className="text-xs text-ink-muted mt-0.5">{w.penjelasan}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
    {result.mufradat?.length > 0 && (
      <div>
        <div className="text-[11px] uppercase tracking-wider text-gold-400 mb-2">Mufradat</div>
        <div className="flex flex-wrap gap-2">
          {result.mufradat.map((m, i) => (
            <span key={i} className="px-3 py-1.5 rounded-xl bg-white/4 border border-white/8 text-sm text-ink">
              <span dir="rtl" style={{ fontFamily: '"Noto Naskh Arabic", serif', fontSize: 17 }}>{m.ar}</span> · {m.makna}
            </span>
          ))}
        </div>
      </div>
    )}
    {result.catatan && (
      <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/20 p-4 text-sm text-ink-muted leading-relaxed">
        <span className="text-emerald-300 font-medium">Faedah: </span>{result.catatan}
      </div>
    )}
    <div className="flex gap-2 flex-wrap">
      <ToolbarButton icon="layers" onClick={onAddCard}>Jadikan flashcard</ToolbarButton>
      <ToolbarButton icon="bookmark" onClick={onSaveKurasah}>Simpan ke Kurasah</ToolbarButton>
    </div>
  </div>
);

const irabToMarkdown = (r) =>
  `## ${r.teks}\n\n**Terjemah harfiyah:** ${r.terjemah_harfiyah}\n\n**Terjemah bebas:** ${r.terjemah_bebas}\n\n| Kata | I'rab | Penjelasan |\n|---|---|---|\n` +
  r.irab.map(w => `| ${w.kata} | ${w.irab} | ${w.penjelasan} |`).join('\n') +
  (r.catatan ? `\n\n**Faedah:** ${r.catatan}` : '');

const IrabModal = ({ set, setSet, text, onClose }) => {
  const toast = useToast();
  const saveKurasah = useKurasahSave();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    aiCall('analyze', { set_id: set.id, mode: 'irab', text }).then(d => {
      if (!alive) return;
      if (!d.ok) { setError(d.error || 'Gagal menganalisis'); return; }
      setResult(d.data);
      if (!d.cached) setSet(s => ({ ...s, analyses: [...(s.analyses || []), { mode: 'irab', input: text, output: d.data }] }));
    });
    return () => { alive = false; };
  }, [text]);

  const addCard = async () => {
    const d = await aiCall('add-cards', { set_id: set.id, cards: [{ q: result.teks, a: result.terjemah_bebas }] });
    if (d.ok) { setSet(s => ({ ...s, flashcards: d.data })); toast.push(d.added ? 'Ditambahkan ke flashcard' : 'Kartu ini sudah ada'); }
    else toast.push(d.error || 'Gagal menambah kartu');
  };

  return (
    <Modal open onClose={onClose} size="lg">
      <div className="p-5 md:p-7 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Pill tone="emerald">Terjemah & I'rab</Pill>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg text-ink-muted hover:bg-white/5 flex items-center justify-center">
            <Icon name="x" className="w-4 h-4"/>
          </button>
        </div>
        {error ? (
          <div className="text-sm text-rose-400">{error}</div>
        ) : !result ? (
          <div>
            <ArabicText size={22} className="mb-4 opacity-70">{text}</ArabicText>
            <div className="text-xs text-ink-soft mb-4">AI sedang menerjemahkan dan menganalisis i'rab…</div>
            <Skeleton lines={7}/>
          </div>
        ) : (
          <IrabResult result={result} onAddCard={addCard}
            onSaveKurasah={() => saveKurasah(`I'rab — ${result.teks.slice(0, 40)}`, irabToMarkdown(result), ['irab'])}/>
        )}
      </div>
    </Modal>
  );
};

const splitParagraphs = (content) =>
  content.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

const MaterialTab = ({ set, setSet, access }) => {
  const toast = useToast();
  const containerRef = useRef(null);
  const [selected, setSelected] = useState('');
  const [irabText, setIrabText] = useState(null);
  const [busyPara, setBusyPara] = useState(null);
  const [showHarakat, setShowHarakat] = useState(true);
  const isPro = access.tier === 'pro';
  const paragraphs = useMemo(() => splitParagraphs(set.content), [set.content]);
  const analyses = set.analyses || [];
  const harakatOf = (p) => analyses.find(a => a.mode === 'tasykil' && a.input === p)?.output;
  const irabHistory = analyses.filter(a => a.mode === 'irab').slice().reverse();

  useEffect(() => { markProgress(set, setSet, 'material_viewed'); }, []);

  useEffect(() => {
    let timer;
    const onSel = () => {
      const sel = window.getSelection();
      const text = sel?.toString().trim() || '';
      clearTimeout(timer);
      if (text && containerRef.current?.contains(sel.anchorNode)) { setSelected(text); return; }
      // Ditunda supaya ketukan tombol di bar tidak kalah cepat dengan hilangnya seleksi.
      timer = setTimeout(() => setSelected(''), 400);
    };
    document.addEventListener('selectionchange', onSel);
    return () => { document.removeEventListener('selectionchange', onSel); clearTimeout(timer); };
  }, []);

  const tasykil = async (p, i) => {
    if (!isPro) { openAiUpgrade(); return; }
    setBusyPara(i);
    const d = await aiCall('analyze', { set_id: set.id, mode: 'tasykil', text: p });
    setBusyPara(null);
    if (!d.ok) { toast.push(d.error || 'Gagal memberi harakat'); return; }
    if (!d.cached) setSet(s => ({ ...s, analyses: [...(s.analyses || []), { mode: 'tasykil', input: p, output: d.data }] }));
    setShowHarakat(true);
  };

  const selectedArabic = hasArabic(selected);
  const tooLong = selected.length > 400;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <p className="text-xs text-ink-muted">
          {isPro
            ? 'Blok/tekan-tahan kalimat Arab untuk terjemah & i\'rab. Tombol "Harakat" memberi harakat per paragraf.'
            : 'Terjemah, i\'rab, dan harakat otomatis khusus pelanggan AI Partner.'}
        </p>
        {analyses.some(a => a.mode === 'tasykil') && (
          <ToolbarButton icon="type" onClick={() => setShowHarakat(v => !v)}>{showHarakat ? 'Teks asli' : 'Tampilkan harakat'}</ToolbarButton>
        )}
      </div>

      <div ref={containerRef} className="card-glass p-4 md:p-7 space-y-4">
        {paragraphs.map((p, i) => {
          const arabic = isMostlyArabic(p);
          const vowelled = showHarakat && harakatOf(p);
          return (
            <div key={i} className="group relative">
              {arabic ? (
                <ArabicText size={21}>{vowelled || p}</ArabicText>
              ) : (
                <p dir="auto" className="text-[15px] text-ink leading-relaxed whitespace-pre-wrap">{p}</p>
              )}
              {arabic && (
                <div className="flex gap-1.5 mt-1 justify-end opacity-80">
                  <SpeakButton text={vowelled || p}/>
                  {!harakatOf(p) && p.length <= 6000 && (
                    <button onClick={() => tasykil(p, i)} disabled={busyPara !== null}
                      className="text-[11px] px-2.5 py-1 rounded-lg border border-white/10 text-ink-muted hover:text-emerald-300 hover:border-emerald-500/30 inline-flex items-center gap-1">
                      {!isPro && <Icon name="crown" className="w-3 h-3 text-gold-300"/>}
                      {busyPara === i ? 'Memberi harakat…' : 'Harakat'}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {irabHistory.length > 0 && (
        <div className="mt-6">
          <div className="text-[11px] uppercase tracking-wider text-gold-400 mb-2">Riwayat terjemah & i'rab</div>
          <div className="flex flex-wrap gap-2">
            {irabHistory.slice(0, 12).map((a, i) => (
              <button key={i} onClick={() => setIrabText(a.input)} dir="rtl"
                className="px-3 py-1.5 rounded-xl bg-white/4 border border-white/8 text-ink hover:border-emerald-500/30 max-w-full truncate"
                style={{ fontFamily: '"Noto Naskh Arabic", serif', fontSize: 16 }}>
                {a.input.length > 40 ? a.input.slice(0, 40) + '…' : a.input}
              </button>
            ))}
          </div>
        </div>
      )}

      {selected && selectedArabic && (
        <div className="fixed left-1/2 -translate-x-1/2 z-[70] flex gap-2 p-2 rounded-2xl border border-emerald-500/30 shadow-2xl"
          style={{ bottom: 'calc(var(--tabbar-height, 0px) + 20px)', background: 'rgba(12,12,12,0.95)', backdropFilter: 'blur(12px)' }}>
          {tooLong ? (
            <span className="text-xs text-ink-muted px-3 py-2">Pilih maks 400 huruf untuk i'rab</span>
          ) : (
            <button onClick={() => isPro ? setIrabText(selected) : openAiUpgrade()} className="btn btn-primary text-xs px-4 py-2">
              {!isPro && <Icon name="crown" className="w-3.5 h-3.5"/>} Terjemah & I'rab
            </button>
          )}
          <button onClick={() => speakArabic(selected, () => toast.push('Perangkat ini belum punya suara bahasa Arab.'))} className="btn btn-ghost text-xs px-3 py-2">
            <Icon name="headphones" className="w-3.5 h-3.5"/> Dengar
          </button>
        </div>
      )}

      {irabText && <IrabModal set={set} setSet={setSet} text={irabText} onClose={() => setIrabText(null)}/>}
    </div>
  );
};

/* ── 2a. Flashcard ── */

const isDue = (card) => !card.due || Date.parse(card.due) <= Date.now();
const nextDue = (box) => new Date(Date.now() + BOX_INTERVAL_DAYS[box] * 86400000).toISOString();

const CardFace = ({ text, big }) => (
  isMostlyArabic(text)
    ? <ArabicText size={big ? 28 : 22} className="text-center">{text}</ArabicText>
    : <div className={`text-ink leading-relaxed ${big ? 'text-xl font-display' : 'text-base'}`} dir="auto">{text}</div>
);

const FlashcardTab = ({ set, setSet, access }) => {
  const { busy, generate, upgrade } = useGenerate(set, setSet, 'flashcards', 'flashcards');
  const cards = set.flashcards || [];
  const dueQueue = () => cards.map((c, i) => i).filter(i => isDue(cards[i]));
  const [queue, setQueue]     = useState(dueQueue);
  const [flipped, setFlipped] = useState(false);
  const saveTimer = useRef(null);
  const pendingStates = useRef(null);

  const flush = () => {
    if (!pendingStates.current) return;
    aiCall('save-progress', { set_id: set.id, card_states: pendingStates.current });
    pendingStates.current = null;
  };
  useEffect(() => () => { clearTimeout(saveTimer.current); flush(); }, []);
  // Reset hanya saat set berganti atau kartu dibuat ulang/ditambah (bukan saat box/due berubah)
  useEffect(() => { setQueue(dueQueue()); setFlipped(false); }, [set.id, cards.length, cards[0]?.q]);

  if (upgrade) return <UpgradeCard message={upgrade}/>;
  if (cards.length === 0 || busy) {
    if (!busy && !canGenerate(access, 'flashcards', set)) return <UpgradeCard/>;
    return (
      <GeneratePanel icon="layers" title="Flashcard hafalan" busy={busy} onGenerate={() => generate()}
        desc="Kartu istilah, ta'rif, taqsim, dan dalil. Kartu yang sudah hafal muncul lagi 1, 3, 7, lalu 14 hari kemudian — metode pengulangan berjarak."
        cta="Buat flashcard"/>
    );
  }

  const answer = (knew) => {
    const idx = queue[0];
    const card = cards[idx];
    const box = knew ? Math.min(5, (card.box || 1) + 1) : 1;
    const updated = cards.map((c, i) => i === idx ? { ...c, box, due: nextDue(box) } : c);
    setSet(s => ({ ...s, flashcards: updated }));
    setQueue(q => knew ? q.slice(1) : [...q.slice(1), idx]);
    setFlipped(false);
    pendingStates.current = updated.map(c => ({ box: c.box, due: c.due }));
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flush, 1500);
  };

  const mastered = cards.filter(c => (c.box || 1) >= 4).length;
  const current = queue?.length ? cards[queue[0]] : null;
  const aiNeverMade = !set.progress?.flashcards && canGenerate(access, 'flashcards', set);

  return (
    <div>
      {aiNeverMade && (
        <div className="card-glass p-4 mb-4 flex items-center gap-3 flex-wrap" style={{ border: '1px solid rgba(62,207,142,0.25)' }}>
          <Icon name="sparkles" className="w-4 h-4 text-emerald-300"/>
          <span className="text-sm text-ink-muted flex-1 min-w-[200px]">Kartu di sini baru dari mufradat/i'rab. Buat juga flashcard lengkap dari seluruh materi?</span>
          <button onClick={() => generate()} className="btn btn-primary text-xs px-4 py-2">Buat dari materi</button>
        </div>
      )}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-2 rounded-full bg-white/8 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-gold-400" style={{ width: `${Math.round((mastered / cards.length) * 100)}%` }}/>
        </div>
        <span className="text-xs text-ink-muted flex-shrink-0">{mastered}/{cards.length} hafal</span>
      </div>

      {current ? (
        <>
          <div role="button" tabIndex={0} onClick={() => setFlipped(f => !f)}
            onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFlipped(f => !f); } }}
            className="card-glass-strong w-full min-h-[240px] p-6 md:p-10 flex flex-col items-center justify-center text-center cursor-pointer relative"
            style={{ border: flipped ? '1px solid rgba(62,207,142,0.35)' : undefined }}>
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-gold-400">{flipped ? 'Jawaban' : 'Pertanyaan'}</span>
              <span className="text-[11px] text-ink-soft">sisa {queue.length}</span>
            </div>
            <div className="w-full mt-4"><CardFace text={flipped ? current.a : current.q} big={!flipped}/></div>
            <div className="absolute bottom-3 right-3"><SpeakButton text={flipped ? current.a : current.q}/></div>
            {!flipped && <div className="text-xs text-ink-soft mt-6">Ketuk untuk lihat jawaban</div>}
          </div>
          {flipped && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button onClick={() => answer(false)} className="btn btn-ghost py-3.5 text-sm" style={{ borderColor: 'rgba(255,184,77,0.4)', color: '#ffb84d' }}>
                Belum hafal
              </button>
              <button onClick={() => answer(true)} className="btn btn-primary py-3.5 text-sm">Hafal ✓</button>
            </div>
          )}
        </>
      ) : (
        <div className="card-glass p-8 text-center">
          <div className="text-3xl mb-2">🎉</div>
          <p className="text-ink text-sm mb-2">Semua kartu yang jatuh tempo sudah kamu latih.</p>
          <p className="text-ink-muted text-xs mb-5">Kartu yang sudah hafal muncul lagi sesuai jadwal (1, 3, 7, 14 hari).</p>
          <div className="flex gap-2 justify-center flex-wrap">
            <button onClick={() => setQueue(cards.map((c, i) => i))} className="btn btn-ghost text-sm px-4 py-2">Latih semua lagi</button>
            {access.tier === 'pro' && (
              <button onClick={() => generate()} disabled={busy} className="btn btn-ghost text-sm px-4 py-2">Tambah kartu dari AI</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── 2b. Mufradat ── */

const GlossaryTab = ({ set, setSet, access }) => {
  const toast = useToast();
  const { busy, generate, upgrade } = useGenerate(set, setSet, 'glossary', 'glossary');
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState(() => new Set());
  const items = set.glossary || [];
  useEffect(() => { if (items.length) markProgress(set, setSet, 'glossary_viewed'); }, [items.length > 0]);

  if (upgrade) return <UpgradeCard message={upgrade}/>;
  if (items.length === 0 || busy) {
    if (!busy && !canGenerate(access, 'glossary', set)) return <UpgradeCard/>;
    return (
      <GeneratePanel icon="type" title="Mufradat" busy={busy} onGenerate={() => generate()}
        desc="Kosakata & istilah penting dari materi, lengkap dengan harakat, jenis kata, wazan, akar kata, makna sesuai konteks, dan contoh kalimatnya."
        cta="Susun mufradat"/>
    );
  }

  const q = query.trim().toLowerCase();
  const shown = items.map((g, i) => ({ ...g, i })).filter(g => !q || g.ar.includes(query.trim()) || g.makna.toLowerCase().includes(q));

  const toggle = (i) => setPicked(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const addCards = async (indices) => {
    const cards = indices.map(i => items[i]).map(g => ({ q: g.ar, a: `${g.makna}${g.wazan && g.wazan !== '-' ? ` · wazan ${g.wazan}` : ''}` }));
    const d = await aiCall('add-cards', { set_id: set.id, cards });
    if (!d.ok) { toast.push(d.error || 'Gagal menambah kartu'); return; }
    setSet(s => ({ ...s, flashcards: d.data }));
    setPicked(new Set());
    toast.push(d.added ? `${d.added} kartu ditambahkan ke Flashcard` : 'Semua kata ini sudah ada di Flashcard');
  };

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"/>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari kata Arab atau makna…"
            className={`${aiInputClass} pl-9`} dir="auto"/>
        </div>
        <ToolbarButton icon="layers" onClick={() => addCards(picked.size ? [...picked] : items.map((_, i) => i))}>
          {picked.size ? `Jadikan flashcard (${picked.size})` : 'Semua jadi flashcard'}
        </ToolbarButton>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {shown.map(g => (
          <div key={g.i} onClick={() => toggle(g.i)}
            className={`card-glass p-4 cursor-pointer transition ${picked.has(g.i) ? 'ring-1 ring-emerald-400/60' : ''}`}>
            <div className="flex items-start gap-2">
              <span className={`w-5 h-5 mt-1 rounded border flex items-center justify-center flex-shrink-0 ${picked.has(g.i) ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}`}>
                {picked.has(g.i) && <Icon name="check" className="w-3.5 h-3.5 text-black"/>}
              </span>
              <ArabicText size={24} className="flex-1 text-gold-300">{g.ar}</ArabicText>
              <SpeakButton text={g.ar}/>
            </div>
            <div className="text-sm text-ink mt-1">{g.makna}</div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {g.jenis && <Pill>{g.jenis}</Pill>}
              {g.wazan && g.wazan !== '-' && <Pill tone="gold"><span dir="rtl" style={{ fontFamily: '"Noto Naskh Arabic", serif' }}>{g.wazan}</span></Pill>}
              {g.akar && g.akar !== '-' && <Pill><span dir="rtl" style={{ fontFamily: '"Noto Naskh Arabic", serif' }}>{g.akar}</span></Pill>}
            </div>
            {g.contoh && <div dir="rtl" className="text-ink-muted mt-2 text-right" style={{ fontFamily: '"Noto Naskh Arabic", serif', fontSize: 16, lineHeight: 1.9 }}>{g.contoh}</div>}
          </div>
        ))}
      </div>
      {access.tier === 'pro' && (
        <div className="flex justify-end mt-4">
          <ToolbarButton icon="refresh" onClick={() => generate()} disabled={busy}>Susun ulang</ToolbarButton>
        </div>
      )}
    </div>
  );
};

/* ── 3a. Kuis ── */

const QuizTab = ({ set, setSet, access }) => {
  const { busy, generate, upgrade } = useGenerate(set, setSet, 'quiz', 'quiz');
  const quiz = set.quiz || [];
  const [idx, setIdx]       = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore]   = useState(0);
  useEffect(() => { setIdx(0); setPicked(null); setScore(0); }, [set.id, quiz]);

  if (upgrade) return <UpgradeCard message={upgrade}/>;
  if (quiz.length === 0 || busy) {
    if (!busy && !canGenerate(access, 'quiz', set)) return <UpgradeCard/>;
    return (
      <GeneratePanel icon="target" title="Kuis pilihan ganda" busy={busy} onGenerate={() => generate()}
        desc="10 soal gaya imtihan Al-Azhar untuk mengecek pemahamanmu, lengkap dengan pembahasan tiap jawaban."
        cta="Buat kuis"/>
    );
  }

  const finished = idx >= quiz.length;
  const pick = (i) => { if (picked !== null) return; setPicked(i); if (i === quiz[idx].answer) setScore(s => s + 1); };
  const next = () => {
    const nextIdx = idx + 1;
    setIdx(nextIdx);
    setPicked(null);
    if (nextIdx >= quiz.length) {
      aiCall('save-progress', { set_id: set.id, quiz_best_score: score });
      setSet(s => ({ ...s, quiz_best_score: Math.max(s.quiz_best_score ?? 0, score) }));
    }
  };

  if (finished) {
    const pct = Math.round((score / quiz.length) * 100);
    return (
      <div className="card-glass p-8 text-center">
        <div className="text-4xl mb-2">{pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '💪'}</div>
        <div className="font-display text-5xl font-semibold text-ink mb-2">{score}/{quiz.length}</div>
        <p className="text-ink-muted text-sm mb-1">{pct >= 80 ? 'Mumtaz! Pemahamanmu sudah kuat.' : pct >= 60 ? 'Jayyid — ulangi bagian yang salah.' : 'Baca lagi ringkasannya, lalu coba ulang.'}</p>
        {set.quiz_best_score != null && <p className="text-emerald-300 text-xs mb-6">Skor terbaik: {set.quiz_best_score}</p>}
        <div className="flex gap-2 justify-center flex-wrap">
          <button onClick={() => { setIdx(0); setPicked(null); setScore(0); }} className="btn btn-primary text-sm px-5 py-2">Ulangi</button>
          {access.tier === 'pro' && <button onClick={() => generate()} disabled={busy} className="btn btn-ghost text-sm px-5 py-2">Buat soal baru</button>}
        </div>
      </div>
    );
  }

  const q = quiz[idx];
  return (
    <div className="card-glass p-5 md:p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
          <div className="h-full bg-emerald-400 transition-all" style={{ width: `${(idx / quiz.length) * 100}%` }}/>
        </div>
        <span className="text-[11px] text-ink-soft">{idx + 1}/{quiz.length}</span>
      </div>
      <div className="mb-5"><CardFace text={q.question}/></div>
      <div className="space-y-2.5">
        {q.options.map((opt, i) => {
          const state = picked === null ? 'idle' : i === q.answer ? 'correct' : picked === i ? 'wrong' : 'dim';
          const style = {
            idle:    'border-white/10 hover:border-emerald-500/40 bg-white/3',
            correct: 'border-emerald-500/60 bg-emerald-500/15 text-emerald-100',
            wrong:   'border-rose-500/60 bg-rose-500/10 text-rose-200',
            dim:     'border-white/5 opacity-60',
          }[state];
          return (
            <button key={i} onClick={() => pick(i)} disabled={picked !== null}
              className={`w-full text-start px-4 py-3 rounded-xl border text-ink transition flex gap-3 items-start ${style}`}
              dir="auto" style={{ fontSize: hasArabic(opt) ? 18 : 14, fontFamily: hasArabic(opt) ? '"Noto Naskh Arabic", serif' : undefined }}>
              <span className="font-semibold text-sm flex-shrink-0 mt-0.5">{'ABCD'[i]}.</span><span>{opt}</span>
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <>
          {q.explanation && (
            <div className="mt-5 p-4 rounded-xl bg-white/4 border border-white/8 text-sm text-ink-muted leading-relaxed" dir="auto">
              <span className="text-gold-400 font-semibold">Pembahasan: </span>{q.explanation}
            </div>
          )}
          <div className="flex justify-end mt-5">
            <button onClick={next} className="btn btn-primary text-sm px-5 py-2">
              {idx + 1 >= quiz.length ? 'Lihat skor' : 'Lanjut'} <Icon name="arrowRight" className="w-4 h-4"/>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/* ── 3b. Latihan tahriri ── */

const ScoreBadge = ({ skor }) => {
  const tone = skor >= 8 ? 'text-emerald-300 border-emerald-500/40 bg-emerald-500/12' : skor >= 6 ? 'text-gold-300 border-gold-500/40 bg-gold-500/10' : 'text-rose-300 border-rose-500/40 bg-rose-500/10';
  return <div className={`w-20 h-20 rounded-2xl border flex flex-col items-center justify-center flex-shrink-0 ${tone}`}>
    <span className="font-display text-3xl font-semibold leading-none">{skor}</span><span className="text-[10px] opacity-80">dari 10</span>
  </div>;
};

const GradeResult = ({ attempt, essay }) => {
  const [showModel, setShowModel] = useState(false);
  return (
    <div className="space-y-4 mt-5">
      <div className="flex gap-4 items-center">
        <ScoreBadge skor={attempt.skor}/>
        <p className="text-sm text-ink-muted leading-relaxed">{attempt.tips}</p>
      </div>
      {attempt.sudah_benar.length > 0 && (
        <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/20 p-4">
          <div className="text-xs font-semibold text-emerald-300 mb-2">Sudah tepat</div>
          <ul className="space-y-1 text-sm text-ink">{attempt.sudah_benar.map((s, i) => <li key={i} dir="auto">✓ {s}</li>)}</ul>
        </div>
      )}
      {attempt.kurang.length > 0 && (
        <div className="rounded-xl bg-amber-500/8 border border-amber-500/20 p-4">
          <div className="text-xs font-semibold text-amber-300 mb-2">Masih kurang</div>
          <ul className="space-y-1 text-sm text-ink">{attempt.kurang.map((s, i) => <li key={i} dir="auto">• {s}</li>)}</ul>
        </div>
      )}
      {attempt.koreksi_bahasa.length > 0 && (
        <div className="rounded-xl bg-white/4 border border-white/8 p-4">
          <div className="text-xs font-semibold text-gold-300 mb-2">Koreksi bahasa Arab</div>
          <div className="space-y-2">
            {attempt.koreksi_bahasa.map((k, i) => (
              <div key={i} className="text-sm">
                <span dir="rtl" className="line-through text-rose-300" style={{ fontFamily: '"Noto Naskh Arabic", serif', fontSize: 17 }}>{k.salah}</span>
                <span className="text-ink-soft mx-2">→</span>
                <span dir="rtl" className="text-emerald-300" style={{ fontFamily: '"Noto Naskh Arabic", serif', fontSize: 17 }}>{k.benar}</span>
                {k.alasan && <div className="text-xs text-ink-muted">{k.alasan}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
      <button onClick={() => setShowModel(v => !v)} className="text-sm text-emerald-300 hover:text-emerald-200 flex items-center gap-1">
        <Icon name={showModel ? 'chevronUp' : 'chevronDown'} className="w-4 h-4"/> {showModel ? 'Sembunyikan' : 'Lihat'} poin kunci & jawaban model
      </button>
      {showModel && (
        <div className="rounded-xl bg-white/3 border border-white/8 p-4 space-y-3">
          <ul className="space-y-1 text-sm text-ink">{essay.poin.map((p, i) => <li key={i} dir="auto">{i + 1}. {p}</li>)}</ul>
          <MarkdownArab content={essay.jawaban_model} ltr style={{ color: 'inherit', fontSize: 15, lineHeight: 1.9 }}/>
        </div>
      )}
    </div>
  );
};

const EssayTab = ({ set, setSet, access }) => {
  const toast = useToast();
  const { busy, generate, upgrade } = useGenerate(set, setSet, 'essays', 'essays');
  const [active, setActive] = useState(null);
  const [answer, setAnswer] = useState('');
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState(null);
  const essays = set.essays || [];
  const attempts = set.essay_attempts || [];

  if (upgrade) return <UpgradeCard message={upgrade}/>;
  if (essays.length === 0 || busy) {
    if (!busy && !canGenerate(access, 'essays', set)) {
      return <UpgradeCard title="Latihan tahriri khusus pelanggan" message="Latih jawaban esai gaya ujian tulis Azhar (عَرِّفْ، بَيِّنْ، قَارِنْ). AI menilai jawabanmu, menunjukkan poin yang kurang, dan mengoreksi bahasa Arabmu."/>;
    }
    return (
      <GeneratePanel icon="pen" title="Latihan tahriri" eta="20–40 detik" busy={busy} onGenerate={() => generate()}
        desc="Soal esai gaya ujian tulis Al-Azhar: عَرِّفْ، بَيِّنْ، قَارِنْ، اُذْكُرْ مَعَ الدَّلِيلِ. Tulis jawabanmu, AI menilai 0–10, menunjukkan poin yang kurang, dan mengoreksi bahasa Arabmu."
        cta="Buat soal tahriri"/>
    );
  }

  const bestFor = (i) => attempts.filter(a => a.index === i).reduce((m, a) => Math.max(m, a.skor), -1);

  const submit = async () => {
    setGrading(true);
    const d = await aiCall('grade', { set_id: set.id, index: active, answer });
    setGrading(false);
    if (!d.ok) { toast.push(d.error || 'Gagal menilai'); return; }
    setResult(d.data);
    setSet(s => ({ ...s, essay_attempts: [...(s.essay_attempts || []), d.data], progress: { ...(s.progress || {}), essays_done: true } }));
  };

  if (active !== null) {
    const essay = essays[active];
    return (
      <div className="card-glass p-5 md:p-8">
        <button onClick={() => { setActive(null); setResult(null); setAnswer(''); }} className="text-xs text-ink-muted hover:text-ink mb-4 flex items-center gap-1">
          <Icon name="chevronLeft" className="w-4 h-4"/> Semua soal
        </button>
        <div className="flex items-center gap-2 mb-2"><Pill tone="gold">Soal {active + 1}</Pill>{essay.jenis && <Pill>{essay.jenis}</Pill>}</div>
        <ArabicText size={24}>{essay.soal_ar}</ArabicText>
        <p className="text-sm text-ink-muted mb-5">{essay.soal_id}</p>
        {!result ? (
          <>
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={9} maxLength={4000} dir="auto"
              placeholder="Tulis jawabanmu di sini — boleh bahasa Arab atau Indonesia. Tulis seperti di kertas ujian: muqaddimah, isi, dalil, khatimah."
              className={`${aiInputClass} leading-relaxed`} style={{ fontSize: hasArabic(answer) ? 19 : 15, fontFamily: hasArabic(answer) ? '"Noto Naskh Arabic", serif' : 'inherit' }}/>
            <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
              <span className="text-[11px] text-ink-soft">{answer.length}/4000</span>
              <button onClick={submit} disabled={grading || answer.trim().length < 10} className="btn btn-primary text-sm px-5 py-2.5">
                {grading ? 'Duktur AI sedang menilai…' : 'Nilai jawabanku'}
              </button>
            </div>
            {grading && <div className="mt-4"><Skeleton lines={4}/></div>}
          </>
        ) : (
          <>
            <div className="rounded-xl bg-white/3 border border-white/8 p-4 text-ink whitespace-pre-wrap" dir="auto"
              style={{ fontSize: hasArabic(result.answer) ? 18 : 14, fontFamily: hasArabic(result.answer) ? '"Noto Naskh Arabic", serif' : 'inherit' }}>
              {result.answer}
            </div>
            <GradeResult attempt={result} essay={essay}/>
            <div className="flex gap-2 justify-end mt-5 flex-wrap">
              <button onClick={() => setResult(null)} className="btn btn-ghost text-sm px-4 py-2">Perbaiki jawaban</button>
              {active + 1 < essays.length && (
                <button onClick={() => { setActive(active + 1); setResult(null); setAnswer(''); }} className="btn btn-primary text-sm px-4 py-2">
                  Soal berikutnya <Icon name="arrowRight" className="w-4 h-4"/>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-3">
        {essays.map((e, i) => {
          const best = bestFor(i);
          return (
            <button key={i} onClick={() => { setActive(i); setAnswer(''); setResult(null); }}
              className="card-glass w-full p-4 md:p-5 text-start hov-lift flex items-center gap-4">
              <span className="w-9 h-9 rounded-xl bg-gold-500/12 border border-gold-500/25 text-gold-300 text-sm font-semibold flex items-center justify-center flex-shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <ArabicText size={19}>{e.soal_ar}</ArabicText>
                <div className="text-xs text-ink-muted truncate">{e.soal_id}</div>
              </div>
              {best >= 0 ? <Pill tone={best >= 8 ? 'emerald' : best >= 6 ? 'gold' : 'rose'}>{best}/10</Pill> : <Pill>Belum</Pill>}
            </button>
          );
        })}
      </div>
      <div className="flex justify-end mt-4">
        <ToolbarButton icon="refresh" onClick={() => generate()} disabled={busy}>Buat soal baru</ToolbarButton>
      </div>
    </div>
  );
};

/* ── 4. Tutor & simulasi syafawi ── */

const TUTOR_SUGGESTIONS = [
  'Jelaskan poin-poin utama materi ini dengan bahasa sederhana',
  'Buat analogi untuk konsep yang paling sulit di materi ini',
  'Apa saja perbedaan pendapat ulama yang dibahas, dan mana yang rajih?',
  'Terjemahkan dan jelaskan i\'rab kalimat Arab pertama di materi',
  'Istilah apa saja yang wajib kuhafal untuk imtihan?',
];
const SYAFAWI_START = 'Mulai simulasi syafawi. Silakan ajukan pertanyaan pertama.';

const TutorTab = ({ set, setSet, access }) => {
  const toast = useToast();
  const [mode, setMode]       = useState('tutor');
  const [input, setInput]     = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState('');
  const bottomRef = useRef(null);
  const chat = (set.chat || []).filter(m => (m.mode || 'tutor') === mode);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [chat.length, sending, mode]);

  if (access.tier !== 'pro') {
    return <UpgradeCard title="Tutor & simulasi syafawi khusus pelanggan" message="Tanya apa saja tentang materimu, atau latihan ujian lisan dengan duktur AI yang bertanya satu per satu lalu menilai jawabanmu."/>;
  }

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || sending) return;
    setInput('');
    setError('');
    setSending(true);
    setSet(s => ({ ...s, chat: [...(s.chat || []), { role: 'user', content: message, mode }] }));
    const data = await aiCall('chat', { set_id: set.id, message, mode });
    setSending(false);
    if (!data.ok) {
      setError(data.error || 'Gagal mengirim pesan');
      setSet(s => ({ ...s, chat: (s.chat || []).slice(0, -1) }));
      setInput(message);
      return;
    }
    setSet(s => ({ ...s, chat: [...(s.chat || []), { role: 'assistant', content: data.reply, mode }] }));
  };

  const restart = async () => {
    const d = await aiCall('clear-chat', { set_id: set.id, mode });
    if (!d.ok) { toast.push(d.error || 'Gagal mengulang'); return; }
    setSet(s => ({ ...s, chat: (s.chat || []).filter(m => (m.mode || 'tutor') !== mode) }));
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="inline-flex rounded-xl border border-white/10 bg-white/4 p-1 gap-1">
          {[['tutor', 'Tanya Tutor'], ['syafawi', 'Simulasi Syafawi']].map(([id, label]) => (
            <button key={id} onClick={() => { setMode(id); setError(''); }}
              className={`text-xs px-3 py-1.5 rounded-lg ${mode === id ? 'bg-emerald-500/20 text-emerald-200' : 'text-ink-muted hover:text-ink'}`}>{label}</button>
          ))}
        </div>
        {chat.length > 0 && <ToolbarButton icon="refresh" onClick={restart}>{mode === 'syafawi' ? 'Ulang simulasi' : 'Hapus percakapan'}</ToolbarButton>}
      </div>

      <div className="card-glass p-4 md:p-6 flex flex-col" style={{ minHeight: 440 }}>
        <div className="flex-1 space-y-4 overflow-y-auto mb-4" style={{ maxHeight: 540 }}>
          {chat.length === 0 && mode === 'tutor' && (
            <div className="text-center py-6">
              <p className="text-ink-muted text-sm mb-4">Tanya apa saja tentang materi ini. Tutor menjawab berdasarkan isi materimu.</p>
              <div className="flex flex-col gap-2 max-w-md mx-auto">
                {TUTOR_SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)} className="text-xs text-left px-4 py-2.5 rounded-xl bg-white/4 border border-white/8 text-ink-muted hover:text-ink hover:border-emerald-500/30">{s}</button>
                ))}
              </div>
            </div>
          )}
          {chat.length === 0 && mode === 'syafawi' && (
            <div className="text-center py-8 max-w-md mx-auto">
              <div className="text-3xl mb-3">🎙️</div>
              <h3 className="font-display text-lg font-semibold text-ink mb-2">Latihan ujian lisan</h3>
              <p className="text-ink-muted text-sm mb-5 leading-relaxed">
                Duktur AI mengajukan 5 pertanyaan dalam bahasa Arab satu per satu, menilai tiap jawabanmu, lalu memberi nilai akhir. Jawab boleh bahasa Arab atau Indonesia.
              </p>
              <button onClick={() => send(SYAFAWI_START)} className="btn btn-primary text-sm px-5 py-2.5">Mulai simulasi</button>
            </div>
          )}
          {chat.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm ${m.role === 'user'
                ? 'bg-emerald-500/15 border border-emerald-500/25 text-ink'
                : 'bg-white/4 border border-white/8'}`} dir="auto">
                {m.role === 'user'
                  ? <span className="whitespace-pre-wrap">{m.content}</span>
                  : <MarkdownArab content={m.content} ltr style={{ color: 'inherit', fontSize: 14.5, lineHeight: 1.8 }}/>}
              </div>
            </div>
          ))}
          {sending && <div className="text-xs text-ink-soft">{mode === 'syafawi' ? 'Duktur sedang menilai…' : 'Tutor sedang mengetik…'}</div>}
          <div ref={bottomRef}/>
        </div>
        {error && <div className="text-sm text-rose-400 mb-2">{error}</div>}
        {(mode === 'tutor' || chat.length > 0) && (
          <div className="flex gap-2">
            <textarea value={input} onChange={e => setInput(e.target.value)} rows={2} maxLength={2000}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={mode === 'syafawi' ? 'Jawab pertanyaan duktur…' : 'Tulis pertanyaanmu…'}
              className={`${aiInputClass} resize-none`} dir="auto"/>
            <button onClick={() => send()} disabled={sending || !input.trim()} className="btn btn-primary px-4 self-end py-2.5">
              <Icon name="arrowRight" className="w-4 h-4"/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, {
  SummaryTab, MindmapTab, MaterialTab, FlashcardTab, GlossaryTab, QuizTab, EssayTab, TutorTab,
});
