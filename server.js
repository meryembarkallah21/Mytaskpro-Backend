var express  = require('express');
var app      = express();
var mongoose = require('mongoose');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');
const path = require('path');
require("dotenv").config();
const passport = require('passport');
const googleStrategy = require('./config/googleStrategy');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

app.use(cors());
app.use(passport.initialize())

function extractProfile(profile) {
  let imageUrl ='';
  if (profile.photos && profile.photos.length) {
  imageUrl = profile.photos[0].value;
  }
  return {
  id: profile.id,
  displayName: profile.displayName,
  image: imageUrl,
  };
}

passport.use(
  new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
      accessType: 'offline',
      userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
  },
  (accessToken, refreshToken, profile, cb) => {
      cb(null, extractProfile(profile));
  })
);

passport.serializeUser((user, cb) => {
        cb(null, user);
});

passport.deserializeUser((obj, cb) => {
        cb(null, obj);
});
// Api call for google 
app.get(
    '/auth/google',
    passport.authenticate('google', {scope:['email', 'profile']}),
    (req,res)=>{
});
// Api call back function
app.get('/callback'
          ,passport.authenticate('google', {scope: ['email', 'profile']}),
       (req,res)=>{
             return res.send('Congrats');
});

var  hbs = require('nodemailer-express-handlebars'),
  email = process.env.MAILER_EMAIL_ID || 'auth_email_address@gmail.com',
  pass = process.env.MAILER_PASSWORD || 'auth_email_pass'
  nodemailer = require('nodemailer');

var smtpTransport = nodemailer.createTransport({
  service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
  auth: {
    user: email,
    pass: pass
  }
});

var handlebarsOptions = {
  viewEngine: 'handlebars',
  viewPath: path.resolve('./app/templates/'),
  extName: '.html'
};
smtpTransport.use('compile', hbs(handlebarsOptions));

//var databaseConfig = require('./config/database');
var router = require('./app/routes');
mongoose.connect('mongodb+srv://Meryem:barkallah@cluster0.dym9d.mongodb.net/CMSMYTASKPRO?retryWrites=true&w=majority',
{useNewUrlParser: true,
useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true);
mongoose.connection.on('error', error => console.log(error) );
mongoose.Promise = global.Promise;

/* mongoose.connect(databaseConfig.url, { useMongoClient: true });
mongoose.connection.on('error', error => console.log(error) );
mongoose.Promise = global.Promise; */
app.listen(process.env.PORT || 3000);
console.log("App listening on port 3000");

app.use(bodyParser.urlencoded({ extended: false })); // Parses urlencoded bodies
app.use(bodyParser.json()); // Send JSON responses
app.use(logger('dev')); // Log requests to API using morgan
app.use(cors());



router(app);