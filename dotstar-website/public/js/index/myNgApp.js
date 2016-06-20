var myModule = angular.module('myModule', ['routerRoutes', 'ngAnimate', 'duScroll', 'ui.bootstrap']);

myModule.controller('mainController', function($http){

    this.submitContactUs = function(){

        var req = {
            method: 'POST',
            url: '/index/contact-us',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                name: this.indexContactusName,
                email: this.indexContactusEmail,
                message: this.indexContactusMessage
            }
        };

        $http(req).then(
            function(response){ //success callback
                console.log('ayy');
            },
            function(response){ //failure callback
                console.log('lol');
            }
        );
    };

    this.sampleResumes = [{
        id: "sample1",
        source: "img/sampleRes.png"
    },
    {
        id: "sample2",
        source: "img/sampleRes.png"
    },
    {
        id: "sample3",
        source: "img/sampleRes.png"
    },
    {
        id: "sample4",
        source: "img/sampleRes.png"
    },
    {
        id: "sample5",
        source: "img/sampleRes.png"
    }];

    this.sampleModal = "";
    this.sampleSwitch = false;
});

myModule.controller('loginCtrl', function($http, $location){
    this.login = function(){
        var req = {
            method: 'POST',
            url: '/dev/login',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                username: this.loginUsername,
                password: this.loginPassword
            }
        };

        $http(req).then(
            function(response){ //success callback
                console.log('ayy');
            },
            function(response){ //failure callback
                console.log('bad login');
            }
        );
    }
});


