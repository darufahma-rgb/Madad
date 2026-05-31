/**
 * Script: replace-prompts-batch2.cjs
 * Mengganti blok prompts untuk 4 maddah:
 * ulum-quran, mustholah-hadits, tauhid, balaghah
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/maddah-data.jsx');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

/**
 * Cari baris pertama blok `    prompts: {` setelah baris `id: "targetId"` ditemukan,
 * lalu cari baris penutup `    },` dengan depth-tracking template-literal-aware.
 * Kembalikan [startLine, endLine] (0-indexed, inklusif).
 */
function findPromptsBlock(lines, targetId) {
  // Cari baris id
  let idLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`id: "${targetId}"`)) { idLine = i; break; }
  }
  if (idLine === -1) throw new Error(`id "${targetId}" tidak ditemukan`);

  // Cari `    prompts: {` setelah idLine
  let promptsStart = -1;
  for (let i = idLine; i < lines.length; i++) {
    if (lines[i].match(/^    prompts: \{/)) { promptsStart = i; break; }
  }
  if (promptsStart === -1) throw new Error(`prompts tidak ditemukan setelah id "${targetId}"`);

  // Gabungkan baris ke string dan cari penutup dengan depth-tracking
  // Kita perlu lompati template literal (backtick)
  const block = lines.slice(promptsStart).join('\n');
  let depth = 0;
  let inTemplate = false;
  let inStr = false;
  let strChar = null;
  let i = 0;
  let endOffset = -1;

  while (i < block.length) {
    const ch = block[i];
    const prev = i > 0 ? block[i-1] : '';

    if (inTemplate) {
      if (ch === '`') inTemplate = false;
      i++; continue;
    }
    if (inStr) {
      if (ch === strChar && prev !== '\\') inStr = false;
      i++; continue;
    }
    if (ch === '`') { inTemplate = true; i++; continue; }
    if (ch === '"' || ch === "'") { inStr = true; strChar = ch; i++; continue; }

    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) {
        // Temukan akhir baris ini
        endOffset = i;
        break;
      }
    }
    i++;
  }

  if (endOffset === -1) throw new Error(`Penutup prompts tidak ditemukan untuk "${targetId}"`);

  // Hitung berapa baris dari promptsStart yang tercakup
  const prefix = block.slice(0, endOffset + 1);
  const lineCount = prefix.split('\n').length - 1;
  const promptsEnd = promptsStart + lineCount;

  return [promptsStart, promptsEnd];
}

// ═══════════════════════════════════════════════════════
// DATA PROMPTS BARU — BATCH 2
// ═══════════════════════════════════════════════════════

const NEW_PROMPTS = {};

// ─── ULUM AL-QUR'AN ───────────────────────────────────
NEW_PROMPTS['ulum-quran'] = `    prompts: {
      pahami: [
        {
          title: "Peta Besar 'Ulum Al-Qur'an",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh 'Ulum Al-Qur'an sebelum masuk detail:
1. Cabang-cabang besar: nuzul Qur'an, makki-madani, asbab nuzul, jam' & tartib, rasm 'utsmani, muhkam-mutasyabih, nasikh-mansukh, qira'at, i'jaz.
2. Tujuan ilmu ini dan kaitannya dengan tafsir.
3. Tampilkan sebagai outline bercabang.
4. Urutan belajar yang ideal.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Pahami Makki & Madani secara Tuntas",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan bab Makki-Madani:
1. Definisi makki & madani (3 cara ulama mendefinisikan) + teks Arab istilah berharakat.
2. Ciri-ciri (dhawabith & khasha'ish) surat makki vs madani.
3. Faedah mengetahui makki-madani untuk tafsir & istinbath.
4. Contoh penerapan.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Pahami Nasikh-Mansukh & Muhkam-Mutasyabih",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dua bab yang sering membingungkan:
1. Nasikh-Mansukh: definisi, syarat naskh, jenis-jenisnya, contoh dari Al-Qur'an (sebut ayat, jangan mengarang).
2. Muhkam-Mutasyabih: definisi, sikap ulama terhadap mutasyabih, contoh.
Sertakan teks Arab istilah berharakat + arti.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Pahami Asbab An-Nuzul & Kaidahnya",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan asbab an-nuzul:
1. Definisi + cara mengetahuinya (harus dengan riwayat sahih, bukan ijtihad).
2. Kaidah "al-'ibrah bi 'umum al-lafzh la bi khusus as-sabab" — maksud & penerapan.
3. Faedah asbab nuzul untuk memahami ayat dengan benar.
4. Contoh kasus (sebut ayat & riwayatnya bila kamu tahu; jika ragu, katakan).

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
      hafal: [
        {
          title: "Hafal Klasifikasi & Istilah 'Ulum Quran",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal istilah kunci bab [SEBUTKAN]:
1. Daftar istilah (teks Arab berharakat + arti).
2. Mnemonic/asosiasi tiap istilah.
3. Kelompokkan istilah yang berkaitan agar mudah diingat.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Tabel Ciri Makki-Madani untuk Dihafal",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel hafalan ciri surat makki vs madani:
1. Kolom: aspek | ciri makki | ciri madani.
2. Sertakan contoh tema & gaya ayat.
3. Tandai ciri yang sering jadi soal.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Jadwal Muraja'ah 'Ulum Quran",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan, dengan cara uji tiap sesi. Sajikan sebagai tabel.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
      latihan: [
        {
          title: "Drill Soal Definisi & Klasifikasi",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (definisi, klasifikasi, faedah) dari bab [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Setelah aku jawab, koreksi + jelaskan.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Latihan Analisis Ayat ('Ulum Quran Tatbiqi)",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 5 ayat (teks Arab berharakat, sebut surat & nomor; jangan mengarang). Tugasku: analisis dari sisi 'ulum quran (makki/madani, ada asbab nuzul/tidak, dll).
1. JANGAN beri jawaban dulu.
2. Setelah aku jawab, koreksi analisisku.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Bandingkan Jawabanku dengan 'Ibarah Kitab",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku menulis jawaban untuk topik [SEBUTKAN] (di bawah). Bandingkan dengan redaksi baku kitab 'ulum quran:
1. Apakah tepat?
2. Istilah/redaksi yang seharusnya kupakai.
3. Yang kurang/keliru.

[METODE]

[LEVEL_BAHASA]

Jawabanku: [TEMPEL]\`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri (Gaya Azhari)",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis 'Ulum Quran gaya Azhar untuk bab [SEBUTKAN]:
1. Tipe khas: 'arrif, udzkur al-faedah, ma al-farq baina, matsil li.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Simulasi Imtihan Syafawi",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Tanya definisi, faedah, perbedaan istilah.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): bab tersering jadi soal, tipe soal yang mungkin keluar, cara jawab dapat nilai penuh, prioritas H-7.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi poin terstruktur, lengkapi harakat istilah, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]\`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi bab [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]\`,
        },
      ],
      eksplorasi: [
        {
          title: "I'jaz Al-Qur'an & Sisi Kemukjizatannya",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan i'jaz Al-Qur'an:
1. Macam-macam i'jaz (bayani/lughawi, 'ilmi, tasyri'i, ghaibi) — ringkas + contoh.
2. Pandangan ulama tentang wajh i'jaz utama.
3. Kaitan i'jaz bayani dengan balaghah.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Hubungkan 'Ulum Quran dengan Tafsir Nyata",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Ambil ayat [SEBUTKAN], tunjukkan bagaimana 'ulum quran membantu menafsirkannya:
1. Aspek makki/madani, asbab nuzul, qira'at, atau nasikh yang relevan.
2. Bagaimana tiap aspek mengubah/memperjelas makna.
PENTING: jangan mengarang riwayat/qira'at; jika ragu, katakan.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Telaah Jam' Al-Qur'an & Rasm 'Utsmani",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan sejarah jam' (pengumpulan) Al-Qur'an:
1. Tahap di masa Nabi, Abu Bakr, dan 'Utsman — apa yang terjadi tiap tahap.
2. Apa itu rasm 'utsmani & kenapa kaidah penulisannya khas.
3. Hikmah & bantahan syubhat seputar pengumpulan mushaf.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
    },`;

// ─── MUSTHOLAH HADITS ─────────────────────────────────
NEW_PROMPTS['mustholah-hadits'] = `    prompts: {
      pahami: [
        {
          title: "Peta Besar 'Ulum / Mustholah Hadits",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh mustholah hadits:
1. Pembagian hadits dari sisi: jumlah perawi (mutawatir-ahad), diterima/ditolak (maqbul-mardud), sandaran (marfu'-mauquf-maqthu').
2. Istilah inti: sanad, matan, rawi, isnad, 'adalah, dhabt.
3. Outline bercabang agar utuh.
4. Urutan belajar ideal.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Pahami Hadits Shahih, Hasan, Dha'if",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan klasifikasi hadits maqbul-mardud:
1. Syarat hadits shahih (5 syarat) — teks Arab berharakat + arti tiap syarat.
2. Hadits hasan (lidzatihi & lighairihi) — bedanya dengan shahih.
3. Hadits dha'if — sebab-sebab kelemahan (terkait sanad & matan).
4. Contoh tiap jenis (deskriptif, tidak perlu mengarang sanad spesifik).

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Pahami Jenis Dha'if (Mursal, Munqathi', Mu'allaq, dst)",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan jenis-jenis hadits dha'if karena cacat sanad:
1. Mursal, munqathi', mu'dhal, mu'allaq — definisi + letak keterputusan (teks Arab berharakat).
2. Mudallas & tadlis.
3. Beda tiap jenis dengan diagram sanad sederhana (teks).

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Pahami Jarh wa Ta'dil",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan ilmu jarh wa ta'dil:
1. Definisi jarh & ta'dil + kenapa penting untuk menilai perawi.
2. Maratib (tingkatan) ta'dil dan jarh — sebutkan ungkapan Arab tiap tingkat berharakat.
3. Kaidah saat jarh & ta'dil bertentangan pada satu perawi.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
      hafal: [
        {
          title: "Hafal Maratib Jarh wa Ta'dil dengan Mnemonic",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal tingkatan (maratib) ta'dil & jarh:
1. Urutkan dari tertinggi ke terendah (ungkapan Arab berharakat + arti).
2. Mnemonic Indonesia untuk mengingat urutannya.
3. Tandai tingkat yang sering jadi soal.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Tabel Klasifikasi Hadits untuk Dihafal",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel hafalan jenis hadits:
1. Kolom: nama jenis (Arab berharakat) | definisi ringkas | letak cacat/ciri.
2. Kelompokkan (sisi jumlah perawi, sisi diterima/ditolak, sisi keterputusan).
3. Tandai yang sering tertukar (mis. mursal vs munqathi').

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Jadwal Muraja'ah Mustholah",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji tiap sesi. Tabel.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
      latihan: [
        {
          title: "Drill Klasifikasi Hadits dari Deskripsi Sanad",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 8 deskripsi keadaan sanad (mis. "perawi terakhir gugur di awal sanad", "terputus satu perawi di tengah"). Tugasku: tentukan jenis haditsnya.
1. JANGAN beri jawaban dulu.
2. Setelah aku jawab, koreksi + jelaskan.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Drill Soal Definisi & Perbedaan Istilah",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (definisi, beda dua istilah, contoh) dari bab [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Latihan Menilai Hadits (Tathbiq)",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku contoh kasus penilaian hadits (deskriptif). Tugasku: terapkan kaidah mustholah untuk menilai diterima/ditolak.
1. JANGAN beri jawaban dulu.
2. Koreksi penalaran-ku + tunjukkan kaidah yang dipakai.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri Mustholah (Gaya Azhari)",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Mustholah gaya Azhar untuk bab [SEBUTKAN]:
1. Tipe khas: 'arrif + matsil, ma al-farq baina, udzkur asy-syurut, bayyin hukm.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Simulasi Imtihan Syafawi Mustholah",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Tanya definisi, syarat, perbedaan istilah, klasifikasi.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Mustholah",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): bab tersering jadi soal, tipe soal mungkin keluar, cara jawab dapat nilai penuh (definisi + contoh), prioritas H-7.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi Mustholah",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi poin definisi+ciri, lengkapi harakat, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]\`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi bab [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]\`,
        },
      ],
      eksplorasi: [
        {
          title: "Telaah Kitab-Kitab Hadits Induk",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan kitab-kitab hadits utama (kutub sittah & lainnya):
1. Karakter tiap kitab (Bukhari, Muslim, Sunan Arba'ah) + syarat penulisnya.
2. Istilah seperti muttafaq 'alaih, syaikhani.
3. Cara memanfaatkan kitab-kitab ini untuk takhrij sederhana.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Hubungkan Mustholah dengan Penilaian Hadits Nyata",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Ambil satu hadits [SEBUTKAN, atau aku tempel]:
1. Bagaimana ulama menilai derajatnya & apa pertimbangannya.
2. Kaidah mustholah apa yang berperan.
PENTING: kalau tidak yakin status/sanad, katakan; jangan mengarang penilaian.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Syubhat seputar Hadits & Jawabannya",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan secara ilmiah:
1. Syubhat umum terhadap otentisitas hadits (mis. "hadits ditulis terlambat").
2. Bagaimana sistem isnad & ilmu rijal menjawabnya.
3. Sajikan berimbang & berbasis ilmu mustholah.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
    },`;

// ─── TAUHID ───────────────────────────────────────────
NEW_PROMPTS['tauhid'] = `    prompts: {
      pahami: [
        {
          title: "Peta Besar Ilmu Tauhid / Aqidah",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh ilmu Tauhid (manhaj Asy'ari-Maturidi sesuai Azhar):
1. Pembagian: ilahiyat (sifat Allah), nubuwwat (kenabian), sam'iyyat (hal ghaib).
2. Istilah inti: wajib, mustahil, jaiz 'aqli.
3. Outline bercabang.
4. Urutan belajar ideal.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Pahami 20 Sifat Wajib bagi Allah",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan sifat wajib bagi Allah (manhaj Asy'ari):
1. 20 sifat wajib — teks Arab berharakat + arti + dalil 'aqli ringkas tiap sifat.
2. Pengelompokan: nafsiyah, salbiyah, ma'ani, ma'nawiyah.
3. Lawan tiap sifat (sifat mustahil).
4. Sifat jaiz bagi Allah.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Pahami Dalil 'Aqli & Naqli dalam Aqidah",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan metode pembuktian dalam ilmu kalam:
1. Dalil naqli (Qur'an-Sunnah) & dalil 'aqli — kapan tiap dipakai.
2. Contoh dalil 'aqli untuk wujud Allah (dalil huduts, imkan).
3. Bagaimana akal & wahyu diposisikan dalam manhaj Asy'ari-Maturidi.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Pahami Nubuwwat & Sam'iyyat",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan dua bab:
1. Nubuwwat: sifat wajib/mustahil/jaiz bagi rasul, mukjizat, hikmah pengutusan.
2. Sam'iyyat: hal-hal ghaib yang wajib diimani (hari akhir, mizan, shirath, dll) — yang ditetapkan dengan dalil naqli.
Sertakan teks Arab istilah berharakat + arti.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
      hafal: [
        {
          title: "Hafal 20 Sifat dengan Pengelompokan",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal 20 sifat wajib + mustahil + jaiz:
1. Susun per kelompok (nafsiyah, salbiyah, ma'ani, ma'nawiyah) — Arab berharakat + arti.
2. Mnemonic Indonesia untuk tiap kelompok.
3. Pasangkan tiap sifat wajib dengan lawannya (mustahil).

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Tabel Sifat + Dalil untuk Dihafal",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel hafalan:
1. Kolom: sifat (Arab berharakat) | arti | kelompok | dalil 'aqli ringkas.
2. Tandai sifat yang dalilnya sering jadi soal.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Jadwal Muraja'ah Aqidah",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji. Tabel.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
      latihan: [
        {
          title: "Drill Dalil 'Aqli tiap Sifat",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Sebutkan satu per satu sifat, lalu tugasku menyebutkan dalil 'aqli-nya.
1. Sebut sifatnya (8 sifat).
2. JANGAN beri jawaban dulu.
3. Setelah aku jawab, koreksi dalil-ku + perbaiki penalarannya.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Drill Soal Definisi & Klasifikasi Aqidah",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (definisi, kelompok sifat, dalil, hukum) dari bab [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Latihan Menjawab Syubhat (Tathbiq)",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 4 syubhat/pertanyaan aqidah. Tugasku menjawabnya dengan dalil.
1. Tulis syubhatnya.
2. JANGAN beri jawaban dulu.
3. Koreksi jawabanku, sempurnakan dengan dalil 'aqli/naqli yang benar.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri Tauhid (Gaya Azhari)",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Tauhid gaya Azhar untuk bab [SEBUTKAN]:
1. Tipe khas: 'arrif, udzkur ad-dalil al-'aqli, ma hukm... ma'a at-ta'lil, raddu asy-syubhah.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Simulasi Imtihan Syafawi Tauhid",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Tanya sifat + dalil, definisi, jawaban atas syubhat.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Tauhid",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): bab tersering jadi soal (biasanya dalil sifat & radd syubhat), tipe soal, cara jawab dapat nilai penuh, prioritas H-7.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi Tauhid",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi poin sifat+dalil, lengkapi harakat, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]\`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi bab [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan manhaj (Asy'ari/Maturidi), koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]\`,
        },
      ],
      eksplorasi: [
        {
          title: "Perbedaan Aliran Kalam (Asy'ari, Maturidi, Mu'tazilah)",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bandingkan aliran kalam untuk isu [SEBUTKAN, mis. sifat Allah, af'al 'ibad, ru'yatullah]:
1. Pendapat Asy'ariyah, Maturidiyah, Mu'tazilah.
2. Dalil/alasan tiap aliran.
3. Mana yang dipegang Ahlussunnah & manhaj Azhar.
Sajikan berimbang & ilmiah.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Aqidah & Kehidupan Nyata",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan buah/tsamarah aqidah yang benar dalam kehidupan:
1. Bagaimana memahami sifat Allah memengaruhi cara seorang muslim memandang takdir, musibah, & usaha.
2. Bahaya akidah yang menyimpang.
3. Kaitan tauhid dengan akhlak & ibadah.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Bedah Matan Aqidah (Jauharah / Kharidah / Sanusiyah)",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu aku memahami potongan matan aqidah yang kutempel (mis. dari Jauharah at-Tauhid):
1. Beri harakat lengkap bila perlu.
2. Jelaskan maksud tiap bait/kalimat.
3. Istilah kalam yang muncul + artinya.
PENTING: kalau ragu teks matannya, minta aku tempel; jangan mengarang bait.

[METODE]

[LEVEL_BAHASA]

Teks: [TEMPEL]\`,
        },
      ],
    },`;

// ─── BALAGHAH ─────────────────────────────────────────
NEW_PROMPTS['balaghah'] = `    prompts: {
      pahami: [
        {
          title: "Peta Besar Ilmu Balaghah",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh Balaghah:
1. Tiga cabang: 'Ilmu al-Ma'ani, 'Ilmu al-Bayan, 'Ilmu al-Badi' — fokus tiap cabang.
2. Apa itu fashahah & balaghah (definisi + syarat).
3. Outline bercabang dengan sub-topik tiap cabang.
4. Urutan belajar ideal.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Pahami 'Ilmu al-Bayan (Tasybih, Majaz, Kinayah)",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan 'ilmu al-bayan:
1. Tasybih: rukun (musyabbah, musyabbah bih, adat, wajh) + jenis (mursal, mu'akkad, baligh) — teks Arab berharakat + contoh.
2. Majaz (lughawi: isti'arah & majaz mursal) + 'alaqah-nya.
3. Kinayah + jenisnya.
Beri contoh tiap konsep (dari syair/Qur'an bila ada — jangan mengarang ayat).

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Pahami 'Ilmu al-Ma'ani",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan 'ilmu al-ma'ani:
1. Khabar & insya' (+ tujuan keluar dari makna asli).
2. Taqdim-ta'khir, qashr, washl-fashl, ijaz-ithnab-musawah.
3. Untuk tiap: definisi (Arab berharakat) + faedah balaghi + contoh.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Pahami 'Ilmu al-Badi'",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan 'ilmu al-badi':
1. Muhassinat ma'nawiyah (tibaq, muqabalah, tauriyah, husn ta'lil) — definisi + contoh.
2. Muhassinat lafzhiyah (jinas, saja', radd 'ajuz 'ala shadr) — definisi + contoh.
3. Beda muhassinat ma'nawi & lafzhi.
Sertakan teks Arab berharakat.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
      hafal: [
        {
          title: "Hafal Klasifikasi Tasybih & Majaz",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal pembagian tasybih & majaz:
1. Skema bercabang jenis tasybih + jenis isti'arah + majaz mursal ('alaqah-nya).
2. Mnemonic untuk tiap cabang.
3. Tandai yang sering tertukar (mis. isti'arah vs tasybih baligh).

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Tabel Muhassinat Badi' untuk Dihafal",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel hafalan muhassinat:
1. Kolom: nama (Arab berharakat) | jenis (ma'nawi/lafzhi) | definisi ringkas | contoh.
2. Tandai yang sering jadi soal istikhraj.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Jadwal Muraja'ah Balaghah",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bab yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji (istikhraj dari teks). Tabel.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
      latihan: [
        {
          title: "Drill Istikhraj (Temukan Gaya Balaghah dari Teks)",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 6 potongan teks Arab berharakat (syair/prosa; sebut sumber bila ayat/hadits, jangan mengarang). Tugasku: temukan & jelaskan gaya balaghah-nya (tasybih/isti'arah/kinayah/dst).
1. JANGAN beri jawaban dulu.
2. Setelah aku jawab, koreksi + jelaskan jenis & wajh-nya.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Drill Analisis Tasybih (Tentukan Rukun)",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 8 contoh tasybih. Tugasku: tentukan rukun (musyabbah, musyabbah bih, adat, wajh) & jenisnya.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Latihan Menyusun Kalimat Balaghi",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Minta aku menyusun kalimat yang mengandung gaya tertentu (mis. "buat kalimat dengan isti'arah makniyah").
1. Beri 6 instruksi.
2. Aku susun kalimatnya berharakat.
3. Koreksi: apakah gayanya tepat, perbaiki bila keliru.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri Balaghah (Gaya Azhari)",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Balaghah gaya Azhar untuk bab [SEBUTKAN]:
1. Tipe khas: 'arrif + matsil, istakhrij ... wa bayyin nau'ahu, ma al-farq baina, 'allil al-balaghah.
2. 5-6 soal bobot bervariasi (sering ada potongan teks untuk dianalisis).
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Simulasi Imtihan Syafawi Balaghah",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Beri potongan teks, minta aku temukan & jelaskan gaya balaghah-nya secara lisan.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Balaghah",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): bab tersering jadi soal istikhraj, tipe soal mungkin keluar, cara jawab dapat nilai penuh (sebut jenis + rukun + wajh), prioritas H-7.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi Balaghah",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi poin (definisi + contoh tiap gaya), lengkapi harakat, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]\`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi bab [SEBUTKAN], aku jelaskan ulang + beri contoh buatanku (di bawah). Periksa keakuratan, koreksi contoh yang keliru, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]\`,
        },
      ],
      eksplorasi: [
        {
          title: "Balaghah & I'jaz Al-Qur'an",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Tunjukkan keindahan balaghi satu ayat [SEBUTKAN, sebut surat & nomor]:
1. Gaya balaghah yang ada (ma'ani/bayan/badi').
2. Bagaimana gaya itu memperkaya makna (wajh i'jaz bayani).
3. Kenapa pilihan kata/struktur itu tak tergantikan.
PENTING: kutip ayat dengan benar; jika ragu, minta aku tempel.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Apresiasi Balaghah Syair & Prosa Arab",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari potongan syair/prosa yang kutempel:
1. Bedah gaya balaghah-nya satu per satu.
2. Jelaskan kenapa ungkapan itu dianggap indah (sirr al-balaghah).
3. Bandingkan dengan cara ungkap biasa untuk melihat kelebihannya.

[METODE]

[LEVEL_BAHASA]

Teks: [TEMPEL]\`,
        },
        {
          title: "Hubungkan Balaghah dengan Nahwu & Makna",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan kaitan ma'ani dengan nahwu untuk fenomena [SEBUTKAN, mis. taqdim-ta'khir, hadzf, ta'rif-tankir]:
1. Aspek nahwunya.
2. Faedah balaghi dari pilihan itu.
3. Contoh dari Al-Qur'an/syair (jangan mengarang).

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
    },`;

// ═══════════════════════════════════════════════════════
// EKSEKUSI PENGGANTIAN
// ═══════════════════════════════════════════════════════

const maddahList = ['ulum-quran', 'mustholah-hadits', 'tauhid', 'balaghah'];
let successCount = 0;

for (const maddahId of maddahList) {
  try {
    const [start, end] = findPromptsBlock(lines, maddahId);
    const newLines = NEW_PROMPTS[maddahId].split('\n');
    lines.splice(start, end - start + 1, ...newLines);
    console.log(`✓ ${maddahId}: baris ${start+1}–${end+1} diganti (${end-start+1} baris lama → ${newLines.length} baris baru)`);
    successCount++;
  } catch (err) {
    console.error(`✗ ${maddahId}: ${err.message}`);
  }
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log(`\nSelesai: ${successCount}/${maddahList.length} maddah berhasil diperbarui.`);
