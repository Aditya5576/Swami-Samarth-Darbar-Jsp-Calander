export interface TemplePhoto {
  id: string;
  baseUrl: string;
  index: number;
}

export interface TempleGalleryResponse {
  album: {
    title: string;
    shareUrl: string;
  };
  photos: TemplePhoto[];
  totalCount: number;
  fetchedAt: string;
  source: 'live' | 'cache' | 'fallback';
}

export const TEMPLE_ALBUM_INFO = {
  titleMr: 'स्वामी समर्थ दरबार — मंदिर दर्शन गॅलरी',
  titleEn: 'Swami Samarth Darbar — Temple Gallery',
  subtitleMr: 'श्री स्वामी समर्थ सेवा दरबार, जयसिंगपूर · सर्व मंदिर व उत्सव छायाचित्रे',
  subtitleEn: 'Shree Swami Samarth Seva Darbar, Jaysingpur · Official Temple Photos',
  shareUrl: 'https://photos.app.goo.gl/Wi3gkoXLGPUSQeeX7',
};

export const GOOGLE_PHOTO_BASE_REGEX =
  /^https:\/\/lh3\.googleusercontent\.com\/pw\/[A-Za-z0-9_-]{20,}$/;

export function isValidGooglePhotoBaseUrl(url: string): boolean {
  return GOOGLE_PHOTO_BASE_REGEX.test(url);
}

/**
 * Builds a bandwidth-appropriate Google Photos CDN URL.
 * Supports crisp square thumbnails for the grid and proportional widths for slideshow/lightbox.
 */
export function buildGooglePhotoUrl(
  baseUrl: string,
  width: number,
  squareCrop = false
): string {
  if (!isValidGooglePhotoBaseUrl(baseUrl)) {
    return '/assets/aistudio/img_2912_1024_edcd846d.jpg';
  }
  const safeWidth = Math.max(180, Math.min(1800, Math.round(width)));
  return squareCrop
    ? `${baseUrl}=w${safeWidth}-h${safeWidth}-c`
    : `${baseUrl}=w${safeWidth}`;
}

export const TEMPLE_SEED_PHOTOS: TemplePhoto[] = [
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
