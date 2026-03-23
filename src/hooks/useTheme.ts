import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "auto" | "light" | "dark";

const STORAGE_KEY = "liferewards_theme";

function isDarkHour(): boolean {
  return new Date().getHours() >= 17;
}

function applyTheme(mode: ThemeMode): void {
  const dark = mode === "dark" || (mode === "auto" && isDarkHour());
  document.documentElement.classList.toggle("dark", dark);
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(
    () => (localStorage.getItem(STORAGE_KEY) as ThemeMode) ?? "auto"
  );

  useEffect(() => {
    applyTheme(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  // Re-check every minute so auto mode flips at 5pm without a reload
  useEffect(() => {
    if (mode !== "auto") return;
    const id = setInterval(() => applyTheme("auto"), 60_000);
    return () => clearInterval(id);
  }, [mode]);

  const cycle = useCallback(() => {
    setMode((m) => (m === "auto" ? "light" : m === "light" ? "dark" : "auto"));
  }, []);

  return { mode, cycle };
}
