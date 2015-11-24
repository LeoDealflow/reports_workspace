var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var http = require('http');
var https = require('https');
var url = require('url');
var environment = require('../../config/connect/environment');

/** Data Store Initialization **/
var localdata = environment.datastores.main;
var production = environment.datastores.dealflow;
var marcom = environment.datastores.marcom;
var client = environment.datastores.elastic;

exports.task_move_events_local = function(req, res) {
    var select_check_events_management = 'SELECT * FROM marketing_sendgrid_events ORDER BY dealflow_id DESC LIMIT 1;';
    localdata.query(select_check_events_management, function(err_select_check_events_production, rows_select_check_events_production, fields_select_check_events_production) {
        if (!err_select_check_events_production) {
            var inserted_events = new Array();
            if (rows_select_check_events_production[0]) {
                from = rows_select_check_events_production[0]['dealflow_id']
                select_events_production = 'SELECT * FROM sendgridevents WHERE id > ' + from + ' ORDER BY id ASC LIMIT 5000;';
            } else {
                select_events_production = 'SELECT * FROM sendgridevents WHERE create_at >= "2015-08-01" ORDER BY id ASC LIMIT 5000;';
            }
            production.query(select_events_production, function(err_select_events_production, rows_select_events_production, fields_select_events_production) {
                if (!err_select_events_production) {
                    if (rows_select_events_production.length != 0) {
                        console.log('Result Totals: ' + rows_select_events_production.length)
                        var insert_sendgrid_events = new Array()
                        for (var i = 0, end_i = rows_select_events_production.length; i < end_i; i++) {
                            var event_string = rows_select_events_production[i]['message'];
                            var user_id = rows_select_events_production[i]['user_id'];
                            var dealflow_id = rows_select_events_production[i]['id'];
                            var sendgrid_created_at = rows_select_events_production[i]['create_at'];
                            var event_json = JSON.parse(event_string);
                            if (event_json) {
                                if (!event_json['ip']) {
                                    event_json['ip'] = null;
                                } else {
                                    event_json['ip'] = '' + event_json['ip'];
                                }
                                if (!event_json['sg_message_id']) {
                                    event_json['sg_message_id'] = null;
                                } else {
                                    event_json['sg_message_id'] = '' + event_json['sg_message_id']
                                }
                                if (!event_json['useragent']) {
                                    event_json['useragent'] = null;
                                } else {
                                    event_json['useragent'] = '' + event_json['useragent'];
                                }
                                if (!event_json['event']) {
                                    event_json['event'] = null;
                                } else {
                                    event_json['event'] = '' + event_json['event'];
                                }
                                if (!event_json['email']) {
                                    event_json['email'] = null;
                                } else {
                                    event_json['email'] = '' + event_json['email'];
                                }
                                if (!event_json['timestamp']) {
                                    event_json['timestamp'] = null;
                                } else {
                                    event_json['timestamp'] = '' + event_json['timestamp'];
                                }
                                if (!event_json['category']) {
                                    event_json['category'] = null;
                                } else {
                                    var categories = '';
                                    for (var j = 0, end_j = event_json['category'].length; j < end_j; j++) {
                                        if (j + 1 != end_j)
                                            categories += event_json['category'][j] + ', ';
                                        else
                                            categories += event_json['category'][j];
                                    }
                                    event_json['category'] = categories;
                                }
                                if (!event_json['newsletter']) {
                                    event_json['newsletter'] = {
                                        "newsletter_user_list_id": null,
                                        "newsletter_id": null,
                                        "newsletter_send_id": null
                                    }
                                }
                            } else {
                                event_json = {
                                    "ip": null,
                                    "sg_message_id": null,
                                    "useragent": null,
                                    "event": null,
                                    "email": null,
                                    "timestamp": null,
                                    "category": null,
                                    "newsletter": {
                                        "newsletter_user_list_id": null,
                                        "newsletter_id": null,
                                        "newsletter_send_id": null
                                    },
                                    "user_id": null
                                }
                            }
                            insert_sendgrid_events.push(new Array(event_json['ip'], dealflow_id, event_json['sg_message_id'], event_json['useragent'], event_json['event'], event_json['email'], event_json['timestamp'], sendgrid_created_at, sendgrid_created_at, event_json['category'], event_json['newsletter']['newsletter_user_list_id'], event_json['newsletter']['newsletter_id'], event_json['newsletter']['newsletter_send_id'], user_id));
                        }
                        var insert_event_management = 'INSERT INTO marketing_sendgrid_events (ip, dealflow_id, sg_message_id, useragent, event, email, timestamp, sendgrid_created_at, pulls_complete_to, category, newsletters_user_list_id, newsletter_id, newsletter_send_id, user_id) VALUES ?';
                        localdata.query(insert_event_management, [insert_sendgrid_events], function(err_insert_event_management, rows_insert_event_management, fields_insert_event_management) {
                            if (!err_insert_event_management) {
                                console.log('Events from: ' + select_events_production + ' Saved Locally');
                            } else {
                                console.log('Error with ' + insert_event_management + ':' + err_insert_event_management);
                            }
                        });
                    } else {
                        console.log('Local sendgrid data is up to date.');
                    }
                } else {
                    console.log('Error with ' + select_events_production + ':' + err_select_events_production);
                }
            });
        } else {
            console.log('Error with ' + select_check_events_production + ':' + err_select_check_events_production.message);
        }
    });
}



exports.task_update_sendgrid_pulls = function(req, res) {
    console.log('Update Sendgrid Pulls Started!');
    var select_sendgrid_events_local = 'SELECT * FROM reports_sendgrid_pulls ORDER BY sendgrid_events_id DESC LIMIT 1;';
    localdata.query(select_sendgrid_events_local, function(select_sendgrid_events_local_err, select_sendgrid_events_local_rows) {
        if (!select_sendgrid_events_local_err) {
            var position_id = select_sendgrid_events_local_rows[0] ? select_sendgrid_events_local_rows[0]['sendgrid_events_id'] : 0;
            //Creating Bulk Insert Array
            console.log(position_id);
            var drop_userbase_table = "DROP TABLE IF EXISTS `marketing_userbase`";
            var create_userbase_table = "CREATE TABLE `marketing_userbase` (`id` int(11) NOT NULL AUTO_INCREMENT, `userid` varchar(128) DEFAULT NULL, `email` varchar(128) DEFAULT NULL, `first` varchar(128) DEFAULT NULL, `last` varchar(128) DEFAULT NULL, `company` varchar(128) DEFAULT NULL, `title` varchar(128) DEFAULT NULL, `phone` varchar(128) DEFAULT NULL, `accredited` int(3) DEFAULT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB AUTO_INCREMENT=4940 DEFAULT CHARSET=latin1;"
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
                                    localdata.query('INSERT INTO marketing_userbase (userid, email, first, last, title, company, phone, accredited) VALUES ?', [all_members], function(insert_all_members_temporary_err) {
                                        if (!insert_all_members_temporary_err) {
                                            console.log("Userbase table populated");
                                            var drop_marketing_sendgrid_temp_table = "DROP TABLE IF EXISTS `marketing_sendgrid_events_temp`;";
                                            var create_marketing_sendgrid_temp_table = "CREATE TABLE `marketing_sendgrid_events_temp` (`id` INT NOT NULL AUTO_INCREMENT, `sg_id` INT NOT NULL, `dealflow_id` INT NOT NULL, `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `ip` VARCHAR(256) NULL, `sg_message_id` VARCHAR(256) NULL, `useragent` VARCHAR(3072) NULL, `event` VARCHAR(256) NULL, `email` VARCHAR(256) NULL, `timestamp` VARCHAR(256) NULL, `sendgrid_created_at` VARCHAR(256) NULL, `pulls_complete_to` VARCHAR(256) NULL, `category` VARCHAR(1024) NULL, `newsletters_user_list_id` VARCHAR(256) NULL, `newsletter_id` VARCHAR(256) NULL, `newsletter_send_id` VARCHAR(256) NULL, `user_id` VARCHAR(256) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;"
                                            localdata.query(drop_marketing_sendgrid_temp_table, function(drop_marketing_sendgrid_temp_table_err) {
                                                if (!drop_marketing_sendgrid_temp_table_err) {
                                                    console.log("Sendgrid Temp table dropped.");
                                                    localdata.query(create_marketing_sendgrid_temp_table, function(create_marketing_sendgrid_temp_err) {
                                                        if (!create_marketing_sendgrid_temp_err) {
                                                            console.log("Sendgrid Temp table created.");
                                                            var select_sendgrid_events_temp = "SELECT * FROM marketing_sendgrid_events WHERE email IS NOT NULL AND id > '" + position_id + "' ORDER BY id ASC LIMIT 5000;";
                                                            localdata.query(select_sendgrid_events_temp, function(select_sendgrid_events_temp_err, select_sendgrid_events_temp_rows) {
                                                                if (!select_sendgrid_events_temp_err) {
                                                                    var i;
                                                                    var sendgrid_events_temp = new Array(select_sendgrid_events_temp_rows.length);
                                                                    for (i = 0, sendgrid_data_end = select_sendgrid_events_temp_rows.length; i < sendgrid_data_end; i += 1) {
                                                                        sendgrid_events_temp[i] = new Array();
                                                                    }
                                                                    for (i = 0, sendgrid_data_end = select_sendgrid_events_temp_rows.length; i < sendgrid_data_end; i += 1) {
                                                                        sendgrid_events_temp[i].push(
                                                                            select_sendgrid_events_temp_rows[i]['id'],
                                                                            select_sendgrid_events_temp_rows[i]['dealflow_id'],
                                                                            select_sendgrid_events_temp_rows[i]['ip'],
                                                                            select_sendgrid_events_temp_rows[i]['sg_message_id'],
                                                                            select_sendgrid_events_temp_rows[i]['useragent'],
                                                                            select_sendgrid_events_temp_rows[i]['event'],
                                                                            select_sendgrid_events_temp_rows[i]['email'],
                                                                            select_sendgrid_events_temp_rows[i]['timestamp'],
                                                                            select_sendgrid_events_temp_rows[i]['sendgrid_created_at'],
                                                                            select_sendgrid_events_temp_rows[i]['pulls_complete_to'],
                                                                            select_sendgrid_events_temp_rows[i]['category'],
                                                                            select_sendgrid_events_temp_rows[i]['newsletters_user_list_id'],
                                                                            select_sendgrid_events_temp_rows[i]['newsletter_id'],
                                                                            select_sendgrid_events_temp_rows[i]['newsletter_send_id'],
                                                                            select_sendgrid_events_temp_rows[i]['user_id']
                                                                        );
                                                                    }
                                                                    console.log("Sendgrid Temp Data selected.");
                                                                    if (select_sendgrid_events_temp_rows.length != 0) {
                                                                        var insert_sendgrid_events_temp = 'INSERT INTO marketing_sendgrid_events_temp (sg_id, dealflow_id, ip, sg_message_id, useragent, event, email, timestamp, sendgrid_created_at, pulls_complete_to, category, newsletters_user_list_id, newsletter_id, newsletter_send_id, user_id) VALUES ?';
                                                                        localdata.query(insert_sendgrid_events_temp, [sendgrid_events_temp], function(insert_sendgrid_events_temp_err, insert_sendgrid_events_temp_rows) {
                                                                            if (!insert_sendgrid_events_temp_err) {
                                                                                var select_sendgrid_augmented_data = "SELECT sg.sg_id AS sendgrid_events_id, us.userid, sg.email, sg.event, sg.category, sg.ip, sg.useragent, sg.created_at, sg.sendgrid_created_at, sg.sg_message_id, sg.newsletter_id, sg.newsletters_user_list_id, sg.newsletter_send_id, us.first, us.last, us.company, us.title, us.phone, us.accredited FROM marketing_userbase AS us INNER JOIN marketing_sendgrid_events_temp AS sg ON us.userid = sg.user_id WHERE sg.email IS NOT NULL ORDER BY sg.id ASC;";
                                                                                localdata.query(select_sendgrid_augmented_data, function(select_sendgrid_augmented_data_err, select_sendgrid_augmented_data_rows) {
                                                                                    if (!select_sendgrid_augmented_data_err) {
                                                                                        var i;
                                                                                        var sendgrid_augmented_data = new Array(select_sendgrid_augmented_data_rows.length);
                                                                                        for (i = 0, sendgrid_data_end = select_sendgrid_augmented_data_rows.length; i < sendgrid_data_end; i += 1) {
                                                                                            sendgrid_augmented_data[i] = new Array();
                                                                                        }
                                                                                        for (i = 0, sendgrid_data_end = select_sendgrid_augmented_data_rows.length; i < sendgrid_data_end; i += 1) {
                                                                                            sendgrid_augmented_data[i].push(
                                                                                                select_sendgrid_augmented_data_rows[i]['sendgrid_events_id'],
                                                                                                select_sendgrid_augmented_data_rows[i]['userid'],
                                                                                                select_sendgrid_augmented_data_rows[i]['email'],
                                                                                                select_sendgrid_augmented_data_rows[i]['event'],
                                                                                                select_sendgrid_augmented_data_rows[i]['category'],
                                                                                                select_sendgrid_augmented_data_rows[i]['ip'],
                                                                                                select_sendgrid_augmented_data_rows[i]['useragent'],
                                                                                                select_sendgrid_augmented_data_rows[i]['sendgrid_created_at'],
                                                                                                select_sendgrid_augmented_data_rows[i]['sg_message_id'],
                                                                                                select_sendgrid_augmented_data_rows[i]['newsletter_id'],
                                                                                                select_sendgrid_augmented_data_rows[i]['newsletters_user_list_id'],
                                                                                                select_sendgrid_augmented_data_rows[i]['newsletter_send_id'],
                                                                                                select_sendgrid_augmented_data_rows[i]['first'],
                                                                                                select_sendgrid_augmented_data_rows[i]['last'],
                                                                                                select_sendgrid_augmented_data_rows[i]['company'],
                                                                                                select_sendgrid_augmented_data_rows[i]['title'],
                                                                                                select_sendgrid_augmented_data_rows[i]['phone'],
                                                                                                select_sendgrid_augmented_data_rows[i]['accredited']
                                                                                            );
                                                                                        }
                                                                                        localdata.query('INSERT INTO reports_sendgrid_pulls (sendgrid_events_id, userid, email, event, category, ip, useragent, sendgrid_created_at, message_id, newsletter_id, newsletter_list_id, newsletter_send_id, first, last, company, title, phone, accredited) VALUES ?', [sendgrid_augmented_data], function(insert_sendgrid_augmented_data_local_err, insert_sendgrid_augmented_data_local_rows) {

                                                                                            if (!insert_sendgrid_augmented_data_local_err) {
                                                                                                console.log('Update Sendgrid Pulls Complete!');

                                                                                            } else {
                                                                                                console.log('Sendgrid Pulls Insert Error: ' + insert_sendgrid_augmented_data_local_err.message);

                                                                                            }
                                                                                        }); //End 8 Insert into Temp
                                                                                    } else {
                                                                                        console.log("Error: " + select_sendgrid_augmented_data_err.message);
                                                                                    }
                                                                                }); //End 
                                                                            } else {
                                                                                console.log("Sendgrid Insert Temp Data Error");
                                                                                console.log("Error: " + insert_sendgrid_events_temp_err.message);
                                                                            } //End Insert Sendgrid Temp Data

                                                                        }); //End Insert Events Temp
                                                                    } else {
                                                                        console.log("Sendgrid Data Up to Date");
                                                                    }
                                                                } else {
                                                                    console.log("Sendgrid Temp Data Select Error");
                                                                    console.log("Error: " + select_sendgrid_events_temp_err.message);
                                                                } //End & Select Sendgrid Temp Data
                                                            });
                                                        } else {
                                                            console.log("Sendgrid Temp Create Table Error");
                                                            console.log("Error: " + create_userbase_table_err.message);
                                                        }
                                                    }); //End Sendgrid Temp Create
                                                } else {
                                                    console.log("Sendgrid Temp Drop Table Error");
                                                    console.log("Error: " + drop_userbase_table_err.message);
                                                }
                                            }); //End Sendgrid Temp Drop
                                        } else {
                                            console.log("Userbase Insert Error");
                                            console.log("Error: " + insert_all_members_temporary_err.message);
                                        }
                                    }); //End 4 Userbase Insert
                                } else {
                                    console.log("Select Userbase from Production");
                                    console.log("Error: " + select_all_members_err.message);
                                }
                            }); //End 3 Production Select
                        } else {
                            console.log("Userbase Create Table Error");
                            console.log("Error: " + create_userbase_table_err.message);
                        }
                    }); //End 2 Create Userbase Table
                } else {
                    console.log("Userbase Drop Table Error");
                    console.log("Error: " + drop_userbase_table_err.message);
                }
            }); //End 1 Drop Userbase Table

        }
    });
}