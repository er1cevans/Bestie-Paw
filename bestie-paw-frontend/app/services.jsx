import { API_BASE, tokenStore, AI_CONFIG } from './src/services/config';
import { api, apiFetch } from './src/services/api';
import { demoApi, MOCK, getDemoState, saveDemoState } from './src/services/mockApi';
import { smartApi, checkBackend } from './src/services/smartApi';
import { aiComplete } from './src/services/ai';
import { resolveUpload } from './src/services/upload';
import { useRouter } from './src/services/router';
import { 
  translations, 
  AuthContext, 
  LangContext, 
  ToastContext, 
  useAuth, 
  useLang, 
  useT, 
  useToast 
} from './src/services/i18n';

// Export to window
Object.assign(window, {
  smartApi, api, demoApi, tokenStore, API_BASE, aiComplete, resolveUpload,
  AuthContext, LangContext, ToastContext,
  useAuth, useLang, useT, useToast, useRouter,
  translations, MOCK, getDemoState, checkBackend,
});
