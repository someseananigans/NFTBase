const router = require('express').Router()
const { User, Post, Comment } = require('../models')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const { eventNames } = require('../models/User')

// get current user
router.get('/user', passport.authenticate('jwt'), (req, res) => {
  res.json(req.user)
})

// get all users
router.get('/users', (req, res) => {
  User.find({})
    .then(users => res.json(users))
    .catch(err => console.log(err))
})



module.exports = router