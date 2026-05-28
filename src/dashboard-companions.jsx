/* Talqih, Dashboard Companion Modules
   1. IntentionStrip  — Niat Hari Ini
   2. RhythmCard      — Ritme Pekan Ini
   3. ReflectionCard  — Refleksi dari Kurasah */

(function injectStyles() {
  const s = document.createElement("style");
  s.textContent = "@keyframes madadPulse{0%,100%{opacity:0.35}50%{opacity:0.88}}";
  document.head.appendChild(s);
})();

const { useState: useStateC, useEffect: useEffectC, useMemo: useMemoC } = React;

/* ─── date helpers ─── */
const todayISO = () => new Date().toISOString().slice(0, 10);
const nowISO   = () => new Date().toISOString();

const formatDateID = () => {
  const days   = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const d = new Date();
  return `${days[d.getDay()]} · ${d.getDate()} ${months[d.getMonth()]}`;
};

const getMondayOfWeek = () => {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
};

const getWeekDates = () => {
  const mon = getMondayOfWeek();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
};

const daysSince = (iso) => Math.floor((Date.now() - new Date(iso)) / 864e5);

const truncateAtWord = (text, max = 280) => {
  const clean = (text || "").replace(/[#*`>]/g, "").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const sp = cut.lastIndexOf(" ");
  return (sp > 0 ? cut.slice(0, sp) : cut) + "...";
};

/* ─── presence helpers ─── */
const loadPresence = () => {
  try {
    const r = localStorage.getItem("madad_presence");
    return r ? JSON.parse(r) : { daysPresent: [], lastMarkedDate: null };
  } catch(e) { return { daysPresent: [], lastMarkedDate: null }; }
};

const markPresenceToday = () => {
  const today = todayISO();
  const d = loadPresence();
  if (d.lastMarkedDate === today) return;
  if (!d.daysPresent.includes(today)) d.daysPresent.push(today);
  d.lastMarkedDate = today;
  localStorage.setItem("madad_presence", JSON.stringify(d));
};

const getWeekRhythm = () => {
  const week = getWeekDates();
  const { daysPresent } = loadPresence();
  const today = todayISO();
  return week.map(date => ({
    date,
    present:  daysPresent.includes(date),
    isToday:  date === today,
    isFuture: date > today,
  }));
};

const getRhythmMessage = (count) => {
  if (count >= 6) return "Ritmemu konsisten pekan ini. Barakallahu fik.";
  if (count >= 4) return "Ritme yang sehat. Istirahat juga bagian dari belajar.";
  if (count >= 2) return "Ada hari-hari yang lebih ringan. Lanjutkan dengan sabar.";
  if (count === 1) return "Hari ini kamu hadir. Itu cukup untuk hari ini.";
  return "Pekan untuk istirahat. Mulai lagi pelan-pelan saat siap.";
};

/* ─── intention helpers ─── */
const loadIntentions = () => {
  try {
    const r = localStorage.getItem("madad_intentions");
    return r ? JSON.parse(r) : { todayDate: null, todayIntention: null, defaultClassicId: 1, customIntentions: [] };
  } catch(e) { return { todayDate: null, todayIntention: null, defaultClassicId: 1, customIntentions: [] }; }
};

const saveIntentions = (data) => {
  localStorage.setItem("madad_intentions", JSON.stringify(data));
};

const commitTodayIntention = (intention) => {
  const d = loadIntentions();
  d.todayDate = todayISO();
  d.todayIntention = { ...intention, committedAt: nowISO(), reflection: null };
  saveIntentions(d);
  markPresenceToday();
  window.dispatchEvent(new Event("madad:refresh"));
};

const saveReflection = (value) => {
  const d = loadIntentions();
  if (d.todayIntention) {
    d.todayIntention.reflection = value;
    saveIntentions(d);
    window.dispatchEvent(new Event("madad:refresh"));
  }
};

/* ─── reflection helper ─── */
const getReflectionOfTheDay = () => {
  const notes = loadNotes();
  const eligible = notes.filter(n => daysSince(n.createdAt) >= 7 && (n.body || "").length >= 50);
  if (!eligible.length) return null;
  const seed = parseInt(todayISO().split("-").join("").slice(-4)) || 0;
  return eligible[seed % eligible.length];
};

/* ═══════════════════════════════════════════════
   MODUL 1 — NIAT HARI INI
═══════════════════════════════════════════════ */
const IntentionStrip = () => {
  const toast = useToast();
  const [data, setData]           = useStateC(loadIntentions);
  const [showEdit, setShowEdit]   = useStateC(false);
  const [selClassic, setSelClassic] = useStateC(null);
  const [customText, setCustomText] = useStateC("");
  const [useArabic, setUseArabic]   = useStateC(false);
  const [saveDefault, setSaveDefault] = useStateC(false);

  useEffectC(() => {
    const h = () => setData(loadIntentions());
    window.addEventListener("madad:refresh", h);
    return () => window.removeEventListener("madad:refresh", h);
  }, []);

  const today     = todayISO();
  const committed = data.todayDate === today ? data.todayIntention : null;
  const defId     = data.defaultClassicId || 1;
  const display   = committed || CLASSIC_INTENTIONS.find(c => c.id === defId) || CLASSIC_INTENTIONS[0];

  const committedAt      = committed?.committedAt ? new Date(committed.committedAt) : null;
  const hoursSinceCommit = committedAt ? (Date.now() - committedAt.getTime()) / 36e5 : 0;
  const showReflect      = committed && hoursSinceCommit >= 8 && !committed.reflection;

  const openEdit = () => {
    setSelClassic(data.defaultClassicId || 1);
    setCustomText("");
    setUseArabic(false);
    setSaveDefault(false);
    setShowEdit(true);
  };

  const handleCommit = () => {
    commitTodayIntention({
      arabic:      display.arabic || "",
      translation: display.translation || display.text || "",
      isCustom:    false,
      classicId:   display.id || null,
    });
    toast && toast.push("Niatmu dicatat hari ini.");
  };

  const handleSave = () => {
    const d = loadIntentions();
    if (customText.trim()) {
      const nc = { id: Date.now(), arabic: useArabic ? customText : "", text: customText, translation: customText, createdAt: nowISO() };
      d.customIntentions = [...(d.customIntentions || []), nc];
      d.todayDate = today;
      d.todayIntention = { ...nc, isCustom: true, committedAt: nowISO(), reflection: null };
      if (saveDefault) { d.defaultClassicId = null; d.defaultCustomId = nc.id; }
    } else {
      const cl = CLASSIC_INTENTIONS.find(c => c.id === selClassic) || CLASSIC_INTENTIONS[0];
      if (saveDefault) d.defaultClassicId = selClassic;
      d.todayDate = today;
      d.todayIntention = { ...cl, isCustom: false, classicId: cl.id, committedAt: nowISO(), reflection: null };
    }
    saveIntentions(d);
    markPresenceToday();
    window.dispatchEvent(new Event("madad:refresh"));
    setShowEdit(false);
    toast && toast.push("Niatmu dicatat hari ini.");
  };

  return (
    <Reveal>
      <div className="relative rounded-2xl overflow-hidden"
        style={{background:"rgba(17,6,31,0.97)",border:"1px solid rgba(201,168,106,0.14)",borderLeft:"3px solid rgba(201,168,106,0.38)"}}>
        <div className="p-7 md:p-9">

          <div className="flex items-start justify-between mb-4 gap-4">
            <div className="text-xs uppercase tracking-[0.22em] text-gold-400 flex items-center gap-2">
              <span className="w-4 h-px bg-gold-500/60"/>Niat hari ini
            </div>
            <div className="text-xs text-ink-muted flex-shrink-0">{formatDateID()}</div>
          </div>

          <div className="flex justify-center mb-5">
            <Arch className="w-12 h-auto opacity-30" color="#C9A86A"/>
          </div>

          <div className="text-center mb-5">
            <div className="arabic-display-classical text-xl md:text-2xl leading-[1.9] mb-3"
              style={{color:"rgba(201,168,106,0.88)", direction:"rtl"}}>
              {display.arabic}
            </div>
            <p className="text-sm text-ink-muted italic leading-relaxed max-w-xl mx-auto"
              style={{fontFamily:"'Crimson Pro',Georgia,serif"}}>
              "{display.translation || display.text}"
            </p>
          </div>

          {showReflect && (
            <div className="mt-5 pt-5 border-t border-gold-400/10 text-center">
              <p className="text-sm text-ink-muted italic mb-4">Sudahkah niatmu pagi tadi terwujud?</p>
              <div className="flex justify-center gap-3 flex-wrap">
                <button onClick={() => saveReflection("fulfilled")}
                  className="text-xs px-4 py-2 rounded-full border border-gold-400/25 text-ink-muted hover:text-ink hover:border-gold-400/45 transition-all">
                  Alhamdulillah, sebagian besar
                </button>
                <button onClick={() => saveReflection("not_yet")}
                  className="text-xs px-4 py-2 rounded-full border border-line text-ink-muted hover:text-ink hover:border-white/20 transition-all">
                  Belum, esok lagi
                </button>
              </div>
            </div>
          )}

          {committed?.reflection && (
            <div className="mt-4 text-center text-xs text-ink-soft">Terima kasih sudah merenung.</div>
          )}

          <div className="flex items-center justify-end gap-3 mt-6">
            {committed && (
              <span className="text-xs text-ink-soft">
                Pukul {new Date(committed.committedAt).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})}
              </span>
            )}
            {!committed ? (
              <button onClick={handleCommit} className="btn btn-ghost text-sm py-2 px-5"
                style={{borderColor:"rgba(201,168,106,0.28)"}}>
                Pakai niat ini
              </button>
            ) : (
              <span className="text-sm text-ink-muted flex items-center gap-1.5">
                <Icon name="check" className="w-3.5 h-3.5" strokeWidth={2.2}/> Sudah
              </span>
            )}
            <button onClick={openEdit}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink hover:bg-white/5 transition-all"
              title="Edit niat">
              <Icon name="pen" className="w-3.5 h-3.5"/>
            </button>
          </div>
        </div>
      </div>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} size="md">
        <div className="p-6 overflow-y-auto" style={{maxHeight:"82vh"}}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-lg font-semibold text-ink">Pilih atau tulis niat</h3>
            <button onClick={() => setShowEdit(false)}
              className="w-7 h-7 flex items-center justify-center text-ink-muted hover:text-ink rounded-lg hover:bg-white/5">
              <Icon name="x" className="w-4 h-4"/>
            </button>
          </div>

          <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">Niat Klasik</div>
          <div className="space-y-2 mb-5">
            {CLASSIC_INTENTIONS.map(c => (
              <button key={c.id}
                onClick={() => { setSelClassic(c.id); setCustomText(""); }}
                className={`w-full text-left p-3 rounded-xl border transition-all ${selClassic === c.id && !customText ? "border-gold-400/35 bg-gold-500/6" : "border-line hover:border-white/15"}`}>
                <div className="text-xs text-gold-400 mb-1">{c.label}</div>
                <div className="text-[11px] text-ink-muted leading-relaxed" style={{display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
                  {c.translation}
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-line"/>
            <span className="text-[11px] text-ink-soft">atau tulis sendiri</span>
            <div className="flex-1 h-px bg-line"/>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-ink-muted">Niat custom</span>
              <label className="flex items-center gap-1.5 text-xs text-ink-muted cursor-pointer select-none">
                <input type="checkbox" checked={useArabic} onChange={e => setUseArabic(e.target.checked)} className="accent-violet-500"/>
                Mode Arab
              </label>
            </div>
            <textarea rows={4}
              placeholder={useArabic ? "\u0627\u0643\u062a\u0628 \u0646\u064a\u062a\u0643 \u0647\u0646\u0627..." : "Tulis niatmu di sini..."}
              value={customText}
              onChange={e => { setCustomText(e.target.value); if (e.target.value) setSelClassic(null); }}
              className="w-full bg-night-900/60 border border-line rounded-xl p-3 text-sm text-ink placeholder-ink-soft resize-none focus:outline-none focus:border-violet-500/50 transition-colors"
              style={useArabic ? {direction:"rtl",fontFamily:"'Scheherazade New',serif",fontSize:"1.1rem",lineHeight:1.8} : {}}/>
          </div>

          <label className="flex items-center gap-2 text-xs text-ink-muted mb-5 cursor-pointer select-none">
            <input type="checkbox" checked={saveDefault} onChange={e => setSaveDefault(e.target.checked)} className="accent-violet-500"/>
            Jadikan niat default-ku
          </label>

          <div className="flex gap-2">
            <button onClick={handleSave} className="btn btn-primary flex-1 text-sm py-2.5">Simpan & pakai</button>
            <button onClick={() => setShowEdit(false)} className="btn btn-ghost text-sm py-2.5 px-4">Batal</button>
          </div>
        </div>
      </Modal>
    </Reveal>
  );
};

/* ═══════════════════════════════════════════════
   MODUL 2 — RITME PEKAN INI
═══════════════════════════════════════════════ */
const RhythmCard = () => {
  const [rhythm, setRhythm] = useStateC(getWeekRhythm);
  const [tooltip, setTooltip] = useStateC(null);

  useEffectC(() => {
    setRhythm(getWeekRhythm());
    const h = () => setRhythm(getWeekRhythm());
    window.addEventListener("madad:refresh", h);
    return () => window.removeEventListener("madad:refresh", h);
  }, []);

  const DAY_LABELS   = ["Sen","Sel","Rab","Kam","Jum","Sab","Min"];
  const presentCount = rhythm.filter(d => d.present || d.isToday).length;
  const message      = getRhythmMessage(presentCount);

  const getTip = (day, i) => {
    if (day.isFuture) return null;
    if (day.isToday)  return "Hari ini";
    if (day.present)  return `Kamu hadir ${DAY_LABELS[i]} lalu`;
    return null;
  };

  return (
    <Reveal>
      <div className="card-glass p-7 md:p-8">
        <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-5 flex items-center gap-2">
          <span className="w-4 h-px bg-gold-500/60"/>Ritme pekan ini
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2.5">
          {DAY_LABELS.map((lbl, i) => (
            <div key={i} className={`text-center text-[11px] font-medium ${rhythm[i]?.isToday ? "text-gold-400" : "text-ink-soft"}`}>
              {lbl}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 mb-5">
          {rhythm.map((day, i) => {
            const tip = getTip(day, i);
            return (
              <div key={i} className="flex justify-center relative"
                onMouseEnter={() => tip && setTooltip(i)}
                onMouseLeave={() => setTooltip(null)}>

                {day.isFuture ? (
                  <div className="w-2 h-2 rounded-full mt-[3px]" style={{background:"rgba(180,150,255,0.14)"}}/>
                ) : day.isToday ? (
                  <div className="w-[14px] h-[14px] rounded-full border-2 flex-shrink-0"
                    style={{borderColor:"#C9A86A",animation:"madadPulse 2.2s ease-in-out infinite"}}/>
                ) : day.present ? (
                  <div className="w-[14px] h-[14px] rounded-full flex-shrink-0"
                    style={{background:"#7C4DFF",boxShadow:"0 0 7px rgba(124,77,255,0.42)"}}/>
                ) : (
                  <div className="w-[14px] h-[14px] rounded-full border flex-shrink-0"
                    style={{borderColor:"rgba(180,150,255,0.2)"}}/>
                )}

                {tooltip === i && tip && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg text-[11px] text-ink whitespace-nowrap z-10 pointer-events-none"
                    style={{background:"#1a0d2e",border:"1px solid rgba(124,77,255,0.22)"}}>
                    {tip}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-sm text-ink leading-relaxed">{message}</p>
      </div>
    </Reveal>
  );
};

/* ═══════════════════════════════════════════════
   MODUL 3 — REFLEKSI DARI KURASAH
═══════════════════════════════════════════════ */
const ReflectionCard = () => {
  const note      = useMemoC(() => getReflectionOfTheDay(), []);
  const allNotes  = useMemoC(() => loadNotes(), []);
  const hasOld    = allNotes.some(n => daysSince(n.createdAt) >= 7 && (n.body||"").length >= 50);

  if (allNotes.length === 0) {
    return (
      <Reveal>
        <div className="rounded-2xl p-8 text-center"
          style={{background:"rgba(201,168,106,0.025)",border:"1px solid rgba(201,168,106,0.12)",borderLeft:"2px solid rgba(201,168,106,0.28)"}}>
          <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 flex items-center justify-center gap-2">
            <span className="w-4 h-px bg-gold-500/60"/>Dari kurasahmu
          </div>
          <div className="arabic-display-classical text-xl leading-loose mb-2" style={{color:"rgba(201,168,106,0.78)",direction:"rtl"}}>
            قَيِّدُوا الْعِلْمَ بِالْكِتَابَةِ
          </div>
          <p className="text-sm text-ink-muted italic mb-5">
            Ikatlah ilmu dengan tulisan. <span className="text-ink-soft">Atsar</span>
          </p>
          <button onClick={() => navigate("/kurasah")} className="btn btn-ghost text-sm py-2 px-5">
            Mulai kurasahmu <Icon name="arrowRight" className="w-3.5 h-3.5"/>
          </button>
        </div>
      </Reveal>
    );
  }

  if (!hasOld || !note) {
    return (
      <Reveal>
        <div className="rounded-2xl px-7 py-5 text-center"
          style={{opacity:0.65,border:"1px solid rgba(201,168,106,0.09)",borderLeft:"2px solid rgba(201,168,106,0.2)"}}>
          <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-3 flex items-center justify-center gap-2">
            <span className="w-4 h-px bg-gold-500/60"/>Dari kurasahmu
          </div>
          <p className="text-sm text-ink-muted leading-relaxed">
            Catatan-catatan barumu sedang menetap. Refleksi akan muncul di sini setelah berusia seminggu.
          </p>
        </div>
      </Reveal>
    );
  }

  const snippet = truncateAtWord(note.body, 280);
  const days    = daysSince(note.createdAt);
  const dLabel  = days === 0 ? "Hari ini" : days === 1 ? "Kemarin" : `${days} hari lalu`;

  return (
    <Reveal>
      <div className="rounded-2xl overflow-hidden hov-lift"
        style={{background:"rgba(201,168,106,0.025)",border:"1px solid rgba(201,168,106,0.12)",borderLeft:"2px solid rgba(201,168,106,0.28)"}}>
        <div className="p-8 md:p-9">
          <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-5 flex items-center gap-2">
            <span className="w-4 h-px bg-gold-500/60"/>Dari kurasahmu
          </div>

          <p className="text-sm text-ink-muted italic mb-4">{dLabel}, kamu menulis:</p>

          <blockquote className="text-ink leading-relaxed mb-5 pl-4 border-l-2 border-gold-400/20"
            style={{fontFamily:"'Crimson Pro',Georgia,serif",fontSize:"1.05rem"}}>
            "{snippet}"
          </blockquote>

          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {note.tags.map(t => (
                <button key={t}
                  onClick={() => navigate("/kurasah?tag=" + encodeURIComponent(t))}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-ink-muted border border-line hover:border-white/20 transition-colors">
                  #{t}
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <button onClick={() => navigate("/kurasah?id=" + note.id)} className="btn btn-ghost text-sm py-2 px-4">
              Buka catatan ini <Icon name="arrowRight" className="w-3.5 h-3.5"/>
            </button>
          </div>
        </div>
      </div>
    </Reveal>
  );
};

/* ─── exports ─── */
Object.assign(window, {
  IntentionStrip, RhythmCard, ReflectionCard,
  markPresenceToday, getWeekRhythm, getRhythmMessage,
  loadIntentions, saveIntentions, commitTodayIntention, saveReflection,
  loadPresence,
});
