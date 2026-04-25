// Minimal service worker for Sensory.
// Required for "Add to Home Screen" / install-as-app on iOS + Android.
// We intentionally skip offline caching for hackathon scope — the demo runs online.

const CACHE = "sensory-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith(
    fetch(req).catch(async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      return new Response("offline", { status: 503 });
    }),
  );
});
