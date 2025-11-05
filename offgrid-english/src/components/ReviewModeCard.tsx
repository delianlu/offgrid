import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getReviewStats } from '../services/spacedRepetition';

export function ReviewModeCard() {
  const [dueCount, setDueCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const stats = await getReviewStats();
      setDueCount(stats.dueNow || 0);
    } catch (error) {
      console.error('Error loading review stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || dueCount === 0) {
    return null; // Don't show if no items due
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-4"
    >
      <Link to="/review">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-indigo-600 dark:to-indigo-700 rounded-2xl p-4 shadow-lg hover:shadow-xl dark:shadow-2xl transition-all active:scale-95 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 dark:bg-white/10 rounded-xl p-3">
              <span className="text-3xl">🔄</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-purple-100 dark:text-indigo-100 mb-1">
                Review Mode
              </h3>
              <p className="text-lg font-bold">
                {dueCount} {dueCount === 1 ? 'item' : 'items'} due for review
              </p>
              <p className="text-xs text-purple-100 dark:text-indigo-100 mt-1">
                Strengthen your memory with spaced repetition
              </p>
            </div>
            <div className="text-2xl text-white/70 dark:text-white/50">›</div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
