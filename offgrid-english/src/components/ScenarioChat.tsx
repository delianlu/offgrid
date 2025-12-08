import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AudioButton } from './common/AudioButton';

export interface Message {
    id: string;
    sender: 'bot' | 'user' | 'system';
    text: string;
    audio?: boolean;
}

export interface Option {
    id: string;
    text: string;
    nextId: string;
    isCorrect?: boolean; // For educational feedback
    feedback?: string;
}

export interface ScenarioStep {
    id: string;
    text: string;
    options: Option[];
}

interface ScenarioChatProps {
    scenarioTitle: string;
    steps: Record<string, ScenarioStep>;
    initialStepId: string;
    onComplete: (score: number) => void;
}

export function ScenarioChat({ scenarioTitle, steps, initialStepId, onComplete }: ScenarioChatProps) {
    const [history, setHistory] = useState<Message[]>([]);
    const [currentStepId, setCurrentStepId] = useState(initialStepId);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [score, setScore] = useState(0);

    const initialized = useRef(false);

    // Initial bot message
    useEffect(() => {
        if (!initialized.current && history.length === 0) {
            initialized.current = true;
            addBotMessage(steps[initialStepId].text);
        }
    }, []);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isTyping]);

    const addBotMessage = (text: string) => {
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            setHistory(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'bot',
                text,
                audio: true
            }]);
        }, 1000); // Fake typing delay
    };

    const handleOptionClick = (option: Option) => {
        // Add user message
        setHistory(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'user',
            text: option.text
        }]);

        // Show feedback if exists
        if (option.feedback) {
            setTimeout(() => {
                setHistory(prev => [...prev, {
                    id: 'fb-' + Date.now(),
                    sender: 'system',
                    text: option.feedback!
                }]);
            }, 500);
        }

        // Update score if educational
        if (option.isCorrect) {
            setScore(s => s + 10);
        }

        // Move to next step
        if (option.nextId === 'END') {
            setTimeout(() => onComplete(score + (option.isCorrect ? 10 : 0)), 1500);
        } else if (option.nextId) {
            const nextStep = steps[option.nextId];
            if (nextStep) {
                // Delay bot response if there was feedback
                const delay = option.feedback ? 1500 : 1000;
                setTimeout(() => {
                    setCurrentStepId(option.nextId);
                    addBotMessage(nextStep.text);
                }, delay);
            }
        }
    };

    const currentStep = steps[currentStepId];

    return (
        <div className="flex flex-col h-[600px] bg-gray-50 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
            {/* Header */}
            <div className="bg-blue-600 p-4 text-white flex items-center gap-3 shadow-md">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                    🎭
                </div>
                <div>
                    <h3 className="font-bold text-lg">{scenarioTitle}</h3>
                    <p className="text-blue-100 text-xs">Role-Play Mode</p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {history.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}
                    >
                        <div
                            className={`
                max-w-[80%] p-3 rounded-2xl shadow-sm relative group
                ${msg.sender === 'user'
                                    ? 'bg-blue-500 text-white rounded-tr-none'
                                    : msg.sender === 'system'
                                        ? 'bg-yellow-50 text-yellow-800 border border-yellow-200 italic text-sm'
                                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'}
              `}
                        >
                            <p className="text-sm md:text-base">{msg.text}</p>
                            {msg.sender === 'bot' && (
                                <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <AudioButton text={msg.text} size="sm" />
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 p-3 rounded-2xl rounded-tl-none flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Options Area */}
            <div className="bg-white p-4 border-t border-gray-200">
                {!isTyping && currentStep && (
                    <div className="grid gap-2">
                        {currentStep.options.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => handleOptionClick(opt)}
                                className="w-full text-left p-3 rounded-xl border-2 border-blue-100 hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-700 font-medium text-sm md:text-base"
                            >
                                {opt.text}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
