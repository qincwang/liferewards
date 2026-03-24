import type { Category } from "../types";

// --- Fallback base points per minute by category (used if no activityId) ---
export const BASE_POINTS: Record<Category, number> = {
  workout: 3,
  work: 1,
  reading: 1,
  music: 2,
  habits: 0,
};

// --- Streak multiplier thresholds ---
export const STREAK_THRESHOLDS = [
  { days: 14, multiplier: 2.0 },
  { days: 7, multiplier: 1.5 },
  { days: 3, multiplier: 1.2 },
] as const;

// --- Daily balance bonus (log all 3 core categories in one day) ---
export const BALANCE_BONUS = 50;

// --- Per-category daily score cap (null = no cap) ---
export const CATEGORY_DAILY_CAP: Record<Category, number | null> = {
  workout: 500,
  work:    null,  // no cap — reward every hour worked
  reading: 300,
  music:   400,
  habits:  null,  // habits use flat points, no cap needed
};

// --- Soft display target for progress bar (used only in UI, not enforced) ---
export const CATEGORY_DISPLAY_TARGET: Record<Category, number> = {
  workout: 500,
  work:    500,
  reading: 300,
  music:   400,
  habits:  200,
};

export function getStreakMultiplier(streakDays: number): number {
  for (const { days, multiplier } of STREAK_THRESHOLDS) {
    if (streakDays >= days) return multiplier;
  }
  return 1.0;
}
