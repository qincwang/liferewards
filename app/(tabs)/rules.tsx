import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RulebookView from "../../src/components/RulebookView";

export default function RulesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-6 gap-y-5"
        showsVerticalScrollIndicator={false}
      >
        <RulebookView />
      </ScrollView>
    </SafeAreaView>
  );
}
