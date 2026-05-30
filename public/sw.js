/*
  Service worker mínimo (PWA, criterios 35, 36). Estrategia:
  - Navegaciones (HTML): network-first; si falla (offline), sirve la última
    versión cacheada de la página para que `/` siga viéndose en read-only.
  - Estáticos del build (_next/static, íconos): stale-while-revalidate.
  No cachea respuestas de Supabase: los datos offline los rehidrata la app desde
  su propio cache (SWR/localStorage), y los toggles quedan deshabilitados offline.
*/
const CACHE = "habitos-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // No interceptar llamadas a APIs externas (Supabase) ni a nuestros route handlers.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/")),
        ),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static") || url.pathname.startsWith("/icon-")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return response;
        });
        return cached || network;
      }),
    );
  }
});
