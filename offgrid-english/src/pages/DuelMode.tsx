import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { DuelCreator } from '../components/duel/DuelCreator';
import { DuelScanner } from '../components/duel/DuelScanner';
import { motion } from 'framer-motion';

export const DuelMode: React.FC = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header title="Offline Duel" />

            <main className="flex-1 container mx-auto px-6 py-6 flex flex-col">
                {mode === 'menu' && (
                    <div className="flex flex-col gap-6 flex-grow justify-center max-w-md mx-auto w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mb-8"
                        >
                            <div className="text-6xl mb-4">⚔️</div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Offline Duel</h1>
                            <p className="text-gray-600">
                                Challenge a friend nearby. No internet required.
                            </p>
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            onClick={() => setMode('create')}
                            className="bg-white border-2 border-blue-500 p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all text-left group"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-3xl bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors">👑</span>
                                <span className="text-blue-500 font-bold">Create</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Create Challenge</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Pick a topic and generate a QR code for your friend to scan.
                            </p>
                        </motion.button>

                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            onClick={() => setMode('join')}
                            className="bg-white border-2 border-purple-500 p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all text-left group"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-3xl bg-purple-100 p-3 rounded-xl group-hover:bg-purple-200 transition-colors">📷</span>
                                <span className="text-purple-500 font-bold">Join</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Scan QR Code</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Scan a friend's code to join their battle instantly.
                            </p>
                        </motion.button>
                    </div>
                )}

                {mode === 'create' && (
                    <DuelCreator onBack={() => setMode('menu')} />
                )}

                {mode === 'join' && (
                    <DuelScanner onBack={() => setMode('menu')} />
                )}
            </main>
        </div>
    );
};
