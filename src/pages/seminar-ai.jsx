import React, { useState, useEffect } from 'react';
/* Talqeeh — Materi Seminar AI (unlisted: tidak ditautkan di mana pun, hanya lewat slug ini).
   Ganti SEMINAR_AI_PATH untuk memutar slug. Jangan tautkan dari navbar/footer/sitemap. */

const SEMINAR_AI_PATH = "/seminar/ai-m1583hmvaq";

const SEMINAR_UPDATED = "Oktober 2026";

const SEMINAR_CHAPTERS = [
  {
    id: "fundamental",
    icon: "brain",
    title: "Fundamental AI",
    summary: "Memahami apa itu AI dan LLM, cara kerjanya, dan kenapa ia bisa salah dengan percaya diri.",
    sections: [
      {
        h: "Peta istilah",
        points: [
          "**AI (kecerdasan buatan)** adalah payung besar: sistem yang meniru kemampuan yang biasanya butuh kecerdasan manusia.",
          "**Machine learning** adalah AI yang belajar pola dari data, bukan dari aturan yang ditulis manual.",
          "**Deep learning** memakai jaringan saraf berlapis-lapis, dan menjadi dasar AI modern.",
          "**LLM (large language model)** adalah model bahasa yang dilatih pada teks dalam jumlah sangat besar. ChatGPT, Claude, dan Gemini termasuk di sini.",
          "**Generative AI** adalah AI yang menghasilkan konten baru: teks, gambar, audio, atau kode.",
        ],
      },
      {
        h: "Cara kerja LLM, versi sederhana",
        points: [
          "Teks dipecah menjadi potongan kecil bernama **token**. Dalam bahasa Arab satu kata bisa menjadi beberapa token.",
          "Model **memprediksi token berikutnya** berdasarkan pola yang ia pelajari. Ia tidak membuka database lalu mengutip jawaban.",
          "**Context window** adalah batas banyaknya teks yang bisa dilihat model dalam satu percakapan. Di luar itu, ia tidak melihatnya.",
          "Model tidak otomatis mengingat percakapan lama. Yang ia tahu hanyalah apa yang ada di konteks saat ini.",
        ],
      },
      {
        h: "Kenapa AI bisa berhalusinasi",
        points: [
          "Model dilatih untuk menghasilkan teks yang **masuk akal**, bukan teks yang **terjamin benar**.",
          "Paling rawan salah: nama kitab dan halaman, nomor hadis, kutipan persis, angka, dan tahun.",
          "Jawabannya sering terdengar sangat meyakinkan, justru saat ia mengarang.",
        ],
      },
      {
        h: "Kuat dan lemahnya",
        points: [
          "**Kuat:** menjelaskan ulang dengan bahasa sederhana, merangkum, menerjemah, brainstorming, membuat latihan soal, dan mengubah format.",
          "**Lemah:** fakta spesifik tanpa sumber, hitungan panjang, kejadian sangat baru, dan konteks lokal yang tidak pernah tertulis.",
        ],
      },
      {
        h: "Peta alat",
        points: [
          "**Chatbot umum** (ChatGPT, Claude, Gemini): serbaguna untuk menjelaskan, menulis, dan berdiskusi.",
          "**Berbasis sumber** (NotebookLM): menjawab dari dokumen yang kamu unggah, sehingga lebih mudah dicek.",
          "**Pencari dengan sitasi** (Perplexity): memberi tautan sumber yang bisa dibuka dan diperiksa.",
          "**Khusus domain** (mis. Talqeeh): dirancang untuk kebutuhan tertentu, seperti muqarrar Al-Azhar.",
          "Aturan praktis: makin berbahaya akibat salahnya, makin penting memakai alat yang bersumber dan memverifikasi hasilnya.",
        ],
      },
    ],
    practice: "Tanyakan sesuatu yang kamu sudah pasti tahu jawabannya (misalnya isi satu bab kitab yang sedang kamu pegang). Nilai: mana yang benar, mana yang meleset, dan mana yang terdengar benar tapi tidak ada di kitab.",
  },
  {
    id: "prompting",
    icon: "sparkles",
    title: "Prompting yang efektif",
    summary: "Cara memberi perintah supaya jawaban AI tepat sasaran, dari pemula sampai terbiasa.",
    sections: [
      {
        h: "Rumus lima bagian",
        points: [
          "**Peran:** siapa AI ini untukmu (tutor nahwu, dosen fiqh).",
          "**Konteks:** siapa kamu dan apa situasinya (mahasiswa tingkat 2, ujian minggu depan).",
          "**Tugas:** apa yang harus dikerjakan, dengan satu kata kerja yang jelas.",
          "**Format:** bentuk keluaran (tabel, poin, Arab + Indonesia).",
          "**Batasan:** apa yang tidak boleh (jangan mengarang referensi, jangan lebih dari 200 kata).",
        ],
      },
      {
        h: "Iterasi, bukan sekali jadi",
        points: [
          "Prompt pertama jarang menjadi hasil akhir. Perbaiki dengan permintaan spesifik: \"lebih singkat\", \"beri contoh dari kitab\", \"pakai bahasa yang lebih sederhana\".",
          "Minta AI **bertanya balik** kalau informasinya kurang, supaya ia tidak menebak.",
          "Pecah tugas besar menjadi langkah-langkah kecil.",
        ],
      },
      {
        h: "Beri contoh (few-shot)",
        points: [
          "Tunjukkan satu atau dua contoh keluaran yang kamu inginkan. AI mengikuti pola contoh dengan sangat baik.",
        ],
      },
      {
        h: "Bahasa Arab dan campuran",
        points: [
          "Sebutkan tujuan bahasa keluaran: \"jelaskan dalam Indonesia, tulis istilahnya dalam Arab berharakat\".",
          "Sebutkan level dan mazhab bila relevan, supaya penjelasannya tidak melompat ke tingkat yang salah.",
        ],
      },
      {
        h: "Kesalahan yang paling sering",
        points: [
          "Terlalu singkat: \"jelaskan nahwu\" tidak memberi arah.",
          "Menumpuk banyak tugas dalam satu prompt.",
          "Tidak memberi sumber, lalu meminta AI \"mengingat\" isi kitab.",
          "Menerima hasil mentah-mentah tanpa mengecek.",
        ],
      },
    ],
    prompts: [
      {
        label: "Kurang baik",
        text: "Jelaskan isim mamnu' minas sharf.",
      },
      {
        label: "Lebih baik",
        text: "Kamu adalah tutor nahwu untuk mahasiswa Al-Azhar tingkat 2. Jelaskan isim mamnu' minas sharf dengan bahasa Indonesia sederhana, tulis istilah dan contoh dalam Arab berharakat. Beri 3 sebab terlarang tanwin beserta satu contoh tiap sebab, dalam bentuk tabel. Jangan mengarang kutipan kitab; kalau tidak yakin, katakan.",
      },
    ],
    practice: "Ambil satu materi yang sedang kamu pelajari. Tulis prompt versi \"kurang baik\" dan \"lebih baik\", bandingkan hasilnya, lalu perbaiki sekali lagi.",
  },
  {
    id: "belajar",
    icon: "bookOpen",
    title: "AI untuk belajar (konteks Masisir)",
    summary: "Memakai AI sebagai teman belajar aktif untuk diktat tebal, istilah sulit, dan ujian yang mepet.",
    sections: [
      {
        h: "Meringkas diktat tebal",
        points: [
          "Tempel materi **per bagian**, bukan seluruh diktat sekaligus, supaya detailnya tidak hilang.",
          "Minta ringkasan berlevel: satu kalimat, satu paragraf, lalu poin-poin penting.",
          "Minta daftar istilah sulit beserta artinya, dan bagian yang paling mungkin keluar di ujian.",
        ],
      },
      {
        h: "Peta konsep",
        points: [
          "Minta AI menghubungkan istilah: mana induk, mana cabang, mana yang sering tertukar.",
          "Cocok untuk materi yang banyak pembagian, seperti ushul fiqh, mustalah hadis, atau balaghah.",
        ],
      },
      {
        h: "Mufradat dan i'rab",
        points: [
          "Minta i'rab **kata per kata beserta alasannya**, bukan hanya hasil akhir.",
          "Cek hasilnya dengan kitab nahwu. Gunakan AI untuk melatih, lalu coba i'rab dulu sendiri sebelum bertanya.",
        ],
      },
      {
        h: "AI sebagai tutor yang bertanya balik",
        points: [
          "Alih-alih meminta jawaban, minta ia **menguji kamu**: satu pertanyaan sekali jalan, tunggu jawabanmu, lalu beri koreksi.",
          "Cara ini jauh lebih membekas daripada sekadar membaca penjelasan yang rapi.",
        ],
      },
      {
        h: "Flashcard, kuis, dan pengulangan",
        points: [
          "Ubah ringkasan menjadi flashcard dan soal pilihan ganda atau esai.",
          "Ulangi berjarak: hari 1, hari 3, hari 7, hari 14. Mengingat berulang dengan jeda lebih kuat daripada mengulang sekali panjang.",
        ],
      },
      {
        h: "Dari rekaman kuliah",
        points: [
          "Rekaman bisa ditranskrip, lalu diringkas per topik. Tandai bagian yang terdengar janggal, karena transkrip suara bisa salah menangkap istilah Arab.",
        ],
      },
    ],
    prompts: [
      {
        label: "Tutor yang menguji",
        text: "Kamu adalah penguji. Berdasarkan ringkasan di bawah, ajukan satu pertanyaan saja, tunggu jawabanku, lalu koreksi dan jelaskan. Naikkan tingkat kesulitan kalau jawabanku benar. Jangan beri jawaban sebelum aku menjawab.\n\n[tempel ringkasan]",
      },
    ],
    practice: "Setelah AI menjelaskan sebuah bab, tutup layarnya dan tulis ulang penjelasan itu dengan kata-katamu sendiri. Bagian yang tidak bisa kamu tulis adalah bagian yang belum kamu pahami.",
  },
  {
    id: "adab",
    icon: "shield",
    title: "Verifikasi, etika, dan adab",
    summary: "Menjaga ilmu tetap benar dan amanah: cek sumber, jujur secara akademik, dan tetap berguru.",
    sections: [
      {
        h: "Protokol tiga cek",
        points: [
          "**Cek nama:** apakah kitab dan pengarangnya benar-benar ada? Cari di Maktabah Syamilah atau katalog perpustakaan.",
          "**Cek halaman:** buka kitabnya langsung. Apakah teks itu ada di halaman yang disebut?",
          "**Cek matan:** bandingkan kata per kata. AI sering memparafrase tanpa memberi tahu.",
        ],
      },
      {
        h: "Etika akademik",
        points: [
          "Memakai AI untuk memahami, berlatih, dan menyusun kerangka adalah wajar.",
          "Menyerahkan hasil AI sebagai karya sendiri adalah ketidakjujuran, dan bisa melanggar aturan kampus.",
          "Ikuti aturan dosen dan kampus, dan sebutkan penggunaan AI bila diminta.",
        ],
      },
      {
        h: "Perspektif Islam",
        points: [
          "Kaidah *al-umur bi maqashidiha*: AI adalah wasilah, nilainya mengikuti tujuan dan cara pakainya.",
          "Ilmu adalah amanah. Jangan menyandarkan hukum syar'i atau fatwa pada jawaban AI. Rujuklah kepada ulama dan kitab muktabar.",
        ],
      },
      {
        h: "Privasi",
        points: [
          "Jangan mengunggah data pribadi, dokumen rahasia, atau data orang lain ke alat AI.",
          "Periksa pengaturan alatnya: apakah percakapanmu dipakai untuk melatih model.",
        ],
      },
      {
        h: "Guru dan sanad tak tergantikan",
        points: [
          "AI tidak punya sanad, tidak bertanggung jawab atas jawabannya, dan tidak bisa menegur adabmu.",
          "Talaqqi tetap jalan utama. AI membantu persiapan, bukan menggantikan majelis.",
        ],
      },
    ],
    practice: "Minta AI menyebut tiga referensi kitab untuk satu masalah fiqh. Lakukan tiga cek di atas pada masing-masing. Berapa yang benar-benar lolos?",
  },
  {
    id: "pendidikan",
    icon: "compass",
    title: "AI untuk pendidikan",
    summary: "Gambaran lebih luas: bagaimana AI mengubah belajar, mengajar, dan menilai.",
    sections: [
      {
        h: "Belajar yang dipersonalisasi",
        points: [
          "AI bisa menyesuaikan kecepatan, tingkat kesulitan, dan gaya penjelasan untuk tiap pelajar.",
          "Umpan balik instan: pelajar tidak harus menunggu sampai pertemuan berikutnya untuk tahu kesalahannya.",
        ],
      },
      {
        h: "Untuk pengajar",
        points: [
          "Menyusun soal bertingkat, rubrik penilaian, ringkasan materi, dan draf umpan balik.",
          "Semuanya tetap perlu ditinjau manusia. AI mempercepat persiapan, bukan menggantikan penilaian.",
        ],
      },
      {
        h: "Penilaian dan integritas",
        points: [
          "Pendeteksi tulisan AI tidak andal dan bisa menuduh orang yang salah.",
          "Pendekatan yang lebih sehat: ujian lisan, tugas berproses, portofolio, dan penjelasan langsung atas karya sendiri.",
        ],
      },
      {
        h: "Literasi AI dan kesenjangan",
        points: [
          "Memahami cara kerja dan batas AI kini menjadi kemampuan dasar, setara literasi digital.",
          "Akses tidak merata: koneksi, biaya langganan, dan bahasa. Banyak alat lebih kuat di bahasa Inggris dibanding Arab klasik.",
          "Konteks keilmuan Islam bisa kurang terwakili dalam data latih, jadi verifikasi lebih penting lagi.",
        ],
      },
      {
        h: "Kebijakan kampus",
        points: [
          "Institusi perlu panduan yang jelas: apa yang boleh, apa yang harus disebutkan, dan bagaimana menilainya.",
        ],
      },
      {
        h: "Studi kasus: Talqeeh",
        points: [
          "Masalah: diktat tebal, istilah sulit, waktu ujian terbatas, dan alat AI yang terlalu umum.",
          "Jawaban: library maddah, prompt yang sudah disesuaikan, bank soal, bantuan mufradat dan i'rab, serta AI Study Partner.",
          "Prinsip: AI menyuburkan pemahaman, bukan menggantikan guru, kitab, atau proses belajar.",
        ],
      },
      {
        h: "Arah ke depan",
        points: [
          "Agen AI yang mengerjakan tugas bertahap, interaksi suara dan gambar, serta model yang makin baik di bahasa Arab.",
          "Alatnya akan terus berganti. Kebiasaan memverifikasi, jujur, dan berguru tidak.",
        ],
      },
    ],
    practice: "Diskusikan berpasangan: kalau kamu dosen, aturan apa yang akan kamu buat soal AI untuk mata kuliahmu, dan bagaimana kamu menilainya?",
  },
  {
    id: "praktik",
    icon: "flask",
    title: "Praktik langsung (workshop)",
    summary: "Rangkaian latihan singkat yang bisa dikerjakan peserta di tempat dengan materinya sendiri.",
    sections: [
      {
        h: "Persiapan",
        points: [
          "Bawa HP atau laptop, satu diktat atau catatan, dan akun salah satu alat AI.",
        ],
      },
      {
        h: "Sesi 1: prompt buruk vs baik (15 menit)",
        points: [
          "Pakai satu materi yang sama. Bandingkan hasil prompt singkat dengan prompt berstruktur.",
        ],
      },
      {
        h: "Sesi 2: ringkas lalu kuis (20 menit)",
        points: [
          "Minta ringkasan berlevel dari diktat sendiri, lalu minta lima soal latihan beserta kunci jawabannya.",
        ],
      },
      {
        h: "Sesi 3: uji halusinasi (15 menit)",
        points: [
          "Minta referensi kitab untuk satu topik. Verifikasi bersama dengan tiga cek: nama, halaman, matan.",
        ],
      },
      {
        h: "Sesi 4: tutor yang menguji (15 menit)",
        points: [
          "Berpasangan: satu orang dites oleh AI, satu orang mengamati apakah AI benar-benar menguji atau malah memberi jawaban.",
        ],
      },
      {
        h: "Rencana belajar 7 hari",
        points: [
          "Hari 1: ringkas materi. Hari 2: buat kuis dan kerjakan. Hari 3: perbaiki bagian yang salah.",
          "Hari 4 dan 5: tutor penguji. Hari 6: ulang dengan flashcard. Hari 7: simulasi ujian tanpa membuka catatan.",
        ],
      },
    ],
    practice: "Sebelum pulang, tulis satu kebiasaan baru yang akan kamu pakai minggu ini, dan satu hal yang akan selalu kamu verifikasi.",
  },
];

/* **tebal** dan *miring* sederhana, tanpa library */
const renderInline = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**")) return <strong key={i} className="text-ink font-semibold">{p.slice(2, -2)}</strong>;
    if (p.startsWith("*")) return <em key={i}>{p.slice(1, -1)}</em>;
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
};

const SeminarPromptBox = ({ label, text }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {}
  };
  return (
    <div className="rounded-xl border border-gold-500/25 bg-gold-500/5 p-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs uppercase tracking-[0.18em] text-gold-400">{label}</span>
        <button onClick={copy} className="btn-subtle !py-1 !px-2.5 !text-xs">
          <Icon name={copied ? "check" : "copy"} className="w-3.5 h-3.5"/>{copied ? "Tersalin" : "Salin"}
        </button>
      </div>
      <p className="text-sm text-ink-muted leading-relaxed whitespace-pre-line">{text}</p>
    </div>
  );
};

const SeminarChapter = ({ ch, index, open, onToggle }) => (
  <article id={"bab-" + ch.id} className="card-glass overflow-hidden scroll-mt-24">
    <button onClick={onToggle} aria-expanded={open}
            className="w-full flex items-center gap-4 p-4 md:p-6 text-left">
      <span className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gold-500/15 text-gold-400 flex items-center justify-center shrink-0">
        <Icon name={ch.icon} className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.6}/>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] uppercase tracking-[0.22em] text-gold-400 mb-0.5">Bab {index + 1}</span>
        <span className="block font-display text-lg md:text-2xl font-semibold text-ink leading-snug">{ch.title}</span>
        {!open && <span className="block text-sm text-ink-muted mt-1 leading-relaxed">{ch.summary}</span>}
      </span>
      <Icon name="chevronDown" className={"w-5 h-5 text-ink-soft shrink-0 transition-transform " + (open ? "rotate-180" : "")}/>
    </button>
    {open && (
      <div className="px-4 md:px-6 pb-5 md:pb-7 border-t border-line">
        <p className="text-ink-muted text-base md:text-lg leading-relaxed pt-5 mb-6">{ch.summary}</p>
        <div className="space-y-6">
          {ch.sections.map(s => (
            <div key={s.h}>
              <h3 className="font-display text-lg md:text-xl font-semibold text-ink mb-2.5">{s.h}</h3>
              <ul className="space-y-2">
                {s.points.map((p, i) => (
                  <li key={i} className="flex gap-3 text-ink-muted leading-relaxed">
                    <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-gold-500/70 shrink-0"/>
                    <span className="min-w-0">{renderInline(p)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {ch.prompts && (
          <div className="mt-6 space-y-3">
            <div className="text-xs uppercase tracking-[0.22em] text-gold-400">Contoh prompt</div>
            {ch.prompts.map(p => <SeminarPromptBox key={p.label} {...p}/>)}
          </div>
        )}
        <div className="mt-6 rounded-xl bg-emerald-500/8 border border-emerald-500/25 p-4 flex gap-3">
          <Icon name="lightbulb" className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" strokeWidth={1.6}/>
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.18em] text-emerald-300 mb-1">Latihan</div>
            <p className="text-sm text-ink-muted leading-relaxed">{ch.practice}</p>
          </div>
        </div>
      </div>
    )}
  </article>
);

const SeminarAiPage = () => {
  const [openSet, setOpenSet] = useState(() => new Set([SEMINAR_CHAPTERS[0].id]));

  // Halaman ini tidak untuk diindeks mesin pencari.
  useEffect(() => {
    const m = document.createElement("meta");
    m.name = "robots"; m.content = "noindex, nofollow";
    document.head.appendChild(m);
    return () => { m.remove(); };
  }, []);

  const toggle = (id) => setOpenSet(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const allOpen = openSet.size === SEMINAR_CHAPTERS.length;
  const goTo = (id) => {
    setOpenSet(prev => new Set(prev).add(id));
    setTimeout(() => {
      const el = document.getElementById("bab-" + id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  return (
    <div className="page-enter">
      <PageHeader
        kicker="Materi Seminar"
        arabic="الذكاء الاصطناعي في التعليم"
        title="Dari fundamental sampai AI untuk pendidikan."
        subtitle={`Pegangan peserta seminar AIGYPT × Talqeeh. Diperbarui ${SEMINAR_UPDATED}.`}
      />

      <section className="pb-16">
        <div className="container-x">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            {/* Daftar isi */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="card-glass p-4 md:p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-3">Daftar isi</div>
                <ol className="space-y-1">
                  {SEMINAR_CHAPTERS.map((ch, i) => (
                    <li key={ch.id}>
                      <button onClick={() => goTo(ch.id)}
                              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left text-ink-muted hover:text-ink hover:bg-white/5 transition-colors">
                        <span className="num text-sm text-gold-400 w-5 shrink-0">{i + 1}</span>
                        <span className="text-sm leading-snug">{ch.title}</span>
                      </button>
                    </li>
                  ))}
                </ol>
                <button onClick={() => navigate(SEMINAR_AI_PATH + "/slides")} className="btn btn-gold w-full justify-center mt-4 text-sm py-2.5">
                  <Icon name="play" className="w-4 h-4"/> Mode slide
                </button>
                <button
                  onClick={() => setOpenSet(allOpen ? new Set() : new Set(SEMINAR_CHAPTERS.map(c => c.id)))}
                  className="btn-subtle w-full justify-center mt-2">
                  {allOpen ? "Tutup semua bab" : "Buka semua bab"}
                </button>
              </div>
            </aside>

            {/* Bab */}
            <div className="lg:col-span-8 space-y-3 md:space-y-4 min-w-0">
              {SEMINAR_CHAPTERS.map((ch, i) => (
                <SeminarChapter key={ch.id} ch={ch} index={i} open={openSet.has(ch.id)} onToggle={() => toggle(ch.id)}/>
              ))}
              <div className="card-glass p-5 md:p-6 text-center">
                <p className="text-ink-muted leading-relaxed">
                  Materi ini hanya untuk peserta seminar. Ada pertanyaan atau masukan? Kabari kami lewat Instagram <strong className="text-ink">@ai.gypt</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

Object.assign(window, {
  SeminarAiPage, SEMINAR_AI_PATH,
  SEMINAR_AI_SLIDES_PATH: SEMINAR_AI_PATH + "/slides",
  SEMINAR_CHAPTERS, seminarRenderInline: renderInline,
});
