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

      setIsDark(shouldBeDark);

      // Apply to document
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
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
