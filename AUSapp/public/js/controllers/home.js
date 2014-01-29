angular.module('AUSapp').controller('Home', ['$scope', function($scope) {


  $scope.sock = new SockJS('/chat');
  $scope.messages = [];
  $scope.name = "";
  $scope.latitude = "";
  $scope.longitude = "";

  $scope.init = function() {
    $scope.name = prompt("Please enter you're name.", "Ada");
    /*
    if (navigator.geolocation) {
      function updateLocation(lati, longi) {
        $scope.latitude = lati;
        $scope.longitude = longi;
        $scope.$apply();
      }
      var watchPOS = navigator.geolocation.watchPosition(function(position) {
        updateLocation(position.coords.latitude, position.coords.longitude);
        $scope.$apply();
        $scope.sock.send($scope.name + ": " + $scope.latitude + " / " + $scope.longitude);
      });
    }
    else{alert("Geolocation is not supported by this browser.");}
    */
  };

  $scope.sendMessage = function() {
    $scope.sock.send($scope.name + ": " + $scope.latitude + " / " + $scope.longitude);
  };

  $scope.sock.onmessage = function(e) {
    $scope.messages.push(e.data);
    $scope.$apply();
  };

}]);
