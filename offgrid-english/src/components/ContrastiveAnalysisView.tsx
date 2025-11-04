import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { ContrastiveAnalysis } from '../types/schemas';

interface ContrastiveAnalysisViewProps {
  analysis: NonNullable<ContrastiveAnalysis>;
}

export function ContrastiveAnalysisView({ analysis }: ContrastiveAnalysisViewProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Parse French structure to extract quote and explanation
  const parseFrenchStructure = () => {
    const match = analysis.frenchStructure.match(/"([^"]+)"\s*\n?\s*\(([^)]+)\)/);
    if (match) {
      return { example: match[1], explanation: match[2] };
    }
    return { example: '', explanation: analysis.frenchStructure };
  };

  // Parse English structure to extract quote and explanation
  const parseEnglishStructure = () => {
    const match = analysis.englishStructure.match(/"([^"]+)"\s*\n?\s*\(([^)]+)\)/);
    if (match) {
      return { example: match[1], explanation: match[2] };
    }
    return { example: '', explanation: analysis.englishStructure };
  };

  const frenchData = parseFrenchStructure();
  const englishData = parseEnglishStructure();

  const containerVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: 'auto',
      opacity: 1,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2, delay: 0.1 },
        staggerChildren: 0.1
      }
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2 }
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="mt-6">
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-3 w-full bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl p-4 hover:shadow-md transition-all"
      >
        <span className="text-3xl">💡</span>
        <div className="flex-1 text-left">
          <h3 className="font-bold text-yellow-900 dark:text-yellow-100 text-sm">
            French Comparison
          </h3>
          <p className="text-xs text-yellow-700 dark:text-yellow-200">
            {isOpen ? 'Hide' : 'Show'} why French speakers struggle with this
          </p>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-yellow-700 dark:text-yellow-300 text-xl font-bold"
        >
          ▶
        </motion.span>
      </motion.button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4">
              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* French Structure */}
                <motion.div
                  variants={itemVariants}
                  className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🇫🇷</span>
                    <h4 className="font-bold text-red-900 dark:text-red-100 text-sm">
                      French Structure
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {frenchData.example && (
                      <div>
                        <p className="text-xs text-red-700 dark:text-red-300 font-semibold mb-1">
                          Example:
                        </p>
                        <p className="text-sm text-red-900 dark:text-red-100 italic">
                          "{frenchData.example}"
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-red-700 dark:text-red-300 font-semibold mb-1">
                        Explanation:
                      </p>
                      <p className="text-sm text-red-900 dark:text-red-100 bg-red-100 dark:bg-red-900/40 p-2 rounded">
                        {frenchData.explanation}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* English Structure */}
                <motion.div
                  variants={itemVariants}
                  className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🇬🇧</span>
                    <h4 className="font-bold text-green-900 dark:text-green-100 text-sm">
                      English Structure
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {englishData.example && (
                      <div>
                        <p className="text-xs text-green-700 dark:text-green-300 font-semibold mb-1">
                          Example:
                        </p>
                        <p className="text-sm text-green-900 dark:text-green-100 italic">
                          "{englishData.example}"
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-green-700 dark:text-green-300 font-semibold mb-1">
                        Explanation:
                      </p>
                      <p className="text-sm text-green-900 dark:text-green-100 bg-green-100 dark:bg-green-900/40 p-2 rounded">
                        {englishData.explanation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Why Difficult Explanation */}
              <motion.div
                variants={itemVariants}
                className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 rounded-lg p-4"
              >
                <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm mb-2 flex items-center gap-2">
                  <span>🤔</span> Why This Is Hard for French Speakers
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                  {analysis.whyDifficult}
                </p>
              </motion.div>

              {/* Visual Highlighting - Incorrect vs Correct */}
              <motion.div
                variants={itemVariants}
                className="bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4"
              >
                <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-3 flex items-center gap-2">
                  <span>⚖️</span> Comparison
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Incorrect (French Interference) */}
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg p-3">
                    <p className="text-xs font-bold text-red-700 dark:text-red-300 mb-2">
                      ❌ French Interference
                    </p>
                    <p className="text-sm text-red-900 dark:text-red-100 font-medium italic">
                      {analysis.visualHighlighting.incorrect}
                    </p>
                  </div>
                  {/* Correct English */}
                  <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg p-3">
                    <p className="text-xs font-bold text-green-700 dark:text-green-300 mb-2">
                      ✅ Correct English
                    </p>
                    <p className="text-sm text-green-900 dark:text-green-100 font-medium italic">
                      {analysis.visualHighlighting.correct}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
