import React, { useState, useEffect, useRef } from 'react';
/* Talqeeh — Profil Belajar: 16 pernyataan → radar 8 dimensi → penyesuaian AI, prompt, & saran harian.
   Kuesioner isian diri, bukan tes psikologi. Hasil disimpan di profile.cognitive. */

const ANALYZE_MS = 3600;
const ANALYZE_STEPS = [
  { dim: 'fokus',   text: 'Menghitung fokus & energi…' },
  { dim: 'memori',  text: 'Membaca pola hafalanmu…' },
  { dim: 'stres',   text: 'Melihat cara kamu menghadapi tekanan…' },
  { dim: 'praktik', text: 'Menyesuaikan AI Partner & prompt untukmu…' },
];

const queryParam = (key) => new URLSearchParams(window.location.hash.split('?')[1] || '').get(key);

const LevelPill = ({ value, dim }) => {
  const level = cogLevel(value);
  // Untuk stres, "tinggi" bukan hal baik.
  const good = dim === 'stres' ? level === 'rendah' : level === 'tinggi';
  const bad = dim === 'stres' ? level === 'tinggi' : level === 'rendah';
  const tone = dim === 'praktik' ? 'text-sky-300 border-sky-400/30 bg-sky-500/10'
    : good ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'
    : bad ? 'text-amber-300 border-amber-500/30 bg-amber-500/10'
    : 'text-ink-muted border-white/10 bg-white/5';
  const label = dim === 'praktik' ? (value >= 65 ? 'condong praktik' : value <= 35 ? 'condong teori' : 'seimbang') : level;
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border ${tone}`}>{label}</span>;
};

const ProfilBelajarPage = () => {
  const { session, profile, saveProfile, isFree } = useAuth();
  const aiStatus = useAiStatus();
  const settings = useAppSettings();
  const fromOnboarding = queryParam('from') === 'onboarding';
  const existing = cognitiveScores(profile);
  const [stage, setStage] = useState(existing && queryParam('retake') !== '1' ? 'result' : 'intro');
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState(existing);
  const [progress, setProgress] = useState(1);
  const [stepText, setStepText] = useState(0);
  const advanceTimer = useRef(null);

  useEffect(() => { if (!session) navigate('/'); }, [session]);
  useEffect(() => () => clearTimeout(advanceTimer.current), []);

  // Animasi "menyusun profil": radar tumbuh dari tengah, teks langkah berganti.
  // Pakai timer (bukan requestAnimationFrame) supaya tetap selesai walau tab sedang di belakang.
  useEffect(() => {
    if (stage !== 'analyzing') return;
    const start = Date.now();
    let done;
    const timer = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / ANALYZE_MS);
      setProgress(1 - Math.pow(1 - p, 3));
      setStepText(Math.min(ANALYZE_STEPS.length - 1, Math.floor(p * ANALYZE_STEPS.length)));
      if (p >= 1) {
        clearInterval(timer);
        done = setTimeout(() => setStage('result'), 350);
      }
    }, 40);
    return () => { clearInterval(timer); clearTimeout(done); };
  }, [stage]);

  if (!session) return null;

  const finishLater = () => navigate(fromOnboarding ? '/welcome' : '/dashboard');

  const answer = (value) => {
    const item = COGNITIVE_ITEMS[idx];
    const next = { ...answers, [item.id]: value };
    setAnswers(next);
    clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      if (idx < COGNITIVE_ITEMS.length - 1) { setIdx(idx + 1); return; }
      const result = scoreCognitive(next);
      setScores(result);
      saveProfile({ ...profile, cognitive: { scores: result, answers: next, takenAt: new Date().toISOString(), version: 1 } });
      setProgress(0);
      setStage('analyzing');
    }, 220);
  };

  const restart = () => { setAnswers({}); setIdx(0); setStage('quiz'); };

  /* ── Pembuka ── */
  if (stage === 'intro') {
    return (
      <div className="page-enter container-x py-10 md:py-16 max-w-2xl text-center">
        <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-3">Profil Belajar</div>
        <h1 className="font-display text-3xl md:text-5xl font-semibold text-ink leading-tight mb-4">Kenali cara belajarmu</h1>
        <p className="text-ink-muted leading-relaxed mb-6">
          16 pernyataan singkat (±3 menit) tentang kebiasaan belajarmu. Hasilnya dipakai untuk menyesuaikan
          ringkasan & tutor AI Partner, prompt Library, dan saran belajar harianmu.
        </p>
        <div className="card-glass p-5 text-left mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {COGNITIVE_DIMS.map(d => (
              <div key={d.key} className="text-xs px-3 py-2 rounded-lg bg-white/4 border border-white/8 text-ink">{d.label}</div>
            ))}
          </div>
          <p className="text-[11px] text-ink-soft leading-relaxed">
            Ini kuesioner isian diri, bukan tes psikologi atau diagnosis. Tidak ada jawaban benar atau salah —
            jawab sesuai kebiasaanmu sehari-hari. Bisa diulang kapan saja.
          </p>
        </div>
        <button onClick={() => setStage('quiz')} className="btn btn-primary text-base px-7 py-3.5">
          Mulai <Icon name="arrowRight" className="w-4 h-4"/>
        </button>
        <div className="mt-4">
          <button onClick={finishLater} className="text-sm text-ink-soft hover:text-ink">Lewati dulu</button>
        </div>
      </div>
    );
  }

  /* ── Pertanyaan ── */
  if (stage === 'quiz') {
    const item = COGNITIVE_ITEMS[idx];
    const pct = Math.round((idx / COGNITIVE_ITEMS.length) * 100);
    return (
      <div className="page-enter container-x py-8 md:py-14 max-w-2xl">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-gold-400 uppercase tracking-wider">Pernyataan {idx + 1} dari {COGNITIVE_ITEMS.length}</span>
          <button onClick={finishLater} className="text-ink-soft hover:text-ink">Lewati</button>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-10">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-gold-400 transition-all duration-300" style={{ width: `${pct}%` }}/>
        </div>
        <div key={item.id} className="page-enter">
          <div className="text-xs text-ink-soft mb-3">Seberapa sesuai dengan dirimu?</div>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink leading-snug mb-8">"{item.text}"</h2>
          <div className="space-y-2.5">
            {LIKERT.map(o => {
              const sel = answers[item.id] === o.value;
              return (
                <button key={o.value} onClick={() => answer(o.value)}
                  className={`w-full text-left px-5 py-4 rounded-xl border transition flex items-center gap-4 ${sel ? 'border-emerald-500/60 bg-emerald-500/15' : 'border-white/10 bg-white/3 hover:border-emerald-500/35'}`}>
                  <span className="flex gap-1 flex-shrink-0">
                    {[1, 2, 3, 4, 5].map(k => (
                      <span key={k} className="w-2 h-2 rounded-full" style={{ background: k <= o.value ? '#3ecf8e' : 'rgba(255,255,255,0.12)' }}/>
                    ))}
                  </span>
                  <span className="text-sm text-ink">{o.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        {idx > 0 && (
          <button onClick={() => setIdx(idx - 1)} className="btn btn-ghost text-sm mt-8">
            <Icon name="chevronLeft" className="w-4 h-4"/> Sebelumnya
          </button>
        )}
      </div>
    );
  }

  /* ── Animasi menyusun profil ── */
  if (stage === 'analyzing') {
    const step = ANALYZE_STEPS[stepText];
    return (
      <div className="page-enter container-x py-10 md:py-16 max-w-xl text-center">
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-ink mb-6">Menyusun profil belajarmu…</h1>
        <div className="flex justify-center mb-6">
          <RadarChart dims={COGNITIVE_DIMS} values={scores} progress={progress} highlight={step.dim} color="#3ecf8e"/>
        </div>
        <div className="text-emerald-300 font-medium mb-4 min-h-[24px]">{step.text}</div>
        <div className="h-2 bg-white/6 rounded-full overflow-hidden max-w-sm mx-auto">
          <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.round(progress * 100)}%` }}/>
        </div>
      </div>
    );
  }

  /* ── Hasil ── */
  const insights = cognitiveInsights(scores);
  const advice = dailyAdvice({ ...profile, cognitive: { scores } });
  const takenAt = profile?.cognitive?.takenAt;
  const nextStep = () => navigate(fromOnboarding ? '/welcome' : '/dashboard');

  // Daftar centang: hanya penyesuaian yang benar-benar dilakukan Talqeeh untuk profil ini.
  const checklist = [
    ...insights.adaptations.slice(0, 2),
    advice && `Ritme ${advice.count} × ${advice.minutes} menit per hari, istirahat ${advice.rest} menit`,
    advice && `${advice.cards} flashcard per hari dengan pengulangan berjarak`,
    'Prompt Library otomatis menyertakan cara belajarmu',
  ].filter(Boolean).slice(0, 5);
  const answeredCount = COGNITIVE_ITEMS.length +
    ['level', 'faculty', 'arabicLevel', 'studyGoal', 'examWindow'].filter(k => profile?.[k]).length +
    ((profile?.learningStyle || []).length ? 1 : 0);

  // Tawaran lanjutan sesuai status: akun gratis → Library, member Library → AI Partner, pelanggan → tanpa tawaran.
  const offer = isFree
    ? { price: LIBRARY_PRICE, per: 'sekali bayar', cta: 'Buka semua dengan Library', later: 'Nanti aja, pakai gratisan dulu',
        onClick: () => navigate('/gabung?plan=library') }
    : aiStatus.loading || aiStatus.tier === 'pro' ? null
    : { price: settings.aiPriceLabel || null, per: settings.aiPriceLabel ? '/30 hari' : '', cta: 'Mulai AI Partner', later: 'Nanti saja',
        note: 'Ringkasan, flashcard, kuis, dan tutor dari materimu — disesuaikan dengan profil ini.',
        onClick: () => window.dispatchEvent(new CustomEvent('talqeeh:open-join', { detail: { plan: 'library_ai' } })) };

  return (
    <div className="page-enter container-x py-8 md:py-12 max-w-6xl">
      {/* Laporan utama */}
      <div className="card-glass-strong p-5 md:p-10 mb-10" style={{ borderRadius: 28 }}>
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
          <div className="flex justify-center"><RadarChart dims={COGNITIVE_DIMS} values={scores} size={380}/></div>
          <div>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold text-emerald-300 bg-emerald-500/12 border border-emerald-500/25 mb-4">
              <Icon name="sparkles" className="w-4 h-4"/> Profil selesai
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink leading-tight mb-3">
              Teman belajarmu sudah disesuaikan!
            </h1>
            <p className="text-ink-muted leading-relaxed mb-5">
              Berdasarkan {answeredCount} jawabanmu, Talqeeh menyiapkan cara belajar yang pas untukmu:
            </p>
            <ul className="space-y-2.5 mb-6">
              {checklist.map(item => (
                <li key={item} className="flex items-start gap-3 rounded-2xl bg-white/4 border border-white/6 px-4 py-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="check" className="w-3.5 h-3.5 text-emerald-300" strokeWidth={2.6}/>
                  </span>
                  <span className="text-sm md:text-[15px] text-ink leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

            {offer ? (
              <>
                {offer.price && (
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-display text-4xl md:text-5xl font-semibold text-ink">{offer.price}</span>
                    <span className="text-ink-muted">{offer.per}</span>
                  </div>
                )}
                {offer.note && <p className="text-xs text-ink-soft mb-3">{offer.note}</p>}
                <button onClick={offer.onClick} className="btn btn-gold w-full text-base py-4 font-semibold mt-2">
                  <Icon name="sparkles" className="w-4 h-4"/> {offer.cta}
                </button>
                <button onClick={nextStep} className="w-full text-center text-sm text-ink-soft hover:text-ink mt-3">{offer.later}</button>
              </>
            ) : (
              <button onClick={nextStep} className="btn btn-primary w-full text-base py-4 font-semibold">
                Mulai belajar <Icon name="arrowRight" className="w-4 h-4"/>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Rincian */}
      <div className="flex items-end justify-between gap-3 mb-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-gold-400">Rincian profilmu</div>
          {takenAt && <p className="text-[11px] text-ink-soft mt-1">Diisi {new Date(takenAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
        </div>
      </div>
      <div className="mb-5">
        <div className="card-glass p-5 md:p-6 grid md:grid-cols-2 gap-x-8 gap-y-3">
          {COGNITIVE_DIMS.map(d => (
            <div key={d.key}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm text-ink">{d.label} <span className="text-[11px] text-ink-soft">· {d.desc}</span></span>
                <LevelPill value={scores[d.key]} dim={d.key}/>
              </div>
              <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: `${scores[d.key]}%`, background: d.key === 'stres' ? '#f59e0b' : undefined }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-5">
        <div className="card-glass p-5">
          <div className="text-xs uppercase tracking-wider text-emerald-300 mb-3">Kekuatanmu</div>
          <ul className="space-y-2 text-sm text-ink">{insights.strengths.map(s => <li key={s}>✓ {s}</li>)}</ul>
        </div>
        <div className="card-glass p-5">
          <div className="text-xs uppercase tracking-wider text-amber-300 mb-3">Yang perlu dibantu</div>
          {insights.challenges.length
            ? <ul className="space-y-2 text-sm text-ink">{insights.challenges.map(s => <li key={s}>• {s}</li>)}</ul>
            : <p className="text-sm text-ink-muted">Tidak ada yang menonjol. Pertahankan ritmemu.</p>}
        </div>
        <div className="card-glass p-5" style={{ border: '1px solid rgba(62,207,142,0.25)' }}>
          <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">Talqeeh menyesuaikan diri</div>
          <ul className="space-y-2 text-sm text-ink">{insights.adaptations.map(s => <li key={s}>→ {s}</li>)}</ul>
        </div>
      </div>

      {advice && (
        <div className="card-glass p-5 mb-8">
          <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">Saran ritme belajarmu</div>
          <div className="grid grid-cols-3 gap-2 md:gap-3 mb-3">
            <div className="rounded-xl bg-white/4 p-3"><div className="font-display text-base md:text-xl text-ink">{advice.minutes} menit</div><div className="text-[11px] text-ink-soft">per sesi · {advice.count} sesi/hari</div></div>
            <div className="rounded-xl bg-white/4 p-3"><div className="font-display text-base md:text-xl text-ink">{advice.rest} menit</div><div className="text-[11px] text-ink-soft">istirahat antar sesi</div></div>
            <div className="rounded-xl bg-white/4 p-3"><div className="font-display text-base md:text-xl text-ink">{advice.cards} kartu</div><div className="text-[11px] text-ink-soft">flashcard per hari</div></div>
          </div>
          <ul className="space-y-1.5 text-sm text-ink-muted">{advice.tips.map(t => <li key={t}>• {t}</li>)}</ul>
        </div>
      )}

      <p className="text-[11px] text-ink-soft text-center mb-6">
        Profil ini berasal dari jawabanmu sendiri dan bisa berubah seiring waktu — ulangi tesnya kapan saja.
      </p>
      <div className="flex gap-2 justify-center flex-wrap">
        <button onClick={nextStep} className="btn btn-ghost text-sm px-6 py-3">
          {fromOnboarding ? 'Lanjut ke Talqeeh' : 'Ke Beranda'} <Icon name="arrowRight" className="w-4 h-4"/>
        </button>
        <button onClick={restart} className="btn btn-ghost text-sm px-5 py-3">
          <Icon name="refresh" className="w-4 h-4"/> Ulangi tes
        </button>
      </div>
    </div>
  );
};

window.ProfilBelajarPage = ProfilBelajarPage;
