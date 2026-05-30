export interface Quote {
  id: string;
  text: string;
  source: string;
  volume: string;
  articleNo: string;
}

export interface FeaturedQuoteResponse {
  quote: Quote;
  slotStartedAt: number;
  nextChangeAt: number;
}

export interface NotebookBook {
  bookId: string;
  book?: { title?: string; author?: string; cover?: string };
  reviewCount?: number;
  noteCount?: number;
  bookmarkCount?: number;
  readingProgress?: number;
  markedStatus?: number;
  sort?: number;
}

export interface NotebooksResponse {
  books: NotebookBook[];
  totalBookCount: number;
}

export interface BookmarkItem {
  bookmarkId: string;
  chapterUid: number;
  markText: string;
  createTime?: number;
  range?: string;
}

export interface ReviewItem {
  review?: {
    reviewId?: string;
    content?: string;
    createTime?: number;
    chapterName?: string;
    star?: number;
  };
}

export interface BookNotesResponse {
  bookmarks: {
    updated?: BookmarkItem[];
    chapters?: Array<{ chapterUid: number; title?: string; chapterIdx?: number }>;
    book?: { title?: string; author?: string };
  };
  reviews: {
    reviews?: ReviewItem[];
    totalCount?: number;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
