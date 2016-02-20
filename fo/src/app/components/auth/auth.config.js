angular.module('auth')
  .config(function($httpProvider) {
    $httpProvider.interceptors.push(function($injector) {
      return {
        'request': function(config) {
          var UserService = $injector.get('UserService');
          if(config.url.startsWith('/api')) {
            return UserService.getUser().then(function(user) {
              config.headers.Authorization = "Bearer " + user.token;
              return config;
            });
          } else {
            return config;
          }
        },
        'responseError' : function(response) {
          if(response.status === 401) {
            var $state = $injector.get('$state');
            $state.go('login');
          }
          return response
        }
      }
    })
  })
