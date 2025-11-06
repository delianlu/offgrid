import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface SpeechButtonProps {
  onTranscript: (transcript: string) => void;
  disabled?: boolean;
}

export const SpeechButton: React.FC<SpeechButtonProps> = ({
  onTranscript,
  disabled = false
}) => {
  const { t } = useTranslation();
  const { isListening, transcript, startListening, isSupported, error } =
    useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  if (!isSupported) {
    return null; // Don't show button if not supported
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        onClick={startListening}
        disabled={disabled || isListening}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        className={`
          relative w-full max-w-md py-4 px-6 rounded-xl font-bold
          transition-all flex items-center justify-center gap-3
          ${isListening
            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse'
            : disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
          }
        `}
      >
        <motion.span
          className="text-2xl"
          animate={isListening ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          🎤
        </motion.span>
        <span>
          {isListening
            ? t('listening', 'Listening...')
            : t('speakYourAnswer', 'Speak Your Answer')}
        </span>
      </motion.button>

      {error && (
        <p className="text-sm text-red-600">
          {t('speechError', 'Could not understand. Please try again.')}
        </p>
      )}

      {transcript && !isListening && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-100 rounded-lg p-3 max-w-md w-full"
        >
          <p className="text-sm text-purple-900">
            {t('youSaid', 'You said')}: <strong>{transcript}</strong>
          </p>
        </motion.div>
      )}
    </div>
  );
};
