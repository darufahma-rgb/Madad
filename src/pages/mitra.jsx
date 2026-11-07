import React, { useState, useEffect } from 'react';
/* Talqeeh — Program Mitra (#/mitra): daftar jadi mitra, lalu dasbor tautan ajakan & komisi.
   Server: action affiliate-* di api/login.js → api/_lib/affiliates.js. Harga & komisi selalu dihitung server. */

const MITRA_GOLD = '#c9a86a';
const MITRA_EMERALD = '#3ecf8e';

const mitraCall = async (action, body = {}) => {
  const res = await window.authFetch(`/api/login?action=${action}`, { method: 'POST', body: JSON.stringify(body) });
  if (res.status === 429) return { ok: false, status: 'rate_limited', error: 'Terlalu banyak percobaan. Coba lagi sebentar.' };
  return res.json().catch(() => ({ ok: false, status: 'error' }));
};

const shareUrlFor = (slug) => `${window.location.origin}/#/gabung?ref=${slug}`;
const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

const MitraHero = ({ program }) => (
  <div className="text-center relative">
    <div className="absolute inset-x-0 -top-10 h-64 pointer-events-none"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,106,0.16), transparent 65%)' }}/>
    <div className="relative">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] mb-4"
        style={{ background: 'rgba(201,168,106,0.12)', color: MITRA_GOLD, border: '1px solid rgba(201,168,106,0.3)' }}>
        <Icon name="users" className="w-3.5 h-3.5" style={{ stroke: MITRA_GOLD }}/> Mitra Talqeeh
      </div>
      <h1 className="font-display text-3xl md:text-5xl font-semibold text-ink leading-tight mb-3 max-w-3xl mx-auto">
        Ajak teman belajar, <span style={{ color: MITRA_GOLD }}>dapat komisi</span>
      </h1>
      <p className="text-ink-muted max-w-2xl mx-auto">
        Bagikan tautanmu ke teman serumah, angkatan, atau pengikutmu. Tiap Paket Imtihan yang dibeli lewat tautanmu
        memberimu komisi {program ? `${program.percent}%` : ''} dari harga yang dibayar
        {program?.discount > 0 ? <>, dan temanmu hemat {formatRupiah(program.discount)}</> : null}.
      </p>
    </div>
  </div>
);

const HowItWorks = ({ program }) => {
  const steps = [
    ['Daftar', 'Isi formulir singkat. Admin memeriksa lalu menyetujui, biasanya dalam 1–2 hari.'],
    ['Bagikan tautan', `Kamu dapat tautan sendiri.${program?.discount > 0 ? ` Teman yang mendaftar lewat tautanmu dapat potongan ${formatRupiah(program.discount)} untuk Paket Imtihan.` : ''}`],
    ['Terima komisi', `${program ? `${program.percent}%` : 'Komisi'} dari tiap Paket Imtihan yang lunas, ditransfer admin ke rekening atau e-wallet yang kamu isi.`],
  ];
  return (
    <div className="grid md:grid-cols-3 gap-3 max-w-4xl mx-auto mt-8">
      {steps.map(([title, text], i) => (
        <div key={title} className="card-glass p-5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-3"
            style={{ background: 'rgba(201,168,106,0.14)', color: MITRA_GOLD, border: '1px solid rgba(201,168,106,0.3)' }}>{i + 1}</div>
          <div className="font-display text-lg font-semibold text-ink mb-1">{title}</div>
          <p className="text-sm text-ink-muted leading-relaxed">{text}</p>
        </div>
      ))}
    </div>
  );
};

const MitraField = ({ label, hint, value, onChange, placeholder, multiline, mono, maxLength }) => (
  <label className="block">
    <span className="block text-sm text-ink mb-1.5">{label}</span>
    {multiline
      ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ink placeholder:text-ink-soft focus:outline-none focus:border-emerald-400/50"/>
      : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength}
          className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ink placeholder:text-ink-soft focus:outline-none focus:border-emerald-400/50 ${mono ? 'font-mono' : ''}`}/>}
    {hint && <span className="block text-[11px] text-ink-soft mt-1">{hint}</span>}
  </label>
);

const toSlug = (v) => String(v || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 24);

const ApplyForm = ({ initial, suggestedName, onDone }) => {
  const toast = useToast();
  const [form, setForm] = useState({
    name: initial?.name || suggestedName || '',
    whatsapp: initial?.whatsapp || '',
    payout: initial?.payout || '',
    channel: initial?.channel || '',
    slug: initial?.slug || toSlug(String(suggestedName || '').toLowerCase().replace(/\s+/g, '-')),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (v) => { setForm(f => ({ ...f, [k]: k === 'slug' ? toSlug(v) : v })); setError(''); };
  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const d = await mitraCall('affiliate-apply', form);
      if (!d.ok) {
        setError(d.error || (d.status === 'closed' ? 'Pendaftaran mitra sedang ditutup.' : d.status === 'not_ready' ? 'Program Mitra belum dibuka.' : 'Gagal mengirim. Coba lagi sebentar.'));
        return;
      }
      toast.push('Pendaftaran terkirim. Admin akan memeriksanya dulu.');
      onDone();
    } catch {
      setError('Tidak bisa terhubung ke server. Cek koneksi lalu coba lagi.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="card-glass-strong p-6 md:p-8 max-w-xl mx-auto space-y-4">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">Daftar jadi mitra</h2>
        <p className="text-sm text-ink-muted mt-1">Data rekening dan WhatsApp hanya dilihat admin, untuk mengirim komisi.</p>
      </div>
      <MitraField label="Nama yang tampil ke temanmu" value={form.name} onChange={set('name')} maxLength={60}
        hint="Muncul di halaman Gabung: &quot;Kamu diajak oleh …&quot;"/>
      <MitraField label="Kode tautan" value={form.slug} onChange={set('slug')} mono maxLength={24} placeholder="ahmad-kmm"
        hint={form.slug ? `Tautanmu nanti: ${shareUrlFor(form.slug)}` : '3–24 huruf kecil, angka, atau strip.'}/>
      <MitraField label="Nomor WhatsApp" value={form.whatsapp} onChange={set('whatsapp')} placeholder="6281234567890 atau 201xxxxxxxxx" maxLength={20}/>
      <MitraField label="Rekening atau e-wallet untuk komisi" value={form.payout} onChange={set('payout')} maxLength={120}
        placeholder="DANA 0812xxxxxxx a.n. Ahmad Fauzi"/>
      <MitraField label="Bagaimana kamu akan mengajak teman?" value={form.channel} onChange={set('channel')} multiline maxLength={300}
        placeholder="Contoh: grup WhatsApp angkatan Ushuluddin, story Instagram, kelas belajar di rumah KMM."/>
      <ErrorBox message={error}/>
      <button type="submit" disabled={busy} className={`btn btn-primary w-full py-3.5 ${busy ? 'opacity-60 cursor-wait' : ''}`}>
        {busy ? 'Mengirim…' : 'Kirim pendaftaran'}
      </button>
      <p className="text-[11px] text-ink-soft leading-relaxed">
        Komisi dihitung dari Paket Imtihan yang dibeli akun baru lewat tautanmu (tautan pertama yang dibuka temanmu yang dihitung).
        Membeli lewat tautan sendiri tidak dihitung. Tautan kerja sama kekeluargaan tidak digabung dengan komisi mitra.
      </p>
    </form>
  );
};

const StatTile = ({ label, value, color, sub }) => (
  <div className="card-glass px-4 py-4">
    <div className="text-[11px] uppercase tracking-wider text-ink-soft">{label}</div>
    <div className="font-display text-2xl font-semibold mt-1" style={{ color: color || undefined }}>{value}</div>
    {sub && <div className="text-[11px] text-ink-muted mt-0.5">{sub}</div>}
  </div>
);

const MitraDashboard = ({ affiliate, stats, program }) => {
  const toast = useToast();
  const url = shareUrlFor(affiliate.slug);
  const copy = () => navigator.clipboard?.writeText(url).then(() => toast.push('Tautan disalin.')).catch(() => toast.push('Gagal menyalin. Salin manual ya.'));
  const shareText = `Aku pakai Talqeeh buat belajar muqarrar Azhar: maddah lengkap, bank soal imtihan, sama AI yang paham teks Arab.${program.discount > 0 ? ` Daftar lewat tautanku, Paket Imtihan-nya lebih hemat ${formatRupiah(program.discount)}:` : ' Coba lewat tautanku:'} ${url}`;
  const suspended = affiliate.status === 'suspended';
  const s = stats || { signups: 0, sold: 0, earned: 0, paid: 0, unpaid: 0, sales: [] };
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {suspended && (
        <div className="card-glass p-4 text-sm text-amber-200" style={{ border: '1px solid rgba(251,191,36,0.35)' }}>
          Tautan mitramu sedang dinonaktifkan admin, jadi pembelian baru tidak dihitung. Komisi yang sudah tercatat tetap dibayarkan.
          {affiliate.admin_note && <> Catatan admin: <span className="text-ink">{affiliate.admin_note}</span></>}
        </div>
      )}
      <div className="card-glass-strong p-6" style={{ border: '1px solid rgba(201,168,106,0.3)' }}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em]" style={{ color: MITRA_GOLD }}>Tautan ajakanmu</div>
            <div className="text-sm text-ink-muted mt-1">
              Komisi {affiliate.percent}% per Paket Imtihan{program.discount > 0 ? ` · temanmu hemat ${formatRupiah(program.discount)}` : ''}
            </div>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full border border-emerald-400/30 text-emerald-200">{suspended ? 'Nonaktif' : 'Aktif'}</span>
        </div>
        <div className="mt-4 flex gap-2 flex-wrap">
          <div className="flex-1 min-w-[220px] font-mono text-sm text-ink bg-white/5 border border-white/10 rounded-xl px-4 py-3 break-all">{url}</div>
          <button onClick={copy} className="btn btn-gold px-5 py-3 text-sm">Salin</button>
          <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer"
            className="btn btn-primary px-5 py-3 text-sm">Bagikan ke WhatsApp</a>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <StatTile label="Akun diajak" value={s.signups} sub="login lewat tautanmu"/>
        <StatTile label="Terjual" value={s.sold} sub="Paket Imtihan lunas"/>
        <StatTile label="Komisi belum dibayar" value={formatRupiah(s.unpaid)} color={MITRA_GOLD}/>
        <StatTile label="Sudah dibayar" value={formatRupiah(s.paid)} color={MITRA_EMERALD} sub={`total ${formatRupiah(s.earned)}`}/>
      </div>

      <div className="card-glass p-5">
        <div className="text-sm text-ink font-medium mb-3">Penjualan lewat tautanmu</div>
        {!s.sales.length ? (
          <p className="text-sm text-ink-muted">Belum ada. Bagikan tautanmu ke grup angkatan atau teman serumah, komisinya muncul di sini begitu pembayarannya lunas.</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-ink-muted text-xs"><th className="pb-2 font-normal">Tanggal</th><th className="pb-2 font-normal">Harga dibayar</th><th className="pb-2 font-normal">Komisi</th><th className="pb-2 font-normal">Status</th></tr></thead>
            <tbody>{s.sales.map((x, i) => (
              <tr key={i} className="border-t border-white/10 text-ink">
                <td className="py-2">{formatDate(x.at)}</td>
                <td className="py-2">{formatRupiah(x.amount)}</td>
                <td className="py-2">{formatRupiah(x.commission)}</td>
                <td className="py-2">{x.paidOut ? <span className="text-emerald-300">Dibayar</span> : <span className="text-amber-200">Menunggu transfer</span>}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      <div className="card-glass p-5 text-sm text-ink-muted leading-relaxed space-y-1.5">
        <div className="text-ink font-medium">Pembayaran komisi</div>
        <p>Komisi dikirim admin ke <span className="text-ink">{affiliate.payout}</span>. Mau ganti rekening? Hubungi admin lewat WhatsApp.</p>
        <p>Yang dihitung: akun baru yang membuka tautanmu sebelum login, lalu membeli Paket Imtihan. Tautan berlaku 30 hari di perangkat temanmu.</p>
      </div>
    </div>
  );
};

const MitraPage = () => {
  const { session, authStatus } = useAuth();
  const [state, setState] = useState({ loading: true });
  const [program, setProgram] = useState(null);
  const [editing, setEditing] = useState(false);
  const signedOut = authStatus === 'signed_out' || (authStatus === 'member' && !session);

  const load = async () => {
    if (!session?.code) return;
    setState(s => ({ ...s, loading: true }));
    try {
      const d = await mitraCall('affiliate-me');
      if (d.program) setProgram(d.program);
      setState({ loading: false, ...d });
    } catch {
      setState({ loading: false, ok: false, status: 'network' });
    }
  };

  useEffect(() => {
    // Angka program untuk pengunjung yang belum login.
    fetch('/api/login?action=affiliate-info', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      .then(r => r.json()).then(d => { if (d?.program) setProgram(p => p || d.program); }).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [session?.code]);

  const openLogin = () => {
    try { sessionStorage.setItem('talqeeh_return_to', JSON.stringify({ path: '/mitra', at: Date.now() })); } catch {}
    window.dispatchEvent(new CustomEvent('talqeeh:open-login'));
  };

  let body;
  if (authStatus === 'loading' || (session?.code && state.loading)) {
    body = <div className="card-glass p-6 max-w-xl mx-auto"><Skeleton lines={4}/></div>;
  } else if (signedOut) {
    body = (
      <div className="text-center">
        <HowItWorks program={program}/>
        {program && !program.open
          ? <p className="text-sm text-ink-muted mt-8">Pendaftaran mitra sedang ditutup. Pantau terus ya.</p>
          : <button onClick={openLogin} className="btn btn-primary px-6 py-3.5 mt-8">Masuk dengan Google untuk daftar</button>}
      </div>
    );
  } else if (authStatus === 'needs_activation' || state.status === 'not_member') {
    body = (
      <div className="card-glass p-6 max-w-xl mx-auto text-center">
        <p className="text-sm text-ink-muted mb-4">Buat akun Talqeeh dulu (gratis), lalu kembali ke halaman ini untuk mendaftar jadi mitra.</p>
        <button onClick={() => navigate('/gabung')} className="btn btn-primary px-6 py-3">Buat akun gratis</button>
      </div>
    );
  } else if (state.status === 'not_ready') {
    body = <div className="card-glass p-6 max-w-xl mx-auto text-center text-sm text-ink-muted">Program Mitra segera dibuka. Pantau terus ya.</div>;
  } else if (!state.ok) {
    body = (
      <div className="card-glass p-6 max-w-xl mx-auto text-center">
        <p className="text-sm text-ink-muted mb-4">Gagal memuat data mitra.</p>
        <button onClick={load} className="btn btn-primary px-5 py-2.5 text-sm">Coba lagi</button>
      </div>
    );
  } else {
    const a = state.affiliate;
    const p = state.program;
    if (!a) {
      body = p.open
        ? <><HowItWorks program={p}/><div className="mt-8"><ApplyForm suggestedName={state.suggestedName} onDone={load}/></div></>
        : <div className="card-glass p-6 max-w-xl mx-auto text-center text-sm text-ink-muted">Pendaftaran mitra sedang ditutup. Pantau terus ya.</div>;
    } else if (a.status === 'pending') {
      body = editing
        ? <ApplyForm initial={a} onDone={() => { setEditing(false); load(); }}/>
        : (
          <div className="card-glass-strong p-6 max-w-xl mx-auto text-center space-y-3">
            <div className="font-display text-xl font-semibold text-ink">Pendaftaranmu sedang diperiksa</div>
            <p className="text-sm text-ink-muted">
              Dikirim {formatDate(a.created_at)}. Begitu disetujui, tautan <span className="font-mono text-ink">{a.slug}</span> dan dasbor komisimu muncul di halaman ini.
            </p>
            <button onClick={() => setEditing(true)} className="text-xs text-emerald-300 hover:text-emerald-200 underline underline-offset-2">Ubah data pendaftaran</button>
          </div>
        );
    } else if (a.status === 'rejected') {
      body = (
        <div className="space-y-6">
          <div className="card-glass p-5 max-w-xl mx-auto text-sm text-ink-muted" style={{ border: '1px solid rgba(251,113,133,0.3)' }}>
            Pendaftaranmu belum disetujui.{a.admin_note ? <> Catatan admin: <span className="text-ink">{a.admin_note}</span></> : null} Kamu bisa memperbaiki datanya lalu kirim lagi.
          </div>
          {p.open && <ApplyForm initial={a} onDone={load}/>}
        </div>
      );
    } else {
      body = <MitraDashboard affiliate={a} stats={state.stats} program={p}/>;
    }
  }

  const isDashboard = state.ok && (state.affiliate?.status === 'approved' || state.affiliate?.status === 'suspended');
  return (
    <div className="page-enter container-x pt-8 md:pt-14 pb-16">
      {isDashboard
        ? <div className="max-w-4xl mx-auto mb-6"><h1 className="font-display text-2xl md:text-3xl font-semibold text-ink">Dasbor Mitra</h1><p className="text-sm text-ink-muted">Halo, {state.affiliate.name}. Ini ringkasan ajakanmu.</p></div>
        : <MitraHero program={program}/>}
      <div className={isDashboard ? '' : 'mt-2'}>{body}</div>
    </div>
  );
};

window.MitraPage = MitraPage;
