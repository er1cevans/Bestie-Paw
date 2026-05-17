/* ============================================
   BestiePaw — Services: API, Auth, i18n, Router
   ============================================ */

// ---- API Client ----
const API_BASE = (() => {
  try { return window.__BP_CONFIG?.apiBase || 'http://localhost:3000/api'; }
  catch { return 'http://localhost:3000/api'; }
})();

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
    throw { code: data.code || 'ERROR', message: data.message || '请求失败', status: res.status };
  }
  return data.data || data;
}

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
    uploadAvatar: (file) => {
      const fd = new FormData(); fd.append('avatar', file);
      return fetch(`${API_BASE}/users/me/avatar`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${tokenStore.access}` }, body: fd
      }).then(r => r.json());
    },
  },
  pets: {
    list: () => apiFetch('/pets'),
    create: (d) => apiFetch('/pets', { method: 'POST', body: d }),
    get: (id) => apiFetch(`/pets/${id}`),
    update: (id, d) => apiFetch(`/pets/${id}`, { method: 'PATCH', body: d }),
    delete: (id) => apiFetch(`/pets/${id}`, { method: 'DELETE' }),
  },
  health: {
    list: (petId, q) => apiFetch(`/pets/${petId}/health?${new URLSearchParams(q || {})}`),
    create: (petId, d) => apiFetch(`/pets/${petId}/health`, { method: 'POST', body: d }),
    get: (petId, id) => apiFetch(`/pets/${petId}/health/${id}`),
    update: (petId, id, d) => apiFetch(`/pets/${petId}/health/${id}`, { method: 'PATCH', body: d }),
    delete: (petId, id) => apiFetch(`/pets/${petId}/health/${id}`, { method: 'DELETE' }),
  },
  reminders: {
    list: (petId) => apiFetch(`/pets/${petId}/reminders?upcoming=true`),
    create: (petId, d) => apiFetch(`/pets/${petId}/reminders`, { method: 'POST', body: d }),
    update: (petId, id, d) => apiFetch(`/pets/${petId}/reminders/${id}`, { method: 'PATCH', body: d }),
    delete: (petId, id) => apiFetch(`/pets/${petId}/reminders/${id}`, { method: 'DELETE' }),
  },
  community: {
    posts: (q) => apiFetch(`/community/posts?${new URLSearchParams(q || {})}`),
    createPost: (d) => apiFetch('/community/posts', { method: 'POST', body: d }),
    getPost: (id) => apiFetch(`/community/posts/${id}`),
    deletePost: (id) => apiFetch(`/community/posts/${id}`, { method: 'DELETE' }),
    like: (id) => apiFetch(`/community/posts/${id}/like`, { method: 'POST' }),
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
  users: { me: async () => getDemoState().user },
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
    list: async (petId) => getDemoState().healthRecords.filter(h => h.petId === petId),
    create: async (petId, d) => { const s = getDemoState(); const h = { id: 'h' + Date.now(), petId, ...d }; s.healthRecords.unshift(h); saveDemoState(); return h; },
    delete: async (petId, id) => { const s = getDemoState(); s.healthRecords = s.healthRecords.filter(h => h.id !== id); saveDemoState(); },
  },
  reminders: {
    list: async (petId) => getDemoState().reminders.filter(r => r.petId === petId),
    create: async (petId, d) => { const s = getDemoState(); const r = { id: 'r' + Date.now(), petId, ...d }; s.reminders.push(r); saveDemoState(); return r; },
    delete: async (petId, id) => { const s = getDemoState(); s.reminders = s.reminders.filter(r => r.id !== id); saveDemoState(); },
  },
  community: {
    posts: async () => getDemoState().posts,
    createPost: async (d) => { const s = getDemoState(); const p = { id: 'c' + Date.now(), authorId: 'u1', ...d, likes: 0, createdAt: new Date().toISOString(), author: s.user }; s.posts.unshift(p); saveDemoState(); return p; },
    like: async (id) => { const s = getDemoState(); const p = s.posts.find(x => x.id === id); if (p) p.likes++; saveDemoState(); return { liked: true }; },
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
                  if (demoFn) return demoFn(...args);
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

function matchRoute(route, pattern) {
  const rParts = route.split('/').filter(Boolean);
  const pParts = pattern.split('/').filter(Boolean);
  if (rParts.length !== pParts.length) return null;
  const params = {};
  for (let i = 0; i < pParts.length; i++) {
    if (pParts[i].startsWith(':')) params[pParts[i].slice(1)] = rParts[i];
    else if (pParts[i] !== rParts[i]) return null;
  }
  return params;
}

// Export to window
Object.assign(window, {
  smartApi, api, demoApi, tokenStore, API_BASE,
  AuthContext, LangContext, ToastContext,
  useAuth, useLang, useT, useToast, useRouter, matchRoute,
  translations, MOCK, getDemoState, checkBackend,
});
