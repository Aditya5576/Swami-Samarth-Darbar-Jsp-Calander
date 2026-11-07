import { DayData } from '../types/calendar';
import { getTodayDateInfo } from './calendarLogic';
import { playBellChime } from './audioChime';
import { ENGLISH_DAYS } from './translations';

export interface NotificationSettings {
  enabled: boolean;
  time: string; // '06:00', '05:30', '07:00', '08:00'
  soundEnabled: boolean;
  lastNotifiedDate?: string; // 'YYYY-MM-DD'
  backgroundSyncEnabled?: boolean;
}

const SETTINGS_KEY = 'swami_daily_notif_settings';

export const DEFAULT_NOTIF_SETTINGS: NotificationSettings = {
  enabled: true,
  time: '06:00',
  soundEnabled: true,
  lastNotifiedDate: undefined,
  backgroundSyncEnabled: true,
};

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
}

/**
 * Generates the notification title and message based on the day's special events.
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

  if (lang === 'mr') {
    let title = '॥ श्री स्वामी समर्थ ॥ जयसिंगपूर सेवा केंद्र';
    let body = '';

    if (isSankashti) {
      const moon = day.moonriseTime ? ` (चंद्रोदय: ${day.moonriseTime})` : '';
      title = '🔴 आज संकष्टी चतुर्थी आहे!';
      body = `आज पावन संकष्टी चतुर्थी उपवास${moon}. संकटनाशन गणेश स्तोत्र व श्री स्वामी समर्थ नामस्मरण करा.`;
    } else if (isSwamiSpecial) {
      const festTitle = hasFestivals ? day.festivals[0].title : 'विशेष पर्व';
      title = `🕉️ आज स्वामी विशेष पर्व: ${festTitle}`;
      body = `आज श्री स्वामी समर्थ महाराजांचा पावन दिन! तारक मंत्र व नामजप करावा. आम्ही गेलो नाही, जिवंतचि आहोत!`;
    } else if (isEkadashi) {
      const ekaName = hasFestivals ? day.festivals[0].title : 'एकादशी उपवास';
      title = `🟣 आज पवित्र ${ekaName} आहे!`;
      body = `आज सर्व पापांचे क्षालन करणारी एकादशी. उपवास, विष्णू सहस्रनाम व स्वामी नामस्मरण करा.`;
    } else if (isPournima) {
      const pTitle = hasFestivals ? day.festivals[0].title : 'पौर्णिमा';
      title = `🌕 आज ${pTitle} आहे!`;
      body = `आज सत्यनारायण पूजा व दीपपूजनाचा शुभ दिवस. श्री स्वामी समर्थ पादुका नमन करा.`;
    } else if (isAmavasya) {
      title = `🌑 आज दर्श अमावास्या आहे!`;
      body = `आज सायंकाळी दिवे लावा व कुलदैवताचे नामस्मरण करा. स्वामी कृपा सदैव पाठीशी राहो.`;
    } else if (hasFestivals) {
      title = `✨ आजचा सण: ${day.festivals[0].title}`;
      body = `${day.festivals[0].description} तिथी: ${day.tithi}, ${day.paksha} पक्ष. ॥ श्री स्वामी समर्थ ॥`;
    } else {
      title = `🌸 शुभ प्रभात! आजची तिथी: ${day.tithi}`;
      body = `आज ${day.marathiDayName}, ${day.paksha} पक्ष. "भिऊ नकोस मी तुझ्या पाठीशी आहे." ॥ श्री स्वामी समर्थ ॥`;
    }

    return { title, body, badgeIcon: '/pwa-192x192.png' };
  } else {
    let title = 'Shree Swami Samarth Seva Kendra, Jaysingpur';
    let body = '';

    if (isSankashti) {
      const moon = day.moonriseTime ? ` (Moonrise: ${day.moonriseTime})` : '';
      title = '🔴 Today is Sankashti Chaturthi!';
      body = `Auspicious Sankashti fasting today${moon}. Recite Sankatnashan Ganesh Stotra and chant Shree Swami Samarth.`;
    } else if (isSwamiSpecial) {
      const festTitle = hasFestivals ? day.festivals[0].titleEn : 'Swami Special Day';
      title = `🕉️ Swami Special: ${festTitle}`;
      body = `A deeply auspicious day dedicated to Shree Swami Samarth Maharaj. Recite Tarak Mantra & 108 Japa.`;
    } else if (isEkadashi) {
      const ekaName = hasFestivals ? day.festivals[0].titleEn : 'Ekadashi Vrat';
      title = `🟣 Today is Sacred ${ekaName}!`;
      body = `Fasting & prayers today. Chant the holy names of Lord Vishnu and Swami Maharaj.`;
    } else if (isPournima) {
      title = `🌕 Today is Pournima (Full Moon)!`;
      body = `Satyanarayan worship & holy prayers. May divine grace illuminate your home.`;
    } else if (isAmavasya) {
      title = `🌑 Today is Amavasya (New Moon)!`;
      body = `Offer evening prayers and remembrance of ancestral lineage. May Swami bless your day.`;
    } else if (hasFestivals) {
      title = `✨ Today: ${day.festivals[0].titleEn}`;
      body = `${day.festivals[0].description} Tithi: ${day.tithi}, ${day.paksha} Paksha.`;
    } else {
      title = `🌸 Good Morning! Tithi: ${day.tithi}`;
      const dayName = ENGLISH_DAYS[day.dayOfWeek] || '';
      body = `Today is ${dayName}, ${day.paksha} Paksha. "Fear not, I am always with you." ॥ Shree Swami Samarth ॥`;
    }

    return { title, body, badgeIcon: '/pwa-192x192.png' };
  }
}

/**
 * Checks if browser supports Notifications API
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Gets current notification permission
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Requests notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Auto-register background sync and alarms
      registerPeriodicDailySync();
      const settings = getNotificationSettings();
      scheduleFutureDailyAlarms(7, settings.time, 'mr');
    }
    return permission;
  } catch (e) {
    console.error('Error requesting notification permission:', e);
    return 'denied';
  }
}

/**
 * Sends a notification immediately (using service worker if available, falling back to Notification constructor)
 */
export async function sendDailyNotification(
  dayData?: DayData,
  lang: 'mr' | 'en' = 'mr',
  playChime: boolean = true
): Promise<boolean> {
  if (!isNotificationSupported()) return false;

  const permission = Notification.permission;
  if (permission !== 'granted') {
    const requested = await requestNotificationPermission();
    if (requested !== 'granted') return false;
  }

  const targetDay = dayData || getTodayDateInfo().dayData;
  const { title, body, badgeIcon } = buildTodayNotificationMessage(targetDay, lang);

  if (playChime) {
    try {
      playBellChime();
    } catch {
      // Audio might be blocked if without user interaction
    }
  }

  try {
    // Try via ServiceWorkerRegistration first (standard PWA recommendation)
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

    // Fallback to standard window Notification
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
 * Registers Periodic Background Sync so the Android OS wakes up the Service Worker
 * even when the PWA is closed!
 */
export async function registerPeriodicDailySync(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    if ('periodicSync' in registration) {
      const periodicSync = (registration as any).periodicSync;
      try {
        await periodicSync.register('daily-darshan-sync', {
          minInterval: 12 * 60 * 60 * 1000, // 12 hours interval for morning notification
        });
        return true;
      } catch (err) {
        console.warn('Periodic sync register fallback:', err);
      }
    }
  } catch (e) {
    console.warn('Periodic sync registration error:', e);
  }
  return false;
}

/**
 * Schedules future daily morning alarms (using Notification Triggers API / TimestampTrigger)
 * so Android triggers the notifications at the specified time even if the app is closed!
 */
export async function scheduleFutureDailyAlarms(
  daysAhead = 7,
  time = '06:00',
  lang: 'mr' | 'en' = 'mr'
): Promise<number> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return 0;
  try {
    const registration = await navigator.serviceWorker.ready;
    const [hours, minutes] = time.split(':').map(Number);
    let count = 0;

    const now = new Date();
    for (let i = 1; i <= daysAhead; i++) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + i);
      targetDate.setHours(hours, minutes, 0, 0);

      const dateStr = targetDate.toISOString().split('T')[0];
      const title =
        lang === 'mr'
          ? '॥ श्री स्वामी समर्थ ॥ शुभ प्रभात'
          : '॥ Shree Swami Samarth ॥ Good Morning';
      const body =
        lang === 'mr'
          ? 'आजचे पंचांग व नित्यसेवा स्मरण. "भिऊ नकोस मी तुझ्या पाठीशी आहे."'
          : "Today's Panchang & Nitya Seva. \"Fear not, I am with you.\"";

      // Check if browser supports TimestampTrigger
      const TimestampTriggerClass = (window as any).TimestampTrigger;
      if ('showTrigger' in Notification.prototype && TimestampTriggerClass) {
        try {
          await registration.showNotification(title, {
            body,
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            tag: `swami-alarm-${dateStr}`,
            showTrigger: new TimestampTriggerClass(targetDate.getTime()),
            data: { url: '/', date: dateStr },
          } as any);
          count++;
        } catch (e) {
          console.warn('TimestampTrigger register failed for date:', dateStr, e);
        }
      }

      // Notify service worker of schedule
      if (registration.active) {
        registration.active.postMessage({
          type: 'SCHEDULE_DAY_ALARM',
          title,
          body,
          timestamp: targetDate.getTime(),
          tag: `swami-alarm-${dateStr}`,
        });
      }
    }

    return count;
  } catch (err) {
    console.warn('Failed scheduling future daily alarms:', err);
    return 0;
  }
}

/**
 * Sends a delayed background test notification through the Service Worker
 * so the user can close the app and verify the notification pops up!
 */
export async function testBackgroundNotification(
  delaySeconds = 5,
  lang: 'mr' | 'en' = 'mr'
): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    const title =
      lang === 'mr'
        ? '॥ श्री स्वामी समर्थ ॥ चाचणी सूचना'
        : '॥ Shree Swami Samarth ॥ Test Alert';
    const body =
      lang === 'mr'
        ? 'अॅप बंद असतानाही ही सूचना यशस्वीरीत्या आली! "भिऊ नकोस मी तुझ्या पाठीशी आहे."'
        : 'Notification received successfully even with app closed! "Fear not, I am with you."';

    if (registration.active) {
      registration.active.postMessage({
        type: 'TEST_BACKGROUND_NOTIFICATION',
        delayMs: delaySeconds * 1000,
        title,
        body,
      });
      return true;
    }
  } catch (e) {
    console.warn('Test background notification failed:', e);
  }
  return false;
}

/**
 * Initializes the background scheduler and registers periodic sync and upcoming alarms.
 */
export function initDailyNotificationScheduler(lang: 'mr' | 'en' = 'mr'): () => void {
  if (typeof window === 'undefined') return () => {};

  // Setup periodic sync and future alarms on startup
  if ('serviceWorker' in navigator && Notification.permission === 'granted') {
    registerPeriodicDailySync();
    const settings = getNotificationSettings();
    if (settings.enabled) {
      scheduleFutureDailyAlarms(7, settings.time, lang);
    }
  }

  const checkAndTrigger = () => {
    const settings = getNotificationSettings();
    if (!settings.enabled) return;
    if (Notification.permission !== 'granted') return;

    const now = new Date();
    const [targetHour, targetMinute] = settings.time.split(':').map(Number);
    const isPastTargetTime =
      now.getHours() > targetHour ||
      (now.getHours() === targetHour && now.getMinutes() >= targetMinute);

    const todayDateStr = getTodayDateInfo().dateStr;

    // If it's on or after target time (e.g. 6 AM) and hasn't notified today yet
    if (isPastTargetTime && settings.lastNotifiedDate !== todayDateStr) {
      sendDailyNotification(undefined, lang, settings.soundEnabled);
      saveNotificationSettings({
        ...settings,
        lastNotifiedDate: todayDateStr,
      });
    }
  };

  // Run initial check
  checkAndTrigger();

  // Check every 60 seconds while open
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
  if (!state) {
    localStorage.removeItem(CUSTOM_TIMER_KEY);
  } else {
    localStorage.setItem(CUSTOM_TIMER_KEY, JSON.stringify(state));
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
  } catch (err) {
    try {
      new Notification(title, { body });
      return true;
    } catch {
      return false;
    }
  }
}
