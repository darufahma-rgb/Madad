import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
/* Talqih — Onboarding (faculty · level · major conditional · S2 maddah) */

const S2SetupStep = ({ profile, onSave }) => {
  const [maddahList, setMaddahList] = useState(
    (profile.s2Maddah || []).filter(m => !m.isPreset).length > 0
      ? profile.s2Maddah.filter(m => !m.isPreset)
      : [{ nama: "", kitab: "", id: Date.now() }]
  );

  const addMaddah = () => {
    if (maddahList.length >= 7) return;
    setMaddahList(prev => [...prev, { nama: "", kitab: "", id: Date.now() + Math.random() }]);
  };

  const updateMaddah = (id, field, value) => {
    setMaddahList(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeMaddah = (id) => {
    if (maddahList.length <= 1) return;
    setMaddahList(prev => prev.filter(m => m.id !== id));
  };

  const handleNext = () => {
    const validMaddah = maddahList.filter(m => m.nama.trim());
    const withManahij = [
      { nama: "Manahij Bahts Ilmi", kitab: "مناهج البحث العلمي", id: "manahij", isPreset: true },
      ...validMaddah,
    ];
    onSave(withManahij);
  };

  return (
    <div className="max-w-2xl mx-auto w-full pt-4">
      <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">Langkah tambahan — S2</div>
      <div className="arabic-classic text-gold-300 text-2xl mb-2" style={{direction:"rtl"}}>
        مَوَادُّ الدِّرَاسَةِ
      </div>
      <h2 className="font-display text-3xl font-semibold text-ink mb-2">
        Maddah S2-mu
      </h2>
      <p className="text-ink-muted mb-8 leading-relaxed">
        Masukkan maddah yang sedang kamu ambil semester ini.
        Tambahkan kitab yang dipakai — ini yang bikin AI langsung paham konteksnya.
      </p>

      {/* Manahij Bahts Ilmi — preset */}
      <div className="card-glass p-4 mb-3 border border-gold-500/20">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] bg-gold-500/15 text-gold-300 px-2 py-0.5 rounded border border-gold-500/20">
            Otomatis — wajib semua jurusan
          </span>
        </div>
        <div className="text-sm font-medium text-ink">Manahij Bahts Ilmi</div>
        <div className="text-xs text-ink-soft arabic-display" style={{direction:"rtl"}}>
          مناهج البحث العلمي
        </div>
      </div>

      {/* Input maddah user */}
      <div className="space-y-3 mb-4">
        {maddahList.map((m, i) => (
          <div key={m.id} className="card-glass p-4 relative">
            <div className="text-xs uppercase tracking-wider text-ink-soft mb-3">
              Maddah {i + 1}
            </div>
            <div className="mb-2">
              <label className="text-xs text-ink-soft mb-1 block">
                Nama maddah (Indonesia atau Arab):
              </label>
              <input
                value={m.nama}
                onChange={e => updateMaddah(m.id, "nama", e.target.value)}
                placeholder="mis. Fiqh Nawazil / فقه النوازل"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-ink outline-none transition-colors"
                style={{fontSize: 16, borderRadius: 12}}
                onFocus={e => e.target.style.borderColor="rgba(62,207,142,0.50)"}
                onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.10)"}
              />
            </div>
            <div>
              <label className="text-xs text-ink-soft mb-1 block">
                Kitab muqarrar yang dipakai:
                <span className="text-ink-soft/60 ml-1">(opsional tapi sangat membantu)</span>
              </label>
              <input
                value={m.kitab}
                onChange={e => updateMaddah(m.id, "kitab", e.target.value)}
                placeholder="mis. Al-Fiqh al-Islami wa Adillatuh / نظرية الضرورة"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-ink outline-none transition-colors"
                style={{fontSize: 16, borderRadius: 12}}
                onFocus={e => e.target.style.borderColor="rgba(62,207,142,0.50)"}
                onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.10)"}
              />
              <p className="text-[11px] text-ink-soft/60 mt-1">
                AI akan menyesuaikan penjelasan berdasarkan kitab ini
              </p>
            </div>
            {maddahList.length > 1 && (
              <button
                onClick={() => removeMaddah(m.id)}
                className="absolute top-3 right-3 text-xs text-ink-soft hover:text-rose-400 transition-colors p-1">
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {maddahList.length < 7 && (
        <button
          onClick={addMaddah}
          className="w-full py-2.5 rounded-xl border border-dashed text-sm text-ink-soft hover:text-ink transition-colors mb-8" style={{borderColor:"rgba(62,207,142,0.28)"}}>
          + Tambah maddah lain
        </button>
      )}

      <button onClick={handleNext} className="btn btn-primary w-full py-3.5">
        Lanjut <Icon name="arrowRight" className="w-4 h-4"/>
      </button>
    </div>
  );
};

// Onboarding pertama kali cukup yang penting untuk menyesuaikan maddah & AI; sisanya bisa diisi
// belakangan lewat "Ubah Profil" (mode edit tetap menanyakan semuanya).
const FIRST_RUN_SKIP = ["intro", "struggle", "mahad_struggle", "learningStyle", "examWindow"];
const UPGRADE_OFFER_KEY = "talqeeh_upgrade_offer_pending";

// overlay: tampil sebagai jendela di atas dashboard (pengguna baru). Tanpa overlay: halaman Ubah Profil.
const OnboardingPage = ({ overlay = false }) => {
  const { session, profile, saveProfile, isFree } = useAuth();
  const path = useRoute();
  const isEditMode = path.includes("edit=1") || path.includes("edit=true");
  const [step, setStep] = useState(0);
  const [data, setData] = useState(() => {
    const base = {
      gender: null,
      faculty: null, level: null, major: null,
      dlMustawa: null,
      struggle: [], learningStyle: [], s2Maddah: null,
      mahad_struggle: [],
      arabicLevel: null, studyGoal: null, examWindow: null, madzhab: null,
    };
    if (profile?.onboarded) {
      return {
        ...base,
        gender: profile.gender ?? null,
        faculty: profile.faculty ?? null,
        level: profile.level ?? null,
        major: profile.major ?? null,
        dlMustawa: profile.dlMustawa ?? null,
        struggle: profile.struggle ?? [],
        learningStyle: profile.learningStyle ?? [],
        s2Maddah: profile.s2Maddah ?? null,
        mahad_struggle: profile.mahad_struggle ?? [],
        arabicLevel: profile.arabicLevel ?? null,
        studyGoal: profile.studyGoal ?? null,
        examWindow: currentExamWindow(profile),
        madzhab: profile.madzhab ?? null,
      };
    }
    return base;
  });
  const [mahadJenjang, setMahadJenjang] = useState(null);
  const toast = useToast();

  useEffect(() => { if (!session) navigate("/"); }, [session]);
  // Onboarding pertama kali kini muncul di atas dashboard, bukan halaman sendiri.
  useEffect(() => { if (!overlay && !isEditMode && session) navigate("/dashboard"); }, [profile, isEditMode, overlay, session]);

  const QUESTIONS = [
    { key: "intro", kind: "intro" },
    {
      key: "level",
      title: "Kamu di tingkat apa sekarang?",
      hint: "Pilih tingkat atau jenjangmu saat ini",
      optionsFn: (d, mj) => {
        if (!mj) {
          const masisirEntries = LEVELS.filter(l =>
            !l.isMahad &&
            !l.id.startsWith("idad") &&
            !l.id.startsWith("tsanawi") &&
            l.id !== "_sep_mahad"
          );
          return [
            { id: "_sep_mahad", isSeparator: true, label: "MA'HAD AL-AZHAR" },
            {
              id: "__mahad_idad__",
              label: "I'dadi (Ma'had Al-Azhar)",
              short: "I'dadi",
              arabic: "الْإِعْدَادِيُّ",
              desc: "Ma'had Al-Azhar · Setingkat SMP",
              isMahadGateway: true,
            },
            {
              id: "__mahad_tsanawi__",
              label: "Tsanawi (Ma'had Al-Azhar)",
              short: "Tsanawi",
              arabic: "الثَّانَوِيُّ",
              desc: "Ma'had Al-Azhar · Setingkat SMA",
              isMahadGateway: true,
            },
            ...masisirEntries,
          ];
        }
        if (mj === "idad")    return LEVELS.filter(l => l.id.startsWith("idad_"));
        if (mj === "tsanawi") return LEVELS.filter(l => l.id.startsWith("tsanawi_"));
        return LEVELS;
      },
      multi: false,
      iconType: "arabic-small",
    },
    {
      key: "gender",
      title: "Kamu belajar di kampus Banin atau Banat?",
      hint: "Struktur fakultas Al-Azhar berbeda untuk masing-masing",
      options: [
        { id: "banin", label: "Banin (Putra)", arabic: "بنين" },
        { id: "banat", label: "Banat (Putri)", arabic: "بنات" },
      ],
      multi: false,
      iconType: "arabic",
      conditional: (d) => !isMahadLevel(d.level) && d.level !== "mustawa",
    },
    {
      key: "faculty",
      title: "Di fakultas apa kamu belajar?",
      hint: "Pilih yang paling dekat",
      optionsFn: (d) => {
        if (d.gender === "banat") {
          return FACULTIES.filter(f => f.forGender === "banat" || f.forGender === "all" || !f.forGender);
        }
        return FACULTIES.filter(f => f.forGender === "banin" || f.forGender === "all" || !f.forGender);
      },
      multi: false,
      iconType: "arabic",
      conditional: (d) => !isMahadLevel(d.level) && d.level !== "mustawa",
    },
    {
      key: "dlMustawa",
      title: "Kamu di Mustawa berapa?",
      hint: "Pilih tingkat Darul Lughah-mu saat ini",
      options: [
        { id: "mubtadi_1",     label: "Mubtadi' 1",     arabic: "مُبْتَدِئ ١" },
        { id: "mubtadi_2",     label: "Mubtadi' 2",     arabic: "مُبْتَدِئ ٢" },
        { id: "mutawassith_1", label: "Mutawassith 1",  arabic: "مُتَوَسِّط ١" },
        { id: "mutawassith_2", label: "Mutawassith 2",  arabic: "مُتَوَسِّط ٢" },
        { id: "mutaqaddim_1",  label: "Mutaqaddim 1",   arabic: "مُتَقَدِّم ١" },
        { id: "mutaqaddim_2",  label: "Mutaqaddim 2",   arabic: "مُتَقَدِّم ٢" },
        { id: "mutamayyiz",    label: "Mutamayyiz",     arabic: "مُتَمَيِّز" },
      ],
      multi: false,
      iconType: "arabic",
      conditional: (d) => d.level === "mustawa",
    },
    {
      key: "major",
      title: "Jurusan apa yang kamu ambil?",
      hint: "Sesuai pembagian fakultasmu",
      optionsFromState: true,
      multi: false,
      iconType: "arabic",
      conditional: (d) => {
        if (d.level === "mustawa") return false;
        if (isMahadLevel(d.level)) return false;
        if (d.level === "s2_kuliyyat" || d.level === "s2_dirasat") return false;
        const fac = FACULTIES.find(f => f.id === d.faculty);
        if (!fac || !fac.majorsStartLevel || fac.majors.length === 0) return false;
        const lvlNum = parseInt(d.level);
        return !isNaN(lvlNum) && lvlNum >= fac.majorsStartLevel;
      },
    },
    {
      key: "s2_setup",
      kind: "s2_setup",
      conditional: (d) => d.level === "s2_kuliyyat" || d.level === "s2_dirasat",
    },
    {
      key: "mahad_struggle",
      title: "Pelajaran mana yang paling jadi tantangan?",
      hint: "Boleh pilih lebih dari satu",
      optionsFn: (d) => getMahadStruggles(d.level),
      multi: true,
      iconType: "lucide",
      conditional: (d) => isMahadLevel(d.level),
    },
    {
      key: "struggle",
      title: "Sekarang kamu paling sering struggle di bagian mana?",
      hint: "Boleh pilih lebih dari satu",
      options: STRUGGLES,
      multi: true,
      iconType: "lucide",
      conditional: (d) => !isMahadLevel(d.level),
    },
    {
      key: "madzhab",
      title: "Kamu belajar fiqh madzhab apa?",
      hint: "AI akan mendahulukan pendapat madzhab ini di semua prompt",
      options: MADZHABS,
      multi: false,
      iconType: "arabic",
      conditional: (d) => d.level !== "mustawa",
    },
    {
      key: "learningStyle",
      title: "Biasanya kamu lebih nyaman belajar dengan cara seperti apa?",
      hint: "Boleh pilih lebih dari satu",
      options: LEARNING_STYLES,
      multi: true,
      iconType: "emoji",
    },
    {
      key: "arabicLevel",
      title: "Seberapa lancar kamu membaca teks Arab?",
      hint: "Menentukan seberapa banyak harakat, terjemah, dan i'rab yang disertakan AI",
      options: ARABIC_LEVELS,
      multi: false,
      iconType: "emoji",
    },
    {
      key: "studyGoal",
      title: "Apa target utamamu semester ini?",
      hint: "Ringkasan dan soal dari AI akan difokuskan ke sini",
      options: STUDY_GOALS,
      multi: false,
      iconType: "emoji",
    },
    {
      key: "examWindow",
      title: "Kapan imtihan terdekatmu?",
      hint: "Perkiraan saja — bisa diubah kapan pun lewat Ubah Profil",
      options: EXAM_WINDOWS,
      multi: false,
      iconType: "emoji",
    },
  ];

  // Pengguna baru: madzhab hanya ditanyakan ke Syariah & Dirasat (fiqh per madzhab paling terasa di sana).
  const firstRunSkips = (q, d) => FIRST_RUN_SKIP.includes(q.key)
    || (q.key === "madzhab" && !/^(syariah|dirasat)/.test(d.faculty || ""));
  const getActiveQuestions = (d) => QUESTIONS.filter(q =>
    (isEditMode || !firstRunSkips(q, d)) && (!q.conditional || q.conditional(d)));

  // [TECH-1] Safeguard: saat level berubah, activeQuestions bisa menjadi lebih pendek.
  // Pastikan step tidak pernah out-of-bounds (mencegah loncat pertanyaan / profil tidak lengkap).
  useEffect(() => {
    const active = getActiveQuestions(data);
    if (step > 0 && step >= active.length) {
      setStep(active.length - 1);
    }
  }, [data.level]);

  const activeQuestions = getActiveQuestions(data);
  const cur = activeQuestions[step];
  const hasIntro = activeQuestions[0]?.kind === "intro";
  const totalSteps = activeQuestions.length - (hasIntro ? 1 : 0); // intro tidak dihitung
  const stepNo = hasIntro ? step : step + 1;
  const progress = hasIntro && step === 0 ? 0 : Math.round((stepNo / totalSteps) * 100);

  const currentOptions = cur?.optionsFromState
    ? (FACULTIES.find(f => f.id === data.faculty)?.majors || [])
    : cur?.optionsFn
      ? cur.optionsFn(data, mahadJenjang)
      : cur?.options;

  const value = data[cur?.key];
  const canNext = cur?.kind === "intro"
    ? true
    : cur?.multi
      ? value && value.length > 0
      : !!value;

  const onPick = (id) => {
    if (!cur) return;

    if (id === "__mahad_idad__") {
      setMahadJenjang("idad");
      return;
    }
    if (id === "__mahad_tsanawi__") {
      setMahadJenjang("tsanawi");
      return;
    }

    if (cur.key === "level") {
      if (!id.startsWith("idad") && !id.startsWith("tsanawi")) {
        setMahadJenjang(null);
      }
      setData(d => ({
        ...d,
        level: id,
        faculty: isMahadLevel(id) ? null : d.faculty,
        major: null,
        dlMustawa: id === "mustawa" ? d.dlMustawa : null,
        mahad_year: null,
        mahad_jurusan: null,
        mahad_struggle: [],
      }));
    } else if (cur.key === "gender") {
      setData(d => ({ ...d, gender: id, faculty: null, major: null }));
    } else if (cur.key === "faculty") {
      setData(d => ({ ...d, faculty: id, major: null }));
    } else if (cur.multi) {
      const next = (value || []).includes(id)
        ? (value || []).filter(x => x !== id)
        : [...(value || []), id];
      setData(d => ({ ...d, [cur.key]: next }));
    } else {
      setData(d => ({ ...d, [cur.key]: id }));
    }
  };

  const doFinish = (finalData) => {
    const examChanged = finalData.examWindow !== currentExamWindow(profile);
    const finalProfile = {
      ...profile, ...finalData,
      // Waktu jawaban "kapan imtihan" dicatat supaya bisa kedaluwarsa sendiri.
      examWindowAt: examChanged ? new Date().toISOString() : profile?.examWindowAt,
      onboarded: true, onboardedAt: profile?.onboardedAt || new Date().toISOString(),
    };
    // Tandai tawaran paket sebelum menyimpan, supaya dashboard langsung menampilkannya.
    if (!isEditMode && isFree) { try { localStorage.setItem(UPGRADE_OFFER_KEY, "1"); } catch {} }
    saveProfile(finalProfile);
    if (isEditMode) {
      toast.push("Profil berhasil diperbarui. Dashboard sudah disesuaikan.");
      setTimeout(() => navigate("/dashboard"), 400);
    } else {
      toast.push("Dashboard personal sudah siap untukmu.");
      if (!overlay) navigate("/dashboard");
    }
  };

  const onNext = () => {
    const active = getActiveQuestions(data);
    if (step < active.length - 1) {
      setStep(step + 1);
    } else {
      doFinish(data);
    }
  };

  const handleS2Save = (s2Maddah) => {
    const newData = { ...data, s2Maddah };
    setData(newData);
    const active = getActiveQuestions(newData);
    if (step < active.length - 1) {
      setStep(step + 1);
    } else {
      doFinish(newData);
    }
  };

  const onBack = () => { if (step > 0) setStep(step - 1); };
  const firstName = (session?.name || "").split(" ")[0];

  if (!session) return null;

  const isLast = step === getActiveQuestions(data).length - 1;

  const Wrapper = overlay ? OverlayFrame : PageFrame;

  return (
    <Wrapper firstName={firstName}>

        {/* Progress bar */}
        {!(hasIntro && step === 0) && (
          <div className={`max-w-2xl mx-auto w-full ${overlay ? "mb-6" : "mb-10"}`}>
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-gold-400 uppercase tracking-wider">Langkah {stepNo} dari {totalSteps}</span>
              <span className="text-ink-muted num">{progress}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full transition-all duration-500 rounded-full"
                style={{width: `${progress}%`, background:"linear-gradient(90deg, var(--kraken-purple), #C9A86A)"}}/>
            </div>
          </div>
        )}

        <div key={step} className="page-enter flex-1 flex flex-col">
          {cur?.kind === "intro" ? (
            <Intro session={session} onNext={onNext} isEditMode={isEditMode}/>
          ) : cur?.kind === "s2_setup" ? (
            <S2SetupStep profile={data} onSave={handleS2Save}/>
          ) : (
            <QuestionStep
              question={cur}
              options={currentOptions}
              value={value}
              onPick={onPick}
              mahadJenjang={mahadJenjang}
              onClearJenjang={() => { setMahadJenjang(null); setData(d => ({...d, level: null})); }}
            />
          )}
        </div>

        {/* Nav — hide outer button for s2_setup (it has its own) */}
        {cur?.kind !== "intro" && cur?.kind !== "s2_setup" && (
          <div className={`max-w-2xl mx-auto w-full ${overlay ? "mt-6" : "mt-10"} flex items-center justify-between`}>
            <button onClick={onBack} disabled={step === 0} className={`btn btn-ghost ${step === 0 ? "invisible" : ""}`}>
              <Icon name="chevronLeft" className="w-4 h-4"/> Kembali
            </button>
            <button onClick={onNext} disabled={!canNext}
              className={`btn btn-primary ${!canNext ? "opacity-40 cursor-not-allowed" : ""}`}>
              {isLast ? (isEditMode ? "Simpan Perubahan" : "Selesai") : "Lanjut"} <Icon name="arrowRight" className="w-4 h-4"/>
            </button>
          </div>
        )}
        {cur?.kind === "s2_setup" && (
          <div className="max-w-2xl mx-auto w-full mt-6">
            <button onClick={onBack} className="btn btn-ghost">
              <Icon name="chevronLeft" className="w-4 h-4"/> Kembali
            </button>
          </div>
        )}
    </Wrapper>
  );
};

// Halaman penuh (Ubah Profil).
const PageFrame = ({ children }) => (
  <div className="page-enter min-h-screen flex flex-col">
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <GlowBlob color="rgba(62,207,142,0.30)" size={520} top={-100} right={-100}/>
      <GlowBlob color="rgba(201,168,106,0.15)" size={400} bottom={-100} left={-100}/>
    </div>
    <div className="container-x py-12 md:py-16 flex-1 flex flex-col relative">{children}</div>
  </div>
);

// Jendela di atas dashboard untuk pengguna baru.
// Dirender ke <body> lewat portal: animasi halaman memakai transform, yang membuat position:fixed
// ikut terpotong di dalam halaman.
const Modal = ({ children }) => createPortal(children, document.body);

const OverlayFrame = ({ firstName, children }) => (
  <Modal>
  <div className="fixed inset-0 z-[130] overflow-y-auto" style={{ background: "rgba(8,8,8,0.78)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}>
    <div className="min-h-full flex items-start md:items-center justify-center p-3 md:p-8">
      <div className="page-enter w-full max-w-3xl rounded-3xl border border-white/10 shadow-2xl shadow-black/60 p-5 md:p-8"
        style={{ background: "linear-gradient(180deg, #171717, #111)" }}>
        <div className="flex items-center gap-3 mb-6">
          <LogoMark size={36}/>
          <div className="min-w-0">
            <div className="text-ink font-semibold">Ahlan{firstName ? `, ${firstName}` : ""}! Kenalan dulu, 1 menit saja</div>
            <div className="text-xs text-ink-muted">Supaya maddah, prompt, dan AI langsung menyesuaikan tingkat & fakultasmu.</div>
          </div>
        </div>
        {children}
      </div>
    </div>
  </div>
  </Modal>
);

// Setelah onboarding, akun gratis ditawari paket berbayar sekali. "Nanti saja" menutupnya.
const readUpgradeOffer = () => { try { return localStorage.getItem(UPGRADE_OFFER_KEY) === "1"; } catch { return false; } };
const clearUpgradeOffer = () => { try { localStorage.removeItem(UPGRADE_OFFER_KEY); } catch {} };

const UpgradeOfferModal = ({ onClose }) => {
  const settings = useAppSettings();
  const bundle = aiBundle(settings);
  const go = (plan) => { clearUpgradeOffer(); onClose(); navigate(`/gabung?plan=${plan}`); };
  const later = () => { clearUpgradeOffer(); onClose(); };
  const plans = [
    { plan: "library", title: "Library", price: LIBRARY_PRICE, note: "sekali bayar · selamanya", color: "#c9a86a",
      items: LIBRARY_FEATURES.slice(0, 4), cta: "Pilih Library" },
    { plan: "library_ai", title: "Library + AI Study Partner", color: "#3ecf8e", recommended: true,
      price: bundle ? formatRupiah(bundle.total) : LIBRARY_PRICE,
      note: bundle ? "sekali bayar" : "+ AI Partner bulanan",
      tagline: bundle ? "Library selamanya + AI Study Partner 30 hari" : null,
      breakdown: bundle,
      itemsTitle: "Semua isi Library, ditambah:",
      items: AI_BUNDLE_FEATURES,
      footnote: bundle ? `AI Partner cuma sekitar ${formatRupiah(bundle.perDay)}/hari.` : null,
      cta: bundle ? `Ambil paket lengkap · ${formatRupiah(bundle.total)}` : "Pilih Library + AI Study Partner" },
  ];
  return (
    <Modal>
    <div className="fixed inset-0 z-[130] overflow-y-auto" style={{ background: "rgba(8,8,8,0.78)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}>
      <div className="min-h-full flex items-start md:items-center justify-center p-3 md:p-8">
        <div className="page-enter w-full max-w-3xl rounded-3xl border border-white/10 shadow-2xl shadow-black/60 p-5 md:p-8"
          style={{ background: "linear-gradient(180deg, #171717, #111)" }}>
          <div className="text-center mb-6">
            <div className="text-xs uppercase tracking-[0.2em] text-gold-400 mb-2">Profilmu sudah siap ✦</div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink leading-tight">Mau buka semua fitur Talqeeh?</h2>
            <p className="text-sm text-ink-muted mt-2 max-w-lg mx-auto">Akun gratismu sudah aktif. Upgrade kapan saja untuk membuka semua maddah dan AI Study Partner.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {plans.map(p => (
              <div key={p.plan} className="rounded-2xl p-5 flex flex-col relative"
                style={{ background: `${p.color}0f`, border: `1px solid ${p.color}${p.recommended ? "66" : "40"}` }}>
                {p.recommended && (
                  <span className="absolute -top-2.5 right-4 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: p.color, color: "#0b0b0b" }}>Paling lengkap</span>
                )}
                <div className="font-display text-lg font-semibold text-ink">{p.title}</div>
                <div className="mt-1">
                  <span className="font-display text-2xl font-semibold" style={{ color: p.color }}>{p.price}</span>
                  <span className="text-xs text-ink-muted ml-1.5">{p.note}</span>
                </div>
                {p.tagline && <div className="text-xs text-ink mt-0.5">{p.tagline}</div>}
                {p.breakdown && <AiBundleBreakdown bundle={p.breakdown} className="mt-3"/>}
                {p.itemsTitle && <div className="text-xs text-ink font-medium mt-3 mb-1.5">{p.itemsTitle}</div>}
                <ul className={`space-y-1.5 text-[13px] text-ink-muted flex-1 ${p.itemsTitle ? "" : "mt-3"}`}>
                  {p.items.map(it => (
                    <li key={it} className="flex gap-2"><Icon name="check" className="w-3.5 h-3.5 flex-shrink-0 mt-1" style={{ stroke: p.color }}/>{it}</li>
                  ))}
                </ul>
                {p.footnote && <p className="text-[11.5px] mt-3" style={{ color: p.color }}>{p.footnote}</p>}
                <button onClick={() => go(p.plan)} className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: p.color, color: "#0b0b0b" }}>
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
          <button onClick={later} className="block mx-auto mt-5 text-sm text-ink-muted hover:text-ink underline underline-offset-4">
            Nanti saja, pakai versi gratis dulu
          </button>
        </div>
      </div>
    </div>
    </Modal>
  );
};

const Intro = ({ session, onNext, isEditMode }) => (
  <div className="max-w-2xl mx-auto text-center pt-10">
    <div className="arabic-display-classical text-3xl text-gold-300 mb-4">السلام عليكم</div>
    <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-tight mb-5">
      {isEditMode ? "Ubah Profil Belajarmu" : `Selamat datang, ${session.name.split(" ")[0]}.`}
    </h1>
    <p className="text-ink-muted text-lg leading-relaxed mb-10">
      {isEditMode
        ? "Perbarui pilihan jenjang, fakultas, dan preferensi belajarmu. Setelah disimpan, dashboard langsung menyesuaikan."
        : "Sebelum mulai, jawab beberapa pertanyaan singkat supaya maddah, prompt, dan AI Partner menyesuaikan cara belajarmu — bukan template umum."
      }
    </p>
    <div className="card-glass p-6 mb-8 text-left max-w-md mx-auto">
      <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">Yang akan ditanyakan</div>
      <ol className="space-y-2.5 text-sm text-ink">
        {[
          "Tingkat, fakultas, dan jurusan",
          "Area belajar yang jadi tantangan",
          "Cara belajar yang paling nyaman",
          "Kelancaran membaca teks Arab",
          "Target utama & kapan imtihan terdekat",
        ].map((t, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full text-emerald-200 text-xs flex items-center justify-center font-semibold flex-shrink-0" style={{background:"rgba(62,207,142,0.20)",border:"1px solid rgba(62,207,142,0.30)"}}>
              {i + 1}
            </span>
            {t}
          </li>
        ))}
      </ol>
    </div>
    <button onClick={onNext} className="btn btn-primary text-base px-7 py-3.5">
      Mulai · 2 menit saja <Icon name="arrowRight" className="w-4 h-4"/>
    </button>
  </div>
);

const QuestionStep = ({ question, options, value, onPick, mahadJenjang, onClearJenjang }) => {
  if (!question || !options) return null;
  const isMulti = question.multi;
  const isSelected = (id) => isMulti ? (value || []).includes(id) : value === id;
  const isArabicSmall = question.iconType === "arabic-small";
  const realOptions = options.filter(o => !o.isSeparator);
  const colClass = realOptions.length <= 4 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="max-w-3xl mx-auto w-full pt-4">
      <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">Pertanyaan</div>
      <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink leading-tight mb-3">
        {question.title}
      </h2>
      <p className="text-ink-muted mb-8">{question.hint}</p>

      {question.key === "level" && mahadJenjang && (
        <div className="mb-5">
          <button
            onClick={onClearJenjang}
            className="text-sm text-ink-soft inline-flex items-center gap-1.5 hover:text-ink transition-colors">
            <Icon name="arrowLeft" className="w-4 h-4"/>
            Kembali ke pilihan jenjang
          </button>
          <div className="mt-2 text-xs text-ink-soft">
            Ma'had Al-Azhar ·{" "}
            <span className="text-ink font-medium">
              {mahadJenjang === "idad" ? "I'dadi (SMP)" : "Tsanawi (SMA)"}
            </span>
            {" "}— pilih kelasmu:
          </div>
        </div>
      )}

      <div className={`grid ${colClass} gap-3`}>
        {options.map((opt) => {
          if (opt.isSeparator) {
            return (
              <div key={opt.id} className="col-span-full flex items-center gap-3 mt-3 mb-1">
                <div className="h-px flex-1" style={{background:"rgba(255,255,255,0.08)"}}/>
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold"
                  style={{color:"rgba(201,168,106,0.65)"}}>
                  {opt.label}
                </span>
                <div className="h-px flex-1" style={{background:"rgba(255,255,255,0.08)"}}/>
              </div>
            );
          }
          const sel = isSelected(opt.id);
          return (
            <button key={opt.id} onClick={() => onPick(opt.id)}
              className={`text-left p-5 rounded-xl border transition-all relative ${sel
                ? "border-emerald-500/60"
                : opt.isMahadGateway
                  ? "bg-white/4 border-emerald-600/25 hover:bg-white/6 hover:border-emerald-500/45"
                  : "bg-white/4 border-emerald-600/25 hover:bg-white/6 hover:border-emerald-500/45"}`}
              style={sel ? {background:"rgba(62,207,142,0.14)", borderColor:"rgba(62,207,142,0.55)", boxShadow:"0 0 0 1px rgba(62,207,142,0.22), 0 4px 20px rgba(62,207,142,0.18)"} : {}}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-0">
                  {question.iconType === "emoji" && <span className="text-3xl">{opt.emoji}</span>}
                  {(question.iconType === "arabic" || isArabicSmall) && (
                    <span className={`arabic-ui text-gold-300 ${isArabicSmall ? "text-base" : "text-xl"}`}>
                      {opt.arabic}
                    </span>
                  )}
                  {question.iconType === "lucide" && (
                    <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${sel ? "text-white" : "bg-white/8 text-emerald-300"}`} style={sel ? {background:"var(--kraken-purple)"} : {}}>
                      <Icon name={opt.icon} className="w-4 h-4"/>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {opt.isMahadGateway && (
                    <Icon name="arrowRight" className="w-4 h-4 text-emerald-400"/>
                  )}
                  {isMulti && (
                    <span className={`w-5 h-5 rounded-md border flex items-center justify-center ${sel ? "text-white" : "border-white/15"}`} style={sel ? {background:"var(--kraken-purple)",borderColor:"var(--kraken-purple)"} : {}}>
                      {sel && <Icon name="check" className="w-3 h-3" strokeWidth={3}/>}
                    </span>
                  )}
                  {!isMulti && sel && <Icon name="check" className="w-5 h-5 text-emerald-300" strokeWidth={2.4}/>}
                </div>
              </div>
              <div className="font-display text-lg font-semibold text-ink">{opt.label}</div>
              {opt.desc && <div className="text-xs text-ink-muted mt-1 leading-relaxed">{opt.desc}</div>}
              {opt.short && !opt.desc && <div className="text-xs text-ink-soft mt-1">{opt.short}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

window.OnboardingPage = OnboardingPage;
window.UpgradeOfferModal = UpgradeOfferModal;
window.readUpgradeOffer = readUpgradeOffer;
