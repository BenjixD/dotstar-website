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
                new PNotify({
                    title: 'Got it!',
                    text: 'We\'ll get back to you ASAP.',
                    type: 'success',
                    delay: 3000
                });
            },
            function(response){ //failure callback
                new PNotify({
                    title: 'Oops!',
                    text: 'Looks like something went wrong.',
                    type: 'error',
                    delay: 3000
                });
            }
        );
    };
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


