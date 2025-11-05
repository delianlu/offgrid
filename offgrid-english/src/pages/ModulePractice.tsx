import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../db/database';
import type { Item } from '../types/schemas';
import { MultipleChoice } from '../components/MultipleChoice';
import { Header } from '../components/common/Header';
import { EnhancedFeedback } from '../components/EnhancedFeedback';
import { CompletionCelebration } from '../components/CompletionCelebration';
import { Button } from '../components/common/Button';
import { APP_VERSION } from '../App';
import { updateReviewData, attemptToQuality } from '../services/spacedRepetition';
import { checkAchievements, type Achievement } from '../services/achievements';
import { AchievementToast } from '../components/AchievementToast';

function sessionId() {
  return 'sess-' + Math.random().toString(36).slice(2);
}

export function ModulePractice() {
  const { moduleId = 'tense-form' } = useParams();
  const [items, setItems] = useState<Item[]>([]);
  const [moduleName, setModuleName] = useState<string>('');
  const [idx, setIdx] = useState(0);
  const [lastAnswer, setLastAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'A' | 'B'>('A');
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null);
  const sid = useMemo(sessionId, []);

  useEffect(() => {
    (async () => {
      const existing = await db.items.where({ moduleId, formType: 'A' }).toArray();
      if (existing.length === 0) {
        // seed on first run
        const { ensureSeedContent } = await import('../services/contentLoader');
        await ensureSeedContent(APP_VERSION);
      }

      // Start with Form A (Phase 2: PRACTICE)
      const formAItems = await db.items.where({ moduleId, formType: 'A' }).toArray();
      setItems(formAItems);
      setCurrentPhase('A');

      // Get module name
      const module = await db.modules.get(moduleId);
      if (module) {
        setModuleName(module.name);
      }
    })();
  }, [moduleId]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
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

    const formBItems = await db.items.where({ moduleId, formType: 'B' }).toArray();
    setItems(formBItems);
    setCurrentPhase('B');
    setIdx(0);
    setLastAnswer(null);
    setShowFeedback(false);
  }

  if (idx >= items.length) {
    const xpEarned = items.length * 10;

    // Check if we completed Form A (Phase 2) - move to Form B (Phase 3)
    if (currentPhase === 'A') {
      return (
        <CompletionCelebration
          moduleName={moduleName}
          xpEarned={xpEarned}
          totalXP={xpEarned}
          itemsCompleted={items.length}
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
        itemsCompleted={items.length * 2}
        onContinue={() => window.location.href = '/'}
        phaseType="module"
      />
    );
  }

  const item = items[idx];
  const progress = ((idx + 1) / items.length) * 100;
  const isCorrect = lastAnswer === item.correctAnswer;

  const phaseInfo = currentPhase === 'A'
    ? { emoji: '✏️', name: 'Phase 2: PRACTICE', color: 'bg-orange-100 text-orange-800' }
    : { emoji: '🚀', name: 'Phase 3: TRANSFER', color: 'bg-amber-100 text-amber-800' };

  async function onAnswer(answer: string) {
    setLastAnswer(answer);
    const isCorrect = answer === item.correctAnswer;
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

    // Check for new achievements
    const newAchievements = await checkAchievements();
    if (newAchievements.length > 0) {
      // Show the first new achievement (queue others if needed)
      setAchievementToast(newAchievements[0]);
    }

    setShowFeedback(true);
  }

  async function next() {
    // mark feedback viewed time
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
      {/* Achievement Toast */}
      <AchievementToast
        achievement={achievementToast}
        onClose={() => setAchievementToast(null)}
      />

      {/* Header with Progress */}
      <Header
        currentItem={idx + 1}
        totalItems={items.length}
        progress={progress}
      />

      {/* Phase Indicator */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <span className={`inline-block ${phaseInfo.color} text-sm font-bold px-4 py-2 rounded-full shadow-sm`}>
          {phaseInfo.emoji} {phaseInfo.name}
        </span>
      </div>

      {/* Content */}
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
