var credentials = require('../credentials/development')
var elasticsearch = require('elasticsearch');
var mysql = require('mysql');

var main = mysql.createConnection(credentials.main);
var dealflow = mysql.createConnection(credentials.dealflow);
var marcom = mysql.createConnection(credentials.marcom);


var elastic = new elasticsearch.Client({
    host: 'http://localhost:9200',
    log: 'trace'
});



module.exports.datastores = { 'elastic': elastic, 'main': main, 'dealflow': dealflow, 'marcom': marcom };