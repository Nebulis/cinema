(function () {
  'use strict';

  angular
    .module('fo')
    .controller('FormController', FormController);


  /** @ngInject */
  function FormController(Types, Movies, $mdDialog, movie, Genres, States, Toast, Restangular) {
    var vm = this;
    vm.movie = movie || {};
    vm.types = Types;
    vm.genres = Genres;
    vm.search = search;
    vm.states = {};
    vm.title = movie._id ? 'Modifier' : 'Créer';

    States.get().then(function (states) {
      vm.states = states;
    });

    function search(genre) {
      var query = vm.searchGenre;
      if (!query) {
        return true;
      }
      return (angular.lowercase(genre).indexOf(angular.lowercase(query)) !== -1);
    }

    vm.delete = function () {
      //native js confirm
      //https://github.com/angular/material/issues/3072
      if (confirm('Confirmer la suppression ?')) {
        vm.movie.remove().then(function () {
            Toast.success('Suppression réalisée avec succès');
            $mdDialog.hide();
          },
          function (error) {
            Toast.error('Problème rencontrée lors de la suppression - ' + error.statusText);
            $mdDialog.cancel();
          });
      }
    };


    vm.save = function () {
      if (vm.movie.hover) {
        delete vm.movie.hover;
      }
      if (vm.movie.type === 'Film') {
        delete vm.movie.season;
      }
      vm.movie.genre = vm.movie.genre || vm.searchGenre;
      vm.movie.state = vm.movie.state || States.getInitialState();

      vm.movie.save().then(function (movie) {
        if (!vm.movie._id) {
          Toast.success('Insertion réalisée avec succès');
          return Restangular.one('movies', movie._id).get();
        } else {
          Toast.success('Modification réalisée avec succès');
          $mdDialog.hide(movie);
        }
      }, function (error) {
        if (!vm.movie._id) {
          Toast.error('Problème rencontrée lors de l\'insertion - ' + error.statusText);
        } else {
          Toast.error('Problème rencontrée lors de la modification - ' + error.statusText);
        }
        $mdDialog.cancel();
      }).then(function (movie) { // bug on clone after creation, so get the film and return it
        $mdDialog.hide(movie);
      });
    };
  }
})();
