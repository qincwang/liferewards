import { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Image, ScrollView, ActivityIndicator } from "react-native";
import { fetchBookCover, fetchBookByISBN } from "../store/books";
import type { BookLog, EffortLevel } from "../store/books";

// ─── Constants ────────────────────────────────────────────────────────────────

const EFFORT_META: Record<EffortLevel, { label: string; sublabel: string; icon: string; selectedRing: string; badgeBg: string; badgeText: string }> = {
  easy:   { label: "Easy",   sublabel: "2–4 hrs",  icon: "🌱", selectedRing: "border-emerald-500 bg-emerald-50", badgeBg: "bg-emerald-100", badgeText: "text-emerald-700" },
  medium: { label: "Medium", sublabel: "~10 hrs",  icon: "🔥", selectedRing: "border-amber-500   bg-amber-50",   badgeBg: "bg-amber-100",   badgeText: "text-amber-700"   },
  high:   { label: "High",   sublabel: "20+ hrs",  icon: "💀", selectedRing: "border-red-500     bg-red-50",     badgeBg: "bg-red-100",     badgeText: "text-red-700"     },
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

  async function handleIsbnLookup() {
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

  async function handleSubmit() {
    if (!title.trim()) return;
    setLoading(true);

    const coverUrl = prefetchedCover ?? await fetchBookCover(title.trim());

    const book: BookLog = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
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
    <View className="bg-white rounded-2xl border border-gray-100 p-5 gap-y-4 shadow-sm">
      <Text className="text-sm font-bold text-gray-700 uppercase tracking-wide">
        📚 Log a Book
      </Text>

      {/* ISBN */}
      <View>
        <Text className="text-xs font-medium text-gray-500 mb-1">
          ISBN <Text className="font-normal text-gray-400">(optional — auto-fills title & cover)</Text>
        </Text>
        <View className="flex-row gap-2">
          <TextInput
            value={isbn}
            onChangeText={(v) => { setIsbn(v); setPrefetchedCover(undefined); setIsbnError(false); }}
            placeholder="e.g. 9780140449136"
            keyboardType="numeric"
            className={`flex-1 px-3 py-2 text-sm rounded-xl border bg-gray-50 text-gray-800 ${
              isbnError ? "border-red-400" : "border-gray-200"
            }`}
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity
            onPress={handleIsbnLookup}
            disabled={isbnLoading}
            className="px-3 py-2 bg-indigo-600 rounded-xl items-center justify-center"
          >
            {isbnLoading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text className="text-white text-xs font-medium">Look up</Text>
            }
          </TouchableOpacity>
        </View>
        {prefetchedCover && <Text className="text-xs text-emerald-600 mt-1">✅ Cover found</Text>}
        {isbnError && <Text className="text-xs text-red-500 mt-1">ISBN not found — enter title manually.</Text>}
      </View>

      {/* Title */}
      <View>
        <Text className="text-xs font-medium text-gray-500 mb-1">Book Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. The Pragmatic Programmer"
          className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-800"
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Finished Date */}
      <View>
        <Text className="text-xs font-medium text-gray-500 mb-1">Finished Date</Text>
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-800"
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Effort */}
      <View>
        <Text className="text-xs font-medium text-gray-500 mb-2">Effort</Text>
        <View className="flex-row gap-2">
          {(Object.keys(EFFORT_META) as EffortLevel[]).map((lvl) => {
            const m = EFFORT_META[lvl];
            const active = effort === lvl;
            return (
              <TouchableOpacity
                key={lvl}
                onPress={() => setEffort(lvl)}
                className={`flex-1 items-center gap-1 py-2.5 rounded-xl border-2 ${
                  active ? m.selectedRing : "border-gray-200 bg-gray-50"
                }`}
              >
                <Text className="text-xl">{m.icon}</Text>
                <Text className={`text-xs font-semibold ${active ? "" : "text-gray-600"}`}>{m.label}</Text>
                <Text style={{ fontSize: 10 }} className="text-gray-400">{m.sublabel}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading || !title.trim()}
        className={`w-full py-2.5 rounded-xl items-center flex-row justify-center gap-2 ${
          loading || !title.trim() ? "bg-indigo-300" : "bg-indigo-600"
        }`}
      >
        {loading
          ? <><ActivityIndicator size="small" color="#fff" /><Text className="text-white text-sm font-semibold"> Fetching cover…</Text></>
          : <Text className="text-white text-sm font-semibold">Add Book</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

// ─── Book Card ────────────────────────────────────────────────────────────────

interface BookCardProps {
  book: BookLog;
  onDelete: (id: string) => void;
}

function BookCard({ book, onDelete }: BookCardProps) {
  const { badgeBg, badgeText, label, sublabel } = EFFORT_META[book.effort];
  const [imgError, setImgError] = useState(false);

  return (
    <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ width: "31%" }}>
      {/* Cover */}
      <View className="bg-gray-100 items-center justify-center relative" style={{ aspectRatio: 2/3 }}>
        {book.coverUrl && !imgError ? (
          <Image
            source={{ uri: book.coverUrl }}
            className="w-full h-full"
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <Text className="text-4xl">📖</Text>
        )}
        <TouchableOpacity
          onPress={() => onDelete(book.id)}
          className="absolute top-1.5 right-1.5 bg-black/40 rounded-full w-6 h-6 items-center justify-center"
        >
          <Text className="text-white text-xs font-bold">×</Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View className="p-3 gap-y-1.5">
        <Text className="text-sm font-semibold text-gray-800 leading-snug" numberOfLines={2}>
          {book.title}
        </Text>
        <Text className="text-xs text-gray-400">{formatDate(book.finishedDate)}</Text>
        <View className={`self-start mt-1 px-2 py-0.5 rounded-full ${badgeBg}`}>
          <Text className={`text-xs font-semibold ${badgeText}`}>{label} · {sublabel}</Text>
        </View>
      </View>
    </View>
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

  const filtered = books
    .filter((b) => getYear(b.finishedDate) === yearFilter)
    .sort((a, b) => b.finishedDate.localeCompare(a.finishedDate));

  const totalByEffort = {
    easy:   filtered.filter((b) => b.effort === "easy").length,
    medium: filtered.filter((b) => b.effort === "medium").length,
    high:   filtered.filter((b) => b.effort === "high").length,
  };

  return (
    <View className="gap-y-5">
      {/* Hero */}
      <View className="bg-teal-600 rounded-2xl p-5 shadow-lg">
        <Text className="text-lg font-bold text-white mb-1">📚 Books Read</Text>
        <Text className="text-sm text-white/80 leading-relaxed">
          Track every book you finish. Covers are fetched automatically.
        </Text>
      </View>

      {/* Add form */}
      <AddForm onAdd={handleAdd} />

      {/* Year filter */}
      {years.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {years.map((y) => (
              <TouchableOpacity
                key={y}
                onPress={() => setYearFilter(y)}
                className={`px-3 py-1 rounded-full ${
                  yearFilter === y ? "bg-indigo-600" : "bg-gray-100"
                }`}
              >
                <Text className={`text-sm font-medium ${yearFilter === y ? "text-white" : "text-gray-600"}`}>
                  {y}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Summary row */}
      {filtered.length > 0 && (
        <View className="flex-row gap-3">
          <View className="bg-white rounded-xl border border-gray-100 p-3 items-center flex-1">
            <Text className="text-xl font-black text-gray-800">{filtered.length}</Text>
            <Text className="text-xs text-gray-400 mt-0.5">Total</Text>
          </View>
          {(["easy", "medium", "high"] as EffortLevel[]).map((lvl) => (
            <View key={lvl} className="bg-white rounded-xl border border-gray-100 p-3 items-center flex-1">
              <Text className="text-xl font-black text-gray-800">{totalByEffort[lvl]}</Text>
              <Text className="text-xs text-gray-400 mt-0.5">{EFFORT_META[lvl].label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Book grid */}
      {filtered.length === 0 ? (
        <View className="items-center py-16">
          <Text className="text-4xl mb-3">📖</Text>
          <Text className="text-sm text-gray-400">No books logged for {yearFilter} yet.</Text>
        </View>
      ) : (
        <View className="flex-row flex-wrap gap-3">
          {filtered.map((book) => (
            <BookCard key={book.id} book={book} onDelete={onDelete} />
          ))}
        </View>
      )}
    </View>
  );
}
