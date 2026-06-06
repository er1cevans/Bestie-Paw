import { API_BASE } from './config';

// Resolve a stored upload URL (e.g. "/uploads/x.jpg") against the backend origin,
// since the frontend (e.g. :4173) and API (e.g. :3000) may differ. Absolute URLs pass through.
export const resolveUpload = (url: string | null | undefined): string | null | undefined => {
  if (!url) return url;
  if (/^(https?:|data:|blob:)/.test(url)) return url;
  const origin = API_BASE.replace(/\/api\/?$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
};
