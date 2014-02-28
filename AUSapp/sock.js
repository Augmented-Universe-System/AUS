module.exports  = function(server, db) {

  var mongoose = require('mongoose');
  var User = mongoose.model('User');
  var sockjs = require('sockjs');
  var sockServer = sockjs.createServer();
  var connections = [];

  var fruits = [];
  var MAX_FRUIT = 4;
  for (var i = 0; i < MAX_FRUIT; i++ ) {
    generateFruit();
  };

  function Fruit(xx, yy) {
    console.log("Creating new fruit.");
    this.loc = {x: xx, y: yy};
  }

  function generateFruit() {
    var minX = 10;
    var maxX = 590;
    var randX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;

    var minY = 10;
    var maxY = 440;
    var randY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

    var newFruit = new Fruit(randX, randY);
    fruits.push(newFruit);
  }

  sockServer.on('connection', function(conn) {
      connections.push(conn);
      var number = connections.length;
      //conn.write("Welcome, User " + number);
      conn.on('data', function(message) {
          var messageData = eval("(" + message + ")");
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
          if ( messageData.type == "user-login" ) {
            messageData.fruits = fruits;
          } 
          if ( messageData.type == "user-score") {
            var f = parseInt(messageData.fruitName.slice(-1));
            fruits[f] = generateFruit();
            messageData.fruits = fruits;
          }
          // inform all connected users
          for (var ii=0; ii < connections.length; ii++) {
              var outgoingMessage = JSON.stringify(messageData);
              connections[ii].write(outgoingMessage);
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
