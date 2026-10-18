import React from 'react';

/* =========================================================================
   TALQEEH — IKON PIXEL ARENA IMTIHAN (gaya item Minecraft)
   Emoji bawaan perangkat tampil berbeda di tiap HP/OS dan tidak cocok dengan
   dunia voxel game. Ikon di sini digambar sebagai grid 12×12 lalu dirender
   menjadi SVG tajam (crispEdges), jadi tampil sama di semua perangkat.

   Cara menggambar: tiap baris = 12 karakter, '.' = transparan, huruf lain
   dipetakan ke warna lewat `pal`. Garis tepi gelap (k) memberi kesan item
   Minecraft. Panjang baris diperiksa saat modul dimuat (lihat assertIcons).
   ========================================================================= */

const K = '#1a1206'; // garis tepi umum

export const PIXEL_ICONS = {
  star: {
    pal: { k: '#3b2a05', y: '#facc15', o: '#d97706', w: '#fef9c3' },
    px: [
      '.....kk.....',
      '....kyyk....',
      '....kwyk....',
      'kkkkkyyokkkk',
      'kyywyyyyyook',
      '.kyyyyyyyok.',
      '..kyyyyyok..',
      '..kyyyyyok..',
      '.kyyyokyyok.',
      '.kyok..kyok.',
      'kyok....kok.',
      'kkk......kk.',
    ],
  },
  starEmpty: {
    pal: { k: '#0b0b0b', y: '#3f3f46', o: '#27272a', w: '#52525b' },
    px: null, // diisi dari star
  },
  heart: {
    pal: { k: '#1a0505', r: '#e11d48', w: '#fecdd3', d: '#9f1239' },
    px: [
      '............',
      '.kkk....kkk.',
      'krrrk..krrrk',
      'krwrrkkrrrrk',
      'krwrrrrrrrrk',
      'krrrrrrrrrdk',
      '.krrrrrrrdk.',
      '..krrrrrdk..',
      '...krrrdk...',
      '....krdk....',
      '.....kk.....',
      '............',
    ],
  },
  scroll: {
    pal: { k: '#3b2a10', p: '#fef3c7', s: '#fcd34d', l: '#a16207', r: '#dc2626' },
    px: [
      '............',
      '.kkkkkkkkkk.',
      'kspppppppssk',
      '.kpllllllpk.',
      '.kppppppppk.',
      '.kpllllllpk.',
      '.kppppppppk.',
      '.kpllllrrpk.',
      '.kpppprrrpk.',
      'kspppppppssk',
      '.kkkkkkkkkk.',
      '............',
    ],
  },
  chicken: {
    pal: { k: '#2a1405', b: '#b45309', o: '#f59e0b', w: '#fde68a', n: '#fef3c7' },
    px: [
      '......kkkk..',
      '.....kowwok.',
      '....kowwwbk.',
      '...kowwobbk.',
      '...kobbbbbk.',
      '...kobbbbk..',
      '..kkbbbbk...',
      '.knnkbbk....',
      'knnk.kk.....',
      'kknk........',
      '.kk.........',
      '............',
    ],
  },
  trophy: {
    pal: { k: '#3b2a05', y: '#facc15', o: '#b45309', w: '#fef9c3' },
    px: [
      '..kkkkkkkk..',
      'kkywwyyyyokk',
      'kykwyyyyyoyk',
      'kykyyyyyyoyk',
      '.kkyyyyyyokk',
      '..kyyyyyyok.',
      '...kyyyyok..',
      '....kyyok...',
      '.....kok....',
      '....kkokk...',
      '...kyyyyok..',
      '...kkkkkkk..',
    ],
  },
  sword: {
    pal: { k: '#111111', s: '#e5e7eb', g: '#9ca3af', h: '#78350f', y: '#facc15' },
    px: [
      '..........kk',
      '.........ksk',
      '........ksgk',
      '.......ksgk.',
      '......ksgk..',
      '.....ksgk...',
      '..kk.sgk....',
      '..kyksk.....',
      '...kyk......',
      '..khkyk.....',
      '.khk.kk.....',
      '.kk.........',
    ],
  },
  book: {
    pal: { k: '#1c1917', c: '#7c2d12', y: '#facc15', p: '#fef3c7', m: '#c084fc' },
    px: [
      '............',
      '.kkkkkkkkkk.',
      '.kccccccccck',
      '.kcyyyyyyyck',
      '.kccccccccck',
      '.kccmcccmcck',
      '.kccccccccck',
      '.kcmcccccmck',
      '.kccccccccck',
      '.kkkkkkkkkkk',
      '..kppppppppk',
      '...kkkkkkkk.',
    ],
  },
  potion: {
    pal: { k: '#111111', c: '#92400e', g: '#dbeafe', t: '#22c55e', d: '#15803d', w: '#f0fdf4' },
    px: [
      '....kkkk....',
      '....kcck....',
      '.....kk.....',
      '....kggk....',
      '...kggggk...',
      '..kgttttgk..',
      '.kgttwttttk.',
      '.kttttttttk.',
      '.kttttttttk.',
      '.kdttttttdk.',
      '..kddddddk..',
      '...kkkkkk...',
    ],
  },
  mug: {
    pal: { k: '#111111', w: '#e5e7eb', s: '#9ca3af', c: '#451a03', f: '#d6a36b', v: '#cbd5e1' },
    px: [
      '...v..v.....',
      '..v..v......',
      '.kkkkkkkk...',
      '.kffffffkkk.',
      '.kwccccwk.k.',
      '.kwwwwwwk.k.',
      '.kwwwwwwk.k.',
      '.kswwwwwkkk.',
      '.kswwwwwk...',
      '..kssssk....',
      '..kkkkkk....',
      '............',
    ],
  },
  shield: {
    pal: { k: '#0b1020', b: '#2563eb', l: '#60a5fa', y: '#facc15' },
    px: [
      '.kkkkkkkkkk.',
      'kyyyyyyyyyyk',
      'kyblllbbbbyk',
      'kyblbbbbbbyk',
      'kybbbbbbbbyk',
      'kybbbyybbbyk',
      '.kybbyybbyk.',
      '.kybbbbbbyk.',
      '..kybbbbyk..',
      '...kybbyk...',
      '....kyyk....',
      '.....kk.....',
    ],
  },
  bolt: {
    pal: { k: '#2a1a02', y: '#facc15', w: '#fef9c3' },
    px: [
      '.....kkkk...',
      '....kyywk...',
      '....kywk....',
      '...kywk.....',
      '..kyyykkkk..',
      '..kkkyyyyk..',
      '....kyyk....',
      '...kyyk.....',
      '..kyyk......',
      '..kyk.......',
      '.kyk........',
      '.kk.........',
    ],
  },
  fire: {
    pal: { k: '#2a0a02', r: '#dc2626', o: '#f97316', y: '#facc15', w: '#fef9c3' },
    px: [
      '.....kk.....',
      '....kok.....',
      '...koork....',
      '...korrok.k.',
      '..korrrrkok.',
      '..koryyrrok.',
      '.korryyyrrok',
      '.koryywyyrok',
      '.koyywwwyyok',
      '.koyywwwyyok',
      '..kooyyyook.',
      '...kkkkkkk..',
    ],
  },
  diamond: {
    pal: { k: '#062a33', c: '#22d3ee', l: '#cffafe', d: '#0e7490' },
    px: [
      '............',
      '...kkkkkk...',
      '..kllccccdk.',
      '.klccccccddk',
      'kkkkkkkkkkkk',
      '.kcclccccdk.',
      '..kcccccdk..',
      '...kcccdk...',
      '....kccdk...',
      '.....kdk....',
      '......k.....',
      '............',
    ],
  },
  chest: {
    pal: { k: '#1c0f05', b: '#92400e', l: '#b45309', d: '#5b2a06', y: '#facc15', g: '#a3a3a3' },
    px: [
      '............',
      '.kkkkkkkkkk.',
      'kllllllllllk',
      'kblllllllldk',
      'kbbbbbbbbbdk',
      'kkkkkyykkkkk',
      'kbbbkyykbbdk',
      'kblllkkllldk',
      'kbbbbbbbbbdk',
      'kbbbbbbbbbdk',
      'kddddddddddk',
      '.kkkkkkkkkk.',
    ],
  },
  bag: {
    pal: { k: '#1c0f05', b: '#a16207', l: '#ca8a04', d: '#713f12', s: '#78350f' },
    px: [
      '....kkkk....',
      '...ks..sk...',
      '...ks..sk...',
      '..kkkkkkkk..',
      '.kllllllllk.',
      'kllbbbbbbldk',
      'klbbkkkkbbdk',
      'kbbbkllkbbdk',
      'kbbbbbbbbbdk',
      'kbbbbbbbbbdk',
      '.kdddddddddk',
      '..kkkkkkkkk.',
    ],
  },
  map: {
    pal: { k: '#2a1a05', p: '#fde68a', s: '#eab308', g: '#16a34a', r: '#dc2626', b: '#3b82f6' },
    px: [
      '............',
      'kkkk.kkkk.kk',
      'kppkkpppkkpk',
      'kpggpspppbpk',
      'kpgppsrppbpk',
      'kppspprrppsk',
      'kpssppprpppk',
      'kppppgppppsk',
      'kpbpggpprppk',
      'kpbppppprrpk',
      'kkkkkkkkkkkk',
      '............',
    ],
  },
  home: {
    pal: { k: '#1a0f05', r: '#b91c1c', d: '#7f1d1d', w: '#d6d3d1', s: '#a8a29e', b: '#78350f', y: '#fde047' },
    px: [
      '.....kk.....',
      '....krrk....',
      '...krrrdk...',
      '..krrrrrdk..',
      '.krrrrrrrdk.',
      'kkkkkkkkkkkk',
      '.kwwwwwwwsk.',
      '.kwykwwbbsk.',
      '.kwkkwwbbsk.',
      '.kwwwwwbbsk.',
      '.kssssskbsk.',
      '.kkkkkkkkkk.',
    ],
  },
  retry: {
    pal: { k: '#052e16', g: '#22c55e', l: '#86efac' },
    px: [
      '...kkkkkk.k.',
      '..kgggggkkgk',
      '.kgkkkkkkggk',
      'kgk.....kggk',
      'kgk....kkkkk',
      'kgk.........',
      'kgk.......kk',
      'kgk......kgk',
      '.kgk....kgk.',
      '..kgkkkkgk..',
      '...kggggk...',
      '....kkkk....',
    ],
  },
  next: {
    pal: { k: '#1a1206', y: '#facc15', o: '#d97706', w: '#fef9c3' },
    px: [
      '.kk.........',
      '.kwkk.......',
      '.kwyykk.....',
      '.kyyyyykk...',
      '.kyyyyyyykk.',
      '.kyyyyyyyyok',
      '.kyyyyyyyyok',
      '.kyyyyyookk.',
      '.kyyyookk...',
      '.kyookk.....',
      '.kokk.......',
      '.kk.........',
    ],
  },
  check: {
    pal: { k: '#052e16', g: '#22c55e', l: '#86efac' },
    px: [
      '............',
      '..........kk',
      '.........klk',
      '........kgk.',
      '.......kgk..',
      'kk....kgk...',
      'klk..kgk....',
      '.kgkkgk.....',
      '..kggk......',
      '...kk.......',
      '............',
      '............',
    ],
  },
  cross: {
    pal: { k: '#2a0505', r: '#ef4444', l: '#fca5a5' },
    px: [
      '............',
      '.kk......kk.',
      'klrk....krrk',
      '.krrk..krrk.',
      '..krrkkrrk..',
      '...krrrrk...',
      '...krrrrk...',
      '..krrkkrrk..',
      '.krrk..krrk.',
      'krrk....krrk',
      '.kk......kk.',
      '............',
    ],
  },
  exp: {
    pal: { k: '#0a2a05', g: '#84cc16', l: '#d9f99d', d: '#4d7c0f', y: '#fde047' },
    px: [
      '............',
      '....kkkk....',
      '...kllggk...',
      '..klyggggk..',
      '.klgggggddk.',
      '.kgggggggdk.',
      '.kggggggddk.',
      '.kgggggdddk.',
      '..kggdddk...',
      '...kkkkk....',
      '............',
      '............',
    ],
  },
  hourglass: {
    pal: { k: '#1c1917', w: '#a16207', s: '#fde68a', g: '#e0f2fe' },
    px: [
      'kkkkkkkkkkkk',
      'kwwwwwwwwwwk',
      '.kgssssssgk.',
      '..kgssssgk..',
      '...kgssgk...',
      '....kssk....',
      '....kgsk....',
      '...kgggsk...',
      '..kgggsssk..',
      '.kgsssssssk.',
      'kwwwwwwwwwwk',
      'kkkkkkkkkkkk',
    ],
  },
  target: {
    pal: { k: '#2a0505', r: '#dc2626', w: '#f5f5f4', y: '#facc15' },
    px: [
      '...kkkkkk...',
      '..krrrrrrk..',
      '.krwwwwwwrk.',
      'krwrrrrrrwrk',
      'krwrwwwwrwrk',
      'krwrwyywrwrk',
      'krwrwyywrwrk',
      'krwrwwwwrwrk',
      'krwrrrrrrwrk',
      '.krwwwwwwrk.',
      '..krrrrrrk..',
      '...kkkkkk...',
    ],
  },
  crown: {
    pal: { k: '#3b2a05', y: '#facc15', o: '#d97706', r: '#dc2626', b: '#3b82f6' },
    px: [
      '............',
      '............',
      'k....kk....k',
      'kyk.kyyk.kyk',
      'kyykyyyykyyk',
      'kyyyyyyyyyyk',
      'kyryybyyryyk',
      'kyyyyyyyyyyk',
      'kooooooooook',
      'kkkkkkkkkkkk',
      '............',
      '............',
    ],
  },
  lock: {
    pal: { k: '#111111', g: '#a3a3a3', l: '#d4d4d4', y: '#facc15', o: '#a16207' },
    px: [
      '...kkkkkk...',
      '..kgllllgk..',
      '..kgk..kgk..',
      '..kgk..kgk..',
      '.kkkkkkkkkk.',
      '.kyyyyyyyok.',
      '.kyyykkyyok.',
      '.kyyykkyyok.',
      '.kyyyykyyok.',
      '.kyyyyyyyok.',
      '.koooooooook',
      '..kkkkkkkkk.',
    ],
  },
  torch: {
    pal: { k: '#1c0f05', b: '#92400e', y: '#facc15', o: '#f97316', w: '#fef9c3' },
    px: [
      '.....kk.....',
      '....kyok....',
      '...kywyok...',
      '...kwwyok...',
      '....kyyk....',
      '....kbbk....',
      '....kbbk....',
      '....kbbk....',
      '....kbbk....',
      '....kbbk....',
      '....kbbk....',
      '.....kk.....',
    ],
  },
  speech: {
    pal: { k: '#111111', w: '#f5f5f4', s: '#d6d3d1', d: '#57534e' },
    px: [
      '............',
      '.kkkkkkkkkk.',
      'kwwwwwwwwwsk',
      'kwdwdwdwdwsk',
      'kwwwwwwwwwsk',
      'kwdwdwdwwwsk',
      'kwwwwwwwwwsk',
      '.kkkwwsskkk.',
      '...kwsk.....',
      '...ksk......',
      '...kk.......',
      '............',
    ],
  },
  gate: {
    pal: { k: '#1c1917', s: '#a8a29e', d: '#78716c', l: '#d6d3d1', b: '#57534e', y: '#facc15' },
    px: [
      'k.k.kkkk.k.k',
      'kskskllkskks',
      'ksssssssssdk',
      'kslsssssslsk',
      'kssskkkkssdk',
      'ksskbbbbksdk',
      'kslkbbbbklsk',
      'ksskbbybksdk',
      'ksskbbbbksdk',
      'kdskbbbbkddk',
      'kddkbbbbkddk',
      'kkkkkkkkkkkk',
    ],
  },
  moon: {
    pal: { k: '#2a2005', y: '#fde047', o: '#ca8a04' },
    px: [
      '...kkkkk....',
      '.kkyyyykk...',
      'kyyyykk.....',
      'kyyyk.......',
      'kyyk........',
      'kyok........',
      'kyok........',
      'kyyok.......',
      'kyyyokk.....',
      '.kkyyyokk...',
      '...kkkkk....',
      '............',
    ],
  },
  rain: {
    pal: { k: '#1f2937', w: '#f3f4f6', s: '#9ca3af', b: '#60a5fa' },
    px: [
      '............',
      '....kkkk....',
      '..kkwwwwk...',
      '.kwwwwwwwkk.',
      'kwwwwwwwwwwk',
      'kssssssssssk',
      '.kkkkkkkkkk.',
      '..b...b...b.',
      '.b...b...b..',
      '...b...b....',
      '..b...b.....',
      '............',
    ],
  },
  sparkle: {
    pal: { k: '#3b2a05', y: '#facc15', w: '#fef9c3' },
    px: [
      '.....k......',
      '....kyk.....',
      '....kyk.....',
      '...kywyk....',
      '.kkywwwykk..',
      'kyywwwwwyyk.',
      '.kkywwwykk..',
      '...kywyk....',
      '....kyk.....',
      '....kyk...k.',
      '.....k...kyk',
      '..........k.',
    ],
  },
  gift: {
    pal: { k: '#1a0505', r: '#dc2626', d: '#991b1b', y: '#facc15' },
    px: [
      '...kk..kk...',
      '..kyykkyyk..',
      '...kkyykk...',
      'kkkkkyykkkkk',
      'krrrryyrrrrk',
      'kkkkkyykkkkk',
      '.krrryyrrrk.',
      '.krrryyrrrk.',
      '.krrryyrrrk.',
      '.kdddyydddk.',
      '.kkkkkkkkkk.',
      '............',
    ],
  },
  pickaxe: {
    pal: { k: '#111111', l: '#a5f3fc', c: '#22d3ee', b: '#92400e' },
    px: [
      '..kkkkkk....',
      '.kllcccckk..',
      '..kkkkbkcck.',
      '.....kbk.kck',
      '....kbk...kk',
      '...kbk......',
      '..kbk.......',
      '.kbk........',
      'kbk.........',
      'kk..........',
      '............',
      '............',
    ],
  },
  gamepad: {
    pal: { k: '#111111', g: '#9ca3af', d: '#374151', r: '#ef4444' },
    px: [
      '............',
      '............',
      '.kkkkkkkkkk.',
      'kggggggggggk',
      'kgdgggggrggk',
      'kdddggggggrk',
      'kgdggggrgggk',
      'kggkkkkkkggk',
      'kggk....kggk',
      '.kk......kk.',
      '............',
      '............',
    ],
  },
  film: {
    pal: { k: '#111111', w: '#f5f5f4', d: '#3f3f46' },
    px: [
      '............',
      'kkkkkkkkkkk.',
      'kwkwkwkwkwk.',
      'kkkkkkkkkkk.',
      'kdddddddddk.',
      'kdwwwwwwwdk.',
      'kdwdddddwdk.',
      'kdwwwwwwwdk.',
      'kdddddddddk.',
      'kkkkkkkkkkk.',
      '............',
      '............',
    ],
  },
  note: {
    pal: { k: '#111111', y: '#4ade80', w: '#dcfce7', o: '#16a34a' },
    px: [
      '.....kkkkk..',
      '.....kwyyk..',
      '.....kykkk..',
      '.....kyk....',
      '.....kyk....',
      '.....kyk....',
      '..kkkkyk....',
      '.kyyyyyk....',
      'kyyyyyyk....',
      'kyyyyyok....',
      '.kyyook.....',
      '..kkkk......',
    ],
  },
  mute: {
    pal: { k: '#111111', y: '#9ca3af', w: '#e5e7eb', o: '#6b7280', r: '#ef4444' },
    px: [
      '.....kkkkk..',
      '.....kwyyk..',
      '.....kykkk..',
      '.....kyk....',
      '.....kyk....',
      '.....kyk....',
      '..kkkkyk....',
      '.kyyyyyk.r.r',
      'kyyyyyyk..r.',
      'kyyyyyok.r.r',
      '.kyyook.....',
      '..kkkk......',
    ],
  },
  boots: {
    pal: { k: '#1c0f05', b: '#92400e', d: '#451a03' },
    px: [
      '............',
      '...kkkk.....',
      '...kbbk.....',
      '...kbbk.....',
      '...kbbk.....',
      '...kbbk.....',
      '...kbbkkkk..',
      '...kbbbbbbk.',
      '..kbbbbbbbbk',
      '..kddddddddk',
      '..kkkkkkkkkk',
      '............',
    ],
  },
  pin: {
    pal: { k: '#1a0505', r: '#dc2626', w: '#fecaca' },
    px: [
      '....kkkk....',
      '...krrrrk...',
      '..krrwwrrk..',
      '..krwwwwrk..',
      '..krrwwrrk..',
      '..krrrrrrk..',
      '...krrrrk...',
      '...krrrrk...',
      '....krrk....',
      '....krrk....',
      '.....kk.....',
      '............',
    ],
  },
  bulb: {
    pal: { k: '#2a2005', y: '#fde047', w: '#fefce8', g: '#a3a3a3', d: '#525252' },
    px: [
      '....kkkk....',
      '...kyyyyk...',
      '..kywwyyyk..',
      '..kywyyyyk..',
      '..kyyyyyyk..',
      '..kyyyyyyk..',
      '...kyyyyk...',
      '....kyyk....',
      '....kggk....',
      '....kddk....',
      '....kggk....',
      '.....kk.....',
    ],
  },
  search: {
    pal: { k: '#111111', g: '#bae6fd', w: '#f0f9ff', b: '#92400e' },
    px: [
      '..kkkk......',
      '.kwwggk.....',
      'kwgggggk....',
      'kgggggggk...',
      'kgggggggk...',
      '.kgggggk....',
      '..kkkkkbk...',
      '.......kbk..',
      '........kbk.',
      '.........kbk',
      '..........kk',
      '............',
    ],
  },
  quill: {
    pal: { k: '#111111', w: '#f5f5f4', s: '#a8a29e', b: '#1e3a8a' },
    px: [
      '.........kk.',
      '........kwwk',
      '.......kwwsk',
      '......kwwsk.',
      '.....kwwsk..',
      '....kwwsk...',
      '...kwwsk....',
      '..kwssk.....',
      '..kssk......',
      '.kbkk.......',
      'kbk.........',
      'kk..........',
    ],
  },
  scale: {
    pal: { k: '#2a2005', y: '#facc15' },
    px: [
      '.....kk.....',
      'kkkkkyykkkkk',
      '.k...yy...k.',
      '.k...yy...k.',
      'kyk..yy..kyk',
      'yyyk.yy.kyyy',
      'kkkk.yy.kkkk',
      '.....yy.....',
      '.....yy.....',
      '...kkyykk...',
      '..kyyyyyyk..',
      '..kkkkkkkk..',
    ],
  },
  warning: {
    pal: { k: '#2a2005', y: '#facc15' },
    px: [
      '.....kk.....',
      '....kyyk....',
      '....kyyk....',
      '...kykkyk...',
      '...kykkyk...',
      '..kyykkyyk..',
      '..kyykkyyk..',
      '.kyyyyyyyyk.',
      '.kyyykkyyyk.',
      'kyyyykkyyyyk',
      'kyyyyyyyyyyk',
      'kkkkkkkkkkkk',
    ],
  },
  eye: {
    pal: { k: '#111111', w: '#f5f5f4', b: '#2563eb' },
    px: [
      '............',
      '............',
      '...kkkkkk...',
      '.kkwwwwwwkk.',
      'kwwwkbbkwwwk',
      'kwwkbbbbkwwk',
      'kwwkbbbbkwwk',
      'kwwwkbbkwwwk',
      '.kkwwwwwwkk.',
      '...kkkkkk...',
      '............',
      '............',
    ],
  },
  boom: {
    pal: { k: '#2a0a02', y: '#facc15', w: '#fef9c3', r: '#ef4444' },
    px: [
      '.k...kk...k.',
      '.kk.kyyk.kk.',
      '..kkyyyykk..',
      '.kkyywwyykk.',
      'kyyywwwwyyyk',
      '.kyywwwwyyk.',
      '.kryywwyyrk.',
      'krryyyyyyrrk',
      '.kkrryyrrkk.',
      '..kkrrrrkk..',
      '.kk.kkkk.kk.',
      '.k........k.',
    ],
  },
  heartBroken: {
    pal: { k: '#1a0505', r: '#9f1239', w: '#fda4af', d: '#4c0519' },
    px: [
      '............',
      '.kkk....kkk.',
      'krrrk..krrrk',
      'krwrrkkkrrrk',
      'krwrrrkrrrrk',
      'krrrrkrrrrdk',
      '.krrrrkrrdk.',
      '..krrkrrdk..',
      '...krkrdk...',
      '....kkdk....',
      '.....kk.....',
      '............',
    ],
  },
  medal: {
    pal: { k: '#2a2005', b: '#2563eb', r: '#dc2626', y: '#facc15', o: '#b45309', w: '#fef9c3' },
    px: [
      '..kk....kk..',
      '..kbk..krk..',
      '...kbkkrk...',
      '....kbrk....',
      '...kkkkkk...',
      '..kyyyyyyk..',
      '.kyywyyyyok.',
      '.kywyyyyyok.',
      '.kyyyyyyyok.',
      '..kyyyyyok..',
      '...kkkkkk...',
      '............',
    ],
  },
};
PIXEL_ICONS.starEmpty.px = PIXEL_ICONS.star.px;

// Lepaskan ikon yang barisnya tidak 12 karakter (salah gambar) daripada merusak tata letak.
const assertIcons = () => {
  for (const [name, icon] of Object.entries(PIXEL_ICONS)) {
    if (!icon.px || icon.px.length !== 12 || icon.px.some(r => r.length !== 12)) {
      console.warn(`[pixel-icons] ikon "${name}" tidak 12×12`);
    }
  }
};
assertIcons();

// Baris → <rect> per deret warna yang sama (lebih sedikit elemen daripada 1 rect per piksel).
const renderRects = (icon) => {
  const rects = [];
  icon.px.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === '.') { x++; continue; }
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={end - x} height={1} fill={icon.pal[ch] || K} />);
      x = end;
    }
  });
  return rects;
};
const RECT_CACHE = {};

export const EMOJI_TO_PIXEL = {
  '⚔️': 'sword', '⚔': 'sword', '⚡': 'bolt', '🔥': 'fire', '👑': 'crown', '✦': 'sparkle', '✨': 'sparkle', '💥': 'boom',
  '💢': 'boom', '🛡️': 'shield', '🛡': 'shield', '💔': 'heartBroken', '🗺️': 'map', '🗺': 'map', '🎯': 'target', '📝': 'quill',
  '🏆': 'trophy', '⭐': 'star', '🌟': 'star', '🎖️': 'medal', '🎖': 'medal', '🔒': 'lock', '✅': 'check', '❌': 'cross',
  '🌙': 'moon', '🌧️': 'rain', '🌧': 'rain', '📦': 'chest', '🎁': 'gift', '📜': 'scroll', '⏳': 'hourglass', '📍': 'pin',
  '💡': 'bulb', '💬': 'speech', '⛏️': 'pickaxe', '⛏': 'pickaxe', '👾': 'gamepad', '🎬': 'film', '🔊': 'note', '🔇': 'mute',
  '⚠️': 'warning', '⚠': 'warning', '📖': 'book', '📘': 'book', '📚': 'book', '🎒': 'bag', '☕': 'mug', '🍵': 'potion',
  '🏃': 'boots', '🏰': 'gate', '🏛️': 'gate', '🏛': 'gate', '🚪': 'gate', '🍗': 'chicken', '🍽️': 'chicken', '👁️': 'eye',
  '👁': 'eye', '💤': 'heartBroken', '🔍': 'search', '✍️': 'quill', '✍': 'quill', '⚖️': 'scale', '⚖': 'scale', '❤️': 'heart',
  '❤': 'heart', '🧠': 'torch', '💎': 'diamond', '😡': 'boom', '🏠': 'home', '🔄': 'retry', '🎓': 'scroll', '🔰': 'scroll',
  '🗝️': 'gate', '🗝': 'gate', '🎮': 'gamepad', '😵‍💫': 'heartBroken', '💦': 'heartBroken', '🍀': 'sparkle', '🌿': 'sparkle',
  '👳‍♂️': 'book', '👓': 'book', '🧐': 'search', '🚀': 'bolt', '🏅': 'medal', '🕌': 'gate', '🌌': 'moon', '⌛': 'hourglass',
};
const EMOJI_KEYS = Object.keys(EMOJI_TO_PIXEL).sort((a, b) => b.length - a.length);

/* Teks yang diawali emoji (dialog, toast, label) → ikon pixel + teks. Emoji lain di dalam teks dibuang supaya
   tidak muncul emoji bawaan perangkat di tengah UI game. */
export function stripEmoji(text) {
  return String(text ?? '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{FE0F}\u{200D}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
export function IconText({ text, iconClassName = 'w-[1.15em] h-[1.15em]', className = '' }) {
  const str = String(text ?? '').trimStart();
  const key = EMOJI_KEYS.find(k => str.startsWith(k));
  const rest = stripEmoji(key ? str.slice(key.length) : str);
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {key && <PixelIcon name={EMOJI_TO_PIXEL[key]} className={iconClassName} />}
      <span>{rest}</span>
    </span>
  );
}

/* Ikon dari emoji pertama yang dikenali di dalam teks (mis. reaksi "🗝️💥"); kosong bila tidak ada. */
export function EmojiIcon({ text, className = 'w-[1.15em] h-[1.15em]' }) {
  const str = String(text ?? '');
  let best = null;
  for (const k of EMOJI_KEYS) {
    const at = str.indexOf(k);
    if (at >= 0 && (best === null || at < best.at)) best = { at, k };
  }
  return best ? <PixelIcon name={EMOJI_TO_PIXEL[best.k]} className={className} /> : null;
}

/* <PixelIcon name="star" className="w-6 h-6" /> — ukuran diatur lewat className (default 1em). */
export function PixelIcon({ name, className = '', title, style }) {
  const icon = PIXEL_ICONS[name];
  if (!icon?.px) return null;
  if (!RECT_CACHE[name]) RECT_CACHE[name] = renderRects(icon);
  return (
    <svg
      viewBox="0 0 12 12"
      shapeRendering="crispEdges"
      className={`inline-block shrink-0 ${className || 'w-[1em] h-[1em]'}`}
      style={{ imageRendering: 'pixelated', ...style }}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {RECT_CACHE[name]}
    </svg>
  );
}

/* Slot inventori ala Minecraft: kotak abu bertepi timbul berisi ikon + jumlah di pojok. */
export function ItemSlot({ icon, count, label, className = '', tone = 'stone' }) {
  const tones = {
    stone: 'bg-[#8b8b8b] border-t-[#373737] border-l-[#373737] border-b-[#ffffff] border-r-[#ffffff]',
    dark: 'bg-[#2b2b2e] border-t-[#111] border-l-[#111] border-b-[#555] border-r-[#555]',
  };
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div className={`relative w-14 h-14 sm:w-16 sm:h-16 border-[3px] ${tones[tone] || tones.stone} flex items-center justify-center`}>
        <PixelIcon name={icon} className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-[2px_2px_0_rgba(0,0,0,0.45)]" />
        {count != null && (
          <span className="absolute bottom-0 right-1 font-mono font-black text-sm sm:text-base text-white leading-none" style={{ textShadow: '2px 2px 0 #3f3f3f' }}>
            {count}
          </span>
        )}
      </div>
      {label && <span className="font-mono text-[10px] sm:text-[11px] text-white/75 text-center leading-tight">{label}</span>}
    </div>
  );
}
