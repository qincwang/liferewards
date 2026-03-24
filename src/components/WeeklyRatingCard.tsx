import { View, Text } from "react-native";
import type { ConditionProgress, WeeklyRating } from "../types";
import type { Rating } from "../types";

interface WeeklyRatingCardProps {
  weeklyRating: WeeklyRating;
}

const NEXT_RANK: Record<Rating, string> = {
  D: "C", C: "B", B: "A", A: "S", S: "SS", SS: "SSS", SSS: "MAX",
};

function ConditionRow({ c }: { c: ConditionProgress }) {
  const pct = Math.min((c.current / c.required) * 100, 100);
  return (
    <View className="mb-2">
      <View className="flex-row justify-between items-center mb-1">
        <Text className={`text-xs ${c.met ? "text-gray-400 line-through" : "text-gray-600"}`}>
          {c.label}
        </Text>
        <Text className={`text-xs font-medium ${c.met ? "text-emerald-600" : "text-gray-500"}`}>
          {c.met ? "✓" : `${c.displayCurrent} / ${c.displayRequired} ${c.unit}`}
        </Text>
      </View>
      {!c.met && (
        <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <View
            className="h-full bg-indigo-400 rounded-full"
            style={{ width: `${pct}%` }}
          />
        </View>
      )}
    </View>
  );
}

const BADGE_STYLES: Record<Rating, { badgeBg: string; badgeText: string; badgeBorder: string; glow: string }> = {
  D:   { badgeBg: "bg-gray-100",   badgeText: "text-gray-400",   badgeBorder: "border-gray-200",   glow: "" },
  C:   { badgeBg: "bg-green-50",   badgeText: "text-green-600",  badgeBorder: "border-green-200",  glow: "" },
  B:   { badgeBg: "bg-blue-50",    badgeText: "text-blue-600",   badgeBorder: "border-blue-200",   glow: "" },
  A:   { badgeBg: "bg-purple-50",  badgeText: "text-purple-600", badgeBorder: "border-purple-200", glow: "" },
  S:   { badgeBg: "bg-amber-50",   badgeText: "text-amber-600",  badgeBorder: "border-amber-300",  glow: "shadow-md" },
  SS:  { badgeBg: "bg-orange-50",  badgeText: "text-orange-600", badgeBorder: "border-orange-300", glow: "shadow-md" },
  SSS: { badgeBg: "bg-yellow-50",  badgeText: "text-yellow-700", badgeBorder: "border-yellow-400", glow: "shadow-lg" },
};

export default function WeeklyRatingCard({ weeklyRating }: WeeklyRatingCardProps) {
  const { rating, weeklyTotal, nextConditions } = weeklyRating;
  const style = BADGE_STYLES[rating];
  const isMax = rating === "SSS";
  const unmetCount = nextConditions.filter((c) => !c.met).length;

  return (
    <View className={`rounded-2xl border border-gray-100 p-5 bg-white ${style.glow}`}>
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide">Weekly Rating</Text>
          <Text className="text-xs text-gray-400 mt-0.5">{weeklyTotal.toLocaleString()} pts this week</Text>
        </View>
        <View className={`px-4 py-2 rounded-xl border ${style.badgeBg} ${style.badgeBorder}`}>
          <Text className={`text-4xl font-black leading-none ${style.badgeText}`}>{rating}</Text>
        </View>
      </View>

      {!isMax && nextConditions.length > 0 && (
        <View className="border-t border-gray-100 pt-3">
          <Text className="text-xs font-semibold text-gray-500 mb-2.5">
            {unmetCount === 0
              ? `✓ All conditions met for ${NEXT_RANK[rating]}!`
              : `${unmetCount} condition${unmetCount > 1 ? "s" : ""} needed for ${NEXT_RANK[rating]}`}
          </Text>
          {nextConditions.map((c) => (
            <ConditionRow key={c.id} c={c} />
          ))}
        </View>
      )}

      {isMax && (
        <View className="border-t border-yellow-100 pt-3">
          <Text className="text-xs text-yellow-600 font-semibold text-center">👑 Maximum rank achieved</Text>
        </View>
      )}
    </View>
  );
}
