import React, { useState, useEffect, useRef } from 'react';
/* Talqeeh — Gerbang akses materi seminar (/seminar).
   Akses: PIN per orang (dibuat admin) ATAU member berbayar yang login. Isi materi dikirim dari server (api/seminar.js)
   hanya setelah akses valid; tidak ada di kode situs. */

const SEMINAR_TOKEN_KEY = "talqeeh_seminar_token";
const readSeminarToken = () => { try { return localStorage.getItem(SEMINAR_TOKEN_KEY) || ""; } catch { return ""; } };
const saveSeminarToken = (t) => { try { if (t) localStorage.setItem(SEMINAR_TOKEN_KEY, t); else localStorage.removeItem(SEMINAR_TOKEN_KEY); } catch {} };

const seminarCall = async (action, extra = {}) => {
  const token = readSeminarToken();
  const opts = { method: "POST", headers: token ? { "x-seminar-token": token } : {}, body: JSON.stringify({ action, ...extra }) };
  try {
    const r = await window.authFetch("/api/seminar", opts);
    let data = null;
    try { data = await r.json(); } catch {}
    return { status: r.status, data };
  } catch {
    return { status: 0, data: null };
  }
};

const PIN_ERRORS = {
  invalid: "PIN tidak dikenal. Periksa kembali, lalu coba lagi.",
  revoked: "PIN ini sudah dicabut. Hubungi panitia.",
  expired: "PIN ini sudah kedaluwarsa. Hubungi panitia.",
  rate_limited: "Terlalu banyak percobaan hari ini. Coba lagi besok atau hubungi panitia.",
};

const seminarLogout = () => {
  saveSeminarToken("");
  window.SEMINAR_SESSION = null;
  window.location.reload();
};

// "abcd efgh" -> "ABCD-EFGH" sambil mengetik
const formatPin = (raw) => {
  const c = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
  return c.length > 4 ? c.slice(0, 4) + "-" + c.slice(4) : c;
};

const SeminarGate = ({ view = "baca" }) => {
  const auth = useAuth();
  const [phase, setPhase] = useState(window.SEMINAR_SESSION ? "ready" : "checking"); // checking | pin | ready | error
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const hadToken = useRef(!!readSeminarToken());
  const signedEmail = (auth && ((auth.authInfo && auth.authInfo.email) || (auth.session && auth.session.email))) || "";
  const loginForSeminar = () => {
    try { sessionStorage.setItem("talqeeh_return_to", JSON.stringify({ path: "/seminar", at: Date.now() })); } catch {}
    window.dispatchEvent(new CustomEvent("talqeeh:open-login", { detail: { keepPlan: false } }));
  };

  const load = async () => {
    setPhase("checking");
    const { status, data } = await seminarCall("content");
    if (data && data.ok) {
      window.seminarInit(data.content);
      window.SEMINAR_SESSION = { via: data.via, label: data.label };
      setPhase("ready");
    } else if (status === 403) {
      if (readSeminarToken()) { saveSeminarToken(""); if (hadToken.current) setMsg("Akses Anda sudah tidak berlaku. Masukkan PIN yang baru."); }
      setPhase("pin");
    } else if (status === 404) {
      setMsg("Materi belum dipasang di server. Hubungi panitia.");
      setPhase("error");
    } else {
      setMsg("Layanan sedang tidak bisa dijangkau. Periksa koneksi, lalu coba lagi.");
      setPhase("error");
    }
  };

  useEffect(() => { if (!window.SEMINAR_SESSION) load(); }, []);
  // Member login lewat Google saat gerbang terbuka: cek ulang otomatis.
  useEffect(() => { if (phase === "pin" && signedEmail) load(); }, [signedEmail]);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (pin.replace("-", "").length !== 8) { setMsg("PIN terdiri dari 8 karakter, contoh ABCD-EFGH."); return; }
    setBusy(true); setMsg("");
    const { status, data } = await seminarCall("verify", { pin });
    setBusy(false);
    if (data && data.ok) { saveSeminarToken(data.token); hadToken.current = false; await load(); return; }
    setMsg(status === 429 ? PIN_ERRORS.rate_limited : (data && PIN_ERRORS[data.error]) || "Layanan sedang bermasalah. Coba lagi sebentar.");
  };

  if (phase === "ready") {
    if (view === "slides") return <SeminarSlidesPage/>;
    if (view === "pemateri") return <SeminarGuidePage/>;
    return <SeminarAiPage/>;
  }

  return (
    <div className="page-enter">
      <PageHeader
        kicker="Materi Seminar"
        arabic="الذكاء الاصطناعي في التعليم"
        title="Materi khusus peserta."
        subtitle="Login dengan akun Google yang emailnya didaftarkan panitia, atau masukkan PIN pribadi."
      />
      <section className="pb-24">
        <div className="container-x max-w-xl">
          {phase === "checking" && (
            <div className="card-glass p-8 text-center text-ink-muted" role="status">Memeriksa akses...</div>
          )}

          {phase === "error" && (
            <div className="card-glass p-6 md:p-8">
              <p className="text-ink mb-4" role="alert">{msg}</p>
              <button onClick={load} className="btn btn-ghost text-sm py-2.5">Coba lagi</button>
            </div>
          )}

          {phase === "pin" && (
            <form onSubmit={submit} className="card-glass-strong p-6 md:p-8" noValidate>
              <label htmlFor="seminar-pin" className="block text-sm font-medium text-ink mb-1.5">PIN akses</label>
              <p className="text-xs text-ink-muted mb-3 leading-snug">PIN bersifat pribadi dan terdiri dari 8 karakter, contoh ABCD-EFGH.</p>
              <input
                id="seminar-pin" value={pin} onChange={(e) => setPin(formatPin(e.target.value))}
                inputMode="text" autoCapitalize="characters" autoComplete="off" autoCorrect="off" spellCheck={false} maxLength={9}
                aria-invalid={!!msg} aria-describedby="seminar-pin-msg"
                className="code-input w-full rounded-lg bg-black/30 border border-white/15 focus:border-gold-500 focus:outline-none px-4 py-3 text-ink text-xl"
                placeholder="ABCD-EFGH" style={{ fontSize: 22 }}/>
              <p id="seminar-pin-msg" role="alert" className="text-sm text-rose-600 min-h-[1.5rem] mt-2">{msg}</p>
              <button type="submit" disabled={busy} className="btn btn-gold w-full justify-center text-sm py-3 mt-2 disabled:opacity-60">
                {busy ? "Memeriksa..." : "Buka materi"}
              </button>

              <div className="mt-6 pt-5 border-t border-white/10 text-sm text-ink-muted leading-relaxed">
                <p className="mb-3">Tanpa PIN: login dengan akun Google yang emailnya didaftarkan panitia. Member Talqeeh berbayar juga langsung masuk.</p>
                {signedEmail && (
                  <div className="mb-3" role="status">
                    <p className="text-gold-300">Anda login sebagai {signedEmail}. Akun ini belum diaktifkan untuk seminar. Mohon tunggu panitia mengaktifkannya, lalu tekan Periksa lagi. Atau masukkan PIN.</p>
                    <button type="button" onClick={load} className="btn btn-ghost text-sm py-2.5 mt-3"><Icon name="refresh" className="w-4 h-4"/> Periksa lagi</button>
                  </div>
                )}
                {!signedEmail && (
                  <button type="button" onClick={loginForSeminar} className="btn btn-ghost text-sm py-2.5">
                    <Icon name="user" className="w-4 h-4"/> Login dengan Google
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

Object.assign(window, { SeminarGate, seminarLogout });
