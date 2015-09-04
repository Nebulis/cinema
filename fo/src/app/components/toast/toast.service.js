(function () {
  'use strict';
  angular
    .module('fo')
    .factory('Toast', Toast);

  /* @ngInject */
  function Toast($mdToast) {
    var exports = {
      success: success,
      error: error
    };


    return exports;

    ////////////////

    function success(content) {
      $mdToast.show($mdToast.simple().content(content).theme('success-toast').position('top right').hideDelay(20000));
    }

    function error(content) {
      $mdToast.show($mdToast.simple().content(content).theme('error-toast').position('top right'));
    }
  }
})();
