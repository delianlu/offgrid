import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Achievement } from '../services/achievements';

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  return (
    <AnimatePresence>
      {isVisible && achievement && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20
          }}
          className="fixed bottom-6 right-6 z-50 max-w-md"
        >
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl shadow-2xl p-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-4">
                {/* Icon with animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 10,
                    delay: 0.2
                  }}
                  className="text-5xl"
                >
                  {achievement.icon}
                </motion.div>

                {/* Content */}
                <div className="flex-1">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="text-sm font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide mb-1">
                      Achievement Unlocked!
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {achievement.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {achievement.description}
                    </p>
                  </motion.div>
                </div>

                {/* Close button */}
                <button
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
