import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface DuelCreatorProps {
    onBack: () => void;
}

const TOPICS = [
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

export const DuelCreator: React.FC<DuelCreatorProps> = ({ onBack }) => {
    const { t } = useTranslation();
    const [selectedTopic, setSelectedTopic] = useState(TOPICS[0]);
    const [difficulty, setDifficulty] = useState('medium');
    const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

    const generateDuel = () => {
        // Generate a random seed
        const seed = Math.floor(Math.random() * 1000000).toString();

        // Create the duel URL
        // Format: app://duel?topic=...&seed=...&diff=...
        // In a real PWA we might use a proper URL scheme or just a query param on the main domain
        // For this implementation, we'll use the current origin + /duel
        const baseUrl = window.location.origin + '/duel';
        const url = `${baseUrl}?action=join&topic=${selectedTopic}&seed=${seed}&diff=${difficulty}`;

        setGeneratedUrl(url);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center mb-6">
                <button
                    onClick={onBack}
                    className="mr-4 p-2 rounded-full hover:bg-gray-100"
                >
                    ←
                </button>
                <h2 className="text-2xl font-bold">Create Challenge</h2>
            </div>

            {!generatedUrl ? (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Topic
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {TOPICS.map(topic => (
                                <button
                                    key={topic}
                                    onClick={() => setSelectedTopic(topic)}
                                    className={`p-4 rounded-xl text-left border-2 transition-all ${selectedTopic === topic
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <span className="font-bold block">{t(`modules.${topic}`)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Difficulty
                        </label>
                        <div className="flex gap-2">
                            {['easy', 'medium', 'hard'].map(diff => (
                                <button
                                    key={diff}
                                    onClick={() => setDifficulty(diff)}
                                    className={`flex-1 py-3 rounded-lg font-medium capitalize transition-colors ${difficulty === diff
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {diff}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={generateDuel}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                    >
                        Generate QR Code
                    </button>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center flex-grow space-y-8"
                >
                    <div className="bg-white p-6 rounded-2xl shadow-xl border-4 border-blue-100">
                        <QRCodeSVG value={generatedUrl} size={256} level="H" />
                    </div>

                    <div className="text-center">
                        <h3 className="text-xl font-bold mb-2">Scan to Join!</h3>
                        <p className="text-gray-600 mb-6">
                            Ask your friend to scan this code using the "Join" button in their app.
                        </p>

                        <button
                            onClick={() => setGeneratedUrl(null)}
                            className="text-blue-600 font-bold hover:underline"
                        >
                            Create New Challenge
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};
