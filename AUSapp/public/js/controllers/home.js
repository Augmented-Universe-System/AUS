angular.module('AUSapp').controller('Home', ['$scope', '$http', function($scope, $http) {

  var sock = new SockJS('/sock');
  var game;
  var gameLoaded = false;
  var gameWidth = 380;    // used to be 960
  var gameHeight = 320;   // used to be 600

  $scope.oldTime = "";
  $scope.users = [];
  $scope.messages = [];
  $scope.myself = null;
  $scope.fruits = [];
  var fruitGroup;
  var textGroup;
  $scope.testI = 0;
  var startingLocations = [
    {x: 10, y: 10},
    {x: 400, y: 10},
    {x: 400, y: 400},
    {x: 10, y: 400},
    {x: 100, y: 100},
    {x: 300, y: 100},
    {x: 300, y: 300},
    {x: 100, y: 300}
  ];

  sock. onopen= function() {
    $scope.init();
    //setInterval(testLoop, 2000);
    trackLocation();
  };

  $scope.init = function() {

    // get user from server API
    $http.get('/user').success(function(data) {
      $scope.myself = new User( data.username, Math.floor(Math.random()*(29)) );
      $scope.users.push($scope.myself);
      var d = new Date();
      // create a Message to send
      var chatMessage = {
        type: "user-login",
        name: $scope.myself.name,
        messageBody: " has logged in!",
        avatarID: $scope.myself.avatarID,
        chatDate: $scope.formatTwelve(d)
      };
      sock.send(JSON.stringify(chatMessage));
      game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'gameCanvas', { preload: preload, create: create, update: update });
      gameLoaded = true;
    });

  };

  function User(name, aID) {
    this.name = name;
    this.avatarID = aID;
    this.locations = [startingLocations[3]];
    this.score = 0;
  }

  function findUser(name, avatarID, callback) {
    for (var i = 0; i < $scope.users.length; i++) {
      if ( $scope.users[i].name === name ) {
        callback($scope.users[i]);
        return;
      }
    }
    console.log("adding user");
    var newUser = new User(name, avatarID);
    addUserSprite(newUser);
    $scope.users.push(newUser);

    callback(newUser);
  }

  sock.onmessage = function(e) {
    var message = eval("(" + e.data + ")");
    console.log(message);
    if (message.type == "user-login") {
      findUser(message.name, message.avatarID, function() {
        $scope.messages.push(message);
      });
    } else if (message.type == "user-update") {
      findUser(message.name, message.avatarID, function(user) {
        user.locations.push({x: message.x, y: message.y});
        $scope.$apply();
      });
    } else if (message.type == "user-chat") {
      $scope.messages.push(message);
      console.log($scope.messages);
    }
    else if (message.type == "user-score") {
      findUser(message.name, function(user) {
        user.score = message.userScore;
        var f = parseInt(message.fruitName.slice(-1));
        addOneFruit(message.fruitName, $scope.fruits[f].loc.x, $scope.fruits[f].loc.y);
        $scope.$apply();
      });
    }
    if (message.fruits) {
      console.log("this message has fruit info");
      $scope.fruits = message.fruits;
    }
    document.getElementById("chat").scrollTop = 99999;
  };

  function preload() {
    game.stage.backgroundColor = '#eeeeee';
    game.load.image('ground', 'images/gamegrass.png');
    game.load.spritesheet('fruits', 'images/fruitnveg32wh37.png', 32, 32);
    game.load.spritesheet('playerSprites', 'images/creatures32x32.png', 32, 32);
  }

  function create() {
    game.add.sprite(0, 0, 'ground');

    fruitGroup = game.add.group();
    textGroup = game.add.group();
    fruitGroup.createMultiple(10, 'fruits', game.rnd.integerInRange(0, 36));

    for ( var i = 0; i < $scope.fruits.length; i++ ) {
      addOneFruit('fruit' + i, $scope.fruits[i].loc.x, $scope.fruits[i].loc.y);
    }

    for ( var i = 0; i < $scope.users.length; i++ ) {
      var user = $scope.users[i];
      addUserSprite(user);
    }
  }

  function addUserSprite(user) {
    user.sprite = game.add.sprite(user.locations[0].x, user.locations[0].y, 'playerSprites');
    user.sprite.height = 32;
    user.sprite.width = 32;
    var base = user.avatarID*4;
    user.sprite.animations.add('animate', [base, base+1, base+2], 5, true);
  }

  function addOneFruit(name, x, y) {
    var fruit = fruitGroup.getFirstDead();
    fruit.name = name;
    fruit.body.immovable = true;
    fruit.reset(x, y);
  }

  function update() {
    if('undefined' !== typeof textGroup)
    {
      textGroup.destroy();
    }

    textGroup = game.add.group();

    for ( var i = 0; i < $scope.users.length; i++ ) {

      var user = $scope.users[i];
      var lastLoc = lastLocation(user);

      // draw username underneath the avatar
      scoreText = game.add.text(
        lastLoc.x  + 1, 
        lastLoc.y + 30, 
        user.name,
        { font: '10px Arial' }
        );
      
      textGroup.add(scoreText);
      
      try {
        user.sprite.reset(lastLoc.x, lastLoc.y);
        user.sprite.animations.play('animate');
      } catch (e) {
        console.log(e);
      }

      // user follows cursor (testing only)
      //game.physics.moveToPointer($scope.myself.sprite,300,game.input.activePointer);
    }
    game.physics.collide($scope.myself.sprite, fruitGroup, selfCollideFruit, null, this);

  }

  function selfCollideFruit(self, fruit) {
    fruit.reset(1000,1000);
    fruit.kill();
    console.log('Hit', fruit.name);
    $scope.myself.score++;
    var scoreMessage = {
      type: "user-score",
      name: $scope.myself.name,
      userScore: $scope.myself.score,
      fruitName: fruit.name
    };
    sock.send(JSON.stringify(scoreMessage));
  }

  $scope.formatTwelve = function(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();

    // keep track of the hours and minutes of each call to this function
    $scope.oldTime = hours + " " + minutes;

    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+ minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  $scope.sendChat = function() {
    var chatTime = " ";
    var newDate = new Date();
    var newHour = newDate.getHours();
    var newMinutes = newDate.getMinutes();
    var newTime = newHour + " " + newMinutes;

    if(newTime == $scope.oldTime){
        chatTime = " ";
    } else {
        chatTime = $scope.formatTwelve(newDate);
    }

    var chatMessage = {
      type: "user-chat",
      name: $scope.myself.name,
      messageBody: $scope.messageText,
      chatDate: chatTime
    };
    sock.send(JSON.stringify(chatMessage));
    $scope.messageText = "";
  };

  function trackLocation() {
    if (navigator.geolocation) {
      function updateLocation(latiInput, longiInput) {
        // scale the user coordinates
        var lati = (latiInput * 1000000) % 350;
        var longi = (Math.abs(longiInput) * 1000000) % 290;
        $scope.myself.locations.push({x: lati, y: longi});
        $scope.$apply();
      }
      var watchPOS = navigator.geolocation.watchPosition(function(position) {
        updateLocation(position.coords.latitude, position.coords.longitude);

        $scope.$apply();
        var serverMessage = {
          type: "user-update",
          name: $scope.myself.name,
          avatarID: $scope.myself.avatarID,
          x: lastLocation($scope.myself).x,
          y: lastLocation($scope.myself).y
        };
        sock.send(JSON.stringify(serverMessage));
      });
    }
    else{alert("Geolocation is not supported by this browser.");}
  }

  function firstLocation(user) {
    var tmpx = user.locations[1].x;
    var tmpy = Math.abs(user.locations[1].y);
    var firstLoc = {
      x: tmpx,
      y: tmpy
    };
    return firstLoc;
  }

  function lastLocation(user) {
    var tmpx = user.locations[user.locations.length-1].x;
    var tmpy = Math.abs(user.locations[user.locations.length-1].y);
    var lastLoc = {
      x: tmpx,
      y: tmpy
    };
    return lastLoc;
  }

function testLoop() {

    // generate random coordinates between 10-400 for x and 10-300 for y
    var minX = 10;
    var maxX = gameWidth - 50;
    var randX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;

    var minY = 10;
    var maxY = gameHeight - 50;
    var randY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

    console.log("random coordinates: rand x: " + randX + ", rand y: " + randY );

    $scope.myself.locations.push({x: randX, y: randY});
    $scope.apply;

    var serverMessage = {
        type: "user-update",
        name: $scope.myself.name,
        x: randX,
        y: randY

       };
    sock.send(JSON.stringify(serverMessage));
  }

}]);
