import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
      aria-label="Switch language"
      title={i18n.language === 'en' ? 'Français' : 'English'}
    >
      <span className="text-lg font-semibold">
        {i18n.language === 'en' ? '🇫🇷' : '🇬🇧'}
      </span>
      <span className="text-sm hidden sm:inline">
        {i18n.language === 'en' ? 'FR' : 'EN'}
      </span>
    </button>
  );
}
