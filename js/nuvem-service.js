var module = angular.module('app');


module.service('NuvemService', function ($q,$http) {
    
    var baseURL = 'https://api.mlab.com/api/1/databases/pessoa/collections/pessoa?apiKey=h5HXau-eQBL5VoAn_xk5puC-FRBF4RH1';
   
    this.salvar = function(pessoa) {
      var deferred = $q.defer();
      pessoa.sincronizado = true;
      $http.post(baseURL, JSON.stringify(pessoa),{headers :{'Content-Type': 'application/json'}}).success(function(resp) {
         deferred.resolve(resp);
      }).error(function(err,status){
         deferred.reject(err);
      });
      return deferred.promise;
    }

    this.atualizar = function(pessoa) {
      var deferred = $q.defer();
      pessoa.sincronizado = true;
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

    this.listar = function(pessoa) {
      var deferred = $q.defer();
      $http.get(baseURL).success(function(resp) {
         if (resp && resp.length > 0) {
           deferred.resolve(resp);   
         }
         else {
           deferred.reject(resp); 
         }
      }).error(function(err, status){
         deferred.reject(err);
      });
      return deferred.promise;
    }

    this.obter = function(id) {
      var deferred = $q.defer();
      var url = 'https://api.mlab.com/api/1/databases/pessoa/collections/pessoa?q={"id":"'+id+'"}&apiKey=h5HXau-eQBL5VoAn_xk5puC-FRBF4RH1';
      $http.get(url).success(function(resp) {
        if (resp && resp.length > 0) {
          deferred.resolve(resp[0]);
        }
        else {
          deferred.reject(err);  
        } 
      }).error(function(err){
         deferred.reject(err);
      });
      return deferred.promise;
    }
   
});
