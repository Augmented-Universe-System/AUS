var mongoose = require('mongoose');

var playerSchema = mongoose.Schema({
  name: String,
  email: String,
  posistion: {
    x: Number,
    y: Number
  }
});

var Player = mongoose.model('Player', playerSchema);

var db = mongoose.connection;

mongoose.connect('mongodb://localhost/kittens');
db.on('error', console.error.bind(console, 'connection error:'));
