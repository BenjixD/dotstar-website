var myModule = angular.module('myModule'); 

myModule.directive('ngFadeNavbar', ['$document', '$window', function($document, $window){
	return{
		restrict: 'A',
		link: function(scope, element, attr){
			scope.onScrollFunction = function (){
				var startLocation = element[0].offsetTop; //This is the offset from top to beginning of element
				var navCover = angular.element(document.getElementById(attr.ngFadeNavbar));

				if($window.scrollY == startLocation){
					element.addClass("navbar-transparent");
					element.removeClass("lvl-dp-1");
					
					navCover.addClass("navbar-transparent-cover");
				}

				else{
					element.removeClass("navbar-transparent");
					element.addClass("lvl-dp-1");

					navCover.removeClass("navbar-transparent-cover");
					
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