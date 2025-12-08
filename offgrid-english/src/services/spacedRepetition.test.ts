import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateReviewData, initializeReviewData } from './spacedRepetition';
import { db } from '../db/database';

vi.mock('../db/database', () => ({
    db: {
        reviewData: {
            get: vi.fn(),
            put: vi.fn(),
        },
    },
}));

describe('spacedRepetition', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('updateReviewData', () => {
        it('should initialize data if not present', async () => {
            (db.reviewData.get as any).mockResolvedValue(undefined);

            const result = await updateReviewData('item-1', 5);

            expect(result.itemId).toBe('item-1');
            expect(result.repetitions).toBe(1);
            expect(result.interval).toBe(1); // First successful review -> 1 day
        });

        it('should increase interval for correct answers', async () => {
            // Mock existing data: 1 repetition, interval 1
            const existing = {
                ...initializeReviewData('item-1'),
                repetitions: 1,
                interval: 1,
                easinessFactor: 2.5
            };
            (db.reviewData.get as any).mockResolvedValue(existing);

            const result = await updateReviewData('item-1', 5);

            expect(result.repetitions).toBe(2);
            expect(result.interval).toBe(6); // Second successful review -> 6 days
        });

        it('should reset interval for incorrect answers', async () => {
            // Mock existing data: 5 repetitions, interval 10
            const existing = {
                ...initializeReviewData('item-1'),
                repetitions: 5,
                interval: 10,
                easinessFactor: 2.5
            };
            (db.reviewData.get as any).mockResolvedValue(existing);

            const result = await updateReviewData('item-1', 1); // Quality 1 = incorrect

            expect(result.repetitions).toBe(0);
            expect(result.interval).toBe(1); // Reset to 1 day
        });

        it('should adjust easiness factor correctly', async () => {
            const existing = {
                ...initializeReviewData('item-1'),
                repetitions: 2,
                interval: 6,
                easinessFactor: 2.5
            };
            (db.reviewData.get as any).mockResolvedValue(existing);

            // Quality 3 (difficult but correct) should lower EF slightly
            // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
            // q=3: 2.5 + (0.1 - 2 * (0.08 + 0.04)) = 2.5 + (0.1 - 0.24) = 2.36
            const result = await updateReviewData('item-1', 3);

            expect(result.easinessFactor).toBeCloseTo(2.36);
        });
    });
});
