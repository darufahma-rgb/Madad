import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  PlayerSprite,
  BossSprite,
  BattleProjectile,
  FloatingDamage,
  PixelBattlefield,
  PixelPlatform,
  MinecraftBattlefield,
  MinecraftPlayerSprite,
  MinecraftBossSprite,
  MinecraftHudPlate,
  getVoxelSprite,
  getVoxelHurtSprite,
  FinalBossPortrait,
  FinalBossFamiliar,
  getFinalBossLook,
  getArenaTheme
} from '../components/battle-sprites.jsx';
import { PixelIcon, ItemSlot, IconText, EmojiIcon } from '../components/pixel-icons.jsx';

/* =========================================================================
   TALQEEH — ARENA IMTIHAN (تحدي المقررات)
   Alur 2 Fase:
     Fase 1: Ruang Muthola'ah (Belajar rangkuman materi, mufradat & flashcard)
     Fase 2: Arena Imtihan (Ujian imtihan turn-based ala Pokémon RPG)
   ========================================================================= */

/* ── Web Audio API 8-Bit Retro Sound Synthesizer ── */
class RetroAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmPlaying = false;
    this.bgmTimer = null;
  }
  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  startBgm() {
    if (this.muted || this.bgmPlaying) return;
    try {
      this.init();
      if (!this.ctx) return;
      this.bgmPlaying = true;

      // Arabian Bayati / Hijaz 8-bit Battle Ostinato
      const bassNotes = [146.83, 146.83, 155.56, 174.61, 146.83, 146.83, 196.00, 185.00];
      const leadNotes = [
        293.66, 311.13, 369.99, 392.00, 440.00, 392.00, 369.99, 311.13,
        293.66, 369.99, 440.00, 466.16, 440.00, 369.99, 311.13, 293.66
      ];

      let step = 0;
      const tempoMs = 155;

      this.bgmTimer = setInterval(() => {
        if (!this.bgmPlaying || this.muted || !this.ctx) return;
        const now = this.ctx.currentTime;

        // Bass groove
        const bassFreq = bassNotes[step % bassNotes.length];
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bassFreq, now);
        bassGain.gain.setValueAtTime(0.042, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + 0.15);

        // Lead melody
        const leadFreq = leadNotes[step % leadNotes.length];
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        leadOsc.type = 'square';
        leadOsc.frequency.setValueAtTime(leadFreq, now);
        leadGain.gain.setValueAtTime(0.02, now);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        leadOsc.connect(leadGain);
        leadGain.connect(this.ctx.destination);
        leadOsc.start(now);
        leadOsc.stop(now + 0.13);

        // Soft hi-hat tick
        if (step % 2 === 1) {
          const noiseOsc = this.ctx.createOscillator();
          const noiseGain = this.ctx.createGain();
          noiseOsc.type = 'sawtooth';
          noiseOsc.frequency.setValueAtTime(980, now);
          noiseGain.gain.setValueAtTime(0.01, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          noiseOsc.connect(noiseGain);
          noiseGain.connect(this.ctx.destination);
          noiseOsc.start(now);
          noiseOsc.stop(now + 0.045);
        }

        step = (step + 1) % 64;
      }, tempoMs);
    } catch {}
  }
  stopBgm() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
  playCombo(count = 2) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const baseFreq = 440 + Math.min(count * 60, 420);
      [baseFreq, baseFreq * 1.25, baseFreq * 1.5].forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.05);
        gain.gain.setValueAtTime(0.12, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.19);
      });
    } catch {}
  }
  playStoryIntro() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [293.66, 349.23, 392.00, 440.00, 466.16, 587.33];
      notes.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.12);
        gain.gain.setValueAtTime(0.08, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.48);
      });
    } catch {}
  }
  playStoryBip() {
    this.playBip(580, 0.04, 'triangle');
  }
  playBip(freq = 440, duration = 0.06, type = 'square') {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {}
  }
  playHit() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Retro pitch drop hit
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.18);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.19);
    } catch {}
  }
  playCrit() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [520, 780, 1040, 1400].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.14, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.04 + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.15);
      });
      // Bass impact rumble
      const bass = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bass.type = 'sawtooth';
      bass.frequency.setValueAtTime(130, now + 0.12);
      bass.frequency.exponentialRampToValueAtTime(32, now + 0.35);
      bassGain.gain.setValueAtTime(0.2, now + 0.12);
      bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      bass.connect(bassGain);
      bassGain.connect(this.ctx.destination);
      bass.start(now + 0.12);
      bass.stop(now + 0.36);
    } catch {}
  }
  playAttackCharge() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.38);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.28);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.44);
    } catch {}
  }
  playSuperSlash() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [440, 660, 990, 1320].forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.02);
        osc.frequency.exponentialRampToValueAtTime(f * 2.2, now + i * 0.02 + 0.14);
        gain.gain.setValueAtTime(0.12, now + i * 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.02 + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.02);
        osc.stop(now + i * 0.02 + 0.3);
      });
    } catch {}
  }
  playDamage() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.35);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.36);

      // Thump noise burst for Minecraft hurt punch feel
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.1);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.18, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      noise.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(now);
    } catch {}
  }
  playHeal() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.12, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.2);
      });
    } catch {}
  }
  playVictory() {
    this.stopBgm();
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      // Grand PUBG Chicken Dinner x Al-Azhar Winner Fanfare
      const notes = [
        { f: 392.00, d: 0.12 }, // G4
        { f: 523.25, d: 0.12 }, // C5
        { f: 659.25, d: 0.12 }, // E5
        { f: 783.99, d: 0.28 }, // G5
        { f: 659.25, d: 0.14 }, // E5
        { f: 783.99, d: 0.60 }, // G5 (Hold)
        { f: 880.00, d: 0.16 }, // A5
        { f: 987.77, d: 0.16 }, // B5
        { f: 1046.50, d: 0.85 } // C6 (Grand Finale)
      ];
      let t = this.ctx.currentTime;
      notes.forEach(({ f, d }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.24, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + d * 0.95);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + d);

        // Sub-harmonic trumpet layer
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sawtooth';
        sub.frequency.setValueAtTime(f / 2, t);
        subGain.gain.setValueAtTime(0.1, t);
        subGain.gain.exponentialRampToValueAtTime(0.005, t + d * 0.9);
        sub.connect(subGain);
        subGain.connect(this.ctx.destination);
        sub.start(t);
        sub.stop(t + d);

        t += d;
      });
    } catch {}
  }
  playChestOpen() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Minecraft chest squeak & sparkle arpeggio
      const squeak = this.ctx.createOscillator();
      const sGain = this.ctx.createGain();
      squeak.type = 'sawtooth';
      squeak.frequency.setValueAtTime(260, now);
      squeak.frequency.exponentialRampToValueAtTime(440, now + 0.12);
      sGain.gain.setValueAtTime(0.08, now);
      sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      squeak.connect(sGain);
      sGain.connect(this.ctx.destination);
      squeak.start(now);
      squeak.stop(now + 0.15);

      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + 0.12 + idx * 0.05);
        gain.gain.setValueAtTime(0.12, now + 0.12 + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12 + idx * 0.05 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + 0.12 + idx * 0.05);
        osc.stop(now + 0.12 + idx * 0.05 + 0.22);
      });
    } catch {}
  }
  playStep() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.07);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }
  playDefeat() {
    this.stopBgm();
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [440, 415.3, 392, 349.23];
      let t = this.ctx.currentTime;
      notes.forEach((f) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.3);
        t += 0.26;
      });
    } catch {}
  }
}
const sfx = new RetroAudio();

/* ── PETI HIKMAH AL-AZHAR (HADIAH HARIAN & MUTIARA KALAM ULAMA) ── */
const AZHAR_WISDOM_LOOT = [
  {
    id: 'syafii-1',
    author: "Al-Imam Asy-Syafi'i رحمه الله",
    role: "Mujtahid Mutlaq & Peletak Dasar Ushul Fiqih",
    arabic: "أَخِي لَنْ تَنَالَ العِلْمَ إِلَّا بِسِتَّةٍ • سَأُنْبِيكَ عَنْ تَفْصِيلِهَا بِبَيَانِ: ذَكَاءٌ وَحِرْصٌ وَاجْتِهَادٌ وَبُلْغَةٌ • وَصُحْبَةُ أُسْتَاذٍ وَطُولُ زَمَانِ",
    meaning: "Wahai saudaraku, engkau takkan meraih ilmu kecuali dengan 6 perkara: kecerdasan, ketamakan belajar, kesungguhan, bekal yang cukup, bimbingan seorang guru, dan masa belajar yang panjang.",
    itemReward: { name: "Syay bil Na'na' (Teh Mint)", key: "tea", qty: 1, icon: "🍵", desc: "+35 HP Pemulihan" }
  },
  {
    id: 'ibnu-malik-1',
    author: "Al-Imam Ibnu Malik رحمه الله",
    role: "Penulis Matan Alfiyah Ibnu Malik",
    arabic: "كَلاَمُنَا لَفْظٌ مُفِيدٌ كَاسْتَقِمْ • وَاسْمٌ وَفِعْلٌ ثُمَّ حَرْفٌ الْكَلِمْ",
    meaning: "Kalam dalam tatabahasa Arab adalah lafadz yang memberi faedah sempurna seperti ucapan 'Istaqim' (Istiqamahlah!). Tersusun atas Isim, Fi'il, dan Huruf.",
    itemReward: { name: "Ahwah Mazbut (Kopi Kairo)", key: "ahwah", qty: 1, icon: "☕", desc: "Tameng Difa' (-50% damage serangan balik)" }
  },
  {
    id: 'ghazali-1',
    author: "Al-Imam Al-Ghazali رحمه الله",
    role: "Hujjatul Islam & Pengarang Al-Mustashfa",
    // Al-Mustashfa, muqaddimah tentang ilmu mantiq (versi sebelumnya menambahkan "wal-ushul" yang tidak ada di teks).
    arabic: "هِيَ مُقَدِّمَةُ الْعُلُومِ كُلِّهَا، وَمَنْ لَا يُحِيطُ بِهَا فَلَا ثِقَةَ لَهُ بِعُلُومِهِ أَصْلًا",
    meaning: "(Tentang ilmu mantiq/logika) Ia adalah pengantar bagi seluruh ilmu; siapa yang tidak menguasainya, ilmunya sama sekali tidak dapat dipercaya kemantapannya.",
    itemReward: { name: "Khulashah Matan (Diktat Ringkas)", key: "summary", qty: 1, icon: "📜", desc: "Singkirkan 2 Pilihan Salah (50:50)" }
  },
  {
    id: 'azhar-kibar-1',
    // Ungkapan masyhur tanpa sumber tunggal yang pasti; jangan disandarkan kepada tokoh atau lembaga tertentu.
    author: "Ungkapan masyhur para penuntut ilmu",
    role: "Hikmah populer di majelis ilmu",
    arabic: "العِلْمُ فِي الصُّدُورِ لَا فِي السُّطُورِ",
    meaning: "Ilmu yang sejati bersemayam di dalam dada (dipahami dan dihafal), bukan sekadar tertulis di atas kertas.",
    itemReward: { name: "Qamus Ma'ani Azhar", key: "qamus", qty: 1, icon: "📖", desc: "Buka Petunjuk & Hint Kaidah" }
  }
];

/* ── HELPER: INTEL TAKTIK & KELEMAHAN PENJAGA ── */
function getStageTactics(muqarrarId, stageId) {
  const map = {
    'balaghah-majaz': {
      1: {
        category: 'Bayan • Hakikat & Majaz',
        weakness: "Rentan terhadap pemilahan Hakikat vs Majaz dan Ta'rif Isti'arah.",
        danger: "Syubhat kekeliruan ta'rif dasar.",
        recItem: "🍵 Syay bil Na'na'"
      },
      2: {
        category: 'Bayan • Alaqah Sababiyyah',
        weakness: "Goyah saat kamu membedakan antara 'sebab' (hujan) dan 'akibat' (rumput/rezeki).",
        danger: 'Syubhat pembalikan kausalitas makna.',
        recItem: '☕ Ahwah Mazbut'
      },
      3: {
        category: 'Bayan • Dimensi Waktu & Tempat',
        weakness: "Kalah telak jika kamu jeli menganalisis waktu lampau (Ma Kana) dan masa depan (Ma Yakun).",
        danger: 'Syubhat pergantian status hukum pasca-baligh.',
        recItem: "📖 Qamus Ma'ani"
      },
      4: {
        category: 'Bayan • Final Boss Syaikhul Balaghah (Al-Bayani)',
        weakness: "Sangat rentan terhadap Qarinah Lafdziyyah dan formula tahriri lengkap di kurrasah.",
        danger: 'Syubhat gabungan 6 alaqah sekaligus!',
        recItem: '📜 Khulashah Matan'
      }
    },
    'nahwu-fail': {
      1: {
        category: "Nahwu • Mabadi' Fa'il",
        weakness: "Rentan terhadap rumus perubahan fi'il madhi mabni majhul (dhommah awal, kasrah sebelum akhir).",
        danger: "Kekeliruan harakat fi'il majhul.",
        recItem: "🍵 Syay bil Na'na'"
      },
      2: {
        category: 'Nahwu • Amil Tam & Huruf',
        weakness: "Goyah saat kamu membongkar huruf nashab/jar yang menyamar sebagai amil rafa'.",
        danger: "Amil penyerupa fi'il.",
        recItem: '☕ Ahwah Mazbut'
      },
      3: {
        category: "Nahwu • Hak Na'ibul Fa'il",
        weakness: "Kalah telak dengan bait Alfiyah: maf'ul bih sharih wajib didahulukan dari zharf/jar majrur.",
        danger: 'Pertentangan madzhab Bashrah vs Kufah.',
        recItem: "📖 Qamus Ma'ani"
      },
      4: {
        category: "Nahwu • Final Boss Syaikhul Nahwu (Al-Alfiy)",
        weakness: "Rentan terhadap kaidah fashil (pemisah) pada Ta' Ta'nits majazi vs haqiqi.",
        danger: 'Badai amil ganda & mustatir wujuban!',
        recItem: '📜 Khulashah Matan'
      }
    },
    'ushul-amr': {
      1: {
        category: 'Ushul • Shighat Al-Amr',
        weakness: 'Rentan terhadap penguasaan 4 shighat amr pokok yang menuntut al-wujub.',
        danger: "Kekeliruan shighat isim fi'il amr.",
        recItem: "🍵 Syay bil Na'na'"
      },
      2: {
        category: 'Ushul • Qarinah Ash-Shorifah',
        weakness: 'Goyah saat kamu mengidentifikasi qarinah pemaling wujub menuju ibahah dan nadb.',
        danger: "Pencampuradukan amr ta'dib vs irsyad.",
        recItem: '☕ Ahwah Mazbut'
      },
      3: {
        category: 'Ushul • Waktu & Pengulangan',
        weakness: 'Kalah telak jika kamu membedakan kaidah Faur (segera) dan Tarakhi (penundaan).',
        danger: 'Perdebatan tikrar amr terikat sabab.',
        recItem: "📖 Qamus Ma'ani"
      },
      4: {
        category: 'Ushul • Final Boss Syaikhul Ushul (Al-Qadhi)',
        weakness: "Rentan terhadap dalil qath'i syariah dan ushul mazhab Syafi'i.",
        danger: 'Timbangan syubhat ta\'arudh al-adillah!',
        recItem: '📜 Khulashah Matan'
      }
    }
  };
  return map[muqarrarId]?.[stageId] || {
    category: 'Imtihan Muqarrar',
    weakness: "Fahami ta'rif kaidah dan perhatikan kata kunci pada matan.",
    danger: 'Syubhat pilihan jawaban yang mengecoh.',
    recItem: "🍵 Syay bil Na'na'"
  };
}

/* ── PRESET DIKTAT RESMI AL-AZHAR (Siap Langsung Dimainkan) ── */
const PRESETS = [
  {
    id: 'balaghah-majaz',
    title: 'Ilmu Bayan: Hakikat & Majaz Mursal',
    titleArabic: 'الْبَيَان: الْحَقِيقَةُ وَالْمَجَازُ الْمُرْسَلُ',
    maddah: 'Balaghah (Fak. Lughah / Dirasat)',
    bossName: 'Syaikhul Balaghah: Al-\'Allamah Al-Bayani',
    bossLv: 38,
    bossRank: 'Rank S (Kibar Ulama)',
    bossRankCode: 'Rank S',
    bossHp: 100,
    bossAvatar: '👳‍♂️',
    stages: [
      {
        id: 1,
        levelNumber: 1,
        title: 'Level 1: Gerbang Mabadi\' Bayan',
        titleArabic: 'الْمَرْحَلَةُ الأُولَى: بَابُ الْمَبَادِئِ',
        location: 'Bab Al-Muzayyinin • Gerbang Masuk Al-Azhar',
        guardianName: 'Khadim Ruwaq: Thalib Tsani',
        guardianRank: 'Rank C (Mubtadi\')',
        guardianRankCode: 'Rank C',
        guardianAvatar: '📜',
        bossHp: 60,
        expReward: 35,
        quizIndices: [1, 0],
        isFinal: false,
        lore: 'Ujian pertama menguji apakah lisan dan akalmu mampu membedakan hakikat dan majaz secara jernih di gerbang utama Al-Azhar.'
      },
      {
        id: 2,
        levelNumber: 2,
        title: 'Level 2: Ruwaq Alaqat As-Sababiyyah',
        titleArabic: 'الْمَرْحَلَةُ الثَّانِيَةُ: رِوَاقُ السَّبَبِيَّةِ',
        location: 'Ruwaq Al-Magharibah • Koridor Bayan',
        guardianName: 'Musa\'id Balaghah: Syaikh Bayani',
        guardianRank: 'Rank B (Mutawassith)',
        guardianRankCode: 'Rank B',
        guardianAvatar: '🌿',
        bossHp: 80,
        expReward: 50,
        quizIndices: [2, 5],
        isFinal: false,
        lore: 'Memasuki bilik diskusi para thalib. Uraikan dengan tajam perbedaan antara lafadz Sebab (Sababiyyah) dan Musabbab.'
      },
      {
        id: 3,
        levelNumber: 3,
        title: 'Level 3: Shahn Al-I\'tibar wal-Mahall',
        titleArabic: 'الْمَرْحَلَةُ الثَّالِثَةُ: صَحْنُ الِاعْتِبَارِ',
        location: 'Pelataran Shahn Al-Azhar Asy-Syarif',
        guardianName: 'Muhaqqiq Balaghah: Ustadz Adabi',
        guardianRank: 'Rank A (Mutaqaddim)',
        guardianRankCode: 'Rank A',
        guardianAvatar: '🏛️',
        bossHp: 90,
        expReward: 65,
        quizIndices: [3, 6, 7],
        isFinal: false,
        lore: 'Di bawah naungan langit Kairo, buktikan kepiawaianmu menembus dimensi waktu (Ma Kana & Ma Yakun) serta hubungan tempat (Mahalliyyah).'
      },
      {
        id: 4,
        levelNumber: 4,
        title: 'FINAL BOSS: Kubah Perpustakaan Kuno',
        titleArabic: 'الْمَرْحَلَةُ الرَّابِعَةُ: الزَّعِيمُ الأَكْبَرُ',
        location: 'Maktabah Markaziyyah Al-Azhar • Kubah Ulama Kibar',
        guardianName: 'Syaikhul Balaghah: Al-\'Allamah Al-Bayani',
        guardianRank: 'Rank S (Kibar Ulama)',
        guardianRankCode: 'Rank S',
        guardianAvatar: '👳‍♂️',
        bossHp: 100,
        expReward: 100,
        quizIndices: [4, 8, 0, 2],
        isFinal: true,
        lore: 'Al-\'Allamah Al-Bayani, Guru Besar Balaghah Al-Azhar, menguji langsung pemahamanmu! Tundukkan ujian agung beliau untuk menyandang predikat Mumtaz dan meraih Syahadah Arena Imtihan!'
      }
    ],
    prologue: {
      chapter: 'HIKAYAT BAB I',
      title: 'Misteri Lembaran Bayan di Perpustakaan Kuno',
      titleArabic: 'سِرُّ الْمَجَازِ فِي مَكْتَبَةِ الْأَزْهَرِ الْعَتِيقَةِ',
      location: 'Maktabah Markaziyyah Al-Azhar • Tengah Malam di Kairo',
      epigraph: '«مَن لَم يَذُق طَعمَ المَجَازِ، حُرِمَ مِن بَلَاغَةِ التَّنْزِيلِ»',
      epigraphMeaning: 'Barangsiapa tak mencicipi rahasia majaz, niscaya terhalang dari keindahan mukjizat Al-Qur\'an.',
      dialogues: [
        {
          speaker: 'Narator',
          avatar: '🏛️',
          role: 'Keheningan Kairo',
          text: 'Lonceng menara Al-Azhar berdentang di keheningan malam Kairo. Angin gurun berhembus lembut melewati jendela kayu mashrabiyyah di perpustakaan kuno Markaziyyah yang sunyi.'
        },
        {
          speaker: 'Thalib Azhar',
          avatar: '🎓',
          role: 'Mahasiswa Tingkat 1',
          text: 'Besok adalah hari imtihan Balaghah bersama para masyayikh kibar. Kitab-kitab berserakan di hadapanku... Jika aku tak mampu membedakan mana Hakikat dan mana Majaz Mursal, nilaiku di kurrasah bisa binasa!'
        },
        {
          speaker: 'Al-\'Allamah Syaikhul Balaghah',
          avatar: '👳‍♂️',
          role: 'Guru Besar Balaghah Al-Azhar',
          text: 'Wahai penuntut ilmu yang gigih bermuthola\'ah! Ribuan ibarat adab dan bayan tersimpan dalam khazanah Al-Azhar. Apakah dzauq dan pemahamanmu cukup tajam mengurai alaqah Sababiyyah dan Juz\'iyyah di hadapan majelis kami?'
        },
        {
          speaker: 'Thalib Azhar',
          avatar: '🎓',
          role: 'Mengangkat Pena & Catatan',
          text: 'Bismillah! Dengan bekal muthola\'ah di Ruwaq dan barakah para guru, aku tidak akan gentar! Hadirkan seluruh syubhat dan kemusykilanmu!'
        }
      ]
    },
    summary: [
      {
        heading: 'Ta\'rif Hakikat & Majaz',
        arabic: 'الْحَقِيقَةُ وَالْمَجَازُ',
        body: 'Hakikat adalah lafadz yang digunakan pada makna aslinya menurut konvensi bahasa (الْمُسْتَعْمَلُ فِيمَا وُضِعَ لَهُ). Sedangkan Majaz adalah lafadz yang digunakan pada selain makna aslinya karena adanya alaqah (hubungan) serta qarinah yang menghalangi dari makna asli.'
      },
      {
        heading: 'Definisi Majaz Mursal',
        arabic: 'الْمَجَازُ الْمُرْسَلُ',
        body: 'Majaz Mursal adalah majaz yang alaqah (keterkaitan) antara makna asli dan makna majazinya BUKAN berupa penyerupaan (tasybih/musyabahah). Bila alaqahnya musyabahah, maka dinamakan Isti\'arah.'
      },
      {
        heading: '6 Alaqah Terpenting Majaz Mursal',
        arabic: 'أَهَمُّ عَلَاقَاتِ الْمَجَازِ الْمُرْسَلِ',
        body: '1. Sababiyyah (sebut sebab, maksudnya akibat: رَعَيْنَا الْغَيْثَ).\n2. Musabbabiyyah (sebut akibat, maksudnya sebab: وَيُنَزِّلُ لَكُم مِّنَ السَّمَاءِ رِزْقًا).\n3. Juz\'iyyah (sebut sebagian, maksudnya seluruh: قُمْ فَتَكَلَّمْ بِكَلِمَةٍ / عَيْنٌ).\n4. Kulliyyah (sebut seluruh, maksudnya sebagian: يَجْعَلُونَ أَصَابِعَهُمْ).\n5. I\'tibar Ma Kana (melihat masa lalu: وَآتُوا الْيَتَامَى أَمْوَالَهُمْ).\n6. I\'tibar Ma Yakun (melihat masa depan: إِنِّي أَرَانِي أَعْصِرُ خَمْرًا).'
      },
      {
        heading: 'Peran Qarinah',
        arabic: 'الْقَرِينَةُ الْمَانِعَةُ',
        body: 'Qarinah adalah indikator pencegah makna asli, bisa berupa lafdziyyah (tertulis dalam kalimat) atau haliyyah (dipahami dari situasi/konteks).'
      }
    ],
    terms: [
      { term: 'الْحَقِيقَةُ (Al-Haqiqah)', def: 'Lafadz yang digunakan sesuai makna asal peletakan bahasa.' },
      { term: 'الْمَجَازُ الْمُرْسَلُ (Al-Majaz Al-Mursal)', def: 'Lafadz yang dipakai di luar makna asal dengan alaqah non-penyerupaan.' },
      { term: 'الْعَلَاقَةُ (Al-\'Alaqah)', def: 'Tali penghubung rasional antara makna asli dan makna yang dimaksud.' },
      { term: 'الْقَرِينَةُ (Al-Qarinah)', def: 'Indikator yang mencegah dari pemahaman makna hakiki.' }
    ],
    flashcards: [
      { q: 'Apa perbedaan utama Majaz Mursal dan Isti\'arah?', a: 'Majaz Mursal alaqahnya BUKAN musyabahah (penyerupaan), sedangkan Isti\'arah alaqahnya adalah musyabahah.' },
      { q: 'Apa contoh Majaz Mursal \'alaqah Juz\'iyyah?', a: 'Menyebut "mata-mata" (عَيْنٌ) padahal yang dimaksud adalah satu orang utuh pengintai.' },
      { q: 'Mengapa ayat (أَصَابِعَهُمْ فِي آذَانِهِم) disebut Majaz Mursal Kulliyyah?', a: 'Karena yang dimasukkan ke telinga hanyalah ujung jari (anamil), tapi yang disebut adalah seluruh jari (ashaabi\').' },
      { q: 'Apa makna alaqah I\'tibar Ma Yakun?', a: 'Menyebutkan sesuatu dengan kondisi atau nama yang baru akan terjadi di masa mendatang (misal: memeras anggur disebut memeras khamr).' }
    ],
    quiz: [
      {
        question: 'Firman Allah Ta\'ala: {يَجْعَلُونَ أَصَابِعَهُمْ فِي آذَانِهِم}. Majaz mursal pada ayat ini memiliki \'alaqah apa?',
        options: [
          'Juz\'iyyah (menyebut sebagian)',
          'Kulliyyah (menyebut seluruhnya padahal sebagian)',
          'Sababiyyah (menyebut sebab)',
          'Musyabahah (penyerupaan)'
        ],
        answer: 1,
        explanation: 'Disebut ashaabi\' (seluruh jari) padahal yang masuk ke telinga hanya ujung jari (anamil), jadi \'alaqahnya Kulliyyah.',
        hint: 'Perhatikan apakah jari tangan bisa masuk seluruhnya ke lubang telinga atau hanya ujungnya.',
        examTip: 'Formula lembar ujian (Kurrasah Ijabah): «المجاز مرسل علاقته الكلية؛ حيث عبّر بالكل وهو (الأصابع) وأراد الجزء وهو (الأنامل/رؤوس الأصابع)، والقرينة حالية مانعة من إرادة المعنى الحقيقي لاستحالة إدخال الأصبع كاملاً في الأذن».'
      },
      {
        question: 'Apa perbedaan pokok yang membedakan Majaz Mursal dengan Isti\'arah?',
        options: [
          'Majaz Mursal tidak butuh qarinah',
          'Isti\'arah tidak menggunakan bahasa kiasan',
          'Majaz Mursal alaqahnya BUKAN musyabahah (penyerupaan)',
          'Majaz Mursal hanya ada pada isim jamak'
        ],
        answer: 2,
        explanation: 'Kaidah dasar Balaghah Azhar: jika alaqahnya musyabahah = Isti\'arah; jika alaqahnya ghairu musyabahah = Majaz Mursal.',
        hint: 'Ingat kata kunci: Musyabahah vs Ghairu Musyabahah.',
        examTip: 'Kaidah hafalan imtihan: «الفرق الجوهري: علاقة المجاز المرسل غير المشابهة (كالسببية والكلية والجزئية)، بينما علاقة الاستعارة هي المشابهة دائماً مع وجود قرينة مانعة من إرادة المعنى الأصلي في كليهما».'
      },
      {
        question: 'Pada kalimat "رَعَيْنَا الْغَيْثَ" (kami menggembalakan hujan), alaqah majaz mursal yang digunakan adalah...',
        options: [
          'Sababiyyah (hujan adalah sebab tumbuhnya rumput gembalaan)',
          'Musabbabiyyah (rumput adalah akibat dari hujan)',
          'I\'tibar Ma Kana (memandang masa lalu)',
          'Mahalliyyah (menyebut tempat/lokasi)'
        ],
        answer: 0,
        explanation: 'Yang digembalakan hewan adalah rumput (tanaman), sedangkan yang disebut al-ghaits (hujan). Hujan adalah SEBAB tumbuhnya rumput, maka alaqahnya Sababiyyah.',
        hint: 'Hujan adalah faktor penyebab munculnya rumput hijau.',
        examTip: 'Jawaban model imtihan: «أطلق السبب وهو (الغيث / المطر) وأراد المسبَّب وهو (النبات / العشب)؛ لأن المطر هو سبب نبات العشب، فعلاقته السببية، والقرينة لفظية وهي (رعينا)؛ إذ المطر لا يُرعى حقيقة».'
      },
      {
        question: 'Firman Allah: {وَآتُوا الْيَتَامَى أَمْوَالَهُمْ}. Mengapa disebut anak yatim padahal harta baru diserahkan saat sudah baligh?',
        options: [
          'Alaqah Musabbabiyyah (akibat dari sebab)',
          'Alaqah I\'tibar Ma Kana (memandang masa lalu saat masih kecil yatim)',
          'Alaqah I\'tibar Ma Yakun (memandang masa depan saat dewasa)',
          'Alaqah Haliyyah (keadaan yang menempati)'
        ],
        answer: 1,
        explanation: 'Secara syar\'i orang baligh bukan lagi yatim ("la yutma ba\'dal ihtilam"). Disebut yatim dengan memandang status masa lalunya (I\'tibar Ma Kana).',
        hint: 'Setelah baligh, status yatim gugur secara hukum fikih.',
        examTip: 'Ibarat imtihan: «علاقته اعتبار ما كان؛ لأنهم بعد البلوغ ودفع الأموال زال عنهم اسم اليتم شرعاً (لقوله صلى الله عليه وسلم: لا يُتْمَ بعد احتلام)، فسُمُّوا يتامى بالنظر إلى حالتهم السابقة استعطافاً لقلوب الأولياء لحفظ حقوقهم».'
      },
      {
        question: 'Jika seseorang berkata "أَرْسَلَ الْحَاكِمُ عُيُونًا إِلَى الْعَدُوِّ" (pemimpin mengirim mata-mata), lafadz "عُيُون" adalah Majaz Mursal dengan alaqah...',
        options: [
          'Kulliyyah (menyebut seluruhnya padahal sebagian)',
          'Juz\'iyyah (menyebut mata untuk mewakili seluruh person pengintai)',
          'I\'tibar Ma Yakun (memandang masa depan)',
          'Sababiyyah (menyebut faktor sebab)'
        ],
        answer: 1,
        explanation: 'Menyebut \'ain (mata - sebagian anggota badan terpenting dalam memata-matai) untuk memaksudkan seluruh sosok pengintai (juz\'iyyah).',
        hint: 'Mata adalah organ tubuh sebagian yang mewakili satu orang pengintai.',
        examTip: 'Cara jawab di kurrasah: «المجاز مرسل علاقته الجزئية؛ أطلق الجزء وهو (العين) لكونها أهم عضو وأشرفه في استطلاع أخبار العدو، وأراد الكل وهو الجاسوس/المستطلع، والقرينة حالية مفهومة من سياق الإرسال».'
      },
      {
        question: 'Firman Allah Ta\'ala: {وَيُنَزِّلُ لَكُم مِّنَ السَّمَاءِ رِزْقًا}. Lafadz "رِزْقًا" merupakan Majaz Mursal dengan \'alaqah...',
        options: [
          'Musabbabiyyah (menyebut akibat dari air hujan yang menumbuhkan tanaman)',
          'Sababiyyah (menyebut sebab air hujan)',
          'Kulliyyah (menyebut seluruhnya)',
          'I\'tibar Ma Kana (memandang masa lalu)'
        ],
        answer: 0,
        explanation: 'Yang turun dari langit hakikatnya adalah air hujan (al-mathar), sedangkan rizki adalah akibat/dampak (musabbab) yang timbul dari air hujan. Disebut akibat padahal maksudnya sebab = Musabbabiyyah.',
        hint: 'Apakah rezeki turun langsung berupa makanan atau air hujan yang menumbuhkan tanaman?',
        examTip: 'Formula imtihan tahriri: «المجاز مرسل علاقته المسبَّبية؛ حيث أطلق المسبَّب وهو (الرزق) وأراد السبب وهو (المطر / الغيث)؛ لأن المطر سبب في إنبات الزرع الذي يحصل به الرزق، والقرينة لفظية وهي (يُنزّل من السماء)؛ لأن الرزق لا ينزل بذاته بل المطر».'
      },
      {
        question: 'Firman Allah Ta\'ala tentang mimpi pemuda di penjara Nabi Yusuf: {إِنِّي أَرَانِي أَعْصِرُ خَمْرًا}. \'Alaqah majaz pada kata "خَمْرًا" adalah...',
        options: [
          'I\'tibar Ma Yakun (memandang kondisi anggur yang nantinya akan menjadi khamr)',
          'I\'tibar Ma Kana (memandang masa lalu)',
          'Mahalliyyah (menyebut tempat perasan)',
          'Sababiyyah (menyebut faktor sebab)'
        ],
        answer: 0,
        explanation: 'Benda cair khamr tidak bisa diperas lagi, yang diperas hakikatnya adalah buah anggur (\'inab) yang baru akan menjadi khamr di masa mendatang.',
        hint: 'Khamr sudah berupa cairan sehingga mustahil diperas; yang diperas adalah buah anggur calon khamr.',
        examTip: 'Ibarat ujian Azhar: «علاقته اعتبار ما سيكون؛ لأن الخمر مائع لا يُعصر، وإنما يُعصر العنب الذي يؤول ويتحول إلى خمر في المستقبل، فأطلق اسم ما يؤول إليه على أصله تسميةً للشيء بما سيكون عليه، والقرينة عقلية لاستحالة عصر المائع».'
      },
      {
        question: 'Firman Allah Ta\'ala: {فَلْيَدْعُ نَادِيَهُ} (Maka biarlah ia memanggil golongannya / majelisnya). Lafadz "نَادِي" menggunakan Majaz Mursal dengan \'alaqah...',
        options: [
          'Mahalliyyah (menyebut tempat perkumpulan padahal yang dimaksud orang-orang di dalamnya)',
          'Haliyyah (menyebut penghuni/orang di dalam tempat)',
          'Juz\'iyyah (menyebut sebagian kelompok)',
          'Musyabahah (penyerupaan dengan majelis lain)'
        ],
        answer: 0,
        explanation: 'An-Nadi adalah tempat duduk atau aula perkumpulan kaum (mahall). Yang dipanggil bukan gedungnya, melainkan para tokoh yang berkumpul di dalamnya.',
        hint: 'An-Nadi artinya balai/tempat berkumpul. Siapakah yang sebenarnya diajak berhadapan?',
        examTip: 'Jawaban kurrasah ijabah: «المجاز مرسل علاقته المحلية؛ حيث أطلق المحل وهو (النادي) وأراد الحالَّ فيه وهم (أهل المجلس وعشيرته وأنصاره)؛ والقرينة حالية واضحة لاستحالة دعوة المكان والجماد لإغاثة الإنسان».'
      },
      {
        question: 'Firman Allah Ta\'ala: {وَأَمَّا الَّذِينَ ابْيَضَّتْ وُجُوهُهُمْ فَفِي رَحْمَتِ اللَّهِ هُمْ فِيهَا خَالِدُونَ}. Kata "رَحْمَةِ اللَّهِ" di sini bermakna Surga dengan \'alaqah...',
        options: [
          'Haliyyah (menyebut keadaan/sifat yang menempati padahal maksudnya tempatnya yaitu surga)',
          'Mahalliyyah (menyebut tempat kediaman)',
          'Sababiyyah (menyebut faktor sebab masuk surga)',
          'Kulliyyah (menyebut keseluruhan rahmat)'
        ],
        answer: 0,
        explanation: 'Rahmat adalah sifat atau hal yang bersemayam pada tempat. Yang dimaksud adalah Surga (mahall ar-rahmah) tempat kekal orang-orang beriman.',
        hint: 'Rahmat adalah sesuatu yang meliputi penghuni surga; di sini disebut hal-nya, dimaksudkan tempatnya.',
        examTip: 'Kaidah imtihan balaghah: «المجاز مرسل علاقته الحالية؛ عبّر بالحالّ وهو (رحمة الله) وأراد المحل وهو (الجنة) التي تحل فيها الرحمة؛ لأن الرحمة معنىً لا يُحل فيه ولا يُخلد فيه المكان، والقرينة قوله: {هُمْ فِيهَا خَالِدُونَ} إذ الخلود يستدعي مكاناً».'
      }
    ]
  },
  {
    id: 'nahwu-fail',
    title: 'Nahwu: Bab Fa\'il & Na\'ibul Fa\'il',
    titleArabic: 'النَّحْو: بَابُ الْفَاعِلِ وَنَائِبِ الْفَاعِلِ',
    maddah: 'Nahwu (Alfiyah Ibnu Malik)',
    bossName: 'Syaikhul Nahwu: Al-\'Allamah Al-Alfiy',
    bossLv: 42,
    bossRank: 'Rank S (Kibar Ulama)',
    bossRankCode: 'Rank S',
    bossHp: 100,
    bossAvatar: '👳‍♂️',
    stages: [
      {
        id: 1,
        levelNumber: 1,
        title: 'Level 1: Gerbang I\'rab Alfiyah',
        titleArabic: 'الْمَرْحَلَةُ الأُولَى: بَابُ الْإِعْرَابِ',
        location: 'Bab Al-Ghawri • Gerbang Alfiyah',
        guardianName: 'Khadim Nahwu: Thalib Alfiyah',
        guardianRank: 'Rank C (Mubtadi\')',
        guardianRankCode: 'Rank C',
        guardianAvatar: '⚡',
        bossHp: 60,
        expReward: 35,
        quizIndices: [0, 1],
        isFinal: false,
        lore: 'Ujian awal menegakkan hukum dasar Fa\'il: pantang mendahului fi\'il menurut Bashriyyin dan tetap mufradnya fi\'il di hadapan jamak.'
      },
      {
        id: 2,
        levelNumber: 2,
        title: 'Level 2: Ruwaq Na\'ibul Fa\'il',
        titleArabic: 'الْمَرْحَلَةُ الثَّانِيَةُ: رِوَاقُ نَائِبِ الْفَاعِلِ',
        location: 'Ruwaq As-Sa\'ayidah • Bilik Matan',
        guardianName: 'Musa\'id Nahwu: Murid Ibnu Malik',
        guardianRank: 'Rank B (Mutawassith)',
        guardianRankCode: 'Rank B',
        guardianAvatar: '📘',
        bossHp: 80,
        expReward: 50,
        quizIndices: [2, 3, 4],
        isFinal: false,
        lore: 'Uji kemampuan mengubah bentuk kalimat madhi & mudhari\' ke mabni majhul serta hierarki pengganti fa\'il.'
      },
      {
        id: 3,
        levelNumber: 3,
        title: 'Level 3: Shahn Ta\'nits wal-Fashil',
        titleArabic: 'الْمَرْحَلَةُ الثَّالِثَةُ: صَحْنُ التَّأْنِيثِ وَالْفَاصِلِ',
        location: 'Pelataran Shahn Al-Azhar Asy-Syarif',
        guardianName: 'Muhaqqiq Nahwiy: Syaikh Bashri',
        guardianRank: 'Rank A (Mutaqaddim)',
        guardianRankCode: 'Rank A',
        guardianAvatar: '⚡',
        bossHp: 90,
        expReward: 65,
        quizIndices: [5, 6, 7],
        isFinal: false,
        lore: 'Uraikan hukum ja\'iz ta\' ta\'nits pada muannats majazi, pemisah fashil, dan i\'rab fi\'il muta\'addi dua maf\'ul.'
      },
      {
        id: 4,
        levelNumber: 4,
        title: 'FINAL BOSS: Puncak Imtihan Majelis Kibar Ulama',
        titleArabic: 'الْمَرْحَلَةُ الرَّابِعَةُ: الزَّعِيمُ الأَكْبَرُ',
        location: 'Puncak Minaret Al-Azhar • Majelis Kibar Ulama',
        guardianName: 'Syaikhul Nahwu: Al-\'Allamah Al-Alfiy',
        guardianRank: 'Rank S (Kibar Ulama)',
        guardianRankCode: 'Rank S',
        guardianAvatar: '👳‍♂️',
        bossHp: 100,
        expReward: 100,
        quizIndices: [8, 0, 2, 4],
        isFinal: true,
        lore: 'Al-\'Allamah Syaikhul Nahwu menantangmu dalam ujian puncak I\'rab Alfiyah! Buktikan ketajaman kaidahmu di hadapan beliau untuk meraih Syahadah Arena Imtihan!'
      }
    ],
    prologue: {
      chapter: 'HIKAYAT BAB II',
      title: 'Badai Petir di Atas Bab Al-Muzayyinin',
      titleArabic: 'عَاصِفَةُ الْأَلْفِيَّةِ فَوْقَ بَابِ الْمُزَيِّنِينَ',
      location: 'Gerbang Bab Al-Muzayyinin Al-Azhar • Malam Badai Listrik',
      epigraph: '«كَلَامُنَا لَفْظٌ مُفِيدٌ كَاسْتَقِمْ • وَاسْمٌ وَفِعْلٌ ثُمَّ حَرْفٌ الْكَلِمْ»',
      epigraphMeaning: 'Kalam menurut ulama Nahwu adalah lafadz berfaedah seperti istaqim; tersusun dari isim, fi\'il, dan huruf.',
      dialogues: [
        {
          speaker: 'Narator',
          avatar: '⚡',
          role: 'Langit Bergemuruh',
          text: 'Awan hitam menyelimuti Kairo dan kilat menyambar di pucuk minarets Al-Azhar. Dari gerbang kuno Bab Al-Muzayyinin, batu prasasti berukir bait Alfiyah mulai bergetar memancarkan pendar listrik biru.'
        },
        {
          speaker: 'Al-\'Allamah Syaikhul Nahwu',
          avatar: '👳‍♂️',
          role: 'Guru Besar Nahwu Al-Azhar',
          text: 'Ahlan wa sahlan, wahai Thalib! Tak seorang pun berhak menyandang ijazah Alfiyah sebelum membuktikan kepiawaiannya menundukkan Fa\'il dan mendudukkan Na\'ibul Fa\'il pada posisi semestinya di hadapan majelis kami!'
        },
        {
          speaker: 'Thalib Azhar',
          avatar: '🎓',
          role: 'Menghunus Hujjah Nahwu',
          text: 'Aku telah meresapi matan Alfiyah Ibnu Malik! Fa\'il adalah isim marfu\' yang terletak setelah fi\'il ma\'lum, pantang baginya mendahului fi\'il menurut jumhur Bashriyyin!'
        },
        {
          speaker: 'Al-\'Allamah Syaikhul Nahwu',
          avatar: '👳‍♂️',
          role: 'Ketua Dewan Penguji Nahwu',
          text: 'Hafalan dan pemahamanmu diuji malam ini, Thalib! Mari kita buktikan di atas kurrasah imtihan: apakah engkau sanggup mempertahankan harakat marfu\'-mu dengan dalil qath\'i, ataukah hujjahmu akan goyah?!'
        }
      ]
    },
    summary: [
      {
        heading: 'Definisi Fa\'il menurut Ibnu Malik',
        arabic: 'تَعْرِيفُ الْفَاعِلِ',
        body: 'Fa\'il adalah: "الاسْمُ الْمُسْنَدُ إِلَيْهِ فِعْلٌ عَلَى طَرِيقَةِ فَعَلَ أَوْ شِبْهُهُ، حَقِيقَةً أَوْ مَجَازًا". Isim yang disandarkan kepadanya fi\'il ma\'lum (atau yang serupa fi\'il) yang mendahuluinya.'
      },
      {
        heading: 'Hukum Fa\'il',
        arabic: 'أَحْكَامُ الْفَاعِلِ',
        body: '1. I\'rabnya selalu MARFU\' (atau fi mahalli raf\'in).\n2. Wajib terletak SETELAH fi\'il (menurut Bashriyyin). Jika mendahului fi\'il, ia menjadi Mubtada\'.\n3. Fi\'ilnya tetap MUFRAD meskipun fa\'ilnya mutsanna atau jamak (menurut lughah fushha jumhur).'
      },
      {
        heading: 'Na\'ibul Fa\'il (Maf\'ul yang menggantikan Fa\'il)',
        arabic: 'نَائِبُ الْفَاعِلِ',
        body: 'Ketika fa\'il dibuang, maf\'ul bih menduduki posisi fa\'il dan ber-i\'rab marfu\'. Bentuk fi\'il wajib diubah ke mabni majhul: dhommah awal dan kasrah sebelum akhir pada fi\'il madhi (فُعِلَ), dhommah awal dan fathah sebelum akhir pada fi\'il mudhari\' (يُفْعَلُ).'
      }
    ],
    terms: [
      { term: 'الْفَاعِلُ (Al-Fa\'il)', def: 'Isim marfu\' yang terletak setelah fi\'il ma\'lum sebagai pelaku atau penyandang sifat.' },
      { term: 'نَائِبُ الْفَاعِلِ (Na\'ibul Fa\'il)', def: 'Isim marfu\' pengganti fa\'il yang dibuang pada fi\'il mabni lil majhul.' },
      { term: 'الْمَبْنِيُّ لِلْمَجْهُولِ (Mabni Majhul)', def: 'Bentuk fi\'il yang fa\'ilnya disembunyikan/dihilangkan karena tujuan tertentu.' }
    ],
    flashcards: [
      { q: 'Apakah boleh Fa\'il mendahului Fi\'ilnya menurut Jumhur Ulama Bashrah?', a: 'Tidak boleh. Jika berada di depan (misal: "زَيْدٌ قَامَ"), maka Zaid adalah Mubtada\', dan fa\'il dari qaama adalah dhamir mustatir.' },
      { q: 'Bagaimana rumus fi\'il madhi mabni majhul?', a: 'Dhidhomma awwaluhu wa kusira ma qabla aakhirihi (contoh: كُتِبَ).' },
      { q: 'Bagaimana rumus fi\'il mudhari\' mabni majhul?', a: 'Dhidhomma awwaluhu wa futiha ma qabla aakhirihi (contoh: يُكْتَبُ).' }
    ],
    quiz: [
      {
        question: 'Pada kalimat "زَيْدٌ نَجَحَ", menurut madzhab Bashriyyin, kedudukan kata "زَيْدٌ" adalah...',
        options: [
          'Fa\'il muqaddam (pelaku yang didahulukan)',
          'Mubtada\', dan fa\'ilnya dhamir mustatir takdirnya "huwa" (dia)',
          'Maf\'ul bih muqaddam (objek yang didahulukan)',
          'Khabar muqaddam (predikat yang didahulukan)'
        ],
        answer: 1,
        explanation: 'Jumhur Bashriyyin menegaskan fa\'il tidak boleh mendahului amilnya. Jika mendahului, statusnya berubah jadi Mubtada\'.',
        hint: 'Ingat aturan letak fa\'il terhadap fi\'il menurut mazhab Bashrah.',
        examTip: 'I\'rab tahriri imtihan: «زيدٌ: مبتدأ مرفوع بالضمة الظاهرة. نجح: فعل ماضٍ مبني على الفتح، والفاعل ضمير مستتر جوازاً تقديره هو يعود على زيد، والجملة الفعلية في محل رفع خبر المبتدأ. ولا يجوز إعراب زيد فاعلاً مقدماً عند البصريين لأن رتبة الفاعل التأخر عن عامله».'
      },
      {
        question: 'Bila fa\'il berbentuk jamak (seperti: "الطُّلَّابُ"), menurut bahasa fushha jumhur bangsa Arab, fi\'il di depan tetap...',
        options: [
          'Berbentuk mufrad tanpa tanda jamak (misal: "حَضَرَ الطُّلَّابُ" - siswa-siswa telah hadir)',
          'Wajib diberi wawu jamak (misal: "حَضَرُوا الطُّلَّابُ" - mereka siswa-siswa telah hadir)',
          'Bebas boleh apa saja (tanpa aturan kaidah)',
          'Diberi ta\'nits selalu (tanda muannats)'
        ],
        answer: 0,
        explanation: 'Kaidah jumhur: fi\'il tetap mufrad bila fa\'ilnya zhahir ("حَضَرَ الطُّلَّابُ"). Pendapat yang memberi tanda jamak adalah lughah "akaluuni al-baraghit" yang langka.',
        hint: 'Apakah fi\'il di awal kalimat menyesuaikan jamak pada bahasa baku Al-Qur\'an?',
        examTip: 'Kaidah tahriri imtihan: «يجب تجريد الفعل من علامة التثنية والجمع إذا أسند إلى اسم ظاهر مثنى أو مجموع على لغة جمهور العرب الفصحى (كما في التنزيل: {وَقَالَ نِسْوَةٌ} ولم يقل قُلْنَ)، وما ورد بخلافه كلغة (أكلوني البراغيث) فهو شاذ أو قليل».'
      },
      {
        question: 'Ubah kalimat "كَتَبَ التِّلْمِيذُ الدَّرْسَ" menjadi kalimat mabni majhul yang benar!',
        options: [
          'كُتِبَ التِّلْمِيذُ (murid itu ditulis/dicatat)',
          'كُتِبَ الدَّرْسُ (pelajaran itu telah ditulis)',
          'كُتِبَ الدَّرْسَ (pelajaran itu telah ditulis)',
          'يُكْتَبُ التِّلْمِيذَ (sedang ditulis sang murid)'
        ],
        answer: 1,
        explanation: 'Fa\'il (at-tilmidz) dibuang, fi\'il madhi dijadikan "كُتِبَ", dan maf\'ul bih (ad-darsa) naik pangkat jadi na\'ibul fa\'il marfu\' ("الدَّرْسُ").',
        hint: 'Perhatikan perubahan harakat fi\'il dan harakat akhir na\'ibul fa\'il.',
        examTip: 'Langkah teknis imtihan: 1) حذف الفاعل (التلميذ), 2) تغيير صيغة الفعل: ضم أوله وكسر ما قبل آخره في الماضي فتصير (كُتِبَ), 3) إقامة المفعول به مقامه وإعطاؤه الرفع: «كُتِبَ الدَّرْسُ»، وإعراب (الدَّرْسُ): نائب فاعل مرفوع بالضمة الظاهرة.'
      },
      {
        question: 'Manakah di bawah ini yang BUKAN merupakan amil yang dapat merafakkan fa\'il?',
        options: [
          'Fi\'il tam (kata kerja sempurna)',
          'Isim Fa\'il (kata pelaku)',
          'Sifat Musyabbahah (kata sifat yang menyerupai)',
          'Huruf Nashab (kata perangkai penashab)'
        ],
        answer: 3,
        explanation: 'Huruf nashab hanya menashabkan fi\'il mudhari\' atau isim inna, bukan amil penentu rafa\' fa\'il.',
        hint: 'Cari kata tugas yang fungsinya menashabkan, bukan merafakkan.',
        examTip: 'Diktum ujian Alfiyah: «العامل في الفاعل إما فعل تام كـ(قامَ زيدٌ)، أو ما أشبه الفعل وهو: اسم الفاعل، الصفة المشبهة، المصدر، واسم التفضيل. أما حروف النصب والجر فهي عوامل في غير الفاعل ولا ترفعه قط».'
      },
      {
        question: 'Menurut Ibnu Malik dalam Alfiyah, jika fa\'il dibuang dan dalam kalimat terdapat Maf\'ul Bih serta Zharf / Jar Majrur, manakah yang WAJIB diprioritaskan menjadi Na\'ibul Fa\'il?',
        options: [
          'Maf\'ul Bih sharih wajib didahulukan menjadi Na\'ibul Fa\'il menurut jumhur Bashriyyin',
          'Zharf atau Jar Majrur bebas dipilih mendahului maf\'ul bih',
          'Semuanya tidak boleh menjadi pengganti fa\'il',
          'Kalimatnya dianggap batal / rusak susunannya'
        ],
        answer: 0,
        explanation: 'Ibnu Malik menegaskan dalam Alfiyah: "وَلَا يَنُوبُ بَعْضُ هَذِي إِنْ وُجِدْ • فِي اللَّفْظِ مَفْعُولٌ بِهِ وَقَدْ يَرِدْ". Jika maf\'ul bih sharih hadir, ia yang wajib menggantikan fa\'il.',
        hint: 'Maf\'ul bih adalah hak utama pengganti fa\'il karena kedekatan maknanya sebagai sasaran fi\'il.',
        examTip: 'Bait Alfiyah di lembar imtihan: «القاعدة عند البصريين: إذا وجد المفعول به الصريح تعين أن ينوب عن الفاعل، ولا يجوز إنابة الظرف أو الجار والمجرور أو المصدر مع وجوده، لقول ابن مالك: (ولا ينوب بعض هذي إن وجد * في اللفظ مفعول به وقد يرد). وخالف الكوفيون فأجازوا إنابة غيره مع وجوده».'
      },
      {
        question: 'Pada kalimat "طَلَعَتِ الشَّمْسُ" atau "طَلَعَ الشَّمْسُ", apakah hukum menyertakan Ta\' Ta\'nits pada fi\'ilnya?',
        options: [
          'Ja\'iz (boleh menyertakan atau membuang ta\') karena fa\'ilnya muannats majazi (matahari)',
          'Wajib menyertakan ta\' ta\'nits (karena matahari dianggap perempuan)',
          'Haram menyertakan ta\' ta\'nits (karena kata bukan wanita sejati)',
          'Tergantung harakat dhommah pada huruf akhir'
        ],
        answer: 0,
        explanation: 'Matahari (الشمس) adalah isim muannats majazi (tidak melahirkan/bertelur). Kaidah Nahwu: jika fa\'il muannats majazi zhahir, fi\'ilnya ja\'iz diberi ta\' atau tidak.',
        hint: 'Matahari bukan makhluk hidup yang beranak; maka ia tergolong muannats majazi.',
        examTip: 'Hukum tahriri imtihan: «حكم تأنيث الفعل هنا جائز؛ لأن الفاعل اسم ظاهر مجازي التأنيث (ليس له فرج يلد أو يبيض)، فيجوز أن يقال: (طلعت الشمس) وهو الأفصح، ويجوز: (طلع الشمس) بحذف التاء، بخلاف مؤنث الحقيقة المتصل بفعله فيجب تأنيثه».'
      },
      {
        question: 'Pada fi\'il muta\'addi dua maf\'ul seperti: "أُعْطِيَ الْفَقِيرُ دِرْهَمًا", bagaimana kedudukan i\'rab kata "الْفَقِيرُ" dan "دِرْهَمًا"?',
        options: [
          '"الْفَقِيرُ" na\'ibul fa\'il marfu\', dan "دِرْهَمًا" maf\'ul bih kedua tetap manshub (orang fakir diberi dirham)',
          'Keduanya sama-sama marfu\' sebagai na\'ibul fa\'il',
          '"الْفَقِيرُ" fa\'il muqaddam, "دِرْهَمًا" khabar',
          'Keduanya sama-sama manshub'
        ],
        answer: 0,
        explanation: 'Maf\'ul pertama naik pangkat menjadi na\'ibul fa\'il yang marfu\' ("الْفَقِيرُ"), sedangkan maf\'ul kedua tetap pada status asalnya yaitu manshub ("دِرْهَمًا").',
        hint: 'Na\'ibul fa\'il hanya mengambil satu jatah marfu\', maf\'ul sisanya tetap manshub.',
        examTip: 'I\'rab lengkap ujian: «أُعطي: فعل ماضٍ مبني للمجهول مبني على الفتح. الفقيرُ: نائب فاعل مرفوع بالضمة الظاهرة (وهو المفعول الأول في الأصل). درهماً: مفعول به ثانٍ منصوب بالفتحة الظاهرة؛ فالأصل: (أعطى المحسنُ الفقيرَ درهماً)».'
      },
      {
        question: 'Bila antara fi\'il dan fa\'il muannats haqiqi terdapat pemisah kata lain, misal: "حَضَرَ الْيَوْمَ فَاطِمَةُ", hukum memberi ta\' ta\'nits pada fi\'il menjadi...',
        options: [
          'Ja\'iz (boleh diberi ta\' atau tidak: حضر / حضرت) karena terpisah oleh fashil',
          'Wajib diberi ta\' mutlak (tetap wajib hadharat)',
          'Terlarang secara mutlak',
          'Wajib membuang fa\'il dari kalimat'
        ],
        answer: 0,
        explanation: 'Fashil (pemisah) seperti kata "اليوم" melemahkan kelekatan fi\'il dan fa\'il, sehingga hukum ta\' ta\'nits turun dari wajib menjadi JA\'IZ (boleh: حضر اليوم فاطمة / حضرت اليوم فاطمة).',
        hint: 'Adanya jeda kata memisahkan fi\'il dari fa\'il aslinya.',
        examTip: 'Kaidah ujian Alfiyah: «إذا فُصل بين الفعل وفاعله الحقيقي التأنيث بفاصل غير (إلا) جاز إثبات التاء وحذفها، مثل: (حضر اليوم فاطمة) و(حضرت اليوم فاطمة)، والإثبات أحسن وأفصح، والعلة أن الفاصل خفف شدة الاتصال بين العامل ومعموله».'
      },
      {
        question: 'Pada fi\'il amr untuk satu laki-laki seperti kalimat "اِقْرَأْ كِتَابَكَ", di manakah letak fa\'ilnya dan bagaimana hukum penyembunyiannya?',
        options: [
          'Fa\'ilnya dhamir mustatir WUJUBAN (wajib tersembunyi) takdirnya "أَنْتَ" (kamu laki-laki)',
          'Fa\'ilnya dhamir mustatir JAWIZAN takdirnya "هُوَ" (dia laki-laki)',
          'Fa\'ilnya adalah kata "كِتَابَ" (buku)',
          'Fi\'il amr tidak memiliki fa\'il sama sekali'
        ],
        answer: 0,
        explanation: 'Kaidah Alfiyah: fa\'il pada fi\'il amr lil wahid al-mudzakkar wajib disembunyikan (wujuban). Jika muncul kata "أَنْتَ" setelahnya (misal: اسكن أنت), itu adalah taukid, bukan fa\'il.',
        hint: 'Mustatir ada dua: wujuban (tidak bisa diganti isim zhahir) dan jawazan.',
        examTip: 'Dhabith penting imtihan: «الفاعل ضمير مستتر وجوباً تقديره (أنت). ومواضع الاستتار الواجب أربعة: 1) فعل الأمر للواحد المذكر (قم)، 2) الفعل المضارع المبدوء بهمزة المتكلم (أقوم)، 3) المضارع المبدوء بنون العظمة (نقوم)، 4) المضارع المبدوء بتاء خطاب الواحد المذكر (تقوم)».'
      }
    ]
  },
  {
    id: 'ushul-amr',
    title: 'Ushul Fiqh: Kaidah Al-Amr wal-Nahy',
    titleArabic: 'أُصُولُ الْفِقْهِ: الْأَمْرُ وَالنَّهْيُ',
    maddah: 'Ushul Fiqh (Fak. Syariah)',
    bossName: 'Syaikhul Ushul: Al-\'Allamah Al-Qadhi',
    bossLv: 45,
    bossRank: 'Rank S (Kibar Ulama)',
    bossRankCode: 'Rank S',
    bossHp: 100,
    bossAvatar: '👳‍♂️',
    stages: [
      {
        id: 1,
        levelNumber: 1,
        title: 'Level 1: Gerbang Shighat Al-Amr',
        titleArabic: 'الْمَرْحَلَةُ الأُولَى: بَابُ الصِّيَغِ',
        location: 'Bab Qaytbay • Gerbang Ushul',
        guardianName: 'Khadim Syariah: Pengawal Dalil',
        guardianRank: 'Rank C (Mubtadi\')',
        guardianRankCode: 'Rank C',
        guardianAvatar: '⚖️',
        bossHp: 60,
        expReward: 35,
        quizIndices: [2, 0],
        isFinal: false,
        lore: 'Buktikan bahwa engkau menguasai 4 shighat amr serta prinsip pokok bahwa asal perintah mutlak menuntut kewajiban.'
      },
      {
        id: 2,
        levelNumber: 2,
        title: 'Level 2: Ruwaq Al-Qarinah Ash-Shorifah',
        titleArabic: 'الْمَرْحَلَةُ الثَّانِيَةُ: رِوَاقُ الْقَرِينَةِ',
        location: 'Ruwaq Asy-Syawam • Bilik Istinbath',
        guardianName: 'Musa\'id Usuli: Pengkaji Madzhab',
        guardianRank: 'Rank B (Mutawassith)',
        guardianRankCode: 'Rank B',
        guardianAvatar: '📜',
        bossHp: 80,
        expReward: 50,
        quizIndices: [1, 3, 6],
        isFinal: false,
        lore: 'Timbang dalil-dalil pemaling amr dari wujub menuju ibahah, nadb, dan irsyad kemaslahatan duniawi.'
      },
      {
        id: 3,
        levelNumber: 3,
        title: 'Level 3: Shahn Al-Mubahatsah: Faur & Tikrar',
        titleArabic: 'الْمَرْحَلَةُ الثَّالِثَةُ: صَحْنُ الْمُبَاحَثَةِ',
        location: 'Pelataran Shahn Al-Azhar Asy-Syarif',
        guardianName: 'Muhaqqiq Usuli: Penimbang Hujjah',
        guardianRank: 'Rank A (Mutaqaddim)',
        guardianRankCode: 'Rank A',
        guardianAvatar: '⚖️',
        bossHp: 90,
        expReward: 65,
        quizIndices: [4, 5, 7],
        isFinal: false,
        lore: 'Uji ketajaman pemahaman mengenai waktu pelaksanaan perintah (faur/tarakhi) dan pengulangan saat terikat sebab.'
      },
      {
        id: 4,
        levelNumber: 4,
        title: 'FINAL BOSS: Mihrab Majelis Kibar Ulama',
        titleArabic: 'الْمَرْحَلَةُ الرَّابِعَةُ: الزَّعِيمُ الأَكْبَرُ',
        location: 'Mihrab Kabir Al-Azhar • Majelis Kibar Ulama',
        guardianName: 'Syaikhul Ushul: Al-\'Allamah Al-Qadhi',
        guardianRank: 'Rank S (Kibar Ulama)',
        guardianRankCode: 'Rank S',
        guardianAvatar: '👳‍♂️',
        bossHp: 100,
        expReward: 100,
        quizIndices: [8, 0, 1, 4],
        isFinal: true,
        lore: 'Al-\'Allamah Syaikhul Ushul menimbang pemahamanmu terhadap kaidah istinbath syar\'i! Taklukkan ujian akhir beliau untuk menyandang gelar Faqih Azhari!'
      }
    ],
    prologue: {
      chapter: 'HIKAYAT BAB III',
      title: 'Ujian Timbangan di Pelataran Cahaya',
      titleArabic: 'مِيزَانُ الْأُصُولِ فِي صَحْنِ الْأَزْهَرِ الشَّرِيفِ',
      location: 'Pelataran Marmer Al-Azhar • Fajar Menyingsing di Kairo',
      epigraph: '«الْأَصْلُ فِي الْأَمْرِ لِلْوُجُوبِ • مَا لَمْ تَصْرِفْهُ قَرِينَةُ الْإِبَاحَةِ»',
      epigraphMeaning: 'Kaidah asal kalimat perintah adalah menuntut kewajiban, selama tidak dipalingkan oleh qarinah.',
      dialogues: [
        {
          speaker: 'Narator',
          avatar: '⚖️',
          role: 'Cahaya Fajar Kairo',
          text: 'Semburat fajar perlahan membilas keheningan pelataran marmer putih Al-Azhar. Di tengah plaza suci itu, sebuah neraca keadilan kosmik melayang anggun di antara kubah dan bintang-bintang fajar.'
        },
        {
          speaker: 'Al-\'Allamah Syaikhul Ushul',
          avatar: '👳‍♂️',
          role: 'Ketua Dewan Fatwa & Ushul Al-Azhar',
          text: 'Hukum syariat bukanlah permainan sangkaan (zhann) belaka! Apakah engkau menyangka maqam seorang faqih dapat dicapai hanya dengan menghafal baris tanpa mengerti \'illat dan qarinah di balik Al-Amr dan An-Nahy?'
        },
        {
          speaker: 'Thalib Azhar',
          avatar: '🎓',
          role: 'Menunduk Takzim lalu Menatap Tegak',
          text: 'Kami menuntut ilmu untuk menegakkan keadilan dan kemaslahatan umat! Aku siap membuktikan pemahaman Ushul Fiqh yang telah diwariskan dari Imam Asy-Syafi\'i hingga masyayikh Al-Azhar!'
        },
        {
          speaker: 'Al-\'Allamah Syaikhul Ushul',
          avatar: '👳‍♂️',
          role: 'Dewan Kibar Ulama Tersenyum Arif',
          text: 'Jika demikian tekadmu, melangkahlah maju! Timbang setiap dalil dan tetapkan hukum dengan ketajaman burhanmu di hadapan majelis kami!'
        }
      ]
    },
    summary: [
      {
        heading: 'Hakikat Al-Amr (Perintah)',
        arabic: 'حَقِيقَةُ الْأَمْرِ',
        body: 'Al-Amr adalah tuntutan melakukan suatu perbuatan dari pihak yang lebih tinggi kedudukannya (طَلَبُ الْفِعْلِ عَلَى وَجْهِ الِاسْتِعْلَاءِ). Bentuk utamanya adalah Fi\'il Amr, Isim Fi\'il Amr, Mudhari\' dengan Lam Amr, dan Mashdar pengganti Fi\'il.'
      },
      {
        heading: 'Kaidah Pokok Al-Amr',
        arabic: 'الْأَصْلُ فِي الْأَمْرِ الْوُجُوبُ',
        body: 'Pada dasarnya bentuk amr yang mutlak (tanpa qarinah) berfaedah WAJIB (الْأَصْلُ فِي الْأَمْرِ لِلْوُجُوبِ). Amr hanya berpaling ke Nadb (sunnah) atau Ibahah (mubah) jika ada qarinah / dalil pemaling.'
      },
      {
        heading: 'Al-Amr Ba\'dan Nahy (Perintah setelah Larangan)',
        arabic: 'الْأَمْرُ بَعْدَ النَّهْيِ',
        body: 'Jumhur Ushuliyyin berpendapat bahwa perintah yang datang setelah adanya larangan mengembalikan hukum ke asalnya sebelum dilarang, yaitu IBAHAH (mubah), seperti perintah berburu setelah tahallul {وَإِذَا حَلَلْتُمْ فَاصْطَادُوا}.'
      }
    ],
    terms: [
      { term: 'الْأَمْرُ (Al-Amr)', def: 'Tuntutan berbuat dari yang lebih tinggi kepada yang lebih rendah secara istil\'a.' },
      { term: 'النَّهْيُ (An-Nahy)', def: 'Tuntutan meninggalkan perbuatan secara istil\'a yang pada dasarnya berfaedah tahrim.' },
      { term: 'الْقَرِينَةُ الصَّارِفَةُ (Al-Qarinah Ash-Sharifah)', def: 'Indikator yang memalingkan makna amr dari wajib ke sunnah atau mubah.' }
    ],
    flashcards: [
      { q: 'Apa hukum asal kalimat perintah (Al-Amr) yang terbebas dari qarinah?', a: 'Hukum asalnya menunjukkan WAJIB (الْوُجُوب).' },
      { q: 'Apakah perintah menuntut pengulangan (tikrar) menurut jumhur ushuliyyin?', a: 'Tidak menuntut tikrar, cukup dilakukan sekali saja kecuali jika dikaitkan dengan syarat atau sebab yang berulang.' },
      { q: 'Apa hukum perintah yang datang setelah larangan menurut jumhur?', a: 'Berfaedah Ibahah (kembali mubah), seperti perintah bertebaran di bumi setelah shalat Jum\'at.' }
    ],
    quiz: [
      {
        question: 'Kaidah ushul fiqh yang disepakati mayoritas ulama terkait amr mutlak adalah...',
        options: [
          'الْأَصْلُ فِي الْأَمْرِ لِلنَّدْبِ (asal perintah adalah sunnah)',
          'الْأَصْلُ فِي الْأَمْرِ لِلْوُجُوبِ (asal perintah adalah wajib)',
          'الْأَصْلُ فِي الْأَمْرِ لِلْإِبَاحَةِ (asal perintah adalah mubah)',
          'الْأَصْلُ فِي الْأَمْرِ لِلْكَرَاهَةِ (asal perintah adalah makruh)'
        ],
        answer: 1,
        explanation: 'Jumhur Ushuliyyin menetapkan "Al-Ashlu fil amri lil wujub" kecuali jika ditemukan qarinah shariqah.',
        hint: 'Perintah dari Allah kepada hamba pada teks nash asal konsekuensinya mengikat.',
        examTip: 'Teks jawaban tahriri imtihan: «الأصل في صيغة الأمر المجردة عن القرائن إفادة الوجوب عند جماهير الأصوليين؛ لقوله تعالى: {فَلْيَحْذَرِ الَّذِينَ يُخَالِفُونَ عَنْ أَمْرِهِ أَن تُصِيبَهُمْ فِتْنَةٌ}، ولإجماع الصحابة على وجوب امتثال أوامر الشارع فور ورودها ما لم تصرفها قرينة».'
      },
      {
        question: 'Firman Allah: {فَإِذَا قُضِيَتِ الصَّلَاةُ فَانتَشِرُوا فِي الْأَرْضِ}. Perintah "انتشروا" jatuh setelah larangan jual beli saat adzan Jum\'at. Menurut jumhur maknanya...',
        options: [
          'Wajib menyebar ke pasar (berdosa jika di masjid)',
          'Mubah (Ibahah) kembali beraktivitas mencari nafkah',
          'Makruh tinggal di dalam masjid',
          'Haram berdagang dan bertransaksi'
        ],
        answer: 1,
        explanation: 'Ini adalah contoh kaidah "Al-Amru ba\'dan nahyi yufidul ibahah". Setelah dilarang transaksi saat shalat, kini dibolehkan kembali.',
        hint: 'Apakah keluar masjid setelah shalat Jum\'at itu fardhu \'ain atau mubah?',
        examTip: 'Kaidah ushuliyyah imtihan: «الأمر الوارد بعد الحظر يفيد الإباحة عند المحققين من الأصوليين ورجوع الحكم إلى ما كان عليه قبل النهي؛ فالبيع والانتشار كانا مباحين ثم حُرِّما للنداء، فلما انقضت الصلاة زال المانع وعاد الحكم للإباحة».'
      },
      {
        question: 'Manakah contoh di bawah ini yang BUKAN termasuk shighat (bentuk kata) Al-Amr?',
        options: [
          'Fi\'il amr seperti: {أَقِيمُوا الصَّلَاةَ} (Dirikanlah shalat)',
          'Fi\'il mudhari\' dengan Lam Amr: {فَلْيَصُمْهُ} (Maka berpuasalah)',
          'Isim fi\'il amr seperti: "حَيَّ عَلَى الصَّلَاةِ" (Marilah shalat)',
          'Fi\'il madhi seperti: "قَامَ زَيْدٌ" (Zaid telah berdiri - kalimat berita)'
        ],
        answer: 3,
        explanation: 'Fi\'il madhi murni "qaama" adalah kalimat berita (khabariyyah), bukan shighat tuntutan amr.',
        hint: 'Cari yang bermakna kalimat berita masa lalu, bukan perintah.',
        examTip: '4 Shighat wajib hafal di ujian: «صيغ الأمر أربع: 1) فعل الأمر الصريح كـ(أقيموا)، 2) الفعل المضارع المقرون بلام الأمر كـ(لينفق)، 3) اسم فعل الأمر كـ(صه، حيَّ)، 4) المصدر النائب عن فعله كـ(إحساناً). أما الفعل الماضي المجرد فهو خبر لا طلب».'
      },
      {
        question: 'Firman Allah Ta\'ala: {فَكَاتِبُوهُمْ إِنْ عَلِمْتُمْ فِيهِمْ خَيْرًا}. Menurut jumhur fuqaha & ushuliyyin, shighat amr "كاتبوهم" di sini berfaedah...',
        options: [
          'An-Nadb (sunnah) karena adanya qarinah kesepakatan pelepasan hak milik',
          'Al-Wujub (wajib mengikat bagi majikan)',
          'Al-Ibahah (hanya mubah tanpa pahala)',
          'At-Tahrim (diharamkan)'
        ],
        answer: 0,
        explanation: 'Jumhur berpendapat akad mukatabah adalah sunnah (nadb) bukan wajib, karena harta budak adalah hak tuannya, dan seseorang tidak dipaksa melepaskan hak miliknya tanpa keridhaan.',
        hint: 'Mukatabah adalah pembebasan budak dengan tebusan berkala; apakah majikan dipaksa wajib?',
        examTip: 'Formula tahriri imtihan: «الأمر هنا صُرف عن الوجوب إلى الندب بقرينة الإجماع والقواعد الكلية؛ إذ المكاتبة معاوضة على مال السيد، ولا يُجبر أحد على إخراج ماله من ملكه بغير رضاه لقوله صلى الله عليه وسلم: (لا يحل مال امرئ مسلم إلا بطيب نفس منه)».'
      },
      {
        question: 'Apakah shighat Al-Amr (perintah mutlak) menuntut pelaksanaan seketika itu juga (Al-Faur) atau boleh ditunda (At-Tarakhi) menurut jumhur ushuliyyin?',
        options: [
          'Muthlaqul amri la yaqtadhi fauran wa la tarakhiyan (hanya menuntut esensi perbuatan terwujud tanpa batasan waktu tertentu)',
          'Wajib langsung seketika itu juga (Al-Faur) mutlak tanpa jeda',
          'Hanya boleh dikerjakan di akhir hayat (At-Tarakhi)',
          'Perintah mutlak tidak memiliki kekuatan hukum'
        ],
        answer: 0,
        explanation: 'Pendapat mu\'tamad jumhur ushuliyyin Asy-Syafi\'iyyah: shighat amr hanya menunjukkan tuntutan mewujudkan hakikat perbuatan (ithlaq mahiyyah al-fi\'l), adapun kesegeraan (faur) atau kelonggaran (tarakhi) memerlukan dalil/qarinah luar.',
        hint: 'Pahami hakikat lafadz amr tanpa tambahan indikator waktu eksternal.',
        examTip: 'Tahrir madzhab imtihan: «المعتمد عند جماهير الشافعية والمحققين: أن مطلق الأمر لا يقتضي فَوْراً ولا تَرَاخِياً لذاته، وإنما يقتضي إيجاد المأمور به في الجملة من غير قيد بالزمن الأول أو الثاني، إلا إذا اقترن بقرينة تدل على أحدهما، مع اتفاقهم على أن المبادرة بالامتثال مستحبة شرعاً».'
      },
      {
        question: 'Dalil Al-Qur\'an terkuat yang dijadikan hujjah mayoritas ulama bahwa asal perintah adalah menuntut hukum WAJIB adalah...',
        options: [
          '{فَلْيَحْذَرِ الَّذِينَ يُخَالِفُونَ عَنْ أَمْرِهِ أَن تُصِيبَهُمْ فِتْنَةٌ أَوْ يُصِيبَهُمْ عَذَابٌ أَلِيمٌ} (Hendaklah takut orang yang menyalahi perintah Rasul ditimpa fitnah atau azab pedih)',
          '{وَإِذَا حَلَلْتُمْ فَاصْطَادُوا} (Dan apabila kamu telah bertahalul, maka berburulah)',
          '{كُلُوا وَاشْرَبُوا} (Makan dan minumlah kalian)',
          '{وَأَشْهِدُوا إِذَا تَبَايَعْتُمْ} (Dan adakanlah saksi apabila kamu berjual beli)'
        ],
        answer: 0,
        explanation: 'Ayat An-Nur: 63 ini mengancam orang yang menyalahi amr Nabi dengan fitnah dan siksa pedih. Ancaman siksa hanya terjadi pada pelanggaran kewajiban mutlak.',
        hint: 'Cari ayat yang mengandung ancaman azab bagi siapa pun yang berani melanggar amr.',
        examTip: 'Wajhul istidlal kurrasah: «وجه الاستدلال من الآية: أن الله تعالى حذّر وتوعّد بالعذاب الأليم لمن خالف أمر رسوله صلى الله عليه وسلم، والوعيد لا يترتب شرعاً إلا على ترك الواجب؛ فدل ذلك قطعاً على أن الأمر المجرد يفيد الوجوب حقيقةً».'
      },
      {
        question: 'Firman Allah Ta\'ala dalam ayat mudayanah: {وَأَشْهِدُوا إِذَا تَبَايَعْتُمْ} (Dan adakanlah saksi apabila kamu berjual beli). Amr di sini berfaedah...',
        options: [
          'Al-Irsyad (bimbingan kemaslahatan duniawi menjaga transaksi, bukan wajib)',
          'Al-Wujub (wajib berdosa jika tanpa saksi)',
          'At-Tahdid (ancaman)',
          'At-Ta\'jiz (melemahkan lawan)'
        ],
        answer: 0,
        explanation: 'Perintah persaksian jual beli bertujuan irsyad (edukasi maslahat menjaga bukti harta). Rasulullah SAW sendiri pernah membeli kuda dari orang Arab dusun tanpa menghadirkan saksi.',
        hint: 'Rasulullah SAW dan para sahabat biasa jual beli di pasar tanpa selalu memanggil dua saksi.',
        examTip: 'Jawaban kurrasah imtihan: «الأمر هنا للإرشاد وليس للوجوب؛ والقرينة الصارفة: فعل النبي صلى الله عليه وسلم والصحابة بالتبايع دون إشهاد، كقصة شراء النبي الفرس من الأعرابي، ولأن المقصود حفظ مصالح العباد الدنيوية ودفع النزاع، فهو إرشاد لما هو أصلح للمتعاقدين».'
      },
      {
        question: 'Apakah kalimat perintah (Al-Amr) menuntut pengulangan perbuatan (Tikrar) jika dikaitkan dengan syarat atau sebab yang berulang?',
        options: [
          'Ya, berulang seiring berulangnya sebab/syarat (seperti perintah wudhu tiap hadats atau shalat tiap waktu masuk)',
          'Tidak akan pernah berulang sama sekali walau sebabnya berulang ribuan kali',
          'Gugur setelah satu kali selamanya',
          'Menjadi makruh diulang setelah pelaksanaan pertama'
        ],
        answer: 0,
        explanation: 'Meskipun amr mutlak tidak menuntut tikrar, bila amr dikaitkan pada sebab (mu\'allaq \'ala sabab atau syarth), amr berulang seiring terulangnya sebab tersebut ("kullama takarrara as-sabab takarrara al-musabbab").',
        hint: 'Kapan shalat lima waktu wajib dikerjakan? Setiap kali waktu tergelincirnya matahari masuk.',
        examTip: 'Kaidah ushuliyyah imtihan: «الأمر المعلق على شرط أو سبب يتكرر بتكرره إجماعاً؛ كقوله تعالى: {أَقِمِ الصَّلَاةَ لِدُلُوكِ الشَّمْسِ} وقوله: {وَإِن كُنتُمْ جُنُبًا فَاطَّهَّرُوا}، فالقاعدة: (الحكم يدور مع علته وسببه وجوداً وعدماً، وكلما تكرر السبب تكرر المسبَّب)».'
      },
      {
        question: 'Kaidah ushul fiqh mashhur yang menetapkan kewajiban sarana perantara bagi terlaksananya perintah pokok adalah...',
        options: [
          'مَا لَا يَتِمُّ الْوَاجِبُ إِلَّا بِهِ فَهُوَ وَاجِبٌ (perkara yang tanpanya kewajiban tak sempurna, hukumnya ikut wajib)',
          'الْأَصْلُ فِي الْأَشْيَاءِ الْإِبَاحَةُ (hukum asal pada segala sesuatu adalah mubah/boleh)',
          'الضَّرَرُ يُزَالُ (segala bentuk kemudharatan wajib dihilangkan)',
          'الْعَادَةُ مُحَكَّمَةٌ (adat kebiasaan masyarakat dapat dijadikan pijakan hukum)'
        ],
        answer: 0,
        explanation: 'Jika kewajiban mutlak tidak bisa tercapai kecuali melalui perantara (wasa\'il) yang berada dalam kesanggupan mukallaf (seperti berjalan ke masjid untuk Jum\'atan atau membeli air untuk wudhu), wasilah itu hukumnya ikut menjadi wajib.',
        hint: 'Ingat kaidah مقدمة الواجب (Mukaddimah Wajib).',
        examTip: 'Kaidah tahriri di kurrasah: «قاعدة (ما لا يتم الواجب المطلق إلا به وكان بمقدور المكلف فهو واجب): كالطهارة للصلاة، والسعي إلى الجمعة؛ لأن الأمر بالشيء أمر به وبما لا يتم إلا به من لوازمه ووسائله، وللوسائل أحكام المقاصد».'
      }
    ]
  },
];

/* ── HELPER TYPOGRAFI ARAB & FORMULA UJIAN TAHRIRI ── */
const containsArabic = (str) => /[\u0600-\u06FF]/.test(str || '');

/**
 * SmartText:
 * Merender teks campuran Latin & Arab dengan font scale proporsional.
 * Bagian Arab memakai font-arabic (Noto Naskh Arabic) ukuran besar, line-height luas,
 * dan dir="rtl" agar harakat & tanda baca tidak saling bertumpuk.
 */
function SmartText({ text, className = '', isArabicLarge = true }) {
  if (!text) return null;
  const str = String(text);
  if (!containsArabic(str)) {
    return <span className={className}>{str}</span>;
  }

  // Jika mayoritas teks adalah huruf Arab
  // Hitung huruf saja: harakat (U+064B\u2013U+065F, U+0670) membuat kutipan pendek yang berharakat tampak
  // "mayoritas Arab", lalu seluruh paragraf Indonesia ikut dirender RTL dan tanda bacanya pindah ke depan.
  const arabicCount = (str.match(/[\u0621-\u064A\u0671-\u06D3]/g) || []).length;
  const latinCount = (str.match(/[a-zA-Z]/g) || []).length;

  if (arabicCount > 0 && arabicCount >= latinCount * 2) {
    return (
      <span
        dir="rtl"
        className={`font-arabic text-right inline-block ${
          isArabicLarge
            ? 'text-base sm:text-lg md:text-xl leading-[2.2] text-emerald-200'
            : 'text-sm sm:text-base leading-[2.0]'
        } ${className}`}
      >
        {str}
      </span>
    );
  }

  // Teks campuran Latin dan kutipan Arab
  const segments = str.split(/([\u0600-\u06FF][\u0600-\u06FF\s\u064B-\u065F\u0670\u06D6-\u06ED\.\،\:\(\)\{\}\«\»\-]+[\u0600-\u06FF])/g);

  return (
    <span className={className}>
      {segments.map((seg, idx) => {
        if (containsArabic(seg)) {
          return (
            <span
              key={idx}
              dir="rtl"
              className="font-arabic text-[1.28em] leading-[2.2] font-semibold text-emerald-300 inline-block px-1 mx-0.5 select-text align-baseline"
            >
              {seg}
            </span>
          );
        }
        return <span key={idx}>{seg}</span>;
      })}
    </span>
  );
}

/* ── HELPER: KAMUS TERJEMAHAN FORMULA LEMBAR UJIAN (KURRASAH IJABAH) ── */
function getExamTipTranslation(text, explicitTranslation = null) {
  if (explicitTranslation) return explicitTranslation;
  if (!text) return null;

  const str = String(text);

  // 1. Nahwu: Alfiyah Ibnu Malik
  if (str.includes('تجريد الفعل من علامة التثنية والجمع') || str.includes('أكلوني البراغيث') || str.includes('وقال نسوة')) {
    return 'Wajib mengosongkan (men-tajrid) kata kerja dari tanda mutsanna atau jamak apabila disandarkan kepada isim zhahir mutsanna maupun jamak menurut bahasa baku fushha mayoritas bangsa Arab (seperti dalam Al-Qur\'an: {وَقَالَ نِسْوَةٌ} memakai kata tunggal "qaala" bukan jamak "qulna"). Adapun bentuk yang menyalahinya seperti dialek "akaluuni al-baraghit" tergolong langka atau syadz.';
  }

  if (str.includes('مبتدأ مرفوع بالضمة الظاهرة') && (str.includes('نجح: فعل ماضٍ') || str.includes('رتبة الفاعل التأخر'))) {
    return 'I\'rab: "Zaid" adalah Mubtada\' marfu\' dengan dhommah zhahirah. "Najaha" adalah Fi\'il Madhi mabni fathah, dan fa\'ilnya adalah dhamir mustatir jawazan takdirnya "huwa" (dia) yang merujuk pada Zaid. Jumlah fi\'liyyah menjadi khabar bagi mubtada\'. Menurut ulama Bashrah tidak boleh menganggap Zaid sebagai fa\'il muqaddam karena martabat fa\'il wajib terletak setelah amilnya.';
  }

  if (str.includes('حذف الفاعل (التلميذ)') || str.includes('كُتِبَ الدَّرْسُ')) {
    return 'Langkah merubah kalimat ke mabni majhul: 1) Buang fa\'ilnya ("at-tilmidz"), 2) Ubah harakat fi\'il madhi: dhommah huruf pertama dan kasrah huruf sebelum akhir menjadi "kutiba", 3) Posisikan maf\'ul bih menggantikan fa\'il dengan harakat rafa\': "Kutiba ad-darsu". I\'rab "ad-darsu" adalah na\'ibul fa\'il marfu\' dengan dhommah zhahirah.';
  }

  if (str.includes('العامل في الفاعل إما فعل تام') || str.includes('قامَ زيدٌ')) {
    return 'Amil yang merafakkan fa\'il ada dua macam: 1) Fi\'il tam (seperti "qaama zaidun"), 2) Syibhul fi\'il (yang menyerupai fi\'il) yaitu: Isim Fa\'il, Sifat Musyabbahah, Mashdar, dan Isim Tafdhil. Adapun huruf nashab dan huruf jar beramal pada kata lain dan tidak pernah merafakkan fa\'il.';
  }

  if (str.includes('إذا وجد المفعول به الصريح تعين أن ينوب') || str.includes('ولا ينوب بعض هذي')) {
    return 'Kaidah menurut ulama Bashrah: Jika terdapat maf\'ul bih sharih dalam kalimat, maka maf\'ul bih tersebut WAJIB diprioritaskan menjadi na\'ibul fa\'il, dan tidak boleh menunjuk zharf atau jar majrur selama maf\'ul bih masih ada, sesuai bait Ibnu Malik dalam Alfiyah. Sedangkan ulama Kufah membolehkan menggantinya dengan yang lain.';
  }

  if (str.includes('اسم ظاهر مجازي التأنيث') || str.includes('طلعت الشمس')) {
    return 'Hukum menyertakan ta\' ta\'nits di sini adalah JA\'IZ (boleh); karena fa\'ilnya adalah isim zhahir muannats majazi (tidak melahirkan atau bertelur). Maka boleh diucapkan: "Thala\'at asy-syamsu" (lebih fasih) dan boleh pula: "Thala\'a asy-syamsu" tanpa huruf ta\', berbeda dengan muannats hakiki bersambung yang wajib memakai ta\'.';
  }

  if (str.includes('أُعطي: فعل ماضٍ مبني للمجهول') || str.includes('الفقيرُ: نائب فاعل')) {
    return 'I\'rab: "U\'thiya" adalah Fi\'il Madhi mabni majhul fathah. "Al-Faqiiru" adalah na\'ibul fa\'il marfu\' dengan dhommah (asalnya maf\'ul pertama). "Dirhaman" adalah maf\'ul bih kedua yang tetap berstatus manshub dengan fathah; karena susunan aslinya adalah: "A\'tha al-muhsinu al-faqiira dirhaman".';
  }

  if (str.includes('فُصل بين الفعل وفاعله الحقيقي التأنيث بفاصل') || str.includes('حضر اليوم فاطمة')) {
    return 'Jika antara fi\'il dan fa\'il muannats hakiki diselingi pemisah (fashil) selain kata "illa", maka hukum ta\' berubah menjadi JA\'IZ (boleh ditetapkan atau dibuang): boleh "Hadhara al-yauma Fathimah" atau "Hadharat al-yauma Fathimah" (lebih afshah). Alasannya karena adanya pemisah melemahkan keeratan hubungan fi\'il dan fa\'il.';
  }

  if (str.includes('الفاعل ضمير مستتر وجوباً تقديره (أنت)') || str.includes('مواضع الاستتار الواجب أربعة')) {
    return 'Fa\'ilnya adalah dhamir mustatir WUJUBAN (wajib tersembunyi) takdirnya "anta" (kamu). 4 Posisi wajib tersembunyi menurut kaidah nahwu: 1) Fi\'il amr untuk satu laki-laki (qum), 2) Fi\'il mudhari\' berawalan hamzah mutakallim (aqumu), 3) Mudhari\' berawalan nun jamak (naqumu), 4) Mudhari\' berawalan ta\' mukhatab satu laki-laki (taqumu).';
  }

  // 2. Ushul Fiqh: Kaidah Al-Amr
  if (str.includes('الأصل في صيغة الأمر المجردة عن القرائن إفادة الوجوب') || str.includes('فليحذر الذين يخالفون')) {
    return 'Hukum asal bentuk kalimat perintah yang terbebas dari qarinah adalah berfaedah WAJIB menurut mayoritas ulama ushul; berdasarkan firman Allah Ta\'ala: "Hendaklah orang yang menyalahi perintah Rasul takut ditimpa fitnah atau azab pedih", serta ijma\' para sahabat atas kewajiban mematuhi perintah syariat seketika kecuali jika ada qarinah pemaling.';
  }

  if (str.includes('الأمر الوارد بعد الحظر يفيد الإباحة') || str.includes('فانتشروا في الأرض')) {
    return 'Perintah yang datang setelah adanya larangan berfaedah IBAHAH (kebolehan/mubah) menurut para peneliti ushul, dan mengembalikan hukum ke kondisi semula sebelum adanya larangan. Jual beli semula mubah lalu diharamkan karena adzan Jum\'at, maka ketika shalat telah usai, halangannya hilang dan statusnya kembali mubah.';
  }

  if (str.includes('صيغ الأمر أربع') || str.includes('فعل الأمر الصريح')) {
    return 'Bentuk kata perintah pokok ada empat: 1) Fi\'il amr sharih (seperti: "Aqiimuu"), 2) Fi\'il mudhari\' yang digandengkan dengan Lam Amr (seperti: "Liyunfiq"), 3) Isim fi\'il amr (seperti: "Shah" diamlah, "Hayya" kemarilah), 4) Mashdar pengganti fi\'il (seperti: "Wa bil walidaini ihsaanaa"). Adapun fi\'il madhi murni adalah kalimat berita (khabar), bukan tuntutan (thalab).';
  }

  if (str.includes('الأمر هنا صُرف عن الوجوب إلى الندب') || str.includes('فكاتبوهم')) {
    return 'Perintah mukatabah di sini dipalingkan dari wajib menjadi SUNNAH (nadb) berdasarkan qarinah ijma\' dan kaidah kulliyyah; karena mukatabah adalah transaksi atas hak milik majikan, dan seseorang tidak boleh dipaksa melepaskan hartanya tanpa kerelaan hati, berdasarkan sabda Nabi: "Tidak halal harta seorang muslim kecuali dengan kerelaan jiwanya".';
  }

  if (str.includes('مطلق الأمر لا يقتضي فَوْراً ولا تَرَاخِياً') || str.includes('المعتمد عند جماهير الشافعية')) {
    return 'Pendapat mu\'tamad jumhur ulama Syafi\'iyyah dan para peneliti: Perintah mutlak pada zatnya tidak menuntut pelaksanaan seketika (faur) maupun tunda (tarakhi), melainkan hanya menuntut terwujudnya esensi perbuatan tanpa terikat waktu awal atau akhir, kecuali bila ada qarinah luar, dengan kesepakatan bahwa bersegera mematuhi adalah mustahab.';
  }

  if (str.includes('وجه الاستدلال من الآية') || str.includes('والوعيد لا يترتب شرعاً إلا على ترك الواجب')) {
    return 'Sisi pendalilan ayat: Allah Ta\'ala memberi peringatan dan ancaman azab pedih bagi siapa pun yang menyalahi perintah Rasulullah SAW. Secara syariat ancaman siksa tidak pernah dijatuhkan kecuali atas pelanggaran perkara yang WAJIB; hal ini menjadi bukti qath\'i bahwa perintah mutlak hakikatnya menuntut kewajiban.';
  }

  if (str.includes('الأمر هنا للإرشاد وليس للوجوب') || str.includes('وأشهدوا إذا تبايعتم')) {
    return 'Perintah di sini bertujuan IRSYAD (bimbingan kemaslahatan duniawi) bukan kewajiban mengikat; qarinah pemalingnya adalah fakta bahwa Rasulullah SAW dan para sahabat biasa jual beli tanpa selalu menghadirkan saksi (seperti kisah pembelian kuda dari orang Arab dusun), dan tujuannya adalah mencegah sengketa bisnis.';
  }

  if (str.includes('الأمر المعلق على شرط أو سبب يتكرر بتكرره') || str.includes('الحكم يدور مع علته')) {
    return 'Perintah yang dikaitkan dengan syarat atau sebab akan BERULANG seiring berulangnya sebab tersebut berdasarkan ijma\' ulama; seperti perintah shalat setiap tergelincir matahari atau perintah mandi wajib tiap kali junub. Kaidahnya: "Hukum berputar bersama \'illat dan sebabnya, setiap kali sebab berulang maka kewajiban berulang".';
  }

  if (str.includes('ما لا يتم الواجب المطلق إلا به') || str.includes('وللوسائل أحكام المقاصد')) {
    return 'Kaidah: "Perkara yang tanpanya kewajiban mutlak tidak sempurna dan berada dalam kesanggupan mukallaf, maka hukum perantara tersebut ikut menjadi WAJIB". Contohnya: bersuci untuk shalat dan berjalan menuju masjid shalat Jum\'at; karena perintah atas suatu tujuan mencakup perintah atas sarana perantaranya (hukum wasilah mengikuti hukum tujuan).';
  }

  // 3. Balaghah: Majaz Mursal
  if (str.includes('المجاز مرسل علاقته الكلية') && str.includes('الأنامل')) {
    return 'Majaz mursal ini memiliki alaqah Kulliyyah (menyebut keseluruhan padahal sebagian); di mana Allah menyebut seluruh jari (al-ashaabi\') tetapi yang dimaksud adalah sebagian kecil yaitu ujung-ujung jari (al-anamil). Qarinah-nya berupa indikator situasi (haliyyah) yang mencegah makna asli, karena mustahil memasukkan seluruh jari ke dalam lubang telinga.';
  }

  if (str.includes('علاقة المجاز المرسل غير المشابهة') && str.includes('الاستعارة هي المشابهة')) {
    return 'Perbedaan mendasarnya: Alaqah pada Majaz Mursal BUKAN penyerupaan (seperti sebab, musabbab, sebagian, keseluruhan), sedangkan alaqah pada Isti\'arah SELALU berupa penyerupaan (tasybih), di mana keduanya sama-sama memiliki qarinah yang mencegah makna hakiki.';
  }

  if (str.includes('أطلق السبب وهو (الغيث / المطر)') || str.includes('رعينا')) {
    return 'Disebutkan sebabnya yaitu hujan (al-ghaits) tetapi yang dimaksud adalah dampaknya yaitu tanaman/rumput (al-\'usyb); karena hujan adalah sebab tumbuhnya rumput. Alaqahnya adalah Sababiyyah, dan qarinahnya tertulis (lafdziyyah) yaitu kata "ra\'aina" (kami menggembala), sebab air hujan hakikatnya tidak bisa digembalakan.';
  }

  if (str.includes('علاقته اعتبار ما كان') && str.includes('لا يُتْمَ بعد احتلام')) {
    return 'Alaqahnya adalah I\'tibar Ma Kana (memandang masa lalu); karena setelah baligh dan harta diserahkan, status yatim secara syar\'i telah gugur (berdasarkan sabda Nabi: "Tidak ada status yatim setelah baligh"). Mereka tetap dipanggil yatim meninjau status masa lalunya untuk melunakkan hati para wali agar menjaga hak-hak mereka.';
  }

  if (str.includes('المجاز مرسل علاقته الجزئية') && str.includes('العين')) {
    return 'Majaz mursal ber-alaqah Juz\'iyyah (menyebut sebagian); disebutkan sebagian anggota tubuh yaitu mata (\'ain) karena merupakan organ terpenting dalam mengintai musuh, namun yang dimaksud adalah person utuh sang pengintai. Qarinahnya adalah haliyyah dari konteks pengiriman tugas mata-mata.';
  }

  if (str.includes('المجاز مرسل علاقته المسبَّبية') && str.includes('الرزق')) {
    return 'Majaz mursal ber-alaqah Musabbabiyyah (menyebut akibat); di mana disebut akibat/dampak yaitu "rizqi" padahal maksudnya sebabnya yaitu air hujan; karena hujan menjadi sebab tumbuhnya tanaman bahan rezeki. Qarinahnya adalah kata "yunazzilu minas sama" (turun dari langit), karena yang turun langsung dari langit adalah hujan.';
  }

  if (str.includes('علاقته اعتبار ما سيكون') && str.includes('الخمر مائع لا يُعصر')) {
    return 'Alaqahnya adalah I\'tibar Ma Yakun (memandang masa depan); karena khamr adalah cairan yang mustahil diperas lagi. Yang diperas hakikatnya adalah buah anggur yang nantinya akan berproses menjadi khamr. Penamaan buah anggur dengan khamr meninjau wujud jadinya di masa mendatang, dengan qarinah logika akal (\'aqliyyah).';
  }

  if (str.includes('المجاز مرسل علاقته المحلية') && str.includes('النادي')) {
    return 'Majaz mursal ber-alaqah Mahalliyyah (menyebut tempat); di mana disebutkan tempat pertemuan yaitu "an-nadi" (aula/balai perkumpulan), padahal yang dimaksud adalah orang-orang di dalamnya (kaum kerabat dan pendukungnya). Qarinahnya haliyyah karena mustahil memanggil gedung/ruangan untuk menolong manusia.';
  }

  if (str.includes('المجاز مرسل علاقته الحالية') && str.includes('رحمة الله')) {
    return 'Majaz mursal ber-alaqah Haliyyah (menyebut sifat/keadaan yang menempati); di mana disebut "rahmat Allah" padahal yang dimaksud tempatnya yaitu Surga; karena rahmat adalah sifat abstrak, sedangkan keabadian menuntut wadah tempat tinggal, ditunjukkan qarinah lafadz: "hum fiiha khaaliduun" (mereka kekal di dalamnya).';
  }

  return null;
}

/**
 * ExamTipBlock:
 * Komponen khusus untuk menampilkan Formula Jawaban Lembar Ujian (Kurrasah Ijabah Tahriri Azhar).
 * Teks Arab ditampilkan dengan font besar (18px-22px), font-arabic (Noto Naskh Arabic),
 * dan di bawahnya terdapat TERJEMAHAN BAHASA INDONESIA kecil dan jelas sehingga pengguna
 * dapat memahami makna dan maksud rumus jawaban lembar ujian dengan mudah.
 */
function ExamTipBlock({ tip, translation = null, compact = false }) {
  if (!tip) return null;

  // Ekstrak label sebelum titik dua pertama jika ada label latin
  let label = "CARA JAWAB DI LEMBAR UJIAN (TAHRIRI AL-AZHAR)";
  let rawContent = tip;

  const colonIdx = tip.indexOf(':');
  if (colonIdx > 0 && colonIdx < 50) {
    const candidateLabel = tip.slice(0, colonIdx).trim();
    if (!containsArabic(candidateLabel)) {
      label = candidateLabel.toUpperCase();
      rawContent = tip.slice(colonIdx + 1).trim();
    }
  }

  // Bersihkan tanda petik guillemet « » jika membungkus teks
  const cleanContent = rawContent.replace(/^«\s*/, '').replace(/\s*»$/, '').trim();
  const hasArabic = containsArabic(cleanContent);
  const resolvedTranslation = getExamTipTranslation(cleanContent, translation);

  return (
    <div className={`rounded-xl border-2 border-amber-500/40 bg-gradient-to-b from-[#1c140a] via-[#140e06] to-[#0c0904] ${compact ? 'p-3' : 'p-4'} shadow-xl space-y-2.5`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-amber-500/25 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg"><PixelIcon name="quill" className="w-[1.15em] h-[1.15em]" /></span>
          <span className="font-mono text-xs sm:text-[13px] font-bold text-amber-300 tracking-wide uppercase">
            {label}
          </span>
        </div>
        <span className="text-[10px] sm:text-[11px] font-mono font-semibold text-amber-300 bg-amber-500/15 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
          Kurrasah Ijabah
        </span>
      </div>

      {/* Main Answer Area: Teks Arab Besar & Nyaman Dibaca */}
      <div className="rounded-lg bg-black/60 border border-amber-400/30 p-3.5 sm:p-4.5 space-y-3">
        {hasArabic ? (
          <div
            dir="rtl"
            className={`font-arabic text-right text-amber-50 select-text font-normal ${
              compact
                ? 'text-base sm:text-lg md:text-xl leading-[2.2]'
                : 'text-lg sm:text-xl md:text-2xl leading-[2.3]'
            }`}
            style={{
              textRendering: 'optimizeLegibility',
              wordSpacing: '0.08em'
            }}
          >
            {cleanContent}
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-amber-100 font-serif leading-relaxed select-text">
            {cleanContent}
          </p>
        )}

        {/* ── TERJEMAHAN BAHASA INDONESIA RUMUS UJIAN ── */}
        {resolvedTranslation && (
          <div className="pt-2.5 border-t border-amber-500/25 bg-amber-500/10 p-2.5 sm:p-3 rounded-lg border border-amber-400/20 text-left">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/25 px-2 py-0.5 rounded border border-amber-400/35 flex items-center gap-1">
                <span>🇮🇩</span>
                <span>TERJEMAHAN RUMUS UJIAN:</span>
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-amber-100/95 font-sans leading-relaxed select-text">
              {resolvedTranslation}
            </p>
          </div>
        )}
      </div>

      {/* Footer Hint */}
      <div className="flex items-center justify-between text-[11px] text-amber-300/70 font-mono pt-0.5">
        <span className="flex items-center gap-1">
          <span><PixelIcon name="bulb" className="w-[1.15em] h-[1.15em]" /></span>
          <span>Tuliskan rumus ibarat ini di lembar ujian untuk nilai Mumtaz.</span>
        </span>
        <span className="font-arabic text-xs sm:text-sm text-amber-400 font-medium" dir="rtl">صِيغَةُ الْإِجَابَةِ النَّمُوذَجِيَّة</span>
      </div>
    </div>
  );
}

/* ── HELPER: PARSER TERJEMAHAN BAHASA INDONESIA UNTUK PILIHAN JAWABAN ── */
function parseOptionTranslation(text) {
  if (!text || typeof text !== 'string') return { main: '', trans: '' };
  const trimmed = text.trim();

  // 1. Pola kurung di akhir: "Teks Utama (Terjemahan Bahasa Indonesia)"
  const endParenMatch = trimmed.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (endParenMatch) {
    const main = endParenMatch[1].trim();
    const trans = endParenMatch[2].trim();
    if (main && trans) {
      return { main, trans };
    }
  }

  // 2. Pola tanda hubung: "Teks Arab - Terjemahan Indonesia"
  const dashMatch = trimmed.match(/^([\u0600-\u06FF\s\{\}\.]+)\s*[-–—:]\s*(.+)$/);
  if (dashMatch) {
    const main = dashMatch[1].trim();
    const trans = dashMatch[2].trim();
    if (main && trans) {
      return { main, trans };
    }
  }

  // 3. Fallback kamus otomatis untuk teks Arab murni tanpa kurung
  const AUTO_TRANSLATIONS = {
    'الْأَصْلُ فِي الْأَمْرِ لِلْوُجُوبِ': 'Asal hukum perintah menuntut kewajiban',
    'الْأَصْلُ فِي الْأَمْرِ لِلنَّدْبِ': 'Asal hukum perintah adalah sunnah',
    'الْأَصْلُ فِي الْأَمْرِ لِلْإِبَاحَةِ': 'Asal hukum perintah adalah mubah/boleh',
    'الْأَصْلُ فِي الْأَمْرِ لِلْكَرَاهَةِ': 'Asal hukum perintah adalah makruh',
    'مَا لَا يَتِمُّ الْوَاجِبُ إِلَّا بِهِ فَهُوَ وَاجِبٌ': 'Perkara yang tanpanya kewajiban tak sempurna, hukumnya ikut wajib',
    'الْأَصْلُ فِي الْأَشْيَاءِ الْإِبَاحَةُ': 'Hukum asal pada segala sesuatu adalah mubah/boleh',
    'الضَّرَرُ يُزَالُ': 'Segala bentuk kemudharatan wajib dihilangkan',
    'الْعَادَةُ مُحَكَّمَةٌ': 'Adat kebiasaan masyarakat dapat dijadikan pijakan hukum',
    'الْمَيْسُورُ لَا يَسْقُطُ بِالْمَعْسُورِ': 'Kewajiban yang mudah dilakukan tidak gugur karena hal yang sulit',
    'الْيَقِينُ لَا يَزُولُ بِالشَّكِّ': 'Keyakinan tidak dapat dihilangkan oleh keraguan',
    '{فَلْيَحْذَرِ الَّذِينَ يُخَالِفُونَ عَنْ أَمْرِهِ أَن تُصِيبَهُمْ فِتْنَةٌ أَوْ يُصِيبَهُمْ عَذَابٌ أَلِيمٌ}': 'Hendaklah orang yang menyalahi perintah Rasul takut ditimpa fitnah atau azab pedih',
    '{وَإِذَا حَلَلْتُمْ فَاصْطَادُوا}': 'Dan apabila kamu telah bertahalul, maka berburulah',
    '{كُلُوا وَاشْرَبُوا}': 'Makan dan minumlah kalian',
    '{وَأَشْهِدُوا إِذَا تَبَايَعْتُمْ}': 'Dan adakanlah saksi apabila kamu berjual beli',
    'كُتِبَ التِّلْمِيذُ': 'Murid itu ditulis/dicatat (salah sasaran fa\'il)',
    'كُتِبَ الدَّرْسُ': 'Pelajaran itu telah ditulis (marfu\' na\'ibul fa\'il benar)',
    'كُتِبَ الدَّرْسَ': 'Pelajaran itu telah ditulis (manshub harakat salah)',
    'يُكْتَبُ التِّلْمِيذَ': 'Sedang ditulis sang murid (harakat salah)'
  };

  const cleanKey = trimmed.replace(/[\{\}]/g, '').trim();
  for (const [k, v] of Object.entries(AUTO_TRANSLATIONS)) {
    if (trimmed === k || cleanKey === k.replace(/[\{\}]/g, '').trim()) {
      return { main: trimmed, trans: v };
    }
  }

  return { main: trimmed, trans: '' };
}

/**
 * Komponen Opsi Jawaban Imtihan dengan Terjemahan Bahasa Indonesia
 * Teks utama ditampilkan tegas (font Arabic besar jika Arab),
 * dan terjemahan bahasa Indonesia ditampilkan di bawahnya dengan tulisan kecil,
 * rapi, dan mudah dipahami user.
 */
function BattleOptionContent({ opt, className = '' }) {
  const { main, trans } = parseOptionTranslation(opt);
  const isMainArabic = containsArabic(main);

  return (
    <div className={`flex-1 flex flex-col justify-center min-w-0 ${className}`}>
      {/* Teks Utama (Lafadz Arab / Rumus Kaidah) */}
      <div
        className={`leading-snug transition-colors ${
          isMainArabic
            ? 'font-arabic text-base sm:text-lg text-emerald-100 font-medium'
            : 'text-xs sm:text-sm font-mono font-medium text-white/95'
        }`}
        dir={isMainArabic ? 'rtl' : 'ltr'}
      >
        {main}
      </div>

      {/* Terjemahan Bahasa Indonesia Kecil */}
      {trans ? (
        <div
          className="text-[10px] sm:text-[11px] text-emerald-300/85 font-sans leading-tight mt-1 flex items-start gap-1 tracking-normal"
          dir="ltr"
        >
          <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30 text-amber-300 font-mono font-bold shrink-0">
            arti
          </span>
          <span className="leading-tight text-white/80 select-text">{trans}</span>
        </div>
      ) : null}
    </div>
  );
}

/* Kunci scroll halaman dengan penghitung: lapisan game, arena, dan modal bisa aktif bersamaan dan dilepas dalam
   urutan apa pun. Kalau tiap lapisan menyimpan-lalu-memulihkan nilai overflow sendiri, urutan pembersihan yang
   berbeda meninggalkan body tetap "hidden" dan halaman tidak bisa di-scroll lagi. */
let pageScrollLocks = 0;
let pageScrollPrev = '';
function lockPageScroll() {
  if (pageScrollLocks++ === 0) {
    pageScrollPrev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
}
function unlockPageScroll() {
  pageScrollLocks = Math.max(0, pageScrollLocks - 1);
  if (pageScrollLocks === 0) document.body.style.overflow = pageScrollPrev;
}

/* Modal situs (login, gabung, upgrade, pembayaran) dirender di luar game dengan z-index 90–160, sedangkan game
   memakai 9990+. Selama ada modal situs terbuka, semua lapisan game turun ke z-index 85: tetap di atas tab bar &
   tombol quick-note situs, tapi di bawah modalnya. Tanpa ini, tombol "Upload Diktat" untuk tamu membuka modal login
   yang tersembunyi di balik game. */
function useYieldToSiteModals() {
  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const open = [...document.querySelectorAll('.modal-back, [aria-modal="true"]')]
        .some(el => !el.closest('.game-layer'));
      document.body.classList.toggle('game-yield', open);
    };
    const schedule = () => { if (!frame) frame = setTimeout(check, 0); };
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    check();
    return () => {
      observer.disconnect();
      if (frame) clearTimeout(frame);
      document.body.classList.remove('game-yield');
    };
  }, []);
}

/* ── LAYAR PENUH CADANGAN (CSS) ──
   Kalau browser menolak fullscreen asli, arena memakai position: fixed. Halaman ini dibungkus .page-enter yang
   animasinya menyisakan transform, sehingga elemen fixed di dalamnya terkurung: navbar & footer menimpa arena
   dan halaman tetap bisa di-scroll. Saat aktif, arena dipindah ke <body> dan scroll halaman dikunci. */
function ArenaPortal({ active, speed = 1, z = 9999, children }) {
  useEffect(() => {
    if (!active) return;
    lockPageScroll();
    return unlockPageScroll;
  }, [active]);
  if (!active || typeof document === 'undefined') return children;
  // .battle-root + --bs ikut dibawa supaya kecepatan animasi & aturan reduced-motion tetap berlaku di portal.
  return createPortal(
    // Pembungkus ber-z-index membuat lapisan sendiri, supaya bisa "mengalah" ke modal situs (lihat useYieldToSiteModals).
    <div className="battle-root game-layer relative" style={{ '--bs': speed === 2 ? 0.5 : 1, zIndex: z }}>{children}</div>,
    document.body
  );
}

function GameFullscreenLayer({ active, children }) {
  useEffect(() => {
    if (!active) return;
    lockPageScroll();
    return unlockPageScroll;
  }, [active]);
  if (!active || typeof document === 'undefined') return children;
  return createPortal(
    <div className="game-layer fixed inset-0 z-[9990] overflow-y-auto overscroll-contain bg-[#080808]">{children}</div>,
    document.body
  );
}

/* ── GAYA MENU GAME (layar pilih & peta) ──
   Tombol balok ala Minecraft dan kotak dialog yang sama dengan arena & prolog. */
const PX_BTN = 'border-t-2 border-l-2 border-b-4 border-r-4 active:border-b-2 active:border-r-2 active:translate-y-0.5 font-mono font-bold shadow-[2px_2px_0_#000] transition flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:pointer-events-none';
const PX_GREEN = 'border-t-[#5fd481] border-l-[#5fd481] border-b-[#134221] border-r-[#134221] bg-[#2e8a4a] hover:bg-[#349e54] text-white';
const PX_WOOD = 'border-t-[#9a7049] border-l-[#9a7049] border-b-[#2b1c0e] border-r-[#2b1c0e] bg-[#543b22] hover:bg-[#634628] text-amber-200';
const PX_STONE = 'border-t-[#4a5568] border-l-[#4a5568] border-b-[#141821] border-r-[#141821] bg-[#2d3748] hover:bg-[#3b475a] text-stone-200';
const PX_VIOLET = 'border-t-[#7c6bd6] border-l-[#7c6bd6] border-b-[#221a4d] border-r-[#221a4d] bg-[#3b2f80] hover:bg-[#45389a] text-violet-100';
const PX_AMBER = 'border-t-[#f59e0b] border-l-[#f59e0b] border-b-[#4a2504] border-r-[#4a2504] bg-[#b45309] hover:bg-[#c2610f] text-white';
const GAME_BOX = 'border-4 border-[#3d3221] bg-[#080d0a]/85 backdrop-blur-md shadow-[0_0_0_2px_#000,0_16px_40px_rgba(0,0,0,0.85)]';

/* ── HELPER: ACAK URUTAN OPSI (Kunci jawaban ikut dipetakan ulang) ── */
function shuffleQuizOptions(quiz) {
  return quiz.map(q => {
    const options = Array.isArray(q.options) ? q.options : [];
    const order = options.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return { ...q, options: order.map(i => options[i]), answer: order.indexOf(q.answer) };
  });
}

/* ── HELPER: TERAPKAN CERITA AI KE SET ──
   AI hanya mengganti narasi (prolog, judul/lokasi/nama penjaga/lore level). Soal, HP, rank, dan EXP tetap milik set. */
const STORY_AVATAR = { narrator: '🏛️', thalib: '🎓', syaikh: '👳‍♂️' };
function applyAiStory(set, story) {
  if (!set || !story?.dialogues?.length) return set;
  const prologue = {
    ...(set.prologue || {}),
    chapter: story.chapter || set.prologue?.chapter || 'HIKAYAT',
    title: story.title || set.prologue?.title || set.title,
    titleArabic: story.titleArabic || set.prologue?.titleArabic || set.titleArabic,
    location: story.location || set.prologue?.location,
    epigraph: story.epigraph || set.prologue?.epigraph,
    epigraphMeaning: story.epigraphMeaning || set.prologue?.epigraphMeaning,
    dialogues: story.dialogues.map(d => ({ ...d, avatar: STORY_AVATAR[d.speakerType] || '🏛️' })),
    aiGenerated: true,
  };
  const stages = (set.stages || []).map((stage, i) => {
    const s = story.stages?.[i];
    if (!s) return stage;
    return {
      ...stage,
      title: s.title || stage.title,
      titleArabic: s.titleArabic || stage.titleArabic,
      location: s.location || stage.location,
      guardianName: s.guardianName || stage.guardianName,
      lore: s.lore || stage.lore,
    };
  });
  const finalGuardian = stages.find(s => s.isFinal)?.guardianName;
  return { ...set, prologue, stages, bossName: finalGuardian || set.bossName };
}

/* ── MISI DUEL ──
   Tiap level punya 2–3 misi sampingan; tiap misi yang tuntas saat menang memberi bonus EXP dan dicatat di progres.
   Status dihitung dari statistik duel: salah jawab, item terpakai, bantuan (Qamus/Khulashah/Halaqah), combo, HP. */
const MISSION_BONUS_EXP = 15;
const MISSION_DEFS = {
  flawless: { icon: 'diamond', label: 'Tanpa Cela', desc: 'Jawab semua soal tanpa salah' },
  noItems: { icon: 'chest', label: 'Bekal Utuh', desc: 'Menang tanpa memakai item tas' },
  noHelp: { icon: 'torch', label: 'Mandiri', desc: 'Tanpa Qamus, Khulashah, atau AI Halaqah' },
  combo2: { icon: 'fire', label: 'Hujjah Beruntun', desc: 'Capai combo x2', combo: 2 },
  combo3: { icon: 'bolt', label: 'Hujjah Mutawatirah', desc: 'Capai combo x3', combo: 3 },
  hp70: { icon: 'heart', label: 'Tetap Tegar', desc: 'Menang dengan HP minimal 70' },
};
function getStageMissions(stage, quizLength) {
  const level = Number(stage?.levelNumber || stage?.id || 1);
  const combo = quizLength >= 3 ? 'combo3' : 'combo2';
  const byLevel = { 1: ['flawless', 'noHelp'], 2: ['combo2', 'noItems'], 3: [combo, 'hp70'], 4: ['flawless', combo, 'noHelp'] };
  return byLevel[Math.min(4, Math.max(1, level))];
}
// 'done' | 'failed' | 'active'. finished = duel sudah dimenangkan (misi yang bergantung pada akhir duel dinilai saat itu).
function missionStatus(id, stats, { finished = false, playerHp = 100 } = {}) {
  const def = MISSION_DEFS[id];
  if (def?.combo) return stats.maxStreak >= def.combo ? 'done' : finished ? 'failed' : 'active';
  if (id === 'flawless') return stats.wrong > 0 ? 'failed' : finished ? 'done' : 'active';
  if (id === 'noItems') return stats.items > 0 ? 'failed' : finished ? 'done' : 'active';
  if (id === 'noHelp') return stats.help > 0 ? 'failed' : finished ? 'done' : 'active';
  if (id === 'hp70') return finished ? (playerHp >= 70 ? 'done' : 'failed') : 'active';
  return 'active';
}

/* ── HELPER: ATURAN DUEL PER LEVEL ──
   Boss tumbang tepat saat thalib mengumpulkan jawaban benar sebanyak batas lulus (60%, dibulatkan ke atas);
   combo mempercepatnya. Kalau soal habis dan boss masih berdiri, duel kalah. Serangan balik makin keras
   di level tinggi sehingga HP, Syay, dan Ahwah benar-benar berarti. */
function getBattleRules(stage, quizLength) {
  const total = Math.max(1, quizLength);
  const requiredCorrect = Math.max(1, Math.ceil(total * 0.6));
  const bossMaxHp = stage?.bossHp || 100;
  const levelNumber = Number(stage?.levelNumber || stage?.id || 1);
  return {
    requiredCorrect,
    damagePerCorrect: Math.ceil(bossMaxHp / requiredCorrect),
    counterDamage: 25 + (Math.min(4, Math.max(1, levelNumber)) - 1) * 5
  };
}

/* ── HELPER: HURT EXPRESSIONS & REACTIONS FOR DAMAGE MOMENTS ── */
function getBossHurtReaction(stageId, bossType, combo = 0) {
  const sid = Number(stageId);
  if (sid === 1) {
    const quotes = [
      { quote: "Aduhh! Dalilmu terlalu kokoh!", emoji: "🗝️💥", badge: "Kunci Gerbang Goyah!" },
      { quote: "Masya Allah, hujjahmu menembus benteng!", emoji: "🚪⚡", badge: "Khadim Terdesak Mundur!" },
      { quote: "Kalammu shahih! Pertahananku rontok!", emoji: "🛡️💔", badge: "Pertahanan Goyah!" }
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
  if (sid === 2) {
    const quotes = [
      { quote: "Aghh! Catatan matanku runtuh!", emoji: "📜💥", badge: "Koreksi Matan Telak!" },
      { quote: "Ibaratmu presisi sekali!", emoji: "📝⚡", badge: "Diktat Musa'id Terhantam!" },
      { quote: "Ta'lilmu tak terbantahkan!", emoji: "🧐💥", badge: "Koreksi Sempurna!" }
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
  if (sid === 3) {
    const quotes = [
      { quote: "Luar biasa! Tahqiqmu tajam bagai pedang!", emoji: "📖✨", badge: "Tahqiq Tertembus!" },
      { quote: "Hujjah Qath'i menaklukkan risalahku!", emoji: "⚡💥", badge: "Al-Muhaqqiq Terpental!" },
      { quote: "Sanad pemahamanmu muttashil sempurna!", emoji: "📜💫", badge: "Kitab Terhambur!" }
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
  // Final Boss: Al-'Allamah Al-Kabir / Syaikhul Azhar
  const isCustom = String(bossType || '').startsWith('custom-');
  if (isCustom) {
    const quotes = [
      { quote: "«مَا شَاءَ اللَّهُ!» Penguasaan naskah dan hujjahmu sungguh mendalam!", emoji: "👳‍♂️✨", badge: "Al-'Allamah Kagum!" },
      { quote: "Tahqiq dan analisismu atas diktat ini sangat shahih, wahai Thalib!", emoji: "📜⚡", badge: "Sang Syaikh Takzim!" },
      { quote: "Subhanallah! Setiap pertanyaan muqarrar dijawab dengan hujjah qath'i!", emoji: "👓💫", badge: "Kibar Ulama Takjub!" }
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
  const isNahwu = bossType === 'nahwu-fail';
  const isUshul = bossType === 'ushul-amr';
  if (isNahwu) {
    const quotes = [
      { quote: "«مَا شَاءَ اللَّهُ!» Dalil Alfiyah-mu begitu kokoh menundukkan ibarahku!", emoji: "👓⚡", badge: "Al-'Allamah Tertegun!" },
      { quote: "Subhanallah! Pemahaman I'rab-mu sangat mendalam, wahai Thalib!", emoji: "📜✨", badge: "Sang Syaikh Takjub!" }
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
  if (isUshul) {
    const quotes = [
      { quote: "«أَصَبْتَ الْحَقَّ!» Istinbath-mu laksana para fuqaha mutaqaddimin!", emoji: "⚖️✨", badge: "Kibar Ulama Takzim!" },
      { quote: "Hujjahmu qath'i, tak menyisakan celah syubhat sedikit pun!", emoji: "📜💥", badge: "Sang Qadhi Terpukau!" }
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
  // Balaghah
  const quotes = [
    { quote: "«لِلَّهِ دَرُّكَ!» Dzauq balaghah-mu luar biasa halus dan tajam!", emoji: "📖✨", badge: "Syaikhul Balaghah Kagum!" },
    { quote: "Hakikat dan Majaz terurai sempurna di tanganmu!", emoji: "✨👑", badge: "Maha Guru Tertegun!" }
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function getPlayerHurtReaction(shieldAbsorbed = false) {
  if (shieldAbsorbed) {
    const quotes = [
      { quote: "Alhamdulillah! Tameng Ahwah Mazbut menahan hantaman!", emoji: "🛡️☕", badge: "Tameng Bertahan (-50%)" },
      { quote: "Hampir saja! Untung ada benteng ijtihad!", emoji: "🛡️⚡", badge: "Syubhat Diredam!" }
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
  const quotes = [
    { quote: "Aduhh!! Ibârahnya keliru kuhafal!", emoji: "😵‍💫💥", badge: "Tersengat Kaidah!" },
    { quote: "Aghh! Syubhat melanda pemikiranku!", emoji: "💔⚡", badge: "Tarkiz Goyah!" },
    { quote: "Mukh-ku nge-blank sejenak!", emoji: "🧠💫", badge: "Syubhat Menembus!" },
    { quote: "Waduh! Kaidah tahriri-nya meleset!", emoji: "🤦‍♂️💥", badge: "Darah Thalib Berkurang!" },
    { quote: "Astagfirullah! Kurang teliti baca ibarat!", emoji: "💦💔", badge: "Guncangan Ujian!" }
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

/* ── COMPONENT: ATTACK CUTSCENE OVERLAY ("SCENE PAS NYERANG") ── */
function AttackCutsceneOverlay({ cutscene, activeSet, activeStage, battleStyle, onSkip, speed = 1, onToggleSpeed }) {
  if (!cutscene) return null;

  const isPlayer = cutscene.type === 'player';
  const isStrike = cutscene.phase === 'strike' || cutscene.phase === 'impact';
  const currentStageId = cutscene.stageId || activeStage?.id || 4;
  const currentBossType = cutscene.bossType || activeSet?.id || 'balaghah-majaz';
  const bossVoxel = isStrike ? getVoxelHurtSprite(currentStageId, currentBossType) : getVoxelSprite(currentStageId, currentBossType);

  const defaultReaction = isPlayer
    ? getBossHurtReaction(currentStageId, currentBossType, cutscene.streak || 0)
    : getPlayerHurtReaction(cutscene.shieldAbsorbed || false);
  const reaction = cutscene.reaction || defaultReaction;

  const victimName = isPlayer ? (cutscene.bossName || activeStage?.guardianName || activeSet?.bossName || 'PENJAGA AZHAR') : 'THALIB AL-AZHAR';
  const victimAvatar = isPlayer ? getVoxelHurtSprite(currentStageId, currentBossType) : '/assets/thalib-hurt-voxel.png';

  return (
    <div
      onClick={onSkip}
      className="absolute inset-0 z-50 flex flex-col justify-between overflow-hidden select-none cursor-pointer animate-fadeIn font-sans"
      title="Klik atau tekan Space untuk lewati cutscene"
    >
      {/* 1. TOP CINEMATIC LETTERBOX FILM BAR */}
      <div className="relative z-50 h-10 sm:h-14 bg-gradient-to-b from-black via-black/95 to-black/85 border-b border-amber-500/30 flex items-center justify-between px-3 sm:px-6 shadow-2xl">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
          <span className="font-mono text-[10px] sm:text-xs font-black tracking-widest text-rose-400 uppercase">
            REC • SCENE SERANGAN
          </span>
          <span className="text-white/20 hidden sm:inline">•</span>
          <span className="font-mono text-[10px] sm:text-xs font-bold text-white/80 hidden sm:inline">
            {isPlayer ? 'THALIB AL-AZHAR' : (cutscene.bossName || 'BOSS')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Speed Toggle (1x / 2x Turbo) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSpeed?.();
            }}
            className={`px-2.5 py-0.5 rounded-full border font-mono text-[9px] sm:text-[11px] font-black flex items-center gap-1 transition ${
              speed === 2
                ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_10px_#f59e0b]'
                : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
            }`}
            title="Ubah kecepatan scene (1x Normal / 2x Cepat)"
          >
            <span><PixelIcon name="bolt" className="w-[1.15em] h-[1.15em]" /></span>
            <span>{speed === 2 ? '2x CEPAT' : '1x NORMAL'}</span>
          </button>

          {/* Skip Button */}
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-white/70 font-mono text-[9px] sm:text-[11px] flex items-center gap-1 hover:bg-white/20 transition">
            <span>Lewati</span>
            <span className="text-amber-300">⏭️</span>
            <span className="hidden sm:inline text-white/40">(Space)</span>
          </span>
        </div>
      </div>

      {/* 2. DYNAMIC ACTION SPEEDLINES & ATMOSPHERIC CANVAS */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {/* Dynamic Vignette / Dim */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

        {/* Action Speedlines Stripes */}
        <div
          className={`absolute inset-0 pointer-events-none opacity-25 animate-speedlineRun ${
            isPlayer
              ? 'bg-[repeating-linear-gradient(115deg,rgba(251,191,36,0.35)_0px,rgba(251,191,36,0.35)_4px,transparent_4px,transparent_20px)]'
              : 'bg-[repeating-linear-gradient(115deg,rgba(244,63,94,0.35)_0px,rgba(244,63,94,0.35)_4px,transparent_4px,transparent_20px)]'
          }`}
        />

        {/* Dynamic Energy Radial Bursts */}
        <div
          className={`absolute inset-0 ${
            isPlayer
              ? 'bg-radial-gradient from-amber-500/20 via-emerald-500/10 to-transparent'
              : 'bg-radial-gradient from-purple-700/25 via-rose-600/15 to-transparent'
          }`}
        />

        {/* Fullscreen Flash on Strike */}
        {isStrike && (
          <div
            className={`absolute inset-0 animate-strikeFlash z-40 ${
              isPlayer ? 'bg-white/50' : 'bg-rose-500/40'
            }`}
          />
        )}
      </div>

      {/* 3. CENTER ACTION STAGE: CHARGE OR STRIKE */}
      <div className="relative z-30 flex-1 flex items-center justify-center p-4 sm:p-8">
        
        {/* ── SUBPHASE A: CHARGE (INCANTATION & HERO CLOSE-UP) ── */}
        {!isStrike && (
          <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-10 animate-fadeIn">
            
            {/* Left: Thalib Azhar Hero Charge (or Boss Charge) */}
            {isPlayer ? (
              <div className="relative flex flex-col items-center animate-chargeHero">
                {/* Golden Mana Aura Ring */}
                <div className="absolute -inset-6 rounded-full border-2 border-amber-300/80 animate-ping opacity-60" />
                <div className="absolute -inset-10 rounded-full bg-amber-400/20 blur-xl animate-pulse" />

                <div className="relative z-10">
                  <img
                    src="/assets/thalib-voxel-facing-right.png"
                    alt="Thalib Azhar Charge"
                    className="w-36 sm:w-48 md:w-64 h-auto object-contain filter drop-shadow-[0_0_35px_rgba(251,191,36,0.9)] brightness-110"
                  />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-36 h-6 bg-black/90 rounded-full blur-[6px]" />
                </div>

                <div className="mt-2 text-center bg-black/80 backdrop-blur-md px-3.5 py-1 rounded-full border border-amber-400/50 shadow-lg">
                  <span className="font-mono text-[10px] sm:text-xs font-black text-amber-300 uppercase tracking-widest">
                    THALIB AL-AZHAR • MEMBACA HUJJAH
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative flex flex-col items-center animate-chargeHero">
                {/* Sinister Aura for Boss */}
                <div className="absolute -inset-6 rounded-full border-2 border-rose-500/80 animate-ping opacity-60" />
                <div className="absolute -inset-10 rounded-full bg-purple-600/30 blur-xl animate-pulse" />

                <div className="relative z-10 flex flex-col items-center">
                  <img
                    src={bossVoxel}
                    alt={cutscene.bossName || 'Boss Voxel'}
                    className="w-36 sm:w-48 md:w-64 h-auto object-contain filter drop-shadow-[0_0_35px_rgba(244,63,94,0.95)] brightness-110"
                  />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-36 h-6 bg-black/90 rounded-full blur-[6px]" />
                </div>

                <div className="mt-2 text-center bg-black/80 backdrop-blur-md px-3.5 py-1 rounded-full border border-rose-500/50 shadow-lg">
                  <span className="font-mono text-[10px] sm:text-xs font-black text-rose-300 uppercase tracking-widest">
                    {cutscene.bossName} • MELANCARKAN SYUBHAT
                  </span>
                </div>
              </div>
            )}

            {/* Right: Giant Anime Title Card */}
            <div className="flex-1 max-w-xl animate-attackBannerSlide">
              <div className={`p-5 sm:p-7 rounded-2xl border-2 backdrop-blur-xl shadow-2xl relative overflow-hidden ${
                isPlayer
                  ? 'bg-gradient-to-br from-[#121c15]/95 via-[#0b120e]/95 to-black/95 border-amber-400/70 shadow-[0_0_40px_rgba(251,191,36,0.35)]'
                  : 'bg-gradient-to-br from-[#200b12]/95 via-[#130509]/95 to-black/95 border-rose-500/70 shadow-[0_0_40px_rgba(244,63,94,0.35)]'
              }`}>
                {/* Corner Accents */}
                <div className={`absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 ${isPlayer ? 'border-amber-400' : 'border-rose-400'}`} />
                <div className={`absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 ${isPlayer ? 'border-amber-400' : 'border-rose-400'}`} />

                {/* Jurus Category Badge */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider border shadow-md flex items-center gap-1 ${
                    isPlayer
                      ? 'bg-amber-500/25 border-amber-400/60 text-amber-300'
                      : 'bg-rose-500/25 border-rose-400/60 text-rose-300'
                  }`}>
                    <PixelIcon name={isPlayer ? 'sword' : 'warning'} className="w-[1.15em] h-[1.15em]" />
                    <span>{isPlayer ? 'JURUS KELAS ATAS AL-AZHAR' : 'SERANGAN BALIK MUQARRAR'}</span>
                  </span>

                  {cutscene.streak >= 2 && isPlayer && (
                    <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-orange-400 text-black font-mono text-[10px] sm:text-xs font-black animate-pulse shadow-md">
                      <PixelIcon name="fire" className="w-[1.15em] h-[1.15em]" /> COMBO x{cutscene.streak} HUJJAH
                    </span>
                  )}

                  {cutscene.isFinisher && isPlayer && (
                    <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-200 text-black font-mono text-[10px] sm:text-xs font-black animate-bounce shadow-md">
                      <PixelIcon name="crown" className="w-[1.15em] h-[1.15em]" /> SERANGAN TERAKHIR
                    </span>
                  )}
                </div>

                {/* Calligraphy Title */}
                <div className={`font-arabic text-3xl sm:text-5xl font-extrabold leading-normal my-1 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] ${
                  isPlayer ? 'text-amber-300' : 'text-rose-300'
                }`} dir="rtl">
                  {cutscene.moveArabic}
                </div>

                {/* Latin Main Title */}
                <h3 className="text-xl sm:text-3xl md:text-4xl font-black italic tracking-wider text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] mb-1">
                  {cutscene.moveName}
                </h3>

                {/* Subtitle / Description */}
                <p className={`text-xs sm:text-sm font-mono font-medium flex items-center gap-1.5 ${
                  isPlayer ? 'text-emerald-300' : 'text-rose-200/90'
                }`}>
                  <span><PixelIcon name="sparkle" className="w-[1.15em] h-[1.15em]" /></span>
                  <span>{cutscene.subtitle}</span>
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ── SUBPHASE B: STRIKE & IMPACT (CRITICAL CLASH & HURT REACTION SCENE) ── */}
        {isStrike && (
          <div className="flex flex-col items-center justify-center text-center relative z-40 animate-fadeIn w-full max-w-4xl px-2">
            
            {/* Calligraphy Energy Slashes & Shockwaves */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`w-80 sm:w-[500px] h-4 bg-gradient-to-r from-transparent via-amber-200 to-transparent shadow-[0_0_35px_#fbbf24] animate-slashX1 ${
                !isPlayer ? 'via-rose-400 shadow-[0_0_35px_#f43f5e]' : ''
              }`} />
              <div className={`w-80 sm:w-[500px] h-4 bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_35px_#34d399] animate-slashX2 ${
                !isPlayer ? 'via-purple-400 shadow-[0_0_35px_#a855f7]' : ''
              }`} />
              {/* Shockwave Ring */}
              <div className={`w-48 sm:w-72 h-48 sm:h-72 rounded-full border-4 animate-impactRing ${
                isPlayer ? 'border-amber-300/90' : 'border-rose-400/90'
              }`} />
              {/* Spark Runes */}
              <div className="text-4xl animate-sparkBurst">
                <span className="inline-flex gap-1">{(isPlayer ? ['sparkle', 'sword', 'sparkle'] : ['boom', 'bolt', 'boom']).map((n, i) => <PixelIcon key={i} name={n} className="w-[1em] h-[1em]" />)}</span>
              </div>
            </div>

            {/* Giant Critical Damage Numerals & Hit Banner */}
            <div className="animate-critNumberBounce mb-2 sm:mb-3 relative z-20">
              <div className={`text-5xl sm:text-7xl md:text-8xl font-black font-mono tracking-tighter ${
                isPlayer
                  ? 'text-amber-300 drop-shadow-[0_0_45px_rgba(251,191,36,1)]'
                  : 'text-rose-400 drop-shadow-[0_0_45px_rgba(244,63,94,1)]'
              }`}>
                -{cutscene.damage} HP
              </div>

              <div className={`mt-1 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full border-2 font-mono text-[11px] sm:text-sm font-black uppercase tracking-wider shadow-2xl inline-flex items-center gap-2 ${
                isPlayer
                  ? 'bg-black/90 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-pulse'
                  : 'bg-black/90 border-rose-500 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.6)]'
              }`}>
                <PixelIcon name={isPlayer ? 'bolt' : 'boom'} className="w-[1.15em] h-[1.15em]" />
                <IconText text={isPlayer
                    ? (cutscene.isFinisher ? '💥 FINAL FINISHER HIT — BOSS TAKLUK!' : (cutscene.streak >= 2 ? `🔥 COMBO x${cutscene.streak} HUJJAH MUTAWATIRAH!` : '⚡ CRITICAL HIT — HUJJAH QATH\'IYYAH!'))
                    : (cutscene.shieldAbsorbed ? '🛡️ TAMENG DIFA\' MENAHAN 50% DAMAGE!' : '💥 MAS\'ALAH MUSYKILAH!')} />
                <PixelIcon name={isPlayer ? 'bolt' : 'boom'} className="w-[1.15em] h-[1.15em]" />
              </div>
            </div>

            {/* ── PROMINENT HURT CHARACTER (BEBAS TANPA KOTAK, WAJAH JELAS & BESAR) ── */}
            <div className="relative my-1 sm:my-3 flex flex-col items-center justify-center z-30">
              
              {/* Action Glow Burst under character */}
              <div className="absolute -inset-6 bg-gradient-to-t from-rose-600/35 via-amber-500/15 to-transparent rounded-full blur-2xl pointer-events-none animate-pulse" />

              {/* Large Prominent 3D Voxel Hurt Model (BEBAS, TIDAK DI DALAM KOTAK) */}
              <div className="relative flex items-center justify-center">
                <img
                  src={victimAvatar}
                  alt={victimName}
                  className="w-48 sm:w-64 md:w-80 max-h-[38vh] sm:max-h-[48vh] h-auto object-contain filter drop-shadow-[0_0_35px_rgba(244,63,94,0.95)] animate-hurtTremble select-none"
                />

                {/* Comic Emotion Emote Badge hovering right beside character head */}
                <div className="absolute -top-3 -right-3 sm:-right-8 px-2.5 py-1 rounded-full bg-rose-600 border-2 border-white text-base sm:text-2xl shadow-[0_0_15px_rgba(244,63,94,0.9)] animate-bounce font-black flex items-center gap-1.5 z-40">
                  <EmojiIcon text={reaction.emoji || (isPlayer ? '💥' : '💔')} className="w-[1.2em] h-[1.2em]" />
                  <span className="font-mono text-[10px] sm:text-xs text-white uppercase tracking-wider hidden sm:inline">
                    {isPlayer ? 'KENA HIT!' : 'OUCH!'}
                  </span>
                </div>

                {/* Expanding Shockwave Ring around character */}
                <div className="absolute -inset-4 border-2 border-rose-500/50 rounded-full animate-ping pointer-events-none" />
              </div>

              {/* Floating Anime Speech Ribbon underneath character */}
              <div className="w-full max-w-xl mx-auto mt-2 sm:mt-3 relative z-40 animate-hurtBoxPop">
                <div className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-2xl bg-black/85 border-2 border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.5)] backdrop-blur-md text-center">
                  
                  {/* Badge row: Target Name + Impact Status */}
                  <div className="flex items-center justify-center gap-2 mb-1 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-rose-500/30 border border-rose-400/80 font-mono text-[9px] sm:text-[11px] font-black uppercase tracking-wider text-rose-300 flex items-center gap-1 animate-pulse">
                      <span><PixelIcon name="boom" className="w-[1.15em] h-[1.15em]" /></span>
                      <span>{victimName}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/25 border border-amber-400/60 font-mono text-[9px] sm:text-[11px] font-bold text-amber-300">
                      {reaction.badge || (isPlayer ? 'Pertahanan Goyah!' : 'Syubhat Menembus!')}
                    </span>
                  </div>

                  {/* Expressive Quote in bold italic typography */}
                  <div className="relative inline-block px-2">
                    <span className="text-amber-400 font-serif text-lg sm:text-2xl mr-1 select-none">“</span>
                    <span className="font-sans text-sm sm:text-lg md:text-xl font-black italic tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      {reaction.quote || (isPlayer ? 'Aghhh! Dalilmu terlalu kokoh!' : 'Aduhh!! Ibârahnya keliru kuhafal!')}
                    </span>
                    <span className="text-amber-400 font-serif text-lg sm:text-2xl ml-1 select-none">”</span>
                  </div>

                  {/* Subtitle Lore */}
                  <p className="mt-0.5 text-[10px] sm:text-xs text-white/70 font-mono truncate">
                    <IconText iconClassName="w-3.5 h-3.5" text={isPlayer
                      ? (cutscene.isFinisher ? '💥 Dalil pamungkas melumpuhkan pertahanan lawan secara total!' : (cutscene.streak >= 2 ? `🔥 Rangkaian dalil beruntun (Combo x${cutscene.streak}) mengguncang konsentrasi!` : '⚡ Hujjah qath\'iyyah menembus pertahanan lawan!'))
                      : (cutscene.shieldAbsorbed ? '🛡️ Tameng Ahwah Mazbut berhasil menahan 50% serangan!' : '💔 HP Thalib berkurang — cek lagi ibarat & kaidahnya!')} />
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* 4. BOTTOM CINEMATIC LETTERBOX FILM BAR */}
      <div className="relative z-50 h-10 sm:h-14 bg-gradient-to-t from-black via-black/95 to-black/85 border-t border-amber-500/30 flex items-center justify-between px-3 sm:px-6 shadow-2xl">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="font-arabic text-sm sm:text-base text-amber-300 font-semibold truncate" dir="rtl">
            {cutscene.chant}
          </span>
          {cutscene.chantTranslation && (
            <span className="text-[10px] sm:text-xs text-white/60 italic hidden md:inline truncate max-w-md">
              "{cutscene.chantTranslation}"
            </span>
          )}
        </div>

        <div className="shrink-0 font-mono text-[10px] sm:text-xs text-white/50 hidden sm:block">
          TARGET: {isPlayer ? cutscene.bossName : 'THALIB AL-AZHAR'}
        </div>
      </div>
    </div>
  );
}

export default function BattlePage() {
  const auth = typeof window.useAuth === 'function' ? window.useAuth() : {};
  const { session, profile, isFree } = auth;
  useYieldToSiteModals();
  // Game terbuka untuk umum; upload/paste diktat sendiri dan cerita AI khusus member paket Library ke atas.
  const isLibraryMember = !!session && !isFree;
  const requireLibraryMember = () => {
    if (isLibraryMember) return true;
    // Belum login → modal login; akun gratis → halaman Gabung (alur yang sama dengan tombol "Gabung Member").
    window.dispatchEvent(new CustomEvent('talqeeh:open-join', { detail: { plan: 'library' } }));
    return false;
  };
  const navigate = window.navigate || ((to) => { window.location.hash = to; });
  const [phase, setPhase] = useState('select'); // 'select' | 'map' | 'study' | 'battle' | 'victory' | 'defeat'
  const [baseSet, setActiveSet] = useState(PRESETS[0]);

  // Cerita AI per set (prolog + nama/lore level), disimpan lokal supaya tidak perlu dibuat ulang tiap kunjungan.
  const AI_STORY_KEY = 'talqeeh_battle_ai_stories';
  const [aiStories, setAiStories] = useState(() => {
    try { return JSON.parse(localStorage.getItem(AI_STORY_KEY) || '{}') || {}; } catch { return {}; }
  });
  const [storyBusy, setStoryBusy] = useState(false);
  const [storyNotice, setStoryNotice] = useState('');
  const activeSet = useMemo(() => applyAiStory(baseSet, aiStories[baseSet?.id]), [baseSet, aiStories]);
  const [audioMuted, setAudioMuted] = useState(false);

  // Stage & World Map progression states
  const [selectedStageId, setSelectedStageId] = useState(1);
  const [activeStage, setActiveStage] = useState(() => PRESETS[0]?.stages?.[0] || null);

  // activeStage adalah salinan objek stage; saat cerita AI masuk/dihapus, ganti dengan versi terbaru (id sama).
  useEffect(() => {
    setActiveStage(prev => activeSet?.stages?.find(s => s.id === prev?.id) || prev);
  }, [activeSet]);

  // Pakai updater: generateAiStory selesai beberapa detik kemudian, state di closure-nya sudah basi.
  const saveAiStories = (update) => {
    setAiStories(prev => {
      const next = update(prev);
      try {
        // Simpan paling banyak 12 cerita (set unggahan punya id unik per unggahan).
        const keys = Object.keys(next).slice(-12);
        localStorage.setItem(AI_STORY_KEY, JSON.stringify(Object.fromEntries(keys.map(k => [k, next[k]]))));
      } catch {}
      return next;
    });
  };

  const generateAiStory = async (set = baseSet, { silent = false } = {}) => {
    if (!isLibraryMember) { if (!silent) requireLibraryMember(); return; }
    if (storyBusy || !set || typeof window.aiCall !== 'function') return;
    setStoryBusy(true);
    setStoryNotice(silent ? 'Syaikh AI sedang menulis cerita sesuai materimu...' : '');
    const res = await window.aiCall('battle-story', {
      title: set.title,
      maddah: set.maddah,
      summary: (set.summary || []).map(s => ({ heading: s.heading, body: s.body })),
      terms: set.terms || [],
      text: set.sourceText || '',
    });
    setStoryBusy(false);
    if (!res.ok) {
      setStoryNotice(res.error || 'Cerita AI belum bisa dibuat. Cerita bawaan tetap bisa dimainkan.');
      return;
    }
    saveAiStories(prev => ({ ...prev, [set.id]: res.data }));
    setStoryNotice('✨ Cerita baru dari AI sudah siap — sesuai materi yang sedang kamu pelajari.');
    sfx.playStoryBip?.();
  };

  const resetAiStory = () => {
    const id = baseSet?.id;
    saveAiStories(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setStoryNotice('Cerita dikembalikan ke versi bawaan.');
  };

  // Upload state
  const [customText, setCustomText] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [importToast, setImportToast] = useState('');
  const fileInputRef = useRef(null);

  // Study phase tab
  const [studyTab, setStudyTab] = useState('summary'); // 'summary' | 'terms' | 'cards'
  const [cardIndex, setCardIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);

  // Battle state
  const [currentQ, setCurrentQ] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [bossHp, setBossHp] = useState(100);
  const [playerMaxHp] = useState(100);
  const [bossMaxHp, setBossMaxHp] = useState(100);
  const [dialogText, setDialogText] = useState('');
  const [battleMenu, setBattleMenu] = useState('main'); // 'main' | 'fight' | 'bag'
  const [animBoss, setAnimBoss] = useState('idle'); // 'idle' | 'hit' | 'attack'
  const [animPlayer, setAnimPlayer] = useState('idle'); // 'idle' | 'hit' | 'attack'
  const [floatingText, setFloatingText] = useState(null); // { text, type, target }
  const [projectile, setProjectile] = useState(null); // 'crit' | 'hurt' | null
  const [attackEffect, setAttackEffect] = useState(null); // 'crit' | 'hurt' | null
  const [screenShake, setScreenShake] = useState(false); // Screen shake on impact
  const [battleStyle, setBattleStyle] = useState('minecraft'); // 'minecraft' | 'retro'
  const [damageReaction, setDamageReaction] = useState(null); // { target: 'player' | 'boss', quote, emoji, badge }

  // Fullscreen & Cinematic Action states
  const gameContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Safari iPhone tidak punya Fullscreen API untuk halaman; tombolnya disembunyikan (tampilan game tetap penuh).
  const canNativeFs = typeof document !== 'undefined' && !!(
    document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen
  );
  const [isActionBusy, setIsActionBusy] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null); // { optionIdx, isCorrect }

  // 1. Combo Streak & Defense Shield State
  const [streak, setStreak] = useState(0);
  const [defenseShield, setDefenseShield] = useState(false); // Ahwah Mazbut shield (-50% damage)

  // 2. Expanded Masisir Bag Items
  const [bag, setBag] = useState({
    tea: 2,       // Syay bil Na'na' (+35 HP)
    ahwah: 1,     // Ahwah Mazbut (-50% Damage Shield)
    summary: 1,   // Khulashah (50:50)
    qamus: 2,     // Qamus (Show Hint)
    kurrasah: 1   // Kurrasah Ad-Duf'ah (Skip Soal Aman)
  });
  const [activeHint, setActiveHint] = useState(null);
  const [disabledOptions, setDisabledOptions] = useState([]);
  const [wrongAnswers, setWrongAnswers] = useState([]); // [{ question, chosen, correct, exp, examTip }]
  const [wrongReview, setWrongReview] = useState(null); // { question, chosen, correct, exp, examTip, isFatal, isFinalQ }
  const [answeredCount, setAnsweredCount] = useState(0);

  // 3. User Progress & Badges Persistence
  const [userProgress, setUserProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('talqeeh_battle_progress');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      totalExp: 0,
      streakRecord: 0,
      completedBosses: {},
      stageProgress: {}, // { [muqarrarId]: { highestUnlocked: 1, stars: {} } }
      badges: []
    };
  });

  // Active questions resolved based on current active stage.
  // Opsi diacak ulang setiap kali duel dimulai (shuffleSeed), supaya posisi kunci tidak bisa dihafal.
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const activeQuiz = useMemo(() => {
    let base = activeSet?.quiz || [];
    if (activeStage && Array.isArray(activeStage.quizIndices) && activeSet?.quiz) {
      const subset = activeStage.quizIndices
        .map(idx => activeSet.quiz[idx])
        .filter(Boolean);
      if (subset.length > 0) base = subset;
    }
    return shuffleQuizOptions(base);
  }, [activeStage, activeSet, shuffleSeed]);

  // Stage helpers
  const getStageProgress = (muqarrarId) => {
    const p = userProgress?.stageProgress?.[muqarrarId];
    return {
      highestUnlocked: p?.highestUnlocked || 1,
      stars: p?.stars || {}
    };
  };

  const getStageStars = (muqarrarId, stageId) => {
    return userProgress?.stageProgress?.[muqarrarId]?.stars?.[stageId] || 0;
  };

  const getTotalMuqarrarStars = (muqarrarId) => {
    const starsMap = userProgress?.stageProgress?.[muqarrarId]?.stars || {};
    return Object.values(starsMap).reduce((sum, s) => sum + (Number(s) || 0), 0);
  };

  const launchStage = (stage, withStory = false) => {
    setActiveStage(stage);
    setSelectedStageId(stage.id);
    if (withStory) {
      enterStoryPrologue();
    } else {
      startBattle(stage);
    }
  };

  // 4. Interactive AI Syaikh Modal & Syahadah Modal
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiChatLog, setAiChatLog] = useState([]);
  const [aiCustomInput, setAiCustomInput] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [showSyahadahModal, setShowSyahadahModal] = useState(false);
  const [showVictoryDetails, setShowVictoryDetails] = useState(false);

  // 4b. Dynamic Weather & Mystery Chest States
  const [weatherMode, setWeatherMode] = useState('night'); // 'night' | 'rain' | 'aurora'
  const [showLootChestModal, setShowLootChestModal] = useState(false);
  const [chestClaimed, setChestClaimed] = useState(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      return localStorage.getItem('talqeeh_chest_claimed_date') === today;
    } catch { return false; }
  });
  const [claimedLoot, setClaimedLoot] = useState(null);
  const [lootBonus, setLootBonus] = useState({});
  const [chestToast, setChestToast] = useState('');

  const handleOpenLootChest = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (chestClaimed) {
      sfx.playBip(440);
      setChestToast("Alhamdulillah! Peti Hikmah hari ini sudah dibuka (+50 EXP & Item tersimpan). Datang lagi besok untuk berkah harian berikutnya!");
      setTimeout(() => setChestToast(''), 4500);
      return;
    }

    const randomLoot = AZHAR_WISDOM_LOOT[Math.floor(Math.random() * AZHAR_WISDOM_LOOT.length)] || AZHAR_WISDOM_LOOT[0];
    setClaimedLoot(randomLoot);

    setUserProgress(prev => {
      const updated = {
        ...prev,
        totalExp: (prev.totalExp || 0) + 50
      };
      try {
        localStorage.setItem('talqeeh_battle_progress', JSON.stringify(updated));
        localStorage.setItem('talqeeh_chest_claimed_date', today);
      } catch {}
      return updated;
    });

    // Peti dibuka di peta, sedangkan tas di-reset tiap duel dimulai; simpan sebagai bonus untuk duel berikutnya.
    if (randomLoot.itemReward?.key) {
      setLootBonus(b => ({
        ...b,
        [randomLoot.itemReward.key]: (b[randomLoot.itemReward.key] || 0) + (randomLoot.itemReward.qty || 1)
      }));
    }

    setChestClaimed(true);
    sfx.playChestOpen();
    setShowLootChestModal(true);
  };

  // 5. Narrative Story Prologue State
  const [storyStep, setStoryStep] = useState(0);

  // 6. Cinematic Attack Cutscene State ("Scene Pas Nyerang") & Speed Toggle (1x / 2x)
  const [attackCutscene, setAttackCutscene] = useState(null);
  const [enableCutscene, setEnableCutscene] = useState(true);
  const [battleSpeed, setBattleSpeed] = useState(() => {
    try {
      const saved = localStorage.getItem('talqeeh_battle_speed');
      return saved ? Number(saved) : 1;
    } catch (e) {
      return 1;
    }
  });

  const toggleBattleSpeed = () => {
    setBattleSpeed(prev => {
      const next = prev === 1 ? 2 : 1;
      try { localStorage.setItem('talqeeh_battle_speed', String(next)); } catch (e) {}
      sfx.playBip(next === 2 ? 720 : 480);
      return next;
    });
  };

  // Semua timeout animasi duel lewat sini, supaya bisa dibatalkan saat keluar arena / unmount.
  // Tanpa ini, timer yang masih jalan bisa melempar pemain ke layar menang/kalah setelah ia keluar.
  const battleTimersRef = useRef(new Set());
  const scheduleBattle = (fn, ms) => {
    const id = setTimeout(() => {
      battleTimersRef.current.delete(id);
      fn();
    }, ms);
    battleTimersRef.current.add(id);
    return id;
  };
  const clearBattleTimers = () => {
    battleTimersRef.current.forEach(clearTimeout);
    battleTimersRef.current.clear();
  };

  useEffect(() => {
    if (phase === 'battle') return;
    clearBattleTimers();
    setAttackCutscene(null);
    setIsActionBusy(false);
    setScreenShake(false);
    setProjectile(null);
    setAttackEffect(null);
    setDamageReaction(null);
    setFloatingText(null);
  }, [phase]);

  useEffect(() => clearBattleTimers, []);

  const [defeatReason, setDefeatReason] = useState('hp'); // 'hp' | 'boss-survived'

  // Statistik duel untuk misi. Ref dipakai saat menilai di handler bertimer (state di closure bisa basi).
  const EMPTY_STATS = { wrong: 0, items: 0, help: 0, maxStreak: 0 };
  const [battleStats, setBattleStats] = useState(EMPTY_STATS);
  const battleStatsRef = useRef(EMPTY_STATS);
  const bumpStats = (patch) => {
    const next = { ...battleStatsRef.current, ...patch(battleStatsRef.current) };
    battleStatsRef.current = next;
    setBattleStats(next);
  };
  const [missionToast, setMissionToast] = useState(null); // { icon, text, tone }
  const [duelIntro, setDuelIntro] = useState(false); // layar "VS" pembuka duel
  const [koAnim, setKoAnim] = useState(false);       // adegan penjaga tumbang sebelum layar menang
  const bossEnraged = phase === 'battle' && bossHp > 0 && bossHp <= bossMaxHp * 0.3;
  const arenaTheme = getArenaTheme(activeStage?.levelNumber || activeStage?.id || 1);
  const enragedSeenRef = useRef(false);
  useEffect(() => {
    if (!bossEnraged || enragedSeenRef.current) return;
    enragedSeenRef.current = true;
    setMissionToast({ icon: 'warning', text: 'Penguji menaikkan tingkat ujian — tetap fokus!', tone: 'failed' });
    const t = setTimeout(() => setMissionToast(null), 2600);
    return () => clearTimeout(t);
  }, [bossEnraged]);
  const [missionResult, setMissionResult] = useState(null); // [{ id, status }] hasil duel terakhir
  const [showMissions, setShowMissions] = useState(false);
  const stageMissions = getStageMissions(activeStage, activeQuiz.length);

  // Beri tahu pemain saat sebuah misi tuntas/gagal di tengah duel (sekali per misi).
  const missionSeenRef = useRef({});
  useEffect(() => {
    if (phase !== 'battle') return;
    for (const id of stageMissions) {
      const st = missionStatus(id, battleStats, { playerHp });
      if (st === 'active' || missionSeenRef.current[id] === st) continue;
      missionSeenRef.current[id] = st;
      const def = MISSION_DEFS[id];
      setMissionToast({ icon: st === 'done' ? 'check' : 'cross', text: `${st === 'done' ? 'Misi tuntas' : 'Misi gagal'}: ${def.label}`, tone: st });
      if (st === 'done') sfx.playCombo?.(3); else sfx.playBip?.(220);
      const t = setTimeout(() => setMissionToast(null), 2600);
      return () => clearTimeout(t);
    }
  }, [battleStats, phase]);

  // Menu game: panel profil/misi/paste di layar pilih, dan bottom sheet detail level di HP.
  const [menuPanel, setMenuPanel] = useState(null); // null | 'profile' | 'quests' | 'paste'
  const [sheetOpen, setSheetOpen] = useState(false);
  useEffect(() => { setMenuPanel(null); setSheetOpen(false); }, [phase]);
  useEffect(() => {
    if (!menuPanel) return;
    const onKey = (e) => { if (e.key === 'Escape') setMenuPanel(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuPanel]);

  // Peta mengisi seluruh area (seperti background-size: cover) dengan rasio 16:9 tetap supaya node level
  // tetap pas di atas gambar; bagian yang lebih lebar/tinggi dari layar digeser (sentuh di HP, seret di desktop).
  const mapScrollRef = useRef(null);
  const [mapViewport, setMapViewport] = useState(null);
  useEffect(() => {
    if (phase !== 'map') return;
    const box = mapScrollRef.current;
    if (!box || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setMapViewport({ w: box.clientWidth, h: box.clientHeight }));
    ro.observe(box);
    return () => ro.disconnect();
  }, [phase]);

  // Pusatkan pada avatar thalib (level terpilih) saat peta dibuka, level diganti, atau ukuran layar berubah.
  useEffect(() => {
    if (phase !== 'map') return;
    const id = requestAnimationFrame(() => {
      const box = mapScrollRef.current;
      const focus = box?.querySelector('[data-map-focus]');
      if (!box || !focus) return;
      box.scrollTo({
        left: Math.max(0, focus.offsetLeft - box.clientWidth / 2),
        top: Math.max(0, focus.offsetTop - box.clientHeight / 2),
        behavior: 'smooth'
      });
    });
    return () => cancelAnimationFrame(id);
  }, [phase, selectedStageId, mapViewport]);

  // Seret peta dengan mouse; sentuhan memakai scroll bawaan. Klik setelah menyeret tidak memilih level.
  const mapDragRef = useRef(null);
  const onMapPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const box = mapScrollRef.current;
    if (!box) return;
    mapDragRef.current = { x: e.clientX, y: e.clientY, left: box.scrollLeft, top: box.scrollTop, moved: false };
  };
  const onMapPointerMove = (e) => {
    const d = mapDragRef.current;
    const box = mapScrollRef.current;
    if (!d || !box) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.abs(dx) + Math.abs(dy) < 6) return;
    d.moved = true;
    box.scrollLeft = d.left - dx;
    box.scrollTop = d.top - dy;
  };
  const onMapPointerUp = () => {
    const d = mapDragRef.current;
    mapDragRef.current = null;
    if (d?.moved) {
      // Telan klik yang menyusul pointerup supaya level di bawah kursor tidak ikut terpilih.
      const swallow = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
      window.addEventListener('click', swallow, { capture: true, once: true });
      setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 0);
    }
  };

  const handleSkipCutscene = () => {
    setAttackCutscene(null);
  };

  // Audio mute toggle
  const toggleAudio = () => {
    const nextMuted = !audioMuted;
    sfx.muted = nextMuted;
    setAudioMuted(nextMuted);
    if (nextMuted) {
      sfx.stopBgm();
    } else {
      sfx.playBip();
      if (phase === 'battle') sfx.startBgm();
    }
  };

  // Fullscreen Toggle (Native HTML5 API + CSS Fallback)
  // Tata letak game sudah selalu penuh; tombol ini hanya meminta/menutup fullscreen browser (sembunyikan bar browser).
  // Browser yang menolak (mis. Safari iPhone) tetap memakai tampilan penuh aplikasi.
  const toggleFullscreen = () => {
    const doc = document;
    const isCurrentlyFs = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
    if (!isCurrentlyFs) {
      const el = doc.documentElement;
      const requestFs = el?.requestFullscreen || el?.webkitRequestFullscreen || el?.mozRequestFullScreen || el?.msRequestFullscreen;
      if (requestFs) Promise.resolve(requestFs.call(el)).catch(() => {});
    } else {
      const exitFs = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
      if (exitFs) Promise.resolve(exitFs.call(doc)).catch(() => {});
    }
  };

  // Sync fullscreen change, BGM start/stop, and hotkeys (F = Fullscreen, M = Sound)
  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isFs);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    document.addEventListener('mozfullscreenchange', handleFsChange);
    document.addEventListener('MSFullscreenChange', handleFsChange);

    const handleKeyDown = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (attackCutscene) {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
          e.preventDefault();
          handleSkipCutscene();
          return;
        }
      }

      if (phase === 'story') {
        const dialogues = activeSet?.prologue?.dialogues || [];
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
          e.preventDefault();
          if (storyStep < dialogues.length - 1) {
            setStoryStep(s => s + 1);
            sfx.playStoryBip();
          } else {
            startBattle();
          }
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          if (storyStep > 0) {
            setStoryStep(s => s - 1);
            sfx.playBip(400);
          }
        } else if (e.key === 'Escape' || e.key === 's' || e.key === 'S') {
          e.preventDefault();
          startBattle();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if ((e.key === 'm' || e.key === 'M') && (phase === 'battle' || phase === 'story')) {
        e.preventDefault();
        toggleAudio();
      } else if ((e.key === 'z' || e.key === 'Z' || ((e.key === 's' || e.key === 'S') && phase === 'battle')) && phase === 'battle') {
        e.preventDefault();
        toggleBattleSpeed();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      document.removeEventListener('mozfullscreenchange', handleFsChange);
      document.removeEventListener('MSFullscreenChange', handleFsChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [phase, isFullscreen, audioMuted, storyStep, activeSet, attackCutscene, toggleBattleSpeed]);

  // Auto-import from Study / AI Partner / Talkhis module
  useEffect(() => {
    try {
      const importedRaw = sessionStorage.getItem('talqeeh_battle_custom_import');
      if (importedRaw) {
        sessionStorage.removeItem('talqeeh_battle_custom_import');
        const imported = JSON.parse(importedRaw);
        if (imported && (imported.text || imported.title)) {
          const title = imported.title || 'Diktat Hasil Muthola\'ah';
          const text = imported.text || '';
          const quiz = Array.isArray(imported.quiz) ? imported.quiz : [];
          if (!requireLibraryMember()) return;
          setCustomTitle(title);
          setCustomText(text);
          processCustomText(title, text, quiz);
          setImportToast(`Materi "${title}" berhasil dimuat ke Arena Imtihan! 4 Tingkat Imtihan telah disiapkan!`);
          setTimeout(() => setImportToast(''), 5500);
        }
      }
    } catch (e) {
      console.warn('Gagal membaca materi import battle:', e);
    }
  }, []);

  // BGM Manager
  useEffect(() => {
    if (phase === 'battle' && !audioMuted) {
      sfx.startBgm();
    } else {
      sfx.stopBgm();
    }
    return () => sfx.stopBgm();
  }, [phase, audioMuted]);


  // Save Victory & Rank Progress
  const saveVictoryProgress = (expGained = 75, starsCount = 3, finalStreak = streak, missionsDone = []) => {
    try {
      const current = userProgress || { totalExp: 0, streakRecord: 0, completedBosses: {}, stageProgress: {}, badges: [] };
      const bossId = activeSet.id;
      const stageId = activeStage?.id || 1;
      const isFinalStage = activeStage ? activeStage.isFinal : true;
      const taqdir = calculateTaqdir();

      // 1. Update Stage Progress
      const prevMuqarrarProgress = current.stageProgress?.[bossId] || { highestUnlocked: 1, stars: {} };
      const prevStars = prevMuqarrarProgress.stars?.[stageId] || 0;
      const newStars = Math.max(prevStars, starsCount);
      const totalStagesCount = activeSet.stages?.length || 4;
      const nextUnlocked = Math.min(
        totalStagesCount,
        Math.max(prevMuqarrarProgress.highestUnlocked || 1, stageId + 1)
      );

      const updatedStageProgress = {
        ...(current.stageProgress || {}),
        [bossId]: {
          ...prevMuqarrarProgress,
          highestUnlocked: nextUnlocked,
          stars: {
            ...(prevMuqarrarProgress.stars || {}),
            [stageId]: newStars
          },
          // Misi yang pernah tuntas di level ini (gabungan semua percobaan).
          missions: {
            ...(prevMuqarrarProgress.missions || {}),
            [stageId]: [...new Set([...(prevMuqarrarProgress.missions?.[stageId] || []), ...missionsDone])]
          }
        }
      };

      // 2. Wisam Badge & Boss Record
      const newBadges = [...(current.badges || [])];
      const newCompleted = { ...(current.completedBosses || {}) };

      if (isFinalStage) {
        const badgeId = `wisam-${bossId}`;
        if (!newBadges.some(b => b.id === badgeId)) {
          newBadges.push({
            id: badgeId,
            title: `Wisam ${activeSet.title.split(':')[0]}`,
            bossName: activeSet.bossName,
            maddah: activeSet.maddah,
            earnedAt: new Date().toISOString()
          });
        }
        newCompleted[bossId] = {
          taqdir: taqdir.title,
          stars: taqdir.stars,
          date: new Date().toISOString(),
          finalBossDefeated: true
        };
      }
      
      const updated = {
        ...current,
        totalExp: (current.totalExp || 0) + expGained,
        streakRecord: Math.max(current.streakRecord || 0, finalStreak),
        stageProgress: updatedStageProgress,
        completedBosses: newCompleted,
        badges: newBadges
      };

      localStorage.setItem('talqeeh_battle_progress', JSON.stringify(updated));
      setUserProgress(updated);
    } catch (err) {
      console.error('Failed to save victory progress:', err);
    }
  };

  // Record Study Room completion for Quests
  const recordStudyCompleted = () => {
    try {
      const current = userProgress || { totalExp: 0, streakRecord: 0, completedBosses: {}, badges: [] };
      if (!current.studyCompleted) {
        const updated = {
          ...current,
          totalExp: (current.totalExp || 0) + 25,
          studyCompleted: true,
          studyCompletedCount: (current.studyCompletedCount || 0) + 1
        };
        localStorage.setItem('talqeeh_battle_progress', JSON.stringify(updated));
        setUserProgress(updated);
      }
    } catch {}
  };

  // Calculate Thalib Academic Rank
  const getThalibRank = (exp = 0) => {
    if (exp >= 1000) return { title: "'Alim Kabir / Faqih Azhari", badge: "👑", level: 5, rankCode: "Rank SS", minExp: 1000, nextExp: null, nextTitle: "Maqam Puncak" };
    if (exp >= 600) return { title: "Thalib Muntahi (Tingkat 4)", badge: "🌟", level: 4, rankCode: "Rank S", minExp: 600, nextExp: 1000, nextTitle: "'Alim Kabir (Rank SS)" };
    if (exp >= 300) return { title: "Thalib Mutawassith (Tingkat 3)", badge: "⚔️", level: 3, rankCode: "Rank A", minExp: 300, nextExp: 600, nextTitle: "Thalib Muntahi (Rank S)" };
    if (exp >= 120) return { title: "Thalib Mustawa 2", badge: "📜", level: 2, rankCode: "Rank B", minExp: 120, nextExp: 300, nextTitle: "Thalib Mutawassith (Rank A)" };
    return { title: "Thalib Mubtadi' (Mustawa 1)", badge: "🔰", level: 1, rankCode: "Rank C", minExp: 0, nextExp: 120, nextTitle: "Thalib Mustawa 2 (Rank B)" };
  };

  // Download Ornate Azhari Syahadah PNG
  const downloadSyahadahCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background Parchment Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 800);
    bgGrad.addColorStop(0, '#0a120d');
    bgGrad.addColorStop(0.5, '#121e17');
    bgGrad.addColorStop(1, '#080d0a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 800);

    // Ornate Gold Double Border
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 10;
    ctx.strokeRect(30, 30, 1140, 740);

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(46, 46, 1108, 708);

    // Corner rosettes
    const drawCorner = (x, y) => {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
    };
    drawCorner(46, 46);
    drawCorner(1154, 46);
    drawCorner(46, 754);
    drawCorner(1154, 754);

    // Basmalah
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 30px "Amiri", "Noto Naskh Arabic", serif';
    ctx.textAlign = 'center';
    ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', 600, 105);

    // Header Title
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 34px "DM Sans", sans-serif';
    ctx.fillText('شَهَادَةُ إِتْمَامِ سَاحَةِ الِامْتِحَانِ', 600, 160);
    ctx.font = 'bold 16px "DM Sans", sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('TALQEEH • ARENA IMTIHAN — SERTIFIKAT LATIHAN', 600, 192);

    // Gold Divider Line
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(350, 218);
    ctx.lineTo(850, 218);
    ctx.stroke();

    // Body text
    ctx.fillStyle = '#e5e7eb';
    ctx.font = '20px "DM Sans", sans-serif';
    ctx.fillText('Berdasarkan hasil Arena Imtihan, Talqeeh mencatat bahwa:', 600, 275);

    // Student Name
    const studentName = profile?.name || 'Thalib Al-Azhar';
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 38px "DM Sans", sans-serif';
    ctx.fillText(studentName, 600, 335);

    // Subject
    ctx.fillStyle = '#e5e7eb';
    ctx.font = '22px "DM Sans", sans-serif';
    ctx.fillText(`Telah berhasil menuntaskan dan menguasai materi muqarrar:`, 600, 395);

    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 28px "DM Sans", sans-serif';
    ctx.fillText(`${activeSet.title} (${activeSet.maddah})`, 600, 440);

    // Predikat / Taqdir Box
    const taqdir = calculateTaqdir();
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(340, 480, 520, 75);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.strokeRect(340, 480, 520, 75);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 24px "DM Sans", sans-serif';
    ctx.fillText(`PREDIKAT: ${taqdir.title.toUpperCase()} ${taqdir.stars}`, 600, 528);

    // Digital Stamp / Seal (Red/Gold Circle)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(980, 620, 65, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 15px "DM Sans", sans-serif';
    ctx.fillText('مَرْكَز تَلْقِيح', 980, 605);
    ctx.font = 'bold 13px "DM Sans", sans-serif';
    ctx.fillText('تَدْرِيب', 980, 625);
    ctx.fillText('TALQEEH 2026', 980, 645);

    // Date & Footer
    const today = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.fillStyle = '#9ca3af';
    ctx.font = '16px "DM Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Kairo, Mesir • ${today}`, 70, 725);
    ctx.textAlign = 'right';
    ctx.fillText(`Kode Sertifikat: TLQ-${Date.now().toString().slice(-6)}`, 1130, 725);

    // Penegasan: ini sertifikat latihan dari game, bukan dokumen resmi Universitas Al-Azhar.
    ctx.textAlign = 'center';
    ctx.font = '14px "DM Sans", sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('Sertifikat latihan dari game Arena Imtihan Talqeeh — bukan ijazah atau sertifikat resmi Universitas Al-Azhar.', 600, 700);

    // Trigger Download
    const link = document.createElement('a');
    link.download = `Syahadah-Talqeeh-${studentName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  /* ── Handler Upload Dokumen Diktat ── */
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!requireLibraryMember()) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setUploadBusy(true);
    setUploadError('');
    try {
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      let extracted = '';
      if (ext === 'pdf') {
        if (typeof window.readPdfPages !== 'function') throw new Error('Pembaca PDF belum siap. Muat ulang halaman lalu coba lagi.');
        // readPdfPages sengaja mengembalikan pages: null bila PDF melebihi batas; dulu itu dianggap "tidak terbaca"
        // sehingga muqarrar > 40 halaman selalu gagal. Game hanya butuh cuplikan, jadi baca 60 halaman pertama saja.
        const MAX_PAGES = 60;
        const res = await window.readPdfPages(file, MAX_PAGES);
        const pages = res.pages || await window.readPdfRange(res.pdf, 1, Math.min(MAX_PAGES, res.numPages));
        // Halaman hasil scan (tanpa teks) atau huruf Arabnya rusak tidak ikut dipakai.
        const usable = pages.filter(p => (p.status === 'ok' || p.status === 'fixed') && p.text?.trim());
        extracted = usable.map(p => p.text).join('\n\n');
        if (extracted.trim().length < 40) {
          throw new Error(pages.some(p => p.status === 'garbled')
            ? 'Huruf Arab di PDF ini tidak bisa dibaca (font-nya rusak). Unggah lewat AI Partner supaya dibaca dengan OCR, lalu pilih "Uji di Arena Imtihan".'
            : 'PDF ini sepertinya hasil scan/foto, jadi tidak ada teks yang bisa dibaca. Unggah lewat AI Partner (bisa membaca foto dengan OCR), lalu pilih "Uji di Arena Imtihan".');
        }
      } else if (ext === 'doc') {
        throw new Error('Format .doc lama belum didukung. Buka filenya lalu "Save As" .docx, atau unggah PDF-nya.');
      } else if (ext === 'docx') {
        extracted = await window.extractDocx(file);
      } else if (ext === 'pptx') {
        extracted = await window.extractPptx(file);
      } else if (file.type === 'text/plain' || ext === 'txt' || ext === 'md') {
        extracted = await file.text();
      } else {
        throw new Error('Format file belum didukung. Gunakan PDF, Word (.docx), PowerPoint (.pptx), atau teks (.txt).');
      }

      if (!extracted || extracted.trim().length < 40) {
        throw new Error('Isi dokumen terlalu sedikit untuk dijadikan arena (minimal beberapa paragraf).');
      }

      const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
      setCustomTitle(cleanTitle);
      setCustomText(extracted);
      processCustomText(cleanTitle, extracted);
      setImportToast(`Materi "${cleanTitle}" berhasil dimuat ke Arena Imtihan! 4 Tingkat Imtihan telah disiapkan!`);
      setTimeout(() => setImportToast(''), 5500);
    } catch (err) {
      console.warn('Upload diktat Arena Imtihan gagal:', err);
      setUploadError(err.message || 'Gagal memproses file diktat.');
    } finally {
      setUploadBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /* ── Proses Teks Diktat Custom menjadi Dataset Battle ── */
  function processCustomText(title, text, existingQuiz = []) {
    // Semua jalur materi sendiri (upload, paste, impor dari AI Partner) lewat sini — kunci di satu tempat.
    if (!requireLibraryMember()) return;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
    const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 20);

    // Ambil kalimat kunci untuk ringkasan
    const summaryItems = paragraphs.slice(0, 4).map((p, i) => ({
      heading: `Poin Penting #${i + 1}`,
      arabic: '',
      body: p.slice(0, 240) + (p.length > 240 ? '...' : '')
    }));

    // Ekstrak calon mufradat / istilah
    const terms = lines.slice(0, 4).map((l, i) => {
      const parts = l.split(/[:\-=—]/);
      return {
        term: parts[0]?.trim().slice(0, 35) || `Istilah #${i + 1}`,
        def: parts[1]?.trim().slice(0, 100) || l.slice(0, 80)
      };
    });

    // Buat Flashcard
    const flashcards = paragraphs.slice(0, 4).map((p, i) => ({
      q: `Apa intisari dari bahasan bagian #${i + 1} materi ini?`,
      a: p.slice(0, 150) + '...'
    }));

    // Buat Soal Pertarungan (Hingga 8 soal imtihan)
    const generatedQuiz = paragraphs.slice(0, 8).map((p, idx) => {
      const sentence = p.split(/[.!?]/)[0] || p;
      return {
        question: `Berdasarkan teks diktat pada bab ini: "${sentence.slice(0, 110)}..." — Apakah poin utama yang ditegaskan?`,
        options: [
          sentence.slice(0, 75),
          `Menunjukkan bahwa hukumnya tidak berlaku secara mutlak di luar konteks ini`,
          `Bertentangan dengan qoul mu'tamad yang diuraikan pada pasal lainnya`,
          `Merupakan cabang masalah yang tidak disyaratkan dalam rukun`
        ],
        answer: 0,
        explanation: `Sesuai teks diktat: "${sentence.slice(0, 140)}".`,
        hint: `Fokus pada kalimat awal dari potongan paragraf materi yang sedang diuji.`,
        examTip: `Rumus lembar ujian (Kurrasah Ijabah): 1) Tuliskan kaidah/nash pokok yang menjadi rukun bahasan ini, 2) Uraikan ta'rif serta 'illat hukumnya, 3) Buat kesimpulan fatwa/hukum sesuai qoul mu'tamad.`
      };
    });

    // Format quiz yang sudah ada (dari modul AI Partner / QuizTab)
    const formattedExistingQuiz = (Array.isArray(existingQuiz) && existingQuiz.length > 0)
      ? existingQuiz.map(q => ({
          question: q.question,
          options: Array.isArray(q.options) ? q.options : [],
          answer: typeof q.answer === 'number' ? q.answer : 0,
          explanation: q.explanation || `Sesuai pemaparan diktat materi.`,
          hint: q.hint || `Perhatikan ta'rif dan kaidah pokok pada teks.`,
          examTip: q.examTip || `Tuliskan kaidah/nash pokok di lembar ujian (kurrasah ijabah).`
        }))
      : [];

    const finalQuiz = formattedExistingQuiz.length >= 3
      ? formattedExistingQuiz
      : (generatedQuiz.length >= 3 ? generatedQuiz : PRESETS[0].quiz);

    const customStages = [
      {
        id: 1,
        levelNumber: 1,
        title: 'Level 1: Gerbang Diktat Mandiri',
        titleArabic: 'الْمَرْحَلَةُ الأُولَى: بَابُ التَّحْصِيلِ',
        location: "Ruwaq Muthola'ah Al-Azhar • Gerbang Awal",
        guardianName: `Khadim Diktat: Murid ${title.slice(0, 16)}`,
        guardianRank: "Rank C (Mubtadi')",
        guardianRankCode: "Rank C",
        guardianAvatar: '📜',
        bossHp: 60,
        expReward: 35,
        quizIndices: [0, Math.min(1, finalQuiz.length - 1)],
        isFinal: false,
        lore: `Ujian tingkat awal untuk menguji dasar-dasar pemahaman materi "${title}".`
      },
      {
        id: 2,
        levelNumber: 2,
        title: 'Level 2: Ruwaq Kaidah & Ta\'rif',
        titleArabic: 'الْمَرْحَلَةُ الثَّانِيَةُ: رِوَاقُ التَّعْرِيفِ',
        location: "Ruwaq Al-Magharibah • Koridor Telaah",
        guardianName: `Musa'id Diktat: ${title.slice(0, 16)}`,
        guardianRank: "Rank B (Mutawassith)",
        guardianRankCode: "Rank B",
        guardianAvatar: '📘',
        bossHp: 80,
        expReward: 50,
        quizIndices: [Math.min(2, finalQuiz.length - 1), Math.min(3, finalQuiz.length - 1)],
        isFinal: false,
        lore: `Membedah kaidah pokok dan istilah-istilah sentral pada materi "${title}".`
      },
      {
        id: 3,
        levelNumber: 3,
        title: 'Level 3: Shahn Analisis Mendalam',
        titleArabic: 'الْمَرْحَلَةُ الثَّالِثَةُ: صَحْنُ التَّدْقِيقِ',
        location: "Pelataran Shahn Al-Azhar Asy-Syarif",
        guardianName: `Muhaqqiq Diktat: ${title.slice(0, 16)}`,
        guardianRank: "Rank A (Mutaqaddim)",
        guardianRankCode: "Rank A",
        guardianAvatar: '🏛️',
        bossHp: 90,
        expReward: 65,
        quizIndices: [Math.min(4, finalQuiz.length - 1), Math.min(5, finalQuiz.length - 1)],
        isFinal: false,
        lore: `Uji penalaran mendalam atas cabang-cabang hukum dan korelasi kaidah.`
      },
      {
        id: 4,
        levelNumber: 4,
        title: `FINAL BOSS: Ujian Akbar Al-'Allamah (${title.slice(0, 18)})`,
        titleArabic: 'الْمَرْحَلَةُ الرَّابِعَةُ: امْتِحَانُ العَلَّامَةِ الكَبِيرِ',
        location: "Puncak Mihrab Markaziyyah Al-Azhar",
        guardianName: `Syaikhul Imtihan: Al-'Allamah ${title.slice(0, 18)}`,
        guardianRank: "Rank S (Kibar Ulama)",
        guardianRankCode: "Rank S",
        guardianAvatar: '👳‍♂️',
        bossHp: 100,
        expReward: 100,
        quizIndices: [Math.min(6, finalQuiz.length - 1), 0, 1, 2].slice(0, Math.min(4, finalQuiz.length)),
        isFinal: true,
        lore: `Al-'Allamah Syaikhul Imtihan hadir menguji seluruh penguasaan naskah "${title}"! Selesaikan untuk memperoleh Syahadah Arena Imtihan!`
      }
    ];

    const newSet = {
      id: 'custom-' + Date.now(),
      title: title || 'Diktat Muqarrar Pilihan',
      titleArabic: 'مُقَرَّرٌ مُخْتَارٌ',
      maddah: 'Diktat Unggahan Mandiri',
      bossName: `Syaikhul Imtihan: Al-'Allamah ${title.slice(0, 18)}`,
      bossLv: Math.min(50, 20 + Math.floor(text.length / 300)),
      bossRank: 'Rank S (Kibar Ulama)',
      bossRankCode: 'Rank S',
      bossHp: 100,
      bossAvatar: '👳‍♂️',
      stages: customStages,
      prologue: {
        chapter: 'HIKAYAT DIKTAT PILIHAN',
        title: `Ujian Pengetahuan: ${title}`,
        titleArabic: 'امْتِحَانُ التَّحْصِيلِ وَالْمُطَالَعَةِ',
        location: 'Ruwaq Muthola\'ah Al-Azhar • Waktu Ujian Mandiri',
        epigraph: '«مَن قَيَّدَ الْعِلْمَ بِالْكِتَابَةِ، نَالَ بِهِ شَرَفَ الْإِجَابَةِ»',
        epigraphMeaning: 'Barangsiapa mengikat ilmu dengan catatan dan muthola\'ah, ia meraih kemuliaan dalam menjawab ujian.',
        dialogues: [
          {
            speaker: 'Narator',
            avatar: '📖',
            role: 'Ruwaq Muthola\'ah',
            text: `Lembaran naskah "${title}" terbuka di hadapan Thalib. Setiap baris muthola'ah dan diktat berubah menjadi medan ujian akademis!`
          },
          {
            speaker: 'Thalib Azhar',
            avatar: '🎓',
            role: 'Pena di Tangan',
            text: 'Catatan ini telah kupelajari berulang kali. Kini saatnya membuktikan bahwa muthola\'ah membuahkan pemahaman yang kokoh!'
          },
          {
            speaker: `Syaikhul Imtihan`,
            avatar: '👳‍♂️',
            role: 'Al-\'Allamah Penguji',
            text: `«أَهْلًا بِكَ يَا طَالِبَ الْعِلْمِ!» Naskah "${title}" telah kau pelajari. Tunjukkan kedalaman hujjah dan pemahamanmu di hadapan para Masyayikh Al-Azhar!`
          },
          {
            speaker: 'Thalib Azhar',
            avatar: '🎓',
            role: 'Menatap Yakin',
            text: 'Bismillah! Dengan bekal belajar dan pertolongan Allah, hamba siap menghadapi imtihan ini!'
          }
        ]
      },
      summary: summaryItems.length ? summaryItems : PRESETS[0].summary,
      terms: terms.length ? terms : PRESETS[0].terms,
      flashcards: flashcards.length ? flashcards : PRESETS[0].flashcards,
      quiz: finalQuiz,
      sourceText: text.slice(0, 5000)
    };

    setActiveSet(newSet);
    setSelectedStageId(1);
    setActiveStage(customStages[0]);
    setPhase('map');
    sfx.playBip(580);
    // Cerita bawaan untuk diktat unggahan generik; minta AI menulis cerita yang sesuai isi materi.
    generateAiStory(newSet, { silent: true });
  }

  /* ── Masuk ke Prolog Cerita (Sebelum Bertanding) ── */
  const enterStoryPrologue = () => {
    recordStudyCompleted();
    setStoryStep(0);
    setPhase('story');
    sfx.stopBgm();
    sfx.playStoryIntro();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── Mulai Pertarungan ── */
  const startBattle = (stageOverride = null) => {
    // onClick={startBattle} mengirim event klik, bukan stage; abaikan yang bukan objek stage.
    const isStage = stageOverride && Array.isArray(stageOverride.quizIndices);
    const currentStage = (isStage ? stageOverride : null) || activeStage || (activeSet?.stages ? activeSet.stages[0] : null);
    if (currentStage && currentStage !== activeStage) {
      setActiveStage(currentStage);
      setSelectedStageId(currentStage.id);
    }
    clearBattleTimers();
    setShuffleSeed(s => s + 1);
    sfx.init();
    setPhase('battle');
    setCurrentQ(0);
    setPlayerHp(100);
    const targetHp = currentStage?.bossHp || 100;
    setBossHp(targetHp);
    setBossMaxHp(targetHp);
    setStreak(0);
    setDefenseShield(false);
    setDefeatReason('hp');
    const loot = lootBonus || {};
    setBag({
      tea: 2 + (loot.tea || 0),           // Syay bil Na'na' (+35 HP)
      ahwah: 1 + (loot.ahwah || 0),       // Ahwah Mazbut (-50% Shield)
      summary: 1 + (loot.summary || 0),   // Khulashah (50:50)
      qamus: 2 + (loot.qamus || 0),       // Qamus Al-Munawwir (Hint)
      kurrasah: 1 + (loot.kurrasah || 0)  // Kurrasah Ad-Duf'ah (Safe Skip)
    });
    setLootBonus({});
    setActiveHint(null);
    setDisabledOptions([]);
    setWrongAnswers([]);
    battleStatsRef.current = EMPTY_STATS;
    setBattleStats(EMPTY_STATS);
    missionSeenRef.current = {};
    setMissionToast(null);
    setMissionResult(null);
    enragedSeenRef.current = false;
    setKoAnim(false);
    setDuelIntro(true);
    scheduleBattle(() => setDuelIntro(false), battleSpeed === 2 ? 1500 : 2600);
    setWrongReview(null);
    setSelectedAnswer(null);
    setIsActionBusy(false);
    setAnsweredCount(0);
    setBattleMenu('main');
    setAnimBoss('idle');
    setAnimPlayer('idle');
    setFloatingText(null);
    setProjectile(null);
    setAttackEffect(null);
    setScreenShake(false);
    setDamageReaction(null);
    setAiChatLog([]);
    const guardianTitle = currentStage?.guardianName || activeSet.bossName;
    const questionCount = currentStage?.quizIndices?.length || activeSet?.quiz?.length || 1;
    const { requiredCorrect } = getBattleRules(currentStage, questionCount);
    setDialogText(`⚔️ ${guardianTitle} menghadangmu di ${currentStage?.location || 'Ruwaq Al-Azhar'}! Jawab benar minimal ${requiredCorrect} dari ${questionCount} soal untuk menumbangkannya!`);
    sfx.playCrit();
  };

  /* ── Turn Pemain: Memilih Jawaban (Dengan Combo Streak & Defense Shield) ── */
  const handleSelectAnswer = (optionIdx) => {
    if (phase !== 'battle' || isActionBusy) return;
    const currentQuestion = activeQuiz[currentQ];
    if (!currentQuestion) return;
    const isCorrect = optionIdx === currentQuestion.answer;
    const { damagePerCorrect: baseDamage, counterDamage } = getBattleRules(activeStage, activeQuiz.length);

    setIsActionBusy(true);
    setSelectedAnswer({ optionIdx, isCorrect });
    setDisabledOptions([]);
    setActiveHint(null);
    setAnsweredCount(c => c + 1);


    const guardianName = activeStage?.guardianName || activeSet.bossName;
    const guardianAvatar = activeStage?.guardianAvatar || activeSet.bossAvatar;
    const speedFactor = battleSpeed === 2 ? 0.5 : 1;

    if (isCorrect) {
      // Hitung Combo Streak (Hujjah Mutawatirah)
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      bumpStats(s => ({ maxStreak: Math.max(s.maxStreak, nextStreak) }));

      const streakMult = nextStreak >= 2 ? (1 + Math.min(nextStreak - 1, 3) * 0.2) : 1;
      const actualDamage = Math.round(baseDamage * streakMult);
      const nextBossHp = Math.max(0, bossHp - actualDamage);
      const isFinisher = nextBossHp <= 0;

      // Nama jurus & ungkapan adab ilmu. Sengaja bukan ayat Al-Qur'an: lawan di game ini adalah penguji (ulama),
      // jadi ayat tentang al-batil atau tantangan kepada orang kafir tidak pantas diarahkan kepada mereka.
      let moveName = "HUJJAH QATH'IYYAH";
      let moveArabic = "حُجَّةٌ قَاطِعَةٌ";
      let subtitle = "Hantaman Argumen Qath'i Azhari!";
      let chant = "«الْحُجَّةُ بِالدَّلِيلِ لَا بِالدَّعْوَى»";
      let chantTranslation = "Hujjah ditegakkan dengan dalil, bukan sekadar klaim.";

      if (isFinisher) {
        moveName = "BURHAN SATHI' (FINISHER)";
        moveArabic = "بُرْهَانٌ سَاطِعٌ";
        subtitle = "Cahaya Pembuktian Pamungkas!";
        chant = "«مَنْ حَفِظَ الْمُتُونَ حَازَ الْفُنُونَ»";
        chantTranslation = "Siapa yang menguasai matan, menguasai ilmunya.";
      } else if (nextStreak >= 2) {
        moveName = `HUJJAH MUTAWATIRAH x${nextStreak}`;
        moveArabic = `حُجَّةٌ مُتَوَاتِرَةٌ x${nextStreak}`;
        subtitle = `Rangkaian Dalil Beruntun (Combo x${nextStreak})!`;
        chant = "«بِالتَّكْرَارِ يَرْسَخُ الْعِلْمُ»";
        chantTranslation = "Dengan pengulangan, ilmu makin kokoh tertanam.";
      }

      // Step 1: Luncurkan Scene Serangan (Charge Phase)
      if (enableCutscene) {
        setAttackCutscene({
          active: true,
          type: 'player',
          phase: 'charge',
          moveName,
          moveArabic,
          subtitle,
          chant,
          chantTranslation,
          streak: nextStreak,
          damage: actualDamage,
          isFinisher,
          bossName: guardianName,
          bossAvatar: guardianAvatar
        });
        sfx.playAttackCharge();
        if (nextStreak >= 2) sfx.playCombo(nextStreak);
        else sfx.playBip(580);
      } else {
        if (nextStreak >= 2) sfx.playCombo(nextStreak);
        else sfx.playBip(580);
      }

      setAnimPlayer('attack');
      setProjectile('crit');
      setDialogText(
        isFinisher
          ? `✨ FINISHER! Thalib melancarkan Burhan Sathi' pamungkas ke arah ${guardianName}!`
          : nextStreak >= 2
          ? `🔥 HUJJAH MUTAWATIRAH (Combo x${nextStreak})! Thalib melancarkan serangan beruntun!`
          : `⚔️ Thalib melancarkan Hujjah Qath'iyyah ke arah ${guardianName}!`
      );

      // Step 2: Hantaman Strike Scene
      scheduleBattle(() => {
        // Pasang ekspresi terkena damage untuk Boss
        const bossReaction = getBossHurtReaction(activeStage?.id || 4, activeSet.id, nextStreak);

        if (enableCutscene) {
          setAttackCutscene(c => c ? { ...c, phase: 'strike', reaction: bossReaction } : null);
        }

        sfx.playCrit();
        sfx.playSuperSlash();
        setAnimBoss('hit');
        setAttackEffect('crit');
        setScreenShake(true);
        scheduleBattle(() => setScreenShake(false), Math.round(450 * speedFactor));

        setBossHp(nextBossHp);

        setDamageReaction({ target: 'boss', ...bossReaction });

        if (nextStreak >= 2) {
          setFloatingText({ text: `🔥 COMBO x${nextStreak}! -${actualDamage} HP`, type: 'crit', target: 'boss' });
          setDialogText(`🔥 COMBO x${nextStreak}! Hujjah Mutawatirah meremukkan pertahanan ${guardianName}! (-${actualDamage} HP)`);
        } else {
          setFloatingText({ text: `CRITICAL! -${actualDamage} HP`, type: 'damage', target: 'boss' });
          setDialogText(`✨ CRITICAL HIT! Hujjah Qath'iyyah menghantam ${guardianName}! (-${actualDamage} HP)`);
        }

        // Step 3: Selesai hantaman & scene ekspresi kena serangan
        scheduleBattle(() => {
          if (enableCutscene) {
            setAttackCutscene(null);
          }
          setProjectile(null);
          setAttackEffect(null);
          setAnimPlayer('idle');
          setAnimBoss('idle');
          setDamageReaction(null);
        }, Math.round(900 * speedFactor));

        // Step 4: Transisi soal berikutnya atau menang
        scheduleBattle(() => {
          setFloatingText(null);
          setSelectedAnswer(null);
          setIsActionBusy(false);
          if (nextBossHp <= 0) {
            handleVictory(nextStreak);
          } else if (currentQ + 1 >= activeQuiz.length) {
            handleDefeat('boss-survived');
          } else {
            advanceNextQuestion();
          }
        }, Math.round(1150 * speedFactor));
      }, Math.round(520 * speedFactor));

    } else {
      // Pemain Salah Jawab ➔ Reset streak, periksa Tameng Difa' (Ahwah Mazbut)
      setStreak(0);

      let damageTaken = counterDamage;
      let shieldAbsorbed = false;
      if (defenseShield) {
        damageTaken = Math.ceil(counterDamage / 2);
        shieldAbsorbed = true;
        setDefenseShield(false);
      }

      const nextPlayerHp = Math.max(0, playerHp - damageTaken);

      // Luncurkan Scene Serangan Balik Boss
      if (enableCutscene) {
        setAttackCutscene({
          active: true,
          type: 'boss',
          phase: 'charge',
          moveName: "MAS'ALAH MUSYKILAH",
          moveArabic: "مَسْأَلَةٌ مُشْكِلَةٌ",
          subtitle: shieldAbsorbed ? "Tameng Ahwah Mazbut Menahan 50% Guncangan!" : "Pertanyaan Jebakan Menguji Ketelitianmu!",
          chant: "«حُسْنُ السُّؤَالِ نِصْفُ الْعِلْمِ»",
          chantTranslation: "Pertanyaan yang baik adalah separuh ilmu.",
          damage: damageTaken,
          shieldAbsorbed,
          bossName: guardianName,
          bossAvatar: guardianAvatar
        });
        sfx.playDamage();
      }

      // Step 1: Boss mulai serangan balik (0ms)
      setAnimBoss('attack');
      setProjectile('hurt');
      setDialogText(`⚠️ Pilihan kurang tepat! ${guardianName} mengajukan "Mas'alah Musykilah"!`);

      // Step 2: Serangan Boss menghantam Pemain
      scheduleBattle(() => {
        // Pasang ekspresi terkena damage untuk Pemain (Thalib Azhar)
        const playerReaction = getPlayerHurtReaction(shieldAbsorbed);

        if (enableCutscene) {
          setAttackCutscene(c => c ? { ...c, phase: 'strike', reaction: playerReaction } : null);
        }

        sfx.playDamage();
        setAnimPlayer('hit');
        setAttackEffect('hurt');
        setScreenShake(true);
        scheduleBattle(() => setScreenShake(false), Math.round(450 * speedFactor));

        setPlayerHp(nextPlayerHp);

        setDamageReaction({ target: 'player', ...playerReaction });

        if (shieldAbsorbed) {
          setFloatingText({ text: `🛡️ -${damageTaken} HP (TAMENG)`, type: 'damage', target: 'player' });
          setDialogText(`🛡️ Tameng Ahwah Mazbut menahan 50% syubhat! Thalib hanya terkena -${damageTaken} HP!`);
        } else {
          setFloatingText({ text: `-${damageTaken} HP!`, type: 'damage', target: 'player' });
          setDialogText(`💥 SALAH! ${guardianName} menguji dengan "Mas'alah Musykilah"! (-${damageTaken} HP)`);
        }

        const wrongEntry = {
          question: currentQuestion.question,
          chosen: currentQuestion.options[optionIdx],
          correct: currentQuestion.options[currentQuestion.answer],
          exp: currentQuestion.explanation,
          examTip: currentQuestion.examTip || "Formula lembar ujian (Kurrasah Ijabah): Tuliskan kaidah/nash pokok, jelaskan ta'rif serta 'illat hukumnya, lalu simpulkan fatwa/hukum sesuai qoul mu'tamad.",
          examTipTranslation: currentQuestion.examTipTranslation || null,
          damage: damageTaken,
          isFatal: nextPlayerHp <= 0,
          isFinalQ: currentQ + 1 >= activeQuiz.length
        };

        setWrongAnswers(w => [...w, wrongEntry]);
        bumpStats(s => ({ wrong: s.wrong + 1 }));

        // Step 3: Selesai hantaman & scene ekspresi kena serangan
        scheduleBattle(() => {
          if (enableCutscene) {
            setAttackCutscene(null);
          }
          setProjectile(null);
          setAttackEffect(null);
          setAnimBoss('idle');
          setAnimPlayer('idle');
          setDamageReaction(null);
          setFloatingText(null);
        }, Math.round(900 * speedFactor));

        // Step 4: Buka Kartu Muzakarah & Cara Jawab Ujian setelah user melihat scene lengkap
        scheduleBattle(() => {
          setSelectedAnswer(null);
          setIsActionBusy(false);
          setWrongReview(wrongEntry);
        }, Math.round(1150 * speedFactor));
      }, Math.round(520 * speedFactor));
    }
  };

  /* ── Putar Ulang Animasi Serangan Boss saat Review ── */
  const handleReplayWrongAnim = () => {
    if (isActionBusy) return;
    setIsActionBusy(true);

    const guardianName = activeStage?.guardianName || activeSet.bossName;
    const guardianAvatar = activeStage?.guardianAvatar || activeSet.bossAvatar;
    const speedFactor = battleSpeed === 2 ? 0.5 : 1;

    if (enableCutscene) {
      setAttackCutscene({
        active: true,
        type: 'boss',
        phase: 'charge',
        moveName: "MAS'ALAH MUSYKILAH",
        moveArabic: "مَسْأَلَةٌ مُشْكِلَةٌ",
        subtitle: "Pertanyaan Jebakan Menguji Ketelitianmu!",
        chant: "«حُسْنُ السُّؤَالِ نِصْفُ الْعِلْمِ»",
        chantTranslation: "Pertanyaan yang baik adalah separuh ilmu.",
        damage: getBattleRules(activeStage, activeQuiz.length).counterDamage,
        shieldAbsorbed: false,
        bossName: guardianName,
        bossAvatar: guardianAvatar,
        reaction: getPlayerHurtReaction(false)
      });
      sfx.playDamage();
    }

    setAnimBoss('attack');
    setProjectile('hurt');
    setDialogText(`⚠️ Mengulang scene serangan ${guardianName}...`);

    scheduleBattle(() => {
      const replayReaction = getPlayerHurtReaction(false);
      if (enableCutscene) {
        setAttackCutscene(c => c ? { ...c, phase: 'strike', reaction: replayReaction } : null);
      }
      sfx.playDamage();
      setAnimPlayer('hit');
      setAttackEffect('hurt');
      setScreenShake(true);
      scheduleBattle(() => setScreenShake(false), Math.round(450 * speedFactor));

      setDamageReaction({ target: 'player', ...replayReaction });

      scheduleBattle(() => {
        if (enableCutscene) {
          setAttackCutscene(null);
        }
        setProjectile(null);
        setAttackEffect(null);
        setAnimBoss('idle');
        setAnimPlayer('idle');
        setDamageReaction(null);
        setIsActionBusy(false);
        setDialogText(`💥 Peninjauan scene serangan selesai. Silakan periksa kunci jawaban di bawah.`);
      }, Math.round(900 * speedFactor));
    }, Math.round(520 * speedFactor));
  };

  /* ── Selesai Menelaah Pembahasan & Cara Jawab Ujian ── */
  const handleDismissWrongReview = () => {
    const isFatal = wrongReview?.isFatal || playerHp <= 0;
    const isFinalQ = wrongReview?.isFinalQ;
    setWrongReview(null);

    if (isFatal) {
      handleDefeat('hp');
    } else if (isFinalQ) {
      // Jawaban salah tidak melukai boss, jadi di soal terakhir boss pasti masih berdiri.
      handleDefeat('boss-survived');
    } else {
      advanceNextQuestion();
    }
  };

  const advanceNextQuestion = () => {
    const nextQ = currentQ + 1;
    setCurrentQ(nextQ);
    setSelectedAnswer(null);
    setIsActionBusy(false);
    setBattleMenu('main');
    setDialogText(`Soal ${nextQ + 1} dari ${activeQuiz.length}: Apa yang akan kamu lakukan, Thalib?`);
    sfx.playBip(480);
  };

  /* ── Menggunakan Item dari Bag (5 Koleksi Masisir) ── */
  const handleUseItem = (itemKey) => {
    // Item saat animasi serangan berjalan akan ditimpa nilai HP lama dari timer; tunggu giliran selesai.
    if (phase !== 'battle' || isActionBusy || wrongReview || bag[itemKey] <= 0) return;
    // Misi "Bekal Utuh" & "Mandiri": Qamus dan Khulashah juga dihitung sebagai bantuan.
    bumpStats(s => ({ items: s.items + 1, help: s.help + (itemKey === 'qamus' || itemKey === 'summary' ? 1 : 0) }));

    if (itemKey === 'tea') {
      sfx.playHeal();
      const newHp = Math.min(100, playerHp + 35);
      setPlayerHp(newHp);
      setBag(b => ({ ...b, tea: b.tea - 1 }));
      setFloatingText({ text: `+35 HP (HEAL)`, type: 'heal', target: 'player' });
      setDialogText(`☕ Minum Syay bil Na'na' panas! HP Thalib pulih +35! (HP: ${newHp}/100)`);
      setBattleMenu('main');
      scheduleBattle(() => setFloatingText(null), 1400);

    } else if (itemKey === 'ahwah') {
      sfx.playHeal();
      setDefenseShield(true);
      setBag(b => ({ ...b, ahwah: b.ahwah - 1 }));
      setFloatingText({ text: `TAMENG DIFA' (-50% DMG)`, type: 'heal', target: 'player' });
      setDialogText(`☕ Menyeruput Ahwah Mazbut pekat! Tameng Difa' aktif! Serangan boss berikutnya berkurang 50%!`);
      setBattleMenu('main');
      scheduleBattle(() => setFloatingText(null), 1500);

    } else if (itemKey === 'summary') {
      sfx.playBip(660);
      const curr = activeQuiz[currentQ];
      if (!curr) return;
      const wrongIdxs = curr.options
        .map((_, idx) => idx)
        .filter(idx => idx !== curr.answer);
      const shuffled = wrongIdxs.sort(() => 0.5 - Math.random()).slice(0, 2);
      setDisabledOptions(shuffled);
      setBag(b => ({ ...b, summary: b.summary - 1 }));
      setDialogText(`📜 Membuka Khulashah Ringkas! 2 opsi salah telah dieliminasi!`);
      setBattleMenu('fight');

    } else if (itemKey === 'qamus') {
      sfx.playBip(520);
      const curr = activeQuiz[currentQ];
      const hint = curr?.hint || 'Perhatikan ta\'rif dan kaidah di ruang muthola\'ah tadi!';
      setActiveHint(hint);
      setBag(b => ({ ...b, qamus: b.qamus - 1 }));
      setDialogText(`📖 Menelaah Qamus: "${hint}"`);
      setBattleMenu('fight');

    } else if (itemKey === 'kurrasah') {
      // Rukhshah: soal dianggap lulus (damage dasar, combo tidak naik). Tanpa damage, skip di level 2 soal
      // justru membuat boss mustahil dikalahkan.
      const { damagePerCorrect } = getBattleRules(activeStage, activeQuiz.length);
      const nextBossHp = Math.max(0, bossHp - damagePerCorrect);
      setIsActionBusy(true);
      sfx.playCrit();
      setBag(b => ({ ...b, kurrasah: b.kurrasah - 1 }));
      setBossHp(nextBossHp);
      setFloatingText({ text: `RUKHSHAH! -${damagePerCorrect} HP`, type: 'heal', target: 'boss' });
      setDialogText(`📚 Membuka Kurrasah Ad-Duf'ah! Dosen imtihan memberi rukhshah — soal ini dihitung lulus (-${damagePerCorrect} HP boss).`);
      setBattleMenu('main');
      scheduleBattle(() => {
        setFloatingText(null);
        setIsActionBusy(false);
        if (nextBossHp <= 0) {
          handleVictory(streak);
        } else if (currentQ + 1 >= activeQuiz.length) {
          handleDefeat('boss-survived');
        } else {
          advanceNextQuestion();
        }
      }, 1500);
    }
  };

  /* ── Interactive Halaqah Syaikh AI Handlers ── */
  const openAiHalaqah = () => {
    if (phase === 'battle') bumpStats(s => ({ help: s.help + 1 }));
    const currentQuestion = activeQuiz[currentQ];
    if (aiChatLog.length === 0) {
      setAiChatLog([
        {
          role: 'syaikh',
          text: `Assalamu'alaikum ya bunayya! Saya Syaikh AI Talqeeh. Di halaqah ini, apa yang musykil (membingungkan) bagimu dari muqarrar "${activeSet.title}" pada soal nomor ${currentQ + 1} ini?`
        }
      ]);
    }
    setShowAiModal(true);
  };

  /* Member Library ke atas: jawaban dari model AI asli (action battle-halaqah). Tamu, atau bila AI gagal: jawaban
     otomatis dari data soal. Sebelum soal dijawab, jawaban otomatis TIDAK memakai pembahasan (explanation) karena
     pembahasan selalu menyebut kunci jawabannya. Soal dianggap sudah dijawab bila kartu muzakarah sedang terbuka. */
  const askAiSyaikh = async (type, customPrompt = '') => {
    const currentQuestion = activeQuiz[currentQ];
    if (!currentQuestion || aiBusy) return;
    const answered = !!wrongReview;
    const prompts = {
      hint: 'Syaikh, berikan petunjuk (isyarah) tanpa langsung membocorkan kunci jawaban.',
      exam: 'Bagaimana rumus menyusun jawaban soal ini di lembar ujian (Kurrasah Ijabah) Al-Azhar?',
      explanation: "Bisa terangkan ta'rif dan kaidah pokok dari masalah ini, ya Syaikh?",
      diff: 'Apa perbedaan esensial antara opsi jawaban yang tampak mirip pada soal ini?',
      custom: customPrompt.trim(),
    };
    const userMsg = prompts[type];
    if (!userMsg) return;

    const guidance = currentQuestion.hint || "Kembalilah ke ta'rif dan kaidah yang sudah dibahas di Ruang Muthola'ah, lalu uji tiap opsi dengan kaidah itu.";
    const fallbackReply = () => {
      if (type === 'exam') {
        return currentQuestion.examTip || "Formula kurrasah ijabah tahriri: 1) Tuliskan kaidah/nash pokok yang menjadi poros masalah, 2) Uraikan ta'rif serta 'illat hukumnya, 3) Buat kesimpulan hukum sesuai qoul mu'tamad.";
      }
      if (answered && (type === 'explanation' || type === 'diff' || type === 'custom')) {
        return `Kunci jawabannya: «${currentQuestion.options[currentQuestion.answer]}». ${currentQuestion.explanation || ''}`;
      }
      if (type === 'diff') {
        return `Bandingkan tiap opsi dengan syarat kaidahnya satu per satu; opsi pengecoh biasanya hanya memenuhi sebagian syarat. Isyarahnya: ${guidance}`;
      }
      return `I'lam rahimakallah ya bunayya: ${guidance} Tafakkur dahulu sebelum memilih.`;
    };

    // Riwayat percakapan AI sebelumnya (tanpa salam pembuka & jawaban otomatis) supaya pertanyaan lanjutan nyambung.
    const history = aiChatLog
      .filter(m => m.role === 'thalib' || m.ai)
      .map(m => ({ role: m.role === 'thalib' ? 'user' : 'assistant', content: m.text }));

    setAiCustomInput('');
    setAiChatLog(prev => [...prev, { role: 'thalib', text: userMsg }]);

    if (!isLibraryMember || typeof window.aiCall !== 'function') {
      setAiChatLog(prev => [...prev, {
        role: 'syaikh',
        text: fallbackReply(),
        note: 'Jawaban otomatis dari pembahasan soal. Tanya jawab dengan Syaikh AI tersedia untuk member paket Library.',
      }]);
      return;
    }

    setAiBusy(true);
    const res = await window.aiCall('battle-halaqah', {
      mode: type,
      message: userMsg,
      question: currentQuestion.question,
      options: currentQuestion.options,
      answered,
      correct: answered ? currentQuestion.options[currentQuestion.answer] : undefined,
      chosen: answered ? wrongReview?.chosen : undefined,
      explanation: answered ? currentQuestion.explanation : undefined,
      maddah: activeSet.maddah,
      title: activeSet.title,
      history,
    });
    setAiBusy(false);
    setAiChatLog(prev => [...prev, res.ok && res.data?.reply
      ? { role: 'syaikh', text: res.data.reply, ai: true }
      : { role: 'syaikh', text: fallbackReply(), note: `${res.error || 'Syaikh AI sedang tidak bisa dihubungi.'} Ini jawaban otomatis dari pembahasan soal.` }]);
  };

  /* ── Menang & Kalah ── */
  // finalStreak dioper eksplisit: handler ini dipanggil dari timer, sehingga state `streak` di closure sudah basi.
  const handleVictory = (finalStreak = streak) => {
    sfx.playCrit();
    setBossHp(0);
    // Adegan KO (penjaga tumbang + konfeti) dulu, baru pindah ke layar menang. Progres sudah disimpan di bawah.
    setKoAnim(true);
    setIsActionBusy(true);
    scheduleBattle(() => {
      sfx.playVictory();
      setKoAnim(false);
      setIsActionBusy(false);
      setPhase('victory');
    }, battleSpeed === 2 ? 900 : 1700);
    const stageExp = activeStage?.expReward || 75;
    const stats = { ...battleStatsRef.current, maxStreak: Math.max(battleStatsRef.current.maxStreak, finalStreak) };
    const results = stageMissions.map(id => ({ id, status: missionStatus(id, stats, { finished: true, playerHp }) }));
    const missionsDone = results.filter(r => r.status === 'done').map(r => r.id);
    setMissionResult(results);
    const expGained = stageExp + (finalStreak > 0 ? finalStreak * 10 : 0) + missionsDone.length * MISSION_BONUS_EXP;
    const starsAwarded = playerHp >= 80 ? 3 : playerHp >= 50 ? 2 : 1;
    saveVictoryProgress(expGained, starsAwarded, finalStreak, missionsDone);
  };

  const handleDefeat = (reason = 'hp') => {
    setDefeatReason(reason);
    sfx.playDefeat();
    setPhase('defeat');
  };

  // Taqdir kalkulator
  const calculateTaqdir = () => {
    if (playerHp >= 80) return { title: 'Mumtaz Ma\'a Martabah Asy-Syaraf', stars: '★★★', color: 'text-amber-300' };
    if (playerHp >= 60) return { title: 'Jayyid Jiddan', stars: '★★', color: 'text-emerald-400' };
    if (playerHp >= 40) return { title: 'Jayyid', stars: '★', color: 'text-blue-300' };
    return { title: 'Maqbul', stars: '✓', color: 'text-zinc-300' };
  };

  // Layar pilih & peta adalah adegan game satu layar dengan HUD sendiri, jadi header & wadah halaman tidak dipakai.
  const isMenuScene = phase === 'select' || phase === 'map';

  const pageContent = (
    <div className={`battle-root ${isMenuScene ? "h-[100dvh] overflow-hidden" : "min-h-screen"} bg-[#080808] text-white font-sans antialiased selection:bg-emerald-500/30`} style={{ "--bs": battleSpeed === 2 ? 0.5 : 1 }}>
      
      {/* ── HEADER GAME / BAR ── */}
      {!isMenuScene && (
      <header className="border-b border-white/10 bg-[#0f0f10]/80 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={() => {
                if (phase === 'battle') {
                  if (confirm('Yakin ingin keluar dari arena battle? Progres duel saat ini akan di-reset.')) {
                    setPhase('map');
                  }
                } else if (phase === 'story') {
                  setPhase('map');
                } else if (phase === 'study') {
                  setPhase('map');
                } else if (phase === 'map') {
                  setPhase('select');
                } else if (phase === 'victory' || phase === 'defeat') {
                  setPhase('map');
                } else {
                  // Tamu ke beranda; /dashboard untuk tamu langsung membuka modal login.
                  navigate(session ? '/dashboard' : '/');
                }
              }}
              className="shrink-0 p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
              title="Kembali"
            >
              <Icon name="chevronLeft" className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] sm:text-xs whitespace-nowrap px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 uppercase tracking-wider font-semibold">
                  {phase === 'select' ? 'PILIH MUQARRAR' : phase === 'map' ? 'PETA LEVEL' : phase === 'study' ? 'RUANG MUTHOLA\'AH' : phase === 'story' ? 'PROLOG KISAH' : 'ARENA IMTIHAN'}
                </span>
                <span className="text-white/40 text-xs hidden sm:inline">•</span>
                <span className="text-white/80 text-xs font-medium hidden sm:inline">{activeSet.maddah}</span>
              </div>
              <h1 className="text-sm sm:text-base font-semibold text-white truncate sm:max-w-md">
                {activeSet.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Fullscreen Toggle — SELALU TERSEDIA DARI AWAL */}
            <button
              onClick={toggleFullscreen}
              className={`${canNativeFs ? '' : 'hidden '}p-2 rounded-lg border text-xs flex items-center gap-1.5 transition ${
                isFullscreen
                  ? 'border-amber-500/60 bg-amber-500/25 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white'
              }`}
              title={isFullscreen ? 'Keluar Fullscreen (Esc / F)' : 'Masuk Layar Penuh (F)'}
            >
              <Icon name={isFullscreen ? 'minimize' : 'maximize'} className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline font-mono font-bold">{isFullscreen ? 'KECILKAN' : 'FULLSCREEN (F)'}</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition ${
                audioMuted ? 'border-white/10 bg-white/5 text-white/40' : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
              }`}
              title={audioMuted ? 'Aktifkan Suara (M)' : 'Bisukan Suara (M)'}
            >
              <PixelIcon name={audioMuted ? 'mute' : 'note'} className="w-4 h-4" />
              <span className="hidden sm:inline font-mono">{audioMuted ? 'MUTE' : '8-BIT SFX'}</span>
            </button>

            {/* Quick Status Pill */}
            {phase === 'map' && (
              <button
                onClick={() => setPhase('study')}
                className="btn border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-semibold text-xs p-2 sm:px-3.5 rounded-lg transition flex items-center gap-1.5"
                title="Buka Ruang Muthola'ah"
              >
                <PixelIcon name="book" className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ruang Muthola'ah</span>
              </button>
            )}
            {phase === 'study' && (
              <button
                onClick={() => setPhase('map')}
                className="btn bg-gradient-to-r from-amber-500 to-emerald-500 text-black font-semibold text-xs px-3.5 py-2 rounded-lg shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition flex items-center gap-1.5"
              >
                <span><PixelIcon name="map" className="w-[1.15em] h-[1.15em]" /></span>
                <span><span className="hidden sm:inline">Peta Level </span>➔</span>
              </button>
            )}
            {phase === 'story' && (
              <button
                onClick={() => startBattle(activeStage)}
                className="btn bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-semibold text-xs px-3.5 py-2 rounded-lg shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition flex items-center gap-1.5"
              >
                <PixelIcon name="sword" className="w-4 h-4" />
                <span>Mulai<span className="hidden sm:inline"> Duel</span></span>
              </button>
            )}
          </div>
        </div>
      </header>
      )}

      {/* ── KONTEN UTAMA BERDASARKAN FASE ── */}
      <main className={isMenuScene ? "" : "max-w-5xl mx-auto p-4 sm:p-6 pb-24"}>
        {/* Banner Notifikasi Auto-Import Materi */}
        {importToast && (
          <div className={`${isMenuScene ? "fixed top-3 left-1/2 -translate-x-1/2 z-[60] w-[min(36rem,calc(100%-1.5rem))]" : "mb-6 relative"} rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-[#211709] via-[#1c221a] to-[#12281c] p-4 sm:p-5 shadow-[0_10px_30px_rgba(251,191,36,0.25)] overflow-hidden animate-fadeIn`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-black/70 border border-amber-400 flex items-center justify-center text-2xl shadow shrink-0">
                  <PixelIcon name="sword" className="w-[1.15em] h-[1.15em]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-wider">
                      MATERI DIKTAT SIAP DITANDINGKAN
                    </span>
                    <span className="text-xs text-emerald-400 font-mono">4 Level Terbuka</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white leading-tight">
                    {importToast}
                  </h4>
                </div>
              </div>
              <button
                onClick={() => setImportToast('')}
                className="text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            FASE 0: PILIH MUQARRAR — menu utama game, satu layar penuh.
            Tiga diktat preset tampil sebagai "dunia"; profil, misi, dan paste catatan dibuka sebagai panel di dalam layar.
            ========================================================================= */}
        {phase === 'select' && (() => {
          const exp = userProgress?.totalExp || 0;
          const rank = getThalibRank(exp);
          const rankPct = rank.nextExp
            ? Math.min(100, Math.max(8, Math.round(((exp - rank.minExp) / (rank.nextExp - rank.minExp)) * 100)))
            : 100;
          const bossesWon = Object.keys(userProgress?.completedBosses || {}).length;
          const hasMumtaz = Object.values(userProgress?.completedBosses || {}).some(b => b.taqdir?.includes('Mumtaz') || (b.stars && b.stars.length >= 3));
          const streakRec = userProgress?.streakRecord || 0;
          const hasMutholaah = !!userProgress?.studyCompleted;
          const quests = [
            { icon: 'gate', title: 'Penakluk 3 Muqarrar', desc: 'Kalahkan seluruh Boss Diktat resmi (Balaghah, Nahwu, dan Ushul Fiqh).', done: bossesWon >= 3, status: `${bossesWon}/3 TUNTAS`, exp: 150, reward: 'Gelar Mutafawwiq', tone: 'emerald' },
            { icon: 'star', title: 'Predikat Mumtaz Syaraf', desc: 'Menangkan pertarungan dengan sisa HP ≥ 80% untuk predikat kehormatan tertinggi.', done: hasMumtaz, status: 'TARGET: HP ≥ 80%', exp: 100, reward: 'Wisam Mumtaz', tone: 'amber' },
            { icon: 'fire', title: 'Hujjah Mutawatirah x4', desc: 'Bangun rantai serangan combo 4 jawaban benar berurutan tanpa salah.', done: streakRec >= 4, status: `REKOR: x${streakRec}/4`, exp: 75, reward: 'Fashih Lisan', tone: 'rose' },
            { icon: 'book', title: "Muthola'ah Terverifikasi", desc: "Khatamkan telaah ringkasan materi & kartu hafalan di Ruang Muthola'ah (Fase 1).", done: hasMutholaah, status: '0/1 KHATAM', exp: 50, reward: 'Perisai Ijtihad', tone: 'blue' },
          ];
          const questTone = {
            emerald: 'bg-emerald-950/40 border-emerald-400/50 text-emerald-300',
            amber: 'bg-amber-950/40 border-amber-400/50 text-amber-300',
            rose: 'bg-rose-950/40 border-rose-400/50 text-rose-300',
            blue: 'bg-blue-950/40 border-blue-400/50 text-blue-300',
          };
          const questsDone = quests.filter(q => q.done).length;
          const openPreset = (preset) => {
            const stageProg = getStageProgress(preset.id);
            const totalStages = preset.stages?.length || 4;
            setActiveSet(preset);
            const curStageId = Math.min(totalStages, stageProg.highestUnlocked || 1);
            setSelectedStageId(curStageId);
            setActiveStage(preset.stages?.find(s => s.id === curStageId) || preset.stages?.[0]);
            setPhase('map');
            sfx.playBip(520);
          };
          const panelTitle = { profile: 'PROFIL THALIB', quests: 'PAPAN MISI', paste: 'PASTE CATATAN' }[menuPanel];
          const panelIcon = { profile: 'scroll', quests: 'target', paste: 'quill' }[menuPanel];

          return (
            <div className="relative h-[100dvh] w-full overflow-hidden flex flex-col select-none animate-fadeIn">
              {/* Latar: dunia Al-Azhar yang diredupkan */}
              <div className="absolute inset-0 pointer-events-none">
                <img src="/assets/minecraft-world-map.jpg" alt="" className="w-full h-full object-cover object-center scale-110 blur-[2px] brightness-[0.45] saturate-[0.9]" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/85" />
              </div>

              {/* HUD atas */}
              <div className="relative z-10 flex items-center justify-between gap-2 px-2 sm:px-4 pt-[max(0.5rem,env(safe-area-inset-top))] sm:pt-3">
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    onClick={() => navigate(session ? '/dashboard' : '/')}
                    className={`${PX_BTN} ${PX_STONE} w-9 h-9 shrink-0`}
                    title="Keluar dari game"
                    aria-label="Keluar dari game"
                  >
                    <Icon name="chevronLeft" className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setMenuPanel('profile')}
                    className={`${GAME_BOX} min-w-0 flex items-center gap-2 pl-1 pr-2.5 py-1 hover:border-[#5c4a2f] transition text-left`}
                    title="Lihat profil & koleksi wisam"
                  >
                    <span className="relative w-8 h-8 shrink-0 bg-black/60 border border-amber-400/50 flex items-center justify-center text-lg">
                      <EmojiIcon text={rank.badge} className="w-5 h-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] sm:text-xs font-bold text-white truncate max-w-[7.5rem] sm:max-w-[12rem]">{profile?.name || 'Thalib Azhar'}</span>
                      <span className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono font-black text-amber-300">{rank.rankCode}</span>
                        <span className="w-12 sm:w-20 h-1.5 bg-black/80 border border-amber-400/30">
                          <span className="block h-full bg-gradient-to-r from-amber-500 to-emerald-400" style={{ width: `${rankPct}%` }} />
                        </span>
                        <span className="hidden sm:inline text-[9px] font-mono text-emerald-300">{exp} EXP</span>
                      </span>
                    </span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setMenuPanel('quests')}
                    className={`${PX_BTN} ${PX_WOOD} relative h-9 px-2.5 text-xs`}
                    title="Papan target & misi"
                  >
                    <span><PixelIcon name="target" className="w-[1.15em] h-[1.15em]" /></span>
                    <span className="hidden sm:inline">Misi</span>
                    <span className="text-[10px] text-amber-300">{questsDone}/4</span>
                  </button>
                  {canNativeFs && (
                    <button
                      onClick={toggleFullscreen}
                      className={`${PX_BTN} ${isFullscreen ? PX_AMBER : PX_STONE} w-9 h-9`}
                      title={isFullscreen ? 'Keluar Layar Penuh (F)' : 'Layar Penuh (F)'}
                      aria-label="Layar penuh"
                    >
                      <Icon name={isFullscreen ? 'minimize' : 'maximize'} className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={toggleAudio}
                    className={`${PX_BTN} ${audioMuted ? PX_STONE : PX_GREEN} w-9 h-9`}
                    title={audioMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
                    aria-label="Suara"
                  >
                    <PixelIcon name={audioMuted ? 'mute' : 'note'} className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Judul game */}
              <div className="relative z-10 text-center px-4 pt-3 sm:pt-6 shrink-0">
                <div className="inline-block px-2.5 py-0.5 bg-[#3a2614] text-amber-300 border-2 border-t-[#6b4725] border-l-[#6b4725] border-b-[#1f1308] border-r-[#1f1308] shadow-[1px_1px_0_#000] font-mono text-[10px] font-bold uppercase tracking-wider">
                  <PixelIcon name="sword" className="w-[1.15em] h-[1.15em]" /> Arena Imtihan • Muqarrar Al-Azhar
                </div>
                <h2 className="mt-2 text-xl sm:text-3xl font-mono font-black text-white drop-shadow-[2px_2px_0_#000] leading-tight">
                  PILIH MUQARRAR
                </h2>
                <p className="hidden sm:block text-xs text-stone-300 font-mono mt-1">Pilih dunia diktat, jelajahi petanya, dan taklukkan Boss di Kubah Ulama.</p>
              </div>

              {/* Slot dunia: 3 diktat preset. Di HP digeser ke samping. */}
              <div className="relative z-10 flex-1 min-h-0 flex items-center">
                <div className="w-full max-h-full flex gap-3 sm:gap-5 overflow-x-auto sm:overflow-visible snap-x snap-mandatory px-[9vw] sm:px-6 py-3 sm:justify-center [scrollbar-width:none]">
                  {PRESETS.map((preset, i) => {
                    const stageProg = getStageProgress(preset.id);
                    const totalStars = getTotalMuqarrarStars(preset.id);
                    const totalStages = preset.stages?.length || 4;
                    const highest = Math.min(totalStages, stageProg.highestUnlocked || 1);
                    const isAllCleared = stageProg.highestUnlocked >= totalStages && (userProgress?.completedBosses?.[preset.id]);
                    return (
                      <button
                        key={preset.id}
                        onClick={() => openPreset(preset)}
                        className="group snap-center shrink-0 w-[82vw] max-w-[19rem] sm:w-[min(19rem,calc((100vw-5rem)/3))] text-left border-4 border-[#3d3221] bg-[#080d0a]/85 backdrop-blur-md shadow-[0_0_0_2px_#000,0_16px_40px_rgba(0,0,0,0.85)] hover:border-amber-500/70 hover:-translate-y-1 focus-visible:border-amber-400 outline-none transition flex flex-col"
                      >
                        {/* Penjaga dunia */}
                        <div className="relative h-[clamp(7rem,24dvh,12rem)] overflow-hidden border-b-4 border-[#3d3221] bg-gradient-to-b from-[#1b2a20] to-[#0a100c] flex items-end justify-center">
                          <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 70%, ${getFinalBossLook(preset.id).glow}, transparent 70%)` }} />
                          <FinalBossPortrait
                            bossType={preset.id}
                            src={getVoxelSprite(4, preset.id)}
                            alt={preset.bossName}
                            className="relative h-[88%] group-hover:scale-105 transition"
                            imgClassName="h-full object-contain"
                            familiarClassName="-left-[52%] -top-[4%] w-[82%] aspect-square"
                          />
                          <span className="absolute top-2 left-2 font-mono text-[10px] font-black px-2 py-0.5 bg-black/80 border-2 border-amber-400/60 text-amber-300">
                            DUNIA {i + 1}
                          </span>
                          <span className="absolute top-2 right-2 font-mono text-[10px] font-bold px-2 py-0.5 bg-[#2b2413] border-2 border-amber-400 text-amber-300">
                            {preset.bossRankCode || preset.bossRank || `Rank ${preset.bossLv}`}
                          </span>
                        </div>
                        <div className="p-3 sm:p-4 flex-1 flex flex-col gap-1">
                          <div className="font-arabic text-sm text-emerald-300/90 truncate" dir="rtl">{preset.titleArabic}</div>
                          <h3 className="font-mono font-bold text-sm sm:text-base text-white leading-snug line-clamp-2 group-hover:text-amber-200 transition">{preset.title}</h3>
                          <p className="text-[11px] text-white/50 font-mono truncate">{preset.maddah}</p>
                          {/* Progres tahap */}
                          <div className="mt-1.5 flex items-center gap-1">
                            {Array.from({ length: totalStages }).map((_, s) => (
                              <span
                                key={s}
                                className={`flex-1 h-2 border border-black ${s + 1 < highest || isAllCleared ? 'bg-emerald-500' : s + 1 === highest ? 'bg-cyan-400 animate-pulse' : 'bg-white/10'}`}
                              />
                            ))}
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
                            <span className="text-amber-300/90">{isAllCleared ? <span className="inline-flex items-center gap-1"><PixelIcon name="trophy" className="w-3.5 h-3.5" />KHATAM</span> : `Tahap ${stageProg.highestUnlocked}/${totalStages}`}</span>
                            <span className="text-amber-400"><PixelIcon name="star" className="w-[1.15em] h-[1.15em]" /> {totalStars}/{totalStages * 3}</span>
                          </div>
                          <span className={`${PX_BTN} ${PX_GREEN} mt-2 py-2 text-xs`}>
                            {stageProg.highestUnlocked > 1 || totalStars > 0 ? 'LANJUTKAN ▸' : 'MULAI PETUALANGAN ▸'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Kotak dialog bawah: diktat sendiri (member Library ke atas) */}
              <div className={`relative z-10 mx-2 mb-[max(0.5rem,env(safe-area-inset-bottom))] sm:mx-auto sm:mb-4 sm:w-[min(52rem,calc(100%-2rem))] p-2.5 sm:p-4 ${GAME_BOX}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="hidden sm:flex w-11 h-11 shrink-0 border border-amber-400/50 bg-amber-500/15 items-center justify-center overflow-hidden"><img src="/assets/npc-musaid-voxel.png" alt="" className="w-full h-full object-contain" /></div>
                    <p className="text-[11px] sm:text-sm text-white/85 leading-snug">
                      <span className="font-bold text-amber-300">Syaikh: </span>
                      Punya diktat sendiri? Unggah atau tempel catatanmu, akan kuubah jadi dunia battle{isLibraryMember ? ' lengkap dengan cerita AI.' : '.'}
                      {!isLibraryMember && <span className="text-amber-200/80"> (khusus member Library)</span>}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:flex gap-2 shrink-0">
                    <button
                      onClick={() => { if (requireLibraryMember()) fileInputRef.current?.click(); }}
                      disabled={uploadBusy}
                      className={`${PX_BTN} ${PX_GREEN} px-3 py-2 text-xs`}
                      title={isLibraryMember ? 'Upload PDF, Word, atau teks diktatmu' : 'Khusus member paket Library — masuk atau gabung dulu'}
                    >
                      <PixelIcon name={isLibraryMember ? 'chest' : 'crown'} className="w-3.5 h-3.5" />
                      <span>{uploadBusy ? 'Membaca...' : 'Upload Diktat'}</span>
                    </button>
                    <button
                      onClick={() => setMenuPanel('paste')}
                      className={`${PX_BTN} ${PX_WOOD} px-3 py-2 text-xs`}
                    >
                      <span><PixelIcon name="quill" className="w-[1.15em] h-[1.15em]" /></span>
                      <span>Paste Catatan</span>
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.docx,.pptx,.txt,.md,application/pdf"
                    className="hidden"
                  />
                </div>
                {uploadBusy && (
                  <p className="text-[11px] font-mono text-amber-300 mt-2 animate-pulse">Sedang membaca dan mengekstrak materi diktat... mohon tunggu sebentar.</p>
                )}
                {uploadError && (
                  <p className="text-[11px] font-mono text-rose-400 mt-2">{uploadError}</p>
                )}
              </div>

              {/* Panel dalam layar: profil, misi, paste catatan */}
              {menuPanel && (
                <div className="absolute inset-0 z-30 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-6 animate-fadeIn" onClick={() => setMenuPanel(null)}>
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={panelTitle}
                    onClick={(e) => e.stopPropagation()}
                    className={`${GAME_BOX} bg-[#080d0a]/95 w-full sm:w-[min(44rem,100%)] max-h-[85dvh] flex flex-col pb-[env(safe-area-inset-bottom)]`}
                  >
                    <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b-2 border-[#3d3221]">
                      <span className="font-mono text-xs sm:text-sm font-black text-amber-300 tracking-wider inline-flex items-center gap-2"><PixelIcon name={panelIcon} className="w-4 h-4" />{panelTitle}</span>
                      <button
                        onClick={() => setMenuPanel(null)}
                        className={`${PX_BTN} ${PX_STONE} w-8 h-8`}
                        aria-label="Tutup panel"
                      >
                        <PixelIcon name="cross" className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="overflow-y-auto overscroll-contain p-3 sm:p-4 select-text">
                      {menuPanel === 'profile' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3.5">
                            <div className="relative shrink-0">
                              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border-2 border-amber-400/50 flex items-center justify-center text-3xl">
                                <EmojiIcon text={rank.badge} className="w-7 h-7" />
                              </div>
                              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-black/90 border border-amber-400/60 text-[9px] font-mono font-black text-amber-300">
                                {rank.rankCode}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className="text-[10px] font-mono font-bold text-amber-300/90 uppercase tracking-wider">Majlis Thalib Al-Azhar</div>
                              <h3 className="text-base sm:text-lg font-bold text-white truncate">{profile?.name || 'Thalib Azhar'}</h3>
                              <div className="text-xs font-serif text-amber-200/80">{rank.title}</div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[11px] text-white/60 mt-1 font-mono">
                                <span><PixelIcon name="fire" className="w-[1.15em] h-[1.15em]" /> Rekor Hujjah: <strong className="text-amber-300">x{streakRec}</strong></span>
                                <span><PixelIcon name="trophy" className="w-[1.15em] h-[1.15em]" /> Boss Takluk: <strong className="text-emerald-300">{bossesWon}/3</strong></span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono gap-0.5">
                              <span className="text-amber-300 font-semibold">
                                <PixelIcon name="target" className="w-[1.15em] h-[1.15em]" /> {rank.nextExp ? `Butuh ${Math.max(0, rank.nextExp - exp)} EXP lagi menuju ${rank.nextTitle}` : "Maqam Puncak: 'Alim Kabir / Faqih Azhari (Mumtaz)"}
                              </span>
                              <span className="text-white/60">{exp} {rank.nextExp ? `/ ${rank.nextExp} EXP (${rankPct}%)` : 'EXP (Maksimal)'}</span>
                            </div>
                            <div className="w-full h-2.5 bg-black/80 overflow-hidden border border-amber-400/30 p-[1px]">
                              <div className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-emerald-300 transition-all duration-700" style={{ width: `${rankPct}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400/80 mb-2 font-bold"><PixelIcon name="medal" className="w-[1.15em] h-[1.15em]" /> Koleksi Wisam Muqarrar</div>
                            <div className="grid grid-cols-3 gap-2">
                              {PRESETS.map((p) => {
                                const completed = userProgress?.completedBosses?.[p.id];
                                return (
                                  <div
                                    key={p.id}
                                    className={`p-2 border-2 flex flex-col items-center text-center ${completed ? 'border-amber-400/60 bg-gradient-to-b from-amber-500/20 to-black/60' : 'border-white/10 bg-black/40 opacity-50'}`}
                                    title={completed ? `${p.title} (${completed.taqdir})` : `${p.title} (Belum ditaklukkan)`}
                                  >
                                    <PixelIcon name={completed ? 'medal' : 'lock'} className="w-7 h-7 mb-0.5" />
                                    <span className="text-[10px] font-mono font-bold text-white truncate max-w-full">{p.id.split('-')[0].toUpperCase()}</span>
                                    <span className="text-[9px] text-amber-300/80 font-mono">{completed ? completed.stars : 'TERKUNCI'}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {menuPanel === 'quests' && (
                        <div className="space-y-3">
                          <p className="text-[11px] text-white/60 font-mono">Tuntaskan seluruh misi imtihan untuk percepatan kenaikan Rank dan gelar kehormatan. Progres: <strong className="text-amber-300">{questsDone}/4 selesai</strong>.</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {quests.map((q) => (
                              <div key={q.title} className={`p-3 border-2 flex flex-col justify-between ${q.done ? questTone[q.tone] : 'bg-black/50 border-white/10'}`}>
                                <div>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <PixelIcon name={q.icon} className="w-7 h-7" />
                                    <span className={`px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${q.done ? 'bg-black/40 border border-current' : 'bg-white/10 text-white/50'}`}>
                                      {q.done ? <IconText text="✅ SELESAI" iconClassName="w-3.5 h-3.5" /> : q.status}
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-xs sm:text-sm text-white mb-0.5">{q.title}</h4>
                                  <p className="text-[11px] text-white/60 leading-relaxed mb-2">{q.desc}</p>
                                </div>
                                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                                  <span className="text-amber-300 font-semibold">+{q.exp} EXP</span>
                                  <span className="text-white/40">{q.reward}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {menuPanel === 'paste' && (
                        !isLibraryMember ? (
                          <div className="border-2 border-amber-500/25 bg-amber-500/5 p-4 text-center">
                            <div className="text-sm font-semibold text-amber-200 mb-1"><PixelIcon name="lock" className="w-[1.15em] h-[1.15em]" /> Khusus member paket Library</div>
                            <p className="text-xs text-white/60 mb-3">
                              Tiga diktat contoh bebas dimainkan siapa saja. Untuk memakai diktat atau catatanmu sendiri (beserta cerita yang ditulis AI sesuai materinya), masuk dengan akun member Library ke atas.
                            </p>
                            <button
                              onClick={requireLibraryMember}
                              className={`${PX_BTN} ${PX_GREEN} mx-auto px-4 py-2 text-xs`}
                            >
                              {session ? 'Upgrade ke Library' : 'Masuk / Gabung Member'}
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs text-white/60 mb-2">Paste catatan materi sendiri untuk diubah jadi arena battle, lengkap dengan cerita AI sesuai materinya.</p>
                            <textarea
                              value={customText}
                              onChange={(e) => setCustomText(e.target.value)}
                              placeholder="Paste teks diktat di sini (minimal 1-2 paragraf)..."
                              rows={7}
                              className="w-full bg-[#0a0a0c] border-2 border-white/10 p-3 text-base sm:text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 font-mono"
                            />
                            <div className="mt-3 flex justify-end">
                              <button
                                disabled={customText.trim().length < 50}
                                onClick={() => processCustomText('Diktat Catatan Mandiri', customText)}
                                className={`${PX_BTN} ${PX_GREEN} px-4 py-2 text-xs`}
                              >
                                Proses & Buka Ruang Muthola'ah ▸
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* =========================================================================
            FASE PETA: PETA LEVEL — gambar peta jadi latar penuh layar.
            Detail level terpilih tampil sebagai panel samping (desktop) atau bottom sheet (HP), bukan kartu di bawah peta.
            ========================================================================= */}
        {phase === 'map' && (() => {
          const stages = activeSet.stages || [];
          const stageProg = getStageProgress(activeSet.id);
          const highestUnlocked = stageProg.highestUnlocked || 1;
          const totalStars = getTotalMuqarrarStars(activeSet.id);
          const selectedStage = stages.find(s => s.id === selectedStageId) || stages[0] || {};
          const isSelectedUnlocked = selectedStage.id <= highestUnlocked;
          const selectedStars = getStageStars(activeSet.id, selectedStage.id);
          const tactics = getStageTactics(activeSet.id, selectedStage.id);

          // Percentage coordinates aligned with the 3D Minecraft Voxel Overworld Map
          const nodeCoords = [
            { x: 21.5, y: 78 }, // Stage 1 (Bab Al-Ghawri - Gerbang Utama Benteng Voxel)
            { x: 38.5, y: 46 }, // Stage 2 (Ruwaq Al-Magharibah - Bilik Naskah Mashrabiya)
            { x: 69, y: 56 },   // Stage 3 (Shahn Al-Azhar - Pelataran Marmer & Air Mancur)
            { x: 82.5, y: 26 }  // Stage 4 (Kubah Ulama - Final Boss Kubah Emas Voxel)
          ];

          // Ukuran kanvas 16:9 yang menutupi seluruh area peta (seperti object-cover).
          const canvasW = mapViewport ? Math.max(mapViewport.w, Math.ceil(mapViewport.h * 16 / 9)) : null;
          const canvasStyle = canvasW ? { width: canvasW, height: Math.max(mapViewport.h, Math.round(canvasW * 9 / 16)) } : { width: '100%', aspectRatio: '16 / 9' };

          const selectStage = (stage) => {
            setSelectedStageId(stage.id);
            if (stage.id <= highestUnlocked) setActiveStage(stage);
            sfx.playStep();
          };
          const weatherOptions = [
            { id: 'night', icon: 'moon', label: 'Malam Hening', tone: 'bg-[#3a2614] text-amber-300 border-amber-400/60', freq: 520 },
            { id: 'rain', icon: 'rain', label: 'Hujan Kairo', tone: 'bg-[#122838] text-cyan-300 border-cyan-400/60', freq: 440 },
            { id: 'aurora', icon: 'sparkle', label: 'Aurora Ruwaq', tone: 'bg-[#1b3a28] text-emerald-300 border-emerald-400/60', freq: 660 },
          ];
          const nextWeather = weatherOptions[(weatherOptions.findIndex(w => w.id === weatherMode) + 1) % weatherOptions.length];
          const currentWeather = weatherOptions.find(w => w.id === weatherMode) || weatherOptions[0];

          return (
            <div className="relative h-[100dvh] w-full overflow-hidden flex flex-col lg:flex-row bg-[#0c100e] select-none animate-fadeIn">
              {/* ── AREA PETA (latar penuh, bisa digeser) ── */}
              <div className="relative flex-1 min-h-0 min-w-0">
                <div
                  ref={mapScrollRef}
                  onPointerDown={onMapPointerDown}
                  onPointerMove={onMapPointerMove}
                  onPointerUp={onMapPointerUp}
                  onPointerLeave={onMapPointerUp}
                  className="absolute inset-0 overflow-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
                >
                  <div className="relative overflow-hidden" style={canvasStyle}>
                    {/* 3D Minecraft Voxel Overworld Map Render */}
                    <img
                      src="/assets/minecraft-world-map.jpg"
                      alt="Minecraft World Map Al-Azhar"
                      className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.93] contrast-[1.08] select-none pointer-events-none"
                    />
                    {/* Atmospheric Night Vignette & Soft Tint */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none" />

                    {/* Weather & Ambient Particles Effect Layer */}
                    {weatherMode === 'night' && (
                      <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
                        {/* Floating Golden Lantern Embers & Fireflies */}
                        {[
                          { left: '22%', top: '75%', delay: '0s', dur: '4s' },
                          { left: '30%', top: '65%', delay: '1.2s', dur: '5s' },
                          { left: '42%', top: '48%', delay: '0.5s', dur: '4.5s' },
                          { left: '55%', top: '58%', delay: '2.1s', dur: '3.8s' },
                          { left: '68%', top: '54%', delay: '1.8s', dur: '4.2s' },
                          { left: '76%', top: '40%', delay: '0.8s', dur: '5.2s' },
                          { left: '83%', top: '28%', delay: '2.5s', dur: '3.5s' },
                          { left: '50%', top: '35%', delay: '1.5s', dur: '4.8s' },
                          { left: '15%', top: '45%', delay: '0.3s', dur: '4.1s' },
                          { left: '60%', top: '20%', delay: '2.7s', dur: '5.5s' }
                        ].map((p, i) => (
                          <div
                            key={i}
                            style={{
                              left: p.left,
                              top: p.top,
                              animationDelay: p.delay,
                              animationDuration: p.dur
                            }}
                            className="absolute w-1.5 h-1.5 bg-amber-300 border border-black/40 shadow-[0_0_8px_#f59e0b] animate-bounce opacity-80"
                          />
                        ))}
                      </div>
                    )}

                    {weatherMode === 'rain' && (
                      <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
                        {/* Minecraft Rain Streaks */}
                        <div className="absolute inset-0 bg-blue-950/20 backdrop-contrast-125" />
                        <div
                          className="absolute inset-0 opacity-40 animate-pulse"
                          style={{
                            backgroundImage: 'repeating-linear-gradient(105deg, rgba(147,197,253,0.4) 0px, rgba(147,197,253,0.4) 1px, transparent 1px, transparent 14px)',
                            backgroundSize: '100% 100%'
                          }}
                        />
                        {/* Subtle Lightning Flash */}
                        <div className="absolute inset-0 bg-cyan-100/10 pointer-events-none animate-ping opacity-20" />
                      </div>
                    )}

                    {weatherMode === 'aurora' && (
                      <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
                        {/* Ethereal Al-Azhar Emerald Aurora */}
                        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-emerald-500/25 via-teal-400/20 to-transparent blur-xl animate-pulse" />
                        <div className="absolute top-4 right-1/4 w-96 h-32 bg-purple-500/15 blur-2xl animate-pulse" />
                        {/* Starlight Twinkles */}
                        {[
                          { left: '35%', top: '15%' },
                          { left: '65%', top: '12%' },
                          { left: '50%', top: '8%' },
                          { left: '80%', top: '18%' },
                          { left: '20%', top: '22%' }
                        ].map((s, idx) => (
                          <div
                            key={idx}
                            style={{ left: s.left, top: s.top }}
                            className="absolute w-1 h-1 bg-white shadow-[0_0_6px_#fff] animate-ping opacity-75"
                          />
                        ))}
                      </div>
                    )}

                    {/* Minecraft Redstone & Emerald Energy Trail (SVG Overlay) */}
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none z-10"
                      viewBox="0 0 1000 580"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <filter id="trailGlow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="4" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      {/* Dark stone road conduit backing */}
                      <path
                        d="M 215 452 C 275 385, 315 320, 385 267 C 465 210, 565 365, 690 325 C 750 305, 785 220, 825 151"
                        fill="none"
                        stroke="#050a07"
                        strokeWidth="16"
                        strokeLinecap="round"
                        opacity="0.75"
                      />
                      <path
                        d="M 215 452 C 275 385, 315 320, 385 267 C 465 210, 565 365, 690 325 C 750 305, 785 220, 825 151"
                        fill="none"
                        stroke="#14261b"
                        strokeWidth="10"
                        strokeDasharray="14 10"
                        strokeLinecap="round"
                      />

                      {/* UNLOCKED SEGMENT 1 -> 2 (Gerbang to Ruwaq) */}
                      {highestUnlocked >= 2 && (
                        <path
                          d="M 215 452 C 275 385, 315 320, 385 267"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="5"
                          strokeLinecap="round"
                          filter="url(#trailGlow)"
                        />
                      )}
                      {/* UNLOCKED SEGMENT 2 -> 3 (Ruwaq to Shahn) */}
                      {highestUnlocked >= 3 && (
                        <path
                          d="M 385 267 C 465 210, 565 365, 690 325"
                          fill="none"
                          stroke="#34d399"
                          strokeWidth="5"
                          strokeLinecap="round"
                          filter="url(#trailGlow)"
                        />
                      )}
                      {/* UNLOCKED SEGMENT 3 -> 4 (Shahn to Kubah Final Boss) */}
                      {highestUnlocked >= 4 && (
                        <path
                          d="M 690 325 C 750 305, 785 220, 825 151"
                          fill="none"
                          stroke="#fbbf24"
                          strokeWidth="6"
                          strokeLinecap="round"
                          filter="url(#trailGlow)"
                        />
                      )}

                      {/* Active Waypoint Beacon Radiations */}
                      <circle cx="215" cy="452" r="22" fill="#10b981" opacity="0.2" className="animate-ping" />
                      {highestUnlocked >= 2 && <circle cx="385" cy="267" r="22" fill="#34d399" opacity="0.2" className="animate-ping" />}
                      {highestUnlocked >= 3 && <circle cx="690" cy="325" r="24" fill="#34d399" opacity="0.2" className="animate-ping" />}
                      {highestUnlocked >= 4 && <circle cx="825" cy="151" r="28" fill="#fbbf24" opacity="0.25" className="animate-ping" />}
                    </svg>

                    {/* ── INTERACTIVE MINECRAFT MYSTERY CHEST (PETI HIKMAH AL-AZHAR) ── */}
                    <div
                      style={{ left: '53.5%', top: '70%', transform: 'translate(-50%, -50%)' }}
                      className="absolute z-25 flex flex-col items-center"
                    >
                      <button
                        onClick={handleOpenLootChest}
                        className="group relative flex flex-col items-center focus:outline-none transition active:scale-95"
                        title={chestClaimed ? 'Peti Hikmah sudah dibuka hari ini' : 'Buka Peti Hikmah & Hadiah Harian!'}
                      >
                        {/* Floating Chest Banner */}
                        <div className={`mb-1 px-2.5 py-1 border-2 text-[9px] sm:text-[10px] font-mono font-bold shadow-[2px_2px_0_#000] flex items-center gap-1.5 whitespace-nowrap transition-all ${
                          chestClaimed
                            ? 'bg-[#1c1c22] border-stone-600 text-stone-400'
                            : 'bg-[#2b2413] border-amber-400 text-amber-300 animate-bounce'
                        }`}>
                          <PixelIcon name={chestClaimed ? 'chest' : 'gift'} className="w-[1.15em] h-[1.15em]" />
                          <span className="drop-shadow-[1px_1px_0_#000]">{chestClaimed ? 'Peti Terbuka' : 'Peti Hikmah Azhar!'}</span>
                        </div>

                        {/* 3D Minecraft Chest Block */}
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 border-2 border-t-[#c68940] border-l-[#c68940] border-b-[#4a2e12] border-r-[#4a2e12] bg-[#875525] shadow-[3px_3px_0_#000] relative flex items-center justify-center transition-all ${
                          chestClaimed ? 'brightness-75' : 'group-hover:brightness-120 group-hover:scale-105'
                        }`}>
                          {/* Chest Latch (Iron / Gold Lock) */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3.5 bg-[#e2e8f0] border border-black shadow-[1px_1px_0_#000] flex items-center justify-center z-10">
                            <div className="w-1.5 h-1.5 bg-black" />
                          </div>
                          {/* Top lid rim */}
                          <div className="absolute top-2 inset-x-0 h-0.5 bg-[#3a200e]" />
                          {/* Side borders */}
                          <div className="absolute inset-0 border border-black/30 pointer-events-none" />

                          {/* Sparkling Ping Glow if Unclaimed */}
                          {!chestClaimed && (
                            <div className="absolute -inset-2 bg-amber-400/30 blur-sm rounded-full animate-ping pointer-events-none opacity-80" />
                          )}
                        </div>
                      </button>
                    </div>

                    {/* ── SMOOTH GLIDING THALIB AZHAR AVATAR ON THE OVERWORLD MAP ── */}
                    {selectedStage && (
                      <div
                        data-map-focus
                        style={{
                          left: `${nodeCoords[selectedStage.id - 1]?.x || 21.5}%`,
                          top: `${nodeCoords[selectedStage.id - 1]?.y || 78}%`,
                          transform: 'translate(-50%, -130%)',
                          transition: 'all 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                        className="absolute z-35 pointer-events-none flex flex-col items-center"
                      >
                        {/* Dual Iron Chains */}
                        <div className="flex gap-4 -mb-1">
                          <div className="w-1 h-2.5 bg-stone-400 border border-black shadow" />
                          <div className="w-1 h-2.5 bg-stone-400 border border-black shadow" />
                        </div>
                        {/* Oak Wood Hanging Sign */}
                        <div className="px-2.5 py-1 bg-[#784d28] text-[#fff7d6] text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-wider shadow-[3px_3px_0_#000] flex items-center gap-1.5 border-2 border-t-[#ba7e44] border-l-[#ba7e44] border-b-[#3d2411] border-r-[#3d2411] animate-bounce">
                          <PixelIcon name="scroll" className="w-4 h-4" />
                          <span className="drop-shadow-[1px_1px_0_#000]">KAMU DI SINI</span>
                        </div>
                        {/* Wooden Arrow Tip */}
                        <div className="w-3 h-3 bg-[#784d28] border-r-2 border-b-2 border-[#3d2411] rotate-45 -mt-1.5 shadow mb-1" />

                        {/* 3D Voxel Mini Character Sprite Walking */}
                        <div className="relative">
                          <img
                            src="/assets/thalib-voxel-facing-right.png"
                            alt="Thalib Voxel Pin"
                            className="w-11 sm:w-14 h-auto object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] animate-playerIdle"
                          />
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/75 rounded-full blur-[2px]" />
                        </div>
                      </div>
                    )}

                    {/* ── 4 TACTILE STAGE WAYPOINT NODE BUTTONS (REACT OVERLAY) ── */}
                    {stages.map((stage, idx) => {
                      const coords = nodeCoords[idx] || { x: 20 + idx * 22, y: 50 };
                      const isUnlocked = stage.id <= highestUnlocked;
                      const stars = getStageStars(activeSet.id, stage.id);
                      const isCleared = stars > 0;
                      const isCurrent = stage.id === highestUnlocked;
                      const isSelected = selectedStage.id === stage.id;
                      const isFinal = stage.isFinal;

                      return (
                        <div
                          key={stage.id}
                          style={{
                            left: `${coords.x}%`,
                            top: `${coords.y}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                          className="absolute z-20 flex flex-col items-center"
                        >
                          {/* Minecraft Block Pedestal / Shrine Button */}
                          <button
                            onClick={() => {
                              setSelectedStageId(stage.id);
                              if (isUnlocked) setActiveStage(stage);
                              sfx.playStep();
                            }}
                            className={`group relative transition-all duration-300 flex items-center justify-center ${
                              isFinal
                                ? 'w-[4.5rem] h-[4.5rem] sm:w-24 sm:h-24'
                                : 'w-[3.75rem] h-[3.75rem] sm:w-20 sm:h-20'
                            } ${
                              isSelected
                                ? 'scale-115 ring-4 ring-amber-300 shadow-[0_0_35px_rgba(251,191,36,0.85)] z-20'
                                : 'hover:scale-105'
                            } ${
                              !isUnlocked
                                ? 'bg-[#151518] border-t-2 border-l-2 border-[#3c3c42] border-b-4 border-r-4 border-black opacity-75 shadow-inner'
                                : isFinal
                                ? 'bg-gradient-to-b from-[#eab308] via-[#ca8a04] to-[#713f12] border-t-2 border-l-2 border-[#fef08a] border-b-4 border-r-4 border-[#3f2005] shadow-[0_0_30px_rgba(234,179,8,0.7)]'
                                : isCleared
                                ? 'bg-gradient-to-b from-[#15803d] via-[#166534] to-[#052e16] border-t-2 border-l-2 border-[#4ade80] border-b-4 border-r-4 border-[#021b0b] shadow-[0_0_25px_rgba(34,197,94,0.5)]'
                                : 'bg-gradient-to-b from-[#1d4ed8] via-[#1e40af] to-[#0f172a] border-t-2 border-l-2 border-[#60a5fa] border-b-4 border-r-4 border-[#080d1a] shadow-[0_0_25px_rgba(59,130,246,0.6)] animate-pulse'
                            }`}
                            style={{
                              boxShadow: isSelected
                                ? '0 0 35px rgba(251,191,36,0.85), inset 2px 2px 0 rgba(255,255,255,0.4), inset -2px -2px 0 rgba(0,0,0,0.5)'
                                : 'inset 2px 2px 0 rgba(255,255,255,0.25), inset -2px -2px 0 rgba(0,0,0,0.5)'
                            }}
                          >
                            {/* Inner Voxel Character or Lock */}
                            <div className="flex flex-col items-center justify-center w-full h-full p-1 sm:p-1.5 overflow-hidden">
                              {!isUnlocked ? (
                                <span className="text-xl sm:text-2xl filter grayscale opacity-75"><PixelIcon name="lock" className="w-[1.15em] h-[1.15em]" /></span>
                              ) : isFinal ? (
                                <div className="relative w-full h-full flex flex-col items-center justify-center">
                                  <span className="absolute -top-3 sm:-top-4 text-xs sm:text-base animate-bounce z-10 filter drop-shadow"><PixelIcon name="crown" className="w-[1.15em] h-[1.15em]" /></span>
                                  <FinalBossPortrait
                                    bossType={activeSet.id}
                                    src={getVoxelSprite(stage.id, activeSet.id)}
                                    alt={stage.guardianName || 'Final Boss'}
                                    className="w-11 h-11 sm:w-16 sm:h-16 scale-110"
                                    imgClassName="w-full h-full object-contain"
                                    familiarClassName="-left-[40%] -top-[10%] w-[60%] aspect-square"
                                  />
                                </div>
                              ) : (
                                <img
                                  src={getVoxelSprite(stage.id, activeSet.id)}
                                  alt={stage.guardianName || `Level ${stage.levelNumber}`}
                                  className="w-10 h-10 sm:w-14 sm:h-14 object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]"
                                />
                              )}
                            </div>

                            {/* Star Badges for Cleared Stages */}
                            {isCleared && (
                              <div className="absolute -bottom-2.5 px-2 py-0.5 bg-[#121214] border-2 border-t-stone-600 border-l-stone-600 border-b-black border-r-black text-[8px] sm:text-[10px] font-mono text-amber-300 shadow-[2px_2px_0_#000] flex items-center gap-0.5 z-10">
                                <span className="inline-flex gap-px">{Array.from({ length: stars }, (_, i) => <PixelIcon key={i} name="star" className="w-3 h-3" />)}</span>
                              </div>
                            )}

                            {/* Cleared Checkmark Ribbon */}
                            {isCleared && (
                              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 text-black border-2 border-black font-black text-[10px] sm:text-xs flex items-center justify-center shadow-[1px_1px_0_#000] z-10">
                                ✓
                              </span>
                            )}

                            {/* Pulsing Beacon Ring for Current Stage */}
                            {isCurrent && !isCleared && (
                              <div className="absolute -inset-1.5 border-2 border-cyan-400 animate-ping pointer-events-none opacity-60" />
                            )}
                          </button>

                          {/* Minecraft Plaque Nameplate */}
                          <div className="mt-2 text-center pointer-events-none">
                            <div className={`text-[10px] sm:text-xs font-mono font-bold tracking-tight whitespace-nowrap px-2.5 py-1 border-2 shadow-[2px_2px_0_#000] ${
                              isSelected
                                ? 'bg-[#2b2413] border-amber-400 text-amber-300 font-black'
                                : isUnlocked
                                ? 'bg-[#18181c] border-stone-600 text-white'
                                : 'bg-[#101012] border-stone-800 text-white/40'
                            }`}>
                              {isFinal ? <span className="inline-flex items-center gap-1"><PixelIcon name="crown" className="w-3.5 h-3.5" />FINAL BOSS</span> : `LEVEL ${stage.levelNumber}`}
                            </div>
                            <div className="text-[9px] font-mono font-bold text-amber-300 drop-shadow-[1px_1px_0_#000] mt-0.5 hidden sm:block truncate max-w-[120px]">
                              {stage.guardianRankCode || `Rank ${stage.guardianRank}`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* HUD atas peta */}
                <div className="absolute inset-x-0 top-0 z-40 pointer-events-none bg-gradient-to-b from-black/70 to-transparent px-2 sm:px-3 pt-[max(0.5rem,env(safe-area-inset-top))] sm:pt-3 pb-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 pointer-events-auto">
                      <button
                        onClick={() => setPhase('select')}
                        className={`${PX_BTN} ${PX_WOOD} h-9 px-2.5 text-xs shrink-0`}
                        title="Ganti Muqarrar / Kembali ke Menu Diktat"
                      >
                        <Icon name="chevronLeft" className="w-4 h-4" />
                        <span className="hidden sm:inline">Ganti Muqarrar</span>
                      </button>
                      <div className={`${GAME_BOX} min-w-0 px-2.5 py-1`}>
                        <div className="text-[9px] sm:text-[10px] font-mono font-bold text-emerald-400 truncate"><PixelIcon name="map" className="w-[1.15em] h-[1.15em]" /> {activeSet.maddah}</div>
                        <div className="text-[11px] sm:text-sm font-mono font-bold text-white truncate max-w-[9rem] sm:max-w-[18rem]">{activeSet.title}</div>
                      </div>
                      <div className={`${GAME_BOX} hidden sm:flex lg:hidden xl:flex flex-col items-center px-2.5 py-1 shrink-0`}>
                        <span className="text-[11px] font-mono font-black text-amber-300"><PixelIcon name="star" className="w-[1.15em] h-[1.15em]" /> {totalStars}/{stages.length * 3}</span>
                        <span className="text-[9px] font-mono text-emerald-300">TAHAP {highestUnlocked}/{stages.length}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 pointer-events-auto">
                      {/* Cuaca: satu tombol putar di HP, tiga pilihan di layar lebar */}
                      <button
                        onClick={() => { setWeatherMode(nextWeather.id); sfx.playBip(nextWeather.freq); }}
                        className={`${PX_BTN} ${PX_STONE} sm:!hidden w-9 h-9 text-base`}
                        title={`Cuaca: ${currentWeather.label} (ketuk untuk ganti)`}
                        aria-label="Ganti cuaca"
                      >
                        <PixelIcon name={currentWeather.icon} className="w-5 h-5" />
                      </button>
                      <div className="hidden sm:flex items-center gap-1 bg-[#141418]/90 border-2 border-t-[#3f3f46] border-l-[#3f3f46] border-b-[#000] border-r-[#000] p-1 shadow-[2px_2px_0_#000]">
                        {weatherOptions.map(w => (
                          <button
                            key={w.id}
                            onClick={() => { setWeatherMode(w.id); sfx.playBip(w.freq); }}
                            className={`px-2 py-1 text-[10px] font-mono font-bold border transition flex items-center gap-1 ${weatherMode === w.id ? `${w.tone} shadow-[1px_1px_0_#000]` : 'border-transparent text-stone-400 hover:text-white'}`}
                            title={w.label}
                          >
                            <PixelIcon name={w.icon} className="w-4 h-4" />
                            <span className="hidden xl:inline">{w.label}</span>
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setPhase('study')}
                        className={`${PX_BTN} ${PX_GREEN} h-9 px-2.5 text-xs`}
                        title="Buka Ruang Muthola'ah untuk membaca ringkasan materi & flashcard"
                      >
                        <PixelIcon name="book" className="w-4 h-4" />
                        <span className="hidden md:inline lg:hidden xl:inline">Muthola'ah</span>
                      </button>
                      {canNativeFs && (
                        <button
                          onClick={toggleFullscreen}
                          className={`${PX_BTN} ${isFullscreen ? PX_AMBER : PX_STONE} w-9 h-9`}
                          title={isFullscreen ? 'Keluar Layar Penuh (F)' : 'Layar Penuh (F)'}
                          aria-label="Layar penuh"
                        >
                          <Icon name={isFullscreen ? 'minimize' : 'maximize'} className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={toggleAudio}
                        className={`${PX_BTN} ${audioMuted ? PX_STONE : PX_GREEN} w-9 h-9`}
                        title={audioMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
                        aria-label="Suara"
                      >
                        <PixelIcon name={audioMuted ? 'mute' : 'note'} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chest Notification Toast */}
                {chestToast && (
                  <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 max-w-md w-[92%] bg-[#1a140c] border-2 border-amber-400 p-2.5 shadow-[4px_4px_0_#000] text-amber-200 font-mono text-xs text-center animate-fadeIn">
                    <div className="flex items-center justify-center gap-1.5 font-bold mb-0.5 text-amber-300">
                      <span><PixelIcon name="chest" className="w-[1.15em] h-[1.15em]" /></span>
                      <span>PETI HIKMAH AL-AZHAR</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">{chestToast}</p>
                  </div>
                )}

                <div className="hidden lg:block absolute bottom-3 left-3 z-30 pointer-events-none text-[10px] font-mono font-bold text-white/80 bg-[#1c1c1f]/90 px-2.5 py-1 border-2 border-t-[#3a3a3e] border-l-[#3a3a3e] border-b-[#0d0d0e] border-r-[#0d0d0e] shadow-[2px_2px_0_#000]">
                  [ <PixelIcon name="sword" className="w-3.5 h-3.5 inline-block align-[-2px]" /> KLIK SIMPUL LEVEL • SERET UNTUK MENGGESER PETA ]
                </div>
              </div>

              {/* ── INSPEKTUR LEVEL: panel samping (desktop) / bottom sheet (HP) ── */}
              <div className={`relative z-40 shrink-0 flex flex-col lg:w-[22rem] lg:h-full max-h-[62dvh] lg:max-h-none -mt-3 lg:mt-0 lg:border-l-4 border-t-4 lg:border-t-0 border-[#3d3221] bg-[#080d0a]/95 backdrop-blur-md shadow-[0_-12px_30px_rgba(0,0,0,0.7)] lg:shadow-[-12px_0_30px_rgba(0,0,0,0.7)] pb-[env(safe-area-inset-bottom)]`}>
                {/* Pegangan sheet (HP) */}
                <button
                  onClick={() => setSheetOpen(o => !o)}
                  className="lg:hidden w-full pt-1.5 pb-1 flex flex-col items-center gap-0.5 text-[9px] font-mono text-white/50"
                  aria-expanded={sheetOpen}
                  aria-label={sheetOpen ? 'Ciutkan detail level' : 'Lihat detail level'}
                >
                  <span className="w-10 h-1 bg-white/30" />
                </button>

                {/* Pilihan level — semua level bisa dijangkau tanpa menggeser peta */}
                <div className="px-3 lg:pt-3 grid grid-cols-4 gap-1.5 shrink-0">
                  {stages.map((stage) => {
                    const unlocked = stage.id <= highestUnlocked;
                    const stars = getStageStars(activeSet.id, stage.id);
                    const active = stage.id === selectedStage.id;
                    return (
                      <button
                        key={stage.id}
                        onClick={() => selectStage(stage)}
                        className={`py-1 border-2 font-mono text-[10px] font-bold flex flex-col items-center leading-tight transition ${
                          active
                            ? 'bg-[#2b2413] border-amber-400 text-amber-300'
                            : unlocked
                            ? 'bg-[#18181c] border-stone-600 text-white hover:border-stone-400'
                            : 'bg-[#101012] border-stone-800 text-white/40'
                        }`}
                      >
                        <span className="inline-flex items-center justify-center">{!unlocked ? <PixelIcon name="lock" className="w-3.5 h-3.5" /> : stage.isFinal ? <PixelIcon name="crown" className="w-4 h-4" /> : `LV ${stage.levelNumber}`}</span>
                        <span className="text-[8px] text-amber-300/90">{stars > 0 ? <span className="inline-flex gap-px">{Array.from({ length: stars }, (_, i) => <PixelIcon key={i} name="star" className="w-2.5 h-2.5" />)}</span> : stage.isFinal ? 'BOSS' : '—'}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 pt-2.5">
                  {/* Profil penjaga */}
                  <div className="flex items-start gap-3">
                    <div className={`w-16 h-16 lg:w-20 lg:h-20 shrink-0 p-1 shadow-[2px_2px_0_#000] ${
                      selectedStage.isFinal
                        ? 'border-4 border-t-[#d97706] border-l-[#d97706] border-b-[#451a03] border-r-[#451a03] bg-[#2e1d0e]'
                        : isSelectedUnlocked
                        ? 'border-4 border-t-[#8c643b] border-l-[#8c643b] border-b-[#2b1c0e] border-r-[#2b1c0e] bg-[#22170c]'
                        : 'border-4 border-t-[#3f3f46] border-l-[#3f3f46] border-b-[#18181b] border-r-[#18181b] bg-[#141416] grayscale opacity-60'
                    }`}>
                      <div className="w-full h-full bg-[#181008]/80 flex items-center justify-center">
                        {isSelectedUnlocked ? (
                          selectedStage.isFinal ? (
                            <FinalBossPortrait
                              bossType={activeSet.id}
                              src={getVoxelSprite(selectedStage.id, activeSet.id)}
                              alt={selectedStage.guardianName || 'Final Boss'}
                              className="w-full h-full"
                              imgClassName="w-full h-full object-contain"
                              familiarClassName="-left-[10%] top-0 w-[50%] aspect-square"
                            />
                          ) : (
                            <img
                              src={getVoxelSprite(selectedStage.id, activeSet.id)}
                              alt={selectedStage.guardianName || 'Guardian Voxel'}
                              className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]"
                            />
                          )
                        ) : (
                          <span className="text-2xl grayscale opacity-60"><PixelIcon name="lock" className="w-[1.15em] h-[1.15em]" /></span>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase border-2 ${
                          selectedStage.isFinal
                            ? 'bg-[#451a03] text-amber-300 border-[#d97706]'
                            : isSelectedUnlocked
                            ? 'bg-[#0f2e1b] text-emerald-300 border-[#22c55e]'
                            : 'bg-[#18181b] text-white/40 border-stone-700'
                        }`}>
                          {selectedStage.isFinal ? <span className="inline-flex items-center gap-1"><PixelIcon name="crown" className="w-3.5 h-3.5" />FINAL BOSS</span> : `LEVEL ${selectedStage.levelNumber}`}
                        </span>
                        <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[#2b2413] border-2 border-amber-400 text-amber-300 font-bold truncate max-w-[9rem]">
                          {selectedStage.guardianRankCode || selectedStage.guardianRank}
                        </span>
                        {selectedStars > 0 && (
                          <span className="text-[9px] font-mono font-bold text-amber-300"><PixelIcon name="star" className="w-[1.15em] h-[1.15em]" /> {selectedStars}/3</span>
                        )}
                      </div>
                      <h3 className="mt-1 text-sm lg:text-base font-bold text-white font-mono leading-snug line-clamp-2">{selectedStage.title}</h3>
                      {selectedStage.guardianName && (
                        <div className="text-[11px] font-mono text-emerald-300/90 truncate">Penjaga: {selectedStage.guardianName}</div>
                      )}
                      <div className="text-[10px] text-white/60 font-mono truncate"><PixelIcon name="pin" className="w-[1.15em] h-[1.15em]" /> {selectedStage.location}</div>
                    </div>
                  </div>

                  {/* Parameter battle */}
                  <div className="mt-2.5 grid grid-cols-3 gap-1.5 font-mono text-center">
                    <div className="py-1 bg-[#141418] border-2 border-[#2b2b32]">
                      <div className="text-[8px] text-white/50 uppercase">Boss HP</div>
                      <div className="text-xs font-bold text-rose-400">{selectedStage.bossHp} HP</div>
                    </div>
                    <div className="py-1 bg-[#141418] border-2 border-[#2b2b32]">
                      <div className="text-[8px] text-white/50 uppercase">Soal Uji</div>
                      <div className="text-xs font-bold text-white">{selectedStage.quizIndices?.length || 2} Soal</div>
                    </div>
                    <div className="py-1 bg-[#141418] border-2 border-[#2b2b32]">
                      <div className="text-[8px] text-white/50 uppercase">Hadiah</div>
                      <div className="text-xs font-bold text-amber-300">+{selectedStage.expReward} EXP</div>
                    </div>
                  </div>

                  {/* Misi level ini (✅ = pernah dituntaskan) */}
                  <div className="mt-2 flex flex-wrap gap-1.5 font-mono">
                    {getStageMissions(selectedStage, selectedStage.quizIndices?.length || 2).map(id => {
                      const doneBefore = (userProgress?.stageProgress?.[activeSet.id]?.missions?.[selectedStage.id] || []).includes(id);
                      return (
                        <span
                          key={id}
                          title={MISSION_DEFS[id].desc}
                          className={`text-[10px] px-2 py-1 border-2 ${doneBefore ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-200' : 'border-[#2b2b32] bg-[#141418] text-stone-300'}`}
                        >
                          <PixelIcon name={doneBefore ? 'check' : MISSION_DEFS[id].icon} className="w-3.5 h-3.5 inline-block align-[-2px] mr-1" />{MISSION_DEFS[id].label}
                        </span>
                      );
                    })}
                  </div>

                  {/* Detail tambahan: selalu tampil di desktop, di HP saat sheet dibuka */}
                  <div className={`${sheetOpen ? '' : 'max-lg:!hidden'} mt-2.5 space-y-2 font-mono text-[11px]`}>
                    {selectedStage.titleArabic && (
                      <div className="font-arabic text-sm text-emerald-300/90" dir="rtl">{selectedStage.titleArabic}</div>
                    )}
                    <div className="p-2.5 bg-[#121216] border-2 border-[#2b2b34]">
                      <div className="text-[10px] text-amber-400 font-bold uppercase mb-0.5"><PixelIcon name="target" className="w-[1.15em] h-[1.15em]" /> Kelemahan Kunci</div>
                      <p className="text-stone-300 leading-relaxed">{tactics.weakness}</p>
                    </div>
                    <div className="p-2.5 bg-[#121216] border-2 border-[#2b2b34]">
                      <div className="text-[10px] text-rose-400 font-bold uppercase mb-0.5"><PixelIcon name="warning" className="w-[1.15em] h-[1.15em]" /> Tingkat Bahaya Syubhat</div>
                      <p className="text-stone-300 leading-relaxed">{tactics.danger}</p>
                      <div className="mt-1.5 pt-1.5 border-t border-stone-800 text-[10px] text-emerald-400 flex items-center justify-between gap-2">
                        <span><PixelIcon name="bulb" className="w-[1.15em] h-[1.15em]" /> Saran Item:</span>
                        <span className="font-bold text-white bg-black/60 px-1.5 py-0.5 border border-stone-700 truncate">{tactics.recItem}</span>
                      </div>
                    </div>
                    {selectedStage.lore && (
                      <p className="text-stone-400 leading-relaxed">
                        <span className="font-bold text-amber-300 mr-1.5">Misi Imtihan:</span>
                        {selectedStage.lore}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSheetOpen(o => !o)}
                    className="lg:hidden mt-1.5 w-full text-center text-[10px] font-mono text-amber-300/80 py-1"
                  >
                    {sheetOpen ? '▾ Ciutkan detail' : '▴ Intel taktik & misi'}
                  </button>
                </div>

                {/* Aksi */}
                <div className="shrink-0 px-3 pt-2 pb-2.5 border-t-2 border-[#3d3221] space-y-1.5">
                  {isSelectedUnlocked ? (
                    <>
                      <button
                        onClick={() => launchStage(selectedStage, false)}
                        className={`${PX_BTN} ${PX_GREEN} w-full py-2.5 text-xs sm:text-sm font-black`}
                      >
                        <PixelIcon name="sword" className="w-4 h-4" />
                        <span>MULAI LEVEL INI</span>
                      </button>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => launchStage(selectedStage, true)}
                          className={`${PX_BTN} ${PX_WOOD} py-2 text-[11px]`}
                        >
                          <span><PixelIcon name="scroll" className="w-[1.15em] h-[1.15em]" /></span>
                          <span>Prolog</span>
                        </button>
                        <button
                          onClick={() => generateAiStory(baseSet)}
                          disabled={storyBusy}
                          title={isLibraryMember ? 'AI menulis ulang prolog & cerita tiap level sesuai materi ini' : 'Khusus member paket Library'}
                          className={`${PX_BTN} ${PX_VIOLET} py-2 text-[11px]`}
                        >
                          <PixelIcon name={storyBusy ? 'hourglass' : isLibraryMember ? 'sparkle' : 'lock'} className="w-[1.15em] h-[1.15em]" />
                          <span className="truncate">{storyBusy ? 'Menulis...' : activeSet?.prologue?.aiGenerated ? 'Cerita AI Baru' : 'Cerita AI'}</span>
                        </button>
                      </div>
                      {(storyNotice || (activeSet?.prologue?.aiGenerated && !storyBusy)) && (
                        <div className="flex items-start justify-between gap-2">
                          {storyNotice ? <p className="text-[10px] font-mono text-violet-200/80 leading-snug">{storyNotice}</p> : <span />}
                          {activeSet?.prologue?.aiGenerated && !storyBusy && (
                            <button
                              onClick={resetAiStory}
                              className="shrink-0 text-[10px] font-mono text-white/45 hover:text-white/80 underline underline-offset-2"
                            >
                              Kembalikan cerita bawaan
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="px-3 py-2.5 border-2 border-t-[#000] border-l-[#000] border-b-[#3f3f46] border-r-[#3f3f46] bg-[#141418] text-white/50 text-xs font-mono text-center">
                      <PixelIcon name="lock" className="w-[1.15em] h-[1.15em]" /> Terkunci — Selesaikan Level {selectedStage.id - 1}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* =========================================================================
            FASE 1: RUANG MUTHOLA'AH (Belajar Dulu Sebelum Ujian)
            ========================================================================= */}
        {phase === 'study' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Fase */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-emerald-500/20 bg-[#111412]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-semibold">
                    FASE 1: MUTHOLA'AH
                  </span>
                  <span className="text-xs text-white/40">• Wajib Dipelajari Sebelum Ujian</span>
                </div>
                <h2 className="text-xl font-bold text-white">{activeSet.title}</h2>
                <p className="text-xs text-white/60 mt-0.5">
                  Pelajari poin inti, mufradat, dan balik kartu hafalan. Saat kamu sudah mantap, buka peta dan pilih level!
                </p>
              </div>

              <button
                onClick={() => setPhase('map')}
                className="btn bg-gradient-to-r from-amber-500 to-emerald-500 text-black font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-2"
              >
                <span><PixelIcon name="map" className="w-[1.15em] h-[1.15em]" /></span>
                <span>Peta & Pilih Level ➔</span>
              </button>
            </div>

            {/* Sub-tabs Muthola'ah */}
            <div className="flex border-b border-white/10 gap-1 sm:gap-2">
              <button
                onClick={() => setStudyTab('summary')}
                className={`flex-1 sm:flex-none min-w-0 pb-3 px-1.5 sm:px-3 text-xs sm:text-sm font-medium border-b-2 transition flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 ${
                  studyTab === 'summary' ? 'border-emerald-400 text-emerald-300' : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <PixelIcon name="book" className="w-4 h-4" />
                <span>Khulashah Matan (Poin Inti)</span>
              </button>
              <button
                onClick={() => setStudyTab('terms')}
                className={`flex-1 sm:flex-none min-w-0 pb-3 px-1.5 sm:px-3 text-xs sm:text-sm font-medium border-b-2 transition flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 ${
                  studyTab === 'terms' ? 'border-emerald-400 text-emerald-300' : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <PixelIcon name="quill" className="w-4 h-4" />
                <span>Mufradat & Ta'rif</span>
              </button>
              <button
                onClick={() => setStudyTab('cards')}
                className={`flex-1 sm:flex-none min-w-0 pb-3 px-1.5 sm:px-3 text-xs sm:text-sm font-medium border-b-2 transition flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 ${
                  studyTab === 'cards' ? 'border-emerald-400 text-emerald-300' : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <PixelIcon name="map" className="w-4 h-4" />
                <span>Kartu Hafalan (Flashcard)</span>
              </button>
            </div>

            {/* TAB 1: KHULASHAH MATAN */}
            {studyTab === 'summary' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSet.summary.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-white/10 bg-[#131316] p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-emerald-400">Poin {idx + 1}</span>
                      {item.arabic && <span className="font-arabic text-base sm:text-lg text-emerald-300/90 font-semibold" dir="rtl">{item.arabic}</span>}
                    </div>
                    <h3 className="text-base font-semibold text-white">{item.heading}</h3>
                    <p className="text-xs sm:text-sm text-white/75 leading-relaxed whitespace-pre-line">
                      <SmartText text={item.body} />
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: MUFRADAT & TA'RIF */}
            {studyTab === 'terms' && (
              <div className="rounded-xl border border-white/10 bg-[#131316] divide-y divide-white/10">
                {activeSet.terms.map((t, idx) => (
                  <div key={idx} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                    <div className="font-arabic text-lg sm:text-xl text-emerald-300 font-bold" dir="rtl">
                      {t.term}
                    </div>
                    <div className="text-xs sm:text-sm text-white/85 max-w-xl text-left">
                      <SmartText text={t.def} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: FLASHCARD INTERAKTIF */}
            {studyTab === 'cards' && (
              <div className="max-w-lg mx-auto space-y-4">
                <div
                  onClick={() => setCardFlipped(!cardFlipped)}
                  className="cursor-pointer min-h-[220px] rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-b from-[#161a18] to-[#111312] p-8 flex flex-col items-center justify-center text-center shadow-xl hover:border-emerald-500/60 transition transform active:scale-[0.99]"
                >
                  <span className="font-mono text-xs text-emerald-400 mb-3">
                    Kartu {cardIndex + 1} dari {activeSet.flashcards.length} • Klik untuk Membalik
                  </span>
                  {!cardFlipped ? (
                    <div>
                      <span className="text-xs text-white/40 uppercase tracking-widest block mb-2 font-mono">Pertanyaan</span>
                      <h4 className="text-lg sm:text-xl font-semibold text-white leading-snug">
                        <SmartText text={activeSet.flashcards[cardIndex].q} />
                      </h4>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs text-emerald-400 uppercase tracking-widest block mb-2 font-mono">Jawaban / Kaidah</span>
                      <p className="text-sm sm:text-base text-white/90 leading-relaxed font-medium">
                        <SmartText text={activeSet.flashcards[cardIndex].a} />
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    disabled={cardIndex === 0}
                    onClick={() => { setCardIndex(c => c - 1); setCardFlipped(false); sfx.playBip(440); }}
                    className="btn border border-white/10 bg-white/5 disabled:opacity-30 text-white text-xs px-4 py-2 rounded-lg"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-xs text-white/40 font-mono">
                    {cardIndex + 1} / {activeSet.flashcards.length}
                  </span>
                  <button
                    disabled={cardIndex >= activeSet.flashcards.length - 1}
                    onClick={() => { setCardIndex(c => c + 1); setCardFlipped(false); sfx.playBip(480); }}
                    className="btn border border-white/10 bg-white/5 disabled:opacity-30 text-white text-xs px-4 py-2 rounded-lg"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Call to Map */}
            <div className="pt-6 text-center">
              <button
                onClick={() => setPhase('map')}
                className="btn bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-400 text-black font-extrabold text-base px-8 py-3.5 rounded-xl shadow-xl shadow-emerald-500/25 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 mx-auto"
              >
                <span><PixelIcon name="map" className="w-[1.15em] h-[1.15em]" /></span>
                <span>SAYA SUDAH FAHAM — BUKA PETA & PILIH LEVEL ➔</span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            FASE 1.5: HIKAYAT PROLOG CERITA (Visual Novel RPG Cutscene)
            ========================================================================= */}
        {phase === 'story' && (() => {
          const prologue = activeSet?.prologue || {
            chapter: 'HIKAYAT MUQARRAR',
            title: activeSet?.title || 'Ujian Imtihan Al-Azhar',
            titleArabic: activeSet?.titleArabic || 'امْتِحَانُ الْمُقَرَّرَاتِ',
            location: 'Ruwaq Muthola\'ah Al-Azhar • Kairo',
            epigraph: '«مَن قَيَّدَ الْعِلْمَ بِالْكِتَابَةِ، نَالَ بِهِ شَرَفَ الْإِجَابَةِ»',
            epigraphMeaning: 'Barangsiapa mengikat ilmu dengan tulisan dan muthola\'ah, ia meraih kemuliaan dalam menjawab ujian.',
            dialogues: [
              {
                speaker: 'Narator',
                avatar: '📜',
                role: 'Ruwaq Muthola\'ah',
                text: `Di hadapanmu terbentang lembaran ujian muqarrar "${activeSet?.title}". Setiap bait dan kaidah bersiap menguji ketajaman muthola'ahmu.`
              },
              {
                speaker: 'Thalib Azhar',
                avatar: '🎓',
                role: 'Pena di Tangan',
                text: 'Dengan memohon taufiq kepada Allah dan bekal belajarku, aku siap menghadapi imtihan ini!'
              },
              {
                speaker: activeSet?.bossName || 'Penjaga Muqarrar',
                avatar: activeSet?.bossAvatar || '⚔️',
                role: 'Tantangan Muqarrar',
                text: 'Buktikan bahwa fahamanmu telah kokoh dan hujjahmu tak tergoyahkan!'
              },
              {
                speaker: 'Thalib Azhar',
                avatar: '🎓',
                role: 'Siap Bertanding',
                text: 'Bismillah! Mari kita mulai duel imtihan ini!'
              }
            ]
          };

          const dialogues = prologue.dialogues || [];
          const currentDialogue = dialogues[storyStep] || dialogues[0];
          // Cerita AI membawa speakerType; cerita bawaan dikenali dari nama pembicaranya.
          const speakerLower = currentDialogue?.speaker?.toLowerCase() || '';
          const isThalibSpeaking = currentDialogue?.speakerType ? currentDialogue.speakerType === 'thalib' : speakerLower.includes('thalib');
          const isNarratorSpeaking = currentDialogue?.speakerType ? currentDialogue.speakerType === 'narrator' : (speakerLower.includes('narator') || speakerLower.includes('narrator'));
          const isBossSpeaking = !isThalibSpeaking && !isNarratorSpeaking;
          const opponentName = activeStage?.guardianName || activeSet?.bossName;
          const opponentRank = activeStage?.guardianRankCode || activeStage?.guardianRank || activeSet?.bossRankCode || 'Rank A';
          const opponentVoxelSprite = getVoxelSprite(activeStage?.id || 4, activeSet?.id);

          const storyBgMap = {
            'ushul-amr': '/assets/mc-bg-ushul.jpg',
            'nahwu-fail': '/assets/mc-bg-nahwu.jpg',
            'balaghah-majaz': '/assets/mc-bg-balaghah.jpg'
          };
          const storyBg = storyBgMap[activeSet?.id] || '/assets/mc-bg-ushul.jpg';

          return (
            <div className="space-y-4 animate-fadeIn select-none font-sans">
              {/* ── VISUAL NOVEL CUTSCENE STAGE ── */}
              <ArenaPortal active speed={battleSpeed}>
              <div className="fixed inset-0 z-[9999] w-screen h-[100dvh] bg-[#070b09] overflow-hidden flex flex-col justify-between select-none font-sans">
                
                {/* 1. Cinematic Background Layer */}
                <div className="absolute inset-0 pointer-events-none select-none z-0">
                  <img
                    src={storyBg}
                    alt="Story Prologue Arena"
                    className="w-full h-full object-cover object-center filter brightness-[0.72] contrast-110"
                  />
                  {/* Atmospheric Vignette & Color Cast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/75" />
                  <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/30 to-black/80" />
                  {/* Subtle Voxel Torch Glow */}
                  <div className="absolute bottom-32 inset-x-0 h-32 bg-gradient-to-t from-amber-500/10 to-transparent pointer-events-none animate-pulse" />
                </div>

                {/* 2. Top Banner: Chapter Lore & Location */}
                <div className="relative z-10 m-2 sm:m-4 p-3 sm:p-4 flex flex-row md:items-start justify-between gap-3 rounded-2xl border-2 border-amber-500/30 bg-black/65 backdrop-blur-md">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/25 border border-amber-400/50 text-amber-300 font-mono text-xs font-black tracking-wider uppercase flex items-center gap-1 shadow-md">
                        <span><PixelIcon name="scroll" className="w-[1.15em] h-[1.15em]" /></span>
                        <span>{prologue.chapter}</span>
                      </span>
                      <span className="text-white/40 text-xs hidden sm:inline">•</span>
                      <span className="text-xs text-white/70 font-medium hidden sm:flex items-center gap-1">
                        <span><PixelIcon name="pin" className="w-[1.15em] h-[1.15em]" /></span>
                        <span>{prologue.location}</span>
                      </span>
                    </div>

                    <div className="hidden sm:block font-arabic text-xl sm:text-2xl text-amber-300 font-bold leading-normal mb-1 drop-shadow-[0_2px_8px_rgba(251,191,36,0.35)]" dir="rtl">
                      {prologue.titleArabic}
                    </div>
                    <h2 className="text-sm sm:text-lg font-bold text-white tracking-wide leading-snug">
                      {prologue.title}
                    </h2>
                  </div>

                  {/* Skip to Battle Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        sfx.playBip(520);
                        startBattle();
                      }}
                      className="btn border border-white/20 bg-white/10 hover:bg-white/20 text-white font-mono text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md active:scale-95"
                      title="Lewati cerita dan langsung mulai ujian imtihan (Esc / S)"
                    >
                      <span><span className="hidden sm:inline">Lewati Cerita </span>Skip</span>
                      <span className="text-amber-300">⏭️</span>
                    </button>
                    <button
                      onClick={() => setPhase('map')}
                      className="w-9 h-9 rounded-xl border border-white/20 bg-white/10 hover:bg-rose-500/80 text-white flex items-center justify-center transition active:scale-95"
                      title="Keluar ke peta level"
                      aria-label="Keluar ke peta level"
                    >
                      <PixelIcon name="cross" className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 3. Epigraph / Syi'ir Al-Azhar Parchment Ribbon */}
                {prologue.epigraph && (
                  <div className="hidden sm:block relative z-10 mx-4 sm:mx-6 mt-3 px-4 py-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 backdrop-blur-md text-center max-w-2xl self-center shadow-lg">
                    <div className="font-arabic text-sm sm:text-base text-amber-200/95 font-semibold" dir="rtl">
                      {prologue.epigraph}
                    </div>
                    {prologue.epigraphMeaning && (
                      <div className="text-[11px] sm:text-xs text-white/70 italic mt-0.5">
                        "{prologue.epigraphMeaning}"
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Center Stage: Dual Character Encounter Arena */}
                <div className="relative z-10 flex-1 min-h-0 flex items-end justify-between px-6 sm:px-14 md:px-20 pb-2 pt-2">
                  
                  {/* Left: Thalib Azhar Sprite */}
                  <div className={`transition-all duration-300 flex flex-col items-center select-none ${
                    isThalibSpeaking
                      ? 'scale-105 opacity-100 z-20'
                      : 'scale-95 opacity-50 z-10'
                  }`}>
                    {/* Speaking Bubble Pill */}
                    {isThalibSpeaking && (
                      <div className="mb-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-black text-[11px] font-mono font-extrabold animate-bounce flex items-center gap-1 shadow-xl shadow-amber-500/40">
                        <span><PixelIcon name="speech" className="w-[1.15em] h-[1.15em]" /></span>
                        <span>BERBICARA</span>
                      </div>
                    )}
                    <div className="relative">
                      <img
                        src="/assets/thalib-voxel-facing-right.png"
                        alt="Thalib Azhar Voxel"
                        className={`w-32 sm:w-44 md:w-52 h-auto max-h-[30dvh] sm:max-h-[36dvh] object-contain transition-all duration-300 ${
                          isThalibSpeaking
                            ? 'filter drop-shadow-[0_0_30px_rgba(251,191,36,0.65)] brightness-110'
                            : 'filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)] brightness-90 grayscale-[15%]'
                        }`}
                      />
                      {/* Perspective Floor Shadow */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 sm:w-40 h-6 bg-black/85 rounded-full blur-[5px]" />
                    </div>
                    {/* Nameplate */}
                    <div className="mt-2 text-center bg-black/75 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 shadow-lg">
                      <span className="font-bold text-xs sm:text-sm text-white block">
                        Thalib Al-Azhar
                      </span>
                      <span className="text-[10px] font-mono text-amber-300/90 block">
                        Jubah Kakula & Tarboosh
                      </span>
                    </div>
                  </div>

                  {/* Center vs Badge / Encounter Glow */}
                  <div className="hidden lg:flex flex-col items-center justify-center mb-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-black/70 border border-amber-500/30 flex items-center justify-center text-lg shadow-xl animate-pulse">
                      <PixelIcon name="sword" className="w-[1.15em] h-[1.15em]" />
                    </div>
                    <span className="text-[9px] font-mono text-amber-300/70 tracking-widest uppercase mt-1">
                      IMTIHAN AL-AZHAR
                    </span>
                  </div>

                  {/* Right: Boss / Guardian Sprite */}
                  <div className={`transition-all duration-300 flex flex-col items-center select-none ${
                    isBossSpeaking
                      ? 'scale-105 opacity-100 z-20'
                      : 'scale-95 opacity-50 z-10'
                  }`}>
                    {/* Speaking Bubble Pill */}
                    {isBossSpeaking && (
                      <div className="mb-2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-[11px] font-mono font-extrabold animate-bounce flex items-center gap-1 shadow-xl shadow-emerald-500/40">
                        <span><PixelIcon name="speech" className="w-[1.15em] h-[1.15em]" /></span>
                        <span>BERBICARA</span>
                      </div>
                    )}
                    <div className="relative">
                      {activeStage?.isFinal && (
                        <FinalBossFamiliar bossType={activeSet?.id} className="absolute z-20 -left-[45%] top-[0%] w-[60%] aspect-square" />
                      )}
                      <img
                        src={opponentVoxelSprite}
                        alt={opponentName}
                        className={`w-32 sm:w-44 md:w-52 h-auto max-h-[30dvh] sm:max-h-[36dvh] object-contain transition-all duration-300 ${
                          isBossSpeaking
                            ? 'filter drop-shadow-[0_0_35px_rgba(52,211,153,0.7)] brightness-110'
                            : 'filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)] brightness-90 grayscale-[15%]'
                        }`}
                      />
                      {/* Floor Shadow */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 sm:w-40 h-6 bg-black/85 rounded-full blur-[5px]" />
                    </div>
                    {/* Nameplate */}
                    <div className="mt-2 text-center bg-black/75 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 shadow-lg max-w-[170px] sm:max-w-[210px]">
                      <span className="font-bold text-xs sm:text-sm text-white truncate block">
                        {opponentName}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-300/90 block">
                        {opponentRank} Penjaga Muqarrar
                      </span>
                    </div>
                  </div>

                </div>

                {/* 5. Bottom Dialogue Balloon System */}
                <div className="relative z-20 mx-2 mb-[max(0.5rem,env(safe-area-inset-bottom))] sm:mx-auto sm:mb-4 sm:w-[min(60rem,calc(100%-2rem))] p-3 sm:p-5 rounded-2xl border-4 border-[#3d3221] bg-[#080d0a]/85 backdrop-blur-md shadow-[0_0_0_2px_#000,0_16px_40px_rgba(0,0,0,0.85)] max-h-[55vh] overflow-y-auto">
                  
                  {/* Speaker Info Header & Scene Step Indicator */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center text-2xl shadow-lg shrink-0 overflow-hidden ${
                        isThalibSpeaking
                          ? 'bg-amber-500/25 border-amber-400/60 shadow-amber-500/20'
                          : isBossSpeaking
                          ? 'bg-emerald-500/25 border-emerald-400/60 shadow-emerald-500/20'
                          : 'bg-white/10 border-white/20'
                      }`}>
                        {isThalibSpeaking ? (
                          <img
                            src="/assets/thalib-voxel-facing-right.png"
                            alt="Thalib"
                            className="w-full h-full object-cover object-top scale-125"
                          />
                        ) : isBossSpeaking ? (
                          <img
                            src={opponentVoxelSprite}
                            alt="Opponent"
                            className="w-full h-full object-contain p-0.5"
                          />
                        ) : (
                          <PixelIcon name="scroll" className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-extrabold text-sm sm:text-base tracking-wide ${
                            isThalibSpeaking ? 'text-amber-300' : isBossSpeaking ? 'text-emerald-300' : 'text-white'
                          }`}>
                            {currentDialogue.speaker}
                          </span>
                          {currentDialogue.role && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/70 border border-white/10">
                              {currentDialogue.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Scene Step Indicator */}
                    <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1 rounded-full border border-white/10 font-mono text-xs">
                      <span className="text-white/50">Adegan</span>
                      <span className="text-amber-300 font-bold">{storyStep + 1}</span>
                      <span className="text-white/30">/</span>
                      <span className="text-white/60">{dialogues.length}</span>
                    </div>
                  </div>

                  {/* Dialogue Text Balloon — ketuk untuk lanjut (di HP tombolnya ada di bawah layar) */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (storyStep < dialogues.length - 1) { setStoryStep(s => s + 1); sfx.playStoryBip(); }
                      else startBattle();
                    }}
                    className="relative cursor-pointer min-h-[82px] sm:min-h-[96px] flex items-center bg-[#070b09]/85 rounded-xl border border-white/15 p-4 sm:p-5 pb-6 sm:pb-5 shadow-inner active:bg-[#0c130f]"
                  >
                    <p className="text-sm sm:text-base md:text-lg text-white/95 font-medium leading-relaxed font-sans">
                      <SmartText text={currentDialogue.text} />
                    </p>
                    <span className="sm:hidden absolute bottom-1.5 right-3 text-[10px] font-mono text-amber-300/80 animate-pulse">
                      {storyStep < dialogues.length - 1 ? 'ketuk untuk lanjut ▸' : 'ketuk untuk mulai duel ▸'}
                    </span>
                  </div>

                  {/* Dialogue Navigation Controls — di HP tombol lanjut di atas, "Sebelumnya" di bawah */}
                  <div className="mt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/10">
                    {/* Left: Previous Button */}
                    <button
                      disabled={storyStep === 0}
                      onClick={() => {
                        if (storyStep > 0) {
                          setStoryStep(s => s - 1);
                          sfx.playBip(400);
                        }
                      }}
                      className="w-full sm:w-auto btn border border-white/15 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-white text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <Icon name="chevronLeft" className="w-4 h-4" />
                      <span>Sebelumnya (⬅)</span>
                    </button>

                    {/* Center: Keyboard Shortcut Hint */}
                    <div className="text-[11px] text-white/40 font-mono text-center hidden md:block">
                      Tekan <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 font-bold">Space</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 font-bold">Enter</kbd> untuk lanjut, <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 font-bold">Esc</kbd> untuk skip
                    </div>

                    {/* Right: Next or Start Battle CTA */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          sfx.playBip(520);
                          startBattle();
                        }}
                        className="max-sm:!hidden sm:flex-none btn border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs px-3.5 py-2.5 rounded-xl transition"
                        title="Lewati cerita dan langsung mulai duel"
                      >
                        Lewati Cerita ⏭️
                      </button>

                      {storyStep < dialogues.length - 1 ? (
                        <button
                          onClick={() => {
                            setStoryStep(s => s + 1);
                            sfx.playStoryBip();
                          }}
                          className="flex-1 sm:flex-none btn bg-gradient-to-r from-amber-500 to-emerald-400 hover:brightness-110 text-black font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition flex items-center justify-center gap-1.5"
                        >
                          <span>Lanjut Dialog</span>
                          <Icon name="chevronRight" className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={startBattle}
                          className="flex-1 sm:flex-none btn bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 hover:brightness-110 text-black font-black text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xl shadow-emerald-500/30 active:scale-95 transition flex items-center justify-center gap-2 animate-pulse"
                        >
                          <span><PixelIcon name="sword" className="w-[1.15em] h-[1.15em]" /> BISMILLAH, MULAI BATTLE!</span>
                          <PixelIcon name="sword" className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>

              </div>
              </ArenaPortal>
            </div>
          );
        })()}

        {/* =========================================================================
            FASE 2: ARENA IMTIHAN (Ujian Imtihan Game)
            ========================================================================= */}
        {phase === 'battle' && (
          <div className="space-y-4 animate-fadeIn">
            {/* ── GAME SCREEN CONTAINER ── */}
            <ArenaPortal active speed={battleSpeed}>
            <div
              ref={gameContainerRef}
              className={`fixed inset-0 z-[9999] w-screen h-[100dvh] bg-[#070b09] flex flex-col justify-between overflow-hidden font-mono select-none ${screenShake ? 'animate-screenShake' : ''}`}
            >
              {/* ── LATAR ADEGAN: menutup seluruh layar, termasuk di balik kotak dialog ── */}
              {battleStyle === 'minecraft' ? (
                <MinecraftBattlefield bossType={activeSet.id} level={activeStage?.levelNumber || activeStage?.id || 1} />
              ) : (
                <PixelBattlefield bossType={activeSet.id} />
              )}
              
              {/* Minecraft Red Hurt Screen Flash Vignette */}
              {animPlayer === 'hit' && (
                <div className="absolute inset-0 pointer-events-none z-40 bg-rose-600/30 border-4 sm:border-8 border-rose-500/80 shadow-[inset_0_0_100px_rgba(225,29,72,0.7)] animate-pulse" />
              )}
              
              {/* Top Navigation & Status Bar inside Container */}
              <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between gap-2 pointer-events-auto">
                {/* Left: Quest Badge & Combo Streak */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-black/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/15 shadow-xl">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[10px] sm:text-xs font-bold whitespace-nowrap">
                      {activeStage ? `LV ${activeStage.levelNumber} • ` : ''}SOAL {currentQ + 1}/{activeQuiz.length}
                    </span>
                    <span className="hidden md:inline text-xs text-white/80 font-bold truncate max-w-[200px]">
                      {activeStage?.guardianName || activeSet.title}
                    </span>
                  </div>

                  {/* Misi duel: chip ringkas, ketuk untuk melihat daftar */}
                  <div className="relative">
                    <button
                      onClick={() => setShowMissions(v => !v)}
                      className="min-h-[34px] flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-amber-400/40 text-amber-200 font-mono text-[11px] sm:text-xs font-bold shadow-xl"
                      title="Misi duel"
                    >
                      <span><PixelIcon name="target" className="w-[1.15em] h-[1.15em]" /></span>
                      <span>{stageMissions.filter(id => missionStatus(id, battleStats, { playerHp }) === 'done').length}/{stageMissions.length}</span>
                      <span className="hidden sm:inline">Misi</span>
                    </button>
                    {showMissions && (
                      <div className="fixed sm:absolute left-2 right-2 sm:right-auto top-14 sm:top-full sm:left-0 sm:mt-2 sm:w-64 z-50 rounded-xl border-2 border-amber-400/40 bg-[#0b0f0c]/95 backdrop-blur-md p-2.5 shadow-2xl space-y-1.5 animate-fadeIn">
                        <div className="text-[10px] font-black uppercase tracking-wider text-amber-300 px-1">Misi Duel • +{MISSION_BONUS_EXP} EXP / misi</div>
                        {stageMissions.map(id => {
                          const st = missionStatus(id, battleStats, { playerHp });
                          const def = MISSION_DEFS[id];
                          return (
                            <div key={id} className={`flex items-start gap-2 rounded-lg px-2 py-1.5 border ${st === 'done' ? 'border-emerald-400/50 bg-emerald-500/10' : st === 'failed' ? 'border-rose-500/40 bg-rose-500/10 opacity-70' : 'border-white/10 bg-white/5'}`}>
                              <PixelIcon name={def.icon} className="w-5 h-5 mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <div className={`text-xs font-bold ${st === 'failed' ? 'line-through text-white/50' : 'text-white'}`}>{def.label}</div>
                                <div className="text-[10px] text-white/55 leading-snug">{def.desc}</div>
                              </div>
                              <PixelIcon name={st === 'done' ? 'check' : st === 'failed' ? 'cross' : 'hourglass'} className="w-4 h-4" />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* COMBO STREAK BADGE */}
                  {streak >= 2 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/40 via-orange-500/35 to-amber-500/30 border border-amber-400/70 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse backdrop-blur-md">
                      <span className="text-sm"><PixelIcon name="fire" className="w-[1.15em] h-[1.15em]" /></span>
                      <div className="flex flex-col text-left leading-none">
                        <span className="text-[10px] font-mono font-black text-amber-300 tracking-wider">COMBO x{streak}</span>
                        <span className="text-[8px] font-serif text-amber-100/90 font-medium hidden sm:inline">Hujjah Mutawatirah</span>
                      </div>
                    </div>
                  )}

                  {/* DEFENSE SHIELD INDICATOR */}
                  {defenseShield && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-cyan-500/35 to-blue-500/35 border border-cyan-400/70 shadow-[0_0_15px_rgba(6,182,212,0.5)] backdrop-blur-md animate-bounce">
                      <span className="text-sm"><PixelIcon name="shield" className="w-[1.15em] h-[1.15em]" /></span>
                      <span className="text-[10px] font-mono font-bold text-cyan-200">TAMENG -50%</span>
                    </div>
                  )}
                </div>

                {/* Right: Controls Cluster — di layar sempit bisa digeser ke samping, bukan terpotong */}
                <div className="flex items-center gap-1.5 bg-black/85 backdrop-blur-md p-1 rounded-xl border border-white/15 shadow-xl min-w-0 overflow-x-auto [scrollbar-width:none] [&>*]:shrink-0">
                  {/* Style Switcher */}
                  <button
                    onClick={() => { setBattleStyle('minecraft'); sfx.playBip(580); }}
                    className={`min-h-[34px] sm:min-h-0 px-2.5 py-1.5 sm:px-2 sm:py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 ${
                      battleStyle === 'minecraft'
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <span><PixelIcon name="pickaxe" className="w-[1.15em] h-[1.15em]" /></span>
                    <span className="hidden xl:inline">Voxel 3D</span>
                  </button>
                  <button
                    onClick={() => { setBattleStyle('retro'); sfx.playBip(480); }}
                    className={`min-h-[34px] sm:min-h-0 px-2.5 py-1.5 sm:px-2 sm:py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 ${
                      battleStyle === 'retro'
                        ? 'bg-emerald-500 text-black shadow-md'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <span><PixelIcon name="gamepad" className="w-[1.15em] h-[1.15em]" /></span>
                    <span className="hidden xl:inline">16-Bit Retro</span>
                  </button>

                  {/* Prolog Story Button */}
                  <button
                    onClick={() => {
                      sfx.playStoryBip();
                      enterStoryPrologue();
                    }}
                    className="min-h-[34px] sm:min-h-0 px-2.5 py-1.5 sm:px-2 sm:py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 text-amber-300 bg-amber-500/15 border border-amber-400/30 hover:bg-amber-500/25"
                    title="Buka Prolog Cerita / Kisah Pertarungan Ini"
                  >
                    <span><PixelIcon name="scroll" className="w-[1.15em] h-[1.15em]" /></span>
                    <span className="hidden xl:inline">Cerita</span>
                  </button>

                  {/* Attack Cutscene Toggle */}
                  <button
                    onClick={() => {
                      setEnableCutscene(v => !v);
                      sfx.playBip(480);
                    }}
                    className={`min-h-[34px] sm:min-h-0 px-2.5 py-1.5 sm:px-2 sm:py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 ${
                      enableCutscene
                        ? 'text-amber-300 bg-amber-500/20 border border-amber-400/40 shadow-sm'
                        : 'text-white/40 hover:text-white border border-white/10 bg-white/5'
                    }`}
                    title={enableCutscene ? 'Scene Serangan Aktif (Klik untuk nonaktifkan)' : 'Scene Serangan Nonaktif (Klik untuk aktifkan)'}
                  >
                    <span><PixelIcon name="film" className="w-[1.15em] h-[1.15em]" /></span>
                    <span className="hidden xl:inline">Scene:</span>
                    <span>{enableCutscene ? 'ON' : 'OFF'}</span>
                  </button>

                  {/* Battle Speed Quick Toggle (1x Normal / 2x Turbo) */}
                  <button
                    onClick={toggleBattleSpeed}
                    className={`min-h-[34px] sm:min-h-0 px-2.5 py-1.5 sm:px-2 sm:py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 ${
                      battleSpeed === 2
                        ? 'text-amber-200 bg-gradient-to-r from-amber-500/30 to-orange-500/30 border border-amber-400/60 shadow-sm animate-pulse'
                        : 'text-white/60 hover:text-white border border-white/10 bg-white/5'
                    }`}
                    title={battleSpeed === 2 ? 'Kecepatan Turbo 2x (Klik atau tekan Z untuk ubah ke 1x)' : 'Kecepatan Normal 1x (Klik atau tekan Z untuk ubah ke 2x)'}
                  >
                    <span><PixelIcon name="bolt" className="w-[1.15em] h-[1.15em]" /></span>
                    <span className="font-extrabold">{battleSpeed === 2 ? '2x CEPAT' : '1x'}</span>
                  </button>

                  {/* SFX Quick Toggle */}
                  <button
                    onClick={toggleAudio}
                    className={`min-h-[34px] sm:min-h-0 px-2.5 py-1.5 sm:px-2 sm:py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 ${
                      audioMuted ? 'text-white/40 hover:text-white' : 'text-emerald-300 bg-emerald-500/20'
                    }`}
                    title={audioMuted ? 'Aktifkan Suara (M)' : 'Bisukan Suara (M)'}
                  >
                    <PixelIcon name={audioMuted ? 'mute' : 'note'} className="w-[1.15em] h-[1.15em]" />
                  </button>

                  {/* Fullscreen browser (sembunyikan bar browser) — hanya di perangkat yang mendukung */}
                  {canNativeFs && (
                    <button
                      onClick={toggleFullscreen}
                      className={`min-h-[34px] sm:min-h-0 px-2.5 py-1.5 sm:py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                        isFullscreen ? 'bg-amber-500/25 text-amber-200 border border-amber-400/50' : 'bg-[#0f2a1d] text-emerald-300 hover:bg-emerald-500/40 border border-emerald-400/40'
                      }`}
                      title={isFullscreen ? 'Tampilkan bar browser (Esc / F)' : 'Sembunyikan bar browser (F)'}
                    >
                      <Icon name={isFullscreen ? 'minimize' : 'maximize'} className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Keluar duel → kembali ke peta level (selalu terlihat di ujung kanan) */}
                  <button
                    onClick={() => {
                      if (confirm('Keluar dari duel ini? Progres duel saat ini akan di-reset.')) setPhase('map');
                    }}
                    className="sticky right-0 min-h-[34px] sm:min-h-0 px-2.5 py-1.5 sm:py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 bg-rose-500 text-white ring-4 ring-black/85 shadow-md hover:bg-rose-600"
                    title="Keluar duel (kembali ke peta)"
                  >
                    <PixelIcon name="cross" className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Keluar</span>
                  </button>
                </div>
              </div>

              {/* ── INTRO DUEL "VS": nama arena, kedua petarung, dan misi. Ketuk untuk langsung mulai. ── */}
              {duelIntro && (() => {
                const theme = getArenaTheme(activeStage?.levelNumber || activeStage?.id || 1);
                const guardianSrc = getVoxelSprite(activeStage?.id || 4, activeSet.id);
                return (
                  <div
                    className="absolute inset-0 z-[45] duel-intro flex flex-col items-center justify-center gap-4 sm:gap-6 bg-black/75 backdrop-blur-[2px] px-4 cursor-pointer"
                    onClick={() => setDuelIntro(false)}
                  >
                    <div className="vs-banner text-center">
                      <div className="font-mono text-[11px] sm:text-xs font-black tracking-[0.3em] text-amber-300 uppercase"><span className="inline-flex items-center gap-2"><PixelIcon name={theme.icon} className="w-4 h-4" />{theme.name}</span></div>
                      <div className="text-white/70 text-xs sm:text-sm mt-1">{activeStage?.location}</div>
                    </div>
                    <div className="w-full max-w-3xl flex items-end justify-between gap-2">
                      <div className="vs-left flex flex-col items-center gap-2 w-[40%]">
                        <img src="/assets/thalib-voxel-facing-right.png" alt="Thalib Azhar" className="h-[min(14rem,26dvh)] object-contain drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]" />
                        <div className="font-mono text-xs sm:text-sm font-black text-amber-200 text-center">Thalib Azhar</div>
                      </div>
                      <div className="vs-slam self-center font-black text-5xl sm:text-7xl text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-rose-500 drop-shadow-[0_4px_0_#000]">VS</div>
                      <div className="vs-right flex flex-col items-center gap-2 w-[40%]">
                        {activeStage?.isFinal ? (
                          <FinalBossPortrait bossType={activeSet.id} src={guardianSrc} alt={activeStage?.guardianName} className="h-[min(14rem,26dvh)]" imgClassName="h-full object-contain" familiarClassName="-left-[40%] top-0 w-[60%] aspect-square" />
                        ) : (
                          <img src={guardianSrc} alt={activeStage?.guardianName} className="h-[min(12rem,22dvh)] object-contain drop-shadow-[0_0_20px_rgba(244,63,94,0.55)]" />
                        )}
                        <div className="font-mono text-xs sm:text-sm font-black text-rose-200 text-center line-clamp-2">{activeStage?.guardianName}</div>
                      </div>
                    </div>
                    <div className="vs-missions flex flex-wrap justify-center gap-1.5 max-w-xl">
                      {stageMissions.map(id => (
                        <span key={id} className="px-2.5 py-1 rounded-lg border border-amber-400/40 bg-black/60 font-mono text-[11px] text-amber-100">
                          <PixelIcon name={MISSION_DEFS[id].icon} className="w-4 h-4 inline-block align-[-3px] mr-1" />{MISSION_DEFS[id].label}
                        </span>
                      ))}
                    </div>
                    <div className="font-mono text-[10px] text-white/50 animate-pulse">ketuk untuk mulai</div>
                  </div>
                );
              })()}

              {/* ── LULUS: penguji mengakui jawabanmu (bercahaya lalu menghilang) + konfeti sebelum layar menang ── */}
              {koAnim && (
                <div className="absolute inset-0 z-[45] pointer-events-none overflow-hidden">
                  {Array.from({ length: 36 }, (_, i) => (
                    <span
                      key={i}
                      className="ko-confetti absolute -top-6 w-2 h-3 rounded-sm"
                      style={{
                        left: `${(i * 37) % 100}%`,
                        background: ['#fbbf24', '#34d399', '#38bdf8', '#f472b6', '#a78bfa', '#ffffff'][i % 6],
                        animationDelay: `${(i % 12) * 0.06}s`,
                        animationDuration: `${1.4 + (i % 5) * 0.2}s`,
                      }}
                    />
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="ko-slam font-black text-6xl sm:text-8xl tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-300 to-amber-600 drop-shadow-[0_6px_0_#000]">LULUS!</div>
                  </div>
                </div>
              )}

              {missionToast && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
                  <div className={`mission-toast whitespace-nowrap px-4 py-2 rounded-xl border-2 font-mono text-xs sm:text-sm font-black shadow-2xl ${
                    missionToast.tone === 'done' ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200' : 'bg-rose-950/90 border-rose-500 text-rose-200'
                  }`}>
                    <span className="inline-flex items-center gap-2"><PixelIcon name={missionToast.icon} className="w-5 h-5" />{missionToast.text}</span>
                  </div>
                </div>
              )}

              {/* Scanlines Effect Overlay (Only in Retro mode) */}
              {battleStyle === 'retro' && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.04] z-20"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)',
                    backgroundSize: '100% 4px'
                  }}
                />
              )}

              {/* Attack / Hit Flash Overlays */}
              {attackEffect === 'crit' && (
                <div className="absolute inset-0 bg-white/30 z-30 animate-pulse pointer-events-none" />
              )}
              {attackEffect === 'hurt' && (
                <div className="absolute inset-0 bg-rose-500/30 z-30 animate-pulse pointer-events-none" />
              )}

              {/* ── CINEMATIC ATTACK SCENE OVERLAY ("SCENE PAS NYERANG") ── */}
              {attackCutscene && (
                <AttackCutsceneOverlay
                  cutscene={attackCutscene}
                  activeSet={activeSet}
                  activeStage={activeStage}
                  battleStyle={battleStyle}
                  speed={battleSpeed}
                  onToggleSpeed={toggleBattleSpeed}
                  onSkip={handleSkipCutscene}
                />
              )}

              {/* ── BATTLE UPPER HALF: COMBATANTS ARENA ── */}
              <div className="flex-1 min-h-0 px-4 pb-2 pt-20 sm:px-6 sm:pt-20 flex flex-col justify-between relative overflow-hidden">
                
                {/* ── IN-BATTLE LIVE OBJECTIVE HUD ── */}
                <div className={`absolute top-[4.25rem] left-1/2 -translate-x-1/2 z-20 hidden 2xl:flex items-center gap-2 pointer-events-none max-w-[95%]`}>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/85 border border-amber-400/50 backdrop-blur-md shadow-lg text-[10px] sm:text-xs font-mono font-bold text-amber-200">
                    <span className="text-amber-400"><PixelIcon name="target" className="w-[1.15em] h-[1.15em]" /></span>
                    <span className="hidden sm:inline">Target Imtihan: Pertahankan HP ≥ 80% untuk Predikat Mumtaz (★★★)</span>
                    <span className="sm:hidden">Target: HP ≥ 80% (Mumtaz ★★★)</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-black/85 border border-emerald-400/50 backdrop-blur-md shadow-lg text-[10px] sm:text-xs font-mono font-bold text-emerald-300 whitespace-nowrap">
                    Soal {currentQ + 1}/{activeQuiz.length}
                  </div>
                </div>

                {/* Battle Projectiles (Energy waves / elemental spells) */}
                <BattleProjectile type={projectile} effect={attackEffect} bossType={activeSet.id} />

                {/* 1. TOP ROW: OPPONENT STATUS CARD (LEFT) & OPPONENT SPRITE (RIGHT) */}
                <div className={`flex items-start justify-between gap-2 sm:gap-6 w-full px-1 sm:px-4 ${battleStyle === 'retro' ? 'relative z-10' : ''}`}>
                  {/* Left: Opponent Status HUD Plate */}
                  <div className="relative z-10 min-w-0 max-w-[64%] sm:max-w-none sm:shrink-0">
                    {battleStyle === 'minecraft' ? (
                      <MinecraftHudPlate
                        type="boss"
                        name={activeStage?.guardianName || activeSet.bossName}
                        level={activeStage?.guardianRankCode || activeStage?.guardianRank || activeSet.bossRankCode || 'Rank A'}
                        hp={bossHp}
                        maxHp={bossMaxHp}
                        floatingText={floatingText?.target === 'boss' ? floatingText : null}
                        bossAvatar={activeStage?.guardianAvatar || activeSet.bossAvatar || '⚖️'}
                        avatarSrc={animBoss === 'hit' ? getVoxelHurtSprite(activeStage?.id || 4, activeSet.id) : getVoxelSprite(activeStage?.id || 4, activeSet.id)}
                      />
                    ) : (
                      /* Status Bar Musuh (Retro Pokémon Beveled Pixel Panel) */
                      <div className="w-48 sm:w-64 bg-[#0a120e]/95 border-2 border-r-4 border-b-4 border-[#25392d] rounded-xl p-2.5 sm:p-3 shadow-xl backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] sm:text-xs font-bold text-emerald-300 truncate max-w-[130px] sm:max-w-[160px]">
                            {activeStage?.guardianName || activeSet.bossName}
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-amber-300 font-extrabold px-2 py-0.5 rounded bg-amber-500/15 border border-amber-400/40 font-mono">
                            {activeStage?.guardianRankCode || activeStage?.guardianRank || activeSet.bossRankCode || 'Rank A'}
                          </span>
                        </div>

                        {/* Boss HP Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-white/70">
                            <span className="font-extrabold text-amber-300 px-1 rounded bg-amber-500/20 text-[8px] sm:text-[9px]">HP</span>
                            <span className="font-mono">{bossHp}/{bossMaxHp}</span>
                          </div>
                          <div className="w-full h-2.5 bg-[#050907] rounded-full overflow-hidden border border-white/10 p-[1px]">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                bossHp > 50 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : bossHp > 20 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-rose-600 to-rose-400'
                              }`}
                              style={{ width: `${Math.max(0, (bossHp / bossMaxHp) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Opponent Sprite & Ground Platform */}
                  {battleStyle === 'retro' ? (
                    <div className="relative flex flex-col items-center justify-center pt-2 sm:pt-6 mr-1 sm:mr-8 md:mr-16">
                      {floatingText && floatingText.target === 'boss' && (
                        <div className="absolute -top-6 z-40">
                          <FloatingDamage text={floatingText.text} type={floatingText.type} />
                        </div>
                      )}
                      {/* Boss Hurt Reaction Comic Speech Bubble */}
                      {damageReaction && damageReaction.target === 'boss' && (
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center animate-critNumberBounce">
                          <div className="bg-gradient-to-r from-[#2b1014] via-[#3a141b] to-[#240c10] border-2 border-rose-400 text-white px-3 py-1.5 rounded-xl shadow-[0_6px_25px_rgba(244,63,94,0.85)] flex items-center gap-2 whitespace-nowrap">
                            <EmojiIcon text={damageReaction.emoji} className="w-6 h-6" />
                            <div className="text-left">
                              <div className="text-[9px] font-mono font-black text-amber-300 uppercase tracking-wider">{damageReaction.badge}</div>
                              <div className="text-xs font-bold text-white font-sans drop-shadow">{damageReaction.quote}</div>
                            </div>
                          </div>
                          <div className="w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-rose-400 -mt-[1px]" />
                        </div>
                      )}
                      {animBoss === 'hit' && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none z-40 animate-bounce">
                          <span className="text-xl filter drop-shadow"><PixelIcon name="boom" className="w-[1.15em] h-[1.15em]" /></span>
                          <span className="text-base filter drop-shadow"><PixelIcon name="bolt" className="w-[1.15em] h-[1.15em]" /></span>
                          <span className="text-[10px] font-black font-mono text-amber-300 bg-black/85 px-1.5 py-0.5 rounded border border-amber-400 shadow">HUJJAH TELAK!</span>
                        </div>
                      )}
                      <div className="relative z-10">
                        <BossSprite bossType={activeSet.id} stageId={activeStage?.id || 4} state={animBoss} />
                      </div>
                      <div className="absolute -bottom-3 sm:-bottom-4 z-0 pointer-events-none">
                        <PixelPlatform type="boss" bossType={activeSet.id} />
                      </div>
                    </div>
                  ) : (
                    /* Mode Minecraft: penjaga berdiri di lantai pelataran (agak ke belakang = sedikit lebih tinggi dari pemain),
                       bukan di baris atas yang membuatnya tampak melayang di langit. */
                    <div className="absolute z-[5] right-[4%] sm:right-[12%] bottom-[22%] sm:bottom-[24%] flex flex-col items-center">
                      {floatingText && floatingText.target === 'boss' && (
                        <div className="absolute -top-6 z-40">
                          <FloatingDamage text={floatingText.text} type={floatingText.type} />
                        </div>
                      )}
                      {/* Boss Hurt Reaction Comic Speech Bubble */}
                      {damageReaction && damageReaction.target === 'boss' && (
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center animate-critNumberBounce">
                          <div className="bg-gradient-to-r from-[#2b1014] via-[#3a141b] to-[#240c10] border-2 border-rose-400 text-white px-3 py-1.5 rounded-xl shadow-[0_6px_25px_rgba(244,63,94,0.85)] flex items-center gap-2 whitespace-nowrap">
                            <EmojiIcon text={damageReaction.emoji} className="w-6 h-6" />
                            <div className="text-left">
                              <div className="text-[9px] font-mono font-black text-amber-300 uppercase tracking-wider">{damageReaction.badge}</div>
                              <div className="text-xs font-bold text-white font-sans drop-shadow">{damageReaction.quote}</div>
                            </div>
                          </div>
                          <div className="w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-rose-400 -mt-[1px]" />
                        </div>
                      )}
                      {animBoss === 'hit' && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none z-40 animate-bounce">
                          <span className="text-xl filter drop-shadow"><PixelIcon name="boom" className="w-[1.15em] h-[1.15em]" /></span>
                          <span className="text-base filter drop-shadow"><PixelIcon name="bolt" className="w-[1.15em] h-[1.15em]" /></span>
                          <span className="text-[10px] font-black font-mono text-amber-300 bg-black/85 px-1.5 py-0.5 rounded border border-amber-400 shadow">HUJJAH TELAK!</span>
                        </div>
                      )}
                      <div className={`relative z-10 ${koAnim ? 'boss-ko' : ''} ${bossEnraged && !koAnim ? 'boss-enraged' : ''}`}>
                        <div style={{ filter: arenaTheme.spriteGrade }}>
                        <MinecraftBossSprite
                          bossType={activeSet.id}
                          stageId={activeStage?.id || 4}
                          state={animBoss}
                          guardianAvatar={activeStage?.guardianAvatar}
                          guardianName={activeStage?.guardianName}
                        />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. BOTTOM ROW: PLAYER SPRITE (LEFT) & PLAYER STATUS CARD (RIGHT) */}
                <div className="flex items-end justify-between gap-2 sm:gap-6 w-full mt-3 sm:mt-4 relative z-10 px-1 sm:px-4">
                  {/* Left: Player Sprite & 2.5D Ground Platform */}
                  <div className="relative flex flex-col items-center justify-center pb-1 sm:pb-2 ml-1 sm:ml-8 md:ml-16">
                    {floatingText && floatingText.target === 'player' && (
                      <div className="absolute -top-6 z-40">
                        <FloatingDamage text={floatingText.text} type={floatingText.type} />
                      </div>
                    )}
                    {/* Player Hurt Reaction Comic Speech Bubble */}
                    {damageReaction && damageReaction.target === 'player' && (
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center animate-critNumberBounce">
                        <div className="bg-gradient-to-r from-[#2e1216] via-[#1f1013] to-[#2a0e12] border-2 border-amber-400 text-white px-3 py-1.5 rounded-xl shadow-[0_6px_25px_rgba(245,158,11,0.85)] flex items-center gap-2 whitespace-nowrap">
                          <EmojiIcon text={damageReaction.emoji} className="w-6 h-6" />
                          <div className="text-left">
                            <div className="text-[9px] font-mono font-black text-rose-300 uppercase tracking-wider">{damageReaction.badge}</div>
                            <div className="text-xs font-bold text-white font-sans drop-shadow">{damageReaction.quote}</div>
                          </div>
                        </div>
                        <div className="w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-amber-400 -mt-[1px]" />
                      </div>
                    )}
                    {/* Player Hurt Particles: Broken Hearts & Sweat Drops */}
                    {animPlayer === 'hit' && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none z-40 animate-bounce">
                        <span className="text-xl filter drop-shadow"><PixelIcon name="heartBroken" className="w-[1.15em] h-[1.15em]" /></span>
                        <span className="text-base filter drop-shadow"><PixelIcon name="heartBroken" className="w-[1.15em] h-[1.15em]" /></span>
                        <span className="text-[10px] font-black font-mono text-rose-300 bg-black/85 px-1.5 py-0.5 rounded border border-rose-500 shadow">OUCH!</span>
                      </div>
                    )}
                    {/* Streak Combo Golden Aura */}
                    {streak >= 2 && (
                      <div className="absolute -inset-4 rounded-full bg-gradient-to-t from-amber-400/30 to-orange-500/10 blur-xl animate-pulse pointer-events-none" />
                    )}
                    {/* Defense Shield Protective Aura */}
                    {defenseShield && (
                      <div className="absolute -inset-2 rounded-full border-2 border-cyan-400/60 bg-cyan-400/10 blur-sm animate-pulse pointer-events-none" />
                    )}
                    <div className={`relative z-10 ${streak >= 3 ? 'combo-aura combo-aura-max' : streak >= 2 ? 'combo-aura' : ''}`}>
                      {battleStyle === 'minecraft' ? (
                        <div style={{ filter: arenaTheme.spriteGrade }}>
                          <MinecraftPlayerSprite state={koAnim ? 'attack' : animPlayer} />
                        </div>
                      ) : (
                        <PlayerSprite state={animPlayer} />
                      )}
                    </div>
                    {battleStyle === 'retro' && (
                      <div className="absolute -bottom-3 sm:-bottom-4 z-0 pointer-events-none">
                        <PixelPlatform type="player" />
                      </div>
                    )}
                  </div>

                  {/* Right: Player Status Card */}
                  <div className="min-w-0 max-w-[64%] sm:max-w-none sm:shrink-0">
                    {battleStyle === 'minecraft' ? (
                      <MinecraftHudPlate
                        type="player"
                        name={profile?.name ? profile.name.slice(0, 16) : 'Thalib Azhar'}
                        level={getThalibRank(userProgress?.totalExp || 0).rankCode}
                        hp={playerHp}
                        maxHp={playerMaxHp}
                        exp={answeredCount}
                        maxExp={activeQuiz.length}
                        floatingText={floatingText?.target === 'player' ? floatingText : null}
                        avatarSrc={animPlayer === 'hit' ? '/assets/thalib-hurt-voxel.png' : '/assets/thalib-voxel-facing-right.png'}
                      />
                    ) : (
                      /* Status Bar Player (Retro Pokémon Beveled Pixel Panel) */
                      <div className="w-48 sm:w-64 bg-[#0a120e]/95 border-2 border-r-4 border-b-4 border-[#25392d] rounded-xl p-2.5 sm:p-3 shadow-xl backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] sm:text-xs font-bold text-amber-300 truncate">
                            {profile?.name ? profile.name.slice(0, 16) : 'Thalib Azhar'}
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-amber-300 font-extrabold px-2 py-0.5 rounded bg-amber-500/15 border border-amber-400/40 font-mono">
                            {getThalibRank(userProgress?.totalExp || 0).rankCode}
                          </span>
                        </div>

                        {/* Player HP Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-white/70">
                            <span className="font-extrabold text-emerald-400 px-1 rounded bg-emerald-500/20 text-[8px] sm:text-[9px]">HP</span>
                            <span className="font-mono">{playerHp}/{playerMaxHp}</span>
                          </div>
                          <div className="w-full h-2.5 bg-[#050907] rounded-full overflow-hidden border border-white/10 p-[1px]">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                playerHp > 50 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : playerHp > 20 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-rose-600 to-rose-400'
                              }`}
                              style={{ width: `${Math.max(0, (playerHp / playerMaxHp) * 100)}%` }}
                            />
                          </div>
                          {/* EXP bar */}
                          <div className="flex items-center justify-between text-[9px] text-white/40 pt-0.5">
                            <span className="text-[8px] font-bold text-blue-400">EXP</span>
                            <div className="w-24 sm:w-32 h-1 bg-black rounded-full overflow-hidden border border-white/5">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                                style={{ width: `${Math.min(100, (answeredCount / activeQuiz.length) * 100)}%` }}
                              />
                            </div>
                            <span className="font-mono">{Math.round((answeredCount / activeQuiz.length) * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* ── BATTLE LOWER HALF: DIALOG & 4-COMMAND BOX ── */}
              {/* Kotak dialog game (gaya Pokémon): melayang di atas adegan, bukan panel halaman web. */}
              <div className={`relative z-20 shrink-0 mx-2 mb-[max(0.5rem,env(safe-area-inset-bottom))] sm:mx-auto sm:mb-4 sm:w-[min(60rem,calc(100%-2rem))] rounded-2xl border-4 border-[#3d3221] bg-[#080d0a]/85 backdrop-blur-md shadow-[0_0_0_2px_#000,0_16px_40px_rgba(0,0,0,0.85)] p-3 sm:p-4 overflow-y-auto overscroll-contain ${battleMenu !== 'main' || wrongReview ? 'max-h-[68vh] sm:max-h-[60vh]' : 'max-h-[44vh]'}`}>
                
                {/* ── JIKA JAWABAN SALAH: KARTU MUZAKARAH & CARA JAWAB DI LEMBAR UJIAN ── */}
                {wrongReview ? (
                  <div className="space-y-3 animate-fadeIn bg-gradient-to-b from-[#180f12] via-[#120b0e] to-[#0c0809] border-2 border-rose-500/50 rounded-xl p-3.5 sm:p-5 shadow-2xl font-sans">
                    <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                        <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-wide">
                          <PixelIcon name="warning" className="w-[1.15em] h-[1.15em]" /> Hujjah Kurang Tepat (-{wrongReview.damage ?? 22} HP)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-white/50 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        Muzakarah Soal #{currentQ + 1}
                      </span>
                    </div>

                    {/* Potongan Pertanyaan */}
                    <div className="text-xs sm:text-sm text-white/90 font-medium bg-black/40 p-3 rounded-lg border border-white/10 leading-relaxed">
                      <span className="text-white/40 block text-[9px] font-mono uppercase mb-1">Pertanyaan Muqarrar:</span>
                      <SmartText text={wrongReview.question} isArabicLarge={true} />
                    </div>

                    {/* Perbandingan Jawaban: Salah vs Kunci Benar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                      <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-200">
                        <span className="block text-[10px] font-bold text-rose-400 uppercase mb-1 font-mono">✗ Pilihanmu (Keliru):</span>
                        <div className="leading-snug">
                          <BattleOptionContent opt={wrongReview.chosen} />
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200">
                        <span className="block text-[10px] font-bold text-emerald-400 uppercase mb-1 font-mono">✓ Kunci Jawaban yang Benar:</span>
                        <div className="leading-snug font-semibold">
                          <BattleOptionContent opt={wrongReview.correct} />
                        </div>
                      </div>
                    </div>

                    {/* Penjelasan Kaidah & 'Illat Matan */}
                    <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 text-xs sm:text-sm text-white/85 leading-relaxed">
                      <div className="font-bold text-emerald-300 text-[11px] mb-1.5 flex items-center gap-1.5 font-mono">
                        <span><PixelIcon name="book" className="w-[1.15em] h-[1.15em]" /></span>
                        <span>TA'LIL & SYARAH KAIDAH:</span>
                      </div>
                      <p className="leading-relaxed">
                        <SmartText text={wrongReview.exp || wrongReview.explanation} isArabicLarge={false} />
                      </p>
                    </div>

                    {/* CARA JAWAB DI LEMBAR UJIAN (KURRASAH IJABAH TAHRIRI AZHAR) */}
                    <ExamTipBlock tip={wrongReview.examTip} translation={wrongReview.examTipTranslation} compact={false} />

                    {/* Tombol Lanjut Pertarungan & Putar Ulang */}
                    <div className="sticky -bottom-3.5 sm:static -mx-3.5 sm:mx-0 px-3.5 sm:px-0 py-2.5 sm:py-0 sm:pt-1 bg-[#0c0809]/95 sm:bg-transparent border-t border-rose-500/20 sm:border-0 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={handleReplayWrongAnim}
                        disabled={isActionBusy}
                        className="btn border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-mono text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 active:scale-95"
                        title="Tonton ulang animasi serangan boss"
                      >
                        <span><PixelIcon name="film" className="w-[1.15em] h-[1.15em]" /></span>
                        <span>Putar Ulang Animasi</span>
                      </button>

                      <button
                        onClick={handleDismissWrongReview}
                        className="btn bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2 active:scale-95 ml-auto"
                      >
                        <span>{wrongReview.isFatal ? 'Lihat Evaluasi Akhir' : 'Faham, Lanjutkan Duel!'}</span>
                        <span>➔</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Dialog Box Display */}
                    <div className={`rounded-xl border-2 border-[#243329] bg-[#080d0a] p-3 sm:p-4 mb-3 min-h-[70px] items-center ${battleMenu !== 'main' ? 'hidden sm:flex' : 'flex'}`}>
                      <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-mono whitespace-pre-line">
                        <IconText text={dialogText} iconClassName="w-4 h-4 shrink-0" />
                      </p>
                    </div>

                    {/* ── SUB-MENU FIGHT: 4 PILIHAN JAWABAN KUIS ── */}
                    {battleMenu === 'fight' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-emerald-400 font-bold px-1">
                          <span>PILIH HUJJAH / JAWABAN (SOAL {currentQ + 1}/{activeQuiz.length}):</span>
                          <button
                            onClick={() => { if (!isActionBusy) { setBattleMenu('main'); sfx.playBip(440); } }}
                            disabled={isActionBusy}
                            className="text-white/60 hover:text-white underline text-[11px] disabled:opacity-30 disabled:pointer-events-none"
                          >
                            [ Batal / Kembali ]
                          </button>
                        </div>

                        {/* Soal yang sedang aktif */}
                        <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 text-xs sm:text-sm text-white leading-relaxed">
                          <SmartText text={activeQuiz[currentQ]?.question} isArabicLarge={true} />
                        </div>

                        {activeHint && (
                          <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                            <PixelIcon name="bulb" className="w-[1.15em] h-[1.15em]" /> <strong>Hint Qamus:</strong> <SmartText text={activeHint} />
                          </div>
                        )}

                        {/* 4 Pilihan Jawaban */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {activeQuiz[currentQ]?.options.map((opt, optIdx) => {
                            const isSelected = selectedAnswer?.optionIdx === optIdx;
                            const isCorrectOpt = optIdx === activeQuiz[currentQ]?.answer;
                            const showCorrectHighlight = isActionBusy && isCorrectOpt;
                            const isDisabled = disabledOptions.includes(optIdx) || (isActionBusy && !isSelected);
                            const isOptArabic = containsArabic(opt);

                            let btnTheme = 'border-[#2d3d33] bg-[#121c16] hover:border-emerald-400 hover:bg-[#16251d] text-white active:scale-[0.98]';
                            if (isSelected) {
                              if (selectedAnswer.isCorrect) {
                                btnTheme = 'border-emerald-400 bg-emerald-950/80 ring-2 ring-emerald-400 text-emerald-100 shadow-[0_0_20px_rgba(52,211,153,0.5)] scale-[1.01]';
                              } else {
                                btnTheme = 'border-rose-500 bg-rose-950/80 ring-2 ring-rose-500 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.5)] scale-[1.01]';
                              }
                            } else if (showCorrectHighlight) {
                              btnTheme = 'border-emerald-500/70 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-400/50';
                            } else if (isActionBusy) {
                              btnTheme = 'opacity-30 border-white/5 bg-black/40 cursor-not-allowed';
                            } else if (disabledOptions.includes(optIdx)) {
                              btnTheme = 'opacity-25 border-white/5 bg-black cursor-not-allowed';
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={isDisabled}
                                onClick={() => handleSelectAnswer(optIdx)}
                                className={`p-2.5 sm:p-3 rounded-xl border-2 text-left transition flex items-start gap-2.5 min-h-[58px] sm:min-h-[64px] ${btnTheme}`}
                              >
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono shrink-0 mt-0.5 ${
                                  isSelected
                                    ? selectedAnswer.isCorrect ? 'bg-emerald-500 text-black font-black' : 'bg-rose-500 text-white font-black'
                                    : 'bg-emerald-500/20 text-emerald-300'
                                }`}>
                                  {['A', 'B', 'C', 'D'][optIdx]}
                                </span>
                                <BattleOptionContent opt={opt} />
                                {isSelected && (
                                  <span className="shrink-0 text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-black/60 border border-white/20 mt-0.5">
                                    {selectedAnswer.isCorrect ? '✓ TEPAT!' : '✗ SALAH'}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ── SUB-MENU BAG: ITEM TAS MASISIR (5 KOLEKSI) ── */}
                    {battleMenu === 'bag' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-amber-400 font-bold px-1">
                          <span className="flex items-center gap-1.5">
                            <span><PixelIcon name="bag" className="w-[1.15em] h-[1.15em]" /></span>
                            <span>TAS MASISIR (PILIH ITEM BANTUAN KHUSUS):</span>
                          </span>
                          <button
                            onClick={() => { setBattleMenu('main'); sfx.playBip(440); }}
                            className="text-white/60 hover:text-white underline text-[11px]"
                          >
                            [ Kembali ]
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                          {/* 1. Teh Mint */}
                          <button
                            disabled={bag.tea <= 0}
                            onClick={() => handleUseItem('tea')}
                            className="p-3 rounded-xl border-2 border-emerald-500/30 bg-[#121c16] hover:border-emerald-400 disabled:opacity-35 text-left transition flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <PixelIcon name="potion" className="w-7 h-7" />
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-emerald-300">x{bag.tea}</span>
                              </div>
                              <div className="text-xs font-bold text-white truncate">Syay bil Na'na'</div>
                              <p className="text-[10px] text-white/50 leading-tight mt-0.5">Pulihkan +35 HP seketika.</p>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-semibold mt-2">Gunakan ➔</span>
                          </button>

                          {/* 2. Ahwah Mazbut */}
                          <button
                            disabled={bag.ahwah <= 0 || defenseShield}
                            onClick={() => handleUseItem('ahwah')}
                            className="p-3 rounded-xl border-2 border-cyan-500/30 bg-[#0e1920] hover:border-cyan-400 disabled:opacity-35 text-left transition flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <PixelIcon name="mug" className="w-7 h-7" />
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-cyan-300">x{bag.ahwah}</span>
                              </div>
                              <div className="text-xs font-bold text-white truncate">Ahwah Mazbut</div>
                              <p className="text-[10px] text-white/50 leading-tight mt-0.5">Tameng Difa' (-50% DMG).</p>
                            </div>
                            <span className="text-[10px] text-cyan-400 font-semibold mt-2">{defenseShield ? 'Aktif ✓' : 'Gunakan ➔'}</span>
                          </button>

                          {/* 3. Khulashah 50:50 */}
                          <button
                            disabled={bag.summary <= 0}
                            onClick={() => handleUseItem('summary')}
                            className="p-3 rounded-xl border-2 border-amber-500/30 bg-[#1c1812] hover:border-amber-400 disabled:opacity-35 text-left transition flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <PixelIcon name="scroll" className="w-7 h-7" />
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-amber-300">x{bag.summary}</span>
                              </div>
                              <div className="text-xs font-bold text-white truncate">Khulashah 50:50</div>
                              <p className="text-[10px] text-white/50 leading-tight mt-0.5">Buang 2 opsi salah.</p>
                            </div>
                            <span className="text-[10px] text-amber-400 font-semibold mt-2">Gunakan ➔</span>
                          </button>

                          {/* 4. Qamus */}
                          <button
                            disabled={bag.qamus <= 0}
                            onClick={() => handleUseItem('qamus')}
                            className="p-3 rounded-xl border-2 border-blue-500/30 bg-[#12171c] hover:border-blue-400 disabled:opacity-35 text-left transition flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <PixelIcon name="book" className="w-7 h-7" />
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-blue-300">x{bag.qamus}</span>
                              </div>
                              <div className="text-xs font-bold text-white truncate">Qamus Munawwir</div>
                              <p className="text-[10px] text-white/50 leading-tight mt-0.5">Bocorkan isyarah kunci.</p>
                            </div>
                            <span className="text-[10px] text-blue-400 font-semibold mt-2">Gunakan ➔</span>
                          </button>

                          {/* 5. Kurrasah Ad-Duf'ah (Safe Skip) */}
                          <button
                            disabled={bag.kurrasah <= 0}
                            onClick={() => handleUseItem('kurrasah')}
                            className="p-3 rounded-xl border-2 border-rose-500/30 bg-[#201014] hover:border-rose-400 disabled:opacity-35 text-left transition flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <PixelIcon name="quill" className="w-7 h-7" />
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-rose-300">x{bag.kurrasah}</span>
                              </div>
                              <div className="text-xs font-bold text-white truncate">Kurrasah Duf'ah</div>
                              <p className="text-[10px] text-white/50 leading-tight mt-0.5">Rukhshah Lewati Soal.</p>
                            </div>
                            <span className="text-[10px] text-rose-400 font-semibold mt-2">Gunakan ➔</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── MAIN MENU: 4 KOTAK KLASIK POKÉMON (MINECRAFT VS RETRO) ── */}
                    {battleMenu === 'main' && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {/* 1. FIGHT */}
                        <button
                          onClick={() => { setBattleMenu('fight'); sfx.playBip(580); }}
                          className={`p-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition ${
                            battleStyle === 'minecraft'
                              ? 'bg-gradient-to-b from-[#243328] to-[#121c15] border-t-2 border-l-2 border-emerald-400/60 border-b-2 border-r-2 border-black text-emerald-200 hover:brightness-125'
                              : 'border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-600/30 to-[#122218] hover:border-emerald-400 hover:brightness-110 text-white'
                          }`}
                        >
                          <PixelIcon name="sword" className="w-4 h-4 text-emerald-400" />
                          <span>FIGHT (Jawab)</span>
                        </button>

                        {/* 2. BAG */}
                        <button
                          onClick={() => { setBattleMenu('bag'); sfx.playBip(520); }}
                          className={`p-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition ${
                            battleStyle === 'minecraft'
                              ? 'bg-gradient-to-b from-[#332e24] to-[#1c1812] border-t-2 border-l-2 border-amber-400/60 border-b-2 border-r-2 border-black text-amber-200 hover:brightness-125'
                              : 'border-2 border-amber-500/40 bg-gradient-to-br from-amber-600/30 to-[#221c12] hover:border-amber-400 hover:brightness-110 text-white'
                          }`}
                        >
                          <span><PixelIcon name="bag" className="w-[1.15em] h-[1.15em]" /></span>
                          <span>BAG (Tas Kitab)</span>
                        </button>

                        {/* 3. TALQEEH AI (HALAQAH) */}
                        <button
                          onClick={() => {
                            sfx.playBip(480);
                            openAiHalaqah();
                          }}
                          className={`p-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition ${
                            battleStyle === 'minecraft'
                              ? 'bg-gradient-to-b from-[#302433] to-[#1a121c] border-t-2 border-l-2 border-purple-400/60 border-b-2 border-r-2 border-black text-purple-200 hover:brightness-125'
                              : 'border-2 border-purple-500/40 bg-gradient-to-br from-purple-600/30 to-[#1c1222] hover:border-purple-400 hover:brightness-110 text-white'
                          }`}
                        >
                          <PixelIcon name="sparkle" className="w-4 h-4 text-purple-400" />
                          <span>AI HALAQAH</span>
                        </button>

                        {/* 4. RUN */}
                        <button
                          onClick={() => {
                            if (confirm('Kembali ke Ruang Muthola\'ah untuk membaca materi lagi?')) {
                              sfx.playBip(380);
                              setPhase('study');
                            }
                          }}
                          className={`p-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition ${
                            battleStyle === 'minecraft'
                              ? 'bg-gradient-to-b from-[#2b2b2e] to-[#151518] border-t-2 border-l-2 border-white/30 border-b-2 border-r-2 border-black text-white hover:brightness-125'
                              : 'border-2 border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10 text-white'
                          }`}
                        >
                          <span><PixelIcon name="boots" className="w-[1.15em] h-[1.15em]" /></span>
                          <span>RUN (Muroja'ah)</span>
                        </button>
                      </div>
                    )}
                  </>
                )}

              </div>
            </div>
            </ArenaPortal>
          </div>
        )}

        {/* =========================================================================
            FASE 3: HASIL PERTARUNGAN (VICTORY / DEFEAT)
            ========================================================================= */}
        {/* =========================================================================
            FASE 3: HASIL PERTARUNGAN (VICTORY / DEFEAT)
            ========================================================================= */}
        {phase === 'victory' && (() => {
          const isFinal = activeStage ? activeStage.isFinal : true;
          const stageStars = playerHp >= 80 ? 3 : playerHp >= 50 ? 2 : 1;
          const stageStarsStr = '★'.repeat(stageStars);
          const stageTaqdirTitle = stageStars === 3 ? "Mumtaz (Sempurna)" : stageStars === 2 ? "Jayyid Jiddan" : "Jayyid";
          const guardianName = activeStage?.guardianName || activeSet.bossName;
          const totalStagesCount = activeSet.stages?.length || 4;
          const nextStageId = Math.min(totalStagesCount, (activeStage?.id || 1) + 1);

          const accuracyPct = Math.round(((activeQuiz.length - wrongAnswers.length) / Math.max(1, activeQuiz.length)) * 100);
          const missionsWon = (missionResult || []).filter(r => r.status === 'done').length;
          const gainedExp = (activeStage?.expReward || 75) + (streak > 0 ? streak * 10 : 0) + missionsWon * MISSION_BONUS_EXP;
          const arcadeScore = (accuracyPct * 250) + (playerHp * 50) + ((streak || 1) * 350) + (gainedExp * 10);

          // Tombol batu ala Minecraft (timbul, tanpa animasi berulang).
          const stoneBtn = 'min-h-[48px] px-4 border-2 border-black font-mono font-black text-sm tracking-wide text-white flex items-center justify-center gap-2 active:translate-y-0.5 transition hover:brightness-110';
          const stoneGray = `${stoneBtn} bg-[#6f6f73] shadow-[inset_-3px_-4px_0_#3f3f42,inset_3px_3px_0_#a9a9ad]`;
          const stoneGreen = `${stoneBtn} bg-[#3f8a2e] shadow-[inset_-3px_-4px_0_#245019,inset_3px_3px_0_#7cc964]`;
          const stoneGold = `${stoneBtn} bg-[#c9930f] text-black shadow-[inset_-3px_-4px_0_#7a5806,inset_3px_3px_0_#fde68a]`;

          return (
            <div className="relative max-w-xl mx-auto overflow-hidden select-none text-center space-y-4 sm:space-y-5 px-4 sm:px-6 pt-5 pb-5 border-4 border-[#111] bg-[#2b2b2e] shadow-[inset_-4px_-4px_0_#1a1a1c,inset_4px_4px_0_#4a4a4e,0_20px_60px_rgba(0,0,0,0.7)] animate-fadeIn">
              {/* Sinar emas berputar pelan di belakang (tanpa kedip) */}
              <div
                className="victory-rays absolute left-1/2 top-[34%] w-[720px] h-[720px] opacity-[0.10] pointer-events-none"
                style={{ background: 'repeating-conic-gradient(#fbbf24 0deg 9deg, transparent 9deg 18deg)' }}
              />

              {/* ── 1. JUDUL ── */}
              <div className="relative">
                <div className="flex items-center justify-center gap-2 font-mono text-[10px] sm:text-xs font-black tracking-[0.22em] uppercase text-amber-300">
                  <PixelIcon name={isFinal ? 'crown' : 'gate'} className="w-4 h-4 shrink-0" />
                  {/* Judul level sudah memuat "Level n:", jadi nomor level tidak ditulis dua kali. */}
                  <span className="text-white/85 truncate max-w-[70vw] sm:max-w-sm">{activeStage?.title || (isFinal ? 'Final Boss' : 'Gerbang Ilmu')}</span>
                </div>
                <h2
                  className="victory-title mt-2 font-black font-mono text-5xl sm:text-6xl tracking-[0.15em] text-[#fde047]"
                  style={{ textShadow: '4px 4px 0 #7c2d12, 0 0 28px rgba(250, 204, 21, 0.3)' }}
                >
                  {isFinal ? 'KHATAM!' : 'LULUS!'}
                </h2>
              </div>

              {/* ── 2. BINTANG: muncul satu per satu, sekali saja ── */}
              <div className="relative flex items-end justify-center gap-2 sm:gap-3 -mt-1">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className={`victory-star ${i === 2 ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-12 h-12 sm:w-14 sm:h-14'}`}
                    style={{ animationDelay: `${0.25 + i * 0.22}s` }}
                  >
                    <PixelIcon name={i <= stageStars ? 'star' : 'starEmpty'} className="w-full h-full drop-shadow-[3px_3px_0_rgba(0,0,0,0.45)]" />
                  </div>
                ))}
              </div>

              {/* ── 3. THALIB DI PODIUM BLOK RUMPUT ── */}
              <div className="relative flex flex-col items-center">
                <div className="victory-bubble relative mb-2 max-w-sm px-3 py-2 bg-[#f5f5f4] border-2 border-black text-[#1c1917] text-xs sm:text-sm font-bold leading-snug shadow-[3px_3px_0_rgba(0,0,0,0.5)]">
                  {isFinal
                    ? 'Alhamdulillah! Matan khatam, ujian tuntas — saatnya syawarma di Darrasah!'
                    : 'Tahqiq level ini tuntas! Lanjut ke gerbang ilmu berikutnya!'}
                  <span className="absolute left-1/2 -bottom-[9px] -translate-x-1/2 w-3 h-3 bg-[#f5f5f4] border-r-2 border-b-2 border-black rotate-45" />
                </div>
                <img
                  src="/assets/thalib-victory-voxel.png"
                  alt="Thalib Azhar lulus"
                  className="victory-hero relative z-10 w-36 sm:w-44 max-h-[min(15rem,28dvh)] h-auto object-contain"
                  style={{ filter: 'drop-shadow(0 8px 0 rgba(0,0,0,0.35))' }}
                />
                <div className="relative -mt-3 w-40 sm:w-48">
                  <div className="h-3 bg-[#5fa83b] border-x-4 border-t-4 border-[#111]" />
                  <div className="h-7 bg-[#7a5230] border-x-4 border-b-4 border-[#111] shadow-[inset_0_6px_0_#4f9330]" />
                </div>
                <div className="mt-3">
                  <div className="font-arabic text-amber-200 text-base sm:text-lg font-bold" dir="rtl">
                    «مُمْتَازٌ مَعَ مَرْتَبَةِ الشَّرَفِ»
                  </div>
                  <div className="font-mono text-sm font-black text-amber-300 mt-0.5">{stageTaqdirTitle}</div>
                </div>
              </div>

              {/* ── 4. HADIAH (SLOT INVENTORI) ── */}
              <div className="relative mx-auto max-w-md border-4 border-[#111] bg-[#1f1f22] shadow-[inset_3px_3px_0_#3a3a3e] p-3 sm:p-4">
                <div className="flex items-center justify-between font-mono text-[11px] font-black uppercase tracking-widest text-white/70 mb-3">
                  <span>Hadiah</span>
                  <span className="text-amber-300">Skor {arcadeScore.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 justify-items-center">
                  <ItemSlot icon="exp" count={`+${gainedExp}`} label="EXP" className="victory-slot" />
                  <ItemSlot icon="star" count={stageStars} label="Bintang" className="victory-slot" />
                  <ItemSlot icon="heart" count={playerHp} label="Sisa HP" className="victory-slot" />
                  <ItemSlot icon={isFinal ? 'scroll' : 'chicken'} count={1} label={isFinal ? 'Syahadah' : 'Syawarma'} className="victory-slot" />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-[11px] text-white/65">
                  <span className="inline-flex items-center gap-1"><PixelIcon name="target" className="w-3.5 h-3.5" />Akurasi {accuracyPct}%</span>
                  <span className="inline-flex items-center gap-1"><PixelIcon name="fire" className="w-3.5 h-3.5" />Combo x{streak || 1}</span>
                </div>

                {missionResult?.length > 0 && (
                  <div className="mt-3 pt-3 border-t-2 border-[#111] grid gap-1.5 text-left">
                    <div className="font-mono text-[10px] font-black uppercase tracking-widest text-amber-300 text-center">
                      Misi Duel • {missionsWon}/{missionResult.length} tuntas (+{missionsWon * MISSION_BONUS_EXP} EXP)
                    </div>
                    {missionResult.map(({ id, status }, i) => (
                      <div
                        key={id}
                        className={`mission-reveal flex items-center gap-2 border-2 px-2.5 py-1.5 font-mono text-xs ${status === 'done' ? 'border-[#3f8a2e] bg-[#1d3317] text-emerald-100' : 'border-[#3a3a3e] bg-black/30 text-white/45'}`}
                        style={{ animationDelay: `${0.6 + i * 0.2}s` }}
                      >
                        <PixelIcon name={MISSION_DEFS[id].icon} className="w-5 h-5" />
                        <span className="flex-1 font-bold">{MISSION_DEFS[id].label}</span>
                        {status === 'done'
                          ? <span className="inline-flex items-center gap-1 text-emerald-300"><PixelIcon name="check" className="w-4 h-4" />+{MISSION_BONUS_EXP}</span>
                          : <PixelIcon name="cross" className="w-4 h-4" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── 5. TOMBOL: Peta • Ulangi • Lanjut / Klaim Syahadah ── */}
              <div className="relative grid grid-cols-[auto_auto_1fr] gap-2 sm:gap-3 max-w-md mx-auto">
                <button onClick={() => setPhase('map')} className={stoneGray} title="Kembali ke peta level">
                  <PixelIcon name="map" className="w-5 h-5" />
                  <span className="hidden sm:inline">Peta</span>
                </button>
                <button onClick={() => startBattle(activeStage)} className={stoneGray} title="Ulangi level ini">
                  <PixelIcon name="retry" className="w-5 h-5" />
                  <span className="hidden sm:inline">Ulangi</span>
                </button>
                {!isFinal ? (
                  <button
                    onClick={() => {
                      setSelectedStageId(nextStageId);
                      const nextStageObj = activeSet.stages?.find(s => s.id === nextStageId);
                      if (nextStageObj) setActiveStage(nextStageObj);
                      setPhase('map');
                    }}
                    className={stoneGreen}
                  >
                    <span>LANJUT</span>
                    <PixelIcon name="next" className="w-5 h-5" />
                  </button>
                ) : (
                  <button onClick={() => setShowSyahadahModal(true)} className={stoneGold}>
                    <PixelIcon name="scroll" className="w-5 h-5" />
                    <span>KLAIM SYAHADAH</span>
                  </button>
                )}
              </div>

              {/* ── 5. TOGGLE DETAIL ACCORDION (Syahadah, EXP Progress & Muroja'ah) ── */}
              <div className="relative z-10 pt-1">
                <button
                  onClick={() => setShowVictoryDetails(v => !v)}
                  className="px-4 py-2 border-2 border-black bg-[#3a3a3e] shadow-[inset_-2px_-3px_0_#26262a,inset_2px_2px_0_#5a5a5f] hover:brightness-110 text-white/85 font-mono text-xs font-bold transition flex items-center justify-center gap-2 mx-auto"
                >
                  <span>{showVictoryDetails ? '▲ Sembunyikan Rincian' : '▼ Buka Rincian Syahadah, EXP & Soal'}</span>
                  {wrongAnswers.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-300 text-[10px]">
                      {wrongAnswers.length} Perlu Muroja'ah
                    </span>
                  )}
                </button>
              </div>

              {/* ── 6. COLLAPSIBLE EDUCATIONAL CONTENT ── */}
              {showVictoryDetails && (
                <div className="space-y-4 pt-2 text-left animate-fadeIn">
                  {/* Chicken Dinner Lore Box */}
                  <div className="rounded-2xl border-2 border-amber-400/60 bg-gradient-to-r from-[#291b07] via-[#1a1208] to-[#120e06] p-4 shadow-xl flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-400/50 flex items-center justify-center text-3xl shrink-0 shadow-lg animate-pulse">
                      <PixelIcon name="chicken" className="w-[1.15em] h-[1.15em]" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/25 border border-amber-400/40 text-[9px] font-mono font-bold text-amber-300 uppercase tracking-wider mb-1">
                        <span><PixelIcon name="chicken" className="w-[1.15em] h-[1.15em]" /></span> RANSUM HADIAH KELULUSAN MASISIR
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        Dujaj Syawarma Darrasah & Syay bil-Na'na' Spesial
                      </h4>
                      <p className="text-[11px] text-amber-100/75 leading-relaxed">
                        Penghargaan santap malam ala santri Al-Azhar setelah menundukkan {guardianName}. Selamat menikmati lezatnya muthola'ah yang berbuah kemenangan!
                      </p>
                    </div>
                  </div>

                  {/* Rank Progression Bar */}
                  {(() => {
                    const currentRank = getThalibRank(userProgress?.totalExp || 0);
                    const exp = userProgress?.totalExp || 0;
                    const needed = currentRank.nextExp ? Math.max(0, currentRank.nextExp - exp) : 0;
                    const pct = currentRank.nextExp
                      ? Math.min(100, Math.max(8, Math.round(((exp - currentRank.minExp) / (currentRank.nextExp - currentRank.minExp)) * 100)))
                      : 100;
                    const gained = (activeStage?.expReward || 75) + (streak > 0 ? streak * 10 : 0);
                    return (
                      <div className="rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-950/40 via-[#101512] to-emerald-950/40 p-4 space-y-2 shadow-lg">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-amber-300 font-bold flex items-center gap-1.5">
                            <EmojiIcon text={currentRank.badge} className="w-6 h-6" />
                            <span>Rank: {currentRank.rankCode} • {currentRank.title}</span>
                          </span>
                          <span className="text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/40">
                            +{gained} EXP
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-black/80 rounded-full overflow-hidden border border-amber-400/30 p-[1px]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-emerald-400 to-emerald-300 transition-all duration-700 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="text-[11px] font-mono text-white/60 flex items-center justify-between">
                          <IconText text={currentRank.nextExp ? `🎯 Butuh ${needed} EXP lagi menuju ${currentRank.nextTitle}` : `🏆 Maqam Keilmuan Tertinggi Dicapai!`} iconClassName="w-4 h-4" />
                          <span className="text-amber-300 font-bold">{exp} EXP</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Syahadah Al-Azhar Showcase Card */}
                  {isFinal && (
                    <div className="rounded-2xl border-2 border-amber-400/60 bg-gradient-to-b from-[#1c180e] via-[#14120a] to-[#0d0c07] p-5 shadow-2xl space-y-3">
                      <div className="flex items-center justify-between border-b border-amber-500/30 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl"><PixelIcon name="scroll" className="w-[1.15em] h-[1.15em]" /></span>
                          <div>
                            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
                              SYAHADAH KELULUSAN RESMI
                            </span>
                            <h4 className="text-sm font-bold text-white">Syahadah Imtihan Muqarrar Al-Azhar</h4>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                          TERVERIFIKASI
                        </span>
                      </div>

                      <div className="rounded-xl border border-amber-500/30 bg-black/60 p-4 text-center space-y-2">
                        <div className="font-arabic text-amber-300 text-sm font-bold" dir="rtl">
                          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                        </div>
                        <div className="text-xs text-white/70">
                          Diberikan kepada thalib yang mulia:
                        </div>
                        <div className="text-base sm:text-lg font-bold text-amber-300 font-serif">
                          {profile?.name || 'Thalib Al-Azhar'}
                        </div>
                        <div className="text-xs text-emerald-300 font-medium">
                          {activeSet.title} • {activeSet.maddah}
                        </div>
                        <div className="inline-block px-3 py-1 rounded bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs font-mono font-bold mt-1">
                          PREDIKAT: {calculateTaqdir().title.toUpperCase()} {calculateTaqdir().stars}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        <button
                          onClick={downloadSyahadahCanvas}
                          className="flex-1 btn bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 active:scale-95"
                        >
                          <PixelIcon name="scroll" className="w-4 h-4 text-black" />
                          <span>Unduh Syahadah (PNG)</span>
                        </button>
                        <button
                          onClick={() => setShowSyahadahModal(true)}
                          className="btn border border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                        >
                          <span><PixelIcon name="eye" className="w-[1.15em] h-[1.15em]" /></span>
                          <span>Lihat Format Penuh</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Wrong Answers Muroja'ah */}
                  {wrongAnswers.length > 0 && (
                    <div className="text-left rounded-xl border border-white/10 bg-white/5 p-4 max-h-56 overflow-y-auto space-y-3 text-xs">
                      <div className="font-bold text-white/90 border-b border-white/10 pb-1.5 flex items-center justify-between">
                        <span>Muroja'ah Soal yang Sempat Keliru ({wrongAnswers.length}):</span>
                        <span className="text-[10px] text-amber-300 font-mono">Format Ujian</span>
                      </div>
                      {wrongAnswers.map((w, i) => (
                        <div key={i} className="space-y-2 p-3 rounded-xl bg-black/50 border border-white/10">
                          <div className="text-white/90 font-medium">
                            <span className="text-emerald-400 font-mono mr-1.5">#{i + 1}</span>
                            <SmartText text={w.question} />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                            <div className="p-2 rounded bg-rose-950/40 border border-rose-500/20 text-rose-300">
                              <span className="text-[10px] font-bold uppercase block text-rose-400 font-mono">✗ Pilihanmu:</span>
                              <SmartText text={w.chosen} />
                            </div>
                            <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/20 text-emerald-300">
                              <span className="text-[10px] font-bold uppercase block text-emerald-400 font-mono">✓ Kunci:</span>
                              <SmartText text={w.correct} />
                            </div>
                          </div>
                          {w.examTip && (
                            <ExamTipBlock tip={w.examTip} translation={w.examTipTranslation} compact={true} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })()}

        {phase === 'defeat' && (
          <div className="relative max-w-xl mx-auto overflow-hidden px-4 sm:px-6 pt-5 pb-5 text-center space-y-5 border-4 border-[#111] bg-[#2b2b2e] shadow-[inset_-4px_-4px_0_#1a1a1c,inset_4px_4px_0_#4a4a4e,0_20px_60px_rgba(0,0,0,0.7)] animate-fadeIn">
            <h2
              className="victory-title font-black font-mono text-4xl sm:text-5xl tracking-[0.12em] text-[#fca5a5]"
              style={{ textShadow: '4px 4px 0 #7f1d1d' }}
            >
              BELUM LULUS
            </h2>
            {/* Thalib di blok tanah (tanpa kedip), dengan tiga hati: yang kosong = HP habis / soal kurang */}
            <div className="relative flex flex-col items-center">
              <div className="flex gap-1.5 mb-2">
                {[0, 1, 2].map(i => (
                  <PixelIcon key={i} name={defeatReason === 'hp' || i > 0 ? 'heartBroken' : 'heart'} className="w-7 h-7" />
                ))}
              </div>
              <img
                src="/assets/thalib-hurt-voxel.png"
                alt="Thalib Azhar belum lulus"
                className="victory-hero relative z-10 w-28 sm:w-36 max-h-[min(13rem,24dvh)] h-auto object-contain"
                style={{ filter: 'saturate(0.6) drop-shadow(0 8px 0 rgba(0,0,0,0.35))' }}
              />
              <div className="relative -mt-3 w-36 sm:w-44">
                <div className="h-8 bg-[#7a5230] border-4 border-[#111] shadow-[inset_0_5px_0_#5c3d22]" />
              </div>
            </div>

            <div>
              <span className="font-mono text-xs text-rose-300 font-black uppercase tracking-widest block mb-1">
                {defeatReason === 'boss-survived' ? 'SOAL HABIS, GUARDIAN MASIH BERDIRI!' : 'THALIB KEHABISAN HP!'}
              </span>
              {defeatReason === 'boss-survived' && (
                <p className="text-xs text-white/60 mb-2">
                  Butuh minimal {getBattleRules(activeStage, activeQuiz.length).requiredCorrect} dari {activeQuiz.length} jawaban benar untuk menumbangkan guardian (sisa HP: {bossHp}/{bossMaxHp}).
                </p>
              )}
              <div className="font-mono text-lg sm:text-xl font-black text-white mb-2">
                Taqdir: Daur Tsani (Remedial)
              </div>
              <p className="text-xs text-white/60">
                Guardian menguji kembali kefahamanmu pada materi <strong>{activeStage?.title || activeSet.title}</strong>. Muroja'ah lagi sebelum menantang imtihan ulang.
              </p>
            </div>

            {/* Review Soal yang Salah & Cara Jawab Ujian */}
            {wrongAnswers.length > 0 && (
              <div className="text-left border-4 border-[#111] bg-[#1f1f22] shadow-[inset_3px_3px_0_#3a3a3e] p-3 sm:p-4 max-h-64 overflow-y-auto space-y-3 text-xs">
                <div className="font-bold text-white/90 border-b border-white/10 pb-1.5 flex items-center justify-between">
                  <span>Tinjauan Soal & Cara Jawab di Ujian ({wrongAnswers.length} soal):</span>
                  <span className="text-[10px] text-amber-300 font-mono">Kurrasah Ijabah</span>
                </div>
                {wrongAnswers.map((w, i) => (
                  <div key={i} className="space-y-2 p-3 rounded-xl bg-black/50 border border-white/10">
                    <div className="text-white/90 font-medium">
                      <span className="text-amber-400 font-mono mr-1.5">#{i + 1}</span>
                      <SmartText text={w.question} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2 rounded bg-rose-950/40 border border-rose-500/20 text-rose-300">
                        <span className="text-[10px] font-bold uppercase block text-rose-400 font-mono">✗ Jawabanku:</span>
                        <SmartText text={w.chosen} />
                      </div>
                      <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/20 text-emerald-300">
                        <span className="text-[10px] font-bold uppercase block text-emerald-400 font-mono">✓ Kunci:</span>
                        <SmartText text={w.correct} />
                      </div>
                    </div>
                    <div className="text-xs text-white/70 italic pt-0.5">
                      <span className="text-white/40 not-italic font-mono mr-1">Ta'lil:</span>
                      <SmartText text={w.exp} />
                    </div>
                    {w.examTip && (
                      <ExamTipBlock tip={w.examTip} translation={w.examTipTranslation} compact={true} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tombol Rematch & Belajar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-1">
              <button
                onClick={() => startBattle(activeStage)}
                className="min-h-[48px] px-4 border-2 border-black font-mono font-black text-sm text-white flex items-center justify-center gap-2 bg-[#3f8a2e] shadow-[inset_-3px_-4px_0_#245019,inset_3px_3px_0_#7cc964] active:translate-y-0.5 hover:brightness-110 transition"
              >
                <span><PixelIcon name="sword" className="w-[1.15em] h-[1.15em]" /></span>
                <span>Coba Lagi</span>
              </button>

              <button
                onClick={() => setPhase('map')}
                className="min-h-[48px] px-4 border-2 border-black font-mono font-black text-sm text-white flex items-center justify-center gap-2 bg-[#6f6f73] shadow-[inset_-3px_-4px_0_#3f3f42,inset_3px_3px_0_#a9a9ad] active:translate-y-0.5 hover:brightness-110 transition"
              >
                <span><PixelIcon name="map" className="w-[1.15em] h-[1.15em]" /></span>
                <span>Peta Level</span>
              </button>

              <button
                onClick={() => setPhase('study')}
                className="min-h-[48px] px-4 border-2 border-black font-mono font-black text-sm text-white flex items-center justify-center gap-2 bg-[#6f6f73] shadow-[inset_-3px_-4px_0_#3f3f42,inset_3px_3px_0_#a9a9ad] active:translate-y-0.5 hover:brightness-110 transition"
              >
                <PixelIcon name="book" className="w-[1.15em] h-[1.15em]" />
                <span>Muthola'ah</span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 1: INTERACTIVE HALAQAH TALQEEH AI SYAIKH
            ========================================================================= */}
        {showAiModal && (
          <ArenaPortal active speed={battleSpeed} z={10000}>
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-2xl bg-[#0e120f] border-2 border-emerald-500/50 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
              {/* Header Halaqah */}
              <div className="p-4 sm:p-5 border-b border-emerald-500/30 bg-gradient-to-r from-[#142219] to-[#0c1510] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-500/20 border-2 border-emerald-400/60 flex items-center justify-center overflow-hidden shadow-md">
                    <img src="/assets/npc-musaid-voxel.png" alt="Syaikh" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm sm:text-base">Halaqah Syaikh AI Talqeeh</h3>
                      <span className="font-arabic text-xs text-emerald-300" dir="rtl">رِوَاقُ الْمَشَايِخ</span>
                    </div>
                    <p className="text-[11px] text-emerald-300/80 font-mono">
                      Bimbingan Pedagogi Manhaji Muqarrar Al-Azhar
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAiModal(false)}
                  className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition"
                  title="Tutup"
                >
                  <PixelIcon name="cross" className="w-5 h-5" />
                </button>
              </div>

              {/* Ringkasan Soal yang Sedang Dibahas */}
              <div className="px-4 py-2.5 bg-black/60 border-b border-white/10 flex items-start gap-2.5 text-xs">
                <span className="font-mono text-emerald-400 font-bold shrink-0">SOAL #{currentQ + 1}:</span>
                <div className="text-white/80 line-clamp-2">
                  <SmartText text={activeQuiz[currentQ]?.question} isArabicLarge={false} />
                </div>
              </div>

              {/* Chat Conversation Log */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-gradient-to-b from-[#0a0f0c] to-[#070b09]">
                {aiChatLog.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2.5 ${msg.role === 'thalib' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'syaikh' && (
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center overflow-hidden shrink-0 mt-0.5">
                        <img src="/assets/npc-musaid-voxel.png" alt="" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                        msg.role === 'thalib'
                          ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-tr-none shadow-md'
                          : 'bg-[#152019] border border-emerald-500/30 text-emerald-50 rounded-tl-none shadow-lg'
                      }`}
                    >
                      {msg.role === 'syaikh' && (
                        <div className="text-[10px] font-mono font-bold text-emerald-300 uppercase mb-1">
                          {msg.note ? 'Syaikh Talqeeh (jawaban otomatis):' : 'Syaikh AI Talqeeh:'}
                        </div>
                      )}
                      <div className="whitespace-pre-line">
                        <SmartText text={msg.text} isArabicLarge={true} />
                      </div>
                      {msg.note && (
                        <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-white/50 font-mono leading-snug">{msg.note}</div>
                      )}
                    </div>
                    {msg.role === 'thalib' && (
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/50 flex items-center justify-center overflow-hidden shrink-0 mt-0.5">
                        <img src="/assets/thalib-voxel-facing-right.png" alt="" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                ))}
                {aiBusy && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center overflow-hidden shrink-0"><img src="/assets/npc-musaid-voxel.png" alt="" className="w-full h-full object-contain" /></div>
                    <div className="rounded-2xl rounded-tl-none bg-[#152019] border border-emerald-500/30 px-3.5 py-2.5 text-xs font-mono text-emerald-300 animate-pulse">
                      Syaikh sedang menulis jawaban...
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Pedagogical Chips */}
              <div className="p-3 bg-[#0a0f0c] border-t border-white/10 space-y-2">
                <div className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
                  Pertanyaan Cepat Halaqah:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => askAiSyaikh('hint')}
                    disabled={aiBusy}
                    className="px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-mono transition"
                  >
                    <PixelIcon name="search" className="w-[1.15em] h-[1.15em]" /> Petunjuk / Isyarah Soal
                  </button>
                  <button
                    onClick={() => askAiSyaikh('explanation')}
                    disabled={aiBusy}
                    className="px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-mono transition"
                  >
                    <PixelIcon name="book" className="w-[1.15em] h-[1.15em]" /> Kaidah Pokok Matan
                  </button>
                  <button
                    onClick={() => askAiSyaikh('exam')}
                    disabled={aiBusy}
                    className="px-2.5 py-1 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-mono transition"
                  >
                    <PixelIcon name="quill" className="w-[1.15em] h-[1.15em]" /> Rumus Kurrasah Ijabah
                  </button>
                  <button
                    onClick={() => askAiSyaikh('diff')}
                    disabled={aiBusy}
                    className="px-2.5 py-1 rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs font-mono transition"
                  >
                    <PixelIcon name="scale" className="w-[1.15em] h-[1.15em]" /> Perbedaan Antar Opsi
                  </button>
                </div>

                {/* Custom Question Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (aiCustomInput.trim()) askAiSyaikh('custom', aiCustomInput);
                  }}
                  className="flex gap-2 pt-1"
                >
                  <input
                    type="text"
                    value={aiCustomInput}
                    onChange={(e) => setAiCustomInput(e.target.value)}
                    placeholder="Ajukan kemusykilanmu kepada Syaikh..."
                    className="flex-1 min-w-0 bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-base sm:text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={!aiCustomInput.trim() || aiBusy}
                    className="btn bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-bold text-xs px-4 py-2 rounded-xl transition"
                  >
                    Tanya
                  </button>
                </form>
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-white/10 bg-[#090d0b] flex items-center justify-between">
                <span className="text-[11px] text-white/40 font-mono">
                  Syaikh memberi bimbingan ta'lil tanpa merusak tantangan duel.
                </span>
                <button
                  onClick={() => setShowAiModal(false)}
                  className="btn bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition"
                >
                  Kembali Bertarung <PixelIcon name="sword" className="w-4 h-4 inline-block align-[-3px]" />
                </button>
              </div>
            </div>
          </div>
          </ArenaPortal>
        )}

        {/* =========================================================================
            MODAL 2: SYAHADAH AL-AZHAR DIGITAL PREVIEW & DOWNLOAD
            ========================================================================= */}
        {showSyahadahModal && (
          <ArenaPortal active speed={battleSpeed} z={10000}>
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-3xl bg-[#0a120d] border-4 border-amber-500/50 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-amber-500/30 bg-[#121c15] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PixelIcon name="scroll" className="w-7 h-7" />
                  <h3 className="font-bold text-amber-300 text-sm sm:text-base font-serif">
                    Pratinjau Syahadah Imtihan Al-Azhar
                  </h3>
                </div>
                <button
                  onClick={() => setShowSyahadahModal(false)}
                  className="p-1 rounded-lg border border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition"
                >
                  <PixelIcon name="cross" className="w-5 h-5" />
                </button>
              </div>

              {/* Certificate Canvas Representation */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-gradient-to-b from-[#08100a] via-[#0d1810] to-[#070d08] text-center space-y-4 relative border-4 border-double border-amber-400/40 m-4 rounded-xl">
                <div className="font-arabic text-amber-200 text-lg sm:text-2xl font-bold tracking-wide" dir="rtl">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </div>
                <div className="font-serif text-lg sm:text-xl font-bold text-emerald-300 tracking-wider">
                  شَهَادَةُ إِتْمَامِ سَاحَةِ الِامْتِحَانِ
                </div>
                <div className="text-[11px] font-mono tracking-widest text-white/50">
                  TALQEEH • ARENA IMTIHAN — SERTIFIKAT LATIHAN
                </div>

                <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto my-3" />

                <p className="text-xs sm:text-sm text-white/80 font-serif">
                  Berdasarkan hasil Arena Imtihan, Talqeeh mencatat bahwa:
                </p>

                <div className="text-xl sm:text-3xl font-extrabold text-amber-300 font-serif tracking-wide">
                  {profile?.name || 'Thalib Al-Azhar'}
                </div>

                <p className="text-xs sm:text-sm text-white/80 font-serif">
                  Telah berhasil menuntaskan dan menguasai materi muqarrar:
                </p>

                <div className="text-base sm:text-lg font-bold text-emerald-300">
                  {activeSet.title}
                </div>
                <div className="text-xs text-white/60 font-mono">
                  ({activeSet.maddah})
                </div>

                <div className="inline-block px-5 py-2 rounded-xl bg-emerald-950/70 border-2 border-emerald-400/50 shadow-lg mt-3">
                  <div className="text-xs sm:text-sm font-mono font-bold text-amber-300 tracking-wider">
                    PREDIKAT: {calculateTaqdir().title.toUpperCase()} {calculateTaqdir().stars}
                  </div>
                </div>

                <div className="pt-6 flex items-center justify-between text-xs text-white/60 border-t border-amber-500/20 font-serif">
                  <div className="text-left">
                    <div>Kairo, Mesir</div>
                    <div className="font-mono text-[10px] text-white/40">{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                  <div className="w-20 h-20 rounded-full border-2 border-rose-500/80 flex flex-col items-center justify-center text-rose-400 font-bold font-mono text-[9px] leading-tight rotate-[-6deg]">
                    <span>مَرْكَز تَلْقِيح</span>
                    <span>تَدْرِيب</span>
                    <span>2026</span>
                  </div>
                  <div className="text-right">
                    <div>Kode Sertifikat:</div>
                    <div className="font-mono text-[10px] text-amber-300">TLQ-{Date.now().toString().slice(-6)}</div>
                  </div>
                </div>
                <p className="text-[10px] text-white/40 font-mono pt-2">
                  Sertifikat latihan dari game Arena Imtihan Talqeeh — bukan ijazah atau sertifikat resmi Universitas Al-Azhar.
                </p>
              </div>

              {/* Action Footer */}
              <div className="p-4 border-t border-amber-500/30 bg-[#0e1711] flex items-center justify-between">
                <button
                  onClick={() => setShowSyahadahModal(false)}
                  className="btn border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs px-4 py-2 rounded-xl"
                >
                  Tutup
                </button>
                <button
                  onClick={downloadSyahadahCanvas}
                  className="btn bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-110 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2"
                >
                  <PixelIcon name="scroll" className="w-4 h-4 text-black" />
                  <span>Unduh File PNG Resolusi Tinggi (1200x800)</span>
                </button>
              </div>
            </div>
          </div>
          </ArenaPortal>
        )}

        {/* =========================================================================
            MODAL 3: PETI HIKMAH AL-AZHAR (HADIAH HARIAN & KALAM ULAMA)
            ========================================================================= */}
        {showLootChestModal && claimedLoot && (
          <ArenaPortal active speed={battleSpeed} z={10000}>
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-xl bg-[#141418] border-4 border-t-[#d97706] border-l-[#d97706] border-b-[#451a03] border-r-[#451a03] shadow-[8px_8px_0_#000] relative flex flex-col overflow-hidden font-mono">
              {/* Gold Stud Corner Accents */}
              <div className="absolute top-1.5 left-1.5 w-3 h-3 bg-amber-400 border border-black z-30" />
              <div className="absolute top-1.5 right-1.5 w-3 h-3 bg-amber-400 border border-black z-30" />
              <div className="absolute bottom-1.5 left-1.5 w-3 h-3 bg-amber-400 border border-black z-30" />
              <div className="absolute bottom-1.5 right-1.5 w-3 h-3 bg-amber-400 border border-black z-30" />

              {/* Header Plaque */}
              <div className="p-4 bg-[#2b1b0e] border-b-2 border-[#5a381c] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-bounce"><PixelIcon name="gift" className="w-[1.15em] h-[1.15em]" /></span>
                  <div>
                    <h3 className="font-bold text-amber-300 text-sm sm:text-base tracking-wide drop-shadow-[1px_1px_0_#000]">
                      PETI HIKMAH AL-AZHAR TERBUKA!
                    </h3>
                    <span className="text-[10px] text-amber-200/70 block">
                      Berkah Muthola'ah & Hadiah Harian Thalib
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowLootChestModal(false)}
                  className="px-2 py-1 bg-[#1a1108] border-2 border-stone-600 text-stone-300 hover:text-white text-xs font-mono font-bold shadow-[1px_1px_0_#000]"
                >
                  ✕
                </button>
              </div>

              {/* Body: Loot Rewards */}
              <div className="p-5 sm:p-6 space-y-4 bg-[#121216]">
                {/* Rewards Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Reward 1: EXP */}
                  <div className="p-3 bg-[#181820] border-2 border-t-[#000] border-l-[#000] border-b-[#3f3f46] border-r-[#3f3f46] shadow-inner text-center">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Bonus Pengalaman</span>
                    <div className="text-base sm:text-lg font-black text-amber-300 flex items-center justify-center gap-1.5 mt-0.5 drop-shadow-[1px_1px_0_#000]">
                      <span><PixelIcon name="bolt" className="w-[1.15em] h-[1.15em]" /></span>
                      <span>+50 EXP</span>
                    </div>
                  </div>

                  {/* Reward 2: Item */}
                  <div className="p-3 bg-[#181820] border-2 border-t-[#000] border-l-[#000] border-b-[#3f3f46] border-r-[#3f3f46] shadow-inner text-center">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Item Masisir Masuk Tas</span>
                    <div className="text-xs sm:text-sm font-black text-emerald-300 flex items-center justify-center gap-1.5 mt-0.5 truncate drop-shadow-[1px_1px_0_#000]">
                      <span>{claimedLoot.itemReward.icon}</span>
                      <span className="truncate">{claimedLoot.itemReward.name}</span>
                    </div>
                    <span className="text-[9px] text-emerald-400/80 block mt-0.5">{claimedLoot.itemReward.desc}</span>
                  </div>
                </div>

                {/* Kalam Hikmah Ulama Codex Card */}
                <div className="p-4 sm:p-5 bg-[#1e1710] border-2 border-[#5c3a1e] shadow-[2px_2px_0_#000] relative">
                  <div className="flex items-center justify-between border-b border-[#4a2e18] pb-2 mb-3">
                    <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
                      <span><PixelIcon name="scroll" className="w-[1.15em] h-[1.15em]" /></span>
                      <span>MUTIARA KALAM ULAMA AZHAR</span>
                    </span>
                    <span className="text-[9px] text-amber-200/60 font-sans">Tahqiq & Barakah</span>
                  </div>

                  {/* Arabic Syi'ir / Kalam */}
                  <div className="font-arabic text-base sm:text-lg text-amber-200 leading-loose text-center py-2" dir="rtl">
                    {claimedLoot.arabic}
                  </div>

                  {/* Meaning */}
                  <p className="text-xs sm:text-sm text-stone-300 italic text-center font-sans leading-relaxed pt-2 border-t border-[#4a2e18]/80">
                    "{claimedLoot.meaning}"
                  </p>

                  <div className="mt-3 pt-2 text-right">
                    <span className="text-xs font-bold text-amber-400 block font-serif">— {claimedLoot.author}</span>
                    <span className="text-[10px] text-stone-400 block font-mono">{claimedLoot.role}</span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-4 bg-[#181820] border-t-2 border-stone-700 flex justify-end">
                <button
                  onClick={() => {
                    sfx.playStep();
                    setShowLootChestModal(false);
                  }}
                  className="w-full sm:w-auto border-t-2 border-l-2 border-[#5fd481] border-b-4 border-r-4 border-[#134221] bg-[#2e8a4a] hover:bg-[#349e54] active:border-b-2 active:border-r-2 active:translate-y-0.5 text-white font-mono font-black text-xs sm:text-sm px-6 py-2.5 shadow-[2px_2px_0_#000] transition flex items-center justify-center gap-2"
                >
                  <span>ALHAMDULILLAH, AMBIL BERKAH! ➔</span>
                </button>
              </div>
            </div>
          </div>
          </ArenaPortal>
        )}

      </main>

      {/* ── BATTLE SYSTEM CSS KEYFRAME ANIMATIONS ── */}
      <style>{`
        /* Idle = bernapas: tubuh sedikit memanjang dari pijakan, kaki tidak pernah lepas dari lantai. */
        @keyframes playerIdle {
          0%, 100% { transform: scale(1, 1); }
          50% { transform: scale(0.992, 1.018); }
        }
        @keyframes bossFloat {
          0%, 100% { transform: scale(1, 1); }
          50% { transform: scale(0.99, 1.022); }
        }
        @keyframes shadowPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(0.85); opacity: 0.35; }
        }
        @keyframes bossHurt {
          0% { transform: translate(0, 0) scale(1); filter: brightness(2) contrast(1.5); }
          15% { transform: translate(-8px, -4px) scale(0.95); }
          30% { transform: translate(8px, 4px) scale(1.02); }
          45% { transform: translate(-6px, 2px); }
          60% { transform: translate(6px, -2px); }
          75% { transform: translate(-3px, 0); }
          100% { transform: translate(0, 0) scale(1); filter: none; }
        }
        @keyframes playerHurt {
          0% { transform: translate(0, 0) scale(1); filter: brightness(2) contrast(1.5); }
          15% { transform: translate(-10px, 4px) rotate(-6deg) scale(0.92); }
          30% { transform: translate(8px, -4px) rotate(4deg) scale(0.96); }
          45% { transform: translate(-6px, 2px) rotate(-3deg); }
          60% { transform: translate(6px, -2px) rotate(2deg); }
          75% { transform: translate(-3px, 1px); }
          100% { transform: translate(0, 0) scale(1) rotate(0); filter: none; }
        }
        @keyframes wingHoverLeft {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-8deg); }
        }
        @keyframes wingHoverRight {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(8deg); }
        }
        @keyframes wingFlap {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2) rotate(-14deg); }
        }
        @keyframes playerProjectile {
          0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translate(min(320px, 46vw), max(-160px, -23vw)) scale(1.35); opacity: 0.9; }
        }
        @keyframes bossProjectile {
          0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translate(max(-320px, -46vw), min(160px, 23vw)) scale(1.35); opacity: 0.9; }
        }
        @keyframes floatDamage {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          20% { transform: translateY(-16px) scale(1.3); opacity: 1; }
          75% { transform: translateY(-38px) scale(1.05); opacity: 1; }
          100% { transform: translateY(-56px) scale(0.85); opacity: 0; }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes balanceTilt {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-10deg); }
        }
        @keyframes bookLevitate {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5px) scale(1.08); }
        }
        @keyframes tasselFlick {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(20deg); }
        }
        @keyframes screenShake {
          0% { transform: translate(0, 0); }
          15% { transform: translate(-7px, 5px) rotate(-0.5deg); }
          30% { transform: translate(7px, -5px) rotate(0.5deg); }
          45% { transform: translate(-5px, -3px); }
          60% { transform: translate(5px, 3px); }
          75% { transform: translate(-3px, 1px); }
          90% { transform: translate(3px, -1px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes slashX1 {
          0% { transform: rotate(45deg) scaleX(0); opacity: 0; }
          25% { transform: rotate(45deg) scaleX(1.4); opacity: 1; filter: brightness(2); }
          60% { transform: rotate(45deg) scaleX(1.1); opacity: 0.9; }
          100% { transform: rotate(45deg) scaleX(1.5); opacity: 0; }
        }
        @keyframes slashX2 {
          0% { transform: rotate(-45deg) scaleX(0); opacity: 0; }
          25% { transform: rotate(-45deg) scaleX(1.4); opacity: 1; filter: brightness(2); }
          60% { transform: rotate(-45deg) scaleX(1.1); opacity: 0.9; }
          100% { transform: rotate(-45deg) scaleX(1.5); opacity: 0; }
        }
        @keyframes impactRing {
          0% { transform: scale(0.2); opacity: 1; }
          50% { opacity: 0.85; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes sparkBurst {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          35% { transform: scale(1.5) rotate(45deg); opacity: 1; }
          100% { transform: scale(2) rotate(90deg); opacity: 0; }
        }
        @keyframes lightningStrike {
          0% { transform: translateY(-70px) scaleY(0); opacity: 0; filter: brightness(3); }
          20% { transform: translateY(0) scaleY(1.1); opacity: 1; filter: brightness(2.5); }
          40% { opacity: 0.2; }
          60% { opacity: 1; filter: brightness(2); }
          80% { opacity: 0.5; }
          100% { transform: translateY(0) scaleY(1); opacity: 0; }
        }
        @keyframes pillarCrash {
          0% { transform: translateY(-120px) scaleY(0.2); opacity: 0; }
          25% { transform: translateY(0) scaleY(1.1); opacity: 1; }
          45% { transform: translateY(-6px) scaleY(0.98); opacity: 1; }
          75% { opacity: 0.9; }
          100% { transform: translateY(0) scale(1); opacity: 0; }
        }

        @keyframes attackBannerSlide {
          0% { transform: translateX(90px); opacity: 0; }
          65% { transform: translateX(-8px); opacity: 1; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes chargeHero {
          0% { transform: scale(0.9) translateX(-40px); opacity: 0; }
          65% { transform: scale(1.05) translateX(6px); opacity: 1; }
          100% { transform: scale(1) translateX(0); opacity: 1; }
        }
        @keyframes speedlineRun {
          0% { background-position: 0 0; }
          100% { background-position: 240px 0; }
        }
        @keyframes critNumberBounce {
          0% { transform: scale(0.2); opacity: 0; }
          50% { transform: scale(1.3); opacity: 1; }
          75% { transform: scale(0.95); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes strikeFlash {
          0% { opacity: 0.95; }
          100% { opacity: 0; }
        }
        @keyframes hurtBoxPop {
          0% { transform: scale(0.85) translateY(24px); opacity: 0; }
          65% { transform: scale(1.02) translateY(-2px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes hurtTremble {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-3px, 2px) rotate(-1.5deg); }
          40% { transform: translate(3px, -2px) rotate(1.5deg); }
          60% { transform: translate(-2px, -1px); }
          80% { transform: translate(2px, 1px); }
        }

        @keyframes missionToast {
          0% { transform: translateY(-16px) scale(0.9); opacity: 0; }
          12% { transform: translateY(0) scale(1.06); opacity: 1; }
          20% { transform: scale(1); }
          85% { opacity: 1; }
          100% { transform: translateY(-8px); opacity: 0; }
        }
        .mission-toast { animation: missionToast 2.6s ease-out forwards; }
        @keyframes missionReveal { from { transform: translateX(-12px); opacity: 0; } to { transform: none; opacity: 1; } }
        .mission-reveal { animation: missionReveal 0.4s ease-out both; }

        /* ── Layar menang: semua animasi sekali jalan (tidak ada kedip/pulse berulang) ── */
        @keyframes victoryRays { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
        .victory-rays { transform: translate(-50%, -50%); animation: victoryRays 60s linear infinite; }
        @keyframes victoryTitle { 0% { transform: scale(2.4); opacity: 0; } 55% { transform: scale(0.94); opacity: 1; } 75% { transform: scale(1.04); } 100% { transform: scale(1); opacity: 1; } }
        .victory-title { animation: victoryTitle 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s both; }
        @keyframes victoryStar { 0% { transform: scale(0) rotate(-30deg); opacity: 0; } 60% { transform: scale(1.25) rotate(6deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
        .victory-star { animation: victoryStar 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        @keyframes victoryHero { 0% { transform: translateY(40px); opacity: 0; } 60% { transform: translateY(-10px); opacity: 1; } 100% { transform: translateY(0); opacity: 1; } }
        .victory-hero { animation: victoryHero 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both; }
        .victory-bubble { animation: vsUp 0.4s ease-out 0.7s both; }
        .victory-slot { animation: missionReveal 0.35s ease-out both; }
        .victory-slot:nth-child(1) { animation-delay: 0.9s; }
        .victory-slot:nth-child(2) { animation-delay: 1.0s; }
        .victory-slot:nth-child(3) { animation-delay: 1.1s; }
        .victory-slot:nth-child(4) { animation-delay: 1.2s; }

        @keyframes vsLeft { from { transform: translateX(-120%); opacity: 0; } to { transform: none; opacity: 1; } }
        @keyframes vsRight { from { transform: translateX(120%); opacity: 0; } to { transform: none; opacity: 1; } }
        @keyframes vsSlam {
          0% { transform: scale(3) rotate(-8deg); opacity: 0; }
          60% { transform: scale(0.9) rotate(2deg); opacity: 1; }
          80% { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes vsUp { from { transform: translateY(14px); opacity: 0; } to { transform: none; opacity: 1; } }
        .duel-intro { animation: battleFadeIn 0.25s ease-out; }
        .vs-banner { animation: vsUp 0.4s ease-out both; }
        .vs-left { animation: vsLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
        .vs-right { animation: vsRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
        .vs-slam { animation: vsSlam 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.45s both; }
        .vs-missions { animation: vsUp 0.4s ease-out 0.8s both; }

        /* Penguji tidak "jatuh": ia bercahaya (mengakui jawaban) lalu memudar dengan hormat. */
        @keyframes bossKo {
          0% { transform: none; filter: none; opacity: 1; }
          35% { transform: translateY(-4px); filter: brightness(1.8) drop-shadow(0 0 24px rgba(251, 191, 36, 0.9)); opacity: 1; }
          100% { transform: translateY(-10px) scale(0.96); filter: brightness(2.2) drop-shadow(0 0 40px rgba(251, 191, 36, 0.6)); opacity: 0; }
        }
        .boss-ko { animation: bossKo 1.1s cubic-bezier(0.5, 0, 0.75, 0) forwards; }
        @keyframes koSlam {
          0% { transform: scale(4); opacity: 0; }
          40% { transform: scale(0.92); opacity: 1; }
          60% { transform: scale(1.06); }
          100% { transform: scale(1); opacity: 1; }
        }
        .ko-slam { animation: koSlam 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.25s both; }
        @keyframes koConfetti {
          from { transform: translateY(0) rotate(0deg); }
          to { transform: translateY(110vh) rotate(720deg); }
        }
        .ko-confetti { animation-name: koConfetti; animation-timing-function: cubic-bezier(0.3, 0.6, 0.6, 1); animation-fill-mode: both; }

        @keyframes bossEnraged {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.55)); transform: translateX(0); }
          50% { filter: drop-shadow(0 0 26px rgba(239, 68, 68, 0.95)); transform: translateX(-2px); }
        }
        .boss-enraged { animation: bossEnraged 0.9s ease-in-out infinite; }

        @keyframes comboFlame { from { transform: scaleY(0.85); opacity: 0.7; } to { transform: scaleY(1.2); opacity: 1; } }
        .combo-aura::before {
          content: ''; position: absolute; left: 5%; right: 5%; bottom: -8px; height: 45%; border-radius: 50%; z-index: -1;
          background: radial-gradient(ellipse at 50% 100%, rgba(251, 146, 60, 0.85), rgba(239, 68, 68, 0.35) 50%, transparent 72%);
          filter: blur(6px); transform-origin: 50% 100%; animation: comboFlame 0.6s ease-in-out infinite alternate;
        }
        .combo-aura-max::before {
          height: 65%;
          background: radial-gradient(ellipse at 50% 100%, rgba(56, 189, 248, 0.9), rgba(168, 85, 247, 0.45) 50%, transparent 72%);
        }

        /* ── Tema arena per level (lihat ARENA_THEMES di battle-sprites.jsx) ── */
        @keyframes arenaPanA { from { transform: scale(1.06) translate(0, 0); } to { transform: scale(1.14) translate(-2%, -1%); } }
        @keyframes arenaPanB { from { transform: scale(1.12) translate(1.5%, 0); } to { transform: scale(1.05) translate(-1.5%, -1%); } }
        @keyframes arenaDust {
          0% { transform: translate(0, 0); opacity: 0; }
          20% { opacity: 0.85; }
          100% { transform: translate(48px, -90px); opacity: 0; }
        }
        @keyframes arenaLantern {
          0% { transform: translate(0, 12vh); opacity: 0; }
          10% { opacity: 0.95; }
          50% { transform: translate(16px, -45vh); }
          90% { opacity: 0.8; }
          100% { transform: translate(-10px, -105vh); opacity: 0; }
        }
        @keyframes arenaRain { from { transform: translate(0, 0) rotate(14deg); } to { transform: translate(-70px, 125vh) rotate(14deg); } }
        @keyframes arenaRune {
          0% { transform: translateY(6vh) rotate(0deg); opacity: 0; }
          15% { opacity: 0.9; }
          100% { transform: translateY(-100vh) rotate(200deg); opacity: 0; }
        }
        @keyframes arenaLightning { 0%, 90%, 95%, 100% { opacity: 0; } 91% { opacity: 0.55; } 92% { opacity: 0.06; } 93.5% { opacity: 0.4; } }
        @keyframes arenaEclipse {
          0%, 100% { box-shadow: inset 0 0 120px 30px rgba(126, 34, 206, 0.35); }
          50% { box-shadow: inset 0 0 190px 70px rgba(190, 18, 60, 0.45); }
        }
        .arena-pan { animation-duration: 38s; animation-timing-function: ease-in-out; animation-iteration-count: infinite; animation-direction: alternate; }
        .arena-dust { animation-name: arenaDust; animation-timing-function: linear; animation-iteration-count: infinite; }
        .arena-lantern { animation-name: arenaLantern; animation-timing-function: ease-in-out; animation-iteration-count: infinite; opacity: 0; }
        .arena-rain { animation-name: arenaRain; animation-timing-function: linear; animation-iteration-count: infinite; }
        .arena-rune { animation-name: arenaRune; animation-timing-function: linear; animation-iteration-count: infinite; opacity: 0; }
        .arena-lightning { animation: arenaLightning 7s linear infinite; opacity: 0; }
        .arena-eclipse-pulse { animation: arenaEclipse 4s ease-in-out infinite; }

        body.game-yield .game-layer { z-index: 85 !important; }

        /* Hanya opacity: transform di sini akan membuat layar battle fullscreen (position: fixed) ikut terkurung. */
        @keyframes battleFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Animasi sekali-jalan ikut kecepatan battle: --bs = 0.5 di mode 2x (diset di .battle-root), sama seperti
           timer JS di handleSelectAnswer. Tanpa ini, di 2x efek serangan terpotong sebelum selesai. */
        .animate-fadeIn { animation: battleFadeIn 0.35s ease-out; }
        .animate-hurtBoxPop { animation: hurtBoxPop calc(0.38s * var(--bs, 1)) cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-hurtTremble { animation: hurtTremble 0.22s ease-in-out infinite; }
        .animate-playerIdle { animation: playerIdle 3s ease-in-out infinite; transform-origin: 50% 100%; }
        .animate-bossFloat { animation: bossFloat 3.4s ease-in-out infinite; transform-origin: 50% 100%; }
        .animate-shadowPulse { animation: shadowPulse 3.5s ease-in-out infinite; }
        .animate-bossHurt { animation: bossHurt calc(0.45s * var(--bs, 1)) ease-out; }
        .animate-playerHurt { animation: playerHurt calc(0.5s * var(--bs, 1)) ease-out; }
        .animate-wingHoverLeft { animation: wingHoverLeft 2.5s ease-in-out infinite; transform-origin: 60px 85px; }
        .animate-wingHoverRight { animation: wingHoverRight 2.5s ease-in-out infinite; transform-origin: 120px 85px; }
        .animate-wingFlap { animation: wingFlap 0.3s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
        .animate-playerProjectile { animation: playerProjectile calc(0.5s * var(--bs, 1)) cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .animate-bossProjectile { animation: bossProjectile calc(0.5s * var(--bs, 1)) cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .animate-floatDamage { animation: floatDamage calc(1.5s * var(--bs, 1)) cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .animate-spin-slow { animation: spinSlow 16s linear infinite; transform-origin: center; transform-box: fill-box; }
        .animate-balanceTilt { animation: balanceTilt 2s ease-in-out infinite; transform-origin: 90px 48px; }
        .animate-bookLevitate { animation: bookLevitate 2.2s ease-in-out infinite; }
        .animate-tasselFlick { animation: tasselFlick 0.4s ease-in-out infinite; transform-origin: 80px 20px; }
        .animate-screenShake { animation: screenShake calc(0.45s * var(--bs, 1)) ease-out; }
        .animate-slashX1 { animation: slashX1 calc(0.55s * var(--bs, 1)) cubic-bezier(0.1, 0.9, 0.2, 1) both; }
        .animate-slashX2 { animation: slashX2 calc(0.55s * var(--bs, 1)) cubic-bezier(0.1, 0.9, 0.2, 1) calc(0.08s * var(--bs, 1)) both; }
        .animate-impactRing { animation: impactRing calc(0.6s * var(--bs, 1)) ease-out forwards; }
        .animate-sparkBurst { animation: sparkBurst calc(0.65s * var(--bs, 1)) ease-out forwards; }
        .animate-lightningStrike { animation: lightningStrike calc(0.75s * var(--bs, 1)) ease-out forwards; }
        .animate-pillarCrash { animation: pillarCrash calc(0.8s * var(--bs, 1)) ease-out forwards; }
        .animate-attackBannerSlide { animation: attackBannerSlide calc(0.42s * var(--bs, 1)) cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-chargeHero { animation: chargeHero calc(0.48s * var(--bs, 1)) cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-speedlineRun { animation: speedlineRun 0.35s linear infinite; }
        .animate-critNumberBounce { animation: critNumberBounce calc(0.45s * var(--bs, 1)) cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-strikeFlash { animation: strikeFlash calc(0.35s * var(--bs, 1)) ease-out forwards; }

        /* Hormati setelan "kurangi gerakan" di OS: tanpa guncangan layar, kilatan, dan gerak melayang terus-menerus. */
        @media (prefers-reduced-motion: reduce) {
          .battle-root .animate-screenShake,
          .battle-root .animate-hurtTremble,
          .battle-root .animate-playerIdle,
          .battle-root .animate-bossFloat,
          .battle-root .animate-shadowPulse,
          .battle-root .animate-speedlineRun,
          .battle-root .animate-wingFlap,
          .battle-root .animate-spin-slow,
          .battle-root .animate-bookLevitate { animation: none !important; }
          .battle-root .animate-strikeFlash,
          .battle-root .animate-lightningStrike { animation-duration: 0.01s !important; opacity: 0 !important; }
          .battle-root .animate-ping,
          .battle-root .animate-bounce { animation: none !important; }
          .battle-root .arena-pan { animation: none !important; }
          .battle-root .arena-dust, .battle-root .arena-lantern, .battle-root .arena-rain,
          .battle-root .arena-rune, .battle-root .arena-lightning { display: none !important; }
          .battle-root .ko-confetti, .battle-root .combo-aura::before { display: none !important; }
          .battle-root .boss-enraged, .battle-root .vs-left, .battle-root .vs-right, .battle-root .vs-slam,
          .battle-root .vs-banner, .battle-root .vs-missions, .battle-root .ko-slam { animation: none !important; }
          .battle-root .victory-rays, .battle-root .victory-title, .battle-root .victory-star, .battle-root .victory-hero,
          .battle-root .victory-bubble, .battle-root .victory-slot { animation: none !important; }
        }
      `}</style>
    </div>
  );

  // Game selalu tampil penuh seperti aplikasi native (desktop & HP): halaman dipindah ke lapisan fixed di <body>
  // sehingga navbar & footer situs tidak pernah muncul. Arena battle punya portal sendiri (z lebih tinggi).
  // Tombol layar penuh hanya menyembunyikan bar browser (Fullscreen API).
  return <GameFullscreenLayer active>{pageContent}</GameFullscreenLayer>;
}

window.BattlePage = BattlePage;
