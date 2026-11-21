import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChannelVideo,
  ChannelFeedResponse,
  KUMUDINI_CHANNEL_INFO,
  KUMUDINI_SEED_VIDEOS,
  isValidYouTubeVideoId,
} from '../data/youtubeChannel';
import { toMarathiDigits } from '../data/saramrut';
import { useLanguage } from '../context/LanguageContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { templeSound } from '../utils/audioChime';
import {
  OfflineMediaMeta,
  OfflineMediaRecord,
  listOfflineMediaMeta,
  getOfflineMedia,
  saveOfflineMedia,
  subscribeVaultChanges,
  validateMediaFile,
  formatBytes,
} from '../utils/offlineMediaStore';
import { OfflineMediaPlayer } from './OfflineMediaPlayer';
import {
  Play,
  Pause,
  RefreshCw,
  ExternalLink,
  Volume2,
  Music,
  Youtube,
  CheckCircle2,
  ListVideo,
  HardDrive,
  Upload,
  WifiOff,
  Gauge,
} from 'lucide-react';

interface SwamiVideosViewProps {
  onOpenOfflineVault?: () => void;
}

const CACHE_KEY = 'swami_kumudini_videos_cache_v1';

const MARATHI_MONTHS = [
  'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
  'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर',
];

const ENGLISH_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatPublishDate(isoStr: string, lang: 'mr' | 'en'): string {
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '';
  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();
  if (lang === 'mr') {
    return `${toMarathiDigits(day)} ${MARATHI_MONTHS[month]} ${toMarathiDigits(year)}`;
  }
  return `${ENGLISH_MONTHS[month]} ${day}, ${year}`;
}

function sanitizeVideos(items: unknown): ChannelVideo[] {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  const clean: ChannelVideo[] = [];
  for (const raw of items) {
    if (!raw || typeof raw !== 'object') continue;
    const item = raw as Partial<ChannelVideo>;
    const videoId = typeof item.videoId === 'string' ? item.videoId.trim() : '';
    if (!isValidYouTubeVideoId(videoId) || seen.has(videoId)) continue;
    seen.add(videoId);
    clean.push({
      videoId,
      title: typeof item.title === 'string' && item.title.trim() ? item.title.trim() : 'Shree Swami Samarth Bhajan',
      publishedAt: typeof item.publishedAt === 'string' ? item.publishedAt : '',
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    });
  }
  return clean;
}

function loadCachedVideos(): ChannelVideo[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return KUMUDINI_SEED_VIDEOS;
    const sanitized = sanitizeVideos(JSON.parse(raw));
    return sanitized.length > 0 ? sanitized : KUMUDINI_SEED_VIDEOS;
  } catch {
    return KUMUDINI_SEED_VIDEOS;
  }
}

export const SwamiVideosView: React.FC<SwamiVideosViewProps> = ({ onOpenOfflineVault }) => {
  const { language, t } = useLanguage();
  const network = useNetworkStatus();

  const [videos, setVideos] = useState<ChannelVideo[]>(() => loadCachedVideos());
  const [activeVideoId, setActiveVideoId] = useState<string>(
    () => loadCachedVideos()[0]?.videoId || KUMUDINI_SEED_VIDEOS[0].videoId
  );
  const [shouldAutoplay, setShouldAutoplay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [failedThumbs, setFailedThumbs] = useState<Record<string, boolean>>({});

  // Offline Vault & 2G/3G Data-Saver state
  const [savedMetaMap, setSavedMetaMap] = useState<Record<string, OfflineMediaMeta>>({});
  const [activeOfflineRecord, setActiveOfflineRecord] = useState<OfflineMediaRecord | null>(null);
  const [preferYouTubeWhenOnline, setPreferYouTubeWhenOnline] = useState(false);
  const [loadedYouTubeIds, setLoadedYouTubeIds] = useState<Record<string, boolean>>({});
  const [isSavingFile, setIsSavingFile] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerCardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videosRef = useRef<ChannelVideo[]>(videos);
  videosRef.current = videos;

  const activeVideo =
    videos.find(v => v.videoId === activeVideoId) || videos[0] || KUMUDINI_SEED_VIDEOS[0];

  // Load saved offline media index & active song blob from IndexedDB
  const syncOfflineVault = useCallback(async () => {
    const items = await listOfflineMediaMeta();
    const map: Record<string, OfflineMediaMeta> = {};
    for (const item of items) {
      map[item.mediaId] = item;
    }
    setSavedMetaMap(map);
    const activeRec = await getOfflineMedia(activeVideo.videoId);
    setActiveOfflineRecord(activeRec);
  }, [activeVideo.videoId]);

  useEffect(() => {
    syncOfflineVault();
    return subscribeVaultChanges(() => {
      syncOfflineVault();
    });
  }, [syncOfflineVault]);

  const fetchChannelVideos = useCallback(
    async (manual = false) => {
      if (!navigator.onLine) {
        if (manual) {
          setSyncMessage(
            language === 'mr'
              ? 'ऑफलाईन मोड: सेव्ह केलेली भजने दाखवत आहे'
              : 'Offline mode: showing cached devotional playlist'
          );
          window.setTimeout(() => setSyncMessage(null), 3500);
        }
        return;
      }

      setIsRefreshing(true);
      const controller = new AbortController();
      const timeoutMs = network.isSlowConnection ? 4500 : 8000;
      const timer = window.setTimeout(() => controller.abort(), timeoutMs);

      try {
        const endpoint = manual
          ? '/api/youtube/kumudinidabade?refresh=1'
          : '/api/youtube/kumudinidabade';
        const res = await fetch(endpoint, {
          cache: manual ? 'no-store' : 'default',
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as ChannelFeedResponse;
        const validList = sanitizeVideos(data.videos);

        if (validList.length > 0) {
          const prevIds = new Set(videosRef.current.map(v => v.videoId));
          const newCount = validList.filter(v => !prevIds.has(v.videoId)).length;

          setVideos(validList);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(validList));
          } catch {
            // ignore quota errors
          }

          if (manual) {
            if (newCount > 0) {
              setSyncMessage(
                language === 'mr'
                  ? `${toMarathiDigits(newCount)} नवीन व्हिडिओ जोडले गेले!`
                  : `${newCount} new video${newCount > 1 ? 's' : ''} loaded from channel!`
              );
            } else {
              setSyncMessage(
                language === 'mr'
                  ? `चॅनेल अद्ययावत आहे · एकूण ${toMarathiDigits(validList.length)} व्हिडिओ`
                  : `Up to date · ${validList.length} videos synced`
              );
            }
            window.setTimeout(() => setSyncMessage(null), 3500);
          }
        }
      } catch {
        if (manual) {
          setSyncMessage(
            language === 'mr'
              ? 'ऑफलाईन / धीमे नेटवर्क: सेव्ह केलेले व्हिडिओ दाखवत आहे'
              : 'Offline or slow network: showing saved channel videos'
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

  // Auto-sync live uploads only when online and not in Data-Saver mode
  useEffect(() => {
    if (network.isOnline && !network.isDataSaverActive) {
      fetchChannelVideos(false);
    }
  }, [fetchChannelVideos, network.isOnline, network.isDataSaverActive]);

  const handleTogglePlayPause = () => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    if (!isPlaying) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
        '*'
      );
      setIsPlaying(true);
    } else {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
        '*'
      );
      setIsPlaying(false);
    }
  };

  const handleSelectVideo = (video: ChannelVideo) => {
    if (video.videoId === activeVideo.videoId) {
      if (!useOfflinePlayer) {
        handleTogglePlayPause();
      }
      return;
    }
    setActiveVideoId(video.videoId);
    setPreferYouTubeWhenOnline(false);
    setShouldAutoplay(!network.isDataSaverActive || Boolean(savedMetaMap[video.videoId]));
    setIsPlaying(false);
    playerCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleSaveCurrentFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const check = validateMediaFile(file);
    if (!check.valid) {
      setSyncMessage(language === 'mr' ? check.errorMr || 'अवैध फाईल' : check.errorEn || 'Invalid file');
      window.setTimeout(() => setSyncMessage(null), 4000);
      return;
    }

    setIsSavingFile(true);
    try {
      await saveOfflineMedia(activeVideo.videoId, activeVideo.title, file);
      setPreferYouTubeWhenOnline(false);
      await syncOfflineVault();
      setSyncMessage(
        language === 'mr'
          ? 'भजन ऑफलाईन वॉल्टमध्ये सेव्ह झाले! आता इंटरनेटशिवाय ऐकता येईल.'
          : 'Saved to Offline Vault! You can now play this bhajan 100% offline.'
      );
      window.setTimeout(() => setSyncMessage(null), 4000);
    } catch {
      setSyncMessage(
        language === 'mr' ? 'फाईल सेव्ह करताना अडचण आली.' : 'Could not save offline file.'
      );
      window.setTimeout(() => setSyncMessage(null), 3500);
    } finally {
      setIsSavingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const safeEmbedId = isValidYouTubeVideoId(activeVideo.videoId)
    ? activeVideo.videoId
    : KUMUDINI_SEED_VIDEOS[0].videoId;

  const hasOfflineFile = Boolean(activeOfflineRecord);
  const useOfflinePlayer = hasOfflineFile && (!network.isOnline || !preferYouTubeWhenOnline);
  const showDataSaverFacade =
    !useOfflinePlayer &&
    network.isOnline &&
    network.isDataSaverActive &&
    !loadedYouTubeIds[safeEmbedId];
  const showOfflinePlaceholder = !useOfflinePlayer && !network.isOnline;

  const embedUrl = `https://www.youtube-nocookie.com/embed/${safeEmbedId}?enablejsapi=1&playsinline=1&rel=0&modestbranding=1${
    shouldAutoplay ? '&autoplay=1' : ''
  }`;

  const savedSongsCount = videos.filter(v => Boolean(savedMetaMap[v.videoId])).length;

  return (
    <div className="space-y-4">
      {/* Hidden File Input for Quick Per-Song Offline Save */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,video/mp4,video/webm,.mp3,.m4a,.wav,.ogg,.aac,.mp4,.webm"
        onChange={handleSaveCurrentFile}
        className="hidden"
      />

      {/* 1. Featured Video / Offline Audio Player Card */}
      <div
        ref={playerCardRef}
        className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 p-3.5 sm:p-5 text-white shadow-md border border-amber-300 space-y-3"
      >
        {/* Channel Header Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl p-0.5 bg-amber-200 ring-2 ring-white/70 overflow-hidden shrink-0 shadow-xs">
              <img
                src="/pwa-192x192.png"
                alt={KUMUDINI_CHANNEL_INFO.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-100">
                <Music className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                <span className="truncate">{KUMUDINI_CHANNEL_INFO.handle}</span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-white truncate">
                {KUMUDINI_CHANNEL_INFO.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Switch between Saved Offline File & Online YouTube when both available */}
            {hasOfflineFile && network.isOnline && (
              <div className="flex items-center bg-black/25 rounded-xl p-0.5 border border-amber-300/30">
                <button
                  type="button"
                  onClick={() => setPreferYouTubeWhenOnline(false)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition ${
                    !preferYouTubeWhenOnline
                      ? 'bg-amber-300 text-orange-950 shadow-2xs'
                      : 'text-amber-100 hover:text-white'
                  }`}
                >
                  {t('switchToOfflineAudio')}
                </button>
                <button
                  type="button"
                  onClick={() => setPreferYouTubeWhenOnline(true)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition ${
                    preferYouTubeWhenOnline
                      ? 'bg-amber-300 text-orange-950 shadow-2xs'
                      : 'text-amber-100 hover:text-white'
                  }`}
                >
                  {t('switchToYouTubeStream')}
                </button>
              </div>
            )}

            <a
              href={activeVideo.watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[36px] px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1 shrink-0 transition whitespace-nowrap"
              title={language === 'mr' ? 'YouTube वर पहा' : 'Watch on YouTube'}
            >
              <span className="hidden sm:inline">YouTube</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>
        </div>

        {/* Smart 3-State Player Stage */}
        {useOfflinePlayer && activeOfflineRecord ? (
          <OfflineMediaPlayer
            record={activeOfflineRecord}
            posterUrl={activeVideo.thumbnailUrl}
            autoPlay={shouldAutoplay}
            playLabel={t('swamiVideosPlay')}
            pauseLabel={t('swamiVideosPause')}
            onPlayStateChange={setIsPlaying}
          />
        ) : showOfflinePlaceholder ? (
          <div className="rounded-2xl bg-black/35 border border-amber-300/40 p-4 sm:p-5 text-center space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center mx-auto">
              <WifiOff className="w-5 h-5 text-amber-200" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-white leading-snug line-clamp-2">
                {activeVideo.title}
              </h3>
              <p className="text-xs text-amber-100/90 leading-relaxed max-w-sm mx-auto">
                {t('offlineNoFileNotice')}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
              <button
                type="button"
                disabled={isSavingFile}
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-300 to-yellow-300 hover:from-amber-200 hover:to-yellow-200 text-orange-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-sm transition active:scale-95 whitespace-nowrap"
              >
                <Upload className="w-4 h-4 shrink-0" />
                <span>{t('saveOfflineFileBtn')}</span>
              </button>
              {onOpenOfflineVault && (
                <button
                  type="button"
                  onClick={onOpenOfflineVault}
                  className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-black/30 hover:bg-black/40 border border-amber-300/35 text-amber-100 font-bold text-xs flex items-center gap-1.5 transition whitespace-nowrap"
                >
                  <HardDrive className="w-4 h-4 shrink-0" />
                  <span>{t('openOfflineVaultBtn')}</span>
                </button>
              )}
            </div>
          </div>
        ) : showDataSaverFacade ? (
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden bg-stone-950 aspect-video w-full border-2 border-amber-300/80 shadow-md">
              {!failedThumbs[activeVideo.videoId] ? (
                <img
                  src={activeVideo.thumbnailUrl}
                  alt={activeVideo.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-75"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-800 to-stone-950" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30 flex flex-col items-center justify-center p-4 text-center gap-2.5">
                <p className="text-[11px] font-bold text-amber-200 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('dataSaverActiveNotice')}</span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setLoadedYouTubeIds(prev => ({ ...prev, [safeEmbedId]: true }));
                    setShouldAutoplay(true);
                    setIsPlaying(true);
                  }}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-300 to-yellow-300 hover:from-amber-200 hover:to-yellow-200 text-orange-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition active:scale-95 whitespace-nowrap"
                >
                  <Play className="w-4 h-4 fill-current shrink-0" />
                  <span>{t('dataSaverTapToLoad')}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Embedded 16:9 YouTube Player */}
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video w-full border-2 border-amber-300/80 shadow-md">
              <iframe
                key={safeEmbedId}
                ref={iframeRef}
                src={embedUrl}
                title={activeVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Play / Pause Toggle Button Bar */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleTogglePlayPause}
                className={`flex-1 min-h-[44px] py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer whitespace-nowrap ${
                  isPlaying
                    ? 'bg-amber-100 hover:bg-white text-orange-950'
                    : 'bg-gradient-to-r from-amber-300 to-yellow-300 hover:from-amber-200 hover:to-yellow-200 text-orange-950'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current text-orange-900 shrink-0" />
                    <span>{t('swamiVideosPause')}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current text-orange-900 shrink-0" />
                    <span>{t('swamiVideosPlay')}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => templeSound.playBell(780, 0.6)}
                className="min-h-[44px] py-2.5 px-3.5 rounded-xl bg-black/25 hover:bg-black/35 text-amber-200 text-xs font-bold flex items-center gap-1.5 transition border border-amber-300/30 whitespace-nowrap shrink-0"
                title={t('ringBell')}
                aria-label={t('ringBell')}
              >
                <Volume2 className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">{language === 'mr' ? 'घंटानाद' : 'Bell'}</span>
              </button>
            </div>
          </>
        )}

        {/* Active Video Title, Metadata & Quick Offline Save Action */}
        <div className="flex items-end justify-between gap-2 pt-0.5 px-0.5 flex-wrap">
          <div className="min-w-0 flex-1 space-y-0.5">
            <h3 className="text-sm sm:text-base font-black text-white leading-snug line-clamp-2">
              {activeVideo.title}
            </h3>
            <p className="text-[11px] text-amber-100/90 font-medium">
              {language === 'mr' ? KUMUDINI_CHANNEL_INFO.artistMr : KUMUDINI_CHANNEL_INFO.artistEn}
              {activeVideo.publishedAt && (
                <>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <span className="tabular-nums">{formatPublishDate(activeVideo.publishedAt, language)}</span>
                </>
              )}
            </p>
          </div>

          {!showOfflinePlaceholder && (
            <button
              type="button"
              disabled={isSavingFile}
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[36px] px-2.5 py-1.5 rounded-xl bg-black/25 hover:bg-black/35 border border-amber-300/35 text-amber-100 text-[11px] font-bold flex items-center gap-1.5 transition whitespace-nowrap shrink-0"
            >
              <Upload className="w-3.5 h-3.5 shrink-0" />
              <span>
                {hasOfflineFile
                  ? language === 'mr'
                    ? 'ऑफलाईन फाईल बदला'
                    : 'Replace Offline'
                  : t('saveOfflineFileBtn')}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Channel Controls & Playlist Card */}
      <div className="rounded-2xl sm:rounded-3xl bg-white border border-orange-200/80 shadow-xs overflow-hidden">
        {/* Action Header: Video Count, Refresh Uploads, Offline Vault & Subscribe */}
        <div className="p-3.5 sm:p-4 border-b border-orange-100 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black text-orange-950 flex items-center gap-1.5">
                <ListVideo className="w-4 h-4 text-orange-600 shrink-0" />
                <span className="truncate">{t('swamiVideosPlaylistTitle')}</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium tabular-nums mt-0.5">
                {language === 'mr'
                  ? `${toMarathiDigits(videos.length)} भजने · ${toMarathiDigits(savedSongsCount)} ऑफलाईन सेव्ह`
                  : `${videos.length} devotional videos · ${savedSongsCount} saved offline`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => fetchChannelVideos(true)}
              disabled={isRefreshing}
              className="flex-1 sm:flex-none min-h-[42px] px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-950 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 whitespace-nowrap disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-orange-700 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? t('swamiVideosSyncing') : t('swamiVideosRefresh')}</span>
            </button>

            {onOpenOfflineVault && (
              <button
                type="button"
                onClick={onOpenOfflineVault}
                className="flex-1 sm:flex-none min-h-[42px] px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300/80 text-orange-950 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 whitespace-nowrap"
              >
                <HardDrive className="w-3.5 h-3.5 text-orange-700 shrink-0" />
                <span>{t('openOfflineVaultBtn')}</span>
              </button>
            )}

            <a
              href={KUMUDINI_CHANNEL_INFO.subscribeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none min-h-[42px] px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 whitespace-nowrap shadow-2xs"
            >
              <Youtube className="w-4 h-4 shrink-0" />
              <span>{t('swamiVideosSubscribe')}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>

          {/* Sync / Save Status Confirmation */}
          {syncMessage && (
            <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{syncMessage}</span>
            </div>
          )}
        </div>

        {/* Playlist Rows */}
        <div className="divide-y divide-orange-100">
          {videos.map((video, index) => {
            const isSelected = video.videoId === activeVideo.videoId;
            const thumbFailed = failedThumbs[video.videoId];
            const savedMeta = savedMetaMap[video.videoId];

            return (
              <button
                key={video.videoId}
                type="button"
                onClick={() => handleSelectVideo(video)}
                className={`w-full min-h-[76px] p-3 sm:p-3.5 flex items-center gap-3 text-left transition-colors active:scale-[0.99] ${
                  isSelected ? 'bg-orange-50/90' : 'bg-white hover:bg-amber-50/50'
                }`}
              >
                {/* 16:9 Thumbnail with Fallback & Scrim */}
                <div className="relative w-28 sm:w-32 aspect-video rounded-xl overflow-hidden bg-stone-900 shrink-0 border border-orange-200/70 shadow-2xs">
                  {!thumbFailed ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={() =>
                        setFailedThumbs(prev => ({ ...prev, [video.videoId]: true }))
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-600 to-amber-800 flex flex-col items-center justify-center text-amber-100 p-2">
                      <Music className="w-5 h-5" />
                      <span className="text-[9px] font-bold mt-1 truncate max-w-full">
                        {KUMUDINI_CHANNEL_INFO.name}
                      </span>
                    </div>
                  )}

                  {/* Contrast Scrim & Play/Active Indicator */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition ${
                      isSelected
                        ? 'bg-black/50'
                        : 'bg-gradient-to-t from-black/55 via-black/15 to-transparent'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                        isSelected
                          ? 'bg-orange-600 text-white'
                          : 'bg-black/65 text-white'
                      }`}
                    >
                      {isSelected && isPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </span>
                  </div>
                </div>

                {/* Video Title & Unboxed Metadata */}
                <div className="min-w-0 flex-1 space-y-1">
                  <p
                    className={`text-xs sm:text-sm font-extrabold leading-snug line-clamp-2 ${
                      isSelected ? 'text-orange-950' : 'text-slate-900'
                    }`}
                  >
                    {video.title}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 tabular-nums flex-wrap">
                    <span>
                      {language === 'mr'
                        ? `#${toMarathiDigits(index + 1)}`
                        : `#${index + 1}`}
                    </span>
                    {video.publishedAt && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{formatPublishDate(video.publishedAt, language)}</span>
                      </>
                    )}
                    {savedMeta && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-700 font-bold">
                          {language === 'mr'
                            ? `ऑफलाईन (${formatBytes(savedMeta.sizeBytes)})`
                            : `Offline (${formatBytes(savedMeta.sizeBytes)})`}
                        </span>
                      </>
                    )}
                    {isSelected && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-orange-700 font-bold">
                          {language === 'mr' ? 'सध्या सुरू' : 'Now Playing'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
