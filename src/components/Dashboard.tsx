import type { LogEntry } from "../types";
import {
  computeDailyScore,
  computeScores,
  computeWeeklyRating,
  getLastNDates,
  getToday,
} from "../engine/scoring";
import ScoreCard from "./ScoreCard";
import WeeklyRatingCard from "./WeeklyRatingCard";
import DailyPassage from "./DailyPassage";
import DailyTasks from "./DailyTasks";

interface DashboardProps {
  entries: LogEntry[];
}

function getMotivation(score: number): string {
  if (score === 0) return "Start your day! Log your first activity.";
  if (score < 100) return "Good start! Keep the momentum going.";
  if (score < 200) return "Nice progress! You're building something.";
  if (score < 400) return "Great day! You're on fire!";
  return "Outstanding! Peak performance today!";
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Dashboard({ entries }: DashboardProps) {
  const today = getToday();
  const todayScore = computeDailyScore(
    entries.filter((e) => e.date === today),
    today,
    entries
  );

  const last7 = getLastNDates(7);
  const weekScores = computeScores(entries, last7);
  const maxWeekScore = Math.max(...weekScores.map((s) => s.totalScore), 1);
  const weeklyRating = computeWeeklyRating(entries);

  return (
    <div className="space-y-4">
      {/* Daily classic passage */}
      <DailyPassage />

      {/* Daily Tasks */}
      <DailyTasks />

      {/* Weekly Rating */}
      <WeeklyRatingCard weeklyRating={weeklyRating} />

      {/* Today's total */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="text-sm opacity-80 mb-1">Today's Score</div>
        <div className="text-5xl font-bold mb-2">{todayScore.totalScore}</div>
        {todayScore.hasBalanceBonus && (
          <div className="text-sm bg-white/20 inline-block px-3 py-1 rounded-full mb-2">
            +50 Balance Bonus!
          </div>
        )}
        <div className="text-sm opacity-90">{getMotivation(todayScore.totalScore)}</div>
      </div>

      {/* Per-category scores — top 3 */}
      <div className="grid grid-cols-3 gap-3">
        {(["workout", "work", "reading"] as const).map((cat) => (
          <ScoreCard
            key={cat}
            category={cat}
            score={todayScore.categoryScores[cat]}
            streak={todayScore.streaks[cat]}
          />
        ))}
      </div>

      {/* Music + Habits */}
      <div className="grid grid-cols-2 gap-3">
        {(["music", "habits"] as const).map((cat) => (
          <ScoreCard
            key={cat}
            category={cat}
            score={todayScore.categoryScores[cat]}
            streak={todayScore.streaks[cat]}
          />
        ))}
      </div>

      {/* Weekly chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-slate-400 mb-4">Last 7 Days</h3>
        <div className="flex items-end justify-between gap-2 h-32">
          {weekScores.map((score) => {
            const height = maxWeekScore > 0 ? (score.totalScore / maxWeekScore) * 100 : 0;
            const isToday = score.date === today;
            return (
              <div key={score.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500 dark:text-slate-500 font-medium">
                  {score.totalScore > 0 ? score.totalScore : ""}
                </span>
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${
                    isToday ? "bg-indigo-500" : "bg-indigo-200 dark:bg-indigo-800"
                  }`}
                  style={{ height: `${Math.max(height, 4)}%` }}
                />
                <span className={`text-xs ${isToday ? "font-bold text-indigo-600" : "text-gray-400 dark:text-slate-500"}`}>
                  {WEEKDAYS[new Date(score.date + "T00:00:00").getDay() === 0 ? 6 : new Date(score.date + "T00:00:00").getDay() - 1]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
