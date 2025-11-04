import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceInputProps {
  options: string[];
  onAnswer: (answer: string) => void;
  isDisabled?: boolean;
}

// Check if Speech Recognition is available
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const isSupported = !!SpeechRecognition;

export function VoiceInput({ options, onAnswer, isDisabled = false }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isSupported) return;

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Primary language

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptResult = event.results[current][0].transcript;
      setTranscript(transcriptResult);

      // If result is final, try to match with options
      if (event.results[current].isFinal) {
        matchTranscriptToOption(transcriptResult);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        setShowFeedback(true);
        setTranscript('No speech detected. Please try again.');
        setTimeout(() => setShowFeedback(false), 3000);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [options]);

  function matchTranscriptToOption(text: string) {
    const normalized = text.toLowerCase().trim();

    // Try exact match first
    let matchedOption = options.find(
      (opt) => opt.toLowerCase().trim() === normalized
    );

    // Try partial match (contains)
    if (!matchedOption) {
      matchedOption = options.find((opt) =>
        opt.toLowerCase().includes(normalized) ||
        normalized.includes(opt.toLowerCase())
      );
    }

    // Try fuzzy match for option letters (A, B, C, D)
    if (!matchedOption) {
      const letterMatch = normalized.match(/^([a-d])\b/i);
      if (letterMatch) {
        const index = letterMatch[1].toUpperCase().charCodeAt(0) - 65; // A=0, B=1, etc.
        if (index >= 0 && index < options.length) {
          matchedOption = options[index];
        }
      }
    }

    if (matchedOption) {
      setShowFeedback(true);
      setTimeout(() => {
        onAnswer(matchedOption!);
        setShowFeedback(false);
        setTranscript('');
      }, 500);
    } else {
      setShowFeedback(true);
      setTranscript(`Could not match "${text}" to an option. Try again or click.`);
      setTimeout(() => setShowFeedback(false), 3000);
    }
  }

  function startListening() {
    if (!recognitionRef.current || isDisabled || isListening) return;

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  }

  function stopListening() {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }

  if (!isSupported) {
    return null; // Don't show voice input if not supported
  }

  return (
    <div className="mb-4">
      {/* Voice Input Button */}
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={isDisabled}
        className={`
          w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300
          flex items-center justify-center gap-3
          ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
          }
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
        `}
      >
        <span className="text-2xl">{isListening ? '🎤' : '🎙️'}</span>
        <span>
          {isListening ? 'Listening... (Tap to stop)' : 'Answer with Voice'}
        </span>
      </button>

      {/* Visual Feedback */}
      <AnimatePresence>
        {(isListening || showFeedback) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3"
          >
            <div
              className={`
              p-4 rounded-xl border-2
              ${
                isListening
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
              }
            `}
            >
              {isListening && (
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ scaleY: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className="w-1 h-4 bg-purple-500 rounded-full"
                    />
                    <motion.div
                      animate={{ scaleY: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }}
                      className="w-1 h-4 bg-purple-500 rounded-full"
                    />
                    <motion.div
                      animate={{ scaleY: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className="w-1 h-4 bg-purple-500 rounded-full"
                    />
                  </div>
                  <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                    Speak now...
                  </span>
                </div>
              )}

              {transcript && (
                <div className="text-gray-700 dark:text-gray-300">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    You said:
                  </span>
                  <p className="mt-1 text-sm font-medium">{transcript}</p>
                </div>
              )}

              {isListening && (
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <p>💡 Say the answer text or letter (A, B, C, D)</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
