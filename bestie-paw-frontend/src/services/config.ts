declare global {
  interface Window {
    __BP_CONFIG?: {
      apiBase?: string;
      geminiApiKey?: string;
    };
  }
}

export const API_BASE = (() => {
  try { return window.__BP_CONFIG?.apiBase || 'http://localhost:3000/api'; }
  catch { return 'http://localhost:3000/api'; }
})();

export const AI_CONFIG = {
  geminiApiKey: (() => { try { return window.__BP_CONFIG?.geminiApiKey || ''; } catch { return ''; } })(),
  geminiModel: 'gemini-1.5-flash-latest',
};

export const tokenStore = {
  get access() { return localStorage.getItem('bp_access'); },
  get refresh() { return localStorage.getItem('bp_refresh'); },
  set(access?: string | null, refresh?: string | null) {
    if (access) localStorage.setItem('bp_access', access);
    if (refresh) localStorage.setItem('bp_refresh', refresh);
  },
  clear() {
    localStorage.removeItem('bp_access');
    localStorage.removeItem('bp_refresh');
  }
};
