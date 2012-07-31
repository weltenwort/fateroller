app = angular.module "fateroller", []

app.factory "pubnub", ($rootScope) ->
    pubnub = PUBNUB.init
        publish_key   : "pub-610c8d30-be2b-4e0f-ad23-1d251563a05a"
        subscribe_key : "sub-890f86bd-db27-11e1-9624-2b6cb9b3b85a"
        ssl           : false
        origin        : 'pubsub.pubnub.com'

    pubnub.subscribe
        channel: "fateroller"
        callback: (message) ->
            $rootScope.$apply ->
                if message.time?
                    message.time = Date.create(message.time)
                $rootScope.$broadcast "pubnub-message", message
        error: console.log

    return pubnub

app.controller "MainController", ($scope, pubnub) ->
    $scope.rollChannel = ""
    $scope.rollName = ""
    $scope.rollModifier = ""
    $scope.rolls = []

    $scope.$on "pubnub-message", (event, message) ->
        if message?.channel == $scope.rollChannel
            $scope.rolls.unshift message

    $scope.roll = ->
        channel = $scope.rollChannel
        time = Date.create()
        name = $scope.rollName
        modifier = if not Object.isNaN($scope.rollModifier.toNumber()) then $scope.rollModifier.toNumber() else 0

        if name != ""
            posValue = Number.random(1, 6)
            negValue = Number.random(1, 6)

            roll = {
                channel: channel
                time: time
                name: name
                posValue: posValue
                negValue: negValue
                modifier: modifier
            }

            pubnub.publish
                channel: "fateroller"
                message: roll

            $scope.rollModifier = ""

    $scope.calculateResult = (roll) ->
        return roll.posValue - roll.negValue + roll.modifier
