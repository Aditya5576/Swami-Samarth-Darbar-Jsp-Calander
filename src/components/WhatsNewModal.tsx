import React from 'react';
import { Check, Sparkles, Wrench, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDialogA11y } from '../hooks/useDialogA11y';
import { LATEST_RELEASE, type AppReleaseNote } from '../data/releaseNotes';

interface WhatsNewModalProps {
  isOpen: boolean;
  onAcknowledge: () => void;
  release?: AppReleaseNote;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({
  isOpen,
  onAcknowledge,
  release = LATEST_RELEASE,
}) => {
  const { language, t } = useLanguage();
  const dialogRef = useDialogA11y(isOpen, onAcknowledge);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="whats-new-title"
      onClick={onAcknowledge}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-xs p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] sm:p-4 animate-in fade-in duration-150"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm max-h-[82dvh] rounded-3xl bg-white shadow-2xl border border-orange-200/90 text-slate-800 flex flex-col overflow-hidden focus:outline-none"
      >
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 px-4 py-3.5 text-white flex items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/pwa-192x192.png"
              alt="श्री स्वामी समर्थ"
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-amber-200/80 shrink-0 shadow-xs"
            />
            <div className="min-w-0">
              <h2
                id="whats-new-title"
                className="text-sm sm:text-base font-black text-white leading-tight truncate"
              >
                {t('whatsNewTitle')}
              </h2>
              <p className="text-[11px] text-amber-100 font-semibold leading-tight mt-0.5 tabular-nums truncate">
                v{release.version} · {language === 'mr' ? release.dateMr : release.dateEn}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onAcknowledge}
            aria-label={t('close')}
            className="min-w-[44px] min-h-[44px] rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center shrink-0 transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Concise Change List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            {language === 'mr' ? release.summaryMr : release.summaryEn}
          </p>

          <ul className="divide-y divide-orange-100/80">
            {release.items.map(item => {
              const isUpgrade = item.kind === 'upgrade';
              return (
                <li key={item.id} className="py-2.5 first:pt-1 last:pb-1 flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isUpgrade
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {isUpgrade ? (
                      <Sparkles className="w-3.5 h-3.5" />
                    ) : (
                      <Wrench className="w-3.5 h-3.5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span
                      className={`text-[11px] font-extrabold block leading-none mb-1 ${
                        isUpgrade ? 'text-orange-700' : 'text-emerald-700'
                      }`}
                    >
                      {isUpgrade ? t('whatsNewUpgradeLabel') : t('whatsNewFixLabel')}
                    </span>
                    <p className="text-xs sm:text-[13px] text-slate-800 font-medium leading-snug">
                      {language === 'mr' ? item.mr : item.en}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Single Prominent OK Footer CTA */}
        <div className="px-4 py-3 border-t border-orange-100 bg-amber-50/60 shrink-0">
          <button
            type="button"
            onClick={onAcknowledge}
            className="w-full min-h-[46px] py-2.5 px-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 active:scale-[0.98] text-white font-black text-sm shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5] shrink-0" />
            <span>{t('whatsNewOkBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
