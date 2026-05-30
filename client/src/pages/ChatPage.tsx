import { useRef, useState, type FormEvent } from 'react';
import { getToken } from '../lib/api';
import type { ChatMessage } from '../types';

const DISCLAIMER: ChatMessage = {
  role: 'assistant',
  content:
    '我以毛泽东的思维框架和你讨论问题，基于《毛选》等公开著作提炼，供参考，非本人观点。同志，有什么想聊的？',
};

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([DISCLAIMER]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }));
  };

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setStreaming(true);
    scrollToBottom();

    const assistantMsg: ChatMessage = { role: 'assistant', content: '' };
    setMessages([...nextMessages, assistantMsg]);

    try {
      const token = getToken();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: nextMessages.filter((m, i) => !(i === 0 && m.role === 'assistant')),
        }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? `请求失败 (${res.status})`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('无法读取响应流');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          const line = part.split('\n').find((l) => l.startsWith('data:'));
          if (!line) continue;

          try {
            const payload = JSON.parse(line.slice(5).trim()) as {
              type: string;
              text?: string;
              message?: string;
            };

            if (payload.type === 'chunk' && payload.text) {
              assistantMsg.content += payload.text;
              setMessages([...nextMessages, { ...assistantMsg }]);
              scrollToBottom();
            } else if (payload.type === 'error') {
              throw new Error(payload.message ?? '对话失败');
            }
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== '对话失败') {
              // ignore JSON parse errors on partial chunks
            } else {
              throw parseErr;
            }
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '对话失败';
      setMessages([
        ...nextMessages,
        { role: 'assistant', content: `同志，出了点状况：${message}` },
      ]);
    } finally {
      setStreaming(false);
      scrollToBottom();
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <header className="border-b border-rule px-4 py-4">
        <h1 className="font-serif text-2xl text-ink">问教员</h1>
        <p className="mt-1 font-sans text-xs text-ink-muted">用毛选的方法论分析你的问题</p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-3 font-sans text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-ink/5 text-ink'
                    : 'border-l-2 border-crimson bg-paper-card text-ink'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <form
        onSubmit={send}
        className="border-t border-rule bg-paper-card px-4 py-3"
      >
        <div className="mx-auto flex max-w-2xl gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="同志，请讲…"
            disabled={streaming}
            className="flex-1 rounded-md border border-rule bg-paper px-3 py-2.5 font-sans text-sm outline-none focus:border-crimson disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="shrink-0 rounded-md bg-crimson px-4 py-2.5 font-sans text-sm text-white hover:bg-crimson-dark disabled:opacity-50"
          >
            {streaming ? '…' : '发送'}
          </button>
        </div>
      </form>
    </div>
  );
}
