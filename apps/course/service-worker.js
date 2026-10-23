// Copyright © 2026 Christopher Snow

// The build replaces these two values. Each release gets its own complete, immutable cache.
const VERSION = "__COURSE_VERSION__";
const FILES = /* __COURSE_FILES__ */ [];
const SCOPE = self.registration.scope;
const PREFIX = `dd-course:${new URL(SCOPE).pathname}:`;
const CACHE = PREFIX + VERSION;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll(FILES.map((file) => new Request(new URL(file, SCOPE), { cache: "reload" }))),
      ),
  );
  // Leave an installed update waiting until the reader chooses it or every old tab closes.
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING" && event.source?.url?.startsWith(SCOPE)) {
    event.waitUntil(self.skipWaiting());
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      // Other open tabs may still need an older release's fonts or assets. Keep their caches.
      // When activation happens without any course windows, obsolete course caches can go.
      if (!windows.some((client) => client.url.startsWith(SCOPE))) {
        for (const name of await caches.keys()) {
          if (name.startsWith(PREFIX) && name !== CACHE) await caches.delete(name);
        }
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || !url.href.startsWith(SCOPE)) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const key = request.mode === "navigate" ? new URL("index.html", SCOPE).href : request;
      const current = await cache.match(key);
      if (current) return current;
      // A tab that has not reloaded can still request assets from its own older release.
      if (request.mode !== "navigate") {
        for (const name of await caches.keys()) {
          if (name.startsWith(PREFIX) && name !== CACHE) {
            const older = await (await caches.open(name)).match(request);
            if (older) return older;
          }
        }
      }
      return fetch(request);
    })(),
  );
});
