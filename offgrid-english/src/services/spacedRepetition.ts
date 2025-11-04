import { db } from '../db/database';
import type { ReviewData, Item } from '../types/schemas';

/**
 * SM-2 Spaced Repetition Algorithm
 *
 * Quality ratings:
 * 5 - perfect response
 * 4 - correct response after hesitation
 * 3 - correct response with difficulty
 * 2 - incorrect but remembered
 * 1 - incorrect, forgot
 * 0 - complete blackout
 *
 * For our use case:
 * - Correct answer on first try = 5
 * - Correct answer after reviewing feedback = 4
 * - Incorrect answer = 1
 */

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Initialize review data for a new item
 */
export function initializeReviewData(itemId: string): ReviewData {
  return {
    itemId,
    easinessFactor: 2.5, // Default starting ease factor
    interval: 0,
    repetitions: 0,
    lastReviewedAt: null,
    nextReviewAt: null,
    difficultyScore: 0.5 // Neutral difficulty
  };
}

/**
 * Update review data after an attempt using SM-2 algorithm
 * @param itemId - The item ID
 * @param quality - Quality rating (0-5), where 3+ is passing
 * @returns Updated review data
 */
export async function updateReviewData(itemId: string, quality: number): Promise<ReviewData> {
  // Get existing review data or initialize new
  let reviewData = await db.reviewData.get(itemId);
  if (!reviewData) {
    reviewData = initializeReviewData(itemId);
  }

  const now = Date.now();
  const isPassing = quality >= 3;

  // Calculate new ease factor (EF)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  let newEF = reviewData.easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Minimum EF is 1.3
  if (newEF < 1.3) {
    newEF = 1.3;
  }

  let newInterval: number;
  let newRepetitions: number;

  if (isPassing) {
    // Correct response - increase interval
    if (reviewData.repetitions === 0) {
      newInterval = 1; // 1 day
    } else if (reviewData.repetitions === 1) {
      newInterval = 6; // 6 days
    } else {
      newInterval = Math.round(reviewData.interval * newEF);
    }
    newRepetitions = reviewData.repetitions + 1;
  } else {
    // Incorrect response - reset to beginning
    newInterval = 1;
    newRepetitions = 0;
  }

  // Calculate next review time
  const nextReviewAt = now + (newInterval * MILLISECONDS_PER_DAY);

  // Update difficulty score (0 = easy, 1 = hard)
  // Based on: how often they get it wrong, and the ease factor
  const errorRate = 1 - (quality / 5);
  const easeDifficulty = (2.5 - newEF) / 1.2; // Normalized to 0-1
  const newDifficulty = (reviewData.difficultyScore * 0.7) + (errorRate * 0.2) + (easeDifficulty * 0.1);

  const updatedData: ReviewData = {
    itemId,
    easinessFactor: newEF,
    interval: newInterval,
    repetitions: newRepetitions,
    lastReviewedAt: now,
    nextReviewAt,
    difficultyScore: Math.min(1, Math.max(0, newDifficulty))
  };

  // Save to database
  await db.reviewData.put(updatedData);

  return updatedData;
}

/**
 * Get items that are due for review
 * Criteria:
 * 1. Items answered incorrectly at least once
 * 2. Items not reviewed in 3+ days
 * 3. Items with nextReviewAt in the past
 */
export async function getDueForReviewItems(limit: number = 20): Promise<Item[]> {
  const now = Date.now();
  const threeDaysAgo = now - (3 * MILLISECONDS_PER_DAY);

  // Get all review data where nextReviewAt is due or items not seen recently
  const dueReviews = await db.reviewData
    .where('nextReviewAt')
    .below(now)
    .toArray();

  // Get items with incorrect attempts
  const attempts = await db.attempts.toArray();
  const incorrectItemIds = new Set(
    attempts.filter(a => !a.isCorrect).map(a => a.itemId)
  );

  // Get items not attempted recently
  const recentAttempts = attempts.filter(a => a.timestamp > threeDaysAgo);
  const recentItemIds = new Set(recentAttempts.map(a => a.itemId));

  const allItems = await db.items.where({ formType: 'A' }).toArray();
  const unseenRecentlyIds = allItems
    .filter(item => !recentItemIds.has(item.id))
    .map(item => item.id);

  // Combine all criteria
  const candidateIds = new Set([
    ...dueReviews.map(r => r.itemId),
    ...incorrectItemIds,
    ...unseenRecentlyIds
  ]);

  // Get full item data
  const candidateItems = await db.items.bulkGet([...candidateIds]);
  const validItems = candidateItems.filter((item): item is Item => item !== undefined);

  // Sort by priority:
  // 1. Items with highest difficulty score
  // 2. Items due soonest
  // 3. Items never reviewed
  const itemsWithPriority = await Promise.all(
    validItems.map(async (item) => {
      const review = await db.reviewData.get(item.id);
      const incorrectCount = attempts.filter(a => a.itemId === item.id && !a.isCorrect).length;

      let priority = 0;
      if (review) {
        priority += review.difficultyScore * 100; // Weight by difficulty
        if (review.nextReviewAt && review.nextReviewAt < now) {
          priority += 50; // Boost overdue items
        }
      }
      priority += incorrectCount * 20; // Weight by incorrect attempts

      return { item, priority };
    })
  );

  // Sort by priority (descending) and return top N
  itemsWithPriority.sort((a, b) => b.priority - a.priority);
  return itemsWithPriority.slice(0, limit).map(x => x.item);
}

/**
 * Get review statistics for display
 */
export async function getReviewStats() {
  const now = Date.now();
  const allReviews = await db.reviewData.toArray();

  const dueNow = allReviews.filter(r => r.nextReviewAt && r.nextReviewAt < now).length;
  const dueSoon = allReviews.filter(r => {
    if (!r.nextReviewAt) return false;
    const tomorrow = now + MILLISECONDS_PER_DAY;
    return r.nextReviewAt < tomorrow && r.nextReviewAt >= now;
  }).length;

  const totalReviewed = allReviews.length;
  const averageEase = allReviews.reduce((sum, r) => sum + r.easinessFactor, 0) / (totalReviewed || 1);

  return {
    dueNow,
    dueSoon,
    totalReviewed,
    averageEase: averageEase.toFixed(2)
  };
}

/**
 * Convert attempt correctness to SM-2 quality score
 */
export function attemptToQuality(isCorrect: boolean, isFirstTry: boolean = true): number {
  if (isCorrect) {
    return isFirstTry ? 5 : 4; // Perfect or good
  } else {
    return 1; // Incorrect
  }
}
