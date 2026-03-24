import { ScrollView, Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLifeDataContext } from "../../src/context/LifeDataContext";
import ActivityHistory from "../../src/components/ActivityHistory";
import LogForm from "../../src/components/LogForm";
import { getToday, getWeekStart } from "../../src/engine/scoring";

export default function HistoryScreen() {
  const { entries, logActivity, removeEntry, editEntry, loaded } = useLifeDataContext();

  const today = getToday();
  const weekStart = getWeekStart(today);
  const weekHeavyMeals = entries.filter(
    (e) => e.activityId === "meal" && e.mealType === "heavy" && e.date >= weekStart
  ).length;

  if (!loaded) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
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
        <Text className="text-xl font-bold text-gray-800 mb-2">History</Text>
        <LogForm onLog={logActivity} weekHeavyMeals={weekHeavyMeals} />
        <ActivityHistory
          entries={entries}
          onDelete={removeEntry}
          onEdit={editEntry}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
