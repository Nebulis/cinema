angular.module('auth')
  .controller('LoginController', function(UserService, $state) {

    var vm = this;
    vm.login = function() {
      UserService.login(vm.password).then(function() {
        $state.go('home');
      });
    };

    vm.keyup = function(event) {
      if(event.keyCode === 13) {
        vm.login();
      }
    }
  });
