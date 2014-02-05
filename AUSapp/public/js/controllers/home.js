angular.module('AUSapp').controller('Home', ['$scope', '$http', function($scope, $http) {

  $scope.sock = new SockJS('/sock');
  $scope.users = [];
  $scope.myname = "";
  $scope.myx = "";
  $scope.myy = "";
  var canvas, ctx = "";

  $scope.init = function() {

    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    canvas.width = 200;
    canvas.height = 150;
    canvas.style.border = "1px solid";

    $http.get('/user').success(function(data) {
      $scope.myname = data.username;
    });

  };

  $scope.sock.onopen = function() {
    trackLocation();
  };

  $scope.sock.onmessage = function(e) {
    console.log(e.data);
    var user = eval("(" + e.data + ")");
    $scope.users.push(user);
    render();
    $scope.$apply();
  };

  function render() {
    console.log($scope.users);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i=0; i < $scope.users.length; i++) {
      var u = $scope.users[i];
      console.log("name: " + $scope.myname);
      if ( u.name == $scope.myname ) {
        ctx.fillStyle="blue";
      } else {
        ctx.fillStyle="red";
      }
      var x = (u.x * 100000) % 100;
      var y = (Math.abs(u.y) * 100000) % 100;
      ctx.fillRect(x, y, 5, 5);
      ctx.font = "10px Arial";
      ctx.fillText(u.name, x - 9, y - 2);
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
        var message = {
          name: $scope.myname,
          x: $scope.myx,
          y: $scope.myy
        };
        $scope.sock.send(JSON.stringify(message));
      });
    }
    else{alert("Geolocation is not supported by this browser.");}
  }

}]);
