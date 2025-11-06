import { db } from '../db/database';
import { calculatePerformanceLevel, calculateItemPerformance } from './adaptiveDifficulty';

/**
 * Prediction for a specific module
 */
export interface ModulePrediction {
  moduleId: string;
  moduleName: string;
  currentAccuracy: number;
  predictedAccuracy: number; // After next 10 attempts
  estimatedDaysToMastery: number; // Days to reach 90% accuracy
  confidence: number; // 0-100, how confident the prediction is
  recommendedDailyPractice: number; // Minutes per day
  learningVelocity: number; // Rate of improvement (% per day)
  riskLevel: 'low' | 'medium' | 'high'; // Risk of forgetting
}

/**
 * Overall learning trajectory prediction
 */
export interface LearningTrajectory {
  overallAccuracy: number;
  predictedAccuracyIn7Days: number;
  predictedAccuracyIn30Days: number;
  estimatedCompletionDate: Date | null;
  confidenceLevel: 'low' | 'medium' | 'high';
  projectedMasteryModules: string[]; // Modules likely to master soon
  atRiskModules: string[]; // Modules at risk of performance decline
  learningPattern: 'accelerating' | 'steady' | 'declining';
}

/**
 * Calculate learning velocity (rate of improvement)
 */
async function calculateLearningVelocity(moduleId: string): Promise<number> {
  const attempts = await db.attempts.where({ moduleId }).toArray();

  if (attempts.length < 5) return 0; // Not enough data

  // Sort by timestamp
  attempts.sort((a, b) => a.timestamp - b.timestamp);

  // Split into early and recent attempts
  const midpoint = Math.floor(attempts.length / 2);
  const earlyAttempts = attempts.slice(0, midpoint);
  const recentAttempts = attempts.slice(midpoint);

  const earlyAccuracy = earlyAttempts.filter(a => a.isCorrect).length / earlyAttempts.length;
  const recentAccuracy = recentAttempts.filter(a => a.isCorrect).length / recentAttempts.length;

  // Calculate days between early and recent
  const earlyTime = earlyAttempts[earlyAttempts.length - 1].timestamp;
  const recentTime = recentAttempts[recentAttempts.length - 1].timestamp;
  const daysDiff = (recentTime - earlyTime) / (1000 * 60 * 60 * 24);

  if (daysDiff < 0.1) return 0; // Too close in time

  // Velocity = change in accuracy / days
  return ((recentAccuracy - earlyAccuracy) * 100) / daysDiff;
}

/**
 * Predict future accuracy using linear regression
 */
function predictFutureAccuracy(
  currentAccuracy: number,
  velocity: number,
  daysAhead: number
): number {
  // Simple linear prediction with bounds
  const predicted = currentAccuracy + (velocity * daysAhead);
  return Math.max(0, Math.min(100, predicted));
}

/**
 * Calculate forgetting risk based on recency
 */
async function calculateRiskLevel(moduleId: string): Promise<'low' | 'medium' | 'high'> {
  const attempts = await db.attempts.where({ moduleId }).toArray();

  if (attempts.length === 0) return 'low';

  // Get last attempt timestamp
  const lastAttempt = Math.max(...attempts.map(a => a.timestamp));
  const daysSinceLastPractice = (Date.now() - lastAttempt) / (1000 * 60 * 60 * 24);

  // Calculate recent accuracy
  const recentAttempts = attempts.slice(-10);
  const recentAccuracy = (recentAttempts.filter(a => a.isCorrect).length / recentAttempts.length) * 100;

  // High risk if not practiced recently AND accuracy is not high
  if (daysSinceLastPractice > 7 && recentAccuracy < 80) return 'high';
  if (daysSinceLastPractice > 3 && recentAccuracy < 90) return 'medium';
  return 'low';
}

/**
 * Estimate days to mastery (90% accuracy)
 */
function estimateDaysToMastery(
  currentAccuracy: number,
  velocity: number
): number {
  const target = 90;

  if (currentAccuracy >= target) return 0; // Already mastered
  if (velocity <= 0) return Infinity; // Not improving

  return Math.ceil((target - currentAccuracy) / velocity);
}

/**
 * Calculate confidence in prediction
 */
function calculatePredictionConfidence(
  attemptsCount: number,
  velocity: number,
  daysSinceLastPractice: number
): number {
  let confidence = 0;

  // More attempts = more confidence (max 50 points)
  confidence += Math.min(50, attemptsCount * 2);

  // Consistent velocity = more confidence (max 30 points)
  if (Math.abs(velocity) < 5) confidence += 30; // Stable learning
  else if (Math.abs(velocity) < 10) confidence += 15; // Moderate variance

  // Recent practice = more confidence (max 20 points)
  if (daysSinceLastPractice < 1) confidence += 20;
  else if (daysSinceLastPractice < 3) confidence += 10;

  return Math.min(100, confidence);
}

/**
 * Predict progress for a specific module
 */
export async function predictModuleProgress(moduleId: string): Promise<ModulePrediction | null> {
  const module = await db.modules.get(moduleId);
  if (!module) return null;

  const attempts = await db.attempts.where({ moduleId }).toArray();

  if (attempts.length < 3) {
    // Not enough data for prediction
    return {
      moduleId,
      moduleName: module.name,
      currentAccuracy: 0,
      predictedAccuracy: 0,
      estimatedDaysToMastery: Infinity,
      confidence: 0,
      recommendedDailyPractice: 15,
      learningVelocity: 0,
      riskLevel: 'low'
    };
  }

  // Calculate current accuracy
  const correct = attempts.filter(a => a.isCorrect).length;
  const currentAccuracy = (correct / attempts.length) * 100;

  // Calculate learning velocity
  const velocity = await calculateLearningVelocity(moduleId);

  // Predict accuracy after next 10 attempts (assuming ~1 week)
  const predictedAccuracy = predictFutureAccuracy(currentAccuracy, velocity, 7);

  // Estimate days to mastery
  const daysToMastery = estimateDaysToMastery(currentAccuracy, velocity);

  // Calculate risk level
  const riskLevel = await calculateRiskLevel(moduleId);

  // Calculate confidence
  const lastAttempt = Math.max(...attempts.map(a => a.timestamp));
  const daysSinceLastPractice = (Date.now() - lastAttempt) / (1000 * 60 * 60 * 24);
  const confidence = calculatePredictionConfidence(attempts.length, velocity, daysSinceLastPractice);

  // Recommended practice time (inverse to current performance)
  const recommendedDailyPractice = currentAccuracy < 50 ? 30 : currentAccuracy < 70 ? 20 : 15;

  return {
    moduleId,
    moduleName: module.name,
    currentAccuracy,
    predictedAccuracy,
    estimatedDaysToMastery: daysToMastery,
    confidence,
    recommendedDailyPractice,
    learningVelocity: velocity,
    riskLevel
  };
}

/**
 * Predict overall learning trajectory
 */
export async function predictLearningTrajectory(): Promise<LearningTrajectory> {
  const modules = await db.modules.toArray();
  const allAttempts = await db.attempts.toArray();

  if (allAttempts.length < 10) {
    // Not enough data
    return {
      overallAccuracy: 0,
      predictedAccuracyIn7Days: 0,
      predictedAccuracyIn30Days: 0,
      estimatedCompletionDate: null,
      confidenceLevel: 'low',
      projectedMasteryModules: [],
      atRiskModules: [],
      learningPattern: 'steady'
    };
  }

  // Overall current accuracy
  const correct = allAttempts.filter(a => a.isCorrect).length;
  const overallAccuracy = (correct / allAttempts.length) * 100;

  // Analyze trend over time
  const sortedAttempts = [...allAttempts].sort((a, b) => a.timestamp - b.timestamp);
  const recentThird = sortedAttempts.slice(-Math.floor(sortedAttempts.length / 3));
  const middleThird = sortedAttempts.slice(
    Math.floor(sortedAttempts.length / 3),
    Math.floor((2 * sortedAttempts.length) / 3)
  );

  const recentAccuracy = (recentThird.filter(a => a.isCorrect).length / recentThird.length) * 100;
  const middleAccuracy = (middleThird.filter(a => a.isCorrect).length / middleThird.length) * 100;

  // Determine learning pattern
  let learningPattern: 'accelerating' | 'steady' | 'declining';
  if (recentAccuracy > middleAccuracy + 5) learningPattern = 'accelerating';
  else if (recentAccuracy < middleAccuracy - 5) learningPattern = 'declining';
  else learningPattern = 'steady';

  // Calculate overall velocity
  const firstQuarter = sortedAttempts.slice(0, Math.floor(sortedAttempts.length / 4));
  const lastQuarter = sortedAttempts.slice(-Math.floor(sortedAttempts.length / 4));

  const firstAccuracy = (firstQuarter.filter(a => a.isCorrect).length / firstQuarter.length) * 100;
  const lastAccuracy = (lastQuarter.filter(a => a.isCorrect).length / lastQuarter.length) * 100;

  const firstTime = firstQuarter[firstQuarter.length - 1].timestamp;
  const lastTime = lastQuarter[lastQuarter.length - 1].timestamp;
  const daysDiff = (lastTime - firstTime) / (1000 * 60 * 60 * 24);

  const overallVelocity = daysDiff > 0 ? (lastAccuracy - firstAccuracy) / daysDiff : 0;

  // Predict future accuracy
  const predictedAccuracyIn7Days = predictFutureAccuracy(overallAccuracy, overallVelocity, 7);
  const predictedAccuracyIn30Days = predictFutureAccuracy(overallAccuracy, overallVelocity, 30);

  // Get module predictions
  const modulePredictions = await Promise.all(
    modules.map(m => predictModuleProgress(m.id))
  );

  // Filter valid predictions
  const validPredictions = modulePredictions.filter(p => p !== null) as ModulePrediction[];

  // Projected mastery modules (will reach 90% in next 14 days)
  const projectedMasteryModules = validPredictions
    .filter(p => p.estimatedDaysToMastery <= 14 && p.estimatedDaysToMastery > 0)
    .map(p => p.moduleName);

  // At-risk modules
  const atRiskModules = validPredictions
    .filter(p => p.riskLevel === 'high')
    .map(p => p.moduleName);

  // Estimate completion date (when all modules reach 90%)
  const maxDaysToMastery = Math.max(
    ...validPredictions.map(p => p.estimatedDaysToMastery).filter(d => d !== Infinity)
  );

  const estimatedCompletionDate = maxDaysToMastery !== -Infinity && maxDaysToMastery < 365
    ? new Date(Date.now() + maxDaysToMastery * 24 * 60 * 60 * 1000)
    : null;

  // Confidence level
  const avgConfidence = validPredictions.reduce((sum, p) => sum + p.confidence, 0) / validPredictions.length;
  const confidenceLevel: 'low' | 'medium' | 'high' =
    avgConfidence > 70 ? 'high' : avgConfidence > 40 ? 'medium' : 'low';

  return {
    overallAccuracy,
    predictedAccuracyIn7Days,
    predictedAccuracyIn30Days,
    estimatedCompletionDate,
    confidenceLevel,
    projectedMasteryModules,
    atRiskModules,
    learningPattern
  };
}

/**
 * Get personalized recommendations based on predictions
 */
export async function getPersonalizedRecommendations(): Promise<string[]> {
  const trajectory = await predictLearningTrajectory();
  const modules = await db.modules.toArray();
  const recommendations: string[] = [];

  // Pattern-based recommendations
  if (trajectory.learningPattern === 'declining') {
    recommendations.push("📉 Your performance is declining. Take a break and review fundamentals.");
  } else if (trajectory.learningPattern === 'accelerating') {
    recommendations.push("🚀 You're on fire! Keep up the momentum.");
  }

  // At-risk modules
  if (trajectory.atRiskModules.length > 0) {
    recommendations.push(
      `⚠️ Review these modules: ${trajectory.atRiskModules.slice(0, 2).join(', ')}`
    );
  }

  // Near-mastery modules
  if (trajectory.projectedMasteryModules.length > 0) {
    recommendations.push(
      `🎯 You're close to mastering: ${trajectory.projectedMasteryModules.slice(0, 2).join(', ')}`
    );
  }

  // Completion date
  if (trajectory.estimatedCompletionDate) {
    const days = Math.ceil(
      (trajectory.estimatedCompletionDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    recommendations.push(`📅 Estimated completion: ${days} days (${trajectory.estimatedCompletionDate.toLocaleDateString()})`);
  }

  // Practice frequency
  const allAttempts = await db.attempts.toArray();
  if (allAttempts.length > 0) {
    const lastAttempt = Math.max(...allAttempts.map(a => a.timestamp));
    const daysSinceLastPractice = (Date.now() - lastAttempt) / (1000 * 60 * 60 * 24);

    if (daysSinceLastPractice > 3) {
      recommendations.push("⏰ It's been a while! Daily practice helps retention.");
    }
  }

  return recommendations;
}
