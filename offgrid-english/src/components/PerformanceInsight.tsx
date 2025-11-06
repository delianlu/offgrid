import { motion } from 'framer-motion';
import type { PerformanceLevel } from '../services/adaptiveDifficulty';

interface PerformanceInsightProps {
  performanceLevel: PerformanceLevel;
  message: string;
}

export function PerformanceInsight({ performanceLevel, message }: PerformanceInsightProps) {
  const { confidenceLevel, recentAccuracy, weakAreas, strengthAreas } = performanceLevel;

  // Choose colors based on confidence level
  const levelColors = {
    beginner: {
      bg: 'bg-blue-100',
      border: 'border-blue-300',
      text: 'text-blue-800',
      icon: '🌱'
    },
    intermediate: {
      bg: 'bg-green-100',
      border: 'border-green-300',
      text: 'text-green-800',
      icon: '🌿'
    },
    advanced: {
      bg: 'bg-purple-100',
      border: 'border-purple-300',
      text: 'text-purple-800',
      icon: '🌟'
    }
  };

  const colors = levelColors[confidenceLevel];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${colors.bg} border-2 ${colors.border} rounded-xl p-4 mb-4`}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{colors.icon}</span>
        <div className="flex-1">
          <h3 className={`font-bold ${colors.text} text-sm uppercase tracking-wide`}>
            {confidenceLevel.charAt(0).toUpperCase() + confidenceLevel.slice(1)} Level
          </h3>
          <p className={`${colors.text} text-sm mt-1`}>{message}</p>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
        {/* Recent Accuracy */}
        <div className={`bg-white/50 rounded-lg p-2`}>
          <div className="text-xs text-gray-600 font-medium">Recent Accuracy</div>
          <div className={`text-lg font-bold ${colors.text}`}>
            {Math.round(recentAccuracy)}%
          </div>
        </div>

        {/* Strengths */}
        <div className={`bg-white/50 rounded-lg p-2`}>
          <div className="text-xs text-gray-600 font-medium">Strengths</div>
          <div className={`text-lg font-bold ${colors.text}`}>
            {strengthAreas.length > 0 ? strengthAreas.length : '—'}
          </div>
        </div>

        {/* Focus Areas */}
        <div className={`bg-white/50 rounded-lg p-2`}>
          <div className="text-xs text-gray-600 font-medium">Focus Areas</div>
          <div className={`text-lg font-bold ${colors.text}`}>
            {weakAreas.length > 0 ? weakAreas.length : '—'}
          </div>
        </div>
      </div>

      {/* Weak areas hint */}
      {weakAreas.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 text-xs text-gray-600 bg-white/50 rounded-lg p-2"
        >
          <span className="font-medium">💡 We'll focus on:</span>{' '}
          <span className="capitalize">{weakAreas.join(', ')}</span>
        </motion.div>
      )}
    </motion.div>
  );
}
