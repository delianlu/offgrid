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
  { id: 'tense-form', name: 'Verb Tense & Form', items: 50, icon: '⏰' },
  { id: 'subject-verb-agreement', name: 'Subject-Verb Agreement', items: 40, icon: '🤝' },
  { id: 'prepositions', name: 'Prepositions', items: 30, icon: '📍' },
  { id: 'word-order', name: 'Word Order', items: 30, icon: '🔤' },
  { id: 'plurality', name: 'Plurality', items: 20, icon: '👥' },
  { id: 'articles', name: 'Articles', items: 20, icon: '📰' },
  { id: 'auxiliaries', name: 'Auxiliaries', items: 20, icon: '🔧' },
  { id: 'cameroonian-scenarios', name: 'Real Scenarios', items: 69, icon: '🏪' },
  { id: 'false-cognates', name: 'False Friends', items: 50, icon: '🔄' },
];

interface ModuleProgress {
  completion: number;
  badge: string;
}

export default function App() {
  const [streakDays, setStreakDays] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [moduleProgress, setModuleProgress] = useState<Record<string, ModuleProgress>>({});
  const [totalLessons] = useState(329);

  useEffect(() => {
    try { void import("./services/contentLoader").then(m=>m.ensureSeedContent(APP_VERSION)).catch(()=>{}); } catch {}

    // Load streak and XP
    (async () => {
      const { loadChallengeStats } = await import('./services/challenges');
      const stats = loadChallengeStats();
      setStreakDays(stats.currentDailyStreak);

      // Calculate total XP and progress
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

  // Calculate overall completion percentage
  const overallCompletion = Math.round(
    Object.values(moduleProgress).reduce((sum, p) => sum + p.completion, 0) /
    Math.max(Object.keys(moduleProgress).length, 1)
  );

  return (
    <>
      <Onboarding />
      <PWAInstallPrompt />
      <OfflineIndicator />

      <div className="min-h-screen bg-amber-50 pb-20">

        {/* Top Bar - Orange with Streak & XP */}
        <div className="bg-orange-500 text-white px-4 py-2 flex justify-between items-center sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold flex items-center gap-1">
              🔥 {streakDays} day streak
            </span>
            <span className="text-sm font-semibold flex items-center gap-1">
              ⚡ {totalXP} XP
            </span>
          </div>
          <DarkModeToggle />
        </div>

        {/* Welcome Section - Orange Gradient */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 shadow-lg">
          <h1 className="text-2xl font-bold mb-1">Welcome back! 👋</h1>
          <p className="text-orange-100">Pick a topic to practice</p>
        </div>

        {/* Stats Cards - At Top (Prominent) */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-amber-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-3 text-center shadow-lg"
          >
            <div className="text-2xl mb-1">📚</div>
            <p className="text-xl font-bold text-gray-900">{totalLessons}</p>
            <p className="text-xs text-gray-600">Lessons</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-3 text-center shadow-lg"
          >
            <div className="text-2xl mb-1">🔥</div>
            <p className="text-xl font-bold text-orange-600">{streakDays}</p>
            <p className="text-xs text-gray-600">Day Streak</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-3 text-center shadow-lg"
          >
            <div className="text-2xl mb-1">🎯</div>
            <p className="text-xl font-bold text-green-600">{overallCompletion}%</p>
            <p className="text-xs text-gray-600">Complete</p>
          </motion.div>
        </div>

        {/* Section Header */}
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Grammar Topics
          </h2>
          <p className="text-sm text-gray-600">
            Pick one to practice 👇
          </p>
        </div>

        {/* Module Grid - 2 Columns */}
        <div className="grid grid-cols-2 gap-4 p-4">
          {MODULES.map((module, idx) => {
            const progress = moduleProgress[module.id];
            const completion = progress?.completion || 0;
            const isLocked = progress?.badge === 'locked';
            const isCompleted = completion === 100;
            const isActive = completion > 0 && completion < 100;

            // Determine visual state
            let status: 'completed' | 'active' | 'locked';
            if (isCompleted) status = 'completed';
            else if (isActive) status = 'active';
            else status = 'locked';

            // Config based on status
            const config = {
              completed: {
                icon: '✅',
                iconSize: 'text-5xl',
                bgColor: 'bg-white',
                borderColor: 'border-l-4 border-green-500',
                textColor: 'text-gray-900',
                progressBg: 'bg-gray-200',
                progressColor: 'bg-green-500',
                statusText: 'Complete!',
                statusColor: 'text-green-600'
              },
              active: {
                icon: '🔥',
                iconSize: 'text-6xl',
                bgColor: 'bg-gradient-to-br from-orange-500 to-orange-600',
                borderColor: '',
                textColor: 'text-white',
                progressBg: 'bg-white/30',
                progressColor: 'bg-white',
                statusText: `${completion}% done`,
                statusColor: 'text-white'
              },
              locked: {
                icon: '🔒',
                iconSize: 'text-5xl',
                bgColor: 'bg-white',
                borderColor: 'border border-gray-200',
                textColor: 'text-gray-700',
                progressBg: '',
                progressColor: '',
                statusText: 'Locked',
                statusColor: 'text-gray-500'
              }
            }[status];

            const CardContent = (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={!isLocked ? { scale: 1.05 } : {}}
                whileTap={!isLocked ? { scale: 0.95 } : {}}
                className={`
                  ${config.bgColor} ${config.borderColor}
                  rounded-2xl shadow-xl p-5
                  ${!isLocked && 'hover:shadow-2xl cursor-pointer'}
                  ${isLocked && 'opacity-60'}
                  transition-all
                `}
              >
                {/* Icon */}
                <div className={`${config.iconSize} mb-3`}>{config.icon}</div>

                {/* Title */}
                <h3 className={`text-lg font-bold mb-1 ${config.textColor}`}>
                  {module.name}
                </h3>

                {/* Lesson Count */}
                <p className={`text-sm mb-3 ${
                  status === 'active' ? 'text-orange-100' : 'text-gray-600'
                }`}>
                  {module.items} lessons
                </p>

                {/* Progress Bar (only if not locked) */}
                {!isLocked && (
                  <>
                    <div className={`${config.progressBg} rounded-full h-2 mb-2`}>
                      <div
                        className={`${config.progressColor} h-2 rounded-full transition-all`}
                        style={{ width: `${completion}%` }}
                      />
                    </div>

                    {/* Status Text */}
                    <p className={`text-xs font-semibold ${config.statusColor}`}>
                      {config.statusText}
                    </p>
                  </>
                )}

                {/* Locked State */}
                {isLocked && (
                  <div className="bg-gray-100 rounded-lg p-2 text-center mt-2">
                    <p className="text-xs font-semibold text-gray-600">
                      Complete previous to unlock
                    </p>
                  </div>
                )}
              </motion.div>
            );

            if (isLocked) {
              return <div key={module.id}>{CardContent}</div>;
            }

            return (
              <Link key={module.id} to={`/learn/${module.id}`}>
                {CardContent}
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-4">
          <p className="font-semibold">Version {APP_VERSION} • 100% Offline</p>
          <p className="mt-1">Made with ❤️ for Cameroonian learners</p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-3">
          <Link
            to="/"
            className="flex flex-col items-center py-3 hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mb-1">🏠</span>
            <span className="text-xs font-medium text-gray-700">Home</span>
          </Link>

          <Link
            to="/progress-report"
            className="flex flex-col items-center py-3 hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mb-1">📊</span>
            <span className="text-xs font-medium text-gray-700">Progress</span>
          </Link>

          <Link
            to="/analytics"
            className="flex flex-col items-center py-3 hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mb-1">⚙️</span>
            <span className="text-xs font-medium text-gray-700">Settings</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
