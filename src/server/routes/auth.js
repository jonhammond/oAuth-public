var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/linkedin', passport.authenticate('linkedin'));

router.get('/linkedin/callback', function(req, res, next) {
  res.redirect('/');
});

router.get('/logout', function(req, res, next) {
  res.redirect('/');
});

module.exports = router;
