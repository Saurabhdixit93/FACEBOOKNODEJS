const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  friendship_requests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

module.exports = UserProfile;