import React, { useState, useEffect } from 'react';
import TutorialModal, { openTutorial } from './components/tutorial-modal.jsx';

/* Talqih, App shell + routing */

/* ── Error Boundary (BN-6) ── */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("Talqeeh ErrorBoundary:", error, info?.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight:"100vh", display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          background:"#0c0c0c", padding:"24px", textAlign:"center",
        }}>
          <div style={{fontFamily:"Georgia,'Times New Roman',serif",fontSize:"2rem",color:"#C9A86A",marginBottom:"12px"}}>
            تَلْقِيح
          </div>
          <h2 style={{fontFamily:"DM Sans,sans-serif",color:"#F5F0FF",fontSize:"1.25rem",marginBottom:"8px"}}>
            Ada yang tidak beres
          </h2>
          <p style={{color:"#6ee7b7",fontSize:"0.9rem",marginBottom:"24px",maxWidth:"320px",lineHeight:"1.6"}}>
            Coba refresh halaman. Kalau masalah berlanjut, hubungi admin Talqeeh.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background:"linear-gradient(160deg,#3ecf8e,#2aa870)", color:"#0c0c0c",
              border:"none", borderRadius:"12px", padding:"12px 28px",
              fontSize:"15px", cursor:"pointer", fontFamily:"DM Sans,sans-serif",
            }}>
            Refresh Halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Paket yang dipilih sebelum login; bertahan melewati redirect OAuth Google.
const JOIN_PLAN_KEY = "talqeeh_join_plan";
const readJoinPlan = () => { try { return localStorage.getItem(JOIN_PLAN_KEY); } catch { return null; } };
const saveJoinPlan = (plan) => {
  try { plan ? localStorage.setItem(JOIN_PLAN_KEY, plan) : localStorage.removeItem(JOIN_PLAN_KEY); } catch {}
};

// Halaman premium yang terkunci untuk akun gratis (cocok awalan path).
const FREE_LOCKED_PATHS = ["/siap-imtihan", "/paths", "/prompt-library", "/tools", "/s2-maddah"];
const isFreeLocked = (path) => FREE_LOCKED_PATHS.some(p => path === p || path.startsWith(p + "/") || path.startsWith(p + "?"));

const gabungPath = (plan) => `/gabung${plan ? `?plan=${plan}` : ""}`;

const App = () => {
  const path = useRoute();
  const { session, profile, authStatus, isFree } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [joinPlan, setJoinPlan] = useState(null);
  const [aiPaymentOpen, setAiPaymentOpen] = useState(false);

  useEffect(() => {
    const s = document.getElementById("splash");
    if (s) { s.style.opacity = "0"; setTimeout(() => s.remove(), 580); }
  }, []);

  // Sudah login Google tapi belum punya akun → halaman Gabung (juga jalur balik dari redirect OAuth).
  useEffect(() => {
    if (authStatus === "needs_activation") {
      setLoginOpen(false);
      if (!path.startsWith("/gabung")) navigate(gabungPath(readJoinPlan()));
    } else if (authStatus === "inactive") {
      setLoginOpen(true);
    }
  }, [authStatus]);

  // Auto-redirect logic on path change
  useEffect(() => {
    const memberOnly = [
      "/dashboard", "/library", "/tools", "/paths", "/onboarding",
      "/kurasah", "/maddah", "/siap-imtihan",
      "/s2-maddah", "/mahad-maddah", "/prompt-library",
      "/soal-detail", "/ai-partner", "/statistik", "/profil-belajar",
    ];
    const isMemberRoute = memberOnly.some(r => path === r || path.startsWith(r + "?") || path.startsWith(r + "/"));

    // 1) Belum punya akun tapi buka route terproteksi → login dulu, atau ke halaman Gabung kalau sudah login Google
    if (isMemberRoute && !session) {
      if (authStatus === "needs_activation") { navigate(gabungPath()); return; }
      navigate("/");
      setTimeout(() => setLoginOpen(true), 100);
      return;
    }

    // 2) Sudah login & sedang di landing murni → dorong ke "rumah"-nya
    //    (jangan ganggu /maddah-publik, /framework, /ethics, /sample — itu memang publik)
    if (session && (path === "/" || path === "")) {
      navigate(profile?.onboarded ? "/dashboard" : "/onboarding");
      return;
    }

    // 3) Sudah login tapi belum onboarded & nyasar ke halaman member → ke onboarding
    if (session && profile && !profile.onboarded) {
      if (path === "/dashboard" || path === "/library" || path.startsWith("/tools") || path === "/paths") {
        navigate("/onboarding");
      }
    }
  }, [path, session, profile, authStatus]);

  const handleLoginSuccess = (plan) => {
    setLoginOpen(false);
    const saved = plan || readJoinPlan();
    saveJoinPlan(null);
    // Akun gratis yang tadinya memilih paket berbayar → lanjut ke halaman Gabung untuk upgrade.
    if (isFreeTier() && (saved === "library" || saved === "library_ai")) {
      setTimeout(() => navigate(gabungPath(saved)), 50);
      return;
    }
    const p = getProfile();
    setTimeout(() => navigate(!p?.onboarded ? "/onboarding" : "/dashboard"), 50);
    if (saved === "library_ai") setTimeout(() => setAiPaymentOpen(true), 400);
  };

  // Semua tombol "Gabung": login dulu → halaman Gabung (pilih gratis/berbayar). Member Library yang pilih AI → langganan AI.
  const openJoin = (plan = "library") => {
    setAiPaymentOpen(false);
    if (session) {
      setLoginOpen(false);
      if (isFree) navigate(gabungPath(plan));
      else if (plan === "library_ai") setAiPaymentOpen(true);
      else navigate(profile?.onboarded ? "/dashboard" : "/onboarding");
      return;
    }
    saveJoinPlan(plan);
    setJoinPlan(plan);
    if (authStatus === "needs_activation") { setLoginOpen(false); navigate(gabungPath(plan)); }
    else setLoginOpen(true);
  };
  // keepPlan: dipanggil dari halaman Gabung setelah pengunjung memilih paket (plan sudah disimpan).
  const openLogin = (keepPlan = false) => {
    if (keepPlan !== true) saveJoinPlan(null);
    setJoinPlan(keepPlan === true ? readJoinPlan() : null);
    setAiPaymentOpen(false);
    setLoginOpen(true);
  };

  // Halaman tanpa props (bank soal publik, sample) memicu alur gabung lewat event.
  useEffect(() => {
    const onOpenJoin = (e) => openJoin(e.detail?.plan || "library");
    const onOpenLogin = (e) => openLogin(!!e.detail?.keepPlan);
    window.addEventListener("talqeeh:open-join", onOpenJoin);
    window.addEventListener("talqeeh:open-login", onOpenLogin);
    return () => {
      window.removeEventListener("talqeeh:open-join", onOpenJoin);
      window.removeEventListener("talqeeh:open-login", onOpenLogin);
    };
  }, [session, authStatus, profile, isFree]);

  const isAdmin = path === "/admin" || path.startsWith("/admin/");
  const isPublic = path === "/" || path.startsWith("/gabung") || path.startsWith("/sample/") || path === "/ethics" || path === "/privacy" || path === "/maddah-publik" || path.startsWith("/framework") || path === "/tutorial" || path === "/submit-soal" || path === "/bank-soal" || path === "/checklist-soal";

  // Admin gets its own layout (no public nav/footer)
  if (isAdmin) {
    return (
      <ToastProvider>
        <div data-screen-label="Admin">
          <AdminPage/>
        </div>
      </ToastProvider>
    );
  }

  let routeLabel = "Beranda";
  let page = <LandingPage onOpenLogin={openLogin} onOpenJoin={openJoin}/>;
  if (session && isFree && isFreeLocked(path))      { page = <FreeUpgradeWall path={path}/>; routeLabel = "Khusus Library"; }
  else if (path === "/gabung" || path.startsWith("/gabung?")) { page = <GabungPage key={path}/>; routeLabel = "Gabung"; }
  else if (path.startsWith("/sample/nahwu"))        { page = <SampleNahwuPage/>; routeLabel = "Sample Nahwu"; }
  else if (path === "/ethics")            { page = <EthicsPage/>; routeLabel = "Etika"; }
  else if (path === "/privacy")           { page = <PrivacyPage/>; routeLabel = "Kebijakan Privasi"; }
  else if (path === "/maddah-publik")    { page = <MaddahPublikPage onOpenPayment={() => openJoin("library")} onOpenJoin={openJoin} onOpenLogin={openLogin}/>; routeLabel = "Katalog Maddah"; }
  else if (path === "/onboarding" || path.startsWith("/onboarding?"))   { page = <OnboardingPage/>; routeLabel = "Onboarding"; }
  else if (path === "/welcome")      { page = <WelcomePage/>; routeLabel = "Selamat Datang"; }
  else if (path === "/dashboard")    { page = <DashboardPage/>; routeLabel = "Beranda Member"; }
  else if (path === "/library")      { page = <LibraryPage/>; routeLabel = "Library"; }
  else if (path === "/statistik")    { page = <StatistikPage/>; routeLabel = "Statistik Belajarku"; }
  else if (path === "/profil-belajar" || path.startsWith("/profil-belajar?")) { page = <ProfilBelajarPage key={path}/>; routeLabel = "Profil Belajar"; }
  else if (path.startsWith("/tools")) { page = <ToolGuidePage/>; routeLabel = "Tool Guide"; }
  else if (path === "/paths")                              { page = <PathsPage/>; routeLabel = "Learning Path"; }
  else if (path === "/paths/muqaranah" && !path.includes("?id=")) { page = <MuqaranahPage/>; routeLabel = "Muqaranah"; }
  else if (path.startsWith("/paths/muqaranah?id="))       { page = <MuqaranahDetailPage/>; routeLabel = "Muqaranah Detail"; }
  else if (path === "/paths/muqaranah/new" || path.startsWith("/paths/muqaranah/new?")) { page = <MuqaranahFormPage/>; routeLabel = "Susun Muqaranah"; }
  else if (path === "/kurasah" && !path.includes("?id=")) { page = <KurasahPage/>; routeLabel = "Kurasah"; }
  else if (path.startsWith("/kurasah?id="))               { page = <KurasahEditorPage/>; routeLabel = "Kurasah Editor"; }
  else if (path === "/kurasah/new")                        { page = <KurasahEditorPage/>; routeLabel = "Catatan Baru"; }
  else if (path.startsWith("/mapel"))                       { const subPath = path.replace(/^\/mapel/, ''); navigate("/maddah" + subPath); page = null; routeLabel = "Maddah"; }
  else if (path === "/maddah" || path === "/maddah/")      { page = <MaddahHubPage/>; routeLabel = "Maddah"; }
  else if (path.startsWith("/maddah/"))                    { page = <MaddahDetailErrorBoundary><MaddahDetailPage/></MaddahDetailErrorBoundary>; routeLabel = "Maddah"; }
  else if (path === "/siap-imtihan" || path.startsWith("/siap-imtihan")) { page = <SiapImtihanPage/>; routeLabel = "Siap Imtihan"; }
  else if (path.startsWith("/soal-detail/")) { page = <SoalDetailPage/>; routeLabel = "Detail Soal"; }
  else if (path === "/s2-maddah" || path.startsWith("/s2-maddah")) { page = <S2MaddahPage/>; routeLabel = "Maddah S2"; }
  else if (path === "/prompt-library") { page = <PromptLibraryPage/>; routeLabel = "Prompt Library"; }
  else if (path.startsWith("/mahad-maddah/")) { page = <MahadDetailPage/>; routeLabel = "Maddah Ma'had"; }
  else if (path === "/mahad-maddah" || path.startsWith("/mahad-maddah?")) { page = <MahadMaddahPage/>; routeLabel = "Maddah Ma'had"; }
  else if (path.startsWith("/framework/")) { page = <FrameworkDetailPage/>; routeLabel = "Framework Detail"; }
  else if (path === "/framework") { page = <FrameworkPage/>; routeLabel = "Framework Belajar"; }
  else if (path === "/tutorial") { page = <TutorialPage/>; routeLabel = "Tutorial"; }
  else if (path === "/submit-soal") { page = <SubmitSoalPage/>; routeLabel = "Submit Soal"; }
  else if (path === "/bank-soal") { page = <BankSoalPublikPage/>; routeLabel = "Bank Soal"; }
  else if (path === "/checklist-soal") { page = <ChecklistSoalPage/>; routeLabel = "Checklist Soal"; }
  else if (path === "/ai-partner" || path === "/ai-partner/") { page = <AiPartnerPage/>; routeLabel = "AI Partner"; }
  else if (path.startsWith("/ai-partner/")) { page = <AiPartnerDetailPage key={path} setId={path.split("/")[2].split("?")[0]}/>; routeLabel = "AI Partner"; }

  // QuickNote muncul di semua halaman member yang sudah onboarded, kecuali admin & public
  const showQuickNote = session && profile?.onboarded && !isAdmin && !isPublic;
  const isMember = session && profile?.onboarded;

  return (
    <ToastProvider>
      <div data-screen-label={routeLabel} className="min-h-screen flex flex-col">
        <Navbar onOpenLogin={openLogin} onOpenPayment={() => openJoin("library")}/>
        <main className={"flex-1" + (isMember ? " has-tabbar" : "")}>
          <ErrorBoundary>{page}</ErrorBoundary>
        </main>
        <Footer/>
      </div>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onSuccess={handleLoginSuccess} joinPlan={joinPlan}/>
      <AiSubscriptionModal open={aiPaymentOpen} onClose={() => setAiPaymentOpen(false)} onNeedMembership={() => openJoin("library_ai")}/>
      {showQuickNote && <QuickNoteButton/>}
      {isMember && <SupportButton/>}
      {isMember && <MobileTabBar/>}
      <TutorialModal/>
    </ToastProvider>
  );
};

export default App;
