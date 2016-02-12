(function () {
  'use strict';
  angular
    .module('fo')
    .factory('Genres', Genres);


  /* @ngInject */
  function Genres(Restangular) {
    return Restangular.all('movies/genre').getList();
  }
})();
