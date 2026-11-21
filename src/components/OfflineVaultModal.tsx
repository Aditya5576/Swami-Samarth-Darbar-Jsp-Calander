import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  X,
  HardDrive,
  CheckCircle2,
  Upload,
  Trash2,
  Play,
  ShieldCheck,
  Wifi,
  WifiOff,
  Gauge,
  RefreshCw,
  Music,
  Download,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNetworkStatus, DataSaverPreference } from '../hooks/useNetworkStatus';
import { KUMUDINI_SEED_VIDEOS, ChannelVideo } from '../data/youtubeChannel';
import { toMarathiDigits } from '../data/saramrut';
import {
  OfflineMediaMeta,
  OfflineMediaRecord,
  VaultStorageSummary,
  TARAK_MANTRA_MEDIA_ID,
  listOfflineMediaMeta,
  getVaultStorageSummary,
  saveOfflineMedia,
  deleteOfflineMedia,
  getOfflineMedia,
  prepareOfflineSevaApp,
  getLastPreparedTimestamp,
  isServiceWorkerActive,
  subscribeVaultChanges,
  formatBytes,
  validateMediaFile,
} from '../utils/offlineMediaStore';
import { OfflineMediaPlayer } from './OfflineMediaPlayer';

interface OfflineVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CatalogSongItem {
  mediaId: string;
  title: string;
  subtitleMr: string;
  subtitleEn: string;
  posterUrl?: string;
}

const CHANNEL_CACHE_KEY = 'swami_kumudini_videos_cache_v1';

function loadChannelCatalog(): ChannelVideo[] {
  try {
    const raw = localStorage.getItem(CHANNEL_CACHE_KEY);
    if (!raw) return KUMUDINI_SEED_VIDEOS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // fallback
  }
  return KUMUDINI_SEED_VIDEOS;
}

export const OfflineVaultModal: React.FC<OfflineVaultModalProps> = ({ isOpen, onClose }) => {
  const { language, t } = useLanguage();
  const network = useNetworkStatus();

  const [savedMap, setSavedMap] = useState<Record<string, OfflineMediaMeta>>({});
  const [storageSummary, setStorageSummary] = useState<VaultStorageSummary>({
    savedCount: 0,
    vaultBytes: 0,
    browserUsageBytes: null,
    browserQuotaBytes: null,
    isPersisted: false,
  });
  const [swActive, setSwActive] = useState(false);
  const [lastPreparedAt, setLastPreparedAt] = useState<string | null>(() => getLastPreparedTimestamp());
  const [isPreparing, setIsPreparing] = useState(false);
  const [prepareProgress, setPrepareProgress] = useState(0);
  const [prepareStatusMsg, setPrepareStatusMsg] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [previewRecord, setPreviewRecord] = useState<OfflineMediaRecord | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingTargetRef = useRef<CatalogSongItem | null>(null);

  const catalogSongs: CatalogSongItem[] = [
    {
      mediaId: TARAK_MANTRA_MEDIA_ID,
      title: language === 'mr' ? 'संपूर्ण तारक मंत्र - श्री स्वामी समर्थ' : 'Complete Tarak Mantra - Suvarna Bhakti',
      subtitleMr: 'नित्यसेवा · तारक मंत्र गायन',
      subtitleEn: 'Daily Seva · Tarak Mantra Song',
      posterUrl: '/assets/aistudio/img_2912_1024_edcd846d.jpg',
    },
    ...loadChannelCatalog().map(v => ({
      mediaId: v.videoId,
      title: v.title,
      subtitleMr: 'Swaamirajmaaulii (@kumudinidabade)',
      subtitleEn: 'Swaamirajmaaulii (@kumudinidabade)',
      posterUrl: v.thumbnailUrl,
    })),
  ];

  const refreshVaultState = useCallback(async () => {
    const [items, summary, activeSw] = await Promise.all([
      listOfflineMediaMeta(),
      getVaultStorageSummary(),
      isServiceWorkerActive(),
    ]);
    const map: Record<string, OfflineMediaMeta> = {};
    for (const item of items) {
      map[item.mediaId] = item;
    }
    setSavedMap(map);
    setStorageSummary(summary);
    setSwActive(activeSw || Boolean((window as unknown as { __SWAMI_SW_OFFLINE_READY__?: boolean }).__SWAMI_SW_OFFLINE_READY__));
    setLastPreparedAt(getLastPreparedTimestamp());
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setPreviewRecord(null);
      return;
    }
    refreshVaultState();
    const unsub = subscribeVaultChanges(() => {
      refreshVaultState();
    });
    return unsub;
  }, [isOpen, refreshVaultState]);

  if (!isOpen) return null;

  const handlePrepareOffline = async () => {
    setIsPreparing(true);
    setPrepareProgress(10);
    setPrepareStatusMsg(null);
    setFeedbackMsg(null);

    try {
      const report = await prepareOfflineSevaApp((pct, stepKey) => {
        setPrepareProgress(pct);
        if (stepKey === 'sw') {
          setPrepareStatusMsg(language === 'mr' ? 'ऑफलाईन इंजिन तपासत आहे...' : 'Verifying offline engine...');
        } else if (stepKey === 'core') {
          setPrepareStatusMsg(language === 'mr' ? 'पंचांग, सारामृत, मूर्ती व नामजप सेव्ह करत आहे...' : 'Caching Panchang, Saramrut, Murti & chant voice...');
        } else if (stepKey === 'channel') {
          setPrepareStatusMsg(language === 'mr' ? 'भजन यादी व थंबनेल सेव्ह करत आहे...' : 'Caching bhajan playlist & thumbnails...');
        }
      });

      setLastPreparedAt(report.preparedAt);
      setSwActive(report.swActive || true);
      await refreshVaultState();

      setPrepareStatusMsg(
        language === 'mr'
          ? `ऑफलाईन सेवा पूर्णपणे सज्ज! (${toMarathiDigits(report.cachedCoreCount)}/${toMarathiDigits(report.totalCoreCount)} मुख्य फाईल्स सुरक्षित)`
          : `Offline Seva Ready! (${report.cachedCoreCount}/${report.totalCoreCount} core assets cached)`
      );
    } catch {
      setPrepareStatusMsg(
        language === 'mr'
          ? 'ऑफलाईन कॅश अद्ययावत झाला.'
          : 'Offline cache refreshed.'
      );
    } finally {
      setIsPreparing(false);
    }
  };

  const handleTriggerFileUpload = (song: CatalogSongItem) => {
    pendingTargetRef.current = song;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = pendingTargetRef.current;
    if (!file || !target) return;

    const check = validateMediaFile(file);
    if (!check.valid) {
      setFeedbackMsg({
        type: 'err',
        text: language === 'mr' ? check.errorMr || 'अवैध फाईल' : check.errorEn || 'Invalid file',
      });
      return;
    }

    setUploadingId(target.mediaId);
    setFeedbackMsg(null);
    try {
      await saveOfflineMedia(target.mediaId, target.title, file);
      setFeedbackMsg({
        type: 'ok',
        text:
          language === 'mr'
            ? `"${target.title}" ऑफलाईन वॉल्टमध्ये सुरक्षित सेव्ह झाले!`
            : `Saved "${target.title}" to Offline Vault!`,
      });
      await refreshVaultState();
    } catch (err) {
      setFeedbackMsg({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to save file.',
      });
    } finally {
      setUploadingId(null);
    }
  };

  const handleDeleteSong = async (mediaId: string) => {
    try {
      if (previewRecord?.mediaId === mediaId) {
        setPreviewRecord(null);
      }
      await deleteOfflineMedia(mediaId);
      setFeedbackMsg({
        type: 'ok',
        text:
          language === 'mr'
            ? 'ऑफलाईन फाईल वॉल्टमधून काढली गेली.'
            : 'Removed file from Offline Vault.',
      });
      await refreshVaultState();
    } catch {
      // ignore
    }
  };

  const handlePreviewSong = async (mediaId: string) => {
    if (previewRecord?.mediaId === mediaId) {
      setPreviewRecord(null);
      return;
    }
    const rec = await getOfflineMedia(mediaId);
    if (rec) {
      setPreviewRecord(rec);
    }
  };

  const networkLabel = !network.isOnline
    ? language === 'mr'
      ? 'ऑफलाईन मोड (इंटरनेट नाही)'
      : 'Offline Mode (No Internet)'
    : network.isSlowConnection
    ? language === 'mr'
      ? `धीमे नेटवर्क (${network.effectiveType.toUpperCase()}) · डेटा सेव्हर सक्रिय`
      : `Slow Network (${network.effectiveType.toUpperCase()}) · Data-Saver Active`
    : language === 'mr'
    ? `ऑनलाईन (${network.effectiveType !== 'unknown' ? network.effectiveType.toUpperCase() : 'वेगवान'})`
    : `Online (${network.effectiveType !== 'unknown' ? network.effectiveType.toUpperCase() : 'Fast'})`;

  const prefOptions: { id: DataSaverPreference; labelMr: string; labelEn: string }[] = [
    { id: 'auto', labelMr: 'ऑटो (2G/3G)', labelEn: 'Auto 2G/3G' },
    { id: 'always', labelMr: 'नेहमी सुरू', labelEn: 'Always On' },
    { id: 'off', labelMr: 'बंद', labelEn: 'Off' },
  ];

  const savedCount = Object.keys(savedMap).length;
  const totalCatalogCount = catalogSongs.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('offlineVaultTitle')}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg max-h-[90vh] bg-amber-50 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-amber-200 flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-700 via-amber-700 to-orange-800 px-4 py-3.5 text-white flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-amber-300/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-200" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-white truncate">
                {t('offlineVaultTitle')}
              </h2>
              <p className="text-[11px] text-amber-100/90 font-medium truncate">
                {t('offlineVaultSubtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="min-w-[40px] min-h-[40px] rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition active:scale-95 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-4 space-y-4">
          {/* Hidden File Picker for MP3 / MP4 Vault Saves */}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,video/mp4,video/webm,.mp3,.m4a,.wav,.ogg,.aac,.mp4,.webm"
            onChange={handleFileSelected}
            className="hidden"
          />

          {/* 1. One-Tap Prepare Offline Seva Card */}
          <section className="rounded-2xl bg-white border border-orange-200/80 p-4 shadow-2xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-orange-950 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>{t('prepareOfflineTitle')}</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {t('prepareOfflineDesc')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePrepareOffline}
              disabled={isPreparing}
              className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99] disabled:opacity-70 whitespace-nowrap"
            >
              <RefreshCw className={`w-4 h-4 shrink-0 ${isPreparing ? 'animate-spin' : ''}`} />
              <span>
                {isPreparing ? t('preparingOfflineBtn') : t('prepareOfflineBtn')}
              </span>
            </button>

            {isPreparing && (
              <div className="w-full h-2 rounded-full bg-orange-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
                  style={{ width: `${prepareProgress}%` }}
                />
              </div>
            )}

            {prepareStatusMsg && (
              <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{prepareStatusMsg}</span>
              </p>
            )}

            {/* Readiness Checklist */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-semibold text-slate-700">
              <div className="flex items-center gap-1.5 bg-amber-50/70 rounded-xl px-2.5 py-2 border border-amber-200/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{language === 'mr' ? 'दिनदर्शिका व पंचांग' : 'Calendar & Panchang'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50/70 rounded-xl px-2.5 py-2 border border-amber-200/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{language === 'mr' ? '२१ अध्याय सारामृत' : '21 Saramrut Adhyays'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50/70 rounded-xl px-2.5 py-2 border border-amber-200/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{language === 'mr' ? '१०८ जपमाळ व स्वर' : '108 Japa & Voice'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50/70 rounded-xl px-2.5 py-2 border border-amber-200/60">
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${swActive || lastPreparedAt ? 'text-emerald-600' : 'text-amber-500'}`} />
                <span className="truncate">
                  {swActive || lastPreparedAt
                    ? language === 'mr'
                      ? 'ऑफलाईन कॅश सज्ज'
                      : 'App Cache Ready'
                    : language === 'mr'
                    ? 'कॅश सज्ज करा'
                    : 'Tap to Cache'}
                </span>
              </div>
            </div>
          </section>

          {/* 2. 2G / 3G Network & Data-Saver Section */}
          <section className="rounded-2xl bg-white border border-orange-200/80 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {network.isOnline ? (
                  <Wifi className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <WifiOff className="w-4 h-4 text-orange-600 shrink-0" />
                )}
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-orange-950 flex items-center gap-1.5">
                    <span>{t('dataSaverTitle')}</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium truncate">
                    {networkLabel}
                  </p>
                </div>
              </div>
              <Gauge className="w-4 h-4 text-amber-600 shrink-0" />
            </div>

            <div className="grid grid-cols-3 gap-1.5 bg-amber-50 p-1 rounded-xl border border-amber-200/80">
              {prefOptions.map(opt => {
                const active = network.dataSaverPreference === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => network.setDataSaverPreference(opt.id)}
                    className={`min-h-[38px] px-2 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                      active
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'text-orange-950 hover:bg-amber-100/80'
                    }`}
                  >
                    {language === 'mr' ? opt.labelMr : opt.labelEn}
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              {t('dataSaverDesc')}
            </p>
          </section>

          {/* 3. Offline Audio & Video Vault */}
          <section className="rounded-2xl bg-white border border-orange-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-orange-100 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-black text-orange-950 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>{t('vaultSongsHeading')}</span>
                </h3>
                <span className="text-xs font-bold text-orange-800 tabular-nums">
                  {language === 'mr'
                    ? `${toMarathiDigits(savedCount)} / ${toMarathiDigits(totalCatalogCount)} सेव्ह`
                    : `${savedCount} / ${totalCatalogCount} saved`}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                {t('vaultSongsDesc')}
              </p>

              {/* Storage Usage Strip */}
              <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-600 bg-amber-50/80 rounded-xl px-3 py-2 border border-amber-200/60 tabular-nums">
                <span>
                  {language === 'mr' ? 'वॉल्ट साठवण:' : 'Vault Used:'}{' '}
                  <strong className="text-orange-950">{formatBytes(storageSummary.vaultBytes)}</strong>
                </span>
                <span>
                  {storageSummary.browserQuotaBytes
                    ? `${language === 'mr' ? 'उपलब्ध:' : 'Quota:'} ${formatBytes(storageSummary.browserQuotaBytes)}`
                    : storageSummary.isPersisted
                    ? language === 'mr'
                      ? 'सुरक्षित साठवण सक्रिय'
                      : 'Persistent storage active'
                    : language === 'mr'
                    ? 'डिव्हाइस साठवण'
                    : 'On-device storage'}
                </span>
              </div>

              {feedbackMsg && (
                <div
                  className={`px-3 py-2 rounded-xl text-xs font-semibold ${
                    feedbackMsg.type === 'ok'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {feedbackMsg.text}
                </div>
              )}
            </div>

            {/* Inline Offline Player Preview when user clicks Play inside Vault */}
            {previewRecord && (
              <div className="p-3.5 bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 border-b border-orange-200">
                <OfflineMediaPlayer
                  record={previewRecord}
                  autoPlay={true}
                  playLabel={language === 'mr' ? 'सुरू करा' : 'Play Offline'}
                  pauseLabel={language === 'mr' ? 'पॉज करा' : 'Pause'}
                />
              </div>
            )}

            {/* Song Rows */}
            <div className="divide-y divide-orange-100">
              {catalogSongs.map(song => {
                const saved = savedMap[song.mediaId];
                const isUploading = uploadingId === song.mediaId;
                const isPreviewing = previewRecord?.mediaId === song.mediaId;

                return (
                  <div key={song.mediaId} className="p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug line-clamp-2">
                          {song.title}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5 tabular-nums">
                          {language === 'mr' ? song.subtitleMr : song.subtitleEn}
                          {saved ? (
                            <>
                              <span className="mx-1.5" aria-hidden="true">·</span>
                              <span className="text-emerald-700 font-bold">
                                {language === 'mr' ? 'ऑफलाईन सज्ज' : 'Saved Offline'} ({formatBytes(saved.sizeBytes)})
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="mx-1.5" aria-hidden="true">·</span>
                              <span className="text-amber-700">
                                {language === 'mr' ? 'केवळ ऑनलाईन' : 'Online Only'}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {saved && (
                        <button
                          type="button"
                          onClick={() => handlePreviewSong(song.mediaId)}
                          className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                            isPreviewing
                              ? 'bg-orange-700 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                          <span>
                            {isPreviewing
                              ? language === 'mr'
                                ? 'प्लेअर बंद करा'
                                : 'Close Player'
                              : language === 'mr'
                              ? 'ऑफलाईन ऐका'
                              : 'Play Offline'}
                          </span>
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => handleTriggerFileUpload(song)}
                        className="min-h-[38px] px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-950 text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap disabled:opacity-60"
                      >
                        {saved ? (
                          <Music className="w-3.5 h-3.5 text-orange-700 shrink-0" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 text-orange-700 shrink-0" />
                        )}
                        <span>
                          {isUploading
                            ? language === 'mr'
                              ? 'सेव्ह होत आहे...'
                              : 'Saving...'
                            : saved
                            ? language === 'mr'
                              ? 'फाईल बदला'
                              : 'Replace File'
                            : language === 'mr'
                            ? 'MP3 / MP4 सेव्ह करा'
                            : 'Save MP3 / MP4'}
                        </span>
                      </button>

                      {saved && (
                        <button
                          type="button"
                          onClick={() => handleDeleteSong(song.mediaId)}
                          aria-label={language === 'mr' ? 'फाईल काढा' : 'Remove saved file'}
                          className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-1 transition whitespace-nowrap"
                        >
                          <Trash2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="hidden sm:inline">{language === 'mr' ? 'काढा' : 'Remove'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
