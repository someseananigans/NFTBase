const router = require('express').Router()
const passport = require('passport')

router.use('/api', require('./scrapeController.js'))

module.exports = router