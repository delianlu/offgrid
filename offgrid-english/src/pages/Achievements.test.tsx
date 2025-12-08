import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Achievements } from './Achievements';
import { MemoryRouter } from 'react-router-dom';

// Mock achievements service
vi.mock('../services/achievements', () => ({
    loadAchievements: vi.fn(),
    getAchievementStats: vi.fn(),
}));

// Mock Header component
vi.mock('../components/common/Header', () => ({
    Header: ({ title }: any) => <header data-testid="header">{title}</header>,
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
}));

describe('Achievements', () => {
    const mockAchievements = [
        {
            id: 'first-lesson',
            name: 'First Steps',
            description: 'Complete your first lesson',
            icon: '🎯',
            category: 'practice',
            unlocked: true,
            unlockedAt: Date.now(),
        },
        {
            id: 'streak-7',
            name: 'Week Warrior',
            description: 'Maintain a 7-day streak',
            icon: '🔥',
            category: 'consistency',
            unlocked: true,
            unlockedAt: Date.now(),
        },
        {
            id: 'master-module',
            name: 'Module Master',
            description: 'Complete all lessons in a module',
            icon: '👑',
            category: 'mastery',
            unlocked: false,
        },
    ];

    const mockStats = {
        total: 3,
        unlocked: 2,
        percentage: 67,
    };

    beforeEach(async () => {
        vi.clearAllMocks();
        const { loadAchievements, getAchievementStats } = await import('../services/achievements');
        (loadAchievements as any).mockReturnValue(mockAchievements);
        (getAchievementStats as any).mockReturnValue(mockStats);
    });

    it('should render achievements page with stats', async () => {
        render(
            <MemoryRouter>
                <Achievements />
            </MemoryRouter>
        );

        expect(screen.getByTestId('header')).toHaveTextContent('Achievements');
        expect(screen.getByText('Your Achievements')).toBeInTheDocument();
        expect(screen.getByText('2 / 3')).toBeInTheDocument();
        expect(screen.getByText('67% Complete')).toBeInTheDocument();
    });

    it('should render all achievements', () => {
        render(
            <MemoryRouter>
                <Achievements />
            </MemoryRouter>
        );

        expect(screen.getByText('First Steps')).toBeInTheDocument();
        expect(screen.getByText('Complete your first lesson')).toBeInTheDocument();
        expect(screen.getByText('Week Warrior')).toBeInTheDocument();
        expect(screen.getByText('Maintain a 7-day streak')).toBeInTheDocument();
        expect(screen.getByText('Module Master')).toBeInTheDocument();
    });

    it('should filter unlocked achievements', async () => {
        render(
            <MemoryRouter>
                <Achievements />
            </MemoryRouter>
        );

        const unlockedButton = screen.getAllByRole('button', { name: /Unlocked/i })[0];

        // Wait for data to load
        await waitFor(() => {
            expect(screen.getByText('First Steps')).toBeInTheDocument();
        });

        fireEvent.click(unlockedButton);

        expect(screen.getByText('First Steps')).toBeInTheDocument();
        expect(screen.getByText('Week Warrior')).toBeInTheDocument();
        expect(screen.queryByText('Module Master')).not.toBeInTheDocument();
    });

    it('should filter locked achievements', async () => {
        render(
            <MemoryRouter>
                <Achievements />
            </MemoryRouter>
        );

        const lockedButton = screen.getAllByRole('button', { name: /^Locked/i })[0];

        // Wait for data to load
        await waitFor(() => {
            expect(screen.getByText('First Steps')).toBeInTheDocument();
        });

        fireEvent.click(lockedButton);

        expect(await screen.findByText('Module Master')).toBeInTheDocument();
    });

    it('should show all achievements by default', async () => {
        render(
            <MemoryRouter>
                <Achievements />
            </MemoryRouter>
        );

        expect(await screen.findByText('First Steps')).toBeInTheDocument();
        expect(screen.getByText('Week Warrior')).toBeInTheDocument();
        expect(screen.getByText('Module Master')).toBeInTheDocument();
    });

    it('should group achievements by category', async () => {
        render(
            <MemoryRouter>
                <Achievements />
            </MemoryRouter>
        );

        expect(await screen.findByText('Practice Milestones')).toBeInTheDocument();
        expect(screen.getByText('Daily Consistency')).toBeInTheDocument();
        expect(screen.getByText('Module Mastery')).toBeInTheDocument();
    });

    it('should display achievement icons', async () => {
        render(
            <MemoryRouter>
                <Achievements />
            </MemoryRouter>
        );

        expect(await screen.findByText('🎯')).toBeInTheDocument();
        expect(screen.getByText('🔥')).toBeInTheDocument();
        expect(screen.getByText('👑')).toBeInTheDocument();
    });

    it('should handle empty achievements list', async () => {
        const { loadAchievements, getAchievementStats } = await import('../services/achievements');
        (loadAchievements as any).mockReturnValue([]);
        (getAchievementStats as any).mockReturnValue({ total: 0, unlocked: 0, percentage: 0 });

        render(
            <MemoryRouter>
                <Achievements />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('0 / 0')).toBeInTheDocument();
            expect(screen.getByText('0% Complete')).toBeInTheDocument();
        });
    });
});
