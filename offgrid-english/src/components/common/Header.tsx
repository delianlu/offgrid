import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  title?: string;
  currentItem?: number;
  totalItems?: number;
  progress?: number; // 0-100
  onBack?: () => void;
  showTeacherButton?: boolean;
  showLanguageToggle?: boolean;
  userAvatar?: string;
  onProfileClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  currentItem,
  totalItems,
  progress,
  onBack,
  showTeacherButton,
  showLanguageToggle,
  userAvatar,
  onProfileClick,
}) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg sticky top-0 z-50 h-24">
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">

          {/* Left Section: Logo and Back Button */}
          <div className="flex items-center gap-4 h-full">
            {/* Logo - Matches Header Height (Flush) */}
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity group relative z-20 h-full">
              <div className="h-full aspect-square flex items-center justify-center overflow-hidden bg-white/10 backdrop-blur-md shadow-lg border-r border-white/20 transition-transform hover:bg-white/20">
                <img src="/logo.png" alt="OffGrid English Logo" className="h-full w-full object-cover" />
              </div>
              <div className="hidden sm:block pl-2">
                <h1 className="text-2xl font-black leading-tight tracking-tight drop-shadow-sm">OffGrid English</h1>
                <p className="text-xs text-blue-100 font-medium tracking-wide uppercase">Learn anytime</p>
              </div>
            </Link>

            {/* Back Button & Title - Shown alongside logo on subpages */}
            {(title || onBack) && (
              <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/20 h-10">
                <button
                  onClick={handleBack}
                  className="font-bold text-sm hover:bg-white/20 transition-all active:scale-95 rounded-xl px-3 py-1.5 flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10"
                >
                  <span className="text-lg">←</span>
                  <span className="hidden md:inline">Back</span>
                </button>

                {title && (
                  <span className="font-bold text-lg tracking-tight ml-2 truncate max-w-[200px] md:max-w-xs">{title}</span>
                )}
              </div>
            )}
          </div>

          {/* Center Section: Progress Info (only if no logo taking up space, or responsive) */}
          {currentItem !== undefined && totalItems !== undefined && (
            <div className="hidden md:block">
              <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                Question {currentItem} of {totalItems}
              </span>
            </div>
          )}

          {/* Right Section: Actions */}
          <div className="flex items-center gap-2">

            {/* Language Toggle */}
            {showLanguageToggle && (
              <div className="flex bg-white/20 rounded-lg p-1 backdrop-blur-sm mr-6">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`px-2 py-1 rounded text-xs font-bold transition-colors ${i18n.language === 'en' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/10'
                    }`}
                >
                  EN
                </button>
                <button
                  onClick={() => changeLanguage('fr')}
                  className={`px-2 py-1 rounded text-xs font-bold transition-colors ${i18n.language === 'fr' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/10'
                    }`}
                >
                  FR
                </button>
              </div>
            )}

            {/* Teacher Dashboard Button */}
            {showTeacherButton && (
              <Link
                to="/teacher-dashboard"
                className="flex items-center gap-3 px-8 py-1 h-auto self-center bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all group hover:scale-105 active:scale-95 backdrop-blur-sm shadow-sm"
                title="Teacher Dashboard"
              >
                <div className="w-16 h-16 flex items-center justify-center">
                  <img src="/assets/ui/teacher-button.png" alt="Teacher Mode" className="w-full h-full object-contain drop-shadow-sm" />
                </div>
                <span className="text-lg font-bold text-blue-50 group-hover:text-white hidden sm:inline tracking-wide whitespace-nowrap">Teacher Mode</span>
              </Link>
            )}

            {/* Profile / Login Button */}
            <button
              onClick={onProfileClick}
              className="flex items-center gap-3 px-8 py-1 h-auto self-center bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all group hover:scale-105 active:scale-95 backdrop-blur-sm ml-2"
              title={userAvatar ? "My Profile" : "Login"}
            >
              <div className="w-16 h-16 flex items-center justify-center">
                <img src="/assets/ui/user-profile-icon.png" alt="Profile" className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              <span className="text-lg font-bold text-blue-50 group-hover:text-white hidden sm:inline tracking-wide whitespace-nowrap">
                {userAvatar ? "Profile" : "Login"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {progress !== undefined && (
        <div className="bg-black/20 h-2 overflow-hidden">
          <div
            className="bg-white/90 h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Module completion progress"
          />
        </div>
      )}
    </header>
  );
};
