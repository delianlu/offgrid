import { db } from '../db/database';

export interface DayActivity {
  day: string;
  date: string;
  lessonsCompleted: number;
  accuracy: number;
}

export interface WeeklySummary {
  totalLessons: number;
  averageAccuracy: number;
  bestDay: DayActivity | null;
  currentStreak: number;
  dailyActivities: DayActivity[];
  weekStartDate: string;
  weekEndDate: string;
}

/**
 * Get weekly learning summary for the past 7 days
 */
export async function getWeeklySummary(): Promise<WeeklySummary> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Get last 7 days
  const dailyActivities: DayActivity[] = [];
  let totalLessons = 0;
  let totalCorrect = 0;
  let totalAttempts = 0;

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const dayStart = date.getTime();
    const dayEnd = dayStart + 86400000; // 24 hours

    // Get attempts for this day
    const attempts = await db.attempts
      .where('timestamp')
      .between(dayStart, dayEnd, true, false)
      .toArray();

    // Count unique items (lessons)
    const uniqueItems = new Set(attempts.map(a => a.itemId));
    const lessonsCompleted = uniqueItems.size;

    // Calculate accuracy
    const correct = attempts.filter(a => a.isCorrect).length;
    const accuracy = attempts.length > 0 ? Math.round((correct / attempts.length) * 100) : 0;

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    dailyActivities.push({
      day: dayNames[date.getDay()],
      date: date.toLocaleDateString(),
      lessonsCompleted,
      accuracy
    });

    totalLessons += lessonsCompleted;
    totalCorrect += correct;
    totalAttempts += attempts.length;
  }

  // Calculate average accuracy
  const averageAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  // Find best day
  const bestDay = dailyActivities.reduce((best, current) => {
    if (!best || current.lessonsCompleted > best.lessonsCompleted) {
      return current;
    }
    return best;
  }, null as DayActivity | null);

  // Calculate current streak
  let currentStreak = 0;
  for (let i = dailyActivities.length - 1; i >= 0; i--) {
    if (dailyActivities[i].lessonsCompleted > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  const weekStartDate = dailyActivities[0]?.date || '';
  const weekEndDate = dailyActivities[6]?.date || '';

  return {
    totalLessons,
    averageAccuracy,
    bestDay,
    currentStreak,
    dailyActivities,
    weekStartDate,
    weekEndDate
  };
}

/**
 * Get learning streak (consecutive days with activity)
 */
export async function getLearningStreak(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let currentDate = new Date(today);

  while (true) {
    const dayStart = currentDate.getTime();
    const dayEnd = dayStart + 86400000;

    const attempts = await db.attempts
      .where('timestamp')
      .between(dayStart, dayEnd, true, false)
      .count();

    if (attempts > 0) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }

    // Safety limit
    if (streak > 365) break;
  }

  return streak;
}
