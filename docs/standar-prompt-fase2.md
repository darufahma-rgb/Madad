# Standar Penulisan Ulang Prompt (Fase 2)

Dipakai untuk menulis ulang prompt di `src/maddah-data.jsx`, mulai dari 15 maddah prioritas. Pilotnya Nahwu.

Aturan umum yang sudah otomatis nempel di akhir setiap prompt (Fase 1, `src/adaptive-prompt.jsx`) **tidak
ditulis ulang di template**: manhaj Azhar, madzhab dari profil, aturan dalil, dan format kertas ujian.

## Aturan per prompt

1. **Baris profil tetap**: `Aku [TINGKATAN] di [FAKULTAS][JURUSAN] Al-Azhar, [GAYA_BELAJAR]. Belajar [MADDAH].`
2. **Satu kalimat tujuan**, lalu langkah bernomor (maksimal 5).
3. **Format keluaran disebut** (tabel, outline, jumlah soal) bila hasilnya berbentuk tertentu.
4. **Latihan dan ujian interaktif**: jangan beri jawaban sebelum aku menjawab; syafawi satu pertanyaan sekali jalan.
5. **Pola soal dari kertas ujian asli** di Bank Soal untuk maddah itu (redaksi Arab seperti
   `مَثِّلْ لِمَا يَأْتِي`, `صَوِّبِ الْخَطَأَ مَعَ التَّعْلِيلِ`). Jangan mengklaim bab tertentu "pasti keluar".
6. **Istilah kunci berharakat** di template, supaya AI ikut menulis dengan harakat.
7. **Isian jelas**: `[SEBUTKAN BAB, mis. ...]` untuk yang wajib; `[TEMPEL ...]` hanya untuk teks yang memang harus
   dikirim, karena kosong berarti AI diminta menunggu. Jangan pakai kurung siku untuk hal lain.
8. **Rujukan kitab** hanya dari `kitabUtama` maddah itu, dan selalu dengan "kalau kamu yakin".
9. Template selalu diakhiri `[METODE]` dan `[LEVEL_BAHASA]`. Jumlah dan jenis prompt per maddah tetap (6 jenis, 18 prompt).

## Cek sebelum commit

`check.mjs` (scratchpad) memastikan: 18 prompt, jenis sama, semua placeholder profil terisi, tiap isian punya label,
dan `[METODE]`/`[LEVEL_BAHASA]` ada. Diff harus hanya menyentuh blok maddah yang ditulis ulang.

## Progres

Sebelum commit, jalankan `npm run lint:prompts -- --strict <id maddah>` (lihat `docs/mutu-prompt-fase3.md`). Rubrik ini
menangkap template yang kembar dengan maddah lain.

46 maddah selesai (704 prompt): Nahwu, Fiqh Madzhabi, Tauhid, Ushul Fiqh, Mustholah Hadits, Tarikh Tasyri',
Sharaf, Al-Qur'an (Tahfidz), Sirah Nabawiyah, Fiqh Muqaran, Tarikh Islam, 'Ulum Al-Qur'an, Tajwid, Ahwal Syakhshiyah,
Balaghah, Mantiq, Tafsir Tahlili, Hadits Tahlili, Tafsir Maudhu'i, Manahij Mufassirin, Hadits Maudhu'i,
Takhrij Hadits, Manahij Muhadditsin, Syubhat Hawla As-Sunnah, Tasawwuf, Qadhaya Fiqhiyyah, Adyan,
Wasail Tabligh, Khithabah, Qawa'id Fiqhiyyah, Ushul Dakwah, Maqashid Syariah, Istisyraq, Tiarat Fikriyyah,
Fiqh Dakwah, Akhlaq Islamiyah, Tsaqafah Islamiyah, Nizham Islamiyah, Jughrafiyah Alam Islami, Ilmu Ijtima',
Manahij Bahts, Hadhir Al-Alam Al-Islami, Falsafah Yunaniyah, Ilm Nafs, Tarbiyah wa Ilm Nafs, Manahij Tadris.
Semua maddah Fakultas Dakwah sudah selesai. Urutan dipilih dari jangkauan (fakultas × tingkat) dan jumlah kertas di Bank Soal, karena data jumlah buka
maddah hanya ada di Supabase.

Catatan dari kertas asli yang memengaruhi penulisan:
- Fiqh dan Ushul hampir selalu memuat dirasah nashshiyyah (قال المصنف / الشارح) — ada prompt latihan khusus.
- Ujian Tahfidz berbentuk tahriri (menulis ayat dari hafalan). AI hanya menyebut surat, nomor ayat, dan kata pembuka yang
  diyakini, lalu menilai berdasarkan teks mushaf yang ditempel pengguna.
- Tajwid di tingkat kuliah menguji teori mendalam (makharij ra'isah/far'iyyah, perbandingan shifat, syarah bait matan).
- Fiqh Muqaran menguji jumlah pendapat ("بالاتفاق – على قولين – على ثلاثة أقوال").
- Tafsir Tahlili: kertas mengutip "قال تعالى {…} الآيات" lalu 4–6 sub-soal beruntun (munasabah, makna, i'rab, حكمة/سرّ).
  AI menulis ayat hanya kalau yakin redaksinya; kalau ragu, minta pengguna menempel dari mushaf.
- Hadits Tahlili: matan selalu ditempel pengguna (`[TEMPEL HADITS]`), tidak dilengkapi dari ingatan. Pola soal: rawi a'la,
  شكّل، بيّن في سطر، تعارض ظاهر، أقوال الأئمة والراجح، ✓/✗ مع التعليل.
- Mantiq (kertas Tk 1 Ushuluddin): ta'rif + qaul syarih, علّل ٦ butir, مثّل ٦ butir, بيّن الصواب والخطأ ٨ butir (26+30+24+20).
- Tafsir/Hadits Maudhu'i: soal terikat tema muqarrar ("من خلال دراستك لموضوع …", "مستشهدًا بالآيات"), lalu ✓/✗ مع التعليل,
  اختر, dan أكمل (termasuk makna gharib). Prompt meminta pengguna menyebut tema-tema muqarrar.
- Manahij Mufassirin & Takhrij: banyak "تحدث عن تفسير/كتاب … مبينًا …" (penulis, manhaj, cara takhrij, sumber asli atau
  bukan). Data tahun wafat, nomor hadits, dan letak bab rawan halusinasi — prompt menyuruh AI menandai "perlu dicek".
- Syubhat Sunnah: teks hadits + "كيف تفند الشبهات … في نقاط مع التدليل", "لخص قول … ثم فصل القول في الرد",
  "ما قولك فيمن زعم …", ✓/✗ مع التعليل. Prompt tidak menisbatkan ucapan ke tokoh tertentu kecuali AI yakin.
- Qadhaya Fiqhiyyah: langkah baku تحرير محل النزاع ← الآراء ← دليلان لكل رأي ← الراجح وسببه, farq antar akad,
  "استدل لكل مما يأتي بدليل واحد", dan صح/خطأ tentang ada atau tidaknya khilaf. Eksplorasi ditegaskan bukan fatwa.
- Tasawwuf: maqamat & ahwal (ta'rif, farq, tamtsil, rincian satu maqam), pemikiran tokoh di muqarrar, bantahan syubhat.
- Adyan (kertas "ملل ونحل" Tk 4): تحدث باختصار عن النقاط, bantahan klaim, perbandingan empat Injil, munaqasyah
  Trinitas secara objektif. Prompt menegaskan adab: paparkan pandangan dari sumber mereka, tanpa menghina.
- Wasail Tabligh: didominasi ta'rif, daftar bernomor ("اذكر … إجمالًا"), صح/خطأ مع التصويب, dan أكمل (١) (٢).
- Khithabah: rukun khutbah Jumat, sifat khatib + dalil, sejarah (masa Nabi ﷺ & Khulafa'), lalu menulis khutbah lengkap.
- Qawa'id Fiqhiyyah belum punya kertas di Bank Soal; memakai pola umum (syarah kaidah, indiraj furu', مثّل, ✓/✗).
- Ushul Dakwah (kertas "مناهج دعوة" Tk 4): turats (آليات التعامل، الطريقة المثلى في القراءة), adab da'i saat khilaf
  dengan contoh, dan "قارن بين المنهج العاطفي والتجريبي من حيث التعريف، مواطن الاستعمال، الخصائص".
- Maddah Fakultas Dakwah kini memakai [FAKULTAS][JURUSAN] seperti maddah lain (dulu "Fakultas Dakwah" ditulis langsung),
  supaya ikut benar untuk mahasiswa Ushuluddin yang juga mempelajarinya. Label fakultas Dakwah ditambahkan ke resolver.
- Maddah penuh data (Jughrafiyah, Hadhir Al-Alam Al-Islami, Ilmu Ijtima'): angka hanya sebagai perkiraan dengan tahun
  datanya, AI tidak boleh mengarang statistik, dan pengguna diminta mengecek sumber terbaru.
- Ilm Nafs: prompt analisis kasus membedakan penyakit hati (akhlak) dari gangguan jiwa klinis, dan menyarankan bicara dengan
  orang tepercaya atau tenaga profesional bila kasusnya menyangkut diri pengguna.
- Kertas "Tarikh Islam" satu-satunya di Bank Soal ternyata Tarikh As-Sunnah; Sirah belum punya kertas.
- Rujukan kitab boleh juga dari kitab yang disebut di kertas asli, selalu dengan "kalau kamu yakin".
