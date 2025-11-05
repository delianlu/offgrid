import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getWeeklySummary, type WeeklySummary as WeeklySummaryType } from '../services/weeklySummary';

export function WeeklySummary() {
  const [summary, setSummary] = useState<WeeklySummaryType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    const data = await getWeeklySummary();
    setSummary(data);
    setLoading(false);
  }

  if (loading || !summary) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-2xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  const maxLessons = Math.max(...summary.dailyActivities.map(d => d.lessonsCompleted), 1);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">Weekly Summary</h3>
          <p className="text-sm text-gray-600 dark:text-slate-300">{summary.weekStartDate} - {summary.weekEndDate}</p>
        </div>
        <div className="text-3xl">📊</div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-4 border-l-4 border-orange-500 dark:border-orange-400">
          <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">{summary.totalLessons}</div>
          <div className="text-xs text-gray-600 dark:text-slate-300 mt-1">Lessons</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border-l-4 border-green-500 dark:border-emerald-400">
          <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">{summary.averageAccuracy}%</div>
          <div className="text-xs text-gray-600 dark:text-slate-300 mt-1">Accuracy</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border-l-4 border-purple-500 dark:border-purple-400">
          <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">{summary.currentStreak}</div>
          <div className="text-xs text-gray-600 dark:text-slate-300 mt-1">Day Streak</div>
        </div>
      </div>

      {/* Activity Chart */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Daily Activity</h4>
        <div className="flex items-end justify-between gap-2 h-32">
          {summary.dailyActivities.map((day, idx) => {
            const heightPercent = maxLessons > 0 ? (day.lessonsCompleted / maxLessons) * 100 : 0;
            const isBestDay = summary.bestDay?.day === day.day && summary.bestDay?.date === day.date;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col justify-end h-24">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className={`w-full rounded-t-lg ${
                      isBestDay
                        ? 'bg-gradient-to-t from-orange-500 to-orange-400 dark:from-blue-500 dark:to-blue-400'
                        : day.lessonsCompleted > 0
                        ? 'bg-gradient-to-t from-green-500 to-green-400 dark:from-emerald-500 dark:to-emerald-400'
                        : 'bg-gray-200 dark:bg-slate-700'
                    }`}
                    title={`${day.date}: ${day.lessonsCompleted} lessons, ${day.accuracy}% accuracy`}
                  >
                    {day.lessonsCompleted > 0 && (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-xs font-bold text-white">
                          {day.lessonsCompleted}
                        </span>
                      </div>
                    )}
                  </motion.div>
                </div>
                <div className="text-xs font-medium text-gray-600 dark:text-slate-300">{day.day}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Best Day Highlight */}
      {summary.bestDay && summary.bestDay.lessonsCompleted > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-l-4 border-orange-500 dark:border-orange-400 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">Best Day: {summary.bestDay.day}</p>
              <p className="text-xs text-gray-600 dark:text-slate-300">
                {summary.bestDay.lessonsCompleted} lessons completed with {summary.bestDay.accuracy}% accuracy
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
