import React, { useState, useEffect } from 'react';

const CopyPromptButton = ({ label, onCopy, EM, variant = 'outline' }) => {
  const [copied, setCopied] = React.useState(false);
  const handleClick = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };
  const isSolid = variant === 'solid';
  return (
    <button
      onClick={handleClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 14px', borderRadius: 9,
        fontSize: 12, fontWeight: 700, cursor: 'pointer',
        transition: 'all 0.15s',
        ...(isSolid ? {
          background: copied ? 'rgba(62,207,142,0.25)' : EM,
          color: copied ? EM : '#000',
          border: `1px solid ${copied ? 'rgba(62,207,142,0.4)' : EM}`,
        } : {
          background: copied ? 'rgba(62,207,142,0.12)' : 'rgba(255,255,255,0.04)',
          color: copied ? EM : '#aaa',
          border: `1px solid ${copied ? 'rgba(62,207,142,0.3)' : 'rgba(255,255,255,0.1)'}`,
        }),
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {copied
          ? <polyline points="20 6 9 17 4 12"/>
          : <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>
        }
      </svg>
      {copied ? 'Tersalin ✓' : label}
    </button>
  );
};

const SoalDetailPage = () => {
  const { session } = useAuth();
  const toast = useToast();

  const isMember = (() => {
    try {
      const s = JSON.parse(localStorage.getItem('madad_session') || '{}');
      return !!s.code;
    } catch { return false; }
  })();

  const path    = window.location.hash.slice(1);
  const idMatch = path.match(/^\/soal-detail\/([^?]+)/);
  const soalId  = idMatch ? idMatch[1] : null;

  const [soal, setSoal]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  const EM = '#3ecf8e';

  useEffect(() => {
    if (!soalId) { setNotFound(true); setLoading(false); return; }
    (async () => {
      try {
        const cfg = await fetch('/api/config').then(r => r.json());
        const supabaseUrl = cfg.supabaseUrl || '';
        const anonKey     = cfg.supabaseAnonKey || '';
        if (!supabaseUrl || !anonKey) { setNotFound(true); setLoading(false); return; }
        const r = await fetch(
          `${supabaseUrl}/rest/v1/bank_soal?id=eq.${encodeURIComponent(soalId)}&status=eq.approved&select=id,fakultas,maddah_nama,tahun,fashl,soal,arti_soal,jawaban,penjelasan`,
          { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } }
        );
        const data = await r.json();
        if (Array.isArray(data) && data.length > 0) {
          setSoal(data[0]);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [soalId]);

  if (!session) { navigate('/'); return null; }

  const buildPromptJawaban = (nomorSoal, arabSoal, artiSoal) => {
    if (!soal) return '';
    const maddah   = soal.maddah_nama || '[maddah]';
    const tahun    = soal.tahun       || '[tahun]';
    const fashlStr = soal.fashl === 'awwal' ? 'Fashl Awwal' : 'Fashl Tsani';
    return `Aku mahasiswa Al-Azhar sedang mempersiapkan jawaban untuk soal ujian berikut.

Mata kuliah : ${maddah}
Tahun / Fashl: ${tahun} · ${fashlStr}
Nomor soal  : ${nomorSoal}

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

  const soalBlocks = React.useMemo(() => {
    if (!soal?.soal) return [];
    if (soal.soal.includes('[SOAL_ARAB]')) {
      return soal.soal.split('[SOAL_ARAB]').filter(Boolean).map(block => {
        const parts = block.split('[ARTI]');
        return { arab: parts[0]?.trim() || '', arti: parts[1]?.trim() || '' };
      });
    }
    return [{ arab: soal.soal.trim(), arti: '' }];
  }, [soal?.soal]);

  const jawabanArr = Array.isArray(soal?.jawaban)    ? soal.jawaban    : [];
  const artiArr    = Array.isArray(soal?.arti_soal)  ? soal.arti_soal  : [];
  const penjArr    = Array.isArray(soal?.penjelasan) ? soal.penjelasan : [];
  const totalSoal  = Math.max(soalBlocks.length, jawabanArr.length, 1);

  if (loading) {
    return (
      <div className="page-enter">
        <div className="container-x py-20 text-center">
          <div style={{ fontSize: 13, color: '#666' }}>Memuat soal...</div>
        </div>
      </div>
    );
  }

  if (notFound || !soal) {
    return (
      <div className="page-enter">
        <div className="container-x py-20 text-center">
          <div className="arabic-display text-gold-300 text-3xl mb-4" style={{ direction: 'rtl' }}>تَلْقِيح</div>
          <p className="text-ink-muted mb-2">Soal tidak ditemukan.</p>
          <button
            onClick={() => navigate('/siap-imtihan')}
            className="btn btn-ghost text-sm px-4 py-2">
            ← Kembali ke Siap Imtihan
          </button>
        </div>
      </div>
    );
  }

  const fashlStr = soal.fashl === 'awwal' ? 'Fashl Awwal' : 'Fashl Tsani';

  const cleanArab = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .trim();
  };

  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const parseBold = (str) => {
        const parts = str.split(/\*\*(.*?)\*\*/g);
        return parts.map((part, j) =>
          j % 2 === 1
            ? <strong key={j} style={{ color: '#fff', fontWeight: 700 }}>{part}</strong>
            : part
        );
      };

      if (line.startsWith('### ')) return (
        <div key={i} style={{ fontSize: 13, fontWeight: 700, color: EM, marginTop: 14, marginBottom: 4, letterSpacing: 0.3 }}>
          {parseBold(line.slice(4))}
        </div>
      );
      if (line.startsWith('## ')) return (
        <div key={i} style={{ fontSize: 14, fontWeight: 700, color: '#ddd', marginTop: 16, marginBottom: 6 }}>
          {parseBold(line.slice(3))}
        </div>
      );

      if (/^[-*] /.test(line)) return (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4, paddingLeft: 4 }}>
          <span style={{ color: EM, flexShrink: 0, marginTop: 2 }}>•</span>
          <span style={{ fontSize: 13, color: '#ccc', lineHeight: 1.7 }}>{parseBold(line.slice(2))}</span>
        </div>
      );

      if (/^\d+\. /.test(line)) {
        const num = line.match(/^(\d+)\. /)[1];
        return (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4, paddingLeft: 4 }}>
            <span style={{ color: EM, flexShrink: 0, fontWeight: 700, minWidth: 16 }}>{num}.</span>
            <span style={{ fontSize: 13, color: '#ccc', lineHeight: 1.7 }}>{parseBold(line.slice(num.length + 2))}</span>
          </div>
        );
      }

      if (line.trim() === '---') return (
        <hr key={i} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.07)', margin: '12px 0' }}/>
      );

      if (line.trim() === '') return <div key={i} style={{ height: 6 }}/>;

      return (
        <div key={i} style={{ fontSize: 13, color: '#ccc', lineHeight: 1.75, marginBottom: 2 }}>
          {parseBold(line)}
        </div>
      );
    });
  };

  return (
    <div className="page-enter">

      {/* ── Header ── */}
      <section className="relative pt-4 md:pt-10 pb-6 md:pb-8 overflow-hidden">
        <Blob color="rgba(62,207,142,0.18)" size={500} top={-150} right={-100}/>
        <div className="container-x relative">

          <button
            onClick={() => navigate('/siap-imtihan')}
            className="text-sm text-ink-soft hover:text-ink inline-flex items-center gap-2 mb-5"
            style={{ minHeight: 40 }}>
            ← Siap Imtihan
          </button>

          <div className="flex items-start justify-between flex-wrap gap-4 mb-3">
            <div>
              <div style={{
                fontSize: 10, color: EM, fontWeight: 700,
                letterSpacing: 1.4, marginBottom: 8,
              }}>
                BANK SOAL
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink">
                {soal.maddah_nama}
              </h1>
              <div className="text-base text-ink-muted mt-2">
                {soal.tahun} · {fashlStr}
              </div>
              {soal.fakultas && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  marginTop: 8,
                  fontSize: 12, color: '#3ecf8e', fontWeight: 600,
                  padding: '4px 12px', borderRadius: 20,
                  background: 'rgba(62,207,142,0.1)',
                  border: '1px solid rgba(62,207,142,0.25)',
                }}>
                  {(() => {
                    const faculties = typeof FACULTIES !== 'undefined' ? FACULTIES : [];
                    const found = faculties.find(f => f.id === soal.fakultas);
                    return found ? found.label : soal.fakultas;
                  })()}
                </div>
              )}
            </div>
            {isMember && (
              <div style={{
                fontSize: 11, padding: '5px 12px', borderRadius: 20,
                background: 'rgba(62,207,142,0.12)',
                border: '1px solid rgba(62,207,142,0.25)',
                color: EM, fontWeight: 700, letterSpacing: 0.5,
                alignSelf: 'flex-start',
              }}>
                ✓ MEMBER
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <div style={{
              fontSize: 11, color: '#888', fontWeight: 600,
              padding: '4px 12px', borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
            }}>
              {totalSoal} soal
            </div>
            <div style={{
              fontSize: 11, color: '#888', fontWeight: 600,
              padding: '4px 12px', borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
            }}>
              {fashlStr}
            </div>
          </div>
        </div>
      </section>

      {/* ── Daftar Soal ── */}
      <section className="container-x pb-20">

        <div style={{
          marginBottom: 24, padding: '14px 16px', borderRadius: 12,
          background: 'rgba(62,207,142,0.05)',
          border: '1px solid rgba(62,207,142,0.18)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 10,
        }}>
          <div style={{ fontSize: 13, color: '#aaa', lineHeight: 1.5 }}>
            <span style={{ color: EM, fontWeight: 700 }}>Mau latihan lengkap?</span>
            {' '}Salin semua prompt sekaligus lalu paste ke AI.
          </div>
          <CopyPromptButton
            label="Salin Semua Prompt"
            onCopy={() => {
              const allPrompts = Array.from({ length: totalSoal }).map((_, i) => {
                const block = soalBlocks[i] || { arab: '', arti: '' };
                const arti  = artiArr[i]    || block.arti || '';
                return `${'='.repeat(40)}\n${buildPromptJawaban(i + 1, block.arab, arti)}`;
              }).join('\n\n');
              navigator.clipboard.writeText(allPrompts);
              toast?.push?.('Semua prompt tersalin — paste ke AI');
            }}
            EM={EM}
            variant="solid"
          />
        </div>

        <div className="space-y-6">
          {Array.from({ length: totalSoal }).map((_, i) => {
            const block   = soalBlocks[i] || { arab: '', arti: '' };
            const jawaban = jawabanArr[i] || '';
            const arti    = artiArr[i]    || block.arti || '';
            const penj    = penjArr[i]    || '';
            const blurJawaban = !isMember && !!jawaban;
            const previewWord = blurJawaban
              ? jawaban.split(' ').slice(0, Math.max(4, Math.floor(jawaban.split(' ').length * 0.28))).join(' ') + '…'
              : jawaban;

            return (
              <div key={i} className="card-glass p-5 md:p-6">

                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 16,
                  flexWrap: 'wrap', gap: 8,
                }}>
                  <div style={{
                    fontSize: 11, color: EM, fontWeight: 700,
                    letterSpacing: 0.8, display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 7,
                      background: 'rgba(62,207,142,0.15)',
                      border: '1px solid rgba(62,207,142,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: EM, fontWeight: 800,
                    }}>{i + 1}</div>
                    SOAL {i + 1}
                  </div>
                  <CopyPromptButton
                    label={`Salin Prompt Jawaban Soal ${i + 1}`}
                    onCopy={() => {
                      const prompt = buildPromptJawaban(i + 1, block.arab, arti);
                      navigator.clipboard.writeText(prompt);
                      toast?.push?.(`Prompt Soal ${i + 1} tersalin — paste ke AI`);
                    }}
                    EM={EM}
                  />
                </div>

                {block.arab ? (
                  <div style={{
                    direction: 'rtl', textAlign: 'right',
                    fontSize: 18, lineHeight: 2.2, color: '#f0ece4',
                    fontFamily: '"Scheherazade New", "Noto Naskh Arabic", "Traditional Arabic", serif',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12, padding: '16px 20px', marginBottom: 12,
                  }}>
                    {cleanArab(block.arab)}
                  </div>
                ) : null}

                {arti ? (
                  <div style={{
                    fontSize: 13, color: '#bbb', lineHeight: 1.8,
                    paddingLeft: 14,
                    borderLeft: '2px solid rgba(62,207,142,0.35)',
                    marginBottom: 16,
                  }}>
                    {renderMarkdown(arti)}
                  </div>
                ) : null}

                {jawaban ? (
                  <div>
                    <div style={{
                      fontSize: 10, color: '#666', fontWeight: 700,
                      letterSpacing: 0.8, marginBottom: 10,
                    }}>
                      JAWABAN
                    </div>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        direction: 'rtl', textAlign: 'right',
                        fontSize: 17, lineHeight: 2.2,
                        fontFamily: '"Scheherazade New", "Noto Naskh Arabic", "Traditional Arabic", serif',
                        color: '#e8e4dc',
                        background: 'rgba(62,207,142,0.04)',
                        border: '1px solid rgba(62,207,142,0.14)',
                        borderRadius: 12, padding: '16px 20px',
                        filter: blurJawaban ? 'blur(5px)' : 'none',
                        userSelect: blurJawaban ? 'none' : 'auto',
                        WebkitUserSelect: blurJawaban ? 'none' : 'auto',
                        transition: 'filter 0.2s',
                      }}>
                        {blurJawaban ? previewWord : jawaban}
                      </div>
                      {blurJawaban && (
                        <div style={{
                          position: 'absolute', inset: 0, borderRadius: 12,
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center', gap: 10,
                          background: 'rgba(0,0,0,0.5)',
                        }}>
                          <div style={{ fontSize: 24 }}>🔒</div>
                          <div style={{ fontSize: 14, color: '#fff', fontWeight: 700 }}>
                            Jawaban lengkap untuk member
                          </div>
                          <a href="#/maddah-publik"
                            style={{
                              padding: '8px 22px', borderRadius: 9,
                              background: EM, color: '#000',
                              fontWeight: 800, fontSize: 13, textDecoration: 'none',
                            }}>
                            Gabung Member →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '16px', borderRadius: 10,
                    background: 'rgba(62,207,142,0.04)',
                    border: '1px solid rgba(62,207,142,0.18)',
                    display: 'flex', flexDirection: 'column', gap: 10,
                  }}>
                    <div style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>
                      Jawaban belum tersedia — gunakan prompt di bawah untuk dapat jawaban dari AI sekarang.
                    </div>
                    <CopyPromptButton
                      label={`Salin Prompt Jawaban Soal ${i + 1}`}
                      onCopy={() => {
                        const prompt = buildPromptJawaban(i + 1, block.arab, arti);
                        navigator.clipboard.writeText(prompt);
                        toast?.push?.(`Prompt Soal ${i + 1} tersalin — paste ke AI`);
                      }}
                      EM={EM}
                      variant="solid"
                    />
                  </div>
                )}

                {penj && isMember && (
                  <div style={{
                    marginTop: 12,
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 10, padding: '14px 16px',
                    fontSize: 13, lineHeight: 1.8, color: '#bbb',
                  }}>
                    <div style={{
                      fontSize: 10, color: '#555', fontWeight: 700,
                      marginBottom: 8, letterSpacing: 0.6,
                    }}>
                      PENJELASAN
                    </div>
                    {penj}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

window.SoalDetailPage = SoalDetailPage;
