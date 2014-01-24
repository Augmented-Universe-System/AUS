angular.module('AUSapp').controller('Home', ['$scope', function($scope) {

  $scope.init = function() {}

  $scope.lat = "";
  $scope.long = "";

  $scope.getLocation = function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(GetLocation);
      function GetLocation(location) {
          $scope.lat = location.coords.latitude;
          $scope.long = location.coords.longitude;
          $scope.$apply();
      }
    }
    else{x.innerHTML="Geolocation is not supported by this browser.";}
  }

}]);
