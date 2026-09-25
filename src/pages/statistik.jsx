import React, { useState, useEffect, useMemo } from 'react';
/* Talqeeh — Statistik Belajarku: ritme, Library, dan AI Partner milik member sendiri */

const DAY_MS = 86400000;
const isoDay = (t) => new Date(t).toISOString().slice(0, 10);

// Hari berturut-turut sampai hari ini (atau kemarin, kalau hari ini belum belajar).
const computeStreak = (days) => {
  const set = new Set(days);
  let t = Date.now();
  if (!set.has(isoDay(t))) t -= DAY_MS;
  let streak = 0;
  while (set.has(isoDay(t))) { streak++; t -= DAY_MS; }
  return streak;
};

const Heatmap = ({ days, weeks = 12 }) => {
  const set = new Set(days);
  // Kolom = pekan (Senin–Ahad), baris = hari; berakhir di pekan ini.
  const today = new Date();
  const dow = (today.getDay() + 6) % 7;
  const start = new Date(today.getTime() - (dow + (weeks - 1) * 7) * DAY_MS);
  const cols = Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const t = start.getTime() + (w * 7 + d) * DAY_MS;
      const key = isoDay(t);
      return { key, on: set.has(key), future: t > today.getTime() };
    })
  );
  return (
    <div>
      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        <div className="flex flex-col gap-1 mr-1 text-[9px] text-ink-soft justify-between py-0.5">
          {['Sen', '', 'Rab', '', 'Jum', '', 'Ahd'].map((l, i) => <span key={i} className="h-3 leading-3">{l}</span>)}
        </div>
        {cols.map((col, i) => (
          <div key={i} className="flex flex-col gap-1">
            {col.map(c => (
              <span key={c.key} title={c.key}
                className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-sm"
                style={{ background: c.future ? 'transparent' : c.on ? '#3ecf8e' : 'rgba(255,255,255,0.07)' }}/>
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-ink-soft">
        <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(255,255,255,0.07)' }}/> tidak belajar
        <span className="w-2.5 h-2.5 rounded-sm ml-2" style={{ background: '#3ecf8e' }}/> belajar
      </div>
    </div>
  );
};

const Tile = ({ value, label, sub, accent }) => (
  <div className="card-glass p-4 md:p-5">
    <div className={`font-display text-2xl md:text-3xl font-semibold leading-none ${accent || 'text-ink'}`}>{value}</div>
    <div className="text-xs text-ink-muted mt-2">{label}</div>
    {sub && <div className="text-[11px] text-ink-soft mt-0.5">{sub}</div>}
  </div>
);

const Box = ({ title, children, className = '' }) => (
  <div className={`card-glass p-5 md:p-6 ${className}`}>
    <div className="text-sm text-ink font-medium mb-4">{title}</div>
    {children}
  </div>
);

const QUOTA_LABELS = {
  prompt: 'Tanya AI', generate: 'Pembuatan AI', chat: 'Tutor & syafawi', analyze: "I'rab & harakat",
  grade: 'Nilai tahriri', ocr: 'Baca foto', transcribe: 'Transkrip (menit)', create: 'Materi baru',
};

const QuotaBox = ({ title, used, limits, note }) => (
  <Box title={title}>
    <div className="grid grid-cols-2 gap-x-4 md:gap-x-6 gap-y-3">
      {Object.entries(QUOTA_LABELS).filter(([k]) => limits[k]).map(([k, label]) => {
        const u = used[k] || 0;
        const limit = limits[k];
        return (
          <div key={k}>
            <div className="flex justify-between text-xs mb-1"><span className="text-ink-muted">{label}</span><span className="text-ink">{u}/{limit}</span></div>
            <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, (u / limit) * 100)}%`, background: u >= limit ? '#f43f5e' : '#3ecf8e' }}/>
            </div>
          </div>
        );
      })}
    </div>
    <p className="text-[11px] text-ink-soft mt-3">{note}</p>
  </Box>
);

const readJson = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; }
};

const StatistikPage = () => {
  const { session, profile } = useAuth();
  const [soal, setSoal] = useState(null);
  const [ai, setAi] = useState(undefined); // undefined = memuat, null = tidak tersedia

  useEffect(() => {
    if (!session) { navigate('/'); return; }
    window.sbLoadSoalProgress?.().then(map => setSoal(map || {})).catch(() => setSoal({}));
    window.aiCall?.('stats').then(d => setAi(d.ok ? d.data : null));
  }, [session]);

  const presence = useMemo(() => (window.loadPresence?.() || { daysPresent: [] }).daysPresent || [], []);
  const activity = useMemo(() => window.loadMaddahActivity?.() || {}, []);
  const notes = useMemo(() => (window.loadNotes?.() || []).length, []);
  const muqaranah = useMemo(() => (readJson('madad_muqaranah_custom', []) || []).length, []);

  if (!session) return null;

  const streak = computeStreak(presence);
  const last30 = presence.filter(d => d >= isoDay(Date.now() - 29 * DAY_MS)).length;
  const maddahEntries = Object.entries(activity).map(([id, a]) => {
    const m = window.getMaddahById?.(id) || window.getMahadMaddahById?.(id);
    return { id, name: m?.name || id, opens: a.opens || 0, prompts: a.promptsCopied || 0 };
  });
  const totalOpens = maddahEntries.reduce((s, x) => s + x.opens, 0);
  const totalPrompts = maddahEntries.reduce((s, x) => s + x.prompts, 0);
  const topMaddah = maddahEntries.sort((a, b) => b.opens - a.opens).slice(0, 6);
  const soalCounts = soal ? Object.values(soal).reduce((c, s) => ({ ...c, [s]: (c[s] || 0) + 1 }), {}) : null;
  const firstName = (session.name || '').split(' ')[0];

  return (
    <div className="page-enter">
      <div className="container-x pt-4 md:pt-8">
        <button onClick={() => navigate('/dashboard')} className="text-sm text-ink-soft hover:text-ink inline-flex items-center gap-1.5" style={{ minHeight: 40 }}>
          <Icon name="chevronLeft" className="w-4 h-4"/> Beranda
        </button>
      </div>
      <section className="container-x pt-2 pb-8">
        <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-3">Statistik Belajarku</div>
        <h1 className="font-display text-3xl md:text-5xl font-semibold text-ink leading-tight">
          {streak > 0 ? <>🔥 {streak} hari berturut-turut, {firstName}.</> : <>Ayo mulai lagi hari ini, {firstName}.</>}
        </h1>
        <p className="text-ink-muted mt-3 max-w-2xl">
          Ringkasan perjalanan belajarmu di Talqeeh. Sedikit tapi rutin lebih baik daripada banyak tapi jarang.
        </p>
      </section>

      <div className="container-x pb-24 space-y-8">
        {/* Ritme */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Tile value={streak} label="Hari beruntun" accent="text-emerald-300"/>
          <Tile value={last30} label="Hari belajar (30 hari)" sub={`${presence.length} hari sepanjang waktu`}/>
          <Tile value={totalOpens} label="Maddah dibuka"/>
          <Tile value={totalPrompts} label="Prompt disalin"/>
        </div>
        <Box title="Ritme 12 pekan terakhir"><Heatmap days={presence}/></Box>

        {/* Profil Belajar */}
        <Box title="Profil belajarku">
          {cognitiveScores(profile) ? (
            <div className="grid md:grid-cols-2 gap-4 items-center">
              <div className="flex justify-center"><RadarChart dims={COGNITIVE_DIMS} values={cognitiveScores(profile)} size={280}/></div>
              <div>
                <ul className="space-y-2 text-sm text-ink mb-4">
                  {cognitiveInsights(cognitiveScores(profile)).adaptations.slice(0, 3).map(a => <li key={a}>→ {a}</li>)}
                </ul>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => navigate('/profil-belajar')} className="btn btn-ghost text-xs px-4 py-2">Lihat detail</button>
                  <button onClick={() => navigate('/profil-belajar?retake=1')} className="btn btn-ghost text-xs px-4 py-2">Ulangi tes</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 flex-wrap">
              <p className="text-sm text-ink-muted flex-1 min-w-[220px]">Isi Profil Belajar (±3 menit) supaya AI Partner, prompt, dan saran harian menyesuaikan cara belajarmu.</p>
              <button onClick={() => navigate('/profil-belajar')} className="btn btn-primary text-xs px-4 py-2">Mulai</button>
            </div>
          )}
        </Box>

        {/* Library */}
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-gold-400 mb-3">Library</div>
          <div className="grid lg:grid-cols-3 gap-4">
            <Box title="Maddah yang paling sering kamu buka" className="lg:col-span-2">
              <HBarList color="#c9a86a" items={topMaddah.map(m => ({ label: m.name, sub: `${m.prompts} prompt`, value: m.opens }))}
                format={v => `${v}×`} empty="Belum ada maddah yang dibuka. Mulai dari menu Maddah di Library."/>
            </Box>
            <div className="space-y-4">
              <Box title="Bank soal (cek diri)">
                {soalCounts === null ? <div className="text-sm text-ink-muted">Memuat…</div>
                  : (soalCounts.paham || soalCounts.belum)
                    ? <ProportionBar parts={[
                        { label: 'Paham', value: soalCounts.paham || 0, color: '#3ecf8e' },
                        { label: 'Belum', value: soalCounts.belum || 0, color: '#f59e0b' },
                      ]}/>
                    : <div className="text-sm text-ink-muted">Belum ada soal yang kamu tandai.</div>}
              </Box>
              <div className="grid grid-cols-2 gap-3">
                <Tile value={notes} label="Catatan Kurasah"/>
                <Tile value={muqaranah} label="Muqaranah buatanmu"/>
              </div>
            </div>
          </div>
        </div>

        {/* AI Partner */}
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-gold-400 mb-3">AI Partner</div>
          {ai === undefined ? (
            <div className="card-glass p-6"><Skeleton lines={3}/></div>
          ) : !ai || ai.sets === 0 ? (
            <div className="card-glass p-6 flex items-center gap-4 flex-wrap">
              <Icon name="sparkles" className="w-5 h-5 text-emerald-300"/>
              <div className="flex-1 min-w-[220px] text-sm text-ink-muted">
                Belum ada materi di AI Partner. Unggah diktat atau rekaman kuliah untuk mulai belajar dengan ringkasan, flashcard, dan soal dari materimu sendiri.
              </div>
              <button onClick={() => navigate('/ai-partner')} className="btn btn-primary text-sm px-4 py-2">Buka AI Partner</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <Tile value={ai.sets} label="Materi"/>
                <Tile value={`${ai.mastered}/${ai.cards}`} label="Kartu sudah hafal" accent="text-emerald-300"/>
                <Tile value={ai.due} label="Kartu perlu diulang" accent={ai.due ? 'text-gold-300' : 'text-ink'}/>
                <Tile value={ai.quizAvg == null ? '—' : `${ai.quizAvg}%`} label="Rata-rata kuis terbaik"/>
                <Tile value={ai.essayAvg == null ? '—' : `${ai.essayAvg}/10`} label="Rata-rata tahriri"/>
              </div>
              <div className="grid lg:grid-cols-2 gap-4">
                <Box title="Perkembangan nilai tahriri">
                  {ai.essays.length > 1
                    ? <LineChart color="#c9a86a" data={ai.essays.map((e, i) => ({ day: e.at?.slice(0, 10), label: `Jawaban ${i + 1} · ${e.title}`, value: e.skor }))} format={v => `${v}/10`}/>
                    : <div className="text-sm text-ink-muted">Kerjakan minimal 2 latihan tahriri untuk melihat perkembanganmu.</div>}
                </Box>
                <Box title="Skor kuis terbaik per materi">
                  <HBarList items={ai.quizzes.map(q => ({ label: q.title, value: q.pct }))} format={v => `${v}%`}
                    empty="Belum ada kuis yang diselesaikan."/>
                </Box>
              </div>
              {ai.limits && (
                <div className="grid lg:grid-cols-2 gap-4">
                  <QuotaBox title="Jatah AI hari ini" used={ai.usageToday} limits={ai.limits}
                    note="Jatah harian direset setiap hari pukul 07.00 WIB (tengah malam UTC)."/>
                  {ai.monthlyLimits && (
                    <QuotaBox title="Jatah AI bulan ini" used={ai.usageMonth || {}} limits={ai.monthlyLimits}
                      note="Jatah bulanan direset setiap tanggal 1."/>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

window.StatistikPage = StatistikPage;
