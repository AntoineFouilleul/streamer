var express = require('express');
var helmet = require('helmet');
var http = require('http');
var https = require('https');
var morgan = require('morgan');
var fs = require('fs');
var path = require('path');
var sha512 = require('js-sha512').sha512;

var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;

var config = require('./config/config.json');
var router = require('./server/router');
 
var app = express();
if (config.app.https) {
    var privateKey  = fs.readFileSync(config.app.privateKey, 'utf8');
    var certificate = fs.readFileSync(config.app.certificate, 'utf8');
}
var server = config.app.https ? https.createServer({ key: privateKey, cert: certificate }, app) : http.createServer(app);
app.use(helmet());
app.use(morgan('combined')); // Active le middleware de logging
app.use(passport.initialize());
app.use('/', passport.authenticate('basic', { session: false }));
app.use('/rest', router);
app.use('/', express.static(path.join(__dirname, 'dist')));

passport.use(new BasicStrategy(
    function(username, password, done) {
      if (config.users[username] && config.users[username] === sha512(password)) {
        return done(null, { username });
      }
      return done(null, false, { message: 'Incorrect password.' });      
    }
));

// Tweaks to handle Angular routes
app.get('/:id/:id?/:id?', function(req, res) {
    res.sendfile('./dist/index.html');
})


// Redirect other page
app.use(function(req, res) {
    console.error('Router error: Unknow route (' + req.url + ')');
    return res.sendStatus(404);
});

// development error handler
// will print stacktrace
app.use(function(err, req, res) {
    err = err || {};
    var msg = err.message || err.msg || 'Internal Server Error';
    if (err.message || err.msg) {
        console.error(msg);
    }
    if (!err.hideStack && !err.statusCode) {
        console.error(error.stack);
    }
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }
  
    var bind = `Port ${config.app.port}`;
  
    // handle specific listen errors with friendly messages
    switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
    }
}
  
/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}

/*
 * Start server
 */
server.listen(config.app.port, config.app.host);
server.on('error', onError);
server.on('listening', onListening);
