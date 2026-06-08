import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
/* Talqeeh — Siap Imtihan Page
   Section di dashboard yang jadi landing, plus halaman penuh /siap-imtihan
*/

/* ============ CONSTANTS ============ */

const IMTIHAN_MODES = [
  {
    id: "kompres",
    label: "Kompres Materi",
    labelArabic: "تلخيص المادة",
    icon: "list",
    color: "violet",
    desc: "Rangkuman padat satu bab — definisi, dalil, hukum, pengecualian. Format siap tulis di kertas ujian.",
    tag: "Tahriri",
  },
  {
    id: "analogi",
    label: "Analogi & Paham",
    labelArabic: "التشبيه والفهم",
    icon: "lightbulb",
    color: "gold",
    desc: "Konsep yang susah dicerna dijelaskan lewat analogi sehari-hari — tapi istilah teknisnya tetap benar.",
    tag: "Tahriri + Syafawi",
  },
  {
    id: "drill",
    label: "Drill Soal Azhari",
    labelArabic: "التدريب على الأسئلة",
    icon: "target",
    color: "violet",
    desc: "Latihan soal persis gaya imtihan Al-Azhar: 'arrif, bayyin, wadhdhih, qaarun. Lengkap dengan model jawaban.",
    tag: "Tahriri",
  },
  {
    id: "syafawi",
    label: "Mock Syafawi",
    labelArabic: "محاكاة الشفوي",
    icon: "messageSquare",
    color: "gold",
    desc: "Simulasi ujian lisan — AI berperan sebagai dosen yang menguji, follow-up jawaban, dan tantang pemahamanmu.",
    tag: "Syafawi",
  },
];

const TALKHISAN_MODES = [
  {
    id: "faham",
    label: "Faham Isi",
    labelArabic: "فَهْمُ الْمُحْتَوَى",
    icon: "lightbulb",
    color: "violet",
    desc: "Terjemah + penjelasan istilah teknis dari talkhisanmu — bahasa mudah, tetap akurat.",
    targetAI: "claude",
    forPhoto: true,
  },
  {
    id: "hafal",
    label: "Poin Hafalan",
    labelArabic: "نِقَاطُ الْحِفْظِ",
    icon: "refresh",
    color: "gold",
    desc: "Ekstrak poin-poin kunci + buat mnemonic supaya cepat hafal sebelum ujian.",
    targetAI: "claude",
    forPhoto: true,
  },
  {
    id: "drill",
    label: "Jadikan Soal",
    labelArabic: "تَحْوِيلٌ إِلَى أَسْئِلَة",
    icon: "target",
    color: "violet",
    desc: "Ubah isi talkhisan jadi soal latihan bergaya imtihan Azhari — lengkap dengan model jawaban.",
    targetAI: "claude",
    forPhoto: true,
  },
  {
    id: "syafawi",
    label: "Mock Syafawi",
    labelArabic: "مُحَاكَاةُ الشَّفَوِي",
    icon: "messageSquare",
    color: "gold",
    desc: "AI berperan sebagai dosen yang nguji berdasarkan isi talkhisanmu — persis simulasi ujian lisan.",
    targetAI: "chatgpt",
    forPhoto: false,
  },
];

/* ============ PROMPT GENERATOR ============ */

const generateImtihanPrompt = (mode, maddah, profile) => {
  const facultyData = (typeof FACULTIES !== "undefined")
    ? FACULTIES.find(f => f.id === profile?.faculty) : null;
  const fakultas = facultyData?.label || "Al-Azhar";
  const tingkat = (typeof TINGKATAN_LABEL !== "undefined")
    ? (TINGKATAN_LABEL[profile?.level] || "thalib") : "thalib";
  const maddahNama = maddah || "[MADDAH — isi nama mata kuliah]";

  const prompts = {

    kompres: `Aku ${tingkat} di ${fakultas}, akan menghadapi ujian Tahriri untuk maddah ${maddahNama}.

Bab/topik yang mau aku kompres: [TULIS BAB ATAU TOPIK]

Buatkan talkhish (rangkuman) siap ujian dengan format berikut — padat, langsung ke inti, tidak ada penjelasan panjang:

1. **Ta'rif** (definisi) — tulis teks Arab istilah + transliterasi + definisi singkat
2. **Arkan/Syuruth** (rukun/syarat) — jika ada, bullet per poin
3. **Dalil utama** — sertakan teks Arab dengan harakat + terjemah + sumber (kitab/hadits)
4. **Hukum** — apa hukumnya? Ada ikhtilaf? Sebutkan madzhab yang berbeda (1 baris tiap madzhab)
5. **Pengecualian/mustatsnayat** — kalau ada
6. **Farq** (perbedaan dengan konsep mirip) — kalau relevan, 1-2 poin

Bahasa: Indonesia akademik. Istilah teknis tetap Arab transliterasi. Teks Arab wajib ada harakat.
Panjang: padat, tidak lebih dari 1 halaman A4 mental. Ini untuk ditulis ulang di kertas ujian.`,

    analogi: `Aku ${tingkat} di ${fakultas}, mau ujian ${maddahNama} tapi ada konsep yang masih susah dicerna secara logis.

Konsep yang mau aku pahami: [TULIS KONSEP YANG SUSAH — mis. mafhum mukhalafah, naskh, 'illah qiyas, dll]

Tolong jelaskan dengan cara berikut:

**Langkah 1 — Definisi dengan istilah yang tepat**
Tulis definisi formal dalam Arab dengan harakat, lalu terjemah akademis. Jangan ubah istilah teknisnya.

**Langkah 2 — Analoginya**
Berikan 1-2 analogi dari kehidupan sehari-hari thalib di Mesir (kehidupan kos, masjid, pasar, kampus). Analogi harus menerangkan *logika konsep*, bukan hanya kesamaan nama.

**Langkah 3 — Kembalikan ke istilah teknis**
Setelah analogi, hubungkan kembali: "Nah, itulah yang dimaksud [ISTILAH] — dalam fiqh/ushul/kalam, [konsep teknis kembali]."

**Langkah 4 — Contoh aplikasi di teks Arab**
Berikan 1 contoh penggunaan konsep ini di ayat/hadits/kaidah. Tulis teks Arabnya dengan harakat.

Ingat: Aku butuh PAHAM, bukan hanya HAFAL. Tapi istilah teknisnya harus tetap benar untuk ujian.`,

    drill: `Aku ${tingkat} di ${fakultas}, mau drill soal ujian Tahriri untuk maddah ${maddahNama}.

Bab/topik yang mau di-drill: [TULIS BAB ATAU TOPIK]

Buat 8 soal dengan gaya khas imtihan Al-Azhar. Campurkan format berikut:

Format soal yang harus ada:
- "عَرِّفْ..." (definisikan...) — setidaknya 2 soal
- "بَيِّنْ الْفَرْقَ بَيْنَ... وَ..." (jelaskan perbedaan antara... dan...) — 1-2 soal
- "وَضِّحْ..." (jelaskan/uraikan...) — 1-2 soal
- "اذْكُرْ... مَعَ الدَّلِيلِ" (sebutkan... beserta dalil) — 1-2 soal
- "مَا حُكْمُ... مَعَ التَّعْلِيلِ" (apa hukum... beserta alasan) — 1 soal

**Tulis soal dalam Bahasa Arab** (untuk membiasakan baca soal Azhari yang memang berbahasa Arab).
Berikan terjemah Indonesia di bawah tiap soal (italic).

**JANGAN kasih jawaban dulu.** Aku akan jawab semua, lalu kamu koreksi per nomor dengan:
- Kaidah/definisi yang benar
- Teks Arab model jawaban (kalau relevan)
- Hal yang biasanya keliru dalam menjawab soal ini`,

    syafawi: `Aku ${tingkat} di ${fakultas}, mau latihan ujian Syafawi untuk maddah ${maddahNama}.

Topik yang mau diuji: [TULIS TOPIK]

Bertindaklah sebagai dosen Al-Azhar yang sedang menguji aku dalam ujian lisan (syafawi). Ikuti aturan berikut:

**Aturan sesi:**
- Mulai dengan 1 pertanyaan pembuka (level dasar)
- Tunggu jawabanku sebelum lanjut
- Kalau jawabanku benar tapi tidak lengkap: tanya follow-up untuk perdalam
- Kalau jawabanku kurang tepat: jangan langsung koreksi — tanya balik "apa dalilnya?" atau "bagaimana kalau kasusnya begini?"
- Setelah 5-6 pertanyaan, naikkan level ke pertanyaan yang lebih kompleks
- Jangan terlalu mudah — dosen Azhari terkenal galak dan detail

**Format pertanyaanmu:**
- Campur Bahasa Arab dan Indonesia (seperti dosen Azhari asli)
- Contoh: "Apa definisi [istilah]?" atau "عَرِّفْ لِي [istilah] بِالضَّبْطِ"

**Di akhir sesi (setelah 8-10 pertanyaan):**
Berikan evaluasi jujur:
- Apa yang sudah aku kuasai dengan baik
- Apa yang perlu diperdalam sebelum ujian
- 3 topik yang paling perlu di-review ulang

Mulai sekarang. Tanya pertanyaan pertamamu.`,
  };

  return prompts[mode] || "";
};

window.generateImtihanPrompt = generateImtihanPrompt;

const generateTalkhisanPrompt = (modeId, teks, profile) => {
  const fakultas = (typeof FAKULTAS_LABEL !== "undefined")
    ? (FAKULTAS_LABEL[profile?.faculty] || "Al-Azhar") : "Al-Azhar";
  const tingkat = (typeof TINGKATAN_LABEL !== "undefined")
    ? (TINGKATAN_LABEL[profile?.level] || "thalib") : "thalib";

  const isiTalkhisan = teks?.trim()
    ? teks.trim()
    : "[PASTE TEKS ARAB TALKHISANMU DI SINI — atau ikuti instruksi foto di bawah]";

  const prompts = {

    faham: `Aku ${tingkat} di ${fakultas} Al-Azhar. Aku punya talkhisan (ringkasan materi ujian) dalam bahasa Arab dan butuh bantuanmu memahaminya.

Ini isi talkhisanku:
"""
${isiTalkhisan}
"""

Tolong bantu aku memahaminya dengan cara berikut:

1. **Tarjamah keseluruhan** — terjemahkan ke Indonesia akademik yang mengalir (bukan harfiyah kaku)

2. **Bedah istilah teknis** — untuk setiap istilah teknis yang muncul, buat tabel:
   | Istilah Arab | Transliterasi | Definisi singkat |

3. **Poin utama** — ringkas inti pembahasan dalam 5-7 poin bullet yang mudah dipahami

4. **Yang sering keliru** — sebutkan bagian mana yang biasanya membingungkan dan kenapa

Bahasa pengantar: Indonesia akademik. Istilah teknis tetap Arab transliterasi. Teks Arab dengan harakat saat kutip.`,

    hafal: `Aku ${tingkat} di ${fakultas} Al-Azhar. Imtihan sudah dekat dan aku butuh hafal talkhisan ini dengan cepat.

Ini isi talkhisanku:
"""
${isiTalkhisan}
"""

Bantu aku hafal efektif dengan:

1. **Ekstrak poin kunci** — buat daftar poin yang WAJIB diingat (format: poin pendek, padat, mudah diingat)

2. **Mnemonic Indonesia** — untuk kelompok poin yang banyak (mis. 5 rukun, 4 syarat), buat akronim atau cerita singkat dalam bahasa Indonesia yang mudah diingat

3. **Kata kunci Arab** — untuk setiap poin, sebutkan kata kunci Arab-nya (1-3 kata) yang bisa jadi "anchor" memori

4. **Urutan logis** — kalau ada urutan yang membantu hafalan (dari umum ke khusus, kronologis, dll), tunjukkan strukturnya

5. **Pertanyaan self-test** — 5 pertanyaan singkat untuk aku test diri sendiri setelah belajar

Bahasa Indonesia. Istilah Arab tetap ada sebagai anchor.`,

    drill: `Aku ${tingkat} di ${fakultas} Al-Azhar, sedang persiapan imtihan. Aku punya talkhisan dan mau mengubahnya jadi soal latihan.

Ini isi talkhisanku:
"""
${isiTalkhisan}
"""

Buat 8 soal latihan bergaya imtihan Al-Azhar dari isi talkhisan ini:

Format soal yang harus ada (campur):
- "عَرِّفْ..." (definisikan) — 2 soal
- "بَيِّنْ الْفَرْقَ بَيْنَ... وَ..." (jelaskan perbedaan) — 2 soal  
- "اذْكُرْ... مَعَ الدَّلِيلِ" (sebutkan beserta dalil) — 2 soal
- "مَا حُكْمُ... مَعَ التَّعْلِيلِ" (apa hukum + alasan) — 1 soal
- "وَضِّحْ..." (jelaskan/uraikan) — 1 soal

Aturan:
- Tulis soal dalam Bahasa Arab (membiasakan baca soal Azhari)
- Beri terjemah Indonesia di bawah tiap soal (italic)
- JANGAN beri jawaban dulu — aku akan jawab sendiri
- Setelah aku jawab semua, koreksi dengan model jawaban ideal

Pastikan soal benar-benar dari isi talkhisan yang aku berikan — bukan soal umum.`,

    syafawi: `Aku ${tingkat} di ${fakultas} Al-Azhar, mau latihan ujian Syafawi berdasarkan talkhisanku.

Ini isi talkhisanku:
"""
${isiTalkhisan}
"""

Bertindaklah sebagai dosen Al-Azhar yang menguji aku dalam ujian lisan. Semua pertanyaanmu harus BERDASARKAN isi talkhisan di atas — jangan tanya di luar itu.

Aturan sesi:
- Mulai dengan 1 pertanyaan dari isi talkhisan (level dasar)
- Tunggu jawabanku sebelum lanjut
- Kalau jawabanku benar tapi kurang lengkap: tanya follow-up sesuai talkhisan
- Kalau jawaban kurang tepat: tanya balik "apa dalilnya?" atau "bagaimana menurut talkhisan?"
- Setelah 6-8 pertanyaan, naikkan level ke pembahasan lebih dalam
- Di akhir: evaluasi jujur — bagian mana yang sudah kuasai, mana yang perlu diperdalam

Format pertanyaan: campur Arab dan Indonesia seperti dosen Azhari asli.

Mulai sekarang — tanya pertanyaan pertamamu.`,
  };

  return prompts[modeId] || "";
};

window.generateTalkhisanPrompt = generateTalkhisanPrompt;

/* ============ KOMPONEN TALKHISAN ============ */

const TalkhisanSection = ({ profile }) => {
  const toast = useToast();
  const [activeMode, setActiveMode] = useState("faham");
  const [teksInput, setTeksInput] = useState("");
  const [inputType, setInputType] = useState("teks");
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [savedToKurasah, setSavedToKurasah] = useState(false);
  const fileRef = useRef(null);

  const session = (() => {
    try { return JSON.parse(localStorage.getItem('madad_session') || '{}'); }
    catch { return {}; }
  })();
  const isMember = !!session.code;

  const [usageCount, setUsageCount] = useState(() => {
    try {
      const today = new Date().toDateString();
      const stored = JSON.parse(localStorage.getItem('talkhisan_usage') || '{}');
      return stored.date === today ? (stored.count || 0) : 0;
    } catch { return 0; }
  });

  const incrementUsage = () => {
    const today = new Date().toDateString();
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem('talkhisan_usage', JSON.stringify({ date: today, count: newCount }));
  };

  const mode = TALKHISAN_MODES.find(m => m.id === activeMode);
  const resolvedPrompt = generateTalkhisanPrompt(activeMode, teksInput, profile);

  if (!isMember) return (
    <div style={{
      padding: '32px 20px', textAlign: 'center',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
    }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
        Fitur Khusus Member
      </div>
      <div style={{ fontSize: 13, color: '#aaa', marginBottom: 16, lineHeight: 1.6 }}>
        Upload dan parse talkhisan dengan AI hanya tersedia untuk member Talqeeh.
      </div>
      <a href="#/maddah-publik" style={{
        display: 'inline-block',
        padding: '10px 24px', borderRadius: 10,
        background: '#3ecf8e', color: '#000',
        fontWeight: 800, fontSize: 13, textDecoration: 'none',
      }}>
        Gabung Member →
      </a>
    </div>
  );

  const compressImage = (file, maxSizeMB = 1.5) => {
    return new Promise((resolve) => {
      if (file.size <= maxSizeMB * 1024 * 1024) { resolve(file); return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ratio = Math.sqrt((maxSizeMB * 1024 * 1024) / file.size);
          canvas.width  = Math.floor(img.width  * ratio);
          canvas.height = Math.floor(img.height * ratio);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            blob => resolve(new File([blob], file.name, { type: 'image/jpeg' })),
            'image/jpeg', 0.85
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFotoUpload = async (file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Foto terlalu besar. Maksimal 10MB.');
      return;
    }

    setUploading(true);
    setUploadError('');
    try {
      const compressed = await compressImage(file);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result.split(',')[1];
        const mimeType = compressed.type || 'image/jpeg';
        const res = await fetch('/api/parse?action=talkhisan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ foto_base64: base64, mime_type: mimeType, member_code: session.code })
        });
        const data = await res.json();

        if (data.error === 'rate_limit') {
          setUploadError('Kamu sudah menggunakan fitur ini 3x hari ini. Coba lagi besok.');
          setUploading(false);
          return;
        }

        if (data.ok && data.teks !== 'FOTO_TIDAK_TERBACA') {
          setTeksInput(data.teks);
          setInputType('teks');
          incrementUsage();
          toast.push('Talkhisan berhasil dibaca — silakan pilih mode di bawah');
        } else if (data.teks === 'FOTO_TIDAK_TERBACA') {
          setUploadError('Foto tidak terbaca. Pastikan foto jelas dan cukup cahaya.');
        } else {
          setUploadError(data.error || 'Gagal membaca foto');
        }
        setUploading(false);
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      setUploadError('Gagal upload: ' + err.message);
      setUploading(false);
    }
  };

  const handlePdfUpload = async (file) => {
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('File PDF terlalu besar. Maksimal 15MB.');
      return;
    }

    setUploading(true);
    setUploadError('');
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          document.head.appendChild(script);
          await new Promise(resolve => script.onload = resolve);

          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

          const pdf = await window.pdfjsLib.getDocument({ data: e.target.result }).promise;

          if (pdf.numPages > 30) {
            setUploadError(`PDF ini punya ${pdf.numPages} halaman — melebihi batas 30 halaman. Talkhisan biasanya tidak sepanjang itu. Coba potong PDF atau upload per bagian.`);
            setUploading(false);
            return;
          }

          const maxPages = pdf.numPages;
          const pages = [];

          for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            let pageText = '';
            let lastY = null;
            for (const item of textContent.items) {
              if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) pageText += '\n';
              pageText += item.str;
              lastY = item.transform[5];
            }
            if (pageText.trim()) pages.push(pageText.trim());
          }

          if (pages.length === 0) {
            setUploadError('PDF ini berupa scan/gambar — tidak ada teks yang bisa diekstrak. Screenshot halaman dan upload sebagai foto.');
            setUploading(false);
            return;
          }

          const res = await fetch('/api/parse?action=talkhisan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pdf_pages: pages, member_code: session.code })
          });

          const data = await res.json();

          if (data.error === 'rate_limit') {
            setUploadError('Kamu sudah menggunakan fitur ini 3x hari ini. Coba lagi besok.');
            setUploading(false);
            return;
          }

          if (data.ok) {
            setTeksInput(data.teks);
            setInputType('teks');
            incrementUsage();
            toast.push(`${pages.length} halaman berhasil dibaca — pilih mode di bawah`);
          } else {
            setUploadError(data.error || 'Gagal proses PDF');
          }
        } catch (err) {
          setUploadError('Gagal proses PDF: ' + err.message);
        }
        setUploading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setUploadError('Gagal upload: ' + err.message);
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type === 'application/pdf') {
      handlePdfUpload(file);
    } else if (file.type.startsWith('image/')) {
      handleFotoUpload(file);
    } else {
      setUploadError('Format tidak didukung. Gunakan JPG, PNG, atau PDF.');
    }
  };

  const handleSaveToKurasah = async () => {
    if (!teksInput.trim()) return;
    try {
      const note = {
        id: `talkhisan_${Date.now()}`,
        title: `Talkhisan — ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
        body: teksInput,
        tags: ['talkhisan', 'siap-imtihan'],
        source: { type: 'talkhisan' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem('madad_notes') || '[]');
      localStorage.setItem('madad_notes', JSON.stringify([note, ...existing]));
      setSavedToKurasah(true);
      toast.push('Talkhisan tersimpan ke Kurasah');
      setTimeout(() => setSavedToKurasah(false), 3000);
    } catch (err) {
      toast.push('Gagal simpan ke Kurasah');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resolvedPrompt);
    setCopied(true);
    toast.push("Prompt tersalin — paste ke AI.");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyAndOpen = () => {
    navigator.clipboard.writeText(resolvedPrompt);
    const toolId = mode?.targetAI || "claude";
    const tool = AI_TOOLS.find(t => t.id === toolId);
    if (tool?.link) setTimeout(() => window.open(tool.link, "_blank"), 300);
    toast.push(`Prompt tersalin — membuka ${tool?.name}...`);
  };

  const targetTool = AI_TOOLS.find(t => t.id === (mode?.targetAI || "claude"));

  return (
    <div className="card-glass-strong p-5 md:p-6 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gold-500/8 blur-3xl pointer-events-none"/>
      <div className="relative">

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="arabic-display text-gold-300 text-xl" style={{direction:"rtl"}}>تَلْخِيص</div>
            <div className="text-xs uppercase tracking-wider text-gold-400 font-medium">Bedah Talkhisan</div>
          </div>
          <p className="text-sm text-ink-muted leading-relaxed">
            Punya talkhisan ujian? Pilih mode, tempel teksnya, salin prompt ke AI.
          </p>
        </div>

        {/* Input type toggle — 3 opsi */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setInputType("teks")}
            className={`flex-1 py-2 rounded-xl text-sm border font-medium transition-colors ${
              inputType === "teks"
                ? "text-emerald-200 border-emerald-600/35"
                : "bg-white/4 text-ink-muted border-white/8 hover:bg-white/7"
            }`}
            style={inputType === "teks" ? {background:"rgba(62,207,142,0.20)"} : {}}>
            📋 Paste Teks
          </button>
          <button
            onClick={() => setInputType("upload")}
            className={`flex-1 py-2 rounded-xl text-sm border font-medium transition-colors ${
              inputType === "upload"
                ? "text-emerald-200 border-emerald-600/35"
                : "bg-white/4 text-ink-muted border-white/8 hover:bg-white/7"
            }`}
            style={inputType === "upload" ? {background:"rgba(62,207,142,0.20)"} : {}}>
            📤 Upload PDF/Foto
          </button>
          <button
            onClick={() => setInputType("foto")}
            className={`flex-1 py-2 rounded-xl text-sm border font-medium transition-colors ${
              inputType === "foto"
                ? "bg-gold-500/15 text-gold-200 border-gold-500/30"
                : "bg-white/4 text-ink-muted border-white/8 hover:bg-white/7"
            }`}>
            📷 Panduan Foto
          </button>
        </div>

        {/* Input area — teks */}
        {inputType === "teks" && (
          <div className="mb-4">
            <label className="text-xs text-ink-soft mb-1.5 block">
              Paste teks Arab talkhisanmu di sini:
            </label>
            <textarea
              value={teksInput}
              onChange={e => setTeksInput(e.target.value)}
              placeholder="الحمد لله رب العالمين... (paste teks Arab dari PDF talkhisanmu)"
              className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-sm text-ink placeholder-ink-soft outline-none transition-colors resize-none arabic"
              onFocus={e => e.target.style.borderColor="rgba(62,207,142,0.45)"}
              onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.10)"}
              style={{ minHeight: 120, direction: "rtl", fontSize: 15, lineHeight: 1.8 }}
              rows={5}
            />
            <div className="flex justify-between text-xs text-ink-soft mt-1">
              <span>{teksInput.length > 0 ? `${teksInput.length} karakter` : "Kosong — prompt akan pakai placeholder"}</span>
              {teksInput && (
                <button onClick={() => setTeksInput("")} className="text-rose-600 hover:text-rose-500">
                  Hapus
                </button>
              )}
            </div>
          </div>
        )}

        {/* Input area — upload PDF/Foto */}
        {inputType === "upload" && (
          <div className="mb-4">
            {/* Usage counter */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <span style={{
                fontSize: 11, color: usageCount >= 3 ? '#ff8080' : '#888',
                background: 'rgba(255,255,255,0.04)',
                padding: '3px 10px', borderRadius: 99,
                border: `1px solid ${usageCount >= 3 ? 'rgba(255,80,80,0.3)' : 'rgba(255,255,255,0.08)'}`,
              }}>
                {usageCount >= 3
                  ? '⛔ Batas harian tercapai'
                  : `📊 Sisa hari ini: ${3 - usageCount}x parse`}
              </span>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {usageCount >= 3 ? (
              <div style={{
                padding: '24px 20px', textAlign: 'center',
                background: 'rgba(255,80,80,0.04)',
                border: '1px solid rgba(255,80,80,0.2)',
                borderRadius: 14,
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>⛔</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#ff8080', marginBottom: 6 }}>
                  Batas harian tercapai
                </div>
                <div style={{ fontSize: 12, color: '#888' }}>
                  Kamu sudah parse 3x hari ini. Fitur ini reset setiap hari. Coba lagi besok!
                </div>
              </div>
            ) : uploading ? (
              <div style={{
                padding: '32px 20px', textAlign: 'center',
                background: 'rgba(62,207,142,0.04)',
                border: '1px solid rgba(62,207,142,0.2)',
                borderRadius: 14,
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                <div style={{ fontSize: 14, color: '#3ecf8e', fontWeight: 700 }}>
                  AI sedang membaca talkhisanmu...
                </div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 6 }}>
                  Biasanya 10–20 detik
                </div>
              </div>
            ) : teksInput ? (
              <div style={{
                padding: '16px', background: 'rgba(62,207,142,0.06)',
                border: '1px solid rgba(62,207,142,0.3)', borderRadius: 14,
              }}>
                <div style={{ fontSize: 13, color: '#3ecf8e', fontWeight: 700, marginBottom: 8 }}>
                  ✅ Talkhisan berhasil dibaca!
                </div>
                <div style={{ fontSize: 12, color: '#aaa', marginBottom: 12 }}>
                  {teksInput.length} karakter · Pindah ke tab "Paste Teks" untuk edit, atau langsung pilih mode di bawah.
                </div>
                <button
                  onClick={() => { setTeksInput(''); setUploadError(''); }}
                  style={{ fontSize: 12, color: '#ff8080', background: 'none', border: 'none', cursor: 'pointer' }}>
                  🗑️ Hapus & upload ulang
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  padding: '40px 20px', textAlign: 'center', cursor: 'pointer',
                  background: 'rgba(255,255,255,0.02)',
                  border: '2px dashed rgba(62,207,142,0.3)',
                  borderRadius: 14, transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(62,207,142,0.6)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(62,207,142,0.3)'}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>📄</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                  Upload Talkhisan
                </div>
                <div style={{ fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>
                  PDF atau foto (JPG/PNG)<br/>
                  AI akan baca teks Arab secara otomatis
                </div>
                <div style={{
                  marginTop: 14, display: 'inline-block',
                  padding: '8px 20px', borderRadius: 10,
                  background: 'rgba(62,207,142,0.15)',
                  border: '1px solid rgba(62,207,142,0.3)',
                  fontSize: 13, color: '#3ecf8e', fontWeight: 700,
                }}>
                  Pilih File →
                </div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 10 }}>
                  Maks. foto: dikompresi otomatis · PDF: maks. 10 halaman
                </div>
              </div>
            )}
            {uploadError && (
              <div style={{
                marginTop: 10, padding: '10px 14px',
                background: 'rgba(255,80,80,0.08)',
                border: '1px solid rgba(255,80,80,0.2)',
                borderRadius: 10, fontSize: 13, color: '#ff8080',
              }}>
                ⚠️ {uploadError}
              </div>
            )}
          </div>
        )}

        {/* Input area — foto */}
        {inputType === "foto" && (
          <div className="mb-4 p-4 rounded-xl bg-gold-500/8 border border-gold-500/20">
            <div className="text-xs uppercase tracking-wider text-gold-300 mb-2 font-medium">
              📷 Cara pakai dengan foto talkhisan
            </div>
            <ol className="space-y-2 text-sm text-ink-muted">
              <li className="flex gap-2">
                <span className="text-gold-400 font-medium flex-shrink-0">1.</span>
                <span>Salin prompt di bawah (pilih mode dulu)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gold-400 font-medium flex-shrink-0">2.</span>
                <span>Buka <strong className="text-ink">Claude</strong> atau <strong className="text-ink">Gemini</strong> — keduanya bisa baca foto</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gold-400 font-medium flex-shrink-0">3.</span>
                <span>Upload foto talkhisanmu (klik ikon paperclip/attachment)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gold-400 font-medium flex-shrink-0">4.</span>
                <span>Paste prompt di bawah foto → kirim</span>
              </li>
            </ol>
            <p className="text-xs text-ink-soft mt-2">
              AI akan baca teks Arab dari fotomu dan jalankan mode yang kamu pilih.
            </p>
          </div>
        )}

        {/* Mode tabs */}
        <div className="mb-4">
          <label className="text-xs text-ink-soft mb-2 block">Pilih mode:</label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
            {TALKHISAN_MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setActiveMode(m.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border font-medium transition-colors ${
                  activeMode === m.id
                    ? m.color === "gold"
                      ? "bg-gold-500/15 text-gold-200 border-gold-500/30"
                      : "text-emerald-200 border-emerald-600/35"
                    : "bg-white/4 text-ink-muted border-white/8 hover:bg-white/7"
                }`}
                style={activeMode === m.id && m.color !== "gold" ? {background:"rgba(62,207,142,0.20)",minHeight:36} : {minHeight:36}}>
                <Icon name={m.icon} className="w-3.5 h-3.5"/>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mode description */}
        {mode && (
          <div className="flex items-start gap-2 mb-4 p-3 rounded-xl border" style={{background:"rgba(255,255,255,0.03)",borderColor:"rgba(255,255,255,0.08)"}}>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
              mode.color === "gold" ? "bg-gold-500/15" : ""
            }`} style={mode.color !== "gold" ? {background:"rgba(62,207,142,0.16)"} : {}}>
              <Icon name={mode.icon} className={`w-3.5 h-3.5 ${
                mode.color === "gold" ? "text-gold-300" : "text-emerald-300"
              }`}/>
            </div>
            <div>
              <div className="text-sm font-medium text-ink">{mode.label}</div>
              <div className="text-xs text-ink-muted mt-0.5 leading-relaxed">{mode.desc}</div>
              {inputType === "foto" && !mode.forPhoto && (
                <div className="text-xs text-rose-600 mt-1">
                  ⚠️ Mode ini lebih optimal dengan teks — pertimbangkan switch ke tab Teks
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preview prompt */}
        <div className="p-3 rounded-xl mb-4" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>
          <div className="text-xs text-ink-soft mb-1.5">Preview prompt:</div>
          <div className="text-xs text-ink-muted leading-relaxed font-mono whitespace-pre-wrap line-clamp-4">
            {resolvedPrompt.slice(0, 250)}...
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleCopy}
            className="btn-ghost text-xs px-4 py-2.5 flex items-center gap-1.5"
            style={{minHeight: 40}}>
            <Icon name="copy" className="w-3.5 h-3.5"/>
            {copied ? "Tersalin ✓" : "Salin Prompt"}
          </button>
          {targetTool && (
            <button
              onClick={handleCopyAndOpen}
              className="btn-primary text-xs px-4 py-2.5 flex items-center gap-1.5"
              style={{minHeight: 40}}>
              Salin & Buka {targetTool.name}
              <Icon name="external" className="w-3 h-3"/>
            </button>
          )}
        </div>

        {/* Tombol simpan ke Kurasah */}
        {teksInput.trim() && (
          <button
            onClick={handleSaveToKurasah}
            style={{
              width: '100%',
              marginTop: 8,
              padding: '10px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.1)',
              background: savedToKurasah ? 'rgba(62,207,142,0.15)' : 'rgba(255,255,255,0.04)',
              color: savedToKurasah ? '#3ecf8e' : '#aaa',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {savedToKurasah ? '✅ Tersimpan di Kurasah' : '📒 Simpan Talkhisan ke Kurasah'}
          </button>
        )}

        {/* Loop closer — simpan ke Kurasah setelah dapat hasil */}
        {copied && (
          <div className="mt-3 flex items-center justify-between gap-2 p-3 rounded-lg bg-gold-500/8 border border-gold-500/20">
            <p className="text-xs text-ink-muted">
              <span className="text-gold-300 font-medium">Sudah dapat jawaban AI?</span>
              {" "}Simpan ke Kurasah supaya bisa review lagi.
            </p>
            <button
              onClick={() => {
                const newNote = {
                  id: "note_" + Date.now(),
                  title: `Talkhisan — ${mode?.label || "Bedah"}`,
                  body: `## Mode\n${mode?.label}\n\n## Isi Talkhisan\n\n${teksInput || "*[foto/scan]*"}\n\n## Hasil AI\n\n*Paste jawaban AI di sini...*\n\n## Poin penting\n\n1. \n2. \n3. `,
                  tags: ["talkhisan", "siap-imtihan"],
                  source: { type: "talkhisan", label: "Bedah Talkhisan" },
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                if (typeof loadNotes !== "undefined" && typeof saveNotes !== "undefined") {
                  saveNotes([newNote, ...loadNotes()]);
                }
                navigate("/kurasah?id=" + newNote.id);
              }}
              className="btn-ghost text-xs px-3 py-1.5 border border-gold-500/20 text-gold-300 hover:bg-gold-500/8 flex-shrink-0"
              style={{minHeight: 36}}>
              <Icon name="notebook" className="w-3 h-3 mr-1"/>
              Simpan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============ KOMPONEN PROMPT CARD ============ */

const ImtihanPromptCard = ({ mode, maddah, profile }) => {
  const toast = useToast();
  const [copied, setCopied] = React.useState(false);
  const [targetAI, setTargetAI] = React.useState(
    mode.id === "syafawi" ? "chatgpt" : "claude"
  );

  const prompt = generateImtihanPrompt(mode.id, maddah, profile);
  const recommendedAIs = {
    kompres:  ["claude", "chatgpt"],
    analogi:  ["claude", "chatgpt"],
    drill:    ["claude", "chatgpt"],
    syafawi:  ["chatgpt", "claude"],
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast.push("Prompt tersalin — paste ke AI, isi placeholder [...].");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyAndOpen = () => {
    navigator.clipboard.writeText(prompt);
    const tool = AI_TOOLS.find(t => t.id === targetAI);
    if (tool?.link) setTimeout(() => window.open(tool.link, "_blank"), 300);
    toast.push(`Prompt tersalin — membuka ${tool?.name}...`);
  };

  const colorClass = mode.color === "gold"
    ? "border-gold-500/20 bg-gold-500/5"
    : "";

  return (
    <div className={`card-glass p-5 md:p-6 border ${colorClass} relative overflow-hidden`}
      style={mode.color !== "gold" ? {borderColor:"rgba(62,207,142,0.20)",background:"rgba(62,207,142,0.04)"} : {}}>
      <div className={`absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl pointer-events-none ${
        mode.color === "gold" ? "bg-gold-500/10" : "bg-emerald-600/8"
      }`}/>

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                mode.color === "gold" ? "bg-gold-500/15" : ""
              }`} style={mode.color !== "gold" ? {background:"rgba(62,207,142,0.18)"} : {}}>
                <Icon name={mode.icon} className={`w-4 h-4 ${
                  mode.color === "gold" ? "text-gold-300" : "text-emerald-300"
                }`}/>
              </div>
              <h3 className="font-display text-lg font-semibold text-ink">{mode.label}</h3>
            </div>
            <div className="arabic-display text-sm text-ink-soft" style={{direction:"rtl"}}>
              {mode.labelArabic}
            </div>
          </div>
          <span className={`text-[10px] px-2 py-1 rounded-full border font-medium flex-shrink-0 ${
            mode.color === "gold"
              ? "bg-gold-500/10 text-gold-300 border-gold-500/20"
              : ""
          }`} style={mode.color !== "gold" ? {background:"rgba(62,207,142,0.12)",color:"#c4aff9",borderColor:"rgba(62,207,142,0.28)"} : {}}>
            {mode.tag}
          </span>
        </div>

        <p className="text-sm text-ink-muted leading-relaxed mb-4">{mode.desc}</p>

        {/* AI selector */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-ink-soft">Pakai:</span>
          {recommendedAIs[mode.id].map(toolId => {
            const tool = AI_TOOLS.find(t => t.id === toolId);
            if (!tool) return null;
            return (
              <button key={toolId} onClick={() => setTargetAI(toolId)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs border font-medium transition-colors ${
                  targetAI === toolId
                    ? "text-emerald-200 border-emerald-600/35"
                    : "bg-white/4 text-ink-muted border-white/8 hover:bg-white/7"
                }`}
                style={targetAI === toolId ? {background:"rgba(62,207,142,0.18)"} : {}}>
                <ToolIcon tool={tool} size="w-4 h-4" rounded="rounded-sm"/>
                {tool.name}
              </button>
            );
          })}
        </div>

        {/* Preview prompt (3 baris) */}
        <div className="p-3 rounded-xl mb-4" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>
          <p className="text-xs text-ink-soft font-mono leading-relaxed line-clamp-3 whitespace-pre-wrap">
            {prompt.slice(0, 220)}...
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleCopy}
            className="btn-ghost text-xs px-3 py-2 flex items-center gap-1.5"
            style={{minHeight:40}}>
            <Icon name="copy" className="w-3 h-3"/>
            {copied ? "Tersalin ✓" : "Salin Prompt"}
          </button>
          <button onClick={handleCopyAndOpen}
            className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
            style={{minHeight:40}}>
            Salin & Buka {AI_TOOLS.find(t => t.id === targetAI)?.name}
            <Icon name="external" className="w-3 h-3"/>
          </button>
        </div>

        {/* Loop-closer: simpan hasil ke Kurasah */}
        {copied && (
          <div className="mt-3 flex items-center justify-between gap-2 p-3 rounded-lg bg-gold-500/8 border border-gold-500/20">
            <p className="text-xs text-ink-muted">
              <span className="text-gold-300 font-medium">Sudah dapat jawaban AI?</span>
              {" "}Simpan ke Kurasah supaya bisa review lagi.
            </p>
            <button onClick={() => {
              const newNote = {
                id: "note_" + Date.now(),
                title: `Siap Imtihan — ${mode.label}`,
                body: `## Mode\n${mode.label}\n\n## Maddah\n${maddah || "[isi maddah]"}\n\n## Catatan dari AI\n\n*Paste jawaban AI di sini...*\n\n## Poin penting untuk diingat\n\n1. \n2. \n3. `,
                tags: ["siap-imtihan", mode.id],
                source: { type: "imtihan", label: mode.label },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              const existing = loadNotes();
              saveNotes([newNote, ...existing]);
              navigate("/kurasah?id=" + newNote.id);
            }}
              className="btn-ghost text-xs px-3 py-1.5 border border-gold-500/20 text-gold-300 hover:bg-gold-500/8 flex-shrink-0"
              style={{minHeight:36}}>
              <Icon name="notebook" className="w-3 h-3 mr-1"/>
              Simpan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============ HALAMAN PENUH /siap-imtihan ============ */

/* ============ MODAL DETAIL SOAL ============ */
const SalinPromptButton = ({ prompt, nomor }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(() => alert('Gagal salin — coba manual'));
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        width: '100%',
        padding: '11px 16px',
        borderRadius: 10,
        border: copied
          ? '1px solid rgba(62,207,142,0.5)'
          : '1px solid rgba(62,207,142,0.25)',
        background: copied
          ? 'rgba(62,207,142,0.15)'
          : 'rgba(62,207,142,0.06)',
        color: copied ? '#3ecf8e' : '#aaa',
        fontWeight: 700,
        fontSize: 13,
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      {copied ? (
        <>✅ Prompt Tersalin! Paste ke Claude atau ChatGPT</>
      ) : (
        <>📋 Salin Prompt Jawaban Soal {nomor}</>
      )}
    </button>
  );
};

const SoalDetailModal = ({ soal, soalList, onClose, isMember }) => {
  if (!soal) return null;
  const soalToRender = soalList && soalList.length > 0 ? soalList : [soal];
  const EM = '#3ecf8e';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 560, maxHeight: '88vh',
          background: '#111', borderRadius: 20,
          border: '1px solid rgba(62,207,142,0.2)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 11, color: EM, fontWeight: 700, letterSpacing: 1 }}>BANK SOAL</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>
              {soal.maddah_nama} · {soal.tahun} · {soal.fashl === 'awwal' ? 'Fashl Awwal' : 'Fashl Tsani'}
            </div>
          </div>
          <button onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.05)',
              color: '#aaa', cursor: 'pointer', fontSize: 16,
            }}>✕</button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '20px' }}>

          {soal.soal && soal.soal.includes('[SOAL_ARAB]') ? (
            soal.soal.split('[SOAL_ARAB]').filter(Boolean).map((block, i) => {
              const parts = block.split('[ARTI]');
              const arab  = parts[0]?.trim();
              const arti  = parts[1]?.trim();
              const nomor = i + 1;

              const prompt = `Kamu adalah asisten akademik Al-Azhar yang ahli bahasa Arab dan ilmu-ilmu syariah.

Soal ujian tahriri dari Universitas Al-Azhar Kairo:
Maddah: ${soal.maddah_nama}
Tahun: ${soal.tahun} · ${soal.fashl === 'awwal' ? 'Fashl Awwal' : 'Fashl Tsani'}

Soal No. ${nomor}:
${arab}

${arti ? `Arti soal: ${arti}` : ''}

TUGAS: Jawab soal ini sesuai manhaj Al-Azhar dengan format:

1. JAWABAN (Bahasa Arab):
Tulis jawaban dalam bahasa Arab sesuai gaya tahriri Azhari — mulai dengan ta'rif, lalu dalil/syahid, lalu tafshil. Kutip ayat/hadits HANYA kalau yakin 100% benar. Kalau tidak yakin, tulis "كما ورد في القرآن الكريم" tanpa menyebut ayat spesifik.

2. PENJELASAN (Bahasa Indonesia):
Jelaskan inti jawaban dalam bahasa Indonesia yang mudah dipahami mahasiswa Indonesia. Sertakan penjelasan istilah teknis.`;

              return (
                <div key={i} style={{
                  marginBottom: 20,
                  paddingBottom: 20,
                  borderBottom: i < soal.soal.split('[SOAL_ARAB]').filter(Boolean).length - 1
                    ? '1px solid rgba(255,255,255,0.06)'
                    : 'none',
                }}>
                  <div style={{
                    fontSize: 11, color: '#3ecf8e', fontWeight: 700,
                    marginBottom: 10, letterSpacing: 0.5,
                  }}>
                    SOAL {nomor}
                  </div>

                  {arab && (
                    <div style={{
                      direction: 'rtl', textAlign: 'right',
                      fontSize: 16, lineHeight: 2,
                      color: '#eee', fontFamily: 'serif',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10, padding: '12px 14px',
                      marginBottom: 10,
                    }}>
                      {arab}
                    </div>
                  )}

                  {arti && (
                    <div style={{
                      fontSize: 13, color: '#aaa', lineHeight: 1.7,
                      marginBottom: 12,
                      paddingLeft: 12,
                      borderLeft: '2px solid rgba(62,207,142,0.3)',
                    }}>
                      {arti}
                    </div>
                  )}

                  {isMember ? (
                    <SalinPromptButton prompt={prompt} nomor={nomor} />
                  ) : (
                    <div style={{
                      padding: '16px',
                      background: 'rgba(62,207,142,0.04)',
                      border: '1px solid rgba(62,207,142,0.15)',
                      borderRadius: 12,
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 20, marginBottom: 8 }}>🔒</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                        Prompt jawaban untuk member Talqeeh
                      </div>
                      <div style={{ fontSize: 13, color: '#aaa', marginBottom: 14, lineHeight: 1.6 }}>
                        Login sebagai member untuk akses prompt jawaban yang siap dipakai di Claude atau ChatGPT.
                      </div>
                      <a href="#/" style={{
                        display: 'inline-block',
                        padding: '9px 22px', borderRadius: 10,
                        background: '#3ecf8e', color: '#000',
                        fontWeight: 800, fontSize: 13,
                        textDecoration: 'none',
                      }}>
                        Gabung Member →
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{
              direction: 'rtl', textAlign: 'right',
              fontSize: 15, lineHeight: 2,
              color: '#eee', fontFamily: 'serif',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: '14px 16px',
            }}>
              {soal.soal || 'Teks soal belum tersedia'}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

/* ============ BANK SOAL SECTION ============ */
const BankSoalSection = () => {
  const isMember = (() => {
    try {
      const s = JSON.parse(localStorage.getItem('madad_session') || '{}');
      return !!s.code;
    } catch { return false; }
  })();

  const [soalList, setSoalList]         = React.useState([]);
  const [loading, setLoading]           = React.useState(true);
  const [filter, setFilter]             = React.useState({ fakultas: '', maddah: '', tahun: '' });
  const [selectedSoal, setSelectedSoal] = React.useState(null);

  React.useEffect(() => {
    const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  || '';
    const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnon) {
      console.error('[BankSoal] Config tidak tersedia', { supabaseUrl, supabaseAnon });
      setLoading(false);
      return;
    }

    const url = `${supabaseUrl}/rest/v1/bank_soal?status=eq.approved&select=id,maddah_id,maddah_nama,fakultas,tingkat,tahun,fashl,soal&order=approved_at.desc&limit=200`;
    console.log('[BankSoal] Fetching:', url);

    fetch(url, {
      headers: {
        'apikey': supabaseAnon,
        'Authorization': `Bearer ${supabaseAnon}`,
        'Accept': 'application/json',
      }
    })
      .then(r => {
        console.log('[BankSoal] Response status:', r.status);
        return r.json();
      })
      .then(data => {
        console.log('[BankSoal] Data received:', data);
        if (Array.isArray(data) && data.length > 0) {
          setSoalList(data);
          console.log('[BankSoal] soalList set:', data.length, 'items');
        } else {
          console.warn('[BankSoal] Data kosong atau bukan array:', data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('[BankSoal] Fetch error:', err);
        setLoading(false);
      });
  }, []);

  const fakultasList = [...new Set(soalList.map(s => s.fakultas).filter(Boolean))].sort();
  const maddahList   = [...new Set(
    soalList
      .filter(s => !filter.fakultas || s.fakultas === filter.fakultas)
      .map(s => s.maddah_nama)
      .filter(Boolean)
  )].sort();
  const tahunList    = [...new Set(soalList.map(s => s.tahun).filter(Boolean))].sort().reverse();

  const filtered = soalList.filter(s =>
    (!filter.fakultas || s.fakultas === filter.fakultas) &&
    (!filter.maddah   || s.maddah_nama === filter.maddah) &&
    (!filter.tahun    || s.tahun === filter.tahun)
  );

  const grouped = filtered.reduce((acc, soal) => {
    const key = `${soal.maddah_nama}|${soal.tahun}|${soal.fashl}`;
    if (!acc[key]) acc[key] = { ...soal, count: 0, soalList: [] };
    acc[key].count++;
    acc[key].soalList.push(soal);
    return acc;
  }, {});

  const EM = '#3ecf8e';
  const hasFilter = filter.fakultas || filter.maddah || filter.tahun;

  return (
    <section style={{ background: 'rgba(62,207,142,0.025)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '24px 0 28px' }}>
      <div className="container-x">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: EM, fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 }}>
              DARI MASISIR UNTUK MASISIR
            </div>
            <h2 className="font-display" style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
              🗂️ Bank Soal Imtihan
            </h2>
            <p style={{ fontSize: 13, color: '#999', margin: 0 }}>
              Soal ujian tahun-tahun sebelumnya, dikumpulkan dari kontributor Masisir.
            </p>
          </div>
          <a href="#/submit-soal" style={{
            padding: '9px 16px', borderRadius: 10,
            background: 'rgba(62,207,142,0.12)',
            border: '1px solid rgba(62,207,142,0.3)',
            color: EM, fontSize: 12, fontWeight: 700,
            textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            📸 Submit Soal → Dapat Reward
          </a>
        </div>

        {/* Filter horizontal */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <select
            value={filter.fakultas}
            onChange={e => setFilter(f => ({ ...f, fakultas: e.target.value, maddah: '' }))}
            style={{
              flex: 1, minWidth: 120, padding: '8px 10px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              background: '#1a1a1a', color: filter.fakultas ? '#fff' : '#666', fontSize: 12,
            }}
          >
            <option value="">Semua Fakultas</option>
            {fakultasList.map(f => <option key={f} value={f}>{f}</option>)}
          </select>

          <select
            value={filter.maddah}
            onChange={e => setFilter(f => ({ ...f, maddah: e.target.value }))}
            style={{
              flex: 2, minWidth: 160, padding: '8px 10px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              background: '#1a1a1a', color: filter.maddah ? '#fff' : '#666', fontSize: 12,
            }}
          >
            <option value="">Semua Maddah</option>
            {maddahList.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <select
            value={filter.tahun}
            onChange={e => setFilter(f => ({ ...f, tahun: e.target.value }))}
            style={{
              flex: 1, minWidth: 110, padding: '8px 10px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              background: '#1a1a1a', color: filter.tahun ? '#fff' : '#666', fontSize: 12,
            }}
          >
            <option value="">Semua Tahun</option>
            {tahunList.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {hasFilter && (
            <button
              onClick={() => setFilter({ fakultas: '', maddah: '', tahun: '' })}
              style={{
                padding: '8px 12px', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent', color: '#888',
                fontSize: 12, cursor: 'pointer',
              }}
            >
              ✕ Reset
            </button>
          )}
        </div>

        {/* Summary */}
        {!loading && (
          <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
            {filtered.length > 0
              ? `${Object.keys(grouped).length} slot tersedia · ${filtered.length} soal`
              : 'Belum ada soal untuk filter ini'}
          </div>
        )}

        {/* Grid soal */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '32px 0', fontSize: 13 }}>
            Memuat bank soal...
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '32px 20px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.08)',
            borderRadius: 14,
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
            <div style={{ fontSize: 14, color: '#888', marginBottom: 12 }}>
              {soalList.length === 0
                ? 'Belum ada soal yang tersedia.'
                : 'Belum ada soal untuk filter ini.'}
            </div>
            <a href="#/submit-soal" style={{
              display: 'inline-block', padding: '9px 20px', borderRadius: 9,
              background: EM, color: '#000',
              fontWeight: 800, fontSize: 13, textDecoration: 'none',
            }}>
              Jadilah yang pertama submit! →
            </a>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 10,
          }}>
            {Object.entries(grouped).map(([key, group]) => (
              <div
                key={key}
                onClick={() => isMember ? setSelectedSoal(group) : null}
                style={{
                  padding: '14px 16px', borderRadius: 12,
                  border: '1px solid rgba(62,207,142,0.2)',
                  background: 'rgba(62,207,142,0.04)',
                  cursor: isMember ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  if (isMember) e.currentTarget.style.borderColor = 'rgba(62,207,142,0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(62,207,142,0.2)';
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                  {group.maddah_nama}
                </div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>
                  {group.tahun} · {group.fashl === 'awwal' ? 'Fashl Awwal' : 'Fashl Tsani'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: EM, fontWeight: 700 }}>
                    ✅ {group.count} soal tersedia
                  </span>
                  {isMember ? (
                    <span style={{ fontSize: 11, color: EM }}>Buka →</span>
                  ) : (
                    <span style={{ fontSize: 11, color: '#666' }}>🔒</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal detail soal */}
        {selectedSoal && (
          <SoalDetailModal
            soal={selectedSoal.soalList[0]}
            soalList={selectedSoal.soalList}
            onClose={() => setSelectedSoal(null)}
            isMember={isMember}
          />
        )}
      </div>
    </section>
  );
};

const SiapImtihanPage = () => {
  const { session, profile } = useAuth();
  const [activeMaddah, setActiveMaddah] = React.useState("");
  const [activeMode, setActiveMode] = React.useState("kompres");

  if (!session || !profile?.onboarded) { navigate("/"); return null; }

  const myMaddahs = (typeof getMaddahsForProfile !== "undefined")
    ? getMaddahsForProfile(profile).filter(m =>
        m.prompts && Object.values(m.prompts).some(a => a.length > 0)
      ).slice(0, 10)
    : [];

  const currentMode = IMTIHAN_MODES.find(m => m.id === activeMode);

  return (
    <div className="page-enter mobile-page-wrap">
      {/* Header */}
      <section className="relative pt-6 md:pt-12 pb-6 overflow-hidden">
        <div className="pattern-talqih"/>
        <Blob color="rgba(62,207,142,0.2)" size={500} top={-150} right={-80}/>

        <div className="container-x relative">
          <button onClick={() => navigate("/dashboard")}
            className="text-sm text-ink-soft inline-flex items-center gap-1.5 mb-4"
            style={{minHeight:40}}>
            <Icon name="arrowLeft" className="w-4 h-4"/> Dashboard
          </button>

          <div className="arabic-classic text-gold-300 text-2xl md:text-3xl mb-2" style={{direction:"rtl"}}>
            الاستعداد للامتحان
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-semibold text-ink mb-3">
            Siap Imtihan
          </h1>
          <p className="text-base text-ink-muted max-w-xl leading-relaxed">
            4 mode prompt khusus untuk persiapan ujian Tahriri dan Syafawi Al-Azhar.
            Pilih maddah, pilih mode, salin prompt ke AI.
          </p>
        </div>
      </section>

      {/* Bank Soal Section */}
      <BankSoalSection/>

      {/* Maddah selector */}
      <section className="pb-6">
        <div className="container-x">
          <div className="text-xs uppercase tracking-[0.2em] text-gold-400 mb-3 flex items-center gap-2">
            <span className="w-5 h-px bg-gold-500/60"/>
            Pilih Maddah (opsional)
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 pb-1">
            <button onClick={() => setActiveMaddah("")}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm border font-medium transition-colors ${
                activeMaddah === ""
                  ? "text-emerald-200 border-emerald-600/35"
                  : "bg-white/4 text-ink-muted border-white/8 hover:bg-white/7"
              }`}
              style={activeMaddah === "" ? {background:"rgba(62,207,142,0.20)",minHeight:40} : {minHeight:40}}>
              Umum
            </button>
            {myMaddahs.map(m => (
              <button key={m.id} onClick={() => setActiveMaddah(m.name)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm border font-medium transition-colors ${
                  activeMaddah === m.name
                    ? "text-emerald-200 border-emerald-600/35"
                    : "bg-white/4 text-ink-muted border-white/8 hover:bg-white/7"
                }`}
                style={activeMaddah === m.name ? {background:"rgba(62,207,142,0.20)",minHeight:40} : {minHeight:40}}>
                {m.name}
              </button>
            ))}
          </div>
          {activeMaddah && (
            <p className="text-xs text-ink-soft mt-2">
              Prompt akan menyertakan konteks maddah: <span className="text-ink">{activeMaddah}</span>
            </p>
          )}
        </div>
      </section>

      {/* Mode tabs */}
      <section className="pb-8">
        <div className="container-x">
          <div className="text-xs uppercase tracking-[0.2em] text-gold-400 mb-3 flex items-center gap-2">
            <span className="w-5 h-px bg-gold-500/60"/>
            Pilih Mode
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 pb-3 mb-6">
            {IMTIHAN_MODES.map(mode => (
              <button key={mode.id} onClick={() => setActiveMode(mode.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border font-medium transition-colors ${
                  activeMode === mode.id
                    ? mode.color === "gold"
                      ? "bg-gold-500/15 text-gold-200 border-gold-500/30"
                      : "text-emerald-200 border-emerald-600/35"
                    : "bg-white/4 text-ink-muted border-white/8 hover:bg-white/7"
                }`}
                style={activeMode === mode.id && mode.color !== "gold" ? {background:"rgba(62,207,142,0.20)",minHeight:44} : {minHeight:44}}>
                <Icon name={mode.icon} className="w-4 h-4"/>
                <span className="font-medium">{mode.label}</span>
              </button>
            ))}
          </div>

          {currentMode && (
            <Reveal key={activeMode}>
              <ImtihanPromptCard
                mode={currentMode}
                maddah={activeMaddah}
                profile={profile}
              />
            </Reveal>
          )}
        </div>
      </section>

      {/* SECTION BEDAH TALKHISAN */}
      <section className="pb-8">
        <div className="container-x">
          <Reveal className="mb-5">
            <div className="text-xs uppercase tracking-[0.2em] text-gold-400 mb-2 flex items-center gap-2">
              <span className="w-5 h-px bg-gold-500/60"/>
              Punya talkhisan?
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">
              Bedah Talkhisan
              <span className="arabic-display text-lg text-gold-300 ml-3" style={{direction:"rtl"}}>تَلْخِيص</span>
            </h2>
            <p className="text-sm text-ink-muted mt-1 max-w-xl">
              Upload foto atau paste teks talkhisanmu — Talqeeh bantu kamu faham, hafal, drill soal, atau simulasi syafawi dari isi talkhisan itu.
            </p>
          </Reveal>
          <Reveal>
            <TalkhisanSection profile={profile}/>
          </Reveal>
        </div>
      </section>

      {/* Tips ujian Azhari */}
      <section className="pb-12">
        <div className="container-x">
          <div className="card-glass p-5 md:p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-gold-400 mb-4 flex items-center gap-2">
              <span className="w-5 h-px bg-gold-500/60"/>
              Tips Ujian Al-Azhar
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  title: "Untuk Tahriri",
                  items: [
                    "Mulai jawaban dengan ta'rif yang padat — dosen nilai dari definisi pertama",
                    "Sertakan dalil Arab + terjemah, walau singkat",
                    "Gunakan format: ta'rif → dalil → hukum → ikhtilaf (kalau ada)",
                    "Tulis rapi — khat yang jelek bisa kurangi nilai",
                  ],
                },
                {
                  title: "Untuk Syafawi",
                  items: [
                    "Jawab dengan percaya diri — dosen uji mental, bukan hanya ilmu",
                    "Kalau tidak tahu: 'لا أعرف بالتفصيل لكن أعرف...' lebih baik dari diam",
                    "Latih jawab dalam bahasa Arab — walau campuran",
                    "Drill dengan teman: satu jadi dosen, satu jadi mahasiswa",
                  ],
                },
              ].map((tip, i) => (
                <div key={i}>
                  <div className="text-sm font-semibold text-ink mb-2">{tip.title}</div>
                  <ul className="space-y-1.5">
                    {tip.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-ink-muted">
                        <span className="w-1 h-1 rounded-full bg-gold-400 flex-shrink-0 mt-1.5"/>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

window.SiapImtihanPage = SiapImtihanPage;
window.BankSoalSection = BankSoalSection;
window.IMTIHAN_MODES = IMTIHAN_MODES;
window.TALKHISAN_MODES = TALKHISAN_MODES;
window.generateImtihanPrompt = generateImtihanPrompt;
window.generateTalkhisanPrompt = generateTalkhisanPrompt;
window.TalkhisanSection = TalkhisanSection;
