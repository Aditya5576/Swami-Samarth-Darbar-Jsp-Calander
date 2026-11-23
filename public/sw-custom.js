/**
 * Service Worker Extension for Shree Swami Samarth Seva Kendra PWA
 * Handles Periodic Background Sync, Notification Triggers, and notification click navigation.
 * Reads user preferences from IndexedDB (swami_notif_prefs_v1) so background reminders
 * strictly respect opt-in status, preferred local time, preferred language, and daily deduplication.
 */

const NOTIF_PREFS_DB = 'swami_notif_prefs_v1';
const NOTIF_PREFS_STORE = 'prefs';
const NOTIF_PREFS_KEY = 'daily';

function getLocalDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function openNotifPrefsDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(NOTIF_PREFS_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(NOTIF_PREFS_STORE)) {
        db.createObjectStore(NOTIF_PREFS_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function readNotifPrefs() {
  try {
    const db = await openNotifPrefsDB();
    const prefs = await new Promise((resolve, reject) => {
      const tx = db.transaction(NOTIF_PREFS_STORE, 'readonly');
      const req = tx.objectStore(NOTIF_PREFS_STORE).get(NOTIF_PREFS_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return prefs;
  } catch {
    return null;
  }
}

async function writeNotifPrefs(prefs) {
  try {
    const db = await openNotifPrefsDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(NOTIF_PREFS_STORE, 'readwrite');
      tx.objectStore(NOTIF_PREFS_STORE).put(prefs, NOTIF_PREFS_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // ignore IDB write errors
  }
}

function isPastScheduledLocalTime(now, timeStr) {
  const parts = String(timeStr || '06:00').split(':');
  const targetH = Number(parts[0]);
  const targetM = Number(parts[1]);
  if (!Number.isFinite(targetH) || !Number.isFinite(targetM)) return true;
  return (
    now.getHours() > targetH ||
    (now.getHours() === targetH && now.getMinutes() >= targetM)
  );
}

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-darshan-sync' || event.tag === 'swami-daily-darshan') {
    event.waitUntil(showDailyMorningNotification());
  }
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'daily-check-sync' || event.tag === 'swami-sync') {
    event.waitUntil(showDailyMorningNotification());
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

async function showDailyMorningNotification() {
  try {
    const prefs = await readNotifPrefs();

    // Respect user opt-in: never notify if user has disabled reminders or never persisted opt-in
    if (!prefs || prefs.enabled !== true) {
      return;
    }

    const now = new Date();
    const localDateKey = getLocalDateKey(now);

    // Prevent duplicate daily notifications
    if (prefs.lastNotifiedDate === localDateKey) {
      return;
    }

    // Respect user's preferred local notification time
    if (!isPastScheduledLocalTime(now, prefs.time)) {
      return;
    }

    const lang = prefs.language === 'en' ? 'en' : 'mr';
    const title =
      lang === 'en'
        ? 'Shree Swami Samarth Seva Darbar, Jaysingpur'
        : '॥ श्री स्वामी समर्थ ॥ जयसिंगपूर सेवा दरबार';
    const body =
      lang === 'en'
        ? 'Good Morning! "Fear not, I am always with you." Tap to view today\'s Panchang and Nitya Seva.'
        : 'शुभ प्रभात! "भिऊ नकोस मी तुझ्या पाठीशी आहे." आजचे पंचांग व नित्यसेवा दर्शनासाठी येथे टॅप करा.';

    await self.registration.showNotification(title, {
      body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: `swami-daily-${localDateKey}`,
      renotify: false,
      data: {
        url: '/',
        date: localDateKey,
      },
    });

    await writeNotifPrefs({
      ...prefs,
      lastNotifiedDate: localDateKey,
    });
  } catch (err) {
    console.error('Failed to show background notification:', err);
  }
}

// Receive messages from main application window
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SYNC_NOTIF_PREFS' && event.data.prefs) {
    event.waitUntil(writeNotifPrefs(event.data.prefs));
    return;
  }

  if (event.data.type === 'TEST_BACKGROUND_NOTIFICATION') {
    const delayMs = Math.min(Math.max(Number(event.data.delayMs) || 3000, 1000), 15000);
    setTimeout(() => {
      self.registration.showNotification(event.data.title || '॥ श्री स्वामी समर्थ ॥', {
        body: event.data.body || 'चाचणी बॅकग्राउंड सूचना (बेस्ट-एफर्ट ब्राऊझर सूचना)',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'swami-test-bg-notif',
        data: { url: '/' },
      });
    }, delayMs);
  }

  if (event.data.type === 'SCHEDULE_DAY_ALARM') {
    const { title, body, timestamp, tag } = event.data;
    try {
      if (
        typeof self.Notification !== 'undefined' &&
        'showTrigger' in self.Notification.prototype &&
        typeof self.TimestampTrigger !== 'undefined'
      ) {
        self.registration.showNotification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: tag || `swami-alarm-${timestamp}`,
          showTrigger: new self.TimestampTrigger(timestamp),
          data: { url: '/' },
        });
      }
    } catch (e) {
      console.warn('TimestampTrigger not supported or failed:', e);
    }
  }
});
