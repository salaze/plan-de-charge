
/* eslint-disable no-restricted-globals */

// Ceci est le service worker utilisé par l'application 
// pour fonctionner en mode hors connexion et comme PWA

const CACHE_NAME = 'planning-manager-v1';

// Liste des ressources à mettre en cache lors de l'installation
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
];

// Événement d'installation - Met en cache les ressources initiales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

// Événement d'activation - Nettoie les anciens caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Supprime les anciens caches qui ne sont plus nécessaires
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
});

// Événement fetch - Intercepte les requêtes réseau
self.addEventListener('fetch', (event) => {
  // Pour les requêtes vers l'API Supabase, toujours aller au réseau
  if (event.request.url.includes('supabase')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Pour toutes les autres requêtes, essayer le cache d'abord, puis le réseau
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si la ressource est dans le cache, on la renvoie
        if (response) {
          return response;
        }

        // Sinon, on va la chercher sur le réseau
        return fetch(event.request)
          .then((response) => {
            // On ne met en cache que si c'est une réponse valide
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // On clone la réponse car elle est utilisée à plusieurs endroits
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // On met la ressource en cache pour une utilisation future
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // En cas d'erreur réseau, on peut renvoyer une page hors-ligne
            // si elle existe dans le cache
            return caches.match('/offline.html');
          });
      })
  );
});

// Événement pour gérer les données IndexedDB et autres stockages locaux
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
