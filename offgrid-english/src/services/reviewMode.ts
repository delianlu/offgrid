import { db } from '../db/database';
import type { Item } from '../types/schemas';

export interface ReviewStats {
  totalDue: number;
  byModule: Record<string, number>;
}

/**
 * Get all items due for review based on spaced repetition schedule
 */
export async function getItemsDueForReview(): Promise<Item[]> {
  const now = Date.now();

  // Get all review data
  const allReviews = await db.reviewData.toArray();

  // Filter items where nextReview <= now
  const dueItemIds = allReviews
    .filter(review => review.nextReview <= now)
    .map(review => review.itemId);

  if (dueItemIds.length === 0) {
    return [];
  }

  // Get the actual items
  const items = await db.items
    .where('id')
    .anyOf(dueItemIds)
    .toArray();

  // Shuffle items for variety
  return shuffleArray(items);
}

/**
 * Get review statistics
 */
export async function getReviewStats(): Promise<ReviewStats> {
  const now = Date.now();
  const allReviews = await db.reviewData.toArray();

  const dueReviews = allReviews.filter(review => review.nextReview <= now);
  const totalDue = dueReviews.length;

  // Group by module
  const byModule: Record<string, number> = {};

  for (const review of dueReviews) {
    const item = await db.items.get(review.itemId);
    if (item) {
      byModule[item.moduleId] = (byModule[item.moduleId] || 0) + 1;
    }
  }

  return { totalDue, byModule };
}

/**
 * Get items for a specific module review
 */
export async function getModuleReviewItems(moduleId: string): Promise<Item[]> {
  const now = Date.now();

  // Get all review data for this module's items
  const allItems = await db.items.where({ moduleId }).toArray();
  const itemIds = allItems.map(item => item.id);

  const reviews = await db.reviewData
    .where('itemId')
    .anyOf(itemIds)
    .toArray();

  // Filter due items
  const dueItemIds = reviews
    .filter(review => review.nextReview <= now)
    .map(review => review.itemId);

  if (dueItemIds.length === 0) {
    return [];
  }

  const dueItems = allItems.filter(item => dueItemIds.includes(item.id));

  return shuffleArray(dueItems);
}

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
