import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BottomNav } from './BottomNav';
import { MemoryRouter } from 'react-router-dom';

// Mock translation
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            if (key === 'navigation.home') return 'Home';
            if (key === 'navigation.practice') return 'Practice';
            if (key === 'navigation.progress') return 'Progress';
            if (key === 'navigation.settings') return 'Settings';
            return key;
        },
    }),
}));

describe('BottomNav', () => {
    it('should render all navigation items', () => {
        render(
            <MemoryRouter>
                <BottomNav />
            </MemoryRouter>
        );
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Practice')).toBeInTheDocument();
        expect(screen.getByText('Progress')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should highlight the active item', () => {
        render(
            <MemoryRouter initialEntries={['/progress-report']}>
                <BottomNav />
            </MemoryRouter>
        );

        // The active item should have specific styling (e.g., text-earth-900)
        // We can check if the active class is applied to the label or container
        const progressLabel = screen.getByText('Progress');
        expect(progressLabel).toHaveClass('text-earth-900');

        const homeLabel = screen.getByText('Home');
        expect(homeLabel).not.toHaveClass('text-earth-900');
    });
});
