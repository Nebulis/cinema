(function() {
  angular.module('auth')
    .service('UserService', function($q, $http) {
      var user = {};
      this.getUser = function() {
        return $q(function(resolve, reject) {
          if(localStorage.getItem('Token') != undefined) {
            user.token =localStorage.getItem('Token');
            resolve(user);
          } else {
            reject({});
          }
        })
      }

      this.login = function(password) {
        return $http.post('/login', {password : password})
          .then(function(response) {
            localStorage.setItem('Token', response.data.token);
          });
      }
    })
})();
