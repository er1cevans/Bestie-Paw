/* ============================================
   BestiePaw — App Shell: Sidebar, Dashboard
   ============================================ */

// ---- Sidebar Navigation ----
function AppSidebar({ currentRoute }) {
  const t = useT();
  const { navigate } = useRouter();
  const { user, logout } = useAuth();
  const { lang, setLang } = useLang();
  const [collapsed, setCollapsed] = useState(false);

  const links = [
    { path: '/app', label: t.dash.overview, icon: Icons.home },
    { path: '/app/health', label: t.dash.health, icon: Icons.activity },
    { path: '/app/community', label: t.dash.community, icon: Icons.messageCircle },
    { path: '/app/ai', label: t.dash.ai, icon: Icons.cpu },
    { path: '/app/reminders', label: t.dash.reminders, icon: Icons.bell },
    { path: '/app/profile', label: t.dash.profile, icon: Icons.user },
  ];

  const isActive = (path) => {
    if (path === '/app') return currentRoute === '/app' || currentRoute === '/app/';
    return currentRoute.startsWith(path);
  };

  return (
    <aside className="bp-sidebar" style={{
      width: collapsed ? 72 : 240, minHeight: '100vh', background: 'var(--sidebar-bg)',
      display: 'flex', flexDirection: 'column', transition: 'width 0.25s ease',
      flexShrink: 0, position: 'relative', overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '1.25rem 0.75rem' : '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: 8, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>
          {collapsed ? 'B' : 'Bestie'}
        </span>
        {!collapsed && <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--sidebar-text)', fontFamily: 'var(--font-display)' }}>Paw</span>}
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {links.map(link => {
          const active = isActive(link.path);
          const Ico = link.icon;
          return (
            <a key={link.path} href={`#${link.path}`} onClick={e => { e.preventDefault(); navigate(link.path); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: collapsed ? '0.7rem' : '0.7rem 1rem',
                borderRadius: 10, textDecoration: 'none', transition: 'all 0.18s',
                background: active ? 'rgba(192,82,48,0.15)' : 'transparent',
                color: active ? 'var(--primary)' : 'var(--sidebar-text)',
                fontWeight: active ? 600 : 400, fontSize: '0.875rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
              title={collapsed ? link.label : undefined}
            >
              <Ico style={{ width: 20, height: 20, flexShrink: 0 }} />
              {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{link.label}</span>}
            </a>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Language toggle */}
        <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
          padding: collapsed ? '0.6rem' : '0.6rem 1rem', borderRadius: 10,
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sidebar-text)',
          fontSize: '0.82rem', justifyContent: collapsed ? 'center' : 'flex-start', opacity: 0.6,
        }}>
          <Icons.globe style={{ width: 18, height: 18, flexShrink: 0 }} />
          {!collapsed && <span>{lang === 'zh' ? 'English' : '中文'}</span>}
        </button>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)} style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
          padding: collapsed ? '0.6rem' : '0.6rem 1rem', borderRadius: 10,
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sidebar-text)',
          fontSize: '0.82rem', justifyContent: collapsed ? 'center' : 'flex-start', opacity: 0.6,
        }}>
          {collapsed ? <Icons.chevronRight style={{ width: 18, height: 18 }} /> : <Icons.chevronLeft style={{ width: 18, height: 18 }} />}
          {!collapsed && <span>{lang === 'zh' ? '收起' : 'Collapse'}</span>}
        </button>

        {/* Logout */}
        <button onClick={logout} style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
          padding: collapsed ? '0.6rem' : '0.6rem 1rem', borderRadius: 10,
          background: 'none', border: 'none', cursor: 'pointer', color: '#E8604A',
          fontSize: '0.82rem', justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <Icons.logOut style={{ width: 18, height: 18, flexShrink: 0 }} />
          {!collapsed && <span>{t.dash.logout}</span>}
        </button>

        {/* User */}
        {!collapsed && user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem 0.5rem 0.25rem', marginTop: 4 }}>
            <BPAvatar name={user.username} size={32} />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--sidebar-text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.username}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.email}</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

// ---- Mobile Bottom Nav ----
function MobileNav({ currentRoute }) {
  const t = useT();
  const { navigate } = useRouter();
  const links = [
    { path: '/app', label: t.dash.overview, icon: Icons.home },
    { path: '/app/health', label: t.dash.health, icon: Icons.activity },
    { path: '/app/community', label: t.dash.community, icon: Icons.messageCircle },
    { path: '/app/ai', label: t.dash.ai, icon: Icons.cpu },
    { path: '/app/profile', label: t.dash.profile, icon: Icons.user },
  ];
  const isActive = (path) => path === '/app' ? (currentRoute === '/app' || currentRoute === '/app/') : currentRoute.startsWith(path);

  return (
    <nav className="bp-mobile-nav" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'var(--bg)', borderTop: '1px solid var(--border)',
      display: 'none', padding: '0.4rem 0.5rem calc(0.4rem + env(safe-area-inset-bottom, 0px))',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        {links.map(link => {
          const active = isActive(link.path);
          const Ico = link.icon;
          return (
            <a key={link.path} href={`#${link.path}`} onClick={e => { e.preventDefault(); navigate(link.path); }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                textDecoration: 'none', color: active ? 'var(--primary)' : 'var(--text-3)',
                fontSize: '0.65rem', fontWeight: active ? 600 : 400, padding: '0.3rem 0.5rem',
              }}>
              <Ico style={{ width: 22, height: 22 }} />
              <span>{link.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}

// ---- App Layout Shell ----
function AppShell({ children, currentRoute }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)' }}>
      <AppSidebar currentRoute={currentRoute} />
      <main className="bp-app-main" style={{ flex: 1, overflow: 'auto', padding: '2rem', minWidth: 0, paddingBottom: '5rem' }}>
        {children}
      </main>
      <MobileNav currentRoute={currentRoute} />
    </div>
  );
}

// ---- Dashboard Overview ----
function DashboardPage() {
  const t = useT();
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [pets, setPets] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const petList = await smartApi.pets.list();
        setPets(petList);
        if (petList.length > 0) {
          const [rems, health] = await Promise.all([
            smartApi.reminders.list(petList[0].id).catch(() => []),
            smartApi.health.list(petList[0].id).catch(() => []),
          ]);
          setReminders(rems);
          setRecords(health);
        }
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <BPLoading />;

  const petTypeIcon = { dog: '🐶', cat: '🐱', rabbit: '🐰', bird: '🐦', fish: '🐟', other: '🐾' };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Welcome */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>
          {t.dash.hello}, {user?.username || 'PetLover'} 👋
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>
          {new Date().toLocaleDateString(useLang().lang === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* My Pets */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{t.dash.myPets}</h2>
          <BPButton variant="soft" size="sm" onClick={() => navigate('/pet-profile')}>
            <Icons.plus style={{ width: 16, height: 16 }} />
            {t.dash.addPet}
          </BPButton>
        </div>

        {pets.length === 0 ? (
          <BPEmpty icon={<PawDots size={80} />} title={t.dash.noPets} description={t.dash.noPetsDesc} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260, 1fr))', gap: '1rem' }} className="bp-pet-grid">
            {pets.map(pet => (
              <div key={pet.id} onClick={() => navigate(`/app/health?pet=${pet.id}`)} style={{
                background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 18,
                padding: '1.25rem', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s',
                display: 'flex', alignItems: 'center', gap: '1rem',
              }} className="bp-card-hover">
                <div style={{
                  width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--primary-light)', fontSize: '1.5rem', flexShrink: 0,
                }}>
                  {pet.avatarUrl ? <img src={pet.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} /> : petTypeIcon[pet.type] || '🐾'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 2 }}>{pet.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>
                    {pet.breed || pet.type} · {pet.weightKg ? `${pet.weightKg}kg` : ''}
                  </div>
                </div>
                <Icons.chevronRight style={{ width: 18, height: 18, color: 'var(--text-3)', marginLeft: 'auto', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="bp-dash-grid">
        {/* Upcoming Reminders */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 18, padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{t.dash.upcoming}</h3>
            <a href="#/app/reminders" onClick={e => { e.preventDefault(); navigate('/app/reminders'); }} style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>{t.dash.viewAll}</a>
          </div>
          {reminders.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', padding: '1rem 0' }}>{t.remindersPage.noReminders}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {reminders.slice(0, 3).map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--gold-light, #FDF5E6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icons.bell style={{ width: 16, height: 16, color: 'var(--gold, #B8943E)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{r.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{new Date(r.dueDate).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 18, padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>{t.dash.quickActions}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { icon: Icons.plus, label: t.dash.addRecord, color: 'var(--primary)', bg: 'var(--primary-light)', path: '/app/health' },
              { icon: Icons.bell, label: t.dash.setReminder, color: 'var(--gold, #B8943E)', bg: '#FDF5E6', path: '/app/reminders' },
              { icon: Icons.messageCircle, label: t.dash.community, color: 'var(--secondary)', bg: 'var(--secondary-light)', path: '/app/community' },
              { icon: Icons.cpu, label: t.dash.ai, color: '#6B4C8A', bg: '#F0EDFE', path: '/app/ai' },
            ].map((a, i) => {
              const Ico = a.icon;
              return (
                <button key={i} onClick={() => navigate(a.path)} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
                  padding: '0.65rem 0.75rem', borderRadius: 12, background: 'transparent',
                  border: 'none', cursor: 'pointer', transition: 'background 0.15s',
                  fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)', fontFamily: 'inherit',
                  textAlign: 'left',
                }} className="bp-action-btn">
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Ico style={{ width: 16, height: 16, color: a.color }} />
                  </div>
                  <span>{a.label}</span>
                  <Icons.chevronRight style={{ width: 16, height: 16, color: 'var(--text-3)', marginLeft: 'auto' }} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Health Timeline */}
      {records.length > 0 && (
        <div style={{ marginTop: '1.5rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 18, padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{t.dash.healthTimeline}</h3>
            <a href="#/app/health" onClick={e => { e.preventDefault(); navigate('/app/health'); }} style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>{t.dash.viewAll}</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {records.slice(0, 4).map((r, i) => {
              const typeColors = { vaccine: '#2B7A5F', checkup: '#2E7D9B', medication: '#B8943E', surgery: '#C05230' };
              return (
                <div key={r.id} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                  {/* Timeline line */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: typeColors[r.type] || 'var(--primary)', flexShrink: 0, marginTop: 6 }}></div>
                    {i < records.slice(0, 4).length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border)' }}></div>}
                  </div>
                  <div style={{ flex: 1, paddingBottom: '1rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: 2 }}>{new Date(r.date).toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{r.title}</div>
                    {r.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginTop: 2, lineHeight: 1.5 }}>{r.description}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { AppSidebar, MobileNav, AppShell, DashboardPage });
