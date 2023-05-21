const mongoose = require('mongoose');
// require multer and path
const multer = require('multer');
const path = require('path');
const PROFILE_PATH = path.join('/uploads/users_files/profile_pictures');
//created schema
const userSchema = new mongoose.Schema({
    
    email:{
        type: String,
        required :true,
        unique : true
    },
    password :{
        type : String,
        required :true
    },
    name :{
        type :String,
        required :true
    },
    profile_picture:{
        type: String
    },
    friendships: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Friendship'
        }
    ],
    isVerified: {
        type: Boolean,
        default: false,
      },
    verificationToken: String,
    verificationExpires: Date,
},
    {
    timestamps : true
});

// Profile uploads

let storage = multer.diskStorage({
    destination: function(request , file , call_back){
        call_back(null, path.join(__dirname,'..',PROFILE_PATH));
    },
    filename: function(request ,file , call_back ){
        call_back(null, file.fieldname +'-'+Date.now());
    }

});

// statics methods
userSchema.statics.upload_Profile_Picture = multer({storage: storage}).single('profile_picture');
userSchema.statics.Profile_Path = PROFILE_PATH;





//setup
const User = mongoose.model('User',userSchema);
// Exports
module.exports = User;