// Service worker Gextimo (P186) — volontairement CONSERVATEUR pour ne jamais servir
// un site périmé après un déploiement :
//   - navigations (HTML)  : réseau d'abord, cache en secours (offline)
//   - assets hashés /assets/ : cache d'abord (immuables par construction Vite)
//   - API : jamais interceptée
const VERSION = 'gextimo-sw-v1'
const OFFLINE_CACHE = `${VERSION}-pages`
const ASSET_CACHE = `${VERSION}-assets`

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)

  if (req.method !== 'GET' || url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api')) return   // l'API n'est jamais mise en cache

  // Assets Vite hashés : cache-first (immuables)
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith((async () => {
      const cached = await caches.match(req)
      if (cached) return cached
      const resp = await fetch(req)
      if (resp.ok) {
        const cache = await caches.open(ASSET_CACHE)
        cache.put(req, resp.clone())
      }
      return resp
    })())
    return
  }

  // Navigations : réseau d'abord (toujours frais), cache en secours (offline)
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const resp = await fetch(req)
        const cache = await caches.open(OFFLINE_CACHE)
        cache.put('/', resp.clone())
        return resp
      } catch {
        return (await caches.match('/')) || Response.error()
      }
    })())
  }
})
