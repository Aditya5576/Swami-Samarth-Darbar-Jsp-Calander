declare const __APP_BUILD_ID__: string | undefined;

export interface ReleaseChangeItem {
  id: string;
  kind: 'upgrade' | 'fix';
  mr: string;
  en: string;
}

export interface AppReleaseNote {
  version: string;
  dateMr: string;
  dateEn: string;
  summaryMr: string;
  summaryEn: string;
  items: ReleaseChangeItem[];
}

export const RELEASE_SEEN_STORAGE_KEY = 'swami_seen_release_key_v1';

/**
 * Single source of truth for app updates & fixes.
 * Update `version` and `items` whenever publishing new changes.
 * In production builds, Vite also injects a unique `__APP_BUILD_ID__`
 * so every republish automatically triggers the post-splash update popup once.
 */
export const LATEST_RELEASE: AppReleaseNote = {
  version: '2.4.2',
  dateMr: 'नवीन आवृत्ती',
  dateEn: 'Latest Release',
  summaryMr: 'सेवेकऱ्यांच्या सोयीसाठी खालील नवीन सुविधा व सुधारणा केल्या आहेत:',
  summaryEn: 'Here is what we upgraded and fixed in this update:',
  items: [
    {
      id: 'storage-and-reliability',
      kind: 'fix',
      mr: 'ब्राऊझर स्टोरेज बंद असल्यासही कॅलेंडर व नोंदी सुरक्षित चालतात; नोंद सेव्ह न झाल्यास मजकूर जतन राहतो.',
      en: 'Protected calendar notes and language state when browser storage is restricted, preserving typed notes on save failure.',
    },
    {
      id: 'reminder-and-download-hardening',
      kind: 'upgrade',
      mr: 'बॅकग्राउंड स्मरणपत्र नोंदणीची अचूक पडताळणी व सुरक्षित स्ट्रीमिंग फोटो डाऊनलोड सुविधा.',
      en: 'Verified background reminder scheduling feedback and upgraded Darshan photo downloads to bounded streaming.',
    },
    {
      id: 'mobile-text-wrap-fix',
      kind: 'fix',
      mr: 'सर्व मोबाईल स्क्रीनवर शीर्षके, बटणे, वेळा व बॅजेस आता एकाच ओळीत नीटनेटके दिसतात.',
      en: 'Crisp single-line alignment for headers, buttons, timings, and badges across all mobile screens.',
    },
    {
      id: 'darshan-gallery',
      kind: 'upgrade',
      mr: 'दर्शन गॅलरीमध्ये स्लाईडशो, पूर्ण स्क्रीन झूम व एक-टॅप फोटो डाऊनलोड सुविधा.',
      en: 'Darshan Gallery with swipeable slideshow, fullscreen viewer, and 1-tap Sevak photo download.',
    },
  ],
};

export function getRuntimeBuildId(): string {
  try {
    if (typeof __APP_BUILD_ID__ === 'string' && __APP_BUILD_ID__.trim().length > 0) {
      return __APP_BUILD_ID__;
    }
  } catch {
    // Fallback outside Vite bundle (e.g., Node test runner)
  }
  return 'local';
}

export function getActiveReleaseKey(buildId: string = getRuntimeBuildId()): string {
  return `${LATEST_RELEASE.version}:${buildId}`;
}

export function hasUnreadRelease(
  storage?: Pick<Storage, 'getItem'> | null,
  buildId?: string
): boolean {
  const store =
    storage !== undefined
      ? storage
      : typeof window !== 'undefined' && window.localStorage
      ? window.localStorage
      : null;

  if (!store) return false;
  try {
    const seen = store.getItem(RELEASE_SEEN_STORAGE_KEY);
    return seen !== getActiveReleaseKey(buildId);
  } catch {
    return false;
  }
}

export function markReleaseAsSeen(
  storage?: Pick<Storage, 'setItem'> | null,
  buildId?: string
): void {
  const store =
    storage !== undefined
      ? storage
      : typeof window !== 'undefined' && window.localStorage
      ? window.localStorage
      : null;

  if (!store) return;
  try {
    store.setItem(RELEASE_SEEN_STORAGE_KEY, getActiveReleaseKey(buildId));
  } catch {
    // Ignore private-mode storage quota errors
  }
}
