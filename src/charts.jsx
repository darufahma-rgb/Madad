import React, { useState } from 'react';
/* Talqeeh — grafik SVG ringan (tanpa library) untuk analitik admin & statistik member */

const shortDay = (iso) => {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

// Batang bertumpuk per hari. data: [{ day, [key]: number }], series: [{ key, label, color }]
const BarChart = ({ data, series, height = 170, format = (v) => v.toLocaleString('id-ID') }) => {
  const [hover, setHover] = useState(null);
  const totals = data.map(d => series.reduce((s, x) => s + (d[x.key] || 0), 0));
  const max = Math.max(1, ...totals);
  const n = data.length;
  const gap = n > 45 ? 1 : 3;
  const labelEvery = Math.ceil(n / 6);
  const active = hover !== null ? data[hover] : null;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-2 flex-wrap min-h-[20px]">
        <div className="flex gap-3 flex-wrap">
          {series.map(s => (
            <span key={s.key} className="flex items-center gap-1.5 text-[11px] text-ink-muted">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }}/>{s.label}
            </span>
          ))}
        </div>
        {active && (
          <div className="text-[11px] text-ink">
            <span className="text-ink-soft">{shortDay(active.day)}: </span>
            {series.map(s => `${s.label} ${format(active[s.key] || 0)}`).join(' · ')}
          </div>
        )}
      </div>
      <div className="relative" style={{ height }} onMouseLeave={() => setHover(null)}>
        <div className="absolute inset-0 flex items-end" style={{ gap }}>
          {data.map((d, i) => (
            <div key={d.day} className="flex-1 h-full flex flex-col justify-end cursor-default"
              onMouseEnter={() => setHover(i)} onTouchStart={() => setHover(i)}>
              <div className={`w-full rounded-t-sm overflow-hidden flex flex-col-reverse ${hover === i ? 'opacity-100' : 'opacity-85'}`}
                style={{ height: `${(totals[i] / max) * 100}%`, minHeight: totals[i] ? 2 : 0 }}>
                {series.map(s => (
                  <div key={s.key} style={{ height: `${totals[i] ? ((d[s.key] || 0) / totals[i]) * 100 : 0}%`, background: s.color }}/>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex mt-1.5 text-[10px] text-ink-soft">
        {data.map((d, i) => (
          <div key={d.day} className="flex-1 text-center whitespace-nowrap overflow-visible">
            {i % labelEvery === 0 ? shortDay(d.day) : ''}
          </div>
        ))}
      </div>
    </div>
  );
};

// Garis + area. data: [{ day, value }]
const LineChart = ({ data, color = '#3ecf8e', height = 120, format = (v) => v.toLocaleString('id-ID') }) => {
  const [hover, setHover] = useState(null);
  const W = 600, H = 100;
  const max = Math.max(1, ...data.map(d => d.value));
  const x = (i) => data.length === 1 ? W / 2 : (i / (data.length - 1)) * W;
  const y = (v) => H - (v / max) * (H - 6) - 3;
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ');
  const area = `${line} L${x(data.length - 1)},${H} L${x(0)},${H} Z`;
  const active = hover !== null ? data[hover] : null;
  const gradId = `lg-${color.replace('#', '')}`;
  return (
    <div>
      <div className="text-[11px] text-ink min-h-[18px] mb-1">
        {active ? <><span className="text-ink-soft">{active.label || shortDay(active.day)}: </span>{format(active.value)}</> : null}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height }}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setHover(Math.max(0, Math.min(data.length - 1, Math.round(((e.clientX - r.left) / r.width) * (data.length - 1)))));
        }}>
        <defs>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        {data.length > 0 && <path d={area} fill={`url(#${gradId})`}/>}
        {data.length > 0 && <path d={line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke"/>}
        {active && <line x1={x(hover)} x2={x(hover)} y1="0" y2={H} stroke="rgba(255,255,255,0.25)" vectorEffect="non-scaling-stroke"/>}
      </svg>
    </div>
  );
};

// Daftar batang horizontal. items: [{ label, value, sub?, ar? }]
const HBarList = ({ items, color = '#3ecf8e', format = (v) => v.toLocaleString('id-ID'), empty = 'Belum ada data.' }) => {
  const max = Math.max(1, ...items.map(i => i.value));
  if (!items.length) return <div className="text-sm text-ink-muted py-4 text-center">{empty}</div>;
  return (
    <div className="space-y-2.5">
      {items.map((it, i) => (
        <div key={it.label + i}>
          <div className="flex items-baseline justify-between gap-3 text-sm mb-1">
            <span className="text-ink truncate">{it.label}{it.sub && <span className="text-ink-soft text-xs ml-2">{it.sub}</span>}</span>
            <span className="text-ink-muted text-xs flex-shrink-0">{format(it.value)}</span>
          </div>
          <div className="h-2 rounded-full bg-white/6 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(it.value / max) * 100}%`, background: color }}/>
          </div>
        </div>
      ))}
    </div>
  );
};

// Satu batang dibagi beberapa bagian. parts: [{ label, value, color }]
const ProportionBar = ({ parts }) => {
  const total = parts.reduce((s, p) => s + p.value, 0);
  return (
    <div>
      <div className="h-3 rounded-full bg-white/6 overflow-hidden flex">
        {total > 0 && parts.map(p => <div key={p.label} style={{ width: `${(p.value / total) * 100}%`, background: p.color }}/>)}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {parts.map(p => (
          <span key={p.label} className="flex items-center gap-1.5 text-xs text-ink-muted">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.color }}/>
            {p.label}: <span className="text-ink">{p.value.toLocaleString('id-ID')}</span>
            {total > 0 && <span className="text-ink-soft">({Math.round((p.value / total) * 100)}%)</span>}
          </span>
        ))}
      </div>
    </div>
  );
};

// Radar (jaring laba-laba). dims: [{ key, label }], values: { key: 0–100 }.
// progress 0–1 untuk animasi tumbuh dari tengah; highlight = key yang disorot.
const RadarChart = ({ dims, values, size = 320, color = '#3ecf8e', progress = 1, highlight = null }) => {
  const c = size / 2;
  const r = size / 2 - 52;
  const n = dims.length;
  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i, v) => [c + Math.cos(angle(i)) * r * v, c + Math.sin(angle(i)) * r * v];
  const ring = (f) => dims.map((_, i) => point(i, f).join(',')).join(' ');
  const shape = dims.map((d, i) => point(i, ((values?.[d.key] ?? 0) / 100) * progress).join(',')).join(' ');
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', maxWidth: size, height: 'auto', overflow: 'visible' }} role="img"
      aria-label={dims.map(d => `${d.label} ${values?.[d.key] ?? 0}`).join(', ')}>
      {[0.25, 0.5, 0.75, 1].map(f => (
        <polygon key={f} points={ring(f)} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1"/>
      ))}
      {dims.map((_, i) => {
        const [x, y] = point(i, 1);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="rgba(255,255,255,0.07)"/>;
      })}
      <polygon points={shape} fill={color} fillOpacity="0.22" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
      {dims.map((d, i) => {
        const [x, y] = point(i, ((values?.[d.key] ?? 0) / 100) * progress);
        return <circle key={d.key} cx={x} cy={y} r="4" fill={color}/>;
      })}
      {dims.map((d, i) => {
        const [x, y] = point(i, 1.2);
        const anchor = Math.abs(x - c) < 4 ? 'middle' : x > c ? 'start' : 'end';
        return (
          <text key={d.key} x={x} y={y} textAnchor={anchor} dominantBaseline="middle"
            fontSize="12" fontWeight="600" fill={highlight === d.key ? color : 'rgba(255,255,255,0.6)'}>
            {d.label}
          </text>
        );
      })}
    </svg>
  );
};

// Perubahan vs periode sebelumnya.
const Delta = ({ now, prev, invert = false }) => {
  if (!prev) return null;
  const pct = Math.round(((now - prev) / prev) * 100);
  if (!Number.isFinite(pct) || pct === 0) return <span className="text-[11px] text-ink-soft">sama seperti periode lalu</span>;
  const good = invert ? pct < 0 : pct > 0;
  return <span className={`text-[11px] ${good ? 'text-emerald-300' : 'text-rose-300'}`}>{pct > 0 ? '▲' : '▼'} {Math.abs(pct)}% vs periode lalu</span>;
};

Object.assign(window, { BarChart, LineChart, HBarList, ProportionBar, Delta, shortDay, RadarChart });
