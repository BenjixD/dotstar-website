var myModule = angular.module('myModule'); 

myModule.directive('ngScrollSmooth', ['$document', function($document){
	return{
		restrict: 'A',
		link: function(scope, element, attr){
			var duration = 1500; //milliseconds
			var offset = attr.offset;	//pixel adjustment

			element.on('click', function(){
				//Note: Use this in a directive, not with document.getElementById
				var sectionElement = angular.element(document.getElementById(attr.ngScrollSmooth));
	    		$document.scrollToElement(sectionElement, offset, duration);
			});
		}
	};
}]);