import { db } from '../db/database';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'practice' | 'mastery' | 'accuracy' | 'consistency' | 'review';
  requirement: number;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
}

export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
  // Practice Milestones
  {
    id: 'practice_10',
    name: 'Getting Started',
    description: 'Complete 10 practice questions',
    icon: '🌱',
    category: 'practice',
    requirement: 10
  },
  {
    id: 'practice_50',
    name: 'Dedicated Learner',
    description: 'Complete 50 practice questions',
    icon: '📚',
    category: 'practice',
    requirement: 50
  },
  {
    id: 'practice_100',
    name: 'Century Club',
    description: 'Complete 100 practice questions',
    icon: '💯',
    category: 'practice',
    requirement: 100
  },
  {
    id: 'practice_200',
    name: 'Grammar Expert',
    description: 'Complete 200 practice questions',
    icon: '🎓',
    category: 'practice',
    requirement: 200
  },

  // Module Mastery
  {
    id: 'module_master_1',
    name: 'First Module Mastered',
    description: 'Complete all phases of your first module',
    icon: '⭐',
    category: 'mastery',
    requirement: 1
  },
  {
    id: 'module_master_3',
    name: 'Triple Threat',
    description: 'Master 3 different modules',
    icon: '🏆',
    category: 'mastery',
    requirement: 3
  },
  {
    id: 'module_master_all',
    name: 'Complete Mastery',
    description: 'Master all 7 modules',
    icon: '👑',
    category: 'mastery',
    requirement: 7
  },

  // Accuracy
  {
    id: 'accuracy_streak_5',
    name: 'On a Roll',
    description: 'Get 5 correct answers in a row',
    icon: '🔥',
    category: 'accuracy',
    requirement: 5
  },
  {
    id: 'accuracy_streak_10',
    name: 'Unstoppable',
    description: 'Get 10 correct answers in a row',
    icon: '⚡',
    category: 'accuracy',
    requirement: 10
  },
  {
    id: 'accuracy_streak_20',
    name: 'Perfect Focus',
    description: 'Get 20 correct answers in a row',
    icon: '💎',
    category: 'accuracy',
    requirement: 20
  },

  // Consistency
  {
    id: 'consistency_3',
    name: '3-Day Streak',
    description: 'Practice on 3 consecutive days',
    icon: '📅',
    category: 'consistency',
    requirement: 3
  },
  {
    id: 'consistency_7',
    name: 'Week Warrior',
    description: 'Practice on 7 consecutive days',
    icon: '🗓️',
    category: 'consistency',
    requirement: 7
  },
  {
    id: 'consistency_14',
    name: 'Two Week Champion',
    description: 'Practice on 14 consecutive days',
    icon: '📆',
    category: 'consistency',
    requirement: 14
  },
  {
    id: 'consistency_30',
    name: 'Monthly Master',
    description: 'Practice on 30 consecutive days',
    icon: '🌟',
    category: 'consistency',
    requirement: 30
  },

  // Review
  {
    id: 'review_10',
    name: 'Review Rookie',
    description: 'Complete 10 review sessions',
    icon: '📖',
    category: 'review',
    requirement: 10
  },
  {
    id: 'review_50',
    name: 'Review Regular',
    description: 'Complete 50 review sessions',
    icon: '📗',
    category: 'review',
    requirement: 50
  },
  {
    id: 'review_100',
    name: 'Review Champion',
    description: 'Complete 100 review sessions',
    icon: '📘',
    category: 'review',
    requirement: 100
  }
];

const STORAGE_KEY = 'offgrid_achievements';

/**
 * Load achievements from localStorage
 */
export function loadAchievements(): Achievement[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  // Initialize with definitions
  return ACHIEVEMENT_DEFINITIONS.map(def => ({
    ...def,
    unlocked: false,
    progress: 0
  }));
}

/**
 * Save achievements to localStorage
 */
export function saveAchievements(achievements: Achievement[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
}

/**
 * Check and update achievements based on current stats
 * Returns newly unlocked achievements
 */
export async function checkAchievements(): Promise<Achievement[]> {
  const achievements = loadAchievements();
  const newlyUnlocked: Achievement[] = [];

  // Get stats from database
  const attempts = await db.attempts.toArray();
  const reviewData = await db.reviewData.toArray();

  // Practice count
  const practiceCount = attempts.length;

  // Module mastery (completed both Form A and Form B)
  const modules = await db.modules.toArray();
  let masteredModules = 0;
  for (const module of modules) {
    const formAItems = await db.items.where({ moduleId: module.id, formType: 'A' }).toArray();
    const formBItems = await db.items.where({ moduleId: module.id, formType: 'B' }).toArray();
    const formAAttempts = attempts.filter(a => a.moduleId === module.id && a.formType === 'A');
    const formBAttempts = attempts.filter(a => a.moduleId === module.id && a.formType === 'B');

    if (formAAttempts.length >= formAItems.length && formBAttempts.length >= formBItems.length) {
      masteredModules++;
    }
  }

  // Current accuracy streak
  let currentStreak = 0;
  let maxStreak = 0;
  const sortedAttempts = attempts.sort((a, b) => a.timestamp - b.timestamp);
  for (const attempt of sortedAttempts) {
    if (attempt.isCorrect) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  // Consistency streak (consecutive days with practice)
  const daysPracticed = new Set<string>();
  attempts.forEach(a => {
    const date = new Date(a.timestamp).toDateString();
    daysPracticed.add(date);
  });
  const sortedDays = Array.from(daysPracticed).sort();
  let consistencyStreak = 0;
  let maxConsistencyStreak = 0;
  let previousDate: Date | null = null;
  for (const dayStr of sortedDays) {
    const currentDate = new Date(dayStr);
    if (previousDate) {
      const diffDays = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        consistencyStreak++;
      } else {
        maxConsistencyStreak = Math.max(maxConsistencyStreak, consistencyStreak);
        consistencyStreak = 1;
      }
    } else {
      consistencyStreak = 1;
    }
    previousDate = currentDate;
  }
  maxConsistencyStreak = Math.max(maxConsistencyStreak, consistencyStreak);

  // Review count (items with review data)
  const reviewCount = reviewData.filter(r => r.repetitions > 0).length;

  // Update achievements
  for (const achievement of achievements) {
    if (achievement.unlocked) continue;

    let currentProgress = 0;

    switch (achievement.category) {
      case 'practice':
        currentProgress = practiceCount;
        break;
      case 'mastery':
        currentProgress = masteredModules;
        break;
      case 'accuracy':
        currentProgress = maxStreak;
        break;
      case 'consistency':
        currentProgress = maxConsistencyStreak;
        break;
      case 'review':
        currentProgress = reviewCount;
        break;
    }

    achievement.progress = currentProgress;

    if (currentProgress >= achievement.requirement) {
      achievement.unlocked = true;
      achievement.unlockedAt = Date.now();
      newlyUnlocked.push(achievement);
    }
  }

  saveAchievements(achievements);
  return newlyUnlocked;
}

/**
 * Get achievement statistics
 */
export function getAchievementStats(): {
  total: number;
  unlocked: number;
  percentage: number;
} {
  const achievements = loadAchievements();
  const unlocked = achievements.filter(a => a.unlocked).length;
  return {
    total: achievements.length,
    unlocked,
    percentage: Math.round((unlocked / achievements.length) * 100)
  };
}
