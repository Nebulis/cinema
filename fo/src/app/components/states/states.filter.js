(function () {
  'use strict';

  angular
    .module('fo')
    .filter('state', state);

  /** ngInject **/
  function state(States) {
    var states;
    States.get().then(function (res) {
      states = res;
    });

    return stateFilter;

    ////////////////

    function stateFilter(input) {
      var stateEvaluate = '';
      angular.forEach(states, function (state) {

        if (input === state.id) {
          stateEvaluate = state.label;
        }
      });
      return stateEvaluate;
    }
  }
})();
