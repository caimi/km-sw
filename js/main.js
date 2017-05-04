var module = angular.module('app', ['indexedDB']);

module.service('PessoaService', function (PessoaDAO, NuvemService, $q) {
    
    this.generateID = function() {
      var dt = new Date();
      return dt.getDay() + '' + dt.getMonth() + '' + dt.getYear() + 
        dt.getHours() + '' + dt.getMinutes() + '' + dt.getSeconds(); 
    };

    this.list = function() {
      var deferred = $q.defer();
      PessoaDAO.listFromIndexDB().then(function(results){
        deferred.resolve(results);
      });
      return deferred.promise;
    }
    
    this.save = function (pessoa) {
      var deferred = $q.defer();
      if (!pessoa.id) {
        pessoa.id = this.generateID();
        PessoaDAO.salvarIndexDB(pessoa).then(function(e){
          NuvemService.salvar(pessoa).then(function(resNuvem){
            pessoa.sincronizado = true;
            PessoaDAO.upsertIndexDB(pessoa).then(function(e2){
              deferred.resolve(e);
            });
          },function(resNuvem) {
              deferred.resolve(resNuvem);
          })
        });
      }
      else {
        PessoaDAO.upsertIndexDB(pessoa).then(function(res){
          deferred.resolve(res);
        });
      }
      return deferred.promise;
    }

    this.remove = function(id) {
      var deferred = $q.defer();
      PessoaDAO.removeIndexDB(id).then(function(e){
        deferred.resolve(e);
      });
      return deferred.promise;
    }

    this.load = function(id) {
      var deferred = $q.defer();
      PessoaDAO.loadFromIndexDB(id).then(function(e){
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

    $scope.online = true;
});