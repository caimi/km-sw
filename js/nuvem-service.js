var module = angular.module('app');


module.service('NuvemService', function ($q,$http) {
    
    var db = "pessoa";
    var collection = "pessoa";
    var baseURL = 'https://api.mlab.com/api/1/databases/'+db+'/collections/'+collection+'?apiKey=h5HXau-eQBL5VoAn_xk5puC-FRBF4RH1';
   
    this.salvar = function(pessoa) {
      var deferred = $q.defer();
      var pessoaPersist = {
        id:pessoa.id,
        nome:pessoa.nome,
        sobrenome:pessoa.sobrenome,
        email:pessoa.email,
        ativo:true,
        sincronizado:true
      };
      $http.post(baseURL, JSON.stringify(pessoaPersist),{headers :{'Content-Type': 'application/json'}}).success(function(resp) {
         deferred.resolve(resp);
      }).error(function(err,status){
         deferred.reject(err);
      });
      return deferred.promise;
    }

    this.atualizar = function(pessoa) {
      var deferred = $q.defer();
       var pessoaPersist = {
        id:pessoa.id, 
        nome:pessoa.nome,
        sobrenome:pessoa.sobrenome,
        email:pessoa.email,
        ativo:pessoa.ativo,
        sincronizado:true
      };
      var command = '{ "$set" : ' + JSON.stringify(pessoaPersist) + ' }' ;
      $http.put(baseURL, command).success(function(resp) {
        deferred.resolve(resp);
      }).error(function(err,status){
         deferred.reject(err);
      });
      return deferred.promise;
    }

    this.remover = function(pessoa) {
      var deferred = $q.defer();
      this.obter(pessoa.id).then(function(pess){
        var url = 'https://api.mlab.com/api/1/databases/'+db+'/collections/'+collection+'/' + pess._id.$oid + '?apiKey=h5HXau-eQBL5VoAn_xk5puC-FRBF4RH1';
        $http.delete(url).success(function(resp) {
          deferred.resolve(resp);
        }).error(function(err,status){
          deferred.reject(err);
        });
      }, function(err){
          deferred.reject(err);
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
      var url = 'https://api.mlab.com/api/1/databases/'+db+'/collections/'+collection+'?q={"id":"'+id+'"}&apiKey=h5HXau-eQBL5VoAn_xk5puC-FRBF4RH1';
      $http.get(url).success(function(resp) {
        if (resp && resp.length > 0) {
          deferred.resolve(resp[0]);
        }
        else {
          deferred.reject(resp);  
        } 
      }).error(function(err){
         deferred.reject(err);
      });
      return deferred.promise;
    }
   
});
