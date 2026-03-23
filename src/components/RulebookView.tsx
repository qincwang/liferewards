import { ACTIVITIES } from "../engine/activities";
import { RANK_DEFINITIONS } from "../engine/ranks";
import { BALANCE_BONUS, CATEGORY_DAILY_CAP, STREAK_THRESHOLDS } from "../engine/rules";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "../types";
import type { Category, Rating } from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RATING_STYLES: Record<Rating, { badge: string; label: string }> = {
  D:   { badge: "bg-gray-100   dark:bg-slate-800  text-gray-500  dark:text-slate-400  border-gray-200  dark:border-slate-600",  label: "D" },
  C:   { badge: "bg-green-50   dark:bg-green-950  text-green-700 dark:text-green-400  border-green-200 dark:border-green-800",  label: "C" },
  B:   { badge: "bg-blue-50    dark:bg-blue-950   text-blue-700  dark:text-blue-400   border-blue-200  dark:border-blue-800",   label: "B" },
  A:   { badge: "bg-purple-50  dark:bg-purple-950 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800", label: "A" },
  S:   { badge: "bg-amber-50   dark:bg-amber-950  text-amber-700 dark:text-amber-400  border-amber-300 dark:border-amber-700",  label: "S" },
  SS:  { badge: "bg-orange-50  dark:bg-orange-950 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700", label: "SS" },
  SSS: { badge: "bg-yellow-50  dark:bg-yellow-950 text-yellow-700 dark:text-yellow-500 border-yellow-400 dark:border-yellow-600", label: "SSS" },
};

const DURATION_CATEGORIES: Category[] = ["workout", "work", "reading", "music"];

// Group duration activities by category, sorted by pts desc
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
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
        <h2 className="text-sm font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RulebookView() {
  return (
    <div className="space-y-4">

      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
        <p className="text-lg font-bold mb-1">📖 Rule Book</p>
        <p className="text-sm opacity-80 leading-relaxed">
          Every activity earns points. Points accumulate daily and weekly — hit all conditions for a rating tier to rank up.
        </p>
      </div>

      {/* Activities & Points */}
      <Section title="Activities & Points">
        <div className="space-y-5">
          {activitiesByCategory.map(({ cat, activities }) => {
            const cap = CATEGORY_DAILY_CAP[cat];
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                    {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-slate-500">
                    {cap ? `${cap} pts / day cap` : "no daily cap"}
                  </span>
                </div>
                <div className="space-y-1">
                  {activities.map((a) => (
                    <div key={a.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                      <span className="text-sm text-gray-700 dark:text-slate-300">{a.label}</span>
                      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                        {a.pointsPerMinute} pt{a.pointsPerMinute !== 1 ? "s" : ""}/min
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Habits */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                {CATEGORY_ICONS["habits"]} Habits
              </span>
              <span className="text-xs text-gray-400 dark:text-slate-500">no daily cap</span>
            </div>
            <div className="space-y-1">
              {habitActivities.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className="text-sm text-gray-700 dark:text-slate-300">{a.label}</span>
                  <span className="text-sm font-semibold text-pink-600 dark:text-pink-400 tabular-nums">+{a.flatPoints} pts flat</span>
                </div>
              ))}
              {/* Meals inline */}
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <span className="text-sm text-gray-700 dark:text-slate-300">Meal — Clean</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">+15 pts flat</span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <span className="text-sm text-gray-700 dark:text-slate-300">Meal — Regular</span>
                <span className="text-sm font-semibold text-gray-400 dark:text-slate-500 tabular-nums">0 pts</span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <span className="text-sm text-gray-700 dark:text-slate-300">Meal — Heavy (1st & 2nd/week)</span>
                <span className="text-sm font-semibold text-gray-400 dark:text-slate-500 tabular-nums">0 pts</span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <span className="text-sm text-gray-700 dark:text-slate-300">Meal — Heavy (3rd+ this week)</span>
                <span className="text-sm font-semibold text-red-500 dark:text-red-400 tabular-nums">−20 pts</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Streak Multipliers */}
      <Section title="Streak Multipliers">
        <p className="text-xs text-gray-500 dark:text-slate-400 mb-3 leading-relaxed">
          Log an activity in a category on consecutive days to earn a multiplier. Applied per-category before the daily cap.
        </p>
        <div className="space-y-1">
          {[...STREAK_THRESHOLDS].reverse().map(({ days, multiplier }, i) => {
            const nextDays = i < STREAK_THRESHOLDS.length - 1
              ? [...STREAK_THRESHOLDS].reverse()[i + 1].days - 1
              : STREAK_THRESHOLDS[0].days - 1;
            const rangeLabel = i === [...STREAK_THRESHOLDS].reverse().length - 1
              ? `${days}+ days`
              : `${days}–${nextDays} days`;
            return (
              <div key={days} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <span className="text-sm text-gray-700 dark:text-slate-300">🔥 {rangeLabel}</span>
                <span className="text-sm font-bold text-orange-500 dark:text-orange-400 tabular-nums">×{multiplier}</span>
              </div>
            );
          })}
          <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-slate-800">
            <span className="text-sm text-gray-700 dark:text-slate-300">No streak</span>
            <span className="text-sm font-bold text-gray-400 dark:text-slate-500 tabular-nums">×1.0</span>
          </div>
        </div>
      </Section>

      {/* Balance Bonus */}
      <Section title="Balance Bonus">
        <div className="flex items-center gap-4 py-2 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900">
          <span className="text-2xl">⚖️</span>
          <div>
            <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">+{BALANCE_BONUS} pts bonus</p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
              Log at least one session in <strong>Workout</strong>, <strong>Work</strong>, and <strong>Reading</strong> on the same day.
            </p>
          </div>
        </div>
      </Section>

      {/* Weekly Rankings */}
      <Section title="Weekly Rankings">
        <p className="text-xs text-gray-500 dark:text-slate-400 mb-4 leading-relaxed">
          Your rank resets every Monday. Every condition for a tier must be met during the week — points alone don't grant rank.
        </p>

        {/* D rank */}
        <div className="mb-3 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-slate-800">
            <span className={`text-base font-black px-2.5 py-1 rounded-lg border ${RATING_STYLES["D"].badge}`}>D</span>
            <span className="text-sm text-gray-500 dark:text-slate-400 italic">No conditions required</span>
          </div>
        </div>

        {RANK_DEFINITIONS.map((rank) => (
          <div key={rank.rating} className="mb-3 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-slate-700`}>
              <span className={`text-base font-black px-2.5 py-1 rounded-lg border ${RATING_STYLES[rank.rating].badge}`}>
                {rank.rating}
              </span>
              <span className="text-xs text-gray-400 dark:text-slate-500">
                {rank.conditions.length} condition{rank.conditions.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-slate-800">
              {rank.conditions.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm text-gray-700 dark:text-slate-300">{c.label}</span>
                  <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {c.format ? c.format(c.required) : `${c.required}`}
                    {" "}{c.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Section>

    </div>
  );
}
