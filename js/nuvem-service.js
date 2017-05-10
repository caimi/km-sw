var module = angular.module('app');


module.service('NuvemService', function ($q,$http, $rootScope) {
    
    var db = "pessoa";
    var collection = "pessoa";
    var baseURL = 'https://api.mlab.com/api/1/databases/'+db+'/collections/'+collection+'?apiKey=h5HXau-eQBL5VoAn_xk5puC-FRBF4RH1';
    var urlDadosGerais = 'http://10.31.0.72:8080/sinesp-rest/api/dadosgerais/';

    this.getPessoaCopy = function(pessoa) {
      return {
        id:pessoa.id,
        nome:pessoa.nome,
        sobrenome:pessoa.sobrenome,
        email:pessoa.email,
        uf:pessoa.uf,
        idBloqueio:pessoa.idBloqueio
      };
    }

    this.salvar = function(pessoa) {
      var deferred = $q.defer();
      
      if(!$rootScope.online) {
        deferred.reject();
        return deferred.promise;
      }

      var pessoaPersist = this.getPessoaCopy(pessoa);
      $http.post(baseURL, JSON.stringify(pessoaPersist),{headers :{'Content-Type': 'application/json'}}).success(function(resp) {
         deferred.resolve(resp);
      }).error(function(err,status){
         deferred.reject(err);
      });
      return deferred.promise;
    }

    this.atualizar = function(pessoa) {
      var deferred = $q.defer();

      if(!$rootScope.online) {
        deferred.reject();
        return deferred.promise;
      }

      var pessoaPersist = this.getPessoaCopy(pessoa);
      var url = 'https://api.mlab.com/api/1/databases/'+db+'/collections/'+collection+'?q={"id":"'+pessoaPersist.id+'"}&apiKey=h5HXau-eQBL5VoAn_xk5puC-FRBF4RH1';
      var command = '{ "$set" : ' + JSON.stringify(pessoaPersist) + ' }' ;
      $http.put(url, command).success(function(resp) {
        deferred.resolve(resp);
      }).error(function(err,status){
         deferred.reject(err);
      });
      return deferred.promise;
    }

    this.remover = function(pessoa) {
      var deferred = $q.defer();

      if(!$rootScope.online) {
        deferred.reject();
        return deferred.promise;
      }

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

      if(!$rootScope.online) {
        deferred.reject();
        return deferred.promise;
      }

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

      if(!$rootScope.online) {
        deferred.reject();
        return deferred.promise;
      }

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
    
    this.listarUfs = function(pessoa) {
      var deferred = $q.defer();

      if(!$rootScope.online) {
        deferred.reject();
        return deferred.promise;
      }

      $http.get(urlDadosGerais+'listaUf').success(function(resp) {
         if (resp && resp.length > 0) {
           localStorage.setItem('ufs',JSON.stringify(resp));
           deferred.resolve(resp);   
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
