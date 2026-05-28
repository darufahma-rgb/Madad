/* Talqeeh — Welcome Page (muncul sekali setelah onboarding selesai) */

const WelcomePage = () => {
  const { session, profile } = useAuth();
  const toast = useToast();

  if (!session || !profile?.onboarded) { navigate("/"); return null; }

  const myMaddahs = (typeof getMaddahsForProfile !== "undefined")
    ? getMaddahsForProfile(profile).filter(m => m.prompts && Object.values(m.prompts).some(a => a.length > 0)).slice(0, 3)
    : [];

  const firstName = session.name.split(" ")[0];

  const starterPack = (typeof generateStarterPack !== "undefined")
    ? generateStarterPack(profile, session)
    : null;

  const handleCopyStarter = () => {
    if (!starterPack) return;
    navigator.clipboard.writeText(starterPack);
    toast.push("Starter Pack tersalin — paste ke AI di awal chat.");
  };

  return (
    <div className="page-enter min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 pattern-talqih opacity-50 pointer-events-none"/>
      <Blob color="rgba(124,77,255,0.25)" size={600} top={-200} right={-100}/>
      <Blob color="rgba(201,168,106,0.12)" size={400} top={300} left={-150}/>

      <div className="container-x relative py-16 md:py-24 max-w-3xl mx-auto">

        {/* Header */}
        <Reveal className="text-center mb-12">
          <div className="arabic-classic text-gold-300 text-3xl mb-4" style={{direction:"rtl"}}>
            أَهْلاً وَسَهْلاً
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-semibold text-ink leading-tight mb-4">
            Selamat datang,<br/>
            <span className="bg-gradient-to-br from-violet-300 to-gold-400 bg-clip-text text-transparent">{firstName}.</span>
          </h1>
          <p className="text-lg text-ink-muted max-w-lg mx-auto leading-relaxed">
            Talqeeh sudah mengenalmu. Dashboard sudah disiapkan khusus untukmu.
          </p>
        </Reveal>

        {/* Maddah-mu */}
        {myMaddahs.length > 0 && (
          <Reveal className="mb-10">
            <div className="text-xs uppercase tracking-[0.2em] text-gold-400 mb-4 flex items-center gap-2">
              <span className="w-5 h-px bg-gold-500/60"/>
              Maddah untuk fakultas & tingkatmu
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {myMaddahs.map(m => (
                <div key={m.id} onClick={() => navigate("/maddah/" + m.id)}
                  className="card-glass p-4 cursor-pointer hov-lift">
                  <div className="arabic-display text-gold-300 text-xl mb-1" style={{direction:"rtl"}}>{m.nameArabic}</div>
                  <div className="font-display text-base font-semibold text-ink mb-1">{m.name}</div>
                  <div className="text-xs text-ink-soft">
                    {Object.values(m.prompts).reduce((s, a) => s + a.length, 0)} prompt
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {/* Starter Pack */}
        {starterPack && (
          <Reveal className="mb-10">
            <div className="card-glass-strong p-6 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gold-500/10 blur-3xl pointer-events-none"/>
              <div className="relative">
                <div className="text-xs uppercase tracking-[0.2em] text-gold-400 mb-2 font-medium">✦ Langkah pertama</div>
                <h3 className="font-display text-xl font-semibold text-ink mb-2">Kenalkan dirimu ke AI</h3>
                <p className="text-sm text-ink-muted mb-4 leading-relaxed">
                  Sebelum mulai, paste ini ke AI favoritmu. AI langsung tahu siapa kamu dan cara menjelaskan yang paling pas.
                </p>
                <div className="p-3 rounded-lg bg-white/3 border border-line mb-4">
                  <p className="text-xs text-ink-soft font-mono leading-relaxed line-clamp-3">{starterPack.slice(0, 200)}...</p>
                </div>
                <button onClick={handleCopyStarter} className="btn btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
                  <Icon name="copy" className="w-3.5 h-3.5"/>
                  Salin Starter Pack
                </button>
              </div>
            </div>
          </Reveal>
        )}

        {/* CTA ke Dashboard */}
        <Reveal className="text-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-primary px-8 py-4 text-base font-medium"
          >
            Masuk ke Dashboardku →
          </button>
          <p className="text-xs text-ink-soft mt-3">
            Halaman ini hanya muncul sekali. Selamat belajar!
          </p>
        </Reveal>

      </div>
    </div>
  );
};

window.WelcomePage = WelcomePage;
