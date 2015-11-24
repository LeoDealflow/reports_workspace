var express = require('express');
var router = express.Router();
var environment = require('../../config/connect/environment');
var sendgridHandler = require('../../components/marketing/sendgrid_handler');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.header);
  res.render('marketing/index', { title: 'Marketing Component' });
});

router.get('/task_move_events_local/', sendgridHandler.task_move_events_local)

module.exports = router;
