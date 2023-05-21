const express = require('express');
const router = express.Router();
const passposrt = require('passport');

const friendsController = require('../controller/friends_controler');

router.get('/profile/:id/add-friend',passposrt.checkAuthentication,friendsController.addNewFriend);



module.exports = router;