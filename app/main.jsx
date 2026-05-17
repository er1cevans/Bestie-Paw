/* ============================================
   BestiePaw — Main App Component with Routing
   ============================================ */

function BPApp() {
  const { route, navigate } = useRouter();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [lang, setLangState] = useState(localStorage.getItem('bp_lang') || 'zh');

  const setLang = (l) => { setLangState(l); localStorage.setItem('bp_lang', l); };

  // Check auth on mount
  useEffect(() => {
    (async () => {
      if (tokenStore.access) {
        try {
          const u = await smartApi.users.me();
          setUser(u);
        } catch { tokenStore.clear(); }
      }
      setAuthLoading(false);
    })();
  }, []);

  const login = async (email, password) => {
    const result = await smartApi.auth.login({ email, password });
    tokenStore.set(result.accessToken, result.refreshToken);
    setUser(result.user);
    return result;
  };

  const register = async (data) => {
    const result = await smartApi.auth.register(data);
    tokenStore.set(result.accessToken, result.refreshToken);
    setUser(result.user);
    return result;
  };

  const logout = async () => {
    try { await smartApi.auth.logout(); } catch {}
    tokenStore.clear();
    setUser(null);
    navigate('/');
  };

  const authValue = { user, setUser, login, register, logout, loading: authLoading };
  const langValue = { lang, setLang };

  // Redirect logic
  useEffect(() => {
    if (authLoading) return;
    const isAppRoute = route.startsWith('/app');
    const isAuthRoute = ['/login', '/register', '/pet-profile', '/complete'].some(r => route === r);
    if (isAppRoute && !user && !tokenStore.access) navigate('/login');
  }, [route, authLoading, user]);

  if (authLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <BPLoading size={40} />
    </div>
  );

  // Route matching
  const renderRoute = () => {
    if (route === '/' || route === '' || route === '/home') return <HomePage />;
    if (route === '/login') return <LoginPage />;
    if (route === '/register') return <RegisterPage />;
    if (route === '/pet-profile') return <PetProfilePage />;
    if (route === '/complete') return <CompletePage />;

    // App routes (authenticated)
    if (route.startsWith('/app')) {
      const appRoute = route;
      let content;
      if (appRoute === '/app' || appRoute === '/app/') content = <DashboardPage />;
      else if (appRoute.startsWith('/app/health')) content = <HealthPage />;
      else if (appRoute === '/app/community') content = <CommunityPage />;
      else if (appRoute === '/app/ai') content = <AIPage />;
      else if (appRoute === '/app/reminders') content = <RemindersPage />;
      else if (appRoute === '/app/profile') content = <ProfilePage />;
      else content = <DashboardPage />;

      return <AppShell currentRoute={appRoute}>{content}</AppShell>;
    }

    return <HomePage />;
  };

  return (
    <AuthContext.Provider value={authValue}>
      <LangContext.Provider value={langValue}>
        <ToastProvider>
          <div className="bp-app" style={{ fontFamily: 'var(--font-body)' }}>
            {/* Demo mode indicator */}
            <DemoBanner />
            {renderRoute()}
          </div>
        </ToastProvider>
      </LangContext.Provider>
    </AuthContext.Provider>
  );
}

// ---- Demo Mode Banner ----
function DemoBanner() {
  const [isDemo, setIsDemo] = useState(null);
  const t = useT();
  useEffect(() => { checkBackend().then(d => setIsDemo(d)); }, []);
  if (!isDemo) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9998, background: 'var(--text)', color: 'var(--bg)',
      padding: '0.4rem 1rem', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600,
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 6,
      opacity: 0.85,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4CAF82', display: 'inline-block' }}></span>
      {t.demo} — demo@bestiepaw.com / any password
    </div>
  );
}

// Mount
const rootEl = document.getElementById('bp-root');
ReactDOM.createRoot(rootEl).render(<BPApp />);
