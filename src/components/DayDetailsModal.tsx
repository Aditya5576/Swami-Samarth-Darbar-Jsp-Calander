import React, { useState, useEffect } from 'react';
import { DayData } from '../types/calendar';
import { useLanguage } from '../context/LanguageContext';
import {
  X,
  Sunrise,
  Sunset,
  Moon,
  Sparkles,
  BookOpen,
  CheckCircle,
  Save,
  Bell,
  Share2,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { calculateRahuKaal, formatSunriseSunset } from '../utils/calendarLogic';

interface DayDetailsModalProps {
  day: DayData | null;
  onClose: () => void;
  onSelectNityaSevaTab?: () => void;
}

export const DayDetailsModal: React.FC<DayDetailsModalProps> = ({
  day,
  onClose,
  onSelectNityaSevaTab,
}) => {
  const { language, t, formatDate, getDayName } = useLanguage();
  const [userNote, setUserNote] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (day) {
      const saved = localStorage.getItem(`swami_note_${day.date}`);
      setUserNote(saved || '');
      setIsSaved(false);
    }
  }, [day]);

  if (!day) return null;

  const handleSaveNote = () => {
    if (day) {
      localStorage.setItem(`swami_note_${day.date}`, userNote);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      const festText = day.festivals
        .map(f => (language === 'en' ? f.titleEn : f.title))
        .join(', ');
      navigator.share({
        title: `${t('appTitle')} - ${formatDate(day.date)}`,
        text: `📅 ${formatDate(day.date)} (${getDayName(day.dayOfWeek)})\n${t('tithi')}: ${day.tithi} (${day.paksha} ${t('paksha')})\n${t('nakshatra')}: ${day.nakshatra}\n${festText ? `${t('festivalsHeading')}: ${festText}\n` : ''}॥ श्री स्वामी समर्थ ॥`,
        url: window.location.href,
      }).catch(() => {});
    }
  };

  const pakshaLabel = language === 'en' ? (day.paksha === 'शुक्ल' ? 'Shukla' : 'Krishna') : day.paksha;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-details-title"
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl border border-orange-200/80 text-slate-800 flex flex-col">
        {/* Header Banner */}
        <div className={`p-4 sm:p-5 text-white relative ${
          day.isSwamiSpecial
            ? 'bg-gradient-to-r from-red-600 via-orange-600 to-amber-600'
            : day.isEkadashi
            ? 'bg-gradient-to-r from-amber-600 to-orange-600'
            : day.isSankashti
            ? 'bg-gradient-to-r from-rose-700 to-orange-700'
            : 'bg-gradient-to-r from-orange-600 to-amber-600'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl p-0.5 bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-400 ring-2 ring-white/60 shrink-0 shadow-sm overflow-hidden">
                <img
                  src="/pwa-192x192.png"
                  alt="श्री स्वामी समर्थ"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] sm:text-xs font-bold tracking-wide backdrop-blur-xs">
                    {getDayName(day.dayOfWeek)}
                  </span>
                  <span className="text-amber-100 text-[10px] sm:text-xs font-medium">
                    {day.marathiMonth} | {day.shakeYear}
                  </span>
                </div>
                <h2 id="day-details-title" className="text-lg sm:text-2xl font-black mt-0.5 text-white tracking-tight">
                  {formatDate(day.date)}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleShare}
                  aria-label="Share date details"
                  className="p-1.5 rounded-full bg-white/15 hover:bg-white/30 text-white transition"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                aria-label={t('close')}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Badges in Header */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 rounded-md bg-white/20 text-[11px] font-semibold text-white whitespace-nowrap">
              {t('tithi')}: {day.tithi} ({pakshaLabel} {t('paksha')})
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/20 text-[11px] font-semibold text-white whitespace-nowrap">
              {t('nakshatra')}: {day.nakshatra}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Panchang Timings Strip with Rahu Kaal */}
          {(() => {
            const rahuKaal = calculateRahuKaal(day.dayOfWeek, day.sunrise, day.sunset, language);
            return (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-orange-50/70 border border-orange-100 min-w-0">
                    <Sunrise className="w-4 h-4 text-orange-600 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-slate-500 font-medium leading-none">{t('sunrise')}</p>
                      <p className="font-bold text-slate-800 truncate whitespace-nowrap mt-1">
                        {formatSunriseSunset(day.sunrise, false, language)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-orange-50/70 border border-orange-100 min-w-0">
                    <Sunset className="w-4 h-4 text-amber-700 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-slate-500 font-medium leading-none">{t('sunset')}</p>
                      <p className="font-bold text-slate-800 truncate whitespace-nowrap mt-1">
                        {formatSunriseSunset(day.sunset, true, language)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50/70 border border-red-200 min-w-0">
                    <Clock className="w-4 h-4 text-red-600 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-red-700 font-bold leading-none">{t('rahuKaal')}</p>
                      <p className="font-black text-red-950 text-[11px] truncate whitespace-nowrap mt-1">{rahuKaal.start}</p>
                    </div>
                  </div>

                  {day.festivals.some(f => f.moonriseTime) ? (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 min-w-0">
                      <Moon className="w-4 h-4 text-rose-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-rose-700 font-medium leading-none">{t('moonriseTime')}</p>
                        <p className="font-bold text-rose-900 truncate whitespace-nowrap mt-1">
                          {day.festivals.find(f => f.moonriseTime)?.moonriseTime}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 min-w-0">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-slate-500 font-medium leading-none">{t('shubhDin')}</p>
                        <p className="font-bold text-slate-800 truncate whitespace-nowrap mt-1">{getDayName(day.dayOfWeek)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dedicated Real Vedic Rahu Kaal Timing Block */}
                <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/50 p-3.5 border border-amber-300 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Clock className="w-4 h-4 text-orange-700 shrink-0" />
                      <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-xs sm:text-sm text-orange-950 uppercase tracking-wide whitespace-nowrap">
                          {t('rahuKaal')}
                        </span>
                        <span className="text-[11px] font-semibold text-amber-900 truncate">
                          ({rahuKaal.periodName})
                        </span>
                      </div>
                    </div>
                    <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black border border-red-200 whitespace-nowrap shadow-2xs">
                      {t('rahuKaalStatus')}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between gap-2 flex-wrap pt-0.5">
                    <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-mono whitespace-nowrap">
                      {rahuKaal.formattedRange}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0 whitespace-nowrap">
                      ({language === 'mr' ? 'अचूक वैदिक पंचांग' : 'Exact Vedic Timing'})
                    </span>
                  </div>

                  <p className="text-[11px] text-amber-950/90 leading-relaxed font-medium bg-white/70 p-2.5 rounded-xl border border-amber-200/60">
                    <span className="font-bold text-orange-900">
                      {language === 'mr' ? '⚠️ शास्त्र नियम:' : '⚠️ Vedic Advice:'}
                    </span>{' '}
                    {language === 'mr' ? rahuKaal.guidanceMr : rahuKaal.guidanceEn}
                  </p>
                </div>
              </>
            );
          })()}

          {/* Festivals & Events Section */}
          {day.festivals.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-orange-950 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                {t('festivalsHeading')}
              </h3>
              <div className="space-y-2">
                {day.festivals.map(fest => (
                  <div
                    key={fest.id}
                    className={`p-3.5 rounded-2xl border ${
                      fest.category === 'swami'
                        ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-orange-300 shadow-xs'
                        : fest.category === 'ekadashi'
                        ? 'bg-amber-50/80 border-amber-200'
                        : fest.category === 'sankashti'
                        ? 'bg-rose-50/80 border-rose-200'
                        : 'bg-orange-50/40 border-orange-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm sm:text-base text-slate-900">
                        {language === 'en' ? fest.titleEn : fest.title}
                      </h4>
                      {fest.isMajor && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-orange-600 text-[10px] font-bold text-white">
                          {t('specialBadge')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      {fest.description}
                    </p>
                    {fest.sevaSuggestion && (
                      <div className="mt-2 flex items-start gap-1.5 rounded-xl bg-white/80 p-2 border border-orange-200/60 text-xs text-orange-900">
                        <BookOpen className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-orange-950">{language === 'en' ? 'Seva Advice:' : 'सेवा सूचना:'}</strong> {fest.sevaSuggestion}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Swami Samarth Seva Marg Daily Guidance */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50/60 to-orange-50/40 border border-orange-200/80">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-900">
              <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping" />
              <span>{t('sevaGuidance')}</span>
            </div>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              "{day.swamiGuidance}"
            </p>
            {onSelectNityaSevaTab && (
              <button
                onClick={() => {
                  onClose();
                  onSelectNityaSevaTab();
                }}
                className="mt-3 flex items-center gap-1.5 text-xs font-bold text-orange-700 hover:text-orange-800 bg-orange-100/70 hover:bg-orange-200/70 px-3 py-1.5 rounded-xl transition"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t('openNityaSeva')}</span>
              </button>
            )}
          </div>

          {/* Personal Seva Notes for this Day */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label htmlFor="day-note" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-slate-500" />
                <span>{t('personalNoteHeading')}</span>
              </label>
              {isSaved && (
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {t('saved')}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                id="day-note"
                type="text"
                value={userNote}
                onChange={e => setUserNote(e.target.value)}
                placeholder={t('personalNotePlaceholder')}
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button
                onClick={handleSaveNote}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 active:scale-95 transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{t('save')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="p-3 sm:p-4 border-t border-orange-100 bg-slate-50 rounded-b-3xl">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-bold text-sm shadow-sm transition"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
