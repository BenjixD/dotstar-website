var fs = require('fs');
var path = require('path');
var async = require('async');
var config = require('../config/server');
var zilean = require('../util/zilean');

function log(error, callback){

    async.waterfall([
        // GETTING TIME
        function(next){
            zilean.getDateTime(function(dateTime){
                next(null, dateTime);
            });
        },

        // LOGGING TO CONSOLE
        function(dateTime, next){
            var logString = '\n============== ERROR ==============\n';
            logString += 'TITLE: ' +error.title +'\n';
            logString += 'TIME: ' +dateTime.date+'/'+dateTime.month+'/'+dateTime.year+' '+dateTime.hour+':'+dateTime.minute+':'+dateTime.second+' '+dateTime.timezone+'\n';
            logString += 'FILE: ' +error.file +'\n';
            logString += 'ROUTE: ' +error.route +'\n';
            if(error.userId){logString += 'USER: ' +error.userId +'\n';}
            logString += 'MESSAGE: ' +error.internalMessage +'\n';
            if(error.specifics){logString += 'SPECIFICS: ' +error.specifics +'\n';}

            console.log(logString);
            next(null, dateTime);
        },

        // CHECK CONFIGURATION FOR LOGGING TO FILES
        function(dateTime, next){
            if(config.logToFile){
                next(null, dateTime);
            }
            else{
                return next(null);
            }
        },

        // CHECK IF THE LOG DIRECTORY EXISTS
        function(dateTime, next){
            var logsDirectory = path.join(__dirname, '..', 'logs');

            fs.stat(logsDirectory, function(err, stats){
                // DIRECTORY D.N.E. -> MAKE IT
                if(err && err.code === 'ENOENT'){
                    fs.mkdir(logsDirectory, function(err){
                        if(err){
                            return next({msg: 'Error making logs directory.'});
                        }
                        else{
                            next(null, dateTime);
                        }
                    });
                }
                // DIRECTORY EXISTS -> CARRY ON
                else{
                    next(null, dateTime);
                }
            });
        },

        // CHECK IF THE YEAR DIRECTORY EXISTS
        function(dateTime, next){
            var yearDirectory = path.join(__dirname, '..', 'logs', dateTime.year);

            fs.stat(yearDirectory, function(err, stats){
                // DIRECTORY D.N.E. -> MAKE IT
                if(err && err.code === 'ENOENT'){
                    fs.mkdir(yearDirectory, function(err){
                        if(err){
                            return next({msg: 'Error making year-log directory.'});
                        }
                        else{
                            next(null, dateTime);
                        }
                    });
                }
                // DIRECTORY EXISTS -> CARRY ON
                else{
                    next(null, dateTime);
                }
            });
        },

        // CHECK IF THE MONTH DIRECTORY EXISTS
        function(dateTime, next){
            var monthDirectory = path.join(__dirname, '..', 'logs', dateTime.year, dateTime.month);

            fs.stat(monthDirectory, function(err, stats){
                // DIRECTORY D.N.E. -> MAKE IT
                if(err && err.code === 'ENOENT'){
                    fs.mkdir(monthDirectory, function(err){
                        if(err){
                            return next({msg: 'Error making month-log directory.'});
                        }
                        else{
                            next(null, dateTime);
                        }
                    });
                }
                // DIRECTORY EXISTS -> CARRY ON
                else{
                    next(null, dateTime);
                }
            });
        },

        // APPEND ERROR TO LOG FILE, CREATE FILE IF IT DOES NOT EXIST
        function(dateTime, next){
            var logFile = path.join(__dirname, '..', 'logs', dateTime.year, dateTime.month, dateTime.date+'.csv');
            var entry;

            if(!error.userId && error.specifics){
                entry = '\''+dateTime.hour+':'+dateTime.minute+':'+dateTime.second+' '+dateTime.timezone+'\',\''+error.title+'\',,\''+error.file+'\',\''+error.route+'\',\''+error.internalMessage+'\',\''+error.specifics+'\'\n';
            }
            else if(error.userId && !error.specifics){
                entry = '\''+dateTime.hour+':'+dateTime.minute+':'+dateTime.second+' '+dateTime.timezone+'\',\''+error.title+'\','+error.userId+',\''+error.file+'\',\''+error.route+'\',\''+error.internalMessage+'\',\'\'\n';
            }
            else if(!error.userId && !error.specifics){
                entry = '\''+dateTime.hour+':'+dateTime.minute+':'+dateTime.second+' '+dateTime.timezone+'\',\''+error.title+'\',,\''+error.file+'\',\''+error.route+'\',\''+error.internalMessage+'\',\'\'\n';
            }
            else{
                entry = '\''+dateTime.hour+':'+dateTime.minute+':'+dateTime.second+' '+dateTime.timezone+'\',\''+error.title+'\','+error.userId+',\''+error.file+'\',\''+error.route+'\',\''+error.internalMessage+'\',\''+error.specifics+'\'\n';
            }

            fs.appendFile(logFile, entry, function(err){
                if(err){
                    return next({msg: 'Error while logging error to file.'});
                }
                else{
                    next(null);
                }
            });
        }
    ],
    // FINAL FUNCTION HANDLES ERROR.
    function(err){
        if(err){
            console.log(err.msg);
        }
        callback(null);
    });
}

module.exports.log = log;
