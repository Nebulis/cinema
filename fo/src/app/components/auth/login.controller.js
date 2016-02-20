angular.module('auth')
  .controller('LoginController', function(UserService, $state, Toast) {

    var vm = this;
    vm.login = function() {
      UserService.login(vm.password).then(function() {
        $state.go('home');
        Toast.success('Connexion réussie')
      }).catch(function() {
        Toast.error('Password incorrect')
        vm.password = '';
      });
    };

    vm.keyup = function(event) {
      if(event.keyCode === 13) {
        vm.login();
      }
    }
  });
