import React, { useState, useEffect, useCallback } from 'react';
/* Talqeeh, halaman event (publik): "Menuju Imtihan: Belajar Efektif dengan AI".
   Semua isi diambil dari brief kegiatan. Pendaftaran langsung di halaman ini (api/_lib/workshop.js):
   wajib login Google, bayar Rupiah lewat Mayar (lunas otomatis) atau Pound Mesir (langsung ke panitia, ditandai lunas di Admin).
   Hal yang belum ditetapkan panitia (kontak CS, cara bayar Pound Mesir, nama narasumber) sengaja TIDAK diisi tebakan. */

const EVENT = {
  name: 'Menuju Imtihan: Belajar Efektif dengan AI',
  tagline: 'Belajar Lebih Terarah, Persiapan Lebih Matang.',
  theme: 'Optimalisasi Persiapan Imtihan Mahasiswa Al-Azhar melalui Pemanfaatan Kecerdasan Buatan.',
  type: 'Workshop edukatif dan praktik interaktif',
  day: 'Senin',
  date: '7 Desember 2026',
  time: '14.00–17.00 waktu Kairo',
  registration: 'Registrasi mulai 13.30',
  place: '302Labs',
  address: "Kawasan Rabi'ah Adawiyah (Rob' El Adaweya), dekat Wisma Nusantara, Kairo, Mesir",
  format: 'Offline, tatap muka',
  quota: 50,
  priceIdr: 'Rp120.000',
  priceEgp: '360 LE',
  // Belum ditetapkan panitia. Isi nomor WhatsApp CS (format 62… / 20…) kalau sudah ada: tombol "Tanya panitia" muncul sendiri.
  whatsapp: '',
};

const EVENT_AUDIENCE = [
  'Mahasiswa Indonesia yang sedang menempuh pendidikan di Universitas Al-Azhar, Mesir.',
  'Mahasiswa yang sedang mempersiapkan diri menghadapi imtihan.',
  'Mahasiswa yang ingin belajar lebih efektif dengan bantuan AI.',
  'Mahasiswa yang tertarik menggunakan Talqeeh.id untuk mendukung pembelajaran.',
];

const EVENT_FACILITIES = [
  'Workshop interaktif selama 3 jam.',
  'Materi strategi belajar efektif menggunakan AI.',
  'Praktik langsung menggunakan Talqeeh.id.',
  'Pendampingan selama sesi pembelajaran.',
  'Materi atau panduan workshop.',
  'Tempat kegiatan di 302Labs.',
  'Konsumsi berupa air mineral dan roti.',
];

const EVENT_SESSIONS = [
  { n: 1, title: 'AI untuk Persiapan Imtihan', icon: 'sparkles',
    desc: 'Pengenalan manfaat, peluang, dan batasan penggunaan AI dalam proses pembelajaran mahasiswa Al-Azhar.' },
  { n: 2, title: 'Strategi Belajar Efektif dengan AI', icon: 'compass',
    desc: 'Strategi memahami materi, membuat ringkasan, menentukan prioritas, serta belajar aktif menjelang ujian.' },
  { n: 3, title: 'Praktik Langsung Talqeeh.id', icon: 'layers',
    desc: 'Peserta mempraktikkan penggunaan Talqeeh.id dengan materi perkuliahan masing-masing.' },
  { n: 4, title: 'Simulasi Imtihan dan Evaluasi', icon: 'target',
    desc: 'Peserta berlatih dari materi yang dipelajari, mengidentifikasi kelemahan, dan mengevaluasi pemahamannya.' },
];

const EVENT_FLOW = ['Materi Kuliah', 'Pemahaman Materi', 'Ringkasan', 'Latihan Soal', 'Evaluasi'];

const EVENT_RUNDOWN = [
  ['13.30–14.00', 'Registrasi Peserta'],
  ['14.00–14.10', 'Pembukaan'],
  ['14.10–14.40', 'AI untuk Persiapan Imtihan'],
  ['14.40–15.10', 'Strategi Belajar Efektif dengan AI'],
  ['15.10–16.20', 'Praktik Langsung Talqeeh.id'],
  ['16.20–16.45', 'Simulasi Imtihan dan Evaluasi'],
  ['16.45–17.00', 'Tanya Jawab dan Penutupan'],
];

const EVENT_GOALS = [
  'Meningkatkan kesiapan mahasiswa menghadapi imtihan.',
  'Mengenalkan strategi belajar efektif berbantuan AI.',
  'Membantu peserta memahami dan mengorganisasi materi perkuliahan.',
  'Melatih peserta menggunakan Talqeeh.id secara langsung.',
  'Membantu peserta melakukan latihan soal dan evaluasi pemahaman.',
  'Mendorong penggunaan AI secara kritis dan bertanggung jawab.',
  'Membantu peserta menyusun rencana belajar menjelang imtihan.',
];

const EVENT_OUTCOMES = [
  'Memahami cara menggunakan AI untuk membantu persiapan imtihan.',
  'Menguasai strategi belajar yang lebih efektif.',
  'Mampu menggunakan Talqeeh.id secara mandiri.',
  'Memiliki ringkasan atau catatan dari materi yang dipelajari.',
  'Mampu melakukan latihan pemahaman menggunakan AI.',
  'Memiliki rencana belajar pribadi menjelang imtihan.',
];

const EVENT_ORGANIZERS = [
  { name: 'AIGYPT', role: 'Konsep kegiatan, materi pembelajaran, narasumber, dan pelaksanaan workshop.' },
  { name: 'HPIM Mesir', role: 'Himpunan Pelajar Indonesia Mesir. Pendaftaran, komunikasi peserta, tempat, dan konsumsi.' },
  { name: 'Talqeeh.id', role: 'Platform utama untuk sesi praktik dan panduan penggunaannya.' },
];

const eventWaLink = () => EVENT.whatsapp
  ? `https://wa.me/${EVENT.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Assalamu'alaikum, saya mau tanya tentang workshop "${EVENT.name}".`)}`
  : '';

const eventCall = async (action, body) => {
  try {
    const isPublic = action === 'event-info';
    const opts = { method: 'POST', body: JSON.stringify(body || {}) };
    const res = isPublic
      ? await fetch(`/api/login?action=${action}`, { ...opts, headers: { 'Content-Type': 'application/json' } })
      : await window.authFetch(`/api/login?action=${action}`, opts);
    const data = await res.json().catch(() => null);
    if (res.status === 429) return { ok: false, status: 'rate_limited' };
    return data || { ok: false, status: 'error' };
  } catch {
    return { ok: false, status: 'error' };
  }
};

const EVENT_ERRORS = {
  invalid: 'Isi nama lengkap dan nomor WhatsApp yang benar dulu ya.',
  full: 'Maaf, kuota 50 peserta sudah penuh.',
  closed: 'Pendaftaran sudah ditutup.',
  not_ready: 'Pendaftaran belum dibuka. Coba lagi nanti ya.',
  rate_limited: 'Terlalu banyak percobaan. Tunggu beberapa menit, lalu coba lagi.',
  member_blocked: 'Akunmu belum bisa dipakai mendaftar. Hubungi panitia ya.',
  error: 'Ada gangguan. Cek koneksimu, lalu coba lagi.',
};

const EventNotice = ({ tone = 'gold', title, children }) => (
  <div className={`rounded-2xl border px-5 py-4 ${tone === 'emerald' ? 'border-emerald-500/40 bg-emerald-500/10' : tone === 'rose' ? 'border-rose-600/40 bg-rose-600/10' : 'border-gold-500/35 bg-gold-500/10'}`}>
    <div className="text-sm font-semibold text-ink">{title}</div>
    {children && <div className="text-xs md:text-sm text-ink-muted mt-1 leading-relaxed">{children}</div>}
  </div>
);

const EventWaButton = ({ label = 'Tanya panitia' }) => {
  const wa = eventWaLink();
  if (!wa) return null;
  return (
    <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-ghost px-5 py-2.5 text-sm">
      <Icon name="messageSquare" className="w-4 h-4"/> {label}
    </a>
  );
};

/* Kotak pendaftaran. Urutannya: masuk dengan Google → isi nama, WhatsApp, dan mata uang → bayar.
   Rupiah dibayar lewat Mayar dan lunas otomatis; Pound Mesir menunggu konfirmasi panitia. */
const EventRegisterBox = () => {
  const { authStatus, authInfo, session } = useAuth();
  // Sudah login Google: member, atau akun baru yang sedang dibuatkan akun gratisnya.
  const signedIn = authStatus === 'member' || authStatus === 'needs_activation' || !!session;
  const email = (authInfo && authInfo.email) || (session && session.email) || '';
  const [info, setInfo] = useState(null);          // { ready, closed, full, left, quota, mayar }
  const [mine, setMine] = useState(null);          // pendaftaran akun ini
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', whatsapp: '', currency: 'IDR' });

  const load = useCallback(async () => {
    const d = signedIn ? await eventCall('event-me') : await eventCall('event-info');
    if (d && d.ok) {
      setInfo(d);
      setMine(d.registration || null);
      if (d.registration) setForm({ name: d.registration.name, whatsapp: d.registration.whatsapp, currency: d.registration.currency });
    } else setInfo({ ready: false });
    setLoading(false);
  }, [signedIn]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!form.name && session && session.name) setForm(f => ({ ...f, name: f.name || session.name }));
  }, [session]);
  // Kembali dari halaman bayar Mayar: cek status beberapa kali sampai lunas.
  useEffect(() => {
    if (!signedIn || !mine || mine.status !== 'pending' || mine.currency !== 'IDR' || !mine.link) return undefined;
    let n = 0;
    const t = setInterval(() => { n += 1; if (n > 30) clearInterval(t); else load(); }, 10000);
    return () => clearInterval(t);
  }, [signedIn, mine && mine.status, mine && mine.link, load]);

  const login = () => {
    try { sessionStorage.setItem('talqeeh_return_to', JSON.stringify({ path: '/event', at: Date.now() })); } catch {}
    window.dispatchEvent(new CustomEvent('talqeeh:open-login', { detail: { keepPlan: false } }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError('');
    const d = await eventCall('event-register', form);
    setBusy(false);
    if (!d.ok) { setError(EVENT_ERRORS[d.status] || EVENT_ERRORS.error); if (d.status === 'full' || d.status === 'closed') load(); return; }
    setMine(d.registration); setEditing(false);
    if (d.status === 'registered' && d.registration.currency === 'IDR' && d.registration.link) window.location.href = d.registration.link;
    else load();
  };

  if (loading) return <div className="card-glass p-5 text-sm text-ink-muted">Memuat pendaftaran…</div>;
  if (!info || !info.ready) return <EventNotice title="Pendaftaran segera dibuka">Formulir pendaftaran akan muncul di sini.</EventNotice>;

  // Sudah lunas.
  if (mine && mine.status === 'paid') {
    return (
      <EventNotice tone="emerald" title={`Kamu sudah terdaftar, ${mine.name}.`}>
        Pembayaranmu sudah kami terima. Sampai jumpa {EVENT.day}, {EVENT.date} di {EVENT.place}. Registrasi mulai 13.30 waktu Kairo.
        <div className="mt-3"><EventWaButton/></div>
      </EventNotice>
    );
  }

  // Sudah daftar, belum lunas.
  if (mine && mine.status === 'pending' && !editing) {
    const price = mine.currency === 'EGP' ? EVENT.priceEgp : EVENT.priceIdr;
    return (
      <div className="card-glass-strong p-5 md:p-6">
        <div className="text-[11px] uppercase tracking-wider text-gold-400 mb-1">Menunggu pembayaran</div>
        <div className="font-display text-lg font-semibold text-ink">{mine.name} · {price}</div>
        {mine.currency === 'IDR' ? (
          <>
            <p className="text-sm text-ink-muted mt-2 leading-relaxed">
              {mine.link ? 'Selesaikan pembayaran lewat Mayar. Setelah lunas, halaman ini berubah sendiri.' : 'Tautan bayarmu sudah tidak berlaku. Buat tautan baru untuk melanjutkan.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {mine.link
                ? <a href={mine.link} className="btn btn-primary px-6 py-3 text-sm">Bayar {price} <Icon name="arrowRight" className="w-4 h-4"/></a>
                : <button onClick={submit} disabled={busy} className="btn btn-primary px-6 py-3 text-sm disabled:opacity-60">{busy ? 'Menyiapkan…' : 'Buat tautan bayar'}</button>}
              <button onClick={load} className="btn btn-ghost px-5 py-3 text-sm"><Icon name="refresh" className="w-4 h-4"/> Saya sudah bayar</button>
            </div>
          </>
        ) : (
          <p className="text-sm text-ink-muted mt-2 leading-relaxed">
            Bayar {price} langsung ke panitia. Panitia akan menghubungimu lewat WhatsApp di nomor {mine.whatsapp}, lalu menandai pendaftaranmu lunas setelah pembayaran diterima.
          </p>
        )}
        <p className="text-xs text-ink-soft mt-3 leading-relaxed">
          {mine.seatHeld ? 'Kursimu dipegang selama 24 jam sejak mendaftar. Setelah itu kursi bisa diambil peserta lain.' : 'Masa pegang kursimu sudah lewat. Kursi baru aman setelah pembayaran diterima.'}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button onClick={() => setEditing(true)} className="text-xs text-gold-300 hover:text-gold-200 underline underline-offset-2">Ubah data atau cara bayar</button>
          <EventWaButton/>
        </div>
        {error && <p className="text-sm text-rose-400 mt-3">{error}</p>}
      </div>
    );
  }

  if (info.closed) return <EventNotice title="Pendaftaran sudah ditutup">Terima kasih atas minatnya. Pantau kegiatan AIGYPT dan HPIM Mesir berikutnya.</EventNotice>;
  if (info.full && !mine) return <EventNotice tone="rose" title="Kuota penuh">Semua {info.quota} kursi sudah terisi. Pendaftaran ditutup.</EventNotice>;

  if (!signedIn) {
    return (
      <div className="card-glass-strong p-5 md:p-6">
        <div className="font-display text-lg font-semibold text-ink">Daftar workshop</div>
        <p className="text-sm text-ink-muted mt-1.5 leading-relaxed">
          Masuk dengan akun Google dulu. Akun yang sama dipakai untuk sesi praktik di Talqeeh.id.
        </p>
        <button onClick={login} className="btn btn-primary px-6 py-3 text-sm mt-4">Masuk dengan Google untuk daftar <Icon name="arrowRight" className="w-4 h-4"/></button>
        <p className="text-xs text-ink-soft mt-3">Sisa {info.left} dari {info.quota} kursi.</p>
      </div>
    );
  }

  const input = 'w-full rounded-xl bg-white/5 border border-white/12 px-4 py-3 text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:border-emerald-500/50';
  return (
    <form onSubmit={submit} className="card-glass-strong p-5 md:p-6">
      <div className="font-display text-lg font-semibold text-ink">Daftar workshop</div>
      <p className="text-xs text-ink-soft mt-1">Masuk sebagai {email || 'akun Google-mu'}. Sisa {info.left} dari {info.quota} kursi.</p>
      <label className="block mt-4">
        <span className="text-xs text-ink-muted">Nama lengkap</span>
        <input className={`${input} mt-1`} value={form.name} maxLength={80} required
          onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nama sesuai yang dipanggil panitia"/>
      </label>
      <label className="block mt-3">
        <span className="text-xs text-ink-muted">Nomor WhatsApp aktif</span>
        <input className={`${input} mt-1`} value={form.whatsapp} maxLength={20} required inputMode="tel"
          onChange={(e) => setForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="+20 1xx xxxx xxxx atau +62 8xx xxxx xxxx"/>
      </label>
      <div className="mt-4">
        <span className="text-xs text-ink-muted">Bayar dengan</span>
        <div className="grid grid-cols-2 gap-2.5 mt-1">
          {[['IDR', 'Rupiah', EVENT.priceIdr, 'Bayar online lewat Mayar'], ['EGP', 'Pound Mesir', EVENT.priceEgp, 'Bayar langsung ke panitia']].map(([id, label, price, sub]) => (
            <button type="button" key={id} onClick={() => setForm(f => ({ ...f, currency: id }))}
              className={`text-left rounded-xl border px-4 py-3 transition ${form.currency === id ? 'border-emerald-500/60 bg-emerald-500/12' : 'border-white/12 bg-white/4 hover:border-white/25'}`}>
              <div className="text-[11px] uppercase tracking-wider text-gold-400">{label}</div>
              <div className="font-display text-lg font-semibold text-ink">{price}</div>
              <div className="text-[11px] text-ink-muted mt-0.5">{sub}</div>
            </button>
          ))}
        </div>
      </div>
      {form.currency === 'IDR' && !info.mayar && (
        <p className="text-xs text-gold-300 mt-3">Pembayaran online sedang tidak tersedia. Kamu tetap bisa mendaftar, lalu membayar setelah tautannya siap.</p>
      )}
      {error && <p className="text-sm text-rose-400 mt-3">{error}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy} className="btn btn-primary px-6 py-3 text-sm disabled:opacity-60">
          {busy ? 'Memproses…' : form.currency === 'IDR' ? `Daftar dan bayar ${EVENT.priceIdr}` : 'Daftar sekarang'}
          {!busy && <Icon name="arrowRight" className="w-4 h-4"/>}
        </button>
        {editing && <button type="button" onClick={() => setEditing(false)} className="text-xs text-ink-muted hover:text-ink underline underline-offset-2">Batal</button>}
      </div>
      <p className="text-xs text-ink-soft mt-3 leading-relaxed">
        Dengan mendaftar, kamu dibuatkan akun Talqeeh gratis (kalau belum punya). Tiket workshop tidak termasuk akses premium Talqeeh.id.
      </p>
    </form>
  );
};

const EventSectionTitle = ({ kicker, title, subtitle }) => (
  <div className="mb-6 md:mb-8">
    <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-3 flex items-center gap-2">
      <span className="w-6 h-px bg-gold-500/70"/>{kicker}
    </div>
    <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink leading-tight">{title}</h2>
    {subtitle && <p className="mt-2 text-sm md:text-base text-ink-muted max-w-2xl leading-relaxed">{subtitle}</p>}
  </div>
);

const EventCheckList = ({ items }) => (
  <ul className="space-y-2.5">
    {items.map((x) => (
      <li key={x} className="flex gap-3 text-sm md:text-[15px] text-ink leading-relaxed">
        <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center flex-shrink-0">
          <Icon name="check" className="w-3 h-3 text-emerald-300" strokeWidth={2.4}/>
        </span>
        <span>{x}</span>
      </li>
    ))}
  </ul>
);

const EventImtihanPage = () => {
  useEffect(() => {
    const prev = document.title;
    document.title = `${EVENT.name} · Talqeeh`;
    return () => { document.title = prev; };
  }, []);

  const facts = [
    { icon: 'timer', label: 'Waktu', value: `${EVENT.day}, ${EVENT.date}`, sub: `${EVENT.time} · ${EVENT.registration}` },
    { icon: 'compass', label: 'Tempat', value: EVENT.place, sub: EVENT.address },
    { icon: 'users', label: 'Kuota', value: `${EVENT.quota} peserta`, sub: EVENT.format },
    { icon: 'bookmark', label: 'Biaya', value: `${EVENT.priceIdr} atau ${EVENT.priceEgp}`, sub: 'Per orang. Pilih salah satu mata uang.' },
  ];

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="relative pt-6 md:pt-12 pb-8 md:pb-12 overflow-hidden">
        <GlowBlob color="rgba(62,207,142,0.18)" size={520} top={-220} right={-160}/>
        <div className="container-x relative">
          <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 flex items-center gap-2 flex-wrap">
            <span className="w-6 h-px bg-gold-500/70"/>Workshop · AIGYPT × HPIM Mesir
          </div>
          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold text-ink leading-[1.05] tracking-tightest max-w-4xl">
            Menuju Imtihan: <span className="text-emerald-300">Belajar Efektif dengan AI</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-ink font-medium">{EVENT.tagline}</p>
          <p className="mt-2 text-sm md:text-base text-ink-muted max-w-2xl leading-relaxed">
            {EVENT.type} selama 3 jam. Peserta belajar strateginya, lalu langsung praktik di Talqeeh.id dengan materi kuliahnya sendiri.
          </p>

          <div className="mt-7 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {facts.map((f) => (
              <div key={f.label} className="card-glass p-4 md:p-5">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-gold-400 mb-2">
                  <Icon name={f.icon} className="w-3.5 h-3.5"/>{f.label}
                </div>
                <div className="font-display text-base md:text-lg font-semibold text-ink leading-snug">{f.value}</div>
                <div className="text-xs text-ink-muted mt-1 leading-relaxed">{f.sub}</div>
              </div>
            ))}
          </div>

          <div id="daftar" className="mt-6 max-w-xl scroll-mt-24"><EventRegisterBox/></div>
        </div>
      </section>

      {/* Latar belakang */}
      <section className="pb-12 md:pb-16">
        <div className="container-x">
          <Reveal className="card-glass-strong p-6 md:p-10">
            <EventSectionTitle kicker="Kenapa workshop ini" title="Materi banyak, waktu sedikit, imtihan makin dekat."/>
            <div className="grid md:grid-cols-2 gap-6 md:gap-10 text-sm md:text-base text-ink-muted leading-relaxed">
              <p>
                Mahasiswa Al-Azhar menghadapi tantangan yang sama setiap menjelang imtihan: banyaknya materi berbahasa Arab,
                waktu yang terbatas, dan sulitnya memahami serta mengingat pembahasan akademik.
              </p>
              <p>
                Lewat workshop ini, AIGYPT dan HPIM Mesir memperkenalkan cara belajar yang memanfaatkan AI secara terarah.
                Peserta tidak hanya mendengar teorinya, tetapi langsung mempraktikkannya di Talqeeh.id.
              </p>
            </div>
            <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/8 px-5 py-4 text-sm md:text-base text-ink leading-relaxed">
              <strong>Satu prinsip yang dipegang:</strong> AI adalah alat bantu belajar, bukan pengganti dosen, kitab,
              atau proses berpikir kritis mahasiswa.
            </div>
          </Reveal>
        </div>
      </section>

      {/* Untuk siapa + fasilitas */}
      <section className="pb-12 md:pb-16">
        <div className="container-x grid lg:grid-cols-2 gap-5 md:gap-6">
          <Reveal className="card-glass p-6 md:p-8">
            <EventSectionTitle kicker="Untuk siapa" title={`Terbuka untuk ${EVENT.quota} peserta`}/>
            <EventCheckList items={EVENT_AUDIENCE}/>
          </Reveal>
          <Reveal className="card-glass p-6 md:p-8">
            <EventSectionTitle kicker="Yang kamu dapat" title="Sudah termasuk dalam biaya pendaftaran"/>
            <EventCheckList items={EVENT_FACILITIES}/>
            <p className="mt-5 text-xs text-ink-soft leading-relaxed">
              Akses premium Talqeeh.id dan sertifikat belum termasuk dalam fasilitas yang dikonfirmasi.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Materi */}
      <section className="pb-12 md:pb-16">
        <div className="container-x">
          <EventSectionTitle kicker="Materi dan aktivitas" title="Empat sesi, dari paham sampai teruji"/>
          <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
            {EVENT_SESSIONS.map((s) => (
              <Reveal key={s.n} className="card-glass p-5 md:p-7">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center flex-shrink-0">
                    <Icon name={s.icon} className="w-5 h-5"/>
                  </span>
                  <div className="text-[11px] uppercase tracking-wider text-gold-400">Sesi {s.n}</div>
                </div>
                <h3 className="font-display text-lg md:text-xl font-semibold text-ink mb-2">{s.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{s.desc}</p>
                {s.n === 3 && (
                  <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    {EVENT_FLOW.map((step, i) => (
                      <React.Fragment key={step}>
                        <span className="text-[11px] md:text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-ink">{step}</span>
                        {i < EVENT_FLOW.length - 1 && <Icon name="chevronRight" className="w-3 h-3 text-ink-soft"/>}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Rundown */}
      <section className="pb-12 md:pb-16">
        <div className="container-x">
          <EventSectionTitle kicker="Rundown" title={`${EVENT.day}, ${EVENT.date}`} subtitle="Semua jam dalam waktu Kairo."/>
          <Reveal className="card-glass overflow-hidden">
            {EVENT_RUNDOWN.map(([time, agenda], i) => (
              <div key={time} className={`grid grid-cols-[112px_1fr] md:grid-cols-[160px_1fr] gap-3 px-5 md:px-7 py-3.5 md:py-4 ${i ? 'border-t border-white/6' : ''}`}>
                <div className="text-sm font-semibold text-emerald-300 tabular-nums">{time}</div>
                <div className="text-sm md:text-base text-ink">{agenda}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Tujuan + hasil */}
      <section className="pb-12 md:pb-16">
        <div className="container-x grid lg:grid-cols-2 gap-5 md:gap-6">
          <Reveal className="card-glass p-6 md:p-8">
            <EventSectionTitle kicker="Tujuan kegiatan" title="Apa yang ingin dicapai"/>
            <EventCheckList items={EVENT_GOALS}/>
          </Reveal>
          <Reveal className="card-glass p-6 md:p-8">
            <EventSectionTitle kicker="Setelah workshop" title="Yang kamu bawa pulang"/>
            <EventCheckList items={EVENT_OUTCOMES}/>
          </Reveal>
        </div>
      </section>

      {/* Biaya */}
      <section className="pb-12 md:pb-16">
        <div className="container-x">
          <Reveal className="card-glass-strong p-6 md:p-10">
            <EventSectionTitle kicker="Biaya pendaftaran" title="Bayar dengan Rupiah atau Pound Mesir"/>
            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
              <div className="rounded-2xl border border-white/10 bg-white/4 p-5">
                <div className="text-[11px] uppercase tracking-wider text-gold-400 mb-1">Rupiah (IDR)</div>
                <div className="font-display text-3xl font-semibold text-ink">{EVENT.priceIdr}</div>
                <div className="text-xs text-ink-muted mt-1">per orang</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/4 p-5">
                <div className="text-[11px] uppercase tracking-wider text-gold-400 mb-1">Pound Mesir (EGP)</div>
                <div className="font-display text-3xl font-semibold text-ink">{EVENT.priceEgp}</div>
                <div className="text-xs text-ink-muted mt-1">per orang</div>
              </div>
            </div>
            <p className="mt-4 text-xs text-ink-soft leading-relaxed max-w-2xl">
              Kedua nominal adalah harga tetap, bukan hasil konversi kurs. Rupiah dibayar online lewat Mayar. Pound Mesir dibayar langsung ke panitia.
            </p>
            <div className="mt-6"><a href="#daftar" onClick={(e) => { e.preventDefault(); document.getElementById("daftar")?.scrollIntoView({ behavior: "smooth", block: "center" }); }} className="btn btn-primary px-6 py-3 text-sm">Daftar di bagian atas <Icon name="chevronUp" className="w-4 h-4"/></a></div>
          </Reveal>
        </div>
      </section>

      {/* Penyelenggara */}
      <section className="pb-16 md:pb-24">
        <div className="container-x">
          <EventSectionTitle kicker="Penyelenggara" title="Kolaborasi tiga pihak"/>
          <div className="grid md:grid-cols-3 gap-4">
            {EVENT_ORGANIZERS.map((o) => (
              <Reveal key={o.name} className="card-glass p-5 md:p-6">
                <div className="font-display text-lg font-semibold text-ink mb-1.5">{o.name}</div>
                <p className="text-sm text-ink-muted leading-relaxed">{o.role}</p>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-xs text-ink-soft leading-relaxed max-w-2xl">
            Nama narasumber dan kontak panitia akan diperbarui di halaman ini setelah ditetapkan.
          </p>
        </div>
      </section>
    </div>
  );
};

window.EventImtihanPage = EventImtihanPage;
