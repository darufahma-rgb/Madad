import React, { useState, useEffect, useRef } from 'react';
/* Talqeeh — Live Caption: dengar kuliah duktur, tampilkan transkrip Arab + terjemah Indonesia secara langsung.
   Mikrofon dibaca sebagai sampel mentah (bukan MediaRecorder) supaya tiap potongan bisa dipotong di jeda bicara
   dan dikirim sebagai WAV utuh ke action "live-caption" (transkrip + terjemah dalam satu panggilan). */

/* Dua mode saja: duktur berbahasa Arab (fushah, 'ammiyah Mesir, atau campuran — dikenali otomatis lewat dialek
   "campur") atau kuliah berbahasa Indonesia (kutipan Arabnya tetap diterjemahkan). */
const DIALECT_KEY = 'talqeeh_live_caption_lang';
const DIALECTS = [
  { id: 'campur', label: 'Bahasa Arab', sub: "fushah & 'ammiyah" },
  { id: 'indonesia', label: 'Bahasa Indonesia', sub: 'kutipan Arab diterjemahkan' },
];
const readDialect = () => { try { return DIALECTS.some(d => d.id === localStorage.getItem(DIALECT_KEY)) ? localStorage.getItem(DIALECT_KEY) : 'campur'; } catch { return 'campur'; } };

const DRAFT_KEY = 'talqeeh_live_caption_draft';
const readDraft = () => { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); } catch { return null; } };
const writeDraft = (d) => { try { d ? localStorage.setItem(DRAFT_KEY, JSON.stringify(d)) : localStorage.removeItem(DRAFT_KEY); } catch {} };

// Potongan dipotong di jeda bicara setelah MIN detik, paling lambat MAX detik (server menerima maks 20 detik).
// Pendek supaya teks cepat muncul; kalimat yang terpotong disambung lewat konteks di tahap terjemah ("…").
const CHUNK_MIN_S = 3;
const CHUNK_MAX_S = 8;
const PAUSE_S = 0.3;
// Terjemah per 2 potongan (digabung jadi satu kartu); potongan yang menunggu lebih dari ini diterjemahkan sendiri.
const TRANSLATE_BATCH = 2;
const TRANSLATE_WAIT_MS = 4000;
const ARABIC_FONT = { fontFamily: '"Noto Naskh Arabic", serif' };

const clock = (s) => {
  const t = Math.max(0, Math.floor(s));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60;
  return `${h ? `${h}:` : ''}${h ? String(m).padStart(2, '0') : m}:${String(sec).padStart(2, '0')}`;
};

/* Mikrofon → potongan Float32 di jeda bicara. onChunk(samples, sampleRate, startSec). */
const useLiveMic = ({ onChunk, onError }) => {
  const [recording, setRecording] = useState(false);
  const [level, setLevel] = useState(0);
  const mic = useRef(null);
  const onChunkRef = useRef(onChunk);
  onChunkRef.current = onChunk;
  const supported = typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && !!(window.AudioContext || window.webkitAudioContext);

  const flush = (m, force) => {
    const len = m.parts.reduce((n, p) => n + p.length, 0);
    if (!len || (!force && len < m.rate)) { if (force) m.parts = []; return; }
    const samples = new Float32Array(len);
    let o = 0;
    for (const p of m.parts) { samples.set(p, o); o += p.length; }
    const startSec = m.offset / m.rate;
    m.offset += len;
    m.parts = []; m.quiet = 0;
    // Potongan tanpa suara (peak rendah) tidak dikirim — tidak memakai jatah.
    if (m.peak >= 0.01) onChunkRef.current(samples, m.rate, startSec);
    m.peak = 0;
  };

  const release = () => {
    const m = mic.current;
    if (!m) return;
    m.proc.onaudioprocess = null;
    try { m.src.disconnect(); m.proc.disconnect(); } catch {}
    m.stream.getTracks().forEach(t => t.stop());
    m.ctx.close?.();
    m.wake?.release?.().catch?.(() => {});
    mic.current = null;
  };
  useEffect(() => () => release(), []);

  // baseOffset: detik rekaman sebelumnya, supaya cap waktu tetap berlanjut setelah jeda.
  const start = async (baseOffset = 0) => {
    if (mic.current) return;
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    } catch {
      onError('Izin mikrofon ditolak. Aktifkan izin mikrofon untuk situs ini di pengaturan browser.');
      return;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    await ctx.resume?.();
    const src = ctx.createMediaStreamSource(stream);
    const proc = ctx.createScriptProcessor(4096, 1, 1);
    const m = { ctx, src, proc, stream, rate: ctx.sampleRate, parts: [], quiet: 0, peak: 0, offset: Math.round(baseOffset * ctx.sampleRate), lastLevel: 0 };
    proc.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      const copy = new Float32Array(input);
      let sum = 0, peak = 0;
      for (let i = 0; i < copy.length; i++) { const v = copy[i]; sum += v * v; if (Math.abs(v) > peak) peak = Math.abs(v); }
      const rms = Math.sqrt(sum / copy.length);
      m.parts.push(copy);
      m.peak = Math.max(m.peak, peak);
      m.quiet = rms < 0.015 ? m.quiet + copy.length : 0;
      const dur = m.parts.reduce((n, p) => n + p.length, 0) / m.rate;
      if ((dur >= CHUNK_MIN_S && m.quiet >= PAUSE_S * m.rate) || dur >= CHUNK_MAX_S) flush(m, false);
      const now = performance.now();
      if (now - m.lastLevel > 120) { m.lastLevel = now; setLevel(Math.min(1, rms * 12)); }
    };
    src.connect(proc);
    proc.connect(ctx.destination);
    // Layar tetap menyala selama kuliah (kalau browser mendukung).
    try { m.wake = await navigator.wakeLock?.request('screen'); } catch {}
    mic.current = m;
    setRecording(true);
  };

  // Mengembalikan total detik yang sudah direkam (untuk sambungan berikutnya).
  const stop = () => {
    const m = mic.current;
    if (!m) return 0;
    flush(m, true);
    const total = m.offset / m.rate;
    release();
    setRecording(false);
    setLevel(0);
    return total;
  };

  return { supported, recording, level, start, stop };
};

// 90 → "1 jam 30 menit", 45 → "45 menit".
const durationLabel = (min) => {
  const h = Math.floor(min / 60), m = min % 60;
  return [h ? `${h} jam` : '', m || !h ? `${m} menit` : ''].filter(Boolean).join(' ');
};

const LevelBars =({ level, active }) => (
  <span className="inline-flex items-end gap-[3px] h-4" aria-hidden="true">
    {[0.35, 0.7, 1, 0.6, 0.3].map((k, i) => (
      <span key={i} className="w-[3px] rounded-full transition-all duration-100"
        style={{ height: `${Math.max(18, (active ? level * k : 0) * 100)}%`, background: active ? '#3ecf8e' : 'rgba(255,255,255,0.25)' }}/>
    ))}
  </span>
);

// Istilah yang dicatat AI sepanjang sesi, tanpa duplikat (urutan kemunculan).
const sessionTerms = (segments) => {
  const seen = new Set(), out = [];
  for (const s of segments) for (const t of s.istilah || []) {
    const key = (t.ar || '').replace(/[ً-ْٰ]/g, '').replace(/^ال/, '');
    if (t.ar && !seen.has(key)) { seen.add(key); out.push(t); }
  }
  return out;
};

// Jenjang pelajar dari Profil Belajar (tanpa data lain), supaya istilah & kedalaman terjemah pas.
const learnerLevel = () => {
  const p = window.learnerPayload?.();
  return p ? { level: p.level || '', faculty: p.faculty || '', major: p.major || '' } : null;
};

/* Maddah kuliah: nama + kitab muqarrar & penulisnya ikut dikirim ke tahap terjemah dan talkhisan, supaya nama kitab
   yang salah dengar bisa dibetulkan (data dari maddah-data.jsx / mahad-data.jsx). */
const MADDAH_KEY = 'talqeeh_live_caption_maddah';
// Mode dengar: Cepat (bawaan) atau Akurat untuk kelas ramai — model audio lebih kuat, teks Arab ±4 dtk.
const MODE_KEY = 'talqeeh_live_caption_mode';
const HEAR_MODES = [
  { id: 'cepat', label: 'Cepat', sub: 'teks Arab ±2 dtk' },
  { id: 'akurat', label: 'Akurat', sub: 'kelas ramai, ±4 dtk' },
];
const maddahById = (id) => (id ? window.getMaddahById?.(id) || window.getMahadMaddahById?.(id) || null : null);
const maddahContext = (id) => {
  const m = maddahById(id);
  if (!m) return null;
  return {
    name: m.name || '', nameArabic: m.nameArabic || '',
    kitab: (m.kitabUtama || []).slice(0, 8).map(k => ({ arabic: k.arabic || '', nama: k.nama || '', penulis: k.penulis || '' })),
  };
};

// Transkrip untuk talkhisan kuliah: per kartu waktu + penanda + ucapan duktur (AR) + terjemah langsung (ID).
const TALKHIS_MAX_ROUNDS = 4;
const lectureTranscript = (segments) => segments.filter(s => s.ar).map(s => [
  `[${clock(s.t)}]${s.penting ? ' [DITEKANKAN DUKTUR]' : s.marked ? ' [DITANDAI MAHASISWA]' : ''}`,
  `AR: ${s.ar}`,
  ...(s.idText ? [`ID: ${s.idText}`] : []),
].join('\n')).join('\n');

const penandaOf = (s) => (s.penting ? ' ★ DITEKANKAN DUKTUR' : s.marked ? ' ★ PENTING' : '');

const exportText = (title, segments) => {
  const lines = [title || 'Live Caption Talqeeh', new Date().toLocaleString('id-ID'), ''];
  for (const s of segments) {
    if (!s.ar) continue;
    lines.push(`[${clock(s.t)}]${penandaOf(s)}`, s.ar, ...(s.idText ? [s.idText] : []), '');
  }
  const terms = sessionTerms(segments);
  if (terms.length) lines.push('— Istilah sesi ini —', ...terms.map(t => `${t.ar} : ${t.id}`));
  return lines.join('\n');
};

const LiveCaptionBody = () => {
  const toast = useToast();
  const draft = useRef(readDraft()).current;
  const [title, setTitle] = useState(draft?.title || '');
  const [dialect, setDialect] = useState(readDialect);
  const [segments, setSegments] = useState(() => (draft?.segments || []).filter(s => s.status === 'done'));
  const [elapsed, setElapsed] = useState(draft?.elapsed || 0);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const restored = useRef(!!draft?.segments?.length);
  const [quota, setQuota] = useState(null); // { left, dailyLeft, monthlyLeft } dalam menit
  // Maddah kuliah: daftar mengikuti profil (sama dengan wizard tambah materi); pilihan terakhir diingat.
  const { profile } = useAuth();
  const maddahOptions = React.useMemo(() => {
    if (!profile) return [];
    try {
      if (window.isMahadLevel?.(profile.level)) return window.getMahadMaddahByJenjang?.(profile.level) || [];
      return window.getMaddahsForProfile?.(profile) || [];
    } catch { return []; }
  }, [profile]);
  const [maddahId, setMaddahId] = useState(() => {
    if (draft?.maddahId) return draft.maddahId;
    try { return localStorage.getItem(MADDAH_KEY) || ''; } catch { return ''; }
  });
  const chooseMaddah = (id) => { setMaddahId(id); try { localStorage.setItem(MADDAH_KEY, id); } catch {} };
  const [hearMode, setHearMode] = useState(() => { try { return localStorage.getItem(MODE_KEY) === 'akurat' ? 'akurat' : 'cepat'; } catch { return 'cepat'; } });
  const chooseMode = (m) => { setHearMode(m); try { localStorage.setItem(MODE_KEY, m); } catch {} };
  // Boleh diganti saat merekam: berlaku untuk potongan berikutnya.
  const modeRef = useRef(hearMode);
  modeRef.current = hearMode;
  const maddahRef = useRef(maddahId);
  maddahRef.current = maddahId;

  // Talkhisan kuliah (dibuat setelah rekaman berhenti; ikut tersimpan di draf).
  const [talkhis, setTalkhis] = useState(draft?.talkhis || null); // { md, lang, partial, segCount }
  const [talkhisLang, setTalkhisLang] = useState(draft?.talkhis?.lang || 'id');
  const [writing, setWriting] = useState(false);
  const [liveMd, setLiveMd] = useState('');
  const liveBuf = useRef({ text: '', timer: null });
  const loadQuota = () => aiCall('live-quota').then(d => { if (d.ok) setQuota(d); });

  const queue = useRef([]);           // potongan yang menunggu dikirim
  const busy = useRef(false);
  const credit = useRef(null);        // token kredit menit dari server
  const audioById = useRef(new Map()); // simpan audio potongan yang gagal untuk dicoba ulang
  const baseElapsed = useRef(draft?.elapsed || 0);
  const startedAt = useRef(0);
  const listEnd = useRef(null);
  const stick = useRef(true);
  const segRef = useRef(segments);
  segRef.current = segments;
  const titleRef = useRef(title);
  titleRef.current = title;
  const dialectRef = useRef(dialect);
  dialectRef.current = dialect;

  const patch = (id, p) => setSegments(list => list.map(s => (s.id === id ? { ...s, ...p } : s)));

  const mic = useLiveMic({
    onChunk: (samples, rate, startSec) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setSegments(list => [...list, { id, t: startSec, ar: '', idText: '', lang: dialectRef.current, status: 'pending', marked: false }]);
      queue.current.push({ id, samples, rate });
      pump();
    },
    onError: setError,
  });

  // Dipanggil dari antrean (closure bisa basi), jadi tidak bergantung pada mic.recording.
  const stopAll = (msg) => {
    const total = mic.stop();
    if (total) baseElapsed.current = total;
    if (msg) setError(msg);
  };

  /* Dua tahap supaya teks Arab muncul secepat mungkin:
     1. send (dengar) — audio → teks Arab; kartu langsung menampilkannya (status "translating"). Antrean audio tidak
        menunggu terjemah, jadi potongan berikutnya segera didengar.
     2. translateBatch — 2 potongan diterjemahkan sekaligus lalu digabung jadi satu kartu (kalimat lebih utuh &
        separuh biaya terjemah). Kalau potongan kedua belum datang dalam TRANSLATE_WAIT_MS, atau rekaman berhenti,
        yang ada diterjemahkan sendiri. Batch berjalan berurutan (translateChain) supaya tiap batch mendapat konteks
        (2 kalimat terakhir & istilah sesi) dari batch sebelumnya. */
  const translateChain = useRef(Promise.resolve());
  const waiting = useRef([]);      // id kartu yang sudah didengar, menunggu diterjemahkan
  const waitTimer = useRef(null);

  const translateBatch = async (ids, retried = false) => {
    // segRef baru terisi setelah React merender kartu "translating"; tunggu sebentar bila belum.
    const ready = () => ids.every(id => segRef.current.find(s => s.id === id)?.status === 'translating');
    for (let i = 0; i < 40 && !ready(); i++) await new Promise(r => setTimeout(r, 25));
    const list = segRef.current;
    const segs = ids.map(id => list.find(s => s.id === id)).filter(s => s?.status === 'translating');
    if (!segs.length) return;
    const at = list.indexOf(segs[0]);
    const before = list.slice(0, at).filter(s => s.ar && (s.status === 'done' || s.status === 'translating'));
    const prev = before.slice(-2);
    const d = await aiCall('live-translate', {
      parts: segs.map(s => ({ ar: s.ar, heard: s.heard })),
      dialect: segs[0].lang || dialectRef.current, title: titleRef.current,
      prev_tail: prev.map(s => s.ar).join(' ').slice(-400),
      prev_id: prev.map(s => s.idText).filter(Boolean).join(' ').slice(-300),
      terms: sessionTerms(before).map(t => t.ar),
      learner: learnerLevel(),
      maddah: maddahContext(maddahRef.current),
    });
    if (!d.ok && !retried && !d.upgrade) { await new Promise(r => setTimeout(r, 1200)); return translateBatch(ids, true); }
    const keep = new Set(segs.map(s => s.id));
    if (!d.ok) {
      // Gagal menerjemahkan tidak membuang kalimat: teks Arab tetap tersimpan per kartu (partial).
      setSegments(l => l.map(s => (keep.has(s.id) ? { ...s, status: 'done', idText: '', istilah: [], partial: true, heard: undefined } : s)));
      return;
    }
    // Gabung jadi satu kartu di posisi potongan pertama. Duktur menekankan bagian ini ("ini penting", "keluar di
    // imtihan") → ditandai otomatis + getar singkat di HP. Tanda yang dibuat pengguna sendiri tetap dipertahankan.
    const first = segs[0].id;
    const marked = segs.some(s => s.marked) || !!d.penting;
    setSegments(l => l
      .filter(s => s.id === first || !keep.has(s.id))
      .map(s => (s.id === first
        ? { ...s, status: 'done', ar: d.ar || segs.map(x => x.ar).join(' '), idText: d.id, istilah: d.istilah || [], penting: !!d.penting, partial: !!d.partial, marked, heard: undefined }
        : s)));
    if (d.penting) try { navigator.vibrate?.(120); } catch {}
  };

  const flushTranslate = () => {
    clearTimeout(waitTimer.current);
    waitTimer.current = null;
    while (waiting.current.length) {
      const ids = waiting.current.splice(0, TRANSLATE_BATCH);
      translateChain.current = translateChain.current.then(() => translateBatch(ids)).catch(() => {});
    }
  };
  const scheduleTranslate = (id) => {
    waiting.current.push(id);
    // Potongan terakhir sering baru selesai didengar sesudah rekaman berhenti: jangan tunggu pasangannya.
    if (waiting.current.length >= TRANSLATE_BATCH || !recordingRef.current) flushTranslate();
    else if (!waitTimer.current) waitTimer.current = setTimeout(flushTranslate, TRANSLATE_WAIT_MS);
  };
  // Rekaman berhenti: jangan menunggu potongan kedua yang tidak akan datang.
  const recordingRef = useRef(false);
  recordingRef.current = mic.recording;
  useEffect(() => { if (!mic.recording) flushTranslate(); }, [mic.recording]);
  useEffect(() => () => clearTimeout(waitTimer.current), []);

  const send = async (id, base64, retried = false) => {
    const d = await aiCall('live-hear', { audio_base64: base64, dialect: dialectRef.current, mode: modeRef.current, credit: credit.current });
    if (d.ok) {
      credit.current = d.credit || null;
      audioById.current.delete(id);
      if (!d.ar) { setSegments(l => l.filter(s => s.id !== id)); return true; } // hening: buang kartunya
      setSegments(l => l.map(s => (s.id === id ? { ...s, status: 'translating', ar: d.ar, heard: d.heard } : s)));
      scheduleTranslate(id);
      return true;
    }
    if (d.upgrade) { stopAll(); openAiUpgrade('live'); }
    else if (/batas|jatah|quota|ditutup/i.test(d.error || '')) stopAll(d.error);
    // Gangguan sesaat (koneksi kelas, server sibuk): coba ulang sekali otomatis sebelum menampilkan error.
    else if (!retried) { await new Promise(r => setTimeout(r, 1500)); return send(id, base64, true); }
    patch(id, { status: 'error', err: d.error || 'Kalimat ini gagal diproses.' });
    return false;
  };

  const pump = async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      while (queue.current.length) {
        const { id, samples, rate } = queue.current.shift();
        let base64;
        try { base64 = await window.pcmToWavBase64(samples, rate); } catch { patch(id, { status: 'error', err: 'Gagal menyiapkan audio.' }); continue; }
        audioById.current.set(id, base64);
        await send(id, base64);
      }
    } finally {
      busy.current = false;
    }
  };

  const retry = async (id) => {
    const base64 = audioById.current.get(id);
    if (!base64) { setSegments(list => list.filter(s => s.id !== id)); return; }
    patch(id, { status: 'pending', err: '' });
    await send(id, base64);
  };

  // Sisa jatah: dimuat saat halaman dibuka dan diperbarui setiap berhenti merekam.
  useEffect(() => { if (!mic.recording) loadQuota(); }, [mic.recording]);

  // Timer
  useEffect(() => {
    if (!mic.recording) return;
    startedAt.current = Date.now();
    const base = elapsed;
    const t = setInterval(() => setElapsed(base + (Date.now() - startedAt.current) / 1000), 500);
    return () => clearInterval(t);
  }, [mic.recording]);

  // Simpan draf di perangkat supaya catatan (dan talkhisannya) tidak hilang kalau halaman tertutup.
  useEffect(() => {
    const done = segments.filter(s => s.status === 'done');
    writeDraft(done.length || title ? { title, maddahId, segments: done, elapsed, talkhis, savedAt: Date.now() } : null);
  }, [segments, title, maddahId, talkhis, Math.floor(elapsed / 10)]);

  // Ikuti teks terbaru, kecuali pengguna sedang menggulir ke atas.
  useEffect(() => {
    const onScroll = () => { stick.current = window.innerHeight + window.scrollY >= document.body.scrollHeight - 160; };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { if (stick.current) listEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [segments.length]);

  // Peringatan sebelum menutup halaman saat masih merekam / memproses.
  useEffect(() => {
    if (!mic.recording && !segments.some(s => s.status === 'pending' || s.status === 'translating')) return;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [mic.recording, segments]);

  const chooseDialect = (d) => { setDialect(d); try { localStorage.setItem(DIALECT_KEY, d); } catch {} };
  const toggleRecord = () => {
    setError('');
    if (mic.recording) baseElapsed.current = mic.stop();
    else { restored.current = false; mic.start(baseElapsed.current); }
  };
  // Menghapus tanda juga menghapus label "Ditekankan duktur" (pengguna yang memutuskan).
  const toggleMark = (id) => {
    const s = segments.find(x => x.id === id);
    patch(id, s?.marked ? { marked: false, penting: false } : { marked: true });
  };
  const markLatest = () => {
    const last = segments[segments.length - 1];
    if (!last) { toast.push('Belum ada kalimat untuk ditandai.'); return; }
    if (!last.marked) { patch(last.id, { marked: true }); toast.push('Ditandai penting.'); }
    else patch(last.id, { marked: false });
  };

  const done = segments.filter(s => s.status === 'done' && s.ar);
  const pending = segments.filter(s => s.status === 'pending' || s.status === 'translating').length;
  const marked = segments.filter(s => s.marked).length;

  /* ── Talkhisan kuliah: transkrip (+ penanda penekanan duktur & tanda mahasiswa) → catatan rapi gaya Ringkasan.
     Kuliah panjang bisa terpotong batas waktu server: dilanjutkan otomatis (maks TALKHIS_MAX_ROUNDS) dari ujungnya. */
  const pushLive = (text) => {
    // Diperbarui maks ±10x/detik supaya HP tidak berat saat AI menulis panjang.
    liveBuf.current.text = text;
    if (!liveBuf.current.timer) liveBuf.current.timer = setTimeout(() => { liveBuf.current.timer = null; setLiveMd(liveBuf.current.text); }, 100);
  };
  const makeTalkhis = async (lang) => {
    const transcript = lectureTranscript(done);
    if (transcript.length < 80) { toast.push('Transkrip masih terlalu pendek untuk dibuat talkhisan.'); return; }
    setTalkhisLang(lang); setWriting(true); setLiveMd('');
    let acc = '', truncated = false, failed = '';
    for (let round = 0; round < TALKHIS_MAX_ROUNDS; round++) {
      const d = await aiStream('live-talkhis', {
        title: title.trim(), lang, transcript, learner: learnerLevel(), maddah: maddahContext(maddahId), ...(acc ? { continue_from: acc } : {}),
      }, (_, full) => pushLive(acc + full));
      if (!d.ok) {
        if (d.upgrade) openAiUpgrade('live');
        failed = d.error || 'Gagal membuat talkhisan.';
        if (d.partial) acc += d.partial;
        break;
      }
      // Lanjutan dimulai tepat dari karakter terakhir (bisa di tengah kata): sambung apa adanya.
      acc += d.data || '';
      truncated = !!d.truncated;
      if (!truncated) break;
    }
    clearTimeout(liveBuf.current.timer); liveBuf.current.timer = null;
    setWriting(false);
    if (acc.trim()) setTalkhis({ md: acc.trim(), lang, partial: truncated || !!failed, segCount: done.length });
    if (failed) toast.push(failed);
  };
  const copyTalkhis = async () => {
    try { await navigator.clipboard.writeText(talkhis.md); toast.push('Talkhisan disalin.'); } catch { toast.push('Gagal menyalin.'); }
  };
  const talkhisToKurasah = () => {
    try { window.saveToKurasah(`Talkhisan — ${title.trim() || 'Kuliah'}`, talkhis.md, ['talkhisan', 'live-caption']); toast.push('Tersimpan di Kurasah.'); }
    catch { toast.push('Gagal menyimpan ke Kurasah.'); }
  };
  const downloadTalkhis = () => {
    const blob = new Blob([`# Talkhisan — ${title.trim() || 'Kuliah'}\n\n${talkhis.md}\n`], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `talkhisan-${(title || 'kuliah').replace(/[\\/:*?"<>|]+/g, '').slice(0, 60) || 'kuliah'}.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  // Talkhisan dibuat sebelum ada rekaman tambahan → tawarkan buat ulang.
  const talkhisStale = !!talkhis && done.length > (talkhis.segCount || 0);

  const copyAll = async () => {
    try { await navigator.clipboard.writeText(exportText(title, done)); toast.push('Transkrip disalin.'); }
    catch { toast.push('Gagal menyalin. Coba unduh .txt.'); }
  };
  const download = () => {
    const blob = new Blob([exportText(title, done)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(title || 'live-caption').replace(/[\\/:*?"<>|]+/g, '').slice(0, 60) || 'live-caption'}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const saveAsMaterial = async () => {
    const terms = sessionTerms(done);
    const content = done.map(s => `${s.penting ? '【DITEKANKAN DUKTUR】 ' : s.marked ? '【PENTING】 ' : ''}${s.ar}${s.idText ? `\n— ${s.idText}` : ''}`).join('\n\n')
      + (terms.length ? `\n\nISTILAH SESI INI:\n${terms.map(t => `${t.ar} : ${t.id}`).join('\n')}` : '');
    if (content.length < 50) { toast.push('Transkrip masih terlalu pendek untuk dijadikan materi.'); return; }
    setSaving(true);
    const d = await aiCall('create', {
      title: title.trim() || `Kuliah ${maddahById(maddahId)?.name ? `${maddahById(maddahId).name} — ` : ''}${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}`,
      maddah_id: maddahId || null,
      source_type: 'audio', content,
      // Talkhisan kuliah (kalau sudah dibuat) jadi isi tab Ringkasan materi ini.
      ...(talkhis?.md ? { summary: talkhis.md, summary_lang: talkhis.lang } : {}),
    });
    setSaving(false);
    if (!d.ok) { if (d.upgrade) openAiUpgrade('materi'); else toast.push(d.error || 'Gagal menyimpan materi.'); return; }
    writeDraft(null);
    try { sessionStorage.setItem('talqeeh_new_set', String(d.id)); } catch {}
    navigate(`/ai-partner/${d.id}`);
  };
  const reset = () => {
    if (mic.recording) mic.stop();
    queue.current = []; audioById.current.clear(); credit.current = null; baseElapsed.current = 0;
    waiting.current = []; clearTimeout(waitTimer.current); waitTimer.current = null;
    setSegments([]); setElapsed(0); setTitle(''); setError(''); setConfirmReset(false);
    setTalkhis(null); setLiveMd('');
    writeDraft(null);
  };

  const idle = !mic.recording && !segments.length;

  return (
    <div className="container-x max-w-3xl pb-28 md:pb-12">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-emerald-300 mb-1.5">
            <Icon name="mic" className="w-3.5 h-3.5"/> Live Caption
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-ink leading-tight">Dengar duktur, langsung paham</h1>
        </div>
        {!!segments.length && !mic.recording && (
          <button onClick={() => setConfirmReset(true)} className="text-xs text-ink-soft hover:text-rose-300 px-2.5 py-1.5 rounded-lg hover:bg-white/5 flex-shrink-0">Sesi baru</button>
        )}
      </div>

      {confirmReset && (
        <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-3.5 mb-4 flex items-center justify-between gap-3">
          <span className="text-sm text-ink-muted">Hapus transkrip ini dan mulai sesi baru?</span>
          <span className="flex gap-1.5 flex-shrink-0">
            <button onClick={() => setConfirmReset(false)} className="text-xs px-3 py-1.5 rounded-lg text-ink-soft hover:text-ink">Batal</button>
            <button onClick={reset} className="text-xs px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-300 hover:bg-rose-500/25">Hapus</button>
          </span>
        </div>
      )}

      <input value={title} onChange={e => setTitle(e.target.value)} maxLength={120} placeholder="Judul kuliah (opsional), mis. Ushul Fiqh — Bab Qiyas"
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-ink placeholder-ink-soft outline-none focus:border-emerald-500/40 mb-3" style={{ fontSize: 16 }}/>

      {/* Maddah: nama kitab muqarrar & penulisnya membantu AI membetulkan nama yang salah dengar. */}
      {maddahOptions.length > 0 && (
        <div className="mb-3">
          <select value={maddahId} onChange={e => chooseMaddah(e.target.value)} disabled={mic.recording}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-ink outline-none focus:border-emerald-500/40 disabled:opacity-60" style={{ fontSize: 16 }}>
            <option value="">Pilih maddah (supaya nama kitab & istilah lebih tepat)</option>
            {maddahOptions.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          {maddahById(maddahId)?.kitabUtama?.length > 0 && (
            <p className="text-[11px] text-ink-soft mt-1.5">
              Kitab yang dikenali: {maddahById(maddahId).kitabUtama.slice(0, 4).map(k => k.nama).join(', ')}
            </p>
          )}
        </div>
      )}

      <div className="text-[11px] text-ink-soft mb-1.5">Duktur berbicara dalam</div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {DIALECTS.map(d => (
          <button key={d.id} onClick={() => chooseDialect(d.id)} disabled={mic.recording}
            className={`text-left px-3.5 py-2.5 rounded-xl border transition disabled:opacity-60 ${dialect === d.id ? 'bg-emerald-500/15 border-emerald-500/40' : 'border-white/10 hover:bg-white/[0.04]'}`}>
            <div className={`text-sm font-medium ${dialect === d.id ? 'text-emerald-200' : 'text-ink'}`}>{d.label}</div>
            <div className="text-[11px] text-ink-soft mt-0.5">{d.sub}</div>
          </button>
        ))}
      </div>

      {/* Mode dengar — boleh diganti saat merekam (berlaku untuk potongan berikutnya). */}
      <div className="text-[11px] text-ink-soft mb-1.5">Mode dengar</div>
      <div className="grid grid-cols-2 gap-2 mb-5">
        {HEAR_MODES.map(m => (
          <button key={m.id} onClick={() => chooseMode(m.id)}
            className={`text-left px-3.5 py-2.5 rounded-xl border transition ${hearMode === m.id ? 'bg-emerald-500/15 border-emerald-500/40' : 'border-white/10 hover:bg-white/[0.04]'}`}>
            <div className={`text-sm font-medium ${hearMode === m.id ? 'text-emerald-200' : 'text-ink'}`}>{m.label}</div>
            <div className="text-[11px] text-ink-soft mt-0.5">{m.sub}</div>
          </button>
        ))}
      </div>

      {!mic.supported && (
        <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-4 text-sm text-rose-200 mb-4">
          Browser ini tidak bisa merekam suara. Coba buka Talqeeh di Chrome atau Safari terbaru.
        </div>
      )}
      {error && <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-3.5 text-sm text-rose-200 mb-4">{error}</div>}
      {restored.current && !!segments.length && !mic.recording && (
        <div className="text-xs text-ink-soft mb-3">Sesi sebelumnya dipulihkan dari perangkat ini. Tekan rekam untuk melanjutkan.</div>
      )}

      {idle ? (
        <div className="card-glass p-6 md:p-8 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-emerald-500/12 border border-emerald-500/25">
            <Icon name="mic" className="w-6 h-6 text-emerald-300"/>
          </div>
          <p className="text-sm text-ink-muted max-w-md mx-auto leading-relaxed">
            Taruh HP di dekat duktur, lalu tekan tombol rekam. Ucapan duktur muncul dalam huruf Arab beberapa detik setelah diucapkan, lalu terjemahan Indonesianya menyusul. Fushah dan 'ammiyah Mesir dikenali otomatis.
          </p>
          <ul className="text-xs text-ink-soft mt-4 space-y-1">
            <li>Saat duktur bilang "ini penting" atau "keluar di imtihan", bagian itu ditandai otomatis. Kamu juga bisa menandai sendiri dengan <span className="text-gold-300">Tandai</span>.</li>
            <li>Istilah penting dicatat di bawah tiap kalimat, lalu dirangkum di akhir sesi.</li>
            <li>Setelah selesai, simpan jadi materi AI Partner untuk diringkas, dibuat kuis, dan lainnya.</li>
            <li>Jatah Live Caption terpisah dari transkrip rekaman: 1 menit kuliah = 1 menit jatah.</li>
          </ul>
          {quota && (
            <div className="mt-4 inline-flex items-center gap-2 text-xs rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-ink-muted">
              Sisa jatah: <span className="text-emerald-200 font-medium">{durationLabel(quota.left)}</span>
              {quota.monthlyLeft != null && quota.monthlyLeft < quota.dailyLeft ? ' periode ini' : ' hari ini'}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {segments.map(s => (
            <div key={s.id} className={`relative rounded-2xl border p-4 pr-12 transition ${s.marked ? 'border-gold-500/40 bg-gold-500/[0.06]' : 'border-white/8 bg-white/[0.03]'}`}>
              <div className="text-[11px] text-ink-soft mb-1.5 tabular-nums">
                {clock(s.t)}{s.marked && <span className="text-gold-300 ml-2">{s.penting ? '★ Ditekankan duktur' : '★ Penting'}</span>}
              </div>
              {s.status === 'pending' && <div className="text-sm text-ink-soft animate-pulse">Mendengarkan…</div>}
              {/* Teks Arab sudah ada, terjemahnya menyusul. */}
              {s.status === 'translating' && <>
                {s.lang === 'indonesia'
                  ? <p dir="auto" className="text-ink text-[15px] leading-relaxed">{s.ar}</p>
                  : <p dir="rtl" className="text-ink leading-loose text-right" style={{ ...ARABIC_FONT, fontSize: 20 }}>{s.ar}</p>}
                <p className="text-sm text-ink-soft animate-pulse mt-2">Menerjemahkan…</p>
              </>}
              {s.status === 'error' && (
                <div className="text-sm text-rose-300">
                  {s.err}
                  <button onClick={() => retry(s.id)} className="ml-2 text-xs underline underline-offset-2 text-rose-200">Coba lagi</button>
                </div>
              )}
              {/* Mode Indonesia: transkripnya huruf Latin; "terjemah" hanya untuk kutipan Arab di dalamnya (bisa kosong). */}
              {s.status === 'done' && <>
                {s.lang === 'indonesia'
                  ? <p dir="auto" className="text-ink text-[15px] leading-relaxed">{s.ar}</p>
                  : <p dir="rtl" className="text-ink leading-loose text-right" style={{ ...ARABIC_FONT, fontSize: 20 }}>{s.ar}</p>}
                {s.idText && <p className="text-[15px] leading-relaxed mt-2 text-emerald-200/90">{s.idText}</p>}
                {s.partial && !s.idText && s.lang !== 'indonesia' && <p className="text-xs text-ink-soft mt-2">Terjemah kalimat ini belum tersedia — transkripnya tetap tersimpan.</p>}
                {!!s.istilah?.length && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {s.istilah.map(t => (
                      <span key={t.ar} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[12px] text-ink-muted">
                        <span dir="rtl" className="text-ink" style={{ ...ARABIC_FONT, fontSize: 15 }}>{t.ar}</span>{t.id}
                      </span>
                    ))}
                  </div>
                )}
              </>}
              <button onClick={() => toggleMark(s.id)} aria-label={s.marked ? 'Hapus tanda' : 'Tandai penting'}
                className={`absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 ${s.marked ? 'text-gold-300' : 'text-ink-soft'}`}>
                <Icon name="bookmark" className="w-4 h-4" style={s.marked ? { fill: 'currentColor' } : undefined}/>
              </button>
            </div>
          ))}
          <div ref={listEnd}/>
        </div>
      )}

      {/* Rangkuman istilah sesi: bahan mufradat untuk muraja'ah setelah kuliah. */}
      {!mic.recording && sessionTerms(done).length > 0 && (
        <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <div className="text-xs uppercase tracking-wider text-gold-300 mb-2.5">Istilah sesi ini · {sessionTerms(done).length}</div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
            {sessionTerms(done).map(t => (
              <React.Fragment key={t.ar}>
                <dt dir="rtl" className="text-ink text-right" style={{ ...ARABIC_FONT, fontSize: 17 }}>{t.ar}</dt>
                <dd className="text-sm text-ink-muted self-center">{t.id}</dd>
              </React.Fragment>
            ))}
          </dl>
        </div>
      )}

      {/* Talkhisan kuliah: muncul setelah rekaman berhenti. Tampilannya sama dengan tab Ringkasan (SummaryView). */}
      {!mic.recording && done.length > 0 && window.SummaryView && (
        <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] p-4 md:p-5">
          <div className="flex items-start gap-3 mb-3">
            <span className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-emerald-500/12 border border-emerald-500/25">
              <Icon name="bookOpen" className="w-5 h-5 text-emerald-300"/>
            </span>
            <div className="min-w-0">
              <div className="font-display text-base md:text-lg font-semibold text-ink">Talkhisan kuliah</div>
              <p className="text-[13px] text-ink-muted leading-relaxed">
                Transkrip tadi disusun jadi catatan rapi: inti kuliah, yang ditekankan duktur, ta'rif, pembagian, khilaf, dalil, istilah, dan soal muraja'ah — hanya dari ucapan duktur.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <window.LangPicker value={talkhisLang} onChange={setTalkhisLang} disabled={writing}/>
            <button onClick={() => makeTalkhis(talkhisLang)} disabled={writing || pending > 0}
              className="btn btn-primary text-sm px-4 py-2.5 disabled:opacity-60">
              <Icon name="sparkles" className="w-4 h-4"/>
              {writing ? 'Menyusun…' : talkhis ? 'Buat ulang' : 'Buat talkhisan'}
            </button>
          </div>
          {pending > 0 && !writing && <p className="text-xs text-ink-soft mt-2">Tunggu kalimat terakhir selesai diterjemahkan dulu.</p>}
          {talkhisStale && !writing && <p className="text-xs text-gold-200 mt-2">Ada rekaman baru setelah talkhisan ini dibuat — tekan "Buat ulang" supaya ikut masuk.</p>}

          {writing && (
            <div className="mt-4">
              <window.LiveWritingNote text="AI sedang menyusun talkhisan kuliahmu…"/>
              {liveMd && <window.SummaryView markdown={liveMd} rtl={talkhisLang === 'ar'}/>}
            </div>
          )}
          {!writing && talkhis && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2 mb-3">
                <button onClick={copyTalkhis} className="h-9 px-3 rounded-xl border border-white/10 text-xs text-ink-muted hover:text-ink hover:bg-white/5 inline-flex items-center gap-1.5">
                  <Icon name="copy" className="w-3.5 h-3.5"/> Salin
                </button>
                <button onClick={talkhisToKurasah} className="h-9 px-3 rounded-xl border border-white/10 text-xs text-ink-muted hover:text-ink hover:bg-white/5 inline-flex items-center gap-1.5">
                  <Icon name="bookmark" className="w-3.5 h-3.5"/> Simpan ke Kurasah
                </button>
                <button onClick={downloadTalkhis} className="h-9 px-3 rounded-xl border border-white/10 text-xs text-ink-muted hover:text-ink hover:bg-white/5 inline-flex items-center gap-1.5">
                  <Icon name="download" className="w-3.5 h-3.5"/> Unduh
                </button>
              </div>
              {talkhis.partial && <p className="text-xs text-gold-200 mb-3">Talkhisan ini belum lengkap (kuliah sangat panjang atau koneksi terputus). Tekan "Buat ulang" untuk mencoba lagi.</p>}
              <window.SummaryView markdown={talkhis.md} rtl={talkhis.lang === 'ar'}/>
              <p className="text-[11px] text-ink-soft mt-3">Disusun AI dari transkrip kuliah — cocokkan istilah & dalil penting dengan muqarrar sebelum dihafal. "Simpan jadi materi" menyimpan talkhisan ini sebagai Ringkasan.</p>
            </div>
          )}
        </div>
      )}

      {!mic.recording && done.length > 0 && (
        // HP: "Simpan jadi materi" selebar layar, Salin & Unduh berdampingan di bawahnya; layar lebar: satu baris.
        <div className="mt-6 grid grid-cols-2 sm:flex gap-2">
          <button onClick={saveAsMaterial} disabled={saving || pending > 0} className="btn btn-gold col-span-2 justify-center text-sm px-4 py-3 disabled:opacity-60">
            <Icon name="upload" className="w-4 h-4"/> {saving ? 'Menyimpan…' : 'Simpan jadi materi'}
          </button>
          <button onClick={copyAll} className="h-11 px-3.5 rounded-xl border border-white/10 text-sm text-ink-muted hover:text-ink hover:bg-white/5 inline-flex items-center justify-center gap-1.5">
            <Icon name="copy" className="w-4 h-4"/> Salin
          </button>
          <button onClick={download} className="h-11 px-3.5 rounded-xl border border-white/10 text-sm text-ink-muted hover:text-ink hover:bg-white/5 inline-flex items-center justify-center gap-1.5">
            <Icon name="download" className="w-4 h-4"/> Unduh .txt
          </button>
        </div>
      )}

      {/* Kontrol bawah: timer, tandai, rekam/stop. Sticky (bukan fixed) supaya ikut kolom konten di samping sidebar
          desktop, dan di HP berada di atas bottom nav (60px). */}
      <div className="sticky z-30 mt-6 bottom-[calc(72px+env(safe-area-inset-bottom))] md:bottom-4">
        <div>
          <div className="rounded-2xl border border-white/10 shadow-2xl shadow-black/40 px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(16,18,17,0.96)' }}>
            <LevelBars level={mic.level} active={mic.recording}/>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-ink tabular-nums">{clock(elapsed)}</div>
              <div className="text-[11px] text-ink-soft truncate">
                {mic.recording ? (pending ? `Merekam · ${pending} diproses` : 'Merekam') : pending ? `${pending} diproses` : `${done.length} kalimat`}
                {marked > 0 && ` · ★ ${marked}`}
              </div>
            </div>
            <button onClick={markLatest} disabled={!segments.length}
              className="ml-auto h-10 px-3.5 rounded-xl border border-gold-500/30 bg-gold-500/10 text-gold-200 text-sm inline-flex items-center gap-1.5 disabled:opacity-40">
              <Icon name="bookmark" className="w-4 h-4"/> Tandai
            </button>
            <button onClick={toggleRecord} disabled={!mic.supported} aria-label={mic.recording ? 'Berhenti merekam' : 'Mulai merekam'}
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition disabled:opacity-40"
              style={{ background: mic.recording ? '#f0715a' : '#3ecf8e', boxShadow: mic.recording ? '0 0 0 6px rgba(240,113,90,0.18)' : '0 0 0 6px rgba(62,207,142,0.15)' }}>
              {mic.recording
                ? <span className="w-5 h-5 rounded-[5px] bg-white"/>
                : <Icon name="mic" className="w-6 h-6" style={{ stroke: '#0b0b0b' }}/>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LiveCaptionPage = () => {
  const status = useAiStatus();
  useEffect(() => { window.logFunnel?.('view_live_caption'); }, []);
  return (
    <div className="page-enter">
      <div className="container-x pt-4 md:pt-8">
        <button onClick={() => navigate('/ai-partner')} className="text-sm text-ink-soft hover:text-ink inline-flex items-center gap-1.5" style={{ minHeight: 40 }}>
          <Icon name="chevronLeft" className="w-4 h-4"/> AI Partner
        </button>
      </div>
      <div className="pt-4">
        {status.loading
          ? <div className="container-x pb-24"><div className="card-glass p-6 max-w-xl"><Skeleton lines={3}/></div></div>
          : status.tier !== 'pro'
            ? <div className="container-x max-w-3xl pb-24">
                <UpgradeCard title="Live Caption khusus pelanggan AI Partner"
                  message="Rekam kuliah duktur dan baca transkrip Arab beserta terjemahan Indonesianya secara langsung, lalu simpan jadi materi untuk diringkas dan dibuat kuis."/>
              </div>
            : <LiveCaptionBody/>}
      </div>
    </div>
  );
};

Object.assign(window, { LiveCaptionPage });
