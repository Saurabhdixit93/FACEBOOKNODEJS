const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bcrptJs = require('bcryptjs');
const fs = require('fs');
const { transporter } = require('./nodemailer');
const ejs = require('ejs');
const SuccessfullMessage = fs.readFileSync('./EmailHandelor/SuccessfullMessage.ejs','utf-8');
passport.use(new LocalStrategy(
    {
        usernameField:'email',
        passReqToCallback:true
    },
    async ( request , email , password , done) => {

        const emailLower = email.toLocaleLowerCase();
        try{
            const userExists = await User.findOne({ email:emailLower });
            if(!userExists){
                request.flash('error' , 'No User Found With This Email !');
                return done(null, false);
            };
            
            const PasswordMatch = await bcrptJs.compare(password ,userExists.password);

            if(!PasswordMatch){
                request.flash('error' , 'Wrong Password Please Enter Valid Password !');
                return done(null ,false);
            };

            if (!userExists.isVerified) {

                const EXPIRATION_TIME = 10 * 60 * 1000; //10 mins  // 2 * 60 * 60 * 1000 // 2 hours
                const now = Date.now();
                const registrationTime = userExists.createdAt.getTime();

                if( now - registrationTime > EXPIRATION_TIME) {
                     deleteUnverifiedUser(userExists._id);
                    request.flash('error' ,'Email Verification time Expired ,Please Register Again');
                    return done(null , false);
                }else{
                    request.flash('error' ,'Please verify your email address');
                    return done(null, false);
                };
            };
            const renderedTemplate = ejs.render(SuccessfullMessage,{userExists});

            const mailOptions = {
                from: process.env.FROM_SEND_EMAIL,
                to:  userExists.email,
                subject: `Login Successfull Notification`,
                html: renderedTemplate,
            };

            transporter.sendMail(mailOptions, (err) => {
                if (err) {
                    request.flash('error', `There was an error sending Login Email.`);
                    return;
                } else {
                    request.flash('success' ,'Login Successfull.');
                    return;
                }
            });
            request.flash('success' , "Login Successfully");
            return done(null ,userExists);
        }catch(error){
            console.log('error in login' ,error);
            request.flash('error' ,'Internal Server Error');
            return;
        }
    }
));

passport.serializeUser((user , done) =>{
    done(null , user.id);
});

passport.deserializeUser((id , done) =>{
    User.findById(id).then(user => {
        return done(null ,user);
    }).catch(err => {
        console.log('Error', err);
        return;
    });
});


passport.checkAuthentication = (request , response , next) =>{
    if(request.isAuthenticated()){
        return next();
    }
    request.flash('error' , 'Please Signin FIrst!');
    return response.redirect('/user/sign-in');
}


passport.setAuthenticatedUser =  (request , response , next) =>{
    if(request.isAuthenticated()){
        response.locals.user = request.user;
    }
    next();
};

const deleteUnverifiedUser = async (userId) => {
    try{
        await User.deleteOne({ _id: userId});

    }catch(error){
        console.error('Error In Unverified' ,error);
    }
};


                                

module.exports = passport;
