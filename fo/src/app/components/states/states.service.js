(function () {
  'use strict';
  angular
    .module('fo')
    .factory('States', States);

  /** ngInject **/
  function States(Restangular) {
    return {
      get: Restangular.all("states").getList,
      getNextState: nextState,
      getInitialState: getInitialState
    };

    function nextState(state) {
      if (state < 5) {
        state++;
      }
      return state;
    }

    function getInitialState() {
      return 1;
    }
  }

})();
