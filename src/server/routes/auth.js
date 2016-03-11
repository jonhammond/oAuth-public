var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/linkedin', function(req, res, next) {
  res.redirect('/');
});

router.get('/linkedin/callback', function(req, res, next) {
  res.redirect('/');
});

router.get('/logout', function(req, res, next) {
  res.redirect('/');
});

module.exports = router;
