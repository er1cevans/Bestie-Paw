/* ============================================
   BestiePaw — Profile & Reminders Pages
   ============================================ */

// ---- Reminders Page ----
function RemindersPage() {
  const t = useT();
  const { lang } = useLang();
  const toast = useToast();
  const [pets, setPets] = useState([]);
  const [activePet, setActivePet] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const petList = await smartApi.pets.list();
        setPets(petList);
        if (petList[0]) { setActivePet(petList[0]); await loadReminders(petList[0].id); }
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const loadReminders = async (petId) => {
    try { const r = await smartApi.reminders.list(petId); setReminders(r); } catch {}
  };

  const switchPet = async (pet) => {
    setActivePet(pet);
    setLoading(true);
    await loadReminders(pet.id);
    setLoading(false);
  };

  const deleteReminder = async (id) => {
    if (!confirm(lang === 'zh' ? '确定删除？' : 'Delete?')) return;
    await smartApi.reminders.delete(activePet.id, id);
    setReminders(r => r.filter(x => x.id !== id));
    toast.success(lang === 'zh' ? '已删除' : 'Deleted');
  };

  const completeReminder = async (id) => {
    try {
      await smartApi.reminders.complete(activePet.id, id);
      setReminders(r => r.filter(x => x.id !== id));
      toast.success(lang === 'zh' ? '已标记完成 ✓' : 'Marked done ✓');
    } catch (err) { toast.error(err.message); }
  };

  const daysUntil = (dateStr) => {
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
    if (diff < 0) return lang === 'zh' ? '已过期' : 'Overdue';
    if (diff === 0) return lang === 'zh' ? '今天' : 'Today';
    if (diff === 1) return lang === 'zh' ? '明天' : 'Tomorrow';
    return lang === 'zh' ? `${diff}天后` : `in ${diff}d`;
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>{t.remindersPage.title}</h1>
        <BPButton variant="primary" size="sm" onClick={() => setShowAdd(true)}>
          <Icons.plus style={{ width: 16, height: 16 }} />
          {t.remindersPage.add}
        </BPButton>
      </div>

      {pets.length > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {pets.map(pet => (
            <button key={pet.id} onClick={() => switchPet(pet)} style={{
              padding: '0.45rem 1rem', borderRadius: 100, border: '1.5px solid',
              borderColor: activePet?.id === pet.id ? 'var(--primary)' : 'var(--border)',
              background: activePet?.id === pet.id ? 'var(--primary-light)' : 'transparent',
              color: activePet?.id === pet.id ? 'var(--primary)' : 'var(--text-2)',
              fontWeight: activePet?.id === pet.id ? 600 : 400, fontSize: '0.85rem',
              cursor: 'pointer', fontFamily: 'inherit',
            }}>{pet.name}</button>
          ))}
        </div>
      )}

      {loading ? <BPLoading /> : reminders.length === 0 ? (
        <BPEmpty icon={<Icons.bell style={{ width: 48, height: 48 }} />} title={t.remindersPage.noReminders} action={
          <BPButton variant="soft" onClick={() => setShowAdd(true)}>{t.remindersPage.add}</BPButton>
        } />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {reminders.map(r => {
            const overdue = new Date(r.dueDate) < new Date();
            return (
              <div key={r.id} style={{
                background: 'var(--bg)', border: `1px solid ${overdue ? 'var(--error)' : 'var(--border)'}`,
                borderRadius: 16, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem',
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: overdue ? '#FDE8E8' : '#FDF5E6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icons.bell style={{ width: 18, height: 18, color: overdue ? 'var(--error)' : '#B8943E' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 2 }}>{r.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Icons.calendar style={{ width: 12, height: 12 }} />
                      {new Date(r.dueDate).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US')}
                    </span>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 600, padding: '0.1rem 0.45rem', borderRadius: 6,
                      background: overdue ? '#FDE8E8' : '#E3F0EB', color: overdue ? 'var(--error)' : '#2B7A5F',
                    }}>
                      {daysUntil(r.dueDate)}
                    </span>
                  </div>
                  {r.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', marginTop: 4 }}>{r.description}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                  <button title={lang === 'zh' ? '标记完成' : 'Mark done'} onClick={() => completeReminder(r.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: '#2B7A5F', padding: 5,
                    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }} className="bp-action-btn">
                    <Icons.check style={{ width: 17, height: 17 }} />
                  </button>
                  <button title={lang === 'zh' ? '删除' : 'Delete'} onClick={() => deleteReminder(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 5 }}>
                    <Icons.trash style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Reminder Modal */}
      <AddReminderModal open={showAdd} onClose={() => setShowAdd(false)} petId={activePet?.id} onCreated={(r) => { setReminders(prev => [...prev, r].sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate))); setShowAdd(false); }} />
    </div>
  );
}

function AddReminderModal({ open, onClose, petId, onCreated }) {
  const t = useT();
  const toast = useToast();
  const [form, setForm] = useState({ title: '', dueDate: '', description: '' });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.dueDate) return;
    setLoading(true);
    try {
      const r = await smartApi.reminders.create(petId, form);
      onCreated(r);
      toast.success(t.lang === 'zh' ? '提醒已设置' : 'Reminder set');
      setForm({ title: '', dueDate: '', description: '' });
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <BPModal open={open} onClose={onClose} title={t.remindersPage.add}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <BPInput label={t.remindersPage.titleField} required value={form.title} onChange={set('title')} />
        <BPInput label={t.remindersPage.dueDate} type="date" required value={form.dueDate} onChange={set('dueDate')} />
        <BPTextarea label={t.healthPage?.description || 'Description'} value={form.description} onChange={set('description')} maxLength={200} />
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <BPButton variant="ghost" onClick={onClose}>{t.remindersPage.cancel}</BPButton>
          <BPButton variant="primary" type="submit" loading={loading}>{t.remindersPage.save}</BPButton>
        </div>
      </form>
    </BPModal>
  );
}

// ---- Profile / Settings Page ----
function ProfilePage() {
  const t = useT();
  const { lang, setLang } = useLang();
  const { user, setUser, logout } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ username: user?.username || '', email: user?.email || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [changingPwd, setChangingPwd] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setP = (k) => (e) => setPwd(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await smartApi.users.update({ username: form.username, phone: form.phone || undefined });
      setUser(prev => ({ ...prev, username: form.username }));
      toast.success(lang === 'zh' ? '已保存' : 'Saved');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (pwd.newPassword.length < 8) { toast.error(lang === 'zh' ? '新密码至少 8 位' : 'New password min 8 chars'); return; }
    if (pwd.newPassword !== pwd.confirm) { toast.error(lang === 'zh' ? '两次密码不一致' : 'Passwords don\'t match'); return; }
    setChangingPwd(true);
    try {
      await smartApi.users.changePassword({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
      setPwd({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success(lang === 'zh' ? '密码已修改' : 'Password changed');
    } catch (err) { toast.error(err.message); }
    finally { setChangingPwd(false); }
  };

  const handleDeleteAccount = async () => {
    const ok = confirm(lang === 'zh'
      ? '确定注销账号？所有数据将被永久删除且无法恢复。'
      : 'Delete your account? All data will be permanently removed and cannot be undone.');
    if (!ok) return;
    setDeleting(true);
    try {
      await smartApi.users.delete();
      toast.success(lang === 'zh' ? '账号已注销' : 'Account deleted');
      await logout();
    } catch (err) { toast.error(err.message); setDeleting(false); }
  };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '1.5rem' }}>{t.profilePage.title}</h1>

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
        <BPAvatar name={user?.username} size={72} />
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{user?.username}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>{user?.email}</div>
        </div>
      </div>

      {/* Basic Info */}
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 18, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'var(--font-display)' }}>{t.profilePage.basic}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <BPInput label={t.auth.username} value={form.username} onChange={set('username')} />
          <BPInput label={t.auth.email} value={form.email} disabled style={{ opacity: 0.6 }} />
          <BPInput label={t.auth.phone} type="tel" value={form.phone} onChange={set('phone')} placeholder="1xx xxxx xxxx" />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <BPButton variant="primary" onClick={handleSave} loading={saving}>{t.profilePage.save}</BPButton>
          </div>
        </div>
      </div>

      {/* Security — change password */}
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 18, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icons.shield style={{ width: 16, height: 16, color: 'var(--text-2)' }} />
          {lang === 'zh' ? '修改密码' : 'Change Password'}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <BPInput label={lang === 'zh' ? '当前密码' : 'Current password'} type="password" value={pwd.currentPassword} onChange={setP('currentPassword')} autoComplete="current-password" />
          <BPInput label={lang === 'zh' ? '新密码' : 'New password'} type="password" value={pwd.newPassword} onChange={setP('newPassword')} placeholder={lang === 'zh' ? '至少 8 位' : 'Min 8 characters'} autoComplete="new-password" />
          <BPInput label={lang === 'zh' ? '确认新密码' : 'Confirm new password'} type="password" value={pwd.confirm} onChange={setP('confirm')} autoComplete="new-password" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <BPButton variant="primary" onClick={handleChangePassword} loading={changingPwd}
              disabled={!pwd.currentPassword || !pwd.newPassword}>
              {lang === 'zh' ? '更新密码' : 'Update password'}
            </BPButton>
          </div>
        </div>
      </div>

      {/* Language */}
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 18, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>{t.profilePage.langLabel}</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[{ v: 'zh', l: '中文' }, { v: 'en', l: 'English' }].map(opt => (
            <button key={opt.v} onClick={() => setLang(opt.v)} style={{
              padding: '0.5rem 1.25rem', borderRadius: 10, border: '1.5px solid',
              borderColor: lang === opt.v ? 'var(--primary)' : 'var(--border)',
              background: lang === opt.v ? 'var(--primary-light)' : 'transparent',
              color: lang === opt.v ? 'var(--primary)' : 'var(--text-2)',
              fontWeight: lang === opt.v ? 600 : 400, fontSize: '0.9rem',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s',
            }}>{opt.l}</button>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ background: 'var(--bg)', border: '1px solid #f0d0d0', borderRadius: 18, padding: '1.5rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--error)', fontFamily: 'var(--font-display)' }}>{t.profilePage.dangerZone}</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', marginBottom: '1rem', lineHeight: 1.5 }}>
          {lang === 'zh' ? '注销账号后所有数据将被永久删除且无法恢复。' : 'Deleting your account permanently removes all data and cannot be undone.'}
        </p>
        <BPButton variant="danger" size="sm" onClick={handleDeleteAccount} loading={deleting}>{t.profilePage.deleteAccount}</BPButton>
      </div>
    </div>
  );
}

Object.assign(window, { RemindersPage, AddReminderModal, ProfilePage });
