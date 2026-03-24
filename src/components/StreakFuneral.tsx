import { View, Text, TouchableOpacity, Modal } from "react-native";
import type { StreakFuneral } from "../hooks/useStreakFunerals";

interface Props {
  funeral: StreakFuneral;
  onDismiss: () => void;
}

function formatDateShort(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function StreakFuneralModal({ funeral, onDismiss }: Props) {
  return (
    <Modal
      visible={true}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View className="flex-1 bg-black/60 justify-end items-center p-4 pb-8">
        <View className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
          {/* Dark gradient header */}
          <View className="bg-slate-900 px-6 pt-8 pb-6 items-center">
            <Text className="text-7xl mb-3">🪦</Text>
            <Text className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
              In Loving Memory
            </Text>
            <Text className="text-2xl font-black text-white text-center leading-tight mb-1">
              {funeral.icon} {funeral.streakDays}-Day {funeral.label} Streak
            </Text>
            <Text className="text-sm text-slate-400">
              {formatDateShort(funeral.startDate)} – {formatDateShort(funeral.endDate)}
            </Text>
          </View>

          {/* Epitaph */}
          <View className="bg-slate-800 px-6 py-5 items-center border-t border-slate-700">
            <Text className="text-slate-300 italic text-sm leading-relaxed text-center">
              "{funeral.epitaph}"
            </Text>
          </View>

          {/* Footer */}
          <View className="bg-slate-900 px-6 pb-6 pt-4 items-center gap-2">
            <TouchableOpacity
              onPress={onDismiss}
              className="w-full py-3 rounded-2xl bg-slate-700 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-sm tracking-wide">
                🫡  Press F to Pay Respects
              </Text>
            </TouchableOpacity>
            <Text className="text-xs text-slate-600">You can do better tomorrow.</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
