const router = require('express').Router()
const passport = require('passport')

router.use('/api', require('./userController.js'))

module.exports = router