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
import { loadPieces } from "../store/pieces";
import type { PieceLog } from "../store/pieces";
import { loadBooks, addBook, deleteBook } from "../store/books";
import type { BookLog } from "../store/books";

export function useLifeData() {
  const [entries, setEntries] = useState<LogEntry[]>(loadEntries);
  const [pieces, setPieces] = useState<PieceLog[]>(loadPieces);
  const [books, setBooks] = useState<BookLog[]>(loadBooks);
  const [unlockedMap, setUnlockedMap] = useState(loadUnlockedAchievements);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  // Recompute achievements whenever entries or pieces change
  useEffect(() => {
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
  }, [entries, pieces, books]); // eslint-disable-line react-hooks/exhaustive-deps

  const logActivity = useCallback(
    (
      activityId: string,
      duration: number,
      mealType?: MealType,
      note?: string,
      date?: string
    ) => {
      const def = ACTIVITIES_BY_ID.get(activityId);
      if (!def) return;

      const entry: LogEntry = {
        id: crypto.randomUUID(),
        category: def.category,
        activityId,
        date: date ?? new Date().toISOString().slice(0, 10),
        duration,
        mealType,
        note,
        createdAt: new Date().toISOString(),
      };
      setEntries(addEntry(entry));
    },
    []
  );

  const removeEntry = useCallback((id: string) => {
    setEntries(deleteEntry(id));
  }, []);

  const editEntry = useCallback(
    (
      id: string,
      updates: Partial<Pick<LogEntry, "duration" | "note" | "category" | "activityId" | "mealType">>
    ) => {
      setEntries(updateEntry(id, updates));
    },
    []
  );

  const dismissNewAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  const addBookEntry = useCallback((book: BookLog) => {
    setBooks(addBook(book));
  }, []);

  const deleteBookEntry = useCallback((id: string) => {
    setBooks(deleteBook(id));
  }, []);

  return {
    entries,
    pieces,
    setPieces,
    books,
    addBookEntry,
    deleteBookEntry,
    logActivity,
    removeEntry,
    editEntry,
    achievements,
    newAchievements,
    dismissNewAchievements,
  };
}
