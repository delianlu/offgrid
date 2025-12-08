import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateModuleProgress } from './progressTracking';
import { db } from '../db/database';

// Mock the database
vi.mock('../db/database', () => ({
    db: {
        modules: {
            get: vi.fn(),
        },
        items: {
            where: vi.fn().mockReturnThis(),
            toArray: vi.fn(),
        },
        attempts: {
            where: vi.fn().mockReturnThis(),
            toArray: vi.fn(),
        },
    },
}));

describe('calculateModuleProgress', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return null if module does not exist', async () => {
        (db.modules.get as any).mockResolvedValue(undefined);
        const result = await calculateModuleProgress('non-existent');
        expect(result).toBeNull();
    });

    it('should calculate progress correctly for a new module', async () => {
        (db.modules.get as any).mockResolvedValue({ id: 'test-mod', name: 'Test Module' });
        (db.items.where as any).mockReturnValue({ toArray: vi.fn().mockResolvedValue([]) }); // No items
        (db.attempts.where as any).mockReturnValue({ toArray: vi.fn().mockResolvedValue([]) }); // No attempts

        const result = await calculateModuleProgress('test-mod');

        expect(result).toEqual({
            moduleId: 'test-mod',
            moduleName: 'Test Module',
            formAProgress: 0,
            formBProgress: 0,
            formAAccuracy: 0,
            formBAccuracy: 0,
            totalAttempts: 0,
            isFormAComplete: false,
            isFormBComplete: false,
            isFormBUnlocked: false,
            overallCompletion: 0,
            badge: 'learning',
        });
    });

    it('should calculate progress correctly with attempts', async () => {
        (db.modules.get as any).mockResolvedValue({ id: 'test-mod', name: 'Test Module' });

        // Mock 2 items for Form A
        (db.items.where as any).mockImplementation((query: any) => {
            if (query.formType === 'A') return { toArray: vi.fn().mockResolvedValue([{ id: 'i1' }, { id: 'i2' }]) };
            if (query.formType === 'B') return { toArray: vi.fn().mockResolvedValue([{ id: 'i3' }]) };
            return { toArray: vi.fn().mockResolvedValue([]) };
        });

        // Mock 1 correct attempt for Form A
        (db.attempts.where as any).mockReturnValue({
            toArray: vi.fn().mockResolvedValue([
                { moduleId: 'test-mod', itemId: 'i1', formType: 'A', isCorrect: true }
            ])
        });

        const result = await calculateModuleProgress('test-mod');

        expect(result?.formAProgress).toBe(50); // 1 out of 2 items attempted
        expect(result?.formAAccuracy).toBe(100); // 1 attempt, 1 correct
        expect(result?.overallCompletion).toBe(25); // (50 + 0) / 200 * 100 = 25
    });
    it('should unlock Form B when Form A is complete and accuracy >= 70%', async () => {
        (db.modules.get as any).mockResolvedValue({ id: 'test-mod', name: 'Test Module' });

        // Mock 1 item for Form A
        (db.items.where as any).mockImplementation((query: any) => {
            if (query.formType === 'A') return { toArray: vi.fn().mockResolvedValue([{ id: 'i1' }]) };
            return { toArray: vi.fn().mockResolvedValue([]) };
        });

        // Mock 1 correct attempt for Form A (100% accuracy)
        (db.attempts.where as any).mockReturnValue({
            toArray: vi.fn().mockResolvedValue([
                { moduleId: 'test-mod', itemId: 'i1', formType: 'A', isCorrect: true }
            ])
        });

        const result = await calculateModuleProgress('test-mod');
        expect(result?.isFormAComplete).toBe(true);
        expect(result?.formAAccuracy).toBe(100);
        expect(result?.isFormBUnlocked).toBe(true);
    });

    it('should NOT unlock Form B if Form A accuracy < 70%', async () => {
        (db.modules.get as any).mockResolvedValue({ id: 'test-mod', name: 'Test Module' });

        // Mock 1 item for Form A
        (db.items.where as any).mockImplementation((query: any) => {
            if (query.formType === 'A') return { toArray: vi.fn().mockResolvedValue([{ id: 'i1' }]) };
            return { toArray: vi.fn().mockResolvedValue([]) };
        });

        // Mock 1 incorrect attempt for Form A (0% accuracy)
        (db.attempts.where as any).mockReturnValue({
            toArray: vi.fn().mockResolvedValue([
                { moduleId: 'test-mod', itemId: 'i1', formType: 'A', isCorrect: false }
            ])
        });

        const result = await calculateModuleProgress('test-mod');
        expect(result?.isFormAComplete).toBe(true);
        expect(result?.formAAccuracy).toBe(0);
        expect(result?.isFormBUnlocked).toBe(false);
    });

    it('should return "mastered" badge when Form A complete and Form B accuracy >= 80% (but not yet complete)', async () => {
        (db.modules.get as any).mockResolvedValue({ id: 'test-mod', name: 'Test Module' });

        // Mock items: 1 in A, 2 in B
        (db.items.where as any).mockImplementation((query: any) => {
            if (query.formType === 'A') return { toArray: vi.fn().mockResolvedValue([{ id: 'i1' }]) };
            if (query.formType === 'B') return { toArray: vi.fn().mockResolvedValue([{ id: 'i2' }, { id: 'i3' }]) };
            return { toArray: vi.fn().mockResolvedValue([]) };
        });

        // Mock attempts: Form A complete (1/1), Form B partial (1/2) but correct
        (db.attempts.where as any).mockReturnValue({
            toArray: vi.fn().mockResolvedValue([
                { moduleId: 'test-mod', itemId: 'i1', formType: 'A', isCorrect: true },
                { moduleId: 'test-mod', itemId: 'i2', formType: 'B', isCorrect: true }
            ])
        });

        const result = await calculateModuleProgress('test-mod');
        expect(result?.isFormAComplete).toBe(true);
        expect(result?.isFormBComplete).toBe(false);
        expect(result?.formBAccuracy).toBe(100);
        expect(result?.badge).toBe('mastered');
    });

    it('should return "complete" badge when both forms are complete', async () => {
        (db.modules.get as any).mockResolvedValue({ id: 'test-mod', name: 'Test Module' });

        // Mock items: 1 in A, 1 in B
        (db.items.where as any).mockImplementation((query: any) => {
            if (query.formType === 'A') return { toArray: vi.fn().mockResolvedValue([{ id: 'i1' }]) };
            if (query.formType === 'B') return { toArray: vi.fn().mockResolvedValue([{ id: 'i2' }]) };
            return { toArray: vi.fn().mockResolvedValue([]) };
        });

        // Mock attempts: Both complete
        (db.attempts.where as any).mockReturnValue({
            toArray: vi.fn().mockResolvedValue([
                { moduleId: 'test-mod', itemId: 'i1', formType: 'A', isCorrect: true },
                { moduleId: 'test-mod', itemId: 'i2', formType: 'B', isCorrect: true }
            ])
        });

        const result = await calculateModuleProgress('test-mod');
        expect(result?.badge).toBe('complete');
    });
});

