angular.module('AUSapp').controller('Home', ['$scope', '$http', function($scope, $http) {

  $scope.sock = new SockJS('/sock');
  $scope.users = [];
  $scope.messages = [];
  $scope.myself = null;
  /*
  $scope.myname = "";
  $scope.myx = "5";
  $scope.myy = "5";
  */
  $scope.testI = 0;
  var canvas, ctx = "";

  function User(name) {
    this.name = name;
    this.locations = [{x:5,y:5}];
  }

  $scope.init = function() {

    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    canvas.width = 600;
    canvas.height = 450;
    canvas.style.border = "1px solid";

    $http.get('/user').success(function(data) {
      $scope.myself = new User(data.username);
      $scope.users.push($scope.myself);
    });
  };

  $scope.sock.onopen = function() {
    //trackLocation();
    setInterval(testLoop, 200);
  };

  function findUser(name, callback) {
    for (var i = 0; i < $scope.users.length; i++) {
      if ( $scope.users[i].name === name ) {
        callback($scope.users[i]);
        return;
      }
    }
    console.log("adding user");
    var u = new User(name);
    $scope.users.push(u);
    callback(u);
  }

  $scope.sock.onmessage = function(e) {
    var message = eval("(" + e.data + ")");
    console.log(message);
    if (message.type == "user-update") {
      findUser(message.name, function(user) {
        user.locations.push({x: message.x, y: message.y});
        render();
        $scope.$apply();
      });
    } else if (message.type == "user-chat") {
      $scope.messages.push(message);
    }
  };

  $scope.sendChat = function() {
    var chatMessage = {
      type: "user-chat",
      name: $scope.myname,
      messageBody: $scope.messageText
    };
      $scope.sock.send(JSON.stringify(chatMessage));
      $scope.messageText = "";
  };

//  function render() {
//    console.log($scope.users);
//    ctx.clearRect(0, 0, canvas.width, canvas.height);
//   for (var i=0; i < $scope.users.length; i++) {
//      var u = $scope.users[i];
//      console.log("name: " + $scope.myname);
//      if ( u.name == $scope.myname ) {
//        ctx.fillStyle="blue";
//      } else {
//        ctx.fillStyle="red";
//      }
//      var x = (u.x * 100000) % 100;
//      var y = (Math.abs(u.y) * 100000) % 100;
//      ctx.fillRect(x, y, 5, 5);
//      ctx.font = "10px Arial";
//      ctx.fillText(u.name, x - 9, y - 2);
//    }
//  }

  function render() {
    var counter = 1;

    for ( var i = 0; i < $scope.users.length; i++ ) {
      var user = $scope.users[i];
      console.log(user);
      ctx.clearRect(0, 0, 600, 450);

      var userLastLoc = lastLocation(user);

      var x = userLastLoc.x;
      var y = Math.abs(userLastLoc.y);
      //var x = (u.x * 100000) % 100;
      //var y = (Math.abs(u.y) * 100000) % 100;
      var firstX = x;
      var firstY = y;


      if ( user.name == $scope.myself.name ) {
        ctx.fillStyle="blue";
        img = new Image();
        img.onload = function() {
          ctx.drawImage(img, x, y);
        }
        img.src = "images/ausimg1.png";
        ctx.beginPath();
        ctx.moveTo(0, 7);
        ctx.lineTo(userLastLoc.x, Math.abs(userLastLoc.y) + 7);
        ctx.lineJoin = 'miter';
        ctx.stroke();

      } else {
        ctx.fillStyle="red";
        img = new Image();
        img.onload = function() {
          ctx.drawImage(img, x, y);
        }
        img.src = "images/ausimg2.png";
      }

      ctx.font = "13px Arial";
      ctx.fillText(user.name + " (" + counter + ")", x - 20, y - 5);
      counter ++;
    }
  }


  function trackLocation() {
    if (navigator.geolocation) {
      function updateLocation(lati, longi) {
        $scope.myself.locations.push({x: lati, y: longi});
        $scope.$apply();
      }
      var watchPOS = navigator.geolocation.watchPosition(function(position) {
        updateLocation(position.coords.latitude, position.coords.longitude);

       //render();

        $scope.$apply();
        var serverMessage = {
          type: "user-update",
          name: $scope.myself.name,
          x: lastLocation($scope.myself).x,
          y: lastLocation($scope.myself).y
        };
        $scope.sock.send(JSON.stringify(serverMessage));
      });
    }
    else{alert("Geolocation is not supported by this browser.");}
  }

  function lastLocation(user) {
    var tmpx = user.locations[user.locations.length-1].x;
    var tmpy = user.locations[user.locations.length-1].y;
    var lastLoc = {
      x: tmpx,
      y: tmpy
    };
    return lastLoc;
  }

  function testLoop() {
    var userLastLoc = lastLocation($scope.myself);
    if ($scope.testI % 8 == 0)
      $scope.myself.locations.push({x: (userLastLoc.x + 5), y: userLastLoc.y});
    else
      $scope.myself.locations.push({x: userLastLoc.x, y: (userLastLoc.y + 5)});
    $scope.$apply;
    var serverMessage = {
        type: "user-update",
        name: $scope.myself.name,
        x: lastLocation($scope.myself).x,
        y: lastLocation($scope.myself).y
       };
    $scope.sock.send(JSON.stringify(serverMessage));
    $scope.testI++;
  }

}]);
