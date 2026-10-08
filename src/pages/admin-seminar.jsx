import React, { useState, useEffect, useCallback } from 'react';
/* Talqeeh — Admin: Akses Seminar. PIN unik per orang untuk materi seminar (/seminar).
   PIN hanya tampil sekali saat dibuat atau diganti; server hanya menyimpan hash-nya. */

const SEMINAR_URL = "https://talqeeh.id/#/seminar";

const seminarAdminCall = async (action, extra = {}) => {
  const r = await fetch("/api/seminar", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-token": sessionStorage.getItem("talqee_admin_token") || "" },
    body: JSON.stringify({ action, ...extra }),
  });
  if (r.status === 401) { sessionStorage.removeItem("talqee_admin_token"); window.location.reload(); throw new Error("Sesi admin habis, silakan login ulang"); }
  let j = null;
  try { j = await r.json(); } catch {}
  if (!j || !j.ok) throw new Error((j && j.error) || "Gagal (status " + r.status + ")");
  return j.data;
};

const accessMessage = (name, pin) =>
  "Halo " + name + ", ini PIN akses materi seminar Talqeeh Anda: " + pin + "\nBuka " + SEMINAR_URL + " lalu masukkan PIN tersebut. PIN bersifat pribadi, mohon tidak dibagikan.";

const statusOf = (row) => {
  if (row.revoked_at) return { key: "revoked", label: "Dicabut", cls: "text-rose-600 border-rose-600/40 bg-rose-600/10" };
  if (row.expires_at && new Date(row.expires_at) < new Date()) return { key: "expired", label: "Kedaluwarsa", cls: "text-gold-300 border-gold-500/40 bg-gold-500/10" };
  return { key: "active", label: "Aktif", cls: "text-emerald-300 border-emerald-400/40 bg-emerald-500/10" };
};
const fmt = (iso) => iso ? new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

const EMAIL_STATUS = {
  created: { label: "Ditambahkan", cls: "text-emerald-300" },
  exists: { label: "Sudah terdaftar", cls: "text-ink-muted" },
  revoked: { label: "Pernah dicabut (pulihkan lewat daftar di bawah)", cls: "text-gold-300" },
  invalid: { label: "Email tidak valid", cls: "text-rose-600" },
  error: { label: "Gagal disimpan", cls: "text-rose-600" },
};
// baris: "email", "nama, email", atau "email, nama" (dipisah koma, titik koma, atau tab)
const parseEmailLines = (text) => text.split("\n").map(l => l.trim()).filter(Boolean).map(l => {
  const parts = l.split(/[,;\t]/).map(x => x.trim()).filter(Boolean);
  return { email: parts.find(x => x.includes("@")) || "", label: parts.find(x => !x.includes("@")) || "" };
});
const emailAnnouncement = () => "Materi seminar Talqeeh dapat dibuka di " + SEMINAR_URL + "\nLogin dengan akun Google yang emailnya Anda berikan kepada panitia. Tidak perlu PIN.";

const copyText = async (text) => { try { await navigator.clipboard.writeText(text); return true; } catch { return false; } };

const downloadCsv = (rows) => {
  const esc = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
  const csv = ["Nama,Email,PIN"].concat(rows.map(r => [r.label, r.email || "", r.pin].map(esc).join(","))).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = "pin-seminar.csv"; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
};

const AdminSeminar = () => {
  const [rows, setRows] = useState([]);
  const [info, setInfo] = useState({ contentInstalled: null, contentUpdatedAt: null, emailReady: true });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ label: "", email: "", note: "", days: "" });
  const [bulk, setBulk] = useState({ text: "", days: "" });
  const [emails, setEmails] = useState({ text: "", days: "" });
  const [emailRes, setEmailRes] = useState(null);
  const [issued, setIssued] = useState([]);   // PIN yang baru dibuat (tampil sekali)
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [cand, setCand] = useState({ rows: null, loading: false, err: "" });
  const [pick, setPick] = useState(() => new Set());
  const [cq, setCq] = useState("");
  const [cfilter, setCfilter] = useState("todo");   // todo | google | all
  const [pdays, setPdays] = useState("");
  const [pickRes, setPickRes] = useState(null);

  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 2600); };
  const load = useCallback(async () => {
    setLoading(true); setErr("");
    try { const d = await seminarAdminCall("admin-list"); setRows(d.rows || []); setInfo({ contentInstalled: d.contentInstalled, contentUpdatedAt: d.contentUpdatedAt, emailReady: d.emailReady }); }
    catch (e) { setErr(e.message); }
    setLoading(false);
  }, []);
  const loadCand = useCallback(async () => {
    setCand(c => ({ ...c, loading: true, err: "" }));
    try { const d = await seminarAdminCall("admin-candidates"); setCand({ rows: d.rows || [], loading: false, err: "" }); setInfo(i => ({ ...i, emailReady: d.emailReady })); }
    catch (e) { setCand(c => ({ ...c, loading: false, err: e.message })); }
  }, []);
  useEffect(() => { load(); loadCand(); }, [load, loadCand]);

  const run = async (fn) => { setBusy(true); setErr(""); try { await fn(); } catch (e) { setErr(e.message); } setBusy(false); };

  const createOne = (e) => { e.preventDefault(); run(async () => {
    const d = await seminarAdminCall("admin-create", { label: form.label, email: form.email, note: form.note, days: form.days });
    setIssued([{ ...d, email: form.email }]); setForm({ label: "", email: "", note: "", days: form.days }); await load();
  }); };

  const createBulk = (e) => { e.preventDefault(); run(async () => {
    const entries = bulk.text.split("\n").map(l => l.trim()).filter(Boolean).map(l => { const [label, email] = l.split(",").map(s => (s || "").trim()); return { label, email }; });
    if (!entries.length) throw new Error("Isi minimal satu nama");
    const d = await seminarAdminCall("admin-create-bulk", { entries, days: bulk.days });
    const withEmail = d.map((x, i) => ({ ...x, email: entries.filter(en => en.label)[i]?.email || "" }));
    setIssued(withEmail); setBulk({ text: "", days: bulk.days }); await load();
  }); };

  const addEmails = (e) => { e.preventDefault(); run(async () => {
    const entries = parseEmailLines(emails.text);
    if (!entries.length) throw new Error("Isi minimal satu email");
    const d = await seminarAdminCall("admin-add-emails", { entries, days: emails.days });
    setEmailRes(d); setEmails({ text: "", days: emails.days }); await load();
  }); };

  const regenerate = (row) => { if (row.has_pin && !window.confirm("Ganti PIN untuk " + row.label + "? PIN lama langsung tidak berlaku.")) return; run(async () => {
    const d = await seminarAdminCall("admin-regenerate", { id: row.id }); setIssued([{ ...d, email: row.email }]); await load();
  }); };
  const toggleRevoke = (row) => run(async () => { await seminarAdminCall("admin-revoke", { id: row.id, revoke: !row.revoked_at }); flash(row.revoked_at ? "Akses dipulihkan" : "Akses dicabut"); await load(); });
  const remove = (row) => { if (!window.confirm("Hapus akses " + row.label + " secara permanen?")) return; run(async () => { await seminarAdminCall("admin-delete", { id: row.id }); flash("Akses dihapus"); await load(); }); };

  const candState = (c) => c.paid ? "paid" : c.seminar;   // paid | granted | revoked | none
  const selectable = (c) => c.seminar === "none" && !c.paid;
  const candShown = (cand.rows || []).filter(c => {
    if (cfilter === "todo" && !selectable(c)) return false;
    if (cfilter === "google" && !c.google) return false;
    const t = cq.trim().toLowerCase();
    return !t || (c.name + " " + c.email).toLowerCase().includes(t);
  });
  const shownSel = candShown.filter(selectable);
  const allChecked = shownSel.length > 0 && shownSel.every(c => pick.has(c.code));
  const someChecked = shownSel.some(c => pick.has(c.code));
  const toggleOne = (code) => setPick(p => { const n = new Set(p); n.has(code) ? n.delete(code) : n.add(code); return n; });
  const toggleAll = () => setPick(p => { const n = new Set(p); if (allChecked) shownSel.forEach(c => n.delete(c.code)); else shownSel.forEach(c => n.add(c.code)); return n; });
  const grantPicked = () => run(async () => {
    const codes = [...pick];
    if (!codes.length) return;
    const d = await seminarAdminCall("admin-grant-members", { codes, days: pdays });
    setPickRes(d); setPick(new Set()); await Promise.all([load(), loadCand()]);
  });
  const CAND_BADGE = {
    none: { label: "Belum", cls: "text-ink-muted border-white/15" },
    granted: { label: "Sudah (email)", cls: "text-emerald-300 border-emerald-400/40 bg-emerald-500/10" },
    paid: { label: "Otomatis (member berbayar)", cls: "text-emerald-300 border-emerald-400/40 bg-emerald-500/10" },
    revoked: { label: "Dicabut", cls: "text-rose-600 border-rose-600/40 bg-rose-600/10" },
  };

  const shown = rows.filter(r => !q.trim() || (r.label + " " + (r.email || "")).toLowerCase().includes(q.trim().toLowerCase()));
  const active = rows.filter(r => statusOf(r).key === "active").length;
  const field = "w-full rounded-lg bg-black/30 border border-white/15 focus:border-gold-500 focus:outline-none px-3 py-2 text-ink";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Akses Seminar</h2>
          <p className="text-sm text-ink-muted mt-1">Tiga jalan masuk ke <span className="text-ink">{SEMINAR_URL}</span>: email yang didaftarkan di sini (login Google, tanpa PIN), PIN pribadi, atau member berbayar yang login.</p>
        </div>
        <div className="text-sm text-ink-muted num">{active} aktif dari {rows.length}</div>
      </div>

      {info.contentInstalled === false && (
        <div className="rounded-xl border border-rose-600/40 bg-rose-600/10 p-4 text-sm text-ink" role="alert">
          Isi materi belum dipasang di database, jadi peserta akan melihat "Materi belum dipasang". Jalankan <code>exports/seminar-seed.sql</code> di Supabase SQL Editor.
        </div>
      )}
      {info.emailReady === false && (
        <div className="rounded-xl border border-gold-500/40 bg-gold-500/10 p-4 text-sm text-ink" role="alert">
          Akses lewat email belum aktif di database. Jalankan <code>migrations/seminar_access_email.sql</code> di Supabase SQL Editor, lalu muat ulang halaman ini.
        </div>
      )}
      {info.contentInstalled && <p className="text-xs text-ink-muted">Materi terpasang, diperbarui {fmt(info.contentUpdatedAt)}.</p>}
      {err && <div className="rounded-xl border border-rose-600/40 bg-rose-600/10 p-3 text-sm text-ink" role="alert">{err}</div>}
      {toast && <div role="status" className="text-sm text-gold-300">{toast}</div>}

      {issued.length > 0 && (
        <div className="card-glass-strong p-5 border border-gold-500/40">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
            <h3 className="font-display text-lg font-semibold text-ink">PIN baru ({issued.length})</h3>
            <span className="text-xs text-gold-300">Catat sekarang. PIN tidak bisa dilihat lagi setelah panel ini ditutup.</span>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {issued.map(x => (
              <div key={x.id} className="flex flex-wrap items-center gap-3 rounded-lg bg-black/25 border border-white/10 px-3 py-2">
                <span className="text-ink min-w-[8rem] flex-1">{x.label}</span>
                <span className="num text-gold-300 text-lg tracking-wider">{x.pin}</span>
                <button onClick={async () => flash((await copyText(x.pin)) ? "PIN disalin" : "Gagal menyalin")} className="btn btn-ghost !min-h-0 !py-1.5 !px-3 text-xs">Salin PIN</button>
                <button onClick={async () => flash((await copyText(accessMessage(x.label, x.pin))) ? "Pesan disalin" : "Gagal menyalin")} className="btn btn-ghost !min-h-0 !py-1.5 !px-3 text-xs">Salin pesan</button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <button onClick={async () => flash((await copyText(issued.map(x => x.label + ": " + x.pin).join("\n"))) ? "Semua PIN disalin" : "Gagal menyalin")} className="btn btn-gold text-sm py-2">Salin semua (nama: PIN)</button>
            <button onClick={() => downloadCsv(issued)} className="btn btn-ghost text-sm py-2"><Icon name="download" className="w-4 h-4"/> Unduh CSV</button>
            <button onClick={() => setIssued([])} className="btn btn-ghost text-sm py-2">Tutup panel</button>
          </div>
        </div>
      )}

      <section className="card-glass-strong p-5 space-y-4" aria-labelledby="sa-pick-h">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 id="sa-pick-h" className="font-display text-lg font-semibold text-ink">Pilih dari akun yang sudah login</h3>
            <p className="text-sm text-ink-muted mt-1 max-w-2xl">Minta peserta membuka <span className="text-ink">{SEMINAR_URL}</span> dan login dengan Google. Akun mereka muncul di sini, tinggal dicentang lalu diberi akses. Tidak perlu mengetik email.</p>
          </div>
          <button type="button" onClick={loadCand} disabled={cand.loading} className="btn btn-ghost !min-h-0 !py-2 !px-3 text-sm"><Icon name="refresh" className="w-4 h-4"/> Muat ulang</button>
        </div>
        {cand.err && <div className="rounded-lg border border-rose-600/40 bg-rose-600/10 p-3 text-sm text-ink" role="alert">{cand.err}</div>}
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="sa-cq" className="sr-only">Cari akun</label>
          <input id="sa-cq" value={cq} onChange={e => setCq(e.target.value)} placeholder="Cari nama atau email" className={field + " !w-60"} style={{ fontSize: 16 }}/>
          {[["todo", "Belum punya akses"], ["google", "Login Google"], ["all", "Semua"]].map(([k, l]) => (
            <button key={k} type="button" aria-pressed={cfilter === k} onClick={() => setCfilter(k)} className={"rounded-full border px-3 py-1.5 text-xs " + (cfilter === k ? "border-gold-500 text-gold-300 bg-gold-500/10" : "border-white/15 text-ink-muted hover:text-ink")}>{l}</button>
          ))}
        </div>
        {cand.rows === null ? <div className="text-sm text-ink-muted" role="status">Memuat akun...</div> : candShown.length === 0 ? (
          <div className="text-sm text-ink-muted rounded-lg bg-black/20 border border-white/10 p-4">{cand.rows.length ? "Tidak ada akun yang cocok dengan filter ini." : "Belum ada akun. Minta peserta login dulu, lalu muat ulang."}</div>
        ) : (
          <div className="rounded-lg border border-white/10 overflow-hidden">
            <div className="max-h-96 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-night-900"><tr className="text-left text-ink-muted border-b border-line">
                  <th className="pl-4 pr-2 py-2.5 w-10"><input type="checkbox" aria-label="Pilih semua yang tampil" checked={allChecked} ref={el => { if (el) el.indeterminate = !allChecked && someChecked; }} onChange={toggleAll} disabled={!shownSel.length} className="h-4 w-4 accent-[#d4a853]"/></th>
                  <th className="px-3 py-2.5 font-medium">Nama</th><th className="px-3 py-2.5 font-medium">Email</th><th className="px-3 py-2.5 font-medium">Seminar</th><th className="px-3 py-2.5 font-medium whitespace-nowrap">Login terakhir</th>
                </tr></thead>
                <tbody>
                  {candShown.map(c => { const ok = selectable(c); const b = CAND_BADGE[candState(c)]; return (
                    <tr key={c.code} className={"border-b border-line last:border-0 " + (ok && pick.has(c.code) ? "bg-gold-500/5" : "")}>
                      <td className="pl-4 pr-2 py-2"><input type="checkbox" aria-label={"Pilih " + (c.name || c.email)} checked={pick.has(c.code)} disabled={!ok} onChange={() => toggleOne(c.code)} className="h-4 w-4 accent-[#d4a853] disabled:opacity-30"/></td>
                      <td className="px-3 py-2 text-ink">{c.name || "-"}</td>
                      <td className="px-3 py-2 text-ink-muted break-all">{c.email}</td>
                      <td className="px-3 py-2 whitespace-nowrap"><span className={"inline-block rounded-md border px-2 py-0.5 text-xs " + b.cls}>{b.label}</span></td>
                      <td className="px-3 py-2 text-ink-muted whitespace-nowrap">{fmt(c.lastLogin || c.createdAt)}</td>
                    </tr>); })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-end gap-3">
          <div className="max-w-[11rem]"><label htmlFor="sa-pdays" className="block text-sm text-ink mb-1">Berlaku (hari)</label><input id="sa-pdays" inputMode="numeric" placeholder="kosong = tanpa batas" className={field} value={pdays} onChange={e => setPdays(e.target.value.replace(/\D/g, ""))} style={{ fontSize: 16 }}/></div>
          <button type="button" onClick={grantPicked} disabled={busy || pick.size === 0 || info.emailReady === false} className="btn btn-gold text-sm py-2.5 disabled:opacity-60">Beri akses ({pick.size})</button>
          {pick.size > 0 && <button type="button" onClick={() => setPick(new Set())} className="text-xs text-ink-muted hover:text-ink underline pb-3">Kosongkan pilihan</button>}
          <button type="button" onClick={async () => flash((await copyText(emailAnnouncement())) ? "Pesan pengumuman disalin" : "Gagal menyalin")} className="btn btn-ghost text-sm py-2.5">Salin pesan pengumuman</button>
        </div>
        {pickRes && (
          <div className="rounded-lg bg-black/25 border border-white/10 p-3 text-sm" role="status">
            <div className="text-ink">{["created", "exists", "revoked", "invalid", "missing", "error"].filter(k => pickRes.some(x => x.status === k)).map(k => ({ created: "Diberi akses", exists: "Sudah punya", revoked: "Pernah dicabut", invalid: "Email tidak valid", missing: "Akun tidak ditemukan", error: "Gagal" }[k]) + ": " + pickRes.filter(x => x.status === k).length).join(" | ")}</div>
            <button type="button" onClick={() => setPickRes(null)} className="mt-2 text-xs text-ink-muted hover:text-ink underline">Tutup</button>
          </div>
        )}
      </section>

      <details className="card-glass p-5">
        <summary className="cursor-pointer font-display text-lg font-semibold text-ink">Atau ketik email manual (untuk yang belum login)</summary>
        <div className="mt-4">
      <form onSubmit={addEmails} className="space-y-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">Beri akses lewat email</h3>
          <p className="text-sm text-ink-muted mt-1">Pemilik email login dengan Google dan langsung masuk tanpa PIN. Email harus sama dengan akun Google yang dipakai. Untuk Gmail, titik dan +tag diabaikan.</p>
        </div>
        <div>
          <label htmlFor="sa-emails" className="block text-sm text-ink mb-1">Satu per baris: email, atau nama dan email dipisah koma</label>
          <textarea id="sa-emails" rows={6} className={field} value={emails.text} onChange={e => setEmails({ ...emails, text: e.target.value })} placeholder={"ahmad@gmail.com\nSiti Aisyah, siti@email.com"} style={{ fontSize: 16 }}/>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="max-w-[11rem]"><label htmlFor="sa-edays" className="block text-sm text-ink mb-1">Berlaku (hari)</label><input id="sa-edays" inputMode="numeric" placeholder="kosong = tanpa batas" className={field} value={emails.days} onChange={e => setEmails({ ...emails, days: e.target.value.replace(/\D/g, "") })} style={{ fontSize: 16 }}/></div>
          <button type="submit" disabled={busy || !emails.text.trim() || info.emailReady === false} className="btn btn-gold text-sm py-2.5 disabled:opacity-60">Daftarkan email</button>
          <button type="button" onClick={async () => flash((await copyText(emailAnnouncement())) ? "Pesan pengumuman disalin" : "Gagal menyalin")} className="btn btn-ghost text-sm py-2.5">Salin pesan pengumuman</button>
        </div>
        {emailRes && (
          <div className="rounded-lg bg-black/25 border border-white/10 p-3 text-sm" role="status">
            <div className="text-ink mb-2">
              {["created", "exists", "revoked", "invalid", "error"].filter(k => emailRes.some(x => x.status === k)).map(k => EMAIL_STATUS[k].label.split(" (")[0] + ": " + emailRes.filter(x => x.status === k).length).join(" | ")}
            </div>
            {emailRes.filter(x => x.status !== "created").length > 0 && (
              <ul className="space-y-1 max-h-40 overflow-y-auto">
                {emailRes.filter(x => x.status !== "created").map((x, i) => <li key={i} className={EMAIL_STATUS[x.status].cls}>{x.email}: {EMAIL_STATUS[x.status].label}</li>)}
              </ul>
            )}
            <button type="button" onClick={() => setEmailRes(null)} className="mt-2 text-xs text-ink-muted hover:text-ink underline">Tutup</button>
          </div>
        )}
      </form>
        </div>
      </details>

      <div className="grid lg:grid-cols-2 gap-4">
        <form onSubmit={createOne} className="card-glass p-5 space-y-3">
          <h3 className="font-display text-lg font-semibold text-ink">Buat satu PIN</h3>
          <div><label htmlFor="sa-label" className="block text-sm text-ink mb-1">Nama</label><input id="sa-label" className={field} value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} style={{ fontSize: 16 }} required/></div>
          <div><label htmlFor="sa-email" className="block text-sm text-ink mb-1">Email (opsional, hanya catatan)</label><input id="sa-email" type="email" className={field} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ fontSize: 16 }}/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label htmlFor="sa-note" className="block text-sm text-ink mb-1">Catatan</label><input id="sa-note" className={field} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} style={{ fontSize: 16 }}/></div>
            <div><label htmlFor="sa-days" className="block text-sm text-ink mb-1">Berlaku (hari)</label><input id="sa-days" inputMode="numeric" placeholder="kosong = tanpa batas" className={field} value={form.days} onChange={e => setForm({ ...form, days: e.target.value.replace(/\D/g, "") })} style={{ fontSize: 16 }}/></div>
          </div>
          <button type="submit" disabled={busy || !form.label.trim()} className="btn btn-gold text-sm py-2.5 disabled:opacity-60">Buat PIN</button>
        </form>

        <form onSubmit={createBulk} className="card-glass p-5 space-y-3">
          <h3 className="font-display text-lg font-semibold text-ink">Buat banyak sekaligus</h3>
          <div>
            <label htmlFor="sa-bulk" className="block text-sm text-ink mb-1">Satu orang per baris: nama, atau nama dan email dipisah koma</label>
            <textarea id="sa-bulk" rows={5} className={field} value={bulk.text} onChange={e => setBulk({ ...bulk, text: e.target.value })} placeholder={"Ahmad Fauzi\nSiti Aisyah, siti@email.com"} style={{ fontSize: 16 }}/>
          </div>
          <div className="max-w-[11rem]"><label htmlFor="sa-bdays" className="block text-sm text-ink mb-1">Berlaku (hari)</label><input id="sa-bdays" inputMode="numeric" placeholder="kosong = tanpa batas" className={field} value={bulk.days} onChange={e => setBulk({ ...bulk, days: e.target.value.replace(/\D/g, "") })} style={{ fontSize: 16 }}/></div>
          <button type="submit" disabled={busy || !bulk.text.trim()} className="btn btn-gold text-sm py-2.5 disabled:opacity-60">Buat semua PIN</button>
        </form>
      </div>

      <div className="card-glass overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-line">
          <h3 className="font-display text-lg font-semibold text-ink">Daftar akses</h3>
          <div className="flex items-center gap-2">
            <label htmlFor="sa-q" className="sr-only">Cari</label>
            <input id="sa-q" value={q} onChange={e => setQ(e.target.value)} placeholder="Cari nama atau email" className={field + " !w-56"} style={{ fontSize: 16 }}/>
            <button onClick={load} className="btn btn-ghost !min-h-0 !py-2 !px-3 text-sm" aria-label="Muat ulang"><Icon name="refresh" className="w-4 h-4"/></button>
          </div>
        </div>
        {loading ? <div className="p-6 text-ink-muted text-sm" role="status">Memuat...</div> : shown.length === 0 ? (
          <div className="p-6 text-ink-muted text-sm">{rows.length ? "Tidak ada yang cocok." : "Belum ada akses. Buat PIN pertama di atas."}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-ink-muted border-b border-line">
                <th className="px-4 py-2.5 font-medium">Nama</th><th className="px-3 py-2.5 font-medium">Cara masuk</th><th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium">Dibuat</th><th className="px-3 py-2.5 font-medium">Terakhir dipakai</th>
                <th className="px-3 py-2.5 font-medium text-right">Dipakai</th><th className="px-4 py-2.5 font-medium text-right">Aksi</th>
              </tr></thead>
              <tbody>
                {shown.map(r => { const st = statusOf(r); return (
                  <tr key={r.id} className="border-b border-line last:border-0 align-top">
                    <td className="px-4 py-2.5"><div className="text-ink">{r.label}</div>{r.email && <div className="text-xs text-ink-muted">{r.email}</div>}{r.note && <div className="text-xs text-ink-muted">{r.note}</div>}</td>
                    <td className="px-3 py-2.5 text-xs text-ink-muted whitespace-nowrap">{[r.via_email && "Email", r.has_pin && "PIN"].filter(Boolean).join(" + ") || "-"}</td>
                    <td className="px-3 py-2.5"><span className={"inline-block rounded-md border px-2 py-0.5 text-xs " + st.cls}>{st.label}</span>{r.expires_at && st.key === "active" && <div className="text-xs text-ink-muted mt-1">sampai {fmt(r.expires_at)}</div>}</td>
                    <td className="px-3 py-2.5 text-ink-muted whitespace-nowrap">{fmt(r.created_at)}</td>
                    <td className="px-3 py-2.5 text-ink-muted whitespace-nowrap">{fmt(r.last_used_at)}</td>
                    <td className="px-3 py-2.5 text-ink-muted text-right num">{r.uses}x</td>
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      <button onClick={() => regenerate(r)} disabled={busy} className="text-gold-300 hover:text-gold-200 text-xs mr-3">{r.has_pin ? "Ganti PIN" : "Buat PIN"}</button>
                      <button onClick={() => toggleRevoke(r)} disabled={busy} className="text-ink-muted hover:text-ink text-xs mr-3">{r.revoked_at ? "Pulihkan" : "Cabut"}</button>
                      <button onClick={() => remove(r)} disabled={busy} className="text-rose-600 hover:text-rose-600/80 text-xs">Hapus</button>
                    </td>
                  </tr>); })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { AdminSeminar });
