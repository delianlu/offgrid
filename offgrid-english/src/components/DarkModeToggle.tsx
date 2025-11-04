import { useDarkMode } from '../hooks/useDarkMode';

export function DarkModeToggle() {
  const { isDark, preference, setPreference } = useDarkMode();

  return (
    <div className="relative group">
      <button
        onClick={() => setPreference(isDark ? 'light' : 'dark')}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
        aria-label="Toggle dark mode"
        title={`Current: ${preference} mode`}
      >
        {isDark ? (
          <span className="text-xl">🌙</span>
        ) : (
          <span className="text-xl">☀️</span>
        )}
      </button>

      {/* Dropdown for system/light/dark selection */}
      <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <button
          onClick={() => setPreference('light')}
          className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 ${
            preference === 'light' ? 'bg-blue-50 dark:bg-blue-900 font-semibold' : ''
          }`}
        >
          <span>☀️</span>
          <span className="dark:text-white">Light</span>
        </button>
        <button
          onClick={() => setPreference('dark')}
          className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 ${
            preference === 'dark' ? 'bg-blue-50 dark:bg-blue-900 font-semibold' : ''
          }`}
        >
          <span>🌙</span>
          <span className="dark:text-white">Dark</span>
        </button>
        <button
          onClick={() => setPreference('system')}
          className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 rounded-b-lg ${
            preference === 'system' ? 'bg-blue-50 dark:bg-blue-900 font-semibold' : ''
          }`}
        >
          <span>💻</span>
          <span className="dark:text-white">System</span>
        </button>
      </div>
    </div>
  );
}
