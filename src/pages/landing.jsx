/* Talqih — Landing page v6: hero premium 2-kolom, geometric bg */

const { useState, useEffect } = React;

const LANDING_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap');

  .kali-display  { font-family: "Reem Kufi","Noto Kufi Arabic",sans-serif; direction:rtl; }
  .kali-elegant  { font-family: "Aref Ruqaa",serif; direction:rtl; }
  .hero-headline { font-family: "Playfair Display","Georgia",serif; }
  .hov-lift      { transition:transform .2s ease, box-shadow .2s ease; cursor:pointer; }
  .hov-lift:hover{ transform:translateY(-3px); box-shadow:0 12px 40px -12px rgba(201,168,106,.2); }

  @keyframes geo-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .hero-geo-bg {
    animation: geo-spin 60s linear infinite;
    transform-origin: center center;
  }

  @keyframes card-float {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-6px); }
  }
  .hero-card-float {
    animation: card-float 4s ease-in-out infinite;
  }

  .btn-hero-gold {
    display:inline-flex; align-items:center; gap:8px;
    background: linear-gradient(135deg, #D4A017, #F0C040);
    color: #1a1a1a;
    font-weight: 600;
    padding: 16px 32px;
    border-radius: 50px;
    font-size: 15px;
    border: none;
    cursor: pointer;
    transition: transform .2s ease, filter .2s ease;
    white-space: nowrap;
  }
  .btn-hero-gold:hover { transform: scale(1.03); filter: brightness(1.1); }

  .btn-hero-dark {
    display:inline-flex; align-items:center; gap:8px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.2);
    color: white;
    font-weight: 500;
    padding: 16px 32px;
    border-radius: 50px;
    font-size: 15px;
    cursor: pointer;
    transition: background .2s ease;
    white-space: nowrap;
  }
  .btn-hero-dark:hover { background: rgba(255,255,255,0.15); }
`;

const StyleInject = () => {
  useEffect(() => {
    const id = "landing-styles-v6";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id; el.textContent = LANDING_STYLES;
      document.head.appendChild(el);
    }
  }, []);
  return null;
};

const Reveal = ({ children, className = "", style, ...rest }) => (
  <div className={className} style={style} {...rest}>{children}</div>
);

/* ── Islamic Geometric Background ───────────────────────────── */
const HeroGeoBg = () => (
  <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
    <svg
      className="hero-geo-bg"
      style={{ position:"absolute", width:"200%", height:"200%", top:"-50%", left:"-50%" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="islamic-star" patternUnits="userSpaceOnUse" width="80" height="80">
          {/* 8-pointed star */}
          <polygon
            points="40,6 47.5,25.5 64,14 53.5,31 73,34.5 54.5,41 66,57.5 46,49 40,68 34,49 14,57.5 25.5,41 7,34.5 26.5,31 16,14 32.5,25.5"
            fill="none" stroke="#7C4DFF" strokeWidth="0.7"
          />
          {/* Small center diamond */}
          <polygon
            points="40,32 44,40 40,48 36,40"
            fill="none" stroke="#C9A86A" strokeWidth="0.4" opacity="0.6"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#islamic-star)" opacity="0.10"/>
    </svg>
  </div>
);

/* ── Hero Preview Card ───────────────────────────────────────── */
const HeroCard = () => (
  <div className="hero-card-float">
    <div
      className="rounded-[20px] p-7 relative overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 0 60px rgba(139,92,246,0.20), 0 24px 48px rgba(0,0,0,0.35)",
        width: "100%",
        maxWidth: "360px",
      }}
    >
      {/* Subtle inner glow top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"/>

      {/* Arabic title top-right */}
      <div className="flex items-start justify-between mb-4">
        <div/>
        <div
          className="arabic-display text-gold-300 leading-none"
          style={{ fontSize:"38px", direction:"rtl", fontFamily:'"Reem Kufi","Noto Kufi Arabic",sans-serif' }}
        >
          النحو
        </div>
      </div>

      {/* Maddah name */}
      <div className="mb-1">
        <div className="font-display text-xl font-semibold text-ink">Nahwu Dasar</div>
        <div className="text-sm text-ink-soft">Ilmu Sintaksis Arab</div>
      </div>

      {/* AI chips */}
      <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25 font-medium">Claude</span>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-gold-500/10 text-gold-300 border border-gold-500/22 font-medium">NotebookLM</span>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4"/>

      {/* Stats */}
      <div className="mb-1 text-sm text-ink">
        <span className="font-semibold text-gold-300">17</span>
        <span className="text-ink-muted"> template prompt</span>
      </div>
      <div className="text-xs text-ink-soft mb-4">Pahami · Hafal · Latihan · Ujian</div>

      {/* AI Recommendation box */}
      <div className="rounded-xl p-3.5" style={{ background:"rgba(124,77,255,0.10)", border:"1px solid rgba(124,77,255,0.18)" }}>
        <div className="text-[10px] uppercase tracking-wider text-violet-300 font-medium mb-2 flex items-center gap-1.5">
          <span className="text-gold-400">✦</span> AI Rekomendasi
        </div>
        <div className="text-sm font-semibold text-ink mb-1">NotebookLM</div>
        <div className="text-[11px] text-ink-muted leading-relaxed">
          Sesuai: hafalan matan<br/>Untuk: Nahwu Dasar
        </div>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   1. HERO
   ══════════════════════════════════════════════════════════════ */
const LandingHero = ({ onOpenLogin, onOpenPayment }) => (
  <section
    className="relative overflow-hidden"
    style={{ minHeight:"100vh", display:"flex", alignItems:"center", paddingTop:"80px" }}
  >
    {/* Geometric Islamic background pattern */}
    <HeroGeoBg/>

    {/* Soft color blobs */}
    <Blob color="rgba(124,77,255,.28)" size={900} top={-280} right={-180}/>
    <Blob color="rgba(201,168,106,.07)" size={700} top={250} left={-220}/>
    <Blob color="rgba(124,77,255,.12)" size={500} bottom={-150} left={100}/>

    <div className="container-x relative w-full py-20">
      <div
        className="grid items-center gap-16 lg:gap-20"
        style={{ gridTemplateColumns:"minmax(0,3fr) minmax(0,2fr)" }}
      >
        {/* ── Kolom Kiri (60%) ── */}
        <div>
          {/* Breadcrumb pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-8"
            style={{ background:"rgba(124,77,255,0.12)", border:"1px solid rgba(124,77,255,0.25)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400"/>
            <span className="text-violet-300 font-medium text-xs">Talqih</span>
            <span className="text-white/30 text-xs">·</span>
            <span className="text-white/55 text-xs">Panduan AI untuk Masisir</span>
          </div>

          {/* Headline */}
          <h1
            className="hero-headline font-semibold text-white mb-6"
            style={{
              fontSize: "clamp(40px, 5.5vw, 76px)",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
            }}
          >
            Kitab susah, jadi mudah.<br/>
            Materi lama, jadi cepat.<br/>
            <span style={{
              background: "linear-gradient(90deg, #A78BFA 0%, #C9A86A 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Ini cara baru belajar di Azhar.
            </span>
          </h1>

          {/* Subheadline */}
          <p style={{ fontSize:"18px", color:"rgba(255,255,255,0.65)", lineHeight:1.65, maxWidth:"460px", marginBottom:"40px" }}>
            Panduan + prompt + workflow AI yang dirancang khusus untuk cara belajar di Al-Azhar — dari Nahwu sampai Ushul Fiqh, dari Mustawa sampai S2.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <button
              onClick={() => navigate("/sample/nahwu")}
              className="btn-hero-gold"
              style={{ boxShadow:"0 0 40px rgba(212,160,23,.40), 0 1px 0 rgba(255,255,255,.25) inset" }}
            >
              Cobain Sample Gratis →
            </button>
            <button onClick={onOpenPayment} className="btn-hero-dark">
              Gabung Member · 49k
            </button>
          </div>

          {/* Login link */}
          <div style={{ fontSize:"14px", color:"rgba(255,255,255,0.45)", marginBottom:"36px" }}>
            Sudah punya kode?{" "}
            <button
              onClick={onOpenLogin}
              style={{ color:"#A78BFA", textDecoration:"underline", textUnderlineOffset:"3px", background:"none", border:"none", cursor:"pointer", fontSize:"14px" }}
            >
              Masuk di sini
            </button>
          </div>

          {/* Feature checkmarks */}
          <div className="flex flex-wrap gap-5">
            {["36 Maddah lengkap","540+ template prompt","Bayar sekali, akses selamanya"].map((t, i) => (
              <span key={i} className="flex items-center gap-2 text-xs" style={{ color:"rgba(255,255,255,0.45)" }}>
                <Icon name="check" className="w-3.5 h-3.5 text-gold-400 flex-shrink-0"/>{t}
              </span>
            ))}
          </div>
        </div>

        {/* ── Kolom Kanan (40%) — desktop only ── */}
        <div className="hidden lg:flex justify-center items-center">
          <HeroCard/>
        </div>
      </div>

      {/* Mobile card — below CTA */}
      <div className="lg:hidden mt-12 flex justify-center">
        <HeroCard/>
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════
   2. SAMPLE MADDAH
   ══════════════════════════════════════════════════════════════ */
const SampleMaddahSection = () => (
  <section className="section pt-0">
    <div className="container-x">
      <Reveal className="mb-10 text-center">
        <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 inline-flex items-center gap-2">
          <span className="w-6 h-px bg-gold-500/70"/>COBAIN DULU<span className="w-6 h-px bg-gold-500/70"/>
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.1] mb-4">
          Dalam 10 menit, kamu akan mengerti cara belajar Nahwu yang belum pernah diajarkan dosen.
        </h2>
        <p className="text-ink-muted text-base max-w-xl mx-auto">
          Tanpa daftar. Tanpa bayar. Kalau setelah ini kamu tidak merasa beda, tidak perlu lanjut.
        </p>
      </Reveal>
      <Reveal>
        <div className="max-w-3xl mx-auto">
          <div className="card-glass-strong p-8 md:p-10 relative overflow-hidden hov-lift"
            onClick={() => navigate("/sample/nahwu")}>
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gold-500/8 blur-3xl pointer-events-none"/>
            <div className="flex items-start justify-between mb-6 gap-4">
              <div>
                <div className="arabic-display text-gold-300 text-3xl md:text-4xl mb-2" style={{direction:"rtl"}}>النحو</div>
                <h3 className="font-display text-2xl md:text-3xl font-semibold text-ink">
                  Nahwu — Ilmu Sintaksis Arab
                </h3>
                <p className="text-sm text-ink-muted mt-1">Universal · Diambil semua fakultas Adaby</p>
              </div>
              <span className="chip-glass text-[10px] flex-shrink-0">GRATIS</span>
            </div>
            <div className="mb-6 p-4 rounded-xl bg-violet-500/8 border border-violet-500/15">
              <div className="text-xs uppercase tracking-wider text-violet-300 mb-2 font-medium">AI yang direkomendasikan</div>
              <div className="flex items-center gap-3 text-sm text-ink">
                <span className="font-semibold">NotebookLM</span>
                <span className="text-ink-soft">+</span>
                <span className="font-semibold">Claude</span>
              </div>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-5">
              {[{n:4,l:"Pahami"},{n:3,l:"Hafal"},{n:3,l:"Latihan"},{n:2,l:"Ujian"},{n:2,l:"Talaqqi"},{n:3,l:"Eksplor"}].map((c,i)=>(
                <div key={i} className="text-center p-3 rounded-lg bg-white/3 border border-line">
                  <div className="font-display text-xl text-ink font-semibold">{c.n}</div>
                  <div className="text-[10px] text-ink-soft uppercase tracking-wider mt-1">{c.l}</div>
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-ink-muted mb-5">17 template prompt siap pakai</div>
            <div className="flex justify-center">
              <span className="btn btn-gold px-6 py-3 text-sm pointer-events-none">Buka Sample Nahwu →</span>
            </div>
          </div>
          <p className="text-center text-xs text-ink-soft mt-4">
            Sample ini gratis selamanya · Untuk 35 Maddah lain, gabung member 49k
          </p>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════
   3. HOW IT WORKS
   ══════════════════════════════════════════════════════════════ */
const HowItWorks = () => {
  const steps = [
    { num:"01", title:"Bayar 49k", sub:"Sekali bayar, akses selamanya",
      desc:"Bayar via Lynk.id, admin kirim kode member via WhatsApp." },
    { num:"02", title:"Jawab profile", sub:"5 pertanyaan singkat",
      desc:"Fakultas, jurusan, tingkat, gaya belajarmu — biar prompt-nya pas." },
    { num:"03", title:"Mulai belajar", sub:"Workflow + 540+ prompt",
      desc:"Dashboard tunjukin AI cocok, prompt per Maddah siap pakai." },
  ];
  return (
    <section className="section pt-0">
      <div className="container-x">
        <Reveal className="mb-12 text-center">
          <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 inline-flex items-center gap-2">
            <span className="w-6 h-px bg-gold-500/70"/>BAGAIMANA TALQIH BEKERJA
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.1]">
            Dari buka website sampai paham kitab — kurang dari 5 menit.
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent"/>
          {steps.map((s, i) => (
            <Reveal key={i}>
              <div className="text-center px-4">
                <div className="font-display text-5xl md:text-6xl font-semibold bg-gradient-to-br from-violet-300 to-gold-400 bg-clip-text text-transparent mb-5">
                  {s.num}
                </div>
                <h3 className="font-display text-xl md:text-2xl font-semibold text-ink mb-1">{s.title}</h3>
                <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">{s.sub}</div>
                <p className="text-sm text-ink-muted leading-relaxed">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   4. ALL MADDAH PREVIEW
   ══════════════════════════════════════════════════════════════ */
const AllMaddahPreview = () => {
  const groups = [
    { label:"Ushuluddin & Quran", arabic:"أصول الدين", count:7,
      color:"from-violet-500/15 to-violet-700/5",
      sample:["Tafsir Tahlili","Tafsir Maudhu'i","'Ulum Al-Qur'an","Hadits"] },
    { label:"Hadits & Mustholah", arabic:"الحديث", count:5,
      color:"from-violet-400/12 to-violet-600/4",
      sample:["Hadits Tahlili","Mustholah","Manahij Muhadditsin","Takhrij"] },
    { label:"Syariah & Fiqh", arabic:"الشريعة", count:5,
      color:"from-gold-500/10 to-gold-700/3",
      sample:["Fiqh Madzhabi","Fiqh Muqaran","Ushul Fiqh","Qawa'id"] },
    { label:"Aqidah & Pemikiran", arabic:"العقيدة", count:5,
      color:"from-violet-500/12 to-night-800",
      sample:["Tauhid","Firaq","Filsafat Islam","Mantiq","Tasawwuf"] },
    { label:"Lughah Arabiyah", arabic:"اللغة العربية", count:7,
      color:"from-gold-400/10 to-violet-600/5",
      sample:["Nahwu","Sharaf","Balaghah","Adab","Naqd Adabi"] },
    { label:"Tarikh, Dakwah & Tarbiyah", arabic:"التاريخ والدعوة", count:7,
      color:"from-violet-600/10 to-gold-600/5",
      sample:["Sirah","Tarikh Tasyri'","Hadharah","Dakwah","Adyan"] },
  ];
  return (
    <section className="section pt-0">
      <div className="container-x">
        <Reveal className="mb-12 text-center">
          <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 inline-flex items-center gap-2">
            <span className="w-6 h-px bg-gold-500/70"/>36 MADDAH LENGKAP
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.1] mb-4">
            Jurusan apapun. Semester berapapun. Talqih ada untuk kamu.
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((f, i) => (
            <Reveal key={i}>
              <div className={`card-glass p-6 hov-lift bg-gradient-to-br ${f.color} h-full`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="arabic-display text-gold-300 text-2xl mb-1" style={{direction:"rtl"}}>{f.arabic}</div>
                    <h3 className="font-display text-lg font-semibold text-ink">{f.label}</h3>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-violet-500/15 text-violet-300 border border-violet-500/20 font-medium flex-shrink-0 ml-2">
                    {f.count} Maddah
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {f.sample.slice(0,4).map((s, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-ink-muted">
                      <span className="w-1 h-1 rounded-full bg-gold-400 flex-shrink-0"/>{s}
                    </li>
                  ))}
                  {f.count > 4 && <li className="text-xs text-ink-soft italic mt-1">+ {f.count - 4} maddah lainnya</li>}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 text-center">
          <p className="text-sm text-ink-soft">Total 540+ template prompt · Disesuaikan untuk Mustawa sampai S2</p>
        </Reveal>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   5. PRICING + FINAL CTA
   ══════════════════════════════════════════════════════════════ */
const PricingAndCTA = ({ onOpenPayment, onOpenLogin }) => (
  <section className="section pt-0 pb-32">
    <div className="container-x">
      <Reveal className="text-center mb-10">
        <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 inline-flex items-center gap-2">
          <span className="w-6 h-px bg-gold-500/70"/>INVESTASI ILMU
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.1]">
          Harga segelas kopi. Akses seumur hidup ke 540+ prompt yang dirancang khusus untuk Masisir.
        </h2>
      </Reveal>

      <Reveal>
        <div className="max-w-lg mx-auto">
          <div className="card-glass-strong p-8 md:p-10 relative overflow-hidden"
            style={{ border:"1px solid rgba(201,168,106,.22)" }}>
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gold-500/12 blur-3xl pointer-events-none"/>
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-violet-500/12 blur-3xl pointer-events-none"/>
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-xs text-gold-300 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400"/>Member Talqih
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display text-5xl md:text-6xl font-semibold bg-gradient-to-br from-gold-300 to-gold-500 bg-clip-text text-transparent">
                  Rp 49.000
                </span>
              </div>
              <div className="text-xs text-ink-soft uppercase tracking-wider mb-6">Sekali bayar · Berlaku selamanya</div>
              <ul className="space-y-3 mb-8">
                {[
                  "36 Maddah lengkap + 540+ template prompt",
                  "AI recommendation per gaya & tingkat belajarmu",
                  "Muqaranah qoul ulama 4 madzhab",
                  "Kurasah pribadi dengan markdown & teks Arab",
                  "Companion harian: niat, ritme, refleksi",
                  "Update fitur seumur hidup",
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-ink">
                    <Icon name="check" className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5"/>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <button onClick={onOpenPayment}
                className="btn btn-gold w-full py-4 text-base font-medium"
                style={{ boxShadow:"0 0 50px rgba(201,168,106,.4), 0 1px 0 rgba(255,255,255,.3) inset" }}>
                Bayar via Lynk.id →
              </button>
              <p className="text-xs text-ink-soft text-center mt-4">
                Setelah bayar, kode dikirim admin via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Atsar penutup */}
      <Reveal className="mt-20 text-center max-w-lg mx-auto">
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-gold-500/40"/>
          <Icon name="star" className="w-3 h-3 text-gold-400/60"/>
          <span className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-gold-500/40"/>
        </div>
        <div className="arabic-classic text-gold-300 text-3xl md:text-4xl leading-loose mb-3" style={{direction:"rtl"}}>
          قَيِّدُوا الْعِلْمَ بِالْكِتَابَةِ
        </div>
        <p className="text-base text-ink-muted italic mb-1">"Ikatlah ilmu dengan tulisan."</p>
        <p className="text-xs text-ink-soft">— Atsar</p>
        <div className="mt-10 text-sm text-ink-soft">
          Sudah punya kode?{" "}
          <button onClick={onOpenLogin}
            className="text-violet-300 hover:text-violet-200 underline underline-offset-2 font-medium">
            Masuk di sini
          </button>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ── Root ─────────────────────────────────────────────────────── */
const LandingPage = ({ onOpenLogin, onOpenPayment }) => (
  <div className="page-enter">
    <StyleInject/>
    <LandingHero onOpenLogin={onOpenLogin} onOpenPayment={onOpenPayment}/>
    <SampleMaddahSection/>
    <HowItWorks/>
    <AllMaddahPreview/>
    <PricingAndCTA onOpenLogin={onOpenLogin} onOpenPayment={onOpenPayment}/>
  </div>
);

window.LandingPage = LandingPage;
