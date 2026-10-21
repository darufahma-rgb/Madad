import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
/* Talqeeh — Presentasi publik (/presentasi): cerita, fitur, dan cara pakai Talqeeh dalam bentuk slide.
   Tiap slide dirancang di panggung tetap 1600×900 lalu diskalakan pas layar, jadi tampilannya sama di proyektor,
   laptop, maupun HP (landscape). Motif: pola khatam (bintang 8), ritme slide gelap–terang, badge bintang.
   Angka & harga dibaca dari data situs (CATALOG, useAppSettings, imtihanBundle) supaya tidak basi. */

const SW = 1600, SH = 900;
const SLIDE_KEY = "talqeeh_presentasi_slide";
const EM = "#3ECF8E", EM_DARK = "#12895A", GOLD = "#C9A86A", GOLD_DARK = "#9A7633";
const INK = "#0F1A15", MUTED = "#55635C", MUTED_D = "#A9B5AF", NIGHT = "#07110D";
const ARABIC = '"Noto Naskh Arabic", "Amiri", "Traditional Arabic", serif';
const SERIF = 'Georgia, "Times New Roman", serif';

// Bintang 8 sudut (khatam): 16 titik bergantian jari-jari luar R dan dalam r.
const starPts = (cx, cy, R, r = R * 0.77, rot = 22.5) => Array.from({ length: 16 }, (_, i) => {
  const a = ((i * 22.5 + rot) * Math.PI) / 180, rr = i % 2 ? r : R;
  return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`;
}).join(" ");
const svgUri = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
const patternUri = (stroke, opacity, size = 120) => svgUri(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
  [[size / 2, size / 2, size * 0.36], [0, 0, size * 0.14], [size, 0, size * 0.14], [0, size, size * 0.14], [size, size, size * 0.14]]
    .map(([x, y, R]) => `<polygon points="${starPts(x, y, R)}" fill="none" stroke="${stroke}" stroke-opacity="${opacity}" stroke-width="1.4"/>`).join("") +
  `</svg>`);

/* ── Latar ── */
const BgDark = () => (
  <div className="absolute inset-0" style={{ background: `radial-gradient(60% 70% at 12% 8%, rgba(62,207,142,0.22), transparent 70%), radial-gradient(55% 60% at 92% 96%, rgba(201,168,106,0.13), transparent 70%), ${NIGHT}` }}>
    <div className="absolute inset-0" style={{ backgroundImage: patternUri("#FFFFFF", 0.05), WebkitMaskImage: "radial-gradient(ellipse at center, transparent 25%, #000 85%)", maskImage: "radial-gradient(ellipse at center, transparent 25%, #000 85%)" }}/>
  </div>
);
const BgLight = () => (
  <div className="absolute inset-0" style={{ background: "#FFFFFF" }}>
    <div className="absolute inset-0" style={{ backgroundImage: patternUri(EM_DARK, 0.09, 110), WebkitMaskImage: "radial-gradient(65% 65% at 100% 0%, #000, transparent)", maskImage: "radial-gradient(65% 65% at 100% 0%, #000, transparent)" }}/>
  </div>
);
const BgSection = () => (
  <div className="absolute inset-0" style={{ background: `radial-gradient(45% 55% at 78% 45%, rgba(62,207,142,0.18), transparent 70%), linear-gradient(135deg, #0E3B29 0%, #08190F 60%, ${NIGHT} 100%)` }}>
    <div className="absolute inset-0" style={{ backgroundImage: patternUri("#FFFFFF", 0.045) }}/>
    <svg className="absolute inset-0" width={SW} height={SH} viewBox={`0 0 ${SW} ${SH}`} aria-hidden="true">
      <polygon points={starPts(1250, 417, 358)} fill="none" stroke={GOLD} strokeOpacity="0.35" strokeWidth="2.5"/>
      <polygon points={starPts(1250, 417, 275, 275 * 0.77, 0)} fill="none" stroke={GOLD} strokeOpacity="0.2" strokeWidth="1.7"/>
      <polygon points={starPts(1250, 417, 192)} fill="none" stroke={EM} strokeOpacity="0.25" strokeWidth="1.7"/>
    </svg>
  </div>
);

/* ── Komponen ── */
const BADGE = {
  lightEm: { fill: "#E7F7EF", stroke: EM, icon: EM_DARK },
  lightGold: { fill: "#F7F0E1", stroke: GOLD, icon: GOLD_DARK },
  darkEm: { fill: "#0F2A1F", stroke: EM, icon: EM },
  darkGold: { fill: "#2A2414", stroke: GOLD, icon: GOLD },
};
const Badge = ({ icon, v = "lightEm", size = 96, style }) => {
  const c = BADGE[v];
  return (
    <div className="relative shrink-0" style={{ width: size, height: size, ...style }}>
      <svg viewBox="0 0 256 256" width={size} height={size} className="absolute inset-0" aria-hidden="true">
        <polygon points={starPts(128, 128, 122)} fill={c.fill} stroke={c.stroke} strokeWidth="5" strokeLinejoin="round"/>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center" style={{ color: c.icon }}>
        <Icon name={icon} strokeWidth={1.9} stroke={c.icon} style={{ width: size * 0.46, height: size * 0.46 }}/>
      </div>
    </div>
  );
};
const Ornament = ({ size, color = GOLD, opacity = 0.55, style }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={style} aria-hidden="true">
    <polygon points={starPts(128, 128, 120)} fill="none" stroke={color} strokeOpacity={opacity} strokeWidth="5"/>
    <polygon points={starPts(128, 128, 70, 70 * 0.77, 0)} fill={color} fillOpacity={opacity}/>
  </svg>
);
// Tangkapan layar dalam bingkai perangkat.
const Device = ({ src, w, h, rotate = 0, style, alt }) => (
  <div className="absolute" style={{ width: w + 26, height: h + 26, padding: 13, borderRadius: 30, background: "#040806", border: "1.5px solid #2B3A33", boxShadow: "0 24px 60px rgba(0,0,0,0.45)", transform: `rotate(${rotate}deg)`, ...style }}>
    <img src={src} alt={alt} draggable="false" style={{ width: w, height: h, borderRadius: 18, display: "block", objectFit: "cover", objectPosition: "top" }}/>
  </div>
);
const Kicker = ({ children, color = GOLD, style }) => (
  <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color, ...style }}>{children}</div>
);
const Title = ({ children, dark }) => (
  <h2 className="absolute font-display" style={{ left: 80, top: 62, right: 80, margin: 0, fontSize: 60, lineHeight: 1.1, fontWeight: 700, letterSpacing: "-0.01em", color: dark ? "#fff" : INK }}>{children}</h2>
);
// Nomor slide sudah ada di bar atas; pojok kanan bawah dipakai tombol navigasi.
const Foot = ({ dark }) => (
  <div className="absolute" style={{ left: 80, bottom: 40, fontSize: 19, color: dark ? MUTED_D : MUTED }}>talqeeh.id</div>
);
const Card = ({ children, style, dark, accent }) => (
  <div className="absolute" style={{
    borderRadius: 22, padding: 36,
    background: dark ? (accent ? NIGHT : "rgba(255,255,255,0.06)") : "#fff",
    border: `1.5px solid ${accent || (dark ? "rgba(255,255,255,0.18)" : "#E2EAE6")}`,
    boxShadow: dark ? "none" : "0 6px 24px rgba(15,26,21,0.08)", ...style,
  }}>{children}</div>
);
const Steps = ({ items, color, textColor, gap = 92, size = 30 }) => (
  <div>
    {items.map((t, i) => (
      <div key={i} className="flex items-center" style={{ height: gap - 30, marginBottom: 30 - (gap - 92) * 0, gap: 26 }}>
        <span className="shrink-0 flex items-center justify-center font-bold" style={{ width: 62, height: 62, borderRadius: 99, fontSize: 24, color, border: `2px solid ${color}`, background: color + "22" }}>{i + 1}</span>
        <span style={{ fontSize: size, color: textColor, lineHeight: 1.3 }}>{t}</span>
      </div>
    ))}
  </div>
);
const Arabic = ({ children, style }) => <div dir="rtl" lang="ar" style={{ fontFamily: ARABIC, lineHeight: 1.4, ...style }}>{children}</div>;

/* ════════ SLIDE ════════ */
const buildSlides = (d) => [
  { key: "pembuka", theme: "dark", note: "Assalamu'alaikum. Saya Daru, mahasiswa S2 Al-Azhar dan pendiri Talqeeh. Hari ini saya ingin bercerita tentang Talqeeh: kenapa ia lahir, apa saja fiturnya, dan bagaimana cara memakainya.",
    body: () => (<>
      <BgDark/>
      <img src="/assets/talqeeh-logo.png" alt="Talqeeh" className="absolute" style={{ left: 96, top: 80, width: 110 }}/>
      <Kicker style={{ position: "absolute", left: 96, top: 224 }}>Teman belajar Masisir</Kicker>
      <h1 className="absolute font-display" style={{ left: 96, top: 270, width: 980, margin: 0, fontSize: 104, lineHeight: 1.0, fontWeight: 800, letterSpacing: "-0.03em", color: "#fff" }}>
        Paham <span style={{ color: EM }}>Muqarrar</span><br/>dengan AI
      </h1>
      <p className="absolute" style={{ left: 96, top: 545, width: 760, margin: 0, fontSize: 32, lineHeight: 1.4, color: MUTED_D }}>Untuk mahasiswa Al-Azhar dari Ma'had, Darul Lughoh, sampai S2</p>
      <div className="absolute" style={{ left: 96, bottom: 100, fontSize: 24, color: GOLD }}>talqeeh.id · Daru Fahmaa Muliawan, Founder</div>
      <Ornament size={740} style={{ position: "absolute", left: 920, top: 56 }}/>
      <Device src="/presentasi/hero.webp" alt="Beranda talqeeh.id" w={336} h={727} rotate={4} style={{ left: 1120, top: 72 }}/>
    </>) },

  { key: "masalah", theme: "light", note: "Ini yang dirasakan hampir semua Masisir: diktat Arab yang tebal, istilah yang sulit, kuliah yang cepat dan kadang 'ammiyah. Di sisi lain AI berkembang pesat, tapi dibuat untuk kebutuhan umum, bukan untuk cara belajar dan cara diuji di Al-Azhar.",
    body: () => (<>
      <BgLight/>
      <Title>Belajar di Al-Azhar itu tidak mudah</Title>
      {[["bookOpen", "Diktat Arab tebal", "Muqarrar ratusan halaman, banyak maddah, waktu menuju imtihan terbatas."],
        ["type", "Istilah tidak mudah", "Istilah fiqh, ushul, nahwu, balaghah perlu dijelaskan, bukan hanya diterjemahkan."],
        ["mic", "Kuliah susah diikuti", "Duktur menjelaskan cepat, kadang 'ammiyah. Mencatat sambil memahami itu sulit."],
        ["cpu", "AI masih serba umum", "ChatGPT dan sejenisnya belum paham cara mahasiswa Azhar belajar dan diuji."]].map(([ic, t, s], i) => (
        <div key={t} className="absolute" style={{ left: 80 + i * 368, top: 210, width: 330 }}>
          <div className="flex items-center justify-between">
            <span className="font-display" style={{ fontSize: 66, fontWeight: 800, color: i === 3 ? GOLD_DARK : EM_DARK }}>0{i + 1}</span>
            <Badge icon={ic} v={i === 3 ? "lightGold" : "lightEm"} size={100}/>
          </div>
          <div style={{ fontSize: 33, fontWeight: 700, color: INK, marginTop: 26 }}>{t}</div>
          <div style={{ fontSize: 26, color: MUTED, marginTop: 14, lineHeight: 1.45 }}>{s}</div>
        </div>
      ))}
      <div className="absolute flex items-center" style={{ left: 80, right: 80, top: 600, height: 136, borderRadius: 22, background: NIGHT, padding: "0 48px", fontSize: 34 }}>
        <span style={{ color: "#fff" }}>AI berkembang pesat,&nbsp;</span><b style={{ color: EM }}>tapi belum dibentuk untuk cara belajar Azhari.</b>
      </div>
    </>) },

  { key: "founder", theme: "light", note: "Talqeeh lahir dari pengalaman saya sendiri. Hampir sepuluh tahun di Mesir, saya tahu rasanya berhadapan dengan diktat tebal dan waktu yang terbatas. Dari dunia desain lalu teknologi dan AI, muncul satu pertanyaan: bagaimana kalau AI kita bentuk supaya benar-benar memahami cara belajar mahasiswa Al-Azhar?",
    body: () => (<>
      <BgLight/>
      <Title>Lahir dari pengalaman sendiri</Title>
      <img src="/daru-fahmaa.webp" alt="Daru Fahmaa Muliawan" className="absolute" style={{ left: 80, top: 208, width: 461, height: 576, objectFit: "cover", objectPosition: "top" }}/>
      <Ornament size={150} style={{ position: "absolute", left: 455, top: 700 }}/>
      <div className="absolute" style={{ left: 630, top: 208, right: 80 }}>
        <Kicker color={GOLD_DARK}>Founder Talqeeh</Kicker>
        <div className="font-display" style={{ fontSize: 50, fontWeight: 700, color: INK, marginTop: 16 }}>Daru Fahmaa Muliawan</div>
        <div style={{ fontSize: 26, color: EM_DARK, marginTop: 10 }}>Mahasiswa S2 Al-Azhar, Fakultas Fiqh 'Amm · Pendiri komunitas AIGYPT</div>
        <ul style={{ margin: "26px 0 0", paddingLeft: 30, fontSize: 28, color: MUTED, lineHeight: 1.6 }}>
          <li>Hampir sepuluh tahun belajar dan hidup di Mesir</li>
          <li>Desain grafis sejak 2017, lalu produk digital dan AI</li>
          <li>Mendirikan AIGYPT untuk mendekatkan AI kepada Masisir</li>
        </ul>
      </div>
      <div className="absolute flex items-center" style={{ left: 630, right: 80, top: 576, height: 208, borderRadius: 22, background: NIGHT, padding: "0 48px", fontFamily: SERIF, fontStyle: "italic", fontSize: 31, lineHeight: 1.45, color: GOLD }}>
        “Bagaimana kalau AI tidak hanya kita pakai, tetapi kita bentuk agar benar-benar memahami kebutuhan belajar mahasiswa Al-Azhar?”
      </div>
    </>) },

  { key: "nama", theme: "dark", note: "Nama Talqeeh dari kata Arab talqih, yang berkaitan dengan penyerbukan, proses yang membuat sesuatu tumbuh. Itulah misinya: menyuburkan pemahaman. Talqeeh bukan pengganti guru atau talaqqi, tapi alat bantu supaya yang kita pelajari tumbuh lebih kuat.",
    body: () => (<>
      <BgDark/>
      <Title dark>Kenapa namanya Talqeeh</Title>
      <Ornament size={576} style={{ position: "absolute", left: 120, top: 192 }}/>
      <Arabic style={{ position: "absolute", left: 120, top: 360, width: 576, textAlign: "center", fontSize: 140, color: "#fff" }}>تَلْقِيح</Arabic>
      <div className="absolute" style={{ left: 120, top: 600, width: 576, textAlign: "center", fontSize: 22, letterSpacing: "0.5em", color: GOLD }}>TALQĪḤ</div>
      <div className="absolute" style={{ left: 800, top: 230, right: 80 }}>
        <Kicker>Filosofi nama</Kicker>
        <div className="font-display" style={{ fontSize: 60, fontWeight: 700, color: "#fff", marginTop: 18 }}>Menyuburkan <span style={{ color: EM }}>pemahaman</span></div>
        <p style={{ fontSize: 29, color: MUTED_D, lineHeight: 1.5, marginTop: 30 }}>Talqīḥ berkaitan dengan penyerbukan: proses yang membantu sesuatu tumbuh dan berkembang.</p>
        <p style={{ fontSize: 29, color: MUTED_D, lineHeight: 1.5, marginTop: 18 }}>Talqeeh tidak menggantikan guru, kitab, atau talaqqi. Ia membantu materi sulit jadi lebih terbuka dan pertanyaan tumbuh jadi pemahaman.</p>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 30, color: GOLD, marginTop: 44 }}>Teknologi terbaik membuat manusia bisa belajar lebih baik.</p>
      </div>
    </>) },

  { key: "dua-cara", theme: "light", note: "Talqeeh punya dua cara belajar. Library adalah intinya: prompt yang sudah diracik untuk setiap maddah, sekali bayar untuk selamanya. AI Partner adalah tambahan: kamu unggah diktatmu sendiri dan AI langsung mengolahnya di dalam Talqeeh, termasuk Live Caption untuk kuliah duktur.",
    body: () => (<>
      <BgLight/>
      <Title>Satu ekosistem, dua cara belajar</Title>
      {[{ v: "lightGold", ic: "book", tag: "LIBRARY", when: "Sekali bayar · selamanya", t: "Prompt yang sudah diracik untuk tiap maddah", col: GOLD_DARK,
          st: ["Pilih maddah dan tujuan belajar", "Salin prompt sesuai fakultas & tingkatmu", "Tempel ke Claude, ChatGPT, NotebookLM"] },
        { v: "lightEm", ic: "sparkles", tag: "AI PARTNER", when: `1 bulan atau ${d.aiDays} hari`, t: "AI yang belajar langsung dari diktatmu", col: EM_DARK,
          st: ["Unggah PDF, slide, foto, atau rekaman", "Ringkasan, flashcard, kuis, i'rab, tutor", "Live Caption untuk kuliah duktur"] }].map((c, i) => (
        <Card key={c.tag} style={{ left: 80 + i * 736, top: 208, width: 704, height: 576 }}>
          <div className="flex items-center" style={{ gap: 30 }}>
            <Badge icon={c.ic} v={c.v} size={112}/>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.3em", color: c.col }}>{c.tag}</div>
              <div style={{ fontSize: 24, color: MUTED, marginTop: 6 }}>{c.when}</div>
            </div>
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, color: INK, margin: "34px 0 30px", lineHeight: 1.25 }}>{c.t}</div>
          <Steps items={c.st} color={c.col} textColor={MUTED} gap={84} size={27}/>
        </Card>
      ))}
    </>) },

  { key: "angka", theme: "dark", note: "Dalam angka: maddah dari S1 sampai Ma'had, lebih dari seribu template prompt, dan ratusan Masisir sudah memakai Talqeeh. Semua dibangun di atas 6 metode belajar berbasis riset.",
    body: () => (<>
      <BgDark/>
      <Title dark>Talqeeh dalam angka</Title>
      {[[String(d.maddah), "maddah", `${d.maddahS1} S1 semua fakultas + ${d.maddahMahad} Ma'had`],
        [d.prompts, "template prompt", "disesuaikan tingkat & gaya belajar"],
        [d.users, "Masisir", "sudah memakai Talqeeh"],
        ["6", "metode belajar", "berbasis riset, dijalankan lewat fitur"]].map(([n, l, s], i) => (
        <div key={l} className="absolute" style={{ left: 80 + i * 368, top: 290, width: 330, height: 350, borderLeft: i ? "1.5px solid rgba(255,255,255,0.2)" : "none", paddingLeft: i ? 40 : 0 }}>
          <div className="font-display tabular-nums" style={{ fontSize: 104, fontWeight: 800, lineHeight: 1, color: i === 2 ? GOLD : EM, letterSpacing: "-0.03em" }}>{n}</div>
          <div style={{ fontSize: 34, fontWeight: 700, color: "#fff", marginTop: 40 }}>{l}</div>
          <div style={{ fontSize: 26, color: MUTED_D, marginTop: 14, lineHeight: 1.4 }}>{s}</div>
        </div>
      ))}
    </>) },

  { key: "bagian-fitur", theme: "section", note: "Sekarang kita masuk ke fitur-fitur Talqeeh.",
    body: () => (<>
      <BgSection/>
      <div className="absolute font-display" style={{ left: 96, top: 230, fontSize: 104, fontWeight: 800, color: GOLD }}>02</div>
      <div className="absolute font-display" style={{ left: 96, top: 370, fontSize: 90, fontWeight: 800, color: "#fff" }}>Fitur Talqeeh</div>
      <p className="absolute" style={{ left: 96, top: 510, width: 760, margin: 0, fontSize: 32, color: MUTED_D, lineHeight: 1.4 }}>Dari prompt per maddah sampai AI yang mendengarkan kuliah duktur</p>
      <Arabic style={{ position: "absolute", left: 1050, top: 360, width: 400, textAlign: "center", fontSize: 66, color: GOLD }}>المميزات</Arabic>
    </>) },

  { key: "library", theme: "light", note: "Library berisi prompt untuk semua maddah, dibagi 6 kategori sesuai kebutuhan: memahami, menghafal, latihan, ujian, merapikan catatan talaqqi, dan eksplorasi. Ada juga bank soal imtihan, Siap Imtihan, Muqaranah 4 madzhab, Kurasah, Tool Guide, dan Learning Path.",
    body: () => (<>
      <BgLight/>
      <Title>Library: prompt siap pakai untuk setiap maddah</Title>
      {[["layers", "6 kategori prompt", "Pahami, Hafal, Latihan, Ujian, Talaqqi, Eksplorasi"],
        ["clipboard", "Bank soal & Siap Imtihan", "Soal tahriri tahun lalu, drill & mock syafawi"],
        ["scale", "Muqaranah", "Qaul ulama 4 madzhab berdampingan"],
        ["pen", "Kurasah & Companion", "Catatan pribadi di cloud, niat harian"],
        ["compass", "Tool Guide & Learning Path", "Pilih AI yang tepat, belajar AI bertahap"],
        ["mosque", "Sesuai kurikulummu", "Maddah sesuai fakultas, tingkat, jurusan"]].map(([ic, t, s], i) => (
        <div key={t} className="absolute flex" style={{ left: 80 + (i % 2) * 512, top: 216 + Math.floor(i / 2) * 192, width: 480, gap: 24 }}>
          <Badge icon={ic} v="lightGold" size={96}/>
          <div>
            <div style={{ fontSize: 29, fontWeight: 700, color: INK }}>{t}</div>
            <div style={{ fontSize: 25, color: MUTED, marginTop: 8, lineHeight: 1.4 }}>{s}</div>
          </div>
        </div>
      ))}
      <Ornament size={480} color={EM} opacity={0.35} style={{ position: "absolute", left: 1104, top: 152 }}/>
      <Device src="/presentasi/prompt.webp" alt="Contoh template prompt Nahwu" w={262} h={567} rotate={-3} style={{ left: 1196, top: 196 }}/>
    </>) },

  { key: "ai-partner", theme: "light", note: "AI Partner bekerja langsung dari materimu sendiri. Unggah diktat, slide, foto, atau rekaman. Lalu kamu bisa memahami lewat ringkasan dan i'rab, menghafal lewat flashcard berjadwal, menguji diri lewat kuis dan tahriri yang dinilai AI, dan bertanya ke tutor yang menjawab berdasarkan materimu.",
    body: () => (<>
      <BgLight/>
      <Title>AI Partner: belajar dari diktatmu sendiri</Title>
      <div className="absolute flex items-center" style={{ left: 80, right: 80, top: 208, height: 128, borderRadius: 99, background: NIGHT, padding: "0 30px", gap: 30 }}>
        <Badge icon="upload" v="darkEm" size={104}/>
        <div style={{ fontSize: 30 }}><b style={{ color: EM }}>Unggah materimu</b>&nbsp; <span style={{ color: "#fff" }}>PDF (termasuk scan), Word, slide, foto diktat, atau rekaman kuliah</span></div>
      </div>
      {[["bookOpen", "Pahami", "Ringkasan gaya kitab, peta konsep taqsimat, terjemah & i'rab, harakat"],
        ["refresh", "Hafalkan", "Flashcard dengan pengulangan terjadwal, mufradat lengkap dengan wazan"],
        ["target", "Uji diri", "Kuis, latihan tahriri dinilai AI, koreksi bahasa Arab, Arena Imtihan"],
        ["messageSquare", "Tanya", "Tutor yang menjawab dari materimu, simulasi ujian syafawi"]].map(([ic, t, s], i) => (
        <Card key={t} style={{ left: 80 + i * 368, top: 384, width: 336, height: 400 }}>
          <Badge icon={ic} size={96}/>
          <div style={{ fontSize: 34, fontWeight: 700, color: INK, marginTop: 26 }}>{t}</div>
          <div style={{ fontSize: 25, color: MUTED, marginTop: 12, lineHeight: 1.45 }}>{s}</div>
        </Card>
      ))}
    </>) },

  { key: "live-caption", theme: "dark", note: "Fitur terbaru kami: Live Caption. Taruh HP di dekat duktur, tekan rekam. Ucapan duktur muncul dalam huruf Arab, lalu terjemah Indonesianya menyusul. Bagian yang ditekankan duktur ditandai otomatis, dan setelah kuliah semuanya bisa jadi talkhisan. Ada mode Cepat dan mode Akurat untuk kelas yang ramai.",
    body: () => (<>
      <BgDark/>
      <Title dark>Live Caption: kuliah duktur langsung dipahami</Title>
      <span className="absolute" style={{ left: 80, top: 208, padding: "10px 30px", borderRadius: 99, background: GOLD, color: NIGHT, fontSize: 21, fontWeight: 700, letterSpacing: "0.2em" }}>BARU · PAKET IMTIHAN</span>
      <div className="absolute" style={{ left: 80, top: 282, fontSize: 40, fontWeight: 700, color: "#fff" }}>Nggak keburu nyatet? Tetap paham isi kuliah.</div>
      {[["mic", "Fokus mendengarkan", "Penjelasan duktur tertulis dalam huruf Arab, fushah maupun 'ammiyah."],
        ["type", "Terjemah yang mudah dipahami", "Terjemahan Indonesia menyusul dalam hitungan detik."],
        ["star", "Tahu bagian yang penting", "\"Ini keluar di imtihan\" langsung ditandai otomatis."],
        ["feather", "Jadi talkhisan siap baca", "Selesai kuliah: talkhisan rapi, flashcard, dan kuis."]].map(([ic, t, s], i) => (
        <div key={t} className="absolute flex items-center" style={{ left: 80, top: 384 + i * 106, gap: 28 }}>
          <Badge icon={ic} v="darkEm" size={84}/>
          <div>
            <div style={{ fontSize: 29, fontWeight: 700, color: "#fff" }}>{t}</div>
            <div style={{ fontSize: 25, color: MUTED_D, marginTop: 4 }}>{s}</div>
          </div>
        </div>
      ))}
      <Ornament size={590} color={EM} opacity={0.35} style={{ position: "absolute", left: 1024, top: 152 }}/>
      <Device src="/presentasi/live.webp" alt="Demo Live Caption" w={296} h={584} style={{ left: 1144, top: 186 }}/>
    </>) },

  { key: "arena", theme: "dark", note: "Supaya muraja'ah tidak membosankan, ada Arena Imtihan: game yang soalnya disusun AI dari muqarrarmu sendiri, lengkap dengan cerita, level, dan misi. Tiga dunia bisa dicoba gratis. Lalu ada Talkhis otomatis yang meringkas muqarrar dalam bahasa Arab dan siap dicetak.",
    body: () => (<>
      <BgDark/>
      <Title dark>Arena Imtihan: muraja'ah dalam bentuk game</Title>
      <Device src="/presentasi/arena.webp" alt="Arena Imtihan" w={880} h={550} style={{ left: 80, top: 208 }}/>
      <div className="absolute" style={{ left: 1040, top: 210, right: 80 }}>
        <p style={{ fontSize: 29, color: "#fff", lineHeight: 1.45, margin: 0 }}>Pilih dunia muqarrar, jelajahi petanya, dan raih syahadah di hadapan Majelis Ulama.</p>
        {[["sparkles", "Soal disusun AI dari muqarrarmu"], ["star", "Cerita AI, level, bintang, misi"], ["gamepad", "Gratis: Balaghah, Nahwu, Ushul"]].map(([ic, t]) => (
          <div key={t} className="flex items-center" style={{ gap: 22, marginTop: 26 }}>
            <Badge icon={ic} v="darkEm" size={66}/>
            <span style={{ fontSize: 26, color: MUTED_D }}>{t}</span>
          </div>
        ))}
      </div>
      <div className="absolute" style={{ left: 1040, right: 80, top: 662, padding: "22px 30px", borderRadius: 22, background: "#2A2414", border: `1.5px solid ${GOLD}` }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: GOLD }}>Talkhis otomatis</div>
        <div style={{ fontSize: 24, color: "#fff", marginTop: 6 }}>Muqarrar diringkas dalam bahasa Arab + PDF siap cetak</div>
      </div>
    </>) },

  { key: "metode", theme: "light", note: "Semua fitur ini bersandar pada enam metode belajar berbasis riset, dan bukan hanya dibaca: di beranda, Sesi Hari Ini menyusun tugas harian dari metode itu dan langsung membuka fiturnya di materimu sendiri.",
    body: () => (<>
      <BgLight/>
      <Title>Dibangun di atas metode belajar berbasis riset</Title>
      {[["refresh", "Muraja'ah Berjadwal", "Spaced repetition: flashcard diulang tepat sebelum lupa"],
        ["target", "Uji Diri", "Testing effect: mengingat lewat menjawab, bukan membaca ulang"],
        ["grid", "Belajar Selang-seling", "Interleaving: Arena campuran dari beberapa materi"],
        ["lightbulb", "Teknik Feynman", "Jelaskan ulang sebuah kaidah, tutor menilai penjelasanmu"],
        ["info", "Tanya \"Mengapa\"", "Elaborative interrogation: paham alasan, bukan hafal saja"],
        ["network", "Teks + Visual", "Dual coding: peta konsep taqsimat memperkuat ingatan"]].map(([ic, t, s], i) => (
        <Card key={t} style={{ left: 80 + (i % 3) * 488, top: 200 + Math.floor(i / 3) * 236, width: 456, height: 216, padding: 28 }}>
          <div className="flex" style={{ gap: 26 }}>
            <Badge icon={ic} size={76}/>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: INK, lineHeight: 1.2 }}>{t}</div>
              <div style={{ fontSize: 21, color: MUTED, marginTop: 8, lineHeight: 1.4 }}>{s}</div>
            </div>
          </div>
        </Card>
      ))}
      <div className="absolute" style={{ left: 80, right: 80, top: 700, fontSize: 27, color: MUTED }}><b style={{ color: GOLD_DARK }}>Sesi hari ini</b>&nbsp; Beranda menyusun tugas harian dari metode ini dan langsung membuka fitur yang tepat di materimu.</div>
    </>) },

  { key: "bagian-cara", theme: "section", note: "Bagian ketiga: bagaimana cara memakai Talqeeh.",
    body: () => (<>
      <BgSection/>
      <div className="absolute font-display" style={{ left: 96, top: 230, fontSize: 104, fontWeight: 800, color: GOLD }}>03</div>
      <div className="absolute font-display" style={{ left: 96, top: 370, fontSize: 90, fontWeight: 800, color: "#fff" }}>Cara pakai Talqeeh</div>
      <p className="absolute" style={{ left: 96, top: 510, width: 760, margin: 0, fontSize: 32, color: MUTED_D, lineHeight: 1.4 }}>Dari login pertama sampai belajar dari diktatmu sendiri</p>
      <Arabic style={{ position: "absolute", left: 1010, top: 365, width: 480, textAlign: "center", fontSize: 56, color: GOLD }}>طريقة الاستخدام</Arabic>
    </>) },

  { key: "mulai", theme: "light", note: "Memulainya mudah: masuk dengan Google, isi profil belajar supaya maddah yang muncul sesuai kurikulummu, pilih paket dan bayar lewat Mayar, lalu langsung belajar. Kalau ingin mencoba dulu, ada akun gratis.",
    body: () => (<>
      <BgLight/>
      <Title>Mulai dalam empat langkah</Title>
      <div className="absolute" style={{ left: 152, width: 1104, top: 288, borderTop: `2.5px dashed ${EM}` }}/>
      {[["user", "Masuk dengan Google", "Buka talqeeh.id, klik Masuk. Tanpa password, tanpa kode."],
        ["pen", "Isi profil belajar", "Fakultas, tingkat, jurusan, dan gaya belajar supaya maddah tepat."],
        ["crown", "Pilih paket", "Bayar lewat Mayar: QRIS, VA, atau e-wallet. Aktif otomatis."],
        ["play", "Mulai belajar", "Buka maddah dari dashboard, atau unggah diktat ke AI Partner."]].map(([ic, t, s], i) => (
        <div key={t} className="absolute" style={{ left: 80 + i * 368, top: 216, width: 330 }}>
          <Badge icon={ic} v={i === 3 ? "lightGold" : "lightEm"} size={144}/>
          <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: "0.25em", color: i === 3 ? GOLD_DARK : EM_DARK, marginTop: 28 }}>LANGKAH {i + 1}</div>
          <div style={{ fontSize: 33, fontWeight: 700, color: INK, marginTop: 8 }}>{t}</div>
          <div style={{ fontSize: 25, color: MUTED, marginTop: 10, lineHeight: 1.45 }}>{s}</div>
        </div>
      ))}
      <div className="absolute flex items-center" style={{ left: 80, right: 80, top: 680, height: 100, borderRadius: 22, background: "#E7F7EF", border: "1.5px solid #BFE9D3", padding: "0 40px", fontSize: 27, color: INK }}>
        <b style={{ color: EM_DARK }}>Belum yakin?</b>&nbsp; Akun gratis membuka Nahwu + 1 maddah pilihan dan coba AI Partner untuk 1 materi pendek.
      </div>
    </>) },

  { key: "pakai-library", theme: "light", note: "Memakai Library itu sederhana: buka maddah, pilih kategori, salin prompt, tempel ke AI favoritmu, lalu isi bagian SEBUTKAN dengan topik yang spesifik. Makin spesifik isiannya, makin tajam jawaban AI.",
    body: () => (<>
      <BgLight/>
      <Title>Memakai Library: salin, tempel, belajar</Title>
      <div className="absolute" style={{ left: 80, top: 216, width: 900 }}>
        <Steps color={GOLD_DARK} textColor={INK} gap={92} size={29} items={[
          "Buka maddah yang sedang dipelajari dari dashboard",
          "Pilih kategori: Pahami, Hafal, Latihan, Ujian, Talaqqi, Eksplorasi",
          "Klik Salin pada prompt yang sesuai",
          "Tempel ke Claude, ChatGPT, atau NotebookLM",
          "Ganti [SEBUTKAN] dengan topik spesifik, lalu kirim"]}/>
      </div>
      <div className="absolute flex items-center" style={{ left: 80, width: 944, top: 688, height: 96, borderRadius: 22, background: "#F7F0E1", border: "1.5px solid #E8D9B8", padding: "0 36px", fontSize: 26, color: INK }}>
        <b style={{ color: GOLD_DARK }}>Tips</b>&nbsp; Tulis "bab kana wa akhawatuha, Firqah 2", bukan sekadar "Nahwu".
      </div>
      <Ornament size={480} color={EM} opacity={0.35} style={{ position: "absolute", left: 1104, top: 152 }}/>
      <Device src="/presentasi/prompt.webp" alt="Prompt Nahwu dengan tombol Salin" w={262} h={567} rotate={3} style={{ left: 1196, top: 196 }}/>
    </>) },

  { key: "pakai-ai", theme: "light", note: "Untuk AI Partner: unggah materi, lalu pilih mau memahami, menghafal, menguji diri, atau bertanya. Untuk Live Caption: pilih maddah, pilih bahasa dan mode, taruh HP di dekat duktur, tandai bagian penting, dan setelah kuliah simpan jadi materi dan talkhisan. Hasil AI tetap perlu dicek dengan diktat dan penjelasan duktur.",
    body: () => (<>
      <BgLight/>
      <Title>Memakai AI Partner dan Live Caption</Title>
      {[{ ic: "sparkles", t: "AI Partner", st: ["Buka AI Partner dari Beranda", "Unggah PDF, Word, slide, foto, atau rekaman", "Pilih: Pahami, Hafalkan, Uji diri, Tanya", "Blok kalimat Arab untuk terjemah & i'rab", "Ikuti Sesi hari ini untuk muraja'ah"] },
        { ic: "mic", t: "Live Caption", st: ["Buka Live Caption, pilih maddahnya", "Pilih bahasa duktur, mode Cepat/Akurat", "Taruh HP di dekat duktur, tekan rekam", "Tekan Tandai untuk bagian penting", "Simpan jadi materi & buat talkhisan"] }].map((c, i) => (
        <Card key={c.t} style={{ left: 80 + i * 736, top: 208, width: 704, height: 472 }}>
          <div className="flex items-center" style={{ gap: 26 }}>
            <Badge icon={c.ic} size={96}/>
            <div style={{ fontSize: 38, fontWeight: 700, color: INK }}>{c.t}</div>
          </div>
          <ol style={{ margin: "26px 0 0", paddingLeft: 36, fontSize: 26, color: MUTED, lineHeight: 1.75 }}>{c.st.map(s => <li key={s}>{s}</li>)}</ol>
        </Card>
      ))}
      <div className="absolute flex items-center" style={{ left: 80, right: 80, top: 704, height: 88, borderRadius: 99, background: NIGHT, padding: "0 46px", fontSize: 26 }}>
        <b style={{ color: GOLD }}>Jatah Live Caption</b>&nbsp; <span style={{ color: "#fff" }}>8 jam per 30 hari · maksimal 3 jam per hari · mode Akurat dihitung 4×</span>
      </div>
    </>) },

  { key: "paket", theme: "light", note: "Ada tiga pilihan. Library sekali bayar untuk selamanya. Paket Imtihan: Library selamanya plus AI Partner satu termin penuh sampai imtihan, termasuk Live Caption. Dan Paket 1 bulan untuk yang ingin mencoba AI Partner dulu.",
    body: () => {
      const plans = [
        { name: "Library", price: d.libraryPrice, when: "Sekali bayar · selamanya", col: GOLD_DARK, pts: [`${d.maddah} maddah & ${d.prompts} prompt`, "Bank soal, Siap Imtihan, Muqaranah", "Arena Imtihan & coba AI 1 materi"] },
        { name: "Paket Imtihan", price: d.imtihanPrice, strike: d.imtihanNormal, when: `Library selamanya + AI Partner ${d.aiDays} hari`, best: true, pts: ["Semua isi Library", "AI Partner satu termin penuh", "Live Caption 8 jam / 30 hari", `Talkhis ${d.talkhisCap} muqarrar per paket`] },
        { name: "Paket 1 Bulan", price: d.monthlyPrice, when: "Library selamanya + AI Partner 30 hari", col: EM_DARK, pts: ["Semua isi Library", "AI Partner 30 hari", "Bisa diperpanjang per 30 hari"] },
      ].filter(p => p.price);
      const w = 456, gap = 32, x0 = (SW - (plans.length * w + (plans.length - 1) * gap)) / 2;
      return (<>
        <BgLight/>
        <Title>Pilihan paket</Title>
        {plans.map((p, i) => {
          const dark = !!p.best;
          return (
            <Card key={p.name} dark={dark} accent={dark ? EM : undefined} style={{ left: x0 + i * (w + gap), top: dark ? 188 : 212, width: w, height: dark ? 568 : 520, boxShadow: dark ? "0 16px 40px rgba(15,26,21,0.25)" : undefined }}>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 27, fontWeight: 700, color: dark ? EM : p.col }}>{p.name}</span>
                {dark && <span style={{ padding: "6px 18px", borderRadius: 99, background: EM, color: NIGHT, fontSize: 17, fontWeight: 700, letterSpacing: "0.15em" }}>PALING HEMAT</span>}
              </div>
              <div className="font-display tabular-nums" style={{ fontSize: 64, fontWeight: 800, color: dark ? "#fff" : INK, marginTop: 22, letterSpacing: "-0.02em" }}>{p.price}</div>
              {p.strike && <div style={{ fontSize: 22, color: MUTED_D, textDecoration: "line-through" }}>{p.strike}</div>}
              <div style={{ fontSize: 23, color: dark ? MUTED_D : MUTED, marginTop: 10, lineHeight: 1.4 }}>{p.when}</div>
              <ul style={{ margin: "26px 0 0", paddingLeft: 28, fontSize: 25, color: dark ? "#fff" : INK, lineHeight: 1.65 }}>{p.pts.map(t => <li key={t}>{t}</li>)}</ul>
            </Card>
          );
        })}
        <div className="absolute" style={{ left: 80, right: 80, top: 776, fontSize: 20, color: MUTED }}>{d.promoName ? `Harga event ${d.promoName}. ` : ""}Satu termin sampai imtihan ±4 bulan: Paket Imtihan lebih hemat daripada memperpanjang AI tiap bulan.</div>
      </>);
    } },

  { key: "prinsip", theme: "dark", note: "Empat pegangan kami dalam membangun Talqeeh: isi dulu baru fitur, AI sebagai tutor, privasi dihormati, dan terbuka untuk masukan. Dan yang terpenting, Talqeeh adalah alat bantu, bukan pengganti talaqqi.",
    body: () => (<>
      <BgDark/>
      <Title dark>Cara Talqeeh dibangun</Title>
      {[["bookOpen", "Isi dulu, fitur kemudian", "Maddah dan soal dikurasi mengikuti muqarrar Azhar yang benar-benar dipakai."],
        ["brain", "AI sebagai tutor", "AI Partner mengajar, mengetes, dan mengingat titik lemahmu."],
        ["shield", "Privasi dihormati", "Datamu tidak dijual dan tidak dipakai untuk iklan."],
        ["heart", "Terbuka untuk masukan", "Bug, ide, atau soal yang salah? Kabari kami."]].map(([ic, t, s], i) => (
        <div key={t} className="absolute flex" style={{ left: 80 + (i % 2) * 736, top: 216 + Math.floor(i / 2) * 208, width: 690, gap: 30 }}>
          <Badge icon={ic} v="darkGold" size={106}/>
          <div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#fff" }}>{t}</div>
            <div style={{ fontSize: 26, color: MUTED_D, marginTop: 10, lineHeight: 1.45 }}>{s}</div>
          </div>
        </div>
      ))}
      <div className="absolute flex items-center" style={{ left: 80, right: 80, top: 648, height: 136, borderRadius: 22, background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.18)", padding: "0 48px", fontFamily: SERIF, fontStyle: "italic", fontSize: 29, lineHeight: 1.45, color: GOLD }}>
        Talqeeh adalah alat bantu, bukan pengganti talaqqi dan muthala'ah. Hasil AI tetap dicek dengan kitab dan penjelasan masyaikh.
      </div>
    </>) },

  { key: "penutup", theme: "dark", note: "Itulah Talqeeh: menyuburkan pemahaman. Silakan coba di talqeeh.id, Nahwu dan satu maddah pilihan bisa dibuka gratis. Kalau ada pertanyaan atau masukan, hubungi kami lewat WhatsApp atau Instagram AIGYPT. Jazakumullahu khairan.",
    body: () => (<>
      <BgDark/>
      <img src="/assets/talqeeh-logo.png" alt="Talqeeh" className="absolute" style={{ left: 96, top: 80, width: 110 }}/>
      <Kicker style={{ position: "absolute", left: 96, top: 224 }}>Jazakumullahu khairan</Kicker>
      <div className="absolute font-display" style={{ left: 96, top: 270, width: 980, fontSize: 104, lineHeight: 1.0, fontWeight: 800, letterSpacing: "-0.03em", color: "#fff" }}>Menyuburkan<br/><span style={{ color: EM }}>pemahaman</span></div>
      <p className="absolute" style={{ left: 96, top: 545, margin: 0, fontSize: 32, color: MUTED_D }}>Coba gratis di talqeeh.id: Nahwu + 1 maddah pilihan</p>
      {[["compass", "talqeeh.id"], ["messageSquare", "WhatsApp admin: +62 813-1150-6025"], ["users", "Instagram AIGYPT: @ai.gypt"]].map(([ic, t], i) => (
        <div key={t} className="absolute flex items-center" style={{ left: 96, top: 628 + i * 56, gap: 18, fontSize: 26, color: "#fff" }}>
          <Icon name={ic} stroke={GOLD} style={{ width: 34, height: 34 }}/>{t}
        </div>
      ))}
      <Ornament size={624} style={{ position: "absolute", left: 944, top: 104 }}/>
      <Arabic style={{ position: "absolute", left: 944, top: 300, width: 624, textAlign: "center", fontSize: 150, color: "#fff" }}>تَلْقِيح</Arabic>
    </>) },
];

/* ════════ HALAMAN ════════ */
const PresentasiPage = () => {
  const settings = useAppSettings();
  const data = useMemo(() => {
    const imtihan = imtihanBundle(settings);
    const monthly = aiBundle(settings);
    const count = settings?.userCount;
    return {
      maddah: CATALOG.maddah, maddahS1: CATALOG.maddahS1, maddahMahad: CATALOG.maddahMahad, prompts: CATALOG.prompts,
      users: Number.isFinite(count) && count > 0 ? `${count.toLocaleString("id-ID")}+` : "Ratusan",
      aiDays: IMTIHAN_AI_DAYS, talkhisCap: 10, // = IMTIHAN_TALKHIS_CAP di api/ai-partner.js
      libraryPrice: LIBRARY_PRICE.replace(/\s/g, ""),
      imtihanPrice: formatRupiah(imtihan.total).replace(/\s/g, ""),
      imtihanNormal: imtihan.promo ? formatRupiah(imtihan.promo.normal).replace(/\s/g, "") : null,
      promoName: imtihan.promo && !imtihan.promo.personal ? imtihan.promo.name : "",
      monthlyPrice: monthly ? formatRupiah(monthly.total).replace(/\s/g, "") : null,
    };
  }, [settings]);
  const slides = useMemo(() => buildSlides(data), [data]);
  const total = slides.length;

  const [idx, setIdx] = useState(() => {
    const m = /[?&]s=(\d+)/.exec(window.location.hash);
    if (m) { const v = parseInt(m[1], 10) - 1; if (v >= 0 && v < total) return v; }
    try { const v = parseInt(sessionStorage.getItem(SLIDE_KEY) || "0", 10); return v >= 0 && v < total ? v : 0; } catch { return 0; }
  });
  const [notesOpen, setNotesOpen] = useState(false);
  const [view, setView] = useState({ w: window.innerWidth, h: window.innerHeight });
  const touch = useRef(null);
  const prevIdx = useRef(idx);
  const dir = idx >= prevIdx.current ? 1 : -1;
  useEffect(() => { prevIdx.current = idx; }, [idx]);
  useEffect(() => { try { sessionStorage.setItem(SLIDE_KEY, String(idx)); } catch {} }, [idx]);

  const go = useCallback((n) => setIdx(i => Math.max(0, Math.min(total - 1, typeof n === "function" ? n(i) : n))), [total]);
  const exit = useCallback(() => {
    try { if (document.fullscreenElement) document.exitFullscreen(); } catch {}
    navigate("/");
  }, []);
  const toggleFull = useCallback(() => {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen?.();
    } catch {}
  }, []);

  useEffect(() => {
    const onResize = () => setView({ w: window.innerWidth, h: window.innerHeight });
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(e.key)) { e.preventDefault(); go(i => i + 1); }
      else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(e.key)) { e.preventDefault(); go(i => i - 1); }
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(total - 1);
      else if (e.key === "Escape") { if (!document.fullscreenElement) exit(); }
      else if (e.key === "f" || e.key === "F") toggleFull();
      else if (e.key === "p" || e.key === "P") setNotesOpen(o => !o);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("resize", onResize); window.removeEventListener("keydown", onKey); document.body.style.overflow = prevOverflow; };
  }, [go, total, exit, toggleFull]);

  const onTouchStart = (e) => { const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY }; };
  const onTouchEnd = (e) => {
    const s = touch.current; touch.current = null;
    if (!s) return;
    const t = e.changedTouches[0], dx = t.clientX - s.x, dy = t.clientY - s.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(i => i + (dx < 0 ? 1 : -1));
  };

  // Panggung 1600×900 diskalakan pas ruang di antara bar atas dan (bila terbuka) panel catatan.
  const topBar = 52, notesH = notesOpen ? Math.round(view.h * 0.3) : 0;
  const availH = view.h - topBar - notesH - 12, availW = view.w - 16;
  const scale = Math.max(0.1, Math.min(availW / SW, availH / SH));
  const slide = slides[idx];
  const portrait = view.h > view.w && view.w < 760;
  const iconBtn = "w-10 h-10 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors";

  return (
    <div className="fixed inset-0 z-[200] flex flex-col select-none" style={{ background: "#030605" }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <style>{`
        @keyframes prIn { from { opacity: 0; transform: translateX(var(--dx, 30px)); } to { opacity: 1; transform: none; } }
        .pr-slide { animation: prIn .45s cubic-bezier(.16,1,.3,1) both; }
        @media (prefers-reduced-motion: reduce) { .pr-slide { animation: none !important; } }
        .pr-stage li::marker { color: currentColor; }
      `}</style>

      {/* bar atas: keluar, progres (bisa diklik), nomor slide */}
      <div className="flex items-center gap-2 px-3 md:px-5 shrink-0" style={{ height: topBar }}>
        <button onClick={exit} className={iconBtn} aria-label="Keluar dari presentasi" title="Keluar (Esc)"><Icon name="x" className="w-5 h-5"/></button>
        <div className="flex-1 flex gap-1 items-center min-w-0">
          {slides.map((s, i) => (
            <button key={s.key} onClick={() => go(i)} aria-label={"Ke slide " + (i + 1)} className="group flex-1 h-5 flex items-center">
              <span className="block w-full h-[3px] rounded-full transition-all group-hover:h-[5px]" style={{ background: i <= idx ? EM : "rgba(255,255,255,0.14)" }}/>
            </button>
          ))}
        </div>
        <button onClick={() => setNotesOpen(o => !o)} className={iconBtn} aria-label="Catatan pembicara" title="Catatan pembicara (P)"><Icon name="list" className="w-5 h-5"/></button>
        <button onClick={toggleFull} className={iconBtn + " hidden md:flex"} aria-label="Layar penuh" title="Layar penuh (F)"><Icon name="maximize" className="w-5 h-5"/></button>
        <span className="tabular-nums text-xs md:text-sm text-white/60 min-w-[3rem] text-right">{idx + 1}/{total}</span>
      </div>

      {/* panggung */}
      <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden relative">
        <div style={{ width: SW * scale, height: SH * scale, borderRadius: 14, overflow: "hidden", boxShadow: "0 10px 50px rgba(0,0,0,0.5)" }}>
          {/* Skala di lapisan luar; animasi masuk di lapisan dalam (keyframe transform tidak menimpa skala). */}
          <div style={{ width: SW, height: SH, transform: `scale(${scale})`, transformOrigin: "top left" }}>
            <div key={idx} className="pr-slide pr-stage relative overflow-hidden" lang="id" style={{ width: SW, height: SH, "--dx": dir * 30 + "px" }}>
              {slide.body()}
              <Foot dark={slide.theme !== "light"}/>
            </div>
          </div>
        </div>
        {portrait && (
          <div className="absolute left-1/2 -translate-x-1/2 top-3 rounded-full px-3.5 py-1.5 text-xs text-white/80 bg-white/10 border border-white/15 whitespace-nowrap">
            Putar HP ke mode landscape supaya lebih besar
          </div>
        )}
        {/* navigasi */}
        <div className="absolute right-3 md:right-5 bottom-3 flex gap-2">
          <button onClick={() => go(i => i - 1)} disabled={idx === 0} aria-label="Slide sebelumnya"
            className="w-11 h-11 rounded-xl border border-white/15 bg-black/40 backdrop-blur text-white flex items-center justify-center hover:bg-white/10 disabled:opacity-25 disabled:pointer-events-none">
            <Icon name="chevronLeft" className="w-5 h-5"/>
          </button>
          <button onClick={() => go(i => i + 1)} disabled={idx === total - 1} aria-label="Slide berikutnya"
            className="w-11 h-11 rounded-xl flex items-center justify-center disabled:opacity-25 disabled:pointer-events-none" style={{ background: EM, color: NIGHT }}>
            <Icon name="chevronRight" className="w-5 h-5" strokeWidth={2.2}/>
          </button>
        </div>
      </div>

      {notesOpen && (
        <div className="shrink-0 overflow-y-auto border-t px-5 md:px-10 py-4" style={{ height: notesH, borderColor: "rgba(201,168,106,0.4)", background: "#0b100e" }}>
          <div className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: GOLD }}>Catatan pembicara · slide {idx + 1}</div>
          <p className="text-white/90 leading-relaxed text-[clamp(0.95rem,1.4vw,1.15rem)]">{slide.note}</p>
          <p className="hidden md:block text-white/40 text-xs mt-3">Panah atau spasi pindah slide · F layar penuh · P catatan · Esc keluar</p>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { PresentasiPage });
