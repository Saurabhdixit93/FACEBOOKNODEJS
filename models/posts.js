const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const postFilePath = path.join('/uploads/post_files/user_post');

// Schema FOr Posts

    const postSchema = new mongoose.Schema({
        content:{

            type: String,
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        // Include The Arrays of ids of all comments in this post Schema
        comments:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Comments'
            }
        ],
        likes : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'Likes'
            }
        ],
        imageUrl: {
            type: String
            // required: true
        }
    },
    {
        timestamps: true
    });



//     // post file uploads

let storage = multer.diskStorage({
    destination: function(request , file , call_back){
        call_back(null, path.join(__dirname,'..',postFilePath));
    },
    filename: function(request ,file , call_back ){
        call_back(null, file.fieldname +'-'+Date.now());
    }

});

// // statics methods
postSchema.statics.upload_imageUrl = multer({storage: storage}).single('imageUrl');
postSchema.statics.PostFile_Path = postFilePath;

// Setup To use
const Post_Schema = mongoose.model('Posts' , postSchema);
// Exports to All
module.exports = Post_Schema;



