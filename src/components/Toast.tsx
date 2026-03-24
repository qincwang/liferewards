import { useEffect, useState } from "react";
import { View, Text, Animated } from "react-native";
import type { Achievement } from "../types";

interface ToastProps {
  achievements: Achievement[];
  onDismiss: () => void;
}

export default function Toast({ achievements, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const opacity = useState(new Animated.Value(0))[0];
  const translateY = useState(new Animated.Value(16))[0];

  useEffect(() => {
    if (achievements.length === 0) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 16, duration: 300, useNativeDriver: true }),
      ]).start(() => setVisible(false));
      return;
    }
    setIndex(0);
    setVisible(true);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 16, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      });
    }, 3000 + (achievements.length - 1) * 600);

    return () => clearTimeout(timer);
  }, [achievements]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cycle through multiple achievements
  useEffect(() => {
    if (!visible || achievements.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % achievements.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [visible, achievements.length]);

  const current = achievements[index];
  if (!current || !visible) return null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 24,
        left: 16,
        right: 16,
        zIndex: 50,
        opacity,
        transform: [{ translateY }],
      }}
    >
      <View className="bg-gray-900 px-5 py-3.5 rounded-2xl shadow-2xl flex-row items-center gap-3">
        <Text className="text-2xl">{current.icon}</Text>
        <View className="flex-1">
          <Text className="text-xs font-medium text-yellow-400 uppercase tracking-wide">Achievement Unlocked!</Text>
          <Text className="text-sm font-bold text-white">{current.title}</Text>
          <Text className="text-xs text-gray-400">{current.description}</Text>
        </View>
        {achievements.length > 1 && (
          <Text className="text-xs text-gray-500">{index + 1}/{achievements.length}</Text>
        )}
      </View>
    </Animated.View>
  );
}
