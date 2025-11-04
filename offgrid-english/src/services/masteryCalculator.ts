import { db } from '../db/database';
import type { Module } from '../types/schemas';

export interface ModuleMastery {
  moduleId: string;
  moduleName: string;
  category: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracyPercentage: number;
  lastAttemptedAt: number | null;
}

/**
 * Calculate mastery statistics for all modules based on attempt history
 */
export async function calculateModuleMastery(): Promise<ModuleMastery[]> {
  const modules = await db.modules.toArray();
  const attempts = await db.attempts.toArray();

  const masteryData: ModuleMastery[] = [];

  for (const module of modules) {
    const moduleAttempts = attempts.filter(a => a.moduleId === module.id);
    const correctAttempts = moduleAttempts.filter(a => a.isCorrect);
    const lastAttempt = moduleAttempts.length > 0
      ? Math.max(...moduleAttempts.map(a => a.timestamp))
      : null;

    const accuracy = moduleAttempts.length > 0
      ? (correctAttempts.length / moduleAttempts.length) * 100
      : 0;

    masteryData.push({
      moduleId: module.id,
      moduleName: module.name,
      category: module.category,
      totalAttempts: moduleAttempts.length,
      correctAttempts: correctAttempts.length,
      accuracyPercentage: accuracy,
      lastAttemptedAt: lastAttempt
    });
  }

  return masteryData;
}

/**
 * Get the weakest modules based on accuracy and attempt count
 * Prioritizes modules with lower accuracy and sufficient attempts (min 3)
 */
export function getWeakestModules(masteryData: ModuleMastery[], count: number = 2): ModuleMastery[] {
  // Filter modules with at least 3 attempts
  const attempted = masteryData.filter(m => m.totalAttempts >= 3);

  // If less than 2 modules have sufficient attempts, include unattempted or low-attempt modules
  if (attempted.length < count) {
    const unattempted = masteryData
      .filter(m => m.totalAttempts < 3)
      .sort((a, b) => a.totalAttempts - b.totalAttempts);
    return [...attempted, ...unattempted].slice(0, count);
  }

  // Sort by accuracy (ascending) - worst performers first
  return attempted
    .sort((a, b) => a.accuracyPercentage - b.accuracyPercentage)
    .slice(0, count);
}

/**
 * Select smart practice questions from weakest modules
 * Returns 10 items distributed across the weakest modules
 */
export async function selectSmartPracticeItems(weakModules: ModuleMastery[]): Promise<string[]> {
  const itemsPerModule = Math.ceil(10 / weakModules.length);
  const selectedItemIds: string[] = [];

  for (const module of weakModules) {
    // Get all items for this module (Form A only for practice)
    const moduleItems = await db.items
      .where({ moduleId: module.moduleId, formType: 'A' })
      .toArray();

    // Get attempts for these items to find which ones were answered incorrectly or not attempted
    const attempts = await db.attempts
      .where('moduleId')
      .equals(module.moduleId)
      .toArray();

    const attemptedItemIds = new Set(attempts.map(a => a.itemId));
    const incorrectItemIds = new Set(
      attempts.filter(a => !a.isCorrect).map(a => a.itemId)
    );

    // Prioritize: 1) Previously incorrect, 2) Not attempted, 3) Random
    const incorrectItems = moduleItems.filter(item => incorrectItemIds.has(item.id));
    const unattemptedItems = moduleItems.filter(item => !attemptedItemIds.has(item.id));
    const otherItems = moduleItems.filter(
      item => !incorrectItemIds.has(item.id) && attemptedItemIds.has(item.id)
    );

    const prioritizedItems = [...incorrectItems, ...unattemptedItems, ...otherItems];

    // Shuffle and take the required number
    const shuffled = prioritizedItems.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, itemsPerModule);

    selectedItemIds.push(...selected.map(item => item.id));
  }

  // Return exactly 10 items (or fewer if not enough available)
  return selectedItemIds.slice(0, 10);
}
