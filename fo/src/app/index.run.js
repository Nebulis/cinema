(function () {
  'use strict';

  angular
    .module('fo')
    .run(runBlock)
    .run(router);

  /** @ngInject */
  function runBlock($log, Restangular) {

    $log.debug('runBlock end');
    Restangular.configuration.getIdFromElem = function (elem) {
      return elem._id || elem.id;
    };
  }

  function router($rootScope, $state) {
    $rootScope.$on('$stateChangeError', function() {
      $state.go('login');
    })
  }

})();
