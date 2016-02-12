(function () {
  'use strict';

  angular
    .module('fo')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log, Restangular) {

    $log.debug('runBlock end');
    Restangular.configuration.getIdFromElem = function (elem) {
      return elem._id || elem.id;
    };
  }

})();
