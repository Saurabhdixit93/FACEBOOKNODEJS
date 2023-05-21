const Post = require('../models/posts');
const Comments = require('../models/comments');
const Likes = require('../models/likes');


module.exports.toggleLike = async (req,res) => {

    try {

        let likable; //will store the likable item later
        let deleted = false ; // will indicate if a liek has been delted or created

        let likableId = req.query.id ;
        let type = req.query.type; //type of likable
        if(type == 'post'){
            req.flash('success', 'Post Like Clicked');
            likable = await Post.findById(likableId).populate('likes');
        }else{
            req.flash('success', 'Comment Like Clicked');
            likable = await Comments.findById(likableId).populate('likes');
        }
        //now likable contains our parent element 
        //now we gotta find the like in our Likes
        let existingLike = await Likes.findOne({
            user : req.user._id ,
            likable : req.query.id ,
            onModel : type
        }).lean();
        
        if(existingLike){
            likable.likes.pull(existingLike._id);//pulled the like out of the array and deleted it
            likable.save();
        
            await Likes.deleteOne({_id: existingLike._id});
            deleted = true;
        
        }else{
            newLike = await Likes.create({
                user : req.user._id ,
                likable : req.query.id ,
                onModel : req.query.type
            });
            likable.likes.push(newLike._id);
            likable.save();
        }
        return res.redirect('back')
    } catch (err) {
        req.flash('error', `Error in ${err.message}`);
        return res.redirect('back');
    }
};
