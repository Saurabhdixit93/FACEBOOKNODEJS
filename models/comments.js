const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    content:{
        type: String,
        required: false
    },
    // To belong user
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Belongs to Post
    posts:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Posts'
    },
    likes : [
        {
            type : mongoose.Schema.Types.ObjectId ,
            ref : 'Likes'
        }
    ]
},{
    timestamps: true
});

const Comment = mongoose.model('Comments' ,CommentSchema);
module.exports = Comment;