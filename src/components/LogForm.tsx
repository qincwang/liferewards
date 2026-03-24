import { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import type { MealType } from "../types";
import { ACTIVITIES, ACTIVITIES_BY_CATEGORY } from "../engine/activities";
import type { ActivityDefinition } from "../engine/activities";

interface LogFormProps {
  onLog: (activityId: string, duration: number, mealType?: MealType, note?: string, date?: string) => void;
  weekHeavyMeals: number;
}

const DURATION_CATEGORIES = ["workout", "work", "reading", "music"] as const;

const CATEGORY_LABELS: Record<string, string> = {
  workout: "💪 Workout",
  work: "💻 Work",
  reading: "📖 Reading",
  music: "🎸 Music",
};

const QUICK_OPTIONS: { label: string; activityId: string; duration: number }[] = [
  { label: "30m Bouldering", activityId: "bouldering", duration: 30 },
  { label: "30m Cardio", activityId: "cardio", duration: 30 },
  { label: "1h Work", activityId: "work_general", duration: 60 },
  { label: "30m Guitar", activityId: "electric_guitar", duration: 30 },
  { label: "30m Reading", activityId: "reading_general", duration: 30 },
];

const MEAL_OPTIONS: { label: string; type: MealType; emoji: string; pts: string }[] = [
  { label: "Clean", type: "clean", emoji: "🥗", pts: "+15 pts" },
  { label: "Regular", type: "regular", emoji: "🍽️", pts: "0 pts" },
  { label: "Heavy", type: "heavy", emoji: "🍔", pts: "0 / -20 pts" },
];

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function LogForm({ onLog, weekHeavyMeals }: LogFormProps) {
  const [mode, setMode] = useState<"activity" | "habits">("activity");
  const [dayOffset, setDayOffset] = useState<"today" | "yesterday">("today");

  // Activity mode
  const [selectedCategory, setSelectedCategory] = useState("workout");
  const [selectedActivity, setSelectedActivity] = useState<ActivityDefinition>(
    ACTIVITIES.find((a) => a.id === "bouldering")!
  );
  const [duration, setDuration] = useState("");
  const [note, setNote] = useState("");

  // Habit mode
  const [mealType, setMealType] = useState<MealType>("clean");

  const [showSuccess, setShowSuccess] = useState(false);

  const logDate = dayOffset === "today" ? getToday() : getYesterday();

  function flashSuccess() {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1500);
  }

  function handleActivitySubmit() {
    const mins = parseInt(duration, 10);
    if (!mins || mins <= 0) return;
    onLog(selectedActivity.id, mins, undefined, note || undefined, logDate);
    setDuration("");
    setNote("");
    flashSuccess();
  }

  function handleQuickLog(activityId: string, dur: number) {
    onLog(activityId, dur, undefined, undefined, logDate);
    flashSuccess();
  }

  function handleHabitLog(activityId: string, mType?: MealType) {
    onLog(activityId, 0, mType, undefined, logDate);
    flashSuccess();
  }

  function handleCategoryChange(cat: string) {
    setSelectedCategory(cat);
    const first = (ACTIVITIES_BY_CATEGORY[cat] ?? []).find((a) => a.type === "duration");
    if (first) setSelectedActivity(first);
  }

  const categoryActivities = (ACTIVITIES_BY_CATEGORY[selectedCategory] ?? []).filter(
    (a) => a.type === "duration"
  );

  return (
    <View className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      {/* Header row: day toggle + mode toggle */}
      <View className="flex-row items-center justify-between mb-4 gap-2">
        <View className="flex-row gap-1 bg-gray-100 rounded-lg p-1">
          <TouchableOpacity
            onPress={() => setDayOffset("today")}
            className={`px-2.5 py-1 rounded-md ${
              dayOffset === "today" ? "bg-white shadow-sm" : ""
            }`}
          >
            <Text className={`text-xs ${dayOffset === "today" ? "text-gray-800 font-medium" : "text-gray-500"}`}>
              Today
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDayOffset("yesterday")}
            className={`px-2.5 py-1 rounded-md ${
              dayOffset === "yesterday" ? "bg-white shadow-sm" : ""
            }`}
          >
            <Text className={`text-xs ${dayOffset === "yesterday" ? "text-amber-700 font-medium" : "text-gray-500"}`}>
              Yesterday
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-1 bg-gray-100 rounded-lg p-1">
          <TouchableOpacity
            onPress={() => setMode("activity")}
            className={`px-2.5 py-1 rounded-md ${
              mode === "activity" ? "bg-white shadow-sm" : ""
            }`}
          >
            <Text className={`text-xs ${mode === "activity" ? "text-gray-800 font-medium" : "text-gray-500"}`}>
              Activity
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode("habits")}
            className={`px-2.5 py-1 rounded-md ${
              mode === "habits" ? "bg-white shadow-sm" : ""
            }`}
          >
            <Text className={`text-xs ${mode === "habits" ? "text-gray-800 font-medium" : "text-gray-500"}`}>
              🌟 Habits
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {dayOffset === "yesterday" && (
        <View className="bg-amber-50 rounded-lg px-3 py-1.5 mb-3">
          <Text className="text-xs text-amber-600">Logging for yesterday</Text>
        </View>
      )}

      {mode === "activity" ? (
        <View>
          {/* Quick log */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
            <View className="flex-row gap-2">
              {QUICK_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.activityId + opt.duration}
                  onPress={() => handleQuickLog(opt.activityId, opt.duration)}
                  className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <Text className="text-sm text-gray-700">{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Category picker */}
          <View className="flex-row gap-1.5 mb-4">
            {DURATION_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => handleCategoryChange(cat)}
                className={`flex-1 py-2 px-1 rounded-lg ${
                  selectedCategory === cat
                    ? "bg-indigo-600"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <Text className={`text-xs font-medium text-center ${
                  selectedCategory === cat ? "text-white" : "text-gray-600"
                }`}>
                  {CATEGORY_LABELS[cat]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Activity picker */}
          {categoryActivities.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2">
                {categoryActivities.map((act) => (
                  <TouchableOpacity
                    key={act.id}
                    onPress={() => setSelectedActivity(act)}
                    className={`px-3 py-1.5 rounded-lg border ${
                      selectedActivity.id === act.id
                        ? "bg-indigo-50 border-indigo-300"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <Text className={`text-sm ${
                      selectedActivity.id === act.id
                        ? "text-indigo-700 font-medium"
                        : "text-gray-600"
                    }`}>
                      {act.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

          {/* Duration + note */}
          <View className="flex-row gap-3 mb-4">
            <TextInput
              placeholder="Minutes"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-800 bg-white"
              placeholderTextColor="#9ca3af"
            />
            <TextInput
              placeholder="Note (optional)"
              value={note}
              onChangeText={setNote}
              className="flex-[2] px-4 py-2 border border-gray-200 rounded-lg text-gray-800 bg-white"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <TouchableOpacity
            onPress={handleActivitySubmit}
            className="w-full py-2.5 bg-indigo-600 rounded-lg items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-medium">
              {showSuccess ? "✓ Logged!" : `Log ${selectedActivity.label}`}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="gap-y-4">
          {/* Wake / Sleep */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => handleHabitLog("get_up")}
              className="flex-1 py-3 bg-amber-50 border border-amber-200 rounded-xl items-center"
              activeOpacity={0.8}
            >
              <Text className="text-sm font-medium text-amber-800">🌅 Got Up at 9</Text>
              <Text className="text-xs text-amber-600 mt-0.5">+30 pts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleHabitLog("sleep")}
              className="flex-1 py-3 bg-indigo-50 border border-indigo-200 rounded-xl items-center"
              activeOpacity={0.8}
            >
              <Text className="text-sm font-medium text-indigo-800">🌙 Sleep at 12:30</Text>
              <Text className="text-xs text-indigo-600 mt-0.5">+20 pts</Text>
            </TouchableOpacity>
          </View>

          {/* Meals */}
          <View>
            <Text className="text-sm font-medium text-gray-600 mb-2">Log a Meal</Text>
            <View className="flex-row gap-2 mb-3">
              {MEAL_OPTIONS.map((opt) => {
                const isSelected = mealType === opt.type;
                const selectedBg =
                  opt.type === "clean"
                    ? "bg-emerald-500"
                    : opt.type === "heavy"
                    ? "bg-red-500"
                    : "bg-gray-500";
                return (
                  <TouchableOpacity
                    key={opt.type}
                    onPress={() => setMealType(opt.type)}
                    className={`flex-1 py-2.5 rounded-xl border items-center ${
                      isSelected
                        ? `${selectedBg} border-transparent`
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <Text className="text-base">{opt.emoji}</Text>
                    <Text className={`text-sm font-medium mt-0.5 ${isSelected ? "text-white" : "text-gray-600"}`}>
                      {opt.label}
                    </Text>
                    <Text className={`text-xs mt-0.5 ${isSelected ? "text-white/80" : "text-gray-400"}`}>
                      {opt.pts}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {mealType === "heavy" && weekHeavyMeals >= 2 && (
              <View className="bg-red-50 rounded-lg px-3 py-2 mb-3">
                <Text className="text-xs text-red-600">
                  ⚠️ This is your {weekHeavyMeals + 1}{weekHeavyMeals + 1 === 3 ? "rd" : "th"} heavy meal this week — penalty applies (-20 pts)
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => handleHabitLog("meal", mealType)}
              className="w-full py-2.5 bg-pink-600 rounded-lg items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white font-medium">
                {showSuccess ? "✓ Logged!" : "Log Meal"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
