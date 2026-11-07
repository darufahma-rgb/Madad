import React, { useState, useEffect } from 'react';
/* Talqeeh — Admin: Program Mitra. Atur komisi & potongan, setujui pendaftar, lihat penjualan per mitra, dan tandai
   komisi sudah ditransfer. Server: action affiliate-* & save-settings (affiliateProgram) di api/admin-members.js. */

const mitraAdminCall = async (action, extra = {}) => {
  const r = await fetch('/api/admin-members', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': sessionStorage.getItem('talqee_admin_token') || '' },
    body: JSON.stringify({ action, ...extra }),
  });
  if (r.status === 401) { sessionStorage.removeItem('talqee_admin_token'); window.location.reload(); throw new Error('Sesi admin habis'); }
  let j = null;
  try { j = await r.json(); } catch {}
  if (!j || !j.ok) throw new Error((j && j.error) || `Gagal (status ${r.status})`);
  return j.data;
};

const STATUS_LABEL = {
  pending:   ['Menunggu', 'border-amber-400/40 text-amber-200'],
  approved:  ['Aktif', 'border-emerald-400/40 text-emerald-200'],
  rejected:  ['Ditolak', 'border-rose-400/40 text-rose-200'],
  suspended: ['Nonaktif', 'border-white/20 text-ink-muted'],
};
const FILTERS = [['all', 'Semua'], ['pending', 'Menunggu'], ['approved', 'Aktif'], ['unpaid', 'Ada komisi belum dibayar'], ['rejected', 'Ditolak'], ['suspended', 'Nonaktif']];

const MiniInput = ({ label, value, onChange, hint, mono }) => (
  <label className="block">
    <span className="block text-[11px] text-ink-muted mb-1">{label}</span>
    <input value={value} onChange={e => onChange(e.target.value)}
      className={`w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-emerald-400/50 ${mono ? 'font-mono' : ''}`}/>
    {hint && <span className="block text-[10px] text-ink-soft mt-1">{hint}</span>}
  </label>
);

const ProgramCard = ({ program, onSaved }) => {
  const toast = useToast();
  const [form, setForm] = useState({ open: program.open, percent: String(program.percent), discount: String(program.discount) });
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      await mitraAdminCall('save-settings', { row: { affiliateProgram: { open: form.open, percent: form.percent, discount: form.discount } } });
      toast.push('Pengaturan mitra disimpan.');
      onSaved();
    } catch (e) {
      toast.push(e.message);
    } finally {
      setBusy(false);
    }
  };
  const example = Math.max(0, (window.IMTIHAN_PRICE_IDR || 199000) - (Number(form.discount) || 0));
  return (
    <div className="card-glass p-5 space-y-4">
      <div>
        <div className="text-xs uppercase tracking-wider text-gold-400 mb-1">Program Mitra</div>
        <p className="text-[11px] text-ink-soft leading-relaxed">
          Mitra daftar di <span className="font-mono">#/mitra</span>, kamu setujui di bawah, lalu mereka membagikan <span className="font-mono">#/gabung?ref=kode</span>.
          Komisi dicatat per tagihan Paket Imtihan saat tagihan dibuat; tagihan lewat tautan kekeluargaan tidak diberi komisi mitra.
          Butuh <span className="font-mono">migrations/mitra.sql</span> sekali di Supabase.
        </p>
      </div>
      <div className="grid sm:grid-cols-3 gap-3 items-end">
        <MiniInput label="Komisi bawaan (%)" value={form.percent} mono onChange={v => setForm(f => ({ ...f, percent: v.replace(/\D/g, '') }))} hint="1–40. Bisa diganti per mitra."/>
        <MiniInput label="Potongan untuk pembeli (Rp)" value={form.discount} mono onChange={v => setForm(f => ({ ...f, discount: v.replace(/\D/g, '') }))} hint="0–50.000, dibulatkan ke ribuan."/>
        <label className="flex items-center gap-2 text-sm text-ink pb-2">
          <input type="checkbox" checked={form.open} onChange={e => setForm(f => ({ ...f, open: e.target.checked }))}/>
          Program dibuka
        </label>
      </div>
      <p className="text-[11px] text-ink-muted">
        Contoh harga normal: pembeli bayar {formatRupiah(example)}, komisi mitra {formatRupiah(Math.round(example * (Number(form.percent) || 0) / 100))}.
        Saat ditutup, pendaftaran baru, potongan, dan komisi baru berhenti; komisi yang sudah tercatat tetap ada.
      </p>
      <button onClick={save} disabled={busy} className={`btn btn-primary text-sm px-5 py-2 ${busy ? 'opacity-60' : ''}`}>{busy ? 'Menyimpan…' : 'Simpan pengaturan'}</button>
    </div>
  );
};

const AffiliateRow = ({ a, onChanged }) => {
  const toast = useToast();
  const [open, setOpen] = useState(a.status === 'pending');
  const [edit, setEdit] = useState({ commission_percent: a.commission_percent == null ? '' : String(a.commission_percent), admin_note: a.admin_note || '', slug: a.slug });
  const [busy, setBusy] = useState('');
  const run = async (key, fn, done) => {
    setBusy(key);
    try { await fn(); toast.push(done); onChanged(); }
    catch (e) { toast.push(e.message); }
    finally { setBusy(''); }
  };
  const update = (row, done) => run(Object.keys(row)[0], () => mitraAdminCall('affiliate-update', { code: a.member_code, row }), done);
  const payout = () => {
    if (!window.confirm(`Tandai komisi ${formatRupiah(a.unpaid)} untuk ${a.name} sudah ditransfer ke ${a.payout}?`)) return;
    run('payout', () => mitraAdminCall('affiliate-payout', { code: a.member_code }), 'Komisi ditandai sudah dibayar.');
  };
  const saveEdit = () => {
    const row = {};
    if (edit.commission_percent !== (a.commission_percent == null ? '' : String(a.commission_percent))) row.commission_percent = edit.commission_percent;
    if (edit.admin_note !== (a.admin_note || '')) row.admin_note = edit.admin_note;
    if (edit.slug !== a.slug) {
      if (!window.confirm(`Ganti kode tautan "${a.slug}" → "${edit.slug}"? Tautan lama berhenti berlaku; akun & komisi lama ikut pindah.`)) return;
      row.slug = edit.slug;
    }
    if (!Object.keys(row).length) return;
    run('edit', () => mitraAdminCall('affiliate-update', { code: a.member_code, row }), 'Data mitra disimpan.');
  };
  const [label, tone] = STATUS_LABEL[a.status] || STATUS_LABEL.pending;
  const wa = String(a.whatsapp || '').replace(/\D/g, '');
  return (
    <div className="rounded-xl border border-white/10 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <button type="button" onClick={() => setOpen(o => !o)} className="text-left min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-ink font-medium">{a.name}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full border ${tone}`}>{label}</span>
            <span className="font-mono text-xs text-ink-muted">{a.slug}</span>
          </div>
          <div className="text-[11px] text-ink-soft mt-0.5">{a.member_code} · daftar {new Date(a.created_at).toLocaleDateString('id-ID')} · komisi {a.percent}%</div>
        </button>
        <div className="flex gap-4 text-xs text-ink-muted tabular-nums">
          <span><b className="text-ink">{a.signups}</b> akun</span>
          <span><b className="text-ink">{a.sold}</b> terjual</span>
          <span>belum dibayar <b className="text-gold-200">{formatRupiah(a.unpaid)}</b></span>
        </div>
      </div>
      {open && (
        <div className="space-y-3 border-t border-white/10 pt-3">
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-ink-muted">
            <div>WhatsApp: {wa ? <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="text-emerald-300 underline underline-offset-2">{a.whatsapp}</a> : '—'}</div>
            <div>Rekening: <span className="text-ink">{a.payout}</span></div>
            <div className="sm:col-span-2">Cara mengajak: <span className="text-ink">{a.channel || '—'}</span></div>
            <div>Omzet: <span className="text-ink">{formatRupiah(a.gross)}</span></div>
            <div>Komisi total: <span className="text-ink">{formatRupiah(a.earned)}</span> · sudah dibayar {formatRupiah(a.paid)}</div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {a.status !== 'approved' && <button onClick={() => update({ status: 'approved' }, 'Mitra disetujui.')} disabled={!!busy} className="btn btn-primary text-xs px-3 py-1.5">{a.status === 'suspended' ? 'Aktifkan lagi' : 'Setujui'}</button>}
            {a.status === 'pending' && <button onClick={() => update({ status: 'rejected' }, 'Pendaftaran ditolak.')} disabled={!!busy} className="text-xs px-3 py-1.5 rounded-lg border border-rose-400/40 text-rose-200 hover:bg-rose-500/10">Tolak</button>}
            {a.status === 'approved' && <button onClick={() => update({ status: 'suspended' }, 'Mitra dinonaktifkan.')} disabled={!!busy} className="text-xs px-3 py-1.5 rounded-lg border border-white/20 text-ink-muted hover:bg-white/5">Nonaktifkan</button>}
            {a.unpaid > 0 && <button onClick={payout} disabled={!!busy} className="btn btn-gold text-xs px-3 py-1.5">Tandai {formatRupiah(a.unpaid)} sudah ditransfer</button>}
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <MiniInput label="Komisi khusus (%)" value={edit.commission_percent} mono onChange={v => setEdit(e => ({ ...e, commission_percent: v.replace(/\D/g, '') }))} hint="Kosong = bawaan program."/>
            <MiniInput label="Kode tautan" value={edit.slug} mono onChange={v => setEdit(e => ({ ...e, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}/>
            <MiniInput label="Catatan untuk mitra" value={edit.admin_note} onChange={v => setEdit(e => ({ ...e, admin_note: v }))} hint="Tampil di dasbor mitra saat ditolak/nonaktif."/>
          </div>
          <button onClick={saveEdit} disabled={!!busy} className="text-xs text-emerald-300 hover:text-emerald-200 underline underline-offset-2">{busy === 'edit' ? 'Menyimpan…' : 'Simpan perubahan'}</button>
        </div>
      )}
    </div>
  );
};

const AdminMitra = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const load = () => mitraAdminCall('affiliate-list').then(d => { setData(d); setError(''); }).catch(e => setError(e.message));
  useEffect(() => { load(); }, []);

  if (error) return <div className="card-glass p-6 text-sm text-amber-300">{error}</div>;
  if (!data) return <div className="card-glass p-6"><Skeleton lines={4}/></div>;
  const list = data.affiliates.filter(a => (filter === 'all' ? true : filter === 'unpaid' ? a.unpaid > 0 : a.status === filter));
  const sum = (k) => data.affiliates.reduce((n, a) => n + (a[k] || 0), 0);
  const pending = data.affiliates.filter(a => a.status === 'pending').length;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {[['Mitra aktif', data.affiliates.filter(a => a.status === 'approved').length], ['Menunggu disetujui', pending],
          ['Terjual lewat mitra', sum('sold')], ['Komisi belum dibayar', formatRupiah(sum('unpaid'))]].map(([l, v]) => (
          <div key={l} className="card-glass px-4 py-3"><div className="text-[11px] text-ink-muted">{l}</div><div className="font-display text-xl font-semibold text-ink">{v}</div></div>
        ))}
      </div>
      <ProgramCard program={data.program} onSaved={load}/>
      <div className="card-glass p-5 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm text-ink font-medium">Daftar mitra</div>
          <div className="flex gap-1 flex-wrap">
            {FILTERS.map(([id, l]) => (
              <button key={id} onClick={() => setFilter(id)}
                className={`px-2.5 py-1 rounded-lg text-xs border ${filter === id ? 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30' : 'text-ink-muted border-transparent hover:bg-white/5'}`}>{l}</button>
            ))}
          </div>
        </div>
        {!list.length && <p className="text-xs text-ink-muted">{data.affiliates.length ? 'Tidak ada mitra di filter ini.' : 'Belum ada yang mendaftar. Bagikan tautan talqeeh.id/#/mitra.'}</p>}
        {list.map(a => <AffiliateRow key={`${a.member_code}:${a.status}:${a.unpaid}`} a={a} onChanged={load}/>)}
      </div>
    </div>
  );
};

Object.assign(window, { AdminMitra });
