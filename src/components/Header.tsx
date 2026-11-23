import React, { useState, useEffect } from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { Search, Calendar as CalendarIcon, Bell, MapPin, ShieldCheck, WifiOff } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { getNotificationSettings } from '../utils/notificationService';

interface HeaderProps {
  currentYear?: number;
  onOpenSearch: () => void;
  onGoToToday: () => void;
  onOpenNotifications: () => void;
  onOpenOfflineVault?: () => void;
  onOpenSplash?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentYear = 2026,
  onOpenSearch,
  onGoToToday,
  onOpenNotifications,
  onOpenOfflineVault,
  onOpenSplash,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const network = useNetworkStatus();
  const [notifActive, setNotifActive] = useState(true);

  useEffect(() => {
    const s = getNotificationSettings();
    setNotifActive(s.enabled);
  }, []);

  return (
    <header
      id="app-top-header"
      className="sticky top-0 z-40 bg-gradient-to-r from-orange-800 via-amber-700 to-orange-900 text-white shadow-md border-b border-amber-400/20 backdrop-blur-md pt-[env(safe-area-inset-top)]"
    >
      {/* Top Gold Accent Shimmer */}
      <div className="h-0.5 w-full bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 opacity-80" />

      <div className="max-w-xl sm:max-w-4xl mx-auto pl-[max(0.625rem,env(safe-area-inset-left))] pr-[max(0.625rem,env(safe-area-inset-right))] sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Brand & Temple Identity — crisp and legible from 320px up */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
          {/* Temple Emblem Medallion with Jaysingpur Murti */}
          <button
            type="button"
            onClick={onOpenSplash}
            aria-label={language === 'mr' ? 'दर्शन स्क्रीन पहा' : 'View Splash Darshan'}
            title={language === 'mr' ? 'दर्शन स्क्रीन पहा' : 'View Splash Darshan'}
            className="relative shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center active:scale-95 transition cursor-pointer group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-500 p-0.5 shadow-sm ring-1 ring-amber-300/80 group-hover:ring-amber-200 flex items-center justify-center overflow-hidden">
              <img
                src="/pwa-192x192.png"
                alt="श्री स्वामी समर्थ सेवा केंद्र जयसिंगपूर"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] font-black text-amber-100 border border-amber-200">
              ॐ
            </span>
          </button>

          {/* Responsive Title & Location Header — never crushes on 320px–375px screens */}
          <div className="min-w-0 flex-1">
            <h1 className="text-[13px] sm:text-base font-black tracking-tight text-white leading-tight truncate">
              <span className="sm:hidden">
                {language === 'mr' ? 'श्री स्वामी समर्थ दरबार' : 'Swami Samarth Darbar'}
              </span>
              <span className="hidden sm:inline">
                {language === 'mr'
                  ? 'श्री स्वामी समर्थ सेवा दरबार, जयसिंगपूर'
                  : 'Shree Swami Samarth Seva Darbar, Jaysingpur'}
              </span>
            </h1>
            <a
              href="https://share.google/f18TuAysrg8IiGt7x"
              target="_blank"
              rel="noopener noreferrer"
              title={language === 'mr' ? 'गूगल नकाशावर मंदिर स्थान पहा' : 'View Temple Location on Map'}
              className="text-[10.5px] sm:text-xs text-amber-200 font-semibold leading-tight mt-0.5 inline-flex items-center gap-1 hover:text-white transition max-w-full"
            >
              <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300 shrink-0" />
              <span className="underline decoration-amber-300/50 underline-offset-2 truncate">
                {language === 'mr' ? 'जयसिंगपूर' : 'Jaysingpur'}
              </span>
              <span className="text-amber-300/70 shrink-0">·</span>
              <span className="font-bold text-amber-100 tabular-nums shrink-0">{currentYear}</span>
            </a>
          </div>
        </div>

        {/* Action Controls — Guaranteed 44×44px touch targets with zero crowding */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Mobile (<sm): Compact 1-tap Language Switcher (saves 48px on narrow screens!) */}
          <button
            type="button"
            onClick={() => setLanguage(language === 'mr' ? 'en' : 'mr')}
            aria-label={language === 'mr' ? 'Switch to English' : 'मराठी भाषा निवडा'}
            title={language === 'mr' ? 'Switch to English' : 'मराठी भाषा निवडा'}
            className="sm:hidden min-w-[44px] min-h-[44px] px-2 rounded-xl bg-amber-300/95 hover:bg-amber-200 text-orange-950 text-[11px] font-black border border-amber-200 active:scale-95 transition shadow-xs whitespace-nowrap flex items-center justify-center"
          >
            {language === 'mr' ? 'EN' : 'मराठी'}
          </button>

          {/* Tablet / Desktop (sm:+): Full Segmented Language Switcher */}
          <div
            role="group"
            aria-label="Language selection"
            className="hidden sm:flex items-center bg-orange-950/60 rounded-xl p-0.5 border border-amber-400/30 shadow-xs"
          >
            <button
              type="button"
              onClick={() => setLanguage('mr')}
              aria-label="मराठी भाषा"
              aria-pressed={language === 'mr'}
              className={`min-h-[40px] px-2.5 py-1 rounded-lg text-xs font-black transition-all active:scale-95 whitespace-nowrap ${
                language === 'mr'
                  ? 'bg-gradient-to-r from-amber-300 to-amber-400 text-orange-950 shadow-xs ring-1 ring-amber-200'
                  : 'text-amber-100/80 hover:text-white'
              }`}
            >
              मराठी
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              aria-label="English language"
              aria-pressed={language === 'en'}
              className={`min-h-[40px] px-2.5 py-1 rounded-lg text-xs font-black transition-all active:scale-95 whitespace-nowrap ${
                language === 'en'
                  ? 'bg-gradient-to-r from-amber-300 to-amber-400 text-orange-950 shadow-xs ring-1 ring-amber-200'
                  : 'text-amber-100/80 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          {/* Offline Seva & Audio Vault Button */}
          {onOpenOfflineVault && (
            <button
              type="button"
              onClick={onOpenOfflineVault}
              aria-label={t('offlineVaultTitle')}
              title={t('offlineVaultTitle')}
              className={`relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border active:scale-95 transition shadow-xs ${
                !network.isOnline
                  ? 'bg-amber-300 text-orange-950 border-amber-100'
                  : 'bg-orange-900/50 hover:bg-orange-900/80 text-amber-200 hover:text-white border-amber-400/30'
              }`}
            >
              {!network.isOnline ? (
                <WifiOff className="w-4 h-4" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Daily 6 AM Notification Bell */}
          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label={t('dailyNotifications')}
            title={t('dailyNotifTitle')}
            className="relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-orange-900/50 hover:bg-orange-900/80 text-amber-200 hover:text-white border border-amber-400/30 active:scale-95 transition shadow-xs"
          >
            <Bell className="w-4 h-4" />
            {notifActive && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-white" />
            )}
          </button>

          {/* Search Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label={t('searchTitle')}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-orange-900/50 hover:bg-orange-900/80 text-amber-200 hover:text-white border border-amber-400/30 active:scale-95 transition shadow-xs"
            title={t('searchTitle')}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Today Button - Shown on tablet/desktop */}
          <button
            type="button"
            onClick={onGoToToday}
            aria-label={t('today')}
            className="hidden sm:flex items-center gap-1 min-h-[44px] px-3 rounded-xl bg-orange-900/50 hover:bg-orange-900/80 text-white text-xs font-bold border border-amber-400/30 active:scale-95 transition shadow-xs whitespace-nowrap"
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
