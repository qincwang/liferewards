import { useState } from "react";
import { getWeightEntries, setWeight, type WeightEntry } from "../store/weight";
import { getToday } from "../engine/scoring";

export default function WeightTracker() {
  const today = getToday();
  const [entries, setEntries] = useState<WeightEntry[]>(getWeightEntries);
  const [input, setInput] = useState("");

  const todayEntry = entries.find((e) => e.date === today);
  const recent = entries.slice(-7);
  const prev = entries.length >= 2 ? entries[entries.length - 2] : null;

  function handleSave() {
    const val = parseFloat(input);
    if (isNaN(val) || val <= 0) return;
    setEntries(setWeight(today, val));
    setInput("");
  }

  const diff = todayEntry && prev ? todayEntry.lbs - prev.lbs : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Weight</h3>

      {todayEntry ? (
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-gray-800 dark:text-slate-100">
            {todayEntry.lbs}
          </span>
          <span className="text-sm text-gray-400 dark:text-slate-500">lbs</span>
          {diff !== null && diff !== 0 && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              diff < 0
                ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                : "bg-red-100 text-red-500 dark:bg-red-900 dark:text-red-400"
            }`}>
              {diff > 0 ? "+" : ""}{diff.toFixed(1)}
            </span>
          )}
        </div>
      ) : (
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            step="0.1"
            placeholder="e.g. 165"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
          >
            Save
          </button>
        </div>
      )}

      {/* Mini sparkline - last 7 entries */}
      {recent.length >= 2 && (
        <div className="flex items-end gap-1 h-10">
          {(() => {
            const min = Math.min(...recent.map((e) => e.lbs));
            const max = Math.max(...recent.map((e) => e.lbs));
            const range = max - min || 1;
            return recent.map((e) => {
              const pct = ((e.lbs - min) / range) * 100;
              return (
                <div
                  key={e.date}
                  className="flex-1 flex flex-col items-center justify-end"
                  title={`${e.date}: ${e.lbs} lbs`}
                >
                  <div
                    className={`w-full rounded-t-sm ${
                      e.date === today ? "bg-indigo-500" : "bg-indigo-200 dark:bg-indigo-800"
                    }`}
                    style={{ height: `${Math.max(pct, 10)}%` }}
                  />
                </div>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
}