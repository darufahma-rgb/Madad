/* Talqih — Maddah Detail: halaman per Maddah dengan adaptive prompt */

/* ---- Error Boundary lokal ---- */
class MaddahDetailErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="container-x py-20 text-center">
          <div className="arabic-display text-gold-300 text-3xl mb-4" style={{direction:"rtl"}}>تَلْقِيح</div>
          <p className="text-ink-muted mb-4">Terjadi error saat memuat maddah ini.</p>
          <button
            onClick={() => { this.setState({hasError:false}); navigate("/maddah"); }}
            className="btn btn-ghost text-sm px-4 py-2">
            ← Kembali ke Daftar Maddah
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ---- Starter Pack Button ---- */
const StarterPackButton = ({ profile, session }) => {
  const toast = useToast();
  const handleCopy = () => {
    const pack = generateStarterPack(profile, session);
    navigator.clipboard.writeText(pack);
    toast.push("Starter Pack tersalin. Paste ke AI di awal chat.");
  };
  return (
    <button
      onClick={handleCopy}
      className="btn btn-primary text-sm px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
      <Icon name="copy" className="w-3.5 h-3.5"/> Salin Starter Pack
    </button>
  );
};

const MaddahPromptCard = ({ prompt, maddah, profile }) => {
  const toast = useToast();

  // Guard: kalau prompt tidak valid, jangan render
  if (!prompt || !prompt.template || !prompt.title) return null;

  // Normalisasi semua field — field opsional diberi fallback aman
  const safePrompt = {
    title:    prompt.title    || "",
    template: prompt.template || "",
    targetAI: prompt.targetAI || "claude",
    subcat:   prompt.subcat   || null,
    kind:     prompt.kind     || null,
  };

  const tool  = AI_TOOLS.find(t => t.id === safePrompt.targetAI);
  const [showFull, setShowFull] = useState(false);
  const [copied, setCopied] = useState(false);

  const resolvedPrompt = resolveAdaptivePrompt(safePrompt.template, profile, maddah?.name || "") || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(resolvedPrompt);
    toast.push("Prompt tersalin. Paste ke " + (tool?.name || "AI") + ".");
    setCopied(true);
    if (typeof trackPromptCopied !== "undefined") trackPromptCopied(maddah.id);
  };

  const handleCopyAndOpen = () => {
    navigator.clipboard.writeText(resolvedPrompt);
    toast.push("Prompt tersalin. Membuka " + tool?.name + "...");
    setCopied(true);
    if (typeof trackPromptCopied !== "undefined") trackPromptCopied(maddah.id);
    if (tool?.link) setTimeout(() => window.open(tool.link, "_blank"), 400);
  };

  const handleSaveToKurasah = () => {
    const noteTemplate = `## Prompt yang dipakai\n**Maddah:** ${maddah.name}\n**Tujuan:** ${safePrompt.title}\n\n---\n\n## Jawaban AI\n\n*Paste jawaban AI di sini...*\n\n---\n\n## Catatanku\n\n*Tulis refleksi atau poin penting dari jawaban AI...*`;
    const newNote = {
      id: "note_" + Date.now(),
      title: `${maddah.name} — ${safePrompt.title}`,
      body: noteTemplate,
      tags: [maddah.category, maddah.id],
      source: { type: "maddah", id: maddah.id, label: maddah.name },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const existing = loadNotes();
    saveNotes([newNote, ...existing]);
    navigate("/kurasah?id=" + newNote.id);
    toast.push("Catatan dibuat — paste jawaban AI di sana.");
  };

  return (
    <div className="card-glass p-5">
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {tool && <ToolIcon tool={tool} size="w-9 h-9"/>}
          <div className="min-w-0">
            <div className="font-display text-base font-semibold text-ink leading-snug">{safePrompt.title}</div>
            <div className="text-[11px] text-ink-soft mt-0.5">Untuk: {tool?.name || safePrompt.targetAI}</div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 w-full sm:w-auto">
          <button onClick={handleCopy} className="btn btn-ghost text-xs px-3 py-2.5 flex items-center justify-center gap-1.5 w-full sm:w-auto" style={{minHeight:44}}>
            <Icon name="copy" className="w-3 h-3"/>{copied ? "Tersalin ✓" : "Salin"}
          </button>
          {tool?.link && (
            <button onClick={handleCopyAndOpen} className="btn btn-primary text-xs px-3 py-2.5 flex items-center justify-center gap-1.5 w-full sm:w-auto" style={{minHeight:44}}>
              Buka {tool.name}<Icon name="external" className="w-3 h-3"/>
            </button>
          )}
        </div>
      </div>

      <div className="p-3 rounded-xl mb-3" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>
        <div className={`text-xs text-ink-muted leading-relaxed font-mono whitespace-pre-wrap ${!showFull ? "line-clamp-4" : ""}`}>
          {resolvedPrompt}
        </div>
        <button onClick={() => setShowFull(!showFull)} className="text-[11px] text-emerald-300 hover:text-emerald-200 mt-2 block">
          {showFull ? "Sembunyikan" : "Lihat lengkap"}
        </button>
      </div>

      {copied && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gold-500/8 border border-gold-500/20 animate-fade-in">
          <div className="text-xs text-ink-muted leading-relaxed">
            <span className="text-gold-300 font-medium">Sudah dapat jawaban dari AI?</span>
            {" "}Simpan ke Kurasah supaya tidak hilang.
          </div>
          <button
            onClick={handleSaveToKurasah}
            className="btn btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0 border border-gold-500/30 text-gold-300 hover:bg-gold-500/10"
          >
            <Icon name="notebook" className="w-3 h-3"/>
            Simpan
          </button>
        </div>
      )}
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

  useEffect(() => {
    if (maddah && session && typeof trackMaddahOpen !== "undefined") {
      trackMaddahOpen(maddah.id);
    }
  }, [maddah?.id]);

  if (!session) { navigate("/"); return null; }

  // Guard: kalau getMaddahById belum ready atau id tidak valid
  if (!maddah || typeof maddah !== "object") {
    return (
      <div className="container-x py-20 text-center">
        <div className="arabic-display text-gold-300 text-3xl mb-4" style={{direction:"rtl"}}>تَلْقِيح</div>
        <p className="text-ink-muted mb-2">Maddah tidak ditemukan.</p>
        <p className="text-xs text-ink-soft mb-6">ID: {maddahId}</p>
        <button
          onClick={() => navigate("/maddah")}
          className="btn btn-ghost text-sm px-4 py-2">
          ← Kembali ke Daftar Maddah
        </button>
      </div>
    );
  }

  const hasContent   = maddah?.prompts
    && typeof maddah.prompts === "object"
    && Object.values(maddah.prompts).some(arr =>
      Array.isArray(arr) && arr.some(p => p && p.template)
    );
  const totalPrompts = hasContent
    ? Object.values(maddah.prompts).reduce((s, arr) =>
        s + (Array.isArray(arr) ? arr.length : 0), 0)
    : 0;
  const catLabel     = MADDAH_CATEGORIES.find(c => c.id === maddah.category)?.label;

  // Defensive: field opsional yang mungkin tidak ada di semua maddah
  const kitabUtama    = Array.isArray(maddah.kitabUtama)    ? maddah.kitabUtama    : [];
  const recommendedAI = Array.isArray(maddah.recommendedAI) ? maddah.recommendedAI : [];
  const tutorial      = maddah.tutorial && Array.isArray(maddah.tutorial.steps)
    ? maddah.tutorial
    : { overview: "", steps: [] };

  return (
    <div className="page-enter">

      {/* Header */}
      <section className="relative pt-4 md:pt-10 pb-6 md:pb-8 overflow-hidden">
        <Blob color="rgba(62,207,142,0.18)" size={500} top={-150} right={-100}/>
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
            {catLabel && <span className="badge-neutral flex-shrink-0 mt-1">{catLabel}</span>}
          </div>

          <p className="text-base md:text-lg text-ink-muted leading-relaxed max-w-2xl mt-4">
            {maddah.description}
          </p>
        </div>
      </section>

      {/* Coming soon banner if no content */}
      {!hasContent && (
        <section className="container-x mb-8">
          <div className="card-glass p-5 border border-emerald-600/22 bg-emerald-600/5 text-center">
            <div className="text-emerald-300 font-medium mb-1">Konten lengkap segera hadir</div>
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
          {kitabUtama.length > 0 && (
            <section className="container-x mb-8">
              <h2 className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 inline-flex items-center gap-2">
                <span className="w-6 h-px bg-gold-500/70"/>Kitab Utama
              </h2>
              <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 mobile-scroll pb-1 md:pb-0">
                {kitabUtama.map((k, i) => (
                  <div key={i} className="card-glass p-4 w-44 md:w-auto flex-shrink-0 md:flex-shrink">
                    <div className="arabic-display text-gold-300 text-lg mb-1" style={{direction:"rtl"}}>{k.arabic}</div>
                    <div className="font-display text-sm font-semibold text-ink">{k.nama}</div>
                    <div className="text-[11px] text-ink-soft mt-1">{k.penulis}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* AI Recommendation */}
          {recommendedAI.length > 0 && (
            <section className="container-x mb-8">
              <h2 className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 inline-flex items-center gap-2">
                <span className="w-6 h-px bg-gold-500/70"/>AI yang Direkomendasikan
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {recommendedAI.map((ai, i) => {
                  const tool = AI_TOOLS.find(t => t.id === ai.tool);
                  return (
                    <div key={i} className="card-glass-strong p-5">
                      <div className="flex items-center gap-3 mb-3">
                        {tool && <ToolIcon tool={tool} size="w-11 h-11"/>}
                        <div className="flex-1 min-w-0">
                          <div className="font-display text-lg font-semibold text-ink">{tool?.name || ai.tool}</div>
                          <div className="text-xs text-ink-soft">{ai.strength}</div>
                        </div>
                        {ai.rank === 1 && <span className="badge-purple text-[10px] flex-shrink-0">TOP PICK</span>}
                      </div>
                      <p className="text-sm text-ink-muted leading-relaxed">{ai.why}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Tutorial */}
          {tutorial.steps.length > 0 && (
            <section className="container-x mb-10">
              <h2 className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 inline-flex items-center gap-2">
                <span className="w-6 h-px bg-gold-500/70"/>Tutorial Pakai AI
              </h2>
              {tutorial.overview && (
                <p className="text-sm text-ink-muted mb-4">{tutorial.overview}</p>
              )}
              <div className="space-y-3">
                {tutorial.steps.map((s, i) => (
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

          {/* Starter Pack */}
          <section className="container-x mb-8">
            <div className="card-glass-strong p-6 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gold-500/10 blur-3xl pointer-events-none"/>
              <div className="relative flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] uppercase tracking-wider text-gold-400 mb-1 font-medium">Mulai di sini</div>
                  <h2 className="font-display text-xl font-semibold text-ink">Starter Pack: Kenalkan dirimu ke AI</h2>
                  <p className="text-sm text-ink-muted mt-1 max-w-lg leading-relaxed">
                    Salin ini ke AI di awal sesi. Setelah AI kenal profilmu, semua jawaban jadi lebih pas dengan tingkat dan gayamu.
                  </p>
                </div>
                <StarterPackButton profile={profile} session={session}/>
              </div>
            </div>
          </section>

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

            <div className="sticky top-12 md:top-[72px] z-20 -mx-4 md:mx-0 mb-5 border-b border-line"
              style={{ background: "rgba(10,5,20,0.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-4 md:px-0">
                {MADDAH_PROMPT_KINDS.map(kind => {
                  const count = Array.isArray(maddah.prompts?.[kind.id])
                    ? maddah.prompts[kind.id].length : 0;
                  if (count === 0) return null;
                  return (
                    <button
                      key={kind.id}
                      onClick={() => setActiveKind(kind.id)}
                      className={`flex-shrink-0 px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors flex items-center gap-1.5 md:gap-2 rounded-xl border ${
                        activeKind === kind.id
                          ? "text-emerald-200 border-emerald-600/35"
                          : "bg-white/4 text-ink-muted border-white/8 hover:bg-white/7 hover:text-ink"
                      }`}
                      style={activeKind === kind.id ? {background:"rgba(62,207,142,0.20)",minHeight:36} : {minHeight:36}}
                    >
                      <span>{kind.label}</span>
                      <span className="text-[10px] opacity-70">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              {(Array.isArray(maddah.prompts?.[activeKind])
                ? maddah.prompts[activeKind]
                : []
              ).filter(p => p && p.template && p.title)
                .map((p, i) => (
                  <MaddahPromptCard key={i} prompt={p} maddah={maddah} profile={profile}/>
                ))}
              {(Array.isArray(maddah.prompts?.[activeKind])
                ? maddah.prompts[activeKind].length
                : 0) === 0 && (
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
window.MaddahDetailErrorBoundary = MaddahDetailErrorBoundary;
