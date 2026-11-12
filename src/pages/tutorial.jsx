import React, { useState, useEffect } from 'react';

/* ════════════════════════════════════════════════════════════════
   TUTORIAL — video singkat per fitur (bersuara). Publik, tanpa login. Route: #/tutorial.
   Dua versi rekaman: HP (9:16) di public/videos/tutorial/NN.mp4 + NN.jpg, dan laptop (16:9)
   di public/videos/tutorial/desktop/NN.mp4 + NN.jpg. Versi dipilih dari lebar layar;
   pengguna bisa menggantinya (disimpan per perangkat).
   ════════════════════════════════════════════════════════════════ */

const VIDEOS = [
  { n: '01', group: 'AI Partner', title: 'Upload materi ke AI Partner', desc: "Masukkan diktat, PDF, atau foto kitab, lalu pelajari lewat Pahami, Hafalkan, Uji Diri, dan Tanya.", dur: '0:34' },
  { n: '02', group: 'AI Partner', title: 'Talkhis otomatis + terjemah', desc: 'Petakan mabahits, tulis talkhis per judul, terjemahkan, lalu unduh PDF.', dur: '0:33' },
  { n: '03', group: 'AI Partner', title: "Terjemah & i'rab kalimat", desc: "Blok kalimat Arab, dapat terjemah harfiyah, terjemah bebas, dan i'rab per kata.", dur: '0:23' },
  { n: '04', group: 'AI Partner', title: 'Ringkasan, flashcard & kuis', desc: 'Ringkasan, peta konsep, flashcard, mufradat, kuis, dan tahriri yang dinilai AI.', dur: '0:25' },
  { n: '05', group: 'Kuliah & tanya', title: 'Live Caption kuliah duktur', desc: 'Ucapan duktur jadi teks Arab plus terjemah, tandai bagian penting, buat talkhisan.', dur: '0:29' },
  { n: '06', group: 'Kuliah & tanya', title: 'Tanya AI', desc: 'Tanya langsung di Talqeeh, jawaban sesuai muqarrar, simpan ke Kurasah.', dur: '0:23' },
  { n: '07', group: 'Kuliah & tanya', title: 'Tutor & simulasi syafawi', desc: 'Tutor dari materimu sendiri, dan latihan syafawi dengan suara.', dur: '0:25' },
  { n: '08', group: 'Library & imtihan', title: 'Maddah & template prompt', desc: 'Kitab utama, AI terbaik, dan template prompt per maddah.', dur: '0:23' },
  { n: '09', group: 'Library & imtihan', title: 'Bank Soal & Siap Imtihan', desc: 'Soal tahun-tahun sebelumnya dan mode persiapan tahriri & syafawi.', dur: '0:25' },
  { n: '10', group: 'Library & imtihan', title: 'Kurasah', desc: 'Simpan catatan, beri tag, cari, dan export cadangannya.', dur: '0:21' },
  { n: '11', group: 'Akun', title: 'Kupon Paket Imtihan dari Instagram', desc: 'Follow @talqeeh, unggah screenshot, dapat kode kupon Rp149.000.', dur: '0:30' },
  { n: '12', group: 'Akun', title: 'Ganti ke tema terang', desc: 'Pindah tema gelap atau terang dari Menu.', dur: '0:21' },
];
const GROUPS = ['Semua', ...new Set(VIDEOS.map(v => v.group))];
const src = (n, ext, desk) => `/videos/tutorial/${desk ? 'desktop/' : ''}${n}.${ext}`;

/* Versi video: laptop untuk layar lebar, HP untuk layar sempit. Pilihan manual disimpan per perangkat. */
const VARIANT_KEY = 'talqeeh_tutorial_variant';
const WIDE_QUERY = '(min-width: 900px)';
const readVariant = () => {
  try { const s = localStorage.getItem(VARIANT_KEY); if (s === 'desktop' || s === 'mobile') return s; } catch {}
  return window.matchMedia?.(WIDE_QUERY).matches ? 'desktop' : 'mobile';
};
const useVariant = () => {
  const [variant, setVariant] = useState(readVariant);
  useEffect(() => {
    const mq = window.matchMedia?.(WIDE_QUERY);
    if (!mq) return;
    // Ikuti perubahan lebar layar selama pengguna belum memilih sendiri.
    const f = () => { let saved = null; try { saved = localStorage.getItem(VARIANT_KEY); } catch {} if (!saved) setVariant(mq.matches ? 'desktop' : 'mobile'); };
    mq.addEventListener?.('change', f);
    return () => mq.removeEventListener?.('change', f);
  }, []);
  const choose = (v) => { try { localStorage.setItem(VARIANT_KEY, v); } catch {} setVariant(v); };
  return [variant, choose];
};

const Player = ({ index, desk, onClose, onGo }) => {
  const v = VIDEOS[index];
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && index < VIDEOS.length - 1) onGo(index + 1);
      if (e.key === 'ArrowLeft' && index > 0) onGo(index - 1);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [index]);
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-3" role="dialog" aria-modal="true" aria-label={v.title}
      style={{ background: 'rgba(0,0,0,0.9)' }} onClick={onClose}>
      <div className="relative w-full flex flex-col items-center" style={{ maxWidth: desk ? 'min(1120px, calc((100dvh - 150px) * 16 / 9))' : 420 }} onClick={e => e.stopPropagation()}>
        <div className="w-full flex items-center justify-between gap-3 mb-2 px-1">
          <div className="min-w-0">
            <div className="text-[11px] tracking-wider font-semibold" style={{ color: '#86efac' }}>VIDEO {v.n} DARI {VIDEOS.length}</div>
            <div className="font-semibold text-[15px] truncate" style={{ color: '#fff' }}>{v.title}</div>
          </div>
          <button onClick={onClose} aria-label="Tutup video" className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.12)' }}>
            <Icon name="x" className="w-5 h-5" style={{ stroke: '#fff' }}/>
          </button>
        </div>
        <video key={`${desk}-${v.n}`} src={src(v.n, 'mp4', desk)} poster={src(v.n, 'jpg', desk)} controls autoPlay playsInline preload="auto"
          onEnded={() => index < VIDEOS.length - 1 && onGo(index + 1)}
          className="w-full rounded-2xl" style={{ background: '#000', aspectRatio: desk ? '16 / 9' : '9 / 16', maxHeight: 'calc(100dvh - 150px)', objectFit: 'contain' }}/>
        <div className="w-full flex justify-between gap-2 mt-3">
          <button disabled={index === 0} onClick={() => onGo(index - 1)} className="px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>← Sebelumnya</button>
          <button disabled={index === VIDEOS.length - 1} onClick={() => onGo(index + 1)} className="px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-30"
            style={{ background: '#3ecf8e', color: '#04140c' }}>Berikutnya →</button>
        </div>
      </div>
    </div>
  );
};

const VideoCard = ({ v, desk, onPlay }) => (
  <button onClick={onPlay} className="group text-left rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] hover:border-emerald-500/40 transition-colors"
    aria-label={`Putar video: ${v.title}`}>
    <div className="relative" style={{ aspectRatio: desk ? '16 / 9' : '9 / 16', background: '#0b0f0d' }}>
      <img src={src(v.n, 'jpg', desk)} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover"/>
      <span className="absolute inset-0 flex items-center justify-center" style={{ paddingTop: desk ? 0 : '38%', paddingLeft: desk ? '42%' : 0 }}>
        <span className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ background: 'rgba(62,207,142,0.95)', boxShadow: '0 8px 24px rgba(0,0,0,0.45)' }}>
          <Icon name="play" className="w-6 h-6" style={{ stroke: '#04140c', fill: '#04140c' }}/>
        </span>
      </span>
      <span className="absolute bottom-2 right-2 text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ background: 'rgba(0,0,0,0.72)', color: '#fff' }}>{v.dur}</span>
    </div>
    <div className="p-3">
      <div className="text-sm font-semibold text-ink leading-snug">{v.title}</div>
      <div className="text-xs text-ink-muted leading-relaxed mt-1 line-clamp-2">{v.desc}</div>
    </div>
  </button>
);

function TutorialPage() {
  const [group, setGroup] = useState('Semua');
  const [playing, setPlaying] = useState(null);
  const [variant, chooseVariant] = useVariant();
  const desk = variant === 'desktop';
  const shown = group === 'Semua' ? VIDEOS : VIDEOS.filter(v => v.group === group);
  const play = (v) => { setPlaying(VIDEOS.indexOf(v)); window.logFunnel?.('tutorial_video', `${desk ? 'd' : 'm'}${v.n}`); };
  const settings = useAppSettings() || {};
  const wa = (settings.whatsapp || '').replace(/\D/g, '') || DEFAULT_ADMIN_WA;

  return (
    <div className="container-x pb-24">
      <div className="max-w-5xl mx-auto">
        <header className="pt-7 md:pt-12 pb-5">
          <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gold-400">Video tutorial</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mt-1.5 leading-tight">Cara pakai Talqeeh</h1>
          <p className="text-[15px] text-ink-muted mt-2 max-w-xl leading-relaxed">
            {VIDEOS.length} video singkat, masing-masing di bawah satu menit. Ketuk video untuk memutarnya.
          </p>
          <div className="mt-4 inline-flex rounded-xl border border-white/10 p-1 bg-white/[0.03]" role="radiogroup" aria-label="Versi tampilan video">
            {[['mobile', 'smartphone', 'Tampilan HP'], ['desktop', 'monitor', 'Tampilan laptop']].map(([id, , label]) => (
              <button key={id} role="radio" aria-checked={variant === id} onClick={() => chooseVariant(id)}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] transition-colors ${variant === id ? 'bg-emerald-500/15 text-emerald-200 font-semibold' : 'text-ink-muted hover:text-ink'}`}>
                {label}
              </button>
            ))}
          </div>
        </header>

        <div className="flex gap-2 overflow-x-auto pb-1 mb-5 -mx-1 px-1" style={{ scrollbarWidth: 'none' }} role="tablist" aria-label="Kelompok video">
          {GROUPS.map(g => (
            <button key={g} role="tab" aria-selected={group === g} onClick={() => setGroup(g)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-full text-sm border transition-colors ${group === g ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 font-semibold' : 'border-white/10 text-ink-muted hover:text-ink hover:bg-white/5'}`}>
              {g}
            </button>
          ))}
        </div>

        <div className={`grid gap-3 md:gap-4 ${desk ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
          {shown.map(v => <VideoCard key={v.n} v={v} desk={desk} onPlay={() => play(v)}/>)}
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div>
            <div className="text-sm font-semibold text-ink">Masih bingung?</div>
            <div className="text-xs text-ink-muted mt-0.5">Tanya admin Talqeeh lewat WhatsApp, kami bantu langsung.</div>
          </div>
          {wa && (
            <a href={`https://wa.me/${wa}?text=${encodeURIComponent('Assalamualaikum, saya mau tanya cara pakai Talqeeh.')}`} target="_blank" rel="noopener noreferrer"
              className="btn btn-ghost text-sm px-4 py-2.5 justify-center">Chat admin</a>
          )}
        </div>
      </div>

      {playing != null && <Player index={playing} desk={desk} onClose={() => setPlaying(null)} onGo={setPlaying}/>}
    </div>
  );
}

window.TutorialPage = TutorialPage;
