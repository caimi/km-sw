var CACHE_NAME = 'ppe-sw-app';
var version = "10";
var urlsToCache = [
  './',
  './index.html',
  './css/ftsl.css',
  './css/materialize.css',
  './js/init.js',
  './js/materialize.js',
  './js/angular-indexed-db.min.js',
  './js/indexdb-service.js',
  './js/main.js',
  './registros/profissao.js',
  'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.1/angular.min.js'
];

self.addEventListener('install', function(event) {
  event.waitUntil( /* Este método estende o evento ONINSTALL e aplica um estado ao evento chamado ONINSTALLING */
    caches.open(CACHE_NAME) /* O objeto caches é criado com um namespace e retorna uma Promise */
      .then(function(cache) {
        console.log('Cache aberto:', CACHE_NAME );
        return cache.addAll(urlsToCache); /* E por fim, conseguimos manipular o objeto de cache corrente */
      })
  );
});

self.addEventListener('fetch', function(evt) {
  console.log('The service worker is serving the asset.');
  evt.respondWith(fromNetwork(evt.request, 400).catch(function () {
    return fromCache(evt.request);
  }));
});

function fromNetwork(request, timeout) {
  return new Promise(function (fulfill, reject) {
    var timeoutId = setTimeout(reject, timeout);
     fetch(request).then(function (response) {
      clearTimeout(timeoutId);
      fulfill(response);

    }, reject);
  });
}

function fromCache(request) {
  return caches.open(CACHE_NAME).then(function (cache) {
    return cache.match(request).then(function (matching) {
      return matching || Promise.reject('no-match');
    });
  });
}