(function () {
  'use strict';

  angular
    .module('fo')
    .config(config);

  /** @ngInject */
  function config($logProvider, RestangularProvider, $mdThemingProvider) {
    // Enable log
    $logProvider.debugEnabled(true);

    //Restangular
    RestangularProvider.setBaseUrl('/api');

    $mdThemingProvider.theme('default')
      .primaryPalette('pink')
      .warnPalette('blue-grey')
      .accentPalette('purple');
  }

})();
