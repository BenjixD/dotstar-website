//index.js' ngRoute
var myRoute = angular.module('routerRoutes', ['ngRoute']);

//INDEX routing
myRoute.config(function ($routeProvider, $locationProvider){
	$routeProvider
	.when('/',{
		templateUrl: '/views/index/partials/home.html',
		controller: 'mainController',
		controllerAs: 'main'
	});
	$locationProvider.html5Mode(true);
});

//DEV routing
myRoute.config(function ($routeProvider, $locationProvider){
	$routeProvider.
	when('/dev/login',{
		templateUrl: '/views/dev/partials/login.html',
		controller: 'loginCtrl',
		controllerAs: 'main'
	});
	$locationProvider.html5Mode(true);
});