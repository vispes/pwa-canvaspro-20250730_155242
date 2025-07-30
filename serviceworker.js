const CACHE_VERSION = 'v3';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/pwamanifest.json',
  '/bundle.js',
  '/theme-engine.css',
  '/device-preview-component.js',
  '/editor-state-manager.js'
];

self.addEventListener('install', handleInstall);
self.addEventListener('activate', handleActivate);
self.addEventListener('fetch', handleFetch);

function handleInstall(event) {
  event.waitUntil(cacheAssets(CORE_ASSETS));
}

async function cacheAssets(assets) {
  try {
    const cache = await caches.open(CACHE_VERSION);
    await cache.addAll(assets);
  } catch (err) {
    console.error('Failed to cache core assets:', err);
  }
}

async function handleActivate(event) {
  const cachesToKeep = new Set([CACHE_VERSION]);
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(key => 
        cachesToKeep.has(key) ? null : caches.delete(key)
      ).filter(p => p))
    )
  );
}

async function handleFetch(event) {
  if (event.request.method !== 'GET') return;

  const networkFetch = async () => {
    const response = await fetch(event.request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(event.request, response.clone());
    }
    return response;
  };

  try {
    if (event.request.mode === 'navigate') {
      return await networkFetch().catch(() => caches.match('/index.html'));
    }
    
    const cachedResponse = await caches.match(event.request);
    return cachedResponse || networkFetch();
  } catch (err) {
    return caches.match('/index.html');
  }
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/serviceworker.js')
        .then(reg => {
          reg.onupdatefound = () => {
            const worker = reg.installing;
            worker.onstatechange = () => {
              if (worker.state === 'activated' && !navigator.serviceWorker.controller) {
                window.location.reload();
              }
            };
          };
        })
        .catch(err => console.error('SW registration failed:', err));
    });
  }
}

registerServiceWorker();