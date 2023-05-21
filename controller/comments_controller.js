const Comment = require('../models/comments');
const Post = require('../models/posts');
const Like = require('../models/likes');


// Create Comments
module.exports.comment_Create = async (req , res) =>{

  try{
    let post = await Post.findById(req.body.post_id);

    if(post){
      let comment = await Comment.create({
        content: req.body.content,
        posts: req.body.post_id,
        user: req.user._id
      });
      post.comments.push(comment);
      post.save();

      comment = await comment.populate('user' ,'name email');
      req.flash('success' , 'SuccessFully Commented');
      return res.redirect('/');
    }
  }catch(err){
    req.flash('error', `Error in ${err.message}`);
    return res.redirect('back');
  }
}

// deleting comments
module.exports.destroy_comment = async ( req , res) =>{
  try{
    let comment = await Comment.findById(req.params.id);
    if(comment.user == req.user.id){
      // store post id
      let postId = comment.posts;
      // Delete comment
      await Comment.deleteOne({_id: comment._id});
      // Update the post 
      let post = await Post.findByIdAndUpdate( postId ,{ $pull: {comments: req.params.id}});

      // Delete all likes with reactions for the comment
      await Like.deleteMany({likable: comment._id , onModel: 'comment', reaction: {$exists: true}});
      req.flash('success' , 'Deleted Comment Successfully:');
      return res.redirect('back');
    }else{
      req.flash('error' , 'You can delete only own commnts:');
      return res.redirect('back');
    }
  }catch(err){
    req.flash('error', `Error in ${err.message}`);
    return res.redirect('back');
  }
};
