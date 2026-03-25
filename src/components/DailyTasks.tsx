import { useState } from "react";
import { DAILY_TASKS, getTodayCompletions, toggleTask } from "../store/dailyTasks";
import { getToday } from "../engine/scoring";

export default function DailyTasks() {
  const today = getToday();
  const [completed, setCompleted] = useState<string[]>(() => getTodayCompletions(today));

  function handleToggle(taskId: string) {
    setCompleted(toggleTask(today, taskId));
  }

  const earned = DAILY_TASKS.filter((t) => completed.includes(t.id)).reduce(
    (sum, t) => sum + t.points,
    0
  );
  const total = DAILY_TASKS.reduce((sum, t) => sum + t.points, 0);
  const allDone = completed.length === DAILY_TASKS.length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300">Daily Tasks</h3>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Resets each day</p>
        </div>
        <div className="text-right">
          <span className={`text-lg font-bold ${allDone ? "text-green-500" : "text-indigo-600"}`}>
            +{earned}
          </span>
          <span className="text-xs text-gray-400 dark:text-slate-500"> / {total} pts</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${allDone ? "bg-green-400" : "bg-indigo-500"}`}
          style={{ width: `${total > 0 ? (earned / total) * 100 : 0}%` }}
        />
      </div>

      <ul className="space-y-2.5">
        {DAILY_TASKS.map((task) => {
          const done = completed.includes(task.id);
          return (
            <li key={task.id}>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  done
                    ? "bg-indigo-500 border-indigo-500 dark:bg-indigo-600 dark:border-indigo-600"
                    : "border-gray-300 dark:border-slate-600 group-hover:border-indigo-400"
                }`}>
                  {done && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={done}
                  onChange={() => handleToggle(task.id)}
                />
                <span className={`text-sm flex-1 ${done ? "line-through text-gray-400 dark:text-slate-500" : "text-gray-700 dark:text-slate-300"}`}>
                  {task.label}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  done
                    ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400"
                    : "bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400"
                }`}>
                  +{task.points}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {allDone && (
        <p className="mt-4 text-center text-sm text-green-500 font-semibold">
          All done! Great discipline today.
        </p>
      )}
    </div>
  );
}