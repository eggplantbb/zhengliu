import { Hono } from 'hono';
import {
  clearWereadCache,
  fetchAllNotebooks,
  fetchBookNotes,
  wereadRequest,
} from '../lib/weread.js';

const weread = new Hono();

weread.get('/notebooks', async (c) => {
  try {
    const refresh = c.req.query('refresh') === '1';
    const data = await fetchAllNotebooks(refresh);
    return c.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'WeRead 请求失败';
    return c.json({ error: message }, 502);
  }
});

weread.get('/books/:bookId/notes', async (c) => {
  try {
    const bookId = c.req.param('bookId');
    const refresh = c.req.query('refresh') === '1';
    const data = await fetchBookNotes(bookId, refresh);
    return c.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'WeRead 请求失败';
    return c.json({ error: message }, 502);
  }
});

weread.post('/proxy', async (c) => {
  try {
    const body = await c.req.json<{ api_name: string; [key: string]: unknown }>();
    const { api_name: apiName, ...params } = body;
    if (!apiName) {
      return c.json({ error: '缺少 api_name' }, 400);
    }
    const data = await wereadRequest(apiName, params);
    return c.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'WeRead 请求失败';
    return c.json({ error: message }, 502);
  }
});

weread.post('/refresh', (c) => {
  clearWereadCache();
  return c.json({ ok: true });
});

export default weread;
