import React, { useState, useEffect, useRef } from 'react';
/* Talqeeh — halaman Gabung: pilih Gratis / Library / Library + AI, bayar di Mayar, atau tukar PIN member lama */

const JOIN_PLAN_KEY = 'talqeeh_join_plan';
const saveJoinPlanLocal = (plan) => { try { plan ? localStorage.setItem(JOIN_PLAN_KEY, plan) : localStorage.removeItem(JOIN_PLAN_KEY); } catch {} };

const FREE_FEATURES = [
  'Maddah Nahwu + 1 maddah pilihanmu',
  '3 soal bank soal imtihan',
  'Coba AI Partner: 1 materi (ringkasan, flashcard, kuis, mufradat)',
  'Kurasah & Statistik Belajarku',
];

const planFromHash = () => {
  const q = (window.location.hash.split('?')[1] || '');
  const plan = new URLSearchParams(q).get('plan');
  return ['free', 'library', 'library_ai'].includes(plan) ? plan : null;
};

const PlanCard = ({ tone, badge, title, price, strike, sub, features, cta, onClick, current, highlight }) => {
  const t = {
    free:    { border: 'rgba(96,165,250,0.35)',  glow: 'rgba(96,165,250,0.12)', check: 'text-sky-300',     btn: 'btn btn-ghost' },
    library: { border: 'rgba(201,168,106,0.45)', glow: 'rgba(201,168,106,0.14)', check: 'text-gold-400',   btn: 'btn btn-gold' },
    ai:      { border: 'rgba(62,207,142,0.45)',  glow: 'rgba(62,207,142,0.14)', check: 'text-emerald-400', btn: 'btn btn-primary' },
  }[tone];
  return (
    <div className="card-glass-strong p-6 md:p-7 relative overflow-hidden flex flex-col"
      style={{ border: `1px solid ${highlight ? t.border : 'rgba(255,255,255,0.08)'}`, boxShadow: highlight ? `0 0 0 1px ${t.border}` : undefined }}>
      <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl pointer-events-none" style={{ background: t.glow }}/>
      {badge && <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500 text-black">{badge}</span>}
      <div className="relative flex flex-col flex-1">
        <div className="font-display text-lg font-semibold text-ink mb-3">{title}</div>
        {strike && <div className="text-sm text-ink-soft line-through">{strike}</div>}
        <div className="font-display text-3xl font-semibold text-ink leading-tight">{price}</div>
        <div className="text-[11px] uppercase tracking-wider text-ink-soft mt-1 mb-5">{sub}</div>
        <ul className="space-y-2.5 flex-1 mb-6">
          {features.map(f => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-ink">
              <Icon name="check" className={`w-4 h-4 mt-0.5 flex-shrink-0 ${t.check}`}/>{f}
            </li>
          ))}
        </ul>
        {current ? (
          <div className="text-center text-sm text-sky-300 border border-sky-400/30 rounded-xl py-3">Paketmu sekarang</div>
        ) : (
          <button onClick={onClick} className={`${t.btn} w-full py-3.5 text-sm font-semibold justify-center`}>{cta}</button>
        )}
      </div>
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
    navigate(profile?.onboarded ? '/dashboard' : '/onboarding');
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
    navigate('/onboarding');
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
      <section className="container-x pt-8 md:pt-14 pb-8 text-center">
        <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-3">Gabung Talqeeh</div>
        <h1 className="font-display text-3xl md:text-5xl font-semibold text-ink leading-tight mb-3">
          {isFree ? 'Buka semua fitur Talqeeh' : 'Pilih cara belajarmu'}
        </h1>
        <p className="text-ink-muted max-w-xl mx-auto">
          {isFree
            ? 'Kamu sedang memakai akun gratis. Upgrade ke Library untuk membuka semua maddah, bank soal, dan fitur lainnya.'
            : 'Belum yakin? Mulai dari akun gratis dulu — upgrade kapan saja tanpa kehilangan progres.'}
        </p>
        {email && (
          <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-ink-muted">
            Masuk sebagai <span className="text-ink">{email}</span>
            <button onClick={google.switchAccount} className="text-emerald-300 hover:text-emerald-200 underline underline-offset-2">ganti</button>
          </div>
        )}
      </section>

      <section className="container-x pb-8">
        {paidMember && !step && (
          <div className="card-glass p-5 max-w-3xl mx-auto mb-6 flex items-center gap-4 flex-wrap" style={{ border: '1px solid rgba(62,207,142,0.3)' }}>
            <Icon name="check" className="w-5 h-5 text-emerald-300"/>
            <div className="flex-1 min-w-[200px] text-sm text-ink">Kamu sudah member Library. Tambah AI Partner kalau mau belajar langsung dari materimu.</div>
            <button onClick={() => navigate('/dashboard')} className="btn btn-ghost text-sm px-4 py-2">Ke Beranda</button>
          </div>
        )}
        <div className="grid md:grid-cols-3 gap-4 max-w-6xl mx-auto items-stretch">
          <PlanCard tone="free" title="Gratis" price="Rp 0" sub="Coba dulu · tanpa kartu atau pembayaran"
            features={FREE_FEATURES} current={isFree} highlight={plan === 'free'}
            cta={startingFree ? 'Menyiapkan akun…' : paidMember ? 'Sudah termasuk di Library' : 'Mulai gratis'}
            onClick={paidMember ? () => navigate('/dashboard') : chooseFree}/>
          <PlanCard tone="library" title="Library" price={LIBRARY_PRICE} strike={LIBRARY_PRICE_ORIGINAL} sub="Sekali bayar · berlaku selamanya"
            features={LIBRARY_FEATURES.slice(0, 6)} highlight={plan === 'library'} current={paidMember}
            cta={isFree ? 'Upgrade ke Library' : 'Pilih Library'} onClick={() => choosePaid('library')}/>
          <PlanCard tone="ai" badge="Paling lengkap" title="Library + AI Partner" price={`${LIBRARY_PRICE} + ${aiPriceLabel}`}
            sub="Library sekali bayar · AI Partner bulanan"
            features={['Semua isi paket Library', ...AI_PARTNER_FEATURES.slice(0, 4)]} highlight={plan === 'library_ai'}
            cta={paidMember ? 'Berlangganan AI Partner' : 'Pilih Library + AI'} onClick={() => choosePaid('library_ai')}/>
        </div>
        {freeError && <div className="text-sm text-rose-400 text-center mt-4">{freeError}</div>}
      </section>

      {/* Panel bayar / tunggu / PIN */}
      <section ref={panelRef} className="container-x pb-10 scroll-mt-24">
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
      </section>
    </div>
  );
};

window.GabungPage = GabungPage;
