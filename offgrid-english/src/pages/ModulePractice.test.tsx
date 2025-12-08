import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModulePractice } from './ModulePractice';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { db } from '../db/database';
import * as adaptiveDifficulty from '../services/adaptiveDifficulty';

// Mock dependencies
vi.mock('../db/database', () => ({
    db: {
        items: {
            toArray: vi.fn(),
        },
        modules: {
            get: vi.fn(),
        },
        attempts: {
            add: vi.fn(),
            orderBy: vi.fn().mockReturnThis(),
            last: vi.fn(),
            update: vi.fn(),
        },
        reviewData: {
            get: vi.fn(),
            put: vi.fn(),
        },
    },
}));

vi.mock('../services/adaptiveDifficulty', () => ({
    selectNextQuestion: vi.fn(),
    calculatePerformanceLevel: vi.fn(),
    getDifficultyMessage: vi.fn(),
}));

vi.mock('../services/achievements', () => ({
    checkAchievements: vi.fn().mockResolvedValue([]),
}));

vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({ currentUser: { id: 'test-user' } }),
}));

// Mock child components to simplify testing
vi.mock('../components/MultipleChoice', () => ({
    MultipleChoice: ({ question, onAnswer }: any) => (
        <div data-testid="multiple-choice">
            <h1>{question}</h1>
            <button onClick={() => onAnswer('Option A')}>Answer A</button>
        </div>
    ),
}));

vi.mock('../components/EnhancedFeedback', () => ({
    EnhancedFeedback: ({ onContinue }: any) => (
        <div data-testid="feedback">
            <button onClick={onContinue}>Continue</button>
        </div>
    ),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('../components/CompletionCelebration', () => ({
    CompletionCelebration: () => <div data-testid="completion-celebration">Celebration!</div>,
}));

describe('ModulePractice Integration', () => {
    const mockItem = {
        id: 'item-1',
        moduleId: 'test-mod',
        formType: 'A',
        questionText: 'Test Question?',
        options: ['Option A', 'Option B'],
        correctAnswer: 'Option A',
        feedback: 'Good job',
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup DB mocks
        (db.items.toArray as any).mockResolvedValue([mockItem]);
        (db.modules.get as any).mockResolvedValue({ id: 'test-mod', name: 'Test Module' });

        // Setup Adaptive Difficulty mocks
        (adaptiveDifficulty.selectNextQuestion as any).mockResolvedValue(mockItem);
        (adaptiveDifficulty.calculatePerformanceLevel as any).mockResolvedValue('novice');
    });

    it('should render question and handle answer flow', async () => {
        render(
            <MemoryRouter initialEntries={['/practice/test-mod']}>
                <Routes>
                    <Route path="/practice/:moduleId" element={<ModulePractice />} />
                </Routes>
            </MemoryRouter>
        );

        // 1. Verify loading state
        expect(screen.getByText(/Loading module/i)).toBeInTheDocument();

        // 2. Verify question renders (after async load)
        await waitFor(() => {
            expect(screen.getByTestId('multiple-choice')).toBeInTheDocument();
        });
        expect(screen.getByText('Test Question?')).toBeInTheDocument();

        // 3. Simulate answering
        fireEvent.click(screen.getByText('Answer A'));

        // 4. Verify attempt saved
        await waitFor(() => {
            expect(db.attempts.add).toHaveBeenCalledWith(expect.objectContaining({
                moduleId: 'test-mod',
                itemId: 'item-1',
                studentAnswer: 'Option A',
                isCorrect: true,
            }));
        });

        // 5. Verify feedback shown
        expect(screen.getByTestId('feedback')).toBeInTheDocument();

        // 6. Simulate continue
        fireEvent.click(screen.getByText('Continue'));

        // 7. Verify next question loaded (mocked to return same item for simplicity)
        await waitFor(() => {
            expect(adaptiveDifficulty.selectNextQuestion).toHaveBeenCalledTimes(2); // Initial + Next
        });
    });

    it('should show completion screen when all items attempted', async () => {
        // Mock that we have attempted the only item
        (adaptiveDifficulty.selectNextQuestion as any).mockResolvedValue(mockItem);

        // We need to simulate that the component checks attempted items.
        // In ModulePractice, it checks `attemptedInSession`.
        // But `attemptedInSession` is local state.
        // However, `loadNextAdaptiveQuestion` is called on mount.

        // Actually, to test completion, we should simulate answering the last question.

        render(
            <MemoryRouter initialEntries={['/practice/test-mod']}>
                <Routes>
                    <Route path="/practice/:moduleId" element={<ModulePractice />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId('multiple-choice')).toBeInTheDocument();
        });

        // Answer the question
        fireEvent.click(screen.getByText('Answer A'));

        // Continue
        await waitFor(() => {
            expect(screen.getByTestId('feedback')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByText('Continue'));

        // Now, since there is only 1 item and we just attempted it, 
        // `attemptedInSession` size will be 1.
        // `totalItemsInPhase` is 1 (from db.items.toArray mock).
        // So it should render CompletionCelebration.

        await waitFor(() => {
            expect(screen.getByTestId('completion-celebration')).toBeInTheDocument();
        });
    });
});
