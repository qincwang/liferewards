import type { Category } from "../types";
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_LABELS } from "../types";
import { CATEGORY_DAILY_CAP } from "../engine/rules";

interface ScoreCardProps {
  category: Category;
  score: number;
  streak: number;
}

export default function ScoreCard({ category, score, streak }: ScoreCardProps) {
  const cap = CATEGORY_DAILY_CAP[category];
  const isHabits = category === "habits";
  const pct = cap ? Math.min(Math.max((score / cap) * 100, 0), 100) : 0;
  const isNegative = score < 0;

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 ${isNegative ? "border-red-100" : "border-gray-100"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">
          {CATEGORY_ICONS[category]} {CATEGORY_LABELS[category]}
        </span>
        {streak > 0 && (
          <span className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
            {streak}d
          </span>
        )}
      </div>
      <div className={`text-2xl font-bold mb-2 ${isNegative ? "text-red-500" : "text-gray-800"}`}>
        {isNegative ? "" : score > 0 && isHabits ? "+" : ""}{score}
        <span className="text-xs font-normal text-gray-400 ml-1">pts</span>
      </div>
      {!isHabits && cap && (
        <>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`${CATEGORY_COLORS[category]} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1 text-right">{cap} max</div>
        </>
      )}
    </div>
  );
}
