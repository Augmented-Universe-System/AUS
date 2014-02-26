module.exports  = function(server, db) {

  var mongoose = require('mongoose');
  var User = mongoose.model('User');
  var sockjs = require('sockjs');
  var connections = [];
  var fruits = [];

  var sockServer = sockjs.createServer();

  function Fruit(x, y) {
    console.log("Creating new fruit.");
    this.fruitLocation = [{}];
  }

  function generateFruit() {
    var minX = 10;
    var maxX = 590;
    var randX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;

    var minY = 10;
    var maxY = 440;
    var randY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

    var newFruit = new Fruit(randX, randY);
    $scope.fruits.push(newFruit);
    $scope.apply;
  }

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
          if ( messageData.type == "fruit-update" ) {
            generateFruit();   
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
