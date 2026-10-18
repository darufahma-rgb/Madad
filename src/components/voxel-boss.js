/* =========================================================================
   TALQEEH — RENDERER VOXEL FINAL BOSS (gaya karakter Minecraft)

   PNG boss di /assets adalah satu gambar yang sama untuk semua maddah. File ini
   menggambar tiga final boss yang berbeda sebagai model voxel: karakter disusun
   dari kotak (kepala 8×8×8, badan, lengan, jubah, serban, janggut, barang bawaan)
   yang tiap sisinya diberi tekstur pixel, lalu diproyeksikan 3/4 (depan + sisi kiri
   + atas, dengan bayangan per sisi) ke <canvas> dan disimpan sebagai data URL.
   Dihitung sekali per (boss, kena-serang) lalu di-cache.

   Koordinat: x ke kanan, y ke atas, z ke arah penonton. 1 unit = 1 pixel Minecraft.
   ========================================================================= */

const SHADE = { front: 1, left: 0.74, top: 1.18 };
const YAW = (28 * Math.PI) / 180;
const TILT = 0.32; // seberapa banyak sisi atas terlihat
const SCALE = 7;   // pixel layar per unit voxel

const hexToRgb = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const shadeColor = (hex, f) => {
  const [r, g, b] = hexToRgb(hex);
  const c = (v) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${c(r)},${c(g)},${c(b)})`;
};

// Variasi kecil per pixel supaya permukaan tidak datar (gaya tekstur Minecraft), deterministik.
const noise = (a, b, c) => {
  const v = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453;
  return 0.94 + (v - Math.floor(v)) * 0.1;
};

const project = (x, y, z) => {
  const xr = x * Math.cos(YAW) + z * Math.sin(YAW);
  const zr = -x * Math.sin(YAW) + z * Math.cos(YAW);
  return { sx: xr, sy: -y + zr * TILT, depth: zr };
};

/* Kotak: { x:[x0,x1], y:[y0,y1], z:[z0,z1], color, front?, left?, top? }
   front/left/top: fungsi (u, v) => warna hex | null, u kiri→kanan, v bawah→atas pada sisi itu. */
const collectQuads = (boxes) => {
  const quads = [];
  for (const b of boxes) {
    const [x0, x1] = b.x, [y0, y1] = b.y, [z0, z1] = b.z;
    const pick = (fn, u, v) => (fn ? fn(u, v) : b.color);
    // Depan (z = z1)
    for (let x = x0; x < x1; x++) for (let y = y0; y < y1; y++) {
      const col = pick(b.front, x - x0, y - y0);
      if (col) quads.push({ pts: [[x, y, z1], [x + 1, y, z1], [x + 1, y + 1, z1], [x, y + 1, z1]], col, shade: SHADE.front, c: [x + 0.5, y + 0.5, z1] });
    }
    // Kiri (x = x0), u dari belakang (z1) ke depan? — dari kiri penonton: z0 → z1
    for (let z = z0; z < z1; z++) for (let y = y0; y < y1; y++) {
      const col = pick(b.left, z - z0, y - y0);
      if (col) quads.push({ pts: [[x0, y, z], [x0, y, z + 1], [x0, y + 1, z + 1], [x0, y + 1, z]], col, shade: SHADE.left, c: [x0, y + 0.5, z + 0.5] });
    }
    // Atas (y = y1)
    for (let x = x0; x < x1; x++) for (let z = z0; z < z1; z++) {
      const col = pick(b.top, x - x0, z - z0);
      if (col) quads.push({ pts: [[x, y1, z], [x + 1, y1, z], [x + 1, y1, z + 1], [x, y1, z + 1]], col, shade: SHADE.top, c: [x + 0.5, y1, z + 0.5] });
    }
  }
  return quads;
};

const renderBoxes = (boxes, { hurt = false } = {}) => {
  const quads = collectQuads(boxes);
  for (const q of quads) {
    q.p = q.pts.map(([x, y, z]) => project(x, y, z));
    const cc = project(...q.c);
    // Urutan gambar: jauh dulu. Sisi atas sedikit didahulukan dari sisi tegak di kedalaman yang sama.
    q.d = cc.depth + q.c[1] * 0.001;
  }
  quads.sort((a, b) => a.d - b.d);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const q of quads) for (const p of q.p) {
    minX = Math.min(minX, p.sx); maxX = Math.max(maxX, p.sx);
    minY = Math.min(minY, p.sy); maxY = Math.max(maxY, p.sy);
  }
  const pad = 4;
  const w = Math.ceil((maxX - minX) * SCALE) + pad * 2;
  const h = Math.ceil((maxY - minY) * SCALE) + pad * 2;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d');
  for (const q of quads) {
    const [cx, cy, cz] = q.c;
    let f = q.shade * noise(Math.floor(cx * 2), Math.floor(cy * 2), Math.floor(cz * 2));
    g.fillStyle = shadeColor(q.col, f);
    g.beginPath();
    q.p.forEach((p, i) => {
      const X = (p.sx - minX) * SCALE + pad, Y = (p.sy - minY) * SCALE + pad;
      if (i === 0) g.moveTo(X, Y); else g.lineTo(X, Y);
    });
    g.closePath();
    g.fill();
    // Garis tipis senada menutup celah antarpoligon (anti-aliasing) supaya tidak muncul jaring putih.
    g.strokeStyle = g.fillStyle;
    g.lineWidth = 0.6;
    g.stroke();
  }
  if (hurt) {
    // Kilatan merah ala Minecraft saat terkena serangan.
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = 'rgba(255, 60, 60, 0.2)';
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'source-over';
  }
  // Proyeksi di atas memperlihatkan sisi kiri model, jadi badan serong ke kanan layar. Final boss selalu berdiri
  // di kanan arena menghadap Thalib di kiri, jadi hasilnya dicerminkan supaya menghadap ke kiri.
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const o = out.getContext('2d');
  o.translate(w, 0);
  o.scale(-1, 1);
  o.drawImage(canvas, 0, 0);
  return out.toDataURL('image/png');
};

/* ── Bagian tubuh bersama ── */
const map = (rows, pal) => (u, v) => {
  const row = rows[rows.length - 1 - v];
  const ch = row ? row[u] : undefined;
  if (!ch || ch === '.') return null;
  return pal[ch];
};

const scholar = (o) => {
  const skin = o.skin || '#c98b5e';
  const beardPal = { s: skin, b: o.beard, w: '#f8fafc', p: '#1c1917', e: o.brow || '#3f3f46', n: o.nose || '#a8714a', m: '#7f1d1d', x: '#1c1917' };
  const face = o.hurt
    ? ['ssssssss', 'ssssssss', 'seessees', 'sxxssxxs', 'ssssssss', 'sssnnsss', 'sbbmmbbs', 'bbbbbbbb']
    : ['ssssssss', 'ssssssss', 'seessees', 'swpsspws', 'ssssssss', 'sssnnsss', 'sbbbbbbs', 'bbbbbbbb'];
  const robe = o.robe, robeDark = o.robeDark, trim = o.trim;
  const boxes = [];
  // Sepatu
  boxes.push({ x: [-4, -1], y: [0, 1], z: [3, 4], color: '#3b2314' }, { x: [1, 4], y: [0, 1], z: [3, 4], color: '#3b2314' });
  // Jubah bawah (melebar) dengan lis tengah & kelim
  boxes.push({
    x: [-5, 5], y: [0, 14], z: [-3, 3], color: robe,
    front: (u, v) => (v < 2 ? robeDark : (u === 4 || u === 5) ? trim : robe),
    left: (u, v) => (v < 2 ? robeDark : robe),
  });
  // Badan
  boxes.push({
    x: [-4, 4], y: [14, 26], z: [-2, 2], color: robe,
    front: (u, v) => {
      if (v < 2) return o.sash;                       // sabuk
      if (v >= 9 && Math.abs(u - 3.5) <= (v - 8) * 0.9) return o.collar; // kerah V
      if (u === 3 || u === 4) return trim;
      return robe;
    },
    left: (u, v) => (v < 2 ? o.sash : robe),
    top: () => robe,
  });
  // Lengan (lengan baju + tangan kulit di bawah)
  const arm = (x0, x1, z0, z1) => ({ x: [x0, x1], y: [14, 26], z: [z0, z1], color: robe, front: (u, v) => (v < 3 ? skin : v === 3 ? trim : robe), left: (u, v) => (v < 3 ? skin : v === 3 ? trim : robe), top: () => robe });
  boxes.push(arm(-8, -4, -2, 2), arm(4, 8, -2, 2));
  // Kepala
  boxes.push({
    x: [-4, 4], y: [26, 34], z: [-4, 4], color: skin,
    front: map(face, beardPal),
    left: (u, v) => (v <= 1 && u >= 5 ? o.beard : skin),
    top: () => o.turban,
  });
  // Janggut menjuntai di depan dada
  boxes.push({ x: [-3, 3], y: [o.longBeard ? 20 : 23, 27], z: [4, 5], color: o.beard, front: (u, v) => (v === 0 && (u === 0 || u === 5) ? null : o.beard) });
  // Serban/imamah melingkar
  boxes.push({
    x: [-5, 5], y: [31, 35], z: [-5, 5], color: o.turban,
    front: (u, v) => ((u + v) % 3 === 0 ? o.turbanShade : o.turban),
    left: (u, v) => ((u + v) % 3 === 0 ? o.turbanShade : o.turban),
    top: (u, v) => ((u + v) % 4 === 0 ? o.turbanShade : o.turban),
  });
  // Kopiah / tarbusy di atas serban
  boxes.push({ x: [-3, 3], y: [35, 38], z: [-3, 3], color: o.cap, top: (u, v) => (u === 2 && v === 2 && o.tassel ? o.tassel : o.cap) });
  if (o.tail) boxes.push({ x: [-5, -4], y: [24, 33], z: [-4, -1], color: o.turbanShade }); // ekor imamah
  return boxes;
};

/* ── Tiga final boss ── */
const BOSSES = {
  // Balaghah: Syaikhul Bayan — jubah zamrud, serban putih, kitab Al-Bayan bersayap emas.
  'balaghah-majaz': (hurt) => {
    const boxes = scholar({
      hurt, robe: '#0f6b4a', robeDark: '#084430', trim: '#f4c430', sash: '#c99a1a', collar: '#f1f5f9',
      beard: '#e7e5e4', turban: '#f8fafc', turbanShade: '#d6d3d1', cap: '#0f6b4a', tassel: '#f4c430',
    });
    // Kitab hijau terbuka di depan dada, dipegang dua tangan
    boxes.push({
      x: [-5, 5], y: [15, 23], z: [5, 7], color: '#14532d',
      front: (u, v) => {
        if (u === 0 || u === 9 || v === 0 || v === 7) return '#f4c430';
        if (u === 4 || u === 5) return '#7c5a0a';
        if ((u === 2 || u === 7) && (v === 3 || v === 4)) return '#86efac'; // permata mata majaz
        return '#166534';
      },
      top: (u) => (u === 4 || u === 5 ? '#7c5a0a' : '#fef3c7'),
      left: () => '#fef3c7',
    });
    // Sayap emas kecil di kedua sisi kitab
    boxes.push({ x: [-9, -5], y: [19, 22], z: [5, 6], color: '#fbbf24', front: (u, v) => (v === 2 || u === 0 ? '#fde68a' : '#f59e0b') });
    boxes.push({ x: [5, 9], y: [19, 22], z: [5, 6], color: '#fbbf24', front: (u, v) => (v === 2 || u === 3 ? '#fde68a' : '#f59e0b') });
    return renderBoxes(boxes, { hurt });
  },

  // Nahwu: Syaikhul Nahwu — jubah biru, tarbusy merah, tongkat berkristal petir.
  'nahwu-fail': (hurt) => {
    const boxes = scholar({
      hurt, robe: '#1e3a8a', robeDark: '#172554', trim: '#38bdf8', sash: '#0ea5e9', collar: '#e0f2fe',
      beard: '#9ca3af', brow: '#4b5563', turban: '#f8fafc', turbanShade: '#cbd5e1', cap: '#b91c1c', tassel: '#111827',
    });
    // Tongkat di tangan kanan penonton (kanan karakter), dari lantai melewati kepala
    boxes.push({ x: [8, 9], y: [1, 38], z: [1, 2], color: '#7c4a1e', front: (u, v) => (v % 6 === 0 ? '#5b3412' : '#7c4a1e') });
    // Kristal petir di ujung tongkat
    boxes.push({ x: [7, 10], y: [38, 42], z: [0, 3], color: '#38bdf8', front: (u, v) => (u === 1 && v >= 1 ? '#e0f2fe' : '#38bdf8'), top: () => '#7dd3fc' });
    boxes.push({ x: [8, 9], y: [42, 44], z: [1, 2], color: '#e0f2fe' });
    // Gulungan Alfiyah di tangan kiri
    boxes.push({ x: [-9, -6], y: [13, 20], z: [2, 4], color: '#fef3c7', front: (u, v) => (v === 0 || v === 6 ? '#b45309' : v === 3 ? '#dc2626' : '#fef3c7') });
    return renderBoxes(boxes, { hurt });
  },

  // Ushul: Syaikhul Ushul (Al-Qadhi) — jubah emas-cokelat, imamah hitam berekor, timbangan Mizan.
  'ushul-amr': (hurt) => {
    const boxes = scholar({
      hurt, robe: '#7c4a12', robeDark: '#4a2a08', trim: '#facc15', sash: '#facc15', collar: '#fef9c3',
      beard: '#f5f5f4', turban: '#1f2937', turbanShade: '#111827', cap: '#f8fafc', longBeard: true, tail: true,
    });
    // Timbangan Mizan di depan (tiang + lengan + dua piring)
    // Dipegang setinggi pinggang supaya tidak menutupi janggut.
    boxes.push({ x: [-1, 1], y: [6, 19], z: [6, 7], color: '#d4a017', front: (u, v) => (v % 4 === 0 ? '#facc15' : '#b8860b') });
    boxes.push({ x: [-8, 8], y: [18, 19], z: [6, 7], color: '#facc15' });
    boxes.push({ x: [-1, 1], y: [19, 20], z: [6, 7], color: '#fde047' });
    // Tali & piring kiri/kanan
    boxes.push({ x: [-7, -6], y: [13, 18], z: [6, 7], color: '#a16207' }, { x: [6, 7], y: [13, 18], z: [6, 7], color: '#a16207' });
    boxes.push({ x: [-9, -4], y: [11, 13], z: [5, 8], color: '#eab308', top: () => '#fde047' });
    boxes.push({ x: [4, 9], y: [11, 13], z: [5, 8], color: '#eab308', top: () => '#fde047' });
    return renderBoxes(boxes, { hurt });
  },
};

const CACHE = {};
export const hasVoxelFinalBoss = (bossType) => !!BOSSES[bossType];
export function renderVoxelFinalBoss(bossType, hurt = false) {
  if (!BOSSES[bossType] || typeof document === 'undefined') return null;
  const key = `${bossType}:${hurt ? 1 : 0}`;
  if (!CACHE[key]) {
    try { CACHE[key] = BOSSES[bossType](hurt); } catch (e) { console.warn('[voxel-boss] gagal menggambar', e); CACHE[key] = null; }
  }
  return CACHE[key];
}
