import { db } from '../db/database';

export interface DailyGoal {
  lessonsCompleted: number;
  dailyTarget: number;
  percentage: number;
  isAchieved: boolean;
}

/**
 * Get today's daily goal progress
 */
export async function getDailyGoalProgress(): Promise<DailyGoal> {
  // Default daily target
  const dailyTarget = 5;

  // Get today's date at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();

  // Get tomorrow's date at midnight
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowTimestamp = tomorrow.getTime();

  // Count unique items attempted today
  const attemptsToday = await db.attempts
    .where('timestamp')
    .between(todayTimestamp, tomorrowTimestamp, true, false)
    .toArray();

  // Get unique items completed today (first attempt only)
  const uniqueItems = new Set(attemptsToday.map(a => a.itemId));
  const lessonsCompleted = uniqueItems.size;

  // Calculate percentage
  const percentage = Math.min(Math.round((lessonsCompleted / dailyTarget) * 100), 100);
  const isAchieved = lessonsCompleted >= dailyTarget;

  return {
    lessonsCompleted,
    dailyTarget,
    percentage,
    isAchieved
  };
}

/**
 * Get the last module/item the user was working on
 */
export async function getLastActivity() {
  // Get the most recent attempt
  const lastAttempt = await db.attempts
    .orderBy('timestamp')
    .reverse()
    .first();

  if (!lastAttempt) {
    return null;
  }

  // Get the module name
  const module = await db.modules.get(lastAttempt.moduleId);

  return {
    moduleId: lastAttempt.moduleId,
    moduleName: module?.name || 'Unknown Module',
    formType: lastAttempt.formType,
    timestamp: lastAttempt.timestamp
  };
}
