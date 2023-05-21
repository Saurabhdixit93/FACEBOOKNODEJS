const Post = require('../models/posts');
const Comment = require('../models/comments');
const Like =  require('../models/likes');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);


// Creating Post

module.exports.post_Create = async (req , res) =>{
    try{
        // Create a new post object with the content and user properties set
        let post = new Post({
            content: req.body.content,
            user: req.user._id,
            imageUrl: ''
        });
         // Promisify the Post.upload_imageUrl middleware function
         const upload_imageUrl = promisify(Post.upload_imageUrl);
    
         // Call the middleware function to upload the post picture
         await upload_imageUrl(req, res);
     
         // Get the uploaded post picture from the request
         const imageUrl = req.file;
        
         // If a post picture was uploaded, process the file
         if (imageUrl) {
           // Get the file information from the uploaded file
           const { path: tmpFilePath, filename: tmpFileName, mimetype,originalname } = imageUrl;
     
           // If the file is not an image file, delete the temporary file and return an error message
           if (!mimetype.startsWith('image/')) {
             await unlinkAsync(tmpFilePath);
             req.flash('error', 'Invalid file type. Only image files are allowed.');
             return res.redirect('back');
           }
           // Rename the uploaded file to a unique filename to prevent filename collisions
           const fileName = `${Date.now()}_${originalname}`;
           const upload_imageUrl = path.join(Post.PostFile_Path, fileName);
           await fs.promises.rename(tmpFilePath, path.join(__dirname, '..', upload_imageUrl));
     
           // Save the path to the post picture in the post's imageUrl field
           post.imageUrl = upload_imageUrl;
         }
        // Save the post  details in the database
        post.content = req.body.content,
        post.user = req.user._id,
        await post.save();
        // Send a success message and redirect the user to the previous page
        const successMessage = 'Posted Successfully.';
        req.flash('success', successMessage);
        return res.redirect('back');
    }
    catch(err){
        req.flash('error', `Error in ${err.message}`);
        return res.redirect('back');
    }
}


// Deleting Posts Along With The Comments

module.exports.destroy_post_comment = async function(req , res){

    const postId = req.params.id;
    try{
        const deletePosts = await Post.findByIdAndDelete(postId);
        if(!deletePosts){
            req.flash('error', `Error in Deleting Comment`);
            return res.redirect('back');
        }
        // Deleting All comments with all likesin posts
        await Like.deleteMany({likable: postId, onModel: 'post'});
        await Like.deleteMany({_id: {$in: postId.comments}});
        await Comment.deleteMany({posts: postId});
        req.flash('success' , 'Post Deleted Successfully');
        return res.redirect('back');
    }catch(err){
        req.flash('error', `Error in ${err.message}`);
        return res.redirect('back');
    }
}