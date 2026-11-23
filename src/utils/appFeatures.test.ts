import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  SUPPORTED_YEARS,
  getMultiYearMonthDays,
} from './calendarMultiYear';
import { calculateRahuKaal, getDayByDate, searchYear } from './calendarLogic';
import { TRANSLATIONS } from './translations';
import {
  SARAMRUT_ADHYAYS,
  TOTAL_SARAMRUT_VERSES,
  getParayanSchedule,
  getParayanDayForAdhyay,
} from '../data/saramrut';
import {
  TEMPLE_ALBUM_INFO,
  TEMPLE_SEED_PHOTOS,
  isValidGooglePhotoBaseUrl,
  buildGooglePhotoUrl,
} from '../data/templeGallery';
import {
  KUMUDINI_SEED_VIDEOS,
  isValidYouTubeVideoId,
} from '../data/youtubeChannel';
import { buildTodayNotificationMessage } from './notificationService';
import {
  validateMediaFile,
  formatBytes,
  prepareOfflineSevaApp,
} from './offlineMediaStore';

import { LanguageProvider } from '../context/LanguageContext';
import App from '../App';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { CalendarView } from '../components/CalendarView';
import { FestivalsView } from '../components/FestivalsView';
import { SaramrutView } from '../components/SaramrutView';
import { NityaSevaView } from '../components/NityaSevaView';
import { SwamiVideosView } from '../components/SwamiVideosView';
import { MuhuratAndSevaMargView } from '../components/MuhuratAndSevaMargView';
import { TempleGalleryView } from '../components/TempleGalleryView';
import { DayDetailsModal } from '../components/DayDetailsModal';
import { SearchModal } from '../components/SearchModal';
import { NotificationModal } from '../components/NotificationModal';
import { OfflineVaultModal } from '../components/OfflineVaultModal';
import { OfflineIndicator } from '../components/OfflineIndicator';
import { SplashScreen } from '../components/SplashScreen';
import { WhatsNewModal } from '../components/WhatsNewModal';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { AppErrorBoundary } from '../components/AppErrorBoundary';
import {
  LATEST_RELEASE,
  hasUnreadRelease,
  markReleaseAsSeen,
} from '../data/releaseNotes';

function collectSourceFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectSourceFiles(full));
    } else if ((entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) && !entry.name.endsWith('.test.ts')) {
      results.push(full);
    }
  }
  return results;
}

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, String(value));
    },
  };
}

// ============================================================================
// 1. MULTI-YEAR CALENDAR & PANCHANG EXHAUSTIVE MATRIX (2025-2030)
// ============================================================================
describe('Multi-Year Calendar & Panchang Exhaustive Matrix (2025-2030)', () => {
  it('validates every single day across all 6 supported years (72 months, 2,191 days)', () => {
    let totalDays = 0;

    for (const year of SUPPORTED_YEARS) {
      let yearTotal = 0;
      const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      const expectedYearTotal = isLeap ? 366 : 365;

      for (let month = 1; month <= 12; month++) {
        const monthDays = getMultiYearMonthDays(year, month);
        const expectedMonthLen = new Date(year, month, 0).getDate();
        assert.equal(
          monthDays.length,
          expectedMonthLen,
          `${year}-${String(month).padStart(2, '0')} should have ${expectedMonthLen} days`
        );

        for (let idx = 0; idx < monthDays.length; idx++) {
          const day = monthDays[idx];
          const expectedDateStr = `${year}-${String(month).padStart(2, '0')}-${String(idx + 1).padStart(2, '0')}`;
          assert.equal(day.date, expectedDateStr);
          assert.equal(day.dayOfMonth, idx + 1);

          const expectedDow = new Date(year, month - 1, idx + 1).getDay();
          assert.equal(day.dayOfWeek, expectedDow, `Weekday mismatch on ${day.date}`);

          assert.ok(day.tithi && day.tithi.trim().length > 0, `Empty tithi on ${day.date}`);
          assert.ok(day.paksha && day.paksha.trim().length > 0, `Empty paksha on ${day.date}`);
          assert.ok(day.nakshatra && day.nakshatra.trim().length > 0, `Empty nakshatra on ${day.date}`);
          assert.ok(day.sunrise && day.sunrise.includes(':'), `Invalid sunrise on ${day.date}`);
          assert.ok(day.sunset && day.sunset.includes(':'), `Invalid sunset on ${day.date}`);
          assert.ok(!/[0-9]/.test(day.sunrise), `Sunrise should use consistent Devanagari digits on ${day.date}: ${day.sunrise}`);
          assert.ok(!/[0-9]/.test(day.sunset), `Sunset should use consistent Devanagari digits on ${day.date}: ${day.sunset}`);
          assert.ok(day.swamiGuidance && day.swamiGuidance.trim().length > 0, `Empty guidance on ${day.date}`);
          assert.ok(day.marathiDayName && day.marathiDayName.trim().length > 0, `Empty marathiDayName on ${day.date}`);
          assert.equal(
            Boolean(day.isEstimated),
            year !== 2026,
            `isEstimated flag mismatch on ${day.date}`
          );
          yearTotal++;
          totalDays++;
        }
      }

      assert.equal(yearTotal, expectedYearTotal, `Year ${year} should have ${expectedYearTotal} days`);
    }

    assert.equal(totalDays, 2191, '2025..2030 inclusive should contain exactly 2,191 days (1 leap year: 2028)');
  });

  it('computes Rahu Kaal cleanly for all 7 weekdays in Marathi and English and handles bad inputs', () => {
    for (let dow = 0; dow <= 6; dow++) {
      const mr = calculateRahuKaal(dow, 'सकाळी ०६:३०', 'सायं ०६:३०', 'mr');
      const en = calculateRahuKaal(dow, '06:30 AM', '06:30 PM', 'en');
      assert.ok(mr.formattedRange.includes('ते'), `Marathi Rahu Kaal for dow=${dow} should contain 'ते'`);
      assert.ok(en.formattedRange.includes('–'), `English Rahu Kaal for dow=${dow} should contain '–'`);
      assert.ok(mr.octantNumber >= 2 && mr.octantNumber <= 8);
      assert.equal(mr.octantNumber, en.octantNumber);
    }

    const badInput = calculateRahuKaal(1, 'invalid', '18:00', 'en');
    assert.ok(badInput.formattedRange.includes('AM') && badInput.octantNumber === 2);
    const outOfRange = calculateRahuKaal(99, '06:00', '18:00', 'en');
    assert.equal(outOfRange.octantNumber, 8);
  });

  it('searches across Marathi, English, case-insensitive, and empty queries safely', () => {
    assert.deepEqual(searchYear('', 2026), []);
    assert.deepEqual(searchYear('   ', 2026), []);

    const enHits = searchYear('gudi padwa', 2026);
    assert.ok(enHits.some(d => d.date === '2026-03-19'));

    const mrCompoundHits = searchYear('लक्ष्मीपूजन', 2026);
    assert.ok(mrCompoundHits.some(d => d.date === '2026-11-08'));

    const estHits = searchYear('Ekadashi', 2027);
    assert.ok(estHits.length > 0 && estHits.every(d => d.isEstimated === true));
  });
});

// ============================================================================
// 2. TRANSLATION DICTIONARY INTEGRITY AUDIT
// ============================================================================
describe('Translation Dictionary Integrity Audit', () => {
  it('ensures identical non-empty key sets in Marathi and English dictionaries', () => {
    const mrKeys = Object.keys(TRANSLATIONS.mr).sort();
    const enKeys = Object.keys(TRANSLATIONS.en).sort();
    assert.deepEqual(mrKeys, enKeys, 'TRANSLATIONS.mr and TRANSLATIONS.en must have identical keys');

    for (const key of mrKeys) {
      const mrVal = (TRANSLATIONS.mr as Record<string, string>)[key];
      const enVal = (TRANSLATIONS.en as Record<string, string>)[key];
      assert.ok(typeof mrVal === 'string' && mrVal.trim().length > 0, `Empty MR translation for key "${key}"`);
      assert.ok(typeof enVal === 'string' && enVal.trim().length > 0, `Empty EN translation for key "${key}"`);
    }
  });

  it('verifies every t(...) call across src/ resolves to an existing translation key', () => {
    const srcDir = path.resolve(process.cwd(), 'src');
    const files = collectSourceFiles(srcDir);
    const missing: string[] = [];
    const callRegex = /\bt\(\s*['"]([a-zA-Z0-9_]+)['"]\s*\)/g;

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      let match: RegExpExecArray | null;
      while ((match = callRegex.exec(content)) !== null) {
        const key = match[1];
        if (!(key in TRANSLATIONS.mr) || !(key in TRANSLATIONS.en)) {
          missing.push(`${path.relative(srcDir, file)} -> ${key}`);
        }
      }
    }

    assert.deepEqual(missing, [], `Missing translation keys found: ${missing.join(', ')}`);
  });
});

// ============================================================================
// 3. CHARITRA SARAMRUT DATA & PARAYAN SCHEDULE ENGINE
// ============================================================================
describe('Charitra Saramrut Data & Parayan Engine', () => {
  it('contains all 21 authentic Adhyays totaling 1,104 non-empty verses', () => {
    assert.equal(SARAMRUT_ADHYAYS.length, 21);
    assert.equal(TOTAL_SARAMRUT_VERSES, 1104);

    let sum = 0;
    for (let i = 0; i < 21; i++) {
      const adhyay = SARAMRUT_ADHYAYS[i];
      assert.equal(adhyay.id, i + 1);
      assert.equal(adhyay.verses.length, adhyay.verseCount, `Adhyay ${adhyay.id} verseCount mismatch`);
      assert.ok(adhyay.titleMr.trim().length > 0);
      assert.ok(adhyay.titleEn.trim().length > 0);
      assert.ok(Array.isArray(adhyay.invocation) && adhyay.invocation.length > 0);
      assert.ok(adhyay.closing.trim().length > 0);
      for (const verse of adhyay.verses) {
        assert.ok(verse.trim().length > 0, `Empty verse in Adhyay ${adhyay.id}`);
      }
      sum += adhyay.verses.length;
    }
    assert.equal(sum, 1104);
  });

  it('generates gapless 3-day, 7-day, and 21-day Parayan schedules covering Adhyays 1..21', () => {
    for (const [mode, expectedDays] of [
      ['3day', 3],
      ['7day', 7],
      ['21day', 21],
    ] as const) {
      const schedule = getParayanSchedule(mode);
      assert.equal(schedule.length, expectedDays);
      const covered = schedule.flatMap(d => d.adhyayIds);
      assert.deepEqual(
        covered,
        Array.from({ length: 21 }, (_, idx) => idx + 1),
        `${mode} schedule must cover Adhyays 1..21 cleanly`
      );
    }

    assert.equal(getParayanDayForAdhyay(1, '3day'), 1);
    assert.equal(getParayanDayForAdhyay(7, '3day'), 1);
    assert.equal(getParayanDayForAdhyay(8, '3day'), 2);
    assert.equal(getParayanDayForAdhyay(21, '3day'), 3);
    assert.equal(getParayanDayForAdhyay(4, '7day'), 2);
    assert.equal(getParayanDayForAdhyay(15, '21day'), 15);
    assert.equal(getParayanDayForAdhyay(99, '7day'), 7);
    assert.equal(getParayanDayForAdhyay(0, '7day'), 1);
  });
});

// ============================================================================
// 4. DARSHAN GALLERY & YOUTUBE CHANNEL VALIDATORS
// ============================================================================
describe('Darshan Gallery & YouTube Channel Validators', () => {
  it('validates temple seed photos and blocks untrusted or malformed Google Photo URLs', () => {
    assert.equal(TEMPLE_ALBUM_INFO.shareUrl, 'https://photos.app.goo.gl/Wi3gkoXLGPUSQeeX7');
    assert.ok(TEMPLE_SEED_PHOTOS.length >= 6);

    for (const photo of TEMPLE_SEED_PHOTOS) {
      assert.equal(isValidGooglePhotoBaseUrl(photo.baseUrl), true, `Seed photo ${photo.id} must be valid`);
      const built = buildGooglePhotoUrl(photo.baseUrl, 900);
      assert.equal(built, `${photo.baseUrl}=w900`);
    }

    // Width clamping & square crop
    const validBase = TEMPLE_SEED_PHOTOS[0].baseUrl;
    assert.equal(buildGooglePhotoUrl(validBase, 50), `${validBase}=w180`);
    assert.equal(buildGooglePhotoUrl(validBase, 9999), `${validBase}=w1800`);
    assert.equal(buildGooglePhotoUrl(validBase, 400, true), `${validBase}=w400-h400-c`);

    // Untrusted/malicious URLs must be rejected and fall back safely
    const badUrls = [
      'http://lh3.googleusercontent.com/pw/AP1GczM123456789012345678901234567890',
      'https://evil.example.com/pw/AP1GczM123456789012345678901234567890',
      'javascript:alert(1)',
      'https://lh3.googleusercontent.com/pw/short',
      'https://lh3.googleusercontent.com/pw/AP1GczM123456789012345678901234567890?x=1',
      'https://lh3.googleusercontent.com/pw/AP1GczM123456789012345678901234567890/../etc',
    ];
    for (const bad of badUrls) {
      assert.equal(isValidGooglePhotoBaseUrl(bad), false, `Must reject ${bad}`);
      assert.equal(buildGooglePhotoUrl(bad, 600), '/assets/aistudio/img_2912_1024_edcd846d.jpg');
    }
  });

  it('validates YouTube video IDs strictly', () => {
    assert.ok(KUMUDINI_SEED_VIDEOS.length >= 4);
    for (const v of KUMUDINI_SEED_VIDEOS) {
      assert.equal(isValidYouTubeVideoId(v.videoId), true, `Seed video ID ${v.videoId} should be valid`);
    }
    assert.equal(isValidYouTubeVideoId('dQw4w9WgXcQ'), true);
    assert.equal(isValidYouTubeVideoId('short'), false);
    assert.equal(isValidYouTubeVideoId('too_long_video_id'), false);
    assert.equal(isValidYouTubeVideoId('abc?rel=0&x'), false);
    assert.equal(isValidYouTubeVideoId('<script>123'), false);
  });
});

// ============================================================================
// 5. NOTIFICATION MESSAGE BUILDER & ESTIMATED-YEAR DISCLOSURE
// ============================================================================
describe('Notification Message Builder', () => {
  it('omits estimated labels for verified 2026 dates and includes them for non-2026 dates', () => {
    const verifiedDay = getDayByDate('2026-04-03');
    assert.ok(verifiedDay);
    const mrVerified = buildTodayNotificationMessage(verifiedDay, 'mr');
    const enVerified = buildTodayNotificationMessage(verifiedDay, 'en');
    assert.ok(!mrVerified.title.includes('अंदाजित'));
    assert.ok(!enVerified.title.includes('Estimated'));

    const estimatedDay = getDayByDate('2027-04-03');
    assert.ok(estimatedDay);
    assert.equal(estimatedDay.isEstimated, true);
    const mrEst = buildTodayNotificationMessage(estimatedDay, 'mr');
    const enEst = buildTodayNotificationMessage(estimatedDay, 'en');
    assert.ok(mrEst.title.includes('अंदाजित पंचांग'), `Expected Marathi estimated label in "${mrEst.title}"`);
    assert.ok(enEst.title.includes('Estimated Panchang'), `Expected English estimated label in "${enEst.title}"`);
  });
});

// ============================================================================
// 6. OFFLINE MEDIA STORE & HONEST READINESS STATES (AUD-03)
// ============================================================================
describe('Offline Media Store & Readiness Verification', () => {
  it('validates allowed audio/video files and rejects empty, oversized, or unsafe files', () => {
    const fakeFile = (name: string, type: string, size: number) =>
      ({ name, type, size } as unknown as File);

    assert.equal(validateMediaFile(fakeFile('bhajan.mp3', 'audio/mpeg', 1024 * 500)).mediaKind, 'audio');
    assert.equal(validateMediaFile(fakeFile('CHANT.MP3', '', 1024)).mediaKind, 'audio');
    assert.equal(validateMediaFile(fakeFile('aarti.m4a', 'audio/mp4', 2048)).mediaKind, 'audio');
    assert.equal(validateMediaFile(fakeFile('darshan.mp4', 'video/mp4', 5000000)).mediaKind, 'video');
    assert.equal(validateMediaFile(fakeFile('clip.webm', 'video/webm', 50000)).mediaKind, 'video');

    assert.equal(validateMediaFile(fakeFile('empty.mp3', 'audio/mpeg', 0)).valid, false);
    assert.equal(validateMediaFile(fakeFile('huge.mp4', 'video/mp4', 160 * 1024 * 1024)).valid, false);
    assert.equal(validateMediaFile(fakeFile('payload.html', 'text/html', 120)).valid, false);
    assert.equal(validateMediaFile(fakeFile('evil.svg', 'image/svg+xml', 120)).valid, false);
    assert.equal(validateMediaFile(fakeFile('script.js', 'application/javascript', 120)).valid, false);
    assert.equal(validateMediaFile(fakeFile('malware.exe', 'application/octet-stream', 120)).valid, false);
  });

  it('formats byte sizes cleanly including edge values', () => {
    assert.equal(formatBytes(0), '0 B');
    assert.equal(formatBytes(-50), '0 B');
    assert.equal(formatBytes(Number.NaN), '0 B');
    assert.equal(formatBytes(512), '512 B');
    assert.equal(formatBytes(2048), '2.0 KB');
    assert.equal(formatBytes(5 * 1024 * 1024), '5.0 MB');
    assert.equal(formatBytes(2 * 1024 * 1024 * 1024), '2.00 GB');
  });

  it('reports honest ready / partial / failed statuses from prepareOfflineSevaApp()', async () => {
    const origCaches = (globalThis as Record<string, unknown>).caches;
    const origFetch = globalThis.fetch;
    const origLocalStorage = (globalThis as Record<string, unknown>).localStorage;
    const origNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');

    const setNavigator = (mockNav: unknown) => {
      Object.defineProperty(globalThis, 'navigator', {
        value: mockNav,
        configurable: true,
        writable: true,
      });
    };

    const makeMockCaches = () => {
      const store = new Map<string, Response>();
      const cacheObj = {
        async match(req: string | Request) {
          const key = typeof req === 'string' ? req : req.url;
          return store.get(key);
        },
        async put(req: string | Request, res: Response) {
          const key = typeof req === 'string' ? req : req.url;
          store.set(key, res);
        },
      };
      return {
        async open() {
          return cacheObj;
        },
        async match(req: string | Request) {
          return cacheObj.match(req);
        },
      };
    };

    try {
      // Scenario A: READY (active SW + all 6 core assets OK, even if optional thumbs fail)
      (globalThis as Record<string, unknown>).localStorage = createMemoryStorage();
      (globalThis as Record<string, unknown>).caches = makeMockCaches();
      setNavigator({
        onLine: true,
        serviceWorker: {
          async getRegistration() {
            return { active: {} };
          },
        },
        storage: {
          async persisted() {
            return true;
          },
        },
      });
      globalThis.fetch = (async (input: string | URL | Request) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        if (url.includes('ytimg.com') || url.includes('/api/youtube')) {
          throw new Error('Optional network blocked');
        }
        return new Response('ok', { status: 200 });
      }) as typeof fetch;

      const readyReport = await prepareOfflineSevaApp();
      assert.equal(readyReport.status, 'ready');
      assert.equal(readyReport.swActive, true);
      assert.equal(readyReport.cachedCoreCount, readyReport.totalCoreCount);
      assert.deepEqual(readyReport.missingCoreUrls, []);
      assert.ok(readyReport.preparedAt !== null, 'Ready state must record preparedAt timestamp');

      // Scenario B: PARTIAL (one core asset fails with 500)
      (globalThis as Record<string, unknown>).localStorage = createMemoryStorage();
      (globalThis as Record<string, unknown>).caches = makeMockCaches();
      globalThis.fetch = (async (input: string | URL | Request) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        if (url === '/audio/swami_samarth_chant.mp3') {
          return new Response('err', { status: 500 });
        }
        return new Response('ok', { status: 200 });
      }) as typeof fetch;

      const partialAssetReport = await prepareOfflineSevaApp();
      assert.equal(partialAssetReport.status, 'partial');
      assert.equal(partialAssetReport.preparedAt, null, 'Partial state must NOT record false ready timestamp');
      assert.deepEqual(partialAssetReport.missingCoreUrls, ['/audio/swami_samarth_chant.mp3']);

      // Scenario C: PARTIAL (all 6 core assets cached, but SW not active)
      (globalThis as Record<string, unknown>).localStorage = createMemoryStorage();
      (globalThis as Record<string, unknown>).caches = makeMockCaches();
      setNavigator({
        onLine: false,
        serviceWorker: {
          async getRegistration() {
            return undefined;
          },
        },
      });
      globalThis.fetch = (async () => new Response('ok', { status: 200 })) as typeof fetch;

      const partialSwReport = await prepareOfflineSevaApp();
      assert.equal(partialSwReport.status, 'partial');
      assert.equal(partialSwReport.swActive, false);
      assert.equal(partialSwReport.preparedAt, null);

      // Scenario D: FAILED (Cache Storage unavailable)
      (globalThis as Record<string, unknown>).localStorage = createMemoryStorage();
      (globalThis as Record<string, unknown>).caches = undefined;

      const failedReport = await prepareOfflineSevaApp();
      assert.equal(failedReport.status, 'failed');
      assert.equal(failedReport.cacheStorageAvailable, false);
      assert.equal(failedReport.cachedCoreCount, 0);
      assert.equal(failedReport.preparedAt, null);
    } finally {
      (globalThis as Record<string, unknown>).caches = origCaches;
      globalThis.fetch = origFetch;
      (globalThis as Record<string, unknown>).localStorage = origLocalStorage;
      if (origNavigator) {
        Object.defineProperty(globalThis, 'navigator', origNavigator);
      }
    }
  });
});

// ============================================================================
// 7. SERVICE WORKER (public/sw-custom.js) REAL EXECUTION TESTS (AUD-02)
// ============================================================================
describe('Service Worker (public/sw-custom.js) Notification & Opt-In Behavior', () => {
  function createSwHarness(initialNowIso: string) {
    const swCode = fs.readFileSync(path.resolve(process.cwd(), 'public/sw-custom.js'), 'utf8');
    const idbData = new Map<string, unknown>();
    const listeners = new Map<string, Array<(e: unknown) => void>>();
    const shownNotifications: Array<{ title: string; options: Record<string, unknown> }> = [];
    const openedWindows: string[] = [];
    let focusedExisting = false;
    let mockNow = new Date(initialNowIso);

    const fakeIndexedDB = {
      open() {
        const req: Record<string, unknown> = {};
        queueMicrotask(() => {
          const db = {
            objectStoreNames: { contains: () => true },
            createObjectStore: () => ({}),
            close: () => {},
            transaction() {
              const tx: Record<string, unknown> = {
                objectStore() {
                  return {
                    get(key: string) {
                      const getReq: Record<string, unknown> = {};
                      queueMicrotask(() => {
                        getReq.result = idbData.get(key);
                        if (typeof getReq.onsuccess === 'function') getReq.onsuccess();
                      });
                      return getReq;
                    },
                    put(val: unknown, key: string) {
                      idbData.set(key, val);
                      queueMicrotask(() => {
                        if (typeof tx.oncomplete === 'function') tx.oncomplete();
                      });
                    },
                  };
                },
              };
              return tx;
            },
          };
          req.result = db;
          if (typeof req.onupgradeneeded === 'function') req.onupgradeneeded();
          if (typeof req.onsuccess === 'function') req.onsuccess();
        });
        return req;
      },
    };

    class MockDate extends Date {
      constructor(...args: unknown[]) {
        if (args.length === 0) {
          super(mockNow.getTime());
        } else {
          super(...(args as [string | number]));
        }
      }
      static now() {
        return mockNow.getTime();
      }
    }

    const selfObj: Record<string, unknown> = {
      addEventListener(type: string, fn: (e: unknown) => void) {
        const arr = listeners.get(type) ?? [];
        arr.push(fn);
        listeners.set(type, arr);
      },
      registration: {
        async showNotification(title: string, options: Record<string, unknown>) {
          shownNotifications.push({ title, options });
        },
      },
      clients: {
        async matchAll() {
          return [];
        },
        async openWindow(url: string) {
          openedWindows.push(url);
        },
      },
    };

    const context = vm.createContext({
      self: selfObj,
      indexedDB: fakeIndexedDB,
      Date: MockDate,
      console,
      setTimeout,
      clearTimeout,
    });
    vm.runInContext(swCode, context, { filename: 'public/sw-custom.js' });

    const dispatch = async (type: string, payload: Record<string, unknown>) => {
      const promises: Promise<unknown>[] = [];
      const event = {
        ...payload,
        waitUntil(p: Promise<unknown>) {
          promises.push(Promise.resolve(p));
        },
      };
      for (const fn of listeners.get(type) ?? []) {
        fn(event);
      }
      await Promise.all(promises);
    };

    return {
      idbData,
      shownNotifications,
      openedWindows,
      setMockNow(iso: string) {
        mockNow = new Date(iso);
      },
      setExistingClient(hasClient: boolean) {
        (selfObj.clients as { matchAll: () => Promise<unknown[]> }).matchAll = async () =>
          hasClient
            ? [
                {
                  url: 'https://example.local/',
                  async focus() {
                    focusedExisting = true;
                  },
                },
              ]
            : [];
      },
      wasFocused: () => focusedExisting,
      dispatch,
    };
  }

  it('strictly enforces opt-in, scheduled local time, language, and daily deduplication', async () => {
    const sw = createSwHarness('2026-04-03T07:00:00');

    // 1. No saved prefs -> must NOT notify
    await sw.dispatch('periodicsync', { tag: 'daily-darshan-sync' });
    assert.equal(sw.shownNotifications.length, 0);

    // 2. Sync disabled prefs via message -> must NOT notify
    await sw.dispatch('message', {
      data: {
        type: 'SYNC_NOTIF_PREFS',
        prefs: { enabled: false, time: '06:00', language: 'mr', lastNotifiedDate: null },
      },
    });
    await sw.dispatch('periodicsync', { tag: 'daily-darshan-sync' });
    assert.equal(sw.shownNotifications.length, 0);

    // 3. Enabled but scheduled time is 23:59 (still in the future vs 07:00) -> must NOT notify
    await sw.dispatch('message', {
      data: {
        type: 'SYNC_NOTIF_PREFS',
        prefs: { enabled: true, time: '23:59', language: 'mr', lastNotifiedDate: null },
      },
    });
    await sw.dispatch('periodicsync', { tag: 'daily-darshan-sync' });
    assert.equal(sw.shownNotifications.length, 0);

    // 4. Enabled and past scheduled time (06:00 <= 07:00) in Marathi -> notifies ONCE
    await sw.dispatch('message', {
      data: {
        type: 'SYNC_NOTIF_PREFS',
        prefs: { enabled: true, time: '06:00', language: 'mr', lastNotifiedDate: null },
      },
    });
    await sw.dispatch('periodicsync', { tag: 'daily-darshan-sync' });
    assert.equal(sw.shownNotifications.length, 1);
    assert.ok(sw.shownNotifications[0].title.includes('श्री स्वामी समर्थ'));

    // 5. Repeat periodicsync same day -> deduplicated (0 extra notifications)
    await sw.dispatch('periodicsync', { tag: 'daily-darshan-sync' });
    assert.equal(sw.shownNotifications.length, 1);

    // 6. Next day with English preference -> sends English notification
    sw.setMockNow('2026-04-04T08:15:00');
    const saved = sw.idbData.get('daily') as Record<string, unknown>;
    sw.idbData.set('daily', { ...saved, language: 'en' });
    await sw.dispatch('sync', { tag: 'daily-check-sync' });
    assert.equal(sw.shownNotifications.length, 2);
    assert.ok(sw.shownNotifications[1].title.includes('Shree Swami Samarth'));

    // 7. notificationclick opens window when none exists, or focuses existing client
    let closedCount = 0;
    await sw.dispatch('notificationclick', {
      notification: { close: () => closedCount++, data: { url: '/?tab=calendar' } },
    });
    assert.equal(closedCount, 1);
    assert.deepEqual(sw.openedWindows, ['/?tab=calendar']);

    sw.setExistingClient(true);
    await sw.dispatch('notificationclick', {
      notification: { close: () => closedCount++, data: { url: '/' } },
    });
    assert.equal(closedCount, 2);
    assert.equal(sw.wasFocused(), true);
  });
});

// ============================================================================
// 8. FULL REACT COMPONENT RENDER SMOKE SUITE (MARATHI & ENGLISH)
// ============================================================================
describe('React Full Component Render Smoke Suite (MR & EN)', () => {
  function renderWithLang(lang: 'mr' | 'en', element: React.ReactElement): string {
    const origWindow = (globalThis as Record<string, unknown>).window;
    const origLocalStorage = (globalThis as Record<string, unknown>).localStorage;
    const storage = createMemoryStorage();
    storage.setItem('swami_app_lang', lang);
    (globalThis as Record<string, unknown>).localStorage = storage;
    (globalThis as Record<string, unknown>).window = { localStorage: storage };
    try {
      return renderToStaticMarkup(React.createElement(LanguageProvider, null, element));
    } finally {
      (globalThis as Record<string, unknown>).window = origWindow;
      (globalThis as Record<string, unknown>).localStorage = origLocalStorage;
    }
  }

  it('renders every primary view, modal, and utility component cleanly in both Marathi and English', () => {
    const verifiedDay = getDayByDate('2026-04-03')!;
    const estimatedDay = getDayByDate('2027-04-03')!;
    const noop = () => {};

    for (const lang of ['mr', 'en'] as const) {
      const appHtml = renderToStaticMarkup(React.createElement(App));
      assert.ok(appHtml.length > 500, 'App root shell should render substantive HTML');

      const headerHtml = renderWithLang(
        lang,
        React.createElement(Header, {
          currentYear: 2026,
          onOpenSearch: noop,
          onGoToToday: noop,
          onOpenNotifications: noop,
          onOpenOfflineVault: noop,
          onOpenSplash: noop,
        })
      );
      assert.ok(headerHtml.includes('<header'), `Header (${lang}) must render <header>`);

      const navHtml = renderWithLang(
        lang,
        React.createElement(BottomNav, { activeTab: 'calendar', onChangeTab: noop })
      );
      assert.ok(navHtml.includes('<nav'), `BottomNav (${lang}) must render <nav>`);

      const calHtml = renderWithLang(
        lang,
        React.createElement(CalendarView, {
          currentYear: 2026,
          currentMonth: 4,
          onChangeYear: noop,
          onChangeMonth: noop,
          onSelectDay: noop,
          selectedDateStr: '2026-04-03',
        })
      );
      assert.ok(calHtml.includes('2026'), `CalendarView (${lang}) must render year 2026`);

      const festHtml = renderWithLang(
        lang,
        React.createElement(FestivalsView, {
          currentYear: 2026,
          onChangeYear: noop,
          onSelectDay: noop,
        })
      );
      assert.ok(festHtml.length > 300, `FestivalsView (${lang}) should render festivals`);

      const saramrutHtml = renderWithLang(lang, React.createElement(SaramrutView));
      assert.ok(saramrutHtml.length > 300, `SaramrutView (${lang}) should render Charitra Saramrut`);

      const sevaHtml = renderWithLang(
        lang,
        React.createElement(NityaSevaView, { onOpenOfflineVault: noop })
      );
      assert.ok(sevaHtml.includes('108'), `NityaSevaView (${lang}) should render 108 Japa Mala`);

      const videosHtml = renderWithLang(
        lang,
        React.createElement(SwamiVideosView, { onOpenOfflineVault: noop })
      );
      assert.ok(videosHtml.length > 300, `SwamiVideosView (${lang}) should render Bhajan videos`);

      const kendraHtml = renderWithLang(lang, React.createElement(MuhuratAndSevaMargView));
      assert.ok(kendraHtml.length > 300, `MuhuratAndSevaMargView (${lang}) should render Kendra info`);

      const galleryHtml = renderWithLang(lang, React.createElement(TempleGalleryView));
      assert.ok(
        galleryHtml.includes('https://photos.app.goo.gl/Wi3gkoXLGPUSQeeX7'),
        `TempleGalleryView (${lang}) must include Google Photos album link`
      );

      // DayDetailsModal: verified 2026 vs estimated 2027 + ARIA check
      const dayModal2026 = renderWithLang(
        lang,
        React.createElement(DayDetailsModal, { day: verifiedDay, onClose: noop })
      );
      assert.ok(dayModal2026.includes('role="dialog"'));
      assert.ok(dayModal2026.includes('aria-modal="true"'));
      assert.ok(dayModal2026.includes('aria-labelledby="day-details-title"'));
      assert.ok(dayModal2026.includes('id="day-details-title"'));

      const dayModal2027 = renderWithLang(
        lang,
        React.createElement(DayDetailsModal, { day: estimatedDay, onClose: noop })
      );
      assert.ok(
        lang === 'mr'
          ? dayModal2027.includes('अंदाजित पंचांग')
          : dayModal2027.includes('Estimated Panchang'),
        `DayDetailsModal (${lang}) must show estimated notice for 2027`
      );

      // SearchModal: ARIA check + estimated year disclosure
      const searchModal2027 = renderWithLang(
        lang,
        React.createElement(SearchModal, {
          isOpen: true,
          currentYear: 2027,
          onClose: noop,
          onSelectDay: noop,
        })
      );
      assert.ok(searchModal2027.includes('role="dialog"'));
      assert.ok(searchModal2027.includes('aria-labelledby="search-modal-title"'));
      assert.ok(searchModal2027.includes('id="search-modal-title"'));

      // NotificationModal: ARIA check + best-effort disclosure
      const notifHtml = renderWithLang(
        lang,
        React.createElement(NotificationModal, { isOpen: true, onClose: noop })
      );
      assert.ok(notifHtml.includes('role="dialog"'));
      assert.ok(notifHtml.includes('aria-labelledby="notification-modal-title"'));
      assert.ok(notifHtml.includes('id="notification-modal-title"'));

      // OfflineVaultModal: ARIA check
      const vaultHtml = renderWithLang(
        lang,
        React.createElement(OfflineVaultModal, { isOpen: true, onClose: noop })
      );
      assert.ok(vaultHtml.includes('role="dialog"'));
      assert.ok(vaultHtml.includes('aria-labelledby="offline-vault-title"'));
      assert.ok(vaultHtml.includes('id="offline-vault-title"'));

      // OfflineIndicator, SplashScreen, PWAInstallButton
      const offlineIndHtml = renderWithLang(
        lang,
        React.createElement(OfflineIndicator, { onOpenOfflineVault: noop })
      );
      assert.equal(typeof offlineIndHtml, 'string');

      const splashHtml = renderWithLang(lang, React.createElement(SplashScreen, { onFinish: noop }));
      assert.ok(splashHtml.includes('img_2912_1024_edcd846d.jpg'));

      const whatsNewHtml = renderWithLang(
        lang,
        React.createElement(WhatsNewModal, { isOpen: true, onAcknowledge: noop })
      );
      assert.ok(whatsNewHtml.includes('role="dialog"'));
      assert.ok(whatsNewHtml.includes('aria-modal="true"'));
      assert.ok(whatsNewHtml.includes('aria-labelledby="whats-new-title"'));
      assert.ok(whatsNewHtml.includes('id="whats-new-title"'));
      assert.ok(whatsNewHtml.includes(`v${LATEST_RELEASE.version}`));

      const pwaBtnHtml = renderWithLang(lang, React.createElement(PWAInstallButton, { compact: true }));
      assert.ok(pwaBtnHtml.includes('<button'));
    }

    // Error Boundary normal child render + derived error state + fallback UI check
    const boundaryOk = renderToStaticMarkup(
      React.createElement(AppErrorBoundary, null, React.createElement('div', null, 'Seva OK'))
    );
    assert.ok(boundaryOk.includes('Seva OK'));
    const derived = AppErrorBoundary.getDerivedStateFromError();
    assert.equal(derived.hasError, true);
    const boundaryInstance = new AppErrorBoundary({ children: null });
    boundaryInstance.state = { hasError: true };
    const fallbackHtml = renderToStaticMarkup(boundaryInstance.render() as React.ReactElement);
    assert.ok(fallbackHtml.includes('Something went wrong') && fallbackHtml.includes('श्री स्वामी समर्थ'));
  });
});

// ============================================================================
// 9. MOBILE RESPONSIVE, SAFE-AREA, ZERO-OVERLAP & iOS/ANDROID UI GUARDRAILS
// ============================================================================
describe('Mobile Responsive, Safe-Area, Zero-Overlap & iOS/Android Guardrails', () => {
  const rootDir = process.cwd();
  const readProjectFile = (relPath: string) => fs.readFileSync(path.resolve(rootDir, relPath), 'utf8');

  it('enforces iOS/Android viewport zoom freedom, cover fit, Tailwind v4 xs breakpoint, and sticky-safe overflow', () => {
    const html = readProjectFile('index.html');
    assert.ok(html.includes('viewport-fit=cover'), 'index.html must include viewport-fit=cover for notched iPhones/Androids');
    assert.ok(!/maximum-scale\s*=\s*1(\.0)?/i.test(html), 'index.html must not lock zoom with maximum-scale=1');
    assert.ok(!/user-scalable\s*=\s*(no|0)/i.test(html), 'index.html must not lock zoom with user-scalable=no');

    const css = readProjectFile('src/index.css');
    assert.ok(css.includes('--breakpoint-xs:'), 'src/index.css must declare Tailwind v4 @theme --breakpoint-xs');
    assert.ok(css.includes('--app-header-height:'), 'src/index.css must declare --app-header-height');
    assert.ok(css.includes('--app-bottom-nav-height:'), 'src/index.css must declare --app-bottom-nav-height');
    assert.ok(css.includes('-webkit-text-size-adjust: 100%'), 'src/index.css must prevent iOS landscape font inflation');
    assert.ok(css.includes('overflow-x: clip'), 'src/index.css must prevent horizontal overflow using overflow-x: clip');
    assert.ok(css.includes('touch-action: manipulation'), 'src/index.css must remove 300ms mobile double-tap delay');
    assert.ok(css.includes('.scrollbar-none'), 'src/index.css must define .scrollbar-none utility');
  });

  it('prevents fixed header/bottom-nav overlap, underlap, and asymmetric notch clipping across all viewports', () => {
    const appSrc = readProjectFile('src/App.tsx');
    const headerSrc = readProjectFile('src/components/Header.tsx');
    const bottomNavSrc = readProjectFile('src/components/BottomNav.tsx');
    const offlineBannerSrc = readProjectFile('src/components/OfflineIndicator.tsx');
    const saramrutSrc = readProjectFile('src/components/SaramrutView.tsx');
    const gallerySrc = readProjectFile('src/components/TempleGalleryView.tsx');

    // No broken Tailwind v4 color tokens
    assert.ok(!headerSrc.includes('orange-850'), 'Header must not use invalid Tailwind token orange-850');

    // Dynamic ResizeObserver height coordination
    assert.ok(appSrc.includes('ResizeObserver'), 'App must measure real header/bottom-nav heights with ResizeObserver');
    assert.ok(appSrc.includes('--app-header-height') && appSrc.includes('--app-bottom-nav-height'));
    assert.ok(appSrc.includes('var(--app-bottom-nav-height'), 'Main content must reserve dynamic bottom-nav clearance');

    // Symmetric horizontal safe-area insets for landscape notches
    for (const [name, src] of [
      ['App.tsx', appSrc],
      ['Header.tsx', headerSrc],
      ['BottomNav.tsx', bottomNavSrc],
      ['TempleGalleryView.tsx', gallerySrc],
    ] as const) {
      assert.ok(src.includes('safe-area-inset-left'), `${name} must apply safe-area-inset-left`);
      assert.ok(src.includes('safe-area-inset-right'), `${name} must apply safe-area-inset-right`);
    }

    // Header & BottomNav semantic anchors
    assert.ok(headerSrc.includes('id="app-top-header"'), 'Header must expose #app-top-header for height measurement');
    assert.ok(bottomNavSrc.includes('id="app-bottom-nav"'), 'BottomNav must expose #app-bottom-nav for height measurement');
    assert.ok(bottomNavSrc.includes("aria-current={isActive ? 'page' : undefined}"), 'BottomNav must set aria-current on active tab');

    // OfflineIndicator must NEVER collide with BottomNav at md:+ landscape widths
    assert.ok(
      offlineBannerSrc.includes('var(--app-bottom-nav-height'),
      'OfflineIndicator must anchor above --app-bottom-nav-height on all viewports'
    );
    assert.ok(
      !offlineBannerSrc.includes('md:bottom-[calc(1.5rem'),
      'OfflineIndicator must not use hardcoded md:bottom-[calc(1.5rem...)] that overlaps BottomNav on landscape phones'
    );

    // SaramrutView sticky toolbar must dynamically track measured header height
    assert.ok(
      saramrutSrc.includes('top-[var(--app-header-height'),
      'SaramrutView sticky bar must track dynamic --app-header-height'
    );
    assert.ok(
      !saramrutSrc.includes('top-[calc(3.5rem'),
      'SaramrutView must not hardcode 3.5rem header height'
    );

    // TempleGalleryView slideshow controls must remain crisp on a single row without awkward wrapping
    assert.ok(gallerySrc.includes('flex-nowrap'), 'TempleGalleryView controls must stay on a single non-wrapping row');
    assert.ok(gallerySrc.includes('whitespace-nowrap'), 'TempleGalleryView labels/buttons must prevent mid-label wrapping');
  });

  it('prevents awkward text, header, and button wrapping across all primary views and modals', () => {
    const antiWrapChecks = [
      { file: 'src/components/CalendarView.tsx', tokens: ['flex-nowrap', 'whitespace-nowrap', 'truncate'] },
      { file: 'src/components/TempleGalleryView.tsx', tokens: ['flex-nowrap', 'whitespace-nowrap', 'truncate'] },
      { file: 'src/components/NityaSevaView.tsx', tokens: ['flex-nowrap', 'whitespace-nowrap', 'truncate'] },
      { file: 'src/components/MuhuratAndSevaMargView.tsx', tokens: ['flex-nowrap', 'whitespace-nowrap', 'truncate'] },
      { file: 'src/components/FestivalsView.tsx', tokens: ['flex-nowrap', 'whitespace-nowrap', 'truncate'] },
      { file: 'src/components/SaramrutView.tsx', tokens: ['flex-nowrap', 'whitespace-nowrap', 'truncate'] },
      { file: 'src/components/SwamiVideosView.tsx', tokens: ['whitespace-nowrap', 'truncate'] },
      { file: 'src/components/DayDetailsModal.tsx', tokens: ['flex-nowrap', 'whitespace-nowrap', 'truncate'] },
      { file: 'src/components/NotificationModal.tsx', tokens: ['flex-nowrap', 'whitespace-nowrap', 'truncate'] },
      { file: 'src/components/OfflineVaultModal.tsx', tokens: ['flex-nowrap', 'whitespace-nowrap', 'truncate'] },
      { file: 'src/components/SearchModal.tsx', tokens: ['flex-nowrap', 'whitespace-nowrap', 'truncate'] },
      { file: 'src/components/OfflineMediaPlayer.tsx', tokens: ['flex-nowrap', 'whitespace-nowrap', 'truncate'] },
    ];

    for (const check of antiWrapChecks) {
      const content = readProjectFile(check.file);
      for (const token of check.tokens) {
        assert.ok(
          content.includes(token),
          `${check.file} must include ${token} to prevent awkward mobile text/button wrapping`
        );
      }
    }
  });

  it('prevents iOS Safari auto-zoom (<16px) on every visible text, time, number, and select control', () => {
    const formFiles = [
      { file: 'src/components/SearchModal.tsx', pattern: /className="[^"]*text-base[^"]*"/ },
      { file: 'src/components/DayDetailsModal.tsx', pattern: /id="day-note"[\s\S]*?text-base/ },
      { file: 'src/components/SaramrutView.tsx', pattern: /saramrutSearchPlaceholder[\s\S]*?text-base/ },
      { file: 'src/components/CalendarView.tsx', pattern: /<select[\s\S]*?text-base/ },
      { file: 'src/components/NotificationModal.tsx', pattern: /type="time"[\s\S]*?text-base/ },
      { file: 'src/components/NotificationModal.tsx', pattern: /type="number"[\s\S]*?text-base/ },
    ];

    for (const check of formFiles) {
      const content = readProjectFile(check.file);
      assert.match(
        content,
        check.pattern,
        `${check.file} must use text-base (>=16px) on mobile inputs/selects to prevent iOS Safari auto-zoom`
      );
    }
  });

  it('ensures every modal overlay enforces symmetric safe-area insets and dvh viewport caps', () => {
    const modalFiles = [
      'src/components/DayDetailsModal.tsx',
      'src/components/SearchModal.tsx',
      'src/components/NotificationModal.tsx',
      'src/components/OfflineVaultModal.tsx',
      'src/components/SplashScreen.tsx',
      'src/components/PWAInstallButton.tsx',
      'src/components/WhatsNewModal.tsx',
    ];

    for (const file of modalFiles) {
      const content = readProjectFile(file);
      assert.ok(content.includes('safe-area-inset-left'), `${file} must include safe-area-inset-left`);
      assert.ok(content.includes('safe-area-inset-right'), `${file} must include safe-area-inset-right`);
      assert.ok(content.includes('safe-area-inset-bottom'), `${file} must include safe-area-inset-bottom`);
      assert.ok(content.includes('dvh'), `${file} must use dynamic viewport height (dvh) for mobile keyboard/browser bars`);
    }
  });
});

// ============================================================================
// 10. POST-SPLASH UPDATE POPUP & FASTER SPLASH TIMING
// ============================================================================
describe('Post-Splash Publish Update Popup & Faster Splash Timing', () => {
  it('triggers What’s New popup once per publish/republish build and re-triggers on new build ID', () => {
    const mem = createMemoryStorage();
    assert.ok(LATEST_RELEASE.items.length >= 3, 'Release notes should summarize key upgrades and fixes');

    // First visit on build-1 -> unread
    assert.equal(hasUnreadRelease(mem, 'build-1'), true);

    // User taps OK -> acknowledged for build-1
    markReleaseAsSeen(mem, 'build-1');
    assert.equal(hasUnreadRelease(mem, 'build-1'), false);

    // User republishes app -> build-2 automatically becomes unread again
    assert.equal(hasUnreadRelease(mem, 'build-2'), true);

    // User taps OK on build-2 -> acknowledged
    markReleaseAsSeen(mem, 'build-2');
    assert.equal(hasUnreadRelease(mem, 'build-2'), false);
  });

  it('keeps SplashScreen fast (<= 1200ms) and wires post-splash update check in App.tsx', () => {
    const splashSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/components/SplashScreen.tsx'), 'utf8');
    const durationMatch = splashSrc.match(/autoHideDuration\s*=\s*(\d+)/);
    assert.ok(durationMatch, 'SplashScreen must define a default autoHideDuration');
    const durationMs = Number(durationMatch[1]);
    assert.ok(durationMs <= 1200, `SplashScreen default duration (${durationMs}ms) should be <= 1200ms`);

    const appSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf8');
    assert.ok(appSrc.includes('handleSplashFinish'), 'App.tsx must handle splash completion');
    assert.ok(appSrc.includes('hasUnreadRelease()'), 'App.tsx must check unread publish release right after splash');
    assert.ok(appSrc.includes('<WhatsNewModal'), 'App.tsx must render WhatsNewModal');
  });
});

