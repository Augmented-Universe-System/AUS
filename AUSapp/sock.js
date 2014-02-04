module.exports  = function(server) {

  var sockjs = require('sockjs');
  var connections = [];

  var sockServer = sockjs.createServer();

  sockServer.on('connection', function(conn) {
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

  sockServer.installHandlers(server, {prefix:'/sock'});
};
