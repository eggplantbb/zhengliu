import path from 'node:path';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { config } from 'dotenv';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { findProjectRoot, getClientDistPath } from './lib/paths.js';
import { authMiddleware } from './middleware/auth.js';
import chat from './routes/chat.js';
import quote from './routes/quote.js';
import weread from './routes/weread.js';

config({ path: path.join(findProjectRoot(), '.env') });

const clientDist = getClientDistPath();

const app = new Hono();

const allowedOrigin = process.env.CORS_ORIGIN ?? '*';
app.use(
  '/api/*',
  cors({
    origin: allowedOrigin === '*' ? '*' : [allowedOrigin],
    allowHeaders: ['Authorization', 'Content-Type'],
  }),
);

app.use('/api/*', authMiddleware);

app.get('/api/health', (c) =>
  c.json({
    ok: true,
    quotes: true,
    weread: Boolean(process.env.WEREAD_API_KEY),
    llm: Boolean(process.env.OPENAI_API_KEY),
    auth: Boolean(process.env.SITE_TOKEN),
  }),
);

app.route('/api/quote', quote);
app.route('/api/weread', weread);
app.route('/api/chat', chat);

app.use('/*', serveStatic({ root: clientDist }));
app.get('*', serveStatic({ root: clientDist, path: 'index.html' }));

const port = parseInt(process.env.PORT ?? '3000', 10);

serve({ fetch: app.fetch, port }, () => {
  console.log(`毛选蒸馏 running at http://localhost:${port}`);
});
