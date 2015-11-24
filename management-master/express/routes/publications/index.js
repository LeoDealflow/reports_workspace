var express = require('express');
var environment = require('../../config/connect/environment');
var uploadHandler = require('../../components/publications/upload_handler');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res) {
    res.render('publications/index', { title: 'Marketing Component' });
});

router.get('/graphics', function(req, res) {
    res.render('publications/graphics');
});

router.get("/xml_processed", function(req, res) {
    var select_processed_xml_conversions = 'SELECT * FROM publications_reports';
    environment.datastores.main.query(select_processed_xml_conversions, function(select_processed_xml_conversions_err, select_processed_xml_conversions_rows, select_processed_xml_conversions_fields) {
        if (!select_processed_xml_conversions_err) {
            res.render('publications/xml_processed', {
                'query': select_processed_xml_conversions_rows
            });
        } else {
            res.status(select_processed_xml_conversions_err.status || 500);
            res.render('error', {
                message: 'Error printing XML list.',
                error: {}
            });
            res.end();
        }
    });
});

router.get("/url_processed", function(req, res) {
    var select_processed_url_conversions = 'SELECT * FROM publications_urlgen';
    environment.datastores.main.query(select_processed_url_conversions, function(select_processed_url_conversions_err, select_processed_url_conversions_rows, select_processed_url_conversions_fields) {
        if (!select_processed_url_conversions_err) {
            res.render('publications/url_processed', {
                'query': select_processed_url_conversions_rows
            });
        } else {
            res.status(select_processed_url_conversions_err.status || 500);
            res.render('error', {
                message: 'Error printing XML list.',
                error: {}
            });
            res.end();
        }
    });
});

router.get('/upload_report', function(req, res) {
    res.render('publications/upload_report');
});

router.get('/upload_urlset', function(req, res) {
    res.render('publications/upload_urlset');
});

router.post('/upload/:type', uploadHandler.multer.single('tabseparated'), function(req, res) {
    var random = uploadHandler.makeId();
    var now = new Date();
    var data = req.file.buffer;
    environment.datastores.elastic.cluster.health(function(check_health_err, check_health_res) {
        if (!check_health_err) {
            var data_json = JSON.stringify(data.toString('utf8'));
            var insertData = {
                data_id: random,
                created_at: now,
                updated_at: now,
                type: req.body.type
            };
            var selectSaveData, selectGetId, redirect, esIndex;
            if (req.params.type == 'report') {
                insertSaveData = 'INSERT INTO publications_reports SET ?';
                selectGetId = 'SELECT id AS myid FROM publications_reports WHERE data_id = ? LIMIT 1';
                redirect = '/publications/xml_processed';
                esIndex = 'publications_reports';
                esType = 'report';
            } else if (req.params.type == 'urlset') {
                insertSaveData = 'INSERT INTO publications_urlgen SET ?';
                selectGetId = 'SELECT id AS myid FROM publications_urlgen WHERE data_id = ? LIMIT 1';
                redirect = '/publications/url_processed';
                esIndex = 'publications_urlsets';
                esType = 'urlset'
            } else {
                res.status(elastic_get_report_err.status || 500);
                res.render('error', {
                    message: 'The upload type selected does not exist.',
                    error: {}
                });
                res.end();
            }
            environment.datastores.main.query(insertSaveData, insertData, function(save_data_entry_err, save_data_entry_res) {
                if (!save_data_entry_err) {
                    environment.datastores.main.query(selectGetId, [random], function(err, rows, fields) {
                        var myid = rows;
                        environment.datastores.elastic.create({
                            index: esIndex,
                            type: esType,
                            body: {
                                data_id: random,
                                data_body: data_json,
                                published_at: now,
                                mysql_id: myid[0]['myid']
                            }
                        }, function(save_data_body_err, save_data_body_res) {
                            if (save_data_body_err) {
                                res.status(elastic_get_report_err.status || 500);
                                res.render('error', {
                                    message: save_data_body_err.message,
                                    error: {}
                                });
                            } else {
                                res.redirect(redirect);
                                res.end();
                            }
                        });
                    });
                } else {
                    console.log('MySQL Entry Not Saved');
                    console.log(save_data_entry_err);
                    res.status(save_data_entry_err.status || 500);
                    res.render('error', {
                        message: save_data_entry_err.message,
                        error: {}
                    });
                }
            });
        } else {
            console.log('Elastic is down');
            console.log(check_health_err);
            res.status(check_health_err.status || 500);
            res.render('error', {
                message: check_health_err.message,
                error: {}
            });
        }
    });
});

router.get('/reports/:report/:rid', function(req, res) {
    var select_report_id = "SELECT * FROM publications_reports WHERE id = ?";
    environment.datastores.elastic.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
        if (!elastic_check_health_err) {
            environment.datastores.main.query(select_report_id, [req.params.rid], function(select_report_id_err, select_report_id_rows, select_report_id_fields) {
                if (!select_report_id_err) {
                    environment.datastores.elastic.search({
                        index: 'publications_reports',
                        q: 'data_id:' + select_report_id_rows[0].data_id
                    }, function(elastic_get_report_err, elastic_get_report_res) {
                        if (!elastic_get_report_err) {
                            if (elastic_get_report_res['hits']['total'] > 0) {
                                var report_tsv = JSON.parse(elastic_get_report_res['hits']['hits'][0]['_source']['data_body']);
                                var tsv = require("tsv");
                                var report_json = tsv.parse(report_tsv);
                                switch (req.params.report) {
                                    case 'datapub':
                                        res.render('publications/datapub', {
                                            'json_out': report_json,
                                            'length': report_json.length
                                        });
                                        break;
                                    case 'datapubc':
                                        res.render('publications/datapubc', {
                                            'json_out': report_json,
                                            'length': report_json.length
                                        });
                                        break;
                                    case 'oberland':
                                        res.render('publications/oberland', {
                                            'json_out': report_json,
                                            'length': report_json.length
                                        });
                                        break;
                                    case 'tailwind':
                                        res.render('publications/tailwind', {
                                            'json_out': report_json,
                                            'length': report_json.length
                                        });
                                        break;
                                    case 'creative':
                                        res.render('publications/creative', {
                                            'json_out': report_json,
                                            'length': report_json.length
                                        });
                                        break;
                                    case 'custom':
                                        res.render('publications/custom', {
                                            'json_out': report_json,
                                            'length': report_json.length
                                        });
                                        break;
                                }
                            } else {
                                res.render('error', {
                                    message: "There are no reports for this selection.",
                                    error: {}
                                });
                            }
                        } else {
                            res.status(elastic_get_report_err.status || 500);
                            res.render('error', {
                                message: elastic_get_report_err.message,
                                error: {}
                            });

                        }
                    });
                } else {
                    console.log(select_report_id_err);
                    res.status(select_report_id_err.status || 500);
                    res.render('error', {
                        message: select_report_id_err.message,
                        error: {}
                    });
                }
            });
        } else {
            res.status(elastic_check_health_err.status || 500);
            res.render('error', {
                message: elastic_check_health_err.message,
                error: {}
            });
        }
    });
});

router.get('/urlset/:set/:sid', function(req, res) {
    var select_set_id = "SELECT * FROM publications_urlgen WHERE id = ?";
    environment.datastores.elastic.cluster.health(function(elastic_check_health_err, elastic_check_health_res) {
        if (!elastic_check_health_err) {
            environment.datastores.main.query(select_set_id, [req.params.sid], function(select_set_id_err, select_set_id_rows, select_set_id_fields) {
                if (!select_set_id_err) {
                    environment.datastores.elastic.search({
                        index: 'publications_urlsets',
                        q: 'data_id:' + select_set_id_rows[0].data_id
                    }, function(elastic_get_set_err, elastic_get_set_res) {
                        if (!elastic_get_set_err) {
                            if (elastic_get_set_res['hits']['total'] > 0) {
                                var set_tsv = JSON.parse(elastic_get_set_res['hits']['hits'][0]['_source']['data_body']);
                                var tsv = require("tsv");
                                var set_json = tsv.parse(set_tsv);
                                switch (req.params.set) {
                                    case 'datapub':
                                        res.render('publications/urlset', {
                                            'json_out': set_json
                                        });
                                        break;
                                    case 'other':
                                        res.render('publications/urlset', {
                                            'json_out': set_json
                                        });
                                        break;
                                }
                            } else {
                                res.render('error', {
                                    message: "There are no reports for this selection.",
                                    error: {}
                                });
                            }
                        } else {
                            res.status(elastic_get_set_err.status || 500);
                            res.render('error', {
                                message: elastic_get_set_err.message,
                                error: {}
                            });

                        }
                    });
                } else {
                    console.log(select_set_id_err);
                    res.status(select_set_id_err.status || 500);
                    res.render('error', {
                        message: select_set_id_err.message,
                        error: {}
                    });
                }
            });
        } else {
            res.status(elastic_check_health_err.status || 500);
            res.render('error', {
                message: elastic_check_health_err.message,
                error: {}
            });
        }
    });
});

module.exports = router;