import { motion } from 'framer-motion';
import { ComparisonBox, ExplanationBox } from './common/FeedbackBox';
import type { ContrastiveAnalysis } from '../types/schemas';

// Varied success messages
const SUCCESS_MESSAGES = [
  { title: "Excellent! 🎉", message: "You got it right!" },
  { title: "Perfect! 👏", message: "That's the correct answer!" },
  { title: "You got it! ⭐", message: "Great job!" },
  { title: "Amazing work! 🌟", message: "You're doing fantastic!" },
  { title: "That's right! ✨", message: "Well done!" },
  { title: "Brilliant! 💫", message: "You nailed it!" },
  { title: "Superb! 🎯", message: "Excellent choice!" },
];

// Supportive error messages
const ERROR_MESSAGES = [
  { title: "Not quite! 💭", message: "Let's learn from this together." },
  { title: "Almost there! 🤔", message: "Let me explain why." },
  { title: "Let's try again! 📖", message: "Learning happens through mistakes." },
  { title: "Good attempt! 💡", message: "Here's what to remember." },
];

interface EnhancedFeedbackProps {
  isCorrect: boolean;
  correctAnswer?: string;
  userAnswer?: string;
  explanation?: string;
  contrastiveAnalysis?: ContrastiveAnalysis;
  onContinue: () => void;
}

export function EnhancedFeedback({
  isCorrect,
  correctAnswer,
  userAnswer,
  explanation,
  contrastiveAnalysis,
  onContinue
}: EnhancedFeedbackProps) {
  // Randomly select a message
  const messages = isCorrect ? SUCCESS_MESSAGES : ERROR_MESSAGES;
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  if (isCorrect) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 animate-slide-up"
      >
        {/* Success Message */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-green-100 to-emerald-100 border-l-4 border-green-500 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="text-5xl"
            >
              ✓
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-green-900 mb-2">
                {randomMessage.title}
              </h3>
              <p className="text-green-800 text-lg">
                {randomMessage.message}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Explanation (if provided) */}
        {explanation && (
          <motion.div variants={itemVariants}>
            <ExplanationBox>
              <p>{explanation}</p>
            </ExplanationBox>
          </motion.div>
        )}

        {/* French vs English Comparison */}
        {contrastiveAnalysis && (
          <motion.div variants={itemVariants}>
            <ComparisonBox
              frenchText={contrastiveAnalysis.french || ''}
              englishText={contrastiveAnalysis.english || ''}
              highlightEnglish={contrastiveAnalysis.highlight}
            />
          </motion.div>
        )}

        {/* Continue Button */}
        <motion.button
          variants={itemVariants}
          onClick={onContinue}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all hover:shadow-xl active:scale-95"
        >
          Continue →
        </motion.button>
      </motion.div>
    );
  }

  // Error feedback
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 animate-slide-up"
    >
      {/* Error Message */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-orange-100 to-amber-100 border-l-4 border-orange-500 rounded-xl p-6 shadow-lg"
      >
        <div className="flex items-start gap-4">
          <motion.div
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-5xl"
          >
            💭
          </motion.div>
          <div>
            <h3 className="text-2xl font-bold text-orange-900 mb-2">
              {randomMessage.title}
            </h3>
            <p className="text-orange-800 text-lg">
              {randomMessage.message}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Your Answer vs Correct Answer */}
      {userAnswer && correctAnswer && (
        <motion.div variants={itemVariants} className="space-y-3">
          {/* Your Answer */}
          <div className="bg-white border-2 border-red-200 rounded-xl p-4 shadow-md">
            <p className="text-xs font-bold text-gray-600 mb-2 uppercase">Your Answer:</p>
            <p className="text-lg text-gray-900">
              <span className="text-red-600 font-semibold">{userAnswer}</span>
            </p>
          </div>

          {/* Correct Answer */}
          <div className="bg-white border-2 border-green-200 rounded-xl p-4 shadow-md">
            <p className="text-xs font-bold text-gray-600 mb-2 uppercase">Correct Answer:</p>
            <p className="text-lg text-gray-900">
              <span className="text-green-600 font-bold">{correctAnswer}</span>
            </p>
          </div>
        </motion.div>
      )}

      {/* Explanation */}
      {explanation && (
        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-xl p-5 shadow-md">
            <p className="text-sm font-bold text-gray-900 mb-3">
              📚 Why this is correct:
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {explanation}
            </p>
          </div>
        </motion.div>
      )}

      {/* French vs English Comparison */}
      {contrastiveAnalysis && (
        <motion.div variants={itemVariants}>
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-sm font-bold text-gray-900 mb-3">
              🇫🇷 French vs 🇬🇧 English
            </p>
            <ComparisonBox
              frenchText={contrastiveAnalysis.french || ''}
              englishText={contrastiveAnalysis.english || ''}
              highlightEnglish={contrastiveAnalysis.highlight}
            />
          </div>
        </motion.div>
      )}

      {/* Continue Button */}
      <motion.button
        variants={itemVariants}
        onClick={onContinue}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all hover:shadow-xl active:scale-95"
      >
        Continue →
      </motion.button>
    </motion.div>
  );
}
