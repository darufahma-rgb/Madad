import React, { useState, useEffect } from 'react';
/* Talqeeh — Admin: Email & Event. Unduh daftar email member (untuk dikirim sendiri lewat Gmail/WhatsApp)
   dan teks pengumuman event siap salin. Server: action email-export di api/admin-members.js → api/_lib/email.js. */

const emailAdminCall = async (action, extra = {}) => {
  const r = await fetch('/api/admin-members', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': sessionStorage.getItem('talqee_admin_token') || '' },
    body: JSON.stringify({ action, ...extra }),
  });
  if (r.status === 401) { sessionStorage.removeItem('talqee_admin_token'); window.location.reload(); throw new Error('Sesi admin habis'); }
  let j = null;
  try { j = await r.json(); } catch {}
  if (!j || !j.ok) throw new Error((j && j.error) || `Gagal (status ${r.status})`);
  return j.data;
};

const AUDIENCE_OPTIONS = [
  ['no_ai', 'Belum berlangganan AI (gratis + Library tanpa AI)'],
  ['free', 'Akun gratis saja'],
  ['trial_ai', 'Pernah coba AI, belum berlangganan'],
];

const SITE = 'https://talqeeh.vercel.app';
const fmt = (n) => `Rp ${Number(n).toLocaleString('id-ID')}`;

// Teks pengumuman event. {nama} diganti sendiri saat mengirim (atau hapus kalau kirim massal lewat BCC).
const eventTemplates = () => {
  const P = window.IMTIHAN_PROMO, normal = window.IMTIHAN_PRICE_IDR, days = window.IMTIHAN_AI_DAYS;
  const link = `${SITE}/#/gabung?plan=imtihan`;
  return [
    {
      id: 'email_free', title: 'Email — akun gratis (Paket Imtihan promo)',
      subject: `${P.name} Talqeeh: Paket Imtihan cuma ${fmt(P.price)} sampai ${P.endLabel}`,
      body: `Assalamu'alaikum {nama},

Imtihan termin satu tinggal hitungan bulan. Biar persiapannya nggak mepet, Talqeeh lagi ngadain ${P.name}, sampai ${P.endLabel}.

Selama event, Paket Imtihan cuma ${fmt(P.price)} (normalnya ${fmt(normal)}):
• Library selamanya: ${window.CATALOG?.maddah || 88} maddah S1 & Ma'had, ${window.CATALOG?.prompts || '1.200+'} template prompt, bank soal tahriri, Siap Imtihan, dan muqaranah 4 madzhab
• AI Study Partner ${days} hari, satu termin penuh: unggah diktatmu, lalu dapat ringkasan gaya kitab, flashcard, kuis, terjemah & i'rab, dan tutor yang menjawab dari materimu sendiri

Sekali bayar, tanpa potongan otomatis. Bayar lewat QRIS, virtual account, atau e-wallet, aksesnya langsung aktif.

Belum yakin? Coba dulu gratis: unggah satu materi, lalu coba i'rab dan tanya tutornya.

Ambil promonya di sini: ${link}

Promo berakhir ${P.endLabel} pukul 23.59 waktu Kairo.

Semangat muraja'ahnya,
Tim Talqeeh`,
    },
    {
      id: 'wa_free', title: 'WhatsApp — akun gratis',
      body: `Assalamu'alaikum {nama} 👋

Talqeeh lagi ada *${P.name}* sampai *${P.endLabel}* 🎯

*Paket Imtihan* cuma *${fmt(P.price)}* (normal ${fmt(normal)}):
✅ Library selamanya (semua maddah, bank soal, Siap Imtihan)
✅ AI Study Partner *${days} hari*: ringkasan, flashcard, kuis, i'rab & tutor dari diktatmu sendiri

Sekali bayar, tanpa potongan otomatis.
👉 ${link}

Promo berakhir ${P.endLabel} pukul 23.59 waktu Kairo.`,
    },
    {
      id: 'email_library', title: 'Email — member Library tanpa AI',
      subject: 'Diktat tebal, imtihan makin dekat: coba AI Study Partner Talqeeh',
      body: `Assalamu'alaikum {nama},

Terima kasih sudah jadi member Library Talqeeh. Menjelang imtihan, ada satu fitur yang bisa bikin muraja'ahmu jauh lebih ringan: AI Study Partner.

Unggah diktat, PDF scan, foto, atau rekaman kuliah, lalu Talqeeh menyiapkan:
• ringkasan gaya kitab dan peta konsep taqsimat
• flashcard dan kuis dari materimu sendiri
• terjemah & i'rab kalimat Arab, plus tutor yang menjawab dari diktatmu

Tambahkan kapan saja dari akunmu, per 30 hari, tanpa potongan otomatis: ${SITE}/#/ai-partner

Semangat muraja'ahnya,
Tim Talqeeh`,
    },
  ];
};

const copy = async (text, toast, label) => {
  try { await navigator.clipboard.writeText(text); toast?.push(`${label} disalin`); } catch { toast?.push('Gagal menyalin'); }
};

const downloadCsv = (rows, audience) => {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = ['Nama,Email,Paket,Pernah coba AI']
    .concat(rows.map(r => [r.name, r.email, r.tier === 'free' ? 'Gratis' : 'Library', r.tried_ai ? 'Ya' : 'Tidak'].map(esc).join(',')))
    .join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `talqeeh-email-${audience}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
};

const AdminEmail = () => {
  const toast = useToast();
  const [audience, setAudience] = useState('no_ai');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true); setError('');
    emailAdminCall('email-export', { audience })
      .then(d => { if (alive) setData(d); })
      .catch(e => { if (alive) { setError(e.message); setData(null); } })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [audience]);

  const rows = data?.rows || [];
  const free = rows.filter(r => r.tier === 'free').length;
  const promoOn = window.imtihanPromoActive?.();
  const P = window.IMTIHAN_PROMO;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">Email & Event</h2>
        <p className="text-sm text-ink-muted mt-1">Unduh daftar email member untuk dikirim sendiri, lengkap dengan teks pengumuman event.</p>
      </div>

      {P && (
        <div className={`rounded-xl border p-4 text-sm ${promoOn ? 'border-emerald-500/30 bg-emerald-500/8 text-ink' : 'border-white/10 bg-white/4 text-ink-muted'}`}>
          <b>{P.name}</b> · Paket Imtihan {fmt(P.price)} (normal {fmt(window.IMTIHAN_PRICE_IDR)}) ·{' '}
          {promoOn ? `berlangsung sampai ${P.endLabel} 23.59 waktu Kairo` : 'sedang tidak berlangsung'}.
          <div className="text-xs text-ink-soft mt-1">Banner + hitung mundur tampil otomatis untuk pengunjung & akun gratis selama event. Tanggal & harga diatur di IMTIHAN_PROMO (src/layout.jsx dan api/_lib/payments.js).</div>
        </div>
      )}

      <section className="card-glass-strong p-5 space-y-4">
        <h3 className="font-display text-lg font-semibold text-ink">Daftar email</h3>
        <div className="flex flex-wrap gap-2">
          {AUDIENCE_OPTIONS.map(([id, label]) => (
            <button key={id} type="button" aria-pressed={audience === id} onClick={() => setAudience(id)}
              className={`rounded-full border px-3 py-1.5 text-xs ${audience === id ? 'border-emerald-500 text-emerald-200 bg-emerald-500/10' : 'border-white/15 text-ink-muted hover:text-ink'}`}>{label}</button>
          ))}
        </div>
        {error ? <div className="text-sm text-rose-400" role="alert">{error}</div>
          : loading || !data ? <div className="text-sm text-ink-muted" role="status">Memuat…</div>
          : (
            <>
              <div className="text-sm text-ink">
                <b>{rows.length.toLocaleString('id-ID')}</b> email
                {audience === 'no_ai' && <span className="text-ink-muted"> · {free} akun gratis, {rows.length - free} member Library tanpa AI</span>}
                {data.optedOut > 0 && <span className="text-ink-soft"> · {data.optedOut} yang sudah berhenti berlangganan tidak ikut</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => downloadCsv(rows, audience)} disabled={!rows.length} className="btn btn-primary text-sm px-4 py-2 disabled:opacity-50">
                  <Icon name="download" className="w-4 h-4"/> Unduh CSV
                </button>
                <button onClick={() => copy(rows.map(r => r.email).join(', '), toast, `${rows.length} email`)} disabled={!rows.length} className="btn btn-ghost text-sm px-4 py-2 disabled:opacity-50">
                  Salin semua email (untuk BCC)
                </button>
              </div>
              <p className="text-[11px] text-ink-soft leading-relaxed">
                Kirim lewat BCC (jangan To/CC) supaya alamat member tidak saling terlihat. Gmail biasa maksimal ±500 penerima per hari, jadi bagi menjadi beberapa kiriman bila perlu.
                Kolom "Paket" di CSV memisahkan akun gratis dan member Library: Paket Imtihan hanya bisa dibeli akun gratis.
              </p>
            </>
          )}
      </section>

      <section className="space-y-4">
        <h3 className="font-display text-lg font-semibold text-ink">Teks siap salin</h3>
        {eventTemplates().map(t => (
          <div key={t.id} className="card-glass p-5">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
              <div className="text-sm font-medium text-ink">{t.title}</div>
              <div className="flex gap-2">
                {t.subject && <button onClick={() => copy(t.subject, toast, 'Subjek')} className="btn btn-ghost !min-h-0 !py-1.5 !px-3 text-xs">Salin subjek</button>}
                <button onClick={() => copy(t.body, toast, 'Isi')} className="btn btn-ghost !min-h-0 !py-1.5 !px-3 text-xs">Salin isi</button>
              </div>
            </div>
            {t.subject && <div className="text-xs text-ink-muted mb-2"><span className="text-ink-soft">Subjek:</span> {t.subject}</div>}
            <pre className="whitespace-pre-wrap text-[13px] text-ink leading-relaxed bg-black/25 rounded-lg p-3 max-h-80 overflow-y-auto" style={{ fontFamily: 'inherit' }}>{t.body}</pre>
          </div>
        ))}
        <p className="text-[11px] text-ink-soft">Ganti {'{nama}'} dengan nama penerima, atau ganti dengan "teman-teman" kalau dikirim massal lewat BCC.</p>
      </section>
    </div>
  );
};

Object.assign(window, { AdminEmail });
