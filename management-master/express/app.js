var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var consolidate = require('consolidate');
var bodyParser = require('body-parser') 

var managementRoutes = require('./routes/management/index');
var reportsRoutes = require('./routes/reports/index');
var designRoutes = require('./routes/design/index');
var marketingRoutes = require('./routes/marketing/index');
var publicationsRoutes = require('./routes/publications/index');
var staticRoutes = require('./routes/static/index');

var marketingTasks = require('./tasks/marketing/tasks');
var reportsTasks = require('./tasks/reports/tasks');

var app = express();

// view engine setup
app.engine('html', consolidate.swig);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/welcome', managementRoutes);
app.use('/reports', reportsRoutes);
app.use('/design', designRoutes);
app.use('/marketing', marketingRoutes);
app.use('/publications', publicationsRoutes);
app.use('/static', staticRoutes);

app.get('*', function(req, res){
  res.redirect('/');
});




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(3000);
module.exports = app;
