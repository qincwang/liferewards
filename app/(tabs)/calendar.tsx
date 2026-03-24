import { ScrollView, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLifeDataContext } from "../../src/context/LifeDataContext";
import CalendarView from "../../src/components/CalendarView";

export default function CalendarScreen() {
  const { entries, loaded } = useLifeDataContext();

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
        <Text className="text-xl font-bold text-gray-800 mb-2">Calendar</Text>
        <CalendarView entries={entries} />
      </ScrollView>
    </SafeAreaView>
  );
}
