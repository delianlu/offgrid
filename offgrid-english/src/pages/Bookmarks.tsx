import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { db } from '../db/database';
import type { Bookmark, Item, Module } from '../types/schemas';

interface BookmarkWithDetails extends Bookmark {
  item: Item;
  module: Module;
}

export function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  async function loadBookmarks() {
    setLoading(true);
    const allBookmarks = await db.bookmarks.orderBy('bookmarkedAt').reverse().toArray();

    const bookmarksWithDetails: BookmarkWithDetails[] = [];
    for (const bookmark of allBookmarks) {
      const item = await db.items.get(bookmark.itemId);
      const module = await db.modules.get(bookmark.moduleId);
      if (item && module) {
        bookmarksWithDetails.push({ ...bookmark, item, module });
      }
    }

    setBookmarks(bookmarksWithDetails);
    setLoading(false);
  }

  async function removeBookmark(itemId: string) {
    await db.bookmarks.delete(itemId);
    setBookmarks(prev => prev.filter(b => b.itemId !== itemId));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔖</div>
          <p className="text-lg text-gray-600">Loading bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="My Bookmarks" />

      <main className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border-l-4 border-blue-500 dark:border-blue-400 rounded-xl p-6 mb-6"
        >
          <div className="flex items-start gap-3">
            <div className="text-4xl">🔖</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Your Saved Questions
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Bookmark questions you want to review later. All your bookmarks are saved locally and available offline.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {bookmarks.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Bookmarked Questions
              </div>
            </div>
            {bookmarks.length > 0 && (
              <Button
                variant="secondary"
                onClick={async () => {
                  if (confirm('Are you sure you want to clear all bookmarks?')) {
                    await db.bookmarks.clear();
                    setBookmarks([]);
                  }
                }}
              >
                Clear All
              </Button>
            )}
          </div>
        </motion.div>

        {/* Bookmarks List */}
        {bookmarks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center"
          >
            <div className="text-5xl mb-4">📖</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              No Bookmarks Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Bookmark questions while practicing to save them for later review.
            </p>
            <Button variant="primary" onClick={() => window.location.href = '/'}>
              Start Practicing
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bookmark, index) => (
              <motion.div
                key={bookmark.itemId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                {/* Module Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full">
                      {bookmark.module.name}
                    </span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-bold px-3 py-1 rounded-full">
                      {bookmark.item.formType === 'A' ? 'Phase 2' : 'Phase 3'}
                    </span>
                  </div>
                  <button
                    onClick={() => removeBookmark(bookmark.itemId)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    title="Remove bookmark"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {/* Scenario Badge */}
                {bookmark.item.scenario && (
                  <div className="mb-3 flex items-center gap-2 text-sm">
                    <span className="text-2xl">{bookmark.item.scenario.icon}</span>
                    <span className="text-gray-700 dark:text-gray-300 font-semibold">
                      {bookmark.item.scenario.name}
                    </span>
                  </div>
                )}

                {/* Question */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 rounded-lg p-4 mb-4">
                  <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                    {bookmark.item.questionText}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-2 mb-4">
                  {bookmark.item.options.map((option, i) => {
                    const isCorrect = option === bookmark.item.correctAnswer;
                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border-2 ${
                          isCorrect
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600'
                            : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isCorrect && (
                            <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                          )}
                          <span className={isCorrect ? 'font-semibold text-green-900 dark:text-green-100' : 'text-gray-700 dark:text-gray-300'}>
                            {option}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Feedback */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-2">
                    💡 Explanation
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {bookmark.item.feedback}
                  </p>
                </div>

                {/* Note */}
                {bookmark.note && (
                  <div className="mt-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 dark:border-yellow-600 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      📝 <strong>Note:</strong> {bookmark.note}
                    </p>
                  </div>
                )}

                {/* Timestamp */}
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Bookmarked {new Date(bookmark.bookmarkedAt).toLocaleDateString()} at{' '}
                  {new Date(bookmark.bookmarkedAt).toLocaleTimeString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
