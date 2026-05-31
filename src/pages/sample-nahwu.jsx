import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
/* Talqih — Sample Maddah Nahwu (publik, accessible tanpa member) */

const SamplePromptCard = ({ prompt, formatEnabled }) => {
  const toast = useToast();
  const tool = AI_TOOLS.find(t => t.id === prompt.targetAI);
  const getTextToCopy = () => typeof withFormatInstruction !== "undefined"
    ? withFormatInstruction(prompt.template, formatEnabled) : prompt.template;
  const handleCopy = () => {
    navigator.clipboard.writeText(getTextToCopy());
    toast.push("Prompt tersalin. Paste ke " + (tool?.name || "AI") + ".");
  };
  return (
    <div className="card-glass p-5 hov-lift">
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-3">
          {tool && <ToolIcon tool={tool} size="w-9 h-9"/>}
          <div>
            <div className="font-display text-base font-semibold text-ink">{prompt.title}</div>
            <div className="text-[11px] text-ink-soft">Untuk: {tool?.name || prompt.targetAI}</div>
          </div>
        </div>
        <button onClick={handleCopy} className="btn btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5">
          <Icon name="copy" className="w-3 h-3"/>Salin
        </button>
      </div>
      <div className="p-3 rounded-xl text-xs text-ink-muted leading-relaxed font-mono whitespace-pre-wrap"
        style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",maxHeight:"96px",overflow:"hidden",WebkitLineClamp:4,display:"-webkit-box",WebkitBoxOrient:"vertical"}}>
        {prompt.template}
      </div>
    </div>
  );
};

const SampleNahwuPage = () => {
  const [formatEnabled, setFormatEnabled] = React.useState(() => typeof getFormatPref !== "undefined" ? getFormatPref() : true);
  const sampleData = {
    name: "Nahwu Dasar",
    nameArabic: "النحو",
    description: "Ilmu yang mempelajari kaidah-kaidah penyusunan kalimat dalam Bahasa Arab — i'rab, kedudukan kata, hukum kalimat fi'liyyah dan ismiyyah.",
    descriptionArabic: "علم يبحث في قواعد تركيب الجملة العربية",
    kitabUtama: [
      { nama:"Al-Ajurrumiyyah", penulis:"Ibnu Ajurrum", arabic:"الآجرومية" },
      { nama:"Alfiyah Ibnu Malik", penulis:"Ibnu Malik", arabic:"ألفية ابن مالك" },
      { nama:"Qatr An-Nada", penulis:"Ibnu Hisyam", arabic:"قطر الندى" },
    ],
    recommendedAI: [
      {
        tool: "notebooklm",
        name: "NotebookLM",
        strength: "Hafal kaidah, drill matan, parsing kitab",
        why: "Nahwu butuh hafalan matan klasik. NotebookLM bisa di-upload kitab Alfiyah/Ajurrumiyyah, lalu dia tanya-jawab berdasarkan source itu — tidak halusinasi.",
      },
      {
        tool: "claude",
        name: "Claude",
        strength: "I'rab kalimat panjang, syarah ibarah klasik",
        why: "Claude excellent untuk parsing kalimat Arab dengan harakat, analisis i'rab kompleks, dan menjelaskan ibarah kitab klasik dengan akurat.",
      },
    ],
    tutorial: [
      { title:"Sebelum mulai", body:"Siapkan: (1) Kitab nahwu yang sedang kamu pelajari (Ajurrumiyyah / Alfiyah / kitab kampus), (2) Bab atau tema spesifik, (3) Contoh kalimat dari kitab kalau ada." },
      { title:"Pilih AI sesuai kebutuhan", body:"Mau hafal matan? Pakai NotebookLM — upload PDF kitab, suruh dia drill. Mau i'rab kalimat? Pakai Claude — paste kalimat Arab, minta i'rab lengkap." },
      { title:"Salin prompt yang sesuai", body:"Dari 17 prompt di bawah, pilih sesuai tujuanmu hari ini. Salin, paste ke AI, ganti placeholder [TOPIK] / [KALIMAT] / [KITAB] dengan inputmu." },
      { title:"Selalu cek dengan guru", body:"Jawaban AI bukan pengganti syaikh. Hasil AI adalah talqih — penyubur pemahaman. Tetap verifikasi di majelis talaqqi atau tanyakan ke senior." },
    ],
    prompts: {
      pahami: [
        {
          title: "Pahami Bab Nahwu",
          targetAI: "claude",
          template: `Aku thalib di Al-Azhar yang sedang mempelajari Nahwu, khususnya bab [BAB - contoh: Marfu'at, Manshubat, Majrurat, dst].

Jelaskan kepada aku:
1. Definisi bab ini secara singkat
2. Kaidah utamanya — sertakan teks Arab kaidah dengan harakat
3. 3 contoh kalimat Arab dengan harakat lengkap dan i'rab-nya
4. Hubungan bab ini dengan bab nahwu lain yang sudah aku pelajari

Bahasa: Indonesia akademik. Sertakan teks Arab original saat menyebut kaidah atau istilah teknis. Sebut sumber rujukan dari kitab klasik (Alfiyah, Ajurrumiyyah) bila relevan.`,
        },
        {
          title: "Bedakan Istilah Mirip",
          targetAI: "claude",
          template: `Aku thalib Nahwu, sering bingung membedakan dua istilah:

[ISTILAH 1] vs [ISTILAH 2]
Contoh: Mubtada vs Khabar, Fa'il vs Maf'ul bih, Hal vs Tamyiz.

Tolong jelaskan:
1. Definisi masing-masing — sertakan teks Arab (misal: المبتدأ, الخبر)
2. Tanda pengenal di kalimat
3. 3 contoh kalimat Arab yang menunjukkan perbedaan — dengan harakat dan i'rab
4. Trik mengingat perbedaannya

Bahasa: Indonesia akademik dengan teks Arab untuk semua istilah teknis.`,
        },
        {
          title: "Pahami I'rab Sebuah Kalimat",
          targetAI: "claude",
          template: `Aku thalib Nahwu, mau memahami i'rab kalimat berikut:

[PASTE KALIMAT ARAB DENGAN HARAKAT]

Tolong jelaskan:
1. Terjemahan harfiah ke Indonesia
2. I'rab setiap kata — jenis kata, kedudukan, tanda i'rab-nya
3. Kaidah nahwu yang berlaku — sertakan referensi bait Alfiyah kalau ada
4. Apakah ada bagian dengan 2 kemungkinan i'rab? Jelaskan keduanya.

Bahasa pengantar Indonesia. Istilah nahwu tetap Arab transliterasi. Sertakan teks Arab dengan harakat saat referensi kaidah.`,
        },
        {
          title: "Hubungan Antar Bab Nahwu",
          targetAI: "claude",
          template: `Aku thalib di Al-Azhar yang sedang muthala'ah kitab nahwu, ingin memahami big picture-nya.

Tolong buatkan peta hubungan antar bab utama Nahwu:
- Mubtada wa Khabar
- Fi'il wa Fa'il
- Manshubat (Maf'ul bih, Hal, Tamyiz, Mustatsna, Munada)
- Marfu'at · Majrurat · Asma' wa Af'al

Untuk setiap bab:
1. Definisi singkat dengan teks Arab
2. Bab apa yang menjadi pondasinya
3. Bab apa yang dibangun darinya

Format: ringkas, terstruktur, mudah dilihat alurnya.`,
        },
      ],
      hafal: [
        {
          title: "Drill Hafalan Matan",
          targetAI: "notebooklm",
          template: `Aku upload matan [NAMA KITAB - contoh: Ajurrumiyyah / Alfiyah]. Bantu aku hafalan dengan sesi tasmi':

1. Sebut potongan matan secara acak (1 kalimat/bait), tulis dalam Arab dengan harakat
2. Aku akan lanjutkan
3. Kalau aku ragu, beri 3 huruf pertama dari kalimat selanjutnya sebagai isyarah
4. Setelah 10 putaran, beri daftar bagian yang perlu murajaah ulang

Fokus drill: [BAB SPESIFIK - kalau ada]`,
        },
        {
          title: "Mnemonic Kaidah Sulit",
          targetAI: "claude",
          template: `Aku thalib Nahwu, kesulitan hafal kaidah berikut:

[TULIS KAIDAH NAHWU YANG SULIT]

Buatkan untukku:
1. Mnemonic Indonesia yang mudah diingat
2. Mnemonic Arab (qa'idah lafzhiyyah) kalau ada yang masyhur
3. Trik visual atau cerita pendek untuk lock-in di memori
4. Bait Alfiyah yang relate ke kaidah ini (sertakan dengan harakat)

Bahasa Indonesia akademik dengan teks Arab original.`,
        },
        {
          title: "Jadwal Murajaah Matan",
          targetAI: "chatgpt",
          template: `Aku thalib di Al-Azhar, sedang menghafal matan [NAMA KITAB] dengan target khatam [X HARI/MINGGU].

Buatkan jadwal murajaah dengan pendekatan spaced repetition dalam tabel:
| Hari | Bagian Baru | Murajaah | Catatan |

Aturan:
- Spaced repetition (hari 1, 3, 7, 14, 21)
- Sertakan time-of-day suggestion (ba'da Fajr untuk hafal baru, ba'da Asar untuk murajaah)
- Tambahkan 3 mawadi' yang biasanya paling bikin ragu di matan ini`,
        },
      ],
      latihan: [
        {
          title: "10 Soal I'rab Bertingkat",
          targetAI: "claude",
          template: `Aku thalib Nahwu, mau drill i'rab. Beri 10 kalimat Arab dengan harakat lengkap, tingkat bertahap:

- Soal 1-3: Kalimat ismiyyah/fi'liyyah basit
- Soal 4-6: Mengandung shibhul jumlah, hal, atau tamyiz
- Soal 7-9: Mengandung naskh (kana/inna wa akhawatuha) atau idhafah berlapis
- Soal 10: Kalimat panjang dengan multiple kaidah

Tulis semua kalimat dengan harakat lengkap. JANGAN kasih jawaban dulu.
Setelah aku jawab semua, koreksi per nomor dengan sebutan kaidah yang dilanggar.`,
        },
        {
          title: "Tashrif Acak",
          targetAI: "chatgpt",
          template: `Beri aku 10 latihan tashrif acak untuk tingkat [DASAR/MENENGAH/LANJUT]:

Format: tulis kata akar (fi'l madhi 3 huruf), aku akan tashrif lengkap.
Contoh: كَتَبَ → aku tulis madhi, mudhari', amr, fa'il, maf'ul, dll.

Setelah aku jawab semua, koreksi per nomor dan kasih 1 rujukan kitab sharaf untuk latihan lanjut.`,
        },
        {
          title: "Bedah Ibarah Kitab",
          targetAI: "claude",
          template: `Ini paragraf dari kitab nahwu klasik:

[PASTE TEKS ARAB DARI KITAB]

Tolong analisis bertahap:
1. Tarjamah harfiyah (kata per kata)
2. Tarjamah ma'nawiyyah (Indonesia mengalir)
3. Syarah istilah teknis (Arab + transliterasi + definisi)
4. Maksud inti penulis dalam 1 kalimat
5. Bab nahwu apa yang dibahas di sini

Bila ada bagian yang ambigu, sebut secara jujur.`,
        },
      ],
      ujian: [
        {
          title: "Soal Imtihan Tahriri Nahwu",
          targetAI: "claude",
          template: `Aku thalib di Al-Azhar, mau drill persiapan ujian Tahriri untuk maddah Nahwu.

Beri 5 soal dengan gaya khas imtihan Azhari:
- 'Arrif... (definisikan)
- Wadhdhih al-farq bayna... (jelaskan perbedaan antara)
- Mathiyl li... (beri contoh)
- A'rib al-jumlah at-taliyah (i'rab kalimat berikut)
- Bayyin... (jelaskan)

Topik fokus: [BAB - kalau ada]
Tulis dalam Bahasa Arab. Setelah aku jawab, koreksi dan beri model answer ideal.`,
        },
        {
          title: "Mock Syafawi (Ujian Lisan)",
          targetAI: "chatgpt",
          template: `Aku thalib Azhar, mau latihan ujian Syafawi (lisan) untuk Nahwu.

Bertindaklah sebagai dosen Azhar yang menguji. Tanyakan aku 5 pertanyaan bertahap:
1. Mulai dengan definisi dasar
2. Lanjut ke perbedaan istilah
3. Tanya contoh kalimat
4. Minta aku i'rab kalimat
5. Tanya hubungan dengan bab lain

Tunggu jawabanku setelah setiap pertanyaan. Tantang aku follow-up kalau jawabanku kurang lengkap.
Topik: [BAB - kalau ada]`,
        },
      ],
      talaqqi: [
        {
          title: "Review Pasca Talaqqi",
          targetAI: "claude",
          template: `Aku baru saja talaqqi dengan syaikh tentang bab [BAB NAHWU] dari kitab [NAMA KITAB].

Materi yang dibahas syaikh:
[PASTE CATATAN ATAU POIN-POIN KAJIAN]

Tolong:
1. Susun ulang catatanku jadi struktur yang lebih sistematis
2. Tambahkan kaidah Arab original (dengan harakat) untuk poin-poin penting
3. Beri 2-3 contoh kalimat tambahan yang relate
4. Sebutkan apa yang sebaiknya aku tanyakan ke syaikh di sesi berikutnya`,
        },
        {
          title: "Pahami Catatan yang Lupa",
          targetAI: "claude",
          template: `Aku punya catatan dari talaqqi Nahwu yang sebagiannya aku gak ingat konteksnya:

[PASTE CATATAN YANG MEMBINGUNGKAN]

Tolong:
1. Bantu aku interpretasi maksud catatan ini berdasarkan konteks bab Nahwu
2. Lengkapi penjelasan yang kurang
3. Beri kemungkinan tafsir kalau catatannya ambigu
4. Sebut bab nahwu apa yang sedang dibahas`,
        },
      ],
      eksplorasi: [
        {
          title: "Khilaf Nahwiyyin",
          targetAI: "claude",
          template: `Aku thalib di Al-Azhar, mau eksplorasi khilaf nahwiyyin tentang:

[MASALAH NAHWU - misal: hukum 'amal harf, status idhafah lafzhiyyah]

Tolong jelaskan:
1. Pendapat Bashriyyin (Sibawaih, al-Khalil, dll)
2. Pendapat Kufiyyin (al-Kisa'i, al-Farra', dll)
3. Dalil masing-masing — sertakan kalimat Arab atau ayat/syi'ir
4. Pendapat ulama mutaakhirin (Ibnu Malik, Ibnu Hisyam) — kecondongan ke mana

Bahasa Indonesia akademik. Tanpa men-tarjih — biarkan aku yang merenungkan.`,
        },
        {
          title: "Aplikasi Nahwu di Tafsir",
          targetAI: "claude",
          template: `Aku thalib di Al-Azhar, mau lihat bagaimana Nahwu diaplikasikan dalam Tafsir Al-Qur'an.

Pilih [JUMLAH] ayat yang punya khilaf nahwu yang mempengaruhi makna:
- Ayat dengan perbedaan i'rab yang ubah makna
- Ayat dengan possibility 2 wajh i'rab

Untuk setiap ayat:
1. Tulis ayat dengan harakat
2. Sebut surah-ayat
3. Jelaskan 2+ kemungkinan i'rab
4. Bagaimana setiap i'rab mempengaruhi tafsir/makna`,
        },
        {
          title: "Syawahid Syi'r Klasik",
          targetAI: "claude",
          template: `Aku belajar Nahwu, mau lebih familiar dengan syawahid syi'r (bukti puisi klasik) yang dipakai kitab nahwu.

Beri 5 bait syi'r klasik (masa Jahili / Shadr Islam / Umawi) yang sering jadi syahid kaidah nahwu:

Untuk setiap bait:
1. Tulis bait dengan harakat lengkap
2. Sebutkan penyair
3. Kaidah nahwu apa yang dibuktikan
4. Bagian mana dari bait yang jadi syahid
5. Tarjamah ringkas`,
        },
      ],
    },
  };

  const groupMeta = {
    pahami:     { title:"Pahami Konsep",       icon:"book" },
    hafal:      { title:"Hafalan",             icon:"star" },
    latihan:    { title:"Latihan & Drill",      icon:"edit" },
    ujian:      { title:"Persiapan Ujian",      icon:"check" },
    talaqqi:    { title:"Review Pasca-Talaqqi", icon:"layers" },
    eksplorasi: { title:"Eksplorasi Mendalam",  icon:"sparkles" },
  };

  return (
    <div className="page-enter">

      {/* Header */}
      <section className="relative pt-12 md:pt-16 pb-10 overflow-hidden">
        <Blob color="rgba(62,207,142,.18)" size={500} top={-150} right={-100}/>
        <div className="container-x relative">
          <button onClick={() => navigate("/")}
            className="text-sm text-ink-soft hover:text-ink inline-flex items-center gap-2 mb-6">
            ← Kembali ke landing
          </button>
          <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
            <div>
              <div className="arabic-display text-gold-300 text-4xl md:text-5xl mb-2" style={{direction:"rtl"}}>
                {sampleData.nameArabic}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink">
                {sampleData.name}
              </h1>
            </div>
            <span className="chip-glass text-xs flex-shrink-0">SAMPLE GRATIS</span>
          </div>
          <p className="text-base md:text-lg text-ink-muted leading-relaxed max-w-2xl mt-4">
            {sampleData.description}
          </p>
        </div>
      </section>

      {/* Sticky banner */}
      <div className="sticky top-16 md:top-[72px] z-30 border-y border-line bg-night-950/70 backdrop-blur-md">
        <div className="container-x py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-sm text-ink-muted">
            <span className="text-gold-300 font-medium">✦ Ini sample gratis.</span>
            {" "}Untuk 35 Maddah lain + prompt yang disesuaikan tingkatmu, gabung member.
          </div>
          <button onClick={() => navigate("/")} className="btn btn-gold text-sm px-4 py-2 flex-shrink-0">
            Gabung Member · <span style={{textDecoration:"line-through",opacity:.6}}>75k</span> 49k →
          </button>
        </div>
      </div>

      {/* Kitab Utama */}
      <section className="section pt-10 pb-6">
        <div className="container-x">
          <h2 className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 inline-flex items-center gap-2">
            <span className="w-6 h-px bg-gold-500/70"/>Kitab Utama
          </h2>
          <div className="grid md:grid-cols-3 gap-3">
            {sampleData.kitabUtama.map((k, i) => (
              <div key={i} className="card-glass p-5">
                <div className="arabic-display text-gold-300 text-xl mb-1" style={{direction:"rtl"}}>{k.arabic}</div>
                <div className="font-display text-base font-semibold text-ink">{k.nama}</div>
                <div className="text-xs text-ink-soft mt-1">{k.penulis}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Recommendation */}
      <section className="section pt-0 pb-6">
        <div className="container-x">
          <h2 className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 inline-flex items-center gap-2">
            <span className="w-6 h-px bg-gold-500/70"/>AI yang Direkomendasikan
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {sampleData.recommendedAI.map((ai, i) => {
              const tool = AI_TOOLS.find(t => t.id === ai.tool);
              return (
                <div key={i} className="card-glass-strong p-6">
                  <div className="flex items-center gap-3 mb-3">
                    {tool && <ToolIcon tool={tool} size="w-11 h-11"/>}
                    <div>
                      <div className="font-display text-lg font-semibold text-ink">{ai.name}</div>
                      <div className="text-xs text-ink-soft">{ai.strength}</div>
                    </div>
                    {i === 0 && <span className="ml-auto chip-glass text-[10px] text-gold-300 flex-shrink-0">TOP PICK</span>}
                  </div>
                  <p className="text-sm text-ink-muted leading-relaxed">{ai.why}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tutorial */}
      <section className="section pt-0 pb-6">
        <div className="container-x">
          <h2 className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-4 inline-flex items-center gap-2">
            <span className="w-6 h-px bg-gold-500/70"/>Cara Pakai (4 Langkah)
          </h2>
          <div className="space-y-3">
            {sampleData.tutorial.map((s, i) => (
              <div key={i} className="card-glass p-5 flex gap-4 items-start">
                <div className="font-display text-2xl text-gold-400 flex-shrink-0">{String(i+1).padStart(2,"0")}</div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink mb-1">{s.title}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prompt templates */}
      <section className="section pt-0 pb-16">
        <div className="container-x">
          <h2 className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-2 inline-flex items-center gap-2">
            <span className="w-6 h-px bg-gold-500/70"/>Template Prompt
          </h2>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
            <p className="text-sm text-ink-muted">
              17 template siap pakai. Salin, ganti placeholder, kirim ke AI.
            </p>
            {typeof FormatToggle !== "undefined" && (
              <FormatToggle enabled={formatEnabled} onChange={v => { setFormatEnabled(v); if (typeof setFormatPref !== "undefined") setFormatPref(v); }}/>
            )}
          </div>
          {Object.entries(sampleData.prompts).map(([key, prompts]) => {
            const meta = groupMeta[key];
            return (
              <div key={key} className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name={meta.icon} className="w-4 h-4 text-gold-400"/>
                  <h3 className="font-display text-xl font-semibold text-ink">{meta.title}</h3>
                  <span className="text-xs text-ink-soft ml-1">({prompts.length} prompt)</span>
                </div>
                <div className="space-y-3">
                  {prompts.map((p, i) => <SamplePromptCard key={i} prompt={p} formatEnabled={formatEnabled}/>)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="section pt-0 pb-20">
        <div className="container-x">
          <div className="max-w-2xl mx-auto text-center card-glass-strong p-8 md:p-10 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gold-500/12 blur-3xl pointer-events-none"/>
            <div className="relative">
              <div className="arabic-classic text-gold-300 text-2xl md:text-3xl leading-loose mb-3" style={{direction:"rtl"}}>
                وَقُلْ رَبِّ زِدْنِي عِلْمًا
              </div>
              <p className="text-sm text-ink-muted italic mb-1">
                "Dan katakanlah: Ya Tuhanku, tambahkanlah ilmu kepadaku."
              </p>
              <p className="text-xs text-ink-soft mb-8">— QS. Thaha: 114</p>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink mb-3">
                Suka? Akses 35 Maddah lain.
              </h2>
              <p className="text-sm text-ink-muted mb-6 max-w-md mx-auto">
                Tafsir, Hadits, Fiqh, Ushul, Mustholah, Balaghah, dan 30+ lainnya. Prompt disesuaikan dengan tingkatmu.
              </p>
              <button onClick={() => navigate("/")} className="btn btn-gold px-7 py-3.5 text-base font-medium"
                style={{ boxShadow:"0 0 40px rgba(201,168,106,.35), 0 1px 0 rgba(255,255,255,.3) inset" }}>
                Gabung Member · <span style={{textDecoration:"line-through",opacity:.6}}>Rp 75.000</span> Rp 49.000 →
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

window.SampleNahwuPage = SampleNahwuPage;
