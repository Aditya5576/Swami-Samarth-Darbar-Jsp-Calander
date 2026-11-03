import { DayData } from '../types/calendar';
import { getTodayDateInfo } from './calendarLogic';
import { playBellChime } from './audioChime';
import { ENGLISH_DAYS } from './translations';

export interface NotificationSettings {
  enabled: boolean;
  time: string; // '06:00', '05:30', '07:00', '08:00'
  soundEnabled: boolean;
  lastNotifiedDate?: string; // 'YYYY-MM-DD'
}

const SETTINGS_KEY = 'swami_daily_notif_settings';

export const DEFAULT_NOTIF_SETTINGS: NotificationSettings = {
  enabled: true,
  time: '06:00',
  soundEnabled: true,
  lastNotifiedDate: undefined,
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
      title = "🔴 Today is Sankashti Chaturthi!";
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
 * Initializes the background timer that checks every 60 seconds if it is time to trigger the daily morning alert.
 * 100% Free of Cost - runs purely inside the client device!
 */
export function initDailyNotificationScheduler(lang: 'mr' | 'en' = 'mr'): () => void {
  if (typeof window === 'undefined') return () => {};

  const checkAndTrigger = () => {
    const settings = getNotificationSettings();
    if (!settings.enabled) return;
    if (Notification.permission !== 'granted') return;

    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    // Target time comparison (e.g. '06:00')
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

  // Check every 60 seconds
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

