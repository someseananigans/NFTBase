require('dotenv').config()
const express = require('express')
const { join } = require('path')
// database
const syncDB = require('./config')
const { User } = require('./models')
// authentication / strategy
const passport = require('passport')
const { Strategy: LocalStrategy } = require('passport-local')
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')

const app = express()

app.use(express.static(join(__dirname, 'client', 'build')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET
}

passport.use(new JwtStrategy(options, ({ id }, cb) => {
  User.findById(id)
    // .populate('posts')
    .then(user => cb(null, user))
    .catch(err => cb(err))
}))

app.use(require('./controllers'))

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'client', 'build', 'index.html'))
  })
}

syncDB()
  .then(() => {
    console.log('server running')
    app.listen(process.env.PORT || 3001)
  })
  .catch(err => console.log(err))
