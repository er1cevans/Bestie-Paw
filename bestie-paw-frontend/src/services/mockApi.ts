import { tokenStore } from './config';
import { _page } from './adapters';

export const MOCK = {
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

let _demoState: any = null;
export function getDemoState() {
  if (!_demoState) {
    const saved = localStorage.getItem('bp_demo_state');
    _demoState = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(MOCK));
  }
  return _demoState;
}

export function saveDemoState() {
  if (_demoState) localStorage.setItem('bp_demo_state', JSON.stringify(_demoState));
}

export const demoApi: any = {
  auth: {
    register: async (d: any) => {
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
    update: async (d: any) => { const s = getDemoState(); s.user = { ...s.user, ...d }; saveDemoState(); return s.user; },
    changePassword: async () => ({ message: 'ok' }),
    delete: async () => { tokenStore.clear(); return { message: 'ok' }; },
  },
  pets: {
    list: async () => getDemoState().pets,
    create: async (d: any) => { const s = getDemoState(); const p = { id: 'p' + Date.now(), ...d, ownerId: 'u1' }; s.pets.push(p); saveDemoState(); return p; },
    get: async (id: string) => {
      const s = getDemoState();
      const pet = s.pets.find((p: any) => p.id === id);
      return { ...pet, healthRecords: s.healthRecords.filter((h: any) => h.petId === id).slice(0, 3), reminders: s.reminders.filter((r: any) => r.petId === id) };
    },
  },
  health: {
    list: async (petId: string, q?: any) => {
      const records = getDemoState().healthRecords.filter((h: any) => h.petId === petId && (!q?.type || h.type === String(q.type).toLowerCase()));
      return _page(records, q);
    },
    create: async (petId: string, d: any) => { const s = getDemoState(); const h = { id: 'h' + Date.now(), petId, ...d, attachments: [] }; s.healthRecords.unshift(h); saveDemoState(); return h; },
    delete: async (petId: string, id: string) => { const s = getDemoState(); s.healthRecords = s.healthRecords.filter((h: any) => h.id !== id); saveDemoState(); },
    uploadAttachments: async (petId: string, recordId: string, files: FileList) => {
      const s = getDemoState(); const h = s.healthRecords.find((x: any) => x.id === recordId);
      if (h) { h.attachments = [...(h.attachments || []), ...Array.from(files).map(f => URL.createObjectURL(f))]; saveDemoState(); }
      return h;
    },
    removeAttachment: async (petId: string, recordId: string, url: string) => {
      const s = getDemoState(); const h = s.healthRecords.find((x: any) => x.id === recordId);
      if (h) { h.attachments = (h.attachments || []).filter((a: any) => a !== url); saveDemoState(); }
      return h;
    },
  },
  reminders: {
    list: async (petId: string) => getDemoState().reminders.filter((r: any) => r.petId === petId && !r.completedAt),
    create: async (petId: string, d: any) => { const s = getDemoState(); const r = { id: 'r' + Date.now(), petId, ...d }; s.reminders.push(r); saveDemoState(); return r; },
    complete: async (petId: string, id: string) => { const s = getDemoState(); const r = s.reminders.find((x: any) => x.id === id); if (r) r.completedAt = new Date().toISOString(); saveDemoState(); return r; },
    delete: async (petId: string, id: string) => { const s = getDemoState(); s.reminders = s.reminders.filter((r: any) => r.id !== id); saveDemoState(); },
  },
  weight: {
    list: async (petId: string) => getDemoState().weights.filter((w: any) => w.petId === petId).sort((a: any, b: any) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()),
    add: async (petId: string, d: any) => {
      const s = getDemoState();
      const w = { id: 'w' + Date.now(), petId, ...d };
      s.weights.push(w);
      const pet = s.pets.find((p: any) => p.id === petId); if (pet) pet.weightKg = d.weightKg;
      saveDemoState(); return w;
    },
    delete: async (petId: string, id: string) => { const s = getDemoState(); s.weights = s.weights.filter((w: any) => w.id !== id); saveDemoState(); },
  },
  community: {
    posts: async (q?: any) => _page(getDemoState().posts, q),
    createPost: async (d: any) => { const s = getDemoState(); const p = { id: 'c' + Date.now(), authorId: 'u1', ...d, likes: 0, createdAt: new Date().toISOString(), author: s.user }; s.posts.unshift(p); saveDemoState(); return p; },
    like: async (id: string) => { const s = getDemoState(); const p = s.posts.find((x: any) => x.id === id); if (p) p.likes++; saveDemoState(); return { liked: true }; },
    unlike: async (id: string) => { const s = getDemoState(); const p = s.posts.find((x: any) => x.id === id); if (p && p.likes > 0) p.likes--; saveDemoState(); return { liked: false }; },
  },
  stats: async () => ({ registeredUsers: 1247, petProfiles: 2891 }),
};
