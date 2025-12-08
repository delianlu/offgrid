import { useState, useEffect } from 'react';

interface AudioButtonProps {
    text: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function AudioButton({ text, size = 'md', className = '' }: AudioButtonProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        if ('speechSynthesis' in window) {
            setIsSupported(true);
        }
    }, []);

    const handlePlay = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering parent click events (like card flips)

        if (!isSupported || isPlaying) return;

        setIsPlaying(true);

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9; // Slightly slower for clarity

        utterance.onend = () => {
            setIsPlaying(false);
        };

        utterance.onerror = () => {
            setIsPlaying(false);
        };

        window.speechSynthesis.cancel(); // Cancel any current speech
        window.speechSynthesis.speak(utterance);
    };

    if (!isSupported) return null;

    const sizeClasses = {
        sm: 'w-6 h-6 text-sm',
        md: 'w-8 h-8 text-base',
        lg: 'w-10 h-10 text-lg'
    };

    return (
        <button
            onClick={handlePlay}
            disabled={isPlaying}
            className={`
        inline-flex items-center justify-center rounded-full 
        bg-blue-100 text-blue-600 hover:bg-blue-200 
        transition-colors duration-200 
        ${sizeClasses[size]} 
        ${isPlaying ? 'animate-pulse text-blue-800 bg-blue-200' : ''}
        ${className}
      `}
            title="Listen to pronunciation"
            aria-label={`Listen to ${text}`}
        >
            {isPlaying ? '🔊' : '🔈'}
        </button>
    );
}
