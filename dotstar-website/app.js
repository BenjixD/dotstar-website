var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var http = require('http');

var errorLogger = require('./util/errorLogger.js');
var connection = require('./util/mysqlPool.js');

require('./util/passport.js')(passport);

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// required for passport
app.use(session({ secret: 'secretsession' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

//TEMPORARY VISIT COUNTER (WILL STORE AS CONFIG FILE)
var userCount=0;

// Express will serve this one page, other pages will be handled by angular router.
app.get('/', function(req, res, next){
	userCount++;
    res.sendFile(path.join(__dirname, 'public', 'views', 'index', 'index.html'), {headers: {'viewers': userCount}});
    console.log(userCount + " visits!");
});

// All of our routes:
var index = require('./routes/index');
var developer = require('./routes/developer')(passport);
app.use('/', index);
app.use('/', developer);


// ERROR HANDLER -> OUTPUTS ERROR TO LOG FILE AND CONSOLE
app.use(function(err, req, res, next) {
    errorLogger.log(err, function(){
        res.status(err.status || 500).send(err.response);
    });
});

app.listen(3000, function () {
    console.log('Server running on localhost:3000');
});

module.exports = app;
