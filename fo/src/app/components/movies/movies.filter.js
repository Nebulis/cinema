(function () {
  'use strict';

  angular
    .module('fo')
    .filter('search', search);

  function search() {

    return searchFilter;

    ////////////////

    function searchFilter(movies, search) {
      var filteredMovie = [];
      angular.forEach(movies, function (movie) {
        if (matchString(movie.title, search.title) &&
          matchInArrayString(movie.genre, search.genres) &&
          matchInArrayObject(movie.type, search.types, 'label') &&
          matchInArrayObject(movie.state, search.states, 'id')) {
          filteredMovie.push(movie);
        }
      });
      return filteredMovie;
    }

    function matchString(string, expectedString) {
      if (!string || !expectedString) {
        return true;
      }
      return string.toLowerCase().indexOf(expectedString.toLowerCase()) !== -1;
    }

    function matchInArrayString(value, array) {
      if (!value || !array || !angular.isArray(array) || array.length === 0) {
        return true;
      }
      return _.includes(array, value);
    }

    function matchInArrayObject(value, array, field) {
      if (!value || !array || !field || !angular.isArray(array) || array.length === 0) {
        return true;
      }
      return !!_.find(array, field, value);
    }
  }
})();
