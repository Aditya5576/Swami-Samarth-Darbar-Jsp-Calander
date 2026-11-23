import React, { useEffect, useRef, useState } from 'react';
import {
  OfflineMediaRecord,
  formatBytes,
} from '../utils/offlineMediaStore';
import { useLanguage } from '../context/LanguageContext';
import { templeSound } from '../utils/audioChime';
import {
  Play,
  Pause,
  Repeat,
  Volume2,
  HardDrive,
  Music,
} from 'lucide-react';

interface OfflineMediaPlayerProps {
  record: OfflineMediaRecord;
  posterUrl?: string;
  autoPlay?: boolean;
  playLabel: string;
  pauseLabel: string;
  onPlayStateChange?: (playing: boolean) => void;
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const OfflineMediaPlayer: React.FC<OfflineMediaPlayerProps> = ({
  record,
  posterUrl,
  autoPlay = false,
  playLabel,
  pauseLabel,
  onPlayStateChange,
}) => {
  const { language, t } = useLanguage();
  const [objectUrl, setObjectUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(record.blob);
    setObjectUrl(url);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [record]);

  useEffect(() => {
    if (!objectUrl || !autoPlay) return;
    const el = record.mediaKind === 'video' ? videoRef.current : audioRef.current;
    if (!el) return;
    const p = el.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        // Autoplay blocked until user taps Play
      });
    }
  }, [objectUrl, autoPlay, record.mediaKind]);

  const getMediaElement = (): HTMLMediaElement | null => {
    return record.mediaKind === 'video' ? videoRef.current : audioRef.current;
  };

  const handleTogglePlay = async () => {
    const el = getMediaElement();
    if (!el) return;
    if (el.paused) {
      try {
        await el.play();
      } catch {
        // Ignore playback interruption
      }
    } else {
      el.pause();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = getMediaElement();
    const nextTime = Number(e.target.value);
    if (el && Number.isFinite(nextTime)) {
      el.currentTime = nextTime;
      setCurrentTime(nextTime);
    }
  };

  const handlePlayEvent = () => {
    setIsPlaying(true);
    onPlayStateChange?.(true);
  };

  const handlePauseEvent = () => {
    setIsPlaying(false);
    onPlayStateChange?.(false);
  };

  const handleToggleLoop = () => {
    const next = !isLooping;
    setIsLooping(next);
    const el = getMediaElement();
    if (el) {
      el.loop = next;
    }
  };

  return (
    <div className="space-y-3">
      {/* Visual Stage: Native Video OR Calm Devotional Audio Stage */}
      {record.mediaKind === 'video' ? (
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video w-full border-2 border-amber-300/80 shadow-md">
          {objectUrl && (
            <video
              ref={videoRef}
              src={objectUrl}
              poster={posterUrl}
              playsInline
              loop={isLooping}
              onPlay={handlePlayEvent}
              onPause={handlePauseEvent}
              onEnded={handlePauseEvent}
              onTimeUpdate={e => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={e => setDuration(e.currentTarget.duration || 0)}
              onClick={handleTogglePlay}
              className="w-full h-full object-contain bg-black cursor-pointer"
            />
          )}
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-orange-950 via-amber-950 to-stone-950 p-4 sm:p-5 border-2 border-amber-300/70 shadow-md flex items-center gap-3.5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-300/80 bg-orange-900 shrink-0 shadow-sm">
            <img
              src={posterUrl || '/assets/aistudio/img_2912_1024_edcd846d.jpg'}
              alt={record.title}
              onError={e => {
                (e.currentTarget as HTMLImageElement).src = '/pwa-192x192.png';
              }}
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-1 text-left">
            <p className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 min-w-0">
              <HardDrive className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate whitespace-nowrap">{t('offlinePlaybackReady')}</span>
            </p>
            <p className="text-xs sm:text-sm font-black text-amber-50 leading-snug line-clamp-2">
              {record.title}
            </p>
            <p className="text-[11px] text-amber-200/80 font-medium truncate tabular-nums">
              <Music className="w-3 h-3 inline mr-1 -mt-0.5" />
              {record.fileName} · {formatBytes(record.sizeBytes)}
            </p>
          </div>
          {objectUrl && (
            <audio
              ref={audioRef}
              src={objectUrl}
              loop={isLooping}
              preload="metadata"
              onPlay={handlePlayEvent}
              onPause={handlePauseEvent}
              onEnded={handlePauseEvent}
              onTimeUpdate={e => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={e => setDuration(e.currentTarget.duration || 0)}
            />
          )}
        </div>
      )}

      {/* Scrubbing Bar & Elapsed / Total Time */}
      <div className="bg-black/20 rounded-xl px-3 py-2 border border-amber-300/25 space-y-1">
        <input
          type="range"
          min={0}
          max={duration > 0 ? duration : 100}
          step={0.5}
          value={Math.min(currentTime, duration || 100)}
          onChange={handleSeek}
          aria-label={language === 'mr' ? 'गाणे पुढे-मागे करा' : 'Seek audio position'}
          className="w-full min-h-[36px] py-3 accent-amber-300 cursor-pointer"
        />
        <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-amber-100/90 tabular-nums whitespace-nowrap">
          <span>{formatDuration(currentTime)}</span>
          <span className="text-[10px] text-amber-200/80 truncate">
            {record.mediaKind === 'video' ? 'MP4 · ' : 'MP3 · '}
            {formatBytes(record.sizeBytes)}
          </span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Primary Controls Bar: Play/Pause, Loop, Temple Bell */}
      <div className="flex items-center justify-between gap-2 flex-nowrap">
        <button
          type="button"
          onClick={handleTogglePlay}
          className={`flex-1 min-w-0 min-h-[44px] py-2.5 px-3 sm:px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer whitespace-nowrap ${
            isPlaying
              ? 'bg-amber-100 hover:bg-white text-orange-950'
              : 'bg-gradient-to-r from-amber-300 to-yellow-300 hover:from-amber-200 hover:to-yellow-200 text-orange-950'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current text-orange-900 shrink-0" />
              <span className="truncate">{pauseLabel}</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-orange-900 shrink-0" />
              <span className="truncate">{playLabel}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleToggleLoop}
          aria-pressed={isLooping}
          title={t('offlineLoopToggle')}
          className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border whitespace-nowrap shrink-0 ${
            isLooping
              ? 'bg-amber-300 text-orange-950 border-amber-100 shadow-xs'
              : 'bg-black/25 hover:bg-black/35 text-amber-100 border-amber-300/30'
          }`}
        >
          <Repeat className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">{t('offlineLoopShort')}</span>
        </button>

        <button
          type="button"
          onClick={() => templeSound.playBell(780, 0.6)}
          className="min-h-[44px] py-2.5 px-3 rounded-xl bg-black/25 hover:bg-black/35 text-amber-200 text-xs font-bold flex items-center gap-1.5 transition border border-amber-300/30 whitespace-nowrap shrink-0"
          title={t('ringBell')}
          aria-label={t('ringBell')}
        >
          <Volume2 className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">{language === 'mr' ? 'घंटानाद' : 'Bell'}</span>
        </button>
      </div>
    </div>
  );
};
