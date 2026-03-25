const KEY = "liferewards_daily_tasks";

export interface DailyTaskDef {
  id: string;
  label: string;
  points: number;
}

export const DAILY_TASKS: DailyTaskDef[] = [
  { id: "classical_guitar_15", label: "Classical guitar — 15 min skill practice", points: 5 },
  { id: "electric_guitar_15",  label: "Electric guitar — 15 min skill practice",  points: 5 },
  { id: "music_theory_15",     label: "Music theory — 15 min learning",            points: 5 },
  { id: "no_phone_scrolling",  label: "No phone scrolling for the day",            points: 30 },
];

type Store = Record<string, string[]>; // date -> completed task ids

function load(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

function save(store: Store): void {
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function getTodayCompletions(today: string): string[] {
  return load()[today] ?? [];
}

export function toggleTask(today: string, taskId: string): string[] {
  const store = load();
  const completed = store[today] ?? [];
  const idx = completed.indexOf(taskId);
  if (idx === -1) {
    completed.push(taskId);
  } else {
    completed.splice(idx, 1);
  }
  store[today] = completed;
  save(store);
  return [...completed];
}