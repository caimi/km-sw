var module = angular.module('app', ['xc.indexedDB','angular.ping']);

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
      var isSameMachineFunction = this.isSameMachine;

      PessoaDAO.loadFromIndexDB(id).then(function(pessoa){
        deferred.resolve(pessoa);
      },
      function(err){
        NuvemService.obter(id).then(function(pessoaNuvem){
          if (!isSameMachineFunction(pessoaNuvem.idBloqueio)) {
            alert('O registro foi bloqueado por outro usuário');
            deferred.reject(err);
          }
          pessoaNuvem.idBloqueio = localStorage.getItem('hash');
          NuvemService.atualizar(pessoaNuvem).then(function(resNuvem){
            deferred.resolve(pessoaNuvem); 
          },function(err) {
              deferred.reject(err);
          })
        },
        function(err){
          alert('Não foi possivel carregar item estando offline, pois o mesmo encontra-se no servidor.');
          deferred.reject(err);
        });
      });

      return deferred.promise;
    }

    this.sincronizar = function(pessoa) {
      var deferred = $q.defer();
      pessoa.idBloqueio = undefined;     
      NuvemService.obter(pessoa.id).then(function(pessoaNuvem){
        NuvemService.atualizar(pessoa).then(function(resNuvem){
          PessoaDAO.removeIndexDB(pessoaNuvem.id).then(function(e){
            deferred.resolve(e);
          });
        },function(resNuvem) {
          deferred.reject(resNuvem);
        });
      },
      function(resp){
        NuvemService.salvar(pessoa).then(function(resNuvem){
          PessoaDAO.removeIndexDB(pessoa.id).then(function(e){
            deferred.resolve(e);
          });
        },function(err) {
          deferred.reject(err);
        });
      });
      return deferred.promise;
    }

    this.listarUfs = function() {
      var deferred = $q.defer();
      NuvemService.listarUfs().then(function(ufs){
        deferred.resolve(ufs); 
      },
      function(err){
        var ufs = localStorage.getItem('ufs');
        deferred.resolve((ufs)?JSON.parse(ufs):[]);
      });
      return deferred.promise;
    }

    this.generateHash = function() {
      var text = localStorage.getItem('hash');
      if (!text || text == null) {
        text = '';
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < 10; i++ ) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        localStorage.setItem('hash',text);
      }
      return localStorage.getItem('hash');
    }

    this.isSameMachine = function(idBloqueio) {
      if(!idBloqueio) {
        return true;
      }
      var text = localStorage.getItem('hash');
      return text == idBloqueio;
    }
    
});

module.controller('PessoaController', function ($scope, $rootScope, PessoaService) {

    $scope.page = 'listar';
    $scope.ultimaPesquisa  = undefined;
    $scope.ufs = [];
    $scope.connection = true;
    $rootScope.online = true;

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
        $scope.goNovo();
      }); 
    }

    $scope.sincronizar = function() {

      var requests = $scope.pessoas.map(function(pessoa){
        return PessoaService.sincronizar(pessoa);
      });

      Promise.all(requests).then(function(resp){
        alert('Sincronizado com sucesso!');
        $scope.listarUltimaPesquisa();
      },function(err){
        alert('Não foi possivel sincronizar.');
      });
    };

    $scope.listarUfs = function() {
      PessoaService.listarUfs().then(function(ufs){
        $scope.ufs = ufs;
      });
    }

    $scope.changeConnection = function(value) {
      $rootScope.online = value;
      $scope.listarUfs();
    }

    $scope.goNovo = function() {
      $scope.page = 'novo';
    }

    $scope.goListar = function() {
      $scope.page = 'listar';
    }

    PessoaService.generateHash();
});