import { useState } from "react";
import type { Achievement, AchievementTier, Category } from "../types";

interface AchievementsViewProps {
  achievements: Achievement[];
}

const TIER_STYLES: Record<AchievementTier, { label: string; badge: string; ring: string; glow: string }> = {
  bronze:   { label: "Bronze",   badge: "bg-amber-100  text-amber-700  border-amber-300",  ring: "border-amber-400",  glow: "" },
  silver:   { label: "Silver",   badge: "bg-slate-100  text-slate-600  border-slate-300",  ring: "border-slate-400",  glow: "" },
  gold:     { label: "Gold",     badge: "bg-yellow-100 text-yellow-700 border-yellow-400", ring: "border-yellow-400", glow: "shadow-sm shadow-yellow-100" },
  platinum: { label: "Platinum", badge: "bg-purple-100 text-purple-700 border-purple-400", ring: "border-purple-500", glow: "shadow-md shadow-purple-100" },
};

const FILTER_OPTIONS = [
  { label: "All",       value: "all" },
  { label: "Unlocked",  value: "unlocked" },
  { label: "Locked",    value: "locked" },
  { label: "🥉 Bronze",   value: "bronze" },
  { label: "⬜ Silver",   value: "silver" },
  { label: "🥇 Gold",     value: "gold" },
  { label: "💎 Platinum", value: "platinum" },
  { label: "💪 Workout",  value: "workout" },
  { label: "🎸 Music",    value: "music" },
  { label: "🌟 Habits",   value: "habits" },
  { label: "📖 Reading",  value: "reading" },
] as const;

type Filter = typeof FILTER_OPTIONS[number]["value"];

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function AchievementsView({ achievements }: AchievementsViewProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = achievements.filter((a) => {
    if (filter === "unlocked") return !!a.unlockedAt;
    if (filter === "locked")   return !a.unlockedAt;
    if (filter === "all")      return true;
    if (filter === "bronze" || filter === "silver" || filter === "gold" || filter === "platinum") {
      return a.tier === filter;
    }
    return a.category === (filter as Category);
  });

  const unlockedCount = achievements.filter((a) => !!a.unlockedAt).length;

  const tierCounts = (["bronze", "silver", "gold", "platinum"] as AchievementTier[]).map((tier) => ({
    tier,
    total: achievements.filter((a) => a.tier === tier).length,
    unlocked: achievements.filter((a) => a.tier === tier && !!a.unlockedAt).length,
  }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
        <p className="text-sm opacity-80 mb-1">Achievements</p>
        <p className="text-4xl font-bold">
          {unlockedCount}
          <span className="text-xl font-normal opacity-70"> / {achievements.length}</span>
        </p>
        <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-700"
            style={{ width: `${achievements.length > 0 ? (unlockedCount / achievements.length) * 100 : 0}%` }}
          />
        </div>
        {/* Tier breakdown */}
        <div className="mt-3 grid grid-cols-4 gap-2">
          {tierCounts.map(({ tier, total, unlocked }) => (
            <div key={tier} className="text-center">
              <p className="text-xs opacity-60 capitalize">{tier}</p>
              <p className="text-sm font-semibold">{unlocked}<span className="opacity-50 font-normal">/{total}</span></p>
            </div>
          ))}
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
                : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((a) => {
          const tier = TIER_STYLES[a.tier];
          return (
            <div
              key={a.id}
              className={`rounded-xl p-4 border-2 transition-all ${
                a.unlockedAt
                  ? `bg-white dark:bg-slate-900 ${tier.ring} ${tier.glow}`
                  : "bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 opacity-40"
              }`}
            >
              {/* Tier badge */}
              <div className="flex items-start justify-between mb-2">
                <div className={`text-3xl ${a.unlockedAt ? "" : "grayscale"}`}>{a.icon}</div>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border capitalize ${tier.badge}`}>
                  {tier.label}
                </span>
              </div>
              <p className={`text-sm font-semibold ${a.unlockedAt ? "text-gray-800 dark:text-slate-100" : "text-gray-400 dark:text-slate-600"}`}>
                {a.title}
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 leading-tight">{a.description}</p>
              {a.unlockedAt && (
                <p className="text-xs text-indigo-500 mt-1.5 font-medium">✓ {formatDate(a.unlockedAt)}</p>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400 dark:text-slate-500">
          <p className="text-4xl mb-2">🔒</p>
          <p className="text-sm">No achievements here yet</p>
        </div>
      )}
    </div>
  );
}
