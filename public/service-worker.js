const STATIC_CACHE = 'news-media-cache-v1';
const API_CACHE = 'api-cache-v1';
const RUNTIME_CACHE = 'runtime-cache-v1';

const supportsIndexedDB = () => {
  try {
    return typeof self !== 'undefined' && 'indexedDB' in self && self.indexedDB;
  } catch (err) {
    return false;
  }
};

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async cache => {
      const baseAssets = ['/', '/offline.html', '/manifest.webmanifest'];
      let generatedAssets = [];
      try {
        const response = await fetch('/cache.json');
        if (response.ok) {
          generatedAssets = await response.json();
        }
      } catch (err) {
        // Fallback: cache minimal assets if file missing
      }
      const filesToCache = Array.from(
        new Set([...baseAssets, ...generatedAssets]),
      );
      return cache.addAll(filesToCache);
    })
  );
});

// Runtime caching for API and other requests
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.ok) {
            const runtimeCache = await caches.open(RUNTIME_CACHE);
            runtimeCache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          const matchOptions = { ignoreSearch: true };
          const cachedHome = await caches.match(event.request, matchOptions);
          if (cachedHome) return cachedHome;
          const fallbackCandidates = ['/', '/index.html'];
          const { pathname } = new URL(event.request.url);
          if (pathname === '/.' || pathname === '') {
            fallbackCandidates.unshift('/');
          }
          for (const candidate of fallbackCandidates) {
            const cachedCandidate = await caches.match(candidate, matchOptions);
            if (cachedCandidate) return cachedCandidate;
          }
          const offline = await caches.match('/offline.html');
          if (offline) return offline;
          return new Response('Offline', {
            status: 504,
            statusText: 'Gateway Timeout',
          });
        }
      })(),
    );
    return;
  }
  // Intercept all API POST requests
  if (event.request.method === 'POST' && url.pathname.startsWith('/api/')) {
    event.respondWith((async () => {
      try {
        // Try to send request online
        const response = await fetch(event.request.clone());
        return response;
      } catch (err) {
        // Offline: store request in IndexedDB for later sync
        await storePostRequest(event.request);
        // Return a generic offline response
        return new Response(JSON.stringify({
          success: false,
          offline: true,
          message: 'Request queued for sync when online.'
        }), {
          status: 202,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    })());
    return;
  }
  // GET API requests: cache as before
  if (event.request.method === 'GET' && url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(API_CACHE).then(async cache => {
        try {
          const response = await fetch(event.request);
          cache.put(event.request, response.clone());
          return response;
        } catch (err) {
          const cached = await cache.match(event.request);
          if (cached) return cached;
          // Always return a valid Response
          return new Response(JSON.stringify({ success: false, offline: true, message: 'No cached API response available.' }), {
            status: 504,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })
    );
    return;
  }
  // Serve schema files from cache when offline
  if (event.request.method === 'GET' && event.request.url.includes('/schemas/')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).catch(() => new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }));
      })
    );
    return;
  }
  // Cache static assets and offline fallback
  event.respondWith(
    caches.match(event.request).then(async response => {
      if (response) return response;
      if (event.request.method !== 'GET') {
        return fetch(event.request);
      }
      try {
        const networkResponse = await fetch(event.request);
        const sameOrigin = event.request.url.startsWith(self.location.origin);
        if (sameOrigin && networkResponse && networkResponse.ok) {
          const runtimeCache = await caches.open(RUNTIME_CACHE);
          runtimeCache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        const offline = await caches.match('/offline.html');
        if (offline) return offline;
        // Always return a valid Response
        return new Response('Offline', { status: 504, statusText: 'Gateway Timeout' });
      }
    })
  );
});

// IndexedDB helper for storing POST requests
function storePostRequest(request) {
  if (!supportsIndexedDB()) {
    return Promise.resolve();
  }
  return request.clone().json().then(body => {
    return new Promise((resolve, reject) => {
      const open = indexedDB.open('offline-post-queue', 1);
      open.onupgradeneeded = () => {
        open.result.createObjectStore('queue', { keyPath: 'id', autoIncrement: true });
      };
      open.onsuccess = () => {
        const db = open.result;
        const tx = db.transaction('queue', 'readwrite');
        tx.objectStore('queue').add({ url: request.url, method: request.method, body });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
      open.onerror = () => reject(open.error);
    });
  });
}

self.addEventListener('sync', event => {
  if (event.tag === 'sync-api-posts') {
    if (supportsIndexedDB()) {
      event.waitUntil(syncQueuedPosts());
    }
  }
});

function syncQueuedPosts() {
  if (!supportsIndexedDB()) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('offline-post-queue', 1);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction('queue', 'readwrite');
      const store = tx.objectStore('queue');
      const getAll = store.getAll();
      getAll.onsuccess = async () => {
        const posts = getAll.result;
        for (const post of posts) {
          try {
            await fetch(post.url, {
              method: post.method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(post.body)
            });
            store.delete(post.id);
          } catch (err) {
            // If still offline, keep in queue
          }
        }
        resolve();
      };
      getAll.onerror = () => reject(getAll.error);
    };
    open.onerror = () => reject(open.error);
  });
}

self.addEventListener('online', () => {
  if (supportsIndexedDB()) {
    self.registration.sync.register('sync-api-posts');
  }
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => ![STATIC_CACHE, API_CACHE, RUNTIME_CACHE].includes(key))
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});
