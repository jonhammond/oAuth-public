// *** main dependencies *** //
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var swig = require('swig');
var auth = require('./routes/auth');
var cookieSession = require('cookie-session');
var passport = require('passport');
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
var knex = require('./db/knex');

if ( !process.env.NODE_ENV ) { require('dotenv').config(); }


// *** routes *** //
var routes = require('./routes/index.js');


// *** express instance *** //
var app = express();


// *** view engine *** //
var swig = new swig.Swig();
app.engine('html', swig.renderFile);
app.set('view engine', 'html');


// *** static directory *** //
app.set('views', path.join(__dirname, 'views'));


// *** config middleware *** //
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cookieSession({
  name: 'linkedin-oauth-session-example',
  keys: [process.env.COOKIE_KEY1, process.env.COOKIE_KEY2]
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, '../client')));



// PASSPORT YAY! SIKE!
passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_API_KEY,
  clientSecret: process.env.LINKEDIN_SECRET_KEY,
  callbackURL: "http://localhost:3000/auth/linkedin/callback",
  scope: ['r_emailaddress', 'r_basicprofile'],
  state: true
}, function(accessToken, refreshToken, profile, done) {
  console.log("test:", profile);
  knex('users')
  .where('linkedin_id', profile.id)
  .orWhere('email', profile.emails[0].id)
  .first()
  .then(function(user) {
    // console.log("test:", user);
    if(!user) {
      return knex('users').insert({
        linkedin_id: profile.id,
        email: profile.emails[0].value,
        preferred_name: profile.name.givenName,
        last_name: profile.name.familyName,
        avatar_url: profile.photos[0].value
      }, id).then(function(id) {
        return done(null, id[0]);
      });
    } else {
      return done(null, user.id);
    }
  });
}));

//   process.nextTick(function () {

//     return done(null, { id: profile.id, displayName: profile.displayName, photo: profile.photos[0].value, email: profile.emails[0].value });
//   });
// }));

passport.serializeUser(function(user, done) {
  //later this will be where you selectively send to the browser
  // an identifier for your user, like their primary key from the
  // database, or their ID from linkedin

  done(null, user);
});

passport.deserializeUser(function(user, done) {
  // here is where you will go to the database and get the
  // user each time from it's id, after you set up your db
  if ( userId ) {
    knex('users')
      .where({ id:userId })
      .first()
      .then(function(user){
        ( !user ) ? done() : done(null, user);
      })
      .catch(function(err) {
        done(err, null);
      });
    } else {
      done();
    }
  });


// *** main routes *** //
app.use('/', routes);
app.use('/auth', auth);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// *** error handlers *** //

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
