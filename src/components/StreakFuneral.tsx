import type { StreakFuneral } from "../hooks/useStreakFunerals";

interface Props {
  funeral: StreakFuneral;
  onDismiss: () => void;
}

function formatDateShort(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function StreakFuneralModal({ funeral, onDismiss }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onDismiss}
      />

      {/* Card */}
      <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-[slide-up_0.35s_ease-out]">
        {/* Dark gradient header */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-800 px-6 pt-8 pb-6 text-center">
          {/* Tombstone */}
          <div className="text-7xl mb-3 select-none">🪦</div>

          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
            In Loving Memory
          </p>

          <h2 className="text-2xl font-black text-white leading-tight mb-1">
            {funeral.icon} {funeral.streakDays}-Day {funeral.label} Streak
          </h2>

          <p className="text-sm text-slate-400">
            {formatDateShort(funeral.startDate)} – {formatDateShort(funeral.endDate)}
          </p>
        </div>

        {/* Epitaph */}
        <div className="bg-slate-800 px-6 py-5 text-center border-t border-slate-700">
          <p className="text-slate-300 italic text-sm leading-relaxed">
            "{funeral.epitaph}"
          </p>
        </div>

        {/* Footer */}
        <div className="bg-slate-900 px-6 pb-6 pt-4 flex flex-col items-center gap-2">
          <button
            onClick={onDismiss}
            className="w-full py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all text-white font-bold text-sm tracking-wide"
          >
            🫡 &nbsp;Press F to Pay Respects
          </button>
          <p className="text-xs text-slate-600">You can do better tomorrow.</p>
        </div>
      </div>
    </div>
  );
}
