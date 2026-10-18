import React, { useState, useEffect } from 'react';
/* Talqeeh — 6 metode belajar (learning-frameworks-data.jsx) yang DIJALANKAN di fitur Talqeeh, bukan hanya dibaca.
   - markMethod: mencatat metode yang dipakai hari ini & minggu ini (di perangkat, localStorage).
   - openSetTab: buka materi AI Partner langsung di tab tertentu (flashcard, tutor, peta konsep, ...).
   - launchMixedArena: Arena Imtihan campuran dari beberapa materi (interleaving).
   - practiceMethod: aksi "Praktikkan di Talqeeh" untuk tiap metode (halaman Framework & Sesi hari ini). */

export const METHOD_IDS = ['spaced-repetition', 'retrieval-practice', 'interleaving', 'elaborative-interrogation', 'feynman-technique', 'dual-coding'];
const USAGE_KEY = 'talqeeh_methods_used';

// Minggu dihitung Senin–Ahad (waktu perangkat).
const weekStart = (d = new Date()) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x.toISOString().slice(0, 10);
};
const today = () => new Date().toLocaleDateString('en-CA');

const readUsage = () => {
  try {
    const u = JSON.parse(localStorage.getItem(USAGE_KEY) || 'null');
    if (u && u.week === weekStart()) return { week: u.week, days: u.days || {} };
  } catch {}
  return { week: weekStart(), days: {} };
};

export const markMethod = (id) => {
  if (!METHOD_IDS.includes(id)) return;
  try {
    const u = readUsage();
    const d = today();
    const list = u.days[d] || [];
    if (list.includes(id)) return;
    u.days[d] = [...list, id];
    localStorage.setItem(USAGE_KEY, JSON.stringify(u));
    window.dispatchEvent(new Event('talqeeh:methods-changed'));
  } catch {}
};

export const methodsToday = () => readUsage().days[today()] || [];
export const methodsThisWeek = () => [...new Set(Object.values(readUsage().days).flat())];

// Render ulang saat ada metode baru tercatat (juga dari tab lain).
export const useMethodUsage = () => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick(t => t + 1);
    window.addEventListener('talqeeh:methods-changed', bump);
    window.addEventListener('storage', bump);
    return () => { window.removeEventListener('talqeeh:methods-changed', bump); window.removeEventListener('storage', bump); };
  }, []);
  return { today: methodsToday(), week: methodsThisWeek() };
};

/* Buka materi AI Partner di tab tertentu. step: pahami | hafalkan | uji | tanya; sub: id tab (cards, quiz, tutor,
   mindmap, ...). ask: pertanyaan yang langsung dikirim ke tutor. Dibaca AiPartnerDetail saat materi termuat. */
export const OPEN_TAB_KEY = 'talqeeh_open_tab';
export const openSetTab = (setId, step, sub, ask = null) => {
  try { sessionStorage.setItem(OPEN_TAB_KEY, JSON.stringify({ setId: String(setId), step, sub, ask })); } catch {}
  window.navigate?.(`/ai-partner/${setId}`);
};
export const takeOpenTab = (setId) => {
  try {
    const v = JSON.parse(sessionStorage.getItem(OPEN_TAB_KEY) || 'null');
    if (!v || v.setId !== String(setId)) return null;
    sessionStorage.removeItem(OPEN_TAB_KEY);
    return v;
  } catch { return null; }
};

export const FEYNMAN_ASK = 'Aku mau latihan menjelaskan ulang dengan bahasaku sendiri (teknik Feynman). Minta aku memilih satu kaidah atau ta\'rif dari materi ini, lalu dengarkan penjelasanku: tunjukkan bagian yang keliru, kurang lengkap, atau masih menghafal tanpa paham, dan tanyakan "mengapa" sampai penjelasanku kokoh.';
export const WHY_ASK = 'Ajukan kepadaku 3 pertanyaan "mengapa" tentang kaidah-kaidah inti materi ini (mengapa hukumnya begitu, apa \'illat-nya, apa bedanya dengan kaidah yang mirip). Tanyakan satu per satu, tunggu jawabanku, lalu koreksi.';

/* Arena Imtihan campuran: soal dari 2–3 materi diacak dalam satu ujian (interleaving). Isi tiap materi diambil
   sebagian supaya semuanya terwakili; AI menyusun soal dari semua bagian (lihat aturan MATERI CAMPURAN di server). */
export const launchMixedArena = async (sets) => {
  const picked = (sets || []).slice(0, 3);
  if (picked.length < 2) return false;
  const full = [];
  for (const s of picked) {
    const d = s.content ? { ok: true, data: s } : await window.aiCall('get', { set_id: s.id });
    if (d.ok && d.data?.content) full.push(d.data);
  }
  if (full.length < 2) return false;
  const perSet = Math.floor(150000 / full.length);
  const ids = full.map(s => s.id).sort();
  const payload = {
    setId: `mix-${ids.join('-')}`,
    mixed: true,
    title: `Campuran: ${full.map(s => s.title).join(' · ')}`.slice(0, 160),
    text: full.map(s => `=== Materi: ${s.title} ===\n${String(s.content).slice(0, perSet)}`).join('\n\n'),
    maddah: 'Campuran',
    quiz: full.flatMap(s => (Array.isArray(s.quiz) ? s.quiz : [])),
  };
  try { sessionStorage.setItem('talqeeh_battle_custom_import', JSON.stringify(payload)); } catch {}
  window.navigate?.('/battle');
  return true;
};

/* "Praktikkan di Talqeeh" untuk satu metode. sets: daftar materi AI Partner (aiCall('list')) bila sudah dimuat. */
export const practiceMethod = async (id, sets = null) => {
  let list = sets;
  if (!list) {
    const d = await window.aiCall?.('list').catch(() => null);
    list = d?.ok ? d.data : [];
  }
  const recent = [...(list || [])].sort((a, b) => Date.parse(b.updated_at || b.created_at) - Date.parse(a.updated_at || a.created_at));
  const latest = recent[0];
  // Tanpa materi AI Partner: latihan tetap bisa di Arena Imtihan (soal preset), selebihnya diarahkan unggah materi.
  if (!latest) {
    if (id === 'retrieval-practice' || id === 'interleaving') { window.navigate?.('/battle'); return; }
    window.navigate?.('/ai-partner');
    return;
  }
  if (id === 'spaced-repetition') {
    const due = [...recent].sort((a, b) => (b.cards_due || 0) - (a.cards_due || 0))[0];
    openSetTab(due.id, 'hafalkan', 'cards');
  } else if (id === 'retrieval-practice') {
    window.launchBattleFromSet?.({ id: latest.id });
  } else if (id === 'interleaving') {
    if (recent.length >= 2) await launchMixedArena(recent.slice(0, 3));
    else window.navigate?.('/battle');
  } else if (id === 'elaborative-interrogation') {
    openSetTab(latest.id, 'tanya', 'tutor', WHY_ASK);
  } else if (id === 'feynman-technique') {
    openSetTab(latest.id, 'tanya', 'tutor', FEYNMAN_ASK);
  } else if (id === 'dual-coding') {
    openSetTab(latest.id, 'pahami', 'mindmap');
  }
};

// Fitur Talqeeh yang menjalankan tiap metode (dipakai di halaman Framework).
export const METHOD_FEATURE = {
  'spaced-repetition':         { feature: 'Flashcard berjadwal', cta: 'Ulang kartu yang jatuh tempo', icon: 'layers' },
  'retrieval-practice':        { feature: 'Arena Imtihan & kuis', cta: 'Uji diri di Arena Imtihan', icon: 'gamepad' },
  'interleaving':              { feature: 'Arena campuran', cta: 'Main Arena campuran', icon: 'refresh' },
  'elaborative-interrogation': { feature: 'Tutor "mengapa"', cta: 'Jawab pertanyaan "mengapa" dari tutor', icon: 'messageSquare' },
  'feynman-technique':         { feature: 'Tutor & simulasi syafawi', cta: 'Jelaskan ulang ke tutor', icon: 'mic' },
  'dual-coding':               { feature: 'Peta konsep taqsimat', cta: 'Buka peta konsep', icon: 'network' },
};

Object.assign(window, {
  METHOD_IDS, markMethod, methodsToday, methodsThisWeek, useMethodUsage, openSetTab, takeOpenTab,
  launchMixedArena, practiceMethod, METHOD_FEATURE, FEYNMAN_ASK, WHY_ASK,
});
