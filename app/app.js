var express   = require('express');
var http      = require('http');
var path      = require('path');
var auth      = require('./lib/auth');
var db        = require('./lib/db');
var redirect  = require('./lib/redirect');
var user      = require('./controllers/user');

var app = express();

db.init(process.env.DATABASE_URL);
app.set('port', process.env.PORT || 80);
app.enable('trust proxy');
app.disable('x-powered-by');

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  app.use(express.logger('dev'));
}
app.use(express.favicon());
app.use(express.compress());
app.use(express.static(path.join(__dirname, 'public/nonsecure')));

// secure connection required from this line on
app.use(redirect(process.env.SSL_PORT || 443));

//app.use(express.json());
//app.use(express.urlencoded());
//app.use(express.methodOverride());

app.use(express.cookieParser(process.env.SECRET || 'mydirtylittlesecret'));
app.use(express.session({cookie: { secure: true }, proxy: true}));
app.use(auth);

// json api
app.use(app.router);

app.param('user', user.param.user);
app.get('/api/user/:user', user.user);

// static secure content
app.use(express.static(path.join(__dirname, 'public/secure')));
// serve index.html for all unrecognized routes
app.use(function(req, res, next) {
  if (req.method == 'GET') {
    res.sendfile(path.join(__dirname, 'public/secure/index.html'));
  } else {
    next();
  }
});

// launch server
http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
