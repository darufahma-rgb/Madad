import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
/* Talqeeh — Presentasi publik (/presentasi): cerita, fitur, dan cara pakai Talqeeh dalam bentuk slide.
   Tiap slide dirancang di panggung tetap 1600×900 lalu diskalakan pas layar, jadi tampilannya sama di proyektor,
   laptop, maupun HP (landscape). Motif: pola khatam (bintang 8), ritme slide gelap–terang, badge bintang.
   Animasi: tiap elemen slide masuk bergiliran (diulang setiap slide dibuka), angka menghitung naik, demo Live Caption
   hidup, ornamen berputar pelan. Semua mati bila pengguna memilih "kurangi gerakan".
   Angka & harga dibaca dari data situs (CATALOG, useAppSettings, imtihanBundle) supaya tidak basi. */

const SW = 1600, SH = 900;
const SLIDE_KEY = "talqeeh_presentasi_slide";
const EM = "#3ECF8E", EM_DARK = "#12895A", GOLD = "#C9A86A", GOLD_DARK = "#9A7633";
const INK = "#0F1A15", MUTED = "#55635C", MUTED_D = "#A9B5AF", NIGHT = "#07110D";
const ARABIC = '"Noto Naskh Arabic", "Amiri", "Traditional Arabic", serif';
const SERIF = 'Georgia, "Times New Roman", serif';
const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Elemen langsung di panggung masuk bergiliran: jeda per urutan anak (anak pertama = latar, tidak dianimasikan).
const STAGGER_CSS = Array.from({ length: 40 }, (_, i) => `.pr-stage > :nth-child(${i + 2}) { animation-delay: ${120 + i * 85}ms; }`).join("\n");
const ANIM_CSS = `
  @keyframes prIn { from { opacity: 0; transform: translateX(var(--dx, 30px)); } to { opacity: 1; transform: none; } }
  @keyframes prUp { from { opacity: 0; translate: 0 28px; } to { opacity: 1; translate: 0 0; } }
  @keyframes prPop { from { opacity: 0; translate: 0 18px; scale: .96; } to { opacity: 1; translate: 0 0; scale: 1; } }
  @keyframes prDraw { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  @keyframes prSpin { to { rotate: 360deg; } }
  @keyframes prFloat { 0%, 100% { translate: 0 0; } 50% { translate: 0 -12px; } }
  @keyframes prShine { from { background-position: 0% 50%; } to { background-position: 200% 50%; } }
  @keyframes prWave { 0%, 100% { transform: scaleY(.35); } 50% { transform: scaleY(1); } }
  @keyframes prPulse { 0%, 100% { opacity: .45; } 50% { opacity: 1; } }
  .pr-slide { animation: prIn .45s cubic-bezier(.16,1,.3,1) both; }
  .pr-stage > :not(.pr-bg) { animation: prUp .75s cubic-bezier(.16,1,.3,1) both; }
  .pr-stage > .pr-draw { animation: prDraw 1.4s cubic-bezier(.65,0,.35,1) both; transform-origin: left center; }
  ${STAGGER_CSS}
  .pr-pop { animation: prPop .6s cubic-bezier(.16,1,.3,1) both; }
  .pr-spin { animation: prSpin 90s linear infinite; transform-origin: center; }
  .pr-float { animation: prFloat 6s ease-in-out infinite; }
  .pr-shine { background: linear-gradient(90deg, ${EM}, #8FE6BD, ${GOLD}, #8FE6BD, ${EM}); background-size: 200% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: prShine 6s linear infinite; }
  .pr-wave { animation: prWave 1s ease-in-out infinite; transform-origin: bottom; }
  .pr-pulse { animation: prPulse 1.6s ease-in-out infinite; }
  .pr-stage li::marker { color: currentColor; }
  @media (prefers-reduced-motion: reduce) { .pr-slide, .pr-stage, .pr-stage * { animation: none !important; } }
`;

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

/* ── Latar (kelas pr-bg: tidak ikut animasi masuk) ── */
const BgDark = () => (
  <div className="pr-bg absolute inset-0" style={{ background: `radial-gradient(60% 70% at 12% 8%, rgba(62,207,142,0.22), transparent 70%), radial-gradient(55% 60% at 92% 96%, rgba(201,168,106,0.13), transparent 70%), ${NIGHT}` }}>
    <div className="absolute inset-0" style={{ backgroundImage: patternUri("#FFFFFF", 0.05), WebkitMaskImage: "radial-gradient(ellipse at center, transparent 25%, #000 85%)", maskImage: "radial-gradient(ellipse at center, transparent 25%, #000 85%)" }}/>
  </div>
);
const BgLight = () => (
  <div className="pr-bg absolute inset-0" style={{ background: "#FFFFFF" }}>
    <div className="absolute inset-0" style={{ backgroundImage: patternUri(EM_DARK, 0.09, 110), WebkitMaskImage: "radial-gradient(65% 65% at 100% 0%, #000, transparent)", maskImage: "radial-gradient(65% 65% at 100% 0%, #000, transparent)" }}/>
  </div>
);
const BgSection = () => (
  <div className="pr-bg absolute inset-0" style={{ background: `radial-gradient(45% 55% at 78% 45%, rgba(62,207,142,0.18), transparent 70%), linear-gradient(135deg, #0E3B29 0%, #08190F 60%, ${NIGHT} 100%)` }}>
    <div className="absolute inset-0" style={{ backgroundImage: patternUri("#FFFFFF", 0.045) }}/>
    <svg className="absolute pr-spin" style={{ left: 892, top: 59, overflow: "visible" }} width={716} height={716} viewBox="0 0 716 716" aria-hidden="true">
      <polygon points={starPts(358, 358, 358)} fill="none" stroke={GOLD} strokeOpacity="0.35" strokeWidth="2.5"/>
      <polygon points={starPts(358, 358, 275, 275 * 0.77, 0)} fill="none" stroke={GOLD} strokeOpacity="0.2" strokeWidth="1.7"/>
      <polygon points={starPts(358, 358, 192)} fill="none" stroke={EM} strokeOpacity="0.25" strokeWidth="1.7"/>
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
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon name={icon} strokeWidth={1.9} stroke={c.icon} style={{ width: size * 0.46, height: size * 0.46 }}/>
      </div>
    </div>
  );
};
// Ornamen khatam yang berputar pelan; posisi di pembungkus supaya animasi masuk & putaran tidak bertabrakan.
const Ornament = ({ size, color = GOLD, opacity = 0.55, left, top }) => (
  <div className="absolute" style={{ left, top, width: size, height: size }}>
    <svg viewBox="0 0 256 256" width={size} height={size} className="pr-spin" aria-hidden="true">
      <polygon points={starPts(128, 128, 120)} fill="none" stroke={color} strokeOpacity={opacity} strokeWidth="5"/>
      <polygon points={starPts(128, 128, 70, 70 * 0.77, 0)} fill={color} fillOpacity={opacity}/>
    </svg>
  </div>
);
// Tangkapan layar dalam bingkai perangkat yang melayang pelan.
const Device = ({ src, w, h, rotate = 0, left, top, alt }) => (
  <div className="absolute" style={{ left, top }}>
    <div className="pr-float">
      <div style={{ width: w + 26, height: h + 26, padding: 13, borderRadius: 30, background: "#040806", border: "1.5px solid #2B3A33", boxShadow: "0 24px 60px rgba(0,0,0,0.45)", transform: `rotate(${rotate}deg)` }}>
        <img src={src} alt={alt} draggable="false" style={{ width: w, height: h, borderRadius: 18, display: "block", objectFit: "cover", objectPosition: "top" }}/>
      </div>
    </div>
  </div>
);
const Kicker = ({ children, color = GOLD, style }) => (
  <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color, ...style }}>{children}</div>
);
const Title = ({ children, dark, sub }) => (
  <div className="absolute" style={{ left: 80, top: 58, right: 80 }}>
    <h2 className="font-display" style={{ margin: 0, fontSize: 60, lineHeight: 1.08, fontWeight: 700, letterSpacing: "-0.015em", color: dark ? "#fff" : INK }}>{children}</h2>
    {sub && <div style={{ fontSize: 27, marginTop: 10, color: dark ? MUTED_D : MUTED }}>{sub}</div>}
  </div>
);
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
const Steps = ({ items, color, textColor, gap = 92, size = 30, delay = 0 }) => (
  <div>
    {items.map((t, i) => (
      <div key={i} className="flex items-center pr-pop" style={{ height: gap - 30, marginBottom: 30, gap: 26, animationDelay: `${delay + i * 140}ms` }}>
        <span className="shrink-0 flex items-center justify-center font-bold" style={{ width: 62, height: 62, borderRadius: 99, fontSize: 24, color, border: `2px solid ${color}`, background: color + "22" }}>{i + 1}</span>
        <span style={{ fontSize: size, color: textColor, lineHeight: 1.3 }}>{t}</span>
      </div>
    ))}
  </div>
);
const Arabic = ({ children, style }) => <div dir="rtl" lang="ar" style={{ fontFamily: ARABIC, lineHeight: 1.4, ...style }}>{children}</div>;

// Angka yang menghitung naik dari 0 ("1.250+" → 0…1.250 lalu "+"). Teks non-angka ditampilkan apa adanya.
const CountUp = ({ value, delay = 300, duration = 1400 }) => {
  const m = /^([\d.]+)(.*)$/.exec(String(value));
  const target = m ? parseInt(m[1].replace(/\./g, ""), 10) : null;
  const [n, setN] = useState(() => (target == null || reducedMotion() ? target : 0));
  useEffect(() => {
    if (target == null || reducedMotion()) return;
    let raf, t0;
    const tick = (t) => {
      if (!t0) t0 = t;
      const p = Math.min(1, Math.max(0, (t - t0 - delay) / duration));
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, delay, duration]);
  if (target == null) return <>{value}</>;
  return <>{n.toLocaleString("id-ID")}{m[2]}</>;
};

// QR dari matriks 0/1 di seminar-qr.jsx (offline, tanpa layanan luar). Gelap di atas terang supaya terbaca kamera.
const Qr = ({ id = "beranda", size }) => {
  const q = window.SEMINAR_QR?.[id];
  if (!q) return null;
  const n = q.size;
  let d = "";
  q.rows.forEach((row, y) => {
    for (let x = 0; x < n;) {
      if (row[x] === "1") { let w = 1; while (x + w < n && row[x + w] === "1") w++; d += `M${x} ${y}h${w}v1h-${w}z`; x += w; } else x++;
    }
  });
  return (
    <svg viewBox={`-2 -2 ${n + 4} ${n + 4}`} width={size} height={size} role="img" aria-label={`QR code ${q.url}`} shapeRendering="crispEdges" style={{ background: "#fff", borderRadius: 18, display: "block" }}>
      <path d={d} fill={NIGHT}/>
    </svg>
  );
};

/* Demo Live Caption hidup (isi diringkas dari hasil asli Live Caption, kuliah Ushul Fiqh bab qiyas). */
const LIVE_DEMO = [
  { t: "0:12", ar: "القياس في اللغة هو التقدير، يعني تقدير شيء بشيء.", id: "Qiyas secara bahasa artinya mengukur sesuatu dengan sesuatu yang lain.", istilah: [["التَّقْدِير", "mengukur"]] },
  { t: "0:24", ar: "وفي الاصطلاح: إلحاق فرع بأصل في حكم لعلة جامعة بينهما.", id: "Secara istilah: menyamakan far' dengan ashl dalam hukum karena 'illat yang sama.", istilah: [["فَرْع", "kasus baru"], ["عِلَّة", "sebab hukum"]] },
  { t: "0:36", ar: "ركزوا معايا هنا، الأركان الأربعة دي هتيجي في الامتحان أكيد.", id: "Fokus di sini, empat rukun ini pasti keluar di ujian. Catat ya.", penting: true },
];
const LivePhone = ({ left, top }) => (
  <div className="absolute" style={{ left, top }}>
    <div className="pr-float">
      <div style={{ width: 400, height: 690, borderRadius: 44, padding: 14, background: "#040806", border: "1.5px solid #2B3A33", boxShadow: "0 30px 70px rgba(0,0,0,0.55)" }}>
        <div className="flex flex-col" style={{ height: "100%", borderRadius: 32, background: "#0f1311", padding: "22px 18px 16px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
            <span className="flex items-center" style={{ gap: 6, fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", color: EM }}><Icon name="mic" stroke={EM} style={{ width: 15, height: 15 }}/>LIVE CAPTION</span>
            <span style={{ fontSize: 12, color: MUTED_D }}>Ushul Fiqh · Qiyas</span>
          </div>
          <div className="flex-1 flex flex-col" style={{ gap: 12 }}>
            {LIVE_DEMO.map((s, i) => (
              <div key={s.t} className="pr-pop" style={{ animationDelay: `${900 + i * 1500}ms`, borderRadius: 18, padding: "12px 14px", background: s.penting ? "rgba(201,168,106,0.09)" : "rgba(255,255,255,0.035)", border: `1px solid ${s.penting ? "rgba(201,168,106,0.55)" : "rgba(255,255,255,0.09)"}` }}>
                <div style={{ fontSize: 11, color: MUTED_D }}>{s.t}{s.penting && <span style={{ color: GOLD, marginLeft: 8 }}>★ Ditekankan duktur</span>}</div>
                <Arabic style={{ fontSize: 19, color: "#fff", textAlign: "right", marginTop: 2 }}>{s.ar}</Arabic>
                <div style={{ fontSize: 15, lineHeight: 1.35, color: "#A7EBC9", marginTop: 6 }}>{s.id}</div>
                {s.istilah && (
                  <div className="flex flex-wrap" style={{ gap: 6, marginTop: 8 }}>
                    {s.istilah.map(([ar, arti]) => (
                      <span key={ar} className="inline-flex items-center" style={{ gap: 6, padding: "3px 8px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", fontSize: 12, color: MUTED_D }}>
                        <span dir="rtl" style={{ fontFamily: ARABIC, fontSize: 15, color: "#fff" }}>{ar}</span>{arti}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center" style={{ gap: 12, marginTop: 12, padding: "10px 14px", borderRadius: 18, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <span className="flex items-end" style={{ gap: 4, height: 22 }} aria-hidden="true">
              {[0, 0.25, 0.5, 0.15, 0.35].map((d, i) => <span key={i} className="pr-wave" style={{ width: 4, height: 22, borderRadius: 4, background: EM, animationDelay: `${d}s` }}/>)}
            </span>
            <span className="pr-pulse" style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Mendengarkan…</span>
            <span style={{ marginLeft: "auto", padding: "5px 10px", borderRadius: 10, border: "1px solid rgba(201,168,106,0.4)", fontSize: 13, color: "#E9D7AE" }}>Tandai</span>
            <span className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 99, background: "#f0715a", boxShadow: "0 0 0 5px rgba(240,113,90,0.18)" }}><span style={{ width: 13, height: 13, borderRadius: 3, background: "#fff" }}/></span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ════════ SLIDE ════════ */
const buildSlides = (d) => [
  { key: "pembuka", theme: "dark", note: "Assalamu'alaikum. Coba bayangkan muqarrar setebal apa pun bisa kamu pahami tanpa begadang menerjemahkan kata per kata. Itulah Talqeeh. Saya Daru, mahasiswa S2 Al-Azhar, dan hari ini saya tunjukkan bagaimana Talqeeh mengubah cara Masisir belajar.",
    body: () => (<>
      <BgDark/>
      <img src="/assets/talqeeh-logo.png" alt="Talqeeh" className="absolute" style={{ left: 96, top: 76, width: 104 }}/>
      <Kicker style={{ position: "absolute", left: 96, top: 214 }}>Teman belajar Masisir</Kicker>
      <h1 className="absolute font-display" style={{ left: 96, top: 262, width: 960, margin: 0, fontSize: 100, lineHeight: 1.02, fontWeight: 800, letterSpacing: "-0.03em", color: "#fff" }}>
        Muqarrar tebal?<br/><span className="pr-shine">Kini terasa ringan.</span>
      </h1>
      <p className="absolute" style={{ left: 96, top: 500, width: 800, margin: 0, fontSize: 32, lineHeight: 1.45, color: MUTED_D }}>AI pertama yang dibentuk khusus untuk cara Al-Azhar mengajar dan menguji, dari Ma'had sampai S2.</p>
      <div className="absolute flex items-center" style={{ left: 96, top: 660, gap: 18 }}>
        <span style={{ padding: "14px 30px", borderRadius: 14, background: EM, color: NIGHT, fontSize: 26, fontWeight: 700 }}>talqeeh.id</span>
        <span style={{ fontSize: 23, color: GOLD }}>{d.users === "Ratusan" ? "Sudah dipakai ratusan Masisir" : `Sudah dipakai ${d.users} Masisir`}</span>
      </div>
      <Ornament size={740} left={920} top={56}/>
      <Device src="/presentasi/hero.webp" alt="Beranda talqeeh.id" w={336} h={727} rotate={4} left={1120} top={72}/>
    </>) },

  { key: "masalah", theme: "light", note: "Kita semua pernah di sini. Diktat ratusan halaman, imtihan tinggal beberapa minggu. Istilah yang sudah diterjemahkan tapi maknanya tetap gelap. Duktur bicara cepat dalam 'ammiyah. Dan ketika bertanya ke AI umum, jawabannya bukan cara Azhar. Masalahnya bukan kita kurang rajin, tapi alatnya belum dibuat untuk kita.",
    body: () => (<>
      <BgLight/>
      <Title>Kita semua pernah di sini</Title>
      {[["bookOpen", "Diktat ratusan halaman", "Imtihan tinggal hitungan minggu, sementara bab pertama saja belum tuntas."],
        ["type", "Diterjemahkan, tapi tetap gelap", "Kata-katanya sudah paham, maksud istilahnya belum juga."],
        ["mic", "Duktur bicara secepat kilat", "'Ammiyah bercampur fushah. Catatan selalu tertinggal satu kalimat."],
        ["cpu", "AI umum, jawaban umum", "ChatGPT tidak tahu cara Azhar mengajar, apalagi cara Azhar menguji."]].map(([ic, t, s], i) => (
        <div key={t} className="absolute" style={{ left: 80 + i * 368, top: 200, width: 330 }}>
          <div className="flex items-center justify-between">
            <span className="font-display" style={{ fontSize: 66, fontWeight: 800, color: i === 3 ? GOLD_DARK : EM_DARK }}>0{i + 1}</span>
            <Badge icon={ic} v={i === 3 ? "lightGold" : "lightEm"} size={100}/>
          </div>
          <div style={{ fontSize: 31, fontWeight: 700, color: INK, marginTop: 24, lineHeight: 1.2 }}>{t}</div>
          <div style={{ fontSize: 25, color: MUTED, marginTop: 14, lineHeight: 1.45 }}>{s}</div>
        </div>
      ))}
      <div className="absolute flex items-center" style={{ left: 80, right: 80, top: 610, height: 136, borderRadius: 22, background: NIGHT, padding: "0 48px", fontSize: 34 }}>
        <span style={{ color: "#fff" }}>Masalahnya bukan kamu kurang rajin.&nbsp;</span><b style={{ color: EM }}>Alatnya yang belum dibuat untukmu.</b>
      </div>
    </>) },

  { key: "founder", theme: "light", note: "Talqeeh dibangun oleh orang yang pernah merasakannya. Hampir sepuluh tahun saya di Mesir, dengan diktat yang sama tebalnya dan malam yang sama panjangnya. Dari desain, lalu teknologi dan AI, muncul satu pertanyaan yang tidak bisa saya lepaskan: bagaimana kalau AI kita bentuk agar benar-benar memahami cara belajar mahasiswa Al-Azhar?",
    body: () => (<>
      <BgLight/>
      <Title>Dibangun oleh yang pernah merasakannya</Title>
      <img src="/daru-fahmaa.webp" alt="Daru Fahmaa Muliawan" className="absolute" style={{ left: 80, top: 208, width: 461, height: 576, objectFit: "cover", objectPosition: "top", borderRadius: 18 }}/>
      <Ornament size={150} left={455} top={700}/>
      <div className="absolute" style={{ left: 630, top: 208, right: 80 }}>
        <Kicker color={GOLD_DARK}>Founder Talqeeh</Kicker>
        <div className="font-display" style={{ fontSize: 50, fontWeight: 700, color: INK, marginTop: 16 }}>Daru Fahmaa Muliawan</div>
        <div style={{ fontSize: 26, color: EM_DARK, marginTop: 10 }}>Mahasiswa S2 Al-Azhar, Fakultas Fiqh 'Amm · Pendiri komunitas AIGYPT</div>
        <ul style={{ margin: "26px 0 0", paddingLeft: 30, fontSize: 28, color: MUTED, lineHeight: 1.6 }}>
          <li>Hampir sepuluh tahun belajar dan hidup di Mesir</li>
          <li>Desainer sejak 2017, kini membangun produk AI</li>
          <li>Mendekatkan AI kepada Masisir lewat AIGYPT</li>
        </ul>
      </div>
      <div className="absolute flex items-center" style={{ left: 630, right: 80, top: 576, height: 208, borderRadius: 22, background: NIGHT, padding: "0 48px", fontFamily: SERIF, fontStyle: "italic", fontSize: 31, lineHeight: 1.45, color: GOLD }}>
        “Bagaimana kalau AI tidak hanya kita pakai, tetapi kita bentuk agar benar-benar memahami cara belajar mahasiswa Al-Azhar?”
      </div>
    </>) },

  { key: "nama", theme: "dark", note: "Namanya Talqeeh, dari kata Arab talqih: penyerbukan, proses yang membuat sesuatu tumbuh dan berbuah. Itulah misinya: menyuburkan pemahaman. Talqeeh tidak menggantikan duktur, kitab, atau talaqqi. Ia membuat apa yang kamu pelajari tumbuh lebih cepat dan lebih kuat.",
    body: () => (<>
      <BgDark/>
      <Title dark>Satu kata, satu misi</Title>
      <Ornament size={576} left={120} top={192}/>
      <Arabic style={{ position: "absolute", left: 120, top: 360, width: 576, textAlign: "center", fontSize: 140, color: "#fff" }}>تَلْقِيح</Arabic>
      <div className="absolute" style={{ left: 120, top: 600, width: 576, textAlign: "center", fontSize: 22, letterSpacing: "0.5em", color: GOLD }}>TALQĪḤ</div>
      <div className="absolute" style={{ left: 800, top: 222, right: 80 }}>
        <Kicker>Filosofi nama</Kicker>
        <div className="font-display" style={{ fontSize: 64, fontWeight: 800, color: "#fff", marginTop: 18, lineHeight: 1.05 }}>Menyuburkan <span className="pr-shine">pemahaman</span></div>
        <p style={{ fontSize: 29, color: MUTED_D, lineHeight: 1.5, marginTop: 30 }}>Talqīḥ berarti penyerbukan: proses yang membuat sesuatu tumbuh dan berbuah.</p>
        <p style={{ fontSize: 29, color: MUTED_D, lineHeight: 1.5, marginTop: 18 }}>Talqeeh tidak menggantikan duktur, kitab, atau talaqqi. Ia membuat ilmu yang kamu pelajari tumbuh lebih cepat dan berakar lebih kuat.</p>
      </div>
      <p className="absolute" style={{ left: 800, right: 80, top: 690, margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 31, color: GOLD }}>Teknologi terbaik membuat manusia belajar lebih baik.</p>
    </>) },

  { key: "dua-cara", theme: "light", note: "Talqeeh punya dua jalan menuju paham. Library: prompt racikan untuk setiap maddah, sekali bayar untuk selamanya. Dan AI Partner: kamu cukup unggah diktatmu, AI yang membaca, merangkum, menguji, bahkan mendengarkan kuliah duktur bersamamu.",
    body: () => (<>
      <BgLight/>
      <Title>Dua jalan menuju paham</Title>
      {[{ v: "lightGold", ic: "book", tag: "LIBRARY", when: "Sekali bayar · selamanya", t: "Prompt racikan untuk setiap maddah", col: GOLD_DARK,
          st: ["Pilih maddah dan tujuan belajarmu", "Salin prompt yang sudah menyesuaikan tingkatmu", "Tempel ke Claude, ChatGPT, atau NotebookLM"] },
        { v: "lightEm", ic: "sparkles", tag: "AI PARTNER", when: `1 bulan atau ${d.aiDays} hari`, t: "AI yang membaca diktatmu sendiri", col: EM_DARK,
          st: ["Unggah PDF, slide, foto, atau rekaman", "Ringkasan, flashcard, kuis, i'rab, tutor", "Live Caption mendengarkan kuliah bersamamu"] }].map((c, i) => (
        <Card key={c.tag} style={{ left: 80 + i * 736, top: 208, width: 704, height: 576 }}>
          <div className="flex items-center" style={{ gap: 30 }}>
            <Badge icon={c.ic} v={c.v} size={112}/>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.3em", color: c.col }}>{c.tag}</div>
              <div style={{ fontSize: 24, color: MUTED, marginTop: 6 }}>{c.when}</div>
            </div>
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: INK, margin: "34px 0 30px", lineHeight: 1.2 }}>{c.t}</div>
          <Steps items={c.st} color={c.col} textColor={MUTED} gap={84} size={27} delay={500 + i * 250}/>
        </Card>
      ))}
    </>) },

  { key: "angka", theme: "dark", note: "Dan ini bukan janji. Semua maddah dari Ma'had sampai S1, lebih dari seribu prompt yang sudah diracik, dan ratusan Masisir yang sudah memakainya, dibangun di atas enam metode belajar yang terbukti secara riset.",
    body: () => (<>
      <BgDark/>
      <Title dark>Bukan janji. Ini angkanya.</Title>
      {[[String(d.maddah), "maddah", `${d.maddahS1} S1 semua fakultas + ${d.maddahMahad} Ma'had`],
        [d.prompts, "prompt racikan", "siap pakai per maddah, tingkat, dan tujuan"],
        [d.users, "Masisir", "sudah belajar bersama Talqeeh"],
        ["6", "metode belajar", "berbasis riset, langsung jadi fitur"]].map(([n, l, s], i) => (
        <div key={l} className="absolute" style={{ left: 80 + i * 368, top: 280, width: 330, height: 360, borderLeft: i ? "1.5px solid rgba(255,255,255,0.2)" : "none", paddingLeft: i ? 40 : 0 }}>
          <div className="font-display tabular-nums" style={{ fontSize: 104, fontWeight: 800, lineHeight: 1, color: i === 2 ? GOLD : EM, letterSpacing: "-0.03em" }}><CountUp value={n} delay={300 + i * 150}/></div>
          <div style={{ fontSize: 34, fontWeight: 700, color: "#fff", marginTop: 40 }}>{l}</div>
          <div style={{ fontSize: 26, color: MUTED_D, marginTop: 14, lineHeight: 1.4 }}>{s}</div>
        </div>
      ))}
    </>) },

  { key: "bagian-fitur", theme: "section", note: "Sekarang, mari kita lihat apa saja yang bisa dilakukan Talqeeh.",
    body: () => (<>
      <BgSection/>
      <div className="absolute font-display" style={{ left: 96, top: 230, fontSize: 104, fontWeight: 800, color: GOLD }}>02</div>
      <div className="absolute font-display" style={{ left: 96, top: 370, fontSize: 86, fontWeight: 800, color: "#fff", lineHeight: 1.05 }}>Lihat apa yang<br/>bisa dilakukan</div>
      <p className="absolute" style={{ left: 96, top: 570, width: 760, margin: 0, fontSize: 32, color: MUTED_D, lineHeight: 1.4 }}>Dari prompt per maddah sampai AI yang ikut mendengarkan kuliah duktur.</p>
      <Arabic style={{ position: "absolute", left: 1050, top: 360, width: 400, textAlign: "center", fontSize: 66, color: GOLD }}>المميزات</Arabic>
    </>) },

  { key: "library", theme: "light", note: "Library adalah jantung Talqeeh. Setiap maddah punya prompt yang sudah diracik: untuk memahami, menghafal, latihan, sampai simulasi ujian. Ditambah bank soal imtihan tahun lalu, perbandingan pendapat empat madzhab, dan catatan pribadi yang tersimpan di cloud. Kamu tinggal salin, tempel, dan belajar.",
    body: () => (<>
      <BgLight/>
      <Title>Library: semua maddah, satu tempat</Title>
      {[["layers", "6 jenis prompt per maddah", "Pahami, Hafal, Latihan, Ujian, Talaqqi, Eksplorasi"],
        ["clipboard", "Bank soal imtihan", "Soal tahriri tahun lalu, drill, dan mock syafawi"],
        ["scale", "Muqaranah 4 madzhab", "Qaul ulama berdampingan, sekali lihat"],
        ["pen", "Kurasah & Companion", "Catatan pribadi di cloud dan niat harian"],
        ["compass", "Tool Guide & Learning Path", "Tahu AI mana untuk tugas apa"],
        ["mosque", "Sesuai kurikulummu", "Muncul sesuai fakultas, tingkat, dan jurusan"]].map(([ic, t, s], i) => (
        <div key={t} className="absolute flex" style={{ left: 80 + (i % 2) * 512, top: 210 + Math.floor(i / 2) * 192, width: 480, gap: 24 }}>
          <Badge icon={ic} v="lightGold" size={96}/>
          <div>
            <div style={{ fontSize: 29, fontWeight: 700, color: INK }}>{t}</div>
            <div style={{ fontSize: 25, color: MUTED, marginTop: 8, lineHeight: 1.4 }}>{s}</div>
          </div>
        </div>
      ))}
      <Ornament size={480} color={EM} opacity={0.35} left={1104} top={152}/>
      <Device src="/presentasi/prompt.webp" alt="Contoh template prompt Nahwu" w={262} h={567} rotate={-3} left={1196} top={196}/>
    </>) },

  { key: "ai-partner", theme: "light", note: "Lalu AI Partner. Unggah diktatmu, bahkan yang hasil scan atau foto, dan biarkan AI bekerja. Ia merangkum gaya kitab, membuat peta konsep, menyiapkan flashcard yang muncul tepat sebelum kamu lupa, menguji dengan soal tahriri, dan menjawab pertanyaanmu berdasarkan materimu sendiri.",
    body: () => (<>
      <BgLight/>
      <Title>Unggah diktatmu. Sisanya, biar AI.</Title>
      <div className="absolute flex items-center" style={{ left: 80, right: 80, top: 208, height: 128, borderRadius: 99, background: NIGHT, padding: "0 30px", gap: 30 }}>
        <Badge icon="upload" v="darkEm" size={104}/>
        <div style={{ fontSize: 30 }}><b style={{ color: EM }}>PDF, scan, Word, slide, foto, rekaman</b>&nbsp; <span style={{ color: "#fff" }}>semua bisa, termasuk teks Arab</span></div>
      </div>
      {[["bookOpen", "Pahami", "Ringkasan gaya kitab, peta konsep taqsimat, terjemah & i'rab sekali klik"],
        ["refresh", "Hafalkan", "Flashcard yang muncul tepat sebelum kamu lupa, lengkap dengan wazan"],
        ["target", "Uji diri", "Kuis dan tahriri yang dinilai AI, termasuk koreksi bahasa Arabmu"],
        ["messageSquare", "Tanya", "Tutor yang menjawab dari materimu, plus simulasi ujian syafawi"]].map(([ic, t, s], i) => (
        <Card key={t} style={{ left: 80 + i * 368, top: 384, width: 336, height: 400 }}>
          <Badge icon={ic} size={96}/>
          <div style={{ fontSize: 34, fontWeight: 700, color: INK, marginTop: 26 }}>{t}</div>
          <div style={{ fontSize: 25, color: MUTED, marginTop: 12, lineHeight: 1.45 }}>{s}</div>
        </Card>
      ))}
    </>) },

  { key: "live-caption", theme: "dark", note: "Dan ini yang paling sering membuat Masisir terdiam: Live Caption. Taruh HP di dekat duktur dan tekan rekam. Ucapannya muncul dalam huruf Arab, lalu terjemah Indonesianya menyusul dalam hitungan detik. Saat duktur bilang ini keluar di imtihan, bagian itu langsung ditandai. Dan setelah kuliah, semuanya jadi talkhisan siap baca.",
    body: () => (<>
      <BgDark/>
      <Title dark>Duktur bicara. Kamu langsung paham.</Title>
      <span className="absolute" style={{ left: 80, top: 200, padding: "10px 30px", borderRadius: 99, background: GOLD, color: NIGHT, fontSize: 21, fontWeight: 700, letterSpacing: "0.2em" }}>BARU · LIVE CAPTION</span>
      <div className="absolute" style={{ left: 80, top: 270, width: 940, fontSize: 38, fontWeight: 700, color: "#fff" }}>Nggak keburu nyatet? Tetap paham.</div>
      {[["mic", "Fokus mendengarkan", "Ucapan duktur langsung tertulis, fushah maupun 'ammiyah."],
        ["type", "Terjemah dalam hitungan detik", "Bahasa Indonesia yang mudah, istilah sulit dijelaskan."],
        ["star", "Tahu mana yang keluar di imtihan", "Saat duktur menekankan sesuatu, langsung ditandai."],
        ["feather", "Pulang kuliah, talkhisan sudah jadi", "Rapi, siap dibaca, bisa dibuat flashcard dan kuis."]].map(([ic, t, s], i) => (
        <div key={t} className="absolute flex items-center" style={{ left: 80, top: 360 + i * 110, gap: 28, width: 960 }}>
          <Badge icon={ic} v="darkEm" size={84}/>
          <div>
            <div style={{ fontSize: 29, fontWeight: 700, color: "#fff" }}>{t}</div>
            <div style={{ fontSize: 24, color: MUTED_D, marginTop: 4 }}>{s}</div>
          </div>
        </div>
      ))}
      <Ornament size={600} color={EM} opacity={0.3} left={1000} top={150}/>
      <LivePhone left={1100} top={165}/>
    </>) },

  { key: "arena", theme: "dark", note: "Muraja'ah tidak harus membosankan. Di Arena Imtihan, muqarrarmu sendiri berubah jadi game: soal disusun AI dari isi diktatmu, lengkap dengan cerita, level, dan bintang. Tiga dunia bisa langsung dicoba gratis. Dan Talkhis otomatis meringkas muqarrar dalam bahasa Arab, siap dicetak.",
    body: () => (<>
      <BgDark/>
      <Title dark>Muraja'ah yang bikin nagih</Title>
      <Device src="/presentasi/arena.webp" alt="Arena Imtihan" w={880} h={550} left={80} top={208}/>
      <div className="absolute" style={{ left: 1040, top: 210, right: 80 }}>
        <p style={{ fontSize: 29, color: "#fff", lineHeight: 1.45, margin: 0 }}>Muqarrarmu berubah jadi petualangan. Raih syahadah di hadapan Majelis Ulama.</p>
        {[["sparkles", "Soal disusun AI dari diktatmu"], ["star", "Cerita, level, bintang, misi"], ["gamepad", "3 dunia gratis untuk dicoba"]].map(([ic, t], i) => (
          <div key={t} className="flex items-center pr-pop" style={{ gap: 22, marginTop: 26, animationDelay: `${600 + i * 160}ms` }}>
            <Badge icon={ic} v="darkEm" size={66}/>
            <span style={{ fontSize: 26, color: MUTED_D }}>{t}</span>
          </div>
        ))}
      </div>
      <div className="absolute" style={{ left: 1040, right: 80, top: 662, padding: "22px 30px", borderRadius: 22, background: "#2A2414", border: `1.5px solid ${GOLD}` }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: GOLD }}>Talkhis otomatis</div>
        <div style={{ fontSize: 24, color: "#fff", marginTop: 6 }}>Muqarrar diringkas dalam bahasa Arab, siap cetak</div>
      </div>
    </>) },

  { key: "metode", theme: "light", note: "Yang membuat Talqeeh berbeda: semua fitur ini bersandar pada sains belajar. Enam metode yang terbukti lewat riset, dan bukan sekadar teori: setiap hari, beranda menyusun Sesi Hari Ini yang langsung membuka fitur yang tepat di materimu.",
    body: () => (<>
      <BgLight/>
      <Title>Bukan sekadar AI. Ini sains belajar.</Title>
      {[["refresh", "Muraja'ah Berjadwal", "Diulang tepat sebelum lupa (spaced repetition)"],
        ["target", "Uji Diri", "Mengingat lewat menjawab, bukan membaca ulang"],
        ["grid", "Belajar Selang-seling", "Arena campuran dari beberapa materi"],
        ["lightbulb", "Teknik Feynman", "Jelaskan ulang, tutor menilai pemahamanmu"],
        ["info", "Tanya \"Mengapa\"", "Paham alasan kaidah, bukan hafal saja"],
        ["network", "Teks + Visual", "Peta konsep taqsimat memperkuat ingatan"]].map(([ic, t, s], i) => (
        <Card key={t} style={{ left: 80 + (i % 3) * 488, top: 200 + Math.floor(i / 3) * 236, width: 456, height: 216, padding: 28 }}>
          <div className="flex" style={{ gap: 26 }}>
            <Badge icon={ic} size={76}/>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: INK, lineHeight: 1.2 }}>{t}</div>
              <div style={{ fontSize: 22, color: MUTED, marginTop: 8, lineHeight: 1.4 }}>{s}</div>
            </div>
          </div>
        </Card>
      ))}
      <div className="absolute" style={{ left: 80, right: 80, top: 700, fontSize: 27, color: MUTED }}><b style={{ color: GOLD_DARK }}>Sesi Hari Ini</b>&nbsp; Setiap hari, beranda menyusun tugas belajarmu dari metode ini, lalu membukanya langsung di materimu.</div>
    </>) },

  { key: "bagian-cara", theme: "section", note: "Dan semua itu bisa kamu mulai dalam lima menit.",
    body: () => (<>
      <BgSection/>
      <div className="absolute font-display" style={{ left: 96, top: 230, fontSize: 104, fontWeight: 800, color: GOLD }}>03</div>
      <div className="absolute font-display" style={{ left: 96, top: 370, fontSize: 86, fontWeight: 800, color: "#fff", lineHeight: 1.05 }}>Mulai dalam<br/>lima menit</div>
      <p className="absolute" style={{ left: 96, top: 570, width: 760, margin: 0, fontSize: 32, color: MUTED_D, lineHeight: 1.4 }}>Dari login pertama sampai belajar dari diktatmu sendiri.</p>
      <Arabic style={{ position: "absolute", left: 1010, top: 365, width: 480, textAlign: "center", fontSize: 56, color: GOLD }}>طريقة الاستخدام</Arabic>
    </>) },

  { key: "mulai", theme: "light", note: "Caranya sangat sederhana. Masuk dengan akun Google, isi profil belajar supaya maddah yang muncul sesuai kurikulummu, pilih paket dan bayar lewat QRIS atau e-wallet, lalu langsung belajar. Dan kalau ingin mencoba dulu, akun gratis sudah membuka Nahwu dan satu maddah pilihan.",
    body: () => (<>
      <BgLight/>
      <Title>Empat langkah, lima menit</Title>
      <div className="absolute pr-draw" style={{ left: 152, width: 1104, top: 288, borderTop: `2.5px dashed ${EM}` }}/>
      {[["user", "Masuk dengan Google", "Satu klik. Tanpa password, tanpa kode."],
        ["pen", "Isi profil belajar", "Fakultas dan tingkatmu, supaya maddahnya pas."],
        ["crown", "Pilih paket", "QRIS, VA, atau e-wallet. Langsung aktif."],
        ["play", "Mulai belajar", "Buka maddah, atau unggah diktat pertamamu."]].map(([ic, t, s], i) => (
        <div key={t} className="absolute" style={{ left: 80 + i * 368, top: 216, width: 330 }}>
          <Badge icon={ic} v={i === 3 ? "lightGold" : "lightEm"} size={144}/>
          <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: "0.25em", color: i === 3 ? GOLD_DARK : EM_DARK, marginTop: 28 }}>LANGKAH {i + 1}</div>
          <div style={{ fontSize: 33, fontWeight: 700, color: INK, marginTop: 8 }}>{t}</div>
          <div style={{ fontSize: 25, color: MUTED, marginTop: 10, lineHeight: 1.45 }}>{s}</div>
        </div>
      ))}
      <div className="absolute flex items-center" style={{ left: 80, right: 80, top: 680, height: 100, borderRadius: 22, background: "#E7F7EF", border: "1.5px solid #BFE9D3", padding: "0 40px", fontSize: 27, color: INK }}>
        <b style={{ color: EM_DARK }}>Gratis untuk mulai:</b>&nbsp; Nahwu + 1 maddah pilihan, dan coba AI Partner untuk 1 materi.
      </div>
    </>) },

  { key: "pakai-library", theme: "light", note: "Memakai Library semudah salin dan tempel. Buka maddah, pilih kategori, salin prompt, tempel ke AI favoritmu, lalu isi topiknya. Satu tips kecil yang hasilnya besar: makin spesifik topik yang kamu tulis, makin tajam jawaban AI.",
    body: () => (<>
      <BgLight/>
      <Title>Salin. Tempel. Paham.</Title>
      <div className="absolute" style={{ left: 80, top: 210, width: 900 }}>
        <Steps color={GOLD_DARK} textColor={INK} gap={92} size={29} delay={250} items={[
          "Buka maddah yang sedang kamu pelajari",
          "Pilih tujuan: Pahami, Hafal, Latihan, Ujian, Talaqqi, Eksplorasi",
          "Klik Salin pada prompt yang pas",
          "Tempel ke Claude, ChatGPT, atau NotebookLM",
          "Isi [SEBUTKAN] dengan topikmu, lalu kirim"]}/>
      </div>
      <div className="absolute flex items-center" style={{ left: 80, width: 944, top: 688, height: 96, borderRadius: 22, background: "#F7F0E1", border: "1.5px solid #E8D9B8", padding: "0 36px", fontSize: 26, color: INK }}>
        <b style={{ color: GOLD_DARK }}>Rahasia kecil:</b>&nbsp; tulis "bab kana wa akhawatuha, Firqah 2", bukan sekadar "Nahwu".
      </div>
      <Ornament size={480} color={EM} opacity={0.35} left={1104} top={152}/>
      <Device src="/presentasi/prompt.webp" alt="Prompt Nahwu dengan tombol Salin" w={262} h={567} rotate={3} left={1196} top={196}/>
    </>) },

  { key: "pakai-ai", theme: "light", note: "Untuk AI Partner: unggah materi, lalu pilih mau memahami, menghafal, menguji diri, atau bertanya. Untuk Live Caption: pilih maddah, taruh HP di dekat duktur, tekan rekam, tandai bagian penting, dan setelah kuliah simpan jadi materi dan talkhisan. Tetap cek hasil AI dengan diktat dan penjelasan duktur, karena AI adalah teman belajar, bukan pengganti guru.",
    body: () => (<>
      <BgLight/>
      <Title>Dari diktat ke talkhisan, tanpa ribet</Title>
      {[{ ic: "sparkles", t: "AI Partner", st: ["Buka AI Partner dari Beranda", "Unggah PDF, Word, slide, foto, atau rekaman", "Pilih: Pahami, Hafalkan, Uji diri, Tanya", "Blok kalimat Arab untuk terjemah & i'rab", "Ikuti Sesi Hari Ini untuk muraja'ah"] },
        { ic: "mic", t: "Live Caption", st: ["Buka Live Caption, pilih maddahnya", "Pilih mode Cepat, atau Akurat untuk kelas ramai", "Taruh HP di dekat duktur, tekan rekam", "Tekan Tandai untuk bagian penting", "Simpan jadi materi & buat talkhisan"] }].map((c, i) => (
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

  { key: "paket", theme: "light", note: "Pilihannya sederhana. Library sekali bayar untuk selamanya. Paket Imtihan, yang paling banyak dipilih, membuka Library selamanya plus AI Partner untuk satu termin penuh sampai imtihan. Hitung per hari, harganya lebih murah dari segelas teh di kantin. Atau mulai dari Paket 1 Bulan kalau ingin mencoba dulu.",
    body: () => {
      const plans = [
        { name: "Library", price: d.libraryPrice, when: "Sekali bayar · selamanya", col: GOLD_DARK, pts: [`${d.maddah} maddah & ${d.prompts} prompt`, "Bank soal, Siap Imtihan, Muqaranah", "Arena Imtihan & coba AI 1 materi"] },
        { name: "Paket Imtihan", price: d.imtihanPrice, strike: d.imtihanNormal, when: `Library selamanya + AI Partner ${d.aiDays} hari`, best: true, pts: ["Semua isi Library", "AI Partner satu termin penuh", "Live Caption 8 jam / 30 hari", `Talkhis ${d.talkhisCap} muqarrar per paket`] },
        { name: "Paket 1 Bulan", price: d.monthlyPrice, when: "Library selamanya + AI Partner 30 hari", col: EM_DARK, pts: ["Semua isi Library", "AI Partner 30 hari", "Bisa diperpanjang per 30 hari"] },
      ].filter(p => p.price);
      const w = 456, gap = 32, x0 = (SW - (plans.length * w + (plans.length - 1) * gap)) / 2;
      return (<>
        <BgLight/>
        <Title>Satu termin, sekali bayar, paham sampai imtihan</Title>
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
              <div style={{ fontSize: 23, color: dark ? MUTED_D : MUTED, marginTop: 10, lineHeight: 1.4 }}>{dark ? `Hanya ±${d.imtihanPerDay} per hari selama satu termin` : p.when}</div>
              <ul style={{ margin: "26px 0 0", paddingLeft: 28, fontSize: 25, color: dark ? "#fff" : INK, lineHeight: 1.65 }}>{p.pts.map(t => <li key={t}>{t}</li>)}</ul>
            </Card>
          );
        })}
        <div className="absolute" style={{ left: 80, right: 80, top: 776, fontSize: 20, color: MUTED }}>{d.promoName ? `Harga event ${d.promoName}. ` : ""}Paket Imtihan = Library selamanya + AI Partner {d.aiDays} hari. Satu termin sampai imtihan ±4 bulan, jadi jauh lebih hemat daripada memperpanjang tiap bulan.</div>
      </>);
    } },

  { key: "prinsip", theme: "dark", note: "Dan ini janji kami. Isi lebih dulu daripada fitur. AI yang mengajar, bukan sekadar menjawab. Data yang tidak dijual. Dan telinga yang selalu terbuka untuk masukan. Karena pada akhirnya, Talqeeh adalah alat bantu, bukan pengganti talaqqi.",
    body: () => (<>
      <BgDark/>
      <Title dark>Janji kami kepadamu</Title>
      {[["bookOpen", "Isi dulu, fitur kemudian", "Maddah dan soal dikurasi dari muqarrar Azhar yang benar-benar dipakai."],
        ["brain", "AI yang mengajar", "Bukan sekadar menjawab: mengajar, menguji, dan mengingat titik lemahmu."],
        ["shield", "Privasimu dijaga", "Datamu tidak dijual dan tidak dipakai untuk iklan."],
        ["heart", "Selalu mendengar", "Bug, ide, atau soal yang keliru? Kabari kami, kami perbaiki."]].map(([ic, t, s], i) => (
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

  { key: "penutup", theme: "dark", note: "Muqarrar tidak akan berubah, tebalnya tetap sama. Tapi cara kamu memahaminya bisa berubah, mulai hari ini. Scan QR ini atau buka talqeeh.id, dan coba gratis sekarang juga. Jazakumullahu khairan.",
    body: () => (<>
      <BgDark/>
      <img src="/assets/talqeeh-logo.png" alt="Talqeeh" className="absolute" style={{ left: 96, top: 76, width: 104 }}/>
      <Kicker style={{ position: "absolute", left: 96, top: 214 }}>Jazakumullahu khairan</Kicker>
      <div className="absolute font-display" style={{ left: 96, top: 262, width: 900, fontSize: 62, lineHeight: 1.1, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff" }}>
        Muqarrarnya tetap sama.<br/><span className="pr-shine">Caramu memahaminya, tidak.</span>
      </div>
      <p className="absolute" style={{ left: 96, top: 440, width: 820, margin: 0, fontSize: 31, color: MUTED_D, lineHeight: 1.45 }}>Coba gratis hari ini: Nahwu + 1 maddah pilihan, dan AI Partner untuk 1 materi.</p>
      {[["compass", "talqeeh.id"], ["messageSquare", "WhatsApp admin: +62 813-1150-6025"], ["users", "Instagram AIGYPT: @ai.gypt"]].map(([ic, t], i) => (
        <div key={t} className="absolute flex items-center" style={{ left: 96, top: 610 + i * 56, gap: 18, fontSize: 26, color: "#fff" }}>
          <Icon name={ic} stroke={GOLD} style={{ width: 34, height: 34 }}/>{t}
        </div>
      ))}
      <Ornament size={600} left={980} top={110}/>
      <div className="absolute flex flex-col items-center" style={{ left: 1130, top: 250, width: 300 }}>
        <div style={{ padding: 14, borderRadius: 26, background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}><Qr size={272}/></div>
        <div style={{ marginTop: 22, fontSize: 25, fontWeight: 700, color: "#fff" }}>Scan & coba gratis</div>
        <div style={{ marginTop: 4, fontSize: 21, color: GOLD }}>talqeeh.id</div>
      </div>
    </>) },
];

/* ════════ HALAMAN ════════ */
const PresentasiPage = () => {
  const settings = useAppSettings();
  const data = useMemo(() => {
    const imtihan = imtihanBundle(settings);
    const monthly = aiBundle(settings);
    const count = settings?.userCount;
    const compact = (v) => formatRupiah(v).replace(/\s/g, "");
    return {
      maddah: CATALOG.maddah, maddahS1: CATALOG.maddahS1, maddahMahad: CATALOG.maddahMahad, prompts: CATALOG.prompts,
      users: Number.isFinite(count) && count > 0 ? `${count.toLocaleString("id-ID")}+` : "Ratusan",
      aiDays: IMTIHAN_AI_DAYS, talkhisCap: 10, // = IMTIHAN_TALKHIS_CAP di api/ai-partner.js
      libraryPrice: LIBRARY_PRICE.replace(/\s/g, ""),
      imtihanPrice: compact(imtihan.total),
      imtihanPerDay: compact(Math.ceil(imtihan.total / IMTIHAN_AI_DAYS / 100) * 100),
      imtihanNormal: imtihan.promo ? compact(imtihan.promo.normal) : null,
      promoName: imtihan.promo && !imtihan.promo.personal ? imtihan.promo.name : "",
      monthlyPrice: monthly ? compact(monthly.total) : null,
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
      <style>{ANIM_CSS}</style>

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
            <div key={idx} className="pr-slide relative overflow-hidden" style={{ width: SW, height: SH, "--dx": dir * 30 + "px" }}>
              <div className="pr-stage absolute inset-0" lang="id">
                {slide.body()}
                <Foot dark={slide.theme !== "light"}/>
              </div>
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
            <Icon name="chevronRight" stroke={NIGHT} className="w-5 h-5" strokeWidth={2.2}/>
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
