import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ModulePractice } from '../../pages/ModulePractice';
import { AuthProvider } from '../../contexts/AuthContext';
import { db } from '../../db/database';

// Mock all dependencies
vi.mock('../../db/database', () => ({
    db: {
        items: {
            where: vi.fn().mockReturnThis(),
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
        users: {
            toArray: vi.fn().mockResolvedValue([]),
            get: vi.fn(),
        },
        sessions: {
            toArray: vi.fn().mockResolvedValue([]),
        },
        bookmarks: {
            get: vi.fn(),
            add: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

vi.mock('../../services/adaptiveDifficulty', () => ({
    selectNextQuestion: vi.fn(),
    calculatePerformanceLevel: vi.fn().mockResolvedValue('medium'),
    getDifficultyMessage: vi.fn().mockReturnValue('Good luck!'),
}));

vi.mock('../../services/spacedRepetition', () => ({
    updateReviewData: vi.fn(),
    attemptToQuality: vi.fn().mockReturnValue(5),
}));

vi.mock('../../services/achievements', () => ({
    checkAchievements: vi.fn().mockResolvedValue([]),
}));

// Mock child components
vi.mock('../../components/MultipleChoice', () => ({
    MultipleChoice: ({ question, options, onAnswer }: any) => (
        <div data-testid="multiple-choice">
            <h1>{question}</h1>
            {options.map((opt: string) => (
                <button key={opt} onClick={() => onAnswer(opt)} data-testid={`option-${opt}`}>
                    {opt}
                </button>
            ))}
        </div>
    ),
}));

vi.mock('../../components/EnhancedFeedback', () => ({
    EnhancedFeedback: ({ isCorrect, onContinue }: any) => (
        <div data-testid="feedback">
            <p data-testid="feedback-result">{isCorrect ? 'Correct!' : 'Incorrect!'}</p>
            <button onClick={onContinue} data-testid="continue-button">Continue</button>
        </div>
    ),
}));

describe('Integration: Module Practice Flow', () => {
    const mockItems = [
        {
            id: 'item-1',
            moduleId: 'test-mod',
            questionText: 'Question 1?',
            options: ['Answer A', 'Answer B', 'Answer C'],
            correctAnswer: 'Answer A',
            feedback: 'Feedback for question 1',
            formType: 'A',
            transferType: 'near',
        },
        {
            id: 'item-2',
            moduleId: 'test-mod',
            questionText: 'Question 2?',
            options: ['Answer X', 'Answer Y', 'Answer Z'],
            correctAnswer: 'Answer Y',
            feedback: 'Feedback for question 2',
            formType: 'A',
            transferType: 'near',
        },
    ];

    beforeEach(async () => {
        vi.clearAllMocks();

        // Setup database mocks
        (db.items.toArray as any).mockResolvedValue(mockItems);
        (db.items.where as any).mockReturnValue({
            toArray: vi.fn().mockResolvedValue(mockItems),
        });
        (db.modules.get as any).mockResolvedValue({ name: 'Test Module', description: 'Test' });
        (db.attempts.add as any).mockResolvedValue(1);
        (db.attempts.last as any).mockResolvedValue(null);

        // Setup adaptive difficulty mock
        const { selectNextQuestion } = await import('../../services/adaptiveDifficulty');
        (selectNextQuestion as any).mockReset();
        (selectNextQuestion as any)
            .mockResolvedValueOnce(mockItems[0])
            .mockResolvedValueOnce(mockItems[1])
            .mockResolvedValue(mockItems[0]); // Fallback to avoid undefined
    });

    it('should complete a full practice session with correct answers', async () => {
        render(
            <MemoryRouter initialEntries={['/practice/test-mod']}>
                <AuthProvider>
                    <Routes>
                        <Route path="/practice/:moduleId" element={<ModulePractice />} />
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        );

        // Wait for first question to load
        await waitFor(() => {
            expect(screen.getByText('Question 1?')).toBeInTheDocument();
        });

        // Answer first question correctly
        const correctOption1 = screen.getByTestId('option-Answer A');
        fireEvent.click(correctOption1);

        // Wait for feedback
        await waitFor(() => {
            expect(screen.getByTestId('feedback')).toBeInTheDocument();
            expect(screen.getByText('Correct!')).toBeInTheDocument();
        });

        // Verify attempt was recorded
        expect(db.attempts.add).toHaveBeenCalledWith(
            expect.objectContaining({
                itemId: 'item-1',
                studentAnswer: 'Answer A',
                isCorrect: true,
            })
        );

        // Continue to next question
        const continueButton = screen.getByTestId('continue-button');
        fireEvent.click(continueButton);

        // Wait for second question
        await waitFor(() => {
            expect(screen.getByText('Question 2?')).toBeInTheDocument();
        });

        // Answer second question correctly
        const correctOption2 = screen.getByTestId('option-Answer Y');
        fireEvent.click(correctOption2);

        // Wait for feedback
        await waitFor(() => {
            expect(screen.getByText('Correct!')).toBeInTheDocument();
        });

        // Verify second attempt was recorded
        expect(db.attempts.add).toHaveBeenCalledWith(
            expect.objectContaining({
                itemId: 'item-2',
                studentAnswer: 'Answer Y',
                isCorrect: true,
            })
        );
    });

    it('should handle incorrect answers and show feedback', async () => {
        render(
            <MemoryRouter initialEntries={['/practice/test-mod']}>
                <AuthProvider>
                    <Routes>
                        <Route path="/practice/:moduleId" element={<ModulePractice />} />
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        );

        // Wait for question to load
        await waitFor(() => {
            expect(screen.getByText('Question 1?')).toBeInTheDocument();
        });

        // Answer incorrectly
        const incorrectOption = screen.getByTestId('option-Answer B');
        fireEvent.click(incorrectOption);

        // Wait for feedback
        await waitFor(() => {
            expect(screen.getByTestId('feedback')).toBeInTheDocument();
            expect(screen.getByText('Incorrect!')).toBeInTheDocument();
        });

        // Verify incorrect attempt was recorded
        expect(db.attempts.add).toHaveBeenCalledWith(
            expect.objectContaining({
                itemId: 'item-1',
                studentAnswer: 'Answer B',
                isCorrect: false,
            })
        );
    });

    it('should track progress through multiple questions', async () => {
        render(
            <MemoryRouter initialEntries={['/practice/test-mod']}>
                <AuthProvider>
                    <Routes>
                        <Route path="/practice/:moduleId" element={<ModulePractice />} />
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        );

        // Answer first question
        await waitFor(() => {
            expect(screen.getByText('Question 1?')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByTestId('option-Answer A'));

        await waitFor(() => {
            expect(screen.getByTestId('continue-button')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByTestId('continue-button'));

        // Verify progression to second question
        await waitFor(() => {
            expect(screen.getByText('Question 2?')).toBeInTheDocument();
        });

        // Answer second question
        fireEvent.click(screen.getByTestId('option-Answer Y'));

        await waitFor(() => {
            expect(screen.getByTestId('continue-button')).toBeInTheDocument();
        });

        // Verify database was updated for both questions
        expect(db.attempts.add).toHaveBeenCalledTimes(2);
    });

    it('should update spaced repetition data after answering', async () => {
        const { updateReviewData } = await import('../../services/spacedRepetition');

        render(
            <MemoryRouter initialEntries={['/practice/test-mod']}>
                <AuthProvider>
                    <Routes>
                        <Route path="/practice/:moduleId" element={<ModulePractice />} />
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Question 1?')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('option-Answer A'));

        await waitFor(() => {
            expect(updateReviewData).toHaveBeenCalledWith('item-1', 5);
        });
    });

    it('should check for achievements after correct answer', async () => {
        const { checkAchievements } = await import('../../services/achievements');

        render(
            <MemoryRouter initialEntries={['/practice/test-mod']}>
                <AuthProvider>
                    <Routes>
                        <Route path="/practice/:moduleId" element={<ModulePractice />} />
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Question 1?')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('option-Answer A'));

        await waitFor(() => {
            expect(checkAchievements).toHaveBeenCalled();
        });
    });
});
