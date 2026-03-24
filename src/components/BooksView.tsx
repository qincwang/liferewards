import { useState } from "react";
import { fetchBookCover, fetchBookByISBN } from "../store/books";
import type { BookLog, EffortLevel } from "../store/books";

// ─── Constants ────────────────────────────────────────────────────────────────

const EFFORT_META: Record<EffortLevel, { label: string; sublabel: string; icon: string; color: string; selected: string }> = {
  easy:   { label: "Easy",   sublabel: "2–4 hrs",  icon: "🌱", color: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300", selected: "ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950" },
  medium: { label: "Medium", sublabel: "~10 hrs",  icon: "🔥", color: "bg-amber-100   dark:bg-amber-900   text-amber-700   dark:text-amber-300",   selected: "ring-2 ring-amber-500   bg-amber-50   dark:bg-amber-950"   },
  high:   { label: "High",   sublabel: "20+ hrs",  icon: "💀", color: "bg-red-100     dark:bg-red-900     text-red-700     dark:text-red-300",     selected: "ring-2 ring-red-500     bg-red-50     dark:bg-red-950"     },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getYear(isoDate: string) {
  return isoDate.slice(0, 4);
}

function formatDate(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function uniqueYears(books: BookLog[]): string[] {
  const years = [...new Set(books.map((b) => getYear(b.finishedDate)))];
  return years.sort((a, b) => Number(b) - Number(a));
}

// ─── Add Form ─────────────────────────────────────────────────────────────────

interface AddFormProps {
  onAdd: (book: BookLog) => void;
}

function AddForm({ onAdd }: AddFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [isbn, setIsbn] = useState("");
  const [title, setTitle] = useState("");
  const [prefetchedCover, setPrefetchedCover] = useState<string | undefined>();
  const [isbnLoading, setIsbnLoading] = useState(false);
  const [isbnError, setIsbnError] = useState(false);
  const [date, setDate] = useState(today);
  const [effort, setEffort] = useState<EffortLevel>("medium");
  const [loading, setLoading] = useState(false);

  async function handleIsbnBlur() {
    const clean = isbn.replace(/[\s-]/g, "");
    if (clean.length !== 10 && clean.length !== 13) return;
    setIsbnLoading(true);
    setIsbnError(false);
    const result = await fetchBookByISBN(clean);
    setIsbnLoading(false);
    if (result) {
      setTitle(result.title);
      setPrefetchedCover(result.coverUrl);
    } else {
      setIsbnError(true);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    const coverUrl = prefetchedCover ?? await fetchBookCover(title.trim());

    const book: BookLog = {
      id: crypto.randomUUID(),
      title: title.trim(),
      isbn: isbn.replace(/[\s-]/g, "") || undefined,
      finishedDate: date,
      effort,
      coverUrl,
      addedAt: new Date().toISOString(),
    };

    onAdd(book);
    setIsbn("");
    setTitle("");
    setPrefetchedCover(undefined);
    setIsbnError(false);
    setDate(today);
    setEffort("medium");
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 space-y-4"
    >
      <h2 className="text-sm font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wide">
        📚 Log a Book
      </h2>

      {/* ISBN */}
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
          ISBN <span className="font-normal text-gray-400 dark:text-slate-500">(optional — auto-fills title & cover)</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={isbn}
            onChange={(e) => { setIsbn(e.target.value); setPrefetchedCover(undefined); setIsbnError(false); }}
            onBlur={handleIsbnBlur}
            placeholder="e.g. 9780140449136"
            inputMode="numeric"
            className={`w-full px-3 py-2 text-sm rounded-xl border bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
              isbnError ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-slate-600"
            }`}
          />
          {isbnLoading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm animate-spin">⏳</span>
          )}
          {prefetchedCover && !isbnLoading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">✅</span>
          )}
        </div>
        {isbnError && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-1">ISBN not found — enter title manually.</p>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
          Book Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. The Pragmatic Programmer"
          required
          className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Finished Date */}
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
          Finished Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Effort — icon buttons */}
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-2">
          Effort
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(EFFORT_META) as EffortLevel[]).map((lvl) => {
            const m = EFFORT_META[lvl];
            const active = effort === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setEffort(lvl)}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all ${
                  active
                    ? `${m.selected} border-transparent`
                    : "border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700"
                }`}
              >
                <span className="text-xl">{m.icon}</span>
                <span className={`text-xs font-semibold ${active ? "" : "text-gray-600 dark:text-slate-300"}`}>
                  {m.label}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-slate-500">{m.sublabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !title.trim()}
        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 text-white transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin text-base">⏳</span>
            Fetching cover…
          </>
        ) : (
          "Add Book"
        )}
      </button>
    </form>
  );
}

// ─── Book Card ────────────────────────────────────────────────────────────────

interface BookCardProps {
  book: BookLog;
  onDelete: (id: string) => void;
}

function BookCard({ book, onDelete }: BookCardProps) {
  const { label, sublabel, color } = EFFORT_META[book.effort];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
      {/* Cover */}
      <div className="aspect-[2/3] bg-gray-100 dark:bg-slate-800 flex items-center justify-center relative">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span className="text-4xl select-none">📖</span>
        )}
        {/* Delete button */}
        <button
          onClick={() => onDelete(book.id)}
          title="Remove"
          className="absolute top-1.5 right-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors"
        >
          ×
        </button>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 leading-snug line-clamp-2">
          {book.title}
        </p>
        <p className="text-xs text-gray-400 dark:text-slate-500">
          {formatDate(book.finishedDate)}
        </p>
        <span className={`self-start mt-auto text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
          {label} · {sublabel}
        </span>
      </div>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

interface BooksViewProps {
  books: BookLog[];
  onAdd: (book: BookLog) => void;
  onDelete: (id: string) => void;
}

export default function BooksView({ books, onAdd, onDelete }: BooksViewProps) {
  const thisYear = new Date().getFullYear().toString();
  const years = uniqueYears(books);
  const [yearFilter, setYearFilter] = useState<string>(thisYear);

  function handleAdd(book: BookLog) {
    onAdd(book);
    setYearFilter(getYear(book.finishedDate));
  }

  function handleDelete(id: string) {
    onDelete(id);
  }

  const filtered = books
    .filter((b) => getYear(b.finishedDate) === yearFilter)
    .sort((a, b) => b.finishedDate.localeCompare(a.finishedDate));

  // Stats
  const totalByEffort = {
    easy:   filtered.filter((b) => b.effort === "easy").length,
    medium: filtered.filter((b) => b.effort === "medium").length,
    high:   filtered.filter((b) => b.effort === "high").length,
  };

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl p-5 text-white shadow-lg">
        <p className="text-lg font-bold mb-1">📚 Books Read</p>
        <p className="text-sm opacity-80 leading-relaxed">
          Track every book you finish. Covers are fetched automatically.
        </p>
      </div>

      {/* Add form */}
      <AddForm onAdd={handleAdd} />

      {/* Year filter */}
      {years.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setYearFilter(y)}
              className={`px-3 py-1 text-sm rounded-full font-medium transition-colors ${
                yearFilter === y
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      {/* Summary row */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700 p-3 text-center">
            <p className="text-xl font-black text-gray-800 dark:text-slate-100">{filtered.length}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Total</p>
          </div>
          {(["easy", "medium", "high"] as EffortLevel[]).map((lvl) => (
            <div key={lvl} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700 p-3 text-center">
              <p className="text-xl font-black text-gray-800 dark:text-slate-100">{totalByEffort[lvl]}</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{EFFORT_META[lvl].label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Book grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-slate-500">
          <p className="text-4xl mb-3">📖</p>
          <p className="text-sm">No books logged for {yearFilter} yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {filtered.map((book) => (
            <BookCard key={book.id} book={book} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
