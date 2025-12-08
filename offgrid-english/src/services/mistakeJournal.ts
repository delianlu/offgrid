import { db } from '../db/database';
import type { MistakeJournalEntry } from '../types/schemas';

/**
 * Record a mistake in the mistake journal
 */
export async function recordMistake(
  itemId: string,
  moduleId: string,
  questionText: string,
  studentAnswer: string,
  correctAnswer: string,
  userId?: string
): Promise<void> {
  const now = Date.now();

  // Check if this mistake already exists
  const existingMistakes = await db.mistakes
    .where('[itemId+studentAnswer]')
    .equals([itemId, studentAnswer])
    .toArray();

  if (existingMistakes.length > 0) {
    // Update existing mistake
    const mistake = existingMistakes[0];
    await db.mistakes.update(mistake.id, {
      attemptCount: mistake.attemptCount + 1,
      lastSeenAt: now,
      resolved: false, // Mark as unresolved again
      userId: userId || mistake.userId // Update userId if provided
    });
  } else {
    // Create new mistake entry
    const mistake: MistakeJournalEntry = {
      id: `mistake-${itemId}-${Date.now()}`,
      itemId,
      moduleId,
      questionText,
      studentAnswer,
      correctAnswer,
      timestamp: now,
      attemptCount: 1,
      lastSeenAt: now,
      resolved: false,
      userId // Add userId
    };
    await db.mistakes.add(mistake);
  }
}

/**
 * Get all unresolved mistakes
 */
export async function getUnresolvedMistakes(): Promise<MistakeJournalEntry[]> {
  return db.mistakes
    .where('resolved')
    .equals(0)
    .reverse()
    .sortBy('lastSeenAt');
}

/**
 * Get all mistakes (resolved and unresolved)
 */
export async function getAllMistakes(): Promise<MistakeJournalEntry[]> {
  return db.mistakes
    .toArray()
    .then(mistakes => mistakes.sort((a, b) => b.lastSeenAt - a.lastSeenAt));
}

/**
 * Get mistakes by module
 */
export async function getMistakesByModule(moduleId: string): Promise<MistakeJournalEntry[]> {
  return db.mistakes
    .where('moduleId')
    .equals(moduleId)
    .reverse()
    .sortBy('lastSeenAt');
}

/**
 * Mark a mistake as resolved
 */
export async function markMistakeAsResolved(mistakeId: string): Promise<void> {
  await db.mistakes.update(mistakeId, { resolved: true });
}

/**
 * Delete a mistake from the journal
 */
export async function deleteMistake(mistakeId: string): Promise<void> {
  await db.mistakes.delete(mistakeId);
}

/**
 * Get mistake statistics
 */
export async function getMistakeStats(): Promise<{
  total: number;
  unresolved: number;
  resolved: number;
  byModule: Record<string, number>;
}> {
  const allMistakes = await getAllMistakes();
  const unresolved = allMistakes.filter(m => !m.resolved);

  const byModule: Record<string, number> = {};
  for (const mistake of unresolved) {
    byModule[mistake.moduleId] = (byModule[mistake.moduleId] || 0) + 1;
  }

  return {
    total: allMistakes.length,
    unresolved: unresolved.length,
    resolved: allMistakes.length - unresolved.length,
    byModule
  };
}

/**
 * Clear all resolved mistakes older than 30 days
 */
export async function cleanupOldMistakes(): Promise<number> {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const oldMistakes = await db.mistakes
    .where('resolved')
    .equals(1)
    .and(m => m.lastSeenAt < thirtyDaysAgo)
    .toArray();

  for (const mistake of oldMistakes) {
    await db.mistakes.delete(mistake.id);
  }

  return oldMistakes.length;
}
