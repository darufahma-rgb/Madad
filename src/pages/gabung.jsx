import React, { useState, useEffect, useRef } from 'react';
/* Talqeeh — halaman Gabung: pilih Gratis / Library / Library + AI, bayar di Mayar, atau tukar PIN member lama */

const JOIN_PLAN_KEY = 'talqeeh_join_plan';
const saveJoinPlanLocal = (plan) => { try { plan ? localStorage.setItem(JOIN_PLAN_KEY, plan) : localStorage.removeItem(JOIN_PLAN_KEY); } catch {} };

const GOLD = '#c9a86a';
const EMERALD = '#3ecf8e';
const SKY = '#60a5fa';

// Isi tiap paket: [teks, termasuk?]. Yang tidak termasuk ditampilkan redup + ikon silang.
const FREE_ITEMS = [
  ['Maddah Nahwu + 1 maddah pilihanmu', true],
  ['3 soal bank soal imtihan', true],
  ['Coba AI Partner untuk 1 materi', true],
  ['Kurasah, Statistik & Profil Belajar', true],
  [`${CATALOG.maddah - 2} maddah lainnya`, false],
  ['Siap Imtihan & Muqaranah 4 madzhab', false],
];
const LIBRARY_ITEMS = [
  [`Semua ${CATALOG.maddah} maddah S1 + Ma'had`, true],
  [`${CATALOG.prompts} template prompt siap pakai`, true],
  ['Bank soal imtihan tahriri + prompt jawaban', true],
  ['Siap Imtihan: persiapan tahriri & syafawi', true],
  ['Muqaranah qoul ulama 4 madzhab', true],
  ['Semua update fitur ke depan ikut terbuka', true],
];
const AI_ITEMS = [
  ['Semua isi paket Library', true],
  ['Unggah diktat, PDF scan, slide, atau rekaman kuliah', true],
  ['Ringkasan gaya kitab + peta konsep taqsimat', true],
  ["Terjemah & i'rab kalimat, harakat otomatis", true],
  ['Latihan tahriri dinilai AI', true],
  ['Tutor dari materimu + simulasi syafawi', true],
];

// Keunggulan yang memang ada di aplikasi — jangan tambah klaim yang belum dibangun.
const ADVANTAGES = [
  { icon: 'mosque', color: GOLD, tag: 'Library', title: 'Khusus muqarrar Al-Azhar',
    text: `${CATALOG.maddah} maddah S1 & Ma'had disusun per tingkat — bukan materi umum yang harus kamu sesuaikan sendiri.` },
  { icon: 'sparkles', color: GOLD, tag: 'Library', title: `${CATALOG.prompts} prompt siap pakai`,
    text: 'Tinggal salin ke ChatGPT, Claude, atau Gemini. Lengkap dengan rekomendasi AI yang paling cocok per maddah.' },
  { icon: 'target', color: GOLD, tag: 'Library', title: 'Fokus lulus imtihan',
    text: 'Bank soal tahriri dari tahun-tahun sebelumnya, persiapan syafawi, dan muqaranah 4 madzhab.' },
  { icon: 'type', color: EMERALD, tag: 'AI Partner', title: 'Kuat di bahasa Arab',
    text: "Terjemah & i'rab per kalimat, harakat otomatis, mufradat lengkap dengan wazan — dari diktatmu sendiri." },
  { icon: 'headphones', color: EMERALD, tag: 'AI Partner', title: 'Dari diktat & rekaman kuliah',
    text: 'Unggah PDF scan, foto diktat, slide, atau rekaman duktur. Jadi ringkasan, flashcard, kuis, dan latihan.' },
  { icon: 'brain', color: SKY, tag: 'Semua akun', title: 'Menyesuaikan cara belajarmu',
    text: 'Profil Belajar 8 dimensi membuat saran dan penjelasan AI mengikuti level Arab, target, dan gaya belajarmu.' },
];

// [fitur, gratis, library, library+ai] — true = termasuk, false = tidak, string = keterangan.
const COMPARE_ROWS = [
  ['Maddah S1 + Ma\'had', 'Nahwu + 1', `Semua ${CATALOG.maddah}`, `Semua ${CATALOG.maddah}`],
  ['Template prompt per maddah', 'Maddah terbuka', CATALOG.prompts, CATALOG.prompts],
  ['Bank soal imtihan tahriri', '3 soal', 'Semua', 'Semua'],
  ['Siap Imtihan (tahriri & syafawi)', false, true, true],
  ['Muqaranah 4 madzhab', false, true, true],
  ['Kurasah, Statistik & Profil Belajar', true, true, true],
  ['AI Partner: ringkasan, flashcard, kuis, mufradat', '1 materi', '1 materi', true],
  ["AI Partner: i'rab, harakat, tahriri dinilai AI", false, false, true],
  ['AI Partner: tutor & simulasi syafawi', false, false, true],
  ['Unggah rekaman kuliah (audio/video)', false, false, true],
];

const TESTIMONIALS = [
  { text: 'Dari yang awalnya ngerasa gak yakin buat ujian jadi akhirnya yakin dan semangat belajar bisa naik berkat adanya Talqeeh.', color: EMERALD },
  { text: 'Sangat terbantu dengan urutan maddah, contoh prompt dan rekomendasi AI yang digunakan. Untuk latihan melalui Claude sangat bermanfaat dan nyaman.', color: '#a78bfa' },
  { text: 'Setiap prompt yang disediakan Talqeeh langsung menjelaskan materi yang kita perlukan, dengan penjelasan yang mudah.', color: '#f97316' },
];

const FAQS = [
  ['Apa bedanya dengan pakai ChatGPT langsung?',
    'Kamu tidak mulai dari nol. Talqeeh sudah menyiapkan prompt untuk tiap maddah muqarrar Azhar, rekomendasi AI yang paling cocok, dan bank soal imtihan. AI Partner juga dibuat khusus untuk teks Arab: i\'rab, harakat, dan ringkasan gaya kitab.'],
  ['Library bayar sekali atau bulanan?',
    `Sekali bayar ${LIBRARY_PRICE}, aksesnya berlaku selamanya — termasuk semua update fitur Library ke depan. Hanya AI Partner yang berlangganan bulanan, dan itu opsional.`],
  ['Boleh coba gratis dulu?',
    'Boleh. Akun gratis membuka Nahwu + 1 maddah pilihanmu, 3 soal bank soal, dan 1 materi AI Partner. Kalau cocok, upgrade kapan saja — progresmu tetap tersimpan.'],
  ['Bayarnya pakai apa? Berapa lama aktifnya?',
    'Lewat Mayar: QRIS, virtual account, atau e-wallet. Akses aktif otomatis beberapa detik setelah pembayaran, asalkan email checkout sama dengan akun Google-mu.'],
  ['Saya member lama, harus bayar lagi?',
    'Tidak. Minta PIN aktivasi ke admin, lalu masukkan lewat tautan "Member lama? Masukkan PIN" di halaman ini.'],
];

const planFromHash = () => {
  const q = (window.location.hash.split('?')[1] || '');
  const plan = new URLSearchParams(q).get('plan');
  return ['free', 'library', 'library_ai'].includes(plan) ? plan : null;
};

const Mark = ({ ok, color, className = 'w-4 h-4' }) => ok
  ? <Icon name="check" strokeWidth={2.2} className={`${className} flex-shrink-0`} style={{ stroke: color }}/>
  : <Icon name="x" strokeWidth={2} className={`${className} flex-shrink-0`} style={{ stroke: 'rgba(255,255,255,0.28)' }}/>;

const PlanCard = ({ color, icon, badge, title, tagline, price, priceNote, strike, saving, sub, items, cta, ctaClass, onClick, current, selected, recommended }) => {
  const accent = recommended || selected;
  return (
    <div className={`card-glass-strong p-6 md:p-7 relative overflow-hidden flex flex-col transition-transform ${recommended ? 'md:-translate-y-3' : ''}`}
      style={{
        border: `1px solid ${accent ? `${color}99` : 'rgba(255,255,255,0.08)'}`,
        boxShadow: accent ? `0 0 0 1px ${color}55, 0 24px 60px -30px ${color}88` : undefined,
      }}>
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: `${color}22` }}/>
      {badge && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 px-3 py-1 rounded-b-lg text-[10px] font-bold uppercase tracking-wider text-black"
          style={{ background: color }}>{badge}</span>
      )}
      <div className="relative flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-4 mt-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}1f`, border: `1px solid ${color}44` }}>
            <Icon name={icon} className="w-5 h-5" style={{ stroke: color }}/>
          </div>
          <div>
            <div className="font-display text-lg font-semibold text-ink leading-tight">{title}</div>
            <div className="text-xs text-ink-muted">{tagline}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 min-h-[20px]">
          {strike && <span className="text-sm text-ink-soft line-through">{strike}</span>}
          {saving && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: `${color}26`, color }}>{saving}</span>}
        </div>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="font-display text-4xl font-semibold text-ink leading-tight">{price}</span>
          {priceNote && <span className="text-sm text-ink-muted">{priceNote}</span>}
        </div>
        <div className="text-[11px] uppercase tracking-wider text-ink-soft mt-1 mb-5">{sub}</div>
        <div className="h-px bg-white/10 mb-5"/>
        <ul className="space-y-2.5 flex-1 mb-6">
          {items.map(([text, ok]) => (
            <li key={text} className={`flex items-start gap-2.5 text-sm ${ok ? 'text-ink' : 'text-ink-soft line-through decoration-white/20'}`}>
              <span className="mt-0.5"><Mark ok={ok} color={color}/></span>{text}
            </li>
          ))}
        </ul>
        {current ? (
          <div className="text-center text-sm rounded-xl py-3" style={{ color, border: `1px solid ${color}55` }}>Paketmu sekarang</div>
        ) : (
          <button onClick={onClick} className={`${ctaClass} w-full py-3.5 text-sm font-semibold justify-center`}>{cta}</button>
        )}
      </div>
    </div>
  );
};

const CompareCell = ({ value, color }) => {
  if (value === true)  return <span className="inline-flex justify-center"><Mark ok color={color}/></span>;
  if (value === false) return <span className="inline-flex justify-center"><Mark ok={false}/></span>;
  return <span className="text-[11px] md:text-xs text-ink">{value}</span>;
};

// .container-x memakai shorthand `padding`, jadi jarak vertikal harus di elemen luar.
const Section = ({ className = '', sectionRef, children }) => (
  <section ref={sectionRef} className={className}><div className="container-x">{children}</div></section>
);

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="card-glass overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between gap-4 text-left px-5 py-4">
        <span className="text-sm font-medium text-ink">{q}</span>
        <Icon name={open ? 'chevronUp' : 'chevronDown'} className="w-4 h-4 flex-shrink-0 opacity-60"/>
      </button>
      {open && <div className="px-5 pb-4 -mt-1 text-sm text-ink-muted leading-relaxed">{a}</div>}
    </div>
  );
};

const GabungPage = () => {
  const { authStatus, authInfo, session, profile, isFree, redeemPin, refreshMemberSession, startFreeAccount } = useAuth();
  const google   = useGoogleSignIn();
  const settings = useAppSettings();
  const toast    = useToast();
  const panelRef = useRef(null);

  const [plan, setPlan]         = useState(planFromHash());
  const [step, setStep]         = useState(null); // null | pay | waiting | redeem
  const [pollRun, setPollRun]   = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [pin, setPin]           = useState('');
  const [pinError, setPinError] = useState(null);
  const [redeeming, setRedeeming] = useState(false);
  const [startingFree, setStartingFree] = useState(false);
  const [freeError, setFreeError] = useState('');

  const signedOut    = authStatus === 'signed_out' || (authStatus === 'member' && !session);
  const noAccount    = authStatus === 'needs_activation';
  const paidMember   = authStatus === 'member' && !!session && !isFree;
  const email        = authInfo?.email || session?.email || '';
  const payUrl       = safeHttpsUrl(settings.mayarLibraryUrl);
  const aiPriceLabel = settings.aiPriceLabel || 'harga menyusul';
  const adminWa      = (settings.whatsapp || '').replace(/\D/g, '') || DEFAULT_ADMIN_WA;

  // Member lama (pernah login pakai kode di browser ini) langsung ditawari PIN.
  useEffect(() => { if (noAccount && authInfo?.likelyLegacyMember) setStep('redeem'); }, [noAccount]);

  // Plan dari tautan (?plan=library) langsung membuka panel bayar untuk yang sudah login.
  useEffect(() => {
    if ((noAccount || isFree) && (plan === 'library' || plan === 'library_ai') && step === null) setStep('pay');
  }, [noAccount, isFree]);

  useEffect(() => {
    if (step) setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }, [step]);

  // Pembayaran/PIN berhasil → akun berbayar.
  useEffect(() => {
    if (!paidMember || !step) return;
    saveJoinPlanLocal(null);
    toast.push('Selamat, akses Library-mu sudah aktif!');
    navigate('/dashboard');
    if (plan === 'library_ai') setTimeout(() => window.dispatchEvent(new CustomEvent('talqeeh:open-join', { detail: { plan: 'library_ai' } })), 600);
  }, [paidMember]);

  // Menunggu webhook Mayar: cek status tiap 5 detik, maksimal 10 menit.
  useEffect(() => {
    if (step !== 'waiting') return;
    setTimedOut(false);
    const started = Date.now();
    const timer = setInterval(() => {
      if (Date.now() - started > PAYMENT_WAIT_LIMIT_MS) { setTimedOut(true); clearInterval(timer); return; }
      refreshMemberSession();
    }, 5000);
    return () => clearInterval(timer);
  }, [step, pollRun]);

  const requireLogin = (nextPlan) => {
    saveJoinPlanLocal(nextPlan);
    setPlan(nextPlan);
    window.dispatchEvent(new CustomEvent('talqeeh:open-login', { detail: { keepPlan: true } }));
  };

  const choosePaid = (nextPlan) => {
    if (signedOut) { requireLogin(nextPlan); return; }
    if (paidMember) {
      if (nextPlan === 'library_ai') window.dispatchEvent(new CustomEvent('talqeeh:open-join', { detail: { plan: 'library_ai' } }));
      else navigate('/dashboard');
      return;
    }
    setPlan(nextPlan);
    setStep('pay');
  };

  const chooseFree = async () => {
    if (signedOut) { requireLogin('free'); return; }
    setStartingFree(true);
    setFreeError('');
    const r = await startFreeAccount();
    setStartingFree(false);
    if (!r.ok) { setFreeError('Gagal membuat akun gratis. Coba lagi sebentar, atau hubungi admin.'); return; }
    saveJoinPlanLocal(null);
    toast.push('Akun gratismu sudah aktif. Selamat belajar!');
    navigate('/dashboard');
  };

  const openPayment = () => {
    if (!payUrl) return;
    window.open(payUrl, '_blank', 'noopener,noreferrer');
    setStep('waiting');
  };

  const pinComplete = pin.replace(/-/g, '').length === 8;
  const handleRedeem = async (e) => {
    e?.preventDefault();
    if (!pinComplete || redeeming) return;
    setRedeeming(true);
    setPinError(null);
    const r = await redeemPin(pin);
    setRedeeming(false);
    if (r.ok) toast.push('Akun berhasil terhubung. Selamat datang kembali!');
    else setPinError(ACTIVATION_ERRORS[r.status] || ACTIVATION_ERRORS.error);
  };

  const askPinMessage = encodeURIComponent(`Assalamu'alaikum admin Talqeeh, saya member lama dan mau pindah ke login Google (${email}). Mohon dikirimkan PIN aktivasi 🙏`);
  const waMessage = encodeURIComponent(
    `Assalamu'alaikum admin Talqeeh, saya sudah bayar paket ${PLAN_LABELS[plan] || 'Library'} dengan email ${email} (${new Date().toLocaleString('id-ID')}), tapi aksesnya belum aktif. Mohon dicek 🙏`
  );

  if (authStatus === 'loading') {
    return <div className="container-x py-16"><div className="card-glass p-6 max-w-xl mx-auto"><Skeleton lines={3}/></div></div>;
  }

  return (
    <div className="page-enter">
      {/* Hero */}
      <Section className="pt-8 md:pt-14 pb-6 text-center relative">
        <div className="absolute inset-x-0 top-0 h-72 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,106,0.16), transparent 65%)' }}/>
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] mb-4"
            style={{ background: 'rgba(201,168,106,0.12)', color: GOLD, border: '1px solid rgba(201,168,106,0.3)' }}>
            <Icon name="mosque" className="w-3.5 h-3.5" style={{ stroke: GOLD }}/> Gabung Talqeeh
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-semibold text-ink leading-tight mb-3 max-w-3xl mx-auto">
            {isFree
              ? <>Buka semua yang kamu butuhkan untuk <span style={{ color: GOLD }}>lulus imtihan</span></>
              : <>Belajar muqarrar Azhar jadi <span style={{ color: GOLD }}>lebih terarah</span> dengan AI</>}
          </h1>
          <p className="text-ink-muted max-w-2xl mx-auto">
            {isFree
              ? 'Kamu sedang memakai akun gratis. Upgrade ke Library untuk membuka semua maddah, bank soal, dan persiapan imtihan — sekali bayar, selamanya.'
              : `${CATALOG.maddah} maddah, ${CATALOG.prompts} prompt siap pakai, bank soal imtihan, dan AI Partner yang paham teks Arab. Mulai gratis, upgrade kapan saja.`}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 max-w-3xl mx-auto mt-7">
            {[
              [CATALOG.maddah, 'maddah S1 + Ma\'had', GOLD],
              [CATALOG.prompts, 'template prompt', GOLD],
              ['113+', 'member Masisir', EMERALD],
              ['8', 'dimensi Profil Belajar', SKY],
            ].map(([n, label, c]) => (
              <div key={label} className="card-glass px-3 py-3">
                <div className="font-display text-2xl font-semibold" style={{ color: c }}>{n}</div>
                <div className="text-[11px] text-ink-muted">{label}</div>
              </div>
            ))}
          </div>

          {email && (
            <div className="inline-flex items-center gap-2 mt-6 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-ink-muted">
              Masuk sebagai <span className="text-ink">{email}</span>
              <button onClick={google.switchAccount} className="text-emerald-300 hover:text-emerald-200 underline underline-offset-2">ganti</button>
            </div>
          )}
        </div>
      </Section>

      {/* Paket */}
      <Section className="pt-4 pb-8">
        {paidMember && !step && (
          <div className="card-glass p-5 max-w-3xl mx-auto mb-8 flex items-center gap-4 flex-wrap" style={{ border: '1px solid rgba(62,207,142,0.3)' }}>
            <Icon name="check" className="w-5 h-5" style={{ stroke: EMERALD }}/>
            <div className="flex-1 min-w-[200px] text-sm text-ink">Kamu sudah member Library. Tambah AI Partner kalau mau belajar langsung dari materimu.</div>
            <button onClick={() => navigate('/dashboard')} className="btn btn-ghost text-sm px-4 py-2">Ke Beranda</button>
          </div>
        )}
        <div className="grid md:grid-cols-3 gap-5 md:gap-4 max-w-6xl mx-auto items-stretch md:pt-4">
          <PlanCard color={SKY} icon="leaf" title="Gratis" tagline="Coba dulu, rasakan bedanya"
            price="Rp 0" sub="Tanpa kartu · tanpa pembayaran" items={FREE_ITEMS}
            current={isFree} selected={plan === 'free'} ctaClass="btn btn-ghost"
            cta={startingFree ? 'Menyiapkan akun…' : paidMember ? 'Sudah termasuk di Library' : 'Mulai gratis'}
            onClick={paidMember ? () => navigate('/dashboard') : chooseFree}/>
          <PlanCard color={GOLD} icon="bookOpen" badge="Paling populer" recommended title="Library" tagline="Semua bekal belajar & imtihan"
            price={LIBRARY_PRICE} strike={LIBRARY_PRICE_ORIGINAL} saving="Hemat 29%" sub="Sekali bayar · akses selamanya"
            items={LIBRARY_ITEMS} current={paidMember} selected={plan === 'library'} ctaClass="btn btn-gold"
            cta={isFree ? 'Upgrade ke Library' : 'Pilih Library'} onClick={() => choosePaid('library')}/>
          <PlanCard color={EMERALD} icon="sparkles" title="Library + AI Partner" tagline="Belajar langsung dari diktatmu"
            price={LIBRARY_PRICE} priceNote={settings.aiPriceLabel ? `+ ${settings.aiPriceLabel}/bln` : '+ AI Partner bulanan'}
            sub={settings.aiPriceLabel ? 'Library sekali bayar · AI Partner bulanan' : 'Harga AI Partner segera diumumkan'}
            items={AI_ITEMS} selected={plan === 'library_ai'} ctaClass="btn btn-primary"
            cta={paidMember ? 'Berlangganan AI Partner' : 'Pilih Library + AI'} onClick={() => choosePaid('library_ai')}/>
        </div>
        {freeError && <div className="text-sm text-rose-400 text-center mt-4">{freeError}</div>}

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-7 text-xs text-ink-muted">
          {[
            ['shield', 'Bayar aman lewat Mayar'],
            ['refresh', 'Akses aktif otomatis'],
            ['grid', 'QRIS · Virtual Account · E-wallet'],
            ['heart', 'Progres gratis tetap tersimpan'],
          ].map(([icon, label]) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              <Icon name={icon} className="w-3.5 h-3.5 opacity-70"/>{label}
            </span>
          ))}
        </div>
      </Section>

      {/* Panel bayar / tunggu / PIN */}
      <Section sectionRef={panelRef} className="pb-10 scroll-mt-24">
        {step === 'pay' && (
          <div className="card-glass-strong p-6 md:p-8 max-w-2xl mx-auto">
            <h2 className="font-display text-2xl font-semibold text-ink mb-1">Bayar paket {PLAN_LABELS[plan] || 'Library'}</h2>
            <p className="text-sm text-ink-muted mb-5">
              {LIBRARY_PRICE} · sekali bayar{plan === 'library_ai' && <> — langganan AI Partner ({aiPriceLabel}) di langkah berikutnya</>}
            </p>
            <div className="card-glass p-4 mb-5">
              <StepList items={[
                <>Klik <span className="text-ink">Bayar di Mayar</span>, halaman pembayaran terbuka di tab baru.</>,
                <span>
                  Isi email checkout dengan <span className="text-ink font-medium">{email}</span>{' '}
                  <button onClick={() => { navigator.clipboard.writeText(email); toast.push('Email tersalin'); }} className="text-emerald-300 hover:text-emerald-200 underline underline-offset-2">salin</button>
                  <span className="block text-[11px] text-amber-300/90 mt-0.5">Wajib sama dengan akun Google-mu, supaya akses aktif otomatis.</span>
                </span>,
                'Selesaikan pembayaran (QRIS, virtual account, atau e-wallet).',
                isFree ? 'Kembali ke tab ini — akun gratismu otomatis naik ke Library, progresmu tetap aman.' : 'Kembali ke tab ini — akses aktif otomatis dalam hitungan detik.',
              ]}/>
            </div>
            {payUrl ? (
              <button onClick={openPayment} className="btn btn-gold w-full text-base py-3.5 font-semibold">Bayar {LIBRARY_PRICE} di Mayar</button>
            ) : (
              <div className="card-glass p-4 text-sm text-ink-muted text-center">
                Pembayaran online sedang disiapkan.{' '}
                <a href={`https://wa.me/${adminWa}`} target="_blank" rel="noopener noreferrer" className="text-emerald-300 underline underline-offset-2">Hubungi admin</a>{' '}untuk bergabung.
              </div>
            )}
            <button onClick={() => setStep(null)} className="w-full text-center text-xs text-ink-soft hover:text-ink-muted mt-4">Batal</button>
          </div>
        )}

        {step === 'waiting' && (
          <div className="card-glass-strong p-6 md:p-8 max-w-2xl mx-auto text-center">
            {!timedOut ? (
              <>
                <div className="w-12 h-12 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-5"/>
                <h2 className="font-display text-2xl font-semibold text-ink mb-2">Menunggu pembayaran…</h2>
                <p className="text-sm text-ink-muted leading-relaxed mb-5">
                  Selesaikan pembayaran di tab Mayar. Halaman ini otomatis lanjut begitu pembayaranmu terkonfirmasi — biasanya kurang dari 1 menit.
                </p>
                <button onClick={openPayment} className="text-xs text-emerald-300 hover:text-emerald-200 underline underline-offset-2">Buka lagi halaman pembayaran</button>
              </>
            ) : (
              <>
                <h2 className="font-display text-2xl font-semibold text-ink mb-2">Pembayaran belum terdeteksi</h2>
                <p className="text-sm text-ink-muted leading-relaxed mb-5">
                  Kalau sudah bayar tapi belum aktif (misalnya email checkout berbeda dengan {email}), kabari admin — kami aktifkan manual.
                </p>
                <div className="flex gap-2 max-w-sm mx-auto">
                  <button onClick={() => setPollRun(n => n + 1)} className="btn btn-ghost flex-1 text-sm">Cek lagi</button>
                  <a href={`https://wa.me/${adminWa}?text=${waMessage}`} target="_blank" rel="noopener noreferrer" className="btn btn-gold flex-1 text-sm">Hubungi admin</a>
                </div>
              </>
            )}
          </div>
        )}

        {step === 'redeem' && (
          <form onSubmit={handleRedeem} className="card-glass-strong p-6 md:p-8 max-w-lg mx-auto">
            <h2 className="font-display text-2xl font-semibold text-ink mb-2">Masukkan PIN aktivasi</h2>
            <p className="text-sm text-ink-muted mb-5 leading-relaxed">
              Untuk member lama atau member yang didaftarkan admin. PIN dikirim admin lewat WhatsApp — masukkan sekali untuk
              menghubungkan keanggotaan, catatan, dan progressmu ke akun Google <span className="text-ink">{email}</span>.
              {isFree && <span className="block text-amber-300/90 text-xs mt-2">Akun gratismu akan diganti keanggotaan lama. Catatan & progres di akun gratis tidak ikut dipindah.</span>}
            </p>
            <input value={pin} onChange={e => { setPin(formatPinInput(e.target.value)); setPinError(null); }}
              placeholder="XXXX-XXXX" maxLength={9} autoComplete="one-time-code"
              className="code-input w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-xl text-ink text-center tracking-[0.3em] placeholder:text-ink-soft focus:outline-none"/>
            <ErrorBox message={pinError}/>
            <button type="submit" disabled={!pinComplete || redeeming}
              className={`btn btn-primary w-full mt-5 ${!pinComplete || redeeming ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {redeeming ? 'Memverifikasi...' : 'Hubungkan akun'}
            </button>
            <div className="mt-4 flex flex-col items-center gap-2 text-xs">
              <a href={`https://wa.me/${adminWa}?text=${askPinMessage}`} target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:text-emerald-200 underline underline-offset-2">
                Belum dapat PIN? Minta ke admin
              </a>
              <button type="button" onClick={() => setStep(null)} className="text-ink-soft hover:text-ink-muted">Tutup</button>
            </div>
          </form>
        )}

        {(noAccount || isFree) && step !== 'redeem' && (
          <div className="text-center mt-6 text-sm">
            <button onClick={() => setStep('redeem')} className="text-emerald-300 hover:text-emerald-200 underline underline-offset-2">
              Member lama? Masukkan PIN aktivasi dari admin
            </button>
          </div>
        )}
        {signedOut && (
          <div className="max-w-sm mx-auto mt-6 text-center">
            <p className="text-xs text-ink-soft mb-3">Semua paket memakai akun Google sebagai identitas.</p>
            <GoogleButton onClick={google.start} loading={google.loading}/>
            <ErrorBox message={google.error}/>
          </div>
        )}
      </Section>

      {/* Kenapa Talqeeh */}
      <Section className="py-12 md:py-16">
        <div className="text-center mb-9">
          <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-2">Kenapa Talqeeh</div>
          <h2 className="font-display text-2xl md:text-4xl font-semibold text-ink leading-tight">Dibuat khusus untuk Masisir, bukan AI umum</h2>
          <p className="text-ink-muted max-w-xl mx-auto mt-3 text-sm md:text-base">
            ChatGPT bisa menjawab apa saja — Talqeeh menyiapkan jalannya: maddah yang tepat, prompt yang teruji, dan latihan yang mengarah ke imtihan.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-4 max-w-6xl mx-auto">
          {ADVANTAGES.map(a => (
            <div key={a.title} className="card-glass p-3.5 md:p-6 relative overflow-hidden min-w-0">
              <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: `${a.color}18` }}/>
              <div className="relative">
                <div className="flex flex-col-reverse md:flex-row items-start md:items-center md:justify-between gap-2 mb-3 md:mb-4">
                  <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center" style={{ background: `${a.color}1a`, border: `1px solid ${a.color}40` }}>
                    <Icon name={a.icon} className="w-5 h-5" style={{ stroke: a.color }}/>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color: a.color, background: `${a.color}17` }}>{a.tag}</span>
                </div>
                <div className="font-display text-sm md:text-lg font-semibold text-ink mb-1.5 leading-snug">{a.title}</div>
                <p className="text-xs md:text-sm text-ink-muted leading-relaxed">{a.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Perbandingan */}
      <Section className="pb-12 md:pb-16">
        <div className="text-center mb-7">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">Bandingkan paketnya</h2>
          <p className="text-sm text-ink-muted mt-2">Semua yang kamu dapat, dalam satu tabel.</p>
        </div>
        <div className="card-glass-strong max-w-4xl mx-auto overflow-hidden">
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left font-medium text-ink-muted text-xs px-3 md:px-5 py-4 w-[34%] md:w-[40%]">Fitur</th>
                {[['Gratis', SKY], ['Library', GOLD], ['Library + AI', EMERALD]].map(([label, c]) => (
                  <th key={label} className="px-1.5 md:px-3 py-4 text-center font-display font-semibold text-xs md:text-sm leading-tight" style={{ color: c }}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map(([label, ...vals]) => (
                <tr key={label} className="border-b border-white/5 last:border-0">
                  <td className="px-3 md:px-5 py-3 text-ink text-[11px] md:text-[13px] leading-snug">{label}</td>
                  {vals.map((v, i) => (
                    <td key={i} className="px-1.5 md:px-3 py-3 text-center leading-tight" style={i === 1 ? { background: 'rgba(201,168,106,0.05)' } : undefined}>
                      <CompareCell value={v} color={[SKY, GOLD, EMERALD][i]}/>
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-white/10">
                <td className="px-3 md:px-5 py-4 text-ink-muted text-xs">Harga</td>
                <td className="px-1.5 md:px-3 py-4 text-center text-ink font-semibold text-xs md:text-sm">Rp 0</td>
                <td className="px-1.5 md:px-3 py-4 text-center text-ink font-semibold text-xs md:text-sm" style={{ background: 'rgba(201,168,106,0.05)' }}>{LIBRARY_PRICE}<div className="text-[10px] text-ink-soft font-normal">sekali bayar</div></td>
                <td className="px-1.5 md:px-3 py-4 text-center text-ink font-semibold text-xs md:text-sm">{LIBRARY_PRICE}<div className="text-[10px] text-ink-soft font-normal">+ {settings.aiPriceLabel ? `${settings.aiPriceLabel}/bln` : 'AI bulanan'}</div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* Testimoni */}
      <Section className="pb-12 md:pb-16">
        <div className="text-center mb-7">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">113+ member sudah merasakan manfaatnya</h2>
          <p className="text-sm text-ink-muted mt-2">Dari Masisir, untuk Masisir.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-4 max-w-6xl mx-auto">
          {TESTIMONIALS.map(t => (
            <div key={t.text} className="card-glass p-3.5 md:p-5 flex flex-col gap-3 md:gap-4 min-w-0">
              <div className="flex gap-0.5">
                {[0, 1, 2, 3, 4].map(i => <Icon key={i} name="star" className="w-3.5 h-3.5" style={{ stroke: '#fbbf24', fill: '#fbbf24' }}/>)}
              </div>
              <p className="text-xs md:text-sm text-ink leading-relaxed flex-1">“{t.text}”</p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black" style={{ background: t.color }}>M</div>
                <div>
                  <div className="text-xs font-medium text-ink">Member Talqeeh</div>
                  <div className="text-[11px] text-ink-soft">Al-Azhar Cairo</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section className="pb-12 md:pb-16">
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink text-center mb-7">Pertanyaan yang sering muncul</h2>
        <div className="max-w-2xl mx-auto space-y-2.5">
          {FAQS.map(([q, a]) => <FaqItem key={q} q={q} a={a}/>)}
        </div>
      </Section>

      {/* Ajakan penutup */}
      {!paidMember && (
        <Section className="pb-16">
          <div className="card-glass-strong max-w-4xl mx-auto p-7 md:p-10 text-center relative overflow-hidden"
            style={{ border: '1px solid rgba(201,168,106,0.35)' }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 120%, rgba(201,168,106,0.18), transparent 60%)' }}/>
            <div className="relative">
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink mb-2">
                {isFree ? 'Siap buka semua maddah?' : 'Imtihan berikutnya, datang lebih siap.'}
              </h2>
              <p className="text-sm text-ink-muted mb-6 max-w-lg mx-auto">
                {isFree
                  ? `Upgrade sekali ${LIBRARY_PRICE}, semua maddah, bank soal, dan Siap Imtihan terbuka selamanya.`
                  : `Mulai gratis hari ini, atau langsung buka semuanya dengan Library ${LIBRARY_PRICE} sekali bayar.`}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <button onClick={() => choosePaid('library')} className="btn btn-gold flex-1 py-3.5 text-sm font-semibold justify-center">
                  {isFree ? 'Upgrade ke Library' : `Pilih Library · ${LIBRARY_PRICE}`}
                </button>
                {!isFree && (
                  <button onClick={chooseFree} disabled={startingFree} className="btn btn-ghost flex-1 py-3.5 text-sm font-semibold justify-center">
                    {startingFree ? 'Menyiapkan akun…' : 'Coba gratis dulu'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </Section>
      )}
    </div>
  );
};

window.GabungPage = GabungPage;
