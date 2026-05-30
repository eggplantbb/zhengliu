import type { Quote } from '../types';

interface QuoteSlipCardProps {
  quote: Quote;
  className?: string;
}

export function QuoteSlipCard({ quote, className = '' }: QuoteSlipCardProps) {
  return (
    <div className={`relative mx-auto max-w-xs rounded-sm border border-rule bg-paper-card px-6 py-8 shadow-sm ${className}`.trim()}>
      <div className="absolute bottom-0 left-0 top-0 w-1 rounded-l-sm bg-crimson-dark" />
      <blockquote className="font-serif text-xl leading-relaxed text-ink">{quote.text}</blockquote>
      <footer className="mt-6 border-t border-rule pt-4 font-sans text-sm text-ink-muted">
        <p>——《{quote.source}》</p>
        <p className="mt-1 text-xs">{quote.volume} · 第 {quote.articleNo} 篇</p>
      </footer>
    </div>
  );
}
