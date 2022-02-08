const { model, Schema } = require('mongoose')

const User = new Schema({
  name: String,
  username: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  }
})

User.plugin(require('passport-local-mongoose'))

module.exports = model('User', User)