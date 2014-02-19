angular.module('AUSapp').controller('Home', ['$scope', '$http', function($scope, $http) {

  $scope.sock = new SockJS('/sock');
  $scope.users = [];
  $scope.messages = [];
  $scope.myself = null;
  $scope.testI = 0;

  var canvas, ctx;
  var rectangleDrawn = false;
  var imgBlue = new Image();
  var imgRed = new Image();
  imgBlue.src = "images/ausimg1.png";
  imgRed.src = "images/ausimg2.png";

  function User(name) {
    this.name = name;
    this.locations = [{x:5,y:5}];
  }

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

  var d = new Date();

  $scope.formatTwelve = function(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+ minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
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
      var chatMessage = {
        type: "user-chat",
        name: "",
        messageBody: data.username + " has logged in!",
        chatDate: $scope.formatTwelve(d)
      };
      $scope.sock.send(JSON.stringify(chatMessage));
    });

  };

  $scope.sock.onopen = function() {
    //setInterval(testLoop, 200);
    trackLocation();
  };

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
      name: $scope.myself.name,
      messageBody: $scope.messageText,
      chatDate: $scope.formatTwelve(d),
    };
      $scope.sock.send(JSON.stringify(chatMessage));
      $scope.messageText = "";
  };

  function render() {
    ctx.clearRect(0, 0, 600, 450);
    var counter = 1;

    for ( var i = 0; i < $scope.users.length; i++ ) {
      var user = $scope.users[i];
      console.log(user);

      var userLastLoc = lastLocation(user);
      var userFirstLoc = firstLocation(user);

      var x = userLastLoc.x;
      var y = Math.abs(userLastLoc.y);
      //var x = (u.x * 100000) % 100;
      //var y = (Math.abs(u.y) * 100000) % 100;
      //var firstX = x;
      //var firstY = y;

      if ( user.name == $scope.myself.name ) {
        ctx.fillStyle="blue";
        ctx.strokeStyle="blue";
        ctx.drawImage(imgBlue, x, y);
      } else {
        ctx.fillStyle="red";
        ctx.strokeStyle="red";
        ctx.drawImage(imgRed, x, y);
      }
      ctx.beginPath();
      ctx.moveTo(userFirstLoc.x, userFirstLoc.y);
      for(i = 0; i < user.locations.length; i++) {
        ctx.lineTo(user.locations[i].x, user.locations[i].y);
      }
      ctx.lineJoin = 'miter';
      ctx.stroke();


      ctx.font = "13px Arial";
      ctx.fillText(user.name + " (" + counter + ")", x - 20, y - 5);
      counter ++;
    }
  }


  function trackLocation() {
    if (navigator.geolocation) {
      function updateLocation(lati, longi) {
        var add = 5;
        $scope.myself.locations.push({x: lati+add, y: longi-add});
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

  function firstLocation(user) {
    var tmpx = user.locations[0].x;
    var tmpy = user.locations[0].y;
    var firstLoc = {
      x: tmpx,
      y: tmpy
    };
    return firstLoc;
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
      $scope.myself.locations.push({x: (userLastLoc.x + 35), y: userLastLoc.y});
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
