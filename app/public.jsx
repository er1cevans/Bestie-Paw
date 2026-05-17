/* ============================================
   BestiePaw — Public Pages: Home, Login, Register, Pet Profile, Complete
   ============================================ */

// ---- Public Navbar ----
function PublicNav() {
  const t = useT();
  const { lang, setLang } = useLang();
  const { navigate } = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem',
    background: scrolled ? 'rgba(253,251,247,0.92)' : 'transparent',
    backdropFilter: scrolled ? 'blur(16px)' : 'none',
    borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
    transition: 'all 0.3s ease',
  };

  return (
    <nav style={navStyle}>
      <a href="#/" onClick={e => { e.preventDefault(); navigate('/'); }} style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
        <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>Bestie</span>
        <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>Paw</span>
      </a>

      <div className="bp-nav-links" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <a href="#features" style={{ textDecoration: 'none', color: 'var(--text-2)', fontSize: '0.9rem', fontWeight: 500 }}>{t.nav.features}</a>
        <a href="#how" style={{ textDecoration: 'none', color: 'var(--text-2)', fontSize: '0.9rem', fontWeight: 500 }}>{t.nav.community}</a>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)',
          display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', fontWeight: 500, padding: '0.3rem',
        }}>
          <Icons.globe style={{ width: 16, height: 16 }} />
          {lang === 'zh' ? 'EN' : '中文'}
        </button>
        <a href="#/login" onClick={e => { e.preventDefault(); navigate('/login'); }} style={{ textDecoration: 'none' }}>
          <BPButton variant="ghost" size="sm">{t.nav.login}</BPButton>
        </a>
        <a href="#/register" onClick={e => { e.preventDefault(); navigate('/register'); }} style={{ textDecoration: 'none' }} className="bp-hide-mobile">
          <BPButton variant="primary" size="sm">{t.nav.getStarted}</BPButton>
        </a>
      </div>

      {/* Mobile hamburger */}
      <button className="bp-hamburger" onClick={() => setMenuOpen(!menuOpen)} style={{
        display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: 'var(--text)',
      }}>
        <Icons.menu style={{ width: 24, height: 24 }} />
      </button>
    </nav>
  );
}

// ---- Homepage ----
function HomePage() {
  const t = useT();
  const { navigate } = useRouter();

  return (
    <div style={{ background: 'var(--bg)' }}>
      <PublicNav />

      {/* Hero */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', padding: '6rem 2rem 4rem',
      }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: '10%', right: '-5%', opacity: 0.04, transform: 'rotate(15deg)' }}>
          <PawDots size={400} opacity={1} />
        </div>
        <div style={{ position: 'absolute', bottom: '5%', left: '-3%', opacity: 0.03, transform: 'rotate(-20deg)' }}>
          <PawDots size={300} opacity={1} />
        </div>

        <div style={{ maxWidth: 780, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className="bp-fade-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'var(--primary-light)', color: 'var(--primary)',
            fontSize: '0.82rem', fontWeight: 600, padding: '0.35rem 1rem',
            borderRadius: '100px', marginBottom: '1.5rem',
          }}>
            <Icons.heart style={{ width: 14, height: 14, fill: 'var(--primary)', stroke: 'var(--primary)' }} />
            {t.hero.eyebrow}
          </div>

          <h1 className="bp-fade-up bp-delay-1" style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 800, lineHeight: 1.1, letterSpacing: '-2px',
            color: 'var(--text)', margin: '0 0 1.25rem',
          }}>
            {t.hero.title1}<br />
            <span style={{ color: 'var(--primary)' }}>{t.hero.title2}</span>
          </h1>

          <p className="bp-fade-up bp-delay-2" style={{
            fontSize: '1.15rem', color: 'var(--text-2)', lineHeight: 1.7,
            maxWidth: 520, margin: '0 auto 2.5rem',
          }}>
            {t.hero.sub}
          </p>

          <div className="bp-fade-up bp-delay-3" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <BPButton variant="primary" size="lg" onClick={() => navigate('/register')}>
              {t.hero.cta}
              <Icons.arrowRight style={{ width: 18, height: 18 }} />
            </BPButton>
            <BPButton variant="ghost" size="lg" onClick={() => document.getElementById('features')?.scrollTo?.({ behavior: 'smooth' }) || (window.location.hash = '#features')}>
              {t.hero.ctaSec}
            </BPButton>
          </div>
        </div>
      </section>

      {/* Features — editorial layout, NOT 3 identical cards */}
      <section id="features" style={{ padding: '6rem 2rem', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <span style={{
            display: 'inline-block', background: 'var(--secondary-light)', color: 'var(--secondary)',
            fontSize: '0.78rem', fontWeight: 600, padding: '0.25rem 0.75rem',
            borderRadius: '100px', marginBottom: '0.75rem', letterSpacing: '0.5px',
          }}>{t.features.label}</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-1px', margin: '0 0 3.5rem', color: 'var(--text)' }}>
            {t.features.title}
          </h2>

          {/* Feature 1 — large spotlight */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem',
            marginBottom: '2rem', alignItems: 'center',
          }} className="bp-feature-grid">
            <div style={{ padding: '2rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, var(--primary-light), #fde8df)', marginBottom: '1.25rem' }}>
                <Icons.shield style={{ width: 24, height: 24, color: 'var(--primary)' }} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>{t.features.health}</h3>
              <p style={{ fontSize: '1rem', color: 'var(--text-2)', lineHeight: 1.7, maxWidth: 380 }}>{t.features.healthDesc}</p>
            </div>
            <div style={{
              background: 'var(--bg)', borderRadius: 20, padding: '2rem',
              border: '1px solid var(--border)', minHeight: 240,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-3)',
            }}>
              <div style={{ textAlign: 'center' }}>
                <Icons.activity style={{ width: 48, height: 48, opacity: 0.2, marginBottom: 12 }} />
                <div>Health Dashboard Preview</div>
              </div>
            </div>
          </div>

          {/* Features 2 & 3 — side by side, different treatment */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="bp-feature-grid">
            <div style={{
              background: 'var(--bg)', borderRadius: 20, padding: '2rem',
              border: '1px solid var(--border)', transition: 'box-shadow 0.3s, transform 0.3s',
            }} className="bp-feature-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 12, background: 'var(--secondary-light)', marginBottom: '1rem' }}>
                <Icons.messageCircle style={{ width: 20, height: 20, color: 'var(--secondary)' }} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>{t.features.social}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.65 }}>{t.features.socialDesc}</p>
            </div>

            <div style={{
              background: 'var(--bg)', borderRadius: 20, padding: '2rem',
              border: '1px solid var(--border)', transition: 'box-shadow 0.3s, transform 0.3s',
            }} className="bp-feature-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 12, background: '#F0EDFE', marginBottom: '1rem' }}>
                <Icons.cpu style={{ width: 20, height: 20, color: '#6B4C8A' }} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>{t.features.ai}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.65 }}>{t.features.aiDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={{ padding: '6rem 2rem', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <span style={{
            display: 'inline-block', background: 'var(--primary-light)', color: 'var(--primary)',
            fontSize: '0.78rem', fontWeight: 600, padding: '0.25rem 0.75rem',
            borderRadius: '100px', marginBottom: '0.75rem',
          }}>{t.how.label}</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '3.5rem' }}>
            {t.how.title}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem', textAlign: 'center' }} className="bp-how-grid">
            {[
              { num: '01', title: t.how.s1, desc: t.how.s1d, icon: <Icons.user style={{ width: 24, height: 24 }} /> },
              { num: '02', title: t.how.s2, desc: t.how.s2d, icon: <Icons.edit style={{ width: 24, height: 24 }} /> },
              { num: '03', title: t.how.s3, desc: t.how.s3d, icon: <Icons.zap style={{ width: 24, height: 24 }} /> },
            ].map((s, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', margin: '0 auto 1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--primary-light)', color: 'var(--primary)',
                }}>
                  {s.icon}
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', letterSpacing: 1 }}>{s.num}</span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0.4rem 0 0.3rem', fontFamily: 'var(--font-display)' }}>{s.title}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '5rem 2rem', background: 'var(--text)', color: 'var(--bg)',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.03 }}>
          <PawDots size={500} color="#fff" opacity={1} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '1rem' }}>{t.cta.title}</h2>
          <p style={{ fontSize: '1rem', opacity: 0.7, marginBottom: '2rem', lineHeight: 1.6 }}>{t.cta.sub}</p>
          <BPButton variant="primary" size="lg" onClick={() => navigate('/register')}>{t.cta.btn}</BPButton>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.82rem', color: 'var(--text-3)', flexWrap: 'wrap' }}>
          <span>{t.footer.copy}</span>
          <a href="#" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>{t.footer.privacy}</a>
          <a href="#" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>{t.footer.terms}</a>
        </div>
      </footer>
    </div>
  );
}

// ---- Auth Layout Shell ----
function AuthShell({ children, showNav = true }) {
  const { lang, setLang } = useLang();
  const { navigate } = useRouter();
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {showNav && (
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', height: 64, borderBottom: '1px solid var(--border)' }}>
          <a href="#/" onClick={e => { e.preventDefault(); navigate('/'); }} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>Bestie</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>Paw</span>
          </a>
          <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)',
            display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem',
          }}>
            <Icons.globe style={{ width: 15, height: 15 }} />
            {lang === 'zh' ? 'EN' : '中文'}
          </button>
        </nav>
      )}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        {children}
      </main>
    </div>
  );
}

// ---- Login Page ----
function LoginPage() {
  const t = useT();
  const { navigate } = useRouter();
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = t.lang === 'zh' ? '请输入有效邮箱' : 'Invalid email';
    if (!password.trim()) e.password = t.lang === 'zh' ? '请输入密码' : 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthShell>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 24, padding: '2.25rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.5px', marginBottom: 4 }}>{t.auth.loginTitle}</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginBottom: '1.5rem' }}>{t.auth.loginSub}</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <button disabled style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.6rem', border: '1.5px solid var(--border)', borderRadius: 10, background: 'var(--bg)', fontSize: '0.85rem', color: 'var(--text-2)', cursor: 'not-allowed', opacity: 0.6, fontFamily: 'inherit' }}>
              {t.auth.socialApple}
            </button>
            <button disabled style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.6rem', border: '1.5px solid var(--border)', borderRadius: 10, background: 'var(--bg)', fontSize: '0.85rem', color: 'var(--text-2)', cursor: 'not-allowed', opacity: 0.6, fontFamily: 'inherit' }}>
              {t.auth.socialGoogle}
            </button>
          </div>
          <BPDivider text={t.auth.orEmail} />

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <BPInput label={t.auth.email} type="email" required value={email} onChange={e => setEmail(e.target.value)} error={errors.email} placeholder="hello@example.com" autoComplete="email" />
            <BPInput label={t.auth.password} type="password" required value={password} onChange={e => setPassword(e.target.value)} error={errors.password} placeholder="••••••••" autoComplete="current-password" />
            <div style={{ textAlign: 'right', marginTop: -4 }}>
              <a href="#" style={{ fontSize: '0.82rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>{t.auth.forgot}</a>
            </div>
            <BPButton type="submit" variant="primary" size="lg" fullWidth loading={loading}>{t.auth.loginBtn}</BPButton>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-2)', marginTop: '1.25rem' }}>
            {t.auth.noAccount} <a href="#/register" onClick={e => { e.preventDefault(); navigate('/register'); }} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>{t.nav.register}</a>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}

// ---- Register Page ----
function RegisterPage() {
  const t = useT();
  const { navigate } = useRouter();
  const { register: registerUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ username: '', email: '', phone: '', password: '', confirm: '' });
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.username.trim() || form.username.trim().length < 2) e.username = t.lang === 'zh' ? '昵称至少2个字符' : 'Min 2 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) e.email = t.lang === 'zh' ? '请输入有效邮箱' : 'Invalid email';
    if (form.phone && !/^1[3-9]\d{9}$/.test(form.phone.replace(/\s/g, ''))) e.phone = t.lang === 'zh' ? '请输入有效手机号' : 'Invalid phone';
    if (form.password.length < 8) e.password = t.lang === 'zh' ? '密码至少8位' : 'Min 8 characters';
    if (form.confirm !== form.password) e.confirm = t.lang === 'zh' ? '密码不一致' : 'Passwords don\'t match';
    if (!agree) toast.error(t.lang === 'zh' ? '请同意服务条款' : 'Please agree to terms');
    setErrors(e);
    return Object.keys(e).length === 0 && agree;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await registerUser({ username: form.username, email: form.email, phone: form.phone || undefined, password: form.password });
      navigate('/pet-profile');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthShell>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 24, padding: '2.25rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <BPSteps steps={[t.auth.step1, t.auth.step2, t.auth.step3]} current={0} />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.5px', marginBottom: 4 }}>{t.auth.registerTitle}</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginBottom: '1.5rem' }}>{t.auth.registerSub}</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <button disabled style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.6rem', border: '1.5px solid var(--border)', borderRadius: 10, background: 'var(--bg)', fontSize: '0.85rem', color: 'var(--text-2)', cursor: 'not-allowed', opacity: 0.6, fontFamily: 'inherit' }}>{t.auth.socialApple}</button>
            <button disabled style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.6rem', border: '1.5px solid var(--border)', borderRadius: 10, background: 'var(--bg)', fontSize: '0.85rem', color: 'var(--text-2)', cursor: 'not-allowed', opacity: 0.6, fontFamily: 'inherit' }}>{t.auth.socialGoogle}</button>
          </div>
          <BPDivider text={t.auth.orEmail} />

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <BPInput label={t.auth.username} required value={form.username} onChange={set('username')} error={errors.username} autoComplete="username" />
            <BPInput label={t.auth.email} type="email" required value={form.email} onChange={set('email')} error={errors.email} placeholder="hello@example.com" autoComplete="email" />
            <BPInput label={t.auth.phone} type="tel" value={form.phone} onChange={set('phone')} error={errors.phone} placeholder="1xx xxxx xxxx" autoComplete="tel" />
            <div>
              <BPInput label={t.auth.password} type="password" required value={form.password} onChange={set('password')} error={errors.password} placeholder="≥ 8 characters" autoComplete="new-password" />
              <PasswordStrength value={form.password} />
            </div>
            <BPInput label={t.auth.confirmPwd} type="password" required value={form.confirm} onChange={set('confirm')} error={errors.confirm} autoComplete="new-password" />

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-2)', cursor: 'pointer', marginTop: 4 }}>
              <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} style={{ accentColor: 'var(--primary)', marginTop: 2, flexShrink: 0 }} />
              <span>{t.auth.agree} <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>{t.auth.terms}</a> {t.auth.and} <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>{t.auth.privacy}</a></span>
            </label>

            <BPButton type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              {t.auth.registerBtn}
              <Icons.arrowRight style={{ width: 18, height: 18 }} />
            </BPButton>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-2)', marginTop: '1.25rem' }}>
            {t.auth.hasAccount} <a href="#/login" onClick={e => { e.preventDefault(); navigate('/login'); }} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>{t.nav.login}</a>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}

// ---- Pet Profile Page ----
function PetProfilePage() {
  const t = useT();
  const { navigate } = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'dog', breed: '', birthday: '', gender: 'male', weightKg: '', neutered: '', allergies: '', note: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: typeof e === 'string' ? e : e.target.value }));

  const petTypes = [
    { value: 'dog', label: t.pet.dog }, { value: 'cat', label: t.pet.cat },
    { value: 'rabbit', label: t.pet.rabbit }, { value: 'bird', label: t.pet.bird },
    { value: 'fish', label: t.pet.fish }, { value: 'other', label: t.pet.other },
  ];

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error(t.lang === 'zh' ? '请填写宠物名字' : 'Pet name required'); return; }
    setLoading(true);
    try {
      const data = { ...form, weightKg: form.weightKg ? parseFloat(form.weightKg) : undefined };
      await smartApi.pets.create(data);
      navigate('/complete');
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  return (
    <AuthShell>
      <div style={{ width: '100%', maxWidth: 540 }}>
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 24, padding: '2.25rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <BPSteps steps={[t.auth.step1, t.auth.step2, t.auth.step3]} current={1} />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.5px', marginBottom: 4 }}>{t.pet.title}</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginBottom: '1rem' }}>{t.pet.sub}</p>

          <div style={{ background: 'var(--secondary-light)', border: '1px solid #A3D9C0', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#0F6E56', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            {t.pet.tip}
          </div>

          {/* Avatar upload */}
          <label style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem',
            padding: '1.25rem', border: '2px dashed var(--border)', borderRadius: 16, cursor: 'pointer',
            transition: 'border-color 0.2s, background 0.2s', marginBottom: '1.25rem',
          }} className="bp-avatar-upload">
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: avatarPreview ? `url(${avatarPreview}) center/cover` : 'var(--surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--border)',
              fontSize: '1.8rem',
            }}>
              {!avatarPreview && <Icons.image style={{ width: 24, height: 24, color: 'var(--text-3)' }} />}
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>{t.pet.photo}</span>
            <input type="file" accept="image/*" onChange={handleAvatar} style={{ display: 'none' }} />
          </label>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <BPInput label={t.pet.name} required value={form.name} onChange={set('name')} placeholder={t.pet.nameP} />

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)', display: 'block', marginBottom: '0.4rem' }}>{t.pet.type}</label>
              <BPTagGroup options={petTypes} value={form.type} onChange={(v) => setForm(f => ({ ...f, type: v }))} name="pet-type" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <BPInput label={t.pet.breed} value={form.breed} onChange={set('breed')} placeholder={t.pet.breedP} />
              <BPInput label={t.pet.birthday} type="date" value={form.birthday} onChange={set('birthday')} />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)', display: 'block', marginBottom: '0.4rem' }}>{t.pet.gender}</label>
              <BPTagGroup options={[
                { value: 'male', label: `♂ ${t.pet.male}` },
                { value: 'female', label: `♀ ${t.pet.female}` },
                { value: 'unknown', label: t.pet.unknown },
              ]} value={form.gender} onChange={(v) => setForm(f => ({ ...f, gender: v }))} name="pet-gender" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <BPInput label={t.pet.weight} type="number" value={form.weightKg} onChange={set('weightKg')} placeholder="5.2" min="0" step="0.1" />
              <BPSelect label={t.pet.neutered} id="neutered" value={form.neutered} onChange={set('neutered')} options={[
                { value: '', label: t.pet.select }, { value: 'yes', label: t.pet.yes }, { value: 'no', label: t.pet.no }, { value: 'unknown', label: t.pet.unsure },
              ]} />
            </div>

            <BPTextarea label={t.pet.allergies} maxLength={200} value={form.allergies} onChange={set('allergies')} />
            <BPTextarea label={t.pet.note} maxLength={300} value={form.note} onChange={set('note')} />

            <BPButton type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              {t.pet.save}
              <Icons.arrowRight style={{ width: 18, height: 18 }} />
            </BPButton>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-3)', marginTop: '1rem', cursor: 'pointer' }}>
            <a onClick={() => navigate('/app')} style={{ color: 'var(--text-3)', textDecoration: 'underline', cursor: 'pointer' }}>{t.pet.skip}</a>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}

// ---- Onboarding Complete ----
function CompletePage() {
  const t = useT();
  const { navigate } = useRouter();
  return (
    <AuthShell showNav={false}>
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <div className="bp-fade-up" style={{ fontSize: '4rem', marginBottom: '1rem' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <Icons.check style={{ width: 40, height: 40, color: 'var(--secondary)' }} />
          </div>
        </div>
        <h1 className="bp-fade-up bp-delay-1" style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '0.5rem', letterSpacing: '-1px' }}>{t.complete.title}</h1>
        <p className="bp-fade-up bp-delay-2" style={{ color: 'var(--text-2)', marginBottom: '2rem', fontSize: '1rem' }}>{t.complete.sub}</p>
        <div className="bp-fade-up bp-delay-3">
          <BPButton variant="primary" size="lg" onClick={() => navigate('/app')}>
            {t.complete.btn}
            <Icons.arrowRight style={{ width: 18, height: 18 }} />
          </BPButton>
        </div>
      </div>
    </AuthShell>
  );
}

Object.assign(window, { PublicNav, HomePage, AuthShell, LoginPage, RegisterPage, PetProfilePage, CompletePage });
