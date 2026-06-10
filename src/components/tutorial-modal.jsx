import React, { useState, useEffect } from 'react';

/* ════════════════════════════════════════════════════════════════
   TUTORIAL MODAL — Panduan lengkap Talqeeh
   
   Cara pakai:
   1. Import TutorialModal di dashboard/layout
   2. Render <TutorialModal/> — otomatis muncul saat pertama login
   3. Untuk buka manual: import { openTutorial } from './tutorial-modal.jsx'
      lalu panggil openTutorial() dari navbar/tombol
   
   Storage key: "talqeeh_tutorial_done" (localStorage)
   ════════════════════════════════════════════════════════════════ */

const EM = "#3ecf8e";
const EM_DEEP = "#1a9e68";

/* ── Helper buka tutorial dari luar komponen ── */
export const openTutorial = () => {
  window.dispatchEvent(new CustomEvent("talqeeh:open-tutorial"));
};

/* ── Ilustrasi SVG mockup UI Talqeeh ── */

const IllusLogin = () => (
  <svg viewBox="0 0 300 160" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="160" rx="12" fill="#101010" stroke="rgba(62,207,142,0.2)"/>
    <circle cx="150" cy="38" r="18" fill="none" stroke={EM} strokeWidth="2"/>
    <text x="150" y="44" fontSize="16" fill={EM} textAnchor="middle" fontWeight="bold">ت</text>
    <text x="150" y="72" fontSize="10" fill="#888" textAnchor="middle">Masukkan kode member kamu</text>
    <rect x="50" y="84" width="200" height="28" rx="7" fill="rgba(255,255,255,0.05)" stroke="rgba(62,207,142,0.4)"/>
    <text x="66" y="102" fontSize="11" fill="#666" fontFamily="monospace">MSR-XXXX-XXXX</text>
    <rect x="50" y="122" width="200" height="28" rx="8" fill={EM}/>
    <text x="150" y="141" fontSize="12" fill="#000" textAnchor="middle" fontWeight="bold">Masuk</text>
  </svg>
);

const IllusProfil = () => (
  <svg viewBox="0 0 300 160" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="160" rx="12" fill="#101010" stroke="rgba(62,207,142,0.2)"/>
    <text x="20" y="28" fontSize="12" fill="#fff" fontWeight="bold">Pilih Fakultas</text>
    {["Dakwah","Ushuluddin","Syariah"].map((f,i)=>(
      <g key={f}>
        <rect x={20+i*90} y="36" width="80" height="26" rx="7"
          fill={i===0?"rgba(62,207,142,0.15)":"rgba(255,255,255,0.04)"}
          stroke={i===0?EM:"rgba(255,255,255,0.1)"}/>
        <text x={20+i*90+40} y="53" fontSize="10" fill={i===0?EM:"#999"} textAnchor="middle">{f}</text>
      </g>
    ))}
    <text x="20" y="86" fontSize="12" fill="#fff" fontWeight="bold">Firqah</text>
    {["1","2","3","4"].map((t,i)=>(
      <g key={t}>
        <rect x={20+i*46} y="96" width="36" height="28" rx="7"
          fill={i===2?"rgba(62,207,142,0.15)":"rgba(255,255,255,0.04)"}
          stroke={i===2?EM:"rgba(255,255,255,0.1)"}/>
        <text x={20+i*46+18} y="115" fontSize="12" fill={i===2?EM:"#999"} textAnchor="middle" fontWeight="bold">{t}</text>
      </g>
    ))}
    <rect x="20" y="134" width="260" height="20" rx="6" fill={EM}/>
    <text x="150" y="148" fontSize="11" fill="#000" textAnchor="middle" fontWeight="bold">Simpan Profil</text>
  </svg>
);

const IllusMaddah = () => (
  <svg viewBox="0 0 300 160" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="160" rx="12" fill="#101010" stroke="rgba(62,207,142,0.2)"/>
    <text x="20" y="28" fontSize="12" fill="#fff" fontWeight="bold">Maddah Kamu</text>
    <text x="20" y="42" fontSize="9" fill="#777">Firqah 3 · Dakwah Islamiyah</text>
    {[["Tafsir Maudhu'i","18 prompt"],["Tiarat Fikriyyah","16 prompt"],["Wasail Tabligh","14 prompt"]].map(([n,c],i)=>(
      <g key={n}>
        <rect x="20" y={52+i*34} width="260" height="28" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
        <circle cx="38" cy={66+i*34} r="8" fill="rgba(62,207,142,0.15)"/>
        <text x="38" y={70+i*34} fontSize="9" fill={EM} textAnchor="middle">📖</text>
        <text x="55" y={63+i*34} fontSize="11" fill="#eee" fontWeight="bold">{n}</text>
        <text x="55" y={75+i*34} fontSize="9" fill={EM}>{c}</text>
        <text x="265" y={69+i*34} fontSize="13" fill="#555" textAnchor="middle">›</text>
      </g>
    ))}
  </svg>
);

const IllusKategori = () => (
  <svg viewBox="0 0 300 160" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="160" rx="12" fill="#101010" stroke="rgba(62,207,142,0.2)"/>
    <text x="20" y="24" fontSize="11" fill="#fff" fontWeight="bold">Pilih Kategori Belajar</text>
    {[["📖","Pahami"],["🧠","Hafal"],["✏️","Latihan"],["📝","Ujian"],["🎙️","Talaqqi"],["🔍","Eksplorasi"]].map(([emoji,label],i)=>{
      const col=i%3, row=Math.floor(i/3);
      return (
        <g key={label}>
          <rect x={20+col*90} y={34+row*56} width="80" height="48" rx="9"
            fill={i===0?"rgba(62,207,142,0.12)":"rgba(255,255,255,0.03)"}
            stroke={i===0?EM:"rgba(255,255,255,0.08)"}/>
          <text x={20+col*90+40} y={34+row*56+22} fontSize="16" textAnchor="middle">{emoji}</text>
          <text x={20+col*90+40} y={34+row*56+38} fontSize="10" fill={i===0?EM:"#ccc"} textAnchor="middle" fontWeight="bold">{label}</text>
        </g>
      );
    })}
  </svg>
);

const IllusCopy = () => (
  <svg viewBox="0 0 300 160" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="160" rx="12" fill="#101010" stroke="rgba(62,207,142,0.2)"/>
    <rect x="20" y="16" width="260" height="90" rx="9" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
    <text x="34" y="34" fontSize="9" fill={EM} fontWeight="bold">PROMPT — MOCK IMTIHAN</text>
    {["Aku Firqah 3 Dakwah, belajar Tafsir Maudhu'i.","Buatkan soal ujian gaya Azhar — 'arrif,","bayyin, qarin... Tunggu jawabanku, nilai","seperti mushahhih Azhari."].map((l,i)=>(
      <text key={i} x="34" y={50+i*14} fontSize="9" fill="#bbb">{l}</text>
    ))}
    <rect x="20" y="116" width="120" height="30" rx="8" fill={EM}/>
    <text x="80" y="135" fontSize="11" fill="#000" textAnchor="middle" fontWeight="bold">📋 Copy Prompt</text>
    <text x="160" y="128" fontSize="10" fill="#777">→ paste di</text>
    <text x="160" y="142" fontSize="10" fill={EM}>Claude / ChatGPT</text>
  </svg>
);

const IllusCatatan = () => (
  <svg viewBox="0 0 300 160" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="160" rx="12" fill="#101010" stroke="rgba(62,207,142,0.2)"/>
    <text x="20" y="26" fontSize="12" fill="#fff" fontWeight="bold">Kurasah (Catatan)</text>
    <rect x="20" y="34" width="260" height="40" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
    <text x="34" y="52" fontSize="11" fill="#eee" fontWeight="bold">Catatan Tafsir — Pekan 3</text>
    <text x="34" y="66" fontSize="9" fill="#777">Makna ayat & faedah dari talaqqi...</text>
    <rect x="20" y="82" width="260" height="40" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
    <text x="34" y="100" fontSize="11" fill="#eee" fontWeight="bold">Kaidah Ushul Fiqh</text>
    <text x="34" y="114" fontSize="9" fill={EM}>Sudah dirapikan oleh AI ✓</text>
    <rect x="20" y="130" width="260" height="22" rx="7" fill="rgba(62,207,142,0.15)" stroke={EM}/>
    <text x="150" y="145" fontSize="11" fill={EM} textAnchor="middle" fontWeight="bold">+ Catatan Baru</text>
  </svg>
);

const IllusProgress = () => (
  <svg viewBox="0 0 300 160" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="160" rx="12" fill="#101010" stroke="rgba(62,207,142,0.2)"/>
    <text x="20" y="26" fontSize="12" fill="#fff" fontWeight="bold">Ritme Belajar</text>
    {Array.from({length:14}).map((_,i)=>(
      <rect key={i} x={20+(i%7)*36} y={34+Math.floor(i/7)*20} width="28" height="14" rx="4"
        fill={i<9?EM:"rgba(255,255,255,0.06)"} opacity={i<9?(0.4+i/18):1}/>
    ))}
    <text x="20" y="94" fontSize="10" fill={EM} fontWeight="bold">🔥 9 hari berturut-turut!</text>
    <text x="20" y="114" fontSize="11" fill="#fff" fontWeight="bold">Progress Maddah</text>
    <rect x="20" y="122" width="260" height="10" rx="5" fill="rgba(255,255,255,0.06)"/>
    <rect x="20" y="122" width="170" height="10" rx="5" fill={EM}/>
    <text x="20" y="148" fontSize="9" fill="#888">12 dari 18 maddah dipelajari</text>
  </svg>
);

const IllusTips = () => (
  <svg viewBox="0 0 300 160" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="160" rx="12" fill="#101010" stroke="rgba(62,207,142,0.2)"/>
    <text x="150" y="24" fontSize="11" fill="#fff" fontWeight="bold" textAnchor="middle">Alur Belajar Ideal 🎯</text>
    {["Pahami","Latihan","Ujian","Eksplorasi"].map((s,i)=>(
      <g key={s}>
        <rect x="40" y={32+i*28} width="220" height="22" rx="7" fill="rgba(62,207,142,0.08)" stroke="rgba(62,207,142,0.25)"/>
        <circle cx="56" cy={43+i*28} r="7" fill={EM}/>
        <text x="56" y={47+i*28} fontSize="9" fill="#000" textAnchor="middle" fontWeight="bold">{i+1}</text>
        <text x="74" y={47+i*28} fontSize="10" fill="#ddd" fontWeight="bold">{s}</text>
        {i<3&&<text x="150" y={60+i*28} fontSize="9" fill={EM} textAnchor="middle">↓</text>}
      </g>
    ))}
  </svg>
);

/* ── Data 8 langkah ── */
const STEPS = [
  {
    id:1, emoji:"📲", title:"Login Pertama Kali", memberOnly:false,
    illus:<IllusLogin/>,
    intro:"Langkah paling awal — masuk ke Talqeeh pakai kode member yang kamu terima via WhatsApp.",
    steps:[
      "Buka talqeeh.vercel.app di browser HP atau laptop.",
      "Klik tombol \"Masuk di sini\" di bagian bawah halaman utama.",
      "Ketik kode member kamu (format MSR-XXXX-XXXX, huruf besar).",
      "Tekan \"Masuk\" — kalau kode benar, langsung masuk ke dashboard.",
    ],
    tip:"Simpan kode member baik-baik. Kalau lupa, hubungi admin via WhatsApp untuk reset.",
  },
  {
    id:2, emoji:"👤", title:"Setup Profil Belajar", memberOnly:false,
    illus:<IllusProfil/>,
    intro:"Talqeeh menyesuaikan maddah dengan kurikulum kamu. Isi profil dengan benar supaya yang tampil tepat.",
    steps:[
      "Setelah login pertama, kamu otomatis diarahkan ke halaman setup profil.",
      "Pilih fakultas kamu — Dakwah, Ushuluddin, Syariah, Dirasat, atau Ma'had.",
      "Pilih tingkat / firqah (1, 2, 3, atau 4).",
      "Pilih jurusan jika ada (mis. Ushuluddin: Tafsir, Aqidah, Hadits, Dakwah).",
      "Klik \"Simpan Profil\" — dashboard langsung menyesuaikan.",
    ],
    tip:"Profil bisa diubah kapan saja dari menu pengaturan kalau tingkat atau jurusan berubah.",
  },
  {
    id:3, emoji:"📚", title:"Menjelajahi Maddah", memberOnly:false,
    illus:<IllusMaddah/>,
    intro:"Dashboard menampilkan semua maddah sesuai fakultas & tingkatmu — inilah pusat belajarmu di Talqeeh.",
    steps:[
      "Di dashboard, lihat daftar maddah yang otomatis disesuaikan dengan profilmu.",
      "Tiap kartu maddah menampilkan nama dan jumlah prompt tersedia.",
      "Klik maddah yang sedang dipelajari atau yang mau disiapkan untuk ujian.",
      "Scroll untuk melihat semua maddah — 72 total untuk semua fakultas & Ma'had.",
    ],
    tip:"Yang muncul di dashboardmu hanya maddah sesuai kurikulummu, bukan semua maddah yang ada.",
  },
  {
    id:4, emoji:"🤖", title:"Mengenal 6 Kategori Prompt", memberOnly:true,
    illus:<IllusKategori/>,
    intro:"Di setiap maddah ada 6 kategori prompt — masing-masing untuk kebutuhan belajar yang berbeda.",
    steps:[
      "📖 Pahami — minta AI jelaskan konsep dengan bahasa mudah & analogi.",
      "🧠 Hafal — bantu muraja'ah, buat tabel hafalan & mnemonic.",
      "✏️ Latihan — drill soal dengan koreksi langkah demi langkah.",
      "📝 Ujian — simulasi imtihan tahriri gaya Azhari.",
      "🎙️ Talaqqi — rapikan catatan kuliah yang berantakan jadi terstruktur.",
      "🔍 Eksplorasi — dalami topik lebih jauh & hubungkan dengan ilmu lain.",
    ],
    tip:"Pilih kategori sesuai kebutuhan saat itu. H-7 ujian? Langsung ke Ujian. Baru belajar materi baru? Mulai dari Pahami.",
  },
  {
    id:5, emoji:"✂️", title:"Copy Prompt & Pakai di AI", memberOnly:true,
    illus:<IllusCopy/>,
    intro:"Ini inti Talqeeh — prompt yang sudah dirancang khusus, tinggal copy dan tempel ke AI favoritmu.",
    steps:[
      "Pilih kategori, lalu pilih judul prompt yang sesuai kebutuhanmu.",
      "Klik tombol \"Copy Prompt\" — teks tersalin otomatis.",
      "Buka Claude (claude.ai) atau ChatGPT di tab lain.",
      "Tempel (Ctrl+V) prompt ke kolom chat.",
      "Ganti bagian [SEBUTKAN] dengan topik spesifik yang kamu pelajari.",
      "Kirim — AI langsung beri penjelasan, soal, atau simulasi ujian.",
    ],
    tip:"Makin spesifik isian [SEBUTKAN], makin tajam jawaban AI. Contoh: bukan 'Nahwu', tapi 'bab kana wa akhawatuha untuk Firqah 2 imtihan pekan depan'.",
  },
  {
    id:6, emoji:"📒", title:"Merapikan Catatan (Kurasah)", memberOnly:true,
    illus:<IllusCatatan/>,
    intro:"Punya catatan talaqqi yang berantakan? Talqeeh bisa bantu rapikan dan menyimpannya dengan rapi.",
    steps:[
      "Buka menu Kurasah dari navigasi bawah.",
      "Klik \"+ Catatan Baru\" dan tempel catatan mentah dari kuliah.",
      "Buka maddah terkait, pilih kategori Talaqqi, copy prompt \"Rapikan Catatan\".",
      "Tempel ke AI bersama catatanmu — AI strukturkan jadi rapi dan terorganisir.",
      "Simpan hasilnya kembali ke Kurasah — tersync otomatis ke cloud.",
    ],
    tip:"Catatan tersimpan di cloud dan tidak hilang meski ganti HP. Biasakan rapikan catatan setiap habis kuliah — jangan menumpuk.",
  },
  {
    id:7, emoji:"📈", title:"Track Progress & Niat", memberOnly:true,
    illus:<IllusProgress/>,
    intro:"Talqeeh bantu kamu tetap konsisten belajar dengan fitur pelacakan yang otomatis.",
    steps:[
      "🎯 Niat Harian — tulis niat belajar setiap hari untuk jaga fokus & keberkahan.",
      "📊 Progress Maddah — tandai maddah yang sudah kamu pelajari & pahami.",
      "🗓️ Ritme Belajar — lihat streak hari aktif belajarmu secara visual.",
      "Semua tercatat otomatis — tidak perlu input manual.",
    ],
    tip:"Cek ritme belajarmu tiap pekan. Konsistensi kecil tiap hari jauh lebih efektif dari belajar marathon sehari sebelum ujian.",
  },
  {
    id:8, emoji:"🚀", title:"Tips Mahir Talqeeh", memberOnly:true,
    illus:<IllusTips/>,
    intro:"Kebiasaan yang membedakan member biasa dengan yang benar-benar memaksimalkan Talqeeh.",
    steps:[
      "✅ Pakai sebelum & sesudah talaqqi — Pahami sebelum kuliah, Talaqqi sesudahnya.",
      "✅ Ikuti alur ideal: Pahami → Latihan → Ujian → Eksplorasi.",
      "✅ Gunakan Mock Imtihan minimal H-7 sebelum ujian asli.",
      "✅ Isi [SEBUTKAN] sespesifik mungkin untuk hasil terbaik.",
      "✅ Rapikan catatan tiap habis kuliah — jangan tumpuk.",
      "✅ Jaga streak harian — sedikit tapi konsisten lebih baik.",
    ],
    tip:"Talqeeh adalah alat bantu, bukan pengganti talaqqi & muthala'ah. Kombinasikan dengan belajar langsung ke masyaikh. Barakallahu fiik! 🤲",
  },
];

/* ── Komponen utama Modal ── */
export default function TutorialModal() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  const touchStartX = React.useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && !isLast) setCurrent(c => c + 1);
      if (diff < 0 && current > 0) setCurrent(c => c - 1);
    }
    touchStartX.current = null;
  };

  let isLoggedIn = false;
  try {
    const s = JSON.parse(localStorage.getItem("madad_session") || "{}");
    isLoggedIn = !!s.code;
  } catch {}

  useEffect(() => {
    if (isLoggedIn) {
      const done = localStorage.getItem("talqeeh_tutorial_done");
      if (!done) {
        const t = setTimeout(() => setOpen(true), 800);
        return () => clearTimeout(t);
      }
    }
    const handler = () => { setCurrent(0); setOpen(true); };
    window.addEventListener("talqeeh:open-tutorial", handler);
    return () => window.removeEventListener("talqeeh:open-tutorial", handler);
  }, [isLoggedIn]);

  const handleClose = () => {
    localStorage.setItem("talqeeh_tutorial_done", "1");
    setOpen(false);
  };

  const steps = isLoggedIn
    ? STEPS
    : STEPS.map(s => ({ ...s, locked: s.memberOnly }));

  const step = steps[current];
  const isLocked = step.locked;
  const pct = Math.round(((current + 1) / steps.length) * 100);
  const isLast = current === steps.length - 1;

  if (!open) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          width: "100%", maxWidth: 480, maxHeight: "90vh",
          background: "#111", borderRadius: 20,
          border: "1px solid rgba(62,207,142,0.2)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "14px 16px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>{step.emoji}</span>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>
              {step.title}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handleClose}
              style={{
                padding: "6px 14px", borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.06)",
                color: "#ccc", cursor: "pointer", fontSize: 13, fontWeight: 600,
              }}
            >
              Lewati
            </button>
            <button
              onClick={handleClose}
              style={{
                width: 30, height: 30, borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.05)",
                color: "#aaa", cursor: "pointer", fontSize: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >✕</button>
          </div>
        </div>

        {/* Step dots + progress */}
        <div style={{ padding: "10px 16px 8px", flexShrink: 0 }}>
          {/* Dots */}
          <div style={{ display: "flex", justifyContent: 'center', gap: 6, marginBottom: 8 }}>
            {steps.map((s, i) => (
              <button key={s.id}
                onClick={() => !s.locked && setCurrent(i)}
                style={{
                  width: i === current ? 20 : 8, height: 8,
                  borderRadius: 99, flexShrink: 0,
                  border: "none", cursor: s.locked ? "not-allowed" : "pointer",
                  background: i === current ? EM : s.locked ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.2)",
                  transition: "all 0.25s ease",
                  padding: 0,
                }}
              />
            ))}
          </div>
          {/* Counter */}
          <div style={{ textAlign: 'center', fontSize: 11, color: '#666', marginBottom: 6 }}>
            {current + 1} dari {steps.length}
          </div>
          {/* Progress bar */}
          <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${pct}%`,
              background: `linear-gradient(90deg, ${EM_DEEP}, ${EM})`,
              borderRadius: 99, transition: "width 0.4s ease",
            }}/>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "0 20px" }}>
          {isLocked ? (
            <div style={{ textAlign: "center", padding: "40px 16px" }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>🔒</div>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: "#fff" }}>
                Langkah Khusus Member
              </h2>
              <p style={{ color: "#aaa", lineHeight: 1.6, fontSize: 14, marginBottom: 22 }}>
                Langkah ini hanya untuk member Talqeeh.
                Daftar sekarang untuk akses penuh ke semua fitur & 1200+ prompt AI.
              </p>
              <a href="#/maddah-publik" onClick={handleClose}
                style={{
                  display: "inline-block", background: EM, color: "#000",
                  fontWeight: 800, padding: "12px 26px", borderRadius: 12,
                  textDecoration: "none", fontSize: 14,
                }}>
                Lihat Paket Member →
              </a>
            </div>
          ) : (
            <div style={{ paddingBottom: 16 }}>
              {/* Ilustrasi */}
              <div style={{ margin: "12px 0", borderRadius: 12, overflow: "hidden", background: "rgba(62,207,142,0.03)", border: "1px solid rgba(62,207,142,0.1)" }}>
                {step.illus}
              </div>

              {/* Intro */}
              <p style={{ fontSize: 14, color: "#bbb", lineHeight: 1.65, margin: "14px 0 16px" }}>
                {step.intro}
              </p>

              {/* Sub-langkah */}
              <ol style={{ listStyle: "none", padding: 0, margin: "0 0 16px" }}>
                {step.steps.map((c, i) => {
                  const hasEmoji = /^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u2705✅]/u.test(c);
                  return (
                    <li key={i} style={{
                      display: "flex", gap: 10, marginBottom: 11,
                      fontSize: 14, lineHeight: 1.55, alignItems: "flex-start",
                    }}>
                      {!hasEmoji && (
                        <span style={{
                          flexShrink: 0, width: 20, height: 20, borderRadius: 6,
                          background: "rgba(62,207,142,0.15)", color: EM,
                          fontSize: 11, fontWeight: 800,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          marginTop: 1,
                        }}>{i + 1}</span>
                      )}
                      <span style={{ color: "#ddd" }}>{c}</span>
                    </li>
                  );
                })}
              </ol>

              {/* Tips */}
              <div style={{
                background: "rgba(62,207,142,0.07)",
                border: "1px solid rgba(62,207,142,0.2)",
                borderRadius: 11, padding: "12px 14px",
                fontSize: 13, lineHeight: 1.6, marginBottom: 4,
              }}>
                <span style={{ fontWeight: 800, color: EM }}>💡 Tips: </span>
                <span style={{ color: "#ccc" }}>{step.tip}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", gap: 8, flexShrink: 0,
        }}>
          {current > 0 ? (
            <button onClick={() => setCurrent(c => c - 1)}
              style={{
                padding: "12px 16px", borderRadius: 12, fontSize: 14,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "transparent", color: "#ccc", cursor: "pointer",
                flexShrink: 0,
              }}>
              ←
            </button>
          ) : (
            <div style={{ width: 48, flexShrink: 0 }}/>
          )}

          {isLast ? (
            <button onClick={handleClose}
              style={{
                flex: 1, padding: "13px", borderRadius: 12, fontSize: 15, fontWeight: 800,
                border: "none", background: EM, color: "#000", cursor: "pointer",
              }}>
              Mulai Belajar 🚀
            </button>
          ) : (
            <button onClick={() => setCurrent(c => c + 1)}
              style={{
                flex: 1, padding: "13px", borderRadius: 12, fontSize: 15, fontWeight: 800,
                border: "none", background: EM, color: "#000", cursor: "pointer",
              }}>
              Lanjut →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
