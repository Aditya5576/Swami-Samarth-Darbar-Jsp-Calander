/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CalendarView } from './components/CalendarView';
import { FestivalsView } from './components/FestivalsView';
import { NityaSevaView } from './components/NityaSevaView';
import { MuhuratAndSevaMargView } from './components/MuhuratAndSevaMargView';
import { DayDetailsModal } from './components/DayDetailsModal';
import { SearchModal } from './components/SearchModal';
import { NotificationModal } from './components/NotificationModal';
import { BottomNav, MainTabType } from './components/BottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { DayData } from './types/calendar';
import { getTodayDateInfo } from './utils/calendarLogic';
import { initDailyNotificationScheduler } from './utils/notificationService';
import { templeSound } from './utils/audioChime';
import { SplashScreen } from './components/SplashScreen';
import { ExternalLink, Sparkles, MapPin, Phone } from 'lucide-react';
import { GURUPITH_INFO } from './data/calendar2026Data';

function AppContent() {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<MainTabType>('calendar');
  const [showSplash, setShowSplash] = useState(true);

  // Automatic today date detection: dynamically opens today's year, month & date!
  const todayInfo = getTodayDateInfo();
  const [currentYear, setCurrentYear] = useState<number>(todayInfo.year);
  const [currentMonth, setCurrentMonth] = useState<number>(todayInfo.monthNumber);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(todayInfo.dayData);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Initialize daily notification background checker (runs at 6:00 AM)
  useEffect(() => {
    templeSound.preloadVoiceBuffer();
    const cleanup = initDailyNotificationScheduler(language);
    return () => cleanup();
  }, [language]);

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
    if (d.isSankashti) {
      return language === 'mr'
        ? `आज संकष्टी चतुर्थी! चंद्रोदय: ${d.moonriseTime || 'रात्री ०८:५०'}`
        : `Today is Sankashti Chaturthi! Moonrise: ${d.moonriseTime || 'Night'}`;
    }
    if (d.isEkadashi) {
      return language === 'mr' ? 'आज पवित्र एकादशी उपवास' : 'Today is Sacred Ekadashi Fasting';
    }
    if (d.isSwamiSpecial) {
      return language === 'mr' ? 'आज स्वामी विशेष महामहोत्सव' : 'Today is Swami Special Occasion';
    }
    if (d.isPournima) {
      return language === 'mr' ? 'आज पौर्णिमा (सत्यनारायण पूजा)' : 'Today is Pournima (Full Moon)';
    }
    if (d.isAmavasya) {
      return language === 'mr' ? 'आज दर्श अमावास्या' : 'Today is Amavasya (New Moon)';
    }
    if (d.festivals.length > 0) {
      return language === 'mr' ? `आजचा सण: ${d.festivals[0].title}` : `Today: ${d.festivals[0].titleEn}`;
    }
    return language === 'mr' ? `आजची तिथी: ${d.tithi} (${d.paksha} पक्ष)` : `Today's Tithi: ${d.tithi}`;
  })();

  return (
    <div className="min-h-screen bg-amber-50/40 text-slate-800 flex flex-col font-['Poppins','Baloo_2',sans-serif]">
      {/* Top App Header with State-based Language Switcher, Notifications & Search */}
      <Header
        currentYear={currentYear}
        onOpenSearch={() => setIsSearchOpen(true)}
        onGoToToday={handleGoToToday}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenSplash={() => setShowSplash(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl mx-auto w-full px-3 py-2.5 sm:px-4 sm:py-4 pb-24">
        {/* Dynamic Today's Special Alert Banner (Auto opens and highlights today's event) */}
        {activeTab === 'calendar' && (
          <div
            onClick={() => setSelectedDay(todayInfo.dayData)}
            className="mb-2.5 sm:mb-3.5 cursor-pointer rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-2.5 sm:p-3 text-white shadow-md shadow-orange-950/10 flex items-center justify-between gap-2 transition active:scale-98"
          >
            <div className="flex items-center gap-2.5 min-w-0">
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
                <div className="flex items-center gap-1.5 flex-nowrap">
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-[8px] font-black uppercase shrink-0">
                    {t('today')}
                  </span>
                  <p className="text-[10px] text-amber-100 font-bold whitespace-nowrap">
                    {todayInfo.dayData.marathiDayName} • {todayInfo.dayData.tithi}
                  </p>
                </div>
                <p className="text-xs sm:text-sm font-black text-white leading-tight mt-0.5 line-clamp-1">
                  {todayOccasionText}
                </p>
              </div>
            </div>
            <span className="shrink-0 px-2 py-1 rounded-xl bg-white text-orange-800 text-[11px] font-black shadow-xs whitespace-nowrap">
              {t('viewDetails')}
            </span>
          </div>
        )}

        {/* Tab 1: Calendar View */}
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

        {/* Tab 2: Festivals & Panchang View */}
        {activeTab === 'festivals' && (
          <FestivalsView
            currentYear={currentYear}
            onChangeYear={setCurrentYear}
            onSelectDay={setSelectedDay}
          />
        )}

        {/* Tab 3: Nitya Seva & Japa Mala */}
        {activeTab === 'nitya_seva' && <NityaSevaView />}

        {/* Tab 4: Muhurat & Jaysingpur Seva Kendra Info */}
        {activeTab === 'muhurat_info' && <MuhuratAndSevaMargView />}

        {/* Clean, Devotional Spiritual Footer */}
        <footer className="mt-8 pt-4 pb-2 border-t border-orange-200/50 text-center space-y-2">
          <p className="text-xs font-bold text-orange-950/80 leading-relaxed max-w-md mx-auto px-2">
            {t('footerJaighosh')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[11px] text-amber-800 font-semibold text-center">
            <span className="font-bold">{language === 'mr' ? 'श्री स्वामी समर्थ सेवा दरबार, जयसिंगपूर' : 'Shree Swami Samarth Seva Darbar, Jaysingpur'}</span>
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
          <p className="text-[10px] text-slate-400">
            {t('footerEdition')}
          </p>
        </footer>
      </main>

      {/* Day Details Modal / Drawer */}
      <DayDetailsModal
        day={selectedDay}
        onClose={() => setSelectedDay(null)}
        onSelectNityaSevaTab={() => setActiveTab('nitya_seva')}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        currentYear={currentYear}
        onClose={() => setIsSearchOpen(false)}
        onSelectDay={setSelectedDay}
      />

      {/* Daily 6 AM Notification Center Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* Offline Toast Indicator */}
      <OfflineIndicator />

      {/* Devotional Splash Screen featuring Jaysingpur Murti Photo */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

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
