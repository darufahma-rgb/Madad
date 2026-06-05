import React, { useState } from 'react';

/* ════════════════════════════════════════════════════════════════
   TUTORIAL PAGE — Panduan lengkap Talqeeh
   Route: #/tutorial (publik: 3 langkah pertama, member: semua)
   Style: dark theme Talqeeh (emerald #3ecf8e, DM Sans, glass cards)
   ════════════════════════════════════════════════════════════════ */

const EM = "#3ecf8e";
const EM_DEEP = "#1a9e68";

/* ── Komponen ilustrasi mockup UI (SVG) ── */

const IllusLogin = () => (
  <svg viewBox="0 0 320 200" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="loginbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#101010"/>
        <stop offset="100%" stopColor="#0a0a0a"/>
      </linearGradient>
    </defs>
    <rect width="320" height="200" rx="14" fill="url(#loginbg)" stroke="rgba(62,207,142,0.2)"/>
    <circle cx="160" cy="48" r="20" fill="none" stroke={EM} strokeWidth="2"/>
    <text x="160" y="54" fontSize="18" fill={EM} textAnchor="middle" fontWeight="bold">ت</text>
    <text x="160" y="86" fontSize="11" fill="#999" textAnchor="middle">Masukkan kode member</text>
    <rect x="60" y="100" width="200" height="32" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(62,207,142,0.4)"/>
    <text x="74" y="120" fontSize="12" fill="#777" fontFamily="monospace">MSR-XXXX-XXXX</text>
    <rect x="60" y="144" width="200" height="34" rx="9" fill={EM}/>
    <text x="160" y="166" fontSize="13" fill="#000" textAnchor="middle" fontWeight="bold">Masuk</text>
  </svg>
);

const IllusProfil = () => (
  <svg viewBox="0 0 320 200" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="200" rx="14" fill="#0d0d0d" stroke="rgba(62,207,142,0.2)"/>
    <text x="24" y="32" fontSize="13" fill="#fff" fontWeight="bold">Pilih Fakultas</text>
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
    <rect x="24" y="144" width="130" height="34" rx="9" fill={EM}/>
    <text x="89" y="166" fontSize="12" fill="#000" textAnchor="middle" fontWeight="bold">📋 Copy Prompt</text>
    <text x="172" y="166" fontSize="11" fill="#777">→ tempel di Claude</text>
  </svg>
);

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

const IllusProgress = () => (
  <svg viewBox="0 0 320 200" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="200" rx="14" fill="#0d0d0d" stroke="rgba(62,207,142,0.2)"/>
    <text x="24" y="30" fontSize="13" fill="#fff" fontWeight="bold">Ritme Belajar</text>
    {Array.from({ length: 14 }).map((_, i) => (
      <rect key={i} x={24 + (i % 7) * 38} y={42 + Math.floor(i / 7) * 22}
        width="30" height="16" rx="4"
        fill={i < 9 ? EM : "rgba(255,255,255,0.06)"} opacity={i < 9 ? (0.4 + (i / 20)) : 1}/>
    ))}
    <text x="24" y="112" fontSize="11" fill={EM} fontWeight="bold">🔥 9 hari berturut-turut!</text>
    <text x="24" y="140" fontSize="11" fill="#fff" fontWeight="bold">Progress Maddah</text>
    <rect x="24" y="150" width="272" height="12" rx="6" fill="rgba(255,255,255,0.06)"/>
    <rect x="24" y="150" width="180" height="12" rx="6" fill={EM}/>
    <text x="24" y="180" fontSize="10" fill="#888">12 dari 18 maddah dipelajari</text>
  </svg>
);

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

const IllusMuqaranah = () => (
  <svg viewBox="0 0 320 200" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="200" rx="14" fill="#0d0d0d" stroke="rgba(62,207,142,0.2)"/>
    <text x="160" y="26" fontSize="12" fill="#fff" fontWeight="bold" textAnchor="middle">Muqaranah — Perbandingan Mazhab</text>
    <rect x="20" y="36" width="130" height="130" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
    <text x="85" y="56" fontSize="10" fill={EM} textAnchor="middle" fontWeight="bold">Mazhab Syafi'i</text>
    <text x="85" y="74" fontSize="9" fill="#bbb" textAnchor="middle">Hukum: Wajib</text>
    <text x="85" y="88" fontSize="9" fill="#bbb" textAnchor="middle">Dalil: QS. Al-Baqarah</text>
    <text x="85" y="102" fontSize="9" fill="#bbb" textAnchor="middle">Syarat: 3 perkara</text>
    <text x="85" y="120" fontSize="8" fill="#777" textAnchor="middle">Tarjih: ✓ Kuat</text>
    <rect x="170" y="36" width="130" height="130" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
    <text x="235" y="56" fontSize="10" fill="#aaa" textAnchor="middle" fontWeight="bold">Mazhab Hanafi</text>
    <text x="235" y="74" fontSize="9" fill="#bbb" textAnchor="middle">Hukum: Sunnah</text>
    <text x="235" y="88" fontSize="9" fill="#bbb" textAnchor="middle">Dalil: Hadits Riwayat</text>
    <text x="235" y="102" fontSize="9" fill="#bbb" textAnchor="middle">Syarat: 2 perkara</text>
    <text x="235" y="120" fontSize="8" fill="#777" textAnchor="middle">Tarjih: Perlu dalil</text>
    <circle cx="160" cy="100" r="14" fill="#1a1a1a" stroke="rgba(62,207,142,0.3)"/>
    <text x="160" y="105" fontSize="10" fill={EM} textAnchor="middle" fontWeight="bold">VS</text>
  </svg>
);

const IllusToolGuide = () => (
  <svg viewBox="0 0 320 200" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="200" rx="14" fill="#0d0d0d" stroke="rgba(62,207,142,0.2)"/>
    <text x="24" y="28" fontSize="12" fill="#fff" fontWeight="bold">Tool Guide — Rekomendasi AI</text>
    <text x="24" y="42" fontSize="9" fill="#777">Disesuaikan dengan gaya belajarmu</text>
    {[
      ["Claude", "Terbaik untuk analisis & nuansa bahasa Arab", true],
      ["ChatGPT", "Baik untuk soal latihan & drill cepat", false],
      ["Gemini", "Bagus untuk riset & referensi umum", false],
    ].map(([name, desc, rec], i) => (
      <g key={name}>
        <rect x="24" y={54 + i * 44} width="272" height="36" rx="9"
          fill={rec ? "rgba(62,207,142,0.08)" : "rgba(255,255,255,0.03)"}
          stroke={rec ? "rgba(62,207,142,0.3)" : "rgba(255,255,255,0.08)"}/>
        <circle cx="44" cy={72 + i * 44} r="9" fill={rec ? "rgba(62,207,142,0.2)" : "rgba(255,255,255,0.06)"}/>
        <text x="44" y={76 + i * 44} fontSize="9" fill={rec ? EM : "#777"} textAnchor="middle">{rec ? "★" : "○"}</text>
        <text x="62" y={69 + i * 44} fontSize="11" fill="#eee" fontWeight="bold">{name}</text>
        <text x="62" y={82 + i * 44} fontSize="9" fill="#888">{desc}</text>
      </g>
    ))}
  </svg>
);

const IllusFramework = () => (
  <svg viewBox="0 0 320 200" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="200" rx="14" fill="#0d0d0d" stroke="rgba(62,207,142,0.2)"/>
    <text x="24" y="28" fontSize="12" fill="#fff" fontWeight="bold">Framework Belajar</text>
    <text x="24" y="42" fontSize="9" fill="#777">6 metode berbasis riset ilmiah untuk Masisir</text>
    {[
      ["Spaced Repetition", "Ulangi di waktu yang tepat"],
      ["Active Recall", "Uji diri tanpa lihat catatan"],
      ["Interleaving", "Campur topik saat belajar"],
      ["Elaborative Interrogation", "Tanya 'mengapa' di setiap konsep"],
    ].map(([name, desc], i) => (
      <g key={name}>
        <rect x="24" y={50 + i * 34} width="272" height="26" rx="7"
          fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.07)"/>
        <rect x="24" y={50 + i * 34} width="4" height="26" rx="2" fill={EM}/>
        <text x="38" y={65 + i * 34} fontSize="10" fill="#eee" fontWeight="bold">{name}</text>
        <text x="160" y={65 + i * 34} fontSize="9" fill="#888">{desc}</text>
      </g>
    ))}
  </svg>
);

const IllusSiapImtihan = () => (
  <svg viewBox="0 0 320 200" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="200" rx="14" fill="#0d0d0d" stroke="rgba(62,207,142,0.2)"/>
    <text x="24" y="28" fontSize="12" fill="#fff" fontWeight="bold">Siap Imtihan</text>
    <text x="24" y="42" fontSize="9" fill="#777">6 mode persiapan ujian khusus Azhari</text>
    {[
      ["📦", "Kompres Materi", "Rangkuman padat siap tulis"],
      ["🎯", "Drill Soal Azhari", "'Arrif, bayyin, wadhdhih"],
      ["🎤", "Mock Syafawi", "Simulasi ujian lisan dengan AI"],
      ["💡", "Analogi & Paham", "Konsep sulit jadi mudah"],
      ["📝", "Poin Hafalan", "Poin kunci untuk dihafal"],
      ["📖", "Faham Isi", "Terjemah + penjelasan istilah"],
    ].map(([emoji, name, desc], i) => {
      const col = i % 2, row = Math.floor(i / 2);
      return (
        <g key={name}>
          <rect x={24 + col * 142} y={52 + row * 44} width="132" height="36" rx="8"
            fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
          <text x={24 + col * 142 + 16} y={68 + row * 44} fontSize="12">{emoji}</text>
          <text x={24 + col * 142 + 32} y={66 + row * 44} fontSize="9" fill="#eee" fontWeight="bold">{name}</text>
          <text x={24 + col * 142 + 32} y={78 + row * 44} fontSize="8" fill="#888">{desc}</text>
        </g>
      );
    })}
  </svg>
);

const IllusPaths = () => (
  <svg viewBox="0 0 320 200" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="200" rx="14" fill="#0d0d0d" stroke="rgba(62,207,142,0.2)"/>
    <text x="24" y="28" fontSize="12" fill="#fff" fontWeight="bold">Learning Path</text>
    <text x="24" y="42" fontSize="9" fill="#777">Belajar bertahap dari pemula ke AI-ready</text>
    {[
      ["Level 1", "Pemula", "Kenalan dengan AI", 100],
      ["Level 2", "Menengah", "Pakai AI untuk maddah", 60],
      ["Level 3", "Mahir", "Workflow AI penuh", 20],
    ].map(([level, label, desc, pct], i) => (
      <g key={level}>
        <rect x="24" y={52 + i * 46} width="272" height="38" rx="9"
          fill="rgba(255,255,255,0.03)" stroke={i === 0 ? "rgba(62,207,142,0.3)" : "rgba(255,255,255,0.07)"}/>
        <text x="38" y={68 + i * 46} fontSize="10" fill={i === 0 ? EM : "#aaa"} fontWeight="bold">{level} — {label}</text>
        <text x="38" y={80 + i * 46} fontSize="9" fill="#777">{desc}</text>
        <rect x="160" y={62 + i * 46} width="120" height="8" rx="4" fill="rgba(255,255,255,0.06)"/>
        <rect x="160" y={62 + i * 46} width={120 * pct / 100} height="8" rx="4" fill={i === 0 ? EM : "rgba(62,207,142,0.3)"}/>
        <text x="285" y={70 + i * 46} fontSize="8" fill={i === 0 ? EM : "#777"} textAnchor="end">{pct}%</text>
      </g>
    ))}
  </svg>
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
  },
  {
    id: 9, emoji: "⚖️", title: "Muqaranah — Perbandingan Mazhab", memberOnly: true,
    illus: <IllusMuqaranah/>,
    intro: "Fitur khusus untuk membandingkan pendapat antar mazhab dalam satu tampilan — sangat berguna untuk maddah Fiqh, Ushul, Aqidah, dan Hadits.",
    steps: [
      "Buka menu Muqaranah dari navigasi.",
      "Pilih topik dari library yang sudah tersedia — mencakup Fiqh, Ushul Fiqh, Aqidah, dan Hadits.",
      "Lihat perbandingan pendapat mazhab secara berdampingan: dalil, hukum, syarat, dan tarjih.",
      "Bisa juga buat Muqaranah sendiri — klik \"+ Buat Muqaranah\" dan isi topik, pendapat, dan tarjih sesuai catatanmu.",
      "Gunakan prompt Eksplorasi di maddah untuk minta AI bantu analisis perbedaan lebih dalam.",
    ],
    tip: "Muqaranah sangat berguna untuk persiapan ujian maddah yang sering menanyakan perbedaan pendapat (khilaf). Buat sendiri berdasarkan catatan talaqqi untuk hasil terbaik.",
  },
  {
    id: 10, emoji: "🛠️", title: "Tool Guide — Pilih AI yang Tepat", memberOnly: true,
    illus: <IllusToolGuide/>,
    intro: "Tidak semua AI cocok untuk semua kebutuhan. Tool Guide membantu kamu memilih AI yang paling sesuai dengan gaya belajar dan tugasmu.",
    steps: [
      "Buka menu Tool Guide dari navigasi.",
      "Talqeeh otomatis merekomendasikan AI berdasarkan gaya belajar yang kamu isi di profil.",
      "Pilih AI (Claude, ChatGPT, Gemini, dll) untuk lihat panduan penggunaan yang sudah disesuaikan.",
      "Tiap AI punya kelebihan berbeda — Claude terbaik untuk analisis bahasa Arab & nuansa, ChatGPT cepat untuk drill soal.",
      "Ikuti langkah & workflow yang disarankan untuk hasil optimal dari tiap AI.",
    ],
    tip: "Untuk maddah Azhari, Claude paling direkomendasikan karena kemampuan analisis teks Arab dan nuansa fiqhnya. Tapi kombinasikan dengan AI lain sesuai kebutuhan.",
  },
  {
    id: 11, emoji: "🧪", title: "Framework Belajar", memberOnly: true,
    illus: <IllusFramework/>,
    intro: "6 metode belajar berbasis riset ilmiah yang sudah diadaptasi untuk konteks Masisir Al-Azhar. Belajar lebih efektif dengan cara yang benar.",
    steps: [
      "Buka menu Framework dari navigasi.",
      "Baca 6 framework yang tersedia — mulai dari Spaced Repetition, Active Recall, Interleaving, dan lainnya.",
      "Tiap framework dilengkapi penjelasan cara kerjanya dan contoh penerapan di maddah Azhar.",
      "Pilih framework yang paling cocok dengan gaya belajarmu dan terapkan saat pakai Talqeeh.",
      "Kombinasikan dengan prompt Talqeeh — misalnya framework Active Recall + prompt Latihan untuk hasil maksimal.",
    ],
    tip: "Spaced Repetition adalah framework paling powerful untuk hafalan maddah Azhar. Kombinasikan dengan prompt Hafal di Talqeeh: ulangi di H+1, H+3, H+7 setelah belajar.",
  },
  {
    id: 12, emoji: "📋", title: "Siap Imtihan — Mode Ujian", memberOnly: true,
    illus: <IllusSiapImtihan/>,
    intro: "Mode khusus persiapan ujian dengan 6 jenis latihan yang dirancang sesuai gaya imtihan Al-Azhar.",
    steps: [
      "Buka menu Siap Imtihan dari dashboard atau navigasi.",
      "Pilih maddah yang mau disiapkan, lalu pilih salah satu dari 6 mode:",
      "📦 Kompres Materi — rangkuman padat satu bab, siap ditulis di kertas ujian.",
      "🎯 Drill Soal Azhari — latihan soal persis gaya Azhar: 'arrif, bayyin, wadhdhih, qaarun.",
      "🎤 Mock Syafawi — simulasi ujian lisan, AI berperan sebagai dosen yang menguji.",
      "💡 Analogi & Paham — konsep sulit dijelaskan lewat analogi yang mudah dipahami.",
    ],
    tip: "Gunakan Siap Imtihan minimal H-7 sebelum ujian. Urutan ideal: Kompres Materi → Drill Soal → Mock Syafawi. Tiga hari terakhir fokus ke Mock Syafawi untuk melatih kepercayaan diri.",
  },
  {
    id: 13, emoji: "🗺️", title: "Learning Path — Belajar Bertahap", memberOnly: true,
    illus: <IllusPaths/>,
    intro: "Jalur belajar terstruktur dari pemula ke mahir — 3 level, masing-masing 5 modul yang bisa dikerjakan sesuai pace kamu.",
    steps: [
      "Buka menu Learning Path dari navigasi.",
      "Ada 3 level: Pemula (kenalan AI), Menengah (pakai AI untuk maddah), Mahir (workflow AI penuh).",
      "Mulai dari Level 1 kalau baru pertama pakai AI, atau langsung loncat ke level yang sesuai.",
      "Kerjakan tiap modul secara berurutan — tiap modul berisi panduan praktis yang bisa langsung diterapkan.",
      "Progress tersimpan otomatis — kamu bisa lanjut kapan saja dari modul terakhir.",
    ],
    tip: "Kalau sudah terbiasa pakai Talqeeh, langsung mulai dari Level 2. Level 3 berisi workflow lanjutan yang bisa melipatgandakan efektivitas belajarmu dengan AI.",
  },
];

function TutorialPage() {
  const [current, setCurrent] = useState(0);
  let isLoggedIn = false;
  try {
    const s = JSON.parse(localStorage.getItem("madad_session") || "{}");
    isLoggedIn = !!s.code;
  } catch { isLoggedIn = false; }

  const steps = isLoggedIn
    ? STEPS
    : STEPS.map((s) => ({ ...s, locked: s.memberOnly }));

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
              <button onClick={() => setCurrent(current + 1)}
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
