import React, { useState } from 'react';
/* Talqeeh — Tentang Developer (publik). Edit DEV_PROFILE di bawah untuk mengganti isi halaman. */

const DEV_PROFILE = {
  name: "Daru Fahmaa Muliawan",
  initials: "DF",
  photo: "/daru-fahmaa.webp",
  tagline: "Mahasiswa S2 Al-Azhar, Fakultas Fiqh ʿAmm. Pendiri komunitas AIGYPT.",
  about: [
    "Daru Fahmaa Muliawan adalah mahasiswa S2 Universitas Al-Azhar, Fakultas Fiqh ʿAmm, yang sudah hampir sepuluh tahun menjalani proses belajar serta kehidupan di Mesir.",
    "Perjalanannya tidak hanya berada di ruang akademik. Sejak 2017, ia berkecimpung di dunia desain grafis, lalu perlahan berkembang ke pengembangan produk digital, teknologi, dan Artificial Intelligence.",
    "Ia juga mendirikan AIGYPT, sebuah komunitas yang lahir dari keinginan untuk mendekatkan teknologi AI kepada pelajar dan mahasiswa, khususnya Masisir. Baginya, teknologi bukan sekadar sesuatu yang harus diikuti perkembangannya, tetapi sesuatu yang bisa diarahkan untuk membantu proses belajar, berkarya, dan berkembang.",
  ],
  aboutClosing: "Dari persimpangan antara pengalaman sebagai mahasiswa Al-Azhar, dunia kreatif, dan teknologi inilah Talqeeh kemudian lahir.",
  origin: [
    "Talqeeh berangkat dari pengalaman yang sangat dekat dengan kehidupan pendirinya sendiri sebagai mahasiswa Al-Azhar.",
    "Selama bertahun-tahun belajar di sini, Daru tahu rasanya berhadapan dengan diktat Arab yang tebal, materi yang padat, istilah yang tidak selalu mudah dipahami, dan banyaknya pelajaran yang harus dikuasai dalam waktu terbatas.",
    "Di sisi lain, perkembangan AI sudah sangat cepat. Teknologinya sudah bisa membantu menjelaskan, merangkum, berdiskusi, membuat latihan soal, sampai menjadi partner belajar. Masalahnya, kebanyakan teknologi tersebut dibuat untuk kebutuhan yang sangat umum. Belum banyak yang benar-benar memahami bagaimana mahasiswa Al-Azhar belajar.",
  ],
  question: "Bagaimana kalau teknologi AI tidak hanya kita pakai, tetapi kita bentuk agar benar-benar memahami kebutuhan belajar mahasiswa Al-Azhar?",
  originClosing: [
    "Pertanyaan itulah yang akhirnya berkembang menjadi Talqeeh.",
    "Talqeeh bukan sekadar chatbot AI. Ia dibangun sebagai sebuah ekosistem belajar yang menggabungkan materi Al-Azhar, library berbagai maddah, kumpulan prompt yang sudah disesuaikan, bank soal, bantuan memahami mufradat dan i'rab, hingga AI Study Partner yang bisa menemani proses belajar secara lebih personal.",
  ],
  nameIntro: "Nama “Talqeeh” berasal dari kata Arab تَلْقِيح (talqīḥ). Secara bahasa, kata ini berkaitan dengan proses penyerbukan, yaitu proses yang membantu sesuatu tumbuh dan berkembang. Dari makna itulah filosofi Talqeeh diambil.",
  nameMeaning: "menyuburkan pemahaman.",
  nameBody: [
    "Talqeeh tidak hadir untuk menggantikan guru, kitab, ataupun proses belajar. Justru sebaliknya. Ia hadir sebagai alat bantu untuk “menyuburkan” apa yang sedang dipelajari: membantu materi yang awalnya sulit menjadi lebih terbuka, membantu pertanyaan berkembang menjadi pemahaman, dan membantu ilmu yang sedang dipelajari tumbuh lebih kuat di dalam diri seorang pelajar.",
  ],
  nameClosing: "Karena pada akhirnya, teknologi terbaik bukan teknologi yang menggantikan manusia dalam belajar, tetapi teknologi yang membuat manusia bisa belajar dengan lebih baik.",
  contacts: [
    { icon: "messageSquare", label: "WhatsApp", value: "Hubungi admin", href: "https://wa.me/6281311506025" },
    { icon: "users", label: "Instagram AIGYPT", value: "@ai.gypt", href: "https://instagram.com/ai.gypt" },
  ],
};

const DEV_PRINCIPLES = [
  { icon: "book", t: "Isi dulu, fitur kemudian", d: "Maddah dan soal dikurasi mengikuti muqarrar Azhar yang benar-benar dipakai." },
  { icon: "brain", t: "AI sebagai tutor", d: "AI Partner mengajar, mengetes, dan mengingat titik lemahmu, bukan sekadar menjawab." },
  { icon: "shield", t: "Privasi dihormati", d: "Datamu tidak dijual dan tidak dipakai untuk iklan." },
  { icon: "heart", t: "Terbuka untuk masukan", d: "Ada bug, ide, atau soal yang salah? Kabari kami, itu yang bikin Talqeeh terus membaik." },
];

const DevPhoto = () => {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-3xl overflow-hidden border border-gold-500/30 bg-gradient-to-br from-gold-500/20 to-transparent shrink-0">
      {failed ? (
        <div className="w-full h-full flex items-center justify-center font-display text-5xl md:text-7xl font-bold gradient-text">
          {DEV_PROFILE.initials}
        </div>
      ) : (
        <img src={DEV_PROFILE.photo} alt={DEV_PROFILE.name} className="w-full h-full object-cover"
             loading="lazy" onError={() => setFailed(true)}/>
      )}
    </div>
  );
};

const DevKicker = ({ children }) => (
  <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 flex items-center gap-2">
    <span className="w-6 h-px bg-gold-500/70"/>{children}
  </div>
);

const DeveloperPage = () => (
  <div className="page-enter">
    <PageHeader
      kicker="Tentang Developer"
      arabic="من نحن"
      title="Di balik Talqeeh."
      subtitle="Siapa yang membangunnya, dari mana ia lahir, dan kenapa namanya Talqeeh."
    />

    <section className="pb-12">
      <div className="container-x">
        {/* 1. Founder */}
        <Reveal className="card-glass-strong p-6 md:p-10 lg:p-14 mb-14 relative overflow-hidden">
          <GlowBlob color="rgba(201,168,106,0.22)" size={400} top={-150} right={-100}/>
          <div className="relative flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            <DevPhoto/>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-3">Founder Talqeeh</div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink leading-tight mb-2">{DEV_PROFILE.name}</h2>
              <p className="text-gold-200 mb-6">{DEV_PROFILE.tagline}</p>
              {DEV_PROFILE.about.map((p, i) => (
                <p key={i} className="text-ink-muted text-lg leading-relaxed mb-4">{p}</p>
              ))}
              <p className="text-ink text-lg leading-relaxed font-medium">{DEV_PROFILE.aboutClosing}</p>
            </div>
          </div>
        </Reveal>

        {/* 2. Talqeeh lahir dari apa */}
        <Reveal className="mb-8">
          <DevKicker>Cerita di balik Talqeeh</DevKicker>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink">Talqeeh lahir dari apa.</h2>
        </Reveal>
        <Reveal className="grid md:grid-cols-12 gap-4 md:gap-6 mb-14">
          <div className="md:col-span-7 card-glass p-6 md:p-8">
            {DEV_PROFILE.origin.map((p, i) => (
              <p key={i} className="text-ink-muted text-lg leading-relaxed mb-4 last:mb-0">{p}</p>
            ))}
          </div>
          <div className="md:col-span-5 card-glass p-6 md:p-8 text-center flex flex-col justify-center">
            <Icon name="quote" className="w-7 h-7 text-gold-400 mx-auto mb-3" strokeWidth={1.4}/>
            <p className="font-display text-xl md:text-2xl text-ink italic leading-snug">“{DEV_PROFILE.question}”</p>
          </div>
          <div className="md:col-span-12 card-glass p-6 md:p-8">
            {DEV_PROFILE.originClosing.map((p, i) => (
              <p key={i} className="text-ink-muted text-lg leading-relaxed mb-4 last:mb-0">{p}</p>
            ))}
          </div>
        </Reveal>

        {/* 3. Kenapa namanya Talqeeh */}
        <Reveal className="mb-8">
          <DevKicker>Filosofi nama</DevKicker>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink">Kenapa namanya Talqeeh?</h2>
        </Reveal>
        <Reveal className="card-glass-strong p-6 md:p-10 lg:p-14 mb-14 relative overflow-hidden">
          <GlowBlob color="rgba(201,168,106,0.18)" size={360} top={-120} left={-100}/>
          <div className="relative grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 text-center">
              <div className="arabic-display-classical text-6xl md:text-7xl text-gold-200 leading-loose" dir="rtl">تَلْقِيح</div>
              <div className="text-xs text-ink-soft tracking-[0.22em] uppercase mt-2">talqīḥ</div>
              <p className="font-display text-2xl md:text-3xl font-semibold gradient-text mt-6 leading-snug">“{DEV_PROFILE.nameMeaning}”</p>
            </div>
            <div className="md:col-span-7">
              <p className="text-ink-muted text-lg leading-relaxed mb-4">{DEV_PROFILE.nameIntro}</p>
              {DEV_PROFILE.nameBody.map((p, i) => (
                <p key={i} className="text-ink-muted text-lg leading-relaxed mb-4">{p}</p>
              ))}
              <p className="text-ink text-lg leading-relaxed font-medium">{DEV_PROFILE.nameClosing}</p>
            </div>
          </div>
        </Reveal>

        {/* Pegangan */}
        <Reveal className="mb-8">
          <DevKicker>Pegangan</DevKicker>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink">Cara Talqeeh dibangun.</h2>
        </Reveal>
        <Reveal stagger className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-4 mb-14">
          {DEV_PRINCIPLES.map(p => (
            <div key={p.t} className="card-glass p-3.5 md:p-6 hov-lift min-w-0">
              <Icon name={p.icon} className="w-6 h-6 text-gold-400 mb-3 md:mb-4" strokeWidth={1.5}/>
              <h3 className="font-display text-sm md:text-lg font-semibold text-ink mb-1.5 leading-snug">{p.t}</h3>
              <p className="text-xs md:text-sm text-ink-muted leading-relaxed">{p.d}</p>
            </div>
          ))}
        </Reveal>

        {/* Kontak */}
        <Reveal className="card-glass p-6 md:p-8">
          <h2 className="font-display text-2xl font-semibold text-ink mb-2">Nemu bug atau punya ide?</h2>
          <p className="text-ink-muted mb-5">Kabari lewat WhatsApp atau Instagram, semuanya kami baca.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {DEV_PROFILE.contacts.map(c => (
              <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
                 className="card-glass p-4 flex items-center gap-4 hov-lift">
                <span className="w-11 h-11 rounded-xl bg-gold-500/15 text-gold-400 flex items-center justify-center shrink-0">
                  <Icon name={c.icon} className="w-5 h-5" strokeWidth={1.6}/>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-ink-soft tracking-wider uppercase">{c.label}</span>
                  <span className="block text-ink font-medium truncate">{c.value}</span>
                </span>
                <Icon name="arrowRight" className="w-4 h-4 text-ink-soft shrink-0"/>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  </div>
);

Object.assign(window, { DeveloperPage });
