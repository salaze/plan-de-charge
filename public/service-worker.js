
/* eslint-disable no-restricted-globals */

// Service worker modifié pour privilégier la connexion temps réel

self.addEventListener('install', (event) => {
  console.log('Service Worker: No caching enabled, real-time sync preferred');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clear any existing caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Événement fetch - Redirect toutes les requêtes au réseau sans mise en cache
self.addEventListener('fetch', (event) => {
  // Bypass service worker and go straight to network
  return;
});

// Événement pour gérer les demandes de mise à jour
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
