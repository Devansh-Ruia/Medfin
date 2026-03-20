// Manual service worker -- exists because every next-pwa package eventually breaks on a new Next.js version
const CACHE_NAME = 'medfin-v1'
const STATIC_ASSETS = ['/dashboard', '/offline', '/manifest.json']

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/offline'))
    )
    return
  }
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  )
})
