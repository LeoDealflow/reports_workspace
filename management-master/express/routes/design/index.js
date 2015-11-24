var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.header);
  res.render('design/index', { title: 'Design Component' });
});

module.exports = router;
