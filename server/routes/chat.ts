import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { streamChat, type ChatMessage } from '../lib/chat.js';

const chatRates = new Map<string, { count: number; resetAt: number }>();
const CHAT_LIMIT = 20;
const CHAT_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = chatRates.get(ip);

  if (!entry || now > entry.resetAt) {
    chatRates.set(ip, { count: 1, resetAt: now + CHAT_WINDOW_MS });
    return true;
  }

  if (entry.count >= CHAT_LIMIT) return false;
  entry.count += 1;
  return true;
}

const chat = new Hono();

chat.post('/', async (c) => {
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  if (!checkRateLimit(ip)) {
    return c.json({ error: '请求过于频繁，请稍后再试' }, 429);
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: '无效的请求体' }, 400);
  }

  const messages = body.messages ?? [];
  if (messages.length === 0) {
    return c.json({ error: '消息不能为空' }, 400);
  }

  const last = messages[messages.length - 1];
  if (last.role !== 'user' || !last.content.trim()) {
    return c.json({ error: '最后一条消息必须是用户提问' }, 400);
  }

  return streamSSE(c, async (stream) => {
    try {
      await streamChat(messages, async (text) => {
        await stream.writeSSE({ data: JSON.stringify({ type: 'chunk', text }) });
      });
      await stream.writeSSE({ data: JSON.stringify({ type: 'done' }) });
    } catch (err) {
      const message = err instanceof Error ? err.message : '对话失败';
      await stream.writeSSE({ data: JSON.stringify({ type: 'error', message }) });
    }
  });
});

export default chat;
