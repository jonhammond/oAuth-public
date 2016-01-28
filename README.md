## OAuth

### The basic OAuth2 web flow is:

![](http://41.media.tumblr.com/dc0ed4febc896d5d0589fc2940e52a42/tumblr_mp08klMuDm1qax653o1_1280.jpg)

__Some guiding questions:__

* How does Google / Facebook / LinkedIn etc... communicate with your _local_ web app during development?  Isn't that private (aka not published on the internet)??
* What part of your existing authentication / authorization flows does this replace?
* Why would you want to authenticate with Google / Facebook instead of storing the emails / passwords yourself?

# SET UP

__#1 Create an Express App__

Generate an express app that includes a `.gitignore` file:

```
express --git linkedin-oauth
cd linkedin-oauth
npm install
nodemon
```

Visit http://localhost:3000/ and make sure that the app loads correctly.  Then initialize a git repository:

```
git init .
git add -A
git commit -m "Initial commit"
```

Now create a repository on Github, set the remote properly and push.

__#2 Deploy to Heroku__

Create an app on Heroku, deploy to it and verify that your app works on Heroku:

```
heroku apps:create
git push heroku master
heroku open
```

Now that you have a Heroku URL:

1. add a README file
1. add your Heroku URL to the README
1. git add, commit and push to Github

__#3 Install and configure dotenv and cookie-session__

Passport requires that your app have a `req.session` object it can write to.  To enable this, install and require `cookie-session`.  In order to keep your secrets safe, you'll need to also install and load `dotenv`.

```
npm install dotenv cookie-session --save
touch .env
echo .env >> .gitignore
```
__#4 In `app.js`, require `cookie-session` and load dotenv:__

You've done this many times by now, so I'm going to let you handle this.

Using the following commands, add `SESSION_KEY1` and `SESSION_KEY2` to your `.env` and set each value to a randomly generated key:

```sh
$ echo SESSION_KEY1=$(node -e "require('crypto').randomBytes(48, function(ex, buf) { console.log(buf.toString('hex')) });") >> .env
```
```sh
$ echo SESSION_KEY2=$(node -e "require('crypto').randomBytes(48, function(ex, buf) { console.log(buf.toString('hex')) });") >> .env
```


__#5 Add the session middleware to your app:__

```js
// after app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ keys: [process.env.SESSION_KEY1, process.env.SESSION_KEY2] }))
```

Ensure that you app still works locally, then:

1. git add, commit, push to Github
1. deploy to Heroku

__Once you've deployed, be sure to set `SESSION_KEY1` and `SESSION_KEY2` on Heroku__

If you can't remember how to do that, Google it. Something like `set Heroku config variables`

Verify that your app still works correctly on Heroku.

__#6 Set the HOST environment variable__

For your app to work both locally and on production, it will need to know what URL it's being served from.  
To do so, add a HOST environment variable to `.env`.

__#1 Set the HOST environment variable locally to your localhost__
__#2 Set the HOST environment variable on Heroku to your Heroku URL__


NOTE: do _not_ include the trailing slash.  So `https://guarded-inlet-5817.herokuapp.com` instead of `https://guarded-inlet-5817.herokuapp.com/`

There should be nothing to commit at this point.

## Register your LinkedIn Application

1. Login to https://www.linkedin.com/
1. Visit https://www.linkedin.com/developer/apps and create a new app
1. For Logo URL, add your own OR you can use https://brandfolder.com/galvanize/attachments/suxhof65/galvanize-galvanize-logo-g-only-logo.png?dl=true
1. Under website add your Heroku URL
1. Fill in all other required fields and submit

__On the "Authentication" screen:__

- Under authorized redirect URLs enter http://localhost:3000/auth/linkedin/callback
- Under authorized redirect URLs enter your Heroku url, plus `/auth/linkedin/callback`

You should see a `Client ID` and `Client Secret`.  Add these to your `.env` file, and set these environment variables on Heroku. Your `.env` file should look something like:

```
SESSION_KEY1=your-secret
SESSION_KEY2=your-secret
HOST=http://localhost:3000
LINKEDIN_CLIENT_ID=your-secret
LINKEDIN_CLIENT_SECRET=your-secret
```

Set those variables on Heroku as well.

There should be nothing to add to git at this point.

## Install and configure passport w/ the LinkedIn strategy

__#1 Install npm packages `passport` and `passport-linkedin`__

__#2 add the Passport middleware to `app.js`__

```js
// up with the require statements...
var passport = require('passport');

// above app.use('/', routes);
app.use(passport.initialize());
app.use(passport.session());
```

Then tell Passport to use the LinkedIn strategy:

```js
// up with the require statements...
var LinkedInStrategy = require('passport-linkedin').Strategy

// below app.use(passport.session());...
passport.use(new LinkedInStrategy({
    consumerKey: process.env.LINKEDIN_CLIENT_ID,
    consumerSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: process.env.HOST + "/auth/linkedin/callback"
  },
  function(token, tokenSecret, profile, done) {
    // To keep the example simple, the user's LinkedIn profile is returned to
    // represent the logged-in user. In a typical application, you would want
    // to associate the LinkedIn account with a user record in your database,
    // and return that user instead (so perform a knex query here later.)
    done(null, profile)
  }
));
```

Finally, tell Passport how to store the user's information in the session cookie:

```js
// above app.use('/', routes);...
passport.serializeUser(function(user, done) {
 // later this will be where you selectively send to the browser an identifier for your user, 
 // like their primary key from the database, or their ID from linkedin
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  //here is where you will go to the database and get the user each time from it's id, after you set up your db
  done(null, user)
});
```

Run the app locally to make sure that it's still functioning (and isn't throwing any errors).

## Create the auth and oauth-related routes

Create a new route file for your authentication routes:

```
touch routes/auth.js
```

In `routes/auth.js`, you'll need to add a `route for logging in`, and one for `logging out`. In addition, you'll have to create the `route that LinkedIn will call once the user has authenticated properly`:

__#1 route for logging in__

Add a  GET `/auth/linkedin` route that takes a middleware argument of `passport.authenticate('linkedin')`.

__NOTE:__ This route isn't going to respond with a `redirect` or a `render`. It's only job is
to call the middleware function. You won't pass in a `callback` function here.

What else do you need to add to this route file for this function to work?
If you don't know yet, don't worry, you'll get an error telling you all about it.

__#2 Add a route for logging out__

In `/logout`, set `req.session` to null and `redirect` to `/`.

__#3 Create the route that LinkedIn will call once the user has authenticated properly:__

The route should be a GET request to `/auth/linkedin/callback` that takes a middleware
argument of `passport.authenticate('linkedin', { failureRedirect: '/' })`. Inside the route
you will simply `redirect` to `/`.

__#4 Back in `app.js`, be sure to require your `auth` routes file__

```js
// up with the require statements...
var authRoutes = require('./routes/auth');

// right after app.use('/', routes);
app.use('/', authRoutes);
```

With this setup, you should be able to login with LinkedIn successfully by visiting the following URL directly:

http://localhost:3000/auth/linkedin

If it's successful, you should be redirected to the homepage.  If you check your terminal output, you should see a line in there like:

```
GET /auth/linkedin/callback?oauth_token=78--3f284b63-1aff-4eb5-b710-104bae4f5413&oauth_verifier=07507 302 791.066 ms - 58
```

That indicates that LinkedIn successfully authenticated the user.

## Configure the views

Inside the `body` tag in `./views/layout.jade`:

* add a `login with LinkedIn` link
* add a `logout` link
* The `login` link should _not_ be displayed if a user is logged in
* The `logout` link should _only_ be displayed if a user is logged in

__Display the name of the currently logged-in user__

To do this part, you'll need to access some of the information LinkedIn gave to
you when the user successfully logged in. Check out the chunks of code you added
in `app.js` and `console.log` some of the results to see what you have to work with.

You can use that object to add middleware that will set the `user` local
variable in all views.

__NOTE:__ Passport sets the `req.user` property for you automatically.

```js
// right above app.use('/', routes);
app.use(function (req, res, next) {
  res.locals.user = req.user
  next()
})
```

You should now be able to login and logout with LinkedIn!!!

1. Git add, commit and push
1. Deploy to Heroku
1. Check that your app works on Heroku

## RESCUE

Checkout the solution branch if you're really stuck.

## IF YOU MADE IT THIS FAR, KEEP GOING!

__#1 Read LinkedIn's API docs to see what else you can do with this authorization.__

* Make an API call to LinkedIn on the user's behalf

Install unirest:

```
npm install unirest --save
```

__#2 Add Postgres and save the user in your database:__

__#3 Use Passport to implement login with Facebook, or some other 3rd party application__

## Resources

- [Authorization and Middleware Learning Experience](https://coursework.galvanize.com/curriculums/6/learning_experiences/22)
- https://developer.linkedin.com/docs/oauth2
- http://passportjs.org/docs
- https://github.com/jaredhanson/passport-linkedin
- https://github.com/jaredhanson/passport-linkedin/blob/master/examples/login/app.js
- https://github.com/jaredhanson/passport-linkedin#configure-strategy
- http://passportjs.org/docs/configure#configure

VIDEO
https://www.youtube.com/watch?v=LRNg4tDtrkE
