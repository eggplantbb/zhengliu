import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiJson } from '../lib/api';
import type { BookNotesResponse, NotebookBook, NotebooksResponse, Quote } from '../types';

type Tab = 'quotes' | 'notes';

export function LibraryPage() {
  const [tab, setTab] = useState<Tab>('quotes');
  const [search, setSearch] = useState('');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quotesTotal, setQuotesTotal] = useState(0);
  const [books, setBooks] = useState<NotebookBook[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingAllNotes, setLoadingAllNotes] = useState(false);
  const [notesError, setNotesError] = useState('');
  const [bookNotes, setBookNotes] = useState<Record<string, BookNotesResponse>>({});

  const loadQuotes = useCallback(async (q: string) => {
    setLoadingQuotes(true);
    try {
      const params = new URLSearchParams({ limit: '200' });
      if (q) params.set('q', q);
      const data = await apiJson<{ items: Quote[]; total: number }>(`/api/quote/list?${params}`);
      setQuotes(data.items);
      setQuotesTotal(data.total);
    } finally {
      setLoadingQuotes(false);
    }
  }, []);

  const loadNotebooks = useCallback(async (refresh = false) => {
    setLoadingNotes(true);
    setNotesError('');
    try {
      const data = await apiJson<NotebooksResponse>(
        `/api/weread/notebooks${refresh ? '?refresh=1' : ''}`,
      );
      const sorted = [...data.books].sort(
        (a, b) =>
          (b.reviewCount ?? 0) + (b.noteCount ?? 0) + (b.bookmarkCount ?? 0) -
          ((a.reviewCount ?? 0) + (a.noteCount ?? 0) + (a.bookmarkCount ?? 0)),
      );
      setBooks(sorted);
    } catch (err) {
      setNotesError(err instanceof Error ? err.message : '加载笔记失败');
    } finally {
      setLoadingNotes(false);
    }
  }, []);

  const loadAllBookNotes = useCallback(
    async (refresh = false) => {
      if (books.length === 0) return;

      setLoadingAllNotes(true);
      setNotesError('');

      try {
        const results = await Promise.all(
          books.map(async (book) => {
            const suffix = refresh ? '?refresh=1' : '';
            const data = await apiJson<BookNotesResponse>(`/api/weread/books/${book.bookId}/notes${suffix}`);
            return [book.bookId, data] as const;
          }),
        );

        setBookNotes(Object.fromEntries(results));
      } catch (err) {
        setNotesError(err instanceof Error ? err.message : '加载笔记失败');
      } finally {
        setLoadingAllNotes(false);
      }
    },
    [books],
  );

  useEffect(() => {
    loadQuotes('');
  }, [loadQuotes]);

  useEffect(() => {
    if (tab === 'notes' && books.length === 0) {
      loadNotebooks();
    }
  }, [tab, books.length, loadNotebooks]);

  useEffect(() => {
    if (tab === 'notes' && books.length > 0 && Object.keys(bookNotes).length === 0) {
      loadAllBookNotes();
    }
  }, [tab, books, bookNotes, loadAllBookNotes]);

  const debouncedSearch = useMemo(() => search, [search]);

  useEffect(() => {
    if (tab !== 'quotes') return;
    const timer = setTimeout(() => loadQuotes(debouncedSearch), 300);
    return () => clearTimeout(timer);
  }, [debouncedSearch, tab, loadQuotes]);

  const noteCards = useMemo(() => {
    return books.flatMap((book) => {
      const data = bookNotes[book.bookId];
      if (!data) return [];

      const title = book.book?.title ?? data.bookmarks.book?.title ?? book.bookId;
      const author = book.book?.author ?? data.bookmarks.book?.author ?? '佚名';

      const bookmarkCards = (data.bookmarks.updated ?? []).map((item) => ({
        id: `bookmark-${item.bookmarkId}`,
        text: item.markText,
        title,
        author,
      }));

      const reviewCards = (data.reviews.reviews ?? [])
        .map((item, index) => ({
          id: `review-${item.review?.reviewId ?? `${book.bookId}-${index}`}`,
          text: item.review?.content?.trim() ?? '',
          title,
          author,
        }))
        .filter((item) => item.text);

      return [...bookmarkCards, ...reviewCards];
    });
  }, [books, bookNotes]);

  return (
    <div className="px-4 pb-8 pt-6">
      <h1 className="font-serif text-2xl text-ink">典藏</h1>

      <div className="mt-4 flex gap-2">
        {(['quotes', 'notes'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 font-sans text-sm transition ${
              tab === t
                ? 'bg-crimson text-white'
                : 'border border-rule bg-paper-card text-ink-muted'
            }`}
          >
            {t === 'quotes' ? '毛选语录' : '读书笔记'}
          </button>
        ))}
      </div>

      {tab === 'quotes' && (
        <div className="mt-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索语录或篇名…"
            className="w-full rounded-md border border-rule bg-paper-card px-3 py-2 font-sans text-sm outline-none focus:border-crimson"
          />
          <p className="mt-2 font-sans text-xs text-ink-muted">
            {loadingQuotes ? '加载中…' : `共 ${quotesTotal} 条`}
          </p>
          <ul className="mt-4 space-y-3">
            {quotes.map((q) => (
              <li
                key={q.id}
                className="border-l-2 border-crimson bg-paper-card px-4 py-3"
              >
                <p className="font-serif text-sm leading-relaxed text-ink">{q.text}</p>
                <p className="mt-2 font-sans text-xs text-ink-muted">
                  《{q.source}》 · {q.volume}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'notes' && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <p className="font-sans text-xs text-ink-muted">
              {loadingNotes || loadingAllNotes ? '同步中…' : `共 ${noteCards.length} 条读书笔记`}
            </p>
            <button
              type="button"
              onClick={async () => {
                setBookNotes({});
                await loadNotebooks(true);
              }}
              className="font-sans text-xs text-crimson"
            >
              刷新
            </button>
          </div>

          {notesError && (
            <p className="mt-3 rounded-md border border-crimson/30 bg-paper-card px-3 py-2 font-sans text-sm text-crimson">
              {notesError}
            </p>
          )}

          <ul className="mt-4 space-y-3">
            {noteCards.map((item) => (
              <li key={item.id} className="border-l-2 border-crimson bg-paper-card px-4 py-3">
                <p className="font-serif text-sm leading-relaxed text-ink">{item.text}</p>
                <p className="mt-2 font-sans text-xs text-ink-muted">
                  《{item.title}》 · {item.author}
                </p>
              </li>
            ))}
          </ul>

          {!loadingNotes && !loadingAllNotes && noteCards.length === 0 && !notesError && (
            <p className="mt-4 font-sans text-sm text-ink-muted">暂无笔记内容</p>
          )}
        </div>
      )}
    </div>
  );
}
