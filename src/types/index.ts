export type Category = "workout" | "work" | "reading" | "music" | "habits";
export type MealType = "clean" | "regular" | "heavy";
export type Rating = "D" | "C" | "B" | "A" | "S" | "SS" | "SSS";

export const CATEGORIES: Category[] = ["workout", "work", "reading", "music", "habits"];
export const CORE_CATEGORIES: Category[] = ["workout", "work", "reading"];

export const CATEGORY_LABELS: Record<Category, string> = {
  workout: "Workout",
  work: "Work",
  reading: "Reading",
  music: "Music",
  habits: "Habits",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  workout: "bg-orange-500",
  work: "bg-blue-500",
  reading: "bg-emerald-500",
  music: "bg-purple-500",
  habits: "bg-pink-500",
};

export const CATEGORY_ICONS: Record<Category, string> = {
  workout: "💪",
  work: "💻",
  reading: "📖",
  music: "🎸",
  habits: "🌟",
};

export interface LogEntry {
  id: string;
  category: Category;
  activityId?: string;  // links to ActivityDefinition.id
  date: string;         // ISO date "2026-03-23"
  duration: number;     // minutes (0 for habit entries)
  mealType?: MealType;  // only for meal habit entries
  note?: string;
  createdAt: string;    // ISO timestamp
}

export interface DailyScore {
  date: string;
  categoryScores: Record<Category, number>;
  totalScore: number;
  streaks: Record<Category, number>;
  hasBalanceBonus: boolean;
}

export type AchievementTier = "bronze" | "silver" | "gold" | "platinum";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: AchievementTier;
  category?: Category;
  unlockedAt?: string;  // ISO date, undefined = locked
}

export interface ConditionProgress {
  id: string;
  label: string;
  unit: string;
  current: number;
  required: number;
  met: boolean;
  displayCurrent: string;
  displayRequired: string;
}

export interface WeeklyRating {
  rating: Rating;
  weeklyTotal: number;
  nextRating: Rating | null;
  nextConditions: ConditionProgress[];
}
