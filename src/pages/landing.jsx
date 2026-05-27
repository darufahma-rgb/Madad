/* Madad — Landing page (conversion-focused redesign) */

const LandingPage = ({ onOpenLogin, onOpenPayment }) => {
  return (
    <div className="page-enter">
      <Hero onOpenLogin={onOpenLogin} onOpenPayment={onOpenPayment}/>
      <SocialProof/>
      <BantuanSection/>
      <HowItWorks onOpenPayment={onOpenPayment}/>
      <MataPelajaranSection onOpenPayment={onOpenPayment}/>
      <BeforeAfterSection/>
      <FeaturesShowcase onOpenPayment={onOpenPayment}/>
      <EthicsTeaser/>
      <PricingSection onOpenPayment={onOpenPayment} onOpenLogin={onOpenLogin}/>
      <FaqSection/>
      <JoinCTA onOpenLogin={onOpenLogin} onOpenPayment={onOpenPayment}/>
    </div>
  );
};

/* ================================================================
   HERO
   ================================================================ */
const Hero = ({ onOpenLogin, onOpenPayment }) => (
  <section className="relative overflow-hidden pt-12 md:pt-20 pb-20 md:pb-28">
    <Blob color="rgba(124,77,255,0.38)" size={700} top={-220} right={-120}/>
    <Blob color="rgba(201,168,106,0.16)" size={540} top={260} left={-180}/>
    <div className="absolute top-0 right-0 w-[55%] h-[130%] opacity-15 pointer-events-none">
      <Arch className="w-full h-full" color="rgba(212,165,116,0.22)"/>
    </div>
    <div className="absolute inset-0 pattern-stars opacity-40 pointer-events-none"/>

    <div className="container-x relative">
      <div className="grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">

          {/* Badge */}
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full chip-glass text-xs mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 shadow-[0_0_8px_rgba(201,168,106,0.9)] animate-pulse"/>
              <span className="text-ink-muted">Khusus Masisir · </span>
              <span className="arabic text-gold-300 text-sm">لطلاب الأزهر الإندونيسيين</span>
            </div>
          </Reveal>

          {/* Headline */}
          <Reveal delay={80}>
            <h1 className="mt-4 font-display text-5xl sm:text-6xl md:text-[72px] font-semibold text-ink leading-[1.0] tracking-tightest">
              Dosen ngomong cepat.
              <span className="block text-ink-muted/70 mt-1">Maqarrar tebal.</span>
              <span className="block gradient-text mt-1">Syafahi minggu depan.</span>
            </h1>
          </Reveal>

          {/* Subline */}
          <Reveal delay={220}>
            <p className="mt-7 text-lg md:text-xl text-ink-muted leading-relaxed max-w-xl">
              MADAD kasih kamu <em className="text-ink not-italic font-medium">panduan cara pakai AI</em> — Claude, ChatGPT, Perplexity — untuk setiap mata pelajaran Al-Azharmu.
              Bukan AI-nya. <em className="text-gold-300 not-italic">Cara pakainya.</em>
            </p>
          </Reveal>

          {/* CTAs */}
          <Reveal delay={380}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button onClick={onOpenPayment}
                className="btn btn-gold text-base px-8 py-3.5 shadow-[0_0_30px_rgba(201,168,106,0.3)]">
                <Icon name="sparkles" className="w-4 h-4"/> Gabung Sekarang · Rp49.000
              </button>
              <a href="#cara-kerja"
                onClick={(e)=>{ e.preventDefault(); document.getElementById("cara-kerja")?.scrollIntoView({behavior:"smooth"}); }}
                className="btn btn-ghost text-base px-6 py-3.5">
                Lihat Cara Kerja <Icon name="chevronDown" className="w-4 h-4"/>
              </a>
              <button onClick={onOpenLogin}
                className="text-sm text-ink-muted hover:text-ink transition-colors ml-1 underline underline-offset-4">
                Sudah punya kode?
              </button>
            </div>
          </Reveal>

          {/* Stats bar */}
          <Reveal delay={520}>
            <div className="mt-12 flex items-center gap-8 flex-wrap">
              <div className="text-center">
                <div className="font-display text-4xl text-gold-400 font-semibold num leading-none">19</div>
                <div className="text-[11px] text-ink-soft uppercase tracking-wider mt-1.5">Mata Pelajaran</div>
              </div>
              <div className="w-px h-8 bg-line"/>
              <div className="text-center">
                <div className="font-display text-4xl text-gold-400 font-semibold num leading-none">3</div>
                <div className="text-[11px] text-ink-soft uppercase tracking-wider mt-1.5">AI Terkurasi</div>
              </div>
              <div className="w-px h-8 bg-line"/>
              <div className="text-center">
                <div className="font-display text-4xl text-gold-400 font-semibold num leading-none">Rp49rb</div>
                <div className="text-[11px] text-ink-soft uppercase tracking-wider mt-1.5">Bayar Sekali · Selamanya</div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Hero visual */}
        <div className="lg:col-span-5 hidden lg:block">
          <Reveal delay={300}>
            <HeroComposition/>
          </Reveal>
        </div>
      </div>
    </div>
    <div className="divider-arabesque mt-4"/>
  </section>
);

/* Hero visual composition */
const HeroComposition = () => (
  <div className="relative h-[520px]">
    {/* Main dashboard card */}
    <div className="absolute inset-x-0 top-4 card-glass-strong p-6 shadow-glass"
      style={{transform:"perspective(900px) rotateY(-5deg) rotateX(2deg)"}}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <LogoMark size={28}/>
          <span className="font-display text-sm text-ink font-medium">Madad</span>
        </div>
        <span className="chip chip-violet text-[10px]">🌙 Member Aktif</span>
      </div>

      <div className="arabic text-right text-lg text-gold-300 mb-4">السلام عليكم يا أحمد</div>

      {/* Current lesson card */}
      <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 mb-4">
        <div className="text-[10px] uppercase tracking-wider text-violet-300 mb-2">📖 Panduan Aktif — Fiqh</div>
        <div className="font-mono text-xs text-ink-muted leading-relaxed">
          "Berperanlah sebagai mudarris Azhari. Mulai dengan menanyakan apa yang sudah aku ketahui tentang <strong className="text-violet-200">qiyas...</strong>"
        </div>
        <div className="flex items-center gap-2 mt-2.5">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D97757]/20 text-[#D97757] border border-[#D97757]/30">Claude</span>
          <span className="text-[10px] text-ink-soft">→ Gaya: Diskusi bertahap</span>
        </div>
      </div>

      {/* AI recs */}
      <div className="text-xs uppercase tracking-wider text-ink-muted mb-2.5">Pilih AI untuk sesi ini</div>
      <div className="space-y-2">
        {[
          { n: "Claude",      c: "#D97757", r: "Bedah kitab & qoul ulama",     best: true },
          { n: "ChatGPT",     c: "#10A37F", r: "Drill soal & diskusi bertahap", best: false },
          { n: "Perplexity",  c: "#1FB6B6", r: "Cari sumber & referensi",       best: false },
        ].map((t,i) => (
          <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg border ${t.best ? "bg-[#D97757]/8 border-[#D97757]/25" : "bg-white/4 border-line"}`}>
            <span className="w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-mono font-bold text-white flex-shrink-0"
              style={{background:t.c}}>{t.n.slice(0,2)}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-ink">{t.n}</div>
              <div className="text-[11px] text-ink-muted truncate">{t.r}</div>
            </div>
            {t.best && <span className="text-[9px] text-[#D97757] border border-[#D97757]/30 rounded-full px-1.5 py-0.5 flex-shrink-0">Terbaik</span>}
          </div>
        ))}
      </div>
    </div>

    {/* Floating prompt chip */}
    <div className="absolute bottom-24 -left-6 card-glass p-3.5 shadow-glow max-w-[200px]"
      style={{transform:"rotate(-4deg)"}}>
      <div className="text-[10px] uppercase tracking-wider text-violet-300 mb-1.5">✓ Prompt disalin</div>
      <div className="font-mono text-[11px] text-ink-muted leading-relaxed">
        "Tanyakan dulu apa yang aku tahu..."
      </div>
    </div>

    {/* Floating code chip */}
    <div className="absolute bottom-4 right-0 card-glass p-3 shadow-glass"
      style={{transform:"rotate(2deg)"}}>
      <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-0.5">Kode Akses</div>
      <div className="font-mono text-sm text-gold-300 tracking-widest">MSR-H82M-X4ZT</div>
    </div>
  </div>
);


/* ================================================================
   SOCIAL PROOF — Testimoni Masisir
   ================================================================ */
const TESTIMONIALS = [
  {
    name: "Ahmad F.",
    context: "Masisir · Syariah, Sem. 4",
    quote: "Dulu aku stuck sama maqarrar Fiqh yang Arab. Sekarang aku paste bagian yang ga ngerti ke Claude, minta Claude jadi tutor Azhari. Bisa tanya-tanya dulu, baru baca aslinya. Jauh lebih nempel.",
    highlight: "Claude jadi tutor Azhari",
  },
  {
    name: "Naila R.",
    context: "Masisir · Bahasa Arab, Sem. 3",
    quote: "Prompt Nahwu dari MADAD bener-bener beda. Bukan 'tolong jelaskan i'rab', tapi prompt yang bikin ChatGPT kasih soal satu-satu, koreksi interaktif. Kayak punya ustaz private 24 jam.",
    highlight: "Ustaz private 24 jam",
  },
  {
    name: "Faruq A.",
    context: "Masisir · Ushuluddin, Sem. 5",
    quote: "Makalah 10 halaman yang biasanya 3 hari bisa selesai dalam sehari. Prompt Perplexity untuk cari sumber primer itu game changer. Semua sumber ada trackable-nya.",
    highlight: "3 hari → sehari",
  },
  {
    name: "Rizka M.",
    context: "Masisir · Syariah, Sem. 2",
    quote: "Buat latihan syafahi, aku roleplay sama ChatGPT jadi dosen penguji Azhari. Nanya-nanya dalam Arab, aku jawab. Pas syafahi beneran aku udah ga grogi. Nilainya mumtaz.",
    highlight: "Syafahi dapat mumtaz",
  },
];

const SocialProof = () => (
  <section className="section pt-4 pb-16">
    <div className="container-x">
      <Reveal className="text-center mb-4">
        <div className="text-xs uppercase tracking-[0.22em] text-gold-400 flex items-center justify-center gap-2 mb-3">
          <span className="w-6 h-px bg-gold-500/70"/>Kata Masisir<span className="w-6 h-px bg-gold-500/70"/>
        </div>
        <p className="text-ink-muted text-base">Dari sesama mahasiswa Al-Azhar yang sudah pakai MADAD.</p>
      </Reveal>

      <Reveal stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="card-glass p-5 flex flex-col gap-4 hov-lift">
            {/* Stars */}
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_,j) => (
                <Icon key={j} name="star" className="w-3.5 h-3.5 text-gold-400" fill="currentColor" strokeWidth={0}/>
              ))}
            </div>
            {/* Quote */}
            <p className="text-sm text-ink-muted leading-relaxed flex-1">
              "{t.quote}"
            </p>
            {/* Highlight tag */}
            <div className="inline-flex items-center self-start gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
              <Icon name="check" className="w-3 h-3 text-violet-300" strokeWidth={2.5}/>
              <span className="text-[11px] text-violet-200 font-medium">{t.highlight}</span>
            </div>
            {/* Author */}
            <div className="flex items-center gap-2.5 pt-2 border-t border-line">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                <Icon name="user" className="w-4 h-4 text-violet-300"/>
              </div>
              <div>
                <div className="text-sm font-medium text-ink">{t.name}</div>
                <div className="text-[11px] text-ink-soft">{t.context}</div>
              </div>
            </div>
          </div>
        ))}
      </Reveal>
    </div>
  </section>
);


/* ================================================================
   BANTUAN — Pain Points
   ================================================================ */
const PAIN_POINTS = [
  {
    icon: "book",
    label: "Maqarrar Arab yang Padat",
    desc: "Kitab berbahasa Arab, istilah teknis, tidak ada terjemahan. Baca sekali tidak cukup. Baca dua kali tetap bingung.",
  },
  {
    icon: "headphones",
    label: "Kuliah Terlalu Cepat",
    desc: "Dosen menjelaskan dalam bahasa Arab dengan cepat. Catatan tidak lengkap. Materi terlewat susah dikejar.",
  },
  {
    icon: "messageSquare",
    label: "Syafahi Mengintimidasi",
    desc: "Ujian lisan dalam bahasa Arab di depan dosen. Tidak ada tempat latihan yang aman sebelum hari H.",
  },
  {
    icon: "clipboard",
    label: "Makalah Gaya Azhari",
    desc: "Format makalah akademik Azhari punya aturan tersendiri. Referensi primer bahasa Arab. Susah tanpa panduan.",
  },
  {
    icon: "search",
    label: "Referensi Tidak Tertelusur",
    desc: "Butuh sumber primer yang valid. Searching biasa hanya hasilkan artikel Indonesia, bukan kitab asli.",
  },
];

const BantuanSection = () => (
  <section className="section pt-0">
    <div className="container-x">
      <Reveal className="text-center max-w-2xl mx-auto mb-12">
        <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 flex items-center justify-center gap-2">
          <span className="w-6 h-px bg-gold-500/70"/>Tantangan Nyata<span className="w-6 h-px bg-gold-500/70"/>
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.05]">
          Kita semua pernah di sini.
        </h2>
        <p className="mt-4 text-ink-muted text-lg max-w-xl mx-auto">
          Lima tantangan akademik yang paling sering dialami Masisir — dan mengapa AI generik tidak cukup untuk menghadapinya.
        </p>
      </Reveal>

      <Reveal stagger className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {PAIN_POINTS.map((s, i) => (
          <div key={i} className="card-glass p-6 hov-lift flex flex-col gap-4">
            <div className="w-11 h-11 rounded-xl bg-violet-500/15 text-violet-300 flex items-center justify-center flex-shrink-0">
              <Icon name={s.icon} className="w-5 h-5"/>
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-ink mb-2 leading-tight">{s.label}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </Reveal>
    </div>
  </section>
);


/* ================================================================
   HOW IT WORKS — 3 Langkah
   ================================================================ */
const HowItWorks = ({ onOpenPayment }) => (
  <section id="cara-kerja" className="section pt-0">
    <div className="container-x">
      <Reveal className="card-glass-strong p-10 md:p-14 relative overflow-hidden">
        <Blob color="rgba(124,77,255,0.25)" size={400} top={-100} right={-100}/>
        <Blob color="rgba(201,168,106,0.15)" size={350} bottom={-80} left={-80}/>

        <div className="relative">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 flex items-center justify-center gap-2">
              <span className="w-6 h-px bg-gold-500/70"/>Cara Kerja MADAD<span className="w-6 h-px bg-gold-500/70"/>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.05]">
              Tiga langkah. Langsung bisa dipakai.
            </h2>
            <p className="mt-4 text-ink-muted text-lg max-w-xl mx-auto">
              Tidak perlu setup. Tidak perlu akun baru. AI-nya sudah ada di HP kamu.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                num: "01",
                icon: "bookOpen",
                color: "gold",
                title: "Pilih Mata Pelajaran",
                desc: "Pilih dari 19 panduan — Fiqh, Nahwu, Tafsir, Hadith, Makalah, Syafahi, dan lebih. Masing-masing punya strategi dan AI rekomendasi yang berbeda.",
                detail: "Tersedia untuk Syariah, Ushuluddin, Bahasa Arab & Lintas Mapel",
              },
              {
                num: "02",
                icon: "arrowRight",
                color: "violet",
                title: "Buka AI yang Disarankan",
                desc: "MADAD kasih tahu: untuk mata pelajaran ini, buka Claude. Atau ChatGPT. Atau Perplexity. Semuanya gratis — kamu tinggal buka.",
                detail: "Tidak perlu daftar, tidak perlu bayar lagi ke AI",
              },
              {
                num: "03",
                icon: "copy",
                color: "gold",
                title: "Pakai Prompt Siap Pakai",
                desc: "Copy prompt-nya, ganti bagian [dalam kurung siku] dengan topikmu, kirim ke AI. Dalam hitungan detik kamu punya tutor yang paham konteks Azhari.",
                detail: "Langsung bisa dipakai, tidak perlu rekayasa prompt sendiri",
              },
            ].map((step, i) => (
              <div key={i} className="relative">
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px z-0"
                    style={{background:"linear-gradient(to right, rgba(124,77,255,0.4), transparent)", width:"calc(100% - 2rem)", left:"calc(100% - 1rem)"}}>
                  </div>
                )}
                <div className="relative flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${step.color === "gold" ? "bg-gold-500/15 text-gold-300" : "bg-violet-500/15 text-violet-300"}`}>
                      <Icon name={step.icon} className="w-7 h-7"/>
                    </div>
                    <div className={`font-display text-5xl font-semibold leading-none ${step.color === "gold" ? "text-gold-500/30" : "text-violet-500/30"}`}>
                      {step.num}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-ink mb-2">{step.title}</h3>
                    <p className="text-sm text-ink-muted leading-relaxed mb-3">{step.desc}</p>
                    <div className={`text-[11px] px-3 py-1.5 rounded-full border inline-flex items-center gap-1.5 ${step.color === "gold" ? "bg-gold-500/8 text-gold-400 border-gold-500/20" : "bg-violet-500/8 text-violet-300 border-violet-500/20"}`}>
                      <Icon name="check" className="w-3 h-3" strokeWidth={2.5}/>
                      {step.detail}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button onClick={onOpenPayment} className="btn btn-gold text-base px-9 py-3.5">
              <Icon name="sparkles" className="w-4 h-4"/> Mulai Langkah Pertama · Rp49.000
            </button>
            <p className="mt-3 text-xs text-ink-soft">Bayar sekali. Akses selamanya. Tidak ada biaya bulanan.</p>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);


/* ================================================================
   MATA PELAJARAN
   ================================================================ */
const MataPelajaranSection = ({ onOpenPayment }) => {
  const MAPEL_PREVIEW = [
    { subject: "Fiqh",                 arabic: "الفِقْهُ",               ai: "Claude",     aiColor: "#D97757", icon: "layers",       faculty: "Syariah" },
    { subject: "Ushul Fiqh",           arabic: "أُصُولُ الفِقْهِ",       ai: "ChatGPT",    aiColor: "#10A37F", icon: "bookOpen",     faculty: "Syariah" },
    { subject: "Qawaid Fiqhiyyah",     arabic: "القَوَاعِدُ الفِقْهِيَّةُ", ai: "Claude",  aiColor: "#D97757", icon: "shield",       faculty: "Syariah" },
    { subject: "Hadith & Musthalah",   arabic: "الحَدِيثُ",              ai: "Perplexity", aiColor: "#1FB6B6", icon: "search",       faculty: "Ushuluddin" },
    { subject: "Tafsir & Ulum Quran",  arabic: "التَّفْسِيرُ",           ai: "Claude",     aiColor: "#D97757", icon: "quote",        faculty: "Ushuluddin" },
    { subject: "Aqidah & Kalam",       arabic: "العَقِيدَةُ",            ai: "Claude",     aiColor: "#D97757", icon: "star",         faculty: "Ushuluddin" },
    { subject: "Nahwu & Sharaf",       arabic: "النَّحْوُ وَالصَّرْفُ",  ai: "ChatGPT",    aiColor: "#10A37F", icon: "pen",          faculty: "Bahasa Arab" },
    { subject: "Balaghah",             arabic: "البَلَاغَةُ",            ai: "Claude",     aiColor: "#D97757", icon: "sparkles",     faculty: "Bahasa Arab" },
    { subject: "Ujian Syafahi",        arabic: "الامْتِحَانُ الشَّفَهِيُّ", ai: "ChatGPT", aiColor: "#10A37F", icon: "messageSquare",faculty: "Lintas Mapel" },
    { subject: "Makalah Azhari",       arabic: "البَحْثُ العِلْمِيُّ",   ai: "ChatGPT",    aiColor: "#10A37F", icon: "clipboard",    faculty: "Lintas Mapel" },
  ];

  return (
    <section id="mata-pelajaran" className="section pt-0">
      <div className="container-x">
        <Reveal className="mb-12">
          <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 flex items-center gap-2">
            <span className="w-6 h-px bg-gold-500/70"/>19 Panduan Mata Pelajaran
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.05] max-w-2xl">
              Setiap mapel punya AI dan strategi yang tepat.
            </h2>
            <p className="text-ink-muted text-base max-w-sm md:text-right leading-relaxed">
              MADAD tidak bilang "pakai AI". MADAD bilang <em className="text-ink not-italic">bagaimana dan AI mana</em> untuk Nahwu — dan kenapa Claude lebih baik dari ChatGPT untuk bedah Fiqh.
            </p>
          </div>
        </Reveal>

        <Reveal stagger className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          {MAPEL_PREVIEW.map((m) => (
            <div key={m.subject} className="card-glass p-5 hov-lift flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="w-9 h-9 rounded-lg bg-violet-500/12 text-violet-300 flex items-center justify-center flex-shrink-0">
                  <Icon name={m.icon} className="w-4 h-4"/>
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border flex-shrink-0"
                  style={{background: m.aiColor + "18", color: m.aiColor, borderColor: m.aiColor + "35"}}>
                  {m.ai}
                </span>
              </div>
              <div>
                <div className="font-display text-base font-semibold text-ink leading-tight">{m.subject}</div>
                <div className="arabic text-xs text-gold-300/70 mt-0.5">{m.arabic}</div>
              </div>
              <div className="text-[11px] text-ink-soft mt-auto px-1.5 py-0.5 rounded bg-white/4 border border-line self-start">
                {m.faculty}
              </div>
            </div>
          ))}
        </Reveal>

        <Reveal>
          <div className="card-glass p-6 md:p-8 border-gold-500/15 bg-gold-500/3 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <div className="text-sm font-semibold text-ink mb-1">
                Ini baru 10 dari 19 panduan yang tersedia.
              </div>
              <p className="text-sm text-ink-muted leading-relaxed">
                Di dalam: Muamalat, Tarikh Tasyri', Mantiq, Sirah, Adab, Riset, Hafalan, Kuliah Bahasa Arab, dan lebih.
                Semua dengan prompt spesifik dan step-by-step yang sesuai konteks Al-Azhar.
              </p>
            </div>
            <button onClick={onOpenPayment} className="btn btn-primary text-sm px-7 py-3 flex-shrink-0">
              <Icon name="sparkles" className="w-4 h-4"/> Akses Semua 19 Panduan
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
};


/* ================================================================
   BEFORE / AFTER — Dramatic comparison
   ================================================================ */
const COMPARISONS = [
  {
    mapel: "Fiqh · Ushul",
    scenario: "Memahami dalil qiyas",
    before: '"Tolong jelaskan konsep qiyas dalam ushul fiqh."',
    beforeResult: "Penjelasan Wikipedia 5 paragraf. Kamu baca. Tetap bingung.",
    after: '"Berperanlah sebagai mudarris Azhari. Aku mau paham qiyas dari nol. Tanyakan dulu apa yang sudah aku ketahui, lalu bimbing dengan pertanyaan Socratic bertahap. Jawab pendek, tunggu responku."',
    afterResult: "Dialog interaktif, temuan mandiri, ingatan 3× lebih kuat.",
    ai: "Claude",
    aiColor: "#D97757",
  },
  {
    mapel: "Nahwu & Sharaf",
    scenario: "Drill i'rab sebelum ujian",
    before: '"Buatkan 10 soal latihan i\'rab."',
    beforeResult: "10 soal muncul sekaligus. Kamu jawab, tapi tidak tahu mana yang salah dan kenapa.",
    after: '"Jadilah guru nahwu. Berikan SATU soal i\'rab, tunggu jawabanku, baru koreksi dengan penjelasan singkat, lalu soal berikutnya. Ulangi 15 kali."',
    afterResult: "Sesi drilling interaktif. Koreksi langsung. Ingat posisi i'rab dengan konteks.",
    ai: "ChatGPT",
    aiColor: "#10A37F",
  },
  {
    mapel: "Ujian Syafahi",
    scenario: "Latihan sebelum hari H",
    before: '"Beri aku pertanyaan ujian Fiqh."',
    beforeResult: "Pertanyaan muncul 10 sekaligus, berbahasa Indonesia. Tidak mirip situasi nyata.",
    after: '"Berperanlah sebagai dosen penguji Azhari yang ketat. Tanya aku SATU pertanyaan dalam bahasa Arab formal. Tunggu jawabanku, beri feedback, lanjut ke pertanyaan berikutnya."',
    afterResult: "Simulasi syafahi yang realistis. Latihan dalam tekanan. Hilang grogi sebelum ujian.",
    ai: "ChatGPT",
    aiColor: "#10A37F",
  },
];

const BeforeAfterSection = () => {
  const [active, setActive] = React.useState(0);
  const c = COMPARISONS[active];
  return (
    <section className="section pt-0">
      <div className="container-x">
        <Reveal className="mb-10 text-center">
          <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 flex items-center justify-center gap-2">
            <span className="w-6 h-px bg-gold-500/70"/>Perbedaan Nyata<span className="w-6 h-px bg-gold-500/70"/>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.05]">
            AI yang sama. Prompt yang <em className="text-gold-300 not-italic">berbeda</em>.
          </h2>
          <p className="mt-4 text-ink-muted text-lg max-w-xl mx-auto">
            ChatGPT gratis untuk semua orang. Tapi cara pakainya beda tipis antara hasil biasa dan luar biasa.
          </p>
        </Reveal>

        {/* Tab switcher */}
        <Reveal className="flex flex-wrap gap-2 justify-center mb-8">
          {COMPARISONS.map((comp, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`text-sm px-4 py-2 rounded-full border transition-all ${active === i ? "bg-violet-500/20 text-violet-200 border-violet-400/40" : "bg-white/3 text-ink-muted border-line hover:border-violet-400/25"}`}>
              {comp.mapel}
            </button>
          ))}
        </Reveal>

        <Reveal>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {/* Before */}
            <div className="p-6 rounded-2xl bg-white/3 border border-white/8 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/40 border border-red-500/50"/>
                <span className="text-xs uppercase tracking-wider text-ink-soft font-medium">Tanpa MADAD</span>
              </div>
              <div className="text-xs text-ink-muted italic mb-1">Konteks: {c.scenario}</div>
              <div className="p-4 rounded-xl bg-black/20 border border-white/6">
                <div className="text-[10px] uppercase tracking-wider text-ink-soft mb-2">Prompt yang dikirim ke {c.ai}</div>
                <div className="font-mono text-sm text-ink-muted leading-relaxed">{c.before}</div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-red-400 mt-0.5 flex-shrink-0">→</span>
                <p className="text-sm text-ink-muted leading-relaxed">{c.beforeResult}</p>
              </div>
            </div>

            {/* After */}
            <div className="p-6 rounded-2xl border relative overflow-hidden flex flex-col gap-4"
              style={{background: c.aiColor + "08", borderColor: c.aiColor + "30"}}>
              <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none"
                style={{background:`radial-gradient(circle at top right, ${c.aiColor}80, transparent 70%)`}}/>
              <div className="flex items-center gap-2 relative">
                <span className="w-3 h-3 rounded-full border" style={{background: c.aiColor + "60", borderColor: c.aiColor + "80"}}/>
                <span className="text-xs uppercase tracking-wider font-medium" style={{color: c.aiColor}}>Dengan MADAD · Prompt Terkurasi</span>
              </div>
              <div className="text-xs text-ink-muted italic mb-1 relative">Konteks: {c.scenario}</div>
              <div className="p-4 rounded-xl bg-black/25 border relative" style={{borderColor: c.aiColor + "25"}}>
                <div className="text-[10px] uppercase tracking-wider mb-2" style={{color: c.aiColor}}>Prompt dari panduan MADAD</div>
                <div className="font-mono text-sm leading-relaxed" style={{color: c.aiColor + "CC"}}>{c.after}</div>
              </div>
              <div className="flex items-start gap-2.5 relative">
                <span className="mt-0.5 flex-shrink-0" style={{color: c.aiColor}}>→</span>
                <p className="text-sm text-ink leading-relaxed font-medium">{c.afterResult}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};


/* ================================================================
   FEATURES SHOWCASE
   ================================================================ */
const FeaturesShowcase = ({ onOpenPayment }) => (
  <section className="section pt-0">
    <div className="container-x">
      <Reveal className="text-center max-w-2xl mx-auto mb-12">
        <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 flex items-center justify-center gap-2">
          <span className="w-6 h-px bg-gold-500/70"/>Yang Membedakan MADAD<span className="w-6 h-px bg-gold-500/70"/>
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.05]">
          Bukan sekadar kumpulan prompt.
        </h2>
        <p className="mt-4 text-ink-muted text-lg max-w-xl mx-auto">
          Ekosistem belajar yang dirancang khusus untuk cara belajar thalibul ilmi di Al-Azhar.
        </p>
      </Reveal>

      <Reveal stagger className="grid md:grid-cols-3 gap-5 mb-8">
        {/* Muqaranah */}
        <div className="card-glass-strong p-6 hov-lift relative overflow-hidden flex flex-col">
          <Blob color="rgba(201,168,106,0.18)" size={200} top={-60} right={-60}/>
          <div className="relative flex-1 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-gold-500/15 text-gold-300 flex items-center justify-center mb-4">
              <Icon name="layers" className="w-5 h-5"/>
            </div>
            <div className="text-[11px] uppercase tracking-wider text-gold-400 mb-1">Muqaranah</div>
            <h3 className="font-display text-xl font-semibold text-ink mb-3">Perbandingan Qoul Ulama</h3>
            <p className="text-sm text-ink-muted leading-relaxed mb-5 flex-1">
              Bandingkan pendapat ulama lintas mazhab secara terstruktur. Dalil, wajh istidlal, dan sumber kitab — bukan sekadar poin-poin generik.
            </p>
            <div className="card-glass p-4 rounded-xl">
              <div className="text-[10px] uppercase tracking-wider text-gold-400 mb-2">Contoh kajian</div>
              <div className="arabic text-base text-gold-200 leading-loose mb-1">حُكْمُ قِرَاءَةِ الفَاتِحَةِ لِلْمَأْمُومِ</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">Syafi'i</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gold-500/10 text-gold-300 border border-gold-500/20">Hanafi</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-ink-muted border border-line">+2 mazhab</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kurasah */}
        <div className="card-glass-strong p-6 hov-lift relative overflow-hidden flex flex-col">
          <Blob color="rgba(124,77,255,0.18)" size={200} top={-60} left={-60}/>
          <div className="relative flex-1 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-300 flex items-center justify-center mb-4">
              <Icon name="book" className="w-5 h-5"/>
            </div>
            <div className="text-[11px] uppercase tracking-wider text-violet-300 mb-1">Kurasah Digital</div>
            <h3 className="font-display text-xl font-semibold text-ink mb-3">Catatan Bergaya Ulama</h3>
            <p className="text-sm text-ink-muted leading-relaxed mb-5 flex-1">
              Catat ilmu dengan Markdown, teks Arab, dan shortcode — karena ilmu yang tidak dicatat, mudah terlupa. <span className="arabic text-gold-300/80">قَيِّدُوا الْعِلْمَ بِالْكِتَابَةِ</span>
            </p>
            <div className="card-glass p-4 rounded-xl font-mono text-xs text-ink-muted leading-relaxed space-y-1">
              <div><span className="text-violet-300">## </span><span className="text-ink">Ringkasan Dars Ushul</span></div>
              <div className="text-gold-200/70 text-right" style={{direction:"rtl",fontFamily:"Noto Naskh Arabic,serif"}}>الأَمْرُ يَقْتَضِي الوُجُوبَ</div>
              <div><span className="text-violet-300">**</span>Wajh istidlal:<span className="text-violet-300">**</span> ...</div>
              <div className="text-ink-soft">→ Export ke Markdown</div>
            </div>
          </div>
        </div>

        {/* Companion */}
        <div className="card-glass-strong p-6 hov-lift relative overflow-hidden flex flex-col">
          <Blob color="rgba(124,77,255,0.14)" size={200} bottom={-60} right={-60}/>
          <div className="relative flex-1 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-300 flex items-center justify-center mb-4">
              <Icon name="heart" className="w-5 h-5"/>
            </div>
            <div className="text-[11px] uppercase tracking-wider text-violet-300 mb-1">Companion Harian</div>
            <h3 className="font-display text-xl font-semibold text-ink mb-3">Niat, Ritme & Muhasabah</h3>
            <p className="text-sm text-ink-muted leading-relaxed mb-5 flex-1">
              Setiap hari diawali niat, bukan to-do list. Ritme belajar dicatat, bukan distreakkan. Diakhiri muhasabah — karena belajar adalah ibadah.
            </p>
            <div className="card-glass p-4 rounded-xl space-y-3">
              {[
                { label: "Niat hari ini", val: "نَوَيْتُ طَلَبَ الْعِلْمِ لِلَّهِ", arabic: true },
                { label: "Ritme belajar", val: "Hadir hari ini", arabic: false },
              ].map((item,i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-ink-muted">{item.label}</span>
                  {item.arabic
                    ? <span className="arabic text-xs text-gold-300">{item.val}</span>
                    : <span className="text-[10px] px-2 py-0.5 rounded border bg-violet-500/10 text-violet-300 border-violet-500/20">{item.val}</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal className="text-center">
        <button onClick={onOpenPayment} className="btn btn-primary text-base px-8 py-3.5">
          <Icon name="sparkles" className="w-4 h-4"/> Akses Semua Fitur
        </button>
      </Reveal>
    </div>
  </section>
);


/* ================================================================
   ETHICS TEASER
   ================================================================ */
const EthicsTeaser = () => (
  <section className="section pt-0">
    <div className="container-x">
      <Reveal className="grid md:grid-cols-12 gap-8 items-center card-glass p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-full w-1/2 opacity-15 pointer-events-none">
          <Arch className="w-full h-full" color="rgba(212,165,116,0.25)"/>
        </div>
        <div className="md:col-span-7 relative">
          <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4">Adab Thalabul Ilmi</div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink leading-tight mb-5">
            AI sebagai wasilah, bukan pengganti tafahhum.
          </h2>
          <p className="text-ink-muted text-lg leading-relaxed mb-5">
            Setiap panduan MADAD menekankan: AI adalah alat bantu, bukan jalan pintas. Kamu tetap thalibul ilmi yang berpikir dan memahami — AI hanya mempercepat prosesnya.
          </p>
          <div className="flex flex-wrap gap-3">
            {["Bukan tempat minta jawaban ujian", "Bukan pengganti dosen", "Wasilah untuk paham lebih dalam"].map((t,i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs text-ink-muted px-3 py-1.5 rounded-full bg-gold-500/6 border border-gold-500/15">
                <Icon name="check" className="w-3 h-3 text-gold-400" strokeWidth={2.5}/>
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="md:col-span-5 relative">
          <div className="card-glass-strong p-7 text-center">
            <Icon name="quote" className="w-7 h-7 text-gold-400 mx-auto mb-4" strokeWidth={1.4}/>
            <div className="arabic text-2xl text-gold-200 leading-loose mb-3">إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ</div>
            <p className="text-sm text-ink-muted italic">"Sesungguhnya amal itu tergantung niatnya."</p>
            <div className="text-xs text-ink-soft tracking-wider mt-2">HR. Bukhari & Muslim</div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);


/* ================================================================
   PRICING
   ================================================================ */
const PricingSection = ({ onOpenPayment, onOpenLogin }) => (
  <section id="harga" className="section pt-0">
    <div className="container-x">
      <Reveal className="max-w-lg mx-auto">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 flex items-center justify-center gap-2">
            <span className="w-6 h-px bg-gold-500/60"/>Harga<span className="w-6 h-px bg-gold-500/60"/>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.05] mb-3">
            Bayar sekali.<br/>Akses selamanya.
          </h2>
          <p className="text-ink-muted text-lg">Tidak ada langganan. Tidak ada kejutan biaya. Tidak ada expired.</p>
        </div>

        <div className="card-glass-strong p-8 relative overflow-hidden">
          <Blob color="rgba(201,168,106,0.20)" size={320} top={-100} right={-80}/>
          <Blob color="rgba(124,77,255,0.15)" size={260} bottom={-60} left={-60}/>
          <div className="relative">

            {/* Value anchor */}
            <div className="flex items-center justify-center gap-3 mb-6 text-sm text-ink-muted">
              <span className="line-through opacity-60">Rp 150.000</span>
              <span className="px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-300 text-xs border border-gold-500/25 font-medium">Harga Peluncuran</span>
            </div>

            {/* Price */}
            <div className="text-center mb-2">
              <div className="flex items-start justify-center gap-1 leading-none">
                <span className="text-xl text-gold-400 mt-4 font-display">Rp</span>
                <span className="font-display text-[86px] font-semibold text-gold-300 leading-none tracking-tight">49</span>
                <span className="text-xl text-gold-400 mt-4 font-display">.000</span>
              </div>
              <div className="mt-2 text-ink-muted text-sm">Bayar sekali · Akses seumur hidup</div>
            </div>

            {/* Anchor comparison */}
            <div className="text-center mb-7">
              <span className="text-[11px] text-ink-soft italic">
                Setara 2 gelas kopi di Kairo. Berlaku selamanya.
              </span>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
              {[
                { i: "sparkles", t: "Dashboard personal sesuai profil belajarmu" },
                { i: "bookOpen", t: "19 panduan mata pelajaran Al-Azhar" },
                { i: "copy",     t: "Ratusan prompt siap pakai, tinggal ganti topik" },
                { i: "layers",   t: "Muqaranah · Kurasah · Companion Harian" },
                { i: "shield",   t: "Panduan etika & adab penggunaan AI" },
                { i: "refresh",  t: "Update panduan tanpa biaya tambahan" },
              ].map((f,i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-violet-500/15 text-violet-300 flex items-center justify-center flex-shrink-0">
                    <Icon name={f.i} className="w-3.5 h-3.5"/>
                  </span>
                  <span className="text-sm text-ink">{f.t}</span>
                </div>
              ))}
            </div>

            <button onClick={onOpenPayment} className="btn btn-gold w-full text-base py-3.5 shadow-[0_0_30px_rgba(201,168,106,0.25)]">
              <Icon name="sparkles" className="w-4 h-4"/> Gabung Sekarang · Rp49.000
            </button>
            <p className="mt-3 text-[11px] text-ink-soft text-center">Setelah bayar, kode akses langsung dikirim. Tidak ada formulir panjang.</p>
            <button onClick={onOpenLogin} className="mt-3 text-sm text-ink-muted w-full text-center block hover:text-ink transition-colors py-1">
              Sudah punya kode akses? Login di sini →
            </button>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);


/* ================================================================
   FAQ
   ================================================================ */
const FAQS = [
  {
    q: "Apa bedanya MADAD dengan langsung pakai ChatGPT sendiri?",
    a: "ChatGPT gratis dan tersedia untuk semua orang — tapi 90% pengguna memakai prompt generik yang hasilnya juga generik. MADAD kasih prompt yang sudah dikurasi khusus untuk konteks Al-Azhar: cara penyampaian dosen Azhari, terminologi fiqh, gaya makalah akademik Arab, dan skenario ujian syafahi. Perbedaannya seperti punya instruksi memasak vs. tahu bahan-bahan di dapur.",
  },
  {
    q: "Aku sudah bisa pakai AI sendiri. Apakah MADAD masih berguna?",
    a: "Kalau kamu sudah bisa crafting prompt secara mandiri untuk setiap mata pelajaran Azhar spesifik — bisa. Tapi kebanyakan orang yang 'sudah bisa pakai AI' ternyata masih memakai prompt satu kalimat. MADAD menghemat waktu iterasi kamu dan langsung kasih prompt yang sudah diuji untuk skenario Masisir.",
  },
  {
    q: "Apakah ini membantu saya curang di ujian?",
    a: "Tidak, dan bukan itu tujuannya. MADAD adalah alat belajar — bukan alat menyontek. Setiap panduan mendorong kamu untuk memahami materi secara mendalam, bukan mendapatkan jawaban instan. Sama seperti flashcard atau buku rangkuman — alat bantu belajar yang sah.",
  },
  {
    q: "AI apa saja yang digunakan? Apakah saya perlu bayar lagi?",
    a: "MADAD menggunakan Claude (Anthropic), ChatGPT (OpenAI), dan Perplexity — semuanya tersedia dalam versi gratis yang sudah cukup untuk belajar. MADAD tidak menyediakan AI-nya, MADAD kasih panduan cara pakainya. Kamu tidak perlu bayar ke platform AI mana pun untuk memulai.",
  },
  {
    q: "Bagaimana cara mengakses setelah bayar?",
    a: "Setelah pembayaran dikonfirmasi, kamu akan mendapat kode akses unik (format MSR-XXXX-XXXX). Masukkan kode itu di halaman login, dan dashboard personalmu langsung aktif. Tidak ada download, tidak ada install. Akses dari browser, kapan saja.",
  },
  {
    q: "Apakah ada masa berlaku atau akan expired?",
    a: "Tidak ada. Rp49.000 adalah pembayaran satu kali, akses selamanya. Termasuk semua update panduan di masa mendatang tanpa biaya tambahan.",
  },
];

const FaqSection = () => {
  const [open, setOpen] = React.useState(null);
  return (
    <section className="section pt-0">
      <div className="container-x max-w-2xl mx-auto">
        <Reveal className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 flex items-center justify-center gap-2">
            <span className="w-6 h-px bg-gold-500/70"/>Pertanyaan Umum<span className="w-6 h-px bg-gold-500/70"/>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink">
            Masih ada pertanyaan?
          </h2>
        </Reveal>

        <Reveal stagger className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="card-glass overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left">
                <span className="text-sm font-medium text-ink leading-snug">{faq.q}</span>
                <Icon name={open === i ? "chevronUp" : "chevronDown"}
                  className="w-4 h-4 text-ink-muted flex-shrink-0 transition-transform"/>
              </button>
              {open === i && (
                <div className="px-5 pb-5 border-t border-line pt-4">
                  <p className="text-sm text-ink-muted leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
};


/* ================================================================
   JOIN CTA — Final conversion
   ================================================================ */
const JoinCTA = ({ onOpenLogin, onOpenPayment }) => (
  <section id="join" className="section pt-0 pb-24">
    <div className="container-x">
      <div className="rounded-3xl card-glass-strong shadow-glass p-10 md:p-16 relative overflow-hidden">
        <Blob color="rgba(124,77,255,0.50)" size={600} top={-200} right={-100}/>
        <Blob color="rgba(201,168,106,0.28)" size={460} bottom={-120} left={-100}/>
        <div className="absolute inset-0 pattern-stars opacity-30 pointer-events-none"/>

        <div className="relative text-center max-w-2xl mx-auto">
          <div className="arabic text-2xl text-gold-300 mb-4">رَبِّ زِدْنِي عِلْمًا</div>

          <h3 className="font-display text-3xl md:text-5xl font-semibold leading-tight gradient-text mb-5">
            Belajar lebih cerdas di Al-Azhar, mulai hari ini.
          </h3>

          <p className="text-ink-muted text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            Ribuan Masisir berjuang dengan maqarrar yang sama, AI yang sama, tapi cara yang berbeda.
            Rp49.000 untuk cara yang lebih baik — sekali bayar, selamanya.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <button onClick={onOpenPayment}
              className="btn btn-gold text-base px-9 py-4 shadow-[0_0_40px_rgba(201,168,106,0.35)] text-lg">
              <Icon name="sparkles" className="w-5 h-5"/> Gabung Sekarang · Rp49.000
            </button>
            <button onClick={onOpenLogin}
              className="btn btn-ghost text-base px-7 py-4">
              <Icon name="user" className="w-4 h-4"/> Sudah punya kode?
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid sm:grid-cols-3 gap-4 max-w-md mx-auto pt-8 border-t border-line">
            {[
              { i: "check", t: "Bayar sekali, selamanya" },
              { i: "shield", t: "Tanpa biaya bulanan" },
              { i: "sparkles", t: "19 panduan langsung aktif" },
            ].map((c,i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-ink-muted justify-center">
                <Icon name={c.i} className="w-3.5 h-3.5 text-gold-400" strokeWidth={2.4}/>
                {c.t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

window.LandingPage = LandingPage;
