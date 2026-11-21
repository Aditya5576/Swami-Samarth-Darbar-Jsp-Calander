export interface ChannelVideo {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  watchUrl: string;
}

export interface ChannelFeedResponse {
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

export const KUMUDINI_CHANNEL_INFO = {
  id: 'UCO0GP_5MwcHC5E8WJj-t_hg',
  name: 'Swaamirajmaaulii',
  artistMr: 'कुमुदिनी डबाडे · श्री स्वामी समर्थ दरबार, जयसिंगपूर',
  artistEn: 'Kumudini Dabade · Shri Swami Samarth Darbar, Jaysingpur',
  handle: '@kumudinidabade',
  url: 'https://www.youtube.com/@kumudinidabade',
  subscribeUrl: 'https://www.youtube.com/@kumudinidabade?sub_confirmation=1',
};

export const KUMUDINI_SEED_VIDEOS: ChannelVideo[] = [
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

export const YOUTUBE_VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export function isValidYouTubeVideoId(id: string): boolean {
  return YOUTUBE_VIDEO_ID_PATTERN.test(id);
}
