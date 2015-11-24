var multer = require('multer');
var storage = multer.memoryStorage();
var fs = require('fs');
var environment = require('../../config/connect/environment.js');

var makeId = function() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 64; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
module.exports.makeId = makeId;

module.exports.multer = multer({ storage: storage });