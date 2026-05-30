/* Talqeeh — Halaman Detail Maddah Ma'had
   URL: /#/mahad-maddah/[id]
*/

/* ── PromptCard — komponen terpisah agar useState tidak dipanggil di dalam .map() ── */
const MahadPromptCard = ({ p, maddah, resolvePrompt }) => {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [showFull, setShowFull] = useState(false);

  if (!p || !p.template) return null;

  const tool = typeof AI_TOOLS !== "undefined"
    ? AI_TOOLS.find(t => t.id === p.targetAI) : null;
  const resolved = resolvePrompt(p.template);

  return (
    <div className="card-glass-strong p-4 md:p-5">
      {/* Card header */}
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          {tool && <ToolIcon tool={tool} size="w-9 h-9"/>}
          <div className="min-w-0">
            <div className="font-display text-sm font-semibold text-ink leading-snug">
              {p.title}
            </div>
            <div className="text-[11px] text-ink-soft mt-0.5">
              Untuk: {tool?.name || p.targetAI}
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0 flex-wrap">
          <button
            onClick={() => {
              navigator.clipboard.writeText(resolved);
              toast.push("Prompt tersalin. Paste ke " + (tool?.name || "AI") + ".");
              setCopied(true);
            }}
            className="btn btn-ghost text-xs px-3 py-2.5 flex items-center justify-center gap-1.5"
            style={{minHeight:40}}>
            <Icon name="copy" className="w-3.5 h-3.5"/>
            {copied ? "Tersalin ✓" : "Salin"}
          </button>
          {tool?.link && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(resolved);
                toast.push("Tersalin. Membuka " + tool.name + "...");
                setCopied(true);
                setTimeout(() => window.open(tool.link, "_blank"), 400);
              }}
              className="btn btn-primary text-xs px-3 py-2.5 flex items-center justify-center gap-1.5"
              style={{minHeight:40}}>
              Buka {tool.name}
              <Icon name="external" className="w-3 h-3"/>
            </button>
          )}
        </div>
      </div>

      {/* Prompt preview */}
      <div className="p-3 rounded-xl mb-3"
        style={{background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)"}}>
        <p className={`text-xs text-ink-muted leading-relaxed whitespace-pre-wrap font-mono ${
          showFull ? "" : "line-clamp-4"
        }`}>
          {resolved}
        </p>
        <button onClick={() => setShowFull(!showFull)}
          className="text-[11px] text-violet-300 hover:text-violet-200 mt-2 block">
          {showFull ? "Sembunyikan ↑" : "Lihat lengkap ↓"}
        </button>
      </div>

      {/* Loop closer — simpan ke Kurasah */}
      {copied && (
        <div className="flex items-center justify-between gap-2 p-3 rounded-xl"
          style={{background:"rgba(201,168,106,0.07)", border:"1px solid rgba(201,168,106,0.18)"}}>
          <p className="text-xs text-ink-muted">
            <span className="text-gold-300 font-medium">Dapat jawaban bagus?</span>
            {" "}Simpan ke Kurasah!
          </p>
          <button
            onClick={() => {
              if (typeof loadNotes === "undefined") return;
              const newNote = {
                id: "note_" + Date.now(),
                title: maddah.name + " — " + p.title,
                body: "## Maddah\n" + maddah.name + "\n\n## Prompt\n" + p.title + "\n\n## Jawaban AI\n\n*Paste di sini...*\n\n## Catatanku\n\n",
                tags: [maddah.category, "mahad"],
                source: { type: "mahad", id: maddah.id, label: maddah.name },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              saveNotes([newNote, ...loadNotes()]);
              navigate("/kurasah?id=" + newNote.id);
              toast.push("Catatan dibuat!");
            }}
            className="btn btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5
                       flex-shrink-0 border border-gold-500/30 text-gold-300 hover:bg-gold-500/10"
            style={{minHeight:36}}>
            <Icon name="notebook" className="w-3 h-3"/>
            Simpan
          </button>
        </div>
      )}
    </div>
  );
};

const MahadDetailPage = () => {
  const { session, profile } = useAuth();
  const toast = useToast();

  const path     = window.location.hash.slice(1);
  const idMatch  = path.match(/^\/mahad-maddah\/([^?\/]+)/);
  const maddahId = idMatch ? idMatch[1] : null;
  const maddah   = maddahId && typeof getMahadMaddahById !== "undefined"
    ? getMahadMaddahById(maddahId) : null;

  const [activeKind, setActiveKind] = useState("pahami");

  if (!session) { navigate("/"); return null; }

  if (!maddah) {
    return (
      <div className="page-enter min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <div className="text-ink-muted text-center">Maddah tidak ditemukan.</div>
        <button onClick={() => navigate("/mahad-maddah")}
          className="btn btn-ghost text-sm px-4 py-2">
          ← Kembali ke Maddah Ma'had
        </button>
      </div>
    );
  }

  const resolvePrompt = (template) => {
    if (!template || !profile) return template || "";
    const tingkat = typeof TINGKATAN_LABEL !== "undefined"
      ? (TINGKATAN_LABEL[profile.level] || profile.level) : (profile.level || "");
    return template
      .replace(/\[TINGKATAN\]/g, tingkat)
      .replace(/\[MADDAH\]/g, maddah.name);
  };

  const MAHAD_KINDS = [
    { id: "pahami",  label: "Pahami",     icon: "lightbulb" },
    { id: "hafal",   label: "Hafalan",    icon: "refresh"   },
    { id: "latihan", label: "Latihan",    icon: "target"    },
    { id: "ujian",   label: "Siap Ujian", icon: "list"      },
  ];

  const activePrompts = Array.isArray(maddah.prompts?.[activeKind])
    ? maddah.prompts[activeKind].filter(p => p && p.template) : [];

  const totalPrompts = Object.values(maddah.prompts || {}).reduce(
    (s, arr) => s + (Array.isArray(arr) ? arr.length : 0), 0
  );

  const levelLabel = typeof TINGKATAN_LABEL !== "undefined"
    ? (TINGKATAN_LABEL[profile?.level] || profile?.level) : profile?.level;

  return (
    <div className="page-enter mobile-page-wrap">

      {/* Header */}
      <section className="relative pt-4 md:pt-10 pb-6 md:pb-8 overflow-hidden">
        <Blob color="rgba(62,207,142,0.18)" size={500} top={-150} right={-100}/>
        <div className="container-x relative">
          <button onClick={() => navigate("/mahad-maddah")}
            className="text-sm text-ink-soft hover:text-ink inline-flex items-center gap-2 mb-5"
            style={{minHeight:40}}>
            <Icon name="arrowLeft" className="w-4 h-4"/> Maddah Ma'had
          </button>

          <div className="flex items-start justify-between flex-wrap gap-4 mb-3">
            <div>
              <div className="arabic-display text-gold-300 text-4xl md:text-5xl mb-2"
                style={{direction:"rtl"}}>
                {maddah.nameArabic}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink">
                {maddah.name}
              </h1>
            </div>
            <span className={`text-[11px] px-3 py-1 rounded-full border flex-shrink-0 mt-1 ${
              maddah.category === "agama"
                ? "bg-gold-500/10 text-gold-300 border-gold-500/20"
                : "bg-violet-500/10 text-violet-300 border-violet-500/20"
            }`}>
              {maddah.category === "agama" ? "Maddah Agama" : "Maddah Umum"}
            </span>
          </div>

          <p className="text-base md:text-lg text-ink-muted leading-relaxed max-w-2xl mt-4">
            {maddah.description}
          </p>
        </div>
      </section>

      {/* Topik Utama */}
      {maddah.topikUtama?.length > 0 && (
        <section className="container-x mb-8">
          <h2 className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-3 inline-flex items-center gap-2">
            <span className="w-6 h-px bg-gold-500/70"/>Topik yang Tersedia
          </h2>
          {/* Mobile: geser horizontal. Desktop: wrap biasa */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
            {maddah.topikUtama.map((t, i) => (
              <span key={i}
                className="flex-shrink-0 text-[11px] px-3 py-1.5 rounded-lg bg-white/5 border border-line text-ink-muted whitespace-nowrap"
                style={{minHeight: 32}}>
                {t}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-ink-soft mt-1.5 md:hidden">
            ← Geser untuk lihat semua topik
          </p>
          <p className="text-[11px] text-ink-soft mt-1 hidden md:block">
            Ketik salah satu topik ini saat menggunakan prompt di bawah
          </p>
        </section>
      )}

      {/* Rekomendasi AI */}
      {maddah.recommendedAI?.length > 0 && (
        <section className="container-x mb-8">
          <h2 className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 inline-flex items-center gap-2">
            <span className="w-6 h-px bg-gold-500/70"/>AI yang Direkomendasikan
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {maddah.recommendedAI.map((ai, i) => {
              const tool = typeof AI_TOOLS !== "undefined"
                ? AI_TOOLS.find(t => t.id === ai.tool) : null;
              return (
                <div key={i} className="card-glass-strong p-5">
                  <div className="flex items-center gap-3 mb-3">
                    {tool && <ToolIcon tool={tool} size="w-11 h-11"/>}
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-base font-semibold text-ink">
                        {tool?.name || ai.tool}
                      </div>
                      <div className="text-xs text-ink-soft">{ai.strength}</div>
                    </div>
                    {ai.rank === 1 && (
                      <span className="badge-purple text-[10px] flex-shrink-0">TOP PICK</span>
                    )}
                  </div>
                  <p className="text-sm text-ink-muted leading-relaxed">{ai.why}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Starter Pack */}
      <section className="container-x mb-8">
        <div className="card-glass p-4 border border-emerald-600/20"
          style={{background:"rgba(62,207,142,0.04)"}}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{background:"rgba(62,207,142,0.15)"}}>
                <Icon name="sparkles" className="w-4 h-4 text-emerald-400"/>
              </div>
              <div className="min-w-0">
                <div className="text-xs text-emerald-400 uppercase tracking-wider mb-0.5">
                  Mulai di sini
                </div>
                <div className="font-display text-sm font-semibold text-ink">
                  Starter Pack: Kenalkan dirimu ke AI
                </div>
                <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
                  Salin ini ke AI di awal sesi supaya semua prompt relevan untuk tingkat Ma'had-mu.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const pack = typeof generateStarterPack !== "undefined"
                  ? generateStarterPack(profile, session) : "";
                navigator.clipboard.writeText(pack);
                toast.push("Starter Pack tersalin!");
              }}
              className="btn btn-primary text-sm px-4 py-2.5 flex items-center gap-2 flex-shrink-0"
              style={{minHeight:40}}>
              <Icon name="copy" className="w-3.5 h-3.5"/> Salin Starter Pack
            </button>
          </div>
        </div>
      </section>

      {/* Prompts Section */}
      <section className="container-x mb-10">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <h2 className="text-xs uppercase tracking-[0.22em] text-gold-400 inline-flex items-center gap-2">
            <span className="w-6 h-px bg-gold-500/70"/>Template Prompt ({totalPrompts})
          </h2>
          <span className="text-[11px] text-ink-soft">
            ✦ Disesuaikan untuk {levelLabel}
          </span>
        </div>

        {/* Kind tabs */}
        <div className="sticky top-12 md:top-[72px] z-20 -mx-4 md:mx-0 mb-5"
          style={{background:"rgba(10,5,20,0.92)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
          <div className="flex gap-2 px-4 md:px-0 py-3 overflow-x-auto no-scrollbar">
            {MAHAD_KINDS.map(kind => {
              const count = Array.isArray(maddah.prompts?.[kind.id])
                ? maddah.prompts[kind.id].length : 0;
              if (count === 0) return null;
              return (
                <button key={kind.id}
                  onClick={() => setActiveKind(kind.id)}
                  className={`flex-shrink-0 px-3 md:px-4 py-2 text-xs md:text-sm font-medium
                    transition-colors flex items-center gap-1.5 rounded-xl border ${
                    activeKind === kind.id
                      ? "text-violet-200 border-violet-500/35 bg-violet-500/20"
                      : "bg-white/4 text-ink-muted border-white/8 hover:bg-white/7"
                  }`}
                  style={{minHeight:36}}>
                  <Icon name={kind.icon} className="w-3.5 h-3.5"/>
                  {kind.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeKind === kind.id ? "bg-violet-500/30" : "bg-white/8"
                  }`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompt cards */}
        <div className="space-y-4">
          {activePrompts.map((p, i) => (
            <MahadPromptCard key={i} p={p} maddah={maddah} resolvePrompt={resolvePrompt}/>
          ))}

          {activePrompts.length === 0 && (
            <div className="text-center py-10 text-ink-soft text-sm">
              Belum ada prompt untuk kategori ini.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

window.MahadDetailPage = MahadDetailPage;
