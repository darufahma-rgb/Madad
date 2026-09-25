import React, { useState, useEffect, useMemo } from 'react';
/* Talqeeh — Admin: golden set & evaluasi AI Partner.
   Soal uji diperiksa asatidz → evaluasi menjalankan tugas persis seperti di aplikasi → skor per tugas & per model. */

const TASKS = {
  summary: { label: 'Ringkasan', color: '#3ecf8e', how: 'AI penguji: cakupan poin kunci, dikurangi kesalahan & kutipan palsu' },
  qa:      { label: 'Tanya tutor', color: '#60a5fa', how: 'AI penguji: cakupan poin jawaban, dikurangi kesalahan & kutipan palsu' },
  irab:    { label: "I'rab", color: '#c9a86a', how: "Pasti: kata kunci i'rab ditemukan di analisis kata yang tepat" },
  tasykil: { label: 'Harakat', color: '#a78bfa', how: 'Pasti: harakat per huruf dibanding kunci' },
  grade:   { label: 'Penilaian tahriri', color: '#f472b6', how: 'Pasti: nilai AI di dalam rentang asatidz (−25 per poin meleset)' },
};
const STATUS = {
  draft:    { label: 'Draft', cls: 'bg-amber-500/12 text-amber-300 border-amber-500/30' },
  verified: { label: 'Verified', cls: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/30' },
  archived: { label: 'Arsip', cls: 'bg-white/5 text-ink-soft border-white/10' },
};

const evalApi = async (action, payload = {}) => {
  try {
    const r = await fetch(`/api/ai-partner?action=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': sessionStorage.getItem('talqee_admin_token') || '' },
      body: JSON.stringify(payload),
    });
    return await r.json();
  } catch (e) {
    return { ok: false, error: e.message || 'Tidak bisa terhubung ke server' };
  }
};

// Jalankan fungsi async untuk tiap elemen dengan maksimal `n` sekaligus.
const pool = async (list, n, fn) => {
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, list.length) }, async () => {
    while (i < list.length) { const idx = i++; await fn(list[idx], idx); }
  }));
};

const scoreTone = (s) => (s == null ? 'text-ink-soft' : s >= 85 ? 'text-emerald-300' : s >= 65 ? 'text-amber-300' : 'text-rose-300');
const Score = ({ value, big }) => (
  <span className={`font-display font-semibold tabular-nums ${big ? 'text-2xl' : 'text-sm'} ${scoreTone(value)}`}>{value == null ? '—' : value}</span>
);
const TaskChip = ({ task }) => (
  <span className="text-[11px] px-2 py-0.5 rounded-full border whitespace-nowrap" style={{ color: TASKS[task]?.color, borderColor: `${TASKS[task]?.color}55`, background: `${TASKS[task]?.color}14` }}>
    {TASKS[task]?.label || task}
  </span>
);
const arStyle = { fontFamily: '"Noto Naskh Arabic", serif', fontSize: 18, lineHeight: 1.9 };
const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-ink text-sm outline-none focus:border-emerald-500/45';
const lines = (t) => (t || '').split('\n').map(s => s.trim()).filter(Boolean);

/* ── Editor soal uji ── */
const emptyItem = (task = 'qa') => ({ task, title: '', maddah: '', status: 'draft', reviewer: '', notes: '', input: {}, expected: {} });

const GoldenEditor = ({ initial, onClose, onSaved }) => {
  const toast = useToast();
  const [item, setItem] = useState(() => JSON.parse(JSON.stringify(initial)));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (patch) => setItem(it => ({ ...it, ...patch }));
  const setIn = (k, v) => setItem(it => ({ ...it, input: { ...it.input, [k]: v } }));
  const setEx = (k, v) => setItem(it => ({ ...it, expected: { ...it.expected, [k]: v } }));

  // Kata i'rab diedit sebagai baris "kata | kunci1, kunci2".
  const irabText = useMemo(() => (item.expected.kata || []).map(k => `${k.kata} | ${(k.kunci || []).join(', ')}`).join('\n'), []);
  const [irabRaw, setIrabRaw] = useState(irabText);

  const save = async () => {
    setSaving(true); setError('');
    const payload = { ...item };
    if (item.task === 'irab') {
      payload.expected = { kata: lines(irabRaw).map(l => { const [kata, kunci = ''] = l.split('|'); return { kata: kata.trim(), kunci: kunci.split(/[,،]/).map(s => s.trim()).filter(Boolean) }; }) };
    }
    const d = await evalApi('admin-golden-save', { item: payload });
    setSaving(false);
    if (!d.ok) { setError(d.error || 'Gagal menyimpan'); return; }
    toast.push('Soal uji tersimpan');
    onSaved(d.data);
  };

  const T = item.task;
  return (
    <Modal open onClose={onClose} size="xl">
      <div className="p-5 md:p-7 max-h-[88vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold text-ink">{item.id ? 'Ubah soal uji' : 'Soal uji baru'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center"><Icon name="x" className="w-4 h-4"/></button>
        </div>
        {!item.id && (
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(TASKS).map(([id, t]) => (
              <button key={id} onClick={() => setItem(emptyItem(id))}
                className={`text-xs px-3 py-1.5 rounded-lg border ${T === id ? 'text-ink' : 'text-ink-muted border-white/10'}`}
                style={T === id ? { borderColor: t.color, background: `${t.color}1a` } : {}}>{t.label}</button>
            ))}
          </div>
        )}
        <p className="text-[11px] text-ink-soft">Cara menilai: {TASKS[T].how}</p>
        <div className="grid md:grid-cols-3 gap-3">
          <label className="md:col-span-2 text-xs text-ink-muted">Judul
            <input className={`${inputCls} mt-1`} value={item.title} onChange={e => set({ title: e.target.value })} placeholder="mis. I'rab — إن الله غفور رحيم"/>
          </label>
          <label className="text-xs text-ink-muted">Maddah
            <input className={`${inputCls} mt-1`} value={item.maddah || ''} onChange={e => set({ maddah: e.target.value })} placeholder="nahwu, fiqh…"/>
          </label>
        </div>

        {(T === 'summary' || T === 'qa') && (<>
          <label className="block text-xs text-ink-muted">Materi (potongan diktat/kitab asli)
            <textarea dir="auto" rows={6} className={`${inputCls} mt-1`} value={item.input.materi || ''} onChange={e => setIn('materi', e.target.value)}/>
          </label>
          {T === 'qa' && (
            <label className="block text-xs text-ink-muted">Pertanyaan mahasiswa
              <input dir="auto" className={`${inputCls} mt-1`} value={item.input.pertanyaan || ''} onChange={e => setIn('pertanyaan', e.target.value)} placeholder="Tip: buat juga pertanyaan yang jawabannya TIDAK ada di materi"/>
            </label>
          )}
          <label className="block text-xs text-ink-muted">Poin kunci yang wajib ada di jawaban — satu per baris
            <textarea dir="auto" rows={5} className={`${inputCls} mt-1`} value={(item.expected.poin || []).join('\n')} onChange={e => setEx('poin', e.target.value.split('\n'))}/>
          </label>
        </>)}

        {T === 'irab' && (<>
          <label className="block text-xs text-ink-muted">Kalimat Arab
            <input dir="rtl" className={`${inputCls} mt-1`} style={arStyle} value={item.input.teks || ''} onChange={e => setIn('teks', e.target.value)}/>
          </label>
          <label className="block text-xs text-ink-muted">Kunci per kata — satu baris per kata: <span className="font-mono">kata | kunci1, kunci2</span>
            <textarea dir="rtl" rows={5} className={`${inputCls} mt-1`} style={arStyle} value={irabRaw} onChange={e => setIrabRaw(e.target.value)} placeholder="الحمد | مبتدأ، مرفوع"/>
            <span className="block text-[11px] text-ink-soft mt-1">Tulis istilah yang PASTI muncul di i'rab yang benar (mis. مبتدأ، خبر إن، منصوب). Harakat tidak perlu.</span>
          </label>
        </>)}

        {T === 'tasykil' && (<>
          <label className="block text-xs text-ink-muted">Teks gundul (tanpa harakat)
            <textarea dir="rtl" rows={3} className={`${inputCls} mt-1`} style={arStyle} value={item.input.teks || ''} onChange={e => setIn('teks', e.target.value)}/>
          </label>
          <label className="block text-xs text-ink-muted">Teks berharakat yang benar (kunci)
            <textarea dir="rtl" rows={3} className={`${inputCls} mt-1`} style={arStyle} value={item.expected.teks || ''} onChange={e => setEx('teks', e.target.value)}/>
            <span className="block text-[11px] text-ink-soft mt-1">Hanya huruf yang diberi harakat di kunci yang dinilai — huruf mad/alif tanpa harakat tidak dihitung.</span>
          </label>
        </>)}

        {T === 'grade' && (<>
          <div className="grid md:grid-cols-2 gap-3">
            <label className="text-xs text-ink-muted">Soal (Arab)
              <input dir="rtl" className={`${inputCls} mt-1`} style={arStyle} value={item.input.soal || ''} onChange={e => setIn('soal', e.target.value)}/>
            </label>
            <label className="text-xs text-ink-muted">Terjemah soal
              <input className={`${inputCls} mt-1`} value={item.input.soal_id || ''} onChange={e => setIn('soal_id', e.target.value)}/>
            </label>
          </div>
          <label className="block text-xs text-ink-muted">Poin kunci soal — satu per baris
            <textarea dir="auto" rows={3} className={`${inputCls} mt-1`} value={(item.input.poin || []).join('\n')} onChange={e => setIn('poin', e.target.value.split('\n'))}/>
          </label>
          <label className="block text-xs text-ink-muted">Jawaban model
            <textarea dir="auto" rows={2} className={`${inputCls} mt-1`} value={item.input.jawaban_model || ''} onChange={e => setIn('jawaban_model', e.target.value)}/>
          </label>
          <label className="block text-xs text-ink-muted">Jawaban mahasiswa yang dinilai
            <textarea dir="auto" rows={3} className={`${inputCls} mt-1`} value={item.input.jawaban || ''} onChange={e => setIn('jawaban', e.target.value)}/>
          </label>
          <div className="flex items-end gap-3">
            <label className="text-xs text-ink-muted">Nilai asatidz: min
              <input type="number" min={0} max={10} className={`${inputCls} mt-1 w-24`} value={item.expected.min ?? ''} onChange={e => setEx('min', e.target.value)}/>
            </label>
            <label className="text-xs text-ink-muted">max
              <input type="number" min={0} max={10} className={`${inputCls} mt-1 w-24`} value={item.expected.max ?? ''} onChange={e => setEx('max', e.target.value)}/>
            </label>
            <span className="text-[11px] text-ink-soft pb-3">dari 10</span>
          </div>
        </>)}

        <div className="grid md:grid-cols-3 gap-3 pt-2 border-t border-white/8">
          <label className="text-xs text-ink-muted">Status
            <select className={`${inputCls} mt-1`} value={item.status} onChange={e => set({ status: e.target.value })}>
              <option value="draft">Draft — belum diperiksa</option>
              <option value="verified">Verified — sudah diperiksa asatidz</option>
              <option value="archived">Arsip — tidak dipakai</option>
            </select>
          </label>
          <label className="text-xs text-ink-muted">Diperiksa oleh
            <input className={`${inputCls} mt-1`} value={item.reviewer || ''} onChange={e => set({ reviewer: e.target.value })} placeholder="mis. Ust. Fulan, Lc."/>
          </label>
          <label className="text-xs text-ink-muted">Catatan
            <input className={`${inputCls} mt-1`} value={item.notes || ''} onChange={e => set({ notes: e.target.value })}/>
          </label>
        </div>
        {error && <div className="text-sm text-rose-400">{error}</div>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost text-sm px-4 py-2">Batal</button>
          <button onClick={save} disabled={saving} className="btn btn-primary text-sm px-5 py-2">{saving ? 'Menyimpan…' : 'Simpan'}</button>
        </div>
      </div>
    </Modal>
  );
};

/* ── Rincian hasil satu soal ── */
const ResultDetail = ({ result, item }) => {
  const d = result.detail || {};
  const [showOutput, setShowOutput] = useState(false);
  let output = result.output;
  try { if (result.task === 'irab' || result.task === 'grade') output = JSON.stringify(JSON.parse(result.output), null, 2); } catch {}
  return (
    <div className="mt-3 space-y-3 text-sm">
      {result.error && <div className="text-rose-300">Gagal: {result.error}</div>}
      {result.task === 'tasykil' && d.huruf_dinilai != null && (<>
        <div className="text-ink-muted">{d.benar} dari {d.huruf_dinilai} huruf berharakat benar{d.huruf_berubah ? ' · ⚠ AI mengubah/menambah huruf' : ''}</div>
        <div className="grid md:grid-cols-2 gap-2">
          <div className="rounded-lg bg-white/3 p-3"><div className="text-[11px] text-ink-soft mb-1">Kunci</div><div dir="rtl" style={arStyle}>{item?.expected?.teks}</div></div>
          <div className="rounded-lg bg-white/3 p-3"><div className="text-[11px] text-ink-soft mb-1">Hasil AI</div><div dir="rtl" style={arStyle}>{result.output}</div></div>
        </div>
        {d.salah?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {d.salah.map((s, i) => <span key={i} className="text-xs px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/25" dir="rtl" style={{ fontFamily: '"Noto Naskh Arabic", serif' }}>{s.huruf}{s.kunci} → {s.ai === '(hilang)' ? '∅' : `${s.huruf}${s.ai || 'ـ'}`}</span>)}
          </div>
        )}
      </>)}
      {result.task === 'irab' && d.kata && (
        <div className="space-y-1.5">
          {d.kata.map((k, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <span dir="rtl" style={{ fontFamily: '"Noto Naskh Arabic", serif', fontSize: 17 }} className="text-gold-300 min-w-[70px]">{k.kata}</span>
              {k.found.map(f => <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/12 text-emerald-300" dir="rtl">✓ {f}</span>)}
              {k.missing.map(f => <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-rose-500/12 text-rose-300" dir="rtl">✗ {f}</span>)}
              {!k.ditemukan && <span className="text-[11px] text-ink-soft">(kata tidak dianalisis terpisah)</span>}
            </div>
          ))}
        </div>
      )}
      {result.task === 'grade' && d.rentang && (
        <div className="text-ink-muted">Nilai AI: <span className="text-ink font-semibold">{d.skor_ai ?? '—'}</span> · rentang asatidz {d.rentang[0]}–{d.rentang[1]}{d.selisih ? ` · meleset ${d.selisih}` : ' · ✓ sesuai'}</div>
      )}
      {(result.task === 'summary' || result.task === 'qa') && d.poin && (<>
        <div className="space-y-1">
          {d.poin.map((p, i) => (
            <div key={i} className="flex gap-2">
              <span className={p.ada ? 'text-emerald-300' : 'text-rose-300'}>{p.ada ? '✓' : '✗'}</span>
              <span className={p.ada ? 'text-ink' : 'text-ink-muted'}>{p.poin}{p.catatan && <span className="text-[11px] text-ink-soft"> — {p.catatan}</span>}</span>
            </div>
          ))}
        </div>
        {d.kesalahan?.length > 0 && (
          <div className="rounded-lg bg-rose-500/[0.07] border border-rose-500/25 p-3">
            <div className="text-xs text-rose-300 mb-1">Kesalahan / tidak ada di materi (−15 per poin)</div>
            <ul className="text-xs text-ink-muted space-y-0.5">{d.kesalahan.map((k, i) => <li key={i}>• {k}</li>)}</ul>
          </div>
        )}
        {d.kutipan?.total > 0 && (
          <div className="text-xs text-ink-muted">Kutipan: {d.kutipan.ok}/{d.kutipan.total} cocok dengan materi
            {d.kutipan.miss.map((q, i) => <div key={i} dir="auto" className="text-rose-300 mt-0.5">⚠ {q}</div>)}
          </div>
        )}
        {d.catatan && <div className="text-xs text-ink-soft italic">Penguji: {d.catatan}</div>}
      </>)}
      {output && (
        <div>
          <button onClick={() => setShowOutput(v => !v)} className="text-xs text-emerald-300 hover:text-emerald-200">{showOutput ? 'Sembunyikan' : 'Lihat'} jawaban AI lengkap</button>
          {showOutput && <pre dir="auto" className="mt-2 text-xs text-ink-muted whitespace-pre-wrap bg-black/30 rounded-lg p-3 max-h-80 overflow-y-auto">{output}</pre>}
        </div>
      )}
    </div>
  );
};

const RunDetail = ({ runId, onClose }) => {
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(null);
  useEffect(() => { evalApi('admin-eval-run', { run_id: runId }).then(setData); }, [runId]);
  if (!data) return <div className="card-glass p-6 text-sm text-ink-muted animate-pulse">Memuat hasil…</div>;
  if (!data.ok) return <div className="card-glass p-6 text-sm text-rose-400">{data.error}</div>;
  const itemById = Object.fromEntries((data.items || []).map(i => [i.id, i]));
  const sorted = [...data.results].sort((a, b) => (a.score ?? -1) - (b.score ?? -1));
  return (
    <div className="card-glass p-5 md:p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="font-display text-lg font-semibold text-ink">{data.run?.label || 'Hasil evaluasi'}</div>
          <div className="text-xs text-ink-soft">{new Date(data.run?.created_at).toLocaleString('id-ID')} · penguji: <span className="font-mono">{data.run?.judge_model}</span></div>
        </div>
        <button onClick={onClose} className="text-xs text-ink-soft hover:text-ink">Tutup</button>
      </div>
      <p className="text-[11px] text-ink-soft mb-3">Diurutkan dari skor terendah — mulai perbaikan dari atas.</p>
      <div className="space-y-2">
        {sorted.map(r => {
          const item = itemById[r.item_id];
          return (
            <div key={r.id} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
              <button onClick={() => setOpen(open === r.id ? null : r.id)} className="w-full flex items-center gap-3 text-left">
                <Score value={r.score}/>
                <TaskChip task={r.task}/>
                <span className="text-sm text-ink flex-1 min-w-0 truncate">{item?.title || r.item_id}</span>
                {item?.status === 'draft' && <span className="text-[10px] text-amber-300">draft</span>}
                <span className="text-[11px] text-ink-soft font-mono hidden md:inline">{r.model}</span>
                <span className="text-[11px] text-ink-soft">{r.ms ? `${(r.ms / 1000).toFixed(1)}dtk` : ''}</span>
                <Icon name={open === r.id ? 'chevronUp' : 'chevronDown'} className="w-4 h-4 opacity-50"/>
              </button>
              {open === r.id && <ResultDetail result={r} item={item}/>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Halaman utama ── */
const AdminEval = () => {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [runs, setRuns] = useState([]);
  const [missing, setMissing] = useState('');
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState({ task: 'all', status: 'all' });
  const [cfg, setCfg] = useState({ model: '', judge_model: '', include_drafts: true, label: '' });
  const [progress, setProgress] = useState(null);
  const [openRun, setOpenRun] = useState(null);

  const load = async () => {
    const [g, r] = await Promise.all([evalApi('admin-golden-list'), evalApi('admin-eval-runs')]);
    if (!g.ok) { setMissing(g.error || 'Gagal memuat'); setItems([]); return; }
    setMissing('');
    setItems(g.data);
    if (r.ok) setRuns(r.data);
  };
  useEffect(() => { load(); }, []);

  const counts = useMemo(() => {
    const c = { verified: 0, draft: 0, archived: 0 };
    (items || []).forEach(i => { c[i.status] = (c[i.status] || 0) + 1; });
    return c;
  }, [items]);
  const shown = (items || []).filter(i => (filter.task === 'all' || i.task === filter.task) && (filter.status === 'all' || i.status === filter.status));

  const seed = async () => {
    const d = await evalApi('admin-golden-seed');
    if (!d.ok) { toast.push(d.error || 'Gagal'); return; }
    toast.push(d.added ? `${d.added} contoh soal ditambahkan (draft)` : 'Contoh awal sudah ada semua');
    load();
  };
  const remove = async (item) => {
    if (!confirm(`Hapus soal uji "${item.title}"?`)) return;
    await evalApi('admin-golden-delete', { id: item.id });
    load();
  };
  const quickStatus = async (item, status) => {
    // Verifikasi harus jelas siapa pemeriksanya.
    const reviewer = window.prompt('Diperiksa oleh (nama ustadz/senior):', item.reviewer || '');
    if (reviewer === null) return;
    if (!reviewer.trim()) { toast.push('Isi nama pemeriksa dulu'); return; }
    const d = await evalApi('admin-golden-save', { item: { ...item, status, reviewer: reviewer.trim() } });
    if (!d.ok) { toast.push(d.error || 'Gagal'); return; }
    load();
  };

  const run = async () => {
    setOpenRun(null);
    setProgress({ done: 0, total: 1, phase: 'Menyiapkan…' });
    const s = await evalApi('admin-eval-start', cfg);
    if (!s.ok) { setProgress(null); toast.push(s.error || 'Gagal memulai'); return; }
    const judgedCount = s.items.filter(i => i.task === 'summary' || i.task === 'qa').length;
    const total = s.items.length + judgedCount + 1;
    let done = 0;
    const tick = (phase) => { done++; setProgress({ done, total, phase }); };
    const toJudge = [];
    await pool(s.items, 3, async (it) => {
      const d = await evalApi('admin-eval-item', { run_id: s.run.id, item_id: it.id });
      if (d.result?.needs_judge) toJudge.push(it);
      tick(`Menjalankan soal (${it.title})`);
    });
    await pool(toJudge, 3, async (it) => {
      await evalApi('admin-eval-judge', { run_id: s.run.id, item_id: it.id });
      tick(`AI penguji menilai (${it.title})`);
    });
    const f = await evalApi('admin-eval-finish', { run_id: s.run.id });
    tick('Selesai');
    setProgress(null);
    toast.push(f.ok ? `Evaluasi selesai — skor rata-rata ${f.avg_score ?? '—'}` : 'Evaluasi selesai');
    await load();
    setOpenRun(s.run.id);
  };

  const modelLabel = (r) => {
    const used = r.models_used || {};
    const uniq = [...new Set(Object.values(used))];
    return r.model ? r.model : uniq.length === 1 ? uniq[0] : 'Sesuai Settings (per tugas)';
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold text-ink mb-1">Evaluasi AI</h1>
        <p className="text-ink-muted max-w-3xl">
          Golden set: kumpulan soal uji yang kunci jawabannya diperiksa asatidz. Jalankan setiap kali mengganti model atau prompt —
          skornya menunjukkan apakah AI Partner makin akurat atau malah turun.
        </p>
      </div>

      {missing && <div className="card-glass p-4 mb-6 text-sm text-amber-300">{missing}</div>}

      {/* Jalankan */}
      <div className="card-glass-strong p-5 md:p-6 mb-8">
        <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">Jalankan evaluasi</div>
        <div className="grid md:grid-cols-3 gap-3 mb-3">
          <label className="text-xs text-ink-muted">Model yang diuji
            <input className={`${inputCls} mt-1 font-mono`} list="ai-model-suggestions" value={cfg.model} onChange={e => setCfg({ ...cfg, model: e.target.value })} placeholder="Kosong = sesuai Settings (produksi)"/>
          </label>
          <label className="text-xs text-ink-muted">Model penguji (ringkasan & tutor)
            <input className={`${inputCls} mt-1 font-mono`} list="ai-model-suggestions" value={cfg.judge_model} onChange={e => setCfg({ ...cfg, judge_model: e.target.value })} placeholder="Kosong = model utama"/>
          </label>
          <label className="text-xs text-ink-muted">Label (opsional)
            <input className={`${inputCls} mt-1`} value={cfg.label} onChange={e => setCfg({ ...cfg, label: e.target.value })} placeholder="mis. Coba model baru untuk i'rab"/>
          </label>
        </div>
        <datalist id="ai-model-suggestions">
          <option value="anthropic/claude-sonnet-4-6"/><option value="google/gemini-2.5-pro"/><option value="google/gemini-2.5-flash"/>
        </datalist>
        <div className="flex items-center gap-4 flex-wrap">
          <label className="text-sm text-ink-muted inline-flex items-center gap-2">
            <input type="checkbox" checked={cfg.include_drafts} onChange={e => setCfg({ ...cfg, include_drafts: e.target.checked })}/>
            Ikutkan soal draft ({counts.draft})
          </label>
          <span className="text-xs text-ink-soft">{counts.verified} soal verified</span>
          <button onClick={run} disabled={!!progress || !(items || []).length} className="btn btn-primary text-sm px-5 py-2.5 ms-auto">
            {progress ? 'Sedang berjalan…' : 'Jalankan evaluasi'}
          </button>
        </div>
        {progress && (
          <div className="mt-4">
            <div className="h-2 rounded-full bg-white/8 overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}/>
            </div>
            <div className="text-[11px] text-ink-soft mt-1.5 truncate">{progress.phase} · {progress.done}/{progress.total}</div>
          </div>
        )}
        {!cfg.include_drafts && counts.verified === 0 && (
          <p className="text-[11px] text-amber-300 mt-3">Belum ada soal verified. Minta asatidz memeriksa soal draft, atau centang "Ikutkan soal draft" untuk mencoba.</p>
        )}
      </div>

      {/* Riwayat */}
      <div className="mb-8">
        <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">Riwayat evaluasi</div>
        {runs.length === 0 ? (
          <div className="card-glass p-5 text-sm text-ink-muted">Belum ada evaluasi yang dijalankan.</div>
        ) : (
          <div className="card-glass overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead><tr className="text-[11px] uppercase tracking-wider text-ink-soft text-left border-b border-white/8">
                <th className="px-4 py-3 font-medium">Waktu</th><th className="px-3 py-3 font-medium">Model</th>
                {Object.entries(TASKS).map(([id, t]) => <th key={id} className="px-3 py-3 font-medium text-center">{t.label}</th>)}
                <th className="px-3 py-3 font-medium text-center">Rata-rata</th><th/>
              </tr></thead>
              <tbody>
                {runs.map(r => (
                  <tr key={r.id} className={`border-b border-white/5 ${openRun === r.id ? 'bg-emerald-500/[0.05]' : ''}`}>
                    <td className="px-4 py-3 text-ink-muted whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      {r.label && <div className="text-[11px] text-ink-soft">{r.label}</div>}
                      {r.include_drafts && <div className="text-[10px] text-amber-300">termasuk draft</div>}
                    </td>
                    <td className="px-3 py-3 font-mono text-[11px] text-ink-muted max-w-[200px] truncate" title={JSON.stringify(r.models_used)}>{modelLabel(r)}</td>
                    {Object.keys(TASKS).map(t => <td key={t} className="px-3 py-3 text-center"><Score value={r.scores?.[t]}/></td>)}
                    <td className="px-3 py-3 text-center"><Score value={r.avg_score}/>{r.status === 'running' && <div className="text-[10px] text-ink-soft">belum selesai</div>}</td>
                    <td className="px-3 py-3"><button onClick={() => setOpenRun(openRun === r.id ? null : r.id)} className="text-xs text-emerald-300 hover:text-emerald-200">{openRun === r.id ? 'Tutup' : 'Rincian'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {openRun && <div className="mt-4"><RunDetail runId={openRun} onClose={() => setOpenRun(null)}/></div>}
      </div>

      {/* Golden set */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <div className="text-xs uppercase tracking-wider text-gold-400">Soal uji ({(items || []).length})</div>
          <div className="flex gap-2 flex-wrap">
            <select className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-ink" value={filter.task} onChange={e => setFilter({ ...filter, task: e.target.value })}>
              <option value="all">Semua tugas</option>
              {Object.entries(TASKS).map(([id, t]) => <option key={id} value={id}>{t.label}</option>)}
            </select>
            <select className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-ink" value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
              <option value="all">Semua status</option>
              {Object.entries(STATUS).map(([id, s]) => <option key={id} value={id}>{s.label}</option>)}
            </select>
            <button onClick={seed} className="btn btn-ghost text-xs px-3 py-1.5">Muat contoh awal</button>
            <button onClick={() => setEditing(emptyItem())} className="btn btn-primary text-xs px-3 py-1.5"><Icon name="sparkles" className="w-3.5 h-3.5"/> Tambah soal</button>
          </div>
        </div>
        <div className="card-glass p-4 mb-3 text-xs text-ink-muted leading-relaxed">
          <span className="text-ink font-medium">Alur yang disarankan:</span> kumpulkan 20–30 potongan diktat asli dari berbagai maddah → tulis poin kunci/kunci jawaban →
          minta 1–2 asatidz atau senior memeriksa → ubah status ke <span className="text-emerald-300">Verified</span> dan isi nama pemeriksa.
          Skor resmi sebaiknya hanya dari soal verified.
        </div>
        {items === null ? (
          <div className="card-glass p-5 text-sm text-ink-muted animate-pulse">Memuat…</div>
        ) : shown.length === 0 ? (
          <div className="card-glass p-5 text-sm text-ink-muted">Belum ada soal uji. Tekan "Muat contoh awal" untuk mulai dari 15 contoh (draft), lalu tambahkan dari diktat Masisir.</div>
        ) : (
          <div className="space-y-2">
            {shown.map(it => (
              <div key={it.id} className="card-glass p-3.5 flex items-center gap-3 flex-wrap">
                <TaskChip task={it.task}/>
                <div className="flex-1 min-w-[200px]">
                  <div className="text-sm text-ink">{it.title}</div>
                  <div className="text-[11px] text-ink-soft">{it.maddah || '—'}{it.reviewer ? ` · diperiksa ${it.reviewer}` : ''}</div>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full border ${STATUS[it.status]?.cls}`}>{STATUS[it.status]?.label}</span>
                {it.status !== 'verified' && <button onClick={() => quickStatus(it, 'verified')} className="text-xs text-emerald-300 hover:text-emerald-200">Tandai verified</button>}
                <button onClick={() => setEditing(it)} className="text-xs text-ink-muted hover:text-ink">Ubah</button>
                <button onClick={() => remove(it)} className="text-xs text-ink-soft hover:text-rose-300">Hapus</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && <GoldenEditor initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }}/>}
    </div>
  );
};

window.AdminEval = AdminEval;
