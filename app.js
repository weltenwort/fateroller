// Generated by CoffeeScript 1.3.1
(function() {
  var app;

  app = angular.module("fateroller", []);

  app.factory("pubnub", function($rootScope) {
    var pubnub;
    pubnub = PUBNUB.init({
      publish_key: "pub-610c8d30-be2b-4e0f-ad23-1d251563a05a",
      subscribe_key: "sub-890f86bd-db27-11e1-9624-2b6cb9b3b85a",
      ssl: false,
      origin: 'pubsub.pubnub.com'
    });
    pubnub.subscribe({
      channel: "fateroller",
      callback: function(message) {
        return $rootScope.$apply(function() {
          if (message.time != null) {
            message.time = Date.create(message.time);
          }
          return $rootScope.$broadcast("pubnub-message", message);
        });
      },
      error: console.log
    });
    return pubnub;
  });

  app.controller("MainController", function($scope, $location, pubnub) {
    $scope.$watch(function() {
      var _ref;
      return (_ref = $location.search().room) != null ? _ref : "";
    }, function(newValue) {
      console.log(newValue);
      return $scope.rollChannel = newValue;
    });
    $scope.$watch("rollChannel", function(newValue) {
      if ((newValue != null) && newValue !== "") {
        return $location.search("room", newValue);
      } else {
        return $location.search("room", null);
      }
    });
    $scope.rollName = "";
    $scope.rollModifier = "";
    $scope.rolls = [];
    $scope.$on("pubnub-message", function(event, message) {
      if ((message != null ? message.channel : void 0) === $scope.rollChannel) {
        return $scope.rolls.unshift(message);
      }
    });
    $scope.roll = function() {
      var channel, modifier, name, negValue, posValue, roll, time;
      channel = $scope.rollChannel;
      time = Date.create();
      name = $scope.rollName;
      modifier = !Object.isNaN($scope.rollModifier.toNumber()) ? $scope.rollModifier.toNumber() : 0;
      if (name !== "") {
        posValue = Number.random(1, 6);
        negValue = Number.random(1, 6);
        roll = {
          channel: channel,
          time: time,
          name: name,
          posValue: posValue,
          negValue: negValue,
          modifier: modifier
        };
        pubnub.publish({
          channel: "fateroller",
          message: roll
        });
        return $scope.rollModifier = "";
      }
    };
    $scope.clear = function() {
      return $scope.rolls = [];
    };
    return $scope.calculateResult = function(roll) {
      return roll.posValue - roll.negValue + roll.modifier;
    };
  });

}).call(this);
