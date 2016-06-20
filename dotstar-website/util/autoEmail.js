var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var async = require('async');
var fs = require('fs');

function sendMail(transport, templates, heading, context, callback){

    // SETTING UP TRANSPORTER
    var transporter = nodemailer.createTransport(smtpTransport(transport));

    // READING FILES
    async.parallel({
        text: function(cb){
            fs.readFile(templates.text, 'utf-8', function(err, data){
                cb(err, data);
            });
        },
        html: function(cb){
            if(!templates.html){
                cb(null, null);
            }
            else{
                fs.readFile(templates.html, 'utf-8', function(err, data){
                    cb(err, data);
                });
            }
        }
    },

    // results = {text:..., styled:...}
    function(err, results){
        if(err){
            callback({msg: 'Error reading email template files.'}, null);
        }
        else{
            // SETTING UP TEMPLATE SENDER FUNCTION
            var send = transporter.templateSender({
                subject: heading.subject,
                text: results.text,
                html: results.html
            }, {
                from: heading.from
            });

            var recipientNum = heading.recipients.length;
            var failed = [];

            //FUNCTION TO SEND EMAIL TO EVERYONE IN RECIPIENT LIST
            function sendAll(iterator, cb){

                // KEEPS TRACK OF HOW MANY TIME THE SEND FUNCTION IS COMPLETED
                var reportCount = 0;

                // ONCE EMAIL FINISH SENDING THIS REPORT FUNCTION IS RAN AND INCREMENT reportCount
                function report(){
                    reportCount++;

                    // IF WE'RE DONE THEN RUN THE CALLBACK FUNCTION
                    if(reportCount === recipientNum){
                        cb(failed);
                    }
                }

                // TAKING ADVANTAGE OF THE ASYNC BEHAVIOR AND START SENDING ALL THE EMAILS AT ONCE
                for(var i = 0; i < recipientNum; i++){
                    iterator(heading.recipients[i], report);
                }
            }

            // SEND EMAIL TO EVERYONE
            sendAll(function(recipient, report){
                send({to: recipient}, context, function(err, info){
                    if(err){
                        failed.push({email: recipient, error: err});
                        report();
                    }
                    else{
                        report();
                    }
                });
            },
            function(failed){

                var failedNum = failed.length;

                // RUNNING CALLBACK FUNCTIONS
                if(failedNum === recipientNum){
                    callback({msg: "Error sending email to all recipients"}, failed);
                }
                else if (failedNum > 0){
                    callback({msg: "Error sending email to some recipients"}, failed);
                }
                else{
                    callback(null, null);
                }
            });
        }
    });
}

module.exports.sendMail = sendMail;
