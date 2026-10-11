import React, { useState, useEffect } from 'react';
/* Talqeeh — layar upgrade saat jatah gratis habis.
   Dibuka lewat openAiUpgrade(reason) (ai-partner-shared.jsx) → event "talqeeh:upgrade-wall". Menjelaskan apa yang barusan
   dicoba, apa yang terbuka kalau berlangganan, harga (promo + hitung mundur bila event berjalan), lalu tombol bayar.
   Akun gratis diarahkan ke Paket Imtihan; member Library ke langganan AI Partner. */

const REASONS = {
  irab:     { title: "Jatah i'rab gratismu sudah habis", tried: "Kamu sudah merasakan i'rab otomatis. Pelanggan bisa meng-i'rab kalimat dari muqarrar kapan saja." },
  tutor:    { title: 'Jatah tanya tutor gratismu sudah habis', tried: 'Tutor AI menjelaskan materimu sampai paham. Pelanggan bisa bertanya setiap hari.' },
  syafawi:  { title: 'Latihan syafawi khusus pelanggan', tried: 'Latihan syafawi menguji hafalan dan pemahamanmu seperti imtihan lisan.' },
  prompt:   { title: 'Percakapan gratismu sudah terpakai', tried: 'Tanya AI menjawab pertanyaan seputar maddahmu. Pelanggan bisa bertanya setiap hari.' },
  materi:   { title: 'Jatah 1 materi gratismu sudah terpakai', tried: 'Pelanggan bisa menambah materi baru kapan saja, termasuk PDF muqarrar utuh.' },
  ocr:      { title: 'Jatah baca foto gratismu sudah habis', tried: 'Pelanggan bisa membaca foto halaman kitab dan PDF muqarrar sekaligus.' },
  pdf:      { title: 'Upload PDF muqarrar khusus pelanggan', tried: 'Upload PDF muqarrar utuh, lalu Talqeeh mengolahnya jadi ringkasan, kuis, dan talkhis.' },
  talkhis:  { title: 'Talkhis otomatis khusus pelanggan', tried: 'Talkhis Arab gaya Masisir dari muqarrarmu sendiri, dicek kelengkapannya, siap dicetak jadi PDF.' },
  preview:  { title: 'Buka semua alat belajar untuk materi ini', tried: 'Ringkasan tadi baru sebagian kecil. Peta konsep, latihan tahriri, dan talkhis menunggu di balik langganan.' },
  default:  { title: 'Fitur ini khusus pelanggan', tried: 'Berlangganan untuk membuka semua fitur AI Partner.' },
};

const UNLOCKS = [
  'Talkhis otomatis dari PDF muqarrar, siap cetak + latihan soal',
  'Tambah materi setiap hari: PDF, foto, Word, audio & video kuliah',
  "I'rab, tutor, peta konsep, dan latihan tahriri yang dinilai AI",
  'Bank soal imtihan asli, banin & banat',
];

const UpgradeWall = () => {
  const { isFree } = useAuth();
  const [reason, setReason] = useState(null);
  const left = window.usePromoCountdown ? window.usePromoCountdown() : null;
  const offer = useWelcomeOffer();

  useEffect(() => {
    const open = (e) => {
      const r = e.detail?.reason || 'default';
      setReason(r);
      window.logFunnel?.('paywall', `wall_${r}`);
    };
    window.addEventListener('talqeeh:upgrade-wall', open);
    return () => window.removeEventListener('talqeeh:upgrade-wall', open);
  }, []);
  useEffect(() => {
    if (!reason) return;
    const onKey = (e) => { if (e.key === 'Escape') setReason(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reason]);

  if (!reason) return null;
  const copy = REASONS[reason] || REASONS.default;
  const P = window.IMTIHAN_PROMO;
  const promo = isFree && left && P;
  const price = offer ? offer.price : promo ? P.price : window.IMTIHAN_PRICE_IDR;
  const close = () => setReason(null);
  const pay = () => {
    window.logFunnel?.('click_pay', `wall_${reason}`);
    close();
    if (isFree) navigate('/gabung?plan=imtihan');
    else window.dispatchEvent(new CustomEvent('talqeeh:open-join', { detail: { plan: 'library_ai' } }));
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="upgrade-wall-title">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close}/>
      <div className="relative w-full sm:max-w-md max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#121614] p-5 sm:p-6 shadow-2xl">
        <button onClick={close} aria-label="Tutup" className="absolute top-3 right-3 w-9 h-9 rounded-xl text-ink-muted hover:text-ink hover:bg-white/5 flex items-center justify-center">
          <Icon name="x" className="w-4 h-4"/>
        </button>
        <div className="w-11 h-11 rounded-2xl mb-3 flex items-center justify-center bg-gold-500/12 border border-gold-500/25">
          <Icon name="crown" className="w-5 h-5 text-gold-300"/>
        </div>
        <h2 id="upgrade-wall-title" className="font-display text-xl font-semibold text-ink pr-8 leading-snug">{copy.title}</h2>
        <p className="text-sm text-ink-muted mt-1.5 leading-relaxed">{copy.tried}</p>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-[11px] uppercase tracking-wider text-ink-soft mb-2">{isFree ? 'Dengan Paket Imtihan kamu dapat' : 'Dengan AI Partner kamu dapat'}</div>
          <ul className="space-y-1.5">
            {(isFree ? [...UNLOCKS, `Library ${window.CATALOG?.maddah || 93} maddah, akses selamanya`] : UNLOCKS).map(t => (
              <li key={t} className="flex gap-2 text-sm text-ink leading-snug">
                <Icon name="check" className="w-4 h-4 text-emerald-300 flex-shrink-0 mt-0.5"/>{t}
              </li>
            ))}
          </ul>
        </div>

        {isFree && P && (
          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              {(offer || promo) && <div className="text-xs text-ink-soft line-through">{formatRupiah(window.IMTIHAN_PRICE_IDR)}</div>}
              <div className="font-display text-2xl font-semibold text-ink">{formatRupiah(price)}</div>
              <div className="text-[11px] text-ink-soft">sekali bayar · AI {window.IMTIHAN_AI_DAYS || 120} hari + Library selamanya</div>
            </div>
            {offer ? (
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-gold-300">Harga khususmu hangus</div>
                <OfferClock endsAt={offer.endsAt} className="text-base font-semibold text-gold-200"/>
              </div>
            ) : promo && (
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-emerald-300">Promo berakhir</div>
                <div className="text-sm font-semibold text-ink whitespace-nowrap">{left}</div>
              </div>
            )}
          </div>
        )}

        <button onClick={pay} className="btn btn-gold w-full justify-center text-sm py-3 mt-4">
          {isFree ? `Ambil Paket Imtihan ${formatRupiah(price)}` : 'Berlangganan AI Partner'}
          <Icon name="arrowRight" className="w-4 h-4"/>
        </button>
        <div className="flex items-center justify-between mt-3 text-xs">
          {isFree ? <button onClick={() => { close(); navigate('/gabung'); }} className="text-ink-muted hover:text-ink underline underline-offset-2">Lihat semua paket</button> : <span/>}
          <button onClick={close} className="text-ink-soft hover:text-ink-muted">Nanti saja</button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { UpgradeWall });
