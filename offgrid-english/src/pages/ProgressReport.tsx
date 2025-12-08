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
    try {
      setLoading(true);
      const weeklyStats = await calculateWeeklyStats();
      setStats(weeklyStats);
    } catch (error) {
      console.error('Failed to load progress report stats:', error);
    } finally {
      setLoading(false);
    }
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
      <div className="min-h-screen bg-amber-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce-gentle">📊</div>
          <p className="text-lg text-gray-700 dark:text-slate-300 font-medium">Generating your report...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-amber-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-lg text-gray-700 dark:text-slate-300 font-medium mb-6">No data available yet</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-palm-600 hover:bg-palm-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <span>←</span>
            <span>Go Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 dark:bg-slate-900 print:bg-white print:dark:bg-white">
      <style>{`
        @media print {
          @page { margin: 2cm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          header, button, .no-print { display: none !important; }
          .print-only { display: block !important; }
          .shadow-lg, .shadow-xl, .shadow-md { box-shadow: none !important; }
          .bg-gradient-to-r { background: none !important; background-color: #f3f4f6 !important; color: black !important; }
          .text-white { color: black !important; }
          .dark .bg-slate-800 { background-color: white !important; border: 1px solid #e5e7eb; }
          .dark .text-slate-300 { color: #4b5563 !important; }
          .dark .text-gray-100 { color: #111827 !important; }
        }
      `}</style>

      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-slate-800 dark:to-slate-700 text-white shadow-lg print:hidden">
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
      <main className="max-w-4xl mx-auto px-4 py-8 print:p-0 print:max-w-none">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-blue-600 dark:to-blue-700 rounded-2xl p-8 text-white mb-8 shadow-xl dark:shadow-2xl print:border print:border-gray-300 print:rounded-none print:mb-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">📊 Progress Report</h2>
              <p className="text-orange-100 dark:text-blue-100 print:text-gray-600">
                Generated on {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="text-6xl print:hidden">🎓</div>
          </div>
        </motion.div>

        {/* Weekly Summary Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 print:break-inside-avoid"
        >
          <WeeklySummary />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 print:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-lg dark:shadow-2xl border-l-4 border-orange-500 dark:border-orange-400 print:shadow-none print:border"
          >
            <div className="text-sm text-gray-600 dark:text-slate-300 font-semibold mb-2">
              QUESTIONS
            </div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {stats.totalQuestions}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-lg dark:shadow-2xl border-l-4 border-green-500 dark:border-emerald-400 print:shadow-none print:border"
          >
            <div className="text-sm text-gray-600 dark:text-slate-300 font-semibold mb-2">
              ACCURACY
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-emerald-400">
              {stats.accuracy}%
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-lg dark:shadow-2xl border-l-4 border-purple-500 dark:border-purple-400 print:shadow-none print:border"
          >
            <div className="text-sm text-gray-600 dark:text-slate-300 font-semibold mb-2">
              TIME SPENT
            </div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {stats.timeSpent}
              <span className="text-sm text-gray-500 dark:text-slate-400 ml-1">min</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-lg dark:shadow-2xl border-l-4 border-orange-500 dark:border-orange-400 print:shadow-none print:border"
          >
            <div className="text-sm text-gray-600 dark:text-slate-300 font-semibold mb-2">
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
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6 print:shadow-none print:border print:break-inside-avoid"
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
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden print:border print:border-gray-300">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500 print:bg-gray-800"
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
            className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6 shadow-md mb-6 print:shadow-none print:border-gray-300 print:break-inside-avoid"
          >
            <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
              <span>⭐</span>
              <span>Top Performing Module</span>
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {stats.topModule.name}
              </span>
              <span className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-lg font-bold print:border print:border-gray-800 print:text-black print:bg-transparent">
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
            className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6 shadow-md mb-6 print:shadow-none print:border-gray-300 print:break-inside-avoid"
          >
            <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
              <span>📚</span>
              <span>Area for Improvement</span>
            </h3>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {stats.weakestModule.name}
              </span>
              <span className="bg-yellow-500 dark:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold print:border print:border-gray-800 print:text-black print:bg-transparent">
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
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6 print:shadow-none print:border print:break-inside-avoid"
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
          className="flex flex-col sm:flex-row gap-4 print:hidden"
        >
          <button
            onClick={() => window.print()}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold py-4 px-6 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <span>🖨️</span>
            <span>Print Report</span>
          </button>
          <button
            onClick={downloadReport}
            className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <span>📥</span>
            <span>Download HTML</span>
          </button>
          <button
            onClick={copyToClipboard}
            className="flex-1 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <span>{copied ? '✅' : '📋'}</span>
            <span>{copied ? 'Copy Text' : 'Copy Text'}</span>
          </button>
        </motion.div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8 print:mt-4">
          Reports are generated based on your last 7 days of practice
        </p>
      </main>
    </div>
  );
}
