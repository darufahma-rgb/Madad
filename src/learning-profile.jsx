/* Talqeeh — Profil Belajar: kuesioner isian diri (self-report) 8 dimensi.
   Bukan tes psikologi/klinis — hanya gambaran kebiasaan belajar untuk menyesuaikan AI, prompt, dan saran harian. */

// Urutan = urutan sudut radar (searah jarum jam dari atas).
const COGNITIVE_DIMS = [
  { key: "ambisi",    label: "Ambisi",       desc: "Seberapa tinggi target yang kamu kejar" },
  { key: "energi",    label: "Energi",       desc: "Tenaga untuk belajar setelah aktivitas harian" },
  { key: "praktik",   label: "Teori/Praktik", desc: "Rendah = suka teori dulu, tinggi = suka langsung praktik" },
  { key: "memori",    label: "Memori",       desc: "Kemudahan mengingat ta'rif & istilah" },
  { key: "fokus",     label: "Fokus",        desc: "Bertahan membaca tanpa terdistraksi" },
  { key: "stres",     label: "Stres",        desc: "Tekanan & cemas menjelang imtihan" },
  { key: "kecepatan", label: "Kecepatan",    desc: "Seberapa cepat menangkap inti materi" },
  { key: "motivasi",  label: "Motivasi",     desc: "Dorongan belajar dari dalam diri" },
];

// 2 pernyataan per dimensi; reverse = makin setuju, makin rendah skornya.
const COGNITIVE_ITEMS = [
  { id: "a1", dim: "ambisi",    text: "Aku menargetkan nilai mumtaz atau jayyid jiddan di imtihan." },
  { id: "e1", dim: "energi",    text: "Setelah kuliah atau talaqqi seharian, aku masih punya tenaga untuk belajar." },
  { id: "p1", dim: "praktik",   text: "Aku lebih cepat paham lewat contoh soal dan latihan daripada penjelasan teori." },
  { id: "m1", dim: "memori",    text: "Aku mudah mengingat ta'rif dan istilah setelah membacanya beberapa kali." },
  { id: "f1", dim: "fokus",     text: "Aku bisa membaca muqarrar 25 menit tanpa membuka HP." },
  { id: "s1", dim: "stres",     text: "Aku merasa cemas atau tertekan menjelang imtihan." },
  { id: "k1", dim: "kecepatan", text: "Aku bisa menangkap inti satu bab dengan cepat." },
  { id: "v1", dim: "motivasi",  text: "Aku belajar karena ingin paham, bukan hanya karena mau imtihan." },
  { id: "a2", dim: "ambisi",    text: "Aku suka mengejar target belajar yang menantang." },
  { id: "e2", dim: "energi",    text: "Aku cepat lelah kalau belajar lebih dari 30 menit.", reverse: true },
  { id: "p2", dim: "praktik",   text: "Aku suka memahami kaidah dan alasannya dulu sebelum latihan.", reverse: true },
  { id: "m2", dim: "memori",    text: "Hafalanku cepat hilang kalau tidak diulang.", reverse: true },
  { id: "f2", dim: "fokus",     text: "Pikiranku sering melayang saat membaca teks yang panjang.", reverse: true },
  { id: "s2", dim: "stres",     text: "Aku panik kalau melihat materi yang menumpuk." },
  { id: "k2", dim: "kecepatan", text: "Aku perlu membaca ulang berkali-kali sebelum paham.", reverse: true },
  { id: "v2", dim: "motivasi",  text: "Aku sering menunda belajar sampai mendekati imtihan.", reverse: true },
];

const LIKERT = [
  { value: 1, label: "Sangat tidak sesuai" },
  { value: 2, label: "Tidak sesuai" },
  { value: 3, label: "Kadang-kadang" },
  { value: 4, label: "Sesuai" },
  { value: 5, label: "Sangat sesuai" },
];

// answers: { itemId: 1..5 } → skor 0–100 per dimensi.
const scoreCognitive = (answers) => {
  const sums = {}, counts = {};
  for (const item of COGNITIVE_ITEMS) {
    const raw = answers[item.id];
    if (!raw) continue;
    const v = item.reverse ? 6 - raw : raw;
    sums[item.dim] = (sums[item.dim] || 0) + v;
    counts[item.dim] = (counts[item.dim] || 0) + 1;
  }
  return Object.fromEntries(COGNITIVE_DIMS.map(d => [
    d.key, counts[d.key] ? Math.round(((sums[d.key] / counts[d.key]) - 1) / 4 * 100) : 50,
  ]));
};

const cogLevel = (v) => v >= 70 ? "tinggi" : v < 40 ? "rendah" : "sedang";
const cognitiveScores = (profile) => profile?.cognitive?.scores || null;

// Kekuatan, tantangan, dan cara Talqeeh menyesuaikan diri.
const cognitiveInsights = (scores) => {
  if (!scores) return null;
  const s = scores;
  const strengths = [], challenges = [], adaptations = [];

  if (s.fokus >= 70) strengths.push("Fokusmu kuat — kamu sanggup menyelesaikan bacaan panjang dalam satu duduk.");
  if (s.memori >= 70) strengths.push("Daya ingatmu bagus untuk ta'rif, istilah, dan matan.");
  if (s.kecepatan >= 70) strengths.push("Kamu cepat menangkap inti materi.");
  if (s.motivasi >= 70) strengths.push("Motivasimu datang dari dalam — modal terbaik untuk belajar jangka panjang.");
  if (s.ambisi >= 70) strengths.push("Targetmu tinggi dan kamu suka tantangan.");
  if (s.energi >= 70) strengths.push("Energimu cukup untuk sesi belajar yang lebih panjang.");
  if (s.stres < 40) strengths.push("Kamu relatif tenang menghadapi imtihan.");

  if (s.fokus < 40) {
    challenges.push("Fokus mudah terpecah saat membaca teks panjang.");
    adaptations.push("Ringkasan & penjelasan AI dipecah jadi bagian pendek dengan subjudul jelas.");
  }
  if (s.stres >= 70) {
    challenges.push("Tekanan menjelang imtihan cukup tinggi.");
    adaptations.push("Tutor memakai nada tenang dan memberi langkah kecil yang bisa langsung dikerjakan.");
  }
  if (s.memori < 40) {
    challenges.push("Hafalan cepat hilang tanpa pengulangan.");
    adaptations.push("Flashcard dibuat lebih banyak & pendek, disertai jembatan keledai, dan poin kunci diulang di akhir.");
  }
  if (s.kecepatan < 40) {
    challenges.push("Butuh waktu lebih untuk memahami materi baru.");
    adaptations.push("Penjelasan dibuat bertahap: satu konsep per langkah dengan contoh sederhana.");
  } else if (s.kecepatan >= 70) {
    adaptations.push("Penjelasan dibuat padat dan langsung ke inti.");
  }
  if (s.motivasi < 40) {
    challenges.push("Sering menunda belajar.");
    adaptations.push("Materi dikaitkan dengan manfaat nyata, dan saran harian memakai target kecil yang realistis.");
  }
  if (s.energi < 40) {
    challenges.push("Energi terbatas untuk sesi panjang.");
    adaptations.push("Saran sesi belajar dibuat singkat dengan jeda istirahat.");
  }
  if (s.praktik >= 65) adaptations.push("Contoh, kasus, dan latihan didahulukan sebelum teori.");
  else if (s.praktik <= 35) adaptations.push("Kaidah, definisi, dan alasan dijelaskan dulu sebelum contoh.");
  if (s.ambisi >= 70) adaptations.push("Kuis & tahriri menyertakan soal tingkat lanjut untuk mengejar nilai tinggi.");

  if (!strengths.length) strengths.push("Profilmu seimbang — tidak ada dimensi yang terlalu rendah.");
  if (!adaptations.length) adaptations.push("Talqeeh memakai gaya penyajian seimbang: ringkas, terstruktur, dengan contoh secukupnya.");
  return { strengths: strengths.slice(0, 3), challenges: challenges.slice(0, 3), adaptations };
};

// Saran belajar harian dari profil (untuk kartu di Beranda).
const dailyAdvice = (profile) => {
  const s = cognitiveScores(profile);
  if (!s) return null;
  const stamina = (s.fokus + s.energi) / 2;
  const session = stamina >= 70 ? { minutes: 45, count: 2, rest: 10 } : stamina >= 40 ? { minutes: 30, count: 3, rest: 7 } : { minutes: 20, count: 3, rest: 5 };
  const cards = s.memori < 40 ? 15 : s.memori >= 70 ? 30 : 20;
  const tips = [];
  if (s.memori < 40) tips.push("Ulang flashcard dua kali sehari (pagi & sebelum tidur) — sedikit tapi sering lebih awet.");
  if (s.fokus < 40) tips.push("Taruh HP di luar jangkauan selama satu sesi; pakai timer.");
  if (s.stres >= 70) tips.push("Mulai sesi dengan doa dan satu target kecil. Selesai satu bab kecil tetap kemajuan.");
  if (s.motivasi < 40) tips.push("Tulis niat belajar hari ini di Beranda sebelum mulai.");
  if (s.kecepatan < 40) tips.push("Baca ringkasan AI dulu, baru masuk ke diktat — peta dulu, detail kemudian.");
  if (s.praktik >= 65) tips.push("Selesai membaca satu bab, langsung kerjakan kuis atau latihan tahriri.");
  if (s.ambisi >= 70 && s.stres < 70) tips.push("Coba latihan tahriri tingkat lanjut untuk mengejar mumtaz.");
  if (!tips.length) tips.push("Pertahankan ritme: sesi rutin setiap hari lebih efektif daripada maraton menjelang imtihan.");
  return { ...session, cards, tips: tips.slice(0, 3) };
};

// Catatan singkat untuk ditempel di prompt Library (sudut pandang "aku").
const learnerNotesForPrompt = (profile) => {
  if (!profile) return "";
  const lines = [];
  const arabic = { pemula: "Bahasa Arabku masih pemula — beri harakat lengkap dan terjemah untuk setiap teks Arab.",
                   menengah: "Bahasa Arabku menengah — beri harakat pada istilah & dalil, terjemahkan kalimat panjang.",
                   lancar: "Bahasa Arabku lancar — boleh banyak bahasa Arab, terjemah seperlunya." }[profile.arabicLevel];
  if (arabic) lines.push(arabic);
  const goal = { imtihan: "Targetku lulus imtihan — fokus ke poin yang sering keluar dan cara menjawabnya.",
                 paham: "Targetku paham mendalam — jelaskan alasan, dalil, dan hubungan antar konsep.",
                 hafalan: "Targetku kuat hafalan — susun dalam bentuk yang mudah dihafal." }[profile.studyGoal];
  if (goal) lines.push(goal);
  const s = cognitiveScores(profile);
  if (s) {
    if (s.fokus < 40) lines.push("Fokusku mudah terpecah — pecah jawaban jadi bagian pendek dengan subjudul.");
    if (s.memori < 40) lines.push("Hafalanku cepat hilang — sertakan jembatan keledai dan ulangi poin kunci di akhir.");
    if (s.kecepatan < 40) lines.push("Aku butuh penjelasan bertahap, satu konsep per langkah.");
    if (s.stres >= 70) lines.push("Aku mudah cemas menjelang imtihan — gunakan nada yang menenangkan.");
    if (s.praktik >= 65) lines.push("Aku lebih cepat paham lewat contoh dan latihan.");
    else if (s.praktik <= 35) lines.push("Aku suka memahami kaidah dan alasannya dulu sebelum contoh.");
  }
  if (!lines.length) return "";
  return "---\n🧭 TENTANG CARA BELAJARKU (sesuaikan jawabanmu):\n" + lines.map(l => `- ${l}`).join("\n");
};

Object.assign(window, {
  COGNITIVE_DIMS, COGNITIVE_ITEMS, LIKERT, scoreCognitive, cogLevel, cognitiveScores,
  cognitiveInsights, dailyAdvice, learnerNotesForPrompt,
});
