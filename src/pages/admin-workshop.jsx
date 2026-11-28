import React, { useState, useEffect, useCallback } from 'react';
/* Talqeeh — Admin: Peserta Workshop "Menuju Imtihan" (halaman /event).
   Lihat pendaftar, tandai lunas pembayaran Pound Mesir, batalkan, dan unduh daftar hadir.
   Server: action event-list & event-set-status di api/admin-members.js (api/_lib/workshop.js). */

const workshopAdminCall = async (action, extra = {}) => {
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

const WS_STATUS = {
  paid:      ['Lunas', 'border-emerald-400/40 text-emerald-200 bg-emerald-500/10'],
  pending:   ['Belum bayar', 'border-amber-400/40 text-amber-200 bg-amber-500/10'],
  cancelled: ['Batal', 'border-white/15 text-ink-muted bg-white/4'],
};
const wsMoney = (r) => (r.currency === 'EGP' ? `${r.amount} LE` : `Rp${Number(r.amount).toLocaleString('id-ID')}`);
const wsTime = (iso) => (iso ? new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-');
const wsWaLink = (n) => `https://wa.me/${String(n || '').replace(/\D/g, '')}`;
const WS_VIA = { webhook: 'Mayar', status_check: 'Mayar', admin: 'Admin' };

const wsCsv = (rows) => {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const head = ['No', 'Nama', 'WhatsApp', 'Email', 'Kode member', 'Mata uang', 'Nominal', 'Status', 'Lunas lewat', 'Daftar', 'Lunas'];
  const body = rows.map((r, i) => [i + 1, r.name, r.whatsapp, r.email, r.member_code || '', r.currency, r.amount, (WS_STATUS[r.status] || [r.status])[0], WS_VIA[r.paid_via] || '', r.created_at, r.paid_at || '']);
  return [head, ...body].map(line => line.map(esc).join(',')).join('\n');
};

const AdminWorkshop = () => {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    try { setData(await workshopAdminCall('event-list')); setError(''); }
    catch (e) { setError(e.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const setStatus = async (row, status) => {
    const ask = status === 'paid' ? `Tandai ${row.name} LUNAS (${wsMoney(row)})?` : status === 'cancelled' ? `Batalkan pendaftaran ${row.name}? Kursinya dilepas.` : `Kembalikan ${row.name} ke "belum bayar"?`;
    if (!window.confirm(ask)) return;
    setBusyId(row.id);
    try {
      const saved = await workshopAdminCall('event-set-status', { id: row.id, status });
      setData(d => ({ ...d, rows: d.rows.map(r => (r.id === saved.id ? saved : r)) }));
      toast.push('Tersimpan');
      load();
    } catch (e) { toast.push(e.message); }
    setBusyId(null);
  };

  const download = () => {
    const blob = new Blob([`﻿${wsCsv(shown)}`], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'peserta-workshop-menuju-imtihan.csv'; a.click();
    URL.revokeObjectURL(a.href);
  };

  if (error) return <div className="card-glass p-6 text-sm text-rose-400">{error}</div>;
  if (!data) return <div className="card-glass p-6 text-sm text-ink-muted">Memuat peserta…</div>;
  if (!data.ready) {
    return (
      <div className="card-glass p-6">
        <div className="font-display text-lg font-semibold text-ink mb-1">Tabel pendaftaran belum ada</div>
        <p className="text-sm text-ink-muted">Jalankan <code>migrations/event_registrations.sql</code> di Supabase SQL Editor, lalu muat ulang halaman ini.</p>
      </div>
    );
  }

  const s = data.summary;
  const shown = data.rows.filter(r => filter === 'all' || r.status === filter);
  const stats = [
    ['Lunas', `${s.paid} / ${s.quota}`],
    ['Belum bayar', `${s.pending}`, `${s.holding} masih memegang kursi`],
    ['Masuk (Rupiah)', `Rp${s.idr.toLocaleString('id-ID')}`],
    ['Masuk (Pound Mesir)', `${s.egp} LE`],
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">Peserta Workshop</h2>
        <p className="text-sm text-ink-muted mt-1">Menuju Imtihan: Belajar Efektif dengan AI · Senin, 7 Desember 2026 · halaman <code>/event</code></p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(([label, value, sub]) => (
          <div key={label} className="card-glass p-4">
            <div className="text-[11px] uppercase tracking-wider text-gold-400">{label}</div>
            <div className="font-display text-xl font-semibold text-ink mt-1">{value}</div>
            {sub && <div className="text-xs text-ink-muted mt-0.5">{sub}</div>}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-white/10 bg-white/4 p-1 gap-1">
          {[['all', `Semua (${data.rows.length})`], ['paid', `Lunas (${s.paid})`], ['pending', `Belum bayar (${s.pending})`], ['cancelled', `Batal (${s.cancelled})`]].map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)} className={`text-xs px-3 py-1.5 rounded-lg ${filter === id ? 'bg-emerald-500/20 text-emerald-200' : 'text-ink-muted hover:text-ink'}`}>{label}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="text-xs px-3 py-2 rounded-lg border border-white/10 text-ink-muted hover:text-ink">Muat ulang</button>
          <button onClick={download} disabled={!shown.length} className="text-xs px-3 py-2 rounded-lg border border-white/10 text-ink-muted hover:text-ink disabled:opacity-50">Unduh CSV</button>
        </div>
      </div>
      <p className="text-xs text-ink-soft">Pembayaran Rupiah lewat Mayar lunas sendiri. Pembayaran Pound Mesir ditandai lunas di sini setelah uangnya diterima panitia.</p>

      {shown.length === 0 ? (
        <div className="card-glass p-6 text-sm text-ink-muted">Belum ada pendaftar di daftar ini.</div>
      ) : (
        <div className="card-glass overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-ink-soft border-b border-white/8">
                <th className="px-4 py-3">No</th><th className="px-4 py-3">Peserta</th><th className="px-4 py-3">Bayar</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Daftar</th><th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r, i) => {
                const [label, cls] = WS_STATUS[r.status] || [r.status, ''];
                return (
                  <tr key={r.id} className="border-b border-white/6 last:border-0 align-top">
                    <td className="px-4 py-3 text-ink-muted">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="text-ink font-medium">{r.name}</div>
                      <div className="text-xs text-ink-muted">{r.email}{r.member_code ? ` · ${r.member_code}` : ''}</div>
                      <a href={wsWaLink(r.whatsapp)} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-300 hover:underline">{r.whatsapp}</a>
                    </td>
                    <td className="px-4 py-3 text-ink whitespace-nowrap">{wsMoney(r)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full border ${cls}`}>{label}</span>
                      {r.status === 'paid' && <div className="text-xs text-ink-muted mt-1">{WS_VIA[r.paid_via] || '-'} · {wsTime(r.paid_at)}</div>}
                      {r.status === 'pending' && <div className="text-xs text-ink-muted mt-1">{r.seat_held ? 'Kursi dipegang' : 'Kursi dilepas (lewat 24 jam)'}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-muted whitespace-nowrap">{wsTime(r.created_at)}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {r.status !== 'paid' && <button disabled={busyId === r.id} onClick={() => setStatus(r, 'paid')} className="text-xs px-2.5 py-1.5 rounded-lg border border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/10 disabled:opacity-50 mr-1.5">Tandai lunas</button>}
                      {r.status === 'paid' && <button disabled={busyId === r.id} onClick={() => setStatus(r, 'pending')} className="text-xs px-2.5 py-1.5 rounded-lg border border-white/12 text-ink-muted hover:text-ink disabled:opacity-50 mr-1.5">Batal lunas</button>}
                      {r.status !== 'cancelled' && <button disabled={busyId === r.id} onClick={() => setStatus(r, 'cancelled')} className="text-xs px-2.5 py-1.5 rounded-lg border border-white/12 text-ink-muted hover:text-rose-300 disabled:opacity-50">Batalkan</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

window.AdminWorkshop = AdminWorkshop;
