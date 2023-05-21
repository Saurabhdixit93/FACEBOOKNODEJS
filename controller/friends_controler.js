const User  = require('../models/user');
const Friendship = require('../models/friendship');

module.exports.addNewFriend = async (req , res) =>{

    try{
        let from_id = req.user._id;
        let to_id = req.params.id;

    // find friendship
    let existing_Friendship = await Friendship.findOne({ $or: [{from_user: from_id, to_user: to_id},{from_user: to_id , to_user: from_id}]});
    
        // if already friendship
        if(existing_Friendship){
            // Updating user in database
            let user1 = await User.findByIdAndUpdate(from_id ,{ $pull:{friendships: existing_Friendship._id}})
            user1.save();
            let user2 = await User.findByIdAndUpdate(to_id ,{ $pull:{friendships: existing_Friendship._id}});
            user2.save();
            // Updating Friendships in DATABASE
            let deleted =  await Friendship.deleteOne({ $or:[{from_user: from_id , to_user: to_id},{from_user: to_id , to_user: from_id}]});
            // deleted.save();
            req.flash('success', 'Removed Friend');

        }else{
            // updating in database
            let new_friendships = await Friendship.create({from_user: from_id , to_user: to_id});
            new_friendships.save();
            // updating in user database friendship
            let data = await  User.findByIdAndUpdate(from_id,{ $push: { friendships: new_friendships._id}});
            // updating in user database friendship
            let data2 = User.findByIdAndUpdate(to_id,{ $push: { friendships: new_friendships._id}});
            req.flash('success', 'Added Friend');
        }
        return res.redirect('back');
    }catch(err){
        req.flash('error', `Error in ${err.message}`);
        return res.redirect('back');
    }
};
