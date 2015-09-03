(function () {
  'use strict';
  angular
    .module('fo')
    .factory('Allocine', Allocine);


  /* @ngInject */
  function Allocine(Restangular) {
    return {
      get: function (id) {
        return Restangular.one("allocine", id).get();
      },
      query: function (movie) {
        return Restangular.all("allocine").getList({
          title: movie.title,
          type: movie.type
        });
      }
    };
  }
})();
