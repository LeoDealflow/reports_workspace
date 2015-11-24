var express = require('express');
var router = express.Router();
var http = require('http');
var https = require('https');
var cookieParser = require('cookie-parser');
var google = require('googleapis');
var mysql = require('mysql');
var elasticsearch = require('elasticsearch');
var stringify = require('csv-stringify');
var gahelpers = require('./reports_google_helpers');
var sghelpers = require('./reports_sendgrid_helpers');
var environment = require('../../config/connect/environment');
var apiaccess = require('../../config/apiaccess/keysetc');

/** Data Store Initialization **/
var localdata = environment.datastores.main;
var production = environment.datastores.dealflow;
var marcom = environment.datastores.marcom;
var client = environment.datastores.elastic;


exports.sendgrid_local_recent = function(req, res) {
    var select_analytics_pulls;
    if (req.query.searchterm) {
        if (req.query.email) {
            select_sendgrid_pulls = "SELECT * FROM reports_sendgrid_pulls WHERE sendgrid_created_at >= '" + req.query.sglocalfrom + "' AND sendgrid_created_at <= '" + req.query.sglocalto + "T23:59:59' AND event = '" + req.query.acttype + "' AND newsletter_id IS NOT NULL AND category LIKE '%" + req.query.sglocalsearchterm + "%' AND email LIKE '%" + req.query.sglocalemail + "%' GROUP BY email;";
        } else {
            select_sendgrid_pulls = "SELECT * FROM reports_sendgrid_pulls WHERE sendgrid_created_at >= '" + req.query.sglocalfrom + "' AND sendgrid_created_at <= '" + req.query.sglocalto + "T23:59:59' AND event = '" + req.query.acttype + "' AND newsletter_id IS NOT NULL AND category LIKE '%" + req.query.sglocalsearchterm + "%' GROUP BY email;";
        }
    } else {
        if (req.query.email) {
            select_sendgrid_pulls = "SELECT * FROM reports_sendgrid_pulls WHERE sendgrid_created_at >= '" + req.query.sglocalfrom + "' AND sendgrid_created_at <= '" + req.query.sglocalto + "T23:59:59' AND event = '" + req.query.acttype + "' AND newsletter_id IS NOT NULL AND email LIKE '%" + req.query.sglocalemail + "%' GROUP BY email;";
        } else {
            select_sendgrid_pulls = "SELECT * FROM reports_sendgrid_pulls WHERE sendgrid_created_at >= '" + req.query.sglocalfrom + "' AND sendgrid_created_at <= '" + req.query.sglocalto + "T23:59:59' AND event = '" + req.query.acttype + "' AND newsletter_id IS NOT NULL GROUP BY email;";
        }
    }
    if (req.query.sglocalformat == 'table') {
        localdata.query(select_sendgrid_pulls, function(sendgrid_pulls_err, sendgrid_pulls_rows) {
            if (!sendgrid_pulls_err) {
                var obj = sghelpers.activityobjsg(sendgrid_pulls_rows);
                var view = sghelpers.activitysg(obj);
                var script = sghelpers.tableActivityInit(obj);
                res.render('reports/result-table', {
                    'json_out': sendgrid_pulls_rows,
                    'records': sendgrid_pulls_rows.length,
                    'description': req.query,
                    'to': req.query.sglocalto,
                    'from': req.query.sqlocalfrom,
                    'activity': view,
                    'script': script,
                    'obj': obj
                });
            } else {
                console.log('Insert error: ' + sendgrid_pulls_err.message);
                res.render('error', {
                    message: sendgrid_pulls_err.message,
                    error: {}
                });
            }
        });
    } else {
        localdata.query(select_analytics_pulls, function(sendgrid_pulls_err, sendgrid_pulls_rows) {
            if (!sendgrid_pulls_err) {
                stringify(sendgrid_pulls_rows, {
                    delimiter: '\t',
                    header: true
                }, function(sendgrid_pulls_spreadsheet_err, sendgrid_pulls_spreadsheet_report) {
                    if (!sendgrid_pulls_spreadsheet_err) {
                        res.writeHead(200, {
                            'Content-Type': 'text/plain',
                            'Content-Disposition': 'attachment; filename=export.txt',
                            'Content-Transfer-Encoding': 'binary',
                            'Content-Length': Buffer.byteLength(sendgrid_pulls_spreadsheet_report, 'utf8')
                        });
                        console.log(sendgrid_pulls_spreadsheet_report.length);
                        res.write(sendgrid_pulls_spreadsheet_report);
                        res.end();
                    }
                });
            }
        });
    }
}


exports.sendgrid_analytics_local_recent = function(req, res) {
    var select_analytics_pulls;
    if (req.query.searchterm) {
        if (req.query.email) {
            select_analytics_pulls = "SELECT * FROM reports_analytics_pulls WHERE context = 'marketing' AND ga_created_at >= '" + req.query.sggafrom + "' AND ga_created_at <= '" + req.query.sggato + "T23:59:59' AND category LIKE '%" + req.query.sggasearchterm + "%' AND email LIKE '%" + req.query.sggaemail + "%';";
        } else {
            select_analytics_pulls = "SELECT * FROM reports_analytics_pulls WHERE context = 'marketing' AND ga_created_at >= '" + req.query.sggafrom + "' AND ga_created_at <= '" + req.query.sggato + "T23:59:59' AND category LIKE '%" + req.query.sggasearchterm + "%';";
        }
    } else {
        if (req.query.email) {
            select_analytics_pulls = "SELECT * FROM reports_analytics_pulls WHERE context = 'marketing' AND ga_created_at >= '" + req.query.sggafrom + "' AND ga_created_at <= '" + req.query.sggato + "T23:59:59' AND email LIKE '%" + req.query.sggaemail + "%';";
        } else {
            select_analytics_pulls = "SELECT * FROM reports_analytics_pulls WHERE context = 'marketing' AND ga_created_at >= '" + req.query.sggafrom + "' AND ga_created_at <= '" + req.query.sggato + "T23:59:59';";
        }
    }
    if (req.query.sggaformat == 'table') {
        localdata.query(select_analytics_pulls, function(analytics_pulls_err, analytics_pulls_rows) {
            if (!analytics_pulls_err) {
                var obj = gahelpers.activityobjga(analytics_pulls_rows);
                var view = gahelpers.activityga(obj);
                var script = gahelpers.tableActivityInit(obj);
                res.render('reports/result-table', {
                    'json_out': analytics_pulls_rows,
                    'records': analytics_pulls_rows.length,
                    'description': req.query,
                    'to': req.query.activeto,
                    'from': req.query.activefrom,
                    'activity': view,
                    'script': script,
                    'obj': obj
                });
            } else {
                console.log('Insert error: ' + analytics_pulls_err.message);
                res.render('error', {
                    message: analytics_pulls_err.message,
                    error: {}
                });
            }
        });
    } else {
        localdata.query(select_analytics_pulls, function(analytics_pulls_err, analytics_pulls_rows) {
            if (!analytics_pulls_err) {
                stringify(analytics_pulls_rows, {
                    delimiter: '\t',
                    header: true
                }, function(analytics_pulls_spreadsheet_err, analytics_pulls_spreadsheet_report) {
                    if (!analytics_pulls_spreadsheet_err) {
                        res.writeHead(200, {
                            'Content-Type': 'text/plain',
                            'Content-Disposition': 'attachment; filename=export.txt',
                            'Content-Transfer-Encoding': 'binary',
                            'Content-Length': Buffer.byteLength(analytics_pulls_spreadsheet_report, 'utf8')
                        });
                        console.log(analytics_pulls_spreadsheet_report.length);
                        res.write(analytics_pulls_spreadsheet_report);
                        res.end();
                    }
                });
            }
        });
    }

}



