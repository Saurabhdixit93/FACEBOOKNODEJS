// importing models
const User = require('../models/user');
const Post =  require('../models/posts');
const Friendship = require('../models/friendship');
const bcrptJs = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
const ejs = require('ejs');
const crypto = require('crypto');
const SuccessfullMessage = fs.readFileSync('./EmailHandelor/SuccessfullMessage.ejs','utf-8');
const emailLink = fs.readFileSync('./EmailHandelor/VerificationEmailLink.ejs','utf-8');
const { transporter } = require('../configration/nodemailer');


const sendVerificationEmail = async (user, req) => {
    try 
    {        
        const token = crypto.randomBytes(40).toString('hex');
        const expirationTime =  Date.now() + 10 * 60 * 1000; // 10 min
        user.verificationToken = token;
        user.verificationExpires = expirationTime;

        await user.save();
        const verificationLink = `${req.protocol}://${req.get('host')}/user/verify-email/${token}`;
        const renderedTemplate = ejs.render(emailLink,{user , verificationLink ,expirationTime });
        const mailOptions = {
            from: process.env.FROM_SEND_EMAIL,
            to: user.email,
            subject: 'Verify your email address',
            html :renderedTemplate,
        };
        req.flash('success' ,'A Verification link Send to User`s Email');
        await transporter.sendMail(mailOptions);
    } catch (err) {
        req.flash('error' ,`Error In Sending Mail : ${err.message}`);
        return;
    }
};


// Main Profile showing own post in profile
module.exports.profile = async (req,res) => {
    try{
        let posts = await Post.find({})
        .sort('-createdAt')
        .populate('user')
        .populate({
            path: 'comments',
            populate: {
                path: 'user'
            }
        }).populate({
            path: 'comments',
            populate: {
                path : 'likes'
            }
        }).populate('likes');

        //   finding the frinedships of logged user
        let users = await User.findById(req.params.id);

        // // friendship shown
        let is_friend = false;
        let friendship = await Friendship.findOne({
            $or: [{from_user: req.user._id , to_user: req.params.id},
            {from_user:req.params.id , to_user:req.user._id }]
        });

        if(friendship){
            is_friend = true;
        }
        return res.render('user_profile',{
            title : 'User Profile | My Book',
            profile_user : users,
            is_friends: is_friend,
            posts:posts,
            message:{type:null,text:null}
        });

    }catch(err){
        req.flash('error' ,`Error In : ${err.message}` );
        return res.redirect('back');
    }
}
module.exports.profile_edit = async (req,res) => {
    try{

        let user = await User.findById(req.params.id);

        // // friendship shown
        let is_friend = false;
        let friendship = await Friendship.findOne({
            $or: [{from_user: req.user._id , to_user: req.params.id},
            {from_user:req.params.id , to_user:req.user._id }]
        });

        if(friendship){
            is_friend = true;
        }
        return res.render('update_profile',{
            title : 'Update User Profile | My Book',
            profile_user : user,
            is_friends: is_friend
        });

    }catch(err){
        req.flash('error' ,`Error In : ${err.message}` );
        return res.redirect('back');
    }
}
// For Updating User Details
module.exports.profile_update = async (req , res) =>{
    try {
        // Check if the current user is authorized to update the profile
        if (req.user.id !== req.params.id) {
          req.flash('error', 'Unauthorized User');
          return res.redirect('back');
        }
    
        // Update the user's details in the database
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body);
    
        // Promisify the User.upload_Profile_Picture middleware function
        const uploadProfilePicture = promisify(User.upload_Profile_Picture);
    
        // Call the middleware function to upload the profile picture
        await uploadProfilePicture(req, res);
    
        // Get the uploaded profile picture file and user details from the request
        const profilePicture = req.file;
        const { name, email, password } = req.body;
    
        // If a profile picture was uploaded, process the file
        if (profilePicture) {
          // Get the file information from the uploaded file
          const { path: tmpFilePath, filename: tmpFileName, mimetype ,originalname } = profilePicture;
    
          // If the file is not an image file, delete the temporary file and return an error message
          if (!mimetype.startsWith('image/')) {
            await unlinkAsync(tmpFilePath);
            req.flash('error', 'Invalid file type. Only image files are allowed.');
            return res.redirect('back');
          }
    
          // If the user already has a profile picture, delete the old file
          if (updatedUser.profile_picture && fs.existsSync(path.join(__dirname, '..', updatedUser.profile_picture))) {
             fs.unlinkSync(path.join(__dirname, '..', updatedUser.profile_picture));
          }
    
          // Rename the uploaded file to a unique filename to prevent filename collisions
          const fileName = `${Date.now()}_${originalname}`;
          const profilePicturePath = path.join(User.Profile_Path, fileName);
          await fs.promises.rename(tmpFilePath, path.join(__dirname, '..', profilePicturePath));
    
          // Save the path to the profile picture in the user's profile_picture field
          updatedUser.profile_picture = profilePicturePath;
        }
    
        // Update the user's name and email fields
        const hashedPassword = await bcrptJs.hash(password,15);
        updatedUser.name = name;
        updatedUser.email = email;
        updatedUser.password = hashedPassword;
        updatedUser.isVerified = true;
        updatedUser.verificationExpires = undefined;
        updatedUser.verificationToken = undefined;
    
        // Save the updated user details in the database
        await updatedUser.save();
    
        // Send a success message and redirect the user to the previous page
        const successMessage = 'User details updated successfully.';
        req.flash('success', successMessage);
        return res.redirect('back');
    } catch (error) {
        req.flash('error' ,`Error In : ${error.message}` );
        return res.redirect('back');
    }
    
};

// for signup controll

module.exports.sign_up =  (req , res) => {
    if(req.isAuthenticated()){
        return res.redirect('/user/profile');
    }
    return res.render('user_signup',{
        title : 'Create New Account | My Book',
        message: { type: null, text: null },
    });
}
// For sign in controll 

module.exports.sign_in = (req , res) => {
    if(req.isAuthenticated()){
       return res.redirect('/user/profile');
    }
    return res.render('user_signin',{
        title: 'Sign in | My Book',
        message: { type: null, text: null }
    });
  
}

// get the data from sign Up
module.exports.create = async (req , res) => {
    try{
        const {name , password , confirmPassword ,email }  = req.body;
        if(password !== confirmPassword){
            req.flash('error' ,'Password And Confirm Password Should Be Match!');
            return res.redirect('back');
        }
        const emailRegex = /^([a-zA-z0-9._-]+)@(gmail|yahoo|hotmail|zohomail|hcl|live|outlook)\.(com)$/;
        if(emailRegex.test(email)){
            const lowerCaseEmail = email.toLowerCase();
            const existingUser = await User.findOne({ email: lowerCaseEmail });
            if (existingUser) {
                req.flash('error' ,'User Already Exists With This Email')
                return res.redirect('/user/sign-up');
            }
            else {
                const hashedPassword = await bcrptJs.hash(password,15);
                const newUser = new User({
                    name,
                    email: lowerCaseEmail,
                    password: hashedPassword,
                });
                const savedUser = await newUser.save();
                await sendVerificationEmail(savedUser, req);
                req.flash('success' ,'Account Created Successfully');
                return res.redirect('/user/sign-in');
            }
        }else{
            req.flash('error' ,'Email Not Supported From Your Domain');
            return res.redirect('/user/sign-up');
        }
    } catch (err) {
        req.flash('error', `Error in ${err.message}`);
        return res.redirect('/user/sign-up');
    }
};


// verify email
module.exports.verifyEmail = async (req , res) => {
    try 
    {
        const user = await User.findOne({
            verificationToken: req.params.token,
            verificationExpires: { $gt: Date.now() },
        });

        if (!user) {
            req.flash('error' ,'Invalid Or Expired Link please login or register again');
            return res.redirect('/user/sign-up');
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationExpires = undefined;
        await user.save();
        req.flash('success' ,'Email Verified Successfully Please login');
        return res.redirect('/user/sign-in');

    } catch (err) {
        req.flash('error' ,`Error In Email Verification: ${err.message}`);
        return console.error(err);
    }
};


// create the session for the user
module.exports.create_session = (req,res) => {
    // Using passposrt Js library use
    req.flash('success', 'Log In Successfully');
    return res.redirect('/');
}

// For SignOut 
module.exports.destroySession = (req , res) => {
    req.logout(function(err) {
        if (err) {
            res.status(400).json({
                message:'Internall Server Error !!'
            })
            return;
        }
        req.flash('success' , 'Logged Out Successfully');
        return res.redirect('/');
    });
}
