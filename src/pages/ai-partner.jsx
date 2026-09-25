import React, { useState, useEffect } from 'react';
/* Talqeeh — AI Partner Belajar Muqarrar: daftar materi & halaman belajar per materi.
   Helper di ai-partner-shared.jsx, wizard di ai-partner-create.jsx, tab di ai-partner-study.jsx. */

const TrialBanner = ({ trial }) => (
  <div className="card-glass p-4 md:p-5 mb-6 flex items-center gap-4 flex-wrap" style={{ border: '1px solid rgba(201,168,106,0.28)' }}>
    <span className="w-10 h-10 rounded-xl bg-gold-500/12 border border-gold-500/25 flex items-center justify-center flex-shrink-0">
      <Icon name="crown" className="w-5 h-5 text-gold-300"/>
    </span>
    <div className="flex-1 min-w-[220px]">
      <div className="text-sm text-ink font-medium">
        {trial?.used ? 'Jatah coba gratismu sudah dipakai' : 'Kamu sedang mencoba AI Partner gratis'}
      </div>
      <div className="text-xs text-ink-muted leading-relaxed">
        {trial?.used
          ? 'Materi coba gratismu tetap bisa dibuka. Berlangganan untuk menambah materi dan membuka semua fitur.'
          : '1 materi (teks, dokumen, atau foto) dengan ringkasan, flashcard, kuis, dan mufradat. Audio/video, peta konsep, i\'rab, tahriri, dan tutor khusus pelanggan.'}
      </div>
    </div>
    <button onClick={openAiUpgrade} className="btn btn-gold text-xs px-4 py-2">Berlangganan</button>
  </div>
);

const StatTile = ({ value, label, icon }) => (
  <div className="card-glass p-4 flex items-center gap-3">
    <span className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
      <Icon name={icon} className="w-4 h-4 text-emerald-300"/>
    </span>
    <div>
      <div className="font-display text-xl font-semibold text-ink leading-none">{value}</div>
      <div className="text-[11px] text-ink-soft mt-1">{label}</div>
    </div>
  </div>
);

// Konfirmasi hapus materi (dipakai di daftar dan halaman materi).
const DeleteSetDialog = ({ set, isTrialSet, onClose, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    const d = await aiCall('delete', { set_id: set.id });
    setDeleting(false);
    if (d.ok) onDeleted(set);
    else setError(d.error || 'Gagal menghapus materi. Coba lagi sebentar.');
  };
  return (
    <Modal open onClose={deleting ? () => {} : onClose} size="md" closable={!deleting}>
      <div className="p-6">
        <span className="w-11 h-11 rounded-xl bg-rose-500/12 border border-rose-500/25 flex items-center justify-center mb-4">
          <Icon name="trash" className="w-5 h-5" style={{ stroke: '#fb7185' }}/>
        </span>
        <h3 className="font-display text-xl font-semibold text-ink mb-1">Hapus materi ini?</h3>
        <p className="text-sm text-ink-muted leading-relaxed mb-1">
          <span className="text-ink">"{set.title}"</span> akan dihapus permanen beserta ringkasan, peta konsep, flashcard, kuis, latihan tahriri, dan percakapan tutornya.
        </p>
        {isTrialSet && (
          <p className="text-xs text-amber-300/90 leading-relaxed mt-2">
            Ini materi coba gratismu. Jatah coba gratis tidak kembali setelah materi dihapus.
          </p>
        )}
        {error && <div className="text-sm text-rose-400 mt-3">{error}</div>}
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} disabled={deleting} className="btn btn-ghost flex-1 text-sm justify-center">Batal</button>
          <button onClick={handleDelete} disabled={deleting}
            className="btn flex-1 text-sm justify-center font-semibold text-white"
            style={{ background: deleting ? 'rgba(244,63,94,0.5)' : '#e11d48' }}>
            {deleting ? 'Menghapus…' : 'Ya, hapus'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const SetCard = ({ s, isTrialSet, onDelete }) => {
  const meta = SOURCE_META[s.source_type] || SOURCE_META.teks;
  const open = () => navigate(`/ai-partner/${s.id}`);
  return (
    <div role="button" tabIndex={0} onClick={open} onKeyDown={e => { if (e.key === 'Enter') open(); }}
      className="group card-glass-strong p-3.5 md:p-5 hov-lift text-left flex flex-col cursor-pointer relative min-w-0">
      <div className="flex items-start justify-between gap-2 md:gap-3 mb-2.5 md:mb-3">
        <span className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-emerald-500/12 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <Icon name={meta.icon} className="w-4 h-4 text-emerald-300"/>
        </span>
        <div className="flex items-center gap-1 md:gap-2">
          <button onClick={e => { e.stopPropagation(); onDelete(s); }} title="Hapus materi" aria-label={`Hapus materi ${s.title}`}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-soft hover:text-rose-400 hover:bg-rose-500/10 transition md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100">
            <Icon name="trash" className="w-4 h-4" style={{ stroke: 'currentColor' }}/>
          </button>
          <ProgressRing percent={studyPercent(s)} size={40}/>
        </div>
      </div>
      <div className="text-[10px] md:text-[11px] uppercase tracking-wider text-gold-400 mb-1 truncate">{maddahName(s.maddah_id) || 'Materi umum'}</div>
      <div className="font-display text-sm md:text-lg font-semibold text-ink leading-snug mb-3 line-clamp-2 break-words">{s.title}</div>
      <div className="mt-auto flex items-center gap-1.5 flex-wrap">
        <Pill>{meta.label}</Pill>
        {s.cards_due > 0 && <Pill tone="emerald">{s.cards_due} kartu<span className="hidden md:inline">&nbsp;perlu diulang</span></Pill>}
        {isTrialSet && <Pill tone="gold">Coba gratis</Pill>}
        <span className="hidden md:inline text-[11px] text-ink-soft ml-auto">{new Date(s.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
      </div>
    </div>
  );
};

const HowItWorksStrip = () => (
  <div className="grid grid-cols-3 gap-2.5 md:gap-3 mb-8">
    {[
      ['1', 'Unggah materi', 'PDF, Word, slide, foto diktat, atau rekaman kuliah.'],
      ['2', 'AI menyiapkan', 'Ringkasan, peta konsep, mufradat, flashcard, dan soal.'],
      ['3', 'Belajar & uji diri', 'Pahami → hafalkan → uji → tanya duktur AI.'],
    ].map(([n, t, d]) => (
      <div key={n} className="flex flex-col md:flex-row gap-2 md:gap-3 items-start">
        <span className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-emerald-500 text-black text-sm font-semibold flex items-center justify-center flex-shrink-0">{n}</span>
        <div>
          <div className="text-[13px] md:text-sm text-ink font-medium leading-tight">{t}</div>
          <div className="text-[11px] md:text-xs text-ink-muted leading-relaxed mt-0.5">{d}</div>
        </div>
      </div>
    ))}
  </div>
);

const AiPartnerList = ({ status, creating, setCreating }) => {
  const [sets, setSets]   = useState(null);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const toast = useToast();
  const isTrial = status.tier !== 'pro';
  const trialUsed = isTrial && status.trial?.used;
  const isTrialSet = (s) => isTrial && status.trial?.set_id === s.id;

  const handleDeleted = (set) => {
    setToDelete(null);
    setSets(prev => (prev || []).filter(s => s.id !== set.id));
    toast.push('Materi dihapus.');
  };

  useEffect(() => {
    aiCall('list').then(d => d.ok ? setSets(d.data) : setError(d.error || 'Gagal memuat materi'));
  }, []);

  const empty = sets?.length === 0;
  const totalDue = (sets || []).reduce((n, s) => n + (s.cards_due || 0), 0);
  const quizzed = (sets || []).filter(s => s.quiz_best_score != null).length;

  return (
    <div className="container-x pb-24">
      {isTrial && <TrialBanner trial={status.trial}/>}

      {empty && !creating && (
        <div className="card-glass p-5 md:p-6 mb-8 flex flex-col md:flex-row md:items-center gap-4">
          <span className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(201,168,106,0.12)', border: '1px solid rgba(201,168,106,0.3)' }}>
            <Icon name="upload" className="w-5 h-5 text-gold-300"/>
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-ink">Belajar dari materimu sendiri</div>
            <div className="text-xs text-ink-muted leading-relaxed mt-0.5">Unggah diktat, slide, foto kitab, atau rekaman kuliah — dapat ringkasan, peta konsep, flashcard, kuis, dan tutor yang menjawab dari materimu.</div>
          </div>
          <button onClick={() => trialUsed ? openAiUpgrade() : setCreating(true)} className="btn btn-primary text-sm px-5 py-2.5 flex-shrink-0">
            <Icon name="upload" className="w-4 h-4"/> Unggah materi
          </button>
        </div>
      )}

      {creating && (
        trialUsed
          ? <div className="mb-8"><UpgradeCard title="Tambah materi baru" message="Jatah coba gratis (1 materi) sudah terpakai. Berlangganan AI Partner untuk menambah materi tanpa batas, termasuk rekaman audio & video."/></div>
          : <>
              {empty && <HowItWorksStrip/>}
              <CreateWizard tier={status.tier} onCancel={() => setCreating(false)}/>
            </>
      )}

      {sets?.length > 0 && !creating && (
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="font-display text-xl font-semibold text-ink">Materimu</h2>
          <button onClick={() => trialUsed ? openAiUpgrade() : setCreating(true)} className="btn btn-primary text-sm px-5 py-2.5">
            <Icon name="upload" className="w-4 h-4"/> Tambah materi
          </button>
        </div>
      )}

      {sets?.length > 0 && !creating && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <StatTile icon="book" value={sets.length} label="Materi"/>
          <StatTile icon="layers" value={totalDue} label="Kartu perlu diulang"/>
          <StatTile icon="target" value={quizzed} label="Kuis dikerjakan"/>
        </div>
      )}

      {error && <div className="text-sm text-rose-400">{error}</div>}
      {sets === null && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {[0, 1, 2].map(i => <div key={i} className="card-glass p-4 md:p-5"><Skeleton lines={4}/></div>)}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {sets?.map(s => <SetCard key={s.id} s={s} isTrialSet={isTrialSet(s)} onDelete={setToDelete}/>)}
      </div>
      {toDelete && (
        <DeleteSetDialog set={toDelete} isTrialSet={isTrialSet(toDelete)} onClose={() => setToDelete(null)} onDeleted={handleDeleted}/>
      )}

    </div>
  );
};

// Menunjukkan bahwa hasil AI mengikuti profil belajar, plus jalan pintas untuk mengubahnya.
const PersonalizationChip = () => {
  const { profile } = useAuth();
  const summary = learnerSummary(profile);
  const incomplete = !profile?.arabicLevel || !profile?.studyGoal;
  return (
    <div className="mt-4 inline-flex items-center gap-2 flex-wrap px-3 py-2 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-xs">
      <Icon name="sparkles" className="w-3.5 h-3.5 text-emerald-300"/>
      {summary
        ? <span className="text-ink-muted">Disesuaikan untukmu: <span className="text-ink">{summary}</span></span>
        : <span className="text-ink-muted">Hasil AI bisa disesuaikan dengan gaya belajarmu.</span>}
      <button onClick={() => navigate('/onboarding?edit=1')} className="text-emerald-300 hover:text-emerald-200 underline underline-offset-2">
        {incomplete ? 'Lengkapi profil' : 'Ubah'}
      </button>
    </div>
  );
};

const GateLoading = () => (
  <div className="container-x pb-24"><div className="card-glass p-6 max-w-xl"><Skeleton lines={3}/></div></div>
);

const BackToHome = ({ to = '/dashboard', label = 'Beranda' }) => (
  <div className="container-x pt-4 md:pt-8">
    <button onClick={() => navigate(to)} className="text-sm text-ink-soft hover:text-ink inline-flex items-center gap-1.5" style={{ minHeight: 40 }}>
      <Icon name="chevronLeft" className="w-4 h-4"/> {label}
    </button>
  </div>
);

/* ── Beranda AI Partner: sapaan + satu kotak tanya, seperti sesi baru di asisten AI ── */

const greetingNow = () => {
  const h = new Date().getHours();
  if (h < 4)  return 'Selamat malam';
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
};

// Chip mengisi kotak tanya (tidak langsung terkirim) supaya pengguna bisa melengkapi [bagian] dulu.
const STARTERS = [
  { icon: 'lightbulb', label: 'Jelaskan konsep', text: 'Jelaskan konsep [tulis topik] dengan bahasa sederhana, lengkap dengan contoh dan istilah Arabnya.' },
  { icon: 'target',    label: 'Latihan soal',    text: 'Buat 5 soal latihan gaya imtihan Azhar tentang [tulis topik]. Jangan beri jawaban dulu — tunggu aku jawab, lalu koreksi.' },
  { icon: 'type',      label: "I'rab kalimat",   text: "I'rab-kan kalimat berikut kata per kata, lalu terjemahkan:\n[tempel kalimat Arab]" },
  { icon: 'scale',     label: 'Bandingkan madzhab', text: 'Bandingkan pendapat 4 madzhab tentang [tulis masalah], sertakan dalil singkat tiap pendapat.' },
  { icon: 'list',      label: "Rencana muraja'ah", text: "Buatkan rencana muraja'ah 7 hari untuk maddah [nama maddah] menjelang imtihan." },
];

const Composer = ({ tier, onUpload }) => {
  const { profile, session } = useAuth();
  const toast = useToast();
  const [text, setText] = useState('');
  const ref = React.useRef(null);
  const firstName = (session?.name || profile?.name || '').trim().split(/\s+/)[0];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 260) + 'px';
  }, [text]);

  const submit = () => {
    const msg = text.trim();
    if (!msg) return;
    if (tier !== 'pro') { toast.push('Tanya AI khusus pelanggan AI Partner.'); openAiUpgrade(); return; }
    runPromptInTalqeeh(msg, { autoSend: true, source: 'AI Partner' });
  };

  const pick = (starter) => {
    setText(starter.text);
    setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      const at = starter.text.indexOf('[');
      if (at >= 0) el.setSelectionRange(at, starter.text.indexOf(']', at) + 1);
    }, 0);
  };

  return (
    <section className="pt-10 md:pt-20 pb-10 md:pb-14">
      <div className="container-x"><div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center gap-3 md:gap-4 mb-7 md:mb-9">
          <LogoMark size={48} className="flex-shrink-0 md:scale-110"/>
          <h1 className="font-display text-[28px] md:text-[40px] font-semibold text-ink leading-tight tracking-tight text-center">
            {greetingNow()}{firstName ? `, ${firstName}` : ''}
          </h1>
        </div>

        <div className="rounded-2xl border border-white/12 bg-white/[0.045] shadow-2xl shadow-black/30 focus-within:border-emerald-500/40 transition-colors">
          <textarea ref={ref} value={text} onChange={e => setText(e.target.value)} rows={2} maxLength={12000} dir="auto"
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); } }}
            placeholder="Mau belajar apa hari ini? Tanya apa saja, atau tempel prompt Talqeeh…"
            className="w-full bg-transparent resize-none outline-none focus-visible:outline-none px-4 md:px-5 pt-4 text-ink placeholder-ink-soft leading-relaxed"
            style={{ fontSize: 16, minHeight: 64 }}/>
          <div className="flex items-center gap-2 px-2.5 md:px-3 pb-2.5 md:pb-3">
            <button onClick={onUpload} title="Unggah materi (PDF, foto, slide, audio)"
              className="h-9 px-3 rounded-xl border border-white/10 text-ink-muted hover:text-ink hover:bg-white/5 inline-flex items-center gap-1.5 text-xs">
              <Icon name="upload" className="w-4 h-4"/> <span className="hidden sm:inline">Unggah materi</span>
            </button>
            <button onClick={() => navigate('/maddah')} title="Pilih prompt dari Maddah"
              className="h-9 px-3 rounded-xl border border-white/10 text-ink-muted hover:text-ink hover:bg-white/5 inline-flex items-center gap-1.5 text-xs">
              <Icon name="layers" className="w-4 h-4"/> <span className="hidden sm:inline">Prompt Maddah</span>
            </button>
            <button onClick={submit} disabled={!text.trim()} aria-label="Kirim"
              className="ml-auto w-9 h-9 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40"
              style={{ background: text.trim() ? '#3ecf8e' : 'rgba(255,255,255,0.08)' }}>
              <Icon name="arrowRight" className="w-4 h-4" style={{ stroke: text.trim() ? '#0b0b0b' : 'currentColor' }}/>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {STARTERS.map(s => (
            <button key={s.label} onClick={() => pick(s)}
              className="h-9 px-3.5 rounded-xl border border-white/10 bg-white/[0.02] text-xs text-ink-muted hover:text-ink hover:bg-white/[0.06] inline-flex items-center gap-1.5">
              <Icon name={s.icon} className="w-3.5 h-3.5"/> {s.label}
            </button>
          ))}
        </div>

        <div className="flex justify-center"><PersonalizationChip/></div>
        <RecentChats/>
      </div></div>
    </section>
  );
};

// Percakapan terakhir dari "Tanya AI" (disimpan di perangkat).
const RecentChats = () => {
  const threads = (window.readPromptThreads?.() || []).slice(0, 4);
  if (!threads.length) return null;
  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="text-xs text-ink-soft inline-flex items-center gap-1.5"><Icon name="messageSquare" className="w-3.5 h-3.5"/> Percakapan terakhir</div>
        <button onClick={() => navigate('/ai-partner/prompt')} className="text-xs text-emerald-300 hover:text-emerald-200">Lihat semua</button>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {threads.map(t => (
          <button key={t.id} onClick={() => openPromptThread(t.id)}
            className="text-left rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] px-3.5 py-3 min-w-0">
            <div className="text-sm text-ink truncate">{promptThreadTitle(t)}</div>
            <div className="text-[11px] text-ink-soft mt-0.5">
              {new Date(t.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} · {t.messages.length} pesan
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const AiPartnerPage = () => {
  const status = useAiStatus();
  const [creating, setCreating] = useState(false);
  const listRef = React.useRef(null);

  const startUpload = () => {
    if (status.tier === 'trial' && status.trial?.used) { openAiUpgrade(); return; }
    setCreating(true);
    setTimeout(() => listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  return (
    <div className="page-enter">
      {status.loading ? <div className="pt-16"><GateLoading/></div>
        : status.tier === 'none'
          ? <>
              <BackToHome/>
              <div className="container-x pt-6 pb-24"><UpgradeCard title="Khusus member Talqeeh" message="Masuk dengan Google dan buat akun gratis untuk mencoba AI Partner 1 materi."/></div>
            </>
          : <>
              <Composer tier={status.tier} onUpload={startUpload}/>
              <div ref={listRef} className="scroll-mt-20 pt-6 md:pt-10 border-t border-white/[0.06]">
                <AiPartnerList status={status} creating={creating} setCreating={setCreating}/>
              </div>
            </>}
    </div>
  );
};

/* ── Halaman materi ── */

const SUB_TABS = {
  pahami:   [{ id: 'summary', label: 'Ringkasan', icon: 'bookOpen', C: 'SummaryTab' },
             { id: 'mindmap', label: 'Peta Konsep', icon: 'network', C: 'MindmapTab', pro: true },
             { id: 'material', label: 'Materi & I\'rab', icon: 'type', C: 'MaterialTab' }],
  hafalkan: [{ id: 'cards', label: 'Flashcard', icon: 'layers', C: 'FlashcardTab' },
             { id: 'glossary', label: 'Mufradat', icon: 'type', C: 'GlossaryTab' }],
  uji:      [{ id: 'quiz', label: 'Kuis', icon: 'target', C: 'QuizTab' },
             { id: 'essay', label: 'Latihan Tahriri', icon: 'pen', C: 'EssayTab', pro: true }],
  tanya:    [{ id: 'tutor', label: 'Tutor & Syafawi', icon: 'messageSquare', C: 'TutorTab', pro: true }],
};

const AiPartnerDetail = ({ setId, status }) => {
  const toast = useToast();
  const [set, setSet]     = useState(null);
  const [error, setError] = useState('');
  const [step, setStep]   = useState('pahami');
  const [sub, setSub]     = useState({ pahami: 'summary', hafalkan: 'cards', uji: 'quiz', tanya: 'tutor' });
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    aiCall('get', { set_id: setId }).then(d => d.ok ? setSet(d.data) : setError(d.error || 'Materi tidak ditemukan'));
  }, [setId]);

  const handleDeleted = () => { toast.push('Materi dihapus.'); navigate('/ai-partner'); };

  if (error) return <div className="container-x pb-24 text-sm text-rose-400">{error}</div>;
  if (!set) return <GateLoading/>;

  const isPro = status.tier === 'pro';
  const access = { tier: status.tier, isTrialSet: !isPro && status.trial?.set_id === set.id };
  const extra = { quiz_done: set.quiz_best_score != null, chatted: (set.chat || []).length > 0 };
  const meta = SOURCE_META[set.source_type] || SOURCE_META.teks;
  const current = SUB_TABS[step].find(t => t.id === sub[step]) || SUB_TABS[step][0];
  const TabBody = window[current.C];

  return (
    <div className="container-x pb-24 max-w-5xl">
      {/* Header materi */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <Pill tone="gold">{maddahName(set.maddah_id) || 'Materi umum'}</Pill>
            <Pill><Icon name={meta.icon} className="w-3 h-3"/>{meta.label}</Pill>
            {access.isTrialSet && <Pill tone="gold"><Icon name="crown" className="w-3 h-3"/>Coba gratis</Pill>}
          </div>
          <h1 className="font-display text-2xl md:text-4xl font-semibold text-ink leading-tight">{set.title}</h1>
          <button onClick={() => setConfirmDelete(true)}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-ink-soft hover:text-rose-400 px-2.5 py-1.5 -ml-2.5 rounded-lg hover:bg-rose-500/10 transition">
            <Icon name="trash" className="w-3.5 h-3.5" style={{ stroke: 'currentColor' }}/> Hapus materi
          </button>
        </div>
        <ProgressRing percent={studyPercent(set)} size={56}/>
      </div>
      {confirmDelete && (
        <DeleteSetDialog set={set} isTrialSet={access.isTrialSet} onClose={() => setConfirmDelete(false)} onDeleted={handleDeleted}/>
      )}

      {/* Stepper alur belajar */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {STUDY_STEPS.map((s, i) => {
          const active = step === s.id;
          const done = stepDone(s, set.progress || {}, extra);
          return (
            <button key={s.id} onClick={() => setStep(s.id)}
              className={`rounded-2xl border px-2 py-3 md:px-4 md:py-4 text-center md:text-left transition ${active ? 'border-emerald-500/50 bg-emerald-500/12' : 'border-white/8 bg-white/3 hover:border-white/15'}`}>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <span className={`w-6 h-6 rounded-full text-[11px] font-semibold flex items-center justify-center ${done ? 'bg-emerald-500 text-black' : active ? 'bg-white/15 text-ink' : 'bg-white/8 text-ink-soft'}`}>
                  {done ? <Icon name="check" className="w-3.5 h-3.5" strokeWidth={2.4}/> : i + 1}
                </span>
                <span className={`hidden md:inline text-sm font-medium ${active ? 'text-ink' : 'text-ink-muted'}`}>{s.label}</span>
              </div>
              <div className={`md:hidden text-[11px] font-medium ${active ? 'text-ink' : 'text-ink-muted'}`}>{s.label}</div>
              <div dir="rtl" className="hidden md:block text-gold-300/70 text-right" style={{ fontFamily: '"Noto Naskh Arabic", serif', fontSize: 15 }}>{s.ar}</div>
            </button>
          );
        })}
      </div>

      {/* Sub-tab */}
      {SUB_TABS[step].length > 1 && (
        <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {SUB_TABS[step].map(t => (
            <button key={t.id} onClick={() => setSub(p => ({ ...p, [step]: t.id }))}
              className={`flex-shrink-0 text-sm px-4 py-2 rounded-xl border font-medium flex items-center gap-2 transition ${sub[step] === t.id
                ? 'text-emerald-200 border-emerald-600/35 bg-emerald-500/15'
                : 'bg-white/4 text-ink-muted border-white/8 hover:bg-white/7'}`}>
              <Icon name={t.icon} className="w-4 h-4"/>{t.label}
              {t.pro && !isPro && <Icon name="crown" className="w-3.5 h-3.5 text-gold-300"/>}
            </button>
          ))}
        </div>
      )}

      <TabBody key={`${set.id}-${current.id}`} set={set} setSet={setSet} access={access}/>
    </div>
  );
};

const AiPartnerDetailPage = ({ setId }) => {
  const status = useAiStatus();
  return (
    <div className="page-enter">
      <BackToHome to="/ai-partner" label="Semua materi"/>
      <div className="pt-4">
        {status.loading ? <GateLoading/>
          : status.tier === 'none'
            ? <div className="container-x pb-24"><UpgradeCard title="Khusus member Talqeeh"/></div>
            : <AiPartnerDetail setId={setId} status={status}/>}
      </div>
    </div>
  );
};

Object.assign(window, { AiPartnerPage, AiPartnerDetailPage });
