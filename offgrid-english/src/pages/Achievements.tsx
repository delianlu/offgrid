import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/common/Header';
import { loadAchievements, getAchievementStats, type Achievement } from '../services/achievements';

export function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    setAchievements(loadAchievements());
  }, []);

  const stats = getAchievementStats();

  const filteredAchievements = achievements.filter(a => {
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'locked') return !a.unlocked;
    return true;
  });

  // Group by category
  const groupedAchievements = filteredAchievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const categoryNames: Record<string, string> = {
    practice: 'Practice Milestones',
    mastery: 'Module Mastery',
    accuracy: 'Accuracy Streaks',
    consistency: 'Daily Consistency',
    review: 'Review Champion'
  };

  const categoryIcons: Record<string, string> = {
    practice: '📚',
    mastery: '🏆',
    accuracy: '🎯',
    consistency: '📅',
    review: '📖'
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Achievements" />

      <main className="max-w-6xl mx-auto p-6">
        {/* Stats Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-6 mb-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🏆</div>
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  Your Achievements
                </h2>
                <p className="text-blue-100">
                  Track your progress and unlock rewards
                </p>
              </div>
            </div>
            <div className="text-center bg-white/20 rounded-xl px-6 py-4 backdrop-blur-sm">
              <div className="text-4xl font-bold mb-1">
                {stats.unlocked} / {stats.total}
              </div>
              <div className="text-sm text-blue-100">
                {stats.percentage}% Complete
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 bg-blue-600 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.percentage}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-white rounded-full shadow-lg"
            />
          </div>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 mb-6"
        >
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all active:scale-95 ${
              filter === 'all'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-blue-50 shadow-md'
            }`}
          >
            All ({achievements.length})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all active:scale-95 ${
              filter === 'unlocked'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-green-50 shadow-md'
            }`}
          >
            Unlocked ({stats.unlocked})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all active:scale-95 ${
              filter === 'locked'
                ? 'bg-gray-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
            }`}
          >
            Locked ({stats.total - stats.unlocked})
          </button>
        </motion.div>

        {/* Achievement Categories */}
        {Object.entries(groupedAchievements).map(([category, categoryAchievements], catIndex) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + catIndex * 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{categoryIcons[category]}</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {categoryNames[category]}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + catIndex * 0.1 + index * 0.05 }}
                  className={`rounded-xl p-5 border-2 transition-all ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-yellow-50 to-purple-50 dark:from-yellow-900/20 dark:to-purple-900/20 border-yellow-400 dark:border-yellow-600 shadow-md hover:shadow-lg'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`text-4xl ${achievement.unlocked ? '' : 'grayscale'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {achievement.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {achievement.description}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {!achievement.unlocked && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>
                          {achievement.progress} / {achievement.requirement}
                        </span>
                      </div>
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (achievement.progress / achievement.requirement) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Unlocked Badge */}
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-yellow-700 dark:text-yellow-400">
                      <span className="font-bold">✓ Unlocked</span>
                      <span className="text-gray-500 dark:text-gray-500">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </main>
    </div>
  );
}
