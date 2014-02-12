var mongoose              = require('mongoose')
  , Schema                = mongoose.Schema
  , passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
  username: String,
  email: String,
  info: {
    active: Boolean,
    updated: Date,
    lastLocation: {
      x: Number,
      y: Number
    }
  }
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
