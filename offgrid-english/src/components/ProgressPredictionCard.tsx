import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  predictLearningTrajectory,
  getPersonalizedRecommendations,
  type LearningTrajectory
} from '../services/progressPrediction';

export function ProgressPredictionCard() {
  const [trajectory, setTrajectory] = useState<LearningTrajectory | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPredictions();
  }, []);

  async function loadPredictions() {
    setLoading(true);
    try {
      const traj = await predictLearningTrajectory();
      const recs = await getPersonalizedRecommendations();
      setTrajectory(traj);
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to load predictions:', error);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-center">
          <div className="text-white text-sm">Loading predictions...</div>
        </div>
      </div>
    );
  }

  if (!trajectory || trajectory.overallAccuracy === 0) {
    return (
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 shadow-lg text-white">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🔮</span>
          <h3 className="font-bold text-xl">Progress Prediction</h3>
        </div>
        <p className="text-indigo-100 text-sm">
          Complete more lessons to unlock personalized predictions!
        </p>
      </div>
    );
  }

  const patternIcon = {
    accelerating: '🚀',
    steady: '📈',
    declining: '📉'
  }[trajectory.learningPattern];

  const patternText = {
    accelerating: 'Accelerating',
    steady: 'Steady Progress',
    declining: 'Needs Attention'
  }[trajectory.learningPattern];

  const confidenceColor = {
    low: 'text-yellow-200',
    medium: 'text-green-200',
    high: 'text-green-100'
  }[trajectory.confidenceLevel];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 shadow-lg text-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔮</span>
          <div>
            <h3 className="font-bold text-xl">Progress Prediction</h3>
            <p className={`text-xs ${confidenceColor}`}>
              {trajectory.confidenceLevel} confidence
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl">{patternIcon}</div>
          <div className="text-xs text-indigo-100">{patternText}</div>
        </div>
      </div>

      {/* Current vs Predicted */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <div className="text-xs text-indigo-200 mb-1">Current</div>
          <div className="text-2xl font-bold">
            {Math.round(trajectory.overallAccuracy)}%
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <div className="text-xs text-indigo-200 mb-1">In 7 Days</div>
          <div className="text-2xl font-bold">
            {Math.round(trajectory.predictedAccuracyIn7Days)}%
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <div className="text-xs text-indigo-200 mb-1">In 30 Days</div>
          <div className="text-2xl font-bold">
            {Math.round(trajectory.predictedAccuracyIn30Days)}%
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-2 mb-4">
          <div className="text-sm font-semibold text-indigo-100">AI Insights:</div>
          {recommendations.slice(0, 3).map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm"
            >
              {rec}
            </motion.div>
          ))}
        </div>
      )}

      {/* Completion Estimate */}
      {trajectory.estimatedCompletionDate && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-indigo-200 mb-1">Estimated Completion</div>
              <div className="text-sm font-bold">
                {trajectory.estimatedCompletionDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
            <span className="text-2xl">🎯</span>
          </div>
        </div>
      )}

      {/* View Details Link */}
      <Link
        to="/progress-report"
        className="block text-center py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
      >
        View Detailed Analysis →
      </Link>
    </motion.div>
  );
}
