import { Hono } from 'hono';
import { getRandomQuote, getScheduledQuote, loadQuotes, searchQuotes } from '../lib/quotes.js';

const quote = new Hono();

quote.get('/random', (c) => {
  const excludeParam = c.req.query('exclude') ?? '';
  const excludeIds = excludeParam ? excludeParam.split(',').filter(Boolean) : [];
  const item = getRandomQuote(excludeIds);

  if (!item) {
    return c.json({ error: '语录索引为空，请先运行 npm run build:quotes' }, 503);
  }

  return c.json(item);
});

quote.get('/featured', (c) => {
  const item = getScheduledQuote();

  if (!item) {
    return c.json({ error: '语录索引为空，请先运行 npm run build:quotes' }, 503);
  }

  return c.json(item);
});

quote.get('/list', (c) => {
  const q = c.req.query('q') ?? '';
  const limit = Math.min(parseInt(c.req.query('limit') ?? '100', 10) || 100, 500);

  if (q) {
    return c.json({ items: searchQuotes(q, limit), total: searchQuotes(q, 99999).length });
  }

  const all = loadQuotes();
  return c.json({ items: all.slice(0, limit), total: all.length });
});

export default quote;
