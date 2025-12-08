import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import {
  calculateModuleMastery,
  getWeakestModules,
  selectSmartPracticeItems,
  type ModuleMastery
} from '../services/masteryCalculator';
import { db } from '../db/database';
import type { Item } from '../types/schemas';

function sessionId() {
  return 'sess-' + Math.random().toString(36).slice(2);
}

export function SmartPractice() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [masteryData, setMasteryData] = useState<ModuleMastery[]>([]);
  const [loading, setLoading] = useState(true);
  const [practicing, setPracticing] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [idx, setIdx] = useState(0);
  const [lastAnswer, setLastAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const sid = useMemo(sessionId, []);

  useEffect(() => {
    (async () => {
      const data = await calculateModuleMastery();
      setMasteryData(data);
      setLoading(false);
    })();
  }, []);

  const weakestModules = useMemo(() => {
    return getWeakestModules(masteryData, 2);
  }, [masteryData]);

  async function startSmartPractice() {
    setLoading(true);
    const itemIds = await selectSmartPracticeItems(weakestModules);
    const selectedItems = await db.items.bulkGet(itemIds);
    const validItems = selectedItems.filter((item): item is Item => item !== undefined);

    setItems(validItems);
    setIdx(0);
    setLastAnswer(null);
    setShowFeedback(false);
    setPracticing(true);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🧠</div>
          <p className="text-lg text-gray-600">Analyzing your progress...</p>
        </div>
      </div>
    );
  }

  // Practice Mode UI (similar to ModulePractice)
  if (practicing) {
    if (idx >= items.length) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header title="Smart Practice" />
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Smart Practice Complete!
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                Great work! You practiced {items.length} questions from your weakest areas.
              </p>
              <div className="flex flex-col gap-3">
                <Button variant="primary" onClick={() => setPracticing(false)}>
                  Back to Skill Tree
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
      const attemptId = 'att-' + Date.now();
      const now = Date.now();
      await db.attempts.add({
        id: attemptId,
        userId: currentUser?.id, // Add userId
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

    // Import MultipleChoice and AnimatedFeedback dynamically for practice
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header
          title="Smart Practice"
          currentItem={idx + 1}
          totalItems={items.length}
          progress={progress}
        />
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <span className="inline-block bg-purple-100 text-purple-800 text-sm font-bold px-4 py-2 rounded-full">
            🧠 Smart Practice Mode
          </span>
        </div>
        <main className="flex-1 max-w-5xl mx-auto" style={{ paddingLeft: '80px', paddingRight: '80px', paddingTop: '24px', paddingBottom: '80px', width: 'calc(100% - 160px)' }}>
          {!showFeedback ? (
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">Choose the correct answer:</p>
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-5 mb-6">
                <p className="text-lg text-gray-900">{item.questionText}</p>
              </div>
              <div className="space-y-3 mb-6">
                {item.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => onAnswer(opt)}
                    className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-6">
              <div className={`${isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'} border-l-4 rounded-xl p-6`}>
                <h3 className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                  {isCorrect ? 'Correct!' : 'Not quite right'}
                </h3>
                <p className={`mb-4 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect ? 'Great job!' : item.feedback}
                </p>
                <Button
                  variant={isCorrect ? 'success' : 'primary'}
                  onClick={next}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Skill Tree View
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Smart Practice" />

      <main className="max-w-6xl mx-auto p-6">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500 rounded-xl p-6 mb-6"
        >
          <div className="flex items-start gap-3">
            <div className="text-4xl">🧠</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Personalized Learning Path
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our algorithm analyzes your performance and identifies your weakest areas.
                Smart Practice focuses on the grammar topics where you need the most improvement.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Weakest Modules Alert */}
        {weakestModules.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-orange-50 border-l-4 border-orange-500 rounded-xl p-6 mb-6"
          >
            <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
              <span>⚠️</span> Focus Areas
            </h3>
            <p className="text-orange-800 mb-3">
              Based on your performance, you should focus on these topics:
            </p>
            <div className="space-y-2">
              {weakestModules.map(module => (
                <div key={module.moduleId} className="flex items-center justify-between bg-white rounded-lg p-3">
                  <span className="font-semibold text-gray-900">{module.moduleName}</span>
                  <span className="text-orange-600 font-bold">
                    {module.accuracyPercentage.toFixed(0)}% accuracy
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Button
            variant="primary"
            onClick={startSmartPractice}
            disabled={weakestModules.length === 0}
            fullWidth={true}
          >
            {weakestModules.length === 0
              ? 'Complete some modules first'
              : 'Start Smart Practice (10 questions)'}
          </Button>
        </motion.div>

        {/* Skill Tree */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Your Skill Tree</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {masteryData.map((module, index) => {
              const level = getMasteryLevel(module.accuracyPercentage);
              return (
                <motion.div
                  key={module.moduleId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="bg-white rounded-xl shadow-md p-5 border-2 border-gray-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-sm mb-1">
                        {module.moduleName}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {module.totalAttempts} attempts
                      </span>
                    </div>
                    <span className="text-2xl">{level.emoji}</span>
                  </div>

                  {/* Circular Progress */}
                  <div className="relative w-24 h-24 mx-auto mb-3">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      <motion.circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - module.accuracyPercentage / 100)}`}
                        className={level.color}
                        initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - module.accuracyPercentage / 100) }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-900">
                        {module.accuracyPercentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${level.bgColor} ${level.textColor}`}>
                      {level.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function getMasteryLevel(accuracy: number) {
  if (accuracy >= 90) {
    return {
      label: 'Mastered',
      emoji: '🏆',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800'
    };
  } else if (accuracy >= 75) {
    return {
      label: 'Proficient',
      emoji: '⭐',
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800'
    };
  } else if (accuracy >= 60) {
    return {
      label: 'Developing',
      emoji: '📈',
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800'
    };
  } else if (accuracy >= 40) {
    return {
      label: 'Needs Work',
      emoji: '📚',
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800'
    };
  } else {
    return {
      label: 'Struggling',
      emoji: '💪',
      color: 'text-red-500',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800'
    };
  }
}
