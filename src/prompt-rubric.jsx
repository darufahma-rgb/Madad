/* Talqeeh — Rubrik mutu prompt library (Fase 3).
   Delapan kriteria "Standar mutu prompt Talqeeh" dari laporan audit. Kriteria yang bisa dicek dari teks dicek di sini;
   manhaj (3) dijaga blok Standar Azhar pusat dan dinilai asatidz saat tinjauan.
   Status per kriteria: ok · warn (sebaiknya diperbaiki) · fail (belum layak terbit) · na (tidak berlaku).
   Dipakai halaman admin "Mutu Prompt" dan skrip scripts/prompt-lint.mjs. */

const RUBRIC_CRITERIA = [
  { id: "konteks",   no: 1, label: "Konteks lengkap" },
  { id: "khas",      no: 2, label: "Khas maddah" },
  { id: "manhaj",    no: 3, label: "Sesuai manhaj Azhar" },
  { id: "format",    no: 4, label: "Format ujian nyata" },
  { id: "akurasi",   no: 5, label: "Pengaman akurasi" },
  { id: "interaktif", no: 6, label: "Interaktif bila melatih" },
  { id: "output",    no: 7, label: "Output jelas" },
  { id: "siap",      no: 8, label: "Siap pakai" },
];

const RUBRIC_PLACEHOLDERS = new Set(["TINGKATAN", "FAKULTAS", "JURUSAN", "GAYA_BELAJAR", "MADDAH", "METODE", "LEVEL_BAHASA", "TOPIK"]);
const RUBRIC_SLOT_RE = /^(SEBUTKAN|TULIS|TEMPEL)\b/;
const RUBRIC_ARABIC_RE = /[؀-ۿ]{3,}/;
// Prompt yang membuat soal atau menguji (bukan strategi, jadwal, atau koreksi tulisan sendiri).
const RUBRIC_EXAM_RE = /\b(soal|ujian|imtihan|tahriri|syafawi|kuis|drill|mumtahin|mushahhih|pernyataan)\b/i;
const RUBRIC_SELF_WORK_RE = /\b(Aku Coba|Aku Cari|Aku Tempel|Evaluasi Teks|Kisi-kisi|Strategi|Jadwal|Koreksi Tulisan|Bandingkan Jawabanku)\b/i;
// Tempelan hasil kerja sendiri (JAWABANKU, TULISANKU, …): prompt mengoreksi, bukan memberi soal.
const RUBRIC_OWN_WORK_RE = /\[TEMPEL [A-Z ]*KU\b/;
const RUBRIC_WAIT_RE = /JANGAN (beri|tuliskan|tunjukkan)|[Tt]unggu (jawabanku|tabelku|aku)|[Ss]atu \S+ sekali jalan|satu per satu|[Tt]anyakan dulu|Aku (menulis|menjawab)|Setelah aku (jawab|menjawab)/;
// Prompt yang menyuruh AI mengutip dalil atau data yang rawan dikarang.
const RUBRIC_CITE_RE = /(sebut|kutip|tulis|beri|sertakan|cantumkan|dengan)[^.\n]{0,40}\b(ayat|hadits|dalil|riwayat|qaul|wafat|nomor hadits|halaman)\b/i;
const RUBRIC_GUARD_RE = /yakin|perlu dicek|ragu|jangan (mengarang|menambal|mengubah|menulis)|tempel|TEMPEL|cek di|mengecek/i;

// Daftar prompt datar dari satu maddah (termasuk format "tabs" program DL).
const flattenMaddahPrompts = (maddah) => Object.entries(maddah?.prompts || {}).flatMap(([kind, list]) =>
  (Array.isArray(list) ? list : []).flatMap((p, i) => (p?.template
    ? [{ kind, index: i, title: p.title || "", template: p.template }]
    : (p?.prompts || []).map((q, j) => ({ kind, group: p.kind, index: `${i}.${j}`, title: q.title || "", template: q.template || "" })))));

// Template yang sama persis di lebih dari satu maddah (setelah nama maddah disamakan).
const templateKey = (t) => (t || "").replace(/\s+/g, " ").trim();
const buildDuplicateIndex = (maddahs) => {
  const seen = new Map();
  for (const m of maddahs) for (const p of flattenMaddahPrompts(m)) {
    const k = templateKey(p.template);
    if (!seen.has(k)) seen.set(k, new Set());
    seen.get(k).add(m.id);
  }
  return seen;
};

const rubricCheckPrompt = (p, { isMahad = false, dupIndex = null } = {}) => {
  const t = p.template || "";
  const title = p.title || "";
  const checks = {};
  const set = (id, status, note = "") => { checks[id] = { status, note }; };

  // 1. Konteks: profil pengguna dan nama maddah masuk ke prompt.
  // Maddah khusus satu fakultas/program boleh menulis fakultasnya langsung (mis. "di Fakultas Dakwah").
  const fakultasTertulis = /\bFakultas [A-Z]|program bahasa Arab/.test(t);
  const needs = ["TINGKATAN", "MADDAH", ...(isMahad || fakultasTertulis ? [] : ["FAKULTAS"])].filter(x => !t.includes(`[${x}]`));
  set("konteks", needs.length ? "fail" : "ok", needs.length ? `Tidak memuat ${needs.map(x => `[${x}]`).join(", ")}` : "");

  // 2. Khas maddah: template tidak dipakai ulang persis di maddah lain.
  const shared = dupIndex?.get(templateKey(t));
  set("khas", shared && shared.size > 1 ? "fail" : "ok", shared && shared.size > 1 ? `Template sama persis di ${shared.size} maddah` : "");

  // 3. Manhaj: blok Standar Azhar ditempel otomatis ke semua prompt; isi dinilai asatidz.
  set("manhaj", "ok", "Blok Standar Azhar pusat — isi dinilai saat tinjauan asatidz");

  const trainsExam = (p.kind === "ujian" || p.kind === "latihan") && RUBRIC_EXAM_RE.test(`${title} ${t}`) && !RUBRIC_SELF_WORK_RE.test(title) && !RUBRIC_OWN_WORK_RE.test(t);

  // 4. Format ujian: redaksi soal Arab seperti kertas asli. Bobot درجة & bahasa soal dijaga blok format pusat.
  if (!trainsExam) set("format", "na");
  else if (RUBRIC_ARABIC_RE.test(t) || /bahasa Arab/.test(t)) set("format", "ok");
  else set("format", p.kind === "ujian" ? "fail" : "warn", "Tidak memuat redaksi soal Arab khas kertas (mis. عَرِّفْ، عَلِّلْ، ضَعْ عَلَامَةَ)");

  // 5. Akurasi: prompt yang meminta kutipan/data memberi pengaman sendiri (blok pusat tetap berlaku).
  if (!RUBRIC_CITE_RE.test(t)) set("akurasi", "ok", "Cukup blok pusat");
  else set("akurasi", RUBRIC_GUARD_RE.test(t) ? "ok" : "warn", RUBRIC_GUARD_RE.test(t) ? "" : "Meminta ayat/hadits/data kitab tanpa pengaman \"hanya kalau yakin\" di prompt");

  // 6. Interaktif: latihan/ujian memberi soal lalu berhenti menunggu jawaban.
  if (!trainsExam) set("interaktif", "na");
  else set("interaktif", RUBRIC_WAIT_RE.test(t) ? "ok" : "fail", RUBRIC_WAIT_RE.test(t) ? "" : "Tidak menyuruh AI berhenti dan menunggu jawaban");

  // 7. Output jelas: langkah bernomor secukupnya.
  const steps = (t.match(/^\d+\.\s/gm) || []).length;
  if (!steps && !/Format:|tabel/i.test(t)) set("output", "warn", "Tidak ada langkah bernomor atau format output");
  else if (steps > 6) set("output", "warn", `${steps} langkah — standar maksimal 5`);
  else set("output", "ok");

  // 8. Siap pakai: tidak ada kurung mentah selain placeholder profil & isian berlabel.
  const tokens = [...t.matchAll(/\[([^\]\n]{1,80})\]/g)].map(x => x[1]);
  const unknown = tokens.filter(x => !RUBRIC_PLACEHOLDERS.has(x) && !RUBRIC_SLOT_RE.test(x));
  const bare = tokens.filter(x => /^(SEBUTKAN|TULIS)$/.test(x));
  if (unknown.length) set("siap", "fail", `Kurung tak dikenal: ${[...new Set(unknown)].slice(0, 3).map(x => `[${x}]`).join(", ")}`);
  else if (!/\[METODE\]\s*\[LEVEL_BAHASA\]\s*$/.test(t)) set("siap", "warn", "Tidak diakhiri [METODE] lalu [LEVEL_BAHASA]");
  else if (bare.length) set("siap", "warn", "Isian tanpa label (mis. [SEBUTKAN] saja)");
  else set("siap", "ok");

  const list = Object.values(checks);
  const applicable = list.filter(c => c.status !== "na");
  return {
    checks,
    fails: list.filter(c => c.status === "fail").length,
    warns: list.filter(c => c.status === "warn").length,
    // Skor 0–100: ok = 1, warn = ½, fail = 0 dari kriteria yang berlaku.
    score: Math.round(applicable.reduce((s, c) => s + (c.status === "ok" ? 1 : c.status === "warn" ? 0.5 : 0), 0) / applicable.length * 100),
    layak: !list.some(c => c.status === "fail"),
  };
};

// Ringkasan per maddah untuk seluruh library (kuliah + Ma'had).
const rubricReport = (maddahs = [], mahad = []) => {
  const all = [...maddahs.map(m => ({ m, isMahad: false })), ...mahad.map(m => ({ m, isMahad: true }))];
  const dupIndex = buildDuplicateIndex(all.map(x => x.m));
  return all.map(({ m, isMahad }) => {
    const prompts = flattenMaddahPrompts(m).map(p => ({ ...p, rubric: rubricCheckPrompt(p, { isMahad, dupIndex }) }));
    const per = Object.fromEntries(RUBRIC_CRITERIA.map(c => [c.id, { fail: 0, warn: 0 }]));
    for (const p of prompts) for (const [id, c] of Object.entries(p.rubric.checks)) if (c.status === "fail" || c.status === "warn") per[id][c.status]++;
    return {
      id: m.id, name: m.name, source: isMahad ? "mahad" : "kuliah",
      fakultas: m.fakultas || [], jenjang: m.jenjang || [],
      total: prompts.length,
      layak: prompts.filter(p => p.rubric.layak).length,
      score: prompts.length ? Math.round(prompts.reduce((s, p) => s + p.rubric.score, 0) / prompts.length) : 0,
      per, prompts,
    };
  });
};

/* ── Menyusun prompt persis seperti di aplikasi (untuk uji & paket tinjauan) ── */

// Jurusan yang memang ada di tiap fakultas (supaya profil uji tidak memasangkan fakultas & jurusan yang salah).
const FACULTY_MAJORS = {
  ushuluddin: ["tafsir", "hadits", "aqidah"],
  syariah: ["islamiyah", "wal_qanun"],
  lughah: ["adab", "tarikh", "shahafah"],
  dirasat: ["dirasat_syariah", "dirasat_ushuluddin", "dirasat_lughah"],
};

// Profil uji bawaan: tingkat/fakultas pertama tempat maddah diajarkan.
const defaultTestProfile = (maddah, source) => {
  if (source === "mahad") {
    return { level: (maddah?.jenjang || []).includes("tsanawi") ? "tsanawi_1_adabi" : "idad_2", learningStyle: ["practice"] };
  }
  const labels = typeof FAKULTAS_LABEL !== "undefined" ? FAKULTAS_LABEL : {};
  const faculty = (maddah?.fakultas || []).find(f => labels[f]) || "umum";
  return {
    level: (maddah?.tingkat || []).find(t => /^\d$/.test(t)) || maddah?.tingkat?.[0] || "3",
    faculty,
    major: (maddah?.jurusan || []).find(j => (FACULTY_MAJORS[faculty] || []).includes(j)) || "",
    madzhab: maddah?.category === "fiqhi" ? "syafii" : "",
    learningStyle: ["practice"],
  };
};

// Isian contoh dari petunjuk "mis. …" di kurung isian: contoh pertama saja.
const slotExample = (slot) => {
  if (slot.kind === "tempel") return "";
  const m = (slot.hint || "").match(/mis\.\s*(.+)/i);
  if (!m) return "";
  return m[1].split(/,|·|"|\s+atau\s+|\s+dan\s+|;/)[0].replace(/["'”“]+$/g, "").trim();
};

// Isian contoh untuk satu prompt. Isian tanpa "mis. …" meminjam contoh isian sejenis (kunci sama, mis. "bab")
// dari prompt lain di maddah yang sama — seperti di aplikasi, tempat isian bab dibagi antar kartu.
const defaultSlotValues = (source, maddah, template, profile) => {
  const shared = {};
  for (const p of flattenMaddahPrompts(maddah)) {
    for (const s of resolveLibraryPrompt({ source, maddah, template: p.template, profile }).slots) {
      const ex = slotExample(s);
      if (s.key && ex && !shared[s.key]) shared[s.key] = ex;
    }
  }
  const { slots } = resolveLibraryPrompt({ source, maddah, template, profile });
  const values = {};
  for (const s of slots) {
    const base = s.key ? s.key.split("-")[0] : "";
    values[s.label] = slotExample(s) || (s.key && (shared[s.key] || shared[base])) || "";
  }
  return values;
};

// slotValues: { [label isian]: teks }. [TOPIK] Ma'had diisi dari slotValues.Topik.
const resolveLibraryPrompt = ({ source, maddah, template, profile, slotValues = {} }) => {
  let t = template || "";
  if (source === "mahad") {
    const level = (typeof TINGKATAN_LABEL !== "undefined" && TINGKATAN_LABEL[profile?.level]) || profile?.level || "thalib";
    t = t.replace(/\[TINGKATAN\]/g, level).replace(/\[TOPIK\]/g, slotValues.Topik || "[TOPIK]");
  }
  const resolved = resolveAdaptivePrompt(t, profile, maddah?.name || "");
  const slots = findPromptSlots(resolved);
  const values = Object.fromEntries(slots.map(s => [s.index, slotValues[s.label] ?? ""]));
  const filled = fillPromptSlots(resolved, slots, values);
  // Sama dengan tombol salin/jalankan dengan "Format rapi" aktif (bawaan).
  const text = typeof OUTPUT_FORMAT_INSTRUCTION !== "undefined" ? `${filled}\n\n${OUTPUT_FORMAT_INSTRUCTION}` : filled;
  return { text, slots, missing: missingPromptSlots(slots, values) };
};

// Cari prompt di data saat ini (dipakai Evaluasi AI supaya selalu menguji teks terbaru).
const findLibraryPrompt = (source, maddahId, kind, title) => {
  const list = source === "mahad" ? (window.MAHAD_MADDAH || []) : (window.MADDAHS || []);
  const maddah = list.find(m => m.id === maddahId) || null;
  const prompt = maddah ? flattenMaddahPrompts(maddah).find(p => p.kind === kind && p.title === title) || null : null;
  return { maddah, prompt };
};

Object.assign(window, {
  RUBRIC_CRITERIA, flattenMaddahPrompts, rubricCheckPrompt, rubricReport,
  defaultTestProfile, slotExample, defaultSlotValues, resolveLibraryPrompt, findLibraryPrompt,
});
