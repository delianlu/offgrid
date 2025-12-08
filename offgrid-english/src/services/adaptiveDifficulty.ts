import { db } from '../db/database';
import type { Item, Attempt } from '../types/schemas';

/**
 * Performance metrics for an item
 */
export interface ItemPerformance {
  itemId: string;
  attempts: number;
  correctAttempts: number;
  accuracy: number; // 0-100
  avgResponseTime: number; // milliseconds
  lastAttemptedAt: number | null;
  recentAccuracy: number; // Last 3 attempts
  difficultyScore: number; // 0-1 (0=easy, 1=hard)
}

/**
 * Student's current performance level
 */
export interface PerformanceLevel {
  overallAccuracy: number; // 0-100
  recentAccuracy: number; // Last 10 items
  averageResponseTime: number;
  strengthAreas: string[]; // Transfer types with high accuracy
  weakAreas: string[]; // Transfer types with low accuracy
  confidenceLevel: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Calculate performance metrics for a specific item
 */
export async function calculateItemPerformance(itemId: string): Promise<ItemPerformance> {
  const attempts = await db.attempts.where({ itemId }).toArray();

  if (attempts.length === 0) {
    return {
      itemId,
      attempts: 0,
      correctAttempts: 0,
      accuracy: 0,
      avgResponseTime: 0,
      lastAttemptedAt: null,
      recentAccuracy: 0,
      difficultyScore: 0.5 // Medium difficulty for new items
    };
  }

  const correctAttempts = attempts.filter(a => a.isCorrect).length;
  const accuracy = (correctAttempts / attempts.length) * 100;

  // Calculate average response time (time between attempts)
  const responseTimes: number[] = [];
  for (let i = 1; i < attempts.length; i++) {
    const timeDiff = attempts[i].timestamp - attempts[i - 1].timestamp;
    if (timeDiff < 300000) { // Only count if less than 5 minutes (filter out session breaks)
      responseTimes.push(timeDiff);
    }
  }
  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0;

  // Recent accuracy (last 3 attempts)
  const recentAttempts = attempts.slice(-3);
  const recentCorrect = recentAttempts.filter(a => a.isCorrect).length;
  const recentAccuracy = (recentCorrect / recentAttempts.length) * 100;

  // Difficulty score calculation
  // Factors: low accuracy = harder, slow response = harder, many attempts = harder
  let difficultyScore = 0.5; // Start at medium

  if (accuracy < 50) difficultyScore += 0.3;
  else if (accuracy < 70) difficultyScore += 0.1;
  else if (accuracy > 90) difficultyScore -= 0.2;

  if (attempts.length > 3) difficultyScore += 0.1;
  if (recentAccuracy < accuracy) difficultyScore += 0.1; // Getting worse

  difficultyScore = Math.max(0, Math.min(1, difficultyScore)); // Clamp to 0-1

  return {
    itemId,
    attempts: attempts.length,
    correctAttempts,
    accuracy,
    avgResponseTime,
    lastAttemptedAt: attempts[attempts.length - 1]?.timestamp || null,
    recentAccuracy,
    difficultyScore
  };
}

/**
 * Calculate student's overall performance level
 */
export async function calculatePerformanceLevel(moduleId: string): Promise<PerformanceLevel> {
  const attempts = await db.attempts.where({ moduleId }).toArray();

  if (attempts.length === 0) {
    return {
      overallAccuracy: 0,
      recentAccuracy: 0,
      averageResponseTime: 0,
      strengthAreas: [],
      weakAreas: [],
      confidenceLevel: 'beginner'
    };
  }

  // Overall accuracy
  const correctAttempts = attempts.filter(a => a.isCorrect).length;
  const overallAccuracy = (correctAttempts / attempts.length) * 100;

  // Recent accuracy (last 10 items)
  const recentAttempts = attempts.slice(-10);
  const recentCorrect = recentAttempts.filter(a => a.isCorrect).length;
  const recentAccuracy = (recentCorrect / recentAttempts.length) * 100;

  // Average response time
  const responseTimes: number[] = [];
  for (let i = 1; i < attempts.length; i++) {
    const timeDiff = attempts[i].timestamp - attempts[i - 1].timestamp;
    if (timeDiff < 300000) {
      responseTimes.push(timeDiff);
    }
  }
  const averageResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0;

  // Analyze by transfer type
  const transferTypes = ['near', 'far', 'negative', 'positive', 'overgeneralization'] as const;
  const transferTypePerformance = new Map<string, { correct: number; total: number }>();

  for (const type of transferTypes) {
    const typeAttempts = attempts.filter(a => a.transferType === type);
    const typeCorrect = typeAttempts.filter(a => a.isCorrect).length;
    transferTypePerformance.set(type, { correct: typeCorrect, total: typeAttempts.length });
  }

  // Identify strengths and weaknesses
  const strengthAreas: string[] = [];
  const weakAreas: string[] = [];

  for (const [type, perf] of transferTypePerformance.entries()) {
    if (perf.total >= 3) { // Only consider if attempted at least 3 times
      const accuracy = (perf.correct / perf.total) * 100;
      if (accuracy >= 80) strengthAreas.push(type);
      if (accuracy < 60) weakAreas.push(type);
    }
  }

  // Determine confidence level
  let confidenceLevel: PerformanceLevel['confidenceLevel'];
  if (overallAccuracy >= 80 && attempts.length >= 20) {
    confidenceLevel = 'advanced';
  } else if (overallAccuracy >= 60 && attempts.length >= 10) {
    confidenceLevel = 'intermediate';
  } else {
    confidenceLevel = 'beginner';
  }

  return {
    overallAccuracy,
    recentAccuracy,
    averageResponseTime,
    strengthAreas,
    weakAreas,
    confidenceLevel
  };
}

/**
 * Select next question adaptively based on performance
 * Priority: weak areas > new items > moderate difficulty > review
 */
/**
 * Simple seeded random number generator (Linear Congruential Generator)
 */
function seededRandom(seed: number) {
  const m = 0x80000000;
  const a = 1103515245;
  const c = 12345;
  let state = seed ? seed : Math.floor(Math.random() * (m - 1));

  return function () {
    state = (a * state + c) % m;
    return state / (m - 1);
  };
}

/**
 * Select next question adaptively based on performance
 * Priority: weak areas > new items > moderate difficulty > review
 */
export async function selectNextQuestion(
  moduleId: string,
  formType: 'A' | 'B',
  attemptedItemIds: Set<string>,
  seed?: string
): Promise<Item | null> {
  // Get all items for this module and form
  const allDbItems = await db.items.toArray();
  const allItems = allDbItems.filter(i => i.moduleId === moduleId && i.formType === formType);

  if (allItems.length === 0) return null;

  // If seeded (Classroom Mode), use deterministic selection
  if (seed) {
    // Convert seed string (e.g., "LION-45") to number
    let seedNum = 0;
    for (let i = 0; i < seed.length; i++) {
      seedNum = ((seedNum << 5) - seedNum) + seed.charCodeAt(i);
      seedNum |= 0;
    }

    const rng = seededRandom(Math.abs(seedNum));

    // Filter out items already attempted in this session
    const availableItems = allItems.filter(item => !attemptedItemIds.has(item.id));

    // If all items attempted, reset (or handle as complete)
    if (availableItems.length === 0) return null;

    // Sort available items by ID to ensure consistent order before random selection
    availableItems.sort((a, b) => a.id.localeCompare(b.id));

    // Select random item using seeded RNG
    const randomIndex = Math.floor(rng() * availableItems.length);
    return availableItems[randomIndex];
  }

  // Normal Adaptive Mode (Unchanged logic)
  // Get performance level
  const perfLevel = await calculatePerformanceLevel(moduleId);

  // Get performance metrics for all items
  const itemPerformances = await Promise.all(
    allItems.map(item => calculateItemPerformance(item.id))
  );

  // Create scoring system for each item
  const itemScores = allItems.map((item, i) => {
    const perf = itemPerformances[i];
    let score = 0;

    // Factor 1: Prioritize weak areas (high weight)
    if (perfLevel.weakAreas.includes(item.transferType)) {
      score += 100;
    }

    // Factor 2: Prioritize items with low accuracy (if attempted before)
    if (perf.attempts > 0) {
      if (perf.accuracy < 50) score += 80;
      else if (perf.accuracy < 70) score += 50;
      else if (perf.accuracy >= 90) score -= 30; // Deprioritize mastered items
    }

    // Factor 3: New items (not attempted) get medium priority
    if (perf.attempts === 0) {
      score += 60;
    }

    // Factor 4: Don't repeat too soon (recency penalty)
    if (perf.lastAttemptedAt) {
      const hoursSinceLastAttempt = (Date.now() - perf.lastAttemptedAt) / (1000 * 60 * 60);
      if (hoursSinceLastAttempt < 0.5) score -= 40; // Less than 30 min ago
      else if (hoursSinceLastAttempt < 2) score -= 20; // Less than 2 hours ago
    }

    // Factor 5: If student is struggling (recent accuracy < 50%), give easier items
    if (perfLevel.recentAccuracy < 50 && perf.attempts > 0 && perf.accuracy > 70) {
      score += 40; // Boost easier items for confidence
    }

    // Factor 6: If student is doing well (recent accuracy > 80%), challenge more
    if (perfLevel.recentAccuracy > 80 && perf.attempts > 0 && perf.accuracy < 70) {
      score += 30; // Introduce harder items
    }

    // Factor 7: Items attempted in current session get lower priority
    if (attemptedItemIds.has(item.id)) {
      score -= 50;
    }

    return { item, score };
  });

  // Sort by score (descending) and return highest scoring item
  itemScores.sort((a, b) => b.score - a.score);

  // Add some randomness to top 3 items to avoid predictability
  const topItems = itemScores.slice(0, Math.min(3, itemScores.length));
  const randomIndex = Math.floor(Math.random() * topItems.length);

  return topItems[randomIndex]?.item || allItems[0];
}

/**
 * Get recommended difficulty adjustment message
 */
export function getDifficultyMessage(perfLevel: PerformanceLevel): string {
  if (perfLevel.recentAccuracy >= 90) {
    return "Excellent work! Increasing challenge level.";
  } else if (perfLevel.recentAccuracy >= 75) {
    return "You're doing great! Keep it up.";
  } else if (perfLevel.recentAccuracy >= 60) {
    return "Good progress. Let's focus on weak areas.";
  } else if (perfLevel.recentAccuracy >= 40) {
    return "Take your time. We'll review some easier concepts.";
  } else {
    return "Let's slow down and reinforce the basics.";
  }
}
