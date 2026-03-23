import type { Achievement, LogEntry } from "../types";
import { computeWeeklyRating, getWeekStart } from "./scoring";

// ─── Achievement definitions ─────────────────────────────────────────────────

const DEFINITIONS: Omit<Achievement, "unlockedAt">[] = [
  // Activity firsts
  { id: "first_bouldering",      icon: "🧗", title: "Stone Hands",       description: "Log your first Bouldering session", category: "workout" },
  { id: "first_cardio",          icon: "🏃", title: "First Sprint",       description: "Log your first Cardio session", category: "workout" },
  { id: "first_electric_guitar", icon: "🎸", title: "First Riff",         description: "Log your first Electric Guitar session", category: "music" },
  { id: "first_classical_guitar",icon: "🎼", title: "Classical Soul",     description: "Log your first Classical Guitar session", category: "music" },
  { id: "first_get_up",          icon: "🌅", title: "Early Bird",         description: "Get up at 9 for the first time", category: "habits" },
  { id: "first_sleep",           icon: "🌙", title: "Night Keeper",       description: "Hit your 12:30 sleep target for the first time", category: "habits" },
  { id: "first_clean_meal",      icon: "🥗", title: "Clean Plate",        description: "Log your first clean meal", category: "habits" },

  // Streak milestones
  { id: "streak_3",  icon: "🔥",  title: "On a Roll",       description: "3-day activity streak" },
  { id: "streak_7",  icon: "🔥🔥", title: "Week Warrior",    description: "7-day activity streak" },
  { id: "streak_14", icon: "⚡",  title: "Fortnight Force", description: "14-day activity streak" },
  { id: "streak_30", icon: "💎",  title: "Monthly Legend",  description: "30-day activity streak" },

  // Habit consistency
  { id: "get_up_5",     icon: "☀️",  title: "Morning Habit",    description: "Get up at 9 five times", category: "habits" },
  { id: "get_up_20",    icon: "🌤️",  title: "Morning Master",   description: "Get up at 9 twenty times", category: "habits" },
  { id: "sleep_5",      icon: "💤",  title: "Sleep Routine",    description: "Hit 12:30 sleep target 5 times", category: "habits" },
  { id: "clean_meals_7",icon: "🥦",  title: "Clean Week",       description: "7 clean meals in a single week", category: "habits" },

  // Volume milestones
  { id: "workout_10",  icon: "🏋️",  title: "Iron Will",        description: "Log 10 workout sessions", category: "workout" },
  { id: "workout_50",  icon: "🦾",  title: "Grindset",         description: "Log 50 workout sessions", category: "workout" },
  { id: "music_10",    icon: "🎵",  title: "Practice Makes Perfect", description: "Log 10 music sessions", category: "music" },
  { id: "reading_10",  icon: "📚",  title: "Bookworm",         description: "Log 10 reading sessions", category: "reading" },

  // Weekly rating milestones
  { id: "rating_b",   icon: "🥉", title: "B-Rank",   description: "Reach B rating in a single week" },
  { id: "rating_a",   icon: "🥈", title: "A-Rank",   description: "Reach A rating in a single week" },
  { id: "rating_s",   icon: "🥇", title: "S-Rank",   description: "Reach S rating in a single week" },
  { id: "rating_ss",  icon: "🏆", title: "SS-Rank",  description: "Reach SS rating in a single week" },
  { id: "rating_sss", icon: "👑", title: "SSS-Rank", description: "Reach SSS rating in a single week" },

  // Special
  { id: "balance_master", icon: "⚖️",  title: "Balance Master",  description: "Log all 5 categories in a single day" },
  { id: "perfect_week",   icon: "🌟",  title: "Perfect Week",    description: "Log every day for 7 days straight" },
];

// ─── Check functions ─────────────────────────────────────────────────────────

function countActivity(entries: LogEntry[], activityId: string): number {
  return entries.filter((e) => e.activityId === activityId).length;
}

function countCategory(entries: LogEntry[], category: string): number {
  return entries.filter((e) => e.category === category && (e.duration > 0 || e.activityId !== "meal")).length;
}

function maxStreakAny(entries: LogEntry[]): number {
  if (entries.length === 0) return 0;
  const dates = [...new Set(entries.map((e) => e.date))].sort();
  let max = 1, cur = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1] + "T00:00:00");
    const curr = new Date(dates[i] + "T00:00:00");
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    cur = diff === 1 ? cur + 1 : 1;
    if (cur > max) max = cur;
  }
  return max;
}

function cleanMealsInBestWeek(entries: LogEntry[]): number {
  const cleanMeals = entries.filter((e) => e.activityId === "meal" && e.mealType === "clean");
  if (cleanMeals.length === 0) return 0;
  const countsByWeek = new Map<string, number>();
  for (const e of cleanMeals) {
    const ws = getWeekStart(e.date);
    countsByWeek.set(ws, (countsByWeek.get(ws) ?? 0) + 1);
  }
  return Math.max(...countsByWeek.values());
}

function allCategoriesInADay(entries: LogEntry[]): boolean {
  const byDate = new Map<string, Set<string>>();
  for (const e of entries) {
    const s = byDate.get(e.date) ?? new Set();
    s.add(e.category);
    byDate.set(e.date, s);
  }
  for (const cats of byDate.values()) {
    if (cats.size >= 5) return true;
  }
  return false;
}

function loggedEvery7Days(entries: LogEntry[]): boolean {
  if (entries.length === 0) return false;
  const dates = [...new Set(entries.map((e) => e.date))].sort().reverse();
  // Check the most recent 7 consecutive days
  const today = dates[0];
  const d = new Date(today + "T00:00:00");
  for (let i = 0; i < 7; i++) {
    const check = d.toISOString().slice(0, 10);
    if (!dates.includes(check)) return false;
    d.setDate(d.getDate() - 1);
  }
  return true;
}

function bestWeeklyRating(entries: LogEntry[]): string {
  if (entries.length === 0) return "D";
  const dates = [...new Set(entries.map((e) => e.date))].sort();
  // Sample each week
  const weeks = new Set(dates.map((d) => getWeekStart(d)));
  let best = "D";
  const order = ["D", "C", "B", "A", "S", "SS", "SSS"];
  for (const ws of weeks) {
    const r = computeWeeklyRating(entries, ws).rating;
    if (order.indexOf(r) > order.indexOf(best)) best = r;
  }
  return best;
}

// ─── Main compute function ───────────────────────────────────────────────────

export function computeAchievements(
  entries: LogEntry[],
  previouslyUnlocked: Map<string, string>
): Achievement[] {
  const now = new Date().toISOString().slice(0, 10);
  const maxStreak = maxStreakAny(entries);
  const cleanMealsWeek = cleanMealsInBestWeek(entries);
  const bestRating = bestWeeklyRating(entries);
  const ratingOrder = ["D", "C", "B", "A", "S", "SS", "SSS"];

  function check(id: string, condition: boolean): string | undefined {
    if (!condition) return undefined;
    // Keep original unlock date if already stored, otherwise stamp today
    return previouslyUnlocked.get(id) ?? now;
  }

  const unlockedAt: Record<string, string | undefined> = {
    first_bouldering:       check("first_bouldering",       countActivity(entries, "bouldering") >= 1),
    first_cardio:           check("first_cardio",           countActivity(entries, "cardio") >= 1),
    first_electric_guitar:  check("first_electric_guitar",  countActivity(entries, "electric_guitar") >= 1),
    first_classical_guitar: check("first_classical_guitar", countActivity(entries, "classical_guitar") >= 1),
    first_get_up:           check("first_get_up",           countActivity(entries, "get_up") >= 1),
    first_sleep:            check("first_sleep",            countActivity(entries, "sleep") >= 1),
    first_clean_meal:       check("first_clean_meal",       entries.some((e) => e.activityId === "meal" && e.mealType === "clean")),
    streak_3:               check("streak_3",               maxStreak >= 3),
    streak_7:               check("streak_7",               maxStreak >= 7),
    streak_14:              check("streak_14",              maxStreak >= 14),
    streak_30:              check("streak_30",              maxStreak >= 30),
    get_up_5:               check("get_up_5",               countActivity(entries, "get_up") >= 5),
    get_up_20:              check("get_up_20",              countActivity(entries, "get_up") >= 20),
    sleep_5:                check("sleep_5",                countActivity(entries, "sleep") >= 5),
    clean_meals_7:          check("clean_meals_7",          cleanMealsWeek >= 7),
    workout_10:             check("workout_10",             countCategory(entries, "workout") >= 10),
    workout_50:             check("workout_50",             countCategory(entries, "workout") >= 50),
    music_10:               check("music_10",               countCategory(entries, "music") >= 10),
    reading_10:             check("reading_10",             countCategory(entries, "reading") >= 10),
    rating_b:               check("rating_b",               ratingOrder.indexOf(bestRating) >= ratingOrder.indexOf("B")),
    rating_a:               check("rating_a",               ratingOrder.indexOf(bestRating) >= ratingOrder.indexOf("A")),
    rating_s:               check("rating_s",               ratingOrder.indexOf(bestRating) >= ratingOrder.indexOf("S")),
    rating_ss:              check("rating_ss",              ratingOrder.indexOf(bestRating) >= ratingOrder.indexOf("SS")),
    rating_sss:             check("rating_sss",             ratingOrder.indexOf(bestRating) >= ratingOrder.indexOf("SSS")),
    balance_master:         check("balance_master",         allCategoriesInADay(entries)),
    perfect_week:           check("perfect_week",           loggedEvery7Days(entries)),
  };

  return DEFINITIONS.map((def) => ({
    ...def,
    unlockedAt: unlockedAt[def.id],
  }));
}

/** Returns IDs of achievements newly unlocked (not in previouslyUnlocked) */
export function getNewlyUnlocked(
  current: Achievement[],
  previouslyUnlocked: Map<string, string>
): Achievement[] {
  return current.filter(
    (a) => a.unlockedAt !== undefined && !previouslyUnlocked.has(a.id)
  );
}
