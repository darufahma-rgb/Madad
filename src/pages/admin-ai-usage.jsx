import React, { useState, useEffect, useRef } from 'react';
/* Talqeeh — Admin: Pemakaian AI. Siapa yang memakai AI dan berapa biayanya, diperbarui otomatis.
   Data: action ai-usage di api/admin-members.js → api/_lib/ai-usage.js (tabel ai_cost_log, satu baris per panggilan model). */

const usageCall = async (range, code) => {
  const r = await fetch('/api/admin-members', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': sessionStorage.getItem('talqee_admin_token') || '' },
    body: JSON.stringify({ action: 'ai-usage', range, ...(code ? { code } : {}) }),
  });
  if (r.status === 401) { sessionStorage.removeItem('talqee_admin_token'); window.location.reload(); throw new Error('Sesi admin habis'); }
  let j = null;
  try { j = await r.json(); } catch {}
  if (!j || !j.ok) throw new Error((j && j.error) || `Gagal (status ${r.status})`);
  return j.data;
};

const RANGE_OPTIONS = [['1h', '1 jam'], ['today', 'Hari ini'], ['24h', '24 jam'], ['7d', '7 hari'], ['30d', '30 hari']];
const REFRESH_MS = 15000;

const kindLabel = (k) => window.AI_KIND_LABELS?.[k]?.label || k;
const kindColor = (k) => window.AI_KIND_LABELS?.[k]?.color || '#6b7280';
const usd = (n) => (n >= 1 ? `$${n.toFixed(2)}` : n >= 0.01 ? `$${n.toFixed(3)}` : n > 0 ? `$${n.toFixed(4)}` : '$0');
const shortModel = (m) => String(m || '').split('/').pop().replace(/-preview.*$/, '');
const ago = (iso) => {
  const s = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
  if (s < 60) return 'baru saja';
  if (s < 3600) return `${Math.floor(s / 60)} mnt lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  return `${Math.floor(s / 86400)} hari lalu`;
};
const clock = (iso) => new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' });

const who = (u) => u.code === 'ADMIN' ? 'Admin (tes & evaluasi)' : u.code === 'system' ? 'Sistem' : (u.name || u.email || u.code);
const Badge = ({ u }) => {
  if (u.code === 'ADMIN' || u.code === 'system') return null;
  const [label, cls] = u.imtihan ? ['Paket Imtihan', 'bg-amber-500/15 text-amber-200 border-amber-400/30']
    : u.ai ? ['AI Partner', 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30']
    : u.tier === 'free' ? ['Gratis', 'bg-white/5 text-ink-muted border-white/10']
    : ['Library', 'bg-sky-500/10 text-sky-200 border-sky-400/25'];
  return <span className={`text-[10px] px-1.5 py-0.5 rounded-md border whitespace-nowrap ${cls}`}>{label}</span>;
};

const KindBar = ({ byKind, total }) => (
  <div className="flex h-1.5 rounded-full overflow-hidden bg-white/5 mt-1.5">
    {Object.entries(byKind).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
      <div key={k} title={`${kindLabel(k)}: ${usd(v)}`} style={{ width: `${(v / Math.max(total, 1e-9)) * 100}%`, background: kindColor(k) }}/>
    ))}
  </div>
);

const AdminAiUsage = () => {
  const [range, setRange] = useState('today');
  const [live, setLive] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState(null);   // kode member yang aktivitasnya sedang dilihat
  const [showAll, setShowAll] = useState(false);
  const seen = useRef(new Set());
  const feedRef = useRef(null);
  const [fresh, setFresh] = useState(new Set());

  const load = async (r = range, f = focus) => {
    setLoading(true);
    try {
      const d = await usageCall(r, f);
      // Tandai panggilan yang baru muncul sejak pembaruan sebelumnya.
      const ids = new Set(d.feed.map(x => x.id));
      setFresh(seen.current.size ? new Set(d.feed.filter(x => !seen.current.has(x.id)).map(x => x.id)) : new Set());
      seen.current = ids;
      setData(d); setError('');
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { seen.current = new Set(); load(range, focus); }, [range, focus]);
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => { if (document.visibilityState === 'visible') load(); }, REFRESH_MS);
    return () => clearInterval(t);
  }, [live, range, focus]);
  const pick = (code) => {
    setFocus(f => f === code ? null : code);
    setTimeout(() => feedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const top = data?.top || [];
  const shown = showAll ? top : top.slice(0, 15);
  const feed = data?.feed || [];
  const focusUser = focus && top.find(u => u.code === focus);
  const maxCost = top[0]?.cost || 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Pemakaian AI</h2>
          <p className="text-sm text-ink-muted mt-1">Siapa yang memakai AI dan berapa biayanya. Biaya asli per panggilan dari OpenRouter.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-xl border border-white/10 overflow-hidden">
            {RANGE_OPTIONS.map(([id, label]) => (
              <button key={id} onClick={() => setRange(id)}
                className={`px-3 py-1.5 text-xs ${range === id ? 'bg-emerald-500/15 text-emerald-200' : 'text-ink-muted hover:text-ink'}`}>{label}</button>
            ))}
          </div>
          <button onClick={() => setLive(v => !v)} className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs ${live ? 'border-emerald-400/40 text-emerald-200' : 'border-white/10 text-ink-muted'}`}>
            <span className={`w-2 h-2 rounded-full ${live ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'}`}/>
            {live ? 'Live' : 'Jeda'}
          </button>
          <button onClick={() => load()} disabled={loading} className="btn btn-ghost !min-h-0 !py-1.5 !px-3 text-xs disabled:opacity-50">{loading ? 'Memuat…' : 'Muat ulang'}</button>
        </div>
      </div>

      {error && <div className="card-glass p-4 text-sm text-rose-300">{error}</div>}
      {!data && !error && <div className="card-glass p-6 text-sm text-ink-muted" role="status">Memuat pemakaian AI…</div>}

      {data && (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[['Total biaya', usd(data.total)], ['Panggilan AI', data.calls.toLocaleString('id-ID')], ['Pemakai', data.users.toLocaleString('id-ID')]].map(([l, v]) => (
              <div key={l} className="card-glass p-4">
                <div className="text-[11px] uppercase tracking-wider text-ink-muted">{l}</div>
                <div className="font-display text-xl md:text-2xl font-semibold text-ink num mt-1">{v}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-ink-soft -mt-2">
            Diperbarui {clock(data.generatedAt)}{live ? ', otomatis tiap 15 detik' : ''}. {data.capped ? 'Data dipotong di 50.000 panggilan terbaru.' : ''}
          </p>

          <section className="card-glass-strong p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg font-semibold text-ink">Pemakai terbesar</h3>
              <span className="text-[11px] text-ink-soft">Ketuk untuk lihat aktivitasnya</span>
            </div>
            {!top.length && <p className="text-sm text-ink-muted">Belum ada pemakaian AI di rentang ini.</p>}
            <div className="space-y-1.5">
              {shown.map((u, i) => (
                <button key={u.code} onClick={() => pick(u.code)}
                  className={`w-full text-left rounded-xl px-3 py-2.5 border transition ${focus === u.code ? 'border-emerald-400/40 bg-emerald-500/10' : 'border-transparent bg-white/3 hover:bg-white/6'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-ink-soft w-5 text-right num">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm text-ink truncate">{who(u)}</span>
                        <Badge u={u}/>
                      </div>
                      <div className="text-[11px] text-ink-soft truncate">
                        {u.email && u.name ? `${u.email} · ` : ''}{u.code} · {u.calls} panggilan · aktif {ago(u.lastAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-ink num">{usd(u.cost)}</div>
                      <div className="text-[10px] text-ink-soft num">{data.total ? Math.round((u.cost / data.total) * 100) : 0}%</div>
                    </div>
                  </div>
                  <div className="pl-8">
                    <div style={{ width: `${Math.max(4, (u.cost / Math.max(maxCost, 1e-9)) * 100)}%` }}><KindBar byKind={u.byKind} total={u.cost}/></div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                      {Object.entries(u.byKind).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => (
                        <span key={k} className="text-[10px] text-ink-muted flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: kindColor(k) }}/>{kindLabel(k)} {usd(v)}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {top.length > 15 && (
              <button onClick={() => setShowAll(v => !v)} className="text-xs text-emerald-300 mt-3">{showAll ? 'Tampilkan 15 teratas' : `Tampilkan semua (${top.length})`}</button>
            )}
          </section>

          <section ref={feedRef} className="card-glass-strong p-4 md:p-5 scroll-mt-24">
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <h3 className="font-display text-lg font-semibold text-ink">
                Aktivitas terbaru{focusUser ? `: ${who(focusUser)}` : ''}
              </h3>
              {focus && <button onClick={() => setFocus(null)} className="text-xs text-emerald-300">Tampilkan semua orang</button>}
            </div>
            {!feed.length && <p className="text-sm text-ink-muted">Belum ada aktivitas.</p>}
            <div className="divide-y divide-white/5">
              {feed.slice(0, 120).map(x => (
                <div key={x.id} className={`flex items-start gap-3 py-2 text-sm ${fresh.has(x.id) ? 'bg-emerald-500/10 -mx-2 px-2 rounded-lg' : ''}`}>
                  <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: kindColor(x.kind) }}/>
                  <div className="min-w-0 flex-1">
                    <div className="text-ink truncate">
                      {!focus && <><span className="font-medium">{x.code === 'ADMIN' ? 'Admin' : x.name || x.code}</span> · </>}
                      {kindLabel(x.kind)}{x.detail ? <span className="text-ink-muted"> ({x.detail})</span> : ''}
                    </div>
                    <div className="text-[11px] text-ink-soft truncate">
                      {clock(x.at)} · {shortModel(x.model)} · {(x.tokens_in || 0).toLocaleString('id-ID')} masuk / {(x.tokens_out || 0).toLocaleString('id-ID')} keluar{x.estimated ? ' · biaya ditaksir' : ''}
                    </div>
                  </div>
                  <span className="text-sm text-ink num flex-shrink-0">{usd(x.cost)}</span>
                </div>
              ))}
            </div>
            {feed.length > 120 && <p className="text-[11px] text-ink-soft mt-2">Menampilkan 120 panggilan terbaru.</p>}
          </section>
        </>
      )}
    </div>
  );
};

Object.assign(window, { AdminAiUsage });
