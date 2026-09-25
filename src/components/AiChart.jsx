import { useState } from 'react';
/* Talqeeh — grafik di dalam jawaban AI.
   AI menulis blok ```grafik berisi JSON kecil; komponen ini menggambarnya (tanpa pustaka luar):
   - tree     : pohon taqsim          { root: { label, ar?, note?, children: [...] } }
   - flow     : alur/langkah          { steps: [{ label, ar?, note? }] }
   - timeline : urutan waktu          { items: [{ time, label, ar?, note? }] }
   - bar      : perbandingan angka    { items: [{ label, value }], unit? }
   - pie      : bagian dari keseluruhan (mis. faraidh) { items: [{ label, value }] } — value boleh "1/2" */

export const CHART_COLORS = ['#3ecf8e', '#c9a86a', '#60a5fa', '#a78bfa', '#f472b6', '#f59e0b', '#2dd4bf'];
const ARABIC = /[؀-ۿ]/;
const MAX_ITEMS = 14;
const MAX_DEPTH = 4;

const str = (v, n = 160) => (typeof v === 'string' ? v.trim().slice(0, n) : typeof v === 'number' ? String(v) : '');

// "1/2" → 0.5, "25%" → 25, 3 → 3
const toNumber = (v) => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : NaN;
  const s = str(v).replace(',', '.');
  const frac = s.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
  if (frac) return +frac[1] / +frac[2];
  return parseFloat(s.replace('%', ''));
};

const cleanNode = (n, depth = 0) => {
  if (!n || typeof n !== 'object') return null;
  const label = str(n.label, 120);
  if (!label) return null;
  const children = depth >= MAX_DEPTH || !Array.isArray(n.children) ? []
    : n.children.slice(0, MAX_ITEMS).map(c => cleanNode(c, depth + 1)).filter(Boolean);
  return { label, ar: str(n.ar, 120), note: str(n.note, 220), children };
};

// Validasi & rapikan spesifikasi dari AI; null kalau tidak bisa digambar.
export const parseChart = (raw) => {
  let spec;
  try { spec = JSON.parse(raw); } catch { return null; }
  if (!spec || typeof spec !== 'object') return null;
  const title = str(spec.title, 120);
  const type = spec.type;
  const list = (arr) => (Array.isArray(arr) ? arr.slice(0, MAX_ITEMS) : []);
  if (type === 'tree') {
    const root = cleanNode(spec.root);
    return root ? { type, title, root } : null;
  }
  if (type === 'flow') {
    const steps = list(spec.steps).map(s => ({ label: str(s?.label, 120), ar: str(s?.ar, 120), note: str(s?.note, 220) })).filter(s => s.label);
    return steps.length ? { type, title, steps } : null;
  }
  if (type === 'timeline') {
    const items = list(spec.items).map(s => ({ time: str(s?.time, 40), label: str(s?.label, 120), ar: str(s?.ar, 120), note: str(s?.note, 220) })).filter(s => s.label);
    return items.length ? { type, title, items } : null;
  }
  if (type === 'bar' || type === 'pie') {
    const items = list(spec.items).map(s => ({ label: str(s?.label, 80), value: toNumber(s?.value), display: str(s?.value, 20) }))
      .filter(s => s.label && Number.isFinite(s.value) && s.value >= 0);
    return items.length ? { type, title, items, unit: str(spec.unit, 20) } : null;
  }
  return null;
};

// Versi teks untuk Salin / Simpan ke Kurasah.
export const chartToMarkdown = (spec) => {
  if (!spec) return '';
  const head = spec.title ? `**${spec.title}**\n` : '';
  const withAr = (x) => `${x.label}${x.ar ? ` (${x.ar})` : ''}${x.note ? ` — ${x.note}` : ''}`;
  if (spec.type === 'tree') {
    const walk = (n, d) => `${'  '.repeat(d)}- ${withAr(n)}\n` + n.children.map(c => walk(c, d + 1)).join('');
    return head + walk(spec.root, 0);
  }
  if (spec.type === 'flow') return head + spec.steps.map((s, i) => `${i + 1}. ${withAr(s)}`).join('\n') + '\n';
  if (spec.type === 'timeline') return head + spec.items.map(s => `- ${s.time ? `**${s.time}** · ` : ''}${withAr(s)}`).join('\n') + '\n';
  return head + spec.items.map(s => `- ${s.label}: ${s.display || s.value}${spec.unit ? ` ${spec.unit}` : ''}`).join('\n') + '\n';
};

const Ar = ({ children, className = '' }) => children
  ? <div dir="rtl" className={`text-gold-300 ${className}`} style={{ fontFamily: '"Noto Naskh Arabic", Amiri, serif', lineHeight: 1.7, textAlign: 'left' }}>{children}</div>
  : null;

const Label = ({ text }) => ARABIC.test(text)
  ? <span dir="auto" style={{ fontFamily: '"Noto Naskh Arabic", Amiri, serif', fontSize: '1.08em' }}>{text}</span>
  : <span>{text}</span>;

/* ── Pohon taqsim: kotak bercabang dengan garis penghubung, bisa dibuka-tutup ── */
const TreeNode = ({ node, depth, color, last }) => {
  const [open, setOpen] = useState(depth < 2);
  const hasKids = node.children.length > 0;
  return (
    <div className="relative" style={{ paddingInlineStart: depth ? 22 : 0 }}>
      {depth > 0 && (
        <>
          <span className="absolute" style={{ insetInlineStart: 8, top: 0, bottom: last ? 'auto' : 0, height: last ? 22 : 'auto', borderInlineStart: '1.5px solid rgba(255,255,255,0.14)' }}/>
          <span className="absolute" style={{ insetInlineStart: 8, top: 22, width: 12, borderTop: '1.5px solid rgba(255,255,255,0.14)' }}/>
        </>
      )}
      <div className="py-1">
        <button type="button" onClick={() => hasKids && setOpen(o => !o)}
          className={`text-left rounded-xl px-3 py-2 border transition-colors max-w-full ${hasKids ? 'cursor-pointer hover:bg-white/[0.06]' : 'cursor-default'}`}
          style={{ borderColor: depth === 0 ? color : 'rgba(255,255,255,0.1)', background: depth === 0 ? `${color}1f` : 'rgba(255,255,255,0.03)', borderInlineStart: `3px solid ${color}` }}>
          <div className="flex items-center gap-2">
            <span className={`text-ink ${depth === 0 ? 'font-semibold' : 'font-medium'} text-[0.95em]`}><Label text={node.label}/></span>
            {hasKids && <span className="text-[11px] text-ink-soft flex-shrink-0">{open ? '▾' : `▸ ${node.children.length}`}</span>}
          </div>
          <Ar className="text-[1.02em]">{node.ar}</Ar>
          {node.note && <div className="text-[0.85em] text-ink-muted leading-snug mt-0.5">{node.note}</div>}
        </button>
      </div>
      {hasKids && open && node.children.map((c, i) => (
        <TreeNode key={i} node={c} depth={depth + 1} last={i === node.children.length - 1}
          color={depth === 0 ? CHART_COLORS[i % CHART_COLORS.length] : color}/>
      ))}
    </div>
  );
};

const Flow = ({ steps }) => (
  <div className="flex flex-col items-stretch">
    {steps.map((s, i) => (
      <div key={i}>
        <div className="flex gap-3 items-start rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0 mt-0.5"
            style={{ background: 'rgba(62,207,142,0.16)', color: '#6ee7b7', border: '1px solid rgba(62,207,142,0.35)' }}>{i + 1}</span>
          <div className="min-w-0">
            <div className="text-ink font-medium text-[0.95em]"><Label text={s.label}/></div>
            <Ar>{s.ar}</Ar>
            {s.note && <div className="text-[0.85em] text-ink-muted leading-snug mt-0.5">{s.note}</div>}
          </div>
        </div>
        {i < steps.length - 1 && <div className="text-center text-emerald-400/70 leading-none py-1" aria-hidden>↓</div>}
      </div>
    ))}
  </div>
);

const Timeline = ({ items }) => (
  <div className="relative" style={{ paddingInlineStart: 22 }}>
    <span className="absolute top-2 bottom-2" style={{ insetInlineStart: 6, borderInlineStart: '2px solid rgba(201,168,106,0.35)' }}/>
    {items.map((s, i) => (
      <div key={i} className="relative pb-3 last:pb-0">
        <span className="absolute w-3 h-3 rounded-full" style={{ insetInlineStart: -21, top: 6, background: '#c9a86a', boxShadow: '0 0 0 3px rgba(201,168,106,0.2)' }}/>
        {s.time && <div className="text-[0.8em] font-semibold tracking-wide text-gold-300">{s.time}</div>}
        <div className="text-ink font-medium text-[0.95em]"><Label text={s.label}/></div>
        <Ar>{s.ar}</Ar>
        {s.note && <div className="text-[0.85em] text-ink-muted leading-snug">{s.note}</div>}
      </div>
    ))}
  </div>
);

const Bars = ({ items, unit }) => {
  const max = Math.max(...items.map(s => s.value), 0) || 1;
  return (
    <div className="space-y-2.5">
      {items.map((s, i) => (
        <div key={i}>
          <div className="flex justify-between gap-3 text-[0.88em] mb-1">
            <span className="text-ink min-w-0"><Label text={s.label}/></span>
            <span className="text-ink-muted flex-shrink-0 tabular-nums">{s.display || s.value}{unit ? ` ${unit}` : ''}</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${Math.max(2, (s.value / max) * 100)}%`, background: CHART_COLORS[i % CHART_COLORS.length] }}/>
          </div>
        </div>
      ))}
    </div>
  );
};

const Pie = ({ items, unit }) => {
  const total = items.reduce((n, s) => n + s.value, 0) || 1;
  const R = 42, C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <svg viewBox="0 0 120 120" className="w-36 h-36 flex-shrink-0 -rotate-90" role="img" aria-label="Diagram lingkaran">
        <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="18"/>
        {items.map((s, i) => {
          const len = (s.value / total) * C;
          const el = <circle key={i} cx="60" cy="60" r={R} fill="none" stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth="18"
            strokeDasharray={`${Math.max(0, len - 1.2)} ${C}`} strokeDashoffset={-offset}/>;
          offset += len;
          return el;
        })}
      </svg>
      <div className="space-y-1.5 w-full min-w-0">
        {items.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-[0.88em]">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}/>
            <span className="text-ink flex-1 min-w-0"><Label text={s.label}/></span>
            <span className="text-ink-muted tabular-nums flex-shrink-0">
              {s.display || s.value}{unit ? ` ${unit}` : ''} · {Math.round((s.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AiChart({ raw, pending }) {
  if (pending) {
    return <div className="ai-chart my-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-6 text-center text-xs text-ink-soft animate-pulse">Menyiapkan grafik…</div>;
  }
  const spec = parseChart(raw);
  if (!spec) return null; // spesifikasi rusak: lewati saja, teks jawaban tetap tampil
  return (
    <figure className="ai-chart my-4 rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 md:p-4 overflow-x-auto" style={{ lineHeight: 1.5 }}>
      {spec.title && <figcaption className="text-[0.8em] uppercase tracking-wider text-ink-soft mb-3">{spec.title}</figcaption>}
      {spec.type === 'tree' && <TreeNode node={spec.root} depth={0} color={CHART_COLORS[0]} last/>}
      {spec.type === 'flow' && <Flow steps={spec.steps}/>}
      {spec.type === 'timeline' && <Timeline items={spec.items}/>}
      {spec.type === 'bar' && <Bars items={spec.items} unit={spec.unit}/>}
      {spec.type === 'pie' && <Pie items={spec.items} unit={spec.unit}/>}
    </figure>
  );
}
