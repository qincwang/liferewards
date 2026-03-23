import { useState } from "react";
import type { Achievement, Category } from "../types";

interface AchievementsViewProps {
  achievements: Achievement[];
}

const FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Unlocked", value: "unlocked" },
  { label: "Locked", value: "locked" },
  { label: "💪 Workout", value: "workout" },
  { label: "🎸 Music", value: "music" },
  { label: "🌟 Habits", value: "habits" },
  { label: "📖 Reading", value: "reading" },
] as const;

type Filter = typeof FILTER_OPTIONS[number]["value"];

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AchievementsView({ achievements }: AchievementsViewProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = achievements.filter((a) => {
    if (filter === "unlocked") return !!a.unlockedAt;
    if (filter === "locked") return !a.unlockedAt;
    if (filter === "all") return true;
    return a.category === (filter as Category);
  });

  const unlockedCount = achievements.filter((a) => !!a.unlockedAt).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
        <p className="text-sm opacity-80 mb-1">Achievements</p>
        <p className="text-4xl font-bold">{unlockedCount}<span className="text-xl font-normal opacity-70"> / {achievements.length}</span></p>
        <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-700"
            style={{ width: `${achievements.length > 0 ? (unlockedCount / achievements.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap border transition-all ${
              filter === opt.value
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((a) => (
          <div
            key={a.id}
            className={`rounded-xl p-4 border transition-all ${
              a.unlockedAt
                ? "bg-white border-gray-100 shadow-sm"
                : "bg-gray-50 border-gray-100 opacity-50"
            }`}
          >
            <div className={`text-3xl mb-2 ${a.unlockedAt ? "" : "grayscale"}`}>
              {a.icon}
            </div>
            <p className={`text-sm font-semibold ${a.unlockedAt ? "text-gray-800" : "text-gray-400"}`}>
              {a.title}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 leading-tight">{a.description}</p>
            {a.unlockedAt && (
              <p className="text-xs text-indigo-500 mt-1.5 font-medium">
                ✓ {formatDate(a.unlockedAt)}
              </p>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">🔒</p>
          <p className="text-sm">No achievements here yet</p>
        </div>
      )}
    </div>
  );
}
