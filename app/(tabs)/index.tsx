import { View, ScrollView, ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLifeDataContext } from "../../src/context/LifeDataContext";
import Dashboard from "../../src/components/Dashboard";
import LogForm from "../../src/components/LogForm";
import Toast from "../../src/components/Toast";
import StreakFuneralModal from "../../src/components/StreakFuneral";
import { useStreakFunerals } from "../../src/hooks/useStreakFunerals";
import { getToday, getWeekStart } from "../../src/engine/scoring";

export default function DashboardScreen() {
  const {
    entries,
    logActivity,
    newAchievements,
    dismissNewAchievements,
    loaded,
  } = useLifeDataContext();

  const { funeral, dismiss: dismissFuneral } = useStreakFunerals(entries);

  const today = getToday();
  const weekStart = getWeekStart(today);
  const weekHeavyMeals = entries.filter(
    (e) => e.activityId === "meal" && e.mealType === "heavy" && e.date >= weekStart
  ).length;

  if (!loaded) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="text-gray-400 mt-3 text-sm">Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-6 gap-y-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-xl font-bold text-gray-800">
            <Text className="text-indigo-600">Life</Text>Rewards
          </Text>
        </View>

        <LogForm onLog={logActivity} weekHeavyMeals={weekHeavyMeals} />
        <Dashboard entries={entries} />
      </ScrollView>

      <Toast achievements={newAchievements} onDismiss={dismissNewAchievements} />
      {funeral && <StreakFuneralModal funeral={funeral} onDismiss={dismissFuneral} />}
    </SafeAreaView>
  );
}
