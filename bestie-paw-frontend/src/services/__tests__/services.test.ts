import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiFetch } from '../api';
import { tokenStore, API_BASE } from '../config';
import { resolveUpload } from '../upload';
import { _up, _lo, _loList, _items, _page } from '../adapters';

describe('token renewal & error envelopes', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('window', { location: { hash: '' } });
    tokenStore.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('parses error envelopes correctly (code/message/fields)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid data', fields: { name: ['Too short'] } }
      })
    } as any);

    try {
      await apiFetch('/test');
      expect.fail('Should have thrown');
    } catch (err: any) {
      expect(err.code).toBe('VALIDATION_ERROR');
      expect(err.message).toBe('Invalid data');
      expect(err.fields).toEqual({ name: ['Too short'] });
      expect(err.status).toBe(400);
    }
  });

  it('renews token successfully and retries request', async () => {
    tokenStore.set('old-access', 'refresh-token');

    // 1st request fails with 401
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: { code: 'UNAUTHORIZED' } })
    } as any);

    // Refresh token request succeeds
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: { accessToken: 'new-access', refreshToken: 'new-refresh' } })
    } as any);

    // Retry request succeeds
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: { success: true } })
    } as any);

    const res = await apiFetch('/test');
    expect(res).toEqual({ success: true });
    expect(tokenStore.access).toBe('new-access');
    expect(tokenStore.refresh).toBe('new-refresh');
    expect(fetch).toHaveBeenCalledTimes(3);
    
    const retryCallArgs = vi.mocked(fetch).mock.calls[2];
    expect((retryCallArgs[1] as any).headers['Authorization']).toBe('Bearer new-access');
  });

  it('clears token and redirects if token renewal fails', async () => {
    tokenStore.set('old-access', 'refresh-token');

    // 1st request fails with 401
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: { code: 'UNAUTHORIZED' } })
    } as any);

    // Refresh token request fails
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: { code: 'INVALID_REFRESH_TOKEN' } })
    } as any);

    try {
      await apiFetch('/test');
      expect.fail('Should have thrown');
    } catch (err: any) {
      expect(err.code).toBe('UNAUTHORIZED'); // Original error
      expect(tokenStore.access).toBeNull();
      expect(tokenStore.refresh).toBeNull();
      expect(window.location.hash).toBe('#/login');
    }
  });
});

describe('resolveUpload', () => {
  it('returns passed URLs directly for http/data/blob', () => {
    expect(resolveUpload('http://example.com/a.jpg')).toBe('http://example.com/a.jpg');
    expect(resolveUpload('https://example.com/b.jpg')).toBe('https://example.com/b.jpg');
    expect(resolveUpload('data:image/png;base64,123')).toBe('data:image/png;base64,123');
    expect(resolveUpload('blob:http://localhost/123')).toBe('blob:http://localhost/123');
  });

  it('resolves relative paths against API_BASE', () => {
    const origin = API_BASE.replace(/\/api\/?$/, '');
    expect(resolveUpload('/uploads/test.jpg')).toBe(`${origin}/uploads/test.jpg`);
    expect(resolveUpload('uploads/test.jpg')).toBe(`${origin}/uploads/test.jpg`);
  });

  it('handles null/undefined gracefully', () => {
    expect(resolveUpload(null)).toBeNull();
    expect(resolveUpload(undefined)).toBeUndefined();
  });
});

describe('adapters', () => {
  it('_up converts specified fields to uppercase', () => {
    expect(_up({ type: 'dog', a: 1 }, ['type'])).toEqual({ type: 'DOG', a: 1 });
  });

  it('_lo converts specified fields to lowercase', () => {
    expect(_lo({ type: 'DOG', a: 1 }, ['type'])).toEqual({ type: 'dog', a: 1 });
  });

  it('_loList converts array elements', () => {
    expect(_loList([{ type: 'DOG' }, { type: 'CAT' }], ['type'])).toEqual([{ type: 'dog' }, { type: 'cat' }]);
  });

  it('_items extracts items array or returns empty array', () => {
    expect(_items({ items: [1, 2], total: 2, page: 1, limit: 10 })).toEqual([1, 2]);
    expect(_items(null)).toEqual([]);
    expect(_items({})).toEqual([]);
  });

  it('_page constructs pagination envelope from array', () => {
    const arr = [1, 2, 3, 4, 5];
    const page = _page(arr, { page: 2, limit: 2 });
    expect(page.items).toEqual([3, 4]);
    expect(page.total).toBe(5);
    expect(page.page).toBe(2);
    expect(page.limit).toBe(2);
  });
});
