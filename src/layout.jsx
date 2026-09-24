import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
import { openTutorial } from './components/tutorial-modal.jsx';
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

// Scroll ke section di landing; kalau sedang di halaman lain, pindah ke landing dulu.
const scrollToLandingSection = (id) => {
  const el = document.getElementById(id);
  if (el) { el.scrollIntoView({ behavior: "smooth" }); return; }
  navigate("/");
  // Tunggu landing selesai render (router juga scroll ke atas saat hash berubah), lalu lompat.
  let tries = 0;
  const jump = () => {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "auto" });
    else if (++tries < 20) setTimeout(jump, 100);
  };
  setTimeout(jump, 150);
};
const scrollToPaket = () => scrollToLandingSection("paket");

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
    { to: "/dashboard",        label: "Beranda" },
    { to: "/library",          label: "Library" },
    { to: "/ai-partner",       label: "AI Partner" },
    { to: "/maddah",           label: "Maddah" },
    // Dua link terakhir hanya di layar lebar supaya navbar tidak terpotong; di HP ada di tab bawah.
    { to: "/paths/muqaranah",  label: "Muqaranah", wideOnly: true },
    { to: "/kurasah",          label: "Kurasah",   wideOnly: true },
  ];
  // Link tambahan untuk mobile menu
  const memberLinksExtra = [
    { to: "/ai-partner",       label: "AI Partner" },
    { to: "/paths",            label: "Learning Path" },
    { to: "/framework",        label: "Framework" },
    { to: "/tutorial",         label: "Tutorial" },
    { to: "/ethics",           label: "Etika" },
  ];
  const publicLinks = [
    { to: "/sample/nahwu", label: "Preview" },
    { to: "/maddah-publik", label: "Maddah" },
    { to: "/#paket",        label: "Paket" },
    { to: "/framework",     label: "Framework" },
    { to: "/tutorial",      label: "Cara Pakai" },
    { to: "/checklist-soal", label: "Status Soal" },
    { to: "/submit-soal",   label: "Submit Soal", highlight: true },
  ];
  const links = session ? memberLinks : publicLinks;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-night-900/70 backdrop-blur-xl border-b border-line" : "bg-transparent"}`} style={{ paddingTop: "var(--safe-top)" }}>
      <div className="container-x flex items-center justify-between h-12 md:h-[72px]">
        <Brand/>
        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => l.to.startsWith("/#")
            ? <a key={l.to} href={l.to.slice(1)} onClick={(e) => { e.preventDefault(); scrollToLandingSection(l.to.split("#")[1]); }} className="nav-link px-3.5 py-2 text-[14.5px] text-ink-muted hover:text-ink rounded-lg">{l.label}</a>
            : l.highlight
              ? <NavLink key={l.to} to={l.to} className="!text-emerald-400 hover:!text-emerald-300 font-semibold">{l.label}</NavLink>
              : <NavLink key={l.to} to={l.to} className={l.wideOnly ? "hidden xl:inline-block" : ""}>{l.label}</NavLink>
          )}
          {session && (
            <button
              onClick={openTutorial}
              className="nav-link px-3.5 py-2 text-[14.5px] text-ink-muted hover:text-ink rounded-lg"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              Tutorial
            </button>
          )}
        </nav>
        {session && <GlobalSearch/>}
        <div className="hidden md:flex items-center gap-2">
          {session ? (
            <>
              {session.tier === "free" && (
                <button onClick={onOpenPayment} className="btn btn-gold text-xs py-2 px-3.5">
                  <Icon name="crown" className="w-3.5 h-3.5"/> Upgrade
                </button>
              )}
              <div className="hidden lg:block px-3 py-1.5 rounded-lg chip-glass text-xs" title={`${session.email || ""} · ${session.code}`}>
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
                <Icon name="user" className="w-4 h-4"/> Masuk
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
                l.to.startsWith("/#") ? (
                  <a key={l.to} href={l.to.slice(1)}
                     onClick={(e)=>{ e.preventDefault(); setOpen(false); scrollToLandingSection(l.to.split("#")[1]); }}
                     className="px-3 py-3 text-base rounded-lg text-ink-muted hover:bg-white/4">
                    {l.label}
                  </a>
                ) : (
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
                    <Icon name="user" className="w-4 h-4"/> Masuk dengan Google
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
              {session.email && <div className="text-xs text-ink-muted mt-0.5">{session.email}</div>}
              <div className="text-[11px] text-ink-soft font-mono mt-1">ID member: {session.code}</div>
              {session.tier === "free" && (
                <button onClick={() => { setMobileSheetOpen(false); onOpenPayment(); }} className="btn btn-gold w-full text-sm py-2.5 mt-3">
                  <Icon name="crown" className="w-4 h-4"/> Akun gratis · Upgrade ke Library
                </button>
              )}
            </div>
            <SheetLink icon="star" label="Statistik Belajarku" onClick={() => { navigate("/statistik"); setMobileSheetOpen(false); }}/>
            <SheetLink icon="target" label="Siap Imtihan" onClick={() => { navigate("/siap-imtihan"); setMobileSheetOpen(false); }}/>
            <SheetLink icon="bookOpen" label="Learning Path" onClick={() => { navigate("/paths"); setMobileSheetOpen(false); }}/>
            <SheetLink icon="shield" label="Etika" onClick={() => { navigate("/ethics"); setMobileSheetOpen(false); }}/>
            <SheetLink icon="bookOpen" label="Tutorial" onClick={() => { openTutorial(); setMobileSheetOpen(false); }}/>
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
const Footer = () => {
  const { session } = useAuth();
  return (
  <footer className="mt-20 border-t border-line" style={{ paddingBottom: "calc(var(--tabbar-height, 0px) + var(--safe-bottom))" }}>
    <div className="container-x py-12">
      <div className="flex flex-col md:flex-row items-start justify-between gap-8">
        <div className="max-w-md">
          <Brand size={40}/>
          <p className="mt-5 text-sm text-ink-muted leading-relaxed">
            Teman belajar muqarrar Al-Azhar untuk Masisir. Library berisi {CATALOG.maddah} maddah dan
            {" "}{CATALOG.prompts} template prompt, plus AI Partner yang bikin ringkasan, flashcard,
            dan kuis dari diktatmu sendiri.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
          {[
            ["/", "Beranda"],
            ["/maddah-publik", "Daftar Maddah"],
            ["/bank-soal", "Bank Soal"],
            ["/submit-soal", "Submit Soal"],
            ["/tutorial", "Cara Pakai"],
            ["/ethics", "Etika Pakai AI"],
            ["/privacy", "Kebijakan Privasi"],
          ].map(([to, label]) => (
            <a key={to} href={"#" + to} onClick={(e)=>{e.preventDefault(); navigate(to);}} className="text-ink-muted hover:text-ink">{label}</a>
          ))}
          {session
            ? <a href="#/ai-partner" onClick={(e)=>{e.preventDefault(); navigate("/ai-partner");}} className="text-ink-muted hover:text-ink">AI Partner</a>
            : <a href="#/" onClick={(e)=>{e.preventDefault(); scrollToPaket();}} className="text-ink-muted hover:text-ink">Paket & Harga</a>}
        </div>
      </div>
      <div className="divider-arabesque mt-10 opacity-50"/>

      {/* Khat Arab dekoratif — center, di atas copyright */}
      <div aria-hidden="true" className="flex justify-center"
        style={{marginTop:"24px", marginBottom:"32px", pointerEvents:"none", userSelect:"none"}}>
        <img
          src="/assets/khat-footer.png"
          alt=""
          style={{
            width: "clamp(260px, 38vw, 540px)",
            opacity: 0.18,
            mixBlendMode: "screen",
            filter: "brightness(1.1)",
          }}
        />
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
};

/* ---------------- Login Modal ---------------- */
const ADMIN_WA_LINK = "wa.me/6281311506025";

const ACTIVATION_ERRORS = {
  not_found:      "PIN tidak ditemukan atau sudah pernah dipakai. Cek lagi, atau minta PIN baru ke admin.",
  pin_expired:    "PIN sudah kedaluwarsa (berlaku 14 hari). Minta PIN baru ke admin.",
  already_linked: `Keanggotaan ini sudah terhubung ke akun Google lain. Login pakai akun itu, atau hubungi admin di ${ADMIN_WA_LINK}.`,
  expired:        "Keanggotaan ini sudah berakhir. Hubungi admin untuk perpanjangan.",
  disabled:       "Keanggotaan ini dinonaktifkan. Hubungi admin.",
  rate_limited:   "Terlalu banyak percobaan. Coba lagi 15 menit lagi.",
  invalid:        "Masukkan PIN 8 karakter dengan format XXXX-XXXX.",
  error:          "Gagal memproses. Cek koneksi lalu coba lagi.",
};

// "abcdefgh" → "ABCD-EFGH" saat diketik
const formatPinInput = (value) => {
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
  return clean.length > 4 ? `${clean.slice(0, 4)}-${clean.slice(4)}` : clean;
};

const GoogleMark = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>
  </svg>
);

const ErrorBox = ({ message }) => message ? (
  <div className="mt-3 px-4 py-2.5 rounded-lg bg-rose-600/10 border border-rose-600/30 text-rose-600 text-sm flex items-start gap-2">
    <Icon name="alert" className="w-4 h-4 mt-0.5 flex-shrink-0"/>
    <span>{message}</span>
  </div>
) : null;

const GoogleButton = ({ onClick, loading, disabled }) => (
  <button onClick={onClick} disabled={loading || disabled}
    className={`w-full flex items-center justify-center gap-3 rounded-xl px-5 py-3.5 bg-white text-gray-800 font-medium text-sm hover:bg-gray-100 transition ${loading ? "opacity-60 cursor-wait" : ""}`}>
    <GoogleMark/>
    {loading ? "Mengarahkan ke Google..." : "Masuk dengan Google"}
  </button>
);

const useGoogleSignIn = () => {
  const { signInWithGoogle, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const start = async () => {
    setLoading(true);
    setError(null);
    try { await signInWithGoogle(); }
    catch (e) { setError("Gagal membuka login Google: " + e.message); setLoading(false); }
  };
  const switchAccount = async () => { await logout(); start(); };
  return { loading, error, start, switchAccount };
};

// Login saja. Pengguna yang sudah login tapi belum punya akun diarahkan ke halaman /gabung oleh App.
const LoginModal = ({ open, onClose, onSuccess, joinPlan }) => {
  const { authStatus, authInfo } = useAuth();
  const google = useGoogleSignIn();

  useEffect(() => {
    if (open && authStatus === "member") onSuccess && onSuccess();
  }, [open, authStatus]);

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="p-7 md:p-8">
        <div className="flex items-center justify-between mb-1">
          <span className="badge-purple">🔐 Member Access</span>
          <button onClick={onClose} className="w-8 h-8 rounded-lg text-ink-muted hover:bg-white/5 flex items-center justify-center">
            <Icon name="x" className="w-4 h-4"/>
          </button>
        </div>

        {authStatus === "inactive" ? (
          <div className="mt-3">
            <h2 className="font-display text-2xl font-semibold text-ink mb-2">Keanggotaan tidak aktif</h2>
            <p className="text-sm text-ink-muted mb-6 leading-relaxed">
              {authInfo?.reason === "expired" ? ACTIVATION_ERRORS.expired : ACTIVATION_ERRORS.disabled}
            </p>
            <button onClick={google.switchAccount} className="btn btn-ghost w-full">Pakai akun Google lain</button>
          </div>
        ) : (
          <div className="mt-3">
            <h2 className="font-display text-2xl font-semibold text-ink mb-2">
              {joinPlan ? "Login dulu, lalu pilih paket" : "Masuk ke Talqeeh"}
            </h2>
            <p className="text-sm text-ink-muted mb-6 leading-relaxed">
              {joinPlan
                ? "Akun Google jadi identitas keanggotaanmu. Setelah login, kamu diarahkan ke halaman pilihan paket — bayar sekarang atau coba gratis dulu."
                : "Login pakai akun Google. Belum jadi member? Setelah login kamu bisa pilih paket — atau coba gratis dulu."}
            </p>
            <GoogleButton onClick={google.start} loading={google.loading} disabled={authStatus === "loading"}/>
            <ErrorBox message={google.error}/>
            <div className="mt-5 pt-5 border-t border-line text-xs text-ink-soft text-center leading-relaxed">
              Member lama: masuk dengan Google, lalu masukkan PIN aktivasi yang dikirim admin via WhatsApp.
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

/* ---------------- Paket & Join Modal ---------------- */
const LIBRARY_PRICE          = "Rp 63.000";
const LIBRARY_PRICE_ORIGINAL = "Rp 89.000";
// Angka katalog yang dipakai di semua copy. Sesuaikan kalau data maddah/prompt bertambah
// (61 maddah S1 di maddah-data + 27 maddah Ma'had di mahad-data; 1.201 prompt per September 2026).
const CATALOG = { maddah: 88, maddahS1: 61, maddahMahad: 27, prompts: "1.200+" };
const LIBRARY_FEATURES = [
  `${CATALOG.maddah} maddah (S1 + Ma'had) dengan ${CATALOG.prompts} template prompt`,
  "Rekomendasi AI yang cocok per maddah, tingkat, dan gaya belajarmu",
  "Bank soal imtihan tahriri + prompt jawabannya",
  "Siap Imtihan: prompt persiapan ujian tahriri & syafawi",
  "Muqaranah qoul ulama 4 madzhab",
  "Kurasah (catatan pribadi) dan Companion harian",
  "Sekali bayar, semua update ke depan ikut terbuka",
];
const AI_PARTNER_FEATURES = [
  "Unggah PDF (termasuk scan), Word, slide, foto diktat, atau rekaman kuliah",
  "Ringkasan gaya kitab (Indonesia/Arab/dwibahasa) + peta konsep taqsimat",
  "Terjemah & i'rab kalimat Arab, harakat otomatis, mufradat berwazan",
  "Flashcard pengulangan berjarak, kuis, dan latihan tahriri dinilai AI",
  "Tutor dari materimu + simulasi ujian syafawi",
];
const PLAN_LABELS = { library: "Library", library_ai: "Library + AI Partner" };
const DEFAULT_ADMIN_WA = "6281311506025";
const PAYMENT_WAIT_LIMIT_MS = 10 * 60 * 1000;

const StepList = ({ items }) => (
  <ol className="text-sm text-ink-muted space-y-2.5">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-2.5">
        <span className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-semibold text-emerald-200"
          style={{ background: "rgba(62,207,142,0.15)", border: "1px solid rgba(62,207,142,0.3)" }}>{i + 1}</span>
        <span className="leading-relaxed">{item}</span>
      </li>
    ))}
  </ol>
);

/* ---------------- Dinding upgrade untuk akun gratis ---------------- */
const FREE_WALL_COPY = {
  "/siap-imtihan":   { title: "Siap Imtihan", desc: "Bank soal lengkap dengan prompt jawaban, 4 mode latihan gaya ujian Azhar, dan Bedah Talkhisan." },
  "/paths":          { title: "Learning Path & Muqaranah", desc: "Jalur belajar bertahap dan perbandingan qoul ulama 4 madzhab." },
  "/prompt-library": { title: "Prompt Library", desc: `${CATALOG.prompts} template prompt yang disesuaikan dengan tingkat dan gaya belajarmu.` },
  "/tools":          { title: "Tool Guide", desc: "Panduan memilih dan memakai AI yang tepat untuk tiap kebutuhan belajar." },
  "/s2-maddah":      { title: "Maddah S2", desc: "Template prompt khusus mahasiswa pascasarjana: risalah, literatur, presentasi." },
};

const FreeUpgradeWall = ({ path }) => {
  const key = Object.keys(FREE_WALL_COPY).find(p => path === p || path.startsWith(p + "/") || path.startsWith(p + "?"));
  const copy = FREE_WALL_COPY[key] || { title: "Fitur Library", desc: "Fitur ini termasuk dalam paket Library." };
  return (
    <div className="page-enter container-x py-10 md:py-16 max-w-2xl">
      <div className="card-glass-strong p-7 md:p-10 text-center" style={{ border: "1px solid rgba(201,168,106,0.3)" }}>
        <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center bg-gold-500/12 border border-gold-500/25">
          <Icon name="crown" className="w-6 h-6 text-gold-300"/>
        </div>
        <div className="text-xs uppercase tracking-[0.2em] text-gold-400 mb-2">Khusus paket Library</div>
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-ink mb-3">{copy.title}</h1>
        <p className="text-ink-muted leading-relaxed mb-6">{copy.desc}</p>
        <ul className="text-left text-sm text-ink space-y-2 max-w-sm mx-auto mb-7">
          {LIBRARY_FEATURES.slice(0, 5).map(f => (
            <li key={f} className="flex items-start gap-2.5"><Icon name="check" className="w-4 h-4 mt-0.5 text-gold-400 flex-shrink-0"/>{f}</li>
          ))}
        </ul>
        <button onClick={() => navigate("/gabung?plan=library")} className="btn btn-gold px-7 py-3.5 text-base font-semibold">
          Upgrade ke Library · {LIBRARY_PRICE}
        </button>
        <div className="mt-4">
          <button onClick={() => navigate("/dashboard")} className="text-sm text-ink-soft hover:text-ink">Kembali ke Beranda</button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Maddah untuk akun gratis: Nahwu + 1 maddah pilihan ---------------- */
const FREE_SAMPLE_MADDAH = "nahwu";
const canOpenMaddahFree = (id, profile) => id === FREE_SAMPLE_MADDAH || (!!profile?.freeMaddahId && id === profile.freeMaddahId);
// true kalau maddah ini terkunci untuk sesi sekarang.
const isMaddahLocked = (id, session, profile) => session?.tier === "free" && !canOpenMaddahFree(id, profile);

const FreeMaddahGate = ({ maddah, backPath, backLabel }) => {
  const { profile, saveProfile } = useAuth();
  const chosenId = profile?.freeMaddahId;
  const chosen = chosenId && (window.getMaddahById?.(chosenId) || window.getMahadMaddahById?.(chosenId));
  const promptCount = Object.values(maddah.prompts || {}).reduce((s, arr) => s + (Array.isArray(arr) ? arr.length : 0), 0);

  const pick = () => {
    if (!confirm(`Jadikan "${maddah.name}" maddah gratismu? Pilihan ini tidak bisa diganti.`)) return;
    saveProfile({ ...profile, freeMaddahId: maddah.id });
  };

  return (
    <div className="page-enter container-x py-6 md:py-10 max-w-3xl">
      <button onClick={() => navigate(backPath)} className="text-sm text-ink-soft hover:text-ink inline-flex items-center gap-2 mb-5">← {backLabel}</button>
      <div className="arabic-display text-gold-300 text-4xl md:text-5xl mb-2" style={{ direction: "rtl" }}>{maddah.nameArabic}</div>
      <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-3">{maddah.name}</h1>
      <p className="text-ink-muted leading-relaxed mb-6">{maddah.description}</p>

      <div className="card-glass-strong p-6 md:p-8 text-center" style={{ border: "1px solid rgba(201,168,106,0.3)" }}>
        <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gold-500/12 border border-gold-500/25">
          <Icon name="crown" className="w-5 h-5 text-gold-300"/>
        </div>
        <div className="text-sm text-ink mb-1">{promptCount} template prompt siap pakai di maddah ini</div>
        {!chosenId ? (
          <>
            <p className="text-sm text-ink-muted leading-relaxed mb-5 max-w-md mx-auto">
              Akun gratis bisa membuka Nahwu dan <span className="text-ink">1 maddah pilihan</span>. Mau pilih maddah ini?
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              <button onClick={pick} className="btn btn-primary text-sm px-5 py-2.5">Jadikan maddah gratisku</button>
              <button onClick={() => navigate("/gabung?plan=library")} className="btn btn-gold text-sm px-5 py-2.5">Buka semua · {LIBRARY_PRICE}</button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-ink-muted leading-relaxed mb-5 max-w-md mx-auto">
              Maddah gratismu: <span className="text-ink">{chosen?.name || chosenId}</span>. Upgrade ke Library untuk membuka semua {CATALOG.maddah} maddah.
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              <button onClick={() => navigate("/gabung?plan=library")} className="btn btn-gold text-sm px-5 py-2.5">Upgrade ke Library · {LIBRARY_PRICE}</button>
              <button onClick={() => navigate((window.getMaddahById?.(chosenId) ? "/maddah/" : "/mahad-maddah/") + chosenId)} className="btn btn-ghost text-sm px-5 py-2.5">
                Buka {chosen?.name || "maddah gratisku"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ---------------- AI Subscription Modal (add-on bulanan) ---------------- */
const AiSubscriptionModal = ({ open, onClose, onNeedMembership }) => {
  const { session } = useAuth();
  const [checking, setChecking] = useState(false);
  const [active, setActive] = useState(false);
  const memberCode = session?.code || null;
  // Langganan AI adalah tambahan untuk member Library; akun gratis harus ambil Library dulu.
  const needsLibrary = !memberCode || session?.tier === "free";

  const settings = useAppSettings();
  const mayarUrl     = safeHttpsUrl(settings.mayarUrl) || "";
  const aiPriceLabel = settings.aiPriceLabel || "Segera diumumkan";

  useEffect(() => {
    if (!open || !memberCode) return;
    setChecking(true);
    window.checkAiSubscription?.().then(r => setActive(!!r.active)).finally(() => setChecking(false));
  }, [open, memberCode]);

  const handlePayClick = () => {
    if (!mayarUrl) return;
    window.open(mayarUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-emerald-200"
            style={{background:"rgba(62,207,142,0.12)", border:"1px solid rgba(62,207,142,0.25)"}}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block"/>
            AI Partner Belajar Muqarrar
          </span>
          <button onClick={onClose} className="w-8 h-8 rounded-lg text-ink-muted hover:bg-white/5 flex items-center justify-center">
            <Icon name="x" className="w-4 h-4"/>
          </button>
        </div>

        {needsLibrary ? (
          <div className="text-center py-4">
            <p className="text-ink-muted text-sm leading-relaxed mb-6">
              AI Partner Belajar adalah tambahan untuk member Library. Mulai dari paket <span className="text-ink">Library + AI Partner</span>:
              login Google, bayar Library sekali, lalu lanjut berlangganan AI.
            </p>
            <button onClick={() => { onClose(); onNeedMembership && onNeedMembership(); }} className="btn btn-primary w-full text-sm">
              Pilih paket Library + AI
            </button>
          </div>
        ) : active ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full text-emerald-200 flex items-center justify-center mx-auto mb-5" style={{background:"rgba(62,207,142,0.18)",border:"1px solid rgba(62,207,142,0.30)"}}>
              <Icon name="check" className="w-8 h-8" strokeWidth={2.4}/>
            </div>
            <h2 className="font-display text-2xl font-semibold text-ink mb-3">Langganan aktif</h2>
            <p className="text-ink-muted text-sm leading-relaxed mb-6">
              AI Partner Belajar kamu sedang aktif. Terima kasih sudah berlangganan!
            </p>
            <button onClick={onClose} className="btn btn-ghost w-full text-sm">Tutup</button>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <div className="font-display font-bold text-ink leading-none mb-1" style={{fontSize:"clamp(1.6rem,6vw,2.2rem)"}}>
                {aiPriceLabel}
              </div>
              <div className="text-[11px] uppercase tracking-widest text-ink-muted">Langganan bulanan · Tambahan untuk paket Library</div>
            </div>

            <div className="card-glass p-4 mb-6 text-left">
              <div className="text-[11px] uppercase tracking-wider text-gold-400 mb-2">Cara berlangganan</div>
              <ol className="text-sm text-ink-muted space-y-2">
                <li className="flex items-start gap-2"><span className="text-emerald-300 font-semibold">1.</span> Klik "Berlangganan Sekarang" di bawah</li>
                <li className="flex items-start gap-2"><span className="text-emerald-300 font-semibold">2.</span> <span>Isi email checkout dengan <span className="text-ink">{session?.email}</span> (sama dengan akun Google-mu)</span></li>
                <li className="flex items-start gap-2"><span className="text-emerald-300 font-semibold">3.</span> Setelah bayar, akses aktif otomatis dalam beberapa menit — cek lagi halaman ini</li>
              </ol>
            </div>

            <button onClick={handlePayClick} disabled={!mayarUrl || checking}
              className={`btn btn-gold w-full text-base py-3.5 mb-2 font-semibold ${!mayarUrl ? "opacity-50 cursor-not-allowed" : ""}`}>
              {mayarUrl ? "Berlangganan Sekarang" : "Segera dibuka"}
            </button>
            <p className="text-center text-xs text-ink-soft">
              Kalau form checkout meminta ID member, isi <span className="font-mono text-ink-muted">{memberCode}</span>.
              {!mayarUrl && " Selama pembayaran langganan belum dibuka, akses AI Partner diaktifkan admin — hubungi admin lewat tombol WhatsApp."}
            </p>
          </>
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

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => {
      document.documentElement.style.setProperty("--tabbar-height", mq.matches ? "60px" : "0px");
    };
    update();
    mq.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      document.documentElement.style.setProperty("--tabbar-height", "0px");
    };
  }, []);

  if (!session || !profile?.onboarded) return null;
  if (path.startsWith("/admin") || path === "/onboarding") return null;

  const isS2 = profile?.level === "s2_kuliyyat" || profile?.level === "s2_dirasat";
  const isMahadUser = (typeof isMahadLevel !== "undefined") && isMahadLevel(profile?.level);

  const tabs = isS2 ? [
    { to: "/dashboard",       label: "Beranda",  icon: "home" },
    { to: "/s2-maddah",       label: "Maddah",   icon: "layers" },
    { to: "/siap-imtihan",    label: "Imtihan",  icon: "target" },
    { to: "/kurasah",         label: "Kurasah",  icon: "bookOpen" },
    { to: "/framework",       label: "Metode",   icon: "brain" },
  ] : isMahadUser ? [
    { to: "/dashboard",    label: "Beranda",  icon: "home"     },
    { to: "/mahad-maddah", label: "Maddah",   icon: "layers"   },
    { to: "/siap-imtihan", label: "Ujian",    icon: "target"   },
    { to: "/kurasah",      label: "Kurasah",  icon: "bookOpen" },
    { to: "/framework",    label: "Metode",   icon: "brain"    },
  ] : [
    { to: "/dashboard",       label: "Beranda",   icon: "home" },
    { to: "/maddah",          label: "Maddah",    icon: "layers" },
    { to: "/paths/muqaranah", label: "Muqaranah", icon: "scale" },
    { to: "/kurasah",         label: "Kurasah",   icon: "bookOpen" },
    { to: "/framework",       label: "Metode",    icon: "brain" },
  ];

  const isActive = (to) => {
    if (to === "/dashboard") return path === "/dashboard" || path === "/library" || path === "/";
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
  const wa = useAppSettings().whatsapp || "";
  const isPlaceholder = !wa || wa.includes("xxxxxxxxx") || wa === "+201xxxxxxxxx";
  if (isPlaceholder) return null;

  const handleClick = () => {
    const num = wa.replace(/\D/g, "");
    const msg = encodeURIComponent("Assalamu'alaikum, saya butuh bantuan dengan Talqeeh.");
    window.open(`https://wa.me/${num}?text=${msg}`, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Hubungi Admin"
      title="Butuh bantuan? Hubungi admin"
      style={{
        position:"fixed",
        bottom: "calc(var(--tabbar-height, 0px) + 20px)",
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
  Navbar, Footer, LoginModal, AiSubscriptionModal, PageHeader, FreeUpgradeWall,
  FreeMaddahGate, isMaddahLocked, canOpenMaddahFree, FREE_SAMPLE_MADDAH,
  GoogleButton, ErrorBox, useGoogleSignIn, formatPinInput, ACTIVATION_ERRORS, StepList,
  PLAN_LABELS, DEFAULT_ADMIN_WA, PAYMENT_WAIT_LIMIT_MS,
  LIBRARY_PRICE, LIBRARY_PRICE_ORIGINAL, LIBRARY_FEATURES, AI_PARTNER_FEATURES, CATALOG,
  scrollToLandingSection, scrollToPaket,
  MobileTabBar, SupportButton,
});
