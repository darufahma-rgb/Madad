import React, { useState, useEffect } from 'react';

function BankSoalPublikPage() {
  const [soalList, setSoalList] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState({ maddah: '', tahun: '' });
  const [config, setConfig]     = useState({ supabaseUrl: '', supabaseAnonKey: '' });

  const EM = '#3ecf8e';

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(({ supabaseUrl, supabaseAnonKey }) => {
        setConfig({ supabaseUrl, supabaseAnonKey });
        return fetch(`${supabaseUrl}/rest/v1/bank_soal?status=eq.approved&select=id,maddah_nama,fakultas,tahun,fashl,soal&order=approved_at.desc&limit=50`, {
          headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` }
        });
      })
      .then(r => r.json())
      .then(data => { setSoalList(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const getPreviewSoal = (teks) => {
    if (!teks) return '';
    if (teks.includes('[SOAL_ARAB]')) {
      const block = teks.split('[SOAL_ARAB]').filter(Boolean)[0];
      const raw = block?.split('[ARTI]')[0]?.trim() || '';
      return raw.slice(0, 120) + (raw.length > 120 ? '...' : '');
    }
    return teks.slice(0, 120) + (teks.length > 120 ? '...' : '');
  };

  const tahunList  = [...new Set(soalList.map(s => s.tahun))].sort().reverse();
  const maddahList = [...new Set(soalList.map(s => s.maddah_nama))].sort();

  const filtered = soalList.filter(s =>
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
          Login sebagai member untuk baca soal lengkap + jawaban + penjelasan.
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
          Belum ada soal yang tersedia untuk filter ini.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((soal) => (
            <div key={soal.id} className="card-glass" style={{
              padding: '16px 18px',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>
                    {soal.maddah_nama}
                  </div>
                  <div style={{ fontSize: 11, color: '#888' }}>
                    {soal.tahun} · {soal.fashl === 'awwal' ? 'Fashl Awwal' : 'Fashl Tsani'}
                  </div>
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 700,
                  background: 'rgba(62,207,142,0.1)',
                  color: EM, padding: '3px 8px',
                  borderRadius: 99, border: `1px solid rgba(62,207,142,0.2)`,
                  whiteSpace: 'nowrap',
                }}>TAHRIRI</div>
              </div>

              {/* Preview blur */}
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 10, marginBottom: 12 }}>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 10, padding: '12px 14px',
                  direction: 'rtl', textAlign: 'right',
                  fontSize: 14, lineHeight: 1.9,
                  color: '#ddd', fontFamily: 'serif',
                  maxHeight: 72, overflow: 'hidden',
                }}>
                  {getPreviewSoal(soal.soal) || 'Soal tersedia untuk member'}
                </div>
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
                  background: 'linear-gradient(to bottom, transparent, rgba(14,14,14,0.97))',
                }}/>
              </div>

              {/* Lock CTA */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: 9,
                background: 'rgba(62,207,142,0.05)',
                border: '1px solid rgba(62,207,142,0.15)',
              }}>
                <div style={{ fontSize: 12, color: '#888' }}>
                  🔒 Soal lengkap + jawaban + penjelasan
                </div>
                <a href="#/" style={{ fontSize: 12, fontWeight: 700, color: EM, textDecoration: 'none' }}>
                  Login →
                </a>
              </div>
            </div>
          ))}
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
