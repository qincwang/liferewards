import { useState } from "react";
import { useLifeData } from "./hooks/useLifeData";
import Dashboard from "./components/Dashboard";
import LogForm from "./components/LogForm";
import ActivityHistory from "./components/ActivityHistory";
import AchievementsView from "./components/AchievementsView";
import CalendarView from "./components/CalendarView";
import Toast from "./components/Toast";
import { getToday, getWeekStart } from "./engine/scoring";

type Tab = "dashboard" | "history" | "achievements" | "calendar";

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

  // Count heavy meals logged this week (for warning in LogForm)
  const today = getToday();
  const weekStart = getWeekStart(today);
  const weekHeavyMeals = entries.filter(
    (e) => e.activityId === "meal" && e.mealType === "heavy" && e.date >= weekStart
  ).length;

  const unlockedCount = achievements.filter((a) => !!a.unlockedAt).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">
            <span className="text-indigo-600">Life</span>Rewards
          </h1>
          <nav className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setTab("dashboard")}
              className={`px-3 py-1 text-sm rounded-md transition-all ${
                tab === "dashboard"
                  ? "bg-white text-gray-800 shadow-sm font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setTab("history")}
              className={`px-3 py-1 text-sm rounded-md transition-all ${
                tab === "history"
                  ? "bg-white text-gray-800 shadow-sm font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              History
            </button>
            <button
              onClick={() => setTab("calendar")}
              className={`px-3 py-1 text-sm rounded-md transition-all ${
                tab === "calendar"
                  ? "bg-white text-gray-800 shadow-sm font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📅
            </button>
            <button
              onClick={() => setTab("achievements")}
              className={`px-3 py-1 text-sm rounded-md transition-all relative ${
                tab === "achievements"
                  ? "bg-white text-gray-800 shadow-sm font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              🏆
              {unlockedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {unlockedCount > 9 ? "9+" : unlockedCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {tab !== "achievements" && tab !== "calendar" && (
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
      </main>

      {/* Achievement unlock toast */}
      <Toast achievements={newAchievements} onDismiss={dismissNewAchievements} />
    </div>
  );
}

export default App;
