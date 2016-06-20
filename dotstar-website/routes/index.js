var express = require('express');
var path = require('path');
var async = require('async');
var sanitizer = require('sanitizer');
var emailExistence = require('email-existence');
var errorList = require('../config/errors');
var email = require('../util/autoEmail');
var router = express.Router();

router.post('/index/contact-us', function(req, res, middlewareNext){

    // SETTING UP EMAIL
    var transport = require('../config/email.json').transport1;
    var templates = {
        text: path.join(__dirname, '..', 'emails', 'contact-us', 'userPlain.txt')
    };
    var heading = {
        from: 'DotStar <'+transport.auth.user+'>',
        subject: 'Contact Us',
        recipients: [sanitizer.sanitize(req.body.email)]
    };
    var context = {
        name: sanitizer.sanitize(req.body.name),
        email: sanitizer.sanitize(req.body.email),
        message: sanitizer.sanitize(req.body.message)
    };

    async.waterfall([
        // SEND EMAIL TO USER
        function(next){
            email.sendMail(transport, templates, heading, context, function(err, failed){
                if(err && !failed){
                    var error = errorList.EMAIL_TEMPLATE_READ;
                    error.specifics = err.msg;
                    return next(error);
                }
                else if(err && failed){
                    var error = errorList.EMAIL_SEND;
                    error.specifics = err.msg;
                    return next(error);
                }
                else{
                    next(null);
                }
            });
        },

        // SEND EMAIL TO STAFF
        function(next){
            // EDITTING INFO A BIT
            templates = {
                text: path.join(__dirname, '..', 'emails', 'contact-us', 'staffPlain.txt')
            };
            heading.recipients = ['nansagad@gmail.com'];

            email.sendMail(transport, templates, heading, context, function(err, failed){
                if(err && !failed){
                    var error = errorList.EMAIL_TEMPLATE_READ;
                    error.specifics = 'Unable to read template when sending to staff.';
                    return next(error);
                }
                else if(err && failed){
                    var error = errorList.EMAIL_SEND;
                    error.specifics = 'Unable to send email to staff.';
                    return next(error);
                }
                else{
                    next(null);
                }
            });
        }
    ],

    // FINAL FUNCTION HANDLES ERROR
    function(err){
        if(err){
            err.file = 'index.js';
            err.route = '/index/contact-us';
            return middlewareNext(err);
        }
        else{
            res.status(200).send('OK');
        }
    });
});

module.exports = router;
