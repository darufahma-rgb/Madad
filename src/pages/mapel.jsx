/* Madad — Panduan Mata Pelajaran Al-Azhar
   /mapel          → daftar semua mata pelajaran
   /mapel?id=fiqh  → panduan detail satu mata pelajaran
*/

const useMapelParam = () => {
  const path = useRoute();
  const q = path.split("?")[1] || "";
  return new URLSearchParams(q).get("id");
};

const MapelPage = () => {
  const { session, profile } = useAuth();
  const mapelId = useMapelParam();

  useEffect(() => {
    if (!session) navigate("/");
    else if (!profile?.onboarded) navigate("/onboarding");
    else markPresenceToday();
  }, [session, profile]);

  if (!session || !profile?.onboarded) return null;

  if (mapelId) {
    const guide = MAPEL_GUIDES.find(g => g.id === mapelId);
    if (guide) return <MapelDetailPage guide={guide} profile={profile}/>;
  }
  return <MapelListPage profile={profile}/>;
};

/* ============================================================
   LIST PAGE
   ============================================================ */
const MapelListPage = ({ profile }) => {
  const [faculty, setFaculty] = React.useState("semua");

  const FACULTY_TABS = [
    { id: "semua",       label: "Semua", count: MAPEL_GUIDES.length },
    { id: "syariah",     label: "Syariah", count: MAPEL_GUIDES.filter(g => g.faculty === "syariah").length },
    { id: "ushuluddin",  label: "Ushuluddin", count: MAPEL_GUIDES.filter(g => g.faculty === "ushuluddin").length },
    { id: "bahasa",      label: "Bahasa Arab", count: MAPEL_GUIDES.filter(g => g.faculty === "bahasa").length },
    { id: "umum",        label: "Lintas Mapel", count: MAPEL_GUIDES.filter(g => g.faculty === "umum").length },
  ];

  const filtered = faculty === "semua"
    ? MAPEL_GUIDES
    : MAPEL_GUIDES.filter(g => g.faculty === faculty);

  const userField = profile?.field;
  const isMyFaculty = (g) => userField && g.faculty === userField;

  return (
    <div className="page-enter">
      <PageHeader
        kicker="Panduan Mata Pelajaran"
        arabic="دَلِيلُ المَوَادِّ الدِّرَاسِيَّةِ"
        title="Cara pakai AI untuk setiap dars di Al-Azhar."
        subtitle="MADAD tidak menyediakan AI — MADAD memberi panduan langkah demi langkah cara pakainya untuk setiap mata pelajaranmu. Buka Claude. Pakai prompt ini. Pahami lebih dalam."
      />

      <section className="pb-6">
        <div className="container-x">
          <Reveal>
            <div className="card-glass p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gold-500/15 text-gold-300 flex items-center justify-center flex-shrink-0">
                <Icon name="info" className="w-5 h-5"/>
              </div>
              <div>
                <div className="text-sm font-semibold text-ink mb-0.5">Cara pakai halaman ini</div>
                <p className="text-sm text-ink-muted leading-relaxed">Pilih mata pelajaran → baca panduan → buka AI yang direkomendasikan → pakai prompt yang sudah disiapkan. Bukan AI-nya yang kamu dapatkan dari MADAD, tapi <em className="text-ink not-italic">panduan cara pakainya</em>.</p>
              </div>
            </div>
          </Reveal>

          <Reveal className="flex flex-wrap gap-2 mb-8">
            {FACULTY_TABS.map(t => (
              <button key={t.id} onClick={() => setFaculty(t.id)}
                className={`text-sm px-4 py-2 rounded-full border transition-colors flex items-center gap-2 ${faculty === t.id ? "bg-violet-500/20 text-violet-200 border-violet-400/40" : "bg-white/3 text-ink-muted border-line hover:border-violet-400/25"}`}>
                {t.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${faculty === t.id ? "bg-violet-400/25 text-violet-200" : "bg-white/8 text-ink-soft"}`}>{t.count}</span>
              </button>
            ))}
          </Reveal>

          <Reveal stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(guide => (
              <MapelCard key={guide.id} guide={guide} highlighted={isMyFaculty(guide)}/>
            ))}
          </Reveal>
        </div>
      </section>
    </div>
  );
};

const MapelCard = ({ guide, highlighted }) => (
  <div className={`card-glass hov-lift flex flex-col overflow-hidden transition-all ${highlighted ? "border-violet-400/25" : ""}`}>
    {highlighted && (
      <div className="px-5 py-2 bg-violet-500/10 border-b border-violet-400/15">
        <span className="text-[10px] text-violet-300 uppercase tracking-wider">Bidangmu</span>
      </div>
    )}
    <div className="p-6 flex flex-col flex-1">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-violet-500/12 text-violet-300 flex items-center justify-center flex-shrink-0">
          <Icon name={guide.icon} className="w-5 h-5"/>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {guide.aiLogo && (
            <img src={guide.aiLogo} alt={guide.aiName}
              className="w-5 h-5 rounded object-cover opacity-80"/>
          )}
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
            style={{background: guide.aiColor + "18", color: guide.aiColor, borderColor: guide.aiColor + "30"}}>
            {guide.aiName}
          </span>
        </div>
      </div>

      <div className="mb-3">
        <div className="font-display text-xl font-semibold text-ink">{guide.subject}</div>
        <div className="arabic text-sm text-gold-300/80 mt-0.5">{guide.arabic}</div>
      </div>

      <p className="text-sm text-ink-muted leading-relaxed mb-5 flex-1">{guide.tagline}</p>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {guide.useCases.slice(0,2).map((u, i) => (
          <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/4 text-ink-soft border border-line">{u}</span>
        ))}
        {guide.useCases.length > 2 && (
          <span className="text-[10px] px-2 py-0.5 rounded bg-white/4 text-ink-soft border border-line">+{guide.useCases.length - 2} lagi</span>
        )}
      </div>

      <button
        onClick={() => navigate("/mapel?id=" + guide.id)}
        className="btn btn-ghost text-sm py-2.5 w-full">
        <Icon name="bookOpen" className="w-4 h-4"/> Buka Panduan
      </button>
    </div>
  </div>
);

/* ============================================================
   DETAIL PAGE
   ============================================================ */
const MapelDetailPage = ({ guide, profile }) => {
  const toast = useToast();
  const [copiedIdx, setCopiedIdx] = React.useState(null);

  const copyPrompt = (text, idx) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      toast.push("Prompt tersalin. Paste ke " + guide.aiName + " sekarang.");
      setTimeout(() => setCopiedIdx(null), 2500);
    });
  };

  return (
    <div className="page-enter">

      {/* Back + Breadcrumb */}
      <div className="container-x pt-8 pb-2">
        <button onClick={() => navigate("/mapel")}
          className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors mb-6">
          <Icon name="chevronLeft" className="w-4 h-4"/> Semua Mata Pelajaran
        </button>
      </div>

      {/* Header */}
      <section className="relative pb-10 overflow-hidden">
        <Blob color="rgba(124,77,255,0.2)" size={500} top={-150} right={-100}/>
        <Blob color="rgba(201,168,106,0.08)" size={400} top={100} left={-150}/>
        <div className="absolute inset-0 pattern-stars opacity-20 pointer-events-none"/>
        <div className="container-x relative">
          <Reveal>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 flex items-center gap-2">
                  <span className="w-6 h-px bg-gold-500/70"/>Panduan Mata Pelajaran
                </div>
                <div className="arabic text-3xl text-gold-200 mb-2">{guide.arabic}</div>
                <h1 className="font-display text-5xl md:text-6xl font-semibold text-ink leading-[1.0] tracking-tightest mb-4">
                  {guide.subject}
                </h1>
                <p className="text-ink-muted text-lg max-w-xl leading-relaxed">{guide.description}</p>
              </div>
              <div className="card-glass p-5 flex flex-col gap-3 min-w-[220px]">
                <div className="text-[10px] uppercase tracking-wider text-ink-soft mb-1">AI yang direkomendasikan</div>
                <div className="flex items-center gap-3">
                  {guide.aiLogo && (
                    <img src={guide.aiLogo} alt={guide.aiName} className="w-9 h-9 rounded-lg object-cover"/>
                  )}
                  <div>
                    <div className="font-semibold text-ink text-sm">{guide.aiName}</div>
                    <div className="text-[11px] text-ink-soft">{guide.aiBy}</div>
                  </div>
                </div>
                <a
                  href={guide.aiId === "claude" ? "https://claude.ai" : guide.aiId === "chatgpt" ? "https://chat.openai.com" : guide.aiId === "perplexity" ? "https://perplexity.ai" : "#"}
                  target="_blank" rel="noopener noreferrer"
                  className="btn text-xs py-2 px-3 mt-1"
                  style={{background: guide.aiColor + "20", color: guide.aiColor, border: "1px solid " + guide.aiColor + "35"}}>
                  <Icon name="arrowRight" className="w-3.5 h-3.5"/> Buka {guide.aiName}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Why This AI */}
      <section className="pb-8">
        <div className="container-x">
          <Reveal className="card-glass p-6 md:p-8 border-l-2" style={{borderLeftColor: guide.aiColor + "70"}}>
            <div className="text-[10px] uppercase tracking-wider mb-3" style={{color: guide.aiColor}}>Mengapa {guide.aiName}?</div>
            <p className="text-ink-muted leading-relaxed">{guide.whyThisAI}</p>
          </Reveal>
        </div>
      </section>

      {/* Use Cases */}
      <section className="pb-8">
        <div className="container-x">
          <Reveal className="mb-5">
            <h2 className="font-display text-2xl font-semibold text-ink">Apa yang bisa dilakukan</h2>
          </Reveal>
          <Reveal stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {guide.useCases.map((u, i) => (
              <div key={i} className="card-glass p-4 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-500/15 text-violet-300 flex items-center justify-center flex-shrink-0 mt-0.5 text-[11px] font-semibold">{i+1}</div>
                <p className="text-sm text-ink-muted leading-relaxed">{u}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Steps */}
      <section className="pb-8">
        <div className="container-x">
          <Reveal className="mb-6">
            <h2 className="font-display text-2xl font-semibold text-ink">Panduan langkah demi langkah</h2>
            <p className="text-sm text-ink-muted mt-2">Ikuti urutan ini untuk sesi belajar yang efektif.</p>
          </Reveal>
          <Reveal className="space-y-3">
            {guide.steps.map((step, i) => (
              <div key={i} className="card-glass p-5 flex gap-4 items-start">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-display text-lg font-semibold text-ink"
                  style={{background: guide.aiColor + "20", color: guide.aiColor}}>
                  {step.n}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-ink text-sm mb-1">{step.title}</div>
                  <p className="text-sm text-ink-muted leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Prompts */}
      <section className="pb-8">
        <div className="container-x">
          <Reveal className="mb-6">
            <h2 className="font-display text-2xl font-semibold text-ink">Prompt siap pakai</h2>
            <p className="text-sm text-ink-muted mt-2">Salin prompt di bawah, paste ke {guide.aiName}, lalu ganti bagian dalam [KURUNG SIKU] sesuai kebutuhanmu.</p>
          </Reveal>
          <Reveal className="space-y-4">
            {guide.prompts.map((prompt, i) => (
              <div key={i} className="card-glass-strong p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="text-sm font-semibold text-ink">{prompt.label}</div>
                  <button
                    onClick={() => copyPrompt(prompt.text, i)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${copiedIdx === i ? "bg-mint-500/15 text-mint-500 border-mint-500/30" : "bg-white/4 text-ink-muted border-line hover:border-violet-400/30 hover:text-ink"}`}>
                    <Icon name={copiedIdx === i ? "check" : "copy"} className="w-3.5 h-3.5"/>
                    {copiedIdx === i ? "Tersalin!" : "Salin"}
                  </button>
                </div>
                <div className="bg-night-950/60 rounded-xl p-4 text-sm text-ink-muted leading-relaxed font-mono whitespace-pre-wrap border border-line nice-scroll overflow-x-auto">
                  {prompt.text}
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Tips */}
      <section className="pb-16">
        <div className="container-x">
          <Reveal>
            <div className="card-glass p-6 md:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gold-500/15 text-gold-300 flex items-center justify-center flex-shrink-0">
                  <Icon name="lightbulb" className="w-5 h-5"/>
                </div>
                <h2 className="font-display text-xl font-semibold text-ink">Tips & catatan penting</h2>
              </div>
              <ul className="space-y-3">
                {guide.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-gold-500/15 text-gold-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon name="check" className="w-3 h-3"/>
                    </span>
                    <p className="text-sm text-ink-muted leading-relaxed">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Bottom nav */}
      <section className="pb-16 pt-0">
        <div className="container-x">
          <Reveal className="flex flex-col sm:flex-row gap-3 justify-between items-center card-glass p-6">
            <div>
              <div className="text-sm font-semibold text-ink mb-1">Siap mulai?</div>
              <p className="text-xs text-ink-muted">Buka {guide.aiName}, pakai prompt di atas, dan mulai sesi belajar {guide.subject}-mu.</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button onClick={() => navigate("/mapel")} className="btn btn-ghost text-sm py-2.5 px-4">
                <Icon name="chevronLeft" className="w-4 h-4"/> Mata Pelajaran Lain
              </button>
              <a
                href={guide.aiId === "claude" ? "https://claude.ai" : guide.aiId === "chatgpt" ? "https://chat.openai.com" : guide.aiId === "perplexity" ? "https://perplexity.ai" : "#"}
                target="_blank" rel="noopener noreferrer"
                className="btn btn-primary text-sm py-2.5 px-5">
                <Icon name="arrowRight" className="w-4 h-4"/> Buka {guide.aiName}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
};
