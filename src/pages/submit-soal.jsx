import React, { useState, useRef } from 'react';

/* Talqeeh — Submit Soal Imtihan
   Route: #/submit-soal (publik, tidak perlu login)
   Member kontribusikan soal ujian, dapat reward lewat WA
*/

const compressImage = (file, maxSizeMB = 0.8) => {
  return new Promise((resolve) => {
    if (file.size <= maxSizeMB * 1024 * 1024) { resolve(file); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const ratio = Math.sqrt((maxSizeMB * 1024 * 1024) / file.size);
        width  = Math.floor(width  * ratio);
        height = Math.floor(height * ratio);
        canvas.width  = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => resolve(new File([blob], file.name, { type: 'image/jpeg' })),
          'image/jpeg', 0.85
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

function SubmitSoalPage() {
  const [step, setStep]         = useState('form');
  const [loading, setLoading]   = useState(false);
  const [dupMsg, setDupMsg]     = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const fileRef = useRef();
  const [compressedFile, setCompressedFile] = useState(null);
  const [panduanOpen, setPanduanOpen] = useState(false);

  const [form, setForm] = useState({
    nama: '', wa: '',
    fakultas: '', maddah_id: '', maddah_nama: '',
    tingkat: '', tahun: '', fashl: '',
  });

  const TAHUN_OPTIONS = ['2023/2024', '2024/2025', '2025/2026'];
  const FASHL_OPTIONS = [
    { value: 'awwal', label: 'Fashl Awwal (Semester 1)' },
    { value: 'tsani', label: 'Fashl Tsani (Semester 2)' },
  ];

  const faculties   = typeof FACULTIES !== 'undefined' ? FACULTIES.filter(f => !f.isMahad) : [];
  const allMaddahs  = typeof MADDAHS   !== 'undefined' ? MADDAHS : [];
  const filteredMaddahs = form.fakultas
    ? allMaddahs.filter(m => (m.fakultas || []).includes(form.fakultas))
    : [];

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const checkDuplikat = async (maddah_id, tahun, fashl) => {
    if (!maddah_id || !tahun || !fashl) return;
    setDupMsg('');
    try {
      const res = await fetch('/api/submit-soal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _checkOnly: true, maddah_id, tahun, fashl })
      });
      const data = await res.json();
      if (data.error === 'duplicate') setDupMsg(data.message);
    } catch {}
  };

  const handleFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCompressing(true);
    const compressed = await compressImage(file);
    setCompressedFile(compressed);
    setPreviewUrl(URL.createObjectURL(compressed));
    setCompressing(false);
  };

  const handleSubmit = async () => {
    if (!form.nama || !form.wa || !form.fakultas || !form.maddah_id || !form.tingkat || !form.tahun || !form.fashl || !compressedFile) {
      alert('Lengkapi semua field dan upload foto soal.');
      return;
    }
    setStep('confirm');
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const supabaseUrl = window.__SUPABASE_URL__ || '';
      const anonKey     = window.__SUPABASE_ANON_KEY__ || '';
      const fileName    = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;

      const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/soal-foto/${fileName}`, {
        method: 'POST',
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
          'Content-Type': 'image/jpeg',
        },
        body: compressedFile
      });

      if (!uploadRes.ok) throw new Error('Upload foto gagal. Pastikan storage bucket soal-foto sudah dibuat di Supabase.');
      const foto_url = `${supabaseUrl}/storage/v1/object/soal-foto/${fileName}`;

      const res = await fetch('/api/submit-soal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fakultas:       form.fakultas,
          maddah_id:      form.maddah_id,
          maddah_nama:    form.maddah_nama,
          tingkat:        form.tingkat,
          tahun:          form.tahun,
          fashl:          form.fashl,
          submitter_name: form.nama,
          submitter_wa:   form.wa,
          foto_url,
        })
      });

      const data = await res.json();
      if (data.ok) setStep('success');
      else if (data.error === 'duplicate') { setDupMsg(data.message); setStep('form'); }
      else throw new Error(data.error);
    } catch (err) {
      alert('Gagal submit: ' + err.message);
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const EM = '#3ecf8e';

  if (step === 'success') return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 12 }}>
        Jazakallah Khair!
      </h2>
      <p style={{ color: '#bbb', lineHeight: 1.7, fontSize: 15 }}>
        Soal kamu sudah kami terima dan sedang direview.<br/>
        Reward akan dikirim ke WhatsApp <strong style={{ color: EM }}>{form.wa}</strong> setelah diverifikasi.
      </p>
      <p style={{ color: '#888', fontSize: 13, marginTop: 16 }}>Barakallahu fiik 🙏</p>
      <button onClick={() => { setStep('form'); setForm({ nama:'', wa:'', fakultas:'', maddah_id:'', maddah_nama:'', tingkat:'', tahun:'', fashl:'' }); setPreviewUrl(null); setCompressedFile(null); setDupMsg(''); }}
        style={{ marginTop: 28, padding: '11px 24px', borderRadius: 10, background: EM, color: '#000', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: 14 }}>
        Submit Soal Lain
      </button>
    </div>
  );

  if (step === 'confirm') return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px' }}>
      <div className="card-glass" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 16 }}>Konfirmasi Submission</h2>
        {[
          ['Nama', form.nama],
          ['WhatsApp', form.wa],
          ['Fakultas', form.fakultas],
          ['Maddah', form.maddah_nama],
          ['Tingkat', `Tingkat ${form.tingkat}`],
          ['Tahun', form.tahun],
          ['Fashl', form.fashl === 'awwal' ? 'Fashl Awwal' : 'Fashl Tsani'],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
            <span style={{ color: '#888' }}>{k}</span>
            <span style={{ color: '#eee', fontWeight: 600 }}>{v}</span>
          </div>
        ))}
        {previewUrl && (
          <img src={previewUrl} alt="preview" style={{ width: '100%', borderRadius: 8, marginTop: 12, maxHeight: 200, objectFit: 'cover' }}/>
        )}
        <div style={{ background: 'rgba(62,207,142,0.08)', border: '1px solid rgba(62,207,142,0.2)', borderRadius: 10, padding: 12, marginTop: 16, fontSize: 13, color: '#ccc' }}>
          ✅ Reward akan dikirim ke WhatsApp <strong style={{ color: EM }}>{form.wa}</strong>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={() => setStep('form')} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#ccc', cursor: 'pointer', fontSize: 14 }}>
            ← Edit
          </button>
          <button onClick={handleConfirm} disabled={loading}
            style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: EM, color: '#000', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14 }}>
            {loading ? 'Mengirim...' : 'Ya, Submit Sekarang →'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '28px 20px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: EM, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>
          KONTRIBUSI UNTUK MASISIR
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
          Submit Soal Imtihan
        </h1>
        <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.6, margin: 0 }}>
          Bantu Masisir lain belajar dari soal-soal tahun sebelumnya. Kamu dapat reward berupa akses Talqeeh atau diskon!
        </p>
      </div>

      {/* Reward info */}
      <div style={{ background: 'rgba(62,207,142,0.06)', border: '1px solid rgba(62,207,142,0.2)', borderRadius: 12, padding: '14px 16px', marginBottom: 24, fontSize: 13 }}>
        <div style={{ fontWeight: 700, color: EM, marginBottom: 8 }}>🎁 Sistem Reward</div>
        <div style={{ color: '#ccc', lineHeight: 1.8 }}>
          • Submit <strong style={{ color: '#fff' }}>1 termin penuh</strong> → Akses Talqeeh <strong style={{ color: EM }}>lifetime GRATIS</strong><br/>
          • Submit <strong style={{ color: '#fff' }}>2 termin penuh</strong> → Lifetime + merchandise Talqeeh<br/>
          • Submit <strong style={{ color: '#fff' }}>sebagian</strong> → Diskon spesial untuk bergabung
        </div>
      </div>

      {/* Panduan Accordion */}
      <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, marginBottom: 20, overflow: 'hidden' }}>
        <button
          onClick={() => setPanduanOpen(p => !p)}
          style={{ width: '100%', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: 'none', cursor: 'pointer', color: '#fff' }}
        >
          <span style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            📋 Baca Panduan Submit Dulu
            <span style={{ fontSize: 11, color: '#3ecf8e', fontWeight: 600, background: 'rgba(62,207,142,0.12)', padding: '2px 8px', borderRadius: 99 }}>
              Wajib dibaca
            </span>
          </span>
          <span style={{ color: '#888', fontSize: 18, transition: 'transform 0.2s', transform: panduanOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▾
          </span>
        </button>

        {panduanOpen && (
          <div style={{ padding: '16px 18px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 14, color: '#ccc', lineHeight: 1.7 }}>

            {/* Soal yang diterima */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, color: '#3ecf8e', marginBottom: 10, fontSize: 13, letterSpacing: 0.5 }}>✅ SOAL YANG DITERIMA</div>
              {[
                ['Berbahasa Arab', 'Soal Al-Azhar memang ditulis dalam bahasa Arab. Soal bahasa Indonesia tidak diterima.'],
                ['Soal tahriri (ujian tulis)', 'Harus dari kertas soal asli yang dibagikan saat ujian — bukan soal syafawi yang diingat-ingat.'],
                ['Foto jelas dan terbaca', 'Semua tulisan Arab harus bisa dibaca dengan jelas. Blur atau terpotong = ditolak.'],
                ['Dari Al-Azhar Cairo', 'Soal dari kampus atau instansi lain tidak diterima.'],
              ].map(([judul, isi]) => (
                <div key={judul} style={{ marginBottom: 10, paddingLeft: 12, borderLeft: '2px solid rgba(62,207,142,0.3)' }}>
                  <div style={{ fontWeight: 700, color: '#eee', fontSize: 13 }}>{judul}</div>
                  <div style={{ color: '#aaa', fontSize: 13 }}>{isi}</div>
                </div>
              ))}
            </div>

            {/* Cara foto yang benar */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, color: '#3ecf8e', marginBottom: 10, fontSize: 13, letterSpacing: 0.5 }}>📸 CARA FOTO YANG BENAR</div>
              <div style={{ background: 'rgba(62,207,142,0.06)', borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
                <div style={{ fontWeight: 700, color: '#fff', marginBottom: 6, fontSize: 13 }}>Lakukan ini ✅</div>
                {[
                  'Taruh kertas di tempat datar (meja atau lantai)',
                  'Pastikan pencahayaan cukup — dekat jendela di siang hari paling bagus',
                  'Foto dari atas tegak lurus — HP sejajar dengan kertas',
                  'Zoom setelah foto dan pastikan tulisan Arab terbaca jelas',
                  'Kalau soal 2 halaman, submit dua foto terpisah',
                ].map(t => (
                  <div key={t} style={{ color: '#bbb', fontSize: 13, marginBottom: 4 }}>✓ {t}</div>
                ))}
              </div>
              <div style={{ background: 'rgba(255,80,80,0.06)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontWeight: 700, color: '#ff8080', marginBottom: 6, fontSize: 13 }}>Jangan lakukan ini ❌</div>
                {[
                  'Foto sambil dipegang — hasilnya goyang dan blur',
                  'Foto dari sudut miring — tulisan tidak terbaca',
                  'Pakai flash berlebihan — menyebabkan silau',
                  'Foto di tempat gelap',
                ].map(t => (
                  <div key={t} style={{ color: '#bbb', fontSize: 13, marginBottom: 4 }}>✗ {t}</div>
                ))}
              </div>
            </div>

            {/* Reward */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, color: '#3ecf8e', marginBottom: 10, fontSize: 13, letterSpacing: 0.5 }}>🎁 SISTEM REWARD</div>
              {[
                ['1 termin penuh', 'Semua maddah di satu fashl dalam satu tahun', 'Akses Talqeeh lifetime GRATIS'],
                ['2 termin penuh', 'Dua fashl berbeda atau dua tahun berbeda', 'Lifetime + merchandise Talqeeh'],
                ['Sebagian', 'Belum lengkap 1 termin penuh', 'Diskon spesial untuk join Talqeeh'],
              ].map(([label, ket, reward]) => (
                <div key={label} style={{ display: 'flex', gap: 10, marginBottom: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 9 }}>
                  <div style={{ flexShrink: 0, fontWeight: 700, color: '#fff', fontSize: 13, minWidth: 100 }}>{label}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#aaa', fontSize: 12 }}>{ket}</div>
                    <div style={{ color: '#3ecf8e', fontWeight: 700, fontSize: 13 }}>{reward}</div>
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                💡 <strong style={{ color: '#ccc' }}>1 termin penuh</strong> = semua maddah yang kamu ambil di satu fashl dalam satu tahun ajaran. Contoh: Syariah Tingkat 2 Fashl Awwal 2024/2025 punya 6 maddah → harus submit keenam-enamnya.
              </div>
            </div>

            {/* FAQ */}
            <div>
              <div style={{ fontWeight: 700, color: '#3ecf8e', marginBottom: 10, fontSize: 13, letterSpacing: 0.5 }}>❓ PERTANYAAN YANG SERING DITANYA</div>
              {[
                ['Soalku dari tahun 2022, bisa?', 'Untuk saat ini hanya menerima soal 2023/2024 sampai 2025/2026.'],
                ['Aku sudah member, rewardnya apa?', 'Member dapat poin yang bisa ditukar merchandise Talqeeh — info lebih lanjut segera diumumkan.'],
                ['Soalnya dua halaman, gimana?', 'Submit dua kali — satu foto per submission. Isi info maddah dan tahun yang sama.'],
                ['Boleh submit soal teman?', 'Boleh, selama soalnya asli dari Al-Azhar dan kamu tahu info maddah + tahunnya dengan benar.'],
                ['Berapa lama prosesnya?', 'Biasanya 1-2 hari. Kalau 3 hari belum ada kabar, hubungi admin.'],
              ].map(([q, a]) => (
                <div key={q} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontWeight: 700, color: '#eee', fontSize: 13, marginBottom: 3 }}>Q: {q}</div>
                  <div style={{ color: '#aaa', fontSize: 13 }}>A: {a}</div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: 16, padding: '12px', background: 'rgba(62,207,142,0.06)', borderRadius: 10, fontSize: 13, color: '#aaa' }}>
              Jazakallahu khair atas kontribusinya untuk sesama Masisir! 🙏<br/>
              <span style={{ fontSize: 12, color: '#777' }}>Ada pertanyaan? Hubungi admin via WhatsApp.</span>
            </div>

          </div>
        )}
      </div>

      {/* Form */}
      <div className="card-glass" style={{ padding: 20 }}>
        {/* Nama */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: EM, fontWeight: 700, display: 'block', marginBottom: 6 }}>NAMA LENGKAP *</label>
          <input value={form.nama} onChange={e => set('nama', e.target.value)}
            placeholder="Nama kamu"
            style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, boxSizing: 'border-box' }}/>
        </div>

        {/* WA */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: EM, fontWeight: 700, display: 'block', marginBottom: 6 }}>NOMOR WHATSAPP * <span style={{ color: '#888', fontWeight: 400 }}>(untuk terima reward)</span></label>
          <input value={form.wa} onChange={e => set('wa', e.target.value)}
            placeholder="628xxxxxxxxxx"
            style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, boxSizing: 'border-box' }}/>
        </div>

        {/* Fakultas */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: EM, fontWeight: 700, display: 'block', marginBottom: 6 }}>FAKULTAS *</label>
          <select value={form.fakultas} onChange={e => { set('fakultas', e.target.value); set('maddah_id', ''); set('maddah_nama', ''); setDupMsg(''); }}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', background: '#1a1a1a', color: '#fff', fontSize: 14, boxSizing: 'border-box' }}>
            <option value="">Pilih fakultas...</option>
            {faculties.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
        </div>

        {/* Maddah */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: EM, fontWeight: 700, display: 'block', marginBottom: 6 }}>MADDAH *</label>
          <select value={form.maddah_id}
            onChange={e => {
              const m = filteredMaddahs.find(x => x.id === e.target.value);
              set('maddah_id', e.target.value);
              set('maddah_nama', m?.name || '');
              if (e.target.value && form.tahun && form.fashl) checkDuplikat(e.target.value, form.tahun, form.fashl);
            }}
            disabled={!form.fakultas}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', background: '#1a1a1a', color: '#fff', fontSize: 14, boxSizing: 'border-box' }}>
            <option value="">Pilih maddah...</option>
            {filteredMaddahs.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>

        {/* Tingkat + Tahun + Fashl */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 11, color: EM, fontWeight: 700, display: 'block', marginBottom: 6 }}>TINGKAT *</label>
            <select value={form.tingkat} onChange={e => set('tingkat', e.target.value)}
              style={{ width: '100%', padding: '10px 8px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', background: '#1a1a1a', color: '#fff', fontSize: 13, boxSizing: 'border-box' }}>
              <option value="">-</option>
              {['1','2','3','4'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: EM, fontWeight: 700, display: 'block', marginBottom: 6 }}>TAHUN *</label>
            <select value={form.tahun}
              onChange={e => { set('tahun', e.target.value); if (form.maddah_id && e.target.value && form.fashl) checkDuplikat(form.maddah_id, e.target.value, form.fashl); }}
              style={{ width: '100%', padding: '10px 8px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', background: '#1a1a1a', color: '#fff', fontSize: 13, boxSizing: 'border-box' }}>
              <option value="">-</option>
              {TAHUN_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: EM, fontWeight: 700, display: 'block', marginBottom: 6 }}>FASHL *</label>
            <select value={form.fashl}
              onChange={e => { set('fashl', e.target.value); if (form.maddah_id && form.tahun && e.target.value) checkDuplikat(form.maddah_id, form.tahun, e.target.value); }}
              style={{ width: '100%', padding: '10px 8px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', background: '#1a1a1a', color: '#fff', fontSize: 13, boxSizing: 'border-box' }}>
              <option value="">-</option>
              {FASHL_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
        </div>

        {/* Duplikat warning */}
        {dupMsg && (
          <div style={{ background: 'rgba(62,207,142,0.08)', border: '1px solid rgba(62,207,142,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: EM, marginBottom: 16 }}>
            ✅ {dupMsg}
          </div>
        )}

        {/* Upload foto */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: EM, fontWeight: 700, display: 'block', marginBottom: 6 }}>
            FOTO SOAL * <span style={{ color: '#888', fontWeight: 400 }}>(foto jelas kertas soal asli)</span>
          </label>
          <div
            onClick={() => fileRef.current?.click()}
            style={{ border: '2px dashed rgba(62,207,142,0.3)', borderRadius: 12, padding: '20px', textAlign: 'center', cursor: 'pointer', background: 'rgba(62,207,142,0.03)' }}>
            {compressing ? (
              <div style={{ color: '#888', fontSize: 13 }}>Mengompres foto...</div>
            ) : previewUrl ? (
              <img src={previewUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, objectFit: 'contain' }}/>
            ) : (
              <>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
                <div style={{ color: '#888', fontSize: 13 }}>Tap untuk pilih foto</div>
                <div style={{ color: '#666', fontSize: 11, marginTop: 4 }}>Foto &gt;1MB akan dikompresi otomatis</div>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFoto} style={{ display: 'none' }}/>
        </div>

        {/* Submit button */}
        <button onClick={handleSubmit} disabled={!!dupMsg || compressing}
          style={{ width: '100%', padding: '13px', borderRadius: 11, border: 'none', background: dupMsg ? '#444' : EM, color: dupMsg ? '#888' : '#000', fontWeight: 800, fontSize: 15, cursor: dupMsg ? 'not-allowed' : 'pointer' }}>
          {dupMsg ? 'Soal Sudah Tersedia' : 'Lanjut → Konfirmasi'}
        </button>
      </div>

      {/* Syarat */}
      <div style={{ marginTop: 16, fontSize: 12, color: '#666', lineHeight: 1.7, textAlign: 'center' }}>
        Dengan submit, kamu menyetujui soal digunakan untuk keperluan belajar Masisir.<br/>
        Soal yang blur, bukan bahasa Arab, atau bukan dari Al-Azhar akan ditolak.
      </div>
    </div>
  );
}

window.SubmitSoalPage = SubmitSoalPage;
