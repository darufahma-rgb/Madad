/* Talqih — Adaptive Prompt Engine
   Resolve placeholder [TINGKATAN], [FAKULTAS], [JURUSAN], [GAYA_BELAJAR],
   [MADDAH], [LEVEL_BAHASA] berdasarkan profile user.
*/

const TINGKATAN_LABEL = {
  mustawa: "thalib Mustawa (persiapan bahasa)",
  "1":     "thalib Tingkat I",
  "2":     "thalib Tingkat II",
  "3":     "thalib Tingkat III",
  "4":     "thalib Tingkat IV",
  "5":     "thalib Tingkat V",
  pasca:   "mahasiswa Pasca-sarjana",
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
  mustawa: `Pakai bahasa Indonesia yang mudah dipahami. Setiap istilah Arab wajib disertai terjemah Indonesia. Hindari istilah ushul/balaghah yang berat — jelaskan dengan kata sederhana dulu.`,
  "1":     `Pakai bahasa Indonesia akademik dasar. Istilah Arab boleh ditulis dengan transliterasi natural (mubtada, fa'il, dalil). Sertakan terjemah untuk istilah teknis.`,
  "2":     `Pakai bahasa Indonesia akademik. Istilah Arab transliterasi natural untuk konsep umum. Sertakan terjemah untuk istilah baru atau khilaf.`,
  "3":     `Pakai bahasa Indonesia akademik. Istilah Arab transliterasi untuk semua konsep teknis tanpa perlu terjemah kecuali jarang dipakai. Boleh masuk ke pembahasan mendalam.`,
  "4":     `Pakai bahasa Indonesia akademik dengan istilah Arab transliterasi. Bahas dengan kedalaman setara level lanjut. Boleh sertakan rujukan kitab mutawassith dan mutaakhir.`,
  "5":     `Pakai bahasa Indonesia akademik dengan istilah Arab transliterasi. Bahas dengan kedalaman setara level lanjut. Boleh sertakan rujukan kitab mutawassith dan mutaakhir.`,
  pasca:   `Pakai bahasa akademik tingkat riset. Boleh masuk ke pembahasan jadal ulama, kritik manhaj, dan referensi mutaqaddim/mutaakhir. Sertakan teks Arab original dari sumber primer bila relevan.`,
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

/* ============ STARTER PACK GENERATOR ============ */

const generateStarterPack = (profile, session) => {
  const tingkatan  = profile?.level   ? (TINGKATAN_LABEL[profile.level]   || "thalib") : "thalib";
  const fakultas   = profile?.faculty ? (FAKULTAS_LABEL[profile.faculty]  || "Al-Azhar") : "Al-Azhar";
  const jurusan    = profile?.major   ? (JURUSAN_LABEL[profile.major]     || "") : "";
  const nama       = session?.name    || "";

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
- Aku ${nama ? nama + ", " : ""}seorang ${tingkatan}
- Belajar di ${fakultas}${jurusan ? jurusan : ""}
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

Object.assign(window, {
  resolveAdaptivePrompt,
  resolveGenericPrompt,
  generateStarterPack,
  TINGKATAN_LABEL,
  FAKULTAS_LABEL,
  LEVEL_BAHASA_INSTRUCTION,
});
