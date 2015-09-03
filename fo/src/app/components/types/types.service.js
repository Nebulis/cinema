(function () {
  'use strict';
  angular
    .module('fo')
    .value('Types', getTypes());


  function getTypes() {
    return [{
      'id': 0,
      'label': 'Film'
    }, {
      'id': 1,
      'label': 'Série'
    }];
  }
})();
