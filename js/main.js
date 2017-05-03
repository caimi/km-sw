var module = angular.module('app', ['indexedDB']);

module.config(function ($indexedDBProvider) {
    $indexedDBProvider.connection('myIndexedDB')
      .upgradeDatabase(1, function(event, db, tx){
        var objStore = db.createObjectStore('pessoa', {keyPath: 'id'});
        objStore.createIndex('name_idx', 'nome', {unique: false});
      });
});


module.service('PessoaService', function ($indexedDB) {

    var uid = 1;
    
    this.listFromIndexDB = function() {
      $indexedDB.openStore('pessoa', function(store){
         store.getAll().then(function(pessoas) {    
           contacts = pessoas;
         });
      });
    }

    this.salvarIndexDB = function(pessoa) {
      $indexedDB.openStore('pessoa', function(store){
        store.insert(pessoa).then(function(e){
           console.log('salvo com sucesso!');
        });
      });
    }

    
    this.save = function (pessoa) {
      if (pessoa.id == null) {
        pessoa.id = uid++;
        this.salvarIndexDB(pessoa);
      }
    }
});

module.controller('PessoaController', function ($scope, PessoaService) {

    $scope.savePessoa = function () {
      PessoaService.save($scope.pessoa); 
    }

});