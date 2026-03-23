import type { Category } from "../types";

export type ActivityType = "duration" | "habit";

export interface ActivityDefinition {
  id: string;
  label: string;
  category: Category;
  type: ActivityType;
  pointsPerMinute?: number;  // for duration-based
  flatPoints?: number;       // for one-shot habits
  isMeal?: boolean;          // meal special logic
}

export const ACTIVITIES: ActivityDefinition[] = [
  // --- Workout ---
  { id: "workout_general", label: "Workout",    category: "workout", type: "duration", pointsPerMinute: 3 },
  { id: "bouldering",      label: "Bouldering", category: "workout", type: "duration", pointsPerMinute: 3 },
  { id: "cardio",          label: "Cardio",     category: "workout", type: "duration", pointsPerMinute: 3 },
  { id: "yoga",            label: "Yoga",       category: "workout", type: "duration", pointsPerMinute: 3 },
  { id: "hiking",          label: "Hiking",     category: "workout", type: "duration", pointsPerMinute: 2 },

  // --- Work ---
  { id: "work_general",      label: "Work",     category: "work", type: "duration", pointsPerMinute: 1   },
  { id: "learning_general",  label: "Learning", category: "work", type: "duration", pointsPerMinute: 0.5 },

  // --- Reading ---
  { id: "reading_general", label: "Reading", category: "reading", type: "duration", pointsPerMinute: 1 },

  // --- Music ---
  { id: "electric_guitar",  label: "Electric Guitar Practice", category: "music", type: "duration", pointsPerMinute: 2   },
  { id: "classical_guitar", label: "Classical Guitar Practice",category: "music", type: "duration", pointsPerMinute: 2   },
  { id: "drum_practice",    label: "Drum Practice",            category: "music", type: "duration", pointsPerMinute: 1.5 },
  { id: "piano_practice",   label: "Piano Practice",           category: "music", type: "duration", pointsPerMinute: 1.5 },
  { id: "music_theory",     label: "Music Theory",             category: "music", type: "duration", pointsPerMinute: 1   },

  // --- Habits ---
  { id: "get_up",    label: "Get Up at 9", category: "habits", type: "habit", flatPoints: 30 },
  { id: "sleep",     label: "Sleep at 12:30", category: "habits", type: "habit", flatPoints: 20 },
  { id: "meal",      label: "Meal", category: "habits", type: "habit", isMeal: true },
];

export const ACTIVITIES_BY_ID = new Map(ACTIVITIES.map((a) => [a.id, a]));

export const ACTIVITIES_BY_CATEGORY = ACTIVITIES.reduce<Record<string, ActivityDefinition[]>>(
  (acc, a) => {
    (acc[a.category] ??= []).push(a);
    return acc;
  },
  {}
);

/** Points per meal type:
 *  clean  = +15
 *  regular = 0
 *  heavy  = 0 for 1st and 2nd that week, -20 from 3rd onward
 */
export const MEAL_CLEAN_PTS = 15;
export const MEAL_HEAVY_PENALTY = -20;
export const HEAVY_MEAL_FREE_LIMIT = 2;
