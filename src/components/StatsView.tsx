import { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import type { LogEntry, Rating } from "../types";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "../types";
import { computeScores, computeWeeklyRating, getWeekStart } from "../engine/scoring";
import { ACTIVITIES_BY_ID } from "../engine/activities";
import type { BookLog } from "../store/books";
import type { PieceLog, PieceInstrument } from "../store/pieces";

const PIECE_INSTRUMENT_LABEL: Record<PieceInstrument, string> = {
  electric_guitar:  "🎸 Electric",
  classical_guitar: "🎼 Classical",
  drums:            "🥁 Drums",
  piano:            "🎹 Piano",
  other:            "🎵 Other",
};

interface StatsViewProps {
  entries: LogEntry[];
  books: BookLog[];
  pieces: PieceLog[];
}

const DURATION_CATEGORIES = ["workout", "work", "reading", "music"] as const;

const RATING_ORDER: Rating[] = ["D", "C", "B", "A", "S", "SS", "SSS"];

const RATING_COLORS: Record<Rating, { bg: string; text: string }> = {
  D:   { bg: "bg-gray-200",   text: "text-gray-500"   },
  C:   { bg: "bg-green-200",  text: "text-green-700"  },
  B:   { bg: "bg-blue-200",   text: "text-blue-700"   },
  A:   { bg: "bg-purple-200", text: "text-purple-700" },
  S:   { bg: "bg-amber-200",  text: "text-amber-700"  },
  SS:  { bg: "bg-orange-200", text: "text-orange-700" },
  SSS: { bg: "bg-yellow-200", text: "text-yellow-700" },
};

function fmtDuration(minutes: number): string {
  if (minutes === 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function maxConsecutiveDays(entries: LogEntry[]): number {
  if (entries.length === 0) return 0;
  const dates = [...new Set(entries.map((e) => e.date))].sort();
  let max = 1, cur = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff =
      (new Date(dates[i] + "T00:00:00").getTime() -
        new Date(dates[i - 1] + "T00:00:00").getTime()) /
      86400000;
    cur = diff === 1 ? cur + 1 : 1;
    if (cur > max) max = cur;
  }
  return max;
}

export default function StatsView({ entries, books, pieces }: StatsViewProps) {
  const years = useMemo(() => {
    const ys = [...new Set(entries.map((e) => e.date.slice(0, 4)))].sort().reverse();
    return ys;
  }, [entries]);

  const [year, setYear] = useState<string>("all");

  const filtered = useMemo(
    () => (year === "all" ? entries : entries.filter((e) => e.date.startsWith(year))),
    [entries, year]
  );

  const stats = useMemo(() => {
    const daysLogged = new Set(filtered.map((e) => e.date)).size;
    const streak = maxConsecutiveDays(filtered);
    const filteredDates = [...new Set(filtered.map((e) => e.date))];
    const scores = computeScores(entries, filteredDates);
    const totalPoints = scores.reduce((s, d) => s + d.totalScore, 0);
    const bestDayScore = Math.max(0, ...scores.map((d) => d.totalScore));
    const bestDay = scores.find((d) => d.totalScore === bestDayScore)?.date ?? null;
    return { daysLogged, streak, totalPoints, bestDayScore, bestDay };
  }, [entries, filtered]);

  const categoryStats = useMemo(() => {
    return DURATION_CATEGORIES.map((cat) => {
      const catEntries = filtered.filter((e) => e.category === cat && e.duration > 0);
      const sessions = catEntries.length;
      const totalMins = catEntries.reduce((s, e) => s + e.duration, 0);
      const activityCounts = new Map<string, { label: string; count: number; mins: number }>();
      for (const e of catEntries) {
        const id = e.activityId ?? cat;
        const label = (e.activityId ? ACTIVITIES_BY_ID.get(e.activityId)?.label : null) ?? CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS];
        const existing = activityCounts.get(id) ?? { label, count: 0, mins: 0 };
        activityCounts.set(id, { label, count: existing.count + 1, mins: existing.mins + e.duration });
      }
      const activities = [...activityCounts.values()].sort((a, b) => b.count - a.count);
      return { cat, sessions, totalMins, activities };
    });
  }, [filtered]);

  const habitStats = useMemo(() => {
    const getUp   = filtered.filter((e) => e.activityId === "get_up").length;
    const sleep   = filtered.filter((e) => e.activityId === "sleep").length;
    const clean   = filtered.filter((e) => e.activityId === "meal" && e.mealType === "clean").length;
    const regular = filtered.filter((e) => e.activityId === "meal" && e.mealType === "regular").length;
    const heavy   = filtered.filter((e) => e.activityId === "meal" && e.mealType === "heavy").length;
    return { getUp, sleep, clean, regular, heavy };
  }, [filtered]);

  const bookStats = useMemo(() => {
    const fb = year === "all" ? books : books.filter((b) => b.finishedDate.startsWith(year));
    return {
      total: fb.length,
      easy:   fb.filter((b) => b.effort === "easy").length,
      medium: fb.filter((b) => b.effort === "medium").length,
      high:   fb.filter((b) => b.effort === "high").length,
    };
  }, [books, year]);

  const pieceStats = useMemo(() => {
    const fp = year === "all" ? pieces : pieces.filter((p) => p.masteredDate.startsWith(year));
    const byInstrument = (["electric_guitar", "classical_guitar", "drums", "piano", "other"] as PieceLog["instrument"][])
      .map((inst) => ({ inst, count: fp.filter((p) => p.instrument === inst).length }))
      .filter((x) => x.count > 0);
    return {
      total: fp.length,
      beginner:     fp.filter((p) => p.difficulty === "beginner").length,
      intermediate: fp.filter((p) => p.difficulty === "intermediate").length,
      advanced:     fp.filter((p) => p.difficulty === "advanced").length,
      byInstrument,
    };
  }, [pieces, year]);

  const ratingDist = useMemo(() => {
    const dist = Object.fromEntries(RATING_ORDER.map((r) => [r, 0])) as Record<Rating, number>;
    if (filtered.length === 0) return dist;
    const weeks = new Set(filtered.map((e) => getWeekStart(e.date)));
    for (const ws of weeks) {
      const r = computeWeeklyRating(entries, ws).rating;
      dist[r]++;
    }
    return dist;
  }, [entries, filtered]);

  const totalWeeks = Object.values(ratingDist).reduce((s, n) => s + n, 0);
  const hasAnyData = entries.length > 0 || books.length > 0 || pieces.length > 0;

  return (
    <View className="gap-y-4">
      {/* Header + year filter */}
      <View className="bg-indigo-600 rounded-2xl p-5 shadow-lg">
        <Text className="text-sm text-white opacity-80 mb-1">Total Stats</Text>
        {hasAnyData ? (
          <>
            <Text className="text-3xl font-bold text-white">{stats.totalPoints.toLocaleString()} pts</Text>
            <Text className="text-sm text-white/70 mt-0.5">{stats.daysLogged} days logged · {stats.streak}-day best streak</Text>
          </>
        ) : (
          <Text className="text-lg font-semibold text-white/90">No data yet — start logging!</Text>
        )}

        {years.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setYear("all")}
                className={`px-3 py-1 rounded-full border ${year === "all" ? "bg-white border-white" : "bg-white/20 border-white/40"}`}
              >
                <Text className={`text-xs ${year === "all" ? "text-indigo-700 font-semibold" : "text-white"}`}>All time</Text>
              </TouchableOpacity>
              {years.map((y) => (
                <TouchableOpacity
                  key={y}
                  onPress={() => setYear(y)}
                  className={`px-3 py-1 rounded-full border ${year === y ? "bg-white border-white" : "bg-white/20 border-white/40"}`}
                >
                  <Text className={`text-xs ${year === y ? "text-indigo-700 font-semibold" : "text-white"}`}>{y}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Summary cards */}
      <View className="flex-row flex-wrap gap-3">
        {[
          { label: "Days Logged",   value: stats.daysLogged.toString(),                  sub: "unique days" },
          { label: "Total Points",  value: stats.totalPoints.toLocaleString(),            sub: "all categories" },
          { label: "Best Day",      value: stats.bestDayScore.toLocaleString() + " pts", sub: stats.bestDay ?? "—" },
          { label: "Best Streak",   value: `${stats.streak}d`,                           sub: "consecutive days" },
        ].map(({ label, value, sub }) => (
          <View key={label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm" style={{ width: "47%" }}>
            <Text className="text-xs text-gray-400 mb-1">{label}</Text>
            <Text className="text-2xl font-bold text-gray-800 leading-tight">{value}</Text>
            <Text className="text-xs text-gray-400 mt-0.5">{sub}</Text>
          </View>
        ))}
      </View>

      {/* Per-category breakdowns */}
      {categoryStats.map(({ cat, sessions, totalMins, activities }) => (
        <View key={cat} className="border border-gray-100 rounded-2xl p-4 bg-white">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <Text className="text-xl">{CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS]}</Text>
              <Text className="font-semibold text-gray-800">{CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}</Text>
            </View>
            <View className="items-end">
              <Text className="text-sm font-bold text-gray-800">{sessions} sessions</Text>
              <Text className="text-xs text-gray-500">{fmtDuration(totalMins)}</Text>
            </View>
          </View>

          {activities.length > 1 && (
            <View className="pt-2 border-t border-gray-50 gap-y-1.5">
              {activities.map(({ label, count, mins }) => (
                <View key={label} className="flex-row items-center justify-between">
                  <Text className="text-xs text-gray-600">{label}</Text>
                  <Text className="text-xs text-gray-500 font-medium">{count}× · {fmtDuration(mins)}</Text>
                </View>
              ))}
            </View>
          )}

          {sessions === 0 && (
            <Text className="text-xs text-gray-400 pt-2 border-t border-gray-50">No sessions logged</Text>
          )}
        </View>
      ))}

      {/* Habits */}
      <View className="border border-pink-100 rounded-2xl p-4 bg-pink-50">
        <View className="flex-row items-center gap-2 mb-3">
          <Text className="text-xl">🌟</Text>
          <Text className="font-semibold text-gray-800">Habits</Text>
        </View>
        <View className="gap-y-2">
          <View className="flex-row justify-between items-center">
            <Text className="text-xs text-gray-600">🌅 Get up at 9</Text>
            <Text className="text-xs font-semibold text-gray-800">{habitStats.getUp} times</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-xs text-gray-600">🌙 Sleep at 12:30</Text>
            <Text className="text-xs font-semibold text-gray-800">{habitStats.sleep} times</Text>
          </View>
          <View className="pt-2 border-t border-pink-100/60">
            <Text className="text-xs text-gray-500 mb-1.5">Meals</Text>
            <View className="flex-row gap-2">
              {[
                { label: "Clean",   value: habitStats.clean,   color: "text-emerald-600" },
                { label: "Regular", value: habitStats.regular, color: "text-gray-600" },
                { label: "Heavy",   value: habitStats.heavy,   color: "text-red-500" },
              ].map(({ label, value, color }) => (
                <View key={label} className="flex-1 items-center bg-white/60 rounded-lg py-2">
                  <Text className={`text-base font-bold ${color}`}>{value}</Text>
                  <Text className="text-xs text-gray-400">{label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Books read */}
      <View className="border border-teal-100 rounded-2xl p-4 bg-teal-50">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-xl">📚</Text>
            <Text className="font-semibold text-gray-800">Books Read</Text>
          </View>
          <Text className="text-sm font-bold text-gray-800">{bookStats.total} book{bookStats.total !== 1 ? "s" : ""}</Text>
        </View>
        {bookStats.total > 0 ? (
          <View className="flex-row gap-2 pt-2 border-t border-teal-100/60">
            {[
              { label: "🌱 Easy",   value: bookStats.easy,   sub: "2–4 hrs" },
              { label: "🔥 Medium", value: bookStats.medium, sub: "~10 hrs" },
              { label: "💀 High",   value: bookStats.high,   sub: "20+ hrs" },
            ].map(({ label, value, sub }) => (
              <View key={label} className="flex-1 items-center bg-white/60 rounded-lg py-2">
                <Text className="text-base font-bold text-gray-800">{value}</Text>
                <Text className="text-xs text-gray-500">{label}</Text>
                <Text style={{ fontSize: 10 }} className="text-gray-400">{sub}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text className="text-xs text-gray-400 pt-2 border-t border-teal-100/60">
            No books logged yet — go to the 📚 tab to track your reading
          </Text>
        )}
      </View>

      {/* Pieces mastered */}
      <View className="border border-violet-100 rounded-2xl p-4 bg-violet-50">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-xl">🎵</Text>
            <Text className="font-semibold text-gray-800">Pieces Mastered</Text>
          </View>
          <Text className="text-sm font-bold text-gray-800">{pieceStats.total} piece{pieceStats.total !== 1 ? "s" : ""}</Text>
        </View>
        {pieceStats.total > 0 ? (
          <View className="gap-y-3 pt-2 border-t border-violet-100/60">
            <View className="flex-row gap-2">
              {[
                { label: "🌱 Beginner",     value: pieceStats.beginner },
                { label: "🔥 Intermediate", value: pieceStats.intermediate },
                { label: "💀 Advanced",     value: pieceStats.advanced },
              ].map(({ label, value }) => (
                <View key={label} className="flex-1 items-center bg-white/60 rounded-lg py-2">
                  <Text className="text-base font-bold text-gray-800">{value}</Text>
                  <Text className="text-xs text-gray-500">{label}</Text>
                </View>
              ))}
            </View>
            {pieceStats.byInstrument.length > 0 && (
              <View className="gap-y-1.5">
                {pieceStats.byInstrument.map(({ inst, count }) => (
                  <View key={inst} className="flex-row items-center justify-between">
                    <Text className="text-xs text-gray-600">{PIECE_INSTRUMENT_LABEL[inst]}</Text>
                    <Text className="text-xs font-semibold text-gray-800">{count} piece{count !== 1 ? "s" : ""}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <Text className="text-xs text-gray-400 pt-2 border-t border-violet-100/60">
            No pieces added yet — go to the 🎵 tab to build your repertoire
          </Text>
        )}
      </View>

      {/* Weekly rating distribution */}
      <View className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="font-semibold text-gray-800">Weekly Ratings</Text>
          <Text className="text-xs text-gray-400">{totalWeeks} week{totalWeeks !== 1 ? "s" : ""} tracked</Text>
        </View>
        <View className="gap-y-2">
          {RATING_ORDER.map((r) => {
            const count = ratingDist[r];
            const pct = totalWeeks > 0 ? (count / totalWeeks) * 100 : 0;
            const colors = RATING_COLORS[r];
            return (
              <View key={r} className="flex-row items-center gap-3">
                <View className={`w-7 items-center px-1 py-0.5 rounded ${colors.bg}`}>
                  <Text className={`text-xs font-bold ${colors.text}`}>{r}</Text>
                </View>
                <View className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <View
                    className={`h-full rounded-full ${colors.bg}`}
                    style={{ width: `${pct}%` }}
                  />
                </View>
                <Text className="text-xs text-gray-500 w-8 text-right">{count}w</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
