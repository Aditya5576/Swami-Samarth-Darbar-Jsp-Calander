import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  TemplePhoto,
  TempleGalleryResponse,
  TEMPLE_ALBUM_INFO,
  TEMPLE_SEED_PHOTOS,
  isValidGooglePhotoBaseUrl,
  buildGooglePhotoUrl,
} from '../data/templeGallery';
import { toMarathiDigits } from '../data/saramrut';
import { useLanguage } from '../context/LanguageContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  X,
  RefreshCw,
  ExternalLink,
  Images,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
  Eye,
} from 'lucide-react';

const GALLERY_CACHE_KEY = 'swami_temple_gallery_cache_v1';
const INITIAL_GRID_COUNT = 12;
const GRID_STEP_COUNT = 18;
const AUTOPLAY_INTERVAL_MS = 4000;

function sanitizePhotos(items: unknown): TemplePhoto[] {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  const clean: TemplePhoto[] = [];
  for (const raw of items) {
    if (!raw || typeof raw !== 'object') continue;
    const item = raw as Partial<TemplePhoto>;
    const baseUrl = typeof item.baseUrl === 'string' ? item.baseUrl.trim() : '';
    if (!isValidGooglePhotoBaseUrl(baseUrl) || seen.has(baseUrl)) continue;
    seen.add(baseUrl);
    clean.push({
      id: typeof item.id === 'string' && item.id ? item.id : `photo-${clean.length + 1}`,
      baseUrl,
      index: clean.length + 1,
    });
  }
  return clean;
}

function loadCachedPhotos(): TemplePhoto[] {
  try {
    const raw = localStorage.getItem(GALLERY_CACHE_KEY);
    if (!raw) return TEMPLE_SEED_PHOTOS;
    const parsed = sanitizePhotos(JSON.parse(raw));
    return parsed.length > 0 ? parsed : TEMPLE_SEED_PHOTOS;
  } catch {
    return TEMPLE_SEED_PHOTOS;
  }
}

export const TempleGalleryView: React.FC = () => {
  const { language, t } = useLanguage();
  const network = useNetworkStatus();

  const [photos, setPhotos] = useState<TemplePhoto[]>(() => loadCachedPhotos());
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [visibleGridCount, setVisibleGridCount] = useState(INITIAL_GRID_COUNT);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const photosCountRef = useRef(photos.length);
  photosCountRef.current = photos.length;

  const totalCount = photos.length;
  const safeIndex = totalCount > 0 ? Math.min(activeIndex, totalCount - 1) : 0;
  const activePhoto = photos[safeIndex] || TEMPLE_SEED_PHOTOS[0];

  // Responsive CDN dimensions tuned for crisp viewing and 2G/3G Data-Saver
  const featuredWidth = network.isDataSaverActive ? 720 : 1080;
  const thumbWidth = network.isDataSaverActive ? 240 : 360;
  const lightboxWidth = network.isDataSaverActive ? 1100 : 1600;

  const fetchGalleryPhotos = useCallback(
    async (manual = false) => {
      if (!navigator.onLine) {
        if (manual) {
          setSyncMessage(
            language === 'mr'
              ? 'ऑफलाईन मोड: सेव्ह केलेली मंदिर छायाचित्रे दाखवत आहे'
              : 'Offline mode: showing saved temple photos'
          );
          window.setTimeout(() => setSyncMessage(null), 3500);
        }
        return;
      }

      setIsRefreshing(true);
      const controller = new AbortController();
      const timeoutMs = network.isSlowConnection ? 5000 : 9000;
      const timer = window.setTimeout(() => controller.abort(), timeoutMs);

      try {
        const endpoint = manual
          ? '/api/gallery/temple-photos?refresh=1'
          : '/api/gallery/temple-photos';
        const res = await fetch(endpoint, {
          cache: manual ? 'no-store' : 'default',
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as TempleGalleryResponse;
        const validList = sanitizePhotos(data.photos);

        if (validList.length > 0) {
          const prevCount = photosCountRef.current;
          setPhotos(validList);
          try {
            localStorage.setItem(GALLERY_CACHE_KEY, JSON.stringify(validList));
          } catch {
            // ignore quota errors
          }

          if (manual) {
            const added = Math.max(0, validList.length - prevCount);
            setSyncMessage(
              added > 0
                ? language === 'mr'
                  ? `${toMarathiDigits(added)} नवीन फोटो जोडले गेले · एकूण ${toMarathiDigits(validList.length)} फोटो`
                  : `${added} new photo${added > 1 ? 's' : ''} added · ${validList.length} total`
                : language === 'mr'
                ? `अल्बम अद्ययावत आहे · एकूण ${toMarathiDigits(validList.length)} मंदिर छायाचित्रे`
                : `Album up to date · ${validList.length} temple photos`
            );
            window.setTimeout(() => setSyncMessage(null), 3500);
          }
        }
      } catch {
        if (manual) {
          setSyncMessage(
            language === 'mr'
              ? 'कनेक्शन धीमे आहे · सेव्ह केलेले फोटो दाखवत आहे'
              : 'Slow or offline connection · showing saved photos'
          );
          window.setTimeout(() => setSyncMessage(null), 3500);
        }
      } finally {
        window.clearTimeout(timer);
        setIsRefreshing(false);
      }
    },
    [language, network.isSlowConnection]
  );

  // Auto-sync live Google Photos album on mount when online
  useEffect(() => {
    if (network.isOnline) {
      fetchGalleryPhotos(false);
    }
  }, [fetchGalleryPhotos, network.isOnline]);

  // Auto-slideshow timer (pauses automatically while fullscreen lightbox is open)
  useEffect(() => {
    if (!isAutoPlaying || isLightboxOpen || totalCount <= 1) return;
    const interval = window.setInterval(() => {
      setActiveIndex(prev => (prev + 1) % totalCount);
    }, AUTOPLAY_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [isAutoPlaying, isLightboxOpen, totalCount]);

  // Preload next photo smoothly when not in Data-Saver mode
  useEffect(() => {
    if (network.isDataSaverActive || !network.isOnline || totalCount <= 1) return;
    const nextPhoto = photos[(safeIndex + 1) % totalCount];
    if (!nextPhoto) return;
    const img = new Image();
    img.referrerPolicy = 'no-referrer';
    img.src = buildGooglePhotoUrl(nextPhoto.baseUrl, featuredWidth, false);
  }, [safeIndex, photos, totalCount, featuredWidth, network.isDataSaverActive, network.isOnline]);

  const goPrev = useCallback(
    (pauseAuto = true) => {
      if (pauseAuto) setIsAutoPlaying(false);
      setImageLoading(true);
      setActiveIndex(prev => (prev - 1 + totalCount) % totalCount);
    },
    [totalCount]
  );

  const goNext = useCallback(
    (pauseAuto = true) => {
      if (pauseAuto) setIsAutoPlaying(false);
      setImageLoading(true);
      setActiveIndex(prev => (prev + 1) % totalCount);
    },
    [totalCount]
  );

  // Keyboard navigation in Fullscreen Darshan Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        goPrev(true);
      } else if (e.key === 'ArrowRight') {
        goNext(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, goPrev, goNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) >= 42) {
      if (delta < 0) {
        goNext(true);
      } else {
        goPrev(true);
      }
    }
  };

  const handleSelectGridPhoto = (idx: number) => {
    setIsAutoPlaying(false);
    setImageLoading(true);
    setActiveIndex(idx);
    stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleDownloadPhoto = async (photoNumber: number) => {
    if (isDownloading) return;
    setIsDownloading(true);
    setSyncMessage(null);
    try {
      const downloadUrl = `/api/gallery/download?index=${encodeURIComponent(photoNumber)}`;
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const contentType = blob.type || 'image/jpeg';
      const ext = contentType.includes('png')
        ? 'png'
        : contentType.includes('webp')
        ? 'webp'
        : 'jpg';
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `swami-samarth-darbar-darshan-${photoNumber}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 2500);

      setSyncMessage(t('galleryDownloadSuccess'));
      window.setTimeout(() => setSyncMessage(null), 3500);
    } catch {
      setSyncMessage(t('galleryDownloadError'));
      window.setTimeout(() => setSyncMessage(null), 3500);
    } finally {
      setIsDownloading(false);
    }
  };

  const visiblePhotos = photos.slice(0, visibleGridCount);
  const remainingCount = Math.max(0, totalCount - visiblePhotos.length);

  const counterText =
    language === 'mr'
      ? `${toMarathiDigits(safeIndex + 1)} / ${toMarathiDigits(totalCount)}`
      : `${safeIndex + 1} / ${totalCount}`;

  return (
    <div className="space-y-4">
      {/* 1. Featured Swipeable Darshan Slideshow Card */}
      <section
        ref={stageRef}
        className="rounded-2xl sm:rounded-3xl bg-white border border-orange-200/80 shadow-xs overflow-hidden"
      >
        {/* Clean Header Row */}
        <div className="px-4 py-3 border-b border-orange-100 flex items-center justify-between gap-2 bg-gradient-to-r from-amber-50/90 via-white to-orange-50/70">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-black text-orange-950 flex items-center gap-1.5 truncate">
              <Images className="w-4 h-4 text-orange-600 shrink-0" />
              <span className="truncate">
                {language === 'mr' ? TEMPLE_ALBUM_INFO.titleMr : TEMPLE_ALBUM_INFO.titleEn}
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
              {language === 'mr' ? TEMPLE_ALBUM_INFO.subtitleMr : TEMPLE_ALBUM_INFO.subtitleEn}
            </p>
          </div>

          <span className="text-xs font-extrabold text-orange-800 tabular-nums shrink-0 whitespace-nowrap">
            {counterText}
          </span>
        </div>

        {/* Dignified Swipeable Photo Stage (Never crops Murti portraits) */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative bg-stone-950 aspect-[4/3] sm:aspect-[16/10] w-full flex items-center justify-center overflow-hidden select-none"
        >
          <img
            key={activePhoto.baseUrl}
            src={buildGooglePhotoUrl(activePhoto.baseUrl, featuredWidth, false)}
            alt={
              language === 'mr'
                ? `श्री स्वामी समर्थ सेवा दरबार दर्शन छायाचित्र ${toMarathiDigits(safeIndex + 1)}`
                : `Shree Swami Samarth Seva Darbar photo ${safeIndex + 1}`
            }
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoading(false)}
            onError={e => {
              setImageLoading(false);
              (e.currentTarget as HTMLImageElement).src = '/assets/aistudio/img_2912_1024_edcd846d.jpg';
            }}
            onClick={() => {
              setIsAutoPlaying(false);
              setIsLightboxOpen(true);
            }}
            className={`w-full h-full object-contain cursor-pointer transition-opacity duration-200 ${
              imageLoading ? 'opacity-65' : 'opacity-100'
            }`}
          />

          {/* Subtle Left / Right Floating Navigation Arrows */}
          {totalCount > 1 && (
            <>
              <button
                type="button"
                onClick={() => goPrev(true)}
                aria-label={t('galleryPrev')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center border border-white/20 backdrop-blur-xs transition active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => goNext(true)}
                aria-label={t('galleryNext')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center border border-white/20 backdrop-blur-xs transition active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Top-right Fullscreen Tap Hint */}
          <button
            type="button"
            onClick={() => {
              setIsAutoPlaying(false);
              setIsLightboxOpen(true);
            }}
            aria-label={t('galleryFullscreen')}
            title={t('galleryFullscreen')}
            className="absolute top-2.5 right-2.5 min-w-[40px] min-h-[40px] px-2.5 rounded-xl bg-black/55 hover:bg-black/75 text-white text-[11px] font-bold flex items-center gap-1.5 border border-white/20 backdrop-blur-xs transition active:scale-95"
          >
            <Maximize2 className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{t('galleryFullscreen')}</span>
          </button>
        </div>

        {/* Slideshow Controls Bar (Clean, Unclustered with One-Tap Download) */}
        <div className="p-3 sm:p-3.5 bg-amber-50/50 border-t border-orange-100 flex items-center justify-between gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => goPrev(true)}
            aria-label={t('galleryPrev')}
            className="min-h-[42px] px-2.5 sm:px-3 py-2 rounded-xl bg-white hover:bg-orange-50 border border-orange-200 text-orange-950 text-xs font-bold flex items-center gap-1 transition active:scale-95 whitespace-nowrap shrink-0"
          >
            <ChevronLeft className="w-4 h-4 text-orange-700 shrink-0" />
            <span className="hidden sm:inline">{t('galleryPrev')}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAutoPlaying(prev => !prev)}
            className={`flex-1 min-h-[42px] px-3 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 whitespace-nowrap shadow-2xs ${
              isAutoPlaying
                ? 'bg-orange-700 hover:bg-orange-800 text-white'
                : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white'
            }`}
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current shrink-0" />
                <span>{t('galleryPauseSlideshow')}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                <span>{t('galleryPlaySlideshow')}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleDownloadPhoto(safeIndex + 1)}
            disabled={isDownloading}
            aria-label={t('galleryDownload')}
            title={t('galleryDownload')}
            className="min-h-[42px] px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-2xs transition active:scale-95 whitespace-nowrap shrink-0 disabled:opacity-65"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            ) : (
              <Download className="w-4 h-4 shrink-0" />
            )}
            <span>{isDownloading ? t('galleryDownloading') : t('galleryDownload')}</span>
          </button>

          <button
            type="button"
            onClick={() => goNext(true)}
            aria-label={t('galleryNext')}
            className="min-h-[42px] px-2.5 sm:px-3 py-2 rounded-xl bg-white hover:bg-orange-50 border border-orange-200 text-orange-950 text-xs font-bold flex items-center gap-1 transition active:scale-95 whitespace-nowrap shrink-0"
          >
            <span className="hidden sm:inline">{t('galleryNext')}</span>
            <ChevronRight className="w-4 h-4 text-orange-700 shrink-0" />
          </button>
        </div>
      </section>

      {/* 2. Uncluttered Expandable Photo Grid */}
      <section className="rounded-2xl sm:rounded-3xl bg-white border border-orange-200/80 shadow-xs p-3.5 sm:p-4 space-y-3.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="min-w-0">
            <h3 className="text-sm font-black text-orange-950">
              {t('galleryAllPhotosHeading')}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium tabular-nums mt-0.5">
              {language === 'mr'
                ? `एकूण ${toMarathiDigits(totalCount)} मंदिर फोटो · पाहण्यासाठी कोणत्याही फोटोवर टॅप करा`
                : `${totalCount} temple photos · Tap any photo to view above`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchGalleryPhotos(true)}
            disabled={isRefreshing}
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-950 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 whitespace-nowrap disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-orange-700 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? t('gallerySyncing') : t('galleryRefresh')}</span>
          </button>
        </div>

        {syncMessage && (
          <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Spacious 3-Column Mobile / 4-Column Desktop Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-2.5">
          {visiblePhotos.map((photo, idx) => {
            const isSelected = idx === safeIndex;
            return (
              <button
                key={photo.id}
                type="button"
                onClick={() => handleSelectGridPhoto(idx)}
                aria-label={
                  language === 'mr'
                    ? `फोटो ${toMarathiDigits(idx + 1)} पहा`
                    : `View temple photo ${idx + 1}`
                }
                className={`relative aspect-square rounded-xl overflow-hidden bg-amber-100/70 transition active:scale-95 focus:outline-none ${
                  isSelected
                    ? 'ring-3 ring-orange-600 ring-offset-2 shadow-sm'
                    : 'border border-orange-200/70 hover:opacity-90'
                }`}
              >
                <img
                  src={buildGooglePhotoUrl(photo.baseUrl, thumbWidth, true)}
                  alt=""
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).src = '/pwa-192x192.png';
                  }}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>

        {/* Expand / Collapse Controls */}
        {(remainingCount > 0 || visibleGridCount > INITIAL_GRID_COUNT) && (
          <div className="flex items-center justify-center gap-2 pt-1">
            {remainingCount > 0 && (
              <button
                type="button"
                onClick={() =>
                  setVisibleGridCount(prev => Math.min(totalCount, prev + GRID_STEP_COUNT))
                }
                className="min-h-[42px] px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-950 text-xs font-extrabold flex items-center gap-1.5 transition active:scale-95 whitespace-nowrap"
              >
                <ChevronDown className="w-4 h-4 text-orange-700 shrink-0" />
                <span>
                  {language === 'mr'
                    ? `अजून फोटो पहा (${toMarathiDigits(remainingCount)} शिल्लक)`
                    : `Show More Photos (${remainingCount} more)`}
                </span>
              </button>
            )}

            {visibleGridCount > INITIAL_GRID_COUNT && (
              <button
                type="button"
                onClick={() => setVisibleGridCount(INITIAL_GRID_COUNT)}
                className="min-h-[42px] px-3.5 py-2 rounded-xl bg-white hover:bg-amber-50 border border-orange-200/80 text-slate-700 text-xs font-bold flex items-center gap-1 transition active:scale-95 whitespace-nowrap"
              >
                <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{t('galleryShowLess')}</span>
              </button>
            )}
          </div>
        )}
      </section>

      {/* 3. Direct Google Photos Album Link Card Below Gallery (View & Download Only) */}
      <section className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-50 via-white to-orange-50 border border-orange-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-black text-orange-950 flex items-center gap-1.5">
              <Images className="w-4 h-4 text-orange-600 shrink-0" />
              <span>{t('galleryAlbumLinkTitle')}</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-700 inline-flex items-center gap-1">
              <Eye className="w-3 h-3 shrink-0" />
              <span>{t('galleryViewOnlyNote')}</span>
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t('galleryAlbumLinkDesc')}
          </p>
        </div>

        <a
          href={TEMPLE_ALBUM_INFO.shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-sm transition active:scale-95 whitespace-nowrap shrink-0"
        >
          <span>{t('galleryOpenGooglePhotos')}</span>
          <ExternalLink className="w-4 h-4 shrink-0" />
        </a>
      </section>

      {/* 4. Fullscreen Darshan Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('galleryFullscreen')}
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-3 sm:p-5 select-none"
        >
          {/* Top Bar */}
          <div
            className="flex items-center justify-between gap-2 text-white"
            onClick={e => e.stopPropagation()}
          >
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-black text-amber-200 truncate">
                {language === 'mr' ? TEMPLE_ALBUM_INFO.titleMr : TEMPLE_ALBUM_INFO.titleEn}
              </p>
              <p className="text-[11px] text-white/75 font-semibold tabular-nums">
                {counterText}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleDownloadPhoto(safeIndex + 1)}
                disabled={isDownloading}
                aria-label={t('galleryDownload')}
                className="min-h-[40px] px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 transition active:scale-95 whitespace-nowrap disabled:opacity-65"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                ) : (
                  <Download className="w-4 h-4 shrink-0" />
                )}
                <span>{isDownloading ? t('galleryDownloading') : t('galleryDownload')}</span>
              </button>

              <a
                href={TEMPLE_ALBUM_INFO.shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={t('galleryOpenGooglePhotos')}
                className="min-h-[40px] px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap"
              >
                <span className="hidden sm:inline">Google Photos</span>
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>

              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                aria-label={t('close')}
                className="min-w-[42px] min-h-[42px] rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Swipeable High-Res Darshan Image */}
          <div
            onClick={e => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative flex-1 flex items-center justify-center my-3 min-h-0"
          >
            <img
              key={`lb-${activePhoto.baseUrl}`}
              src={buildGooglePhotoUrl(activePhoto.baseUrl, lightboxWidth, false)}
              alt={
                language === 'mr'
                  ? `मंदिर दर्शन छायाचित्र ${toMarathiDigits(safeIndex + 1)}`
                  : `Temple Darshan photo ${safeIndex + 1}`
              }
              referrerPolicy="no-referrer"
              onError={e => {
                (e.currentTarget as HTMLImageElement).src = '/assets/aistudio/img_2912_1024_edcd846d.jpg';
              }}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            />

            {totalCount > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goPrev(true)}
                  aria-label={t('galleryPrev')}
                  className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 min-w-[46px] min-h-[46px] rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/25 transition active:scale-95"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => goNext(true)}
                  aria-label={t('galleryNext')}
                  className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 min-w-[46px] min-h-[46px] rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/25 transition active:scale-95"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Swipe Hint */}
          <p className="text-center text-[11px] text-white/65 font-medium">
            {language === 'mr'
              ? 'फोटो बदलण्यासाठी डावीकडे किंवा उजवीकडे स्वाइप करा'
              : 'Swipe left or right to browse temple photos'}
          </p>
        </div>
      )}
    </div>
  );
};
