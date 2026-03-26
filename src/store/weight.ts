const KEY = "liferewards_weight";

export interface WeightEntry {
  date: string;
  lbs: number;
}

function load(): WeightEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function save(entries: WeightEntry[]): void {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function getWeightEntries(): WeightEntry[] {
  return load().sort((a, b) => a.date.localeCompare(b.date));
}

export function setWeight(date: string, lbs: number): WeightEntry[] {
  const entries = load();
  const idx = entries.findIndex((e) => e.date === date);
  if (idx !== -1) {
    entries[idx].lbs = lbs;
  } else {
    entries.push({ date, lbs });
  }
  save(entries);
  return getWeightEntries();
}