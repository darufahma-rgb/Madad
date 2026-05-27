/* Madad, Personal Dashboard */

const getCairoGreeting = () => {
  const h = (new Date().getUTCHours() + 3) % 24;
  if (h >= 3  && h < 6)  return { text: "Marhaban, ya Syahid al-Fajr", arabic: "مَرْحَباً يَا شَاهِدَ الفَجْرِ", sub: "Waktu yang paling mulia untuk menuntut ilmu." };
  if (h >= 6  && h < 12) return { text: "Selamat pagi dari Kairo",     arabic: "صَبَاحُ الخَيْرِ",           sub: "Semoga pagi ini penuh barakah dan faedah." };
  if (h >= 12 && h < 15) return { text: "Selamat siang",               arabic: "نَهَارُكُمْ سَعِيدٌ",        sub: "Teruskan dars dan catatanmu hari ini." };
  if (h >= 15 && h < 18) return { text: "Selamat sore",                arabic: "مَسَاءُ الخَيْرِ",           sub: "Waktu Ashar — waktunya murajaah yang tenang." };
  if (h >= 18 && h < 22) return { text: "Selamat malam",               arabic: "مَسَاءُ النُّورِ",           sub: "Malam yang tenang di Kairo — waktumu untuk refleksi." };
  return                         { text: "Selamat malam",               arabic: "لَيْلَةٌ مُبَارَكَةٌ",      sub: "Istirahat yang cukup adalah bagian dari belajar." };
};

const DashboardPage = () => {
  const { session, profile, progress, clearProfile } = useAuth();

  const recs = useMemo(() => profile ? recommend(profile) : [], [profile]);
  const stage = useMemo(() => computeStage(), [progress]);

  useEffect(() => {
    if (!session) { navigate("/"); return; }
    if (!profile?.onboarded) { navigate("/onboarding"); return; }
    markPresenceToday();
  }, [session, profile]);

  if (!session || !profile?.onboarded) return null;

  const styleLabel = profile.learningStyle?.[0]
    ? LEARNING_STYLES.find(s => s.id === profile.learningStyle[0])?.label
    : "campuran";
  const facultyData = FACULTIES.find(f => f.id === profile.faculty);
  const facultyLabel = facultyData?.label || FIELDS.find(f => f.id === profile.field)?.label || "-";
  const majorLabel = profile.major ? facultyData?.majors.find(m => m.id === profile.major)?.label : null;
  const levelLabel = LEVELS.find(l => l.id === profile.level)?.short || "";
  const firstName = session.name.split(" ")[0];
  const topRec = recs[0];
  const greeting = getCairoGreeting();

  return (
    <div className="page-enter">

      {/* 1. GREETING */}
      <section className="relative pt-12 md:pt-16 pb-10 overflow-hidden">
        <Blob color="rgba(124,77,255,0.22)" size={600} top={-200} right={-100}/>
        <Blob color="rgba(201,168,106,0.10)" size={400} top={100} left={-150}/>
        <div className="absolute inset-0 pattern-stars opacity-25 pointer-events-none"/>
        <div className="container-x relative">
          <Reveal>
            <div className="arabic-display-classical text-2xl text-gold-300 mb-3">{greeting.arabic}</div>
            <h1 className="font-display text-5xl md:text-[68px] font-semibold text-ink leading-[1.0] tracking-tightest">
              {greeting.text},{" "}
              <span className="gradient-text">{firstName}.</span>
            </h1>
            <p className="mt-5 text-ink-muted text-lg max-w-2xl leading-relaxed">
              Dashboard ini disusun khusus untukmu —{" "}
              <span className="text-ink font-medium">
                {facultyLabel}
                {majorLabel ? ` · ${majorLabel}` : ""}
                {levelLabel ? ` · ${levelLabel}` : ""}
              </span>.
              Madad paham cara belajarmu.
            </p>
          </Reveal>
        </div>
      </section>

      {/* [COMPANION 1] NIAT HARI INI */}
      <section className="pb-6">
        <div className="container-x">
          <IntentionStrip/>
        </div>
      </section>

      {/* 2. CONTINUE LEARNING + STAGE */}
      <section className="pb-8">
        <div className="container-x">
          <Reveal className="grid md:grid-cols-12 gap-4">
            <ContinueCard className="md:col-span-8" progress={progress}/>
            <StageCard className="md:col-span-4" stage={stage}/>
          </Reveal>
        </div>
      </section>

      {/* [COMPANION 2] RITME PEKAN INI */}
      <section className="pb-6">
        <div className="container-x">
          <RhythmCard/>
        </div>
      </section>

      {/* 3. AI RECOMMENDATIONS */}
      <section className="pb-8">
        <div className="container-x">
          <Reveal className="mb-6 flex items-end justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-3 flex items-center gap-2">
                <span className="w-6 h-px bg-gold-500/60"/>Rekomendasi personal
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink">AI yang paling cocok untukmu</h2>
            </div>
            <a href="#/tools" onClick={(e)=>{e.preventDefault(); navigate("/tools");}} className="text-sm text-violet-400 hover:text-violet-300 inline-flex items-center gap-1.5 transition-colors">
              Semua adaptive guide <Icon name="arrowRight" className="w-3.5 h-3.5"/>
            </a>
          </Reveal>
          <Reveal stagger className="grid md:grid-cols-3 gap-4">
            {recs.map((rec, i) => <RecommendationCard key={rec.toolId} rec={rec} index={i} profile={profile}/>)}
          </Reveal>
        </div>
      </section>

      {/* 4. ADAPTIVE GUIDE */}
      {topRec && <AdaptiveGuideQuick profile={profile} topRec={topRec}/>}

      {/* 5. LEARNING PATHS */}
      <section className="pb-8">
        <div className="container-x">
          <Reveal className="mb-6">
            <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-gold-500/60"/>Perjalanan belajarmu
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink">Learning path</h2>
          </Reveal>
          <Reveal stagger className="grid md:grid-cols-3 gap-4">
            {LEARNING_PATHS.map((path) => {
              const pct = computePathProgress(path.id);
              return (
                <a key={path.id} href={"#/paths"} onClick={(e)=>{e.preventDefault(); navigate("/paths");}}
                  className="card-glass p-6 hov-lift block relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-28 h-28 opacity-20 pointer-events-none"
                    style={{background: `radial-gradient(circle at top right, ${path.color}, transparent 70%)`}}/>
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-2xl mb-2">{path.icon}</div>
                        <div className="text-[11px] uppercase tracking-wider text-gold-400 font-semibold">{path.level}</div>
                        <div className="font-display text-xl font-semibold text-ink mt-0.5">{path.label}</div>
                      </div>
                      <span className="text-sm text-ink-muted num font-medium">{pct}%</span>
                    </div>
                    <p className="text-sm text-ink-muted leading-relaxed clamp-2 mb-4">{path.desc}</p>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                      <div className="h-full transition-all duration-700 rounded-full"
                        style={{width: `${pct}%`, background: `linear-gradient(90deg, ${path.color}, #C9A86A)`}}/>
                    </div>
                    <div className="flex items-center justify-between text-xs text-ink-muted">
                      <span>{path.modules.length} modul</span>
                      <span className="inline-flex items-center gap-1 text-violet-400">
                        Mulai <Icon name="arrowRight" className="w-3 h-3"/>
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* [COMPANION 3] REFLEKSI DARI KURASAH */}
      <section className="pb-6">
        <div className="container-x">
          <ReflectionCard/>
        </div>
      </section>

      {/* 6. KURASAH TERAKHIR */}
      <section className="pb-8">
        <div className="container-x">
          <Reveal className="mb-5 flex items-end justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-3 flex items-center gap-2">
                <span className="w-6 h-px bg-gold-500/60"/>Kurasahku
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">Catatan Terakhir</h2>
            </div>
            <button onClick={() => navigate("/kurasah")} className="text-sm text-violet-400 hover:text-violet-300 inline-flex items-center gap-1.5 transition-colors">
              Lihat semua kurasah <Icon name="arrowRight" className="w-3.5 h-3.5"/>
            </button>
          </Reveal>
          <KurasahRecentCards/>
        </div>
      </section>

      {/* 7. PROGRESS & QUICK ACTIONS */}
      <section className="pb-20">
        <div className="container-x">
          <Reveal className="mb-6">
            <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-gold-500/60"/>Aksi & Progress
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">Aksi cepat</h2>
          </Reveal>
          <Reveal stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <QuickAction icon="bookOpen" title="Adaptive guide" desc="Guide sesuai gaya belajarmu untuk setiap AI" to="/tools" color="violet"/>
            <QuickAction icon="layers" title="Learning paths" desc="Modul terstruktur 3 level dari Beginner" to="/paths" color="gold"/>
            <QuickAction icon="shield" title="Etika & Adab" desc="Pakai AI dengan adab thalabul ilmi" to="/ethics" color="violet"/>
            <QuickAction icon="refresh" title="Perbarui profil" desc="Ubah jawaban onboarding" onClick={() => {
              if (confirm("Reset jawaban onboarding dan ulangi?")) {
                clearProfile();
                navigate("/onboarding");
              }
            }} color="gold"/>
          </Reveal>
        </div>
      </section>

      <QuickNoteButton/>
    </div>
  );
};

/* ============ KURASAH RECENT CARDS ============ */
const KurasahRecentCards = () => {
  const [notes, setNotes] = React.useState([]);
  React.useEffect(() => {
    setNotes(loadNotes().slice(0, 3));
    const onRefresh = () => setNotes(loadNotes().slice(0, 3));
    window.addEventListener("madad:refresh", onRefresh);
    return () => window.removeEventListener("madad:refresh", onRefresh);
  }, []);

  if (notes.length === 0) {
    return (
      <Reveal>
        <div className="card-glass rounded-xl p-7 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1 text-center sm:text-left">
            <div className="arabic-display-classical text-gold-300 text-xl leading-loose mb-1" style={{direction:"rtl"}}>قَيِّدُوا الْعِلْمَ بِالْكِتَابَةِ</div>
            <p className="text-sm text-ink-muted italic mb-4">Ikatlah ilmu dengan tulisan. <span className="text-ink-soft">Atsar</span></p>
            <button onClick={() => navigate("/kurasah")} className="btn btn-ghost text-sm py-2 px-4">
              <Icon name="pen" className="w-3.5 h-3.5"/> Mulai menulis
            </button>
          </div>
        </div>
      </Reveal>
    );
  }
  return (
    <Reveal stagger className="grid sm:grid-cols-3 gap-3">
      {notes.map(note => {
        const snippet = (note.body || "").slice(0, 100).replace(/[#*`>]/g, "").trim();
        return (
          <button key={note.id} onClick={() => navigate("/kurasah?id=" + note.id)}
            className="card-glass hov-lift text-left p-4 rounded-xl border border-line hover:border-violet-400/30 transition-all">
            <div className="flex flex-wrap gap-1 mb-2">
              {note.tags.slice(0,2).map(t => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/12 text-violet-300 border border-violet-400/15">{t}</span>
              ))}
            </div>
            <div className="font-display text-sm font-semibold text-ink mb-1 leading-snug">{note.title || "Tanpa judul"}</div>
            {snippet && <p className="text-xs text-ink-soft leading-relaxed" style={{display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{snippet}</p>}
          </button>
        );
      })}
    </Reveal>
  );
};

/* ============ CONTINUE CARD ============ */
const ContinueCard = ({ className = "", progress }) => {
  const last = progress?.lastActivity;
  if (!last) {
    return (
      <div className={`${className} card-glass-strong p-7 relative overflow-hidden`}>
        <Blob color="rgba(124,77,255,0.18)" size={250} top={-80} right={-80}/>
        <div className="relative flex items-start gap-4">
          <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 text-white flex items-center justify-center shadow-glow flex-shrink-0">
            <Icon name="sparkles" className="w-5 h-5"/>
          </span>
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-wider text-gold-400 mb-1.5">Mulai journey-mu</div>
            <div className="font-display text-xl text-ink font-semibold mb-2">Belum ada aktivitas</div>
            <p className="text-sm text-ink-muted mb-5 leading-relaxed">
              Mulai dari learning path Beginner atau langsung ke adaptive guide
              untuk AI yang direkomendasikan untukmu.
            </p>
            <div className="flex gap-2 flex-wrap">
              <a href="#/paths" onClick={(e)=>{e.preventDefault(); navigate("/paths");}} className="btn btn-primary text-sm py-2.5 px-4">
                Mulai Beginner <Icon name="arrowRight" className="w-3.5 h-3.5"/>
              </a>
              <a href="#/tools" onClick={(e)=>{e.preventDefault(); navigate("/tools");}} className="btn btn-ghost text-sm py-2.5 px-4">
                Buka tool guide
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={`${className} card-glass-strong p-7 relative overflow-hidden`}>
      <Blob color="rgba(124,77,255,0.15)" size={200} top={-60} right={-60}/>
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <span className="chip chip-violet text-[10px]">Continue Learning</span>
        </div>
        <div className="font-display text-2xl text-ink font-semibold mb-2 leading-tight">{last.label}</div>
        <p className="text-sm text-ink-muted mb-5 leading-relaxed">Lanjut dari terakhir kamu berhenti, progresmu tersimpan.</p>
        <a href={`#/paths`} onClick={(e)=>{e.preventDefault(); navigate("/paths");}} className="btn btn-gold text-sm py-2.5 px-5">
          Lanjutkan <Icon name="arrowRight" className="w-3.5 h-3.5"/>
        </a>
      </div>
    </div>
  );
};

/* ============ STAGE CARD ============ */
const StageCard = ({ className = "", stage }) => (
  <div className={`${className} card-glass p-7 relative overflow-hidden`}>
    <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-25 pointer-events-none"
      style={{background: "radial-gradient(circle, #C9A86A, transparent 60%)"}}/>
    <div className="relative">
      <div className="text-[11px] uppercase tracking-wider text-gold-400 mb-3 font-semibold">Tahap belajarmu</div>
      <div className="flex items-center gap-3 mb-3">
        <div className="text-4xl">{stage.icon}</div>
        <div className="font-display text-2xl font-semibold text-ink">{stage.label}</div>
      </div>
      <p className="text-xs text-ink-muted leading-relaxed">
        {stage.id === "starting" && "Baru mulai, fokus di learning path Beginner dulu."}
        {stage.id === "growing" && "Berkembang pesat, lanjut ke Intermediate untuk workflow lebih dalam."}
        {stage.id === "ready" && "AI-ready, kamu siap untuk multi-AI workflow riset advanced."}
      </p>
    </div>
  </div>
);

/* ============ RECOMMENDATION CARD ============ */
const RecommendationCard = ({ rec, index, profile }) => {
  const { tool, reason } = rec;
  const primaryStyle = profile.learningStyle?.[0];
  const styleLabel = primaryStyle ? LEARNING_STYLES.find(s => s.id === primaryStyle)?.label : null;
  return (
    <div className="card-glass-strong p-6 hov-lift flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 opacity-25 pointer-events-none"
        style={{background: `radial-gradient(circle at top right, ${tool.color}, transparent 70%)`}}/>
      <div className="relative flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <ToolIcon tool={tool} size="w-12 h-12"/>
            <div>
              <div className="font-display text-xl font-semibold text-ink leading-tight">{tool.name}</div>
              <div className="text-[11px] text-ink-soft mt-0.5">{tool.by}</div>
            </div>
          </div>
          {index === 0 && <span className="chip chip-gold text-[10px] flex-shrink-0">✨ Top pick</span>}
        </div>

        <div className="mb-4">
          <div className="text-[11px] uppercase tracking-wider text-gold-400 font-semibold mb-1.5">Kenapa cocok untukmu</div>
          <p className="text-sm text-ink-muted leading-relaxed">
            Kamu pilih <span className="text-ink font-medium">{styleLabel ? styleLabel.toLowerCase() : "campuran gaya"}</span>
            , {reason}.
          </p>
        </div>

        <div className="mb-5">
          <div className="text-[11px] uppercase tracking-wider text-ink-muted mb-2">Paling unggul di</div>
          <div className="flex flex-wrap gap-1.5">
            {tool.bestAt.map((b, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-ink-muted border border-line">{b}</span>
            ))}
          </div>
        </div>

        <div className="mt-auto flex items-center gap-2 pt-4 border-t border-line">
          <a href={tool.link} target="_blank" rel="noreferrer" className="btn btn-primary text-sm py-2.5 flex-1">
            Buka {tool.name} <Icon name="arrowRight" className="w-3.5 h-3.5"/>
          </a>
          <a href={`#/tools?id=${tool.id}`}
            onClick={(e)=>{e.preventDefault(); navigate(`/tools?id=${tool.id}`);}}
            className="btn btn-ghost text-sm py-2.5 px-3"
            title="Adaptive guide">
            <Icon name="sparkles" className="w-4 h-4"/>
          </a>
        </div>
        <a href={`#/tools?id=${tool.id}`}
          onClick={(e)=>{e.preventDefault(); navigate(`/tools?id=${tool.id}`);}}
          className="mt-2 text-xs text-violet-400 hover:text-violet-300 text-center transition-colors">
          ✨ Tunjukkan cara mulai
        </a>
      </div>
    </div>
  );
};

/* ============ ADAPTIVE GUIDE QUICK PREVIEW ============ */
const AdaptiveGuideQuick = ({ profile, topRec }) => {
  const { tool } = topRec;
  const primaryStyle = profile.learningStyle?.[0] || "discussion";
  const style = LEARNING_STYLES.find(s => s.id === primaryStyle);
  const guide = tool.guides[primaryStyle] || tool.guides.discussion;
  const toast = useToast();

  return (
    <section className="pb-8">
      <div className="container-x">
        <Reveal className="mb-6">
          <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-gold-500/60"/>Cara pakai AI sesuai gaya belajarmu
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink">
            Adaptive guide · <span className="text-violet-300">{tool.name}</span>
          </h2>
        </Reveal>

        <Reveal className="card-glass-strong p-7 md:p-10 relative overflow-hidden">
          <Blob color={tool.color + "30"} size={380} top={-100} right={-100}/>
          <Blob color="rgba(124,77,255,0.12)" size={280} bottom={-80} left={-60}/>
          <div className="relative grid md:grid-cols-12 gap-8">

            {/* Left: guide content */}
            <div className="md:col-span-7">
              <div className="flex items-center gap-4 mb-6">
                <ToolIcon tool={tool} size="w-14 h-14" rounded="rounded-2xl"/>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-gold-400 font-semibold">
                    {style?.emoji} Guide untuk gaya {style?.label}
                  </div>
                  <div className="font-display text-2xl font-semibold text-ink leading-tight">
                    {tool.name} · mode {style?.label?.toLowerCase()}
                  </div>
                </div>
              </div>

              <p className="text-ink-muted leading-relaxed mb-6 text-base border-l-2 border-violet-500/40 pl-4">
                {guide.when}
              </p>

              <div className="text-[11px] uppercase tracking-wider text-gold-400 font-semibold mb-3">
                Cara mulai · 3 langkah pertama
              </div>
              <ol className="space-y-3">
                {guide.steps.slice(0, 3).map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-violet-500/20 text-violet-200 text-sm flex items-center justify-center font-semibold flex-shrink-0 border border-violet-400/30 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-ink leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Right: prompt + CTA */}
            <div className="md:col-span-5 flex flex-col">
              <div className="rounded-xl overflow-hidden border border-line flex-1 mb-4">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-line" style={{background:"rgba(124,77,255,0.12)"}}>
                  <div className="text-[11px] uppercase tracking-wider text-gold-400 font-semibold flex items-center gap-1.5">
                    <Icon name="cpu" className="w-3 h-3"/> Starter prompt
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(guide.starterPrompt); toast.push("Prompt tersalin ✓"); }}
                    className="text-[11px] text-gold-400 hover:text-gold-300 transition-colors px-2 py-1 rounded-md hover:bg-white/5">
                    Salin
                  </button>
                </div>
                <div className="font-mono text-[12px] text-ink-muted leading-relaxed p-4 bg-night-900/50 overflow-hidden"
                  style={{display:"-webkit-box",WebkitLineClamp:6,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
                  {guide.starterPrompt}
                </div>
              </div>

              <a href={`#/tools?id=${tool.id}`}
                onClick={(e)=>{e.preventDefault(); navigate(`/tools?id=${tool.id}`);}}
                className="btn btn-primary w-full text-sm py-3.5">
                ✨ Tunjukkan cara mulai lengkap <Icon name="arrowRight" className="w-4 h-4"/>
              </a>
              <div className="mt-3 text-center text-xs text-ink-soft">
                Guide lengkap tersedia untuk semua 6 gaya belajar
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ============ QUICK ACTION CARD ============ */
const QuickAction = ({ icon, title, desc, to, onClick, color = "violet" }) => {
  const handle = (e) => {
    e.preventDefault();
    if (onClick) onClick();
    else if (to) navigate(to);
  };
  const isGold = color === "gold";
  return (
    <a href={to ? "#" + to : "#"} onClick={handle} className="card-glass p-5 hov-lift block group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3.5 transition-colors ${isGold ? "bg-gold-500/12 text-gold-300 group-hover:bg-gold-500/20" : "bg-violet-500/12 text-violet-300 group-hover:bg-violet-500/20"}`}>
        <Icon name={icon} className="w-5 h-5"/>
      </div>
      <div className="font-display text-base font-semibold text-ink mb-1.5">{title}</div>
      <p className="text-xs text-ink-muted leading-relaxed">{desc}</p>
    </a>
  );
};

window.DashboardPage = DashboardPage;
