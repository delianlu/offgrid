import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';
import { VoiceRecorder } from '../components/common/VoiceRecorder';
import { db } from '../db/database';
import type { Module } from '../types/schemas';
import { StressPatternSchema } from '../types/schemas';
import { z } from 'zod';

type PracticeMode = 'menu' | 'clusters' | 'stress';
type StressPattern = z.infer<typeof StressPatternSchema>;

export default function PhonologyMode() {
    const [module, setModule] = useState<Module | null>(null);
    const [mode, setMode] = useState<PracticeMode>('menu');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadContent = async () => {
            try {
                const data = await db.modules.get('phonology-lab');
                if (data) {
                    setModule(data);
                } else {
                    setError('Module not found in database');
                }
            } catch (err) {
                console.error('Failed to load phonology module', err);
                setError(err instanceof Error ? err.message : 'Unknown error loading module');
            } finally {
                setLoading(false);
            }
        };
        loadContent();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !module) {
        return (
            <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-4">
                <h2 className="text-xl font-bold text-red-800 mb-4">Error Loading Module</h2>
                <pre className="text-red-600 mb-4 whitespace-pre-wrap max-w-2xl bg-white p-4 rounded shadow text-sm">
                    {error || 'Module not found'}
                </pre>
                <Link to="/" className="text-blue-600 hover:underline">Return Home</Link>
            </div>
        );
    }

    const renderMenu = () => (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-gray-900">Phonology Lab 🎙️</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Master the sounds of English! Choose a practice mode below to improve your pronunciation.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <button
                    onClick={() => setMode('clusters')}
                    className="group relative overflow-hidden bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all text-left border border-gray-100"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-8xl">🧩</span>
                    </div>
                    <div className="relative z-10">
                        <span className="text-4xl mb-4 block">🧩</span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Consonant Clusters</h3>
                        <p className="text-gray-500">
                            Practice tricky combinations like 'str', 'spl', and 'ths'.
                        </p>
                    </div>
                </button>

                <button
                    onClick={() => setMode('stress')}
                    className="group relative overflow-hidden bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all text-left border border-gray-100"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-8xl">📊</span>
                    </div>
                    <div className="relative z-10">
                        <span className="text-4xl mb-4 block">📊</span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Word Stress</h3>
                        <p className="text-gray-500">
                            Learn the rhythm of English words. 'RE-cord' vs 're-CORD'.
                        </p>
                    </div>
                </button>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2">Why this matters?</h3>
                <p className="text-blue-800 text-sm">
                    {module.contrastiveExplanation?.split('\n')[0]}
                </p>
            </div>
        </div>
    );

    const renderClusterPractice = () => {
        const clusters = module.consonantClusters || [];
        const currentCluster = clusters[currentIndex];

        return (
            <div className="max-w-2xl mx-auto px-4 py-8">
                <button
                    onClick={() => setMode('menu')}
                    className="mb-6 text-gray-500 hover:text-gray-900 flex items-center space-x-2"
                >
                    <span>← Back to Menu</span>
                </button>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white text-center">
                        <h2 className="text-3xl font-bold mb-2">Cluster: {currentCluster.cluster}</h2>
                        <p className="opacity-90">Position: {currentCluster.position}</p>
                    </div>

                    <div className="p-6 space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                            {currentCluster.words.map((word, idx) => (
                                <div key={idx} className="bg-gray-50 p-4 rounded-xl text-center">
                                    <p className="text-lg font-medium text-gray-800 mb-2">{word}</p>
                                    <VoiceRecorder modelText={word} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <button
                            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentIndex === 0}
                            className="px-4 py-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-gray-500 font-medium">
                            {currentIndex + 1} / {clusters.length}
                        </span>
                        <button
                            onClick={() => setCurrentIndex(prev => Math.min(clusters.length - 1, prev + 1))}
                            disabled={currentIndex === clusters.length - 1}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderStressPractice = () => {
        // Flatten all stress patterns into a single list for navigation
        const allPatterns = (Object.values(module.stressPatterns || {}) as StressPattern[][]).flat();
        const currentPattern = allPatterns[currentIndex];

        if (!currentPattern) return null;

        return (
            <div className="max-w-2xl mx-auto px-4 py-8">
                <button
                    onClick={() => setMode('menu')}
                    className="mb-6 text-gray-500 hover:text-gray-900 flex items-center space-x-2"
                >
                    <span>← Back to Menu</span>
                </button>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white text-center">
                        <h2 className="text-3xl font-bold mb-2">{currentPattern.word}</h2>
                        <p className="opacity-90 italic">{currentPattern.partOfSpeech}</p>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Visual Syllable Breakdown */}
                        <div className="flex justify-center items-end space-x-2 h-24 mb-8">
                            {currentPattern.syllableBreak.map((syllable, idx) => {
                                const isStressed = idx === currentPattern.stressedSyllableIndex;
                                return (
                                    <div key={idx} className="flex flex-col items-center space-y-2">
                                        <div
                                            className={`
                        w-12 rounded-t-lg transition-all duration-500
                        ${isStressed ? 'h-20 bg-orange-500' : 'h-10 bg-gray-200'}
                      `}
                                        ></div>
                                        <span className={`font-bold ${isStressed ? 'text-orange-600 text-xl' : 'text-gray-400'}`}>
                                            {syllable}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="max-w-sm mx-auto">
                            <VoiceRecorder modelText={currentPattern.word} />
                        </div>

                        {currentPattern.note && (
                            <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800 text-sm text-center">
                                💡 {currentPattern.note}
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <button
                            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentIndex === 0}
                            className="px-4 py-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-gray-500 font-medium">
                            {currentIndex + 1} / {allPatterns.length}
                        </span>
                        <button
                            onClick={() => setCurrentIndex(prev => Math.min(allPatterns.length - 1, prev + 1))}
                            disabled={currentIndex === allPatterns.length - 1}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header />

            {mode === 'menu' && renderMenu()}
            {mode === 'clusters' && renderClusterPractice()}
            {mode === 'stress' && renderStressPractice()}

            <BottomNav />
        </div>
    );
}
