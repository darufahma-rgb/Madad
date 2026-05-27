/* AIGYPT, Adaptive Tool Guide Page
   /tools                   , overview, tool list
   /tools?id=<toolId>       , single tool with adaptive guide (defaults to user's learning style)
*/

const useQueryParam = (key) => {
  const path = useRoute();
  const q = path.split("?")[1] || "";
  const params = new URLSearchParams(q);
  return params.get(key);
};

const ToolGuidePage = () => {
  const { session, profile } = useAuth();
  const toolId = useQueryParam("id");

  useEffect(() => {
    if (!session) navigate("/");
    else if (!profile?.onboarded) navigate("/onboarding");
    else markPresenceToday();
  }, [session, profile]);

  if (!session || !profile?.onboarded) return null;

  if (toolId) return <SingleToolGuide toolId={toolId} profile={profile}/>;
  return <ToolListPage profile={profile}/>;
};

/* ============== LIST PAGE ============== */
const ToolListPage = ({ profile }) => {
  const recs = useMemo(() => recommend(profile), [profile]);
  const recIds = new Set(recs.map(r => r.toolId));
  const otherTools = AI_TOOLS.filter(t => !recIds.has(t.id));
  const styleLabel = profile.learningStyle?.[0]
    ? LEARNING_STYLES.find(s => s.id === profile.learningStyle[0])?.label
    : "campuran";

  return (
    <div className="page-enter">
      <PageHeader
        kicker="Adaptive Tool Guide"
        arabic="دليل الذكاء الاصطناعي"
        title="Cara pakai AI sesuai cara belajarmu."
        subtitle={`Guide-mu diadaptasi untuk gaya ${styleLabel.toLowerCase()}. Pilih AI di bawah, langkah, prompt, dan workflow akan otomatis disesuaikan.`}
      />

      <section className="pb-8">
        <div className="container-x">
          <Reveal className="mb-6 flex items-end gap-3">
            <h2 className="font-display text-2xl font-semibold text-ink">Rekomendasi untukmu</h2>
            <span className="chip chip-gold text-[10px]">Personal</span>
          </Reveal>
          <Reveal stagger className="grid md:grid-cols-3 gap-4">
            {recs.map((rec) => <ToolCardListItem key={rec.toolId} tool={rec.tool} highlighted={true} reason={rec.reason}/>)}
          </Reveal>
        </div>
      </section>

      <section className="pb-16">
        <div className="container-x">
          <Reveal className="mb-6">
            <h2 className="font-display text-2xl font-semibold text-ink">Tools lainnya</h2>
          </Reveal>
          <Reveal stagger className="grid md:grid-cols-3 gap-4">
            {otherTools.map((tool) => <ToolCardListItem key={tool.id} tool={tool}/>)}
          </Reveal>
        </div>
      </section>
    </div>
  );
};

const ToolCardListItem = ({ tool, highlighted, reason }) => (
  <a href={`#/tools?id=${tool.id}`} onClick={(e)=>{e.preventDefault(); navigate(`/tools?id=${tool.id}`);}}
    className={`card-glass p-6 hov-lift block relative overflow-hidden ${highlighted ? "ring-1 ring-gold-500/30" : ""}`}>
    <div className="absolute top-0 right-0 w-24 h-24 opacity-25 pointer-events-none" style={{background: `radial-gradient(circle at top right, ${tool.color}, transparent 70%)`}}/>
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <ToolIcon tool={tool} size="w-12 h-12"/>
        <span className="chip chip-glass text-[10px]">{tool.tier}</span>
      </div>
      <div className="font-display text-xl font-semibold text-ink">{tool.name}</div>
      <div className="text-xs text-ink-soft mb-3">{tool.by}</div>
      <p className="text-sm text-ink-muted leading-relaxed clamp-3 mb-4">{reason ? `Untukmu: ${reason}.` : tool.description}</p>
      <div className="flex items-center justify-between text-xs text-violet-300">
        <span>Lihat adaptive guide</span>
        <Icon name="arrowRight" className="w-3.5 h-3.5"/>
      </div>
    </div>
  </a>
);

/* ============== SINGLE TOOL GUIDE ============== */
const SingleToolGuide = ({ toolId, profile }) => {
  const tool = AI_TOOLS.find(t => t.id === toolId);
  const primaryUserStyle = profile.learningStyle?.[0] || "discussion";
  const [activeStyle, setActiveStyle] = useState(primaryUserStyle);
  const { setLastActivity } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (tool) setLastActivity(`Tool Guide: ${tool.name}`, "tool", tool.id);
  }, [tool?.id]);

  if (!tool) {
    return (
      <div className="container-x py-20 text-center">
        <h2 className="font-display text-3xl text-ink mb-4">Tool tidak ditemukan</h2>
        <a href="#/tools" onClick={(e)=>{e.preventDefault(); navigate("/tools");}} className="btn btn-ghost">
          <Icon name="chevronLeft" className="w-4 h-4"/> Kembali ke daftar
        </a>
      </div>
    );
  }

  const guide = tool.guides[activeStyle];
  const style = LEARNING_STYLES.find(s => s.id === activeStyle);

  return (
    <div className="page-enter">
      <section className="relative pt-12 pb-8 overflow-hidden">
        <Blob color={tool.color + "40"} size={500} top={-200} right={-100}/>
        <div className="container-x relative">
          <button onClick={() => navigate("/tools")} className="text-sm text-ink-muted hover:text-ink inline-flex items-center gap-1 mb-6">
            <Icon name="chevronLeft" className="w-4 h-4"/> Semua tools
          </button>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <ToolIcon tool={tool} size="w-16 h-16" rounded="rounded-2xl"/>
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-tight">{tool.name}</h1>
              <div className="text-sm text-ink-muted">{tool.by} · {tool.tier}</div>
            </div>
          </div>
          <p className="text-ink-muted text-lg max-w-2xl leading-relaxed">{tool.description}</p>
          <div className="mt-5 flex items-center gap-2 flex-wrap">
            {tool.bestAt.map((b, i) => <span key={i} className="chip chip-glass">{b}</span>)}
          </div>
        </div>
      </section>

      {/* Style picker */}
      <section className="pb-6">
        <div className="container-x">
          <Reveal>
            <div className="card-glass p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="sparkles" className="w-4 h-4 text-gold-400"/>
                <span className="text-xs uppercase tracking-wider text-gold-400 font-semibold">Adaptive guide · pilih gaya belajar</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {LEARNING_STYLES.map(s => {
                  const isActive = s.id === activeStyle;
                  const isPrimary = s.id === primaryUserStyle;
                  return (
                    <button key={s.id} onClick={() => setActiveStyle(s.id)}
                      className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${isActive
                        ? "bg-violet-500 text-white shadow-glow"
                        : "bg-white/5 text-ink-muted hover:bg-white/8 hover:text-ink border border-line"}`}>
                      <span>{s.emoji}</span>
                      <span>{s.label}</span>
                      {isPrimary && !isActive && <span className="text-[9px] uppercase tracking-wider text-gold-300">Kamu</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Guide content */}
      <section className="pb-12">
        <div className="container-x">
          <div key={activeStyle} className="page-enter grid md:grid-cols-12 gap-5">
            <div className="md:col-span-7 space-y-5">
              {/* When */}
              <Reveal className="card-glass p-7">
                <div className="text-xs uppercase tracking-wider text-gold-400 mb-2 flex items-center gap-2">
                  <Icon name="info" className="w-3.5 h-3.5"/> Kapan dipakai
                </div>
                <p className="text-ink leading-relaxed text-lg">{guide.when}</p>
              </Reveal>

              {/* Steps */}
              <Reveal className="card-glass p-7">
                <div className="text-xs uppercase tracking-wider text-gold-400 mb-4 flex items-center gap-2">
                  <Icon name="list" className="w-3.5 h-3.5"/> Cara mulai · {style.label}
                </div>
                <ol className="space-y-4">
                  {guide.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-violet-500/20 text-violet-200 text-sm flex items-center justify-center font-semibold flex-shrink-0 border border-violet-400/30">{i+1}</span>
                      <span className="text-ink leading-relaxed pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </Reveal>

              {/* Starter prompt */}
              <Reveal className="rounded-2xl overflow-hidden border border-line">
                <div className="flex items-center justify-between px-5 py-3 bg-violet-900/30 border-b border-line">
                  <div className="text-xs uppercase tracking-wider text-gold-400 flex items-center gap-2">
                    <Icon name="cpu" className="w-3.5 h-3.5"/> Starter prompt
                  </div>
                  <CopyButton text={guide.starterPrompt} variant="gold" label="Salin prompt"/>
                </div>
                <pre className="font-mono text-[13.5px] leading-[1.7] p-5 bg-night-900/50 text-ink whitespace-pre-wrap nice-scroll max-h-[280px] overflow-auto">{guide.starterPrompt}</pre>
              </Reveal>
            </div>

            {/* Right column */}
            <div className="md:col-span-5 space-y-5">
              {/* Open AI */}
              <Reveal className="card-glass-strong p-6 relative overflow-hidden">
                <Blob color={tool.color + "60"} size={200} top={-50} right={-50}/>
                <div className="relative">
                  <div className="text-xs uppercase tracking-wider text-gold-400 mb-2">Action</div>
                  <h3 className="font-display text-2xl font-semibold text-ink mb-2">Buka {tool.name}</h3>
                  <p className="text-sm text-ink-muted mb-5">Salin starter prompt di sebelah, lalu klik tombol untuk membuka {tool.name} di tab baru.</p>
                  <a href={tool.link} target="_blank" rel="noreferrer" className="btn btn-primary w-full text-base py-3">
                    Buka {tool.name} <Icon name="arrowRight" className="w-4 h-4"/>
                  </a>
                  <div className="mt-3 text-center">
                    <CopyButton text={guide.starterPrompt} variant="ghost" label="Salin prompt dulu" fullLabel="Prompt tersalin, paste di AI"/>
                  </div>
                </div>
              </Reveal>

              {/* Quick start mini tutorial */}
              <Reveal className="card-glass p-6">
                <div className="text-xs uppercase tracking-wider text-gold-400 mb-3 flex items-center gap-2">
                  <Icon name="play" className="w-3.5 h-3.5"/> ✨ Quick start · 3 langkah
                </div>
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-md bg-gold-500/15 text-gold-300 text-xs flex items-center justify-center font-bold flex-shrink-0">1</span>
                    <span className="text-ink">Salin starter prompt</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-md bg-gold-500/15 text-gold-300 text-xs flex items-center justify-center font-bold flex-shrink-0">2</span>
                    <span className="text-ink">Buka {tool.name} & ganti placeholder [TOPIK] dengan materi belajarmu</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-md bg-gold-500/15 text-gold-300 text-xs flex items-center justify-center font-bold flex-shrink-0">3</span>
                    <span className="text-ink">Tindak lanjuti hasil AI, jangan terima begitu saja</span>
                  </li>
                </ol>
              </Reveal>

              {/* Switch tools */}
              <Reveal className="card-glass p-6">
                <div className="text-xs uppercase tracking-wider text-ink-muted mb-3">Tools lain dengan {style.label.toLowerCase()} guide</div>
                <div className="space-y-2">
                  {AI_TOOLS.filter(t => t.id !== tool.id).slice(0, 3).map(t => (
                    <a key={t.id} href={`#/tools?id=${t.id}`} onClick={(e)=>{e.preventDefault(); navigate(`/tools?id=${t.id}`);}} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors">
                      <ToolIcon tool={t} size="w-8 h-8" rounded="rounded-md"/>
                      <span className="text-sm text-ink font-medium flex-1">{t.name}</span>
                      <Icon name="arrowRight" className="w-3.5 h-3.5 text-ink-soft"/>
                    </a>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

window.ToolGuidePage = ToolGuidePage;
window.useQueryParam = useQueryParam;
