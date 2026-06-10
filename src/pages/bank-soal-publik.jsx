import React, { useState, useEffect } from 'react';

/* ── Helper: strip markdown dari teks Arab ── */
const cleanArab = (teks) => {
  if (!teks) return '';
  return teks
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[([^\]]*)\]/g, '$1')
    .replace(/#{1,6}\s*/g, '')
    .replace(/\n{2,}/g, ' ')
    .trim();
};

const getFirstSoal = (raw) => {
  if (!raw) return '';
  let s = raw.includes('[SOAL_ARAB]')
    ? (raw.split('[SOAL_ARAB]').filter(Boolean)[0] || '').split('[ARTI]')[0]
    : raw.split('\n').find(l => l.trim()) || '';
  return cleanArab(s).slice(0, 120);
};

/* ── Modal detail soal ── */
const SoalModal = ({ group, onClose }) => {
  if (!group) return null;
  const EM = '#3ecf8e';

  const allSoal = group.soalList || [];

  const buildPrompt = (arab, arti, nomor) =>
`Aku mahasiswa Al-Azhar mempersiapkan jawaban ujian.

Mata kuliah : ${group.maddah_nama}
Tahun / Fashl: ${group.tahun} · ${group.fashl === 'awwal' ? 'Fashl Awwal' : 'Fashl Tsani'}
Nomor soal  : ${nomor}

Soal:
${arab}
${arti ? `\nTerjemahan: ${arti}` : ''}

Bantu aku menyusun jawaban ideal:
1. Ta'rif — definisi istilah kunci (Arab + terjemah + harakat)
2. Jawaban inti — gaya imtihan Al-Azhar, padat, terstruktur
3. Dalil — teks Arab (harakat) + terjemah + sumber
4. Poin penguat — 2-3 hal yang biasanya dituntut dosen
5. Yang sering keliru — kesalahan umum mahasiswa

Bahasa pengantar: Indonesia akademik. Istilah teknis tetap Arab.`;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 680,
          maxHeight: '88vh',
          background: '#0e0e0e',
          borderRadius: 20,
          border: '1px solid rgba(62,207,142,0.2)',
          boxShadow: '0 40px 120px rgba(0,0,0,0.8)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(62,207,142,0.04)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 10, color: EM, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>
              BANK SOAL IMTIHAN
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
              {group.maddah_nama}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 11, color: '#888',
                background: 'rgba(255,255,255,0.05)',
                padding: '3px 10px', borderRadius: 99,
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                {group.tahun}
              </span>
              <span style={{
                fontSize: 11, color: '#888',
                background: 'rgba(255,255,255,0.05)',
                padding: '3px 10px', borderRadius: 99,
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                {group.fashl === 'awwal' ? 'Fashl Awwal' : 'Fashl Tsani'}
              </span>
              <span style={{
                fontSize: 11, color: EM,
                background: 'rgba(62,207,142,0.1)',
                padding: '3px 10px', borderRadius: 99,
                border: '1px solid rgba(62,207,142,0.2)',
                fontWeight: 700,
              }}>
                {group.count} soal
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: '#888', cursor: 'pointer', fontSize: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >×</button>
        </div>

        {/* Modal Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>
          {allSoal.map((soal, si) => {
            const blocks = soal.soal?.includes('[SOAL_ARAB]')
              ? soal.soal.split('[SOAL_ARAB]').filter(Boolean).map(b => {
                  const p = b.split('[ARTI]');
                  return { arab: cleanArab(p[0]?.trim()), arti: p[1]?.trim() || '' };
                })
              : [{ arab: cleanArab(soal.soal?.trim()), arti: '' }];

            return blocks.map((block, bi) => {
              const nomor = si === 0 ? bi + 1 : `${si + 1}.${bi + 1}`;
              const [copied, setCopied] = React.useState(false);

              return (
                <div key={`${si}-${bi}`} style={{
                  marginBottom: 24,
                  paddingBottom: 24,
                  borderBottom: (si < allSoal.length - 1 || bi < blocks.length - 1)
                    ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}>
                  {/* Nomor soal */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 12, gap: 12,
                    flexWrap: 'wrap',
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: 7,
                        background: 'rgba(62,207,142,0.15)',
                        border: '1px solid rgba(62,207,142,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 800, color: EM,
                      }}>{nomor}</div>
                      <span style={{ fontSize: 11, color: '#666', fontWeight: 600, letterSpacing: 0.5 }}>
                        SOAL {nomor}
                      </span>
                    </div>

                    {/* Tombol salin prompt */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(buildPrompt(block.arab, block.arti, nomor));
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2500);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '6px 14px', borderRadius: 8,
                        fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: copied
                          ? '1px solid rgba(62,207,142,0.5)'
                          : '1px solid rgba(62,207,142,0.25)',
                        background: copied
                          ? 'rgba(62,207,142,0.15)'
                          : 'rgba(62,207,142,0.06)',
                        color: copied ? EM : '#aaa',
                      }}
                    >
                      {copied ? '✅ Tersalin' : '📋 Salin Prompt Jawaban'}
                    </button>
                  </div>

                  {/* Teks Arab */}
                  {block.arab && (
                    <div style={{
                      direction: 'rtl', textAlign: 'right',
                      fontSize: 17, lineHeight: 2.1,
                      fontFamily: '"Scheherazade New","Noto Naskh Arabic","Traditional Arabic",serif',
                      color: '#f0ece4',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 12, padding: '16px 20px',
                      marginBottom: block.arti ? 10 : 0,
                    }}>
                      {block.arab}
                    </div>
                  )}

                  {/* Arti */}
                  {block.arti && (
                    <div style={{
                      fontSize: 13, color: '#bbb', lineHeight: 1.8,
                      padding: '10px 16px',
                      borderLeft: `2px solid rgba(62,207,142,0.35)`,
                      background: 'rgba(62,207,142,0.03)',
                      borderRadius: '0 8px 8px 0',
                      fontStyle: 'italic',
                    }}>
                      {block.arti}
                    </div>
                  )}
                </div>
              );
            });
          })}

          {/* CTA login */}
          <div style={{
            marginTop: 8, padding: '20px',
            background: 'rgba(62,207,142,0.05)',
            border: '1px solid rgba(62,207,142,0.18)',
            borderRadius: 14, textAlign: 'center',
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
              🔒 Jawaban lengkap tersedia untuk member
            </div>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>
              Login sebagai member untuk akses prompt jawaban lengkap,<br/>
              arti soal, dan semua soal dari maddah lainnya.
            </div>
            <a href="#/" style={{
              display: 'inline-block', padding: '11px 28px', borderRadius: 11,
              background: '#3ecf8e', color: '#000',
              fontWeight: 800, fontSize: 14, textDecoration: 'none',
            }}>
              Gabung Member →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Halaman utama ── */
export default function BankSoalPublikPage() {
  const [soalList, setSoalList] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState({ tahun: '', maddah: '' });
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(({ supabaseUrl, supabaseAnonKey }) => {
        if (!supabaseUrl) { setLoading(false); return; }
        return fetch(
          `${supabaseUrl}/rest/v1/bank_soal?status=eq.approved&select=id,maddah_nama,fakultas,tahun,fashl,soal,arti_soal&order=approved_at.desc&limit=200`,
          { headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` } }
        );
      })
      .then(r => r?.json())
      .then(data => {
        if (Array.isArray(data)) setSoalList(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const tahunList  = [...new Set(soalList.map(s => s.tahun).filter(Boolean))].sort().reverse();
  const maddahList = [...new Set(
    soalList
      .filter(s => !filter.tahun || s.tahun === filter.tahun)
      .map(s => s.maddah_nama).filter(Boolean)
  )].sort();

  const filtered = soalList.filter(s =>
    (!filter.tahun  || s.tahun === filter.tahun) &&
    (!filter.maddah || s.maddah_nama === filter.maddah)
  );

  /* Group by maddah + tahun + fashl */
  const groups = Object.values(
    filtered.reduce((acc, soal) => {
      const key = `${soal.maddah_nama}|${soal.tahun}|${soal.fashl}`;
      if (!acc[key]) acc[key] = {
        key, maddah_nama: soal.maddah_nama,
        fakultas: soal.fakultas, tahun: soal.tahun,
        fashl: soal.fashl, count: 0, soalList: [],
      };
      acc[key].count++;
      acc[key].soalList.push(soal);
      return acc;
    }, {})
  );

  const EM = '#3ecf8e';

  /* Label fakultas */
  const fakultasLabel = (f) => {
    const map = {
      ushuluddin: 'Ushuluddin',
      syariah: 'Syariah',
      lughah: 'Dirasat Islamiyah',
      dirasat: 'Dirasat Islamiyah',
      umum: 'Umum',
    };
    return map[f?.toLowerCase()] || f || 'Umum';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0c0c0c' }}>
      {/* Hero header */}
      <div style={{
        padding: '48px 24px 32px',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'linear-gradient(to bottom, rgba(62,207,142,0.06), transparent)',
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 2,
          color: EM, marginBottom: 12,
        }}>
          BANK SOAL IMTIHAN
        </div>
        <h1 style={{
          fontSize: 'clamp(28px,5vw,42px)', fontWeight: 800,
          color: '#fff', margin: '0 0 10px',
          fontFamily: '"DM Sans",sans-serif', lineHeight: 1.15,
        }}>
          Soal Ujian Al-Azhar
        </h1>
        <p style={{
          fontSize: 15, color: '#888', margin: '0 auto 24px',
          maxWidth: 480, lineHeight: 1.7,
        }}>
          Koleksi soal tahriri dari Masisir untuk Masisir.<br/>
          Preview soal pertama gratis — login member untuk akses penuh.
        </p>

        {/* Filter */}
        <div style={{
          display: 'flex', gap: 10, justifyContent: 'center',
          flexWrap: 'wrap', maxWidth: 560, margin: '0 auto',
        }}>
          <select
            value={filter.tahun}
            onChange={e => setFilter(f => ({ ...f, tahun: e.target.value, maddah: '' }))}
            style={{
              padding: '9px 14px', borderRadius: 10, fontSize: 13,
              border: '1px solid rgba(255,255,255,0.12)',
              background: '#1a1a1a', color: filter.tahun ? '#fff' : '#666',
              minWidth: 140, cursor: 'pointer',
            }}
          >
            <option value="">Semua Tahun</option>
            {tahunList.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select
            value={filter.maddah}
            onChange={e => setFilter(f => ({ ...f, maddah: e.target.value }))}
            style={{
              padding: '9px 14px', borderRadius: 10, fontSize: 13,
              border: '1px solid rgba(255,255,255,0.12)',
              background: '#1a1a1a', color: filter.maddah ? '#fff' : '#666',
              minWidth: 200, cursor: 'pointer',
            }}
          >
            <option value="">Semua Maddah</option>
            {maddahList.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          {(filter.tahun || filter.maddah) && (
            <button
              onClick={() => setFilter({ tahun: '', maddah: '' })}
              style={{
                padding: '9px 14px', borderRadius: 10, fontSize: 13,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent', color: '#666', cursor: 'pointer',
              }}
            >✕ Reset</button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Summary */}
        {!loading && groups.length > 0 && (
          <div style={{
            fontSize: 12, color: '#555', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              display: 'inline-block', width: 6, height: 6,
              borderRadius: '50%', background: EM,
            }}/>
            {groups.length} slot tersedia · {filtered.length} soal total
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div
            className="bank-soal-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{
                height: 140, borderRadius: 14,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}/>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '64px 20px',
            color: '#555', fontSize: 14,
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            Belum ada soal untuk filter ini.
          </div>
        ) : (
          <div
            className="bank-soal-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}
          >
            {groups.map(group => (
              <div
                key={group.key}
                onClick={() => setSelected(group)}
                style={{
                  borderRadius: 14, padding: '18px 18px 16px',
                  background: '#111',
                  border: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  display: 'flex', flexDirection: 'column', gap: 0,
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.border = '1px solid rgba(62,207,142,0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Top accent line */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: 2,
                  background: 'linear-gradient(90deg, transparent, rgba(62,207,142,0.6), transparent)',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                }}/>

                {/* Fakultas badge */}
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
                  color: '#555', marginBottom: 10,
                  textTransform: 'uppercase',
                }}>
                  {fakultasLabel(group.fakultas)}
                </div>

                {/* Nama maddah */}
                <div style={{
                  fontSize: 15, fontWeight: 700, color: '#fff',
                  lineHeight: 1.35, marginBottom: 6,
                  flex: 1,
                }}>
                  {group.maddah_nama}
                </div>

                {/* Tahun + fashl */}
                <div style={{
                  fontSize: 12, color: '#666', marginBottom: 14,
                }}>
                  {group.tahun} · {group.fashl === 'awwal' ? 'Fashl Awwal' : 'Fashl Tsani'}
                </div>

                {/* Footer */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingTop: 12,
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: EM,
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: EM, display: 'inline-block',
                    }}/>
                    {group.count} soal
                  </span>
                  <span style={{
                    fontSize: 11, color: '#444',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    Lihat →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA submit soal */}
        <div style={{
          marginTop: 48, padding: '28px 32px',
          background: 'rgba(255,200,50,0.05)',
          border: '1px solid rgba(255,200,50,0.15)',
          borderRadius: 16,
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', gap: 20, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              Punya soal imtihan tahun lalu?
            </div>
            <div style={{ fontSize: 13, color: '#888' }}>
              Submit & dapat akses Talqeeh lifetime gratis atau voucher makan siang Rp 50.000
            </div>
          </div>
          <a href="#/submit-soal" style={{
            padding: '11px 24px', borderRadius: 11,
            background: '#ffc832', color: '#000',
            fontWeight: 800, fontSize: 14, textDecoration: 'none',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            📸 Submit Soal →
          </a>
        </div>
      </div>

      {/* Modal */}
      {selected && <SoalModal group={selected} onClose={() => setSelected(null)}/>}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        @media (max-width: 900px) {
          .bank-soal-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .bank-soal-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

window.BankSoalPublikPage = BankSoalPublikPage;
