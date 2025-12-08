import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';
import { BrowserRouter } from 'react-router-dom';

// Mock translation
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            changeLanguage: vi.fn(),
            language: 'en',
        },
    }),
}));

describe('Header', () => {
    it('should render the logo', () => {
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );
        expect(screen.getByAltText('OffGrid English Logo')).toBeInTheDocument();
        expect(screen.getByText('OffGrid English')).toBeInTheDocument();
    });

    it('should render the back button when onBack is provided', () => {
        const onBack = vi.fn();
        render(
            <BrowserRouter>
                <Header onBack={onBack} />
            </BrowserRouter>
        );
        expect(screen.getByText('Back')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Back'));
        expect(onBack).toHaveBeenCalled();
    });

    it('should render the progress bar when progress is provided', () => {
        render(
            <BrowserRouter>
                <Header progress={50} />
            </BrowserRouter>
        );
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toBeInTheDocument();
        expect(progressBar).toHaveStyle('width: 50%');
    });

    it('should render the title when provided', () => {
        render(
            <BrowserRouter>
                <Header title="Test Title" showLogo={false} />
            </BrowserRouter>
        );
        expect(screen.getByText('Test Title')).toBeInTheDocument();
    });
});
