/* Talqih — Landing page v5: ringkas, 5 section, show don't tell */

const { useState, useEffect } = React;

const LANDING_STYLES = `
  .kali-display  { font-family: "Reem Kufi","Noto Kufi Arabic",sans-serif; direction:rtl; }
  .kali-elegant  { font-family: "Aref Ruqaa",serif; direction:rtl; }
  .hero-kali     { font-family:"Reem Kufi",sans-serif; direction:rtl;
    background:linear-gradient(160deg,rgba(217,189,133,.9),rgba(201,168,106,.5),rgba(169,112,255,.25));
    -webkit-background-clip:text; background-clip:text; color:transparent;
    pointer-events:none; user-select:none; }
  .hero-kali-side{ font-family:"Aref Ruqaa",serif; direction:rtl; pointer-events:none; user-select:none; }
  .hov-lift      { transition:transform .2s ease, box-shadow .2s ease; cursor:pointer; }
  .hov-lift:hover{ transform:translateY(-3px); box-shadow:0 12px 40px -12px rgba(201,168,106,.2); }
`;

const StyleInject = () => {
  useEffect(() => {
    const id = "landing-styles-v5";
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

/* ── Hero Composition — 3 stacked glass cards ───────────────── */
const HeroComposition = () => (
  <div className="relative h-[400px] w-full">
    {/* Card 3 back-left */}
    <div className="absolute left-0 top-14 w-48 card-glass p-4 rounded-xl"
      style={{ zIndex:10, opacity:.42, transform:"rotate(-2.5deg)" }}>
      <div className="text-[9px] uppercase tracking-wider text-violet-300 mb-1.5">✦ AI Rekomendasi</div>
      <div className="text-sm font-semibold text-ink mb-0.5">NotebookLM</div>
      <div className="text-[11px] text-ink-soft">Sesuai: hafalan matan</div>
      <div className="text-[11px] text-ink-soft">Untuk: Nahwu Dasar</div>
    </div>
    {/* Card 2 back-right */}
    <div className="absolute right-0 top-8 w-52 card-glass p-4 rounded-xl"
      style={{ zIndex:20, opacity:.62, transform:"rotate(1.8deg)" }}>
      <div className="text-[9px] uppercase tracking-wider text-gold-400 mb-1.5">Prompt: I'rab Kalimat</div>
      <div className="text-[11px] text-ink-muted leading-relaxed font-mono">
        "Aku thalib di Al-Azhar<br/>yang sedang muthala'ah<br/>bab Marfu'at..."
      </div>
      <div className="mt-2 text-[10px] text-violet-300 font-medium">→ Salin ke Claude</div>
    </div>
    {/* Card 1 front */}
    <div className="absolute left-1/2 -translate-x-1/2 top-0 w-64 card-glass-strong p-5 rounded-2xl"
      style={{ zIndex:30, border:"1px solid rgba(201,168,106,.28)", boxShadow:"0 0 40px rgba(201,168,106,.08)" }}>
      <div className="arabic-display text-gold-300 text-2xl mb-1" style={{direction:"rtl"}}>النحو</div>
      <div className="font-display text-base font-semibold text-ink mb-0.5">Nahwu Dasar</div>
      <div className="text-[11px] text-ink-soft mb-3">Ilmu Sintaksis Arab</div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20">Claude</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-300 border border-gold-500/20">NotebookLM</span>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent mb-3"/>
      <div className="text-[11px] text-ink-muted">17 template prompt</div>
      <div className="text-[10px] text-ink-soft mt-1">Pahami · Hafal · Latihan · Ujian</div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   1. HERO
   ══════════════════════════════════════════════════════════════ */
const LandingHero = ({ onOpenLogin, onOpenPayment }) => (
  <section className="relative overflow-hidden"
    style={{ minHeight:"100vh", display:"flex", alignItems:"center", paddingTop:"80px" }}>
    <div className="pattern-talqih"/>
    <Blob color="rgba(124,77,255,.30)" size={900} top={-300} right={-200}/>
    <Blob color="rgba(201,168,106,.09)" size={700} top={200} left={-250}/>

    {/* Kaligrafi background */}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
      <div className="hero-kali" style={{ fontSize:"clamp(110px,22vw,290px)", opacity:.055, letterSpacing:".01em" }}>
        اقْرَأْ
      </div>
    </div>
    <div className="absolute right-6 top-1/3 pointer-events-none select-none hidden lg:flex flex-col items-end">
      <div className="hero-kali-side text-gold-400" style={{ fontSize:"54px", opacity:.17, lineHeight:1.6 }}>
        بِسْمِ اللَّهِ
      </div>
    </div>
    <div className="absolute left-4 bottom-1/3 pointer-events-none select-none hidden lg:block">
      <div className="hero-kali-side text-violet-300" style={{ fontSize:"34px", opacity:.13, lineHeight:2, textAlign:"right" }}>
        وَمَا أُوتِيتُم
      </div>
      <div className="hero-kali-side text-violet-300" style={{ fontSize:"34px", opacity:.13, lineHeight:2, textAlign:"right" }}>
        مِّنَ الْعِلْمِ
      </div>
    </div>

    <div className="container-x relative w-full py-16">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* Kiri — copy */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400"/>
            <span className="text-violet-300 font-medium">Talqih</span>
            <span className="text-ink-soft">·</span>
            <span className="text-ink-muted">Panduan AI untuk Masisir</span>
          </div>

          <div className="arabic-classic text-gold-300 text-base mb-3" style={{direction:"rtl", lineHeight:1.8}}>
            تَلْقِيح
          </div>

          <h1 className="font-display font-semibold leading-[1.05] text-ink mb-5"
            style={{ fontSize:"clamp(38px,5.5vw,70px)" }}>
            Belajar materi Azhar,<br/>
            <span className="bg-gradient-to-r from-violet-300 via-violet-400 to-gold-400 bg-clip-text text-transparent">
              dipahami dengan AI.
            </span>
          </h1>

          <p className="text-lg text-ink-muted leading-relaxed mb-8 max-w-xl">
            Panduan + template prompt + rekomendasi AI personal untuk Masisir semua tingkat — dari Mustawa sampai S2.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-start mb-5">
            <button onClick={() => navigate("/sample/nahwu")}
              className="btn btn-gold text-base px-7 py-3.5"
              style={{ boxShadow:"0 0 40px rgba(201,168,106,.35), 0 1px 0 rgba(255,255,255,.3) inset" }}>
              Cobain Sample Gratis →
            </button>
            <button onClick={onOpenPayment} className="btn btn-ghost text-base px-7 py-3.5">
              Gabung Member · 49k
            </button>
          </div>

          <div className="text-sm text-ink-soft mb-8">
            Sudah punya kode?{" "}
            <button onClick={onOpenLogin}
              className="text-violet-300 hover:text-violet-200 underline underline-offset-2">
              Masuk di sini
            </button>
          </div>

          <div className="flex flex-wrap gap-5 text-xs text-ink-soft">
            {["36 Maddah lengkap","540+ template prompt","Bayar sekali, akses selamanya"].map((t, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <Icon name="check" className="w-3.5 h-3.5 text-gold-400"/>{t}
              </span>
            ))}
          </div>
        </div>

        {/* Kanan — 3 stacked cards, hidden di mobile */}
        <div className="hidden lg:block">
          <HeroComposition/>
        </div>

        {/* Mobile: Card 1 saja */}
        <div className="lg:hidden max-w-xs mx-auto w-full">
          <div className="card-glass-strong p-5 rounded-2xl" style={{ border:"1px solid rgba(201,168,106,.2)" }}>
            <div className="arabic-display text-gold-300 text-2xl mb-1" style={{direction:"rtl"}}>النحو</div>
            <div className="font-display text-base font-semibold text-ink mb-2">Sample: Nahwu Dasar</div>
            <div className="flex gap-1.5 mb-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20">Claude</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-300 border border-gold-500/20">NotebookLM</span>
            </div>
            <div className="text-[11px] text-ink-muted">17 template prompt · Gratis tanpa login</div>
          </div>
        </div>
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
          Sample lengkap: <span className="text-gold-300">Nahwu Dasar</span>
        </h2>
        <p className="text-ink-muted text-base max-w-xl mx-auto">
          Tanpa daftar, tanpa bayar. Cobain workflow Talqih dengan 1 Maddah lengkap.
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
            Tiga langkah, langsung jalan.
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
            Untuk semua fakultas rumpun agama dan bahasa.
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
          Bayar sekali. Akses 36 Maddah selamanya.
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
              <div className="text-xs text-ink-soft uppercase tracking-wider mb-6">One-time · No subscription</div>
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
