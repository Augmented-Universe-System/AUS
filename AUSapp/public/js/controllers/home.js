angular.module('AUSapp').controller('Home', ['$scope', function($scope) {


  $scope.sock = new SockJS('/chat');
  $scope.messages = [];
  $scope.name = "";
  $scope.latitude = "";
  $scope.longitude = "";
  var canvas, ctx = "";


  $scope.init = function() {

    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    canvas.width = 200;
    canvas.height = 150;
    canvas.style.border = "1px solid";

    $scope.name = prompt("Please enter you're name.", "Ada");
  
    if (navigator.geolocation) {
      function updateLocation(lati, longi) {
        $scope.latitude = lati;
        $scope.longitude = longi;
        $scope.$apply();
      }
      var watchPOS = navigator.geolocation.watchPosition(function(position) {
        updateLocation(position.coords.latitude, position.coords.longitude);

        //ctx.clearRect(0,0, canvas.width, canvas.height);

        var x = ($scope.latitude * 10000000) % 100;
        var y = (Math.abs($scope.longitude) * 10000000) % 100;
        ctx.fillRect(x, y, 5, 5);

        $scope.$apply();
        $scope.sock.send($scope.name + ": " + x + " / " + y) ;
      });
    }
    else{alert("Geolocation is not supported by this browser.");}
    
  };

  $scope.sendMessage = function() {
    // ctx.clearRect(0,0, canvas.width, canvas.height);
    // ctx.fillRect($scope.latitude, $scope.longitude, 10, 10);

    $scope.sock.send($scope.name + ": " + $scope.latitude + " / " + $scope.longitude);
  };

  $scope.sock.onmessage = function(e) {
    $scope.messages.push(e.data);
    $scope.$apply();
  };

}]);
