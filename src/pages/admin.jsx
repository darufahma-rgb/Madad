import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
/* Talqih, Admin Panel
   /admin, PIN gate, then tabbed control center
*/

/* ── Admin API Helpers (SEC-1, SEC-2) ── */
const adminToken = () => sessionStorage.getItem('talqee_admin_token') || '';

const adminMembersAPI = async (action, code, row) => {
  const r = await fetch('/api/admin-members', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken() },
    body: JSON.stringify({ action, code, row }),
  });
  if (r.status === 401) {
    sessionStorage.removeItem('talqee_admin_token');
    setAdminLoggedIn(false);
    window.location.reload();
    throw new Error('Sesi expired, silakan login ulang');
  }
  const j = await r.json();
  if (!j.ok) throw new Error(j.error || 'API error');
  return j.data;
};

const adminGetAllMembers  = async ()            => { const rows = await adminMembersAPI('list'); return Array.isArray(rows) ? rows.map(sbToMember) : []; };
const adminAddMember      = async (member)       => { const rows = await adminMembersAPI('add', null, memberToSb(member)); return sbToMember(Array.isArray(rows) ? rows[0] : rows); };
const adminUpdateMember   = async (code, patch)  => { const rows = await adminMembersAPI('update', code, memberToSb(patch)); return sbToMember(Array.isArray(rows) ? rows[0] : rows); };
const adminDeleteMember   = async (code)         => adminMembersAPI('delete', code);

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
              { id: "members",    label: "Members",           icon: "users" },
              { id: "maddah",     label: "Maddah Analytics",  icon: "layers" },
              { id: "muqaranah",  label: "Muqaranah",         icon: "scale" },
              { id: "onboarding", label: "Onboarding Data",   icon: "list" },
              { id: "guides",     label: "Guide Manager",     icon: "sparkles" },
              { id: "bank-soal",  label: "Bank Soal",         icon: "fileText" },
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
        {tab === "members"    && <AdminMembers/>}
        {tab === "maddah"     && <AdminMaddahAnalytics/>}
        {tab === "muqaranah"  && <AdminMuqaranahPanel/>}
        {tab === "onboarding" && <AdminOnboarding/>}
        {tab === "guides"     && <AdminGuides/>}
        {tab === "bank-soal"  && <AdminBankSoal/>}
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
        <Blob color="rgba(62,207,142,0.35)" size={300} top={-100} right={-100}/>
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
  const bound    = members.filter(m => m.device).length;

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-ink mb-2">Overview</h1>
      <p className="text-ink-muted mb-8">Ringkasan platform Talqeeh.</p>

      <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">Member</div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Member"  value={members.length}       icon="users"  color="violet"/>
        <StatCard label="Active"        value={active}               icon="check"  color="mint"/>
        <StatCard label="Device Bound"  value={bound}                icon="user"   color="gold"/>
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
                    <div className="text-xs text-ink-soft">{m.device || "—"}</div>
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

/* ============== MEMBERS ============== */
const AdminMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [genOpen, setGenOpen] = useState(false);
  const [search,  setSearch]  = useState("");
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
      const updated = await adminUpdateMember(code, patch);
      setMembers(prev => prev.map(m => m.code === code ? updated : m));
    } catch (err) {
      toast.push("Gagal update: " + err.message);
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

  const handleAdd = (newMember) => {
    setMembers(prev => [newMember, ...prev]);
  };

  const filtered = members.filter(m =>
    !search ||
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.code.toLowerCase().includes(search.toLowerCase())
  );

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.push("Kode tersalin");
  };

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl font-semibold text-ink mb-1">Member Access</h1>
          <p className="text-ink-muted">Kelola kode akses, device, dan status member.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadFromSupabase} className="btn btn-ghost text-xs px-3 py-2 flex items-center gap-1.5">
            <Icon name="refresh" className="w-3.5 h-3.5"/> Refresh
          </button>
          <button onClick={() => setGenOpen(true)} className="btn btn-primary">
            <Icon name="sparkles" className="w-4 h-4"/> Generate Kode Baru
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

      <div className="card-glass p-4 mb-4">
        <div className="relative">
          <Icon name="search" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft"/>
          <input value={search} onChange={(e)=>setSearch(e.target.value)}
            placeholder="Cari nama atau kode..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm text-ink placeholder:text-ink-soft outline-none transition-colors"
            onFocus={e => e.target.style.borderColor="rgba(62,207,142,0.45)"}
            onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.10)"}/>
        </div>
      </div>

      <div className="card-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/3 text-left">
                <th className="px-4 py-3 font-medium text-ink-muted text-xs uppercase tracking-wider">Member</th>
                <th className="px-4 py-3 font-medium text-ink-muted text-xs uppercase tracking-wider">Kode</th>
                <th className="px-4 py-3 font-medium text-ink-muted text-xs uppercase tracking-wider">Device</th>
                <th className="px-4 py-3 font-medium text-ink-muted text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 font-medium text-ink-muted text-xs uppercase tracking-wider">Expires</th>
                <th className="px-4 py-3 text-right font-medium text-ink-muted text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.code} className="border-t border-line">
                  <td className="px-4 py-3.5">
                    <div className="text-ink font-medium">{m.name}</div>
                    <div className="text-[11px] text-ink-soft">{m.whatsapp}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gold-300">{m.code}</span>
                      <button onClick={() => copyCode(m.code)} className="text-ink-soft hover:text-ink"><Icon name="copy" className="w-3.5 h-3.5"/></button>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    {m.device ? <span className="text-xs text-ink">{m.device}</span> : <span className="text-xs text-ink-soft italic">belum bind</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusPill status={m.status}/>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-ink-muted num">{m.expiresAt}</td>
                  <td className="px-4 py-3.5 text-right">
                    <MemberActions member={m} updateMember={updateMember} onDelete={() => deleteMember(m.code, m.name)}/>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="6" className="px-4 py-10 text-center text-ink-muted">Tidak ada member yang cocok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <GenerateModal open={genOpen} onClose={() => setGenOpen(false)} members={members} onAdd={handleAdd}/>
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
          {member.device && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/3">
              <span className="text-ink-soft">Device</span>
              <span className="text-ink text-xs">{member.device}</span>
            </div>
          )}
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
    code:      member.code      || "",
    name:      member.name      || "",
    whatsapp:  member.whatsapp  || "",
    expiresAt: member.expiresAt || "",
    notes:     member.notes     || "",
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) return;
    setSaving(true);
    try {
      await onSave(member.code, {
        code:      form.code.trim().toUpperCase(),
        name:      form.name.trim(),
        whatsapp:  form.whatsapp.trim(),
        expiresAt: form.expiresAt,
        notes:     form.notes,
      });
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
          {field("Kode Akses", "code", { upper: true, placeholder: "MSR-XXXX-XXXX" })}
          {field("Nama", "name", { placeholder: "Nama lengkap" })}
          {field("WhatsApp", "whatsapp", { placeholder: "+62..." })}
          {field("Expires At", "expiresAt", { type: "date" })}
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

const MemberActions = ({ member, updateMember, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const toast = useToast();
  const close = () => setOpen(false);
  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen(o => !o)} className="w-8 h-8 rounded-lg hover:bg-white/8 flex items-center justify-center text-ink-muted">
        <Icon name="list" className="w-4 h-4"/>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={close}/>
          <div className="absolute right-0 top-full mt-1 z-20 card-glass-strong shadow-glass w-52 py-1.5 text-sm">
            <button onClick={() => { setShowProfile(true); close(); }} className="w-full text-left px-4 py-2 text-ink hover:bg-white/5 flex items-center gap-2">
              <Icon name="user" className="w-3.5 h-3.5 text-ink-soft"/> Lihat Profil
            </button>
            <button onClick={() => { setShowEdit(true); close(); }} className="w-full text-left px-4 py-2 text-ink hover:bg-white/5 flex items-center gap-2">
              <Icon name="edit" className="w-3.5 h-3.5 text-ink-soft"/> Edit Member
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
            {member.device && (
              <button onClick={() => { updateMember(member.code, { device: null, deviceId: null }); toast.push("Device direset"); close(); }} className="w-full text-left px-4 py-2 text-ink hover:bg-white/5">Reset device</button>
            )}
            <div className="my-1 h-px bg-line"/>
            <button onClick={() => { if (confirm("Hapus member ini?")) { onDelete(); close(); } }} className="w-full text-left px-4 py-2 text-rose-600 hover:bg-white/5">Delete</button>
          </div>
        </>
      )}
      {showProfile && <MemberProfileModal member={member} onClose={() => setShowProfile(false)}/>}
      {showEdit && <EditMemberModal member={member} onClose={() => setShowEdit(false)} onSave={updateMember}/>}
    </div>
  );
};

const GenerateModal = ({ open, onClose, members, onAdd }) => {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("+20");
  const [duration, setDuration] = useState(30);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (open) { setName(""); setWhatsapp("+20"); setDuration(30); setGeneratedCode(null); setSubmitting(false); }
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
      };
      const added = await adminAddMember(newMember);
      setGeneratedCode(added.code);
      onAdd && onAdd(added);
    } catch (err) {
      toast.push("Gagal tambah member: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = () => { navigator.clipboard.writeText(generatedCode); toast.push("Kode tersalin"); };
  const sendWA = async () => {
    const message = "Assalamu'alaikum, " + name + "! 👋\n\nSelamat datang di Talqeeh — Panduan belajar efektif Materi Al-Azhar dengan AI.\n\nKode akses Anda sudah aktif. Ketuk-tahan kode di bawah untuk menyalin:\n\n```" + generatedCode + "```\n\nCara login:\n1️⃣ Buka Talqeeh → https://talqeeh.vercel.app\n2️⃣ Pilih *Login Member*\n3️⃣ Tempel kode di atas\n\n📖 Panduan Lengkap\nhttps://app.notion.com/p/Talqeeh-Guide-36fb668bda20804294c9d29c6c4ca050\n\n📋 Ketentuan Penggunaan\n- Kode hanya berlaku untuk 1 perangkat\n- Dilarang membagikan kode kepada siapapun\n- Kode bersifat pribadi dan menjadi tanggung jawab pemegang\n- Jika kode disalahgunakan, akses dapat dicabut tanpa pemberitahuan\n- Untuk kendala teknis, hubungi Tim Talqeeh\n\n📞 Kontak Kami\nWhatsApp: wa.me/6281311506025\nInstagram: @ai.gypt\n\nSemoga bermanfaat dan dimudahkan dalam belajar! 🌿\n— Tim Talqeeh";
    try {
      const r = await fetch('/api/send-wa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken() },
        body: JSON.stringify({ to: whatsapp, message }),
      });
      const j = await r.json();
      if (j.ok) {
        toast.push('✓ WA berhasil dikirim via Fonnte');
      } else {
        toast.push('Fonnte gagal, buka WA manual...');
        window.open(`https://wa.me/${whatsapp.replace(/\D/g,"")}?text=${encodeURIComponent(message)}`, "_blank");
      }
    } catch {
      window.open(`https://wa.me/${whatsapp.replace(/\D/g,"")}?text=${encodeURIComponent(message)}`, "_blank");
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="p-7">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl font-semibold text-ink">{generatedCode ? "Kode berhasil dibuat" : "Generate kode baru"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg text-ink-muted hover:bg-white/5"><Icon name="x" className="w-4 h-4 mx-auto"/></button>
        </div>
        {!generatedCode ? (
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
            <div className="text-xs uppercase tracking-wider text-gold-400 mb-2">Kode untuk {name}</div>
            <div className="card-glass-strong p-6 mb-5">
              <div className="font-mono text-3xl text-gold-300 tracking-widest">{generatedCode}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button onClick={copyCode} className="btn btn-ghost text-sm py-2.5">
                <Icon name="copy" className="w-4 h-4"/> Salin
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

const AdminSettings = () => {
  const toast = useToast();

  const loadSettings = () => {
    try { return JSON.parse(localStorage.getItem("talqee_admin_settings") || "{}"); }
    catch { return {}; }
  };

  const [settings, setSettings] = useState(() => ({
    platformName: "Talqeeh",
    tagline:      "Panduan Belajar Al-Azhar dengan AI",
    whatsapp:     "+201xxxxxxxxx",
    lynkUrl:      "https://lynk.id/talqee",
    ...loadSettings(),
  }));
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem("talqee_admin_settings", JSON.stringify(settings));
    setSaved(true);
    toast.push("Settings tersimpan.");
    setTimeout(() => setSaved(false), 3000);
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
            hint="Nomor ini untuk distribusi kode member setelah bayar."/>
          <SettingsField label="URL Lynk.id" value={settings.lynkUrl} mono
            onChange={v => setSettings({...settings, lynkUrl: v})}
            hint="URL halaman pembayaran di Lynk.id."/>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-xs text-ink-soft">
            {saved ? "✓ Tersimpan ke localStorage" : "Perubahan belum disimpan"}
          </div>
          <button onClick={handleSave} className="btn btn-primary px-6 py-2.5 text-sm">
            Simpan Settings
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

/* ============== ADMIN BANK SOAL ============== */
const AdminBankSoal = () => {
  const [soals, setSoals]       = useState([]);
  const [stats, setStats]       = useState({ pending: 0, approved: 0, rejected: 0 });
  const [filter, setFilter]     = useState('all');
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [soalTeks, setSoalTeks] = useState('');
  const [artiSoal, setArtiSoal]     = useState('');
  const [jawaban, setJawaban]       = useState('');
  const [penjelasan, setPenjelasan] = useState('');
  const [parsing, setParsing]   = useState(false);
  const [acting, setActing]     = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject]     = useState(false);
  const [reward, setReward]     = useState('');

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
    setArtiSoal(soal.arti_soal || '');
    setJawaban(soal.jawaban || '');
    setPenjelasan(soal.penjelasan || '');
    setRejectReason('');
    setShowReject(false);
    setReward('');
    setSignedUrl(null);
  };

  React.useEffect(() => {
    if (!selected?.foto_url || selected?.foto_deleted) return;
    setSignedUrl(null);
    setLoadingFoto(true);
    fetch('/api/foto-soal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch('/api/parse-soal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soal_id: selected.id, foto_url: selected.foto_url })
      });
      const data = await res.json();
      if (data.ok) setSoalTeks(data.teks);
      else alert('Parse gagal: ' + data.error);
    } catch (e) { alert('Error: ' + e.message); }
    finally { setParsing(false); }
  };

  const handleApprove = async () => {
    setActing(true);
    try {
      const res = await fetch('/api/approve-soal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken() },
        body: JSON.stringify({ soal_id: selected.id, action: 'approve', reward_type: reward || null, soal_teks: soalTeks, arti_soal: artiSoal, jawaban: jawaban, penjelasan: penjelasan })
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
      const res = await fetch('/api/approve-soal', {
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
                {['Nama / WA', 'Maddah', 'Tahun', 'Fashl', 'Status', 'Tanggal', ''].map(h => (
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
                  <td className="px-4 py-3 text-ink-muted text-xs max-w-[140px] truncate">{s.maddah_nama}</td>
                  <td className="px-4 py-3 text-ink-muted text-xs">{s.tahun}</td>
                  <td className="px-4 py-3 text-ink-muted text-xs">{s.fashl}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_BADGE[s.status] || ''}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted text-xs">{s.created_at?.slice(0,10)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-emerald-400 hover:text-emerald-200">Detail →</span>
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
              <button onClick={() => setSelected(null)} className="text-ink-muted hover:text-ink text-2xl leading-none">×</button>
            </div>

            <div className="p-5 space-y-5">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  ['Nama', selected.submitter_name],
                  ['WhatsApp', selected.submitter_wa],
                  ['Fakultas', selected.fakultas],
                  ['Tingkat', selected.tingkat || '-'],
                  ['Tahun', selected.tahun],
                  ['Fashl', selected.fashl],
                  ['Status', selected.status],
                  ['AI Parsed', selected.ai_parsed ? 'Ya' : 'Belum'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm border-b border-white/5 pb-2">
                    <span className="text-ink-muted">{k}</span>
                    <span className="text-ink font-medium">{v}</span>
                  </div>
                ))}
              </div>

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

              {/* Teks soal editable */}
              <div>
                <div className="text-xs text-ink-muted mb-2 font-medium uppercase tracking-wide">
                  Teks Soal {selected.status === 'pending' ? '(bisa diedit sebelum approve)' : ''}
                </div>
                <textarea
                  value={soalTeks}
                  onChange={e => setSoalTeks(e.target.value)}
                  readOnly={selected.status !== 'pending'}
                  rows={8}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-ink resize-y focus:outline-none focus:border-emerald-500/40"
                  style={{
                    direction: soalTeks && /[\u0600-\u06FF]/.test(soalTeks) ? 'rtl' : 'ltr',
                    fontFamily: 'inherit',
                    lineHeight: 1.8,
                  }}
                  placeholder="Teks soal akan muncul di sini setelah di-parse, atau isi manual..."
                />
              </div>

              {/* Arti Soal */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: '#3ecf8e', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                  ARTI SOAL (Bahasa Indonesia)
                </label>
                <textarea
                  value={artiSoal}
                  onChange={e => setArtiSoal(e.target.value)}
                  placeholder="Terjemahan/arti soal dalam bahasa Indonesia..."
                  rows={3}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 9,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)', color: '#fff',
                    fontSize: 14, resize: 'vertical', boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Jawaban */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: '#3ecf8e', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                  JAWABAN (Bahasa Arab)
                </label>
                <textarea
                  value={jawaban}
                  onChange={e => setJawaban(e.target.value)}
                  placeholder="Jawaban dalam bahasa Arab..."
                  rows={4}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 9,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)', color: '#fff',
                    fontSize: 14, resize: 'vertical', boxSizing: 'border-box',
                    fontFamily: 'inherit', direction: 'rtl', textAlign: 'right',
                  }}
                />
              </div>

              {/* Penjelasan */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: '#3ecf8e', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                  PENJELASAN (Bahasa Indonesia)
                </label>
                <textarea
                  value={penjelasan}
                  onChange={e => setPenjelasan(e.target.value)}
                  placeholder="Penjelasan jawaban dalam bahasa Indonesia..."
                  rows={4}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 9,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)', color: '#fff',
                    fontSize: 14, resize: 'vertical', boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

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
                        { value: '',         label: 'Tanpa Reward' },
                        { value: 'lifetime', label: '🎓 Lifetime' },
                        { value: 'diskon',   label: '💸 Diskon' },
                        { value: 'poin',     label: '⭐ Poin' },
                      ].map(r => (
                        <button key={r.value} onClick={() => setReward(r.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs border transition ${reward === r.value ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30' : 'text-ink-muted border-white/10 hover:bg-white/5'}`}>
                          {r.label}
                        </button>
                      ))}
                    </div>
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
                  <div className="flex gap-3">
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
