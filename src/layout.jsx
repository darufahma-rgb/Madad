/* Talqeeh — Navbar, Footer, Login Modal, Payment Modal, Router utils */


const useRoute = () => {
  const parse = () => {
    const h = window.location.hash || "#/";
    return h.startsWith("#") ? h.slice(1) : h;
  };
  const [path, setPath] = useState(parse());
  useEffect(() => {
    const onHash = () => { setPath(parse()); window.scrollTo({ top: 0, behavior: "instant" }); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return path;
};

const navigate = (to) => { window.location.hash = "#" + to; };

const NavLink = ({ to, children, className = "", onClick }) => {
  const path = useRoute();
  const active = path === to
    || (to !== "/" && (path.startsWith(to + "/") || path.startsWith(to + "?")));
  const handle = (e) => { e.preventDefault(); onClick && onClick(); navigate(to); };
  return (
    <a href={"#" + to} onClick={handle} className={`nav-link px-3.5 py-2 text-[14.5px] rounded-lg transition-colors ${active ? "text-ink font-medium active" : "text-ink-muted hover:text-ink"} ${className}`}>
      {children}
    </a>
  );
};

/* ---------------- Brand ---------------- */
const Brand = ({ size = 36 }) => (
  <a href="#/" onClick={(e)=>{e.preventDefault(); navigate("/");}} className="flex items-center gap-2.5">
    <LogoMark size={size}/>
    <span className="flex flex-col leading-tight">
      <span className="font-display text-lg font-semibold text-ink tracking-tight whitespace-nowrap">Talqeeh</span>
      <span className="hidden sm:block text-[10px] uppercase tracking-[0.22em] text-ink-muted">Panduan AI · Masisir</span>
    </span>
  </a>
);

/* ---------------- Global Search ---------------- */
const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(true); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setQuery("");
  }, [open]);

  useEffect(() => {
    window._openGlobalSearch = () => setOpen(true);
    return () => { delete window._openGlobalSearch; };
  }, []);

  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    const out = [];
    if (typeof MADDAHS !== "undefined") {
      MADDAHS.forEach(m => {
        if (m.name.toLowerCase().includes(q) || m.nameArabic.includes(query) || m.description?.toLowerCase().includes(q)) {
          out.push({ type: "maddah", id: m.id, title: m.name, sub: m.description?.slice(0, 60), arabic: m.nameArabic, to: "/maddah/" + m.id });
        }
        if (m.prompts) {
          Object.values(m.prompts).flat().forEach(p => {
            if (p.title?.toLowerCase().includes(q)) {
              out.push({ type: "prompt", id: m.id + "_" + p.title, title: p.title, sub: "Prompt di " + m.name, to: "/maddah/" + m.id });
            }
          });
        }
      });
    }
    const lib = (typeof MUQARANAH_LIBRARY !== "undefined" ? MUQARANAH_LIBRARY : null)
             || (typeof MADDAHS_MUQARANAH !== "undefined" ? MADDAHS_MUQARANAH : null)
             || (window.MUQARANAH_LIBRARY || window.MADDAHS_MUQARANAH || []);
    lib.forEach(e => {
      if (e.title?.toLowerCase().includes(q) || e.titleArabic?.includes(query) || e.question?.toLowerCase().includes(q)) {
        out.push({ type: "muqaranah", id: e.id, title: e.title, sub: e.question?.slice(0, 60), to: "/paths/muqaranah?id=" + e.id });
      }
    });
    return out.slice(0, 8);
  }, [query]);

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/4 border border-white/8 text-ink-soft text-sm hover:bg-white/6 transition-colors"
    >
      <Icon name="search" className="w-3.5 h-3.5"/>
      <span>Cari...</span>
      <kbd className="ml-1 text-[10px] text-ink-soft bg-white/5 border border-white/8 px-1.5 py-0.5 rounded">⌘K</kbd>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center pt-20 px-4 bg-night-950/70 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="w-full max-w-xl bg-night-800 rounded-2xl shadow-2xl overflow-hidden" style={{border:"1px solid rgba(62,207,142,0.25)"}} onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
          <Icon name="search" className="w-4 h-4 text-ink-soft flex-shrink-0"/>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cari Maddah, prompt, muqaranah..."
            className="flex-1 bg-transparent text-ink text-sm outline-none placeholder-ink-soft"
          />
          {query && <button onClick={() => setQuery("")} className="text-ink-soft hover:text-ink text-xs">✕</button>}
          <kbd className="text-[10px] text-ink-soft bg-white/5 border border-white/8 px-1.5 py-0.5 rounded">Esc</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {query.length >= 2 && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-ink-soft">Tidak ditemukan untuk "{query}"</div>
          )}
          {query.length < 2 && (
            <div className="px-4 py-4 text-xs text-ink-soft">Ketik minimal 2 karakter...</div>
          )}
          {results.map((r, i) => (
            <button key={i} onClick={() => { navigate(r.to); setOpen(false); }}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/4 transition-colors text-left">
              <div className={`mt-0.5 w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-[10px] font-bold
                ${r.type === "maddah" ? "bg-emerald-500/20 text-emerald-300" : r.type === "prompt" ? "bg-gold-500/15 text-gold-300" : "bg-white/8 text-ink-soft"}`}>
                {r.type === "maddah" ? "M" : r.type === "prompt" ? "P" : "Q"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-ink font-medium truncate">{r.title}</div>
                {r.sub && <div className="text-xs text-ink-soft truncate mt-0.5">{r.sub}</div>}
              </div>
              {r.arabic && <div className="text-sm text-gold-300 arabic-display flex-shrink-0" style={{direction:"rtl"}}>{r.arabic}</div>}
            </button>
          ))}
        </div>
        {results.length > 0 && (
          <div className="px-4 py-2 border-t border-line text-[11px] text-ink-soft flex gap-3">
            <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold flex items-center justify-center">M</span> Maddah
            <span className="w-5 h-5 rounded bg-gold-500/15 text-gold-300 text-[9px] font-bold flex items-center justify-center">P</span> Prompt
            <span className="w-5 h-5 rounded bg-white/8 text-ink-soft text-[9px] font-bold flex items-center justify-center">Q</span> Muqaranah
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------------- Navbar ---------------- */
const Navbar = ({ onOpenLogin, onOpenPayment }) => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const { session, logout } = useAuth();
  const path = useRoute();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => { setOpen(false); setConfirmLogout(false); setMobileSheetOpen(false); }, [path]);

  // 5 nav utama member — Maddah-first
  const memberLinks = [
    { to: "/dashboard",        label: "Dashboard" },
    { to: "/maddah",           label: "Maddah" },
    { to: "/paths/muqaranah",  label: "Muqaranah" },
    { to: "/kurasah",          label: "Kurasah" },
    { to: "/tools",            label: "Tool Guide" },
  ];
  // Link tambahan untuk mobile menu
  const memberLinksExtra = [
    { to: "/paths",            label: "Learning Path" },
    { to: "/ethics",           label: "Etika" },
  ];
  const publicLinks = [
    { to: "/sample/nahwu", label: "Preview" },
    { to: "/maddah-publik", label: "Maddah" },
    { to: "/ethics",        label: "Etika" },
  ];
  const links = session ? memberLinks : publicLinks;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-night-900/70 backdrop-blur-xl border-b border-line" : "bg-transparent"}`} style={{ paddingTop: "var(--safe-top)" }}>
      <div className="container-x flex items-center justify-between h-12 md:h-[72px]">
        <Brand/>
        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => l.to.startsWith("/#")
            ? <a key={l.to} href={l.to.slice(1)} onClick={(e) => { e.preventDefault(); const id = l.to.split("#")[1]; const el = document.getElementById(id); if (el) el.scrollIntoView({behavior:"smooth"}); }} className="nav-link px-3.5 py-2 text-[14.5px] text-ink-muted hover:text-ink rounded-lg">{l.label}</a>
            : <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
          )}
        </nav>
        {session && <GlobalSearch/>}
        <div className="hidden md:flex items-center gap-2">
          {session ? (
            <>
              <div className="px-3 py-1.5 rounded-lg chip-glass text-xs">
                <span className="text-ink-muted">Member:</span> <span className="text-ink font-medium">{session.name}</span>
              </div>
              {confirmLogout ? (
                <span className="flex items-center gap-1">
                  <button onClick={() => { logout(); setConfirmLogout(false); }} className="text-sm text-rose-600 hover:text-rose-600/80 px-2 py-1 rounded-lg hover:bg-rose-600/10 transition-colors font-medium">Ya, keluar</button>
                  <button onClick={() => setConfirmLogout(false)} className="text-sm text-ink-muted hover:text-ink px-2 py-1 rounded-lg transition-colors">Batal</button>
                </span>
              ) : (
                <button onClick={() => setConfirmLogout(true)} className="btn btn-ghost text-sm py-2 px-3">Logout</button>
              )}
            </>
          ) : (
            <>
              <button onClick={onOpenLogin} className="btn btn-ghost text-sm py-2 px-4">
                <Icon name="user" className="w-4 h-4"/> Login Member
              </button>
              <button onClick={onOpenPayment} className="btn btn-primary text-sm py-2.5 px-4">
                <Icon name="sparkles" className="w-4 h-4"/> Gabung Member
              </button>
            </>
          )}
        </div>
        {/* Mobile: avatar untuk member, hamburger untuk tamu */}
        <div className="md:hidden flex items-center gap-1">
          {session && (
            <button onClick={() => window._openGlobalSearch && window._openGlobalSearch()} className="w-9 h-9 flex items-center justify-center text-ink-soft">
              <Icon name="search" className="w-5 h-5"/>
            </button>
          )}
          {session ? (
            <button
              onClick={() => setMobileSheetOpen(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-emerald-100 text-sm font-semibold"
              style={{background:"rgba(62,207,142,0.18)",border:"1px solid rgba(62,207,142,0.30)"}}
            >
              {(session.name || "T").charAt(0).toUpperCase()}
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button onClick={onOpenLogin} className="text-sm text-emerald-300 font-medium px-3 py-2">Masuk</button>
              <button onClick={() => setOpen(true)} className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-ink hover:bg-white/5">
                <Icon name="menu" className="w-5 h-5"/>
              </button>
            </div>
          )}
        </div>
      </div>
      {open && !session && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-night-950/70 modal-back" onClick={() => setOpen(false)}/>
          <div className="absolute top-0 right-0 bottom-0 w-[82%] max-w-sm bg-night-900 border-l border-line p-6 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <Brand/>
              <button onClick={() => setOpen(false)} className="w-9 h-9 rounded-lg text-ink hover:bg-white/5">
                <Icon name="x" className="w-5 h-5 mx-auto"/>
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {/* Primary links */}
              {links.map(l => (
                l.to.startsWith("/#") ? null : (
                  <a key={l.to} href={"#" + l.to}
                     onClick={(e)=>{ e.preventDefault(); navigate(l.to); setOpen(false); }}
                     className={`px-3 py-3 text-base rounded-lg ${path === l.to || (l.to !== "/" && (path.startsWith(l.to + "/") || path.startsWith(l.to + "?"))) ? "bg-white/8 text-ink font-medium" : "text-ink-muted hover:bg-white/4"}`}>
                    {l.label}
                  </a>
                )
              ))}
              {/* Extra links (mobile only) */}
              {session && memberLinksExtra.map(l => (
                <a key={l.to} href={"#" + l.to}
                   onClick={(e)=>{ e.preventDefault(); navigate(l.to); setOpen(false); }}
                   className={`px-3 py-3 text-base rounded-lg ${path === l.to ? "bg-white/8 text-ink font-medium" : "text-ink-muted hover:bg-white/4"}`}>
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="mt-auto pt-6 border-t border-line flex flex-col gap-2">
              {session ? (
                confirmLogout ? (
                  <div className="flex gap-2">
                    <button onClick={() => { logout(); setOpen(false); setConfirmLogout(false); }} className="flex-1 btn text-sm py-2.5 text-rose-600 border border-rose-600/30 bg-rose-600/8 hover:bg-rose-600/15 transition-colors">Ya, keluar</button>
                    <button onClick={() => setConfirmLogout(false)} className="flex-1 btn btn-ghost text-sm py-2.5">Batal</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmLogout(true)} className="btn btn-ghost w-full">Logout</button>
                )
              ) : (
                <>
                  <button onClick={() => { setOpen(false); onOpenPayment && onOpenPayment(); }} className="btn btn-primary w-full">
                    <Icon name="sparkles" className="w-4 h-4"/> Gabung Member
                  </button>
                  <button onClick={() => { setOpen(false); onOpenLogin(); }} className="btn btn-ghost w-full">
                    <Icon name="user" className="w-4 h-4"/> Login Member
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Mobile account sheet */}
      {mobileSheetOpen && session && (
        <BottomSheet onClose={() => setMobileSheetOpen(false)} title="Akun">
          <div className="space-y-1">
            <div className="px-3 py-3 mb-1">
              <div className="text-xs text-ink-soft mb-0.5">Member</div>
              <div className="text-ink font-medium">{session.name}</div>
            </div>
            <SheetLink icon="target" label="Siap Imtihan" onClick={() => { navigate("/siap-imtihan"); setMobileSheetOpen(false); }}/>
            <SheetLink icon="bookOpen" label="Learning Path" onClick={() => { navigate("/paths"); setMobileSheetOpen(false); }}/>
            <SheetLink icon="shield" label="Etika" onClick={() => { navigate("/ethics"); setMobileSheetOpen(false); }}/>
            <div className="border-t border-line mt-2 pt-2">
              <button
                onClick={() => { logout(); setMobileSheetOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-rose-400 hover:bg-white/5 transition-colors"
              >
                <Icon name="x" className="w-5 h-5 flex-shrink-0"/>
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </BottomSheet>
      )}
    </header>
  );
};

/* ---------------- Footer ---------------- */
const Footer = () => (
  <footer className="mt-20 border-t border-line">
    <div className="container-x py-12">
      <div className="flex flex-col md:flex-row items-start justify-between gap-8">
        <div className="max-w-md">
          <Brand size={40}/>
          <p className="mt-5 text-sm text-ink-muted leading-relaxed">
            AI learning companion premium untuk Masisir, memahami materi lebih cepat,
            mengerjakan tugas lebih cerdas, dengan AI yang sesuai cara belajarmu.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
          <a href="#/" onClick={(e)=>{e.preventDefault(); navigate("/");}} className="text-ink-muted hover:text-ink">Beranda</a>
          <a href="#/maddah-publik" onClick={(e)=>{e.preventDefault(); navigate("/maddah-publik");}} className="text-ink-muted hover:text-ink">Maddah</a>
          <a href="#/paths/muqaranah" onClick={(e)=>{e.preventDefault(); navigate("/paths/muqaranah");}} className="text-ink-muted hover:text-ink">Muqaranah</a>
          <a href="#/kurasah" onClick={(e)=>{e.preventDefault(); navigate("/kurasah");}} className="text-ink-muted hover:text-ink">Kurasah</a>
          <a href="#/tools" onClick={(e)=>{e.preventDefault(); navigate("/tools");}} className="text-ink-muted hover:text-ink">Tool Guide</a>
          <a href="#/ethics" onClick={(e)=>{e.preventDefault(); navigate("/ethics");}} className="text-ink-muted hover:text-ink">Etika</a>
          <a href="#/paths" onClick={(e)=>{e.preventDefault(); navigate("/paths");}} className="text-ink-muted hover:text-ink">Learning Path</a>
        </div>
      </div>
      <div className="divider-arabesque mt-10 opacity-50"/>

      {/* Khat Arab dekoratif — center, di atas copyright */}
      <div
        aria-hidden="true"
        style={{
          fontFamily: '"Reem Kufi", "Noto Kufi Arabic", sans-serif',
          fontSize: "clamp(72px, 10vw, 140px)",
          fontWeight: 700,
          color: "rgba(212,178,125,0.12)",
          WebkitTextStroke: "1.5px rgba(212,178,125,0.75)",
          textAlign: "center",
          display: "block",
          lineHeight: 0.9,
          letterSpacing: "0.05em",
          marginTop: "24px",
          marginBottom: "32px",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        تَلْقِيْح
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="text-ink-soft">© {new Date().getFullYear()} Talqeeh · All rights reserved.</div>
        <div className="text-ink-muted tracking-wider flex flex-col items-end gap-1">
          <span className="text-ink-soft font-medium">Talqeeh — Panduan Belajar Al-Azhar dengan AI</span>
          <span>Designed &amp; Developed by <span className="text-gold-400 font-medium">Dar Dev</span></span>
        </div>
      </div>
    </div>
  </footer>
);

/* ---------------- Login Modal ---------------- */
const LoginModal = ({ open, onClose, onSuccess }) => {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState(null);
  const [conflict, setConflict] = useState(null);
  const { login, loginLoading } = useAuth();
  const inputRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    if (open) {
      setCode("");
      setStatus(null);
      setConflict(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const submit = async (e) => {
    e?.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c || loginLoading) return;
    const result = await login(c);
    if (result.ok) {
      toast.push("Selamat datang, " + result.member.name);
      onSuccess && onSuccess(result);
    } else if (result.status === "device_conflict") {
      setConflict(result.member);
    } else {
      setStatus(result);
    }
  };

  const takeover = async () => {
    const result = await login(code.trim().toUpperCase(), { forceTakeover: true });
    if (result.ok) {
      toast.push("Berhasil login di device ini");
      setConflict(null);
      onSuccess && onSuccess(result);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="p-7 md:p-8">
        <div className="flex items-center justify-between mb-1">
          <span className="badge-purple">🔐 Member Access</span>
          <button onClick={onClose} className="w-8 h-8 rounded-lg text-ink-muted hover:bg-white/5 flex items-center justify-center">
            <Icon name="x" className="w-4 h-4"/>
          </button>
        </div>

        {conflict ? (
          <div className="mt-3">
            <h2 className="font-display text-2xl font-semibold text-ink mb-2">Member sedang aktif di device lain</h2>
            <p className="text-sm text-ink-muted leading-relaxed mb-5">
              Kode <span className="font-mono text-gold-300">{conflict.code}</span> sedang aktif di:
              <span className="text-ink ml-1">{conflict.device}</span>.
              Lanjutkan akan otomatis logout device sebelumnya.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConflict(null)} className="btn btn-ghost flex-1">Batal</button>
              <button onClick={takeover} className="btn btn-primary flex-1">Lanjut di device ini</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-3">
            <h2 className="font-display text-2xl font-semibold text-ink mb-2">Masukkan kode akses member</h2>
            <p className="text-sm text-ink-muted mb-6">Format: <span className="font-mono text-gold-300">MSR-XXXX-XXXX</span></p>
            <input
              ref={inputRef}
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setStatus(null); }}
              placeholder="MSR-XXXX-XXXX"
              className="code-input w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-xl text-ink placeholder:text-ink-soft focus:outline-none transition-colors"
              style={{borderRadius:12}}
              onFocus={e => { e.target.style.borderColor="rgba(62,207,142,0.55)"; e.target.style.boxShadow="0 0 0 3px rgba(62,207,142,0.15)"; }}
              onBlur={e => { e.target.style.borderColor="rgba(255,255,255,0.10)"; e.target.style.boxShadow="none"; }}
              maxLength={13}
            />
            {status && !status.ok && (
              <div className="mt-3 px-4 py-2.5 rounded-lg bg-rose-600/10 border border-rose-600/30 text-rose-600 text-sm flex items-start gap-2">
                <Icon name="alert" className="w-4 h-4 mt-0.5 flex-shrink-0"/>
                <span>
                  {status.status === "not_found" && "Kode tidak ditemukan. Cek lagi atau hubungi admin."}
                  {status.status === "expired" && "Kode sudah expired. Hubungi admin untuk renewal."}
                  {status.status === "disabled" && "Kode dinonaktifkan. Hubungi admin."}
                </span>
              </div>
            )}
            <button type="submit" disabled={code.length < 8 || loginLoading} className={`btn btn-primary w-full mt-5 ${code.length < 8 || loginLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
              {loginLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Memverifikasi...
                </span>
              ) : <>Masuk <Icon name="arrowRight" className="w-4 h-4"/></>}
            </button>
            <div className="mt-5 pt-5 border-t border-line text-xs text-ink-soft text-center leading-relaxed">
              Belum punya kode?<br/>
              Daftar sebagai member Talqeeh untuk mendapatkan akses.
            </div>
            <div className="mt-4 text-center">
              <button type="button" onClick={() => setCode("MSR-DEMO-1234")} className="text-xs text-emerald-300 hover:text-emerald-200 underline underline-offset-2">
                Coba dengan kode demo: MSR-DEMO-1234
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

/* ---------------- Payment Modal ---------------- */
const PaymentModal = ({ open, onClose, onOpenLogin }) => {
  const [paid, setPaid] = useState(false);
  const [waitingConfirm, setWaitingConfirm] = useState(false);

  useEffect(() => {
    if (!open) { setPaid(false); setWaitingConfirm(false); }
  }, [open]);

  const handlePayClick = () => {
    const lynkUrl = localStorage.getItem("talqeeh_lynk_url") || "https://lynk.id/talqee";
    window.open(lynkUrl, "_blank", "noopener,noreferrer");
    setWaitingConfirm(true);
  };

  const handleConfirmPaid = () => {
    setPaid(true);
  };

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="p-7 md:p-8">
        <div className="flex items-center justify-between mb-1">
          <span className="badge-purple">✨ Gabung Member</span>
          <button onClick={onClose} className="w-8 h-8 rounded-lg text-ink-muted hover:bg-white/5 flex items-center justify-center">
            <Icon name="x" className="w-4 h-4"/>
          </button>
        </div>

        {paid ? (
          <div className="mt-6 text-center py-4">
            <div className="w-16 h-16 rounded-full text-emerald-200 flex items-center justify-center mx-auto mb-5" style={{background:"rgba(62,207,142,0.18)",border:"1px solid rgba(62,207,142,0.30)"}}>
              <Icon name="check" className="w-8 h-8" strokeWidth={2.4}/>
            </div>
            <div className="arabic-display-classical text-2xl text-gold-300 mb-3">جَزَاكَ اللهُ خَيْرًا</div>
            <h2 className="font-display text-2xl font-semibold text-ink mb-3">Terima kasih</h2>
            <p className="text-ink-muted text-sm leading-relaxed mb-6 max-w-xs mx-auto">
              Pembayaran sedang diproses. Kode akses akan dikirimkan oleh admin setelah konfirmasi pembayaran.
            </p>
            <div className="card-glass p-4 mb-6 text-left">
              <div className="text-[11px] uppercase tracking-wider text-gold-400 mb-2">Apa selanjutnya?</div>
              <ol className="text-sm text-ink-muted space-y-2">
                <li className="flex items-start gap-2"><span className="text-emerald-300 font-semibold">1.</span> Admin akan memverifikasi pembayaran</li>
                <li className="flex items-start gap-2"><span className="text-emerald-300 font-semibold">2.</span> Kode akses dikirimkan via WhatsApp</li>
                <li className="flex items-start gap-2"><span className="text-emerald-300 font-semibold">3.</span> Login &amp; mulai journey-mu</li>
              </ol>
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} className="btn btn-ghost flex-1 text-sm">Tutup</button>
              <button onClick={() => { onClose(); onOpenLogin && onOpenLogin(); }} className="btn btn-primary flex-1 text-sm">
                <Icon name="user" className="w-4 h-4"/> Sudah punya kode?
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <h2 className="font-display text-2xl font-semibold text-ink mb-1">Akses Premium Talqeeh</h2>
            <p className="text-sm text-ink-muted mb-6 leading-relaxed">
              Onboarding 3 pertanyaan, lalu dashboard personal langsung jalan.
            </p>

            <div className="card-glass-strong p-5 mb-5 relative overflow-hidden">
              <Blob color="rgba(62,207,142,0.28)" size={200} top={-60} right={-60}/>
              <div className="relative">
                <div className="text-[11px] uppercase tracking-wider text-gold-400 mb-3">Yang kamu dapat</div>
                <div className="space-y-2.5 mb-5">
                  {[
                    { i: "layers",   t: "52 Maddah (S1 + Ma'had) dengan 490+ prompt template AI" },
                    { i: "sparkles", t: "Adaptive guide untuk 6 AI × 6 gaya belajar" },
                    { i: "scale",    t: "Muqaranah qoul ulama (Library + buat sendiri)" },
                    { i: "book",     t: "Kurasah pribadi dengan markdown & teks Arab" },
                    { i: "heart",    t: "Companion harian: niat, ritme, refleksi" },
                  ].map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg text-emerald-300 flex items-center justify-center flex-shrink-0 mt-0.5" style={{background:"rgba(62,207,142,0.16)"}}>
                        <Icon name={f.i} className="w-3.5 h-3.5"/>
                      </span>
                      <span className="text-sm text-ink leading-relaxed">{f.t}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-line">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-ink-muted">Pembayaran via</div>
                    <div className="font-display text-lg font-semibold text-gold-300 mt-0.5">Lynk.id</div>
                  </div>
                  <span className="badge-purple">Sekali bayar</span>
                </div>
              </div>
            </div>

            {waitingConfirm ? (
              <div className="space-y-3">
                <div className="card-glass p-4 text-center rounded-xl border border-gold-500/20">
                  <p className="text-sm text-ink-muted leading-relaxed">
                    Selesaikan pembayaran di tab Lynk.id yang terbuka, lalu klik tombol di bawah.
                  </p>
                </div>
                <button onClick={handleConfirmPaid} className="btn btn-gold w-full text-base py-3.5">
                  <Icon name="check" className="w-4 h-4"/> Saya sudah selesai bayar
                </button>
                <button onClick={() => setWaitingConfirm(false)} className="text-center w-full text-xs text-ink-soft hover:text-ink-muted">
                  Kembali
                </button>
              </div>
            ) : (
              <>
                <button onClick={handlePayClick} className="btn btn-gold w-full text-base py-3.5 mb-3">
                  <Icon name="arrowRight" className="w-4 h-4"/> Bayar via Lynk.id
                </button>
                <p className="text-center text-xs text-ink-soft">
                  Klik "Bayar" → selesaikan di Lynk.id → kembali dan konfirmasi.
                </p>
              </>
            )}
            <div className="mt-4 pt-4 border-t border-line text-center">
              <button onClick={() => { onClose(); onOpenLogin && onOpenLogin(); }} className="text-xs text-emerald-300 hover:text-emerald-200 underline underline-offset-2">
                Sudah punya kode akses? Login di sini
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

/* ---------------- Page Header (used by member pages) ---------------- */
const PageHeader = ({ kicker, title, subtitle, arabic, children, right }) => (
  <section className="relative pt-6 md:pt-12 pb-8 md:pb-12 overflow-hidden">
    <div className="container-x relative">
      <div className="flex items-start justify-between gap-8 flex-wrap">
        <div className="flex-1 min-w-0">
          {kicker && <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 flex items-center gap-2">
            <span className="w-6 h-px bg-gold-500/70"/>{kicker}
          </div>}
          {arabic && <div className="arabic-display-classical text-xl md:text-2xl text-emerald-200/60 mb-3">{arabic}</div>}
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-ink leading-[1.05] tracking-tightest max-w-3xl">
            {title}
          </h1>
          {subtitle && <p className="mt-4 text-base md:text-lg text-ink-muted max-w-2xl leading-relaxed">{subtitle}</p>}
          {children}
        </div>
        {right && <div>{right}</div>}
      </div>
    </div>
  </section>
);

/* ---------------- Mobile Tab Bar ---------------- */
const MobileTabBar = () => {
  const { session, profile } = useAuth();
  const path = useRoute();

  if (!session || !profile?.onboarded) return null;
  if (path.startsWith("/admin") || path === "/onboarding") return null;

  const isS2 = profile?.level === "s2_kuliyyat" || profile?.level === "s2_dirasat";
  const isMahadUser = (typeof isMahadLevel !== "undefined") && isMahadLevel(profile?.level);

  const tabs = isS2 ? [
    { to: "/dashboard",       label: "Beranda",  icon: "home" },
    { to: "/s2-maddah",       label: "Maddah",   icon: "layers" },
    { to: "/siap-imtihan",    label: "Imtihan",  icon: "target" },
    { to: "/kurasah",         label: "Kurasah",  icon: "bookOpen" },
    { to: "/tools",           label: "Prompt",   icon: "sparkles" },
  ] : isMahadUser ? [
    { to: "/dashboard",    label: "Beranda",  icon: "home"     },
    { to: "/mahad-maddah", label: "Maddah",   icon: "layers"   },
    { to: "/siap-imtihan", label: "Ujian",    icon: "target"   },
    { to: "/kurasah",      label: "Kurasah",  icon: "bookOpen" },
    { to: "/tools",        label: "Tools",    icon: "sparkles" },
  ] : [
    { to: "/dashboard",       label: "Beranda",   icon: "home" },
    { to: "/maddah",          label: "Maddah",    icon: "layers" },
    { to: "/paths/muqaranah", label: "Muqaranah", icon: "scale" },
    { to: "/kurasah",         label: "Kurasah",   icon: "bookOpen" },
    { to: "/tools",           label: "Prompt",    icon: "sparkles" },
  ];

  const isActive = (to) => {
    if (to === "/dashboard") return path === "/dashboard" || path === "/";
    return path.startsWith(to);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[100] border-t"
      style={{
        background: "rgba(15,10,42,0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTopColor: "rgba(255,255,255,0.08)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-stretch justify-around" style={{height:"54px"}}>
        {tabs.map(tab => {
          const active = isActive(tab.to);
          return (
            <button
              key={tab.to}
              onClick={() => navigate(tab.to)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full" style={{background:"#3ecf8e"}}/>
              )}
              <Icon
                name={tab.icon}
                className={"w-5 h-5 transition-colors " + (active ? "text-emerald-400" : "")}
                style={active ? {} : {color:"rgba(255,255,255,0.4)"}}
              />
              <span
                className={"text-[9px] leading-none transition-colors mt-0.5 " + (active ? "font-bold" : "")}
                style={{color: active ? "#3ecf8e" : "rgba(255,255,255,0.4)"}}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

/* ── Floating Support Button (BN-11) ── */
const SupportButton = () => {
  const getWa = () => {
    try {
      const s = JSON.parse(localStorage.getItem("talqee_admin_settings") || "{}");
      return s.whatsapp || "+201xxxxxxxxx";
    } catch { return "+201xxxxxxxxx"; }
  };

  const handleClick = () => {
    const wa = getWa().replace(/\D/g, "");
    const msg = encodeURIComponent("Assalamu'alaikum, saya butuh bantuan dengan Talqeeh.");
    window.open(`https://wa.me/${wa}?text=${msg}`, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Hubungi Admin"
      title="Butuh bantuan? Hubungi admin"
      style={{
        position:"fixed",
        bottom: "calc(var(--tabbar-height, 64px) + var(--safe-bottom, 0px) + 20px)",
        right:"20px", zIndex:55,
        width:"46px", height:"46px", borderRadius:"50%",
        background:"linear-gradient(160deg,#25D366,#128C7E)",
        border:"none", cursor:"pointer", display:"flex",
        alignItems:"center", justifyContent:"center",
        boxShadow:"0 4px 20px rgba(37,211,102,0.35)",
        transition:"transform .2s ease, box-shadow .2s ease",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform="scale(1.08)"; e.currentTarget.style.boxShadow="0 6px 24px rgba(37,211,102,0.5)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow="0 4px 20px rgba(37,211,102,0.35)"; }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.852L0 24l6.334-1.51A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.017-1.376l-.36-.213-3.724.888.92-3.618-.235-.372A9.818 9.818 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z"/>
      </svg>
    </button>
  );
};

Object.assign(window, {
  useRoute, navigate, NavLink, Brand,
  Navbar, Footer, LoginModal, PaymentModal, PageHeader,
  MobileTabBar, SupportButton,
});
