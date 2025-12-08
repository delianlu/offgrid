import { useId, useState, useEffect } from 'react';
import { AnswerOption } from './common/AnswerOption';
import { ScenarioBadge } from './ScenarioBadge';
import { VoiceInput } from './VoiceInput';
import { AudioButton } from './common/AudioButton';
import type { Scenario } from '../types/schemas';
import { db } from '../db/database';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

type Props = {
  question: string;
  options: string[];
  onAnswer: (answer: string) => void;
  scenario?: Scenario;
  itemId?: string;
  moduleId?: string;
  onFlag?: () => void;
};

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function MultipleChoice({ question, options, onAnswer, scenario, itemId, moduleId, onFlag }: Props) {
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
    if (!selected) {
      // Soft Disabled: Alert the user if they try to submit without a selection
      alert("Please select an answer first.");
      return;
    }
    onAnswer(selected);
  }

  return (
    <div className="p-6" role="radiogroup" aria-labelledby={groupId}>
      {/* Header with Scenario and Bookmark */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          {scenario && <ScenarioBadge scenario={scenario} />}
        </div>
        {itemId && moduleId && (
          <div className="flex gap-2">
            <button
              onClick={toggleBookmark}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isBookmarked
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark this question'}
            >
              <span className="text-xl">{isBookmarked ? '🔖' : '📑'}</span>
              <span className="text-sm font-semibold hidden sm:inline">
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </span>
            </button>
            {onFlag && (
              <button
                onClick={onFlag}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                title="Report an issue"
              >
                <span className="text-xl">🚩</span>
                <span className="text-sm font-semibold hidden sm:inline">Report</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Instruction */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Choose the correct answer:</p>

      {/* Question Box */}
      <div
        id={groupId}
        className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400 rounded-xl p-5 mb-6 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <p className="text-lg text-gray-900 dark:text-gray-100 leading-relaxed flex-1">
            {question}
          </p>
          <AudioButton text={question} size="md" />
        </div>
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

      {/* Submit Button - Soft Disabled Pattern */}
      <motion.button
        whileHover={selected ? { scale: 1.02 } : {}}
        whileTap={selected ? { scale: 0.98 } : {}}
        onClick={handleSubmit}
        className={`
          w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all
          flex items-center justify-center gap-2
          ${selected
            ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20 cursor-pointer'
            : 'bg-gray-300 dark:bg-gray-700 cursor-pointer opacity-70'
          }
        `}
      >
        <span>Check Answer</span>
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </div>
  );
}
