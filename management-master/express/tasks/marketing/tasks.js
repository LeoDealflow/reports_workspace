var schedule = require('node-schedule');
var http = require('http');
var https = require('https');
var sendgridHandler = require('../../components/marketing/sendgrid_handler');


if (process.env.NODE_ENV === 'production') {
    var get_sendgrid_events_job = schedule.scheduleJob('*/5 * * * *',  sendgridHandler.task_move_events_local);
    var pull_sendgrid_local_job = schedule.scheduleJob('*/2 * * * *',  sendgridHandler.task_update_sendgrid_pulls);
   
} else {
	
}