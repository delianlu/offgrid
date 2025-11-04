import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ContrastiveAnalysisView } from './ContrastiveAnalysisView';
import type { ContrastiveAnalysis } from '../types/schemas';

interface AnimatedFeedbackProps {
  type: 'success' | 'error';
  title: string;
  message: string;
  explanation?: string;
  contrastiveAnalysis?: ContrastiveAnalysis;
  onContinue: () => void;
}

export function AnimatedFeedback({ type, title, message, explanation, contrastiveAnalysis, onContinue }: AnimatedFeedbackProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
        staggerChildren: 0.15
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15
      }
    }
  };

  const explanationVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: 'auto',
      opacity: 1,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2, delay: 0.1 }
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

  const isSuccess = type === 'success';
  const bgColor = isSuccess
    ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30'
    : 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30';
  const borderColor = isSuccess
    ? 'border-green-500 dark:border-green-400'
    : 'border-red-500 dark:border-red-400';
  const textColor = isSuccess
    ? 'text-green-900 dark:text-green-100'
    : 'text-red-900 dark:text-red-100';
  const icon = isSuccess ? '✓' : '✗';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`${bgColor} border-l-4 ${borderColor} rounded-xl p-6 shadow-lg`}
      >
        {/* Icon and Title */}
        <motion.div variants={itemVariants} className="flex items-start gap-4 mb-4">
          <motion.div
            variants={iconVariants}
            className={`text-5xl ${isSuccess ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
          >
            {icon}
          </motion.div>
          <div className="flex-1">
            <motion.h3
              variants={itemVariants}
              className={`text-2xl font-bold ${textColor} mb-2`}
            >
              {title}
            </motion.h3>
            <motion.p
              variants={itemVariants}
              className={`text-base ${textColor.replace('900', '700').replace('100', '200')}`}
            >
              {message}
            </motion.p>
          </div>
        </motion.div>

        {/* Explanation Section (for errors) */}
        {!isSuccess && explanation && (
          <motion.div variants={itemVariants}>
            <motion.button
              onClick={() => setShowExplanation(!showExplanation)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 mb-3 transition-colors"
            >
              <motion.span
                animate={{ rotate: showExplanation ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                ▶
              </motion.span>
              {showExplanation ? 'Hide' : 'Show'} detailed explanation
            </motion.button>

            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  variants={explanationVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="overflow-hidden"
                >
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                      {explanation}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Contrastive Analysis */}
        {!isSuccess && contrastiveAnalysis && (
          <motion.div variants={itemVariants}>
            <ContrastiveAnalysisView analysis={contrastiveAnalysis} />
          </motion.div>
        )}

        {/* Continue Button */}
        <motion.div variants={itemVariants} className="mt-6">
          <motion.button
            onClick={onContinue}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`w-full py-3 px-6 rounded-lg font-bold text-white ${
              isSuccess
                ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
                : 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800'
            } transition-colors shadow-md`}
          >
            Continue
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
