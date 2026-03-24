import { useEffect, useState } from "react";
import type { Category, LogEntry } from "../types";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "../types";

export interface StreakFuneral {
  id: string;
  category: Category;
  icon: string;
  label: string;
  streakDays: number;
  startDate: string;
  endDate: string; // yesterday
  epitaph: string;
}

const EPITAPHS: Record<Category, string[]> = {
  workout: [
    "The protein shaker sits, untouched.",
    "Rest day... permanent edition.",
    "The gym membership weeps.",
    "They had gains. Then they didn't.",
    "Died doing what they loved: not exercising.",
  ],
  work: [
    "They said they'd get to it tomorrow.",
    "The Pomodoro timer stopped forever.",
    "Out of office. Permanently.",
    "Closed all 47 tabs. Never reopened them.",
    "The task manager has no tasks.",
  ],
  reading: [
    "The bookmark stayed where it was.",
    "Page 247. For eternity.",
    "Unfinished books, unfinished business.",
    "The reading lamp grew cold.",
    "They were going to finish that chapter.",
  ],
  music: [
    "The metronome has gone silent.",
    "Still in tune, just not showing up.",
    "Practice makes perfect. No practice makes this.",
    "The guitar gathered dust and dignity.",
    "The sheet music blows gently in the wind.",
  ],
  habits: [
    "The alarm was ignored one too many times.",
    "Sleep schedule: 💀",
    "They tried. They really did.",
    "Somewhere, a vegetable rots uneaten.",
    "Routine? Never heard of her.",
  ],
};

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDateShort(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });
}

function getStreakOnDate(entries: LogEntry[], category: Category, date: string): number {
  const byDate = new Map<string, LogEntry[]>();
  for (const e of entries) {
    if (!byDate.has(e.date)) byDate.set(e.date, []);
    byDate.get(e.date)!.push(e);
  }
  let streak = 0;
  let check = date;
  while (true) {
    const day = byDate.get(check);
    if (day && day.some((e) => e.category === category)) {
      streak++;
      check = shiftDate(check, -1);
    } else break;
  }
  return streak;
}

const CATEGORIES: Category[] = ["workout", "work", "reading", "music", "habits"];

export function useStreakFunerals(entries: LogEntry[]) {
  const [queue, setQueue] = useState<StreakFuneral[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = shiftDate(today, -1);
    const funerals: StreakFuneral[] = [];

    for (const cat of CATEGORIES) {
      const todayStreak = getStreakOnDate(entries, cat, today);
      if (todayStreak > 0) continue; // streak alive, skip

      const yesterdayStreak = getStreakOnDate(entries, cat, yesterday);
      if (yesterdayStreak < 2) continue; // too short to mourn

      const funeralId = `funeral_${cat}_${today}`;
      if (sessionStorage.getItem(funeralId)) continue; // already shown
      sessionStorage.setItem(funeralId, "1");

      const startDate = shiftDate(yesterday, -(yesterdayStreak - 1));
      const epitaphs = EPITAPHS[cat];
      const epitaph = epitaphs[Math.floor(Math.random() * epitaphs.length)];

      funerals.push({
        id: funeralId,
        category: cat,
        icon: CATEGORY_ICONS[cat],
        label: CATEGORY_LABELS[cat],
        streakDays: yesterdayStreak,
        startDate,
        endDate: yesterday,
        epitaph,
      });
    }

    if (funerals.length > 0) setQueue((q) => [...q, ...funerals]);
  }, [entries]);

  const dismiss = () => setQueue((q) => q.slice(1));

  return { funeral: queue[0] ?? null, dismiss };
}
