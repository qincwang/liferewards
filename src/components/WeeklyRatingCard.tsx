import type { ConditionProgress, WeeklyRating } from "../types";
import type { Rating } from "../types";

interface WeeklyRatingCardProps {
  weeklyRating: WeeklyRating;
}

const RATING_STYLES: Record<Rating, { badge: string; bar: string; glow: string }> = {
  D:   { badge: "text-gray-400  bg-gray-100   border-gray-200",   bar: "bg-gray-400",                                      glow: "" },
  C:   { badge: "text-green-600 bg-green-50   border-green-200",  bar: "bg-green-500",                                     glow: "" },
  B:   { badge: "text-blue-600  bg-blue-50    border-blue-200",   bar: "bg-blue-500",                                      glow: "" },
  A:   { badge: "text-purple-600 bg-purple-50 border-purple-200", bar: "bg-purple-500",                                    glow: "" },
  S:   { badge: "text-amber-600  bg-amber-50  border-amber-300",  bar: "bg-amber-500",                                     glow: "shadow-md shadow-amber-100" },
  SS:  { badge: "text-orange-600 bg-orange-50 border-orange-300", bar: "bg-orange-500",                                    glow: "shadow-md shadow-orange-100" },
  SSS: { badge: "text-yellow-700 bg-yellow-50 border-yellow-400", bar: "bg-gradient-to-r from-yellow-400 to-amber-500",   glow: "shadow-lg shadow-yellow-200" },
};

const NEXT_RANK: Record<Rating, string> = {
  D: "C", C: "B", B: "A", A: "S", S: "SS", SS: "SSS", SSS: "MAX",
};

function ConditionRow({ c }: { c: ConditionProgress }) {
  const pct = Math.min((c.current / c.required) * 100, 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-0.5">
        <span className={`text-xs ${c.met ? "text-gray-400 line-through" : "text-gray-600"}`}>
          {c.label}
        </span>
        <span className={`text-xs font-medium ${c.met ? "text-emerald-600" : "text-gray-500"}`}>
          {c.met ? "✓" : `${c.displayCurrent} / ${c.displayRequired} ${c.unit}`}
        </span>
      </div>
      {!c.met && (
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-400 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function WeeklyRatingCard({ weeklyRating }: WeeklyRatingCardProps) {
  const { rating, weeklyTotal, nextConditions } = weeklyRating;
  const style = RATING_STYLES[rating];
  const isMax = rating === "SSS";
  const unmetCount = nextConditions.filter((c) => !c.met).length;

  return (
    <div className={`rounded-2xl border p-5 bg-white ${style.glow}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Weekly Rating</p>
          <p className="text-xs text-gray-400 mt-0.5">{weeklyTotal.toLocaleString()} pts this week</p>
        </div>
        <div className={`text-4xl font-black leading-none px-4 py-2 rounded-xl border ${style.badge}`}>
          {rating}
        </div>
      </div>

      {!isMax && nextConditions.length > 0 && (
        <div className="border-t border-gray-100 pt-3 space-y-2.5">
          <p className="text-xs font-semibold text-gray-500">
            {unmetCount === 0
              ? `✓ All conditions met for ${NEXT_RANK[rating]}!`
              : `${unmetCount} condition${unmetCount > 1 ? "s" : ""} needed for ${NEXT_RANK[rating]}`}
          </p>
          {nextConditions.map((c) => (
            <ConditionRow key={c.id} c={c} />
          ))}
        </div>
      )}

      {isMax && (
        <div className="border-t border-yellow-100 pt-3">
          <p className="text-xs text-yellow-600 font-semibold text-center">👑 Maximum rank achieved</p>
        </div>
      )}
    </div>
  );
}
