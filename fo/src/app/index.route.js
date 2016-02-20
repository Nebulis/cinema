(function() {
  'use strict';

  angular
    .module('fo')
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainController',
        controllerAs: 'main',
        resolve : {
          user : function(UserService) {
            return UserService.getUser();
          }
        }
      }).state('login', {
        url : '/login',
        templateUrl : 'app/components/auth/login.html',
        controller : 'LoginController',
        controllerAs : 'login'
      });

    $urlRouterProvider.otherwise('/');
  }

})();
