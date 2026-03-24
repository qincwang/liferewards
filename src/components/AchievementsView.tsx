import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import type { Achievement, AchievementTier, Category } from "../types";

interface AchievementsViewProps {
  achievements: Achievement[];
}

const TIER_STYLES: Record<AchievementTier, { label: string; ringColor: string; badgeBg: string; badgeText: string }> = {
  bronze:   { label: "Bronze",   ringColor: "border-amber-400",  badgeBg: "bg-amber-100",  badgeText: "text-amber-700"  },
  silver:   { label: "Silver",   ringColor: "border-slate-400",  badgeBg: "bg-slate-100",  badgeText: "text-slate-600"  },
  gold:     { label: "Gold",     ringColor: "border-yellow-400", badgeBg: "bg-yellow-100", badgeText: "text-yellow-700" },
  platinum: { label: "Platinum", ringColor: "border-purple-500", badgeBg: "bg-purple-100", badgeText: "text-purple-700" },
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

  const progressPct = achievements.length > 0 ? (unlockedCount / achievements.length) * 100 : 0;

  return (
    <View className="gap-y-4">
      {/* Header */}
      <View className="bg-purple-600 rounded-2xl p-5 shadow-lg">
        <Text className="text-sm text-white opacity-80 mb-1">Achievements</Text>
        <Text className="text-4xl font-bold text-white">
          {unlockedCount}
          <Text className="text-xl font-normal opacity-70"> / {achievements.length}</Text>
        </Text>
        <View className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
          <View
            className="h-full bg-white rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </View>
        {/* Tier breakdown */}
        <View className="mt-3 flex-row">
          {tierCounts.map(({ tier, total, unlocked }) => (
            <View key={tier} className="flex-1 items-center">
              <Text className="text-xs text-white/60 capitalize">{tier}</Text>
              <Text className="text-sm font-semibold text-white">
                {unlocked}<Text className="text-white/50 font-normal">/{total}</Text>
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Filter pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2 pb-1">
          {FILTER_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setFilter(opt.value)}
              className={`px-3 py-1.5 rounded-full border ${
                filter === opt.value
                  ? "bg-indigo-600 border-indigo-600"
                  : "bg-white border-gray-200"
              }`}
            >
              <Text className={`text-xs ${filter === opt.value ? "text-white" : "text-gray-600"}`}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Badge grid */}
      <View className="flex-row flex-wrap gap-3">
        {filtered.map((a) => {
          const tier = TIER_STYLES[a.tier];
          return (
            <View
              key={a.id}
              className={`rounded-xl p-4 border-2 w-[47%] ${
                a.unlockedAt
                  ? `bg-white ${tier.ringColor}`
                  : "bg-gray-50 border-gray-100 opacity-40"
              }`}
            >
              {/* Tier badge */}
              <View className="flex-row items-start justify-between mb-2">
                <Text className="text-3xl">{a.icon}</Text>
                <View className={`px-1.5 py-0.5 rounded-full border ${tier.badgeBg} border-transparent`}>
                  <Text className={`text-[10px] font-semibold capitalize ${tier.badgeText}`}>
                    {tier.label}
                  </Text>
                </View>
              </View>
              <Text className={`text-sm font-semibold ${a.unlockedAt ? "text-gray-800" : "text-gray-400"}`}>
                {a.title}
              </Text>
              <Text className="text-xs text-gray-400 mt-0.5 leading-tight">{a.description}</Text>
              {a.unlockedAt && (
                <Text className="text-xs text-indigo-500 mt-1.5 font-medium">✓ {formatDate(a.unlockedAt)}</Text>
              )}
            </View>
          );
        })}
      </View>

      {filtered.length === 0 && (
        <View className="items-center py-12">
          <Text className="text-4xl mb-2">🔒</Text>
          <Text className="text-sm text-gray-400">No achievements here yet</Text>
        </View>
      )}
    </View>
  );
}
