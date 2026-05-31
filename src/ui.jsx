import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
/* Talqih, Shared UI primitives (dark/premium) */


/* ---------------- Reveal on scroll (with safety fallback) ---------------- */
const Reveal = ({ as: As = "div", className = "", stagger = false, children, threshold = 0.18, delay = 0, ...rest }) => {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let done = false;
    const trigger = () => { if (!done) { done = true; setTimeout(() => setVis(true), delay); } };
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { trigger(); io.disconnect(); } }),
      { threshold }
    );
    io.observe(el);
    const fallback = setTimeout(trigger, 700);
    return () => { io.disconnect(); clearTimeout(fallback); };
  }, [delay, threshold]);
  const cls = (stagger ? "reveal-stagger " : "reveal ") + (vis ? "in " : "") + className;
  return <As ref={ref} className={cls} {...rest}>{children}</As>;
};

const WordReveal = ({ text, className = "", as: As = "h1" }) => {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let done = false;
    const trigger = () => { if (!done) { done = true; setVis(true); } };
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { trigger(); io.disconnect(); } }), { threshold: 0.2 });
    io.observe(el);
    const fallback = setTimeout(trigger, 500);
    return () => { io.disconnect(); clearTimeout(fallback); };
  }, []);
  const words = text.split(" ");
  return (
    <As ref={ref} className={"word-reveal " + (vis ? "in " : "") + className}>
      {words.map((w, i) => (
        <React.Fragment key={i}>
          <span>{w}</span>{i < words.length - 1 ? " " : ""}
        </React.Fragment>
      ))}
    </As>
  );
};

/* ---------------- Toast ---------------- */
const ToastCtx = createContext(null);
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, opts = {}) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, kind: opts.kind || "success", ...opts }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), opts.duration || 2400);
  }, []);
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed z-[100] bottom-5 right-5 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="toast-slide pointer-events-auto card-glass-strong shadow-glow px-4 py-3 flex items-center gap-3 min-w-[240px]">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center ${t.kind === "error" ? "bg-rose-600/20 text-rose-600" : "bg-emerald-500/20 text-emerald-300"}`}>
              <Icon name={t.kind === "error" ? "alert" : "check"} className="w-4 h-4" strokeWidth={2.2}/>
            </span>
            <span className="text-sm text-ink">{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};
const useToast = () => useContext(ToastCtx);

/* ---------------- Copy button ---------------- */
const CopyButton = ({ text, label = "Salin", className = "", variant = "ghost", fullLabel, onAfter }) => {
  const [done, setDone] = useState(false);
  const toast = useToast();
  const onClick = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
    }
    setDone(true);
    toast && toast.push(fullLabel || "Tersalin ke clipboard");
    onAfter && onAfter();
    setTimeout(() => setDone(false), 1500);
  };
  const styles = variant === "primary"
    ? "btn-primary"
    : variant === "gold"
    ? "btn-gold"
    : "btn-ghost";
  return (
    <button onClick={onClick} className={`btn ${styles} ${className} text-sm py-2 px-3`}>
      <Icon name={done ? "check" : "copy"} className="w-4 h-4" strokeWidth={done ? 2.4 : 1.8} />
      <span>{done ? "Tersalin" : label}</span>
    </button>
  );
};

/* ---------------- Modal ---------------- */
const Modal = ({ open, onClose, children, size = "lg", closable = true }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (closable && e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose, closable]);
  if (!open) return null;
  const w = size === "xl" ? "max-w-3xl" : size === "lg" ? "max-w-2xl" : size === "md" ? "max-w-md" : "max-w-lg";
  return (
    <div className="fixed inset-0 z-[90] modal-back bg-night-950/70 flex items-center justify-center p-4 sm:p-6" onClick={closable ? onClose : undefined}>
      <div className={`modal-pop card-glass-strong shadow-glass w-full ${w} max-h-[88vh] overflow-hidden flex flex-col`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

/* ---------------- Stars ---------------- */
const Stars = ({ value = 0, max = 5, className = "" }) => (
  <div className={`inline-flex items-center gap-0.5 ${className}`}>
    {Array.from({ length: max }).map((_, i) => (
      <svg key={i} viewBox="0 0 24 24" className="w-3.5 h-3.5" fill={i < value ? "#C9A86A" : "none"} stroke={i < value ? "#C9A86A" : "#5B5168"} strokeWidth="1.5">
        <path d="M12 3l2.7 5.6 6.3.9-4.5 4.4 1 6.1L12 17.3 6.5 20l1-6.1L3 9.5l6.3-.9z"/>
      </svg>
    ))}
  </div>
);

/* ---------------- Talqeeh Logo mark ---------------- */
const LogoMark = ({ size = 36, className = "" }) => (
  <span className={"inline-flex items-center justify-center " + className} style={{ width: size, height: size }}>
    <img src="/assets/talqeeh-logo.png" alt="Talqeeh" style={{ width: size, height: size, objectFit: "contain", mixBlendMode: "screen" }}/>
  </span>
);

/* ---------------- Decorative arabesque ornament ---------------- */
const Arch = ({ className = "", color = "rgba(212,165,116,0.25)" }) => (
  <svg viewBox="0 0 200 240" className={className} fill="none" stroke={color} strokeWidth="1">
    <path d="M20 240 L20 80 Q20 20 100 20 Q180 20 180 80 L180 240"/>
    <path d="M40 240 L40 92 Q40 36 100 36 Q160 36 160 92 L160 240"/>
    <circle cx="100" cy="60" r="6"/>
    <path d="M100 20 L100 60 M70 28 L100 60 L130 28"/>
  </svg>
);

/* ---------------- Glow blob ---------------- */
const Blob = ({ color = "rgba(62,207,142,0.38)", size = 400, top, left, right, bottom }) => (
  <div className="blob" style={{
    width: size, height: size, background: color, top, left, right, bottom
  }}/>
);

/* ---------------- Tool icon (real logo or brand monogram fallback) ---------------- */
const ToolIcon = ({ tool, size = "w-11 h-11", rounded = "rounded-xl", className = "" }) => {
  const bg = tool.brandColor || tool.color || "#7C4DFF";
  if (tool.logo) {
    const containerBg = tool.logoBg === "#FFFFFF"
      ? "#FFFFFF"
      : "rgba(14,10,26,0.85)";
    return (
      <span
        className={`${size} ${rounded} flex items-center justify-center overflow-hidden flex-shrink-0 ${className}`}
        style={{
          background: containerBg,
          boxShadow: "0 2px 12px rgba(0,0,0,0.35)",
        }}
      >
        <img
          src={tool.logo}
          alt={tool.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </span>
    );
  }
  return (
    <span
      className={`${size} ${rounded} flex items-center justify-center overflow-hidden flex-shrink-0 ${className}`}
      style={{
        background: `linear-gradient(135deg, ${bg}, ${bg}BB)`,
        boxShadow: `0 2px 12px ${bg}40, inset 0 1px 0 rgba(255,255,255,0.18)`,
      }}
    >
      <span className="text-sm font-bold text-white tracking-tight leading-none" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.35)" }}>{tool.monogram}</span>
    </span>
  );
};

/* ── Bottom Sheet (naik dari bawah di mobile, modal tengah di desktop) ── */
const BottomSheet = ({ children, onClose, title, maxHeight = "85vh" }) => (
  <div className="fixed inset-0 z-[70] flex items-end md:items-center md:justify-center" onClick={onClose}>
    <div className="absolute inset-0 bg-night-950/70 backdrop-blur-sm"/>
    <div
      className="relative w-full md:max-w-lg bg-night-800 border-t md:border rounded-t-3xl md:rounded-2xl sheet-enter overflow-hidden"
      style={{ maxHeight, paddingBottom: "var(--safe-bottom)", borderColor:"rgba(62,207,142,0.22)" }}
      onClick={e => e.stopPropagation()}
    >
      <div className="md:hidden flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 rounded-full bg-white/20"/>
      </div>
      {title && (
        <div className="px-5 py-3 border-b border-line flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
          <button onClick={onClose} className="text-ink-soft hover:text-ink w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5">
            <Icon name="x" className="w-4 h-4"/>
          </button>
        </div>
      )}
      <div className="overflow-y-auto scroll-touch px-2 py-3" style={{ maxHeight: "calc(" + maxHeight + " - 100px)" }}>
        {children}
      </div>
    </div>
  </div>
);

const SheetLink = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-ink-muted hover:text-ink hover:bg-white/5 transition-colors">
    <Icon name={icon} className="w-5 h-5 flex-shrink-0"/>
    <span className="text-sm font-medium">{label}</span>
  </button>
);

/* ============ EXPORTS ============ */
Object.assign(window, {
  Reveal, WordReveal,
  ToastProvider, useToast,
  CopyButton, Modal, Stars,
  LogoMark, Arch, Blob, ToolIcon,
  BottomSheet, SheetLink,
});
