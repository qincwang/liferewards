import type { LogEntry } from "../types";

const ENTRIES_KEY = "liferewards_data";
const UNLOCKED_KEY = "liferewards_achievements";

// ─── Entries ─────────────────────────────────────────────────────────────────

export function loadEntries(): LogEntry[] {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEntries(entries: LogEntry[]): void {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function addEntry(entry: LogEntry): LogEntry[] {
  const entries = loadEntries();
  entries.push(entry);
  saveEntries(entries);
  return entries;
}

export function deleteEntry(id: string): LogEntry[] {
  const entries = loadEntries().filter((e) => e.id !== id);
  saveEntries(entries);
  return entries;
}

export function updateEntry(
  id: string,
  updates: Partial<Pick<LogEntry, "duration" | "note" | "category" | "activityId" | "mealType">>
): LogEntry[] {
  const entries = loadEntries().map((e) =>
    e.id === id ? { ...e, ...updates } : e
  );
  saveEntries(entries);
  return entries;
}

// ─── Achievement unlock timestamps ──────────────────────────────────────────

/** Stored as { [achievementId]: isoDateString } */
export function loadUnlockedAchievements(): Map<string, string> {
  try {
    const raw = localStorage.getItem(UNLOCKED_KEY);
    return raw ? new Map(Object.entries(JSON.parse(raw))) : new Map();
  } catch {
    return new Map();
  }
}

export function saveUnlockedAchievements(unlocked: Map<string, string>): void {
  localStorage.setItem(UNLOCKED_KEY, JSON.stringify(Object.fromEntries(unlocked)));
}
