var schedule = require('node-schedule');
var http = require('http');
var https = require('https');
var updateHandler = require('../../components/reports/update_handler.js');


if (process.env.NODE_ENV === 'production') {
    var update_google_analytics_pulls = schedule.scheduleJob('* */4 * * *',  updateHandler.update_google_analytics_pulls);
} else {

}