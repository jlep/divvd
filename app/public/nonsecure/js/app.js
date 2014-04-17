'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('divvd', [
  'ui.bootstrap',
  'ui.router',
  'ngResource',
  'divvd.services',
  'divvd.controllers'
  //'ngRoute',
  //'divvd.api',
  //'divvd.filters',
  //'divvd.services',
  //'divvd.directives',
  //'divvd.controllers'
]).
config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
  $stateProvider.
  state('guest', {
    url: '/',
    resolve: {
      'checkGuest': function(auth) {
        return auth.checkGuest('member');
      }
    },
    views: {
      'nav': {
        templateUrl: 'partials/guest_nav.html'
      },
      'body@': {
        templateUrl: 'partials/guest_body.html'
      }
    }
  }).
  state('guest.login', {
    url: 'login',
    views: {
      'body@': {
        templateUrl: 'partials/login.html'
      }
    }
  }).
  state('guest.signup', {
    url: 'signup',
    views: {
      'body@': {
        templateUrl: 'partials/signup.html'
      }
    }
  }).
  state('member', {
    url: '/',
    resolve: {
      'checkMember': function(auth) {
        return auth.checkMember('guest');
      }
    },
    views: {
      'nav': {
        templateUrl: 'partials/member_nav.html'
      },
      'body@': {
        templateUrl: 'partials/ledgers.html'
      }
    }
  }).
  state('member.ledgers', {
    url: 'ledgers',
  }).
  state('member.ledger', {
  });
}]).
controller('MainCtrl', ['$scope', 'auth', '$state',
    function($scope, auth, $state) {
  $scope.logout = function() {
    auth.logout().
    then(function() {
      $state.go('guest');
    });
  }
}]).
config(['$locationProvider', function($locationProvider) {
  $locationProvider.html5Mode(true).hashPrefix('!');
}]);
//run(['routeHandler', 'auth', function(logoutHandler, auth) {
  // force instantiation of routeHandler
  // authenticate as soon as possible
//}]);
