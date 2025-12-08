import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useAuth } from '../contexts/AuthContext';
import { hardResetApp } from '../db/database';
import {
  Globe,
  User,
  Bell,
  Volume2,
  Palette,
  Download,
  Trash2,
  Info,
  ChevronRight,
  LogOut,
  School,
  BarChart3,
  Shield
} from 'lucide-react';

export function Settings() {
  const { t, i18n } = useTranslation();
  const { currentUser, logout } = useAuth();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = async () => {
    if (confirm(t('settings.resetConfirmMessage') || 'Are you sure you want to reset all data? This cannot be undone.')) {
      await hardResetApp();
    }
  };

  const settingsSections = [
    {
      title: t('settings.account'),
      items: [
        {
          icon: User,
          label: currentUser ? `${currentUser.name} (${currentUser.role})` : t('settings.notLoggedIn'),
          value: currentUser?.email || '',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
        }
      ]
    },
    {
      title: t('settings.preferences'),
      items: [
        {
          icon: Globe,
          label: t('settings.language'),
          value: i18n.language === 'fr' ? 'Français' : 'English',
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          component: <LanguageSwitcher />
        },
        {
          icon: Volume2,
          label: t('settings.sound'),
          value: t('settings.on'),
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        },
        {
          icon: Bell,
          label: t('settings.notifications'),
          value: t('settings.enabled'),
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
        }
      ]
    }
  ];

  // Always show Teacher Tools section
  settingsSections.push({
    title: t('settings.teacherTools'),
    items: [
      {
        icon: School,
        label: t('settings.teacherDashboard'),
        link: '/teacher-dashboard',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
      },
      {
        icon: BarChart3,
        label: t('settings.analytics'),
        link: '/analytics',
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-100',
      },
      {
        icon: Shield,
        label: t('settings.teacherValidation'),
        link: '/teacher-validation',
        color: 'text-pink-600',
        bgColor: 'bg-pink-100',
      }
    ]
  });

  settingsSections.push({
    title: t('settings.data'),
    items: [
      {
        icon: Download,
        label: t('settings.downloadData'),
        value: t('settings.exportProgress'),
        color: 'text-teal-600',
        bgColor: 'bg-teal-100',
      },
      {
        icon: Trash2,
        label: t('settings.resetApp'),
        value: t('settings.clearAllData'),
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        onClick: () => setShowResetConfirm(true)
      }
    ]
  });

  settingsSections.push({
    title: t('settings.about'),
    items: [
      {
        icon: Info,
        label: t('settings.version'),
        value: '2.0.1',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
      }
    ]
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <Header title={t('settings.title')} showBack />

      <main className="container mx-auto px-6 py-6 max-w-2xl">
        {/* Profile Section */}
        {currentUser && (
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <User size={32} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                <p className="text-blue-100 text-sm">{currentUser.email}</p>
                <div className="mt-2">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="mb-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
              {section.title}
            </h3>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {section.items.map((item, itemIdx) => {
                const ItemContent = (
                  <div
                    className={`flex items-center gap-4 p-4 transition-colors ${
                      item.onClick || item.link ? 'hover:bg-gray-50 cursor-pointer' : ''
                    } ${itemIdx !== section.items.length - 1 ? 'border-b border-gray-100' : ''}`}
                    onClick={item.onClick}
                  >
                    <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <item.icon className={item.color} size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{item.label}</p>
                      {item.value && (
                        <p className="text-sm text-gray-500 truncate">{item.value}</p>
                      )}
                    </div>
                    {item.component && (
                      <div onClick={(e) => e.stopPropagation()}>
                        {item.component}
                      </div>
                    )}
                    {(item.link || item.onClick) && !item.component && (
                      <ChevronRight className="text-gray-400 flex-shrink-0" size={20} />
                    )}
                  </div>
                );

                if (item.link) {
                  return (
                    <Link key={itemIdx} to={item.link}>
                      {ItemContent}
                    </Link>
                  );
                }

                return <div key={itemIdx}>{ItemContent}</div>;
              })}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        {currentUser && (
          <button
            onClick={logout}
            className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors border border-red-200"
          >
            <LogOut size={20} />
            {t('settings.logout')}
          </button>
        )}

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">
                {t('settings.resetConfirmTitle')}
              </h3>
              <p className="text-gray-600 text-center mb-6">
                {t('settings.resetConfirmMessage')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  {t('settings.cancel')}
                </button>
                <button
                  onClick={() => {
                    setShowResetConfirm(false);
                    handleReset();
                  }}
                  className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors"
                >
                  {t('settings.resetConfirm')}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
