/*var myModule = angular.module('sampleSwipe',['ngTouch']); 

myModule.controller('changeSample',function($scope){
	$scope.swipeLeft = function(ev){
		alert("hi1");
	};
	$scope.swipeRight = function(ev){
		alert("hi2");
	};
});*/

var sampleNum =0;
var yDegrees;
function turnRight()
{
	if(sampleNum != 4){
		sampleNum++;
		yDegrees = -30 * sampleNum;
		document.getElementById("sampCarousel").style.transform = "translateZ( -672px ) rotateY( "+yDegrees+"deg )";
	}
}

function turnLeft()
{
	if(sampleNum != 0 ){
		sampleNum --;
		yDegrees = -30 * sampleNum;
		document.getElementById("sampCarousel").style.transform = "translateZ( -672px ) rotateY( "+yDegrees+"deg )";
	}
}