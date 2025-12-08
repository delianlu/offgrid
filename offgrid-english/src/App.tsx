import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Onboarding } from './components/Onboarding';
import { DailyGoals } from './components/DailyGoals';
import { motion, type Variants } from 'framer-motion';
import { calculateModuleProgress } from './services/progressTracking';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { BackgroundEffects } from './components/common/BackgroundEffects';
import { Interactive } from './components/common/Interactive';
import { useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/auth/LoginScreen';
import {
  BookOpen,
  PenTool,
  MapPin,
  Type,
  Users,
  FileText,
  Wrench,
  User,
  RotateCw,
  Scale,
  CircleHelp,
  Link as LinkIcon,
  Hash,
  Tag,
  AlertCircle,
  Mic,
  MessageSquare,
  Flame,
  Target,
  Trophy,
  ArrowRight,
  Clock,
  CheckCircle,
  Lock,
  School,
  Swords,
  TrendingUp,
  AlertTriangle,
  Zap,
  Star
} from 'lucide-react';

export const APP_VERSION = '2.0.1';

const MODULES = [
  { id: 'tense-form', name: 'Verb Tense & Form', items: 180, icon: BookOpen, image: '/assets/modules/tense-form.png', description: 'Master past, present, and future tenses.' },
  { id: 'subject-verb-agreement', name: 'Subject-Verb Agreement', items: 180, icon: PenTool, image: '/assets/modules/subject-verb-agreement.png', description: 'Match subjects with verbs correctly.' },
  { id: 'prepositions', name: 'Prepositions', items: 180, icon: MapPin, image: '/assets/modules/prepositions.png', description: 'Navigate time and place with precision.' },
  { id: 'word-order', name: 'Word Order', items: 180, icon: Type, image: '/assets/modules/word-order.png', description: 'Structure sentences like a native speaker.' },
  { id: 'plurality', name: 'Plurality', items: 180, icon: Users, image: '/assets/modules/plurality.png', description: 'Handle singular and plural forms easily.' },
  { id: 'articles', name: 'Articles', items: 180, icon: FileText, image: '/assets/modules/articles.png', description: 'Master a, an, and the usage.' },
  { id: 'auxiliaries', name: 'Auxiliaries', items: 180, icon: Wrench, image: '/assets/modules/auxiliaries.png', description: 'Use helping verbs to refine meaning.' },
  { id: 'pronouns-possessives', name: 'Pronouns & Possessives', items: 180, icon: User, image: '/assets/modules/pronouns-possessives.png', description: 'Refer to people and ownership clearly.' },
  { id: 'gerunds-infinitives', name: 'Gerunds & Infinitives', items: 180, icon: RotateCw, image: '/assets/modules/gerunds-infinitives.png', description: 'Know when to use -ing or to...' },
  { id: 'comparatives-superlatives', name: 'Comparatives & Superlatives', items: 180, icon: Scale, image: '/assets/modules/comparatives-superlatives.png', description: 'Make comparisons with confidence.' },
  { id: 'conditionals', name: 'Conditionals', items: 180, icon: CircleHelp, image: '/assets/modules/conditionals.png', description: 'Express possibilities and hypotheticals.' },
  { id: 'sentence-connectors', name: 'Sentence Connectors', items: 180, icon: LinkIcon, image: '/assets/modules/sentence-connectors.png', description: 'Link ideas for better flow.' },
  { id: 'countable-uncountable', name: 'Countable & Uncountable', items: 180, icon: Hash, image: '/assets/modules/countable-uncountable.png', description: 'Distinguish between count and mass nouns.' },
  { id: 'question-tags', name: 'Question Tags', items: 180, icon: Tag, image: '/assets/modules/question-tags.png', description: 'Turn statements into questions.' },
  { id: 'relative-clauses', name: 'Relative Clauses', items: 180, icon: LinkIcon, image: '/assets/modules/relative-clauses.png', description: 'Add detail to your sentences.' },
  { id: 'false-cognates', name: 'Tricky Words', items: 180, icon: AlertCircle, image: '/assets/modules/false-cognates.png', description: 'Avoid common "false friend" mistakes.' },
  { id: 'passive-voice', name: 'Passive Voice', items: 180, icon: MessageSquare, image: '/assets/modules/passive-voice.png', description: 'Shift focus from doer to action.' },
  { id: 'reported-speech', name: 'Reported Speech', items: 180, icon: Mic, image: '/assets/modules/reported-speech.png', description: 'Relay what others have said.' }
];

interface ModuleProgress {
  completion: number;
  badge?: string;
}

const MODULE_CATEGORIES = [
  {
    id: 'foundations',
    title: 'Foundations',
    description: 'Essential building blocks of English grammar.',
    color: 'palm', // Green
    image: '/assets/ui/cat-foundations.png',
    modules: ['tense-form', 'subject-verb-agreement', 'prepositions', 'word-order', 'plurality', 'articles']
  },
  {
    id: 'intermediate',
    title: 'Intermediate Structures',
    description: 'Expand your expression with more complex forms.',
    color: 'sunshine', // Yellow/Orange
    image: '/assets/ui/cat-intermediate.png',
    modules: ['auxiliaries', 'pronouns-possessives', 'gerunds-infinitives', 'comparatives-superlatives', 'conditionals']
  },
  {
    id: 'advanced',
    title: 'Advanced Grammar',
    description: 'Master the nuances for fluent communication.',
    color: 'clay', // Red/Terracotta
    image: '/assets/ui/cat-advanced.png',
    modules: ['sentence-connectors', 'countable-uncountable', 'question-tags', 'relative-clauses', 'passive-voice', 'reported-speech']
  },
  {
    id: 'specialized',
    title: 'Specialized Practice',
    description: 'Target specific challenges and tricky areas.',
    color: 'earth', // Brown/Neutral
    image: '/assets/ui/cat-specialized.png',
    modules: ['false-cognates']
  }
];



export default function App() {
  const { currentUser, isLoading } = useAuth();
  const { t, i18n } = useTranslation();
  // Demo data for presentation - shows active learning state
  const [streakDays, setStreakDays] = useState(7);
  const [totalXP, setTotalXP] = useState(240);
  const [moduleProgress, setModuleProgress] = useState<Record<string, ModuleProgress>>({});
  const [showLoginScreen, setShowLoginScreen] = useState(false);
  const [progressRefreshKey, setProgressRefreshKey] = useState(0);
  // State for collapsible sections
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    foundations: true,
    intermediate: true,
    advanced: true,
    specialized: true
  });

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1.0] as const
      }
    }
  };

  useEffect(() => {
    try {
      void import("./services/contentLoader")
        .then(m => m.ensureSeedContent(m.CONTENT_VERSION))
        .catch(err => console.error("Failed to load content:", err));
    } catch (err) {
      console.error("Failed to import content loader:", err);
    }

    // Load streak and XP
    (async () => {
      const { loadChallengeStats } = await import('./services/challenges');
      const stats = loadChallengeStats();
      setStreakDays(stats.currentDailyStreak);

      // Calculate total XP and progress
      let xp = 0;
      const progressData: Record<string, ModuleProgress> = {};

      for (const module of MODULES) {
        const progress = await calculateModuleProgress(module.id);
        if (progress) {
          progressData[module.id] = {
            completion: progress.overallCompletion,
            badge: progress.badge
          };
          xp += Math.round((progress.overallCompletion / 100) * module.items * 10);
        }
      }
      setTotalXP(xp);
      setModuleProgress(progressData);
    })();
  }, [progressRefreshKey]);

  // Refresh progress when the page becomes visible or gains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setProgressRefreshKey(prev => prev + 1);
      }
    };

    const handleFocus = () => {
      setProgressRefreshKey(prev => prev + 1);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Calculate overall completion percentage
  const overallCompletion = Math.round(
    Object.values(moduleProgress).reduce((sum, p) => sum + p.completion, 0) /
    Math.max(Object.keys(moduleProgress).length, 1)
  );

  // Find active module (first module with progress > 0 and < 100)
  const activeModule = MODULES.find(m => {
    const progress = moduleProgress[m.id];
    return progress && progress.completion > 0 && progress.completion < 100;
  });

  // Find the "Next Recommended" module (first locked module)
  const nextRecommendedModule = MODULES.find(m => {
    const progress = moduleProgress[m.id];
    // If no progress or 0 completion, it's a candidate.
    // But we want the *first* one that isn't completed.
    // Assuming MODULES order is the learning path.
    return !progress || progress.completion < 100;
  });


  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      console.log('Language changed to:', lng);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  // Handle ESC key to close login screen
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showLoginScreen) {
        setShowLoginScreen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showLoginScreen]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  return (
    <>
      <Onboarding />
      <PWAInstallPrompt />
      <OfflineIndicator />

      {/* Login Modal Overlay */}
      {showLoginScreen && (
        <div className="fixed inset-0 z-[100] bg-earth-900/40 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300">
          <div className="w-full max-w-md relative">
            <button
              onClick={() => setShowLoginScreen(false)}
              className="absolute -top-12 right-0 md:-right-12 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-all backdrop-blur-sm border border-white/20 shadow-lg group"
              title="Close"
            >
              <span className="text-xl group-hover:scale-110 block transition-transform">✕</span>
            </button>
            <LoginScreen />
          </div>
        </div>
      )}

      <div className="min-h-screen bg-earth-50 pb-32 relative">
        <BackgroundEffects />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative z-10"
        >
          {/* HEADER - Global Reusable Header */}
          <motion.div variants={itemVariants}>
            <Header
              showTeacherButton
              showLanguageToggle
              userAvatar={currentUser?.avatar}
              onProfileClick={() => setShowLoginScreen(true)}
            />
          </motion.div>

          {/* STATS BAR - Seamless Integration */}
          <motion.section variants={itemVariants} className="bg-white/50 backdrop-blur-sm pt-6 pb-0">
            <div className="container mx-auto px-6">
              <div className="grid grid-cols-3 gap-4">
                {/* Level Card - XP Progress */}
                <Interactive
                  className="bg-gradient-to-br from-palm-500 to-palm-600 rounded-2xl shadow-lg shadow-palm-500/20 hover:shadow-xl hover:shadow-palm-500/30 transition-all p-4 relative overflow-hidden group text-white"
                >
                  <div className="absolute right-0 top-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <img src="/assets/ui/level-xp.png" alt="Level" className="w-24 h-24 object-contain" />
                  </div>
                  <div className="flex flex-col items-center text-center gap-1 relative z-10">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-inner mb-1 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                      <img src="/assets/ui/level-xp.png" alt="Level" className="w-[140%] h-[140%] max-w-none object-cover drop-shadow-md translate-y-2" />
                    </div>

                    <div className="flex items-baseline justify-center gap-1">
                      <p className="text-3xl font-black text-white tracking-tight">5</p>
                      <span className="text-xs text-palm-100 font-bold">LVL</span>
                    </div>

                    <div className="w-full mt-1">
                      <div className="flex justify-between text-[10px] text-palm-100 mb-1 font-medium">
                        <span>Lvl 1</span>
                        <span>Lvl 2</span>
                      </div>
                      <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                        <div className="h-full bg-white/20 rounded-full w-3/4 shadow-sm relative overflow-hidden">
                          <div className="absolute inset-0 bg-white/40 w-full h-full animate-[shimmer_2s_infinite] skew-x-12"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Interactive>

                {/* Streak Card - Flame Animation */}
                <Interactive
                  className="bg-gradient-to-br from-clay-500 to-clay-600 rounded-2xl shadow-lg shadow-clay-500/20 hover:shadow-xl hover:shadow-clay-500/30 transition-all p-4 relative overflow-hidden group text-white"
                >
                  <div className="absolute right-0 top-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <img src="/assets/ui/streak.png" alt="Streak" className="w-24 h-24 object-contain" />
                  </div>
                  <div className="flex flex-col items-center text-center gap-1 relative z-10">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-inner mb-1 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                      <img src="/assets/ui/streak.png" alt="Streak" className={`w-[140%] h-[140%] max-w-none object-cover ${streakDays > 0 ? 'animate-pulse' : 'opacity-50'} translate-y-2`} />
                    </div>

                    <div className="flex items-baseline justify-center gap-1">
                      <p className="text-3xl font-black text-white tracking-tight">{streakDays}</p>
                      <span className="text-xs text-clay-100 font-bold">DAYS</span>
                    </div>

                    <p className="text-[10px] text-clay-50 font-medium mt-1 flex items-center gap-1">
                      {streakDays > 0 ? 'Keep it burning! 🔥' : <>Start your streak! <img src="/assets/ui/streak.png" alt="Streak" className="w-3 h-3 animate-pulse" /></>}
                    </p>
                  </div>
                </Interactive>

                {/* Progress Card - Circular Ring */}
                <Interactive
                  className="bg-gradient-to-br from-sunshine-500 to-sunshine-600 rounded-2xl shadow-lg shadow-sunshine-500/20 hover:shadow-xl hover:shadow-sunshine-500/30 transition-all p-4 relative overflow-hidden group text-earth-900"
                >
                  <div className="absolute right-0 top-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <img src="/assets/ui/total-progress.png" alt="Progress" className="w-24 h-24" />
                  </div>
                  <div className="flex flex-col items-center text-center gap-1 relative z-10">
                    <div className="relative w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {/* Circular Progress SVG */}
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-black/10"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="text-white drop-shadow-sm"
                          strokeDasharray={`${overallCompletion}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="text-sm font-black text-white drop-shadow-md">{overallCompletion}%</span>
                    </div>

                    <p className="text-xs text-sunshine-50 font-bold uppercase tracking-wide mt-1">Total Progress</p>
                    <p className="text-[10px] text-sunshine-100 font-medium">You're doing great!</p>
                  </div>
                </Interactive>
              </div>
            </div>
          </motion.section>

          {/* HERO SECTION - Continue Your Journey */}
          {activeModule && (
            <motion.section variants={itemVariants} className="container mx-auto px-6 py-4 pt-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-palm-600 to-palm-800 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden"
              >
                {/* Decorative Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24"></div>
                </div>

                <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                  {/* Left Side - Content */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-4xl animate-bounce-subtle">🚀</span>
                      <h2 className="text-3xl font-bold">{t('hero.continueJourney')}</h2>
                    </div>

                    <div className="mb-6">
                      <p className="text-lg text-palm-100 mb-2">
                        {t('hero.lastStudied')}: <span className="font-bold text-white">{t(`modules.${activeModule.id}`)}</span>
                      </p>
                      <div className="flex items-center gap-4 text-sm text-palm-200">
                        <span className="flex items-center gap-1">
                          <Clock size={16} />
                          2 {t('hero.hoursAgo')}
                        </span>
                        <span>•</span>
                        <span>12 {t('hero.lessonsComplete', { total: activeModule.items })}</span>
                      </div>
                    </div>

                    <Link to={`/learn/${activeModule.id}`}>
                      <Interactive className="inline-block">
                        <button className="bg-sunshine-500 text-earth-900 font-bold px-8 py-4 rounded-xl hover:bg-sunshine-400 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2 group">
                          {t('hero.continuePractice')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </Interactive>
                    </Link>
                  </div>

                  {/* Right Side - Progress Visualization */}
                  <div className="hidden md:flex justify-center">
                    <div className="relative">
                      {/* Circular Progress */}
                      <div className="w-40 h-40 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-8 border-white/30 relative">
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                          <circle
                            cx="50" cy="50" r="45"
                            fill="none"
                            stroke="white"
                            strokeWidth="8"
                            strokeDasharray={`${(moduleProgress[activeModule.id]?.completion || 0) * 2.83}, 283`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="text-center">
                          <p className="text-5xl font-bold mb-1">{moduleProgress[activeModule.id]?.completion || 0}%</p>
                          <p className="text-sm text-palm-100">Module</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.section>
          )}

          {/* QUICK ACCESS CARDS - 3 Features */}
          <motion.section variants={itemVariants} className={`container mx-auto px-6 pb-6 ${activeModule ? 'pt-0' : 'pt-4'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Daily Goal Card */}
              <DailyGoals />

              {/* Progress Prediction Card */}
              <Link to="/progress-report" className="block h-full">
                <Interactive className="bg-white rounded-xl shadow-sm p-6 border border-earth-100 h-full flex flex-col hover:border-palm-200 hover:shadow-md transition-all group relative overflow-hidden">
                  {/* Sparkline Background */}
                  <div className="absolute bottom-0 left-0 w-full h-16 opacity-10 pointer-events-none">
                    <svg viewBox="0 0 100 20" className="w-full h-full" preserveAspectRatio="none">
                      <path d="M0 20 L0 15 L10 12 L20 16 L30 10 L40 14 L50 8 L60 12 L70 5 L80 8 L90 2 L100 5 L100 20 Z" fill="currentColor" className="text-palm-500" />
                    </svg>
                  </div>

                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="w-16 h-16 bg-palm-100 text-palm-600 rounded-full flex items-center justify-center group-hover:bg-palm-200 transition-colors overflow-hidden">
                      <img src="/assets/ui/prediction.png" alt="Prediction" className="w-[140%] h-[140%] max-w-none object-cover translate-x-1 translate-y-1" />
                    </div>
                    <div>
                      <h3 className="font-bold text-earth-900 group-hover:text-palm-700 transition-colors">{t('quickAccess.prediction.title')}</h3>
                      <p className="text-sm text-earth-600">{t('quickAccess.prediction.subtitle')}</p>
                    </div>
                  </div>
                  <p className="text-sm text-earth-700 mb-4 flex-grow relative z-10">
                    {t('quickAccess.prediction.description')}
                  </p>
                  <div className="text-sm text-palm-600 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform relative z-10">
                    {t('quickAccess.prediction.viewDetails')} <ArrowRight size={16} />
                  </div>
                </Interactive>
              </Link>

              {/* Mistake Journal Card */}
              <Link to="/mistake-journal" className="block h-full">
                <Interactive className="bg-white rounded-xl shadow-sm p-6 border border-earth-100 h-full flex flex-col hover:border-clay-200 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 bg-clay-100 text-clay-600 rounded-full flex items-center justify-center group-hover:bg-clay-200 transition-colors overflow-hidden">
                      <img src="/assets/ui/mistakes.png" alt="Mistakes" className="w-[140%] h-[140%] max-w-none object-cover translate-x-1 translate-y-1" />
                    </div>
                    <div>
                      <h3 className="font-bold text-earth-900 group-hover:text-clay-700 transition-colors">{t('quickAccess.mistakes.title')}</h3>
                      <p className="text-sm text-earth-600">{t('quickAccess.mistakes.subtitle')}</p>
                    </div>
                  </div>
                  <p className="text-sm text-earth-700 mb-4 flex-grow">
                    {t('quickAccess.mistakes.description')}
                  </p>
                  <div className="text-sm text-clay-600 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {t('quickAccess.mistakes.reviewNow')} <ArrowRight size={16} />
                  </div>
                </Interactive>
              </Link>

              {/* Phonology Card - Full Width */}
              <Link to="/phonology" className="col-span-full md:col-span-3">
                <Interactive className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group hover:shadow-xl transition-all hover:-translate-y-1 border border-white/10">
                  <div className="absolute top-0 right-36 p-4 opacity-20 group-hover:opacity-30 transition-opacity transform group-hover:scale-110 duration-500">
                    <img src="/assets/ui/phonology.png" alt="Phonology" className="w-48 h-48 object-contain" />
                  </div>
                  {/* Sound Wave Graphic */}
                  <div className="absolute bottom-0 left-0 w-full h-32 opacity-20 pointer-events-none">
                    <div className="flex items-end justify-center gap-1 h-full pb-4">
                      {[...Array(20)].map((_, i) => (
                        <div key={i} className="w-2 bg-white rounded-t-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
                      ))}
                    </div>
                  </div>

                  <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-16 h-16 flex items-center justify-center overflow-hidden rounded-full">
                          <img src="/assets/ui/phonology.png" alt="Phonology" className="w-[150%] h-[150%] max-w-none object-cover" />
                        </div>
                        <div>
                          <h3 className="text-3xl font-black tracking-tight">Phonology Lab</h3>
                          <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded text-white uppercase tracking-wider">Premium Feature</span>
                        </div>
                      </div>
                      <p className="text-violet-100 mb-6 max-w-xl text-sm font-medium leading-relaxed">
                        Master your pronunciation with our advanced Audio Lab. Record, listen, and perfect your accent with real-time feedback.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 bg-white text-violet-700 px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-violet-50 transition-all transform hover:scale-105">
                      Enter Lab <ArrowRight size={20} />
                    </span>
                  </div>
                </Interactive>
              </Link>

              {/* Role Play Card */}
              <Link to="/scenario/market-bargaining" className="block h-full">
                <Interactive className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg p-6 h-full flex flex-col text-white relative overflow-hidden group hover:shadow-xl transition-all hover:-translate-y-1 border border-white/10">
                  <div className="absolute right-4 bottom-4 opacity-20 group-hover:opacity-30 transition-opacity transform group-hover:rotate-12 duration-500">
                    <img src="/assets/ui/role-play.png" alt="Role Play" className="w-36 h-36 object-contain" />
                  </div>
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="w-16 h-16 flex items-center justify-center overflow-hidden rounded-full">
                      <img src="/assets/ui/role-play.png" alt="Role Play" className="w-[150%] h-[150%] max-w-none object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-xl">Role Play</h3>
                      <p className="text-xs text-orange-100 uppercase tracking-wider font-bold">Real Scenarios</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/90 mb-6 flex-grow relative z-10 font-medium leading-relaxed drop-shadow-sm">
                    Practice conversations in realistic Cameroonian contexts. Negotiate, ask for directions, and more.
                  </p>
                  <div className="text-sm text-white font-bold flex items-center gap-2 relative z-10 bg-white/20 self-start px-4 py-2 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors border border-white/30">
                    Start Role Play <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Interactive>
              </Link>

              {/* Classroom Mode Card */}
              <Link to="/classroom" className="block h-full">
                <Interactive className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 h-full flex flex-col text-white relative overflow-hidden group hover:shadow-xl transition-all hover:-translate-y-1 border border-white/10">
                  <div className="absolute right-4 bottom-4 opacity-20 group-hover:opacity-30 transition-opacity transform group-hover:rotate-12 duration-500">
                    <img src="/assets/ui/classroom.png" alt="Classroom" className="w-36 h-36 object-contain" />
                  </div>
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="w-16 h-16 flex items-center justify-center overflow-hidden rounded-full">
                      <img src="/assets/ui/classroom.png" alt="Classroom" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-xl">Classroom</h3>
                      <p className="text-xs text-emerald-100 uppercase tracking-wider font-bold">Group Learning</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/90 mb-6 flex-grow relative z-10 font-medium leading-relaxed drop-shadow-sm">
                    Join a teacher-led session or practice with friends in a collaborative environment.
                  </p>
                  <div className="text-sm text-white font-bold flex items-center gap-2 relative z-10 bg-white/20 self-start px-4 py-2 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors border border-white/30">
                    Enter Classroom <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Interactive>
              </Link>

              {/* Offline Duel Card */}
              <Link to="/duel" className="block h-full">
                <Interactive className="bg-gradient-to-br from-rose-600 to-pink-600 rounded-2xl shadow-lg p-6 h-full flex flex-col text-white relative overflow-hidden group hover:shadow-xl transition-all hover:-translate-y-1 border border-white/10">
                  <div className="absolute right-4 bottom-4 opacity-20 group-hover:opacity-30 transition-opacity transform group-hover:rotate-12 duration-500">
                    <img src="/assets/ui/offline-duel.png" alt="Duel" className="w-36 h-36 object-contain" />
                  </div>
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="w-16 h-16 flex items-center justify-center overflow-hidden rounded-full">
                      <img src="/assets/ui/offline-duel.png" alt="Duel" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-xl">Offline Duel</h3>
                      <p className="text-xs text-rose-100 uppercase tracking-wider font-bold">Multiplayer</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/90 mb-6 flex-grow relative z-10 font-medium leading-relaxed drop-shadow-sm">
                    Challenge a friend nearby. Scan QR code & Play instantly without internet!
                  </p>
                  <div className="text-sm text-white font-bold flex items-center gap-2 relative z-10 bg-white/20 self-start px-4 py-2 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors border border-white/30">
                    Start Battle <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Interactive>
              </Link>
            </div>
          </motion.section>

          {/* MODULES SECTION - Categorized Layout */}
          <motion.section variants={itemVariants} className="container mx-auto px-6 py-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-black text-earth-900 mb-2 tracking-tight">
                  {t('modules.title')}
                </h2>
                <p className="text-lg text-earth-600">
                  {t('modules.subtitle')}
                </p>
              </div>
              {/* Visual Controls (Mock) */}
              <div className="hidden md:flex bg-white rounded-lg p-1 border border-earth-200 shadow-sm self-start md:self-end">
                <button className="px-4 py-2 text-sm font-bold bg-earth-100 text-earth-800 rounded-md shadow-sm">All</button>
                <button className="px-4 py-2 text-sm font-bold text-earth-500 hover:bg-earth-50 rounded-md transition-colors">In Progress</button>
                <button className="px-4 py-2 text-sm font-bold text-earth-500 hover:bg-earth-50 rounded-md transition-colors">Completed</button>
              </div>
            </div>

            {MODULE_CATEGORIES.map(category => {
              const isExpanded = expandedCategories[category.id];
              // Filter modules for this category
              const categoryModules = MODULES.filter(m => category.modules.includes(m.id));

              if (categoryModules.length === 0) return null;

              // Calculate quick stats
              const completedCount = categoryModules.filter(m => (moduleProgress[m.id]?.completion || 0) === 100).length;

              return (
                <div key={category.id} className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/50 overflow-hidden transition-all duration-500 ${category.id === 'foundations' ? 'bg-blue-50/30' : category.id === 'intermediate' ? 'bg-orange-50/30' : category.id === 'advanced' ? 'bg-purple-50/30' : 'bg-pink-50/30'}`}>
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className={`w-full flex items-center justify-between p-6 transition-all hover:bg-white/50
                    ${isExpanded ? 'border-b border-earth-100' : ''}
                  `}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-28 h-28 flex items-center justify-center">
                        {/* Category Icon - Uniform size for all */}
                        <img
                          src={category.image}
                          alt={category.title}
                          className="w-[120%] h-[120%] max-w-none object-contain translate-y-2"
                        />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-black text-earth-900 tracking-tight">{category.title}</h3>
                          <span className="text-xs font-bold bg-earth-100 text-earth-600 px-2 py-1 rounded-full">{completedCount}/{categoryModules.length} Complete</span>
                        </div>
                        <p className="text-sm text-earth-600 font-medium">{category.description}</p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-full bg-white shadow-sm text-earth-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                      <ArrowRight className="rotate-90" size={24} />
                    </div>
                  </button>

                  {/* Modules Grid */}
                  {isExpanded && (
                    <motion.div
                      initial="hidden"
                      animate="show"
                      variants={{
                        hidden: { opacity: 0 },
                        show: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.1
                          }
                        }
                      }}
                      className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-earth-50/30"
                    >
                      {categoryModules.map((module) => {
                        const progress = moduleProgress[module.id];
                        const completion = progress?.completion || 0;
                        const badge = progress?.badge || 'learning';
                        const isLocked = badge === 'locked';
                        const isCompleted = completion === 100;
                        const isActive = completion > 0 && completion < 100;

                        // Check if this is the "Recommended" module
                        const isRecommended = nextRecommendedModule?.id === module.id;

                        const color = category.color; // Use category color

                        // Helper function to get color-specific classes
                        const getColorClasses = () => {
                          if (color === 'palm') {
                            return {
                              cardBorder: 'border-palm-500',
                              cardRing: 'ring-palm-100',
                              cardBg: 'bg-palm-50/30',
                              cardBorderCompleted: 'border-palm-200',
                              cardBorderRecommended: 'border-palm-400',
                              cardRingRecommended: 'ring-palm-50',
                              cardBorderHover: 'hover:border-palm-300',
                              badgeBg: 'bg-palm-500',
                              badgeBgCompleted: 'bg-palm-100',
                              badgeText: 'text-palm-700',
                              badgeBorder: 'border-palm-200',
                              iconBg: 'bg-gradient-to-br from-palm-100 to-palm-200',
                              iconText: 'text-palm-700',
                              iconBgCompleted: 'bg-gradient-to-br from-palm-50 to-palm-100',
                              iconTextCompleted: 'text-palm-600',
                              iconBgNeutral: 'bg-gradient-to-br from-palm-50 to-palm-100',
                              iconTextNeutral: 'text-palm-500',
                              progressText: 'text-palm-600',
                              progressBg: 'bg-palm-50',
                              progressBar: 'bg-palm-500',
                              completedBg: 'bg-palm-50',
                              completedText: 'text-palm-700',
                              completedBorder: 'border-palm-100',
                              completedIcon: 'text-palm-500',
                              emptyBar: 'bg-palm-50',
                              buttonBg: 'bg-palm-600',
                              buttonHover: 'hover:bg-palm-700',
                              buttonBorder: 'border-palm-100',
                              buttonText: 'text-palm-700',
                              buttonBgHover: 'hover:bg-palm-50',
                              buttonBorderHover: 'hover:border-palm-200',
                              neutralBorderHover: 'hover:border-palm-500',
                              neutralTextHover: 'hover:text-palm-600'
                            };
                          } else if (color === 'sunshine') {
                            return {
                              cardBorder: 'border-sunshine-500',
                              cardRing: 'ring-sunshine-100',
                              cardBg: 'bg-sunshine-50/30',
                              cardBorderCompleted: 'border-sunshine-200',
                              cardBorderRecommended: 'border-sunshine-400',
                              cardRingRecommended: 'ring-sunshine-50',
                              cardBorderHover: 'hover:border-sunshine-300',
                              badgeBg: 'bg-sunshine-500',
                              badgeBgCompleted: 'bg-sunshine-100',
                              badgeText: 'text-sunshine-700',
                              badgeBorder: 'border-sunshine-200',
                              iconBg: 'bg-gradient-to-br from-sunshine-100 to-sunshine-200',
                              iconText: 'text-sunshine-700',
                              iconBgCompleted: 'bg-gradient-to-br from-sunshine-50 to-sunshine-100',
                              iconTextCompleted: 'text-sunshine-600',
                              iconBgNeutral: 'bg-gradient-to-br from-sunshine-50 to-sunshine-100',
                              iconTextNeutral: 'text-sunshine-500',
                              progressText: 'text-sunshine-600',
                              progressBg: 'bg-sunshine-50',
                              progressBar: 'bg-sunshine-500',
                              completedBg: 'bg-sunshine-50',
                              completedText: 'text-sunshine-700',
                              completedBorder: 'border-sunshine-100',
                              completedIcon: 'text-sunshine-500',
                              emptyBar: 'bg-sunshine-50',
                              buttonBg: 'bg-sunshine-600',
                              buttonHover: 'hover:bg-sunshine-700',
                              buttonBorder: 'border-sunshine-100',
                              buttonText: 'text-sunshine-700',
                              buttonBgHover: 'hover:bg-sunshine-50',
                              buttonBorderHover: 'hover:border-sunshine-200',
                              neutralBorderHover: 'hover:border-sunshine-500',
                              neutralTextHover: 'hover:text-sunshine-600'
                            };
                          } else { // clay
                            return {
                              cardBorder: 'border-clay-500',
                              cardRing: 'ring-clay-100',
                              cardBg: 'bg-clay-50/30',
                              cardBorderCompleted: 'border-clay-200',
                              cardBorderRecommended: 'border-clay-400',
                              cardRingRecommended: 'ring-clay-50',
                              cardBorderHover: 'hover:border-clay-300',
                              badgeBg: 'bg-clay-500',
                              badgeBgCompleted: 'bg-clay-100',
                              badgeText: 'text-clay-700',
                              badgeBorder: 'border-clay-200',
                              iconBg: 'bg-gradient-to-br from-clay-100 to-clay-200',
                              iconText: 'text-clay-700',
                              iconBgCompleted: 'bg-gradient-to-br from-clay-50 to-clay-100',
                              iconTextCompleted: 'text-clay-600',
                              iconBgNeutral: 'bg-gradient-to-br from-clay-50 to-clay-100',
                              iconTextNeutral: 'text-clay-500',
                              progressText: 'text-clay-600',
                              progressBg: 'bg-clay-50',
                              progressBar: 'bg-clay-500',
                              completedBg: 'bg-clay-50',
                              completedText: 'text-clay-700',
                              completedBorder: 'border-clay-100',
                              completedIcon: 'text-clay-500',
                              emptyBar: 'bg-clay-50',
                              buttonBg: 'bg-clay-600',
                              buttonHover: 'hover:bg-clay-700',
                              buttonBorder: 'border-clay-100',
                              buttonText: 'text-clay-700',
                              buttonBgHover: 'hover:bg-clay-50',
                              buttonBorderHover: 'hover:border-clay-200',
                              neutralBorderHover: 'hover:border-clay-500',
                              neutralTextHover: 'hover:text-clay-600'
                            };
                          }
                        };

                        const colorClasses = getColorClasses();

                        const ModuleCard = (
                          <Interactive
                            className={`
                            rounded-2xl shadow-sm p-6 transition-all relative overflow-hidden h-full flex flex-col border group
                            ${isActive ? `bg-white ${colorClasses.cardBorder} shadow-lg ring-2 ${colorClasses.cardRing}` : ''}
                            ${isCompleted ? `${colorClasses.cardBg} ${colorClasses.cardBorderCompleted}` : ''}
                            ${isRecommended ? `bg-white ${colorClasses.cardBorderRecommended} shadow-xl ring-4 ${colorClasses.cardRingRecommended} transform hover:-translate-y-1` : ''}
                            ${isLocked && !isRecommended ? 'bg-earth-50 border-earth-100 opacity-60 grayscale-[0.5]' : ''}
                            ${!isLocked && !isActive && !isCompleted && !isRecommended ? `bg-white border-earth-200 ${colorClasses.cardBorderHover} hover:shadow-md hover:-translate-y-1` : ''}
                          `}
                          >
                            {/* Badge - Top Right */}
                            <div className="absolute top-0 right-0 z-10">
                              {isRecommended && (
                                <div className="bg-sunshine-500 text-earth-900 text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-sm flex items-center gap-1 animate-pulse-soft">
                                  <Target size={12} /> RECOMMENDED
                                </div>
                              )}
                              {isActive && !isRecommended && (
                                <div className={`${colorClasses.badgeBg} text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm`}>
                                  ACTIVE
                                </div>
                              )}
                              {isCompleted && (
                                <div className={`${colorClasses.badgeBgCompleted} ${colorClasses.badgeText} text-[10px] font-bold px-3 py-1 rounded-bl-xl border-b border-l ${colorClasses.badgeBorder}`}>
                                  DONE
                                </div>
                              )}
                            </div>

                            {/* Header: Icon + Title */}
                            <div className="flex items-start gap-4 mb-4">
                              <div className={`w-24 h-24 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 duration-300 p-3 ${isActive || isRecommended ? `${colorClasses.iconBg} ${colorClasses.iconText}` :
                                isCompleted ? `${colorClasses.iconBgCompleted} ${colorClasses.iconTextCompleted}` :
                                  `${colorClasses.iconBgNeutral} ${colorClasses.iconTextNeutral}`
                                }`}>
                                <img src={module.image} alt={module.name} className="w-full h-full object-contain" />
                              </div>
                              <div>
                                <h3 className={`text-lg font-bold leading-tight mb-1 ${isLocked ? 'text-earth-500' : 'text-earth-900'}`}>
                                  {t(`modules.${module.id}`)}
                                </h3>
                                <p className={`text-xs font-medium text-earth-500`}>
                                  {module.description}
                                </p>
                              </div>
                            </div>

                            {/* Spacer */}
                            <div className="flex-grow"></div>

                            {/* Progress Section */}
                            <div className="mt-4">
                              {isActive && (
                                <div className="space-y-2">
                                  <div className="flex justify-between items-end">
                                    <span className={`text-2xl font-black ${colorClasses.progressText}`}>{Math.round((completion / 100) * module.items)}<span className="text-sm text-earth-400 font-medium">/{module.items}</span></span>
                                    <span className={`text-xs font-bold ${colorClasses.progressText} ${colorClasses.progressBg} px-2 py-1 rounded-lg`}>{completion}%</span>
                                  </div>
                                  <div className="bg-earth-100 rounded-full h-3 overflow-hidden">
                                    <div
                                      className={`${colorClasses.progressBar} h-full rounded-full transition-all duration-500 relative`}
                                      style={{ width: `${completion}%` }}
                                    >
                                      <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite] skew-x-12"></div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {isCompleted && (
                                <div className={`flex items-center gap-2 ${colorClasses.completedText} ${colorClasses.completedBg} p-3 rounded-xl border ${colorClasses.completedBorder}`}>
                                  <CheckCircle size={20} className={colorClasses.completedIcon} />
                                  <span className="font-bold text-sm">Module Completed!</span>
                                </div>
                              )}

                              {!isActive && !isCompleted && !isLocked && (
                                <div className="flex items-center gap-2 text-earth-400 text-sm">
                                  <div className={`w-full h-2 ${colorClasses.emptyBar} rounded-full`}></div>
                                  <span className="font-medium text-earth-400">0%</span>
                                </div>
                              )}
                            </div>

                            {/* Action Button */}
                            <div className="mt-4">
                              {isActive && (
                                <button className={`w-full ${colorClasses.buttonBg} ${colorClasses.buttonHover} text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2`}>
                                  {t('modules.continuePractice')} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                              )}
                              {isRecommended && !isActive && (
                                <button className={`w-full ${colorClasses.buttonBg} ${colorClasses.buttonHover} text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2`}>
                                  Start Learning <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                              )}
                              {isCompleted && (
                                <button className={`w-full bg-white border-2 ${colorClasses.buttonBorder} ${colorClasses.buttonText} font-bold py-3 rounded-xl transition-colors ${colorClasses.buttonBgHover} ${colorClasses.buttonBorderHover}`}>
                                  {t('modules.reviewModule')}
                                </button>
                              )}
                              {!isActive && !isCompleted && !isLocked && !isRecommended && (
                                <button className={`w-full bg-white border border-earth-200 text-earth-600 ${colorClasses.neutralBorderHover} ${colorClasses.neutralTextHover} font-bold py-3 rounded-xl transition-all shadow-sm`}>
                                  {t('modules.startLearning')}
                                </button>
                              )}
                              {isLocked && !isRecommended && (
                                <button className="w-full bg-earth-100 text-earth-400 font-semibold py-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                                  <Lock size={16} /> {t('modules.locked')}
                                </button>
                              )}
                            </div>
                          </Interactive>
                        );

                        // Wrap in motion.div for animation
                        const AnimatedWrapper = (
                          <motion.div variants={{
                            hidden: { opacity: 0, y: 20 },
                            show: { opacity: 1, y: 0 }
                          }}>
                            {ModuleCard}
                          </motion.div>
                        );

                        if (isLocked && !isRecommended) {
                          return <div key={module.id}>{AnimatedWrapper}</div>;
                        }

                        return (
                          <Link key={module.id} to={`/learn/${module.id}`}>
                            {AnimatedWrapper}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </motion.section>
        </motion.div>

        {/* FOOTER - Subtle */}
        <footer className="bg-white border-t border-earth-200 py-6 mt-12">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center text-sm text-earth-600">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-palm-500 rounded-full"></span>
                  {t('app.offline')}
                </span>
                <span>{t('app.version')} {APP_VERSION}</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </>
  );
}


