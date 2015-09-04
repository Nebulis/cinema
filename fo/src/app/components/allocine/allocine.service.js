(function () {
  'use strict';
  angular
    .module('fo')
    .factory('Allocine', Allocine);


  /* @ngInject */
  function Allocine(Restangular) {
    return {
      getMovie: function (id) {
        return Restangular.one("allocine/movie", id).get();
      },
      getSerie: function (id) {
        return Restangular.one("allocine/serie", id).get();
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
