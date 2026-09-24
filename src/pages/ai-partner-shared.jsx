import React, { useState, useEffect } from 'react';
/* Talqeeh — AI Partner: helper & komponen kecil yang dipakai halaman daftar, wizard, dan tab belajar */

// Profil belajar (onboarding) → ringkas untuk server, supaya AI menyesuaikan gaya penyajian.
const learnerPayload = (profile = window.getProfile?.()) => {
  if (!profile) return null;
  const level = window.LEVELS?.find(l => l.id === profile.level);
  const faculty = window.FACULTIES?.find(f => f.id === profile.faculty);
  const major = faculty?.majors?.find(m => m.id === profile.major);
  return {
    level: profile.level === 'mustawa'
      ? `Darul Lughah${profile.dlMustawa ? ` (${profile.dlMustawa.replace('_', ' ')})` : ''}`
      : (level?.label || profile.level || ''),
    faculty: faculty?.label || '',
    major: major?.label || '',
    styles: profile.learningStyle || [],
    arabicLevel: profile.arabicLevel || null,
    goal: profile.studyGoal || null,
    examWindow: window.currentExamWindow?.(profile) || null,
    struggles: profile.struggle || [],
  };
};

// Ringkasan profil untuk ditampilkan ("Disesuaikan untukmu: …").
const learnerSummary = (profile = window.getProfile?.()) => {
  if (!profile) return '';
  const styles = (profile.learningStyle || []).map(id => window.LEARNING_STYLES?.find(s => s.id === id)?.label).filter(Boolean);
  const arabic = window.ARABIC_LEVELS?.find(a => a.id === profile.arabicLevel)?.label;
  const goal = window.STUDY_GOALS?.find(g => g.id === profile.studyGoal)?.label;
  return [
    styles.length ? styles.join(' & ') : null,
    arabic ? `bahasa Arab: ${arabic.toLowerCase()}` : null,
    goal ? `target: ${goal.toLowerCase()}` : null,
  ].filter(Boolean).join(' · ');
};

const PERSONALIZED_ACTIONS = ['generate', 'chat', 'grade'];

const aiCall = async (action, payload = {}) => {
  let data;
  try {
    const body = PERSONALIZED_ACTIONS.includes(action) ? { ...payload, learner: learnerPayload() } : payload;
    const res = await window.authFetch(`/api/ai-partner?action=${action}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    data = await res.json();
  } catch {
    data = { ok: false, error: 'Tidak bisa terhubung ke server. Cek koneksi lalu coba lagi.' };
  }
  if (!data.ok && data.error === 'quota') data.error = data.message;
  if (!data.ok && data.error === 'upgrade') { data.upgrade = true; data.error = data.message; }
  if (!data.ok && data.error === 'not_member') data.error = 'Fitur ini untuk member Talqeeh.';
  return data;
};

// Status akses: { loading, tier: 'pro' | 'trial' | 'none', trial: { used, set_id } }
const useAiStatus = () => {
  const [state, setState] = useState({ loading: true, tier: 'none', trial: null });
  useEffect(() => {
    let alive = true;
    aiCall('status').then(d => {
      if (!alive) return;
      setState({ loading: false, tier: d.ok ? (d.tier || (d.active ? 'pro' : 'none')) : 'none', trial: d.trial || null });
    });
    return () => { alive = false; };
  }, []);
  return state;
};

const openAiUpgrade = () =>
  window.dispatchEvent(new CustomEvent('talqeeh:open-join', { detail: { plan: 'library_ai' } }));

const maddahName = (id) => {
  if (!id) return null;
  const m = window.getMaddahById?.(id) || window.getMahadMaddahById?.(id);
  return m?.name || null;
};

const ARABIC_RE = /[؀-ۿ]/;
const ARABIC_CHARS_RE = /[؀-ۿ]/g;
const hasArabic = (text) => ARABIC_RE.test(text || '');
// Paragraf dianggap Arab kalau mayoritas hurufnya Arab.
const isMostlyArabic = (text) => {
  const letters = (text || '').replace(/[\s\d\p{P}]/gu, '');
  if (!letters) return false;
  return ((text.match(ARABIC_CHARS_RE) || []).length / letters.length) > 0.5;
};

// Lafal Arab pakai suara bawaan browser (gratis). Tidak semua perangkat punya suara Arab.
const speakArabic = (text, onUnavailable) => {
  const synth = window.speechSynthesis;
  if (!synth) { onUnavailable?.(); return; }
  const voices = synth.getVoices();
  const voice = voices.find(v => v.lang?.toLowerCase().startsWith('ar'));
  if (voices.length && !voice) { onUnavailable?.(); return; }
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = voice?.lang || 'ar-SA';
  if (voice) u.voice = voice;
  u.rate = 0.85;
  synth.speak(u);
};

const saveToKurasah = (title, body, tags = []) => {
  const now = new Date().toISOString();
  const note = {
    id: 'note_' + Date.now(),
    title, body,
    tags: ['ai-partner', ...tags],
    source: { type: 'ai-partner', label: 'AI Partner' },
    createdAt: now, updatedAt: now,
  };
  window.saveNotes([note, ...window.loadNotes()], note.id);
  return note.id;
};

const SOURCE_META = {
  pdf:      { label: 'PDF',        icon: 'book' },
  foto:     { label: 'Foto',       icon: 'upload' },
  teks:     { label: 'Teks',       icon: 'pen' },
  docx:     { label: 'Word',       icon: 'book' },
  pptx:     { label: 'PowerPoint', icon: 'grid' },
  xlsx:     { label: 'Excel',      icon: 'list' },
  txt:      { label: 'Teks',       icon: 'pen' },
  audio:    { label: 'Audio',      icon: 'headphones' },
  video:    { label: 'Video',      icon: 'play' },
  campuran: { label: 'Campuran',   icon: 'layers' },
};

// Alur belajar per materi — dipakai kartu daftar (cincin progres) dan stepper halaman materi.
const STUDY_STEPS = [
  { id: 'pahami',    label: 'Pahami',    ar: 'اِفْهَمْ',  icon: 'bookOpen',      doneKeys: ['summary_read', 'mindmap_viewed'] },
  { id: 'hafalkan',  label: 'Hafalkan',  ar: 'اِحْفَظْ',  icon: 'layers',        doneKeys: ['flashcards', 'glossary_viewed'] },
  { id: 'uji',       label: 'Uji Diri',  ar: 'اِخْتَبِرْ', icon: 'target',        doneKeys: ['quiz_done', 'essays_done'] },
  { id: 'tanya',     label: 'Tanya',     ar: 'اِسْأَلْ',  icon: 'messageSquare', doneKeys: ['chatted', 'syafawi_done'] },
];

const stepDone = (step, progress = {}, extra = {}) =>
  step.doneKeys.some(k => progress[k] || extra[k]);

const studyPercent = (set) => {
  const extra = { quiz_done: set.quiz_best_score != null, chatted: Array.isArray(set.chat) && set.chat.length > 0 };
  const done = STUDY_STEPS.filter(s => stepDone(s, set.progress || {}, extra)).length;
  return Math.round((done / STUDY_STEPS.length) * 100);
};

const ProgressRing = ({ percent, size = 44 }) => {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4"/>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#3ecf8e" strokeWidth="4" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - percent / 100)} style={{ transition: 'stroke-dashoffset .5s ease' }}/>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-ink">{percent}%</span>
    </div>
  );
};

const Skeleton = ({ lines = 5 }) => (
  <div className="space-y-3 animate-pulse" aria-hidden="true">
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="h-3.5 rounded bg-white/8" style={{ width: `${90 - (i % 3) * 18}%` }}/>
    ))}
  </div>
);

// Kartu "belum ada hasil" dengan satu tombol buat — dipakai semua tab yang dihasilkan AI.
const GeneratePanel = ({ icon, title, desc, eta = '10–30 detik', cta, onGenerate, busy, children }) => (
  <div className="card-glass p-6 md:p-10 text-center">
    {busy ? (
      <div className="max-w-md mx-auto text-left">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <Icon name="sparkles" className="w-4 h-4 text-emerald-300 animate-pulse"/>
          </span>
          <div>
            <div className="text-sm text-ink font-medium">AI sedang menyusun {title.toLowerCase()}…</div>
            <div className="text-xs text-ink-soft">Biasanya {eta}. Jangan tutup halaman ini.</div>
          </div>
        </div>
        <Skeleton lines={6}/>
      </div>
    ) : (
      <>
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-emerald-500/12 border border-emerald-500/25">
          <Icon name={icon} className="w-6 h-6 text-emerald-300"/>
        </div>
        <h3 className="font-display text-xl font-semibold text-ink mb-2">{title}</h3>
        <p className="text-sm text-ink-muted max-w-md mx-auto leading-relaxed mb-6">{desc}</p>
        {children}
        <button onClick={onGenerate} className="btn btn-primary text-sm px-6 py-3">
          <Icon name="sparkles" className="w-4 h-4"/> {cta}
        </button>
        <div className="text-[11px] text-ink-soft mt-3">Perkiraan {eta}</div>
      </>
    )}
  </div>
);

const UpgradeCard = ({ title = 'Fitur khusus pelanggan', message, compact }) => (
  <div className={`card-glass ${compact ? 'p-5' : 'p-8 md:p-10'} text-center`} style={{ border: '1px solid rgba(201,168,106,0.28)' }}>
    <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gold-500/12 border border-gold-500/25">
      <Icon name="crown" className="w-5 h-5 text-gold-300"/>
    </div>
    <h3 className="font-display text-lg font-semibold text-ink mb-2">{title}</h3>
    <p className="text-sm text-ink-muted max-w-md mx-auto leading-relaxed mb-5">
      {message || 'Berlangganan AI Partner untuk membuka semua fitur: materi tanpa batas, audio & video, peta konsep, terjemah & i\'rab, latihan tahriri, dan tutor.'}
    </p>
    <button onClick={openAiUpgrade} className="btn btn-gold text-sm px-6 py-3">
      Berlangganan AI Partner <Icon name="arrowRight" className="w-4 h-4"/>
    </button>
  </div>
);

const Pill = ({ children, tone = 'default' }) => {
  const cls = {
    default: 'bg-white/5 border-white/10 text-ink-muted',
    emerald: 'bg-emerald-500/12 border-emerald-500/25 text-emerald-300',
    gold:    'bg-gold-500/10 border-gold-500/25 text-gold-300',
    rose:    'bg-rose-500/10 border-rose-500/25 text-rose-300',
  }[tone];
  return <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${cls}`}>{children}</span>;
};

// Teks Arab besar & nyaman dibaca.
const ArabicText = ({ children, className = '', size = 22 }) => (
  <div dir="rtl" className={`text-ink ${className}`}
    style={{ fontFamily: '"Noto Naskh Arabic", "Amiri", serif', fontSize: size, lineHeight: 2 }}>
    {children}
  </div>
);

const SpeakButton = ({ text, className = '' }) => {
  const toast = useToast();
  if (!hasArabic(text)) return null;
  return (
    <button type="button" title="Dengarkan lafal"
      onClick={(e) => { e.stopPropagation(); speakArabic(text, () => toast.push('Perangkat ini belum punya suara bahasa Arab.')); }}
      className={`w-8 h-8 rounded-lg inline-flex items-center justify-center text-ink-muted hover:text-emerald-300 hover:bg-white/5 ${className}`}>
      <Icon name="headphones" className="w-4 h-4"/>
    </button>
  );
};

const aiInputClass =
  'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-ink text-sm outline-none focus:border-emerald-500/50';

Object.assign(window, {
  aiCall, useAiStatus, openAiUpgrade, learnerPayload, learnerSummary, maddahName, hasArabic, isMostlyArabic, speakArabic, saveToKurasah,
  SOURCE_META, STUDY_STEPS, stepDone, studyPercent,
  ProgressRing, Skeleton, GeneratePanel, UpgradeCard, Pill, ArabicText, SpeakButton, aiInputClass,
});
