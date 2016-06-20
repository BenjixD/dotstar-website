var mysql = require("mysql");
var config = require("../config/database");

var connection = mysql.createPool(config.settings);

exports.getConnection = function (callback){
    connection.getConnection(function(err, con){
        if(err){
            return callback(err, null);
        }
        else{
            callback(null, con);
        }
    });
};
