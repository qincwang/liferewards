import { useEffect, useState } from "react";
import type { Achievement } from "../types";

interface ToastProps {
  achievements: Achievement[];
  onDismiss: () => void;
}

export default function Toast({ achievements, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (achievements.length === 0) {
      setVisible(false);
      return;
    }
    setIndex(0);
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
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
  if (!current) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 min-w-64">
        <span className="text-2xl">{current.icon}</span>
        <div>
          <p className="text-xs font-medium text-yellow-400 uppercase tracking-wide">Achievement Unlocked!</p>
          <p className="text-sm font-bold">{current.title}</p>
          <p className="text-xs text-gray-400">{current.description}</p>
        </div>
        {achievements.length > 1 && (
          <span className="ml-auto text-xs text-gray-500">{index + 1}/{achievements.length}</span>
        )}
      </div>
    </div>
  );
}
