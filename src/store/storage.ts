import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LogEntry } from "../types";

const ENTRIES_KEY = "liferewards_data";
const UNLOCKED_KEY = "liferewards_achievements";

// ─── Entries ─────────────────────────────────────────────────────────────────

export async function loadEntries(): Promise<LogEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(ENTRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveEntries(entries: LogEntry[]): Promise<void> {
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export async function addEntry(entry: LogEntry): Promise<LogEntry[]> {
  const entries = await loadEntries();
  entries.push(entry);
  await saveEntries(entries);
  return entries;
}

export async function deleteEntry(id: string): Promise<LogEntry[]> {
  const entries = (await loadEntries()).filter((e) => e.id !== id);
  await saveEntries(entries);
  return entries;
}

export async function updateEntry(
  id: string,
  updates: Partial<Pick<LogEntry, "duration" | "note" | "category" | "activityId" | "mealType">>
): Promise<LogEntry[]> {
  const entries = (await loadEntries()).map((e) =>
    e.id === id ? { ...e, ...updates } : e
  );
  await saveEntries(entries);
  return entries;
}

// ─── Achievement unlock timestamps ──────────────────────────────────────────

/** Stored as { [achievementId]: isoDateString } */
export async function loadUnlockedAchievements(): Promise<Map<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(UNLOCKED_KEY);
    return raw ? new Map(Object.entries(JSON.parse(raw))) : new Map();
  } catch {
    return new Map();
  }
}

export async function saveUnlockedAchievements(unlocked: Map<string, string>): Promise<void> {
  await AsyncStorage.setItem(UNLOCKED_KEY, JSON.stringify(Object.fromEntries(unlocked)));
}
