import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return; // Don't show again for 7 days
      }
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after 30 seconds of usage
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  async function handleInstallClick() {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  }

  function handleDismiss() {
    localStorage.setItem('pwa_install_dismissed', Date.now().toString());
    setShowPrompt(false);
  }

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-5">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Dismiss"
          >
            ✕
          </button>

          {/* Icon */}
          <div className="flex items-start gap-4">
            <div className="text-4xl flex-shrink-0">📱</div>
            <div className="flex-1 pr-6">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">
                Install OffGrid English
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                Add to your home screen for quick access, offline use, and a native app experience.
              </p>

              {/* Benefits */}
              <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mb-4">
                <li>✓ Works 100% offline</li>
                <li>✓ Faster loading</li>
                <li>✓ Full-screen experience</li>
                <li>✓ Easy home screen access</li>
              </ul>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
                >
                  Install Now
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
