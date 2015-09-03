(function () {
  'use strict';
  angular
    .module('fo')
    .factory('Movies', Movies);


  /* @ngInject */
  function Movies(Restangular) {
    return Restangular.all("movies");
  }
})();
