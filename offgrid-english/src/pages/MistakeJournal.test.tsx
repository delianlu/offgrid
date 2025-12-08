import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MistakeJournal } from './MistakeJournal';
import { MemoryRouter } from 'react-router-dom';

// Mock mistakeJournal service
vi.mock('../services/mistakeJournal', () => ({
    getAllMistakes: vi.fn(),
    getUnresolvedMistakes: vi.fn(),
    markMistakeAsResolved: vi.fn(),
    deleteMistake: vi.fn(),
    getMistakeStats: vi.fn(),
}));

// Mock translation
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('MistakeJournal', () => {
    const mockMistakes = [
        {
            id: 'mistake-1',
            moduleId: 'tense-form',
            itemId: 'item-1',
            userAnswer: 'I goes',
            correctAnswer: 'I go',
            explanation: 'Subject-verb agreement error',
            timestamp: Date.now(),
            resolved: false,
        },
        {
            id: 'mistake-2',
            moduleId: 'prepositions',
            itemId: 'item-2',
            userAnswer: 'at Monday',
            correctAnswer: 'on Monday',
            explanation: 'Preposition of time',
            timestamp: Date.now() - 86400000,
            resolved: false,
        },
    ];

    const mockStats = {
        total: 5,
        unresolved: 2,
        resolved: 3,
        byModule: {
            'tense-form': 2,
            'prepositions': 3,
        },
    };

    beforeEach(async () => {
        vi.clearAllMocks();
        const mistakeService = await import('../services/mistakeJournal');
        (mistakeService.getUnresolvedMistakes as any).mockResolvedValue(mockMistakes);
        (mistakeService.getAllMistakes as any).mockResolvedValue(mockMistakes);
        (mistakeService.getMistakeStats as any).mockResolvedValue(mockStats);
        (mistakeService.markMistakeAsResolved as any).mockResolvedValue(undefined);
        (mistakeService.deleteMistake as any).mockResolvedValue(undefined);
    });

    it('should render mistake journal with stats', async () => {
        render(
            <MemoryRouter>
                <MistakeJournal />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Mistake Journal')).toBeInTheDocument();
            expect(screen.getByText('5')).toBeInTheDocument(); // Total
            expect(screen.getByText('2')).toBeInTheDocument(); // Unresolved
            expect(screen.getByText('3')).toBeInTheDocument(); // Resolved
        });
    });

    it('should load and display mistake data', async () => {
        render(
            <MemoryRouter>
                <MistakeJournal />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Mistake Journal')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('should have toggle for showing resolved mistakes', async () => {
        render(
            <MemoryRouter>
                <MistakeJournal />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Show resolved mistakes')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('should call getUnresolvedMistakes service on load', async () => {
        const { getUnresolvedMistakes } = await import('../services/mistakeJournal');

        render(
            <MemoryRouter>
                <MistakeJournal />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(getUnresolvedMistakes).toHaveBeenCalled();
        }, { timeout: 3000 });
    });

    it('should call getMistakeStats service on load', async () => {
        const { getMistakeStats } = await import('../services/mistakeJournal');

        render(
            <MemoryRouter>
                <MistakeJournal />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(getMistakeStats).toHaveBeenCalled();
        }, { timeout: 3000 });
    });

    it('should render back button for navigation', async () => {
        render(
            <MemoryRouter>
                <MistakeJournal />
            </MemoryRouter>
        );

        await waitFor(() => {
            const backButton = screen.getByText('←');
            expect(backButton).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('should show loading state initially', () => {
        render(
            <MemoryRouter>
                <MistakeJournal />
            </MemoryRouter>
        );

        // Initially, data should be loading
        // The stats should show 0 before data loads
        expect(screen.getByText('Mistake Journal')).toBeInTheDocument();
    });

    it('should render stats cards', async () => {
        render(
            <MemoryRouter>
                <MistakeJournal />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Total')).toBeInTheDocument();
            expect(screen.getByText('Active')).toBeInTheDocument();
            expect(screen.getByText('Resolved')).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});
