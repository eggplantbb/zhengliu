import { readFileSync, existsSync } from 'node:fs';
import { getSkillPath } from './paths.js';

let systemPromptCache: string | null = null;

export function getSystemPrompt(): string {
  if (systemPromptCache) return systemPromptCache;

  const skillPath = getSkillPath();

  if (!existsSync(skillPath)) {
    systemPromptCache =
      '你是毛泽东思维框架的分析助手。用矛盾分析法、实践论、论持久战等方法论帮助用户分析问题。称呼对方为同志。';
    return systemPromptCache;
  }

  const raw = readFileSync(skillPath, 'utf-8');
  systemPromptCache = raw.replace(/^---[\s\S]*?---\n/, '');
  return systemPromptCache;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function streamChat(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY 未配置');
  }

  const baseUrl = (process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

  const fullMessages: ChatMessage[] = [
    { role: 'system', content: getSystemPrompt() },
    ...messages.filter((m) => m.role !== 'system'),
  ];

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: fullMessages,
      stream: true,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LLM API 错误 ${res.status}: ${errText.slice(0, 200)}`);
  }

  if (!res.body) {
    throw new Error('LLM 响应体为空');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') return;

      try {
        const parsed = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onChunk(content);
      } catch {
        // skip malformed SSE chunks
      }
    }
  }
}
