(function () {
  'use strict';

  angular
    .module('fo')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($timeout, Restangular, $scope, $mdDialog, Genres, Types, States, Toast, Allocine) {
    var vm = this;

    vm.creationDate = 1439925166810;
    vm.movies = [];
    vm.hover = hover;
    vm.leave = leave;
    vm.edit = edit;
    vm.isMovie = isMovie;
    vm.changeState = changeState;
    vm.genres = Genres;
    vm.types = Types;
    vm.states = States.get();
    vm.search = {};
    var minObj = 50;
    var step = 20;
    vm.limit = minObj;
    vm.loadDatas = load;
    vm.allocine = getAllocineDatas;

    activate();

    $scope.$watch(function () {
      return vm.search;
    }, function () {
      vm.limit = minObj;
    }, true);

    function showAllocineDetails($event, movie) {
      var promise = movie.type === 'Film' ?
        Allocine.getMovie(movie.id_allocine) : Allocine.getSerie(movie.id_allocine);

      promise.then(function (result) {
        $mdDialog.show({
          controller: "AllocineController",
          controllerAs: 'allocine',
          resolve: {
            allocine: function () {
              return result.movie || result.tvseries;
            },
            movie: function () {
              return movie;
            }
          },
          templateUrl: 'app/components/allocine/allocine.tpl.html',
          parent: angular.element(document.body),
          targetEvent: $event,
          clickOutsideToClose: true
        });
      });
    }

    function getAllocineDatas($event, movie) {
      $event.stopPropagation();
      if (movie.id_allocine) {
        showAllocineDetails($event, movie);
      } else {
        Allocine.query(movie).then(function (result) {
          $mdDialog.show({
            controller: "AllocineAssociateController",
            controllerAs: 'allocine',
            resolve: {
              movies: function () {
                return result;
              },
              movie: function () {
                return movie;
              }
            },
            templateUrl: 'app/components/allocine/allocine-associate.tpl.html',
            parent: angular.element(document.body),
            targetEvent: $event,
            clickOutsideToClose: true
          }).then(function (movie) {
            showAllocineDetails($event, movie);
          });
        });
      }
    }

    function activate() {
      Restangular.all('movies').getList().then(function (movies) {
        vm.movies = movies;
      });
    }

    function load() {
      vm.limit += step;
    }

    function hover(movie) {
      movie.hover = true;
    }

    function leave(movie) {
      delete movie.hover;
    }

    function isMovie(movie) {
      return !movie.season && movie.type === 'Film';
    }

    function changeState($event, movie) {
      $event.stopPropagation();
      var oldState = movie.state;
      var newState = States.getNextState(movie.state);
      if (oldState !== newState) {
        movie.state = newState;
        movie.save().then(function () {
          Toast.success("Changement d'état réalisé avec succès");
        }, function (error) {
          movie.state = oldState;
          Toast.error("Probleme lors du changement d'état - " + error.statusText);
        });
      }
    }

    function edit(movie, event) {
      $mdDialog.show({
        controller: 'FormController',
        controllerAs: 'form',
        templateUrl: 'app/components/movies/form.html',
        parent: angular.element(document.body),
        targetEvent: event,
        clickOutsideToClose: true,
        resolve: {
          movie: function () {
            return movie.clone();
          }
        }
      }).then(function (newMovie) {
        if (newMovie === true) {
          var index = _.findIndex(vm.movies, function (arrayMovie) {
            return movie._id === arrayMovie._id;
          });
          vm.movies.splice(index, 1);
        } else {
          angular.extend(movie, newMovie);
        }
      });
    }


    $scope.$on('addMovie', function (event, movie) {
      vm.movies.push(movie);
    });
  }
})();
