import { useCallback, useEffect, useMemo, useState } from 'react';
import { QuoteSlipCard } from '../components/QuoteSlipCard';
import { apiJson } from '../lib/api';
import type { FeaturedQuoteResponse, Quote } from '../types';

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function FeaturedPage() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [nextChangeAt, setNextChangeAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadFeatured = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await apiJson<FeaturedQuoteResponse>('/api/quote/featured');
      setQuote(data.quote);
      setNextChangeAt(data.nextChangeAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

  useEffect(() => {
    if (!nextChangeAt) return;

    const delay = Math.max(nextChangeAt - Date.now(), 0) + 1000;
    const timer = window.setTimeout(() => {
      loadFeatured();
    }, delay);

    return () => window.clearTimeout(timer);
  }, [nextChangeAt, loadFeatured]);

  const nextLabel = useMemo(() => {
    if (!nextChangeAt) return '';
    return formatTime(nextChangeAt);
  }, [nextChangeAt]);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-6 pb-10 pt-6">
      {loading && <p className="font-sans text-sm text-ink-muted">加载中…</p>}

      {!loading && error && (
        <p className="rounded-md border border-crimson/30 bg-paper-card px-4 py-3 font-sans text-sm text-crimson">
          {error}
        </p>
      )}

      {quote && !loading && !error && (
        <div className="w-full max-w-md">
          <QuoteSlipCard quote={quote} />
          <p className="mt-4 text-center font-sans text-xs text-ink-muted">
            下次更新：{nextLabel}
          </p>
        </div>
      )}
    </div>
  );
}
