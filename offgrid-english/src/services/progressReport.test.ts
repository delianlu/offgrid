import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateWeeklyStats } from './progressReport';
import { db } from '../db/database';
import * as progressTracking from './progressTracking';
import * as achievements from './achievements';
import * as challenges from './challenges';

// Mock dependencies
vi.mock('../db/database', () => ({
    db: {
        attempts: {
            where: vi.fn().mockReturnThis(),
            above: vi.fn().mockReturnThis(),
            toArray: vi.fn(),
        },
        modules: {
            toArray: vi.fn(),
        }
    },
}));

vi.mock('./progressTracking', () => ({
    calculateModuleProgress: vi.fn(),
}));

vi.mock('./achievements', () => ({
    loadAchievements: vi.fn(),
}));

vi.mock('./challenges', () => ({
    loadChallengeStats: vi.fn(),
}));

describe('progressReport', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('calculateWeeklyStats', () => {
        it('should calculate basic stats correctly', async () => {
            // Mock attempts
            const attempts = [
                { isCorrect: true, timestamp: Date.now() },
                { isCorrect: false, timestamp: Date.now() },
                { isCorrect: true, timestamp: Date.now() },
            ];
            (db.attempts.toArray as any).mockResolvedValue(attempts);

            // Mock modules
            (db.modules.toArray as any).mockResolvedValue([
                { id: 'mod1', name: 'Module 1' },
                { id: 'mod2', name: 'Module 2' }
            ]);

            // Mock module progress
            (progressTracking.calculateModuleProgress as any).mockImplementation((id: string) => {
                if (id === 'mod1') return { badge: 'complete', formAAccuracy: 100, formBAccuracy: 100 };
                return { badge: 'learning', formAAccuracy: 50, formBAccuracy: 50 };
            });

            // Mock achievements
            (achievements.loadAchievements as any).mockReturnValue([
                { unlockedAt: 123 }, { unlockedAt: null }
            ]);

            // Mock challenges
            (challenges.loadChallengeStats as any).mockReturnValue({
                currentDailyStreak: 5
            });

            const stats = await calculateWeeklyStats();

            expect(stats.totalQuestions).toBe(3);
            expect(stats.correctAnswers).toBe(2);
            expect(stats.accuracy).toBe(67); // 2/3 * 100
            expect(stats.modulesCompleted).toBe(1);
            expect(stats.achievementsUnlocked).toBe(1);
            expect(stats.dailyStreak).toBe(5);
            expect(stats.topModule?.name).toBe('Module 1');
            expect(stats.weakestModule?.name).toBe('Module 2');
        });

        it('should handle empty data gracefully', async () => {
            (db.attempts.toArray as any).mockResolvedValue([]);
            (db.modules.toArray as any).mockResolvedValue([]);
            (achievements.loadAchievements as any).mockReturnValue([]);
            (challenges.loadChallengeStats as any).mockReturnValue({ currentDailyStreak: 0 });

            const stats = await calculateWeeklyStats();

            expect(stats.totalQuestions).toBe(0);
            expect(stats.accuracy).toBe(0);
            expect(stats.topModule).toBeNull();
        });
    });
});
