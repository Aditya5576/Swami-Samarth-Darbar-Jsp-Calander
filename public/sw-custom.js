/**
 * Service Worker Extension for Shree Swami Samarth Seva Kendra PWA
 * Handles Periodic Background Sync, Notification Triggers (Alarms when app is closed),
 * and notification click navigation.
 */

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
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    const title = '॥ श्री स्वामी समर्थ ॥ जयसिंगपूर सेवा केंद्र';
    const body = 'शुभ प्रभात! "भिऊ नकोस मी तुझ्या पाठीशी आहे." आजचे पंचांग व नित्यसेवा दर्शनासाठी येथे टॅप करा.';

    await self.registration.showNotification(title, {
      body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: `swami-daily-${dateStr}`,
      renotify: true,
      data: {
        url: '/',
        date: dateStr,
      },
    });
  } catch (err) {
    console.error('Failed to show background notification:', err);
  }
}

// Receive messages from main application window
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'TEST_BACKGROUND_NOTIFICATION') {
    const delayMs = event.data.delayMs || 3000;
    setTimeout(() => {
      self.registration.showNotification(event.data.title || '॥ श्री स्वामी समर्थ ॥', {
        body: event.data.body || 'चाचणी बॅकग्राउंड सूचना (अॅप बंद असतानाही कार्य करते!)',
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
      // Check for Notification Triggers API
      if ('showTrigger' in self.Notification.prototype && typeof self.TimestampTrigger !== 'undefined') {
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
