var module = angular.module('app');

module.config(function ($indexedDBProvider) {
    $indexedDBProvider.connection('myIndexedDB')
      .upgradeDatabase(1, function(event, db, tx){
        var objStore = db.createObjectStore('pessoa', {keyPath: 'id'});
        objStore.createIndex('name_idx', 'nome', {unique: false});
        objStore.createIndex('id_idx', 'id', {unique: true});
      });
});

module.service('PessoaDAO', function ($indexedDB, $q) {
    
    this.listFromIndexDB = function() {
      var deferred = $q.defer();
      $indexedDB.openStore('pessoa', function(store){
         store.getAll().then(function(pessoas) {    
           deferred.resolve(pessoas);
         });
      });
      return deferred.promise;
    }

    this.salvarIndexDB = function(pessoa) {
      var deferred = $q.defer();
      $indexedDB.openStore('pessoa', function(store){
        store.insert(pessoa).then(function(e){
          deferred.resolve(e);
        });
      });
      return deferred.promise;
    }

    this.removeIndexDB = function(id) {
      var deferred = $q.defer();
      $indexedDB.openStore('pessoa', function(store){
        store.delete(id).then(function (e) {
          deferred.resolve(e);
        });        
      });
      return deferred.promise;
    }

    this.loadFromIndexDB = function(id) {
      var deferred = $q.defer();
      $indexedDB.openStore('pessoa', function(store){
        store.find(id).then(function(e){
          deferred.resolve(e);
        });
      });
      return deferred.promise;
    };
    
    this.upsertIndexDB = function(pessoa) {
      var deferred = $q.defer();
      $indexedDB.openStore('pessoa', function(store){
        store.upsert(pessoa).then(function (e) {
          deferred.resolve(e);
        });
      });
      return deferred.promise;  
    }
});
