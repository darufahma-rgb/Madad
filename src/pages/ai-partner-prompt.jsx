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
// autoSend: langsung dikirim (dari kotak tanya di beranda AI Partner); threadId: buka percakapan lama.
const runPromptInTalqeeh = (text, { title = '', source = '', autoSend = false, threadId = '' } = {}) => {
  try { sessionStorage.setItem(PENDING_KEY, JSON.stringify({ text, title, source, autoSend, threadId })); } catch {}
  navigate('/ai-partner/prompt');
};
const openPromptThread = (threadId) => runPromptInTalqeeh('', { threadId });

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
  const [historyOpen, setHistoryOpen] = useState(false);
  const inputRef  = useRef(null);

  // Kotak ketik tumbuh mengikuti isi, maksimal ±12 baris.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 300) + 'px';
  }, [input]);

  // Prompt kiriman dari halaman lain → percakapan baru, isi kotak input supaya bisa diedit dulu.
  useEffect(() => {
    const pending = takePending();
    if (pending?.threadId) {
      const found = readThreads().find(t => t.id === pending.threadId);
      if (found) setThread(found);
    } else if (pending?.text && pending.autoSend) {
      send(pending.text.slice(0, MAX_INPUT), newThread({ ...pending, title: pending.title || pending.text.slice(0, 60) }));
    } else if (pending?.text) {
      setThread(newThread(pending));
      setInput(pending.text.slice(0, MAX_INPUT));
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, []);

  useEffect(() => {
    // Kotak ketik menempel di bawah layar, jadi gulir halaman ke paling bawah (bukan ke elemen penanda).
    if (thread?.messages.length || sending) window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  }, [thread?.messages.length, sending, Math.floor(live.length / 300)]);

  const persist = (t) => {
    const next = [t, ...readThreads().filter(x => x.id !== t.id)];
    writeThreads(next);
    setThreads(next.slice(0, MAX_THREADS));
  };

  const send = async (text, startThread) => {
    const message = (typeof text === 'string' ? text : input).trim();
    if (!message || sending) return;
    const base = startThread || thread || newThread({ title: message.slice(0, 60) });
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
  const pickThread = (t) => { setThread(t); setInput(''); setError(''); setHistoryOpen(false); };

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - var(--app-header-h, 64px) - var(--tabbar-height, 0px))' }}>
      {/* Bar atas: kembali · judul · riwayat · percakapan baru */}
      <div className="container-x w-full pt-3 md:pt-5">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <button onClick={() => navigate('/ai-partner')} aria-label="Kembali ke AI Partner"
            className="w-9 h-9 -ml-2 rounded-lg flex items-center justify-center text-ink-soft hover:text-ink hover:bg-white/5 flex-shrink-0">
            <Icon name="chevronLeft" className="w-5 h-5"/>
          </button>
          <div className="min-w-0 flex-1">
            <div className="text-sm text-ink font-medium truncate">{thread ? threadTitle(thread) : 'Percakapan baru'}</div>
            {thread?.source && <div className="text-[11px] text-ink-soft truncate">{thread.source}</div>}
          </div>
          <div className="relative flex-shrink-0">
            <button onClick={() => setHistoryOpen(o => !o)} aria-expanded={historyOpen}
              className="h-9 px-3 rounded-lg text-xs text-ink-muted hover:text-ink hover:bg-white/5 inline-flex items-center gap-1.5">
              <Icon name="messageSquare" className="w-4 h-4"/> <span className="hidden sm:inline">Riwayat</span>
            </button>
            {historyOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setHistoryOpen(false)}/>
                <div className="absolute right-0 top-11 z-50 w-[300px] max-w-[85vw] rounded-2xl border border-white/10 p-2 shadow-2xl shadow-black/50"
                  style={{ background: '#161616' }}>
                  <div className="px-2.5 py-1.5 text-[11px] uppercase tracking-wider text-ink-soft">Riwayat · disimpan di perangkat ini</div>
                  {threads.length === 0
                    ? <p className="px-2.5 py-3 text-xs text-ink-soft">Belum ada percakapan.</p>
                    : <div className="max-h-[360px] overflow-y-auto">
                        {threads.map(t => (
                          <div key={t.id} onClick={() => pickThread(t)}
                            className={`flex items-center gap-2 rounded-lg px-2.5 py-2 cursor-pointer ${thread?.id === t.id ? 'bg-emerald-500/12' : 'hover:bg-white/5'}`}>
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
                </div>
              </>
            )}
          </div>
          <button onClick={startNew} title="Percakapan baru"
            className="h-9 px-3 rounded-lg text-xs text-ink-muted hover:text-ink hover:bg-white/5 inline-flex items-center gap-1.5 flex-shrink-0">
            <Icon name="pen" className="w-4 h-4"/> <span className="hidden sm:inline">Baru</span>
          </button>
        </div>
      </div>

      {/* Percakapan: satu kolom di tengah */}
      <div className="container-x w-full flex-1">
        <div className="max-w-3xl mx-auto pt-6 pb-6 space-y-7">
          {messages.length === 0 && !sending && (
            <div className="text-center pt-10 md:pt-16 max-w-md mx-auto">
              <LogoMark size={44} className="mb-4"/>
              <p className="text-ink-muted text-sm leading-relaxed">
                {input
                  ? 'Prompt sudah siap di kotak bawah. Lengkapi bagian dalam [kurung siku] kalau ada, lalu kirim.'
                  : 'Tanya seputar ilmu keislaman, bahasa Arab, dan maddahmu — atau tempel prompt Talqeeh.'}
              </p>
              {!input && (
                <button onClick={() => navigate('/maddah')} className="mt-4 h-9 px-3.5 rounded-xl border border-white/10 text-xs text-ink-muted hover:text-ink hover:bg-white/5 inline-flex items-center gap-1.5">
                  <Icon name="layers" className="w-3.5 h-3.5"/> Pilih prompt dari Maddah
                </button>
              )}
            </div>
          )}

          {messages.map((m, i) => m.role === 'user' ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] text-ink bg-white/[0.07] border border-white/[0.06] min-w-0">
                <UserMessage text={m.content}/>
              </div>
            </div>
          ) : (
            <div key={i} className="flex gap-3">
              <LogoMark size={28} className="flex-shrink-0 mt-0.5"/>
              <div className="min-w-0 flex-1">
                <AiRichText content={m.content} size="md"/>
                <div className="mt-2 flex gap-1 text-xs text-ink-soft">
                  <button onClick={() => copy(m.content)} className="h-7 px-2 rounded-md inline-flex items-center gap-1 hover:text-ink hover:bg-white/5">
                    <Icon name="copy" className="w-3.5 h-3.5"/> Salin
                  </button>
                  <button onClick={() => saveNote(m.content)} className="h-7 px-2 rounded-md inline-flex items-center gap-1 hover:text-ink hover:bg-white/5">
                    <Icon name="bookmark" className="w-3.5 h-3.5"/> Simpan ke Kurasah
                  </button>
                </div>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex gap-3">
              <LogoMark size={28} className={`flex-shrink-0 mt-0.5 ${live.trim() ? '' : 'animate-pulse'}`}/>
              <div className="min-w-0 flex-1">
                {live.trim()
                  ? <><AiRichText content={live} size="md"/><span className="inline-block w-2 h-4 bg-emerald-400/80 align-middle animate-pulse mt-1"/></>
                  : <div className="text-sm text-ink-soft pt-1">Sedang berpikir…</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kotak ketik menempel di bawah */}
      <div className="sticky z-20 pt-3 pb-3 md:pb-5" style={{ bottom: 'var(--tabbar-height, 0px)', background: 'linear-gradient(to top, rgb(12,12,12) 70%, rgba(12,12,12,0))' }}>
        <div className="container-x w-full">
          <div className="max-w-3xl mx-auto">
            {error && <div className="text-sm text-rose-400 mb-2 px-1">{error}</div>}
            {hasPlaceholder && !sending && (
              <div className="text-xs text-amber-400/90 mb-2 px-1">💡 Masih ada bagian [dalam kurung siku] — isi dulu supaya jawabannya pas.</div>
            )}
            <div className="rounded-2xl border border-white/12 bg-[#1a1a1a] shadow-2xl shadow-black/40 focus-within:border-emerald-500/40 transition-colors">
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} maxLength={MAX_INPUT} rows={1} dir="auto"
                onKeyDown={e => {
                  if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing) return;
                  // Prompt panjang yang sedang diedit: Enter = baris baru, Ctrl/Cmd+Enter = kirim.
                  if (input.length < 200 || e.metaKey || e.ctrlKey) { e.preventDefault(); send(); }
                }}
                placeholder={messages.length ? 'Balas…' : 'Tulis pertanyaan atau tempel prompt…'}
                className="w-full bg-transparent resize-none outline-none focus-visible:outline-none px-4 pt-3.5 text-ink placeholder-ink-soft leading-relaxed"
                style={{ fontSize: 16, minHeight: 52 }}/>
              <div className="flex items-center justify-between gap-2 px-2.5 pb-2.5">
                <span className="text-[11px] text-ink-soft px-1.5 hidden sm:inline">
                  {input.length >= 200 ? 'Ctrl + Enter untuk kirim' : 'Enter kirim · Shift + Enter baris baru'}
                </span>
                <button onClick={send} disabled={sending || !input.trim()} aria-label="Kirim"
                  className="ml-auto w-9 h-9 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40"
                  style={{ background: input.trim() && !sending ? '#3ecf8e' : 'rgba(255,255,255,0.08)' }}>
                  <Icon name="arrowRight" className="w-4 h-4" style={{ stroke: input.trim() && !sending ? '#0b0b0b' : 'currentColor' }}/>
                </button>
              </div>
            </div>
            <p className="text-[11px] text-ink-soft text-center mt-2">AI bisa keliru. Cek kembali ke kitab muqarrar atau duktur.</p>
          </div>
        </div>
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
      {status.loading
        ? <div className="container-x pt-10 pb-24"><div className="card-glass p-6 max-w-xl mx-auto"><Skeleton lines={3}/></div></div>
        : status.tier === 'pro'
          ? <PromptChat/>
          : <div className="container-x pt-10 pb-24 max-w-2xl mx-auto">
              <UpgradeCard
                title={status.tier === 'none' ? 'Khusus member Talqeeh' : 'Tanya AI khusus pelanggan AI Partner'}
                message="Jalankan semua prompt Talqeeh langsung di sini dan lanjutkan percakapannya, tanpa salin-tempel ke AI lain."/>
            </div>}
    </div>
  );
};

Object.assign(window, { AiPromptPage, runPromptInTalqeeh, openPromptThread, RunInTalqeehButton, readPromptThreads: readThreads, promptThreadTitle: threadTitle });
