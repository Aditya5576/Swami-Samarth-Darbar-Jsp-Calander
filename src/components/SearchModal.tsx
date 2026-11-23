import React, { useState, useMemo, useRef } from 'react';
import type { DayData } from '../types/calendar';
import { searchYear } from '../utils/calendarLogic';
import { useLanguage } from '../context/LanguageContext';
import { useDialogA11y } from '../hooks/useDialogA11y';
import { Search, X, ArrowRight, Info } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  currentYear?: number;
  onClose: () => void;
  onSelectDay: (day: DayData) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, currentYear = 2026, onClose, onSelectDay }) => {
  const { language, t, formatDate, getDayName } = useLanguage();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useDialogA11y(isOpen, onClose, inputRef);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchYear(query, currentYear);
  }, [query, currentYear]);

  if (!isOpen) return null;

  const isEstimatedYear = currentYear !== 2026;

  const popularKeywords = language === 'en'
    ? ['Prakat Din', 'Punyatithi', 'Gudi Padwa', 'Ashadhi Ekadashi', 'Guru Pournima', 'Ganesh Chaturthi', 'Dussehra', 'Lakshmi Pujan', 'Datta Jayanti', 'Sankashti', 'Guru Pushya']
    : ['प्रगट दिन', 'पुण्यतिथी', 'गुढीपाडवा', 'आषाढी एकादशी', 'गुरुपौर्णिमा', 'गणेश चतुर्थी', 'दसरा', 'लक्ष्मीपूजन', 'दत्त जयंती', 'संकष्टी चतुर्थी', 'गुरुपुष्य'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-xs pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-orange-100 flex flex-col max-h-[82dvh] overflow-hidden focus:outline-none"
      >
        <h2 id="search-modal-title" className="sr-only">
          {t('searchTitle')} ({currentYear})
        </h2>

        {/* Search Input Bar */}
        <div className="p-3 sm:p-4 border-b border-orange-100 flex items-center gap-2 shrink-0">
          <img
            src="/pwa-192x192.png"
            alt="श्री स्वामी समर्थ"
            className="w-7 h-7 rounded-lg object-cover ring-1 ring-orange-300 shrink-0 shadow-2xs"
          />
          <Search className="w-4 h-4 text-orange-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchPlaceholder')}
            className="flex-1 min-w-0 min-h-[44px] bg-transparent text-base font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={language === 'mr' ? 'शोध साफ करा' : 'Clear search'}
              className="min-w-[44px] min-h-[44px] rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center shrink-0 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition shrink-0 whitespace-nowrap"
          >
            {t('cancel')}
          </button>
        </div>

        {/* Estimated Panchang Notice for non-2026 years (AUD-01) */}
        {isEstimatedYear && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-200/80 flex items-start gap-2 text-[11px] font-semibold text-amber-950 shrink-0">
            <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <span>
              {language === 'mr'
                ? `${currentYear} चे पंचांग व सणांच्या तारखा अंदाजित आहेत. अचूक व्रतांसाठी स्थानिक पंचांग पहावे.`
                : `${currentYear} dates and tithis are astronomical estimates. Confirm exact vrat dates with local Panchang.`}
            </span>
          </div>
        )}

        {/* Single Scrollable Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Quick Suggestion Chips */}
          {!query && (
            <div className="p-4 bg-orange-50/40 border-b border-orange-100/60">
              <p className="text-xs font-bold text-slate-500 mb-2">{t('popularSearches')}</p>
              <div className="flex flex-wrap gap-1.5">
                {popularKeywords.map(keyword => (
                  <button
                    type="button"
                    key={keyword}
                    onClick={() => setQuery(keyword)}
                    className="min-h-[44px] px-3 py-1.5 rounded-xl bg-white hover:bg-orange-100 border border-orange-200/80 text-xs text-orange-950 font-medium transition active:scale-95 whitespace-nowrap"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results List */}
          <div className="p-3 sm:p-4 divide-y divide-orange-100/60">
            {query.trim() && results.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                {t('noSearchResults')}
              </div>
            ) : (
              results.map(day => (
                <button
                  type="button"
                  key={day.date}
                  onClick={() => {
                    onSelectDay(day);
                    onClose();
                  }}
                  className="w-full text-left py-2.5 px-2 hover:bg-orange-50/80 rounded-2xl cursor-pointer flex items-center justify-between gap-3 transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-nowrap overflow-hidden">
                      <span className="font-extrabold text-sm text-orange-950 whitespace-nowrap shrink-0">
                        {formatDate(day.date)}
                      </span>
                      <span className="text-xs text-slate-500 truncate whitespace-nowrap min-w-0">
                        ({getDayName(day.dayOfWeek)})
                      </span>
                      {day.isSwamiSpecial && (
                        <span className="px-1.5 py-0.5 rounded-md bg-orange-600 text-[10px] font-bold text-white whitespace-nowrap shrink-0">
                          {t('specialBadge')}
                        </span>
                      )}
                      {day.isEstimated && (
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold whitespace-nowrap shrink-0">
                          {language === 'mr' ? 'अंदाजित' : 'Estimated'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 truncate mt-0.5">
                      {t('tithi')}: {day.tithi} • {t('nakshatra')}: {day.nakshatra}
                      {day.festivals.length > 0 &&
                        ` • ${day.festivals.map(f => (language === 'en' ? f.titleEn : f.title)).join(', ')}`}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-orange-500 shrink-0" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
