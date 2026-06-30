// PoolGuyPro Service Worker — Push Notifications + Offline Cache

const APP_ICON  = '/icone.png';
const CACHE_VER = 'pgp-v7';

// Static assets to pre-cache on install (only files that actually exist in dist/)
// HTML is intentionally excluded so it's always fetched fresh (network-first)
const PRECACHE = [
  '/tokens.css',
  '/icone.png',
  '/icone_orig_rgba.png',
  '/manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_VER).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VER).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

// Fetch strategy: cache-first for static, network-first for API
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Never intercept Supabase API/realtime or external CDN calls
  if (url.hostname.includes('supabase.co') ||
      url.hostname.includes('unpkg.com') ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('gstatic.com') ||
      url.hostname.includes('fonts.') ||
      e.request.method !== 'GET') return;

  // Static app assets → cache-first, fallback to network
  const isStatic = PRECACHE.some(p => url.pathname === p || url.pathname.startsWith(p.split('?')[0]));
  if (isStatic) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_VER).then(c => c.put(e.request, clone));
          }
          return res;
        }).catch(() => caches.match('/PoolGuyPro.html'));
      })
    );
    return;
  }

  // Everything else (images, etc.) → network-first, cache fallback
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE_VER).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});

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
