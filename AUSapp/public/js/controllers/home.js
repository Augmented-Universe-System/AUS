angular.module('AUSapp').controller('Home', ['$scope', function($scope) {

  $scope.init = function() {}

  $scope.lat = "";
  $scope.long = "";

  $scope.getLocation = function() {
    if (navigator.geolocation) {
      function GetLocation(location) {
          $scope.lat = location.coords.latitude;
          $scope.long = location.coords.longitude;
          $scope.$apply();
      }
      navigator.geolocation.getCurrentPosition(GetLocation);
    }
    else{x.innerHTML="Geolocation is not supported by this browser.";}
  }

}]);
