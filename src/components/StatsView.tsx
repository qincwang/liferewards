import { useMemo, useState } from "react";
import type { LogEntry, Rating } from "../types";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "../types";
import { computeScores, computeWeeklyRating, getWeekStart } from "../engine/scoring";
import { ACTIVITIES_BY_ID } from "../engine/activities";

interface StatsViewProps {
  entries: LogEntry[];
}

const DURATION_CATEGORIES = ["workout", "work", "reading", "music"] as const;

const RATING_ORDER: Rating[] = ["D", "C", "B", "A", "S", "SS", "SSS"];

const RATING_COLORS: Record<Rating, string> = {
  D:   "bg-gray-200   text-gray-500",
  C:   "bg-green-200  text-green-700",
  B:   "bg-blue-200   text-blue-700",
  A:   "bg-purple-200 text-purple-700",
  S:   "bg-amber-200  text-amber-700",
  SS:  "bg-orange-200 text-orange-700",
  SSS: "bg-yellow-200 text-yellow-700",
};

const CATEGORY_BG: Record<string, string> = {
  workout: "from-orange-50 border-orange-100",
  work:    "from-blue-50   border-blue-100",
  reading: "from-emerald-50 border-emerald-100",
  music:   "from-purple-50 border-purple-100",
  habits:  "from-pink-50   border-pink-100",
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

export default function StatsView({ entries }: StatsViewProps) {
  // ── Year filter ─────────────────────────────────────────────────────────────
  const years = useMemo(() => {
    const ys = [...new Set(entries.map((e) => e.date.slice(0, 4)))].sort().reverse();
    return ys;
  }, [entries]);

  const [year, setYear] = useState<string>("all");

  const filtered = useMemo(
    () => (year === "all" ? entries : entries.filter((e) => e.date.startsWith(year))),
    [entries, year]
  );

  // ── Summary stats ────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const daysLogged = new Set(filtered.map((e) => e.date)).size;
    const streak = maxConsecutiveDays(filtered);

    // Scores: pass all entries for streak-accurate calculation, sum only filtered dates
    const filteredDates = [...new Set(filtered.map((e) => e.date))];
    const scores = computeScores(entries, filteredDates);
    const totalPoints = scores.reduce((s, d) => s + d.totalScore, 0);
    const bestDayScore = Math.max(0, ...scores.map((d) => d.totalScore));
    const bestDay = scores.find((d) => d.totalScore === bestDayScore)?.date ?? null;

    return { daysLogged, streak, totalPoints, bestDayScore, bestDay };
  }, [entries, filtered]);

  // ── Per-category stats ───────────────────────────────────────────────────────
  const categoryStats = useMemo(() => {
    return DURATION_CATEGORIES.map((cat) => {
      const catEntries = filtered.filter((e) => e.category === cat && e.duration > 0);
      const sessions = catEntries.length;
      const totalMins = catEntries.reduce((s, e) => s + e.duration, 0);

      // Count per activity within this category
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

  // ── Habits stats ─────────────────────────────────────────────────────────────
  const habitStats = useMemo(() => {
    const getUp   = filtered.filter((e) => e.activityId === "get_up").length;
    const sleep   = filtered.filter((e) => e.activityId === "sleep").length;
    const clean   = filtered.filter((e) => e.activityId === "meal" && e.mealType === "clean").length;
    const regular = filtered.filter((e) => e.activityId === "meal" && e.mealType === "regular").length;
    const heavy   = filtered.filter((e) => e.activityId === "meal" && e.mealType === "heavy").length;
    return { getUp, sleep, clean, regular, heavy };
  }, [filtered]);

  // ── Weekly rating distribution ────────────────────────────────────────────────
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

  if (entries.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-4xl mb-3">📊</p>
        <p className="text-sm">Log some activities to see your stats</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header + year filter */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 text-white shadow-lg">
        <p className="text-sm opacity-80 mb-1">Total Stats</p>
        <p className="text-3xl font-bold">{stats.totalPoints.toLocaleString()} pts</p>
        <p className="text-sm opacity-70 mt-0.5">{stats.daysLogged} days logged · {stats.streak}-day best streak</p>

        {/* Year pills */}
        {years.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            <button
              onClick={() => setYear("all")}
              className={`px-3 py-1 text-xs rounded-full border transition-all ${
                year === "all" ? "bg-white text-indigo-700 border-white font-semibold" : "bg-white/20 border-white/40 text-white"
              }`}
            >
              All time
            </button>
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`px-3 py-1 text-xs rounded-full border transition-all ${
                  year === y ? "bg-white text-indigo-700 border-white font-semibold" : "bg-white/20 border-white/40 text-white"
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Days Logged",   value: stats.daysLogged.toString(),              sub: "unique days" },
          { label: "Total Points",  value: stats.totalPoints.toLocaleString(),        sub: "all categories" },
          { label: "Best Day",      value: stats.bestDayScore.toLocaleString() + " pts", sub: stats.bestDay ?? "—" },
          { label: "Best Streak",   value: `${stats.streak}d`,                       sub: "consecutive days" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-800 leading-tight">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Per-category breakdowns */}
      {categoryStats.map(({ cat, sessions, totalMins, activities }) => (
        <div key={cat} className={`bg-gradient-to-br ${CATEGORY_BG[cat]} border rounded-2xl p-4`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS]}</span>
              <span className="font-semibold text-gray-800">{CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-800">{sessions} sessions</p>
              <p className="text-xs text-gray-500">{fmtDuration(totalMins)}</p>
            </div>
          </div>

          {activities.length > 1 && (
            <div className="space-y-1.5 pt-2 border-t border-black/5">
              {activities.map(({ label, count, mins }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{label}</span>
                  <span className="text-xs text-gray-500 font-medium">{count}× · {fmtDuration(mins)}</span>
                </div>
              ))}
            </div>
          )}

          {sessions === 0 && (
            <p className="text-xs text-gray-400 pt-2 border-t border-black/5">No sessions logged</p>
          )}
        </div>
      ))}

      {/* Habits */}
      <div className={`bg-gradient-to-br ${CATEGORY_BG["habits"]} border rounded-2xl p-4`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{CATEGORY_ICONS["habits"]}</span>
          <span className="font-semibold text-gray-800">Habits</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">🌅 Get up at 9</span>
            <span className="text-xs font-semibold text-gray-800">{habitStats.getUp} times</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">🌙 Sleep at 12:30</span>
            <span className="text-xs font-semibold text-gray-800">{habitStats.sleep} times</span>
          </div>
          <div className="pt-2 border-t border-black/5">
            <p className="text-xs text-gray-500 mb-1.5">Meals</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Clean",   value: habitStats.clean,   color: "text-emerald-600" },
                { label: "Regular", value: habitStats.regular, color: "text-gray-600" },
                { label: "Heavy",   value: habitStats.heavy,   color: "text-red-500" },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center bg-white/60 rounded-lg py-2">
                  <p className={`text-base font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly rating distribution */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-gray-800">Weekly Ratings</p>
          <p className="text-xs text-gray-400">{totalWeeks} week{totalWeeks !== 1 ? "s" : ""} tracked</p>
        </div>
        <div className="space-y-2">
          {RATING_ORDER.map((r) => {
            const count = ratingDist[r];
            const pct = totalWeeks > 0 ? (count / totalWeeks) * 100 : 0;
            return (
              <div key={r} className="flex items-center gap-3">
                <span className={`text-xs font-bold w-7 text-center px-1 py-0.5 rounded ${RATING_COLORS[r]}`}>{r}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${RATING_COLORS[r].split(" ")[0].replace("text", "bg")}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">{count}w</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
