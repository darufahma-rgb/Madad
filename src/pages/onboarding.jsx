/* Madad — Onboarding (faculty · level · major conditional) */

const OnboardingPage = () => {
  const { session, profile, saveProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ faculty: null, level: null, major: null, struggle: [], learningStyle: [] });
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
        const fac = FACULTIES.find(f => f.id === d.faculty);
        if (!fac || !fac.majorsStartLevel || fac.majors.length === 0) return false;
        const lvlNum = d.level === "mustawa" ? 0 : d.level === "pasca" ? 99 : parseInt(d.level);
        return lvlNum >= fac.majorsStartLevel;
      },
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

  const onNext = () => {
    const active = getActiveQuestions(data);
    if (step < active.length - 1) {
      setStep(step + 1);
    } else {
      const finalProfile = { ...data, onboarded: true, onboardedAt: new Date().toISOString() };
      saveProfile(finalProfile);
      toast.push("Dashboard personal sudah siap untukmu.");
      setTimeout(() => navigate("/dashboard"), 400);
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
              <div className="h-full bg-gradient-to-r from-violet-500 to-gold-400 transition-all duration-500"
                style={{width: `${progress}%`}}/>
            </div>
          </div>
        )}

        <div key={step} className="page-enter flex-1 flex flex-col">
          {cur?.kind === "intro" ? (
            <Intro session={session} onNext={onNext}/>
          ) : (
            <QuestionStep
              question={cur}
              options={currentOptions}
              value={value}
              onPick={onPick}
            />
          )}
        </div>

        {/* Nav */}
        {cur?.kind !== "intro" && (
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
      </div>
    </div>
  );
};

const Intro = ({ session, onNext }) => (
  <div className="max-w-2xl mx-auto text-center pt-10">
    <div className="arabic text-3xl text-gold-300 mb-4">السلام عليكم</div>
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
            <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-200 text-xs flex items-center justify-center font-semibold flex-shrink-0">
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
                ? "bg-violet-500/15 border-violet-400 shadow-glow"
                : "bg-white/4 border-line hover:bg-white/6 hover:border-violet-500/40"}`}>
              <div className="flex items-start justify-between mb-2">
                {question.iconType === "emoji" && <span className="text-3xl">{opt.emoji}</span>}
                {(question.iconType === "arabic" || isArabicSmall) && (
                  <span className={`arabic text-gold-300 ${isArabicSmall ? "text-base" : "text-xl"}`}>
                    {opt.arabic}
                  </span>
                )}
                {question.iconType === "lucide" && (
                  <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${sel ? "bg-violet-500 text-white" : "bg-white/8 text-violet-300"}`}>
                    <Icon name={opt.icon} className="w-4 h-4"/>
                  </span>
                )}
                {isMulti && (
                  <span className={`w-5 h-5 rounded-md border flex items-center justify-center ${sel ? "bg-violet-500 border-violet-500 text-white" : "border-line"}`}>
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
