var module = angular.module('app', ['indexedDB','angular.ping']);

module.service('PessoaService', function (PessoaDAO, NuvemService, netTesting, $q, $rootScope) {
    
    this.generateID = function() {
      var dt = new Date();
      return dt.getDay() + '' + dt.getMonth() + '' + dt.getYear() + 
        dt.getHours() + '' + dt.getMinutes() + '' + dt.getSeconds(); 
    };

     this.listOnline = function() {
      var deferred = $q.defer();
      NuvemService.listar().then(function(list){  
          deferred.resolve(list);
        },function(err){
         deferred.reject(err); 
      });
      return deferred.promise;
    }

    this.listOffline = function() {
      var deferred = $q.defer();
      PessoaDAO.listFromIndexDB().then(function(list){  
         deferred.resolve(list);
      },function(err){
         deferred.reject(err); 
      });
      return deferred.promise;
    }
    
    this.save = function (pessoa) {
      var deferred = $q.defer();
      if (!pessoa.id) {
        pessoa.id = this.generateID();
        PessoaDAO.salvarIndexDB(pessoa).then(function(e){
          console.log($rootScope.online);
          NuvemService.salvar(pessoa).then(function(resNuvem){
             PessoaDAO.removeIndexDB(pessoa.id).then(function(e){
              deferred.resolve(e);
             });
          },function(err) {
              deferred.resolve(err);
          });
        });
      }
      else {
        PessoaDAO.upsertIndexDB(pessoa).then(function(res){
          NuvemService.atualizar(pessoa).then(function(resNuvem){
            PessoaDAO.removeIndexDB(pessoa.id).then(function(e){
              deferred.resolve(e);
            });
          },function(err) {
              deferred.resolve(err);
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
        PessoaDAO.removeIndexDB(pessoa.id).then(function(e){
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

    this.listarUfs = function() {
      var deferred = $q.defer();
      NuvemService.listarUfs().then(function(ufs){
        deferred.resolve(ufs); 
      },
      function(err){
        deferred.resolve([]);
      });
      return deferred.promise;
    }
});

module.controller('PessoaController', function ($scope, $rootScope, PessoaService) {

    $scope.page = 'listar';
    $scope.ultimaPesquisa  = undefined;
    $scope.ufs = [];

    $scope.limpar = function() {
      $scope.pessoas = [];
      $scope.pessoa = [];
    }

    $scope.listarUltimaPesquisa = function() {
      if($scope.ultimaPesquisa == 'listarOnline') {
        $scope.listarOnline();
      }
      else if($scope.ultimaPesquisa == 'listarOffline') {
        $scope.listarOffline();
      }
    }

    $scope.listarOnline = function() {
      $scope.ultimaPesquisa  = 'listarOnline';
      PessoaService.listOnline().then(function(results){
        $scope.pessoas = results;
      },function(err){
        $scope.limpar();
      });
    }

    $scope.listarOffline = function() {
      $scope.ultimaPesquisa  = 'listarOffline';
      PessoaService.listOffline().then(function(results){
        $scope.pessoas = results;
      },function(err){
        $scope.limpar();
      });
    }

    $scope.savePessoa = function () {
      PessoaService.save($scope.pessoa).then(function(e){
       $scope.limpar();
       $scope.goListar();
      }); 
    }

    $scope.delete = function (id) {
      PessoaService.remove(id).then(function(e){
       $scope.limpar();
       $scope.listarUltimaPesquisa();
      }); 
    }

    $scope.cancelar = function () {
      $scope.limpar();
      $scope.goListar();
    }

    $scope.edit = function (pessoa) {
      PessoaService.load(pessoa.id).then(function(result){
        $scope.pessoa = result;
      }); 
    }

    $scope.sincronizar = function(pessoa) {
      PessoaService.sincronizar(pessoa).then(function(res){
        $scope.list();
      },function(err){
        alert("Não foi possivel sincronizar.");
      });
    };

    $scope.listarUfs = function() {
      PessoaService.listarUfs().then(function(ufs){
        $scope.ufs = ufs;
      });
    }

    $scope.changeConnection = function(value) {
      $rootScope.online = value;
    }

    $scope.goNovo = function() {
      $scope.page = 'novo';
    }

    $scope.goListar = function() {
      $scope.page = 'listar';
    }

});