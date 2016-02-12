var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var routes = require('./routes/index');
var movies = require('./routes/movies');
var states = require('./routes/states');
var allocine = require('./routes/allocine');

mongoose.connect('mongodb://'+process.env.MONGO_USER+':'+process.env.MONGO_PASSWD+'@'+process.env.MONGO_HOSTNAME+':'+process.env.MONGO_PORT+'/cinema');

var app = express();
var context = '/api';

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

app.use(logger('dev'));
app.use(bodyParser.json({
  limit: '50mb'
}));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '50mb'
}));
app.use(cookieParser());

app.use(context + '/', routes);
app.use(context + '/movies', movies);
app.use(context + '/states', states);
app.use(context + '/allocine', allocine);

//front
app.use('/front', express.static('./.tmp/serve/'));
app.use('/bower_components', express.static('./bower_components'));
app.use('/front/app', express.static('./fo/src/app'));
app.use('/front/assets', express.static('./fo/src/assets'));

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
  app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
      title: 'error'
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
  console.log(err);
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {},
    title: 'error'
  });
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

