// Static assets cached on install -- these never change between sessions
const STATIC_CACHE = 'medfin-static-v1'
const STATIC_ASSETS = ['/', '/dashboard', '/offline', '/manifest.json']

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  )
})

// Navigation requests fall back to offline page -- not a blank screen
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/offline'))
    )
  }
})
