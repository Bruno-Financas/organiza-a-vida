const CACHE_NAME = "financas-v2";
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./chart.min.js",
  "./icon-192.png",
  "./icon-512.png",
  "./icon.svg"
];

// ============ INSTALL EVENT ============
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Cache aberto:", CACHE_NAME);
      return cache.addAll(urlsToCache).catch(err => {
        console.warn("Erro ao cachear alguns arquivos:", err);
        // Continuar mesmo se alguns arquivos não forem encontrados
        return cache.addAll([
          "./",
          "./index.html",
          "./style.css",
          "./app.js",
          "./manifest.json"
        ]);
      });
    })
  );
  self.skipWaiting();
});

// ============ FETCH EVENT ============
self.addEventListener("fetch", event => {
  // Estratégia: Cache first, then network
  event.respondWith(
    caches.match(event.request).then(response => {
      // Retorna do cache se existir
      if (response) {
        return response;
      }

      // Caso contrário, faz requisição de rede
      return fetch(event.request)
        .then(response => {
          // Valida resposta
          if (!response || response.status !== 200 || response.type === "error") {
            return response;
          }

          // Clona resposta para cacher
          const responseToCache = response.clone();

          // Cacheia requisições GET bem-sucedidas
          if (event.request.method === "GET") {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
        })
        .catch(() => {
          // Se offline e não está em cache, tenta página offline
          if (event.request.destination === "document") {
            return caches.match("./index.html");
          }
        });
    })
  );
});

// ============ ACTIVATE EVENT ============
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => {
            console.log("Limpando cache antigo:", cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim();
});
