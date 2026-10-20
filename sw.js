// AGORA YP kabuğu - yalnızca kendi dosyalarını önbelleğe alır.
// Panel verileri (Google) HİÇ önbelleğe alınmaz; her açılışta güncel gelir.
var SURUM = "agorayp-v2";
var DOSYALAR = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "favicon.png", "logo.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(SURUM).then(function (c) { return c.addAll(DOSYALAR); }));
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== SURUM; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

// Önce internetten dene (güncel kalsın), olmazsa önbellekten ver.
self.addEventListener("fetch", function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request).then(function (r) {
      var kopya = r.clone();
      caches.open(SURUM).then(function (c) { c.put(u.origin + u.pathname, kopya); });
      return r;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: true });
    })
  );
});
