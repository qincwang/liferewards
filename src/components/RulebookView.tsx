import { View, Text } from "react-native";
import { ACTIVITIES } from "../engine/activities";
import { RANK_DEFINITIONS } from "../engine/ranks";
import { BALANCE_BONUS, CATEGORY_DAILY_CAP, STREAK_THRESHOLDS } from "../engine/rules";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "../types";
import type { Category, Rating } from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RATING_STYLES: Record<Rating, { bg: string; text: string; border: string }> = {
  D:   { bg: "bg-gray-100",   text: "text-gray-500",   border: "border-gray-200"   },
  C:   { bg: "bg-green-50",   text: "text-green-700",  border: "border-green-200"  },
  B:   { bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200"   },
  A:   { bg: "bg-purple-50",  text: "text-purple-700", border: "border-purple-200" },
  S:   { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-300"  },
  SS:  { bg: "bg-orange-50",  text: "text-orange-700", border: "border-orange-300" },
  SSS: { bg: "bg-yellow-50",  text: "text-yellow-700", border: "border-yellow-400" },
};

const DURATION_CATEGORIES: Category[] = ["workout", "work", "reading", "music"];

const activitiesByCategory = DURATION_CATEGORIES.map((cat) => ({
  cat,
  activities: ACTIVITIES
    .filter((a) => a.category === cat && a.type === "duration")
    .sort((a, b) => (b.pointsPerMinute ?? 0) - (a.pointsPerMinute ?? 0)),
}));

const habitActivities = ACTIVITIES.filter(
  (a) => a.category === "habits" && a.type === "habit" && !a.isMeal
);

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <View className="px-5 py-3 border-b border-gray-100 bg-gray-50">
        <Text className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</Text>
      </View>
      <View className="p-5">{children}</View>
    </View>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RulebookView() {
  return (
    <View className="gap-y-4">

      {/* Hero */}
      <View className="bg-indigo-600 rounded-2xl p-5 shadow-lg">
        <Text className="text-lg font-bold text-white mb-1">📖 Rule Book</Text>
        <Text className="text-sm text-white/80 leading-relaxed">
          Every activity earns points. Points accumulate daily and weekly — hit all conditions for a rating tier to rank up.
        </Text>
      </View>

      {/* Activities & Points */}
      <Section title="Activities & Points">
        <View className="gap-y-5">
          {activitiesByCategory.map(({ cat, activities }) => {
            const cap = CATEGORY_DAILY_CAP[cat];
            return (
              <View key={cat}>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-semibold text-gray-700">
                    {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {cap ? `${cap} pts / day cap` : "no daily cap"}
                  </Text>
                </View>
                <View className="gap-y-1">
                  {activities.map((a) => (
                    <View key={a.id} className="flex-row items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50">
                      <Text className="text-sm text-gray-700">{a.label}</Text>
                      <Text className="text-sm font-semibold text-indigo-600">
                        {a.pointsPerMinute} pt{a.pointsPerMinute !== 1 ? "s" : ""}/min
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}

          {/* Habits */}
          <View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-semibold text-gray-700">
                {CATEGORY_ICONS["habits"]} Habits
              </Text>
              <Text className="text-xs text-gray-400">no daily cap</Text>
            </View>
            <View className="gap-y-1">
              {habitActivities.map((a) => (
                <View key={a.id} className="flex-row items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50">
                  <Text className="text-sm text-gray-700">{a.label}</Text>
                  <Text className="text-sm font-semibold text-pink-600">+{a.flatPoints} pts flat</Text>
                </View>
              ))}
              <View className="flex-row items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50">
                <Text className="text-sm text-gray-700">Meal — Clean</Text>
                <Text className="text-sm font-semibold text-emerald-600">+15 pts flat</Text>
              </View>
              <View className="flex-row items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50">
                <Text className="text-sm text-gray-700">Meal — Regular</Text>
                <Text className="text-sm font-semibold text-gray-400">0 pts</Text>
              </View>
              <View className="flex-row items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50">
                <Text className="text-sm text-gray-700">Meal — Heavy (1st & 2nd/week)</Text>
                <Text className="text-sm font-semibold text-gray-400">0 pts</Text>
              </View>
              <View className="flex-row items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50">
                <Text className="text-sm text-gray-700">Meal — Heavy (3rd+ this week)</Text>
                <Text className="text-sm font-semibold text-red-500">−20 pts</Text>
              </View>
            </View>
          </View>
        </View>
      </Section>

      {/* Streak Multipliers */}
      <Section title="Streak Multipliers">
        <Text className="text-xs text-gray-500 mb-3 leading-relaxed">
          Log an activity in a category on consecutive days to earn a multiplier. Applied per-category before the daily cap.
        </Text>
        <View className="gap-y-1">
          {[...STREAK_THRESHOLDS].reverse().map(({ days, multiplier }, i) => {
            const nextDays = i < STREAK_THRESHOLDS.length - 1
              ? [...STREAK_THRESHOLDS].reverse()[i + 1].days - 1
              : STREAK_THRESHOLDS[0].days - 1;
            const rangeLabel = i === [...STREAK_THRESHOLDS].reverse().length - 1
              ? `${days}+ days`
              : `${days}–${nextDays} days`;
            return (
              <View key={days} className="flex-row items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50">
                <Text className="text-sm text-gray-700">🔥 {rangeLabel}</Text>
                <Text className="text-sm font-bold text-orange-500">×{multiplier}</Text>
              </View>
            );
          })}
          <View className="flex-row items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50">
            <Text className="text-sm text-gray-700">No streak</Text>
            <Text className="text-sm font-bold text-gray-400">×1.0</Text>
          </View>
        </View>
      </Section>

      {/* Balance Bonus */}
      <Section title="Balance Bonus">
        <View className="flex-row items-center gap-4 py-2 px-3 rounded-lg bg-indigo-50 border border-indigo-100">
          <Text className="text-2xl">⚖️</Text>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-indigo-800">+{BALANCE_BONUS} pts bonus</Text>
            <Text className="text-xs text-indigo-600 mt-0.5">
              Log at least one session in Workout, Work, and Reading on the same day.
            </Text>
          </View>
        </View>
      </Section>

      {/* Weekly Rankings */}
      <Section title="Weekly Rankings">
        <Text className="text-xs text-gray-500 mb-4 leading-relaxed">
          Your rank resets every Monday. Every condition for a tier must be met during the week — points alone don't grant rank.
        </Text>

        {/* D rank */}
        <View className="mb-3 rounded-xl border border-gray-100 overflow-hidden">
          <View className="flex-row items-center gap-3 px-4 py-3 bg-gray-50">
            <View className={`px-2.5 py-1 rounded-lg border ${RATING_STYLES["D"].bg} ${RATING_STYLES["D"].border}`}>
              <Text className={`text-base font-black ${RATING_STYLES["D"].text}`}>D</Text>
            </View>
            <Text className="text-sm text-gray-500 italic">No conditions required</Text>
          </View>
        </View>

        {RANK_DEFINITIONS.map((rank) => (
          <View key={rank.rating} className="mb-3 rounded-xl border border-gray-100 overflow-hidden">
            <View className="flex-row items-center gap-3 px-4 py-3 border-b border-gray-100">
              <View className={`px-2.5 py-1 rounded-lg border ${RATING_STYLES[rank.rating].bg} ${RATING_STYLES[rank.rating].border}`}>
                <Text className={`text-base font-black ${RATING_STYLES[rank.rating].text}`}>
                  {rank.rating}
                </Text>
              </View>
              <Text className="text-xs text-gray-400">
                {rank.conditions.length} condition{rank.conditions.length > 1 ? "s" : ""}
              </Text>
            </View>
            <View>
              {rank.conditions.map((c) => (
                <View key={c.id} className="flex-row items-center justify-between px-4 py-2.5 border-b border-gray-50">
                  <Text className="text-sm text-gray-700 flex-1 mr-4">{c.label}</Text>
                  <Text className="text-sm font-semibold text-indigo-600">
                    {c.format ? c.format(c.required) : `${c.required}`} {c.unit}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </Section>

    </View>
  );
}
