import { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import type { LogEntry } from "../types";
import { CATEGORY_ICONS } from "../types";
import { computeScores, toDateStr } from "../engine/scoring";
import { ACTIVITIES_BY_ID } from "../engine/activities";

interface CalendarViewProps {
  entries: LogEntry[];
}

// ─── Color scale by daily pts ────────────────────────────────────────────────
function heatBg(pts: number): string {
  if (pts === 0)    return "bg-gray-100";
  if (pts < 200)    return "bg-indigo-100";
  if (pts < 500)    return "bg-indigo-300";
  if (pts < 1000)   return "bg-indigo-500";
  return "bg-indigo-700";
}

function heatText(pts: number): string {
  if (pts === 0)  return "text-gray-300";
  if (pts < 500)  return "text-indigo-700";
  return "text-white";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function monthDates(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  const startPad = (first.getDay() + 6) % 7;
  const cells: (string | null)[] = Array(startPad).fill(null);
  for (let d = 1; d <= last.getDate(); d++) {
    cells.push(toDateStr(new Date(year, month, d)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function last90Dates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(toDateStr(d));
  }
  return dates;
}

function entryLabel(entry: LogEntry): string {
  if (entry.activityId) {
    const def = ACTIVITIES_BY_ID.get(entry.activityId);
    if (def) {
      if (def.isMeal && entry.mealType) return `${def.label} (${entry.mealType})`;
      return def.label;
    }
  }
  return entry.category;
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_LABELS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// ─── Component ───────────────────────────────────────────────────────────────
export default function CalendarView({ entries }: CalendarViewProps) {
  const today = toDateStr(new Date());
  const todayDate = new Date();

  const [viewYear, setViewYear]   = useState(todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth());
  const [selected, setSelected]   = useState<string | null>(today);

  const heatDates   = useMemo(() => last90Dates(), []);
  const calDates    = useMemo(() => monthDates(viewYear, viewMonth).filter(Boolean) as string[], [viewYear, viewMonth]);
  const allDates    = useMemo(() => [...new Set([...heatDates, ...calDates])], [heatDates, calDates]);

  const scoreMap = useMemo(() => {
    const scores = computeScores(entries, allDates);
    return new Map(scores.map((s) => [s.date, s.totalScore]));
  }, [entries, allDates]);

  const selectedEntries = useMemo(() =>
    selected ? entries.filter((e) => e.date === selected) : [],
    [entries, selected]
  );
  const selectedScore = selected ? (scoreMap.get(selected) ?? 0) : 0;

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    const now = new Date();
    if (viewYear > now.getFullYear() || (viewYear === now.getFullYear() && viewMonth >= now.getMonth())) return;
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const calCells = monthDates(viewYear, viewMonth);
  const isNextDisabled = viewYear > todayDate.getFullYear() ||
    (viewYear === todayDate.getFullYear() && viewMonth >= todayDate.getMonth());

  // Heatmap setup
  const heatStart = new Date(heatDates[0] + "T00:00:00");
  const heatStartPad = (heatStart.getDay() + 6) % 7;
  const paddedHeat: (string | null)[] = [...Array(heatStartPad).fill(null), ...heatDates];
  while (paddedHeat.length % 7 !== 0) paddedHeat.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < paddedHeat.length; i += 7) {
    weeks.push(paddedHeat.slice(i, i + 7));
  }

  const CELL_SIZE = 14;
  const CELL_GAP = 2;

  return (
    <View className="gap-y-5">

      {/* ── Heatmap ─────────────────────────────────── */}
      <View className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <Text className="text-sm font-semibold text-gray-600 mb-3">90-Day Heatmap</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            {/* Day labels */}
            <View className="mr-1" style={{ gap: CELL_GAP }}>
              {DAY_LABELS.map((d) => (
                <View key={d} style={{ height: CELL_SIZE, justifyContent: "center" }}>
                  <Text style={{ fontSize: 9 }} className="text-gray-400 w-6">{d}</Text>
                </View>
              ))}
            </View>

            {/* Week columns */}
            {weeks.map((week, wi) => (
              <View key={wi} className="mr-0.5" style={{ gap: CELL_GAP }}>
                {week.map((date, di) => (
                  <TouchableOpacity
                    key={di}
                    onPress={() => date && setSelected(date)}
                    disabled={!date}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      borderRadius: 2,
                      borderWidth: selected === date ? 1 : 0,
                      borderColor: selected === date ? "#6366f1" : "transparent",
                    }}
                    className={date ? heatBg(scoreMap.get(date) ?? 0) : "bg-transparent"}
                  />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Legend */}
        <View className="flex-row items-center gap-1.5 mt-2">
          <Text style={{ fontSize: 10 }} className="text-gray-400">Less</Text>
          {["bg-gray-100","bg-indigo-100","bg-indigo-300","bg-indigo-500","bg-indigo-700"].map((c) => (
            <View key={c} style={{ width: 12, height: 12, borderRadius: 2 }} className={c} />
          ))}
          <Text style={{ fontSize: 10 }} className="text-gray-400">More</Text>
        </View>
      </View>

      {/* ── Month Calendar ───────────────────────────── */}
      <View className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={prevMonth} className="p-1.5 rounded-lg">
            <Text className="text-gray-500 text-lg">‹</Text>
          </TouchableOpacity>
          <Text className="text-sm font-semibold text-gray-800">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </Text>
          <TouchableOpacity
            onPress={nextMonth}
            disabled={isNextDisabled}
            className={`p-1.5 rounded-lg ${isNextDisabled ? "opacity-30" : ""}`}
          >
            <Text className="text-gray-500 text-lg">›</Text>
          </TouchableOpacity>
        </View>

        {/* Day-of-week headers */}
        <View className="flex-row mb-1">
          {DAY_LABELS.map((d) => (
            <View key={d} className="flex-1 items-center py-1">
              <Text style={{ fontSize: 10 }} className="font-medium text-gray-400">{d}</Text>
            </View>
          ))}
        </View>

        {/* Day cells */}
        <View className="flex-row flex-wrap">
          {calCells.map((date, i) => {
            if (!date) return <View key={i} style={{ width: `${100/7}%` }} className="aspect-square" />;
            const pts  = scoreMap.get(date) ?? 0;
            const isToday   = date === today;
            const isSelected = date === selected;
            const isFuture  = date > today;
            return (
              <TouchableOpacity
                key={date}
                onPress={() => !isFuture && setSelected(date)}
                disabled={isFuture}
                style={{
                  width: `${100/7}%`,
                  aspectRatio: 1,
                  padding: 2,
                  borderWidth: isSelected ? 2 : isToday && !isSelected ? 1.5 : 0,
                  borderColor: isSelected ? "#6366f1" : isToday ? "#a5b4fc" : "transparent",
                  borderRadius: 8,
                }}
                className={`items-center justify-center ${
                  isFuture ? "opacity-20" : ""
                } ${pts > 0 ? heatBg(pts) : "bg-gray-50"}`}
              >
                <Text style={{ fontSize: 11 }} className={`font-semibold leading-none ${pts > 0 ? heatText(pts) : "text-gray-400"}`}>
                  {new Date(date + "T00:00:00").getDate()}
                </Text>
                {pts > 0 && (
                  <Text style={{ fontSize: 9 }} className={`leading-none mt-0.5 ${heatText(pts)}`}>
                    {pts >= 1000 ? `${(pts / 1000).toFixed(1)}k` : pts}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Selected Day Detail ──────────────────────── */}
      {selected && (
        <View className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-semibold text-gray-800">
              {new Date(selected + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric",
              })}
            </Text>
            <Text className={`text-sm font-bold ${selectedScore > 0 ? "text-indigo-600" : "text-gray-400"}`}>
              {selectedScore} pts
            </Text>
          </View>

          {selectedEntries.length === 0 ? (
            <Text className="text-sm text-gray-400">No activities logged this day.</Text>
          ) : (
            <View className="gap-y-2">
              {selectedEntries.map((e) => (
                <View key={e.id} className="flex-row items-center gap-3 py-1.5 px-3 bg-gray-50 rounded-lg">
                  <Text>{CATEGORY_ICONS[e.category]}</Text>
                  <Text className="text-sm text-gray-700 flex-1">{entryLabel(e)}</Text>
                  {e.duration > 0 && (
                    <Text className="text-xs text-gray-400">{e.duration} min</Text>
                  )}
                  {e.note && (
                    <Text className="text-xs text-gray-400 italic">{e.note}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}
