/* Talqih — Maddah Detail: halaman per Maddah dengan adaptive prompt */

const PromptCard = ({ prompt, maddah, profile }) => {
  const toast = useToast();
  const tool  = AI_TOOLS.find(t => t.id === prompt.targetAI);
  const [showFull, setShowFull] = useState(false);

  const resolvedPrompt = resolveAdaptivePrompt(prompt.template, profile, maddah.name);

  const handleCopy = () => {
    navigator.clipboard.writeText(resolvedPrompt);
    toast.push("Prompt tersalin. Paste ke " + (tool?.name || "AI") + ".");
  };

  const handleCopyAndOpen = () => {
    navigator.clipboard.writeText(resolvedPrompt);
    toast.push("Prompt tersalin. Membuka " + tool?.name + "...");
    if (tool?.link) setTimeout(() => window.open(tool.link, "_blank"), 400);
  };

  return (
    <div className="card-glass p-5">
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {tool && <ToolIcon tool={tool} size="w-9 h-9"/>}
          <div className="min-w-0">
            <div className="font-display text-base font-semibold text-ink leading-snug">{prompt.title}</div>
            <div className="text-[11px] text-ink-soft mt-0.5">Untuk: {tool?.name || prompt.targetAI}</div>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={handleCopy} className="btn btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5">
            <Icon name="copy" className="w-3 h-3"/>Salin
          </button>
          {tool?.link && (
            <button onClick={handleCopyAndOpen} className="btn btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5">
              Salin & Buka<Icon name="external" className="w-3 h-3"/>
            </button>
          )}
        </div>
      </div>

      <div className="p-3 rounded-lg bg-white/3 border border-line">
        <div className={`text-xs text-ink-muted leading-relaxed font-mono whitespace-pre-wrap ${!showFull ? "line-clamp-4" : ""}`}>
          {resolvedPrompt}
        </div>
        <button onClick={() => setShowFull(!showFull)} className="text-[11px] text-violet-300 hover:text-violet-200 mt-2 block">
          {showFull ? "Sembunyikan" : "Lihat lengkap"}
        </button>
      </div>
    </div>
  );
};

const MaddahDetailPage = () => {
  const { session, profile } = useAuth();
  const toast = useToast();

  const path      = window.location.hash.slice(1);
  const idMatch   = path.match(/^\/maddah\/([\w-]+)/);
  const maddahId  = idMatch ? idMatch[1] : null;
  const maddah    = maddahId ? getMaddahById(maddahId) : null;

  const [activeKind, setActiveKind] = useState("pahami");

  if (!session) { navigate("/"); return null; }

  if (!maddah) {
    return (
      <div className="container-x py-20 text-center">
        <p className="text-ink-muted mb-4">Maddah tidak ditemukan.</p>
        <button onClick={() => navigate("/maddah")} className="btn btn-ghost">← Kembali ke daftar Maddah</button>
      </div>
    );
  }

  const hasContent   = maddah.prompts && Object.values(maddah.prompts).some(arr => arr.length > 0);
  const totalPrompts = hasContent ? Object.values(maddah.prompts).reduce((s, arr) => s + arr.length, 0) : 0;
  const catLabel     = MADDAH_CATEGORIES.find(c => c.id === maddah.category)?.label;

  return (
    <div className="page-enter">

      {/* Header */}
      <section className="relative pt-10 pb-8 overflow-hidden">
        <Blob color="rgba(124,77,255,0.18)" size={500} top={-150} right={-100}/>
        <div className="container-x relative">
          <button onClick={() => navigate("/maddah")}
            className="text-sm text-ink-soft hover:text-ink inline-flex items-center gap-2 mb-5">
            ← Daftar Maddah
          </button>

          <div className="flex items-start justify-between flex-wrap gap-4 mb-3">
            <div>
              <div className="arabic-display text-gold-300 text-4xl md:text-5xl mb-2" style={{direction:"rtl"}}>
                {maddah.nameArabic}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink">{maddah.name}</h1>
            </div>
            {catLabel && <span className="chip-glass text-xs flex-shrink-0 mt-1">{catLabel}</span>}
          </div>

          <p className="text-base md:text-lg text-ink-muted leading-relaxed max-w-2xl mt-4">
            {maddah.description}
          </p>
        </div>
      </section>

      {/* Coming soon banner if no content */}
      {!hasContent && (
        <section className="container-x mb-8">
          <div className="card-glass p-5 border border-violet-500/20 bg-violet-500/5 text-center">
            <div className="text-violet-300 font-medium mb-1">Konten lengkap segera hadir</div>
            <div className="text-sm text-ink-muted">
              Maddah ini sedang disiapkan dengan tutorial dan 15+ prompt template.
              Stay tuned — akan tersedia di update berikutnya.
            </div>
          </div>
        </section>
      )}

      {hasContent && (
        <>
          {/* Kitab Utama */}
          {maddah.kitabUtama.length > 0 && (
            <section className="container-x mb-8">
              <h2 className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 inline-flex items-center gap-2">
                <span className="w-6 h-px bg-gold-500/70"/>Kitab Utama
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                {maddah.kitabUtama.map((k, i) => (
                  <div key={i} className="card-glass p-4">
                    <div className="arabic-display text-gold-300 text-lg mb-1" style={{direction:"rtl"}}>{k.arabic}</div>
                    <div className="font-display text-sm font-semibold text-ink">{k.nama}</div>
                    <div className="text-[11px] text-ink-soft mt-1">{k.penulis}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* AI Recommendation */}
          {maddah.recommendedAI.length > 0 && (
            <section className="container-x mb-8">
              <h2 className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 inline-flex items-center gap-2">
                <span className="w-6 h-px bg-gold-500/70"/>AI yang Direkomendasikan
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {maddah.recommendedAI.map((ai, i) => {
                  const tool = AI_TOOLS.find(t => t.id === ai.tool);
                  return (
                    <div key={i} className="card-glass-strong p-5">
                      <div className="flex items-center gap-3 mb-3">
                        {tool && <ToolIcon tool={tool} size="w-11 h-11"/>}
                        <div className="flex-1 min-w-0">
                          <div className="font-display text-lg font-semibold text-ink">{tool?.name || ai.tool}</div>
                          <div className="text-xs text-ink-soft">{ai.strength}</div>
                        </div>
                        {ai.rank === 1 && <span className="chip-glass text-[10px] text-gold-300 flex-shrink-0">TOP PICK</span>}
                      </div>
                      <p className="text-sm text-ink-muted leading-relaxed">{ai.why}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Tutorial */}
          {maddah.tutorial.steps.length > 0 && (
            <section className="container-x mb-10">
              <h2 className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 inline-flex items-center gap-2">
                <span className="w-6 h-px bg-gold-500/70"/>Tutorial Pakai AI
              </h2>
              {maddah.tutorial.overview && (
                <p className="text-sm text-ink-muted mb-4">{maddah.tutorial.overview}</p>
              )}
              <div className="space-y-3">
                {maddah.tutorial.steps.map((s, i) => (
                  <div key={i} className="card-glass p-4 flex gap-4 items-start">
                    <div className="font-display text-2xl text-gold-400 flex-shrink-0">{String(i+1).padStart(2,"0")}</div>
                    <div>
                      <h3 className="font-display text-base font-semibold text-ink mb-1">{s.title}</h3>
                      <p className="text-sm text-ink-muted leading-relaxed">{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Prompts — Tab by Kind */}
          <section className="container-x pb-20">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <h2 className="text-xs uppercase tracking-[0.22em] text-gold-400 inline-flex items-center gap-2">
                <span className="w-6 h-px bg-gold-500/70"/>Template Prompt ({totalPrompts})
              </h2>
              <div className="text-xs text-ink-soft">
                ✦ Disesuaikan untuk {TINGKATAN_LABEL[profile?.level] || "tingkatmu"}
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
              {MADDAH_PROMPT_KINDS.map(kind => {
                const count = maddah.prompts[kind.id]?.length || 0;
                if (count === 0) return null;
                return (
                  <button
                    key={kind.id}
                    onClick={() => setActiveKind(kind.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      activeKind === kind.id
                        ? "bg-violet-500/20 text-violet-200 border border-violet-500/30"
                        : "bg-white/3 text-ink-muted border border-line hover:bg-white/5"
                    }`}
                  >
                    <span>{kind.label}</span>
                    <span className="text-[10px] opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              {(maddah.prompts[activeKind] || []).map((p, i) => (
                <PromptCard key={i} prompt={p} maddah={maddah} profile={profile}/>
              ))}
              {(maddah.prompts[activeKind] || []).length === 0 && (
                <p className="text-sm text-ink-soft text-center py-8">
                  Belum ada prompt untuk kategori ini.
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

window.MaddahDetailPage = MaddahDetailPage;
