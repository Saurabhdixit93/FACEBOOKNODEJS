const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/user');
const PasswordReset = require('../models/PasswordReset');
const ejs = require('ejs');
const fs = require('fs');
const { transporter } = require('../configration/nodemailer');
const forgotPasswordEmail = fs.readFileSync('./EmailHandelor/PasswordResetLink.ejs','utf-8');
const bcrptJs = require('bcryptjs');

//form render
module.exports.showForgotPassword = async (req, res) => {
    return res.render('forgotPassword',{
      title: 'Forgot Password Page |',
      message: {typs:null ,text:null}
    });
  };


// forgot password controller
module.exports.forgotPassword = async (req, res) => {

  try
  {
      const { email } = req.body;
      const emailRegex = /^([a-zA-z0-9._-]+)@(gmail|yahoo|hotmail|zohomail|hcl|live|outlook)\.(com)$/;
      if(emailRegex.test(email)){
          const lowerCaseEmail = email.toLowerCase();
          const accountFound = await User.findOne({email:lowerCaseEmail});

          if(!accountFound){
              req.flash('error' ,'User Email Is not Found to reset Password');
              return res.redirect('back');
          }
          const token = crypto.randomBytes(70).toString('hex'); 
          const secret = 'helloSecrete';
          const hashedToken = crypto.createHmac('sha256' , secret).update(token).digest('hex');

          const password_Reset = await new PasswordReset({
              userId: accountFound,
              token: hashedToken,
              isValid: true
          });

          await password_Reset.save();

          // email template setup 
          const resetLink = `${req.protocol}://${req.get('host')}/auth/reset-password/${hashedToken}`;
          const renderedTemplate = ejs.render(forgotPasswordEmail,{ resetLink , accountFound });
          const mailOptions = {
              from: process.env.FROM_SEND_EMAIL,
              to: accountFound.email,
              subject: `Password Reset Request`,
              html: renderedTemplate,
          };

          transporter.sendMail(mailOptions, (err) => {
              if (err) {
                req.flash('error', `There was an error sending the password reset email. Please try again later.`);
                return res.redirect('back');
              } else {
                req.flash('success' ,'A password reset link has been sent to your email address.');
                return res.redirect('back');
              }
          });
      }else{
          req.flash('error' ,'Email Not Register With Us');
          return res.redirect('/user/sign-up');
      }
  }catch(error){
    req.flash('error' ,`Error In: ${error.message}`);
    return res.redirect('back');
  }
};

//password link handelor
module.exports.handleResetPasswordLink = async (req, res) => {
  try
    {
        const { token } = req.params;
        const password_Reset = await PasswordReset.findOne({ token });
        if(password_Reset){
          req.flash('success' ,'link Verified , Update Your Password Now');
          return  res.render('resetPassword', {
            title:'Forgot Password Final Page',
            token:password_Reset.token,
            message: { type: 'success', text: 'link Verified , Update Your Password Now.' }
          });
        }
        else{
            req.flash('error','Invalid password reset link. Please request a new link.');
            return res.redirect('/user/sign-in');
        };
    }catch(error){
        req.flash('error' ,`Error In: ${error.message}`);
        return res.redirect('back');
    }
};

// reset password updates
module.exports.resetPassword = async (req, res) => {
  try{
    // console.log(req.query);
    const passwordReset = await PasswordReset.findOne({token : req.query.youruniqtoken});
    
    // If the token doesn't exist, display an error message
    if (!passwordReset) {
      req.flash('error' ,'Password reset Link Expired. Please request a new link.');
      return res.render('resetPassword', {
        title:'Forgot Password Final Page ', 
        token: passwordReset.youruniqtoken,
        message: {type: 'danger' ,text: 'Password reset Link Expired. Please request a new link.'}
      });
    }
    // If the token has expired, display an error message
    if(passwordReset.isValid){
  
      passwordReset.isValid = false; 
  
      if(req.body.password == req.body.confirmPassword){
        const user = await User.findById(passwordReset.userId);
        if(user){
          const hashedPassword = await bcrptJs.hash(req.body.password,15);
          user.password = hashedPassword ;
          user.confirmPassword = req.body.confirmPassword;
          passwordReset.save();
          user.save();
          // Redirect the user to the login page with a success message
          return res.render('user_signin', {
            title:'Sign-in Page ',
            message: { type: 'success', text: 'Your password has been reset. Please log in with your new password.' }
          });
        }else{
          req.flash('error' , 'Password did not matched');
          return res.redirect('back');
        }
      }else{
        req.flash('error' ,'Password and Confirm Passwrod Not Matched.');
        return res.render('resetPassword', {
          title:'Forgot Password Final Page ', 
          token: passwordReset.token,
          message: { type: 'danger', text: 'Password and Confirm Passwrod Not Matched.' }
        });
      }
    }else{
      return res.render('forgotPassword', { 
        title:'Forgot Password Page ',
        message: { type: 'danger', text: 'Invalid password reset Token. Please request a new Token.' }
      });
    }
  }catch(err){
    req.flash('error' ,'Error:'+ err.message);
    return res.render('forgotPassword', { 
      title:'Forgot Password Page | My Book',
      message: { type: 'danger', text: 'Internal Server Error !! .. Please Try Again.' }
    });
  }
};
