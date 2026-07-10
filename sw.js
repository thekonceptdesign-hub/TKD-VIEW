/* TKD VIEW — service worker
   Blueprint TKD HUB: o "app shell" fica em cache e a app abre offline
   depois da primeira visita. A cada publicação, suba o número em
   CACHE_VERSION abaixo, em sequência, igual ao APP_VERSION do
   index.html (ex.: v1.0.0 → v1.0.1). Isso garante que a cache antiga
   é substituída e que o aviso "nova versão disponível" aparece. */

const CACHE_VERSION = "tkd-view-v1.0.11"; /* ↔ APP_VERSION "1.0.11" no index.html */
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png",
  "https://cdnjs.cloudflare.com/ajax/libs/pannellum/2.5.6/pannellum.css",
  "https://cdnjs.cloudflare.com/ajax/libs/pannellum/2.5.6/pannellum.js"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(function (c) {
      /* addAll falha tudo se um item falhar; aqui toleramos ausências. */
      return Promise.all(APP_SHELL.map(function (url) {
        return c.add(url).catch(function () {});
      }));
    })
    /* Sem skipWaiting automático: a nova versão só assume quando o
       utilizador toca no aviso (mensagem SKIP_WAITING abaixo). */
  );
});

self.addEventListener("message", function (e) {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (nomes) {
      return Promise.all(nomes.map(function (n) {
        if (n !== CACHE_VERSION) return caches.delete(n);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;

  var url = new URL(req.url);

  /* Nunca interferir com o Firebase nem com as fontes em tempo real. */
  if (/firebaseio\.com|firebasedatabase\.app|googleapis\.com|gstatic\.com\/firebasejs/.test(url.host + url.pathname)) {
    return; /* deixa passar para a rede normalmente */
  }

  /* Navegações (abrir a app): rede primeiro, cache como recurso offline. */
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(function (r) {
        var copia = r.clone();
        caches.open(CACHE_VERSION).then(function (c) { c.put("./index.html", copia); });
        return r;
      }).catch(function () {
        return caches.match("./index.html");
      })
    );
    return;
  }

  /* Restantes GET (ícones, pannellum, imagens): cache primeiro,
     rede como reserva — as imagens 360 visitadas ficam disponíveis offline. */
  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (r) {
        if (r && r.status === 200 && (r.type === "basic" || r.type === "cors")) {
          var copia = r.clone();
          caches.open(CACHE_VERSION).then(function (c) { c.put(req, copia); });
        }
        return r;
      });
    })
  );
});
