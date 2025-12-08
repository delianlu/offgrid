import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const ONBOARDING_KEY = 'offgrid_onboarding_completed';

interface OnboardingStep {
  title: string;
  description: string;
  icon: string;
  link?: string;
  linkText?: string;
}

const STEPS: OnboardingStep[] = [
  {
    title: 'Welcome to OffGrid English! 👋',
    description:
      'Master English grammar at your own pace, completely offline. Built specifically for Francophone learners in Cameroon.',
    icon: '📚',
  },
  {
    title: 'Practice with Real Scenarios 🎯',
    description:
      'Learn through contextualized questions based on real situations you encounter every day in Cameroon.',
    icon: '🌍',
  },
  {
    title: 'Smart Learning Features 🧠',
    description:
      'Our AI-powered Smart Practice identifies your weak areas and creates personalized sessions just for you.',
    icon: '⚡',
    link: '/smart-practice',
    linkText: 'Try Smart Practice',
  },
  {
    title: 'Track Your Progress 📊',
    description:
      'See detailed analytics, unlock achievements, and get weekly reports showing your improvement over time.',
    icon: '📈',
    link: '/progress-report',
    linkText: 'View Progress',
  },
  {
    title: 'Works 100% Offline 🌐',
    description:
      'No internet? No problem! All features work completely offline so you can learn anytime, anywhere.',
    icon: '📡',
  },
];

export function Onboarding() {
  const [show, setShow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if onboarding has been completed
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      // Show after a short delay for better UX
      setTimeout(() => setShow(true), 500);
    }
  }, []);

  function handleNext() {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  }

  function handleSkip() {
    setShow(false);
    localStorage.setItem(ONBOARDING_KEY, Date.now().toString());
  }

  function handleComplete() {
    setShow(false);
    // Use requestAnimationFrame to ensure the state update paints before we do the heavy lifting of storage
    requestAnimationFrame(() => {
      localStorage.setItem(ONBOARDING_KEY, Date.now().toString());
    });
  }

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleSkip}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full pointer-events-auto overflow-hidden"
            >
              {/* Progress Bar */}
              <div className="h-1 bg-gray-200 dark:bg-gray-700">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: '0%' }}
                  animate={{
                    width: `${((currentStep + 1) / STEPS.length) * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Icon */}
                <motion.div
                  key={currentStep}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="text-7xl mb-6 text-center"
                >
                  {step.icon}
                </motion.div>

                {/* Title */}
                <motion.h2
                  key={`title-${currentStep}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center"
                >
                  {step.title}
                </motion.h2>

                {/* Description */}
                <motion.p
                  key={`desc-${currentStep}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-600 dark:text-gray-300 text-center leading-relaxed mb-6"
                >
                  {step.description}
                </motion.p>

                {/* Optional Link */}
                {step.link && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mb-6"
                  >
                    <Link
                      to={step.link}
                      onClick={handleComplete}
                      className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg font-semibold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      {step.linkText} →
                    </Link>
                  </motion.div>
                )}

                {/* Step Indicator */}
                <div className="flex justify-center gap-2 mb-6">
                  {STEPS.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer hover:opacity-75 ${index === currentStep
                          ? 'w-8 bg-blue-500'
                          : 'w-2 bg-gray-300 dark:bg-gray-600'
                        }`}
                      aria-label={`Go to step ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSkip}
                    className="flex-1 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-semibold rounded-xl transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-md transition-all"
                  >
                    {isLastStep ? "Let's Go! 🚀" : 'Next'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
