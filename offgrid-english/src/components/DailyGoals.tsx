import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getDailyGoalProgress, type DailyGoal } from '../services/dailyGoals';

export function DailyGoals() {
  const { t } = useTranslation();
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

  const remaining = goal.dailyTarget - goal.lessonsCompleted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-xl p-6 h-full flex flex-col border border-earth-100 hover:border-blue-200 hover:shadow-md transition-all group relative overflow-hidden"
    >
      {/* Pulse Effect Background */}
      {goal.lessonsCompleted === 0 && (
        <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-soft pointer-events-none"></div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors overflow-hidden ${goal.lessonsCompleted === 0 ? 'bg-blue-100 animate-pulse' : 'bg-blue-50'}`}>
          <img src="/assets/ui/daily-goal.png" alt="Daily Goal" className="w-[140%] h-[140%] max-w-none object-cover translate-x-1 translate-y-1" />
        </div>
        <div>
          <h3 className="font-bold text-earth-900 group-hover:text-blue-700 transition-colors">{t('quickAccess.dailyGoal.title')}</h3>
          <p className="text-sm text-earth-600">{t('quickAccess.dailyGoal.subtitle', { percent: goal.percentage })}</p>
        </div>
      </div>

      {/* Progress Info */}
      <div className="mb-4 flex-grow relative z-10">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-earth-700">{t('quickAccess.dailyGoal.progress')}</span>
          <span className="font-bold text-blue-600">{goal.lessonsCompleted}/{goal.dailyTarget}</span>
        </div>
        <div className="bg-earth-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${goal.percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-full h-3 transition-all duration-500 relative"
          >
            {/* Shimmer effect on bar */}
            <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite] skew-x-12"></div>
          </motion.div>
        </div>
      </div>

      {/* Motivation Text */}
      <div className="relative z-10">
        {!goal.isAchieved && remaining > 0 && (
          <p className={`text-sm ${goal.lessonsCompleted === 0 ? 'text-blue-600 font-semibold animate-pulse' : 'text-earth-600'}`}>
            {goal.lessonsCompleted === 0
              ? "Start your first lesson today!"
              : `${remaining} ${t('quickAccess.dailyGoal.moreToGo')}`
            }
          </p>
        )}

        {goal.isAchieved && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className="bg-green-50 rounded-lg p-2 text-center border border-green-100"
          >
            <p className="text-sm font-bold text-green-700 flex items-center justify-center gap-2">
              🏆 {t('dailyGoals.completed')}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
