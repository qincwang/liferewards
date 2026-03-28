import { useState } from "react";
import type { MealType } from "../types";
import { ACTIVITIES, ACTIVITIES_BY_CATEGORY } from "../engine/activities";
import type { ActivityDefinition } from "../engine/activities";

interface LogFormProps {
  onLog: (activityId: string, duration: number, mealType?: MealType, note?: string, date?: string) => void;
  weekHeavyMeals: number;
}

const DURATION_CATEGORIES = ["workout", "work", "reading", "music"] as const;

const CATEGORY_LABELS: Record<string, string> = {
  workout: "💪 Workout",
  work: "💻 Work",
  reading: "📖 Reading",
  music: "🎸 Music",
};

const QUICK_OPTIONS: { label: string; activityId: string; duration: number }[] = [
  { label: "30m Bouldering", activityId: "bouldering", duration: 30 },
  { label: "30m Cardio", activityId: "cardio", duration: 30 },
  { label: "4h Work", activityId: "work_general", duration: 240 },
  { label: "30m Guitar", activityId: "electric_guitar", duration: 30 },
  { label: "30m Reading", activityId: "reading_general", duration: 30 },
];

const MEAL_OPTIONS: { label: string; type: MealType; emoji: string; pts: string }[] = [
  { label: "Clean", type: "clean", emoji: "🥗", pts: "+15 pts" },
  { label: "Regular", type: "regular", emoji: "🍽️", pts: "0 pts" },
  { label: "Heavy", type: "heavy", emoji: "🍔", pts: "0 / -20 pts" },
];

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function LogForm({ onLog, weekHeavyMeals }: LogFormProps) {
  const [mode, setMode] = useState<"activity" | "habits">("activity");
  const [dayOffset, setDayOffset] = useState<"today" | "yesterday">("today");

  // Activity mode
  const [selectedCategory, setSelectedCategory] = useState("workout");
  const [selectedActivity, setSelectedActivity] = useState<ActivityDefinition>(
    ACTIVITIES.find((a) => a.id === "bouldering")!
  );
  const [duration, setDuration] = useState("");
  const [durationUnit, setDurationUnit] = useState<"min" | "hr">("min");
  const [note, setNote] = useState("");

  // Habit mode
  const [mealType, setMealType] = useState<MealType>("clean");

  const [successCount, setSuccessCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const logDate = dayOffset === "today" ? getToday() : getYesterday();

  function flashSuccess() {
    setSuccessCount((c) => c + 1);
    setShowSuccess(false);
    // Force re-render so the flash restarts even on rapid clicks
    requestAnimationFrame(() => setShowSuccess(true));
    setTimeout(() => setShowSuccess(false), 1500);
  }

  function handleActivitySubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = parseFloat(duration);
    if (!val || val <= 0) return;
    const mins = durationUnit === "hr" ? Math.round(val * 60) : Math.round(val);
    onLog(selectedActivity.id, mins, undefined, note || undefined, logDate);
    setDuration("");
    setNote("");
    flashSuccess();
  }

  function handleQuickLog(activityId: string, dur: number) {
    onLog(activityId, dur, undefined, undefined, logDate);
    flashSuccess();
  }

  function handleHabitLog(activityId: string, mType?: MealType) {
    onLog(activityId, 0, mType, undefined, logDate);
    flashSuccess();
  }

  function handleCategoryChange(cat: string) {
    setSelectedCategory(cat);
    const first = (ACTIVITIES_BY_CATEGORY[cat] ?? []).find((a) => a.type === "duration");
    if (first) setSelectedActivity(first);
  }

  const categoryActivities = (ACTIVITIES_BY_CATEGORY[selectedCategory] ?? []).filter(
    (a) => a.type === "duration"
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
      {/* Header row: title + day toggle + mode toggle */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-lg p-1 shrink-0">
          <button
            onClick={() => setDayOffset("today")}
            className={`px-2.5 py-1 text-xs rounded-md transition-all ${
              dayOffset === "today"
                ? "bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 shadow-sm font-medium"
                : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDayOffset("yesterday")}
            className={`px-2.5 py-1 text-xs rounded-md transition-all ${
              dayOffset === "yesterday"
                ? "bg-white dark:bg-slate-700 text-amber-700 shadow-sm font-medium"
                : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Yesterday
          </button>
        </div>

        <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-lg p-1 shrink-0">
          <button
            onClick={() => setMode("activity")}
            className={`px-2.5 py-1 text-xs rounded-md transition-all ${
              mode === "activity"
                ? "bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 shadow-sm font-medium"
                : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Activity
          </button>
          <button
            onClick={() => setMode("habits")}
            className={`px-2.5 py-1 text-xs rounded-md transition-all ${
              mode === "habits"
                ? "bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 shadow-sm font-medium"
                : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            🌟 Habits
          </button>
        </div>
      </div>

      {dayOffset === "yesterday" && (
        <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-1.5 mb-3">
          Logging for yesterday
        </div>
      )}

      {mode === "activity" ? (
        <>
          {/* Quick log */}
          <div className="flex flex-wrap gap-2 mb-5">
            {QUICK_OPTIONS.map((opt) => (
              <button
                key={opt.activityId + opt.duration}
                onClick={() => handleQuickLog(opt.activityId, opt.duration)}
                className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 dark:text-slate-300 transition-colors"
              >
                {opt.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleActivitySubmit} className="space-y-4">
            {/* Category picker */}
            <div className="grid grid-cols-4 gap-1.5">
              {DURATION_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            {/* Activity picker */}
            {categoryActivities.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {categoryActivities.map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setSelectedActivity(act)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                      selectedActivity.id === act.id
                        ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 font-medium"
                        : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            )}

            {/* Duration + note */}
            <div className="flex gap-3">
              <div className="flex-1 flex gap-1.5">
                <input
                  type="number"
                  placeholder={durationUnit === "hr" ? "Hours" : "Minutes"}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min={durationUnit === "hr" ? "0.5" : "1"}
                  step={durationUnit === "hr" ? "0.5" : "1"}
                  max={durationUnit === "hr" ? "12" : "480"}
                  className="flex-1 min-w-0 px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => { setDurationUnit(durationUnit === "min" ? "hr" : "min"); setDuration(""); }}
                  className="px-2.5 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors shrink-0"
                >
                  {durationUnit === "min" ? "min" : "hr"}
                </button>
              </div>
              <input
                type="text"
                placeholder="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="flex-2 px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              {showSuccess ? `✓ Logged! (${successCount})` : `Log ${selectedActivity.label}`}
            </button>
          </form>
        </>
      ) : (
        <div className="space-y-4">
          {/* Wake / Sleep */}
          <div className="flex gap-2">
            <button
              onClick={() => handleHabitLog("get_up")}
              className="flex-1 py-3 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl text-sm font-medium text-amber-800 dark:text-amber-400 transition-colors"
            >
              🌅 Got Up at 9
              <span className="block text-xs text-amber-600 mt-0.5">+30 pts</span>
            </button>
            <button
              onClick={() => handleHabitLog("sleep")}
              className="flex-1 py-3 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-100/5 border border-indigo-200 dark:border-indigo-800 rounded-xl text-sm font-medium text-indigo-800 dark:text-indigo-400 transition-colors"
            >
              🌙 Sleep at 12:30
              <span className="block text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">+20 pts</span>
            </button>
          </div>

          {/* Meals */}
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-slate-300 mb-2">Log a Meal</p>
            <div className="flex gap-2 mb-3">
              {MEAL_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => setMealType(opt.type)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    mealType === opt.type
                      ? opt.type === "clean"
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : opt.type === "heavy"
                        ? "bg-red-500 border-red-500 text-white"
                        : "bg-gray-500 border-gray-500 text-white"
                      : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <span className="block text-base">{opt.emoji}</span>
                  {opt.label}
                  <span className="block text-xs mt-0.5 opacity-80">{opt.pts}</span>
                </button>
              ))}
            </div>

            {mealType === "heavy" && weekHeavyMeals >= 2 && (
              <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 mb-3">
                ⚠️ This is your {weekHeavyMeals + 1}{weekHeavyMeals + 1 === 3 ? "rd" : "th"} heavy meal this week — penalty applies (-20 pts)
              </div>
            )}

            <button
              onClick={() => handleHabitLog("meal", mealType)}
              className="w-full py-2.5 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors"
            >
              {showSuccess ? `✓ Logged! (${successCount})` : "Log Meal"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
