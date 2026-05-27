/* Madad, Kurasah (Notebook) Landing Page */

const TAG_COLORS = [
  "rgba(124,77,255,0.18)", "rgba(169,112,255,0.18)", "rgba(201,168,106,0.15)",
  "rgba(80,180,200,0.15)", "rgba(160,200,100,0.12)", "rgba(220,100,150,0.15)",
];

const getTagColor = (tag) => {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) % TAG_COLORS.length;
  return TAG_COLORS[h];
};

const timeAgo = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  const s = Math.floor((now - d) / 1000);
  if (s < 60) return "baru saja";
  if (s < 3600) return `${Math.floor(s/60)} menit lalu`;
  if (s < 86400) return `${Math.floor(s/3600)} jam lalu`;
  if (s < 2592000) return `${Math.floor(s/86400)} hari lalu`;
  return d.toLocaleDateString("id-ID");
};

const SOURCE_LABELS = { muqaranah: "Muqaranah", tool: "AI Tool", module: "Learning Path", null: "Bebas" };

const NoteCard = ({ note, onClick }) => {
  const snippet = note.body ? note.body.slice(0, 160).replace(/[#*`>]/g, "").trim() : "";
  const srcLabel = note.source ? SOURCE_LABELS[note.source.type] || note.source.type : null;

  return (
    <div
      onClick={() => onClick(note)}
      className="card-glass hov-lift cursor-pointer border border-line hover:border-violet-400/30 rounded-xl p-5 flex flex-col gap-3 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {note.tags.slice(0,3).map(t => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-ink-muted"
              style={{background: getTagColor(t)}}>
              {t}
            </span>
          ))}
          {note.tags.length > 3 && <span className="text-[10px] text-ink-soft">+{note.tags.length-3}</span>}
        </div>
        {srcLabel && note.source && (
          <span className="text-[10px] text-ink-soft flex items-center gap-1 flex-shrink-0">
            <Icon name="bookmark" className="w-2.5 h-2.5"/>
            {srcLabel}
          </span>
        )}
      </div>
      <div>
        <h3 className="font-display text-base font-semibold text-ink leading-snug mb-1">{note.title}</h3>
        {snippet && (
          <p className="text-xs text-ink-soft leading-relaxed" style={{display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
            {snippet}
          </p>
        )}
      </div>
      <div className="text-[11px] text-ink-soft flex items-center gap-2 mt-auto pt-1 border-t border-white/4">
        <span>{timeAgo(note.updatedAt)}</span>
        {note.tags.length > 0 && <><span className="opacity-40">·</span><span>{note.tags.length} tag</span></>}
      </div>
    </div>
  );
};

const KurasahPage = () => {
  const { session, profile } = useAuth();
  const [notes, setNotes] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [sourceFilter, setSourceFilter] = React.useState("all");
  const [tagFilter, setTagFilter] = React.useState("all");
  const [importing, setImporting] = React.useState(false);
  const fileRef = React.useRef(null);
  const toast = useToast();

  React.useEffect(() => {
    if (!session) navigate("/");
    else if (!profile?.onboarded) navigate("/onboarding");
  }, [session, profile]);

  React.useEffect(() => {
    const refresh = () => setNotes(loadNotes());
    refresh();
    window.addEventListener("madad:refresh", refresh);
    return () => window.removeEventListener("madad:refresh", refresh);
  }, []);

  if (!session || !profile?.onboarded) return null;

  const allTags = [...new Set(notes.flatMap(n => n.tags))].sort();

  const filtered = notes.filter(n => {
    const q = search.toLowerCase();
    const matchSearch = !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q) || n.tags.some(t => t.toLowerCase().includes(q));
    const matchSrc = sourceFilter === "all" || (sourceFilter === "free" ? !n.source?.type : n.source?.type === sourceFilter);
    const matchTag = tagFilter === "all" || n.tags.includes(tagFilter);
    return matchSearch && matchSrc && matchTag;
  });

  const lastUpdate = notes.length > 0 ? notes[0].updatedAt : null;

  const handleExport = () => {
    if (notes.length === 0) { toast.push("Belum ada catatan untuk di-export."); return; }
    const md = notes.map(n =>
      `---\ntitle: ${n.title}\ntags: [${n.tags.join(", ")}]\nsource: ${n.source ? JSON.stringify(n.source) : "null"}\ncreatedAt: ${n.createdAt}\n---\n\n${n.body}\n`
    ).join("\n---\n\n");
    const blob = new Blob([md], {type:"text/markdown"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kurasah-madad-${new Date().toISOString().slice(0,10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.push("Kurasah di-export sebagai file .md");
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const sections = text.split(/^---$/m).filter(s => s.trim());
      const parsed = [];
      for (let i = 0; i < sections.length; i += 2) {
        const fm = sections[i] || "";
        const body = sections[i+1] || "";
        const titleMatch = fm.match(/^title:\s*(.+)$/m);
        const tagsMatch = fm.match(/^tags:\s*\[(.+)\]$/m);
        if (!titleMatch) continue;
        parsed.push({
          id: "note_import_" + Date.now() + "_" + i,
          title: titleMatch[1].trim(),
          body: body.trim(),
          tags: tagsMatch ? tagsMatch[1].split(",").map(t => t.trim()).filter(Boolean) : [],
          source: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      if (parsed.length === 0) { toast.push("Tidak ada catatan valid ditemukan."); return; }
      const existing = loadNotes();
      const existingIds = new Set(existing.map(n => n.id));
      const toAdd = parsed.filter(n => !existingIds.has(n.id));
      saveNotes([...toAdd, ...existing]);
      setNotes(loadNotes());
      toast.push(`${toAdd.length} catatan berhasil diimpor.`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const srcFilters = [
    { id:"all", label:"Semua" },
    { id:"muqaranah", label:"Dari Muqaranah" },
    { id:"tool", label:"Dari AI Tool" },
    { id:"module", label:"Dari Learning Path" },
    { id:"free", label:"Bebas" },
  ];

  return (
    <div className="page-enter">
      {/* Header */}
      <section className="section pb-6">
        <div className="container-x">
          <Reveal>
            <PageHeader
              kicker="Kurasah"
              arabic="كُرَّاسَتِي"
              title="Catatan, talkhish, dan ta'liq dari perjalanan belajarmu."
              subtitle={lastUpdate
                ? `${notes.length} catatan · update terakhir ${timeAgo(lastUpdate)}`
                : notes.length > 0 ? `${notes.length} catatan` : "Belum ada catatan."}
              right={
                <div className="flex items-center gap-2">
                  <button onClick={handleExport} className="btn btn-ghost text-sm py-2 px-3">
                    <Icon name="download" className="w-4 h-4"/> Export
                  </button>
                  <button onClick={() => fileRef.current?.click()} className="btn btn-ghost text-sm py-2 px-3">
                    <Icon name="upload" className="w-4 h-4"/> Import
                  </button>
                  <button onClick={() => navigate("/kurasah/new")} className="btn btn-primary text-sm py-2 px-4">
                    <Icon name="pen" className="w-4 h-4"/> Tulis Baru
                  </button>
                </div>
              }
            />
            <input ref={fileRef} type="file" accept=".md,.json" className="hidden" onChange={handleImportFile}/>
          </Reveal>
        </div>
      </section>

      {/* Filters */}
      <section className="pb-4">
        <div className="container-x">
          <Reveal className="mb-4">
            <div className="relative">
              <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft pointer-events-none"/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari catatan, tag..."
                className="w-full pl-11 pr-4 py-3 bg-white/4 border border-line rounded-xl text-sm text-ink placeholder-ink-soft outline-none focus:border-violet-400/40 transition-all"/>
            </div>
          </Reveal>
          <Reveal className="flex items-center gap-2 flex-wrap mb-2">
            {srcFilters.map(f => (
              <button key={f.id} onClick={() => setSourceFilter(f.id)}
                className={`chip text-xs transition-all ${sourceFilter === f.id ? "chip-violet" : "chip-glass hover:bg-white/6"}`}>
                {f.label}
              </button>
            ))}
            {allTags.length > 0 && <div className="w-px h-4 bg-line"/>}
            {allTags.slice(0,8).map(t => (
              <button key={t} onClick={() => setTagFilter(tagFilter === t ? "all" : t)}
                className={`chip text-xs transition-all ${tagFilter === t ? "chip-violet" : "chip-glass hover:bg-white/6"}`}
                style={tagFilter !== t ? {background: getTagColor(t)} : {}}>
                {t}
              </button>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Notes grid */}
      <section className="pb-16">
        <div className="container-x">
          {notes.length === 0 ? (
            <Reveal className="py-20 text-center">
              <div className="arabic-display-classical text-gold-300 text-4xl leading-loose mb-3" style={{direction:"rtl"}}>قَيِّدُوا الْعِلْمَ بِالْكِتَابَةِ</div>
              <p className="text-xs text-gold-400/70 mb-1">Atsar</p>
              <p className="text-ink-muted mt-3 mb-2 text-sm">Ikatlah ilmu dengan tulisan.</p>
              <p className="text-ink-soft text-xs mb-8">Kurasahmu masih kosong. Mulai menulis, satu catatan kecil sudah cukup.</p>
              <button onClick={() => navigate("/kurasah/new")} className="btn btn-primary">
                <Icon name="pen" className="w-4 h-4"/> Mulai Kurasahmu
              </button>
            </Reveal>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-ink-muted text-sm">Tidak ada catatan yang cocok.</div>
          ) : (
            <Reveal stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(n => (
                <NoteCard key={n.id} note={n} onClick={n => navigate("/kurasah?id=" + n.id)}/>
              ))}
            </Reveal>
          )}
        </div>
      </section>

      <QuickNoteButton/>
    </div>
  );
};

window.KurasahPage = KurasahPage;
