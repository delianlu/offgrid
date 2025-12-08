import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAllMistakes,
  getUnresolvedMistakes,
  markMistakeAsResolved,
  deleteMistake,
  getMistakeStats
} from '../services/mistakeJournal';
import type { MistakeJournalEntry } from '../types/schemas';

export function MistakeJournal() {
  const { t } = useTranslation();
  const [mistakes, setMistakes] = useState<MistakeJournalEntry[]>([]);
  const [showResolved, setShowResolved] = useState(false);
  const [stats, setStats] = useState({ total: 0, unresolved: 0, resolved: 0, byModule: {} as Record<string, number> });
  const [loading, setLoading] = useState(true);

  const loadMistakes = async () => {
    setLoading(true);
    const data = showResolved ? await getAllMistakes() : await getUnresolvedMistakes();
    const statsData = await getMistakeStats();
    setMistakes(data);
    setStats(statsData);
    setLoading(false);
  };

  useEffect(() => {
    loadMistakes();
  }, [showResolved]);

  const handleMarkResolved = async (mistakeId: string) => {
    await markMistakeAsResolved(mistakeId);
    await loadMistakes();
  };

  const handleDelete = async (mistakeId: string) => {
    if (confirm('Are you sure you want to delete this mistake?')) {
      await deleteMistake(mistakeId);
      await loadMistakes();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-blue-500 text-white px-4 py-4 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-2xl">←</Link>
          <div>
            <h1 className="text-xl font-bold">Mistake Journal</h1>
            <p className="text-sm text-blue-100">Track and learn from your errors</p>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-3 text-center shadow-lg"
          >
            <div className="text-2xl mb-1">📝</div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-600">Total</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-3 text-center shadow-lg"
          >
            <div className="text-2xl mb-1">⚠️</div>
            <p className="text-2xl font-bold text-blue-600">{stats.unresolved}</p>
            <p className="text-xs text-gray-600">Active</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-3 text-center shadow-lg"
          >
            <div className="text-2xl mb-1">✅</div>
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            <p className="text-xs text-gray-600">Resolved</p>
          </motion.div>
        </div>

        {/* Filter Toggle */}
        <div className="bg-white rounded-xl p-3 shadow-lg mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Show resolved mistakes</span>
            <button
              onClick={() => setShowResolved(!showResolved)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showResolved ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showResolved ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mistakes List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">⏳</div>
            <p className="text-gray-600">Loading mistakes...</p>
          </div>
        ) : mistakes.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-lg">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {showResolved ? 'No mistakes yet!' : 'No unresolved mistakes!'}
            </h2>
            <p className="text-gray-600">
              {showResolved
                ? 'Start practicing to build your mistake journal.'
                : 'Great job! You have resolved all your mistakes.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {mistakes.map((mistake, idx) => (
                <motion.div
                  key={mistake.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-white rounded-xl p-4 shadow-lg ${
                    mistake.resolved ? 'opacity-60' : ''
                  }`}
                >
                  {/* Mistake Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{mistake.resolved ? '✅' : '⚠️'}</span>
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {mistake.moduleId}
                        </span>
                        {mistake.attemptCount > 1 && (
                          <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-1 rounded">
                            {mistake.attemptCount}x
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Last seen: {new Date(mistake.lastSeenAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Question */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {mistake.questionText}
                    </p>
                  </div>

                  {/* Answer Comparison */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                      <p className="text-xs text-red-600 font-semibold mb-1">Your Answer:</p>
                      <p className="text-sm text-red-700">{mistake.studentAnswer}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                      <p className="text-xs text-green-600 font-semibold mb-1">Correct Answer:</p>
                      <p className="text-sm text-green-700">{mistake.correctAnswer}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!mistake.resolved && (
                      <button
                        onClick={() => handleMarkResolved(mistake.id)}
                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
                      >
                        Mark as Resolved
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(mistake.id)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
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
            to="/mistake-journal"
            className="flex flex-col items-center py-3 bg-blue-50 transition-all"
          >
            <span className="text-2xl mb-1">📝</span>
            <span className="text-xs font-medium text-blue-600">Mistakes</span>
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
    </div>
  );
}
