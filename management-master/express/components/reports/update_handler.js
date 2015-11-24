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



exports.update_google_analytics_pulls = function(req, res) {

    console.log('Update Google Analytics Started!');
    var oauth2client = apiaccess.google.jwt;
    var access_token = '';
    oauth2client.authorize(function(oauth_service_err, oauth_service_tokens) {
        if (!oauth_service_err) {
            access_token = oauth_service_tokens.access_token;
            var select_google_analytics_local = 'SELECT * FROM reports_analytics_pulls_core ORDER BY pull_date DESC LIMIT 1;';
            localdata.query(select_google_analytics_local, function(select_google_analytics_local_err, select_google_analytics_local_res) {
                if (!select_google_analytics_local_err) {
                    //Pulled the date of the most recent row in the table; The next pull should be carried out for the next day unless the next day is current, where current is any day within the delay window. 
                    var last, now, delay, pull;
                    var unixday = 1000 * 60 * 60 * 24;
                    //Set delay manually; so if this database shoul not be updated with events more recent than n days ago, set delay to n;
                    //Set dealy to 3 days as default.
                    delay = 1;
                    if (select_google_analytics_local_res[0]) {
                        //Get last updated day and generate a timestamp that strictly describes the cuurrent day, month, and year, omitting time in hours, minutes, seconds, milliseconds.
                        last = new Date(select_google_analytics_local_res[0]['pull_date']);
                        last = last.getTime();
                    } else {
                        last = '2015-05-31';
                        last = new Date(last).getTime();
                    }
                    //Get today and generate a timestamp that strictly describes the current day, month, and year, omitting time in hours, minutes, seconds, milliseconds.
                    var now = new Date();
                    var today = now.getFullYear() + '-';
                    today += ((now.getMonth() + 1) < 10) ? '0' + (now.getMonth() + 1) + '-' : (now.getMonth() + 1) + '-';
                    today += (now.getDate() < 10) ? '0' + now.getDate() : now.getDate();
                    today = new Date(today);
                    today = today.getTime();
                    //Begin the single day query against Google Analytics

                    pull = last + unixday;
                    if (pull < today - (delay * unixday)) {
                        pull = new Date(pull);
                        var date = pull.getFullYear() + '-';
                        date += ((pull.getMonth() + 1) < 10) ? '0' + (pull.getMonth() + 1) + '-' : (pull.getMonth() + 1) + '-';
                        date += (pull.getDate() < 10) ? '0' + pull.getDate() : pull.getDate();
                        console.log('Date pulled: ' + date);
                        var filterbuild = '&filters=ga:eventLabel!@undefined@dealflow.com;ga:eventLabel=~@';
                        var call = '/analytics/v3/data/ga?ids=ga:91861126&start-date=' + date + '&end-date=' + date + '&metrics=ga:totalEvents&dimensions=ga:eventLabel,ga:dimension4,ga:eventCategory,ga:country,ga:region,ga:city,ga:dimension3' + filterbuild + '&access_token=' + access_token + '&max-results=10000';
                        var options = {
                            host: 'www.googleapis.com',
                            port: 443,
                            path: call
                        };
                        var body, report, results;
                        var i, n;
                        console.log('https://www.googleapis.com/' + call);
                        https.get(options, function(get_google_analytics_data_res) {
                            get_google_analytics_data_res.on('data', function(d) {
                                body += d;
                            });
                            get_google_analytics_data_res.on('end', function() {
                                report = JSON.parse(body.substr(9));
                                var url = false;
                                var removed = new Array();
                                if (report.rows) {
                                    results = report.rows.slice(0);
                                    n = report.rows.length;
                                    for (i = 0; i < n; i += 1) {

                                        //Formatiing Label/Email
                                        if (results[i][0].indexOf('@') !== -1) {
                                            results[i][0] = helpers.convertemail(results[i][0]);
                                        }

                                        //Formatting Event Date
                                        var iso = new Date(results[i][1]).toISOString()
                                        results[i][1] = iso;

                                        //Formatting Category/Event
                                        if (results[i][2].indexOf('/') === 0) {
                                            results[i][2] = helpers.convertviewed(results[i][2]);
                                        }
                                    }

                                    //Creating Bulk Insert Array
                                    var google_analytics_data = new Array(results.length);
                                    for (i = 0; i < results.length; i += 1) {
                                        google_analytics_data[i] = new Array();
                                    }
                                    for (i = 0; i < results.length; i += 1) {
                                        google_analytics_data[i].push(results[i][0], results[i][1], date, results[i][2], results[i][3], results[i][4], results[i][5], results[i][6]);
                                    }

                                    //Inserting Events
                                    localdata.query('INSERT INTO reports_analytics_pulls_core (email, ga_created_at, pull_date, category, country, region, city, context) VALUES ?', [google_analytics_data], function(insert_google_analytics_local_err, insert_google_analytics_local_res) {
                                        if (!insert_google_analytics_local_err) {
                                            var drop_userbase_table = "DROP TABLE IF EXISTS `reports_userbase`";
                                            var create_userbase_table = "CREATE TABLE `reports_userbase` (`id` int(11) NOT NULL AUTO_INCREMENT, `userid` varchar(128) DEFAULT NULL, `email` varchar(128) DEFAULT NULL, `first` varchar(128) DEFAULT NULL, `last` varchar(128) DEFAULT NULL, `company` varchar(128) DEFAULT NULL, `title` varchar(128) DEFAULT NULL, `phone` varchar(128) DEFAULT NULL, `accredited` int(3) DEFAULT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB AUTO_INCREMENT=4940 DEFAULT CHARSET=latin1;"
                                            var select_all_members = "SELECT u.user_id AS `userid`, u.username AS `email`, p.firstname AS `first`, p.lastname AS `last`, p.title AS `title`, p.company_name AS `company`, p.phone_primary AS `phone`, p.lastname AS `last`, u.accred AS `accredited` FROM users u LEFT JOIN people p ON u.contacts_id = p.people_id LEFT JOIN investor_profile ip ON u.user_id = ip.user_id GROUP BY username;"
                                            localdata.query(drop_userbase_table, function(drop_userbase_table_err) {
                                                if (!drop_userbase_table_err) {
                                                    console.log("Userbase table dropped.");
                                                    localdata.query(create_userbase_table, function(create_userbase_table_err) {
                                                        if (!create_userbase_table_err) {
                                                            console.log("Userbase table created");
                                                            production.query(select_all_members, function(select_all_members_err, select_all_members_rows) {
                                                                if (!select_all_members_err) {
                                                                    var all_members = new Array(select_all_members_rows.length);
                                                                    for (var i = 0, select_all_members_end = select_all_members_rows.length; i < select_all_members_end; i += 1) {
                                                                        all_members[i] = new Array();
                                                                    }
                                                                    for (var i = 0, select_all_members_end = select_all_members_rows.length; i < select_all_members_end; i += 1) {
                                                                        all_members[i].push(select_all_members_rows[i]['userid'], select_all_members_rows[i]['email'].toLowerCase(), select_all_members_rows[i]['first'], select_all_members_rows[i]['last'], select_all_members_rows[i]['title'], select_all_members_rows[i]['company'], select_all_members_rows[i]['phone'], select_all_members_rows[i]['accredited']);
                                                                    }
                                                                    localdata.query('INSERT INTO reports_userbase (userid, email, first, last, title, company, phone, accredited) VALUES ?', [all_members], function(insert_all_members_temporary_err) {
                                                                        if (!insert_all_members_temporary_err) {
                                                                            var select_google_analytics_augmented_data = "SELECT us.userid, an.email, an.ga_created_at, an.category, us.first, us.last, us.company, us.title, us.phone, an.country, an.region, an.city, an.context, us.accredited FROM reports_userbase AS us LEFT JOIN reports_analytics_pulls_core AS an ON us.email = an.email WHERE an.email IS NOT NULL AND an.pull_date = '" + date + "' ORDER BY an.id DESC;";
                                                                            localdata.query(select_google_analytics_augmented_data, function(select_google_analytics_augmented_data_err, select_google_analytics_augmented_data_rows) {
                                                                                if (!select_google_analytics_augmented_data_err) {
                                                                                    var i;
                                                                                    var google_analytics_augmented_data = new Array(select_google_analytics_augmented_data_rows.length);
                                                                                    for (i = 0, select_google_analytics_augmented_data_end = select_google_analytics_augmented_data_rows.length; i < select_google_analytics_augmented_data_end; i += 1) {
                                                                                        google_analytics_augmented_data[i] = new Array();
                                                                                    }
                                                                                    for (i = 0, select_google_analytics_augmented_data_end = select_google_analytics_augmented_data_rows.length; i < select_google_analytics_augmented_data_end; i += 1) {
                                                                                        google_analytics_augmented_data[i].push(select_google_analytics_augmented_data_rows[i]['userid'], select_google_analytics_augmented_data_rows[i]['email'], select_google_analytics_augmented_data_rows[i]['ga_created_at'], select_google_analytics_augmented_data_rows[i]['category'], select_google_analytics_augmented_data_rows[i]['first'], select_google_analytics_augmented_data_rows[i]['last'], select_google_analytics_augmented_data_rows[i]['company'], select_google_analytics_augmented_data_rows[i]['title'], select_google_analytics_augmented_data_rows[i]['phone'], select_google_analytics_augmented_data_rows[i]['country'], select_google_analytics_augmented_data_rows[i]['region'], select_google_analytics_augmented_data_rows[i]['city'], select_google_analytics_augmented_data_rows[i]['context'], select_google_analytics_augmented_data_rows[i]['accredited']);
                                                                                    }
                                                                                    localdata.query('INSERT INTO reports_analytics_pulls (userid, email, ga_created_at, category, first, last, company, title, phone, country, region, city, context, accredited) VALUES ?', [google_analytics_augmented_data], function(insert_google_analytics_augmented_data_local_err, insert_google_analytics_augmented_data_local_res) {
                                                                                        if (!insert_google_analytics_augmented_data_local_err) {
                                                                                            console.log('Update Google Analytics complete!');
                                                                                            /**
                                                                                            res.render('reports/updated', {
                                                                                                'date': date,
                                                                                                'current': false
                                                                                            });
                                                                                            **/
                                                                                        } else {
                                                                                            console.log('Google Analytics Insert Error: ' + insert_google_analytics_augmented_data_local_err.message);
                                                                                            /**
                                                                                            res.status(insert_google_analytics_augmented_data_local_err.status || 500);
                                                                                            res.render('error', {
                                                                                                message: insert_google_analytics_augmented_data_local_err.message,
                                                                                                error: {}
                                                                                            });
                                                                                            **/
                                                                                        }
                                                                                    }); //End 8 Insert into Temp
                                                                                } else {
                                                                                    console.log("Error: " + select_google_analytics_augmented_data_err.message);
                                                                                    /**
                                                                                    res.status(select_google_analytics_augmented_data_errr.status || 500);
                                                                                    res.render('error', {
                                                                                        message: select_google_analytics_augmented_data_err.message,
                                                                                        error: {}
                                                                                    });
                                                                                    **/
                                                                                }
                                                                            }); //End & Select All from local analytics pull 
                                                                        } else {
                                                                            console.log("Userbase Insert Error");
                                                                            console.log("Error: " + insert_all_members_temporary_err.message);
                                                                            /**
                                                                            res.status(insert_all_members_temporary_err.status || 500);
                                                                            res.render('error', {
                                                                                message: insert_all_members_temporary_err.message,
                                                                                error: {}
                                                                            });
                                                                            **/
                                                                        }
                                                                    }); //End 4 Userbase Insert
                                                                } else {
                                                                    console.log("Select Userbase from Production");
                                                                    console.log("Error: " + select_all_members_err.message);
                                                                    /**
                                                                    res.status(select_all_members_err.status || 500);
                                                                    res.render('error', {
                                                                        message: select_all_members_err.message,
                                                                        error: {}
                                                                    });
                                                                    **/
                                                                }
                                                            }); //End 3 Production Select
                                                        } else {
                                                            console.log("Userbase Create Table Error");
                                                            console.log("Error: " + create_userbase_table_err.message);
                                                            /**
                                                            res.status(create_userbase_table_err.status || 500);
                                                            res.render('error', {
                                                                message: create_userbase_table_err.message,
                                                                error: {}
                                                            });
                                                            **/
                                                        }
                                                    }); //End 2 Create Userbase Table
                                                } else {
                                                    console.log("Userbase Drop Table Error");
                                                    console.log("Error: " + drop_userbase_table_err.message);
                                                    /**
                                                    res.status(drop_userbase_table_err.status || 500);
                                                    res.render('error', {
                                                        message: drop_userbase_table_err.message,
                                                        error: {}
                                                    });
                                                    **/
                                                }
                                            }); //End 1 Drop Userbase Table

                                        } else {
                                            console.log('Insert error: ' + google_analytics_data.email + ' ' + insert_google_analytics_local_err.message);
                                            /**
                                            res.status(insert_google_analytics_local_err.status || 500);
                                            res.render('error', {
                                                message: insert_google_analytics_local_err.message,
                                                error: {}
                                            });
                                            **/
                                        }

                                    });
                                } else {
                                    results = report;
                                }
                            });
                        }).on("error", function(get_google_analytics_data_err) {
                            console.log("Got error: " + get_google_analytics_data_err.message);
                            /**
                            res.status(get_google_analytics_data_err.status || 500);
                            res.render('error', {
                                message: get_google_analytics_data_err.message,
                                error: {}
                            });
                            **/
                        });
                    } else {
                        console.log('Google Analytics Up to Date!');
                        /**
                        res.render('reports/updated', {
                            'date': null,
                            'current': true
                        });
                        **/
                    }
                } else {
                    console.log('Select error: ' + select_google_analytics_local_err.message);
                    /**
                    res.status(insert_google_analytics_local_err.status || 500);
                    res.render('error', {
                        message: insert_google_analytics_local_err.message,
                        error: {}
                    });
                    **/
                }
            });
        } else {
            console.log('Google API Authorization Err: ' + err.message);
        }
    });

}