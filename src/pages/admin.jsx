/* Madad, Admin Panel
   /admin, PIN gate, then tabbed control center
*/

const AdminPage = () => {
  const [loggedIn, setLoggedIn] = useState(isAdminLoggedIn());
  const [tab, setTab] = useState("dashboard");

  if (!loggedIn) {
    return <AdminLogin onLogin={() => setLoggedIn(true)}/>;
  }

  return (
    <div className="page-enter min-h-screen">
      <section className="border-b border-line bg-night-900/40 backdrop-blur-xl sticky top-0 z-20">
        <div className="container-x py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="chip chip-gold text-[10px]">ADMIN</span>
            <span className="font-display text-lg font-semibold text-ink">Madad Control Center</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {[
              { id: "dashboard", label: "Dashboard", icon: "grid" },
              { id: "members",   label: "Member Access", icon: "users" },
              { id: "onboarding", label: "Onboarding Data", icon: "list" },
              { id: "guides",    label: "AI Guide Manager", icon: "sparkles" },
              { id: "settings",  label: "Settings", icon: "shield" },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition ${tab === t.id ? "bg-violet-500/15 text-violet-200 border border-violet-400/30" : "text-ink-muted hover:text-ink hover:bg-white/5"}`}>
                <Icon name={t.icon} className="w-4 h-4"/>
                <span className="hidden md:inline">{t.label}</span>
              </button>
            ))}
            <button onClick={() => { setAdminLoggedIn(false); setLoggedIn(false); }} className="px-3 py-2 rounded-lg text-sm text-ink-muted hover:text-rose-600 ml-2">
              Logout
            </button>
          </div>
        </div>
      </section>

      <div className="container-x py-10">
        {tab === "dashboard" && <AdminDashboard/>}
        {tab === "members" && <AdminMembers/>}
        {tab === "onboarding" && <AdminOnboarding/>}
        {tab === "guides" && <AdminGuides/>}
        {tab === "settings" && <AdminSettings/>}
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

  const submit = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setAdminLoggedIn(true);
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };
  return (
    <div className="page-enter min-h-screen flex items-center justify-center px-4">
      <div className="card-glass-strong p-10 max-w-md w-full relative overflow-hidden">
        <Blob color="rgba(124,77,255,0.35)" size={300} top={-100} right={-100}/>
        <div className="relative">
          <span className="chip chip-gold text-[10px] mb-3 inline-flex">ADMIN ACCESS</span>
          <h2 className="font-display text-3xl font-semibold text-ink mb-1">Madad Control Center</h2>
          <p className="text-sm text-ink-muted mb-6">Masukkan PIN admin untuk lanjut.</p>
          <form onSubmit={submit}>
            <input
              ref={inputRef}
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN"
              className={`code-input w-full bg-white/5 border rounded-xl px-5 py-4 text-2xl text-ink focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${error ? "border-rose-600 ring-2 ring-rose-600/30" : "border-line focus:border-violet-400"}`}
            />
            {error && <div className="mt-3 text-sm text-rose-600">PIN salah.</div>}
            <button type="submit" className="btn btn-primary w-full mt-5">Masuk</button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ============== DASHBOARD ============== */
const AdminDashboard = () => {
  const members = loadMembers();
  const active = members.filter(m => m.status === "active").length;
  const expired = members.filter(m => m.status === "expired").length;
  const disabled = members.filter(m => m.status === "disabled").length;
  const bound = members.filter(m => m.device).length;

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-ink mb-2">Overview</h1>
      <p className="text-ink-muted mb-8">Ringkasan member dan aktivitas platform.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Member" value={members.length} icon="users" color="violet"/>
        <StatCard label="Active" value={active} icon="check" color="mint"/>
        <StatCard label="Device Bound" value={bound} icon="user" color="gold"/>
        <StatCard label="Expired" value={expired + disabled} icon="alert" color="rose"/>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card-glass p-7">
          <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">Aktivitas Terakhir</div>
          <h3 className="font-display text-xl font-semibold text-ink mb-4">Member terbaru login</h3>
          <div className="space-y-2.5">
            {members.filter(m => m.lastLogin).sort((a,b) => (b.lastLogin||"").localeCompare(a.lastLogin||"")).slice(0, 5).map(m => (
              <div key={m.code} className="flex items-center justify-between text-sm p-2.5 rounded-lg bg-white/3">
                <div>
                  <div className="text-ink font-medium">{m.name}</div>
                  <div className="text-xs text-ink-soft">{m.device || "Belum bind"}</div>
                </div>
                <div className="text-xs text-ink-muted">{new Date(m.lastLogin).toLocaleDateString("id-ID")}</div>
              </div>
            ))}
            {members.filter(m => m.lastLogin).length === 0 && (
              <div className="text-sm text-ink-muted py-4 text-center">Belum ada login.</div>
            )}
          </div>
        </div>
        <div className="card-glass p-7">
          <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">Content Engine</div>
          <h3 className="font-display text-xl font-semibold text-ink mb-4">Update mingguan</h3>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-start gap-2 text-ink"><Icon name="check" className="w-4 h-4 text-mint-500 mt-0.5"/> 1 prompt baru / minggu</li>
            <li className="flex items-start gap-2 text-ink"><Icon name="check" className="w-4 h-4 text-mint-500 mt-0.5"/> 1 workflow baru / minggu</li>
            <li className="flex items-start gap-2 text-ink"><Icon name="check" className="w-4 h-4 text-mint-500 mt-0.5"/> 1 AI guide update / minggu</li>
          </ul>
          <div className="mt-5 pt-5 border-t border-line text-xs text-ink-muted">
            Status: <span className="text-mint-500 font-medium">Alive</span> · Last published: {new Date().toLocaleDateString("id-ID")}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => {
  const tone = {
    violet: "bg-violet-500/15 text-violet-300",
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
  const [members, setMembers] = useState(loadMembers());
  const [genOpen, setGenOpen] = useState(false);
  const [search, setSearch] = useState("");
  const toast = useToast();

  const refresh = () => setMembers(loadMembers());

  const updateMember = (code, patch) => {
    const next = loadMembers().map(m => m.code === code ? { ...m, ...patch } : m);
    saveMembers(next);
    refresh();
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
        <button onClick={() => setGenOpen(true)} className="btn btn-primary">
          <Icon name="sparkles" className="w-4 h-4"/> Generate Kode Baru
        </button>
      </div>

      <div className="card-glass p-4 mb-4">
        <div className="relative">
          <Icon name="search" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft"/>
          <input value={search} onChange={(e)=>setSearch(e.target.value)}
            placeholder="Cari nama atau kode..."
            className="w-full bg-white/5 border border-line rounded-lg pl-10 pr-3 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:border-violet-400"/>
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
                    <MemberActions member={m} updateMember={updateMember} onDelete={() => { const next = loadMembers().filter(x => x.code !== m.code); saveMembers(next); refresh(); toast.push("Member dihapus"); }}/>
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

      <GenerateModal open={genOpen} onClose={() => setGenOpen(false)} onCreated={refresh}/>
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

const MemberActions = ({ member, updateMember, onDelete }) => {
  const [open, setOpen] = useState(false);
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
          <div className="absolute right-0 top-full mt-1 z-20 card-glass-strong shadow-glass w-48 py-1.5 text-sm">
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
    </div>
  );
};

const GenerateModal = ({ open, onClose, onCreated }) => {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("+20");
  const [duration, setDuration] = useState(30);
  const [generatedCode, setGeneratedCode] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (open) { setName(""); setWhatsapp("+20"); setDuration(30); setGeneratedCode(null); }
  }, [open]);

  const submit = (e) => {
    e?.preventDefault();
    if (!name.trim()) return;
    const existing = loadMembers().map(m => m.code);
    const code = generateCode(existing);
    const now = new Date();
    const expires = new Date(now); expires.setDate(now.getDate() + Number(duration));
    const newMember = {
      code, name: name.trim(), whatsapp, duration: Number(duration),
      status: "active", createdAt: now.toISOString().split("T")[0],
      expiresAt: expires.toISOString().split("T")[0], device: null,
    };
    const all = loadMembers();
    all.unshift(newMember);
    saveMembers(all);
    setGeneratedCode(code);
    onCreated();
  };

  const copyCode = () => { navigator.clipboard.writeText(generatedCode); toast.push("Kode tersalin"); };
  const sendWA = () => {
    const text = `Halo ${name}!%0A%0AKode akses AIGYPT-mu sudah aktif:%0A%0A*${generatedCode}*%0A%0ABuka https://aigypt.app → Login Member → masukkan kode di atas.%0A%0A--Tim AIGYPT`;
    window.open(`https://wa.me/${whatsapp.replace(/\D/g,"")}?text=${text}`, "_blank");
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
              <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Ahmad Fauzi" className="w-full bg-white/5 border border-line rounded-lg px-4 py-2.5 text-ink focus:outline-none focus:border-violet-400"/>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-ink-muted mb-1.5 block">WhatsApp</label>
              <input value={whatsapp} onChange={(e)=>setWhatsapp(e.target.value)} placeholder="+20xxxxxxxxxx" className="w-full bg-white/5 border border-line rounded-lg px-4 py-2.5 text-ink font-mono focus:outline-none focus:border-violet-400"/>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-ink-muted mb-1.5 block">Durasi</label>
              <div className="flex gap-2">
                {[30, 60, 90, 180].map(d => (
                  <button key={d} type="button" onClick={() => setDuration(d)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${duration === d ? "bg-violet-500 text-white" : "bg-white/5 text-ink-muted border border-line hover:bg-white/8"}`}>
                    {d} hari
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={!name.trim()} className={`btn btn-primary w-full ${!name.trim() ? "opacity-50 cursor-not-allowed" : ""}`}>
              Generate <Icon name="sparkles" className="w-4 h-4"/>
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
  // Mock aggregated data, in a real system this would come from server.
  // We'll generate from members + a stable mock distribution.
  const data = {
    totalResponses: 142,
    struggles: [
      { id: "arab", n: 86 }, { id: "makalah", n: 72 }, { id: "referensi", n: 54 },
      { id: "hafalan", n: 48 }, { id: "fokus", n: 31 },
    ],
    faculties: [
      { id: "syariah", n: 52 }, { id: "lughah", n: 38 }, { id: "ushuluddin", n: 24 },
      { id: "dirasat", n: 16 }, { id: "quran", n: 8 }, { id: "umum", n: 4 },
    ],
    levels: [
      { id: "1", n: 38 }, { id: "2", n: 34 }, { id: "3", n: 28 },
      { id: "4", n: 22 }, { id: "mustawa", n: 12 }, { id: "pasca", n: 8 },
    ],
    styles: [
      { id: "discussion", n: 64 }, { id: "summary", n: 58 }, { id: "reading", n: 46 },
      { id: "practice", n: 42 }, { id: "memorization", n: 38 }, { id: "visual", n: 32 },
    ],
  };

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-ink mb-1">Onboarding Data</h1>
      <p className="text-ink-muted mb-8">Total respons: <span className="text-ink font-medium num">{data.totalResponses}</span> dari sesi onboarding.</p>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <AggCard title="Fakultas" items={data.faculties.map(s => ({ label: FACULTIES.find(x => x.id === s.id)?.label, n: s.n }))}/>
        <AggCard title="Tingkat" items={data.levels.map(s => ({ label: LEVELS.find(x => x.id === s.id)?.label, n: s.n }))}/>
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <AggCard title="Top Struggles" items={data.struggles.map(s => ({ label: STRUGGLES.find(x => x.id === s.id)?.label, n: s.n }))}/>
        <AggCard title="Gaya Belajar" items={data.styles.map(s => ({ label: LEARNING_STYLES.find(x => x.id === s.id)?.label, n: s.n }))}/>
      </div>

      <div className="mt-6 card-glass p-6">
        <div className="text-xs uppercase tracking-wider text-gold-400 mb-2">Insight</div>
        <p className="text-ink leading-relaxed">
          Pengguna paling banyak butuh bantuan di area <span className="text-gold-300 font-medium">Materi Arab</span> &amp; <span className="text-gold-300 font-medium">Makalah</span>.
          Gaya belajar dominan: <span className="text-gold-300 font-medium">Diskusi</span> dan <span className="text-gold-300 font-medium">Ringkasan Cepat</span>.
          Prioritaskan content engine untuk dua kombinasi ini.
        </p>
      </div>
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
              <div className="h-full bg-gradient-to-r from-violet-500 to-gold-400 transition-all" style={{width: `${(it.n/max)*100}%`}}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============== AI GUIDE MANAGER ============== */
const AdminGuides = () => {
  const [selectedTool, setSelectedTool] = useState(AI_TOOLS[0].id);
  const [selectedStyle, setSelectedStyle] = useState("discussion");
  const tool = AI_TOOLS.find(t => t.id === selectedTool);
  const guide = tool.guides[selectedStyle];

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-ink mb-1">AI Guide Manager</h1>
      <p className="text-ink-muted mb-8">36 adaptive guide variants (6 tools × 6 learning styles). Edit konten per kombinasi.</p>

      <div className="grid lg:grid-cols-12 gap-5">
        <div className="lg:col-span-3 space-y-4">
          <div className="card-glass p-4">
            <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">Tools</div>
            <div className="space-y-1">
              {AI_TOOLS.map(t => (
                <button key={t.id} onClick={() => setSelectedTool(t.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-2.5 ${selectedTool === t.id ? "bg-violet-500/15 text-ink border border-violet-400/30" : "text-ink-muted hover:bg-white/5 hover:text-ink"}`}>
                  <span className="w-7 h-7 rounded-md flex items-center justify-center text-[9px] font-mono font-bold text-white" style={{background: t.color}}>{t.monogram}</span>
                  <span className="font-medium">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="card-glass p-4">
            <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">Style</div>
            <div className="space-y-1">
              {LEARNING_STYLES.map(s => (
                <button key={s.id} onClick={() => setSelectedStyle(s.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${selectedStyle === s.id ? "bg-violet-500/15 text-ink" : "text-ink-muted hover:bg-white/5 hover:text-ink"}`}>
                  <span className="text-base">{s.emoji}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-9 space-y-5">
          <div className="card-glass p-6 flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-mono font-bold text-white" style={{background: tool.color}}>{tool.monogram}</span>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wider text-gold-400">{LEARNING_STYLES.find(s => s.id === selectedStyle)?.label} guide</div>
              <div className="font-display text-2xl text-ink font-semibold">{tool.name}</div>
            </div>
            <span className="chip chip-violet">Editing</span>
          </div>
          <div className="card-glass p-6">
            <div className="text-xs uppercase tracking-wider text-gold-400 mb-2">Kapan dipakai</div>
            <textarea defaultValue={guide.when} className="w-full bg-white/5 border border-line rounded-lg px-4 py-3 text-ink text-sm focus:outline-none focus:border-violet-400 min-h-[80px]" readOnly/>
          </div>
          <div className="card-glass p-6">
            <div className="text-xs uppercase tracking-wider text-gold-400 mb-3">Langkah-langkah</div>
            <ol className="space-y-2">
              {guide.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-md bg-violet-500/15 text-violet-200 text-xs flex items-center justify-center font-bold flex-shrink-0">{i+1}</span>
                  <input defaultValue={step} className="flex-1 bg-white/5 border border-line rounded-lg px-3 py-2 text-ink text-sm focus:outline-none focus:border-violet-400" readOnly/>
                </li>
              ))}
            </ol>
          </div>
          <div className="card-glass p-6">
            <div className="text-xs uppercase tracking-wider text-gold-400 mb-2">Starter prompt</div>
            <textarea defaultValue={guide.starterPrompt} className="w-full bg-white/5 border border-line rounded-lg px-4 py-3 text-ink font-mono text-xs focus:outline-none focus:border-violet-400 min-h-[180px]" readOnly/>
          </div>
          <div className="flex gap-2 justify-end">
            <button disabled className="btn btn-ghost opacity-50 cursor-not-allowed">Save (preview only)</button>
            <button disabled className="btn btn-primary opacity-50 cursor-not-allowed">Publish</button>
          </div>
          <div className="text-xs text-ink-soft text-center">
            Edit live di prototype dimatikan. Di production, perubahan akan disimpan ke database konten.
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============== SETTINGS ============== */
const AdminSettings = () => (
  <div className="max-w-2xl">
    <h1 className="font-display text-4xl font-semibold text-ink mb-1">Settings</h1>
    <p className="text-ink-muted mb-8">Konfigurasi platform.</p>
    <div className="space-y-4">
      <div className="card-glass p-6">
        <div className="text-xs uppercase tracking-wider text-gold-400 mb-2">Brand</div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-ink-muted block mb-1">Nama platform</label>
            <input defaultValue="AIGYPT" className="w-full bg-white/5 border border-line rounded-lg px-4 py-2.5 text-ink"/>
          </div>
          <div>
            <label className="text-xs text-ink-muted block mb-1">Tagline</label>
            <input defaultValue="Panduan Belajar dengan AI untuk Masisir" className="w-full bg-white/5 border border-line rounded-lg px-4 py-2.5 text-ink"/>
          </div>
        </div>
      </div>
      <div className="card-glass p-6">
        <div className="text-xs uppercase tracking-wider text-gold-400 mb-2">WhatsApp Admin</div>
        <input defaultValue="+201xxxxxxxxx" className="w-full bg-white/5 border border-line rounded-lg px-4 py-2.5 text-ink font-mono"/>
      </div>
      <div className="card-glass p-6">
        <div className="text-xs uppercase tracking-wider text-gold-400 mb-2">Reset</div>
        <p className="text-sm text-ink-muted mb-3">Hapus semua data lokal, member, profil, progress.</p>
        <button onClick={() => {
          if (confirm("Hapus SEMUA data lokal? Ini tidak bisa diundo.")) {
            Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
            window.location.reload();
          }
        }} className="btn btn-ghost text-rose-600 border-rose-600/30 hover:bg-rose-600/10">Reset semua data</button>
      </div>
    </div>
  </div>
);

window.AdminPage = AdminPage;
