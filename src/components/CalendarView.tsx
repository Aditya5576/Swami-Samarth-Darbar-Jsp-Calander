import React, { useState } from 'react';
import { DayData } from '../types/calendar';
import { getMonthDays, getMonthGrid, getMonthMeta, getTodayDateInfo, SUPPORTED_YEARS } from '../utils/calendarLogic';
import { useLanguage } from '../context/LanguageContext';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Calendar as CalendarIcon,
  List,
  Sunrise,
  Sunset,
  Moon,
  BookOpen,
} from 'lucide-react';

interface CalendarViewProps {
  currentYear: number;
  currentMonth: number; // 1-12
  onChangeYear: (y: number) => void;
  onChangeMonth: (m: number) => void;
  onSelectDay: (day: DayData) => void;
  selectedDateStr?: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentYear,
  currentMonth,
  onChangeYear,
  onChangeMonth,
  onSelectDay,
  selectedDateStr,
}) => {
  const { language, t, getDayName, getMonthName, formatDate } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [listFilter, setListFilter] = useState<'all' | 'festivals' | 'vrats'>('all');

  const meta = getMonthMeta(currentMonth, currentYear);
  const grid = getMonthGrid(currentMonth, currentYear);
  const todayInfo = getTodayDateInfo();

  // Active highlighted day in preview card
  const daysInMonth = getMonthDays(currentMonth, currentYear);
  const activePreviewDay =
    daysInMonth.find(d => d.date === selectedDateStr) ||
    daysInMonth.find(d => d.date === todayInfo.dateStr) ||
    daysInMonth[0];

  const handlePrevMonth = () => {
    if (currentMonth > 1) {
      onChangeMonth(currentMonth - 1);
    } else {
      if (currentYear > 2025) {
        onChangeYear(currentYear - 1);
        onChangeMonth(12);
      } else {
        onChangeMonth(12);
      }
    }
  };

  const handleNextMonth = () => {
    if (currentMonth < 12) {
      onChangeMonth(currentMonth + 1);
    } else {
      if (currentYear < 2030) {
        onChangeYear(currentYear + 1);
        onChangeMonth(1);
      } else {
        onChangeMonth(1);
      }
    }
  };

  // Filtered days for the readable List / Agenda view
  const filteredListDays = daysInMonth.filter(d => {
    if (listFilter === 'all') return true;
    if (listFilter === 'festivals') return d.festivals.length > 0 || d.isSwamiSpecial;
    if (listFilter === 'vrats') return d.isEkadashi || d.isSankashti || d.isPournima || d.isAmavasya;
    return true;
  });

  return (
    <div className="space-y-3 sm:space-y-4 max-w-full">
      {/* 1. Month & Year Navigation Card */}
      <div className="rounded-2xl sm:rounded-3xl bg-white p-3 sm:p-4 shadow-xs border border-orange-200">
        {/* Month Selector with Large Clear Header */}
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          <button
            onClick={handlePrevMonth}
            aria-label="मागील महिना (Previous Month)"
            className="p-2 sm:p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 active:scale-90 text-orange-900 border border-orange-200 transition shadow-2xs"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center min-w-0 flex-1 px-1">
            {/* Month & Year Title with Compact Selectors */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <div className="relative inline-block">
                <select
                  value={currentMonth}
                  onChange={e => onChangeMonth(parseInt(e.target.value, 10))}
                  className="appearance-none cursor-pointer bg-transparent text-lg sm:text-2xl font-black text-orange-950 pr-5 py-0.5 text-center focus:outline-none hover:text-orange-700"
                  aria-label="महिना निवडा"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(mNum => (
                    <option key={mNum} value={mNum}>
                      {getMonthName(mNum)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-orange-600">
                  <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>

              {/* Year Dropdown Badge */}
              <div className="relative inline-block">
                <select
                  value={currentYear}
                  onChange={e => onChangeYear(parseInt(e.target.value, 10))}
                  className="appearance-none cursor-pointer bg-orange-100 hover:bg-orange-200 text-orange-950 font-black text-xs sm:text-sm px-2.5 py-1 rounded-lg border border-orange-300 pr-5 focus:outline-none"
                  aria-label="वर्ष निवडा"
                >
                  {SUPPORTED_YEARS.map(yr => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center text-orange-800">
                  <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            <p className="text-[11px] sm:text-xs font-bold text-amber-900 mt-0.5 truncate">
              {meta.samvatsar} • {meta.marathiSeason}
            </p>
          </div>

          <button
            onClick={handleNextMonth}
            aria-label="पुढील महिना (Next Month)"
            className="p-2 sm:p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 active:scale-90 text-orange-900 border border-orange-200 transition shadow-2xs"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode Toggle Switch (Grid vs. Easy List View) */}
        <div className="mt-3 pt-2.5 border-t border-orange-100 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-slate-500 hidden xs:inline">
            {language === 'mr' ? 'दृश्य प्रकार:' : 'View Mode:'}
          </span>
          <div className="grid grid-cols-2 gap-1.5 w-full xs:w-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-orange-50 text-orange-950 border border-orange-200 hover:bg-orange-100'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>{language === 'mr' ? 'कॅलेंडर ग्रिड' : 'Month Grid'}</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-orange-50 text-orange-950 border border-orange-200 hover:bg-orange-100'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{language === 'mr' ? 'सविस्तर यादी' : 'Agenda List'}</span>
            </button>
          </div>
        </div>

        {/* Month Quote Banner */}
        <div className="mt-2.5 rounded-xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-2 text-center border border-amber-200/80">
          <p className="text-[11px] font-semibold text-orange-950 flex items-center justify-center gap-1.5 leading-snug">
            <Sparkles className="w-3 h-3 text-orange-600 shrink-0" />
            <span className="line-clamp-1">"{meta.headerQuote}"</span>
          </p>
        </div>
      </div>

      {/* VIEW MODE 1: CALENDAR GRID */}
      {viewMode === 'grid' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="rounded-2xl sm:rounded-3xl bg-white p-2 sm:p-3.5 shadow-xs border border-orange-200 overflow-hidden">
            {/* Days of Week Header with high contrast */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 pb-2 border-b border-orange-200 text-center font-extrabold text-[11px] sm:text-xs">
              {[0, 1, 2, 3, 4, 5, 6].map(idx => (
                <div
                  key={idx}
                  className={`py-1 rounded-lg leading-tight ${
                    idx === 0
                      ? 'text-red-700 bg-red-50/80 font-black'
                      : idx === 4
                      ? 'text-orange-900 bg-amber-100/70 font-black'
                      : 'text-slate-700 bg-slate-50'
                  }`}
                >
                  <span className="block text-[11px] sm:text-xs">{getDayName(idx, true)}</span>
                  {idx === 4 && (
                    <span className="hidden sm:block text-[8px] text-orange-700 font-bold">
                      {language === 'mr' ? 'स्वामी वार' : 'Swami Day'}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* 7-column Calendar Cells - Clean, Spacious, Highly Readable */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-2">
              {grid.map((day, idx) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[58px] sm:min-h-[72px] rounded-xl bg-slate-50/50 border border-dashed border-slate-200"
                    />
                  );
                }

                const isToday = day.date === todayInfo.dateStr;
                const isSelected = selectedDateStr === day.date;
                const hasSavedNote =
                  typeof window !== 'undefined' &&
                  !!localStorage.getItem(`swami_note_${day.date}`);

                // Base cell styles with high contrast
                let cellBg = 'bg-white hover:bg-orange-50/80 border-slate-200';
                let dateColor = day.dayOfWeek === 0 ? 'text-red-600' : 'text-slate-800';

                if (day.isSwamiSpecial) {
                  cellBg = 'bg-gradient-to-br from-amber-100 via-orange-100 to-amber-50 border-orange-400 ring-1 ring-orange-300';
                  dateColor = 'text-orange-950 font-black';
                } else if (day.isEkadashi) {
                  cellBg = 'bg-purple-50/90 border-purple-300';
                  dateColor = 'text-purple-950 font-bold';
                } else if (day.isSankashti) {
                  cellBg = 'bg-rose-50/90 border-rose-300';
                  dateColor = 'text-rose-950 font-bold';
                } else if (day.isPournima) {
                  cellBg = 'bg-amber-50/90 border-amber-300';
                  dateColor = 'text-amber-950 font-bold';
                } else if (day.isAmavasya) {
                  cellBg = 'bg-slate-100/90 border-slate-300';
                  dateColor = 'text-slate-900 font-bold';
                }

                // Today & Selected highlights
                if (isToday) {
                  cellBg = `${cellBg} ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/50`;
                }
                if (isSelected) {
                  cellBg = 'bg-orange-100 border-orange-600 ring-2 ring-orange-500 shadow-xs';
                }

                // Determine single best label to show in the cell (Clean & Non-cluttered)
                let cellLabel = '';
                let cellLabelStyle = 'text-slate-600 font-semibold';

                if (day.festivals.length > 0) {
                  // Festival: show clean short festival title
                  const festTitle = language === 'en' ? day.festivals[0].titleEn : day.festivals[0].title;
                  cellLabel = festTitle.split('(')[0].trim();
                  cellLabelStyle = 'text-orange-950 font-extrabold bg-orange-100/90 px-1 rounded';
                } else if (day.isEkadashi) {
                  cellLabel = language === 'mr' ? 'एकादशी' : 'Ekadashi';
                  cellLabelStyle = 'text-purple-950 font-bold bg-purple-100/90 px-1 rounded';
                } else if (day.isSankashti) {
                  cellLabel = language === 'mr' ? 'संकष्टी' : 'Sankashti';
                  cellLabelStyle = 'text-rose-950 font-bold bg-rose-100/90 px-1 rounded';
                } else if (day.isPournima) {
                  cellLabel = language === 'mr' ? 'पौर्णिमा' : 'Pournima';
                  cellLabelStyle = 'text-amber-950 font-bold bg-amber-100 px-1 rounded';
                } else if (day.isAmavasya) {
                  cellLabel = language === 'mr' ? 'अमावास्या' : 'Amavasya';
                  cellLabelStyle = 'text-slate-900 font-bold bg-slate-200 px-1 rounded';
                } else {
                  // Normal day: show full tithi cleanly (No cryptic abbreviations!)
                  cellLabel = day.tithi;
                  cellLabelStyle = 'text-slate-500 font-medium';
                }

                return (
                  <button
                    key={day.date}
                    onClick={() => onSelectDay(day)}
                    aria-label={`${day.dayOfMonth} ${getMonthName(meta.monthNumber)}, ${day.tithi}`}
                    className={`relative flex flex-col justify-between p-1 sm:p-1.5 min-h-[58px] sm:min-h-[72px] rounded-xl border text-left transition-all active:scale-95 overflow-hidden shadow-2xs ${cellBg}`}
                  >
                    {/* Top Row: Date Number & Auspicious Indicator */}
                    <div className="flex items-center justify-between w-full leading-none">
                      <span className={`text-xs sm:text-base font-black ${isToday ? 'text-emerald-700' : dateColor}`}>
                        {day.dayOfMonth}
                      </span>

                      {/* Auspicious Icons */}
                      <div className="flex items-center gap-0.5 shrink-0">
                        {day.isSwamiSpecial && (
                          <span className="w-3.5 h-3.5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[8px] font-black" title="स्वामी विशेष">
                            ॐ
                          </span>
                        )}
                        {day.isPournima && (
                          <span className="text-[10px] leading-none" title="पौर्णिमा">🌕</span>
                        )}
                        {day.isAmavasya && (
                          <span className="text-[10px] leading-none" title="अमावास्या">🌑</span>
                        )}
                        {day.festivals.length > 0 && !day.isSwamiSpecial && !day.isPournima && !day.isAmavasya && (
                          <span className="w-2 h-2 rounded-full bg-orange-600" title="सण / उत्सव" />
                        )}
                        {hasSavedNote && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" title="नोंद" />
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: High-Contrast Readable Tag */}
                    <div className="w-full mt-auto pt-0.5">
                      <p className={`text-[8px] sm:text-[9.5px] truncate leading-tight ${cellLabelStyle}`} title={cellLabel}>
                        {cellLabel}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Prominent Selected Day Panchang Card (Always Visible & Crystal Clear!) */}
          {activePreviewDay && (
            <div className="rounded-2xl sm:rounded-3xl bg-white p-3.5 sm:p-4 shadow-sm border border-orange-200 space-y-2.5">
              <div className="flex items-center justify-between border-b border-orange-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex flex-col items-center justify-center font-black shrink-0 shadow-2xs">
                    <span className="text-base leading-none">{activePreviewDay.dayOfMonth}</span>
                    <span className="text-[8px] font-bold leading-none mt-0.5">
                      {getDayName(activePreviewDay.dayOfWeek, true)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-950 leading-tight">
                      {formatDate(activePreviewDay.date)} ({getDayName(activePreviewDay.dayOfWeek)})
                    </h3>
                    <p className="text-xs font-bold text-orange-900 mt-0.5">
                      {activePreviewDay.tithi} ({activePreviewDay.paksha} पक्ष) • {meta.marathiName}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onSelectDay(activePreviewDay)}
                  className="px-2.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition active:scale-95"
                >
                  <span>{t('viewDetails')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Major Festivals on this day */}
              {activePreviewDay.festivals.length > 0 && (
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-300">
                  <span className="text-[10px] font-black uppercase text-orange-900 tracking-wider block mb-0.5">
                    🪔 {language === 'mr' ? 'सण व उत्सव:' : 'Festivals & Occasions:'}
                  </span>
                  <div className="space-y-1">
                    {activePreviewDay.festivals.map(f => (
                      <div key={f.id}>
                        <p className="text-xs sm:text-sm font-black text-orange-950">
                          {language === 'en' ? f.titleEn : f.title}
                        </p>
                        {f.description && (
                          <p className="text-[11px] text-slate-700 mt-0.5 leading-snug">
                            {f.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Day Metrics Strip */}
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <div className="p-2 rounded-xl bg-orange-50/70 border border-orange-100 flex items-center gap-1.5">
                  <Sunrise className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-500 font-medium leading-none">{t('sunrise')}</p>
                    <p className="font-bold text-slate-900 mt-0.5 text-[11px]">{activePreviewDay.sunrise}</p>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-orange-50/70 border border-orange-100 flex items-center gap-1.5">
                  <Sunset className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-500 font-medium leading-none">{t('sunset')}</p>
                    <p className="font-bold text-slate-900 mt-0.5 text-[11px]">{activePreviewDay.sunset}</p>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-orange-50/70 border border-orange-100 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-500 font-medium leading-none">{t('nakshatra')}</p>
                    <p className="font-bold text-slate-900 mt-0.5 text-[11px] truncate">{activePreviewDay.nakshatra}</p>
                  </div>
                </div>
              </div>

              {/* Swami Seva Advice */}
              <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-slate-800 leading-relaxed">
                <strong className="text-orange-950 font-bold block mb-0.5">
                  ✨ {t('sevaGuidance')}:
                </strong>
                {activePreviewDay.swamiGuidance}
              </div>
            </div>
          )}

          {/* 3. Clean Legend Bar */}
          <div className="rounded-2xl bg-white p-2.5 sm:p-3 shadow-xs border border-orange-100">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-[10px] sm:text-xs font-bold text-slate-700">
              <div className="flex items-center gap-1.5 bg-emerald-50 p-1.5 rounded-xl border border-emerald-200">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-1 ring-emerald-300 shrink-0" />
                <span className="truncate text-emerald-950">{t('legendToday')}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-orange-50 p-1.5 rounded-xl border border-orange-200">
                <span className="w-3 h-3 rounded-full bg-orange-600 text-white flex items-center justify-center text-[7px] font-black shrink-0">
                  ॐ
                </span>
                <span className="truncate text-orange-950">{t('legendSwami')}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-purple-50 p-1.5 rounded-xl border border-purple-200">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                <span className="truncate text-purple-950">{t('legendEkadashi')}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-rose-50 p-1.5 rounded-xl border border-rose-200">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" />
                <span className="truncate text-rose-950">{t('legendSankashti')}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-amber-50 p-1.5 rounded-xl border border-amber-200">
                <span className="text-[11px] shrink-0 leading-none">🌕</span>
                <span className="truncate text-amber-950">{t('legendPournima')}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-300">
                <span className="text-[11px] shrink-0 leading-none">🌑</span>
                <span className="truncate text-slate-900">{t('legendAmavasya')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: MONTHLY LIST / AGENDA VIEW (Super Easy to Read!) */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {/* Filter Pills for List View */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            {[
              { id: 'all', label: language === 'mr' ? 'सर्व दिवस (३० दिवस)' : 'All Days' },
              { id: 'festivals', label: language === 'mr' ? '🪔 सण व उत्सव' : 'Festivals' },
              { id: 'vrats', label: language === 'mr' ? '🟣 एकादशी व व्रते' : 'Vrats & Fasting' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setListFilter(f.id as any)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  listFilter === f.id
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white text-orange-950 border border-orange-200 hover:bg-orange-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Scrollable Day-by-Day Cards */}
          <div className="space-y-2">
            {filteredListDays.map(d => {
              const isToday = d.date === todayInfo.dateStr;
              return (
                <div
                  key={d.date}
                  onClick={() => onSelectDay(d)}
                  className={`cursor-pointer rounded-2xl bg-white p-3 sm:p-3.5 shadow-2xs border transition-all active:scale-98 ${
                    isToday
                      ? 'border-emerald-400 bg-emerald-50/30 ring-2 ring-emerald-500/50'
                      : d.isSwamiSpecial
                      ? 'border-orange-300 bg-orange-50/40'
                      : d.festivals.length > 0
                      ? 'border-amber-200 bg-amber-50/30'
                      : 'border-orange-100 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Date Block */}
                    <div
                      className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border shadow-2xs ${
                        isToday
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : d.dayOfWeek === 0
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : d.isSwamiSpecial
                          ? 'bg-orange-600 text-white border-orange-700'
                          : 'bg-orange-50 text-orange-950 border-orange-200'
                      }`}
                    >
                      <span className="text-base font-black leading-none">{d.dayOfMonth}</span>
                      <span className="text-[9px] font-bold leading-none mt-0.5">
                        {getDayName(d.dayOfWeek, true)}
                      </span>
                    </div>

                    {/* Day Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">
                          {d.tithi} ({d.paksha} पक्ष)
                        </span>
                        {isToday && (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[8px] font-black uppercase">
                            {t('today')}
                          </span>
                        )}
                        {d.isSwamiSpecial && (
                          <span className="px-1.5 py-0.5 rounded-md bg-orange-600 text-white text-[8px] font-black">
                            स्वामी विशेष
                          </span>
                        )}
                        {d.isEkadashi && (
                          <span className="px-1.5 py-0.5 rounded-md bg-purple-600 text-white text-[8px] font-black">
                            एकादशी
                          </span>
                        )}
                        {d.isSankashti && (
                          <span className="px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[8px] font-black">
                            संकष्टी
                          </span>
                        )}
                        {d.isPournima && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-amber-950 text-[8px] font-black">
                            पौर्णिमा
                          </span>
                        )}
                        {d.isAmavasya && (
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-900 text-white text-[8px] font-black">
                            अमावास्या
                          </span>
                        )}
                      </div>

                      {/* Festivals on this date */}
                      {d.festivals.length > 0 ? (
                        <div className="mt-1 space-y-0.5">
                          {d.festivals.map(fest => (
                            <p key={fest.id} className="text-xs sm:text-sm font-black text-orange-950">
                              🪔 {language === 'en' ? fest.titleEn : fest.title}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                          {d.swamiGuidance}
                        </p>
                      )}

                      <div className="mt-1.5 flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                        <span>नक्षत्र: {d.nakshatra}</span>
                        <span>•</span>
                        <span>सूर्योदय: {d.sunrise}</span>
                        <span>•</span>
                        <span>सूर्यास्त: {d.sunset}</span>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-orange-600 shrink-0 mt-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
