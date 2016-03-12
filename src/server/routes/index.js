var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  if (!req.user) {
    res.render('index', { title: 'Hello, please log in.'});
  }
  else {
  var name = req.user.displayName || '';
  var photo = req.user.photo || '';
  var email = req.user.email || '';
  res.render('index', { title: 'Hello ' + name, photo: photo , email: email});
  }
});

module.exports = router;
