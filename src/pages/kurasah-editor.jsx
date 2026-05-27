/* Madad, Kurasah Editor */

const TAG_COLORS_EDITOR = [
  "rgba(124,77,255,0.18)", "rgba(169,112,255,0.18)", "rgba(201,168,106,0.15)",
  "rgba(80,180,200,0.15)", "rgba(160,200,100,0.12)", "rgba(220,100,150,0.15)",
];
const getTagColorEd = (tag) => {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) % TAG_COLORS_EDITOR.length;
  return TAG_COLORS_EDITOR[h];
};

const KurasahEditorPage = () => {
  const { session, profile } = useAuth();
  const path = useRoute();
  const toast = useToast();

  const params = new URLSearchParams(path.includes("?") ? path.split("?")[1] : "");
  const noteId = params.get("id");
  const isNew = path === "/kurasah/new" || path.startsWith("/kurasah/new");

  const [note, setNote] = React.useState(null);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [tags, setTags] = React.useState([]);
  const [tagInput, setTagInput] = React.useState("");
  const [source, setSource] = React.useState(null);
  const [saveStatus, setSaveStatus] = React.useState("saved"); // "saved" | "saving" | "unsaved"
  const [tab, setTab] = React.useState("edit"); // "edit" | "preview"
  const [showDelete, setShowDelete] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  const saveTimer = React.useRef(null);
  const bodyRef = React.useRef(null);

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  React.useEffect(() => {
    if (!session) navigate("/");
    else if (!profile?.onboarded) navigate("/onboarding");
  }, [session, profile]);

  React.useEffect(() => {
    if (isNew) {
      const now = new Date().toISOString();
      const newNote = {
        id: "note_" + Date.now(),
        title: "", body: "", tags: [], source: null,
        createdAt: now, updatedAt: now,
      };
      setNote(newNote);
      setTitle(""); setBody(""); setTags([]); setSource(null);
    } else if (noteId) {
      const found = loadNotes().find(n => n.id === noteId);
      if (found) {
        setNote(found);
        setTitle(found.title || "");
        setBody(found.body || "");
        setTags(found.tags || []);
        setSource(found.source || null);
      }
    }
  }, [noteId, isNew]);

  const persistSave = React.useCallback((t, b, tg, src, n) => {
    if (!n) return;
    setSaveStatus("saving");
    const updated = { ...n, title: t, body: b, tags: tg, source: src, updatedAt: new Date().toISOString() };
    const allNotes = loadNotes();
    const exists = allNotes.find(x => x.id === n.id);
    const newList = exists
      ? allNotes.map(x => x.id === n.id ? updated : x)
      : [updated, ...allNotes];
    saveNotes(newList);
    markPresenceToday();
    setNote(updated);
    setSaveStatus("saved");
  }, []);

  const scheduleAutoSave = React.useCallback((t, b, tg, src, n) => {
    setSaveStatus("unsaved");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persistSave(t, b, tg, src, n), 800);
  }, [persistSave]);

  const handleTitleChange = (v) => { setTitle(v); scheduleAutoSave(v, body, tags, source, note); };
  const handleBodyChange = (v) => { setBody(v); scheduleAutoSave(title, v, tags, source, note); };

  const addTag = (t) => {
    const clean = t.trim().toLowerCase();
    if (!clean || tags.includes(clean)) return;
    const newTags = [...tags, clean];
    setTags(newTags);
    scheduleAutoSave(title, body, newTags, source, note);
    setTagInput("");
  };
  const removeTag = (t) => {
    const newTags = tags.filter(x => x !== t);
    setTags(newTags);
    scheduleAutoSave(title, body, newTags, source, note);
  };

  const insertBismillah = () => {
    const ins = "\n:bismillah:\n";
    handleBodyChange(body + ins);
  };

  const wrapSelection = (before, after = before) => {
    const ta = bodyRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = body.slice(start, end) || "teks";
    const newBody = body.slice(0, start) + before + sel + after + body.slice(end);
    handleBodyChange(newBody);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + sel.length);
    }, 10);
  };

  const handleDelete = () => {
    const allNotes = loadNotes();
    saveNotes(allNotes.filter(n => n.id !== note?.id));
    window.dispatchEvent(new Event("madad:refresh"));
    navigate("/kurasah");
    toast.push("Catatan dihapus.");
  };

  const statusText = { saved: "Tersimpan otomatis", saving: "Menyimpan...", unsaved: "Ada perubahan..." }[saveStatus];

  const allExistingTags = [...new Set(loadNotes().flatMap(n => n.tags))].filter(t => !tags.includes(t));
  const tagSuggestions = tagInput ? allExistingTags.filter(t => t.startsWith(tagInput.toLowerCase())).slice(0,5) : [];

  const sourceOptions = [
    { type:null, label:"Bebas (tidak ditautkan)" },
    { type:"muqaranah", label:"Dari Muqaranah" },
    { type:"tool", label:"Dari AI Tool" },
    { type:"module", label:"Dari Learning Path" },
  ];

  if (!session || !profile?.onboarded) return null;
  if (!note && !isNew) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-ink-muted mb-4">Catatan tidak ditemukan.</p>
        <button onClick={() => navigate("/kurasah")} className="btn btn-ghost">Kembali ke Kurasah</button>
      </div>
    </div>
  );

  const previewHtml = renderMarkdown(body);

  const EditorPane = () => (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-line bg-white/2 flex-wrap">
        {[
          { label:"B", action:() => wrapSelection("**"), title:"Bold" },
          { label:"I", action:() => wrapSelection("*"), title:"Italic", cls:"italic" },
          { label:"H1", action:() => handleBodyChange(body + "\n# "), title:"Heading 1" },
          { label:"H2", action:() => handleBodyChange(body + "\n## "), title:"Heading 2" },
          { label:"H3", action:() => handleBodyChange(body + "\n### "), title:"Heading 3" },
          { label:'"', action:() => handleBodyChange(body + "\n> "), title:"Blockquote" },
          { label:"–", action:() => handleBodyChange(body + "\n- "), title:"Bullet" },
          { label:"1.", action:() => handleBodyChange(body + "\n1. "), title:"Numbered" },
          { label:"`", action:() => wrapSelection("`"), title:"Code" },
        ].map((btn,i) => (
          <button key={i} type="button" onClick={btn.action} title={btn.title}
            className={`px-2.5 py-1 rounded text-xs text-ink-muted hover:text-ink hover:bg-white/6 transition-colors font-mono ${btn.cls||""}`}>
            {btn.label}
          </button>
        ))}
        <div className="w-px h-4 bg-line"/>
        <button type="button" onClick={insertBismillah} title="Insert Bismillah"
          className="px-2.5 py-1 rounded text-xs text-gold-400 hover:text-gold-300 hover:bg-gold-500/8 transition-colors arabic"
          style={{direction:"rtl"}}>
          ﷽
        </button>
      </div>
      {/* Body */}
      <textarea
        ref={bodyRef}
        value={body}
        onChange={e => handleBodyChange(e.target.value)}
        placeholder="Tulis catatanmu... Gunakan # untuk heading, **teks** untuk bold, > untuk quote, :bismillah: untuk ornamen."
        className="flex-1 bg-transparent p-5 text-sm text-ink-muted leading-relaxed resize-none outline-none placeholder-ink-soft font-sans"
        style={{minHeight:320}}
      />
    </div>
  );

  const PreviewPane = () => (
    <div className="flex-1 overflow-y-auto p-6 card-glass rounded-xl min-h-0" style={{minHeight:320}}>
      {previewHtml
        ? <div dangerouslySetInnerHTML={{__html: previewHtml}}/>
        : <p className="text-ink-soft text-sm italic">Preview akan muncul di sini...</p>
      }
    </div>
  );

  return (
    <div className="page-enter min-h-screen flex flex-col">
      <div className="container-x flex-1 flex flex-col py-8 max-w-5xl">
        {/* Breadcrumb */}
        <div className="text-xs text-ink-soft mb-6">
          <button onClick={() => navigate("/kurasah")} className="hover:text-ink-muted">Kurasah</button>
          <span className="mx-2 opacity-40">/</span>
          <span className="text-ink-muted">{title || "Catatan baru"}</span>
        </div>

        {/* Title */}
        <input
          value={title}
          onChange={e => handleTitleChange(e.target.value)}
          placeholder="Judul catatan..."
          className="w-full bg-transparent text-ink font-display text-3xl md:text-4xl placeholder-ink-soft border-none outline-none mb-4 leading-tight"
        />

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4 relative">
          {tags.map(t => (
            <span key={t} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-white/10 text-ink-muted"
              style={{background: getTagColorEd(t)}}>
              {t}
              <button onClick={() => removeTag(t)} className="hover:text-ink transition-colors">
                <Icon name="x" className="w-2.5 h-2.5"/>
              </button>
            </span>
          ))}
          <div className="relative">
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); } }}
              placeholder="+ tag"
              className="bg-transparent text-xs text-ink-muted placeholder-ink-soft outline-none w-20 border-b border-dashed border-line focus:border-violet-400/40"
            />
            {tagSuggestions.length > 0 && (
              <div className="absolute top-full left-0 mt-1 z-10 card-glass-strong rounded-lg shadow-lg min-w-max">
                {tagSuggestions.map(s => (
                  <button key={s} onClick={() => addTag(s)}
                    className="block w-full text-left px-3 py-1.5 text-xs text-ink-muted hover:text-ink hover:bg-white/5 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Source linker */}
        <div className="mb-5">
          <select
            value={source?.type || ""}
            onChange={e => {
              const t = e.target.value || null;
              const s = t ? { type:t, id:"", label:"" } : null;
              setSource(s);
              scheduleAutoSave(title, body, tags, s, note);
            }}
            className="bg-white/4 border border-line rounded-lg px-3 py-1.5 text-xs text-ink-muted outline-none focus:border-violet-400/30 transition-colors appearance-none">
            {sourceOptions.map(o => (
              <option key={o.type || ""} value={o.type || ""}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Mobile tab toggle */}
        {isMobile && (
          <div className="flex rounded-lg overflow-hidden border border-line mb-4 self-start">
            {["edit","preview"].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 text-xs transition-colors ${tab === t ? "bg-violet-500/20 text-violet-200" : "text-ink-muted hover:text-ink"}`}>
                {t === "edit" ? "Edit" : "Preview"}
              </button>
            ))}
          </div>
        )}

        {/* Editor / Preview */}
        {isMobile ? (
          <div className="flex-1 card-glass rounded-xl overflow-hidden border border-line">
            {tab === "edit" ? <EditorPane/> : <div className="p-5"><PreviewPane/></div>}
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-2 gap-5">
            <div className="flex flex-col card-glass rounded-xl overflow-hidden border border-line">
              <EditorPane/>
            </div>
            <PreviewPane/>
          </div>
        )}

        {/* Footer bar */}
        <div className="flex items-center justify-between mt-4 py-3 border-t border-line">
          <div className="text-[11px] text-ink-soft flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${saveStatus === "saved" ? "bg-mint-500" : saveStatus === "saving" ? "bg-gold-400" : "bg-violet-400"}`}/>
            {statusText}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDelete(true)}
              className="btn btn-ghost text-sm py-1.5 px-3 text-ink-soft hover:text-red-400">
              <Icon name="x" className="w-3.5 h-3.5"/> Hapus
            </button>
            <button
              onClick={() => { clearTimeout(saveTimer.current); persistSave(title, body, tags, source, note); navigate("/kurasah"); }}
              className="btn btn-primary text-sm py-1.5 px-5">
              Selesai
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      {showDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-night-950/70 backdrop-blur-sm" onClick={() => setShowDelete(false)}/>
          <div className="relative card-glass-strong rounded-2xl p-7 max-w-sm w-full text-center page-enter">
            <div className="text-3xl mb-4">⚠</div>
            <h3 className="font-display text-xl font-semibold text-ink mb-2">Hapus catatan ini?</h3>
            <p className="text-sm text-ink-muted mb-6 leading-relaxed">Catatan akan dihapus permanen dari Kurasahmu. Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="btn btn-ghost flex-1 py-2.5">Batal</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500/80 hover:bg-red-500 transition-colors">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

window.KurasahEditorPage = KurasahEditorPage;
