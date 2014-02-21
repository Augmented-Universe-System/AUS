angular.module('AUSapp').controller('Home', ['$scope', '$http', function($scope, $http) {

  var sock = new SockJS('/sock');
  $scope.users = [];
  $scope.messages = [];
  $scope.myself = null;
  $scope.testI = 0;

  var canvas, ctx;
  var rectangleDrawn = false;
  var myImg = new Image();
  var imgRed = new Image();
  imgRed.src = "images/ausimg2.png";
  myImg.src = "images/ausimg1.png";

  function User(name) {
    this.name = name;
    this.locations = [{}];
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

    // get user from server API
    $http.get('/user').success(function(data) {
      $scope.myself = new User(data.username);
      $scope.users.push($scope.myself);
      // create a Message to send
      var chatMessage = {
        type: "user-chat",
        name: "",
        messageBody: data.username + " has logged in!",
        chatDate: $scope.formatTwelve(d)
      };
      // **RACE CONDITIONS** delay sending message
      setTimeout( function() {
        sock.send(JSON.stringify(chatMessage));
      }, 500);
      // Get users avatar
    });

  };


  sock.onopen = function() {
    setInterval(testLoop, 2000);
    //trackLocation();
  };

  sock.onmessage = function(e) {
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
      console.log($scope.messages);
    }
  };

  $scope.sendChat = function() {
    var chatMessage = {
      type: "user-chat",
      name: $scope.myself.name,
      messageBody: $scope.messageText,
      chatDate: $scope.formatTwelve(d),
    };
      sock.send(JSON.stringify(chatMessage));
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
      var userSecToLastLoc = secondToLastLoc(user);
      console.log("This is the user's first location: " + userFirstLoc.x + " " + userFirstLoc.y);
      console.log("This is the user's last location: " + userLastLoc.x + " " + userLastLoc.y);
      console.log("This is the user's second to last location: " + userSecToLastLoc.x + " " + userSecToLastLoc.y);

      var x = userLastLoc.x;
      var y = userLastLoc.y;
      var x2 = userSecToLastLoc.x;
      var y2 = userSecToLastLoc.y;


      console.log("This is x in render() " + x + " ; This is y in render() " + y);
      //var x = (u.x * 100000) % 100;
      //var y = (Math.abs(u.y) * 100000) % 100;
      //var firstX = x;
      //var firstY = y;

      if ( user.name == $scope.myself.name ) {
        ctx.fillStyle="blue";
        ctx.strokeStyle="blue";
        ctx.drawImage(myImg, x, y);
      } else {
        ctx.fillStyle="red";
        ctx.strokeStyle="red";
        ctx.drawImage(imgRed, x, y);
      }

      ctx.beginPath();
      ctx.moveTo(userFirstLoc.x, userFirstLoc.y);
      for(i = 0; i < user.locations.length; i++) {
        ctx.lineTo(user.locations[i].x, Math.abs(user.locations[i].y));
      }
      ctx.lineJoin = 'miter';
      ctx.stroke();


      ctx.font = "13px Arial";
      ctx.fillText(user.name, x - 10, y - 5);
      //ctx.fillText(user.name + " (" + counter + ")", x - 20, y - 5);
      //counter ++;
    }
  }


  function trackLocation() {
    if (navigator.geolocation) {
      function updateLocation(lati, longi) {
        //var add = 5;
        $scope.myself.locations.push({x: lati, y: longi});
        console.log("Latitude in trackLocation() " + lati + " ; Longitude in trackLocation() " + longi);
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
        sock.send(JSON.stringify(serverMessage));
      });
    }
    else{alert("Geolocation is not supported by this browser.");}
  }

  function firstLocation(user) {
    var tmpx = user.locations[1].x;
    var tmpy = Math.abs(user.locations[1].y);
    var firstLoc = {
      x: tmpx,
      y: tmpy
    };
    return firstLoc;
  }

  function secondToLastLoc(user) {
    var tmpx = user.locations[user.locations.length-2].x;
    var tmpy = Math.abs(user.locations[user.locations.length-2].y);
    var secToLastLoc = {
      x: tmpx,
      y: tmpy
    };
    return secToLastLoc;
  }

  function lastLocation(user) {
    var tmpx = user.locations[user.locations.length-1].x;
    var tmpy = Math.abs(user.locations[user.locations.length-1].y);
    var lastLoc = {
      x: tmpx,
      y: tmpy
    };
    return lastLoc;
  }

function testLoop() {
    //var userLastLoc = lastLocation($scope.myself);

    // generate random coordinates between 10-400 for x and 10-300 for y
    var minX = 10;
    var maxX = 400;
    var randX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;

    var minY = 10;
    var maxY = 400;
    var randY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

    console.log("random coordinates: rand x: " + randX + ", rand y: " + randY );

    $scope.myself.locations.push({x: randX, y: randY});
    $scope.apply;

    /*
    if ($scope.testI % 8 == 0)
      $scope.myself.locations.push({x: (userLastLoc.x + 35), y: userLastLoc.y});
    else
      $scope.myself.locations.push({x: userLastLoc.x, y: (userLastLoc.y + 5)});
    $scope.$apply;*/
    var serverMessage = {
        type: "user-update",
        name: $scope.myself.name,
        x: randX,
        y: randY

        //x: lastLocation($scope.myself).x,
        //y: lastLocation($scope.myself).y
       };
    sock.send(JSON.stringify(serverMessage));
    //$scope.testI++;
    
  }

  function getAvatar(name) {
    var url = 'https://api.github.com/users/' + data.username;
    $http.get(url).success(function(data) {
      //myImg.src = data.avatar_url;
      //myImg.src = "images/ausimg1.png";
      if (data.avatar_url) {
        console.log(data.avatar_url);
      } else {
        console.log('no image');
      }
    }).error(function(data) {
      // set a default avatar if failed
      myImg.src = "images/ausimg1.png";
    });
  }
}]);
