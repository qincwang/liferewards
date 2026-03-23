import { useState } from "react";
import type { LogEntry } from "../types";
import { CATEGORY_ICONS } from "../types";
import { ACTIVITIES_BY_ID } from "../engine/activities";

interface ActivityHistoryProps {
  entries: LogEntry[];
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<Pick<LogEntry, "duration" | "note" | "category" | "activityId" | "mealType">>) => void;
}

const MEAL_LABELS: Record<string, string> = { clean: "🥗 Clean", regular: "🍽️ Regular", heavy: "🍔 Heavy" };

function entryLabel(entry: LogEntry): string {
  if (entry.activityId) {
    const def = ACTIVITIES_BY_ID.get(entry.activityId);
    if (def) {
      if (def.isMeal && entry.mealType) return `${def.label} – ${MEAL_LABELS[entry.mealType] ?? entry.mealType}`;
      return def.label;
    }
  }
  return entry.category.charAt(0).toUpperCase() + entry.category.slice(1);
}

interface GroupedEntries {
  date: string;
  entries: LogEntry[];
}

function groupByDate(entries: LogEntry[]): GroupedEntries[] {
  const map = new Map<string, LogEntry[]>();
  for (const entry of entries) {
    const list = map.get(entry.date) ?? [];
    list.push(entry);
    map.set(entry.date, list);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, entries]) => ({ date, entries }));
}

function formatDate(dateStr: string): string {
  const today = new Date().toISOString().slice(0, 10);
  if (dateStr === today) return "Today";
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === yesterday.toISOString().slice(0, 10)) return "Yesterday";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function ActivityHistory({ entries, onDelete, onEdit }: ActivityHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDuration, setEditDuration] = useState("");
  const [editNote, setEditNote] = useState("");

  const groups = groupByDate(entries);

  function startEdit(entry: LogEntry) {
    setEditingId(entry.id);
    setEditDuration(String(entry.duration));
    setEditNote(entry.note ?? "");
  }

  function saveEdit(id: string, entry: LogEntry) {
    if (entry.duration > 0) {
      const dur = parseInt(editDuration, 10);
      if (!dur || dur <= 0) return;
      onEdit(id, { duration: dur, note: editNote || undefined });
    } else {
      onEdit(id, { note: editNote || undefined });
    }
    setEditingId(null);
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
        No activities logged yet. Start tracking!
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Activity History</h2>
      <div className="space-y-5">
        {groups.map(({ date, entries: dayEntries }) => (
          <div key={date}>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              {formatDate(date)}
            </div>
            <div className="space-y-2">
              {dayEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 group"
                >
                  {editingId === entry.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <span>{CATEGORY_ICONS[entry.category]}</span>
                      {entry.duration > 0 && (
                        <>
                          <input
                            type="number"
                            value={editDuration}
                            onChange={(e) => setEditDuration(e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
                            min="1"
                          />
                          <span className="text-xs text-gray-400">min</span>
                        </>
                      )}
                      <input
                        type="text"
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        placeholder="Note"
                        className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm"
                      />
                      <button
                        onClick={() => saveEdit(entry.id, entry)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span>{CATEGORY_ICONS[entry.category]}</span>
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            {entryLabel(entry)}
                          </span>
                          {entry.duration > 0 && (
                            <span className="text-sm text-gray-500 ml-2">
                              {entry.duration} min
                            </span>
                          )}
                          {entry.note && (
                            <span className="text-xs text-gray-400 ml-2">
                              — {entry.note}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(entry)}
                          className="text-xs text-gray-400 hover:text-indigo-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(entry.id)}
                          className="text-xs text-gray-400 hover:text-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
