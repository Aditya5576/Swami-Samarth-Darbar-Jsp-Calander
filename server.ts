import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

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
      const liveVideos = await fetchLiveChannelVideos();
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

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
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

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
