import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Onboarding } from './components/Onboarding';
import { DailyGoals } from './components/DailyGoals';
import { motion } from 'framer-motion';
import { calculateModuleProgress } from './services/progressTracking';

export const APP_VERSION = '2.0.0';

const MODULES = [
  { id: 'tense-form', name: 'Verb Tense & Form', items: 50, icon: '📖' },
  { id: 'subject-verb-agreement', name: 'Subject-Verb Agreement', items: 40, icon: '✍️' },
  { id: 'prepositions', name: 'Prepositions', items: 30, icon: '📍' },
  { id: 'word-order', name: 'Word Order', items: 30, icon: '🔤' },
  { id: 'plurality', name: 'Plurality', items: 20, icon: '👥' },
  { id: 'articles', name: 'Articles', items: 20, icon: '📰' },
  { id: 'auxiliaries', name: 'Auxiliaries', items: 20, icon: '🔧' },
  { id: 'cameroonian-scenarios', name: 'Cameroonian Contexts', items: 69, icon: '🏪' },
  { id: 'false-cognates', name: 'False Friends', items: 50, icon: '🔄' },
];

interface ModuleProgress {
  completion: number;
  badge: string;
}

export default function App() {
  const { t, i18n } = useTranslation();
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

  // Find active module (first module with progress > 0 and < 100)
  const activeModule = MODULES.find(m => {
    const progress = moduleProgress[m.id];
    return progress && progress.completion > 0 && progress.completion < 100;
  });

  // Toggle language
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <>
      <Onboarding />
      <PWAInstallPrompt />
      <OfflineIndicator />

      <div className="min-h-screen bg-slate-50 pb-20">

        {/* HEADER - Gradient Blue to Purple */}
        <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              {/* Logo & Brand */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">📚</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">OffGrid English</h1>
                  <p className="text-xs text-blue-100">Learn anywhere, anytime</p>
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-3">
                {/* Language Toggle */}
                <div className="flex bg-white/20 rounded-lg p-1 backdrop-blur-sm">
                  <button
                    onClick={toggleLanguage}
                    className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                      i18n.language === 'en' ? 'bg-white text-blue-600' : 'text-white'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={toggleLanguage}
                    className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                      i18n.language === 'fr' ? 'bg-white text-blue-600' : 'text-white'
                    }`}
                  >
                    FR
                  </button>
                </div>

                {/* Teacher Dashboard Link */}
                <Link
                  to="/teacher-dashboard"
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Teacher Dashboard"
                >
                  <span className="text-xl">👩‍🏫</span>
                </Link>

                {/* Settings */}
                <Link
                  to="/analytics"
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Settings"
                >
                  <span className="text-xl">⚙️</span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* STATS BAR - Clean White Cards with Left Borders */}
        <section className="bg-gradient-to-b from-slate-50 to-white py-6">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-3 gap-4">
              {/* XP Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📚</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total XP</p>
                    <p className="text-2xl font-bold text-gray-900">{totalXP}</p>
                  </div>
                </div>
              </motion.div>

              {/* Streak Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-md p-4 border-l-4 border-amber-500"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🔥</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Day Streak</p>
                    <p className="text-2xl font-bold text-gray-900">{streakDays}</p>
                  </div>
                </div>
              </motion.div>

              {/* Progress Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-md p-4 border-l-4 border-purple-500"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Complete</p>
                    <p className="text-2xl font-bold text-gray-900">{overallCompletion}%</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* HERO SECTION - Continue Your Journey */}
        {activeModule && (
          <section className="container mx-auto px-6 py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl">🚀</span>
                    <h2 className="text-2xl font-bold">Continue Your Journey</h2>
                  </div>
                  <p className="text-blue-100 mb-1">
                    Last studied: <strong>{activeModule.name}</strong>
                  </p>
                  <p className="text-sm text-blue-200">
                    {moduleProgress[activeModule.id]?.completion || 0}% complete
                  </p>

                  <Link to={`/practice/${activeModule.id}`}>
                    <button className="mt-6 bg-white text-blue-600 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
                      Continue Practice →
                    </button>
                  </Link>
                </div>

                {/* Progress Circle */}
                <div className="hidden md:block">
                  <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{overallCompletion}%</p>
                      <p className="text-sm text-blue-200">Progress</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        )}

        {/* QUICK ACCESS CARDS - 3 Features */}
        <section className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Daily Goal Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <DailyGoals />
            </motion.div>

            {/* Progress Prediction Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link to="/progress-report" className="block">
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📈</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Prediction</h3>
                      <p className="text-sm text-gray-600">Your forecast</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    Track your learning trajectory
                  </p>
                  <button className="text-sm text-purple-600 font-semibold hover:text-purple-700">
                    View Details →
                  </button>
                </div>
              </Link>
            </motion.div>

            {/* Mistake Journal Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link to="/mistake-journal" className="block">
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📝</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Mistakes</h3>
                      <p className="text-sm text-gray-600">Review errors</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    Learn from your mistakes
                  </p>
                  <button className="text-sm text-pink-600 font-semibold hover:text-pink-700">
                    Review Now →
                  </button>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* MODULES SECTION - Improved Cards */}
        <section className="container mx-auto px-6 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your Learning Path
            </h2>
            <p className="text-gray-600">
              Master grammar step by step 👇
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULES.map((module, idx) => {
              const progress = moduleProgress[module.id];
              const completion = progress?.completion || 0;
              const badge = progress?.badge || 'locked';
              const isLocked = badge === 'locked';
              const isCompleted = completion === 100;
              const isActive = completion > 0 && completion < 100;

              // Determine if this is the "next" module (first locked after an active one)
              const activeIndex = MODULES.findIndex(m => {
                const p = moduleProgress[m.id];
                return p && p.completion > 0 && p.completion < 100;
              });
              const isNext = isLocked && idx === activeIndex + 1;

              const ModuleCard = (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + idx * 0.05 }}
                  className={`
                    rounded-xl shadow-md p-6 transition-all
                    ${isActive ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-500' : ''}
                    ${isCompleted ? 'bg-white border-2 border-green-500' : ''}
                    ${isNext ? 'bg-white border-2 border-transparent hover:border-purple-500' : ''}
                    ${isLocked && !isNext ? 'bg-white opacity-60' : ''}
                    ${!isLocked ? 'hover:shadow-lg cursor-pointer' : ''}
                  `}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-blue-500' :
                      isCompleted ? 'bg-green-500' :
                      isNext ? 'bg-purple-100' :
                      'bg-gray-100'
                    }`}>
                      <span className={`text-2xl ${isLocked && !isNext ? 'grayscale' : ''}`}>
                        {isCompleted ? '✅' : isActive ? '📖' : module.icon}
                      </span>
                    </div>
                    {isActive && (
                      <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        ACTIVE
                      </span>
                    )}
                    {isNext && (
                      <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
                        NEXT
                      </span>
                    )}
                    {isCompleted && (
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                        DONE
                      </span>
                    )}
                    {isLocked && !isNext && (
                      <span className="text-2xl">🔒</span>
                    )}
                  </div>

                  <h3 className={`text-lg font-bold mb-2 ${isLocked ? 'text-gray-700' : 'text-gray-900'}`}>
                    {module.name}
                  </h3>
                  <p className={`text-sm mb-4 ${isLocked ? 'text-gray-500' : 'text-gray-600'}`}>
                    {module.items} lessons • {module.name === 'Cameroonian Contexts' ? 'Real-world scenarios' : 'Grammar practice'}
                  </p>

                  {/* Progress Bar */}
                  {!isLocked && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-700">Progress</span>
                        <span className="font-semibold text-blue-600">{completion}%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isCompleted ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Button */}
                  {isActive && (
                    <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors">
                      Continue Practice →
                    </button>
                  )}
                  {isCompleted && (
                    <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-colors">
                      Review Module ✓
                    </button>
                  )}
                  {isNext && (
                    <div className="bg-purple-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-purple-700">
                        ✨ <strong>Almost ready!</strong> Complete current module first
                      </p>
                    </div>
                  )}
                  {isLocked && (
                    <button className="w-full bg-gray-100 text-gray-400 font-bold py-3 rounded-lg cursor-not-allowed">
                      🔒 Locked
                    </button>
                  )}
                </motion.div>
              );

              if (isLocked) {
                return <div key={module.id}>{ModuleCard}</div>;
              }

              return (
                <Link key={module.id} to={`/practice/${module.id}`}>
                  {ModuleCard}
                </Link>
              );
            })}
          </div>
        </section>

        {/* FOOTER - Subtle */}
        <footer className="bg-white border-t border-gray-200 py-6 mt-12">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  100% Offline
                </span>
                <span>Version {APP_VERSION}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Made for Cameroon</span>
                <span className="text-xl">🇨🇲</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-3">
          <Link
            to="/"
            className="flex flex-col items-center py-3 hover:bg-blue-50 transition-all active:scale-95"
          >
            <span className="text-2xl mb-1">🏠</span>
            <span className="text-xs font-medium text-gray-700">{t('navigation.home')}</span>
          </Link>

          <Link
            to="/progress-report"
            className="flex flex-col items-center py-3 hover:bg-blue-50 transition-all active:scale-95"
          >
            <span className="text-2xl mb-1">📊</span>
            <span className="text-xs font-medium text-gray-700">{t('navigation.progress')}</span>
          </Link>

          <Link
            to="/analytics"
            className="flex flex-col items-center py-3 hover:bg-blue-50 transition-all active:scale-95"
          >
            <span className="text-2xl mb-1">⚙️</span>
            <span className="text-xs font-medium text-gray-700">{t('navigation.settings')}</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
