import React, { useState, useEffect, useRef, useMemo } from 'react';
import MarkdownArab from '../components/MarkdownArab.jsx';
/* Talqeeh — AI Partner Belajar Muqarrar (upload materi → ringkasan, flashcard, kuis, tutor) */

const MAX_CONTENT = 40000;
const BOX_INTERVAL_DAYS = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 14 };
const GENERATING_HINT = 'AI sedang menyusun… biasanya 10–30 detik.';

const aiCall = async (action, payload = {}) => {
  let data;
  try {
    const res = await window.authFetch(`/api/ai-partner?action=${action}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    data = await res.json();
  } catch {
    data = { ok: false, error: 'Tidak bisa terhubung ke server. Cek koneksi lalu coba lagi.' };
  }
  if (!data.ok && data.error === 'quota') data.error = data.message;
  if (!data.ok && data.error === 'no_access') data.error = 'Akses AI Partner kamu belum aktif.';
  return data;
};

const maddahName = (id) => {
  if (!id) return null;
  const m = window.getMaddahById?.(id) || window.getMahadMaddahById?.(id);
  return m?.name || null;
};


const tabBtnClass = (active) =>
  `text-sm px-4 py-2 rounded-xl border font-medium transition-all flex items-center gap-2 ${active
    ? 'text-emerald-200 border-emerald-600/35 bg-emerald-500/15'
    : 'bg-white/4 text-ink-muted border-white/8 hover:bg-white/7'}`;

const inputClass =
  'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-ink text-sm outline-none focus:border-emerald-500/50';

/* ── Access gate ── */

const BetaCard = () => {
  const s = window.useAppSettings();
  const wa = (s.whatsapp || '').replace(/[^0-9]/g, '');
  const hasWa = wa && !(s.whatsapp || '').includes('x');
  return (
    <div className="container-x pb-24">
      <div className="card-glass-strong p-8 max-w-xl mx-auto text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-emerald-200"
          style={{ background: 'rgba(62,207,142,0.15)', border: '1px solid rgba(62,207,142,0.3)' }}>
          <Icon name="sparkles" className="w-7 h-7"/>
        </div>
        <div className="text-xs uppercase tracking-[0.2em] text-gold-400 mb-2">Beta · Add-on</div>
        <h2 className="font-display text-2xl font-semibold text-ink mb-3">AI Partner Belajar belum aktif di akunmu</h2>
        <p className="text-ink-muted text-sm leading-relaxed mb-6">
          Upload materi kuliah, lalu dapatkan ringkasan, flashcard hafalan, kuis, dan tutor AI yang menjawab
          berdasarkan materimu. Saat ini akses dibuka bertahap oleh admin.
          {s.aiPriceLabel && <><br/><span className="text-ink">Harga: {s.aiPriceLabel}</span></>}
        </p>
        {hasWa && (
          <a href={`https://wa.me/${wa}?text=${encodeURIComponent('Assalamualaikum, saya mau ikut beta AI Partner Belajar Talqeeh.')}`}
            target="_blank" rel="noopener noreferrer" className="btn btn-gold px-6 py-3">
            Minta akses ke admin
          </a>
        )}
      </div>
    </div>
  );
};

const useAiAccess = () => {
  const [state, setState] = useState('checking');
  useEffect(() => {
    window.checkAiSubscription?.().then(r => setState(r.active ? 'active' : 'inactive'));
  }, []);
  return state;
};

const GateLoading = () => (
  <div className="container-x pb-24 text-center text-ink-muted text-sm">Mengecek akses…</div>
);

/* ── Create form ── */

const CreateForm = ({ onCancel }) => {
  const toast = useToast();
  const { profile } = useAuth();
  const [source, setSource]   = useState('teks');
  const [title, setTitle]     = useState('');
  const [maddahId, setMaddahId] = useState('');
  const [content, setContent] = useState('');
  const [busy, setBusy]       = useState('');
  const [error, setError]     = useState('');
  const fileRef = useRef(null);

  const maddahOptions = useMemo(() => {
    if (!profile) return [];
    try {
      if (window.isMahadLevel?.(profile.level)) return window.getMahadMaddahByJenjang?.(profile.level) || [];
      return window.getMaddahsForProfile?.(profile) || [];
    } catch { return []; }
  }, [profile]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');

    if (source === 'pdf') {
      if (file.type !== 'application/pdf') { setError('Pilih file PDF.'); return; }
      if (file.size > 15 * 1024 * 1024) { setError('PDF terlalu besar. Maksimal 15MB.'); return; }
      setBusy('Membaca PDF…');
      try {
        const { numPages, pages } = await window.extractPdfPages(file, 60);
        if (!pages) { setError(`PDF punya ${numPages} halaman — maksimal 60. Potong PDF-nya dulu.`); return; }
        if (pages.length === 0) { setError('PDF ini hasil scan (tidak ada teks). Pakai mode Foto untuk tiap halaman.'); return; }
        setContent(pages.join('\n\n'));
        if (!title) setTitle(file.name.replace(/\.pdf$/i, ''));
      } catch (err) {
        setError('Gagal membaca PDF: ' + err.message);
      } finally { setBusy(''); }
      return;
    }

    if (!file.type.startsWith('image/')) { setError('Pilih file gambar (JPG/PNG).'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Foto terlalu besar. Maksimal 10MB.'); return; }
    setBusy('AI sedang membaca foto…');
    try {
      const compressed = await window.compressImage(file);
      const base64 = await window.fileToBase64(compressed);
      const data = await aiCall('ocr', { foto_base64: base64, mime_type: compressed.type || 'image/jpeg' });
      if (!data.ok) { setError(data.error || 'Gagal membaca foto'); return; }
      setContent(prev => (prev ? prev + '\n\n' : '') + data.teks);
      toast.push('Foto berhasil dibaca. Bisa tambah foto lain untuk halaman berikutnya.');
    } finally { setBusy(''); }
  };

  const handleSave = async () => {
    if (content.trim().length < 50) { setError('Materi terlalu pendek (minimal 50 karakter).'); return; }
    setBusy('Menyimpan…');
    setError('');
    try {
      const data = await aiCall('create', { title, maddah_id: maddahId || null, source_type: source, content });
      if (!data.ok) { setError(data.error || 'Gagal menyimpan'); return; }
      if (data.truncated) toast.push(`Materi dipotong ke ${MAX_CONTENT.toLocaleString('id-ID')} karakter pertama.`);
      navigate(`/ai-partner/${data.id}`);
    } finally { setBusy(''); }
  };

  const sources = [
    { id: 'teks', label: 'Tempel teks', icon: 'pen' },
    { id: 'pdf',  label: 'PDF',         icon: 'fileText' },
    { id: 'foto', label: 'Foto',        icon: 'upload' },
  ];

  return (
    <div className="card-glass p-6 mb-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-xl font-semibold text-ink">Tambah materi</h2>
        <button onClick={onCancel} className="text-ink-muted hover:text-ink"><Icon name="x" className="w-5 h-5"/></button>
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        {sources.map(s => (
          <button key={s.id} onClick={() => { setSource(s.id); setError(''); }} className={tabBtnClass(source === s.id)}>
            <Icon name={s.icon} className="w-4 h-4"/>{s.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3 mb-4">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Judul materi (misal: Bab Thaharah)"
          className={inputClass} maxLength={120}/>
        <select value={maddahId} onChange={e => setMaddahId(e.target.value)} className={inputClass}>
          <option value="">Maddah (opsional)</option>
          {maddahOptions.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      {source !== 'teks' && (
        <div className="mb-4">
          <input ref={fileRef} type="file" className="hidden" onChange={handleFile}
            accept={source === 'pdf' ? 'application/pdf' : 'image/*'}/>
          <button onClick={() => fileRef.current?.click()} disabled={!!busy}
            className="w-full border border-dashed border-white/15 rounded-xl py-6 text-sm text-ink-muted hover:border-emerald-500/40 hover:text-ink transition">
            <Icon name="upload" className="w-5 h-5 mx-auto mb-2"/>
            {source === 'pdf' ? 'Pilih file PDF (maks 60 halaman)' : 'Pilih foto halaman materi (bisa berkali-kali)'}
          </button>
        </div>
      )}

      <textarea value={content} onChange={e => setContent(e.target.value)} rows={source === 'teks' ? 12 : 8}
        placeholder={source === 'teks' ? 'Tempel isi materi, diktat, atau talkhisan di sini…' : 'Hasil bacaan akan muncul di sini dan bisa kamu rapikan sebelum disimpan.'}
        className={`${inputClass} leading-relaxed`} dir="auto"/>
      <div className={`text-[11px] mt-1 ${content.length > MAX_CONTENT ? 'text-amber-400' : 'text-ink-soft'}`}>
        {content.length.toLocaleString('id-ID')} / {MAX_CONTENT.toLocaleString('id-ID')} karakter
        {content.length > MAX_CONTENT && ' — kelebihannya akan dipotong'}
      </div>

      {error && <div className="text-sm text-rose-400 mt-3">{error}</div>}

      <div className="flex justify-end gap-2 mt-5">
        <button onClick={onCancel} className="btn btn-ghost text-sm px-4 py-2">Batal</button>
        <button onClick={handleSave} disabled={!!busy || !content.trim()} className="btn btn-primary text-sm px-5 py-2">
          {busy || 'Simpan materi'}
        </button>
      </div>
    </div>
  );
};

/* ── List page ── */

const AiPartnerList = () => {
  const [sets, setSets]       = useState(null);
  const [error, setError]     = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    aiCall('list').then(d => d.ok ? setSets(d.data) : setError(d.error || 'Gagal memuat materi'));
  }, []);

  return (
    <div className="container-x pb-24">
      {!creating && (
        <div className="flex justify-end mb-6">
          <button onClick={() => setCreating(true)} className="btn btn-primary text-sm px-5 py-2.5">
            <Icon name="upload" className="w-4 h-4"/> Tambah materi
          </button>
        </div>
      )}
      {creating && <CreateForm onCancel={() => setCreating(false)}/>}

      {error && <div className="text-sm text-rose-400">{error}</div>}
      {sets === null && !error && <div className="text-sm text-ink-muted">Memuat…</div>}
      {sets?.length === 0 && !creating && (
        <div className="card-glass p-10 text-center text-ink-muted text-sm">
          Belum ada materi. Upload diktat, talkhisan, atau catatan kuliahmu untuk mulai belajar bareng AI.
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sets?.map(s => (
          <button key={s.id} onClick={() => navigate(`/ai-partner/${s.id}`)}
            className="card-glass-strong p-5 hov-lift text-left">
            <div className="text-[11px] uppercase tracking-wider text-gold-400 mb-2">
              {maddahName(s.maddah_id) || 'Materi umum'} · {s.source_type}
            </div>
            <div className="font-display text-lg font-semibold text-ink leading-snug mb-3">{s.title}</div>
            <div className="text-xs text-ink-soft flex items-center justify-between">
              <span>{new Date(s.created_at).toLocaleDateString('id-ID')}</span>
              {s.quiz_best_score != null && <span className="text-emerald-300">Kuis terbaik: {s.quiz_best_score}</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const AiPartnerPage = () => {
  const access = useAiAccess();
  return (
    <div className="page-enter">
      <PageHeader
        kicker="AI Partner Belajar"
        arabic="رَفِيقُ الدِّرَاسَةِ"
        title="Upload materimu, belajar bareng AI."
        subtitle="Ringkasan, flashcard hafalan, kuis, dan tutor yang menjawab berdasarkan muqarrar-mu sendiri."
      />
      {access === 'checking' && <GateLoading/>}
      {access === 'inactive' && <BetaCard/>}
      {access === 'active' && <AiPartnerList/>}
    </div>
  );
};

/* ── Detail: tabs ── */

const GenerateEmpty = ({ label, onGenerate, busy }) => (
  <div className="card-glass p-8 text-center">
    <p className="text-ink-muted text-sm mb-5">{busy ? GENERATING_HINT : `Belum ada ${label} untuk materi ini.`}</p>
    <button onClick={onGenerate} disabled={busy} className="btn btn-primary text-sm px-5 py-2.5">
      <Icon name="sparkles" className="w-4 h-4"/> {busy ? 'Menyusun…' : `Buat ${label}`}
    </button>
  </div>
);

const useGenerate = (set, setSet, kind, field) => {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const generate = async () => {
    setBusy(true);
    const data = await aiCall('generate', { set_id: set.id, kind });
    setBusy(false);
    if (!data.ok) { toast.push(data.error || 'Gagal membuat'); return; }
    setSet(s => ({ ...s, [field]: data.data, ...(kind === 'quiz' ? { quiz_best_score: null } : {}) }));
  };
  return [busy, generate];
};

const SummaryTab = ({ set, setSet }) => {
  const [busy, generate] = useGenerate(set, setSet, 'summary', 'summary');
  if (!set.summary) return <GenerateEmpty label="ringkasan" onGenerate={generate} busy={busy}/>;
  return (
    <div className="card-glass p-6 md:p-8">
      <MarkdownArab content={set.summary} ltr style={{ color: 'inherit', fontSize: 15, lineHeight: 1.8 }}/>
      <div className="flex justify-end mt-6">
        <button onClick={generate} disabled={busy} className="btn btn-ghost text-xs px-3 py-1.5">
          <Icon name="refresh" className="w-3.5 h-3.5"/> {busy ? 'Menyusun ulang…' : 'Buat ulang'}
        </button>
      </div>
    </div>
  );
};

const isDue = (card) => !card.due || Date.parse(card.due) <= Date.now();
const nextDue = (box) => new Date(Date.now() + BOX_INTERVAL_DAYS[box] * 86400000).toISOString();

const FlashcardTab = ({ set, setSet }) => {
  const [busy, generate] = useGenerate(set, setSet, 'flashcards', 'flashcards');
  const cards = set.flashcards || [];
  const dueQueue = () => cards.map((c, i) => i).filter(i => isDue(cards[i]));
  const [queue, setQueue]   = useState(dueQueue);
  const [flipped, setFlipped] = useState(false);
  const saveTimer = useRef(null);
  const pendingStates = useRef(null);

  const flush = () => {
    if (!pendingStates.current) return;
    aiCall('save-progress', { set_id: set.id, card_states: pendingStates.current });
    pendingStates.current = null;
  };

  useEffect(() => () => { clearTimeout(saveTimer.current); flush(); }, []);

  // Reset hanya saat set berganti atau kartu dibuat ulang (bukan saat box/due berubah)
  useEffect(() => {
    setQueue(dueQueue());
    setFlipped(false);
  }, [set.id, cards.length, cards[0]?.q]);

  if (cards.length === 0) return <GenerateEmpty label="flashcard" onGenerate={generate} busy={busy}/>;

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

  const boxCounts = [1, 2, 3, 4, 5].map(b => cards.filter(c => (c.box || 1) === b).length);
  const current = queue?.length ? cards[queue[0]] : null;

  return (
    <div>
      <div className="flex gap-2 mb-5 flex-wrap text-[11px] text-ink-soft">
        {boxCounts.map((n, i) => (
          <span key={i} className="px-2.5 py-1 rounded-lg bg-white/4 border border-white/8">Kotak {i + 1}: {n}</span>
        ))}
      </div>

      {current ? (
        <>
          <button onClick={() => setFlipped(f => !f)}
            className="card-glass-strong w-full min-h-[220px] p-8 flex flex-col items-center justify-center text-center">
            <div className="text-[11px] uppercase tracking-wider text-gold-400 mb-4">
              {flipped ? 'Jawaban' : 'Pertanyaan'} · sisa {queue.length} kartu
            </div>
            <div className={`text-ink leading-relaxed ${flipped ? 'text-base' : 'text-xl font-display'}`} dir="auto">
              {flipped ? current.a : current.q}
            </div>
            {!flipped && <div className="text-xs text-ink-soft mt-6">Ketuk untuk lihat jawaban</div>}
          </button>
          {flipped && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button onClick={() => answer(false)} className="btn btn-ghost py-3 text-sm" style={{ borderColor: 'rgba(255,184,77,0.4)', color: '#ffb84d' }}>
                Belum hafal
              </button>
              <button onClick={() => answer(true)} className="btn btn-primary py-3 text-sm">Hafal</button>
            </div>
          )}
        </>
      ) : (
        <div className="card-glass p-8 text-center">
          <p className="text-ink text-sm mb-2">Semua kartu yang jatuh tempo sudah kamu latih. </p>
          <p className="text-ink-muted text-xs mb-5">Kartu yang sudah hafal akan muncul lagi sesuai jadwal (1, 3, 7, 14 hari).</p>
          <div className="flex gap-2 justify-center flex-wrap">
            <button onClick={() => setQueue(cards.map((c, i) => i))} className="btn btn-ghost text-sm px-4 py-2">Latih semua lagi</button>
            <button onClick={generate} disabled={busy} className="btn btn-ghost text-sm px-4 py-2">
              {busy ? 'Menyusun…' : 'Buat kartu baru'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const QuizTab = ({ set, setSet }) => {
  const [busy, generate] = useGenerate(set, setSet, 'quiz', 'quiz');
  const quiz = set.quiz || [];
  const [idx, setIdx]       = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore]   = useState(0);

  useEffect(() => { setIdx(0); setPicked(null); setScore(0); }, [set.id, quiz]);

  if (quiz.length === 0) return <GenerateEmpty label="kuis" onGenerate={generate} busy={busy}/>;

  const finished = idx >= quiz.length;

  const pick = (i) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === quiz[idx].answer) setScore(s => s + 1);
  };

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
    return (
      <div className="card-glass p-8 text-center">
        <div className="font-display text-5xl font-semibold text-ink mb-2">{score}/{quiz.length}</div>
        <p className="text-ink-muted text-sm mb-1">Skor kamu</p>
        {set.quiz_best_score != null && <p className="text-emerald-300 text-xs mb-6">Skor terbaik: {set.quiz_best_score}</p>}
        <div className="flex gap-2 justify-center flex-wrap">
          <button onClick={() => { setIdx(0); setPicked(null); setScore(0); }} className="btn btn-primary text-sm px-5 py-2">Ulangi</button>
          <button onClick={generate} disabled={busy} className="btn btn-ghost text-sm px-5 py-2">
            {busy ? 'Menyusun…' : 'Buat soal baru'}
          </button>
        </div>
      </div>
    );
  }

  const q = quiz[idx];
  return (
    <div className="card-glass p-6 md:p-8">
      <div className="text-[11px] uppercase tracking-wider text-gold-400 mb-3">Soal {idx + 1} dari {quiz.length}</div>
      <div className="text-ink text-lg leading-relaxed mb-5" dir="auto">{q.question}</div>
      <div className="space-y-2.5">
        {q.options.map((opt, i) => {
          const isAnswer = i === q.answer;
          const state = picked === null ? 'idle' : isAnswer ? 'correct' : picked === i ? 'wrong' : 'dim';
          const style = {
            idle:    'border-white/10 hover:border-emerald-500/40 bg-white/3',
            correct: 'border-emerald-500/60 bg-emerald-500/15 text-emerald-100',
            wrong:   'border-rose-500/60 bg-rose-500/10 text-rose-200',
            dim:     'border-white/5 opacity-60',
          }[state];
          return (
            <button key={i} onClick={() => pick(i)} disabled={picked !== null}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm text-ink transition ${style}`} dir="auto">
              <span className="font-semibold mr-2">{'ABCD'[i]}.</span>{opt}
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

const TUTOR_SUGGESTIONS = [
  'Jelaskan poin-poin utama materi ini dengan bahasa sederhana',
  'Istilah apa saja yang wajib kuhafal dari materi ini?',
  'Buatkan 3 contoh soal syafawi beserta jawabannya',
];

const TutorTab = ({ set, setSet }) => {
  const [input, setInput]   = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError]   = useState('');
  const bottomRef = useRef(null);
  const chat = set.chat || [];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [chat.length, sending]);

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || sending) return;
    setInput('');
    setError('');
    setSending(true);
    setSet(s => ({ ...s, chat: [...(s.chat || []), { role: 'user', content: message }] }));
    const data = await aiCall('chat', { set_id: set.id, message });
    setSending(false);
    if (!data.ok) {
      setError(data.error || 'Gagal mengirim pesan');
      setSet(s => ({ ...s, chat: (s.chat || []).slice(0, -1) }));
      setInput(message);
      return;
    }
    setSet(s => ({ ...s, chat: [...(s.chat || []), { role: 'assistant', content: data.reply }] }));
  };

  return (
    <div className="card-glass p-4 md:p-6 flex flex-col" style={{ minHeight: 420 }}>
      <div className="flex-1 space-y-4 overflow-y-auto mb-4" style={{ maxHeight: 520 }}>
        {chat.length === 0 && (
          <div className="text-center py-6">
            <p className="text-ink-muted text-sm mb-4">Tanya apa saja tentang materi ini. Tutor menjawab berdasarkan isi materimu.</p>
            <div className="flex flex-col gap-2 max-w-md mx-auto">
              {TUTOR_SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)} className="text-xs text-left px-4 py-2.5 rounded-xl bg-white/4 border border-white/8 text-ink-muted hover:text-ink hover:border-emerald-500/30">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {chat.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm ${m.role === 'user'
              ? 'bg-emerald-500/15 border border-emerald-500/25 text-ink'
              : 'bg-white/4 border border-white/8'}`} dir="auto">
              {m.role === 'user'
                ? <span className="whitespace-pre-wrap">{m.content}</span>
                : <MarkdownArab content={m.content} ltr style={{ color: 'inherit', fontSize: 14, lineHeight: 1.7 }}/>}
            </div>
          </div>
        ))}
        {sending && <div className="text-xs text-ink-soft">Tutor sedang mengetik…</div>}
        <div ref={bottomRef}/>
      </div>
      {error && <div className="text-sm text-rose-400 mb-2">{error}</div>}
      <div className="flex gap-2">
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={2} maxLength={2000}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Tulis pertanyaanmu…" className={`${inputClass} resize-none`} dir="auto"/>
        <button onClick={() => send()} disabled={sending || !input.trim()} className="btn btn-primary px-4 self-end py-2.5">
          <Icon name="arrowRight" className="w-4 h-4"/>
        </button>
      </div>
    </div>
  );
};

/* ── Detail page ── */

const DETAIL_TABS = [
  { id: 'summary', label: 'Ringkasan',   icon: 'bookOpen' },
  { id: 'cards',   label: 'Flashcard',   icon: 'layers' },
  { id: 'quiz',    label: 'Kuis',        icon: 'target' },
  { id: 'tutor',   label: 'Tanya Tutor', icon: 'messageSquare' },
];

const AiPartnerDetail = ({ setId }) => {
  const toast = useToast();
  const [set, setSet]     = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab]     = useState('summary');
  const [showSource, setShowSource] = useState(false);

  useEffect(() => {
    aiCall('get', { set_id: setId }).then(d => d.ok ? setSet(d.data) : setError(d.error || 'Materi tidak ditemukan'));
  }, [setId]);

  const handleDelete = async () => {
    if (!confirm(`Hapus materi "${set.title}" beserta ringkasan, flashcard, kuis, dan chat-nya?`)) return;
    const d = await aiCall('delete', { set_id: set.id });
    if (d.ok) { toast.push('Materi dihapus.'); navigate('/ai-partner'); }
    else toast.push(d.error || 'Gagal menghapus');
  };

  if (error) return <div className="container-x pb-24 text-sm text-rose-400">{error}</div>;
  if (!set) return <div className="container-x pb-24 text-sm text-ink-muted">Memuat materi…</div>;

  const TabBody = { summary: SummaryTab, cards: FlashcardTab, quiz: QuizTab, tutor: TutorTab }[tab];

  return (
    <div className="container-x pb-24 max-w-4xl">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-gold-400 mb-1">{maddahName(set.maddah_id) || 'Materi umum'}</div>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">{set.title}</h2>
        </div>
        <button onClick={handleDelete} className="text-xs text-rose-400 hover:text-rose-300 mt-2">Hapus materi</button>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {DETAIL_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={tabBtnClass(tab === t.id)}>
            <Icon name={t.icon} className="w-4 h-4"/>{t.label}
          </button>
        ))}
      </div>

      <TabBody set={set} setSet={setSet}/>

      <div className="mt-8">
        <button onClick={() => setShowSource(v => !v)} className="text-xs text-ink-muted hover:text-ink flex items-center gap-1">
          {showSource ? 'Sembunyikan' : 'Lihat'} materi asli ({set.content.length.toLocaleString('id-ID')} karakter)
        </button>
        {showSource && (
          <pre className="mt-3 p-4 rounded-xl bg-white/3 border border-white/8 text-xs text-ink-muted whitespace-pre-wrap max-h-96 overflow-y-auto font-sans" dir="auto">
            {set.content}
          </pre>
        )}
      </div>
    </div>
  );
};

const AiPartnerDetailPage = ({ setId }) => {
  const access = useAiAccess();
  return (
    <div className="page-enter">
      <div className="container-x pt-6 md:pt-10 pb-4">
        <button onClick={() => navigate('/ai-partner')} className="text-sm text-ink-muted hover:text-ink flex items-center gap-1">
          ← Semua materi
        </button>
      </div>
      {access === 'checking' && <GateLoading/>}
      {access === 'inactive' && <BetaCard/>}
      {access === 'active' && <AiPartnerDetail setId={setId}/>}
    </div>
  );
};

Object.assign(window, { AiPartnerPage, AiPartnerDetailPage });
