const CACHE_NAME = "dice-roller-cache";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",

    "./icons/icon-192.png",
    "./icons/icon-512.png",

    "./icons/money.svg",
    "./icons/remnant.svg",
    "./icons/clue.svg",

    "./icons/lore.svg",
    "./icons/influence.svg",
    "./icons/observation.svg",
    "./icons/strength.svg",
    "./icons/will.svg",

    "./icons/health.svg",
    "./icons/sanity.svg",

    "./data/investigators.json"
];


/* -------------------------
   INSTALL
------------------------- */

self.addEventListener("install", event => {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(FILES_TO_CACHE);
            })
    );

    // Activate new service worker immediately
    self.skipWaiting();

});


/* -------------------------
   ACTIVATE
------------------------- */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(cacheNames => {

            return Promise.all(

                cacheNames
                    .filter(cacheName => {
                        return cacheName !== CACHE_NAME;
                    })
                    .map(cacheName => {
                        return caches.delete(cacheName);
                    })

            );

        })

    );

    // Take control of open pages immediately
    self.clients.claim();

});


/* -------------------------
   FETCH
------------------------- */

self.addEventListener("fetch", event => {

    // Only handle GET requests
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        fetch(event.request)
            .then(response => {

                // Save newest version in cache
                const responseClone =
                    response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(
                            event.request,
                            responseClone
                        );
                    });

                return response;

            })
            .catch(() => {

                // If offline, use cached version
                return caches.match(
                    event.request
                );

            })

    );

});