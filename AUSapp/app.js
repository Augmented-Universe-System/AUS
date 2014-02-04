
/**
 * Module dependencies.
 */

var express = require('express')
  , routes  = require('./routes')
  , user    = require('./routes/user')
  , http    = require('http')
  , path    = require('path')
  , passport = require('passport');

var sockjs = require('sockjs');
var connections = [];
var chat = sockjs.createServer();
chat.on('connection', function(conn) {
    connections.push(conn);
    var number = connections.length;
    //conn.write("Welcome, User " + number);
    conn.on('data', function(message) {
        var messageData = eval("(" + message + ")");
        console.log(messageData.name);
        for (var ii=0; ii < connections.length; ii++) {
            connections[ii].write(message);
        }
    });
    conn.on('close', function() {
        for (var ii=0; ii < connections.length; ii++) {
            //connections[ii].write("User " + number + " has disconnected");
        }
    });
});


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// passport config
require('./pass');

// mongoose config
require('./db');

// routes
require('./routes/index')(app);
require('./routes/user')(app);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('App running at http://localhost:' + app.get('port'));
});

chat.installHandlers(server, {prefix:'/chat'});

var gith = require('gith').create(9001);

gith({
  repo: 'Augmented-Universe-System/AUS',
  branch: 'develop'
}).on( 'all', function(payload) {
  var util = require('util'),
      exec = require('child_process').exec,
      child;

  child = exec('. /home/project/AUS/deploy-develop.sh', // command line argument directly in string
    function (error, stdout, stderr) {      // one easy function to capture data/errors
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
  });
});
