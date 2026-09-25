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
  // Memilih kotak juga membuka cabang-cabang di atasnya supaya kotak itu terlihat di peta.
  const select = (path) => {
    setSelected(cur => (cur === path ? null : path));
    setCollapsed(prev => {
      const n = new Set(prev);
      const parts = path.split('.');
      for (let i = 1; i < parts.length; i++) n.delete(parts.slice(0, i).join('.'));
      return n;
    });
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
  return (
    <div className="mm-item">
      <div role="button" tabIndex={0} onClick={() => ui.select(path)} onKeyDown={e => { if (e.key === 'Enter') ui.select(path); }}
        className={`mm-box mm-d${Math.min(depth, 2)} ${kids.length ? 'has-kids' : ''} ${selected ? 'is-selected' : ''} ${ui.dimmed(path) ? 'is-dim' : ''}`}
        style={{ '--c': color }}>
        <div className="mm-label">{node.label}</div>
        {node.ar && <div className="mm-ar" dir="rtl">{node.ar}</div>}
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

// Panel penjelasan kotak yang dipilih: jalur dari pusat, istilah Arab, keterangan, dan sub-cabangnya.
// floating = panel mengambang di atas peta (desktop & layar penuh); selain itu tampil di bawah peta/daftar.
const MindDetail = ({ root, path, onSelect, onClose, floating = false, renderNote = (t) => t }) => {
  const trail = mmTrail(root, path);
  const node = trail[trail.length - 1];
  if (!node) return null;
  const branchIndex = +path.split('.')[1];
  const color = path === '0' ? '#3ecf8e' : MM_COLORS[branchIndex % MM_COLORS.length];
  const parent = trail.length > 1 ? path.split('.').slice(0, -1).join('.') : null;
  return (
    <div className={floating ? 'mm-detail-float' : 'card-glass-strong p-4 md:p-5 mt-3'} style={{ borderLeft: `3px solid ${color}` }}
      onMouseDown={e => e.stopPropagation()}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 text-[11px] text-ink-soft min-w-0">
          {trail.map((n, i) => (
            <React.Fragment key={i}>
              {i > 0 && <Icon name="chevronRight" className="w-3 h-3 opacity-50"/>}
              <button onClick={() => onSelect(path.split('.').slice(0, i + 1).join('.'))}
                className={`truncate max-w-[160px] hover:text-ink ${i === trail.length - 1 ? 'text-ink' : ''}`}>{n.label}</button>
            </React.Fragment>
          ))}
        </div>
        <button onClick={onClose} aria-label="Tutup penjelasan" className="w-7 h-7 -mt-1 rounded-lg flex items-center justify-center text-ink-soft hover:bg-white/5 flex-shrink-0">
          <Icon name="x" className="w-4 h-4"/>
        </button>
      </div>
      <div className="font-display text-lg font-semibold text-ink mt-2 leading-snug">{node.label}</div>
      {node.ar && <div dir="rtl" className="text-gold-300 mt-1" style={{ fontFamily: '"Noto Naskh Arabic", serif', fontSize: 21, lineHeight: 1.9 }}>{node.ar}</div>}
      {node.note
        ? <p className="text-sm text-ink-muted leading-relaxed mt-2">{renderNote(node.note)}</p>
        : <p className="text-xs text-ink-soft mt-2">Tidak ada keterangan tambahan untuk bagian ini.</p>}
      {mmChildren(node).length > 0 && (
        <div className="mt-3">
          <div className="text-[11px] uppercase tracking-wider text-ink-soft mb-1.5">Terbagi menjadi</div>
          <div className="flex flex-wrap gap-1.5">
            {mmChildren(node).map((c, i) => (
              <button key={i} onClick={() => onSelect(`${path}.${i}`)}
                className="text-xs px-2.5 py-1 rounded-lg border border-white/10 bg-white/4 text-ink hover:border-white/25">{c.label}</button>
            ))}
          </div>
        </div>
      )}
      {parent && (
        <button onClick={() => onSelect(parent)} className="text-xs text-emerald-300 hover:text-emerald-200 mt-3 inline-flex items-center gap-1">
          <Icon name="chevronLeft" className="w-3.5 h-3.5"/> Naik ke "{trail[trail.length - 2].label}"
        </button>
      )}
    </div>
  );
};

const mindmapToMarkdown = (node, depth = 0) =>
  `${'  '.repeat(depth)}- **${node.label}**${node.ar ? ` — ${node.ar}` : ''}${node.note ? `: ${node.note}` : ''}\n` +
  mmChildren(node).map(c => mindmapToMarkdown(c, depth + 1)).join('');

const MM_ZOOM_MIN = 0.3;
const MM_ZOOM_MAX = 1.6;
const clampZoom = (z) => Math.min(MM_ZOOM_MAX, Math.max(MM_ZOOM_MIN, Math.round(z * 20) / 20));

/* Kanvas peta: bisa digeser dengan mouse, diperbesar, dan diberi lapisan (panel penjelasan) di atasnya. */
const MapCanvas = ({ root, ui, zoom, className = '', canvasClass = '', canvasRef, zoomRef, children }) => {
  const drag = useRef(null);
  const startDrag = (e) => {
    if (e.button !== 0 || e.target.closest('.mm-box, button')) return;
    const el = canvasRef.current;
    drag.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop };
    el.classList.add('is-dragging');
  };
  const moveDrag = (e) => {
    if (!drag.current) return;
    const el = canvasRef.current;
    el.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
    el.scrollTop = drag.current.top - (e.clientY - drag.current.y);
  };
  const endDrag = () => { drag.current = null; canvasRef.current?.classList.remove('is-dragging'); };
  return (
    <div className={`relative ${className}`}>
      <div ref={canvasRef} className={`mm-canvas ${canvasClass}`} onMouseDown={startDrag} onMouseMove={moveDrag} onMouseUp={endDrag} onMouseLeave={endDrag}>
        <div ref={zoomRef} className="mm-zoom" style={{ zoom }}>
          <MapNode node={root} path="0" depth={0} color="#3ecf8e" ui={ui}/>
        </div>
      </div>
      {children}
    </div>
  );
};

// Zoom supaya seluruh peta (yang sedang terbuka) muat di kanvas.
const fitZoom = (canvas, content, current) => {
  if (!canvas || !content) return current;
  const rect = content.getBoundingClientRect();
  const w = rect.width / current, h = rect.height / current;
  if (!w || !h) return current;
  return clampZoom(Math.min((canvas.clientWidth - 48) / w, (canvas.clientHeight - 48) / h, 1));
};

const ZoomControl = ({ zoom, setZoom, onFit }) => (
  <div className="inline-flex items-center rounded-lg border border-white/10 bg-white/4 flex-shrink-0">
    <button onClick={() => setZoom(z => clampZoom(z - 0.1))} className="w-8 h-8 text-ink-muted hover:text-ink" aria-label="Perkecil">−</button>
    <button onClick={() => setZoom(1)} className="text-[11px] text-ink-soft w-11 hover:text-ink" title="Ukuran normal">{Math.round(zoom * 100)}%</button>
    <button onClick={() => setZoom(z => clampZoom(z + 0.1))} className="w-8 h-8 text-ink-muted hover:text-ink" aria-label="Perbesar">+</button>
    {onFit && <button onClick={onFit} className="h-8 px-2.5 text-[11px] text-ink-muted hover:text-ink border-l border-white/10" title="Paskan seluruh peta ke layar">Paskan</button>}
  </div>
);

/* Layar penuh: fullscreen asli browser bila didukung (desktop/Android), selain itu lapisan penuh (iPhone). */
const MindFullscreen = ({ title, root, ui, selected, onSelect, onClearSelection, onClose, onExpandAll, onCollapseAll, showNotes, toggleNotes, renderNote }) => {
  const shellRef = useRef(null);
  const canvasRef = useRef(null);
  const zoomRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const native = useRef(false);
  const fit = () => setZoom(z => fitZoom(canvasRef.current, zoomRef.current, z));

  useEffect(() => {
    const el = shellRef.current;
    document.body.style.overflow = 'hidden';
    if (el?.requestFullscreen) el.requestFullscreen().then(() => { native.current = true; }).catch(() => {});
    const onChange = () => { if (native.current && !document.fullscreenElement) onClose(); };
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea')) return;
      if (e.key === 'Escape' && !document.fullscreenElement) onClose();
      else if (e.key === '+' || e.key === '=') setZoom(z => clampZoom(z + 0.1));
      else if (e.key === '-') setZoom(z => clampZoom(z - 0.1));
      else if (e.key === '0') setZoom(1);
      else if (e.key.toLowerCase() === 'f') fit();
    };
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('keydown', onKey);
    // Saat dibuka: paskan ke layar, tapi di HP jangan lebih kecil dari 60% supaya teks tetap terbaca (sisanya digeser).
    const t = setTimeout(() => setZoom(z => {
      const f = fitZoom(canvasRef.current, zoomRef.current, z);
      return window.innerWidth < 768 ? Math.max(f, 0.6) : f;
    }), 120);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = '';
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const close = () => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    onClose();
  };

  return createPortal(
    <div ref={shellRef} className="fixed inset-0 z-[130] flex flex-col" style={{ background: '#0b0b0b' }}>
      <div className="flex items-center gap-2 px-3 md:px-5 py-2.5 border-b border-white/[0.07] flex-wrap" style={{ paddingTop: 'max(10px, var(--safe-top))' }}>
        <Icon name="network" className="w-4 h-4 flex-shrink-0" style={{ stroke: '#3ecf8e' }}/>
        <div className="font-display text-sm md:text-base font-semibold text-ink truncate min-w-0 flex-1">{title}</div>
        <div className="flex items-center gap-2 order-3 md:order-none w-full md:w-auto overflow-x-auto no-scrollbar">
          <ZoomControl zoom={zoom} setZoom={setZoom} onFit={fit}/>
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
      <MapCanvas root={root} ui={ui} zoom={zoom} canvasRef={canvasRef} zoomRef={zoomRef}
        className="flex-1 min-h-0" canvasClass="mm-canvas-full">
        {selected && <MindDetail floating root={root} path={selected} onSelect={onSelect} onClose={onClearSelection} renderNote={renderNote}/>}
      </MapCanvas>
      <div className="hidden md:block px-5 py-1.5 text-[11px] text-ink-soft border-t border-white/[0.06]">
        Klik kotak untuk penjelasan · +N membuka cabang · seret untuk menggeser · tombol <span className="text-ink-muted">+ / − / F</span> untuk zoom & paskan · Esc untuk keluar
      </div>
    </div>,
    document.body
  );
};

export {
  MM_COLORS, mmChildren, mmCount, mmDefaultCollapsed, MapNode, MindDetail, mindmapToMarkdown,
  clampZoom, MapCanvas, fitZoom, ZoomControl, MindFullscreen, useMindmapUi,
};
