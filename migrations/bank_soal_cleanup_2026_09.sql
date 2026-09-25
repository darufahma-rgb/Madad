-- Pembersihan sisa teks AI/OCR di 4 soal Bank Soal (hasil audit 26 Sep 2026).
-- Jalankan sekali di Supabase SQL Editor. Tiap UPDATE hanya berlaku kalau teks soal masih sama persis
-- dengan saat diaudit (dicek lewat md5) — soal yang sudah diedit orang lain tidak akan tertimpa.
-- Setelah dijalankan, hasilnya: "UPDATE 1" untuk tiap soal. "UPDATE 0" = soal sudah berubah, cek manual.

-- 8140a999 · Ahwal Syakhshiyah · tingkat 2 · 2025/2026 tsani
-- Hapus judul AI "Hasil Ekstraksi Soal Ujian" (tampil sebagai SOAL 1).
update public.bank_soal set soal = $soal$[SOAL_ARAB]
السؤال الأول: [٢٥ درجة]
عرف الخِطبة، وما حكمها؟ مدعمًا الإجابة بالأدلة.

[ARTI]
**Soal Pertama: [25 poin]**
Definisikan *al-Khitbah* (peminangan), dan apa hukumnya? Sertakan jawaban dengan dalil-dalil.

---

[SOAL_ARAB]
السؤال الثاني: [٢٥ درجة]
ما حكم خطبة المرأة للرجل؟ وما الدليل على ذلك؟

[ARTI]
**Soal Kedua: [25 poin]**
Apa hukum seorang wanita yang meminang laki-laki? Dan apa dalil atas hal tersebut?

---

[SOAL_ARAB]
السؤال الثالث: [٢٥ درجة]
عرف الرجعة، واذكر حكمها مع الدليل.

[ARTI]
**Soal Ketiga: [25 poin]**
Definisikan *al-Raj'ah* (rujuk), dan sebutkan hukumnya beserta dalilnya.

---

[SOAL_ARAB]
السؤال الرابع: [٢٥ درجة]
ما الرأي الراجح في طلاق الغضبان؟ بعد سرد مذاهب الفقهاء، مبيّنًا سبب الرجحان.

[ARTI]
**Soal Keempat: [25 poin]**
Apa pendapat yang paling kuat (*rajih*) mengenai talak orang yang sedang marah? Setelah memaparkan mazhab-mazhab para fuqaha, dengan menjelaskan alasan penguatan pendapat tersebut.

---

> 📌 **Info Tambahan:**
> - **Mata Kuliah:** أحوال شخصية للمسلمين (Hukum Perdata Personal bagi Muslim)
> - **Tingkat:** Kedua (الفرقة الثانية)
> - **Waktu:** 2 jam
> - **Tanggal:** 20/5/2026
> - **Institusi:** جامعة الأزهر - كلية الشريعة والقانون بالقاهرة$soal$
where id = '8140a999-a277-4162-bce6-9cf83030882d' and md5(soal) = '4f6205ed4904092d713bde351c08b413';

-- a6364d82 · Mustholah Hadits · tingkat 1 · 2023/2024 awwal
-- Hapus judul AI "Ekstraksi Soal Ujian / Langkah 1" dan ubah catatan AI jadi peringatan netral. MASIH PERLU dicek manual dari foto (soal 27–50 terpotong, satu pilihan [...]).
update public.bank_soal set soal = $soal$[SOAL_ARAB]
السؤال الأول: ظلل الدائرة (أ) إذا كانت العبارة صحيحة والدائرة (ب) إذا كانت العبارة خاطئة. (٥٠ درجة)

١. السنة في اصطلاح الأصوليين: ما ثبت عن النبي صلى الله عليه وسلم من غير افتراض.
٢. السنة في اصطلاح المحدثين: غير مرادفة للحديث.
٣. المحدثون يستعملون السند والإسناد لشيء.
٤. الحجة: هو من حفظ ثلاثمائة ألف حديث متناً وإسناداً.
٥. تنقسم علم الحديث رواية إلى قسمين.
٦. علم الحديث رواية: هو علم يعرف به حال الراوي والمروي.
٧. ينقسم الحديث من حيث القبول والرد إلى ثلاثة أقسام.
٨. ليس من شروط الأداء البلوغ.
٩. ليس من شروط التحمل الإسلام.
١٠. مراتب الضبط ثلاثة.
١١. تنطبق العلة إلى الإسناد دون المتن.
١٢. الصحيح ليس كله في مرتبة.
١٣. مذهب ابن الصلاح: والنووي أنه يحكم لإسناد بعينه أنه أصح الأسانيد.
١٤. مذهب جمهور المحدثين الاحتجاج بالمرسل مطلقاً.
١٥أ. مذهب ابن الصلاح أنه لا يجوز للمتأخرين الحكم على الحديث بالصحة أو الحسن.
١٦. رأى ابن الصلاح أن أول من صنف في الصحيح مطولاً مالك ابن أنس.
١٧. إذا قال العلماء هذا حديث ضعيف، فمعناه أن الشيء الذي عنده لم يسلم لم يقله.
١٨. الحديث الضعيف ليس كله في مرتبة.
١٩. من الضعيف الذي لا ينجبر بمجيئه من طريق آخر، ما كان من رواية الحفظ.
٢٠. من الضعيف الذي لا ينجبر بمجيئه من طريق آخر ما كان من رواية المختلط.
٢١. لا فرق بين الإسناد والمتن، فقد يضعف الحديث الضعيف لسبب الإسناد.
٢٢. مذهب الإمام البخاري، والإمام مسلم: عدم جواز العمل بالحديث الضعيف مطلقاً.
٢٣. عدم الرواية الحديث الضعيف بسبب فقدان شروط العدالة في فضائل الأعمال.
٢٤. من أنواع الضعيف بسبب فقدان شروط العدالة ضعف الراوي المنكر.
٢٥. من أنواع الضعيف بسبب ضعف حفظ الراوي المتروك.

[ARTI]
**Soal Pertama:** Lingkari (أ) jika pernyataan BENAR dan lingkari (ب) jika pernyataan SALAH. (50 poin)

1. Sunnah menurut istilah Ushuliyyin: sesuatu yang tetap dari Nabi SAW selain kewajiban.
2. Sunnah menurut istilah Muhadditsiin: tidak sinonim dengan Hadits.
3. Para Muhaddits menggunakan kata Sanad dan Isnad untuk satu hal yang sama.
4. Al-Hujjah: adalah orang yang menghafal tiga ratus ribu hadits beserta matan dan sanadnya.
5. Ilmu Hadits Riwayah terbagi menjadi dua bagian.
6. Ilmu Hadits Riwayah: ilmu yang dengannya diketahui keadaan perawi dan yang diriwayatkan.
7. Hadits dari segi penerimaan dan penolakan terbagi menjadi tiga bagian.
8. Baligh bukan termasuk syarat penyampaian hadits.
9. Islam bukan termasuk syarat penerimaan hadits.
10. Tingkatan Dhabth ada tiga.
11. Illat (cacat) hanya berlaku pada sanad tanpa matan.
12. Hadits Shahih tidak semuanya berada pada satu tingkatan.
13. Pendapat Ibnu Shalah dan An-Nawawi: boleh menghukumi suatu sanad tertentu sebagai sanad paling shahih.
14. Pendapat jumhur Muhadditsiin: boleh berhujjah dengan hadits mursal secara mutlak.
15a. Pendapat Ibnu Shalah: tidak boleh bagi ulama mutaakhkhirin menghukumi hadits dengan shahih atau hasan.
16. Ibnu Shalah berpendapat bahwa orang pertama yang menyusun kitab shahih secara panjang lebar adalah Malik bin Anas.
17. Jika ulama berkata "ini hadits dhaif", maknanya bahwa sesuatu yang ada padanya tidak selamat/tidak diucapkannya.
18. Hadits Dhaif tidak semuanya berada pada satu tingkatan.
19. Di antara hadits dhaif yang tidak bisa diperkuat dengan jalur lain adalah yang berasal dari riwayat hafalan.
20. Di antara hadits dhaif yang tidak bisa diperkuat dengan jalur lain adalah yang berasal dari riwayat perawi mukhtalith.
21. Tidak ada perbedaan antara sanad dan matan, hadits bisa dilemahkan karena sebab sanad.
22. Pendapat Imam Bukhari dan Imam Muslim: tidak boleh mengamalkan hadits dhaif secara mutlak.
23. Tidak meriwayatkan hadits dhaif karena kurangnya syarat keadilan dalam fadhail amal.
24. Di antara jenis hadits dhaif karena kurangnya syarat keadilan adalah lemahnya perawi munkar.
25. Di antara jenis hadits dhaif karena lemahnya hafalan perawi adalah hadits matruk.

---

[SOAL_ARAB]
السؤال الثاني: ظلل الدائرة الدائرة التي تميز الإجابة الصحيحة. (٥٠ درجة)

٢٦. الحديث لغة.... القديم. (أ- مرادف، ب- ضد، ج- مقارب)

[ARTI]
**Soal Kedua:** Lingkari pilihan yang merupakan jawaban yang benar. (50 poin)

26. Hadits secara bahasa adalah.... kata "Al-Qadim" (lama). (a- sinonim, b- antonim, c- mendekati)

---

> ⚠️ Soal no. 27–50 di foto asli sebagian terpotong di tepi foto. Teks di bawah adalah bagian yang terbaca dan mungkin belum lengkap.

[SOAL_ARAB]
٢٧. السنة في اصطلاح الفقهاء ما.... عن النبي صلى الله عليه وسلم (أ- ثبت، ب- ورد، ج- نقل)

٢٨. الخبر عند المحدثين..... للحديث (أ- مغاير، ب- مبايَن، ج- مرادف)

٢٩. السند اصطلاحاً هو.... عن طريق المتن (أ- الإعلام، ج- الأخبار، ج- الأنباء)

٣٠. الإسناد في الاصطلاح هو..... الموصل إلى متن الحديث (أ- المخرج، ب- الطريق، ج- [...])

٣١. الأثر في الاصطلاح..... (أ- مبايَن، ب- مرادف، ج- معاكس)

٣٢. المحدث هو الذي..... بالحديث ويعلم به (أ- يهتم، ب- يشتغل، ج- يقوم)

٣٣. المراد بالكتاب أن الراوي يسمع من شيخه في كتابه (أ- يقرأ، ب- يسجل، ج- يثبت)

٣٤. المرتبة الدنيا من مراتب الضبط هي التي يوصف صاحبها بـ..... (أ- حفة، ب- ضعف، ج- عدم)

٣٥. العلة لغة هي (أ- الداء، ب- المرض، ج- الألم)

٣٦. أصح الأسانيد عند البخاري مالك عن ابن عمر(أ- سالم، ب- سعيد، ج- نافع)

٣٧. يقسم الحديث الشريف في جملته إلى أقسام..... (أ- ثلاثة، ب- أربعة، ج- خمسة)

٣٨. شروط الحديث المقبول (أ- خمسة، ب- ستة، ج- سبعة)

٣٩. العدالة لغة ضد (أ- الجور، ب- البغي، ج- الظلم)

٤٠. اشترط الإمام..... ثبوت السماع لكل راوٍ من شيخه (أ- مسلم، ب- البخاري، ج- النسائي)

٤١. الحديث الحسن لذاته يشارك الصحيح في جميع شروطه عدا شرط..... (أ- العدالة، ب- القيم، ج- الضبط)

٤٢. راوي الحديث الضعيف إذا نقله بإسناده..... عليه أن يبين ما فيه (أ- يجب، ب- لا يجب، ج- يستحب)

٤٣. المستور هو..... (أ- مجهول الحال، ب- العين، ج- هما معاً)

٤٤. الحكم على الحديث حكم على..... (أ- إسناده، ب- متنه، ج- الإسناد والمتن)

٤٥. الحديث المعلق هو المحذوف من سقف من أوله (أ- أوله، ب- واحد أو أكثر على التوالي، ج- أوله ب- وسمه، ج- آخره)

٤٦. ينقسم التدليس إلى..... (أ- قسمين، ب- ثلاثة أقسام، ج- أربعة أقسام)

٤٧. قال الترمذي الحسن لا يكون في إسناده من..... (أ- يرمي، ب- لا بالكذب، ج- يوصف، ج- يتهم)

٤٨. الحافظ هو من حفظ..... حديث متناً وإسناداً (أ- ألف، ب- مائة ألف، ج- ثلاثمائة ألف)

٤٩. من فوائد المستخرجات..... (أ- نزول، ب- علو، ج- مساواة)

٥٠. من الضعيف بسبب فقد شرط العدالة..... (أ- المردود، ب- المنكر، ج- المقلوب)

[ARTI]
27. Sunnah menurut istilah Fuqaha adalah apa yang .... dari Nabi SAW (a- tetap, b- datang, c- dinukil)

28. Al-Khabar menurut Muhadditsiin ..... bagi Hadits (a- berbeda, b- berlawanan, c- sinonim)

29. Sanad secara istilah adalah .... melalui jalur matan (a- pemberitahuan, b- pengabaran, c- penyampaian berita)

30. Isnad secara istilah adalah ..... yang menyambung kepada matan hadits (a- al-Makhrij, b- al-Thariq, c- [...])

31. Al-Atsar secara istilah ..... (a- berbeda, b- sinonim, c- berlawanan)

32. Al-Muhaddits adalah orang yang ..... dengan hadits dan mengetahuinya (a- memperhatikan, b- berkecimpung, c- melaksanakan)

33. Yang dimaksud dengan Al-Kitabah adalah perawi mendengar dari syaikhnya dalam kitabnya (a- membaca, b- mencatat, c- menetapkan)

34. Tingkatan terendah dari tingkatan Dhabth adalah yang pemiliknya disifati dengan ..... (a- ringan, b- lemah, c- tidak ada)

35. Illat secara bahasa adalah (a- penyakit, b- sakit, c- rasa sakit)

36. Sanad paling shahih menurut Bukhari adalah Malik dari Ibnu Umar (a- Salim, b- Sa'id, c- Nafi$soal$
where id = 'a6364d82-71ac-427d-ad12-57c5d4ddd6bd' and md5(soal) = 'df2dcb77e8d185be55557f5aae1d6881';

-- 6671b498 · Tafsir Tahlili · tingkat 1 · 2024/2025 tsani
-- Pindahkan potongan skor "[٤٠ درجة]" (tampil sebagai SOAL 1) ke awal soal pertama.
update public.bank_soal set soal = $soal$[SOAL_ARAB]
**(٤٠ درجة)**
في ضوء دراستك لآيات سورة (الفاتحة) أجب عما يأتي:
(١) اذكر أربعة من أسماء سورة الفاتحة مع بيان سبب التسمية؟
[ARTI]
**(40 poin)**
Dalam kajian ayat-ayat surah Al-Fatihah, jawablah pertanyaan berikut:
(1) Sebutkan empat nama dari nama-nama surah Al-Fatihah beserta penjelasan alasan penamaannya?

---

[SOAL_ARAB]
(٢) ما معنى (الرحمن)، و(الرحيم)؟ وأيهما أبلغ؟ ولم قدم لفظ الجلالة عليهما؟ ولم قدم (الرحمن) على (الرحيم)؟
[ARTI]
(2) Apa makna (Ar-Rahman) dan (Ar-Rahim)? Mana yang lebih kuat maknanya? Mengapa lafaz Jalalah (Allah) didahulukan atas keduanya? Dan mengapa (Ar-Rahman) didahulukan atas (Ar-Rahim)?

---

[SOAL_ARAB]
(٣) عرف الحمد لغةً وعرفًا؟ ولم خُصَّ بالله دون باقي الأسماء والصفات؟ وما نوع اللام في قوله: (لله)؟
[ARTI]
(3) Definisikan Al-Hamd secara bahasa dan istilah? Mengapa dikhususkan untuk Allah dan tidak untuk nama-nama serta sifat-sifat lainnya? Dan apa jenis lam pada firman-Nya: (لله)?

---

[SOAL_ARAB]
(٤) لم عدل عن الغيبة إلى الخطاب في قوله تعالى: (إياك نعبد وإياك نستعين)؟ ولم قدم المفعول فيهما؟
[ARTI]
(4) Mengapa beralih dari ghaibah (orang ketiga) ke khitab (orang kedua) dalam firman Allah: (Hanya kepada-Mu kami menyembah dan hanya kepada-Mu kami memohon pertolongan)? Dan mengapa objek (maf'ul) didahulukan pada keduanya?

---

**السؤال الثاني [٤٠ درجة]**

[SOAL_ARAB]
في ضوء دراستك لآيات من سورة (البقرة) أجب عما يأتي:
(١) ما المشار إليه في قوله تعالى: {ذَلِكَ الْكِتَابُ}؟
[ARTI]
Dalam kajian ayat-ayat surah Al-Baqarah, jawablah pertanyaan berikut:
(1) Apa yang dimaksud dengan isyarat dalam firman Allah: {ذَلِكَ الْكِتَابُ} (Kitab itu)?

---

[SOAL_ARAB]
(٢) لماذا خصت الآية الكريمة المتقين بـ(الهدى) في قوله تعالى: {هُدًى لِلْمُتَّقِينَ}؟
[ARTI]
(2) Mengapa ayat yang mulia mengkhususkan orang-orang yang bertakwa dengan (petunjuk/huda) dalam firman Allah: {هُدًى لِلْمُتَّقِينَ} (petunjuk bagi orang-orang yang bertakwa)?

---

[SOAL_ARAB]
(٣) ما سر تقديم قوله تعالى: {رِزَقْنَاهُمْ} على قوله: {يُنْفِقُونَ}؟
[ARTI]
(3) Apa rahasia didahulukannya firman Allah: {رِزَقْنَاهُمْ} (yang Kami rezekikan kepada mereka) atas firman-Nya: {يُنْفِقُونَ} (mereka infakkan)?

---

[SOAL_ARAB]
(٤) نبّه الله في قوله تعالى: {أُولَئِكَ عَلَى هُدًى مِنْ رَبِّهِمْ وَأُولَئِكَ هُمُ الْمُفْلِحُونَ} على اختصاص المتقين بنيل ما لا يناله غيرهم من وجوه شتى، اذكرها؟
[ARTI]
(4) Allah mengingatkan dalam firman-Nya: {Mereka itulah yang mendapat petunjuk dari Tuhan mereka, dan mereka itulah orang-orang yang beruntung} bahwa orang-orang yang bertakwa dikhususkan untuk mendapatkan apa yang tidak diperoleh selain mereka dari berbagai sisi, sebutkan sisi-sisi tersebut?

---

**السؤال الثالث [٢٠ درجة]**

[SOAL_ARAB]
أكمل العبارات الآتية:
(١) يعم لفظ (الناس) في قوله تعالى: (يا أيها الناس اعبدوا) ؟ ............. و.............؟
[ARTI]
Lengkapilah pernyataan-pernyataan berikut:
(1) Lafaz (الناس) dalam firman Allah: (Wahai manusia, sembahlah) mencakup ............. dan .............?

---

[SOAL_ARAB]
(٢) موقع قوله تعالى: (لعلكم تتقون) من الإعراب إما حال من ............. والمعنى عليه ............. أو حال من ............. والمعنى عليه .............؟
[ARTI]
(2) Kedudukan i'rab firman Allah: (لعلكم تتقون) bisa berupa hal dari ............. dan maknanya ............. atau hal dari ............. dan maknanya .............?

---

[SOAL_ARAB]
(٣) الإنذار معناه ............. واقتصر الله عليه دون البشارة لأنه .............؟
[ARTI]
(3) Al-Indzar (peringatan) maknanya ............. dan Allah membatasinya tanpa kabar gembira karena .............?

---

[SOAL_ARAB]
(٤) الراجح عود الضمير في قوله: {مِنْ مِثْلِهِ} إلى ............. .............؟
[ARTI]
(4) Pendapat yang rajih (kuat) tentang kembalinya dhamir (kata ganti) dalam firman-Nya: {مِنْ مِثْلِهِ} adalah kepada ............. .............?$soal$
where id = '6671b498-db4d-4ba2-8b40-97fea1da2c9b' and md5(soal) = 'ec6d342cc26308a9777c1f314b80e2a8';

-- 83206630 · Tajwid · tingkat 3 · 2025/2026 tsani
-- Pindahkan potongan skor "[٤٠ درجة]" (tampil sebagai SOAL 1) ke awal soal pertama.
update public.bank_soal set soal = $soal$[SOAL_ARAB]
**(٤٠ درجة)**
١- عرّف الحرف اصطلاحًا، وما المراد به في علم التجويد، وأقسامه تفصيلًا، وما شرط الحروف الفرعية؟
[ARTI]
**(40 poin)**
Definisikan huruf secara istilah, apa yang dimaksud dengannya dalam ilmu tajwid, sebutkan pembagiannya secara rinci, dan apa syarat huruf-huruf far'iyyah (cabang)?

---

[SOAL_ARAB]
٢- ما المخارج الرئيسة، والفرعية، مع بيان عددها؟
[ARTI]
Apa saja makhraj-makhraj utama dan cabang, beserta penjelasan jumlahnya?

---

[SOAL_ARAB]
٣- فرق بين الياء المدية والتحتية، مع التمثيل.
[ARTI]
Bedakan antara ya' maddiyyah dan ya' tahtiyyah, beserta contohnya.

---

[SOAL_ARAB]
٤- بيّن حكم ما يأتي: (أحطت – الذي يوسوس – أنعمت).
[ARTI]
Jelaskan hukum bacaan dari kata-kata berikut: (أحطت – الذي يوسوس – أنعمت).

---

**السؤال الثاني [٤٠ درجة]**

[SOAL_ARAB]
١- يقول الناظم: *** وحاقَّةُ اللِّسانَ فأقصاها لحرفٍ تطوُّلا
إلى ما يلي الأضراسَ وهوَ لَدَيهِما *** يَعزُّ وباليُمنى يكونُ مُقَلَّلا
اشرح البيتين، وانسبهما إلى قائلهما، وما المخرج الذي يتحدث عنه، وما حروفه؟
[ARTI]
Penyair berkata: (dua bait di atas). Jelaskan kedua bait tersebut, nisbatkan kepada pengarangnya, apa makhraj yang dibicarakan, dan apa saja huruf-hurufnya?

---

[SOAL_ARAB]
٢- "حروف الإصمات ممنوعة من انفرادها أصولًا في بنات الأربعة والخمسة"، وضّح هذه الجملة مع المثال، وما حروف الإصمات؟
[ARTI]
"Huruf-huruf ishmât dilarang berdiri sendiri secara asal dalam kata-kata berwazan empat dan lima huruf." Jelaskan kalimat ini beserta contohnya, dan apa saja huruf-huruf ishmât?

---

[SOAL_ARAB]
٣- ما أنواع اللامات، وما حدها، وحكمها؟
[ARTI]
Apa saja jenis-jenis lam, apa batasannya, dan apa hukumnya?

---

[SOAL_ARAB]
٤- مثّل لما يأتي: (مثلان صغير، مثلان كبير، مدان لازمان مثقلان في كلمة واحدة، مد تبرئة، مد الروم).
[ARTI]
Berikan contoh untuk hal-hal berikut: (mitslain shaghir, mitslain kabir, dua mad lazim muthaqqal dalam satu kata, mad tabriah, mad ar-raum).

---

**السؤال الثالث [٢٠ درجة]**

[SOAL_ARAB]
(أ)- اختر الإجابة الصحيحة:

١- جعل العلامة سيبويه والشاطبي وابن الجزري لـــ (اللام والنون والراء): (مخرجين – ثلاثة مخارج – أربعة مخارج).

٢- الانحراف صفة لحرفي.... (اللام والميم – الراء والنون – اللام والراء).

٣- حرف الضاد يشارك الظاء في صفاته كلها إلا صفة ......... (الإطباق – الإذلاق – الاستطالة).
[ARTI]
(A)- Pilih jawaban yang benar:

1. Imam Sibawaih, Asy-Syathibi, dan Ibnu Al-Jazari menjadikan (lam, nun, dan ra') memiliki: (dua makhraj – tiga makhraj – empat makhraj).

2. Inhiraf adalah sifat bagi dua huruf.... (lam dan mim – ra' dan nun – lam dan ra').

3. Huruf dhad menyamai huruf zha dalam semua sifatnya kecuali sifat ......... (ithbaq – idzlaq – istithalah).

---

[SOAL_ARAB]
(ب)- أكمل ما يأتي:

١- التفخيم ناشئ عن كل من......، .........، والترقيق ناشئ عن .........

٢- ببيان مخرج الحرف تُعرَفُ ..........، وببيان الصفة تُعرَفُ ..........

٣- الطاء أقوى من الدال، وإن اشتركا في قوة الجهر؛ لانفراد الطاء بـــ ..........، ..........، ..........

٤- أقوى حروف الصفير حرف ........؛ لـ..........، ..........، وأضعفها حرف ..........لكونها ..........
[ARTI]
(B)- Lengkapilah berikut ini:

1. Tafkhim muncul dari setiap ......, ......., dan tarqiq muncul dari .........

2. Dengan menjelaskan makhraj huruf maka diketahui .........., dan dengan menjelaskan sifat maka diketahui ..........

3. Huruf tha' lebih kuat dari dal, meskipun keduanya sama dalam kekuatan jahr; karena tha' memiliki keistimewaan berupa .........., .........., ..........

4. Huruf shafir yang paling kuat adalah huruf ........; karena .........., .........., dan yang paling lemah adalah huruf .......... karena ia ..........$soal$
where id = '83206630-1ac7-434f-b3b2-b56c74da7ccc' and md5(soal) = 'f698877de1d24df6ed2751f748448e71';
