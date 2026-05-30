import { useEffect, useState, type FormEvent } from 'react';
import { apiJson, getToken, setToken } from '../lib/api';

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const [token, setTokenInput] = useState(getToken() ?? '');
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authRequired, setAuthRequired] = useState(true);

  useEffect(() => {
    async function check() {
      try {
        const health = await apiJson<{ ok: boolean; auth: boolean }>('/api/health');
        if (!health.auth) {
          setAuthRequired(false);
          setAuthed(true);
          return;
        }

        const existing = getToken();
        if (existing) {
          await apiJson('/api/health');
          setAuthed(true);
        }
      } catch {
        setAuthed(false);
      } finally {
        setChecking(false);
      }
    }
    check();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError('');

    setToken(token);
    try {
      await apiJson('/api/health');
      setAuthed(true);
    } catch {
      setError('访问令牌无效，请检查后重试');
      setAuthed(false);
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="font-sans text-sm text-ink-muted">加载中…</p>
      </div>
    );
  }

  if (authed || !authRequired) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm rounded-lg border border-rule bg-paper-card p-8 shadow-sm">
        <h1 className="font-serif text-2xl text-ink">毛选蒸馏</h1>
        <p className="mt-2 font-sans text-sm text-ink-muted">请输入访问令牌以继续</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            value={token}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="SITE_TOKEN"
            className="w-full rounded-md border border-rule bg-paper px-3 py-2.5 font-sans text-sm text-ink outline-none focus:border-crimson"
          />
          {error && <p className="font-sans text-sm text-crimson">{error}</p>}
          <button
            type="submit"
            disabled={checking || !token.trim()}
            className="w-full rounded-md bg-crimson py-2.5 font-sans text-sm font-medium text-white transition hover:bg-crimson-dark disabled:opacity-50"
          >
            {checking ? '验证中…' : '进入'}
          </button>
        </form>
      </div>
    </div>
  );
}
