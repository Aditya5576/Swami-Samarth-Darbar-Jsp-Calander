import React, { useState, useEffect } from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { Search, Calendar as CalendarIcon, Bell, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getNotificationSettings } from '../utils/notificationService';

interface HeaderProps {
  currentYear?: number;
  onOpenSearch: () => void;
  onGoToToday: () => void;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentYear = 2026,
  onOpenSearch,
  onGoToToday,
  onOpenNotifications,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [notifActive, setNotifActive] = useState(true);

  useEffect(() => {
    const s = getNotificationSettings();
    setNotifActive(s.enabled);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-orange-850 via-amber-700 to-orange-900 text-white shadow-md border-b border-amber-400/20 backdrop-blur-md">
      {/* Top Gold Accent Shimmer */}
      <div className="h-0.5 w-full bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 opacity-80" />

      <div className="max-w-xl sm:max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2">
        {/* Brand & Temple Identity - Generous width, NEVER truncates! */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
          {/* Temple Emblem Medallion with Jaysingpur Murti */}
          <div className="relative shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-500 p-0.5 shadow-sm ring-1 ring-amber-300/80 flex items-center justify-center overflow-hidden">
              <img
                src="/pwa-192x192.png"
                alt="श्री स्वामी समर्थ सेवा केंद्र जयसिंगपूर"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] font-black text-amber-100 border border-amber-200">
              ॐ
            </span>
          </div>

          {/* Title & Location Header - Clean, prominent, no awkward wrapping */}
          <div className="min-w-0 flex-1">
            <h1 className="text-xs sm:text-base font-black tracking-tight text-white leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
              {language === 'mr' ? 'श्री स्वामी समर्थ सेवा दरबार, जयसिंगपूर' : 'Shree Swami Samarth Seva Darbar, Jaysingpur'}
            </h1>
            <a
              href="https://share.google/f18TuAysrg8IiGt7x"
              target="_blank"
              rel="noopener noreferrer"
              title={language === 'mr' ? 'गूगल नकाशावर मंदिर स्थान पहा' : 'View Temple Location on Map'}
              className="text-[10px] sm:text-xs text-amber-200 font-semibold leading-tight mt-0.5 inline-flex items-center gap-1 hover:text-white transition whitespace-nowrap overflow-hidden"
            >
              <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300 shrink-0" />
              <span className="underline decoration-amber-300/50 underline-offset-2">
                {language === 'mr' ? 'सेवा केंद्र, जयसिंगपूर' : 'Seva Kendra, Jaysingpur'}
              </span>
              <span className="text-amber-300/70">•</span>
              <span className="font-bold text-amber-100">{currentYear}</span>
            </a>
          </div>
        </div>

        {/* Action Controls - Streamlined on mobile so title has full room */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Language Switcher Pill */}
          <div
            role="group"
            aria-label="Language selection"
            className="flex items-center bg-orange-950/60 rounded-xl p-0.5 border border-amber-400/30 shadow-xs"
          >
            <button
              onClick={() => setLanguage('mr')}
              aria-label="मराठी भाषा"
              aria-pressed={language === 'mr'}
              className={`px-1.5 py-1 rounded-lg text-[10px] sm:text-xs font-black transition-all active:scale-95 ${
                language === 'mr'
                  ? 'bg-gradient-to-r from-amber-300 to-amber-400 text-orange-950 shadow-xs ring-1 ring-amber-200'
                  : 'text-amber-100/80 hover:text-white'
              }`}
            >
              मराठी
            </button>
            <button
              onClick={() => setLanguage('en')}
              aria-label="English language"
              aria-pressed={language === 'en'}
              className={`px-1.5 py-1 rounded-lg text-[10px] sm:text-xs font-black transition-all active:scale-95 ${
                language === 'en'
                  ? 'bg-gradient-to-r from-amber-300 to-amber-400 text-orange-950 shadow-xs ring-1 ring-amber-200'
                  : 'text-amber-100/80 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          {/* Daily 6 AM Notification Bell */}
          <button
            onClick={onOpenNotifications}
            aria-label={t('dailyNotifications')}
            title={t('dailyNotifTitle')}
            className="relative p-1.5 sm:p-2 rounded-xl bg-orange-900/50 hover:bg-orange-900/80 text-amber-200 hover:text-white border border-amber-400/30 active:scale-90 transition shadow-xs"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {notifActive && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-white" />
            )}
          </button>

          {/* Search Button */}
          <button
            onClick={onOpenSearch}
            aria-label={t('searchTitle')}
            className="p-1.5 sm:p-2 rounded-xl bg-orange-900/50 hover:bg-orange-900/80 text-amber-200 hover:text-white border border-amber-400/30 active:scale-90 transition shadow-xs"
            title={t('searchTitle')}
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Today Button - Shown on tablet/desktop (on mobile, Today is featured right in the view) */}
          <button
            onClick={onGoToToday}
            aria-label={t('today')}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-900/50 hover:bg-orange-900/80 text-white text-xs font-bold border border-amber-400/30 active:scale-90 transition shadow-xs"
            title={t('today')}
          >
            <CalendarIcon className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>{t('today')}</span>
          </button>

          {/* Install Button - Shown on larger screens */}
          <div className="hidden sm:block">
            <PWAInstallButton compact={true} />
          </div>
        </div>
      </div>
    </header>
  );
};
