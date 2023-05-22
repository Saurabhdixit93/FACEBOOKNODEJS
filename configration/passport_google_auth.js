const passport =  require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const crypto = require('crypto');
const User = require('../models/user');

passport.use(new GoogleStrategy({
    
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:process.env.GOOGLE_CALLBACK_URL
    }, 
   async (accessToken , refreshToken , profile , done) => {
        try{
            let user = await User.findOne({email: profile.emails[0].value});
            if(user){
                return done(null , user);
            }else{
            let user = await  User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    password: crypto.randomBytes(20).toString('hex'),
                    isVerified:true,
                    verificationExpires:undefined,
                    verificationToken: undefined,

                }); 
                return done(null , user);
            }
        }catch(err){
            return done(err);
        }
    }
));

module.exports = passport;
