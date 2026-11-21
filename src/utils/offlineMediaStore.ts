import { KUMUDINI_SEED_VIDEOS } from '../data/youtubeChannel';

const DB_NAME = 'swami_offline_vault_v1';
const DB_VERSION = 1;
const STORE_NAME = 'media_files';
const VAULT_EVENT = 'swami-offline-vault-updated';
const OFFLINE_CACHE_NAME = 'swami-offline-seva-assets-v1';
const PREPARED_AT_KEY = 'swami_offline_seva_prepared_at';
const CHANNEL_CACHE_KEY = 'swami_kumudini_videos_cache_v1';

export const TARAK_MANTRA_MEDIA_ID = 'tarak_mantra_9f5E0fBuJdU';
export const MAX_OFFLINE_FILE_BYTES = 150 * 1024 * 1024; // 150 MB per devotional audio/video file

const ALLOWED_EXTENSIONS = ['.mp3', '.m4a', '.wav', '.ogg', '.aac', '.opus', '.flac', '.mp4', '.webm', '.mov'];

export interface OfflineMediaMeta {
  mediaId: string;
  title: string;
  fileName: string;
  mimeType: string;
  mediaKind: 'audio' | 'video';
  sizeBytes: number;
  savedAt: string;
}

export interface OfflineMediaRecord extends OfflineMediaMeta {
  blob: Blob;
}

export interface VaultStorageSummary {
  savedCount: number;
  vaultBytes: number;
  browserUsageBytes: number | null;
  browserQuotaBytes: number | null;
  isPersisted: boolean;
}

export interface OfflinePrepareReport {
  swActive: boolean;
  cachedCoreCount: number;
  totalCoreCount: number;
  cachedThumbsCount: number;
  savedSongsCount: number;
  preparedAt: string;
  isPersisted: boolean;
}

function openVaultDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'mediaId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open offline media vault.'));
  });
}

function notifyVaultUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(VAULT_EVENT));
  }
}

export function subscribeVaultChanges(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(VAULT_EVENT, listener);
  return () => window.removeEventListener(VAULT_EVENT, listener);
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export function validateMediaFile(file: File): {
  valid: boolean;
  mediaKind: 'audio' | 'video';
  mimeType: string;
  errorMr?: string;
  errorEn?: string;
} {
  if (!file || file.size <= 0) {
    return {
      valid: false,
      mediaKind: 'audio',
      mimeType: 'audio/mpeg',
      errorMr: 'कृपया वैध MP3 किंवा MP4 फाईल निवडा.',
      errorEn: 'Please choose a valid MP3 or MP4 file.',
    };
  }

  if (file.size > MAX_OFFLINE_FILE_BYTES) {
    return {
      valid: false,
      mediaKind: 'audio',
      mimeType: file.type || 'audio/mpeg',
      errorMr: 'फाईल १५० MB पेक्षा लहान असावी.',
      errorEn: 'File must be smaller than 150 MB.',
    };
  }

  const lowerName = (file.name || '').toLowerCase();
  const hasAllowedExt = ALLOWED_EXTENSIONS.some(ext => lowerName.endsWith(ext));
  const mime = (file.type || '').toLowerCase();
  const isAudioMime = mime.startsWith('audio/');
  const isVideoMime = mime.startsWith('video/');

  if (!isAudioMime && !isVideoMime && !hasAllowedExt) {
    return {
      valid: false,
      mediaKind: 'audio',
      mimeType: 'audio/mpeg',
      errorMr: 'केवळ ऑडिओ (MP3, M4A, WAV) किंवा व्हिडिओ (MP4, WebM) फाईल्स चालतील.',
      errorEn: 'Only audio (MP3, M4A, WAV) or video (MP4, WebM) files are supported.',
    };
  }

  const isVideo =
    isVideoMime ||
    lowerName.endsWith('.mp4') ||
    lowerName.endsWith('.webm') ||
    lowerName.endsWith('.mov');

  const resolvedMime =
    mime ||
    (isVideo
      ? lowerName.endsWith('.webm')
        ? 'video/webm'
        : 'video/mp4'
      : lowerName.endsWith('.wav')
      ? 'audio/wav'
      : lowerName.endsWith('.ogg')
      ? 'audio/ogg'
      : lowerName.endsWith('.m4a')
      ? 'audio/mp4'
      : 'audio/mpeg');

  return {
    valid: true,
    mediaKind: isVideo ? 'video' : 'audio',
    mimeType: resolvedMime,
  };
}

export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      const alreadyPersisted = navigator.storage.persisted
        ? await navigator.storage.persisted()
        : false;
      if (alreadyPersisted) return true;
      return await navigator.storage.persist();
    }
  } catch {
    // ignore browser restrictions
  }
  return false;
}

export async function saveOfflineMedia(
  mediaId: string,
  title: string,
  file: File
): Promise<OfflineMediaMeta> {
  const check = validateMediaFile(file);
  if (!check.valid) {
    throw new Error(check.errorEn || 'Unsupported media file.');
  }

  // Ask browser to protect offline media from automatic eviction
  await requestPersistentStorage();

  const db = await openVaultDB();
  const record: OfflineMediaRecord = {
    mediaId,
    title: title.trim() || file.name,
    fileName: file.name,
    mimeType: check.mimeType,
    mediaKind: check.mediaKind,
    sizeBytes: file.size,
    savedAt: new Date().toISOString(),
    blob: file,
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Failed to save offline media.'));
  });

  db.close();
  notifyVaultUpdated();

  const { blob: _ignored, ...meta } = record;
  return meta;
}

export async function getOfflineMedia(mediaId: string): Promise<OfflineMediaRecord | null> {
  try {
    const db = await openVaultDB();
    const record = await new Promise<OfflineMediaRecord | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(mediaId);
      req.onsuccess = () => resolve((req.result as OfflineMediaRecord | undefined) || null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return record;
  } catch {
    return null;
  }
}

export async function listOfflineMediaMeta(): Promise<OfflineMediaMeta[]> {
  try {
    const db = await openVaultDB();
    const list = await new Promise<OfflineMediaMeta[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const items: OfflineMediaMeta[] = [];
      const cursorReq = store.openCursor();
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (cursor) {
          const val = cursor.value as OfflineMediaRecord;
          items.push({
            mediaId: val.mediaId,
            title: val.title,
            fileName: val.fileName,
            mimeType: val.mimeType,
            mediaKind: val.mediaKind,
            sizeBytes: val.sizeBytes,
            savedAt: val.savedAt,
          });
          cursor.continue();
        } else {
          resolve(items);
        }
      };
      cursorReq.onerror = () => reject(cursorReq.error);
    });
    db.close();
    return list;
  } catch {
    return [];
  }
}

export async function deleteOfflineMedia(mediaId: string): Promise<void> {
  const db = await openVaultDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(mediaId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Failed to remove offline media.'));
  });
  db.close();
  notifyVaultUpdated();
}

export async function getVaultStorageSummary(): Promise<VaultStorageSummary> {
  const items = await listOfflineMediaMeta();
  const vaultBytes = items.reduce((sum, item) => sum + (item.sizeBytes || 0), 0);

  let browserUsageBytes: number | null = null;
  let browserQuotaBytes: number | null = null;
  let isPersisted = false;

  try {
    if (typeof navigator !== 'undefined' && navigator.storage) {
      if (navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        if (typeof est.usage === 'number') browserUsageBytes = est.usage;
        if (typeof est.quota === 'number') browserQuotaBytes = est.quota;
      }
      if (navigator.storage.persisted) {
        isPersisted = await navigator.storage.persisted();
      }
    }
  } catch {
    // ignore browser restrictions
  }

  return {
    savedCount: items.length,
    vaultBytes,
    browserUsageBytes,
    browserQuotaBytes,
    isPersisted,
  };
}

export function getLastPreparedTimestamp(): string | null {
  try {
    return localStorage.getItem(PREPARED_AT_KEY);
  } catch {
    return null;
  }
}

export async function isServiceWorkerActive(): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return false;
    const reg = await navigator.serviceWorker.getRegistration();
    return Boolean(reg && (reg.active || reg.waiting || reg.installing));
  } catch {
    return false;
  }
}

/**
 * One-tap "Prepare Offline Seva" helper:
 * Warms app core assets, Murti portrait, chant audio, live channel feed, and bhajan thumbnails
 * into Cache Storage so Seva runs smoothly with zero internet.
 */
export async function prepareOfflineSevaApp(
  onProgress?: (percent: number, stepKey: 'sw' | 'core' | 'channel' | 'done') => void
): Promise<OfflinePrepareReport> {
  onProgress?.(15, 'sw');
  const swActive = await isServiceWorkerActive();
  const isPersisted = await requestPersistentStorage();

  const coreUrls = [
    '/',
    '/pwa-192x192.png',
    '/pwa-512x512.png',
    '/apple-touch-icon.png',
    '/assets/aistudio/img_2912_1024_edcd846d.jpg',
    '/audio/swami_samarth_chant.mp3',
  ];

  let cachedCoreCount = 0;
  let cachedThumbsCount = 0;

  onProgress?.(40, 'core');
  if (typeof caches !== 'undefined') {
    try {
      const cache = await caches.open(OFFLINE_CACHE_NAME);
      await Promise.all(
        coreUrls.map(async url => {
          try {
            const existing = await cache.match(url);
            if (existing) {
              cachedCoreCount++;
              return;
            }
            const res = await fetch(url, { cache: 'reload' });
            if (res.ok) {
              await cache.put(url, res.clone());
              cachedCoreCount++;
            }
          } catch {
            // Check if precached in any Workbox cache
            const fallbackMatch = await caches.match(url);
            if (fallbackMatch) {
              cachedCoreCount++;
            }
          }
        })
      );

      onProgress?.(72, 'channel');
      // Refresh channel feed if online and cache thumbnails for offline playlist browsing
      let thumbUrls = KUMUDINI_SEED_VIDEOS.map(v => v.thumbnailUrl);

      if (typeof navigator !== 'undefined' && navigator.onLine) {
        try {
          const controller = new AbortController();
          const timer = window.setTimeout(() => controller.abort(), 5000);
          const feedRes = await fetch('/api/youtube/kumudinidabade', { signal: controller.signal });
          window.clearTimeout(timer);
          if (feedRes.ok) {
            await cache.put('/api/youtube/kumudinidabade', feedRes.clone());
            const json = await feedRes.json();
            if (Array.isArray(json?.videos) && json.videos.length > 0) {
              localStorage.setItem(CHANNEL_CACHE_KEY, JSON.stringify(json.videos));
              thumbUrls = json.videos
                .map((v: { thumbnailUrl?: string }) => v.thumbnailUrl)
                .filter((u: unknown): u is string => typeof u === 'string' && u.startsWith('https://i.ytimg.com/'));
            }
          }
        } catch {
          // Offline or slow timeout — keep existing cached list
        }
      }

      // Warm thumbnails (opaque no-cors is cacheable in Cache Storage)
      await Promise.all(
        thumbUrls.slice(0, 15).map(async thumbUrl => {
          try {
            const existing = await cache.match(thumbUrl);
            if (existing) {
              cachedThumbsCount++;
              return;
            }
            if (typeof navigator !== 'undefined' && navigator.onLine) {
              const req = new Request(thumbUrl, { mode: 'no-cors' });
              const res = await fetch(req);
              if (res && (res.ok || res.type === 'opaque')) {
                await cache.put(thumbUrl, res);
                cachedThumbsCount++;
              }
            }
          } catch {
            // ignore individual thumbnail errors
          }
        })
      );
    } catch {
      // Cache storage unavailable
    }
  }

  const savedItems = await listOfflineMediaMeta();
  const preparedAt = new Date().toISOString();
  try {
    localStorage.setItem(PREPARED_AT_KEY, preparedAt);
  } catch {
    // ignore storage errors
  }

  onProgress?.(100, 'done');

  return {
    swActive,
    cachedCoreCount,
    totalCoreCount: coreUrls.length,
    cachedThumbsCount,
    savedSongsCount: savedItems.length,
    preparedAt,
    isPersisted,
  };
}
