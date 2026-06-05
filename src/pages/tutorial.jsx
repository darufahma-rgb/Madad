import React, { useState } from 'react';

/* ════════════════════════════════════════════════════════════════
   TUTORIAL PAGE — Panduan lengkap Talqeeh
   Route: #/tutorial (publik: 3 langkah pertama, member: semua)
   Style: dark theme Talqeeh (emerald #3ecf8e, DM Sans, glass cards)
   ════════════════════════════════════════════════════════════════ */

const EM = "#3ecf8e";
const EM_DEEP = "#1a9e68";

/* ── Komponen ilustrasi mockup UI (SVG) ── */

// Mockup: layar login
const IllusLogin = () => (
  <svg viewBox="0 0 320 200" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="loginbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#101010"/>
        <stop offset="100%" stopColor="#0a0a0a"/>
      </linearGradient>
    </defs>
    <rect width="320" height="200" rx="14" fill="url(#loginbg)" stroke="rgba(62,207,142,0.2)"/>
    {/* logo */}
    <circle cx="160" cy="48" r="20" fill="none" stroke={EM} strokeWidth="2"/>
    <text x="160" y="54" fontSize="18" fill={EM} textAnchor="middle" fontWeight="bold">ت</text>
    <text x="160" y="86" fontSize="11" fill="#999" textAnchor="middle">Masukkan kode member</text>
    {/* input */}
    <rect x="60" y="100" width="200" height="32" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(62,207,142,0.4)"/>
    <text x="74" y="120" fontSize="12" fill="#777" fontFamily="monospace">MSR-XXXX-XXXX</text>
    {/* button */}
    <rect x="60" y="144" width="200" height="34" rx="9" fill={EM}/>
    <text x="160" y="166" fontSize="13" fill="#000" textAnchor="middle" fontWeight="bold">Masuk</text>
  </svg>
);

// Mockup: setup profil
const IllusProfil = () => (
  <svg viewBox="0 0 320 200" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="200" rx="14" fill="#0d0d0d" stroke="rgba(62,207,142,0.2)"/>
    <text x="24" y="32" fontSize="13" fill="#fff" fontWeight="bold">Pilih Fakultas</text>
    {/* faculty chips */}
    {["Dakwah", "Ushuluddin", "Syariah"].map((f, i) => (
      <g key={f}>
        <rect x={24 + i * 95} y="44" width="86" height="30" rx="8"
          fill={i === 0 ? "rgba(62,207,142,0.15)" : "rgba(255,255,255,0.04)"}
          stroke={i === 0 ? EM : "rgba(255,255,255,0.1)"}/>
        <text x={24 + i * 95 + 43} y="63" fontSize="11" fill={i === 0 ? EM : "#aaa"} textAnchor="middle">{f}</text>
      </g>
    ))}
    <text x="24" y="100" fontSize="13" fill="#fff" fontWeight="bold">Tingkat / Firqah</text>
    {["1", "2", "3", "4"].map((t, i) => (
      <g key={t}>
        <rect x={24 + i * 50} y="112" width="40" height="34" rx="8"
          fill={i === 2 ? "rgba(62,207,142,0.15)" : "rgba(255,255,255,0.04)"}
          stroke={i === 2 ? EM : "rgba(255,255,255,0.1)"}/>
        <text x={24 + i * 50 + 20} y="134" fontSize="13" fill={i === 2 ? EM : "#aaa"} textAnchor="middle" fontWeight="bold">{t}</text>
      </g>
    ))}
    <rect x="24" y="160" width="272" height="28" rx="8" fill={EM}/>
    <text x="160" y="179" fontSize="12" fill="#000" textAnchor="middle" fontWeight="bold">Simpan Profil</text>
  </svg>
);

// Mockup: daftar maddah
const IllusMaddah = () => (
  <svg viewBox="0 0 320 200" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="200" rx="14" fill="#0d0d0d" stroke="rgba(62,207,142,0.2)"/>
    <text x="24" y="30" fontSize="13" fill="#fff" fontWeight="bold">Maddah Kamu</text>
    <text x="24" y="46" fontSize="10" fill="#777">Firqah 3 · Dakwah</text>
    {[
      ["Tafsir Maudhu'i", "18 prompt"],
      ["Tiarat Fikriyyah", "16 prompt"],
      ["Manahij Bahts", "12 prompt"],
    ].map(([name, count], i) => (
      <g key={name}>
        <rect x="24" y={58 + i * 44} width="272" height="36" rx="9"
          fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
        <circle cx="44" cy={76 + i * 44} r="9" fill="rgba(62,207,142,0.15)"/>
        <text x="44" y={80 + i * 44} fontSize="10" fill={EM} textAnchor="middle">📖</text>
        <text x="62" y={73 + i * 44} fontSize="12" fill="#eee" fontWeight="bold">{name}</text>
        <text x="62" y={87 + i * 44} fontSize="9" fill={EM}>{count}</text>
        <text x="280" y={80 + i * 44} fontSize="14" fill="#555" textAnchor="middle">›</text>
      </g>
    ))}
  </svg>
);

// Mockup: 6 kategori prompt
const IllusKategori = () => (
  <svg viewBox="0 0 320 200" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="200" rx="14" fill="#0d0d0d" stroke="rgba(62,207,142,0.2)"/>
    <text x="24" y="28" fontSize="12" fill="#fff" fontWeight="bold">Pilih Kategori Belajar</text>
    {[
      ["📖", "Pahami"], ["🧠", "Hafal"], ["✏️", "Latihan"],
      ["📝", "Ujian"], ["🎙️", "Talaqqi"], ["🔍", "Eksplorasi"],
    ].map(([emoji, label], i) => {
      const col = i % 3, row = Math.floor(i / 3);
      return (
        <g key={label}>
          <rect x={24 + col * 95} y={42 + row * 70} width="86" height="60" rx="10"
            fill={i === 0 ? "rgba(62,207,142,0.12)" : "rgba(255,255,255,0.03)"}
            stroke={i === 0 ? EM : "rgba(255,255,255,0.08)"}/>
          <text x={24 + col * 95 + 43} y={42 + row * 70 + 28} fontSize="18" textAnchor="middle">{emoji}</text>
          <text x={24 + col * 95 + 43} y={42 + row * 70 + 48} fontSize="11" fill={i === 0 ? EM : "#bbb"} textAnchor="middle" fontWeight="bold">{label}</text>
        </g>
      );
    })}
  </svg>
);

// Mockup: copy prompt
const IllusCopy = () => (
  <svg viewBox="0 0 320 200" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="200" rx="14" fill="#0d0d0d" stroke="rgba(62,207,142,0.2)"/>
    <rect x="24" y="22" width="272" height="110" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
    <text x="38" y="44" fontSize="10" fill={EM} fontWeight="bold">PROMPT — MOCK IMTIHAN</text>
    {[
      "Aku Firqah 3 Dakwah, belajar Tafsir.",
      "Buatkan soal ujian gaya Azhar untuk",
      "[SEBUTKAN]: 'arrif, bayyin, qarin...",
      "Tunggu jawabanku lalu nilai.",
    ].map((line, i) => (
      <text key={i} x="38" y={62 + i * 16} fontSize="9.5" fill="#bbb">{line}</text>
    ))}
    {/* copy button */}
    <rect x="24" y="144" width="130" height="34" rx="9" fill={EM}/>
    <text x="89" y="166" fontSize="12" fill="#000" textAnchor="middle" fontWeight="bold">📋 Copy Prompt</text>
    {/* arrow to AI */}
    <text x="172" y="166" fontSize="11" fill="#777">→ tempel di Claude</text>
  </svg>
);

// Mockup: catatan
const IllusCatatan = () => (
  <svg viewBox="0 0 320 200" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="200" rx="14" fill="#0d0d0d" stroke="rgba(62,207,142,0.2)"/>
    <text x="24" y="30" fontSize="13" fill="#fff" fontWeight="bold">Kurasah (Catatan)</text>
    <rect x="24" y="42" width="272" height="50" rx="9" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
    <text x="38" y="60" fontSize="11" fill="#eee" fontWeight="bold">Catatan Tafsir — Pekan 3</text>
    <text x="38" y="78" fontSize="9" fill="#888">Makna ayat & faedah dari talaqqi...</text>
    <rect x="24" y="100" width="272" height="50" rx="9" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
    <text x="38" y="118" fontSize="11" fill="#eee" fontWeight="bold">Kaidah Ushul Fiqh</text>
    <text x="38" y="136" fontSize="9" fill="#888">Sudah dirapikan oleh AI ✓</text>
    <rect x="24" y="160" width="272" height="28" rx="8" fill="rgba(62,207,142,0.15)" stroke={EM}/>
    <text x="160" y="179" fontSize="12" fill={EM} textAnchor="middle" fontWeight="bold">+ Catatan Baru</text>
  </svg>
);

// Mockup: progress
const IllusProgress = () => (
  <svg viewBox="0 0 320 200" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="200" rx="14" fill="#0d0d0d" stroke="rgba(62,207,142,0.2)"/>
    <text x="24" y="30" fontSize="13" fill="#fff" fontWeight="bold">Ritme Belajar</text>
    {/* streak dots */}
    {Array.from({ length: 14 }).map((_, i) => (
      <rect key={i} x={24 + (i % 7) * 38} y={42 + Math.floor(i / 7) * 22}
        width="30" height="16" rx="4"
        fill={i < 9 ? EM : "rgba(255,255,255,0.06)"} opacity={i < 9 ? (0.4 + (i / 20)) : 1}/>
    ))}
    <text x="24" y="112" fontSize="11" fill={EM} fontWeight="bold">🔥 9 hari berturut-turut!</text>
    {/* progress bar */}
    <text x="24" y="140" fontSize="11" fill="#fff" fontWeight="bold">Progress Maddah</text>
    <rect x="24" y="150" width="272" height="12" rx="6" fill="rgba(255,255,255,0.06)"/>
    <rect x="24" y="150" width="180" height="12" rx="6" fill={EM}/>
    <text x="24" y="180" fontSize="10" fill="#888">12 dari 18 maddah dipelajari</text>
  </svg>
);

// Mockup: tips (ringkasan workflow)
const IllusTips = () => (
  <svg viewBox="0 0 320 200" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="200" rx="14" fill="#0d0d0d" stroke="rgba(62,207,142,0.2)"/>
    <text x="160" y="28" fontSize="12" fill="#fff" fontWeight="bold" textAnchor="middle">Alur Belajar Ideal</text>
    {["Pahami", "Latihan", "Ujian", "Eksplorasi"].map((s, i) => (
      <g key={s}>
        <rect x="40" y={42 + i * 36} width="240" height="28" rx="8"
          fill="rgba(62,207,142,0.08)" stroke="rgba(62,207,142,0.3)"/>
        <circle cx="58" cy={56 + i * 36} r="8" fill={EM}/>
        <text x="58" y={60 + i * 36} fontSize="10" fill="#000" textAnchor="middle" fontWeight="bold">{i + 1}</text>
        <text x="76" y={60 + i * 36} fontSize="11" fill="#ddd" fontWeight="bold">{s}</text>
        {i < 3 && <text x="160" y={78 + i * 36} fontSize="10" fill={EM} textAnchor="middle">↓</text>}
      </g>
    ))}
  </svg>
);

/* ── Slot untuk screenshot asli (diisi nanti oleh admin) ── */
const ScreenshotSlot = ({ caption }) => (
  <div style={{
    border: "1.5px dashed rgba(62,207,142,0.35)",
    borderRadius: 12,
    padding: "28px 16px",
    textAlign: "center",
    background: "rgba(62,207,142,0.03)",
    marginTop: 14,
  }}>
    <div style={{ fontSize: 22, marginBottom: 6 }}>🖼️</div>
    <div style={{ fontSize: 12, color: EM, fontWeight: 700, marginBottom: 4 }}>
      [ SLOT SCREENSHOT ]
    </div>
    <div style={{ fontSize: 11, color: "#888", lineHeight: 1.5 }}>{caption}</div>
  </div>
);

/* ── Data langkah tutorial ── */
const STEPS = [
  {
    id: 1, emoji: "📲", title: "Login Pertama Kali", memberOnly: false,
    illus: <IllusLogin/>,
    intro: "Langkah paling awal — masuk ke Talqeeh pakai kode member yang kamu terima.",
    steps: [
      "Buka talqeeh.vercel.app di browser HP atau laptop.",
      "Klik tombol \"Masuk di sini\" di bagian bawah halaman utama.",
      "Ketik kode member kamu dengan format MSR-XXXX-XXXX (huruf besar).",
      "Tekan tombol \"Masuk\". Kalau kode benar, kamu langsung masuk ke dalam.",
    ],
    tip: "Kode member dikirim ke WhatsApp kamu saat pertama daftar. Simpan baik-baik — kode ini kunci akses kamu. Kalau lupa, hubungi admin.",
    screenshot: "Tampilan halaman login dengan kolom input kode member.",
  },
  {
    id: 2, emoji: "👤", title: "Setup Profil Belajar", memberOnly: false,
    illus: <IllusProfil/>,
    intro: "Talqeeh menyesuaikan maddah dengan kurikulum kamu. Isi profil dengan benar supaya yang muncul tepat.",
    steps: [
      "Setelah login pertama, kamu otomatis diarahkan ke halaman setup profil.",
      "Pilih fakultas kamu — misalnya Dakwah, Ushuluddin, Syariah, atau Ma'had.",
      "Pilih tingkat atau firqah kamu (1, 2, 3, atau 4).",
      "Kalau fakultas kamu punya jurusan (mis. Ushuluddin: Tafsir/Aqidah/Hadits), pilih juga.",
      "Pilih gaya belajar favorit, lalu klik \"Simpan Profil\".",
    ],
    tip: "Profil bisa diubah kapan saja lewat menu pengaturan. Kalau maddah yang muncul terasa tidak sesuai, cek lagi apakah fakultas & tingkatmu sudah benar.",
    screenshot: "Halaman onboarding dengan pilihan fakultas, tingkat, dan jurusan.",
  },
  {
    id: 3, emoji: "📚", title: "Menjelajahi Maddah", memberOnly: false,
    illus: <IllusMaddah/>,
    intro: "Dashboard menampilkan semua maddah sesuai fakultas & tingkatmu. Ini pusat belajarmu.",
    steps: [
      "Di dashboard, kamu lihat daftar maddah sesuai profil kamu.",
      "Tiap kartu maddah menampilkan nama dan jumlah prompt yang tersedia.",
      "Klik maddah yang sedang kamu pelajari atau yang mau disiapkan untuk ujian.",
      "Scroll ke bawah untuk melihat semua maddah — termasuk maddah Ma'had jika kamu di jenjang itu.",
    ],
    tip: "Talqeeh punya 72 maddah total — mencakup semua fakultas S1 dan Ma'had (I'dadi, Tsanawi Adabi & Ilmi). Yang muncul di dashboard-mu hanya yang sesuai kurikulummu.",
    screenshot: "Dashboard dengan daftar kartu maddah.",
  },
  {
    id: 4, emoji: "🤖", title: "Mengenal 6 Kategori Prompt", memberOnly: true,
    illus: <IllusKategori/>,
    intro: "Setiap maddah punya 6 kategori prompt. Masing-masing untuk kebutuhan belajar yang berbeda.",
    steps: [
      "📖 Pahami — minta AI menjelaskan konsep maddah dengan bahasa yang mudah.",
      "🧠 Hafal — bantu muraja'ah, buat tabel hafalan & mnemonic.",
      "✏️ Latihan — drill soal latihan dengan koreksi langkah demi langkah.",
      "📝 Ujian — simulasi imtihan tahriri & syafawi gaya Azhari.",
      "🎙️ Talaqqi — rapikan catatan berantakan dari kuliah jadi terstruktur.",
      "🔍 Eksplorasi — dalami topik lebih jauh & hubungkan dengan ilmu lain.",
    ],
    tip: "Tidak harus pakai semua. Pilih sesuai kebutuhanmu saat itu. Mau paham materi baru? Pahami. Tinggal seminggu sebelum ujian? Langsung ke Ujian.",
    screenshot: "Tampilan tab 6 kategori di dalam halaman maddah.",
  },
  {
    id: 5, emoji: "✂️", title: "Copy Prompt & Pakai di AI", memberOnly: true,
    illus: <IllusCopy/>,
    intro: "Ini inti Talqeeh — prompt yang sudah dirancang khusus, tinggal copy & tempel ke AI favoritmu.",
    steps: [
      "Pilih kategori, lalu pilih judul prompt yang sesuai kebutuhanmu.",
      "Klik tombol \"Copy Prompt\" — teks prompt otomatis tersalin.",
      "Buka Claude (claude.ai) atau ChatGPT di tab/aplikasi lain.",
      "Tempel (paste) prompt-nya ke kolom chat.",
      "Ganti bagian [SEBUTKAN] dengan topik spesifik yang kamu pelajari.",
      "Kirim — AI langsung kasih penjelasan, soal, atau simulasi ujian sesuai prompt.",
    ],
    tip: "Makin spesifik isian [SEBUTKAN], makin tajam jawaban AI. Jangan cuma tulis \"Nahwu\" — tulis \"bab kana wa akhawatuha untuk Firqah 2\". Detail kecil bikin beda besar.",
    screenshot: "Tampilan prompt dengan tombol Copy, sebelum & sesudah ditempel di AI.",
  },
  {
    id: 6, emoji: "📒", title: "Merapikan Catatan (Kurasah)", memberOnly: true,
    illus: <IllusCatatan/>,
    intro: "Punya catatan talaqqi yang berantakan? Talqeeh bisa bantu rapikan & menyimpannya.",
    steps: [
      "Buka menu Kurasah (Catatan) dari navigasi bawah.",
      "Klik \"+ Catatan Baru\" untuk membuat catatan.",
      "Tempel catatan mentah dari kuliah/talaqqi kamu.",
      "Buka maddah terkait, pilih kategori Talaqqi, copy prompt \"Rapikan Catatan\".",
      "Tempel ke AI bersama catatanmu — AI akan strukturkan jadi rapi.",
      "Simpan hasilnya kembali ke Kurasah.",
    ],
    tip: "Catatan tersimpan di cloud dan otomatis sync. Ganti HP atau buka di laptop, catatanmu tetap ada. Tidak akan hilang.",
    screenshot: "Halaman Kurasah dengan daftar catatan tersimpan.",
  },
  {
    id: 7, emoji: "📈", title: "Tracking Progress & Niat", memberOnly: true,
    illus: <IllusProgress/>,
    intro: "Talqeeh bantu kamu tetap konsisten dengan fitur pelacakan yang otomatis.",
    steps: [
      "🎯 Niat Harian — tulis niat belajarmu tiap hari untuk menjaga fokus & keberkahan.",
      "📊 Progress Maddah — tandai maddah yang sudah kamu pelajari & pahami.",
      "🗓️ Ritme Belajar — lihat streak (rentetan) hari kamu aktif belajar.",
      "Semua tercatat otomatis saat kamu pakai Talqeeh — tidak perlu input manual.",
    ],
    tip: "Cek Ritme Belajar tiap pekan. Streak yang panjang adalah tanda konsistensi — dan konsistensi adalah kunci sukses imtihan di Azhar.",
    screenshot: "Tampilan ritme belajar dengan streak & progress bar.",
  },
  {
    id: 8, emoji: "🚀", title: "Tips Jadi Mahir", memberOnly: true,
    illus: <IllusTips/>,
    intro: "Beberapa kebiasaan yang membedakan member biasa dengan member yang benar-benar memaksimalkan Talqeeh.",
    steps: [
      "✅ Pakai sebelum & sesudah talaqqi — Pahami sebelum kuliah, Talaqqi sesudahnya.",
      "✅ Ikuti alur: Pahami → Latihan → Ujian → Eksplorasi untuk penguasaan penuh.",
      "✅ Gunakan Mock Imtihan minimal H-7 sebelum ujian asli.",
      "✅ Isi placeholder [SEBUTKAN] sespesifik mungkin.",
      "✅ Rapikan catatan tiap habis kuliah — jangan menumpuk.",
      "✅ Jaga streak harian — sedikit tapi konsisten lebih baik dari banyak tapi jarang.",
    ],
    tip: "Talqeeh adalah alat bantu, bukan pengganti talaqqi & muthala'ah. Kombinasikan dengan belajar langsung ke masyaikh untuk hasil terbaik. Barakallahu fiik! 🤲",
    screenshot: null,
  },
];

export default function TutorialPage() {
  const [current, setCurrent] = useState(0);
  // Cek login dari session global
  let isLoggedIn = false;
  try {
    const s = JSON.parse(localStorage.getItem("madad_session") || "{}");
    isLoggedIn = !!s.code;
  } catch { isLoggedIn = false; }

  const steps = isLoggedIn
    ? STEPS
    : STEPS.map((s, i) => ({ ...s, locked: s.memberOnly }));

  const step = steps[current];
  const isLocked = step.locked;
  const pct = Math.round(((current + 1) / steps.length) * 100);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px 100px" }}>
      {/* Header */}
      <div style={{ padding: "28px 4px 18px" }}>
        <div style={{ fontSize: 12, color: "#888", letterSpacing: 1.5, fontWeight: 600 }}>
          PANDUAN PENGGUNAAN
        </div>
        <h1 className="font-display" style={{ fontSize: 30, fontWeight: 800, margin: "6px 0 8px", lineHeight: 1.1 }}>
          Cara Pakai <span style={{ color: EM }}>Talqeeh</span>
        </h1>
        <p style={{ fontSize: 15, color: "#aaa", margin: 0, lineHeight: 1.5 }}>
          Dari login pertama sampai mahir. Ikuti {STEPS.length} langkah ini pelan-pelan.
        </p>
      </div>

      {/* Step dots */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "4px 4px 18px" }}>
        {steps.map((s, i) => (
          <button key={s.id} onClick={() => !s.locked && setCurrent(i)}
            aria-label={`Langkah ${s.id}`}
            style={{
              width: 36, height: 36, borderRadius: 12, flexShrink: 0,
              border: "none", cursor: s.locked ? "not-allowed" : "pointer",
              background: i === current ? EM : s.locked ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.1)",
              color: i === current ? "#000" : s.locked ? "#555" : "#fff",
              fontWeight: 800, fontSize: 14, transition: "all 0.2s",
            }}>
            {s.locked ? "🔒" : s.id}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${EM_DEEP}, ${EM})`, borderRadius: 99, transition: "width 0.4s ease" }}/>
        </div>
        <div style={{ fontSize: 12, color: "#777", marginTop: 6, textAlign: "right" }}>{pct}% selesai</div>
      </div>

      {isLocked ? (
        /* Locked card */
        <div className="card-glass" style={{ textAlign: "center", padding: "56px 24px" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🔒</div>
          <h2 className="font-display" style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>
            Langkah Khusus Member
          </h2>
          <p style={{ color: "#aaa", marginBottom: 26, lineHeight: 1.6, fontSize: 15 }}>
            Langkah {step.id} dan seterusnya hanya untuk member Talqeeh.
            Daftar sekarang untuk akses penuh — 72 maddah & 1200+ prompt AI.
          </p>
          <a href="#/maddah-publik" style={{
            display: "inline-block", background: EM, color: "#000", fontWeight: 800,
            padding: "13px 30px", borderRadius: 12, textDecoration: "none", fontSize: 15,
          }}>
            Lihat Paket Member →
          </a>
        </div>
      ) : (
        /* Step card */
        <div className="card-glass" style={{ overflow: "hidden" }}>
          {/* Illustration */}
          <div style={{ padding: "20px 20px 0", background: "rgba(62,207,142,0.03)" }}>
            {step.illus}
          </div>

          {/* Body */}
          <div style={{ padding: "22px 22px 8px" }}>
            <div style={{ fontSize: 12, color: EM, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
              {step.emoji} LANGKAH {step.id} DARI {STEPS.length}
            </div>
            <h2 className="font-display" style={{ fontSize: 23, fontWeight: 800, margin: "0 0 10px" }}>
              {step.title}
            </h2>
            <p style={{ fontSize: 15, color: "#bbb", lineHeight: 1.6, marginBottom: 20 }}>
              {step.intro}
            </p>

            {/* Steps list */}
            <ol style={{ listStyle: "none", padding: 0, margin: "0 0 18px", counterReset: "step" }}>
              {step.steps.map((c, i) => {
                const hasEmoji = /^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u2705]/u.test(c);
                return (
                  <li key={i} style={{ display: "flex", gap: 12, marginBottom: 13, lineHeight: 1.55, fontSize: 14.5, alignItems: "flex-start" }}>
                    {!hasEmoji && (
                      <span style={{
                        flexShrink: 0, width: 22, height: 22, borderRadius: 7,
                        background: "rgba(62,207,142,0.15)", color: EM,
                        fontSize: 12, fontWeight: 800, display: "flex",
                        alignItems: "center", justifyContent: "center", marginTop: 1,
                      }}>{i + 1}</span>
                    )}
                    <span style={{ color: "#ddd" }}>{c}</span>
                  </li>
                );
              })}
            </ol>

            {/* Screenshot slot */}
            {step.screenshot && <ScreenshotSlot caption={step.screenshot}/>}

            {/* Tip */}
            <div style={{
              background: "rgba(62,207,142,0.08)", border: "1px solid rgba(62,207,142,0.22)",
              borderRadius: 12, padding: "14px 16px", fontSize: 14, lineHeight: 1.6, marginTop: 16,
            }}>
              <span style={{ fontWeight: 800, color: EM }}>💡 Tips: </span>
              <span style={{ color: "#cfcfcf" }}>{step.tip}</span>
            </div>
          </div>

          {/* Nav */}
          <div style={{
            padding: "16px 22px", borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
          }}>
            <button onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}
              style={{
                padding: "11px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)",
                background: "transparent", color: current === 0 ? "#444" : "#fff",
                cursor: current === 0 ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600,
              }}>← Balik</button>

            {current < steps.length - 1 ? (
              <button onClick={() => { const n = current + 1; if (!steps[n].locked) setCurrent(n); else setCurrent(n); }}
                style={{
                  padding: "11px 22px", borderRadius: 10, border: "none",
                  background: EM, color: "#000", cursor: "pointer", fontSize: 14, fontWeight: 800,
                }}>Lanjut →</button>
            ) : (
              <a href={isLoggedIn ? "#/dashboard" : "#/maddah-publik"} style={{
                padding: "11px 22px", borderRadius: 10, border: "none",
                background: EM, color: "#000", textDecoration: "none", fontSize: 14, fontWeight: 800,
              }}>{isLoggedIn ? "Mulai Belajar 🚀" : "Gabung Member →"}</a>
            )}
          </div>
        </div>
      )}

      {/* Help footer */}
      <div style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "#777" }}>
        Masih bingung? Hubungi admin lewat WhatsApp untuk bantuan langsung.
      </div>
    </div>
  );
}

window.TutorialPage = TutorialPage;
