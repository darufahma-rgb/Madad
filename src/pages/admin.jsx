import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
import { marked } from 'marked';
/* Talqih, Admin Panel
   /admin, PIN gate, then tabbed control center
*/

const sbToMember = (row) => {
  if (!row) return null;
  return {
    code:        row.code,
    name:        row.name,
    whatsapp:    row.whatsapp    || "",
    duration:    row.duration    || 30,
    status:      row.status      || "active",
    createdAt:   row.created_at  ? row.created_at.slice(0, 10) : "",
    expiresAt:   row.expires_at  || "",
    device:      row.device      || null,
    deviceId:    row.device_id   || null,
    lastLogin:   row.last_login  || null,
    notes:       row.notes       || "",
    member_type: row.member_type || "berbayar",
    tier:        row.tier        || "library",
    email:       row.email       || "",
    googleLinked: !!row.auth_user_id,
    pinExpiresAt: row.activation_pin_expires_at || null,
    _id:         row.id,
  };
};

const memberToSb = (member) => {
  const row = {};
  if (member.code        !== undefined) row.code        = member.code;
  if (member.name        !== undefined) row.name        = member.name;
  if (member.whatsapp    !== undefined) row.whatsapp    = member.whatsapp;
  if (member.duration    !== undefined) row.duration    = member.duration;
  if (member.status      !== undefined) row.status      = member.status;
  if (member.expiresAt   !== undefined) row.expires_at  = member.expiresAt;
  if (member.device      !== undefined) row.device      = member.device;
  if (member.deviceId    !== undefined) row.device_id   = member.deviceId;
  if (member.lastLogin   !== undefined) row.last_login  = member.lastLogin;
  if (member.notes       !== undefined) row.notes       = member.notes;
  if (member.member_type !== undefined) row.member_type = member.member_type;
  if (member.tier        !== undefined) row.tier        = member.tier;
  if (member.email       !== undefined) row.email       = member.email ? member.email.trim().toLowerCase() : null;
  if (member.unlinkGoogle)               row.auth_user_id = null;
  return row;
};

/* ── Admin API Helpers (SEC-1, SEC-2) ── */
const adminToken = () => sessionStorage.getItem('talqee_admin_token') || '';

const adminMembersAPI = async (action, code, row, extra = {}) => {
  const r = await fetch('/api/admin-members', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken() },
    body: JSON.stringify({ action, code, row, ...extra }),
  });
  if (r.status === 401) {
    sessionStorage.removeItem('talqee_admin_token');
    setAdminLoggedIn(false);
    window.location.reload();
    throw new Error('Sesi expired, silakan login ulang');
  }
  const j = await r.json();
  if (!j.ok) {
    const e = j.error;
    throw new Error(typeof e === 'string' ? e : (e && (e.message || e.details)) || JSON.stringify(e) || 'API error');
  }
  return j.data;
};

const adminGetAllMembers  = async ()            => { const rows = await adminMembersAPI('list'); return Array.isArray(rows) ? rows.map(sbToMember) : []; };
const adminAddMember      = async (member)       => { const rows = await adminMembersAPI('add', null, memberToSb(member)); return sbToMember(Array.isArray(rows) ? rows[0] : rows); };
const adminUpdateMember   = async (code, patch)  => { const rows = await adminMembersAPI('update', code, memberToSb(patch)); return sbToMember(Array.isArray(rows) ? rows[0] : rows); };
const adminDeleteMember   = async (code)         => adminMembersAPI('delete', code);
const adminBulkDelete     = async (codes)        => adminMembersAPI('bulk-delete', null, null, { codes });
const adminGeneratePin    = async (code)         => adminMembersAPI('generate-pin', code);
// Hubungkan email Google ke member lama → Library selamanya (akun gratis dengan email sama digabung).
const adminLinkEmails     = async (links)        => adminMembersAPI('link-emails', null, null, { links });

// Kirim via Fonnte; kalau gagal, buka WhatsApp manual dengan pesan yang sama.
const sendAdminWa = async (to, message, toast) => {
  const openManual = () => window.open(`https://wa.me/${String(to || "").replace(/\D/g, "")}?text=${encodeURIComponent(message)}`, "_blank");
  try {
    const r = await fetch('/api/send-wa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken() },
      body: JSON.stringify({ to, message }),
    });
    const j = await r.json();
    if (j.ok) toast.push('✓ WA berhasil dikirim via Fonnte');
    else { toast.push('Fonnte gagal, buka WA manual...'); openManual(); }
  } catch { openManual(); }
};

const formatPinExpiry = (iso) => iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "";

const pinSteps = (pin, expiresAt) =>
  "Cara masuk (cukup sekali):\n" +
  "1️⃣ Buka https://talqeeh.vercel.app → tombol *Masuk* (pojok kanan atas) → *Masuk dengan Google*\n" +
  "2️⃣ Pilih *Punya PIN aktivasi dari admin?*\n" +
  "3️⃣ Masukkan PIN aktivasi kamu:\n\n```" + pin + "```\n\n" +
  "PIN berlaku sampai " + formatPinExpiry(expiresAt) + " dan hanya bisa dipakai sekali. Jangan bagikan PIN ini ke siapa pun.";

const WA_FOOTER = "\n\n📞 Ada kendala? WhatsApp: wa.me/6281311506025\nInstagram: @ai.gypt\n\n— Tim Talqeeh 🌿";

// Pesan untuk member lama yang pindah dari login kode ke login Google.
const legacyPinMessage = (name, pin, expiresAt) =>
  "Assalamu'alaikum, " + name + "! 👋\n\n" +
  "Talqeeh sekarang pakai *login Google* — lebih aman, dan bisa dipakai di HP & laptop sekaligus. " +
  "Kode member lama tidak dipakai lagi untuk login.\n\n" +
  pinSteps(pin, expiresAt) +
  "\n\nKeanggotaan, catatan, dan progress belajarmu tetap aman." + WA_FOOTER;

const PinModal = ({ member, onClose, onGenerated }) => {
  const toast = useToast();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminGeneratePin(member.code)
      .then(r => { setResult(r); onGenerated && onGenerated(r); })
      .catch(err => setError(err.message));
  }, []);

  const message = result ? legacyPinMessage(member.name, result.pin, result.expiresAt) : "";

  return (
    <Modal open onClose={onClose} size="md">
      <div className="p-7">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl font-semibold text-ink">PIN aktivasi</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg text-ink-muted hover:bg-white/5"><Icon name="x" className="w-4 h-4 mx-auto"/></button>
        </div>
        {error ? (
          <div className="text-sm text-rose-400">Gagal membuat PIN: {error}</div>
        ) : !result ? (
          <div className="text-sm text-ink-muted">Membuat PIN…</div>
        ) : (
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider text-gold-400 mb-2">PIN untuk {member.name} · {member.code}</div>
            <div className="card-glass-strong p-6 mb-2">
              <div className="font-mono text-3xl text-gold-300 tracking-widest">{result.pin}</div>
            </div>
            <div className="text-[11px] text-ink-soft mb-5">
              Berlaku sampai {formatPinExpiry(result.expiresAt)} · sekali pakai · PIN lama (kalau ada) otomatis tidak berlaku
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button onClick={() => { navigator.clipboard.writeText(message); toast.push("Pesan tersalin"); }} className="btn btn-ghost text-sm py-2.5">
                <Icon name="copy" className="w-4 h-4"/> Salin pesan
              </button>
              <button onClick={() => sendAdminWa(member.whatsapp, message, toast)} disabled={!member.whatsapp} className="btn btn-gold text-sm py-2.5">
                <Icon name="messageSquare" className="w-4 h-4"/> Kirim WhatsApp
              </button>
            </div>
            {!member.whatsapp && <div className="text-[11px] text-amber-300">Nomor WA member kosong — salin pesan lalu kirim manual.</div>}
          </div>
        )}
      </div>
    </Modal>
  );
};

const AdminPage = () => {
  const [loggedIn, setLoggedIn] = useState(isAdminLoggedIn());
  const [tab, setTab] = useState("dashboard");
  const [sbStatus, setSbStatus] = useState("checking");

  useEffect(() => {
    if (loggedIn) {
      checkSupabase().then(ok => setSbStatus(ok ? "online" : "offline"));
    }
  }, [loggedIn]);

  if (!loggedIn) {
    return <AdminLogin onLogin={() => setLoggedIn(true)}/>;
  }

  return (
    <div className="page-enter min-h-screen">
      <section className="border-b border-line bg-night-900/40 backdrop-blur-xl sticky top-0 z-20">
        <div className="container-x py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="chip chip-gold text-[10px]">ADMIN</span>
            <span className="font-display text-lg font-semibold text-ink">Talqeeh Control Center</span>
            <div className="flex items-center gap-1.5 text-xs ml-1">
              <span className={`w-2 h-2 rounded-full ${sbStatus === "online" ? "bg-gold-400" : sbStatus === "offline" ? "bg-rose-600" : "bg-ink-soft animate-pulse"}`}/>
              <span className="text-ink-soft hidden sm:inline">
                {sbStatus === "online" ? "Supabase terhubung" : sbStatus === "offline" ? "Supabase offline" : "Mengecek..."}
              </span>
            </div>
          </div>
          <div className="flex gap-1 flex-wrap overflow-x-auto">
            {[
              { id: "dashboard",  label: "Overview",          icon: "grid" },
              { id: "analytics",  label: "Analitik",          icon: "target" },
              { id: "members",    label: "Members",           icon: "users" },
              { id: "maddah",     label: "Maddah Analytics",  icon: "layers" },
              { id: "muqaranah",  label: "Muqaranah",         icon: "scale" },
              { id: "onboarding", label: "Onboarding Data",   icon: "list" },
              { id: "guides",     label: "Guide Manager",     icon: "sparkles" },
              { id: "bank-soal",  label: "Bank Soal",         icon: "fileText" },
              { id: "ai-subs",    label: "Langganan & Bayar", icon: "sparkles" },
              { id: "ai-eval",    label: "Evaluasi AI",       icon: "target" },
              { id: "prompt-quality", label: "Mutu Prompt",   icon: "check" },
              { id: "settings",   label: "Settings",          icon: "shield" },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition flex-shrink-0 ${tab === t.id ? "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30" : "text-ink-muted hover:text-ink hover:bg-white/5"}`}>
                <Icon name={t.icon} className="w-4 h-4"/>
                <span className="hidden md:inline">{t.label}</span>
              </button>
            ))}
            <button onClick={() => { setAdminLoggedIn(false); setLoggedIn(false); }} className="px-3 py-2 rounded-lg text-sm text-ink-muted hover:text-rose-600 ml-2 flex-shrink-0">
              Logout
            </button>
          </div>
        </div>
      </section>

      <div className="container-x pt-16 pb-10">
        {tab === "dashboard"  && <AdminDashboard/>}
        {tab === "analytics"  && <AdminAnalytics/>}
        {tab === "members"    && <AdminMembers/>}
        {tab === "maddah"     && <AdminMaddahAnalytics/>}
        {tab === "muqaranah"  && <AdminMuqaranahPanel/>}
        {tab === "onboarding" && <AdminOnboarding/>}
        {tab === "guides"     && <AdminGuides/>}
        {tab === "bank-soal"  && <AdminBankSoal/>}
        {tab === "ai-subs"    && <AdminSubscriptions/>}
        {tab === "ai-eval"    && <AdminEval/>}
        {tab === "prompt-quality" && <AdminPromptQuality/>}
        {tab === "settings"   && <AdminSettings/>}
      </div>
    </div>
  );
};

/* ============== ADMIN LOGIN ============== */
const AdminLogin = ({ onLogin }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 200); }, []);

  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!pin.trim() || loading) return;
    setLoading(true);
    try {
      const r = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const j = await r.json();
      if (j.ok) {
        sessionStorage.setItem('talqee_admin_token', j.token);
        setAdminLoggedIn(true);
        onLogin();
      } else {
        setError(true);
        setTimeout(() => setError(false), 1500);
      }
    } catch {
      setError(true);
      setTimeout(() => setError(false), 1500);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="page-enter min-h-screen flex items-center justify-center px-4">
      <div className="card-glass-strong p-10 max-w-md w-full relative overflow-hidden">
        <GlowBlob color="rgba(62,207,142,0.35)" size={300} top={-100} right={-100}/>
        <div className="relative">
          <span className="chip chip-gold text-[10px] mb-3 inline-flex">ADMIN ACCESS</span>
          <h2 className="font-display text-3xl font-semibold text-ink mb-1">Talqeeh Control Center</h2>
          <p className="text-sm text-ink-muted mb-6">Masukkan PIN admin untuk lanjut.</p>
          <form onSubmit={submit}>
            <input
              ref={inputRef}
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN"
              className={`code-input w-full bg-white/5 border rounded-xl px-5 py-4 text-2xl text-ink outline-none ${error ? "border-rose-600 ring-2 ring-rose-600/30" : "border-white/10"}`}
              onFocus={e => { if (!error) e.target.style.borderColor="rgba(62,207,142,0.50)"; }}
              onBlur={e => e.target.style.borderColor= error ? "" : "rgba(255,255,255,0.10)"}
            />
            {error && <div className="mt-3 text-sm text-rose-600">PIN salah.</div>}
            <button type="submit" disabled={loading} className="btn btn-primary w-full mt-5">
              {loading ? "Memverifikasi..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ============== DASHBOARD ============== */
const AdminDashboard = () => {
  const [members, setMembers] = useState([]);
  const [totalPromptsUsed, setTotalPromptsUsed] = useState(0);
  const [totalMaddahOpens, setTotalMaddahOpens] = useState(0);
  const [topMaddah, setTopMaddah] = useState([]);

  useEffect(() => {
    adminGetAllMembers()
      .then(setMembers)
      .catch(() => setMembers(sbGetAllMembersFallback()));
    adminMembersAPI('aggregate-activity')
      .then(data => {
        if (Array.isArray(data)) {
          setTotalPromptsUsed(data.reduce((s, r) => s + (r.prompts_copied || 0), 0));
          setTotalMaddahOpens(data.reduce((s, r) => s + (r.opens || 0), 0));
          const top = data
            .map(r => [r.maddah_id, { opens: r.opens || 0, promptsCopied: r.prompts_copied || 0 }])
            .sort((a, b) => b[1].opens - a[1].opens)
            .slice(0, 5);
          setTopMaddah(top);
        }
      })
      .catch(() => {});
  }, []);

  const active   = members.filter(m => m.status === "active").length;
  const expired  = members.filter(m => m.status === "expired").length;
  const disabled = members.filter(m => m.status === "disabled").length;
  const bound    = members.filter(m => m.googleLinked).length;

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-ink mb-2">Overview</h1>
      <p className="text-ink-muted mb-8">Ringkasan platform Talqeeh.</p>

      <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">Member</div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Member"  value={members.length}       icon="users"  color="violet"/>
        <StatCard label="Active"        value={active}               icon="check"  color="mint"/>
        <StatCard label="Akun Google"   value={bound}                icon="user"   color="gold"/>
        <StatCard label="Expired/Off"   value={expired + disabled}   icon="alert"  color="rose"/>
      </div>

      <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">Engagement (semua member)</div>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard label="Prompt Disalin" value={totalPromptsUsed} icon="copy"   color="violet"/>
        <StatCard label="Maddah Dibuka"  value={totalMaddahOpens} icon="layers" color="gold"/>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card-glass p-6">
          <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">Login Terakhir</div>
          <div className="space-y-2">
            {members
              .filter(m => m.lastLogin)
              .sort((a,b) => (b.lastLogin||"").localeCompare(a.lastLogin||""))
              .slice(0, 5)
              .map(m => (
                <div key={m.code} className="flex items-center justify-between text-sm p-2.5 rounded-lg bg-white/3">
                  <div>
                    <div className="text-ink font-medium">{m.name}</div>
                    <div className="text-xs text-ink-soft">{m.email || "—"}</div>
                  </div>
                  <div className="text-xs text-ink-muted">{new Date(m.lastLogin).toLocaleDateString("id-ID")}</div>
                </div>
              ))}
            {members.filter(m => m.lastLogin).length === 0 && (
              <div className="text-sm text-ink-muted py-4 text-center">Belum ada login.</div>
            )}
          </div>
        </div>

        <div className="card-glass p-6">
          <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">Maddah Terpopuler</div>
          {topMaddah.length === 0 ? (
            <div className="text-sm text-ink-muted py-4 text-center">Belum ada data aktivitas.</div>
          ) : (
            <div className="space-y-2">
              {topMaddah.map(([id, act]) => {
                const maddah = typeof getMaddahById !== "undefined" ? getMaddahById(id) : null;
                return (
                  <div key={id} className="flex items-center justify-between text-sm p-2.5 rounded-lg bg-white/3">
                    <div>
                      <div className="text-ink font-medium">{maddah?.name || id}</div>
                      <div className="text-xs text-ink-soft">{act.promptsCopied || 0} prompt disalin</div>
                    </div>
                    <div className="text-xs text-emerald-300 font-medium">{act.opens} buka</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => {
  const tone = {
    violet: "bg-emerald-500/15 text-emerald-300",
    gold:   "bg-gold-500/15 text-gold-300",
    mint:   "bg-mint-500/15 text-mint-500",
    rose:   "bg-rose-600/15 text-rose-600",
  }[color] || "bg-white/5 text-ink-muted";
  return (
    <div className="card-glass p-5">
      <div className={`w-10 h-10 rounded-lg ${tone} flex items-center justify-center mb-3`}>
        <Icon name={icon} className="w-5 h-5"/>
      </div>
      <div className="font-display text-3xl font-semibold text-ink num">{value}</div>
      <div className="text-xs uppercase tracking-wider text-ink-muted mt-0.5">{label}</div>
    </div>
  );
};

/* ============== ANALITIK ============== */
const rupiah = (n) => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID');
const usd = (n) => '$' + (n || 0).toFixed(2);
const AI_KIND_LABELS = {
  prompt:     { label: 'Tanya AI',         sub: 'pesan', color: '#2dd4bf' },
  generate:   { label: 'Pembuatan AI',     sub: 'ringkasan, kartu, kuis, mufradat, peta, tahriri', color: '#3ecf8e' },
  chat:       { label: 'Tutor & syafawi',  sub: 'pesan', color: '#60a5fa' },
  analyze:    { label: "I'rab & harakat",  sub: 'analisis', color: '#c9a86a' },
  grade:      { label: 'Nilai tahriri',    sub: 'jawaban', color: '#f97316' },
  ocr:        { label: 'Baca foto/scan',   sub: 'halaman', color: '#a78bfa' },
  transcribe: { label: 'Transkrip',        sub: 'menit', color: '#f472b6' },
};
const SOURCE_LABELS = { pdf: 'PDF', foto: 'Foto', teks: 'Teks', docx: 'Word', pptx: 'PowerPoint', xlsx: 'Excel', txt: 'TXT', audio: 'Audio', video: 'Video', campuran: 'Campuran' };

const KpiCard = ({ label, value, sub, delta }) => (
  <div className="card-glass p-5">
    <div className="text-[11px] uppercase tracking-wider text-ink-muted mb-2">{label}</div>
    <div className="font-display text-2xl md:text-3xl font-semibold text-ink num leading-none">{value}</div>
    <div className="mt-2 min-h-[16px]">{delta}{sub && <div className="text-[11px] text-ink-soft">{sub}</div>}</div>
  </div>
);

const Section = ({ title, children, right }) => (
  <div className="mb-10">
    <div className="flex items-center justify-between gap-3 mb-3">
      <div className="text-xs uppercase tracking-[0.2em] text-gold-400">{title}</div>
      {right}
    </div>
    {children}
  </div>
);

const Panel = ({ title, children, className = '' }) => (
  <div className={`card-glass p-5 md:p-6 ${className}`}>
    {title && <div className="text-sm text-ink font-medium mb-4">{title}</div>}
    {children}
  </div>
);

const FEEDBACK_KIND_LABELS = {
  summary: 'Ringkasan', mindmap: 'Peta konsep', flashcards: 'Flashcard', quiz: 'Kuis', glossary: 'Mufradat',
  essays: 'Soal tahriri', grade: 'Penilaian tahriri', irab: "Terjemah & i'rab", tasykil: 'Harakat',
  tutor: 'Tutor', syafawi: 'Simulasi syafawi',
};
const FEEDBACK_CATEGORY_LABELS = {
  salah_fakta: 'Isi/fakta keliru', salah_arab: "Bahasa Arab / i'rab keliru", salah_harakat: 'Harakat keliru',
  tidak_sesuai_materi: 'Tidak sesuai materi', kurang_jelas: 'Kurang jelas', terpotong: 'Terpotong', lainnya: 'Lainnya',
};

// Masukan 👍/👎 member atas hasil AI Partner — dasar untuk menilai & memperbaiki prompt/model.
const AiQualitySection = ({ quality }) => {
  const [openReport, setOpenReport] = useState(null);
  if (!quality) return null;
  const pct = (v) => (v == null ? '—' : `${Math.round(v * 100)}%`);
  return (
    <Section title="Kualitas AI (masukan member)">
      {!quality.migrated && (
        <div className="card-glass p-4 mb-4 text-sm text-amber-300">
          Tabel masukan belum ada — jalankan <span className="font-mono">migrations/ai_feedback.sql</span> di Supabase SQL Editor.
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KpiCard label="Masukan" value={quality.total}/>
        <KpiCard label="Dinilai membantu" value={pct(quality.positiveRate)}
          delta={quality.positiveRate != null && quality.positiveRatePrev != null
            ? <Delta now={quality.positiveRate * 100} prev={quality.positiveRatePrev * 100}/> : null}/>
        <KpiCard label="👍 Membantu" value={quality.up}/>
        <KpiCard label="👎 Ada yang salah" value={quality.down}/>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Per fitur">
          {quality.byKind.length === 0
            ? <div className="text-sm text-ink-muted">Belum ada masukan di periode ini.</div>
            : (
              <div className="space-y-3">
                {quality.byKind.map(k => {
                  const total = k.up + k.down;
                  return (
                    <div key={k.kind}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-ink-muted">{FEEDBACK_KIND_LABELS[k.kind] || k.kind}</span>
                        <span className="text-ink">{Math.round((k.up / total) * 100)}% <span className="text-[11px] text-ink-soft">({k.up}👍 {k.down}👎)</span></span>
                      </div>
                      <div className="h-2 rounded-full bg-rose-500/40 overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${(k.up / total) * 100}%` }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          {(quality.byModel || []).length > 0 && (
            <div className="mt-5 pt-4 border-t border-white/8">
              <div className="text-[11px] uppercase tracking-wider text-ink-soft mb-2">Per model</div>
              <div className="space-y-2">
                {quality.byModel.map(m => {
                  const total = m.up + m.down;
                  return (
                    <div key={m.model} className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-mono text-ink-muted truncate" title={m.model}>{m.model}</span>
                      <span className="text-ink flex-shrink-0">{Math.round((m.up / total) * 100)}% <span className="text-ink-soft">dari {total}</span></span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-ink-soft mt-2">Bandingkan hanya kalau jumlah masukannya sudah cukup (±30+ per model).</p>
            </div>
          )}
          {Object.keys(quality.categories).length > 0 && (
            <div className="mt-5 pt-4 border-t border-white/8">
              <div className="text-[11px] uppercase tracking-wider text-ink-soft mb-2">Jenis kesalahan</div>
              <HBarList color="#f43f5e" items={Object.entries(quality.categories).sort((a, b) => b[1] - a[1])
                .map(([id, n]) => ({ label: FEEDBACK_CATEGORY_LABELS[id] || id, value: n }))}/>
            </div>
          )}
        </Panel>
        <Panel title="Laporan kesalahan terbaru" className="lg:col-span-2">
          {quality.reports.length === 0
            ? <div className="text-sm text-ink-muted">Belum ada laporan. Bagus — atau belum banyak yang memberi masukan.</div>
            : (
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {quality.reports.map((r, i) => (
                  <div key={i} className="rounded-lg bg-white/3 border border-white/6 p-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="px-2 py-0.5 rounded-full bg-white/6 text-ink">{FEEDBACK_KIND_LABELS[r.kind] || r.kind}</span>
                        {r.category && <span className="px-2 py-0.5 rounded-full bg-rose-500/12 text-rose-300">{FEEDBACK_CATEGORY_LABELS[r.category] || r.category}</span>}
                        <span className="text-ink-soft">{r.name} · {new Date(r.at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      {r.snippet && (
                        <button onClick={() => setOpenReport(openReport === i ? null : i)} className="text-[11px] text-emerald-300 hover:text-emerald-200">
                          {openReport === i ? 'Tutup' : 'Lihat hasil AI'}
                        </button>
                      )}
                    </div>
                    {r.note && <p className="text-sm text-ink mt-2 leading-relaxed" dir="auto">"{r.note}"</p>}
                    {openReport === i && (
                      <pre className="mt-2 text-xs text-ink-muted whitespace-pre-wrap bg-black/30 rounded-lg p-3 max-h-60 overflow-y-auto" dir="auto">{r.snippet}</pre>
                    )}
                    {r.model && <div className="text-[10px] text-ink-soft font-mono mt-1.5">{r.model}</div>}
                  </div>
                ))}
              </div>
            )}
        </Panel>
      </div>
    </Section>
  );
};

const AdminAnalytics = () => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError('');
    adminMembersAPI('analytics', null, null, { days })
      .then(setData)
      .catch(e => setError(e.message || 'Gagal memuat analitik'))
      .finally(() => setLoading(false));
  }, [days]);

  const header = (
    <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
      <div>
        <h1 className="font-display text-4xl font-semibold text-ink mb-1">Analitik</h1>
        <p className="text-ink-muted">Pemasukan, pertumbuhan member, AI Partner, dan pemakaian Library.</p>
      </div>
      <div className="inline-flex rounded-xl border border-white/10 bg-white/4 p-1 gap-1">
        {[7, 30, 90].map(d => (
          <button key={d} onClick={() => setDays(d)}
            className={`text-xs px-3 py-1.5 rounded-lg ${days === d ? 'bg-emerald-500/20 text-emerald-200' : 'text-ink-muted hover:text-ink'}`}>
            {d} hari
          </button>
        ))}
      </div>
    </div>
  );

  if (error) return <div>{header}<div className="card-glass p-6 text-sm text-rose-400">{String(error)}</div></div>;
  if (loading || !data) return <div>{header}<div className="card-glass p-8 text-center text-ink-muted text-sm animate-pulse">Menghitung analitik…</div></div>;

  const { revenue, members, ai, library } = data;
  const facultyLabel = (id) => (typeof FACULTIES !== 'undefined' && FACULTIES.find(f => f.id === id)?.label) || { s2: 'S2', lainnya: 'Lainnya', mahad: "Ma'had" }[id] || id;
  const levelLabel = (id) => (typeof LEVELS !== 'undefined' && (LEVELS.find(l => l.id === id)?.short || LEVELS.find(l => l.id === id)?.label)) || id;
  const avgActive = members.presentByDay.length ? Math.round(members.presentByDay.reduce((s, d) => s + d.count, 0) / members.presentByDay.length) : 0;

  return (
    <div>
      {header}

      {/* Ringkasan */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-10">
        <KpiCard label="Pemasukan" value={rupiah(revenue.total)} delta={<Delta now={revenue.total} prev={revenue.prevTotal}/>}/>
        <KpiCard label="Akun baru" value={members.newInRange} delta={<Delta now={members.newInRange} prev={members.newPrev}/>}
          sub={members.freeNewInRange ? `${members.freeNewInRange} di antaranya akun gratis` : null}/>
        <KpiCard label="Aktif belajar" value={members.activeInRange} sub={`rata-rata ${avgActive}/hari`}/>
        <KpiCard label="Gratis → Library" value={members.freeConversionRate == null ? '—' : `${Math.round(members.freeConversionRate * 100)}%`}
          sub={`${members.freeConverted} dari ${members.freeStarted} akun gratis`}/>
        <KpiCard label="Pelanggan AI aktif" value={ai.activeSubscribers}
          sub={ai.conversionRate == null ? null : `${Math.round(ai.conversionRate * 100)}% pencoba AI berlangganan`}/>
        <KpiCard label="Biaya AI (perkiraan)" value={usd(ai.estCostUsd)} delta={<Delta now={ai.estCostUsd} prev={ai.estCostPrevUsd} invert/>}/>
      </div>

      {/* Pemasukan */}
      <Section title="Pemasukan & penjualan">
        <div className="grid lg:grid-cols-3 gap-4">
          <Panel title="Pemasukan per hari" className="lg:col-span-2">
            <BarChart data={revenue.byDay} format={rupiah}
              series={[{ key: 'library', label: 'Library', color: '#c9a86a' }, { key: 'ai', label: 'AI Partner', color: '#3ecf8e' }]}/>
          </Panel>
          <Panel title="Rincian">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-ink-muted">Library</span><span className="text-ink">{rupiah(revenue.library)}</span></div>
              <div className="flex justify-between"><span className="text-ink-muted">AI Partner</span><span className="text-ink">{rupiah(revenue.ai)}</span></div>
              <div className="flex justify-between border-t border-white/8 pt-3"><span className="text-ink-muted">Transaksi Talqeeh</span><span className="text-ink">{revenue.transactions}</span></div>
              <div className="flex justify-between"><span className="text-ink-muted">Rata-rata transaksi</span><span className="text-ink">{rupiah(revenue.transactions ? revenue.total / revenue.transactions : 0)}</span></div>
              {revenue.otherCount > 0 && (
                <div className="text-[11px] text-ink-soft border-t border-white/8 pt-3 leading-relaxed">
                  {revenue.otherCount} transaksi produk lain di akun Mayar ({rupiah(revenue.otherAmount)}) tidak dihitung — misalnya penjualan Nemsyi.
                </div>
              )}
              {revenue.checkoutsReady === false && (
                <div className="text-[11px] text-amber-300 leading-relaxed">
                  Jalankan migrations/mayar_api.sql di Supabase supaya pembayaran lewat Mayar API ikut terhitung.
                </div>
              )}
            </div>
          </Panel>
        </div>
      </Section>

      {/* Member */}
      <Section title="Pertumbuhan member">
        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          <Panel title={`Member baru per hari · total ${members.total}`}>
            <BarChart data={members.newByDay} series={[{ key: 'count', label: 'Member baru', color: '#c9a86a' }]} height={140}/>
          </Panel>
          <Panel title="Member yang belajar per hari">
            <LineChart data={members.presentByDay.map(d => ({ day: d.day, value: d.count }))} format={v => `${v} member`}/>
            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div className="rounded-xl bg-white/3 p-3"><div className="text-ink font-semibold">{members.login7}</div><div className="text-[11px] text-ink-soft">login 7 hari terakhir</div></div>
              <div className="rounded-xl bg-white/3 p-3"><div className="text-ink font-semibold">{members.login30}</div><div className="text-[11px] text-ink-soft">login 30 hari terakhir</div></div>
            </div>
          </Panel>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <Panel title="Status akun">
            <ProportionBar parts={[
              { label: 'Member Library', value: members.paid ?? members.active, color: '#c9a86a' },
              { label: 'Akun gratis', value: members.free || 0, color: '#60a5fa' },
              { label: 'Nonaktif/expired', value: Math.max(0, members.total - members.active), color: '#f43f5e' },
            ]}/>
            <div className="text-[11px] text-ink-soft mt-3">
              {members.googleLinked} akun sudah login Google · {members.pinPending} member lama belum menautkan (butuh PIN)
            </div>
          </Panel>
          <Panel title="Sebaran fakultas">
            <HBarList color="#c9a86a" items={Object.entries(members.faculty).sort((a, b) => b[1] - a[1]).slice(0, 8)
              .map(([id, n]) => ({ label: facultyLabel(id), value: n }))}/>
          </Panel>
        </div>
      </Section>

      {/* AI Partner */}
      <Section title="AI Partner & biaya">
        {!ai.migrated && <div className="card-glass p-4 mb-4 text-sm text-amber-300">Sebagian data AI Partner belum tersedia — pastikan migrasi AI Partner sudah dijalankan.</div>}
        <div className="grid lg:grid-cols-3 gap-4 mb-4">
          <Panel title="Pemakaian AI per hari" className="lg:col-span-2">
            <BarChart data={ai.usageByDay} height={160}
              series={Object.entries(AI_KIND_LABELS).map(([key, v]) => ({ key, label: v.label, color: v.color }))}/>
          </Panel>
          <Panel title="Coba gratis → berlangganan">
            <div className="space-y-3">
              {[
                ['Semua akun aktif', members.active, '#6b7280'],
                ['Mencoba AI Partner', ai.trialsStarted, '#c9a86a'],
                ['Berlangganan', ai.trialConverted, '#3ecf8e'],
              ].map(([label, value, color], i, arr) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1"><span className="text-ink-muted">{label}</span><span className="text-ink">{value}</span></div>
                  <div className="h-3 rounded-full bg-white/6 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${arr[0][1] ? (value / arr[0][1]) * 100 : 0}%`, background: color }}/>
                  </div>
                </div>
              ))}
              <div className="text-[11px] text-ink-soft pt-1">Pelanggan aktif sekarang: {ai.activeSubscribers}</div>
            </div>
          </Panel>
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <Panel title="Pemakaian & perkiraan biaya per fitur" className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-[11px] uppercase tracking-wider text-ink-soft text-left">
                  <th className="pb-2 font-medium">Fitur</th><th className="pb-2 font-medium text-right">Jumlah</th><th className="pb-2 font-medium text-right">Biaya</th>
                </tr></thead>
                <tbody>
                  {Object.entries(AI_KIND_LABELS).map(([k, v]) => (
                    <tr key={k} className="border-t border-white/6">
                      <td className="py-2"><span className="inline-block w-2 h-2 rounded-sm mr-2" style={{ background: v.color }}/>{v.label} <span className="text-[11px] text-ink-soft">({v.sub})</span></td>
                      <td className="py-2 text-right text-ink">{(ai.usageByKind[k] || 0).toLocaleString('id-ID')}</td>
                      <td className="py-2 text-right text-ink-muted">{usd(ai.costByKind[k])}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-white/12">
                    <td className="py-2 text-ink font-medium">Total</td>
                    <td className="py-2 text-right text-ink-soft">{ai.setsCreated} materi baru</td>
                    <td className="py-2 text-right text-ink font-medium">{usd(ai.estCostUsd)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-ink-soft mt-3 leading-relaxed">
              Biaya adalah perkiraan kasar dari rata-rata ukuran permintaan × harga model. Cek angka pastinya di dashboard OpenRouter.
            </p>
          </Panel>
          <Panel title="Format materi">
            <HBarList items={Object.entries(ai.bySource).sort((a, b) => b[1] - a[1]).map(([k, n]) => ({ label: SOURCE_LABELS[k] || k, value: n }))}
              empty="Belum ada materi di periode ini."/>
            <div className="text-[11px] text-ink-soft mt-3">Total materi sepanjang waktu: {ai.setsTotal}</div>
          </Panel>
        </div>
        {ai.topUsers.length > 0 && (
          <Panel title="Pengguna AI terbanyak (periode ini)" className="mt-4">
            <div className="space-y-2">
              {ai.topUsers.map(u => (
                <div key={u.code} className="flex items-center justify-between gap-3 text-sm p-2.5 rounded-lg bg-white/3">
                  <div className="min-w-0">
                    <div className="text-ink truncate">{u.name}</div>
                    <div className="text-[11px] text-ink-soft font-mono">{u.code} · {u.subscribed ? 'pelanggan' : 'coba gratis/nonaktif'}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-ink">{u.count.toLocaleString('id-ID')}x</div>
                    <div className="text-[11px] text-ink-soft">{usd(u.cost)}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </Section>

      {/* Kualitas AI */}
      <AiQualitySection quality={data.quality}/>

      {/* Library */}
      <Section title="Engagement Library (sepanjang waktu)">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <KpiCard label="Maddah dibuka" value={library.totalOpens.toLocaleString('id-ID')}/>
          <KpiCard label="Prompt disalin" value={library.totalPrompts.toLocaleString('id-ID')}/>
          <KpiCard label="Catatan Kurasah" value={library.notes.toLocaleString('id-ID')}/>
          <KpiCard label="Muqaranah dibuat" value={library.muqaranah.toLocaleString('id-ID')}/>
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <Panel title="Maddah terpopuler" className="lg:col-span-2">
            <HBarList items={library.topMaddah.map(x => {
              const md = (typeof getMaddahById !== 'undefined' && getMaddahById(x.id)) || (typeof getMahadMaddahById !== 'undefined' && getMahadMaddahById(x.id));
              return { label: md?.name || x.id, sub: `${x.prompts} prompt disalin`, value: x.opens };
            })} format={v => `${v} buka`}/>
          </Panel>
          <Panel title="Bank soal (cek diri)">
            <ProportionBar parts={[
              { label: 'Paham', value: library.soal.paham, color: '#3ecf8e' },
              { label: 'Belum', value: library.soal.belum, color: '#f59e0b' },
            ]}/>
            <p className="text-[11px] text-ink-soft mt-3">Jumlah tanda "Paham/Belum" yang diberi member di Bank Soal.</p>
          </Panel>
        </div>
      </Section>
    </div>
  );
};

/* ============== MEMBERS ============== */
const MEMBER_TYPE_CONFIG = {
  berbayar: { label: 'Berbayar', color: '#3ecf8e', bg: 'rgba(62,207,142,0.1)',  icon: '💳' },
  gratis:   { label: 'Gratis (akses penuh)', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', icon: '🎁' },
  trial:    { label: 'Trial',    color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  icon: '⏳' },
  reward:   { label: 'Reward',   color: '#f97316', bg: 'rgba(249,115,22,0.1)',  icon: '🏆' },
};

// Member berbayar yang belum punya email Google dan belum login → perlu diisi admin.
const needsEmail = (m) => m.tier !== "free" && !m.googleLinked && !m.email;

// Isi email langsung di baris tabel member: Enter untuk menyimpan (Library selamanya, tanpa PIN).
const InlineEmail = ({ member, onLinked }) => {
  const toast = useToast();
  const [editing, setEditing] = useState(!member.email);
  const [value, setValue] = useState(member.email || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    const email = value.trim().toLowerCase();
    if (!email || busy) return;
    if (email === (member.email || "").toLowerCase()) { setEditing(false); return; }
    setBusy(true);
    setError("");
    try {
      const [r] = await adminLinkEmails([{ code: member.code, email }]);
      if (!r?.ok) { setError(r?.error || "Gagal menyimpan"); return; }
      toast.push(`${member.name}: email tersimpan${r.mergedFree ? " · akun gratisnya digabung" : ""}.`);
      setEditing(false);
      onLinked(r);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-ink">{member.email}</span>
        <button onClick={() => setEditing(true)} className="text-[11px] text-emerald-300 hover:text-emerald-200">ubah</button>
      </div>
    );
  }
  return (
    <div className="min-w-[220px]">
      <div className="flex items-center gap-1.5">
        <input type="email" value={value} disabled={busy} placeholder="email Google…"
          onChange={e => { setValue(e.target.value); setError(""); }}
          onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape" && member.email) { setValue(member.email); setEditing(false); } }}
          className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-ink outline-none font-mono focus:border-emerald-500/50"/>
        <button onClick={save} disabled={busy || !value.trim()} title="Simpan (Enter)"
          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border ${value.trim() ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200" : "border-white/10 text-ink-soft"}`}>
          {busy ? <span className="w-3 h-3 border-2 border-emerald-400/30 border-t-emerald-300 rounded-full animate-spin"/> : <Icon name="check" className="w-3.5 h-3.5"/>}
        </button>
      </div>
      {error && <div className="text-[11px] text-rose-400 mt-1">{error}</div>}
    </div>
  );
};

/* ── Member lama: admin memasukkan email Google → Library selamanya, login tanpa PIN ── */
const LegacyLinkPanel = ({ members, onDone, onClose }) => {
  const toast = useToast();
  const legacy = members
    .filter(m => m.tier !== "free" && !m.googleLinked)
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  const [emails, setEmails] = useState(() => Object.fromEntries(legacy.map(m => [m.code, m.email || ""])));
  const [results, setResults] = useState({});
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");

  const shown = legacy.filter(m => !query || `${m.name} ${m.code} ${m.whatsapp}`.toLowerCase().includes(query.toLowerCase()));
  const pending = legacy.filter(m => (emails[m.code] || "").trim() && (emails[m.code] || "").trim().toLowerCase() !== (m.email || "").toLowerCase() || ((emails[m.code] || "").trim() && m.status !== "active"));

  const run = async (list) => {
    if (!list.length) return;
    setBusy(true);
    try {
      const data = await adminLinkEmails(list.map(m => ({ code: m.code, email: emails[m.code] })));
      const next = { ...results };
      for (const r of (Array.isArray(data) ? data : [])) next[r.code] = r;
      setResults(next);
      const ok = (data || []).filter(r => r.ok).length;
      const fail = (data || []).length - ok;
      toast.push(`${ok} member terhubung${fail ? `, ${fail} gagal — lihat keterangan merah` : ""}.`);
      if (ok) onDone();
    } catch (err) {
      toast.push("Gagal: " + err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card-glass p-5 mb-4" style={{ border: "1px solid rgba(201,168,106,0.3)" }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="font-display text-lg font-semibold text-ink">Hubungkan email member lama</div>
          <p className="text-xs text-ink-muted leading-relaxed mt-1 max-w-2xl">
            Isi email Google tiap member lama. Setelah disimpan, member itu jadi <span className="text-ink">Library selamanya</span> dan
            cukup login Google dengan email tersebut — tanpa PIN. AI Partner tidak termasuk (tetap bayar sendiri).
            Kalau member sudah telanjur punya akun gratis dengan email itu, akun gratisnya otomatis digabung ke keanggotaan lama.
          </p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg text-ink-muted hover:bg-white/5 flex items-center justify-center flex-shrink-0">
          <Icon name="x" className="w-4 h-4"/>
        </button>
      </div>

      {legacy.length === 0 ? (
        <div className="text-sm text-ink-muted py-4">Semua member lama sudah terhubung ke akun Google. 🎉</div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari nama / kode / WA…"
              className="flex-1 min-w-[180px] bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-ink outline-none"/>
            <span className="text-xs text-ink-soft">{legacy.length} belum terhubung</span>
            <button onClick={() => run(pending)} disabled={busy || !pending.length} className="btn btn-gold text-sm px-4 py-2">
              {busy ? "Menyimpan…" : `Simpan ${pending.length || ""} yang diisi`}
            </button>
          </div>
          <div className="max-h-[480px] overflow-y-auto rounded-xl border border-white/8">
            {shown.map(m => {
              const r = results[m.code];
              const expired = m.status !== "active";
              return (
                <div key={m.code} className="flex flex-col md:flex-row md:items-center gap-2 px-3 py-2.5 border-b border-white/5 last:border-0">
                  <div className="md:w-64 min-w-0">
                    <div className="text-sm text-ink truncate">{m.name}</div>
                    <div className="text-[11px] text-ink-soft font-mono truncate">
                      {m.code}{m.whatsapp ? ` · ${m.whatsapp}` : ""}
                      {expired && <span className="text-amber-300 font-sans"> · {m.status}</span>}
                    </div>
                  </div>
                  <input type="email" value={emails[m.code] || ""} placeholder="email@gmail.com"
                    onChange={e => { setEmails(v => ({ ...v, [m.code]: e.target.value })); setResults(v => ({ ...v, [m.code]: undefined })); }}
                    onKeyDown={e => { if (e.key === "Enter" && (emails[m.code] || "").trim()) run([m]); }}
                    className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-ink outline-none font-mono"/>
                  <div className="flex items-center gap-2 md:w-56 justify-between md:justify-end">
                    {r && (r.ok
                      ? <span className="text-[11px] text-emerald-300">✓ Library aktif{r.mergedFree ? " · akun gratis digabung" : ""}</span>
                      : <span className="text-[11px] text-rose-400">{r.error}</span>)}
                    <button onClick={() => run([m])} disabled={busy || !(emails[m.code] || "").trim()}
                      className="btn btn-ghost text-xs px-3 py-1.5 flex-shrink-0">Simpan</button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-ink-soft mt-3">
            Kirim ke member: "Buka talqeeh.vercel.app → Masuk dengan Google pakai email yang kamu daftarkan. Akses Library langsung aktif."
            Catatan & progres dari akun gratis mereka (kalau ada) tidak ikut pindah.
          </p>
        </>
      )}
    </div>
  );
};

const AdminMembers = () => {
  const [members,    setMembers]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [genOpen,    setGenOpen]    = useState(false);
  const [search,     setSearch]     = useState("");
  const [filterType, setFilterType] = useState("semua");
  const [linkOpen,   setLinkOpen]   = useState(false);
  const [grantOpen,  setGrantOpen]  = useState(false);
  const [picked,     setPicked]     = useState(() => new Set());
  const [deleting,   setDeleting]   = useState(false);
  const toast = useToast();

  const loadFromSupabase = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminGetAllMembers();
      setMembers(data);
    } catch (err) {
      setError("Tidak bisa memuat data: " + err.message);
      setMembers(sbGetAllMembersFallback());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFromSupabase(); }, []);

  const updateMember = async (code, patch) => {
    try {
      const current = members.find(m => m.code === code);
      const newEmail = (patch.email || "").trim().toLowerCase();
      // Email baru untuk member berbayar → lewat alur "hubungkan" (Library selamanya, gabung akun gratis).
      if (newEmail && current && current.tier !== "free" && newEmail !== (current.email || "").toLowerCase()) {
        const [r] = await adminLinkEmails([{ code, email: newEmail }]);
        if (!r?.ok) throw new Error(r?.error || "Gagal menghubungkan email");
        const { email, ...rest } = patch;
        patch = rest;
        if (r.mergedFree) toast.push(`Akun gratis ${r.mergedFree} digabung ke member ini.`);
      }
      const updated = await adminUpdateMember(code, patch);
      setMembers(prev => prev.map(m => m.code === code ? updated : m));
      return true;
    } catch (err) {
      toast.push("Gagal update: " + err.message);
      return false;
    }
  };

  const deleteMember = async (code, name) => {
    try {
      await adminDeleteMember(code);
      setMembers(prev => prev.filter(m => m.code !== code));
      toast.push(`Member "${name}" dihapus.`);
    } catch (err) {
      toast.push("Gagal hapus: " + err.message);
    }
  };

  // Hapus banyak member sekaligus. Permanen — konfirmasi menyebut jumlah dan contoh nama.
  const bulkDelete = async () => {
    const chosen = members.filter(m => picked.has(m.code));
    if (!chosen.length || deleting) return;
    const names = chosen.slice(0, 8).map(m => `• ${m.name} (${m.code})`).join("\n");
    const more = chosen.length > 8 ? `\n…dan ${chosen.length - 8} lainnya` : "";
    const linked = chosen.filter(m => m.googleLinked).length;
    const warn = linked ? `\n\n⚠️ ${linked} di antaranya sudah login Google — mereka kehilangan akses.` : "";
    if (!confirm(`Hapus ${chosen.length} member secara permanen?\n\n${names}${more}${warn}\n\nData belajar mereka (catatan, progres, profil, materi AI) ikut terhapus. Tindakan ini tidak bisa dibatalkan.`)) return;
    setDeleting(true);
    try {
      const rows = await adminBulkDelete(chosen.map(m => m.code));
      const gone = new Set((Array.isArray(rows) ? rows : []).map(r => r.code));
      setMembers(prev => prev.filter(m => !gone.has(m.code)));
      setPicked(new Set());
      toast.push(`${gone.size} member dihapus.${gone.size < chosen.length ? ` ${chosen.length - gone.size} gagal — coba Refresh.` : ""}`);
    } catch (err) {
      toast.push("Gagal hapus: " + err.message);
    } finally {
      setDeleting(false);
    }
  };
  const togglePick = (code) => setPicked(prev => { const n = new Set(prev); n.has(code) ? n.delete(code) : n.add(code); return n; });

  const handleAdd = (newMember) => {
    setMembers(prev => [newMember, ...prev]);
  };

  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      m.name.toLowerCase().includes(q) ||
      m.code.toLowerCase().includes(q) ||
      (m.email || "").toLowerCase().includes(q) ||
      (m.whatsapp || "").replace(/\D/g, "").includes(q.replace(/\D/g, "") || "~");
    const matchType = filterType === 'semua'
      || (filterType === 'belum_email' ? needsEmail(m)
        : filterType === 'akun_gratis' ? m.tier === 'free' : m.tier !== 'free' && m.member_type === filterType);
    return matchSearch && matchType;
  });

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.push("Kode tersalin");
  };

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl font-semibold text-ink mb-1">Member Access</h1>
          <p className="text-ink-muted">Kelola member, akun Google yang terhubung, PIN aktivasi, dan status.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadFromSupabase} className="btn btn-ghost text-xs px-3 py-2 flex items-center gap-1.5">
            <Icon name="refresh" className="w-3.5 h-3.5"/> Refresh
          </button>
          <button onClick={() => setLinkOpen(o => !o)} className="btn btn-ghost text-xs px-3 py-2 flex items-center gap-1.5">
            <Icon name="users" className="w-3.5 h-3.5"/> Member lama ({members.filter(m => m.tier !== "free" && !m.googleLinked).length})
          </button>
          <button onClick={() => setGrantOpen(true)} className="btn btn-ghost text-sm">
            <Icon name="crown" className="w-4 h-4"/> Beri akses
          </button>
          <button onClick={() => setGenOpen(true)} className="btn btn-primary">
            <Icon name="sparkles" className="w-4 h-4"/> Tambah Member
          </button>
        </div>
      </div>
      {error && (
        <div className="card-glass p-4 border border-rose-600/30 mb-4 flex items-center gap-3">
          <Icon name="alert" className="w-4 h-4 text-rose-600 flex-shrink-0"/>
          <div className="flex-1">
            <div className="text-rose-600 text-sm">{error}</div>
            <div className="text-ink-soft text-xs">Menampilkan data cache lokal.</div>
          </div>
          <button onClick={loadFromSupabase} className="text-xs text-emerald-300 hover:text-emerald-200 underline">Coba lagi</button>
        </div>
      )}

      {linkOpen && <LegacyLinkPanel members={members} onDone={loadFromSupabase} onClose={() => setLinkOpen(false)}/>}

      {/* Summary stats member type */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {Object.entries(MEMBER_TYPE_CONFIG).map(([value, t]) => (
          <div key={value} style={{
            padding: '10px 16px', borderRadius: 10,
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${t.color}33`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 14 }}>{t.icon}</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: t.color, lineHeight: 1 }}>
                {members.filter(m => m.member_type === value).length}
              </div>
              <div style={{ fontSize: 10, color: '#666', marginTop: 1 }}>{t.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-glass p-4 mb-4">
        <div className="relative mb-3">
          <Icon name="search" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft"/>
          <input value={search} onChange={(e)=>setSearch(e.target.value)}
            placeholder="Cari nama, kode, email, atau nomor WA..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm text-ink placeholder:text-ink-soft outline-none transition-colors"
            onFocus={e => e.target.style.borderColor="rgba(62,207,142,0.45)"}
            onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.10)"}/>
        </div>
        {/* Filter member type */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { value: 'semua',       label: 'Semua',                 color: '#888' },
            { value: 'belum_email', label: 'Belum ada email',       color: '#c9a86a' },
            { value: 'berbayar',    label: 'Berbayar',              color: '#3ecf8e' },
            { value: 'gratis',      label: 'Gratis (akses penuh)',  color: '#a78bfa' },
            { value: 'trial',       label: 'Trial',                 color: '#fbbf24' },
            { value: 'reward',      label: 'Reward Bank Soal',      color: '#f97316' },
            { value: 'akun_gratis', label: 'Akun gratis (belum bayar)', color: '#60a5fa' },
          ].map(t => (
            <button
              key={t.value}
              onClick={() => setFilterType(t.value)}
              style={{
                padding: '5px 12px', borderRadius: 99, fontSize: 12,
                fontWeight: filterType === t.value ? 700 : 400,
                cursor: 'pointer', transition: 'all 0.15s',
                border: filterType === t.value
                  ? `1px solid ${t.color}`
                  : '1px solid rgba(255,255,255,0.08)',
                background: filterType === t.value ? `${t.color}18` : 'transparent',
                color: filterType === t.value ? t.color : '#666',
              }}
            >
              {t.label}
              {t.value !== 'semua' && (
                <span style={{ marginLeft: 5, opacity: 0.7 }}>
                  ({members.filter(m => t.value === 'belum_email' ? needsEmail(m) : t.value === 'akun_gratis' ? m.tier === 'free' : m.tier !== 'free' && m.member_type === t.value).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {picked.size > 0 && (
        <div className="sticky top-[calc(var(--app-header-h,0px)+8px)] z-30 mb-3 flex items-center gap-3 flex-wrap rounded-xl px-4 py-3 border border-rose-500/30 shadow-xl shadow-black/40"
          style={{ background: "#1a1414" }}>
          <span className="text-sm text-ink"><span className="font-semibold">{picked.size}</span> member dipilih</span>
          <button onClick={() => setPicked(new Set(filtered.map(m => m.code)))} className="text-xs text-emerald-300 hover:text-emerald-200">
            Pilih semua yang tampil ({filtered.length})
          </button>
          <button onClick={() => setPicked(new Set())} className="text-xs text-ink-soft hover:text-ink">Batal pilih</button>
          <button onClick={bulkDelete} disabled={deleting}
            className="ms-auto text-sm font-semibold px-4 py-2 rounded-lg text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-60 inline-flex items-center gap-2">
            <Icon name="trash" className="w-4 h-4" style={{ stroke: "currentColor" }}/>
            {deleting ? "Menghapus…" : `Hapus ${picked.size} member`}
          </button>
        </div>
      )}

      <div className="card-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/3 text-left">
                <th className="pl-4 pr-1 py-3 w-8">
                  <input type="checkbox" aria-label="Pilih semua yang tampil" className="accent-rose-500 w-4 h-4 cursor-pointer"
                    checked={filtered.length > 0 && filtered.every(m => picked.has(m.code))}
                    ref={el => { if (el) el.indeterminate = filtered.some(m => picked.has(m.code)) && !filtered.every(m => picked.has(m.code)); }}
                    onChange={e => setPicked(prev => {
                      const n = new Set(prev);
                      filtered.forEach(m => (e.target.checked ? n.add(m.code) : n.delete(m.code)));
                      return n;
                    })}/>
                </th>
                <th className="px-4 py-3 font-medium text-ink-muted text-xs uppercase tracking-wider">Member</th>
                <th className="px-4 py-3 font-medium text-ink-muted text-xs uppercase tracking-wider">Kode</th>
                <th className="px-4 py-3 font-medium text-ink-muted text-xs uppercase tracking-wider">Akun Google</th>
                <th className="px-4 py-3 font-medium text-ink-muted text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 font-medium text-ink-muted text-xs uppercase tracking-wider">Expires</th>
                <th className="px-4 py-3 text-right font-medium text-ink-muted text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.code} className={`border-t border-line ${picked.has(m.code) ? "bg-rose-500/[0.06]" : ""}`}>
                  <td className="pl-4 pr-1 py-3.5 w-8">
                    <input type="checkbox" aria-label={`Pilih ${m.name}`} className="accent-rose-500 w-4 h-4 cursor-pointer"
                      checked={picked.has(m.code)} onChange={() => togglePick(m.code)}/>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center flex-wrap gap-1">
                      <span className="text-ink font-medium">{m.name}</span>
                      {m.tier === 'free' ? (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: '1px solid #60a5fa44' }}>
                          🆓 Akun gratis
                        </span>
                      ) : (() => {
                        const cfg = MEMBER_TYPE_CONFIG[m.member_type] || MEMBER_TYPE_CONFIG.berbayar;
                        return (
                          <span style={{
                            fontSize: 10, fontWeight: 700,
                            padding: '2px 8px', borderRadius: 99,
                            background: cfg.bg, color: cfg.color,
                            border: `1px solid ${cfg.color}44`,
                            verticalAlign: 'middle',
                          }}>
                            {cfg.icon} {cfg.label}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="text-[11px] text-ink-soft">{m.whatsapp}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gold-300">{m.code}</span>
                      <button onClick={() => copyCode(m.code)} className="text-ink-soft hover:text-ink"><Icon name="copy" className="w-3.5 h-3.5"/></button>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    {m.tier !== "free" && !m.googleLinked ? (
                      <InlineEmail member={m} onLinked={(r) => setMembers(prev => prev.map(x => x.code === m.code
                        ? { ...x, email: r.email, status: "active", tier: "library", expiresAt: "2099-12-31", googleLinked: x.googleLinked || !!r.linkedNow }
                        : r.mergedFree && x.code === r.mergedFree ? { ...x, email: "", status: "disabled", googleLinked: false } : x))}/>
                    ) : m.email && <div className="text-xs text-ink">{m.email}</div>}
                    {m.googleLinked
                      ? <span className="text-[11px] text-emerald-300">✓ terhubung</span>
                      : m.email && m.tier !== "free"
                        ? <span className="text-[11px] text-ink-soft">menunggu login Google</span>
                      : m.pinExpiresAt
                        ? <span className={`text-[11px] ${new Date(m.pinExpiresAt) < new Date() ? "text-rose-400" : "text-gold-300"}`}>
                            PIN {new Date(m.pinExpiresAt) < new Date() ? "kedaluwarsa" : `aktif s/d ${formatPinExpiry(m.pinExpiresAt)}`}
                          </span>
                        : <span className="text-[11px] text-ink-soft italic">belum aktivasi</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusPill status={m.status}/>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-ink-muted num">{m.expiresAt}</td>
                  <td className="px-4 py-3.5 text-right">
                    <MemberActions member={m} updateMember={updateMember} onDelete={() => deleteMember(m.code, m.name)} onReload={loadFromSupabase} members={members}/>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="7" className="px-4 py-10 text-center text-ink-muted">Tidak ada member yang cocok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <GenerateModal open={genOpen} onClose={() => setGenOpen(false)} members={members} onAdd={handleAdd}/>
      <GrantAccessModal open={grantOpen} onClose={() => setGrantOpen(false)} members={members} onDone={loadFromSupabase}/>
    </div>
  );
};

const StatusPill = ({ status }) => {
  const map = {
    active:   { c: "bg-mint-500/15 text-mint-500 border-mint-500/30", l: "Active" },
    expired:  { c: "bg-gold-500/15 text-gold-400 border-gold-500/30", l: "Expired" },
    disabled: { c: "bg-rose-600/15 text-rose-600 border-rose-600/30", l: "Disabled" },
  };
  const s = map[status] || map.active;
  return <span className={`chip text-[10px] border ${s.c}`}>{s.l}</span>;
};

const getMemberProfile = (code) => {
  try { return JSON.parse(localStorage.getItem("madad_profile_" + code) || "null"); }
  catch { return null; }
};

const MemberProfileModal = ({ member, onClose }) => {
  const profile = getMemberProfile(member.code);
  return (
    <Modal open onClose={onClose} size="md">
      <div className="p-7">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl font-semibold text-ink">{member.name}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg text-ink-muted hover:bg-white/5"><Icon name="x" className="w-4 h-4 mx-auto"/></button>
        </div>
        <div className="space-y-3 text-sm mb-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/3">
            <span className="text-ink-soft">Kode</span>
            <span className="font-mono text-gold-300">{member.code}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/3">
            <span className="text-ink-soft">Status</span>
            <StatusPill status={member.status}/>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/3">
            <span className="text-ink-soft">Akun Google</span>
            <span className="text-ink text-xs">{member.email || "—"}{member.googleLinked ? " ✓" : " (belum aktivasi)"}</span>
          </div>
          {member.lastLogin && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/3">
              <span className="text-ink-soft">Login terakhir</span>
              <span className="text-ink">{new Date(member.lastLogin).toLocaleDateString("id-ID")}</span>
            </div>
          )}
        </div>
        {profile ? (
          <div className="p-4 rounded-xl" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>
            <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">Profil Onboarding</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-ink-soft mb-0.5">Fakultas</div>
                <div className="text-ink">{profile.faculty || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-ink-soft mb-0.5">Tingkat</div>
                <div className="text-ink">{profile.level || "—"}</div>
              </div>
              {profile.major && (
                <div>
                  <div className="text-xs text-ink-soft mb-0.5">Jurusan</div>
                  <div className="text-ink">{profile.major}</div>
                </div>
              )}
              <div>
                <div className="text-xs text-ink-soft mb-0.5">Gaya Belajar</div>
                <div className="text-ink">{(profile.learningStyle || []).join(", ") || "—"}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl text-sm text-ink-muted text-center" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>
            Member belum menyelesaikan onboarding.
          </div>
        )}
      </div>
    </Modal>
  );
};

const EditMemberModal = ({ member, onClose, onSave }) => {
  const [form, setForm] = useState({
    code:        member.code        || "",
    name:        member.name        || "",
    whatsapp:    member.whatsapp    || "",
    email:       member.email       || "",
    expiresAt:   member.expiresAt   || "",
    notes:       member.notes       || "",
    member_type: member.member_type || "berbayar",
    tier:        member.tier        || "library",
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) return;
    setSaving(true);
    try {
      const saved = await onSave(member.code, {
        code:        form.code.trim().toUpperCase(),
        name:        form.name.trim(),
        whatsapp:    form.whatsapp.trim(),
        email:       form.email.trim(),
        expiresAt:   form.expiresAt,
        notes:       form.notes,
        member_type: form.member_type,
        // Kirim tier hanya kalau diubah (kolomnya baru ada setelah migrasi free_tier.sql).
        ...(form.tier !== (member.tier || "library") ? { tier: form.tier } : {}),
      });
      if (saved === false) return;
      toast.push("Member diperbarui");
      onClose();
    } catch (err) {
      toast.push("Gagal simpan: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, opts = {}) => (
    <div>
      <label className="text-xs text-ink-soft mb-1 block">{label}</label>
      <input
        type={opts.type || "text"}
        value={form[key]}
        onChange={e => set(key, opts.upper ? e.target.value.toUpperCase() : e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-ink outline-none transition-colors font-mono placeholder:font-sans"
        onFocus={e => e.target.style.borderColor = "rgba(62,207,142,0.45)"}
        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.10)"}
        placeholder={opts.placeholder || ""}
      />
    </div>
  );

  return (
    <Modal open onClose={onClose} size="md">
      <form onSubmit={submit} className="p-7">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl font-semibold text-ink">Edit Member</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg text-ink-muted hover:bg-white/5 flex items-center justify-center">
            <Icon name="x" className="w-4 h-4"/>
          </button>
        </div>
        <div className="space-y-4 mb-6">
          {field("ID Member", "code", { upper: true, placeholder: "MSR-XXXX-XXXX" })}
          {field("Nama", "name", { placeholder: "Nama lengkap" })}
          {field("WhatsApp", "whatsapp", { placeholder: "+62..." })}
          {field("Email Google", "email", { type: "email", placeholder: "nama@gmail.com (member login Google tanpa kode)" })}
          {field("Expires At", "expiresAt", { type: "date" })}
          {/* Dropdown member type */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: '#888', fontWeight: 700, letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
              TIPE MEMBER
            </label>
            <select
              value={form.member_type}
              onChange={e => set("member_type", e.target.value)}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 9,
                border: '1px solid rgba(255,255,255,0.1)',
                background: '#1a1a1a', color: '#fff', fontSize: 13,
                cursor: 'pointer',
              }}
            >
              <option value="berbayar">💳 Berbayar — member resmi</option>
              <option value="gratis">🎁 Gratis — akses cuma-cuma</option>
              <option value="trial">⏳ Trial — akses sementara</option>
              <option value="reward">🏆 Reward — dari bank soal</option>
            </select>
            <div style={{ fontSize: 11, color: '#555', marginTop: 5 }}>
              Tipe ini menentukan kategori member untuk laporan dan filter.
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: '#888', fontWeight: 700, letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
              PAKET AKSES
            </label>
            <select value={form.tier} onChange={e => set("tier", e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', background: '#1a1a1a', color: '#fff', fontSize: 13, cursor: 'pointer' }}>
              <option value="library">📚 Library — akses penuh</option>
              <option value="free">🆓 Akun gratis — akses terbatas (belum bayar)</option>
            </select>
            <div style={{ fontSize: 11, color: '#555', marginTop: 5 }}>
              Ubah ke Library untuk meng-upgrade akun gratis yang bayar manual (misal lewat WhatsApp).
            </div>
          </div>
          <div>
            <label className="text-xs text-ink-soft mb-1 block">Catatan</label>
            <textarea
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-ink outline-none resize-none transition-colors"
              onFocus={e => e.target.style.borderColor = "rgba(62,207,142,0.45)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.10)"}
              placeholder="Opsional"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn btn-ghost flex-1">Batal</button>
          <button type="submit" disabled={saving} className="btn btn-primary flex-1">
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

/* ── Beri akses: Library selamanya dan/atau AI Study Partner, lewat email Google atau kode member ── */
const AI_GRANT_DURATIONS = [[30, "30 hari"], [60, "60 hari"], [90, "90 hari"], [180, "6 bulan"], [365, "1 tahun"], [0, "Tanpa batas"]];
const GRANT_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GrantAccessModal = ({ open, onClose, members = [], initialTarget = "", onDone }) => {
  const toast = useToast();
  const [target, setTarget] = useState(initialTarget);
  const [library, setLibrary] = useState(true);
  const [ai, setAi] = useState(true);
  const [days, setDays] = useState(30);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!open) return;
    setTarget(initialTarget); setLibrary(true); setAi(true); setDays(30); setNote(""); setError(""); setResult(null);
  }, [open, initialTarget]);

  const t = target.trim();
  const match = members.find(m => m.code === t.toUpperCase() || (m.email && m.email.toLowerCase() === t.toLowerCase()));
  const isEmail = GRANT_EMAIL_RE.test(t);

  const submit = async (e) => {
    e?.preventDefault();
    if (!t || busy) return;
    setBusy(true); setError("");
    try {
      const data = await adminMembersAPI("grant-access", null, null, { target: t, library, aiDays: ai ? days : null, note });
      setResult({ ...data, whatsapp: match?.whatsapp || "" });
      toast.push(`Akses diberikan ke ${data.name || data.email || data.code}.`);
      onDone && onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const aiText = (r) => !r.aiUntil ? null : r.aiUntil === "unlimited" ? "AI Study Partner tanpa batas waktu"
    : `AI Study Partner sampai ${new Date(r.aiUntil).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`;
  const waText = (r) => {
    const parts = [r.library && "Library selamanya", aiText(r)].filter(Boolean).join(" + ");
    return `Assalamu'alaikum ${r.name || ""}, akses Talqeeh kamu sudah aktif: ${parts}.\n\nMasuk di https://talqeeh.vercel.app dengan akun Google *${r.email || "-"}* — langsung aktif, tanpa kode. Selamat belajar! 🌙`;
  };

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-semibold text-ink">Beri akses</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg text-ink-muted hover:bg-white/5 flex items-center justify-center"><Icon name="x" className="w-4 h-4"/></button>
        </div>

        {result ? (
          <div>
            <div className="card-glass p-4 mb-4" style={{ border: "1px solid rgba(62,207,142,0.3)" }}>
              <div className="text-sm text-ink font-medium">{result.name || result.email} <span className="font-mono text-xs text-gold-300 ml-1">{result.code}</span></div>
              <ul className="text-xs text-ink-muted mt-2 space-y-1">
                {result.library && <li>✓ Library selamanya</li>}
                {aiText(result) && <li>✓ {aiText(result)}</li>}
                {result.created && <li className="text-amber-300">Akun baru dibuat — aktif saat dia login Google dengan {result.email}.</li>}
              </ul>
            </div>
            <label className="text-xs text-ink-soft block mb-1">Pesan untuk dikirim</label>
            <textarea readOnly value={waText(result)} rows={5} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-ink outline-none"/>
            <div className="flex gap-2 mt-3">
              <button onClick={() => { navigator.clipboard.writeText(waText(result)); toast.push("Pesan tersalin"); }} className="btn btn-ghost flex-1 text-sm">Salin pesan</button>
              {result.whatsapp && (
                <button onClick={() => sendAdminWa(result.whatsapp, waText(result), toast)} className="btn btn-primary flex-1 text-sm">Kirim WA</button>
              )}
            </div>
            <button onClick={onClose} className="w-full text-center text-xs text-ink-soft hover:text-ink mt-4">Selesai</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs text-ink-muted block mb-1">Email Google atau kode member</label>
              <input value={target} onChange={e => { setTarget(e.target.value); setError(""); }} list="grant-targets" autoFocus
                placeholder="nama@gmail.com / MSR-XXXX-XXXX"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-ink outline-none font-mono focus:border-emerald-500/45"/>
              <datalist id="grant-targets">
                {members.slice(0, 400).map(m => <option key={m.code} value={m.email || m.code} label={`${m.name} · ${m.code}`}/>)}
              </datalist>
              <div className="text-[11px] mt-1.5 min-h-[16px]">
                {match ? (
                  <span className="text-ink-muted">
                    <span className="text-ink">{match.name}</span> · {match.tier === "free" ? "Akun gratis" : "Member Library"} · {match.googleLinked ? "sudah login Google" : "belum login Google"}
                  </span>
                ) : isEmail ? (
                  <span className="text-amber-300">Belum terdaftar — akun dibuat, aktif saat dia login Google dengan email ini.</span>
                ) : t ? (
                  <span className="text-ink-soft">Ketik email lengkap atau kode member yang ada.</span>
                ) : <span className="text-ink-soft">Pilih dari daftar atau ketik email/kode.</span>}
              </div>
            </div>

            <label className="flex items-start gap-3 card-glass p-3.5 cursor-pointer">
              <input type="checkbox" checked={library} onChange={e => setLibrary(e.target.checked)} className="accent-emerald-500 w-4 h-4 mt-0.5"/>
              <span><span className="text-sm text-ink">Library selamanya</span><span className="block text-[11px] text-ink-soft">Semua maddah, bank soal, Siap Imtihan.</span></span>
            </label>

            <div className="card-glass p-3.5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={ai} onChange={e => setAi(e.target.checked)} className="accent-emerald-500 w-4 h-4 mt-0.5"/>
                <span><span className="text-sm text-ink">AI Study Partner</span><span className="block text-[11px] text-ink-soft">Kalau masih aktif, durasinya ditambahkan dari tanggal habis.</span></span>
              </label>
              {ai && (
                <div className="flex flex-wrap gap-1.5 mt-3 pl-7">
                  {AI_GRANT_DURATIONS.map(([d, label]) => (
                    <button type="button" key={d} onClick={() => setDays(d)}
                      className={`text-xs px-3 py-1.5 rounded-lg border ${days === d ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200" : "border-white/10 text-ink-muted hover:text-ink"}`}>{label}</button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-ink-muted block mb-1">Catatan (opsional)</label>
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="mis. bayar via WA, reward, kolaborasi"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-ink outline-none focus:border-emerald-500/45"/>
            </div>

            {error && <div className="text-xs text-rose-400">{error}</div>}
            <button type="submit" disabled={busy || !t || (!library && !ai)} className="btn btn-primary w-full text-sm py-3">
              {busy ? "Memproses…" : "Beri akses"}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
};

const MemberActions = ({ member, updateMember, onDelete, onReload, members }) => {
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showGrant, setShowGrant] = useState(false);
  const toast = useToast();
  const close = () => setOpen(false);
  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen(o => !o)} className="w-8 h-8 rounded-lg hover:bg-white/8 flex items-center justify-center text-ink-muted">
        <Icon name="list" className="w-4 h-4"/>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={close}/>
          <div className="absolute right-0 top-full mt-1 z-40 rounded-xl border border-white/10 shadow-2xl shadow-black/60 w-52 py-1.5 text-sm text-left"
            style={{ background: "#161616" }}>
            <button onClick={() => { setShowProfile(true); close(); }} className="w-full text-left px-4 py-2 text-ink hover:bg-white/5 flex items-center gap-2">
              <Icon name="user" className="w-3.5 h-3.5 text-ink-soft"/> Lihat Profil
            </button>
            <button onClick={() => { setShowEdit(true); close(); }} className="w-full text-left px-4 py-2 text-ink hover:bg-white/5 flex items-center gap-2">
              <Icon name="edit" className="w-3.5 h-3.5 text-ink-soft"/> Edit Member
            </button>
            <button onClick={() => { setShowGrant(true); close(); }} className="w-full text-left px-4 py-2 text-emerald-300 hover:bg-white/5 flex items-center gap-2">
              <Icon name="crown" className="w-3.5 h-3.5"/> Beri akses…
            </button>
            <div className="my-1 h-px bg-line"/>
            {member.status !== "disabled" && (
              <button onClick={() => { updateMember(member.code, { status: "disabled" }); toast.push("Member disabled"); close(); }} className="w-full text-left px-4 py-2 text-ink hover:bg-white/5">Disable</button>
            )}
            {member.status === "disabled" && (
              <button onClick={() => { updateMember(member.code, { status: "active" }); toast.push("Re-enabled"); close(); }} className="w-full text-left px-4 py-2 text-ink hover:bg-white/5">Re-enable</button>
            )}
            {member.status === "expired" && (
              <button onClick={() => { const d = new Date(); d.setDate(d.getDate() + 30); updateMember(member.code, { status: "active", expiresAt: d.toISOString().split("T")[0] }); toast.push("Renewed 30 days"); close(); }} className="w-full text-left px-4 py-2 text-ink hover:bg-white/5">Renew 30 hari</button>
            )}
            {!member.googleLinked && (
              <button onClick={() => { setShowPin(true); close(); }} className="w-full text-left px-4 py-2 text-emerald-300 hover:bg-white/5">
                {member.pinExpiresAt ? "Buat PIN baru" : "Buat PIN aktivasi"}
              </button>
            )}
            {member.googleLinked && (
              <button onClick={() => {
                if (!confirm(`Lepas akun Google dari ${member.code}? Member harus aktivasi ulang pakai PIN baru.`)) return;
                updateMember(member.code, { unlinkGoogle: true }); toast.push("Akun Google dilepas"); close();
              }} className="w-full text-left px-4 py-2 text-ink hover:bg-white/5">Lepas akun Google</button>
            )}
            <div className="my-1 h-px bg-line"/>
            <button onClick={() => { if (confirm("Hapus member ini? Data belajarnya (catatan, progres, profil, materi AI) ikut terhapus.")) { onDelete(); close(); } }} className="w-full text-left px-4 py-2 text-rose-600 hover:bg-white/5">Delete</button>
          </div>
        </>
      )}
      {showProfile && <MemberProfileModal member={member} onClose={() => setShowProfile(false)}/>}
      {showEdit && <EditMemberModal member={member} onClose={() => setShowEdit(false)} onSave={updateMember}/>}
      {showPin && <PinModal member={member} onClose={() => setShowPin(false)}/>}
      <GrantAccessModal open={showGrant} onClose={() => setShowGrant(false)} members={members || []}
        initialTarget={member.email || member.code} onDone={onReload}/>
    </div>
  );
};

const GenerateModal = ({ open, onClose, members, onAdd }) => {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("+20");
  const [email, setEmail] = useState("");
  const [duration, setDuration] = useState(30);
  const [created, setCreated] = useState(null); // { code, pin?, pinExpiresAt? }
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (open) { setName(""); setWhatsapp("+20"); setEmail(""); setDuration(30); setCreated(null); setSubmitting(false); }
  }, [open]);

  const submit = async (e) => {
    e?.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    try {
      const existing = (members || []).map(m => m.code);
      const code = generateCode(existing);
      const now = new Date();
      const expires = new Date(now); expires.setDate(now.getDate() + Number(duration));
      const newMember = {
        code, name: name.trim(), whatsapp, duration: Number(duration),
        status: "active",
        expiresAt: expires.toISOString().split("T")[0],
        email: email.trim(),
      };
      const added = await adminAddMember(newMember);
      // Tanpa email Google, member perlu PIN aktivasi untuk menghubungkan akunnya.
      const pinResult = email.trim() ? null : await adminGeneratePin(added.code);
      setCreated({ code: added.code, pin: pinResult?.pin, pinExpiresAt: pinResult?.expiresAt });
      onAdd && onAdd(added);
    } catch (err) {
      toast.push("Gagal tambah member: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const buildMessage = () => {
    const loginSteps = created.pin
      ? pinSteps(created.pin, created.pinExpiresAt)
      : "Cara masuk:\n1️⃣ Buka https://talqeeh.vercel.app → tombol *Masuk* (pojok kanan atas) → *Masuk dengan Google*\n2️⃣ Pilih akun Google *" + email.trim().toLowerCase() + "* — akses langsung aktif, tanpa PIN.";
    return "Assalamu'alaikum, " + name + "! 👋\n\nSelamat datang di Talqeeh — Panduan belajar efektif Materi Al-Azhar dengan AI.\n\nKeanggotaan kamu sudah aktif.\n\n" +
      loginSteps +
      "\n\n📖 Panduan Lengkap\nhttps://app.notion.com/p/Talqeeh-Guide-36fb668bda20804294c9d29c6c4ca050" +
      "\n\n📋 Ketentuan: keanggotaan terikat ke 1 akun Google dan bersifat pribadi. Jika disalahgunakan, akses dapat dicabut." +
      WA_FOOTER;
  };

  const copyMessage = () => { navigator.clipboard.writeText(buildMessage()); toast.push("Pesan tersalin"); };
  const sendWA = () => sendAdminWa(whatsapp, buildMessage(), toast);

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="p-7">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl font-semibold text-ink">{created ? "Member berhasil dibuat" : "Tambah member"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg text-ink-muted hover:bg-white/5"><Icon name="x" className="w-4 h-4 mx-auto"/></button>
        </div>
        {!created ? (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-ink-muted mb-1.5 block">Nama Member</label>
              <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Ahmad Fauzi" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-ink outline-none transition-colors"
                onFocus={e => e.target.style.borderColor="rgba(62,207,142,0.45)"}
                onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.10)"}/>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-ink-muted mb-1.5 block">WhatsApp</label>
              <input value={whatsapp} onChange={(e)=>setWhatsapp(e.target.value)} placeholder="+20xxxxxxxxxx" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-ink font-mono outline-none transition-colors"
                onFocus={e => e.target.style.borderColor="rgba(62,207,142,0.45)"}
                onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.10)"}/>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-ink-muted mb-1.5 block">Email Google (opsional)</label>
              <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="nama@gmail.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-ink outline-none transition-colors"
                onFocus={e => e.target.style.borderColor="rgba(62,207,142,0.45)"}
                onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.10)"}/>
              <div className="text-[11px] text-ink-soft mt-1">Kalau diisi, member cukup login Google dengan email ini. Kalau kosong, sistem membuat PIN aktivasi untuk dikirim via WA.</div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-ink-muted mb-1.5 block">Durasi</label>
              <div className="flex gap-2">
                {[30, 60, 90, 180].map(d => (
                  <button key={d} type="button" onClick={() => setDuration(d)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${duration === d ? "text-white border-transparent" : "bg-white/5 text-ink-muted border-white/8 hover:bg-white/10"}`}
                    style={duration === d ? {background:"rgba(62,207,142,0.85)"} : {}}>
                    {d} hari
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={!name.trim() || submitting} className={`btn btn-primary w-full ${!name.trim() || submitting ? "opacity-50 cursor-not-allowed" : ""}`}>
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Menyimpan...
                </span>
              ) : <><Icon name="sparkles" className="w-4 h-4"/> Generate</>}
            </button>
          </form>
        ) : (
          <div className="text-center">
            {created.pin ? (
              <>
                <div className="text-xs uppercase tracking-wider text-gold-400 mb-2">PIN aktivasi untuk {name}</div>
                <div className="card-glass-strong p-6 mb-2">
                  <div className="font-mono text-3xl text-gold-300 tracking-widest">{created.pin}</div>
                </div>
                <div className="text-[11px] text-ink-soft mb-5">Berlaku sampai {formatPinExpiry(created.pinExpiresAt)} · sekali pakai · kode internal {created.code}</div>
              </>
            ) : (
              <div className="card-glass-strong p-5 mb-5 text-sm text-ink-muted">
                Member bisa langsung login Google dengan <span className="text-ink">{email.trim().toLowerCase()}</span> — tanpa PIN.
                <div className="text-[11px] text-ink-soft mt-1">Kode internal {created.code}</div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button onClick={copyMessage} className="btn btn-ghost text-sm py-2.5">
                <Icon name="copy" className="w-4 h-4"/> Salin pesan
              </button>
              <button onClick={sendWA} className="btn btn-gold text-sm py-2.5">
                <Icon name="messageSquare" className="w-4 h-4"/> Kirim WhatsApp
              </button>
            </div>
            <button onClick={onClose} className="text-sm text-ink-muted hover:text-ink mt-3">Tutup</button>
          </div>
        )}
      </div>
    </Modal>
  );
};

/* ============== ONBOARDING DATA ============== */
const AdminOnboarding = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    adminMembersAPI('aggregate-profiles')
      .then(data => {
        if (Array.isArray(data)) setProfiles(data.map(r => r.profile).filter(Boolean));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = profiles.length;

  const toCount = (arr, key) => {
    const count = {};
    arr.forEach(p => (Array.isArray(p[key]) ? p[key] : [p[key]]).filter(Boolean).forEach(v => {
      count[v] = (count[v] || 0) + 1;
    }));
    return count;
  };

  const toItems = (obj, labelMap) =>
    Object.entries(obj)
      .sort((a,b) => b[1] - a[1])
      .map(([id, n]) => ({ label: labelMap?.[id] || id, n }))
      .filter(it => it.label);

  const facultyLabels  = Object.fromEntries((typeof FACULTIES       !== "undefined" ? FACULTIES       : []).map(f => [f.id, f.label]));
  const levelLabels    = Object.fromEntries((typeof LEVELS          !== "undefined" ? LEVELS          : []).map(l => [l.id, l.label || l.short]));
  const struggleLabels = Object.fromEntries((typeof STRUGGLES       !== "undefined" ? STRUGGLES       : []).map(s => [s.id, s.label]));
  const styleLabels    = Object.fromEntries((typeof LEARNING_STYLES !== "undefined" ? LEARNING_STYLES : []).map(s => [s.id, s.label]));

  const facultyItems  = toItems(toCount(profiles, "faculty"),      facultyLabels);
  const levelItems    = toItems(toCount(profiles, "level"),        levelLabels);
  const struggleItems = toItems(toCount(profiles, "struggle"),     struggleLabels);
  const styleItems    = toItems(toCount(profiles, "learningStyle"), styleLabels);

  if (loading) return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-ink mb-1">Onboarding Data</h1>
      <div className="card-glass p-8 text-center text-ink-muted text-sm animate-pulse mt-8">Memuat data...</div>
    </div>
  );

  if (total === 0) return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-ink mb-1">Onboarding Data</h1>
      <p className="text-ink-muted mb-8">Belum ada data onboarding dari member.</p>
      <div className="card-glass p-8 text-center text-ink-muted text-sm">
        Data akan muncul setelah member menyelesaikan onboarding.<br/>
        <span className="text-xs mt-2 block opacity-60">Pastikan sudah menjalankan SQL migration di Supabase.</span>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-ink mb-1">Onboarding Data</h1>
      <p className="text-ink-muted mb-8">
        Data real dari <span className="text-ink font-medium">{total}</span> member yang sudah onboarding.
      </p>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {facultyItems.length > 0 && <AggCard title="Fakultas" items={facultyItems}/>}
        {levelItems.length > 0 && <AggCard title="Tingkat" items={levelItems}/>}
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        {struggleItems.length > 0 && <AggCard title="Struggles Utama" items={struggleItems}/>}
        {styleItems.length > 0 && <AggCard title="Gaya Belajar" items={styleItems}/>}
      </div>

      {total > 0 && (
        <div className="mt-6 card-glass p-6">
          <div className="text-xs uppercase tracking-wider text-gold-400 mb-2">Insight</div>
          <p className="text-ink leading-relaxed text-sm">
            {facultyItems[0] && <>Mayoritas member dari <span className="text-gold-300 font-medium">{facultyItems[0].label}</span>. </>}
            {struggleItems[0] && <>Struggle terbanyak: <span className="text-gold-300 font-medium">{struggleItems[0].label}</span>. </>}
            {styleItems[0] && <>Gaya belajar dominan: <span className="text-gold-300 font-medium">{styleItems[0].label}</span>. </>}
            Prioritaskan konten untuk kombinasi ini.
          </p>
        </div>
      )}
    </div>
  );
};

const AggCard = ({ title, items }) => {
  const max = Math.max(...items.map(i => i.n));
  return (
    <div className="card-glass p-6">
      <div className="text-xs uppercase tracking-wider text-gold-400 mb-4">{title}</div>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-ink">{it.label}</span>
              <span className="font-mono text-xs text-ink-muted num">{it.n}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-gold-400 transition-all" style={{width: `${(it.n/max)*100}%`}}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============== MADDAH ANALYTICS ============== */
const AdminMaddahAnalytics = () => {
  const [rawActivity, setRawActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminMembersAPI('aggregate-activity')
      .then(data => { if (Array.isArray(data)) setRawActivity(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const agg = {};
  rawActivity.forEach(r => {
    if (!agg[r.maddah_id]) agg[r.maddah_id] = { opens: 0, promptsCopied: 0, lastOpen: null };
    agg[r.maddah_id].opens += r.opens || 0;
    agg[r.maddah_id].promptsCopied += r.prompts_copied || 0;
    if (r.last_open && (!agg[r.maddah_id].lastOpen || r.last_open > agg[r.maddah_id].lastOpen)) {
      agg[r.maddah_id].lastOpen = r.last_open;
    }
  });

  const entries = Object.entries(agg)
    .map(([id, act]) => {
      const maddah = typeof getMaddahById !== "undefined" ? getMaddahById(id) : null;
      return { id, name: maddah?.name || id, arabic: maddah?.nameArabic, category: maddah?.category, ...act };
    })
    .sort((a,b) => (b.opens || 0) - (a.opens || 0));

  const totalOpens   = entries.reduce((s, e) => s + (e.opens || 0), 0);
  const totalPrompts = entries.reduce((s, e) => s + (e.promptsCopied || 0), 0);

  const byCategory = {};
  entries.forEach(e => {
    const cat = e.category || "lainnya";
    if (!byCategory[cat]) byCategory[cat] = { opens: 0, prompts: 0 };
    byCategory[cat].opens   += e.opens || 0;
    byCategory[cat].prompts += e.promptsCopied || 0;
  });

  if (loading) return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-ink mb-1">Maddah Analytics</h1>
      <div className="card-glass p-8 text-center text-ink-muted text-sm animate-pulse mt-8">Memuat data...</div>
    </div>
  );

  if (entries.length === 0) return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-ink mb-1">Maddah Analytics</h1>
      <p className="text-ink-muted mb-8">Belum ada aktivitas Maddah tercatat.</p>
      <div className="card-glass p-8 text-center text-ink-muted text-sm">
        Data akan muncul setelah member membuka halaman Maddah.<br/>
        <span className="text-xs mt-2 block opacity-60">Pastikan sudah menjalankan SQL migration di Supabase.</span>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-ink mb-1">Maddah Analytics</h1>
      <p className="text-ink-muted mb-8">Aktivitas penggunaan Maddah oleh user.</p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Buka"     value={totalOpens}     icon="layers" color="violet"/>
        <StatCard label="Prompt Disalin" value={totalPrompts}   icon="copy"   color="gold"/>
        <StatCard label="Maddah Aktif"   value={entries.length} icon="check"  color="violet"/>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card-glass p-6">
          <div className="text-xs uppercase tracking-wider text-gold-400 mb-4">Top Maddah — Paling Sering Dibuka</div>
          <div className="space-y-2">
            {entries.slice(0, 8).map((e, i) => (
              <div key={e.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/3">
                <div className="w-6 text-center font-display text-base text-ink-soft">{i+1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-ink font-medium truncate">{e.name}</div>
                  {e.arabic && <div className="text-[11px] text-gold-300 arabic-display" style={{direction:"rtl"}}>{e.arabic}</div>}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm text-emerald-300 font-medium">{e.opens} buka</div>
                  <div className="text-[11px] text-ink-soft">{e.promptsCopied || 0} prompt</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-glass p-6">
          <div className="text-xs uppercase tracking-wider text-gold-400 mb-4">Aktivitas per Kategori</div>
          {Object.entries(byCategory).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(byCategory)
                .sort((a,b) => b[1].opens - a[1].opens)
                .map(([cat, data]) => {
                  const catLabel = (typeof MADDAH_CATEGORIES !== "undefined"
                    ? MADDAH_CATEGORIES.find(c => c.id === cat)?.label
                    : null) || cat;
                  const maxOpens = Math.max(...Object.values(byCategory).map(d => d.opens), 1);
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-ink capitalize">{catLabel}</span>
                        <span className="text-xs text-ink-muted">{data.opens} buka · {data.prompts} prompt</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-gold-400" style={{width:`${(data.opens/maxOpens)*100}%`}}/>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : <div className="text-sm text-ink-muted text-center py-4">Belum ada data kategori.</div>}

          {entries.filter(e => (e.promptsCopied || 0) > 0).length > 0 && (
            <div className="mt-5 pt-4 border-t border-line">
              <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">Prompt Paling Banyak Disalin</div>
              {entries
                .filter(e => (e.promptsCopied || 0) > 0)
                .sort((a,b) => (b.promptsCopied || 0) - (a.promptsCopied || 0))
                .slice(0, 3)
                .map(e => (
                  <div key={e.id} className="flex items-center justify-between text-sm py-1.5">
                    <span className="text-ink truncate">{e.name}</span>
                    <span className="text-gold-300 font-medium ml-2">{e.promptsCopied}×</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============== MUQARANAH PANEL ============== */
const AdminMuqaranahPanel = () => {
  const library = (typeof MUQARANAH_LIBRARY !== "undefined" ? MUQARANAH_LIBRARY : null)
    || (typeof window !== "undefined" && window.MUQARANAH_LIBRARY ? window.MUQARANAH_LIBRARY : null)
    || (typeof MADDAHS_LIBRARY !== "undefined" ? MADDAHS_LIBRARY : null)
    || [];

  const custom = (() => {
    try { return JSON.parse(localStorage.getItem("madad_muqaranah_custom") || "[]"); }
    catch { return []; }
  })();

  const catLabels = { fiqh: "Fiqh", ushul: "Ushul", aqidah: "Aqidah", hadits: "Hadits", lughah: "Lughah" };
  const totalUlama = library.reduce((s,e) => s + (e.views?.length || 0), 0);
  const uniqueCats = [...new Set(library.map(e => e.category).filter(Boolean))].length;

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-ink mb-1">Muqaranah</h1>
      <p className="text-ink-muted mb-8">
        Library: <span className="text-ink font-medium">{library.length}</span> entri ·
        Buatan user: <span className="text-ink font-medium">{custom.length}</span> entri
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Library"      value={library.length} icon="layers"   color="violet"/>
        <StatCard label="Buatan User"  value={custom.length}  icon="pen"      color="gold"/>
        <StatCard label="Total Ulama"  value={totalUlama}     icon="users"    color="violet"/>
        <StatCard label="Kategori"     value={uniqueCats}     icon="list"     color="gold"/>
      </div>

      <div className="card-glass p-6 mb-5">
        <div className="text-xs uppercase tracking-wider text-gold-400 mb-4">
          Library Muqaranah ({library.length})
        </div>
        {library.length === 0 ? (
          <div className="text-sm text-ink-muted text-center py-4">
            Library kosong — pastikan muqaranah-data.jsx sudah dimuat.
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {library.map((entry, i) => (
              <div key={entry.id || i} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-white/3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-ink font-medium truncate">{entry.title}</div>
                  <div className="text-xs text-ink-soft mt-0.5 line-clamp-1">{entry.question}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {entry.category && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                      {catLabels[entry.category] || entry.category}
                    </span>
                  )}
                  <span className="text-xs text-ink-soft">{entry.views?.length || 0} qoul</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {custom.length > 0 && (
        <div className="card-glass p-6">
          <div className="text-xs uppercase tracking-wider text-gold-400 mb-4">Buatan User ({custom.length})</div>
          <div className="space-y-2">
            {custom.map((entry, i) => (
              <div key={i} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-white/3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-ink font-medium truncate">{entry.title || "(Tanpa judul)"}</div>
                  <div className="text-xs text-ink-soft mt-0.5">{entry.views?.length || 0} qoul ulama</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gold-500/10 text-gold-300 border border-gold-500/20 flex-shrink-0">User</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ============== AI GUIDE MANAGER ============== */
const AdminGuides = () => {
  const [selectedTool, setSelectedTool] = useState(AI_TOOLS[0].id);
  const [selectedStyle, setSelectedStyle] = useState("discussion");
  const tool = AI_TOOLS.find(t => t.id === selectedTool);
  const guide = tool.guides[selectedStyle];

  const [editedGuide, setEditedGuide] = useState(null);
  const [saved, setSaved] = useState(false);
  const toast = useToast();

  const loadGuide = (toolId, styleId) => {
    try {
      const overrides = JSON.parse(localStorage.getItem("talqee_guide_overrides") || "{}");
      return overrides[`${toolId}_${styleId}`] || AI_TOOLS.find(t => t.id === toolId)?.guides?.[styleId];
    } catch { return AI_TOOLS.find(t => t.id === toolId)?.guides?.[styleId]; }
  };

  useEffect(() => {
    const g = loadGuide(selectedTool, selectedStyle);
    setEditedGuide(g ? JSON.parse(JSON.stringify(g)) : {});
    setSaved(false);
  }, [selectedTool, selectedStyle]);

  const handleSave = () => {
    try {
      const overrides = JSON.parse(localStorage.getItem("talqee_guide_overrides") || "{}");
      overrides[`${selectedTool}_${selectedStyle}`] = editedGuide;
      localStorage.setItem("talqee_guide_overrides", JSON.stringify(overrides));
      setSaved(true);
      toast.push("Guide tersimpan.");
      setTimeout(() => setSaved(false), 3000);
    } catch { toast.push("Gagal menyimpan."); }
  };

  const handleReset = () => {
    if (!confirm("Reset guide ini ke default?")) return;
    try {
      const overrides = JSON.parse(localStorage.getItem("talqee_guide_overrides") || "{}");
      delete overrides[`${selectedTool}_${selectedStyle}`];
      localStorage.setItem("talqee_guide_overrides", JSON.stringify(overrides));
      const g = AI_TOOLS.find(t => t.id === selectedTool)?.guides?.[selectedStyle];
      setEditedGuide(g ? JSON.parse(JSON.stringify(g)) : {});
      toast.push("Guide direset ke default.");
    } catch { toast.push("Gagal reset."); }
  };

  if (!editedGuide) return <div className="text-ink-muted py-10 text-center">Memuat guide...</div>;

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-ink mb-1">Guide Manager</h1>
      <p className="text-ink-muted mb-8">Edit adaptive guide per AI × gaya belajar. Perubahan tersimpan ke localStorage.</p>

      <div className="grid lg:grid-cols-12 gap-5">
        <div className="lg:col-span-3 space-y-4">
          <div className="card-glass p-4">
            <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">AI Tool</div>
            <div className="space-y-1">
              {AI_TOOLS.map(t => {
                const hasOverride = (() => {
                  try { const o = JSON.parse(localStorage.getItem("talqee_guide_overrides") || "{}"); return !!o[`${t.id}_${selectedStyle}`]; }
                  catch { return false; }
                })();
                return (
                  <button key={t.id} onClick={() => setSelectedTool(t.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-2.5 transition ${selectedTool === t.id ? "bg-emerald-500/15 text-ink border border-emerald-400/30" : "text-ink-muted hover:bg-white/5 hover:text-ink"}`}>
                    <ToolIcon tool={t} size="w-7 h-7"/>
                    <span className="font-medium flex-1">{t.name}</span>
                    {hasOverride && <span className="w-1.5 h-1.5 rounded-full bg-gold-400"/>}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="card-glass p-4">
            <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">Gaya Belajar</div>
            <div className="space-y-1">
              {(typeof LEARNING_STYLES !== "undefined" ? LEARNING_STYLES : []).map(s => (
                <button key={s.id} onClick={() => setSelectedStyle(s.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition ${selectedStyle === s.id ? "bg-emerald-500/15 text-ink" : "text-ink-muted hover:bg-white/5 hover:text-ink"}`}>
                  <span className="text-base">{s.emoji}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-9 space-y-4">
          <div className="card-glass p-5 flex items-center gap-3">
            <ToolIcon tool={tool} size="w-12 h-12"/>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wider text-gold-400">
                {(typeof LEARNING_STYLES !== "undefined" ? LEARNING_STYLES : []).find(s => s.id === selectedStyle)?.label} guide
              </div>
              <div className="font-display text-2xl text-ink font-semibold">{tool.name}</div>
            </div>
            {saved && <span className="chip chip-gold text-xs">✓ Tersimpan</span>}
          </div>

          <div className="card-glass p-5">
            <div className="text-xs uppercase tracking-wider text-gold-400 mb-2">Kapan dipakai</div>
            <textarea
              value={editedGuide.when || ""}
              onChange={e => setEditedGuide({...editedGuide, when: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ink text-sm outline-none transition-colors min-h-[80px] resize-y"
              onFocus={e => e.target.style.borderColor="rgba(62,207,142,0.45)"}
              onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.10)"}
            />
          </div>

          <div className="card-glass p-5">
            <div className="text-xs uppercase tracking-wider text-gold-400 mb-2">Starter Prompt</div>
            <textarea
              value={editedGuide.starterPrompt || ""}
              onChange={e => setEditedGuide({...editedGuide, starterPrompt: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ink font-mono text-xs outline-none transition-colors min-h-[200px] resize-y"
              onFocus={e => e.target.style.borderColor="rgba(62,207,142,0.45)"}
              onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.10)"}
            />
          </div>

          <div className="flex gap-3 justify-between">
            <button onClick={handleReset} className="btn btn-ghost text-sm px-4 py-2 text-rose-600 border border-rose-600/20 hover:bg-rose-600/10">
              Reset ke default
            </button>
            <button onClick={handleSave} className="btn btn-primary text-sm px-6 py-2">
              Simpan Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============== SETTINGS ============== */
const SettingsField = ({ label, value, onChange, mono = false, hint }) => (
  <div>
    <label className="text-xs text-ink-muted block mb-1">{label}</label>
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-ink text-sm outline-none transition-colors ${mono ? "font-mono" : ""}`}
      onFocus={e => e.target.style.borderColor="rgba(62,207,142,0.45)"}
      onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.10)"}
    />
    {hint && <div className="text-[11px] text-ink-soft mt-1">{hint}</div>}
  </div>
);

// Satu pilihan model AI + tombol uji (memanggil model sungguhan dengan pertanyaan kecil).
const ModelField = ({ label, hint, value, active, onChange }) => {
  const [test, setTest] = useState(null);
  const run = async () => {
    const model = (value || active || '').trim();
    if (!model) return;
    setTest({ busy: true });
    try {
      const d = await aiPartnerAdmin('admin-test-model', { model });
      setTest(d.ok ? { ok: true, text: `Berhasil (${(d.ms / 1000).toFixed(1)} dtk): "${d.reply}"` } : { ok: false, text: d.error || 'Gagal' });
    } catch (e) {
      setTest({ ok: false, text: e.message });
    }
  };
  return (
    <div>
      <label className="text-xs text-ink-muted block mb-1">{label}</label>
      <div className="flex gap-2">
        <input value={value} onChange={e => { onChange(e.target.value); setTest(null); }} list="ai-model-suggestions"
          placeholder={active ? `Sekarang: ${active}` : 'vendor/nama-model'}
          className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-ink text-sm outline-none font-mono focus:border-emerald-500/45"/>
        <button onClick={run} disabled={test?.busy || !(value || active)} className="btn btn-ghost text-xs px-4 flex-shrink-0">
          {test?.busy ? 'Menguji…' : 'Tes'}
        </button>
      </div>
      {test && !test.busy && <div className={`text-[11px] mt-1 ${test.ok ? 'text-emerald-300' : 'text-rose-400'}`}>{test.text}</div>}
      {hint && <div className="text-[11px] text-ink-soft mt-1">{hint}</div>}
    </div>
  );
};

const AdminSettings = () => {
  const toast = useToast();

  // Nilai lama yang dulu cuma tersimpan di browser admin; dipakai sebagai awal sampai data server termuat.
  const loadLocalSettings = () => {
    try { return JSON.parse(localStorage.getItem("talqee_admin_settings") || "{}"); }
    catch { return {}; }
  };

  const [settings, setSettings] = useState(() => ({
    platformName: "Talqeeh",
    tagline:      "Panduan Belajar Al-Azhar dengan AI",
    whatsapp:     "",
    aiPriceMonthly: "",
    aiModelDefault: "",
    aiModelStudy:   "",
    aiModelVision:  "",
    aiModelArabic:  "",
    aiModelGrade:   "",
    aiModelChat:    "",
    aiModelPrompt:  "",
    aiModelTranscribe: "",
    ...loadLocalSettings(),
  }));
  // Kuota bulanan AI per pelanggan; kosong = bawaan server (DEFAULT_MONTHLY_LIMITS).
  const [limits, setLimits] = useState({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeModels, setActiveModels] = useState(null);
  const payOnline = !!useAppSettings().payOnline;

  useEffect(() => {
    adminMembersAPI('get-settings')
      .then(server => {
        if (!server || typeof server !== 'object') return;
        setSettings(s => ({ ...s, ...server }));
        try { setLimits(JSON.parse(server.aiMonthlyLimits || '{}') || {}); } catch { setLimits({}); }
      })
      .catch(err => toast.push("Gagal memuat settings: " + err.message));
    aiPartnerAdmin('admin-models').then(d => { if (d.ok) setActiveModels(d.data); }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminMembersAPI('save-settings', null, { ...settings, aiMonthlyLimits: limits });
      localStorage.removeItem("talqee_admin_settings");
      setSaved(true);
      toast.push("Settings tersimpan & langsung berlaku untuk semua pengunjung.");
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      toast.push("Gagal menyimpan: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-4xl font-semibold text-ink mb-1">Settings</h1>
      <p className="text-ink-muted mb-8">Konfigurasi platform Talqeeh.</p>

      <div className="space-y-4">
        <div className="card-glass p-6 space-y-3">
          <div className="text-xs uppercase tracking-wider text-gold-400 mb-1">Brand</div>
          <SettingsField label="Nama platform" value={settings.platformName}
            onChange={v => setSettings({...settings, platformName: v})}/>
          <SettingsField label="Tagline" value={settings.tagline}
            onChange={v => setSettings({...settings, tagline: v})}/>
        </div>

        <div className="card-glass p-6 space-y-3">
          <div className="text-xs uppercase tracking-wider text-gold-400 mb-1">Operasional</div>
          <SettingsField label="WhatsApp Admin" value={settings.whatsapp} mono
            onChange={v => setSettings({...settings, whatsapp: v})}
            hint="Tombol bantuan & 'Hubungi admin' kalau pembayaran belum aktif. Format: 62812xxxx."/>
        </div>

        <div className="card-glass p-6 space-y-3">
          <div className="flex items-center justify-between gap-3 mb-1">
            <div className="text-xs uppercase tracking-wider text-gold-400">Pembayaran (Mayar API)</div>
            <span className={`text-[11px] px-2 py-0.5 rounded-full border ${payOnline ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10" : "text-amber-300 border-amber-500/30 bg-amber-500/10"}`}>
              {payOnline ? "API key terpasang" : "API key belum diisi"}
            </span>
          </div>
          <p className="text-[11px] text-ink-soft leading-relaxed">
            Tagihan dibuat otomatis per pembeli — tidak perlu produk di dashboard Mayar. API key diisi di Vercel
            (<span className="font-mono">MAYAR_API_KEY</span>), bukan di sini. Selama belum diisi, tombol bayar diganti arahan hubungi admin.
          </p>
          <div className="flex items-center justify-between text-sm border-t border-white/8 pt-3">
            <span className="text-ink-muted">Harga Library</span>
            <span className="text-ink">{LIBRARY_PRICE} · sekali bayar</span>
          </div>
          <SettingsField label="Harga AI Partner per 30 hari (Rp)" value={settings.aiPriceMonthly} mono
            onChange={v => setSettings({...settings, aiPriceMonthly: v.replace(/[^\d]/g, "")})}
            hint="Angka saja, misal 49000. Harga ini yang ditampilkan dan ditagihkan. Kosongkan untuk menutup penjualan AI Partner (akses manual dari tab Langganan & Bayar tetap bisa)."/>
        </div>

        <div className="card-glass p-6 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-gold-400 mb-1">Model AI per tugas</div>
            <p className="text-[11px] text-ink-soft leading-relaxed">
              Pakai ID model dari <a href="https://openrouter.ai/models" target="_blank" rel="noopener noreferrer" className="text-emerald-300 underline">openrouter.ai/models</a>.
              Kosongkan untuk memakai bawaan (terlihat di kolom sebagai "Sekarang: …") — bawaannya sudah dipilih supaya
              biaya per pelanggan di bawah harga langganan: Gemini 2.5 Flash untuk tugas yang membaca materi panjang
              (ringkasan, peta konsep, soal, flashcard, kuis, foto), Haiku 4.5 untuk tutor & Tanya AI, Sonnet 5 hanya
              untuk i'rab, harakat, dan penilaian tahriri.
              Tekan <span className="text-ink">Tes</span> sebelum menyimpan; perubahan berlaku ±1 menit setelah disimpan.
              Bandingkan hasilnya di Analitik → Kualitas AI → "Per model".
            </p>
          </div>
          <datalist id="ai-model-suggestions">
            <option value="anthropic/claude-sonnet-5" label="$2 / $10 per 1 jt token — kuat, bawaan tugas berat"/>
            <option value="anthropic/claude-haiku-4.5" label="$1 / $5 — hemat, bagus untuk tugas terstruktur"/>
            <option value="anthropic/claude-sonnet-4.6" label="$3 / $15 — model lama, lebih mahal"/>
            <option value="google/gemini-2.5-flash" label="$0.30 / $2.50 — sangat hemat, bisa gambar & audio"/>
            <option value="google/gemini-2.5-pro" label="$1.25 / $10 — bisa gambar & audio"/>
          </datalist>
          {[
            ['aiModelDefault', 'Model utama', 'default', 'Ringkasan, peta konsep, soal tahriri — membaca materi penuh. Bawaan Gemini 2.5 Flash (±8× lebih murah dari Sonnet 5).'],
            ['aiModelPrompt', 'Tanya AI', 'prompt', 'Paling sering dipakai, input pendek — bawaan Haiku 4.5. Ganti ke Sonnet 5 kalau jawabannya kurang akurat.'],
            ['aiModelStudy', 'Flashcard, kuis & mufradat', 'study', 'Tugas terstruktur dari materi — bawaan Gemini 2.5 Flash.'],
            ['aiModelVision', 'Baca foto (OCR)', 'vision', 'Foto materi AI Partner, foto talkhisan & soal. Harus model yang bisa membaca gambar — bawaan Gemini 2.5 Flash.'],
            ['aiModelArabic', "Terjemah & i'rab, harakat", 'arabic', 'Butuh ketelitian nahwu-sharaf paling tinggi — bawaan Sonnet 5 (input pendek, jadi tetap murah).'],
            ['aiModelGrade', 'Penilaian tahriri', 'grade', 'Menilai jawaban esai & mengoreksi bahasa Arab mahasiswa — bawaan Sonnet 5.'],
            ['aiModelChat', 'Tutor & simulasi syafawi', 'chat', 'Jawaban bersandar pada materi yang diunggah — bawaan Haiku 4.5. Ganti ke Sonnet 5 kalau kualitas tutor kurang.'],
            ['aiModelTranscribe', 'Transkrip rekaman kuliah', 'transcribe', "Harus model yang bisa mendengar audio (Gemini). Coba google/gemini-2.5-pro kalau transkrip 'ammiyah kurang akurat. Tes hanya memeriksa ID-nya, bukan kemampuan audio."],
          ].map(([key, label, task, hint]) => (
            <ModelField key={key} label={label} hint={hint} value={settings[key] || ''}
              active={activeModels?.[task]} onChange={v => setSettings({ ...settings, [key]: v })}/>
          ))}
        </div>

        <div className="card-glass p-6 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-gold-400 mb-1">Kuota AI per 30 hari langganan</div>
            <p className="text-[11px] text-ink-soft leading-relaxed">
              Batas pemakaian tiap pelanggan AI Partner per periode 30 hari langganan (dihitung dari tanggal bayar; akses manual tanpa
              tanggal habis memakai bulan kalender). Menahan biaya dari pemakai paling berat
              supaya tetap sebanding dengan harga langganan. Kosong = bawaan; 0 = fitur ditutup. Batas harian tetap berlaku.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ['prompt', 'Tanya AI', 'pesan', 150], ['chat', 'Tutor & syafawi', 'pesan', 150],
              ['generate', 'Pembuatan AI', 'kali', 40], ['create', 'Materi baru', 'materi', 15],
              ['analyze', "I'rab & harakat", 'kali', 150], ['grade', 'Nilai tahriri', 'jawaban', 60],
              ['ocr', 'Baca foto', 'halaman', 60], ['transcribe', 'Transkrip', 'menit', 300],
            ].map(([k, label, unit, def]) => (
              <div key={k}>
                <label className="text-[11px] text-ink-muted block mb-1">{label} <span className="text-ink-soft">({unit})</span></label>
                <input inputMode="numeric" value={limits[k] ?? ""} placeholder={String(def)}
                  onChange={e => { const v = e.target.value.replace(/[^\d]/g, "").slice(0, 4); setLimits(l => { const n = { ...l }; if (v === "") delete n[k]; else n[k] = Number(v); return n; }); }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-ink outline-none font-mono focus:border-emerald-500/45"/>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-ink-soft">Angka abu-abu = bawaan. Perkiraan biaya per fitur (mengikuti model di atas) ada di Analitik → AI Partner.</p>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-xs text-ink-soft">
            {saved ? "✓ Tersimpan di server" : "Perubahan belum disimpan"}
          </div>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary px-6 py-2.5 text-sm">
            {saving ? "Menyimpan..." : "Simpan Settings"}
          </button>
        </div>

        <div className="card-glass p-6 border border-rose-600/20">
          <div className="text-xs uppercase tracking-wider text-rose-600 mb-2">Danger Zone</div>
          <p className="text-sm text-ink-muted mb-3">
            Hapus semua data lokal — member, profil, progress, catatan. Tidak bisa diundo.
          </p>
          <button onClick={() => {
            if (!confirm("Yakin hapus SEMUA data lokal? Ini tidak bisa diundo.")) return;
            const typed = prompt("Ketik 'HAPUS' untuk konfirmasi:");
            if (typed !== "HAPUS") { alert("Dibatalkan."); return; }
            Object.values(typeof STORAGE_KEYS !== "undefined" ? STORAGE_KEYS : {})
              .forEach(k => localStorage.removeItem(k));
            ["talqee_maddah_activity","talqee_guide_overrides","talqee_admin_settings"]
              .forEach(k => localStorage.removeItem(k));
            window.location.reload();
          }} className="btn btn-ghost text-sm text-rose-600 border border-rose-600/30 hover:bg-rose-600/10 px-4 py-2">
            Reset semua data
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============== ADMIN AI SUBSCRIPTIONS ============== */

const aiPartnerAdmin = async (action, payload = {}) => {
  const res = await fetch(`/api/ai-partner?action=${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken() },
    body: JSON.stringify(payload),
  });
  return res.json();
};

const AdminSubscriptions = () => {
  const toast = useToast();
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [grantCode, setGrantCode] = useState('');
  const [busy, setBusy]       = useState(false);
  const [payments, setPayments] = useState([]);
  const [checkouts, setCheckouts] = useState({ data: [], missing: false });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, pay, bills] = await Promise.all([aiPartnerAdmin('admin-list'), aiPartnerAdmin('admin-payments'), aiPartnerAdmin('admin-checkouts')]);
      if (data.ok) setRows(data.data);
      else setError(data.error || 'Gagal memuat data');
      if (pay.ok) setPayments(pay.data);
      if (bills.ok) setCheckouts({ data: bills.data, missing: !!bills.missing });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleGrant = async () => {
    if (!grantCode.trim()) return;
    setBusy(true);
    try {
      const data = await aiPartnerAdmin('admin-grant', { member_code: grantCode });
      if (data.ok) { toast.push('Akses AI Partner diberikan.'); setGrantCode(''); fetchData(); }
      else toast.push(data.error || 'Gagal memberi akses');
    } finally { setBusy(false); }
  };

  const handleRevoke = async (row) => {
    if (!confirm(`Cabut akses AI Partner untuk ${row.member_code}?`)) return;
    const data = await aiPartnerAdmin('admin-revoke', { id: row.id });
    if (data.ok) { toast.push('Akses dicabut.'); fetchData(); }
    else toast.push(data.error || 'Gagal mencabut akses');
  };

  const statusColor = (s) => s === 'active' ? '#3ecf8e' : s === 'expired' ? '#ffb84d' : '#888';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-4xl font-semibold text-ink mb-1">Langganan & Pembayaran</h1>
          <p className="text-ink-muted">Akses AI Partner Belajar (dari webhook Mayar atau manual) dan riwayat pembayaran Mayar.</p>
        </div>
        <button onClick={fetchData} className="btn btn-ghost text-sm px-4 py-2">
          <Icon name="refresh" className="w-4 h-4"/> Refresh
        </button>
      </div>

      <div className="card-glass p-5 mb-6 flex gap-3 flex-wrap items-end">
        <div className="flex-1 min-w-[220px]">
          <label className="text-xs uppercase tracking-wider text-gold-400 mb-2 block">Beri akses AI Partner manual</label>
          <input value={grantCode} onChange={e => setGrantCode(e.target.value)} placeholder="MSR-XXXX-XXXX"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-ink text-sm outline-none font-mono"/>
        </div>
        <button onClick={handleGrant} disabled={busy || !grantCode.trim()} className="btn btn-primary text-sm px-5 py-2.5">
          {busy ? 'Memproses...' : 'Beri Akses'}
        </button>
      </div>

      {loading ? (
        <div className="text-ink-muted text-sm">Memuat...</div>
      ) : error ? (
        <div className="text-rose-400 text-sm">{error}</div>
      ) : rows.length === 0 ? (
        <div className="text-ink-muted text-sm">Belum ada subscriber.</div>
      ) : (
        <div className="card-glass overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-soft text-xs uppercase tracking-wider border-b border-line">
                <th className="px-4 py-3">Member Code</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aktif sampai</th>
                <th className="px-4 py-3">Email/WA (Mayar)</th>
                <th className="px-4 py-3">Event Terakhir</th>
                <th className="px-4 py-3">Update Terakhir</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-line/50">
                  <td className="px-4 py-3 font-mono">{r.member_code}</td>
                  <td className="px-4 py-3">
                    <span style={{ color: statusColor(r.status) }} className="font-semibold">{r.status}</span>
                    {r.product_id === 'manual' && <span className="text-[10px] text-ink-soft ml-2">manual</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: r.expires_at && new Date(r.expires_at) < new Date() ? '#ffb84d' : undefined }}>
                    {r.expires_at ? new Date(r.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : <span className="text-ink-soft">tanpa batas</span>}
                    {r.expires_at && new Date(r.expires_at) < new Date() && <span className="text-[10px] ml-1.5">habis</span>}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{r.mayar_email || r.mayar_mobile || '-'}</td>
                  <td className="px-4 py-3 text-ink-muted">{r.last_event || '-'}</td>
                  <td className="px-4 py-3 text-ink-muted">{r.updated_at ? new Date(r.updated_at).toLocaleString('id-ID') : '-'}</td>
                  <td className="px-4 py-3 text-right">
                    {r.status === 'active' && (
                      <button onClick={() => handleRevoke(r)} className="text-xs text-rose-400 hover:text-rose-300">Cabut</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-10 mb-3">
        <h2 className="font-display text-2xl font-semibold text-ink mb-1">Tagihan (Mayar API)</h2>
        <p className="text-ink-muted text-sm">100 tagihan terakhir dari halaman Gabung & AI Partner. "Lunas" = akses sudah diaktifkan otomatis.</p>
      </div>
      {checkouts.missing ? (
        <div className="text-amber-300 text-sm">Tabel tagihan belum ada — jalankan migrations/mayar_api.sql di Supabase.</div>
      ) : checkouts.data.length === 0 ? (
        <div className="text-ink-muted text-sm">Belum ada tagihan.</div>
      ) : (
        <div className="card-glass overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-soft text-xs uppercase tracking-wider border-b border-line">
                <th className="px-4 py-3">Dibuat</th>
                <th className="px-4 py-3">Paket</th>
                <th className="px-4 py-3">Pembeli</th>
                <th className="px-4 py-3">Nominal</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Kode</th>
              </tr>
            </thead>
            <tbody>
              {checkouts.data.map(c => (
                <tr key={c.id} className="border-b border-line/50">
                  <td className="px-4 py-3 text-ink-muted whitespace-nowrap">{new Date(c.created_at).toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 text-ink">{{ library: 'Library', library_ai: 'Library + AI', ai: 'AI 30 hari' }[c.plan] || c.plan}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    <div className="text-ink">{c.name || '-'}</div>
                    <div className="text-[11px]">{c.email}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">Rp {Number(c.amount).toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-semibold" style={{ color: c.status === 'paid' ? '#3ecf8e' : c.status === 'pending' ? '#ffb84d' : '#888' }}>
                      {{ paid: 'Lunas', pending: 'Menunggu', expired: 'Kedaluwarsa' }[c.status] || c.status}
                    </span>
                    {c.paid_at && <div className="text-[10px] text-ink-soft">{new Date(c.paid_at).toLocaleString('id-ID')} · {c.paid_via === 'webhook' ? 'webhook' : 'cek status'}</div>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{c.member_code || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-10 mb-3">
        <h2 className="font-display text-2xl font-semibold text-ink mb-1">Riwayat pembayaran Mayar</h2>
        <p className="text-ink-muted text-sm">100 webhook terakhir. Kolom "Diproses" = checkout (tagihan API, lihat tabel di atas), library/ai (produk Mayar lama), error (akan diproses lagi saat Mayar mengirim ulang), atau ignored (produk lain, misalnya Nemsyi).</p>
      </div>
      {payments.length === 0 ? (
        <div className="text-ink-muted text-sm">Belum ada webhook masuk.</div>
      ) : (
        <div className="card-glass overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-soft text-xs uppercase tracking-wider border-b border-line">
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Nominal</th>
                <th className="px-4 py-3">Diproses</th>
                <th className="px-4 py-3">Kode</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={i} className="border-b border-line/50">
                  <td className="px-4 py-3 text-ink-muted whitespace-nowrap">{new Date(p.created_at).toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 text-ink-muted">{p.event}</td>
                  <td className="px-4 py-3">
                    <div className="text-ink">{p.product_name || '-'}</div>
                    {p.product_id && (
                      <button onClick={() => { navigator.clipboard.writeText(p.product_id); toast.push('Product ID tersalin'); }}
                        className="text-[10px] font-mono text-ink-soft hover:text-ink" title="Salin product ID">{p.product_id}</button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{p.customer_email || '-'}</td>
                  <td className="px-4 py-3 text-ink-muted">{p.amount != null ? `Rp ${Number(p.amount).toLocaleString('id-ID')}` : '-'}</td>
                  <td className="px-4 py-3" style={{ color: ['library', 'ai', 'checkout'].includes(p.handled_as) ? '#3ecf8e' : p.handled_as === 'error' || p.handled_as === 'checkout_amount_mismatch' ? '#f87171' : '#888' }}>{p.handled_as || '-'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.member_code || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ============== ADMIN BANK SOAL ============== */

/* ── Draf jawaban AI untuk soal approved: buat → periksa & edit → publikasikan ──
   Draf tersimpan di kolom *_draft (tidak terbaca publik). Hanya "Publikasikan" yang membuatnya tampil ke user. */
const REVIEWER_KEY = 'talqeeh_reviewer_name';
const splitSoalBlocks = (text) => {
  const t = String(text || '');
  if (!t.includes('[SOAL_ARAB]')) return t.trim() ? [{ arab: t.trim(), arti: '' }] : [];
  return t.split('[SOAL_ARAB]').slice(1).filter(b => b.trim()).map(b => {
    const [arab, arti] = b.split('[ARTI]');
    return { arab: (arab || '').replace(/\n-{3,}\s*$/, '').trim(), arti: (arti || '').replace(/\n-{3,}\s*$/, '').trim() };
  });
};
const VERIFY_RE = /\[PERLU DIVERIFIKASI/i;
const draftStatusOf = (s) => (s?.draft_status === 'published' || (Array.isArray(s?.jawaban) && s.jawaban.some(Boolean)))
  ? 'published' : (Array.isArray(s?.jawaban_draft) && s.jawaban_draft.some(Boolean)) ? 'draft' : null;

const bankSoalApi = async (action, payload) => {
  try {
    const r = await fetch('/api/admin-bank-soal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken() },
      body: JSON.stringify({ action, ...payload }),
    });
    return await r.json();
  } catch { return { ok: false, error: 'Tidak bisa terhubung ke server.' }; }
};

const BankSoalDraftPanel = ({ soal, onChanged }) => {
  const blocks = React.useMemo(() => splitSoalBlocks(soal.soal), [soal.soal]);
  const pick = (a, b, i) => (Array.isArray(a) && a[i]) || (Array.isArray(b) && b[i]) || '';
  const [jawaban, setJawaban] = useState(() => blocks.map((_, i) => pick(soal.jawaban_draft, soal.jawaban, i)));
  const [penjelasan, setPenjelasan] = useState(() => blocks.map((_, i) => pick(soal.penjelasan_draft, soal.penjelasan, i)));
  const [busy, setBusy] = useState(null);       // 'gen:3' | 'save' | 'publish' | 'unpublish'
  const [msg, setMsg] = useState('');
  const [reviewer, setReviewer] = useState(() => { try { return localStorage.getItem(REVIEWER_KEY) || ''; } catch { return ''; } });
  const [checked, setChecked] = useState(false);
  const [published, setPublished] = useState(draftStatusOf(soal) === 'published');
  const stop = React.useRef(false);

  const flagged = [...jawaban, ...penjelasan].filter(t => VERIFY_RE.test(t)).length;
  const filled = jawaban.filter(t => t.trim()).length;

  const genOne = async (i) => {
    setBusy(`gen:${i}`);
    const d = await bankSoalApi('draft-generate', { soal_id: soal.id, index: i });
    if (!d.ok) { setMsg(d.error || 'Gagal membuat draf'); return false; }
    setJawaban(a => a.map((t, k) => (k === i ? d.jawaban : t)));
    setPenjelasan(a => a.map((t, k) => (k === i ? d.penjelasan : t)));
    return true;
  };
  const genAllEmpty = async () => {
    stop.current = false; setMsg('');
    for (let i = 0; i < blocks.length; i++) {
      if (stop.current) break;
      if (jawaban[i]?.trim()) continue;
      if (!(await genOne(i))) break;
    }
    setBusy(null); onChanged?.();
  };
  const save = async () => {
    setBusy('save'); setMsg('');
    const d = await bankSoalApi('draft-save', { soal_id: soal.id, jawaban, penjelasan });
    setBusy(null); setMsg(d.ok ? 'Draf tersimpan (belum tampil ke user).' : (d.error || 'Gagal menyimpan'));
    if (d.ok) onChanged?.();
  };
  const publish = async () => {
    try { localStorage.setItem(REVIEWER_KEY, reviewer.trim()); } catch {}
    setBusy('publish'); setMsg('');
    const d = await bankSoalApi('draft-publish', { soal_id: soal.id, jawaban, penjelasan, reviewer });
    setBusy(null);
    if (d.ok) { setPublished(true); setMsg(`Terpublikasi — diperiksa oleh ${reviewer.trim()}.`); onChanged?.(); }
    else setMsg(d.error || 'Gagal mempublikasikan');
  };
  const unpublish = async () => {
    if (!confirm('Sembunyikan jawaban dari user? Draf tetap tersimpan.')) return;
    setBusy('unpublish');
    const d = await bankSoalApi('draft-unpublish', { soal_id: soal.id });
    setBusy(null);
    if (d.ok) { setPublished(false); setMsg('Jawaban disembunyikan dari user.'); onChanged?.(); } else setMsg(d.error || 'Gagal');
  };

  const area = 'w-full rounded-xl px-3 py-2 text-sm text-ink outline-none resize-y';
  const areaStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' };

  return (
    <div className="mb-5 rounded-2xl p-4" style={{ background: 'rgba(201,168,106,0.05)', border: '1px solid rgba(201,168,106,0.25)' }}>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
        <div>
          <div className="text-sm font-semibold text-ink">Draf Jawaban AI</div>
          <div className="text-xs text-ink-muted">
            {filled}/{blocks.length} blok terisi · {published ? <span className="text-emerald-300">tampil ke user</span> : 'belum tampil ke user'}
            {soal.reviewed_by && published && <> · diperiksa {soal.reviewed_by}</>}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {busy?.startsWith('gen') ? (
            <button onClick={() => { stop.current = true; }} className="btn btn-ghost text-xs px-3 py-1.5">Hentikan</button>
          ) : (
            <button onClick={genAllEmpty} disabled={!!busy || filled === blocks.length} className="btn btn-ghost text-xs px-3 py-1.5">
              ✦ Buat draf AI {filled ? '(blok kosong)' : `(${blocks.length} blok)`}
            </button>
          )}
          <button onClick={save} disabled={!!busy} className="btn btn-ghost text-xs px-3 py-1.5">{busy === 'save' ? 'Menyimpan…' : 'Simpan draf'}</button>
        </div>
      </div>
      <p className="text-[11px] text-ink-soft mb-3">
        Draf AI bisa keliru. Periksa tiap ayat, hadits, nama ulama, dan hapus semua tanda <b>[PERLU DIVERIFIKASI]</b> sebelum publikasi.
      </p>

      <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
        {blocks.map((b, i) => (
          <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-gold-300">Soal {i + 1}</span>
              <div className="flex items-center gap-2">
                {VERIFY_RE.test(jawaban[i] + penjelasan[i]) && <span className="text-[10px] text-amber-300">⚠ perlu diverifikasi</span>}
                <button onClick={async () => { setMsg(''); await genOne(i); setBusy(null); onChanged?.(); }} disabled={!!busy}
                  className="text-[11px] text-emerald-300 hover:text-emerald-200 disabled:opacity-40">
                  {busy === `gen:${i}` ? 'Membuat…' : jawaban[i] ? 'Buat ulang' : 'Buat draf'}
                </button>
              </div>
            </div>
            <div dir="rtl" className="text-[13px] text-ink-muted mb-2 line-clamp-3" style={{ fontFamily: '"Noto Naskh Arabic", serif' }}>{b.arab}</div>
            <textarea dir="rtl" rows={4} value={jawaban[i]} onChange={e => setJawaban(a => a.map((t, k) => (k === i ? e.target.value : t)))}
              placeholder="الجواب…" className={area} style={{ ...areaStyle, fontFamily: '"Noto Naskh Arabic", serif', fontSize: 15 }}/>
            <textarea rows={3} value={penjelasan[i]} onChange={e => setPenjelasan(a => a.map((t, k) => (k === i ? e.target.value : t)))}
              placeholder="Terjemah + kata kunci + catatan (Bahasa Indonesia)…" className={`${area} mt-2`} style={areaStyle}/>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-white/8 space-y-2">
        <input value={reviewer} onChange={e => setReviewer(e.target.value)} placeholder="Nama pemeriksa (asatidz / senior)"
          className="w-full rounded-xl px-3 py-2 text-sm text-ink outline-none" style={areaStyle}/>
        <label className="flex items-start gap-2 text-xs text-ink-muted">
          <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} className="mt-0.5"/>
          Saya sudah memeriksa semua jawaban & penjelasan, termasuk ayat, hadits, dan pendapat ulama.
        </label>
        {flagged > 0 && <div className="text-xs text-amber-300">Masih ada {flagged} tanda [PERLU DIVERIFIKASI] — periksa & hapus dulu.</div>}
        <div className="flex gap-2 flex-wrap">
          <button onClick={publish} disabled={!!busy || !checked || !reviewer.trim() || flagged > 0 || !filled}
            className="btn btn-primary text-xs px-4 py-2 disabled:opacity-40">
            {busy === 'publish' ? 'Mempublikasikan…' : published ? 'Perbarui jawaban yang tampil' : 'Publikasikan ke user'}
          </button>
          {published && <button onClick={unpublish} disabled={!!busy} className="btn btn-ghost text-xs px-3 py-2">Sembunyikan dari user</button>}
        </div>
        {msg && <div className="text-xs text-ink">{msg}</div>}
      </div>
    </div>
  );
};

/* ── Review soal pending di luar aplikasi (mis. oleh Claude) ──
   Ekspor: unduh file soal pending TANPA data pengirim, link foto berlaku 24 jam.
   Impor: file keputusan {"decisions":[{id, action: approve|reject|fix|skip, reason, fix:{...}}]} ditampilkan
   sebagai rekomendasi — tidak ada yang jalan sebelum admin mencentang & menekan Terapkan. */
const REVIEW_FIX_KEYS = ['maddah_id', 'maddah_nama', 'fakultas', 'tingkat', 'tahun', 'fashl', 'soal'];
const REVIEW_ACTIONS = { approve: 'Approve', reject: 'Reject', fix: 'Perbaiki info', skip: 'Lewati' };
const REVIEW_ACTION_CLS = {
  approve: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  reject:  'bg-rose-500/15 text-rose-300 border-rose-500/30',
  fix:     'bg-sky-500/15 text-sky-300 border-sky-500/30',
  skip:    'bg-white/5 text-ink-soft border-white/10',
};

const BankSoalReviewPanel = ({ onDone }) => {
  const toast = useToast();
  const [exporting, setExporting] = useState(false);
  const [rows, setRows] = useState(null);
  const [applying, setApplying] = useState(false);
  const fileRef = useRef(null);

  const [exported, setExported] = useState(null); // { name, url, count, photos } | { error }

  const download = (file) => {
    const a = document.createElement('a');
    a.href = file.url; a.download = file.name;
    document.body.appendChild(a); a.click(); a.remove();
  };

  const exportPending = async () => {
    setExporting(true);
    setExported(prev => { if (prev?.url) URL.revokeObjectURL(prev.url); return null; });
    let d;
    try {
      const r = await fetch('/api/admin-bank-soal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken() },
        body: JSON.stringify({ action: 'review-export' }),
        signal: AbortSignal.timeout(60000),
      });
      d = await r.json().catch(() => ({ ok: false, error: `Server membalas ${r.status}` }));
      if (r.status === 401) d = { ok: false, error: 'Sesi admin habis — logout lalu login ulang' };
    } catch (e) {
      d = { ok: false, error: e?.name === 'TimeoutError' ? 'Server terlalu lama (lebih dari 60 detik)' : 'Tidak bisa terhubung ke server' };
    }
    setExporting(false);
    if (!d.ok || !Array.isArray(d.data?.pending)) { setExported({ error: 'Ekspor gagal: ' + (d.error || 'Respons tidak dikenali') }); return; }
    const blob = new Blob([JSON.stringify(d.data, null, 2)], { type: 'application/json' });
    const file = {
      name: `bank-soal-pending-${new Date().toISOString().slice(0, 10)}.json`,
      url: URL.createObjectURL(blob),
      count: d.data.pending.length,
      photos: d.data.pending.filter(x => x.foto).length,
    };
    setExported(file);
    download(file);
  };

  const importDecisions = async (file) => {
    let json;
    try { json = JSON.parse(await file.text()); } catch { toast.push('File bukan JSON yang valid.'); return; }
    const decisions = Array.isArray(json) ? json : json?.decisions;
    if (!Array.isArray(decisions) || !decisions.length) { toast.push('Tidak ada "decisions" di file ini.'); return; }
    // Kalau daftar pending gagal diambil (mis. sesi admin habis), jangan tandai semua soal "tidak ditemukan".
    const list = await bankSoalApi('list', { status_filter: 'pending' });
    if (!list.ok || !Array.isArray(list.data)) {
      const msg = /unauthori/i.test(list.error || '') ? 'Sesi admin habis — logout, login lagi, lalu impor ulang file-nya.' : (list.error || 'Gagal mengambil daftar soal pending.');
      setRows(null); setExported({ error: 'Impor gagal: ' + msg }); toast.push('Impor gagal: ' + msg);
      return;
    }
    setExported(prev => (prev?.error ? null : prev));
    const byId = Object.fromEntries(list.data.map(x => [x.id, x]));
    const seen = new Set();
    const unique = decisions.filter(dec => dec?.id && !seen.has(dec.id) && seen.add(dec.id));
    const out = unique.slice(0, 300).map(dec => {
      const soal = byId[dec?.id] || null;
      const action = REVIEW_ACTIONS[dec?.action] ? dec.action : 'skip';
      const fix = Object.fromEntries(Object.entries(dec?.fix || {}).filter(([k, v]) => REVIEW_FIX_KEYS.includes(k) && v != null && String(v).trim() !== '').map(([k, v]) => [k, String(v)]));
      const needsText = action === 'approve' && !(fix.soal || soal?.soal || '').trim();
      return {
        id: dec?.id, soal, action, fix, reason: String(dec?.reason || '').slice(0, 500),
        checked: !!soal && action !== 'skip' && !needsText,
        problem: !soal ? 'Tidak ditemukan / bukan pending lagi' : needsText ? 'Teks soal kosong — parse foto dulu di Admin' : null,
        result: null,
      };
    });
    setRows(out);
  };

  const update = (i, patch) => setRows(r => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const chosen = (rows || []).filter(r => r.checked && !r.problem);
  const rejects = chosen.filter(r => r.action === 'reject').length;

  const apply = async () => {
    if (!chosen.length || applying) return;
    const msg = `Terapkan ${chosen.length} keputusan?` + (rejects ? `\n\n${rejects} soal akan di-REJECT dan pengirimnya otomatis menerima WhatsApp berisi alasannya.` : '');
    if (!confirm(msg)) return;
    setApplying(true);
    const post = (payload) => fetch('/api/bank-soal?action=approve', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken() }, body: JSON.stringify(payload),
    }).then(r => r.json()).catch(() => ({ ok: false, error: 'Tidak bisa terhubung' }));
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.checked || r.problem) continue;
      let res = { ok: true };
      if (Object.keys(r.fix).length && (r.action === 'fix' || r.action === 'approve')) {
        res = await bankSoalApi('update-info', { soal_id: r.id, ...r.fix });
      }
      if (res.ok && r.action === 'approve') res = await post({ soal_id: r.id, action: 'approve', reward_type: null, soal_teks: r.fix.soal || r.soal.soal });
      if (res.ok && r.action === 'reject') {
        if (!r.reason.trim()) res = { ok: false, error: 'Alasan reject kosong' };
        else res = await post({ soal_id: r.id, action: 'reject', reject_reason: r.reason.trim() });
      }
      update(i, { result: res.ok ? 'ok' : (res.error || 'gagal'), checked: !res.ok });
    }
    setApplying(false);
    toast.push('Keputusan diterapkan. Cek kolom hasil di tabel.');
    onDone && onDone();
  };

  return (
    <div className="card-glass p-4 mb-5">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-[220px]">
          <div className="text-sm text-ink font-medium">Review soal pending dengan Claude</div>
          <div className="text-[11px] text-ink-soft">Ekspor (tanpa nama/WA pengirim, link foto 24 jam) → kirim ke Claude → impor file keputusannya.</div>
        </div>
        <button onClick={exportPending} disabled={exporting} className="btn btn-ghost text-xs px-3 py-2">
          {exporting ? 'Mengekspor…' : 'Ekspor pending untuk review'}
        </button>
        <button onClick={() => fileRef.current?.click()} className="btn btn-primary text-xs px-3 py-2">Impor hasil review</button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) importDecisions(f); }}/>
      </div>

      {exported && (exported.error ? (
        <div className="mt-3 text-xs text-rose-400">{exported.error}</div>
      ) : (
        <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-emerald-300">✓ {exported.count} soal diekspor ({exported.photos} dengan foto) → <span className="font-mono">{exported.name}</span> di folder Download.</span>
          <button onClick={() => download(exported)} className="text-ink-soft hover:text-ink underline">Unduh lagi</button>
          <span className="text-ink-soft">Kirim file ini ke Claude hari ini (link foto berlaku 24 jam).</span>
        </div>
      ))}

      {rows && (
        <div className="mt-4">
          <div className="flex items-center gap-3 flex-wrap mb-2 text-xs">
            <span className="text-ink">{rows.length} rekomendasi · <span className="text-emerald-300">{chosen.length} dipilih</span></span>
            {rejects > 0 && <span className="text-amber-300">⚠️ Reject mengirim WhatsApp berisi alasan ke pengirim — periksa kalimatnya.</span>}
            <button onClick={() => setRows(null)} className="ms-auto text-ink-soft hover:text-ink">Tutup</button>
          </div>
          <div className="max-h-[520px] overflow-auto rounded-xl border border-white/8">
            <table className="w-full text-xs">
              <thead><tr className="text-left text-ink-soft uppercase tracking-wider border-b border-white/8">
                <th className="p-2 w-8"></th><th className="p-2">Soal</th><th className="p-2">Rekomendasi</th><th className="p-2">Alasan / perbaikan</th><th className="p-2">Hasil</th>
              </tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id || i} className="border-b border-white/5 align-top">
                    <td className="p-2"><input type="checkbox" className="accent-emerald-500" checked={r.checked} disabled={!!r.problem || r.result === 'ok'}
                      onChange={e => update(i, { checked: e.target.checked })}/></td>
                    <td className="p-2 min-w-[180px]">
                      <div className="text-ink">{r.soal ? r.soal.maddah_nama : '—'}</div>
                      <div className="text-ink-soft">{r.soal ? `tkt ${r.soal.tingkat || '?'} · ${r.soal.tahun} · ${r.soal.fashl}` : ''} <span className="font-mono">{String(r.id || '').slice(0, 8)}</span></div>
                      {r.problem && <div className="text-rose-400 mt-0.5">{r.problem}</div>}
                    </td>
                    <td className="p-2">
                      <select value={r.action} onChange={e => update(i, { action: e.target.value })} disabled={r.result === 'ok'}
                        className={`rounded-lg border px-2 py-1 bg-transparent ${REVIEW_ACTION_CLS[r.action]}`}>
                        {Object.entries(REVIEW_ACTIONS).map(([k, v]) => <option key={k} value={k} className="bg-[#161616] text-ink">{v}</option>)}
                      </select>
                    </td>
                    <td className="p-2 min-w-[260px]">
                      {r.action === 'reject' ? (
                        <textarea value={r.reason} onChange={e => update(i, { reason: e.target.value })} rows={2}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-ink" placeholder="Alasan (dikirim ke pengirim via WA)"/>
                      ) : <div className="text-ink-muted">{r.reason || '—'}</div>}
                      {Object.keys(r.fix).length > 0 && (
                        <div className="text-sky-300 mt-1">Perbaikan: {[...Object.entries(r.fix).filter(([k]) => k !== 'soal').map(([k, v]) => `${k}=${v}`), ...(r.fix.soal ? ['teks soal diisi'] : [])].join(' · ')}</div>
                      )}
                    </td>
                    <td className="p-2">{r.result === 'ok' ? <span className="text-emerald-300">✓</span> : r.result ? <span className="text-rose-400">{r.result}</span> : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-3">
            <button onClick={apply} disabled={!chosen.length || applying} className="btn btn-primary text-sm px-5 py-2">
              {applying ? 'Menerapkan…' : `Terapkan ${chosen.length} keputusan`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminBankSoal = () => {
  const [soals, setSoals]       = useState([]);
  const [stats, setStats]       = useState({ pending: 0, approved: 0, rejected: 0 });
  const [filter, setFilter]     = useState('all');
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [soalTeks, setSoalTeks] = useState('');
  const [tahunDariSoal, setTahunDariSoal] = useState(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [parsing, setParsing]   = useState(false);
  const [acting, setActing]     = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject]     = useState(false);
  const [reward, setReward]     = useState('');
  const [showEdit, setShowEdit]   = useState(false);
  const [editForm, setEditForm]   = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [savedEdit, setSavedEdit]   = useState(false);
  const [statusSoal, setStatusSoal] = useState(null);

  const fetchData = useCallback(async (statusFilter) => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        fetch('/api/admin-bank-soal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken() },
          body: JSON.stringify({ action: 'list', status_filter: statusFilter })
        }),
        fetch('/api/admin-bank-soal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken() },
          body: JSON.stringify({ action: 'stats' })
        })
      ]);
      const listData  = await listRes.json();
      const statsData = await statsRes.json();
      if (listData.ok)  setSoals(listData.data);
      if (statsData.ok) setStats(statsData.stats);
    } catch (e) {
      console.error('[AdminBankSoal] fetchData error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData('all'); }, [fetchData]);

  const handleFilterChange = (f) => { setFilter(f); fetchData(f); };

  const [signedUrl, setSignedUrl] = React.useState(null);
  const [loadingFoto, setLoadingFoto] = React.useState(false);

  const openModal = (soal) => {
    setSelected(soal);
    setSoalTeks(soal.soal || '');
    setTahunDariSoal(null);
    setRejectReason('');
    setShowReject(false);
    setReward('');
    setSignedUrl(null);
    setShowEdit(false);
    setEditForm({
      maddah_id: soal.maddah_id || '', maddah_nama: soal.maddah_nama || '', tahun: soal.tahun || '',
      fashl: soal.fashl || 'tsani', fakultas: soal.fakultas || '', tingkat: String(soal.tingkat || ''), soal: soal.soal || '',
    });
  };

  React.useEffect(() => {
    if (!selected) return;
    setStatusSoal(null);
    fetch('/api/config')
      .then(r => r.json())
      .then(({ supabaseUrl, supabaseAnonKey }) =>
        fetch(
          `${supabaseUrl}/rest/v1/bank_soal?status=eq.approved&maddah_nama=eq.${encodeURIComponent(selected.maddah_nama)}&tahun=eq.${encodeURIComponent(selected.tahun)}&fashl=eq.${encodeURIComponent(selected.fashl)}&id=neq.${selected.id}&select=id&limit=1`,
          { headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` } }
        )
      )
      .then(r => r.json())
      .then(data => {
        setStatusSoal(Array.isArray(data) && data.length > 0 ? 'ada' : 'belum');
      })
      .catch(() => setStatusSoal(null));
  }, [selected?.id]);

  React.useEffect(() => {
    if (!selected?.foto_url || selected?.foto_deleted) return;
    setSignedUrl(null);
    setLoadingFoto(true);
    fetch('/api/bank-soal?action=foto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken() },
      body: JSON.stringify({ foto_url: selected.foto_url })
    })
      .then(r => r.json())
      .then(data => { if (data.ok) setSignedUrl(data.signedUrl); })
      .catch(() => {})
      .finally(() => setLoadingFoto(false));
  }, [selected?.id]);

  const handleParse = async () => {
    if (!selected?.foto_url || selected?.foto_deleted) return;
    setParsing(true);
    try {
      const res = await fetch('/api/parse?action=soal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken() },
        body: JSON.stringify({ soal_id: selected.id, foto_url: selected.foto_url })
      });
      const data = await res.json();
      if (data.ok) {
        setSoalTeks(data.teks);
        if (data.tahun_dari_soal) setTahunDariSoal(data.tahun_dari_soal);
      } else alert('Parse gagal: ' + data.error);
    } catch (e) { alert('Error: ' + e.message); }
    finally { setParsing(false); }
  };

  const handleApprove = async () => {
    setActing(true);
    try {
      const res = await fetch('/api/bank-soal?action=approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken() },
        body: JSON.stringify({ soal_id: selected.id, action: 'approve', reward_type: reward || null, soal_teks: soalTeks })
      });
      const data = await res.json();
      if (data.ok) { setSelected(null); fetchData(filter); }
      else alert('Approve gagal: ' + data.error);
    } catch (e) { alert('Error: ' + e.message); }
    finally { setActing(false); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { alert('Isi alasan penolakan terlebih dahulu'); return; }
    setActing(true);
    try {
      const res = await fetch('/api/bank-soal?action=approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken() },
        body: JSON.stringify({ soal_id: selected.id, action: 'reject', reject_reason: rejectReason })
      });
      const data = await res.json();
      if (data.ok) { setSelected(null); fetchData(filter); }
      else alert('Reject gagal: ' + data.error);
    } catch (e) { alert('Error: ' + e.message); }
    finally { setActing(false); }
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      const payload = {
        soal_id: selected.id,
        maddah_id: editForm.maddah_id, maddah_nama: editForm.maddah_nama,
        fakultas: editForm.fakultas, tingkat: editForm.tingkat,
        tahun: editForm.tahun, fashl: editForm.fashl,
      };
      // Soal pending diedit lewat kolom teks di bawah (ikut terkirim saat Approve).
      if (selected.status === 'approved' && editForm.soal !== (selected.soal || '')) payload.soal = editForm.soal;
      const d = await bankSoalApi('update-info', payload);
      if (d.ok) {
        setSelected(d.soal);
        if (payload.soal) setSoalTeks(d.soal.soal || '');
        setSavedEdit(true);
        setTimeout(() => setSavedEdit(false), 2500);
        fetchData(filter);
      } else {
        alert('Gagal edit: ' + (d.error || 'unknown'));
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const editMaddahOptions = React.useMemo(() => {
    const all = typeof MADDAHS !== 'undefined' ? MADDAHS : [];
    const fak = editForm.fakultas;
    return (fak ? all.filter(m => (m.fakultas || []).includes(fak)) : all)
      .slice().sort((x, y) => x.name.localeCompare(y.name));
  }, [editForm.fakultas]);
  const editTingkatHint = React.useMemo(() => {
    const m = editForm.maddah_id && typeof getMaddahById !== 'undefined' ? getMaddahById(editForm.maddah_id) : null;
    const list = (m?.tingkat || []).filter(t => /^[1-5]$/.test(t));
    if (!m || !list.length || !editForm.tingkat || list.includes(editForm.tingkat)) return '';
    return `Di katalog, ${m.name} tercatat di tingkat ${list.join(', ')}.`;
  }, [editForm.maddah_id, editForm.tingkat]);

  const STATUS_BADGE = {
    pending:  'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    approved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    rejected: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-xl font-semibold text-ink mb-1">Bank Soal Imtihan</h2>
        <p className="text-sm text-ink-muted">Review, parse dengan AI, approve/reject soal dari kontributor.</p>
      </div>

      <BankSoalReviewPanel onDone={() => fetchData(filter)}/>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Pending', val: stats.pending, cls: 'text-yellow-300' },
          { label: 'Approved', val: stats.approved, cls: 'text-emerald-300' },
          { label: 'Rejected', val: stats.rejected, cls: 'text-rose-300' },
        ].map(s => (
          <div key={s.label} className="card-glass p-4 text-center">
            <div className={`text-3xl font-bold ${s.cls}`}>{s.val}</div>
            <div className="text-xs text-ink-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { key: 'all', label: 'Semua' },
          { key: 'pending', label: 'Pending' },
          { key: 'approved', label: 'Approved' },
          { key: 'rejected', label: 'Rejected' },
        ].map(f => (
          <button key={f.key} onClick={() => handleFilterChange(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${filter === f.key ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30' : 'text-ink-muted border-white/10 hover:bg-white/5'}`}>
            {f.label}
          </button>
        ))}
        <button onClick={() => fetchData(filter)} className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-ink-muted hover:bg-white/5 ml-auto">
          ↻ Refresh
        </button>
      </div>


      {/* Tabel */}
      {loading ? (
        <div className="text-center py-16 text-ink-muted text-sm">Memuat data...</div>
      ) : soals.length === 0 ? (
        <div className="text-center py-16 text-ink-muted text-sm">Tidak ada data{filter !== 'all' ? ` dengan status ${filter}` : ''}</div>
      ) : (
        <div className="card-glass overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-white/8">
                {['Nama / WA', 'Fakultas', 'Maddah', 'Tahun', 'Fashl', 'Status', 'Tanggal', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-ink-muted font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {soals.map(s => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/3 cursor-pointer" onClick={() => openModal(s)}>
                  <td className="px-4 py-3">
                    <div className="text-ink font-medium text-xs">{s.submitter_name}</div>
                    <div className="text-ink-muted text-xs">{s.submitter_wa}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-muted text-xs">
                    {(() => {
                      const faculties = typeof FACULTIES !== 'undefined' ? FACULTIES : [];
                      const found = faculties.find(f => f.id === s.fakultas);
                      return found ? found.label : (s.fakultas || '-');
                    })()}
                  </td>
                  <td className="px-4 py-3 text-ink-muted text-xs max-w-[140px] truncate">{s.maddah_nama}</td>
                  <td className="px-4 py-3 text-ink-muted text-xs">{s.tahun}</td>
                  <td className="px-4 py-3 text-ink-muted text-xs">{s.fashl}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_BADGE[s.status] || ''}`}>
                      {s.status}
                    </span>
                    {s.status === 'approved' && (() => {
                      const d = draftStatusOf(s);
                      return <div className={`text-[10px] mt-1 ${d === 'published' ? 'text-emerald-300' : d === 'draft' ? 'text-amber-300' : 'text-ink-soft'}`}>
                        {d === 'published' ? 'Jawaban terbit' : d === 'draft' ? 'Draf jawaban' : 'Belum ada jawaban'}
                      </div>;
                    })()}
                  </td>
                  <td className="px-4 py-3 text-ink-muted text-xs">{s.created_at?.slice(0,10)}</td>
                  <td className="px-4 py-3" style={{ whiteSpace: 'nowrap' }}>
                    <span className="text-xs text-emerald-400 hover:text-emerald-200">Detail →</span>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!confirm(`Hapus submission dari ${s.submitter_name}?`)) return;
                        const res = await fetch('/api/bank-soal?action=delete', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken() },
                          body: JSON.stringify({ soal_id: s.id })
                        });
                        const data = await res.json();
                        if (data.ok) fetchData(filter);
                        else alert('Gagal: ' + data.error);
                      }}
                      style={{
                        padding: '4px 10px', borderRadius: 6,
                        border: '1px solid rgba(255,80,80,0.2)',
                        background: 'rgba(255,80,80,0.06)',
                        color: '#ff8080', fontSize: 11,
                        cursor: 'pointer', marginLeft: 8,
                      }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal detail */}
      {selected && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-start justify-center p-4 overflow-y-auto"
          onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="w-full max-w-2xl mt-8 mb-8 rounded-2xl border border-white/10 bg-[#111] overflow-hidden shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div>
                <h3 className="font-display text-base font-semibold text-ink">Detail Submission</h3>
                <p className="text-xs text-ink-muted">{selected.maddah_nama} · {selected.tahun} · {selected.fashl}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => setShowEdit(e => !e)}
                  style={{
                    padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: showEdit ? 'rgba(62,207,142,0.15)' : 'rgba(255,255,255,0.05)',
                    color: showEdit ? '#3ecf8e' : '#aaa', cursor: 'pointer',
                  }}>
                  ✏️ Edit Info
                </button>
                <button onClick={() => setSelected(null)} className="text-ink-muted hover:text-ink text-2xl leading-none">×</button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Panel Edit Info */}
              {showEdit && (
                <div style={{
                  padding: '14px 16px', borderRadius: 12,
                  background: 'rgba(62,207,142,0.05)',
                  border: '1px solid rgba(62,207,142,0.2)',
                  marginBottom: 4,
                }}>
                  <div style={{ fontSize: 11, color: '#3ecf8e', fontWeight: 700, marginBottom: 12, letterSpacing: 0.5 }}>
                    EDIT INFO SOAL
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: 10, color: '#888', fontWeight: 600, display: 'block', marginBottom: 4 }}>MADDAH</label>
                      <select
                        value={editForm.maddah_id || ''}
                        onChange={e => {
                          const m = (typeof getMaddahById !== 'undefined' && getMaddahById(e.target.value)) || null;
                          setEditForm(f => ({ ...f, maddah_id: e.target.value, maddah_nama: m ? m.name : f.maddah_nama }));
                        }}
                        style={{
                          width: '100%', padding: '7px 10px', borderRadius: 7,
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: '#1a1a1a', color: '#fff',
                          fontSize: 13, boxSizing: 'border-box',
                        }}
                      >
                        {!editMaddahOptions.some(m => m.id === editForm.maddah_id) && (
                          <option value={editForm.maddah_id || ''}>{editForm.maddah_nama || '-- Pilih Maddah --'}</option>
                        )}
                        {editMaddahOptions.map(m => (
                          <option key={m.id} value={m.id}>{m.name}{m.nameArabic ? ` — ${m.nameArabic}` : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 10, color: '#888', fontWeight: 600, display: 'block', marginBottom: 4 }}>TAHUN</label>
                      <input
                        value={editForm.tahun || ''}
                        onChange={e => setEditForm(f => ({ ...f, tahun: e.target.value }))}
                        placeholder="2025/2026"
                        style={{
                          width: '100%', padding: '7px 10px', borderRadius: 7,
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.05)', color: '#fff',
                          fontSize: 13, boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, color: '#888', fontWeight: 600, display: 'block', marginBottom: 4 }}>FASHL</label>
                      <select
                        value={editForm.fashl || 'tsani'}
                        onChange={e => setEditForm(f => ({ ...f, fashl: e.target.value }))}
                        style={{
                          width: '100%', padding: '7px 10px', borderRadius: 7,
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: '#1a1a1a', color: '#fff',
                          fontSize: 13, boxSizing: 'border-box',
                        }}
                      >
                        <option value="awwal">Fashl Awwal</option>
                        <option value="tsani">Fashl Tsani</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 10, color: '#888', fontWeight: 600, display: 'block', marginBottom: 4 }}>FAKULTAS</label>
                      <select
                        value={editForm.fakultas || ''}
                        onChange={e => setEditForm(f => ({ ...f, fakultas: e.target.value }))}
                        style={{
                          width: '100%', padding: '7px 10px', borderRadius: 7,
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: '#1a1a1a', color: '#fff',
                          fontSize: 13, boxSizing: 'border-box',
                        }}
                      >
                        <option value="">-- Pilih Fakultas --</option>
                        {(typeof FACULTIES !== 'undefined' ? FACULTIES.filter(f => !f.isMahad) : []).map(f => (
                          <option key={f.id} value={f.id}>{f.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 10, color: '#888', fontWeight: 600, display: 'block', marginBottom: 4 }}>TINGKAT</label>
                      <select
                        value={editForm.tingkat || ''}
                        onChange={e => setEditForm(f => ({ ...f, tingkat: e.target.value }))}
                        style={{
                          width: '100%', padding: '7px 10px', borderRadius: 7,
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: '#1a1a1a', color: '#fff',
                          fontSize: 13, boxSizing: 'border-box',
                        }}
                      >
                        <option value="">-- Pilih Tingkat --</option>
                        {['1', '2', '3', '4', '5'].map(t => <option key={t} value={t}>Tingkat {t}</option>)}
                      </select>
                      {editTingkatHint && (
                        <div style={{ fontSize: 10, color: '#e0b85c', marginTop: 4 }}>{editTingkatHint}</div>
                      )}
                    </div>
                  </div>
                  {selected.status === 'approved' && (
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 10, color: '#888', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                        TEKS SOAL <span style={{ fontWeight: 400 }}>(untuk koreksi salah ketik / OCR)</span>
                      </label>
                      <textarea
                        value={editForm.soal || ''}
                        onChange={e => setEditForm(f => ({ ...f, soal: e.target.value }))}
                        rows={8} dir="auto"
                        style={{
                          width: '100%', padding: '8px 10px', borderRadius: 7,
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.05)', color: '#fff',
                          fontSize: 12, fontFamily: 'monospace', boxSizing: 'border-box', resize: 'vertical',
                        }}
                      />
                    </div>
                  )}
                  <button
                    onClick={handleSaveEdit}
                    disabled={savingEdit}
                    style={{
                      width: '100%', padding: '9px', borderRadius: 8,
                      border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      background: savedEdit ? 'rgba(62,207,142,0.2)' : '#3ecf8e',
                      color: savedEdit ? '#3ecf8e' : '#000',
                      opacity: savingEdit ? 0.6 : 1,
                    }}
                  >
                    {savingEdit ? 'Menyimpan...' : savedEdit ? '✅ Tersimpan' : '💾 Simpan Perubahan'}
                  </button>
                </div>
              )}

              {/* Info grid */}
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['Nama', selected.submitter_name],
                    ['WhatsApp', selected.submitter_wa],
                    ['Fakultas', selected.fakultas],
                    ['Tingkat', selected.tingkat || '-'],
                    ['Tahun', selected.tahun],
                    ['Fashl', selected.fashl],
                  ].map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ color: '#888', fontSize: 13, padding: '8px 0', width: 120 }}>{k}</td>
                      <td style={{ fontSize: 13, fontWeight: 600, color: '#fff', paddingBottom: 8, paddingTop: 8 }}>{v}</td>
                    </tr>
                  ))}
                  {/* Baris Status + AI Parsed */}
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ color: '#888', fontSize: 13, padding: '8px 0', width: 120 }}>Status</td>
                    <td style={{ fontSize: 13, fontWeight: 600, color: '#fff', paddingBottom: 8, paddingTop: 8 }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 99, fontSize: 12,
                        background: selected.status === 'approved'
                          ? 'rgba(62,207,142,0.15)' : selected.status === 'rejected'
                          ? 'rgba(248,113,113,0.12)' : 'rgba(255,255,255,0.08)',
                        color: selected.status === 'approved' ? '#3ecf8e'
                          : selected.status === 'rejected' ? '#f87171' : '#aaa',
                      }}>
                        {selected.status}
                      </span>
                    </td>
                    <td style={{ color: '#888', fontSize: 13, padding: '8px 0', width: 120 }}>AI Parsed</td>
                    <td style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                      {selected.ai_parsed ? 'Sudah' : 'Belum'}
                    </td>
                  </tr>
                  {/* Baris Bank Soal */}
                  <tr>
                    <td style={{ color: '#888', fontSize: 13, padding: '8px 0' }}>Bank Soal</td>
                    <td colSpan={3} style={{ paddingTop: 8, paddingBottom: 8 }}>
                      {statusSoal === null ? (
                        <span style={{ fontSize: 12, color: '#555' }}>Mengecek...</span>
                      ) : statusSoal === 'ada' ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          fontSize: 12, fontWeight: 700,
                          padding: '4px 12px', borderRadius: 99,
                          background: 'rgba(251,191,36,0.1)',
                          border: '1px solid rgba(251,191,36,0.3)',
                          color: '#fbbf24',
                        }}>
                          ⚠️ Sudah ada soal ini — kemungkinan duplikat
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          fontSize: 12, fontWeight: 700,
                          padding: '4px 12px', borderRadius: 99,
                          background: 'rgba(62,207,142,0.1)',
                          border: '1px solid rgba(62,207,142,0.25)',
                          color: '#3ecf8e',
                        }}>
                          ✦ Belum ada — soal baru!
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Foto */}
              <div>
                <div className="text-xs text-ink-muted mb-2 font-medium uppercase tracking-wide">Foto Soal</div>
                {selected.foto_deleted ? (
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, color: '#888', fontSize: 13, textAlign: 'center' }}>
                    🗑️ Foto sudah dihapus setelah di-parse
                  </div>
                ) : loadingFoto ? (
                  <div style={{ padding: '12px', color: '#888', fontSize: 13, textAlign: 'center' }}>
                    Memuat foto...
                  </div>
                ) : signedUrl ? (
                  <img
                    src={signedUrl}
                    alt="Foto soal"
                    style={{ width: '100%', borderRadius: 8, maxHeight: 400, objectFit: 'contain', background: '#1a1a1a' }}
                  />
                ) : (
                  <div style={{ padding: '12px', color: '#888', fontSize: 13, textAlign: 'center' }}>
                    Foto tidak tersedia
                  </div>
                )}
              </div>

              {/* Parse AI button */}
              {selected.foto_url && !selected.foto_deleted && selected.status === 'pending' && (
                <button onClick={handleParse} disabled={parsing}
                  className="w-full py-2.5 rounded-xl text-sm border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-50 transition font-medium">
                  {parsing ? '⏳ AI sedang membaca foto...' : '🤖 Parse Teks dengan AI'}
                </button>
              )}

              {/* Info tahun dari kertas soal */}
              {tahunDariSoal && (
                <div style={{
                  marginBottom: 10, padding: '8px 12px',
                  background: tahunDariSoal === selected.tahun
                    ? 'rgba(62,207,142,0.08)'
                    : 'rgba(255,200,50,0.08)',
                  border: `1px solid ${tahunDariSoal === selected.tahun
                    ? 'rgba(62,207,142,0.25)'
                    : 'rgba(255,200,50,0.3)'}`,
                  borderRadius: 8, fontSize: 12,
                }}>
                  {tahunDariSoal === selected.tahun ? (
                    <span style={{ color: '#3ecf8e' }}>
                      ✅ Tahun di kertas soal: <strong>{tahunDariSoal}</strong> — sesuai dengan submission
                    </span>
                  ) : (
                    <span style={{ color: '#ffc832' }}>
                      ⚠️ Tahun di kertas soal: <strong>{tahunDariSoal}</strong> — berbeda dengan yang disubmit ({selected.tahun || 'tidak ada'})
                    </span>
                  )}
                </div>
              )}

              {/* Preview hasil parse — tampilkan Arab + arti per soal */}
              {soalTeks && soalTeks.includes('[SOAL_ARAB]') && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#888', fontWeight: 600, marginBottom: 8 }}>
                    PREVIEW HASIL PARSE
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10, padding: '12px 14px',
                    maxHeight: 300, overflowY: 'auto',
                  }}>
                    {soalTeks.split('[SOAL_ARAB]').slice(1).filter(b => b.trim()).map((block, i) => {
                      const parts = block.split('[ARTI]');
                      const arab  = parts[0]?.trim();
                      const arti  = parts[1]?.trim();
                      const total = soalTeks.split('[SOAL_ARAB]').slice(1).filter(b => b.trim()).length;
                      return (
                        <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < total - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                          {arab && (
                            <div style={{ direction: 'rtl', textAlign: 'right', fontSize: 15, color: '#eee', lineHeight: 2, fontFamily: 'serif', marginBottom: 8 }}>
                              {arab}
                            </div>
                          )}
                          {arti && (
                            <div style={{ fontSize: 13, color: '#3ecf8e', lineHeight: 1.6, paddingLeft: 12, borderLeft: '2px solid rgba(62,207,142,0.3)' }}>
                              {arti}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Textarea raw untuk edit manual */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#888', fontWeight: 600, marginBottom: 6 }}>
                  TEKS SOAL RAW (BISA DIEDIT)
                </div>
                <textarea
                  value={soalTeks}
                  onChange={e => setSoalTeks(e.target.value)}
                  readOnly={selected.status !== 'pending'}
                  rows={6}
                  placeholder="Teks soal akan muncul di sini setelah di-parse, atau isi manual..."
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 9,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)', color: '#fff',
                    fontSize: 13, resize: 'vertical', boxSizing: 'border-box',
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              {selected.status === 'approved' && (
                <BankSoalDraftPanel key={selected.id} soal={selected} onChanged={() => fetchData(filter)}/>
              )}

              {/* Tombol Salin Prompt */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  background: 'rgba(62,207,142,0.06)',
                  border: '1px solid rgba(62,207,142,0.2)',
                  borderRadius: 12,
                  padding: '14px 16px',
                }}>
                  <div style={{ fontSize: 12, color: '#3ecf8e', fontWeight: 700, marginBottom: 6 }}>
                    💡 Generate Jawaban dengan AI
                  </div>
                  <div style={{ fontSize: 12, color: '#aaa', lineHeight: 1.6, marginBottom: 12 }}>
                    Salin prompt ini → paste ke Claude → dapat arti, jawaban Arab, dan penjelasan → isi ke field di bawah.
                  </div>
                  <button
                    onClick={() => {
                      const prompt = `Kamu adalah asisten akademik yang membantu menjawab soal ujian tahriri dari Universitas Al-Azhar Kairo.

SOAL YANG PERLU DIJAWAB:
${soalTeks || '[Soal belum di-parse — parse dulu dengan AI]'}

INFORMASI KONTEKS:
- Maddah: ${selected.maddah_nama || '-'}
- Fakultas: ${selected.fakultas || '-'}
- Tingkat: ${selected.tingkat || '-'}
- Tahun: ${selected.tahun || '-'} ${selected.fashl === 'awwal' ? 'Fashl Awwal' : 'Fashl Tsani'}

TUGAS KAMU — berikan 3 hal berikut secara terpisah dan terstruktur:

═══════════════════════════════
1. ARTI SOAL (Bahasa Indonesia)
═══════════════════════════════
Terjemahkan soal di atas ke dalam bahasa Indonesia yang jelas dan natural. Pertahankan istilah teknis fiqih/ushul/nahwu dalam bahasa Arab (dengan terjemahan dalam kurung). Jangan tambahkan penjelasan — hanya terjemahan.

═══════════════════════════════
2. JAWABAN (Bahasa Arab)
═══════════════════════════════
Jawaban ujian dalam bahasa Arab fushah yang bisa LANGSUNG ditulis mahasiswa di lembar jawaban: satu kalimat pembuka (ta'rif atau inti jawaban) → poin bernomor (أولًا، ثانيًا …) sesuai yang diminta soal → dalil bila yakin → kesimpulan/tarjih singkat bila diminta. Tandai bagian yang tidak yakin dengan [PERLU DIVERIFIKASI: ...].

═══════════════════════════════
3. PENJELASAN (Bahasa Indonesia)
═══════════════════════════════
Terjemah:
(terjemahan jawaban Arab di atas, urut per paragraf/nomor yang sama — natural dan mudah dipahami)

Kata kunci:
- (3–5 istilah Arab berharakat yang wajib muncul — arti singkat)

Catatan: (1–2 kalimat: apa yang dicari dosen atau kesalahan yang sering terjadi)

${window.JAWABAN_RULES || ''}

Format output: gunakan persis 3 section dengan header yang sama seperti di atas.`;

                      navigator.clipboard.writeText(prompt)
                        .then(() => {
                          setCopiedPrompt(true);
                          setTimeout(() => setCopiedPrompt(false), 3000);
                        })
                        .catch(() => alert('Gagal salin — coba manual'));
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      borderRadius: 9,
                      border: '1px solid rgba(62,207,142,0.4)',
                      background: 'rgba(62,207,142,0.1)',
                      color: '#3ecf8e',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {copiedPrompt ? '✅ Prompt Tersalin! Paste ke Claude sekarang' : '📋 Salin Prompt untuk Claude'}
                  </button>
                  <div style={{ marginTop: 10, fontSize: 11, color: '#666', lineHeight: 1.6 }}>
                    ⚠️ Setelah dapat jawaban dari Claude: cek bagian <strong style={{ color: '#888' }}>[PERLU DIVERIFIKASI]</strong> sebelum approve. Ayat & hadits wajib dicek ulang ke sumber aslinya.
                  </div>
                </div>
              </div>

              {selected.status === 'pending' && (
                <div style={{
                  marginBottom: 20, padding: '12px 14px',
                  background: 'rgba(255,200,50,0.06)',
                  border: '1px solid rgba(255,200,50,0.2)',
                  borderRadius: 10, fontSize: 13, color: '#a08030',
                }}>
                  💡 Input jawaban per soal tersedia setelah submission di-approve.
                </div>
              )}

              {/* Reject reason */}
              {selected.status === 'rejected' && selected.reject_reason && (
                <div className="bg-rose-500/8 border border-rose-500/20 rounded-xl px-4 py-3">
                  <div className="text-xs text-rose-300 font-medium mb-1">Alasan Penolakan:</div>
                  <div className="text-sm text-ink">{selected.reject_reason}</div>
                </div>
              )}

              {/* Action panel — only for pending */}
              {selected.status === 'pending' && (
                <div className="space-y-3 border-t border-white/8 pt-4">
                  {/* Reward selector */}
                  <div>
                    <div className="text-xs text-ink-muted mb-2 font-medium">Reward untuk submitter (opsional):</div>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { value: null,       label: 'Tanpa Reward',          icon: '—'  },
                        { value: 'lifetime', label: 'Library Gratis',         icon: '🎓' },
                        { value: 'diskon',   label: 'Diskon',                 icon: '🏷️' },
                        { value: 'voucher',  label: 'Voucher Makan',          icon: '🍽️' },
                        { value: 'poin',     label: 'Badge + Hall of Fame',   icon: '🏅' },
                      ].map(opt => (
                        <button
                          key={String(opt.value)}
                          onClick={() => setReward(opt.value)}
                          style={{
                            padding: '7px 14px',
                            borderRadius: 8,
                            border: reward === opt.value
                              ? '1px solid #3ecf8e'
                              : '1px solid rgba(255,255,255,0.1)',
                            background: reward === opt.value
                              ? 'rgba(62,207,142,0.15)'
                              : 'rgba(255,255,255,0.03)',
                            color: reward === opt.value ? '#3ecf8e' : '#aaa',
                            fontSize: 12,
                            fontWeight: reward === opt.value ? 700 : 400,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {opt.icon} {opt.label}
                        </button>
                      ))}
                    </div>

                    {reward === 'voucher' && (
                      <div style={{
                        marginTop: 10, padding: '10px 12px',
                        background: 'rgba(255,200,50,0.06)',
                        border: '1px solid rgba(255,200,50,0.2)',
                        borderRadius: 8, fontSize: 12, color: '#a08030',
                      }}>
                        ⚠️ Rp 25rb untuk 1 termin penuh, Rp 50rb untuk 2 termin penuh (member); non-member 2 termin dapat Library + Rp 25rb.
                        Voucher diklaim manual via japri — kamu yang proses transfernya.
                      </div>
                    )}
                    {reward === 'lifetime' && (
                      <div style={{
                        marginTop: 10, padding: '10px 12px',
                        background: 'rgba(62,207,142,0.06)',
                        border: '1px solid rgba(62,207,142,0.15)',
                        borderRadius: 8, fontSize: 12, color: '#3ecf8e',
                      }}>
                        ✅ Buat member baru di tab Member (tanpa email) — kamu akan dapat PIN aktivasi untuk dikirim ke submitter.
                        Library gratis tidak termasuk AI Partner.
                      </div>
                    )}
                  </div>

                  {/* Reject reason input */}
                  {showReject && (
                    <div>
                      <div className="text-xs text-ink-muted mb-2">Alasan penolakan:</div>
                      <input
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        placeholder="mis. Foto blur, bukan soal Azhar, duplikat, dll"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-rose-500/40"
                      />
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3 flex-wrap">
                    <button onClick={handleApprove} disabled={acting}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 text-black disabled:opacity-50 hover:bg-emerald-400 transition">
                      {acting ? '⏳ Memproses...' : '✅ Approve'}
                    </button>
                    {!showReject ? (
                      <button onClick={() => setShowReject(true)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 transition">
                        ❌ Reject
                      </button>
                    ) : (
                      <button onClick={handleReject} disabled={acting}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 disabled:opacity-40 transition">
                        {acting ? '⏳...' : 'Konfirmasi Reject →'}
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        if (!confirm(`Hapus submission ini permanent?\n\nNama: ${selected.submitter_name}\nMaddah: ${selected.maddah_nama}\n\nTindakan ini tidak bisa dibatalkan.`)) return;
                        try {
                          const res = await fetch('/api/bank-soal?action=delete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken() },
                            body: JSON.stringify({ soal_id: selected.id })
                          });
                          const data = await res.json();
                          if (data.ok) {
                            alert('✅ Submission berhasil dihapus.');
                            setSelected(null);
                            fetchData(filter);
                          } else {
                            alert('Gagal hapus: ' + data.error);
                          }
                        } catch (err) {
                          alert('Error: ' + err.message);
                        }
                      }}
                      style={{
                        padding: '9px 16px', borderRadius: 9,
                        border: '1px solid rgba(255,80,80,0.3)',
                        background: 'rgba(255,80,80,0.08)',
                        color: '#ff8080', fontSize: 12, fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      🗑️ Hapus Permanent
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

window.AdminPage = AdminPage;
