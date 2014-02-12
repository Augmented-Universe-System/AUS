module.exports  = function(server, db) {

  var mongoose = require('mongoose');
  var User = mongoose.model('User');
  var sockjs = require('sockjs');
  var connections = [];

  var sockServer = sockjs.createServer();

  sockServer.on('connection', function(conn) {
      connections.push(conn);
      var number = connections.length;
      //conn.write("Welcome, User " + number);
      conn.on('data', function(message) {
          var messageData = eval("(" + message + ")");
          // inform all connected users
          for (var ii=0; ii < connections.length; ii++) {
              connections[ii].write(message);
          }
          if ( messageData.type == "user-update" ) {
            // update the DB
            User.findOne( { username: messageData.name }, function(err, user) {
              user.lastLocation = { x: messageData.x, y: messageData.y };
              user.updated = Date.now();
              user.save( function(err, updatedUser, count) {
                console.log("updated: " + updatedUser.lastLocation.x);
              });
              console.log(user.username);
            });
          }
      });
      conn.on('close', function() {
          for (var ii=0; ii < connections.length; ii++) {
              //connections[ii].write("User " + number + " has disconnected");
          }
      });
  });

  sockServer.installHandlers(server, {prefix:'/sock'});
};
