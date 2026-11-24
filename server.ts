import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_DEV_FLAG = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';
const HAS_DIST_BUILD = fs.existsSync(path.resolve(__dirname, 'dist', 'index.html'));
const IS_PROD = !IS_DEV_FLAG && (process.env.NODE_ENV === 'production' || HAS_DIST_BUILD);

// Fixed, allowlisted official YouTube channel metadata for @kumudinidabade
const YOUTUBE_CHANNEL_ID = 'UCO0GP_5MwcHC5E8WJj-t_hg';
const YOUTUBE_CHANNEL_HANDLE = '@kumudinidabade';
const YOUTUBE_CHANNEL_NAME = 'Swaamirajmaaulii';
const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@kumudinidabade';
const YOUTUBE_SUBSCRIBE_URL = 'https://www.youtube.com/@kumudinidabade?sub_confirmation=1';
const YOUTUBE_RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;

const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const REFRESH_COOLDOWN_MS = 3 * 1000; // 3 seconds

// Fixed, allowlisted official Google Photos shared album for Jaysingpur Seva Darbar
const TEMPLE_ALBUM_SHARE_URL = 'https://photos.app.goo.gl/Wi3gkoXLGPUSQeeX7';
const TEMPLE_ALBUM_TITLE = 'Swami Samarth Darbar';
const GOOGLE_PHOTO_URL_REGEX = /https:\/\/lh3\.googleusercontent\.com\/pw\/[A-Za-z0-9_-]{20,}/g;
const GALLERY_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const MAX_PHOTO_DOWNLOAD_BYTES = 15 * 1024 * 1024; // 15 MB hard download cap

interface TemplePhotoItem {
  id: string;
  baseUrl: string;
  index: number;
}

const SEED_TEMPLE_PHOTOS: TemplePhotoItem[] = [
  'https://lh3.googleusercontent.com/pw/AP1GczPx3-YcCgJH8oFM8BOdnFAeAGk5QgmOaQZ6e-EsspkA9XkcC7jedv5EVCveBeWg7j4ZW4QmKTH2tq_76rzsvrAbviQhGFPVhB-OA4m_nJbpMc3hzYo',
  'https://lh3.googleusercontent.com/pw/AP1GczO4llDimcN7-2am-8kvxlfbgnAWHgBGBbo2XhHHTm2rwvlzISCC8TX5h2wjAM4i9MtUsOwX8eJhZnqbC4WO_es3HlNPzPlDbI1Lv-7Kcr4Fl4Lu5OM',
  'https://lh3.googleusercontent.com/pw/AP1GczPpsyWHA8fJLY5wUB-B_T7Ih0EmREN5Shs9nqsIykVAwACczYjSu46tZ5oxQlCxu5o0VENVU_Kb3SJZI9UfOUyzbvLNX6kFr9icrn_w1I18KNsLjWQ',
  'https://lh3.googleusercontent.com/pw/AP1GczMtYOaizJ1zWvgG5AhM-tKOU6qNn-dd8cS9eDHuNhY8V0Eb7rK-2dXTb9CzjiXA2WC_Wv1PjXYp3miKHsnKoE4PzJ7IJG7il_jLIPuq0usc3myIHeU',
  'https://lh3.googleusercontent.com/pw/AP1GczMbn0F596teJjT-pEUs_VamGy3JAEtMcg3Mlp7EMylRvZGx1loK4xFSSsAEFQaUrx9ELg-THslvWmA1sXZPXA1XqOnIOjrzO-JexlbfdJyK8dC9WkE',
  'https://lh3.googleusercontent.com/pw/AP1GczMDba03_lrODdZxAIuMYo8ZvK1fAPUPCxLlHbvUpoN_138umLI-7N-4eegjMSp9FNdHOM_qcpwFlzGL1aLDvg2Hh-KV_OUSY0p_ibMvJW31UJIEaEM',
].map((baseUrl, idx) => ({
  id: `seed-${idx + 1}`,
  baseUrl,
  index: idx + 1,
}));

let cachedGalleryPhotos: TemplePhotoItem[] | null = null;
let cachedGalleryTitle = TEMPLE_ALBUM_TITLE;
let cachedGalleryAtMs = 0;
let inFlightGalleryPromise: Promise<{ title: string; photos: TemplePhotoItem[] }> | null = null;

interface ChannelVideo {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  watchUrl: string;
}

interface ChannelFeedPayload {
  channel: {
    id: string;
    name: string;
    handle: string;
    url: string;
    subscribeUrl: string;
  };
  videos: ChannelVideo[];
  fetchedAt: string;
  source: 'live' | 'cache' | 'fallback';
}

const SEED_VIDEOS: ChannelVideo[] = [
  {
    videoId: 'EE_JQ03aKkY',
    title: 'Swami Vasale Swami Basale | Kumudini Dabade | Shri Swami Samarth Darbar Jaysingpur | Music Video',
    publishedAt: '2026-02-26T00:00:00Z',
    thumbnailUrl: 'https://i.ytimg.com/vi/EE_JQ03aKkY/hqdefault.jpg',
    watchUrl: 'https://www.youtube.com/watch?v=EE_JQ03aKkY',
  },
  {
    videoId: 'lyW-xRJ6OOk',
    title: 'Kaay Zhala Swami | Kumudini Dabade | Shri Swami Samarth Darbar Jaysingpur | Music Video',
    publishedAt: '2025-07-11T00:00:00Z',
    thumbnailUrl: 'https://i.ytimg.com/vi/lyW-xRJ6OOk/hqdefault.jpg',
    watchUrl: 'https://www.youtube.com/watch?v=lyW-xRJ6OOk',
  },
  {
    videoId: 'HemJIE_1nBA',
    title: 'Mi Aan Maze Swami | Kumudini Dabade | Shri Swami Samarth Darbar Jaysingpur | Music Video',
    publishedAt: '2025-04-26T00:00:00Z',
    thumbnailUrl: 'https://i.ytimg.com/vi/HemJIE_1nBA/hqdefault.jpg',
    watchUrl: 'https://www.youtube.com/watch?v=HemJIE_1nBA',
  },
  {
    videoId: 'Zr-JRDNWce8',
    title: 'Swami Maze Swami Maze | Kumudini Dabade | Shri Swami Samarth Darbar Jaysingpur | Music Video',
    publishedAt: '2024-12-15T00:00:00Z',
    thumbnailUrl: 'https://i.ytimg.com/vi/Zr-JRDNWce8/hqdefault.jpg',
    watchUrl: 'https://www.youtube.com/watch?v=Zr-JRDNWce8',
  },
];

let cachedVideos: ChannelVideo[] | null = null;
let cachedAtMs = 0;
let inFlightVideosPromise: Promise<ChannelVideo[]> | null = null;

function decodeXmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_match, dec) => {
      const code = Number(dec);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : '';
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_match, hex) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : '';
    })
    .trim();
}

function parseYouTubeAtomFeed(xml: string): ChannelVideo[] {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
  const parsed: ChannelVideo[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    const idMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
    const publishedMatch = entry.match(/<published>([^<]+)<\/published>/);

    const videoId = idMatch?.[1]?.trim() || '';
    if (!VIDEO_ID_REGEX.test(videoId) || seen.has(videoId)) {
      continue;
    }
    seen.add(videoId);

    const rawTitle = titleMatch?.[1] || 'Shree Swami Samarth Bhajan';
    const title = decodeXmlEntities(rawTitle);
    const publishedAt = publishedMatch?.[1]?.trim() || new Date().toISOString();

    parsed.push({
      videoId,
      title,
      publishedAt,
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    });
  }

  return parsed;
}

async function fetchLiveChannelVideos(): Promise<ChannelVideo[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(YOUTUBE_RSS_URL, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SwamiSamarthSevaApp/1.0 (+https://youtube.com/@kumudinidabade)',
        Accept: 'application/atom+xml, application/xml, text/xml',
      },
    });

    if (!response.ok) {
      throw new Error(`YouTube feed HTTP ${response.status}`);
    }

    const xmlText = await response.text();
    const videos = parseYouTubeAtomFeed(xmlText);
    if (videos.length === 0) {
      throw new Error('Empty YouTube feed response');
    }

    return videos;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchLiveTempleAlbumPhotos(): Promise<{ title: string; photos: TemplePhotoItem[] }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(TEMPLE_ALBUM_SHARE_URL, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Photos album HTTP ${response.status}`);
    }

    const html = await response.text();
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
    const rawTitle = titleMatch?.[1] ? decodeXmlEntities(titleMatch[1]) : TEMPLE_ALBUM_TITLE;

    const rawMatches = html.match(GOOGLE_PHOTO_URL_REGEX) || [];
    const seen = new Set<string>();
    const photos: TemplePhotoItem[] = [];

    for (const url of rawMatches) {
      if (seen.has(url)) continue;
      seen.add(url);
      photos.push({
        id: `gp-${photos.length + 1}`,
        baseUrl: url,
        index: photos.length + 1,
      });
    }

    if (photos.length === 0) {
      throw new Error('No photos found in shared album');
    }

    return { title: rawTitle, photos };
  } finally {
    clearTimeout(timeout);
  }
}

function getCoalescedLiveChannelVideos(): Promise<ChannelVideo[]> {
  if (!inFlightVideosPromise) {
    inFlightVideosPromise = fetchLiveChannelVideos().finally(() => {
      inFlightVideosPromise = null;
    });
  }
  return inFlightVideosPromise;
}

function getCoalescedLiveTempleAlbumPhotos(): Promise<{ title: string; photos: TemplePhotoItem[] }> {
  if (!inFlightGalleryPromise) {
    inFlightGalleryPromise = fetchLiveTempleAlbumPhotos().finally(() => {
      inFlightGalleryPromise = null;
    });
  }
  return inFlightGalleryPromise;
}

export interface PhotoDownloadOptions {
  url: string;
  fileNamePrefix: string;
  maxBytes?: number;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

/**
 * Streams an upstream image directly to the HTTP response while enforcing:
 * - Hard download byte cap even when upstream omits Content-Length
 * - Immediate upstream abort when client disconnects
 * - Distinct error status codes for timeout (504), oversized payload (413), and other upstream failures (502)
 */
export async function streamBoundedImageDownload(
  _req: Request,
  res: Response,
  options: PhotoDownloadOptions
): Promise<void> {
  const maxBytes = options.maxBytes ?? MAX_PHOTO_DOWNLOAD_BYTES;
  const timeoutMs = options.timeoutMs ?? 12000;
  const fetchFn = options.fetchImpl ?? fetch;

  const controller = new AbortController();
  let timedOut = false;
  let clientDisconnected = false;
  let exceededLimit = false;
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

  const onClientClose = () => {
    if (!res.writableEnded) {
      clientDisconnected = true;
      controller.abort(new Error('CLIENT_DISCONNECTED'));
      if (reader) {
        void reader.cancel().catch(() => {});
      }
    }
  };

  res.on('close', onClientClose);
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort(new Error('UPSTREAM_TIMEOUT'));
    if (reader) {
      void reader.cancel().catch(() => {});
    }
  }, timeoutMs);

  try {
    const upstream = await fetchFn(options.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36',
        Accept: 'image/*',
      },
    });

    if (!upstream.ok) {
      if (!res.headersSent) {
        res.status(502).json({ error: 'Unable to fetch photo for download' });
      }
      return;
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    if (!contentType.toLowerCase().startsWith('image/')) {
      if (!res.headersSent) {
        res.status(502).json({ error: 'Unexpected response format' });
      }
      return;
    }

    const rawContentLength = upstream.headers.get('content-length');
    const declaredLength = rawContentLength !== null ? Number(rawContentLength) : NaN;
    if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
      exceededLimit = true;
      controller.abort(new Error('PAYLOAD_TOO_LARGE'));
      if (upstream.body) {
        void upstream.body.cancel().catch(() => {});
      }
      if (!res.headersSent) {
        res.status(413).json({ error: 'Photo exceeds maximum allowed download size' });
      }
      return;
    }

    if (!upstream.body) {
      if (!res.headersSent) {
        res.status(502).json({ error: 'Empty upstream photo response' });
      }
      return;
    }

    const ext = contentType.includes('png')
      ? 'png'
      : contentType.includes('webp')
      ? 'webp'
      : 'jpg';

    reader = upstream.body.getReader();
    let totalBytes = 0;

    while (true) {
      if (clientDisconnected || timedOut) {
        break;
      }

      const { done, value } = await reader.read();
      if (done) break;
      if (!value || value.byteLength === 0) continue;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        exceededLimit = true;
        controller.abort(new Error('PAYLOAD_TOO_LARGE'));
        await reader.cancel().catch(() => {});
        if (!res.headersSent) {
          res.status(413).json({ error: 'Photo exceeds maximum allowed download size' });
        } else {
          res.destroy();
        }
        return;
      }

      if (!res.headersSent) {
        res.setHeader('Content-Type', contentType);
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${options.fileNamePrefix}.${ext}"`
        );
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        if (Number.isFinite(declaredLength) && declaredLength >= 0 && declaredLength <= maxBytes) {
          res.setHeader('Content-Length', String(declaredLength));
        }
      }

      const chunkBuf = Buffer.from(value.buffer, value.byteOffset, value.byteLength);
      const canContinue = res.write(chunkBuf);
      if (!canContinue && !clientDisconnected && !res.destroyed) {
        await new Promise<void>((resolve) => {
          const onDrain = () => {
            res.off('close', onClose);
            resolve();
          };
          const onClose = () => {
            res.off('drain', onDrain);
            resolve();
          };
          res.once('drain', onDrain);
          res.once('close', onClose);
        });
      }
    }

    if (!clientDisconnected && !timedOut && !exceededLimit && !res.writableEnded) {
      if (!res.headersSent) {
        res.status(502).json({ error: 'Empty upstream photo response' });
      } else {
        res.end();
      }
    }
  } catch {
    if (clientDisconnected) {
      return;
    }
    if (exceededLimit) {
      if (!res.headersSent) {
        res.status(413).json({ error: 'Photo exceeds maximum allowed download size' });
      } else {
        res.destroy();
      }
      return;
    }
    if (timedOut) {
      if (!res.headersSent) {
        res.status(504).json({ error: 'Photo download timed out' });
      } else {
        res.destroy();
      }
      return;
    }
    if (!res.headersSent) {
      res.status(502).json({ error: 'Upstream photo download failed' });
    } else {
      res.destroy();
    }
  } finally {
    clearTimeout(timeout);
    res.off('close', onClientClose);
  }
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');

  // Live YouTube channel feed proxy for @kumudinidabade (auto-updates with new uploads)
  app.get('/api/youtube/kumudinidabade', async (req: Request, res: Response) => {
    const forceRefresh = req.query.refresh === '1';
    const now = Date.now();
    const cacheAge = now - cachedAtMs;

    const channelInfo = {
      id: YOUTUBE_CHANNEL_ID,
      name: YOUTUBE_CHANNEL_NAME,
      handle: YOUTUBE_CHANNEL_HANDLE,
      url: YOUTUBE_CHANNEL_URL,
      subscribeUrl: YOUTUBE_SUBSCRIBE_URL,
    };

    const canUseCache =
      cachedVideos !== null &&
      ((!forceRefresh && cacheAge < CACHE_TTL_MS) ||
        (forceRefresh && cacheAge < REFRESH_COOLDOWN_MS));

    if (canUseCache && cachedVideos) {
      const payload: ChannelFeedPayload = {
        channel: channelInfo,
        videos: cachedVideos,
        fetchedAt: new Date(cachedAtMs).toISOString(),
        source: 'cache',
      };
      res.setHeader('Cache-Control', 'public, max-age=60');
      res.json(payload);
      return;
    }

    try {
      const liveVideos = await getCoalescedLiveChannelVideos();
      cachedVideos = liveVideos;
      cachedAtMs = Date.now();

      const payload: ChannelFeedPayload = {
        channel: channelInfo,
        videos: liveVideos,
        fetchedAt: new Date(cachedAtMs).toISOString(),
        source: 'live',
      };
      res.setHeader('Cache-Control', 'no-cache');
      res.json(payload);
    } catch {
      const fallbackVideos = cachedVideos && cachedVideos.length > 0 ? cachedVideos : SEED_VIDEOS;
      const payload: ChannelFeedPayload = {
        channel: channelInfo,
        videos: fallbackVideos,
        fetchedAt: new Date(cachedAtMs || now).toISOString(),
        source: cachedVideos ? 'cache' : 'fallback',
      };
      res.setHeader('Cache-Control', 'no-cache');
      res.json(payload);
    }
  });

  // Allowlisted Google Photos shared album proxy for Jaysingpur Seva Darbar Gallery
  app.get('/api/gallery/temple-photos', async (req: Request, res: Response) => {
    const forceRefresh = req.query.refresh === '1';
    const now = Date.now();
    const cacheAge = now - cachedGalleryAtMs;

    const canUseCache =
      cachedGalleryPhotos !== null &&
      ((!forceRefresh && cacheAge < GALLERY_CACHE_TTL_MS) ||
        (forceRefresh && cacheAge < REFRESH_COOLDOWN_MS));

    if (canUseCache && cachedGalleryPhotos) {
      res.setHeader('Cache-Control', 'public, max-age=120');
      res.json({
        album: {
          title: cachedGalleryTitle,
          shareUrl: TEMPLE_ALBUM_SHARE_URL,
        },
        photos: cachedGalleryPhotos,
        totalCount: cachedGalleryPhotos.length,
        fetchedAt: new Date(cachedGalleryAtMs).toISOString(),
        source: 'cache',
      });
      return;
    }

    try {
      const live = await getCoalescedLiveTempleAlbumPhotos();
      cachedGalleryPhotos = live.photos;
      cachedGalleryTitle = live.title;
      cachedGalleryAtMs = Date.now();

      res.setHeader('Cache-Control', 'no-cache');
      res.json({
        album: {
          title: live.title,
          shareUrl: TEMPLE_ALBUM_SHARE_URL,
        },
        photos: live.photos,
        totalCount: live.photos.length,
        fetchedAt: new Date(cachedGalleryAtMs).toISOString(),
        source: 'live',
      });
    } catch {
      const fallbackPhotos =
        cachedGalleryPhotos && cachedGalleryPhotos.length > 0
          ? cachedGalleryPhotos
          : SEED_TEMPLE_PHOTOS;
      res.setHeader('Cache-Control', 'no-cache');
      res.json({
        album: {
          title: cachedGalleryTitle,
          shareUrl: TEMPLE_ALBUM_SHARE_URL,
        },
        photos: fallbackPhotos,
        totalCount: fallbackPhotos.length,
        fetchedAt: new Date(cachedGalleryAtMs || now).toISOString(),
        source: cachedGalleryPhotos ? 'cache' : 'fallback',
      });
    }
  });

  // Read-only, allowlisted high-res photo download proxy for Sevaks (no SSRF, lookup by index only)
  app.get('/api/gallery/download', async (req: Request, res: Response) => {
    const rawIdx = Number(req.query.index);
    if (!Number.isInteger(rawIdx) || rawIdx < 1 || rawIdx > 1000) {
      res.status(400).json({ error: 'Invalid photo index' });
      return;
    }

    let pool = cachedGalleryPhotos;
    if (!pool || pool.length === 0) {
      try {
        const live = await getCoalescedLiveTempleAlbumPhotos();
        cachedGalleryPhotos = live.photos;
        cachedGalleryTitle = live.title;
        cachedGalleryAtMs = Date.now();
        pool = live.photos;
      } catch {
        pool = SEED_TEMPLE_PHOTOS;
      }
    }

    const photo = pool[rawIdx - 1];
    if (!photo || !/^https:\/\/lh3\.googleusercontent\.com\/pw\/[A-Za-z0-9_-]{20,}$/.test(photo.baseUrl)) {
      res.status(404).json({ error: 'Photo not found in album' });
      return;
    }

    await streamBoundedImageDownload(req, res, {
      url: `${photo.baseUrl}=w1800`,
      fileNamePrefix: `swami-samarth-darbar-darshan-${rawIdx}`,
      maxBytes: MAX_PHOTO_DOWNLOAD_BYTES,
      timeoutMs: 12000,
    });
  });

  if (!IS_PROD) {
    // Serve a clean no-WebSocket /@vite/client shim in dev so proxied previews never
    // trigger "[vite] Error: WebSocket closed without opened." while preserving CSS injection.
    app.get('/@vite/client', (_req: Request, res: Response) => {
      res.type('application/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.send(`
const sheetsMap = new Map();
export function updateStyle(id, content) {
  let style = sheetsMap.get(id);
  if (!style) {
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('data-vite-dev-id', id);
    style.textContent = content;
    document.head.appendChild(style);
    sheetsMap.set(id, style);
  } else {
    style.textContent = content;
  }
}
export function removeStyle(id) {
  const style = sheetsMap.get(id);
  if (style) {
    document.head.removeChild(style);
    sheetsMap.delete(id);
  }
}
export function injectQuery(url, queryToInject) {
  if (typeof url !== 'string' || (!url.startsWith('.') && !url.startsWith('/'))) return url;
  const pathname = url.replace(/[?#].*$/, '');
  const { search, hash } = new URL(url, 'http://vite.dev');
  return pathname + '?' + queryToInject + (search ? '&' + search.slice(1) : '') + (hash || '');
}
export function createHotContext() {
  return {
    data: {},
    accept() {},
    acceptExports() {},
    dispose() {},
    prune() {},
    decline() {},
    invalidate() {},
    on() {},
    off() {},
    send() {},
  };
}
export class ErrorOverlay extends HTMLElement {}
`);
    });

    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir, { maxAge: '1d' }));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} (${IS_PROD ? 'production' : 'development'})`);
  });
}

const isDirectRun =
  typeof process.argv[1] === 'string' &&
  path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectRun) {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
