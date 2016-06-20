var myModule = angular.module('myModule'); 

myModule.directive('ngFadeInElement', ['$document', '$window', function($document, $window){
	return{
		restrict: 'A',
		link: function(scope, element, attr){
			scope.onScrollFunction = function (){
				var startLocation = element[0].offsetTop; //This is the offset from top to beginning of element
				if($window.scrollY + $window.innerHeight >= startLocation){
					element.addClass("fadein");
				}
			}

			//On Page Load
			scope.onScrollFunction();

			angular.element($window).bind('scroll resize', function(){
				scope.onScrollFunction();	//Run function if window is resized (scrolled)
				scope.$digest();			//digest data (updates ONLY DOM children ** USE DIGEST OVER APPLY WHENEVER POSSIBLE **)
			});
		}
	};
}]);