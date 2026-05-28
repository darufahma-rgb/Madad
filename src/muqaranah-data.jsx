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
};

window.MUQARANAH_LIBRARY = MUQARANAH_LIBRARY;
window.loadCustomMuqaranah = loadCustomMuqaranah;
window.saveCustomMuqaranah = saveCustomMuqaranah;
