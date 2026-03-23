import type { ConditionProgress, LogEntry, Rating } from "../types";

// ─── Condition definition ─────────────────────────────────────────────────────

export interface ConditionDef {
  id: string;
  label: string;
  unit: string;
  getValue: (entries: LogEntry[]) => number;
  required: number;
  /** Format the value for display (e.g. "24.5 hrs") */
  format?: (val: number) => string;
}

export interface RankDef {
  rating: Rating;
  conditions: ConditionDef[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const workHours    = (e: LogEntry[]) => e.filter(x => x.category === "work").reduce((s, x) => s + x.duration, 0) / 60;
const workoutCount = (e: LogEntry[]) => e.filter(x => x.category === "workout").length;
const musicCount   = (e: LogEntry[]) => e.filter(x => x.category === "music").length;
const cleanMeals   = (e: LogEntry[]) => e.filter(x => x.activityId === "meal" && x.mealType === "clean").length;
const readingCount = (e: LogEntry[]) => e.filter(x => x.category === "reading").length;
const getUpCount   = (e: LogEntry[]) => e.filter(x => x.activityId === "get_up").length;
const sleepCount   = (e: LogEntry[]) => e.filter(x => x.activityId === "sleep").length;

const fmtHrs = (v: number) => `${Math.floor(v)}h ${Math.round((v % 1) * 60)}m`;

// ─── Rank definitions (ascending order) ──────────────────────────────────────
// Each rank lists ALL conditions that must be met that week.
// Rating is granted when every condition >= required.

export const RANK_DEFINITIONS: RankDef[] = [
  {
    rating: "C",
    conditions: [
      { id: "work",    label: "Work",             unit: "hrs",      getValue: workHours,    required: 5,  format: fmtHrs },
      { id: "workout", label: "Workout sessions", unit: "sessions", getValue: workoutCount, required: 1 },
    ],
  },
  {
    rating: "B",
    conditions: [
      { id: "work",        label: "Work",             unit: "hrs",      getValue: workHours,    required: 20, format: fmtHrs },
      { id: "workout",     label: "Workout sessions", unit: "sessions", getValue: workoutCount, required: 2 },
      { id: "music",       label: "Music sessions",   unit: "sessions", getValue: musicCount,   required: 2 },
      { id: "clean_meals", label: "Clean meals",      unit: "meals",    getValue: cleanMeals,   required: 3 },
    ],
  },
  {
    rating: "A",
    conditions: [
      { id: "work",        label: "Work",             unit: "hrs",      getValue: workHours,    required: 40, format: fmtHrs },
      { id: "workout",     label: "Workout sessions", unit: "sessions", getValue: workoutCount, required: 4 },
      { id: "music",       label: "Guitar practice",  unit: "sessions", getValue: musicCount,   required: 5 },
      { id: "clean_meals", label: "Clean meals",      unit: "meals",    getValue: cleanMeals,   required: 10 },
      { id: "get_up",      label: "Get up at 9",      unit: "days",     getValue: getUpCount,   required: 4 },
      { id: "sleep",       label: "Sleep at 12:30",   unit: "days",     getValue: sleepCount,   required: 4 },
    ],
  },
  {
    rating: "S",
    conditions: [
      { id: "work",        label: "Work",             unit: "hrs",      getValue: workHours,    required: 40, format: fmtHrs },
      { id: "workout",     label: "Workout sessions", unit: "sessions", getValue: workoutCount, required: 5 },
      { id: "music",       label: "Guitar practice",  unit: "sessions", getValue: musicCount,   required: 7 },
      { id: "clean_meals", label: "Clean meals",      unit: "meals",    getValue: cleanMeals,   required: 14 },
      { id: "reading",     label: "Reading sessions", unit: "sessions", getValue: readingCount, required: 3 },
    ],
  },
  {
    rating: "SS",
    conditions: [
      { id: "work",        label: "Work",             unit: "hrs",      getValue: workHours,    required: 40, format: fmtHrs },
      { id: "workout",     label: "Workout sessions", unit: "sessions", getValue: workoutCount, required: 6 },
      { id: "music",       label: "Guitar practice",  unit: "sessions", getValue: musicCount,   required: 10 },
      { id: "clean_meals", label: "Clean meals",      unit: "meals",    getValue: cleanMeals,   required: 14 },
      { id: "reading",     label: "Reading sessions", unit: "sessions", getValue: readingCount, required: 5 },
      { id: "get_up",      label: "Get up at 9",      unit: "days",     getValue: getUpCount,   required: 5 },
      { id: "sleep",       label: "Sleep at 12:30",   unit: "days",     getValue: sleepCount,   required: 5 },
    ],
  },
  {
    rating: "SSS",
    conditions: [
      { id: "work",        label: "Work",             unit: "hrs",      getValue: workHours,    required: 40, format: fmtHrs },
      { id: "workout",     label: "Workout sessions", unit: "sessions", getValue: workoutCount, required: 7 },
      { id: "music",       label: "Guitar practice",  unit: "sessions", getValue: musicCount,   required: 14 },
      { id: "clean_meals", label: "Clean meals",      unit: "meals",    getValue: cleanMeals,   required: 21 },
      { id: "reading",     label: "Reading sessions", unit: "sessions", getValue: readingCount, required: 7 },
      { id: "get_up",      label: "Get up at 9",      unit: "days",     getValue: getUpCount,   required: 7 },
      { id: "sleep",       label: "Sleep at 12:30",   unit: "days",     getValue: sleepCount,   required: 7 },
    ],
  },
];

// ─── Rating logic ─────────────────────────────────────────────────────────────

export function evaluateRank(rank: RankDef, entries: LogEntry[]): ConditionProgress[] {
  return rank.conditions.map((c) => {
    const current = c.getValue(entries);
    const met = current >= c.required;
    const fmt = c.format ?? ((v) => String(Math.floor(v)));
    return {
      id: c.id,
      label: c.label,
      unit: c.unit,
      current,
      required: c.required,
      met,
      displayCurrent: fmt(current),
      displayRequired: fmt(c.required),
    };
  });
}

/** Returns the highest Rating whose conditions are all met */
export function computeRating(entries: LogEntry[]): Rating {
  let achieved: Rating = "D";
  for (const rank of RANK_DEFINITIONS) {
    const allMet = rank.conditions.every((c) => c.getValue(entries) >= c.required);
    if (allMet) achieved = rank.rating;
  }
  return achieved;
}

/** Returns the next rank def above the given rating, or null if SSS */
export function nextRankDef(rating: Rating): RankDef | null {
  const order: Rating[] = ["D", "C", "B", "A", "S", "SS", "SSS"];
  const idx = order.indexOf(rating);
  if (idx === -1 || idx >= order.length - 1) return null;
  const nextRating = order[idx + 1] as Rating;
  return RANK_DEFINITIONS.find((r) => r.rating === nextRating) ?? null;
}
