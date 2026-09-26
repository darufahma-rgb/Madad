import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
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

/* ---- Panduan ringkas di atas prompt ----
   Kitab utama, AI rekomendasi, tutorial, dan Starter Pack dilipat jadi satu baris tombol kecil supaya
   template prompt langsung terlihat saat halaman dibuka. Detail tiap bagian terbuka saat tombolnya diketuk.
   Dipakai halaman maddah kuliah dan Ma'had. */
const MaddahGuide = ({ kitabUtama = [], recommendedAI = [], tutorial = null, onStarterPack }) => {
  const [open, setOpen] = useState(null);
  const steps = Array.isArray(tutorial?.steps) ? tutorial.steps : [];
  const ais = [...recommendedAI].sort((a, b) => (a.rank || 9) - (b.rank || 9));
  const topTool = ais[0] && typeof AI_TOOLS !== "undefined" ? AI_TOOLS.find(t => t.id === ais[0].tool) : null;
  const toggle = (id) => setOpen(o => (o === id ? null : id));
  const pill = (id) => `flex-shrink-0 inline-flex items-center gap-1.5 text-xs px-3 rounded-full border transition-colors ${
    open === id ? "bg-gold-500/12 border-gold-500/35 text-gold-200" : "bg-white/4 border-white/10 text-ink-muted hover:text-ink hover:bg-white/7"}`;
  const chevron = (id) => <Icon name={open === id ? "chevronUp" : "chevronDown"} className="w-3 h-3 opacity-60"/>;
  if (!kitabUtama.length && !ais.length && !steps.length && !onStarterPack) return null;

  return (
    <section className="container-x mb-6 md:mb-7">
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
        {kitabUtama.length > 0 && (
          <button onClick={() => toggle("kitab")} className={pill("kitab")} style={{ minHeight: 34 }} aria-expanded={open === "kitab"}>
            <Icon name="bookOpen" className="w-3.5 h-3.5"/> Kitab utama · {kitabUtama.length} {chevron("kitab")}
          </button>
        )}
        {ais.length > 0 && (
          <button onClick={() => toggle("ai")} className={pill("ai")} style={{ minHeight: 34 }} aria-expanded={open === "ai"}>
            {topTool ? <ToolIcon tool={topTool} size="w-4 h-4" rounded="rounded"/> : <Icon name="sparkles" className="w-3.5 h-3.5"/>}
            AI terbaik: {topTool?.name || ais[0].tool}{ais.length > 1 ? ` +${ais.length - 1}` : ""} {chevron("ai")}
          </button>
        )}
        {steps.length > 0 && (
          <button onClick={() => toggle("tutorial")} className={pill("tutorial")} style={{ minHeight: 34 }} aria-expanded={open === "tutorial"}>
            <Icon name="compass" className="w-3.5 h-3.5"/> Cara pakai · {steps.length} langkah {chevron("tutorial")}
          </button>
        )}
        {onStarterPack && (
          <button onClick={onStarterPack} className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs px-3 rounded-full border border-emerald-600/35 bg-emerald-600/10 text-emerald-200 hover:bg-emerald-600/20"
            style={{ minHeight: 34 }} title="Salin ke AI di awal sesi supaya jawabannya pas dengan tingkat & gaya belajarmu">
            <Icon name="copy" className="w-3.5 h-3.5"/> Salin Starter Pack
          </button>
        )}
      </div>

      {open === "kitab" && (
        <div className="card-glass mt-3 p-3 md:p-4 grid sm:grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-3">
          {kitabUtama.map((k, i) => (
            <div key={i} className="min-w-0">
              <div className="arabic-display text-gold-300 text-base leading-snug" style={{ direction: "rtl" }}>{k.arabic}</div>
              <div className="text-sm font-medium text-ink truncate">{k.nama}</div>
              <div className="text-[11px] text-ink-soft truncate">{k.penulis}</div>
            </div>
          ))}
        </div>
      )}

      {open === "ai" && (
        <div className="card-glass mt-3 p-3 md:p-4 space-y-3">
          {ais.map((ai, i) => {
            const tool = typeof AI_TOOLS !== "undefined" ? AI_TOOLS.find(t => t.id === ai.tool) : null;
            return (
              <div key={i} className="flex gap-3 items-start">
                {tool && <ToolIcon tool={tool} size="w-8 h-8"/>}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-ink">{tool?.name || ai.tool}</span>
                    {ai.rank === 1 && <span className="badge-purple text-[10px]">TOP PICK</span>}
                    {ai.strength && <span className="text-[11px] text-ink-soft">{ai.strength}</span>}
                  </div>
                  {ai.why && <p className="text-xs text-ink-muted leading-relaxed mt-0.5">{ai.why}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {open === "tutorial" && (
        <div className="card-glass mt-3 p-3 md:p-4">
          {tutorial?.overview && <p className="text-xs text-ink-muted mb-2.5">{tutorial.overview}</p>}
          <ol className="space-y-2">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="font-display text-sm text-gold-400 w-5 flex-shrink-0 tabular-nums">{i + 1}.</span>
                <span className="text-sm leading-relaxed min-w-0">
                  <span className="text-ink font-medium">{s.title}</span>
                  {s.body && <span className="text-ink-muted"> — {s.body}</span>}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
};

const MaddahPromptCard = ({ prompt, maddah, profile, formatEnabled }) => {
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

  const getTextToCopy = () => typeof withFormatInstruction !== "undefined"
    ? withFormatInstruction(resolvedPrompt, formatEnabled)
    : resolvedPrompt;

  const handleCopy = () => {
    navigator.clipboard.writeText(getTextToCopy());
    toast.push("Prompt tersalin. Paste ke " + (tool?.name || "AI") + ".");
    setCopied(true);
    if (typeof trackPromptCopied !== "undefined") trackPromptCopied(maddah.id);
  };

  const handleCopyAndOpen = () => {
    navigator.clipboard.writeText(getTextToCopy());
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
          <RunInTalqeehButton getText={getTextToCopy} title={`${maddah.name} — ${safePrompt.title}`} source="Maddah S1"
            label="Jalankan di sini" className="btn btn-ghost text-xs px-3 py-2.5 justify-center w-full sm:w-auto"/>
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
  const [formatEnabled, setFormatEnabled] = useState(() => typeof getFormatPref !== "undefined" ? getFormatPref() : true);

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

  if (isMaddahLocked(maddah.id, session, profile)) {
    return <FreeMaddahGate maddah={maddah} backPath="/maddah" backLabel="Daftar Maddah"/>;
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

      {/* Header ringkas — supaya template prompt langsung terlihat */}
      <section className="relative pt-3 md:pt-7 pb-4 md:pb-5 overflow-hidden">
        <GlowBlob color="rgba(62,207,142,0.18)" size={500} top={-150} right={-100}/>
        <div className="container-x relative">
          <button onClick={() => navigate("/maddah")}
            className="text-sm text-ink-soft hover:text-ink inline-flex items-center gap-2 mb-3">
            ← Daftar Maddah
          </button>

          <div className="flex items-end justify-between flex-wrap gap-x-4 gap-y-1">
            <div className="flex items-baseline gap-x-3 gap-y-1 flex-wrap min-w-0">
              <h1 className="font-display text-2xl md:text-3xl font-semibold text-ink">{maddah.name}</h1>
              <span className="arabic-display text-gold-300 text-2xl md:text-3xl" style={{direction:"rtl"}}>{maddah.nameArabic}</span>
            </div>
            {catLabel && <span className="badge-neutral flex-shrink-0">{catLabel}</span>}
          </div>

          {maddah.description && (
            <p className="text-sm md:text-base text-ink-muted leading-relaxed max-w-3xl mt-2 line-clamp-2">
              {maddah.description}
            </p>
          )}
        </div>
      </section>

      {/* Coming soon banner if no content */}
      {!hasContent && (
        <section className="container-x mb-4">
          <div className="card-glass p-5 border border-emerald-600/22 bg-emerald-600/5 text-center">
            <div className="text-emerald-300 font-medium mb-1">Konten lengkap segera hadir</div>
            <div className="text-sm text-ink-muted">
              Maddah ini sedang disiapkan lengkap dengan tutorial dan prompt template.
              Stay tuned — akan tersedia di update berikutnya.
            </div>
          </div>
        </section>
      )}

      {hasContent && (
        <>
          <MaddahGuide kitabUtama={kitabUtama} recommendedAI={recommendedAI} tutorial={tutorial}
            onStarterPack={() => {
              navigator.clipboard.writeText(generateStarterPack(profile, session));
              toast.push("Starter Pack tersalin. Paste ke AI di awal chat.");
            }}/>

          {/* Prompts — Tab by Kind */}
          <section className="container-x pb-20">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
              <h2 className="text-xs uppercase tracking-[0.22em] text-gold-400 inline-flex items-center gap-2">
                <span className="w-6 h-px bg-gold-500/70"/>Template Prompt ({totalPrompts})
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="text-xs text-ink-soft">✦ Disesuaikan untuk {TINGKATAN_LABEL[profile?.level] || "tingkatmu"}</div>
                {typeof FormatToggle !== "undefined" && (
                  <FormatToggle enabled={formatEnabled} onChange={v => { setFormatEnabled(v); if (typeof setFormatPref !== "undefined") setFormatPref(v); }}/>
                )}
              </div>
            </div>

            <div className="sticky top-[var(--app-header-h)] z-20 -mx-4 md:mx-0 mb-5 border-b border-line"
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
                  <MaddahPromptCard key={i} prompt={p} maddah={maddah} profile={profile} formatEnabled={formatEnabled}/>
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
window.MaddahGuide = MaddahGuide;
