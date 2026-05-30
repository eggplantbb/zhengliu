import { useCallback, useState } from 'react';
import { FortuneTube } from '../components/FortuneTube';
import { QuoteSlipCard } from '../components/QuoteSlipCard';
import { apiJson } from '../lib/api';
import type { Quote } from '../types';

export function DrawPage() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [showSlip, setShowSlip] = useState(false);

  const draw = useCallback(async () => {
    setLoading(true);
    setShaking(true);
    setShowSlip(false);

    setTimeout(() => setShaking(false), 300);

    try {
      const exclude = recentIds.slice(-5).join(',');
      const item = await apiJson<Quote>(`/api/quote/random${exclude ? `?exclude=${exclude}` : ''}`);

      setTimeout(() => {
        setQuote(item);
        setShowSlip(true);
        setRecentIds((prev) => [...prev, item.id].slice(-10));
      }, 350);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [recentIds]);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-6 pb-10 pt-6">
      <header className="mb-8 text-center">
        <h1 className="font-serif text-2xl tracking-wide text-ink">今日一签</h1>
        <p className="mt-2 font-sans text-sm text-ink-muted">摇签筒，得教员一言</p>
      </header>

      <FortuneTube shaking={shaking} />

      <button
        type="button"
        onClick={draw}
        disabled={loading}
        className="mt-8 rounded-full bg-crimson px-10 py-3 font-sans text-base font-medium text-white shadow-sm transition hover:bg-crimson-dark disabled:opacity-60"
      >
        {loading ? '摇签中…' : '摇一签'}
      </button>

      {quote && showSlip && (
        <div className="animate-slip-up mt-10 w-full max-w-md">
          <QuoteSlipCard quote={quote} />
        </div>
      )}
    </div>
  );
}
