var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy; //<--- wtf is .Strategy btw??
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var mysql = require('mysql');
var sanitizer = require('sanitizer');
var async = require('async');
var fs = require('fs');
var facebookAuth = require('../config/facebookAuth');
var googleAuth = require('../config/googleAuth');
var errorList = require('../config/errors');
var readSql = require('./readSql');

var connection = require('./mysqlPool.js');

module.exports = function(passport){

	//SERIALIZE USER
	passport.serializeUser(function(user, done) {
		done(null, user.local_id);
	});

	// DESERIALIZE USER
	passport.deserializeUser(function(id, done) {
		// QUERY TO LOOK FOR THE USER WITH THE SERIALIZED USERNAME
		connection.getConnection(function(err, con){
			fs.readFile('./sql/loginSQL.txt', 'utf-8', function(err, data){
				con.query(data, [id],function(err, results){
					con.release();
					done(err, results[0]);
				});
			});
		});
	});



	// =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
    	// by default, local strategy uses username and password
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, next){
    	async.waterfall([
    		//READ LOGIN SQL
    		function(callback){
    			fs.readFile('./sql/loginSQL.txt', 'utf-8', function(err, data){
    				if(err){
    					return callback(err, null);
    				}
    				else{
    					callback(null, data);
    				}
    			});
    		},

    		//RUN SQL CHECK
    		function(data, callback){
    			connection.getConnection(function(err, con){
    				if(err){
    					return callback(err, null);
    				}

    				else{
    					con.query(data, [username], function(err, results){
    						if(err){
    							con.release();
    							return callback(err, null);
    						}

    						else if (!results.length){
    							con.release();
    							return callback(err, null);
    						}

    						else {
    							con.release();
    							callback(null, results);
    						}
    					});
    				}
    			});
    		},

    		//CHECK PASSWORD
    		function(data, callback){
    			if(!(data[0].password == password)){
    				return callback(err, null);
    			}

    			else{
    				callback(null, data);
    			}
    		}],

    		//CALLBACK FUNCTION TO REPORT SUCCESS/FAILURE
    		function(err, user){
    			if(err){
    				return next(err, false);
    			}
    			else{
    				return next(null, user[0]);
    			}
    	});

    }));



	// =========================================================================
    // FACEBOOK SIGNUP & LOGIN =================================================
    // =========================================================================

	passport.use('facebook-login', new FacebookStrategy(facebookAuth, function(accessToken, refreshToken, profile, passportNext){
		process.nextTick(function(){
			connection.getConnection(function(err, con){
				if(err){
					var error = errorList.DATABASE_CONNECTION;
					error.file = 'passport.js';
					error.specifics = 'facebook-login strategy';
					return passportNext(error);
				}
				else{
					async.waterfall([

						//GETTING QUERY FOR CHECKING IF A USER EXISTS
						function(next){
							readSql.getSql('userCount.sql', function(err, unfilledQuery){
								if(err){
									var error = errorList.SQL_READ;
									error.specifics = 'Failure while reading userCount.sql';
									return next(error, null);
								}
								else{
									var query = mysql.format(unfilledQuery, [profile.provider, profile.id]);
									next(null, query);
								}
							});
						},

						//QUERYING DATABASE TO CHECK IF USER IS ALREADY REGISTERED
						function(query, next){
							con.query(query, function(err, results){
								if(err){
									var error = errorList.DATABASE_QUERY;
									error.specifics = 'Failure to query for user count';
									return next(error, null);
								}
								else{
									next(null, results[0].userCount);
								}
							})
						},

						//IF userCount == 0, then user is not registered -> register and log in
						function(userCount, next){
							if(userCount === 0){
								var newUser = {};
								newUser.provider = profile.provider;
								newUser.provider_id = profile.id;
								newUser.access_token = accessToken;
								newUser.username = profile.displayName;
								newUser.first_name = profile.name.givenName;
								newUser.middle_name = profile.name.middleName;
								newUser.last_name = profile.name.lastName;
								newUser.email = null; //TODO: get email from facebook

								readSql.getSql('foreignSignup.sql', function(err, query){
									if(err){
										var error = errorList.SQL_READ;
										error.specifics = 'Failure while reading foreignSignup.sql';
										return next(error, null);
									}
									else{
										var inserts = [
											newUser.provider,
											newUser.provider_id,
											newUser.access_token,
											newUser.username,
											newUser.first_name,
											newUser.middle_name,
											newUser.last_name,
											newUser.email
										];

										con.query(query, inserts, function(err, results){
											if(err){
												var error = errorList.DATABASE_INSERT;
												error.specifics = 'Failed to sign up facebook user.';
												return next(error, null);
											}
											else{
												newUser.local_id = results.insertId;

												return next(null, newUser);
											}
										});
									}
								});
							}
							else{
								next(null, userCount);
							}
						},

						//IF userCount == 1, then user is already registered -> log in
						function(userCount, next){
							if(userCount === 1){
								readSql.getSql('foreignLogin.sql', function(err, query){
									con.query(query, [profile.provider, profile.id], function(err, results){
										if(err){
											var error = errorList.DATABASE_QUERY;
											error.specifics = 'Failure to query for user info.';
											return next(error, null);
										}
										else{
											next(null, results[0]);
										}
									});
								});
							}
						}
					],
					// FINAL FUNCTION HANDLES ERROR
					function(error, user){
						if(error){
							error.file = 'passport.js';
							return passportNext(error, false);
						}
						else{
							return passportNext(null, user);
						}
					});
				}
			});
		});
	}));




	// =========================================================================
    // GOOGLE+ SIGNUP & LOGIN ==================================================
    // =========================================================================

	passport.use('google-login', new GoogleStrategy(googleAuth, function(accessToken, refreshToken, profile, passportNext){
		process.nextTick(function(){
			connection.getConnection(function(err, con){
				if(err){
					var error = errorList.DATABASE_CONNECTION;
					error.file = 'passport.js';
					error.specifics = 'google-login strategy';
					return passportNext(error);
				}
				else{
					async.waterfall([

						//GETTING QUERY FOR CHECKING IF A USER EXISTS
						function(next){
							readSql.getSql('userCount.sql', function(err, unfilledQuery){
								if(err){
									var error = errorList.SQL_READ;
									error.specifics = 'Failure while reading userCount.sql';
									return next(error, null);
								}
								else{
									var query = mysql.format(unfilledQuery, [profile.provider, profile.id]);
									next(null, query);
								}
							});
						},

						//QUERYING DATABASE TO CHECK IF USER IS ALREADY REGISTERED
						function(query, next){
							con.query(query, function(err, results){
								if(err){
									var error = errorList.DATABASE_QUERY;
									error.specifics = 'Failure to query for user count';
									return next(error, null);
								}
								else{
									next(null, results[0].userCount);
								}
							})
						},

						//IF userCount == 0, then user is not registered -> register and log in
						function(userCount, next){
							if(userCount === 0){
								var newUser = {};
								newUser.provider = profile.provider;
								newUser.provider_id = profile.id;
								newUser.access_token = accessToken;
								newUser.username = profile.displayName;
								newUser.first_name = profile.name.givenName;
								newUser.middle_name = profile.name.middleName;
								newUser.last_name = profile.name.lastName;
								newUser.email = profile.emails[0].value;

								readSql.getSql('foreignSignup.sql', function(err, query){
									if(err){
										var error = errorList.SQL_READ;
										error.specifics = 'Failure while reading foreignSignup.sql';
										return next(error, null);
									}
									else{
										var inserts = [
											newUser.provider,
											newUser.provider_id,
											newUser.access_token,
											newUser.username,
											newUser.first_name,
											newUser.middle_name,
											newUser.last_name,
											newUser.email
										];

										con.query(query, inserts, function(err, results){
											if(err){
												var error = errorList.DATABASE_INSERT;
												error.specifics = 'Failed to sign up google+ user.';
												return next(error, null);
											}
											else{
												newUser.local_id = results.insertId;

												return next(null, newUser);
											}
										});
									}
								});
							}
							else{
								next(null, userCount);
							}
						},

						//IF userCount == 1, then user is already registered -> log in
						function(userCount, next){
							if(userCount === 1){
								readSql.getSql('foreignLogin.sql', function(err, query){
									con.query(query, [profile.provider, profile.id], function(err, results){
										if(err){
											var error = errorList.DATABASE_QUERY;
											error.specifics = 'Failure to query for user info.';
											return next(error, null);
										}
										else{
											next(null, results[0]);
										}
									});
								});
							}
						}
					],
					// FINAL FUNCTION HANDLES ERROR
					function(error, user){
						if(error){
							error.file = 'passport.js';
							return passportNext(error, false);
						}
						else{
							return passportNext(null, user);
						}
					});
				}
			});
		});
	}));


	return passport;
}
