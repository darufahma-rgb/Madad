/* Madad, Public landing page */

const LandingPage = ({ onOpenLogin, onOpenPayment }) => {
  return (
    <div className="page-enter">
      <Hero onOpenLogin={onOpenLogin} onOpenPayment={onOpenPayment}/>
      <MataPelajaranSection onOpenPayment={onOpenPayment}/>
      <BantuanSection/>
      <ToolsPreview/>
      <PromptPreview/>
      <FeaturesShowcase onOpenPayment={onOpenPayment}/>
      <EthicsTeaser/>
      <PricingSection onOpenPayment={onOpenPayment} onOpenLogin={onOpenLogin}/>
      <JoinCTA onOpenLogin={onOpenLogin} onOpenPayment={onOpenPayment}/>
    </div>
  );
};

/* ---------------- HERO ---------------- */
const Hero = ({ onOpenLogin, onOpenPayment }) => (
  <section className="relative overflow-hidden pt-12 md:pt-20 pb-20 md:pb-28">
    <Blob color="rgba(124,77,255,0.35)" size={650} top={-200} right={-100}/>
    <Blob color="rgba(201,168,106,0.15)" size={500} top={220} left={-150}/>
    <div className="absolute top-0 right-0 w-[60%] h-[120%] opacity-20 pointer-events-none">
      <Arch className="w-full h-full" color="rgba(212,165,116,0.18)"/>
    </div>
    <div className="absolute inset-0 pattern-stars opacity-50 pointer-events-none"/>

    <div className="container-x relative">
      <div className="grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full chip-glass text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 shadow-[0_0_8px_rgba(201,168,106,0.9)]"/>
              <span className="text-ink-muted">Konsultan Belajar AI · </span>
              <span className="arabic text-gold-300 text-sm">لطلاب الأزهر الإندونيسيين</span>
            </div>
          </Reveal>

          <WordReveal
            as="h1"
            text="Konsultan belajarmu di Al-Azhar, untuk setiap mata pelajaran."
            className="mt-6 font-display text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-semibold text-ink leading-[1.0] tracking-tightest"
          />

          <Reveal delay={300}>
            <p className="mt-6 text-lg md:text-xl text-ink-muted leading-relaxed max-w-2xl">
              MADAD tidak menyediakan AI-nya — MADAD memberi <em className="text-ink not-italic">panduan cara pakainya</em> untuk setiap mata pelajaran Al-Azharmu.
              Fiqh, Hadith, Ushul, Nahwu, Tafsir — buka Claude, pakai prompt ini, pahami lebih dalam.
            </p>
          </Reveal>

          <Reveal delay={500}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button onClick={onOpenPayment} className="btn btn-primary text-base px-7 py-3.5">
                <Icon name="sparkles" className="w-4 h-4"/> Gabung Member
              </button>
              <a href="#mata-pelajaran" onClick={(e)=>{e.preventDefault(); const el = document.getElementById("mata-pelajaran"); if (el) el.scrollIntoView({behavior:"smooth"});}} className="btn btn-ghost text-base px-6 py-3.5">
                <Icon name="arrowDown" className="w-4 h-4"/> Lihat Mata Pelajaran
              </a>
              <button onClick={onOpenLogin} className="text-sm text-ink-muted hover:text-ink ml-1 underline underline-offset-4">
                Sudah punya kode?
              </button>
            </div>
          </Reveal>

          <Reveal delay={650}>
            <div className="mt-12 flex items-center gap-8">
              <div className="text-center">
                <div className="font-display text-4xl text-gold-400 font-semibold num leading-none">10+</div>
                <div className="text-[11px] text-ink-soft uppercase tracking-wider mt-1.5">Mata Pelajaran</div>
              </div>
              <div className="w-px h-8 bg-line"/>
              <div className="text-center">
                <div className="font-display text-4xl text-gold-400 font-semibold num leading-none">6</div>
                <div className="text-[11px] text-ink-soft uppercase tracking-wider mt-1.5">AI Tools</div>
              </div>
              <div className="w-px h-8 bg-line"/>
              <div className="text-center">
                <div className="font-display text-4xl text-gold-400 font-semibold num leading-none">36</div>
                <div className="text-[11px] text-ink-soft uppercase tracking-wider mt-1.5">Adaptive Guides</div>
              </div>
            </div>
          </Reveal>
        </div>

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

/* Hero composition: stylized dashboard preview */
const HeroComposition = () => (
  <div className="relative h-[480px]">
    {/* Dashboard glass card */}
    <div className="absolute inset-x-0 top-4 card-glass-strong p-6 shadow-glass" style={{transform: "perspective(900px) rotateY(-4deg) rotateX(2deg)"}}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <LogoMark size={28}/>
          <span className="font-display text-sm text-ink font-medium">Madad</span>
        </div>
        <span className="chip chip-violet text-[10px]">🌙 Member</span>
      </div>
      <div className="arabic text-right text-lg text-gold-300 mb-4">السلام عليكم يا أحمد</div>
      <div className="text-xs uppercase tracking-wider text-ink-muted mb-3">AI rekomendasi untukmu</div>
      <div className="space-y-2">
        {[
          { n: "Claude", c: "#D97757", r: "Untuk bedah kitab klasik" },
          { n: "ChatGPT", c: "#10A37F", r: "Untuk diskusi bertahap" },
          { n: "Perplexity", c: "#1FB6B6", r: "Untuk riset referensi" },
        ].map((t, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/4 border border-line">
            <span className="w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-mono font-bold text-white" style={{background: t.c}}>{t.n.slice(0,2)}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-ink">{t.n}</div>
              <div className="text-[11px] text-ink-muted truncate">{t.r}</div>
            </div>
            <Icon name="arrowRight" className="w-3.5 h-3.5 text-ink-soft"/>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-line">
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-muted">Progress · Bertumbuh</span>
          <span className="text-gold-400 font-medium num">42%</span>
        </div>
        <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-gold-500" style={{width: "42%"}}/>
        </div>
      </div>
    </div>
    {/* Floating member code chip */}
    <div className="absolute bottom-4 -left-4 card-glass p-3.5 shadow-glow" style={{transform: "rotate(-5deg)"}}>
      <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-1">Kode Akses</div>
      <div className="font-mono text-base text-gold-300 tracking-widest">MSR-H82M-X4ZT</div>
    </div>
  </div>
);

/* ---------------- MATA PELAJARAN AL-AZHAR ---------------- */
const MataPelajaranSection = ({ onOpenPayment }) => {
  const MAPEL = [
    { subject: "Fiqh", arabic: "الفِقْهُ", ai: "Claude", aiColor: "#D97757", tip: "Bedah qoul, wajh istidlal, tarjih antar mazhab", icon: "layers" },
    { subject: "Ushul Fiqh", arabic: "أُصُولُ الفِقْهِ", ai: "ChatGPT", aiColor: "#10A37F", tip: "Drill kaidah, diskusi istidlal bertahap", icon: "bookOpen" },
    { subject: "Hadith & Musthalah", arabic: "الحَدِيثُ", ai: "Perplexity", aiColor: "#1FB6B6", tip: "Takhrij, telusur sanad, klasifikasi hadith", icon: "search" },
    { subject: "Tafsir & Ulum Al-Quran", arabic: "التَّفْسِيرُ", ai: "Claude", aiColor: "#D97757", tip: "Analisis tafsir mendalam, perbandingan mufassir", icon: "quote" },
    { subject: "Nahwu & Sharaf", arabic: "النَّحْوُ وَالصَّرْفُ", ai: "ChatGPT", aiColor: "#10A37F", tip: "Drill i'rab, soal sharaf, koreksi interaktif", icon: "pen" },
    { subject: "Aqidah & Kalam", arabic: "العَقِيدَةُ", ai: "Claude", aiColor: "#D97757", tip: "Bedah argumen, klasifikasi aliran, analisis tekstual", icon: "shield" },
    { subject: "Balaghah", arabic: "البَلَاغَةُ", ai: "Claude", aiColor: "#D97757", tip: "Analisis uslub, identifikasi majas, latihan taste", icon: "sparkles" },
    { subject: "Makalah Azhari", arabic: "البَحْثُ العِلْمِيُّ", ai: "ChatGPT", aiColor: "#10A37F", tip: "Outline, drafting, editing — gaya penulisan Azhari", icon: "clipboard" },
    { subject: "Riset & Referensi", arabic: "البَحْثُ وَالمَصَادِرُ", ai: "Perplexity", aiColor: "#1FB6B6", tip: "Cari sumber tertelusur, buku klasik, artikel akademik", icon: "compass" },
    { subject: "Hafalan Matan & Quran", arabic: "التَّحْفِيظُ", ai: "ChatGPT", aiColor: "#10A37F", tip: "Sesi tasmi' interaktif, murajaah, spaced repetition", icon: "refresh" },
  ];

  return (
    <section id="mata-pelajaran" className="section">
      <div className="container-x">
        <Reveal className="mb-12">
          <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 flex items-center gap-2">
            <span className="w-6 h-px bg-gold-500/70"/>Konsultasi per Mata Pelajaran
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.05] max-w-2xl">
              Setiap mata pelajaran, ada AI dan strategi yang tepat.
            </h2>
            <p className="text-ink-muted text-base max-w-sm md:text-right leading-relaxed">
              MADAD tidak bilang "pakai ChatGPT". MADAD bilang <em className="text-ink not-italic">bagaimana</em> pakai ChatGPT untuk Nahwu — dan kenapa Claude lebih baik untuk Fiqh.
            </p>
          </div>
        </Reveal>

        <Reveal stagger className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
          {MAPEL.map((m) => (
            <div key={m.subject} className="card-glass p-5 hov-lift flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="w-9 h-9 rounded-lg bg-violet-500/12 text-violet-300 flex items-center justify-center flex-shrink-0">
                  <Icon name={m.icon} className="w-4 h-4"/>
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border"
                  style={{background: m.aiColor + "18", color: m.aiColor, borderColor: m.aiColor + "35"}}>
                  {m.ai}
                </span>
              </div>
              <div>
                <div className="font-display text-base font-semibold text-ink leading-tight">{m.subject}</div>
                <div className="arabic text-xs text-gold-300/70 mt-0.5">{m.arabic}</div>
              </div>
              <p className="text-[12px] text-ink-muted leading-relaxed mt-auto">{m.tip}</p>
            </div>
          ))}
        </Reveal>

        <Reveal>
          <div className="card-glass p-6 md:p-8 border-gold-500/15 bg-gold-500/3 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <div className="text-sm font-semibold text-ink mb-1">Ini baru gambaran umum.</div>
              <p className="text-sm text-ink-muted leading-relaxed">Setelah onboarding, MADAD akan tahu persis kamu di bidang apa dan belajar dengan cara seperti apa — lalu kasih panduan spesifik: prompt, langkah, dan strategi per mata pelajaranmu.</p>
            </div>
            <button onClick={onOpenPayment} className="btn btn-primary text-sm px-6 py-3 flex-shrink-0">
              <Icon name="sparkles" className="w-4 h-4"/> Mulai Konsultasi
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ---------------- BANTUAN ---------------- */
const BantuanSection = () => (
  <section id="preview" className="section">
    <div className="container-x">
      <Reveal className="text-center max-w-2xl mx-auto mb-14">
        <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 flex items-center justify-center gap-2">
          <span className="w-6 h-px bg-gold-500/70"/>Apa yang bisa dibantu?<span className="w-6 h-px bg-gold-500/70"/>
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.05]">
          Kita semua pernah di sini. Tahu alat AI-nya, tapi bingung <em className="text-gold-300 not-italic">cara pakainya</em>.
        </h2>
        <p className="mt-4 text-ink-muted text-lg max-w-xl mx-auto">Lima tantangan akademik Masisir yang paling sering muncul.</p>
      </Reveal>
      <Reveal stagger className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {STRUGGLES.map((s) => (
          <div key={s.id} className="card-glass p-6 hov-lift">
            <div className="w-11 h-11 rounded-lg bg-violet-500/15 text-violet-300 flex items-center justify-center mb-4">
              <Icon name={s.icon} className="w-5 h-5"/>
            </div>
            <h3 className="font-display text-xl font-semibold text-ink mb-2">{s.label}</h3>
            <p className="text-sm text-ink-muted leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </Reveal>
    </div>
  </section>
);

/* ---------------- TOOLS PREVIEW ---------------- */
const ToolsPreview = () => (
  <section id="tools" className="section pt-0">
    <div className="container-x">
      <Reveal className="mb-12 flex items-end justify-between flex-wrap gap-6">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 flex items-center gap-2">
            <span className="w-6 h-px bg-gold-500/70"/>AI Tools
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.05] max-w-2xl">
            Enam AI terbaik, dipilih untuk kebutuhan Masisir.
          </h2>
        </div>
        <span className="chip chip-glass text-[11px]">✨ Setiap tool punya guide berbeda per gaya belajar</span>
      </Reveal>
      <Reveal stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AI_TOOLS.map((tool) => (
          <div key={tool.id} className="card-glass p-6 hov-lift">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <ToolIcon tool={tool} size="w-11 h-11"/>
                <div>
                  <div className="font-display text-lg font-semibold text-ink">{tool.name}</div>
                  <div className="text-[11px] text-ink-soft">{tool.by}</div>
                </div>
              </div>
              <span className="chip chip-glass text-[10px]">{tool.tier}</span>
            </div>
            <p className="text-sm text-ink-muted leading-relaxed mb-4 clamp-3">{tool.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {tool.bestAt.map((b, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-ink-muted border border-line">{b}</span>
              ))}
            </div>
          </div>
        ))}
      </Reveal>
    </div>
  </section>
);

/* ---------------- PROMPT PREVIEW (free teaser) ---------------- */
const PromptPreview = () => {
  const chatgpt = AI_TOOLS.find(t => t.id === "chatgpt");
  return (
    <section id="cara-kerja" className="section pt-0">
      <div className="container-x">

        {/* Section header */}
        <Reveal className="mb-10">
          <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 flex items-center gap-2">
            <span className="w-6 h-px bg-gold-500/70"/>Adaptive Tool Guides
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.05] max-w-3xl">
            AI yang sama. Guide yang <em className="text-gold-300 not-italic">berbeda</em> untuk tiap cara belajar.
          </h2>
          <p className="mt-4 text-ink-muted text-lg max-w-2xl">
            ChatGPT untuk diskusi ≠ ChatGPT untuk hafalan. Setelah onboarding, kamu langsung dapat workflow dan starter prompt yang sesuai caramu, bukan tutorial copy-paste.
          </p>
        </Reveal>

        {/* Before / After comparison callout */}
        <Reveal className="mb-10">
          <div className="grid md:grid-cols-2 gap-3 max-w-3xl">
            <div className="p-4 rounded-xl bg-white/3 border border-white/8">
              <div className="text-[10px] uppercase tracking-wider text-ink-soft mb-2 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/40 flex-shrink-0"/>
                Tanpa MADAD
              </div>
              <div className="font-mono text-xs text-ink-muted leading-relaxed">"Tolong jelaskan konsep qiyas dalam ushul fiqh."</div>
              <div className="text-[11px] text-ink-soft mt-2 italic">→ Penjelasan generik yang sama untuk semua orang.</div>
            </div>
            <div className="p-4 rounded-xl bg-violet-500/6 border border-violet-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 opacity-30 pointer-events-none" style={{background:"radial-gradient(circle at top right,rgba(124,77,255,0.6),transparent 70%)"}}/>
              <div className="text-[10px] uppercase tracking-wider text-violet-300 mb-2 flex items-center gap-1.5 relative">
                <span className="w-3 h-3 rounded-full bg-violet-400/50 border border-violet-400/60 flex-shrink-0"/>
                Dengan MADAD · gaya Diskusi
              </div>
              <div className="font-mono text-xs text-violet-100/80 leading-relaxed relative">"Berperanlah sebagai tutor Azhari. Aku mau paham qiyas, tanya dulu apa yang sudah aku tahu, lalu bimbing dengan pertanyaan bertahap..."</div>
              <div className="text-[11px] text-violet-300/70 mt-2 italic relative">→ Dialog bertahap, temuan mandiri, ingatan lebih kuat.</div>
            </div>
          </div>
        </Reveal>
        <Reveal stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LEARNING_STYLES.map((style) => {
            const guide = chatgpt && chatgpt.guides && chatgpt.guides[style.id];
            return (
              <div key={style.id} className="card-glass p-5 hov-lift">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-2xl">{style.emoji}</span>
                  <div>
                    <div className="font-display text-base font-semibold text-ink">{style.label}</div>
                    <div className="text-[11px] text-ink-soft">{style.desc}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mb-3">
                  <ToolIcon tool={chatgpt} size="w-5 h-5" rounded="rounded-md"/>
                  <div className="text-[11px] uppercase tracking-wider text-gold-400">ChatGPT · Cara Mulai</div>
                </div>
                {guide ? (
                  <ol className="text-sm text-ink-muted leading-relaxed space-y-1.5 list-decimal pl-4 mb-4">
                    {guide.steps.slice(0, 3).map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                ) : (
                  <ol className="text-sm text-ink-muted leading-relaxed space-y-1.5 list-decimal pl-4 mb-4">
                    <li>Buka ChatGPT, mulai dengan konteks "saya mahasiswa Azhar..."</li>
                    <li>Pakai pendekatan {style.label.toLowerCase()} sebagai gaya percakapan.</li>
                    <li>Tutup sesi dengan minta ringkasan 5 poin.</li>
                  </ol>
                )}
                {guide && (
                  <div className="mt-auto pt-3 border-t border-line">
                    <div className="font-mono text-[10.5px] text-violet-200/75 leading-relaxed line-clamp-2">"{guide.starterPrompt.slice(0, 100)}..."</div>
                  </div>
                )}
              </div>
            );
          })}
        </Reveal>
        <Reveal className="mt-10">
          <div className="card-glass p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 border-gold-500/15 bg-gold-500/3">
            <div className="flex-1">
              <div className="text-sm font-semibold text-ink mb-1">Ini baru ChatGPT, satu dari enam AI.</div>
              <p className="text-sm text-ink-muted leading-relaxed">Di dalam dashboard, kamu punya 36 adaptive guide: setiap AI dikombinasikan dengan setiap gaya belajar. Semua starter prompt siap pakai, tinggal masukkan topikmu.</p>
            </div>
            <div className="text-center flex-shrink-0">
              <div className="font-display text-5xl font-semibold text-gold-300 leading-none">36</div>
              <div className="text-xs text-ink-muted uppercase tracking-wider mt-1">total guides</div>
              <div className="text-[11px] text-ink-soft mt-0.5">6 AI × 6 gaya belajar</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ---------------- ADAPTIVE TEASER ---------------- */
const AdaptiveTeaser = () => (
  <section className="section pt-0">
    <div className="container-x">
      <div className="card-glass-strong p-10 md:p-14 relative overflow-hidden">
        <Blob color="rgba(201,168,106,0.22)" size={400} top={-100} right={-100}/>
        <Blob color="rgba(124,77,255,0.28)" size={320} bottom={-50} left={-50}/>
        <div className="relative grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7">
            <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4">Adaptive Engine</div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink leading-tight mb-5">
              Same AI, different guide, sesuai gaya belajarmu.
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed max-w-xl mb-6">
              ChatGPT untuk pendiskusi ≠ ChatGPT untuk penghafal. Setelah onboarding singkat,
              kamu langsung dapat panduan yang relevan untuk caramu belajar.
            </p>
            <div className="grid grid-cols-3 gap-3 max-w-md">
              {[
                { l: "Diskusi", c: "violet" },
                { l: "Hafalan", c: "gold" },
                { l: "Visual", c: "violet" },
              ].map((c, i) => (
                <div key={i} className={`p-3 rounded-lg border ${c.c === "gold" ? "bg-gold-500/8 border-gold-500/25" : "bg-violet-500/8 border-violet-500/25"}`}>
                  <div className={`text-xs uppercase tracking-wider ${c.c === "gold" ? "text-gold-300" : "text-violet-300"}`}>ChatGPT</div>
                  <div className="text-sm text-ink mt-0.5 font-medium">{c.l} mode</div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="relative">
              <div className="absolute inset-x-0 top-0 card-glass p-4 shadow-glass" style={{transform:"rotate(-2deg) translateY(0)"}}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-md bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center">GPT</span>
                  <span className="text-xs text-ink-muted">→ Diskusi</span>
                </div>
                <p className="font-mono text-xs text-ink-muted leading-relaxed clamp-3">"Jangan beri jawaban langsung, tanyakan dulu apa yang sudah aku tahu..."</p>
              </div>
              <div className="absolute inset-x-0 top-24 card-glass p-4 shadow-glow" style={{transform:"rotate(1deg)"}}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-md bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center">GPT</span>
                  <span className="text-xs text-ink-muted">→ Hafalan</span>
                </div>
                <p className="font-mono text-xs text-ink-muted leading-relaxed clamp-3">"Sesi tasmi', sebut potongan ayat, aku lanjutkan. Beri 3 huruf petunjuk jika ragu..."</p>
              </div>
              <div className="absolute inset-x-0 top-48 card-glass p-4 shadow-glass" style={{transform:"rotate(-1deg)"}}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-md bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center">GPT</span>
                  <span className="text-xs text-ink-muted">→ Visual</span>
                </div>
                <p className="font-mono text-xs text-ink-muted leading-relaxed clamp-3">"Buatkan peta konsep berjenjang: akar → cabang → daun..."</p>
              </div>
              <div className="h-72"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ---------------- FEATURES SHOWCASE ---------------- */
const FeaturesShowcase = ({ onOpenPayment }) => (
  <section className="section pt-0">
    <div className="container-x">
      <Reveal className="text-center max-w-2xl mx-auto mb-14">
        <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 flex items-center justify-center gap-2">
          <span className="w-6 h-px bg-gold-500/70"/>Yang Membedakan MADAD<span className="w-6 h-px bg-gold-500/70"/>
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.05]">
          Bukan hanya guide. <em className="text-gold-300 not-italic">Ekosistem belajar</em> yang lengkap.
        </h2>
        <p className="mt-4 text-ink-muted text-lg max-w-xl mx-auto">Tiga fitur yang tidak ada di tempat lain — dirancang khusus untuk cara belajar thalibul ilmi.</p>
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
              Bandingkan pendapat ulama lintas mazhab secara terstruktur. Dilengkapi dalil Al-Quran, wajh istidlal, dan sumber kitab — bukan sekadar poin-poin.
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
            <div className="text-[11px] uppercase tracking-wider text-violet-300 mb-1">Kurasah</div>
            <h3 className="font-display text-xl font-semibold text-ink mb-3">Catatan Pribadi Thalibul Ilmi</h3>
            <p className="text-sm text-ink-muted leading-relaxed mb-5 flex-1">
              Catatan digital yang mendukung Markdown, teks Arab, dan shortcode seperti <span className="font-mono text-violet-200/80 text-xs">:bismillah:</span> — untuk mencatat ilmu seperti yang ulama ajarkan: قَيِّدُوا الْعِلْمَ بِالْكِتَابَةِ.
            </p>
            <div className="card-glass p-4 rounded-xl font-mono text-xs text-ink-muted leading-relaxed space-y-1">
              <div><span className="text-violet-300">## </span><span className="text-ink">Ringkasan Dars Ushul</span></div>
              <div className="text-gold-200/70 text-right" style={{direction:"rtl",fontFamily:"Noto Naskh Arabic,serif"}}>الأَمْرُ يَقْتَضِي الوُجُوبَ</div>
              <div><span className="text-violet-300">**</span>Wajh istidlal:<span className="text-violet-300">**</span> ...</div>
              <div className="text-ink-soft">→ Export Markdown</div>
            </div>
          </div>
        </div>

        {/* Companion Harian */}
        <div className="card-glass-strong p-6 hov-lift relative overflow-hidden flex flex-col">
          <Blob color="rgba(124,77,255,0.14)" size={200} bottom={-60} right={-60}/>
          <div className="relative flex-1 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-300 flex items-center justify-center mb-4">
              <Icon name="sparkles" className="w-5 h-5"/>
            </div>
            <div className="text-[11px] uppercase tracking-wider text-violet-300 mb-1">Companion Harian</div>
            <h3 className="font-display text-xl font-semibold text-ink mb-3">Niat, Ritme & Refleksi</h3>
            <p className="text-sm text-ink-muted leading-relaxed mb-5 flex-1">
              Setiap hari diawali niat yang diniatkan, bukan sekadar to-do list. Ritme belajar dicatat, bukan di-streak. Refleksi diakhiri dengan muhasabah.
            </p>
            <div className="card-glass p-4 rounded-xl space-y-3">
              {[
                { label: "Niat Hari Ini", arabic: "نَوَيْتُ طَلَبَ الْعِلْمِ لِلَّهِ", color: "gold" },
                { label: "Ritme Belajar", val: "Hadir hari ini", color: "violet" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-ink-muted">{item.label}</span>
                  {item.arabic
                    ? <span className="arabic text-xs text-gold-300">{item.arabic}</span>
                    : <span className={`text-[10px] px-2 py-0.5 rounded border ${item.color === "violet" ? "bg-violet-500/10 text-violet-300 border-violet-500/20" : "bg-gold-500/10 text-gold-300 border-gold-500/20"}`}>{item.val}</span>
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

/* ---------------- ETHICS TEASER ---------------- */
const EthicsTeaser = () => (
  <section className="section pt-0">
    <div className="container-x">
      <Reveal className="grid md:grid-cols-12 gap-8 items-center card-glass p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-full w-1/2 opacity-20 pointer-events-none">
          <Arch className="w-full h-full" color="rgba(212,165,116,0.25)"/>
        </div>
        <div className="md:col-span-7 relative">
          <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4">Adab Thalabul Ilmi</div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink leading-tight mb-5">
            AI yang dipakai dengan adab, bukan menggantikan tafahhum.
          </h2>
          <p className="text-ink-muted text-lg leading-relaxed mb-5">
            Setiap rekomendasi & guide kami menekankan: AI adalah wasilah, bukan tujuan.
            Kamu tetap thalibul ilmi, AI cuma alat untuk lebih dalam, bukan lebih malas.
          </p>
          <a href="#/ethics" onClick={(e)=>{e.preventDefault(); navigate("/ethics");}} className="btn btn-ghost">
            Baca Etika & Adab <Icon name="arrowRight" className="w-4 h-4"/>
          </a>
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

/* ---------------- JOIN CTA ---------------- */
const JoinCTA = ({ onOpenLogin, onOpenPayment }) => (
  <section id="join" className="section pt-0">
    <div className="container-x">
      <div className="rounded-3xl card-glass-strong shadow-glass p-10 md:p-16 relative overflow-hidden">
        <Blob color="rgba(124,77,255,0.45)" size={550} top={-200} right={-100}/>
        <Blob color="rgba(201,168,106,0.25)" size={420} bottom={-100} left={-100}/>
        <div className="relative text-center max-w-2xl mx-auto">
          <div className="arabic text-2xl text-gold-300 mb-4">رَبِّ زِدْنِي عِلْمًا</div>
          <h3 className="font-display text-3xl md:text-5xl font-semibold leading-tight gradient-text mb-4">
            Jadilah thalibul ilmi yang belajar dengan cerdas.
          </h3>
          <p className="text-ink-muted text-lg leading-relaxed mb-2">
            3 pertanyaan onboarding. Dashboard personal langsung aktif.
            AI terbaik, guide yang tepat, path yang terstruktur, semuanya untukmu.
          </p>
          <p className="text-ink-soft text-sm mb-8">
            Jawab 3 pertanyaan → rekomendasi otomatis → mulai belajar hari ini.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <button onClick={onOpenPayment} className="btn btn-gold text-base px-8 py-3.5">
              <Icon name="sparkles" className="w-4 h-4"/> Gabung Sekarang · Rp49.000
            </button>
            <button onClick={onOpenLogin} className="btn btn-ghost text-base px-6 py-3.5">
              <Icon name="user" className="w-4 h-4"/> Sudah punya kode?
            </button>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 max-w-md mx-auto pt-6 border-t border-line">
            {[
              { i: "check", t: "Rp49.000 · sekali selamanya" },
              { i: "check", t: "Dashboard personal otomatis" },
              { i: "check", t: "36 adaptive guide + path" },
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-ink-muted justify-center sm:justify-start">
                <Icon name={c.i} className="w-3.5 h-3.5 text-gold-400" strokeWidth={2.4}/> {c.t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ---------------- PRICING SECTION ---------------- */
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
          <p className="text-ink-muted text-lg">Tidak ada langganan. Tidak ada kejutan biaya.</p>
        </div>

        <div className="card-glass-strong p-8 relative overflow-hidden">
          <Blob color="rgba(201,168,106,0.18)" size={320} top={-100} right={-80}/>
          <Blob color="rgba(124,77,255,0.15)" size={260} bottom={-60} left={-60}/>
          <div className="relative">
            <div className="text-center mb-8">
              <div className="flex items-start justify-center gap-1 leading-none">
                <span className="text-xl text-gold-400 mt-4 font-display">Rp</span>
                <span className="font-display text-[86px] font-semibold text-gold-300 leading-none tracking-tight">49</span>
                <span className="text-xl text-gold-400 mt-4 font-display">.000</span>
              </div>
              <div className="mt-2 text-ink-muted text-sm">Bayar sekali · Akses seumur hidup</div>
              <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/8 border border-gold-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400"/>
                <span className="text-xs text-gold-300">Tidak ada biaya bulanan · Tidak ada perpanjangan</span>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {[
                { i: "sparkles", t: "Dashboard personal sesuai profil belajarmu" },
                { i: "cpu",      t: "6 AI tools terkurasi, ChatGPT, Claude, Gemini & lebih" },
                { i: "bookOpen", t: "36 adaptive guide: 6 AI × 6 gaya belajar" },
                { i: "layers",   t: "3 learning path terstruktur Beginner → Advanced" },
                { i: "shield",   t: "Panduan etika & adab penggunaan AI untuk Masisir" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-violet-500/15 text-violet-300 flex items-center justify-center flex-shrink-0">
                    <Icon name={f.i} className="w-3.5 h-3.5"/>
                  </span>
                  <span className="text-sm text-ink">{f.t}</span>
                </div>
              ))}
            </div>

            <button onClick={onOpenPayment} className="btn btn-gold w-full text-base py-3.5">
              <Icon name="sparkles" className="w-4 h-4"/> Gabung Sekarang · Rp49.000
            </button>
            <button onClick={onOpenLogin} className="mt-3 text-sm text-ink-muted w-full text-center block hover:text-ink transition-colors py-1">
              Sudah punya kode akses? Login di sini →
            </button>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

window.LandingPage = LandingPage;
