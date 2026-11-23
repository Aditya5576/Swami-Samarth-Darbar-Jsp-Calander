import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  SARAMRUT_ADHYAYS,
  TOTAL_SARAMRUT_VERSES,
  SaramrutAdhyay,
  ParayanMode,
  ReaderTheme,
  ReaderFontSize,
  getParayanSchedule,
  getParayanDayForAdhyay,
  toMarathiDigits,
} from '../data/saramrut';
import { useLanguage } from '../context/LanguageContext';
import { templeSound } from '../utils/audioChime';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Search,
  X,
  BookOpen,
  Sun,
  Moon,
  ScrollText,
  Type,
  Sparkles,
} from 'lucide-react';

interface LastReadState {
  adhyayId: number;
  scrollPercent: number;
  updatedAt: string;
}

interface ReaderPrefs {
  fontSize: ReaderFontSize;
  theme: ReaderTheme;
}

const STORAGE_KEYS = {
  parayanMode: 'swami_saramrut_parayan_mode',
  completed: 'swami_saramrut_completed_adhyays',
  bookmark: 'swami_saramrut_bookmark',
  lastRead: 'swami_saramrut_last_read',
  prefs: 'swami_saramrut_reader_prefs',
};

const FONT_SIZE_CLASSES: Record<ReaderFontSize, { verse: string; label: string; sample: string }> = {
  sm: { verse: 'text-[15px] leading-[1.9]', label: 'A-', sample: '15px' },
  md: { verse: 'text-[17px] leading-[1.95]', label: 'A', sample: '17px' },
  lg: { verse: 'text-[20px] leading-[2.0]', label: 'A+', sample: '20px' },
  xl: { verse: 'text-[23px] leading-[2.05]', label: 'A++', sample: '23px' },
};

const READER_THEME_STYLES: Record<
  ReaderTheme,
  {
    surface: string;
    topBar: string;
    text: string;
    muted: string;
    heading: string;
    numeral: string;
    divider: string;
    popover: string;
    btnNeutral: string;
    closingBox: string;
  }
> = {
  parchment: {
    surface: 'bg-[#FBF5E6] text-[#2B1B12] border-amber-300/80',
    topBar: 'bg-[#FBF5E6]/95 border-amber-300/70 text-[#2B1B12]',
    text: 'text-[#2B1B12]',
    muted: 'text-[#7A593E]',
    heading: 'text-[#6B2608]',
    numeral: 'text-[#B45309]',
    divider: 'border-amber-900/10',
    popover: 'bg-[#FFFDF7] border-amber-300 text-[#2B1B12]',
    btnNeutral: 'bg-amber-900/8 hover:bg-amber-900/15 text-[#4A2511]',
    closingBox: 'bg-amber-900/[0.05] border-amber-900/15 text-[#5C230A]',
  },
  light: {
    surface: 'bg-white text-slate-900 border-orange-200/80',
    topBar: 'bg-white/95 border-slate-200 text-slate-900',
    text: 'text-slate-900',
    muted: 'text-slate-500',
    heading: 'text-orange-950',
    numeral: 'text-orange-700',
    divider: 'border-slate-100',
    popover: 'bg-white border-slate-200 text-slate-900',
    btnNeutral: 'bg-slate-100 hover:bg-slate-200 text-slate-800',
    closingBox: 'bg-orange-50/70 border-orange-200/70 text-orange-950',
  },
  night: {
    surface: 'bg-[#1A1512] text-[#F3E8D6] border-stone-700/80',
    topBar: 'bg-[#1A1512]/95 border-stone-800 text-[#F3E8D6]',
    text: 'text-[#F3E8D6]',
    muted: 'text-[#B8A38C]',
    heading: 'text-amber-300',
    numeral: 'text-amber-400',
    divider: 'border-stone-800',
    popover: 'bg-[#26201B] border-stone-700 text-[#F3E8D6]',
    btnNeutral: 'bg-stone-800 hover:bg-stone-700 text-[#F3E8D6]',
    closingBox: 'bg-stone-900/90 border-stone-700 text-amber-200',
  },
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Splits a verse ending in ॥१२॥ into [body, numeral] so the verse number renders cleanly. */
function splitVerseAndMarker(verse: string): { body: string; marker: string } {
  const match = verse.match(/(॥[०-९]+॥)\s*$/);
  if (!match) return { body: verse, marker: '' };
  return {
    body: verse.slice(0, match.index).trim(),
    marker: match[1],
  };
}

export const SaramrutView: React.FC = () => {
  const { language, t } = useLanguage();

  // Persistent state
  const [parayanMode, setParayanMode] = useState<ParayanMode>(() =>
    readStorage<ParayanMode>(STORAGE_KEYS.parayanMode, '7day')
  );
  const [completedAdhyays, setCompletedAdhyays] = useState<number[]>(() =>
    readStorage<number[]>(STORAGE_KEYS.completed, [])
  );
  const [bookmarkedAdhyay, setBookmarkedAdhyay] = useState<number | null>(() =>
    readStorage<number | null>(STORAGE_KEYS.bookmark, null)
  );
  const [lastRead, setLastRead] = useState<LastReadState | null>(() =>
    readStorage<LastReadState | null>(STORAGE_KEYS.lastRead, null)
  );
  const [readerPrefs, setReaderPrefs] = useState<ReaderPrefs>(() =>
    readStorage<ReaderPrefs>(STORAGE_KEYS.prefs, { fontSize: 'md', theme: 'parchment' })
  );

  // Active reader & UI state
  const [activeAdhyayId, setActiveAdhyayId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickJump, setShowQuickJump] = useState(false);
  const [showScheduleDays, setShowScheduleDays] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAppearanceMenu, setShowAppearanceMenu] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [completionToast, setCompletionToast] = useState<string | null>(null);

  const pendingRestorePercentRef = useRef<number | null>(null);
  const readerTopRef = useRef<HTMLDivElement | null>(null);

  // Sync persistent state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.parayanMode, JSON.stringify(parayanMode));
  }, [parayanMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.completed, JSON.stringify(completedAdhyays));
  }, [completedAdhyays]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.bookmark, JSON.stringify(bookmarkedAdhyay));
  }, [bookmarkedAdhyay]);

  useEffect(() => {
    if (lastRead) {
      localStorage.setItem(STORAGE_KEYS.lastRead, JSON.stringify(lastRead));
    }
  }, [lastRead]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.prefs, JSON.stringify(readerPrefs));
  }, [readerPrefs]);

  const activeAdhyay: SaramrutAdhyay | null = useMemo(
    () => (activeAdhyayId ? SARAMRUT_ADHYAYS.find(a => a.id === activeAdhyayId) || null : null),
    [activeAdhyayId]
  );

  const parayanSchedule = useMemo(() => getParayanSchedule(parayanMode), [parayanMode]);

  const completedSet = useMemo(() => new Set(completedAdhyays), [completedAdhyays]);

  // Identify current Parayan day (first day with any incomplete Adhyay, or last day if all done)
  const currentParayanDay = useMemo(() => {
    const firstIncomplete = parayanSchedule.find(day =>
      day.adhyayIds.some(id => !completedSet.has(id))
    );
    return firstIncomplete || parayanSchedule[parayanSchedule.length - 1];
  }, [parayanSchedule, completedSet]);

  const progressPercent = Math.round((completedAdhyays.length / 21) * 100);
  const isAllComplete = completedAdhyays.length === 21;

  // Open an Adhyay (optionally restoring scroll percent when resuming)
  const openAdhyay = useCallback((id: number, restorePercent?: number) => {
    setShowAppearanceMenu(false);
    setActiveAdhyayId(id);
    pendingRestorePercentRef.current = typeof restorePercent === 'number' ? restorePercent : 0;
    setScrollProgress(typeof restorePercent === 'number' ? restorePercent : 0);
    setLastRead(prev => ({
      adhyayId: id,
      scrollPercent: typeof restorePercent === 'number' ? restorePercent : prev?.adhyayId === id ? prev.scrollPercent : 0,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Scroll restore or scroll-to-top when opening/switching an Adhyay
  useEffect(() => {
    if (activeAdhyayId === null) return;
    const targetPct = pendingRestorePercentRef.current ?? 0;
    pendingRestorePercentRef.current = null;

    const timer = window.setTimeout(() => {
      if (targetPct > 2) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
          window.scrollTo({ top: Math.round((targetPct / 100) * docHeight), behavior: 'smooth' });
          return;
        }
      }
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }, 40);

    return () => window.clearTimeout(timer);
  }, [activeAdhyayId]);

  // Track reading scroll depth and persist lastRead progress
  useEffect(() => {
    if (activeAdhyayId === null) return;

    let rafId = 0;
    let saveTimeout = 0;

    const handleScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const pct = maxScroll > 0 ? Math.min(100, Math.max(0, Math.round((window.scrollY / maxScroll) * 100))) : 0;
        setScrollProgress(pct);

        window.clearTimeout(saveTimeout);
        saveTimeout = window.setTimeout(() => {
          setLastRead({
            adhyayId: activeAdhyayId,
            scrollPercent: pct,
            updatedAt: new Date().toISOString(),
          });
        }, 350);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
      window.clearTimeout(saveTimeout);
    };
  }, [activeAdhyayId]);

  const toggleCompleted = (id: number) => {
    const alreadyDone = completedSet.has(id);
    if (alreadyDone) {
      setCompletedAdhyays(prev => prev.filter(x => x !== id));
    } else {
      const nextList = [...completedAdhyays, id].sort((a, b) => a - b);
      setCompletedAdhyays(nextList);
      templeSound.playBell(660, 0.45);
      const msg =
        nextList.length === 21
          ? t('saramrutParayanDone')
          : language === 'mr'
          ? `अध्याय ${toMarathiDigits(id)} पूर्ण नोंदवले (${toMarathiDigits(nextList.length)}/२१)`
          : `Adhyay ${id} marked complete (${nextList.length}/21)`;
      setCompletionToast(msg);
      window.setTimeout(() => setCompletionToast(null), 3200);
    }
  };

  const toggleBookmark = (id: number) => {
    setBookmarkedAdhyay(prev => (prev === id ? null : id));
  };

  const handleResetParayan = () => {
    setCompletedAdhyays([]);
    setShowResetConfirm(false);
    templeSound.playBell(520, 0.25);
  };

  // Search across Adhyay numbers, titles, themes, and verses (returns optional matched snippet)
  const filteredAdhyays = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return SARAMRUT_ADHYAYS.map(adhyay => ({ adhyay, matchedVerse: null as string | null }));
    }

    // Normalize Marathi digits to ASCII so "१२" matches "12"
    const normalizedDigits = q.replace(/[०-९]/g, d => String('०१२३४५६७८९'.indexOf(d)));

    const results: { adhyay: SaramrutAdhyay; matchedVerse: string | null }[] = [];
    for (const adhyay of SARAMRUT_ADHYAYS) {
      const idStr = String(adhyay.id);
      const metaMatch =
        idStr === normalizedDigits ||
        adhyay.titleMr.toLowerCase().includes(q) ||
        adhyay.titleEn.toLowerCase().includes(q) ||
        adhyay.subtitleMr.toLowerCase().includes(q) ||
        adhyay.subtitleEn.toLowerCase().includes(q);

      const verseMatch = adhyay.verses.find(v => v.toLowerCase().includes(q)) || null;

      if (metaMatch || verseMatch) {
        results.push({ adhyay, matchedVerse: verseMatch });
      }
    }
    return results;
  }, [searchQuery]);

  // ============================================================================
  // VIEW 2: FOCUSED ADHYAY READER VIEW
  // ============================================================================
  if (activeAdhyay) {
    const theme = READER_THEME_STYLES[readerPrefs.theme];
    const fontConfig = FONT_SIZE_CLASSES[readerPrefs.fontSize];
    const isBookmarked = bookmarkedAdhyay === activeAdhyay.id;
    const isCompleted = completedSet.has(activeAdhyay.id);
    const parayanDayNum = getParayanDayForAdhyay(activeAdhyay.id, parayanMode);
    const hasPrev = activeAdhyay.id > 1;
    const hasNext = activeAdhyay.id < 21;

    return (
      <div ref={readerTopRef} className="space-y-3 pb-4">
        {/* Compact Sticky Reader Bar (dynamically anchored to measured Header height — zero overlap/gap) */}
        <div
          className={`sticky top-[var(--app-header-height,3.75rem)] z-20 rounded-2xl px-3 sm:px-4 border shadow-xs backdrop-blur-md transition-colors ${theme.topBar}`}
        >
          <div className="flex items-center justify-between gap-2 min-h-[48px] py-1">
            <button
              type="button"
              onClick={() => {
                setShowAppearanceMenu(false);
                setActiveAdhyayId(null);
              }}
              className={`min-h-[44px] px-2.5 -ml-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold transition active:scale-95 whitespace-nowrap shrink-0 ${theme.btnNeutral}`}
              aria-label={t('saramrutBackToList')}
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span>{t('saramrutBackToList')}</span>
            </button>

            <div className="min-w-0 flex-1 text-center px-1">
              <p className={`text-xs sm:text-sm font-black truncate ${theme.heading}`}>
                {language === 'mr' ? activeAdhyay.titleMr : `${activeAdhyay.titleEn} · ${activeAdhyay.titleMr}`}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => toggleBookmark(activeAdhyay.id)}
                className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center transition active:scale-95 ${
                  isBookmarked
                    ? 'bg-orange-600 text-white'
                    : theme.btnNeutral
                }`}
                aria-label={t('saramrutBookmarked')}
                title={t('saramrutBookmarked')}
              >
                {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setShowAppearanceMenu(prev => !prev)}
                className={`min-h-[44px] min-w-[44px] px-2.5 rounded-xl flex items-center justify-center gap-1 text-xs font-black transition active:scale-95 ${
                  showAppearanceMenu ? 'bg-orange-600 text-white' : theme.btnNeutral
                }`}
                aria-label={t('saramrutFontSize')}
                aria-expanded={showAppearanceMenu}
              >
                <Type className="w-4 h-4" />
                <span className="hidden xs:inline">Aa</span>
              </button>
            </div>
          </div>

          {/* Hairline Reading Progress Bar */}
          <div className="h-[2px] w-full bg-orange-950/10 -mx-0 overflow-hidden">
            <div
              className="h-full bg-orange-600 transition-[width] duration-150"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>

          {/* Inline Appearance Popover (Font Size & Reading Theme) */}
          {showAppearanceMenu && (
            <div
              className={`my-2 p-3.5 rounded-2xl border shadow-lg space-y-3 animate-in fade-in duration-150 ${theme.popover}`}
            >
              {/* Font Size Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className={theme.muted}>{t('saramrutFontSize')}</span>
                  <span className={`tabular-nums ${theme.muted}`}>{fontConfig.sample}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['sm', 'md', 'lg', 'xl'] as ReaderFontSize[]).map(sizeKey => (
                    <button
                      type="button"
                      key={sizeKey}
                      onClick={() => setReaderPrefs(p => ({ ...p, fontSize: sizeKey }))}
                      className={`min-h-[44px] rounded-xl font-black text-xs transition active:scale-95 ${
                        readerPrefs.fontSize === sizeKey
                          ? 'bg-orange-600 text-white shadow-xs'
                          : theme.btnNeutral
                      }`}
                    >
                      {FONT_SIZE_CLASSES[sizeKey].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Selector — always 3 tidy single-line buttons on 1 row */}
              <div className="space-y-1.5">
                <span className={`block text-[11px] font-bold ${theme.muted}`}>{t('saramrutTheme')}</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setReaderPrefs(p => ({ ...p, theme: 'parchment' }))}
                    className={`min-h-[44px] px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition active:scale-95 whitespace-nowrap min-w-0 ${
                      readerPrefs.theme === 'parchment'
                        ? 'bg-[#FBF5E6] text-[#6B2608] border-orange-600 ring-1 ring-orange-600'
                        : 'bg-[#FBF5E6] text-[#4A2511] border-amber-300/70 opacity-80'
                    }`}
                  >
                    <ScrollText className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{t('saramrutThemeParchment')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReaderPrefs(p => ({ ...p, theme: 'light' }))}
                    className={`min-h-[44px] px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition active:scale-95 whitespace-nowrap min-w-0 ${
                      readerPrefs.theme === 'light'
                        ? 'bg-white text-slate-900 border-orange-600 ring-1 ring-orange-600'
                        : 'bg-white text-slate-700 border-slate-300 opacity-80'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{t('saramrutThemeLight')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReaderPrefs(p => ({ ...p, theme: 'night' }))}
                    className={`min-h-[44px] px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition active:scale-95 whitespace-nowrap min-w-0 ${
                      readerPrefs.theme === 'night'
                        ? 'bg-[#1A1512] text-amber-300 border-amber-400 ring-1 ring-amber-400'
                        : 'bg-[#1A1512] text-[#E6D8C3] border-stone-700 opacity-85'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{t('saramrutThemeNight')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Completion Toast Feedback */}
        {completionToast && (
          <div className="rounded-2xl bg-emerald-600 text-white px-4 py-2.5 text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 text-center animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{completionToast}</span>
          </div>
        )}

        {/* Sacred Granth Reading Canvas */}
        <article
          className={`rounded-2xl sm:rounded-3xl border p-4 sm:p-7 shadow-xs transition-colors ${theme.surface}`}
        >
          {/* Chapter Opening Header */}
          <header className={`text-center pb-5 mb-5 border-b ${theme.divider} space-y-2`}>
            <p className={`text-xs font-bold tracking-wide ${theme.numeral}`}>
              ॥ श्री स्वामी समर्थ ॥
            </p>
            <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${theme.heading}`}>
              {language === 'mr' ? activeAdhyay.titleMr : `${activeAdhyay.titleEn} — ${activeAdhyay.titleMr}`}
            </h1>
            <p className={`text-xs sm:text-sm font-semibold ${theme.muted}`}>
              {language === 'mr' ? activeAdhyay.subtitleMr : activeAdhyay.subtitleEn}
            </p>

            {/* Unboxed Metadata Line */}
            <div className={`flex items-center justify-center gap-2 text-[11px] font-medium tabular-nums pt-0.5 ${theme.muted}`}>
              <span>
                {language === 'mr'
                  ? `${toMarathiDigits(activeAdhyay.verseCount)} ओव्या`
                  : `${activeAdhyay.verseCount} Ovis`}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {language === 'mr'
                  ? `पारायण दिवस ${toMarathiDigits(parayanDayNum)}`
                  : `Parayan Day ${parayanDayNum}`}
              </span>
              {isCompleted && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-600 font-bold">{t('saramrutCompleted')}</span>
                </>
              )}
            </div>

            {/* Traditional Opening Invocation */}
            {activeAdhyay.invocation.length > 0 && (
              <div className="pt-3 space-y-1">
                {activeAdhyay.invocation.map((line, i) => (
                  <p
                    key={i}
                    className={`text-xs sm:text-sm font-bold leading-relaxed ${theme.heading}`}
                  >
                    {line}
                  </p>
                ))}
              </div>
            )}
          </header>

          {/* Ovi Verses Body */}
          <div className="space-y-4 sm:space-y-5 max-w-[65ch] mx-auto">
            {activeAdhyay.verses.map((verse, idx) => {
              const { body, marker } = splitVerseAndMarker(verse);
              return (
                <p
                  key={idx}
                  className={`font-medium tracking-[0.005em] pb-3.5 border-b last:border-b-0 ${fontConfig.verse} ${theme.text} ${theme.divider}`}
                >
                  <span>{body}</span>
                  {marker && (
                    <span className={`ml-1.5 font-bold whitespace-nowrap ${theme.numeral}`}>
                      {marker}
                    </span>
                  )}
                </p>
              );
            })}
          </div>

          {/* Traditional Closing Benediction */}
          <footer className={`mt-7 pt-5 border-t ${theme.divider} space-y-5`}>
            <div className={`rounded-2xl border p-4 text-center space-y-1.5 ${theme.closingBox}`}>
              <p className="text-sm sm:text-base font-black tracking-wide leading-relaxed">
                {activeAdhyay.closing}
              </p>
              <p className={`text-xs font-semibold ${theme.muted}`}>
                ॥ अनंतकोटी ब्रह्मांडनायक राजाधिराज योगीराज सद्गुरू श्री स्वामी समर्थ महाराज की जय ॥
              </p>
            </div>

            {/* Mark Complete Primary Action — crisp single-line label */}
            <button
              type="button"
              onClick={() => toggleCompleted(activeAdhyay.id)}
              title={
                isCompleted
                  ? language === 'mr'
                    ? 'बदलण्यासाठी टॅप करा'
                    : 'Tap to undo'
                  : undefined
              }
              className={`w-full min-h-[48px] px-4 py-3 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-xs whitespace-nowrap ${
                isCompleted
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span className="truncate">
                    {language === 'mr'
                      ? `${activeAdhyay.titleMr} पूर्ण झाले ✓`
                      : `${activeAdhyay.titleEn} Completed ✓`}
                  </span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 shrink-0" />
                  <span className="truncate">{t('saramrutMarkComplete')}</span>
                </>
              )}
            </button>

            {/* Previous / Next Adhyay Thumb-Zone Navigation */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => hasPrev && openAdhyay(activeAdhyay.id - 1, 0)}
                disabled={!hasPrev}
                className={`min-h-[46px] px-3 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition active:scale-95 whitespace-nowrap ${
                  hasPrev
                    ? theme.btnNeutral
                    : 'opacity-40 cursor-not-allowed ' + theme.btnNeutral
                }`}
              >
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {hasPrev
                    ? language === 'mr'
                      ? `अध्याय ${toMarathiDigits(activeAdhyay.id - 1)}`
                      : `Adhyay ${activeAdhyay.id - 1}`
                    : t('saramrutPrevAdhyay')}
                </span>
              </button>

              <button
                onClick={() => hasNext && openAdhyay(activeAdhyay.id + 1, 0)}
                disabled={!hasNext}
                className={`min-h-[46px] px-3 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition active:scale-95 whitespace-nowrap ${
                  hasNext
                    ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-xs'
                    : 'opacity-40 cursor-not-allowed ' + theme.btnNeutral
                }`}
              >
                <span className="truncate">
                  {hasNext
                    ? language === 'mr'
                      ? `अध्याय ${toMarathiDigits(activeAdhyay.id + 1)}`
                      : `Adhyay ${activeAdhyay.id + 1}`
                    : t('saramrutNextAdhyay')}
                </span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </footer>
        </article>
      </div>
    );
  }

  // ============================================================================
  // VIEW 1: SARAMRUT LIBRARY & PARAYAN HOME
  // ============================================================================
  const resumeAdhyay = lastRead
    ? SARAMRUT_ADHYAYS.find(a => a.id === lastRead.adhyayId) || null
    : null;
  const bookmarkedItem = bookmarkedAdhyay
    ? SARAMRUT_ADHYAYS.find(a => a.id === bookmarkedAdhyay) || null
    : null;

  return (
    <div className="space-y-3.5 sm:space-y-4 max-w-full">
      {/* 1. Granth Header Card */}
      <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-5 border border-orange-200/80 shadow-xs space-y-3.5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl p-0.5 bg-gradient-to-tr from-amber-300 via-orange-400 to-yellow-200 ring-2 ring-orange-200 shrink-0 overflow-hidden shadow-2xs">
            <img
              src="/pwa-192x192.png"
              alt="श्री स्वामी समर्थ"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-black text-orange-950 leading-snug">
              {t('saramrutTitle')}
            </h1>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {language === 'mr'
                ? `२१ अध्याय · ${toMarathiDigits(TOTAL_SARAMRUT_VERSES)} ओव्या · संपूर्ण ऑफलाईन`
                : `21 Adhyays · ${TOTAL_SARAMRUT_VERSES.toLocaleString()} Ovis · Offline Granth`}
            </p>
          </div>
        </div>

        {/* Auto-Resume & Bookmark Strip */}
        {(resumeAdhyay || bookmarkedItem) && (
          <div className="pt-3 border-t border-orange-100 space-y-2">
            {resumeAdhyay && (
              <button
                onClick={() => openAdhyay(resumeAdhyay.id, lastRead?.scrollPercent ?? 0)}
                className="w-full min-h-[54px] p-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white flex items-center justify-between gap-3 text-left transition active:scale-[0.98] shadow-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-100 font-semibold">
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>{t('saramrutContinueReading')}</span>
                    {lastRead && lastRead.scrollPercent > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{lastRead.scrollPercent}%</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm font-black text-white truncate mt-0.5">
                    {language === 'mr'
                      ? `${resumeAdhyay.titleMr} — ${resumeAdhyay.subtitleMr}`
                      : `${resumeAdhyay.titleEn} — ${resumeAdhyay.subtitleEn}`}
                  </p>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-white text-orange-800 text-xs font-black whitespace-nowrap shrink-0">
                  {t('saramrutResumeBtn')}
                </span>
              </button>
            )}

            {bookmarkedItem && bookmarkedItem.id !== resumeAdhyay?.id && (
              <button
                onClick={() => openAdhyay(bookmarkedItem.id, 0)}
                className="w-full min-h-[46px] px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 flex items-center justify-between gap-2 text-left transition active:scale-[0.98]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <BookmarkCheck className="w-4 h-4 text-orange-600 shrink-0" />
                  <span className="text-xs font-bold text-orange-950 truncate">
                    {t('saramrutBookmarked')}:{' '}
                    {language === 'mr' ? bookmarkedItem.titleMr : bookmarkedItem.titleEn}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-orange-600 shrink-0" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Parayan Sankalp Tracker Card (3-Day / 7-Day / 21-Day) */}
      <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-5 border border-orange-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-nowrap gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-base font-black text-orange-950 truncate">
              {t('saramrutParayanTitle')}
            </h2>
            <p className="text-xs text-slate-500 font-medium tabular-nums mt-0.5 truncate">
              {language === 'mr'
                ? `${toMarathiDigits(completedAdhyays.length)} / २१ अध्याय पूर्ण · ${toMarathiDigits(progressPercent)}%`
                : `${completedAdhyays.length} / 21 Adhyays completed · ${progressPercent}%`}
            </p>
          </div>

          {completedAdhyays.length > 0 && (
            <button
              type="button"
              onClick={() => setShowResetConfirm(prev => !prev)}
              className="min-h-[40px] px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 flex items-center gap-1 transition whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>{t('reset')}</span>
            </button>
          )}
        </div>

        {/* Inline Reset Confirmation */}
        {showResetConfirm && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-red-900">
              {language === 'mr'
                ? 'पारायण प्रगती ० वर रिसेट करायची का?'
                : 'Reset all 21 Adhyay completion progress?'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleResetParayan}
                className="min-h-[36px] px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold whitespace-nowrap"
              >
                {t('saramrutResetParayan')}
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="min-h-[36px] px-3 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold whitespace-nowrap"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Segmented Parayan Mode Selector */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-orange-50/90 border border-orange-100">
          {([
            { id: '3day' as ParayanMode, label: t('saramrut3Day'), subMr: '७/दिवस', subEn: '7/day' },
            { id: '7day' as ParayanMode, label: t('saramrut7Day'), subMr: '३/दिवस', subEn: '3/day' },
            { id: '21day' as ParayanMode, label: t('saramrut21Day'), subMr: '१/दिवस', subEn: '1/day' },
          ]).map(mode => {
            const active = parayanMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setParayanMode(mode.id)}
                className={`min-h-[42px] px-2 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex flex-col items-center justify-center ${
                  active
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'text-orange-950 hover:bg-orange-100/70'
                }`}
              >
                <span>{mode.label}</span>
                <span className={`text-[10px] font-medium ${active ? 'text-amber-100' : 'text-slate-500'}`}>
                  {language === 'mr' ? mode.subMr : mode.subEn}
                </span>
              </button>
            );
          })}
        </div>

        {/* Clean Progress Bar */}
        <div className="h-2.5 w-full rounded-full bg-orange-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-[width] duration-300 ${
              isAllComplete ? 'bg-emerald-600' : 'bg-gradient-to-r from-orange-500 to-amber-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Full Parayan Celebration OR Today's Target Day */}
        {isAllComplete ? (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('saramrutParayanDone')}</span>
          </div>
        ) : (
          <div className="flex items-center justify-between flex-nowrap gap-2 pt-0.5 text-xs">
            <div className="min-w-0 flex-1 truncate whitespace-nowrap">
              <span className="text-slate-500 font-medium">
                {language === 'mr' ? 'पुढील लक्ष्य: ' : 'Current Target: '}
              </span>
              <span className="font-extrabold text-orange-950">
                {language === 'mr'
                  ? `दिवस ${toMarathiDigits(currentParayanDay.dayNumber)} — अध्याय ${toMarathiDigits(currentParayanDay.startAdhyay)}${
                      currentParayanDay.startAdhyay !== currentParayanDay.endAdhyay
                        ? ` ते ${toMarathiDigits(currentParayanDay.endAdhyay)}`
                        : ''
                    }`
                  : `Day ${currentParayanDay.dayNumber} — Adhyay ${currentParayanDay.startAdhyay}${
                      currentParayanDay.startAdhyay !== currentParayanDay.endAdhyay
                        ? `–${currentParayanDay.endAdhyay}`
                        : ''
                    }`}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowScheduleDays(prev => !prev)}
              className="min-h-[40px] px-2.5 py-1 rounded-lg text-orange-700 hover:bg-orange-50 font-bold flex items-center gap-1 whitespace-nowrap shrink-0 transition"
            >
              <span>{language === 'mr' ? 'वेळापत्रक' : 'Schedule'}</span>
              {showScheduleDays ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
            </button>
          </div>
        )}

        {/* Expandable Day-by-Day Parayan Schedule */}
        {showScheduleDays && (
          <div className="pt-2 border-t border-orange-100 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {parayanSchedule.map(day => {
              const dayCompletedCount = day.adhyayIds.filter(id => completedSet.has(id)).length;
              const dayDone = dayCompletedCount === day.adhyayIds.length;
              const nextInDay = day.adhyayIds.find(id => !completedSet.has(id)) || day.startAdhyay;

              return (
                <button
                  key={day.dayNumber}
                  onClick={() => openAdhyay(nextInDay, 0)}
                  className={`min-h-[44px] px-3 py-2 rounded-xl border text-left flex items-center justify-between gap-2 text-xs transition active:scale-[0.98] ${
                    dayDone
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : day.dayNumber === currentParayanDay.dayNumber
                      ? 'bg-orange-50 border-orange-300 text-orange-950'
                      : 'bg-slate-50/60 border-slate-200/80 text-slate-800 hover:bg-orange-50/50'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-extrabold truncate">
                      {language === 'mr'
                        ? `दिवस ${toMarathiDigits(day.dayNumber)}: अध्याय ${toMarathiDigits(day.startAdhyay)}${
                            day.startAdhyay !== day.endAdhyay ? `–${toMarathiDigits(day.endAdhyay)}` : ''
                          }`
                        : `Day ${day.dayNumber}: Adhyay ${day.startAdhyay}${
                            day.startAdhyay !== day.endAdhyay ? `–${day.endAdhyay}` : ''
                          }`}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold tabular-nums shrink-0 whitespace-nowrap">
                    {dayDone
                      ? '✓'
                      : `${dayCompletedCount}/${day.adhyayIds.length}`}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Search & Quick Jump Strip */}
      <div className="rounded-2xl sm:rounded-3xl bg-white p-3.5 sm:p-4 border border-orange-200/80 shadow-xs space-y-3">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('saramrutSearchPlaceholder')}
            className="w-full min-h-[44px] pl-10 pr-10 py-2 rounded-xl bg-amber-50/50 border border-orange-200/80 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label={t('saramrutClearSearch')}
              className="absolute right-1 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Toggleable 1-21 Quick Jump Grid */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowQuickJump(prev => !prev)}
            className="w-full min-h-[36px] flex items-center justify-between flex-nowrap gap-2 text-xs font-bold text-orange-950 py-0.5"
          >
            <span className="truncate">{t('saramrutQuickJump')}</span>
            <span className="text-orange-700 flex items-center gap-1 text-[11px] whitespace-nowrap shrink-0">
              <span>{showQuickJump ? (language === 'mr' ? 'लपवा' : 'Hide') : (language === 'mr' ? 'सर्व २१ पहा' : 'Show 1–21')}</span>
              {showQuickJump ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
            </span>
          </button>

          {showQuickJump && (
            <div className="grid grid-cols-7 gap-1.5 pt-1">
              {SARAMRUT_ADHYAYS.map(item => {
                const done = completedSet.has(item.id);
                const marked = bookmarkedAdhyay === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => openAdhyay(item.id, 0)}
                    className={`min-h-[40px] rounded-xl text-xs font-black tabular-nums relative flex items-center justify-center border transition active:scale-95 ${
                      done
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : marked
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-orange-50/70 hover:bg-orange-100 text-orange-950 border-orange-200/70'
                    }`}
                    title={language === 'mr' ? item.titleMr : item.titleEn}
                  >
                    {language === 'mr' ? toMarathiDigits(item.id) : item.id}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 4. Complete 21-Adhyay Chapter List */}
      <div className="rounded-2xl sm:rounded-3xl bg-white border border-orange-200/80 shadow-xs overflow-hidden divide-y divide-orange-100">
        {filteredAdhyays.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-600">{t('saramrutNoResults')}</p>
            <button
              onClick={() => setSearchQuery('')}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition"
            >
              {t('saramrutClearSearch')}
            </button>
          </div>
        ) : (
          filteredAdhyays.map(({ adhyay, matchedVerse }) => {
            const isCompleted = completedSet.has(adhyay.id);
            const isBookmarked = bookmarkedAdhyay === adhyay.id;
            const dayNum = getParayanDayForAdhyay(adhyay.id, parayanMode);

            return (
              <div
                key={adhyay.id}
                className="flex items-center gap-2 p-2.5 sm:p-3 hover:bg-amber-50/50 transition-colors"
              >
                {/* Interactive Completion Toggle */}
                <button
                  onClick={() => toggleCompleted(adhyay.id)}
                  aria-label={
                    isCompleted
                      ? `Unmark Adhyay ${adhyay.id}`
                      : `Mark Adhyay ${adhyay.id} complete`
                  }
                  className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center shrink-0 transition active:scale-95 border font-black text-sm tabular-nums ${
                    isCompleted
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-orange-50/80 text-orange-950 border-orange-200/80 hover:border-orange-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{language === 'mr' ? toMarathiDigits(adhyay.id) : adhyay.id}</span>
                  )}
                </button>

                {/* Main Row Click Target -> Open Reader */}
                <button
                  onClick={() => openAdhyay(adhyay.id, lastRead?.adhyayId === adhyay.id ? lastRead.scrollPercent : 0)}
                  className="min-w-0 flex-1 text-left py-1 px-1.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-sm sm:text-[15px] font-extrabold text-slate-900 truncate">
                      {language === 'mr' ? adhyay.titleMr : `${adhyay.titleEn} · ${adhyay.titleMr}`}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
                    {language === 'mr' ? adhyay.subtitleMr : adhyay.subtitleEn}
                  </p>

                  {/* Quiet Unboxed Metadata */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium tabular-nums mt-1">
                    <span>
                      {language === 'mr'
                        ? `${toMarathiDigits(adhyay.verseCount)} ओव्या`
                        : `${adhyay.verseCount} Ovis`}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {language === 'mr'
                        ? `दिवस ${toMarathiDigits(dayNum)}`
                        : `Day ${dayNum}`}
                    </span>
                    {isBookmarked && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-orange-600 font-bold">{t('saramrutBookmarked')}</span>
                      </>
                    )}
                  </div>

                  {/* Matched Verse Excerpt when searching scripture text */}
                  {matchedVerse && searchQuery.trim().length > 0 && (
                    <p className="mt-1.5 text-[11px] text-orange-900 bg-amber-50/90 px-2.5 py-1.5 rounded-lg line-clamp-2 leading-relaxed">
                      “{matchedVerse}”
                    </p>
                  )}
                </button>

                {/* Bookmark Toggle + Open Chevron */}
                <div className="flex items-center shrink-0">
                  <button
                    onClick={() => toggleBookmark(adhyay.id)}
                    aria-label={t('saramrutBookmarked')}
                    className={`min-h-[44px] min-w-[40px] rounded-xl flex items-center justify-center transition active:scale-95 ${
                      isBookmarked
                        ? 'text-orange-600'
                        : 'text-slate-300 hover:text-orange-500'
                    }`}
                  >
                    {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openAdhyay(adhyay.id, lastRead?.adhyayId === adhyay.id ? lastRead.scrollPercent : 0)}
                    aria-label={`Open ${adhyay.titleEn}`}
                    className="min-h-[44px] min-w-[32px] flex items-center justify-center text-slate-400 hover:text-orange-700"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
