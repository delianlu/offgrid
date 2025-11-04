import { useId, useState, useEffect } from 'react';
import { AnswerOption } from './common/AnswerOption';
import { Button } from './common/Button';
import { ScenarioBadge } from './ScenarioBadge';
import { VoiceInput } from './VoiceInput';
import type { Scenario } from '../types/schemas';
import { db } from '../db/database';

type Props = {
  question: string;
  options: string[];
  onAnswer: (answer: string) => void;
  scenario?: Scenario;
  itemId?: string;
  moduleId?: string;
};

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function MultipleChoice({ question, options, onAnswer, scenario, itemId, moduleId }: Props) {
  const groupId = useId();
  const [selected, setSelected] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (itemId) {
      checkBookmark();
    }
  }, [itemId]);

  async function checkBookmark() {
    if (!itemId) return;
    const bookmark = await db.bookmarks.get(itemId);
    setIsBookmarked(!!bookmark);
  }

  async function toggleBookmark() {
    if (!itemId || !moduleId) return;

    if (isBookmarked) {
      await db.bookmarks.delete(itemId);
      setIsBookmarked(false);
    } else {
      await db.bookmarks.add({
        itemId,
        moduleId,
        bookmarkedAt: Date.now()
      });
      setIsBookmarked(true);
    }
  }

  function handleSubmit() {
    if (selected) {
      onAnswer(selected);
    }
  }

  return (
    <div className="p-6" role="radiogroup" aria-labelledby={groupId}>
      {/* Header with Scenario and Bookmark */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          {scenario && <ScenarioBadge scenario={scenario} />}
        </div>
        {itemId && moduleId && (
          <button
            onClick={toggleBookmark}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              isBookmarked
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark this question'}
          >
            <span className="text-xl">{isBookmarked ? '🔖' : '📑'}</span>
            <span className="text-sm font-semibold">
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </span>
          </button>
        )}
      </div>

      {/* Instruction */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Choose the correct answer:</p>

      {/* Question Box */}
      <div
        id={groupId}
        className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400 rounded-xl p-5 mb-6 shadow-sm"
      >
        <p className="text-lg text-gray-900 dark:text-gray-100 leading-relaxed">
          {question}
        </p>
      </div>

      {/* Voice Input */}
      <VoiceInput
        options={options}
        onAnswer={(answer) => {
          setSelected(answer);
          // Auto-submit after voice selection
          setTimeout(() => onAnswer(answer), 500);
        }}
        isDisabled={!!selected}
      />

      {/* Answer Options */}
      <div className="space-y-3 mb-6">
        {options.map((opt, idx) => (
          <AnswerOption
            key={idx}
            letter={LETTERS[idx]}
            text={opt}
            selected={selected === opt}
            onClick={() => setSelected(opt)}
          />
        ))}
      </div>

      {/* Submit Button */}
      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={!selected}
      >
        Check Answer
      </Button>
    </div>
  );
}
