import { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList } from "react-native";
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
      <View className="bg-white rounded-2xl border border-gray-100 p-8 items-center">
        <Text className="text-gray-400">No activities logged yet. Start tracking!</Text>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <Text className="text-lg font-semibold text-gray-800 mb-4">Activity History</Text>
      {groups.map(({ date, entries: dayEntries }) => (
        <View key={date} className="mb-5">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            {formatDate(date)}
          </Text>
          {dayEntries.map((entry) => (
            <View
              key={entry.id}
              className="flex-row items-center justify-between py-2 px-3 rounded-lg mb-1 bg-gray-50"
            >
              {editingId === entry.id ? (
                <View className="flex-row items-center gap-2 flex-1">
                  <Text>{CATEGORY_ICONS[entry.category]}</Text>
                  {entry.duration > 0 && (
                    <TextInput
                      value={editDuration}
                      onChangeText={setEditDuration}
                      keyboardType="numeric"
                      className="w-16 px-2 py-1 border border-gray-200 rounded text-sm bg-white text-gray-800"
                    />
                  )}
                  <TextInput
                    value={editNote}
                    onChangeText={setEditNote}
                    placeholder="Note"
                    className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm bg-white text-gray-800"
                  />
                  <TouchableOpacity onPress={() => saveEdit(entry.id, entry)}>
                    <Text className="text-xs text-indigo-600 font-medium">Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setEditingId(null)}>
                    <Text className="text-xs text-gray-400">Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View className="flex-row items-center gap-3 flex-1">
                    <Text>{CATEGORY_ICONS[entry.category]}</Text>
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-gray-700">
                        {entryLabel(entry)}
                        {entry.duration > 0 && (
                          <Text className="text-sm text-gray-500"> · {entry.duration} min</Text>
                        )}
                      </Text>
                      {entry.note && (
                        <Text className="text-xs text-gray-400">— {entry.note}</Text>
                      )}
                    </View>
                  </View>
                  <View className="flex-row gap-3">
                    <TouchableOpacity onPress={() => startEdit(entry)}>
                      <Text className="text-xs text-gray-400">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete(entry.id)}>
                      <Text className="text-xs text-red-400">Delete</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
