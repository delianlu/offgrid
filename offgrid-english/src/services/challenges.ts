import { db } from '../db/database';

export interface ChallengeStats {
  speedBestTime: number | null; // Best time in seconds for 10 questions
  speedCompletions: number;
  accuracyBestStreak: number;
  accuracyCompletions: number;
  currentDailyStreak: number;
  longestDailyStreak: number;
}

const STORAGE_KEY = 'offgrid_challenge_stats';

/**
 * Load challenge statistics from localStorage
 */
export function loadChallengeStats(): ChallengeStats {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  return {
    speedBestTime: null,
    speedCompletions: 0,
    accuracyBestStreak: 0,
    accuracyCompletions: 0,
    currentDailyStreak: 0,
    longestDailyStreak: 0
  };
}

/**
 * Save challenge statistics to localStorage
 */
export function saveChallengeStats(stats: ChallengeStats): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

/**
 * Update speed challenge completion
 */
export function updateSpeedChallenge(timeInSeconds: number): ChallengeStats {
  const stats = loadChallengeStats();
  stats.speedCompletions++;

  if (stats.speedBestTime === null || timeInSeconds < stats.speedBestTime) {
    stats.speedBestTime = timeInSeconds;
  }

  saveChallengeStats(stats);
  return stats;
}

/**
 * Update accuracy challenge completion
 */
export function updateAccuracyChallenge(streak: number): ChallengeStats {
  const stats = loadChallengeStats();
  stats.accuracyCompletions++;

  if (streak > stats.accuracyBestStreak) {
    stats.accuracyBestStreak = streak;
  }

  saveChallengeStats(stats);
  return stats;
}

/**
 * Calculate daily practice streak
 */
export async function calculateDailyStreak(): Promise<number> {
  const attempts = await db.attempts.toArray();

  if (attempts.length === 0) return 0;

  // Get unique days with practice
  const daysPracticed = new Set<string>();
  attempts.forEach(a => {
    const date = new Date(a.timestamp);
    const dayStr = date.toDateString();
    daysPracticed.add(dayStr);
  });

  // Sort days chronologically
  const sortedDays = Array.from(daysPracticed)
    .map(d => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime()); // Most recent first

  // Calculate current streak (must include today or yesterday)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let currentStreak = 0;
  const mostRecentDay = sortedDays[0];
  mostRecentDay.setHours(0, 0, 0, 0);

  // Check if most recent practice was today or yesterday
  if (mostRecentDay.getTime() === today.getTime() ||
      mostRecentDay.getTime() === yesterday.getTime()) {

    // Count consecutive days backwards from most recent
    for (let i = 0; i < sortedDays.length; i++) {
      const currentDay = new Date(sortedDays[i]);
      currentDay.setHours(0, 0, 0, 0);

      if (i === 0) {
        currentStreak = 1;
        continue;
      }

      const previousDay = new Date(sortedDays[i - 1]);
      previousDay.setHours(0, 0, 0, 0);

      const dayDiff = Math.floor((previousDay.getTime() - currentDay.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Update stats
  const stats = loadChallengeStats();
  stats.currentDailyStreak = currentStreak;
  if (currentStreak > stats.longestDailyStreak) {
    stats.longestDailyStreak = currentStreak;
  }
  saveChallengeStats(stats);

  return currentStreak;
}

/**
 * Get random items for challenges
 */
export async function getChallengeItems(count: number = 10) {
  const allItems = await db.items.where({ formType: 'A' }).toArray();

  // Shuffle and select
  const shuffled = allItems.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Format time in MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
