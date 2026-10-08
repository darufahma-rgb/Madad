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

const SITE = 'https://talqeeh.id';
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


/* ── Kirim lewat Talqeeh (Resend) ──
   Email dikirim satu per penerima dari alamat EMAIL_FROM, dengan nama penerima ({nama}) dan link berhenti
   berlangganan otomatis. Server: action email-test / email-create / email-send-batch di api/_lib/email.js.
   Dikirim per 50 penerima; kalau kena batas harian Resend, sisanya tetap "pending" dan bisa dilanjutkan. */
const CAMPAIGN_LINK = `${SITE}/#/gabung?plan=imtihan`;
const campaignPresets = () => {
  const P = window.IMTIHAN_PROMO, normal = window.IMTIHAN_PRICE_IDR, days = window.IMTIHAN_AI_DAYS;
  const end = P ? `${P.endLabel}, pukul 23.59 waktu Kairo` : 'akhir promo';
  const price = P ? fmt(P.price) : '';
  const maddah = window.CATALOG?.maddah || 93, prompts = window.CATALOG?.prompts || '1.250+';
  return [
    {
      id: 'h5', label: 'Email 1 · H-5: Talkhis otomatis',
      subject: '🚀 Muqarrarmu bisa jadi talkhisan rapi dalam 10 menit!',
      cta_label: `AMBIL PROMO ${price.toUpperCase()} SEKARANG!`,
      body: `Assalamu'alaikum {nama},

## 🚀 MUQARRARMU BISA JADI TALKHISAN RAPI DALAM 10 MENIT!

Imtihan memang masih beberapa bulan lagi. Tapi coba bayangkan kalau nanti waktu muraja'ah tiba, kamu masih sibuk mencari talkhisan, merangkum muqarrar, dan mengumpulkan soal-soal tahun lalu.

*Padahal, waktu itu seharusnya sudah bisa kamu gunakan untuk memahami dan menghafal materi.*

Karena itu, Talqeeh menghadirkan fitur terbaru:

## 🚀 TALKHIS OTOMATIS — Dari Muqarrar Jadi Materi Siap Muraja'ah!

Cukup upload PDF muqarrarmu, lalu Talqeeh membantu:
✅ Menyusun fihris dari seluruh mabahits.
✅ Membuat talkhis berbahasa Arab dengan gaya talkhisan Masisir.
✅ Mengecek kembali setiap pembahasan ke muqarrar agar bagian yang kurang bisa dilengkapi.
✅ Menyiapkan PDF berwarna, tulisan nyaman dibaca, lengkap dengan latihan soal dan kunci jawaban.

*Bukan cuma meringkas. Tapi membantu kamu mempersiapkan materi belajar dari jauh-jauh hari.*

## 🎁 PAKET IMTIHAN — PROMO TERBATAS!

> ~~${fmt(normal)}~~
> *SEKARANG CUMA ${price}!*

Sekali bayar, kamu mendapatkan:

📚 *Library Selamanya*
${maddah} maddah, ${prompts} template prompt, dan bank soal imtihan.

🤖 *AI Study Partner ${days} Hari*
Talkhis otomatis, i'rab, tutor AI, kuis, dan latihan tahriri. Tanpa kuota bulanan, dengan batas penggunaan wajar harian.

## ⏳ JANGAN TUNGGU SAMPAI HARGANYA KEMBALI NORMAL!

Promo ${P?.name || 'Paket Imtihan'} *berakhir ${end}.*

Setelah periode promo selesai, harga kembali ${fmt(normal)}.

💚 *Mulai siapkan talkhisanmu hari ini, supaya nanti waktumu lebih banyak untuk muraja'ah.*

[[tombol]]

Semoga Allah mudahkan perjuangan imtihan kita semua.

*Tim Talqeeh*`,
    },
    {
      id: 'h2', label: 'Email 2 · H-2: Bank soal + talkhis',
      subject: '⏰ Tinggal 2 hari: soal imtihan tahun lalu + talkhis otomatis',
      cta_label: 'AMBIL PROMO SEBELUM HABIS!',
      body: `Assalamu'alaikum {nama},

## 📝 TAHU POLA SOALNYA, MURAJA'AH DARI TALKHISAN YANG LENGKAP!

Cara paling aman menghadapi imtihan itu sederhana: tahu soal seperti apa yang biasa keluar, lalu muraja'ah dari ringkasan yang lengkap.

*Di Talqeeh, dua-duanya sudah siap untukmu.*

## 📚 BANK SOAL IMTIHAN ASLI

✅ Soal tahun-tahun sebelumnya dari Syariah, Ushuluddin, Lughah, dan Dirasat Banat.
✅ Lengkap dengan terjemah per soal, jadi lebih mudah dipahami.
✅ Baru masuk: 32 soal Banat Ushuluddin tingkat 1–2 (2024–2026).

## 🚀 TALKHIS OTOMATIS DARI MUQARRARMU SENDIRI

✅ Dibuat dari teks muqarrar yang kamu upload, bukan ringkasan umum.
✅ Dicek kelengkapannya per judul, bagian yang kurang langsung dilengkapi.
✅ Bisa diunduh jadi PDF berwarna, lengkap dengan latihan soal dan kunci jawaban.

*Latihan dari soal asli, muraja'ah dari talkhisan yang rapi. Persiapan imtihan jadi jauh lebih tenang.*

## 🎁 PAKET IMTIHAN — TINGGAL 2 HARI!

> ~~${fmt(normal)}~~
> *SEKARANG CUMA ${price}!*

Sekali bayar, kamu mendapatkan:

📚 *Library Selamanya*
${maddah} maddah, ${prompts} template prompt, dan bank soal imtihan.

🤖 *AI Study Partner ${days} Hari*
Talkhis otomatis, i'rab, tutor AI, kuis, dan latihan tahriri. Tanpa kuota bulanan, dengan batas penggunaan wajar harian.

## ⏳ PROMO BERAKHIR ${(P?.endLabel || '').toUpperCase()}!

Promo ${P?.name || 'Paket Imtihan'} *berakhir ${end}.* Setelah itu, harga kembali ${fmt(normal)}.

💚 *Ambil sekarang selagi masih ${price}, lalu mulai persiapan imtihanmu hari ini juga.*

[[tombol]]

Kalau ada pertanyaan, cukup balas email ini.

Semoga Allah mudahkan perjuangan imtihan kita semua.

*Tim Talqeeh*`,
    },
    {
      id: 'h1', label: 'Email 3 · H-1: Hari terakhir',
      subject: `⏳ Besok terakhir: Paket Imtihan cuma ${price}`,
      cta_label: `AMBIL PROMO ${price.toUpperCase()} SEKARANG!`,
      body: `Assalamu'alaikum {nama},

## ⏳ BESOK HARI TERAKHIR PROMO PAKET IMTIHAN!

Singkat saja: promo ${P?.name || 'Paket Imtihan'} *berakhir besok, ${end}.*

Setelah itu, harga Paket Imtihan kembali ke ${fmt(normal)}.

> ~~${fmt(normal)}~~
> *CUMA ${price}, SEKALI BAYAR!*

## 🎁 YANG KAMU DAPAT

✅ *Talkhis otomatis* dari PDF muqarrarmu, lengkap dengan PDF berwarna, latihan soal, dan kunci jawaban.
✅ *Bank soal imtihan asli* banin dan banat, lengkap dengan terjemah.
✅ *AI Study Partner ${days} hari:* i'rab, tutor AI, kuis, dan latihan tahriri.
✅ *Library selamanya:* ${maddah} maddah dan ${prompts} template prompt.

*Sekali bayar, kepakai sampai imtihan selesai, dan Library-nya tetap milikmu selamanya.*

## 🔥 JANGAN SAMPAI KELEWATAN!

💚 *Bismillah, semoga jadi ikhtiar terbaik untuk imtihan nanti.*

[[tombol]]

Semoga Allah mudahkan perjuangan imtihan kita semua.

*Tim Talqeeh*`,
    },
  ];
};

// Kecilkan poster jadi JPEG lebar maks 1200px sebelum diunggah: email jadi ringan dan tampil di semua aplikasi email.
const shrinkImage = (file) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => {
    const scale = Math.min(1, 1200 / img.naturalWidth);
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * scale); c.height = Math.round(img.naturalHeight * scale);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(img.src);
    resolve(c.toDataURL('image/jpeg', 0.86).split(',')[1]);
  };
  img.onerror = () => reject(new Error('Gambar tidak bisa dibaca'));
  img.src = URL.createObjectURL(file);
});

const fieldClass = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-ink outline-none focus:border-emerald-500/45';

const EmailSender = () => {
  const toast = useToast();
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState(() => ({ cta_label: 'Ambil promo Paket Imtihan', ...campaignPresets()[0], audience: 'free', cta_url: CAMPAIGN_LINK }));
  const [count, setCount] = useState(null);
  const [testTo, setTestTo] = useState('');
  const [busy, setBusy] = useState('');
  const [progress, setProgress] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const loadCampaigns = () => emailAdminCall('email-campaigns').then(setCampaigns).catch(() => setCampaigns([]));
  useEffect(() => {
    emailAdminCall('email-status').then(setStatus).catch(e => setStatus({ error: e.message }));
    loadCampaigns();
  }, []);
  useEffect(() => {
    let alive = true;
    setCount(null);
    emailAdminCall('email-audience', { audience: form.audience })
      .then(d => { if (alive) setCount(d); }).catch(e => { if (alive) setCount({ error: e.message }); });
    return () => { alive = false; };
  }, [form.audience]);

  const payload = () => ({ subject: form.subject, body: form.body, cta_label: form.cta_label, cta_url: form.cta_url, image_url: form.image_url || '' });

  const pickImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy('image');
    try {
      const data = await shrinkImage(file);
      const d = await emailAdminCall('email-upload-image', { data, type: 'image/jpeg' });
      set('image_url', d.url);
    } catch (err) { toast.push(err.message); }
    setBusy('');
  };

  // Pratinjau langsung: render ulang di server 0,6 detik setelah berhenti mengetik.
  const [showPreview, setShowPreview] = useState(true);
  const [preview, setPreview] = useState({ html: '', error: '' });
  useEffect(() => {
    if (!showPreview) return;
    let alive = true;
    const t = setTimeout(() => {
      emailAdminCall('email-preview', payload())
        .then(d => { if (alive) setPreview({ html: d.html, error: '' }); })
        .catch(e => { if (alive) setPreview(p => ({ ...p, error: e.message })); });
    }, 600);
    return () => { alive = false; clearTimeout(t); };
  }, [showPreview, form.subject, form.body, form.cta_label, form.cta_url, form.image_url]);
  const fitFrame = (e) => { try { e.target.style.height = `${e.target.contentDocument.documentElement.scrollHeight + 4}px`; } catch {} };

  const sendTest = async () => {
    setBusy('test');
    try { await emailAdminCall('email-test', { ...payload(), to: testTo, name: 'teman' }); toast.push(`Email tes terkirim ke ${testTo}`); }
    catch (e) { toast.push(e.message); }
    setBusy('');
  };

  // Kirim per batch sampai selesai, atau berhenti saat kena batas Resend (sisanya bisa dilanjutkan nanti).
  const runBatches = async (id, total) => {
    let sent = 0, failed = 0, skipped = 0;
    setProgress({ id, total, sent, failed, skipped });
    for (let guard = 0; guard < 300; guard++) {
      const d = await emailAdminCall('email-send-batch', { id });
      if (d.stopped === 'quota') { toast.push('Batas kirim Resend tercapai. Sisanya bisa dilanjutkan nanti dari daftar kampanye.'); break; }
      sent += d.sent || 0; failed += d.failed || 0; skipped += d.skipped || 0;
      setProgress({ id, total, sent, failed, skipped });
      if (d.done) { toast.push(`Selesai: ${sent} terkirim${failed ? `, ${failed} gagal` : ''}.`); break; }
    }
    loadCampaigns();
  };

  const createAndSend = async () => {
    if (!count?.count) return;
    if (!window.confirm(`Kirim "${form.subject}" ke ${count.count} penerima sekarang? Ini tidak bisa dibatalkan.`)) return;
    setBusy('send');
    try {
      const c = await emailAdminCall('email-create', { ...payload(), audience: form.audience });
      await runBatches(c.id, c.total);
    } catch (e) { toast.push(e.message); }
    setBusy('');
  };

  const resume = async (c) => {
    setBusy('send');
    try { await runBatches(c.id, c.total); } catch (e) { toast.push(e.message); }
    setBusy('');
  };

  const audiences = status?.audiences ? Object.entries(status.audiences) : AUDIENCE_OPTIONS;

  return (
    <section className="card-glass-strong p-5 space-y-4">
      <div>
        <h3 className="font-display text-lg font-semibold text-ink">Kirim lewat Talqeeh</h3>
        {!status ? <p className="text-sm text-ink-muted" role="status">Memeriksa pengaturan email…</p>
          : status.error ? <p className="text-sm text-rose-400">{status.error}</p>
          : status.configured
            ? <p className="text-sm text-emerald-300">✓ Siap kirim dari <b className="text-ink">{status.from}</b>. Tiap penerima dapat email sendiri dengan namanya dan link berhenti berlangganan.</p>
            : <p className="text-sm text-amber-300">Belum siap: isi RESEND_API_KEY dan EMAIL_FROM di Vercel, lalu deploy ulang. Sementara itu kamu tetap bisa menyiapkan dan mengecek isinya.</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {campaignPresets().map(p => (
          <button key={p.id} type="button" onClick={() => setForm(f => ({ ...f, subject: p.subject, body: p.body, ...(p.cta_label ? { cta_label: p.cta_label } : {}) }))}
            className={`rounded-full border px-3 py-1.5 text-xs ${form.subject === p.subject ? 'border-emerald-500 text-emerald-200 bg-emerald-500/10' : 'border-white/15 text-ink-muted hover:text-ink'}`}>{p.label}</button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <label className="block md:col-span-2">
          <span className="text-[11px] text-ink-muted block mb-1">Penerima</span>
          <select value={form.audience} onChange={e => set('audience', e.target.value)} className={fieldClass}>
            {audiences.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
          <span className="text-[11px] text-ink-soft block mt-1">
            {!count ? 'Menghitung…' : count.error ? count.error : `${count.count} penerima${count.optedOut ? ` · ${count.optedOut} sudah berhenti berlangganan, tidak ikut` : ''}`}
            {form.audience !== 'free' && ' · Catatan: Paket Imtihan hanya bisa dibeli akun gratis.'}
          </span>
        </label>
        <label className="block md:col-span-2">
          <span className="text-[11px] text-ink-muted block mb-1">Subjek</span>
          <input value={form.subject} onChange={e => set('subject', e.target.value)} maxLength={150} className={fieldClass}/>
        </label>
        <div className="md:col-span-2">
          <span className="text-[11px] text-ink-muted block mb-1">Gambar / poster (opsional, tampil di atas isi email; diklik membuka link tombol)</span>
          {form.image_url ? (
            <div className="flex items-start gap-3">
              <img src={form.image_url} alt="Poster email" className="w-40 rounded-lg border border-white/10"/>
              <div className="flex flex-col gap-2">
                <label className="btn btn-ghost !min-h-0 !py-1.5 !px-3 text-xs cursor-pointer">Ganti<input type="file" accept="image/*" onChange={pickImage} className="hidden"/></label>
                <button type="button" onClick={() => set('image_url', '')} className="btn btn-ghost !min-h-0 !py-1.5 !px-3 text-xs">Hapus</button>
              </div>
            </div>
          ) : (
            <label className={`btn btn-ghost text-sm px-4 py-2 cursor-pointer ${busy === 'image' ? 'opacity-60 pointer-events-none' : ''}`}>
              {busy === 'image' ? 'Mengunggah…' : 'Pilih gambar'}
              <input type="file" accept="image/*" onChange={pickImage} className="hidden"/>
            </label>
          )}
        </div>
        <label className="block md:col-span-2">
          <span className="text-[11px] text-ink-muted block mb-1">Isi email ({'{nama}'} diganti nama depan penerima; pisahkan paragraf dengan baris kosong)</span>
          <textarea value={form.body} onChange={e => set('body', e.target.value)} rows={14} maxLength={8000} className={`${fieldClass} leading-relaxed`}/>
        </label>
        <label className="block">
          <span className="text-[11px] text-ink-muted block mb-1">Tulisan tombol</span>
          <input value={form.cta_label} onChange={e => set('cta_label', e.target.value)} maxLength={60} className={fieldClass}/>
        </label>
        <label className="block">
          <span className="text-[11px] text-ink-muted block mb-1">Link tombol (https://)</span>
          <input value={form.cta_url} onChange={e => set('cta_url', e.target.value)} className={`${fieldClass} font-mono text-xs`}/>
        </label>
      </div>

      <div>
        <button type="button" onClick={() => setShowPreview(v => !v)} className="text-xs text-emerald-300 hover:text-emerald-200">
          {showPreview ? '▾ Sembunyikan pratinjau email' : '▸ Lihat pratinjau email'}
        </button>
        {showPreview && (
          <div className="mt-2 rounded-xl overflow-hidden border border-white/10 bg-[#f4f1ea]">
            {preview.error && <p className="text-xs text-rose-600 px-3 pt-2">{preview.error}</p>}
            {preview.html
              ? <iframe title="Pratinjau email" srcDoc={preview.html} sandbox="allow-same-origin" onLoad={fitFrame} className="block w-full border-0" style={{ height: 600 }}/>
              : <p className="text-sm text-[#6b6f68] p-4">Menyiapkan pratinjau…</p>}
          </div>
        )}
        <p className="text-[11px] text-ink-soft mt-1">Begini tampilan email di kotak masuk penerima (contoh nama: Ahmad). Warna dan huruf bisa sedikit beda di tiap aplikasi email.</p>
      </div>

      <div className="flex flex-wrap items-end gap-2 pt-1">
        <label className="block flex-1 min-w-[200px]">
          <span className="text-[11px] text-ink-muted block mb-1">Kirim tes ke</span>
          <input value={testTo} onChange={e => setTestTo(e.target.value)} placeholder="emailmu@gmail.com" className={fieldClass}/>
        </label>
        <button onClick={sendTest} disabled={!status?.configured || !testTo || !!busy} className="btn btn-ghost text-sm px-4 py-2 disabled:opacity-50">
          {busy === 'test' ? 'Mengirim…' : 'Kirim tes'}
        </button>
        <button onClick={createAndSend} disabled={!status?.configured || !count?.count || !!busy} className="btn btn-primary text-sm px-4 py-2 disabled:opacity-50">
          {busy === 'send' ? 'Mengirim…' : `Kirim ke ${count?.count ?? '…'} penerima`}
        </button>
      </div>

      {progress && (
        <div className="rounded-xl border border-white/10 bg-white/4 p-3 text-sm text-ink">
          Terkirim <b>{progress.sent}</b> dari {progress.total}
          {progress.failed > 0 && <span className="text-rose-300"> · {progress.failed} gagal</span>}
          {progress.skipped > 0 && <span className="text-ink-soft"> · {progress.skipped} dilewati (berhenti berlangganan)</span>}
          <div className="h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
            <div className="h-full bg-emerald-400" style={{ width: `${Math.min(100, ((progress.sent + progress.failed + progress.skipped) / Math.max(1, progress.total)) * 100)}%` }}/>
          </div>
        </div>
      )}

      {campaigns.length > 0 && (
        <div>
          <div className="text-[11px] uppercase tracking-wider text-ink-soft mb-2">Kampanye terakhir</div>
          <div className="space-y-2">
            {campaigns.slice(0, 6).map(c => (
              <div key={c.id} className="flex items-center justify-between gap-3 text-sm rounded-lg bg-white/3 px-3 py-2 flex-wrap">
                <div className="min-w-0">
                  <div className="text-ink truncate">{c.subject}</div>
                  <div className="text-[11px] text-ink-soft">
                    {new Date(c.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} · {c.counts.sent}/{c.total} terkirim
                    {c.counts.failed ? ` · ${c.counts.failed} gagal` : ''}{c.counts.pending ? ` · ${c.counts.pending} menunggu` : ''}
                  </div>
                </div>
                {c.counts.pending > 0 && (
                  <button onClick={() => resume(c)} disabled={!!busy} className="btn btn-ghost !min-h-0 !py-1.5 !px-3 text-xs disabled:opacity-50">Lanjutkan kirim</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="text-[11px] text-ink-soft leading-relaxed">
        Format isi email: baris "## Judul" jadi judul bagian, "- poin" jadi daftar bercentang, "> teks" jadi kotak sorotan, "[[tombol]]" menaruh tombol di situ (tanpa itu tombol ada di akhir). Di dalam teks: *tebal*, _miring_, ~~coret~~; link https otomatis bisa diklik.
        Paket gratis Resend: 100 email per hari, 3.000 per bulan. Kalau batasnya tercapai, pengiriman berhenti dengan aman dan sisanya bisa dilanjutkan besok lewat tombol "Lanjutkan kirim".
      </p>
    </section>
  );
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
        <p className="text-sm text-ink-muted mt-1">Kirim email kampanye langsung dari Talqeeh, atau unduh daftar email untuk dikirim sendiri.</p>
      </div>

      {P && (
        <div className={`rounded-xl border p-4 text-sm ${promoOn ? 'border-emerald-500/30 bg-emerald-500/8 text-ink' : 'border-white/10 bg-white/4 text-ink-muted'}`}>
          <b>{P.name}</b> · Paket Imtihan {fmt(P.price)} (normal {fmt(window.IMTIHAN_PRICE_IDR)}) ·{' '}
          {promoOn ? `berlangsung sampai ${P.endLabel} 23.59 waktu Kairo` : 'sedang tidak berlangsung'}.
          <div className="text-xs text-ink-soft mt-1">Banner + hitung mundur tampil otomatis untuk pengunjung & akun gratis selama event. Tanggal & harga diatur di IMTIHAN_PROMO (src/layout.jsx dan api/_lib/payments.js).</div>
        </div>
      )}

      <EmailSender/>

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
