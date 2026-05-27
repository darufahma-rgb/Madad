/* Madad, Ethics page (public, always accessible) */

const EthicsPage = () => {
  return (
    <div className="page-enter">
      <PageHeader
        kicker="Etika & Adab"
        arabic="آداب طلب العلم في عصر الذكاء الاصطناعي"
        title="Menggunakan AI dengan bijak."
        subtitle="AI membantu belajar, bukan menggantikan berpikir. Pakai dengan adab dan tanggung jawab."
      />

      <section className="pb-12">
        <div className="container-x">
          <Reveal className="card-glass-strong p-10 md:p-14 mb-12 relative overflow-hidden">
            <Blob color="rgba(201,168,106,0.22)" size={400} top={-150} right={-100}/>
            <div className="absolute top-0 right-0 h-full w-1/3 opacity-15 pointer-events-none">
              <Arch className="w-full h-full" color="rgba(212,165,116,0.3)"/>
            </div>
            <div className="relative grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7">
                <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4">Perspektif Islam</div>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink leading-tight mb-5">
                  AI adalah wasilah, hukumnya mengikuti niat dan cara pakai.
                </h2>
                <p className="text-ink-muted text-lg leading-relaxed mb-4">
                  Dalam kaidah fiqih, <em>al-umur bi maqashidiha</em>, segala sesuatu dinilai berdasarkan tujuannya.
                  AI bukan haram, bukan halal secara dzat. Ia adalah alat, dan hukumnya bergantung pada cara penggunaannya.
                </p>
                <p className="text-ink-muted text-lg leading-relaxed">
                  Digunakan untuk tafahhum, mendalami ilmu, dan mempermudah thalabul ilmu yang benar = boleh, bahkan bernilai ibadah.
                  Digunakan untuk menipu, mengurangi usaha belajar, atau menghasilkan karya yang bukan milikmu = tercela.
                </p>
              </div>
              <div className="md:col-span-5">
                <div className="card-glass p-7 text-center">
                  <Icon name="quote" className="w-7 h-7 text-gold-400 mx-auto mb-4" strokeWidth={1.4}/>
                  <div className="arabic-display-classical text-3xl text-gold-200 leading-loose mb-4">إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ</div>
                  <p className="text-sm text-ink-muted italic mb-2">"Sesungguhnya amal itu tergantung niatnya."</p>
                  <div className="text-xs text-ink-soft tracking-wider">HR. Bukhari &amp; Muslim</div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Core principles */}
          <Reveal className="mb-12">
            <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 flex items-center gap-2">
              <span className="w-6 h-px bg-gold-500/70"/>Lima Prinsip Inti
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-8">Pegangan saat pakai AI sebagai thalibul ilmi.</h2>
          </Reveal>
          <Reveal stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
            {ETHICS_POINTS.map((p, i) => (
              <div key={i} className="card-glass p-6 hov-lift">
                <div className="font-display text-5xl font-bold gradient-text leading-none num mb-4">{String(i+1).padStart(2,"0")}</div>
                <h3 className="font-display text-xl font-semibold text-ink mb-2">{p.t}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{p.d}</p>
              </div>
            ))}
          </Reveal>

          {/* Halusinasi warning */}
          <Reveal>
            <div className="rounded-3xl bg-gradient-to-br from-rose-600/20 via-rose-600/10 to-transparent border border-rose-600/30 p-8 md:p-12 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-rose-600/10 blur-3xl"/>
              <div className="relative max-w-3xl">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-12 h-12 rounded-xl bg-rose-600/20 text-rose-600 flex items-center justify-center border border-rose-600/30">
                    <Icon name="alert" className="w-6 h-6" strokeWidth={2}/>
                  </span>
                  <div className="text-xs uppercase tracking-[0.22em] text-rose-600 font-semibold">Peringatan Penting</div>
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink leading-tight mb-5">
                  AI bisa <span className="underline decoration-rose-500/50 underline-offset-4">mengarang</span> referensi kitab yang tidak pernah ada.
                </h2>
                <p className="text-lg text-ink leading-relaxed mb-6">
                  Ini disebut <em>halusinasi</em>, dan inilah jebakan paling sering menjerat mahasiswa.
                  <strong className="block mt-3 text-ink">
                    Selalu verifikasi nama kitab, halaman, dan matan sebelum dimasukkan ke makalah.
                  </strong>
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="card-glass p-4">
                    <div className="font-display text-base font-semibold text-ink mb-1">1. Cek nama</div>
                    <div className="text-xs text-ink-muted">Cari kitab + pengarang di Maktabah Syamilah atau katalog perpus Azhar.</div>
                  </div>
                  <div className="card-glass p-4">
                    <div className="font-display text-base font-semibold text-ink mb-1">2. Cek halaman</div>
                    <div className="text-xs text-ink-muted">Buka kitabnya langsung. Apakah teks yang AI sebut benar ada di halaman itu?</div>
                  </div>
                  <div className="card-glass p-4">
                    <div className="font-display text-base font-semibold text-ink mb-1">3. Cek matan</div>
                    <div className="text-xs text-ink-muted">Bandingkan kata per kata. AI sering memparafrase tanpa kasih tahu.</div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

window.EthicsPage = EthicsPage;
