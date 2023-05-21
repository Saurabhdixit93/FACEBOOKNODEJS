const Post =  require('../models/posts');
const User =  require('../models/user');
const Friendship = require('../models/friendship');

module.exports.home = async (req,res) =>{
    try{
        // populate the user of each post with each posts like and each comment like
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

        // Find User All
          let user = await User.find({});
        //   finding the frinedships of logged user

        let friends = new Array();
        if(req.user){
            let all_Friendships = await Friendship.find({ $or: [{from_user: req.user._id} ,{to_user: req.user._id}]})
            .populate('from_user')
            .populate('to_user');
            
            // Stroring in array to show faster in front end
            for(let friend of all_Friendships){
                if(friend.from_user._id.toString() == req.user._id.toString()){
                    friends.push({
                        friend_name: friend.to_user.name,
                        friend_id: friend.to_user._id,
                        friend_profile: friend.to_user.profile_user
                    });
                }
                else if(friend.to_user._id.toString() == req.user._id.toString()){
                    friends.push({
                        friend_name: friend.from_user.name,
                        friend_id: friend.from_user._id,
                        friend_profile: friend.from_user.profile_user
                    });
                }
            }
        }
        //   Redicrect home
        return res.render('home' ,{
            title : "My Book | Home-Page",
            posts: posts,
            all_users: user,
            friends: friends
        });
    }
    catch(err) {
        req.flash('error', `Error in ${err.message}`);
        return res.redirect('back');
    }
}

// Alluser populate and show
module.exports.all_UsersandFriends =  async (req ,res) =>{
    try{
        
        // Find User All
          let user = await User.find({});
        //   finding the frinedships of logged user

        let friends = new Array();
        if(req.user){
            let all_Friendships = await Friendship.find({ $or: [{from_user: req.user._id} ,{to_user: req.user._id}]})
            .populate('from_user')
            .populate('to_user');

            // Stroring in array to show faster in front end
            for(let friend of all_Friendships){
                if(friend.from_user._id.toString() == req.user._id.toString()){
                    friends.push({
                        friend_name: friend.to_user.name,
                        friend_id: friend.to_user._id,
                        friend_profile: friend.to_user.profile_user
                    });
                }
                else if(friend.to_user._id.toString() == req.user._id.toString()){
                    friends.push({
                        friend_name: friend.from_user.name,
                        friend_id: friend.from_user._id,
                        friend_profile: friend.from_user.profile_user
                    });
                }
            }
        }
        //   Redicrect home
        return res.render('allUsers' ,{
            title : "My Book | Users And Friends",
            all_users: user,
            friends: friends
        });
    }
    catch(err) {
        req.flash('error', `Error in ${err.message}`);
        return res.redirect('back');
    }
};