var express = require('express');
var path = require('path');
var async = require('async');
var router = express.Router();

module.exports = function(passport){

	//login route
	router.post('/dev/login', passport.authenticate('local-login'), function(req, res){
		res.status(200).send(req.user);
	});

	//check loggedin
	router.get('/dev/loggedin', function(req, res, next){
		if(!req.isAuthenticated()){
			console.log('Not Logged in!');
			res.status(401).send();
		}
		else{
			console.log('You Are Logged IN!');
			res.status(200).send(req.user);
		}
	});

	//logout
	router.get('/dev/logout', function(req, res, next){
		req.logout();
		res.status(200).send();
	});

	return router;
};
