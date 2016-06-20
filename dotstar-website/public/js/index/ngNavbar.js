var myModule = angular.module('myModule'); 

myModule.directive('ngCloseMenu',["$document", function($document){
	return{
		restrict: 'A',
		link: function(scope, element, attr){
			$document.on("click", function(){
				element.collapse('hide');
			});
		}
	}
}]);

myModule.directive('ngLockNav', ['$document', '$window', function($document, $window){
	return{
		restrict: 'A',
		link: function(scope, element, attr){
			scope.lockNavbar = function (){
				var startLocation = angular.element(document.getElementById(attr.snapid)).offset().top; //snap navbar
				var scrolledLocation = $window.scrollY; //This is the currently scrolled top

				//Apply fixed top when we scroll past the navbar
				if(scrolledLocation >= startLocation){
					if(!element.hasClass('navbar-fixed-top')){
						element.removeClass('navbar-relative');
						element.addClass('navbar-fixed-top');
					}
				}

				//Apply relative position when scrolled back above navbar
				else{
					if(element.hasClass('navbar-fixed-top')){
						element.removeClass('navbar-fixed-top');
						element.addClass('navbar-relative');
					}
				}
			}

			//On Page Load
			scope.lockNavbar();

			angular.element($window).bind('scroll resize', function(){
				scope.lockNavbar();			//Run function if window is resized (scrolled)
				scope.$digest();			//digest data (updates ONLY DOM children ** USE DIGEST OVER APPLY WHENEVER POSSIBLE **)
			});
		}
	}
}]);