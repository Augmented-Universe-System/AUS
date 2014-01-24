angular.module('AUSapp').controller('Home', ['$scope', function($scope) {


  $scope.latitude = "";
  $scope.longitude = "";

  $scope.init = function() {
    if (navigator.geolocation) {
      function updateLocation(lati, longi) {
          $scope.latitude = lati;
          $scope.longitude = longi;
          $scope.$apply();
      }
      var watchPOS = navigator.geolocation.watchPosition(function(position) {
        updateLocation(position.coords.latitude, position.coords.longitude);
        console.log("watch");
      });
    }
    else{alert("Geolocation is not supported by this browser.");}
  }

}]);
