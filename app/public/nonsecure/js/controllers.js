'use strict';

/* Controllers */

angular.module('divvd.controllers', []).
controller('MyCtrl1', [function() {

}]).
controller('MyCtrl2', [function() {

}]).
controller('CollapseCtrl', ['$scope', '$document',
    function($scope, $document) {
  $scope.isCollapsed = true;
  // ClickStatus indicates whether menu should be collapsed.
  // If the click event reaches document click handler with clickStatus unset
  // (null), menu will be collapsed.
  $scope.clickStatus = null;
  $scope.collapse = function(arg) {
    $scope.clickStatus = arg;
  };
  $document.bind('click', function() {
    if ($scope.clickStatus === null) {
      $scope.isCollapsed = true;
    } else {
      $scope.isCollapsed = $scope.clickStatus;
    }
    $scope.clickStatus = null;
    $scope.$digest();
  });
}]);
