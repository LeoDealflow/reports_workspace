var express = require('express');
var router = express.Router();
var http = require('http');
var https = require('https');
var cookieParser = require('cookie-parser');
var google = require('googleapis');
var mysql = require('mysql');
var elasticsearch = require('elasticsearch');
var stringify = require('csv-stringify');
var helpers = require('./reports_google_helpers');
var environment = require('../../config/connect/environment');
var apiaccess = require('../../config/apiaccess/keysetc');

/** Data Store Initialization **/
var localdata = environment.datastores.main;
var production = environment.datastores.dealflow;
var marcom = environment.datastores.marcom;
var client = environment.datastores.elastic;


/** Google Analytics Authentication **/

var analytics = google.analytics('v3');
exports.gaoauthcallback = function(req, res) {
    var oauth2client = apiaccess.google.oauth2client;
    oauth2client.getToken(req.query.code, function(err, tokens) {
        if (!err) {
            oauth2client.setCredentials(tokens);
            google.options({
                auth: oauth2client
            });
            res.redirect(302, '/reports/gaform');
        } else {
            console.log(err);
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: {}
            });
        }
    });
}

exports.auth = function(req, res) {
    var oauth2client = apiaccess.google.oauth2client;
    var oauthURL = oauth2client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/analytics.readonly'
    });
    console.log('Authenticating');
    res.redirect(302, oauthURL);
}

/** Google Analytics Integration **/

exports.analytics_form = function(req, res) {
    var select_google_analytics_local = 'SELECT * FROM reports_analytics_pulls ORDER BY ga_created_at DESC LIMIT 1;';
    localdata.query(select_google_analytics_local, function(select_google_analytics_local_err, select_google_analytics_local_res) {
        if (!select_google_analytics_local_err) {
            //Pulled the date of the most recent row in the table; The next pull should be carried out for the next day unless the next day is current, where current is any day within the delay window. 
            var last, now, delay, pull;
            var unixday = 1000 * 60 * 60 * 24;
            //Set delay manually; so if this database shoul not be updated with events more recent than n days ago, set delay to n;
            //Set dealy to 3 days as default.
            delay = 3;
            if (select_google_analytics_local_res[0]) {
                //Get last updated day and generate a timestamp that strictly describes the cuurrent day, month, and year, omitting time in hours, minutes, seconds, milliseconds.
                last = new Date(Date.parse(select_google_analytics_local_res[0]['ga_created_at']));
                last = last.getTime();
            } else {
                last = '2015-06-01';
                last = new Date(last).getTime();
            }
            //Get today and generate a timestamp that strictly describes the cuurrent day, month, and year, omitting time in hours, minutes, seconds, milliseconds.
            now = new Date();
            now = now.getTime();

            //Begin the single day query against Google Analytics
            pull = last;
            pull = new Date(pull);
            if (pull < now - (delay * unixday)) {
                var date = pull.getFullYear() + '-';
                date += ((pull.getMonth() + 1) < 10) ? '0' + (pull.getMonth() + 1) + '-' : (pull.getMonth() + 1) + '-';
                date += (pull.getDate() < 10) ? '0' + pull.getDate() : pull.getDate();
                res.render('reports/gaform', {
                    'date': date,
                    'current': false
                });

            } else {
                res.render('reports/gaform', {
                    'date': null,
                    'current': true
                });
            }
        }
    });
}

exports.analytics_local_recent = function(req, res) {
    var select_analytics_pulls;
    if (req.query.searchterm) {
        if (req.query.email) {
            select_analytics_pulls = "SELECT * FROM reports_analytics_pulls WHERE context = '" + req.query.envtype + "' AND ga_created_at >= '" + req.query.activefrom + "' AND ga_created_at <= '" + req.query.activeto + "T23:59:59' AND category LIKE '%" + req.query.searchterm + "%' AND email LIKE '%" + req.query.email + "%';";
        } else {
            select_analytics_pulls = "SELECT * FROM reports_analytics_pulls WHERE context = '" + req.query.envtype + "' AND ga_created_at >= '" + req.query.activefrom + "' AND ga_created_at <= '" + req.query.activeto + "T23:59:59' AND category LIKE '%" + req.query.searchterm + "%';";
        }
    } else {
        if (req.query.email) {
            select_analytics_pulls = "SELECT * FROM reports_analytics_pulls WHERE context = '" + req.query.envtype + "' AND ga_created_at >= '" + req.query.activefrom + "' AND ga_created_at <= '" + req.query.activeto + "T23:59:59' AND email LIKE '%" + req.query.email + "%';";
        } else {
            select_analytics_pulls = "SELECT * FROM reports_analytics_pulls WHERE context = '" + req.query.envtype + "' AND ga_created_at >= '" + req.query.activefrom + "' AND ga_created_at <= '" + req.query.activeto + "T23:59:59';";
        }
    }
    if (req.query.format == 'table') {
        localdata.query(select_analytics_pulls, function(analytics_pulls_err, analytics_pulls_rows) {
            if (!analytics_pulls_err) {
                var obj = helpers.activityobjga(analytics_pulls_rows);
                var view = helpers.activityga(obj);
                var script = helpers.tableActivityInit(obj);
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

exports.analytics_local_archive = function(req, res) {
    var select_analytics_pulls_archived = "SELECT * FROM reports_analytics_pulls_archived WHERE str_to_date(date, \"%m/%d/%Y\") >= '" + req.query.archivefrom + "' AND str_to_date(date, \"%m/%d/%Y\") <= '" + req.query.archiveto + "';";
    localdata.query(select_analytics_pulls_archived, function(analytics_pulls_archived_err, analytics_pulls_archived_rows) {
        if (!analytics_pulls_archived_err) {
            if (req.query.archiveoutput == 'html') {
                res.render('analytics-web', {
                    'json_out': analytics_pulls_archived_rows,
                    'records': analytics_pulls_archived_rows.length,
                    'description': req.query,
                    'to': req.query.archiveto,
                    'from': req.query.archivefrom
                });
            } else {
                var obj = helpers.activityobj(analytics_pulls_archived_rows);
                var view = helpers.activity(obj);
                var script = helpers.tableActivityInit(obj);
                res.render('reports/result-table', {
                    'json_out': analytics_pulls_archived_rows,
                    'records': analytics_pulls_archived_rows.length,
                    'description': req.query,
                    'to': req.query.archiveto,
                    'from': req.query.archivefrom,
                    'activity': view,
                    'script': script,
                    'obj': obj
                });
            }
        } else {
            console.log('Insert error: ' + analytics_pulls_archived_err.message);
            res.render('error', {
                message: analytics_pulls_archived_err.message,
                error: {}
            });
        }
    });
}

exports.analytics_online = function(req, res) {
    /** Update Userbase **/
    var drop_userbase_table = "DROP TABLE IF EXISTS `reports_live_userbase`";
    var create_userbase_table = "CREATE TABLE `reports_live_userbase` (`id` int(11) NOT NULL AUTO_INCREMENT, `email` varchar(128) DEFAULT NULL, `first` varchar(128) DEFAULT NULL, `last` varchar(128) DEFAULT NULL, `company` varchar(128) DEFAULT NULL, `title` varchar(128) DEFAULT NULL, `phone` varchar(128) DEFAULT NULL, `accredited` int(3) DEFAULT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB AUTO_INCREMENT=4940 DEFAULT CHARSET=latin1;"
    var select_all_members = "SELECT u.user_id AS `userid`, u.username AS `email`, p.firstname AS `first`, p.lastname AS `last`, p.title AS `title`, p.company_name AS `company`, p.phone_primary AS `phone`, p.lastname AS `last`, u.accred AS `accredited` FROM users u LEFT JOIN people p ON u.contacts_id = p.people_id LEFT JOIN investor_profile ip ON u.user_id = ip.user_id GROUP BY username;"
    localdata.query(drop_userbase_table, function(drop_user_table_err) {
        if (!drop_user_table_err) {
            console.log("Userbase table dropped.");
            localdata.query(create_userbase_table, function(create_userbase_table_err) {
                if (!create_userbase_table_err) {
                    console.log("Userbase table created");
                    production.query(select_all_members, function(select_all_members_err, select_all_members_rows) {
                        if (!select_all_members_err) {
                            var i;
                            var all_members = new Array(select_all_members_rows.length);
                            for (i = 0, select_all_members_end = select_all_members_rows.length; i < select_all_members_end; i += 1) {
                                all_members[i] = new Array();
                            }
                            for (i = 0, select_all_members_end = select_all_members_rows.length; i < select_all_members_end; i += 1) {
                                all_members[i].push(select_all_members_rows[i]['email'], select_all_members_rows[i]['first'], select_all_members_rows[i]['last'], select_all_members_rows[i]['title'], select_all_members_rows[i]['company'], select_all_members_rows[i]['phone'], select_all_members_rows[i]['accredited']);
                            }
                            localdata.query('INSERT INTO reports_live_userbase (email, first, last, title, company, phone, accredited) VALUES ?', [all_members], function(insert_all_members_temporary_err) {
                                if (!insert_all_members_temporary_err) {
                                    /** End Update Userbase **/
                                    var oauth2client = apiaccess.google.jwt;
                                    var access_token = '';
                                    oauth2client.authorize(function(oauth_service_err, oauth_service_tokens) {
                                        if (!oauth_service_err) {
                                            access_token = oauth_service_tokens.access_token;
                                            console.log('Service');
                                            console.log(oauth_service_tokens);
                                            var drop_temporary_table = "DROP TABLE IF EXISTS `reports_analytics_live_temp`";
                                            var create_temporary_table = "CREATE TABLE IF NOT EXISTS `reports_analytics_live_temp` (`id` int(11) NOT NULL AUTO_INCREMENT,`email` varchar(256) NOT NULL,`date` varchar(256) NOT NULL,`gaevent` varchar(256) NOT NULL,`referred` varchar(1024) NOT NULL,`city` varchar(256) NOT NULL,`country` varchar(256) NOT NULL,`created_at` datetime DEFAULT NULL,`updated_at` datetime DEFAULT NULL,PRIMARY KEY (`id`)) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1";
                                            res.connection.setTimeout(0);
                                            localdata.query(drop_temporary_table, function(drop_temporary_table_err) {
                                                if (!drop_temporary_table_err) {
                                                    console.log("Temp table dropped.");
                                                    localdata.query(create_temporary_table, function(create_temporary_table_err) {
                                                        if (!create_temporary_table_err) {
                                                            console.log("Temp table created");
                                                            var filterbuild = 'filters=ga:eventLabel!@undefined@dealflow.com;ga:eventLabel=~@&';
                                                            var call = '/analytics/v3/data/ga?ids=ga:91861126&start-date=' + req.query.livefrom + '&end-date=' + req.query.liveto + '&metrics=ga:totalEvents&dimensions=ga:eventLabel,ga:eventCategory,ga:dateHour,ga:fullReferrer,ga:country,ga:city,ga:minute&' + filterbuild + 'access_token=' + access_token + '&max-results=10000';
                                                            //var call = '/analytics/v3/data/ga?ids=ga:91861126&start-date=' + req.query.livefrom  + '&end-date=' + req.query.liveto + '&metrics=ga:totalEvents&dimensions=ga:eventLabel,ga:dimension4,ga:eventCategory,ga:country,ga:region,ga:city,ga:dimension3' + filterbuild + '&access_token=' + access_token + '&max-results=10000';
                                                            console.log('https://www.googleapis.com' + call);
                                                            var body;
                                                            var options = {
                                                                host: 'www.googleapis.com',
                                                                port: 443,
                                                                path: call
                                                            };
                                                            https.get(options, function(get_google_analytics_data_res) {
                                                                get_google_analytics_data_res.on('data', function(d) {
                                                                    body += d;
                                                                });
                                                                get_google_analytics_data_res.on('end', function() {
                                                                    console.log("Complete");
                                                                    var report = JSON.parse(body.substr(9));
                                                                    console.log(report.rows);
                                                                    var i, n, results;
                                                                    var url = false;
                                                                    var removed = new Array();
                                                                    if (report.rows) {
                                                                        results = report.rows.slice(0);
                                                                        n = report.rows.length;
                                                                    }
                                                                    for (i = 0; i < n; i += 1) {
                                                                        if (results[i][1].indexOf('/') === 0) {
                                                                            results[i][1] = helpers.convertviewed(results[i][1]);
                                                                        }
                                                                        if (results[i][0].indexOf('@') !== -1) {
                                                                            results[i][0] = helpers.convertemail(results[i][0]);
                                                                        }
                                                                    }
                                                                    for (i = 0; i < n; i += 1) {
                                                                        results[i][2] = results[i][2].slice(4, 6) + '/' + results[i][2].slice(6, 8) + '/' + results[i][2].slice(0, 4) + '  ' + results[i][2].slice(8) + ':' + results[i][6];
                                                                    }
                                                                    var google_analytics_data = new Array(n);
                                                                    for (i = 0; i < n; i += 1) {
                                                                        google_analytics_data[i] = new Array();
                                                                    }
                                                                    for (i = 0; i < n; i += 1) {
                                                                        google_analytics_data[i].push(results[i][0], results[i][2], results[i][1], results[i][3], results[i][5], results[i][4]);
                                                                    }
                                                                    localdata.query('INSERT INTO reports_analytics_live_temp (email, date, gaevent, referred, city, country) VALUES ?', [google_analytics_data], function(insert_google_analytics_temporary_err, insert_google_analytics_temporary_res) {
                                                                        if (!insert_google_analytics_temporary_err) {
                                                                            var select_report_results = "SELECT an.email, an.date, an.gaevent, us.first, us.last, us.company, us.title, us.phone, an.referred, an.city, an.country, us.accredited FROM reports_live_userbase AS us LEFT JOIN reports_analytics_live_temp AS an ON us.email = an.email WHERE an.email IS NOT NULL;";
                                                                            localdata.query(select_report_results, function(select_report_results_err, select_report_results_rows) {
                                                                                if (!select_report_results_err) {
                                                                                    var obj = helpers.activityobj(select_report_results_rows);
                                                                                    var view = helpers.activity(obj);
                                                                                    var script = helpers.tableActivityInit(obj);
                                                                                    res.render('reports/result-table', {
                                                                                        'json_out': select_report_results_rows,
                                                                                        'records': select_report_results_rows.length,
                                                                                        'description': req.query,
                                                                                        'totals': report.totalResults,
                                                                                        'to': req.query.webto,
                                                                                        'from': req.query.webfrom,
                                                                                        'url': url,
                                                                                        'activity': view,
                                                                                        'script': script,
                                                                                        'obj': obj
                                                                                    });
                                                                                } else {
                                                                                    console.log('Insert error: ' + select_report_results_err.message);
                                                                                    res.status(select_report_results_err.status || 500);
                                                                                    res.render('error', {
                                                                                        message: select_report_results_err.message,
                                                                                        error: {}
                                                                                    });
                                                                                } //End 9 Full Select Accross Userbase and Temp
                                                                            });
                                                                        } else {
                                                                            console.log('Insert error: ' + insert_google_analytics_temporary_err.message);
                                                                            res.status(insert_google_analytics_temporary_err.status || 500);
                                                                            res.render('error', {
                                                                                message: insert_google_analytics_temporary_err.message,
                                                                                error: {}
                                                                            });
                                                                        }
                                                                    }); //End 8 Insert into Temp
                                                                }).on("error", function(get_google_analytics_data_err) {
                                                                    console.log("Got error: " + get_google_analytics_data_err.message);
                                                                    res.status(get_google_analytics_data_err.status || 500);
                                                                    res.render('error', {
                                                                        message: get_google_analytics_data_err.message,
                                                                        error: {}
                                                                    });
                                                                }); //End 7 GA API call
                                                            });
                                                        } else {
                                                            console.log("Error: " + create_temporary_table_err.message);
                                                            res.status(create_temporary_table_err.status || 500);
                                                            res.render('error', {
                                                                message: create_temporary_table_err.message,
                                                                error: {}
                                                            });
                                                        }
                                                    }); //End 6 Create Temp

                                                } else {
                                                    console.log("Userbase Insert Error");
                                                    console.log("Error: " + drop_temporary_table_err.message)
                                                    res.status(drop_temporary_table_err.status || 500);
                                                    res.render('error', {
                                                        message: drop_temporary_table_err.message,
                                                        error: {}
                                                    });
                                                }
                                            }); //End 5 Drop Temp
                                        } else {
                                            console.log("Google Authentication Failed");
                                            console.log("Error: " + insert_all_members_temporary_err.message);
                                            res.status(insert_all_members_temporary_err.status || 500);
                                            res.render('error', {
                                                message: insert_all_members_temporary_err.message,
                                                error: {}
                                            });
                                        }
                                    });//Google Auth
                                } else {
                                    console.log("Userbase Insert Error");
                                    console.log("Error: " + oauth_service_err.message);
                                    res.status(oauth_service_err.status || 500);
                                    res.render('error', {
                                        message: oauth_service_err.message,
                                        error: {}
                                    });
                                }
                            }); //End 4 Userbase Insert
                        } else {
                            console.log("Select Userbase from Production");
                            console.log("Error: " + select_all_members_err.message);
                            res.status(select_all_members_err.status || 500);
                            res.render('error', {
                                message: select_all_members_err.message,
                                error: {}
                            });
                        }
                    }); //End 3 Production Select

                } else {
                    console.log("Userbase Create Table Error");
                    console.log("Error: " + create_userbase_table_err.message);
                    res.status(create_userbase_table_err.status || 500);
                    res.render('error', {
                        message: create_userbase_table_err.message,
                        error: {}
                    });
                }
            }); //End 2 Create Userbase Table
        } else {
            console.log("Userbase Drop Table Error");
            console.log("Error: " + drop_user_table_err.message);
            res.status(drop_user_table_err.status || 500);
            res.render('error', {
                message: drop_user_table_err.message,
                error: {}
            });
        }
    }); //End 1 Drop Userbase Table
}