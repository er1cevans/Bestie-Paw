import { api } from './api';
import { demoApi } from './mockApi';
import { API_BASE } from './config';

let _isDemo: boolean | null = null;
export async function checkBackend(): Promise<boolean> {
  if (_isDemo !== null) return _isDemo;
  try {
    const r = await fetch(`${API_BASE}/stats`, { signal: AbortSignal.timeout(3000) });
    _isDemo = !r.ok;
  } catch { _isDemo = true; }
  return _isDemo;
}

function createSmartApi() {
  const handler: ProxyHandler<any> = {
    get(target, prop: string) {
      if (typeof target[prop] === 'object' && target[prop] !== null) {
        return new Proxy(target[prop], {
          get(innerTarget, innerProp: string) {
            if (typeof innerTarget[innerProp] === 'function') {
              return async (...args: any[]) => {
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
        return async (...args: any[]) => {
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

export const smartApi = createSmartApi();
