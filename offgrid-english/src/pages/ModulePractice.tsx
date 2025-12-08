import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../db/database';
import type { Item } from '../types/schemas';
import { MultipleChoice } from '../components/MultipleChoice';
import { Header } from '../components/common/Header';
import { EnhancedFeedback } from '../components/EnhancedFeedback';
import { CompletionCelebration } from '../components/CompletionCelebration';

import { APP_VERSION } from '../App';
import { updateReviewData, attemptToQuality } from '../services/spacedRepetition';
import { checkAchievements, type Achievement } from '../services/achievements';
import { AchievementToast } from '../components/AchievementToast';
import {
  selectNextQuestion,
  calculatePerformanceLevel,
  getDifficultyMessage,
  type PerformanceLevel
} from '../services/adaptiveDifficulty';
import { PerformanceInsight } from '../components/PerformanceInsight';
import { FlagModal } from '../components/common/FlagModal';

function sessionId() {
  return 'sess-' + Math.random().toString(36).slice(2);
}

export function ModulePractice() {
  const { currentUser } = useAuth();
  const { moduleId = 'tense-form' } = useParams();
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [moduleName, setModuleName] = useState<string>('');
  const [lastAnswer, setLastAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'A' | 'B'>('A');
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null);
  const [attemptedInSession, setAttemptedInSession] = useState<Set<string>>(new Set());
  const [totalItemsInPhase, setTotalItemsInPhase] = useState(0);
  const [performanceLevel, setPerformanceLevel] = useState<PerformanceLevel | null>(null);
  const [showPerformanceInsight, setShowPerformanceInsight] = useState(false);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const seed = searchParams.get('seed');
  const sid = useMemo(sessionId, []);

  useEffect(() => {
    (async () => {
      const allItems = await db.items.toArray();
      const existing = allItems.filter(i => i.moduleId === moduleId && i.formType === 'A');

      if (existing.length === 0) {
        // seed on first run
        const { ensureSeedContent } = await import('../services/contentLoader');
        await ensureSeedContent(APP_VERSION);
      }

      // Start with Form A (Phase 2: PRACTICE)
      const allItemsAgain = await db.items.toArray();
      const formAItems = allItemsAgain.filter(i => i.moduleId === moduleId && i.formType === 'A');
      setTotalItemsInPhase(formAItems.length);
      setCurrentPhase('A');

      // Get module name
      const module = await db.modules.get(moduleId);
      if (module) {
        setModuleName(module.name || '');
      }

      // Load initial performance level and first question
      await loadNextAdaptiveQuestion('A', new Set());
    })();
  }, [moduleId]);

  async function loadNextAdaptiveQuestion(phase: 'A' | 'B', attempted: Set<string>) {
    // Get performance level
    const perf = await calculatePerformanceLevel(moduleId);
    setPerformanceLevel(perf);

    // Select next question adaptively (or deterministically if seeded)
    const nextItem = await selectNextQuestion(moduleId, phase, attempted, seed || undefined);
    setCurrentItem(nextItem);

    // Show performance insight every 5 questions (only in adaptive mode)
    if (!seed && attempted.size > 0 && attempted.size % 5 === 0) {
      setShowPerformanceInsight(true);
      setTimeout(() => setShowPerformanceInsight(false), 5000);
    }
  }

  if (!currentItem || totalItemsInPhase === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce-gentle">📚</div>
          <p className="text-lg text-gray-700 font-medium">Loading module...</p>
        </div>
      </div>
    );
  }

  async function loadFormB() {
    // Check if Form B is unlocked (Form A must be complete with 70%+ accuracy)
    const { calculateModuleProgress } = await import('../services/progressTracking');
    const progress = await calculateModuleProgress(moduleId);

    if (!progress || !progress.isFormBUnlocked) {
      alert('Form B (Phase 3) is locked. Complete Phase 2 with 70% or higher accuracy to unlock it.');
      return;
    }

    const allItems = await db.items.toArray();
    const formBItems = allItems.filter(i => i.moduleId === moduleId && i.formType === 'B');
    setTotalItemsInPhase(formBItems.length);
    setCurrentPhase('B');
    setAttemptedInSession(new Set());
    setLastAnswer(null);
    setShowFeedback(false);
    await loadNextAdaptiveQuestion('B', new Set());
  }

  // Check if phase is complete (all items attempted at least once)
  if (attemptedInSession.size >= totalItemsInPhase) {
    const xpEarned = attemptedInSession.size * 10;

    // Check if we completed Form A (Phase 2) - move to Form B (Phase 3)
    if (currentPhase === 'A') {
      return (
        <CompletionCelebration
          moduleName={moduleName}
          xpEarned={xpEarned}
          totalXP={xpEarned}
          itemsCompleted={attemptedInSession.size}
          onContinue={loadFormB}
          phaseType="phase2"
        />
      );
    }

    // Completed Form B (Phase 3) - module fully complete
    return (
      <CompletionCelebration
        moduleName={moduleName}
        xpEarned={xpEarned}
        totalXP={xpEarned * 2}
        itemsCompleted={attemptedInSession.size * 2}
        onContinue={() => window.location.href = '/'}
        phaseType="module"
      />
    );
  }

  const item = currentItem;
  const progress = (attemptedInSession.size / totalItemsInPhase) * 100;
  const isCorrect = lastAnswer === item.correctAnswer;

  const phaseInfo = currentPhase === 'A'
    ? { emoji: '✏️', name: 'Phase 2: PRACTICE', color: 'bg-blue-100 text-blue-800' }
    : { emoji: '🚀', name: 'Phase 3: TRANSFER', color: 'bg-purple-100 text-purple-800' };

  async function onAnswer(answer: string) {
    setLastAnswer(answer);
    const isCorrect = answer === item.correctAnswer;
    const attemptId = 'att-' + Date.now();
    setCurrentAttemptId(attemptId);
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

    // Update spaced repetition data
    const quality = attemptToQuality(isCorrect, true);
    await updateReviewData(item.id, quality);

    // Record mistake if incorrect
    if (!isCorrect) {
      const { recordMistake } = await import('../services/mistakeJournal');
      await recordMistake(
        item.id,
        item.moduleId,
        item.questionText,
        answer,
        item.correctAnswer,
        currentUser?.id
      );
    }

    // Check for new achievements
    const newAchievements = await checkAchievements();
    if (newAchievements.length > 0) {
      // Show the first new achievement (queue others if needed)
      setAchievementToast(newAchievements[0]);
    }

    setShowFeedback(true);
  }

  async function next() {
    try {
      // mark feedback viewed time
      if (currentAttemptId) {
        const now = Date.now();
        await db.attempts.update(currentAttemptId, { feedbackViewedAt: now });
      }

      // Add to attempted set
      const newAttempted = new Set(attemptedInSession);
      newAttempted.add(item.id);
      setAttemptedInSession(newAttempted);

      // Load next adaptive question
      await loadNextAdaptiveQuestion(currentPhase, newAttempted);
    } catch (error) {
      console.error('Error in next():', error);
      // Fallback: Just load next question if DB write fails
      const newAttempted = new Set(attemptedInSession);
      newAttempted.add(item.id);
      setAttemptedInSession(newAttempted);
      await loadNextAdaptiveQuestion(currentPhase, newAttempted);
    } finally {
      setShowFeedback(false);
      setLastAnswer(null);
      setCurrentAttemptId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Achievement Toast */}
      <AchievementToast
        achievement={achievementToast}
        onClose={() => setAchievementToast(null)}
      />

      {/* Header with Progress */}
      <Header
        currentItem={attemptedInSession.size + 1}
        totalItems={totalItemsInPhase}
        progress={progress}
      />

      {/* Phase Indicator & Review Link */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className={`inline-block ${phaseInfo.color} text-sm font-bold px-4 py-2 rounded-full shadow-sm`}>
            {phaseInfo.emoji} {phaseInfo.name}
          </span>
          {seed && (
            <span className="inline-block bg-indigo-100 text-indigo-800 text-sm font-bold px-4 py-2 rounded-full shadow-sm border border-indigo-200">
              🏫 Classroom Session: {seed}
            </span>
          )}
        </div>

        <Link
          to={`/learn/${moduleId}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
        >
          <span>📖</span> Review Lesson
        </Link>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto" style={{ paddingLeft: '80px', paddingRight: '80px', paddingTop: '24px', paddingBottom: '80px', width: 'calc(100% - 160px)' }}>
        {/* Performance Insight */}
        {showPerformanceInsight && performanceLevel && (
          <PerformanceInsight
            performanceLevel={performanceLevel}
            message={getDifficultyMessage(performanceLevel)}
          />
        )}

        {!showFeedback ? (
          <MultipleChoice
            question={item.questionText}
            options={item.options}
            onAnswer={onAnswer}
            scenario={item.scenario}
            itemId={item.id}
            moduleId={item.moduleId}
            onFlag={() => setIsFlagModalOpen(true)}
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

      {/* Flag Modal */}
      {currentItem && (
        <FlagModal
          isOpen={isFlagModalOpen}
          onClose={() => setIsFlagModalOpen(false)}
          itemId={currentItem.id}
          moduleId={currentItem.moduleId}
        />
      )}
    </div>
  );
}
