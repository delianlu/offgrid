import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WeeklySummary } from '../components/WeeklySummary';
import {
  calculateWeeklyStats,
  generateEmailReport,
  generateTextReport,
  type WeeklyStats,
} from '../services/progressReport';

export function ProgressReport() {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    const weeklyStats = await calculateWeeklyStats();
    setStats(weeklyStats);
    setLoading(false);
  }

  function downloadReport() {
    if (!stats) return;

    const html = generateEmailReport(stats);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `offgrid-progress-report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function copyToClipboard() {
    if (!stats) return;

    const text = generateTextReport(stats);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce-gentle">📊</div>
          <p className="text-lg text-gray-700 font-medium">Generating your report...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-lg text-gray-700 font-medium">No data available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="text-white hover:bg-white/20 font-semibold flex items-center gap-2 px-3 py-1 rounded-lg transition-all active:scale-95"
          >
            <span>←</span>
            <span>Home</span>
          </Link>
          <h1 className="text-xl font-bold">
            Progress Report
          </h1>
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white mb-8 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">📊 Last 7 Days</h2>
              <p className="text-orange-100">
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="text-6xl">🎓</div>
          </div>
        </motion.div>

        {/* Weekly Summary Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <WeeklySummary />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-5 shadow-lg border-l-4 border-orange-500"
          >
            <div className="text-sm text-gray-600 font-semibold mb-2">
              QUESTIONS
            </div>
            <div className="text-3xl font-bold text-orange-600">
              {stats.totalQuestions}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-5 shadow-lg border-l-4 border-green-500"
          >
            <div className="text-sm text-gray-600 font-semibold mb-2">
              ACCURACY
            </div>
            <div className="text-3xl font-bold text-green-600">
              {stats.accuracy}%
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-5 shadow-lg border-l-4 border-purple-500"
          >
            <div className="text-sm text-gray-600 font-semibold mb-2">
              TIME SPENT
            </div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {stats.timeSpent}
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">min</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md"
          >
            <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-2">
              STREAK
            </div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {stats.dailyStreak}
              <span className="ml-2">🔥</span>
            </div>
          </motion.div>
        </div>

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            ✅ Achievements
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Modules Completed</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {stats.modulesCompleted} / 7
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.modulesCompleted / 7) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Achievements Unlocked</span>
              <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.achievementsUnlocked} 🏆
              </span>
            </div>
          </div>
        </motion.div>

        {/* Top Module */}
        {stats.topModule && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6 shadow-md mb-6"
          >
            <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
              <span>⭐</span>
              <span>Top Performing Module</span>
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {stats.topModule.name}
              </span>
              <span className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-lg font-bold">
                {stats.topModule.accuracy}% accuracy
              </span>
            </div>
          </motion.div>
        )}

        {/* Weakest Module */}
        {stats.weakestModule && stats.weakestModule.accuracy < 70 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6 shadow-md mb-6"
          >
            <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
              <span>📚</span>
              <span>Area for Improvement</span>
            </h3>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {stats.weakestModule.name}
              </span>
              <span className="bg-yellow-500 dark:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold">
                {stats.weakestModule.accuracy}% accuracy
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              💡 Tip: Try the Smart Practice feature to focus on this topic!
            </p>
          </motion.div>
        )}

        {/* Daily Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            📈 This Week's Activity
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.questionsPerDay).map(([day, count]) => (
              <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-gray-600 dark:text-gray-400 font-medium">{day}</span>
                <span className="text-gray-900 dark:text-gray-100 font-bold">{count} questions</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={downloadReport}
            className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <span>📥</span>
            <span>Download HTML Report</span>
          </button>
          <button
            onClick={copyToClipboard}
            className="flex-1 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <span>{copied ? '✅' : '📋'}</span>
            <span>{copied ? 'Copied!' : 'Copy Text Report'}</span>
          </button>
        </motion.div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          Reports are generated based on your last 7 days of practice
        </p>
      </main>
    </div>
  );
}
