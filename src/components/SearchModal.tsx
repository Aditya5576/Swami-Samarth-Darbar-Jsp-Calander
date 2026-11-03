import React, { useState, useMemo } from 'react';
import { DayData } from '../types/calendar';
import { searchYear } from '../utils/calendarLogic';
import { useLanguage } from '../context/LanguageContext';
import { Search, X, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  currentYear?: number;
  onClose: () => void;
  onSelectDay: (day: DayData) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, currentYear = 2026, onClose, onSelectDay }) => {
  const { language, t, formatDate, getDayName } = useLanguage();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchYear(query, currentYear);
  }, [query, currentYear]);

  if (!isOpen) return null;

  const popularKeywords = language === 'en'
    ? ['Prakat Din', 'Punyatithi', 'Gudi Padwa', 'Ashadhi Ekadashi', 'Guru Pournima', 'Ganesh Chaturthi', 'Dussehra', 'Lakshmi Pujan', 'Datta Jayanti', 'Sankashti', 'Guru Pushya']
    : ['प्रगट दिन', 'पुण्यतिथी', 'गुढीपाडवा', 'आषाढी एकादशी', 'गुरुपौर्णिमा', 'गणेश चतुर्थी', 'दसरा', 'लक्ष्मीपूजन', 'दत्त जयंती', 'संकष्टी चतुर्थी', 'गुरुपुष्य'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 pt-16 sm:pt-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
    >
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-orange-100 flex flex-col max-h-[80vh] overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-3.5 sm:p-4 border-b border-orange-100 flex items-center gap-2.5">
          <Search className="w-5 h-5 text-orange-600 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            autoFocus
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
          >
            {t('cancel')}
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        {!query && (
          <div className="p-4 bg-orange-50/40 border-b border-orange-100/60">
            <p className="text-xs font-bold text-slate-500 mb-2">{t('popularSearches')}</p>
            <div className="flex flex-wrap gap-1.5">
              {popularKeywords.map(keyword => (
                <button
                  key={keyword}
                  onClick={() => setQuery(keyword)}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-orange-100 border border-orange-200/80 text-xs text-orange-950 font-medium transition active:scale-95"
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 divide-y divide-orange-100/60">
          {query.trim() && results.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              {t('noSearchResults')}
            </div>
          ) : (
            results.map(day => (
              <div
                key={day.date}
                onClick={() => {
                  onSelectDay(day);
                  onClose();
                }}
                className="py-2.5 px-2 hover:bg-orange-50/80 rounded-2xl cursor-pointer flex items-center justify-between gap-3 transition"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-orange-950">
                      {formatDate(day.date)}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({getDayName(day.dayOfWeek)})
                    </span>
                    {day.isSwamiSpecial && (
                      <span className="px-1.5 py-0.2 rounded-md bg-orange-600 text-[10px] font-bold text-white">
                        {t('specialBadge')}
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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
