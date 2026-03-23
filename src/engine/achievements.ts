import type { Achievement, AchievementTier, LogEntry } from "../types";
import { computeWeeklyRating, computeScores, getWeekStart } from "./scoring";

// ─── Achievement definitions ─────────────────────────────────────────────────

type Def = Omit<Achievement, "unlockedAt">;

function def(
  id: string, icon: string, title: string, description: string,
  tier: AchievementTier, category?: Achievement["category"]
): Def {
  return { id, icon, title, description, tier, ...(category ? { category } : {}) };
}

const DEFINITIONS: Def[] = [
  // ── BRONZE ──────────────────────────────────────────────────────────────────

  // Activity firsts
  def("first_workout",         "🏋️", "First Rep",           "Log your first Workout session",                          "bronze", "workout"),
  def("first_bouldering",      "🧗", "Stone Hands",         "Log your first Bouldering session",                       "bronze", "workout"),
  def("first_cardio",          "🏃", "First Sprint",        "Log your first Cardio session",                           "bronze", "workout"),
  def("first_yoga",            "🧘", "Namaste",             "Log your first Yoga session",                             "bronze", "workout"),
  def("first_electric_guitar", "🎸", "First Riff",          "Log your first Electric Guitar session",                  "bronze", "music"),
  def("first_classical_guitar","🎼", "Classical Soul",      "Log your first Classical Guitar session",                 "bronze", "music"),
  def("first_reading",         "📖", "Cracked It Open",     "Log your first Reading session",                          "bronze", "reading"),
  def("first_work",            "💼", "Clocked In",          "Log your first Work session",                             "bronze"),
  def("first_get_up",          "🌅", "Early Bird",          "Get up at 9 for the first time",                          "bronze", "habits"),
  def("first_sleep",           "🌙", "Night Keeper",        "Hit your 12:30 sleep target for the first time",          "bronze", "habits"),
  def("first_clean_meal",      "🥗", "Clean Plate",         "Log your first clean meal",                               "bronze", "habits"),

  // Early streaks
  def("streak_3",  "🔥",    "On a Roll",       "3-day activity streak",                                       "bronze"),
  def("streak_7",  "🔥🔥",  "Week Warrior",    "7-day activity streak",                                       "bronze"),

  // Early ratings
  def("rating_c",  "⭐",   "C-Rank",           "Reach C rating in a single week",                             "bronze"),
  def("rating_b",  "🥉",   "B-Rank",           "Reach B rating in a single week",                             "bronze"),

  // Early volume — workout
  def("workout_5",    "💪",  "Warming Up",         "Complete 5 workout sessions",                             "bronze", "workout"),
  def("yoga_3",       "🧘",  "Finding Balance",    "Complete 3 yoga sessions",                                "bronze", "workout"),
  def("bouldering_3", "🪨",  "Rock Curious",       "Complete 3 bouldering sessions",                         "bronze", "workout"),
  def("cardio_5",     "🏃",  "Running Start",      "Complete 5 cardio sessions",                              "bronze", "workout"),

  // Early volume — other
  def("music_5",    "🎵",  "Learning the Strings", "Complete 5 music sessions",                               "bronze", "music"),
  def("reading_5",  "📚",  "Page Turner",          "Complete 5 reading sessions",                             "bronze", "reading"),

  // Habit starters
  def("get_up_3",  "🌤️", "Early Riser",       "Get up at 9 three times",                                     "bronze", "habits"),
  def("sleep_3",   "💤",  "Lights Out",        "Hit sleep target 3 times",                                    "bronze", "habits"),
  def("get_up_5",  "☀️",  "Morning Habit",     "Get up at 9 five times",                                      "bronze", "habits"),
  def("sleep_5",   "🌛",  "Sleep Routine",     "Hit sleep target 5 times",                                    "bronze", "habits"),
  def("clean_meals_3", "🥦", "Eating Clean",   "Log 3 clean meals in a single week",                          "bronze", "habits"),
  def("clean_meals_7", "🥗", "Clean Week",     "Log 7 clean meals in a single week",                          "bronze", "habits"),

  // Medium volume
  def("workout_10",  "🏋️", "Iron Will",             "Complete 10 workout sessions",                          "bronze", "workout"),
  def("music_10",    "🎵",  "Practice Makes Perfect","Complete 10 music sessions",                             "bronze", "music"),
  def("reading_10",  "📚",  "Bookworm",              "Complete 10 reading sessions",                          "bronze", "reading"),
  def("yoga_5",      "🧘",  "Flexible Routine",      "Complete 5 yoga sessions",                              "bronze", "workout"),
  def("bouldering_5","🧗",  "Rock Hopper",           "Complete 5 bouldering sessions",                       "bronze", "workout"),
  def("cardio_10",   "🏃",  "Cardio Regular",        "Complete 10 cardio sessions",                           "bronze", "workout"),

  // Work intro
  def("work_10hrs",  "💼",  "First Crunch",     "Log 10 total hours of work",                                 "bronze"),
  def("work_25hrs",  "📋",  "Getting Serious",  "Log 25 total hours of work",                                 "bronze"),

  // Score intro
  def("score_500",   "⭐",  "Five Hundred",     "Score 500 pts in a single day",                              "bronze"),
  def("score_1000",  "⭐⭐", "Four Digits",      "Score 1,000 pts in a single day",                           "bronze"),

  // Special bronze
  def("clean_meals_14",  "🥗",  "Fortnight Clean",  "Log 14 clean meals in a single week",                   "bronze", "habits"),
  def("balance_first",   "⚖️",  "Balanced Day",     "Earn the Balance Bonus for the first time",             "bronze"),
  def("total_sessions_20","🎯", "Building Habits",  "Log 20 total activity sessions",                        "bronze"),

  // ── SILVER ──────────────────────────────────────────────────────────────────

  // Streaks
  def("streak_14", "⚡",   "Fortnight Force",     "14-day activity streak",                                   "silver"),
  def("streak_21", "⚡⚡",  "Three Weeks Strong",  "21-day activity streak",                                   "silver"),
  def("streak_30", "💎",   "Monthly Legend",      "30-day activity streak",                                   "silver"),

  // Ratings
  def("rating_a",  "🥈",  "A-Rank",  "Reach A rating in a single week",                                      "silver"),
  def("rating_s",  "🥇",  "S-Rank",  "Reach S rating in a single week",                                      "silver"),

  // Volume — workout
  def("workout_25",    "💪💪", "Regular Lifter",      "Complete 25 workout sessions",                         "silver", "workout"),
  def("yoga_15",       "🧘",   "Yoga Regular",        "Complete 15 yoga sessions",                            "silver", "workout"),
  def("bouldering_15", "🧗",   "Wall Regular",        "Complete 15 bouldering sessions",                     "silver", "workout"),
  def("cardio_20",     "🏃",   "Cardio Enthusiast",   "Complete 20 cardio sessions",                          "silver", "workout"),

  // Volume — other
  def("music_25",   "🎸",  "Committed Player", "Complete 25 music sessions",                                  "silver", "music"),
  def("reading_25", "📖",  "Regular Reader",   "Complete 25 reading sessions",                                "silver", "reading"),
  def("workout_50", "🦾",  "Grindset",         "Complete 50 workout sessions",                                "silver", "workout"),
  def("music_50",   "🎸🎸","Musician",          "Complete 50 music sessions",                                 "silver", "music"),
  def("reading_50", "📚📚","Avid Reader",       "Complete 50 reading sessions",                               "silver", "reading"),
  def("yoga_25",    "🧘🧘","Yoga Practitioner", "Complete 25 yoga sessions",                                  "silver", "workout"),
  def("bouldering_25","🧗🧗","Wall Enthusiast", "Complete 25 bouldering sessions",                           "silver", "workout"),
  def("cardio_35",  "🏃🏃","Endurance Builder", "Complete 35 cardio sessions",                                "silver", "workout"),

  // Habit mid-tier
  def("get_up_10",       "☀️",  "Early Bird Pro",  "Get up at 9 ten times",                                   "silver", "habits"),
  def("sleep_10",        "🌙",  "Sleep Disciplined","Hit sleep target 10 times",                              "silver", "habits"),
  def("get_up_20",       "☀️☀️","Morning Master",   "Get up at 9 twenty times",                              "silver", "habits"),
  def("sleep_20",        "🌙🌙","Sleep Champion",   "Hit sleep target 20 times",                              "silver", "habits"),
  def("clean_meals_50",  "🥗",  "Clean Eater",     "Log 50 clean meals total",                                "silver", "habits"),
  def("clean_meals_100", "🥦🥦","Clean Living",    "Log 100 clean meals total",                               "silver", "habits"),

  // Work silver
  def("work_100hrs", "💼",  "Century of Work",  "Log 100 total hours of work",                                "silver"),
  def("work_200hrs", "📊",  "Dedicated Worker", "Log 200 total hours of work",                                "silver"),
  def("work_300hrs", "💼💼","Work Veteran",      "Log 300 total hours of work",                               "silver"),

  // Score silver
  def("score_2000", "💫",   "Two Thousand",  "Score 2,000 pts in a single day",                               "silver"),
  def("score_3000", "💫💫", "Three Thousand","Score 3,000 pts in a single day",                               "silver"),

  // Special silver
  def("balance_master", "⚖️", "Balance Master", "Log all 5 categories in a single day",                      "silver"),
  def("perfect_week",   "🌟",  "Perfect Week",   "Log every day for 7 days straight",                         "silver"),

  // ── GOLD ────────────────────────────────────────────────────────────────────

  // Streaks
  def("streak_45", "💎💎",    "Six Week Streak",    "45-day activity streak",                                  "gold"),
  def("streak_60", "💎💎💎",  "Two Month Grind",    "60-day activity streak",                                  "gold"),
  def("streak_90", "💎💎💎💎","Quarter Year",       "90-day activity streak",                                  "gold"),

  // Rating gold
  def("rating_ss",   "🏆",   "SS-Rank",     "Reach SS rating in a single week",                               "gold"),
  def("rating_ss_3", "🏆🏆", "SS Regular",  "Reach SS rating in 3 or more separate weeks",                   "gold"),

  // Volume gold — workout
  def("workout_100",   "🦾🦾",    "Century Lifter",    "Complete 100 workout sessions",                       "gold", "workout"),
  def("workout_150",   "💪💪💪",  "Iron Devotee",      "Complete 150 workout sessions",                       "gold", "workout"),
  def("yoga_50",       "🧘‍♂️",    "Yoga Devotee",      "Complete 50 yoga sessions",                           "gold", "workout"),
  def("yoga_75",       "🧘",      "Yoga Expert",       "Complete 75 yoga sessions",                           "gold", "workout"),
  def("yoga_100",      "🧘‍♀️",    "Yoga Master",       "Complete 100 yoga sessions",                          "gold", "workout"),
  def("bouldering_50", "🧗‍♂️",    "Rock Veteran",      "Complete 50 bouldering sessions",                    "gold", "workout"),
  def("cardio_50",     "🏃‍♂️",    "Distance Runner",   "Complete 50 cardio sessions",                         "gold", "workout"),

  // Volume gold — other
  def("music_75",   "🎵🎵",  "Daily Musician",    "Complete 75 music sessions",                               "gold", "music"),
  def("music_100",  "🎼",    "Virtuoso",          "Complete 100 music sessions",                              "gold", "music"),
  def("reading_75", "📖",    "Voracious Reader",  "Complete 75 reading sessions",                             "gold", "reading"),
  def("reading_100","📚📖",  "Scholar",           "Complete 100 reading sessions",                            "gold", "reading"),

  // Habit gold
  def("get_up_50",      "🌞",  "Sunrise Devotee",  "Get up at 9 fifty times",                                 "gold", "habits"),
  def("sleep_50",       "🌜",  "Sleep Architect",  "Hit sleep target 50 times",                               "gold", "habits"),
  def("clean_meals_200","🥗🥗","Clean Lifestyle",  "Log 200 clean meals total",                               "gold", "habits"),

  // Work gold
  def("work_500hrs", "💻",  "Half a Thousand Hours", "Log 500 total hours of work",                           "gold"),
  def("work_750hrs", "🖥️",  "Work Obsessed",         "Log 750 total hours of work",                          "gold"),

  // Score gold
  def("score_5000", "🌠", "Five Thousand", "Score 5,000 pts in a single day",                                 "gold"),

  // ── PLATINUM ────────────────────────────────────────────────────────────────

  def("rating_sss",   "👑",   "SSS-Rank",          "Reach SSS rating in a single week",                      "platinum"),
  def("rating_sss_3", "👑👑", "SSS Regular",       "Reach SSS rating in 3 or more separate weeks",           "platinum"),
  def("streak_100",   "🔱",   "Century Streak",    "100-day activity streak",                                 "platinum"),
  def("streak_365",   "⚜️",   "Year of Dedication","365-day activity streak",                                 "platinum"),
  def("workout_200",  "🏆",   "Iron Legend",       "Complete 200 workout sessions",                           "platinum", "workout"),
  def("music_200",    "🎸👑", "Guitar Legend",     "Complete 200 music sessions",                             "platinum", "music"),
  def("work_1000hrs", "💻👑", "One Thousand Hours","Log 1,000 total hours of work",                           "platinum"),
  def("clean_meals_500","🥗👑","Clean Machine",    "Log 500 clean meals total",                               "platinum", "habits"),
];

// ─── Helper functions ─────────────────────────────────────────────────────────

function countActivity(entries: LogEntry[], activityId: string): number {
  return entries.filter((e) => e.activityId === activityId).length;
}

function countCategory(entries: LogEntry[], category: string): number {
  return entries.filter((e) => e.category === category && e.duration > 0).length;
}

function countDurationSessions(entries: LogEntry[]): number {
  return entries.filter((e) => e.duration > 0).length;
}

function totalWorkHours(entries: LogEntry[]): number {
  return entries.filter((e) => e.category === "work").reduce((s, e) => s + e.duration, 0) / 60;
}

function totalCleanMeals(entries: LogEntry[]): number {
  return entries.filter((e) => e.activityId === "meal" && e.mealType === "clean").length;
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
  const weeks = new Set(dates.map((d) => getWeekStart(d)));
  let best = "D";
  const order = ["D", "C", "B", "A", "S", "SS", "SSS"];
  for (const ws of weeks) {
    const r = computeWeeklyRating(entries, ws).rating;
    if (order.indexOf(r) > order.indexOf(best)) best = r;
  }
  return best;
}

function weeksReachedRating(entries: LogEntry[], targetRating: string): number {
  if (entries.length === 0) return 0;
  const dates = [...new Set(entries.map((e) => e.date))];
  const weeks = new Set(dates.map((d) => getWeekStart(d)));
  const order = ["D", "C", "B", "A", "S", "SS", "SSS"];
  let count = 0;
  for (const ws of weeks) {
    const r = computeWeeklyRating(entries, ws).rating;
    if (order.indexOf(r) >= order.indexOf(targetRating)) count++;
  }
  return count;
}

function maxDailyScore(entries: LogEntry[]): number {
  if (entries.length === 0) return 0;
  const dates = [...new Set(entries.map((e) => e.date))];
  const scores = computeScores(entries, dates);
  return Math.max(0, ...scores.map((s) => s.totalScore));
}

function hasEarnedBalanceBonus(entries: LogEntry[]): boolean {
  if (entries.length === 0) return false;
  const dates = [...new Set(entries.map((e) => e.date))];
  return computeScores(entries, dates).some((s) => s.hasBalanceBonus);
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
  const maxScore = maxDailyScore(entries);
  const allWorkHours = totalWorkHours(entries);
  const allCleanMeals = totalCleanMeals(entries);
  const totalSessions = countDurationSessions(entries);

  function check(id: string, condition: boolean): string | undefined {
    if (!condition) return undefined;
    return previouslyUnlocked.get(id) ?? now;
  }

  const ri = (r: string) => ratingOrder.indexOf(r);

  const unlockedAt: Record<string, string | undefined> = {
    // ── BRONZE ──────────────────────────────────────────────────────────────
    first_workout:          check("first_workout",          entries.some((e) => e.category === "workout")),
    first_bouldering:       check("first_bouldering",       countActivity(entries, "bouldering") >= 1),
    first_cardio:           check("first_cardio",           countActivity(entries, "cardio") >= 1),
    first_yoga:             check("first_yoga",             countActivity(entries, "yoga") >= 1),
    first_electric_guitar:  check("first_electric_guitar",  countActivity(entries, "electric_guitar") >= 1),
    first_classical_guitar: check("first_classical_guitar", countActivity(entries, "classical_guitar") >= 1),
    first_reading:          check("first_reading",          entries.some((e) => e.category === "reading")),
    first_work:             check("first_work",             entries.some((e) => e.category === "work")),
    first_get_up:           check("first_get_up",           countActivity(entries, "get_up") >= 1),
    first_sleep:            check("first_sleep",            countActivity(entries, "sleep") >= 1),
    first_clean_meal:       check("first_clean_meal",       entries.some((e) => e.activityId === "meal" && e.mealType === "clean")),

    streak_3:               check("streak_3",               maxStreak >= 3),
    streak_7:               check("streak_7",               maxStreak >= 7),

    rating_c:               check("rating_c",               ri(bestRating) >= ri("C")),
    rating_b:               check("rating_b",               ri(bestRating) >= ri("B")),

    workout_5:              check("workout_5",              countCategory(entries, "workout") >= 5),
    yoga_3:                 check("yoga_3",                 countActivity(entries, "yoga") >= 3),
    bouldering_3:           check("bouldering_3",           countActivity(entries, "bouldering") >= 3),
    cardio_5:               check("cardio_5",               countActivity(entries, "cardio") >= 5),
    music_5:                check("music_5",                countCategory(entries, "music") >= 5),
    reading_5:              check("reading_5",              countCategory(entries, "reading") >= 5),

    get_up_3:               check("get_up_3",               countActivity(entries, "get_up") >= 3),
    sleep_3:                check("sleep_3",                countActivity(entries, "sleep") >= 3),
    get_up_5:               check("get_up_5",               countActivity(entries, "get_up") >= 5),
    sleep_5:                check("sleep_5",                countActivity(entries, "sleep") >= 5),
    clean_meals_3:          check("clean_meals_3",          cleanMealsWeek >= 3),
    clean_meals_7:          check("clean_meals_7",          cleanMealsWeek >= 7),

    workout_10:             check("workout_10",             countCategory(entries, "workout") >= 10),
    music_10:               check("music_10",               countCategory(entries, "music") >= 10),
    reading_10:             check("reading_10",             countCategory(entries, "reading") >= 10),
    yoga_5:                 check("yoga_5",                 countActivity(entries, "yoga") >= 5),
    bouldering_5:           check("bouldering_5",           countActivity(entries, "bouldering") >= 5),
    cardio_10:              check("cardio_10",              countActivity(entries, "cardio") >= 10),

    work_10hrs:             check("work_10hrs",             allWorkHours >= 10),
    work_25hrs:             check("work_25hrs",             allWorkHours >= 25),

    score_500:              check("score_500",              maxScore >= 500),
    score_1000:             check("score_1000",             maxScore >= 1000),

    clean_meals_14:         check("clean_meals_14",         cleanMealsWeek >= 14),
    balance_first:          check("balance_first",          hasEarnedBalanceBonus(entries)),
    total_sessions_20:      check("total_sessions_20",      totalSessions >= 20),

    // ── SILVER ──────────────────────────────────────────────────────────────
    streak_14:              check("streak_14",              maxStreak >= 14),
    streak_21:              check("streak_21",              maxStreak >= 21),
    streak_30:              check("streak_30",              maxStreak >= 30),

    rating_a:               check("rating_a",               ri(bestRating) >= ri("A")),
    rating_s:               check("rating_s",               ri(bestRating) >= ri("S")),

    workout_25:             check("workout_25",             countCategory(entries, "workout") >= 25),
    yoga_15:                check("yoga_15",                countActivity(entries, "yoga") >= 15),
    bouldering_15:          check("bouldering_15",          countActivity(entries, "bouldering") >= 15),
    cardio_20:              check("cardio_20",              countActivity(entries, "cardio") >= 20),
    music_25:               check("music_25",               countCategory(entries, "music") >= 25),
    reading_25:             check("reading_25",             countCategory(entries, "reading") >= 25),
    workout_50:             check("workout_50",             countCategory(entries, "workout") >= 50),
    music_50:               check("music_50",               countCategory(entries, "music") >= 50),
    reading_50:             check("reading_50",             countCategory(entries, "reading") >= 50),
    yoga_25:                check("yoga_25",                countActivity(entries, "yoga") >= 25),
    bouldering_25:          check("bouldering_25",          countActivity(entries, "bouldering") >= 25),
    cardio_35:              check("cardio_35",              countActivity(entries, "cardio") >= 35),

    get_up_10:              check("get_up_10",              countActivity(entries, "get_up") >= 10),
    sleep_10:               check("sleep_10",               countActivity(entries, "sleep") >= 10),
    get_up_20:              check("get_up_20",              countActivity(entries, "get_up") >= 20),
    sleep_20:               check("sleep_20",               countActivity(entries, "sleep") >= 20),
    clean_meals_50:         check("clean_meals_50",         allCleanMeals >= 50),
    clean_meals_100:        check("clean_meals_100",        allCleanMeals >= 100),

    work_100hrs:            check("work_100hrs",            allWorkHours >= 100),
    work_200hrs:            check("work_200hrs",            allWorkHours >= 200),
    work_300hrs:            check("work_300hrs",            allWorkHours >= 300),

    score_2000:             check("score_2000",             maxScore >= 2000),
    score_3000:             check("score_3000",             maxScore >= 3000),

    balance_master:         check("balance_master",         allCategoriesInADay(entries)),
    perfect_week:           check("perfect_week",           loggedEvery7Days(entries)),

    // ── GOLD ────────────────────────────────────────────────────────────────
    streak_45:              check("streak_45",              maxStreak >= 45),
    streak_60:              check("streak_60",              maxStreak >= 60),
    streak_90:              check("streak_90",              maxStreak >= 90),

    rating_ss:              check("rating_ss",              ri(bestRating) >= ri("SS")),
    rating_ss_3:            check("rating_ss_3",            weeksReachedRating(entries, "SS") >= 3),

    workout_100:            check("workout_100",            countCategory(entries, "workout") >= 100),
    workout_150:            check("workout_150",            countCategory(entries, "workout") >= 150),
    yoga_50:                check("yoga_50",                countActivity(entries, "yoga") >= 50),
    yoga_75:                check("yoga_75",                countActivity(entries, "yoga") >= 75),
    yoga_100:               check("yoga_100",               countActivity(entries, "yoga") >= 100),
    bouldering_50:          check("bouldering_50",          countActivity(entries, "bouldering") >= 50),
    cardio_50:              check("cardio_50",              countActivity(entries, "cardio") >= 50),

    music_75:               check("music_75",               countCategory(entries, "music") >= 75),
    music_100:              check("music_100",              countCategory(entries, "music") >= 100),
    reading_75:             check("reading_75",             countCategory(entries, "reading") >= 75),
    reading_100:            check("reading_100",            countCategory(entries, "reading") >= 100),

    get_up_50:              check("get_up_50",              countActivity(entries, "get_up") >= 50),
    sleep_50:               check("sleep_50",               countActivity(entries, "sleep") >= 50),
    clean_meals_200:        check("clean_meals_200",        allCleanMeals >= 200),

    work_500hrs:            check("work_500hrs",            allWorkHours >= 500),
    work_750hrs:            check("work_750hrs",            allWorkHours >= 750),

    score_5000:             check("score_5000",             maxScore >= 5000),

    // ── PLATINUM ────────────────────────────────────────────────────────────
    rating_sss:             check("rating_sss",             ri(bestRating) >= ri("SSS")),
    rating_sss_3:           check("rating_sss_3",           weeksReachedRating(entries, "SSS") >= 3),
    streak_100:             check("streak_100",             maxStreak >= 100),
    streak_365:             check("streak_365",             maxStreak >= 365),
    workout_200:            check("workout_200",            countCategory(entries, "workout") >= 200),
    music_200:              check("music_200",              countCategory(entries, "music") >= 200),
    work_1000hrs:           check("work_1000hrs",           allWorkHours >= 1000),
    clean_meals_500:        check("clean_meals_500",        allCleanMeals >= 500),
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
