const mongoose = require('mongoose');

const Friendship_Schema = new mongoose.Schema({
    // who sent request
    from_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Who Accept the Request
    to_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    }
},
{
   timestamps: true
});

const friendship = mongoose.model('Friendship' , Friendship_Schema);
module.exports = friendship;