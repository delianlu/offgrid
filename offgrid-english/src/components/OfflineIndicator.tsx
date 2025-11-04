import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }

    function handleOffline() {
      setIsOnline(false);
      setShowToast(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showToast && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div
            className={`${
              isOnline
                ? 'bg-green-500 dark:bg-green-600'
                : 'bg-orange-500 dark:bg-orange-600'
            } text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3`}
          >
            <div className="text-2xl">{isOnline ? '🌐' : '📡'}</div>
            <div className="font-semibold">
              {isOnline ? 'Back Online!' : 'Offline Mode'}
            </div>
            {!isOnline && (
              <div className="text-sm opacity-90">All features still work</div>
            )}
          </div>
        </motion.div>
      )}

      {/* Persistent offline badge */}
      {!isOnline && !showToast && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed top-20 right-4 z-40"
        >
          <div className="bg-orange-500 dark:bg-orange-600 text-white px-3 py-1.5 rounded-full shadow-md text-xs font-semibold flex items-center gap-2">
            <span>📡</span>
            <span>Offline</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
