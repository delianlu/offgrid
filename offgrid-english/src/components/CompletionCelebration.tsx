import { motion } from 'framer-motion';
import { Button } from './common/Button';

interface CompletionCelebrationProps {
  moduleName: string;
  xpEarned: number;
  totalXP: number;
  itemsCompleted: number;
  onContinue: () => void;
  phaseType?: 'phase2' | 'module';
}

export function CompletionCelebration({
  moduleName,
  xpEarned,
  totalXP,
  itemsCompleted,
  onContinue,
  phaseType = 'module'
}: CompletionCelebrationProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
      >
        {/* Animated Emoji */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.2
          }}
          className="text-8xl mb-4"
        >
          🎉
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-gray-900 mb-2"
        >
          {phaseType === 'phase2' ? 'Phase 2 Complete!' : 'Module Complete!'}
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-700 mb-6"
        >
          You mastered {moduleName}!
        </motion.p>

        {/* XP Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl p-6 mb-6 shadow-lg"
        >
          <motion.p
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 10,
              delay: 0.6
            }}
            className="text-5xl font-bold text-orange-600 mb-2"
          >
            +{xpEarned} XP
          </motion.p>
          <p className="text-sm text-gray-600">Total: {totalXP} XP</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-50 rounded-xl p-4 mb-6"
        >
          <div className="flex justify-center items-center gap-2 text-gray-700">
            <span className="text-2xl">✅</span>
            <span className="font-semibold">{itemsCompleted} lessons completed</span>
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            onClick={onContinue}
            variant="primary"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            {phaseType === 'phase2' ? 'Continue to Phase 3 →' : 'Back to Home →'}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
