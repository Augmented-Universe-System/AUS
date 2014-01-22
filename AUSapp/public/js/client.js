var AUSapp = angular.module('AUSapp',['ngRoute']);

AUSapp.config(function($routeProvider)
{
  $routeProvider
    .when('/',
    {
        controller: 'Home',
        templateUrl: 'html/home.html'
    })
});
