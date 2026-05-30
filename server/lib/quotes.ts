import { readFileSync, existsSync } from 'node:fs';
import { getQuotesPath } from './paths.js';

export interface Quote {
  id: string;
  text: string;
  source: string;
  volume: string;
  articleNo: string;
}

const quotesPath = getQuotesPath();

let quotesCache: Quote[] | null = null;

export function loadQuotes(): Quote[] {
  if (quotesCache) return quotesCache;
  if (!existsSync(quotesPath)) {
    quotesCache = [];
    return quotesCache;
  }
  quotesCache = JSON.parse(readFileSync(quotesPath, 'utf-8')) as Quote[];
  return quotesCache;
}

export function getRandomQuote(excludeIds: string[] = []): Quote | null {
  const quotes = loadQuotes();
  if (quotes.length === 0) return null;

  const exclude = new Set(excludeIds);
  const pool = exclude.size > 0 ? quotes.filter((q) => !exclude.has(q.id)) : quotes;
  const candidates = pool.length > 0 ? pool : quotes;
  return candidates[Math.floor(Math.random() * candidates.length)] ?? null;
}

export function getScheduledQuote(
  timestamp = Date.now(),
  intervalHours = 2,
): { quote: Quote; slotStartedAt: number; nextChangeAt: number } | null {
  const quotes = loadQuotes();
  if (quotes.length === 0) return null;

  const intervalMs = intervalHours * 60 * 60 * 1000;
  const slot = Math.floor(timestamp / intervalMs);
  const index = ((slot % quotes.length) + quotes.length) % quotes.length;

  return {
    quote: quotes[index],
    slotStartedAt: slot * intervalMs,
    nextChangeAt: (slot + 1) * intervalMs,
  };
}

export function searchQuotes(query: string, limit = 100): Quote[] {
  const quotes = loadQuotes();
  const q = query.trim().toLowerCase();
  if (!q) return quotes.slice(0, limit);

  return quotes
    .filter(
      (item) =>
        item.text.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        item.volume.includes(q),
    )
    .slice(0, limit);
}
