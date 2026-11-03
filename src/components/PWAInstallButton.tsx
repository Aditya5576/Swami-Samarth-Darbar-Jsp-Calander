import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useLanguage } from '../context/LanguageContext';
import { Download, Share2, PlusSquare, X, Smartphone, CheckCircle2 } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { language, t } = useLanguage();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // If already installed and running as standalone, show verified badge
  if (isInstalled) {
    return (
      <div
        className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-xl bg-emerald-500/15 text-emerald-700 text-xs font-semibold border border-emerald-500/30"
        title={t('appInstalled')}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span className="hidden sm:inline text-[11px]">{t('appInstalled')}</span>
      </div>
    );
  }

  // Chromium / Android / Edge direct install
  if (isInstallable) {
    return (
      <button
        onClick={install}
        aria-label={t('installAppPWA')}
        title={t('installAppPWA')}
        className={`flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 font-bold text-white shadow-sm shadow-orange-500/25 hover:from-orange-700 hover:to-amber-700 active:scale-95 transition-all duration-150 ${
          compact ? 'p-1.5 sm:px-2.5 sm:py-1.5 text-xs' : 'px-4 py-2 text-sm'
        }`}
      >
        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 animate-bounce" />
        <span className={compact ? 'hidden sm:inline' : 'inline'}>{t('installApp')}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          aria-label={t('saveOnIOS')}
          title={t('saveOnIOS')}
          className={`flex items-center justify-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-500/10 text-orange-100 font-bold hover:bg-orange-500/20 active:scale-95 transition-all duration-150 ${
            compact ? 'p-1.5 sm:px-2.5 sm:py-1.5 text-xs' : 'px-3 py-2 text-sm'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" />
          <span className={compact ? 'hidden sm:inline' : 'inline'}>{t('saveOnIOS')}</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-modal-title"
          >
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-orange-100 text-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-orange-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                    iOS
                  </div>
                  <h3 id="ios-modal-title" className="text-base font-bold text-orange-950">
                    {language === 'en' ? 'Install on iPhone / iPad' : 'iPhone / iPad वर ॲप इन्स्टॉल करा'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-full p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  aria-label={t('close')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-sm">
                <div className="flex items-start gap-3 rounded-2xl bg-amber-50/80 p-3.5 border border-amber-200/60">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-600 text-white font-bold text-xs">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {language === 'en' ? 'Tap the Share button in Safari' : 'सफारी (Safari) चा शेअर पर्याय दाबा'}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {language === 'en' ? (
                        <>Tap the <Share2 className="w-3.5 h-3.5 inline mx-1 text-blue-600" /> <strong>Share</strong> button on the Safari bottom bar.</>
                      ) : (
                        <>स्क्रीनच्या खालील बारमधील <Share2 className="w-3.5 h-3.5 inline mx-1 text-blue-600" /> <strong>Share</strong> बटणावर क्लिक करा.</>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-amber-50/80 p-3.5 border border-amber-200/60">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-600 text-white font-bold text-xs">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {language === 'en' ? "Select 'Add to Home Screen'" : "'Add to Home Screen' निवडा"}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {language === 'en' ? (
                        <>Scroll down and tap <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-slate-700" /> <strong>'Add to Home Screen'</strong>.</>
                      ) : (
                        <>खाली स्क्रोल करून <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-slate-700" /> <strong>'Add to Home Screen'</strong> वर टॅप करा.</>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-emerald-50/80 p-3.5 border border-emerald-200/60">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {language === 'en' ? 'Done! (Full Screen Offline App)' : 'पूर्ण झाले! (Full App View)'}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {language === 'en'
                        ? 'The app will now launch directly from your home screen and works offline without internet.'
                        : 'आता हे ॲप तुमच्या फोनच्या स्क्रीनवर कोणत्याही सामान्य ॲपप्रमाणे इंटरनेटशिवायही चालेल.'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 py-3 text-sm font-bold text-white shadow-md shadow-orange-600/20 hover:from-orange-700 hover:to-amber-700 active:scale-98 transition"
              >
                {t('close')}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for desktop Chrome/Firefox where prompt may be ambient
  return (
    <>
      <button
        onClick={() => setShowHelpModal(true)}
        aria-label={t('installApp')}
        title={t('installApp')}
        className={`flex items-center justify-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-500/10 text-orange-100 font-bold hover:bg-orange-500/20 active:scale-95 transition-all duration-150 ${
          compact ? 'p-1.5 sm:px-2.5 sm:py-1.5 text-xs' : 'px-3 py-2 text-sm'
        }`}
      >
        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
        <span className={compact ? 'hidden sm:inline' : 'inline'}>{t('installApp')}</span>
      </button>

      {showHelpModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-orange-100 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-orange-100">
              <h3 className="text-base font-bold text-orange-950">
                {language === 'en' ? 'Install on Mobile & Computer' : 'मोबाईल व कॉम्प्युटरवर इन्स्टॉल करा'}
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="rounded-full p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                aria-label={t('close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-600">
              <p>
                <strong>Android / Chrome:</strong> {language === 'en' ? 'Tap browser menu (⋮) and select "Install App" or "Add to Home screen".' : 'ब्राउझरच्या मेनू (⋮) वर टॅप करा आणि "Install App" किंवा "Add to Home screen" निवडा.'}
              </p>
              <p>
                <strong>iPhone (iOS):</strong> {language === 'en' ? 'Tap the Share icon at the bottom of Safari and select "Add to Home Screen".' : 'सफारीच्या खालील Share बटणावर टॅप करून "Add to Home Screen" निवडा.'}
              </p>
              <p className="text-orange-800 font-semibold text-xs bg-orange-50 p-2.5 rounded-xl border border-orange-200/50">
                {t('offlineDesc')}
              </p>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="mt-5 w-full rounded-2xl bg-orange-600 py-2.5 text-sm font-bold text-white hover:bg-orange-700 transition"
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
