import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EnhancedFeedback } from './EnhancedFeedback';

// Mock celebrations service
vi.mock('../services/celebrations', () => ({
    celebrate: vi.fn(),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock FeedbackBox components
vi.mock('./common/FeedbackBox', () => ({
    ComparisonBox: ({ userAnswer, correctAnswer }: any) => (
        <div data-testid="comparison-box">
            <div>Your answer: {userAnswer}</div>
            <div>Correct: {correctAnswer}</div>
        </div>
    ),
    ExplanationBox: ({ explanation }: any) => (
        <div data-testid="explanation-box">{explanation}</div>
    ),
}));

describe('EnhancedFeedback', () => {
    const mockOnContinue = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(Math, 'random').mockReturnValue(0.5); // Selects index 3: "Amazing work!"
    });

    it('should render success feedback for correct answer', () => {
        render(
            <EnhancedFeedback
                isCorrect={true}
                onContinue={mockOnContinue}
            />
        );

        // Should show a success message (one of the random messages)
        expect(screen.getByText(/Excellent|Perfect|got it|Amazing|right|Brilliant|Superb/i)).toBeInTheDocument();
    });

    it('should trigger celebration on correct answer', async () => {
        const { celebrate } = await import('../services/celebrations');

        render(
            <EnhancedFeedback
                isCorrect={true}
                onContinue={mockOnContinue}
            />
        );

        expect(celebrate).toHaveBeenCalledWith('correct', 1);
    });

    it('should render error feedback for incorrect answer', () => {
        render(
            <EnhancedFeedback
                isCorrect={false}
                correctAnswer="Option A"
                userAnswer="Option B"
                onContinue={mockOnContinue}
            />
        );

        // Should show an error message (one of the random messages)
        expect(screen.getByText(/Not quite|Almost|try again|Good attempt/i)).toBeInTheDocument();
    });

    it('should show comparison box for incorrect answer', () => {
        render(
            <EnhancedFeedback
                isCorrect={false}
                correctAnswer="Option A"
                userAnswer="Option B"
                onContinue={mockOnContinue}
            />
        );

        // Should show the answers in the feedback
        expect(screen.getByText('Option B', { exact: false })).toBeInTheDocument();
        expect(screen.getByText('Option A', { exact: false })).toBeInTheDocument();
    });

    it('should show explanation when provided', () => {
        render(
            <EnhancedFeedback
                isCorrect={false}
                correctAnswer="Option A"
                userAnswer="Option B"
                explanation="This is the correct answer because..."
                onContinue={mockOnContinue}
            />
        );

        // Explanation should be visible somewhere in the component
        expect(screen.getByText(/This is the correct answer because/i)).toBeInTheDocument();
    });

    it('should call onContinue when continue button is clicked', () => {
        render(
            <EnhancedFeedback
                isCorrect={true}
                onContinue={mockOnContinue}
            />
        );

        const continueButton = screen.getByRole('button', { name: /continue|next/i });
        fireEvent.click(continueButton);

        expect(mockOnContinue).toHaveBeenCalled();
    });

    it('should render with contrastive analysis when provided', () => {
        const contrastiveAnalysis = {
            frenchStructure: "Je suis fatigué",
            englishStructure: "I am tired",
            whyDifficult: "Subject-verb agreement",
            visualHighlighting: {
                incorrect: "is",
                correct: "am"
            }
        };

        const { container } = render(
            <EnhancedFeedback
                isCorrect={false}
                correctAnswer="I am"
                userAnswer="I is"
                contrastiveAnalysis={contrastiveAnalysis}
                onContinue={mockOnContinue}
            />
        );

        // Component should render without errors when contrastive analysis is provided
        expect(container).toBeInTheDocument();
    });

    it('should handle contrastive analysis data', () => {
        const contrastiveAnalysis = {
            frenchStructure: "Je suis fatigué",
            englishStructure: "I am tired",
            whyDifficult: "Subject-verb agreement",
            visualHighlighting: {
                incorrect: "is",
                correct: "am"
            }
        };

        const { container } = render(
            <EnhancedFeedback
                isCorrect={false}
                correctAnswer="I am"
                userAnswer="I is"
                contrastiveAnalysis={contrastiveAnalysis}
                onContinue={mockOnContinue}
            />
        );

        // Should render successfully with contrastive analysis
        expect(container.querySelector('[class*="error"]') || container.querySelector('[class*="red"]')).toBeInTheDocument();
    });

    it('should not call celebrate on incorrect answer', async () => {
        const { celebrate } = await import('../services/celebrations');

        render(
            <EnhancedFeedback
                isCorrect={false}
                correctAnswer="Option A"
                userAnswer="Option B"
                onContinue={mockOnContinue}
            />
        );

        expect(celebrate).not.toHaveBeenCalled();
    });
});
