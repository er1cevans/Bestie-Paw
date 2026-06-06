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

      {/* Weight trend */}
      {activePet && !loading && (
        <WeightTrendCard petId={activePet.id} lang={lang}
          onLatest={(kg) => setPets(ps => ps.map(p => p.id === activePet.id ? { ...p, weightKg: kg } : p))} />
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
                  <HealthAttachments petId={activePet.id} record={record} lang={lang}
                    onUpdate={(upd) => setRecords(rs => rs.map(x => x.id === upd.id ? upd : x))} />
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

// ---- Weight Trend Card ----
function WeightTrendCard({ petId, lang, onLatest }) {
  const toast = useToast();
  const [records, setRecords] = useState(null); // null = loading
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    try { const w = await smartApi.weight.list(petId); setRecords(Array.isArray(w) ? w : []); }
    catch { setRecords([]); }
  };
  useEffect(() => { setRecords(null); load(); }, [petId]);

  const sorted = (records || []).slice().sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
  const latest = sorted[sorted.length - 1];
  const first = sorted[0];
  const delta = latest && first ? +(latest.weightKg - first.weightKg).toFixed(1) : 0;

  const fmtDate = (d) => new Date(d).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' });

  const handleDelete = async (id) => {
    if (!confirm(lang === 'zh' ? '删除这条体重记录？' : 'Delete this entry?')) return;
    try {
      await smartApi.weight.delete(petId, id);
      setRecords(rs => rs.filter(r => r.id !== id));
      toast.success(lang === 'zh' ? '已删除' : 'Deleted');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 18, padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icons.activity style={{ width: 16, height: 16, color: 'var(--primary)' }} />
          {lang === 'zh' ? '体重趋势' : 'Weight Trend'}
        </h3>
        <BPButton variant="soft" size="sm" onClick={() => setShowAdd(true)}>
          <Icons.plus style={{ width: 14, height: 14 }} />
          {lang === 'zh' ? '记录体重' : 'Log weight'}
        </BPButton>
      </div>

      {records === null ? (
        <div style={{ padding: '1.5rem 0', textAlign: 'center' }}><BPLoading size={24} /></div>
      ) : sorted.length === 0 ? (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', padding: '1rem 0', textAlign: 'center' }}>
          {lang === 'zh' ? '还没有体重记录，点击"记录体重"开始追踪 📈' : 'No weight entries yet — start tracking 📈'}
        </p>
      ) : (
        <>
          {/* Summary */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{latest.weightKg}<span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-3)' }}> kg</span></span>
            {sorted.length > 1 && delta !== 0 && (
              <span style={{
                fontSize: '0.78rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: 6,
                background: delta > 0 ? '#FDE8DF' : '#E3F0EB', color: delta > 0 ? '#C05230' : '#2B7A5F',
              }}>
                {delta > 0 ? '▲' : '▼'} {Math.abs(delta)} kg
              </span>
            )}
          </div>

          {/* Chart */}
          <WeightChart data={sorted} />

          {/* Recent entries */}
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {sorted.slice().reverse().slice(0, 4).map(w => (
              <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0', borderTop: '1px solid var(--border)', fontSize: '0.82rem' }}>
                <span style={{ fontWeight: 600, minWidth: 56 }}>{w.weightKg} kg</span>
                <span style={{ color: 'var(--text-3)', minWidth: 64 }}>{fmtDate(w.recordedAt)}</span>
                {w.note && <span style={{ color: 'var(--text-2)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.note}</span>}
                <button onClick={() => handleDelete(w.id)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2, flexShrink: 0 }}>
                  <Icons.trash style={{ width: 14, height: 14 }} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <AddWeightModal open={showAdd} onClose={() => setShowAdd(false)} petId={petId} lang={lang}
        onCreated={(w) => { setRecords(rs => [...(rs || []), w]); setShowAdd(false); onLatest && onLatest(w.weightKg); }} />
    </div>
  );
}

// ---- Simple SVG line chart ----
function WeightChart({ data }) {
  const W = 320, H = 110, padX = 14, padTop = 16, padBottom = 16;
  const weights = data.map(d => d.weightKg);
  const min = Math.min(...weights), max = Math.max(...weights);
  const range = (max - min) || 1;
  const n = data.length;
  const xAt = (i) => (n === 1 ? W / 2 : padX + (i * (W - 2 * padX)) / (n - 1));
  const yAt = (w) => padTop + (1 - (w - min) / range) * (H - padTop - padBottom);
  const linePts = data.map((d, i) => `${xAt(i).toFixed(1)},${yAt(d.weightKg).toFixed(1)}`).join(' ');
  const areaPts = `${padX},${H - padBottom} ${linePts} ${(n === 1 ? W / 2 : W - padX)},${H - padBottom}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="bp-wt-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {n > 1 && <polygon points={areaPts} fill="url(#bp-wt-grad)" />}
      {n > 1 && <polyline points={linePts} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
      {data.map((d, i) => (
        <g key={d.id || i}>
          <circle cx={xAt(i)} cy={yAt(d.weightKg)} r="3" fill="#fff" stroke="var(--primary)" strokeWidth="2" />
          {(i === 0 || i === n - 1 || d.weightKg === max || d.weightKg === min) && (
            <text x={xAt(i)} y={yAt(d.weightKg) - 7} textAnchor="middle" fontSize="9" fill="var(--text-3)" fontWeight="600">{d.weightKg}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

// ---- Add Weight Modal ----
function AddWeightModal({ open, onClose, petId, lang, onCreated }) {
  const toast = useToast();
  const [form, setForm] = useState({ weightKg: '', recordedAt: new Date().toISOString().slice(0, 10), note: '' });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const kg = parseFloat(form.weightKg);
    if (!(kg > 0)) { toast.error(lang === 'zh' ? '请输入有效体重' : 'Enter a valid weight'); return; }
    setLoading(true);
    try {
      const w = await smartApi.weight.add(petId, { weightKg: kg, recordedAt: form.recordedAt, note: form.note || undefined });
      onCreated(w);
      toast.success(lang === 'zh' ? '体重已记录' : 'Weight logged');
      setForm({ weightKg: '', recordedAt: new Date().toISOString().slice(0, 10), note: '' });
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <BPModal open={open} onClose={onClose} title={lang === 'zh' ? '记录体重' : 'Log Weight'}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <BPInput label={lang === 'zh' ? '体重 (kg)' : 'Weight (kg)'} type="number" step="0.1" required value={form.weightKg} onChange={set('weightKg')} placeholder="0.0" />
        <BPInput label={lang === 'zh' ? '日期' : 'Date'} type="date" value={form.recordedAt} onChange={set('recordedAt')} />
        <BPTextarea label={lang === 'zh' ? '备注（选填）' : 'Note (optional)'} value={form.note} onChange={set('note')} maxLength={200} />
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <BPButton variant="ghost" onClick={onClose}>{lang === 'zh' ? '取消' : 'Cancel'}</BPButton>
          <BPButton variant="primary" type="submit" loading={loading}>{lang === 'zh' ? '保存' : 'Save'}</BPButton>
        </div>
      </form>
    </BPModal>
  );
}

// ---- Health Record Attachments ----
function HealthAttachments({ petId, record, lang, onUpdate }) {
  const toast = useToast();
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const attachments = record.attachments || [];

  const isImage = (url) => /^(blob:|data:image)/.test(url) || /\.(jpe?g|png|webp|gif)(\?|$)/i.test(url);
  const fileName = (url) => { try { return decodeURIComponent(url.split('/').pop().split('?')[0]); } catch { return 'file'; } };

  const handleFiles = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const updated = await smartApi.health.uploadAttachments(petId, record.id, files);
      if (updated) onUpdate(updated);
      toast.success(lang === 'zh' ? '附件已上传' : 'Uploaded');
    } catch (err) { toast.error(err.message || (lang === 'zh' ? '上传失败' : 'Upload failed')); }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const handleRemove = async (url) => {
    if (!confirm(lang === 'zh' ? '删除该附件？' : 'Remove this attachment?')) return;
    try {
      const updated = await smartApi.health.removeAttachment(petId, record.id, url);
      if (updated) onUpdate(updated);
      toast.success(lang === 'zh' ? '已删除' : 'Removed');
    } catch (err) { toast.error(err.message); }
  };

  const tile = { width: 56, height: 56, borderRadius: 10, flexShrink: 0, position: 'relative', overflow: 'hidden' };
  const delBtn = {
    position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%',
    background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10, alignItems: 'center' }}>
      {attachments.map((url) => (
        <div key={url} style={{ ...tile, border: '1px solid var(--border)', background: 'var(--surface)' }}>
          {isImage(url) ? (
            <a href={resolveUpload(url)} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', height: '100%' }}>
              <img src={resolveUpload(url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </a>
          ) : (
            <a href={resolveUpload(url)} target="_blank" rel="noopener noreferrer" title={fileName(url)}
              style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, textDecoration: 'none', color: 'var(--text-2)', background: 'var(--bg)' }}>
              <Icons.image style={{ width: 18, height: 18 }} />
              <span style={{ fontSize: '0.55rem', fontWeight: 700 }}>{(fileName(url).split('.').pop() || 'FILE').toUpperCase().slice(0, 4)}</span>
            </a>
          )}
          <button onClick={() => handleRemove(url)} style={delBtn} title={lang === 'zh' ? '删除' : 'Remove'}>
            <Icons.x style={{ width: 11, height: 11 }} />
          </button>
        </div>
      ))}

      {/* Add tile */}
      <button onClick={() => fileRef.current && fileRef.current.click()} disabled={busy} style={{
        ...tile, border: '1.5px dashed var(--border)', background: 'transparent', cursor: busy ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)',
      }} title={lang === 'zh' ? '添加附件' : 'Add file'}>
        {busy ? <BPLoading size={18} /> : <Icons.plus style={{ width: 20, height: 20 }} />}
      </button>
      <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleFiles} style={{ display: 'none' }} />
    </div>
  );
}

Object.assign(window, { HealthPage, AddHealthRecordModal, WeightTrendCard, WeightChart, AddWeightModal, HealthAttachments });
