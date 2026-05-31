/**
 * Script: replace-prompts-batch3.cjs
 * Mengganti blok prompts untuk 3 maddah:
 * tafsir-tahlili, hadits-tahlili, qawaid-fiqhiyyah
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/maddah-data.jsx');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

function findPromptsBlock(lines, targetId) {
  let idLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`id: "${targetId}"`)) { idLine = i; break; }
  }
  if (idLine === -1) throw new Error(`id "${targetId}" tidak ditemukan`);

  let promptsStart = -1;
  for (let i = idLine; i < lines.length; i++) {
    if (lines[i].match(/^    prompts: \{/)) { promptsStart = i; break; }
  }
  if (promptsStart === -1) throw new Error(`prompts tidak ditemukan setelah id "${targetId}"`);

  const block = lines.slice(promptsStart).join('\n');
  let depth = 0, inTemplate = false, inStr = false, strChar = null;
  let i = 0, endOffset = -1;

  while (i < block.length) {
    const ch = block[i];
    const prev = i > 0 ? block[i - 1] : '';
    if (inTemplate) { if (ch === '`') inTemplate = false; i++; continue; }
    if (inStr) { if (ch === strChar && prev !== '\\') inStr = false; i++; continue; }
    if (ch === '`') { inTemplate = true; i++; continue; }
    if (ch === '"' || ch === "'") { inStr = true; strChar = ch; i++; continue; }
    if (ch === '{') depth++;
    if (ch === '}') { depth--; if (depth === 0) { endOffset = i; break; } }
    i++;
  }

  if (endOffset === -1) throw new Error(`Penutup prompts tidak ditemukan untuk "${targetId}"`);
  const lineCount = block.slice(0, endOffset + 1).split('\n').length - 1;
  return [promptsStart, promptsStart + lineCount];
}

const NEW_PROMPTS = {};

// ─── TAFSIR TAHLILI ───────────────────────────────────
NEW_PROMPTS['tafsir-tahlili'] = `    prompts: {
      pahami: [
        {
          title: "Pahami Metode Tafsir Tahlili",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan apa itu tafsir tahlili (analitis) & cara kerjanya:
1. Definisi tafsir tahlili + bedanya dengan tafsir maudhu'i, ijmali, muqaran.
2. Langkah-langkah menafsir tahlili: makna mufradat → munasabah → asbab nuzul → i'rab → balaghah → istinbath hukum/faedah.
3. Kitab tafsir tahlili rujukan (mis. Jalalain, Baidhawi, Ibn Katsir) + karakter masing-masing.
4. Outline langkah agar bisa kuikuti tiap menafsir ayat.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Tafsir Tahlili Satu Ayat (Demonstrasi Lengkap)",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Tafsirkan ayat [SEBUTKAN SURAT & NOMOR] secara tahlili lengkap:
1. Tulis ayatnya (teks Arab berharakat) — kalau kamu ragu redaksinya, minta aku tempel; jangan mengarang.
2. Makna mufradat (kata kunci) + arti.
3. Munasabah dengan ayat sebelum/sesudah.
4. Asbab nuzul bila ada (sebut riwayat; jika ragu, katakan).
5. Penjelasan makna global (ijmali) lalu rinci (tafshili).
6. Faedah/istinbath (hukum, akhlak, akidah).

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Pahami Munasabah & Keterkaitan Ayat",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan ilmu munasabah:
1. Definisi munasabah + jenisnya (antar ayat, antar surat, antar bagian ayat).
2. Faedah munasabah untuk memahami maksud ayat secara utuh.
3. Contoh munasabah pada ayat [SEBUTKAN].

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Pahami Sumber Tafsir (bil Ma'tsur & bir Ra'yi)",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan sumber penafsiran:
1. Tafsir bil ma'tsur (Qur'an dgn Qur'an, dgn Sunnah, dgn qaul sahabat/tabi'in) — keutamaan & contoh.
2. Tafsir bir ra'yi (ijtihad) — syarat diterima & yang tercela.
3. Sikap terhadap israiliyyat.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
      hafal: [
        {
          title: "Hafal Langkah-Langkah Tafsir Tahlili",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal urutan langkah tafsir tahlili sebagai checklist:
1. Susun langkah berurutan (mufradat → munasabah → asbab → i'rab → balaghah → istinbath).
2. Mnemonic untuk mengingat urutannya.
3. Kata kunci tiap langkah.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Hafal Mufradat & Istilah Tafsir",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari ayat/surat [SEBUTKAN], buatkan daftar mufradat (gharib Qur'an) untuk dihafal:
1. Kata Arab berharakat + makna dalam konteks ayat.
2. Tandai kata yang maknanya beda dari makna umum.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Jadwal Muraja'ah Tafsir",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Surat/ayat yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji (sebut makna, faedah, istinbath). Tabel.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
      latihan: [
        {
          title: "Latihan Tafsir Mandiri (Aku Coba, AI Koreksi)",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku akan mencoba menafsir ayat [SEBUTKAN] secara tahlili dengan kemampuanku (kutulis di bawah).
1. Koreksi tafsirku: mana yang tepat, mana yang keliru/kurang.
2. Tunjukkan langkah tahlili yang terlewat.
3. Lengkapi dengan rujukan mu'tabar (jika ragu, katakan).

[METODE]

[LEVEL_BAHASA]

Tafsirku: [TEMPEL]\`,
        },
        {
          title: "Drill Soal Istinbath dari Ayat",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 6 ayat (sebut surat & nomor). Tugasku: sebutkan faedah/istinbath tiap ayat.
1. JANGAN beri jawaban dulu.
2. Setelah aku jawab, koreksi + tambahkan faedah yang terlewat.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Latihan Analisis Mufradat & I'rab Ayat",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk ayat [SEBUTKAN], tugasku menganalisis mufradat & i'rab kata kuncinya.
1. JANGAN beri jawaban dulu.
2. Setelah aku jawab, koreksi makna & i'rab-ku.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri Tafsir (Gaya Azhari)",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Tafsir Tahlili gaya Azhar untuk surat/bagian [SEBUTKAN]:
1. Tipe khas: fassir qaulahu ta'ala..., istanbith al-fawa'id, ma ma'na..., udzkur al-munasabah.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Simulasi Imtihan Syafawi Tafsir",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Minta aku tafsirkan ayat, sebut makna mufradat, faedah secara lisan.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Tafsir",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari surat/bagian yang kupelajari ([SEBUTKAN]): ayat yang sering jadi soal tafsir & istinbath, cara menulis jawaban tafsir yang lengkap (makna + munasabah + faedah), prioritas H-7.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi Tafsir",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi tafsir-ku berantakan (di bawah). Rapikan jadi: ayat → makna → faedah, lengkapi harakat, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]\`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi tafsir ayat [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]\`,
        },
      ],
      eksplorasi: [
        {
          title: "Bandingkan Penafsiran antar Mufassir",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk ayat [SEBUTKAN], bandingkan penafsiran beberapa mufassir (mis. Jalalain, Ibn Katsir, Razi, Qurthubi):
1. Poin penekanan masing-masing.
2. Perbedaan penafsiran bila ada + sebabnya.
PENTING: kalau tidak yakin isi tafsir tertentu, katakan; jangan mengarang nukilan.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Gali Faedah Tarbawi & Dakwah dari Ayat",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari ayat [SEBUTKAN], gali sisi yang bisa kupakai untuk tarbiyah/dakwah:
1. Pelajaran akhlak/tarbawi.
2. Hikmah praktis untuk kehidupan.
3. Cara menyampaikannya agar mengena.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Ayat Ahkam: Istinbath Hukum dari Ayat",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk ayat ahkam [SEBUTKAN]:
1. Hukum yang diistinbath dari ayat.
2. Cara ulama mengambil hukum (dilalah ayat).
3. Khilaf penafsiran hukum bila ada + sebabnya.
PENTING: sebut sumber; jangan mengarang.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
    },`;

// ─── HADITS TAHLILI ───────────────────────────────────
NEW_PROMPTS['hadits-tahlili'] = `    prompts: {
      pahami: [
        {
          title: "Pahami Metode Syarah Hadits (Tahlili)",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan cara menganalisis hadits secara tahlili:
1. Langkah: takhrij ringkas → derajat hadits → makna mufradat → syarah matan → istinbath fiqh/akhlak → munasabah dgn hadits lain.
2. Kitab syarah hadits rujukan (mis. Fath al-Bari, Syarh Nawawi 'ala Muslim) + karakternya.
3. Outline langkah agar bisa kuikuti tiap menganalisis hadits.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Analisis Tahlili Satu Hadits (Demonstrasi)",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Analisis hadits berikut secara tahlili lengkap (kutempel di bawah / sebut sumbernya):
1. Makna mufradat (kata sulit) + arti.
2. Syarah/makna global matan.
3. Faedah & hukum yang diambil (istinbath).
4. Munasabah dgn hadits/ayat lain bila ada.
PENTING: kalau tidak yakin derajat/sumber hadits, katakan; jangan mengarang.

[METODE]

[LEVEL_BAHASA]

Hadits: [TEMPEL TEKS HADITS]\`,
        },
        {
          title: "Pahami Gharib al-Hadits (Kata-kata Sulit)",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan ilmu gharib al-hadits:
1. Apa itu gharib al-hadits & kenapa penting.
2. Dari hadits [SEBUTKAN/tempel], jelaskan kata-kata gharib + maknanya.
3. Cara mencari makna kata gharib di kitab rujukan.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Pahami Mukhtalif & Musykil al-Hadits",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan ilmu mukhtalif al-hadits:
1. Apa itu hadits yang tampak bertentangan (mukhtalif) & musykil.
2. Cara penyelesaian: al-jam', naskh, tarjih, tawaqquf.
3. Contoh kasus (sebut hadits & sumbernya; jika ragu, katakan).

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
      hafal: [
        {
          title: "Hafal Matan Hadits dengan Pemahaman",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu aku menghafal matan hadits [SEBUTKAN/tempel]:
1. Pecah matan jadi makna per potong (agar hafalan berbasis paham).
2. Mnemonic/asosiasi untuk bagian yang panjang.
3. Tandai lafazh yang sering keliru saat hafalan.
PENTING: pakai teks hadits yang kutempel; jangan mengarang lafazh.

[METODE]

[LEVEL_BAHASA]

Hadits: [TEMPEL]\`,
        },
        {
          title: "Tabel Faedah Hadits untuk Dihafal",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari hadits-hadits bab [SEBUTKAN], buatkan tabel hafalan:
1. Kolom: inti hadits | faedah/hukum utama | kata kunci.
2. Tandai faedah yang sering jadi soal.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Jadwal Muraja'ah Hadits",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Hadits yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji (sebut matan, makna, faedah). Tabel.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
      latihan: [
        {
          title: "Latihan Syarah Mandiri (Aku Coba, AI Koreksi)",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Aku akan mensyarah hadits [tempel di bawah] dengan kemampuanku.
1. Koreksi syarah-ku: tepat/keliru/kurang.
2. Tunjukkan langkah tahlili yang terlewat (mufradat/faedah/munasabah).
3. Lengkapi dgn rujukan mu'tabar (jika ragu, katakan).

[METODE]

[LEVEL_BAHASA]

Hadits + syarahku: [TEMPEL]\`,
        },
        {
          title: "Drill Istinbath Faedah dari Hadits",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 5 hadits (tempel/sebut sumber). Tugasku: sebutkan faedah/hukum tiap hadits.
1. JANGAN beri jawaban dulu.
2. Koreksi + tambahkan faedah yang terlewat.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Drill Makna Mufradat Hadits",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari hadits [tempel], tugasku menjelaskan makna kata-kata sulitnya.
1. JANGAN beri jawaban dulu.
2. Koreksi makna-ku.

[METODE]

[LEVEL_BAHASA]

Hadits: [TEMPEL]\`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri Hadits (Gaya Azhari)",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Hadits Tahlili gaya Azhar untuk bab [SEBUTKAN]:
1. Tipe khas: isyrah al-hadits, istanbith al-ahkam, ma ma'na..., udzkur faedah.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Simulasi Imtihan Syafawi Hadits",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Minta aku jelaskan makna hadits, faedah, hukum secara lisan.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Hadits",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): hadits yang sering jadi soal syarah & istinbath, cara menulis jawaban lengkap (makna + faedah + hukum), prioritas H-7.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi Hadits",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi hadits-ku berantakan (di bawah). Rapikan jadi: matan → makna → faedah, lengkapi harakat, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]\`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi hadits [SEBUTKAN], aku jelaskan ulang (di bawah). Periksa keakuratan, koreksi, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]\`,
        },
      ],
      eksplorasi: [
        {
          title: "Bandingkan Syarah antar Ulama",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk hadits [SEBUTKAN/tempel], bandingkan pendekatan beberapa pensyarah (mis. Ibn Hajar dlm Fath al-Bari, Nawawi dlm Syarh Muslim):
1. Penekanan masing-masing.
2. Perbedaan pemahaman bila ada.
PENTING: kalau tidak yakin isi syarah, katakan; jangan mengarang nukilan.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Hadits & Penerapan dalam Kehidupan",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari hadits [SEBUTKAN], gali penerapan praktisnya:
1. Pelajaran akhlak/tarbawi.
2. Penerapan dalam kehidupan sehari-hari.
3. Cara menyampaikannya dalam dakwah.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Hadits Ahkam: Istinbath Fiqh dari Hadits",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk hadits ahkam [SEBUTKAN/tempel]:
1. Hukum fiqh yang diistinbath.
2. Cara dilalah hadits menunjukkan hukum.
3. Khilaf ulama dalam memahaminya bila ada.
PENTING: sebut sumber; jangan mengarang.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
    },`;

// ─── QAWA'ID FIQHIYYAH ────────────────────────────────
NEW_PROMPTS['qawaid-fiqhiyyah'] = `    prompts: {
      pahami: [
        {
          title: "Peta Besar Qawa'id Fiqhiyyah",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].

Beri kerangka utuh Qawa'id Fiqhiyyah:
1. Definisi qaidah fiqhiyyah + bedanya dengan ushul fiqh & dhabit fiqhi.
2. Lima kaidah induk (al-qawa'id al-kubra al-khams) — sebutkan teks Arab berharakat + arti.
3. Kitab rujukan (mis. Al-Asybah wan Nazhair As-Suyuthi) + karakternya.
4. Outline agar utuh.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Pahami 5 Kaidah Induk secara Tuntas",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan al-qawa'id al-khams al-kubra satu per satu:
1. الأمور بمقاصدها (al-umur bi maqashidiha)
2. اليقين لا يزول بالشك (al-yaqin la yazul bisy-syakk)
3. المشقة تجلب التيسير (al-masyaqqah tajlib at-taisir)
4. الضرر يزال (adh-dharar yuzal)
5. العادة محكمة (al-'adah muhakkamah)
Untuk tiap kaidah: makna (Arab berharakat + arti), dalil, contoh penerapan, kaidah cabang di bawahnya.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Pahami Kaidah Cabang & Furu'-nya",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Untuk kaidah induk [SEBUTKAN], jelaskan kaidah-kaidah cabangnya:
1. Kaidah cabang (Arab berharakat + arti).
2. Contoh furu' fiqhiyyah tiap cabang.
3. Pengecualian (mustatsnayat) bila ada.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Beda Qaidah, Dhabit, Nazhariyyah Fiqhiyyah",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan perbedaan istilah yang sering tertukar:
1. Qaidah fiqhiyyah vs dhabit fiqhi (cakupan).
2. Qaidah fiqhiyyah vs nazhariyyah fiqhiyyah.
3. Qaidah fiqhiyyah vs qaidah ushuliyyah.
Sertakan contoh tiap untuk memperjelas.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
      hafal: [
        {
          title: "Hafal 5 Kaidah Induk + Dalilnya",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Bantu hafal 5 kaidah induk:
1. Teks Arab berharakat + arti tiap kaidah.
2. Dalil ringkas tiap kaidah.
3. Mnemonic untuk mengingat kelimanya berurutan.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Tabel Kaidah + Contoh Furu' untuk Dihafal",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Buatkan tabel hafalan kaidah bab [SEBUTKAN]:
1. Kolom: kaidah (Arab berharakat) | arti | 1 contoh furu'.
2. Tandai kaidah yang sering jadi soal.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Jadwal Muraja'ah Qawa'id",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Kaidah yang sudah kupelajari: [SEBUTKAN]. Buatkan jadwal muraja'ah H+1, H+3, H+7, mingguan + cara uji (sebut kaidah + terapkan ke furu'). Tabel.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
      latihan: [
        {
          title: "Drill Terapkan Kaidah ke Kasus (Tathbiq)",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri aku 8 kasus fiqh. Tugasku: tentukan kaidah fiqhiyyah mana yang berlaku + alasannya.
1. Tulis kasusnya.
2. JANGAN beri jawaban dulu.
3. Setelah aku jawab, koreksi: kaidah yang benar + cara penerapannya.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Drill Identifikasi Kaidah dari Furu'",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 8 furu' fiqhiyyah (hukum kasus tertentu). Tugasku: tebak kaidah induk/cabang di baliknya.
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab + jelaskan kaitannya.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Drill Soal Definisi & Perbedaan Kaidah",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Beri 10 soal campuran (definisi kaidah, beda dua kaidah, contoh furu') dari bab [SEBUTKAN].
1. JANGAN beri jawaban dulu.
2. Koreksi setelah aku jawab.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
      ujian: [
        {
          title: "Mock Imtihan Tahriri Qawa'id (Gaya Azhari)",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan tahriri.

Buatkan soal ujian tulis Qawa'id Fiqhiyyah gaya Azhar untuk bab [SEBUTKAN]:
1. Tipe khas: 'arrif al-qaidah + matsil, thabbiq al-qaidah 'ala..., ma al-farq baina qa'idatain, udzkur al-mustatsnayat.
2. 5-6 soal bobot bervariasi.
3. JANGAN beri jawaban. Tunggu jawabanku, nilai ala mushahhih + skor & catatan.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Simulasi Imtihan Syafawi Qawa'id",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH], persiapan syafawi.

Berperanlah sebagai mumtahin syafawi:
1. Minta aku sebut kaidah + dalil, lalu terapkan ke kasus secara lisan.
2. Satu pertanyaan dulu, tunggu jawabanku.
3. Umpan balik, naikkan kesulitan.
4. Penilaian akhir + area lemah.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Kisi-kisi & Strategi Ujian Qawa'id",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Dari bab yang kupelajari ([SEBUTKAN]): kaidah yang sering jadi soal tathbiq, cara jawab dapat nilai penuh (sebut kaidah + dalil + contoh furu'), prioritas H-7.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
      talaqqi: [
        {
          title: "Rapikan Catatan Talaqqi Qawa'id",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Catatan talaqqi-ku berantakan (di bawah). Rapikan jadi: kaidah → makna → contoh furu', lengkapi harakat, tandai yang perlu ditanyakan, ringkas 5 poin inti.

[METODE]

[LEVEL_BAHASA]

Catatanku: [TEMPEL]\`,
        },
        {
          title: "Verifikasi Pemahaman Pasca-Talaqqi",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Setelah talaqqi kaidah [SEBUTKAN], aku jelaskan ulang + beri contoh furu' buatanku (di bawah). Periksa keakuratan, koreksi contoh yang keliru, ajukan 3 pertanyaan penguji.

[METODE]

[LEVEL_BAHASA]

Penjelasanku: [TEMPEL]\`,
        },
      ],
      eksplorasi: [
        {
          title: "Sejarah & Perkembangan Qawa'id Fiqhiyyah",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan perkembangan ilmu qawa'id fiqhiyyah:
1. Asal-usul & tahap perkembangannya.
2. Ulama & kitab penting tiap tahap (mis. Al-Asybah wan Nazhair).
3. Posisi qawa'id dalam tradisi madzhab.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Qawa'id untuk Masalah Kontemporer",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Tunjukkan bagaimana kaidah fiqhiyyah dipakai untuk masalah kontemporer:
1. Ambil kaidah [SEBUTKAN, mis. adh-dharar yuzal].
2. Terapkan ke kasus modern (mis. muamalah, medis, teknologi).
3. Hal yang perlu hati-hati saat menerapkannya.

[METODE]

[LEVEL_BAHASA]\`,
        },
        {
          title: "Hubungkan Qawa'id dengan Maqashid Syariah",
          targetAI: "claude",
          template: \`Aku [TINGKATAN] di [FAKULTAS][JURUSAN], [GAYA_BELAJAR]. Belajar [MADDAH].

Jelaskan kaitan qawa'id fiqhiyyah dengan maqashid syariah:
1. Bagaimana kaidah mencerminkan maqashid (hifzh ad-din, nafs, 'aql, nasl, mal).
2. Contoh kaidah yang berakar pada maqashid tertentu.
3. Kenapa memahami maqashid memperkuat penerapan kaidah.

[METODE]

[LEVEL_BAHASA]\`,
        },
      ],
    },`;

// ═══════════════════════════════════════════════════════
// EKSEKUSI PENGGANTIAN
// ═══════════════════════════════════════════════════════

const maddahList = ['tafsir-tahlili', 'hadits-tahlili', 'qawaid-fiqhiyyah'];
let successCount = 0;

for (const maddahId of maddahList) {
  try {
    const [start, end] = findPromptsBlock(lines, maddahId);
    const newLines = NEW_PROMPTS[maddahId].split('\n');
    lines.splice(start, end - start + 1, ...newLines);
    console.log(`✓ ${maddahId}: baris ${start + 1}–${end + 1} diganti (${end - start + 1} baris lama → ${newLines.length} baris baru)`);
    successCount++;
  } catch (err) {
    console.error(`✗ ${maddahId}: ${err.message}`);
  }
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log(`\nSelesai: ${successCount}/${maddahList.length} maddah berhasil diperbarui.`);
