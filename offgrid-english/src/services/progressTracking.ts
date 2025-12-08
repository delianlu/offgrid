import { db } from '../db/database';

export interface ModuleProgress {
  moduleId: string;
  moduleName: string;
  formAProgress: number; // 0-100
  formBProgress: number; // 0-100
  formAAccuracy: number; // 0-100
  formBAccuracy: number; // 0-100
  totalAttempts: number;
  isFormAComplete: boolean;
  isFormBComplete: boolean;
  isFormBUnlocked: boolean; // Form B unlocked when Form A accuracy ≥70%
  overallCompletion: number; // 0-100
  badge: 'locked' | 'learning' | 'practicing' | 'mastered' | 'complete';
}

/**
 * Calculate progress for a specific module
 */
export async function calculateModuleProgress(moduleId: string, userId?: string): Promise<ModuleProgress | null> {
  const module = await db.modules.get(moduleId);
  if (!module) return null;

  // Get items for this module
  const formAItems = await db.items.where({ moduleId, formType: 'A' }).toArray();
  const formBItems = await db.items.where({ moduleId, formType: 'B' }).toArray();

  // Get attempts for this module
  const attempts = await db.attempts.where({ moduleId }).toArray();

  const formAAttempts = attempts.filter(a => a.formType === 'A');
  const formBAttempts = attempts.filter(a => a.formType === 'B');

  // Calculate unique items attempted
  const formAItemsAttempted = new Set(formAAttempts.map(a => a.itemId)).size;
  const formBItemsAttempted = new Set(formBAttempts.map(a => a.itemId)).size;

  // Calculate progress (0-100)
  const formAProgress = formAItems.length > 0
    ? Math.round((formAItemsAttempted / formAItems.length) * 100)
    : 0;
  const formBProgress = formBItems.length > 0
    ? Math.round((formBItemsAttempted / formBItems.length) * 100)
    : 0;

  // Calculate accuracy
  const formACorrect = formAAttempts.filter(a => a.isCorrect).length;
  const formAAccuracy = formAAttempts.length > 0
    ? Math.round((formACorrect / formAAttempts.length) * 100)
    : 0;

  const formBCorrect = formBAttempts.filter(a => a.isCorrect).length;
  const formBAccuracy = formBAttempts.length > 0
    ? Math.round((formBCorrect / formBAttempts.length) * 100)
    : 0;

  // Completion flags
  const isFormAComplete = formAProgress >= 100;
  const isFormBComplete = formBProgress >= 100;

  // Unlock logic: Form B unlocked when Form A accuracy ≥70%
  const isFormBUnlocked = formAAccuracy >= 70 && isFormAComplete;

  // Overall completion (both forms completed)
  const overallCompletion = Math.round(((formAProgress + formBProgress) / 200) * 100);

  // Badge determination
  let badge: ModuleProgress['badge'];
  if (isFormAComplete && isFormBComplete) {
    badge = 'complete';
  } else if (isFormAComplete && formBAccuracy >= 80) {
    badge = 'mastered';
  } else if (isFormAComplete) {
    badge = 'practicing';
  } else if (overallCompletion > 0) {
    badge = 'learning';
  } else {
    // For new modules with no attempts, allow access
    badge = 'learning';
  }

  return {
    moduleId,
    moduleName: module.name,
    formAProgress,
    formBProgress,
    formAAccuracy,
    formBAccuracy,
    totalAttempts: attempts.length,
    isFormAComplete,
    isFormBComplete,
    isFormBUnlocked,
    overallCompletion,
    badge
  };
}

/**
 * Calculate progress for all modules
 */
export async function calculateAllModulesProgress(userId?: string): Promise<ModuleProgress[]> {
  const modules = await db.modules.toArray();
  const progressList: ModuleProgress[] = [];

  for (const module of modules) {
    const progress = await calculateModuleProgress(module.id, userId);
    if (progress) {
      progressList.push(progress);
    }
  }

  return progressList;
}

/**
 * Get badge icon and colors
 */
export function getBadgeInfo(badge: ModuleProgress['badge']) {
  switch (badge) {
    case 'locked':
      return {
        icon: '🔒',
        label: 'Not Started',
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-300'
      };
    case 'learning':
      return {
        icon: '📚',
        label: 'Learning',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-300'
      };
    case 'practicing':
      return {
        icon: '✏️',
        label: 'Practicing',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300'
      };
    case 'mastered':
      return {
        icon: '⭐',
        label: 'Mastered',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-300'
      };
    case 'complete':
      return {
        icon: '🏆',
        label: 'Complete',
        color: 'text-purple-700',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-300'
      };
  }
}
