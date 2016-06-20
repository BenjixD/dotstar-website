var myModule = angular.module('myModule'); 

myModule.directive('ngDisplaySample', ['$document', function($document){
	return{
		restrict: 'A',
		scope: true,
		link: function(scope, element, attr){
			var modal = angular.element(document.getElementById("display-sample-modal"));
			var body = angular.element(document).find('body');

			element.on('click', function(){
				scope.main.sampleModal = attr.src;
				scope.main.sampleSwitch = true;
				body.addClass('noscroll');

				//Apply img change
				scope.$apply();
			});
		}
	};
}]);

myModule.directive('ngCloseSample', ['$document', function($document){
    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attr) {
        	var body = angular.element(document).find('body');

        	element.on('click', function(e){
        		if(e.target.id != 'display-sample-modal'){
        			scope.main.sampleSwitch = false;
	        		body.removeClass('noscroll');

	        		scope.$digest();
        		}
        	});
        }
    };
}]);