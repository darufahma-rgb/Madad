import React, { useState, useEffect } from 'react';

function BankSoalPublikPage() {
  const [soalList, setSoalList] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState({ maddah: '', tahun: '' });
  const [copiedId, setCopiedId] = useState(null);

  const EM = '#3ecf8e';

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(({ supabaseUrl, supabaseAnonKey }) => {
        return fetch(
          `${supabaseUrl}/rest/v1/bank_soal?status=eq.approved&select=id,maddah_nama,fakultas,tahun,fashl,soal,arti_soal&order=approved_at.desc&limit=50`,
          { headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` } }
        );
      })
      .then(r => r.json())
      .then(data => { setSoalList(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const cleanArab = (text) => {
    if (!text) return '';
    return text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#{1,6}\s/g, '').trim();
  };

  const getFirstSoal = (teks) => {
    if (!teks) return { arab: '', arti: '' };
    if (teks.includes('[SOAL_ARAB]')) {
      const block = teks.split('[SOAL_ARAB]').filter(Boolean)[0] || '';
      const parts = block.split('[ARTI]');
      return { arab: cleanArab(parts[0]?.trim() || ''), arti: parts[1]?.trim() || '' };
    }
    return { arab: cleanArab(teks.split('\n').find(l => l.trim()) || ''), arti: '' };
  };

  const countSoal = (teks) => {
    if (!teks) return 1;
    if (teks.includes('[SOAL_ARAB]')) return teks.split('[SOAL_ARAB]').filter(Boolean).length;
    return 1;
  };

  const buildPrompt = (soal, arabSoal, artiSoal) => {
    const fashlStr = soal.fashl === 'awwal' ? 'Fashl Awwal' : 'Fashl Tsani';
    return `Aku mahasiswa Al-Azhar sedang mempersiapkan jawaban untuk soal ujian berikut.

Mata kuliah : ${soal.maddah_nama}
Tahun / Fashl: ${soal.tahun} · ${fashlStr}
Nomor soal  : 1

Soal (teks Arab):
${arabSoal || '[teks Arab soal]'}

${artiSoal ? `Terjemahan soal:\n${artiSoal}\n` : ''}
Tolong bantu aku menyusun jawaban ideal untuk soal ini dengan format berikut:

1. **Ta'rif** – definisi istilah kunci (Arab + terjemah, lengkap harakat)
2. **Jawaban inti** – sesuai gaya imtihan Al-Azhar: padat, terstruktur, ada dalil jika relevan
3. **Dalil / Syahid** – teks Arab (harakat) + terjemah + sumber
4. **Poin penguat** – 2-3 hal yang biasanya dituntut dosen untuk soal seperti ini
5. **Yang sering keliru** – kesalahan umum mahasiswa dalam menjawab soal ini

Bahasa pengantar: Indonesia akademik. Istilah teknis tetap Arab + transliterasi.`;
  };

  const handleCopyPrompt = (soal) => {
    const { arab, arti } = getFirstSoal(soal.soal);
    const artiFromArr = Array.isArray(soal.arti_soal) ? soal.arti_soal[0] : '';
    const prompt = buildPrompt(soal, arab, artiFromArr || arti);
    navigator.clipboard.writeText(prompt).then(() => {
      setCopiedId(soal.id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const tahunList  = [...new Set(soalList.map(s => s.tahun))].sort().reverse();
  const maddahList = [...new Set(soalList.map(s => s.maddah_nama))].sort();
  const filtered   = soalList.filter(s =>
    (!filter.tahun  || s.tahun === filter.tahun) &&
    (!filter.maddah || s.maddah_nama === filter.maddah)
  );

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 80px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: EM, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>
          BANK SOAL IMTIHAN
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
          Soal Ujian Al-Azhar
        </h1>
        <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.6 }}>
          Koleksi soal tahriri dari Masisir untuk Masisir.<br/>
          Preview soal pertama gratis — login member untuk baca semua soal + jawaban lengkap.
        </p>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <select
          value={filter.tahun}
          onChange={e => setFilter(f => ({ ...f, tahun: e.target.value }))}
          style={{
            flex: 1, minWidth: 140, padding: '9px 12px', borderRadius: 9,
            border: '1px solid rgba(255,255,255,0.1)',
            background: '#1a1a1a', color: '#fff', fontSize: 13,
          }}
        >
          <option value="">Semua Tahun</option>
          {tahunList.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={filter.maddah}
          onChange={e => setFilter(f => ({ ...f, maddah: e.target.value }))}
          style={{
            flex: 2, minWidth: 200, padding: '9px 12px', borderRadius: 9,
            border: '1px solid rgba(255,255,255,0.1)',
            background: '#1a1a1a', color: '#fff', fontSize: 13,
          }}
        >
          <option value="">Semua Maddah</option>
          {maddahList.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* List soal */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>Memuat soal...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>
          Belum ada soal untuk filter ini.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((soal) => {
            const { arab, arti } = getFirstSoal(soal.soal);
            const artiFromArr    = Array.isArray(soal.arti_soal) ? soal.arti_soal[0] : '';
            const artiDisplay    = artiFromArr || arti;
            const total          = countSoal(soal.soal);
            const isCopied       = copiedId === soal.id;

            return (
              <div key={soal.id} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, overflow: 'hidden',
              }}>

                {/* Card header */}
                <div style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
                  background: 'rgba(62,207,142,0.03)',
                }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 3 }}>
                      {soal.maddah_nama}
                    </div>
                    <div style={{ fontSize: 11, color: '#888', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span>{soal.tahun}</span>
                      <span>·</span>
                      <span>{soal.fashl === 'awwal' ? 'Fashl Awwal' : 'Fashl Tsani'}</span>
                      {soal.fakultas && (
                        <>
                          <span>·</span>
                          <span style={{ color: EM }}>{soal.fakultas}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <div style={{
                      fontSize: 10, fontWeight: 700,
                      background: 'rgba(62,207,142,0.1)',
                      color: EM, padding: '3px 8px',
                      borderRadius: 99, border: `1px solid rgba(62,207,142,0.2)`,
                    }}>TAHRIRI</div>
                    <div style={{
                      fontSize: 10, color: '#666', fontWeight: 600,
                      padding: '3px 8px', borderRadius: 99,
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}>{total} soal</div>
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '16px 18px' }}>

                  {/* Label soal 1 */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10,
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 5,
                      background: 'rgba(62,207,142,0.15)',
                      border: '1px solid rgba(62,207,142,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: EM, fontWeight: 800,
                    }}>1</div>
                    <span style={{ fontSize: 10, color: EM, fontWeight: 700, letterSpacing: 0.5 }}>
                      SOAL 1 — PREVIEW GRATIS
                    </span>
                  </div>

                  {/* Teks Arab soal 1 */}
                  {arab ? (
                    <div style={{
                      direction: 'rtl', textAlign: 'right',
                      fontSize: 16, lineHeight: 2.1, color: '#f0ece4',
                      fontFamily: '"Scheherazade New", "Noto Naskh Arabic", "Traditional Arabic", serif',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 10, padding: '12px 16px',
                      marginBottom: 10,
                    }}>
                      {arab}
                    </div>
                  ) : (
                    <div style={{
                      padding: '12px', borderRadius: 10, textAlign: 'center',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px dashed rgba(255,255,255,0.07)',
                      fontSize: 13, color: '#555', marginBottom: 10,
                    }}>
                      Teks soal tersedia untuk member
                    </div>
                  )}

                  {/* Arti soal 1 */}
                  {artiDisplay ? (
                    <div style={{
                      fontSize: 13, color: '#bbb', lineHeight: 1.75,
                      paddingLeft: 12,
                      borderLeft: '2px solid rgba(62,207,142,0.3)',
                      marginBottom: 14, fontStyle: 'italic',
                    }}>
                      {artiDisplay}
                    </div>
                  ) : null}

                  {/* Tombol copy prompt */}
                  {arab && (
                    <button
                      onClick={() => handleCopyPrompt(soal)}
                      style={{
                        width: '100%', padding: '10px 14px',
                        borderRadius: 9, marginBottom: 12,
                        border: `1px solid ${isCopied ? 'rgba(62,207,142,0.4)' : 'rgba(62,207,142,0.25)'}`,
                        background: isCopied ? 'rgba(62,207,142,0.15)' : 'rgba(62,207,142,0.07)',
                        color: isCopied ? EM : '#ccc',
                        fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                        transition: 'all 0.15s',
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {isCopied
                          ? <polyline points="20 6 9 17 4 12"/>
                          : <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>
                        }
                      </svg>
                      {isCopied ? 'Prompt tersalin — paste ke Claude / ChatGPT!' : 'Salin Prompt Jawaban Soal 1 (Gratis)'}
                    </button>
                  )}

                  {/* Soal 2+ lock */}
                  {total > 1 && (
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: 9,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        🔒 {total - 1} soal lainnya + jawaban lengkap
                      </div>
                      <a
                        href="#/"
                        style={{ fontSize: 12, fontWeight: 700, color: EM, textDecoration: 'none' }}
                      >
                        Login →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CTA submit soal */}
      <div style={{
        marginTop: 32, padding: '18px 20px', borderRadius: 14,
        background: 'rgba(255,200,50,0.06)',
        border: '1px solid rgba(255,200,50,0.2)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
          Punya soal imtihan tahun lalu?
        </div>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 14 }}>
          Submit soal & dapat akses Talqeeh lifetime gratis atau voucher makan siang Rp 50.000
        </div>
        <a href="#/submit-soal" style={{
          display: 'inline-block', padding: '10px 24px', borderRadius: 10,
          background: '#ffc832', color: '#000',
          fontWeight: 800, fontSize: 13, textDecoration: 'none',
        }}>
          📸 Submit Soal Sekarang →
        </a>
      </div>
    </div>
  );
}

window.BankSoalPublikPage = BankSoalPublikPage;
