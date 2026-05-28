/* Talqih, Muqaranah Library Seed Data (6 entries) */

const MUQARANAH_LIBRARY = [
  {
    id: "basmalah-fatihah",
    title: "Hukum Membaca Basmalah dalam Al-Fatihah",
    titleArabic: "حُكْمُ قِرَاءَةِ الْبَسْمَلَةِ فِي الْفَاتِحَةِ",
    category: "fiqh",
    question: "Apakah Basmalah merupakan bagian dari surat Al-Fatihah, dan bagaimana hukum membacanya, terlebih dalam shalat jahriyah ketika makmum berada di belakang imam dari madzhab berbeda?",
    views: [
      {
        scholar: "Imam Asy-Syafi'i",
        scholarArabic: "الإمامُ الشَّافِعِيُّ",
        school: "Syafi'iyah",
        position: "Basmalah adalah ayat pertama dari Al-Fatihah dan termasuk bagiannya. Wajib dibaca, dan sunnah di-jahr-kan dalam shalat jahriyah.",
        evidence: {
          arabic: "وَلَقَدْ آتَيْنَاكَ سَبْعًا مِّنَ الْمَثَانِي وَالْقُرْآنَ الْعَظِيمَ",
          translation: "Dan sungguh telah Kami berikan kepadamu tujuh (ayat) yang berulang dan Al-Qur'an yang agung. (Al-Hijr: 87)",
          notes: "Diperkuat riwayat An-Nasa'i dan Ibnu Khuzaimah bahwa Nabi ﷺ men-jahr-kan Basmalah dalam shalat."
        },
        reasoning: "Tujuh ayat yang dimaksud adalah Al-Fatihah. Hitungan tujuh itu hanya genap bila Basmalah dihitung sebagai ayat pertama. Karena ia bagian dari surat, maka hukum membacanya mengikuti hukum membaca Al-Fatihah itu sendiri yang wajib dalam shalat. Kewajiban men-jahr-kannya mengikuti sifat shalat, bila shalat jahriyah, basmalah pun dijahrkan.",
        source: "Al-Umm · Mughni Al-Muhtaj · Al-Majmu'"
      },
      {
        scholar: "Imam Abu Hanifah",
        scholarArabic: "الإمامُ أبو حنيفةَ",
        school: "Hanafiyah",
        position: "Basmalah bukan bagian dari Al-Fatihah, melainkan ayat tersendiri yang diturunkan sebagai pemisah antarsurat. Dibaca sirr dalam shalat.",
        evidence: {
          arabic: "عَنْ أَنَسِ بْنِ مَالِكٍ قَالَ: صَلَّيْتُ خَلْفَ النَّبِيِّ ﷺ وَأَبِي بَكْرٍ وَعُمَرَ، فَكَانُوا يَسْتَفْتِحُونَ بِالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
          translation: "Dari Anas bin Malik: 'Aku pernah shalat di belakang Nabi ﷺ, Abu Bakr, dan Umar. Mereka membuka dengan Alhamdulillahi rabbil 'alamin.' (Muttafaqun 'alaih)",
          notes: "Penyebutan 'Alhamdulillahi rabbil 'alamin' sebagai pembuka menunjukkan Al-Fatihah dimulai dari ayat ini, bukan Basmalah."
        },
        reasoning: "Riwayat yang sahih menunjukkan para sahabat tidak menjahrkan Basmalah. Basmalah ada di mushaf sebagai pemisah surat, bukan sebagai bagian dari surat tertentu. Membacanya secara sirr dalam shalat adalah tindakan ihtiyath (kehati-hatian) sekaligus mengikuti amalan yang lebih dominan riwayatnya.",
        source: "Al-Hidayah · Badai'ush Shanai' · Fathul Qadir"
      },
      {
        scholar: "Imam Malik",
        scholarArabic: "الإمامُ مالكٌ",
        school: "Malikiyah",
        position: "Basmalah bukan bagian dari Al-Fatihah, bahkan tidak disunnahkan dibaca sama sekali dalam shalat, baik jahriyah maupun sirriyah. Ini mengikuti amal ahlul Madinah.",
        evidence: {
          arabic: "مَالِكٌ عَنِ ابْنِ شِهَابٍ عَنْ أَنَسِ بْنِ مَالِكٍ أَنَّهُ قَالَ: صَلَّيْتُ وَرَاءَ أَبِي بَكْرٍ الصِّدِّيقِ وَعُمَرَ بْنِ الْخَطَّابِ وَعُثْمَانَ فَلَمْ أَسْمَعْ أَحَدًا مِنْهُمْ يَقْرَأُ بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
          translation: "Dari Anas bin Malik: 'Aku shalat di belakang Abu Bakr, Umar, dan Utsman, dan aku tidak mendengar seorang pun dari mereka membaca Bismillahirrahmanirrahim.' (Muwattha' Malik)",
          notes: "Ini diperkuat oleh amalan ahlu Madinah yang berkesinambungan tanpa membaca Basmalah dalam shalat."
        },
        reasoning: "Prinsip Imam Malik adalah amal ahlul Madinah merupakan hujjah yang kuat karena mereka mewarisi praktik Nabi secara langsung dan berkesinambungan. Riwayat yang menunjukkan tidak dibacanya Basmalah oleh para khulafa' adalah bukti nyata bahwa ia bukan bagian dari Al-Fatihah.",
        source: "Al-Muwattha' · Al-Mudawwanah · At-Taj wal Iklil"
      },
      {
        scholar: "Imam Ahmad bin Hanbal",
        scholarArabic: "الإمامُ أحمدُ بنُ حنبلٍ",
        school: "Hanabilah",
        position: "Basmalah adalah ayat dari Al-Fatihah menurut pendapat yang rajih dalam madzhab. Dibaca dalam shalat secara sirr, tidak dijahrkan.",
        evidence: {
          arabic: "عَنْ أُمِّ سَلَمَةَ رَضِيَ اللَّهُ عَنْهَا أَنَّ النَّبِيَّ ﷺ قَرَأَ فِي الصَّلَاةِ: بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ، الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
          translation: "Dari Ummu Salamah ra. bahwa Nabi ﷺ membaca dalam shalat: 'Bismillahirrahmanirrahim, Alhamdulillahi rabbil 'alamin...' (HR. Abu Dawud, dinilai hasan)",
          notes: "Riwayat ini menunjukkan Basmalah dibaca sebagai bagian dari Al-Fatihah, namun riwayat lain yang sahih menunjukkan tidak dijahrkan."
        },
        reasoning: "Pendapat yang rajih dalam madzhab Hanbali adalah Basmalah merupakan ayat dari Al-Fatihah berdasarkan hadits Ummu Salamah dan riwayat-riwayat pendukungnya. Namun, riwayat yang menunjukkan para sahabat tidak menjahrkannya menjadi dalil bahwa dalam shalat jahriyah ia dibaca sirr.",
        source: "Al-Mughni · Al-Insaf · Kasysyaf Al-Qina'"
      }
    ],
    notes: "Akar perbedaan terletak pada status Basmalah: apakah ia ayat pertama dari setiap surat (Syafi'i, sebagian Hanbali), ayat tersendiri sebagai pembatas (Hanafi), atau bukan ayat surat sama sekali (Maliki). Konsekuensi paling nyata adalah ketika makmum Syafi'i shalat di belakang imam Maliki yang tidak membaca Basmalah, dalam hal ini para ulama sepakat bahwa shalat tetap sah karena perbedaan ini adalah khilaf mu'tabar."
  },

  {
    id: "mashu-khuf",
    title: "Hukum Mengusap Khuf dalam Wudhu",
    titleArabic: "حُكْمُ الْمَسْحِ عَلَى الْخُفَّيْنِ",
    category: "fiqh",
    question: "Apakah mengusap khuf (sepatu kulit) sebagai pengganti membasuh kaki dalam wudhu adalah rukhshah yang sah? Adakah perbedaan dalam persyaratan dan batas waktunya di antara para fuqaha?",
    views: [
      {
        scholar: "Imam Asy-Syafi'i",
        scholarArabic: "الإمامُ الشَّافِعِيُّ",
        school: "Syafi'iyah",
        position: "Mengusap khuf hukumnya sah dengan empat syarat: dipakai dalam keadaan bersuci sempurna (thaharah kamilah), menutup bagian yang wajib dibasuh, dapat digunakan berjalan, dan dalam batas waktu, sehari semalam untuk mukim, tiga hari tiga malam untuk musafir.",
        evidence: {
          arabic: "عَنِ الْمُغِيرَةِ بْنِ شُعْبَةَ قَالَ: كُنْتُ مَعَ النَّبِيِّ ﷺ فِي سَفَرٍ، فَأَهْوَيْتُ لِأَنْزِعَ خُفَّيْهِ، فَقَالَ: دَعْهُمَا فَإِنِّي أَدْخَلْتُهُمَا طَاهِرَتَيْنِ",
          translation: "Dari Al-Mughirah bin Syu'bah: 'Aku bersama Nabi ﷺ dalam suatu perjalanan, aku hendak melepas kedua khuf-nya, lalu beliau bersabda: Biarkan keduanya, sebab aku memakainya dalam keadaan suci.' (Muttafaqun 'alaih)",
          notes: "Syarat 'dipakai dalam keadaan suci sempurna' diambil dari perintah Nabi agar khuf dibiarkan karena dipakai dalam keadaan suci."
        },
        reasoning: "Syarat menutup dan memungkinkan berjalan diambil dari fungsi khuf itu sendiri sebagai alas kaki yang sempurna. Batas waktu ditetapkan berdasarkan hadits Ali ra. yang sahih. Keempat syarat ini tidak boleh gugur salah satunya karena ia bersifat ta'abbudiy (ibadah mahdhah yang rinci).",
        source: "Al-Umm · Al-Majmu' Nawawi · Fathul Wahhab"
      },
      {
        scholar: "Imam Abu Hanifah",
        scholarArabic: "الإمامُ أبو حنيفةَ",
        school: "Hanafiyah",
        position: "Mengusap khuf sah dengan syarat yang sedikit lebih luas: boleh dipakai setelah wudhu biasa, dan batas waktunya sama (sehari semalam mukim, tiga hari musafir). Cukup mengusap sebagian besar atas khuf.",
        evidence: {
          arabic: "عَنْ عَلِيٍّ رَضِيَ اللَّهُ عَنْهُ قَالَ: جَعَلَ رَسُولُ اللَّهِ ﷺ ثَلَاثَةَ أَيَّامٍ وَلَيَالِيَهَا لِلْمُسَافِرِ وَيَوْمًا وَلَيْلَةً لِلْمُقِيمِ",
          translation: "Dari Ali ra.: 'Rasulullah ﷺ menetapkan tiga hari tiga malam bagi musafir dan sehari semalam bagi mukim (dalam mengusap khuf).' (HR. Muslim)",
          notes: "Hadits ini menjadi dasar batas waktu yang disepakati mayoritas fuqaha."
        },
        reasoning: "Dalam madzhab Hanafi, tidak disyaratkan thaharah kamilah dalam makna yang paling ketat, cukup wudhu biasa. Yang penting khuf tidak rusak lebih dari batas toleransi. Ini pemaknaan yang lebih inklusif terhadap rukhshah.",
        source: "Al-Hidayah · Badai'ush Shanai' · Raddul Muhtar"
      },
      {
        scholar: "Imam Malik",
        scholarArabic: "الإمامُ مالكٌ",
        school: "Malikiyah",
        position: "Mengusap khuf hukumnya sah dan merupakan rukhshah. Namun dalam riwayat yang masyhur dari Imam Malik, beliau memakruhkannya tanpa darurat, lebih utama membasuh kaki langsung.",
        evidence: {
          arabic: "عَنِ ابْنِ شِهَابٍ قَالَ: سَأَلْتُ عُرْوَةَ بْنَ الزُّبَيْرِ عَنِ الْمَسْحِ عَلَى الْخُفَّيْنِ، فَقَالَ: هُوَ رُخْصَةٌ",
          translation: "Dari Ibnu Syihab: 'Aku bertanya kepada 'Urwah bin Az-Zubair tentang mengusap khuf, lalu ia menjawab: Itu adalah rukhshah.' (Muwattha')",
          notes: "Imam Malik menerimanya sebagai rukhshah namun memiliki sikap kehati-hatian."
        },
        reasoning: "Imam Malik menerima riwayat-riwayat mashu khuf yang mutawatir dan mengakuinya sebagai sunnah sahihah. Namun prinsip tahadhdur (kehati-hatian) dalam ibadah menjadikan beliau memilih yang paling yakin kebersihan dan kesempurnaannya, yaitu membasuh langsung. Dalam perjalanan jauh atau kondisi sulit, rukhshah ini digunakan.",
        source: "Al-Mudawwanah · At-Taj wal Iklil · Bidayatul Mujtahid"
      },
      {
        scholar: "Ibnu Hazm Az-Zhahiri",
        scholarArabic: "ابنُ حزمٍ الظَّاهِرِيُّ",
        school: "Zhahiriyah",
        position: "Mengusap khuf bukan sekadar rukhshah, melainkan wajib hukumnya mengusap bila khuf dipakai, bukan membasuh kaki. Ini zhahir nash.",
        evidence: {
          arabic: "وَامْسَحُوا بِرُءُوسِكُمْ وَأَرْجُلَكُمْ",
          translation: "Dan usaplah kepalamu serta kakimu... (Al-Ma'idah: 6, qira'at jar, 'arjulikum')",
          notes: "Ibnu Hazm berdalil dengan qira'at 'arjulikum (jar) yang menunjukkan kaki di-'athaf-kan kepada kepala, artinya cukup diusap."
        },
        reasoning: "Ibnu Hazm berpegang pada zhahir lafazh Al-Qur'an dalam qira'at yang mengjarkan kata 'kaki'. Jika khuf dipakai, maka yang wajib adalah mengusap, bukan membasuh. Ini konsisten dengan prinsip Zhahiriyah yang tidak melampaui zhahir nash.",
        source: "Al-Muhalla bil Atsar"
      }
    ],
    notes: "Perbedaan ini berpangkal pada dua hal: (1) cara memahami qira'at ayat wudhu, nasb atau jar, dan (2) sejauh mana rukhshah dapat diterima atau bahkan diwajibkan. Untuk mahasiswa Masisir di Cairo dengan musim dingin yang menusuk, masalah ini sangat praktis. Para fuqaha kontemporer umumnya menggunakan pendapat Syafi'i atau Hanbali yang mensyaratkan kondisi lengkap."
  },

  {
    id: "ijma-hujjiyah",
    title: "Kehujjahan Ijma' sebagai Sumber Hukum",
    titleArabic: "حُجِّيَّةُ الْإِجْمَاعِ وَتَعْرِيفُهُ",
    category: "ushul",
    question: "Apakah Ijma' merupakan sumber hukum yang mengikat dan bersifat qath'i? Bagaimana para ushuliyyin mendefinisikannya, dan siapa yang dianggap sebagai objek Ijma' yang valid?",
    views: [
      {
        scholar: "Jumhur Ushuliyyin",
        scholarArabic: "جُمْهُورُ الأُصُولِيِّينَ",
        school: "Syafi'iyah · Hanafiyah · Malikiyah · Hanabilah",
        position: "Ijma' adalah hujjah qath'iyah yang mengikat, kesepakatan para mujtahid dari umat Muhammad ﷺ setelah wafatnya beliau pada suatu zaman atas suatu hukum syar'i. Mengingkarinya termasuk kategori kekufuran jika ijma'nya mutawatir.",
        evidence: {
          arabic: "وَمَن يُشَاقِقِ الرَّسُولَ مِن بَعْدِ مَا تَبَيَّنَ لَهُ الْهُدَى وَيَتَّبِعْ غَيْرَ سَبِيلِ الْمُؤْمِنِينَ نُوَلِّهِ مَا تَوَلَّى",
          translation: "Dan barangsiapa menentang Rasul setelah jelas kebenaran baginya dan mengikuti jalan selain jalan orang-orang mukmin, maka Kami biarkan ia leluasa terhadap kesesatan yang telah dikuasainya. (An-Nisa': 115)",
          notes: "Larangan mengikuti 'selain jalan orang mukmin' mengandung makna kewajiban mengikuti konsensus mereka."
        },
        reasoning: "Ayat ini secara eksplisit menyandingkan 'menentang Rasul' dengan 'meninggalkan jalan orang mukmin' dalam satu konteks ancaman. Ini menunjukkan bahwa jalan orang mukmin (ijma') memiliki hujjiyah yang berdiri sendiri. Diperkuat hadits: 'Umatku tidak akan bersepakat atas kesesatan.'",
        source: "Al-Mustashfa · Al-Ihkam fil Ushul · Raudhah An-Nazhar"
      },
      {
        scholar: "Ibnu Hazm Az-Zhahiri",
        scholarArabic: "ابنُ حزمٍ الظَّاهِرِيُّ",
        school: "Zhahiriyah",
        position: "Yang disebut Ijma' dan menjadi hujjah hanyalah Ijma' Sahabat, karena mereka satu-satunya generasi yang kesepakatan mereka dapat diverifikasi secara pasti. Ijma' masa setelahnya tidak dapat diklaim dengan yakin.",
        evidence: {
          arabic: "وَالسَّابِقُونَ الْأَوَّلُونَ مِنَ الْمُهَاجِرِينَ وَالْأَنصَارِ وَالَّذِينَ اتَّبَعُوهُم بِإِحْسَانٍ رَّضِيَ اللَّهُ عَنْهُمْ",
          translation: "Dan orang-orang yang terdahulu dan pertama-tama (masuk Islam) dari kaum Muhajirin dan Anshar dan orang-orang yang mengikuti mereka dengan baik, Allah ridha kepada mereka. (At-Taubah: 100)",
          notes: "Kekhususan para Sahabat sebagai generasi yang dijamin Allah menunjukkan hanya kesepakatan mereka yang dapat dipercaya penuh."
        },
        reasoning: "Klaim ijma' pada zaman setelah Sahabat praktis tidak mungkin diverifikasi karena penyebaran ulama ke seluruh penjuru dunia. Jika tidak bisa diverifikasi, maka klaim tersebut tidak dapat dijadikan dalil. Ibnu Hazm konsisten dengan prinsip bahwa tidak boleh ada hukum tanpa nash atau ijma' yang dapat dipastikan.",
        source: "Al-Muhalla bil Atsar · Al-Ihkam fi Ushul Al-Ahkam (Ibnu Hazm)"
      },
      {
        scholar: "An-Nazzham Al-Mu'tazili",
        scholarArabic: "النَّظَّامُ الْمُعْتَزِلِيُّ",
        school: "Mu'tazilah",
        position: "Ijma' tidak memiliki hujjiyah sama sekali sebagai sumber hukum yang berdiri sendiri, karena tidak ada nash yang kuat dan eksplisit mewajibkan mengikutinya, dan karena ijma' bisa mengandung kesalahan.",
        evidence: {
          arabic: "وَلَا تَقْفُ مَا لَيْسَ لَكَ بِهِ عِلْمٌ",
          translation: "Dan janganlah kamu mengikuti apa yang tidak kamu ketahui. (Al-Isra': 36)",
          notes: "An-Nazzham berargumen bahwa kesepakatan yang tidak dapat diketahui secara pasti tidak boleh diikuti."
        },
        reasoning: "An-Nazzham mempertanyakan: bagaimana mungkin kesepakatan para ulama yang tersebar di berbagai negeri pada satu masa dapat diketahui dengan pasti? Tanpa kepastian, klaim ijma' hanya dugaan. Dan dugaan saja tidak cukup untuk menetapkan hukum syar'i yang mengikat. Pendapat ini ditolak keras oleh jumhur karena bertentangan dengan hadits-hadits yang kuat.",
        source: "Al-Mu'tamad fi Ushul Al-Fiqh (Al-Bashri), dinukil sebagai mauqif An-Nazzham"
      }
    ],
    notes: "Perdebatan ini lebih dari sekedar teori, ia berdampak langsung pada berapa banyak masalah yang dianggap 'tertutup' dan tidak boleh dikaji ulang. Jumhur menetapkan banyak masalah sebagai ijma' yang tidak boleh diingkari. Ibnu Hazm sangat membatasi ruang lingkup ijma'. Pendapat An-Nazzham tidak diterima umat Islam secara umum dan disebutkan di sini sebagai catatan sejarah."
  },

  {
    id: "hadits-mursal",
    title: "Status Hadits Mursal sebagai Hujjah",
    titleArabic: "حُجِّيَّةُ الْحَدِيثِ الْمُرْسَلِ",
    category: "ushul",
    question: "Hadits mursal, yaitu hadits yang sanadnya terputus di tingkat Tabi'in (tanpa menyebut Sahabat sebagai perawi), apakah dapat dijadikan hujjah dalam penetapan hukum? Dan bagaimana konsekuensinya bagi praktik fiqh?",
    views: [
      {
        scholar: "Imam Abu Hanifah & Imam Malik",
        scholarArabic: "الإمامُ أبو حنيفةَ والإمامُ مالكٌ",
        school: "Hanafiyah · Malikiyah",
        position: "Hadits mursal adalah hujjah mutlak, setara dengan hadits muttasil. Tabi'in yang mersal-kan hadits pastilah meriwayatkannya dari sahabat yang dapat dipercaya, karena mereka tidak akan sembarangan dalam meriwayatkan.",
        evidence: {
          arabic: "قَالَ مَالِكٌ: لَا يَكُونُ مُرْسَلَ إِلَّا رَجُلٌ عَدْلٌ أَرْسَلَ عَنْ رَجُلٍ عَدْلٍ",
          translation: "Imam Malik berkata: 'Hadits tidak akan dimursal-kan kecuali oleh orang yang adil dari orang yang adil pula.'",
          notes: "Prinsip ini mencerminkan kepercayaan penuh terhadap integritas para Tabi'in senior."
        },
        reasoning: "Para Tabi'in yang menerima hadits langsung dari lingkungan Nabi adalah orang-orang yang sangat berhati-hati dalam meriwayatkan. Jika mereka memilih untuk tidak menyebut nama perawi, itu menunjukkan kepercayaan penuh mereka kepada perawi tersebut. Tidak adanya nama sahabat bukan tanda kelemahan, melainkan tanda kepercayaan.",
        source: "Al-Hidayah · Al-Muwattha' · Al-Ihkam Ibnu Hazm (dinukil mauqif Malik)"
      },
      {
        scholar: "Imam Asy-Syafi'i",
        scholarArabic: "الإمامُ الشَّافِعِيُّ",
        school: "Syafi'iyah",
        position: "Hadits mursal pada prinsipnya tidak dapat dijadikan hujjah, kecuali mursal Sa'id bin Al-Musayyab yang diperkuat oleh satu dari empat faktor penguat: mursal lain, riwayat sahabat, qiyas yang sesuai, atau diterima mayoritas ulama.",
        evidence: {
          arabic: "فَإِن قَبِلَ عَدْلٌ عَن عَدْلٍ حَتَّى يَنْتَهِيَ إِلَى النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ فَهُوَ ثَابِتٌ",
          translation: "Jika orang yang adil meriwayatkan dari yang adil hingga berujung kepada Nabi ﷺ maka ia tsabit. (Asy-Syafi'i dalam Ar-Risalah)",
          notes: "Syarat 'bersambung hingga Nabi' adalah inti sistem isnad Asy-Syafi'i."
        },
        reasoning: "Asy-Syafi'i adalah arsitek sistem isnad formal. Beliau mewajibkan sanad bersambung karena tidak mungkin memverifikasi kualitas perawi yang tidak disebutkan. Kita tidak tahu siapa yang dihilangkan: sahabat yang tsiqah, atau perawi lemah yang disembunyikan? Pengecualian mursal Sa'id bin Al-Musayyab karena ia dikenal paling ketat dalam memursal-kan dan mursal-nya hampir selalu didukung riwayat lain.",
        source: "Ar-Risalah · Al-Umm · Al-Majmu'"
      },
      {
        scholar: "Imam Ahmad bin Hanbal",
        scholarArabic: "الإمامُ أحمدُ بنُ حنبلٍ",
        school: "Hanabilah",
        position: "Hadits mursal dapat dijadikan hujjah jika tidak ada riwayat lain yang bertentangan. Dalam kondisi kekosongan dalil, mursal lebih kuat dari qiyas.",
        evidence: {
          arabic: "الْمُرْسَلُ أَقْوَى عِنْدِي مِنَ الرَّأْيِ",
          translation: "Mursal menurutku lebih kuat dari ra'yu (pendapat). (Dinukil dari Imam Ahmad)",
          notes: "Prinsip ini mencerminkan kecenderungan Ahmad pada atsar (riwayat) meski tidak sempurna sanadnya, dibandingkan ra'yu yang tidak ada sandaran riwayatnya sama sekali."
        },
        reasoning: "Ahmad membuat hierarki: hadits muttasil shahih > hadits muttasil hasan > hadits mursal > qiyas/ra'yu. Mursal tetap lebih baik dari tidak ada riwayat sama sekali, karena minimal ada kemungkinan ia bersumber dari sahabat. Dalam situasi di mana masalah harus diselesaikan dan tidak ada hadits muttasil, mursal digunakan.",
        source: "Raudhah An-Nazhar · Al-Mughni · Al-Musnad (muqaddimah)"
      }
    ],
    notes: "Perbedaan ini berdampak luas: ratusan hukum fiqh yang bertumpu pada hadits mursal menjadi valid atau tidak valid tergantung posisi mana yang dianut. Imam Syafi'i yang paling ketat justru memberikan kontribusi terbesar dalam menstrukturkan ilmu hadits. Mahasiswa Syariah dan Hadits di Al-Azhar perlu memahami ini sebagai fondasi metodologi ijtihad."
  },

  {
    id: "definisi-iman",
    title: "Definisi Iman: Apakah Amal Termasuk Hakikatnya?",
    titleArabic: "تَعْرِيفُ الْإِيمَانِ: هَلِ الْعَمَلُ دَاخِلٌ فِي حَقِيقَتِهِ؟",
    category: "aqidah",
    question: "Apakah amal perbuatan merupakan bagian dari hakikat iman, sehingga iman bisa bertambah dengan ketaatan dan berkurang dengan maksiat? Atau iman adalah entitas tetap dalam hati yang tidak dipengaruhi amal?",
    views: [
      {
        scholar: "Salaf & Ahlul Hadits",
        scholarArabic: "السَّلَفُ وَأَهْلُ الْحَدِيثِ",
        school: "Athariyah · Hanbali",
        position: "Iman adalah tashdiq dengan hati, ikrar dengan lisan, dan amal dengan anggota tubuh. Iman bertambah dengan ketaatan dan berkurang dengan maksiat.",
        evidence: {
          arabic: "إِنَّمَا الْمُؤْمِنُونَ الَّذِينَ إِذَا ذُكِرَ اللَّهُ وَجِلَتْ قُلُوبُهُمْ وَإِذَا تُلِيَتْ عَلَيْهِمْ آيَاتُهُ زَادَتْهُمْ إِيمَانًا",
          translation: "Sesungguhnya orang-orang yang beriman ialah mereka yang bila disebut nama Allah gemetarlah hati mereka, dan apabila dibacakan ayat-Nya bertambahlah iman mereka. (Al-Anfal: 2)",
          notes: "Ayat ini secara eksplisit menyatakan iman bertambah, ini dalil langsung bahwa iman bukan sesuatu yang statis."
        },
        reasoning: "Definisi tiga unsur (tashdiq, ikrar, amal) didasarkan pada pemahaman salaf secara keseluruhan terhadap nash-nash Al-Qur'an dan Sunnah. Jika iman tidak mengandung amal, maka amal tidak memiliki kaitan hakiki dengan iman, padahal Al-Qur'an selalu menyandingkan 'الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ'.",
        source: "Syarh Ushul I'tiqad Ahlus Sunnah · Kitabul Iman (Ibnu Mandah) · Al-'Aqidah Al-Wasithiyah"
      },
      {
        scholar: "Al-Maturidiyah & sebagian Asy'ariyah",
        scholarArabic: "الْمَاتُرِيدِيَّةُ وَبَعْضُ الْأَشْعَرِيَّةِ",
        school: "Maturidiyah · Asy'ariyah",
        position: "Hakikat iman adalah tashdiq qalbi (pembenaran hati). Ikrar lisan adalah syarat berlakunya hukum duniawi. Amal bukan bagian dari hakikat iman, namun merupakan kesempurnaan dan buahnya.",
        evidence: {
          arabic: "قَالَتِ الْأَعْرَابُ آمَنَّا قُل لَّمْ تُؤْمِنُوا وَلَكِن قُولُوا أَسْلَمْنَا",
          translation: "Orang-orang Arab Badui berkata: 'Kami telah beriman.' Katakanlah: 'Kalian belum beriman, tetapi katakanlah: Kami telah tunduk (Islam).' (Al-Hujurat: 14)",
          notes: "Ayat ini membedakan iman (keyakinan dalam) dari Islam (pernyataan luar), mengindikasikan iman adalah sesuatu di dalam hati yang berbeda dari amalan lahir."
        },
        reasoning: "Jika amal termasuk hakikat iman, maka pelaku dosa besar seharusnya kafir atau tidak beriman sama sekali, ini tidak sesuai dengan konsensus Ahlus Sunnah bahwa pelaku dosa besar tidak keluar dari Islam. Pemisahan hakikat iman (tashdiq) dari amal memungkinkan kita memahami gradasi keimanan secara lebih nuanced tanpa jatuh ke pernyataan takfir.",
        source: "Syarh Aqidah Thahawiyah · Umm Al-Barahin · Al-Musamarah"
      },
      {
        scholar: "Murji'ah",
        scholarArabic: "الْمُرْجِئَةُ",
        school: "Murji'ah",
        position: "Iman cukup dengan tashdiq qalbi saja. Amal tidak memiliki pengaruh sama sekali terhadap keimanan, dan hukum atas amal ditunda (irja') kepada Allah di akhirat.",
        evidence: {
          arabic: "فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ",
          translation: "Maka barangsiapa mengerjakan kebaikan seberat dzarrah, niscaya ia akan melihat (balasannya). (Az-Zalzalah: 7)",
          notes: "Murji'ah menafsirkan ini sebagai bukti bahwa amal dinilai tersendiri, terpisah dari iman."
        },
        reasoning: "Murji'ah berpendapat bahwa mencampurkan amal ke dalam definisi iman akan menyebabkan kekacauan: apakah orang yang meninggalkan shalat sekali menjadi berkurang imannya? Kapan seseorang keluar dari iman? Dengan memisahkan iman dari amal, kepastian status keimanan seseorang terjaga. Hukum akhirat diserahkan kepada Allah. Pendapat ini dianggap keliru oleh jumhur.",
        source: "Al-Milal wan Nihal (Asy-Syahrastani) · Al-Farq bainal Firaq (Al-Baghdadi)"
      },
      {
        scholar: "Mu'tazilah",
        scholarArabic: "الْمُعْتَزِلَةُ",
        school: "Mu'tazilah",
        position: "Amal adalah syarat iman, bukan pelengkap. Pelaku dosa besar berada di 'manzilah baynal manzilatain', antara iman dan kufur, dan disebut fasiq.",
        evidence: {
          arabic: "إِنَّمَا الْمُؤْمِنُونَ الَّذِينَ آمَنُوا بِاللَّهِ وَرَسُولِهِ ثُمَّ لَمْ يَرْتَابُوا وَجَاهَدُوا بِأَمْوَالِهِمْ وَأَنفُسِهِمْ",
          translation: "Sesungguhnya orang-orang yang beriman hanyalah orang-orang yang beriman kepada Allah dan Rasul-Nya kemudian tidak ragu-ragu dan berjihad dengan harta dan jiwa mereka. (Al-Hujurat: 15)",
          notes: "Mu'tazilah menggunakan 'hanyalah' (إنما) sebagai qasr yang membatasi, iman sejati mensyaratkan tidak ragu dan berjihad."
        },
        reasoning: "Doktrin manzilah baynal manzilatain adalah salah satu dari lima prinsip Mu'tazilah. Ini jawaban atas pertanyaan: apa status pelaku dosa besar? Mu'tazilah menolak menyebutnya mukmin penuh maupun kafir, melainkan berada di antara keduanya. Konsekuensinya, jika mati tanpa taubat, ia kekal di neraka namun azabnya lebih ringan dari kafir. Pendapat ini ditolak Ahlus Sunnah.",
        source: "Syarh Al-Ushul Al-Khamsah · Al-Mughni fi Abwab At-Tauhid"
      }
    ],
    notes: "Ini adalah salah satu topik paling fundamental dalam ilmu kalam dan aqidah. Pemahaman yang jernih tentang perbedaan ini mencegah dua ekstrem yang berbahaya: Khawarij yang mengkafirkan pelaku dosa besar, dan Murji'ah yang menganggap amal tidak berdampak pada iman. Posisi Ahlus Sunnah adalah jalan tengah: amal merupakan bagian dari hakikat iman, pelaku dosa besar tidak kafir tapi imannya berkurang."
  },

  {
    id: "hadits-dhaif-fadhail",
    title: "Hukum Mengamalkan Hadits Dha'if dalam Fadhail A'mal",
    titleArabic: "حُكْمُ الْعَمَلِ بِالْحَدِيثِ الضَّعِيفِ فِي فَضَائِلِ الْأَعْمَالِ",
    category: "hadits",
    question: "Bolehkah seseorang mengamalkan hadits yang dha'if sanadnya dalam konteks fadhail a'mal (keutamaan amal ibadah), dengan catatan amalnya sendiri sudah disyariatkan? Atau apakah hadits dha'if mutlak tidak boleh diamalkan?",
    views: [
      {
        scholar: "Jumhur Ulama (dengan 3 Syarat Ibnu Hajar)",
        scholarArabic: "جُمْهُورُ الْعُلَمَاءِ بِشُرُوطِ ابْنِ حَجَرٍ",
        school: "Syafi'iyah · Hanabilah · Malikiyah · Hanafiyah (kebanyakan)",
        position: "Mengamalkan hadits dha'if dalam fadhail a'mal dibolehkan dengan tiga syarat: (1) kedha'ifannya tidak parah, (2) ada dalil umum yang menjadi landasannya, (3) diamalkan bukan dengan meyakini kesahihannya.",
        evidence: {
          arabic: "قَالَ ابْنُ حَجَرٍ: يَجُوزُ الْعَمَلُ بِالْحَدِيثِ الضَّعِيفِ فِي فَضَائِلِ الْأَعْمَالِ بِثَلَاثَةِ شُرُوطٍ",
          translation: "Ibnu Hajar berkata: 'Dibolehkan mengamalkan hadits dha'if dalam fadhail a'mal dengan tiga syarat...' (Tabyin Al-'Ajab)",
          notes: "Ibnu Hajar Al-'Asqalani merumuskan tiga syarat ini berdasarkan ijma' ulama sebelumnya."
        },
        reasoning: "Kaidahnya: kemungkinan amal itu benar-benar berpahala (jika haditsnya ternyata sahih di sisi Allah) lebih besar dari kerugian yang ditimbulkan (amal ekstra yang tidak berpahala jika ternyata haditsnya palsu). Selama amalan itu sendiri disyariatkan (ada dalil umumnya), tidak ada bid'ah di dalamnya. Yang dikhawatirkan hanyalah meyakini fadhlilah tertentu dengan keyakinan pasti tanpa dasar, itu yang dihindari.",
        source: "Tabyin Al-'Ajab (Ibnu Hajar) · Al-Qaul Al-Badi' (As-Sakhawi) · Al-Adhkar (An-Nawawi)"
      },
      {
        scholar: "Imam Ahmad bin Hanbal",
        scholarArabic: "الإمامُ أحمدُ بنُ حنبلٍ",
        school: "Hanabilah (riwayat awal)",
        position: "Hadits dha'if lebih disukai dari ra'yu dalam masalah fadhail, bahkan beliau dikenal meriwayatkan dan mengamalkan hadits dha'if ketika tidak ada yang sahih dalam bab yang sama.",
        evidence: {
          arabic: "قَالَ الإِمَامُ أَحْمَدُ: إِذَا رَوَيْنَا فِي الْحَلَالِ وَالْحَرَامِ تَشَدَّدْنَا، وَإِذَا رَوَيْنَا فِي الْفَضَائِلِ وَنَحْوِهَا تَسَاهَلْنَا",
          translation: "Imam Ahmad berkata: 'Jika kami meriwayatkan dalam halal dan haram, kami ketat. Jika kami meriwayatkan dalam fadhail dan semisalnya, kami longgar.'",
          notes: "Pernyataan ini merupakan kaidah yang masyhur dan sering dikutip para ulama hadits."
        },
        reasoning: "Pemisahan standar untuk ahkam (hukum halal-haram) dan fadhail mencerminkan kecermatan yang proporsional. Dalam menetapkan sesuatu wajib atau haram, kehati-hatian ekstra diperlukan. Dalam menganjurkan keutamaan sebuah amal yang dasarnya sudah ada, kelonggaran lebih tepat karena risikonya lebih kecil.",
        source: "Masail Al-Imam Ahmad · Al-Mughni (muqaddimah) · Raudhah An-Nazhar"
      },
      {
        scholar: "Al-Muhadditsin Kontemporer (Al-Albani dan muridnya)",
        scholarArabic: "الْمُحَدِّثُونَ الْمُعَاصِرُونَ",
        school: "Salafiyah kontemporer",
        position: "Hadits dha'if mutlak tidak boleh diamalkan dalam fadhail a'mal, karena mengamalkannya berarti menisbatkan sesuatu kepada Nabi yang belum pasti beliau sabdakan.",
        evidence: {
          arabic: "مَن كَذَبَ عَلَيَّ مُتَعَمِّدًا فَلْيَتَبَوَّأْ مَقْعَدَهُ مِنَ النَّارِ",
          translation: "Barangsiapa berdusta atas namaku dengan sengaja, maka bersiaplah menempati tempatnya di neraka. (Muttafaqun 'alaih)",
          notes: "Al-Albani berpendapat mengamalkan hadits dha'if berpotensi menyebarkan sesuatu yang tidak disabdakan Nabi."
        },
        reasoning: "Jika kita mengamalkan hadits dha'if dalam fadhail, secara tidak langsung kita menyebarkan amal tersebut kepada orang lain, dan mereka mungkin meyakininya berasal dari Nabi. Ini bentuk tasahul (berlebihan dalam meremehkan) yang dapat menyuburkan hadits-hadits palsu. Standar yang sama harus diterapkan dalam semua kategori hadits.",
        source: "Silsilah Al-Ahadits Ad-Dha'ifah wal Maudhu'ah (Al-Albani) · Tamam Al-Minnah"
      },
      {
        scholar: "Imam Al-Bukhari & Imam Muslim",
        scholarArabic: "الإمامُ الْبُخَارِيُّ والإمامُ مُسْلِمٌ",
        school: "Muhadditsin Klasik",
        position: "Keduanya sangat ketat dalam standar periwayatan dan tidak membedakan antara ahkam dan fadhail, semua hadits yang dimasukkan dalam Shahih keduanya melewati standar yang sama tinggi.",
        evidence: {
          arabic: "قَالَ الإِمَامُ مُسْلِمٌ: لَيْسَ كُلُّ شَيْءٍ صَحِيحٍ عِنْدِي وَضَعْتُهُ هَاهُنَا، إِنَّمَا وَضَعْتُ هَاهُنَا مَا أَجْمَعُوا عَلَيْهِ",
          translation: "Imam Muslim berkata: 'Tidak semua yang sahih menurutku aku masukkan di sini. Aku hanya memasukkan yang disepakati (keshahihannya).'",
          notes: "Pernyataan ini menunjukkan standar Imam Muslim bahkan lebih ketat dari yang tampak, beliau memilih yang terkuat dari yang kuat."
        },
        reasoning: "Metodologi Bukhari dan Muslim adalah standar tertinggi dalam ilmu hadits. Keduanya tidak membuat pengecualian untuk fadhail. Hal ini bukan berarti mereka mengharamkan penggunaan hadits dha'if di luar kitab mereka, melainkan refleksi standar sangat tinggi untuk kumpulan hadits yang dijadikan rujukan utama.",
        source: "Muqaddimah Shahih Muslim · Hady As-Sari (muqaddimah Fathul Bari)"
      }
    ],
    notes: "Perdebatan ini sangat relevan untuk kehidupan harian Masisir, banyak amalan dan dzikir yang beredar dalam group WhatsApp berbasis hadits dha'if. Posisi yang bijaksana: ikuti tiga syarat Ibnu Hajar, tapi jangan menyebarkannya kepada orang lain tanpa menyebut statusnya. Jangan langsung mengkritik orang yang mengamalkannya, tapi juga jangan menjadikan hadits dha'if sebagai landasan hukum yang kuat."
  },

  {
    id: "qunut-shubuh",
    title: "Hukum Qunut dalam Shalat Shubuh",
    titleArabic: "حكم القنوت في صلاة الصبح",
    category: "fiqh",
    question: "Apakah qunut dalam shalat Shubuh disyariatkan secara terus-menerus (dawam), atau hanya saat ada musibah (qunut nazilah), atau tidak disyariatkan sama sekali?",
    views: [
      {
        scholar: "Imam Asy-Syafi'i",
        scholarArabic: "الإمام الشافعي",
        school: "Syafi'iyyah",
        position: "Qunut Shubuh disunnahkan secara terus-menerus (dawam), dibaca setelah i'tidal di rakaat kedua.",
        evidence: {
          arabic: "عَنْ أَنَسِ بْنِ مَالِكٍ أَنَّ النَّبِيَّ ﷺ قَنَتَ شَهْرًا ثُمَّ تَرَكَهُ وَأَمَّا فِي الصُّبْحِ فَلَمْ يَزَلْ يَقْنُتُ حَتَّى فَارَقَ الدُّنْيَا",
          translation: "Dari Anas bin Malik bahwa Nabi ﷺ qunut sebulan kemudian meninggalkannya, adapun dalam Shubuh beliau terus qunut hingga meninggal dunia.",
          notes: "Diriwayatkan Al-Baihaqi dan dinyatakan shahih oleh sebagian ulama.",
        },
        reasoning: "Riwayat dawam qunut Shubuh dinilai shahih oleh Syafi'iyyah. Qunut Shubuh merupakan sunnah muakkadah yang tidak boleh ditinggalkan secara sengaja.",
        source: "Al-Umm · Mughni Al-Muhtaj · Al-Majmu' (An-Nawawi)",
      },
      {
        scholar: "Imam Ahmad bin Hanbal",
        scholarArabic: "الإمام أحمد بن حنبل",
        school: "Hanabilah",
        position: "Tidak ada qunut dalam shalat Shubuh kecuali saat qunut nazilah (musibah umum). Kalau dilakukan secara terus-menerus, itu bid'ah.",
        evidence: {
          arabic: "عَنِ ابْنِ مَسْعُودٍ قَالَ: مَا قَنَتَ رَسُولُ اللَّهِ ﷺ فِي شَيْءٍ مِنَ الصَّلَوَاتِ إِلَّا فِي الْوِتْرِ",
          translation: "Dari Ibnu Mas'ud: Rasulullah ﷺ tidak qunut di shalat apa pun kecuali witir.",
          notes: "Diriwayatkan Abu Dawud dan selainnya.",
        },
        reasoning: "Riwayat Ibnu Mas'ud yang menolak qunut selain witir dinilai lebih kuat. Qunut nazilah boleh di semua shalat fardhu saat ada musibah besar yang menimpa kaum Muslimin.",
        source: "Al-Mughni (Ibnu Qudamah) · Kasysyaful Qina'",
      },
      {
        scholar: "Imam Malik",
        scholarArabic: "الإمام مالك",
        school: "Malikiyyah",
        position: "Qunut Shubuh disunnahkan secara terus-menerus, dibaca sebelum ruku' di rakaat kedua.",
        evidence: {
          arabic: "عَمَلُ أَهْلِ الْمَدِينَةِ",
          translation: "Amalan penduduk Madinah (yang merupakan hujjah menurut Imam Malik).",
          notes: "Imam Malik menjadikan amal ahlul Madinah sebagai dalil yang kuat.",
        },
        reasoning: "Penduduk Madinah yang mewarisi praktik Nabi secara langsung terus melakukan qunut Shubuh. Ini menunjukkan qunut Shubuh adalah sunnah yang valid.",
        source: "Al-Muwattha' · Al-Mudawwanah · Bidayatul Mujtahid",
      },
      {
        scholar: "Imam Abu Hanifah",
        scholarArabic: "الإمام أبو حنيفة",
        school: "Hanafiyyah",
        position: "Tidak ada qunut dalam shalat Shubuh. Qunut hanya ada dalam shalat witir, dan dawam qunut Shubuh dianggap tidak memiliki dasar yang kuat.",
        evidence: {
          arabic: "لَمْ يَثْبُتْ عِنْدَنَا حَدِيثٌ صَحِيحٌ فِي قُنُوتِ الصُّبْحِ",
          translation: "Tidak ada pada kami hadits yang shahih tentang qunut Shubuh.",
          notes: "Hanafiyyah menilai riwayat qunut Shubuh tidak sampai derajat shahih yang menjadi hujjah.",
        },
        reasoning: "Riwayat yang mendukung qunut Shubuh dinilai lemah atau tidak shahih. Shalat Shubuh tidak berbeda dengan shalat lain yang tidak ada qunutnya.",
        source: "Badai' As-Shanai' · Al-Hidayah (Al-Marginani)",
      },
    ],
    notes: "Khilaf ini adalah contoh klasik perbedaan dalam menilai keshahihan hadits. Syafi'iyyah dan Malikiyyah menilai dawam qunut Shubuh shahih; Hanafiyyah dan Hanabilah menilai sebaliknya. Konsekuensi praktis: makmum yang berbeda madzhab dengan imam biasanya mengikuti imam untuk menjaga persatuan shalat berjamaah.",
  },

  {
    id: "fatihah-makmum",
    title: "Wajibkah Makmum Membaca Al-Fatihah di Belakang Imam?",
    titleArabic: "هل يجب على المأموم قراءة الفاتحة خلف الإمام؟",
    category: "fiqh",
    question: "Apakah makmum wajib membaca Al-Fatihah sendiri di belakang imam, atau cukup mendengarkan bacaan imam (qira'ah imam adalah qira'ah makmum)?",
    views: [
      {
        scholar: "Imam Asy-Syafi'i",
        scholarArabic: "الإمام الشافعي",
        school: "Syafi'iyyah",
        position: "Makmum wajib membaca Al-Fatihah di setiap rakaat, baik shalat jahriyyah maupun sirriyyah. Tidak membaca Al-Fatihah membatalkan shalat.",
        evidence: {
          arabic: "لَا صَلَاةَ لِمَنْ لَمْ يَقْرَأْ بِفَاتِحَةِ الْكِتَابِ",
          translation: "Tidak ada shalat bagi orang yang tidak membaca Al-Fatihah.",
          notes: "HR. Bukhari dan Muslim — berlaku umum untuk imam, makmum, maupun munfarid.",
        },
        reasoning: "Hadits 'tidak ada shalat tanpa Al-Fatihah' bersifat umum mencakup makmum. Makmum wajib membaca sendiri di sela-sela bacaan imam (pada shalat jahriyyah, di saat imam diam).",
        source: "Al-Umm · Mughni Al-Muhtaj",
      },
      {
        scholar: "Imam Abu Hanifah",
        scholarArabic: "الإمام أبو حنيفة",
        school: "Hanafiyyah",
        position: "Makmum tidak boleh membaca Al-Fatihah di belakang imam — qira'ah imam sudah mencukupi makmum. Makmum harus diam dan mendengarkan.",
        evidence: {
          arabic: "وَإِذَا قُرِئَ الْقُرْآنُ فَاسْتَمِعُوا لَهُ وَأَنصِتُوا",
          translation: "Apabila Al-Qur'an dibacakan, maka dengarkanlah dan diamlah. (Al-A'raf: 204)",
          notes: "Ayat ini dinilai Hanafiyyah berlaku saat imam membaca Al-Fatihah dan surat.",
        },
        reasoning: "Perintah mendengarkan dan diam saat Al-Qur'an dibacakan menunjukkan makmum tidak perlu — bahkan tidak boleh — membaca sendiri. Qira'ah imam sudah menggugurkan kewajiban makmum.",
        source: "Al-Hidayah · Badai' As-Shanai'",
      },
      {
        scholar: "Imam Malik",
        scholarArabic: "الإمام مالك",
        school: "Malikiyyah",
        position: "Makmum tidak membaca Al-Fatihah pada shalat jahriyyah (Magrib, Isya, Shubuh). Pada shalat sirriyyah, membaca Al-Fatihah disunnahkan bagi makmum.",
        evidence: {
          arabic: "مَنْ كَانَ لَهُ إِمَامٌ فَقِرَاءَةُ الْإِمَامِ لَهُ قِرَاءَةٌ",
          translation: "Barangsiapa yang memiliki imam, maka qira'ah imam adalah qira'ahnya.",
          notes: "Hadits ini dijadikan dalil utama Malikiyyah dan Hanafiyyah.",
        },
        reasoning: "Pada shalat jahriyyah, makmum mendengarkan bacaan imam sudah cukup. Pada shalat sirriyyah di mana imam tidak didengar, makmum disunnahkan membaca sendiri.",
        source: "Al-Muwattha' · Al-Mudawwanah",
      },
      {
        scholar: "Imam Ahmad bin Hanbal",
        scholarArabic: "الإمام أحمد بن حنبل",
        school: "Hanabilah",
        position: "Makmum membaca Al-Fatihah pada shalat sirriyyah (wajib atau sunnah menurut riwayat). Pada shalat jahriyyah, tidak membaca saat imam sedang membaca.",
        evidence: {
          arabic: "لَا صَلَاةَ لِمَنْ لَمْ يَقْرَأْ بِفَاتِحَةِ الْكِتَابِ",
          translation: "Tidak ada shalat bagi yang tidak membaca Al-Fatihah.",
          notes: "Dipadukan dengan hadits 'qira'ah imam adalah qira'ah makmum'.",
        },
        reasoning: "Dua hadits dipadukan: hadits Al-Fatihah wajib berlaku umum, tapi hadits 'qira'ah imam adalah qira'ahnya' mengkhususkan pada shalat jahriyyah saat imam didengar.",
        source: "Al-Mughni · Al-Inshaaf",
      },
    ],
    notes: "Ini salah satu khilaf yang paling sering dihadapi Masisir saat shalat berjamaah di Mesir. Praktik di masjid-masjid Al-Azhar umumnya mengikuti madzhab Syafi'i (makmum membaca Al-Fatihah di sela-sela bacaan imam). Akar perbedaan: cara memahami dan mengompromikan dua hadits yang tampak bertentangan.",
  },

  {
    id: "amr-wujub",
    title: "Apakah Perintah Mutlak (Amr) Menunjukkan Wajib?",
    titleArabic: "هل الأمر المطلق يفيد الوجوب؟",
    category: "ushul",
    question: "Apakah lafal perintah (amr) dalam Al-Qur'an dan Sunnah — seperti 'aqiimush shalah' — secara asalnya menunjukkan wajib, sunnah, atau tergantung konteks?",
    views: [
      {
        scholar: "Jumhur Ushuliyyin",
        scholarArabic: "جمهور الأصوليين",
        school: "Mayoritas Ulama Ushul (Syafi'i, Maliki, Hanbali)",
        position: "Amr mutlak secara asal menunjukkan wajib (iltizam), kecuali ada qarinah (indikator) yang memalingkannya ke sunnah atau mubah.",
        evidence: {
          arabic: "فَلْيَحْذَرِ الَّذِينَ يُخَالِفُونَ عَنْ أَمْرِهِ أَنْ تُصِيبَهُمْ فِتْنَةٌ",
          translation: "Maka hendaklah orang-orang yang menyalahi perintah-Nya takut akan ditimpa fitnah. (An-Nur: 63)",
          notes: "Ayat ini menunjukkan bahaya melanggar amr — konsekuensi ini hanya tepat jika amr itu wajib.",
        },
        reasoning: "Syariat menetapkan ancaman bagi yang menyelisihi perintah Allah. Ini menunjukkan amr secara asal bermakna wajib. Selain itu, secara bahasa Arab, amr digunakan untuk hal yang menuntut pemenuhan (al-iltizam).",
        source: "Al-Mustashfa (Al-Ghazali) · Al-Waraqat · Jam'ul Jawami'",
      },
      {
        scholar: "Sebagian Hanafiyyah",
        scholarArabic: "بعض الحنفية",
        school: "Sebagian ulama Hanafiyyah",
        position: "Amr mutlak menunjukkan wajib dan sunnah sekaligus (al-wujub wan nadb ma'an), tidak bisa dipastikan salah satunya tanpa qarinah.",
        evidence: {
          arabic: "الْأَمْرُ مُشْتَرَكٌ بَيْنَ الْوُجُوبِ وَالنَّدْبِ",
          translation: "Amr adalah musytarak (memiliki banyak makna) antara wajib dan sunnah.",
          notes: "Berdasarkan penggunaan amr di berbagai nash yang maknanya berbeda-beda.",
        },
        reasoning: "Amr digunakan dalam nash untuk perkara wajib (shalat, zakat) maupun sunnah (berwudu sebelum tidur). Penggunaan yang berbeda ini menunjukkan amr tidak memiliki satu makna pasti.",
        source: "Ushul As-Sarakhsi · Kasyful Asrar",
      },
      {
        scholar: "Al-Mu'tazilah & sebagian ulama",
        scholarArabic: "المعتزلة وبعض العلماء",
        school: "Al-Mu'tazilah",
        position: "Amr mutlak secara asal menunjukkan sunnah (nadb), bukan wajib. Wajib butuh qarinah tambahan.",
        evidence: {
          arabic: "فَإِذَا قُضِيَتِ الصَّلَاةُ فَانتَشِرُوا فِي الْأَرْضِ",
          translation: "Apabila shalat selesai, bertebaranlah di muka bumi. (Al-Jumu'ah: 10)",
          notes: "Perintah 'bertebaranlah' setelah shalat Jumat — ini bukan wajib, menunjukkan amr tidak selalu berarti wajib.",
        },
        reasoning: "Banyak amr dalam Qur'an yang disepakati tidak wajib. Ini menunjukkan amr secara asal bermakna permintaan umum, bukan keharusan.",
        source: "Pendapat dinukil dalam Al-Mustashfa dan Al-Mahshul",
      },
    ],
    notes: "Khilaf ini memiliki dampak besar dalam istinbat hukum fiqh. Bagi Jumhur yang menyatakan amr = wajib, ketika ada perintah tanpa qarinah, mereka langsung menetapkan wajib. Bagi yang menyatakan amr = sunnah, dibutuhkan qarinah tambahan untuk menetapkan wajib. Masalah ini dibahas di awal-awal kitab Ushul Fiqh.",
  },

  {
    id: "iman-ziyadah-nuqshan",
    title: "Apakah Iman Bertambah dan Berkurang?",
    titleArabic: "هل الإيمان يزيد وينقص؟",
    category: "aqidah",
    question: "Apakah iman orang mukmin dapat bertambah dengan ketaatan dan berkurang dengan kemaksiatan, atau iman itu satu dan tidak terbagi-bagi?",
    views: [
      {
        scholar: "Ahlus Sunnah (Salafiyyun & Ahlul Hadits)",
        scholarArabic: "أهل السنة والجماعة من السلف",
        school: "Salaf / Ahlus Sunnah",
        position: "Iman adalah i'tiqad (keyakinan), qawl (ucapan), dan 'amal (perbuatan). Iman bertambah dengan ketaatan dan berkurang dengan kemaksiatan.",
        evidence: {
          arabic: "وَإِذَا تُلِيَتْ عَلَيْهِمْ آيَاتُهُ زَادَتْهُمْ إِيمَانًا",
          translation: "Dan apabila dibacakan ayat-ayat-Nya kepada mereka, bertambahlah iman mereka. (Al-Anfal: 2)",
          notes: "Banyak ayat Al-Qur'an yang menyebut ziyadah (pertambahan) iman.",
        },
        reasoning: "Al-Qur'an secara eksplisit menyebut iman bisa bertambah. Ini hanya mungkin jika iman itu tersusun dari komponen yang bisa meningkat dan menurun — yaitu amal perbuatan.",
        source: "Kitab Al-Iman (Ibnu Taimiyyah) · Syarh Ushul I'tiqad Ahlus Sunnah",
      },
      {
        scholar: "Asy'ariyyah",
        scholarArabic: "الأشاعرة",
        school: "Asy'ariyyah",
        position: "Iman adalah tashdiq (pembenaran hati) yang tidak bertambah dan berkurang. Yang bertambah adalah tsumar al-iman (buah iman) berupa ketaatan, bukan iman itu sendiri.",
        evidence: {
          arabic: "فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ",
          translation: "Barangsiapa mengerjakan kebaikan seberat dzarrah pun, niscaya dia akan melihat balasannya. (Az-Zalzalah: 7)",
          notes: "Ayat tentang amal terpisah dari definisi iman.",
        },
        reasoning: "Tashdiq adalah perbuatan hati yang tidak terbagi-bagi — seseorang membenarkan atau tidak. Amal adalah buah dari iman, bukan bagian dari hakikat iman itu sendiri. Pertambahan yang disebut Qur'an adalah pertambahan pada amal dan kekuatan keyakinan, bukan pada hakikat tashdiq.",
        source: "Ummul Barahin · Syarh Al-Mawaqif",
      },
      {
        scholar: "Maturidiyyah",
        scholarArabic: "الماتريدية",
        school: "Maturidiyyah",
        position: "Serupa dengan Asy'ariyyah — iman adalah tashdiq yang tidak bertambah berkurang dalam hakikatnya, tapi kualitasnya (nuur dan yaqin) bisa berbeda-beda antar individu.",
        evidence: {
          arabic: "الإِيمَانُ هُوَ التَّصْدِيقُ بِالْقَلْبِ",
          translation: "Iman adalah pembenaran dengan hati.",
          notes: "Definisi iman versi Maturidiyyah.",
        },
        reasoning: "Hakikat tashdiq tidak bertambah berkurang karena ia bersifat ada atau tidak ada. Namun cahaya (nuur) dan kemantapan (yaqin) iman bisa berbeda antar mukmin.",
        source: "Al-'Aqidah Al-Maturidiyyah",
      },
      {
        scholar: "Murji'ah",
        scholarArabic: "المرجئة",
        school: "Murji'ah",
        position: "Iman adalah tashdiq hati saja. Amal bukan bagian dari iman. Iman seluruh mukmin sama rata — tidak ada yang lebih tinggi atau lebih rendah.",
        evidence: {
          arabic: "",
          translation: "",
          notes: "Ini pendapat yang dinilai menyimpang oleh Jumhur — disebutkan untuk memahami konteks khilaf.",
        },
        reasoning: "Karena amal bukan bagian iman, iman tidak bisa bertambah atau berkurang. Pelaku dosa besar tetap mukmin sempurna.",
        source: "Disebutkan dalam Maqalatul Islamiyyin (Al-Asy'ari) sebagai pendapat yang dikritik.",
      },
    ],
    notes: "Ini salah satu tema sentral dalam ilmu kalam. Perbedaan antara Salaf/Ahlul Hadits dengan Asy'ariyyah terletak pada apakah 'amal masuk dalam definisi iman atau tidak. Al-Azhar secara umum mengikuti Asy'ariyyah. Penting untuk Masisir memahami posisi masing-masing tanpa mudah men-tabdi' atau men-takfir.",
  },

  {
    id: "hadits-ahad-aqidah",
    title: "Apakah Hadits Ahad Jadi Hujjah dalam Masalah Aqidah?",
    titleArabic: "هل خبر الآحاد حجة في العقائد؟",
    category: "hadits",
    question: "Apakah hadits ahad (yang tidak mencapai derajat mutawatir) dapat dijadikan hujjah untuk menetapkan masalah-masalah aqidah, ataukah aqidah hanya boleh dibangun di atas dalil yang qath'i (mutawatir)?",
    views: [
      {
        scholar: "Jumhur Ahlus Sunnah (Salaf & Ahlul Hadits)",
        scholarArabic: "جمهور أهل السنة",
        school: "Mayoritas Ahlus Sunnah",
        position: "Hadits ahad yang shahih adalah hujjah dalam aqidah maupun fiqh — wajib diterima dan diamalkan.",
        evidence: {
          arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا إِنْ جَاءَكُمْ فَاسِقٌ بِنَبَإٍ فَتَبَيَّنُوا",
          translation: "Hai orang-orang beriman, jika datang kepadamu orang fasik membawa berita, periksalah. (Al-Hujurat: 6)",
          notes: "Ayat ini menyuruh tabayun — implisinya, kalau yang membawa bukan fasik (yaitu perawi tsiqah), beritanya bisa diterima.",
        },
        reasoning: "Nabi ﷺ mengirim utusan satu orang untuk mengajarkan syahadat dan rukun iman ke berbagai daerah. Ini menunjukkan satu orang perawi cukup untuk menyampaikan perkara aqidah.",
        source: "Mukhtashar Ash-Shawa'iq Al-Mursalah (Ibnu Al-Qayyim) · Syarah Aqidah Thahawiyyah",
      },
      {
        scholar: "Asy'ariyyah & Maturidiyyah",
        scholarArabic: "الأشاعرة والماتريدية",
        school: "Asy'ariyyah & Maturidiyyah",
        position: "Hadits ahad menghasilkan dzann (dugaan kuat), bukan yaqin. Aqidah harus dibangun di atas yang qath'i (pasti). Hadits ahad tidak cukup untuk menetapkan aqidah secara mandiri.",
        evidence: {
          arabic: "إِنَّ الظَّنَّ لَا يُغْنِي مِنَ الْحَقِّ شَيْئًا",
          translation: "Sesungguhnya persangkaan tidak berguna sedikitpun dari kebenaran. (Yunus: 36)",
          notes: "Aqidah adalah masalah keyakinan — harus qath'i, bukan dzanni.",
        },
        reasoning: "Aqidah melibatkan keyakinan pasti (yaqin). Hadits ahad hanya menghasilkan dzann (kemungkinan besar). Karena itu hadits ahad tidak cukup berdiri sendiri untuk menetapkan keyakinan aqidah, meski tetap diamalkan.",
        source: "Al-Iqtisad fil I'tiqad (Al-Ghazali) · Syarh Al-Mawaqif",
      },
      {
        scholar: "Mu'tazilah",
        scholarArabic: "المعتزلة",
        school: "Mu'tazilah",
        position: "Hadits ahad sama sekali tidak menjadi hujjah dalam aqidah. Aqidah hanya boleh dari Qur'an, hadits mutawatir, dan akal.",
        evidence: {
          arabic: "",
          translation: "",
          notes: "Posisi Mu'tazilah yang lebih ekstrem dari Asy'ariyyah — disebutkan untuk konteks perbandingan.",
        },
        reasoning: "Aqidah adalah fondasi agama yang tidak boleh dibangun di atas sesuatu yang masih memungkinkan kesalahan.",
        source: "Disebutkan dalam kitab-kitab perbandingan kalam.",
      },
    ],
    notes: "Ini khilaf metodologis yang sangat penting, terutama dalam perdebatan antara manhaj Salaf dan manhaj Asy'ariyyah/Maturidiyyah. Dampak praktisnya terlihat pada masalah-masalah seperti azab kubur, sifat Allah yang datang dari hadits ahad, dan lainnya. Masisir yang belajar di Al-Azhar akan sering menemui pembahasan ini dalam kitab Ushul dan Kalam.",
  },

  {
    id: "shalat-beda-madzhab",
    title: "Shalat di Belakang Imam yang Berbeda Madzhab",
    titleArabic: "الصلاة خلف الإمام المخالف في المذهب",
    category: "fiqh",
    question: "Sahkah shalat seseorang di belakang imam yang berbeda madzhab — misalnya makmum Syafi'i di belakang imam Maliki atau Hanafi?",
    views: [
      {
        scholar: "Imam Asy-Syafi'i (pendapat masyhur)",
        scholarArabic: "الإمام الشافعي",
        school: "Syafi'iyyah",
        position: "Sah shalat di belakang imam madzhab lain selama imam melakukan hal yang dianggap sah menurut madzhabnya sendiri, meskipun tidak sah menurut madzhab makmum.",
        evidence: {
          arabic: "وَإِذَا صَلَّيْتُمْ فَأَقِيمُوا الصُّفُوفَ وَلْيَؤُمَّكُمْ أَكْبَرُكُمْ",
          translation: "Apabila kamu shalat, luruskanlah shaf dan hendaklah yang mengimami adalah yang paling tua.",
          notes: "Tidak ada syarat kesamaan madzhab antara imam dan makmum.",
        },
        reasoning: "Para sahabat shalat bersama tanpa mempertanyakan detail fiqh masing-masing. Perbedaan madzhab tidak menghalangi keabsahan shalat berjamaah.",
        source: "Al-Umm · Al-Majmu' (An-Nawawi)",
      },
      {
        scholar: "Sebagian Syafi'iyyah (pendapat wajhain)",
        scholarArabic: "بعض الشافعية",
        school: "Sebagian ulama Syafi'iyyah",
        position: "Tidak sah shalat di belakang imam yang melakukan sesuatu yang menurut madzhab makmum membatalkan shalat — misalnya imam Maliki yang tidak membaca basmalah dengan jahr.",
        evidence: {
          arabic: "شَرْطُ الِاقْتِدَاءِ أَنْ لَا يَعْلَمَ الْمَأْمُومُ بُطْلَانَ صَلَاةِ الْإِمَامِ",
          translation: "Syarat bermakmum adalah makmum tidak mengetahui batalnya shalat imam.",
          notes: "Kaidah Syafi'iyyah dalam imamat.",
        },
        reasoning: "Jika makmum yakin imam melakukan sesuatu yang membatalkan shalat (menurut madzhabnya), mengikuti imam tersebut menjadi masalah.",
        source: "Raudhatut Thalibin · Fathul Wahhab",
      },
      {
        scholar: "Imam Malik & Imam Ahmad",
        scholarArabic: "الإمام مالك والإمام أحمد",
        school: "Malikiyyah & Hanabilah",
        position: "Sah bermakmum kepada imam madzhab lain secara mutlak. Perbedaan madzhab tidak menjadi penghalang.",
        evidence: {
          arabic: "كَانَ الصَّحَابَةُ يُصَلُّونَ خَلْفَ بَعْضِهِمْ دُونَ إِنْكَارٍ",
          translation: "Para sahabat shalat di belakang satu sama lain tanpa pengingkaran.",
          notes: "Praktik sahabat yang terus-menerus shalat berjamaah tanpa mempertanyakan perbedaan amalan.",
        },
        reasoning: "Shalat berjamaah lebih didahulukan dari pada kekhawatiran perbedaan madzhab. Para sahabat tidak memisahkan shaf berdasarkan perbedaan fiqh.",
        source: "Al-Mughni · Bidayatul Mujtahid",
      },
      {
        scholar: "Imam Abu Hanifah",
        scholarArabic: "الإمام أبو حنيفة",
        school: "Hanafiyyah",
        position: "Sah bermakmum kepada imam madzhab lain selama imam memenuhi syarat keislaman dan tidak melakukan sesuatu yang membatalkan shalat menurut ijma'.",
        evidence: {
          arabic: "الْمُسْلِمُونَ خَلْفَ كُلِّ بَرٍّ وَفَاجِرٍ",
          translation: "Kaum Muslimin boleh shalat di belakang setiap orang yang baik maupun yang buruk.",
          notes: "Hadits ini menunjukkan keluasan dalam masalah imam.",
        },
        reasoning: "Keabsahan shalat berjamaah tidak bergantung pada kesamaan madzhab, selama imam Muslim dan shalatnya sah.",
        source: "Al-Hidayah · Badai' As-Shanai'",
      },
    ],
    notes: "Ini masalah yang sangat relevan untuk Masisir di Mesir — di mana satu masjid bisa diimami oleh ulama berbagai madzhab. Jumhur ulama menyatakan sah bermakmum kepada imam madzhab lain. Yang menjadi khilaf lebih detail adalah apakah makmum perlu 'mengulang' shalatnya jika tertentu bahwa imam melakukan hal yang membatalkan menurut madzhabnya. Al-Azhar dan ulama Mesir pada umumnya berpandangan sah dan tidak perlu diulang.",
  }
];

/* Storage helpers */
const loadCustomMuqaranah = () => {
  try {
    const raw = localStorage.getItem("madad_muqaranah_custom");
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
};

const saveCustomMuqaranah = (data) => {
  localStorage.setItem("madad_muqaranah_custom", JSON.stringify(data));
  if (Array.isArray(data)) data.forEach(m => sbSaveMuqaranah(m).catch(() => {}));
};

window.MUQARANAH_LIBRARY = MUQARANAH_LIBRARY;
window.loadCustomMuqaranah = loadCustomMuqaranah;
window.saveCustomMuqaranah = saveCustomMuqaranah;
