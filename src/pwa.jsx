import React, { useState, useEffect } from 'react';
/* Talqeeh — PWA: daftar service worker, tangkap prompt install, panduan install per perangkat. */

const BANNER_KEY = 'talqeeh_pwa_banner_dismissed_at';
const BANNER_SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;

// Prompt install bisa muncul sebelum React selesai render, jadi ditangkap sejak modul dimuat.
let deferredPrompt = null;
let installedNow = false;
const listeners = new Set();
const emit = () => listeners.forEach(fn => fn());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    emit();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installedNow = true;
    emit();
  });
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(err => console.warn('SW gagal didaftarkan:', err));
    });
  }
}

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;

const detectPlatform = () => {
  const ua = navigator.userAgent || '';
  const ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const inApp = /FBAN|FBAV|Instagram|Line\/|WhatsApp|TikTok|Twitter/i.test(ua);
  const android = /android/i.test(ua);
  return { ios, android, inApp, mobile: ios || android || window.matchMedia?.('(max-width: 767px)').matches };
};

const usePwaInstall = () => {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force(n => n + 1);
    listeners.add(fn);
    const mq = window.matchMedia?.('(display-mode: standalone)');
    mq?.addEventListener?.('change', fn);
    return () => { listeners.delete(fn); mq?.removeEventListener?.('change', fn); };
  }, []);

  const installed = installedNow || isStandalone();
  const install = async () => {
    if (deferredPrompt) {
      const prompt = deferredPrompt;
      deferredPrompt = null;
      emit();
      prompt.prompt();
      const choice = await prompt.userChoice.catch(() => null);
      return choice?.outcome === 'accepted';
    }
    window.dispatchEvent(new Event('talqeeh:pwa-guide'));
    return false;
  };
  return { installed, canPrompt: !!deferredPrompt, install, ...detectPlatform() };
};

const openPwaGuide = () => window.dispatchEvent(new Event('talqeeh:pwa-guide'));

/* ── Panduan install manual (iPhone, browser dalam aplikasi, browser lain) ── */

const GuideStep = ({ n, children }) => (
  <li className="flex gap-3 items-start">
    <span className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs font-semibold flex items-center justify-center flex-shrink-0">{n}</span>
    <span className="text-sm text-ink-muted leading-relaxed pt-1">{children}</span>
  </li>
);

const ShareGlyph = () => (
  <svg viewBox="0 0 24 24" className="inline w-4 h-4 -mt-0.5 mx-0.5" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>
  </svg>
);

const PwaGuideModal = ({ open, onClose }) => {
  const { ios, android, inApp } = detectPlatform();
  const copyLink = () => {
    navigator.clipboard?.writeText(window.location.origin).catch(() => {});
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <img src="/icons/icon-192.png" alt="" className="w-12 h-12 rounded-2xl"/>
          <div>
            <h3 className="font-display text-lg font-semibold text-ink leading-tight">Pasang Talqeeh di HP-mu</h3>
            <p className="text-xs text-ink-muted">Buka langsung dari layar utama, tampil layar penuh seperti aplikasi.</p>
          </div>
        </div>

        {inApp ? (
          <ol className="space-y-3">
            <GuideStep n="1">Kamu sedang membuka Talqeeh dari dalam aplikasi lain (Instagram, WhatsApp, dll), yang tidak bisa memasang aplikasi.</GuideStep>
            <GuideStep n="2">Ketuk menu <span className="text-ink">⋯</span> lalu pilih <span className="text-ink">Buka di browser</span> ({ios ? 'Safari' : 'Chrome'}).</GuideStep>
            <GuideStep n="3">Di browser, buka menu ini lagi dan ikuti langkahnya.</GuideStep>
          </ol>
        ) : ios ? (
          <ol className="space-y-3">
            <GuideStep n="1">Buka talqeeh di <span className="text-ink">Safari</span>.</GuideStep>
            <GuideStep n="2">Ketuk tombol <span className="text-ink">Bagikan</span> <ShareGlyph/> di bawah (atau di atas pada iPad).</GuideStep>
            <GuideStep n="3">Gulir, lalu pilih <span className="text-ink">Tambah ke Layar Utama</span> (Add to Home Screen).</GuideStep>
            <GuideStep n="4">Ketuk <span className="text-ink">Tambah</span>. Ikon Talqeeh muncul di layar utama.</GuideStep>
          </ol>
        ) : android ? (
          <ol className="space-y-3">
            <GuideStep n="1">Buka Talqeeh di <span className="text-ink">Chrome</span>.</GuideStep>
            <GuideStep n="2">Ketuk menu <span className="text-ink">⋮</span> di pojok kanan atas.</GuideStep>
            <GuideStep n="3">Pilih <span className="text-ink">Instal aplikasi</span> atau <span className="text-ink">Tambahkan ke layar utama</span>.</GuideStep>
          </ol>
        ) : (
          <ol className="space-y-3">
            <GuideStep n="1">Buka Talqeeh di Chrome atau Edge.</GuideStep>
            <GuideStep n="2">Klik ikon install <span className="text-ink">⊕</span> di ujung kanan kolom alamat, atau menu browser → <span className="text-ink">Install Talqeeh</span>.</GuideStep>
            <GuideStep n="3">Di HP: buka talqeeh.vercel.app lalu pilih <span className="text-ink">Tambahkan ke layar utama</span>.</GuideStep>
          </ol>
        )}

        <div className="flex gap-2 mt-6">
          {inApp && <button onClick={copyLink} className="btn btn-ghost flex-1 text-sm justify-center">Salin link</button>}
          <button onClick={onClose} className="btn btn-primary flex-1 text-sm justify-center">Mengerti</button>
        </div>
      </div>
    </Modal>
  );
};

/* ── Banner ajakan install (HP saja, bisa ditutup 14 hari) ── */

const readDismissed = () => { try { return Number(localStorage.getItem(BANNER_KEY) || 0); } catch { return 0; } };
const HIDE_BANNER_ON = ['/admin', '/onboarding', '/gabung', '/profil-belajar'];

const PwaInstallBanner = () => {
  const { installed, canPrompt, install, ios, mobile } = usePwaInstall();
  const path = useRoute();
  const [visible, setVisible] = useState(false);

  const hiddenHere = HIDE_BANNER_ON.some(p => path.startsWith(p));
  const eligible = mobile && !installed && (canPrompt || ios) && Date.now() - readDismissed() > BANNER_SNOOZE_MS;

  useEffect(() => {
    if (!eligible) { setVisible(false); return; }
    const t = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(t);
  }, [eligible]);

  if (!visible || hiddenHere) return null;

  const dismiss = () => {
    try { localStorage.setItem(BANNER_KEY, String(Date.now())); } catch {}
    setVisible(false);
  };
  const handleInstall = async () => {
    const accepted = await install();
    if (accepted || !canPrompt) setVisible(false);
  };

  return (
    <div className="fixed left-3 right-3 z-[95] sheet-enter md:hidden"
      style={{ bottom: 'calc(var(--tabbar-height, 0px) + var(--safe-bottom) + 12px)' }}>
      <div className="flex items-center gap-3 p-3 rounded-2xl border shadow-2xl"
        style={{ background: 'rgba(20,24,22,0.97)', borderColor: 'rgba(62,207,142,0.35)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <img src="/icons/icon-192.png" alt="" className="w-11 h-11 rounded-xl flex-shrink-0"/>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-ink leading-tight">Pasang aplikasi Talqeeh</div>
          <div className="text-[11px] text-ink-muted leading-snug">Buka lebih cepat dari layar utama, tanpa bilah browser.</div>
        </div>
        <button onClick={handleInstall} className="btn btn-primary text-xs px-3.5 py-2 flex-shrink-0" style={{ minHeight: 36 }}>Pasang</button>
        <button onClick={dismiss} aria-label="Tutup" className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-soft hover:bg-white/5 flex-shrink-0">
          <Icon name="x" className="w-4 h-4"/>
        </button>
      </div>
    </div>
  );
};

/* Dipasang sekali di App: banner + modal panduan. */
const PwaHost = () => {
  const [guideOpen, setGuideOpen] = useState(false);
  useEffect(() => {
    const open = () => setGuideOpen(true);
    window.addEventListener('talqeeh:pwa-guide', open);
    return () => window.removeEventListener('talqeeh:pwa-guide', open);
  }, []);
  return (
    <>
      <PwaInstallBanner/>
      <PwaGuideModal open={guideOpen} onClose={() => setGuideOpen(false)}/>
    </>
  );
};

Object.assign(window, { usePwaInstall, openPwaGuide, PwaHost });
