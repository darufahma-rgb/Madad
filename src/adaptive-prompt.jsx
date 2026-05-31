import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
/* Talqih — Adaptive Prompt Engine
   Resolve placeholder [TINGKATAN], [FAKULTAS], [JURUSAN], [GAYA_BELAJAR],
   [MADDAH], [LEVEL_BAHASA] berdasarkan profile user.
*/

const TINGKATAN_LABEL = {
  idadi:       "pelajar I'dadi Ma'had Al-Azhar (setingkat SMP)",
  tsanawi:     "pelajar Tsanawi Ma'had Al-Azhar (setingkat SMA)",
  idad_1:           "siswa I'dadi Kelas 1",
  idad_2:           "siswa I'dadi Kelas 2",
  idad_3:           "siswa I'dadi Kelas 3",
  tsanawi_1_adabi:  "siswa Tsanawi Kelas 1 (Adabi)",
  tsanawi_1_ilmi:   "siswa Tsanawi Kelas 1 (Ilmi)",
  tsanawi_2_adabi:  "siswa Tsanawi Kelas 2 (Adabi)",
  tsanawi_2_ilmi:   "siswa Tsanawi Kelas 2 (Ilmi)",
  tsanawi_3_adabi:  "siswa Tsanawi Kelas 3 (Adabi)",
  tsanawi_3_ilmi:   "siswa Tsanawi Kelas 3 (Ilmi)",
  mustawa:     "thalib Darul Lughoh / DL (persiapan bahasa)",
  "1":         "thalib Tingkat I",
  "2":         "thalib Tingkat II",
  "3":         "thalib Tingkat III",
  "4":         "thalib Tingkat IV",
  "5":         "thalib Tingkat V",
  pasca:       "mahasiswa Pasca-sarjana",
  s2_kuliyyat: "mahasiswa S2 Kuliyyat Ulum (Maajistir 1 tahun)",
  s2_dirasat:  "mahasiswa S2 Dirasat Ulya (Maajistir 2 tahun)",
};

const FAKULTAS_LABEL = {
  ushuluddin: "Fakultas Ushuluddin",
  syariah:    "Fakultas Syariah wal Qanun",
  lughah:     "Fakultas Lughah 'Arabiyah",
  dirasat:    "Fakultas Dirasat Islamiyah",
  quran:      "Fakultas Al-Qur'an Al-Karim",
  umum:       "Al-Azhar",
};

const JURUSAN_LABEL = {
  tafsir:    ", jurusan Tafsir",
  hadits:    ", jurusan Hadits",
  aqidah:    ", jurusan Aqidah & Filsafat",
  islamiyah: ", jurusan Syariah Islamiyah",
  wal_qanun: ", jurusan Syariah wal Qanun",
  adab:      ", jurusan Lughah & Adab",
  tarikh:    ", jurusan Tarikh wal Hadharah",
  shahafah:  ", jurusan Shahafah wal I'lam",
};

const GAYA_BELAJAR_LABEL = {
  reading:      "lebih nyaman dengan penjelasan teks bertahap",
  summary:      "lebih cocok dengan ringkasan terstruktur dan poin kunci",
  discussion:   "paham lewat tanya jawab dan dialog",
  practice:     "belajar paling efektif lewat latihan langsung",
  memorization: "fokus ke hafalan dengan repetisi sistematis",
  visual:       "lebih cepat paham lewat peta konsep dan diagram",
};

const LEVEL_BAHASA_INSTRUCTION = {
  idad_1: `Pakai bahasa Indonesia yang sangat mudah dipahami remaja SMP.
- Banyak contoh konkret dari kehidupan sehari-hari
- Teks Arab selalu disertai harakat dan terjemah
- Istilah Arab selalu dijelaskan artinya
- Tone encouraging dan positif — jangan bikin takut
- Jelaskan bertahap, jangan langsung kompleks`,

  idad_2: `Pakai bahasa Indonesia yang mudah dipahami remaja SMP.
- Contoh konkret dari kehidupan sehari-hari
- Teks Arab dengan harakat dan terjemah
- Istilah Arab selalu dijelaskan
- Tone encouraging dan sabar`,

  idad_3: `Pakai bahasa Indonesia akademik dasar untuk remaja SMP akhir.
- Teks Arab dengan harakat dan terjemah
- Istilah Arab dengan penjelasan
- Tone positif dan mendukung`,

  tsanawi_1_adabi: `Pakai bahasa Indonesia akademik menengah untuk remaja SMA.
- Teks Arab dengan harakat, terjemah boleh lebih ringkas
- Istilah teknis Arab disebut + penjelasan singkat
- Tone profesional tapi tetap ramah dan encouraging`,

  tsanawi_2_adabi: `Pakai bahasa Indonesia akademik untuk SMA.
- Teks Arab dengan harakat
- Istilah Arab teknis boleh tanpa terjemah panjang
- Tone akademik yang mendukung`,

  tsanawi_3_adabi: `Pakai bahasa Indonesia akademik SMA akhir — persiapan ujian Tsanawiyah.
- Teks Arab dengan harakat
- Istilah teknis sesuai standar ujian
- Tone serius tapi tidak menakutkan`,

  tsanawi_1_ilmi: `Pakai bahasa Indonesia akademik menengah untuk SMA Ilmi.
- Teks Arab dengan harakat dan terjemah
- Istilah sains dalam Arab selalu disertai padanan Indonesia
- Tone positif dan mendukung`,

  tsanawi_2_ilmi: `Pakai bahasa Indonesia akademik untuk SMA Ilmi.
- Teks Arab dengan harakat
- Istilah sains Arab + Indonesia
- Tone akademik yang mendukung`,

  tsanawi_3_ilmi: `Pakai bahasa Indonesia akademik SMA Ilmi — persiapan ujian Tsanawiyah.
- Fokus pada istilah teknis yang benar
- Teks Arab dengan harakat
- Tone serius untuk persiapan ujian`,

  mustawa: `Pakai bahasa Indonesia yang mudah dipahami. Setiap istilah Arab wajib disertai terjemah Indonesia. Hindari istilah ushul/balaghah yang berat — jelaskan dengan kata sederhana dulu.`,
  "1":     `Pakai bahasa Indonesia akademik dasar. Istilah Arab boleh ditulis dengan transliterasi natural (mubtada, fa'il, dalil). Sertakan terjemah untuk istilah teknis.`,
  "2":     `Pakai bahasa Indonesia akademik. Istilah Arab transliterasi natural untuk konsep umum. Sertakan terjemah untuk istilah baru atau khilaf.`,
  "3":     `Pakai bahasa Indonesia akademik. Istilah Arab transliterasi untuk semua konsep teknis tanpa perlu terjemah kecuali jarang dipakai. Boleh masuk ke pembahasan mendalam.`,
  "4":     `Pakai bahasa Indonesia akademik dengan istilah Arab transliterasi. Bahas dengan kedalaman setara level lanjut. Boleh sertakan rujukan kitab mutawassith dan mutaakhir.`,
  "5":     `Pakai bahasa Indonesia akademik dengan istilah Arab transliterasi. Bahas dengan kedalaman setara level lanjut. Boleh sertakan rujukan kitab mutawassith dan mutaakhir.`,
  pasca:   `Pakai bahasa akademik tingkat riset. Boleh masuk ke pembahasan jadal ulama, kritik manhaj, dan referensi mutaqaddim/mutaakhir. Sertakan teks Arab original dari sumber primer bila relevan.`,
  s2_kuliyyat: `Pakai bahasa akademik tingkat riset S2. Kedalaman pembahasan setara diskusi seminar akademik:
- Analisis kritis dan jadal ilmi (perdebatan akademik) antar ulama
- Perbandingan metodologi (manhaj muqaran) antar aliran
- Rujuk sumber primer (kutub turats) + sekunder kontemporer
- Sertakan teks Arab original dari sumber bila mengutip
- Bahasa Arab akademik tingkat tinggi saat cantumkan istilah
- Tidak perlu jelaskan istilah dasar — user sudah di level riset`,
  s2_dirasat: `Pakai bahasa akademik tingkat riset S2. Kedalaman pembahasan setara diskusi seminar akademik:
- Analisis kritis dan jadal ilmi antar ulama
- Perbandingan metodologi (manhaj muqaran) antar aliran
- Rujuk sumber primer + sekunder
- Sertakan teks Arab original bila mengutip
- Bahasa Arab akademik tingkat tinggi
- Tidak perlu jelaskan istilah dasar`,
};

/* ============ MAIN RESOLVER ============ */

const resolveAdaptivePrompt = (template, profile, maddahName) => {
  if (!template) return "";

  const tingkatan  = profile?.level   ? (TINGKATAN_LABEL[profile.level]   || "thalib") : "thalib";
  const fakultas   = profile?.faculty ? (FAKULTAS_LABEL[profile.faculty]  || "Al-Azhar") : "Al-Azhar";
  const jurusan    = profile?.major   ? (JURUSAN_LABEL[profile.major]     || "") : "";

  let gayaBelajar = "belajar dengan pendekatan kombinasi";
  if (profile?.learningStyle && profile.learningStyle.length > 0) {
    const labels = profile.learningStyle.map(s => GAYA_BELAJAR_LABEL[s]).filter(Boolean);
    if (labels.length === 1)      gayaBelajar = labels[0];
    else if (labels.length === 2) gayaBelajar = labels.join(" dan ");
    else                          gayaBelajar = labels.slice(0, -1).join(", ") + ", dan " + labels[labels.length - 1];
  }

  const levelBahasa = profile?.level
    ? (LEVEL_BAHASA_INSTRUCTION[profile.level] || LEVEL_BAHASA_INSTRUCTION["2"])
    : LEVEL_BAHASA_INSTRUCTION["2"];

  return template
    .replace(/\[TINGKATAN\]/g,   tingkatan)
    .replace(/\[FAKULTAS\]/g,    fakultas)
    .replace(/\[JURUSAN\]/g,     jurusan)
    .replace(/\[GAYA_BELAJAR\]/g, gayaBelajar)
    .replace(/\[MADDAH\]/g,      maddahName || "[MADDAH]")
    .replace(/\[LEVEL_BAHASA\]/g, levelBahasa);
};

/* ============ GENERIC RESOLVE (sample page / no profile) ============ */

const resolveGenericPrompt = (template, maddahName) => {
  if (!template) return "";
  return template
    .replace(/\[TINGKATAN\]/g,    "thalib")
    .replace(/\[FAKULTAS\]/g,     "Al-Azhar")
    .replace(/\[JURUSAN\]/g,      "")
    .replace(/\[GAYA_BELAJAR\]/g, "belajar dengan pendekatan kombinasi")
    .replace(/\[MADDAH\]/g,       maddahName || "[MADDAH]")
    .replace(/\[LEVEL_BAHASA\]/g, LEVEL_BAHASA_INSTRUCTION["2"]);
};

/* ============ MA'HAD STARTER PACK ============ */

const MAHAD_STRUGGLE_LABEL = {
  math_arab:    "Matematika dalam bahasa Arab",
  sains_arab:   "Fisika/Kimia/Biologi dalam bahasa Arab",
  sejarah_geo:  "Sejarah & Geografi dalam bahasa Arab",
  hafalan:      "Hafalan Al-Qur'an",
  insya:        "Insya' (mengarang bahasa Arab)",
  fahm_maqru:   "Fahm Maqru' (memahami teks ujian)",
  nahwu_sharaf: "Nahwu & Sharaf dasar",
  english:      "Bahasa Inggris",
};

// Ekstrak info Ma'had dari level ID granular
const parseMahadLevel = (level) => {
  if (!level) return { jenjang: "Ma'had", kelas: "", jurusan: "", tingkat: "" };

  if (level.startsWith("idad")) {
    const num = level.replace("idad_", "");
    return {
      jenjang: "I'dadi",
      kelas:   `Kelas ${num}`,
      jurusan: "",
      tingkat: `I'dadi Kelas ${num} (Ma'had Al-Azhar)`,
    };
  }

  if (level.startsWith("tsanawi")) {
    // Format: tsanawi_[num]_[jurusan]  contoh: tsanawi_2_ilmi, tsanawi_3_adabi
    const parts   = level.split("_");
    const num     = parts[1] || "";
    const jur     = parts[2] || "";
    const jurLabel = jur === "ilmi"  ? "Jurusan Ilmi (IPA)" :
                     jur === "adabi" ? "Jurusan Adabi (IPS)" : "";
    return {
      jenjang:  "Tsanawi",
      kelas:    `Kelas ${num}`,
      jurusan:  jurLabel,
      tingkat:  `Tsanawi Kelas ${num}${jurLabel ? " " + jurLabel : ""} (Ma'had Al-Azhar)`,
    };
  }

  return { jenjang: "Ma'had", kelas: "", jurusan: "", tingkat: level };
};

const generateMahadStarterPack = (profile, session) => {
  const nama  = session?.name?.split(" ")[0] || "";
  const info  = parseMahadLevel(profile?.level);

  let maddahUmum = "Matematika, Sains/IPA, dan Bahasa Inggris";
  if (profile?.level?.includes("ilmi")) {
    maddahUmum = "Matematika, Fisika, Kimia, Biologi, dan Bahasa Inggris";
  } else if (profile?.level?.includes("adabi")) {
    maddahUmum = "Matematika, Sejarah, Geografi, Filsafat & Mantiq, dan Bahasa Inggris";
  }

  let gaya = "kombinasi berbagai pendekatan";
  if (profile?.learningStyle?.length > 0) {
    const GAYA = {
      reading:      "membaca teks bertahap",
      summary:      "ringkasan terstruktur",
      discussion:   "tanya jawab dan diskusi",
      practice:     "latihan langsung",
      memorization: "hafalan dengan repetisi",
      visual:       "peta konsep visual",
    };
    const labels = profile.learningStyle.map(s => GAYA[s]).filter(Boolean);
    if (labels.length === 1)      gaya = labels[0];
    else if (labels.length === 2) gaya = labels.join(" dan ");
    else                          gaya = labels.slice(0, -1).join(", ") + " dan " + labels[labels.length - 1];
  }

  return `Assalamu'alaikum! Mulai sekarang, kamu akan membantuku belajar.

PROFILKU
- Namaku: ${nama}${nama ? ` — panggil aku "${nama}"` : ""}
- Aku pelajar ${info.tingkat}
${info.jurusan ? `- Jurusan: ${info.jurusan}` : ""}- Cara belajarku: aku lebih suka ${gaya}

MADDAH YANG AKU PELAJARI
- Maddah Agama: Al-Qur'an & Tajwid, Tafsir, Hadits, Tauhid, Fiqh, Nahwu, Sharf, Sirah${info.jenjang === "Tsanawi" ? ", Balaghah" : ""}
- Maddah Umum: ${maddahUmum}

CARA KAMU MEMBANTUKU
- Bahasa: Indonesia yang mudah dipahami (aku remaja, bukan mahasiswa dewasa)
- Teks Arab: WAJIB selalu pakai harakat + terjemah bahasa Indonesia
- Istilah Arab: selalu kasih artinya — jangan anggap aku sudah tahu
- Kalau ada konsep sulit: jelaskan dengan analogi dari kehidupan sehari-hari
- Untuk maddah umum (Matematika, Sains, dll): tunjukkan juga istilah Arabnya karena aku belajar dalam bahasa Arab

PENTING
- Kamu adalah teman belajar, bukan pengganti guru atau ustadz-ku
- Kalau tidak yakin, katakan jujur
- Beri semangat — aku sedang dalam proses belajar!

Kalau paham, jawab: "Wa'alaikumussalam, siap menemani belajar!" Lalu tunggu pertanyaanku.`;
};

/* ============ STARTER PACK GENERATOR ============ */

const generateStarterPack = (profile, session) => {
  // Deteksi level Ma'had dengan cara yang benar (pakai isMahadLevel kalau tersedia)
  const isUserMahad = typeof isMahadLevel !== "undefined"
    ? isMahadLevel(profile?.level)
    : (profile?.level?.startsWith("idad") || profile?.level?.startsWith("tsanawi"));

  if (isUserMahad) {
    return generateMahadStarterPack(profile, session);
  }

  const tingkatan  = profile?.level   ? (TINGKATAN_LABEL[profile.level]   || "thalib") : "thalib";
  const fakultas   = profile?.faculty ? (FAKULTAS_LABEL[profile.faculty]  || "Al-Azhar") : "Al-Azhar";
  const jurusan    = profile?.major   ? (JURUSAN_LABEL[profile.major]     || "") : "";
  const namaLengkap = session?.name   || "";
  const nama        = namaLengkap.split(" ")[0] || "";

  let gaya = "kombinasi berbagai pendekatan";
  if (profile?.learningStyle?.length > 0) {
    const labels = profile.learningStyle.map(s => GAYA_BELAJAR_LABEL[s]).filter(Boolean);
    if (labels.length === 1)      gaya = labels[0];
    else if (labels.length === 2) gaya = labels.join(" dan ");
    else                          gaya = labels.slice(0, -1).join(", ") + " dan " + labels[labels.length - 1];
  }

  const levelBahasa = profile?.level
    ? (LEVEL_BAHASA_INSTRUCTION[profile.level] || LEVEL_BAHASA_INSTRUCTION["2"])
    : LEVEL_BAHASA_INSTRUCTION["2"];

  return `Assalamu'alaikum. Mulai sekarang, kamu akan membantuku belajar materi Al-Azhar. Kenali dulu siapa aku:

PROFILKU
- Namaku: ${nama || "tidak disebutkan"}${nama ? ` — panggil aku "${nama}"` : ""}
- Aku seorang ${tingkatan}
- Belajar di ${fakultas}${jurusan ? ` — ${jurusan}` : ""}
- Cara belajarku: aku ${gaya}

CARA KAMU MEMBANTUKU
- Bahasa pengantar: Indonesia akademik
- ${levelBahasa}
- Saat menyebut ayat, hadits, atau kaidah: WAJIB sertakan teks Arab asli dengan harakat, lalu terjemahnya
- Saat menyebut istilah teknis: tulis Arab + transliterasi (contoh: قِيَاسٌ (qiyas))
- Saat menyebut ulama: pakai nama transliterasi natural (Imam Syafi'i, Ibnu Hajar)
- Saat menyebut kitab: pakai nama Arab (Al-Umm, Fathul Bari)

ADAB PENTING
- Kamu adalah alat bantu, BUKAN pengganti guru atau syaikh-ku
- Kalau kamu tidak yakin atau informasinya lemah, katakan dengan jujur
- Jangan men-tarjih (memilih pendapat terkuat) dalam masalah khilafiyyah — sajikan semua pendapat, biar aku yang merenungkan bersama guruku

Kalau kamu paham, jawab singkat: "Wa'alaikumussalam, siap membantu." Lalu tunggu pertanyaan pertamaku.`;
};

/* ============ S2 MADDAH CONTEXT ============ */

const resolveS2MaddahContext = (maddah) => {
  if (!maddah) return "";
  const nama = maddah.nama || "";
  const kitab = maddah.kitab || "";
  let context = `Maddah yang sedang dipelajari: ${nama}`;
  if (kitab) {
    context += `\nKitab muqarrar yang dipakai: ${kitab}`;
    context += `\n(Sesuaikan penjelasan dengan pendekatan dan terminologi kitab ini)`;
  } else {
    context += `\n(Identifikasi dulu konteks maddah ini dalam kurikulum S2 Al-Azhar, `;
    context += `lalu tanyakan ke user kalau butuh klarifikasi kitab yang dipakai)`;
  }
  return context;
};

const generateS2Prompt = (template, profile, maddah) => {
  if (!template) return "";
  const jalur = profile?.level === "s2_kuliyyat"
    ? "Kuliyyat Ulum (Maajistir 1 tahun)"
    : "Dirasat Ulya (Maajistir 2 tahun)";
  const fakultasData = (typeof FACULTIES !== "undefined")
    ? FACULTIES.find(f => f.id === profile?.faculty) : null;
  const fakultas = fakultasData?.label || "Al-Azhar";
  const majorData = fakultasData?.majors?.find(m => m.id === profile?.major);
  const jurusan = majorData?.label || "";
  const tingkatan = TINGKATAN_LABEL[profile?.level] || "mahasiswa S2";
  const levelBahasa = LEVEL_BAHASA_INSTRUCTION[profile?.level]
    || LEVEL_BAHASA_INSTRUCTION["s2_kuliyyat"];
  const maddahContext = resolveS2MaddahContext(maddah);
  const gaya = (profile?.learningStyle || []).join(", ") || "kombinasi";
  return template
    .replace(/\[TINGKATAN\]/g,    tingkatan)
    .replace(/\[JALUR_S2\]/g,     jalur)
    .replace(/\[FAKULTAS\]/g,     fakultas)
    .replace(/\[JURUSAN\]/g,      jurusan ? `jurusan ${jurusan}` : "")
    .replace(/\[MADDAH_S2\]/g,    maddahContext)
    .replace(/\[NAMA_MADDAH\]/g,  maddah?.nama || "[nama maddah]")
    .replace(/\[KITAB\]/g,        maddah?.kitab || "[kitab muqarrar]")
    .replace(/\[LEVEL_BAHASA\]/g, levelBahasa)
    .replace(/\[GAYA_BELAJAR\]/g, gaya);
};

Object.assign(window, {
  resolveAdaptivePrompt,
  resolveGenericPrompt,
  generateStarterPack,
  generateMahadStarterPack,
  parseMahadLevel,
  resolveS2MaddahContext,
  generateS2Prompt,
  TINGKATAN_LABEL,
  FAKULTAS_LABEL,
  LEVEL_BAHASA_INSTRUCTION,
  MAHAD_STRUGGLE_LABEL,
});
