/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { CalendarView } from './components/CalendarView';
import { DayDetailsModal } from './components/DayDetailsModal';
import { BottomNav, type MainTabType } from './components/BottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import type { DayData } from './types/calendar';
import { getTodayDateInfo } from './utils/calendarLogic';
import { initDailyNotificationScheduler } from './utils/notificationService';
import { templeSound } from './utils/audioChime';
import { SplashScreen } from './components/SplashScreen';
import { WhatsNewModal } from './components/WhatsNewModal';
import {
  LATEST_RELEASE,
  hasUnreadRelease,
  markReleaseAsSeen,
} from './data/releaseNotes';
import { MapPin } from 'lucide-react';
import { GURUPITH_INFO } from './data/calendar2026Data';

// Lazy-loaded secondary tabs and modals reduce initial startup payload (AUD-10).
// Workbox precaches all generated JS chunks so every tab remains 100% offline-ready.
const FestivalsView = lazy(() =>
  import('./components/FestivalsView').then(m => ({ default: m.FestivalsView }))
);
const SaramrutView = lazy(() =>
  import('./components/SaramrutView').then(m => ({ default: m.SaramrutView }))
);
const NityaSevaView = lazy(() =>
  import('./components/NityaSevaView').then(m => ({ default: m.NityaSevaView }))
);
const MuhuratAndSevaMargView = lazy(() =>
  import('./components/MuhuratAndSevaMargView').then(m => ({ default: m.MuhuratAndSevaMargView }))
);
const SearchModal = lazy(() =>
  import('./components/SearchModal').then(m => ({ default: m.SearchModal }))
);
const NotificationModal = lazy(() =>
  import('./components/NotificationModal').then(m => ({ default: m.NotificationModal }))
);
const OfflineVaultModal = lazy(() =>
  import('./components/OfflineVaultModal').then(m => ({ default: m.OfflineVaultModal }))
);

function TabLoadingFallback({ language }: { language: 'mr' | 'en' }) {
  return (
    <div className="rounded-3xl bg-white border border-orange-100 p-8 text-center shadow-xs">
      <p className="text-xs font-bold text-orange-800">
        {language === 'mr' ? '॥ श्री स्वामी समर्थ ॥ लोड होत आहे...' : 'Loading Seva...'}
      </p>
    </div>
  );
}

function AppContent() {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<MainTabType>('calendar');
  const [showSplash, setShowSplash] = useState(true);

  // Automatic today date detection: dynamically opens today's year, month & date
  const todayInfo = getTodayDateInfo();
  const [currentYear, setCurrentYear] = useState<number>(todayInfo.year);
  const [currentMonth, setCurrentMonth] = useState<number>(todayInfo.monthNumber);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isOfflineVaultOpen, setIsOfflineVaultOpen] = useState(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);

  const handleSplashFinish = () => {
    setShowSplash(false);
    if (hasUnreadRelease()) {
      setIsWhatsNewOpen(true);
    }
  };

  const handleAcknowledgeWhatsNew = () => {
    markReleaseAsSeen();
    setIsWhatsNewOpen(false);
  };

  // Initialize daily notification scheduler and sync user preferences with Service Worker
  useEffect(() => {
    templeSound.preloadVoiceBuffer();
    const cleanup = initDailyNotificationScheduler(language);
    return () => cleanup();
  }, [language]);

  // Dynamically measure real header & bottom-nav heights so sticky bars,
  // main content padding, and floating banners NEVER overlap or underlap
  // across any Android/iOS font scale, screen size, notch, or orientation.
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const syncChromeMetrics = () => {
      const headerEl = document.getElementById('app-top-header');
      const navEl = document.getElementById('app-bottom-nav');
      if (headerEl) {
        document.documentElement.style.setProperty(
          '--app-header-height',
          `${Math.ceil(headerEl.getBoundingClientRect().height)}px`
        );
      }
      if (navEl) {
        document.documentElement.style.setProperty(
          '--app-bottom-nav-height',
          `${Math.ceil(navEl.getBoundingClientRect().height)}px`
        );
      }
    };

    syncChromeMetrics();
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(syncChromeMetrics);
      const headerEl = document.getElementById('app-top-header');
      const navEl = document.getElementById('app-bottom-nav');
      if (headerEl) observer.observe(headerEl);
      if (navEl) observer.observe(navEl);
    }
    window.addEventListener('resize', syncChromeMetrics);
    window.addEventListener('orientationchange', syncChromeMetrics);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', syncChromeMetrics);
      window.removeEventListener('orientationchange', syncChromeMetrics);
    };
  }, []);

  const handleGoToToday = () => {
    const today = getTodayDateInfo();
    setCurrentYear(today.year);
    setCurrentMonth(today.monthNumber);
    setSelectedDay(today.dayData);
    setActiveTab('calendar');
  };

  // Build today's top dynamic banner highlight
  const todayOccasionText = (() => {
    const d = todayInfo.dayData;
    const est = d.isEstimated ? (language === 'mr' ? ' (अंदाजित)' : ' (Est.)') : '';
    if (d.isSankashti) {
      return language === 'mr'
        ? `आज संकष्टी चतुर्थी! चंद्रोदय: ${d.moonriseTime || 'रात्री ०८:५०'}${est}`
        : `Today is Sankashti Chaturthi! Moonrise: ${d.moonriseTime || 'Night'}${est}`;
    }
    if (d.isEkadashi) {
      return language === 'mr' ? `आज पवित्र एकादशी उपवास${est}` : `Today is Sacred Ekadashi Fasting${est}`;
    }
    if (d.isSwamiSpecial) {
      return language === 'mr' ? `आज स्वामी विशेष महामहोत्सव${est}` : `Today is Swami Special Occasion${est}`;
    }
    if (d.isPournima) {
      return language === 'mr' ? `आज पौर्णिमा (सत्यनारायण पूजा)${est}` : `Today is Pournima (Full Moon)${est}`;
    }
    if (d.isAmavasya) {
      return language === 'mr' ? `आज दर्श अमावास्या${est}` : `Today is Amavasya (New Moon)${est}`;
    }
    if (d.festivals.length > 0) {
      return language === 'mr' ? `आजचा सण: ${d.festivals[0].title}${est}` : `Today: ${d.festivals[0].titleEn}${est}`;
    }
    return language === 'mr' ? `आजची तिथी: ${d.tithi} (${d.paksha} पक्ष)${est}` : `Today's Tithi: ${d.tithi}${est}`;
  })();

  return (
    <div className="min-h-dvh bg-amber-50/40 text-slate-800 flex flex-col font-['Poppins','Baloo_2',sans-serif]">
      {/* Top App Header with Language Switcher, Offline Vault, Notifications & Search */}
      <Header
        currentYear={currentYear}
        onOpenSearch={() => setIsSearchOpen(true)}
        onGoToToday={handleGoToToday}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenOfflineVault={() => setIsOfflineVaultOpen(true)}
        onOpenSplash={() => setShowSplash(true)}
      />

      {/* Main Content Area — reserves bottom space dynamically & respects both landscape safe-area edges */}
      <main className="flex-1 max-w-xl mx-auto w-full pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] sm:px-4 pt-2.5 sm:pt-4 pb-[calc(var(--app-bottom-nav-height,4.5rem)+1.5rem)]">
        {/* Dynamic Today's Special Alert Banner */}
        {activeTab === 'calendar' && (
          <button
            type="button"
            onClick={() => setSelectedDay(todayInfo.dayData)}
            className="w-full min-h-[60px] text-left mb-2.5 sm:mb-3.5 cursor-pointer rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-2.5 sm:p-3 text-white shadow-md shadow-orange-950/10 flex items-center justify-between gap-2 transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="relative shrink-0">
                <img
                  src="/pwa-192x192.png"
                  alt="श्री स्वामी समर्थ"
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-amber-300/80 shadow-xs"
                />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-white border border-white">
                  {todayInfo.dayData.isSwamiSpecial ? 'ॐ' : todayInfo.dayData.dayOfMonth}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-[9px] font-black uppercase shrink-0">
                    {t('today')}
                  </span>
                  <p className="text-[11px] text-amber-100 font-bold truncate">
                    {todayInfo.dayData.marathiDayName} · {todayInfo.dayData.tithi}
                  </p>
                </div>
                <p className="text-xs sm:text-sm font-black text-white leading-tight mt-0.5 truncate">
                  {todayOccasionText}
                </p>
              </div>
            </div>
            <span className="shrink-0 min-h-[36px] px-2.5 py-1.5 rounded-xl bg-white text-orange-800 text-[11px] font-black shadow-xs whitespace-nowrap flex items-center">
              {t('viewDetails')}
            </span>
          </button>
        )}

        {/* Tab 1: Calendar View (Eager for instant startup) */}
        {activeTab === 'calendar' && (
          <CalendarView
            currentYear={currentYear}
            currentMonth={currentMonth}
            onChangeYear={setCurrentYear}
            onChangeMonth={setCurrentMonth}
            onSelectDay={setSelectedDay}
            selectedDateStr={selectedDay?.date}
          />
        )}

        {/* Tab 2–5: Lazy-loaded Views */}
        <Suspense fallback={<TabLoadingFallback language={language} />}>
          {activeTab === 'festivals' && (
            <FestivalsView
              currentYear={currentYear}
              onChangeYear={setCurrentYear}
              onSelectDay={setSelectedDay}
            />
          )}

          {activeTab === 'saramrut' && <SaramrutView />}

          {activeTab === 'nitya_seva' && (
            <NityaSevaView onOpenOfflineVault={() => setIsOfflineVaultOpen(true)} />
          )}

          {activeTab === 'muhurat_info' && <MuhuratAndSevaMargView />}
        </Suspense>

        {/* Clean, Devotional Spiritual Footer */}
        <footer className="mt-8 pt-4 pb-2 border-t border-orange-200/50 text-center space-y-2">
          <p className="text-xs font-bold text-orange-950/80 leading-relaxed max-w-md mx-auto px-2">
            {t('footerJaighosh')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[11px] text-amber-800 font-semibold text-center">
            <span className="font-bold">
              {language === 'mr'
                ? 'श्री स्वामी समर्थ सेवा दरबार, जयसिंगपूर'
                : 'Shree Swami Samarth Seva Darbar, Jaysingpur'}
            </span>
            <span className="hidden sm:inline">•</span>
            <a
              href={GURUPITH_INFO.mapShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-700 hover:text-orange-900 underline inline-flex items-center gap-1 font-bold whitespace-nowrap"
            >
              <MapPin className="w-3 h-3 text-red-600 shrink-0" />
              <span>{language === 'mr' ? 'मंदिर स्थान (Google Maps)' : 'Temple Location'}</span>
            </a>
          </div>
          <div className="flex items-center justify-center flex-wrap gap-x-2 gap-y-1 text-[10px] text-slate-400">
            <span className="whitespace-nowrap">{t('footerEdition')}</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsWhatsNewOpen(true)}
              className="text-orange-700 hover:text-orange-900 font-bold underline py-1 px-1 cursor-pointer tabular-nums whitespace-nowrap"
            >
              {t('whatsNewFooterLink')} (v{LATEST_RELEASE.version})
            </button>
          </div>
        </footer>
      </main>

      {/* Day Details Modal */}
      <DayDetailsModal
        day={selectedDay}
        onClose={() => setSelectedDay(null)}
        onSelectNityaSevaTab={() => setActiveTab('nitya_seva')}
      />

      {/* Lazy-loaded Modals (mounted only when opened) */}
      <Suspense fallback={null}>
        {isSearchOpen && (
          <SearchModal
            isOpen={isSearchOpen}
            currentYear={currentYear}
            onClose={() => setIsSearchOpen(false)}
            onSelectDay={setSelectedDay}
          />
        )}

        {isNotificationOpen && (
          <NotificationModal
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
          />
        )}

        {isOfflineVaultOpen && (
          <OfflineVaultModal
            isOpen={isOfflineVaultOpen}
            onClose={() => setIsOfflineVaultOpen(false)}
          />
        )}
      </Suspense>

      {/* Calm Offline & 2G/3G Data-Saver Indicator */}
      <OfflineIndicator onOpenOfflineVault={() => setIsOfflineVaultOpen(true)} />

      {/* Compact What's New / App Updated OK Popup shown right after splash on new publish */}
      <WhatsNewModal
        isOpen={isWhatsNewOpen}
        onAcknowledge={handleAcknowledgeWhatsNew}
      />

      {/* Devotional Splash Screen featuring Jaysingpur Murti Photo */}
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

      {/* Mobile-first Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
