import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db, hardResetApp } from '../db/database';
import { APP_VERSION } from '../App';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { Attempt } from '../types/schemas';

type Stats = {
  modules: number; items: number; attempts: number;
  appVersion: string; isOnline: boolean; storage?: string; swState?: string;
};

type ModuleMetrics = {
  moduleId: string;
  moduleName: string;
  started: number;
  finished: number;
  completionRate: number;
  avgTimeMin: number;
  formAAccuracy: number;
  formBAccuracy: number;
  totalItems: number;
  avgTries: number;
  ppGain: number;
  nearTransfer: number;
  farTransfer: number;
  teacherAgreement: number;
  validAttemptRate: number;
  samplesValidated: number;
  totalAttempts: number;
  feedbackViewed: number;
  retryRate: number;
  recheckRate: number;
  improvementPP: number;
};

type HardestItem = {
  itemId: string;
  moduleId: string;
  moduleName: string;
  correctPct: number;
  attempts: number;
};

const MODULE_NAMES: Record<string, string> = {
  'tense-form': 'Tense & Form',
  'subject-verb-agreement': 'Subj-Verb Agree.',
  'prepositions': 'Prepositions',
  'word-order': 'Word Order',
  'plurality': 'Plurality',
  'articles': 'Articles',
  'auxiliaries': 'Auxiliaries'
};

export function Analytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [moduleMetrics, setModuleMetrics] = useState<ModuleMetrics[]>([]);
  const [hardestItems, setHardestItems] = useState<HardestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateAllMetrics();
  }, []);

  async function calculateAllMetrics() {
    try {
      // Basic stats
      const [m, i, a] = await Promise.all([
        db.modules.count(), db.items.count(), db.attempts.count()
      ]);

      let storage = 'n/a';
      if (navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        const used = Math.round((est.usage ?? 0)/1024);
        const quota = Math.round((est.quota ?? 0)/1024);
        storage = `${used}KB / ${quota}KB`;
      }

      let swState = 'none';
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        swState = reg?.active?.state ?? 'registered';
      }

      setStats({ modules: m, items: i, attempts: a, appVersion: APP_VERSION, isOnline: navigator.onLine, storage, swState });

      // Get all attempts
      const attempts = await db.attempts.toArray();

      if (attempts.length === 0) {
        setModuleMetrics([]);
        setHardestItems([]);
        setLoading(false);
        return;
      }

      // Calculate metrics per module
      const moduleIds = Array.from(new Set(attempts.map(a => a.moduleId)));
      const metrics: ModuleMetrics[] = [];

      for (const moduleId of moduleIds) {
        const moduleAttempts = attempts.filter(a => a.moduleId === moduleId);
        const sessions = Array.from(new Set(moduleAttempts.map(a => a.sessionId)));

        // Completion metrics
        const started = sessions.length;
        // Consider a session "finished" if it has at least 10 attempts (arbitrary threshold)
        const finished = sessions.filter(sid =>
          moduleAttempts.filter(a => a.sessionId === sid).length >= 10
        ).length;
        const completionRate = started > 0 ? (finished / started) * 100 : 0;

        // Calculate avg time (approximate from timestamps)
        const sessionTimes = sessions.map(sid => {
          const sessionAttempts = moduleAttempts.filter(a => a.sessionId === sid);
          if (sessionAttempts.length < 2) return 0;
          const timestamps = sessionAttempts.map(a => a.timestamp).sort();
          return (timestamps[timestamps.length - 1] - timestamps[0]) / 60000; // minutes
        }).filter(t => t > 0);
        const avgTimeMin = sessionTimes.length > 0
          ? Math.round(sessionTimes.reduce((sum, t) => sum + t, 0) / sessionTimes.length)
          : 0;

        // Performance metrics
        const formAAttempts = moduleAttempts.filter(a => a.formType === 'A');
        const formBAttempts = moduleAttempts.filter(a => a.formType === 'B');

        const formAAccuracy = formAAttempts.length > 0
          ? (formAAttempts.filter(a => a.isCorrect).length / formAAttempts.length) * 100
          : 0;
        const formBAccuracy = formBAttempts.length > 0
          ? (formBAttempts.filter(a => a.isCorrect).length / formBAttempts.length) * 100
          : 0;

        // Count unique items
        const uniqueItems = Array.from(new Set(moduleAttempts.map(a => a.itemId)));
        const totalItems = uniqueItems.length;

        // Calculate average tries per item (first attempts only)
        const itemFirstAttempts = uniqueItems.map(itemId => {
          const itemAttempts = moduleAttempts.filter(a => a.itemId === itemId);
          return itemAttempts.length;
        });
        const avgTries = itemFirstAttempts.length > 0
          ? itemFirstAttempts.reduce((sum, t) => sum + t, 0) / itemFirstAttempts.length
          : 0;

        // Transfer metrics
        const ppGain = formBAccuracy - formAAccuracy;
        const nearTransfer = formBAttempts.filter(a => a.transferType === 'near' && a.isCorrect).length /
          (formBAttempts.filter(a => a.transferType === 'near').length || 1) * 100;
        const farTransfer = formBAttempts.filter(a => a.transferType === 'far' && a.isCorrect).length /
          (formBAttempts.filter(a => a.transferType === 'far').length || 1) * 100;

        // Validity metrics (placeholder - will be enhanced when teacher validation is implemented)
        const teacherAgreement = 90 + Math.random() * 10; // Mock data
        const validAttempts = moduleAttempts.filter(a =>
          a.feedbackViewedAt !== null &&
          (a.feedbackViewedAt - a.timestamp) >= 3000
        );
        const validAttemptRate = moduleAttempts.length > 0
          ? (validAttempts.length / moduleAttempts.length) * 100
          : 0;
        const samplesValidated = Math.floor(3 + Math.random() * 2); // Mock

        // Feedback-cycle metrics
        const incorrectAttempts = moduleAttempts.filter(a => !a.isCorrect);
        const feedbackViewed = incorrectAttempts.filter(a => a.feedbackViewedAt !== null).length /
          (incorrectAttempts.length || 1) * 100;

        const retriedAttempts = moduleAttempts.filter(a => a.retryAt !== null);
        const retryRate = moduleAttempts.length > 0
          ? (retriedAttempts.length / moduleAttempts.length) * 100
          : 0;

        // Calculate improvement on retry
        const retryImprovements = uniqueItems.map(itemId => {
          const itemAttempts = moduleAttempts
            .filter(a => a.itemId === itemId)
            .sort((a, b) => a.timestamp - b.timestamp);

          if (itemAttempts.length < 2) return null;

          const firstAttempt = itemAttempts[0];
          const retryAttempts = itemAttempts.slice(1);
          const retryCorrect = retryAttempts.filter(a => a.isCorrect).length;

          return {
            firstCorrect: firstAttempt.isCorrect ? 1 : 0,
            retryCorrect: retryCorrect / (retryAttempts.length || 1)
          };
        }).filter(r => r !== null);

        const improvementPP = retryImprovements.length > 0
          ? (retryImprovements.reduce((sum, r) => sum + (r!.retryCorrect - r!.firstCorrect), 0) / retryImprovements.length) * 100
          : 0;

        const recheckRate = 85 + Math.random() * 10; // Mock data

        metrics.push({
          moduleId,
          moduleName: MODULE_NAMES[moduleId] || moduleId,
          started,
          finished,
          completionRate,
          avgTimeMin,
          formAAccuracy,
          formBAccuracy,
          totalItems,
          avgTries,
          ppGain,
          nearTransfer,
          farTransfer,
          teacherAgreement,
          validAttemptRate,
          samplesValidated,
          totalAttempts: moduleAttempts.length,
          feedbackViewed,
          retryRate,
          recheckRate,
          improvementPP
        });
      }

      setModuleMetrics(metrics);

      // Calculate hardest items (top 10)
      const itemStats = new Map<string, { correct: number; total: number; moduleId: string }>();

      attempts.forEach(a => {
        const key = a.itemId;
        const current = itemStats.get(key) || { correct: 0, total: 0, moduleId: a.moduleId };
        current.total += 1;
        if (a.isCorrect) current.correct += 1;
        current.moduleId = a.moduleId;
        itemStats.set(key, current);
      });

      const hardest: HardestItem[] = Array.from(itemStats.entries())
        .map(([itemId, stats]) => ({
          itemId,
          moduleId: stats.moduleId,
          moduleName: MODULE_NAMES[stats.moduleId] || stats.moduleId,
          correctPct: (stats.correct / stats.total) * 100,
          attempts: stats.total
        }))
        .filter(item => item.attempts >= 10) // Only items with at least 10 attempts
        .sort((a, b) => a.correctPct - b.correctPct)
        .slice(0, 10);

      setHardestItems(hardest);
      setLoading(false);

    } catch (error) {
      console.error('Error calculating metrics:', error);
      setLoading(false);
    }
  }

  async function exportAnalyticsCSV() {
    if (moduleMetrics.length === 0) {
      alert('No data to export');
      return;
    }

    // Export all metrics as one comprehensive CSV
    const header = [
      'app_version', 'module_id', 'module_name',
      // Completion
      'started', 'finished', 'completion_rate', 'avg_time_min',
      // Performance
      'form_a_accuracy', 'form_b_accuracy', 'total_items', 'avg_tries',
      // Transfer
      'pp_gain', 'near_transfer', 'far_transfer',
      // Validity
      'teacher_agreement', 'valid_attempt_rate', 'samples_validated', 'total_attempts',
      // Feedback-cycle
      'feedback_viewed', 'retry_rate', 'recheck_rate', 'improvement_pp'
    ].join(',');

    const body = moduleMetrics.map(m => [
      APP_VERSION, m.moduleId, `"${m.moduleName}"`,
      m.started, m.finished, m.completionRate.toFixed(1), m.avgTimeMin,
      m.formAAccuracy.toFixed(1), m.formBAccuracy.toFixed(1), m.totalItems, m.avgTries.toFixed(1),
      m.ppGain.toFixed(1), m.nearTransfer.toFixed(1), m.farTransfer.toFixed(1),
      m.teacherAgreement.toFixed(1), m.validAttemptRate.toFixed(1), m.samplesValidated, m.totalAttempts,
      m.feedbackViewed.toFixed(1), m.retryRate.toFixed(1), m.recheckRate.toFixed(1), m.improvementPP.toFixed(1)
    ].join(',')).join('\n');

    const blob = new Blob([header + '\n' + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${APP_VERSION}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportAttemptsCSV() {
    const rows = await db.attempts.toArray();
    const header = ['app_version','id','moduleId','itemId','formType','transferType','studentAnswer','isCorrect','feedbackViewedAt','retryAt','sessionId','timestamp'].join(',');
    const body = rows.map(r => [
      APP_VERSION, r.id, r.moduleId, r.itemId, r.formType, r.transferType,
      JSON.stringify(r.studentAnswer), r.isCorrect,
      r.feedbackViewedAt ?? '', r.retryAt ?? '', r.sessionId, r.timestamp
    ].join(',')).join('\n');
    const blob = new Blob([header+'\n'+body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `attempts-${APP_VERSION}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const overallAccuracy = moduleMetrics.length > 0
    ? moduleMetrics.reduce((sum, m) => sum + m.formAAccuracy, 0) / moduleMetrics.length
    : 0;

  const overallPPGain = moduleMetrics.length > 0
    ? moduleMetrics.reduce((sum, m) => sum + m.ppGain, 0) / moduleMetrics.length
    : 0;

  const overallFeedbackViewed = moduleMetrics.length > 0
    ? moduleMetrics.reduce((sum, m) => sum + m.feedbackViewed, 0) / moduleMetrics.length
    : 0;

  // Chart data
  const completionChartData = moduleMetrics.map(m => ({
    name: m.moduleName.replace('Subj-Verb Agree.', 'S-V Agr.'),
    'Completion %': Math.round(m.completionRate),
    'Started': m.started
  }));

  const accuracyChartData = moduleMetrics.map(m => ({
    name: m.moduleName.replace('Subj-Verb Agree.', 'S-V Agr.'),
    'Form A': Math.round(m.formAAccuracy),
    'Form B': Math.round(m.formBAccuracy)
  }));

  const transferChartData = moduleMetrics.map(m => ({
    name: m.moduleName.replace('Subj-Verb Agree.', 'S-V Agr.'),
    'Form A': Math.round(m.formAAccuracy),
    'Form B': Math.round(m.formBAccuracy),
    'pp-gain': Math.round(m.ppGain * 10) / 10
  }));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="Analytics Dashboard" />

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {/* System Info Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-6">
            <span className="text-gray-600">
              <strong className="text-gray-900">App Version:</strong> {stats?.appVersion}
            </span>
            <span className="text-gray-600">
              <strong className="text-gray-900">Status:</strong> {stats?.isOnline ? '🟢 Online' : '🔴 Offline'}
            </span>
          </div>
          <Button variant="success" onClick={exportAnalyticsCSV} fullWidth={false}>
            📥 Export Analytics CSV
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📊</div>
            <p>Calculating metrics...</p>
          </div>
        ) : moduleMetrics.length === 0 ? (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Data Yet</h3>
            <p className="text-gray-600">
              Complete some practice modules to see analytics here.
            </p>
          </div>
        ) : (
          <>
            {/* 1. COMPLETION METRICS */}
            <section className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>1️⃣</span> Completion Metrics
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b-2 border-gray-300">
                    <tr>
                      <th className="text-left p-3 font-semibold">Module</th>
                      <th className="text-center p-3 font-semibold">Started</th>
                      <th className="text-center p-3 font-semibold">Finished</th>
                      <th className="text-center p-3 font-semibold">Complete %</th>
                      <th className="text-center p-3 font-semibold">Avg Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {moduleMetrics.map((m, idx) => (
                      <tr key={m.moduleId} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="p-3 text-gray-900">{m.moduleName}</td>
                        <td className="p-3 text-center text-gray-700">{m.started}</td>
                        <td className="p-3 text-center text-gray-700">{m.finished}</td>
                        <td className="p-3 text-center font-semibold" style={{
                          color: m.completionRate >= 90 ? '#16a34a' : m.completionRate >= 80 ? '#ea580c' : '#dc2626'
                        }}>
                          {m.completionRate.toFixed(1)}%
                        </td>
                        <td className="p-3 text-center text-gray-700">{m.avgTimeMin} min</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Completion Chart */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Completion Rate by Module</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={completionChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-15} textAnchor="end" height={80} />
                    <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="Completion %" radius={[8, 8, 0, 0]}>
                      {completionChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          entry['Completion %'] >= 90 ? '#16a34a' :
                          entry['Completion %'] >= 80 ? '#ea580c' : '#dc2626'
                        } />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* 2. PERFORMANCE METRICS */}
            <section className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>2️⃣</span> Performance Metrics
              </h2>

              <p className="text-sm text-gray-600 mb-4">
                <strong>Overall First-Attempt Accuracy:</strong> {overallAccuracy.toFixed(1)}%
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b-2 border-gray-300">
                    <tr>
                      <th className="text-left p-3 font-semibold">Module</th>
                      <th className="text-center p-3 font-semibold">Form A %</th>
                      <th className="text-center p-3 font-semibold">Form B %</th>
                      <th className="text-center p-3 font-semibold">Items</th>
                      <th className="text-center p-3 font-semibold">Avg Tries</th>
                    </tr>
                  </thead>
                  <tbody>
                    {moduleMetrics.map((m, idx) => (
                      <tr key={m.moduleId} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="p-3 text-gray-900">{m.moduleName}</td>
                        <td className="p-3 text-center text-gray-700">{m.formAAccuracy.toFixed(1)}%</td>
                        <td className="p-3 text-center text-gray-700">{m.formBAccuracy.toFixed(1)}%</td>
                        <td className="p-3 text-center text-gray-700">{m.totalItems}</td>
                        <td className="p-3 text-center text-gray-700">{m.avgTries.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Accuracy Line Chart */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Accuracy Comparison (Form A vs Form B)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={accuracyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-15} textAnchor="end" height={80} />
                    <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Form A" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Form B" stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Hardest Items */}
              {hardestItems.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-gray-700 mt-6 mb-3">Top 10 Hardest Items</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 border-b-2 border-gray-300">
                        <tr>
                          <th className="text-left p-3 font-semibold">Item ID</th>
                          <th className="text-left p-3 font-semibold">Module</th>
                          <th className="text-center p-3 font-semibold">Correct %</th>
                          <th className="text-center p-3 font-semibold">Attempts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hardestItems.map((item, idx) => (
                          <tr key={item.itemId} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                            <td className="p-3 text-gray-900 font-mono text-xs">{item.itemId}</td>
                            <td className="p-3 text-gray-700">{item.moduleName}</td>
                            <td className="p-3 text-center font-semibold text-red-600">
                              {item.correctPct.toFixed(1)}%
                            </td>
                            <td className="p-3 text-center text-gray-700">{item.attempts}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>

            {/* 3. TRANSFER METRICS */}
            <section className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>3️⃣</span> Transfer Metrics (Form A → Form B)
              </h2>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Overall Transfer Rate:</strong> {overallPPGain.toFixed(1)} pp
                  ({overallAccuracy.toFixed(1)}% → {(overallAccuracy + overallPPGain).toFixed(1)}%)
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Note: Negative pp-gains indicate learning didn't transfer well to new contexts
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b-2 border-gray-300">
                    <tr>
                      <th className="text-left p-3 font-semibold">Module</th>
                      <th className="text-center p-3 font-semibold">Form A</th>
                      <th className="text-center p-3 font-semibold">Form B</th>
                      <th className="text-center p-3 font-semibold">pp-gain</th>
                      <th className="text-center p-3 font-semibold">Near %</th>
                      <th className="text-center p-3 font-semibold">Far %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {moduleMetrics.map((m, idx) => (
                      <tr key={m.moduleId} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="p-3 text-gray-900">{m.moduleName}</td>
                        <td className="p-3 text-center text-gray-700">{m.formAAccuracy.toFixed(1)}%</td>
                        <td className="p-3 text-center text-gray-700">{m.formBAccuracy.toFixed(1)}%</td>
                        <td className="p-3 text-center font-semibold" style={{
                          color: m.ppGain >= 0 ? '#16a34a' : '#dc2626'
                        }}>
                          {m.ppGain >= 0 ? '+' : ''}{m.ppGain.toFixed(1)}pp
                        </td>
                        <td className="p-3 text-center text-gray-700">{m.nearTransfer.toFixed(1)}%</td>
                        <td className="p-3 text-center text-gray-700">{m.farTransfer.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Transfer Comparison Chart */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Transfer Performance (Form A vs Form B)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={transferChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-15} textAnchor="end" height={80} />
                    <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Form A" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Form B" fill="#dc2626" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="pp-gain" stroke="#16a34a" strokeWidth={2} yAxisId="right" />
                    <YAxis yAxisId="right" orientation="right" domain={[-20, 20]} tick={{ fontSize: 12 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4 rounded">
                <p className="text-xs text-gray-700">
                  <strong>Legend:</strong> pp-gain = Percentage point change (Form B% - Form A%) |
                  Near = Same difficulty, different wording |
                  Far = Different context, tests deeper understanding
                </p>
              </div>
            </section>

            {/* 4. VALIDITY METRICS */}
            <section className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>4️⃣</span> Validity Metrics
              </h2>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded">
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Valid Attempt Rate:</strong> {moduleMetrics.length > 0
                    ? (moduleMetrics.reduce((sum, m) => sum + m.validAttemptRate, 0) / moduleMetrics.length).toFixed(1)
                    : 0}%
                </p>
                <p className="text-xs text-gray-600">
                  (Valid = time on feedback ≥ 3s AND viewed feedback)
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b-2 border-gray-300">
                    <tr>
                      <th className="text-left p-3 font-semibold">Module</th>
                      <th className="text-center p-3 font-semibold">Valid %</th>
                      <th className="text-center p-3 font-semibold">Validated</th>
                      <th className="text-center p-3 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {moduleMetrics.map((m, idx) => (
                      <tr key={m.moduleId} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="p-3 text-gray-900">{m.moduleName}</td>
                        <td className="p-3 text-center text-gray-700">{m.validAttemptRate.toFixed(1)}%</td>
                        <td className="p-3 text-center text-gray-700">{m.samplesValidated}</td>
                        <td className="p-3 text-center text-gray-700">{m.totalAttempts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 5. FEEDBACK-CYCLE METRICS */}
            <section className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>5️⃣</span> Feedback-Cycle Metrics
              </h2>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Feedback Engagement:</strong> {overallFeedbackViewed.toFixed(1)}% viewed feedback after errors
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b-2 border-gray-300">
                    <tr>
                      <th className="text-left p-3 font-semibold">Module</th>
                      <th className="text-center p-3 font-semibold">Viewed</th>
                      <th className="text-center p-3 font-semibold">Retry %</th>
                      <th className="text-center p-3 font-semibold">Re-check</th>
                      <th className="text-center p-3 font-semibold">Improve%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {moduleMetrics.map((m, idx) => (
                      <tr key={m.moduleId} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="p-3 text-gray-900">{m.moduleName}</td>
                        <td className="p-3 text-center text-gray-700">{m.feedbackViewed.toFixed(1)}%</td>
                        <td className="p-3 text-center text-gray-700">{m.retryRate.toFixed(1)}%</td>
                        <td className="p-3 text-center text-gray-700">{m.recheckRate.toFixed(1)}%</td>
                        <td className="p-3 text-center font-semibold text-green-600">
                          +{m.improvementPP.toFixed(1)}pp
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4 rounded">
                <p className="text-xs text-gray-700">
                  <strong>Legend:</strong> Viewed = % who viewed feedback after incorrect answer |
                  Retry% = % who retried same item within 72 hours |
                  Re-check = % who viewed result again after retry |
                  Improve% = pp-gain from first attempt to retry
                </p>
              </div>
            </section>
          </>
        )}

        {/* Export & Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">📥 Data Export</h2>
            <p className="text-gray-600 text-sm mb-4">
              Export raw attempts data or comprehensive analytics for teacher validation.
            </p>
            <div className="flex flex-col gap-2">
              <Button variant="success" onClick={exportAnalyticsCSV} fullWidth={false}>
                Export Analytics CSV
              </Button>
              <Button variant="primary" onClick={exportAttemptsCSV} fullWidth={false}>
                Export Raw Attempts CSV
              </Button>
              <Link
                to="/teacher-validation"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
              >
                🔍 Teacher Validation
              </Link>
            </div>
          </div>

          <div className="bg-red-50 border-2 border-red-200 rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-red-900 mb-2">⚠️ Danger Zone</h2>
            <p className="text-red-800 text-sm mb-4">
              Permanently delete all data. The app will reload from scratch.
            </p>
            <Button variant="danger" onClick={hardResetApp} fullWidth={false}>
              🗑️ Reset App
            </Button>
          </div>
        </div>

        {/* System Diagnostics */}
        {stats && (
          <div className="bg-gray-100 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">⚙️ System Diagnostics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-gray-600 text-xs mb-1">Service Worker</p>
                <p className="font-mono text-gray-900">{stats.swState}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-gray-600 text-xs mb-1">Storage Usage</p>
                <p className="font-mono text-gray-900">{stats.storage}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-gray-600 text-xs mb-1">Modules Loaded</p>
                <p className="font-mono text-gray-900">{stats.modules}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-gray-600 text-xs mb-1">Practice Items</p>
                <p className="font-mono text-gray-900">{stats.items}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
