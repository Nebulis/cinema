(function () {
  'use strict';

  angular
    .module('fo')
    .directive('mdTable', mdTable);

  function mdTable() {
    return {
      restrict: 'E',
      scope: {
        headers: '=',
        content: '=',
        sortable: '=',
        filters: '=',
        customClass: '=customClass',
        thumbs: '=',
        count: '='
      },
      controller: function ($scope, $filter) {
        var orderBy = $filter('orderBy');

        $scope.order = function (predicate, reverse) {
          $scope.content = orderBy($scope.content, predicate, reverse);
          $scope.predicate = predicate;
        };
        $scope.order($scope.sortable[0], false);
      },
      template: angular.element(document.querySelector('#md-table-template')).html()
    };
  }

})();
