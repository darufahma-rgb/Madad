import React, { useState, useEffect, useMemo } from 'react';
/* Talqeeh — Admin: Mutu Prompt (Fase 3).
   Tiga penjaga mutu prompt library:
   1. Rubrik otomatis — 8 kriteria "Standar mutu prompt Talqeeh", dihitung dari data prompt saat ini.
   2. Masukan pengguna — 👍/👎 "Prompt ini membantu?" dari kartu prompt, paling bermasalah di atas.
   3. Tinjauan asatidz — paket tinjauan per fakultas untuk diunduh, lalu hasilnya dicatat per maddah.
   Uji jawaban AI atas prompt ada di tab Evaluasi AI (tugas "Prompt Library"). */

const qualityApi = async (action, payload = {}) => {
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

const PQ_REASON_LABEL = {
  tidak_sesuai_maddah: 'Kurang cocok dengan maddah/bab', tidak_sesuai_ujian: 'Tidak mirip soal ujian',
  jawaban_ai_salah: 'Jawaban AI salah', bingung_isian: 'Bingung mengisi', terlalu_panjang: 'Terlalu panjang', lainnya: 'Lainnya',
};
const PQ_KIND_LABEL = { pahami: 'Pahami', hafal: 'Hafal', latihan: 'Latihan', ujian: 'Ujian', talaqqi: 'Talaqqi', eksplorasi: 'Eksplorasi', tabs: 'Program DL' };
const pqInput = 'w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-ink text-sm outline-none focus:border-emerald-500/45';
const pqTone = (s) => (s >= 95 ? 'text-emerald-300' : s >= 85 ? 'text-amber-300' : 'text-rose-300');
const STATUS_CHIP = {
  disetujui: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/30',
  perlu_revisi: 'bg-rose-500/12 text-rose-300 border-rose-500/30',
};

// Kelompok tinjauan: fakultas untuk kuliah, jenjang untuk Ma'had.
const reviewGroups = (report) => {
  const label = (id) => (window.FAKULTAS_LABEL || {})[id] || { dakwah: 'Fakultas Dakwah', mustawa: 'Darul Lughah (DL)', idad: "Ma'had — I'dadi", tsanawi: "Ma'had — Tsanawi" }[id] || id;
  const groups = new Map();
  for (const r of report) {
    const keys = r.source === 'mahad' ? (r.jenjang.length ? r.jenjang : ['idad']) : (r.fakultas.length ? r.fakultas : ['mustawa']);
    for (const k of keys) {
      if (!groups.has(k)) groups.set(k, { id: k, label: label(k), rows: [] });
      groups.get(k).rows.push(r);
    }
  }
  return [...groups.values()].sort((a, b) => a.label.localeCompare(b.label));
};

/* ── Paket tinjauan (Markdown) untuk asatidz ── */
const readableTemplate = (t) => (t || '')
  .replace(/\n*\[METODE\]\s*\[LEVEL_BAHASA\]\s*$/, '')
  .replace(/\[TINGKATAN\]/g, '«tingkat»').replace(/\[FAKULTAS\]/g, '«fakultas»').replace(/\[JURUSAN\]/g, '«, jurusan»')
  .replace(/\[GAYA_BELAJAR\]/g, '«gaya belajar»').replace(/\[MADDAH\]/g, '«nama maddah»').replace(/\[TOPIK\]/g, '«topik»');

const buildReviewPacket = (group) => {
  const sample = { level: '3', faculty: group.id, madzhab: '' };
  const central = typeof azharStandardBlock !== 'undefined' ? azharStandardBlock(sample, 'soal ujian') : '';
  const lines = [
    `# Paket Tinjauan Prompt Talqeeh — ${group.label}`,
    '',
    `Disiapkan ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}. Berisi ${group.rows.length} maddah dan ${group.rows.reduce((s, r) => s + r.total, 0)} prompt.`,
    '',
    '## Cara meninjau',
    '',
    '1. Baca prompt per maddah. Tanda «…» diisi otomatis dari profil pelajar; kurung [SEBUTKAN …] / [TEMPEL …] diisi pelajar sebelum menyalin.',
    '2. Nilai tiap maddah dengan 8 kriteria di tabel akhir maddah. Kriteria 3 (manhaj) dan isi ilmiah hanya bisa dinilai asatidz.',
    '3. Tulis keputusan: **Disetujui** atau **Perlu revisi** + nomor prompt dan catatannya.',
    '',
    '## Blok yang otomatis ditempel ke semua prompt',
    '',
    'Setiap prompt diakhiri penyesuaian gaya belajar dan bahasa sesuai tingkat pelajar, lalu blok standar berikut (bagian FORMAT SOAL hanya untuk prompt soal/ujian):',
    '',
    '```',
    central,
    '```',
    '',
    '## 8 kriteria mutu',
    '',
    ...(window.RUBRIC_CRITERIA || []).map(c => `${c.no}. ${c.label}`),
    '',
  ];
  for (const r of group.rows) {
    const m = (r.source === 'mahad' ? window.MAHAD_MADDAH : window.MADDAHS || []).find(x => x.id === r.id);
    lines.push('---', '', `## ${r.name}${m?.nameArabic ? ` — ${m.nameArabic}` : ''}`, '');
    if (m?.kitabUtama?.length) lines.push(`Kitab utama di aplikasi: ${m.kitabUtama.map(k => `${k.nama} (${k.penulis})`).join('; ')}`, '');
    lines.push(`Rubrik otomatis: ${r.layak}/${r.total} prompt layak terbit · skor ${r.score}/100`, '');
    r.prompts.forEach((p, i) => {
      lines.push(`### ${i + 1}. [${PQ_KIND_LABEL[p.kind] || p.kind}] ${p.title}`, '', '```', readableTemplate(p.template), '```', '');
    });
    lines.push(
      `### Lembar penilaian — ${r.name}`, '',
      '| Kriteria | Baik | Perlu perbaikan | Catatan |', '|---|---|---|---|',
      ...(window.RUBRIC_CRITERIA || []).map(c => `| ${c.no}. ${c.label} | ☐ | ☐ | |`),
      '', 'Keputusan: ☐ Disetujui   ☐ Perlu revisi', '', 'Prompt yang perlu direvisi (nomor + catatan):', '', '', 'Peninjau: ____________________   Tanggal: __________', '',
    );
  }
  return lines.join('\n');
};

const downloadText = (name, text) => {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

/* ── Catat hasil tinjauan ── */
const ReviewModal = ({ row, group, last, onClose, onSaved }) => {
  const toast = useToast();
  const [form, setForm] = useState({ reviewer: last?.reviewer || '', status: 'disetujui', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const save = async () => {
    setSaving(true); setError('');
    const d = await qualityApi('admin-prompt-review-save', {
      source: row.source, maddah_id: row.id, fakultas: group?.id || null, ...form, prompt_count: row.total, rubric_score: row.score,
    });
    setSaving(false);
    if (!d.ok) { setError(d.error || 'Gagal menyimpan'); return; }
    toast.push('Hasil tinjauan tersimpan');
    onSaved();
  };
  return (
    <Modal open onClose={onClose} size="md">
      <div className="p-5 md:p-7 space-y-4">
        <h3 className="font-display text-xl font-semibold text-ink">Catat tinjauan — {row.name}</h3>
        <label className="block text-xs text-ink-muted">Peninjau (ustadz/senior)
          <input className={`${pqInput} mt-1`} value={form.reviewer} onChange={e => setForm({ ...form, reviewer: e.target.value })} placeholder="mis. Ust. Fulan, Lc."/>
        </label>
        <div className="flex gap-2">
          {[['disetujui', 'Disetujui'], ['perlu_revisi', 'Perlu revisi']].map(([id, label]) => (
            <button key={id} onClick={() => setForm({ ...form, status: id })}
              className={`text-sm px-4 py-2 rounded-lg border ${form.status === id ? STATUS_CHIP[id] : 'border-white/10 text-ink-muted'}`}>{label}</button>
          ))}
        </div>
        <label className="block text-xs text-ink-muted">Catatan {form.status === 'perlu_revisi' ? '(wajib — nomor prompt & apa yang direvisi)' : '(opsional)'}
          <textarea dir="auto" rows={4} className={`${pqInput} mt-1`} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}/>
        </label>
        {error && <div className="text-sm text-rose-400">{error}</div>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost text-sm px-4 py-2">Batal</button>
          <button onClick={save} disabled={saving} className="btn btn-primary text-sm px-5 py-2">{saving ? 'Menyimpan…' : 'Simpan'}</button>
        </div>
      </div>
    </Modal>
  );
};

/* ── Rincian rubrik satu maddah ── */
const RubricDetail = ({ row }) => {
  const issues = row.prompts
    .map(p => ({ p, list: (window.RUBRIC_CRITERIA || []).map(c => ({ c, x: p.rubric.checks[c.id] })).filter(({ x }) => x.status === 'fail' || x.status === 'warn') }))
    .filter(x => x.list.length);
  if (!issues.length) return <div className="text-xs text-emerald-300 px-4 pb-4">Semua prompt lolos semua kriteria otomatis.</div>;
  return (
    <div className="px-4 pb-4 space-y-2">
      {issues.map(({ p, list }) => (
        <div key={`${p.kind}-${p.index}`} className="rounded-lg bg-white/[0.03] border border-white/8 p-2.5">
          <div className="text-xs text-ink"><span className="text-ink-soft">[{PQ_KIND_LABEL[p.kind] || p.kind}]</span> {p.title}</div>
          {list.map(({ c, x }) => (
            <div key={c.id} className={`text-[11px] mt-0.5 ${x.status === 'fail' ? 'text-rose-300' : 'text-amber-300'}`}>
              {x.status === 'fail' ? 'Gagal' : 'Saran'} · {c.no}. {c.label}: <span className="text-ink-muted">{x.note}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const AdminPromptQuality = () => {
  const toast = useToast();
  const report = useMemo(() => rubricReport(window.MADDAHS || [], window.MAHAD_MADDAH || []), []);
  const groups = useMemo(() => reviewGroups(report), [report]);
  const nameOf = useMemo(() => Object.fromEntries(report.map(r => [`${r.source}|${r.id}`, r.name])), [report]);
  const [tab, setTab] = useState('rubrik');
  const [filter, setFilter] = useState({ source: 'all', q: '', onlyIssues: false });
  const [open, setOpen] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [reviewMissing, setReviewMissing] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [days, setDays] = useState(90);
  const [groupId, setGroupId] = useState('');
  const [reviewing, setReviewing] = useState(null);

  const loadReviews = async () => {
    const d = await qualityApi('admin-prompt-reviews');
    if (!d.ok) { setReviewMissing(d.error || 'Gagal memuat'); setReviews([]); return; }
    setReviewMissing(''); setReviews(d.data);
  };
  const loadFeedback = async () => {
    setFeedback(null);
    const d = await qualityApi('admin-prompt-feedback', { days });
    setFeedback(d);
  };
  useEffect(() => { loadReviews(); }, []);
  useEffect(() => { if (tab === 'masukan') loadFeedback(); }, [tab, days]);

  // Tinjauan terbaru per maddah.
  const lastReview = useMemo(() => {
    const map = {};
    for (const r of reviews || []) { const k = `${r.source}|${r.maddah_id}`; if (!map[k]) map[k] = r; }
    return map;
  }, [reviews]);

  const all = report.flatMap(r => r.prompts);
  const approved = report.filter(r => lastReview[`${r.source}|${r.id}`]?.status === 'disetujui').length;
  const rows = report
    .filter(r => filter.source === 'all' || r.source === filter.source)
    .filter(r => !filter.q || r.name.toLowerCase().includes(filter.q.toLowerCase()) || r.id.includes(filter.q.toLowerCase()))
    .filter(r => !filter.onlyIssues || r.layak < r.total)
    .sort((a, b) => a.score - b.score);
  const group = groups.find(g => g.id === groupId) || null;

  const stat = (label, value, sub) => (
    <div className="card-glass p-4">
      <div className="text-[11px] uppercase tracking-wider text-ink-soft">{label}</div>
      <div className="font-display text-2xl font-semibold text-ink mt-1 tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-ink-soft mt-0.5">{sub}</div>}
    </div>
  );
  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} className={`px-3 py-1.5 rounded-lg text-sm ${tab === id ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/30' : 'text-ink-muted hover:text-ink'}`}>{label}</button>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-4xl font-semibold text-ink mb-1">Mutu Prompt</h1>
        <p className="text-ink-muted max-w-3xl">
          Syarat terbit prompt library: lolos rubrik otomatis, diuji di Evaluasi AI (tugas "Prompt Library"), dan ditinjau satu ustadz per fakultas.
          Masukan pengguna dipakai untuk perbaikan bulanan.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stat('Prompt', all.length.toLocaleString('id-ID'), `${report.length} maddah`)}
        {stat('Layak terbit', `${Math.round(all.filter(p => p.rubric.layak).length / all.length * 100)}%`, `${all.filter(p => p.rubric.layak).length} prompt tanpa kriteria gagal`)}
        {stat('Skor rubrik', Math.round(all.reduce((s, p) => s + p.rubric.score, 0) / all.length), 'rata-rata 0–100')}
        {stat('Disetujui asatidz', `${approved}/${report.length}`, 'maddah')}
      </div>

      <div className="flex gap-1 mb-4 flex-wrap">
        {tabBtn('rubrik', 'Rubrik otomatis')}
        {tabBtn('masukan', 'Masukan pengguna')}
        {tabBtn('tinjauan', 'Tinjauan asatidz')}
      </div>

      {tab === 'rubrik' && (<>
        <div className="flex gap-2 flex-wrap items-center mb-3">
          <select className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-ink" value={filter.source} onChange={e => setFilter({ ...filter, source: e.target.value })}>
            <option value="all">Kuliah & Ma'had</option><option value="kuliah">Kuliah</option><option value="mahad">Ma'had</option>
          </select>
          <input className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-ink w-48" placeholder="Cari maddah…" value={filter.q} onChange={e => setFilter({ ...filter, q: e.target.value })}/>
          <label className="text-xs text-ink-muted inline-flex items-center gap-1.5">
            <input type="checkbox" checked={filter.onlyIssues} onChange={e => setFilter({ ...filter, onlyIssues: e.target.checked })}/> Hanya yang belum layak
          </label>
          <span className="text-[11px] text-ink-soft ms-auto">Skrip yang sama: <span className="font-mono">npm run lint:prompts</span></span>
        </div>
        <div className="card-glass overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead><tr className="text-[11px] uppercase tracking-wider text-ink-soft text-left border-b border-white/8">
              <th className="px-4 py-3 font-medium">Maddah</th><th className="px-3 py-3 font-medium">Layak</th><th className="px-3 py-3 font-medium">Skor</th>
              <th className="px-3 py-3 font-medium">Gagal per kriteria</th><th className="px-3 py-3 font-medium">Tinjauan</th><th/>
            </tr></thead>
            <tbody>
              {rows.map(r => {
                const key = `${r.source}|${r.id}`;
                const rev = lastReview[key];
                const fails = (window.RUBRIC_CRITERIA || []).filter(c => r.per[c.id].fail);
                return (
                  <React.Fragment key={key}>
                    <tr className="border-b border-white/5">
                      <td className="px-4 py-2.5"><div className="text-ink">{r.name}</div><div className="text-[11px] text-ink-soft">{r.source === 'mahad' ? "Ma'had" : 'Kuliah'} · {r.id}</div></td>
                      <td className="px-3 py-2.5 tabular-nums text-ink-muted">{r.layak}/{r.total}</td>
                      <td className={`px-3 py-2.5 tabular-nums font-semibold ${pqTone(r.score)}`}>{r.score}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {fails.length ? fails.map(c => <span key={c.id} title={c.label} className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/12 text-rose-300">{c.no}. {c.label} ×{r.per[c.id].fail}</span>)
                            : <span className="text-[11px] text-emerald-300">—</span>}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">{rev ? <span className={`text-[11px] px-2 py-0.5 rounded-full border ${STATUS_CHIP[rev.status]}`} title={`${rev.reviewer} · ${new Date(rev.created_at).toLocaleDateString('id-ID')}`}>{rev.status === 'disetujui' ? 'Disetujui' : 'Perlu revisi'}</span> : <span className="text-[11px] text-ink-soft">belum</span>}</td>
                      <td className="px-3 py-2.5 text-right"><button onClick={() => setOpen(open === key ? null : key)} className="text-xs text-emerald-300 hover:text-emerald-200">{open === key ? 'Tutup' : 'Rincian'}</button></td>
                    </tr>
                    {open === key && <tr><td colSpan={6}><RubricDetail row={r}/></td></tr>}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </>)}

      {tab === 'masukan' && (<>
        <div className="flex gap-2 items-center mb-3">
          <select className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-ink" value={days} onChange={e => setDays(Number(e.target.value))}>
            <option value={30}>30 hari terakhir</option><option value={90}>90 hari terakhir</option><option value={365}>Setahun terakhir</option>
          </select>
          {feedback?.ok && <span className="text-xs text-ink-soft">{feedback.total} penilaian · {feedback.data.length} prompt</span>}
        </div>
        {!feedback ? <div className="card-glass p-5 text-sm text-ink-muted animate-pulse">Memuat…</div>
          : !feedback.ok ? <div className="card-glass p-4 text-sm text-amber-300">{feedback.error}</div>
          : feedback.data.length === 0 ? <div className="card-glass p-5 text-sm text-ink-muted">Belum ada masukan. Tombol "Prompt ini membantu?" muncul di kartu prompt setelah prompt disalin.</div>
          : (
            <div className="space-y-2">
              <p className="text-[11px] text-ink-soft">Urut dari 👎 terbanyak. Perbaiki prompt di atas dulu, lalu uji ulang di Evaluasi AI.</p>
              {feedback.data.map((f, i) => {
                const reasons = Object.entries(f.reasons).sort((a, b) => b[1] - a[1]);
                return (
                  <div key={i} className="card-glass p-3.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm tabular-nums text-emerald-300">👍 {f.up}</span>
                      <span className="text-sm tabular-nums text-rose-300">👎 {f.down}</span>
                      <div className="flex-1 min-w-[200px]">
                        <div className="text-sm text-ink">{f.title}</div>
                        <div className="text-[11px] text-ink-soft">{nameOf[`${f.source}|${f.maddah_id}`] || f.maddah_id} · {PQ_KIND_LABEL[f.kind] || f.kind} · terakhir {new Date(f.last).toLocaleDateString('id-ID')}</div>
                      </div>
                      <a href={`#/${f.source === 'mahad' ? 'mahad-maddah' : 'maddah'}/${f.maddah_id}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-300 hover:text-emerald-200">Buka maddah</a>
                    </div>
                    {reasons.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{reasons.map(([k, n]) => <span key={k} className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-200">{PQ_REASON_LABEL[k] || k} ×{n}</span>)}</div>}
                    {f.notes.length > 0 && <ul className="mt-2 space-y-0.5">{f.notes.map((n, j) => <li key={j} dir="auto" className="text-xs text-ink-muted">“{n}”</li>)}</ul>}
                  </div>
                );
              })}
            </div>
          )}
      </>)}

      {tab === 'tinjauan' && (<>
        {reviewMissing && <div className="card-glass p-4 mb-4 text-sm text-amber-300">{reviewMissing}</div>}
        <div className="card-glass p-4 mb-4 text-xs text-ink-muted leading-relaxed">
          <span className="text-ink font-medium">Alur:</span> pilih fakultas → unduh paket tinjauan (Markdown, bisa dibuka di HP atau dicetak) → kirim ke satu ustadz/senior fakultas itu →
          catat keputusannya per maddah di sini. Maddah "perlu revisi" diperbaiki, diuji ulang di Evaluasi AI, lalu ditinjau lagi.
        </div>
        <div className="flex gap-2 items-center flex-wrap mb-3">
          <select className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-sm text-ink" value={groupId} onChange={e => setGroupId(e.target.value)}>
            <option value="">— pilih fakultas / jenjang —</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.label} ({g.rows.length} maddah)</option>)}
          </select>
          {group && (
            <button onClick={() => { downloadText(`tinjauan-prompt-${group.id}.md`, buildReviewPacket(group)); toast.push('Paket tinjauan diunduh'); }}
              className="btn btn-primary text-xs px-3 py-2 inline-flex items-center gap-1.5"><Icon name="download" className="w-3.5 h-3.5"/> Unduh paket tinjauan</button>
          )}
        </div>
        {group && (
          <div className="space-y-2">
            {group.rows.map(r => {
              const history = (reviews || []).filter(x => x.source === r.source && x.maddah_id === r.id);
              const rev = history[0];
              return (
                <div key={`${r.source}|${r.id}`} className="card-glass p-3.5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <div className="text-sm text-ink">{r.name}</div>
                      <div className="text-[11px] text-ink-soft">{r.total} prompt · rubrik <span className={pqTone(r.score)}>{r.score}</span> · {r.layak}/{r.total} layak</div>
                    </div>
                    {rev
                      ? <span className={`text-[11px] px-2 py-0.5 rounded-full border ${STATUS_CHIP[rev.status]}`}>{rev.status === 'disetujui' ? 'Disetujui' : 'Perlu revisi'} · {rev.reviewer} · {new Date(rev.created_at).toLocaleDateString('id-ID')}</span>
                      : <span className="text-[11px] text-ink-soft">Belum ditinjau</span>}
                    <button onClick={() => setReviewing(r)} className="btn btn-ghost text-xs px-3 py-1.5">Catat tinjauan</button>
                  </div>
                  {rev?.notes && <div dir="auto" className="text-xs text-ink-muted mt-2 whitespace-pre-wrap">{rev.notes}</div>}
                  {history.length > 1 && <div className="text-[11px] text-ink-soft mt-1">{history.length - 1} tinjauan sebelumnya</div>}
                </div>
              );
            })}
          </div>
        )}
      </>)}

      {reviewing && <ReviewModal row={reviewing} group={group} last={lastReview[`${reviewing.source}|${reviewing.id}`]}
        onClose={() => setReviewing(null)} onSaved={() => { setReviewing(null); loadReviews(); }}/>}
    </div>
  );
};

window.AdminPromptQuality = AdminPromptQuality;
