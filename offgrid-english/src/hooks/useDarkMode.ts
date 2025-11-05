import { useEffect, useState } from 'react';

type DarkModePreference = 'light' | 'dark' | 'system';

export function useDarkMode() {
  const [preference, setPreference] = useState<DarkModePreference>(() => {
    const saved = localStorage.getItem('darkModePreference');
    return (saved as DarkModePreference) || 'system';
  });

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const applyTheme = () => {
      let shouldBeDark = false;

      if (preference === 'system') {
        // Check system preference
        shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        shouldBeDark = preference === 'dark';
      }

      console.log('[useDarkMode] Applying theme:', {
        preference,
        shouldBeDark,
        currentClasses: document.documentElement.className
      });

      setIsDark(shouldBeDark);

      // Apply to document
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
        console.log('[useDarkMode] Added dark class');
      } else {
        document.documentElement.classList.remove('dark');
        console.log('[useDarkMode] Removed dark class');
      }

      console.log('[useDarkMode] Result classes:', document.documentElement.className);
    };

    applyTheme();

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (preference === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preference]);

  const setDarkModePreference = (newPreference: DarkModePreference) => {
    console.log('[useDarkMode] Setting preference to:', newPreference);
    setPreference(newPreference);
    localStorage.setItem('darkModePreference', newPreference);
  };

  const toggleDarkMode = () => {
    setDarkModePreference(isDark ? 'light' : 'dark');
  };

  return {
    isDark,
    preference,
    setPreference: setDarkModePreference,
    toggleDarkMode
  };
}
