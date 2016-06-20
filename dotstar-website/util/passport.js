var LocalStrategy = require('passport-local').Strategy;
var mysql = require('mysql');
var sanitizer = require('sanitizer');
var async = require('async');
var fs = require('fs');

var connection = require('./mysqlPool.js');

module.exports = function(passport){

	//SERIALIZE USER
	passport.serializeUser(function(user, done) {
		done(null, user.username);
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

	return passport;
}