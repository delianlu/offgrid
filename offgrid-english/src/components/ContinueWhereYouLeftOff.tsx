import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getLastActivity } from '../services/dailyGoals';

interface LastActivity {
  moduleId: string;
  moduleName: string;
  formType: 'A' | 'B';
  timestamp: number;
}

export function ContinueWhereYouLeftOff() {
  const [activity, setActivity] = useState<LastActivity | null>(null);

  useEffect(() => {
    loadActivity();
  }, []);

  async function loadActivity() {
    const lastActivity = await getLastActivity();
    setActivity(lastActivity);
  }

  if (!activity) {
    return null;
  }

  // Format timestamp to relative time
  const getRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return 'Last week';
  };

  const phaseText = activity.formType === 'A' ? 'Phase 2: Practice' : 'Phase 3: Transfer';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-4"
    >
      <Link to={`/practice/${activity.moduleId}`}>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg dark:shadow-2xl border-l-4 border-green-500 dark:border-emerald-400 hover:shadow-xl transition-all active:scale-95">
          <div className="flex items-start gap-3">
            <div className="text-3xl">📚</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                  Continue Learning
                </h3>
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  {getRelativeTime(activity.timestamp)}
                </span>
              </div>
              <p className="text-base font-bold text-gray-900 dark:text-slate-100 mb-1">
                {activity.moduleName}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-2 py-1 rounded-full font-semibold">
                  {phaseText}
                </span>
                <span className="text-xs text-gray-600 dark:text-slate-300">→ Pick up where you left off</span>
              </div>
            </div>
            <div className="text-2xl text-gray-400 dark:text-slate-500">›</div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
