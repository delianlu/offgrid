import { useEffect, useState } from 'react';
import { db, hardResetApp } from '../db/database';
import { APP_VERSION } from '../App';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';

type Stats = {
  modules: number; items: number; attempts: number;
  appVersion: string; isOnline: boolean; storage?: string; swState?: string;
};

export function Diagnostics() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  async function exportAttemptsCSV() {
    const rows = await db.attempts.toArray();
    const header = ['id','moduleId','itemId','formType','transferType','studentAnswer','isCorrect','feedbackViewedAt','retryAt','sessionId','timestamp'].join(',');
    const body = rows.map(r => [
      r.id, r.moduleId, r.itemId, r.formType, r.transferType, JSON.stringify(r.studentAnswer),
      r.isCorrect, r.feedbackViewedAt ?? '', r.retryAt ?? '', r.sessionId, r.timestamp
    ].join(',')).join('\n');
    const blob = new Blob([header+'\n'+body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `attempts-${APP_VERSION}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header title="Diagnostics" />

      {/* Content */}
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        {/* System Information Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Information</h2>
          {stats ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">App Version</span>
                <span className="text-gray-900 font-mono">{stats.appVersion}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">Connection Status</span>
                <span className="text-gray-900">
                  {stats.isOnline ? '🟢 Online' : '🔴 Offline'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">Service Worker</span>
                <span className="text-gray-900 font-mono">{stats.swState}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">Storage Usage</span>
                <span className="text-gray-900 font-mono">{stats.storage}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">Loading...</div>
          )}
        </div>

        {/* Database Statistics Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Database Statistics</h2>
          {stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center border-2 border-blue-200">
                <div className="text-3xl font-bold text-blue-700">{stats.modules}</div>
                <div className="text-sm text-gray-600 mt-1">Modules</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center border-2 border-green-200">
                <div className="text-3xl font-bold text-green-700">{stats.items}</div>
                <div className="text-sm text-gray-600 mt-1">Practice Items</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center border-2 border-blue-200">
                <div className="text-3xl font-bold text-blue-700">{stats.attempts}</div>
                <div className="text-sm text-gray-600 mt-1">Student Attempts</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">Loading...</div>
          )}
        </div>

        {/* Data Export Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Data Export</h2>
          <p className="text-gray-600 text-sm mb-4">
            Export all student attempt data to CSV format for analysis or teacher validation.
          </p>
          <Button
            variant="success"
            onClick={exportAttemptsCSV}
            fullWidth={false}
          >
            📥 Export Attempts CSV
          </Button>
        </div>

        {/* Danger Zone Card */}
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-red-900 mb-2">⚠️ Danger Zone</h2>
          <p className="text-red-800 text-sm mb-4">
            This action will permanently delete all local data including modules, practice items, and student attempts. The app will reload from scratch.
          </p>
          <Button
            variant="danger"
            onClick={hardResetApp}
            fullWidth={false}
          >
            🗑️ Reset App (Clear All Data)
          </Button>
        </div>
      </main>
    </div>
  );
}
