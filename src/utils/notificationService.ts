import type { DayData } from '../types/calendar';
import { getTodayDateInfo } from './calendarLogic';
import { playBellChime } from './audioChime';
import { ENGLISH_DAYS } from './translations';

export interface NotificationSettings {
  enabled: boolean;
  time: string; // '06:00', '05:30', '07:00', '08:00'
  soundEnabled: boolean;
  language?: 'mr' | 'en';
  lastNotifiedDate?: string; // 'YYYY-MM-DD' (local date)
  backgroundSyncEnabled?: boolean;
}

export interface NotificationCapabilities {
  notificationsApi: boolean;
  permission: NotificationPermission;
  serviceWorker: boolean;
  periodicSync: boolean;
  timestampTrigger: boolean;
}

export interface AlarmScheduleResult {
  scheduledCount: number;
  status: 'scheduled' | 'permission_denied' | 'unsupported' | 'failed';
  error?: string;
}

export interface BackgroundTestResult {
  ok: boolean;
  reason?: 'permission_denied' | 'unsupported' | 'no_service_worker' | 'failed';
  error?: string;
}

const SETTINGS_KEY = 'swami_daily_notif_settings';
const NOTIF_PREFS_DB = 'swami_notif_prefs_v1';
const NOTIF_PREFS_STORE = 'prefs';
const NOTIF_PREFS_KEY = 'daily';

export const DEFAULT_NOTIF_SETTINGS: NotificationSettings = {
  enabled: true,
  time: '06:00',
  soundEnabled: true,
  language: 'mr',
  lastNotifiedDate: undefined,
  backgroundSyncEnabled: true,
};

function getLocalDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function syncNotificationPrefsToWorkerStore(settings: NotificationSettings): Promise<void> {
  if (typeof window === 'undefined') return;

  const payload = {
    enabled: Boolean(settings.enabled),
    time: settings.time || '06:00',
    language: settings.language === 'en' ? 'en' : 'mr',
    lastNotifiedDate: settings.lastNotifiedDate || null,
  };

  if (typeof indexedDB !== 'undefined') {
    try {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open(NOTIF_PREFS_DB, 1);
        req.onupgradeneeded = () => {
          const database = req.result;
          if (!database.objectStoreNames.contains(NOTIF_PREFS_STORE)) {
            database.createObjectStore(NOTIF_PREFS_STORE);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(NOTIF_PREFS_STORE, 'readwrite');
        tx.objectStore(NOTIF_PREFS_STORE).put(payload, NOTIF_PREFS_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      db.close();
    } catch {
      // Fallback to SW message below
    }
  }

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg?.active) {
        reg.active.postMessage({ type: 'SYNC_NOTIF_PREFS', prefs: payload });
      }
    }
  } catch {
    // ignore SW messaging errors
  }
}

export function getNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_NOTIF_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_NOTIF_SETTINGS;
    return { ...DEFAULT_NOTIF_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIF_SETTINGS;
  }
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save notification settings', e);
  }
  void syncNotificationPrefsToWorkerStore(settings);
}

/**
 * Reports actual notification and background scheduling capabilities available on this device/browser.
 */
export async function getNotificationCapabilities(): Promise<NotificationCapabilities> {
  if (typeof window === 'undefined') {
    return {
      notificationsApi: false,
      permission: 'denied',
      serviceWorker: false,
      periodicSync: false,
      timestampTrigger: false,
    };
  }

  const notificationsApi = 'Notification' in window;
  const permission: NotificationPermission = notificationsApi ? Notification.permission : 'denied';
  const serviceWorker = 'serviceWorker' in navigator;
  let periodicSync = false;

  if (serviceWorker) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      periodicSync = Boolean(reg && 'periodicSync' in reg);
    } catch {
      periodicSync = false;
    }
  }

  const timestampTrigger =
    notificationsApi &&
    'showTrigger' in Notification.prototype &&
    typeof (window as unknown as { TimestampTrigger?: unknown }).TimestampTrigger !== 'undefined';

  return {
    notificationsApi,
    permission,
    serviceWorker,
    periodicSync,
    timestampTrigger,
  };
}

/**
 * Generates the notification title and message based on the day's special events.
 * Marks estimated (non-2026) Panchang dates clearly so users are never misled.
 */
export function buildTodayNotificationMessage(day: DayData, lang: 'mr' | 'en' = 'mr'): {
  title: string;
  body: string;
  badgeIcon: string;
} {
  const isSankashti = day.isSankashti;
  const isEkadashi = day.isEkadashi;
  const isSwamiSpecial = day.isSwamiSpecial;
  const isPournima = day.isPournima;
  const isAmavasya = day.isAmavasya;
  const hasFestivals = day.festivals.length > 0;
  const estSuffixMr = day.isEstimated ? ' (अंदाजित पंचांग)' : '';
  const estSuffixEn = day.isEstimated ? ' (Estimated Panchang)' : '';

  if (lang === 'mr') {
    let title = '॥ श्री स्वामी समर्थ ॥ जयसिंगपूर सेवा केंद्र';
    let body = '';

    if (isSankashti) {
      const moon = day.moonriseTime ? ` (चंद्रोदय: ${day.moonriseTime})` : '';
      title = `🔴 आज संकष्टी चतुर्थी आहे!${estSuffixMr}`;
      body = `आज पावन संकष्टी चतुर्थी उपवास${moon}. संकटनाशन गणेश स्तोत्र व श्री स्वामी समर्थ नामस्मरण करा.`;
    } else if (isSwamiSpecial) {
      const festTitle = hasFestivals ? day.festivals[0].title : 'विशेष पर्व';
      title = `🕉️ आज स्वामी विशेष पर्व: ${festTitle}${estSuffixMr}`;
      body = `आज श्री स्वामी समर्थ महाराजांचा पावन दिन! तारक मंत्र व नामजप करावा. आम्ही गेलो नाही, जिवंतचि आहोत!`;
    } else if (isEkadashi) {
      const ekaName = hasFestivals ? day.festivals[0].title : 'एकादशी उपवास';
      title = `🟣 आज पवित्र ${ekaName} आहे!${estSuffixMr}`;
      body = `आज सर्व पापांचे क्षालन करणारी एकादशी. उपवास, विष्णू सहस्रनाम व स्वामी नामस्मरण करा.`;
    } else if (isPournima) {
      const pTitle = hasFestivals ? day.festivals[0].title : 'पौर्णिमा';
      title = `🌕 आज ${pTitle} आहे!${estSuffixMr}`;
      body = `आज सत्यनारायण पूजा व दीपपूजनाचा शुभ दिवस. श्री स्वामी समर्थ पादुका नमन करा.`;
    } else if (isAmavasya) {
      title = `🌑 आज दर्श अमावास्या आहे!${estSuffixMr}`;
      body = `आज सायंकाळी दिवे लावा व कुलदैवताचे नामस्मरण करा. स्वामी कृपा सदैव पाठीशी राहो.`;
    } else if (hasFestivals) {
      title = `✨ आजचा सण: ${day.festivals[0].title}${estSuffixMr}`;
      body = `${day.festivals[0].description} तिथी: ${day.tithi}, ${day.paksha} पक्ष. ॥ श्री स्वामी समर्थ ॥`;
    } else {
      title = `🌸 शुभ प्रभात! आजची तिथी: ${day.tithi}${estSuffixMr}`;
      body = `आज ${day.marathiDayName}, ${day.paksha} पक्ष. "भिऊ नकोस मी तुझ्या पाठीशी आहे." ॥ श्री स्वामी समर्थ ॥`;
    }

    return { title, body, badgeIcon: '/pwa-192x192.png' };
  } else {
    let title = 'Shree Swami Samarth Seva Kendra, Jaysingpur';
    let body = '';

    if (isSankashti) {
      const moon = day.moonriseTime ? ` (Moonrise: ${day.moonriseTime})` : '';
      title = `🔴 Today is Sankashti Chaturthi!${estSuffixEn}`;
      body = `Auspicious Sankashti fasting today${moon}. Recite Sankatnashan Ganesh Stotra and chant Shree Swami Samarth.`;
    } else if (isSwamiSpecial) {
      const festTitle = hasFestivals ? day.festivals[0].titleEn : 'Swami Special Day';
      title = `🕉️ Swami Special: ${festTitle}${estSuffixEn}`;
      body = `A deeply auspicious day dedicated to Shree Swami Samarth Maharaj. Recite Tarak Mantra & 108 Japa.`;
    } else if (isEkadashi) {
      const ekaName = hasFestivals ? day.festivals[0].titleEn : 'Ekadashi Vrat';
      title = `🟣 Today is Sacred ${ekaName}!${estSuffixEn}`;
      body = `Fasting & prayers today. Chant the holy names of Lord Vishnu and Swami Maharaj.`;
    } else if (isPournima) {
      title = `🌕 Today is Pournima (Full Moon)!${estSuffixEn}`;
      body = `Satyanarayan worship & holy prayers. May divine grace illuminate your home.`;
    } else if (isAmavasya) {
      title = `🌑 Today is Amavasya (New Moon)!${estSuffixEn}`;
      body = `Offer evening prayers and remembrance of ancestral lineage. May Swami bless your day.`;
    } else if (hasFestivals) {
      title = `✨ Today: ${day.festivals[0].titleEn}${estSuffixEn}`;
      body = `${day.festivals[0].description} Tithi: ${day.tithi}, ${day.paksha} Paksha.`;
    } else {
      title = `🌸 Good Morning! Tithi: ${day.tithi}${estSuffixEn}`;
      const dayName = ENGLISH_DAYS[day.dayOfWeek] || '';
      body = `Today is ${dayName}, ${day.paksha} Paksha. "Fear not, I am always with you." ॥ Shree Swami Samarth ॥`;
    }

    return { title, body, badgeIcon: '/pwa-192x192.png' };
  }
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(lang: 'mr' | 'en' = 'mr'): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const settings = { ...getNotificationSettings(), language: lang };
      saveNotificationSettings(settings);
      if (settings.enabled) {
        await registerPeriodicDailySync();
        await scheduleFutureDailyAlarms(7, settings.time, lang);
      }
    }
    return permission;
  } catch (e) {
    console.error('Error requesting notification permission:', e);
    return 'denied';
  }
}

export async function sendDailyNotification(
  dayData?: DayData,
  lang: 'mr' | 'en' = 'mr',
  playChime: boolean = true
): Promise<boolean> {
  if (!isNotificationSupported()) return false;

  const permission = Notification.permission;
  if (permission !== 'granted') {
    const requested = await requestNotificationPermission(lang);
    if (requested !== 'granted') return false;
  }

  const targetDay = dayData || getTodayDateInfo().dayData;
  const { title, body, badgeIcon } = buildTodayNotificationMessage(targetDay, lang);

  if (playChime) {
    try {
      playBellChime();
    } catch {
      // Audio might be blocked without user interaction
    }
  }

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, {
          body,
          icon: badgeIcon,
          badge: badgeIcon,
          tag: 'swami-daily-alert',
          renotify: true,
          data: {
            url: '/',
            date: targetDay.date,
          },
        } as NotificationOptions);
        return true;
      }
    }

    new Notification(title, {
      body,
      icon: badgeIcon,
      badge: badgeIcon,
      tag: 'swami-daily-alert',
    });
    return true;
  } catch (err) {
    console.warn('Notification display failed, trying window fallback', err);
    try {
      new Notification(title, { body, icon: badgeIcon });
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Registers Periodic Background Sync where supported by the browser (best-effort).
 */
export async function registerPeriodicDailySync(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    if ('periodicSync' in registration) {
      const periodicSync = (registration as unknown as {
        periodicSync?: { register: (tag: string, opts: { minInterval: number }) => Promise<void> };
      }).periodicSync;
      if (periodicSync) {
        try {
          await periodicSync.register('daily-darshan-sync', {
            minInterval: 12 * 60 * 60 * 1000,
          });
          return true;
        } catch (err) {
          console.warn('Periodic sync register fallback:', err);
        }
      }
    }
  } catch (e) {
    console.warn('Periodic sync registration error:', e);
  }
  return false;
}

/**
 * Unregisters Periodic Background Sync when the user disables daily notifications.
 */
export async function unregisterPeriodicDailySync(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && 'periodicSync' in registration) {
      const periodicSync = (registration as unknown as {
        periodicSync?: { unregister: (tag: string) => Promise<void> };
      }).periodicSync;
      if (periodicSync) {
        await periodicSync.unregister('daily-darshan-sync');
        return true;
      }
    }
  } catch (e) {
    console.warn('Periodic sync unregister error:', e);
  }
  return false;
}

interface SwMessageReply {
  ok: boolean;
  accepted?: boolean;
  reason?: 'permission_denied' | 'unsupported' | 'failed';
  error?: string;
}

function postMessageWithReply(
  worker: ServiceWorker,
  payload: Record<string, unknown>,
  timeoutMs = 3500
): Promise<SwMessageReply | null> {
  if (typeof MessageChannel === 'undefined') {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    let settled = false;

    const finish = (value: SwMessageReply | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      channel.port1.onmessage = null;
      try {
        channel.port1.close();
      } catch {
        // ignore close error
      }
      resolve(value);
    };

    const timer = window.setTimeout(() => finish(null), timeoutMs);
    channel.port1.onmessage = (evt: MessageEvent<SwMessageReply>) => {
      finish(evt.data ?? null);
    };

    try {
      worker.postMessage(payload, [channel.port2]);
    } catch (err) {
      finish({
        ok: false,
        reason: 'failed',
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });
}

/**
 * Best-effort future daily notification scheduling where TimestampTrigger is supported.
 * Explicitly distinguishes permission denied, unsupported browser capability, and rejected registration.
 */
export async function scheduleFutureDailyAlarms(
  daysAhead = 7,
  time = '06:00',
  lang: 'mr' | 'en' = 'mr'
): Promise<AlarmScheduleResult> {
  if (typeof window === 'undefined' || !isNotificationSupported()) {
    return { scheduledCount: 0, status: 'unsupported' };
  }

  if (Notification.permission !== 'granted') {
    return { scheduledCount: 0, status: 'permission_denied' };
  }

  if (!('serviceWorker' in navigator)) {
    return { scheduledCount: 0, status: 'unsupported' };
  }

  const TimestampTriggerClass = (window as unknown as {
    TimestampTrigger?: new (ts: number) => unknown;
  }).TimestampTrigger;
  const hasTriggerSupport =
    'showTrigger' in Notification.prototype && Boolean(TimestampTriggerClass);

  if (!hasTriggerSupport) {
    return { scheduledCount: 0, status: 'unsupported' };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const [hours, minutes] = time.split(':').map(Number);
    let count = 0;
    let lastFailureReason: 'permission_denied' | 'unsupported' | 'failed' | undefined;
    let lastError: string | undefined;

    const now = new Date();
    for (let i = 1; i <= daysAhead; i++) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + i);
      targetDate.setHours(hours, minutes, 0, 0);

      const dateStr = getLocalDateKey(targetDate);
      const title =
        lang === 'mr'
          ? '॥ श्री स्वामी समर्थ ॥ शुभ प्रभात'
          : '॥ Shree Swami Samarth ॥ Good Morning';
      const body =
        lang === 'mr'
          ? 'आजचे पंचांग व नित्यसेवा स्मरण. "भिऊ नकोस मी तुझ्या पाठीशी आहे."'
          : "Today's Panchang & Nitya Seva. \"Fear not, I am with you.\"";

      if (registration.active && typeof MessageChannel !== 'undefined') {
        const reply = await postMessageWithReply(registration.active, {
          type: 'SCHEDULE_DAY_ALARM',
          title,
          body,
          timestamp: targetDate.getTime(),
          tag: `swami-alarm-${dateStr}`,
        });

        if (reply?.ok) {
          count++;
          continue;
        }
        if (reply && !reply.ok) {
          lastFailureReason = reply.reason || 'failed';
          lastError = reply.error;
          if (lastFailureReason === 'permission_denied' || lastFailureReason === 'unsupported') {
            break;
          }
          continue;
        }
      }

      try {
        await registration.showNotification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: `swami-alarm-${dateStr}`,
          showTrigger: new TimestampTriggerClass!(targetDate.getTime()),
          data: { url: '/', date: dateStr },
        } as NotificationOptions);
        count++;
      } catch (e) {
        console.warn('TimestampTrigger register failed for date:', dateStr, e);
        lastFailureReason = 'failed';
        lastError = e instanceof Error ? e.message : String(e);
      }
    }

    if (count > 0) {
      return { scheduledCount: count, status: 'scheduled' };
    }
    if (lastFailureReason === 'permission_denied') {
      return { scheduledCount: 0, status: 'permission_denied', error: lastError };
    }
    if (lastFailureReason === 'unsupported') {
      return { scheduledCount: 0, status: 'unsupported', error: lastError };
    }
    return { scheduledCount: 0, status: 'failed', error: lastError };
  } catch (err) {
    console.warn('Failed scheduling future daily alarms:', err);
    return {
      scheduledCount: 0,
      status: 'failed',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function testBackgroundNotification(
  delaySeconds = 5,
  lang: 'mr' | 'en' = 'mr'
): Promise<BackgroundTestResult> {
  if (typeof window === 'undefined' || !isNotificationSupported()) {
    return { ok: false, reason: 'unsupported' };
  }

  if (Notification.permission !== 'granted') {
    return { ok: false, reason: 'permission_denied' };
  }

  if (!('serviceWorker' in navigator)) {
    return { ok: false, reason: 'no_service_worker' };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if (!registration?.active) {
      return { ok: false, reason: 'no_service_worker' };
    }

    const title =
      lang === 'mr'
        ? '॥ श्री स्वामी समर्थ ॥ चाचणी सूचना'
        : '॥ Shree Swami Samarth ॥ Test Alert';
    const body =
      lang === 'mr'
        ? 'सेवा केंद्राची चाचणी सूचना यशस्वीरीत्या आली! "भिऊ नकोस मी तुझ्या पाठीशी आहे."'
        : 'Test alert received successfully! "Fear not, I am with you."';

    const reply = await postMessageWithReply(registration.active, {
      type: 'TEST_BACKGROUND_NOTIFICATION',
      delayMs: delaySeconds * 1000,
      title,
      body,
    });

    if (reply?.ok) {
      return { ok: true };
    }

    return {
      ok: false,
      reason: reply?.reason || 'failed',
      error: reply?.error,
    };
  } catch (e) {
    console.warn('Test background notification failed:', e);
    return {
      ok: false,
      reason: 'failed',
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

/**
 * Initializes the daily notification scheduler and syncs preferences with the Service Worker.
 */
export function initDailyNotificationScheduler(lang: 'mr' | 'en' = 'mr'): () => void {
  if (typeof window === 'undefined') return () => {};

  const initialSettings = getNotificationSettings();
  const syncedSettings: NotificationSettings = { ...initialSettings, language: lang };
  void syncNotificationPrefsToWorkerStore(syncedSettings);

  if ('serviceWorker' in navigator && isNotificationSupported() && Notification.permission === 'granted') {
    if (syncedSettings.enabled) {
      void registerPeriodicDailySync();
      void scheduleFutureDailyAlarms(7, syncedSettings.time, lang);
    } else {
      void unregisterPeriodicDailySync();
    }
  }

  const checkAndTrigger = () => {
    const settings = getNotificationSettings();
    if (!settings.enabled) return;
    if (!isNotificationSupported() || Notification.permission !== 'granted') return;

    const now = new Date();
    const [targetHour, targetMinute] = settings.time.split(':').map(Number);
    const isPastTargetTime =
      now.getHours() > targetHour ||
      (now.getHours() === targetHour && now.getMinutes() >= targetMinute);

    const todayDateStr = getLocalDateKey(now);

    if (isPastTargetTime && settings.lastNotifiedDate !== todayDateStr) {
      void sendDailyNotification(undefined, lang, settings.soundEnabled);
      saveNotificationSettings({
        ...settings,
        language: lang,
        lastNotifiedDate: todayDateStr,
      });
    }
  };

  checkAndTrigger();

  const intervalId = window.setInterval(checkAndTrigger, 60000);

  return () => {
    window.clearInterval(intervalId);
  };
}

const CUSTOM_TIMER_KEY = 'swami_custom_timer_state';

export interface CustomTimerState {
  active: boolean;
  targetTimestamp: number;
  totalMinutes: number;
  purpose: string;
  soundEnabled: boolean;
}

export function getCustomTimerState(): CustomTimerState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CUSTOM_TIMER_KEY);
    if (!raw) return null;
    const parsed: CustomTimerState = JSON.parse(raw);
    if (parsed.active && parsed.targetTimestamp > Date.now()) {
      return parsed;
    }
    localStorage.removeItem(CUSTOM_TIMER_KEY);
    return null;
  } catch {
    return null;
  }
}

export function saveCustomTimerState(state: CustomTimerState | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!state) {
      localStorage.removeItem(CUSTOM_TIMER_KEY);
    } else {
      localStorage.setItem(CUSTOM_TIMER_KEY, JSON.stringify(state));
    }
  } catch {
    // Ignore blocked or full storage errors
  }
}

export async function sendTimerAlertNotification(
  purpose: string,
  lang: 'mr' | 'en' = 'mr',
  playChime: boolean = true
): Promise<boolean> {
  if (playChime) {
    try {
      playBellChime();
    } catch {
      // Audio fallback
    }
  }

  const title =
    lang === 'mr' ? '॥ श्री स्वामी समर्थ स्मरणपत्र ॥' : '॥ Shree Swami Samarth Reminder ॥';
  const body =
    lang === 'mr'
      ? `आपले ${purpose} स्मरणपत्र पूर्ण झाले आहे! "भिऊ नकोस मी तुझ्या पाठीशी आहे."`
      : `Your reminder for ${purpose} is complete! "Fear not, I am always with you."`;

  if (!isNotificationSupported()) return false;

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: 'swami-custom-timer',
        } as NotificationOptions);
        return true;
      }
    }
    new Notification(title, {
      body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
    });
    return true;
  } catch {
    try {
      new Notification(title, { body });
      return true;
    } catch {
      return false;
    }
  }
}
