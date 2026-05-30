const WEREAD_GATEWAY = 'https://i.weread.qq.com/api/agent/gateway';
const SKILL_VERSION = '1.0.3';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCacheKey(apiName: string, params: Record<string, unknown>): string {
  return `${apiName}:${JSON.stringify(params)}`;
}

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function clearWereadCache(): void {
  cache.clear();
}

export async function wereadRequest(
  apiName: string,
  params: Record<string, unknown> = {},
  options: { cacheTtlMs?: number; skipCache?: boolean } = {},
): Promise<unknown> {
  const apiKey = process.env.WEREAD_API_KEY;
  if (!apiKey) {
    throw new Error('WEREAD_API_KEY 未配置');
  }

  const body = { api_name: apiName, skill_version: SKILL_VERSION, ...params };
  const cacheKey = getCacheKey(apiName, params);

  if (!options.skipCache && options.cacheTtlMs) {
    const cached = getFromCache<unknown>(cacheKey);
    if (cached) return cached;
  }

  const res = await fetch(WEREAD_GATEWAY, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`WeRead API HTTP ${res.status}`);
  }

  const data = (await res.json()) as Record<string, unknown>;
  if (data.errcode && data.errcode !== 0) {
    throw new Error(String(data.errmsg ?? 'WeRead API 错误'));
  }

  if (options.cacheTtlMs) {
    setCache(cacheKey, data, options.cacheTtlMs);
  }

  return data;
}

export async function fetchAllNotebooks(refresh = false): Promise<unknown> {
  const cacheKey = 'notebooks:all';
  if (!refresh) {
    const cached = getFromCache<unknown>(cacheKey);
    if (cached) return cached;
  }

  const allBooks: unknown[] = [];
  let lastSort: number | undefined;
  let hasMore = 1;

  while (hasMore) {
    const params: Record<string, unknown> = { count: 100 };
    if (lastSort !== undefined) params.lastSort = lastSort;

    const page = (await wereadRequest('/user/notebooks', params, { skipCache: true })) as {
      books?: Array<{ sort?: number; [key: string]: unknown }>;
      hasMore?: number;
    };

    const books = page.books ?? [];
    allBooks.push(...books);
    hasMore = page.hasMore ?? 0;

    if (hasMore && books.length > 0) {
      lastSort = books[books.length - 1]?.sort;
    } else {
      break;
    }
  }

  const result = { books: allBooks, totalBookCount: allBooks.length };
  setCache(cacheKey, result, 15 * 60 * 1000);
  return result;
}

export async function fetchBookNotes(bookId: string, refresh = false): Promise<unknown> {
  const cacheKey = `booknotes:${bookId}`;
  if (!refresh) {
    const cached = getFromCache<unknown>(cacheKey);
    if (cached) return cached;
  }

  const [bookmarks, reviews] = await Promise.all([
    wereadRequest('/book/bookmarklist', { bookId }, { skipCache: true }),
    wereadRequest('/review/list/mine', { bookid: bookId, count: 100 }, { skipCache: true }),
  ]);

  const result = { bookmarks, reviews };
  setCache(cacheKey, result, 10 * 60 * 1000);
  return result;
}
