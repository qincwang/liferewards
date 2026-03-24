import { useCallback, useEffect, useState } from "react";
import type { Achievement, LogEntry, MealType } from "../types";
import { ACTIVITIES_BY_ID } from "../engine/activities";
import { computeAchievements, getNewlyUnlocked } from "../engine/achievements";
import {
  addEntry,
  deleteEntry,
  loadEntries,
  loadUnlockedAchievements,
  saveUnlockedAchievements,
  updateEntry,
} from "../store/storage";
import { loadPieces, addPiece, deletePiece } from "../store/pieces";
import type { PieceLog } from "../store/pieces";
import { loadBooks, addBook, deleteBook } from "../store/books";
import type { BookLog } from "../store/books";

export function useLifeData() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [pieces, setPieces] = useState<PieceLog[]>([]);
  const [books, setBooks] = useState<BookLog[]>([]);
  const [unlockedMap, setUnlockedMap] = useState<Map<string, string>>(new Map());
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load all data from AsyncStorage on mount
  useEffect(() => {
    Promise.all([
      loadEntries(),
      loadBooks(),
      loadPieces(),
      loadUnlockedAchievements(),
    ]).then(([e, b, p, u]) => {
      setEntries(e);
      setBooks(b);
      setPieces(p);
      setUnlockedMap(u);
      setLoaded(true);
    });
  }, []);

  // Recompute achievements whenever entries or pieces change
  useEffect(() => {
    if (!loaded) return;
    const computed = computeAchievements(entries, unlockedMap, pieces, books);
    const fresh = getNewlyUnlocked(computed, unlockedMap);

    // Build the current unlocked map from computed results (handles regressions on delete)
    const currentUnlocked = new Map<string, string>();
    for (const a of computed) {
      if (a.unlockedAt) currentUnlocked.set(a.id, a.unlockedAt);
    }

    const hasChanges =
      fresh.length > 0 ||
      [...unlockedMap.keys()].some((id) => !currentUnlocked.has(id));

    if (hasChanges) {
      saveUnlockedAchievements(currentUnlocked);
      setUnlockedMap(currentUnlocked);
      if (fresh.length > 0) setNewAchievements(fresh);
    }

    setAchievements(computed);
  }, [entries, pieces, books, loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const logActivity = useCallback(
    async (
      activityId: string,
      duration: number,
      mealType?: MealType,
      note?: string,
      date?: string
    ) => {
      const def = ACTIVITIES_BY_ID.get(activityId);
      if (!def) return;

      const entry: LogEntry = {
        id: Math.random().toString(36).slice(2) + Date.now().toString(36),
        category: def.category,
        activityId,
        date: date ?? new Date().toISOString().slice(0, 10),
        duration,
        mealType,
        note,
        createdAt: new Date().toISOString(),
      };
      const updated = await addEntry(entry);
      setEntries(updated);
    },
    []
  );

  const removeEntry = useCallback(async (id: string) => {
    const updated = await deleteEntry(id);
    setEntries(updated);
  }, []);

  const editEntry = useCallback(
    async (
      id: string,
      updates: Partial<Pick<LogEntry, "duration" | "note" | "category" | "activityId" | "mealType">>
    ) => {
      const updated = await updateEntry(id, updates);
      setEntries(updated);
    },
    []
  );

  const dismissNewAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  const addBookEntry = useCallback(async (book: BookLog) => {
    const updated = await addBook(book);
    setBooks(updated);
  }, []);

  const deleteBookEntry = useCallback(async (id: string) => {
    const updated = await deleteBook(id);
    setBooks(updated);
  }, []);

  const addPieceEntry = useCallback(async (piece: PieceLog) => {
    const updated = await addPiece(piece);
    setPieces(updated);
  }, []);

  const deletePieceEntry = useCallback(async (id: string) => {
    const updated = await deletePiece(id);
    setPieces(updated);
  }, []);

  return {
    entries,
    pieces,
    setPieces,
    addPieceEntry,
    deletePieceEntry,
    books,
    addBookEntry,
    deleteBookEntry,
    logActivity,
    removeEntry,
    editEntry,
    achievements,
    newAchievements,
    dismissNewAchievements,
    loaded,
  };
}
