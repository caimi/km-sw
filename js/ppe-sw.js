var CACHE_NAME = 'ppe-sw-app';
var urlsToCache = [
  'km-sw/index.html',
  'km-sw/css/ftsl.css',
  'km-sw/css/materialize.css',
  'km-sw/js/init.js',
  'km-sw/js/materialize.js',
  'km-sw/registros/profissao.js',
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