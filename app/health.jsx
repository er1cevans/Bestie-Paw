/* ============================================
   BestiePaw — Health Management Page
   ============================================ */

function HealthPage() {
  const t = useT();
  const { lang } = useLang();
  const toast = useToast();
  const [pets, setPets] = useState([]);
  const [activePet, setActivePet] = useState(null);
  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const petList = await smartApi.pets.list();
        setPets(petList);
        const urlPet = new URLSearchParams(window.location.hash.split('?')[1]).get('pet');
        const first = petList.find(p => p.id === urlPet) || petList[0];
        if (first) { setActivePet(first); await loadRecords(first.id); }
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const loadRecords = async (petId) => {
    try { const r = await smartApi.health.list(petId); setRecords(r); } catch {}
  };

  const switchPet = async (pet) => {
    setActivePet(pet);
    setLoading(true);
    await loadRecords(pet.id);
    setLoading(false);
  };

  const filtered = filter === 'all' ? records : records.filter(r => r.type === filter);
  const typeColors = { vaccine: { bg: '#E3F0EB', color: '#2B7A5F' }, checkup: { bg: '#E3EEF5', color: '#2E7D9B' }, medication: { bg: '#FDF5E6', color: '#B8943E' }, surgery: { bg: '#FDE8DF', color: '#C05230' } };
  const typeLabels = { vaccine: t.healthPage.vaccine, checkup: t.healthPage.checkup, medication: t.healthPage.medication, surgery: t.healthPage.surgery };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>{t.healthPage.title}</h1>
        <BPButton variant="primary" size="sm" onClick={() => setShowAdd(true)}>
          <Icons.plus style={{ width: 16, height: 16 }} />
          {t.healthPage.addRecord}
        </BPButton>
      </div>

      {/* Pet tabs */}
      {pets.length > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {pets.map(pet => (
            <button key={pet.id} onClick={() => switchPet(pet)} style={{
              padding: '0.45rem 1rem', borderRadius: 100, border: '1.5px solid',
              borderColor: activePet?.id === pet.id ? 'var(--primary)' : 'var(--border)',
              background: activePet?.id === pet.id ? 'var(--primary-light)' : 'transparent',
              color: activePet?.id === pet.id ? 'var(--primary)' : 'var(--text-2)',
              fontWeight: activePet?.id === pet.id ? 600 : 400, fontSize: '0.85rem',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s',
            }}>{pet.name}</button>
          ))}
        </div>
      )}

      {/* Type filter */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'vaccine', 'checkup', 'medication', 'surgery'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '0.35rem 0.8rem', borderRadius: 8, border: 'none',
            background: filter === f ? 'var(--text)' : 'var(--bg)',
            color: filter === f ? '#fff' : 'var(--text-2)',
            fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}>{f === 'all' ? t.healthPage.all : typeLabels[f]}</button>
        ))}
      </div>

      {loading ? <BPLoading /> : filtered.length === 0 ? (
        <BPEmpty icon={<Icons.activity style={{ width: 48, height: 48 }} />} title={t.healthPage.noRecords} action={
          <BPButton variant="soft" onClick={() => setShowAdd(true)}>{t.healthPage.addRecord}</BPButton>
        } />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(record => {
            const tc = typeColors[record.type] || typeColors.checkup;
            return (
              <div key={record.id} style={{
                background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16,
                padding: '1.15rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start',
                transition: 'box-shadow 0.2s',
              }} className="bp-card-hover">
                <div style={{ width: 40, height: 40, borderRadius: 10, background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <Icons.activity style={{ width: 18, height: 18, color: tc.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: tc.color, background: tc.bg, padding: '0.15rem 0.5rem', borderRadius: 6, marginBottom: 4, display: 'inline-block' }}>
                        {typeLabels[record.type] || record.type}
                      </span>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: 4 }}>{record.title}</div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {new Date(record.date).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US')}
                    </span>
                  </div>
                  {record.description && (
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-2)', lineHeight: 1.55, marginTop: 6 }}>{record.description}</p>
                  )}
                </div>
                <button onClick={async () => {
                  if (confirm(lang === 'zh' ? '确定删除？' : 'Delete?')) {
                    await smartApi.health.delete(activePet.id, record.id);
                    setRecords(r => r.filter(x => x.id !== record.id));
                    toast.success(lang === 'zh' ? '已删除' : 'Deleted');
                  }
                }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4, flexShrink: 0, marginTop: 2 }}>
                  <Icons.trash style={{ width: 16, height: 16 }} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Record Modal */}
      <AddHealthRecordModal open={showAdd} onClose={() => setShowAdd(false)} petId={activePet?.id} onCreated={(r) => { setRecords(prev => [r, ...prev]); setShowAdd(false); }} />
    </div>
  );
}

function AddHealthRecordModal({ open, onClose, petId, onCreated }) {
  const t = useT();
  const toast = useToast();
  const [form, setForm] = useState({ title: '', type: 'checkup', date: new Date().toISOString().slice(0, 10), description: '' });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: typeof e === 'string' ? e : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      const record = await smartApi.health.create(petId, form);
      onCreated(record);
      toast.success(t.lang === 'zh' ? '记录已添加' : 'Record added');
      setForm({ title: '', type: 'checkup', date: new Date().toISOString().slice(0, 10), description: '' });
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <BPModal open={open} onClose={onClose} title={t.healthPage.addRecord}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <BPInput label={t.healthPage.titleField} required value={form.title} onChange={set('title')} />
        <BPSelect label={t.healthPage.type} id="record-type" value={form.type} onChange={set('type')} options={[
          { value: 'vaccine', label: t.healthPage.vaccine },
          { value: 'checkup', label: t.healthPage.checkup },
          { value: 'medication', label: t.healthPage.medication },
          { value: 'surgery', label: t.healthPage.surgery },
        ]} />
        <BPInput label={t.healthPage.date} type="date" value={form.date} onChange={set('date')} />
        <BPTextarea label={t.healthPage.description} value={form.description} onChange={set('description')} maxLength={500} />
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <BPButton variant="ghost" onClick={onClose}>{t.healthPage.cancel}</BPButton>
          <BPButton variant="primary" type="submit" loading={loading}>{t.healthPage.save}</BPButton>
        </div>
      </form>
    </BPModal>
  );
}

Object.assign(window, { HealthPage, AddHealthRecordModal });
