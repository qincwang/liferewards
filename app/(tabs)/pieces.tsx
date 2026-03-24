import { ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLifeDataContext } from "../../src/context/LifeDataContext";
import PiecesView from "../../src/components/PiecesView";

export default function PiecesScreen() {
  const { pieces, addPieceEntry, deletePieceEntry, loaded } = useLifeDataContext();

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
        <PiecesView pieces={pieces} onAdd={addPieceEntry} onDelete={deletePieceEntry} />
      </ScrollView>
    </SafeAreaView>
  );
}
