const express = require('express');// importing express 
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser'); // importing cookie-parser
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const PORT = process.env.SERVER_PORT || 2000 ;

// database connectionsetup production mode
const ConnectDB = require('./configration/mongoose');

app.use(express.urlencoded({ extended: true }));// url endcoding
app.use(cookieParser());// using cookie
const expresslayouts = require('express-ejs-layouts');// Layouts setups
// const dataBase = require('./configration/mongoose');// DataBase Connection
const session = require('express-session');// express-session
const flash = require('connect-flash');// for flash message require
const customFlashMiddleWare = require('./configration/flash-middleware');// custom middleware for flash
const passport = require('passport');// Passport 
const passportLocal = require('./configration/passport_local');// local passport from configration
const passportgoogle= require('./configration/passport_google_auth');// googl auth configration
const passport_JWT = require('passport-jwt');// Requiring passport-jwt
const passport_JWT_Stretgy = require('./configration/passport_jwt');
const MongoStore = require('connect-mongo');// permanent store cookie in storemongo using connect-mong
const nodemailer = require('nodemailer');
app.use(express.static('assets')); //static files uses
app.use('/uploads',express.static(__dirname + '/uploads')); // uploding img files
app.use(expresslayouts);//layouts change
app.set('layout extractStyles' , true);//extract styles from sub pages
app.set('layout extractScripts' , true);//extract scripts from sub pages

//set view engine
app.set('view engine','ejs');
app.set('views','views');

app.use(session({ // session use and make like middlevare for passport authentication
    name:'My-book_Social-meadia',
    secret:process.env.JWT_PRIVATE_KEY,
    saveUninitialized: false,
    resave: false,
    cookie:{
        maxAge:(1000 * 60 * 100)
    },
    // mongostore connection where to store the session cookies
    store: MongoStore.create(  // Mongo store is used to store session cookie in the DATABASE
        { 
            mongoUrl : process.env.MONGO_URL,
            autoRemove: 'disabled'//I dont want to remove session cookies automatically
        }, function(err){
        if(err){console.log('Error while trying to establish the connection and store session cookie:', err); return;}
        console.log('connect-mongo setup okay'); return;
    })
}));
// use passport and session
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);

app.use((err, req, res, next) => {
    // Mongoose error handling
    if (err.name === 'MongoError' || err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError' || err.name === 'connect ETIMEDOUT' ) {
      // Handle Mongoose errors and render 404 page
      return res.render('404',{
        title: '404 Page Not Found'
      }); //  '404.ejs' file for the error page
    } else if(err.name === 'Error' || err.name === 'getaddrinfo') {
        return res.render('404',{
            title: '404 Page Not Found'
        });
    }else {
      // Pass the error to the next middleware in the stack
      next(err);
    };
});

app.use(flash()); // Using Flash 
app.use(customFlashMiddleWare.setFlash); // using custum flash 
app.use('/',require('./routers')); //Using Express Router For routing all access
app.get('*', (req ,res) => {
    return res.render('404',{
        title: '404 Page Not Found'
    });
});
// for production mode
ConnectDB.CONNECTDB(). then(() => {
    app.listen(PORT, () =>{
        console.log(`Server Successfull Connected With the Port:${PORT}`);
    });
});
