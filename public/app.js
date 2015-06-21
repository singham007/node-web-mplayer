'use strict';

(function(window) {

  var tunesApp = angular.module('App', []);

  tunesApp.controller('PlayerController', function($scope,$http) {


    $scope.currentSong = 0;
    $http.get('/playlist').success(function(data) {
      $scope.albums = data;
      
       $scope.play= function() {
       	$scope.currentSong = getSelection();
    	$http.get('/play/'+$scope.currentSong).success(function(data) {
      	console.log(data);
    	});
      };

      $scope.pause= function() {
        $http.get('/pause').success(function(data) {
      	console.log(data);
    	});
      };

      $scope.stop= function() {
      $http.get('/play').success(function(data) {
      	console.log(data);
    	});
      };

       $scope.next= function() {
   			$scope.currentSong = $scope.currentSong + 1;
   			console.log($scope.currentSong);
   			 $http.get('/play/'+$scope.currentSong).success(function(data) {
      		console.log(data);
    	});
      };

       $scope.prev= function() {
       	$scope.currentSong = $scope.currentSong -1;
   		 $http.get('/play/'+$scope.currentSong).success(function(data) {
      		console.log(data);
    	});
    };

    });
  });


function getSelection(){
if($('input[name=radio1]:checked')[0]) return parseInt($('input[name=radio1]:checked')[0].attributes['value'].value);
else return 1 ;
}

})(window);