import React, { useState, useEffect } from 'react';
/* Talqeeh — AI Partner Belajar Muqarrar: daftar materi & halaman belajar per materi.
   Helper di ai-partner-shared.jsx, wizard di ai-partner-create.jsx, tab di ai-partner-study.jsx. */

const FEATURE_TOUR = [
  { icon: 'bookOpen',      title: 'Ringkasan gaya kitab', desc: "Ta'rif, taqsim, syarat, khilaf & tarjih, dalil — Indonesia, Arab, atau dwibahasa." },
  { icon: 'network',       title: 'Peta konsep',          desc: 'Seluruh materi sebagai pohon taqsimat yang bisa dibuka-tutup.' },
  { icon: 'type',          title: "Terjemah & i'rab",     desc: "Blok kalimat Arab → terjemah harfiyah, bebas, dan i'rab per kata." },
  { icon: 'layers',        title: 'Flashcard & mufradat', desc: 'Kosakata berharakat + wazan, dengan pengulangan berjarak dan suara.' },
  { icon: 'target',        title: 'Kuis & tahriri',       desc: 'Pilihan ganda + latihan esai gaya ujian tulis, dinilai AI.' },
  { icon: 'messageSquare', title: 'Tutor & syafawi',      desc: 'Tanya materimu, atau simulasi ujian lisan dengan duktur AI.' },
];

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

const AiPartnerList = ({ status }) => {
  const [sets, setSets]   = useState(null);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
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

      {sets?.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatTile icon="book" value={sets.length} label="Materi"/>
          <StatTile icon="layers" value={totalDue} label="Kartu perlu diulang"/>
          <StatTile icon="target" value={quizzed} label="Kuis dikerjakan"/>
        </div>
      )}

      {(creating || empty) && (
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

      {empty && (
        <div className="mt-12">
          <div className="text-xs uppercase tracking-[0.2em] text-gold-400 mb-4 text-center">Yang bisa kamu lakukan</div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-3">
            {FEATURE_TOUR.map(f => (
              <div key={f.title} className="card-glass p-3.5 md:p-4 flex flex-col md:flex-row gap-2 md:gap-3">
                <Icon name={f.icon} className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5"/>
                <div>
                  <div className="text-[13px] md:text-sm text-ink font-medium leading-tight">{f.title}</div>
                  <div className="text-[11px] md:text-xs text-ink-muted leading-relaxed mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
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

const AiPartnerPage = () => {
  const status = useAiStatus();
  return (
    <div className="page-enter">
      <BackToHome/>
      <section className="container-x pt-2 pb-8 md:pb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs uppercase tracking-[0.22em] text-gold-400">AI Partner Belajar</span>
          {!status.loading && status.tier === 'pro' && <Pill tone="emerald">Aktif</Pill>}
        </div>
        <div className="arabic-display-classical text-xl md:text-2xl text-emerald-200/60 mb-2">رَفِيقُ الدِّرَاسَةِ</div>
        <h1 className="font-display text-3xl md:text-5xl font-semibold text-ink leading-[1.05] max-w-3xl">
          Belajar muqarrar langsung dari materimu sendiri.
        </h1>
        <p className="mt-3 text-base md:text-lg text-ink-muted max-w-2xl leading-relaxed">
          Unggah diktat, slide, foto kitab, atau rekaman kuliah — Talqeeh menyiapkan ringkasan, peta konsep, mufradat, flashcard, soal, dan duktur AI untuk latihan.
        </p>
        <PersonalizationChip/>
      </section>
      {status.loading ? <GateLoading/>
        : status.tier === 'none'
          ? <div className="container-x pb-24"><UpgradeCard title="Khusus member Talqeeh" message="Masuk dengan Google dan buat akun gratis untuk mencoba AI Partner 1 materi."/></div>
          : <AiPartnerList status={status}/>}
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
