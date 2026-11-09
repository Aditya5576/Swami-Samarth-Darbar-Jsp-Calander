import React, { useState, useEffect, useRef } from 'react';
import { NITYA_SEVA_DATA } from '../data/calendar2026Data';
import { templeSound } from '../utils/audioChime';
import { useLanguage } from '../context/LanguageContext';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Award,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Play,
  Pause,
  ExternalLink,
  Music,
} from 'lucide-react';

export const NityaSevaView: React.FC = () => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'japa' | 'tarak_mantra' | 'aarti' | 'agnihotra' | 'atharvashirsha'>('japa');

  // Japa Mala State
  const [japaCount, setJapaCount] = useState(0);
  const [totalMalas, setTotalMalas] = useState(0);
  const [chantVoiceMode, setChantVoiceMode] = useState<'voice' | 'bell' | 'mute'>('voice');
  const [showCelebration, setShowCelebration] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  // Tarak Mantra YouTube Audio/Song Player State
  const [isPlayingTarak, setIsPlayingTarak] = useState(false);
  const tarakIframeRef = useRef<HTMLIFrameElement>(null);

  const handleToggleTarakSong = () => {
    if (!tarakIframeRef.current || !tarakIframeRef.current.contentWindow) return;
    if (!isPlayingTarak) {
      tarakIframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
        '*'
      );
      setIsPlayingTarak(true);
    } else {
      tarakIframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
        '*'
      );
      setIsPlayingTarak(false);
    }
  };

  useEffect(() => {
    const savedMalas = localStorage.getItem('swami_total_malas');
    if (savedMalas) {
      setTotalMalas(parseInt(savedMalas, 10));
    }
    const savedCount = localStorage.getItem('swami_current_japa_count');
    if (savedCount) {
      setJapaCount(parseInt(savedCount, 10) || 0);
    }
    // Eagerly pre-decode chant audio buffer for instant zero-latency tapping
    templeSound.preloadVoiceBuffer();
  }, []);

  const handleBeadClick = () => {
    if (chantVoiceMode !== 'mute') {
      templeSound.playSwamiChant(chantVoiceMode);
    }

    const nextCount = japaCount + 1;
    if (nextCount >= 108) {
      setJapaCount(0);
      localStorage.setItem('swami_current_japa_count', '0');
      const newTotal = totalMalas + 1;
      setTotalMalas(newTotal);
      localStorage.setItem('swami_total_malas', String(newTotal));
      setShowCelebration(true);
      if (chantVoiceMode !== 'mute') {
        templeSound.playCompletionChime();
      }
      setTimeout(() => setShowCelebration(false), 4500);
    } else {
      setJapaCount(nextCount);
      localStorage.setItem('swami_current_japa_count', String(nextCount));
    }
  };

  const handleExecuteReset = (resetAll = false) => {
    setJapaCount(0);
    localStorage.setItem('swami_current_japa_count', '0');
    if (resetAll) {
      setTotalMalas(0);
      localStorage.setItem('swami_total_malas', '0');
    }
    setShowResetConfirm(false);
    setResetFeedback(
      language === 'mr'
        ? resetAll
          ? 'जपमाळ व सर्व माळा रिसेट झाल्या!'
          : 'जप संख्या ० वर रिसेट झाली!'
        : resetAll
        ? 'Japa count and all malas reset to 0!'
        : 'Japa count reset to 0!'
    );
    if (chantVoiceMode !== 'mute') {
      templeSound.playBell(520, 0.3);
    }
    setTimeout(() => setResetFeedback(null), 3000);
  };

  const progressPercentage = Math.round((japaCount / 108) * 100);

  const selectedSeva = NITYA_SEVA_DATA.find(item => {
    if (activeTab === 'tarak_mantra') return item.category === 'tarak_mantra';
    if (activeTab === 'aarti') return item.category === 'aarti';
    if (activeTab === 'agnihotra') return item.category === 'agnihotra';
    if (activeTab === 'atharvashirsha') return item.id === 'ganpati-atharvashirsha';
    return item.category === 'japa';
  }) || NITYA_SEVA_DATA[0];

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Top Navigation Tabs */}
      <div className="rounded-2xl sm:rounded-3xl bg-white p-2 sm:p-2.5 shadow-xs border border-orange-100 flex overflow-x-auto gap-1.5 scrollbar-none">
        {[
          { id: 'japa', label: t('japaTab') },
          { id: 'tarak_mantra', label: t('tarakMantraTab') },
          { id: 'aarti', label: t('aartiTab') },
          { id: 'agnihotra', label: t('agnihotraTab') },
          { id: 'atharvashirsha', label: t('atharvashirshaTab') },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xs'
                : 'bg-orange-50/70 hover:bg-orange-100/70 text-orange-950 border border-orange-200/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Tab Content */}
      {activeTab === 'japa' ? (
        <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-xs border border-orange-100 text-center space-y-4 sm:space-y-5">
          {/* Header with Sacred Swami Samarth Darshan Medallion */}
          <div className="space-y-2">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-amber-300 via-orange-500 to-amber-200 shadow-md ring-2 ring-orange-400 overflow-hidden">
                  <img
                    src="/pwa-192x192.png"
                    alt="श्री स्वामी समर्थ"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-red-600 text-white text-[8px] font-black uppercase whitespace-nowrap border border-amber-200 shadow-2xs">
                  जयसिंगपूर
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-900 text-[11px] font-bold border border-orange-200">
                {t('japaSubtitle')}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                ॥ श्री स्वामी समर्थ ॥
              </h2>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                {t('japaInstruction')}
              </p>
            </div>
          </div>

          {/* Celebration Banner */}
          {showCelebration && (
            <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-3.5 text-white shadow-md animate-bounce">
              <div className="flex items-center justify-center gap-2">
                <Award className="w-5 h-5 text-amber-200" />
                <span className="font-extrabold text-sm sm:text-base">
                  {t('japaCelebration')}
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">{t('japaCelebrationSub')}</p>
            </div>
          )}

          {/* Reset Feedback Notification */}
          {resetFeedback && (
            <div className="rounded-xl bg-orange-50 border border-orange-300 p-2 text-xs font-bold text-orange-900 flex items-center justify-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{resetFeedback}</span>
            </div>
          )}

          {/* Interactive Circular Mala Wheel & Tap Center */}
          <div className="relative flex items-center justify-center py-2 sm:py-4">
            <svg className="w-56 h-56 sm:w-64 sm:h-64 -rotate-90 transform" viewBox="0 0 100 100">
              {/* Outer track */}
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-amber-100"
                strokeWidth="6"
                fill="none"
              />
              {/* Active Progress track */}
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-orange-600 transition-all duration-150"
                strokeWidth="6"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * japaCount) / 108}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Central Giant Tappable Bead / Counter Pad */}
            <button
              onClick={handleBeadClick}
              aria-label={`Chant bead, count ${japaCount} of 108`}
              className="absolute w-40 h-40 sm:w-46 sm:h-46 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-orange-700 shadow-lg shadow-orange-600/30 active:scale-95 transition-transform flex flex-col items-center justify-center text-white border-4 border-amber-200 group cursor-pointer focus:outline-none focus:ring-4 focus:ring-orange-300 select-none"
            >
              <span className="text-[11px] sm:text-xs font-bold tracking-wider text-amber-100 group-hover:text-white uppercase leading-none">
                {t('tapToChant')}
              </span>
              <span className="text-4xl sm:text-5xl font-black my-1 tracking-tight drop-shadow-md leading-none">
                {japaCount}
              </span>
              <span className="text-[11px] font-bold text-amber-200 leading-none">
                {t('target108')}
              </span>
              <span className="text-[10px] opacity-85 mt-1 font-semibold leading-none">
                ({progressPercentage}%)
              </span>
            </button>
          </div>

          {/* 108 Mala Beads Visualizer Dots (27 beads x 4 sectors = 108 beads) */}
          <div className="bg-amber-50/70 p-2.5 sm:p-3 rounded-2xl border border-amber-200/80 space-y-1.5 max-w-md mx-auto">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-950 px-1">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>{language === 'mr' ? '१०८ मणी प्रगती:' : '108 Beads Tracker:'}</span>
              </span>
              <span>{japaCount} / 108</span>
            </div>
            {/* Visual beads strip */}
            <div className="flex flex-wrap items-center justify-center gap-1 max-h-16 overflow-hidden py-1">
              {Array.from({ length: 54 }).map((_, idx) => {
                const beadIndex = idx * 2 + 1;
                const isPassed = japaCount >= beadIndex;
                const isCurrent = japaCount === beadIndex || japaCount === beadIndex - 1;
                return (
                  <span
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${
                      isCurrent
                        ? 'bg-orange-600 ring-2 ring-amber-400 scale-125'
                        : isPassed
                        ? 'bg-amber-500'
                        : 'bg-amber-200/60'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Mala Stats & Interactive Controls - Clean non-wrapping row */}
          <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
            {/* Completed Malas Counter */}
            <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm font-bold text-amber-950 whitespace-nowrap shrink-0">
              {t('completedMalas')} <strong className="text-orange-700 text-sm sm:text-base ml-1">{totalMalas}</strong>
            </div>

            {/* Chant Voice Style Selector: Sweet Voice | Temple Bell | Mute */}
            <div className="flex items-center gap-1 bg-amber-50/90 p-1 rounded-xl sm:rounded-2xl border border-amber-200 text-xs shrink-0">
              <button
                onClick={() => {
                  setChantVoiceMode('voice');
                  templeSound.playSwamiChant('voice');
                }}
                className={`px-3 py-1.5 rounded-lg sm:rounded-xl font-bold transition-all text-xs whitespace-nowrap ${
                  chantVoiceMode === 'voice'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-amber-950 hover:bg-amber-100/70'
                }`}
                title={language === 'mr' ? 'मधुर नामजप स्वर (ऐकण्यासाठी टॅप करा)' : 'Sweet Chant Voice (Tap to hear sample)'}
              >
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-inherit" />
                  <span>{language === 'mr' ? 'मधुर नामजप स्वर' : 'Sweet Voice'}</span>
                </span>
              </button>

              <button
                onClick={() => {
                  setChantVoiceMode('bell');
                  templeSound.playSwamiChant('bell');
                }}
                className={`px-3 py-1.5 rounded-lg sm:rounded-xl font-bold transition-all text-xs whitespace-nowrap ${
                  chantVoiceMode === 'bell'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-amber-950 hover:bg-amber-100/70'
                }`}
                title={language === 'mr' ? 'मंद घंटानाद' : 'Temple Bell'}
              >
                <span>{language === 'mr' ? 'घंटानाद' : 'Temple Bell'}</span>
              </button>

              <button
                onClick={() => setChantVoiceMode('mute')}
                className={`p-1.5 rounded-lg sm:rounded-xl font-bold transition-all text-xs ${
                  chantVoiceMode === 'mute'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-500 hover:bg-slate-200/70'
                }`}
                title={language === 'mr' ? 'आवाज म्यूट (केवळ व्हायब्रेशन)' : 'Mute Sound'}
              >
                <VolumeX className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => setShowResetConfirm(true)}
              aria-label={t('reset')}
              className="flex items-center gap-1 px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-red-200 hover:bg-red-50 text-xs font-bold text-red-700 active:scale-95 transition whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-600" />
              <span>{t('reset')}</span>
            </button>
          </div>

          {/* Inline Reset Confirmation Dialog (100% reliable inside iframe) */}
          {showResetConfirm && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-950 max-w-sm mx-auto space-y-2 animate-in fade-in">
              <p className="font-bold">
                {language === 'mr'
                  ? 'जप संख्या रिसेट करायची आहे का?'
                  : 'Do you want to reset the Japa counter to 0?'}
              </p>
              <div className="flex items-center justify-center gap-2 pt-0.5">
                <button
                  onClick={() => handleExecuteReset(false)}
                  className="px-3 py-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition"
                >
                  {language === 'mr' ? 'संख्या ० करा' : 'Reset Count'}
                </button>
                {totalMalas > 0 && (
                  <button
                    onClick={() => handleExecuteReset(true)}
                    className="px-2.5 py-1 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs shadow-xs transition"
                  >
                    {language === 'mr' ? 'सर्व माळा रिसेट करा' : 'Reset All'}
                  </button>
                )}
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Devotional Note */}
          <div className="rounded-2xl bg-orange-50/60 p-3 text-xs text-orange-950 leading-relaxed border border-orange-200/50">
            {t('japaRule')}
          </div>
        </div>
      ) : (
        /* Textual Stotras & Aarti View */
        <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-xs border border-orange-100 space-y-4">
          <div className="border-b border-orange-100 pb-3">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-bold">
                {selectedSeva.duration}
              </span>
              <button
                onClick={() => templeSound.playBell(880, 1.5)}
                className="flex items-center gap-1 text-xs text-orange-700 font-bold hover:text-orange-800"
              >
                <Volume2 className="w-4 h-4" />
                <span>{t('ringBell')}</span>
              </button>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              {language === 'en' ? `${selectedSeva.titleEn} (${selectedSeva.title})` : selectedSeva.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              {selectedSeva.subtitle}
            </p>
          </div>

          {/* Dedicated Tarak Mantra Song & Audio Player (Suvarna Bhakti YouTube Embed with Play/Pause) */}
          {activeTab === 'tarak_mantra' && (
            <div className="rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 p-3.5 sm:p-4 text-white shadow-md border border-amber-300 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl p-0.5 bg-amber-200 ring-2 ring-white/70 overflow-hidden shrink-0 shadow-xs">
                    <img
                      src="/pwa-192x192.png"
                      alt="श्री स्वामी समर्थ"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                      <span className="text-[10px] font-black uppercase text-amber-200 tracking-wider">
                        {language === 'mr' ? 'तारक मंत्र ऑडिओ व गायन' : 'Tarak Mantra Song'}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-white truncate">
                      संपूर्ण तारक मंत्र - Suvarna Bhakti
                    </h3>
                  </div>
                </div>

                <a
                  href="https://youtube.com/shorts/9f5E0fBuJdU?si=Bqtwv-c9xciZETKI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold flex items-center gap-1 shrink-0 transition"
                  title={language === 'mr' ? 'YouTube वर उघडा' : 'Open in YouTube'}
                >
                  <span>YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* YouTube Shorts Embed Player */}
              <div className="relative rounded-2xl overflow-hidden bg-black/80 aspect-video sm:aspect-[16/9] max-h-64 sm:max-h-72 w-full mx-auto border-2 border-amber-300/80 shadow-md">
                <iframe
                  ref={tarakIframeRef}
                  src="https://www.youtube-nocookie.com/embed/9f5E0fBuJdU?enablejsapi=1&playsinline=1&rel=0&modestbranding=1"
                  title="संपूर्ण तारक मंत्र श्री स्वामी समर्थ"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Play / Pause Toggle Button Bar */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleToggleTarakSong}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer ${
                    isPlayingTarak
                      ? 'bg-amber-100 hover:bg-white text-orange-950'
                      : 'bg-gradient-to-r from-amber-300 to-yellow-300 hover:from-amber-200 hover:to-yellow-200 text-orange-950'
                  }`}
                >
                  {isPlayingTarak ? (
                    <>
                      <Pause className="w-4 h-4 fill-current text-orange-900" />
                      <span>{t('tarakMantraPause')}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current text-orange-900" />
                      <span>{t('tarakMantraPlay')}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => templeSound.playBell(780, 0.6)}
                  className="py-2.5 px-3 rounded-xl bg-black/25 hover:bg-black/35 text-amber-200 text-xs font-bold flex items-center gap-1.5 transition border border-amber-300/30"
                  title="घंटानाद वाजवा"
                >
                  <Volume2 className="w-4 h-4" />
                  <span className="hidden sm:inline">घंटानाद</span>
                </button>
              </div>

              <p className="text-[11px] text-amber-100/90 text-center leading-snug">
                {t('tarakMantraAudioDesc')}
              </p>
            </div>
          )}

          {/* Devotional Verse Text Box */}
          <div className="rounded-2xl bg-amber-50/50 p-4 sm:p-6 border border-amber-200/60 shadow-2xs">
            <pre className="whitespace-pre-wrap font-sans text-sm sm:text-base leading-loose text-slate-800 text-center font-medium">
              {selectedSeva.textMr}
            </pre>
          </div>

          {/* Meaning & Benefits */}
          {selectedSeva.meaningMr && (
            <div className="rounded-2xl bg-orange-50/60 p-3.5 border border-orange-200/60 text-xs sm:text-sm text-slate-800 space-y-1">
              <h3 className="font-bold text-orange-950 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-orange-700" />
                <span>{t('meaningTitle')}</span>
              </h3>
              <p className="leading-relaxed text-slate-700">
                {selectedSeva.meaningMr}
              </p>
            </div>
          )}

          {selectedSeva.benefitsMr && (
            <div className="rounded-2xl bg-emerald-50/70 p-3.5 border border-emerald-200/60 text-xs sm:text-sm text-emerald-950 space-y-1">
              <h3 className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t('benefitsTitle')}</span>
              </h3>
              <p className="leading-relaxed text-emerald-900">
                {selectedSeva.benefitsMr}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
