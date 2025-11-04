import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import { DarkModeToggle } from './components/DarkModeToggle';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Onboarding } from './components/Onboarding';
import { motion } from 'framer-motion';
import { calculateModuleProgress } from './services/progressTracking';

export const APP_VERSION = '2.0.0';

const MODULES = [
  { id: 'tense-form', name: 'Tense & Form', items: 50, icon: '⏰', color: 'from-orange-400 to-orange-500' },
  { id: 'subject-verb-agreement', name: 'Subject-Verb', items: 40, icon: '🤝', color: 'from-orange-500 to-orange-600' },
  { id: 'prepositions', name: 'Prepositions', items: 30, icon: '📍', color: 'from-amber-400 to-amber-500' },
  { id: 'word-order', name: 'Word Order', items: 30, icon: '🔤', color: 'from-orange-400 to-amber-500' },
  { id: 'plurality', name: 'Plurality', items: 20, icon: '👥', color: 'from-amber-500 to-orange-500' },
  { id: 'articles', name: 'Articles', items: 20, icon: '📰', color: 'from-orange-500 to-amber-600' },
  { id: 'auxiliaries', name: 'Auxiliaries', items: 20, icon: '🔧', color: 'from-amber-400 to-orange-400' },
  { id: 'cameroonian-scenarios', name: 'Real Scenarios', items: 69, icon: '🏪', color: 'from-orange-600 to-amber-600' },
  { id: 'false-cognates', name: 'False Friends', items: 50, icon: '🔄', color: 'from-amber-500 to-orange-600' },
];

interface ModuleProgress {
  completion: number;
  badge: string;
}

export default function App() {
  const [streakDays, setStreakDays] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [moduleProgress, setModuleProgress] = useState<Record<string, ModuleProgress>>({});

  useEffect(() => {
    try { void import("./services/contentLoader").then(m=>m.ensureSeedContent(APP_VERSION)).catch(()=>{}); } catch {}

    // Load streak and XP
    (async () => {
      const { loadChallengeStats } = await import('./services/challenges');
      const stats = loadChallengeStats();
      setStreakDays(stats.currentDailyStreak);

      // Calculate total XP (each question = 10 XP)
      let xp = 0;
      const progressData: Record<string, ModuleProgress> = {};

      for (const module of MODULES) {
        const progress = await calculateModuleProgress(module.id);
        if (progress) {
          progressData[module.id] = {
            completion: progress.overallCompletion,
            badge: progress.badge
          };
          xp += Math.round((progress.overallCompletion / 100) * module.items * 10);
        }
      }
      setTotalXP(xp);
      setModuleProgress(progressData);
    })();
  }, []);

  return (
    <>
      <Onboarding />
      <PWAInstallPrompt />
      <OfflineIndicator />

      {/* Warm Background */}
      <div className="min-h-screen bg-amber-50 dark:bg-gray-900">

        {/* Top Header - Duolingo Style */}
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="text-4xl">📚</div>
                <div>
                  <h1 className="text-xl font-black text-gray-800 dark:text-gray-100">OffGrid English</h1>
                </div>
              </div>

              {/* Streak & XP */}
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-2xl cursor-pointer shadow-md hover:shadow-lg transition-shadow"
                >
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-2xl"
                  >
                    🔥
                  </motion.span>
                  <div className="text-left">
                    <div className="text-xs text-orange-600 dark:text-orange-400 font-bold">STREAK</div>
                    <motion.div
                      key={streakDays}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-lg font-black text-orange-700 dark:text-orange-300"
                    >
                      {streakDays}
                    </motion.div>
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-2xl cursor-pointer shadow-md hover:shadow-lg transition-shadow"
                >
                  <motion.span
                    animate={{ rotate: [0, 20, -20, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-2xl"
                  >
                    ⭐
                  </motion.span>
                  <div className="text-left">
                    <div className="text-xs text-yellow-600 dark:text-yellow-400 font-bold">XP</div>
                    <motion.div
                      key={totalXP}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-lg font-black text-yellow-700 dark:text-yellow-300"
                    >
                      {totalXP}
                    </motion.div>
                  </div>
                </motion.div>
                <DarkModeToggle />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">

          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
              Welcome back! 👋
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Choose a lesson to continue your learning journey
            </p>
          </div>

          {/* Smart Practice CTA - Duolingo Style */}
          <Link to="/smart-practice">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="mb-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-8 text-white shadow-xl cursor-pointer relative overflow-hidden"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute top-0 right-0 text-[120px] opacity-20 -mr-4 -mt-4"
              >
                🧠
              </motion.div>
              <div className="relative z-10">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="inline-block bg-white/30 px-3 py-1 rounded-full text-xs font-bold mb-3 shadow-md"
                >
                  ✨ RECOMMENDED
                </motion.div>
                <h3 className="text-2xl font-black mb-2">Smart Practice</h3>
                <p className="text-white/90 mb-4 max-w-xl">
                  Smart practice that adapts to you 🎯
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-2xl font-black shadow-lg"
                >
                  <span>Start Lesson</span>
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    →
                  </motion.span>
                </motion.div>
              </div>
            </motion.div>
          </Link>

          {/* Learning Path Title */}
          <div className="mb-6">
            <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100">
              Grammar Topics
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Pick one to practice 👇
            </p>
          </div>

          {/* Learning Path - Card Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {MODULES.map((module, idx) => {
              const progress = moduleProgress[module.id];
              const completion = progress?.completion || 0;
              const isLocked = progress?.badge === 'locked';
              const isComplete = completion === 100;

              return (
                <Link
                  key={module.id}
                  to={isLocked ? '#' : `/learn/${module.id}`}
                  className={isLocked ? 'pointer-events-none' : ''}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={!isLocked ? { y: -8, scale: 1.02 } : {}}
                    whileTap={!isLocked ? { scale: 0.98 } : {}}
                    className={`relative bg-white dark:bg-gray-800 rounded-3xl p-6 border-4 shadow-lg transition-all ${
                      isLocked
                        ? 'border-gray-300 dark:border-gray-700 opacity-60'
                        : isComplete
                        ? 'border-green-500 dark:border-green-600'
                        : 'border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:border-orange-300'
                    }`}
                  >
                    {/* Completion Badge */}
                    {isComplete && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: idx * 0.05 + 0.3 }}
                        className="absolute -top-3 -right-3 bg-gradient-to-br from-green-500 to-green-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-xl border-4 border-white dark:border-gray-900"
                      >
                        <motion.span
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          ✓
                        </motion.span>
                      </motion.div>
                    )}

                    {/* Icon Circle */}
                    <div className="flex items-start justify-between mb-4">
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className={`w-16 h-16 rounded-full bg-gradient-to-br ${module.color} flex items-center justify-center text-3xl shadow-lg`}
                      >
                        {module.icon}
                      </motion.div>

                      {isLocked && (
                        <motion.div
                          animate={{ rotate: [0, -5, 5, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                          className="text-3xl"
                        >
                          🔒
                        </motion.div>
                      )}
                    </div>

                    {/* Module Info */}
                    <h4 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2">
                      {module.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {module.items} lessons
                    </p>

                    {/* Progress Bar - Duolingo Style */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-gray-500 dark:text-gray-400">Progress</span>
                        <span className={`${
                          isComplete
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-orange-600 dark:text-orange-400'
                        }`}>
                          {completion}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${completion}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className={`h-3 rounded-full ${
                            isComplete
                              ? 'bg-gradient-to-r from-green-500 to-green-600'
                              : 'bg-gradient-to-r from-orange-500 to-orange-600'
                          }`}
                        />
                      </div>
                    </div>

                    {/* CTA Button */}
                    {!isLocked && (
                      <div className={`w-full py-3 rounded-2xl font-black text-center transition-colors ${
                        isComplete
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }`}>
                        {isComplete ? 'REVIEW' : completion > 0 ? 'CONTINUE' : 'START'}
                      </div>
                    )}

                    {isLocked && (
                      <div className="w-full py-3 rounded-2xl font-black text-center bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                        LOCKED
                      </div>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Link to="/review">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 text-center hover:shadow-xl transition-shadow border-2 border-gray-200 dark:border-gray-700"
              >
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  className="text-5xl mb-3"
                >
                  📖
                </motion.div>
                <h4 className="font-black text-gray-700 dark:text-gray-300 text-sm">REVIEW</h4>
              </motion.div>
            </Link>

            <Link to="/challenge">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 text-center hover:shadow-xl transition-shadow border-2 border-gray-200 dark:border-gray-700"
              >
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  className="text-5xl mb-3"
                >
                  ⚡
                </motion.div>
                <h4 className="font-black text-gray-700 dark:text-gray-300 text-sm">CHALLENGE</h4>
              </motion.div>
            </Link>

            <Link to="/achievements">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 text-center hover:shadow-xl transition-shadow border-2 border-gray-200 dark:border-gray-700"
              >
                <motion.div
                  whileHover={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.3 }}
                  className="text-5xl mb-3"
                >
                  🏆
                </motion.div>
                <h4 className="font-black text-gray-700 dark:text-gray-300 text-sm">TROPHIES</h4>
              </motion.div>
            </Link>

            <Link to="/progress-report">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 text-center hover:shadow-xl transition-shadow border-2 border-gray-200 dark:border-gray-700"
              >
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  className="text-5xl mb-3"
                >
                  📊
                </motion.div>
                <h4 className="font-black text-gray-700 dark:text-gray-300 text-sm">PROGRESS</h4>
              </motion.div>
            </Link>
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-3xl p-8 border-2 border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-6">
              Your Stats
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                  className="text-4xl font-black text-gray-900 dark:text-gray-100 mb-1"
                >
                  {MODULES.length}
                </motion.div>
                <div className="text-sm font-bold text-gray-600 dark:text-gray-400">Modules</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: 'spring' }}
                  className="text-4xl font-black text-gray-900 dark:text-gray-100 mb-1"
                >
                  329
                </motion.div>
                <div className="text-sm font-bold text-gray-600 dark:text-gray-400">Total Lessons</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: 'spring' }}
                  className="text-4xl font-black text-orange-600 dark:text-orange-400 mb-1"
                >
                  {streakDays}
                </motion.div>
                <div className="text-sm font-bold text-gray-600 dark:text-gray-400">Day Streak</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9, type: 'spring' }}
                  className="text-4xl font-black text-orange-600 dark:text-orange-400 mb-1"
                >
                  {totalXP}
                </motion.div>
                <div className="text-sm font-bold text-gray-600 dark:text-gray-400">Total XP</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Footer */}
          <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
            <p className="font-semibold">Version {APP_VERSION} • 100% Offline</p>
            <p className="mt-1">Made with ❤️ for Cameroonian learners</p>
          </div>
        </main>
      </div>
    </>
  );
}
