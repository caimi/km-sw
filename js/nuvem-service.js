var module = angular.module('app');


module.service('NuvemService', function ($q,$http) {
    
    var baseURL = 'https://api.mlab.com/api/1/databases/pessoa/collections/pessoa?apiKey=h5HXau-eQBL5VoAn_xk5puC-FRBF4RH1';

    this.salvar = function(pessoa) {
      var deferred = $q.defer();
      $http.post(baseURL, JSON.stringify(pessoa)).success(function(resp) {
         deferred.resolve(resp);
      }).error(function(err){
         deferred.reject(err);
      });
      return deferred.promise;
    }

    this.atualizar = function(pessoa) {
      var deferred = $q.defer();
      var command = '{ "$set" : ' + JSON.stringify(pessoa) + ' }' ;
      $http.put(baseURL, command).success(function(resp) {
        deferred.resolve(resp);
      });
      return deferred.promise;
    }

    this.remover = function(pessoa) {
      var deferred = $q.defer();
      var command = '{ "$set" : ' + JSON.stringify(pessoa) + ' }' ;
      $http.put(baseURL, command).success(function(resp) {
        deferred.resolve(resp);
      });
      return deferred.promise;
    }
   
});
