import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
/* Talqih, Kurasah Editor */

const TAG_COLORS_EDITOR = [
  "rgba(62,207,142,0.18)", "rgba(169,112,255,0.18)", "rgba(201,168,106,0.15)",
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

  const noteId = React.useMemo(() => {
    const params = new URLSearchParams(path.includes("?") ? path.split("?")[1] : "");
    return params.get("id");
  }, []);

  const isNew = React.useMemo(() => {
    return path === "/kurasah/new" || path.startsWith("/kurasah/new");
  }, []);

  const [note, setNote] = React.useState(null);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [tags, setTags] = React.useState([]);
  const [tagInput, setTagInput] = React.useState("");
  const [source, setSource] = React.useState(null);
  const [saveStatus,  setSaveStatus]  = React.useState("saved"); // "saved" | "saving" | "unsaved"
  const [syncStatus,  setSyncStatus]  = React.useState("idle");  // "idle" | "syncing" | "synced" | "offline"
  const [tab, setTab] = React.useState("edit"); // "edit" | "preview"
  const [showDelete, setShowDelete] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  const [showPicker, setShowPicker] = React.useState(false);
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
      // /kurasah/new?talkhis=1 → catatan baru langsung dalam Mode Talkhisan.
      const talkhisNew = path.includes("talkhis=1");
      const newNote = {
        id: "note_" + Date.now(),
        title: "", body: "", tags: talkhisNew ? ["talkhis"] : [], source: null,
        createdAt: now, updatedAt: now,
      };
      setNote(newNote);
      setTitle(""); setBody(""); setTags(newNote.tags); setSource(null);
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
    saveNotes(newList, updated.id);
    markPresenceToday();
    setSaveStatus("saved");
    setSyncStatus("syncing");
    sbSaveNote(updated)
      .then(() => setSyncStatus("synced"))
      .catch(() => setSyncStatus("offline"));
  }, []);

  const scheduleAutoSave = React.useCallback((t, b, tg, src, n) => {
    setSaveStatus("unsaved");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persistSave(t, b, tg, src, n), 800);
  }, [persistSave]);

  const handleTitleChange = React.useCallback((v) => {
    setTitle(v);
    scheduleAutoSave(v, body, tags, source, note);
  }, [body, tags, source, note, scheduleAutoSave]);

  const handleBodyChange = React.useCallback((v) => {
    setBody(v);
    scheduleAutoSave(title, v, tags, source, note);
  }, [title, tags, source, note, scheduleAutoSave]);

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

  /* ── Mode Talkhisan: catatan bertanda "talkhis" disusun sebagai talkhisan Arab (kanan-ke-kiri), dipratinjau dengan
     gaya talkhisan, bisa digabung dari catatan talkhis lain, dan diunduh sebagai PDF (renderer dari tab Talkhis). */
  const isTalkhis = tags.includes("talkhis");
  const toggleTalkhis = () => {
    const newTags = isTalkhis ? tags.filter(t => t !== "talkhis") : [...tags, "talkhis"];
    setTags(newTags);
    scheduleAutoSave(title, body, newTags, source, note);
  };
  // Sisipkan satu baris berawalan tertentu di posisi kursor (di baris baru), lalu pilih teks contohnya.
  const insertLine = (prefix, sample, suffix = "") => {
    const ta = bodyRef.current;
    const pos = ta ? ta.selectionStart : body.length;
    const before = body.slice(0, pos);
    const lead = before && !before.endsWith("\n") ? "\n" : "";
    const text = lead + prefix + sample + suffix + "\n";
    handleBodyChange(before + text + body.slice(pos));
    setTimeout(() => {
      if (!ta) return;
      const s = pos + lead.length + prefix.length;
      ta.focus();
      ta.setSelectionRange(s, s + sample.length);
    }, 10);
  };
  const otherTalkhis = isTalkhis ? loadNotes().filter(n => n.id !== note?.id && n.tags?.includes("talkhis") && n.body?.trim()) : [];
  // Catatan lain ditambahkan di akhir. Judul catatannya jadi judul mabhats (### ) bila isinya belum punya judul
  // sendiri — diletakkan sesudah baris bab (## ) kalau catatannya diawali bab.
  const appendNote = (n) => {
    const name = (n.title || "").replace(/^Talkhis\s*—\s*/, "").trim();
    let piece = n.body.trim();
    if (name && !/^###\s/m.test(piece)) {
      const bab = piece.match(/^##\s.*(\n+|$)/);
      piece = bab ? `${bab[0].trimEnd()}\n\n### ${name}\n\n${piece.slice(bab[0].length)}` : `### ${name}\n\n${piece}`;
    }
    handleBodyChange((body.trim() ? body.trimEnd() + "\n\n" : "") + piece + "\n");
    setShowPicker(false);
    toast.push("Ditambahkan di akhir talkhisan.");
  };
  const downloadPdf = () => {
    const r = window.printTalkhisDoc?.(title || "تلخيص", body);
    if (r === false) toast.push("Talkhisan masih kosong.");
    if (r === null) toast.push("Jendela unduhan diblokir browser. Izinkan pop-up untuk Talqeeh lalu coba lagi.");
  };
  const copyDoc = async () => {
    const ok = await window.copyTalkhisDoc?.(title || "تلخيص", body);
    toast.push(ok ? "Tersalin. Tempel di Word/Docs untuk format lengkap." : "Gagal menyalin.");
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
    if (note?.id) sbDeleteNote(note.id).catch(() => {});
    window.dispatchEvent(new Event("madad:refresh"));
    navigate("/kurasah");
    toast.push("Catatan dihapus.");
  };

  const statusText = saveStatus !== "saved"
    ? { saving: "Menyimpan...", unsaved: "Ada perubahan..." }[saveStatus]
    : syncStatus === "syncing" ? "Menyinkron..."
    : syncStatus === "synced"  ? "Tersimpan & tersinkron"
    : syncStatus === "offline" ? "Offline — tersimpan lokal"
    : "Tersimpan otomatis";

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

  const previewHtml = isTalkhis && window.talkhisHtml ? window.talkhisHtml(body) : renderMarkdown(body);

  const EditorPane = () => (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-line bg-white/2 flex-wrap">
        {isTalkhis ? [
          { label: "Bab", action: () => insertLine("## ", "باب"), title: "Bab (judul besar, di tengah)" },
          { label: "Judul", action: () => insertLine("### ", "عنوان المبحث"), title: "Judul mabhats" },
          { label: "Sub", action: () => insertLine("#### ", "التعريف"), title: "Sub-bagian (garis bawah)" },
          { label: "Nash", action: () => insertLine("> ", "نص الحديث أو الآية"), title: "Nash dalam kotak merah" },
          { label: "• Poin", action: () => insertLine("- ", "نقطة"), title: "Poin" },
          { label: "Label:", action: () => insertLine("- **", "العنوان", ":** "), title: "Poin berlabel tebal" },
          { label: "(Gharib)", action: () => insertLine("- (", "اللفظ", "): معناه"), title: "Kata gharib & maknanya" },
          { label: "١. Khilaf", action: () => insertLine("  1. ", "المذهب: القول"), title: "Pendapat bernomor (di bawah poin)" },
        ].map((btn, i) => (
          <button key={i} type="button" onClick={btn.action} title={btn.title}
            className="px-2.5 py-1 rounded text-xs text-ink-muted hover:text-ink hover:bg-white/6 transition-colors">
            {btn.label}
          </button>
        )) : [
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
          className="px-2.5 py-1 rounded text-xs text-gold-400 hover:text-gold-300 hover:bg-gold-500/8 transition-colors arabic-ui"
          style={{direction:"rtl"}}>
          ﷽
        </button>
      </div>
      {/* Body */}
      <textarea
        key="kurasah-body-editor"
        ref={bodyRef}
        value={body}
        onChange={e => handleBodyChange(e.target.value)}
        placeholder={isTalkhis
          ? "اكتب التلخيص هنا… Pakai tombol di atas: ﴿ Bab ﴾, Judul, Nash, Poin. Gabungkan talkhis lain lewat Tambah dari catatan."
          : "Tulis catatanmu... Gunakan # untuk heading, **teks** untuk bold, > untuk quote, :bismillah: untuk ornamen."}
        dir={isTalkhis ? "rtl" : undefined}
        className={`flex-1 bg-transparent p-5 text-ink-muted leading-relaxed resize-none outline-none placeholder-ink-soft ${isTalkhis ? "arabic text-[17px]" : "text-sm font-sans"}`}
        style={{minHeight:320}}
      />
    </div>
  );

  const PreviewPane = () => (
    <div className="flex-1 overflow-y-auto p-6 card-glass rounded-xl min-h-0" style={{minHeight:320}}>
      {previewHtml
        ? isTalkhis
          ? <div dir="rtl" lang="ar" className="tk-body" dangerouslySetInnerHTML={{__html: previewHtml}}/>
          : <div dangerouslySetInnerHTML={{__html: previewHtml}}/>
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
          key="kurasah-title-editor"
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
              className="bg-transparent text-xs text-ink-muted placeholder-ink-soft outline-none w-20 border-b border-dashed focus:outline-none transition-colors"
            style={{borderColor:"rgba(62,207,142,0.30)"}}
            onFocus={e => e.target.style.borderColor="rgba(62,207,142,0.55)"}
            onBlur={e => e.target.style.borderColor="rgba(62,207,142,0.30)"}
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

        {/* Mode Talkhisan */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button type="button" onClick={toggleTalkhis}
            className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${isTalkhis ? "text-emerald-200 border-emerald-600/35 bg-emerald-500/15" : "text-ink-muted border-white/10 bg-white/4 hover:bg-white/7"}`}>
            Mode Talkhisan {isTalkhis ? "aktif" : "mati"}
          </button>
          {isTalkhis && (
            <>
              <button type="button" onClick={() => setShowPicker(true)} className="text-xs px-3 py-1.5 rounded-xl border border-white/10 bg-white/4 text-ink-muted hover:text-ink">
                <Icon name="layers" className="w-3.5 h-3.5 inline -mt-0.5 me-1"/>Tambah dari catatan
              </button>
              <button type="button" onClick={copyDoc} disabled={!body.trim()} className="text-xs px-3 py-1.5 rounded-xl border border-white/10 bg-white/4 text-ink-muted hover:text-ink disabled:opacity-40">
                <Icon name="copy" className="w-3.5 h-3.5 inline -mt-0.5 me-1"/>Salin
              </button>
              <button type="button" onClick={downloadPdf} disabled={!body.trim()} className="text-xs px-3 py-1.5 rounded-xl border border-emerald-600/35 bg-emerald-500/15 text-emerald-200 disabled:opacity-40">
                <Icon name="download" className="w-3.5 h-3.5 inline -mt-0.5 me-1"/>Unduh PDF
              </button>
            </>
          )}
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
            className="bg-white/4 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-ink-muted outline-none transition-colors appearance-none"
            onFocus={e => e.target.style.borderColor="rgba(62,207,142,0.40)"}
            onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.10)"}>
            {sourceOptions.map(o => (
              <option key={o.type || ""} value={o.type || ""}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Mobile tab toggle */}
        {isMobile && (
          <div className="flex rounded-xl overflow-hidden border mb-4 self-start" style={{borderColor:"rgba(62,207,142,0.25)"}}>
            {["edit","preview"].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 text-xs font-medium transition-colors ${tab === t ? "text-emerald-200" : "text-ink-muted hover:text-ink"}`}
                style={tab === t ? {background:"rgba(62,207,142,0.22)"} : {}}>
                {t === "edit" ? "Edit" : "Preview"}
              </button>
            ))}
          </div>
        )}

        {/* Editor / Preview */}
        {isMobile ? (
          <div className="flex-1 card-glass rounded-xl overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.08)"}}>
            {tab === "edit" ? EditorPane() : <div className="p-5">{PreviewPane()}</div>}
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-2 gap-5">
            <div className="flex flex-col card-glass rounded-xl overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.08)"}}>
              {EditorPane()}
            </div>
            {PreviewPane()}
          </div>
        )}

        {/* Footer bar */}
        <div className="flex items-center justify-between mt-4 py-3 border-t border-line">
          <div className="text-[11px] text-ink-soft flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${
              saveStatus !== "saved"   ? (saveStatus === "saving" ? "bg-gold-400" : "bg-emerald-400") :
              syncStatus === "syncing" ? "bg-emerald-400 animate-pulse" :
              syncStatus === "offline" ? "bg-rose-600" :
              "bg-mint-500"
            }`}/>
            {statusText}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDelete(true)}
              className="btn btn-ghost text-sm py-1.5 px-3 text-ink-soft hover:text-rose-600">
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

      {/* Pilih catatan talkhis lain untuk digabung */}
      {showPicker && (
        <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center md:px-4">
          <div className="absolute inset-0 bg-night-950/70 backdrop-blur-sm" onClick={() => setShowPicker(false)}/>
          <div className="relative card-glass-strong rounded-t-2xl md:rounded-2xl p-5 w-full md:max-w-lg max-h-[80vh] overflow-y-auto page-enter">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display text-lg font-semibold text-ink">Tambah dari catatan talkhis</h3>
              <button onClick={() => setShowPicker(false)} className="w-8 h-8 rounded-lg hover:bg-white/6 flex items-center justify-center text-ink-muted"><Icon name="x" className="w-4 h-4"/></button>
            </div>
            <p className="text-xs text-ink-soft mb-4">Isinya ditambahkan di akhir talkhisan ini. Pilih satu per satu sesuai urutan yang kamu mau.</p>
            {otherTalkhis.length === 0 ? (
              <p className="text-sm text-ink-muted py-6 text-center">Belum ada catatan talkhis lain. Simpan dari tab Talkhis di AI Partner dengan tombol "Ke Kurasah".</p>
            ) : (
              <div className="space-y-2">
                {otherTalkhis.map(n => (
                  <button key={n.id} onClick={() => appendNote(n)} className="w-full text-left p-3 rounded-xl border border-white/8 bg-white/3 hover:border-emerald-500/40 hover:bg-emerald-500/5">
                    <div className="text-sm text-ink">{n.title || "Tanpa judul"}</div>
                    <div dir="rtl" className="arabic text-ink-soft text-sm truncate mt-0.5">{n.body.replace(/[#*>]/g, "").trim().slice(0, 90)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-rose-600/70 hover:bg-rose-600 transition-colors">
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
