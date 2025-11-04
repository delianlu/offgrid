import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../db/database';
import type { Item } from '../types/schemas';
import { MultipleChoice } from '../components/MultipleChoice';
import { Header } from '../components/common/Header';
import { AnimatedFeedback } from '../components/AnimatedFeedback';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-lg text-gray-600">Loading module...</p>
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
    // Check if we completed Form A (Phase 2) - move to Form B (Phase 3)
    if (currentPhase === 'A') {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header title={moduleName} />
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Phase 2 Complete!
                </h2>
                <p className="text-gray-600 text-lg">
                  Great work! You've finished all {items.length} practice questions.
                </p>
              </div>

              {/* Phase Transition */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <div className="text-4xl">🚀</div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl mb-2">
                      Ready for Phase 3: Transfer Assessment
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Now it's time to test if you can apply what you learned to <strong>new situations</strong>.
                      Phase 3 has different questions that test the same grammar rules in different contexts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="primary" onClick={loadFormB} fullWidth={true}>
                  Continue to Phase 3 →
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => window.location.href = '/'}
                  fullWidth={true}
                >
                  Back to Modules
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Completed Form B (Phase 3) - module fully complete
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header title={moduleName} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Module Mastered!
            </h2>
            <p className="text-gray-600 mb-2 text-lg">
              Congratulations! You've completed all 3 phases:
            </p>
            <div className="bg-white rounded-xl p-6 mb-6 shadow-md text-left">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <span className="text-gray-700">Phase 1: Learning</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <span className="text-gray-700">Phase 2: Practice</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <span className="text-gray-700">Phase 3: Transfer</span>
                </div>
              </div>
            </div>
            <Button
              variant="success"
              onClick={() => window.location.href = '/'}
            >
              Back to Modules
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const item = items[idx];
  const progress = ((idx + 1) / items.length) * 100;
  const isCorrect = lastAnswer === item.correctAnswer;

  const phaseInfo = currentPhase === 'A'
    ? { emoji: '✏️', name: 'Phase 2: PRACTICE', color: 'bg-green-100 text-green-800' }
    : { emoji: '🚀', name: 'Phase 3: TRANSFER', color: 'bg-purple-100 text-purple-800' };

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
        <span className={`inline-block ${phaseInfo.color} text-sm font-bold px-4 py-2 rounded-full`}>
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
            <AnimatedFeedback
              type={isCorrect ? 'success' : 'error'}
              title={isCorrect ? 'Correct!' : 'Not quite right'}
              message={
                isCorrect
                  ? 'Great job! You chose the right answer.'
                  : "Let's look at why this doesn't work."
              }
              explanation={!isCorrect ? item.feedback : undefined}
              contrastiveAnalysis={!isCorrect ? item.frenchComparison : undefined}
              onContinue={next}
            />
          </div>
        )}
      </main>
    </div>
  );
}
