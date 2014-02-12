angular.module('AUSapp').controller('Home', ['$scope', '$http', function($scope, $http) {

  $scope.sock = new SockJS('/sock');
  $scope.users = [];
  $scope.messages = [];
  $scope.myname = "";
  $scope.myx = "";
  $scope.myy = "";
  var canvas, ctx = "";

  $scope.init = function() {

    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    canvas.width = 600;
    canvas.height = 450;
    canvas.style.border = "1px solid";

    $http.get('/user').success(function(data) {
      $scope.myname = data.username;
    });

  };

  $scope.sock.onopen = function() {
    trackLocation();
  };

  $scope.sock.onmessage = function(e) {
    var message = eval("(" + e.data + ")");
    console.log(message);
    if (message.type == "user-update") {
      $scope.users[message.name] = message;
      render();
      $scope.$apply();
    }
    else if (message.type == "user-chat") {
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
    for ( var user in $scope.users ) {
      ctx.clearRect(0, 0, 600, 450);
      var u = $scope.users[user];
      console.log(user);

      var x = (u.x * 100000) % 100;
      var y = (Math.abs(u.y) * 100000) % 100;

      if ( u.name == $scope.myname ) {
        ctx.fillStyle="blue";
        img = new Image();
        img.onload = function() {
          ctx.drawImage(img, x, y);
        }
        img.src = "images/ausimg1.png";
      } else {
        ctx.fillStyle="red";
        img = new Image();
        img.onload = function() {
          ctx.drawImage(img, x, y);
        }
        img.src = "images/ausimg2.png";
      }

      ctx.font = "13px Arial";
      ctx.fillText(u.name + " (" + counter + ")", x - 20, y - 5);
      counter ++;
    }
  }


  function trackLocation() {
    if (navigator.geolocation) {
      function updateLocation(lati, longi) {
        $scope.myx = lati;
        $scope.myy = longi;
        $scope.$apply();
      }
      var watchPOS = navigator.geolocation.watchPosition(function(position) {
        updateLocation(position.coords.latitude, position.coords.longitude);

        render();

        $scope.$apply();
        var serverMessage = {
          type: "user-update",
          name: $scope.myname,
          x: $scope.myx,
          y: $scope.myy
        };
        $scope.sock.send(JSON.stringify(serverMessage));
      });
    }
    else{alert("Geolocation is not supported by this browser.");}
  }

}]);
