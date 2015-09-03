(function () {
  'use strict';

  angular
    .module('fo')
    .directive('acmeNavbar', acmeNavbar);

  /** @ngInject */
  function acmeNavbar() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/navbar/navbar.html',
      scope: {
        creationDate: '='
      },
      controller: NavbarController,
      controllerAs: 'navbar',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function NavbarController(moment, $mdDialog, $scope, Restangular) {
      var vm = this;

      // "vm.creation" is avaible by directive option "bindToController: true"
      vm.relativeDate = moment(vm.creationDate).fromNow();

      vm.new = function (ev) {
        $mdDialog.show({
          controller: 'FormController',
          controllerAs: 'form',
          templateUrl: 'app/components/movies/form.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          resolve: {
            movie: function () {
              return Restangular.one('movies');
            }
          }
        }).then(function (movie) {
          $scope.$emit('addMovie', movie);
        });
      };
    }
  }

})();
