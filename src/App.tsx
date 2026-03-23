import { useState } from "react";
import { useLifeData } from "./hooks/useLifeData";
import { useTheme } from "./hooks/useTheme";
import type { ThemeMode } from "./hooks/useTheme";
import Dashboard from "./components/Dashboard";
import LogForm from "./components/LogForm";
import ActivityHistory from "./components/ActivityHistory";
import AchievementsView from "./components/AchievementsView";
import CalendarView from "./components/CalendarView";
import StatsView from "./components/StatsView";
import Toast from "./components/Toast";
import { getToday, getWeekStart } from "./engine/scoring";

type Tab = "dashboard" | "history" | "achievements" | "calendar" | "stats";

function App() {
  const {
    entries,
    logActivity,
    removeEntry,
    editEntry,
    achievements,
    newAchievements,
    dismissNewAchievements,
  } = useLifeData();
  const [tab, setTab] = useState<Tab>("dashboard");
  const { mode, cycle } = useTheme();

  // Count heavy meals logged this week (for warning in LogForm)
  const today = getToday();
  const weekStart = getWeekStart(today);
  const weekHeavyMeals = entries.filter(
    (e) => e.activityId === "meal" && e.mealType === "heavy" && e.date >= weekStart
  ).length;

  const unlockedCount = achievements.filter((a) => !!a.unlockedAt).length;

  const THEME_ICONS: Record<ThemeMode, string> = { auto: "⚙️", light: "☀️", dark: "🌙" };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">
              <span className="text-indigo-600">Life</span>Rewards
            </h1>
            <button
              onClick={cycle}
              title={`Theme: ${mode}`}
              className="text-sm p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
            >
              {THEME_ICONS[mode]}
            </button>
          </div>
          <nav className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setTab("dashboard")}
              className={`px-3 py-1 text-sm rounded-md transition-all ${
                tab === "dashboard"
                  ? "bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 shadow-sm font-medium"
                  : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setTab("history")}
              className={`px-3 py-1 text-sm rounded-md transition-all ${
                tab === "history"
                  ? "bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 shadow-sm font-medium"
                  : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              History
            </button>
            <button
              onClick={() => setTab("calendar")}
              className={`px-3 py-1 text-sm rounded-md transition-all ${
                tab === "calendar"
                  ? "bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 shadow-sm font-medium"
                  : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              📅
            </button>
            <button
              onClick={() => setTab("achievements")}
              className={`px-3 py-1 text-sm rounded-md transition-all relative ${
                tab === "achievements"
                  ? "bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 shadow-sm font-medium"
                  : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              🏆
              {unlockedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {unlockedCount > 9 ? "9+" : unlockedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab("stats")}
              className={`px-3 py-1 text-sm rounded-md transition-all ${
                tab === "stats"
                  ? "bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 shadow-sm font-medium"
                  : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              📊
            </button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {tab !== "achievements" && tab !== "calendar" && tab !== "stats" && (
          <LogForm onLog={logActivity} weekHeavyMeals={weekHeavyMeals} />
        )}

        {tab === "dashboard" && <Dashboard entries={entries} />}
        {tab === "history" && (
          <ActivityHistory
            entries={entries}
            onDelete={removeEntry}
            onEdit={editEntry}
          />
        )}
        {tab === "calendar" && <CalendarView entries={entries} />}
        {tab === "achievements" && (
          <AchievementsView achievements={achievements} />
        )}
        {tab === "stats" && <StatsView entries={entries} />}
      </main>

      {/* Achievement unlock toast */}
      <Toast achievements={newAchievements} onDismiss={dismissNewAchievements} />
    </div>
  );
}

export default App;
