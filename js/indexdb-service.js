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
    
   var store = $indexedDB.objectStore('pessoa');

    this.getPessoaCopy = function(pessoa) {
      return {
        id:pessoa.id,
        nome:pessoa.nome,
        sobrenome:pessoa.sobrenome,
        email:pessoa.email,
        uf:pessoa.uf
      };
    }

    this.listFromIndexDB = function() {
      var deferred = $q.defer();
      store.getAll().then(function(pessoas) {
        console.log('IndexDB','Lista ok');    
        deferred.resolve(pessoas);
      },function(err){
        console.log('IndexDB','Erro ao listar');
        deferred.reject(err);
      });
      return deferred.promise;
    }

    this.salvarIndexDB = function(pessoa) {
      var deferred = $q.defer();
      var pessoaPersist = this.getPessoaCopy(pessoa);
      store.insert(pessoaPersist).then(function(e){
        console.log('IndexDB','Insert ok ' + e);
        deferred.resolve(e);
      },
      function(err){
        console.log('IndexDB','Erro ao incluir');
        deferred.reject(err);
      });
      return deferred.promise;
    }

    this.removeIndexDB = function(id) {
      var deferred = $q.defer();
      store.delete(id).then(function (e) {
        console.log('IndexDB','Delete ok');
        deferred.resolve(e);
      },function(err){
        console.log('IndexDB','Erro ao excluir');
        deferred.reject(err);
      });        
      return deferred.promise;
    }

    this.loadFromIndexDB = function(id) {
      var deferred = $q.defer();
      store.find(id).then(function(e){
          console.log('IndexDB','Load ok');
          if (e) {
            deferred.resolve(e);
          }
          else {
            deferred.reject();
          }
      },
      function(err){
        console.log('IndexDB','Erro ao carregar');
        deferred.reject(err);
      });
      return deferred.promise;
    };
    
    this.upsertIndexDB = function(pessoa) {
      var deferred = $q.defer();
      var pessoaPersist = this.getPessoaCopy(pessoa);
      store.upsert(pessoa).then(function (e) {
        console.log('IndexDB','upsert ok');
        deferred.resolve(e);
      },
      function(err){
        console.log('IndexDB','Erro ao upsert');
        deferred.reject(err);
      });
      return deferred.promise;  
    }
});
