import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
/* Talqih, Learning Paths + ModuleRunner */

/* ============ MODULE RUNNER COMPONENTS ============ */

const MateriContent = ({ content }) => (
  <div className="space-y-6">
    {content.body.map((section, i) => (
      <div key={i}>
        <h3 className="font-display text-lg font-semibold text-ink mb-2">{section.heading}</h3>
        <p className="text-sm text-ink-muted leading-relaxed whitespace-pre-line">{section.text}</p>
      </div>
    ))}
    {content.keyPoints?.length > 0 && (
      <div className="p-4 rounded-xl bg-gold-500/8 border border-gold-500/18 mt-2">
        <div className="text-[11px] uppercase tracking-wider text-gold-400 mb-3 font-medium">Poin Kunci</div>
        <ul className="space-y-2">
          {content.keyPoints.map((p, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-ink">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-2 flex-shrink-0"/>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

const PraktikContent = ({ content }) => {
  const toast = useToast();
  return (
    <div className="space-y-5">
      <p className="text-sm text-ink-muted leading-relaxed">{content.intro}</p>
      <div>
        <div className="text-[11px] uppercase tracking-wider text-emerald-300 mb-3 font-medium">Langkah-langkah</div>
        <ol className="space-y-3">
          {content.steps.map((s, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-ink-muted">
              <span className="w-6 h-6 rounded-full text-emerald-200 text-[11px] font-semibold flex items-center justify-center flex-shrink-0 mt-0.5" style={{background:"rgba(62,207,142,0.18)",border:"1px solid rgba(62,207,142,0.28)"}}>{i + 1}</span>
              <span className="leading-relaxed">{s}</span>
            </li>
          ))}
        </ol>
      </div>
      {content.practicePrompt && (
        <div className="rounded-xl overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.08)"}}>
          <div className="flex items-center justify-between px-4 py-3" style={{borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
            <div className="text-[11px] uppercase tracking-wider text-gold-400 font-medium">Prompt untuk dicoba</div>
            <button
              onClick={() => { navigator.clipboard.writeText(content.practicePrompt); toast.push("Prompt tersalin. Paste ke AI."); }}
              className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors">
              <Icon name="copy" className="w-3 h-3"/> Salin
            </button>
          </div>
          <pre className="text-xs text-ink-muted font-mono leading-relaxed whitespace-pre-wrap p-4 max-h-52 overflow-y-auto">{content.practicePrompt}</pre>
        </div>
      )}
    </div>
  );
};

const TourContent = ({ content }) => {
  const [step, setStep] = useState(0);
  const stops  = content.stops || [];
  const stop   = stops[step];
  const tool   = stop ? AI_TOOLS.find(t => t.id === stop.tool) : null;

  if (!stop) return null;

  return (
    <div>
      <p className="text-sm text-ink-muted leading-relaxed mb-5">{content.intro}</p>
      <div className="card-glass p-5 mb-5 min-h-[140px] relative overflow-hidden">
        <Blob color="rgba(62,207,142,0.15)" size={220} top={-60} right={-60}/>
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            {tool && <ToolIcon tool={tool} size="w-12 h-12"/>}
            <h3 className="font-display text-lg font-semibold text-ink leading-snug">{stop.title}</h3>
          </div>
          <p className="text-sm text-ink-muted leading-relaxed">{stop.body}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="btn btn-ghost text-sm px-4 py-2 disabled:opacity-30 disabled:cursor-not-allowed">
          ← Sebelumnya
        </button>
        <div className="flex gap-1.5">
          {stops.map((_, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`w-2 h-2 rounded-full transition-all`}
              style={i === step ? {background:"var(--kraken-purple)",transform:"scale(1.15)"} : {}}/>
          ))}
        </div>
        <button
          onClick={() => setStep(Math.min(stops.length - 1, step + 1))}
          disabled={step === stops.length - 1}
          className="btn btn-ghost text-sm px-4 py-2 disabled:opacity-30 disabled:cursor-not-allowed">
          Selanjutnya →
        </button>
      </div>
    </div>
  );
};

const ModuleRunner = ({ pathId, module, onClose, onComplete }) => {
  const content = module.content;

  const completeBtnLabel =
    content?.type === "materi"  ? "Tandai sudah dibaca" :
    content?.type === "praktik" ? "Tandai sudah dicoba" :
    "Selesai";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-night-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card-glass-strong max-w-2xl w-full max-h-[88vh] overflow-y-auto rounded-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Close btn */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg text-ink-soft hover:text-ink hover:bg-white/8 flex items-center justify-center transition-colors">
          <Icon name="x" className="w-4 h-4"/>
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 pr-8">
            <div className="text-[11px] uppercase tracking-wider text-gold-400 mb-1.5 flex items-center gap-2">
              <span>{module.kind}</span>
              <span className="opacity-40">·</span>
              <span>{module.duration}</span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">{module.title}</h2>
          </div>

          {/* Content */}
          {content?.type === "materi"  && <MateriContent content={content}/>}
          {content?.type === "praktik" && <PraktikContent content={content}/>}
          {content?.type === "tour"    && <TourContent content={content}/>}
          {!content && (
            <p className="text-sm text-ink-muted text-center py-8">Konten modul ini sedang disiapkan.</p>
          )}

          {/* Footer */}
          <div className="mt-8 pt-5 border-t border-line flex gap-3 justify-end">
            <button onClick={onClose} className="btn btn-ghost text-sm px-4 py-2.5">Tutup</button>
            <button onClick={onComplete} className="btn btn-primary text-sm px-5 py-2.5">
              <Icon name="check" className="w-4 h-4"/> {completeBtnLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============ PATHS PAGE ============ */
const PathsPage = () => {
  const { session, profile, progress, markModuleComplete, setLastActivity } = useAuth();
  const [openPath, setOpenPath] = useState(LEARNING_PATHS[0].id);
  const [activeModule, setActiveModule] = useState(null);
  const toast = useToast();
  const stage = useMemo(() => computeStage(), [progress]);

  useEffect(() => {
    if (!session) navigate("/");
    else if (!profile?.onboarded) navigate("/onboarding");
    else markPresenceToday();
  }, [session, profile]);

  if (!session || !profile?.onboarded) return null;

  const handleOpenModule = (path, module) => {
    setActiveModule({ pathId: path.id, module });
  };

  const handleComplete = () => {
    if (!activeModule) return;
    markModuleComplete(activeModule.pathId, activeModule.module.id);
    setLastActivity(activeModule.module.title, activeModule.pathId, activeModule.module.id);
    toast.push(`"${activeModule.module.title}" tercatat selesai.`);
    setActiveModule(null);
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
                    ? "text-ink"
                    : "bg-white/4 text-ink-muted hover:bg-white/6 hover:text-ink border border-white/8"}`}
              style={isOpen ? {background:"rgba(62,207,142,0.18)",border:"1px solid rgba(62,207,142,0.35)",boxShadow:"0 0 0 1px rgba(62,207,142,0.18), 0 4px 16px rgba(62,207,142,0.15)"} : {}}>
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
                      <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.5)", fontStyle:"italic", marginBottom:"4px" }}>Kamu sudah lebih maju dari kebanyakan Masisir yang belum tahu cara pakai AI sama sekali.</p>
                      <div className="text-xs text-ink-muted">{path.modules.filter(m => progress.modules?.[`${path.id}.${m.id}`]?.completed).length} dari {path.modules.length} modul selesai</div>
                    </div>
                    <div className="md:col-span-4 md:text-right">
                      <div className="font-display text-5xl md:text-7xl font-bold gradient-text num leading-none">{pct}<span className="text-2xl md:text-3xl">%</span></div>
                    </div>
                  </div>
                </Reveal>

                <Reveal stagger className="space-y-3">
                  {path.modules.map((module, i) => {
                    const done = progress.modules?.[`${path.id}.${module.id}`]?.completed;
                    return (
                      <div key={module.id} className={`card-glass p-5 transition-all ${done ? "opacity-65" : "hov-lift"}`}>
                        <div className="flex items-center gap-4">
                          <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${done ? "bg-gold-500/20 text-gold-400" : "text-emerald-300"}`}
                            style={!done ? {background:"rgba(62,207,142,0.18)"} : {}}>
                            {done ? <Icon name="check" className="w-5 h-5" strokeWidth={2.4}/> : <span className="font-display text-base font-semibold num">{i + 1}</span>}
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
                            <span className="badge-neutral text-[10px]">Selesai</span>
                          ) : (
                            <button
                              onClick={() => handleOpenModule(path, module)}
                              className="btn btn-primary text-xs py-2 px-4 flex-shrink-0">
                              Yuk mulai <Icon name="arrowRight" className="w-3.5 h-3.5"/>
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
                      <Blob color="rgba(62,207,142,0.28)" size={250} bottom={-100} right={-50}/>
                      <div className="relative">
                        <div className="arabic-display-classical text-3xl text-gold-300 mb-2 leading-loose">الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ</div>
                        <p className="text-xs text-gold-400/70 mb-4 italic">"Segala puji bagi Allah yang dengan nikmat-Nya segala kebaikan menjadi sempurna."</p>
                        <h3 className="font-display text-2xl font-semibold text-ink mb-2">Level {path.level} selesai.</h3>
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
            <div className="relative rounded-2xl overflow-hidden" style={{border:"1px solid rgba(62,207,142,0.16)",background:"rgba(255,255,255,0.04)"}}>
              <Blob color="rgba(201,168,106,0.14)" size={400} top={-120} right={-80}/>
              <Blob color="rgba(62,207,142,0.10)" size={350} bottom={-100} left={-60}/>
              <div className="relative p-8 md:p-12 grid md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-8">
                  <div className="flex items-center gap-3 mb-5">
                    <Icon name="scale" className="w-6 h-6 text-gold-400"/>
                    <span className="text-[11px] uppercase tracking-widest text-gold-400">Ruang Kajian</span>
                  </div>
                  <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink mb-2 leading-tight">Muqaranah</h2>
                  <div className="arabic-display-modern text-gold-300 text-xl leading-loose mb-5" style={{direction:"rtl"}}>
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
                      { num:"6",  label:"Kajian" },
                      { num:"4+", label:"Pendapat per kajian" },
                      { num:"∞",  label:"Buatan sendiri" },
                    ].map((s, i) => (
                      <div key={i} className={`card-glass p-3 rounded-xl ${i === 2 ? "col-span-2" : ""}`}>
                        <div className="font-display text-2xl font-bold gradient-text num">{s.num}</div>
                        <div className="text-[10px] text-ink-muted mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => navigate("/paths/muqaranah")} className="btn btn-primary w-full text-sm py-3.5">
                    <Icon name="scale" className="w-4 h-4"/> Masuk ke Ruang Muqaranah
                  </button>
                </div>
              </div>
              <div className="divider-arabesque opacity-20 mb-0"/>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Module Runner Modal */}
      {activeModule && (
        <ModuleRunner
          pathId={activeModule.pathId}
          module={activeModule.module}
          onClose={() => setActiveModule(null)}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
};

window.PathsPage = PathsPage;
