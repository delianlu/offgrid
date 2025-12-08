import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { db } from '../db/database';
import type { Module } from '../types/schemas';

export function ClassroomSession() {
    const navigate = useNavigate();
    const [mode, setMode] = useState<'select' | 'teacher' | 'student'>('select');
    const [modules, setModules] = useState<Module[]>([]);
    const [selectedModuleId, setSelectedModuleId] = useState('');
    const [sessionCode, setSessionCode] = useState('');
    const [studentCode, setStudentCode] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        db.modules.toArray().then(setModules);
    }, []);

    // Generate a random 4-char code (e.g., "LION-45")
    function generateCode() {
        const words = ['LION', 'TIGER', 'EAGLE', 'BEAR', 'WOLF', 'HAWK', 'FOX', 'OWL'];
        const word = words[Math.floor(Math.random() * words.length)];
        const num = Math.floor(Math.random() * 90 + 10); // 10-99
        return `${word}-${num}`;
    }

    function startTeacherSession() {
        if (!selectedModuleId) return;
        const code = generateCode();
        setSessionCode(code);
        setMode('teacher');
    }

    function joinSession() {
        if (!studentCode.trim()) {
            setError('Please enter a session code');
            return;
        }
        // In a real app, we might validate against a server.
        // Here, we just use the code as a seed.
        // Format validation (optional but good UI)
        if (!/^[A-Z]+-\d{2}$/i.test(studentCode)) {
            setError('Invalid code format. Example: LION-45');
            return;
        }

        // Navigate to practice with seed
        // We need to pass the seed to the practice page. 
        // We'll use a query param ?seed=CODE
        // But first we need to know WHICH module. 
        // In this offline-first design, the student needs to select the module OR 
        // the code needs to encode the module ID (too complex for short code).
        // Let's ask the student to select the module too, or just let them enter the code 
        // and we assume the teacher told them which module to pick.
        // BETTER: The teacher tells them "Go to Verb Tense and enter code LION-45".
        // So this page might just be a "Lobby" or we redirect to a generic practice starter.

        // Actually, let's keep it simple:
        // This page is just for generating the code.
        // The student enters the code AND selects the module here?
        // Or simpler: The student goes to the specific module page and clicks "Join Session"?
        // Let's do it here: Student picks module + enters code -> Redirect to practice.

        if (!selectedModuleId) {
            setError('Please select the module your teacher specified');
            return;
        }

        navigate(`/practice/${selectedModuleId}?seed=${studentCode.toUpperCase()}`);
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header showLanguageToggle />

            <main className="max-w-2xl mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-8"
                >
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            🏫 Classroom Mode
                        </h1>
                        <p className="text-gray-600">
                            Practice together with synchronized questions
                        </p>
                    </div>

                    {mode === 'select' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button
                                onClick={() => setMode('teacher')}
                                className="flex flex-col items-center p-8 rounded-xl border-2 border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                            >
                                <span className="text-6xl mb-4 group-hover:scale-110 transition-transform">👨‍🏫</span>
                                <h2 className="text-xl font-bold text-gray-900">I am a Teacher</h2>
                                <p className="text-sm text-gray-500 mt-2 text-center">
                                    Create a session code for your students
                                </p>
                            </button>

                            <button
                                onClick={() => setMode('student')}
                                className="flex flex-col items-center p-8 rounded-xl border-2 border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                            >
                                <span className="text-6xl mb-4 group-hover:scale-110 transition-transform">👨‍🎓</span>
                                <h2 className="text-xl font-bold text-gray-900">I am a Student</h2>
                                <p className="text-sm text-gray-500 mt-2 text-center">
                                    Join a session with a code
                                </p>
                            </button>
                        </div>
                    )}

                    {mode === 'teacher' && !sessionCode && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Module to Practice
                                </label>
                                <select
                                    value={selectedModuleId}
                                    onChange={(e) => setSelectedModuleId(e.target.value)}
                                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">-- Choose a Module --</option>
                                    {modules.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="secondary" onClick={() => setMode('select')} className="flex-1">
                                    Back
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={startTeacherSession}
                                    disabled={!selectedModuleId}
                                    className="flex-1"
                                >
                                    Generate Code
                                </Button>
                            </div>
                        </div>
                    )}

                    {mode === 'teacher' && sessionCode && (
                        <div className="text-center space-y-8">
                            <div className="bg-indigo-50 rounded-xl p-8 border-2 border-indigo-100">
                                <p className="text-sm text-indigo-600 font-bold uppercase tracking-wider mb-2">
                                    Session Code
                                </p>
                                <div className="text-5xl font-black text-indigo-900 tracking-widest font-mono">
                                    {sessionCode}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-lg text-gray-700">
                                    Tell your students to:
                                </p>
                                <ol className="text-left max-w-sm mx-auto space-y-3 text-gray-600 list-decimal pl-6">
                                    <li>Go to <strong>Classroom Mode</strong></li>
                                    <li>Select <strong>Student</strong></li>
                                    <li>Choose <strong>{modules.find(m => m.id === selectedModuleId)?.name}</strong></li>
                                    <li>Enter code <strong>{sessionCode}</strong></li>
                                </ol>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="secondary" onClick={() => { setSessionCode(''); setMode('select'); }}>
                                    End Session
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => navigate(`/practice/${selectedModuleId}?seed=${sessionCode}`)}
                                >
                                    Join as Teacher
                                </Button>
                            </div>
                        </div>
                    )}

                    {mode === 'student' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    1. Select Module
                                </label>
                                <select
                                    value={selectedModuleId}
                                    onChange={(e) => setSelectedModuleId(e.target.value)}
                                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option value="">-- Choose a Module --</option>
                                    {modules.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    2. Enter Session Code
                                </label>
                                <input
                                    type="text"
                                    value={studentCode}
                                    onChange={(e) => {
                                        setStudentCode(e.target.value.toUpperCase());
                                        setError('');
                                    }}
                                    placeholder="e.g. LION-45"
                                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-lg uppercase placeholder:normal-case"
                                />
                                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                            </div>

                            <div className="flex gap-3">
                                <Button variant="secondary" onClick={() => setMode('select')} className="flex-1">
                                    Back
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={joinSession}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                >
                                    Join Session
                                </Button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
