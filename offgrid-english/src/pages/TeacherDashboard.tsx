import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../db/database';
import { calculateAllModulesProgress } from '../services/progressTracking';
import type { ModuleProgress } from '../services/progressTracking';
import type { Flag, Classroom, UserProfile } from '../types/schemas';
import { Header } from '../components/common/Header';
import { useAuth } from '../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface AnalyticsSummary {
  totalAttempts: number;
  totalCorrect: number;
  overallAccuracy: number;
  totalModulesStarted: number;
  totalModulesCompleted: number;
  averageSessionTime: number;
  totalXP: number;
  streak: number;
}

interface ModuleAnalytics {
  moduleId: string;
  moduleName: string;
  attempts: number;
  correct: number;
  accuracy: number;
  uniqueStudents: number; // Always 1 for single-user app
  averageTime: number;
  lastActivity: number;
}

export function TeacherDashboard() {
  const { currentUser } = useAuth();
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [moduleAnalytics, setModuleAnalytics] = useState<ModuleAnalytics[]>([]);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'classes' | 'modules' | 'performance' | 'issues'>('overview');

  // Create Class Modal State
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  async function loadDashboardData() {
    setLoading(true);

    // Load classes and students
    if (currentUser?.role === 'teacher') {
      const teacherClasses = await db.classrooms.where('teacherId').equals(currentUser.id).toArray();
      setClasses(teacherClasses);

      const allStudents = await db.users.where('role').equals('student').toArray();
      setStudents(allStudents);
    }

    // Get all module progress
    const progress = await calculateAllModulesProgress();
    setModuleProgress(progress);

    // Calculate overall analytics
    const allAttempts = await db.attempts.toArray();
    const correctAttempts = allAttempts.filter(a => a.isCorrect).length;
    const modulesStarted = progress.filter(p => p.totalAttempts > 0).length;
    const modulesCompleted = progress.filter(p => p.badge === 'complete').length;

    // Calculate average session time
    const sessions = new Map<string, number[]>();
    allAttempts.forEach(attempt => {
      if (!sessions.has(attempt.sessionId)) {
        sessions.set(attempt.sessionId, []);
      }
      sessions.get(attempt.sessionId)!.push(attempt.timestamp);
    });

    let totalSessionTime = 0;
    let sessionCount = 0;
    sessions.forEach(timestamps => {
      if (timestamps.length > 1) {
        const sessionTime = Math.max(...timestamps) - Math.min(...timestamps);
        totalSessionTime += sessionTime;
        sessionCount++;
      }
    });

    const avgSessionTime = sessionCount > 0 ? totalSessionTime / sessionCount : 0;

    // Calculate total XP
    const totalXP = correctAttempts * 10;

    // Calculate streak (consecutive days with activity)
    const dates = allAttempts.map(a => {
      const date = new Date(a.timestamp);
      return date.toISOString().split('T')[0];
    });
    const uniqueDates = Array.from(new Set(dates)).sort().reverse();

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date(today);

    for (const dateStr of uniqueDates) {
      const checkDate = currentDate.toISOString().split('T')[0];
      if (dateStr === checkDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    setAnalytics({
      totalAttempts: allAttempts.length,
      totalCorrect: correctAttempts,
      overallAccuracy: allAttempts.length > 0 ? (correctAttempts / allAttempts.length) * 100 : 0,
      totalModulesStarted: modulesStarted,
      totalModulesCompleted: modulesCompleted,
      averageSessionTime: avgSessionTime,
      totalXP,
      streak
    });

    // Calculate per-module analytics
    const modules = await db.modules.toArray();
    const moduleAnalyticsData: ModuleAnalytics[] = [];

    for (const module of modules) {
      const moduleAttempts = allAttempts.filter(a => a.moduleId === module.id);
      const moduleCorrect = moduleAttempts.filter(a => a.isCorrect).length;

      // Calculate average time between attempts
      let totalTime = 0;
      let timeCount = 0;
      for (let i = 1; i < moduleAttempts.length; i++) {
        const timeDiff = moduleAttempts[i].timestamp - moduleAttempts[i - 1].timestamp;
        if (timeDiff < 300000) { // Less than 5 minutes
          totalTime += timeDiff;
          timeCount++;
        }
      }
      const avgTime = timeCount > 0 ? totalTime / timeCount : 0;

      const lastActivity = moduleAttempts.length > 0
        ? Math.max(...moduleAttempts.map(a => a.timestamp))
        : 0;

      moduleAnalyticsData.push({
        moduleId: module.id,
        moduleName: module.name || 'Unknown Module',
        attempts: moduleAttempts.length,
        correct: moduleCorrect,
        accuracy: moduleAttempts.length > 0 ? (moduleCorrect / moduleAttempts.length) * 100 : 0,
        uniqueStudents: moduleAttempts.length > 0 ? 1 : 0,
        averageTime: avgTime,
        lastActivity
      });
    }

    // Load flags
    const allFlags = await db.flags.orderBy('timestamp').reverse().toArray();
    setFlags(allFlags);

    setModuleAnalytics(moduleAnalyticsData);
    setLoading(false);
  }

  const generateClassCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking chars
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateClass = async () => {
    if (!currentUser || !newClassName.trim()) return;

    const newClass: Classroom = {
      id: uuidv4(),
      name: newClassName.trim(),
      teacherId: currentUser.id,
      code: generateClassCode(),
      description: newClassDescription.trim(),
      createdAt: Date.now()
    };

    await db.classrooms.add(newClass);
    setClasses([...classes, newClass]);
    setShowCreateClassModal(false);
    setNewClassName('');
    setNewClassDescription('');
  };

  function formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  function formatLastActivity(timestamp: number): string {
    if (timestamp === 0) return 'Never';

    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  }

  async function exportData() {
    const data = {
      summary: analytics,
      moduleProgress,
      moduleAnalytics,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teacher-dashboard-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce-gentle">📊</div>
          <p className="text-lg text-gray-700 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <Header showLogo showLanguageToggle />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900">
              <span>👩‍🏫</span>
              <span>Teacher Dashboard</span>
            </h1>
            <p className="mt-2 text-gray-600">Monitor student progress and performance</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportData}
              className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm text-gray-700"
            >
              <span>📥</span>
              Export Data
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {(['overview', 'classes', 'modules', 'performance', 'issues'] as const).map(view => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${selectedView === view
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
        {/* Overview Tab */}
        {selectedView === 'overview' && analytics && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon="📝"
                label="Total Attempts"
                value={analytics.totalAttempts}
                color="from-blue-500 to-cyan-500"
              />
              <StatCard
                icon="✅"
                label="Overall Accuracy"
                value={`${Math.round(analytics.overallAccuracy)}%`}
                color="from-green-500 to-emerald-500"
              />
              <StatCard
                icon="🏆"
                label="Total XP"
                value={analytics.totalXP}
                color="from-yellow-500 to-orange-500"
              />
              <StatCard
                icon="🔥"
                label="Day Streak"
                value={analytics.streak}
                color="from-red-500 to-pink-500"
              />
            </div>

            {/* Module Progress Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Module Progress Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-indigo-600">{analytics.totalModulesStarted}</div>
                  <div className="text-sm text-gray-600 mt-1">Modules Started</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">{analytics.totalModulesCompleted}</div>
                  <div className="text-sm text-gray-600 mt-1">Modules Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600">
                    {formatTime(analytics.averageSessionTime)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Avg Session Time</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modules Tab */}
        {selectedView === 'modules' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Module Analytics</h2>
            {moduleAnalytics.map(module => (
              <motion.div
                key={module.moduleId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">{module.moduleName}</h3>
                  <span className="text-sm text-gray-500">{formatLastActivity(module.lastActivity)}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Attempts</div>
                    <div className="text-2xl font-bold text-indigo-600">{module.attempts}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Correct</div>
                    <div className="text-2xl font-bold text-green-600">{module.correct}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Accuracy</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(module.accuracy)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Avg Time</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {formatTime(module.averageTime)}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(module.accuracy)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, module.accuracy)}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Performance Tab */}
        {selectedView === 'performance' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Performance Details</h2>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Module Completion Status</h3>
              <div className="space-y-3">
                {moduleProgress.map(progress => (
                  <div key={progress.moduleId} className="border-l-4 border-indigo-500 pl-4 py-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{progress.moduleName}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${progress.badge === 'complete' ? 'bg-green-100 text-green-800' :
                        progress.badge === 'mastered' ? 'bg-yellow-100 text-yellow-800' :
                          progress.badge === 'practicing' ? 'bg-blue-100 text-blue-800' :
                            progress.badge === 'learning' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                        }`}>
                        {progress.badge.charAt(0).toUpperCase() + progress.badge.slice(1)}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                      <div>Form A: {progress.formAProgress}%</div>
                      <div>Form B: {progress.formBProgress}%</div>
                      <div>Accuracy A: {progress.formAAccuracy}%</div>
                      <div>Accuracy B: {progress.formBAccuracy}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Issues Tab */}
        {selectedView === 'issues' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Reported Issues</h2>

            {flags.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-lg font-medium text-gray-900">No issues reported</h3>
                <p className="text-gray-500">Everything is running smoothly!</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module / Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {flags.map((flag) => (
                        <tr key={flag.id} className={flag.status === 'resolved' ? 'bg-gray-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${flag.status === 'open' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}>
                              {flag.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(flag.timestamp).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{flag.moduleId}</div>
                            <div className="text-sm text-gray-500 font-mono text-xs">{flag.itemId.substring(0, 8)}...</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 capitalize">{flag.reason}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate" title={flag.comment}>
                              {flag.comment || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {flag.status === 'open' && (
                              <button
                                onClick={async () => {
                                  await db.flags.update(flag.id, { status: 'resolved' });
                                  setFlags(flags.map(f => f.id === flag.id ? { ...f, status: 'resolved' } : f));
                                }}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Resolve
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Classes Tab */}
        {selectedView === 'classes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">My Classes</h2>
              <button
                onClick={() => setShowCreateClassModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <span>➕</span>
                Create Class
              </button>
            </div>

            {classes.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="text-4xl mb-3">🏫</div>
                <h3 className="text-lg font-medium text-gray-900">No classes yet</h3>
                <p className="text-gray-500 mb-4">Create a class to group students and track their progress.</p>
                <button
                  onClick={() => setShowCreateClassModal(true)}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium"
                >
                  Create your first class
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map(classroom => (
                  <div key={classroom.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{classroom.name}</h3>
                        <p className="text-sm text-gray-500">{classroom.description || 'No description'}</p>
                      </div>
                      <div className="bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                        <span className="text-xs text-indigo-500 uppercase font-bold tracking-wider">Code</span>
                        <div className="text-lg font-mono font-bold text-indigo-700">{classroom.code}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <span>👥</span>
                        <span>{students.filter(s => s.classIds?.includes(classroom.id)).length} Students</span>
                      </div>
                      <span className="text-xs text-gray-400">Created {new Date(classroom.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Class Modal */}
        {showCreateClassModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Class</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="e.g., Advanced English A"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea
                    value={newClassDescription}
                    onChange={(e) => setNewClassDescription(e.target.value)}
                    placeholder="Brief description of this class..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none h-24 resize-none"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    A unique 6-character code will be generated automatically. Share this code with your students to let them join.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateClassModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateClass}
                  disabled={!newClassName.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Class
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-md p-6"
    >
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${color} text-white text-2xl mb-3`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
    </motion.div>
  );
}
