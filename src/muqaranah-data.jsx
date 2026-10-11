import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
/* Talqih, Muqaranah Library Seed Data (22 entries) */

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
    notes: "Akar perbedaan terletak pada status Basmalah: apakah ia ayat pertama dari setiap surat (Syafi'i, sebagian Hanbali), ayat tersendiri sebagai pembatas (Hanafi), atau bukan ayat surat sama sekali (Maliki). Konsekuensi paling nyata adalah ketika makmum Syafi'i shalat di belakang imam Maliki yang tidak membaca Basmalah, dalam hal ini para ulama sepakat bahwa shalat tetap sah karena perbedaan ini adalah khilaf mu'tabar.",
    rangkuman: "Basmalah itu dibaca atau tidak dalam shalat? Jawabannya tergantung madzhabmu. Syafi'i: wajib dibaca dan dikeraskan. Hanbali: dibaca tapi pelan. Hanafi: dibaca pelan, bukan bagian Al-Fatihah. Maliki: tidak perlu dibaca sama sekali. Intinya — semua sah, tidak ada yang salah. Kalau kamu makmum di belakang imam madzhab lain, shalatmu tetap sah.",
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
    notes: "Perbedaan ini berpangkal pada dua hal: (1) cara memahami qira'at ayat wudhu, nasb atau jar, dan (2) sejauh mana rukhshah dapat diterima atau bahkan diwajibkan. Untuk mahasiswa Masisir di Cairo dengan musim dingin yang menusuk, masalah ini sangat praktis. Para fuqaha kontemporer umumnya menggunakan pendapat Syafi'i atau Hanbali yang mensyaratkan kondisi lengkap.",
    rangkuman: "Bolehkah mengusap sepatu saat wudhu tanpa melepasnya? Boleh — semua madzhab sepakat ini rukhshah yang sah. Bedanya hanya di syarat dan batas waktu: Syafi'i dan Hanbali: 1 hari untuk mukim, 3 hari untuk musafir. Hanafi: sama, tapi syaratnya lebih longgar. Maliki: tidak ada batas waktu selama tidak batal. Praktisnya: kalau kamu pakai sepatu saat sudah berwudhu, kamu boleh mengusapnya saat wudhu berikutnya.",
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
    notes: "Perdebatan ini lebih dari sekedar teori, ia berdampak langsung pada berapa banyak masalah yang dianggap 'tertutup' dan tidak boleh dikaji ulang. Jumhur menetapkan banyak masalah sebagai ijma' yang tidak boleh diingkari. Ibnu Hazm sangat membatasi ruang lingkup ijma'. Pendapat An-Nazzham tidak diterima umat Islam secara umum dan disebutkan di sini sebagai catatan sejarah.",
    rangkuman: "Kalau semua ulama sepakat tentang sesuatu (ijma'), apakah itu jadi hukum yang wajib diikuti? Mayoritas ulama: ya, ijma' adalah dalil hukum yang mengikat. Bedanya hanya di definisi 'semua ulama' — siapa yang dihitung? Ulama masa sahabat saja? Atau semua zaman? Ini diskusi akademik yang tidak berdampak langsung ke ibadah sehari-hari, tapi penting dipahami untuk memahami kenapa ulama kadang berbeda pendapat.",
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
    notes: "Perbedaan ini berdampak luas: ratusan hukum fiqh yang bertumpu pada hadits mursal menjadi valid atau tidak valid tergantung posisi mana yang dianut. Imam Syafi'i yang paling ketat justru memberikan kontribusi terbesar dalam menstrukturkan ilmu hadits. Mahasiswa Syariah dan Hadits di Al-Azhar perlu memahami ini sebagai fondasi metodologi ijtihad.",
    rangkuman: "Hadits mursal adalah hadits yang sanadnya terputus — perawi dari generasi tabi'in langsung meriwayatkan dari Nabi ﷺ tanpa menyebut sahabat perantaranya. Bolehkah dijadikan dalil? Syafi'i: tidak boleh kecuali ada penguat lain. Maliki dan Hanafi: boleh, bahkan cukup kuat. Hanbali: boleh dengan syarat. Dalam praktiknya, ini memengaruhi kenapa beberapa hukum fiqh berbeda antar madzhab — karena mereka berbeda dalam menerima atau menolak jenis hadits ini.",
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
    notes: "Ini adalah salah satu topik paling fundamental dalam ilmu kalam dan aqidah. Pemahaman yang jernih tentang perbedaan ini mencegah dua ekstrem yang berbahaya: Khawarij yang mengkafirkan pelaku dosa besar, dan Murji'ah yang menganggap amal tidak berdampak pada iman. Posisi Ahlus Sunnah adalah jalan tengah: amal merupakan bagian dari hakikat iman, pelaku dosa besar tidak kafir tapi imannya berkurang.",
    rangkuman: "Iman itu apa saja komponennya? Semua sepakat: iman itu keyakinan dalam hati. Bedanya di lisan dan perbuatan — apakah keduanya bagian dari iman atau hanya buahnya? Ahlus Sunnah (Syafi'i, Maliki, Hanbali): iman mencakup hati, lisan, dan perbuatan — bisa bertambah dan berkurang. Hanafi (Maturidiyah): iman hanya di hati dan lisan, perbuatan adalah buahnya — tidak bertambah/berkurang di inti. Perbedaan ini lebih ke akademik — tidak memengaruhi ibadah harian.",
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
    notes: "Perdebatan ini sangat relevan untuk kehidupan harian Masisir, banyak amalan dan dzikir yang beredar dalam group WhatsApp berbasis hadits dha'if. Posisi yang bijaksana: ikuti tiga syarat Ibnu Hajar, tapi jangan menyebarkannya kepada orang lain tanpa menyebut statusnya. Jangan langsung mengkritik orang yang mengamalkannya, tapi juga jangan menjadikan hadits dha'if sebagai landasan hukum yang kuat.",
    rangkuman: "Bolehkah pakai hadits lemah (dha'if) untuk amalan keutamaan seperti dzikir atau doa tertentu? Ini khilaf nyata: Sebagian ulama (termasuk Imam Ahmad): boleh, asal tidak terlalu lemah dan bukan untuk hukum wajib/haram. Sebagian lain (Ibnu Hazm, dll): tidak boleh sama sekali — hadits dha'if tetap dha'if. Mayoritas ulama klasik mengambil jalan tengah: boleh untuk fadhail, bukan untuk hukum. Jadi amalan-amalan populer yang bersumber dari hadits dha'if — itu perdebatan nyata. Posisi aman: jangan jadikan dalil hukum wajib/haram, tapi jangan langsung menolak orang yang mengamalkannya.",
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
    rangkuman: "Doa qunut setelah ruku' di shalat Shubuh — sunnah atau bid'ah? Syafi'i: sunnah yang dianjurkan setiap Shubuh. Maliki: sunnah tapi sebelum ruku'. Hanafi: tidak disunnahkan di Shubuh, hanya saat ada bencana (nazilah). Hanbali: tidak sunnah di Shubuh. Jadi kalau kamu Syafi'i dan imam tidak qunut — atau sebaliknya — itu bukan masalah, keduanya berdalil kuat. Tidak perlu protes atau risih.",
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
    rangkuman: "Wajibkah makmum baca Al-Fatihah sendiri di belakang imam? Syafi'i: wajib dibaca makmum, selalu. Hanafi: tidak perlu, imam sudah mewakili. Maliki: tidak wajib, cukup diam dan dengarkan imam. Hanbali: wajib saat imam baca pelan (sirr), tidak wajib saat keras (jahr). Praktisnya: kalau kamu Syafi'i, tetap baca Fatihah. Kalau kamu Hanafi, cukup diam. Keduanya sah.",
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
    rangkuman: "Kalau Al-Qur'an atau hadits pakai kata perintah (seperti 'lakukanlah' atau 'wajib atas kalian') — apakah itu otomatis berarti wajib? Jumhur ulama ushul: ya, perintah tanpa qarinah (konteks) berarti wajib. Sebagian ulama: belum tentu, perlu dilihat konteksnya. Ini penting karena dari perbedaan prinsip ini, lahir perbedaan hukum fiqh — sesuatu yang satu ulama anggap wajib, ulama lain anggap sunnah.",
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
    rangkuman: "Apakah iman bisa naik dan turun? Ahlus Sunnah (Syafi'i, Maliki, Hanbali): ya, iman bertambah dengan taat dan berkurang dengan maksiat. Ini yang jadi dasar motivasi untuk terus beramal. Hanafi (sebagian): iman di hati tidak bertambah/berkurang, tapi buahnya (amal) yang berubah. Dalam praktik, perbedaan ini tidak mengubah kewajiban amal — semua tetap diwajibkan beribadah dan menjauhi maksiat.",
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
    rangkuman: "Bolehkah hadits yang hanya diriwayatkan sedikit perawi (hadits ahad) dijadikan dasar aqidah/keyakinan? Ini khilaf penting: Jumhur (termasuk Syafi'i, Hanbali): boleh, kalau shahih bisa jadi dalil aqidah. Sebagian Hanafi dan Mu'tazilah: tidak cukup untuk aqidah — butuh dalil yang mutawatir (sangat banyak perawi). Implikasinya nyata: beberapa keyakinan tentang azab kubur, syafaat, dll — diterima sebagian madzhab tapi dipermasalahkan madzhab lain.",
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
    rangkuman: "Sahkah shalat di belakang imam yang berbeda madzhab? Misalnya, makmum Syafi'i shalat di belakang imam Hanafi yang tidak baca Fatihah sendiri, atau imam Maliki yang tidak qunut. Jawaban jumhur: sah. Perbedaan madzhab dalam fiqh shalat tidak membatalkan shalat berjamaah — ini sudah menjadi kesepakatan ulama sejak lama. Di Masjidil Haram, imam bermazhab Hanbali tapi jutaan jamaah dari semua madzhab — itu sudah jadi bukti nyata.",
  },

  {
    id: "lams-marah",
    title: "Menyentuh Lawan Jenis: Membatalkan Wudhu atau Tidak?",
    titleArabic: "نَقْضُ الْوُضُوءِ بِلَمْسِ الْمَرْأَةِ",
    category: "fiqh",
    question: "Apakah bersentuhan kulit antara laki-laki dan perempuan membatalkan wudhu? Apakah ada bedanya antara sentuhan biasa dan sentuhan dengan syahwat, serta antara mahram dan bukan mahram?",
    views: [
      {
        scholar: "Imam Asy-Syafi'i",
        scholarArabic: "الإمامُ الشَّافِعِيُّ",
        school: "Syafi'iyah",
        position: "Batal secara mutlak, dengan atau tanpa syahwat, bila kulit laki-laki dan perempuan yang bukan mahram bersentuhan langsung tanpa penghalang dan keduanya sudah mencapai usia yang lazimnya menimbulkan syahwat. Menyentuh mahram tidak membatalkan menurut pendapat yang azhar.",
        evidence: {
          arabic: "أَوْ لَامَسْتُمُ النِّسَاءَ فَلَمْ تَجِدُوا مَاءً فَتَيَمَّمُوا صَعِيدًا طَيِّبًا",
          translation: "Atau kamu telah menyentuh perempuan, lalu kamu tidak mendapatkan air, maka bertayammumlah dengan tanah yang baik. (An-Nisa': 43)",
          notes: "Dalam qira'ah Hamzah dan Al-Kisa'i dibaca 'lamastum' (kamu menyentuh), yang lebih jelas menunjuk sentuhan fisik."
        },
        reasoning: "Lafazh lams secara hakikat bermakna sentuhan dengan kulit. Asalnya, lafazh dibawa ke makna hakiki dan tidak dialihkan ke makna kiasan (jima') kecuali ada dalil. Ayat ini menyebut lams berdampingan dengan buang hajat sebagai sebab wajibnya bersuci, maka sentuhan itu sendiri adalah hadats, tanpa disyaratkan syahwat. Diperkuat atsar Ibnu Umar dan Ibnu Mas'ud yang menafsirkan lams dengan sentuhan tangan.",
        source: "Al-Umm · Al-Majmu' · Mughni Al-Muhtaj"
      },
      {
        scholar: "Imam Abu Hanifah",
        scholarArabic: "الإمامُ أبو حنيفةَ",
        school: "Hanafiyah",
        position: "Menyentuh perempuan tidak membatalkan wudhu sama sekali, baik dengan syahwat maupun tidak. Yang membatalkan hanyalah mubasyarah fahisyah (bersentuhan kemaluan tanpa penghalang) menurut Abu Hanifah dan Abu Yusuf.",
        evidence: {
          arabic: "عَنْ عَائِشَةَ قَالَتْ: فَقَدْتُ رَسُولَ اللَّهِ ﷺ لَيْلَةً مِنَ الْفِرَاشِ فَالْتَمَسْتُهُ، فَوَقَعَتْ يَدِي عَلَى بَطْنِ قَدَمَيْهِ وَهُوَ فِي الْمَسْجِدِ وَهُمَا مَنْصُوبَتَانِ",
          translation: "Dari Aisyah: 'Suatu malam aku kehilangan Rasulullah ﷺ dari tempat tidur, lalu aku mencarinya. Tanganku menyentuh telapak kakinya ketika beliau sedang sujud dengan kedua kaki tegak.' (HR. Muslim)",
          notes: "Nabi ﷺ tetap melanjutkan sujudnya setelah disentuh, tanpa memperbarui wudhu."
        },
        reasoning: "Ibnu Abbas, penafsir Al-Qur'an dari kalangan sahabat, menafsirkan mulamasah dalam ayat sebagai kinayah dari jima', sebagaimana Al-Qur'an memakai bahasa sopan untuk hubungan suami istri. Hadits-hadits sahih menunjukkan Nabi ﷺ bersentuhan dengan istrinya saat shalat tanpa batal. Selain itu, sentuhan sangat sering terjadi (umum al-balwa); kalau membatalkan, tentu Nabi ﷺ menjelaskannya secara tegas.",
        source: "Al-Mabsuth · Bada'i' Ash-Shana'i' · Radd Al-Muhtar"
      },
      {
        scholar: "Imam Malik",
        scholarArabic: "الإمامُ مالكٌ",
        school: "Malikiyah",
        position: "Batal bila menyentuh dengan maksud mencari kenikmatan (qashd al-ladzdzah) atau ia mendapatkan kenikmatan itu, meskipun ada penghalang yang tipis. Sentuhan tanpa maksud dan tanpa rasa nikmat tidak membatalkan.",
        evidence: {
          arabic: "عَنْ عَبْدِ اللَّهِ بْنِ عُمَرَ أَنَّهُ كَانَ يَقُولُ: قُبْلَةُ الرَّجُلِ امْرَأَتَهُ وَجَسُّهَا بِيَدِهِ مِنَ الْمُلَامَسَةِ، فَمَنْ قَبَّلَ امْرَأَتَهُ أَوْ جَسَّهَا بِيَدِهِ فَعَلَيْهِ الْوُضُوءُ",
          translation: "Dari Abdullah bin Umar, ia berkata: 'Ciuman seorang laki-laki kepada istrinya dan sentuhan tangannya termasuk mulamasah. Siapa yang mencium istrinya atau menyentuhnya dengan tangan, wajib berwudhu.' (Al-Muwaththa')",
          notes: "Imam Malik menggabungkan atsar ini dengan hadits-hadits Aisyah."
        },
        reasoning: "Ayat menunjukkan lams sebagai pembatal, sementara hadits Aisyah menunjukkan sentuhan Nabi ﷺ tidak membatalkan. Keduanya dikompromikan: yang membatalkan adalah sentuhan yang disertai syahwat, karena itulah yang menjadi dugaan kuat (mazhinnah) keluarnya madzi. Sentuhan biasa seperti dalam hadits Aisyah tidak membatalkan.",
        source: "Al-Mudawwanah · Asy-Syarh Al-Kabir (Ad-Dardir) · Hasyiyah Ad-Dasuqi"
      },
      {
        scholar: "Imam Ahmad bin Hanbal",
        scholarArabic: "الإمامُ أحمدُ بنُ حنبلٍ",
        school: "Hanabilah",
        position: "Menurut pendapat yang mu'tamad, batal bila sentuhan kulit tanpa penghalang disertai syahwat. Tanpa syahwat tidak membatalkan.",
        evidence: {
          arabic: "عَنْ عَائِشَةَ قَالَتْ: كُنْتُ أَنَامُ بَيْنَ يَدَيْ رَسُولِ اللَّهِ ﷺ وَرِجْلَايَ فِي قِبْلَتِهِ، فَإِذَا سَجَدَ غَمَزَنِي فَقَبَضْتُ رِجْلَيَّ",
          translation: "Dari Aisyah: 'Aku pernah tidur di depan Rasulullah ﷺ dengan kedua kakiku di arah kiblatnya. Bila beliau sujud, beliau menyentuhku, lalu aku menarik kedua kakiku.' (Muttafaqun 'alaih)",
          notes: "Sentuhan Nabi ﷺ di tengah shalat ini tanpa syahwat, dan shalat beliau tidak batal."
        },
        reasoning: "Hadits ini menunjukkan sentuhan tanpa syahwat tidak membatalkan. Adapun ayat lams dibawa ke sentuhan yang disertai syahwat, sehingga semua dalil dapat diamalkan. Ini sejalan dengan kaidah bahwa mengamalkan dua dalil lebih utama daripada meninggalkan salah satunya.",
        source: "Al-Mughni · Al-Inshaf · Kasysyaf Al-Qina'"
      }
    ],
    notes: "Akar khilafnya ada pada makna lams dalam ayat: hakikat sentuhan (Syafi'iyah) atau kinayah dari jima' (Hanafiyah), lalu bagaimana mengompromikannya dengan hadits Aisyah (Malikiyah dan Hanabilah). Masalah ini sangat terasa bagi Masisir: di bus, metro, dan antrean, sentuhan sulit dihindari. Sebagian ulama Syafi'iyah membolehkan bertaqlid kepada madzhab lain dalam kondisi sulit, dengan memperhatikan syarat-syarat taqlid yang dibahas dalam ushul fiqh.",
    rangkuman: "Bersentuhan kulit dengan lawan jenis, batal wudhu atau tidak? Syafi'i: batal, walau tidak sengaja dan tanpa syahwat (kecuali mahram). Hanafi: tidak batal sama sekali. Maliki dan Hanbali: batal hanya kalau disertai syahwat. Jadi kalau kamu bermadzhab Syafi'i, hati-hati di tempat ramai. Kalau sulit dihindari, sebagian ulama membolehkan mengikuti pendapat madzhab lain dengan syarat-syaratnya.",
  },

  {
    id: "mass-dzakar",
    title: "Menyentuh Kemaluan: Membatalkan Wudhu atau Tidak?",
    titleArabic: "نَقْضُ الْوُضُوءِ بِمَسِّ الذَّكَرِ",
    category: "fiqh",
    question: "Apakah menyentuh kemaluan sendiri atau orang lain membatalkan wudhu? Apakah ada perbedaan antara menyentuh dengan telapak tangan dan punggung tangan, atau dengan dan tanpa penghalang?",
    views: [
      {
        scholar: "Imam Asy-Syafi'i",
        scholarArabic: "الإمامُ الشَّافِعِيُّ",
        school: "Syafi'iyah",
        position: "Batal bila menyentuh kemaluan manusia (qubul atau dubur, milik sendiri atau orang lain) dengan bagian dalam telapak tangan atau jari, tanpa penghalang. Menyentuh dengan punggung tangan tidak membatalkan.",
        evidence: {
          arabic: "عَنْ بُسْرَةَ بِنْتِ صَفْوَانَ أَنَّ النَّبِيَّ ﷺ قَالَ: مَنْ مَسَّ ذَكَرَهُ فَلْيَتَوَضَّأْ",
          translation: "Dari Busrah binti Shafwan, Nabi ﷺ bersabda: 'Siapa yang menyentuh kemaluannya, hendaklah ia berwudhu.' (HR. Abu Dawud, At-Tirmidzi, An-Nasa'i, Ibnu Majah; At-Tirmidzi menilainya hasan shahih)",
          notes: "Dalam riwayat Abu Hurairah disebutkan 'ifdha' bil yad' (menyentuhkan tangan) tanpa penghalang."
        },
        reasoning: "Perintah berwudhu dalam hadits menunjukkan wajib. Lafazh ifdha' dalam riwayat Abu Hurairah bermakna menyentuh dengan bagian dalam telapak tangan, sehingga punggung tangan tidak termasuk. Hadits Thalq bin Ali yang menyatakan tidak batal dinilai mansukh, karena Thalq datang di awal hijrah saat masjid Nabawi dibangun, sedangkan Abu Hurairah masuk Islam belakangan.",
        source: "Al-Umm · Al-Majmu' · Nihayah Al-Muhtaj"
      },
      {
        scholar: "Imam Abu Hanifah",
        scholarArabic: "الإمامُ أبو حنيفةَ",
        school: "Hanafiyah",
        position: "Menyentuh kemaluan tidak membatalkan wudhu sama sekali, baik dengan telapak maupun punggung tangan, dengan atau tanpa syahwat.",
        evidence: {
          arabic: "عَنْ طَلْقِ بْنِ عَلِيٍّ أَنَّ النَّبِيَّ ﷺ سُئِلَ عَنِ الرَّجُلِ يَمَسُّ ذَكَرَهُ فِي الصَّلَاةِ فَقَالَ: هَلْ هُوَ إِلَّا مُضْغَةٌ مِنْهُ أَوْ بَضْعَةٌ مِنْهُ",
          translation: "Dari Thalq bin Ali, Nabi ﷺ ditanya tentang seseorang yang menyentuh kemaluannya dalam shalat. Beliau menjawab: 'Bukankah itu hanya sepotong daging darinya?' (HR. Abu Dawud, At-Tirmidzi, An-Nasa'i)",
          notes: "Kemaluan disamakan dengan anggota tubuh lain yang tidak membatalkan bila disentuh."
        },
        reasoning: "Hadits Thalq menjelaskan illat-nya secara langsung: kemaluan adalah bagian tubuh seperti anggota lain. Hanafiyah mendha'ifkan hadits Busrah, dan menilai bahwa perkara yang sering terjadi (umum al-balwa) seperti ini mestinya diriwayatkan banyak sahabat laki-laki, bukan hanya seorang perempuan. Sebagian sahabat seperti Ali, Ibnu Mas'ud, dan Ammar juga tidak memandangnya sebagai pembatal.",
        source: "Al-Mabsuth · Al-Hidayah · Fath Al-Qadir"
      },
      {
        scholar: "Imam Malik",
        scholarArabic: "الإمامُ مالكٌ",
        school: "Malikiyah",
        position: "Menurut pendapat masyhur, batal bila seseorang menyentuh kemaluannya sendiri (dzakar) dengan bagian dalam telapak tangan, sisi tangan, atau jari, tanpa penghalang. Menyentuh dubur tidak membatalkan.",
        evidence: {
          arabic: "مَنْ مَسَّ ذَكَرَهُ فَلْيَتَوَضَّأْ",
          translation: "Siapa yang menyentuh kemaluannya, hendaklah ia berwudhu. (Diriwayatkan Imam Malik dalam Al-Muwaththa' dari Busrah binti Shafwan)",
          notes: "Imam Malik meriwayatkan hadits Busrah di Al-Muwaththa' dan mengamalkannya."
        },
        reasoning: "Hadits Busrah sahih dan diamalkan ahlul Madinah. Lafazh hadits menyebut dzakar secara khusus, sehingga dubur tidak termasuk. Riwayat yang menyebut sentuhan dengan tangan menunjukkan alat sentuhnya adalah telapak dan jari, bukan anggota lain.",
        source: "Al-Muwaththa' · Al-Mudawwanah · Mukhtashar Khalil"
      },
      {
        scholar: "Imam Ahmad bin Hanbal",
        scholarArabic: "الإمامُ أحمدُ بنُ حنبلٍ",
        school: "Hanabilah",
        position: "Batal bila menyentuh kemaluan dengan tangan tanpa penghalang, baik dengan bagian dalam maupun punggung telapak tangan.",
        evidence: {
          arabic: "عَنْ أُمِّ حَبِيبَةَ قَالَتْ: سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: مَنْ مَسَّ فَرْجَهُ فَلْيَتَوَضَّأْ",
          translation: "Dari Ummu Habibah: 'Aku mendengar Rasulullah ﷺ bersabda: Siapa yang menyentuh kemaluannya, hendaklah ia berwudhu.' (HR. Ibnu Majah)",
          notes: "Lafazh farj mencakup qubul dan dubur."
        },
        reasoning: "Hadits-hadits tentang wudhu karena menyentuh kemaluan diriwayatkan oleh banyak sahabat, sehingga lebih kuat daripada hadits Thalq. Lafazh mass (menyentuh) dalam hadits bersifat umum dan mencakup seluruh bagian telapak tangan, tidak hanya bagian dalamnya.",
        source: "Al-Mughni · Al-Inshaf · Kasysyaf Al-Qina'"
      }
    ],
    notes: "Ini contoh klasik ta'arudh al-adillah (pertentangan dalil): hadits Busrah dan Abu Hurairah berhadapan dengan hadits Thalq bin Ali. Jumhur menempuh jalan tarjih atau naskh, sedangkan Hanafiyah mendahulukan hadits Thalq. Perbedaan detail (telapak atau punggung tangan, qubul atau dubur) lahir dari cara memahami lafazh mass, ifdha', dzakar, dan farj.",
    rangkuman: "Menyentuh kemaluan, batal wudhu atau tidak? Syafi'i: batal kalau pakai telapak tangan bagian dalam tanpa penghalang. Hanbali: batal, baik telapak maupun punggung tangan. Maliki: batal kalau menyentuh kemaluan sendiri dengan telapak atau jari. Hanafi: tidak batal sama sekali. Untuk bermadzhab Syafi'i: yang membatalkan adalah sentuhan langsung dengan telapak tangan, misalnya saat istinja tanpa sarung tangan.",
  },

  {
    id: "zakat-fitrah-uang",
    title: "Membayar Zakat Fitrah dengan Uang",
    titleArabic: "إِخْرَاجُ زَكَاةِ الْفِطْرِ بِالْقِيمَةِ",
    category: "fiqh",
    question: "Bolehkah zakat fitrah dibayarkan dalam bentuk uang seharga makanan pokok, atau harus berupa makanan pokok itu sendiri?",
    views: [
      {
        scholar: "Imam Abu Hanifah",
        scholarArabic: "الإمامُ أبو حنيفةَ",
        school: "Hanafiyah",
        position: "Boleh membayar zakat fitrah dengan nilai (qimah) berupa uang, bahkan bisa lebih utama bila lebih bermanfaat bagi fakir.",
        evidence: {
          arabic: "قَالَ مُعَاذٌ لِأَهْلِ الْيَمَنِ: ائْتُونِي بِعَرْضٍ ثِيَابٍ خَمِيصٍ أَوْ لَبِيسٍ فِي الصَّدَقَةِ مَكَانَ الشَّعِيرِ وَالذُّرَةِ، أَهْوَنُ عَلَيْكُمْ وَخَيْرٌ لِأَصْحَابِ النَّبِيِّ ﷺ بِالْمَدِينَةِ",
          translation: "Mu'adz berkata kepada penduduk Yaman: 'Berikan kepadaku barang berupa pakaian sebagai zakat, sebagai ganti gandum dan jagung. Itu lebih ringan bagi kalian dan lebih baik bagi para sahabat Nabi ﷺ di Madinah.' (Diriwayatkan Al-Bukhari secara mu'allaq)",
          notes: "Mu'adz, sahabat yang paling mengetahui halal dan haram, menerima nilai sebagai pengganti jenis yang ditentukan."
        },
        reasoning: "Tujuan zakat fitrah adalah mencukupi kebutuhan fakir di hari raya (ighna'). Penyebutan kurma dan gandum dalam hadits menjelaskan ukuran dan nilai yang wajib, bukan membatasi bentuknya, karena itulah alat tukar yang umum di masa Nabi ﷺ. Bila uang lebih memenuhi kebutuhan fakir, maka uang lebih sesuai dengan maksud syariat.",
        source: "Al-Mabsuth · Bada'i' Ash-Shana'i' · Radd Al-Muhtar"
      },
      {
        scholar: "Imam Asy-Syafi'i",
        scholarArabic: "الإمامُ الشَّافِعِيُّ",
        school: "Syafi'iyah",
        position: "Tidak sah membayar zakat fitrah dengan uang. Wajib berupa makanan pokok yang paling umum di negeri itu (ghalib quut al-balad) sebanyak satu sha'.",
        evidence: {
          arabic: "عَنِ ابْنِ عُمَرَ قَالَ: فَرَضَ رَسُولُ اللَّهِ ﷺ زَكَاةَ الْفِطْرِ صَاعًا مِنْ تَمْرٍ أَوْ صَاعًا مِنْ شَعِيرٍ عَلَى الْعَبْدِ وَالْحُرِّ وَالذَّكَرِ وَالْأُنْثَى وَالصَّغِيرِ وَالْكَبِيرِ مِنَ الْمُسْلِمِينَ",
          translation: "Dari Ibnu Umar: 'Rasulullah ﷺ mewajibkan zakat fitrah satu sha' kurma atau satu sha' gandum atas budak dan orang merdeka, laki-laki dan perempuan, anak kecil dan orang dewasa dari kaum Muslimin.' (Muttafaqun 'alaih)",
          notes: "Kata 'faradha' (mewajibkan) menunjukkan bentuk yang ditetapkan itulah yang wajib dikeluarkan."
        },
        reasoning: "Zakat fitrah adalah ibadah yang jenisnya ditentukan oleh nash. Dinar dan dirham sudah ada di masa Nabi ﷺ, namun beliau tetap menetapkan makanan. Seandainya nilai mencukupi, tentu beliau menjelaskannya. Mengganti jenis yang ditetapkan nash berarti keluar dari ketentuan ibadah.",
        source: "Al-Umm · Al-Majmu' · Mughni Al-Muhtaj"
      },
      {
        scholar: "Imam Malik",
        scholarArabic: "الإمامُ مالكٌ",
        school: "Malikiyah",
        position: "Menurut pendapat masyhur, zakat fitrah dengan uang tidak mencukupi. Wajib dikeluarkan dari jenis makanan pokok yang disebut dalam hadits atau makanan pokok penduduk negeri.",
        evidence: {
          arabic: "عَنْ أَبِي سَعِيدٍ الْخُدْرِيِّ قَالَ: كُنَّا نُخْرِجُ زَكَاةَ الْفِطْرِ صَاعًا مِنْ طَعَامٍ، أَوْ صَاعًا مِنْ شَعِيرٍ، أَوْ صَاعًا مِنْ تَمْرٍ، أَوْ صَاعًا مِنْ أَقِطٍ، أَوْ صَاعًا مِنْ زَبِيبٍ",
          translation: "Dari Abu Sa'id Al-Khudri: 'Kami dahulu mengeluarkan zakat fitrah satu sha' makanan, atau satu sha' gandum, atau satu sha' kurma, atau satu sha' keju, atau satu sha' kismis.' (Muttafaqun 'alaih)",
          notes: "Praktik para sahabat selalu berupa makanan, tidak pernah dinukil mereka mengeluarkan dirham."
        },
        reasoning: "Amal para sahabat menunjukkan zakat fitrah dikeluarkan dalam bentuk makanan. Mengikuti praktik yang jelas dari generasi sahabat lebih selamat dalam ibadah. Sebagian ulama Malikiyah membolehkan nilai dengan karahah, namun pendapat masyhur tetap mengharuskan makanan.",
        source: "Al-Mudawwanah · Mawahib Al-Jalil · Hasyiyah Ad-Dasuqi"
      },
      {
        scholar: "Imam Ahmad bin Hanbal",
        scholarArabic: "الإمامُ أحمدُ بنُ حنبلٍ",
        school: "Hanabilah",
        position: "Tidak sah membayar zakat fitrah dengan uang. Wajib dengan jenis makanan yang disebut dalam nash.",
        evidence: {
          arabic: "يَدَعُونَ قَوْلَ رَسُولِ اللَّهِ ﷺ وَيَقُولُونَ: قَالَ فُلَانٌ",
          translation: "'Mereka meninggalkan sabda Rasulullah ﷺ lalu berkata: si fulan berkata begini.' (Ucapan Imam Ahmad ketika disampaikan kepadanya bahwa Umar bin Abdul Aziz menerima zakat fitrah dalam bentuk nilai)",
          notes: "Dinukil Ibnu Qudamah dalam Al-Mughni sebagai sikap tegas Imam Ahmad."
        },
        reasoning: "Selama ada nash yang menentukan jenis, pendapat siapa pun tidak boleh mendahuluinya. Membayar nilai berarti menyelisihi ketentuan yang sudah jelas dalam hadits Ibnu Umar dan Abu Sa'id.",
        source: "Al-Mughni · Al-Inshaf · Kasysyaf Al-Qina'"
      }
    ],
    notes: "Khilaf ini berangkat dari pertanyaan ushul: apakah zakat fitrah ibadah yang bentuknya ta'abbudi (jumhur), atau ibadah yang bisa ditelusuri tujuannya, yaitu mencukupi fakir (Hanafiyah)? Dar Al-Ifta' Al-Mishriyyah memfatwakan bolehnya zakat fitrah dengan uang dengan mengambil pendapat Hanafiyah, karena lebih bermanfaat bagi fakir di kota. Di Indonesia, banyak lembaga zakat juga menerima uang dengan alasan yang sama.",
    rangkuman: "Zakat fitrah boleh pakai uang? Hanafi: boleh, bahkan bisa lebih utama kalau lebih bermanfaat bagi fakir. Syafi'i, Maliki, dan Hanbali: tidak sah, harus makanan pokok (di Indonesia beras, sekitar 2,5–3 kg). Di Mesir, Dar Al-Ifta membolehkan uang. Kalau kamu ingin keluar dari khilaf, bayar dengan beras atau makanan pokok.",
  },

  {
    id: "niat-puasa-ramadhan",
    title: "Niat Puasa Ramadhan: Tiap Malam atau Sekali Sebulan?",
    titleArabic: "تَبْيِيتُ نِيَّةِ صَوْمِ رَمَضَانَ وَتَجْدِيدُهَا",
    category: "fiqh",
    question: "Apakah niat puasa Ramadhan wajib dilakukan setiap malam sebelum fajar, atau cukup sekali untuk satu bulan? Dan bolehkah niat puasa wajib dilakukan setelah terbit fajar?",
    views: [
      {
        scholar: "Imam Asy-Syafi'i",
        scholarArabic: "الإمامُ الشَّافِعِيُّ",
        school: "Syafi'iyah",
        position: "Wajib berniat setiap malam (tabyit) untuk setiap hari puasa Ramadhan, antara terbenam matahari sampai sebelum terbit fajar. Niat sebulan sekaligus hanya sah untuk hari pertama.",
        evidence: {
          arabic: "عَنْ حَفْصَةَ أَنَّ النَّبِيَّ ﷺ قَالَ: مَنْ لَمْ يُبَيِّتِ الصِّيَامَ قَبْلَ الْفَجْرِ فَلَا صِيَامَ لَهُ",
          translation: "Dari Hafshah, Nabi ﷺ bersabda: 'Siapa yang tidak berniat puasa di malam hari sebelum fajar, maka tidak ada puasa baginya.' (HR. An-Nasa'i; diriwayatkan pula oleh Abu Dawud dan At-Tirmidzi dengan lafazh yang berdekatan)",
          notes: "Penafian 'tidak ada puasa' dibawa ke tidak sahnya puasa wajib."
        },
        reasoning: "Setiap hari Ramadhan adalah ibadah yang berdiri sendiri: batalnya puasa satu hari tidak membatalkan hari yang lain, dan di antara dua hari dipisahkan malam yang bukan waktu puasa. Karena tiap hari ibadah tersendiri, maka tiap hari membutuhkan niat tersendiri yang dilakukan di malam harinya, sesuai hadits Hafshah.",
        source: "Al-Umm · Al-Majmu' · Mughni Al-Muhtaj"
      },
      {
        scholar: "Imam Abu Hanifah",
        scholarArabic: "الإمامُ أبو حنيفةَ",
        school: "Hanafiyah",
        position: "Niat puasa Ramadhan sah dilakukan dari malam hari sampai sebelum pertengahan siang syar'i (sebelum dhahwah kubra), selama belum makan atau minum. Niat wajib diperbarui setiap hari.",
        evidence: {
          arabic: "عَنْ سَلَمَةَ بْنِ الْأَكْوَعِ أَنَّ النَّبِيَّ ﷺ بَعَثَ رَجُلًا يُنَادِي فِي النَّاسِ يَوْمَ عَاشُورَاءَ: إِنَّ مَنْ أَكَلَ فَلْيُتِمَّ أَوْ فَلْيَصُمْ، وَمَنْ لَمْ يَأْكُلْ فَلَا يَأْكُلْ",
          translation: "Dari Salamah bin Al-Akwa', Nabi ﷺ mengutus seseorang untuk mengumumkan kepada orang-orang pada hari Asyura: 'Siapa yang sudah makan, hendaklah ia menahan diri sampai sore; siapa yang belum makan, janganlah makan.' (Muttafaqun 'alaih)",
          notes: "Saat itu puasa Asyura hukumnya wajib, dan Nabi ﷺ memerintahkan berpuasa dengan niat di siang hari."
        },
        reasoning: "Bila puasa wajib Asyura sah dengan niat di siang hari, maka puasa Ramadhan yang waktunya sudah tertentu lebih layak sah dengan niat seperti itu. Hadits Hafshah dibawa ke puasa yang waktunya tidak tertentu, seperti qadha dan kafarat, atau dimaknai penafian kesempurnaan.",
        source: "Al-Mabsuth · Bada'i' Ash-Shana'i' · Al-Hidayah"
      },
      {
        scholar: "Imam Malik",
        scholarArabic: "الإمامُ مالكٌ",
        school: "Malikiyah",
        position: "Cukup satu kali niat di malam pertama untuk seluruh bulan Ramadhan, selama puasanya tidak terputus oleh uzur seperti sakit, safar, atau haid. Bila terputus, niat harus diperbarui.",
        evidence: {
          arabic: "فَمَن شَهِدَ مِنكُمُ الشَّهْرَ فَلْيَصُمْهُ",
          translation: "Maka barangsiapa di antara kamu hadir (di negeri tempat tinggalnya) di bulan itu, hendaklah ia berpuasa. (Al-Baqarah: 185)",
          notes: "Perintah berpuasa diarahkan kepada 'asy-syahr' (bulan) sebagai satu kesatuan."
        },
        reasoning: "Puasa Ramadhan adalah satu ibadah yang wajib dilakukan berturut-turut (tatabu'), seperti puasa kafarat dua bulan berturut-turut. Ibadah yang satu cukup dengan satu niat di awalnya, sebagaimana shalat cukup dengan satu niat di awal meski terdiri dari banyak rakaat.",
        source: "Al-Mudawwanah · Asy-Syarh Ash-Shaghir · Hasyiyah Ad-Dasuqi"
      },
      {
        scholar: "Imam Ahmad bin Hanbal",
        scholarArabic: "الإمامُ أحمدُ بنُ حنبلٍ",
        school: "Hanabilah",
        position: "Menurut pendapat madzhab, wajib berniat setiap malam untuk setiap hari. Ada riwayat lain dari Imam Ahmad bahwa satu niat di awal bulan sudah mencukupi.",
        evidence: {
          arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
          translation: "Sesungguhnya setiap amal tergantung niatnya, dan setiap orang hanya mendapatkan apa yang ia niatkan. (Muttafaqun 'alaih)",
          notes: "Setiap hari puasa adalah amal tersendiri, sehingga membutuhkan niat tersendiri."
        },
        reasoning: "Puasa setiap hari adalah amal yang terpisah: rusaknya satu hari tidak merusak hari lainnya. Maka hadits niat dan hadits Hafshah berlaku untuk setiap hari. Riwayat kedua dari Imam Ahmad mengikuti pandangan Malikiyah bahwa Ramadhan satu kesatuan ibadah.",
        source: "Al-Mughni · Al-Inshaf · Kasysyaf Al-Qina'"
      }
    ],
    notes: "Inti perbedaannya: apakah puasa Ramadhan satu ibadah utuh (Malikiyah) atau tiga puluh ibadah terpisah (jumhur), dan apakah hadits Hafshah berlaku untuk semua puasa wajib atau hanya yang waktunya tidak tertentu (Hanafiyah). Banyak ulama Syafi'iyah menganjurkan berniat puasa sebulan di malam pertama Ramadhan dengan bertaqlid kepada Imam Malik, sebagai jaga-jaga bila suatu malam lupa berniat.",
    rangkuman: "Niat puasa Ramadhan harus tiap malam? Syafi'i dan Hanbali: ya, wajib tiap malam sebelum subuh. Maliki: cukup sekali di malam pertama untuk sebulan penuh. Hanafi: boleh niat sampai sebelum tengah hari selama belum makan. Tips: tetap niat tiap malam, tapi di malam pertama tambahkan niat untuk sebulan penuh, jadi kalau suatu malam lupa, puasamu tetap aman menurut madzhab Maliki.",
  },

  {
    id: "wali-nikah",
    title: "Syarat Wali dalam Akad Nikah",
    titleArabic: "اشْتِرَاطُ الْوَلِيِّ فِي عَقْدِ النِّكَاحِ",
    category: "fiqh",
    question: "Apakah wali merupakan syarat sah nikah? Bolehkah perempuan yang sudah baligh dan berakal menikahkan dirinya sendiri tanpa wali?",
    views: [
      {
        scholar: "Imam Abu Hanifah",
        scholarArabic: "الإمامُ أبو حنيفةَ",
        school: "Hanafiyah",
        position: "Perempuan baligh dan berakal sah menikahkan dirinya sendiri tanpa wali. Namun bila ia menikah dengan laki-laki yang tidak sekufu atau dengan mahar di bawah mahar mitsl, wali berhak mengajukan pembatalan ke hakim.",
        evidence: {
          arabic: "الْأَيِّمُ أَحَقُّ بِنَفْسِهَا مِنْ وَلِيِّهَا، وَالْبِكْرُ تُسْتَأْذَنُ فِي نَفْسِهَا، وَإِذْنُهَا صُمَاتُهَا",
          translation: "Perempuan yang tidak bersuami lebih berhak atas dirinya daripada walinya, dan gadis dimintai izin tentang dirinya, dan izinnya adalah diamnya. (HR. Muslim)",
          notes: "Hadits ini menegaskan hak perempuan atas dirinya sendiri dalam urusan nikah."
        },
        reasoning: "Al-Qur'an menyandarkan akad nikah kepada perempuan sendiri, seperti dalam 'hatta tankiha zaujan ghairahu' (Al-Baqarah: 230) dan 'fala junaha 'alaikum fima fa'alna fi anfusihinna bil ma'ruf' (Al-Baqarah: 234). Perempuan baligh yang berakal sah mengelola hartanya sendiri, maka ia juga sah melakukan akad atas dirinya. Hak wali tetap dijaga melalui syarat kafa'ah.",
        source: "Al-Mabsuth · Bada'i' Ash-Shana'i' · Fath Al-Qadir"
      },
      {
        scholar: "Imam Asy-Syafi'i",
        scholarArabic: "الإمامُ الشَّافِعِيُّ",
        school: "Syafi'iyah",
        position: "Wali adalah syarat sah nikah. Perempuan tidak sah menikahkan dirinya sendiri maupun orang lain, meskipun dengan izin walinya.",
        evidence: {
          arabic: "عَنْ أَبِي مُوسَى أَنَّ النَّبِيَّ ﷺ قَالَ: لَا نِكَاحَ إِلَّا بِوَلِيٍّ",
          translation: "Dari Abu Musa, Nabi ﷺ bersabda: 'Tidak ada nikah kecuali dengan wali.' (HR. Abu Dawud, At-Tirmidzi, Ibnu Majah)",
          notes: "Penafian 'tidak ada nikah' dibawa ke tidak sahnya nikah, karena itulah makna terdekat dari penafian hakikat."
        },
        reasoning: "Hadits ini menafikan keabsahan nikah tanpa wali secara tegas. Hadits 'al-ayyim ahaqqu binafsiha' dimaknai bahwa perempuan lebih berhak dalam memilih dan memberi persetujuan, bukan dalam melakukan akad. Nikah menyangkut kehormatan keluarga, sehingga syariat menyerahkan akadnya kepada wali sebagai penjaga.",
        source: "Al-Umm · Al-Majmu' · Mughni Al-Muhtaj"
      },
      {
        scholar: "Imam Malik",
        scholarArabic: "الإمامُ مالكٌ",
        school: "Malikiyah",
        position: "Wali adalah rukun nikah. Untuk perempuan yang memiliki kedudukan (syarifah), wajib wali dari kerabat (wali khas). Untuk perempuan biasa yang tidak memiliki kerabat yang mengurusnya, sebagian riwayat membolehkan wali umum dari kalangan Muslimin.",
        evidence: {
          arabic: "عَنْ عَائِشَةَ أَنَّ النَّبِيَّ ﷺ قَالَ: أَيُّمَا امْرَأَةٍ نَكَحَتْ بِغَيْرِ إِذْنِ وَلِيِّهَا فَنِكَاحُهَا بَاطِلٌ، فَنِكَاحُهَا بَاطِلٌ، فَنِكَاحُهَا بَاطِلٌ",
          translation: "Dari Aisyah, Nabi ﷺ bersabda: 'Perempuan mana pun yang menikah tanpa izin walinya, maka nikahnya batal, nikahnya batal, nikahnya batal.' (HR. Abu Dawud, At-Tirmidzi, Ibnu Majah)",
          notes: "Pengulangan tiga kali menunjukkan penegasan yang sangat kuat."
        },
        reasoning: "Hadits Aisyah menegaskan batalnya nikah tanpa wali. Pembedaan antara syarifah dan perempuan biasa didasarkan pada fungsi wali, yaitu menjaga kehormatan dan kesetaraan keluarga, yang lebih dibutuhkan pada keluarga yang memiliki kedudukan.",
        source: "Al-Mudawwanah · Mukhtashar Khalil · Asy-Syarh Al-Kabir"
      },
      {
        scholar: "Imam Ahmad bin Hanbal",
        scholarArabic: "الإمامُ أحمدُ بنُ حنبلٍ",
        school: "Hanabilah",
        position: "Wali adalah syarat sah nikah. Nikah tanpa wali tidak sah.",
        evidence: {
          arabic: "فَلَا تَعْضُلُوهُنَّ أَن يَنكِحْنَ أَزْوَاجَهُنَّ إِذَا تَرَاضَوْا بَيْنَهُم بِالْمَعْرُوفِ",
          translation: "Maka janganlah kamu (para wali) menghalangi mereka menikah dengan calon suaminya, apabila telah terjalin kecocokan di antara mereka dengan cara yang baik. (Al-Baqarah: 232)",
          notes: "Ayat ini turun tentang Ma'qil bin Yasar yang menolak menikahkan saudarinya (HR. Al-Bukhari)."
        },
        reasoning: "Larangan kepada wali agar tidak menghalangi (adhl) menunjukkan bahwa nikah bergantung pada wali. Seandainya perempuan bisa menikahkan dirinya sendiri, penghalangan wali tidak berarti apa-apa dan larangan itu tidak diperlukan. Imam Asy-Syafi'i juga berdalil dengan ayat ini.",
        source: "Al-Mughni · Al-Inshaf · Kasysyaf Al-Qina'"
      }
    ],
    notes: "Jumhur (Syafi'iyah, Malikiyah, Hanabilah) mewajibkan wali, sedangkan Hanafiyah tidak. Kompilasi Hukum Islam di Indonesia menjadikan wali sebagai rukun nikah, mengikuti jumhur. Di Mesir, hukum keluarga merujuk ke pendapat rajih madzhab Hanafi untuk perkara yang tidak diatur undang-undang. Bagi Masisir yang menikah di Mesir, pastikan akadnya juga sah menurut hukum Indonesia agar pencatatan di KBRI tidak bermasalah.",
    rangkuman: "Perempuan boleh menikahkan dirinya sendiri tanpa wali? Hanafi: boleh, asal sudah baligh dan berakal, tapi wali bisa membatalkan kalau calonnya tidak sekufu. Syafi'i, Maliki, dan Hanbali: tidak sah, wali wajib. Di Indonesia, hukum yang berlaku mewajibkan wali. Jadi bagi Masisir yang menikah, ikuti jumhur: harus ada wali.",
  },

  {
    id: "jumlah-jamaah-jumat",
    title: "Jumlah Minimal Jamaah Shalat Jumat",
    titleArabic: "الْعَدَدُ الَّذِي تَنْعَقِدُ بِهِ الْجُمُعَةُ",
    category: "fiqh",
    question: "Berapa jumlah minimal jamaah agar shalat Jumat sah? Apakah sah Jumat yang diadakan di mushalla kecil, asrama, atau perkumpulan dengan jamaah sedikit?",
    views: [
      {
        scholar: "Imam Asy-Syafi'i dan Imam Ahmad",
        scholarArabic: "الإمامُ الشَّافِعِيُّ وَالإمامُ أحمدُ",
        school: "Syafi'iyah · Hanabilah",
        position: "Shalat Jumat hanya sah dengan minimal empat puluh laki-laki mukallaf, merdeka, dan penduduk tetap (mustauthin) di tempat itu, termasuk imam. Ini pendapat yang masyhur dalam kedua madzhab.",
        evidence: {
          arabic: "عَنْ عَبْدِ الرَّحْمَنِ بْنِ كَعْبِ بْنِ مَالِكٍ عَنْ أَبِيهِ أَنَّ أَوَّلَ مَنْ جَمَّعَ بِهِمْ أَسْعَدُ بْنُ زُرَارَةَ ... قُلْتُ: كَمْ كُنْتُمْ يَوْمَئِذٍ؟ قَالَ: أَرْبَعُونَ",
          translation: "Dari Abdurrahman bin Ka'b bin Malik dari ayahnya, bahwa orang pertama yang mengadakan shalat Jumat bersama mereka adalah As'ad bin Zurarah. 'Aku bertanya: Berapa jumlah kalian saat itu?' Ia menjawab: 'Empat puluh orang.' (HR. Abu Dawud, Ibnu Majah)",
          notes: "Jumat pertama di Madinah diadakan dengan empat puluh orang."
        },
        reasoning: "Shalat Jumat adalah ibadah yang tata caranya diambil dari praktik Nabi ﷺ dan para sahabat. Tidak ada riwayat sahih tentang Jumat yang diadakan dengan jumlah kurang dari empat puluh, maka jumlah inilah batas yang pasti. Ibadah yang bersifat tauqifi tidak boleh dikurangi dari yang ditetapkan riwayat.",
        source: "Al-Umm · Al-Majmu' · Al-Mughni · Kasysyaf Al-Qina'"
      },
      {
        scholar: "Imam Abu Hanifah",
        scholarArabic: "الإمامُ أبو حنيفةَ",
        school: "Hanafiyah",
        position: "Shalat Jumat sah dengan tiga laki-laki selain imam. Abu Yusuf berpendapat cukup dua orang selain imam.",
        evidence: {
          arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا نُودِيَ لِلصَّلَاةِ مِن يَوْمِ الْجُمُعَةِ فَاسْعَوْا إِلَىٰ ذِكْرِ اللَّهِ",
          translation: "Wahai orang-orang yang beriman, apabila diseru untuk shalat pada hari Jumat, maka bersegeralah kamu mengingat Allah. (Al-Jumu'ah: 9)",
          notes: "Kata 'fas'au' berbentuk jamak, dan bentuk jamak minimal tiga orang."
        },
        reasoning: "Ayat memerintahkan sekelompok orang (minimal tiga, bentuk jamak) untuk bersegera menuju dzikrullah, yaitu khutbah yang disampaikan oleh khatib. Maka jamaah Jumat terdiri dari tiga orang yang mendengar ditambah satu imam yang berkhutbah. Tidak ada nash sahih yang menetapkan empat puluh sebagai syarat.",
        source: "Al-Mabsuth · Bada'i' Ash-Shana'i' · Al-Hidayah"
      },
      {
        scholar: "Imam Malik",
        scholarArabic: "الإمامُ مالكٌ",
        school: "Malikiyah",
        position: "Shalat Jumat sah dengan minimal dua belas laki-laki selain imam, yang hadir dari awal khutbah sampai salam, di tempat yang merupakan pemukiman tetap.",
        evidence: {
          arabic: "عَنْ جَابِرٍ أَنَّ النَّبِيَّ ﷺ كَانَ يَخْطُبُ قَائِمًا يَوْمَ الْجُمُعَةِ، فَجَاءَتْ عِيرٌ مِنَ الشَّامِ، فَانْفَتَلَ النَّاسُ إِلَيْهَا حَتَّى لَمْ يَبْقَ إِلَّا اثْنَا عَشَرَ رَجُلًا",
          translation: "Dari Jabir, Nabi ﷺ sedang berkhutbah berdiri pada hari Jumat, lalu datang kafilah dagang dari Syam. Orang-orang pun beranjak menuju kafilah itu hingga tidak tersisa kecuali dua belas orang. (HR. Muslim)",
          notes: "Peristiwa ini menjadi sebab turunnya ayat 'wa idza ra'au tijaratan au lahwan' (Al-Jumu'ah: 11)."
        },
        reasoning: "Nabi ﷺ tetap melanjutkan shalat Jumat bersama dua belas orang yang tersisa. Ini menunjukkan Jumat sah dengan jumlah tersebut. Jumlah yang sudah terbukti sah dalam praktik Nabi ﷺ menjadi batas minimal.",
        source: "Al-Mudawwanah · Mukhtashar Khalil · Hasyiyah Ad-Dasuqi"
      }
    ],
    notes: "Perbedaan ini sangat praktis. Menurut Syafi'iyah, Jumat di asrama, flat, atau mushalla dengan jamaah kurang dari empat puluh tidak sah, sehingga jamaah wajib shalat Zhuhur. Menurut Hanafiyah cukup empat orang termasuk imam, dan menurut Malikiyah tiga belas orang termasuk imam. Di Kairo, masjid besar sangat mudah dijangkau, sehingga keluar dari khilaf dengan shalat Jumat di masjid jami' lebih utama.",
    rangkuman: "Shalat Jumat minimal berapa orang? Syafi'i dan Hanbali: 40 orang (termasuk imam). Maliki: 12 orang selain imam. Hanafi: 3 orang selain imam. Jadi kalau di asrama atau flat jamaahnya kurang dari 40, menurut Syafi'i Jumatnya tidak sah dan harus Zhuhur. Paling aman: shalat Jumat di masjid jami' terdekat.",
  },

  {
    id: "qadha-shalat-sengaja",
    title: "Qadha Shalat yang Sengaja Ditinggalkan",
    titleArabic: "قَضَاءُ الصَّلَاةِ الْمَتْرُوكَةِ عَمْدًا",
    category: "fiqh",
    question: "Orang yang meninggalkan shalat fardhu dengan sengaja tanpa uzur, apakah wajib mengqadhanya? Atau qadha hanya disyariatkan bagi orang yang tertidur dan lupa?",
    views: [
      {
        scholar: "Jumhur Fuqaha",
        scholarArabic: "جُمْهُورُ الْفُقَهَاءِ",
        school: "Hanafiyah · Malikiyah · Syafi'iyah · Hanabilah",
        position: "Wajib mengqadha shalat yang ditinggalkan dengan sengaja, disertai taubat dari dosa meninggalkannya. Menurut Syafi'iyah, qadha shalat yang ditinggalkan tanpa uzur wajib segera (fauran).",
        evidence: {
          arabic: "عَنْ أَنَسٍ أَنَّ النَّبِيَّ ﷺ قَالَ: مَنْ نَسِيَ صَلَاةً فَلْيُصَلِّ إِذَا ذَكَرَهَا، لَا كَفَّارَةَ لَهَا إِلَّا ذَلِكَ",
          translation: "Dari Anas, Nabi ﷺ bersabda: 'Siapa yang lupa mengerjakan shalat, hendaklah ia mengerjakannya ketika ingat. Tidak ada tebusan baginya selain itu.' (Muttafaqun 'alaih)",
          notes: "Bila orang yang lupa, yang tidak berdosa, wajib mengqadha, maka orang yang sengaja lebih wajib lagi."
        },
        reasoning: "Ini qiyas aulawi: kewajiban qadha bagi orang yang lupa dan tertidur, padahal mereka dimaafkan, menunjukkan bahwa kewajiban shalat tidak gugur dengan habisnya waktu. Orang yang sengaja lebih pantas dibebani qadha. Diperkuat sabda Nabi ﷺ 'fadainullahi ahaqqu an yuqdha' (utang kepada Allah lebih berhak untuk dibayar), HR. Al-Bukhari dan Muslim.",
        source: "Bada'i' Ash-Shana'i' · Mawahib Al-Jalil · Al-Majmu' · Al-Mughni"
      },
      {
        scholar: "Ibnu Hazm Az-Zhahiri",
        scholarArabic: "ابنُ حزمٍ الظَّاهِرِيُّ",
        school: "Zhahiriyah (juga dipilih Ibnu Taimiyah)",
        position: "Shalat yang sengaja ditinggalkan sampai habis waktunya tidak bisa diqadha dan tidak sah bila dikerjakan di luar waktunya. Yang wajib adalah taubat yang sungguh-sungguh dan memperbanyak shalat sunnah.",
        evidence: {
          arabic: "فَخَلَفَ مِن بَعْدِهِمْ خَلْفٌ أَضَاعُوا الصَّلَاةَ وَاتَّبَعُوا الشَّهَوَاتِ ۖ فَسَوْفَ يَلْقَوْنَ غَيًّا ۝ إِلَّا مَن تَابَ",
          translation: "Kemudian datanglah sesudah mereka pengganti yang menyia-nyiakan shalat dan memperturutkan hawa nafsu, maka mereka kelak akan menemui kesesatan, kecuali orang yang bertaubat. (Maryam: 59-60)",
          notes: "Jalan keluar yang disebut ayat adalah taubat, bukan qadha."
        },
        reasoning: "Shalat adalah ibadah yang terikat waktu. Mengerjakannya di luar waktu membutuhkan nash, dan nash hanya datang untuk orang yang tertidur dan lupa. Orang yang sengaja tidak termasuk, maka tidak boleh diqiyaskan, karena keduanya berbeda: yang satu dimaafkan, yang lain berdosa.",
        source: "Al-Muhalla (Ibnu Hazm) · Al-Ikhtiyarat Al-Fiqhiyyah (Ibnu Taimiyah)"
      }
    ],
    notes: "An-Nawawi dalam Al-Majmu' menyebut wajibnya qadha bagi yang sengaja sebagai pendapat ulama yang diperhitungkan, dan menilai pendapat yang berbeda sebagai syadz. Pendapat Ibnu Hazm sering dikutip di media sosial, padahal ia menyelisihi empat madzhab. Al-Azhar dan Dar Al-Ifta' Al-Mishriyyah berpegang pada pendapat jumhur: shalat yang ditinggalkan tetap utang yang wajib dibayar.",
    rangkuman: "Shalat yang sengaja ditinggalkan, wajib diqadha? Empat madzhab sepakat: wajib diqadha, plus taubat. Ibnu Hazm (dan Ibnu Taimiyah) berpendapat tidak bisa diqadha, cukup taubat dan perbanyak sunnah, tapi ini pendapat minoritas. Jadi kalau punya utang shalat, cicil qadhanya, misalnya satu shalat qadha setelah setiap shalat fardhu, sambil bertaubat.",
  },

  {
    id: "mafhum-mukhalafah",
    title: "Kehujjahan Mafhum Mukhalafah",
    titleArabic: "حُجِّيَّةُ مَفْهُومِ الْمُخَالَفَةِ",
    category: "ushul",
    question: "Bila sebuah nash menyebut hukum dengan sifat, syarat, atau bilangan tertentu, apakah kebalikan hukumnya berlaku untuk keadaan yang tidak memiliki sifat itu? Misalnya, bila zakat disebut untuk kambing yang digembalakan, apakah kambing yang diberi pakan tidak wajib dizakati?",
    views: [
      {
        scholar: "Jumhur Ushuliyyin",
        scholarArabic: "جُمْهُورُ الأُصُولِيِّينَ",
        school: "Syafi'iyah · Malikiyah · Hanabilah",
        position: "Mafhum mukhalafah adalah hujjah, dengan syarat qayd (sifat, syarat, bilangan, ghayah) tidak disebut karena alasan lain, seperti mengikuti kebiasaan (kharaja makhraj al-ghalib), menjawab pertanyaan tertentu, atau untuk menyebut karunia (imtinan). Mafhum laqab (nama benda) tidak dijadikan hujjah.",
        evidence: {
          arabic: "عَنْ يَعْلَى بْنِ أُمَيَّةَ قَالَ: قُلْتُ لِعُمَرَ: لَيْسَ عَلَيْكُمْ جُنَاحٌ أَنْ تَقْصُرُوا مِنَ الصَّلَاةِ إِنْ خِفْتُمْ، فَقَدْ أَمِنَ النَّاسُ! فَقَالَ: عَجِبْتُ مِمَّا عَجِبْتَ مِنْهُ، فَسَأَلْتُ رَسُولَ اللَّهِ ﷺ عَنْ ذَلِكَ فَقَالَ: صَدَقَةٌ تَصَدَّقَ اللَّهُ بِهَا عَلَيْكُمْ فَاقْبَلُوا صَدَقَتَهُ",
          translation: "Dari Ya'la bin Umayyah: 'Aku berkata kepada Umar: (Allah berfirman) tidak mengapa kamu mengqashar shalat jika kamu takut, padahal sekarang orang-orang sudah aman! Umar menjawab: Aku pun heran seperti kamu, lalu aku bertanya kepada Rasulullah ﷺ, dan beliau bersabda: Itu sedekah yang Allah berikan kepada kalian, maka terimalah sedekah-Nya.' (HR. Muslim)",
          notes: "Ya'la dan Umar, dua orang Arab yang fasih, memahami syarat 'in khiftum' sebagai pembatas: tanpa rasa takut, qashar tidak berlaku."
        },
        reasoning: "Para sahabat yang memahami bahasa Arab secara alami menangkap mafhum mukhalafah dari syarat dalam ayat, dan Nabi ﷺ tidak mengingkari cara memahami itu, beliau hanya menjelaskan adanya dalil lain. Selain itu, menyebut sifat tertentu tanpa tujuan pembatasan dianggap sia-sia, dan kalam syar'i terhindar dari kesia-siaan.",
        source: "Al-Mustashfa · Al-Ihkam (Al-Amidi) · Syarh Tanqih Al-Fushul · Raudhah An-Nazhir"
      },
      {
        scholar: "Hanafiyah",
        scholarArabic: "الْحَنَفِيَّةُ",
        school: "Hanafiyah",
        position: "Mafhum mukhalafah tidak menjadi hujjah dalam nash-nash syar'i. Penyebutan sifat atau syarat hanya menetapkan hukum untuk yang disebut, dan tidak menafikan hukum dari yang tidak disebut. Hukum yang tidak disebut dicari dari dalil lain atau dikembalikan ke hukum asal.",
        evidence: {
          arabic: "وَرَبَائِبُكُمُ اللَّاتِي فِي حُجُورِكُم مِّن نِّسَائِكُمُ اللَّاتِي دَخَلْتُم بِهِنَّ",
          translation: "Dan (diharamkan atasmu) anak-anak tiri yang dalam pemeliharaanmu dari istri yang telah kamu campuri. (An-Nisa': 23)",
          notes: "Anak tiri tetap haram dinikahi meski tidak berada dalam pemeliharaan, menurut kesepakatan ulama."
        },
        reasoning: "Banyak qayd dalam Al-Qur'an yang jelas tidak bermafhum, seperti 'fi hujurikum' dalam ayat ini dan 'adh'afan mudha'afah' dalam larangan riba (Ali Imran: 130). Ini menunjukkan penyebutan sifat tidak otomatis menafikan hukum dari selainnya. Karena itu, hukum yang tidak disebut harus ditetapkan dengan dalil tersendiri, tidak cukup dengan mafhum.",
        source: "Ushul As-Sarakhsi · Kasyf Al-Asrar (Abdul Aziz Al-Bukhari) · At-Taudhih wa At-Talwih"
      }
    ],
    notes: "Khilaf ini berdampak luas pada fiqh. Contoh: hadits 'fi sha'imatil ghanam az-zakah' (zakat pada kambing yang digembalakan). Jumhur memahami kambing yang diberi pakan tidak wajib dizakati berdasarkan mafhum. Hanafiyah sampai pada hasil yang sama, tetapi berdalil dengan bara'ah ashliyyah (hukum asal tidak wajib), bukan dengan mafhum. Di imtihan ushul fiqh Al-Azhar, syarat-syarat mafhum mukhalafah dan pembagiannya (mafhum shifat, syarth, ghayah, 'adad, laqab) sering keluar.",
    rangkuman: "Kalau dalil menyebut syarat atau sifat tertentu, apakah kebalikannya otomatis berlaku? Jumhur (Syafi'i, Maliki, Hanbali): ya, ini disebut mafhum mukhalafah, asal sifat itu memang disebut untuk membatasi. Hanafi: tidak, yang tidak disebut harus dicari dalilnya sendiri. Hafalkan juga lima jenis mafhum (shifat, syarth, ghayah, 'adad, laqab), karena sering ditanyakan di imtihan.",
  },

  {
    id: "ruyatullah-akhirat",
    title: "Melihat Allah di Akhirat",
    titleArabic: "رُؤْيَةُ اللَّهِ تَعَالَى فِي الْآخِرَةِ",
    category: "aqidah",
    question: "Apakah orang-orang beriman akan melihat Allah di akhirat? Bila ya, bagaimana memahaminya tanpa menyerupakan Allah dengan makhluk, dan bagaimana menjawab ayat 'la tudrikuhul abshar'?",
    views: [
      {
        scholar: "Al-Asy'ariyah",
        scholarArabic: "الأَشَاعِرَةُ",
        school: "Ahlus Sunnah · Asy'ariyah",
        position: "Melihat Allah boleh menurut akal (ja'iz 'aqlan) dan pasti terjadi menurut nash (waqi' sam'an) bagi orang-orang beriman di akhirat, tanpa kaifiyah, tanpa arah, tanpa berhadapan, dan tanpa liputan.",
        evidence: {
          arabic: "وُجُوهٌ يَوْمَئِذٍ نَّاضِرَةٌ ۝ إِلَىٰ رَبِّهَا نَاظِرَةٌ",
          translation: "Wajah-wajah (orang mukmin) pada hari itu berseri-seri, kepada Tuhannya mereka melihat. (Al-Qiyamah: 22-23)",
          notes: "Kata 'nazhar' yang dihubungkan dengan huruf 'ila' dan disandarkan pada wajah bermakna melihat dengan mata."
        },
        reasoning: "Secara akal, setiap yang wujud sah untuk dilihat (dalil al-wujud), dan Allah Maha Wujud, maka melihat-Nya tidak mustahil. Secara nash, ayat dan hadits mutawatir menegaskannya. Penglihatan ini adalah penyingkapan sempurna yang Allah ciptakan pada mata orang beriman, tanpa mengharuskan arah dan jarak sebagaimana penglihatan di dunia.",
        source: "Al-Ibanah · Al-Luma' (Al-Asy'ari) · Syarh Al-Mawaqif"
      },
      {
        scholar: "Al-Maturidiyah",
        scholarArabic: "الْمَاتُرِيدِيَّةُ",
        school: "Ahlus Sunnah · Maturidiyah",
        position: "Melihat Allah di akhirat adalah haq bagi orang beriman, tanpa idrak (meliputi), tanpa batas, dan tanpa kaifiyah. Penglihatan itu diimani sebagaimana datangnya nash.",
        evidence: {
          arabic: "عَنْ جَرِيرِ بْنِ عَبْدِ اللَّهِ قَالَ: قَالَ النَّبِيُّ ﷺ: إِنَّكُمْ سَتَرَوْنَ رَبَّكُمْ كَمَا تَرَوْنَ هَذَا الْقَمَرَ، لَا تُضَامُّونَ فِي رُؤْيَتِهِ",
          translation: "Dari Jarir bin Abdillah, Nabi ﷺ bersabda: 'Sesungguhnya kalian akan melihat Tuhan kalian sebagaimana kalian melihat bulan ini, kalian tidak berdesak-desakan dalam melihatnya.' (Muttafaqun 'alaih)",
          notes: "Yang diserupakan adalah kejelasan penglihatan, bukan Dzat yang dilihat dengan bulan."
        },
        reasoning: "Ayat 'la tudrikuhul abshar' menafikan idrak, yaitu meliputi dan menjangkau batas, bukan menafikan penglihatan. Melihat sesuatu tidak mengharuskan meliputinya. Maka ayat itu tidak bertentangan dengan ayat dan hadits rukyah, justru menegaskan bahwa Allah dilihat tanpa diliputi.",
        source: "Kitab At-Tauhid (Al-Maturidi) · Syarh Al-'Aqa'id An-Nasafiyyah (At-Taftazani)"
      },
      {
        scholar: "Al-Mu'tazilah",
        scholarArabic: "الْمُعْتَزِلَةُ",
        school: "Mu'tazilah",
        position: "Melihat Allah mustahil, baik di dunia maupun di akhirat, karena penglihatan mengharuskan arah, warna, dan bentuk, yang semuanya sifat jisim.",
        evidence: {
          arabic: "لَّا تُدْرِكُهُ الْأَبْصَارُ وَهُوَ يُدْرِكُ الْأَبْصَارَ ۖ وَهُوَ اللَّطِيفُ الْخَبِيرُ",
          translation: "Dia tidak dapat dicapai oleh penglihatan mata, sedang Dia dapat melihat segala penglihatan itu, dan Dialah Yang Mahahalus lagi Maha Mengetahui. (Al-An'am: 103)",
          notes: "Mu'tazilah juga berdalil dengan jawaban Allah kepada Nabi Musa: 'lan tarani' (Al-A'raf: 143)."
        },
        reasoning: "Mu'tazilah memandang ayat ini sebagai pujian Allah atas Diri-Nya, sehingga kebalikannya (dapat dilihat) adalah kekurangan. Ayat Al-Qiyamah mereka takwilkan: 'nazhirah' bermakna 'muntazhirah', yaitu menunggu pahala dari Tuhannya. Ahlus Sunnah menjawab: permintaan Nabi Musa menunjukkan rukyah mungkin, sebab seorang nabi tidak meminta yang mustahil, dan Allah menggantungkannya pada tetapnya gunung, sesuatu yang mungkin.",
        source: "Syarh Al-Ushul Al-Khamsah (Al-Qadhi Abdul Jabbar) · Al-Mughni fi Abwab At-Tauhid"
      }
    ],
    notes: "Masalah ini termasuk pembeda utama antara Ahlus Sunnah dan Mu'tazilah. Al-Azhar mengajarkan aqidah dengan manhaj Asy'ari dan Maturidi, yang sepakat menetapkan rukyah tanpa tasybih. Di imtihan tauhid, pertanyaan yang sering muncul adalah dalil aqli rukyah (dalil al-wujud) dan jawaban atas dua ayat yang dipakai Mu'tazilah.",
    rangkuman: "Apakah orang beriman akan melihat Allah di akhirat? Ahlus Sunnah (Asy'ariyah dan Maturidiyah): ya, pasti, tapi tanpa bisa digambarkan bagaimana, tanpa arah, dan tanpa meliputi-Nya. Mu'tazilah: mustahil. Untuk imtihan, kuasai jawaban Ahlus Sunnah atas ayat 'la tudrikuhul abshar' (yang dinafikan adalah meliputi, bukan melihat) dan 'lan tarani' (Musa meminta sesuatu yang mungkin).",
  },

  {
    id: "riwayat-bil-makna",
    title: "Meriwayatkan Hadits dengan Makna",
    titleArabic: "رِوَايَةُ الْحَدِيثِ بِالْمَعْنَى",
    category: "hadits",
    question: "Bolehkah seorang perawi menyampaikan hadits dengan kata-katanya sendiri selama maknanya sama, atau wajib menyampaikan lafazh persis seperti yang ia dengar?",
    views: [
      {
        scholar: "Jumhur Muhadditsin, Fuqaha, dan Ushuliyyin",
        scholarArabic: "جُمْهُورُ الْمُحَدِّثِينَ وَالْفُقَهَاءِ وَالأُصُولِيِّينَ",
        school: "Mayoritas ulama",
        position: "Boleh meriwayatkan hadits dengan makna bagi orang yang menguasai bahasa Arab, memahami makna lafazh, dan mengetahui apa yang dapat mengubah makna. Tidak boleh pada lafazh yang bersifat ta'abbudi seperti dzikir dan bacaan tasyahhud.",
        evidence: {
          arabic: "أَوْ مِثْلَهُ، أَوْ نَحْوَهُ، أَوْ شَبِيهًا بِهِ",
          translation: "'Atau yang semisal itu, atau yang mirip dengannya, atau yang serupa dengannya.' (Ucapan Abdullah bin Mas'ud setelah meriwayatkan hadits dari Nabi ﷺ, diriwayatkan Ibnu Majah dalam Muqaddimah Sunan-nya)",
          notes: "Sahabat sekelas Ibnu Mas'ud menyadari bahwa yang ia sampaikan bisa jadi bukan lafazh persis Nabi ﷺ."
        },
        reasoning: "Para sahabat meriwayatkan satu kejadian dengan lafazh yang berbeda-beda, dan tidak ada yang mengingkarinya. Ini menunjukkan ijma' sahabat atas bolehnya riwayat bil makna. Tujuan syariat adalah sampainya makna, dan menjaga lafazh persis untuk semua hadits akan sangat memberatkan. Bila hadits boleh dijelaskan dalam bahasa lain, tentu lebih boleh disampaikan dengan lafazh Arab yang semakna.",
        source: "Al-Kifayah fi 'Ilm Ar-Riwayah (Al-Khathib Al-Baghdadi) · Muqaddimah Ibnu Ash-Shalah · Tadrib Ar-Rawi"
      },
      {
        scholar: "Muhammad bin Sirin dan sebagian ahli hadits",
        scholarArabic: "مُحَمَّدُ بْنُ سِيرِينَ وَطَائِفَةٌ مِنَ الْمُحَدِّثِينَ",
        school: "Sebagian Muhadditsin",
        position: "Tidak boleh meriwayatkan hadits kecuali dengan lafazh persis sebagaimana didengar. Perawi wajib menjaga lafazh Nabi ﷺ.",
        evidence: {
          arabic: "نَضَّرَ اللَّهُ امْرَأً سَمِعَ مِنَّا شَيْئًا فَبَلَّغَهُ كَمَا سَمِعَهُ، فَرُبَّ مُبَلَّغٍ أَوْعَى مِنْ سَامِعٍ",
          translation: "Semoga Allah memberi cahaya pada wajah orang yang mendengar sesuatu dari kami, lalu menyampaikannya sebagaimana ia mendengarnya. Betapa banyak orang yang disampaikan kepadanya lebih memahami daripada yang mendengar langsung. (HR. At-Tirmidzi, ia menilainya hasan shahih)",
          notes: "Frasa 'kama sami'ahu' (sebagaimana ia mendengarnya) dipahami sebagai perintah menjaga lafazh."
        },
        reasoning: "Lafazh Nabi ﷺ mengandung jawami' al-kalim, kalimat ringkas yang padat makna. Perawi bisa saja mengira dua lafazh semakna padahal tidak, sehingga mengganti lafazh berisiko mengubah hukum. Karena itu, menjaga lafazh adalah sikap paling hati-hati dalam menyampaikan agama.",
        source: "Al-Kifayah fi 'Ilm Ar-Riwayah · Al-Muhaddits Al-Fashil (Ar-Ramahurmuzi)"
      }
    ],
    notes: "Jumhur menjawab dalil kelompok kedua: 'kama sami'ahu' mencakup menyampaikan makna sebagaimana didengar, dan hadits itu sendiri diriwayatkan dengan beberapa lafazh berbeda. Ibnu Ash-Shalah menambahkan catatan penting: khilaf ini berlaku pada masa periwayatan lisan. Setelah hadits dibukukan, tidak seorang pun boleh mengubah lafazh yang ada dalam kitab-kitab hadits. Ini juga alasan para muhaddits memakai ungkapan 'au kama qal' setelah meriwayatkan hadits.",
    rangkuman: "Bolehkah meriwayatkan hadits dengan kata-kata sendiri? Mayoritas ulama: boleh, asal paham betul bahasa Arab dan maknanya, dan bukan lafazh dzikir atau bacaan ibadah. Ibnu Sirin dan sebagian ahli hadits: tidak boleh, harus lafazh persis. Sekarang hadits sudah dibukukan, jadi saat mengutip hadits, kutip lafazh dari kitabnya, dan kalau ragu tambahkan 'au kama qal'.",
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
