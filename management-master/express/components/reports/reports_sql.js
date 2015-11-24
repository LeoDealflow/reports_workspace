var express = require('express');
var router = express.Router();
var stringify = require('csv-stringify');
var sys = require('sys')
var exec = require('child_process').exec;
var https = require('https');
var url = require('url');
var environment = require('../../config/connect/environment');
var apiaccess = require('../../config/apiaccess/keysetc');
var child;

/** Data Store Initialization **/
var localdata = environment.datastores.main;
var production = environment.datastores.dealflow;
var marcom = environment.datastores.marcom;
var client = environment.datastores.elastic;

/** Local Functions **/

var makeid = function() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 64; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    var stamp = new Date();
    text = text + Date.parse(stamp);
    return text;
}

/** Github Integration Globals **/

var oauthtoken = apiaccess.github.oauthtoken;
var useragent = apiaccess.github.useragent;

/** Export Handlers **/

exports.reportstsv = function(req, res) {
    var url = require('url');
    var url_parts = url.parse(req.url, true);
    var url_params = url_parts.query;
    var select_mysql_report = "SELECT * FROM reports_mysql WHERE id = ?";
    client.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
        if (!elastic_check_health_err) {
            localdata.query(select_mysql_report, [url_params.id], function(select_mysql_report_err, select_mysql_report_rows, select_mysql_report_fields) {
                if (!select_mysql_report_err) {
                    client.search({
                        index: 'reports_mysql_es',
                        q: 'report_id:' + select_mysql_report_rows[0].report_id
                    }, function(elastic_find_report_err, elastic_find_report_res) {
                        if (!elastic_find_report_err) {
                            if (elastic_find_report_res['hits']['total'] > 0) {
                                var report_json = JSON.parse(elastic_find_report_res['hits']['hits'][0]['_source']['report_body']);
                                var report_columns_json = JSON.parse(elastic_find_report_res['hits']['hits'][0]['_source']['report_columns']);
                                var columns = {
                                    columns: []
                                };
                                for (var i in report_columns_json[0]) {
                                    var item = report_columns_json[0][i];
                                    columns.columns.push({
                                        "name": item.name
                                    });
                                }
                                stringify(report_json, {
                                    delimiter: '\t',
                                    header: true
                                }, function(convert_report_tsv_err, convert_report_tsv_report) {
                                    if (!convert_report_tsv_err) {
                                        res.writeHead(200, {
                                            'Content-Type': 'text/plain',
                                            'Content-Disposition': 'attachment; filename=export.txt',
                                            'Content-Transfer-Encoding': 'binary',
                                            'Content-Length': Buffer.byteLength(convert_report_tsv_report, 'utf8')
                                        });
                                        res.write(convert_report_tsv_report);
                                        res.end();
                                    }
                                });
                            } else {
                                res.render('error', {
                                    message: 'The report was not found in the Elastic Store. Pull the report again in a few minutes after letting Elastic index.',
                                    error: {}
                                });
                            }
                        } else {
                            res.status(elastic_find_report_err.status || 500);
                                res.render('error', {
                                    message: elastic_find_report_err.message,
                                    error: {}
                            });

                        }
                    });
                } else {
                    console.log('Error while generating report.');
                    res.status(select_mysql_report_err.status || 500);
                    res.render('error', {
                        message: select_mysql_report_err.message,
                        error: {}
                    });
                }
            });
        } else {
            console.log(elastic_check_health_err);
            res.status(elastic_check_health_err.status || 500);
            res.render('error', {
                message: elastic_check_health_err.message,
                error: {}
            });
        }
    });
}
exports.reportscsv = function(req, res) {
    var url = require('url');
    var url_parts = url.parse(req.url, true);
    var url_params = url_parts.query;
    var select_mysql_report = "SELECT * FROM reports_mysql WHERE id = ?";
    client.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
        if (!elastic_check_health_err) {
            localdata.query(select_mysql_report, [url_params.id], function(select_mysql_report_err, select_mysql_report_rows, select_mysql_report_fields) {
                if (!select_mysql_report_err) {
                    client.search({
                        index: 'reports_mysql_es',
                        q: 'report_id:' + select_mysql_report_rows[0].report_id
                    }, function(elastic_find_report_err, elastic_find_report_res) {
                        if (!elastic_find_report_err) {
                            if (elastic_find_report_res['hits']['total'] > 0) {
                                var report_json = JSON.parse(elastic_find_report_res['hits']['hits'][0]['_source']['report_body']);
                                var report_columns_json = JSON.parse(elastic_find_report_res['hits']['hits'][0]['_source']['report_columns']);
                                var columns = {
                                    columns: []
                                };
                                for (var i in report_columns_json) {
                                    var item = report_columns_json[i];
                                    columns.columns.push({
                                        "name": item.name
                                    });
                                }
                                stringify(report_json, {
                                    header: true
                                }, function(convert_report_csv_err, convert_report_csv_report) {
                                    if (!convert_report_csv_err) {
                                        res.writeHead(200, {
                                            'Content-Type': 'text/csv',
                                            'Content-Disposition': 'attachment; filename=export.csv',
                                            'Content-Transfer-Encoding': 'binary',
                                            'Content-Length': Buffer.byteLength(convert_report_csv_report, 'utf8')
                                        });
                                        res.write(convert_report_csv_report);
                                        res.end();
                                    }
                                });
                            } else {
                                res.render('error', {
                                    message: 'The report was not found in the Elastic Store. Pull the report again in a few minutes after letting Elastic index.',
                                    error: {}
                                });
                            }
                        } else {
                            res.status(elastic_find_report_err.status || 500);
                                res.render('error', {
                                    message: elastic_find_report_err.message,
                                    error: {}
                            });

                        }
                    });
                } else {
                    console.log('Error while generating report.');
                    res.status(select_mysql_report_err.status || 500);
                    res.render('error', {
                        message: select_mysql_report_err.message,
                        error: {}
                    });
                }
            });
        } else {
            console.log(elastic_check_health_err);
            res.status(elastic_check_health_err.status || 500);
            res.render('error', {
                message: elastic_check_health_err.message,
                error: {}
            });
        }
    });
}

/** Basic Generators **/

exports.accredited_verify = function(req, res) {
    res.connection.setTimeout(0);
    var random = makeid();
    var now = new Date();
    var name = "Verify Accredited Requests";
    var select_accredited_verify_main = "SELECT * FROM accredited_verify";
    client.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
        if (!elastic_check_health_err) {
            marcom.query(select_accredited_verify_main, function(select_accredited_verify_main_err, select_accredited_verify_main_rows, select_accredited_verify_main_fields) {
                if (!select_accredited_verify_main_err) {
                    var report_json = JSON.stringify(select_accredited_verify_main_rows);
                    var report_columns_json = JSON.stringify(select_accredited_verify_main_fields);
                    var posta = {
                        report_id: random,
                        report_query: select_accredited_verify_main,
                        report_name: name,
                        created_at: now,
                        updated_at: now
                    };
                    localdata.query('INSERT INTO reports_mysql SET ?', posta, function(insert_report_entry_main_err, insert_report_entry_main_res) {
                        if (!insert_report_entry_main_err) {
                            console.log('Query Saved');
                        } else {
                            console.log('MySQL Not Saved');
                            console.log(insert_report_entry_main_err)
                        }
                    });
                    client.create({
                        index: 'reports_mysql_es',
                        type: 'report',
                        body: {
                            report_query: select_accredited_verify_main,
                            report_name: name,
                            report_body: report_json,
                            report_columns: report_columns_json,
                            published_at: now,
                            report_id: random
                        }
                    }, function(elastic_save_report_err, elastic_save_report_res) {
                        if (elastic_save_report_err) {
                            console.log('Error while saving to elastic.');
                            console.log(elastic_save_report_err);
                        } else {
                            console.log('Saved to elastic.');
                        }
                    });
                    res.redirect(302, '/reports/research');
                    console.log('Report Generated.');
                } else {
                    console.log('Error while performing Production Query.');

                    res.status(select_accredited_verify_main_err.status || 500);
                    res.render('error', {
                        message: select_accredited_verify_main_err.message,
                        error: {}
                    });
                }
            });
        } else {
            console.log(elastic_check_health_err);
            res.status(elastic_check_health_err.status || 500);
            res.render('error', {
                message: elastic_check_health_err.message,
                error: {}
            });
        }
    });
}

exports.accredited_verify_status_analytics = function(req, res) {
    client.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
        var select_verify_requests_main = "SELECT * FROM reports_analytics_pulls WHERE category LIKE '%verify-thank-you%';";
        var random = makeid();
        var now = new Date();
        var name = "Accredited Verify Status Analytics";
        if (!elastic_check_health_err) {
            localdata.query(select_verify_requests_main, function(select_verify_requests_main_err, select_verify_requests_main_rows, select_verify_requests_main_fields) {
                if (!select_verify_requests_main_err) {
                    var inset = '(';
                    for (var i = 0, end = select_verify_requests_main_rows.length; i < end; i++) {
                        if (i + 1 == end) {
                            inset += ('"' + select_verify_requests_main_rows[i]['email'] + '")');
                        } else {
                            inset += ('"' + select_verify_requests_main_rows[i]['email'] + '", ');
                        }
                    }
                    var select_supplemental_data_dealflow = "SELECT user_id, username, approval_status FROM users WHERE username IN " + inset + ";"
                    production.query(select_supplemental_data_dealflow, function(select_supplemental_data_dealflow_err, select_supplemental_data_dealflow_rows, select_supplemental_data_dealflow_fields) {
                        if (!select_supplemental_data_dealflow_err) {
                            for (var i = 0, enda = select_verify_requests_main_rows.length; i < enda; i++) {
                                for (var j = 0, endb = select_supplemental_data_dealflow_rows.length; j < endb; j++) {
                                    if (select_verify_requests_main_rows[i]['email'] == select_supplemental_data_dealflow_rows[j]['username']) {
                                        select_verify_requests_main_rows[i]['user_id'] = select_supplemental_data_dealflow_rows[j]['user_id'];
                                        select_verify_requests_main_rows[i]['approval_status'] = select_supplemental_data_dealflow_rows[j]['approval_status'];
                                        if (select_supplemental_data_dealflow_rows[j]['approval_status'] == 1) {
                                            select_verify_requests_main_rows[i]['approval_text'] = "Approved";
                                        } else if (select_supplemental_data_dealflow_rows[j]['approval_status'] == 2) {
                                            select_verify_requests_main_rows[i]['approval_text'] = "Approved w/wait";
                                        } else if (select_supplemental_data_dealflow_rows[j]['approval_status'] == 3) {
                                            select_verify_requests_main_rows[i]['approval_text'] = "Rejected";
                                        } else if (select_supplemental_data_dealflow_rows[j]['approval_status'] == 4) {
                                            select_verify_requests_main_rows[i]['approval_text'] = "Issuer Approved";
                                        } else if (select_supplemental_data_dealflow_rows[j]['approval_status'] == null) {
                                            select_verify_requests_main_rows[i]['approval_text'] = "No Repsonse";
                                        } else {
                                            select_verify_requests_main_rows[i]['approval_text'] = "Invalid Field Data";
                                        }
                                    }
                                }
                            }
                            var report_json = JSON.stringify(select_verify_requests_main_rows);
                            var report_columns_json = JSON.stringify(select_verify_requests_main_fields);
                            var posta = {
                                report_id: random,
                                report_query: select_verify_requests_main,
                                report_name: name,
                                created_at: now,
                                updated_at: now
                            };
                            localdata.query('INSERT INTO reports_mysql SET ?', posta, function(insert_report_entry_main_err, insert_report_entry_main_res) {
                                if (!insert_report_entry_main_err) {
                                    console.log('Query Saved');
                                } else {
                                    console.log('MySQL Not Saved');
                                    console.log(insert_report_entry_main_err)
                                }
                            });
                            client.create({
                                index: 'reports_mysql_es',
                                type: 'report',
                                body: {
                                    report_query: select_verify_requests_main,
                                    report_name: name,
                                    report_body: report_json,
                                    report_columns: report_columns_json,
                                    published_at: now,
                                    report_id: random
                                }
                            }, function(elastic_save_report_err, elastic_save_report_res) {
                                if (elastic_save_report_err) {
                                    console.log('Error while saving to elastic.');
                                    console.log(elastic_save_report_err);
                                } else {
                                    console.log('Saved to elastic.');
                                }
                            });
                            res.redirect(302, '/reports/research');
                            console.log('Report Generated.');

                        }
                    });
                } else {
                    console.log(elastic_check_health_err);
                    res.status(elastic_check_health_err.status || 500);
                    res.render('error', {
                        message: elastic_check_health_err.message,
                        error: {}
                    });
                }
            });
        }
    });
}

exports.accredited_verify_comments = function(req, res) {
    client.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
        var select_verify_requests_main = "SELECT * FROM reports_analytics_pulls WHERE category LIKE '%verify-thank-you%';";
        var random = makeid();
        var now = new Date();
        var name = "Accredited Verify Comments";
        if (!elastic_check_health_err) {
            localdata.query(select_verify_requests_main, function(select_verify_requests_main_err, select_verify_requests_main_rows, select_verify_requests_main_fields) {
                if (!select_verify_requests_main_err) {
                    var inset = '(';
                    for (var i = 0, end = select_verify_requests_main_rows.length; i < end; i++) {
                        if (i + 1 == end) {
                            inset += ('"' + select_verify_requests_main_rows[i]['email'] + '")');
                        } else {
                            inset += ('"' + select_verify_requests_main_rows[i]['email'] + '", ');
                        }
                    }
                    var select_supplemental_data_dealflow = 'SELECT u.user_id, u.username, u.approval_status, iah.status_to, iah.comments FROM users u INNER JOIN investor_approval_history iah ON iah.people_id = u.contacts_id WHERE u.username IN' + inset + ';';

                    production.query(select_supplemental_data_dealflow, function(select_supplemental_data_dealflow_err, select_supplemental_data_dealflow_rows, select_supplemental_data_dealflow_fields) {
                        if (!select_supplemental_data_dealflow_err) {
                            for (var i = 0, enda = select_verify_requests_main_rows.length; i < enda; i++) {
                                for (var j = 0, endb = select_supplemental_data_dealflow_rows.length; j < endb; j++) {
                                    if (select_verify_requests_main_rows[i]['email'] == select_supplemental_data_dealflow_rows[j]['username']) {
                                        select_verify_requests_main_rows[i]['user_id'] = select_supplemental_data_dealflow_rows[j]['user_id'];
                                        select_verify_requests_main_rows[i]['approval_status'] = select_supplemental_data_dealflow_rows[j]['approval_status'];
                                        select_verify_requests_main_rows[i]['history_approval_status'] = select_supplemental_data_dealflow_rows[j]['status_to'];
                                        if (select_supplemental_data_dealflow_rows[j]['approval_status'] == 1) {
                                            select_verify_requests_main_rows[i]['approval_text'] = "Approved";
                                        } else if (select_supplemental_data_dealflow_rows[j]['approval_status'] == 2) {
                                            select_verify_requests_main_rows[i]['approval_text'] = "Approved w/wait";
                                        } else if (select_supplemental_data_dealflow_rows[j]['approval_status'] == 3) {
                                            select_verify_requests_main_rows[i]['approval_text'] = "Rejected";
                                        } else if (select_supplemental_data_dealflow_rows[j]['approval_status'] == 4) {
                                            select_verify_requests_main_rows[i]['approval_text'] = "Issuer Approved";
                                        } else if (select_supplemental_data_dealflow_rows[j]['approval_status'] == null) {
                                            select_verify_requests_main_rows[i]['approval_text'] = "No Repsonse";
                                        } else {
                                            select_verify_requests_main_rows[i]['approval_text'] = "Invalid Field Data";
                                        }
                                        select_verify_requests_main_rows[i]['approval_comment'] = select_supplemental_data_dealflow_rows[j]['comments'];
                                    }
                                }
                            }
                            var report_json = JSON.stringify(select_verify_requests_main_rows);
                            var report_columns_json = JSON.stringify(select_verify_requests_main_fields);
                            var posta = {
                                report_id: random,
                                report_query: select_verify_requests_main,
                                report_name: name,
                                created_at: now,
                                updated_at: now
                            };
                            localdata.query('INSERT INTO reports_mysql SET ?', posta, function(insert_report_entry_main_err, insert_report_entry_main_res) {
                                if (!insert_report_entry_main_err) {
                                    console.log('Query Saved');
                                } else {
                                    console.log('MySQL Not Saved');
                                    console.log(insert_report_entry_main_err)
                                }
                            });
                            client.create({
                                index: 'reports_mysql_es',
                                type: 'report',
                                body: {
                                    report_query: select_verify_requests_main,
                                    report_name: name,
                                    report_body: report_json,
                                    report_columns: report_columns_json,
                                    published_at: now,
                                    report_id: random
                                }
                            }, function(elastic_save_report_err, elastic_save_report_res) {
                                if (elastic_save_report_err) {
                                    console.log('Error while saving to elastic.');
                                    console.log(elastic_save_report_err);
                                } else {
                                    console.log('Saved to elastic.');
                                }
                            });
                            res.redirect(302, '/reports/research');
                            console.log('Report Generated.');

                        }
                    });
                } else {
                    console.log(elastic_check_health_err);
                    res.status(elastic_check_health_err.status || 500);
                    res.render('error', {
                        message: elastic_check_health_err.message,
                        error: {}
                    });
                }
            });
        }
    });
}

/** GitHub Generators **/

exports.accredited_verify_status = function(req, res) {
    res.connection.setTimeout(0);
    var options = {
        host: 'api.github.com',
        path: '/repos/dealflow/dealflow.com/contents/dbscripts/reports/verifystatus.sql',
        port: 443,
        headers: {
            'User-Agent': useragent,
            'Authorization': oauthtoken
        }
    };
    var git_query = '';
    var git_get = https.request(options, function(github_query_pull_res) {
        github_query_pull_res.on('data', function(d) {
            git_query += d;
        });
        github_query_pull_res.on('end', function() {
            git_query = JSON.parse(git_query);
            var github_sql_report = new Buffer(git_query.content, 'base64').toString('utf8');
            github_sql_report = github_sql_report.replace(/(?:\r\n|\r|\n)/g, ' ');
            var random = makeid();
            var now = new Date();
            var name = "Accredited Verify Status";
            client.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
                if (!elastic_check_health_err) {
                    production.query(github_sql_report, function(select_github_sql_report_err, select_github_sql_report_rows, select_github_sql_report_fields) {
                        if (!select_github_sql_report_err) {
                            var report_json = JSON.stringify(select_github_sql_report_rows);
                            var report_columns_json = JSON.stringify(select_github_sql_report_fields);
                            var posta = {
                                report_id: random,
                                report_query: github_sql_report,
                                report_name: name,
                                created_at: now,
                                updated_at: now
                            };
                            var query = localdata.query('INSERT INTO reports_mysql SET ?', posta, function(insert_report_entry_main_err, insert_report_entry_main_res) {
                                if (!insert_report_entry_main_err) {
                                    console.log('Query Saved');
                                } else {
                                    console.log('MySQL Not Saved');
                                    console.log(insert_report_entry_main_err)
                                }
                            });
                            client.create({
                                index: 'reports_mysql_es',
                                type: 'report',
                                body: {
                                    report_query: github_sql_report,
                                    report_name: name,
                                    report_body: report_json,
                                    report_columns: report_columns_json,
                                    published_at: now,
                                    report_id: random
                                }
                            }, function(elastic_save_report_err, elastic_save_report_res) {
                                if (elastic_save_report_err) {
                                    console.log('Error while saving to elastic.');
                                    console.log(elastic_save_report_err);
                                } else {
                                    console.log('Saved to elastic.');
                                }
                            });
                            res.redirect(302, '/reports/research');
                            console.log('Report Generated.');
                        } else {
                            console.log('Error while performing Production Query.');

                            res.status(select_github_sql_report_err.status || 500);
                            res.render('error', {
                                message: select_github_sql_report_err.message,
                                error: {}
                            });
                        }
                    });
                } else {
                    console.log(elastic_check_health_err);
                    res.status(elastic_check_health_err.status || 500);
                    res.render('error', {
                        message: elastic_check_health_err.message,
                        error: {}
                    });
                }
            });
        });
    });
    git_get.end();
    git_get.on('error', function(e) {
        console.error(e);
    });
}

exports.sendgrid = function(req, res) {
    res.connection.setTimeout(0);
    var options = {
        host: 'api.github.com',
        path: '/repos/dealflow/dealflow.com/contents/dbscripts/reports/sendgrid.sql',
        port: 443,
        headers: {
            'User-Agent': useragent,
            'Authorization': oauthtoken
        }
    };
    var git_query = '';
    var git_get = https.request(options, function(github_query_pull_res) {
        github_query_pull_res.on('data', function(d) {
            git_query += d;
        });
        github_query_pull_res.on('end', function() {
            git_query = JSON.parse(git_query);
            var github_sql_report = new Buffer(git_query.content, 'base64').toString('utf8');
            github_sql_report = github_sql_report.replace(/(?:\r\n|\r|\n)/g, ' ');
            var random = makeid();
            var now = new Date();
            var name = "SendGrid Alerts by Freq";
            client.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
                if (!elastic_check_health_err) {
                    production.query(github_sql_report, function(select_github_sql_report_err, select_github_sql_report_rows, select_github_sql_report_fields) {
                        if (!select_github_sql_report_err) {
                            var report_json = JSON.stringify(select_github_sql_report_rows);
                            var report_columns_json = JSON.stringify(select_github_sql_report_fields);
                            var posta = {
                                report_id: random,
                                report_query: github_sql_report,
                                report_name: name,
                                created_at: now,
                                updated_at: now
                            };
                            var query = localdata.query('INSERT INTO reports_mysql SET ?', posta, function(insert_report_entry_main_err, insert_report_entry_main_res) {
                                if (!insert_report_entry_main_err) {
                                    console.log('Query Saved');
                                } else {
                                    console.log('MySQL Not Saved');
                                    console.log(insert_report_entry_main_err)
                                }
                            });
                            client.create({
                                index: 'reports_mysql_es',
                                type: 'report',
                                body: {
                                    report_query: github_sql_report,
                                    report_name: name,
                                    report_body: report_json,
                                    report_columns: report_columns_json,
                                    published_at: now,
                                    report_id: random
                                }
                            }, function(elastic_save_report_err, elastic_save_report_res) {
                                if (elastic_save_report_err) {
                                    console.log('Error while saving to elastic.');
                                    console.log(elastic_save_report_err);
                                } else {
                                    console.log('Saved to elastic.');
                                }
                            });
                            res.redirect(302, '/reports/research');
                            console.log('Report Generated.');
                        } else {
                            console.log('Error while performing Production Query.');

                            res.status(select_github_sql_report_err.status || 500);
                            res.render('error', {
                                message: select_github_sql_report_err.message,
                                error: {}
                            });
                        }
                    });
                } else {
                    console.log(elastic_check_health_err);
                    res.status(elastic_check_health_err.status || 500);
                    res.render('error', {
                        message: elastic_check_health_err.message,
                        error: {}
                    });
                }
            });
        });
    });
    git_get.end();
    git_get.on('error', function(e) {
        console.error(e);
    });
}

exports.cowowebsite = function(req, res) {
    res.connection.setTimeout(0);
    var options = {
        host: 'api.github.com',
        path: '/repos/dealflow/dealflow.com/contents/dbscripts/reports/cowowebsite.sql',
        port: 443,
        headers: {
            'User-Agent': useragent,
            'Authorization': oauthtoken
        }
    };
    var git_query = '';
    var git_get = https.request(options, function(github_query_pull_res) {
        github_query_pull_res.on('data', function(d) {
            git_query += d;
        });
        github_query_pull_res.on('end', function() {
            git_query = JSON.parse(git_query);
            var github_sql_report = new Buffer(git_query.content, 'base64').toString('utf8');
            github_sql_report = github_sql_report.replace(/(?:\r\n|\r|\n)/g, ' ');
            var random = makeid();
            var now = new Date();
            var name = "Companies wo Website";
            client.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
                if (!elastic_check_health_err) {
                    production.query(github_sql_report, function(select_github_sql_report_err, select_github_sql_report_rows, select_github_sql_report_fields) {
                        if (!select_github_sql_report_err) {
                            var report_json = JSON.stringify(select_github_sql_report_rows);
                            var report_columns_json = JSON.stringify(select_github_sql_report_fields);
                            var posta = {
                                report_id: random,
                                report_query: github_sql_report,
                                report_name: name,
                                created_at: now,
                                updated_at: now
                            };
                            var query = localdata.query('INSERT INTO reports_mysql SET ?', posta, function(insert_report_entry_main_err, insert_report_entry_main_res) {
                                if (!insert_report_entry_main_err) {
                                    console.log('Query Saved');
                                } else {
                                    console.log('MySQL Not Saved');
                                    console.log(insert_report_entry_main_err)
                                }
                            });
                            client.create({
                                index: 'reports_mysql_es',
                                type: 'report',
                                body: {
                                    report_query: github_sql_report,
                                    report_name: name,
                                    report_body: report_json,
                                    report_columns: report_columns_json,
                                    published_at: now,
                                    report_id: random
                                }
                            }, function(elastic_save_report_err, elastic_save_report_res) {
                                if (elastic_save_report_err) {
                                    console.log('Error while saving to elastic.');
                                    console.log(elastic_save_report_err);
                                } else {
                                    console.log('Saved to elastic.');
                                }
                            });
                            res.redirect(302, '/reports/research');
                            console.log('Report Generated.');
                        } else {
                            console.log('Error while performing Production Query.');

                            res.status(select_github_sql_report_err.status || 500);
                            res.render('error', {
                                message: select_github_sql_report_err.message,
                                error: {}
                            });
                        }
                    });
                } else {
                    console.log(elastic_check_health_err);
                    res.status(elastic_check_health_err.status || 500);
                    res.render('error', {
                        message: elastic_check_health_err.message,
                        error: {}
                    });
                }
            });
        });
    });
    git_get.end();
    git_get.on('error', function(e) {
        console.error(e);
    });
}

exports.cofewtags = function(req, res) {
    res.connection.setTimeout(0);
    var options = {
        host: 'api.github.com',
        path: '/repos/dealflow/dealflow.com/contents/dbscripts/reports/cofewtags.sql',
        port: 443,
        headers: {
            'User-Agent': useragent,
            'Authorization': oauthtoken
        }
    };
    var git_query = '';
    var git_get = https.request(options, function(github_query_pull_res) {
        github_query_pull_res.on('data', function(d) {
            git_query += d;
        });
        github_query_pull_res.on('end', function() {
            git_query = JSON.parse(git_query);
            var github_sql_report = new Buffer(git_query.content, 'base64').toString('utf8');
            github_sql_report = github_sql_report.replace(/(?:\r\n|\r|\n)/g, ' ');
            var random = makeid();
            var now = new Date();
            var name = "Companies w <15 Tags";
            client.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
                if (!elastic_check_health_err) {
                    production.query(github_sql_report, function(select_github_sql_report_err, select_github_sql_report_rows, select_github_sql_report_fields) {
                        if (!select_github_sql_report_err) {
                            var report_json = JSON.stringify(select_github_sql_report_rows);
                            var report_columns_json = JSON.stringify(select_github_sql_report_fields);
                            var posta = {
                                report_id: random,
                                report_query: github_sql_report,
                                report_name: name,
                                created_at: now,
                                updated_at: now
                            };
                            var query = localdata.query('INSERT INTO reports_mysql SET ?', posta, function(insert_report_entry_main_err, insert_report_entry_main_res) {
                                if (!insert_report_entry_main_err) {
                                    console.log('Query Saved');
                                } else {
                                    console.log('MySQL Not Saved');
                                    console.log(insert_report_entry_main_err)
                                }
                            });
                            client.create({
                                index: 'reports_mysql_es',
                                type: 'report',
                                body: {
                                    report_query: github_sql_report,
                                    report_name: name,
                                    report_body: report_json,
                                    report_columns: report_columns_json,
                                    published_at: now,
                                    report_id: random
                                }
                            }, function(elastic_save_report_err, elastic_save_report_res) {
                                if (elastic_save_report_err) {
                                    console.log('Error while saving to elastic.');
                                    console.log(elastic_save_report_err);
                                } else {
                                    console.log('Saved to elastic.');
                                }
                            });
                            res.redirect(302, '/reports/research');
                            console.log('Report Generated.');
                        } else {
                            console.log('Error while performing Production Query.');

                            res.status(select_github_sql_report_err.status || 500);
                            res.render('error', {
                                message: select_github_sql_report_err.message,
                                error: {}
                            });
                        }
                    });
                } else {
                    console.log(elastic_check_health_err);
                    res.status(elastic_check_health_err.status || 500);
                    res.render('error', {
                        message: elastic_check_health_err.message,
                        error: {}
                    });
                }
            });
        });
    });
    git_get.end();
    git_get.on('error', function(e) {
        console.error(e);
    });
}
exports.cosourceteam = function(req, res) {
    res.connection.setTimeout(0);
    var options = {
        host: 'api.github.com',
        path: '/repos/dealflow/dealflow.com/contents/dbscripts/reports/cosourceteam.sql',
        port: 443,
        headers: {
            'User-Agent': useragent,
            'Authorization': oauthtoken
        }
    };
    var git_query = '';
    var git_get = https.request(options, function(github_query_pull_res) {
        github_query_pull_res.on('data', function(d) {
            git_query += d;
        });
        github_query_pull_res.on('end', function() {
            git_query = JSON.parse(git_query);
            var github_sql_report = new Buffer(git_query.content, 'base64').toString('utf8');
            github_sql_report = github_sql_report.replace(/(?:\r\n|\r|\n)/g, ' ');
            var random = makeid();
            var now = new Date();
            var name = "Companies w Team member as Source";
            client.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
                if (!elastic_check_health_err) {
                    production.query(github_sql_report, function(select_github_sql_report_err, select_github_sql_report_rows, select_github_sql_report_fields) {
                        if (!select_github_sql_report_err) {
                            var report_json = JSON.stringify(select_github_sql_report_rows);
                            var report_columns_json = JSON.stringify(select_github_sql_report_fields);
                            var posta = {
                                report_id: random,
                                report_query: github_sql_report,
                                report_name: name,
                                created_at: now,
                                updated_at: now
                            };
                            var query = localdata.query('INSERT INTO reports_mysql SET ?', posta, function(insert_report_entry_main_err, insert_report_entry_main_res) {
                                if (!insert_report_entry_main_err) {
                                    console.log('Query Saved');
                                } else {
                                    console.log('MySQL Not Saved');
                                    console.log(insert_report_entry_main_err)
                                }
                            });
                            client.create({
                                index: 'reports_mysql_es',
                                type: 'report',
                                body: {
                                    report_query: github_sql_report,
                                    report_name: name,
                                    report_body: report_json,
                                    report_columns: report_columns_json,
                                    published_at: now,
                                    report_id: random
                                }
                            }, function(elastic_save_report_err, elastic_save_report_res) {
                                if (elastic_save_report_err) {
                                    console.log('Error while saving to elastic.');
                                    console.log(elastic_save_report_err);
                                } else {
                                    console.log('Saved to elastic.');
                                }
                            });
                            res.redirect(302, '/reports/research');
                            console.log('Report Generated.');
                        } else {
                            console.log('Error while performing Production Query.');

                            res.status(select_github_sql_report_err.status || 500);
                            res.render('error', {
                                message: select_github_sql_report_err.message,
                                error: {}
                            });
                        }
                    });
                } else {
                    console.log(elastic_check_health_err);
                    res.status(elastic_check_health_err.status || 500);
                    res.render('error', {
                        message: elastic_check_health_err.message,
                        error: {}
                    });
                }
            });
        });
    });
    git_get.end();
    git_get.on('error', function(e) {
        console.error(e);
    });
}
exports.coswsameaddress = function(req, res) {
    res.connection.setTimeout(0);
    var options = {
        host: 'api.github.com',
        path: '/repos/dealflow/dealflow.com/contents/dbscripts/reports/coswsameaddress.sql',
        port: 443,
        headers: {
            'User-Agent': useragent,
            'Authorization': oauthtoken
        }
    };
    var git_query = '';
    var git_get = https.request(options, function(github_query_pull_res) {
        github_query_pull_res.on('data', function(d) {
            git_query += d;
        });
        github_query_pull_res.on('end', function() {
            git_query = JSON.parse(git_query);
            var github_sql_report = new Buffer(git_query.content, 'base64').toString('utf8');
            github_sql_report = github_sql_report.replace(/(?:\r\n|\r|\n)/g, ' ');
            var random = makeid();
            var now = new Date();
            var name = "Multiple Companies w Same Address";
            client.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
                if (!elastic_check_health_err) {
                    production.query(github_sql_report, function(select_github_sql_report_err, select_github_sql_report_rows, select_github_sql_report_fields) {
                        if (!select_github_sql_report_err) {
                            var report_json = JSON.stringify(select_github_sql_report_rows);
                            var report_columns_json = JSON.stringify(select_github_sql_report_fields);
                            var posta = {
                                report_id: random,
                                report_query: github_sql_report,
                                report_name: name,
                                created_at: now,
                                updated_at: now
                            };
                            var query = localdata.query('INSERT INTO reports_mysql SET ?', posta, function(insert_report_entry_main_err, insert_report_entry_main_res) {
                                if (!insert_report_entry_main_err) {
                                    console.log('Query Saved');
                                } else {
                                    console.log('MySQL Not Saved');
                                    console.log(insert_report_entry_main_err)
                                }
                            });
                            client.create({
                                index: 'reports_mysql_es',
                                type: 'report',
                                body: {
                                    report_query: github_sql_report,
                                    report_name: name,
                                    report_body: report_json,
                                    report_columns: report_columns_json,
                                    published_at: now,
                                    report_id: random
                                }
                            }, function(elastic_save_report_err, elastic_save_report_res) {
                                if (elastic_save_report_err) {
                                    console.log('Error while saving to elastic.');
                                    console.log(elastic_save_report_err);
                                } else {
                                    console.log('Saved to elastic.');
                                }
                            });
                            res.redirect(302, '/reports/research');
                            console.log('Report Generated.');
                        } else {
                            console.log('Error while performing Production Query.');

                            res.status(select_github_sql_report_err.status || 500);
                            res.render('error', {
                                message: select_github_sql_report_err.message,
                                error: {}
                            });
                        }
                    });
                } else {
                    console.log(elastic_check_health_err);
                    res.status(elastic_check_health_err.status || 500);
                    res.render('error', {
                        message: elastic_check_health_err.message,
                        error: {}
                    });
                }
            });
        });
    });
    git_get.end();
    git_get.on('error', function(e) {
        console.error(e);
    });
}
exports.confundofferingorclosed = function(req, res) {
    res.connection.setTimeout(0);
    var options = {
        host: 'api.github.com',
        path: '/repos/dealflow/dealflow.com/contents/dbscripts/reports/confundofferingorclosed.sql',
        port: 443,
        headers: {
            'User-Agent': useragent,
            'Authorization': oauthtoken
        }
    };
    var git_query = '';
    var git_get = https.request(options, function(github_query_pull_res) {
        github_query_pull_res.on('data', function(d) {
            git_query += d;
        });
        github_query_pull_res.on('end', function() {
            git_query = JSON.parse(git_query);
            var github_sql_report = new Buffer(git_query.content, 'base64').toString('utf8');
            github_sql_report = github_sql_report.replace(/(?:\r\n|\r|\n)/g, ' ');
            var random = makeid();
            var now = new Date();
            var name = "Non Fund Companies (Status: Offering or Closed)";
            client.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
                if (!elastic_check_health_err) {
                    production.query(github_sql_report, function(select_github_sql_report_err, select_github_sql_report_rows, select_github_sql_report_fields) {
                        if (!select_github_sql_report_err) {
                            var report_json = JSON.stringify(select_github_sql_report_rows);
                            var report_columns_json = JSON.stringify(select_github_sql_report_fields);
                            var posta = {
                                report_id: random,
                                report_query: github_sql_report,
                                report_name: name,
                                created_at: now,
                                updated_at: now
                            };
                            var query = localdata.query('INSERT INTO reports_mysql SET ?', posta, function(insert_report_entry_main_err, insert_report_entry_main_res) {
                                if (!insert_report_entry_main_err) {
                                    console.log('Query Saved');
                                } else {
                                    console.log('MySQL Not Saved');
                                    console.log(insert_report_entry_main_err)
                                }
                            });
                            client.create({
                                index: 'reports_mysql_es',
                                type: 'report',
                                body: {
                                    report_query: github_sql_report,
                                    report_name: name,
                                    report_body: report_json,
                                    report_columns: report_columns_json,
                                    published_at: now,
                                    report_id: random
                                }
                            }, function(elastic_save_report_err, elastic_save_report_res) {
                                if (elastic_save_report_err) {
                                    console.log('Error while saving to elastic.');
                                    console.log(elastic_save_report_err);
                                } else {
                                    console.log('Saved to elastic.');
                                }
                            });
                            res.redirect(302, '/reports/research');
                            console.log('Report Generated.');
                        } else {
                            console.log('Error while performing Production Query.');

                            res.status(select_github_sql_report_err.status || 500);
                            res.render('error', {
                                message: select_github_sql_report_err.message,
                                error: {}
                            });
                        }
                    });
                } else {
                    console.log(elastic_check_health_err);
                    res.status(elastic_check_health_err.status || 500);
                    res.render('error', {
                        message: elastic_check_health_err.message,
                        error: {}
                    });
                }
            });
        });
    });
    git_get.end();
    git_get.on('error', function(e) {
        console.error(e);
    });
}
exports.colocation = function(req, res) {
    res.connection.setTimeout(0);
    var options = {
        host: 'api.github.com',
        path: '/repos/dealflow/dealflow.com/contents/dbscripts/reports/colocation.sql',
        port: 443,
        headers: {
            'User-Agent': useragent,
            'Authorization': oauthtoken
        }
    };
    var git_query = '';
    var git_get = https.request(options, function(github_query_pull_res) {
        github_query_pull_res.on('data', function(d) {
            git_query += d;
        });
        github_query_pull_res.on('end', function() {
            git_query = JSON.parse(git_query);
            var github_sql_report = new Buffer(git_query.content, 'base64').toString('utf8');
            github_sql_report = github_sql_report.replace(/(?:\r\n|\r|\n)/g, ' ');
            var random = makeid();
            var now = new Date();
            var name = "Companies w Location";
            client.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
                if (!elastic_check_health_err) {
                    production.query(github_sql_report, function(select_github_sql_report_err, select_github_sql_report_rows, select_github_sql_report_fields) {
                        if (!select_github_sql_report_err) {
                            var report_json = JSON.stringify(select_github_sql_report_rows);
                            var report_columns_json = JSON.stringify(select_github_sql_report_fields);
                            var posta = {
                                report_id: random,
                                report_query: github_sql_report,
                                report_name: name,
                                created_at: now,
                                updated_at: now
                            };
                            var query = localdata.query('INSERT INTO reports_mysql SET ?', posta, function(insert_report_entry_main_err, insert_report_entry_main_res) {
                                if (!insert_report_entry_main_err) {
                                    console.log('Query Saved');
                                } else {
                                    console.log('MySQL Not Saved');
                                    console.log(insert_report_entry_main_err)
                                }
                            });
                            client.create({
                                index: 'reports_mysql_es',
                                type: 'report',
                                body: {
                                    report_query: github_sql_report,
                                    report_name: name,
                                    report_body: report_json,
                                    report_columns: report_columns_json,
                                    published_at: now,
                                    report_id: random
                                }
                            }, function(elastic_save_report_err, elastic_save_report_res) {
                                if (elastic_save_report_err) {
                                    console.log('Error while saving to elastic.');
                                    console.log(elastic_save_report_err);
                                } else {
                                    console.log('Saved to elastic.');
                                }
                            });
                            res.redirect(302, '/reports/research');
                            console.log('Report Generated.');
                        } else {
                            console.log('Error while performing Production Query.');

                            res.status(select_github_sql_report_err.status || 500);
                            res.render('error', {
                                message: select_github_sql_report_err.message,
                                error: {}
                            });
                        }
                    });
                } else {
                    console.log(elastic_check_health_err);
                    res.status(elastic_check_health_err.status || 500);
                    res.render('error', {
                        message: elastic_check_health_err.message,
                        error: {}
                    });
                }
            });
        });
    });
    git_get.end();
    git_get.on('error', function(e) {
        console.error(e);
    });
}
exports.allpeople = function(req, res) {
    res.connection.setTimeout(0);
    var options = {
        host: 'api.github.com',
        path: '/repos/dealflow/dealflow.com/contents/dbscripts/reports/allpeople.sql',
        port: 443,
        headers: {
            'User-Agent': useragent,
            'Authorization': oauthtoken
        }
    };
    var git_query = '';
    var git_get = https.request(options, function(github_query_pull_res) {
        github_query_pull_res.on('data', function(d) {
            git_query += d;
        });
        github_query_pull_res.on('end', function() {
            git_query = JSON.parse(git_query);
            var github_sql_report = new Buffer(git_query.content, 'base64').toString('utf8');
            github_sql_report = github_sql_report.replace(/(?:\r\n|\r|\n)/g, ' ');
            var random = makeid();
            var now = new Date();
            var name = "All People";
            client.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
                if (!elastic_check_health_err) {
                    production.query(github_sql_report, function(select_github_sql_report_err, select_github_sql_report_rows, select_github_sql_report_fields) {
                        if (!select_github_sql_report_err) {
                            var report_json = JSON.stringify(select_github_sql_report_rows);
                            var report_columns_json = JSON.stringify(select_github_sql_report_fields);
                            var posta = {
                                report_id: random,
                                report_query: github_sql_report,
                                report_name: name,
                                created_at: now,
                                updated_at: now
                            };
                            var query = localdata.query('INSERT INTO reports_mysql SET ?', posta, function(insert_report_entry_main_err, insert_report_entry_main_res) {
                                if (!insert_report_entry_main_err) {
                                    console.log('Query Saved');
                                } else {
                                    console.log('MySQL Not Saved');
                                    console.log(insert_report_entry_main_err)
                                }
                            });
                            client.create({
                                index: 'reports_mysql_es',
                                type: 'report',
                                body: {
                                    report_query: github_sql_report,
                                    report_name: name,
                                    report_body: report_json,
                                    report_columns: report_columns_json,
                                    published_at: now,
                                    report_id: random
                                }
                            }, function(elastic_save_report_err, elastic_save_report_res) {
                                if (elastic_save_report_err) {
                                    console.log('Error while saving to elastic.');
                                    console.log(elastic_save_report_err);
                                } else {
                                    console.log('Saved to elastic.');
                                }
                            });
                            res.redirect(302, '/reports/research');
                            console.log('Report Generated.');
                        } else {
                            console.log('Error while performing Production Query.');

                            res.status(select_github_sql_report_err.status || 500);
                            res.render('error', {
                                message: select_github_sql_report_err.message,
                                error: {}
                            });
                        }
                    });
                } else {
                    console.log(elastic_check_health_err);
                    res.status(elastic_check_health_err.status || 500);
                    res.render('error', {
                        message: elastic_check_health_err.message,
                        error: {}
                    });
                }
            });
        });
    });
    git_get.end();
    git_get.on('error', function(e) {
        console.error(e);
    });
}
exports.coswmultideals = function(req, res) {
    res.connection.setTimeout(0);
    var options = {
        host: 'api.github.com',
        path: '/repos/dealflow/dealflow.com/contents/dbscripts/reports/coswmultideals.sql',
        port: 443,
        headers: {
            'User-Agent': useragent,
            'Authorization': oauthtoken
        }
    };
    var git_query = '';
    var git_get = https.request(options, function(github_query_pull_res) {
        github_query_pull_res.on('data', function(d) {
            git_query += d;
        });
        github_query_pull_res.on('end', function() {
            git_query = JSON.parse(git_query);
            var github_sql_report = new Buffer(git_query.content, 'base64').toString('utf8');
            github_sql_report = github_sql_report.replace(/(?:\r\n|\r|\n)/g, ' ');
            var random = makeid();
            var now = new Date();
            var name = "Companies w Multiple Deals";
            client.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
                if (!elastic_check_health_err) {
                    production.query(github_sql_report, function(select_github_sql_report_err, select_github_sql_report_rows, select_github_sql_report_fields) {
                        if (!select_github_sql_report_err) {
                            var report_json = JSON.stringify(select_github_sql_report_rows);
                            var report_columns_json = JSON.stringify(select_github_sql_report_fields);
                            var posta = {
                                report_id: random,
                                report_query: github_sql_report,
                                report_name: name,
                                created_at: now,
                                updated_at: now
                            };
                            var query = localdata.query('INSERT INTO reports_mysql SET ?', posta, function(insert_report_entry_main_err, insert_report_entry_main_res) {
                                if (!insert_report_entry_main_err) {
                                    console.log('Query Saved');
                                } else {
                                    console.log('MySQL Not Saved');
                                    console.log(insert_report_entry_main_err)
                                }
                            });
                            client.create({
                                index: 'reports_mysql_es',
                                type: 'report',
                                body: {
                                    report_query: github_sql_report,
                                    report_name: name,
                                    report_body: report_json,
                                    report_columns: report_columns_json,
                                    published_at: now,
                                    report_id: random
                                }
                            }, function(elastic_save_report_err, elastic_save_report_res) {
                                if (elastic_save_report_err) {
                                    console.log('Error while saving to elastic.');
                                    console.log(elastic_save_report_err);
                                } else {
                                    console.log('Saved to elastic.');
                                }
                            });
                            res.redirect(302, '/reports/research');
                            console.log('Report Generated.');
                        } else {
                            console.log('Error while performing Production Query.');

                            res.status(select_github_sql_report_err.status || 500);
                            res.render('error', {
                                message: select_github_sql_report_err.message,
                                error: {}
                            });
                        }
                    });
                } else {
                    console.log(elastic_check_health_err);
                    res.status(elastic_check_health_err.status || 500);
                    res.render('error', {
                        message: elastic_check_health_err.message,
                        error: {}
                    });
                }
            });
        });
    });
    git_get.end();
    git_get.on('error', function(e) {
        console.error(e);
    });
}
exports.coswsamename = function(req, res) {
    res.connection.setTimeout(0);
    var options = {
        host: 'api.github.com',
        path: '/repos/dealflow/dealflow.com/contents/dbscripts/reports/coswsamename.sql',
        port: 443,
        headers: {
            'User-Agent': useragent,
            'Authorization': oauthtoken
        }
    };
    var git_query = '';
    var git_get = https.request(options, function(github_query_pull_res) {
        github_query_pull_res.on('data', function(d) {
            git_query += d;
        });
        github_query_pull_res.on('end', function() {
            git_query = JSON.parse(git_query);
            var github_sql_report = new Buffer(git_query.content, 'base64').toString('utf8');
            github_sql_report = github_sql_report.replace(/(?:\r\n|\r|\n)/g, ' ');
            var random = makeid();
            var now = new Date();
            var name = "Multiple Companies w Same Name";
            client.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
                if (!elastic_check_health_err) {
                    production.query(github_sql_report, function(select_github_sql_report_err, select_github_sql_report_rows, select_github_sql_report_fields) {
                        if (!select_github_sql_report_err) {
                            var report_json = JSON.stringify(select_github_sql_report_rows);
                            var report_columns_json = JSON.stringify(select_github_sql_report_fields);
                            var posta = {
                                report_id: random,
                                report_query: github_sql_report,
                                report_name: name,
                                created_at: now,
                                updated_at: now
                            };
                            var query = localdata.query('INSERT INTO reports_mysql SET ?', posta, function(insert_report_entry_main_err, insert_report_entry_main_res) {
                                if (!insert_report_entry_main_err) {
                                    console.log('Query Saved');
                                } else {
                                    console.log('MySQL Not Saved');
                                    console.log(insert_report_entry_main_err)
                                }
                            });
                            client.create({
                                index: 'reports_mysql_es',
                                type: 'report',
                                body: {
                                    report_query: github_sql_report,
                                    report_name: name,
                                    report_body: report_json,
                                    report_columns: report_columns_json,
                                    published_at: now,
                                    report_id: random
                                }
                            }, function(elastic_save_report_err, elastic_save_report_res) {
                                if (elastic_save_report_err) {
                                    console.log('Error while saving to elastic.');
                                    console.log(elastic_save_report_err);
                                } else {
                                    console.log('Saved to elastic.');
                                }
                            });
                            res.redirect(302, '/reports/research');
                            console.log('Report Generated.');
                        } else {
                            console.log('Error while performing Production Query.');

                            res.status(select_github_sql_report_err.status || 500);
                            res.render('error', {
                                message: select_github_sql_report_err.message,
                                error: {}
                            });
                        }
                    });
                } else {
                    console.log(elastic_check_health_err);
                    res.status(elastic_check_health_err.status || 500);
                    res.render('error', {
                        message: elastic_check_health_err.message,
                        error: {}
                    });
                }
            });
        });
    });
    git_get.end();
    git_get.on('error', function(e) {
        console.error(e);
    });
}
exports.userregyesterday = function(req, res) {
    res.connection.setTimeout(0);
    var options = {
        host: 'api.github.com',
        path: '/repos/dealflow/dealflow.com/contents/dbscripts/reports/userregyesterday.sql',
        port: 443,
        headers: {
            'User-Agent': useragent,
            'Authorization': oauthtoken
        }
    };
    var git_query = '';
    var git_get = https.request(options, function(github_query_pull_res) {
        github_query_pull_res.on('data', function(d) {
            git_query += d;
        });
        github_query_pull_res.on('end', function() {
            git_query = JSON.parse(git_query);
            var github_sql_report = new Buffer(git_query.content, 'base64').toString('utf8');
            github_sql_report = github_sql_report.replace(/(?:\r\n|\r|\n)/g, ' ');
            var random = makeid();
            var now = new Date();
            var name = "User Registrations Yesterday";
            client.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
                if (!elastic_check_health_err) {
                    production.query(github_sql_report, function(select_github_sql_report_err, select_github_sql_report_rows, select_github_sql_report_fields) {
                        if (!select_github_sql_report_err) {
                            var report_json = JSON.stringify(select_github_sql_report_rows);
                            var report_columns_json = JSON.stringify(select_github_sql_report_fields);
                            var posta = {
                                report_id: random,
                                report_query: github_sql_report,
                                report_name: name,
                                created_at: now,
                                updated_at: now
                            };
                            var query = localdata.query('INSERT INTO reports_mysql SET ?', posta, function(insert_report_entry_main_err, insert_report_entry_main_res) {
                                if (!insert_report_entry_main_err) {
                                    console.log('Query Saved');
                                } else {
                                    console.log('MySQL Not Saved');
                                    console.log(insert_report_entry_main_err)
                                }
                            });
                            client.create({
                                index: 'reports_mysql_es',
                                type: 'report',
                                body: {
                                    report_query: github_sql_report,
                                    report_name: name,
                                    report_body: report_json,
                                    report_columns: report_columns_json,
                                    published_at: now,
                                    report_id: random
                                }
                            }, function(elastic_save_report_err, elastic_save_report_res) {
                                if (elastic_save_report_err) {
                                    console.log('Error while saving to elastic.');
                                    console.log(elastic_save_report_err);
                                } else {
                                    console.log('Saved to elastic.');
                                }
                            });
                            res.redirect(302, '/reports/research');
                            console.log('Report Generated.');
                        } else {
                            console.log('Error while performing Production Query.');

                            res.status(select_github_sql_report_err.status || 500);
                            res.render('error', {
                                message: select_github_sql_report_err.message,
                                error: {}
                            });
                        }
                    });
                } else {
                    console.log(elastic_check_health_err);
                    res.status(elastic_check_health_err.status || 500);
                    res.render('error', {
                        message: elastic_check_health_err.message,
                        error: {}
                    });
                }
            });
        });
    });
    git_get.end();
    git_get.on('error', function(e) {
        console.error(e);
    });
}
exports.optins = function(req, res) {
    res.connection.setTimeout(0);
    var options = {
        host: 'api.github.com',
        path: '/repos/dealflow/dealflow.com/contents/dbscripts/reports/optins.sql',
        port: 443,
        headers: {
            'User-Agent': useragent,
            'Authorization': oauthtoken
        }
    };
    var git_query = '';
    var git_get = https.request(options, function(github_query_pull_res) {
        github_query_pull_res.on('data', function(d) {
            git_query += d;
        });
        github_query_pull_res.on('end', function() {
            git_query = JSON.parse(git_query);
            var github_sql_report = new Buffer(git_query.content, 'base64').toString('utf8');
            github_sql_report = github_sql_report.replace(/(?:\r\n|\r|\n)/g, ' ');
            var random = makeid();
            var now = new Date();
            var name = "Recent Opt Ins";
            client.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
                if (!elastic_check_health_err) {
                    production.query(github_sql_report, function(select_github_sql_report_err, select_github_sql_report_rows, select_github_sql_report_fields) {
                        if (!select_github_sql_report_err) {
                            var report_json = JSON.stringify(select_github_sql_report_rows);
                            var report_columns_json = JSON.stringify(select_github_sql_report_fields);
                            var posta = {
                                report_id: random,
                                report_query: github_sql_report,
                                report_name: name,
                                created_at: now,
                                updated_at: now
                            };
                            var query = localdata.query('INSERT INTO reports_mysql SET ?', posta, function(insert_report_entry_main_err, insert_report_entry_main_res) {
                                if (!insert_report_entry_main_err) {
                                    console.log('Query Saved');
                                } else {
                                    console.log('MySQL Not Saved');
                                    console.log(insert_report_entry_main_err)
                                }
                            });
                            client.create({
                                index: 'reports_mysql_es',
                                type: 'report',
                                body: {
                                    report_query: github_sql_report,
                                    report_name: name,
                                    report_body: report_json,
                                    report_columns: report_columns_json,
                                    published_at: now,
                                    report_id: random
                                }
                            }, function(elastic_save_report_err, elastic_save_report_res) {
                                if (elastic_save_report_err) {
                                    console.log('Error while saving to elastic.');
                                    console.log(elastic_save_report_err);
                                } else {
                                    console.log('Saved to elastic.');
                                }
                            });
                            res.redirect(302, '/reports/research');
                            console.log('Report Generated.');
                        } else {
                            console.log('Error while performing Production Query.');

                            res.status(select_github_sql_report_err.status || 500);
                            res.render('error', {
                                message: select_github_sql_report_err.message,
                                error: {}
                            });
                        }
                    });
                } else {
                    console.log(elastic_check_health_err);
                    res.status(elastic_check_health_err.status || 500);
                    res.render('error', {
                        message: elastic_check_health_err.message,
                        error: {}
                    });
                }
            });
        });
    });
    git_get.end();
    git_get.on('error', function(e) {
        console.error(e);
    });
}
exports.alloptins = function(req, res) {
    res.connection.setTimeout(0);
    var options = {
        host: 'api.github.com',
        path: '/repos/dealflow/dealflow.com/contents/dbscripts/reports/alloptins.sql',
        port: 443,
        headers: {
            'User-Agent': useragent,
            'Authorization': oauthtoken
        }
    };
    var git_query = '';
    var git_get = https.request(options, function(github_query_pull_res) {
        github_query_pull_res.on('data', function(d) {
            git_query += d;
        });
        github_query_pull_res.on('end', function() {
            git_query = JSON.parse(git_query);
            var github_sql_report = new Buffer(git_query.content, 'base64').toString('utf8');
            github_sql_report = github_sql_report.replace(/(?:\r\n|\r|\n)/g, ' ');
            var random = makeid();
            var now = new Date();
            var name = "All Opt Ins";
            client.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
                if (!elastic_check_health_err) {
                    production.query(github_sql_report, function(select_github_sql_report_err, select_github_sql_report_rows, select_github_sql_report_fields) {
                        if (!select_github_sql_report_err) {
                            var report_json = JSON.stringify(select_github_sql_report_rows);
                            var report_columns_json = JSON.stringify(select_github_sql_report_fields);
                            var posta = {
                                report_id: random,
                                report_query: github_sql_report,
                                report_name: name,
                                created_at: now,
                                updated_at: now
                            };
                            var query = localdata.query('INSERT INTO reports_mysql SET ?', posta, function(insert_report_entry_main_err, insert_report_entry_main_res) {
                                if (!insert_report_entry_main_err) {
                                    console.log('Query Saved');
                                } else {
                                    console.log('MySQL Not Saved');
                                    console.log(insert_report_entry_main_err)
                                }
                            });
                            client.create({
                                index: 'reports_mysql_es',
                                type: 'report',
                                body: {
                                    report_query: github_sql_report,
                                    report_name: name,
                                    report_body: report_json,
                                    report_columns: report_columns_json,
                                    published_at: now,
                                    report_id: random
                                }
                            }, function(elastic_save_report_err, elastic_save_report_res) {
                                if (elastic_save_report_err) {
                                    console.log('Error while saving to elastic.');
                                    console.log(elastic_save_report_err);
                                } else {
                                    console.log('Saved to elastic.');
                                }
                            });
                            res.redirect(302, '/reports/research');
                            console.log('Report Generated.');
                        } else {
                            console.log('Error while performing Production Query.');

                            res.status(select_github_sql_report_err.status || 500);
                            res.render('error', {
                                message: select_github_sql_report_err.message,
                                error: {}
                            });
                        }
                    });
                } else {
                    console.log(elastic_check_health_err);
                    res.status(elastic_check_health_err.status || 500);
                    res.render('error', {
                        message: elastic_check_health_err.message,
                        error: {}
                    });
                }
            });
        });
    });
    git_get.end();
    git_get.on('error', function(e) {
        console.error(e);
    });
}
exports.spec = function(req, res) {
    res.connection.setTimeout(0);
    var options = {
        host: 'api.github.com',
        path: '/repos/dealflow/dealflow.com/contents/dbscripts/reports/spec.sql',
        port: 443,
        headers: {
            'User-Agent': useragent,
            'Authorization': oauthtoken
        }
    };
    var git_query = '';
    var git_get = https.request(options, function(github_query_pull_res) {
        github_query_pull_res.on('data', function(d) {
            git_query += d;
        });
        github_query_pull_res.on('end', function() {
            git_query = JSON.parse(git_query);
            var github_sql_report = new Buffer(git_query.content, 'base64').toString('utf8');
            github_sql_report = github_sql_report.replace(/(?:\r\n|\r|\n)/g, ' ');
            var random = makeid();
            var now = new Date();
            var name = "Spec";
            client.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
                if (!elastic_check_health_err) {
                    production.query(github_sql_report, function(select_github_sql_report_err, select_github_sql_report_rows, select_github_sql_report_fields) {
                        if (!select_github_sql_report_err) {
                            var report_json = JSON.stringify(select_github_sql_report_rows);
                            var report_columns_json = JSON.stringify(select_github_sql_report_fields);
                            var posta = {
                                report_id: random,
                                report_query: github_sql_report,
                                report_name: name,
                                created_at: now,
                                updated_at: now
                            };
                            var query = localdata.query('INSERT INTO reports_mysql SET ?', posta, function(insert_report_entry_main_err, insert_report_entry_main_res) {
                                if (!insert_report_entry_main_err) {
                                    console.log('Query Saved');
                                } else {
                                    console.log('MySQL Not Saved');
                                    console.log(insert_report_entry_main_err)
                                }
                            });
                            client.create({
                                index: 'reports_mysql_es',
                                type: 'report',
                                body: {
                                    report_query: github_sql_report,
                                    report_name: name,
                                    report_body: report_json,
                                    report_columns: report_columns_json,
                                    published_at: now,
                                    report_id: random
                                }
                            }, function(elastic_save_report_err, elastic_save_report_res) {
                                if (elastic_save_report_err) {
                                    console.log('Error while saving to elastic.');
                                    console.log(elastic_save_report_err);
                                } else {
                                    console.log('Saved to elastic.');
                                }
                            });
                            res.redirect(302, '/reports/research');
                            console.log('Report Generated.');
                        } else {
                            console.log('Error while performing Production Query.');

                            res.status(select_github_sql_report_err.status || 500);
                            res.render('error', {
                                message: select_github_sql_report_err.message,
                                error: {}
                            });
                        }
                    });
                } else {
                    console.log(elastic_check_health_err);
                    res.status(elastic_check_health_err.status || 500);
                    res.render('error', {
                        message: elastic_check_health_err.message,
                        error: {}
                    });
                }
            });
        });
    });
    git_get.end();
    git_get.on('error', function(e) {
        console.error(e);
    });
}
exports.claims = function(req, res) {
    res.connection.setTimeout(0);
    var options = {
        host: 'api.github.com',
        path: '/repos/dealflow/dealflow.com/contents/dbscripts/reports/claims.sql',
        port: 443,
        headers: {
            'User-Agent': useragent,
            'Authorization': oauthtoken
        }
    };
    var git_query = '';
    var git_get = https.request(options, function(github_query_pull_res) {
        github_query_pull_res.on('data', function(d) {
            git_query += d;
        });
        github_query_pull_res.on('end', function() {
            git_query = JSON.parse(git_query);
            var github_sql_report = new Buffer(git_query.content, 'base64').toString('utf8');
            github_sql_report = github_sql_report.replace(/(?:\r\n|\r|\n)/g, ' ');
            var random = makeid();
            var now = new Date();
            var name = "Claims";
            client.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
                if (!elastic_check_health_err) {
                    production.query(github_sql_report, function(select_github_sql_report_err, select_github_sql_report_rows, select_github_sql_report_fields) {
                        if (!select_github_sql_report_err) {
                            var report_json = JSON.stringify(select_github_sql_report_rows);
                            var report_columns_json = JSON.stringify(select_github_sql_report_fields);
                            var posta = {
                                report_id: random,
                                report_query: github_sql_report,
                                report_name: name,
                                created_at: now,
                                updated_at: now
                            };
                            var query = localdata.query('INSERT INTO reports_mysql SET ?', posta, function(insert_report_entry_main_err, insert_report_entry_main_res) {
                                if (!insert_report_entry_main_err) {
                                    console.log('Query Saved');
                                } else {
                                    console.log('MySQL Not Saved');
                                    console.log(insert_report_entry_main_err)
                                }
                            });
                            client.create({
                                index: 'reports_mysql_es',
                                type: 'report',
                                body: {
                                    report_query: github_sql_report,
                                    report_name: name,
                                    report_body: report_json,
                                    report_columns: report_columns_json,
                                    published_at: now,
                                    report_id: random
                                }
                            }, function(elastic_save_report_err, elastic_save_report_res) {
                                if (elastic_save_report_err) {
                                    console.log('Error while saving to elastic.');
                                    console.log(elastic_save_report_err);
                                } else {
                                    console.log('Saved to elastic.');
                                }
                            });
                            res.redirect(302, '/reports/research');
                            console.log('Report Generated.');
                        } else {
                            console.log('Error while performing Production Query.');

                            res.status(select_github_sql_report_err.status || 500);
                            res.render('error', {
                                message: select_github_sql_report_err.message,
                                error: {}
                            });
                        }
                    });
                } else {
                    console.log(elastic_check_health_err);
                    res.status(elastic_check_health_err.status || 500);
                    res.render('error', {
                        message: elastic_check_health_err.message,
                        error: {}
                    });
                }
            });
        });
    });
    git_get.end();
    git_get.on('error', function(e) {
        console.error(e);
    });
}
exports.appdeals = function(req, res) {
    res.connection.setTimeout(0);
    var options = {
        host: 'api.github.com',
        path: '/repos/dealflow/dealflow.com/contents/dbscripts/reports/appdeals.sql',
        port: 443,
        headers: {
            'User-Agent': useragent,
            'Authorization': oauthtoken
        }
    };
    var git_query = '';
    var git_get = https.request(options, function(github_query_pull_res) {
        github_query_pull_res.on('data', function(d) {
            git_query += d;
        });
        github_query_pull_res.on('end', function() {
            git_query = JSON.parse(git_query);
            var github_sql_report = new Buffer(git_query.content, 'base64').toString('utf8');
            github_sql_report = github_sql_report.replace(/(?:\r\n|\r|\n)/g, ' ');
            var random = makeid();
            var now = new Date();
            var name = "App Deals";
            client.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
                if (!elastic_check_health_err) {
                    production.query(github_sql_report, function(select_github_sql_report_err, select_github_sql_report_rows, select_github_sql_report_fields) {
                        if (!select_github_sql_report_err) {
                            var report_json = JSON.stringify(select_github_sql_report_rows);
                            var report_columns_json = JSON.stringify(select_github_sql_report_fields);
                            var posta = {
                                report_id: random,
                                report_query: github_sql_report,
                                report_name: name,
                                created_at: now,
                                updated_at: now
                            };
                            var query = localdata.query('INSERT INTO reports_mysql SET ?', posta, function(insert_report_entry_main_err, insert_report_entry_main_res) {
                                if (!insert_report_entry_main_err) {
                                    console.log('Query Saved');
                                } else {
                                    console.log('MySQL Not Saved');
                                    console.log(insert_report_entry_main_err)
                                }
                            });
                            client.create({
                                index: 'reports_mysql_es',
                                type: 'report',
                                body: {
                                    report_query: github_sql_report,
                                    report_name: name,
                                    report_body: report_json,
                                    report_columns: report_columns_json,
                                    published_at: now,
                                    report_id: random
                                }
                            }, function(elastic_save_report_err, elastic_save_report_res) {
                                if (elastic_save_report_err) {
                                    console.log('Error while saving to elastic.');
                                    console.log(elastic_save_report_err);
                                } else {
                                    console.log('Saved to elastic.');
                                }
                            });
                            res.redirect(302, '/reports/research');
                            console.log('Report Generated.');
                        } else {
                            console.log('Error while performing Production Query.');

                            res.status(select_github_sql_report_err.status || 500);
                            res.render('error', {
                                message: select_github_sql_report_err.message,
                                error: {}
                            });
                        }
                    });
                } else {
                    console.log(elastic_check_health_err);
                    res.status(elastic_check_health_err.status || 500);
                    res.render('error', {
                        message: elastic_check_health_err.message,
                        error: {}
                    });
                }
            });
        });
    });
    git_get.end();
    git_get.on('error', function(e) {
        console.error(e);
    });
}
exports.sugarcrm = function(req, res) {
    res.connection.setTimeout(0);
    var options = {
        host: 'api.github.com',
        path: '/repos/dealflow/dealflow.com/contents/dbscripts/reports/sugarcrm.sql',
        port: 443,
        headers: {
            'User-Agent': useragent,
            'Authorization': oauthtoken
        }
    };
    var git_query = '';
    var git_get = https.request(options, function(github_query_pull_res) {
        github_query_pull_res.on('data', function(d) {
            git_query += d;
        });
        github_query_pull_res.on('end', function() {
            git_query = JSON.parse(git_query);
            var github_sql_report = new Buffer(git_query.content, 'base64').toString('utf8');
            github_sql_report = github_sql_report.replace(/(?:\r\n|\r|\n)/g, ' ');
            var random = makeid();
            var now = new Date();
            var name = "Sugar CRM Export";
            client.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
                if (!elastic_check_health_err) {
                    production.query(github_sql_report, function(select_github_sql_report_err, select_github_sql_report_rows, select_github_sql_report_fields) {
                        if (!select_github_sql_report_err) {
                            var report_json = JSON.stringify(select_github_sql_report_rows);
                            var report_columns_json = JSON.stringify(select_github_sql_report_fields);
                            var posta = {
                                report_id: random,
                                report_query: github_sql_report,
                                report_name: name,
                                created_at: now,
                                updated_at: now
                            };
                            var query = localdata.query('INSERT INTO reports_mysql SET ?', posta, function(insert_report_entry_main_err, insert_report_entry_main_res) {
                                if (!insert_report_entry_main_err) {
                                    console.log('Query Saved');
                                } else {
                                    console.log('MySQL Not Saved');
                                    console.log(insert_report_entry_main_err)
                                }
                            });
                            client.create({
                                index: 'reports_mysql_es',
                                type: 'report',
                                body: {
                                    report_query: github_sql_report,
                                    report_name: name,
                                    report_body: report_json,
                                    report_columns: report_columns_json,
                                    published_at: now,
                                    report_id: random
                                }
                            }, function(elastic_save_report_err, elastic_save_report_res) {
                                if (elastic_save_report_err) {
                                    console.log('Error while saving to elastic.');
                                    console.log(elastic_save_report_err);
                                } else {
                                    console.log('Saved to elastic.');
                                }
                            });
                            res.redirect(302, '/reports/research');
                            console.log('Report Generated.');
                        } else {
                            console.log('Error while performing Production Query.');

                            res.status(select_github_sql_report_err.status || 500);
                            res.render('error', {
                                message: select_github_sql_report_err.message,
                                error: {}
                            });
                        }
                    });
                } else {
                    console.log(elastic_check_health_err);
                    res.status(elastic_check_health_err.status || 500);
                    res.render('error', {
                        message: elastic_check_health_err.message,
                        error: {}
                    });
                }
            });
        });
    });
    git_get.end();
    git_get.on('error', function(e) {
        console.error(e);
    });
}

exports.allleads = function(req, res) {
    res.connection.setTimeout(0);
    var options = {
        host: 'api.github.com',
        path: '/repos/dealflow/dealflow.com/contents/dbscripts/reports/allleads.sql',
        port: 443,
        headers: {
            'User-Agent': useragent,
            'Authorization': oauthtoken
        }
    };
    var git_query = '';
    var git_get = https.request(options, function(github_query_pull_res) {
        github_query_pull_res.on('data', function(d) {
            git_query += d;
        });
        github_query_pull_res.on('end', function() {
            git_query = JSON.parse(git_query);
            var github_sql_report = new Buffer(git_query.content, 'base64').toString('utf8');
            github_sql_report = github_sql_report.replace(/(?:\r\n|\r|\n)/g, ' ');
            var random = makeid();
            var now = new Date();
            var name = "All Leads Gathered via FTR";
            client.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
                if (!elastic_check_health_err) {
                    production.query(github_sql_report, function(select_github_sql_report_err, select_github_sql_report_rows, select_github_sql_report_fields) {
                        if (!select_github_sql_report_err) {
                            var report_json = JSON.stringify(select_github_sql_report_rows);
                            var report_columns_json = JSON.stringify(select_github_sql_report_fields);
                            var posta = {
                                report_id: random,
                                report_query: github_sql_report,
                                report_name: name,
                                created_at: now,
                                updated_at: now
                            };
                            var query = localdata.query('INSERT INTO reports_mysql SET ?', posta, function(insert_report_entry_main_err, insert_report_entry_main_res) {
                                if (!insert_report_entry_main_err) {
                                    console.log('Query Saved');
                                } else {
                                    console.log('MySQL Not Saved');
                                    console.log(insert_report_entry_main_err)
                                }
                            });
                            client.create({
                                index: 'reports_mysql_es',
                                type: 'report',
                                body: {
                                    report_query: github_sql_report,
                                    report_name: name,
                                    report_body: report_json,
                                    report_columns: report_columns_json,
                                    published_at: now,
                                    report_id: random
                                }
                            }, function(elastic_save_report_err, elastic_save_report_res) {
                                if (elastic_save_report_err) {
                                    console.log('Error while saving to elastic.');
                                    console.log(elastic_save_report_err);
                                } else {
                                    console.log('Saved to elastic.');
                                }
                            });
                            res.redirect(302, '/reports/research');
                            console.log('Report Generated.');
                        } else {
                            console.log('Error while performing Production Query.');

                            res.status(select_github_sql_report_err.status || 500);
                            res.render('error', {
                                message: select_github_sql_report_err.message,
                                error: {}
                            });
                        }
                    });
                } else {
                    console.log(elastic_check_health_err);
                    res.status(elastic_check_health_err.status || 500);
                    res.render('error', {
                        message: elastic_check_health_err.message,
                        error: {}
                    });
                }
            });
        });
    });
    git_get.end();
    git_get.on('error', function(e) {
        console.error(e);
    });
}

exports.customa = function(req, res) {
    res.connection.setTimeout(0);
    var options = {
        host: 'api.github.com',
        path: '/repos/dealflow/dealflow.com/contents/dbscripts/reports/customa.sql',
        port: 443,
        headers: {
            'User-Agent': useragent,
            'Authorization': oauthtoken
        }
    };
    var git_query = '';
    var git_get = https.request(options, function(github_query_pull_res) {
        github_query_pull_res.on('data', function(d) {
            git_query += d;
        });
        github_query_pull_res.on('end', function() {
            git_query = JSON.parse(git_query);
            var github_sql_report = new Buffer(git_query.content, 'base64').toString('utf8');
            github_sql_report = github_sql_report.replace(/(?:\r\n|\r|\n)/g, ' ');
            var random = makeid();
            var now = new Date();
            var name = "Custom Report A";
            client.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
                if (!elastic_check_health_err) {
                    production.query(github_sql_report, function(select_github_sql_report_err, select_github_sql_report_rows, select_github_sql_report_fields) {
                        if (!select_github_sql_report_err) {
                            var report_json = JSON.stringify(select_github_sql_report_rows);
                            var report_columns_json = JSON.stringify(select_github_sql_report_fields);
                            var posta = {
                                report_id: random,
                                report_query: github_sql_report,
                                report_name: name,
                                created_at: now,
                                updated_at: now
                            };
                            var query = localdata.query('INSERT INTO reports_mysql SET ?', posta, function(insert_report_entry_main_err, insert_report_entry_main_res) {
                                if (!insert_report_entry_main_err) {
                                    console.log('Query Saved');
                                } else {
                                    console.log('MySQL Not Saved');
                                    console.log(insert_report_entry_main_err)
                                }
                            });
                            client.create({
                                index: 'reports_mysql_es',
                                type: 'report',
                                body: {
                                    report_query: github_sql_report,
                                    report_name: name,
                                    report_body: report_json,
                                    report_columns: report_columns_json,
                                    published_at: now,
                                    report_id: random
                                }
                            }, function(elastic_save_report_err, elastic_save_report_res) {
                                if (elastic_save_report_err) {
                                    console.log('Error while saving to elastic.');
                                    console.log(elastic_save_report_err);
                                } else {
                                    console.log('Saved to elastic.');
                                }
                            });
                            res.redirect(302, '/reports/research');
                            console.log('Report Generated.');
                        } else {
                            console.log('Error while performing Production Query.');

                            res.status(select_github_sql_report_err.status || 500);
                            res.render('error', {
                                message: select_github_sql_report_err.message,
                                error: {}
                            });
                        }
                    });
                } else {
                    console.log(elastic_check_health_err);
                    res.status(elastic_check_health_err.status || 500);
                    res.render('error', {
                        message: elastic_check_health_err.message,
                        error: {}
                    });
                }
            });
        });
    });
    git_get.end();
    git_get.on('error', function(e) {
        console.error(e);
    });
}
exports.customb = function(req, res) {
    res.connection.setTimeout(0);
    var options = {
        host: 'api.github.com',
        path: '/repos/dealflow/dealflow.com/contents/dbscripts/reports/customeb.sql',
        port: 443,
        headers: {
            'User-Agent': useragent,
            'Authorization': oauthtoken
        }
    };
    var git_query = '';
    var git_get = https.request(options, function(github_query_pull_res) {
        github_query_pull_res.on('data', function(d) {
            git_query += d;
        });
        github_query_pull_res.on('end', function() {
            git_query = JSON.parse(git_query);
            var github_sql_report = new Buffer(git_query.content, 'base64').toString('utf8');
            github_sql_report = github_sql_report.replace(/(?:\r\n|\r|\n)/g, ' ');
            var random = makeid();
            var now = new Date();
            var name = "Custom Report B";
            client.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
                if (!elastic_check_health_err) {
                    production.query(github_sql_report, function(select_github_sql_report_err, select_github_sql_report_rows, select_github_sql_report_fields) {
                        if (!select_github_sql_report_err) {
                            var report_json = JSON.stringify(select_github_sql_report_rows);
                            var report_columns_json = JSON.stringify(select_github_sql_report_fields);
                            var posta = {
                                report_id: random,
                                report_query: github_sql_report,
                                report_name: name,
                                created_at: now,
                                updated_at: now
                            };
                            var query = localdata.query('INSERT INTO reports_mysql SET ?', posta, function(insert_report_entry_main_err, insert_report_entry_main_res) {
                                if (!insert_report_entry_main_err) {
                                    console.log('Query Saved');
                                } else {
                                    console.log('MySQL Not Saved');
                                    console.log(insert_report_entry_main_err)
                                }
                            });
                            client.create({
                                index: 'reports_mysql_es',
                                type: 'report',
                                body: {
                                    report_query: github_sql_report,
                                    report_name: name,
                                    report_body: report_json,
                                    report_columns: report_columns_json,
                                    published_at: now,
                                    report_id: random
                                }
                            }, function(elastic_save_report_err, elastic_save_report_res) {
                                if (elastic_save_report_err) {
                                    console.log('Error while saving to elastic.');
                                    console.log(elastic_save_report_err);
                                } else {
                                    console.log('Saved to elastic.');
                                }
                            });
                            res.redirect(302, '/reports/research');
                            console.log('Report Generated.');
                        } else {
                            console.log('Error while performing Production Query.');

                            res.status(select_github_sql_report_err.status || 500);
                            res.render('error', {
                                message: select_github_sql_report_err.message,
                                error: {}
                            });
                        }
                    });
                } else {
                    console.log(elastic_check_health_err);
                    res.status(elastic_check_health_err.status || 500);
                    res.render('error', {
                        message: elastic_check_health_err.message,
                        error: {}
                    });
                }
            });
        });
    });
    git_get.end();
    git_get.on('error', function(e) {
        console.error(e);
    });
}