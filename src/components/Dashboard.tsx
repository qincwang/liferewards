import { View, Text } from "react-native";
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
    <View className="gap-y-4">
      <DailyPassage />

      <WeeklyRatingCard weeklyRating={weeklyRating} />

      {/* Today's total */}
      <View className="bg-indigo-600 rounded-2xl p-6 shadow-lg">
        <Text className="text-sm text-white opacity-80 mb-1">Today's Score</Text>
        <Text className="text-5xl font-bold text-white mb-2">{todayScore.totalScore}</Text>
        {todayScore.hasBalanceBonus && (
          <View className="bg-white/20 self-start px-3 py-1 rounded-full mb-2">
            <Text className="text-sm text-white">+50 Balance Bonus!</Text>
          </View>
        )}
        <Text className="text-sm text-white opacity-90">{getMotivation(todayScore.totalScore)}</Text>
      </View>

      {/* Per-category scores — top 3 */}
      <View className="flex-row gap-3">
        {(["workout", "work", "reading"] as const).map((cat) => (
          <View key={cat} className="flex-1">
            <ScoreCard
              category={cat}
              score={todayScore.categoryScores[cat]}
              streak={todayScore.streaks[cat]}
            />
          </View>
        ))}
      </View>

      {/* Music + Habits */}
      <View className="flex-row gap-3">
        {(["music", "habits"] as const).map((cat) => (
          <View key={cat} className="flex-1">
            <ScoreCard
              category={cat}
              score={todayScore.categoryScores[cat]}
              streak={todayScore.streaks[cat]}
            />
          </View>
        ))}
      </View>

      {/* Weekly chart */}
      <View className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <Text className="text-sm font-semibold text-gray-600 mb-4">Last 7 Days</Text>
        <View className="flex-row items-end justify-between gap-2" style={{ height: 128 }}>
          {weekScores.map((score) => {
            const height = maxWeekScore > 0 ? (score.totalScore / maxWeekScore) * 100 : 0;
            const isToday = score.date === today;
            const barHeight = Math.max((height / 100) * 96, 4);
            const dayOfWeek = new Date(score.date + "T00:00:00").getDay();
            const dayLabel = WEEKDAYS[dayOfWeek === 0 ? 6 : dayOfWeek - 1];

            return (
              <View key={score.date} className="flex-1 items-center gap-1">
                <Text className="text-xs text-gray-500 font-medium">
                  {score.totalScore > 0 ? score.totalScore : ""}
                </Text>
                <View className="flex-1 w-full justify-end">
                  <View
                    className={`w-full rounded-t-md ${isToday ? "bg-indigo-500" : "bg-indigo-200"}`}
                    style={{ height: barHeight }}
                  />
                </View>
                <Text className={`text-xs ${isToday ? "font-bold text-indigo-600" : "text-gray-400"}`}>
                  {dayLabel}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
