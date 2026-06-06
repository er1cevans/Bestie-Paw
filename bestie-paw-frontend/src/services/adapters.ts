import { Paginated } from '@bestiepaw/shared';

// ---- Enum case + pagination-envelope adapters ----
// Note: Backend uses UPPERCASE enums and {items} pagination envelopes;
// Frontend UI layer expects lowercase enums and bare arrays (e.g. petTypeIcon).
// Removing these adapters would require touching UI logic across multiple JSX files,
// which violates the "zero UI changes" constraint of the migration task.

export const _up = <T extends Record<string, any>>(obj: T, fields: string[]): Record<string, any> => {
  if (!obj || typeof obj !== 'object') return obj;
  const o = { ...obj } as Record<string, any>;
  for (const f of fields) {
    if (typeof o[f] === 'string') {
      o[f] = o[f].toUpperCase();
    }
  }
  return o;
};

export const _lo = <T extends Record<string, any>>(obj: T, fields: string[]): Record<string, any> => {
  if (!obj || typeof obj !== 'object') return obj;
  const o = { ...obj } as Record<string, any>;
  for (const f of fields) {
    if (typeof o[f] === 'string') {
      o[f] = o[f].toLowerCase();
    }
  }
  return o;
};

export const _loList = <T extends Record<string, any>>(arr: T[], fields: string[]): Record<string, any>[] => {
  return Array.isArray(arr) ? arr.map((x) => _lo(x, fields)) : arr;
};

export const _items = (page: any): any[] => {
  return Array.isArray(page?.items) ? page.items : [];
};

export const _page = <T>(items: T[], q: any = {}): Paginated<T> => {
  const total = items.length;
  const page = Math.max(1, Number(q?.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(q?.limit) || total || 20));
  const start = (page - 1) * limit;
  return { items: items.slice(start, start + limit), total, page, limit };
};
