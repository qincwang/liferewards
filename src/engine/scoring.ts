import type { Category, DailyScore, LogEntry, WeeklyRating } from "../types";
import { CATEGORIES, CORE_CATEGORIES } from "../types";
import {
  ACTIVITIES_BY_ID,
  HEAVY_MEAL_FREE_LIMIT,
  MEAL_CLEAN_PTS,
  MEAL_HEAVY_PENALTY,
} from "./activities";
import {
  BALANCE_BONUS,
  BASE_POINTS,
  CATEGORY_DAILY_CAP,
  getStreakMultiplier,
} from "./rules";
import { computeRating, evaluateRank, nextRankDef } from "./ranks";

// ─── Date helpers ────────────────────────────────────────────────────────────

export function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function prevDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() - 1);
  return toDateStr(d);
}

/** Monday of the week containing dateStr */
export function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return toDateStr(d);
}

export function getLastNDates(n: number, endDate?: string): string[] {
  const end = endDate ? new Date(endDate + "T00:00:00") : new Date();
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    dates.push(toDateStr(d));
  }
  return dates;
}

export function getToday(): string {
  return toDateStr(new Date());
}

// ─── Grouping ────────────────────────────────────────────────────────────────

function groupByDate(entries: LogEntry[]): Map<string, LogEntry[]> {
  const map = new Map<string, LogEntry[]>();
  for (const entry of entries) {
    const list = map.get(entry.date) ?? [];
    list.push(entry);
    map.set(entry.date, list);
  }
  return map;
}

// ─── Per-entry point calculation ─────────────────────────────────────────────

/**
 * Returns raw points for a single entry.
 * weekHeavyMealsBefore = number of heavy meals already counted earlier in this week
 */
function entryPoints(entry: LogEntry, weekHeavyMealsBefore: number): number {
  if (entry.activityId) {
    const def = ACTIVITIES_BY_ID.get(entry.activityId);
    if (def) {
      if (def.type === "duration") {
        return entry.duration * (def.pointsPerMinute ?? 0);
      }
      if (def.isMeal) {
        const mealType = entry.mealType ?? "regular";
        if (mealType === "clean") return MEAL_CLEAN_PTS;
        if (mealType === "regular") return 0;
        // heavy
        return weekHeavyMealsBefore >= HEAVY_MEAL_FREE_LIMIT ? MEAL_HEAVY_PENALTY : 0;
      }
      return def.flatPoints ?? 0;
    }
  }
  // fallback for legacy entries without activityId
  return entry.duration * (BASE_POINTS[entry.category] ?? 1);
}

// ─── Streak calculation ──────────────────────────────────────────────────────

function hasCategoryActivity(entries: LogEntry[], category: Category): boolean {
  return entries.some((e) => e.category === category);
}

function computeStreaks(
  byDate: Map<string, LogEntry[]>,
  targetDate: string
): Record<Category, number> {
  const streaks = {} as Record<Category, number>;
  for (const cat of CATEGORIES) {
    let streak = 0;
    let checkDate = targetDate;
    while (true) {
      const dayEntries = byDate.get(checkDate);
      if (dayEntries && hasCategoryActivity(dayEntries, cat)) {
        streak++;
        checkDate = prevDate(checkDate);
      } else {
        break;
      }
    }
    streaks[cat] = streak;
  }
  return streaks;
}

// ─── Daily score ─────────────────────────────────────────────────────────────

export function computeDailyScore(
  dayEntries: LogEntry[],
  date: string,
  allEntries: LogEntry[]
): DailyScore {
  const byDate = groupByDate(allEntries);
  const streaks = computeStreaks(byDate, date);

  // Count heavy meals in this week before this date (for penalty logic)
  const weekStart = getWeekStart(date);
  const weekDates = getLastNDates(7, date).filter((d) => d >= weekStart && d < date);
  let runningHeavyMeals = 0;
  for (const d of weekDates.sort()) {
    const dEntries = byDate.get(d) ?? [];
    for (const e of dEntries) {
      if (e.activityId === "meal" && e.mealType === "heavy") runningHeavyMeals++;
    }
  }

  const categoryScores = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<Category, number>;

  // Sort today's entries by createdAt so heavy meal order is deterministic
  const sorted = [...dayEntries].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  for (const entry of sorted) {
    const pts = entryPoints(entry, runningHeavyMeals);
    categoryScores[entry.category] += pts;
    if (entry.activityId === "meal" && entry.mealType === "heavy") {
      runningHeavyMeals++;
    }
  }

  // Apply streak multiplier + per-category daily cap
  let totalScore = 0;
  for (const cat of CATEGORIES) {
    if (cat === "habits") {
      totalScore += categoryScores[cat];
    } else {
      const multiplier = getStreakMultiplier(streaks[cat]);
      const raw = Math.round(categoryScores[cat] * multiplier);
      const cap = CATEGORY_DAILY_CAP[cat];
      const capped = cap !== null ? Math.min(raw, cap) : raw;
      categoryScores[cat] = capped;
      totalScore += capped;
    }
  }

  const hasBalanceBonus = CORE_CATEGORIES.every((cat) =>
    hasCategoryActivity(dayEntries, cat)
  );
  if (hasBalanceBonus) totalScore += BALANCE_BONUS;

  return { date, categoryScores, totalScore, streaks, hasBalanceBonus };
}

export function computeScores(entries: LogEntry[], dates: string[]): DailyScore[] {
  const byDate = groupByDate(entries);
  return dates.map((date) => {
    const dayEntries = byDate.get(date) ?? [];
    return computeDailyScore(dayEntries, date, entries);
  });
}

// ─── Weekly rating (condition-based) ─────────────────────────────────────────

export function computeWeeklyRating(entries: LogEntry[], referenceDate?: string): WeeklyRating {
  const today = referenceDate ?? getToday();
  const weekStart = getWeekStart(today);
  const weekEntries = entries.filter((e) => e.date >= weekStart && e.date <= today);

  const weekDates = getLastNDates(7, today).filter((d) => d >= weekStart);
  const scores = computeScores(entries, weekDates);
  const weeklyTotal = scores.reduce((sum, s) => sum + s.totalScore, 0);

  const rating = computeRating(weekEntries);
  const next = nextRankDef(rating);

  return {
    rating,
    weeklyTotal,
    nextRating: next?.rating ?? null,
    nextConditions: next ? evaluateRank(next, weekEntries) : [],
  };
}
