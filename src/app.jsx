/* Talqih, App shell + routing */

const App = () => {
  const path = useRoute();
  const { session, profile } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  useEffect(() => {
    const s = document.getElementById("splash");
    if (s) { s.style.opacity = "0"; setTimeout(() => s.remove(), 580); }
  }, []);

  // Auto-redirect logic on path change
  useEffect(() => {
    // Member-only routes
    const memberOnly = ["/dashboard", "/tools", "/paths", "/onboarding", "/kurasah", "/maddah"];
    const isMemberRoute = memberOnly.some(r => path === r || path.startsWith(r + "?") || path.startsWith(r + "/"));
    if (isMemberRoute && !session) {
      navigate("/");
      setTimeout(() => setLoginOpen(true), 100);
      return;
    }
    // If member without profile and tries dashboard/tools/paths → redirect to onboarding
    if (session && profile && !profile.onboarded) {
      if (path === "/dashboard" || path.startsWith("/tools") || path === "/paths") {
        navigate("/onboarding");
      }
    }
  }, [path, session, profile]);

  const handleLoginSuccess = (result) => {
    setLoginOpen(false);
    const p = getProfile();
    if (!p?.onboarded) navigate("/onboarding");
    else navigate("/dashboard");
  };

  const openPayment = () => { setLoginOpen(false); setPaymentOpen(true); };
  const openLogin  = () => { setPaymentOpen(false); setLoginOpen(true); };

  const isAdmin = path === "/admin" || path.startsWith("/admin/");
  const isPublic = path === "/" || path.startsWith("/sample/") || path === "/ethics";

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
  let page = <LandingPage onOpenLogin={openLogin} onOpenPayment={openPayment}/>;
  if (path.startsWith("/sample/nahwu"))             { page = <SampleNahwuPage/>; routeLabel = "Sample Nahwu"; }
  else if (path === "/ethics")            { page = <EthicsPage/>; routeLabel = "Etika"; }
  else if (path === "/onboarding")   { page = <OnboardingPage/>; routeLabel = "Onboarding"; }
  else if (path === "/dashboard")    { page = <DashboardPage/>; routeLabel = "Dashboard"; }
  else if (path.startsWith("/tools")) { page = <ToolGuidePage/>; routeLabel = "Tool Guide"; }
  else if (path === "/paths")                              { page = <PathsPage/>; routeLabel = "Learning Path"; }
  else if (path === "/paths/muqaranah" && !path.includes("?id=")) { page = <MuqaranahPage/>; routeLabel = "Muqaranah"; }
  else if (path.startsWith("/paths/muqaranah?id="))       { page = <MuqaranahDetailPage/>; routeLabel = "Muqaranah Detail"; }
  else if (path === "/paths/muqaranah/new" || path.startsWith("/paths/muqaranah/new?")) { page = <MuqaranahFormPage/>; routeLabel = "Susun Muqaranah"; }
  else if (path === "/kurasah" && !path.includes("?id=")) { page = <KurasahPage/>; routeLabel = "Kurasah"; }
  else if (path.startsWith("/kurasah?id="))               { page = <KurasahEditorPage/>; routeLabel = "Kurasah Editor"; }
  else if (path === "/kurasah/new")                        { page = <KurasahEditorPage/>; routeLabel = "Catatan Baru"; }
  else if (path.startsWith("/mapel"))                       { page = <MapelPage/>; routeLabel = "Panduan Mapel"; }
  else if (path === "/maddah" || path === "/maddah/")      { page = <MaddahHubPage/>; routeLabel = "Maddah"; }
  else if (path.startsWith("/maddah/"))                    { page = <MaddahDetailPage/>; routeLabel = "Maddah"; }

  // QuickNote muncul di semua halaman member yang sudah onboarded, kecuali admin & public
  const showQuickNote = session && profile?.onboarded && !isAdmin && !isPublic;
  const isMember = session && profile?.onboarded;

  return (
    <ToastProvider>
      <div data-screen-label={routeLabel} className="min-h-screen flex flex-col">
        <Navbar onOpenLogin={openLogin} onOpenPayment={openPayment}/>
        <main className={"flex-1" + (isMember ? " has-tabbar" : "")}>
          {page}
        </main>
        <Footer/>
      </div>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onSuccess={handleLoginSuccess}/>
      <PaymentModal open={paymentOpen} onClose={() => setPaymentOpen(false)} onOpenLogin={openLogin}/>
      {showQuickNote && <QuickNoteButton/>}
      {isMember && <MobileTabBar/>}
    </ToastProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);
