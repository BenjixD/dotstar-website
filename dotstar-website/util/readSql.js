var path = require('path');
var fs = require('fs');

exports.getSql = function(fileName, callback){
    var filePath = path.join(__dirname, '..', 'sql', fileName);

    fs.readFile(filePath, 'utf8', function(err, data){
        if(err){
            callback(err, null);
        }
        else{
            callback(null, data);
        }
    });
};
