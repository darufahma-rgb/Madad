import React, { useState, useEffect, useRef } from 'react';
import AiRichText from '../components/AiRichText.jsx';
/* Talqeeh — AI Partner: jalankan prompt Talqeeh langsung di sini, tanpa salin-tempel ke AI lain.
   Tombol "Jalankan di Talqeeh" di halaman prompt memanggil runPromptInTalqeeh(); percakapan disimpan di perangkat. */

const PENDING_KEY = 'talqeeh_pending_prompt';
const THREADS_KEY = 'talqeeh_prompt_chats';
const MAX_THREADS  = 30;
const MAX_MESSAGES = 40;
const SEND_TURNS   = 16;
const MAX_INPUT    = 12000;

const readThreads = () => {
  try { const v = JSON.parse(localStorage.getItem(THREADS_KEY) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
};
const writeThreads = (threads) => {
  try { localStorage.setItem(THREADS_KEY, JSON.stringify(threads.slice(0, MAX_THREADS))); } catch {}
};

// Dipanggil dari halaman prompt: simpan prompt, lalu buka halaman ini.
const runPromptInTalqeeh = (text, { title = '', source = '' } = {}) => {
  try { sessionStorage.setItem(PENDING_KEY, JSON.stringify({ text, title, source })); } catch {}
  navigate('/ai-partner/prompt');
};

const takePending = () => {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    sessionStorage.removeItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

// Tombol yang dipasang di samping "Salin Prompt". getText boleh fungsi supaya prompt dibaca saat diklik.
const RunInTalqeehButton = ({ getText, title, source, className = 'btn-ghost text-xs px-4 py-2.5', label = 'Jalankan di Talqeeh' }) => (
  <button
    onClick={() => runPromptInTalqeeh(typeof getText === 'function' ? getText() : getText, { title, source })}
    className={`${className} inline-flex items-center gap-1.5`}
    style={{ minHeight: 40, borderColor: 'rgba(62,207,142,0.35)', color: '#a7f3d0' }}>
    <Icon name="sparkles" className="w-3.5 h-3.5"/>
    {label}
  </button>
);

const PLACEHOLDER_RE = /\[(tulis|nama|pengarang|penerbit|jilid|TOPIK|kitab|JUDUL)[^\]]*\]/i;

const newThread = (pending) => ({
  id: 'pc_' + Date.now(),
  title: pending?.title || 'Prompt Talqeeh',
  source: pending?.source || '',
  messages: [],
  updatedAt: new Date().toISOString(),
});

const threadTitle = (t) => t.title || t.messages.find(m => m.role === 'user')?.content.slice(0, 60) || 'Percakapan';

const PromptChat = () => {
  const toast = useToast();
  const [threads, setThreads] = useState(readThreads);
  const [thread, setThread]   = useState(null);
  const [input, setInput]     = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState('');
  const [live, setLive]       = useState('');
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Prompt kiriman dari halaman lain → percakapan baru, isi kotak input supaya bisa diedit dulu.
  useEffect(() => {
    const pending = takePending();
    if (pending?.text) {
      setThread(newThread(pending));
      setInput(pending.text.slice(0, MAX_INPUT));
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [thread?.messages.length, sending, Math.floor(live.length / 300)]);

  const persist = (t) => {
    const next = [t, ...readThreads().filter(x => x.id !== t.id)];
    writeThreads(next);
    setThreads(next.slice(0, MAX_THREADS));
  };

  const send = async () => {
    const message = input.trim();
    if (!message || sending) return;
    const base = thread || newThread(null);
    const withUser = {
      ...base,
      messages: [...base.messages, { role: 'user', content: message }].slice(-MAX_MESSAGES),
      updatedAt: new Date().toISOString(),
    };
    setThread(withUser);
    setInput('');
    setError('');
    setSending(true);
    setLive('');
    const data = await aiStream('prompt-chat', {
      messages: withUser.messages.slice(-SEND_TURNS).map(m => ({ role: m.role, content: m.content })),
    }, (_, full) => setLive(full));
    setSending(false);
    setLive('');
    // Koneksi putus di tengah jawaban: simpan yang sudah diterima, pengguna bisa minta lanjutkan.
    if (!data.ok && data.partial?.trim()) {
      data.ok = true;
      data.reply = `${data.partial.trimEnd()}\n\n_(Koneksi terputus sebelum jawaban selesai — ketik **lanjutkan** untuk meneruskan.)_`;
    }
    if (!data.ok) {
      setError(data.error || 'Gagal mengirim pesan');
      setThread(base);
      setInput(message);
      return;
    }
    const done = {
      ...withUser,
      messages: [...withUser.messages, { role: 'assistant', content: data.reply, model: data.model }].slice(-MAX_MESSAGES),
      updatedAt: new Date().toISOString(),
    };
    setThread(done);
    persist(done);
  };

  const startNew = () => { setThread(null); setInput(''); setError(''); };

  const removeThread = (id) => {
    const next = readThreads().filter(x => x.id !== id);
    writeThreads(next);
    setThreads(next);
    if (thread?.id === id) startNew();
  };

  const copy = (text) => {
    navigator.clipboard?.writeText(text);
    toast.push('Jawaban tersalin.');
  };

  const saveNote = (text) => {
    saveToKurasah(thread?.title || 'Jawaban AI', text, ['prompt']);
    toast.push('Tersimpan di Kurasah.');
  };

  const messages = thread?.messages || [];
  const hasPlaceholder = PLACEHOLDER_RE.test(input);

  return (
    <div className="container-x pb-24">
      <div className="grid lg:grid-cols-[1fr_280px] gap-5 items-start">
        <div>
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <div className="min-w-0">
              <div className="text-sm text-ink font-medium truncate">{thread ? threadTitle(thread) : 'Percakapan baru'}</div>
              {thread?.source && <div className="text-xs text-ink-soft truncate">{thread.source}</div>}
            </div>
            {messages.length > 0 && (
              <button onClick={startNew} className="btn btn-ghost text-xs px-3 py-1.5 inline-flex items-center gap-1.5">
                <Icon name="refresh" className="w-3.5 h-3.5"/> Percakapan baru
              </button>
            )}
          </div>

          <div className="card-glass p-4 md:p-6 flex flex-col" style={{ minHeight: 440 }}>
            <div className="flex-1 space-y-4 overflow-y-auto mb-4" style={{ maxHeight: 560 }}>
              {messages.length === 0 && !sending && (
                <div className="text-center py-6 max-w-md mx-auto">
                  <p className="text-ink-muted text-sm leading-relaxed mb-4">
                    {input
                      ? 'Prompt sudah siap di kotak bawah. Lengkapi bagian dalam [kurung siku] kalau ada, lalu kirim.'
                      : 'Tempel prompt Talqeeh atau tulis pertanyaanmu. Bisa juga buka Maddah dan tekan "Jalankan di Talqeeh" di prompt mana pun.'}
                  </p>
                  {!input && (
                    <button onClick={() => navigate('/maddah')} className="btn btn-ghost text-xs px-4 py-2 inline-flex items-center gap-1.5">
                      <Icon name="layers" className="w-3.5 h-3.5"/> Pilih prompt dari Maddah
                    </button>
                  )}
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role !== 'user' && (
                    <span className="hidden sm:flex w-8 h-8 rounded-full flex-shrink-0 items-center justify-center mt-0.5"
                      style={{ background: 'rgba(62,207,142,0.14)', border: '1px solid rgba(62,207,142,0.3)' }}>
                      <Icon name="sparkles" className="w-4 h-4" style={{ stroke: '#3ecf8e' }}/>
                    </span>
                  )}
                  <div className={`rounded-2xl min-w-0 ${m.role === 'user'
                    ? 'max-w-[85%] px-4 py-2.5 text-sm bg-emerald-500/15 border border-emerald-500/25 text-ink rounded-br-md'
                    : 'max-w-[94%] sm:max-w-[88%] px-4 py-3.5 bg-white/[0.035] border border-white/10 rounded-tl-md'}`}>
                    {m.role === 'user'
                      ? <UserMessage text={m.content}/>
                      : <>
                          <AiRichText content={m.content} size="sm"/>
                          <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex gap-3 text-xs text-ink-soft">
                            <button onClick={() => copy(m.content)} className="inline-flex items-center gap-1 hover:text-ink">
                              <Icon name="copy" className="w-3 h-3"/> Salin
                            </button>
                            <button onClick={() => saveNote(m.content)} className="inline-flex items-center gap-1 hover:text-ink">
                              <Icon name="bookmark" className="w-3 h-3"/> Simpan ke Kurasah
                            </button>
                          </div>
                        </>}
                  </div>
                </div>
              ))}
              {sending && (live ? (
                <div className="flex gap-2.5 justify-start">
                  <span className="hidden sm:flex w-8 h-8 rounded-full flex-shrink-0 items-center justify-center mt-0.5"
                    style={{ background: 'rgba(62,207,142,0.14)', border: '1px solid rgba(62,207,142,0.3)' }}>
                    <Icon name="sparkles" className="w-4 h-4" style={{ stroke: '#3ecf8e' }}/>
                  </span>
                  <div className="max-w-[94%] sm:max-w-[88%] px-4 py-3.5 rounded-2xl rounded-tl-md bg-white/[0.035] border border-white/10 min-w-0">
                    <AiRichText content={live} size="sm"/>
                    <span className="inline-block w-2 h-4 bg-emerald-400/80 align-middle animate-pulse mt-1"/>
                  </div>
                </div>
              ) : <div className="text-xs text-ink-soft">AI sedang menulis…</div>)}
              <div ref={bottomRef}/>
            </div>

            {error && <div className="text-sm text-rose-400 mb-2">{error}</div>}
            {hasPlaceholder && !sending && (
              <div className="text-xs text-amber-400/90 mb-2">💡 Masih ada bagian [dalam kurung siku] — isi dulu supaya jawabannya pas.</div>
            )}
            <div className="flex gap-2">
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} maxLength={MAX_INPUT}
                rows={input.length > 200 ? 8 : 2}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && input.length < 200) { e.preventDefault(); send(); } }}
                placeholder={messages.length ? 'Lanjutkan percakapan…' : 'Tempel prompt atau tulis pertanyaanmu…'}
                className={`${aiInputClass} resize-y`} style={{ fontSize: 16 }} dir="auto"/>
              <button onClick={send} disabled={sending || !input.trim()} className="btn btn-primary px-4 self-end py-2.5" aria-label="Kirim">
                <Icon name="arrowRight" className="w-4 h-4"/>
              </button>
            </div>
          </div>
        </div>

        <aside className="card-glass p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs uppercase tracking-wider text-gold-400">Riwayat</div>
            <button onClick={startNew} className="text-xs text-emerald-300 hover:text-emerald-200">+ Baru</button>
          </div>
          {threads.length === 0
            ? <p className="text-xs text-ink-soft">Belum ada percakapan. Riwayat disimpan di perangkat ini.</p>
            : <div className="space-y-1.5 max-h-[420px] overflow-y-auto">
                {threads.map(t => (
                  <div key={t.id} className={`group flex items-center gap-2 rounded-lg px-2.5 py-2 cursor-pointer ${thread?.id === t.id ? 'bg-emerald-500/12' : 'hover:bg-white/5'}`}
                    onClick={() => { setThread(t); setInput(''); setError(''); }}>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-ink truncate">{threadTitle(t)}</div>
                      <div className="text-[10px] text-ink-soft">{new Date(t.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} · {t.messages.length} pesan</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); removeThread(t.id); }} className="text-ink-soft hover:text-rose-300 p-1" aria-label="Hapus">
                      <Icon name="trash" className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                ))}
              </div>}
        </aside>
      </div>
    </div>
  );
};

// Prompt panjang dilipat supaya percakapan tetap enak dibaca.
const UserMessage = ({ text }) => {
  const [open, setOpen] = useState(false);
  const long = text.length > 400;
  return (
    <>
      <span className="whitespace-pre-wrap break-words" dir="auto">{long && !open ? text.slice(0, 400) + '…' : text}</span>
      {long && (
        <button onClick={() => setOpen(o => !o)} className="block mt-1.5 text-xs text-emerald-300 hover:text-emerald-200">
          {open ? 'Ringkas' : 'Lihat prompt lengkap'}
        </button>
      )}
    </>
  );
};

const AiPromptPage = () => {
  const status = useAiStatus();
  return (
    <div className="page-enter">
      <div className="container-x pt-4 md:pt-8">
        <button onClick={() => navigate('/ai-partner')} className="text-sm text-ink-soft hover:text-ink inline-flex items-center gap-1.5" style={{ minHeight: 40 }}>
          <Icon name="chevronLeft" className="w-4 h-4"/> AI Partner
        </button>
      </div>
      <section className="container-x pt-2 pb-6">
        <div className="text-xs uppercase tracking-[0.22em] text-gold-400 mb-2">AI Partner · Jalankan Prompt</div>
        <h1 className="font-display text-2xl md:text-4xl font-semibold text-ink leading-tight">
          Prompt Talqeeh, langsung dijawab di sini.
        </h1>
        <p className="mt-2 text-sm md:text-base text-ink-muted max-w-2xl leading-relaxed">
          Tidak perlu salin-tempel ke AI lain. Jawaban disesuaikan dengan profil belajarmu.
        </p>
      </section>
      {status.loading
        ? <div className="container-x pb-24"><div className="card-glass p-6 max-w-xl"><Skeleton lines={3}/></div></div>
        : status.tier === 'pro'
          ? <PromptChat/>
          : <div className="container-x pb-24">
              <UpgradeCard
                title={status.tier === 'none' ? 'Khusus member Talqeeh' : 'Jalankan prompt khusus pelanggan AI Partner'}
                message="Jalankan semua prompt Talqeeh langsung di sini dan lanjutkan percakapannya, tanpa salin-tempel ke AI lain."/>
            </div>}
    </div>
  );
};

Object.assign(window, { AiPromptPage, runPromptInTalqeeh, RunInTalqeehButton });
