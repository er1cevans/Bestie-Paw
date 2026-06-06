import { tokenStore, API_BASE } from './config';
import { _up, _lo, _loList, _items, _page } from './adapters';

export async function apiFetch(path: string, opts: Omit<RequestInit, 'body'> & { body?: any } = {}): Promise<any> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(opts.headers as any) };
  if (tokenStore.access) headers['Authorization'] = `Bearer ${tokenStore.access}`;

  let res: Response;
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

const PET_ENUM_FIELDS = ['type', 'gender', 'neutered'];

export const api = {
  auth: {
    register: (d: any) => apiFetch('/auth/register', { method: 'POST', body: d }),
    login: (d: any) => apiFetch('/auth/login', { method: 'POST', body: d }),
    logout: () => apiFetch('/auth/logout', { method: 'POST' }),
    verifyEmail: (d: any) => apiFetch('/auth/verify-email', { method: 'POST', body: d }),
    forgotPassword: (d: any) => apiFetch('/auth/forgot-password', { method: 'POST', body: d }),
    resetPassword: (d: any) => apiFetch('/auth/reset-password', { method: 'POST', body: d }),
  },
  users: {
    me: () => apiFetch('/users/me'),
    update: (d: any) => apiFetch('/users/me', { method: 'PATCH', body: d }),
    changePassword: (d: any) => apiFetch('/users/me/password', { method: 'POST', body: d }),
    delete: () => apiFetch('/users/me', { method: 'DELETE' }),
    uploadAvatar: (file: File) => {
      const fd = new FormData(); fd.append('avatar', file);
      return fetch(`${API_BASE}/users/me/avatar`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${tokenStore.access}` }, body: fd
      }).then(r => r.json());
    },
  },
  pets: {
    list: () => apiFetch('/pets').then((r: any) => _loList(r, PET_ENUM_FIELDS)),
    create: (d: any) => apiFetch('/pets', { method: 'POST', body: _up(d, PET_ENUM_FIELDS) }).then((r: any) => _lo(r, PET_ENUM_FIELDS)),
    get: (id: string) => apiFetch(`/pets/${id}`).then((r: any) => _lo(r, PET_ENUM_FIELDS)),
    update: (id: string, d: any) => apiFetch(`/pets/${id}`, { method: 'PATCH', body: _up(d, PET_ENUM_FIELDS) }).then((r: any) => _lo(r, PET_ENUM_FIELDS)),
    delete: (id: string) => apiFetch(`/pets/${id}`, { method: 'DELETE' }),
  },
  health: {
    list: (petId: string, q?: any) => {
      const qq = q && q.type ? { ...q, type: String(q.type).toUpperCase() } : q;
      return apiFetch(`/pets/${petId}/health?${new URLSearchParams(qq || {})}`).then((r: any) => _loList(_items(r), ['type']));
    },
    create: (petId: string, d: any) => apiFetch(`/pets/${petId}/health`, { method: 'POST', body: _up(d, ['type']) }).then((r: any) => _lo(r, ['type'])),
    get: (petId: string, id: string) => apiFetch(`/pets/${petId}/health/${id}`).then((r: any) => _lo(r, ['type'])),
    update: (petId: string, id: string, d: any) => apiFetch(`/pets/${petId}/health/${id}`, { method: 'PATCH', body: _up(d, ['type']) }).then((r: any) => _lo(r, ['type'])),
    delete: (petId: string, id: string) => apiFetch(`/pets/${petId}/health/${id}`, { method: 'DELETE' }),
    uploadAttachments: (petId: string, recordId: string, files: FileList) => {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('files', f));
      return fetch(`${API_BASE}/pets/${petId}/health/${recordId}/attachments`, {
        method: 'POST', headers: { Authorization: `Bearer ${tokenStore.access}` }, body: fd,
      }).then((r) => r.json()).then((j) => (j && j.data ? _lo(j.data, ['type']) : j));
    },
    removeAttachment: (petId: string, recordId: string, url: string) =>
      apiFetch(`/pets/${petId}/health/${recordId}/attachments`, { method: 'DELETE', body: { url } }).then((r: any) => _lo(r, ['type'])),
  },
  reminders: {
    list: (petId: string) => apiFetch(`/pets/${petId}/reminders`).then((r: any) => _loList(r, ['type'])),
    create: (petId: string, d: any) => apiFetch(`/pets/${petId}/reminders`, { method: 'POST', body: _up(d, ['type']) }).then((r: any) => _lo(r, ['type'])),
    update: (petId: string, id: string, d: any) => apiFetch(`/pets/${petId}/reminders/${id}`, { method: 'PATCH', body: _up(d, ['type']) }).then((r: any) => _lo(r, ['type'])),
    complete: (petId: string, id: string) => apiFetch(`/pets/${petId}/reminders/${id}/complete`, { method: 'POST' }).then((r: any) => _lo(r, ['type'])),
    delete: (petId: string, id: string) => apiFetch(`/pets/${petId}/reminders/${id}`, { method: 'DELETE' }),
  },
  weight: {
    list: (petId: string) => apiFetch(`/pets/${petId}/weight`),
    add: (petId: string, d: any) => apiFetch(`/pets/${petId}/weight`, { method: 'POST', body: d }),
    delete: (petId: string, id: string) => apiFetch(`/pets/${petId}/weight/${id}`, { method: 'DELETE' }),
  },
  community: {
    posts: (q?: any) => apiFetch(`/community/posts?${new URLSearchParams(q || {})}`).then((r: any) => _items(r)),
    createPost: (d: any) => apiFetch('/community/posts', { method: 'POST', body: d }),
    getPost: (id: string) => apiFetch(`/community/posts/${id}`),
    deletePost: (id: string) => apiFetch(`/community/posts/${id}`, { method: 'DELETE' }),
    like: (id: string) => apiFetch(`/community/posts/${id}/like`, { method: 'POST' }),
    unlike: (id: string) => apiFetch(`/community/posts/${id}/like`, { method: 'DELETE' }),
    comment: (id: string, d: any) => apiFetch(`/community/posts/${id}/comments`, { method: 'POST', body: d }),
  },
  stats: () => apiFetch('/stats'),
};
