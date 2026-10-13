// Cache para uso offline: guarda os arquivos do jogo na instalação e, depois,
// atende primeiro pela rede e, sem internet, pelo cache.
const CACHE = 'batalha-trig-v3'

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE)
        const res = await fetch('./index.html', { cache: 'reload' })
        const html = await res.clone().text()
        const assets = [...html.matchAll(/(?:src|href)="(\.\/[^"]+)"/g)].map((m) => m[1])
        await cache.put('./index.html', res)
        await cache.addAll(['./', ...assets])
      } catch {
        /* sem rede na instalação: o cache é preenchido ao navegar */
      }
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(req, copy))
        }
        return res
      })
      .catch(() =>
        caches.match(req, { ignoreVary: true }).then((hit) => hit || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error())),
      ),
  )
})
