/* Madad — Landing page (reworked, ringkas) */

const LandingPage = ({ onOpenLogin, onOpenPayment }) => (
  <div className="page-enter">
    <HeroNew onOpenLogin={onOpenLogin} onOpenPayment={onOpenPayment}/>
    <MasisirShowcase/>
    <ThreeSteps/>
    <PricingMini onOpenPayment={onOpenPayment}/>
    <FinalCTA onOpenPayment={onOpenPayment}/>
  </div>
);

/* ── 1. HERO ─────────────────────────────────────────────────── */
const HeroNew = ({ onOpenLogin, onOpenPayment }) => (
  <section className="relative overflow-hidden pt-12 md:pt-20 pb-20 md:pb-28">
    <Blob color="rgba(124,77,255,0.38)" size={700} top={-220} right={-120}/>
    <Blob color="rgba(201,168,106,0.16)" size={540} top={260} left={-180}/>
    <div className="absolute inset-0 pattern-stars opacity-40 pointer-events-none"/>
    <div className="container-x relative">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

        {/* Kolom kiri — teks */}
        <div>
          <Reveal>
            <div className="chip chip-glass text-xs mb-6 inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse"/>
              MADAD · Untuk Masisir Al-Azhar
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-display text-5xl sm:text-6xl md:text-[72px] font-semibold text-ink leading-[1.0] tracking-tightest">
              Belajar materi Azhar, jadi lebih ringan.
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-6 text-lg text-ink-muted leading-relaxed max-w-lg">
              Panduan AI khusus untuk thalib Azhari — dari Nahwu, Tafsir, Fiqh, sampai Mustholah Hadits.
            </p>
          </Reveal>
          <Reveal delay={340}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button onClick={onOpenPayment} className="btn btn-gold text-base px-7 py-3.5">
                <Icon name="sparkles" className="w-4 h-4"/> Gabung Member
              </button>
              <button onClick={onOpenLogin}
                className="text-sm text-ink-muted hover:text-ink transition-colors underline underline-offset-4">
                Sudah punya kode? Login →
              </button>
            </div>
          </Reveal>
        </div>

        {/* Kolom kanan — feature cards */}
        <div className="hidden lg:flex flex-col gap-3">
          <Reveal delay={300}>
            {[
              { icon: "sparkles", title: "Guide per gaya belajar", hint: "Tiap AI dipakai beda untuk Nahwu, Tafsir, atau Fiqh — sesuai caramu." },
              { icon: "layers",   title: "Muqaranah qoul ulama",   hint: "Pendapat 4 madzhab side-by-side dengan dalil dan wajh istidlal." },
              { icon: "book",     title: "Kurasah pribadi",         hint: "Catatan, talkhish, dan ta'liq — semua dalam satu tempat." },
            ].map((c, i) => (
              <div key={i} className="card-glass p-4 flex items-start gap-4 hov-lift">
                <div className="w-9 h-9 rounded-lg bg-gold-500/12 text-gold-300 flex items-center justify-center flex-shrink-0">
                  <Icon name={c.icon} className="w-4 h-4"/>
                </div>
                <div>
                  <div className="font-display text-base font-semibold text-ink">{c.title}</div>
                  <div className="text-sm text-ink-muted mt-0.5">{c.hint}</div>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </div>
    <div className="divider-arabesque mt-4"/>
  </section>
);

/* ── 2. MASISIR SHOWCASE ─────────────────────────────────────── */
const MasisirShowcase = () => (
  <section className="section">
    <div className="container-x">
      <Reveal className="text-center mb-10">
        <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-3">— Dirancang untuk Thalib Azhari</div>
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.05]">
          Untukmu yang belajar di Mesir.
        </h2>
      </Reveal>
      <Reveal stagger className="grid md:grid-cols-3 gap-5 mb-10">
        {[
          { icon: "sparkles", title: "Guide per gaya belajar", body: "Tiap AI dipakai beda untuk Nahwu, Tafsir, atau Fiqh — sesuai caramu." },
          { icon: "layers",   title: "Muqaranah qoul ulama",   body: "Pendapat 4 madzhab side-by-side dengan dalil dan wajh istidlal." },
          { icon: "book",     title: "Kurasah pribadi",         body: "Catatan, talkhish, dan ta'liq — semua dalam satu tempat." },
        ].map((c, i) => (
          <div key={i} className="card-glass p-7 hov-lift">
            <div className="w-10 h-10 rounded-xl bg-gold-500/12 text-gold-300 flex items-center justify-center mb-4">
              <Icon name={c.icon} className="w-5 h-5"/>
            </div>
            <div className="font-display text-xl font-semibold text-ink mb-2">{c.title}</div>
            <div className="text-sm text-ink-muted leading-relaxed">{c.body}</div>
          </div>
        ))}
      </Reveal>
      <Reveal className="text-center">
        <div className="text-xs text-ink-soft mb-4">Mengintegrasikan AI yang sudah kamu kenal</div>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {["Claude", "ChatGPT", "Gemini", "NotebookLM", "Perplexity", "DeepSeek"].map((n) => (
            <span key={n} className="text-sm font-mono text-ink-muted opacity-50 hover:opacity-100 transition-opacity">{n}</span>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
);

/* ── 3. THREE STEPS ──────────────────────────────────────────── */
const ThreeSteps = () => (
  <section className="section pt-0">
    <div className="container-x">
      <Reveal className="text-center mb-10">
        <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-3">— Bagaimana cara kerjanya</div>
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink">Tiga langkah, sudah jalan.</h2>
      </Reveal>
      <Reveal className="grid md:grid-cols-3 gap-6">
        {[
          { num: "01", title: "Pilih fakultas & gaya belajarmu", body: "Onboarding 4 pertanyaan singkat." },
          { num: "02", title: "Dapat rekomendasi AI personal",   body: "MADAD pilihkan tool & guide yang cocok." },
          { num: "03", title: "Mulai belajar dengan tenang",     body: "Companion harian, muqaranah, kurasah — semua siap." },
        ].map((s, i) => (
          <div key={i} className="card-glass p-7 hov-lift relative">
            {i < 2 && (
              <div className="hidden md:block absolute top-10 -right-3 w-6 h-px z-10"
                style={{background:"linear-gradient(to right,rgba(201,168,106,0.5),transparent)"}}/>
            )}
            <div className="font-display text-5xl font-semibold gradient-text leading-none mb-4">{s.num}</div>
            <div className="font-display text-lg font-semibold text-ink mb-2">{s.title}</div>
            <div className="text-sm text-ink-muted">{s.body}</div>
          </div>
        ))}
      </Reveal>
    </div>
  </section>
);

/* ── 4. PRICING MINI ─────────────────────────────────────────── */
const PricingMini = ({ onOpenPayment }) => (
  <section className="section pt-0">
    <div className="container-x">
      <Reveal className="max-w-[520px] mx-auto">
        <div className="text-center mb-6">
          <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-3">— Investasi Ilmu</div>
          <h2 className="font-display text-4xl font-semibold text-ink">Sekali bayar, akses penuh.</h2>
        </div>
        <div className="card-glass-strong p-8 relative overflow-hidden">
          <Blob color="rgba(201,168,106,0.20)" size={260} top={-80} right={-60}/>
          <div className="relative">
            <div className="chip chip-gold text-xs mb-5 inline-flex">Member MADAD</div>
            <div className="flex items-start gap-1 leading-none mb-6">
              <span className="font-display text-xl text-gold-400 mt-3">Rp</span>
              <span className="font-display text-[80px] font-semibold text-gold-300 leading-none tracking-tight">49</span>
              <span className="font-display text-xl text-gold-400 mt-3">.000</span>
            </div>
            <div className="space-y-2.5 mb-7">
              {[
                "Adaptive guide 6 AI × 6 gaya belajar",
                "Muqaranah qoul ulama (Library + buat sendiri)",
                "Kurasah pribadi dengan markdown & teks Arab",
                "Companion harian: niat, ritme, refleksi",
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-ink">
                  <Icon name="check" className="w-4 h-4 text-gold-400 flex-shrink-0" strokeWidth={2.5}/> {f}
                </div>
              ))}
            </div>
            <button onClick={onOpenPayment} className="btn btn-gold w-full text-base py-3.5 shadow-[0_0_30px_rgba(201,168,106,0.25)]">
              <Icon name="sparkles" className="w-4 h-4"/> Bayar via Lynk.id
            </button>
            <p className="mt-3 text-[11px] text-ink-soft text-center">
              Setelah bayar, kode dikirim admin via WhatsApp.
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ── 5. FINAL CTA ────────────────────────────────────────────── */
const FinalCTA = ({ onOpenPayment }) => (
  <section className="section pt-0 pb-24 text-center">
    <div className="container-x max-w-xl mx-auto">
      <div className="divider-arabesque mb-10"/>
      <Reveal>
        <div className="arabic text-3xl text-gold-300 leading-loose mb-3">قَيِّدُوا الْعِلْمَ بِالْكِتَابَةِ</div>
        <p className="text-ink-muted italic text-sm mb-1">"Ikatlah ilmu dengan tulisan."</p>
        <p className="text-ink-soft text-xs mb-8">— Atsar</p>
        <button onClick={onOpenPayment} className="btn btn-primary text-base px-8 py-3.5">
          Mulai perjalananmu di MADAD
        </button>
      </Reveal>
      <div className="divider-arabesque mt-10"/>
    </div>
  </section>
);

window.LandingPage = LandingPage;
