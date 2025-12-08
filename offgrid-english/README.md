# OffGrid English

An offline-first Progressive Web App (PWA) for teaching English grammar to Francophone learners in Cameroon.

## Overview

OffGrid English is designed to work 100% offline, making it accessible in areas with limited or no internet connectivity. The app features adaptive learning algorithms, spaced repetition, and culturally relevant content specifically tailored for French-speaking students learning English.

## Features

- **19 Grammar Modules** covering essential English grammar topics
- **Offline-First Architecture** - works completely without internet after initial load
- **Adaptive Learning** - difficulty adjusts based on learner performance
- **Spaced Repetition** - optimizes long-term retention using SM-2 algorithm
- **Progress Tracking** - detailed analytics and performance insights
- **Bilingual Support** - French and English interface
- **Achievement System** - gamification elements to increase engagement
- **Teacher Dashboard** - tools for classroom management and student monitoring

## Grammar Modules

1. Verb Tense & Form
2. Subject-Verb Agreement
3. Prepositions
4. Word Order
5. Plurality
6. Articles (a/an/the)
7. Auxiliaries (do/does/did)
8. Pronouns & Possessives
9. Gerunds & Infinitives
10. Comparatives & Superlatives
11. Conditionals
12. Sentence Connectors
13. Countable & Uncountable Nouns
14. Question Tags
15. Relative Clauses
16. False Cognates
17. Passive Voice
18. Reported Speech
19. Phonology

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Database**: Dexie.js (IndexedDB wrapper)
- **PWA**: vite-plugin-pwa with Workbox
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Testing**: Vitest + React Testing Library
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Validate content structure
npm run validate:content
```

### Development

The app will be available at `http://localhost:5173` when running the development server.

## Project Structure

```
offgrid-english/
├── public/
│   ├── modules/          # JSON content files for grammar modules
│   └── assets/           # Static assets (images, icons)
├── src/
│   ├── components/       # React components
│   ├── pages/           # Page-level components
│   ├── services/        # Business logic and algorithms
│   ├── db/              # Database schema and operations
│   ├── types/           # TypeScript type definitions
│   └── i18n/            # Internationalization files
├── scripts/             # Build and validation scripts
└── dist/                # Production build output
```

## Content Management

Grammar content is stored in JSON files under `public/modules/`. Each module contains:
- Module metadata (id, name, description)
- Learning items (Form A - initial learning)
- Practice items (Form B - reinforcement)

Content is validated using Zod schemas to ensure data integrity.

## Offline Capabilities

The app uses:
- **Service Workers** for offline functionality
- **IndexedDB** for local data storage
- **Cache-First Strategy** for static assets
- **Background Sync** for data synchronization (when available)

## Contributing

This is an educational project. Contributions should maintain:
- TypeScript type safety
- Offline-first architecture
- Cultural relevance for Cameroonian learners
- Accessibility standards
- Code quality and testing

## License

This project is private and intended for educational purposes.

## Acknowledgments

Built as part of an educational technology initiative to improve English proficiency in Francophone regions of Cameroon.
