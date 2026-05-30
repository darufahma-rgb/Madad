/* Talqih — Onboarding (faculty · level · major conditional · S2 maddah) */

const S2SetupStep = ({ profile, onSave }) => {
  const [maddahList, setMaddahList] = useState(
    (profile.s2Maddah || []).filter(m => !m.isPreset).length > 0
      ? profile.s2Maddah.filter(m => !m.isPreset)
      : [{ nama: "", kitab: "", id: Date.now() }]
  );

  const addMaddah = () => {
    if (maddahList.length >= 7) return;
    setMaddahList(prev => [...prev, { nama: "", kitab: "", id: Date.now() + Math.random() }]);
  };

  const updateMaddah = (id, field, value) => {
    setMaddahList(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeMaddah = (id) => {
    if (maddahList.length <= 1) return;
    setMaddahList(prev => prev.filter(m => m.id !== id));
  };

  const handleNext = () => {
    const validMaddah = maddahList.filter(m => m.nama.trim());
    const withManahij = [
      { nama: "Manahij Bahts Ilmi", kitab: "مناهج البحث العلمي", id: "manahij", isPreset: true },
      ...validMaddah,
    ];
    onSave(withManahij);
  };

  return (
    <div className="max-w-2xl mx-auto w-full pt-4">
      <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">Langkah tambahan — S2</div>
      <div className="arabic-classic text-gold-300 text-2xl mb-2" style={{direction:"rtl"}}>
        مَوَادُّ الدِّرَاسَةِ
      </div>
      <h2 className="font-display text-3xl font-semibold text-ink mb-2">
        Maddah S2-mu
      </h2>
      <p className="text-ink-muted mb-8 leading-relaxed">
        Masukkan maddah yang sedang kamu ambil semester ini.
        Tambahkan kitab yang dipakai — ini yang bikin AI langsung paham konteksnya.
      </p>

      {/* Manahij Bahts Ilmi — preset */}
      <div className="card-glass p-4 mb-3 border border-gold-500/20">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] bg-gold-500/15 text-gold-300 px-2 py-0.5 rounded border border-gold-500/20">
            Otomatis — wajib semua jurusan
          </span>
        </div>
        <div className="text-sm font-medium text-ink">Manahij Bahts Ilmi</div>
        <div className="text-xs text-ink-soft arabic-display" style={{direction:"rtl"}}>
          مناهج البحث العلمي
        </div>
      </div>

      {/* Input maddah user */}
      <div className="space-y-3 mb-4">
        {maddahList.map((m, i) => (
          <div key={m.id} className="card-glass p-4 relative">
            <div className="text-xs uppercase tracking-wider text-ink-soft mb-3">
              Maddah {i + 1}
            </div>
            <div className="mb-2">
              <label className="text-xs text-ink-soft mb-1 block">
                Nama maddah (Indonesia atau Arab):
              </label>
              <input
                value={m.nama}
                onChange={e => updateMaddah(m.id, "nama", e.target.value)}
                placeholder="mis. Fiqh Nawazil / فقه النوازل"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-ink outline-none transition-colors"
                style={{fontSize: 16, borderRadius: 12}}
                onFocus={e => e.target.style.borderColor="rgba(113,50,245,0.50)"}
                onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.10)"}
              />
            </div>
            <div>
              <label className="text-xs text-ink-soft mb-1 block">
                Kitab muqarrar yang dipakai:
                <span className="text-ink-soft/60 ml-1">(opsional tapi sangat membantu)</span>
              </label>
              <input
                value={m.kitab}
                onChange={e => updateMaddah(m.id, "kitab", e.target.value)}
                placeholder="mis. Al-Fiqh al-Islami wa Adillatuh / نظرية الضرورة"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-ink outline-none transition-colors"
                style={{fontSize: 16, borderRadius: 12}}
                onFocus={e => e.target.style.borderColor="rgba(113,50,245,0.50)"}
                onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.10)"}
              />
              <p className="text-[11px] text-ink-soft/60 mt-1">
                AI akan menyesuaikan penjelasan berdasarkan kitab ini
              </p>
            </div>
            {maddahList.length > 1 && (
              <button
                onClick={() => removeMaddah(m.id)}
                className="absolute top-3 right-3 text-xs text-ink-soft hover:text-rose-400 transition-colors p-1">
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {maddahList.length < 7 && (
        <button
          onClick={addMaddah}
          className="w-full py-2.5 rounded-xl border border-dashed text-sm text-ink-soft hover:text-ink transition-colors mb-8" style={{borderColor:"rgba(113,50,245,0.28)"}}>
          + Tambah maddah lain
        </button>
      )}

      <button onClick={handleNext} className="btn btn-primary w-full py-3.5">
        Lanjut <Icon name="arrowRight" className="w-4 h-4"/>
      </button>
    </div>
  );
};

const OnboardingPage = () => {
  const { session, profile, saveProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ faculty: null, level: null, major: null, struggle: [], learningStyle: [], s2Maddah: null });
  const toast = useToast();

  useEffect(() => { if (!session) navigate("/"); }, [session]);
  useEffect(() => { if (profile?.onboarded) navigate("/dashboard"); }, [profile]);

  const QUESTIONS = [
    { key: "intro", kind: "intro" },
    {
      key: "faculty",
      title: "Di fakultas apa kamu belajar?",
      hint: "Pilih yang paling dekat",
      options: FACULTIES,
      multi: false,
      iconType: "arabic",
    },
    {
      key: "level",
      title: "Sekarang di tingkat berapa?",
      hint: "Pilih tingkat saat ini",
      options: LEVELS,
      multi: false,
      iconType: "arabic-small",
    },
    {
      key: "major",
      title: "Jurusan apa yang kamu ambil?",
      hint: "Sesuai pembagian fakultasmu",
      optionsFromState: true,
      multi: false,
      iconType: "arabic",
      conditional: (d) => {
        if (d.level === "s2_kuliyyat" || d.level === "s2_dirasat") return false;
        const fac = FACULTIES.find(f => f.id === d.faculty);
        if (!fac || !fac.majorsStartLevel || fac.majors.length === 0) return false;
        const lvlNum = d.level === "mustawa" ? 0 : parseInt(d.level);
        return !isNaN(lvlNum) && lvlNum >= fac.majorsStartLevel;
      },
    },
    {
      key: "s2_setup",
      kind: "s2_setup",
      conditional: (d) => d.level === "s2_kuliyyat" || d.level === "s2_dirasat",
    },
    {
      key: "struggle",
      title: "Sekarang kamu paling sering struggle di bagian mana?",
      hint: "Boleh pilih lebih dari satu",
      options: STRUGGLES,
      multi: true,
      iconType: "lucide",
    },
    {
      key: "learningStyle",
      title: "Biasanya kamu lebih nyaman belajar dengan cara seperti apa?",
      hint: "Boleh pilih lebih dari satu",
      options: LEARNING_STYLES,
      multi: true,
      iconType: "emoji",
    },
  ];

  const getActiveQuestions = (d) => QUESTIONS.filter(q => !q.conditional || q.conditional(d));

  const activeQuestions = getActiveQuestions(data);
  const cur = activeQuestions[step];
  const totalSteps = activeQuestions.length - 1; // exclude intro
  const progress = step === 0 ? 0 : Math.round((step / totalSteps) * 100);

  const currentOptions = cur?.optionsFromState
    ? (FACULTIES.find(f => f.id === data.faculty)?.majors || [])
    : cur?.options;

  const value = data[cur?.key];
  const canNext = cur?.kind === "intro"
    ? true
    : cur?.multi
      ? value && value.length > 0
      : !!value;

  const onPick = (id) => {
    if (!cur) return;
    if (cur.key === "faculty") {
      setData(d => ({ ...d, faculty: id, major: null }));
    } else if (cur.multi) {
      const next = (value || []).includes(id)
        ? (value || []).filter(x => x !== id)
        : [...(value || []), id];
      setData(d => ({ ...d, [cur.key]: next }));
    } else {
      setData(d => ({ ...d, [cur.key]: id }));
    }
  };

  const doFinish = (finalData) => {
    const finalProfile = { ...finalData, onboarded: true, onboardedAt: new Date().toISOString() };
    saveProfile(finalProfile);
    toast.push("Dashboard personal sudah siap untukmu.");
    setTimeout(() => navigate("/welcome"), 400);
  };

  const onNext = () => {
    const active = getActiveQuestions(data);
    if (step < active.length - 1) {
      setStep(step + 1);
    } else {
      doFinish(data);
    }
  };

  const handleS2Save = (s2Maddah) => {
    const newData = { ...data, s2Maddah };
    setData(newData);
    const active = getActiveQuestions(newData);
    if (step < active.length - 1) {
      setStep(step + 1);
    } else {
      doFinish(newData);
    }
  };

  const onBack = () => { if (step > 0) setStep(step - 1); };

  if (!session) return null;

  const isLast = step === getActiveQuestions(data).length - 1;

  return (
    <div className="page-enter min-h-screen flex flex-col">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Blob color="rgba(124,77,255,0.30)" size={520} top={-100} right={-100}/>
        <Blob color="rgba(201,168,106,0.15)" size={400} bottom={-100} left={-100}/>
      </div>
      <div className="container-x py-12 md:py-16 flex-1 flex flex-col relative">

        {/* Progress bar */}
        {step > 0 && (
          <div className="max-w-2xl mx-auto w-full mb-10">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-gold-400 uppercase tracking-wider">Langkah {step} dari {totalSteps}</span>
              <span className="text-ink-muted num">{progress}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full transition-all duration-500 rounded-full"
                style={{width: `${progress}%`, background:"linear-gradient(90deg, var(--kraken-purple), #C9A86A)"}}/>
            </div>
          </div>
        )}

        <div key={step} className="page-enter flex-1 flex flex-col">
          {cur?.kind === "intro" ? (
            <Intro session={session} onNext={onNext}/>
          ) : cur?.kind === "s2_setup" ? (
            <S2SetupStep profile={data} onSave={handleS2Save}/>
          ) : (
            <QuestionStep
              question={cur}
              options={currentOptions}
              value={value}
              onPick={onPick}
            />
          )}
        </div>

        {/* Nav — hide outer button for s2_setup (it has its own) */}
        {cur?.kind !== "intro" && cur?.kind !== "s2_setup" && (
          <div className="max-w-2xl mx-auto w-full mt-10 flex items-center justify-between">
            <button onClick={onBack} className="btn btn-ghost">
              <Icon name="chevronLeft" className="w-4 h-4"/> Kembali
            </button>
            <button onClick={onNext} disabled={!canNext}
              className={`btn btn-primary ${!canNext ? "opacity-40 cursor-not-allowed" : ""}`}>
              {isLast ? "Selesai & buka dashboard" : "Lanjut"} <Icon name="arrowRight" className="w-4 h-4"/>
            </button>
          </div>
        )}
        {cur?.kind === "s2_setup" && (
          <div className="max-w-2xl mx-auto w-full mt-6">
            <button onClick={onBack} className="btn btn-ghost">
              <Icon name="chevronLeft" className="w-4 h-4"/> Kembali
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Intro = ({ session, onNext }) => (
  <div className="max-w-2xl mx-auto text-center pt-10">
    <div className="arabic-display-classical text-3xl text-gold-300 mb-4">السلام عليكم</div>
    <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-tight mb-5">
      Selamat datang, {session.name.split(" ")[0]}.
    </h1>
    <p className="text-ink-muted text-lg leading-relaxed mb-10">
      Sebelum mulai, kasih kami 4–5 pertanyaan singkat supaya dashboard-mu
      benar-benar personal, bukan template umum.
    </p>
    <div className="card-glass p-6 mb-8 text-left max-w-md mx-auto">
      <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">Yang akan ditanyakan</div>
      <ol className="space-y-2.5 text-sm text-ink">
        {[
          "Fakultas di Al-Azhar",
          "Tingkat kuliah saat ini",
          "Jurusan (kalau sudah dijurus)",
          "Area belajar yang jadi tantangan",
          "Cara belajar yang paling nyaman",
        ].map((t, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full text-violet-200 text-xs flex items-center justify-center font-semibold flex-shrink-0" style={{background:"rgba(113,50,245,0.20)",border:"1px solid rgba(113,50,245,0.30)"}}>
              {i + 1}
            </span>
            {t}
          </li>
        ))}
      </ol>
    </div>
    <button onClick={onNext} className="btn btn-primary text-base px-7 py-3.5">
      Mulai · 2 menit saja <Icon name="arrowRight" className="w-4 h-4"/>
    </button>
  </div>
);

const QuestionStep = ({ question, options, value, onPick }) => {
  if (!question || !options) return null;
  const isMulti = question.multi;
  const isSelected = (id) => isMulti ? (value || []).includes(id) : value === id;
  const isArabicSmall = question.iconType === "arabic-small";

  return (
    <div className="max-w-3xl mx-auto w-full pt-4">
      <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">Pertanyaan</div>
      <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink leading-tight mb-3">
        {question.title}
      </h2>
      <p className="text-ink-muted mb-8">{question.hint}</p>
      <div className={`grid ${options.length <= 4 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"} gap-3`}>
        {options.map((opt) => {
          const sel = isSelected(opt.id);
          return (
            <button key={opt.id} onClick={() => onPick(opt.id)}
              className={`text-left p-5 rounded-xl border transition-all relative ${sel
                ? "border-violet-500/60"
                : "bg-white/4 border-white/8 hover:bg-white/6 hover:border-violet-600/35"}`}
              style={sel ? {background:"rgba(113,50,245,0.14)", borderColor:"rgba(113,50,245,0.55)", boxShadow:"0 0 0 1px rgba(113,50,245,0.22), 0 4px 20px rgba(113,50,245,0.18)"} : {}}>
              <div className="flex items-start justify-between mb-2">
                {question.iconType === "emoji" && <span className="text-3xl">{opt.emoji}</span>}
                {(question.iconType === "arabic" || isArabicSmall) && (
                  <span className={`arabic-ui text-gold-300 ${isArabicSmall ? "text-base" : "text-xl"}`}>
                    {opt.arabic}
                  </span>
                )}
                {question.iconType === "lucide" && (
                  <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${sel ? "text-white" : "bg-white/8 text-violet-300"}`} style={sel ? {background:"var(--kraken-purple)"} : {}}>
                    <Icon name={opt.icon} className="w-4 h-4"/>
                  </span>
                )}
                {isMulti && (
                  <span className={`w-5 h-5 rounded-md border flex items-center justify-center ${sel ? "text-white" : "border-white/15"}`} style={sel ? {background:"var(--kraken-purple)",borderColor:"var(--kraken-purple)"} : {}}>
                    {sel && <Icon name="check" className="w-3 h-3" strokeWidth={3}/>}
                  </span>
                )}
                {!isMulti && sel && <Icon name="check" className="w-5 h-5 text-violet-300" strokeWidth={2.4}/>}
              </div>
              <div className="font-display text-lg font-semibold text-ink">{opt.label}</div>
              {opt.desc && <div className="text-xs text-ink-muted mt-1 leading-relaxed">{opt.desc}</div>}
              {opt.short && !opt.desc && <div className="text-xs text-ink-soft mt-1">{opt.short}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

window.OnboardingPage = OnboardingPage;
