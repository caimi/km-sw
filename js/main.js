var module = angular.module('app', ['indexedDB']);

module.config(function ($indexedDBProvider) {
    $indexedDBProvider.connection('myIndexedDB')
      .upgradeDatabase(1, function(event, db, tx){
        var objStore = db.createObjectStore('pessoa', {keyPath: 'id'});
        objStore.createIndex('name_idx', 'nome', {unique: false});
      });
});


module.service('PessoaService', function ($indexedDB, $q) {
    
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

    this.generateID = function() {
      var dt = new Date();
      return dt.getDay() + '' + dt.getMonth() + '' + dt.getYear() + 
        dt.getHours() + '' + dt.getMinutes() + '' + dt.getSeconds(); 
    };

    this.list = function() {
      var deferred = $q.defer();
      this.listFromIndexDB().then(function(results){
        deferred.resolve(results);
      });
      return deferred.promise;
    }
    
    this.save = function (pessoa) {
      var deferred = $q.defer();
      if (!pessoa.id) {
        pessoa.id = this.generateID();
        this.salvarIndexDB(pessoa).then(function(e){
          deferred.resolve(e);
        });
      }
      else {
        this.upsertIndexDB(pessoa).then(function(res){
          deferred.resolve(res);
        });
      }
      return deferred.promise;
    }

    this.remove = function(id) {
      var deferred = $q.defer();
      this.removeIndexDB(id).then(function(e){
        deferred.resolve(e);
      });
      return deferred.promise;
    }

    this.load = function(id) {
      var deferred = $q.defer();
      this.loadFromIndexDB(id).then(function(e){
        deferred.resolve(e);
      });
      return deferred.promise;
    }

});

module.controller('PessoaController', function ($scope, PessoaService) {

    $scope.list = function() {
      PessoaService.list().then(function(results){
        $scope.pessoas = results;
      });
    }

    $scope.savePessoa = function () {
      PessoaService.save($scope.pessoa).then(function(e){
        $scope.list();
        $scope.pessoa = {};
      }); 
    }

    $scope.delete = function (id) {
      PessoaService.remove(id).then(function(e){
        $scope.list();
        $scope.pessoa = {};
      }); 
    }

    $scope.edit = function (id) {
      PessoaService.load(id).then(function(result){
        $scope.pessoa = result;
      }); 
    }

});