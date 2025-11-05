import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { MultipleChoice } from '../components/MultipleChoice';
import { EnhancedFeedback } from '../components/EnhancedFeedback';
import {
  getDueForReviewItems,
  getReviewStats,
  updateReviewData,
  attemptToQuality
} from '../services/spacedRepetition';
import { db } from '../db/database';
import type { Item } from '../types/schemas';

function sessionId() {
  return 'sess-' + Math.random().toString(36).slice(2);
}

export function ReviewMode() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [idx, setIdx] = useState(0);
  const [lastAnswer, setLastAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const sid = useMemo(sessionId, []);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [reviewStats, dueItems] = await Promise.all([
      getReviewStats(),
      getDueForReviewItems(20)
    ]);
    setStats(reviewStats);
    setItems(dueItems);
    setLoading(false);
  }

  async function startReview() {
    if (items.length === 0) {
      alert('No items due for review!');
      return;
    }
    setIdx(0);
    setLastAnswer(null);
    setShowFeedback(false);
    setReviewing(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce-gentle">🔄</div>
          <p className="text-lg text-gray-700 font-medium">Loading review items...</p>
        </div>
      </div>
    );
  }

  // Review Session UI
  if (reviewing) {
    if (idx >= items.length) {
      return (
        <div className="min-h-screen bg-amber-50 flex flex-col">
          <Header title="Review Mode" />
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Review Complete!
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                Great work! You reviewed {items.length} items. Your review schedule has been updated.
              </p>
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-700">
                  💡 Regular review strengthens your memory and improves long-term retention.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button variant="primary" onClick={() => {
                  setReviewing(false);
                  loadData(); // Reload to see updated stats
                }}>
                  Back to Review Stats
                </Button>
                <Button variant="secondary" onClick={() => navigate('/')}>
                  Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const item = items[idx];
    const progress = ((idx + 1) / items.length) * 100;
    const isCorrect = lastAnswer === item.correctAnswer;

    async function onAnswer(answer: string) {
      setLastAnswer(answer);
      const isCorrect = answer === item.correctAnswer;

      // Record attempt in database
      const attemptId = 'att-' + Date.now();
      const now = Date.now();
      await db.attempts.add({
        id: attemptId,
        moduleId: item.moduleId,
        itemId: item.id,
        formType: item.formType,
        transferType: item.transferType,
        studentAnswer: answer,
        isCorrect,
        feedbackViewedAt: null,
        retryAt: null,
        sessionId: sid,
        timestamp: now
      });

      // Update spaced repetition data
      const quality = attemptToQuality(isCorrect, true);
      await updateReviewData(item.id, quality);

      setShowFeedback(true);
    }

    async function next() {
      const now = Date.now();
      const last = await db.attempts.orderBy('timestamp').last();
      if (last && last.itemId === item.id) {
        await db.attempts.update(last.id, { feedbackViewedAt: now });
      }
      setShowFeedback(false);
      setLastAnswer(null);
      setIdx(i => i + 1);
    }

    return (
      <div className="min-h-screen bg-amber-50 flex flex-col">
        <Header
          currentItem={idx + 1}
          totalItems={items.length}
          progress={progress}
        />
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <span className="inline-block bg-purple-100 text-purple-800 text-sm font-bold px-4 py-2 rounded-full shadow-sm">
            🔄 Review Mode
          </span>
        </div>
        <main className="flex-1 max-w-5xl mx-auto" style={{ paddingLeft: '80px', paddingRight: '80px', paddingTop: '24px', paddingBottom: '80px', width: 'calc(100% - 160px)' }}>
          {!showFeedback ? (
            <MultipleChoice
              question={item.questionText}
              options={item.options}
              onAnswer={onAnswer}
              scenario={item.scenario}
              itemId={item.id}
              moduleId={item.moduleId}
            />
          ) : (
            <div className="py-6">
              <EnhancedFeedback
                isCorrect={isCorrect}
                correctAnswer={item.correctAnswer}
                userAnswer={lastAnswer || ''}
                explanation={item.feedback}
                contrastiveAnalysis={item.frenchComparison}
                onContinue={next}
              />
            </div>
          )}
        </main>
      </div>
    );
  }

  // Review Stats & Start Screen
  return (
    <div className="min-h-screen bg-amber-50">
      <Header title="Review Mode" />

      <main className="max-w-6xl mx-auto p-6">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-500 rounded-xl p-6 mb-6"
        >
          <div className="flex items-start gap-3">
            <div className="text-4xl">📖</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Spaced Repetition Review
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Review Mode uses the <strong>SM-2 spaced repetition algorithm</strong> to help you
                remember what you've learned. Items you struggle with appear more frequently,
                while mastered items appear less often.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Review Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-3xl font-bold text-gray-900">{stats.dueNow}</div>
            <div className="text-sm text-gray-600">Due Now</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-orange-500">
            <div className="text-3xl mb-2">⏰</div>
            <div className="text-3xl font-bold text-gray-900">{stats.dueSoon}</div>
            <div className="text-sm text-gray-600">Due Tomorrow</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
            <div className="text-3xl mb-2">📚</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalReviewed}</div>
            <div className="text-sm text-gray-600">Total Reviewed</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-3xl font-bold text-gray-900">{stats.averageEase}</div>
            <div className="text-sm text-gray-600">Avg. Ease Factor</div>
          </div>
        </motion.div>

        {/* Items Due for Review */}
        {items.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-orange-50 border-l-4 border-orange-500 rounded-xl p-6 mb-6"
            >
              <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                <span>📋</span> {items.length} Items Ready for Review
              </h3>
              <p className="text-orange-800 text-sm">
                These items are due for review based on your performance history and the
                spaced repetition algorithm.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="primary"
                onClick={startReview}
                fullWidth={true}
              >
                Start Review Session ({items.length} items)
              </Button>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-green-50 border-l-4 border-green-500 rounded-xl p-6 mb-6 text-center"
          >
            <div className="text-5xl mb-3">✅</div>
            <h3 className="font-bold text-green-900 mb-2 text-xl">
              All Caught Up!
            </h3>
            <p className="text-green-800">
              No items are due for review right now. Practice more modules to build your
              review queue, or come back tomorrow.
            </p>
            <div className="mt-6">
              <Button variant="secondary" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          </motion.div>
        )}

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-md p-6 mt-6"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">How Spaced Repetition Works</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex gap-3">
              <span className="text-2xl">1️⃣</span>
              <div>
                <strong>First Review:</strong> Items you answer correctly are scheduled for review in 1 day.
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">2️⃣</span>
              <div>
                <strong>Second Review:</strong> If you remember it, the next review is in 6 days.
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">3️⃣</span>
              <div>
                <strong>Subsequent Reviews:</strong> Intervals grow exponentially (14 days, 30 days, etc.)
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <strong>Incorrect Answers:</strong> Items reset to 1 day, ensuring you practice them more.
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
