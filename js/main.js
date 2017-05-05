var module = angular.module('app', ['indexedDB','angular.ping']);

module.service('PessoaService', function (PessoaDAO, NuvemService, netTesting, $q) {
    
    this.generateID = function() {
      var dt = new Date();
      return dt.getDay() + '' + dt.getMonth() + '' + dt.getYear() + 
        dt.getHours() + '' + dt.getMinutes() + '' + dt.getSeconds(); 
    };

    this.list = function() {
      var deferred = $q.defer();
      NuvemService.listar().then(function(listServer){
        var lista = [];
        PessoaDAO.listFromIndexDB().then(function(results){
          var listToReturn = [];
          lista = lista.concat(results.filter(function(item){return !item.sincronizado}));
          listToReturn = listToReturn.concat(lista);

          for(var i=0;i<listServer.length;i++) {
            var hasValue = false;
            for(var j=0;i<lista.length;j++) {
              if(lista[j].id == listServer[i].id) {
                hasValue = true;
                break;
              }
            }
            
            if (!hasValue) {
              listToReturn.push(listServer[i]);
            }
          }
         
          deferred.resolve(listToReturn);
        });
      },function(err){
        PessoaDAO.listFromIndexDB().then(function(results){
          deferred.resolve(results);
        });
      });
      return deferred.promise;
    }
    
    this.save = function (pessoa) {
      var deferred = $q.defer();
      if (!pessoa.id) {
        pessoa.id = this.generateID();
        pessoa.ativo = true;
        PessoaDAO.salvarIndexDB(pessoa).then(function(e){
          NuvemService.salvar(pessoa).then(function(resNuvem){
            pessoa.sincronizado = true;
            PessoaDAO.upsertIndexDB(pessoa).then(function(e2){
              deferred.resolve(e2);
            });
          },function(resNuvem) {
              deferred.resolve(resNuvem);
          })
        });
      }
      else {
        PessoaDAO.upsertIndexDB(pessoa).then(function(res){
          NuvemService.atualizar(pessoa).then(function(resNuvem){
            pessoa.sincronizado = true;
            PessoaDAO.upsertIndexDB(pessoa).then(function(e2){
              deferred.resolve(e2);
            });
          },function(resNuvem) {
              deferred.resolve(resNuvem);
          })
        });
      }
      return deferred.promise;
    }

    this.remove = function(pessoa) {
      var deferred = $q.defer();
      NuvemService.remover(pessoa).then(function(resNuvem){
        PessoaDAO.removeIndexDB(pessoa.id).then(function(e){
          deferred.resolve(e);
        });
      },function(resNuvem) {
        pessoa.ativo = false;
        pessoa.sincronizado = false;
        PessoaDAO.upsertIndexDB(pessoa).then(function(e){
          deferred.resolve(e);
        });
      })
      return deferred.promise;
    }

    this.load = function(id) {
      var deferred = $q.defer();
      PessoaDAO.loadFromIndexDB(id).then(function(pessoa){
        if (!pessoa.sincronizado) {
          deferred.resolve(pessoa);   
        }
        else {
          NuvemService.obter(id).then(function(pessoaNuvem){
            deferred.resolve(pessoaNuvem); 
          },
          function(err){
            deferred.resolve(pessoa);
          });
        }
      },
      function(err){
        NuvemService.obter(id).then(function(pessoaNuvem){
          deferred.resolve(pessoaNuvem); 
        },
        function(err){
          deferred.reject(err);
        });
      });

      return deferred.promise;
    }

    this.sincronizar = function(pessoa) {
      var deferred = $q.defer();
      if (!pessoa.sincronizado) {
        if(!pessoa.ativo) {
          NuvemService.obter(pessoa.id).then(function(pessoaNuvem){
            NuvemService.remover(pessoa).then(function(resNuvem){
              PessoaDAO.removeIndexDB(pessoa.id).then(function(e){
                deferred.resolve(e);
              });
           }).then(function(err){deferred.reject(resNuvem)});
          },function(res){
              PessoaDAO.removeIndexDB(pessoa.id).then(function(e){
                deferred.resolve(e);
            });
          });
        }
        else {
          NuvemService.obter(pessoa.id).then(function(pessoaNuvem){
            NuvemService.atualizar(pessoa).then(function(resNuvem){
            pessoa.sincronizado = true;
            PessoaDAO.upsertIndexDB(pessoa).then(function(e2){
              deferred.resolve(e2);
            });
            },function(resNuvem) {
               deferred.reject(resNuvem);
            })
          },
          function(resp){
            NuvemService.salvar(pessoa).then(function(resNuvem){
              pessoa.sincronizado = true;
              PessoaDAO.upsertIndexDB(pessoa).then(function(e2){
                deferred.resolve(e2);
              });
          },function(err) {
              deferred.reject(err);
          })
          });
        }
      }

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

    $scope.edit = function (pessoa) {
      PessoaService.load(pessoa.id).then(function(result){
        $scope.pessoa = result;
        $scope.pessoa.sincronizado = false;
      }); 
    }

    $scope.sincronizar = function(pessoa) {
      PessoaService.sincronizar(pessoa).then(function(res){
        $scope.list();
      },function(err){
        pessoa.sincronizado = false;
        alert("Não foi possivel sincronizar.");
      });
    };

    $scope.online = true;
});