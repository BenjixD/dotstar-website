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

	//Facebook login route
	//scope is used to ask permission to retrieve extra information, email is not provided by default.
	router.get('/dev/login/facebook', passport.authenticate('facebook-login', {scope: ['email']}));

	//Facebook login callback
	//Facebook will call this route after authentication success/failure.
	router.get('/dev/login/facebook/callback',
				passport.authenticate('facebook-login',
					{successRedirect: '/dev/loggedin',
					 failureRedirect: '/'}));

	//Google+ login route
	router.get('/dev/login/google', passport.authenticate('google-login', {scope: ['profile', 'email']}));

	//Google+ login callback
	router.get('/dev/login/google/callback',
				passport.authenticate('google-login',
					{successRedirect: '/dev/loggedin',
					 failureRedirect: '/'}));

	//logout
	router.get('/dev/logout', function(req, res, next){
		req.logout();
		res.status(200).send();
	});

	return router;
};
