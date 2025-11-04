import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/database';
import { APP_VERSION } from '../App';
import type { Attempt, Item } from '../types/schemas';

type ValidationSample = {
  sampleId: string;
  attempt: Attempt;
  item: Item;
  questionText: string;
  options: string[];
  studentAnswer: string;
  correctAnswer: string;
  systemScore: 'correct' | 'incorrect';
  feedback: string;
};

type ValidationResult = {
  sampleId: string;
  teacherScore: 'correct' | 'incorrect';
  agreement: boolean;
  feedbackRating: 0 | 1 | 2 | null;
  teacherNotes: string;
  timestamp: number;
};

const MODULE_NAMES: Record<string, string> = {
  'tense-form': 'Tense & Form',
  'subject-verb-agreement': 'Subject-Verb Agreement',
  'prepositions': 'Prepositions',
  'word-order': 'Word Order',
  'plurality': 'Plurality',
  'articles': 'Articles',
  'auxiliaries': 'Auxiliaries'
};

export function TeacherValidation() {
  const navigate = useNavigate();
  const [samples, setSamples] = useState<ValidationSample[]>([]);
  const [validations, setValidations] = useState<Map<string, ValidationResult>>(new Map());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedbackRating, setFeedbackRating] = useState<0 | 1 | 2 | null>(null);
  const [teacherNotes, setTeacherNotes] = useState('');

  // Generate stratified samples on mount
  useEffect(() => {
    generateSamples();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in textarea
      if (e.target instanceof HTMLTextAreaElement) return;

      const currentSample = samples[currentIndex];
      if (!currentSample) return;

      switch (e.key.toLowerCase()) {
        case 'a':
          handleAgree();
          break;
        case 'd':
          handleDisagree();
          break;
        case 'arrowleft':
          if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
          break;
        case 'arrowright':
          if (currentIndex < samples.length - 1) setCurrentIndex(currentIndex + 1);
          break;
        case '1':
          setFeedbackRating(2); // Excellent
          break;
        case '2':
          setFeedbackRating(1); // Adequate
          break;
        case '3':
          setFeedbackRating(0); // Poor
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, samples]);

  // Load current sample's validation if exists
  useEffect(() => {
    const currentSample = samples[currentIndex];
    if (currentSample) {
      const existing = validations.get(currentSample.sampleId);
      setFeedbackRating(existing?.feedbackRating ?? null);
      setTeacherNotes(existing?.teacherNotes ?? '');
    }
  }, [currentIndex, samples, validations]);

  async function generateSamples() {
    try {
      const attempts = await db.attempts.toArray();
      const items = await db.items.toArray();

      if (attempts.length === 0) {
        setSamples([]);
        setLoading(false);
        return;
      }

      // Stratified sampling: ~3 samples per module (mix of correct/incorrect)
      const moduleIds = Array.from(new Set(attempts.map(a => a.moduleId)));
      const samplesPerModule = Math.ceil(20 / moduleIds.length);
      const allSamples: ValidationSample[] = [];

      for (const moduleId of moduleIds) {
        const moduleAttempts = attempts.filter(a => a.moduleId === moduleId);
        const moduleItems = items.filter(i => i.moduleId === moduleId);

        // Get mix of correct and incorrect
        const correctAttempts = moduleAttempts.filter(a => a.isCorrect);
        const incorrectAttempts = moduleAttempts.filter(a => !a.isCorrect);

        const sampleCorrect = correctAttempts.slice(0, Math.ceil(samplesPerModule / 2));
        const sampleIncorrect = incorrectAttempts.slice(0, Math.floor(samplesPerModule / 2));

        const moduleSamples = [...sampleCorrect, ...sampleIncorrect];

        for (const attempt of moduleSamples) {
          const item = moduleItems.find(i => i.id === attempt.itemId);
          if (!item) continue;

          allSamples.push({
            sampleId: `val_${attempt.id}`,
            attempt,
            item,
            questionText: item.questionText,
            options: item.options,
            studentAnswer: attempt.studentAnswer,
            correctAnswer: item.correctAnswer,
            systemScore: attempt.isCorrect ? 'correct' : 'incorrect',
            feedback: item.feedback
          });
        }
      }

      // Shuffle and take first 20
      const shuffled = allSamples.sort(() => Math.random() - 0.5).slice(0, 20);
      setSamples(shuffled);
      setLoading(false);
    } catch (error) {
      console.error('Error generating samples:', error);
      setLoading(false);
    }
  }

  const handleAgree = useCallback(() => {
    const currentSample = samples[currentIndex];
    if (!currentSample) return;

    const validation: ValidationResult = {
      sampleId: currentSample.sampleId,
      teacherScore: currentSample.systemScore,
      agreement: true,
      feedbackRating,
      teacherNotes,
      timestamp: Date.now()
    };

    setValidations(prev => new Map(prev).set(currentSample.sampleId, validation));

    // Auto-advance to next
    if (currentIndex < samples.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, samples, feedbackRating, teacherNotes]);

  const handleDisagree = useCallback(() => {
    const currentSample = samples[currentIndex];
    if (!currentSample) return;

    // If teacher disagrees, the opposite score is what they think it should be
    const teacherScore = currentSample.systemScore === 'correct' ? 'incorrect' : 'correct';

    const validation: ValidationResult = {
      sampleId: currentSample.sampleId,
      teacherScore,
      agreement: false,
      feedbackRating,
      teacherNotes,
      timestamp: Date.now()
    };

    setValidations(prev => new Map(prev).set(currentSample.sampleId, validation));

    // Auto-advance to next
    if (currentIndex < samples.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, samples, feedbackRating, teacherNotes]);

  function exportValidationCSV() {
    if (validations.size === 0) {
      alert('No validations to export');
      return;
    }

    const header = [
      'app_version', 'sample_id', 'module_id', 'module_name', 'item_id',
      'question_text', 'student_answer', 'correct_answer',
      'system_score', 'teacher_score', 'agreement',
      'feedback_rating', 'teacher_notes', 'timestamp'
    ].join(',');

    const rows = Array.from(validations.values()).map(v => {
      const sample = samples.find(s => s.sampleId === v.sampleId);
      if (!sample) return null;

      const moduleName = MODULE_NAMES[sample.attempt.moduleId] || sample.attempt.moduleId;

      return [
        APP_VERSION,
        v.sampleId,
        sample.attempt.moduleId,
        `"${moduleName}"`,
        sample.attempt.itemId,
        `"${sample.questionText.replace(/"/g, '""')}"`,
        `"${sample.studentAnswer}"`,
        `"${sample.correctAnswer}"`,
        sample.systemScore,
        v.teacherScore,
        v.agreement,
        v.feedbackRating ?? '',
        `"${v.teacherNotes.replace(/"/g, '""')}"`,
        v.timestamp
      ].join(',');
    }).filter(r => r !== null);

    const csv = header + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teacher-validation-${APP_VERSION}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Calculate stats
  const reviewedCount = validations.size;
  const agreementCount = Array.from(validations.values()).filter(v => v.agreement).length;
  const agreementRate = reviewedCount > 0 ? (agreementCount / reviewedCount) * 100 : 0;

  const ratingsGiven = Array.from(validations.values()).filter(v => v.feedbackRating !== null);
  const avgFeedbackQuality = ratingsGiven.length > 0
    ? ratingsGiven.reduce((sum, v) => sum + (v.feedbackRating ?? 0), 0) / ratingsGiven.length
    : 0;

  const currentSample = samples[currentIndex];
  const currentValidation = currentSample ? validations.get(currentSample.sampleId) : null;
  const isReviewed = currentValidation !== undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-600">Generating validation samples...</p>
        </div>
      </div>
    );
  }

  if (samples.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-6">
            There are no student attempts to validate yet. Students need to complete some practice modules first.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">OffGrid English - Teacher Validation</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Exit
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <p className="text-sm text-gray-600 mb-2">Progress:</p>
          <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300"
              style={{ width: `${(reviewedCount / samples.length) * 100}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900">
              {reviewedCount} of {samples.length} reviewed
            </div>
          </div>
        </div>

        {/* Sample Card */}
        {currentSample && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            {/* Sample Header */}
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-bold text-blue-900">
                Sample #{currentIndex + 1} - Module: {MODULE_NAMES[currentSample.attempt.moduleId]} - Item: {currentSample.item.id}
              </h2>
            </div>

            {/* Question */}
            <div className="mb-6">
              <p className="text-xl text-gray-900 font-medium mb-3">
                {currentSample.questionText}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Options:</strong> [{currentSample.options.join(', ')}]
              </p>
            </div>

            {/* Split-Screen: Student vs Correct */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Student Answer */}
              <div className={`rounded-lg p-5 border-2 ${
                currentSample.systemScore === 'correct'
                  ? 'bg-green-50 border-green-400'
                  : 'bg-red-50 border-red-400'
              }`}>
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span>👤</span> Student Answer
                </h3>
                <p className="text-2xl font-bold text-gray-900 mb-2">"{currentSample.studentAnswer}"</p>
                <p className="text-sm text-gray-700">
                  <strong>System Scored:</strong>{' '}
                  {currentSample.systemScore === 'correct' ? (
                    <span className="text-green-700 font-bold">✓ CORRECT</span>
                  ) : (
                    <span className="text-red-700 font-bold">✗ INCORRECT</span>
                  )}
                </p>
              </div>

              {/* Correct Answer */}
              <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-5">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span>✅</span> Correct Answer
                </h3>
                <p className="text-2xl font-bold text-blue-900">"{currentSample.correctAnswer}"</p>
              </div>
            </div>

            {/* Feedback */}
            <div className="bg-orange-50 border-l-4 border-orange-400 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-gray-900 mb-2">Feedback shown to student:</h3>
              <p className="text-gray-800 leading-relaxed">"{currentSample.feedback}"</p>
            </div>

            {/* Agreement Question */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Do you agree with the automated scoring?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleAgree}
                  disabled={isReviewed && currentValidation.agreement}
                  className={`${
                    isReviewed && currentValidation.agreement
                      ? 'bg-green-600 border-green-700'
                      : 'bg-green-500 hover:bg-green-600 border-green-600'
                  } text-white font-bold py-4 px-6 rounded-xl border-2 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-lg`}
                >
                  <span>✓</span> Agree <span className="text-sm opacity-75">(Press A)</span>
                </button>
                <button
                  onClick={handleDisagree}
                  disabled={isReviewed && !currentValidation.agreement}
                  className={`${
                    isReviewed && !currentValidation.agreement
                      ? 'bg-red-600 border-red-700'
                      : 'bg-red-500 hover:bg-red-600 border-red-600'
                  } text-white font-bold py-4 px-6 rounded-xl border-2 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-lg`}
                >
                  <span>✗</span> Disagree <span className="text-sm opacity-75">(Press D)</span>
                </button>
              </div>
            </div>

            {/* Optional Feedback Rating */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                (Optional) Rate feedback quality:
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={feedbackRating === 2}
                    onChange={() => setFeedbackRating(2)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">Excellent (2)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={feedbackRating === 1}
                    onChange={() => setFeedbackRating(1)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">Adequate (1)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={feedbackRating === 0}
                    onChange={() => setFeedbackRating(0)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">Poor (0)</span>
                </label>
                <button
                  onClick={() => setFeedbackRating(null)}
                  className="ml-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Skip
                </button>
              </div>
            </div>

            {/* Optional Notes */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                (Optional) Notes:
              </label>
              <textarea
                value={teacherNotes}
                onChange={(e) => setTeacherNotes(e.target.value)}
                placeholder="Add any specific concerns or suggestions..."
                className="w-full border-2 border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className={`${
                  currentIndex === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2`}
              >
                <span>←</span> Previous
              </button>
              <span className="text-sm text-gray-600">
                Use ← → arrow keys to navigate
              </span>
              <button
                onClick={() => setCurrentIndex(Math.min(samples.length - 1, currentIndex + 1))}
                disabled={currentIndex === samples.length - 1}
                className={`${
                  currentIndex === samples.length - 1
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2`}
              >
                Next <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-md p-6 border-2 border-purple-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Summary:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-700">
                <strong>Agreement Rate:</strong>{' '}
                <span className={agreementRate >= 90 ? 'text-green-600' : agreementRate >= 80 ? 'text-orange-600' : 'text-red-600'}>
                  {agreementRate.toFixed(1)}%
                </span>{' '}
                ({agreementCount}/{reviewedCount} agreed)
              </p>
            </div>
            <div>
              <p className="text-gray-700">
                <strong>Avg Feedback Quality:</strong>{' '}
                {avgFeedbackQuality.toFixed(1)}/2.0
                {avgFeedbackQuality >= 1.5 && ' (Excellent-Adequate)'}
                {avgFeedbackQuality >= 1 && avgFeedbackQuality < 1.5 && ' (Adequate)'}
                {avgFeedbackQuality < 1 && avgFeedbackQuality > 0 && ' (Below Adequate)'}
              </p>
            </div>
          </div>
          <button
            onClick={exportValidationCSV}
            disabled={validations.size === 0}
            className={`${
              validations.size === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            } text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2`}
          >
            <span>📥</span> Export Validation CSV
          </button>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="mt-6 bg-gray-100 rounded-lg p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-2">⌨️ Keyboard Shortcuts:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-700">
            <div><kbd className="bg-white px-2 py-1 rounded border">A</kbd> Agree</div>
            <div><kbd className="bg-white px-2 py-1 rounded border">D</kbd> Disagree</div>
            <div><kbd className="bg-white px-2 py-1 rounded border">←</kbd> Previous</div>
            <div><kbd className="bg-white px-2 py-1 rounded border">→</kbd> Next</div>
          </div>
        </div>
      </main>
    </div>
  );
}
