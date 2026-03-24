import { View, Text } from "react-native";
import type { Category } from "../types";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "../types";
import { CATEGORY_DAILY_CAP, CATEGORY_DISPLAY_TARGET } from "../engine/rules";

interface ScoreCardProps {
  category: Category;
  score: number;
  streak: number;
}

export default function ScoreCard({ category, score, streak }: ScoreCardProps) {
  const cap = CATEGORY_DAILY_CAP[category];
  const displayTarget = CATEGORY_DISPLAY_TARGET[category];
  const pct = Math.min(Math.max((score / displayTarget) * 100, 0), 100);
  const isNegative = score < 0;

  const BAR_COLORS: Record<Category, string> = {
    workout: "bg-orange-500",
    work: "bg-blue-500",
    reading: "bg-emerald-500",
    music: "bg-purple-500",
    habits: "bg-pink-500",
  };

  return (
    <View className={`bg-white rounded-xl border p-4 shadow-sm ${isNegative ? "border-red-100" : "border-gray-100"}`}>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-xs font-medium text-gray-500">
          {CATEGORY_ICONS[category]} {CATEGORY_LABELS[category]}
        </Text>
        {streak > 0 && (
          <View className="bg-amber-50 px-1.5 py-0.5 rounded-full">
            <Text className="text-xs text-amber-700 font-medium">{streak}d</Text>
          </View>
        )}
      </View>
      <Text className={`text-2xl font-bold mb-2 ${isNegative ? "text-red-500" : "text-gray-800"}`}>
        {score}
        <Text className="text-xs font-normal text-gray-400"> pts</Text>
      </Text>
      <View className="w-full bg-gray-100 rounded-full h-2">
        <View
          className={`${BAR_COLORS[category]} h-2 rounded-full`}
          style={{ width: `${pct}%` }}
        />
      </View>
      <Text className="text-xs text-gray-400 mt-1 text-right">
        {cap ? `${cap} max` : `${displayTarget} target`}
      </Text>
    </View>
  );
}
