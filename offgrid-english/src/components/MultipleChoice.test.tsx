import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MultipleChoice } from './MultipleChoice';

// Mock database
vi.mock('../db/database', () => ({
    db: {
        bookmarks: {
            get: vi.fn(),
            add: vi.fn(),
            delete: vi.fn(),
        }
    },
}));

// Mock child components
vi.mock('./ScenarioBadge', () => ({
    ScenarioBadge: ({ scenario }: any) => <div data-testid="scenario-badge">{scenario.name}</div>,
}));

vi.mock('./VoiceInput', () => ({
    VoiceInput: () => <div data-testid="voice-input">Voice Input</div>,
}));

vi.mock('./common/AudioButton', () => ({
    AudioButton: ({ text }: any) => <button data-testid="audio-button">{text}</button>,
}));

vi.mock('./common/AnswerOption', () => ({
    AnswerOption: ({ text, selected, onClick }: any) => (
        <button
            data-testid="answer-option"
            onClick={onClick}
            data-selected={selected}
        >
            {text}
        </button>
    ),
}));

vi.mock('./common/Button', () => ({
    Button: ({ children, onClick, disabled }: any) => (
        <button onClick={onClick} disabled={disabled} data-testid="submit-button">
            {children}
        </button>
    ),
}));

describe('MultipleChoice', () => {
    const mockOnAnswer = vi.fn();
    const mockOnFlag = vi.fn();

    const defaultProps = {
        question: 'What is the correct answer?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        onAnswer: mockOnAnswer,
        itemId: 'test-item-1',
        moduleId: 'test-module-1',
        scenario: {
            name: 'Test Scenario',
            description: 'A test scenario',
            category: 'test',
            icon: '👋',
            context: 'Test context',
            characters: ['Char A', 'Char B']
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render question and all options', () => {
        render(<MultipleChoice {...defaultProps} />);

        // The question text might appear in the audio button too, so we need to be specific
        expect(screen.getByText('What is the correct answer?', { selector: 'p' })).toBeInTheDocument();
        expect(screen.getByText('Option A')).toBeInTheDocument();
        expect(screen.getByText('Option B')).toBeInTheDocument();
        expect(screen.getByText('Option C')).toBeInTheDocument();
        expect(screen.getByText('Option D')).toBeInTheDocument();
    });

    it('should render scenario badge when scenario is provided', () => {
        const scenario = {
            name: 'Restaurant',
            description: 'Ordering food',
            category: 'daily-life',
            icon: '🍽️',
            context: 'Ordering food in a restaurant',
            characters: ['Waiter', 'Customer']
        };

        render(<MultipleChoice {...defaultProps} scenario={scenario} />);
        expect(screen.getByTestId('scenario-badge')).toBeInTheDocument();
    });

    it('should show bookmark button when itemId and moduleId are provided', () => {
        render(
            <MultipleChoice
                {...defaultProps}
                itemId="item-1"
                moduleId="module-1"
            />
        );

        expect(screen.getByText('Bookmark')).toBeInTheDocument();
    });

    it('should toggle bookmark when clicked', async () => {
        const { db } = await import('../db/database');
        (db.bookmarks.get as any).mockResolvedValue(null);

        render(
            <MultipleChoice
                {...defaultProps}
                itemId="item-1"
                moduleId="module-1"
            />
        );

        const bookmarkButton = screen.getByText('Bookmark');
        fireEvent.click(bookmarkButton);

        await waitFor(() => {
            expect(db.bookmarks.add).toHaveBeenCalledWith({
                itemId: 'item-1',
                moduleId: 'module-1',
                bookmarkedAt: expect.any(Number),
            });
        });
    });

    it('should show flag button when onFlag is provided', () => {
        render(
            <MultipleChoice
                {...defaultProps}
                itemId="item-1"
                moduleId="module-1"
                onFlag={mockOnFlag}
            />
        );

        expect(screen.getByText('Report')).toBeInTheDocument();
    });

    it('should call onFlag when flag button is clicked', () => {
        render(
            <MultipleChoice
                {...defaultProps}
                itemId="item-1"
                moduleId="module-1"
                onFlag={mockOnFlag}
            />
        );

        const flagButton = screen.getByText('Report');
        fireEvent.click(flagButton);

        expect(mockOnFlag).toHaveBeenCalled();
    });

    it('should select an option when clicked', () => {
        render(<MultipleChoice {...defaultProps} />);

        const options = screen.getAllByTestId('answer-option');
        fireEvent.click(options[1]); // Click Option B

        // The selected option should be marked as selected
        expect(options[1]).toHaveAttribute('data-selected', 'true');
    });

    it('should call onAnswer when submit button is clicked with selected option', async () => {
        render(<MultipleChoice {...defaultProps} />);

        const options = screen.getAllByTestId('answer-option');
        fireEvent.click(options[0]); // Select Option A

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnAnswer).toHaveBeenCalledWith('Option A');
        });
    });

    it('should not call onAnswer when submit button is clicked without selection', () => {
        render(<MultipleChoice {...defaultProps} />);

        const submitButton = screen.getByTestId('submit-button');
        fireEvent.click(submitButton);

        expect(mockOnAnswer).not.toHaveBeenCalled();
    });
});
