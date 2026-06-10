import React, { useState, useEffect } from 'react';

/* ── Semua 35 maddah S1 Talqeeh dengan fakultasnya ── */
const ALL_MADDAH = [
  // Qurani
  { name: "Tafsir Tahlili",        arabic: "التفسير التحليلي",      category: "qurani",   fakultas: ["ushuluddin","dirasat","dirasat-banin","quran"] },
  { name: "Tafsir Maudhu'i",       arabic: "التفسير الموضوعي",     category: "qurani",   fakultas: ["ushuluddin","dirasat"] },
  { name: "'Ulum Al-Qur'an",       arabic: "علوم القرآن",           category: "qurani",   fakultas: ["ushuluddin","dirasat","dirasat-banin","quran"] },
  { name: "Manahij Al-Mufassirin", arabic: "مناهج المفسرين",        category: "qurani",   fakultas: ["ushuluddin","dirasat"] },
  { name: "Qira'at",               arabic: "القراءات",              category: "qurani",   fakultas: ["ushuluddin","dirasat","quran"] },
  { name: "Al-Qur'an (Tahfidz & Tilawah)", arabic: "القرآن الكريم", category: "qurani",  fakultas: ["ushuluddin","dirasat","dirasat-banin","quran"] },
  { name: "Tajwid",                arabic: "التجويد",               category: "qurani",   fakultas: ["ushuluddin","dirasat","dirasat-banin","quran"] },
  // Haditsi
  { name: "Hadits Tahlili",        arabic: "الحديث التحليلي",       category: "haditsi",  fakultas: ["ushuluddin","dirasat","dirasat-banin"] },
  { name: "Hadits Maudhu'i",       arabic: "الحديث الموضوعي",      category: "haditsi",  fakultas: ["ushuluddin","dirasat"] },
  { name: "Mustholah Hadits",      arabic: "مصطلح الحديث",          category: "haditsi",  fakultas: ["ushuluddin","dirasat","dirasat-banin","syariah"] },
  { name: "Manahij Al-Muhadditsin",arabic: "مناهج المحدثين",        category: "haditsi",  fakultas: ["ushuluddin","dirasat"] },
  { name: "Takhrij Hadits",        arabic: "تخريج الحديث",          category: "haditsi",  fakultas: ["ushuluddin","dirasat"] },
  // Fiqhi
  { name: "Fiqh (Madzhabi)",       arabic: "الفقه المذهبي",         category: "fiqhi",    fakultas: ["syariah","dirasat","dirasat-banin","ushuluddin"] },
  { name: "Fiqh Muqaran",          arabic: "الفقه المقارن",         category: "fiqhi",    fakultas: ["syariah","dirasat"] },
  { name: "Ushul Fiqh",            arabic: "أصول الفقه",            category: "fiqhi",    fakultas: ["ushuluddin","syariah","dirasat","dirasat-banin"] },
  { name: "Qawa'id Fiqhiyyah",     arabic: "القواعد الفقهية",       category: "fiqhi",    fakultas: ["syariah","dirasat"] },
  { name: "Ahwal Syakhshiyah",     arabic: "الأحوال الشخصية",       category: "fiqhi",    fakultas: ["syariah","dirasat"] },
  // Aqdi
  { name: "Tauhid",                arabic: "التوحيد",               category: "aqdi",     fakultas: ["ushuluddin","syariah","dirasat","dirasat-banin","quran"] },
  { name: "'Aqidah & Firaq",       arabic: "العقيدة والفرق",        category: "aqdi",     fakultas: ["ushuluddin","dirasat"] },
  { name: "Filsafat Islam",        arabic: "الفلسفة الإسلامية",     category: "aqdi",     fakultas: ["ushuluddin","dirasat"] },
  { name: "Mantiq",                arabic: "المنطق",                category: "aqdi",     fakultas: ["ushuluddin","dirasat"] },
  { name: "Tasawwuf",              arabic: "التصوف",                category: "aqdi",     fakultas: ["ushuluddin","dirasat"] },
  // Lughawi
  { name: "Nahwu",                 arabic: "النحو",                 category: "lughawi",  fakultas: ["ushuluddin","syariah","lughah","dirasat","dirasat-banin","quran"] },
  { name: "Sharaf",                arabic: "الصرف",                 category: "lughawi",  fakultas: ["ushuluddin","syariah","lughah","dirasat","dirasat-banin","quran"] },
  { name: "Balaghah",              arabic: "البلاغة",               category: "lughawi",  fakultas: ["ushuluddin","lughah","dirasat","dirasat-banin"] },
  { name: "Adab (Sastra Arab)",    arabic: "الأدب العربي",          category: "lughawi",  fakultas: ["lughah","dirasat"] },
  { name: "'Arudh wal Qawafi",     arabic: "العروض والقوافي",       category: "lughawi",  fakultas: ["lughah","dirasat"] },
  { name: "Fiqh Al-Lughah",       arabic: "فقه اللغة",             category: "lughawi",  fakultas: ["lughah","dirasat"] },
  { name: "Naqd Adabi",            arabic: "النقد الأدبي",          category: "lughawi",  fakultas: ["lughah","dirasat"] },
  // Tarikhi
  { name: "Sirah Nabawiyah",       arabic: "السيرة النبوية",        category: "tarikhi",  fakultas: ["ushuluddin","syariah","dirasat","dirasat-banin","quran"] },
  { name: "Tarikh Tasyri'",        arabic: "تاريخ التشريع",         category: "tarikhi",  fakultas: ["syariah","dirasat","dirasat-banin","ushuluddin"] },
  { name: "Tarikh Islam",          arabic: "التاريخ الإسلامي",      category: "tarikhi",  fakultas: ["lughah","dirasat","dirasat-banin","ushuluddin"] },
  { name: "Hadharah Islamiyyah",   arabic: "الحضارة الإسلامية",     category: "tarikhi",  fakultas: ["lughah","dirasat"] },
  { name: "Dakwah & I'lam",        arabic: "الدعوة والإعلام",       category: "tarikhi",  fakultas: ["dirasat","ushuluddin"] },
  { name: "Adyan (Perbandingan Agama)", arabic: "الأديان والمذاهب", category: "tarikhi",  fakultas: ["ushuluddin","dirasat"] },
];

const KATEGORI = [
  { id: "qurani",  label: "Quran & Tafsir",         color: "#a78bfa" },
  { id: "haditsi", label: "Hadits & Mustholah",      color: "#a78bfa" },
  { id: "fiqhi",   label: "Fiqh & Ushul",            color: "#fbbf24" },
  { id: "aqdi",    label: "Aqidah & Pemikiran",       color: "#a78bfa" },
  { id: "lughawi", label: "Lughah Arabiyah",          color: "#fbbf24" },
  { id: "tarikhi", label: "Tarikh & Dakwah",          color: "#a78bfa" },
];

const FAKULTAS_LIST = [
  { id: "ushuluddin",    label: "Ushuluddin",                  short: "Ushul" },
  { id: "syariah",       label: "Syariah wal Qanun",           short: "Syariah" },
  { id: "lughah",        label: "Lughah 'Arabiyah",            short: "Lughah" },
  { id: "dirasat",       label: "Dirasat Islamiyah (Banat)",   short: "Banat" },
  { id: "dirasat-banin", label: "Dirasat Islamiyah (Banin)",   short: "Banin" },
  { id: "quran",         label: "Al-Qur'an Al-Karim",          short: "Qur'an" },
];

const TAHUN_LIST = ["2025/2026", "2024/2025", "2023/2024"];
const FASHL_LIST = [
  { value: "awwal", label: "Fashl Awwal" },
  { value: "tsani", label: "Fashl Tsani" },
];

const EM  = "#3ecf8e";
const RED = "#f87171";

export default function ChecklistSoalPage() {
  const [approved, setApproved]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [aktivFakultas, setAktivFakultas]   = useState("ushuluddin");
  const [aktivTahun, setAktivTahun]         = useState("2025/2026");
  const [filterKategori, setFilterKategori] = useState("");
  const [search, setSearch]                 = useState("");

  useEffect(() => {
    fetch("/api/config")
      .then(r => r.json())
      .then(({ supabaseUrl, supabaseAnonKey }) => {
        if (!supabaseUrl) { setLoading(false); return; }
        return fetch(
          `${supabaseUrl}/rest/v1/bank_soal?status=eq.approved&select=maddah_nama,fakultas,tahun,fashl&limit=500`,
          { headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` } }
        );
      })
      .then(r => r?.json())
      .then(data => { if (Array.isArray(data)) setApproved(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const isAvailable = (maddahName, tahun, fashl) =>
    approved.some(s =>
      s.maddah_nama === maddahName &&
      s.tahun === tahun &&
      s.fashl === fashl
    );

  const maddahFakultas = ALL_MADDAH.filter(m =>
    m.fakultas.includes(aktivFakultas) &&
    (filterKategori === "" || m.category === filterKategori) &&
    (search === "" || m.name.toLowerCase().includes(search.toLowerCase()))
  );

  const totalSlot  = maddahFakultas.length * FASHL_LIST.length;
  const filledSlot = maddahFakultas.reduce((acc, m) =>
    acc + FASHL_LIST.filter(f => isAvailable(m.name, aktivTahun, f.value)).length, 0
  );
  const pct = totalSlot > 0 ? Math.round((filledSlot / totalSlot) * 100) : 0;

  const faktultasAktifData = FAKULTAS_LIST.find(f => f.id === aktivFakultas);

  return (
    <div style={{ minHeight: "100vh", background: "#0c0c0c", paddingBottom: 80 }}>

      {/* ── Header ── */}
      <div style={{
        padding: "40px 24px 28px", textAlign: "center",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "linear-gradient(to bottom, rgba(62,207,142,0.05), transparent)",
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: EM, marginBottom: 10 }}>
          STATUS BANK SOAL
        </div>
        <h1 style={{
          fontSize: "clamp(22px,4vw,34px)", fontWeight: 800,
          color: "#fff", margin: "0 0 8px",
          fontFamily: '"DM Sans",sans-serif',
        }}>
          Maddah Mana yang Belum Ada Soalnya?
        </h1>
        <p style={{ fontSize: 14, color: "#888", margin: "0 auto 0", maxWidth: 500, lineHeight: 1.6 }}>
          35 maddah S1 Al-Azhar · Cek yang belum ada &amp; submit untuk dapat reward!
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>

        {/* ── Tab Fakultas ── */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {FAKULTAS_LIST.map(f => {
            const total  = ALL_MADDAH.filter(m => m.fakultas.includes(f.id)).length * 2;
            const filled = ALL_MADDAH
              .filter(m => m.fakultas.includes(f.id))
              .reduce((acc, m) => acc + FASHL_LIST.filter(fashl => isAvailable(m.name, aktivTahun, fashl.value)).length, 0);
            const isActive = aktivFakultas === f.id;
            return (
              <button
                key={f.id}
                onClick={() => { setAktivFakultas(f.id); setFilterKategori(""); setSearch(""); }}
                style={{
                  padding: "8px 14px", borderRadius: 10, fontSize: 12,
                  fontWeight: isActive ? 700 : 500, cursor: "pointer",
                  border: isActive ? "1px solid rgba(62,207,142,0.5)" : "1px solid rgba(255,255,255,0.1)",
                  background: isActive ? "rgba(62,207,142,0.12)" : "rgba(255,255,255,0.03)",
                  color: isActive ? EM : "#888",
                  transition: "all 0.15s",
                }}
              >
                {f.short}
                <span style={{
                  marginLeft: 6, fontSize: 10,
                  color: isActive ? EM : "#555",
                  background: isActive ? "rgba(62,207,142,0.15)" : "rgba(255,255,255,0.06)",
                  padding: "1px 6px", borderRadius: 99,
                }}>
                  {filled}/{total}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Tab Tahun ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          {TAHUN_LIST.map(t => (
            <button key={t} onClick={() => setAktivTahun(t)} style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 12,
              fontWeight: aktivTahun === t ? 700 : 400, cursor: "pointer",
              border: aktivTahun === t ? "1px solid rgba(255,200,50,0.5)" : "1px solid rgba(255,255,255,0.08)",
              background: aktivTahun === t ? "rgba(255,200,50,0.1)" : "rgba(255,255,255,0.02)",
              color: aktivTahun === t ? "#ffc832" : "#666",
            }}>{t}</button>
          ))}

          {/* Search */}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari maddah..."
            style={{
              marginLeft: "auto", padding: "6px 12px", borderRadius: 8,
              fontSize: 12, border: "1px solid rgba(255,255,255,0.1)",
              background: "#1a1a1a", color: "#fff", width: 160,
              outline: "none",
            }}
          />
        </div>

        {/* ── Filter Kategori ── */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
          <button
            onClick={() => setFilterKategori("")}
            style={{
              padding: "4px 12px", borderRadius: 99, fontSize: 11,
              fontWeight: filterKategori === "" ? 700 : 400, cursor: "pointer",
              border: filterKategori === "" ? `1px solid ${EM}` : "1px solid rgba(255,255,255,0.08)",
              background: filterKategori === "" ? "rgba(62,207,142,0.1)" : "transparent",
              color: filterKategori === "" ? EM : "#666",
            }}
          >Semua</button>
          {KATEGORI.map(k => (
            <button key={k.id} onClick={() => setFilterKategori(k.id)} style={{
              padding: "4px 12px", borderRadius: 99, fontSize: 11,
              fontWeight: filterKategori === k.id ? 700 : 400, cursor: "pointer",
              border: filterKategori === k.id ? `1px solid ${k.color}` : "1px solid rgba(255,255,255,0.08)",
              background: filterKategori === k.id ? `${k.color}18` : "transparent",
              color: filterKategori === k.id ? k.color : "#666",
            }}>{k.label}</button>
          ))}
        </div>

        {/* ── Progress bar ── */}
        {!loading && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "#666" }}>
                {faktultasAktifData?.label} · {aktivTahun}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: pct === 100 ? EM : "#fff" }}>
                {filledSlot}/{totalSlot} slot ({pct}%)
              </span>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 99,
                width: `${pct}%`,
                background: pct === 100 ? EM : `linear-gradient(90deg, ${EM}, #ffc832)`,
                transition: "width 0.6s ease",
              }}/>
            </div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>
              {totalSlot - filledSlot > 0
                ? `🎯 ${totalSlot - filledSlot} slot belum ada — submit & dapat reward!`
                : "✅ Semua slot untuk filter ini sudah terisi!"}
            </div>
          </div>
        )}

        {/* ── Grid Checklist ── */}
        {loading ? (
          <div style={{ textAlign: "center", color: "#555", padding: 48 }}>Memuat data...</div>
        ) : maddahFakultas.length === 0 ? (
          <div style={{ textAlign: "center", color: "#555", padding: 48 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
            Tidak ada maddah untuk filter ini.
          </div>
        ) : (
          <div
            className="checklist-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 12,
            }}
          >
            {maddahFakultas.map(maddah => {
              const kategori = KATEGORI.find(k => k.id === maddah.category);
              const awwalAda = isAvailable(maddah.name, aktivTahun, "awwal");
              const tsaniAda = isAvailable(maddah.name, aktivTahun, "tsani");
              const allDone  = awwalAda && tsaniAda;
              const noneDone = !awwalAda && !tsaniAda;

              return (
                <div key={maddah.name} style={{
                  background: "#111",
                  border: allDone
                    ? "1px solid rgba(62,207,142,0.25)"
                    : noneDone
                    ? "1px solid rgba(248,113,113,0.15)"
                    : "1px solid rgba(255,200,50,0.2)",
                  borderRadius: 14,
                  padding: "14px 16px",
                  transition: "all 0.15s",
                }}>
                  {/* Header card */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                        color: kategori?.color || "#888",
                        marginBottom: 5, textTransform: "uppercase",
                      }}>
                        {kategori?.label}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.3, marginBottom: 3 }}>
                        {maddah.name}
                      </div>
                      <div style={{
                        fontSize: 13, color: "#666",
                        fontFamily: '"Scheherazade New","Noto Naskh Arabic",serif',
                        direction: "rtl", textAlign: "right",
                      }}>
                        {maddah.arabic}
                      </div>
                    </div>

                    {/* Status icon */}
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginLeft: 10,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14,
                      background: allDone
                        ? "rgba(62,207,142,0.15)"
                        : noneDone
                        ? "rgba(248,113,113,0.1)"
                        : "rgba(255,200,50,0.1)",
                    }}>
                      {allDone ? "✓" : noneDone ? "✕" : "◐"}
                    </div>
                  </div>

                  {/* Fashl rows */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {FASHL_LIST.map(fashl => {
                      const ada = isAvailable(maddah.name, aktivTahun, fashl.value);
                      return (
                        <div key={fashl.value} style={{
                          display: "flex", alignItems: "center",
                          justifyContent: "space-between",
                          padding: "7px 10px", borderRadius: 8,
                          background: ada ? "rgba(62,207,142,0.07)" : "rgba(248,113,113,0.05)",
                          border: ada ? "1px solid rgba(62,207,142,0.18)" : "1px solid rgba(248,113,113,0.12)",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{
                              width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 11, fontWeight: 800,
                              background: ada ? "rgba(62,207,142,0.2)" : "rgba(248,113,113,0.15)",
                              color: ada ? EM : RED,
                            }}>
                              {ada ? "✓" : "✕"}
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: ada ? "#ccc" : "#777" }}>
                              {fashl.label}
                            </span>
                          </div>
                          <span style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                            padding: "2px 7px", borderRadius: 99,
                            background: ada ? "rgba(62,207,142,0.12)" : "rgba(248,113,113,0.08)",
                            color: ada ? EM : RED,
                          }}>
                            {ada ? "TERSEDIA" : "KOSONG"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA atau done badge */}
                  {allDone ? (
                    <div style={{
                      marginTop: 10, padding: "6px", borderRadius: 8,
                      textAlign: "center", fontSize: 11, fontWeight: 700,
                      color: EM, background: "rgba(62,207,142,0.06)",
                      border: "1px solid rgba(62,207,142,0.15)",
                    }}>
                      ✅ Lengkap — jazakumullah khayran!
                    </div>
                  ) : (
                    <a href="#/submit-soal" style={{
                      display: "block", marginTop: 10, padding: "7px",
                      borderRadius: 8, textAlign: "center", textDecoration: "none",
                      fontSize: 12, fontWeight: 700, color: "#ffc832",
                      background: "rgba(255,200,50,0.06)",
                      border: "1px solid rgba(255,200,50,0.15)",
                    }}>
                      📸 Submit Soal → Dapat Reward
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Legend ── */}
        <div style={{ marginTop: 28, display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[
            { icon: "✓", color: EM,        bg: "rgba(62,207,142,0.15)",    label: "Soal tersedia" },
            { icon: "✕", color: RED,       bg: "rgba(248,113,113,0.12)",   label: "Belum ada — bisa kamu submit!" },
            { icon: "◐", color: "#ffc832", bg: "rgba(255,200,50,0.1)",     label: "Sebagian tersedia" },
          ].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                width: 18, height: 18, borderRadius: 5,
                background: l.bg, color: l.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800,
              }}>{l.icon}</span>
              <span style={{ fontSize: 12, color: "#777" }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* ── CTA submit ── */}
        <div style={{
          marginTop: 32, padding: "24px 28px",
          background: "rgba(255,200,50,0.05)",
          border: "1px solid rgba(255,200,50,0.15)",
          borderRadius: 16,
          display: "flex", justifyContent: "space-between",
          alignItems: "center", gap: 16, flexWrap: "wrap",
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
              Punya soal imtihan tahun lalu?
            </div>
            <div style={{ fontSize: 13, color: "#888" }}>
              Submit soal yang belum ada di checklist ini — dapat akses Talqeeh lifetime atau voucher makan Rp 50.000
            </div>
          </div>
          <a href="#/submit-soal" style={{
            padding: "11px 24px", borderRadius: 11,
            background: "#ffc832", color: "#000",
            fontWeight: 800, fontSize: 14, textDecoration: "none",
            whiteSpace: "nowrap", flexShrink: 0,
          }}>
            📸 Submit Sekarang →
          </a>
        </div>

      </div>

      <style>{`
        @media (max-width: 600px) {
          .checklist-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

window.ChecklistSoalPage = ChecklistSoalPage;
