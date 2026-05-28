/* Talqih, Quick Note Floating Button + Modal */

const QUICK_NOTE_TAGS = ["Fiqh","Ushul","Hadith","Tafsir","Nahwu","Aqidah","Balaghah","Makalah","Hafalan","Dars","Penting"];

const QuickNoteModal = ({ open, onClose, contextLabel, contextSource }) => {
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [tags, setTags] = React.useState([]);
  const [saving, setSaving] = React.useState(false);
  const toast = useToast();
  const path = useRoute();

  React.useEffect(() => {
    if (open) { setTitle(""); setBody(""); setTags([]); }
  }, [open]);

  const toggleTag = (tag) => setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const handleSave = (andNavigate = false) => {
    if (!title.trim() && !body.trim()) return;
    setSaving(true);
    const notes = loadNotes();
    const now = new Date().toISOString();
    const note = {
      id: "note_" + Date.now() + "_" + Math.random().toString(36).slice(2,6),
      title: title.trim() || "Catatan tanpa judul",
      body: body.trim(),
      tags: tags,
      source: contextSource || null,
      createdAt: now,
      updatedAt: now,
    };
    saveNotes([note, ...notes]);
    setSaving(false);
    onClose();
    toast.push("Catatan tersimpan ke Kurasah.");
    if (andNavigate) setTimeout(() => navigate("/kurasah?id=" + note.id), 100);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0">
      <div className="absolute inset-0 bg-night-950/70 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative w-full max-w-lg card-glass-strong rounded-2xl p-6 shadow-2xl page-enter">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display text-xl font-semibold text-ink">Catatan Cepat</h3>
            <p className="text-xs text-ink-muted mt-0.5">Tersimpan ke Kurasahmu</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg text-ink-muted hover:text-ink hover:bg-white/5 transition-colors flex items-center justify-center">
            <Icon name="x" className="w-4 h-4"/>
          </button>
        </div>

        {contextSource && (
          <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-400/20">
            <Icon name="bookmark" className="w-3.5 h-3.5 text-violet-300 flex-shrink-0"/>
            <span className="text-xs text-violet-200 truncate">Terhubung ke: {contextLabel}</span>
          </div>
        )}

        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Judul catatan..."
          className="w-full bg-transparent text-ink font-display text-lg placeholder-ink-soft border-b border-line pb-3 mb-4 outline-none focus:border-violet-400/60 transition-colors"
        />
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Tulis catatanmu di sini..."
          rows={6}
          className="w-full bg-white/3 rounded-xl p-4 text-sm text-ink-muted placeholder-ink-soft outline-none focus:bg-white/5 transition-colors resize-none leading-relaxed border border-line focus:border-violet-400/30"
        />

        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-wider text-ink-soft mb-2">Saran tag</div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_NOTE_TAGS.map(tag => {
              const active = tags.includes(tag);
              return (
                <button key={tag} type="button" onClick={() => toggleTag(tag)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${active ? "bg-violet-500/20 text-violet-200 border-violet-400/40" : "bg-white/3 text-ink-muted border-line hover:border-violet-400/25 hover:text-ink-soft"}`}>
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => handleSave(false)}
            disabled={saving || (!title.trim() && !body.trim())}
            className="btn btn-primary flex-1 text-sm py-2.5">
            <Icon name="check" className="w-4 h-4"/> Simpan &amp; Lanjut
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving || (!title.trim() && !body.trim())}
            className="btn btn-ghost text-sm py-2.5 px-4">
            Buka di Kurasah
          </button>
        </div>
      </div>
    </div>
  );
};

const QuickNoteButton = ({ contextLabel, contextSource }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Tulis catatan cepat ke Kurasah"
        className="fixed bottom-6 right-6 z-50 w-13 h-13 rounded-full card-glass-strong border border-violet-400/30 text-violet-200 hover:text-violet-100 hover:border-violet-400/60 transition-all shadow-lg flex items-center justify-center hov-lift"
        style={{width:52,height:52}}>
        <Icon name="pen" className="w-5 h-5"/>
      </button>
      <QuickNoteModal
        open={open}
        onClose={() => setOpen(false)}
        contextLabel={contextLabel}
        contextSource={contextSource}
      />
    </>
  );
};

window.QuickNoteButton = QuickNoteButton;
window.QuickNoteModal = QuickNoteModal;
