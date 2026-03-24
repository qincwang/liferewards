import AsyncStorage from "@react-native-async-storage/async-storage";

export type EffortLevel = "easy" | "medium" | "high";

export interface BookLog {
  id: string;
  title: string;
  isbn?: string;
  finishedDate: string; // ISO date string YYYY-MM-DD
  effort: EffortLevel;
  coverUrl?: string;
  addedAt: string;      // ISO datetime
}

const BOOKS_KEY = "liferewards_books";

// ─── Storage ──────────────────────────────────────────────────────────────────

export async function loadBooks(): Promise<BookLog[]> {
  try {
    const raw = await AsyncStorage.getItem(BOOKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveBooks(books: BookLog[]): Promise<void> {
  await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}

export async function addBook(book: BookLog): Promise<BookLog[]> {
  const books = await loadBooks();
  books.push(book);
  await saveBooks(books);
  return books;
}

export async function deleteBook(id: string): Promise<BookLog[]> {
  const books = (await loadBooks()).filter((b) => b.id !== id);
  await saveBooks(books);
  return books;
}

// ─── ISBN lookup ──────────────────────────────────────────────────────────────

export interface ISBNResult {
  title: string;
  coverUrl?: string;
}

/** Chinese ISBNs: 978-7-xxx (new) or legacy 7-xxx */
function isChineseISBN(clean: string): boolean {
  return clean.startsWith("9787") || /^7\d{9}$/.test(clean);
}

export async function fetchBookByISBN(isbn: string): Promise<ISBNResult | undefined> {
  const clean = isbn.replace(/[\s-]/g, "");

  // Direct Open Library cover URL — works for millions of books, no search needed
  const olDirectCover = `https://covers.openlibrary.org/b/isbn/${clean}-M.jpg`;

  // Helper: verify the OL cover isn't a 1×1 placeholder blank (~807 bytes)
  async function olCoverExists(): Promise<boolean> {
    try {
      const r = await fetch(olDirectCover, { method: "HEAD" });
      const len = Number(r.headers.get("content-length") ?? 0);
      return r.ok && len > 1000;
    } catch { return false; }
  }

  // 1. Douban mirror — best source for Chinese ISBNs (unofficial proxy, may be unavailable)
  if (isChineseISBN(clean)) {
    try {
      const res = await fetch(
        `https://douban.uieee.com/v2/book/isbn/${clean}`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.title) {
          const coverUrl: string | undefined =
            data.images?.large ?? data.images?.medium ?? data.images?.small;
          return { title: data.title, coverUrl };
        }
      }
    } catch { /* mirror down — fall through */ }
  }

  // 2. Google Books — title + cover
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${clean}&maxResults=1`
    );
    if (res.ok) {
      const data = await res.json();
      const info = data?.items?.[0]?.volumeInfo;
      if (info?.title) {
        const links = info.imageLinks;
        let coverUrl: string | undefined = links?.thumbnail ?? links?.smallThumbnail;
        coverUrl = coverUrl ? coverUrl.replace("http://", "https://") : undefined;
        if (!coverUrl && await olCoverExists()) coverUrl = olDirectCover;
        return { title: info.title, coverUrl };
      }
    }
  } catch { /* fall through */ }

  // 3. Open Library Books API — title + cover
  try {
    const res = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${clean}&format=json&jscmd=data`
    );
    if (res.ok) {
      const data = await res.json();
      const book = data[`ISBN:${clean}`];
      if (book?.title) {
        const coverUrl: string | undefined =
          book.cover?.large ?? book.cover?.medium ?? book.cover?.small
          ?? (await olCoverExists() ? olDirectCover : undefined);
        return { title: book.title, coverUrl };
      }
    }
  } catch { /* fall through */ }

  // 4. Open Library Works endpoint — broader ISBN index
  try {
    const res = await fetch(`https://openlibrary.org/isbn/${clean}.json`);
    if (res.ok) {
      const data = await res.json();
      const title: string | undefined = data?.title;
      if (title) {
        const coverUrl = await olCoverExists() ? olDirectCover : undefined;
        return { title, coverUrl };
      }
    }
  } catch { /* give up */ }

  return undefined;
}

// ─── Cover fetch (by title) ───────────────────────────────────────────────────

async function googleBooksCover(query: string): Promise<string | undefined> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`
    );
    if (!res.ok) return undefined;
    const data = await res.json();
    const links = data?.items?.[0]?.volumeInfo?.imageLinks;
    const url: string | undefined = links?.thumbnail ?? links?.smallThumbnail;
    return url ? url.replace("http://", "https://") : undefined;
  } catch {
    return undefined;
  }
}

export async function fetchBookCover(title: string): Promise<string | undefined> {
  const q = encodeURIComponent(title);

  // 1. Penguin edition via Google Books
  const penguinCover = await googleBooksCover(`intitle:${q}+inpublisher:penguin`);
  if (penguinCover) return penguinCover;

  // 2. Any edition via Google Books
  const googleCover = await googleBooksCover(`intitle:${q}`);
  if (googleCover) return googleCover;

  // 3. Open Library fallback
  try {
    const res = await fetch(
      `https://openlibrary.org/search.json?title=${q}&limit=1&fields=cover_i`
    );
    if (res.ok) {
      const data = await res.json();
      const coverId: number | undefined = data?.docs?.[0]?.cover_i;
      if (coverId) return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
    }
  } catch { /* give up */ }

  return undefined;
}
