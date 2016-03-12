var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/linkedin', passport.authenticate('linkedin'));

router.get('/linkedin/callback', passport.authenticate('linkedin', {
  failureRedirect: '/'
}), function (req, res, next) {
  // console.log('user:', req.user);
  res.redirect('/');
});

router.get('/linkedin/callback', function(req, res, next) {
  res.redirect('/');
});

router.get('/logout', function(req, res, next) {
  req.logout();
  // req.session = null;
  res.redirect('/');
});

module.exports = router;
