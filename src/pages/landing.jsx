/* Madad — Landing page v4: cinematic redesign dengan font Arab hidup dan pola geometrik Islam */

const { useState, useEffect, useRef } = React;

/* ── Inline styles injected once ──────────────────────────────── */
const LANDING_STYLES = `
  /* ── Fonts ── */
  .kali-display  { font-family: "Reem Kufi", "Noto Kufi Arabic", sans-serif; direction: rtl; }
  .kali-elegant  { font-family: "Aref Ruqaa", "Amiri", serif; direction: rtl; }
  .kali-body     { font-family: "Noto Naskh Arabic", "Amiri", serif; direction: rtl; }

  /* ── Keyframes ── */
  @keyframes floatY {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    50%      { transform: translateY(-22px) rotate(1deg); }
  }
  @keyframes floatY2 {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    33%      { transform: translateY(-14px) rotate(-0.8deg); }
    66%      { transform: translateY(-8px) rotate(0.4deg); }
  }
  @keyframes floatSlow {
    0%,100% { transform: translateY(0px) translateX(0px); }
    25%      { transform: translateY(-10px) translateX(6px); }
    75%      { transform: translateY(6px) translateX(-4px); }
  }
  @keyframes shimmerText {
    0%   { background-position: 200% center; }
    100% { background-position: -200% center; }
  }
  @keyframes rotateSlow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes rotateReverse {
    from { transform: rotate(360deg); }
    to   { transform: rotate(0deg); }
  }
  @keyframes pulseRing {
    0%   { transform: scale(1);   opacity: 0.5; }
    70%  { transform: scale(1.6); opacity: 0; }
    100% { transform: scale(1.6); opacity: 0; }
  }
  @keyframes marqueeLTR {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes goldGlow {
    0%,100% { text-shadow: 0 0 24px rgba(201,168,106,0.4), 0 2px 8px rgba(0,0,0,0.5); }
    50%      { text-shadow: 0 0 60px rgba(201,168,106,0.85), 0 0 120px rgba(201,168,106,0.35), 0 2px 8px rgba(0,0,0,0.5); }
  }
  @keyframes goldGlowSubtle {
    0%,100% { text-shadow: 0 0 16px rgba(201,168,106,0.25); }
    50%      { text-shadow: 0 0 36px rgba(201,168,106,0.55), 0 0 70px rgba(201,168,106,0.2); }
  }
  @keyframes scanBeam {
    0%   { transform: translateX(-120%) skewX(-12deg); opacity: 0; }
    8%   { opacity: 1; }
    92%  { opacity: 0.6; }
    100% { transform: translateX(220%) skewX(-12deg); opacity: 0; }
  }
  @keyframes starAppear {
    0%   { opacity: 0; transform: scale(0); }
    50%  { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0); }
  }
  @keyframes breathe {
    0%,100% { transform: scale(1); opacity: 0.6; }
    50%      { transform: scale(1.08); opacity: 1; }
  }
  @keyframes inkReveal {
    0%   { opacity: 0; transform: translateY(16px) scale(0.97); filter: blur(4px); }
    100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
  }
  @keyframes borderFlow {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes patternDrift {
    0%   { background-position: 0px 0px; }
    100% { background-position: 80px 80px; }
  }

  /* ── Utility classes ── */
  .landing-float        { animation: floatY 8s ease-in-out infinite; }
  .landing-float2       { animation: floatY2 11s ease-in-out infinite; }
  .landing-float-slow   { animation: floatSlow 14s ease-in-out infinite; }
  .landing-rotate       { animation: rotateSlow 50s linear infinite; }
  .landing-rotate-rev   { animation: rotateReverse 38s linear infinite; }
  .landing-breathe      { animation: breathe 5s ease-in-out infinite; }
  .landing-glow         { animation: goldGlow 3.5s ease-in-out infinite; }
  .landing-glow-subtle  { animation: goldGlowSubtle 5s ease-in-out infinite; }
  .landing-ink-reveal   { animation: inkReveal 0.9s cubic-bezier(0.22,1,0.36,1) both; }
  .marquee-track        { animation: marqueeLTR 28s linear infinite; }

  .gradient-text-live {
    background: linear-gradient(120deg, #DBC8FF 0%, #E8D0A0 28%, #A970FF 55%, #E8D0A0 78%, #DBC8FF 100%);
    background-size: 300% auto;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: shimmerText 5s linear infinite;
  }

  /* ── Hero background calligraphy — Lalezar font ── */
  .hero-kali {
    font-family: "Lalezar", "Noto Naskh Arabic", serif;
    direction: rtl;
    line-height: 1.4;
    background: linear-gradient(160deg, rgba(217,189,133,0.95) 0%, rgba(201,168,106,0.6) 50%, rgba(169,112,255,0.3) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    pointer-events: none;
    user-select: none;
  }
  .hero-kali-side {
    font-family: "Aref Ruqaa", serif;
    direction: rtl;
    line-height: 1.9;
    pointer-events: none;
    user-select: none;
  }

  /* ── Islamic geometric pattern overlay ── */
  .pattern-geo {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpolygon points='40,4 47,22 66,16 54,33 72,40 54,47 66,64 47,58 40,76 33,58 14,64 26,47 8,40 26,33 14,16 33,22' fill='none' stroke='rgba(201,168,106,0.12)' stroke-width='0.7'/%3E%3Cpolygon points='40,16 46,28 59,28 59,52 46,52 40,64 34,52 21,52 21,28 34,28' fill='none' stroke='rgba(169,112,255,0.07)' stroke-width='0.5'/%3E%3C/svg%3E");
    background-repeat: repeat;
    animation: patternDrift 40s linear infinite;
  }

  /* ── Scan-beam light ── */
  .scan-beam {
    position: absolute;
    top: -20%;
    left: 0;
    width: 140px;
    height: 140%;
    background: linear-gradient(90deg, transparent 0%, rgba(217,189,133,0.06) 40%, rgba(217,189,133,0.12) 50%, rgba(217,189,133,0.06) 60%, transparent 100%);
    animation: scanBeam 9s ease-in-out infinite;
    pointer-events: none;
  }

  /* ── Floating star sparks ── */
  .star-spark {
    position: absolute;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: rgba(217,189,133,0.9);
    animation: starAppear 4s ease-in-out infinite;
    pointer-events: none;
  }

  /* ── Ornament ring system ── */
  .ring-outer { border: 1px solid rgba(201,168,106,0.12); border-radius: 50%; }
  .ring-mid   { border: 1px dashed rgba(124,77,255,0.18); border-radius: 50%; }
  .ring-inner { border: 1px solid rgba(201,168,106,0.22); border-radius: 50%; }

  .section-full { min-height: 100vh; display: flex; align-items: center; }

  .pain-item {
    border-left: 2px solid rgba(124,77,255,0.25);
    padding-left: 16px;
    transition: border-color .3s ease, background .3s ease;
    border-radius: 0 6px 6px 0;
    padding-top: 4px;
    padding-bottom: 4px;
  }
  .pain-item:hover {
    border-color: rgba(201,168,106,0.65);
    background: rgba(201,168,106,0.03);
  }
  .mapel-pill {
    background: rgba(17,6,31,0.75);
    border: 1px solid rgba(169,112,255,0.12);
    border-radius: 10px;
    padding: 10px 14px;
    transition: all .25s ease;
    backdrop-filter: blur(14px);
    position: relative;
    overflow: hidden;
  }
  .mapel-pill::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(201,168,106,0.06) 0%, transparent 60%);
    opacity: 0;
    transition: opacity .25s ease;
  }
  .mapel-pill:hover::before { opacity: 1; }
  .mapel-pill:hover {
    border-color: rgba(201,168,106,0.4);
    transform: translateY(-3px);
    box-shadow: 0 8px 24px -8px rgba(201,168,106,0.2);
  }
  .step-connector {
    width: 2px;
    background: linear-gradient(180deg, rgba(124,77,255,0.5) 0%, rgba(201,168,106,0.35) 100%);
    flex-shrink: 0;
  }
  .price-badge {
    background: linear-gradient(135deg, rgba(201,168,106,0.2) 0%, rgba(201,168,106,0.06) 100%);
    border: 1px solid rgba(201,168,106,0.3);
    border-radius: 12px;
    padding: 4px 12px;
    font-size: 12px;
    color: #E8D0A0;
    font-weight: 500;
  }
  .ticker-wrap { overflow: hidden; width: 100%; }
  .vs-pill {
    background: rgba(22,9,50,0.85);
    border: 1px solid rgba(169,112,255,0.18);
    border-radius: 10px;
    padding: 16px 20px;
    backdrop-filter: blur(12px);
  }
  .cta-border-anim {
    position: relative;
    background: linear-gradient(#080312, #080312) padding-box,
                linear-gradient(135deg, rgba(201,168,106,0.85), rgba(124,77,255,0.65), rgba(201,168,106,0.85)) border-box;
    background-size: 200% 200%;
    border: 1px solid transparent;
    border-radius: 20px;
    animation: borderFlow 6s ease infinite;
  }
  .feature-card-glow:hover {
    box-shadow: 0 0 0 1px rgba(201,168,106,0.2), 0 16px 48px -12px rgba(124,77,255,0.3);
  }
  .kali-center-text {
    font-family: "Lalezar", serif;
    direction: rtl;
    line-height: 1.5;
  }
  .step-kali {
    font-family: "Aref Ruqaa", serif;
    direction: rtl;
    line-height: 1.8;
  }
  .final-cta-kali {
    font-family: "Lalezar", serif;
    direction: rtl;
    line-height: 1.6;
  }
`;

const StyleInject = () => {
  useEffect(() => {
    const id = "landing-styles-v3";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id;
      el.textContent = LANDING_STYLES;
      document.head.appendChild(el);
    }
    return () => {};
  }, []);
  return null;
};

/* ── Counter yang naik otomatis ─────────────────────────────── */
const CountUp = ({ target, suffix = "", duration = 1800 }) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setVal(Math.round(ease * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
};

/* ── Komponen utama ─────────────────────────────────────────── */
const LandingPage = ({ onOpenLogin, onOpenPayment }) => (
  <div className="page-enter">
    <StyleInject />
    <LandingHero onOpenLogin={onOpenLogin} onOpenPayment={onOpenPayment} />
    <StatsBanner />
    <PainSection />
    <SolutionSection />
    <FeaturesSection />
    <MapelShowcase />
    <HowItWorks />
    <PricingSection onOpenPayment={onOpenPayment} />
    <FinalCTA onOpenPayment={onOpenPayment} />
  </div>
);

/* ── Star sparks dekoratif ─────────────────────────────────── */
const StarSparks = () => {
  const sparks = [
    { top: "18%", left: "12%", delay: "0s", size: 3 },
    { top: "72%", left: "8%",  delay: "1.4s", size: 2 },
    { top: "35%", left: "88%", delay: "0.7s", size: 3 },
    { top: "62%", left: "82%", delay: "2.1s", size: 2 },
    { top: "14%", left: "55%", delay: "3.2s", size: 2 },
    { top: "88%", left: "45%", delay: "1.8s", size: 3 },
    { top: "48%", left: "4%",  delay: "2.6s", size: 2 },
    { top: "22%", left: "76%", delay: "0.3s", size: 2 },
  ];
  return (
    <>
      {sparks.map((s, i) => (
        <div key={i} className="star-spark" style={{
          top: s.top, left: s.left,
          width: s.size, height: s.size,
          animationDelay: s.delay,
          animationDuration: `${3.5 + i * 0.4}s`,
        }} />
      ))}
    </>
  );
};

/* ══════════════════════════════════════════════════════════════
   1. HERO — Full viewport, kaligrafi besar, emotional headline
   ══════════════════════════════════════════════════════════════ */
const LandingHero = ({ onOpenLogin, onOpenPayment }) => (
  <section className="relative overflow-hidden" style={{ minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: "80px" }}>

    {/* Background blobs — lebih dalam dan dramatis */}
    <Blob color="rgba(124,77,255,0.38)" size={1000} top={-350} right={-250} />
    <Blob color="rgba(201,168,106,0.13)" size={800} top={250} left={-300} />
    <Blob color="rgba(92,53,204,0.28)" size={700} top={80} left={150} />
    <Blob color="rgba(201,168,106,0.08)" size={500} top={400} right={100} />

    {/* Islamic geometric pattern overlay */}
    <div className="absolute inset-0 pattern-geo opacity-100 pointer-events-none" style={{ opacity: 0.6 }} />

    {/* Pattern stars layer */}
    <div className="absolute inset-0 pattern-stars opacity-20 pointer-events-none" />

    {/* Radial glow behind calligraphy */}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div style={{
        width: "600px", height: "600px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(201,168,106,0.07) 0%, rgba(124,77,255,0.05) 40%, transparent 70%)",
        filter: "blur(40px)",
      }} />
    </div>

    {/* Scan beam cahaya */}
    <div className="scan-beam" style={{ animationDelay: "2s" }} />

    {/* Star sparks */}
    <StarSparks />

    {/* Kaligrafi besar di background — Lalezar, sangat dramatis */}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
      <div className="landing-float" style={{ opacity: 0.065 }}>
        <div className="hero-kali" style={{ fontSize: "clamp(130px,24vw,320px)", letterSpacing: "0.01em" }}>
          اقْرَأْ
        </div>
      </div>
    </div>

    {/* Ornamen kaligrafi kanan — Aref Ruqaa */}
    <div className="absolute right-6 top-1/3 pointer-events-none select-none hidden lg:flex flex-col items-end gap-1 landing-float2" style={{ animationDelay: "1s" }}>
      <div className="hero-kali-side text-gold-400" style={{ fontSize: "64px", opacity: 0.22, lineHeight: 1.6 }}>
        بِسْمِ اللَّهِ
      </div>
      <div className="w-16 h-px ml-auto" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,106,0.3))" }} />
    </div>

    {/* Ornamen kiri — Aref Ruqaa */}
    <div className="absolute left-4 bottom-1/3 pointer-events-none select-none hidden lg:block landing-float-slow" style={{ animationDelay: "3s" }}>
      <div className="hero-kali-side text-violet-300" style={{ fontSize: "38px", opacity: 0.16, lineHeight: 2, textAlign: "right" }}>
        وَمَا أُوتِيتُم
      </div>
      <div className="hero-kali-side text-violet-300" style={{ fontSize: "38px", opacity: 0.16, lineHeight: 2, textAlign: "right" }}>
        مِّنَ الْعِلْمِ
      </div>
    </div>

    <div className="container-x relative w-full">
      <div className="max-w-3xl mx-auto text-center">

        {/* Arabic ornament kecil di atas chip */}
        <Reveal>
          <div className="kali-elegant text-gold-500 mb-3 opacity-40 landing-glow-subtle" style={{ fontSize: "22px", letterSpacing: "0.1em" }}>
            ✦ ─────── ✦ ─────── ✦
          </div>
        </Reveal>

        {/* Chip */}
        <Reveal delay={50}>
          <div className="chip chip-glass text-xs mb-7 inline-flex items-center gap-2 mx-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-400" />
            </span>
            Untuk Masisir Al-Azhar · Dibuat khusus, bukan adaptasi
          </div>
        </Reveal>

        {/* Headline besar */}
        <Reveal delay={120}>
          <h1 className="font-display leading-[1.03] tracking-tightest mb-6" style={{ fontSize: "clamp(48px,7vw,88px)", fontWeight: 600 }}>
            <span className="text-ink">Kuliah di Azhar itu</span>{" "}
            <span className="gradient-text-live">berat.</span>
            <br />
            <span className="text-ink">MADAD bikin lebih</span>{" "}
            <span className="text-gold-300">ringan.</span>
          </h1>
        </Reveal>

        {/* Sub */}
        <Reveal delay={240}>
          <p className="text-ink-muted leading-relaxed mx-auto mb-10" style={{ fontSize: "clamp(16px,2vw,20px)", maxWidth: "620px" }}>
            Panduan AI yang mengerti maqarrar Al-Azhar — dari Fiqh, Hadith, Ushul, sampai Nahwu dan Balaghah.
            Bukan AI biasa, tapi<span className="text-gold-300 font-medium"> konsultan belajar pribadi</span> yang menyesuaikan gaya belajarmu.
          </p>
        </Reveal>

        {/* CTAs */}
        <Reveal delay={380}>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <button onClick={onOpenPayment}
              className="btn btn-gold text-base px-8 py-4"
              style={{ fontSize: "16px", boxShadow: "0 0 50px rgba(201,168,106,0.4), 0 0 100px rgba(201,168,106,0.15), 0 1px 0 rgba(255,255,255,0.35) inset" }}>
              <Icon name="sparkles" className="w-5 h-5" />
              Gabung Member — Rp 49.000
            </button>
            <button onClick={onOpenLogin}
              className="btn btn-ghost text-base px-6 py-4" style={{ fontSize: "15px" }}>
              Sudah punya kode? Login →
            </button>
          </div>
        </Reveal>

        {/* Social proof mini */}
        <Reveal delay={500}>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-ink-soft">
            {[
              { icon: "check", text: "Sekali bayar, akses seumur hidup" },
              { icon: "shield", text: "Kode dikirim via WhatsApp" },
              { icon: "book", text: "16+ mata pelajaran Al-Azhar" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Icon name={item.icon} className="w-3.5 h-3.5 text-gold-400" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Arabic ornament bawah */}
        <Reveal delay={600}>
          <div className="kali-display text-gold-500 mt-8 opacity-20 landing-breathe" style={{ fontSize: "28px", letterSpacing: "0.15em" }}>
            ﷽
          </div>
        </Reveal>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ink-soft">
        <span className="text-[11px] tracking-[0.15em] uppercase">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-violet-400/60 to-transparent" style={{ animation: "floatY 2s ease-in-out infinite" }} />
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════
   2. STATS BANNER — angka nyata yang bergerak
   ══════════════════════════════════════════════════════════════ */
const StatsBanner = () => (
  <section className="py-14 border-y" style={{ borderColor: "rgba(169,112,255,0.1)" }}>
    <div className="container-x">
      <Reveal stagger className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x" style={{ "--tw-divide-opacity": 1 }}>
        {[
          { num: 16,    suf: "+",   label: "Mata pelajaran Al-Azhar" },
          { num: 6,     suf: "×",   label: "Gaya belajar berbeda" },
          { num: 96,    suf: "+",   label: "Panduan prompt siap pakai" },
          { num: 49,    suf: "rb",  label: "Sekali bayar, akses penuh" },
        ].map((s, i) => (
          <div key={i} className="text-center px-6">
            <div className="font-display font-semibold gradient-text mb-1" style={{ fontSize: "clamp(36px,5vw,56px)", lineHeight: 1 }}>
              <CountUp target={s.num} suffix={s.suf} />
            </div>
            <div className="text-sm text-ink-muted">{s.label}</div>
          </div>
        ))}
      </Reveal>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════
   3. PAIN SECTION — realita Masisir
   ══════════════════════════════════════════════════════════════ */
const PainSection = () => (
  <section className="section relative overflow-hidden">
    <Blob color="rgba(124,77,255,0.12)" size={600} top={-100} left={-200} />

    <div className="container-x">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

        {/* Kiri — teks */}
        <div>
          <Reveal>
            <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4">
              — Kamu tidak sendirian
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.08] mb-6">
              Pernah rasakan ini di Kairo?
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-ink-muted leading-relaxed mb-8 text-base">
              Belajar di Al-Azhar itu privilege — tapi juga tantangan yang tidak ringan. Bahasa Arab bukan bahasa ibu, maqarrar ribuan halaman, ujian syafahi di depan dosen, tanpa teman belajar yang selalu ada.
            </p>
          </Reveal>

          <Reveal stagger delay={200} className="space-y-5">
            {[
              { emoji: "📚", text: "Duduk berjam-jam dengan maqarrar tebal — tapi tidak tahu mau mulai dari mana" },
              { emoji: "🎤", text: "Syafahi besok pagi. Kamu masih bingung bedain qoul 4 mazhab dalam bahasa Arab" },
              { emoji: "🤯", text: "Dosen ngomong dalam bahasa Arab satu jam, tapi setengahnya tidak masuk" },
              { emoji: "💭", text: "Mau pakai ChatGPT tapi tidak tahu prompt apa yang harus diketik" },
              { emoji: "😔", text: "Hafalan matan tidak nempel karena tidak paham konteks dan hubungan antar bab" },
            ].map((item, i) => (
              <div key={i} className="pain-item flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{item.emoji}</span>
                <p className="text-sm text-ink-muted leading-relaxed">{item.text}</p>
              </div>
            ))}
          </Reveal>
        </div>

        {/* Kanan — kaligrafi dekoratif */}
        <Reveal delay={300} className="hidden lg:flex flex-col items-center justify-center">
          <div className="relative">
            {/* Ring dekoratif */}
            <div className="landing-rotate ring-outer absolute"
              style={{ width: "340px", height: "340px", top: "50%", left: "50%", transform: "translate(-50%,-50%)", position: "absolute" }} />
            <div className="landing-rotate-rev ring-mid absolute"
              style={{ width: "275px", height: "275px", top: "50%", left: "50%", transform: "translate(-50%,-50%)", position: "absolute" }} />
            <div className="landing-breathe ring-inner absolute"
              style={{ width: "210px", height: "210px", top: "50%", left: "50%", transform: "translate(-50%,-50%)", position: "absolute" }} />

            {/* Kaligrafi tengah — Lalezar display + Aref Ruqaa elegant */}
            <div className="relative z-10 text-center p-16">
              <div className="kali-display text-gold-300 landing-glow" style={{ fontSize: "58px", lineHeight: 1.7 }}>
                طَلَبُ الْعِلْمِ
              </div>
              <div className="kali-display text-gold-400 landing-glow-subtle" style={{ fontSize: "46px", lineHeight: 1.7 }}>
                فَرِيضَةٌ
              </div>
              <div className="kali-elegant text-ink-muted" style={{ fontSize: "30px", lineHeight: 1.9 }}>
                عَلَى كُلِّ مُسْلِمٍ
              </div>
              <div className="w-16 h-px mx-auto my-3" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,106,0.4), transparent)" }} />
              <p className="text-xs text-ink-soft italic">"Menuntut ilmu itu wajib atas setiap Muslim." — HR. Ibn Majah</p>
            </div>
          </div>
        </Reveal>

      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════
   4. SOLUTION — MADAD vs AI generik
   ══════════════════════════════════════════════════════════════ */
const SolutionSection = () => (
  <section className="section relative overflow-hidden">
    <Blob color="rgba(201,168,106,0.10)" size={700} top={-150} right={-200} />

    <div className="container-x">
      <Reveal className="text-center mb-12">
        <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4">— Kenapa MADAD beda</div>
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.08] mb-4">
          AI sudah ada di mana-mana.<br />
          <span className="gradient-text">Yang tahu maqarrar Azhar, belum ada.</span>
        </h2>
        <p className="text-ink-muted max-w-lg mx-auto">
          ChatGPT bisa menjawab pertanyaan fiqh secara umum. Tapi siapa yang tahu Anda sedang belajar Bidayatul Mujtahid di Syariah Azhar, dan butuh perbandingan 4 mazhab dalam bahasa yang mudah dipahami?
        </p>
      </Reveal>

      {/* Comparison table */}
      <Reveal stagger className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-12">

        {/* AI Biasa */}
        <div className="vs-pill">
          <div className="text-xs uppercase tracking-[0.18em] text-ink-soft mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-600" />
            AI Biasa
          </div>
          <div className="space-y-3">
            {[
              "Tidak tahu kamu di Azhar",
              "Jawaban generik, tanpa konteks",
              "Tidak tahu gaya belajarmu",
              "Harus bikin prompt sendiri",
              "Tidak tahu kurikulum Azhar",
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm text-ink-muted">
                <span className="text-rose-600 font-bold text-xs flex-shrink-0">✕</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MADAD */}
        <div className="vs-pill" style={{ background: "rgba(201,168,106,0.06)", borderColor: "rgba(201,168,106,0.3)" }}>
          <div className="text-xs uppercase tracking-[0.18em] text-gold-400 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gold-400" />
            MADAD
          </div>
          <div className="space-y-3">
            {[
              "Dirancang khusus untuk Masisir",
              "Guide spesifik per mata pelajaran",
              "Adaptif sesuai gaya belajarmu",
              "96+ prompt siap salin-tempel",
              "Mengerti maqarrar Azhar",
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm text-ink">
                <Icon name="check" className="w-4 h-4 text-gold-400 flex-shrink-0" strokeWidth={2.5} />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* AI tools ticker */}
      <Reveal>
        <div className="text-center text-xs text-ink-soft mb-4">Mengintegrasikan semua AI yang kamu kenal</div>
        <div className="ticker-wrap">
          <div className="marquee-track flex gap-10 whitespace-nowrap">
            {["Claude", "ChatGPT", "Gemini", "NotebookLM", "Perplexity", "DeepSeek", "Claude", "ChatGPT", "Gemini", "NotebookLM", "Perplexity", "DeepSeek"].map((n, i) => (
              <span key={i} className="text-sm font-mono text-ink-muted opacity-40 hover:opacity-80 transition-opacity">{n}</span>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════
   5. FEATURES — 6 fitur utama
   ══════════════════════════════════════════════════════════════ */
const FeaturesSection = () => {
  const features = [
    {
      icon: "sparkles",
      title: "Adaptive per gaya belajarmu",
      body: "Pilih cara belajarmu: diskusi, visual, hafalan, latihan soal, atau baca. Setiap panduan menyesuaikan diri.",
      badge: "Personal",
      color: "rgba(124,77,255,0.15)",
      borderColor: "rgba(124,77,255,0.3)",
    },
    {
      icon: "book",
      title: "Guide per mata pelajaran",
      body: "16+ panduan spesifik: Fiqh, Ushul, Hadith, Tafsir, Nahwu, Balaghah — masing-masing dengan konteks Azhari.",
      badge: "16+ Mapel",
      color: "rgba(201,168,106,0.12)",
      borderColor: "rgba(201,168,106,0.3)",
    },
    {
      icon: "copy",
      title: "Prompt siap salin-tempel",
      body: "Tidak perlu mikir mau ngetik apa. Buka panduan, salin prompt, paste ke AI, langsung dapat jawaban.",
      badge: "96+ Prompt",
      color: "rgba(110,231,183,0.08)",
      borderColor: "rgba(110,231,183,0.2)",
    },
    {
      icon: "layers",
      title: "Muqaranah qoul ulama",
      body: "Bandingkan pendapat 4 mazhab side-by-side dengan dalil, wajh istidlal, dan penjelasan mudah.",
      badge: "4 Mazhab",
      color: "rgba(124,77,255,0.12)",
      borderColor: "rgba(124,77,255,0.25)",
    },
    {
      icon: "edit",
      title: "Kurasah pribadi",
      body: "Catatan markdown dengan dukungan teks Arab. Talkhish, ta'liq, dan resume maqarrar dalam satu tempat.",
      badge: "Catatan",
      color: "rgba(201,168,106,0.08)",
      borderColor: "rgba(201,168,106,0.2)",
    },
    {
      icon: "star",
      title: "Companion harian",
      body: "Niat belajar, ritme harian, dan refleksi singkat — supaya belajarmu berkesinambungan dan bermakna.",
      badge: "Harian",
      color: "rgba(124,77,255,0.1)",
      borderColor: "rgba(124,77,255,0.2)",
    },
  ];

  return (
    <section className="section relative overflow-hidden">
      <Blob color="rgba(124,77,255,0.14)" size={800} top={-200} right={-300} />

      <div className="container-x">
        <Reveal className="text-center mb-14">
          <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4">— Apa yang kamu dapat</div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.08]">
            Satu tempat untuk semua<br />kebutuhan belajar di Azhar.
          </h2>
        </Reveal>

        <Reveal stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={i} className="card-glass hov-lift p-6 flex flex-col gap-4"
              style={{ borderColor: f.borderColor }}>
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: f.color, border: `1px solid ${f.borderColor}` }}>
                  <Icon name={f.icon} className="w-5 h-5 text-gold-300" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.12em] px-2 py-1 rounded-full"
                  style={{ background: f.color, color: "#D9BD85", border: `1px solid ${f.borderColor}` }}>
                  {f.badge}
                </span>
              </div>
              <div>
                <div className="font-display text-lg font-semibold text-ink mb-1.5">{f.title}</div>
                <div className="text-sm text-ink-muted leading-relaxed">{f.body}</div>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   6. MAPEL SHOWCASE — grid semua mata pelajaran
   ══════════════════════════════════════════════════════════════ */
const MapelShowcase = () => {
  const mapels = [
    { ar: "الفقه",          id: "Fiqh",            faculty: "Syariah" },
    { ar: "أصول الفقه",    id: "Ushul Fiqh",       faculty: "Syariah" },
    { ar: "القواعد",        id: "Qawaid Fiqhiyyah", faculty: "Syariah" },
    { ar: "المعاملات",      id: "Muamalat",         faculty: "Syariah" },
    { ar: "تاريخ التشريع", id: "Tarikh Tasyri",    faculty: "Syariah" },
    { ar: "الحديث",         id: "Hadith",           faculty: "Ushuluddin" },
    { ar: "التفسير",        id: "Tafsir",           faculty: "Ushuluddin" },
    { ar: "العقيدة",        id: "Aqidah",           faculty: "Ushuluddin" },
    { ar: "السيرة",         id: "Sirah Nabawi",     faculty: "Ushuluddin" },
    { ar: "المنطق",         id: "Mantiq",           faculty: "Ushuluddin" },
    { ar: "النحو",          id: "Nahwu",            faculty: "Bahasa Arab" },
    { ar: "البلاغة",        id: "Balaghah",         faculty: "Bahasa Arab" },
    { ar: "الإنشاء",        id: "Insya",            faculty: "Bahasa Arab" },
    { ar: "الأدب",          id: "Adab",             faculty: "Bahasa Arab" },
    { ar: "المقال",         id: "Penulisan Makalah", faculty: "Umum" },
    { ar: "الحفظ",          id: "Hafalan Matan",    faculty: "Umum" },
  ];

  const facultyColors = {
    "Syariah":     { bg: "rgba(124,77,255,0.12)", border: "rgba(124,77,255,0.28)", text: "#C5A0FF" },
    "Ushuluddin":  { bg: "rgba(201,168,106,0.10)", border: "rgba(201,168,106,0.28)", text: "#E8D0A0" },
    "Bahasa Arab": { bg: "rgba(110,231,183,0.08)", border: "rgba(110,231,183,0.2)", text: "#6EE7B7" },
    "Umum":        { bg: "rgba(180,150,255,0.06)", border: "rgba(180,150,255,0.16)", text: "#B8AACC" },
  };

  return (
    <section className="section relative overflow-hidden">
      <Blob color="rgba(201,168,106,0.08)" size={600} top={-100} left={-200} />

      <div className="container-x">
        <Reveal className="text-center mb-12">
          <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4">— Cakupan mata pelajaran</div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.08] mb-4">
            Dari Fiqh sampai Balaghah,<br />
            <span className="gradient-text">semua ada panduannya.</span>
          </h2>
          <p className="text-ink-muted max-w-md mx-auto text-sm">
            16 mata pelajaran Al-Azhar dengan panduan AI spesifik per subjek — bukan jawaban copy-paste yang sama untuk semua.
          </p>
        </Reveal>

        <Reveal stagger className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
          {mapels.map((m, i) => {
            const col = facultyColors[m.faculty] || facultyColors["Umum"];
            return (
              <div key={i} className="mapel-pill flex flex-col gap-1.5">
                <div className="arabic-ui text-gold-300 text-right" style={{ fontSize: "20px", lineHeight: 1.6 }}>{m.ar}</div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-ink">{m.id}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: col.bg, border: `1px solid ${col.border}`, color: col.text }}>
                    {m.faculty}
                  </span>
                </div>
              </div>
            );
          })}
        </Reveal>

        {/* Bottom note */}
        <Reveal className="text-center text-xs text-ink-soft">
          Panduan terus diperbarui · Mata pelajaran lebih banyak akan hadir
        </Reveal>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   7. HOW IT WORKS — 3 langkah vertikal dengan animasi
   ══════════════════════════════════════════════════════════════ */
const HowItWorks = () => {
  const steps = [
    {
      num: "01",
      kali: "نِيَّة",
      kaliMeaning: "Niyyah",
      title: "Isi profil belajarmu",
      body: "4 pertanyaan singkat: fakultas, semester, mata pelajaran yang sulit, dan gaya belajarmu. Tidak sampai 2 menit.",
      detail: "Onboarding cepat · Bisa diubah kapan saja",
    },
    {
      num: "02",
      kali: "عِلْم",
      kaliMeaning: "'Ilm",
      title: "Dapat panduan yang personal",
      body: "MADAD menampilkan panduan AI yang disesuaikan — mata pelajaran yang relevan, prompt yang cocok dengan caramu belajar.",
      detail: "Adaptive · Per fakultas · Per gaya belajar",
    },
    {
      num: "03",
      kali: "فَهْم",
      kaliMeaning: "Fahm",
      title: "Belajar lebih efektif setiap hari",
      body: "Salin prompt, pakai di AI favoritmu, dan mulai belajar. Simpan hasil di kurasah. Ulang besok.",
      detail: "Claude · ChatGPT · Gemini · NotebookLM",
    },
  ];

  return (
    <section className="section relative overflow-hidden">
      <Blob color="rgba(124,77,255,0.12)" size={700} top={0} right={-300} />

      <div className="container-x">
        <Reveal className="text-center mb-14">
          <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4">— Cara pakainya</div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.08]">
            Tiga langkah, langsung jalan.
          </h2>
        </Reveal>

        <div className="max-w-2xl mx-auto">
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 120}>
              <div className="flex gap-6 md:gap-10 mb-0">

                {/* Kiri: nomor + connector */}
                <div className="flex flex-col items-center" style={{ minWidth: "56px" }}>
                  <div className="w-14 h-14 rounded-2xl card-glass-strong flex items-center justify-center flex-shrink-0"
                    style={{ border: "1px solid rgba(201,168,106,0.3)" }}>
                    <span className="font-display text-gold-300 font-semibold text-lg">{s.num}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="step-connector flex-1 my-2" style={{ width: "2px", minHeight: "60px" }} />
                  )}
                </div>

                {/* Kanan: konten */}
                <div className="pb-10 flex-1">
                  <div className="flex items-start gap-4 mb-3">
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <div className="step-kali text-gold-400" style={{ fontSize: "26px", lineHeight: 1.6 }}>{s.kali}</div>
                        <span className="text-xs text-gold-600 font-mono tracking-wide">{s.kaliMeaning}</span>
                      </div>
                      <h3 className="font-display text-2xl font-semibold text-ink">{s.title}</h3>
                    </div>
                  </div>
                  <p className="text-ink-muted leading-relaxed mb-3">{s.body}</p>
                  <div className="text-xs text-ink-soft">{s.detail}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   8. PRICING — satu kartu, strong conversion
   ══════════════════════════════════════════════════════════════ */
const PricingSection = ({ onOpenPayment }) => (
  <section className="section relative overflow-hidden">
    <Blob color="rgba(201,168,106,0.15)" size={700} top={-100} right={-200} />
    <Blob color="rgba(124,77,255,0.12)" size={500} top={200} left={-150} />

    <div className="container-x">
      <Reveal className="text-center mb-12">
        <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4">— Investasi ilmu</div>
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.08] mb-4">
          Satu harga. Akses selamanya.
        </h2>
        <p className="text-ink-muted max-w-md mx-auto">
          Tidak ada biaya bulanan, tidak ada tiered plan yang membingungkan. Bayar sekali, belajar selamanya.
        </p>
      </Reveal>

      <Reveal className="max-w-[480px] mx-auto">
        <div className="cta-border-anim relative overflow-hidden">
          <Blob color="rgba(201,168,106,0.18)" size={300} top={-60} right={-60} />
          <div className="relative p-8 md:p-10">

            {/* Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="chip chip-gold text-xs">Member MADAD</div>
              <div className="price-badge">Akses Seumur Hidup</div>
            </div>

            {/* Harga */}
            <div className="flex items-end gap-1 leading-none mb-2">
              <span className="font-display text-2xl text-gold-400 mb-2">Rp</span>
              <span className="font-display font-semibold text-gold-300 leading-none"
                style={{ fontSize: "clamp(64px,12vw,88px)" }}>49</span>
              <span className="font-display text-2xl text-gold-400 mb-2">.000</span>
            </div>
            <p className="text-xs text-ink-soft mb-8">Harga perkenalan · Bisa naik kapan saja</p>

            {/* Fitur */}
            <div className="space-y-3 mb-8">
              {[
                "Panduan AI untuk 16+ mata pelajaran Al-Azhar",
                "Adaptive per 6 gaya belajar berbeda",
                "96+ prompt siap pakai — tinggal salin-tempel",
                "Muqaranah qoul ulama (library + buat sendiri)",
                "Kurasah pribadi dengan teks Arab & markdown",
                "Companion harian: niat, ritme, refleksi",
                "Semua update fitur baru — gratis selamanya",
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-ink">
                  <Icon name="check" className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            {/* CTA button */}
            <button onClick={onOpenPayment}
              className="btn btn-gold w-full text-base py-4 mb-4"
              style={{ fontSize: "16px", boxShadow: "0 0 50px rgba(201,168,106,0.4), 0 1px 0 rgba(255,255,255,0.35) inset" }}>
              <Icon name="sparkles" className="w-5 h-5" />
              Bayar via Lynk.id — Rp 49.000
            </button>

            <p className="text-[11px] text-ink-soft text-center leading-relaxed">
              Setelah bayar, kode akses dikirim admin via WhatsApp dalam 1×24 jam.
              <br />Pertanyaan? Hubungi admin langsung.
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════
   9. FINAL CTA — kaligrafi + emotional close
   ══════════════════════════════════════════════════════════════ */
const FinalCTA = ({ onOpenPayment }) => (
  <section className="relative overflow-hidden pb-32 pt-16">
    <Blob color="rgba(124,77,255,0.15)" size={700} top={-100} left={-200} />
    <Blob color="rgba(201,168,106,0.12)" size={500} top={0} right={-150} />

    <div className="container-x">
      <div className="divider-arabesque mb-16" />

      {/* Kaligrafi besar di tengah — Lalezar, sangat hidup */}
      <Reveal className="text-center mb-10">
        <div className="text-gold-600 opacity-40 mb-4 landing-breathe" style={{ fontSize: "18px", letterSpacing: "0.3em" }}>
          ✦ ─────────── ✦ ─────────── ✦
        </div>
        <div className="final-cta-kali landing-glow mb-1" style={{ fontSize: "clamp(44px,9vw,90px)", color: "#D9BD85" }}>
          وَقُل رَّبِّ زِدْنِي عِلْمًا
        </div>
        <div className="w-24 h-px mx-auto my-4" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,106,0.5), transparent)" }} />
        <p className="text-ink-muted italic text-base mb-1">"Dan katakanlah: Ya Tuhanku, tambahkanlah ilmuku."</p>
        <p className="text-ink-soft text-sm mb-12">— QS. Thaha: 114</p>
      </Reveal>

      {/* Penutup copy */}
      <Reveal className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.08] mb-6">
          Kamu sudah ada di Kairo.<br />
          <span className="gradient-text-live">Sekarang belajar lebih cerdas.</span>
        </h2>
        <p className="text-ink-muted leading-relaxed mb-8 text-base">
          Ribuan Masisir sudah menghadapi ujian syafahi, hafalan matan, dan makalah yang sama sepertimu.
          Yang membedakan bukan kemampuan — tapi <span className="text-ink font-medium">cara belajarnya.</span>
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button onClick={onOpenPayment}
            className="btn btn-gold text-base px-10 py-4"
            style={{ fontSize: "17px", boxShadow: "0 0 60px rgba(201,168,106,0.45), 0 1px 0 rgba(255,255,255,0.35) inset" }}>
            <Icon name="sparkles" className="w-5 h-5" />
            Mulai dengan MADAD — Rp 49.000
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-ink-soft">
          <span>✓ Tidak ada biaya bulanan</span>
          <span>✓ Akses langsung setelah bayar</span>
          <span>✓ Dibuat khusus untuk Masisir</span>
        </div>
      </Reveal>

      <div className="divider-arabesque mt-16" />
    </div>
  </section>
);

window.LandingPage = LandingPage;
