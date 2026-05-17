/* ============================================
   BestiePaw — Community & AI Assistant Pages
   ============================================ */

// ---- Community Page ----
function CommunityPage() {
  const t = useT();
  const { lang } = useLang();
  const { user } = useAuth();
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWrite, setShowWrite] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    (async () => {
      try { const p = await smartApi.community.posts(); setPosts(p); }
      catch {} finally { setLoading(false); }
    })();
  }, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      const p = await smartApi.community.createPost({ content: newPost, images: [] });
      setPosts(prev => [p, ...prev]);
      setNewPost('');
      setShowWrite(false);
      toast.success(lang === 'zh' ? '发布成功' : 'Posted');
    } catch (err) { toast.error(err.message); }
    finally { setPosting(false); }
  };

  const handleLike = async (postId) => {
    try {
      await smartApi.community.like(postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    } catch {}
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return lang === 'zh' ? `${mins}分钟前` : `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return lang === 'zh' ? `${hrs}小时前` : `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return lang === 'zh' ? `${days}天前` : `${days}d ago`;
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>{t.communityPage.title}</h1>
        <BPButton variant="primary" size="sm" onClick={() => setShowWrite(true)}>
          <Icons.edit style={{ width: 16, height: 16 }} />
          {t.communityPage.write}
        </BPButton>
      </div>

      {/* Write box */}
      {showWrite && (
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 18, padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <BPAvatar name={user?.username} size={36} />
            <textarea value={newPost} onChange={e => setNewPost(e.target.value)} placeholder={t.communityPage.placeholder}
              style={{
                flex: 1, border: 'none', outline: 'none', resize: 'none', minHeight: 80,
                fontSize: '0.9rem', fontFamily: 'inherit', background: 'transparent', color: 'var(--text)', lineHeight: 1.6,
              }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
            <BPButton variant="ghost" size="sm" onClick={() => { setShowWrite(false); setNewPost(''); }}>{t.healthPage?.cancel || 'Cancel'}</BPButton>
            <BPButton variant="primary" size="sm" onClick={handlePost} loading={posting} disabled={!newPost.trim()}>{t.communityPage.post}</BPButton>
          </div>
        </div>
      )}

      {loading ? <BPLoading /> : posts.length === 0 ? (
        <BPEmpty icon={<Icons.messageCircle style={{ width: 48, height: 48 }} />} title={lang === 'zh' ? '还没有动态' : 'No posts yet'} action={
          <BPButton variant="soft" onClick={() => setShowWrite(true)}>{t.communityPage.write}</BPButton>
        } />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {posts.map(post => (
            <article key={post.id} style={{
              background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 18,
              padding: '1.25rem',
            }}>
              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <BPAvatar name={post.author?.username} size={34} src={post.author?.avatarUrl} />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{post.author?.username || 'User'}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{timeAgo(post.createdAt)}</div>
                </div>
              </div>

              {/* Content */}
              <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: 'var(--text)', marginBottom: '0.75rem', textWrap: 'pretty' }}>{post.content}</p>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '1.5rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border)' }}>
                <button onClick={() => handleLike(post.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-3)', fontFamily: 'inherit',
                  padding: '0.3rem 0',
                }}>
                  <Icons.thumbsUp style={{ width: 16, height: 16 }} />
                  <span>{post.likes} {t.communityPage.likes}</span>
                </button>
                <button style={{
                  display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-3)', fontFamily: 'inherit',
                  padding: '0.3rem 0',
                }}>
                  <Icons.messageCircle style={{ width: 16, height: 16 }} />
                  <span>{t.communityPage.comments}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- AI Assistant Page ----
function AIPage() {
  const t = useT();
  const { lang } = useLang();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'assistant', content: t.aiPage.welcome }]);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const allMsgs = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const prompt = lang === 'zh'
        ? `你是 BestiePaw AI 宠物健康助手。用中文回复。基于用户描述的宠物症状给出简要分析和建议。始终提醒用户如有紧急情况需就医。用户问题：${userMsg.content}`
        : `You are BestiePaw AI pet health assistant. Based on the pet symptoms described, provide brief analysis and advice. Always remind users to seek vet care for emergencies. User: ${userMsg.content}`;

      const reply = await window.claude.complete({
        messages: [{ role: 'user', content: prompt }],
      });
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      const fallback = lang === 'zh'
        ? '抱歉，我暂时无法处理您的请求。请稍后重试，如有紧急情况请立即联系兽医。'
        : 'Sorry, I can\'t process your request right now. Please try again later, or contact a vet for emergencies.';
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
    } finally { setSending(false); }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)', minHeight: 400 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '0.75rem', flexShrink: 0 }}>{t.aiPage.title}</h1>

      {/* Disclaimer */}
      <div style={{ background: '#FDF5E6', border: '1px solid #EED9A8', borderRadius: 12, padding: '0.6rem 1rem', fontSize: '0.78rem', color: '#8B6D2E', marginBottom: '1rem', flexShrink: 0, lineHeight: 1.5 }}>
        {t.aiPage.disclaimer}
      </div>

      {/* Chat area */}
      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem',
        padding: '1rem 0', minHeight: 0,
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            gap: '0.5rem',
          }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 32, height: 32, borderRadius: 10, background: '#F0EDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <Icons.cpu style={{ width: 16, height: 16, color: '#6B4C8A' }} />
              </div>
            )}
            <div style={{
              maxWidth: '75%', padding: '0.8rem 1rem', borderRadius: 16,
              background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg)',
              color: msg.role === 'user' ? '#fff' : 'var(--text)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
              fontSize: '0.88rem', lineHeight: 1.65,
              borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
              borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 16,
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {sending && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#F0EDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icons.cpu style={{ width: 16, height: 16, color: '#6B4C8A' }} />
            </div>
            <div style={{ padding: '0.8rem 1rem', borderRadius: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderBottomLeftRadius: 4 }}>
              <div className="bp-typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef}></div>
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', gap: '0.5rem', padding: '0.75rem', background: 'var(--bg)',
        border: '1px solid var(--border)', borderRadius: 16, flexShrink: 0,
      }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          placeholder={t.aiPage.placeholder}
          style={{
            flex: 1, border: 'none', outline: 'none', fontSize: '0.9rem',
            background: 'transparent', color: 'var(--text)', fontFamily: 'inherit',
          }}
        />
        <button onClick={handleSend} disabled={!input.trim() || sending} style={{
          width: 38, height: 38, borderRadius: 10, background: input.trim() ? 'var(--primary)' : 'var(--border)',
          border: 'none', cursor: input.trim() ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s', flexShrink: 0,
        }}>
          <Icons.send style={{ width: 18, height: 18, color: '#fff' }} />
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { CommunityPage, AIPage });
