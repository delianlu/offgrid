import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface NavItem {
    path: string;
    image: string;
    label: string;
    color: string;
    bgColor: string;
    activeColor: string;
    badge?: number;
}

export const BottomNav: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const currentPath = location.pathname;

    const isActive = (path: string) => {
        if (path === '/' && currentPath === '/') return true;
        if (path !== '/' && currentPath.startsWith(path)) return true;
        return false;
    };

    const navItems: NavItem[] = [
        {
            path: '/',
            image: '/assets/nav/home.png',
            label: t('navigation.home'),
            color: 'text-palm-600',
            bgColor: 'bg-palm-100',
            activeColor: 'bg-palm-600 text-white'
        },
        {
            path: '/smart-practice',
            image: '/assets/nav/practice.png',
            label: t('navigation.practice') || 'Practice',
            color: 'text-rose-600',
            bgColor: 'bg-rose-100',
            activeColor: 'bg-rose-600 text-white'
        },
        {
            path: '/progress-report',
            image: '/assets/nav/progress.png',
            label: t('navigation.progress'),
            color: 'text-sunshine-600',
            bgColor: 'bg-sunshine-100',
            activeColor: 'bg-sunshine-500 text-earth-900'
        },
        {
            path: '/settings',
            image: '/assets/nav/settings.png',
            label: t('navigation.settings'),
            color: 'text-earth-600',
            bgColor: 'bg-earth-100',
            activeColor: 'bg-earth-600 text-white'
        }
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-white/20 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] z-50 pb-safe">
            <div className="grid grid-cols-4 h-28 px-4 items-center">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex flex-col items-center justify-center relative group"
                        >
                            <div className="relative transition-all duration-300 ease-out">
                                <img
                                    src={item.image}
                                    alt={item.label}
                                    className={`w-20 h-20 object-contain transition-all duration-300 ${active ? '' : 'opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100'}`}
                                />
                                {item.badge && (
                                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-bounce-subtle">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span className={`
                                text-sm font-bold mt-1 transition-all duration-300
                                ${active ? 'text-earth-900' : 'text-earth-400 group-hover:text-earth-600'}
                            `}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};
