var express = require('express');
var router = express.Router();
var environment = require('../../config/connect/environment');
var sqlreports = require('../../components/reports/reports_sql');
var googlereports = require('../../components/reports/reports_google');
var sendgridreports = require('../../components/reports/reports_sendgrid');

/* GET home page. */
router.get('/', function(req, res, next) {
    var select_google_analytics_local = 'SELECT * FROM reports_analytics_pulls_core ORDER BY id DESC LIMIT 1;';
    environment.datastores.main.query(select_google_analytics_local, function(select_google_analytics_local_err, select_google_analytics_local_res) {
        if (!select_google_analytics_local_err) {
            //Pulled the date of the most recent row in the table; The next pull should be carried out for the next day unless the next day is current, where current is any day within the delay window. 
            var last, now, delay, pull;
            var unixday = 1000 * 60 * 60 * 24;
            //Set delay manually; so if this database shoul not be updated with events more recent than n days ago, set delay to n;
            //Set dealy to 3 days as default.
            delay = 1;
            if (select_google_analytics_local_res[0]) {
                //Get last updated day and generate a timestamp that strictly describes the cuurrent day, month, and year, omitting time in hours, minutes, seconds, milliseconds.
                last = new Date(Date.parse(select_google_analytics_local_res[0]['pull_date']));
                last = last.getTime();
            } else {
                last = '2015-06-01';
                last = new Date(last).getTime();
            }
            //Get today and generate a timestamp that strictly describes the cuurrent day, month, and year, omitting time in hours, minutes, seconds, milliseconds.
            var now = new Date();
            var today = now.getFullYear() + '-';
            today += ((now.getMonth() + 1) < 10) ? '0' + (now.getMonth() + 1) + '-' : (now.getMonth() + 1) + '-';
            today += (now.getDate() < 10) ? '0' + now.getDate() : now.getDate();
            today = new Date(today);
            today = today.getTime();

            //Begin the single day query against Google Analytics
            pull = last;
            if (pull < today - (delay * unixday) - unixday) {
                pull = new Date(pull);
                var date = pull.getFullYear() + '-';
                date += ((pull.getMonth() + 1) < 10) ? '0' + (pull.getMonth() + 1) + '-' : (pull.getMonth() + 1) + '-';
                date += (pull.getDate() < 10) ? '0' + pull.getDate() : pull.getDate();
                var select_processed_mysql_reports = 'SELECT * FROM reports_mysql';
                environment.datastores.main.query(select_processed_mysql_reports, function(select_processed_mysql_reports_err, select_processed_mysql_reports_rows, select_processed_mysql_reports_fields) {
                    if (!select_processed_mysql_reports_err) {
                        res.render('reports/index', {
                            query: select_processed_mysql_reports_rows,
                            title: 'Reporting Component',
                            date: date,
                            current: false
                        });
                    } else {
                        res.status(select_processed_mysql_reports_err.status || 500);
                        res.render('error', {
                            message: 'Error printing MySQL reports list.',
                            error: {}
                        });
                        res.end();
                    }
                });

            } else {
                var select_processed_mysql_reports = 'SELECT * FROM reports_mysql';
                pull = new Date(pull);
                var date = pull.getFullYear() + '-';
                date += ((pull.getMonth() + 1) < 10) ? '0' + (pull.getMonth() + 1) + '-' : (pull.getMonth() + 1) + '-';
                date += (pull.getDate() < 10) ? '0' + pull.getDate() : pull.getDate();
                var select_processed_mysql_reports = 'SELECT * FROM reports_mysql';
                environment.datastores.main.query(select_processed_mysql_reports, function(select_processed_mysql_reports_err, select_processed_mysql_reports_rows, select_processed_mysql_reports_fields) {
                    if (!select_processed_mysql_reports_err) {
                        res.render('reports/index', {
                            query: select_processed_mysql_reports_rows,
                            title: 'Reporting Component',
                            date: date,
                            current: true
                        });
                    } else {
                        res.status(select_processed_mysql_reports_err.status || 500);
                        res.render('error', {
                            message: 'Error printing MySQL reports list.',
                            error: {}
                        });
                        res.end();
                    }
                });
            }
        }
    });

});

router.get('/research', function(req, res, next) {
    var select_processed_mysql_reports = 'SELECT * FROM reports_mysql';
    environment.datastores.main.query(select_processed_mysql_reports, function(select_processed_mysql_reports_err, select_processed_mysql_reports_rows, select_processed_mysql_reports_fields) {
        if (!select_processed_mysql_reports_err) {
            res.render('reports/research-table', {
                query: select_processed_mysql_reports_rows,
                title: 'Reporting Component'
            });
        } else {
            res.status(select_processed_mysql_reports_err.status || 500);
            res.render('error', {
                message: 'Error printing MySQL reports list.',
                error: {}
            });
            res.end();
        }
    });

});


/** MySQL Exporters **/
router.get('/mycsv', sqlreports.reportscsv);
router.get('/mytsv', sqlreports.reportstsv);

/** MySQL Basic Generators **/
router.get("/accreditedverify", sqlreports.accredited_verify)
router.get("/accreditedverifystatusga", sqlreports.accredited_verify_status_analytics);
router.get("/accreditedverifycomments", sqlreports.accredited_verify_comments);

/** MySQL Github Generators **/
router.get("/accreditedverifystatus", sqlreports.accredited_verify_status);
router.get("/sendgrid", sqlreports.sendgrid)
router.get("/cowowebsite", sqlreports.cowowebsite);
router.get("/cofewtags", sqlreports.cofewtags);
router.get("/cosourceteam", sqlreports.cosourceteam);
router.get("/coswsameaddress", sqlreports.coswsameaddress);
router.get("/confundofferingorclosed", sqlreports.confundofferingorclosed);
router.get("/colocation", sqlreports.colocation);
router.get("/allpeople", sqlreports.allpeople);
router.get("/coswmultideals", sqlreports.coswmultideals);
router.get("/coswsamename", sqlreports.coswsamename);
router.get("/userregyesterday", sqlreports.userregyesterday);
router.get("/optins", sqlreports.optins);
router.get("/alloptins", sqlreports.alloptins);
router.get("/spec", sqlreports.spec);
router.get("/claims", sqlreports.claims);
router.get("/appdeals", sqlreports.appdeals);
router.get("/sugarcrm", sqlreports.sugarcrm);
router.get("/allleads", sqlreports.allleads);
router.get("/customa", sqlreports.customa);
router.get("/customb", sqlreports.customb);
/** <- End MySQL Report Related **/

/** Google Analytics Report Related via ./components/reports/reports_google.js **/
router.get("/gaoauthcallback", googlereports.gaoauthcallback);
router.get("/auth", googlereports.auth);
router.get("/getgaonline", googlereports.analytics_online);
router.get("/getgarecent", googlereports.analytics_local_recent);
router.get("/getgapast", googlereports.analytics_local_archive);
router.get("/gaform", googlereports.analytics_form);
router.get("/getsggarecent", sendgridreports.sendgrid_analytics_local_recent)
router.get("/getsglocalrecent", sendgridreports.sendgrid_local_recent)

module.exports = router;