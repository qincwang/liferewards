import { useCallback, useEffect, useState } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "auto" | "light" | "dark";

const STORAGE_KEY = "liferewards_theme";

function isDarkHour(): boolean {
  return new Date().getHours() >= 17;
}

function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  // auto: use time-based fallback (17:00+) or system preference
  const systemScheme = Appearance.getColorScheme();
  if (systemScheme === "dark") return true;
  return isDarkHour();
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>("auto");
  const [isDark, setIsDark] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      const saved = (val as ThemeMode) ?? "auto";
      setMode(saved);
      setIsDark(resolveIsDark(saved));
    });
  }, []);

  // Persist + apply whenever mode changes
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, mode);
    setIsDark(resolveIsDark(mode));
  }, [mode]);

  // Re-check every minute so auto mode flips at 5pm without a reload
  useEffect(() => {
    if (mode !== "auto") return;
    const id = setInterval(() => {
      setIsDark(resolveIsDark("auto"));
    }, 60_000);
    return () => clearInterval(id);
  }, [mode]);

  const cycle = useCallback(() => {
    setMode((m) => (m === "auto" ? "light" : m === "light" ? "dark" : "auto"));
  }, []);

  return { mode, isDark, cycle };
}
