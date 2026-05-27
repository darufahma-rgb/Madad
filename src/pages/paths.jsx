/* Madad, Learning Paths */

const PathsPage = () => {
  const { session, profile, progress, markModuleComplete, setLastActivity } = useAuth();
  const [openPath, setOpenPath] = useState(LEARNING_PATHS[0].id);
  const toast = useToast();
  const stage = useMemo(() => computeStage(), [progress]);

  useEffect(() => {
    if (!session) navigate("/");
    else if (!profile?.onboarded) navigate("/onboarding");
    else markPresenceToday();
  }, [session, profile]);

  if (!session || !profile?.onboarded) return null;

  const handleComplete = (path, module) => {
    markModuleComplete(path.id, module.id);
    setLastActivity(module.title, path.id, module.id);
    toast.push(`"${module.title}" selesai 🎉`);
  };

  return (
    <div className="page-enter">
      <PageHeader
        kicker="Learning Path"
        arabic="مسار التعلم"
        title="Belajar bertahap, dari pemula ke AI-ready."
        subtitle="Tiga level, masing-masing 5 modul. Mulai dari level yang sesuai stage-mu, atau lompat ke level berikutnya kapanpun."
        right={
          <div className="card-glass p-4 hidden md:block">
            <div className="text-[11px] uppercase tracking-wider text-gold-400">Stage</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl">{stage.icon}</span>
              <span className="font-display text-lg font-semibold text-ink">{stage.label}</span>
            </div>
          </div>
        }
      />

      <section className="pb-12">
        <div className="container-x">
          {/* Tabs */}
          <Reveal className="mb-6 flex flex-wrap gap-2">
            {LEARNING_PATHS.map(path => {
              const pct = computePathProgress(path.id);
              const isOpen = openPath === path.id;
              return (
                <button key={path.id} onClick={() => setOpenPath(path.id)}
                  className={`px-5 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${isOpen
                    ? "bg-white/8 text-ink border border-violet-400/40 shadow-glow"
                    : "bg-white/3 text-ink-muted hover:bg-white/5 hover:text-ink border border-line"}`}>
                  <span className="text-lg">{path.icon}</span>
                  <span>
                    <span className="block text-[10px] uppercase tracking-wider opacity-60">{path.level}</span>
                    <span className="block font-display text-base">{path.label}</span>
                  </span>
                  <span className={`ml-3 text-xs font-mono num ${pct > 0 ? "text-gold-400" : "text-ink-soft"}`}>{pct}%</span>
                </button>
              );
            })}
          </Reveal>

          {/* Open path content */}
          {LEARNING_PATHS.filter(p => p.id === openPath).map(path => {
            const pct = computePathProgress(path.id);
            return (
              <div key={path.id} className="page-enter">
                <Reveal className="card-glass-strong p-8 mb-6 relative overflow-hidden">
                  <Blob color={path.color + "30"} size={300} top={-100} right={-50}/>
                  <div className="relative grid md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-8">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-4xl">{path.icon}</span>
                        <div>
                          <div className="text-[11px] uppercase tracking-wider text-gold-400">{path.level}</div>
                          <h2 className="font-display text-3xl font-semibold text-ink">{path.label}</h2>
                        </div>
                      </div>
                      <p className="text-ink-muted text-lg leading-relaxed mb-5">{path.desc}</p>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                        <div className="h-full transition-all duration-700 rounded-full" style={{width: `${pct}%`, background: `linear-gradient(90deg, ${path.color}, #C9A86A)`}}/>
                      </div>
                      <div className="text-xs text-ink-muted">{path.modules.filter(m => progress.modules?.[`${path.id}.${m.id}`]?.completed).length} dari {path.modules.length} modul selesai</div>
                    </div>
                    <div className="md:col-span-4 md:text-right">
                      <div className="font-display text-7xl font-bold gradient-text num leading-none">{pct}<span className="text-3xl">%</span></div>
                    </div>
                  </div>
                </Reveal>

                <Reveal stagger className="space-y-3">
                  {path.modules.map((module, i) => {
                    const done = progress.modules?.[`${path.id}.${module.id}`]?.completed;
                    return (
                      <div key={module.id} className={`card-glass p-5 transition-all ${done ? "opacity-65" : "hov-lift"}`}>
                        <div className="flex items-center gap-4">
                          <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${done ? "bg-mint-500/20 text-mint-500" : "bg-violet-500/15 text-violet-300"}`}>
                            {done ? <Icon name="check" className="w-5 h-5" strokeWidth={2.4}/> : <span className="font-display text-base font-semibold num">{i+1}</span>}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] uppercase tracking-wider text-gold-400">{module.kind}</span>
                              <span className="text-[10px] text-ink-soft">·</span>
                              <span className="text-[11px] text-ink-muted">{module.duration}</span>
                            </div>
                            <div className={`font-display text-base font-semibold ${done ? "text-ink-muted line-through" : "text-ink"}`}>{module.title}</div>
                          </div>
                          {done ? (
                            <span className="chip chip-glass text-[10px]">Selesai</span>
                          ) : (
                            <button onClick={() => handleComplete(path, module)} className="btn btn-primary text-xs py-2 px-4">
                              Mulai modul <Icon name="arrowRight" className="w-3.5 h-3.5"/>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </Reveal>

                {pct === 100 && (
                  <Reveal className="mt-6">
                    <div className="card-glass-strong p-7 text-center relative overflow-hidden">
                      <Blob color="rgba(201,168,106,0.32)" size={300} top={-100} left={-50}/>
                      <Blob color="rgba(124,77,255,0.28)" size={250} bottom={-100} right={-50}/>
                      <div className="relative">
                        <div className="text-5xl mb-3">🎉</div>
                        <h3 className="font-display text-2xl font-semibold text-ink mb-2">Level {path.level} selesai!</h3>
                        <p className="text-ink-muted">Lanjut ke level berikutnya untuk workflow yang lebih dalam.</p>
                      </div>
                    </div>
                  </Reveal>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Muqaranah Gateway ── */}
      <section className="pb-20">
        <div className="container-x">
          <Reveal>
            <div className="relative rounded-2xl overflow-hidden border border-line" style={{background:"linear-gradient(135deg, rgba(25,11,56,0.9) 0%, rgba(14,6,25,0.85) 100%)"}}>
              <Blob color="rgba(201,168,106,0.14)" size={400} top={-120} right={-80}/>
              <Blob color="rgba(124,77,255,0.18)" size={350} bottom={-100} left={-60}/>
              <div className="relative p-8 md:p-12 grid md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-8">
                  <div className="flex items-center gap-3 mb-5">
                    <Icon name="scale" className="w-6 h-6 text-gold-400"/>
                    <span className="text-[11px] uppercase tracking-widest text-gold-400">Ruang Kajian</span>
                  </div>
                  <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink mb-2 leading-tight">Muqaranah</h2>
                  <div className="arabic text-gold-300 text-xl leading-loose mb-5" style={{direction:"rtl"}}>
                    الْمُقَارَنَةُ بَيْنَ الْأَقْوَالِ
                  </div>
                  <p className="text-ink-muted leading-relaxed max-w-xl mb-4">
                    Ruang untuk merenungi perbedaan pendapat para ulama secara adil. Tersedia 6 tema kajian dari Fiqh, Ushul, Aqidah, dan Hadits, beserta dalil, wajh istidlal, dan sumber kitab aslinya.
                  </p>
                  <p className="text-ink-soft text-sm border-l-2 border-gold-500/30 pl-4 italic">
                    "Ikhtilaf ulama adalah rahmat, memahaminya adalah ilmu." 
                  </p>
                </div>
                <div className="md:col-span-4 flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    {[
                      { num:"6", label:"Kajian" },
                      { num:"4+", label:"Pendapat per kajian" },
                      { num:"∞", label:"Buatan sendiri" },
                    ].map((s,i) => (
                      <div key={i} className={`card-glass p-3 rounded-xl ${i === 2 ? "col-span-2" : ""}`}>
                        <div className="font-display text-2xl font-bold gradient-text num">{s.num}</div>
                        <div className="text-[10px] text-ink-muted mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate("/paths/muqaranah")}
                    className="btn btn-primary w-full text-sm py-3.5">
                    <Icon name="scale" className="w-4 h-4"/> Masuk ke Ruang Muqaranah
                  </button>
                </div>
              </div>
              <div className="divider-arabesque opacity-20 mb-0"/>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

window.PathsPage = PathsPage;
