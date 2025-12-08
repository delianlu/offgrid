import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { MultipleChoice } from '../components/MultipleChoice';
import {
  loadChallengeStats,
  updateSpeedChallenge,
  updateAccuracyChallenge,
  calculateDailyStreak,
  getChallengeItems,
  getChallengeItemsBySeed,
  generateChallengeCode,
  formatTime,
  type ChallengeStats
} from '../services/challenges';
import { db } from '../db/database';
import type { Item } from '../types/schemas';

type ChallengeType = 'speed' | 'accuracy' | 'code' | null;

function sessionId() {
  return 'sess-' + Math.random().toString(36).slice(2);
}

export function ChallengeMode() {
  const { currentUser } = useAuth();
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
  const [challengeCode, setChallengeCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const sid = useMemo(sessionId, []);

  useEffect(() => {
    loadStats();

    // Check for URL params (Duel Mode)
    const params = new URLSearchParams(window.location.search);
    const seed = params.get('seed');
    const topic = params.get('topic');
    const diff = params.get('diff');

    if (seed) {
      startChallenge('code', seed, topic || undefined, diff || undefined);
    }
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

  async function startChallenge(type: ChallengeType, seed?: string, topic?: string, difficulty?: string) {
    setSelectedChallenge(type);

    let challengeItems: Item[];
    if (type === 'code' && seed) {
      challengeItems = await getChallengeItemsBySeed(seed, 10, topic, difficulty);
      setChallengeCode(seed);
    } else {
      challengeItems = await getChallengeItems(10);
    }

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

  function handleCreateCodeChallenge() {
    const code = generateChallengeCode();
    startChallenge('code', code);
  }

  function handleJoinCodeChallenge() {
    if (inputCode.length < 4) return;
    startChallenge('code', inputCode.toUpperCase());
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
            {selectedChallenge === 'code' && (
              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <p className="text-purple-900 font-bold text-lg mb-1">
                  Code: {challengeCode}
                </p>
                <p className="text-purple-700 text-sm">
                  Share this code with friends to play the same questions!
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
              <Button variant="primary" onClick={() => startChallenge(selectedChallenge, challengeCode)}>
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

    let challengeTitle = '';
    if (selectedChallenge === 'speed') challengeTitle = 'Speed Challenge';
    else if (selectedChallenge === 'accuracy') challengeTitle = 'Accuracy Challenge';
    else challengeTitle = `Challenge: ${challengeCode}`;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header
          title={challengeTitle}
          currentItem={idx + 1}
          totalItems={items.length}
          progress={progress}
        />

        {/* Challenge Info Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <span className={`inline-block ${selectedChallenge === 'speed' ? 'bg-blue-100 text-blue-800' :
              selectedChallenge === 'accuracy' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              } text-sm font-bold px-4 py-2 rounded-full`}>
              {selectedChallenge === 'speed' ? '⚡ Speed' :
                selectedChallenge === 'accuracy' ? '🎯 Accuracy' :
                  `🔑 Code: ${challengeCode}`}
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
          className="bg-gradient-to-r from-blue-50 to-red-50 dark:from-blue-900/30 dark:to-red-900/30 border-l-4 border-blue-500 dark:border-blue-400 rounded-xl p-6 mb-6"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
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
            </div>

            <Button variant="success" onClick={() => startChallenge('accuracy')} fullWidth={true}>
              Start Challenge
            </Button>
          </motion.div>
        </div>

        {/* Offline Challenge Codes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-t-4 border-purple-500"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="text-5xl">🔑</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Offline Challenge Codes
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Play the same questions as your friends!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Create Code */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
              <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-2">Create a Challenge</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                Generate a unique code. Share it with friends to compete on the exact same questions.
              </p>
              <Button variant="primary" onClick={handleCreateCodeChallenge} fullWidth={true}>
                Generate Code & Play
              </Button>
            </div>

            {/* Join Code */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Join a Challenge</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Enter a code from a friend to play their challenge.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="CODE"
                  maxLength={4}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="flex-1 border-2 border-gray-300 rounded-xl px-4 py-3 font-mono text-lg uppercase focus:border-purple-500 focus:outline-none"
                />
                <Button
                  variant="secondary"
                  onClick={handleJoinCodeChallenge}
                  disabled={inputCode.length < 4}
                >
                  Play
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
