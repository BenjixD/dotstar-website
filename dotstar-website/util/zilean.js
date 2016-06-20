function getTime(callback){
    var now = new Date();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    var timezone = (-1)*now.getTimezoneOffset();

    var response = {
        hour: (hour>=10)?hour.toString():'0'+hour,
        minute: (minute>=10)?minute.toString():'0'+minute,
        second: (second>=10)?second.toString():'0'+second,
        timezone: 'UTC' +(timezone/60)
    };

    callback(response);
}


function getDate(callback){
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1; //For some strange reason January = 0...
    var date = now.getDate();
    var day = now.getDay();
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var monthAbbreviations = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var dayAbbreviations = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    var response = {
        year: year.toString(),
        month: (month>=10)?month.toString():'0'+month,
        date: (date>=10)?date.toString():'0'+date,
        monthName: monthNames[month-1],
        monthAbb: monthAbbreviations[month-1],
        day: dayNames[day],
        dayAbb: dayAbbreviations[day]
    };

    callback(response);
}

function getDateTime(callback){
    getDate(function(dateNow){
        getTime(function(timeNow){
            var response = {
                year: dateNow.year,
                month: dateNow.month,
                date: dateNow.date,
                monthName: dateNow.monthName,
                monthAbb: dateNow.monthAbb,
                day: dateNow.day,
                dayAbb: dateNow.dayAbb,
                hour: timeNow.hour,
                minute: timeNow.minute,
                second: timeNow.second,
                timezone: timeNow.timezone
            };
            callback(response);
        });
    });
}


module.exports.getTime = getTime;
module.exports.getDate = getDate;
module.exports.getDateTime = getDateTime;
