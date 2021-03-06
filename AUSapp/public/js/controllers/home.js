angular.module('AUSapp').controller('Home', ['$scope', '$http', function($scope, $http) {

  var sock = new SockJS('/sock');
  var game;
  var gameLoaded = false;
  var gameWidth = 380;    // used to be 960
  var gameHeight = 320;   // used to be 600

  $scope.oldTime = "";
  $scope.users = [];
  $scope.avatar = {};
  $scope.avatarUrl = {};
  $scope.messages = [];
  $scope.myself = null;
  $scope.fruits = [];
  var fruitGroup;
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
  var img = new Image();
  img.src = "images/ausimg1.png";

  sock. onopen= function() {
    $scope.init();
    //setInterval(testLoop, 2000);
    //trackLocation();
    relocating();
  };

  $scope.init = function() {

    // get user from server API
    $http.get('/user').success(function(data) {
      $scope.myself = new User(data.username);
      $scope.users.push($scope.myself);
      var d = new Date();
      // create a Message to send
      var chatMessage = {
        type: "user-login",
        name: "",
        messageBody: data.username + " has logged in!",
        chatDate: $scope.formatTwelve(d)
      };
      sock.send(JSON.stringify(chatMessage));
    });

  };

  function User(name) {
    console.log("creating new user");
    this.name = name;
    this.locations = [startingLocations[3]];
    getAvatar(name);
    this.score = 0;
  }

  function findUser(name, callback) {
    for (var i = 0; i < $scope.users.length; i++) {
      if ( $scope.users[i].name === name ) {
        callback($scope.users[i]);
        return;
      }
    }
    console.log("adding user");
    var newUser = new User(name);
    $scope.users.push(newUser);

    callback(newUser);
  }

  function getAvatar(name) {
    var url = 'https://api.github.com/users/' + name;
    $http.get(url).success(function(data) {
      console.log("success getting image");
      $scope.avatar[name] = new Image();
      $scope.avatar[name].src = data.avatar_url;
      $scope.avatarUrl[name] = data.avatar_url;
      if ( !gameLoaded && name == $scope.myself.name ) {
        game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'gameCanvas', { preload: preload, create: create, update: update });
      } else {
        findUser(name, function(user) {
          addUserSprite(user);
          console.log("displaying another user");
        });
      }
    }).error(function(data) {
      console.log(data);
      // set a default avatar if failed
      $scope.avatar[name].src = "images/ausimg1.png";
      game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'gameCanvas', { preload: preload, create: create, update: update });
    });
  }

  sock.onmessage = function(e) {
    var message = eval("(" + e.data + ")");
    console.log(message);
    if (message.type == "user-update") {
      findUser(message.name, function(user) {
        user.locations.push({x: message.x, y: message.y});
        //render();
        $scope.$apply();
      });
    } else if (message.type == "user-chat" || message.type == "user-login") {
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
    game.load.spritesheet('fruits', 'images/fruitnveg32wh37.png', 32, 32);
    for ( var i = 0; i < $scope.users.length; i++ ) {
      var name = $scope.users[i].name;
      game.load.image(name, $scope.avatarUrl[name]);
      console.log($scope.avatarUrl[name]);
    }
  }

  function create() {
    fruitGroup = game.add.group();
    fruitGroup.createMultiple(10, 'fruits', game.rnd.integerInRange(0, 36));
    

    for ( var i = 0; i < $scope.fruits.length; i++ ) {
      //var fruit = $scope.fruits[i];
      //var f = fruitGroup.create(fruit.loc.x, fruit.loc.y, 'fruits', game.rnd.integerInRange(0, 36));
      //f.name = 'fruit' + i;
      //f.body.immovable = true;

      addOneFruit('fruit' + i, $scope.fruits[i].loc.x, $scope.fruits[i].loc.y);
    }

    for ( var i = 0; i < $scope.users.length; i++ ) {
      var user = $scope.users[i];
      addUserSprite(user);
    }
  }

  function addUserSprite(user) {
    user.sprite = game.add.sprite(user.locations[0].x, user.locations[0].y, user.name);
     user.sprite.height = 32;
    user.sprite.width = 32;
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

      // draw score by the avatar
/*
      scoreText = game.add.text(
        lastLoc.x  + 6, 
        lastLoc.y - 14, 
        "(" + 4 + ")",
        { font: '14px Arial' }
        );
      textGroup.add(scoreText);
*/
      //console.log("game.input.activePointer:  " + game.input.activePointer.x);

      user.sprite.reset(lastLoc.x, lastLoc.y);
      //game.physics.moveToPointer($scope.myself.sprite,300,game.input.activePointer);

      //game.world.remove(textGroup);
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
    console.log("scope.oldTime: " + $scope.oldTime);

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
        console.log("chatTime (if statement): " + chatTime);
    } else {
        chatTime = $scope.formatTwelve(newDate);
        console.log("chatTime in (else): " + chatTime);
    }
    
    var chatMessage = {
      type: "user-chat",
      name: $scope.myself.name,
      messageBody: $scope.messageText,
      chatDate: chatTime
    };
    sock.send(JSON.stringify(chatMessage));
    $scope.messageText = "";
    
/*
    var fruitMessage = {
      type: "fruit-update",
      messageBody: "fruit message"
    };
    sock.send(JSON.stringify(fruitMessage));
*/
  };

  function render() {
    console.log($scope.users);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var counter = 1;

    for ( var i = 0; i < $scope.users.length; i++ ) {
      var user = $scope.users[i];

      var userLastLoc = lastLocation(user);
      var userFirstLoc = firstLocation(user);
      console.log("This is the user's first location: " + userFirstLoc.x + " " + userFirstLoc.y);
      console.log("This is the user's last location: " + userLastLoc.x + " " + userLastLoc.y);

      var x = userLastLoc.x;
      var y = userLastLoc.y;

      console.log("UserName: " + user.name + " This is x in render() " + x + " ; This is y in render() " + y);
      //var x = (u.x * 100000) % 100;
      //var y = (Math.abs(u.y) * 100000) % 100;
      //var firstX = x;
      //var firstY = y;

      if ( user.name == $scope.myself.name ) {
        ctx.fillStyle="blue";
        ctx.strokeStyle="blue";
        ctx.drawImage($scope.avatar[user.name], x, y);
      } else {
        ctx.fillStyle="red";
        ctx.strokeStyle="red";
        ctx.drawImage($scope.avatar[user.name], x + 100, y);
      }
      //ctx.drawImage($scope.avatar[user.name], x, y);


      /*
      ctx.beginPath();
      ctx.moveTo(userFirstLoc.x, userFirstLoc.y);
      for(i = 0; i < user.locations.length; i++) {
        ctx.lineTo(user.locations[i].x, Math.abs(user.locations[i].y));
      }
      ctx.lineJoin = 'miter';
      ctx.stroke();

      ctx.font = "13px Arial";
      ctx.fillText(user.name, x - 10, y - 5);
      */
      //pathIntersection(user.name, x, y);
      //ctx.fillText(user.name + " (" + counter + ")", x - 20, y - 5);
      //counter ++;
    }

    // draw fruits
    console.log("fruits.length: " + $scope.fruits.length);
    for (var i = 0; i < $scope.fruits.length; i++) {
      console.log("Fruit location from before the loop: " + $scope.fruits[i].fruitLocation.x + ", " + $scope.fruits[i].fruitLocation.y);
      ctx.drawImage(img, $scope.fruits[i].fruitLocation.x, $scope.fruits[i].fruitLocation.y);
      //console.log("This is the fruits array.");
    }
  }

  //extra
  function relocating(user) {
/*
    //avatar first drawn on specific location
    //old GPS location minus new GPS location
    var gpsLocX = Math.abs(user.locations[user.locations.length-2].x - user.locations[user.locations.length-1].x);
    var gpsLocY = Math.abs(user.locations[user.locations.length-2].y - user.locations[user.locations.length-1].y);
    //take difference, multiply it by some number
    var avatarLocX = gpsLocX * 200;
    var avatarLocY = gpsLocY * 200;
    //return new locations for the avatar
    return [avatarLocX, avatarLocY];
    //add location to avatar's location, which in turn moves avatar on canvas

      //var x = (u.x * 100000) % 100;
      //var y = (Math.abs(u.y) * 100000) % 100;
      //var firstX = x;
      //var firstY = y;
*/

    if (navigator.geolocation) {
      function updateLocation(latiInput, longiInput) {


        //manipulating latitude and longitude
        var lati = (latiInput * 500000) % 380;
        var longi = (Math.abs(longiInput) * 500000) % 320;


        $scope.myself.locations.push({x: lati, y: longi});
        console.log("Latitude in trackLocation() " + lati + " ; Longitude in trackLocation() " + longi);
        $scope.$apply();
      }
      var watchPOS = navigator.geolocation.watchPosition(function(position) {
        updateLocation(position.coords.latitude, position.coords.longitude);

        $scope.$apply();
        var serverMessage = {
          type: "user-update",
          name: $scope.myself.name,
          x: lastLocation($scope.myself).x,
          y: lastLocation($scope.myself).y
        };
        sock.send(JSON.stringify(serverMessage));
      });
    }
    else{alert("Geolocation is not supported by this browser.");}
  }



  function pathIntersection(user, x, y) {
    //check the next position of user
    //check to see if user hits another's path
      //need to minus all the widths of each user and see if anyone hits anyone else
    for (var u = 0; u < $scope.users.length; u++) {
      for (var ul = 1; ul < $scope.users[u].locations.length-1; ul++) {
        
        console.log("This is the length of the users' locations: " + $scope.users[u].locations.length);
        console.log("u: " + u);
        console.log("ul: " + ul);
        console.log("This is the input of x: " + Math.abs(x) + "\n");
        console.log("This is the abs of x: " + Math.abs($scope.users[u].locations[ul].x) + "\n");
        console.log("This is the input of y: " + Math.abs(y) + "\n");
        console.log("This is the abs of y: " + Math.abs($scope.users[u].locations[ul].y) + "\n");
       
        if ( ((Math.abs(x) > Math.abs($scope.users[u].locations[ul].x) && Math.abs(y) == Math.abs($scope.users[u].locations[ul].y)) || 
          (Math.abs(x) < Math.abs($scope.users[u].locations[ul].x) && Math.abs(y) == Math.abs($scope.users[u].locations[ul].y)) ||
          (Math.abs(x) == Math.abs($scope.users[u].locations[ul].x) && Math.abs(y) > Math.abs($scope.users[u].locations[ul].y)) ||
          (Math.abs(x) == Math.abs($scope.users[u].locations[ul].x) && Math.abs(y) < Math.abs($scope.users[u].locations[ul].y)) ||
          (Math.abs(x) < Math.abs($scope.users[u].locations[ul].x) && Math.abs(y) > Math.abs($scope.users[u].locations[ul].y)) ||
          (Math.abs(x) > Math.abs($scope.users[u].locations[ul].x) && Math.abs(y) < Math.abs($scope.users[u].locations[ul].y)) ||
          (Math.abs(x) > Math.abs($scope.users[u].locations[ul].x) && Math.abs(y) > Math.abs($scope.users[u].locations[ul].y)) ||
          (Math.abs(x) < Math.abs($scope.users[u].locations[ul].x) && Math.abs(y) < Math.abs($scope.users[u].locations[ul].y)) ||
          (Math.abs(x) == Math.abs($scope.users[u].locations[ul].x) && Math.abs(y) == Math.abs($scope.users[u].locations[ul].y))) && (Math.abs(x) != Math.abs($scope.myself.locations[ul].x) && Math.abs(y) != Math.abs($scope.myself.locations[ul].y)) ) {
            alert("User " + user.name + " has lost the game.");
            //for (var g = 0; g < $scope.myself.locations.length; g++) {
              //console.log("This is the user's location number " + g + ": " + $scope.myself.locations[g].x + ", " + $scope.myself.locations[g].y);
            //}
            //console.log("User " + user.name + " has lost the game.");
        }
      }
    }
    //if hit path, user lose
    //else if not hit path, do nothing
  }


  function trackLocation() {
    if (navigator.geolocation) {
      function updateLocation(lati, longi) {
        $scope.myself.locations.push({x: lati, y: longi});
        console.log("Latitude in trackLocation() " + lati + " ; Longitude in trackLocation() " + longi);
        $scope.$apply();
      }
      var watchPOS = navigator.geolocation.watchPosition(function(position) {
        updateLocation(position.coords.latitude, position.coords.longitude);

        $scope.$apply();
        var serverMessage = {
          type: "user-update",
          name: $scope.myself.name,
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

    //var userLastLoc = lastLocation($scope.myself);

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

    /*
    if ($scope.testI % 8 == 0)
      $scope.myself.locations.push({x: (userLastLoc.x + 35), y: userLastLoc.y});
    else
      $scope.myself.locations.push({x: userLastLoc.x, y: (userLastLoc.y + 5)});
    $scope.$apply;
    */
    var serverMessage = {
        type: "user-update",
        name: $scope.myself.name,
        x: randX,
        y: randY

        //x: lastLocation($scope.myself).x,
        //y: lastLocation($scope.myself).y
       };
    sock.send(JSON.stringify(serverMessage));
    //$scope.testI++;
  }

}]);
