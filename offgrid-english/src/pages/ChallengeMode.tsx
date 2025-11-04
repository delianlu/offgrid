import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { MultipleChoice } from '../components/MultipleChoice';
import {
  loadChallengeStats,
  updateSpeedChallenge,
  updateAccuracyChallenge,
  calculateDailyStreak,
  getChallengeItems,
  formatTime,
  type ChallengeStats
} from '../services/challenges';
import { db } from '../db/database';
import type { Item } from '../types/schemas';

type ChallengeType = 'speed' | 'accuracy' | 'streak' | null;

function sessionId() {
  return 'sess-' + Math.random().toString(36).slice(2);
}

export function ChallengeMode() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeType>(null);
  const [playing, setPlaying] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [idx, setIdx] = useState(0);
  const [lastAnswer, setLastAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes = 120 seconds
  const [timerActive, setTimerActive] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [accuracyStreak, setAccuracyStreak] = useState(0);
  const [failed, setFailed] = useState(false);
  const sid = useMemo(sessionId, []);

  useEffect(() => {
    loadStats();
  }, []);

  // Timer for speed challenge
  useEffect(() => {
    if (timerActive && timeRemaining > 0 && selectedChallenge === 'speed') {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timerActive, timeRemaining, selectedChallenge]);

  async function loadStats() {
    const challengeStats = loadChallengeStats();
    const dailyStreak = await calculateDailyStreak();
    setStats({ ...challengeStats, currentDailyStreak: dailyStreak });
  }

  async function startChallenge(type: ChallengeType) {
    setSelectedChallenge(type);
    const challengeItems = await getChallengeItems(10);
    setItems(challengeItems);
    setIdx(0);
    setLastAnswer(null);
    setShowFeedback(false);
    setAccuracyStreak(0);
    setFailed(false);
    setPlaying(true);

    if (type === 'speed') {
      setTimeRemaining(120);
      setTimerActive(true);
      setStartTime(Date.now());
    }
  }

  function handleTimeOut() {
    setFailed(true);
    setPlaying(false);
  }

  async function onAnswer(answer: string) {
    if (!items[idx]) return;

    const item = items[idx];
    setLastAnswer(answer);
    const isCorrect = answer === item.correctAnswer;

    // Record attempt
    const attemptId = 'att-' + Date.now();
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
      timestamp: Date.now()
    });

    // Handle accuracy challenge
    if (selectedChallenge === 'accuracy') {
      if (isCorrect) {
        setAccuracyStreak(prev => prev + 1);
      } else {
        setFailed(true);
        setPlaying(false);
        setShowFeedback(true);
        return;
      }
    }

    setShowFeedback(true);
  }

  async function next() {
    setShowFeedback(false);
    setLastAnswer(null);

    const nextIdx = idx + 1;

    // Check completion
    if (nextIdx >= items.length || (selectedChallenge === 'accuracy' && accuracyStreak >= 10)) {
      handleChallengeComplete();
      return;
    }

    setIdx(nextIdx);
  }

  function handleChallengeComplete() {
    if (selectedChallenge === 'speed') {
      setTimerActive(false);
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      updateSpeedChallenge(elapsedTime);
    } else if (selectedChallenge === 'accuracy') {
      updateAccuracyChallenge(accuracyStreak);
    }

    setPlaying(false);
    loadStats(); // Reload stats
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚡</div>
          <p className="text-lg text-gray-600">Loading challenges...</p>
        </div>
      </div>
    );
  }

  // Challenge Complete Screen
  if (!playing && selectedChallenge && !failed && idx >= items.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header title="Challenge Complete!" />
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Challenge Complete!
            </h2>
            {selectedChallenge === 'speed' && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-blue-900 font-bold text-xl mb-1">
                  Time: {formatTime(Math.floor((Date.now() - startTime) / 1000))}
                </p>
                {stats.speedBestTime && (
                  <p className="text-blue-700 text-sm">
                    Best: {formatTime(stats.speedBestTime)}
                  </p>
                )}
              </div>
            )}
            {selectedChallenge === 'accuracy' && (
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <p className="text-green-900 font-bold text-xl">
                  10 correct answers in a row! 🔥
                </p>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <Button variant="primary" onClick={() => {
                setSelectedChallenge(null);
                setIdx(0);
              }}>
                Back to Challenges
              </Button>
              <Button variant="secondary" onClick={() => navigate('/')}>
                Home
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Failed Screen
  if (!playing && failed) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header title="Challenge Failed" />
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center"
          >
            <div className="text-6xl mb-4">😢</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Challenge Failed
            </h2>
            {selectedChallenge === 'speed' && (
              <p className="text-gray-600 mb-4">
                Time ran out! Try to answer faster next time.
              </p>
            )}
            {selectedChallenge === 'accuracy' && (
              <p className="text-gray-600 mb-4">
                You got {accuracyStreak} correct before making a mistake. Keep practicing!
              </p>
            )}
            <div className="flex flex-col gap-3">
              <Button variant="primary" onClick={() => startChallenge(selectedChallenge)}>
                Try Again
              </Button>
              <Button variant="secondary" onClick={() => {
                setSelectedChallenge(null);
                setFailed(false);
                setIdx(0);
              }}>
                Back to Challenges
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Playing Screen
  if (playing && items[idx]) {
    const item = items[idx];
    const progress = ((idx + 1) / items.length) * 100;
    const isCorrect = lastAnswer === item.correctAnswer;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header
          title={`${selectedChallenge === 'speed' ? 'Speed' : 'Accuracy'} Challenge`}
          currentItem={idx + 1}
          totalItems={items.length}
          progress={progress}
        />

        {/* Challenge Info Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <span className={`inline-block ${
              selectedChallenge === 'speed' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            } text-sm font-bold px-4 py-2 rounded-full`}>
              {selectedChallenge === 'speed' ? '⚡ Speed Challenge' : '🎯 Accuracy Challenge'}
            </span>
            {selectedChallenge === 'speed' && (
              <div className={`text-xl font-bold ${timeRemaining < 30 ? 'text-red-600' : 'text-gray-900'}`}>
                ⏱️ {formatTime(timeRemaining)}
              </div>
            )}
            {selectedChallenge === 'accuracy' && (
              <div className="text-xl font-bold text-green-600">
                🔥 Streak: {accuracyStreak}
              </div>
            )}
          </div>
        </div>

        <main className="flex-1 max-w-5xl mx-auto" style={{ paddingLeft: '80px', paddingRight: '80px', paddingTop: '24px', paddingBottom: '80px', width: 'calc(100% - 160px)' }}>
          {!showFeedback ? (
            <MultipleChoice
              question={item.questionText}
              options={item.options}
              onAnswer={onAnswer}
              scenario={item.scenario}
            />
          ) : (
            <div className="py-6">
              <div className={`${isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'} border-l-4 rounded-xl p-6`}>
                <h3 className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                  {isCorrect ? 'Correct! ✓' : 'Incorrect ✗'}
                </h3>
                {!isCorrect && (
                  <p className="text-red-700 mb-4">{item.feedback}</p>
                )}
                <Button variant={isCorrect ? 'success' : 'primary'} onClick={next}>
                  {selectedChallenge === 'accuracy' && !isCorrect ? 'View Results' : 'Continue'}
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Challenge Selection Screen
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Challenge Mode" />

      <main className="max-w-6xl mx-auto p-6">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 border-l-4 border-orange-500 dark:border-orange-400 rounded-xl p-6 mb-6"
        >
          <div className="flex items-start gap-3">
            <div className="text-4xl">⚡</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Challenge Yourself!
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Test your skills with timed challenges and accuracy tests. Can you beat your personal best?
              </p>
            </div>
          </div>
        </motion.div>

        {/* Challenge Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Speed Challenge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-t-4 border-blue-500"
          >
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Speed Challenge
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Answer 10 questions in 2 minutes or less
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">
                  {stats.speedBestTime ? formatTime(stats.speedBestTime) : '--:--'}
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300">Best Time</div>
              </div>
              <div className="text-center mt-2">
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  {stats.speedCompletions} completions
                </div>
              </div>
            </div>

            <Button variant="primary" onClick={() => startChallenge('speed')} fullWidth={true}>
              Start Challenge
            </Button>
          </motion.div>

          {/* Accuracy Challenge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-t-4 border-green-500"
          >
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Accuracy Challenge
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Get 10 correct answers in a row
            </p>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-1">
                  {stats.accuracyBestStreak}
                </div>
                <div className="text-xs text-green-700 dark:text-green-300">Best Streak</div>
              </div>
              <div className="text-center mt-2">
                <div className="text-sm text-green-800 dark:text-green-200">
                  {stats.accuracyCompletions} completions
                </div>
              </div>
            </div>

            <Button variant="success" onClick={() => startChallenge('accuracy')} fullWidth={true}>
              Start Challenge
            </Button>
          </motion.div>

          {/* Daily Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-t-4 border-purple-500"
          >
            <div className="text-5xl mb-4">🔥</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Daily Streak
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Practice every day to build your streak
            </p>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-4">
              <div className="text-center mb-3">
                <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-1">
                  {stats.currentDailyStreak} 🔥
                </div>
                <div className="text-xs text-purple-700 dark:text-purple-300">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-purple-800 dark:text-purple-200">
                  Longest: {stats.longestDailyStreak} days
                </div>
              </div>
            </div>

            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3 text-center">
              <p className="text-xs text-purple-800 dark:text-purple-200">
                Practice today to keep your streak alive!
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
