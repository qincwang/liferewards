import { useState, useMemo } from "react";
import type { LogEntry } from "../types";
import { CATEGORY_ICONS } from "../types";
import { computeScores, toDateStr } from "../engine/scoring";
import { ACTIVITIES_BY_ID } from "../engine/activities";

interface CalendarViewProps {
  entries: LogEntry[];
}

// ─── Color scale by daily pts ────────────────────────────────────────────────
function heatColor(pts: number): string {
  if (pts === 0)    return "bg-gray-100";
  if (pts < 200)    return "bg-indigo-100";
  if (pts < 500)    return "bg-indigo-300";
  if (pts < 1000)   return "bg-indigo-500";
  return "bg-indigo-700";
}

function heatTextColor(pts: number): string {
  if (pts === 0)  return "text-gray-300";
  if (pts < 500)  return "text-indigo-700";
  return "text-white";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function monthDates(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  // Monday-aligned grid
  const startPad = (first.getDay() + 6) % 7; // 0=Mon
  const cells: (string | null)[] = Array(startPad).fill(null);
  for (let d = 1; d <= last.getDate(); d++) {
    cells.push(toDateStr(new Date(year, month, d)));
  }
  // Fill to complete last row
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

  // Compute scores for month + heatmap dates in one pass
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

  // Month navigation
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

  // Heatmap: group into week columns
  // Pad start so first date falls on correct weekday
  const heatStart = new Date(heatDates[0] + "T00:00:00");
  const heatStartPad = (heatStart.getDay() + 6) % 7; // Mon=0
  const paddedHeat: (string | null)[] = [...Array(heatStartPad).fill(null), ...heatDates];
  while (paddedHeat.length % 7 !== 0) paddedHeat.push(null);
  // Split into weeks (columns)
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < paddedHeat.length; i += 7) {
    weeks.push(paddedHeat.slice(i, i + 7));
  }

  return (
    <div className="space-y-5">

      {/* ── Heatmap ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">90-Day Heatmap</h3>

        <div className="flex gap-0.5 overflow-x-auto pb-1">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 mr-1 shrink-0">
            {DAY_LABELS.map((d) => (
              <div key={d} className="h-3.5 flex items-center text-[9px] text-gray-400 w-6">{d}</div>
            ))}
          </div>

          {/* Week columns */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5 shrink-0">
              {week.map((date, di) => (
                <button
                  key={di}
                  onClick={() => date && setSelected(date)}
                  title={date ? `${date}: ${scoreMap.get(date) ?? 0} pts` : ""}
                  className={`w-3.5 h-3.5 rounded-sm transition-all ${
                    date
                      ? `${heatColor(scoreMap.get(date) ?? 0)} ${selected === date ? "ring-1 ring-indigo-500 ring-offset-1" : "hover:opacity-80"}`
                      : "bg-transparent"
                  }`}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-[10px] text-gray-400">Less</span>
          {["bg-gray-100","bg-indigo-100","bg-indigo-300","bg-indigo-500","bg-indigo-700"].map((c) => (
            <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
          <span className="text-[10px] text-gray-400">More</span>
        </div>
      </div>

      {/* ── Month Calendar ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            ‹
          </button>
          <h3 className="text-sm font-semibold text-gray-800">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h3>
          <button
            onClick={nextMonth}
            disabled={isNextDisabled}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ›
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {calCells.map((date, i) => {
            if (!date) return <div key={i} />;
            const pts  = scoreMap.get(date) ?? 0;
            const isToday   = date === today;
            const isSelected = date === selected;
            const isFuture  = date > today;
            return (
              <button
                key={date}
                onClick={() => !isFuture && setSelected(date)}
                disabled={isFuture}
                className={`
                  relative aspect-square rounded-lg flex flex-col items-center justify-center
                  transition-all text-xs font-medium
                  ${isFuture ? "opacity-20 cursor-not-allowed" : "cursor-pointer"}
                  ${isSelected ? "ring-2 ring-indigo-500 ring-offset-1" : ""}
                  ${pts > 0 ? heatColor(pts) : "bg-gray-50 hover:bg-gray-100"}
                  ${isToday && !isSelected ? "ring-2 ring-indigo-300" : ""}
                `}
              >
                <span className={`text-[11px] font-semibold leading-none ${pts > 0 ? heatTextColor(pts) : "text-gray-400"}`}>
                  {new Date(date + "T00:00:00").getDate()}
                </span>
                {pts > 0 && (
                  <span className={`text-[9px] leading-none mt-0.5 ${heatTextColor(pts)}`}>
                    {pts >= 1000 ? `${(pts / 1000).toFixed(1)}k` : pts}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Selected Day Detail ──────────────────────── */}
      {selected && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">
              {new Date(selected + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric",
              })}
            </h3>
            <span className={`text-sm font-bold ${selectedScore > 0 ? "text-indigo-600" : "text-gray-400"}`}>
              {selectedScore} pts
            </span>
          </div>

          {selectedEntries.length === 0 ? (
            <p className="text-sm text-gray-400">No activities logged this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedEntries.map((e) => (
                <div key={e.id} className="flex items-center gap-3 py-1.5 px-3 bg-gray-50 rounded-lg">
                  <span>{CATEGORY_ICONS[e.category]}</span>
                  <span className="text-sm text-gray-700 flex-1">{entryLabel(e)}</span>
                  {e.duration > 0 && (
                    <span className="text-xs text-gray-400">{e.duration} min</span>
                  )}
                  {e.note && (
                    <span className="text-xs text-gray-400 italic">{e.note}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
