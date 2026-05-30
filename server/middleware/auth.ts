import type { Context, Next } from 'hono';

export async function authMiddleware(c: Context, next: Next) {
  const siteToken = process.env.SITE_TOKEN;

  // Skip auth if no token configured (local dev convenience)
  if (!siteToken) {
    await next();
    return;
  }

  const path = c.req.path;
  if (path === '/api/health' || path.startsWith('/assets')) {
    await next();
    return;
  }

  const auth = c.req.header('Authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : c.req.query('token');

  if (token !== siteToken) {
    return c.json({ error: '未授权访问' }, 401);
  }

  await next();
}
