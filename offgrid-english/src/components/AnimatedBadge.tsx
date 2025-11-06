import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedBadgeProps {
  icon: string;
  title: string;
  description: string;
  color: 'gold' | 'silver' | 'bronze' | 'purple' | 'blue' | 'green';
  show: boolean;
  onComplete?: () => void;
  duration?: number; // How long to show the badge (ms)
}

const colorConfigs = {
  gold: {
    gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
    glow: 'shadow-yellow-500/50',
    ring: 'ring-yellow-400'
  },
  silver: {
    gradient: 'from-gray-300 via-gray-400 to-gray-500',
    glow: 'shadow-gray-400/50',
    ring: 'ring-gray-300'
  },
  bronze: {
    gradient: 'from-orange-400 via-orange-500 to-orange-600',
    glow: 'shadow-orange-500/50',
    ring: 'ring-orange-400'
  },
  purple: {
    gradient: 'from-purple-400 via-purple-500 to-purple-600',
    glow: 'shadow-purple-500/50',
    ring: 'ring-purple-400'
  },
  blue: {
    gradient: 'from-blue-400 via-blue-500 to-blue-600',
    glow: 'shadow-blue-500/50',
    ring: 'ring-blue-400'
  },
  green: {
    gradient: 'from-green-400 via-green-500 to-green-600',
    glow: 'shadow-green-500/50',
    ring: 'ring-green-400'
  }
};

export function AnimatedBadge({
  icon,
  title,
  description,
  color,
  show,
  onComplete,
  duration = 4000
}: AnimatedBadgeProps) {
  const [isVisible, setIsVisible] = useState(show);
  const config = colorConfigs[color];

  useEffect(() => {
    if (show) {
      setIsVisible(true);

      // Auto-hide after duration
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) {
          setTimeout(onComplete, 500); // Wait for exit animation
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{
            scale: 1,
            rotate: 0,
            opacity: 1
          }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15
          }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto"
            onClick={() => setIsVisible(false)}
          />

          {/* Badge */}
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative pointer-events-auto"
          >
            {/* Glow effect */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className={`absolute inset-0 rounded-full blur-2xl ${config.glow}`}
            />

            {/* Badge container */}
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-sm">
              {/* Shine effect */}
              <motion.div
                animate={{
                  x: [-300, 300],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 1.5,
                  delay: 0.5,
                  ease: 'easeInOut'
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                style={{ transform: 'skewX(-20deg)' }}
              />

              {/* Badge icon with ring */}
              <div className="flex justify-center mb-4">
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className={`
                    relative w-32 h-32 rounded-full
                    bg-gradient-to-br ${config.gradient}
                    ring-8 ${config.ring} ring-opacity-50
                    flex items-center justify-center
                    shadow-2xl ${config.glow}
                  `}
                >
                  {/* Rotating sparkles */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                    className="absolute inset-0"
                  >
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 text-2xl">✨</span>
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-2xl">✨</span>
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl">✨</span>
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 text-2xl">✨</span>
                  </motion.div>

                  {/* Icon */}
                  <span className="text-6xl relative z-10">{icon}</span>
                </motion.div>
              </div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-center text-gray-800 mb-2"
              >
                {title}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center text-gray-600"
              >
                {description}
              </motion.p>

              {/* Tap to dismiss hint */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center text-xs text-gray-400 mt-4"
              >
                Tap anywhere to continue
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Compact animated badge for inline displays
 */
export function CompactBadge({
  icon,
  label,
  color
}: {
  icon: string;
  label: string;
  color: keyof typeof colorConfigs;
}) {
  const config = colorConfigs[color];

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      whileHover={{ scale: 1.1, rotate: 5 }}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-full
        bg-gradient-to-r ${config.gradient}
        text-white font-bold shadow-lg ${config.glow}
      `}
    >
      <motion.span
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        className="text-xl"
      >
        {icon}
      </motion.span>
      <span className="text-sm">{label}</span>
    </motion.div>
  );
}
