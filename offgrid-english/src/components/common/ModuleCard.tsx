import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { calculateModuleProgress, getBadgeInfo, type ModuleProgress } from '../../services/progressTracking';

interface ModuleCardProps {
  id: string;
  name: string;
  items: number;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ id, name, items }) => {
  const [progress, setProgress] = useState<ModuleProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const moduleProgress = await calculateModuleProgress(id);
      setProgress(moduleProgress);
      setLoading(false);
    })();
  }, [id]);

  if (loading || !progress) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border-l-4 border-gray-300">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Icon mapping for each module
  const moduleIcons: Record<string, string> = {
    'tense-form': '⏰',
    'subject-verb-agreement': '🤝',
    'prepositions': '📍',
    'word-order': '🔤',
    'plurality': '👥',
    'articles': '📰',
    'auxiliaries': '🔧',
    'cameroonian-scenarios': '🏪',
    'false-cognates': '🔄',
  };

  const icon = moduleIcons[id] || '📖';
  const badgeInfo = getBadgeInfo(progress.badge);
  const isLocked = progress.badge === 'locked';

  // Calculate circle parameters for SVG
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress.overallCompletion / 100) * circumference;

  const cardContent = (
    <div
      className={`
        relative overflow-hidden group
        ${isLocked ? 'bg-gray-50/80 dark:bg-gray-800/50' : 'backdrop-blur-xl bg-white/90 dark:bg-gray-800/90'}
        rounded-3xl shadow-2xl p-7 border border-gray-200/50 dark:border-gray-700/50
        ${!isLocked && 'hover:shadow-orange-500/20 hover:scale-[1.03] hover:-translate-y-1 transition-all duration-300 cursor-pointer'}
        ${isLocked && 'opacity-60'}
      `}
    >
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500"></div>

      {/* Badge */}
      <div className="absolute top-5 right-5 z-10">
        <div className={`${badgeInfo.bgColor} ${badgeInfo.color} px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg`}>
          <span>{badgeInfo.icon}</span>
          <span>{badgeInfo.label}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center gap-6 mb-5 mt-2">
        {/* Circular Progress Ring */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress circle */}
            <motion.circle
              cx="40"
              cy="40"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={
                progress.badge === 'complete' ? 'text-green-500' :
                progress.badge === 'mastered' ? 'text-green-600' :
                progress.badge === 'practicing' ? 'text-orange-500' :
                progress.badge === 'learning' ? 'text-orange-400' :
                'text-gray-400'
              }
              strokeLinecap="round"
            />
          </svg>
          {/* Icon in center */}
          <div className="absolute inset-0 flex items-center justify-center text-3xl">
            {icon}
          </div>
        </div>

        {/* Title and Stats */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-xl font-black mb-1.5 ${isLocked ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
            {name}
          </h3>
          <p className={`text-sm mb-3 font-medium ${isLocked ? 'text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>
            {items} practice items
          </p>

          {/* Phase Progress */}
          {!isLocked && (
            <div className="flex gap-4 text-xs">
              <div className="backdrop-blur-sm bg-green-50/80 dark:bg-green-900/20 px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-800">
                <span className="text-green-700 dark:text-green-400 font-bold">Phase 2: </span>
                <span className={progress.isFormAComplete ? 'text-green-700 dark:text-green-400 font-black' : 'text-gray-600 dark:text-gray-400 font-semibold'}>
                  {progress.formAProgress}%
                </span>
              </div>
              <div className="backdrop-blur-sm bg-amber-50/80 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
                <span className="text-amber-700 dark:text-amber-400 font-bold">Phase 3: </span>
                <span className={progress.isFormBComplete ? 'text-amber-700 dark:text-amber-400 font-black' : 'text-gray-600 dark:text-gray-400 font-semibold'}>
                  {progress.isFormBUnlocked ? `${progress.formBProgress}%` : '🔒'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-3">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress.overallCompletion}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-3 rounded-full shadow-lg ${
              progress.badge === 'complete' ? 'bg-gradient-to-r from-green-500 to-green-600' :
              progress.badge === 'mastered' ? 'bg-gradient-to-r from-green-500 to-green-600' :
              progress.badge === 'practicing' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
              progress.badge === 'learning' ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
              'bg-gradient-to-r from-gray-400 to-gray-500'
            }`}
          />
        </div>
      </div>

      {/* Bottom Status Text */}
      <div className="flex justify-between items-center text-sm">
        <span className={`font-black ${
          progress.badge === 'complete' ? 'text-green-600 dark:text-green-400' :
          progress.badge === 'mastered' ? 'text-green-600 dark:text-green-400' :
          progress.badge === 'practicing' ? 'text-orange-600 dark:text-orange-400' :
          progress.badge === 'learning' ? 'text-orange-600 dark:text-orange-400' :
          'text-gray-500'
        }`}>
          {progress.overallCompletion}% Complete
        </span>
        {progress.totalAttempts > 0 && (
          <span className="text-gray-500 dark:text-gray-400 font-semibold">
            {progress.totalAttempts} attempts
          </span>
        )}
      </div>

      {/* Unlock Message for Form B */}
      {!isLocked && !progress.isFormBUnlocked && progress.formAProgress > 0 && (
        <div className="mt-4 backdrop-blur-sm bg-gradient-to-r from-orange-50/90 to-yellow-50/90 dark:from-orange-900/30 dark:to-yellow-900/30 border border-orange-300 dark:border-orange-700 rounded-xl p-3 shadow-md">
          <p className="text-xs text-orange-800 dark:text-orange-300 font-bold">
            🔒 Complete Phase 2 with 70%+ accuracy to unlock Phase 3
          </p>
        </div>
      )}
    </div>
  );

  if (isLocked) {
    return cardContent;
  }

  return (
    <Link to={`/learn/${id}`} className="block">
      {cardContent}
    </Link>
  );
};
