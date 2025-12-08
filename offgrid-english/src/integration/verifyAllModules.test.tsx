import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModulePractice } from '../pages/ModulePractice';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { db } from '../db/database';
import * as adaptiveDifficulty from '../services/adaptiveDifficulty';
import fs from 'node:fs';
import path from 'node:path';

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

vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({ currentUser: { id: 'test-user' } }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('../services/achievements', () => ({
    checkAchievements: vi.fn().mockResolvedValue([]),
}));

// Mock child components to isolate ModulePractice
vi.mock('../components/common/Header', () => ({
    Header: () => <div data-testid="mock-header">Header</div>,
}));

vi.mock('../components/MultipleChoice', () => ({
    MultipleChoice: ({ question, onAnswer }: any) => (
        <div data-testid="mock-multiple-choice">
            <div>{question}</div>
            <button onClick={() => onAnswer('test-answer')}>Answer</button>
        </div>
    ),
}));

vi.mock('../components/EnhancedFeedback', () => ({
    EnhancedFeedback: ({ onContinue }: any) => (
        <div data-testid="mock-feedback">
            <button onClick={onContinue}>Continue</button>
        </div>
    ),
}));

vi.mock('../components/CompletionCelebration', () => ({
    CompletionCelebration: () => <div data-testid="mock-celebration">Celebration</div>,
}));

vi.mock('../components/AchievementToast', () => ({
    AchievementToast: () => null,
}));

vi.mock('../components/PerformanceInsight', () => ({
    PerformanceInsight: () => null,
}));

vi.mock('../components/common/FlagModal', () => ({
    FlagModal: () => null,
}));

// List of all 18 modules from App.tsx
const MODULE_IDS = [
    'tense-form',
    'subject-verb-agreement',
    'prepositions',
    'word-order',
    'plurality',
    'articles',
    'auxiliaries',
    'pronouns-possessives',
    'gerunds-infinitives',
    'comparatives-superlatives',
    'conditionals',
    'sentence-connectors',
    'countable-uncountable',
    'question-tags',
    'relative-clauses',
    'false-cognates',
    'passive-voice',
    'reported-speech'
];

describe('All Modules Verification', () => {
    // Load actual content for each module
    const moduleContent: Record<string, any[]> = {};

    beforeAll(() => {
        MODULE_IDS.forEach(id => {
            try {
                const filePath = path.join(process.cwd(), 'public/modules', `${id}.json`);
                const raw = fs.readFileSync(filePath, 'utf8');
                const json = JSON.parse(raw);
                // Handle the structure (some might still be nested if my fix script missed something, but it should be fixed)
                moduleContent[id] = Array.isArray(json.items) ? json.items : [];
            } catch (e) {
                console.error(`Failed to load content for ${id}:`, e);
                moduleContent[id] = [];
            }
        });
    });

    beforeEach(() => {
        vi.clearAllMocks();
        (adaptiveDifficulty.calculatePerformanceLevel as any).mockResolvedValue('novice');
    });

    MODULE_IDS.forEach(moduleId => {
        it(`should load and play module: ${moduleId}`, async () => {
            const items = moduleContent[moduleId];

            if (!items || items.length === 0) {
                // Fail if content is missing (unless it's expected to be empty like phonology, but these are grammar modules)
                throw new Error(`No items found for module ${moduleId}`);
            }

            // Filter for Form A items as ModulePractice starts with Form A
            const formAItems = items.filter((i: any) => i.formType === 'A');
            if (formAItems.length === 0) {
                throw new Error(`No Form A items found for module ${moduleId}`);
            }

            const testItem = formAItems[0];

            // Setup DB mocks for this specific module
            (db.items.toArray as any).mockResolvedValue(items);
            (db.modules.get as any).mockResolvedValue({ id: moduleId, name: 'Test Module' });

            // Mock adaptive difficulty to return the first item
            (adaptiveDifficulty.selectNextQuestion as any).mockResolvedValue(testItem);

            render(
                <MemoryRouter initialEntries={[`/practice/${moduleId}`]}>
                    <Routes>
                        <Route path="/practice/:moduleId" element={<ModulePractice />} />
                    </Routes>
                </MemoryRouter>
            );

            // 1. Verify loading
            expect(screen.getByText(/Loading module/i)).toBeInTheDocument();

            // 2. Verify question text appears (wait for async load)
            await waitFor(() => {
                expect(screen.getByText(testItem.questionText)).toBeInTheDocument();
            }, { timeout: 3000 });

            // 3. Find options (Mocked MultipleChoice doesn't render options, just a button)
            // const options = testItem.options;
            // expect(options.length).toBeGreaterThan(0);

            // 4. Click an option (using the mock button)
            const answerButton = screen.getByText('Answer');
            fireEvent.click(answerButton);

            // 5. Verify feedback appears
            await waitFor(() => {
                // Feedback component usually shows "Correct" or "Incorrect" or the explanation
                // We can look for the "Continue" button which appears in feedback
                expect(screen.getByText('Continue')).toBeInTheDocument();
            });
        });
    });
});
