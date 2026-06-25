// PoolGuyPro Service Worker — Push Notifications

const APP_ICON = '/icone.png';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

// ── Receive push and show notification ─────────────────────────
self.addEventListener('push', e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'PoolGuyPro', {
      body:    data.body  || '',
      icon:    APP_ICON,
      badge:   APP_ICON,
      vibrate: [150, 80, 150],
      data:    { url: data.url || '/' },
    })
  );
});

// ── Tap notification → open/focus the app and deep-link ───────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.startsWith(self.location.origin));
      if (existing) {
        // App is open: send message so it handles the deep link in-place
        existing.postMessage({ type: 'OPEN_JOB', url });
        return existing.focus();
      }
      // App is closed: open it with the full URL so hash is read on boot
      return clients.openWindow(url);
    })
  );
});
