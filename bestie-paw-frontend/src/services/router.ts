import { useState, useEffect, useCallback } from 'react';

// ---- Simple Hash Router ----
export function useRouter() {
  const [route, setRoute] = useState(window.location.hash.slice(1) || '/');
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const navigate = useCallback((path: string) => { window.location.hash = path; }, []);
  return { route, navigate };
}
