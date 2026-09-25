import React, { useState, useEffect } from 'react';
import { openTutorial } from './components/tutorial-modal.jsx';
/* Talqeeh — kerangka aplikasi member: sidebar kiri (desktop), drawer + tab bawah (HP) */

const SIDEBAR_KEY = 'talqeeh_sidebar_collapsed';
const SIDEBAR_W = 256;
const SIDEBAR_W_COLLAPSED = 76;

const readCollapsed = () => { try { return localStorage.getItem(SIDEBAR_KEY) === '1'; } catch { return false; } };
const saveCollapsed = (v) => { try { localStorage.setItem(SIDEBAR_KEY, v ? '1' : '0'); } catch {} };

const useMedia = (query) => {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatch(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return match;
};

// Path maddah mengikuti jenjang member (S1, Ma'had, S2).
const maddahPathFor = (profile) => {
  const level = profile?.level;
  if (level === 's2_kuliyyat' || level === 's2_dirasat') return '/s2-maddah';
  if (typeof isMahadLevel !== 'undefined' && isMahadLevel(level)) return '/mahad-maddah';
  return '/maddah';
};

// Utama = sama dengan tab bawah HP. Menu yang jarang dipakai dilipat di "Lainnya".
const navGroups = (profile) => [
  { label: 'Utama', items: [
    { to: '/dashboard',  label: 'Beranda',    icon: 'home' },
    { to: maddahPathFor(profile), label: 'Maddah', icon: 'layers', match: ['/maddah', '/mahad-maddah', '/s2-maddah'] },
    { to: '/ai-partner', label: 'AI Partner', icon: 'sparkles' },
    { to: '/kurasah',    label: 'Kurasah',    icon: 'pen' },
  ]},
  { label: 'Latihan', items: [
    { to: '/siap-imtihan',    label: 'Siap Imtihan',   icon: 'target',  locked: true },
    { to: '/paths/muqaranah', label: 'Muqaranah',      icon: 'scale',   locked: true },
    { to: '/paths',           label: 'Learning Path',  icon: 'compass', locked: true, exact: true },
    { to: '/prompt-library',  label: 'Prompt Library', icon: 'copy',    locked: true },
  ]},
  { label: 'Progres', items: [
    { to: '/statistik',      label: 'Statistik',      icon: 'chart' },
    { to: '/profil-belajar', label: 'Profil Belajar', icon: 'brain' },
  ]},
  { label: 'Lainnya', collapsible: true, items: [
    { to: '/library',       label: 'Library',        icon: 'bookOpen' },
    { to: '/framework',     label: 'Metode Belajar', icon: 'lightbulb' },
    { action: openTutorial, label: 'Tutorial',       icon: 'info' },
    { to: '/ethics',        label: 'Etika Pakai AI', icon: 'shield' },
  ]},
];

const MORE_KEY = 'talqeeh_sidebar_more_open';
const readMoreOpen = () => { try { return localStorage.getItem(MORE_KEY) === '1'; } catch { return false; } };
const saveMoreOpen = (v) => { try { localStorage.setItem(MORE_KEY, v ? '1' : '0'); } catch {} };

const pathMatches = (path, to, exact) => {
  if (path === to) return true;
  if (exact) return path.startsWith(to + '?');
  return path.startsWith(to + '/') || path.startsWith(to + '?');
};
const isItemActive = (path, item) => {
  if (!item.to) return false;
  if (item.match) return item.match.some(m => pathMatches(path, m));
  return pathMatches(path, item.to, item.exact);
};

const Avatar = ({ name, size = 36 }) => (
  <div className="rounded-full flex items-center justify-center font-semibold text-emerald-100 flex-shrink-0"
    style={{ width: size, height: size, fontSize: size * 0.4, background: 'rgba(62,207,142,0.18)', border: '1px solid rgba(62,207,142,0.35)' }}>
    {(name || 'T').charAt(0).toUpperCase()}
  </div>
);

const SidebarItem = ({ item, active, collapsed, locked, onNavigate }) => {
  const handle = (e) => {
    e.preventDefault();
    if (item.action) item.action(); else navigate(item.to);
    onNavigate && onNavigate();
  };
  return (
    <a href={item.to ? '#' + item.to : '#'} onClick={handle} title={collapsed ? item.label : undefined}
      className={`group relative flex items-center gap-3 rounded-xl text-sm transition-colors ${collapsed ? 'justify-center h-10 w-11 mx-auto' : 'px-3 h-10'}
        ${active ? 'bg-emerald-500/10 text-ink font-medium' : 'text-ink-muted hover:text-ink hover:bg-white/[0.04]'}`}>
      {active && !collapsed && <span className="absolute top-2 bottom-2 w-[3px] rounded-r-full" style={{ background: '#3ecf8e', left: -12 }}/>}
      <Icon name={item.icon} className="w-[18px] h-[18px] flex-shrink-0" style={{ stroke: active ? '#3ecf8e' : 'currentColor', opacity: active ? 1 : 0.75 }}/>
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && locked && <Icon name="crown" className="w-3.5 h-3.5 flex-shrink-0" style={{ stroke: '#c9a86a' }}/>}
      {collapsed && locked && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: '#c9a86a' }}/>}
    </a>
  );
};

const SidebarContent = ({ collapsed, onToggle, onNavigate, onClose, mobile }) => {
  const { session, profile, logout, isFree } = useAuth();
  const pwa = usePwaInstall();
  const path = useRoute();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [moreOpen, setMoreOpen] = useState(readMoreOpen);
  useEffect(() => setConfirmLogout(false), [path]);
  const toggleMore = () => { const next = !moreOpen; setMoreOpen(next); saveMoreOpen(next); };

  const tierLabel = isFree ? 'Akun gratis' : 'Member Library';
  const groups = navGroups(profile);
  if (!pwa.installed) {
    groups[groups.length - 1].items.push({ action: pwa.install, label: 'Pasang aplikasi', icon: 'download' });
  }

  return (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className={`flex items-center h-16 flex-shrink-0 ${collapsed ? 'justify-center' : 'justify-between px-5'}`}>
        {collapsed ? (
          <button onClick={() => { navigate('/dashboard'); onNavigate && onNavigate(); }} title="Beranda"><LogoMark size={32}/></button>
        ) : (
          <a href="#/dashboard" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); onNavigate && onNavigate(); }} className="flex items-center gap-2.5 min-w-0">
            <LogoMark size={32}/>
            <span className="flex flex-col leading-tight min-w-0">
              <span className="font-display text-[17px] font-semibold text-ink tracking-tight">Talqeeh</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-ink-soft whitespace-nowrap">Panduan AI · Masisir</span>
            </span>
          </a>
        )}
        {!collapsed && onToggle && (
          <button onClick={onToggle} title="Ciutkan sidebar" className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-soft hover:text-ink hover:bg-white/5">
            <Icon name="sidebar" className="w-4 h-4" style={{ stroke: 'currentColor' }}/>
          </button>
        )}
        {mobile && (
          <button onClick={onClose} aria-label="Tutup menu" className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/5">
            <Icon name="x" className="w-5 h-5"/>
          </button>
        )}
      </div>

      {/* Menu */}
      <nav className={`flex-1 overflow-y-auto scroll-touch no-scrollbar pb-4 ${collapsed ? 'px-2' : 'px-3'}`}>
        {collapsed && onToggle && (
          <button onClick={onToggle} title="Lebarkan sidebar" className="w-11 h-9 mx-auto mb-2 rounded-xl flex items-center justify-center text-ink-soft hover:text-ink hover:bg-white/5">
            <Icon name="sidebar" className="w-4 h-4" style={{ stroke: 'currentColor' }}/>
          </button>
        )}
        {groups.map((group, gi) => {
          // Grup lipat tetap terbuka kalau halaman aktif ada di dalamnya.
          const hasActive = group.items.some(item => isItemActive(path, item));
          const open = !group.collapsible || collapsed || moreOpen || hasActive;
          return (
          <div key={group.label} className={gi ? 'mt-5' : 'mt-1'}>
            {collapsed
              ? (gi > 0 && <div className="h-px bg-white/[0.06] mx-3 mb-3"/>)
              : group.collapsible
                ? <button onClick={toggleMore} disabled={hasActive} aria-expanded={open}
                    className="w-full flex items-center justify-between px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft hover:text-ink-muted">
                    {group.label}
                    {!hasActive && <Icon name={open ? 'chevronUp' : 'chevronDown'} className="w-3.5 h-3.5" style={{ stroke: 'currentColor' }}/>}
                  </button>
                : <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft">{group.label}</div>}
            {open && <div className="space-y-0.5">
              {group.items.map(item => (
                <SidebarItem key={item.label} item={item} collapsed={collapsed} onNavigate={onNavigate}
                  active={isItemActive(path, item)} locked={isFree && item.locked}/>
              ))}
            </div>}
          </div>
          );
        })}
      </nav>

      {/* Upgrade + akun */}
      <div className={`flex-shrink-0 border-t border-white/[0.06] ${collapsed ? 'p-2' : 'p-3'}`}>
        {isFree && (collapsed ? (
          <button onClick={() => { navigate('/gabung?plan=library'); onNavigate && onNavigate(); }} title="Upgrade ke Library"
            className="w-11 h-11 mx-auto mb-2 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,168,106,0.14)', border: '1px solid rgba(201,168,106,0.35)' }}>
            <Icon name="crown" className="w-4 h-4" style={{ stroke: '#c9a86a' }}/>
          </button>
        ) : (
          <div className="rounded-xl p-3.5 mb-3 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, rgba(201,168,106,0.16), rgba(201,168,106,0.04))', border: '1px solid rgba(201,168,106,0.3)' }}>
            <div className="flex items-center gap-2 text-sm font-semibold text-ink mb-1">
              <Icon name="crown" className="w-4 h-4" style={{ stroke: '#c9a86a' }}/> Buka semua fitur
            </div>
            <p className="text-[11px] text-ink-muted leading-relaxed mb-3">Semua {CATALOG.maddah} maddah, bank soal, dan Siap Imtihan. Sekali bayar.</p>
            <button onClick={() => { navigate('/gabung?plan=library'); onNavigate && onNavigate(); }} className="btn btn-gold w-full text-xs py-2 justify-center">
              Upgrade · {LIBRARY_PRICE}
            </button>
          </div>
        ))}

        {collapsed ? (
          <div className="flex flex-col items-center gap-1">
            <div title={`${session?.name || ''} · ${tierLabel}`}><Avatar name={session?.name} size={34}/></div>
            <button onClick={() => (confirmLogout ? logout() : setConfirmLogout(true))} title={confirmLogout ? 'Klik lagi untuk keluar' : 'Logout'}
              className={`w-11 h-9 rounded-xl flex items-center justify-center ${confirmLogout ? 'bg-rose-500/15 text-rose-400' : 'text-ink-soft hover:text-ink hover:bg-white/5'}`}>
              <Icon name="logout" className="w-4 h-4" style={{ stroke: 'currentColor' }}/>
            </button>
          </div>
        ) : confirmLogout ? (
          <div className="flex items-center gap-2 px-1 py-1">
            <span className="text-xs text-ink-muted flex-1">Keluar dari akun?</span>
            <button onClick={() => logout()} className="text-xs font-medium text-rose-400 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20">Ya, keluar</button>
            <button onClick={() => setConfirmLogout(false)} className="text-xs text-ink-muted px-2 py-1.5 rounded-lg hover:bg-white/5">Batal</button>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-1.5 py-1">
            <Avatar name={session?.name}/>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-ink truncate" title={session?.email || ''}>{session?.name || 'Member'}</div>
              <div className="text-[11px] truncate" style={{ color: isFree ? '#c9a86a' : '#3ecf8e' }}>{tierLabel}</div>
            </div>
            <button onClick={() => setConfirmLogout(true)} title="Logout" className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-soft hover:text-ink hover:bg-white/5">
              <Icon name="logout" className="w-4 h-4" style={{ stroke: 'currentColor' }}/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* Tab bawah HP: 4 tujuan utama + tombol Menu (buka drawer). */
const ShellTabBar = ({ onMenu, menuOpen }) => {
  const { profile } = useAuth();
  const path = useRoute();
  const maddahTo = maddahPathFor(profile);
  const tabs = [
    { to: '/dashboard',  label: 'Beranda',    icon: 'home',     active: path === '/dashboard' },
    { to: maddahTo,      label: 'Maddah',     icon: 'layers',   active: ['/maddah', '/mahad-maddah', '/s2-maddah'].some(m => pathMatches(path, m)) },
    { to: '/ai-partner', label: 'AI Partner', icon: 'sparkles', active: pathMatches(path, '/ai-partner') },
    { to: '/kurasah',    label: 'Kurasah',    icon: 'pen',      active: pathMatches(path, '/kurasah') },
  ];
  const Tab = ({ label, icon, active, onClick }) => (
    <button onClick={onClick} className="flex-1 flex flex-col items-center justify-center gap-1 relative">
      {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-b-full" style={{ background: '#3ecf8e' }}/>}
      <Icon name={icon} className="w-5 h-5" style={{ stroke: active ? '#3ecf8e' : 'rgba(255,255,255,0.45)' }}/>
      <span className={`text-[10px] leading-none ${active ? 'font-semibold' : ''}`} style={{ color: active ? '#3ecf8e' : 'rgba(255,255,255,0.45)' }}>{label}</span>
    </button>
  );
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] border-t"
      style={{ background: 'rgba(12,12,12,0.94)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTopColor: 'rgba(255,255,255,0.08)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-stretch" style={{ height: 60 }}>
        {tabs.map(t => <Tab key={t.label} {...t} active={t.active && !menuOpen} onClick={() => navigate(t.to)}/>)}
        <Tab label="Menu" icon="menu" active={menuOpen} onClick={onMenu}/>
      </div>
    </nav>
  );
};

const AppShell = ({ title, children }) => {
  const { session, isFree } = useAuth();
  const path = useRoute();
  const isDesktop = useMedia('(min-width: 768px)');
  const isWide = useMedia('(min-width: 1180px)');
  const [collapsedPref, setCollapsedPref] = useState(readCollapsed);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Layar sedang (tablet/laptop kecil) otomatis pakai sidebar ikon supaya konten tetap lega.
  const collapsed = collapsedPref || !isWide;
  const sidebarW = isDesktop ? (collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W) : 0;

  useEffect(() => { setDrawerOpen(false); }, [path]);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('app-shell');
    root.style.setProperty('--sidebar-w', sidebarW + 'px');
    root.style.setProperty('--tabbar-height', isDesktop ? '0px' : '60px');
    return () => {
      root.classList.remove('app-shell');
      root.style.removeProperty('--sidebar-w');
      root.style.setProperty('--tabbar-height', '0px');
    };
  }, [sidebarW, isDesktop]);
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const toggle = () => { const next = !collapsedPref; setCollapsedPref(next); saveCollapsed(next); };

  return (
    <div className="min-h-screen">
      {/* Sidebar desktop */}
      <aside className="hidden md:block fixed top-0 left-0 bottom-0 z-40 border-r border-white/[0.06] transition-[width] duration-200"
        style={{ width: sidebarW, background: 'linear-gradient(180deg, rgba(20,20,20,0.98), rgba(12,12,12,0.98))' }}>
        <SidebarContent collapsed={collapsed} onToggle={isWide ? toggle : null}/>
      </aside>

      {/* Drawer HP */}
      {drawerOpen && !isDesktop && (
        <div className="fixed inset-0 z-[110]">
          <div className="absolute inset-0 bg-night-950/70 backdrop-blur-sm modal-back" onClick={() => setDrawerOpen(false)}/>
          <aside className="absolute top-0 left-0 bottom-0 w-[84%] max-w-[300px] border-r border-white/[0.08] drawer-enter"
            style={{ background: '#111', paddingTop: 'var(--safe-top)', paddingBottom: 'var(--safe-bottom)' }}>
            <SidebarContent mobile onClose={() => setDrawerOpen(false)} onNavigate={() => setDrawerOpen(false)}/>
          </aside>
        </div>
      )}

      <div className="transition-[padding] duration-200" style={{ paddingLeft: sidebarW }}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-night-900/80 backdrop-blur-xl" style={{ paddingTop: 'var(--safe-top)' }}>
          <div className="flex items-center gap-3 px-4 md:px-8 h-14 md:h-16">
            {!isDesktop && (
              <button onClick={() => setDrawerOpen(true)} aria-label="Buka menu" className="w-9 h-9 -ml-1.5 rounded-lg flex items-center justify-center hover:bg-white/5">
                <Icon name="menu" className="w-5 h-5"/>
              </button>
            )}
            {!isDesktop && <LogoMark size={26}/>}
            <div className="font-display text-base md:text-lg font-semibold text-ink truncate flex-1 min-w-0">{title}</div>
            <GlobalSearch/>
            {!isDesktop && (
              <button onClick={() => window._openGlobalSearch && window._openGlobalSearch()} aria-label="Cari" className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-soft hover:bg-white/5">
                <Icon name="search" className="w-5 h-5"/>
              </button>
            )}
            {isDesktop && isFree && (
              <button onClick={() => navigate('/gabung?plan=library')} className="btn btn-gold text-xs py-2 px-3.5">
                <Icon name="crown" className="w-3.5 h-3.5"/> Upgrade
              </button>
            )}
            {isDesktop && (
              <button onClick={openTutorial} title="Tutorial" className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-soft hover:text-ink hover:bg-white/5">
                <Icon name="info" className="w-[18px] h-[18px]" style={{ stroke: 'currentColor' }}/>
              </button>
            )}
            {!isDesktop && (
              <button onClick={() => setDrawerOpen(true)} aria-label="Akun"><Avatar name={session?.name} size={32}/></button>
            )}
          </div>
        </header>

        <main className="has-tabbar">{children}</main>
      </div>

      <ShellTabBar onMenu={() => setDrawerOpen(o => !o)} menuOpen={drawerOpen}/>
    </div>
  );
};

Object.assign(window, { AppShell });
