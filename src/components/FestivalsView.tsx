import React, { useState } from 'react';
import { DayData } from '../types/calendar';
import { getMonthDays, SUPPORTED_YEARS } from '../utils/calendarLogic';
import { useLanguage } from '../context/LanguageContext';
import {
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface FestivalsViewProps {
  currentYear?: number;
  onChangeYear?: (y: number) => void;
  onSelectDay: (day: DayData) => void;
}

type FilterKey = 'all' | 'swami' | 'ekadashi' | 'sankashti' | 'pournima_amavasya' | 'gurupushya';

export const FestivalsView: React.FC<FestivalsViewProps> = ({
  currentYear = 2026,
  onChangeYear,
  onSelectDay,
}) => {
  const { language, t, getDayName, getMonthName } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const activeYear = onChangeYear ? currentYear : selectedYear;
  const handleSetYear = (y: number) => {
    setSelectedYear(y);
    if (onChangeYear) onChangeYear(y);
  };

  const allDaysWithEvents: DayData[] = [];
  for (let m = 1; m <= 12; m++) {
    const days = getMonthDays(m, activeYear);
    for (const d of days) {
      if (
        d.festivals.length > 0 ||
        d.isSwamiSpecial ||
        d.isEkadashi ||
        d.isSankashti ||
        d.isPournima ||
        d.isAmavasya ||
        d.isGuruPushya
      ) {
        allDaysWithEvents.push(d);
      }
    }
  }

  const filteredDays = allDaysWithEvents.filter(d => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'swami') return d.isSwamiSpecial || d.festivals.some(f => f.category === 'swami');
    if (activeFilter === 'ekadashi') return d.isEkadashi || d.festivals.some(f => f.category === 'ekadashi');
    if (activeFilter === 'sankashti') return d.isSankashti || d.festivals.some(f => f.category === 'sankashti');
    if (activeFilter === 'pournima_amavasya') return d.isPournima || d.isAmavasya;
    if (activeFilter === 'gurupushya') return d.isGuruPushya || d.festivals.some(f => f.category === 'gurupushya');
    return true;
  });

  return (
    <div className="space-y-3 sm:space-y-4 max-w-full">
      {/* Header Info & Filter Bar */}
      <div className="rounded-2xl sm:rounded-3xl bg-white p-3 sm:p-4 shadow-xs border border-orange-100 space-y-3">
        {/* Year Switcher (Grid of 6 equal pills - NEVER overflows or gets cut off!) */}
        <div className="space-y-1.5 pb-2.5 border-b border-orange-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">
              {language === 'mr' ? 'वर्ष निवडा:' : 'Select Year:'}
            </span>
            <span className="text-xs font-black text-orange-900 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60">
              {activeYear}
            </span>
          </div>
          <div className="grid grid-cols-6 gap-1 w-full">
            {SUPPORTED_YEARS.map(yr => (
              <button
                key={yr}
                onClick={() => handleSetYear(yr)}
                className={`py-1 rounded-lg text-xs font-black text-center transition-all active:scale-95 ${
                  activeYear === yr
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xs'
                    : 'bg-orange-50/70 hover:bg-orange-100/70 text-orange-950 border border-orange-200/50'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl p-0.5 bg-gradient-to-tr from-amber-300 to-yellow-100 ring-2 ring-orange-400 shrink-0 shadow-2xs overflow-hidden">
            <img
              src="/pwa-192x192.png"
              alt="श्री स्वामी समर्थ"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-orange-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
              <span>
                {language === 'en'
                  ? `Festivals & Panchang ${activeYear}`
                  : `सण, उत्सव, व्रत व पंचांग ${activeYear}`}
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">
              {t('festivalsSubtitle')}
            </p>
          </div>
        </div>

        {/* Filter Pills - Smooth horizontal scrolling without occupying half the screen */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {[
            { id: 'all', label: t('allFestivals') },
            { id: 'swami', label: t('swamiSpecialFilter') },
            { id: 'ekadashi', label: t('ekadashiFilter') },
            { id: 'sankashti', label: t('sankashtiFilter') },
            { id: 'pournima_amavasya', label: t('pournimaAmavasyaFilter') },
            { id: 'gurupushya', label: t('guruPushyaFilter') },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setActiveFilter(btn.id as FilterKey)}
              className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 whitespace-nowrap ${
                activeFilter === btn.id
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-orange-50/80 hover:bg-orange-100 text-orange-950 border border-orange-200/60'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-2">
        {filteredDays.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center text-xs text-slate-500 border border-orange-100">
            {t('noFestivalsFound')}
          </div>
        ) : (
          filteredDays.map(day => (
            <div
              key={day.date}
              onClick={() => onSelectDay(day)}
              className="cursor-pointer rounded-2xl bg-white p-3 sm:p-3.5 shadow-2xs border border-orange-100/90 hover:border-orange-300 transition-all active:scale-98"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Date Badge Column */}
                <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex flex-col items-center justify-center shrink-0">
                  <span className="text-sm font-black text-orange-950 leading-none">
                    {day.dayOfMonth}
                  </span>
                  <span className="text-[9px] font-bold text-orange-700 leading-none mt-0.5">
                    {getDayName(day.dayOfWeek, true)}
                  </span>
                  <span className="text-[8px] font-semibold text-slate-500 leading-none mt-0.5">
                    {getMonthName(day.month).slice(0, 3)}
                  </span>
                </div>

                {/* Details Column */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                      {day.tithi} ({day.paksha} {t('paksha')}) • {day.nakshatra}
                    </span>
                    {day.isSwamiSpecial && (
                      <span className="px-1.5 py-0.5 rounded-full bg-orange-600 text-white text-[8px] font-black shrink-0 whitespace-nowrap">
                        {language === 'mr' ? 'स्वामी विशेष' : 'Swami Special'}
                      </span>
                    )}
                    {day.isEkadashi && (
                      <span className="px-1.5 py-0.5 rounded-full bg-purple-600 text-white text-[8px] font-black shrink-0 whitespace-nowrap">
                        {language === 'mr' ? 'एकादशी' : 'Ekadashi'}
                      </span>
                    )}
                    {day.isSankashti && (
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[8px] font-black shrink-0 whitespace-nowrap">
                        {language === 'mr' ? 'संकष्टी' : 'Sankashti'}
                      </span>
                    )}
                  </div>

                  {/* Festival Titles */}
                  {day.festivals.length > 0 ? (
                    <div className="mt-1 space-y-0.5">
                      {day.festivals.map(f => (
                        <div key={f.id}>
                          <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                            {language === 'en' ? f.titleEn : f.title}
                          </h3>
                          {f.description && (
                            <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                              {f.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-1">
                      <p className="text-xs font-semibold text-slate-700 leading-snug">
                        {day.swamiGuidance || (language === 'mr' ? 'नित्य स्वामी सेवा व नामजप' : 'Daily Swami Seva & Chanting')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Chevron */}
                <div className="text-slate-400 shrink-0 pt-2">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
