import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getDailyGoalProgress, type DailyGoal } from '../services/dailyGoals';

export function DailyGoals() {
  const [goal, setGoal] = useState<DailyGoal>({
    lessonsCompleted: 0,
    dailyTarget: 5,
    percentage: 0,
    isAchieved: false
  });

  useEffect(() => {
    loadGoal();
  }, []);

  async function loadGoal() {
    const progress = await getDailyGoalProgress();
    setGoal(progress);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-blue-600 dark:to-blue-700 rounded-2xl p-5 shadow-lg dark:shadow-2xl text-white"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-orange-100 dark:text-blue-100 mb-1">
            Daily Goal
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{goal.lessonsCompleted}</span>
            <span className="text-lg text-orange-100 dark:text-blue-100">/ {goal.dailyTarget}</span>
          </div>
          <p className="text-xs text-orange-100 dark:text-blue-100 mt-1">
            {goal.isAchieved ? '🎉 Goal achieved!' : 'lessons today'}
          </p>
        </div>

        {/* Circular Progress */}
        <div className="relative w-16 h-16">
          <svg className="transform -rotate-90" width="64" height="64">
            {/* Background circle */}
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="6"
              fill="none"
            />
            {/* Progress circle */}
            <motion.circle
              cx="32"
              cy="32"
              r="28"
              stroke="white"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDashoffset: 176 }}
              animate={{ strokeDashoffset: 176 - (176 * goal.percentage) / 100 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              strokeDasharray="176"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold">{goal.percentage}%</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-orange-600 dark:bg-blue-800 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${goal.percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="bg-white h-2 rounded-full"
        />
      </div>

      {goal.isAchieved && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          className="mt-3 bg-white/20 dark:bg-white/10 rounded-lg p-2 text-center"
        >
          <p className="text-xs font-semibold">
            🏆 You're on fire! Keep it up!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
