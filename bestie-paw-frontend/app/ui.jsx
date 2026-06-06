/* ============================================
   BestiePaw — UI Component Library
   ============================================ */
const { useState, useRef, useEffect, useCallback, forwardRef } = React;

// ---- Icons (simple inline SVGs) ----
const Icons = {
  heart: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
  shield: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
  users: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  zap: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
  home: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
  activity: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
  messageCircle: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>,
  cpu: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>,
  bell: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
  user: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  plus: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  x: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  chevronRight: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="9 18 15 12 9 6"></polyline></svg>,
  chevronLeft: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="15 18 9 12 15 6"></polyline></svg>,
  send: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>,
  calendar: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
  trash: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  edit: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  logOut: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
  menu: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  globe: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
  thumbsUp: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>,
  clock: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  check: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"></polyline></svg>,
  settings: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  eye: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
  eyeOff: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>,
  arrowRight: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>,
  image: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>,
};

// ---- Button ----
function BPButton({ children, variant = 'primary', size = 'md', fullWidth, disabled, loading, onClick, style: extraStyle, className = '', ...rest }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    fontFamily: 'inherit', fontWeight: 600, cursor: disabled || loading ? 'not-allowed' : 'pointer',
    border: 'none', transition: 'all 0.2s ease', textDecoration: 'none',
    opacity: disabled ? 0.5 : 1, width: fullWidth ? '100%' : undefined,
    borderRadius: size === 'lg' ? '14px' : '10px',
    fontSize: size === 'lg' ? '1rem' : size === 'sm' ? '0.8rem' : '0.875rem',
    padding: size === 'lg' ? '0.85rem 2rem' : size === 'sm' ? '0.4rem 0.8rem' : '0.6rem 1.3rem',
  };
  const variants = {
    primary: { background: 'var(--primary)', color: '#fff' },
    secondary: { background: 'var(--secondary)', color: '#fff' },
    outline: { background: 'transparent', color: 'var(--primary)', border: '1.5px solid var(--primary)' },
    ghost: { background: 'transparent', color: 'var(--text-2)', border: '1.5px solid var(--border)' },
    danger: { background: 'var(--error)', color: '#fff' },
    soft: { background: 'var(--primary-light)', color: 'var(--primary)' },
  };
  return (
    <button
      className={`bp-btn bp-btn-${variant} ${className}`}
      style={{ ...base, ...variants[variant], ...extraStyle }}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading && <span className="bp-spinner"></span>}
      {children}
    </button>
  );
}

// ---- Input ----
function BPInput({ label, required, error, hint, type = 'text', id, suffix, ...rest }) {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === 'password';
  const inputId = id || label?.replace(/\s/g, '-').toLowerCase();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      {label && (
        <label htmlFor={inputId} style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)' }}>
          {label}{required && <span style={{ color: 'var(--error)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <input
          id={inputId}
          type={isPassword ? (showPwd ? 'text' : 'password') : type}
          style={{
            width: '100%', padding: '0.65rem 0.875rem', paddingRight: isPassword || suffix ? '3rem' : undefined,
            border: `1.5px solid ${error ? 'var(--error)' : 'var(--border)'}`,
            borderRadius: '10px', fontSize: '0.9rem', color: 'var(--text)',
            background: error ? 'var(--error-light)' : 'var(--bg)',
            outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit',
          }}
          onFocus={(e) => e.target.style.borderColor = error ? 'var(--error)' : 'var(--primary)'}
          onBlur={(e) => e.target.style.borderColor = error ? 'var(--error)' : 'var(--border)'}
          {...rest}
        />
        {isPassword && (
          <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
            position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '2px',
          }}>
            {showPwd ? <Icons.eyeOff style={{ width: 18, height: 18 }} /> : <Icons.eye style={{ width: 18, height: 18 }} />}
          </button>
        )}
        {suffix && !isPassword && (
          <span style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', fontSize: '0.85rem' }}>{suffix}</span>
        )}
      </div>
      {error && <p style={{ fontSize: '0.8rem', color: 'var(--error)', margin: 0 }}>{error}</p>}
      {hint && !error && <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', margin: 0 }}>{hint}</p>}
    </div>
  );
}

// ---- Select ----
function BPSelect({ label, required, options = [], id, ...rest }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      {label && <label htmlFor={id} style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)' }}>{label}{required && <span style={{ color: 'var(--error)', marginLeft: 2 }}>*</span>}</label>}
      <select id={id} style={{
        width: '100%', padding: '0.65rem 0.875rem', border: '1.5px solid var(--border)',
        borderRadius: '10px', fontSize: '0.9rem', color: 'var(--text)',
        background: 'var(--bg)', outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
      }} {...rest}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ---- Textarea ----
function BPTextarea({ label, maxLength, id, ...rest }) {
  const [len, setLen] = useState(0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      {label && <label htmlFor={id} style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)' }}>{label}</label>}
      <textarea id={id} maxLength={maxLength} onChange={(e) => { setLen(e.target.value.length); rest.onChange?.(e); }} style={{
        width: '100%', padding: '0.65rem 0.875rem', border: '1.5px solid var(--border)',
        borderRadius: '10px', fontSize: '0.9rem', color: 'var(--text)', background: 'var(--bg)',
        outline: 'none', fontFamily: 'inherit', resize: 'vertical', minHeight: 80,
      }} {...rest} />
      {maxLength && <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', textAlign: 'right' }}>{len}/{maxLength}</span>}
    </div>
  );
}

// ---- Tag/Chip Selector ----
function BPTagGroup({ options, value, onChange, name }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {options.map(o => (
        <label key={o.value} style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          padding: '0.4rem 0.9rem', borderRadius: '100px', cursor: 'pointer',
          border: `1.5px solid ${value === o.value ? 'var(--primary)' : 'var(--border)'}`,
          background: value === o.value ? 'var(--primary-light)' : 'transparent',
          color: value === o.value ? 'var(--primary)' : 'var(--text-2)',
          fontWeight: value === o.value ? 500 : 400, fontSize: '0.875rem',
          transition: 'all 0.18s',
        }}>
          <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} style={{ display: 'none' }} />
          {o.icon && <span>{o.icon}</span>}
          {o.label}
        </label>
      ))}
    </div>
  );
}

// ---- Avatar ----
function BPAvatar({ src, name, size = 40, style: extra }) {
  const initials = (name || '?').slice(0, 2).toUpperCase();
  const colors = ['#C05230', '#2B7A5F', '#B8943E', '#6B4C8A', '#2E7D9B'];
  const bg = colors[(name || '').charCodeAt(0) % colors.length];
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', ...extra }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 600, flexShrink: 0, ...extra }}>
      {initials}
    </div>
  );
}

// ---- Toast System ----
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);
  const toast = useMemo(() => ({
    success: (m) => add(m, 'success'),
    error: (m) => add(m, 'error'),
    info: (m) => add(m, 'info'),
  }), [add]);
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} className="bp-toast-in" style={{
            padding: '0.75rem 1.25rem', borderRadius: 12, fontSize: '0.875rem', fontWeight: 500,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)', maxWidth: 360,
            background: t.type === 'error' ? '#D4382C' : t.type === 'success' ? '#2B7A5F' : 'var(--text)',
            color: '#fff',
          }}>{t.msg}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ---- Modal ----
function BPModal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}></div>
      <div className="bp-modal-in" onClick={e => e.stopPropagation()} style={{
        position: 'relative', background: 'var(--bg)', borderRadius: 20, padding: '1.75rem',
        width: '100%', maxWidth: width, maxHeight: '85vh', overflow: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}>
            <Icons.x style={{ width: 20, height: 20 }} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

// ---- Empty State ----
function BPEmpty({ icon, title, description, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-3)' }}>
      {icon && <div style={{ marginBottom: '1rem', opacity: 0.4 }}>{icon}</div>}
      <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-2)', margin: '0 0 0.4rem' }}>{title}</h4>
      {description && <p style={{ fontSize: '0.875rem', margin: '0 0 1.25rem', lineHeight: 1.6 }}>{description}</p>}
      {action}
    </div>
  );
}

// ---- Loading Spinner ----
function BPLoading({ size = 32, color = 'var(--primary)' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div className="bp-spinner" style={{ width: size, height: size, borderColor: `${color}22`, borderTopColor: color }}></div>
    </div>
  );
}

// ---- Paw Motif (decorative) ----
function PawDots({ size = 120, color = 'var(--primary)', opacity = 0.08, style: extra }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, ...extra }}>
      {/* Four toe pads */}
      <div style={{ position: 'absolute', width: size*0.22, height: size*0.26, borderRadius: '50%', background: color, opacity, top: 0, left: size*0.12 }}></div>
      <div style={{ position: 'absolute', width: size*0.22, height: size*0.26, borderRadius: '50%', background: color, opacity, top: 0, right: size*0.12 }}></div>
      <div style={{ position: 'absolute', width: size*0.2, height: size*0.24, borderRadius: '50%', background: color, opacity, top: size*0.18, left: 0 }}></div>
      <div style={{ position: 'absolute', width: size*0.2, height: size*0.24, borderRadius: '50%', background: color, opacity, top: size*0.18, right: 0 }}></div>
      {/* Main pad */}
      <div style={{ position: 'absolute', width: size*0.4, height: size*0.36, borderRadius: '45%', background: color, opacity, bottom: 0, left: '50%', transform: 'translateX(-50%)' }}></div>
    </div>
  );
}

// ---- Password Strength Bar ----
function PasswordStrength({ value }) {
  const t = useT();
  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  const colors = ['#D4382C', '#E5933A', '#8B9D2E', '#2B7A5F'];
  const labels = t.auth.pwdStrength;
  if (!value) return null;
  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= score ? colors[score-1] : 'var(--border)', transition: 'background 0.3s' }}></div>
        ))}
      </div>
      <span style={{ fontSize: '0.75rem', color: colors[Math.max(0,score-1)], marginTop: 2, display: 'inline-block' }}>{labels[Math.max(0,score-1)]}</span>
    </div>
  );
}

// ---- Steps Indicator ----
function BPSteps({ steps, current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: '1.75rem' }}>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          {i > 0 && <div style={{ width: 48, height: 2, background: i <= current ? 'var(--secondary)' : 'var(--border)', transition: 'background 0.3s', marginBottom: 20 }}></div>}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.3s',
              background: i < current ? 'var(--secondary)' : i === current ? 'var(--primary)' : 'var(--border)',
              color: i <= current ? '#fff' : 'var(--text-3)',
            }}>
              {i < current ? <Icons.check style={{ width: 16, height: 16 }} /> : i + 1}
            </div>
            <span style={{ fontSize: '0.7rem', color: i === current ? 'var(--primary)' : 'var(--text-3)', fontWeight: i === current ? 500 : 400, whiteSpace: 'nowrap' }}>{s}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

// ---- Divider ----
function BPDivider({ text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0', color: 'var(--text-3)', fontSize: '0.8rem' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
      {text && <span>{text}</span>}
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
    </div>
  );
}

// Export to window
Object.assign(window, {
  Icons, BPButton, BPInput, BPSelect, BPTextarea, BPTagGroup, BPAvatar,
  ToastProvider, BPModal, BPEmpty, BPLoading, PawDots, PasswordStrength,
  BPSteps, BPDivider,
});
