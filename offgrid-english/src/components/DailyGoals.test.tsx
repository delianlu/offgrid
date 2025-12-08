import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DailyGoals } from './DailyGoals';

// Mock the dailyGoals service
vi.mock('../services/dailyGoals', () => ({
    getDailyGoalProgress: vi.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
}));

// Mock translation
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, params?: any) => {
            if (key === 'quickAccess.dailyGoal.title') return 'Daily Goal';
            if (key === 'quickAccess.dailyGoal.subtitle') return `${params?.percent}% complete`;
            if (key === 'quickAccess.dailyGoal.progress') return 'Progress';
            if (key === 'quickAccess.dailyGoal.moreToGo') return 'more to go!';
            return key;
        },
    }),
}));

describe('DailyGoals', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render with initial state', async () => {
        const { getDailyGoalProgress } = await import('../services/dailyGoals');
        (getDailyGoalProgress as any).mockResolvedValue({
            lessonsCompleted: 0,
            dailyTarget: 5,
            percentage: 0,
            isAchieved: false,
        });

        render(<DailyGoals />);

        await waitFor(() => {
            expect(screen.getByText('Daily Goal')).toBeInTheDocument();
            expect(screen.getByText('0/5')).toBeInTheDocument();
            expect(screen.getByText('Start your first lesson today!')).toBeInTheDocument();
        });
    });

    it('should show progress when lessons are completed', async () => {
        const { getDailyGoalProgress } = await import('../services/dailyGoals');
        (getDailyGoalProgress as any).mockResolvedValue({
            lessonsCompleted: 3,
            dailyTarget: 5,
            percentage: 60,
            isAchieved: false,
        });

        render(<DailyGoals />);

        await waitFor(() => {
            expect(screen.getByText('3/5')).toBeInTheDocument();
            expect(screen.getByText('60% complete')).toBeInTheDocument();
            expect(screen.getByText('2 more to go!')).toBeInTheDocument();
        });
    });

    it('should show completion state when goal is achieved', async () => {
        const { getDailyGoalProgress } = await import('../services/dailyGoals');
        (getDailyGoalProgress as any).mockResolvedValue({
            lessonsCompleted: 5,
            dailyTarget: 5,
            percentage: 100,
            isAchieved: true,
        });

        render(<DailyGoals />);

        await waitFor(() => {
            expect(screen.getByText('5/5')).toBeInTheDocument();
            expect(screen.getByText('100% complete')).toBeInTheDocument();
        });
    });

    it('should show over-achievement when exceeding target', async () => {
        const { getDailyGoalProgress } = await import('../services/dailyGoals');
        (getDailyGoalProgress as any).mockResolvedValue({
            lessonsCompleted: 8,
            dailyTarget: 5,
            percentage: 160,
            isAchieved: true,
        });

        render(<DailyGoals />);

        await waitFor(() => {
            expect(screen.getByText('8/5')).toBeInTheDocument();
        });
    });
});
