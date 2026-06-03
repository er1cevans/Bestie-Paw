/* ============================================
   BestiePaw — Services: API, Auth, i18n, Router
   ============================================ */

// ---- API Client ----
const API_BASE = (() => {
  try { return window.__BP_CONFIG?.apiBase || 'http://localhost:3000/api'; }
  catch { return 'http://localhost:3000/api'; }
})();

// ---- AI Assistant config ----
// AI 助手开箱即用：未配置任何密钥时，自动走免费、无需注册的 Pollinations 接口；
// 两者都不可用时退回本地示例回复，保证 demo 永远有响应。
//
// 想要更稳定、更高质量的回答？填入一个免费的 Google Gemini Key 即可：
//   1) 打开 https://aistudio.google.com/apikey （Google 账号登录，1 分钟，免费额度大方）
//   2) 把生成的 key 填到下面的 geminiApiKey，或在页面里设置
//      window.__BP_CONFIG = { geminiApiKey: '你的key' }
// 注意：这是纯前端 demo，密钥会暴露在浏览器，正式上线请改为经后端代理调用、勿提交真实密钥。
const AI_CONFIG = {
  geminiApiKey: (() => { try { return window.__BP_CONFIG?.geminiApiKey || ''; } catch { return ''; } })(),
  geminiModel: 'gemini-1.5-flash-latest',
};

const tokenStore = {
  get access() { return localStorage.getItem('bp_access'); },
  get refresh() { return localStorage.getItem('bp_refresh'); },
  set(access, refresh) {
    if (access) localStorage.setItem('bp_access', access);
    if (refresh) localStorage.setItem('bp_refresh', refresh);
  },
  clear() {
    localStorage.removeItem('bp_access');
    localStorage.removeItem('bp_refresh');
  }
};

async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (tokenStore.access) headers['Authorization'] = `Bearer ${tokenStore.access}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...opts, headers, body: opts.body ? JSON.stringify(opts.body) : undefined });
  } catch (err) {
    throw { code: 'NETWORK_ERROR', message: '无法连接服务器 / Cannot connect to server', status: 0 };
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && tokenStore.refresh && !path.includes('/refresh')) {
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: tokenStore.refresh })
        });
        if (refreshRes.ok) {
          const rd = await refreshRes.json();
          tokenStore.set(rd.data?.accessToken, rd.data?.refreshToken);
          headers['Authorization'] = `Bearer ${rd.data?.accessToken}`;
          const retry = await fetch(`${API_BASE}${path}`, { ...opts, headers, body: opts.body ? JSON.stringify(opts.body) : undefined });
          const retryData = await retry.json().catch(() => ({}));
          if (retry.ok) return retryData.data || retryData;
        }
      } catch {}
      tokenStore.clear();
      window.location.hash = '#/login';
    }
    throw {
      code: data.error?.code || data.code || 'ERROR',
      message: data.error?.message || data.message || '请求失败',
      fields: data.error?.fields,
      status: res.status,
    };
  }
  return data.data || data;
}

// ---- Enum case + pagination-envelope adapters (backend uses UPPERCASE enums
//      and {items} pagination envelopes; frontend uses lowercase + bare arrays) ----
const PET_ENUM_FIELDS = ['type', 'gender', 'neutered'];
const _up = (obj, fields) => {
  if (!obj || typeof obj !== 'object') return obj;
  const o = { ...obj };
  for (const f of fields) if (typeof o[f] === 'string') o[f] = o[f].toUpperCase();
  return o;
};
const _lo = (obj, fields) => {
  if (!obj || typeof obj !== 'object') return obj;
  const o = { ...obj };
  for (const f of fields) if (typeof o[f] === 'string') o[f] = o[f].toLowerCase();
  return o;
};
const _loList = (arr, fields) => (Array.isArray(arr) ? arr.map((x) => _lo(x, fields)) : arr);
const _items = (page) => (Array.isArray(page?.items) ? page.items : []);
const _page = (items, q = {}) => {
  const total = items.length;
  const page = Math.max(1, Number(q?.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(q?.limit) || total || 20));
  const start = (page - 1) * limit;
  return { items: items.slice(start, start + limit), total, page, limit };
};

// Resolve a stored upload URL (e.g. "/uploads/x.jpg") against the backend origin,
// since the frontend (e.g. :4173) and API (e.g. :3000) may differ. Absolute URLs pass through.
const resolveUpload = (url) => {
  if (!url) return url;
  if (/^(https?:|data:|blob:)/.test(url)) return url;
  const origin = API_BASE.replace(/\/api\/?$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
};

const api = {
  auth: {
    register: (d) => apiFetch('/auth/register', { method: 'POST', body: d }),
    login: (d) => apiFetch('/auth/login', { method: 'POST', body: d }),
    logout: () => apiFetch('/auth/logout', { method: 'POST' }),
    verifyEmail: (d) => apiFetch('/auth/verify-email', { method: 'POST', body: d }),
    forgotPassword: (d) => apiFetch('/auth/forgot-password', { method: 'POST', body: d }),
    resetPassword: (d) => apiFetch('/auth/reset-password', { method: 'POST', body: d }),
  },
  users: {
    me: () => apiFetch('/users/me'),
    update: (d) => apiFetch('/users/me', { method: 'PATCH', body: d }),
    changePassword: (d) => apiFetch('/users/me/password', { method: 'POST', body: d }),
    delete: () => apiFetch('/users/me', { method: 'DELETE' }),
    uploadAvatar: (file) => {
      const fd = new FormData(); fd.append('avatar', file);
      return fetch(`${API_BASE}/users/me/avatar`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${tokenStore.access}` }, body: fd
      }).then(r => r.json());
    },
  },
  pets: {
    list: () => apiFetch('/pets').then((r) => _loList(r, PET_ENUM_FIELDS)),
    create: (d) => apiFetch('/pets', { method: 'POST', body: _up(d, PET_ENUM_FIELDS) }).then((r) => _lo(r, PET_ENUM_FIELDS)),
    get: (id) => apiFetch(`/pets/${id}`).then((r) => _lo(r, PET_ENUM_FIELDS)),
    update: (id, d) => apiFetch(`/pets/${id}`, { method: 'PATCH', body: _up(d, PET_ENUM_FIELDS) }).then((r) => _lo(r, PET_ENUM_FIELDS)),
    delete: (id) => apiFetch(`/pets/${id}`, { method: 'DELETE' }),
  },
  health: {
    list: (petId, q) => {
      const qq = q && q.type ? { ...q, type: String(q.type).toUpperCase() } : q;
      return apiFetch(`/pets/${petId}/health?${new URLSearchParams(qq || {})}`).then((r) => _loList(_items(r), ['type']));
    },
    create: (petId, d) => apiFetch(`/pets/${petId}/health`, { method: 'POST', body: _up(d, ['type']) }).then((r) => _lo(r, ['type'])),
    get: (petId, id) => apiFetch(`/pets/${petId}/health/${id}`).then((r) => _lo(r, ['type'])),
    update: (petId, id, d) => apiFetch(`/pets/${petId}/health/${id}`, { method: 'PATCH', body: _up(d, ['type']) }).then((r) => _lo(r, ['type'])),
    delete: (petId, id) => apiFetch(`/pets/${petId}/health/${id}`, { method: 'DELETE' }),
    uploadAttachments: (petId, recordId, files) => {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('files', f));
      return fetch(`${API_BASE}/pets/${petId}/health/${recordId}/attachments`, {
        method: 'POST', headers: { Authorization: `Bearer ${tokenStore.access}` }, body: fd,
      }).then((r) => r.json()).then((j) => (j && j.data ? _lo(j.data, ['type']) : j));
    },
    removeAttachment: (petId, recordId, url) =>
      apiFetch(`/pets/${petId}/health/${recordId}/attachments`, { method: 'DELETE', body: { url } }).then((r) => _lo(r, ['type'])),
  },
  reminders: {
    list: (petId) => apiFetch(`/pets/${petId}/reminders`).then((r) => _loList(r, ['type'])),
    create: (petId, d) => apiFetch(`/pets/${petId}/reminders`, { method: 'POST', body: _up(d, ['type']) }).then((r) => _lo(r, ['type'])),
    update: (petId, id, d) => apiFetch(`/pets/${petId}/reminders/${id}`, { method: 'PATCH', body: _up(d, ['type']) }).then((r) => _lo(r, ['type'])),
    complete: (petId, id) => apiFetch(`/pets/${petId}/reminders/${id}/complete`, { method: 'POST' }).then((r) => _lo(r, ['type'])),
    delete: (petId, id) => apiFetch(`/pets/${petId}/reminders/${id}`, { method: 'DELETE' }),
  },
  weight: {
    list: (petId) => apiFetch(`/pets/${petId}/weight`),
    add: (petId, d) => apiFetch(`/pets/${petId}/weight`, { method: 'POST', body: d }),
    delete: (petId, id) => apiFetch(`/pets/${petId}/weight/${id}`, { method: 'DELETE' }),
  },
  community: {
    posts: (q) => apiFetch(`/community/posts?${new URLSearchParams(q || {})}`).then((r) => _items(r)),
    createPost: (d) => apiFetch('/community/posts', { method: 'POST', body: d }),
    getPost: (id) => apiFetch(`/community/posts/${id}`),
    deletePost: (id) => apiFetch(`/community/posts/${id}`, { method: 'DELETE' }),
    like: (id) => apiFetch(`/community/posts/${id}/like`, { method: 'POST' }),
    unlike: (id) => apiFetch(`/community/posts/${id}/like`, { method: 'DELETE' }),
    comment: (id, d) => apiFetch(`/community/posts/${id}/comments`, { method: 'POST', body: d }),
  },
  stats: () => apiFetch('/stats'),
};

// ---- Mock Data for Demo Mode ----
const MOCK = {
  user: { id: 'u1', username: 'PetLover', email: 'demo@bestiepaw.com', emailVerified: true, avatarUrl: null },
  pets: [
    { id: 'p1', name: '豆豆', type: 'dog', breed: '金毛寻回猎犬', gender: 'male', birthday: '2023-03-15', weightKg: 28.5, neutered: 'yes', avatarUrl: null, ownerId: 'u1' },
    { id: 'p2', name: '小花', type: 'cat', breed: '英国短毛猫', gender: 'female', birthday: '2024-01-20', weightKg: 4.2, neutered: 'no', avatarUrl: null, ownerId: 'u1' },
  ],
  healthRecords: [
    { id: 'h1', petId: 'p1', type: 'vaccine', title: '狂犬疫苗接种', description: '年度狂犬疫苗，注射部位左后腿', date: '2025-11-20', attachments: [] },
    { id: 'h2', petId: 'p1', type: 'checkup', title: '年度体检', description: '各项指标正常，体重略高建议控制饮食', date: '2025-10-05', attachments: [] },
    { id: 'h3', petId: 'p1', type: 'medication', title: '驱虫药', description: '口服驱虫药，体内外驱虫', date: '2025-09-15', attachments: [] },
    { id: 'h4', petId: 'p2', type: 'vaccine', title: '猫三联疫苗', description: '第二针猫三联', date: '2025-12-01', attachments: [] },
  ],
  reminders: [
    { id: 'r1', petId: 'p1', title: '驱虫药', description: '每月体外驱虫', dueDate: '2026-06-15', type: 'medication' },
    { id: 'r2', petId: 'p1', title: '年度体检', description: '预约兽医年度检查', dueDate: '2026-10-05', type: 'checkup' },
    { id: 'r3', petId: 'p2', title: '疫苗加强', description: '猫三联加强针', dueDate: '2026-06-01', type: 'vaccine' },
  ],
  weights: [
    { id: 'w1', petId: 'p1', weightKg: 26.8, note: '', recordedAt: '2025-12-01T00:00:00Z' },
    { id: 'w2', petId: 'p1', weightKg: 27.5, note: '', recordedAt: '2026-01-15T00:00:00Z' },
    { id: 'w3', petId: 'p1', weightKg: 28.1, note: '增重，需控制', recordedAt: '2026-03-01T00:00:00Z' },
    { id: 'w4', petId: 'p1', weightKg: 28.5, note: '', recordedAt: '2026-05-01T00:00:00Z' },
    { id: 'w5', petId: 'p2', weightKg: 4.0, note: '', recordedAt: '2026-02-01T00:00:00Z' },
    { id: 'w6', petId: 'p2', weightKg: 4.2, note: '', recordedAt: '2026-05-01T00:00:00Z' },
  ],
  posts: [
    { id: 'c1', authorId: 'u1', content: '今天带豆豆去了海边，玩得超开心！推荐大家周末也带毛孩子出去走走 🏖️', images: [], likes: 24, createdAt: '2026-05-15T10:30:00Z', author: { id: 'u1', username: 'PetLover', avatarUrl: null } },
    { id: 'c2', authorId: 'u2', content: '求助：家里的猫最近食欲不太好，有经验的铲屎官能给点建议吗？', images: [], likes: 8, createdAt: '2026-05-14T15:20:00Z', author: { id: 'u2', username: '猫咪控', avatarUrl: null } },
    { id: 'c3', authorId: 'u3', content: '分享一个自制猫玩具的教程，用纸箱和旧袜子就能做，我家三只都超爱！', images: [], likes: 56, createdAt: '2026-05-13T08:00:00Z', author: { id: 'u3', username: 'DIY达人', avatarUrl: null } },
  ],
};

// ---- Demo API (fallback when backend is not available) ----
let _demoState = null;
function getDemoState() {
  if (!_demoState) {
    const saved = localStorage.getItem('bp_demo_state');
    _demoState = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(MOCK));
  }
  return _demoState;
}
function saveDemoState() {
  if (_demoState) localStorage.setItem('bp_demo_state', JSON.stringify(_demoState));
}

const demoApi = {
  auth: {
    register: async (d) => {
      const s = getDemoState();
      s.user = { ...s.user, username: d.username, email: d.email };
      saveDemoState();
      tokenStore.set('demo-access', 'demo-refresh');
      return { user: s.user, accessToken: 'demo-access', refreshToken: 'demo-refresh' };
    },
    login: async () => {
      const s = getDemoState();
      tokenStore.set('demo-access', 'demo-refresh');
      return { user: s.user, accessToken: 'demo-access', refreshToken: 'demo-refresh' };
    },
    logout: async () => { tokenStore.clear(); },
  },
  users: {
    me: async () => getDemoState().user,
    update: async (d) => { const s = getDemoState(); s.user = { ...s.user, ...d }; saveDemoState(); return s.user; },
    changePassword: async () => ({ message: 'ok' }),
    delete: async () => { tokenStore.clear(); return { message: 'ok' }; },
  },
  pets: {
    list: async () => getDemoState().pets,
    create: async (d) => { const s = getDemoState(); const p = { id: 'p' + Date.now(), ...d, ownerId: 'u1' }; s.pets.push(p); saveDemoState(); return p; },
    get: async (id) => {
      const s = getDemoState();
      const pet = s.pets.find(p => p.id === id);
      return { ...pet, healthRecords: s.healthRecords.filter(h => h.petId === id).slice(0, 3), reminders: s.reminders.filter(r => r.petId === id) };
    },
  },
  health: {
    list: async (petId, q) => {
      const records = getDemoState().healthRecords.filter(h => h.petId === petId && (!q?.type || h.type === String(q.type).toLowerCase()));
      return _page(records, q);
    },
    create: async (petId, d) => { const s = getDemoState(); const h = { id: 'h' + Date.now(), petId, ...d, attachments: [] }; s.healthRecords.unshift(h); saveDemoState(); return h; },
    delete: async (petId, id) => { const s = getDemoState(); s.healthRecords = s.healthRecords.filter(h => h.id !== id); saveDemoState(); },
    uploadAttachments: async (petId, recordId, files) => {
      const s = getDemoState(); const h = s.healthRecords.find(x => x.id === recordId);
      if (h) { h.attachments = [...(h.attachments || []), ...Array.from(files).map(f => URL.createObjectURL(f))]; saveDemoState(); }
      return h;
    },
    removeAttachment: async (petId, recordId, url) => {
      const s = getDemoState(); const h = s.healthRecords.find(x => x.id === recordId);
      if (h) { h.attachments = (h.attachments || []).filter(a => a !== url); saveDemoState(); }
      return h;
    },
  },
  reminders: {
    list: async (petId) => getDemoState().reminders.filter(r => r.petId === petId && !r.completedAt),
    create: async (petId, d) => { const s = getDemoState(); const r = { id: 'r' + Date.now(), petId, ...d }; s.reminders.push(r); saveDemoState(); return r; },
    complete: async (petId, id) => { const s = getDemoState(); const r = s.reminders.find(x => x.id === id); if (r) r.completedAt = new Date().toISOString(); saveDemoState(); return r; },
    delete: async (petId, id) => { const s = getDemoState(); s.reminders = s.reminders.filter(r => r.id !== id); saveDemoState(); },
  },
  weight: {
    list: async (petId) => getDemoState().weights.filter(w => w.petId === petId).sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt)),
    add: async (petId, d) => {
      const s = getDemoState();
      const w = { id: 'w' + Date.now(), petId, ...d };
      s.weights.push(w);
      const pet = s.pets.find(p => p.id === petId); if (pet) pet.weightKg = d.weightKg;
      saveDemoState(); return w;
    },
    delete: async (petId, id) => { const s = getDemoState(); s.weights = s.weights.filter(w => w.id !== id); saveDemoState(); },
  },
  community: {
    posts: async (q) => _page(getDemoState().posts, q),
    createPost: async (d) => { const s = getDemoState(); const p = { id: 'c' + Date.now(), authorId: 'u1', ...d, likes: 0, createdAt: new Date().toISOString(), author: s.user }; s.posts.unshift(p); saveDemoState(); return p; },
    like: async (id) => { const s = getDemoState(); const p = s.posts.find(x => x.id === id); if (p) p.likes++; saveDemoState(); return { liked: true }; },
    unlike: async (id) => { const s = getDemoState(); const p = s.posts.find(x => x.id === id); if (p && p.likes > 0) p.likes--; saveDemoState(); return { liked: false }; },
  },
  stats: async () => ({ registeredUsers: 1247, petProfiles: 2891 }),
};

// ---- Smart API: tries real backend, falls back to demo ----
let _isDemo = null;
async function checkBackend() {
  if (_isDemo !== null) return _isDemo;
  try {
    const r = await fetch(`${API_BASE}/stats`, { signal: AbortSignal.timeout(3000) });
    _isDemo = !r.ok;
  } catch { _isDemo = true; }
  return _isDemo;
}

function createSmartApi() {
  const handler = {
    get(target, prop) {
      if (typeof target[prop] === 'object' && target[prop] !== null) {
        return new Proxy(target[prop], {
          get(innerTarget, innerProp) {
            if (typeof innerTarget[innerProp] === 'function') {
              return async (...args) => {
                if (await checkBackend()) {
                  const demoFn = demoApi[prop]?.[innerProp];
                  if (demoFn) {
                    const result = await demoFn(...args);
                    return Array.isArray(result?.items) ? result.items : result;
                  }
                  throw { code: 'NOT_IMPLEMENTED', message: 'Demo mode: not available' };
                }
                return innerTarget[innerProp](...args);
              };
            }
            return innerTarget[innerProp];
          }
        });
      }
      if (typeof target[prop] === 'function') {
        return async (...args) => {
          if (await checkBackend()) {
            const demoFn = demoApi[prop];
            if (typeof demoFn === 'function') return demoFn(...args);
            throw { code: 'NOT_IMPLEMENTED', message: 'Demo mode' };
          }
          return target[prop](...args);
        };
      }
      return target[prop];
    }
  };
  return new Proxy(api, handler);
}

const smartApi = createSmartApi();

// ---- AI Assistant ----
// 统一入口：history 为完整对话 [{role:'user'|'assistant', content}]，返回助手回复字符串。
// 优先级：Gemini（如配置 key）→ 免费 Pollinations → 本地示例兜底。
function aiSystemPrompt(lang) {
  return lang === 'zh'
    ? '你是 BestiePaw 的 AI 宠物健康助手。请用简体中文、简明友好地回答。基于用户描述的宠物症状或问题，给出条理清晰的初步分析和可执行建议（如观察要点、家庭护理、何时需要就医）。回答控制在 200 字以内。务必在结尾温和提醒：AI 建议仅供参考，紧急或持续症状请尽快咨询专业兽医。'
    : 'You are BestiePaw, an AI pet-health assistant. Reply in clear, friendly English. Based on the pet symptoms or questions described, give a concise, well-structured preliminary analysis and actionable advice (what to watch for, home care, when to see a vet). Keep it under ~150 words. Always end with a gentle reminder that AI advice is for reference only and to consult a licensed vet for urgent or persistent symptoms.';
}

async function aiViaGemini(history, lang) {
  const contents = history
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
  // Gemini 要求对话以 user 开头，去掉开头的欢迎语等 model 轮次
  while (contents.length && contents[0].role === 'model') contents.shift();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.geminiModel}:generateContent?key=${encodeURIComponent(AI_CONFIG.geminiApiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: aiSystemPrompt(lang) }] },
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
    }),
  });
  if (!res.ok) throw new Error('Gemini HTTP ' + res.status);
  const data = await res.json();
  const text = (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('').trim();
  if (!text) throw new Error('Gemini empty');
  return text;
}

async function aiViaPollinations(history, lang) {
  const messages = [
    { role: 'system', content: aiSystemPrompt(lang) },
    ...history.filter((m) => m.role === 'user' || m.role === 'assistant').slice(-8),
  ];
  const res = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'openai', messages, temperature: 0.7 }),
  });
  if (!res.ok) throw new Error('Pollinations HTTP ' + res.status);
  const ct = res.headers.get('content-type') || '';
  let text = '';
  if (ct.includes('application/json')) {
    const data = await res.json();
    text = (data?.choices?.[0]?.message?.content || '').trim();
  } else {
    text = (await res.text()).trim();
  }
  if (!text) throw new Error('Pollinations empty');
  // 该免费接口偶发返回「已弃用/服务通知」之类的横幅文本，识别后当失败处理，避免污染对话
  if (/deprecat|important notice|legacy text api|rate.?limit|service unavailable/i.test(text)) {
    throw new Error('Pollinations notice');
  }
  return text;
}

function aiLocalFallback(history, lang) {
  const last = [...history].reverse().find((m) => m.role === 'user')?.content || '';
  const q = last.toLowerCase();
  const has = (zhArr, enArr) => zhArr.some((k) => last.includes(k)) || enArr.some((k) => q.includes(k));
  let body;
  if (lang === 'zh') {
    if (has(['不吃', '不爱吃', '吃东西', '食欲', '没胃口', '不喝'], ['appetite', 'not eat', 'eating'])) {
      body = '食欲下降常见诱因有环境变化、口腔/牙齿不适、肠胃问题或情绪压力。可先观察 12–24 小时：少量多餐、换回熟悉的食物、保证饮水。若伴随呕吐、腹泻、精神萎靡或超过 24 小时拒食，建议尽快就医。';
    } else if (has(['呕吐', '拉肚子', '腹泻'], ['vomit', 'diarrh'])) {
      body = '偶发一次呕吐/软便可先禁食 6–8 小时、少量给水观察。若频繁呕吐、便血、脱水（皮肤回弹慢）或精神差，需立即就诊，并记录发作次数和食物接触史供兽医参考。';
    } else if (has(['疫苗', '驱虫', '免疫'], ['vaccine', 'deworm'])) {
      body = '幼宠通常 6–8 周开始接种核心疫苗，按周期加强；体内外驱虫建议按月或按产品说明进行。具体方案随地区和品种略有差异，可在「健康管理」里记录并设置提醒。';
    } else {
      body = '我可以根据你描述的症状给出初步分析。请尽量补充：宠物种类与年龄、出现多久、有无呕吐/腹泻/精神食欲变化等，这样建议会更具体。';
    }
    return body + '\n\n温馨提醒：以上为初步参考，紧急或持续症状请尽快咨询专业兽医。';
  }
  if (has([], ['appetite', 'not eat', 'eating', 'eat'])) {
    body = 'Reduced appetite often stems from stress, dental discomfort, GI upset, or environment changes. Watch for 12–24h: offer small familiar meals and ensure water intake. If it lasts over 24h or comes with vomiting, diarrhea, or lethargy, see a vet promptly.';
  } else if (has([], ['vomit', 'diarrh'])) {
    body = 'A single mild episode can be managed by withholding food 6–8h and offering small sips of water. Frequent vomiting, blood, dehydration, or low energy warrant an urgent vet visit—note frequency and recent foods.';
  } else if (has([], ['vaccine', 'deworm'])) {
    body = 'Puppies/kittens usually start core vaccines around 6–8 weeks with boosters; deworming is typically monthly or per product guidance. Exact schedules vary by region/breed—log them under Health and set reminders.';
  } else {
    body = 'I can give a preliminary take based on the symptoms. Please add: species and age, how long it has lasted, and any vomiting/diarrhea or appetite changes, so the advice can be more specific.';
  }
  return body + '\n\nReminder: this is general guidance only—please consult a licensed vet for urgent or persistent symptoms.';
}

async function aiComplete(history, lang = 'zh') {
  if (AI_CONFIG.geminiApiKey) {
    try { return await aiViaGemini(history, lang); } catch (e) { /* fall through */ }
  }
  try { return await aiViaPollinations(history, lang); } catch (e) { /* fall through */ }
  // 兜底：稍作延迟以呈现「正在输入」动画
  await new Promise((r) => setTimeout(r, 500));
  return aiLocalFallback(history, lang);
}

// ---- i18n ----
const translations = {
  zh: {
    nav: { features: '功能', community: '社区', pricing: '方案', login: '登录', register: '注册', getStarted: '开始使用' },
    hero: { eyebrow: '你的宠物，值得最好的', title1: '智能宠物', title2: '生活伴侣', sub: '健康档案、社区交流、AI 智能分析——一站式守护毛孩子的每一天。', cta: '免费注册', ctaSec: '了解更多' },
    features: { label: '核心功能', title: '为什么选择 BestiePaw', health: '健康档案', healthDesc: '疫苗接种、体检报告、用药计划，自动提醒复诊，完整健康档案随时导出。', social: '宠物社区', socialDesc: '同城宠物主互动，分享养宠日记和经验，发布走失/领养信息。', ai: 'AI 分析', aiDesc: '上传照片识别品种年龄，描述症状获取初步分析，7×24h 在线答疑。' },
    how: { label: '使用流程', title: '三步开始', s1: '创建账号', s1d: '30秒完成注册', s2: '登记宠物', s2d: '上传照片填写档案', s3: '畅享功能', s3d: '解锁全部功能' },
    cta: { title: '开始守护你的毛孩子', sub: '核心功能永久免费，立即加入。', btn: '立即注册' },
    footer: { copy: '© 2026 BestiePaw. 让每只毛孩子都被好好爱着。', privacy: '隐私政策', terms: '服务条款' },
    auth: { loginTitle: '欢迎回来', loginSub: '登录继续照顾你的毛孩子', email: '邮箱', password: '密码', confirmPwd: '确认密码', username: '昵称', phone: '手机号（选填）', forgot: '忘记密码？', loginBtn: '登录', registerTitle: '创建账号', registerSub: '加入 BestiePaw，为毛孩子建立专属档案', registerBtn: '注册并继续', noAccount: '没有账号？', hasAccount: '已有账号？', agree: '我已阅读并同意', terms: '服务条款', and: '与', privacy: '隐私政策', step1: '创建账号', step2: '宠物信息', step3: '完成', socialApple: 'Apple 登录', socialGoogle: 'Google 登录', orEmail: '或使用邮箱', pwdStrength: ['太弱', '较弱', '一般', '强'], showPwd: '显示', hidePwd: '隐藏' },
    pet: { title: '告诉我们关于你的宠物', sub: '填写越详细，健康建议越精准。', tip: '信息可以随时修改，现在填写基础信息即可。', name: '宠物名字', nameP: '它叫什么名字？', type: '宠物类型', breed: '品种', breedP: '如：金毛寻回猎犬', birthday: '出生日期（约）', gender: '性别', male: '公', female: '母', unknown: '未知', weight: '体重（kg）', neutered: '是否已绝育', allergies: '已知过敏/疾病史', note: '补充备注', save: '保存并继续', skip: '暂时跳过', photo: '上传宠物照片（可选）', dog: '狗', cat: '猫', rabbit: '兔子', bird: '鸟类', fish: '鱼类', other: '其他', yes: '是', no: '否', unsure: '不确定', select: '请选择' },
    complete: { title: '注册成功！', sub: '宠物档案已建立，去探索所有功能吧。', btn: '进入首页' },
    dash: { overview: '概览', health: '健康管理', community: '社区', ai: 'AI 助手', reminders: '提醒', profile: '个人中心', myPets: '我的宠物', addPet: '添加宠物', hello: '你好', noPets: '还没有宠物档案', noPetsDesc: '点击上方按钮添加你的第一只毛孩子', upcoming: '即将到来', healthTimeline: '健康时间线', quickActions: '快捷操作', addRecord: '新增记录', setReminder: '设置提醒', viewAll: '查看全部', logout: '退出登录' },
    healthPage: { title: '健康管理', addRecord: '新增记录', noRecords: '暂无记录', vaccine: '疫苗', checkup: '体检', medication: '用药', surgery: '手术', type: '类型', date: '日期', description: '描述', titleField: '标题', save: '保存', cancel: '取消', all: '全部' },
    communityPage: { title: '宠物社区', write: '发动态', placeholder: '分享你和毛孩子的故事...', post: '发布', likes: '赞', comments: '评论' },
    aiPage: { title: 'AI 智能助手', placeholder: '描述宠物的症状或问题...', send: '发送', welcome: '你好！我是 BestiePaw AI 助手，可以帮你分析宠物的健康问题。请描述你的问题，我会给出初步建议。', disclaimer: 'AI 建议仅供参考，如有紧急情况请立即就医。' },
    profilePage: { title: '个人设置', basic: '基本信息', save: '保存修改', langLabel: '语言 / Language', dangerZone: '危险操作', deleteAccount: '注销账号' },
    remindersPage: { title: '提醒管理', add: '新增提醒', noReminders: '暂无提醒', titleField: '标题', dueDate: '到期日', save: '保存', cancel: '取消' },
    demo: '演示模式',
  },
  en: {
    nav: { features: 'Features', community: 'Community', pricing: 'Pricing', login: 'Log in', register: 'Sign up', getStarted: 'Get Started' },
    hero: { eyebrow: 'Your pet deserves the best', title1: 'Smart Pet', title2: 'Life Companion', sub: 'Health records, community, AI analysis — an all-in-one guardian for your furry friend.', cta: 'Sign Up Free', ctaSec: 'Learn More' },
    features: { label: 'Features', title: 'Why BestiePaw', health: 'Health Records', healthDesc: 'Vaccines, checkups, medications — auto-reminders, exportable health profiles.', social: 'Pet Community', socialDesc: 'Connect with local pet owners, share diaries, post lost & adoption info.', ai: 'AI Analysis', aiDesc: 'Upload photos for breed/age detection, symptom analysis, 24/7 AI assistance.' },
    how: { label: 'How It Works', title: 'Three Steps', s1: 'Create Account', s1d: '30-second signup', s2: 'Add Your Pet', s2d: 'Upload photo & profile', s3: 'Enjoy', s3d: 'Unlock all features' },
    cta: { title: 'Start caring for your pet today', sub: 'Core features free forever. Join now.', btn: 'Sign Up Now' },
    footer: { copy: '© 2026 BestiePaw. Every pet deserves to be loved.', privacy: 'Privacy', terms: 'Terms' },
    auth: { loginTitle: 'Welcome Back', loginSub: 'Log in to continue caring for your pet', email: 'Email', password: 'Password', confirmPwd: 'Confirm Password', username: 'Username', phone: 'Phone (optional)', forgot: 'Forgot password?', loginBtn: 'Log In', registerTitle: 'Create Account', registerSub: 'Join BestiePaw and build a profile for your pet', registerBtn: 'Sign Up & Continue', noAccount: "Don't have an account?", hasAccount: 'Already have an account?', agree: 'I agree to the', terms: 'Terms of Service', and: 'and', privacy: 'Privacy Policy', step1: 'Account', step2: 'Pet Info', step3: 'Done', socialApple: 'Apple', socialGoogle: 'Google', orEmail: 'or use email', pwdStrength: ['Weak', 'Fair', 'Good', 'Strong'], showPwd: 'Show', hidePwd: 'Hide' },
    pet: { title: 'Tell us about your pet', sub: 'The more detail, the better our health advice.', tip: 'You can update this anytime.', name: 'Pet Name', nameP: "What's their name?", type: 'Pet Type', breed: 'Breed', breedP: 'e.g. Golden Retriever', birthday: 'Birthday (approx)', gender: 'Gender', male: 'Male', female: 'Female', unknown: 'Unknown', weight: 'Weight (kg)', neutered: 'Neutered/Spayed', allergies: 'Known allergies/conditions', note: 'Additional notes', save: 'Save & Continue', skip: 'Skip for now', photo: 'Upload pet photo (optional)', dog: 'Dog', cat: 'Cat', rabbit: 'Rabbit', bird: 'Bird', fish: 'Fish', other: 'Other', yes: 'Yes', no: 'No', unsure: 'Not sure', select: 'Select' },
    complete: { title: 'All Set!', sub: "Your pet's profile is ready. Start exploring.", btn: 'Go to Dashboard' },
    dash: { overview: 'Overview', health: 'Health', community: 'Community', ai: 'AI Assistant', reminders: 'Reminders', profile: 'Profile', myPets: 'My Pets', addPet: 'Add Pet', hello: 'Hello', noPets: 'No pets yet', noPetsDesc: 'Add your first furry friend above', upcoming: 'Upcoming', healthTimeline: 'Health Timeline', quickActions: 'Quick Actions', addRecord: 'Add Record', setReminder: 'Set Reminder', viewAll: 'View All', logout: 'Log Out' },
    healthPage: { title: 'Health Management', addRecord: 'Add Record', noRecords: 'No records yet', vaccine: 'Vaccine', checkup: 'Checkup', medication: 'Medication', surgery: 'Surgery', type: 'Type', date: 'Date', description: 'Description', titleField: 'Title', save: 'Save', cancel: 'Cancel', all: 'All' },
    communityPage: { title: 'Pet Community', write: 'New Post', placeholder: 'Share your pet story...', post: 'Post', likes: 'likes', comments: 'comments' },
    aiPage: { title: 'AI Assistant', placeholder: 'Describe your pet\'s symptoms...', send: 'Send', welcome: "Hi! I'm BestiePaw AI. I can help analyze your pet's health concerns. Describe your question and I'll provide preliminary advice.", disclaimer: 'AI suggestions are for reference only. Seek veterinary care for emergencies.' },
    profilePage: { title: 'Settings', basic: 'Basic Info', save: 'Save Changes', langLabel: 'Language / 语言', dangerZone: 'Danger Zone', deleteAccount: 'Delete Account' },
    remindersPage: { title: 'Reminders', add: 'Add Reminder', noReminders: 'No reminders', titleField: 'Title', dueDate: 'Due Date', save: 'Save', cancel: 'Cancel' },
    demo: 'Demo Mode',
  },
};

// ---- React Contexts ----
const { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } = React;

const AuthContext = createContext(null);
const LangContext = createContext(null);
const ToastContext = createContext(null);

function useAuth() { return useContext(AuthContext); }
function useLang() { return useContext(LangContext); }
function useT() { const { lang } = useLang(); return translations[lang]; }
function useToast() { return useContext(ToastContext); }

// ---- Simple Hash Router ----
function useRouter() {
  const [route, setRoute] = useState(window.location.hash.slice(1) || '/');
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const navigate = useCallback((path) => { window.location.hash = path; }, []);
  return { route, navigate };
}

// Export to window
Object.assign(window, {
  smartApi, api, demoApi, tokenStore, API_BASE, aiComplete, resolveUpload,
  AuthContext, LangContext, ToastContext,
  useAuth, useLang, useT, useToast, useRouter,
  translations, MOCK, getDemoState, checkBackend,
});
