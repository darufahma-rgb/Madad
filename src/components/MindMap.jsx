import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
/* Talqeeh — peta konsep (mindmap) bersama: dipakai tab Peta Konsep di materi AI Partner
   dan grafik "mindmap" di jawaban Tanya AI. Gaya visual ada di index.css (kelas mm-*). */

const MM_COLORS = ['#3ecf8e', '#c9a86a', '#60a5fa', '#a78bfa', '#f472b6', '#f59e0b', '#2dd4bf'];
const mmChildren = (node) => (Array.isArray(node?.children) ? node.children : []);
const mmCount = (node) => mmChildren(node).reduce((n, c) => n + 1 + mmCount(c), 0);
const mmAt = (root, path) => path.split('.').slice(1).reduce((n, i) => mmChildren(n)[+i], root);
const mmTrail = (root, path) => {
  const parts = path.split('.');
  return parts.map((_, i) => mmAt(root, parts.slice(0, i + 1).join('.'))).filter(Boolean);
};
const mmColor = (path) => (path === '0' ? '#3ecf8e' : MM_COLORS[(+path.split('.')[1]) % MM_COLORS.length]);

// AI kadang menaruh teks Arab (mis. ayat) di label sekaligus di "ar" → tampilkan sekali saja, dengan huruf Arab.
const HAS_AR = /[؀-ۿ]/;
const HAS_LATIN = /[A-Za-z]/;
const arKey = (t) => String(t || '').replace(/[ً-ٰٟۖ-ۭـ\s.,،؛:()«»"'{}]/g, '');
const mmText = (node) => {
  const label = String(node?.label || '').trim();
  const ar = String(node?.ar || '').trim();
  const labelIsAr = HAS_AR.test(label) && !HAS_LATIN.test(label);
  if (labelIsAr && (!ar || arKey(label) === arKey(ar))) return { label: '', ar: ar || label };
  return { label, ar };
};
const mmTitle = (node) => { const t = mmText(node); return t.label || t.ar; };

// Awal: tampilkan 3 tingkat; cabang yang lebih dalam dilipat.
const mmDefaultCollapsed = (root) => {
  const out = new Set();
  const walk = (node, path, depth) => mmChildren(node).forEach((c, i) => {
    const p = `${path}.${i}`;
    if (depth + 1 >= 2 && mmChildren(c).length) out.add(p);
    walk(c, p, depth + 1);
  });
  walk(root, '0', 0);
  return out;
};

// Status peta bersama (lipat/buka cabang, kotak terpilih) untuk tampilan biasa dan layar penuh.
const useMindmapUi = (root, showNotes) => {
  const [collapsed, setCollapsed] = useState(() => (root ? mmDefaultCollapsed(root) : new Set()));
  const [selected, setSelected] = useState(null);
  useEffect(() => { if (root) { setCollapsed(mmDefaultCollapsed(root)); setSelected(null); } }, [root]);
  const toggle = (path) => setCollapsed(prev => { const n = new Set(prev); n.has(path) ? n.delete(path) : n.add(path); return n; });
  const openTo = (path) => setCollapsed(prev => {
    const n = new Set(prev);
    const parts = path.split('.');
    for (let i = 1; i < parts.length; i++) n.delete(parts.slice(0, i).join('.'));
    return n;
  });
  // Mengetuk kotak yang sama menutup penjelasannya; memilih dari panel (force) selalu membuka.
  const select = (path, force = false) => {
    setSelected(cur => (cur === path && !force ? null : path));
    openTo(path);
  };
  const expandAll = () => setCollapsed(new Set());
  const collapseAll = () => { setCollapsed(new Set(mmChildren(root).map((_, i) => `0.${i}`))); setSelected(null); };
  // Saat ada yang dipilih, kotak di luar jalurnya diredupkan supaya hubungan antar-konsep terlihat.
  const dimmed = (path) => !!selected && !(selected === path || selected.startsWith(`${path}.`) || path.startsWith(`${selected}.`));
  const ui = { collapsed, toggle, selected, select, showNotes, dimmed };
  return { ui, selected, setSelected, select, expandAll, collapseAll };
};

const MapNode = ({ node, path, depth, color, ui }) => {
  const kids = mmChildren(node);
  const folded = ui.collapsed.has(path);
  const selected = ui.selected === path;
  const t = mmText(node);
  return (
    <div className="mm-item">
      <div role="button" tabIndex={0} data-path={path} onClick={() => ui.select(path)} onKeyDown={e => { if (e.key === 'Enter') ui.select(path); }}
        className={`mm-box mm-d${Math.min(depth, 2)} ${kids.length ? 'has-kids' : ''} ${selected ? 'is-selected' : ''} ${ui.dimmed(path) ? 'is-dim' : ''}`}
        style={{ '--c': color }}>
        {t.label && <div className="mm-label">{t.label}</div>}
        {t.ar && <div className={`mm-ar ${t.label ? '' : 'mm-ar-only'}`} dir="rtl">{t.ar}</div>}
        {ui.showNotes && node.note && <div className="mm-note">{node.note}</div>}
        {kids.length > 0 && (
          <button className="mm-toggle" onClick={e => { e.stopPropagation(); ui.toggle(path); }}
            title={folded ? 'Buka cabang' : 'Tutup cabang'} aria-label={folded ? 'Buka cabang' : 'Tutup cabang'}>
            {folded ? `+${mmCount(node)}` : '−'}
          </button>
        )}
      </div>
      {kids.length > 0 && !folded && (
        <div className="mm-children" style={{ '--pc': color }}>
          {kids.map((k, i) => {
            const c = depth === 0 ? MM_COLORS[i % MM_COLORS.length] : color;
            return (
              <div key={i} className="mm-branch" style={{ '--c': c }}>
                <MapNode node={k} path={`${path}.${i}`} depth={depth + 1} color={c} ui={ui}/>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* Penjelasan kotak yang dipilih: jalur dari pusat, istilah Arab, keterangan, sub-cabang, dan navigasi.
   variant: 'panel' = halaman samping di layar penuh; 'float' = kartu di atas peta; 'card' = di bawah peta. */
const MindDetail = ({ root, path, onSelect, onClose, onFocus, variant = 'card', floating = false, renderNote = (t) => t }) => {
  const trail = mmTrail(root, path);
  const node = trail[trail.length - 1];
  if (!node) return null;
  const kind = floating ? 'float' : variant;
  const color = mmColor(path);
  const t = mmText(node);
  const parts = path.split('.');
  const parentPath = parts.length > 1 ? parts.slice(0, -1).join('.') : null;
  const parent = parentPath ? trail[trail.length - 2] : null;
  const index = +parts[parts.length - 1];
  const siblings = parent ? mmChildren(parent) : [];
  const go = (p) => { onSelect(p, true); onFocus?.(p); };
  const kids = mmChildren(node);
  const depthLabel = parts.length === 1 ? 'Topik utama' : parts.length === 2 ? 'Cabang utama' : `Sub-cabang tingkat ${parts.length - 1}`;

  return (
    <div className={`mm-detail mm-detail-${kind}`} style={{ '--c': color }} onPointerDown={e => e.stopPropagation()} onWheel={e => e.stopPropagation()}>
      <div className="mm-detail-head">
        <div className="flex items-center justify-between gap-2">
          <span className="mm-detail-kicker">{depthLabel}</span>
          <div className="flex items-center gap-1">
            {onFocus && (
              <button onClick={() => onFocus(path)} className="mm-icon-btn" title="Tunjukkan di peta" aria-label="Tunjukkan di peta">
                <Icon name="target" className="w-4 h-4"/>
              </button>
            )}
            <button onClick={onClose} className="mm-icon-btn" title="Tutup" aria-label="Tutup penjelasan">
              <Icon name="x" className="w-4 h-4"/>
            </button>
          </div>
        </div>
        {trail.length > 1 && (
          <div className="mm-crumbs">
            {trail.slice(0, -1).map((n, i) => (
              <React.Fragment key={i}>
                <button onClick={() => go(parts.slice(0, i + 1).join('.'))} className="mm-crumb">{mmTitle(n)}</button>
                <Icon name="chevronRight" className="w-3 h-3 opacity-40 flex-shrink-0"/>
              </React.Fragment>
            ))}
          </div>
        )}
        {t.label && <h3 className="mm-detail-title">{t.label}</h3>}
        {t.ar && <div dir="rtl" className={t.label ? 'mm-detail-ar' : 'mm-detail-ar mm-detail-ar-main'}>{t.ar}</div>}
      </div>

      <div className="mm-detail-body">
        {node.note ? (
          <div className="mm-detail-section">
            <div className="mm-detail-sub">Keterangan</div>
            <p className="text-[14px] text-ink-muted leading-relaxed">{renderNote(node.note)}</p>
          </div>
        ) : (
          <p className="text-xs text-ink-soft">Tidak ada keterangan tambahan untuk bagian ini.</p>
        )}

        {kids.length > 0 && (
          <div className="mm-detail-section">
            <div className="mm-detail-sub">Terbagi menjadi {kids.length}</div>
            <div className="flex flex-col gap-1.5">
              {kids.map((c, i) => {
                const ct = mmText(c);
                const n = mmCount(c);
                return (
                  <button key={i} onClick={() => go(`${path}.${i}`)} className="mm-kid">
                    <span className="mm-kid-num">{i + 1}</span>
                    <span className="flex-1 min-w-0 text-left">
                      {ct.label && <span className="block text-[13.5px] text-ink leading-snug">{ct.label}</span>}
                      {ct.ar && <span dir="rtl" className="block mm-kid-ar">{ct.ar}</span>}
                      {c.note && <span className="block text-[11.5px] text-ink-soft leading-snug mt-0.5 line-clamp-2">{c.note}</span>}
                    </span>
                    {n > 0 && <span className="text-[10.5px] text-ink-soft flex-shrink-0">+{n}</span>}
                    <Icon name="chevronRight" className="w-4 h-4 text-ink-soft flex-shrink-0"/>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {(parent || siblings.length > 1) && (
        <div className="mm-detail-foot">
          {parent ? (
            <button onClick={() => go(parentPath)} className="mm-foot-btn">
              <Icon name="chevronUp" className="w-3.5 h-3.5"/> <span className="truncate">{mmTitle(parent)}</span>
            </button>
          ) : <span/>}
          {siblings.length > 1 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <button disabled={index === 0} onClick={() => go(`${parentPath}.${index - 1}`)} className="mm-icon-btn" aria-label="Sebelumnya" title="Bagian sebelumnya">
                <Icon name="chevronLeft" className="w-4 h-4"/>
              </button>
              <span className="text-[11px] text-ink-soft tabular-nums">{index + 1}/{siblings.length}</span>
              <button disabled={index === siblings.length - 1} onClick={() => go(`${parentPath}.${index + 1}`)} className="mm-icon-btn" aria-label="Berikutnya" title="Bagian berikutnya">
                <Icon name="chevronRight" className="w-4 h-4"/>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const mindmapToMarkdown = (node, depth = 0) => {
  const t = mmText(node);
  return `${'  '.repeat(depth)}- **${t.label || t.ar}**${t.label && t.ar ? ` — ${t.ar}` : ''}${node.note ? `: ${node.note}` : ''}\n` +
    mmChildren(node).map(c => mindmapToMarkdown(c, depth + 1)).join('');
};

const MM_ZOOM_MIN = 0.2;
const MM_ZOOM_MAX = 2.5;
const clampZoom = (z) => Math.min(MM_ZOOM_MAX, Math.max(MM_ZOOM_MIN, z));

/* ── Kanvas bebas: geser (seret / satu jari), zoom (roda mouse, cubit dua jari, klik ganda) ──
   Posisi & zoom disimpan sebagai transform; induk mengendalikan lewat `view` dari useMapView(). */
const useMapView = () => {
  const [zoom, setZoomLabel] = useState(1);
  const ctl = useRef(null);
  return { zoom, ctl, onZoom: setZoomLabel };
};

const MapCanvas = ({ root, ui, view, mode = 'inline', minZoom = MM_ZOOM_MIN, inset = 0, insetBottom = 0, className = '', canvasClass = '', children }) => {
  const boxRef = useRef(null);
  const stageRef = useRef(null);
  const tf = useRef({ x: 24, y: 24, k: 1 });
  const gesture = useRef({ pointers: new Map(), start: null, moved: false });
  const suppressClick = useRef(false);
  // inset/insetBottom = lebar panel samping / tinggi lembar bawah yang menutupi kanvas.
  const insetRef = useRef({ right: inset, bottom: insetBottom });
  insetRef.current = { right: inset, bottom: insetBottom };

  const apply = (animate = false) => {
    const el = stageRef.current;
    if (!el) return;
    const { x, y, k } = tf.current;
    el.style.transition = animate ? 'transform .28s cubic-bezier(.2,.8,.2,1)' : 'none';
    el.style.transform = `translate(${x}px, ${y}px) scale(${k})`;
    view?.onZoom?.(k);
  };
  const zoomAt = (k, cx, cy, animate = false) => {
    const t = tf.current;
    const nk = clampZoom(k);
    t.x = cx - (cx - t.x) * (nk / t.k);
    t.y = cy - (cy - t.y) * (nk / t.k);
    t.k = nk;
    apply(animate);
  };
  const size = () => {
    const box = boxRef.current;
    return { w: (box?.clientWidth || 0) - insetRef.current.right, h: (box?.clientHeight || 0) - insetRef.current.bottom };
  };
  const center = () => { const { w, h } = size(); return [w / 2, h / 2]; };

  // Paskan seluruh peta yang sedang terbuka; `floor` menjaga teks tetap terbaca (sisanya digeser).
  const fit = (animate = true, floor = minZoom) => {
    const stage = stageRef.current;
    const { w, h } = size();
    if (!stage || !w || !h) return;
    const cw = stage.offsetWidth, ch = stage.offsetHeight;
    const pad = w < 500 ? 16 : 36;
    const fitK = Math.min((w - pad * 2) / cw, (h - pad * 2) / ch, 1);
    const k = clampZoom(Math.max(fitK, floor));
    tf.current = {
      k,
      x: cw * k <= w - pad * 2 ? (w - cw * k) / 2 : pad,
      y: (h - ch * k) / 2,
    };
    apply(animate);
  };

  // Geser supaya kotak tertentu terlihat (center = taruh di tengah; selain itu hanya bila tertutup/di luar layar).
  const focus = (path, { centerIt = true } = {}) => {
    const box = boxRef.current;
    const el = stageRef.current?.querySelector(`[data-path="${path}"]`);
    if (!box || !el) return;
    const b = box.getBoundingClientRect(), r = el.getBoundingClientRect();
    const { w, h } = size();
    const cx = r.left - b.left + r.width / 2, cy = r.top - b.top + r.height / 2;
    const margin = 24;
    const visible = r.left - b.left >= margin && r.right - b.left <= w - margin && r.top - b.top >= margin && r.bottom - b.top <= h - margin;
    if (!centerIt && visible) return;
    tf.current.x += w / 2 - cx;
    tf.current.y += h / 2 - cy;
    apply(true);
  };

  if (view) {
    view.ctl.current = {
      zoomBy: (f) => { const [cx, cy] = center(); zoomAt(tf.current.k * f, cx, cy, true); },
      reset: () => { const [cx, cy] = center(); zoomAt(1, cx, cy, true); },
      fit: (floor) => fit(true, floor),
      focus: (path, opts) => setTimeout(() => focus(path, opts), 40),
    };
  }

  // Awal & saat peta berganti: paskan (tanpa animasi).
  useEffect(() => {
    const t = setTimeout(() => fit(false), 30);
    return () => clearTimeout(t);
  }, [root]);

  // Roda mouse: di layar penuh roda = zoom, geser dua jari trackpad = geser peta.
  // Di dalam halaman, roda tetap menggulir halaman — zoom pakai Ctrl/⌘ + roda (atau cubit trackpad).
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const onWheel = (e) => {
      const b = box.getBoundingClientRect();
      const cx = e.clientX - b.left, cy = e.clientY - b.top;
      const mouseWheel = e.deltaMode === 1 || (e.deltaX === 0 && Math.abs(e.deltaY) >= 40 && Number.isInteger(e.deltaY));
      if (e.ctrlKey || e.metaKey || (mode === 'full' && mouseWheel)) {
        e.preventDefault();
        const step = e.ctrlKey && !mouseWheel ? e.deltaY * 0.01 : Math.sign(e.deltaY) * 0.18;
        zoomAt(tf.current.k * Math.exp(-step), cx, cy);
      } else if (mode === 'full') {
        e.preventDefault();
        tf.current.x -= e.deltaX;
        tf.current.y -= e.deltaY;
        apply();
      }
    };
    box.addEventListener('wheel', onWheel, { passive: false });
    return () => box.removeEventListener('wheel', onWheel);
  }, [mode]);

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.target.closest('.mm-detail, .mm-toggle')) return;
    const g = gesture.current;
    g.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...g.pointers.values()];
    const t = tf.current;
    if (pts.length === 1) {
      g.start = { mode: 'pan', x: e.clientX, y: e.clientY, tx: t.x, ty: t.y };
      g.moved = false;
    } else if (pts.length === 2) {
      const [a, b] = pts;
      g.start = { mode: 'pinch', d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, tx: t.x, ty: t.y, k: t.k };
      g.moved = true;
    }
  };
  const onPointerMove = (e) => {
    const g = gesture.current;
    if (!g.pointers.has(e.pointerId) || !g.start) return;
    g.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const t = tf.current;
    if (g.start.mode === 'pan' && g.pointers.size === 1) {
      const dx = e.clientX - g.start.x, dy = e.clientY - g.start.y;
      if (!g.moved && Math.hypot(dx, dy) < 5) return;
      if (!g.moved) {
        g.moved = true;
        boxRef.current?.classList.add('is-dragging');
        try { boxRef.current?.setPointerCapture(e.pointerId); } catch {}
      }
      t.x = g.start.tx + dx;
      t.y = g.start.ty + dy;
      apply();
    } else if (g.start.mode === 'pinch' && g.pointers.size >= 2) {
      const [a, b] = [...g.pointers.values()];
      const bx = boxRef.current.getBoundingClientRect();
      const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const k = clampZoom(g.start.k * d / g.start.d);
      // Titik di bawah jari tetap di bawah jari, sambil ikut bergeser bersama kedua jari.
      const ox = g.start.mx - bx.left, oy = g.start.my - bx.top;
      t.k = k;
      t.x = mx - bx.left - (ox - g.start.tx) * (k / g.start.k);
      t.y = my - bx.top - (oy - g.start.ty) * (k / g.start.k);
      apply();
    }
  };
  const onPointerUp = (e) => {
    const g = gesture.current;
    g.pointers.delete(e.pointerId);
    if (g.moved) suppressClick.current = true;
    if (g.pointers.size === 1) {
      // Dari cubit kembali ke satu jari: lanjut menggeser dari posisi sekarang.
      const [p] = [...g.pointers.values()];
      g.start = { mode: 'pan', x: p.x, y: p.y, tx: tf.current.x, ty: tf.current.y };
    } else if (g.pointers.size === 0) {
      g.start = null;
      boxRef.current?.classList.remove('is-dragging');
      setTimeout(() => { suppressClick.current = false; }, 0);
    }
  };
  // Seretan yang berakhir di atas kotak jangan dianggap ketukan.
  const onClickCapture = (e) => {
    if (suppressClick.current) { e.stopPropagation(); e.preventDefault(); suppressClick.current = false; }
  };
  const onDoubleClick = (e) => {
    if (e.target.closest('.mm-box, .mm-detail, button')) return;
    const b = boxRef.current.getBoundingClientRect();
    zoomAt(tf.current.k * 1.5, e.clientX - b.left, e.clientY - b.top, true);
  };

  return (
    <div className={`relative ${className}`}>
      <div ref={boxRef} className={`mm-canvas mm-canvas-${mode} ${canvasClass}`}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture} onDoubleClick={onDoubleClick}>
        <div ref={stageRef} className="mm-stage">
          <MapNode node={root} path="0" depth={0} color="#3ecf8e" ui={ui}/>
        </div>
      </div>
      {children}
    </div>
  );
};

const ZoomControl = ({ view, onFit }) => (
  <div className="inline-flex items-center rounded-lg border border-white/10 bg-white/4 flex-shrink-0">
    <button onClick={() => view.ctl.current?.zoomBy(1 / 1.25)} className="w-8 h-8 text-ink-muted hover:text-ink" aria-label="Perkecil">−</button>
    <button onClick={() => view.ctl.current?.reset()} className="text-[11px] text-ink-soft w-11 hover:text-ink tabular-nums" title="Ukuran normal (100%)">{Math.round(view.zoom * 100)}%</button>
    <button onClick={() => view.ctl.current?.zoomBy(1.25)} className="w-8 h-8 text-ink-muted hover:text-ink" aria-label="Perbesar">+</button>
    <button onClick={() => (onFit ? onFit() : view.ctl.current?.fit())} className="h-8 px-2.5 text-[11px] text-ink-muted hover:text-ink border-l border-white/10" title="Paskan seluruh peta ke layar (F)">Paskan</button>
  </div>
);

/* Layar penuh: fullscreen asli browser bila didukung (desktop/Android), selain itu lapisan penuh (iPhone).
   Penjelasan kotak tampil sebagai halaman samping (desktop) atau lembar bawah (HP). */
const PANEL_W = 400;
const MindFullscreen = ({ title, root, ui, selected, onSelect, onClearSelection, onClose, onExpandAll, onCollapseAll, showNotes, toggleNotes, renderNote }) => {
  const shellRef = useRef(null);
  const view = useMapView();
  const native = useRef(false);
  const narrow = typeof window !== 'undefined' && window.innerWidth < 768;
  const fitFloor = narrow ? 0.55 : MM_ZOOM_MIN;
  const fit = () => view.ctl.current?.fit(fitFloor);

  useEffect(() => {
    const el = shellRef.current;
    document.body.style.overflow = 'hidden';
    if (el?.requestFullscreen) el.requestFullscreen().then(() => { native.current = true; }).catch(() => {});
    const onChange = () => { if (native.current && !document.fullscreenElement) onClose(); };
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea')) return;
      if (e.key === 'Escape' && !document.fullscreenElement) onClose();
      else if (e.key === '+' || e.key === '=') view.ctl.current?.zoomBy(1.25);
      else if (e.key === '-') view.ctl.current?.zoomBy(1 / 1.25);
      else if (e.key === '0') view.ctl.current?.reset();
      else if (e.key.toLowerCase() === 'f') fit();
    };
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('keydown', onKey);
    const t = setTimeout(fit, 150);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = '';
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Kotak yang dipilih dari peta digeser masuk layar bila tertutup panel.
  useEffect(() => { if (selected) view.ctl.current?.focus(selected, { centerIt: false }); }, [selected]);

  const close = () => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    onClose();
  };
  const focusNode = (p) => view.ctl.current?.focus(p);

  return createPortal(
    <div ref={shellRef} className="fixed inset-0 z-[130] flex flex-col" style={{ background: '#0b0b0b' }}>
      <div className="flex items-center gap-2 px-3 md:px-5 py-2.5 border-b border-white/[0.07] flex-wrap" style={{ paddingTop: 'max(10px, var(--safe-top))' }}>
        <Icon name="network" className="w-4 h-4 flex-shrink-0" style={{ stroke: '#3ecf8e' }}/>
        <div className="font-display text-sm md:text-base font-semibold text-ink truncate min-w-0 flex-1">{title}</div>
        <div className="flex items-center gap-2 order-3 md:order-none w-full md:w-auto overflow-x-auto no-scrollbar">
          <ZoomControl view={view} onFit={fit}/>
          <button onClick={toggleNotes}
            className={`text-xs px-3 h-8 rounded-lg border inline-flex items-center gap-1.5 flex-shrink-0 ${showNotes ? 'border-emerald-500/40 bg-emerald-500/12 text-emerald-200' : 'border-white/10 bg-white/4 text-ink-muted hover:text-ink'}`}>
            <Icon name="info" className="w-3.5 h-3.5" style={{ stroke: 'currentColor' }}/> Keterangan
          </button>
          <button onClick={() => { onExpandAll(); setTimeout(fit, 60); }} className="text-xs px-3 h-8 rounded-lg border border-white/10 bg-white/4 text-ink-muted hover:text-ink flex-shrink-0">Buka semua</button>
          <button onClick={() => { onCollapseAll(); setTimeout(fit, 60); }} className="text-xs px-3 h-8 rounded-lg border border-white/10 bg-white/4 text-ink-muted hover:text-ink flex-shrink-0">Tutup semua</button>
        </div>
        <button onClick={close} aria-label="Keluar layar penuh" title="Keluar layar penuh (Esc)"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-ink hover:bg-white/10 border border-white/10 flex-shrink-0">
          <Icon name="x" className="w-4 h-4"/>
        </button>
      </div>
      <div className="flex-1 min-h-0 relative">
        <MapCanvas root={root} ui={ui} view={view} mode="full" inset={selected && !narrow ? PANEL_W : 0}
          insetBottom={selected && narrow ? Math.round(window.innerHeight * 0.55) : 0}
          className="h-full" canvasClass="mm-canvas-full"/>
        {selected && (
          <div className={narrow ? 'mm-sheet' : 'mm-side'} key={narrow ? 'sheet' : 'side'}>
            {narrow && <div className="mm-sheet-handle" onClick={onClearSelection}/>}
            <MindDetail variant="panel" root={root} path={selected} onSelect={onSelect} onClose={onClearSelection} onFocus={focusNode} renderNote={renderNote}/>
          </div>
        )}
      </div>
      <div className="hidden md:block px-5 py-1.5 text-[11px] text-ink-soft border-t border-white/[0.06]">
        Seret untuk menggeser · roda mouse / cubit trackpad untuk zoom · klik ganda untuk memperbesar · klik kotak untuk penjelasan · <span className="text-ink-muted">+ / − / F</span> · Esc untuk keluar
      </div>
    </div>,
    document.body
  );
};

export {
  MM_COLORS, mmChildren, mmCount, mmText, mmDefaultCollapsed, MapNode, MindDetail, mindmapToMarkdown,
  clampZoom, MapCanvas, useMapView, ZoomControl, MindFullscreen, useMindmapUi,
};
